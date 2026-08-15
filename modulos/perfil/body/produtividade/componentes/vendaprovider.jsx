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

    /* ===============================
       VENDAS SENDO PROCESSADAS

       Esta estrutura será usada pelo
       novo sistema de venda rápida.
    =============================== */

    const [vendasProcessando, setVendasProcessando] = useState([]);

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
       ATUALIZAR PREÇO DO ITEM
    =============================== */

    function atualizarPrecoItem(produtoAtualizado) {

        setItens(prev => {

            const novaLista = prev.map(item => {

                if (item.id === produtoAtualizado.id) {

                    return {
                        ...item,
                        preco: Number(
                            produtoAtualizado.preco
                        ),
                        subtotal:
                            Number(produtoAtualizado.preco) *
                            item.quantidade
                    };
                }

                return item;
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

    function removerItem(id) {

        setItens(prev => {

            const novaLista = prev.filter(
                item => item.id !== id
            );

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

            /*
                Fazemos uma NOVA cópia dos produtos.

                Depois que limparmos o carrinho,
                esta venda continuará tendo seus
                próprios produtos.
            */

            const itensSnapshot = itens.map(item => ({
                ...item
            }));

            return {
                idLocal: gerarIdVendaLocal(),

                vendaId: null,

                pagamento,

                total: Number(total),

                itens: itensSnapshot,

                status: "aguardando",

                erro: null,

                criadoEm: new Date().toISOString()
            };
        },
        [itens, total]
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

                /* =====================
                   VENDA RÁPIDA
                ===================== */

                vendasProcessando,

                criarSnapshotVenda,

                adicionarVendaProcessando,
                atualizarVendaProcessando,
                removerVendaProcessando,
                buscarVendaProcessando
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