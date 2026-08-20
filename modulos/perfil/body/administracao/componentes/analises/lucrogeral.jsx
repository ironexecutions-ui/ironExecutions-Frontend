import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../../config";
import "./lucrogeral.css";
import ModalProdutosSemPreco from "./modalsempreco";

export default function LucroGeral() {

    const [abrirModal, setAbrirModal] = useState(false);
    const [dados, setDados] = useState(null);
    const [limite, setLimite] = useState(5);

    const [categoria, setCategoria] = useState("");
    const [nome, setNome] = useState("");
    const [categorias, setCategorias] = useState([]);

    const token = localStorage.getItem("token");


    /* =========================================================
       IDENTIFICAR COMÉRCIO
    ========================================================= */

    function obterComercioId() {

        try {

            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

            return usuario?.comercio_id || null;

        } catch {

            return null;
        }
    }


    /* =========================================================
       CHAVE CACHE CATEGORIAS
    ========================================================= */

    function obterChaveCacheCategorias() {

        const comercioId = obterComercioId();

        if (!comercioId) {
            return null;
        }

        return `iron_lucro_categorias_cache_${comercioId}`;
    }


    /* =========================================================
       CHAVE CACHE ANÁLISE

       Cada combinação de filtros tem seu próprio cache.
    ========================================================= */

    function obterChaveCacheAnalise() {

        const comercioId = obterComercioId();

        if (!comercioId) {
            return null;
        }

        const categoriaNormalizada =
            categoria
                .trim()
                .toLowerCase();

        const nomeNormalizado =
            nome
                .trim()
                .toLowerCase();

        return (
            `iron_lucro_analise_cache_` +
            `${comercioId}_` +
            `${limite}_` +
            `${encodeURIComponent(categoriaNormalizada)}_` +
            `${encodeURIComponent(nomeNormalizado)}`
        );
    }


    /* =========================================================
       LER CACHE
    ========================================================= */

    function lerCache(chave) {

        if (!chave) {
            return null;
        }

        try {

            const salvo =
                localStorage.getItem(chave);

            if (!salvo) {
                return null;
            }

            return JSON.parse(salvo);

        } catch (erro) {

            console.warn(
                "[LUCRO] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCache(
        chave,
        valor
    ) {

        if (!chave) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(valor)
            );

        } catch (erro) {

            console.warn(
                "[LUCRO] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       COMPARAR DADOS
    ========================================================= */

    function dadosIguais(
        cache,
        servidor
    ) {

        if (
            cache === null ||
            servidor === null
        ) {
            return cache === servidor;
        }

        try {

            return (
                JSON.stringify(cache) ===
                JSON.stringify(servidor)
            );

        } catch {

            return false;
        }
    }


    /* =========================================================
       CARREGAR ANÁLISE
    ========================================================= */

    async function carregar() {

        const chaveCache =
            obterChaveCacheAnalise();


        /* =====================================================
           1. MOSTRA CACHE IMEDIATAMENTE
        ===================================================== */

        const cache =
            lerCache(chaveCache);


        if (cache) {

            setDados(cache);

            console.log(
                "[LUCRO] Análise carregada do cache."
            );
        }


        /* =====================================================
           2. MONTA PARÂMETROS
        ===================================================== */

        const params =
            new URLSearchParams();


        params.append(
            "limite",
            limite
        );


        if (categoria) {

            params.append(
                "categoria",
                categoria
            );
        }


        if (nome) {

            params.append(
                "nome",
                nome
            );
        }


        /* =====================================================
           3. CONSULTA SERVIDOR
        ===================================================== */

        try {

            const resp = await fetch(
                `${API_URL}/admin/analise/margem-produtos?${params.toString()}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro margem produtos: ${resp.status}`
                );
            }


            const dadosServidor =
                await resp.json();


            /* =================================================
               4. COMPARA
            ================================================= */

            if (
                dadosIguais(
                    cache,
                    dadosServidor
                )
            ) {

                console.log(
                    "[LUCRO] Análise já está atualizada."
                );

                /*
                    Caso não tivéssemos cache carregado
                    no state por algum motivo.
                */

                if (!cache) {

                    setDados(
                        dadosServidor
                    );
                }

                return;
            }


            /* =================================================
               5. SERVIDOR MUDOU
            ================================================= */

            console.log(
                "[LUCRO] Análise mudou. Atualizando cache."
            );


            setDados(
                dadosServidor
            );


            salvarCache(
                chaveCache,
                dadosServidor
            );


        } catch (erro) {

            console.error(
                "[LUCRO] Erro ao carregar análise:",
                erro
            );


            /*
                Se existe cache, mantemos os dados antigos.
            */

            if (!cache) {

                setDados(null);

            }
        }
    }


    /* =========================================================
       CARREGAR CATEGORIAS
    ========================================================= */

    async function carregarCategorias() {

        const chaveCache =
            obterChaveCacheCategorias();


        /* =====================================================
           1. CARREGA CACHE
        ===================================================== */

        const cache =
            lerCache(chaveCache);


        if (Array.isArray(cache)) {

            setCategorias(cache);

            console.log(
                "[LUCRO] Categorias carregadas do cache."
            );
        }


        /* =====================================================
           2. VERIFICA SERVIDOR
        ===================================================== */

        try {

            const resp = await fetch(
                `${API_URL}/admin/analise/categorias`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro categorias: ${resp.status}`
                );
            }


            const resposta =
                await resp.json();


            const dadosServidor =
                Array.isArray(resposta)
                    ? resposta
                    : [];


            /* =================================================
               3. NORMALIZA PARA COMPARAÇÃO

               Se a API devolver as mesmas categorias
               em ordem diferente, não consideramos alteração.
            ================================================= */

            const cacheOrdenado =
                Array.isArray(cache)
                    ? [...cache].sort()
                    : [];


            const servidorOrdenado =
                [...dadosServidor].sort();


            const iguais =
                JSON.stringify(cacheOrdenado) ===
                JSON.stringify(servidorOrdenado);


            if (iguais) {

                console.log(
                    "[LUCRO] Categorias já estão atualizadas."
                );

                return;
            }


            /* =================================================
               4. ATUALIZA
            ================================================= */

            setCategorias(
                dadosServidor
            );


            salvarCache(
                chaveCache,
                dadosServidor
            );


            console.log(
                "[LUCRO] Cache de categorias atualizado."
            );


        } catch (erro) {

            console.error(
                "[LUCRO] Erro ao carregar categorias:",
                erro
            );


            if (!Array.isArray(cache)) {

                setCategorias([]);

            }
        }
    }


    /* =========================================================
       CATEGORIAS
    ========================================================= */

    useEffect(() => {

        carregarCategorias();

    }, []);


    /* =========================================================
       ANÁLISE

       Quando mudar filtro, procura primeiro o cache
       daquela combinação e depois verifica a API.
    ========================================================= */

    useEffect(() => {

        carregar();

    }, [
        limite,
        categoria,
        nome
    ]);


    /* =========================================================
       LOADING
    ========================================================= */

    if (!dados) {

        return (
            <p>
                Carregando análise...
            </p>
        );
    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="lucro-geral-container">

            <h4>
                Análise de Precificação
            </h4>


            {dados.invalidos_total > 0 && (

                <div
                    className="lucro-alerta"
                    onClick={() =>
                        setAbrirModal(true)
                    }
                >

                    ⚠ Existem {dados.invalidos_total} produtos sem valor definido

                </div>

            )}


            <div className="lucro-card">

                <span>
                    Markup médio sobre custo
                </span>

                <strong>
                    {dados.percentual_medio}%
                </strong>

            </div>


            <div className="lucro-geral-filtros">

                <div>

                    <label>
                        Categoria
                    </label>

                    <input
                        list="categorias"
                        value={categoria}
                        onChange={e =>
                            setCategoria(
                                e.target.value
                            )
                        }
                        placeholder="Todas"
                    />

                    <datalist id="categorias">

                        {categorias.map(
                            (c, i) => (

                                <option
                                    key={i}
                                    value={c}
                                />

                            )
                        )}

                    </datalist>

                </div>


                <div>

                    <label>
                        Nome do produto
                    </label>

                    <input
                        type="text"
                        value={nome}
                        onChange={e =>
                            setNome(
                                e.target.value
                            )
                        }
                        placeholder="Buscar por nome"
                    />

                </div>


                <div>

                    <label>
                        Quantidade no ranking
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={limite}
                        onChange={e => {

                            let valor =
                                Number(
                                    e.target.value
                                );

                            if (valor < 1) {
                                valor = 1;
                            }

                            if (valor > 50) {
                                valor = 50;
                            }

                            setLimite(
                                valor
                            );
                        }}
                    />

                </div>

            </div>


            <div className="lucro-ranking">

                <div className="lucro-ranking-bloco">

                    <h5>
                        Maiores markups
                    </h5>

                    {dados.maiores.map(
                        (p, i) => (

                            <div
                                key={i}
                                className="lucro-item maior"
                            >

                                {p.nome}

                                <span>
                                    {p.percentual}%
                                </span>

                            </div>

                        )
                    )}

                </div>


                <div className="lucro-ranking-bloco">

                    <h5>
                        Menores markups
                    </h5>

                    {dados.menores.map(
                        (p, i) => (

                            <div
                                key={i}
                                className="lucro-item menor"
                            >

                                {p.nome}

                                <span>
                                    {p.percentual}%
                                </span>

                            </div>

                        )
                    )}

                </div>

            </div>


            {abrirModal && (

                <ModalProdutosSemPreco
                    fechar={() =>
                        setAbrirModal(false)
                    }
                    atualizar={
                        carregar
                    }
                />

            )}

        </div>

    );
}