import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    API_URL
} from "../config";

import "./arquivos.css";


export default function ArquivosCameraMobile({
    onVoltar
}) {

    const [
        arquivos,
        setArquivos
    ] = useState([]);

    const [
        carregando,
        setCarregando
    ] = useState(true);

    const [
        mensagem,
        setMensagem
    ] = useState("");

    const [
        agrupamento,
        setAgrupamento
    ] = useState("pessoa");

    const [
        pastasAbertas,
        setPastasAbertas
    ] = useState({});

    const [
        selecionados,
        setSelecionados
    ] = useState([]);

    const [
        processando,
        setProcessando
    ] = useState(false);

    const [
        arquivoVisualizando,
        setArquivoVisualizando
    ] = useState(null);


    /* =====================================================
       TOKEN
    ===================================================== */

    function obterToken() {

        return localStorage.getItem(
            "token"
        );

    }


    /* =====================================================
       CARREGAR
    ===================================================== */

    async function carregarArquivos() {

        try {

            setCarregando(true);
            setMensagem("");

            const token =
                obterToken();

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/admin/arquivos`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const resultado =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!resposta.ok) {

                throw new Error(
                    resultado.detail ||
                    "Não foi possível carregar os arquivos."
                );

            }


            setArquivos(
                resultado.arquivos ||
                []
            );

        } catch (erro) {

            console.error(
                "[ARQUIVOS MOBILE] Erro:",
                erro
            );

            setMensagem(
                erro.message ||
                "Não foi possível carregar os arquivos."
            );

        } finally {

            setCarregando(false);

        }

    }


    useEffect(() => {

        carregarArquivos();

    }, []);


    /* =====================================================
       DATA
    ===================================================== */

    function formatarData(data) {

        if (!data) {
            return "Sem data";
        }

        const valor =
            new Date(data);

        if (
            Number.isNaN(
                valor.getTime()
            )
        ) {
            return String(data);
        }

        return valor.toLocaleDateString(
            "pt-BR"
        );

    }


    function formatarDataHora(data) {

        if (!data) {
            return "";
        }

        const valor =
            new Date(data);

        if (
            Number.isNaN(
                valor.getTime()
            )
        ) {
            return String(data);
        }

        return valor.toLocaleString(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    }


    function formatarTamanho(tamanho) {

        const valor =
            Number(tamanho);

        if (
            !Number.isFinite(valor)
        ) {
            return "0 MB";
        }

        if (valor < 1) {

            return `${Math.round(valor * 1024)} KB`;

        }

        return `${valor.toFixed(1).replace(".", ",")} MB`;

    }


    function arquivoEhVideo(arquivo) {

        if (
            arquivo?.tipo ===
            "video"
        ) {
            return true;
        }

        const url =
            String(
                arquivo?.arquivo_url ||
                ""
            )
                .split("?")[0]
                .toLowerCase();

        return (
            url.endsWith(".mp4") ||
            url.endsWith(".webm") ||
            url.endsWith(".mov")
        );

    }


    /* =====================================================
       PASTAS
    ===================================================== */

    const pastas =
        useMemo(() => {

            const resultado = {};

            arquivos.forEach(
                arquivo => {

                    let chave;
                    let titulo;

                    if (
                        agrupamento ===
                        "pessoa"
                    ) {

                        chave =
                            `pessoa-${arquivo.cadastrado_id || "sem"}`;

                        titulo =
                            arquivo.cadastrado_nome ||
                            "Sem nome";

                    } else {

                        const data =
                            formatarData(
                                arquivo.data
                            );

                        chave =
                            `data-${data}`;

                        titulo =
                            data;

                    }


                    if (
                        !resultado[chave]
                    ) {

                        resultado[chave] = {
                            chave,
                            titulo,
                            arquivos: []
                        };

                    }


                    resultado[chave]
                        .arquivos
                        .push(
                            arquivo
                        );

                }
            );


            return Object.values(
                resultado
            );

        }, [
            arquivos,
            agrupamento
        ]);


    /* =====================================================
       PASTAS
    ===================================================== */

    function alternarPasta(
        chave
    ) {

        setPastasAbertas(
            anteriores => ({
                ...anteriores,
                [chave]:
                    !anteriores[chave]
            })
        );

    }


    /* =====================================================
       SELEÇÃO
    ===================================================== */

    function estaSelecionado(
        id
    ) {

        return selecionados.includes(
            id
        );

    }


    function alternarSelecao(
        id
    ) {

        setSelecionados(
            anteriores => {

                if (
                    anteriores.includes(id)
                ) {

                    return anteriores.filter(
                        item =>
                            item !== id
                    );

                }


                return [
                    ...anteriores,
                    id
                ];

            }
        );

    }


    function selecionarPasta(
        arquivosPasta
    ) {

        const ids =
            arquivosPasta.map(
                arquivo =>
                    arquivo.id
            );


        const todos =
            ids.every(
                id =>
                    selecionados.includes(
                        id
                    )
            );


        if (todos) {

            setSelecionados(
                anteriores =>
                    anteriores.filter(
                        id =>
                            !ids.includes(id)
                    )
            );

            return;

        }


        setSelecionados(
            anteriores =>
                Array.from(
                    new Set([
                        ...anteriores,
                        ...ids
                    ])
                )
        );

    }


    function selecionarTudo() {

        if (
            selecionados.length ===
            arquivos.length
        ) {

            setSelecionados([]);

            return;

        }


        setSelecionados(
            arquivos.map(
                arquivo =>
                    arquivo.id
            )
        );

    }


    /* =====================================================
       DOWNLOAD
    ===================================================== */

    function salvarBlob(
        blob,
        nome
    ) {

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            nome;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

    }


    async function baixarArquivo(
        arquivo
    ) {

        try {

            setProcessando(true);
            setMensagem("");

            const token =
                obterToken();

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/admin/arquivo/${arquivo.id}/download`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            if (!resposta.ok) {

                const resultado =
                    await resposta
                        .json()
                        .catch(
                            () => ({})
                        );

                throw new Error(
                    resultado.detail ||
                    "Não foi possível baixar."
                );

            }


            const blob =
                await resposta.blob();


            const caminho =
                String(
                    arquivo.arquivo_url ||
                    ""
                )
                    .split("?")[0];


            const nome =
                caminho
                    .split("/")
                    .pop() ||
                `arquivo-${arquivo.id}`;


            salvarBlob(
                blob,
                nome
            );

        } catch (erro) {

            setMensagem(
                erro.message
            );

        } finally {

            setProcessando(false);

        }

    }


    /* =====================================================
       ZIP
    ===================================================== */

    async function baixarSelecionados() {

        if (!selecionados.length) {
            return;
        }

        try {

            setProcessando(true);
            setMensagem("");

            const token = obterToken();

            // =====================================================
            // NORMALIZAR IDS
            // =====================================================

            const ids = Array.from(
                new Set(
                    selecionados
                        .map(id => Number(id))
                        .filter(
                            id =>
                                Number.isInteger(id) &&
                                id > 0
                        )
                )
            );

            if (!ids.length) {

                throw new Error(
                    "Nenhum arquivo válido foi selecionado."
                );
            }

            console.log(
                "[CÂMERA ADMIN] IDs enviados para ZIP:",
                ids
            );

            const resposta = await fetch(
                `${API_URL}/camera-publica/admin/arquivos/zip`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/zip"
                    },

                    body: JSON.stringify({
                        ids: ids
                    })
                }
            );

            if (!resposta.ok) {

                const resultado =
                    await resposta
                        .json()
                        .catch(
                            () => ({})
                        );

                console.error(
                    "[CÂMERA ADMIN] Erro ZIP:",
                    resultado
                );

                throw new Error(
                    resultado.detail ||
                    "Não foi possível gerar o ZIP."
                );
            }

            const blob =
                await resposta.blob();

            salvarBlob(
                blob,
                "arquivos-camera.zip"
            );

        } catch (erro) {

            console.error(
                "[CÂMERA ADMIN] Erro ao baixar ZIP:",
                erro
            );

            setMensagem(
                erro.message
            );

        } finally {

            setProcessando(false);

        }
    }

    /* =====================================================
       APAGAR
    ===================================================== */

    async function apagarArquivo(
        arquivo
    ) {

        const confirmar =
            window.confirm(
                "Deseja apagar este arquivo permanentemente?"
            );


        if (!confirmar) {
            return;
        }


        try {

            setProcessando(true);
            setMensagem("");

            const token =
                obterToken();

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/admin/arquivo/${arquivo.id}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const resultado =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!resposta.ok) {

                throw new Error(
                    resultado.detail ||
                    "Não foi possível apagar."
                );

            }


            setArquivos(
                anteriores =>
                    anteriores.filter(
                        item =>
                            item.id !==
                            arquivo.id
                    )
            );


            setSelecionados(
                anteriores =>
                    anteriores.filter(
                        id =>
                            id !==
                            arquivo.id
                    )
            );

        } catch (erro) {

            setMensagem(
                erro.message
            );

        } finally {

            setProcessando(false);

        }

    }


    async function apagarSelecionados() {

        if (
            !selecionados.length
        ) {
            return;
        }


        const confirmar =
            window.confirm(
                `Apagar permanentemente ${selecionados.length} arquivo(s)?`
            );


        if (!confirmar) {
            return;
        }


        try {

            setProcessando(true);
            setMensagem("");

            const token =
                obterToken();

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/admin/arquivos/apagar`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                ids:
                                    selecionados
                            })
                    }
                );


            const resultado =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!resposta.ok) {

                throw new Error(
                    resultado.detail ||
                    "Não foi possível apagar."
                );

            }


            setArquivos(
                anteriores =>
                    anteriores.filter(
                        arquivo =>
                            !selecionados.includes(
                                arquivo.id
                            )
                    )
            );


            setSelecionados([]);

        } catch (erro) {

            setMensagem(
                erro.message
            );

        } finally {

            setProcessando(false);

        }

    }


    /* =====================================================
       VISUALIZADOR
    ===================================================== */

    function abrirVisualizacao(
        arquivo
    ) {

        setArquivoVisualizando(
            arquivo
        );

    }


    function fecharVisualizacao() {

        setArquivoVisualizando(
            null
        );

    }


    function navegarArquivo(
        direcao
    ) {

        if (
            !arquivoVisualizando ||
            !arquivos.length
        ) {
            return;
        }


        const indice =
            arquivos.findIndex(
                arquivo =>
                    arquivo.id ===
                    arquivoVisualizando.id
            );


        if (
            indice === -1
        ) {
            return;
        }


        let novoIndice =
            indice + direcao;


        if (
            novoIndice < 0
        ) {

            novoIndice =
                arquivos.length - 1;

        }


        if (
            novoIndice >=
            arquivos.length
        ) {

            novoIndice = 0;

        }


        setArquivoVisualizando(
            arquivos[novoIndice]
        );

    }


    /* =====================================================
       JSX
    ===================================================== */

    return (

        <div
            className="aaaarquivosCameraMobile"
            style={{
                width: "100%",
                minHeight: "100vh",
                boxSizing: "border-box",
                background: "#f4f7fb",
                color: "#0f172a",
                fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
                padding: "0",
                overflowX: "hidden"
            }}
        >

            {/* =====================================================
            TOPO
        ===================================================== */}

            <header
                className="aaaarquivosCameraMobileTopo"
                style={{
                    width: "100%",
                    minHeight: "76px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 22px",
                    boxSizing: "border-box",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.05)",
                    position: "relative",
                    zIndex: 10
                }}
            >

                {/* VOLTAR */}

                <button
                    type="button"
                    className="aaaarquivosCameraMobileVoltar"
                    onClick={onVoltar}
                    aria-label="Voltar"
                    style={{
                        width: "42px",
                        height: "42px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #dbe3ec",
                        borderRadius: "10px",
                        background: "#ffffff",
                        color: "#1e293b",
                        fontSize: "27px",
                        fontWeight: "400",
                        lineHeight: 1,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                >
                    ‹
                </button>


                {/* IDENTIDADE */}

                <div
                    className="aaaarquivosCameraMobileTitulo"
                    style={{
                        minWidth: 0,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px"
                    }}
                >

                    <span
                        style={{
                            color: "#2563eb",
                            fontSize: "9px",
                            fontWeight: 800,
                            letterSpacing: "1.4px",
                            lineHeight: 1
                        }}
                    >
                        BIBLIOTECA
                    </span>

                    <strong
                        style={{
                            color: "#0f172a",
                            fontSize: "19px",
                            fontWeight: 800,
                            lineHeight: 1.15,
                            letterSpacing: "-0.4px"
                        }}
                    >
                        Todos os arquivos
                    </strong>

                </div>


                {/* ATUALIZAR */}

                <button
                    type="button"
                    className="aaaarquivosCameraMobileAtualizar"
                    onClick={carregarArquivos}
                    disabled={carregando || processando}
                    aria-label="Atualizar"
                    style={{
                        width: "42px",
                        height: "42px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #dbe3ec",
                        borderRadius: "10px",
                        background: "#ffffff",
                        color: "#2563eb",
                        fontSize: "20px",
                        fontWeight: 700,
                        cursor: carregando || processando
                            ? "not-allowed"
                            : "pointer",
                        opacity: carregando || processando
                            ? 0.5
                            : 1,
                        transition: "all 0.2s ease"
                    }}
                >
                    ↻
                </button>

            </header>


            {/* =====================================================
            CONTEÚDO
        ===================================================== */}

            <main
                className="aaaarquivosCameraMobileConteudo"
                style={{
                    width: "100%",
                    maxWidth: "1450px",
                    margin: "0 auto",
                    padding: "24px",
                    boxSizing: "border-box"
                }}
            >

                {/* =================================================
                RESUMO
            ================================================= */}

                <section
                    className="aaaarquivosCameraMobileResumo"
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "18px",
                        marginBottom: "18px",
                        padding: "20px 22px",
                        boxSizing: "border-box",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.045)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px"
                        }}
                    >

                        <span
                            style={{
                                color: "#64748b",
                                fontSize: "9px",
                                fontWeight: 800,
                                letterSpacing: "1px"
                            }}
                        >
                            ARQUIVOS
                        </span>

                        <strong
                            style={{
                                color: "#0f172a",
                                fontSize: "25px",
                                fontWeight: 800,
                                lineHeight: 1
                            }}
                        >
                            {arquivos.length}
                        </strong>

                    </div>


                    {selecionados.length > 0 && (

                        <div
                            className="aaaarquivosCameraMobileSelecionados"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                padding: "9px 13px",
                                border: "1px solid #bfdbfe",
                                borderRadius: "9px",
                                background: "#eff6ff",
                                color: "#1d4ed8"
                            }}
                        >

                            <strong
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 800
                                }}
                            >
                                {selecionados.length}
                            </strong>

                            <span
                                style={{
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }}
                            >
                                selecionados
                            </span>

                        </div>

                    )}

                </section>


                {/* =================================================
                ABAS
            ================================================= */}

                <div
                    className="aaaarquivosCameraMobileAbas"
                    style={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "5px",
                        marginBottom: "14px",
                        padding: "4px",
                        boxSizing: "border-box",
                        background: "#e8edf3",
                        borderRadius: "10px"
                    }}
                >

                    <button
                        type="button"
                        className={
                            agrupamento === "pessoa"
                                ? "arquivosCameraMobileAba arquivosCameraMobileAbaAtiva"
                                : "arquivosCameraMobileAba"
                        }
                        onClick={() =>
                            setAgrupamento("pessoa")
                        }
                        style={{
                            minHeight: "40px",
                            border: "0",
                            borderRadius: "7px",
                            background:
                                agrupamento === "pessoa"
                                    ? "#ffffff"
                                    : "transparent",
                            color:
                                agrupamento === "pessoa"
                                    ? "#2563eb"
                                    : "#64748b",
                            fontFamily: "inherit",
                            fontSize: "10px",
                            fontWeight: 750,
                            cursor: "pointer",
                            boxShadow:
                                agrupamento === "pessoa"
                                    ? "0 2px 7px rgba(15, 23, 42, 0.08)"
                                    : "none",
                            transition: "all 0.2s ease"
                        }}
                    >
                        Pessoas
                    </button>


                    <button
                        type="button"
                        className={
                            agrupamento === "data"
                                ? "arquivosCameraMobileAba arquivosCameraMobileAbaAtiva"
                                : "arquivosCameraMobileAba"
                        }
                        onClick={() =>
                            setAgrupamento("data")
                        }
                        style={{
                            minHeight: "40px",
                            border: "0",
                            borderRadius: "7px",
                            background:
                                agrupamento === "data"
                                    ? "#ffffff"
                                    : "transparent",
                            color:
                                agrupamento === "data"
                                    ? "#2563eb"
                                    : "#64748b",
                            fontFamily: "inherit",
                            fontSize: "10px",
                            fontWeight: 750,
                            cursor: "pointer",
                            boxShadow:
                                agrupamento === "data"
                                    ? "0 2px 7px rgba(15, 23, 42, 0.08)"
                                    : "none",
                            transition: "all 0.2s ease"
                        }}
                    >
                        Datas
                    </button>

                </div>


                {/* =================================================
                SELEÇÃO
            ================================================= */}

                {arquivos.length > 0 && (

                    <section
                        className="aaaarquivosCameraMobileSelecao"
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginBottom: "18px",
                            padding: "12px",
                            boxSizing: "border-box",
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "11px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={selecionarTudo}
                            style={{
                                minHeight: "36px",
                                padding: "0 13px",
                                border: "1px solid #dbe3ec",
                                borderRadius: "8px",
                                background: "#ffffff",
                                color: "#1e293b",
                                fontFamily: "inherit",
                                fontSize: "9px",
                                fontWeight: 750,
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {selecionados.length === arquivos.length
                                ? "✓ Desmarcar tudo"
                                : "□ Selecionar tudo"}
                        </button>


                        {selecionados.length > 0 && (

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "7px",
                                    marginLeft: "auto"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={baixarSelecionados}
                                    disabled={processando}
                                    style={{
                                        minHeight: "36px",
                                        padding: "0 14px",
                                        border: "1px solid #2563eb",
                                        borderRadius: "8px",
                                        background: "#2563eb",
                                        color: "#ffffff",
                                        fontFamily: "inherit",
                                        fontSize: "9px",
                                        fontWeight: 750,
                                        cursor: processando
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: processando
                                            ? 0.55
                                            : 1,
                                        boxShadow:
                                            "0 3px 8px rgba(37, 99, 235, 0.18)"
                                    }}
                                >
                                    ↓ ZIP
                                </button>


                                <button
                                    type="button"
                                    onClick={apagarSelecionados}
                                    disabled={processando}
                                    style={{
                                        minHeight: "36px",
                                        padding: "0 14px",
                                        border: "1px solid #fecaca",
                                        borderRadius: "8px",
                                        background: "#fff",
                                        color: "#b91c1c",
                                        fontFamily: "inherit",
                                        fontSize: "9px",
                                        fontWeight: 750,
                                        cursor: processando
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: processando
                                            ? 0.55
                                            : 1
                                    }}
                                >
                                    × Apagar
                                </button>

                            </div>

                        )}

                    </section>

                )}


                {/* =================================================
                MENSAGEM
            ================================================= */}

                {mensagem && (

                    <div
                        className="aaaarquivosCameraMobileMensagem"
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "18px",
                            padding: "13px 15px",
                            boxSizing: "border-box",
                            border: "1px solid #fecaca",
                            borderLeft: "3px solid #dc2626",
                            borderRadius: "9px",
                            background: "#fef2f2",
                            color: "#991b1b",
                            fontSize: "10px",
                            fontWeight: 650,
                            lineHeight: 1.4
                        }}
                    >

                        <span
                            style={{
                                width: "22px",
                                height: "22px",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#fee2e2",
                                color: "#dc2626",
                                fontWeight: 800
                            }}
                        >
                            !
                        </span>

                        <span>
                            {mensagem}
                        </span>

                    </div>

                )}


                {/* =================================================
                LOADING
            ================================================= */}

                {carregando ? (

                    <div
                        className="aaaarquivosCameraMobileCarregando"
                        style={{
                            width: "100%",
                            minHeight: "320px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "14px",
                            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)"
                        }}
                    >

                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                border: "3px solid #dbeafe",
                                borderTopColor: "#2563eb",
                                borderRadius: "50%",
                                animation: "arquivosCameraMobileSpin 0.8s linear infinite"
                            }}
                        />

                        <strong
                            style={{
                                color: "#0f172a",
                                fontSize: "12px",
                                fontWeight: 750
                            }}
                        >
                            Carregando arquivos
                        </strong>

                        <span
                            style={{
                                color: "#64748b",
                                fontSize: "10px"
                            }}
                        >
                            Aguarde...
                        </span>

                    </div>

                ) : pastas.length === 0 ? (

                    /* =================================================
                       VAZIO
                    ================================================= */

                    <div
                        className="aaaarquivosCameraMobileVazio"
                        style={{
                            width: "100%",
                            minHeight: "330px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "9px",
                            padding: "40px 25px",
                            boxSizing: "border-box",
                            background: "#ffffff",
                            border: "1px dashed #cbd5e1",
                            borderRadius: "14px"
                        }}
                    >

                        <div
                            style={{
                                width: "66px",
                                height: "66px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "7px",
                                borderRadius: "15px",
                                background: "#eff6ff",
                                color: "#2563eb",
                                fontSize: "28px",
                                boxShadow:
                                    "inset 0 0 0 1px #dbeafe"
                            }}
                        >
                            ▦
                        </div>

                        <strong
                            style={{
                                color: "#0f172a",
                                fontSize: "14px",
                                fontWeight: 800
                            }}
                        >
                            Nenhum arquivo
                        </strong>

                        <span
                            style={{
                                maxWidth: "420px",
                                color: "#64748b",
                                fontSize: "10px",
                                fontWeight: 500,
                                lineHeight: 1.5,
                                textAlign: "center"
                            }}
                        >
                            As fotos e vídeos enviados pelas câmeras aparecerão aqui.
                        </span>

                    </div>

                ) : (

                    /* =================================================
                       PASTAS
                    ================================================= */

                    <div
                        className="aaaarquivosCameraMobilePastas"
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px"
                        }}
                    >

                        {pastas.map(
                            pasta => {

                                const aberta =
                                    pastasAbertas[
                                    pasta.chave
                                    ] !== false;


                                const ids =
                                    pasta.arquivos.map(
                                        arquivo =>
                                            arquivo.id
                                    );


                                const todosSelecionados =
                                    ids.length > 0 &&
                                    ids.every(
                                        id =>
                                            selecionados.includes(id)
                                    );


                                return (

                                    <section
                                        key={pasta.chave}
                                        className="aaaarquivosCameraMobilePasta"
                                        style={{
                                            width: "100%",
                                            overflow: "hidden",
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "14px",
                                            boxShadow:
                                                "0 4px 15px rgba(15, 23, 42, 0.045)"
                                        }}
                                    >

                                        {/* =========================
                                        CABEÇALHO PASTA
                                    ========================= */}

                                        <div
                                            className="aaaarquivosCameraMobilePastaTopo"
                                            style={{
                                                width: "100%",
                                                minHeight: "70px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: "14px",
                                                padding: "12px 15px",
                                                boxSizing: "border-box",
                                                borderBottom: aberta
                                                    ? "1px solid #edf1f5"
                                                    : "0",
                                                background: "#ffffff"
                                            }}
                                        >

                                            <button
                                                type="button"
                                                className="aaaarquivosCameraMobilePastaAbrir"
                                                onClick={() =>
                                                    alternarPasta(
                                                        pasta.chave
                                                    )
                                                }
                                                style={{
                                                    minWidth: 0,
                                                    flex: 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    padding: "0",
                                                    border: "0",
                                                    background: "transparent",
                                                    color: "#0f172a",
                                                    textAlign: "left",
                                                    cursor: "pointer",
                                                    fontFamily: "inherit"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        width: "30px",
                                                        height: "30px",
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        borderRadius: "8px",
                                                        background: "#eff6ff",
                                                        color: "#2563eb",
                                                        fontSize: "17px",
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    {aberta
                                                        ? "⌄"
                                                        : "›"}
                                                </span>


                                                <div
                                                    style={{
                                                        width: "34px",
                                                        height: "34px",
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        borderRadius: "9px",
                                                        background: "#2563eb",
                                                        color: "#ffffff",
                                                        fontSize: "13px",
                                                        fontWeight: 800,
                                                        textTransform: "uppercase"
                                                    }}
                                                >
                                                    {pasta.titulo
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "?"}
                                                </div>


                                                <div
                                                    style={{
                                                        minWidth: 0,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "3px"
                                                    }}
                                                >

                                                    <strong
                                                        style={{
                                                            overflow: "hidden",
                                                            color: "#0f172a",
                                                            fontSize: "11px",
                                                            fontWeight: 750,
                                                            whiteSpace: "nowrap",
                                                            textOverflow: "ellipsis"
                                                        }}
                                                    >
                                                        {pasta.titulo}
                                                    </strong>

                                                    <small
                                                        style={{
                                                            color: "#64748b",
                                                            fontSize: "9px",
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {pasta.arquivos.length}
                                                        {" "}
                                                        arquivo(s)
                                                    </small>

                                                </div>

                                            </button>


                                            <button
                                                type="button"
                                                className={
                                                    todosSelecionados
                                                        ? "arquivosCameraMobilePastaSelecionar arquivosCameraMobilePastaSelecionarAtivo"
                                                        : "arquivosCameraMobilePastaSelecionar"
                                                }
                                                onClick={() =>
                                                    selecionarPasta(
                                                        pasta.arquivos
                                                    )
                                                }
                                                style={{
                                                    minHeight: "34px",
                                                    flexShrink: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "5px",
                                                    padding: "0 11px",
                                                    border: todosSelecionados
                                                        ? "1px solid #2563eb"
                                                        : "1px solid #dbe3ec",
                                                    borderRadius: "8px",
                                                    background: todosSelecionados
                                                        ? "#eff6ff"
                                                        : "#ffffff",
                                                    color: todosSelecionados
                                                        ? "#1d4ed8"
                                                        : "#475569",
                                                    fontFamily: "inherit",
                                                    fontSize: "8px",
                                                    fontWeight: 750,
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {todosSelecionados
                                                    ? "✓"
                                                    : "Selecionar"}
                                            </button>

                                        </div>


                                        {/* =========================
                                        GRID
                                    ========================= */}

                                        {aberta && (

                                            <div
                                                className="aaaarquivosCameraMobileGrid"
                                                style={{
                                                    width: "100%",
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fill, minmax(220px, 1fr))",
                                                    gap: "12px",
                                                    padding: "14px",
                                                    boxSizing: "border-box",
                                                    background: "#f8fafc"
                                                }}
                                            >

                                                {pasta.arquivos.map(
                                                    arquivo => {

                                                        const selecionado =
                                                            estaSelecionado(
                                                                arquivo.id
                                                            );


                                                        const video =
                                                            arquivoEhVideo(
                                                                arquivo
                                                            );


                                                        return (

                                                            <article
                                                                key={arquivo.id}
                                                                className={
                                                                    selecionado
                                                                        ? "arquivosCameraMobileCard arquivosCameraMobileCardSelecionado"
                                                                        : "arquivosCameraMobileCard"
                                                                }
                                                                style={{
                                                                    position: "relative",
                                                                    minWidth: 0,
                                                                    overflow: "hidden",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    background: "#ffffff",
                                                                    border: selecionado
                                                                        ? "2px solid #2563eb"
                                                                        : "1px solid #e2e8f0",
                                                                    borderRadius: "11px",
                                                                    boxShadow: selecionado
                                                                        ? "0 5px 18px rgba(37, 99, 235, 0.13)"
                                                                        : "0 2px 8px rgba(15, 23, 42, 0.035)"
                                                                }}
                                                            >

                                                                {/* CHECK */}

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        selecionado
                                                                            ? "arquivosCameraMobileCheck arquivosCameraMobileCheckAtivo"
                                                                            : "arquivosCameraMobileCheck"
                                                                    }
                                                                    onClick={() =>
                                                                        alternarSelecao(
                                                                            arquivo.id
                                                                        )
                                                                    }
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: "9px",
                                                                        left: "9px",
                                                                        zIndex: 5,
                                                                        width: "26px",
                                                                        height: "26px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        padding: "0",
                                                                        border: selecionado
                                                                            ? "1px solid #2563eb"
                                                                            : "1px solid rgba(255,255,255,0.9)",
                                                                        borderRadius: "7px",
                                                                        background: selecionado
                                                                            ? "#2563eb"
                                                                            : "rgba(255,255,255,0.94)",
                                                                        color: selecionado
                                                                            ? "#ffffff"
                                                                            : "#2563eb",
                                                                        fontSize: "13px",
                                                                        fontWeight: 800,
                                                                        cursor: "pointer",
                                                                        boxShadow:
                                                                            "0 3px 8px rgba(15,23,42,0.18)",
                                                                        backdropFilter:
                                                                            "blur(5px)"
                                                                    }}
                                                                >
                                                                    {selecionado
                                                                        ? "✓"
                                                                        : ""}
                                                                </button>


                                                                {/* PREVIEW */}

                                                                <button
                                                                    type="button"
                                                                    className="aaaarquivosCameraMobilePreview"
                                                                    onClick={() =>
                                                                        abrirVisualizacao(
                                                                            arquivo
                                                                        )
                                                                    }
                                                                    style={{
                                                                        position: "relative",
                                                                        width: "100%",
                                                                        height: "180px",
                                                                        display: "block",
                                                                        padding: "0",
                                                                        overflow: "hidden",
                                                                        border: "0",
                                                                        background: "#e2e8f0",
                                                                        cursor: "pointer"
                                                                    }}
                                                                >

                                                                    {video ? (

                                                                        <video
                                                                            src={
                                                                                arquivo.arquivo_url
                                                                            }
                                                                            muted
                                                                            playsInline
                                                                            preload="metadata"
                                                                            style={{
                                                                                display: "block",
                                                                                width: "100%",
                                                                                height: "100%",
                                                                                objectFit: "cover",
                                                                                background: "#e2e8f0"
                                                                            }}
                                                                        />

                                                                    ) : (

                                                                        <img
                                                                            src={
                                                                                arquivo.arquivo_url
                                                                            }
                                                                            alt={
                                                                                arquivo.cadastrado_nome ||
                                                                                "Foto"
                                                                            }
                                                                            loading="lazy"
                                                                            style={{
                                                                                display: "block",
                                                                                width: "100%",
                                                                                height: "100%",
                                                                                objectFit: "cover",
                                                                                background: "#e2e8f0"
                                                                            }}
                                                                        />

                                                                    )}


                                                                    <span
                                                                        style={{
                                                                            position: "absolute",
                                                                            right: "8px",
                                                                            bottom: "8px",
                                                                            minHeight: "22px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            padding: "0 7px",
                                                                            border: "1px solid rgba(255,255,255,0.25)",
                                                                            borderRadius: "5px",
                                                                            background: "rgba(15,23,42,0.78)",
                                                                            color: "#ffffff",
                                                                            fontSize: "7px",
                                                                            fontWeight: 800,
                                                                            letterSpacing: "0.7px",
                                                                            backdropFilter: "blur(5px)"
                                                                        }}
                                                                    >
                                                                        {video
                                                                            ? "VÍDEO"
                                                                            : "FOTO"}
                                                                    </span>

                                                                </button>


                                                                {/* INFO */}

                                                                <div
                                                                    className="aaaarquivosCameraMobileInfo"
                                                                    style={{
                                                                        minWidth: 0,
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        gap: "6px",
                                                                        padding: "11px 12px 9px"
                                                                    }}
                                                                >

                                                                    <strong
                                                                        style={{
                                                                            overflow: "hidden",
                                                                            color: "#0f172a",
                                                                            fontSize: "10px",
                                                                            fontWeight: 750,
                                                                            whiteSpace: "nowrap",
                                                                            textOverflow: "ellipsis"
                                                                        }}
                                                                    >
                                                                        {arquivo.cadastrado_nome ||
                                                                            "Sem nome"}
                                                                    </strong>


                                                                    <small
                                                                        style={{
                                                                            color: "#64748b",
                                                                            fontSize: "8px",
                                                                            fontWeight: 550,
                                                                            lineHeight: 1.3
                                                                        }}
                                                                    >
                                                                        {formatarDataHora(
                                                                            arquivo.data
                                                                        )}
                                                                    </small>


                                                                    <small
                                                                        style={{
                                                                            width: "fit-content",
                                                                            padding: "3px 6px",
                                                                            border: "1px solid #dbeafe",
                                                                            borderRadius: "5px",
                                                                            background: "#eff6ff",
                                                                            color: "#1d4ed8",
                                                                            fontSize: "8px",
                                                                            fontWeight: 700
                                                                        }}
                                                                    >
                                                                        {formatarTamanho(
                                                                            arquivo.tamanho
                                                                        )}
                                                                    </small>

                                                                </div>


                                                                {/* AÇÕES */}

                                                                <div
                                                                    className="aaaarquivosCameraMobileAcoes"
                                                                    style={{
                                                                        width: "100%",
                                                                        display: "grid",
                                                                        gridTemplateColumns: "1fr 1fr",
                                                                        gap: "6px",
                                                                        padding: "0 12px 12px",
                                                                        boxSizing: "border-box"
                                                                    }}
                                                                >

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            baixarArquivo(
                                                                                arquivo
                                                                            )
                                                                        }
                                                                        disabled={processando}
                                                                        style={{
                                                                            minHeight: "33px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            gap: "4px",
                                                                            border: "1px solid #bfdbfe",
                                                                            borderRadius: "7px",
                                                                            background: "#eff6ff",
                                                                            color: "#1d4ed8",
                                                                            fontFamily: "inherit",
                                                                            fontSize: "8px",
                                                                            fontWeight: 750,
                                                                            cursor: processando
                                                                                ? "not-allowed"
                                                                                : "pointer",
                                                                            opacity: processando
                                                                                ? 0.5
                                                                                : 1
                                                                        }}
                                                                    >
                                                                        ↓

                                                                        <span>
                                                                            Baixar
                                                                        </span>

                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            apagarArquivo(
                                                                                arquivo
                                                                            )
                                                                        }
                                                                        disabled={processando}
                                                                        style={{
                                                                            minHeight: "33px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            gap: "4px",
                                                                            border: "1px solid #fecaca",
                                                                            borderRadius: "7px",
                                                                            background: "#ffffff",
                                                                            color: "#b91c1c",
                                                                            fontFamily: "inherit",
                                                                            fontSize: "8px",
                                                                            fontWeight: 750,
                                                                            cursor: processando
                                                                                ? "not-allowed"
                                                                                : "pointer",
                                                                            opacity: processando
                                                                                ? 0.5
                                                                                : 1
                                                                        }}
                                                                    >
                                                                        ×

                                                                        <span>
                                                                            Apagar
                                                                        </span>

                                                                    </button>

                                                                </div>

                                                            </article>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        )}

                                    </section>

                                );

                            }
                        )}

                    </div>

                )}

            </main>


            {/* =====================================================
            VISUALIZADOR
        ===================================================== */}

            {arquivoVisualizando && (

                <div
                    className="aaaarquivosCameraMobileVisualizador"
                    onClick={fecharVisualizacao}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 999999,
                        width: "100vw",
                        height: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "70px 80px",
                        boxSizing: "border-box",
                        background: "rgba(5, 10, 20, 0.96)",
                        backdropFilter: "blur(12px)"
                    }}
                >

                    {/* FECHAR */}

                    <button
                        type="button"
                        className="aaaarquivosCameraMobileFechar"
                        onClick={fecharVisualizacao}
                        style={{
                            position: "fixed",
                            top: "18px",
                            right: "20px",
                            zIndex: 1000001,
                            width: "46px",
                            height: "46px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.10)",
                            color: "#ffffff",
                            fontSize: "28px",
                            lineHeight: 1,
                            cursor: "pointer",
                            backdropFilter: "blur(8px)"
                        }}
                    >
                        ×
                    </button>


                    {/* ANTERIOR */}

                    <button
                        type="button"
                        className="aaaarquivosCameraMobileAnterior"
                        onClick={evento => {

                            evento.stopPropagation();

                            navegarArquivo(-1);

                        }}
                        style={{
                            position: "fixed",
                            left: "22px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1000001,
                            width: "52px",
                            height: "52px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.14)",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.10)",
                            color: "#ffffff",
                            fontSize: "38px",
                            fontWeight: 300,
                            lineHeight: 1,
                            cursor: "pointer",
                            backdropFilter: "blur(8px)"
                        }}
                    >
                        ‹
                    </button>


                    {/* MÍDIA */}

                    <div
                        className="aaaarquivosCameraMobileMidia"
                        onClick={evento =>
                            evento.stopPropagation()
                        }
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxSizing: "border-box"
                        }}
                    >

                        {arquivoEhVideo(
                            arquivoVisualizando
                        ) ? (

                            <video
                                src={
                                    arquivoVisualizando.arquivo_url
                                }
                                controls
                                autoPlay
                                playsInline
                                style={{
                                    display: "block",
                                    maxWidth: "92vw",
                                    maxHeight: "82vh",
                                    width: "auto",
                                    height: "auto",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    boxShadow:
                                        "0 25px 70px rgba(0,0,0,0.45)"
                                }}
                            />

                        ) : (

                            <img
                                src={
                                    arquivoVisualizando.arquivo_url
                                }
                                alt={
                                    arquivoVisualizando.cadastrado_nome ||
                                    "Foto"
                                }
                                style={{
                                    display: "block",
                                    maxWidth: "92vw",
                                    maxHeight: "82vh",
                                    width: "auto",
                                    height: "auto",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    boxShadow:
                                        "0 25px 70px rgba(0,0,0,0.45)"
                                }}
                            />

                        )}

                    </div>


                    {/* PRÓXIMO */}

                    <button
                        type="button"
                        className="aaaarquivosCameraMobileProximo"
                        onClick={evento => {

                            evento.stopPropagation();

                            navegarArquivo(1);

                        }}
                        style={{
                            position: "fixed",
                            right: "22px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1000001,
                            width: "52px",
                            height: "52px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.14)",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.10)",
                            color: "#ffffff",
                            fontSize: "38px",
                            fontWeight: 300,
                            lineHeight: 1,
                            cursor: "pointer",
                            backdropFilter: "blur(8px)"
                        }}
                    >
                        ›
                    </button>


                    {/* INFORMAÇÕES */}

                    <div
                        className="aaaarquivosCameraMobileVisualizadorInfo"
                        onClick={evento =>
                            evento.stopPropagation()
                        }
                        style={{
                            position: "fixed",
                            left: "50%",
                            bottom: "22px",
                            transform: "translateX(-50%)",
                            zIndex: 1000001,
                            minWidth: "280px",
                            maxWidth: "calc(100vw - 40px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "5px",
                            padding: "11px 17px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "10px",
                            background: "rgba(15,23,42,0.76)",
                            color: "#ffffff",
                            backdropFilter: "blur(12px)",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.25)"
                        }}
                    >

                        <strong
                            style={{
                                maxWidth: "100%",
                                overflow: "hidden",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: 750,
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis"
                            }}
                        >
                            {arquivoVisualizando.cadastrado_nome ||
                                "Arquivo"}
                        </strong>

                        <span
                            style={{
                                color: "rgba(255,255,255,0.62)",
                                fontSize: "8px",
                                fontWeight: 500
                            }}
                        >
                            {formatarDataHora(
                                arquivoVisualizando.data
                            )}
                        </span>

                    </div>

                </div>

            )}

        </div>

    );

}