import React, { useState, useRef, useEffect } from "react";
import { API_URL } from "../../../../../config";
import { useVenda } from "./vendaprovider";
import "./buscarproduto.css";
import { createPortal } from "react-dom";
import ModalCadastroProduto from "./registro_rapido/modalregistrorapido";

export const buscarInputRef = { current: null };

const CACHE_PRODUTOS_KEY = "dkfnjhsdifds65dsf65sd9fdfgd69fg";
const CACHE_SINCRONIZACAO_KEY = "d6as4dsa16d5as9dsdgfs56146sdf";
export default function BuscarProduto() {
    const {
        setProdutoAtual,
        adicionarItem,
        limparBusca,
        setLimparBusca,
        setModalAberto
    } = useVenda();

    const [abrirCadastro, setAbrirCadastro] = useState(false);
    const [textoCadastro, setTextoCadastro] = useState("");



    const [texto, setTexto] = useState("");
    const [sugestoes, setSugestoes] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const [sincronizando, setSincronizando] = useState(false);
    const [sincronizacaoSucesso, setSincronizacaoSucesso] = useState(false);
    const [ultimaSincronizacao, setUltimaSincronizacao] = useState(null);

    const inputRef = useRef(null);
    const itensRef = useRef([]);
    const timeoutRef = useRef(null);

    const [indiceAtivo, setIndiceAtivo] = useState(-1);
    const [tema, setTema] = useState("escuro");
    const [
        mostrarAreaSincronizacao,
        setMostrarAreaSincronizacao
    ] = useState(null);

    useEffect(() => {

        async function verificarSincronizacao() {

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    setMostrarAreaSincronizacao(false);
                    return;
                }

                const resp =
                    await fetch(
                        `${API_URL}/api/produtos_servicos/sincronizacao/status`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                if (!resp.ok) {

                    console.error(
                        "[STATUS SINCRONIZAÇÃO] Erro HTTP:",
                        resp.status
                    );

                    /*
                        Se não conseguimos verificar,
                        mostramos a sincronização.
                    */
                    setMostrarAreaSincronizacao(true);

                    return;
                }

                const dados =
                    await resp.json();

                console.log(
                    "[STATUS SINCRONIZAÇÃO]",
                    dados
                );

                setMostrarAreaSincronizacao(
                    dados?.mostrar_sincronizacao !== false
                );

            } catch (erro) {

                console.error(
                    "[STATUS SINCRONIZAÇÃO]",
                    erro
                );

                /*
                    Em caso de falha de rede,
                    deixamos disponível para sincronizar.
                */
                setMostrarAreaSincronizacao(true);
            }
        }

        verificarSincronizacao();

    }, []);
    /* ===============================
       CARREGAR DATA DA SINCRONIZAÇÃO
    =============================== */
    useEffect(() => {
        try {
            const cache = JSON.parse(
                localStorage.getItem(CACHE_PRODUTOS_KEY) || "null"
            );

            if (cache?.atualizadoEm) {
                setUltimaSincronizacao(cache.atualizadoEm);
            }
        } catch {
            setUltimaSincronizacao(null);
        }
    }, []);

    /* ===============================
       LIMPAR BUSCA
    =============================== */
    useEffect(() => {

        if (!limparBusca) {
            return;
        }

        /* ===============================
           LIMPAR SOMENTE O BUSCADOR
    
           NÃO apagamos produtoAtual aqui.
    
           Se um produto acabou de chegar
           do cache ou servidor, ele precisa
           continuar aparecendo na tela.
        =============================== */

        setTexto("");
        setSugestoes([]);
        setIndiceAtivo(-1);

        /* Libera imediatamente a flag */
        setLimparBusca(false);

        /* ===============================
           DEVOLVER FOCO
        =============================== */

        requestAnimationFrame(() => {

            if (inputRef.current) {
                inputRef.current.focus();
            }

        });

    }, [
        limparBusca,
        setLimparBusca
    ]);

    /* ===============================
       RESET ÍNDICE
    =============================== */
    useEffect(() => {
        setIndiceAtivo(-1);
        itensRef.current = [];
    }, [sugestoes]);

    /* ===============================
       SCROLL SUGESTÕES
    =============================== */
    useEffect(() => {
        if (indiceAtivo < 0) return;

        const el = itensRef.current[indiceAtivo];

        if (!el) return;

        el.scrollIntoView({
            block: "nearest",
            behavior: "smooth"
        });
    }, [indiceAtivo]);

    /* ===============================
       DEFINIR TEMA
    =============================== */
    useEffect(() => {
        async function definirTema() {
            let modoCliente = null;

            try {
                const token = localStorage.getItem("token");

                if (token) {
                    const resp = await fetch(
                        `${API_URL}/api/clientes/modo`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    if (resp.ok) {
                        const data = await resp.json();
                        modoCliente = data.modo;
                    }
                }
            } catch {
                modoCliente = null;
            }

            if (modoCliente === 1) {
                setTema("escuro");
                return;
            }

            if (modoCliente === 2) {
                setTema("claro");
                return;
            }

            const hora = new Date().getHours();

            setTema(
                hora >= 18 || hora < 6
                    ? "escuro"
                    : "claro"
            );
        }

        definirTema();
    }, []);

    /* ===============================
       NORMALIZAR CÓDIGO
    =============================== */
    function normalizarCodigo(valor) {
        return String(valor || "").trim();
    }

    /* ===============================
       PEGAR CÓDIGO DO PRODUTO

       Coloquei algumas possibilidades
       para não depender de apenas um nome
       de propriedade.
    =============================== */
    function pegarCodigoProduto(produto) {
        return normalizarCodigo(
            produto?.codigo_barras ||
            produto?.codigo_barra ||
            produto?.codigo ||
            produto?.qrcode ||
            produto?.qr_code ||
            ""
        );
    }

    /* ===============================
       LER CACHE
    =============================== */
    function lerCacheProdutos() {
        try {
            const salvo = localStorage.getItem(
                CACHE_PRODUTOS_KEY
            );

            if (!salvo) {
                return {
                    atualizadoEm: null,
                    produtos: {}
                };
            }

            const cache = JSON.parse(salvo);

            return {
                atualizadoEm:
                    cache?.atualizadoEm || null,

                produtos:
                    cache?.produtos || {}
            };

        } catch (erro) {
            console.error(
                "[CACHE PRODUTOS] Erro ao ler:",
                erro
            );

            return {
                atualizadoEm: null,
                produtos: {}
            };
        }
    }

    /* ===============================
       SALVAR CACHE COMPLETO
    =============================== */
    function salvarCacheProdutos(lista) {
        const produtosIndexados = {};

        lista.forEach(produto => {
            const codigo =
                pegarCodigoProduto(produto);

            if (!codigo) {
                return;
            }

            produtosIndexados[codigo] = produto;
        });

        const atualizadoEm =
            new Date().toISOString();

        localStorage.setItem(
            CACHE_PRODUTOS_KEY,
            JSON.stringify({
                atualizadoEm,
                produtos: produtosIndexados
            })
        );

        setUltimaSincronizacao(atualizadoEm);

        return Object.keys(
            produtosIndexados
        ).length;
    }

    /* ===============================
       SALVAR UM PRODUTO NO CACHE

       Usado quando o servidor encontrar
       algo que ainda não estava local.
    =============================== */
    function salvarProdutoNoCache(produto) {
        const codigo =
            pegarCodigoProduto(produto);

        if (!codigo) {
            return;
        }

        const cache = lerCacheProdutos();

        cache.produtos[codigo] = produto;

        localStorage.setItem(
            CACHE_PRODUTOS_KEY,
            JSON.stringify({
                atualizadoEm:
                    cache.atualizadoEm ||
                    new Date().toISOString(),

                produtos:
                    cache.produtos
            })
        );
    }

    /* ===============================
       BUSCAR NO CACHE
    =============================== */
    function buscarProdutoNoCache(valor) {
        const codigo =
            normalizarCodigo(valor);

        if (!codigo) {
            return null;
        }

        const cache = lerCacheProdutos();

        return (
            cache.produtos[codigo] ||
            null
        );
    }
    function buscarCodigosProximos(valor) {

        const codigoDigitado =
            normalizarCodigo(valor);

        if (
            !/^\d+$/.test(codigoDigitado)
        ) {
            return [];
        }

        if (
            codigoDigitado.length > 5
        ) {
            return [];
        }

        const cache =
            lerCacheProdutos();

        const produtos =
            Object.values(
                cache.produtos || {}
            );

        const candidatos =
            produtos
                .filter(produto => {

                    const codigo =
                        pegarCodigoProduto(
                            produto
                        );

                    return (
                        codigo &&
                        /^\d+$/.test(codigo) &&
                        codigo.length <= 5 &&
                        codigo !== codigoDigitado
                    );

                })
                .map(produto => {

                    const codigo =
                        pegarCodigoProduto(
                            produto
                        );

                    return {
                        produto,
                        distancia:
                            Math.abs(
                                Number(codigo) -
                                Number(codigoDigitado)
                            )
                    };

                })
                .sort(
                    (a, b) =>
                        a.distancia -
                        b.distancia
                )
                .slice(0, 3)
                .map(item => item.produto);

        return candidatos;
    }
    /* ===============================
       SINCRONIZAR PRODUTOS
    =============================== */
    async function sincronizarProdutos() {

        if (sincronizando) {
            return;
        }

        /* ===============================
           INICIAR SINCRONIZAÇÃO
        =============================== */

        setSincronizando(true);
        setSincronizacaoSucesso(false);

        try {

            const token =
                localStorage.getItem("token");

            const resp = await fetch(
                `${API_URL}/api/produtos_servicos/sincronizar`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!resp.ok) {

                let mensagem =
                    "Não foi possível sincronizar os produtos";

                try {

                    const erro =
                        await resp.json();

                    mensagem =
                        erro?.detail ||
                        mensagem;

                } catch {
                    // mantém mensagem padrão
                }

                throw new Error(
                    mensagem
                );
            }

            /* ===============================
               RESPOSTA DO BACKEND
            =============================== */

            const dados =
                await resp.json();

            console.log(
                "[SINCRONIZAÇÃO] Resposta backend:",
                dados
            );

            /* ===============================
               PRODUTOS
            =============================== */

            const produtos =
                Array.isArray(dados)
                    ? dados
                    : dados?.produtos || [];

            /* ===============================
               SALVAR PRODUTOS NO CACHE
            =============================== */

            const quantidade =
                salvarCacheProdutos(
                    produtos
                );

            console.log(
                `[CACHE PRODUTOS] ${quantidade} produtos sincronizados`
            );

            /* ===============================
               DADOS DA SINCRONIZAÇÃO
            =============================== */

            const sincronizacao =
                dados?.sincronizacao ||
                null;

            /* ===============================
               GUARDAR DADOS LOCALMENTE
            =============================== */

            if (sincronizacao) {

                const dadosSincronizacao = {

                    id:
                        sincronizacao.id
                        ?? null,

                    cliente_id:
                        sincronizacao.cliente_id
                        ?? null,

                    ip:
                        sincronizacao.ip
                        ?? null,

                    data:
                        sincronizacao.data
                        ?? null,

                    hora:
                        sincronizacao.hora
                        ?? null
                };

                localStorage.setItem(
                    CACHE_SINCRONIZACAO_KEY,
                    JSON.stringify(
                        dadosSincronizacao
                    )
                );

                console.log(
                    "[SINCRONIZAÇÃO] Dados salvos:",
                    dadosSincronizacao
                );

            } else {

                console.warn(
                    "[SINCRONIZAÇÃO] Backend não retornou dados da sincronização"
                );
            }

            /* ===============================
               SUCESSO
            =============================== */

            setSincronizacaoSucesso(true);

            setTimeout(() => {

                setMostrarAreaSincronizacao(false);

            }, 1500);

        } catch (erro) {

            console.error(
                "[CACHE PRODUTOS] Erro na sincronização:",
                erro
            );

            setSincronizacaoSucesso(
                false
            );

        } finally {

            setSincronizando(
                false
            );

            requestAnimationFrame(() => {

                inputRef.current?.focus();

            });
        }
    }
    /* ===============================
       BUSCA POR NOME

       Continua usando o servidor.
    =============================== */
    async function buscar(valor) {

        // Se tiver letras, formata cada palavra
        const valorFormatado = /[a-zA-ZÀ-ÿ]/.test(valor)
            ? valor
                .toLowerCase()
                .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase())
            : valor;

        setTexto(valorFormatado);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!valorFormatado.trim()) {
            setSugestoes([]);
            return;
        }

        /* ===============================
           CÓDIGOS NUMÉRICOS
        =============================== */

        if (/^\d+$/.test(valorFormatado)) {
            setSugestoes([]);
            return;
        }

        /* ===============================
           BUSCAR NO CACHE
        =============================== */

        const cache = lerCacheProdutos();

        const produtos = Object.values(
            cache.produtos || {}
        );

        const termo = valorFormatado
            .trim()
            .toLowerCase();

        const encontrados = produtos
            .filter(produto => {

                const nome = String(
                    produto.nome || ""
                ).toLowerCase();

                return nome.includes(termo);
            })
            .slice(0, 20);

        setSugestoes(encontrados);
    }

    /* ===============================
       SELECIONAR PRODUTO
    =============================== */
    function selecionar(produto) {

        if (!produto || !produto.id) {
            return;
        }

        /* ===============================
           GARANTIR QUE NENHUMA LIMPEZA
           PENDENTE APAGUE O PRODUTO
        =============================== */

        setLimparBusca(false);

        /* ===============================
           MOSTRAR PRODUTO
        =============================== */

        setProdutoAtual(produto);

        /* ===============================
           ADICIONAR AO CARRINHO
        =============================== */

        adicionarItem(produto);

        /* ===============================
           LIMPAR CAMPO
        =============================== */

        setTexto("");
        setSugestoes([]);
        setIndiceAtivo(-1);

        /* ===============================
           VOLTAR FOCO PARA PRÓXIMO PRODUTO
        =============================== */

        requestAnimationFrame(() => {

            if (inputRef.current) {
                inputRef.current.value = "";
                inputRef.current.focus();
            }

        });
    }
    /* ===============================
       ENTER / TECLADO
    =============================== */
    async function handleKeyDown(e) {

        /* ===============================
           NAVEGAÇÃO DAS SUGESTÕES
        =============================== */

        if (sugestoes.length > 0) {

            if (e.key === "ArrowDown") {
                e.preventDefault();

                setIndiceAtivo(prev =>
                    prev < sugestoes.length - 1
                        ? prev + 1
                        : 0
                );

                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();

                setIndiceAtivo(prev =>
                    prev > 0
                        ? prev - 1
                        : sugestoes.length - 1
                );

                return;
            }

            if (e.key === "Enter") {
                e.preventDefault();

                const produtoSelecionado =
                    indiceAtivo >= 0
                        ? sugestoes[indiceAtivo]
                        : sugestoes[0];

                selecionar(produtoSelecionado);

                return;
            }

            if (e.key === "Escape") {
                setSugestoes([]);
                setIndiceAtivo(-1);

                return;
            }
        }

        /* ===============================
           SOMENTE ENTER
        =============================== */

        if (e.key !== "Enter") {
            return;
        }

        e.preventDefault();

        /* ===============================
           PEGAR VALOR DIRETO DO INPUT
    
           Não usamos o estado "texto"
           porque leitor de código de barras
           pode disparar Enter antes do React
           terminar de atualizar o state.
        =============================== */

        const valorBusca =
            normalizarCodigo(
                e.currentTarget.value
            );

        console.log(
            "[BUSCA PRODUTO] Valor recebido:",
            JSON.stringify(valorBusca)
        );

        if (!valorBusca) {
            console.log(
                "[BUSCA PRODUTO] Busca vazia"
            );

            return;
        }

        /* ===============================
           1. LER CACHE
        =============================== */

        const cache =
            lerCacheProdutos();

        const chavesCache =
            Object.keys(
                cache.produtos || {}
            );

        console.log(
            "[BUSCA PRODUTO] Procurando no cache:",
            valorBusca
        );

        console.log(
            "[BUSCA PRODUTO] Quantidade no cache:",
            chavesCache.length
        );

        console.log(
            "[BUSCA PRODUTO] Códigos disponíveis:",
            chavesCache
        );

        /* ===============================
           2. PROCURAR NO CACHE
        =============================== */

        const produtoLocal =
            cache.produtos?.[valorBusca] ||
            null;

        /* ===============================
           3. ENCONTROU LOCALMENTE
        =============================== */

        if (
            produtoLocal &&
            produtoLocal.id
        ) {

            console.log(
                "%c[BUSCA PRODUTO] ✅ ENCONTRADO NO CACHE",
                "color: green; font-weight: bold;"
            );

            console.log(
                "[BUSCA PRODUTO] Produto:",
                produtoLocal
            );

            /*
                IMPORTANTE:
    
                Nenhuma requisição ao servidor
                acontece depois deste return.
            */

            selecionar(
                produtoLocal
            );

            return;
        }

        /* ===============================
           4. NÃO ENCONTROU NO CACHE
        =============================== */

        console.log(
            "%c[BUSCA PRODUTO] ❌ NÃO ENCONTRADO NO CACHE",
            "color: orange; font-weight: bold;"
        );
        if (
            /^\d+$/.test(valorBusca) &&
            valorBusca.length <= 5
        ) {

            const sugestoesProximas =
                buscarCodigosProximos(
                    valorBusca
                );

            if (
                sugestoesProximas.length > 0
            ) {

                setSugestoes(
                    sugestoesProximas
                );

                setIndiceAtivo(-1);

                return;
            }
        }
        console.log(
            "[BUSCA PRODUTO] Agora consultando servidor..."
        );

        /* ===============================
           5. CONSULTAR SERVIDOR
        =============================== */

        setCarregando(true);

        try {

            const token =
                localStorage.getItem(
                    "token"
                );

            console.log(
                "[BUSCA PRODUTO] REQUISIÇÃO SERVIDOR:",
                valorBusca
            );

            const resp =
                await fetch(
                    `${API_URL}/api/produtos_servicos/buscar-exato?valor=${encodeURIComponent(valorBusca)}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const produto =
                resp.ok
                    ? await resp.json()
                    : null;

            /* ===============================
               6. SERVIDOR ENCONTROU
            =============================== */

            if (
                produto &&
                produto.id
            ) {

                console.log(
                    "%c[BUSCA PRODUTO] 🌐 ENCONTRADO NO SERVIDOR",
                    "color: blue; font-weight: bold;"
                );

                console.log(
                    "[BUSCA PRODUTO] Produto:",
                    produto
                );

                /* ===============================
                   COLOCAR NO CACHE
                =============================== */

                salvarProdutoNoCache(
                    produto
                );

                selecionar(
                    produto
                );

                return;
            }

            /* ===============================
               7. NÃO EXISTE
            =============================== */

            console.log(
                "[BUSCA PRODUTO] Produto não encontrado no servidor"
            );

            abrirModalCadastro(
                valorBusca
            );

        } catch (erro) {

            console.error(
                "[BUSCA PRODUTO] Erro na consulta ao servidor:",
                erro
            );

            abrirModalCadastro(
                valorBusca
            );

        } finally {

            setCarregando(
                false
            );
        }
    }

    /* ===============================
       LIMPAR INPUT
    =============================== */
    function limparInputBusca() {
        setTexto("");
        setSugestoes([]);
        setIndiceAtivo(-1);

        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }

    /* ===============================
       POSIÇÃO DAS SUGESTÕES
    =============================== */
    function getPosicao() {
        if (!inputRef.current) {
            return null;
        }

        const rect =
            inputRef.current.getBoundingClientRect();

        return {
            top:
                rect.bottom +
                window.scrollY +
                6,

            left:
                rect.left +
                window.scrollX,

            width:
                rect.width
        };
    }

    /* ===============================
       ABRIR CADASTRO
    =============================== */
    function abrirModalCadastro(valor) {
        setTextoCadastro(valor);
        setAbrirCadastro(true);
        setModalAberto(true);
    }

    /* ===============================
       FORMATAR SINCRONIZAÇÃO
    =============================== */
    function formatarUltimaSincronizacao() {
        if (!ultimaSincronizacao) {
            return "Produtos ainda não sincronizados";
        }

        try {
            return new Date(
                ultimaSincronizacao
            ).toLocaleString("pt-BR");
        } catch {
            return "";
        }
    }

    return (
        <div
            className={`buscar-box tema-${tema}`}
        >
            <label
                className="buscar-titulo"
            >
                Buscar produto
            </label>

            {mostrarAreaSincronizacao && (

                <div
                    className="buscar-sincronizacao-cache-info"
                >
                    <span
                        className="buscar-sincronizacao-cache-data"
                    >
                        ⚠️ Sincronize os produtos deste computador para tornar a busca mais rápida.                    </span>

                    <button
                        type="button"
                        className={`buscar-sincronizacao-cache-botao ${sincronizacaoSucesso
                            ? "buscar-sincronizacao-cache-sucesso"
                            : ""
                            }`}
                        onClick={sincronizarProdutos}
                        disabled={sincronizando}
                    >
                        {sincronizando ? (
                            <>
                                <span className="buscar-sync-loader"></span>
                                Sincronizando...
                            </>
                        ) : sincronizacaoSucesso ? (
                            <>
                                <span className="buscar-sync-check">
                                    ✓
                                </span>

                                Sincronizado com sucesso
                            </>
                        ) : (
                            "Sincronizar produtos"
                        )}
                    </button>
                </div>
            )}
            <div
                className="buscar-container"
            >
                <input
                    ref={el => {
                        inputRef.current = el;
                        buscarInputRef.current = el;
                    }}
                    className="buscar-inputtttt"
                    type="text"
                    placeholder="Digite nome, código de barras ou QRCode"
                    value={texto}
                    onChange={(e) =>
                        buscar(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                />

                {carregando && (
                    <div className="loader"></div>
                )}

                {texto.trim() !== "" &&
                    sugestoes.length > 0 &&
                    inputRef.current &&
                    createPortal(
                        (() => {
                            const pos =
                                getPosicao();

                            if (!pos) {
                                return null;
                            }

                            return (
                                <div
                                    className="sugestoes-box portal"
                                    style={{
                                        top: pos.top,
                                        left: pos.left,
                                        width: pos.width
                                    }}
                                >
                                    {sugestoes.map(
                                        (p, index) => (
                                            <div
                                                key={p.id}
                                                ref={el =>
                                                    itensRef.current[index] = el
                                                }
                                                className={`sug-item ${index === indiceAtivo
                                                    ? "ativo"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    selecionar(p)
                                                }
                                            >{p.imagem_url ? (
                                                <img
                                                    src={p.imagem_url.split("|")[0]}
                                                    alt=""
                                                    className="sug-img"
                                                    onError={(e) => {
                                                        const container =
                                                            e.currentTarget.parentElement;

                                                        e.currentTarget.remove();

                                                        const placeholder =
                                                            document.createElement("div");

                                                        placeholder.className =
                                                            "sug-img-sem-foto";

                                                        placeholder.textContent =
                                                            "Sem imagem";

                                                        container.prepend(
                                                            placeholder
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <div className="sug-img-sem-foto">
                                                    Sem imagem
                                                </div>
                                            )}

                                                <div
                                                    className="sug-info"
                                                >
                                                    <p
                                                        className="sug-nome"
                                                    >
                                                        {p.nome}
                                                    </p>

                                                    <span
                                                        className="sug-sub"
                                                    >
                                                        {p.unidade ||
                                                            p.tempo_servico ||
                                                            ""}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })(),

                        document.body
                    )}
            </div>

            {abrirCadastro && (
                <ModalCadastroProduto
                    textoInicial={textoCadastro}
                    fechar={() => {
                        setAbrirCadastro(false);
                        setModalAberto(false);
                        limparInputBusca();
                    }}
                    onCriado={(produto) => {
                        /*
                            Produto recém-criado já entra
                            no cache também.
                        */
                        salvarProdutoNoCache(
                            produto
                        );

                        setProdutoAtual(
                            produto
                        );

                        adicionarItem(
                            produto
                        );

                        setAbrirCadastro(
                            false
                        );

                        setModalAberto(
                            false
                        );

                        limparInputBusca();
                    }}
                />
            )}
        </div>
    );
}