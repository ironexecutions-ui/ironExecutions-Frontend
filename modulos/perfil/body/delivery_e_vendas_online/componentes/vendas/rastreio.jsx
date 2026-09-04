import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    API_URL
} from "../../../../../../config";

import "./rastreio.css";


export default function Rastreio() {

    /* ============================================================
       ESTADOS
    ============================================================ */

    const [
        carregando,
        setCarregando
    ] = useState(true);

    const [
        erro,
        setErro
    ] = useState("");

    const [
        rastreios,
        setRastreios
    ] = useState([]);

    const [
        busca,
        setBusca
    ] = useState("");

    const [
        atualizando,
        setAtualizando
    ] = useState(false);


    /* ============================================================
       CARREGAR RASTREIO
    ============================================================ */

    async function buscarRastreios(
        mostrarLoadingPrincipal = false
    ) {

        try {

            if (mostrarLoadingPrincipal) {

                setCarregando(true);

            } else {

                setAtualizando(true);

            }

            setErro("");


            /* =====================================================
               TOKEN
            ===================================================== */

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }


            /* =====================================================
               CONSULTA

               O comércio é identificado exclusivamente
               pelo token no backend.
            ===================================================== */

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/rastreio/painel`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            /* =====================================================
               SESSÃO EXPIRADA
            ===================================================== */

            if (
                resposta.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                window.location.replace(
                    "/"
                );

                return;

            }


            /* =====================================================
               RESPOSTA
            ===================================================== */

            const dados =
                await resposta.json()
                    .catch(
                        () => ({})
                    );


            if (!resposta.ok) {

                throw new Error(
                    dados?.detail ||
                    `Erro ${resposta.status} ao carregar rastreio.`
                );

            }


            setRastreios(
                Array.isArray(
                    dados?.rastreios
                )
                    ? dados.rastreios
                    : []
            );


        } catch (erro) {

            console.error(
                "[IRONSTORE RASTREIO]",
                erro
            );

            setErro(
                erro?.message ||
                "Não foi possível carregar o rastreio."
            );


        } finally {

            setCarregando(false);
            setAtualizando(false);

        }

    }


    /* ============================================================
       PRIMEIRO CARREGAMENTO
    ============================================================ */

    useEffect(() => {

        buscarRastreios(true);

    }, []);


    /* ============================================================
       ESTATÍSTICAS
    ============================================================ */

    const estatisticas =
        useMemo(
            () => {

                const clientes =
                    new Set();

                const areas =
                    new Set();

                let totalAcessos = 0;


                rastreios.forEach(
                    (item) => {

                        if (
                            item?.usuario_id !== null &&
                            item?.usuario_id !== undefined
                        ) {

                            // CLIENTE LOGADO
                            clientes.add(
                                `logado:${item.usuario_id}`
                            );

                        } else if (item?.identificador) {

                            // VISITANTE NÃO LOGADO
                            // Cada código/IP diferente conta como um visitante diferente
                            clientes.add(
                                `nao-logado:${item.identificador}`
                            );

                        }

                        if (item?.area) {

                            areas.add(
                                String(
                                    item.area
                                )
                            );

                        }

                        totalAcessos +=
                            Number(
                                item?.acessos || 0
                            );

                    }
                );


                const maisAcessada =
                    [...rastreios]
                        .sort(
                            (a, b) =>
                                Number(
                                    b?.acessos || 0
                                ) -
                                Number(
                                    a?.acessos || 0
                                )
                        )[0];


                return {
                    clientes:
                        clientes.size,

                    areas:
                        areas.size,

                    acessos:
                        totalAcessos,

                    areaMaisAcessada:
                        maisAcessada?.area ||
                        "—"
                };

            },
            [rastreios]
        );


    /* ============================================================
       FILTRO
    ============================================================ */

    const rastreiosFiltrados =
        useMemo(
            () => {

                const termo =
                    busca
                        .trim()
                        .toLowerCase();


                if (!termo) {

                    return rastreios;

                }


                return rastreios.filter(
                    (item) => {

                        const usuario =
                            String(
                                item?.usuario || ""
                            ).toLowerCase();

                        const area =
                            String(
                                item?.area || ""
                            ).toLowerCase();

                        const id =
                            String(
                                item?.usuario_id || ""
                            );

                        const identificador =
                            String(
                                item?.identificador || ""
                            ).toLowerCase();
                        return (
                            usuario.includes(termo) ||
                            area.includes(termo) ||
                            id.includes(termo) ||
                            identificador.includes(termo)
                        );

                    }
                );

            },
            [
                busca,
                rastreios
            ]
        );


    /* ============================================================
       FORMATAR ÁREA
    ============================================================ */

    function formatarArea(
        area
    ) {

        const texto =
            String(
                area || "inicio"
            )
                .trim()
                .toLowerCase();


        const nomes = {
            inicio: "Início",
            perfil: "Perfil",
            produtos: "Produtos",
            reels: "Reels",
            compras: "Compras",
            entrar: "Entrar",
            carrinho: "Carrinho"
        };


        return (
            nomes[texto] ||
            texto.charAt(0).toUpperCase() +
            texto.slice(1)
        );

    }


    /* ============================================================
       ÍCONE ÁREA
    ============================================================ */

    function iconeArea(
        area
    ) {

        const valor =
            String(
                area || ""
            ).toLowerCase();


        const icones = {
            inicio: "⌂",
            perfil: "◎",
            produtos: "◇",
            reels: "▶",
            compras: "▣",
            entrar: "→",
            carrinho: "▱"
        };


        return (
            icones[valor] ||
            "•"
        );

    }


    /* ============================================================
       CARREGANDO
    ============================================================ */

    if (carregando) {

        return (

            <div className="ironstore-rastreio-loading">

                <div className="ironstore-rastreio-loading-spinner" />

                <strong>
                    Carregando rastreamento
                </strong>

                <span>
                    Preparando os dados de navegação da sua loja.
                </span>

            </div>

        );

    }


    /* ============================================================
       INTERFACE
    ============================================================ */

    return (

        <section className="ironstore-rastreio">


            {/* ====================================================
                TOPO
            ==================================================== */}

            <div className="ironstore-rastreio-topo">

                <div className="ironstore-rastreio-topo-conteudo">

                    <div className="ironstore-rastreio-titulo-icone">
                        ◉
                    </div>

                    <div>

                        <span className="ironstore-rastreio-eyebrow">
                            IRONSTORE ANALYTICS
                        </span>

                        <h2>
                            Rastreio de navegação
                        </h2>

                        <p>
                            Acompanhe como os clientes navegam pelas áreas da sua loja.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="ironstore-rastreio-atualizar"
                    onClick={
                        () =>
                            buscarRastreios(
                                false
                            )
                    }
                    disabled={
                        atualizando
                    }
                >

                    <span
                        className={
                            atualizando
                                ? "ironstore-rastreio-atualizar-icone girando"
                                : "ironstore-rastreio-atualizar-icone"
                        }
                    >
                        ↻
                    </span>

                    {
                        atualizando
                            ? "Atualizando..."
                            : "Atualizar dados"
                    }

                </button>

            </div>


            {/* ====================================================
                ERRO
            ==================================================== */}

            {
                erro && (

                    <div className="ironstore-rastreio-alerta">

                        <div className="ironstore-rastreio-alerta-icone">
                            !
                        </div>

                        <div>

                            <strong>
                                Não foi possível carregar os dados
                            </strong>

                            <span>
                                {erro}
                            </span>

                        </div>

                    </div>

                )
            }


            {/* ====================================================
                RESUMO
            ==================================================== */}

            <div className="ironstore-rastreio-resumo">


                <article className="ironstore-rastreio-card">

                    <div className="ironstore-rastreio-card-topo">

                        <span>
                            Clientes rastreados
                        </span>

                        <div className="ironstore-rastreio-card-icone">
                            ◎
                        </div>

                    </div>

                    <strong>
                        {estatisticas.clientes}
                    </strong>

                    <small>
                        Clientes identificados
                    </small>

                </article>


                <article className="ironstore-rastreio-card">

                    <div className="ironstore-rastreio-card-topo">

                        <span>
                            Total de acessos
                        </span>

                        <div className="ironstore-rastreio-card-icone">
                            ↗
                        </div>

                    </div>

                    <strong>
                        {
                            estatisticas.acessos
                                .toLocaleString(
                                    "pt-BR"
                                )
                        }
                    </strong>

                    <small>
                        Navegações registradas
                    </small>

                </article>


                <article className="ironstore-rastreio-card">

                    <div className="ironstore-rastreio-card-topo">

                        <span>
                            Áreas visitadas
                        </span>

                        <div className="ironstore-rastreio-card-icone">
                            ◇
                        </div>

                    </div>

                    <strong>
                        {estatisticas.areas}
                    </strong>

                    <small>
                        Áreas com atividade
                    </small>

                </article>


                <article className="ironstore-rastreio-card">

                    <div className="ironstore-rastreio-card-topo">

                        <span>
                            Maior atividade
                        </span>

                        <div className="ironstore-rastreio-card-icone">
                            ◈
                        </div>

                    </div>

                    <strong className="ironstore-rastreio-card-area">
                        {
                            formatarArea(
                                estatisticas.areaMaisAcessada
                            )
                        }
                    </strong>

                    <small>
                        Área com mais acessos
                    </small>

                </article>


            </div>


            {/* ====================================================
                CONTEÚDO
            ==================================================== */}

            <div className="ironstore-rastreio-painel">


                {/* =================================================
                    CABEÇALHO TABELA
                ================================================= */}

                <div className="ironstore-rastreio-painel-topo">

                    <div>

                        <h3>
                            Atividade dos clientes
                        </h3>

                        <p>
                            Visualize as áreas mais acessadas individualmente.
                        </p>

                    </div>


                    <div className="ironstore-rastreio-busca">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            value={
                                busca
                            }
                            onChange={
                                (evento) =>
                                    setBusca(
                                        evento.target.value
                                    )
                            }
                            placeholder="Buscar cliente ou área..."
                        />

                        {
                            busca && (

                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            setBusca("")
                                    }
                                    aria-label="Limpar busca"
                                >
                                    ×
                                </button>

                            )
                        }

                    </div>

                </div>


                {/* =================================================
                    QUANTIDADE
                ================================================= */}

                <div className="ironstore-rastreio-info">

                    <span className="ironstore-rastreio-status">
                        <i />
                        Dados atualizados
                    </span>

                    <span>
                        {
                            rastreiosFiltrados.length
                        } {
                            rastreiosFiltrados.length === 1
                                ? "registro"
                                : "registros"
                        }
                    </span>

                </div>


                {/* =================================================
                    VAZIO
                ================================================= */}

                {
                    rastreiosFiltrados.length === 0 && (

                        <div className="ironstore-rastreio-vazio">

                            <div className="ironstore-rastreio-vazio-icone">
                                ⌕
                            </div>

                            <strong>
                                Nenhum acesso encontrado
                            </strong>

                            <p>
                                {
                                    busca
                                        ? "Nenhum registro corresponde à sua busca."
                                        : "Ainda não existem acessos registrados para os clientes desta loja."
                                }
                            </p>

                        </div>

                    )
                }


                {/* =================================================
                    TABELA
                ================================================= */}

                {
                    rastreiosFiltrados.length > 0 && (

                        <div className="ironstore-rastreio-tabela-container">

                            <table className="ironstore-rastreio-tabela">

                                <thead>

                                    <tr>

                                        <th>
                                            Cliente
                                        </th>

                                        <th>
                                            Área acessada
                                        </th>

                                        <th className="ironstore-rastreio-th-acessos">
                                            Acessos
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        rastreiosFiltrados.map(
                                            (
                                                item,
                                                indice
                                            ) => {

                                                const acessos =
                                                    Number(
                                                        item?.acessos || 0
                                                    );

                                                const maximo =
                                                    Math.max(
                                                        ...rastreiosFiltrados.map(
                                                            (registro) =>
                                                                Number(
                                                                    registro?.acessos || 0
                                                                )
                                                        ),
                                                        1
                                                    );

                                                const porcentagem =
                                                    Math.max(
                                                        5,
                                                        (
                                                            acessos /
                                                            maximo
                                                        ) * 100
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            `${item.usuario_id}-${item.area}-${indice}`
                                                        }
                                                    >

                                                        {/* CLIENTE */}

                                                        <td>

                                                            <div className="ironstore-rastreio-cliente">

                                                                <div className="ironstore-rastreio-avatar">

                                                                    {
                                                                        item?.logado
                                                                            ? String(
                                                                                item?.usuario || "C"
                                                                            )
                                                                                .trim()
                                                                                .charAt(0)
                                                                                .toUpperCase()
                                                                            : "?"
                                                                    }

                                                                </div>

                                                                <div className="ironstore-rastreio-cliente-info">

                                                                    <strong>
                                                                        {
                                                                            item?.logado
                                                                                ? (
                                                                                    item?.usuario ||
                                                                                    "Cliente"
                                                                                )
                                                                                : "Usuário não logado"
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            item?.logado
                                                                                ? `ID #${item.usuario_id}`
                                                                                : (
                                                                                    item?.identificador ||
                                                                                    "Visitante não identificado"
                                                                                )
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* ÁREA */}

                                                        <td>

                                                            <span className="ironstore-rastreio-area">

                                                                <i>
                                                                    {
                                                                        iconeArea(
                                                                            item?.area
                                                                        )
                                                                    }
                                                                </i>

                                                                {
                                                                    formatarArea(
                                                                        item?.area
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ACESSOS */}

                                                        <td>

                                                            <div className="ironstore-rastreio-acessos">

                                                                <strong>
                                                                    {
                                                                        acessos.toLocaleString(
                                                                            "pt-BR"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <div className="ironstore-rastreio-barra">

                                                                    <span
                                                                        style={{
                                                                            width:
                                                                                `${porcentagem}%`
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    )
                }


            </div>

        </section>

    );

}