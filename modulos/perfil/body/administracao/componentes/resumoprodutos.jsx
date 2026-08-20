import React, { useEffect, useState } from "react";
import FormularioProduto from "./formularioproduto";
import { API_URL } from "../../../../../config";
import "./resumoprodutos.css";
import Etiquetas from "./etiquetas";

export default function ResumoProdutos() {

    const [lista, setLista] = useState([]);
    const [modo, setModo] = useState("lista");
    const [visualizacao, setVisualizacao] = useState("lista");
    const [editar, setEditar] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const duplicados = lista.filter(i => i.duplicado === 1);

    const [limite, setLimite] = useState(30);
    const [filtroNome, setFiltroNome] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [precoMin, setPrecoMin] = useState("");
    const [precoMax, setPrecoMax] = useState("");
    const [confirmarId, setConfirmarId] = useState(null);
    const [filtroVencimento, setFiltroVencimento] = useState(false);

    const token = localStorage.getItem("token");
    /* =========================================================
       CACHE DE PRODUTOS POR COMÉRCIO
    ========================================================= */

    function obterComercioIdCache() {

        try {

            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

            return usuario?.comercio_id || null;

        } catch {

            return null;
        }
    }


    function obterChaveCacheProdutos() {

        const comercioId =
            obterComercioIdCache();

        if (!comercioId) {
            return null;
        }

        return `iron_produtos_servicos_cache_${comercioId}`;
    }


    /* =========================================================
       LER CACHE
    ========================================================= */

    function lerCacheProdutos() {

        const chave =
            obterChaveCacheProdutos();

        if (!chave) {
            return null;
        }

        try {

            const salvo =
                localStorage.getItem(chave);

            if (!salvo) {
                return null;
            }

            const dados =
                JSON.parse(salvo);

            if (!Array.isArray(dados)) {
                throw new Error(
                    "Formato do cache inválido"
                );
            }

            return dados;

        } catch (erro) {

            console.warn(
                "[PRODUTOS] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCacheProdutos(dados) {

        const chave =
            obterChaveCacheProdutos();

        if (!chave) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(dados)
            );

        } catch (erro) {

            console.warn(
                "[PRODUTOS] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       NORMALIZAR PARA COMPARAÇÃO
    ========================================================= */

    function normalizarProdutos(listaProdutos) {

        if (!Array.isArray(listaProdutos)) {
            return [];
        }

        return [...listaProdutos]
            .map(item => ({
                ...item
            }))
            .sort((a, b) => {

                return String(a.id).localeCompare(
                    String(b.id),
                    undefined,
                    {
                        numeric: true
                    }
                );
            });
    }


    /* =========================================================
       COMPARAR CACHE COM SERVIDOR
    ========================================================= */

    function produtosIguais(
        cache,
        servidor
    ) {

        if (
            !Array.isArray(cache) ||
            !Array.isArray(servidor)
        ) {
            return false;
        }


        if (
            cache.length !==
            servidor.length
        ) {
            return false;
        }


        try {

            const cacheNormalizado =
                normalizarProdutos(cache);

            const servidorNormalizado =
                normalizarProdutos(servidor);


            return (
                JSON.stringify(cacheNormalizado) ===
                JSON.stringify(servidorNormalizado)
            );

        } catch {

            return false;
        }
    }
    async function carregar() {

        /* =====================================================
           1. PROCURA CACHE
        ===================================================== */

        const cache =
            lerCacheProdutos();


        /* =====================================================
           2. SE EXISTIR CACHE, MOSTRA IMEDIATAMENTE
        ===================================================== */

        if (Array.isArray(cache)) {

            setLista(cache);

            setCarregando(false);

            console.log(
                "[PRODUTOS] Lista carregada do cache:",
                cache.length
            );

        } else {

            /*
                Skeleton/loading somente quando realmente
                não temos produtos salvos.
            */

            setCarregando(true);
        }


        /* =====================================================
           3. CONSULTA SERVIDOR
        ===================================================== */

        try {

            const resp = await fetch(
                `${API_URL}/admin/produtos-servicos`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao carregar produtos: ${resp.status}`
                );
            }


            const dados =
                await resp.json();


            const dadosServidor =
                Array.isArray(dados)
                    ? dados
                    : [];


            /* =================================================
               4. COMPARA CACHE COM SERVIDOR
            ================================================= */

            const iguais =
                produtosIguais(
                    cache,
                    dadosServidor
                );


            /* =================================================
               5. NÃO MUDOU
    
               Não altera state.
               Não reescreve localStorage.
            ================================================= */

            if (iguais) {

                console.log(
                    "[PRODUTOS] Cache já está atualizado."
                );

                return;
            }


            /* =================================================
               6. SERVIDOR ESTÁ DIFERENTE
    
               Pode ser:
               produto novo
               produto removido
               preço alterado
               nome alterado
               estoque alterado
               categoria alterada
               vencimento alterado
               qualquer outro campo alterado
            ================================================= */

            console.log(
                "[PRODUTOS] Alterações encontradas.",
                {
                    cache:
                        cache?.length || 0,

                    servidor:
                        dadosServidor.length
                }
            );


            setLista(
                dadosServidor
            );


            salvarCacheProdutos(
                dadosServidor
            );


            console.log(
                "[PRODUTOS] Cache atualizado."
            );


        } catch (erro) {

            console.error(
                "[PRODUTOS] Erro ao consultar servidor:",
                erro
            );


            /*
                Se existe cache, continuamos mostrando
                os produtos salvos.
    
                Se não existe cache, não temos o que mostrar.
            */

            if (!Array.isArray(cache)) {

                setLista([]);

            }


        } finally {

            setCarregando(false);

        }
    }

    useEffect(() => { carregar(); }, []);

    function colunaUnidade(item) {
        if (item.produto_id > 0)
            return `${item.unidades}x ${item.nome_produto_base}`;
        if (item.unidade) return item.unidade;
        return item.tempo_servico;
    }

    if (modo !== "lista") {
        return (
            <FormularioProduto
                item={editar}
                voltar={() => {
                    setModo("lista");
                    setEditar(null);
                    setLimite(30);
                    carregar();
                }}
            />
        );
    }

    const listaFiltrada = lista.filter(item => {

        if (filtroNome) {
            if (!item.nome?.toLowerCase().includes(filtroNome.toLowerCase())) {
                return false;
            }
        }

        if (filtroCategoria) {
            if (!item.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase())) {
                return false;
            }
        }

        const preco = Number(item.preco);

        if (precoMin !== "" && preco < Number(precoMin)) {
            return false;
        }

        if (precoMax !== "" && preco > Number(precoMax)) {
            return false;
        }
        if (filtroVencimento) {
            if (!produtoVencidoOuPerto(item.data_vencimento)) {
                return false;
            }
        }

        return true;
    });

    const itensVisiveis = listaFiltrada.slice(0, limite);
    const temMais = listaFiltrada.length > limite;
    function produtoVencidoOuPerto(data) {
        if (!data) return false;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const vencimento = new Date(data);
        vencimento.setHours(0, 0, 0, 0);

        const limite = new Date(hoje);
        limite.setDate(limite.getDate() + 7);

        return vencimento <= limite;
    }

    return (
        <div className="resumo-produtos">

            <div className="topo">
                <h4>Produtos e Serviços</h4>

                {duplicados.length > 0 && (
                    <button
                        style={{ display: "none" }}
                        className="btn-duplicados"
                        onClick={async () => {
                            if (
                                !window.confirm(
                                    `Existem ${duplicados.length} produtos duplicados. Deseja apagar todos?`
                                )
                            ) return;

                            await fetch(
                                `${API_URL}/admin/produtos-servicos/duplicados`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            );

                            carregar();
                        }}
                    >
                        ⚠️ Duplicados ({duplicados.length})
                    </button>
                )}

                <button onClick={() => setModo("novo")}>
                    Adicionar
                </button>
            </div>


            {/* ===============================
            SELETOR LISTA / ETIQUETAS
        =============================== */}

            <div className="resumo-produtos-seletor-visualizacao">

                <button
                    type="button"
                    className={`resumo-produtos-botao-lista ${visualizacao === "lista" ? "ativo" : ""
                        }`}
                    onClick={() => setVisualizacao("lista")}
                >
                    Lista
                </button>

                <button
                    type="button"
                    className={`resumo-produtos-botao-etiquetas ${visualizacao === "etiquetas" ? "ativo" : ""
                        }`}
                    onClick={() => setVisualizacao("etiquetas")}
                >
                    Etiquetas
                </button>

            </div>


            {/* ===============================
            CONTEÚDO
        =============================== */}

            {visualizacao === "etiquetas" ? (

                <Etiquetas />

            ) : (

                <>
                    {/* ===============================
                    FILTROS
                =============================== */}

                    <div className="filtros-produtos">

                        <input
                            type="text"
                            placeholder="Filtrar por nome"
                            value={filtroNome}
                            onChange={e => {
                                setFiltroNome(e.target.value);
                                setLimite(30);
                            }}
                        />

                        <input
                            type="text"
                            placeholder="Filtrar por categoria"
                            value={filtroCategoria}
                            onChange={e => {
                                setFiltroCategoria(e.target.value);
                                setLimite(30);
                            }}
                        />

                        <input
                            type="number"
                            placeholder="Preço mínimo"
                            value={precoMin}
                            onChange={e => {
                                setPrecoMin(e.target.value);
                                setLimite(30);
                            }}
                        />

                        <input
                            type="number"
                            placeholder="Preço máximo"
                            value={precoMax}
                            onChange={e => {
                                setPrecoMax(e.target.value);
                                setLimite(30);
                            }}
                        />

                        <button
                            className={`btn-vencimento ${filtroVencimento ? "ativo" : ""
                                }`}
                            onClick={() => {
                                setFiltroVencimento(v => !v);
                                setLimite(30);
                            }}
                        >
                            {filtroVencimento
                                ? "Mostrando vencidos / a vencer"
                                : "Filtrar vencidos / a vencer"
                            }
                        </button>

                    </div>


                    {/* ===============================
                    LISTA
                =============================== */}

                    <div className="conteudo-scroll">

                        {carregando ? (

                            <div className="loading-area">
                                <div className="spinner"></div>

                                <span style={{ color: "white" }}>
                                    Carregando produtos...
                                </span>
                            </div>

                        ) : (

                            <>
                                <div className="lista-cards">

                                    {itensVisiveis.map(item => (

                                        <div
                                            className={`card-produto ${item.duplicado ? "duplicado" : ""
                                                }`}
                                            key={item.id}
                                        >

                                            {/* INFORMAÇÕES */}

                                            <div
                                                className="card-info"
                                                onClick={() => {
                                                    setEditar(item);
                                                    setModo("editar");
                                                }}
                                            >

                                                <h5>{item.nome}</h5>

                                                <span className="sub">
                                                    {colunaUnidade(item)} · {item.categoria}
                                                </span>

                                                <div className="precos">

                                                    <div>
                                                        <label>Preço </label>
                                                        <strong>
                                                            R$ {item.preco}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <label>Recebido </label>
                                                        <strong>
                                                            R$ {item.preco_recebido}
                                                        </strong>
                                                    </div>

                                                </div>

                                            </div>


                                            {/* AÇÕES */}

                                            <div className="card-acoes">

                                                <button
                                                    className={`apagar ${confirmarId === item.id
                                                        ? "confirmar"
                                                        : ""
                                                        }`}
                                                    onClick={async () => {

                                                        if (confirmarId !== item.id) {
                                                            setConfirmarId(item.id);
                                                            return;
                                                        }

                                                        await fetch(
                                                            `${API_URL}/admin/produtos-servicos/${item.id}`,
                                                            {
                                                                method: "DELETE",
                                                                headers: {
                                                                    Authorization: `Bearer ${token}`
                                                                }
                                                            }
                                                        );

                                                        setConfirmarId(null);
                                                        carregar();
                                                    }}
                                                >
                                                    {confirmarId === item.id
                                                        ? "Confirmar"
                                                        : "Apagar"
                                                    }
                                                </button>

                                            </div>

                                        </div>

                                    ))}

                                </div>


                                {/* ===============================
                                VER MAIS
                            =============================== */}

                                {temMais && (

                                    <div className="ver-mais-area">

                                        <button
                                            className="ver-mais"
                                            onClick={() =>
                                                setLimite(l => l + 30)
                                            }
                                        >
                                            Ver mais
                                        </button>

                                        <span>
                                            Mostrando {itensVisiveis.length} de{" "}
                                            {listaFiltrada.length}
                                        </span>

                                    </div>

                                )}

                            </>

                        )}

                    </div>

                </>

            )}

        </div>
    );


}