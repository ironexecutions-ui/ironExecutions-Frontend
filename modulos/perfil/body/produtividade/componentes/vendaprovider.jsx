import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from "react";

const VendaContext = createContext();

export function VendaProvider({ children }) {

    /* ===============================
       VENDA ATUAL
    =============================== */

    const [produtoAtual, setProdutoAtual] = useState(null);
    const [itens, setItens] = useState([]);
    const [total, setTotal] = useState(0);

    const [limparBusca, setLimparBusca] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [emitirNota, setEmitirNota] = useState(false);
    /* ===============================
       VENDAS SENDO PROCESSADAS

       Esta estrutura será usada pelo
       novo sistema de venda rápida.
    =============================== */
    const [pixRapidoAtual, setPixRapidoAtual] = useState(null);
    const [vendasProcessando, setVendasProcessando] = useState([]);
    /* ===============================
       ABRIR PIX RÁPIDO
    =============================== */

    const abrirPixRapido = useCallback(
        (dadosPix) => {

            if (!dadosPix) {
                return;
            }

            setPixRapidoAtual({
                ...dadosPix,
                abertoEm: new Date().toISOString()
            });

        },
        []
    );
    /* ===============================
   FECHAR PIX RÁPIDO
=============================== */

    const fecharPixRapido = useCallback(
        () => {
            setPixRapidoAtual(null);
        },
        []
    );
    /* ===============================
       CALCULAR TOTAL
    =============================== */

    function calcularTotal(lista) {
        const soma = lista.reduce(
            (acc, item) => acc + Number(item.subtotal || 0),
            0
        );

        setTotal(soma);
    }

    /* ===============================
       LIMPAR VENDA ATUAL
    =============================== */

    function limparVenda() {
        setProdutoAtual(null);
        setItens([]);
        setTotal(0);

        localStorage.removeItem("itensVenda");
    }

    /* ===============================
       ADICIONAR ITEM
    =============================== */

    function adicionarItem(produto) {

        setItens(prev => {

            const existente = prev.find(
                p => p.id === produto.id
            );

            if (existente) {

                const itemAtualizado = {
                    ...existente,
                    quantidade: existente.quantidade + 1,
                    subtotal:
                        (existente.quantidade + 1) *
                        existente.preco
                };

                /*
                    Remove o item antigo e coloca
                    o atualizado no final.
                */

                const novaLista = [
                    ...prev.filter(
                        p => p.id !== produto.id
                    ),
                    itemAtualizado
                ];

                calcularTotal(novaLista);

                return novaLista;
            }

            const novoItem = {
                id: produto.id,
                nome: produto.nome,
                preco: Number(produto.preco),
                quantidade: 1,
                subtotal: Number(produto.preco),
                unidade:
                    produto.unidade ||
                    produto.tempo_servico ||
                    ""
            };

            const novaLista = [
                ...prev,
                novoItem
            ];

            calcularTotal(novaLista);

            return novaLista;
        });
    }
    /* ===============================
       ADICIONAR PRODUTO POR PESO
    =============================== */

    function adicionarItemPeso(produto, gramas) {

        const pesoBase = Number(produto.peso);
        const precoBase = Number(produto.preco);
        const pesoInformado = Number(gramas);

        if (
            !produto ||
            !produto.id ||
            pesoBase <= 0 ||
            precoBase <= 0 ||
            pesoInformado <= 0
        ) {
            return;
        }

        const valorCalculado =
            (pesoInformado / pesoBase) * precoBase;

        /*
            Produto pesado precisa de uma chave própria.
    
            Duas bananas pesadas separadamente não podem
            virar quantidade 2 do mesmo item.
        */

        const itemKey =
            `peso_${produto.id}_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`;

        const novoItem = {

            id: produto.id,

            itemKey,

            nome: produto.nome,

            /*
                preco é o valor efetivamente cobrado
                por ESTA pesagem.
            */

            preco: Number(valorCalculado),

            quantidade: 1,

            subtotal: Number(valorCalculado),

            unidade: "",

            /* ===============================
               INFORMAÇÕES DE PESO
            =============================== */

            ehProdutoPeso: true,

            gramas: pesoInformado,

            pesoBase,

            precoBase
        };

        setItens(prev => {

            const novaLista = [
                ...prev,
                novoItem
            ];

            calcularTotal(novaLista);

            return novaLista;
        });

        /*
            Produto atual recebe os dados da pesagem,
            mas mantém o preço original cadastrado.
        */

        setProdutoAtual({
            ...produto,

            ehProdutoPeso: true,

            gramasSelecionadas: pesoInformado,

            valorCalculadoPeso: Number(valorCalculado)
        });
    }
    /* ===============================
       ATUALIZAR PREÇO DO ITEM
    =============================== */

    function atualizarPrecoItem(produtoAtualizado) {

        setItens(prev => {

            const novaLista = prev.map(item => {

                if (item.id !== produtoAtualizado.id) {
                    return item;
                }

                const novoPrecoBase =
                    Number(produtoAtualizado.preco || 0);

                /* =====================================
                   PRODUTO VENDIDO POR PESO
                ===================================== */

                if (item.ehProdutoPeso) {

                    const pesoBase =
                        Number(
                            item.pesoBase ||
                            produtoAtualizado.peso ||
                            0
                        );

                    const gramas =
                        Number(item.gramas || 0);

                    const novoSubtotal =
                        pesoBase > 0
                            ? (gramas / pesoBase) * novoPrecoBase
                            : 0;

                    return {
                        ...item,

                        /*
                            Para produto por peso:
    
                            preco = valor cobrado nessa pesagem
                            precoBase = preço cadastrado por peso-base
                        */

                        preco: novoSubtotal,

                        precoBase: novoPrecoBase,

                        pesoBase,

                        subtotal: novoSubtotal
                    };
                }

                /* =====================================
                   PRODUTO NORMAL
                ===================================== */

                return {
                    ...item,

                    preco: novoPrecoBase,

                    subtotal:
                        novoPrecoBase *
                        Number(item.quantidade || 1)
                };
            });

            calcularTotal(novaLista);

            return novaLista;
        });
    }

    /* ===============================
       AUMENTAR QUANTIDADE
    =============================== */

    function aumentarQuantidade(id) {

        setItens(prev => {

            const novaLista = prev.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantidade:
                            item.quantidade + 1,
                        subtotal:
                            (item.quantidade + 1) *
                            item.preco
                    }
                    : item
            );

            calcularTotal(novaLista);

            return novaLista;
        });
    }

    /* ===============================
       DIMINUIR QUANTIDADE
    =============================== */

    function diminuirQuantidade(id) {

        setItens(prev => {

            const item = prev.find(
                i => i.id === id
            );

            if (!item) {
                return prev;
            }

            if (item.quantidade === 1) {

                const novaLista = prev.filter(
                    i => i.id !== id
                );

                calcularTotal(novaLista);

                return novaLista;
            }

            const novaLista = prev.map(i =>
                i.id === id
                    ? {
                        ...i,
                        quantidade:
                            i.quantidade - 1,
                        subtotal:
                            (i.quantidade - 1) *
                            i.preco
                    }
                    : i
            );

            calcularTotal(novaLista);

            return novaLista;
        });
    }

    /* ===============================
       REMOVER ITEM
    =============================== */

    function removerItem(identificador) {

        setItens(prev => {

            const novaLista = prev.filter(item => {

                /*
                    Produto por peso possui itemKey próprio,
                    porque o mesmo produto pode ser pesado
                    várias vezes na mesma venda.
                */

                if (item.ehProdutoPeso) {
                    return item.itemKey !== identificador;
                }

                /*
                    Produto normal continua sendo removido
                    pelo id.
                */

                return item.id !== identificador;
            });

            calcularTotal(novaLista);

            return novaLista;
        });
    }
    /* =====================================================
       NOVO SISTEMA
       VENDAS PROCESSANDO EM SEGUNDO PLANO
    ===================================================== */

    /*
        Cria um ID apenas para controle do frontend.

        Esse NÃO é o venda_id do banco.

        Mais para frente, quando o backend criar a venda,
        também guardaremos o venda_id verdadeiro.
    */

    function gerarIdVendaLocal() {

        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString() +
            "_" +
            Math.random().toString(36).slice(2)
        );
    }

    /* ===============================
       CRIAR SNAPSHOT DA VENDA

       Esta é uma das partes mais
       importantes do novo sistema.
    =============================== */

    const criarSnapshotVenda = useCallback(
        (pagamento) => {

            if (itens.length === 0) {
                return null;
            }

            if (total <= 0) {
                return null;
            }

            const itensSnapshot = itens.map(item => ({
                ...item
            }));

            return {
                idLocal: gerarIdVendaLocal(),

                vendaId: null,

                pagamento,

                total: Number(total),

                itens: itensSnapshot,

                emitirNota: emitirNota === true,

                status: "aguardando",

                erro: null,

                criadoEm: new Date().toISOString()
            };
        },

        [itens, total, emitirNota]
    );
    /* ===============================
       ADICIONAR VENDA À FILA
    =============================== */

    const adicionarVendaProcessando = useCallback(
        (venda) => {

            if (!venda || !venda.idLocal) {
                return;
            }

            setVendasProcessando(prev => [
                ...prev,
                venda
            ]);
        },
        []
    );

    /* ===============================
       ATUALIZAR VENDA DA FILA
    =============================== */

    const atualizarVendaProcessando = useCallback(
        (idLocal, alteracoes) => {

            setVendasProcessando(prev =>
                prev.map(venda => {

                    if (venda.idLocal !== idLocal) {
                        return venda;
                    }

                    return {
                        ...venda,
                        ...alteracoes
                    };
                })
            );
        },
        []
    );

    /* ===============================
       REMOVER VENDA DA FILA
    =============================== */

    const removerVendaProcessando = useCallback(
        (idLocal) => {

            setVendasProcessando(prev =>
                prev.filter(
                    venda =>
                        venda.idLocal !== idLocal
                )
            );
        },
        []
    );

    /* ===============================
       BUSCAR VENDA DA FILA
    =============================== */

    const buscarVendaProcessando = useCallback(
        (idLocal) => {

            return vendasProcessando.find(
                venda =>
                    venda.idLocal === idLocal
            ) || null;
        },
        [vendasProcessando]
    );

    /* ===============================
       SALVAR CARRINHO ATUAL
    =============================== */

    useEffect(() => {

        localStorage.setItem(
            "itensVenda",
            JSON.stringify(itens)
        );

    }, [itens]);

    /* ===============================
       PROVIDER
    =============================== */

    return (
        <VendaContext.Provider
            value={{

                /* =====================
                   VENDA ATUAL
                ===================== */

                produtoAtual,
                setProdutoAtual,

                itens,
                adicionarItemPeso,
                adicionarItem,
                atualizarPrecoItem,
                aumentarQuantidade,
                diminuirQuantidade,
                removerItem,

                total,

                limparVenda,

                limparBusca,
                setLimparBusca,

                modalAberto,
                setModalAberto,
                emitirNota,
                setEmitirNota,
                /* =====================
                   VENDA RÁPIDA
                ===================== */

                vendasProcessando,

                criarSnapshotVenda,

                adicionarVendaProcessando,
                atualizarVendaProcessando,
                removerVendaProcessando,
                buscarVendaProcessando,

                /* =====================
                   PIX RÁPIDO
                ===================== */

                pixRapidoAtual,
                setPixRapidoAtual,
                abrirPixRapido,
                fecharPixRapido
            }}
        >
            {children}
        </VendaContext.Provider>
    );
}

/* ===============================
   HOOK
=============================== */

export function useVenda() {

    const contexto = useContext(VendaContext);

    if (!contexto) {
        throw new Error(
            "useVenda deve ser utilizado dentro de VendaProvider"
        );
    }

    return contexto;
}