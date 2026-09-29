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

        if (
            !selecionados.length
        ) {
            return;
        }


        try {

            setProcessando(true);
            setMensagem("");

            const token =
                obterToken();

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/admin/arquivos/zip`,
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


            if (!resposta.ok) {

                const resultado =
                    await resposta
                        .json()
                        .catch(
                            () => ({})
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

        <div className="arquivosCameraMobile">

            <header className="arquivosCameraMobileTopo">

                <button
                    type="button"
                    className="arquivosCameraMobileVoltar"
                    onClick={onVoltar}
                    aria-label="Voltar"
                >
                    ‹
                </button>


                <div className="arquivosCameraMobileTitulo">

                    <span>
                        BIBLIOTECA
                    </span>

                    <strong>
                        Todos os arquivos
                    </strong>

                </div>


                <button
                    type="button"
                    className="arquivosCameraMobileAtualizar"
                    onClick={
                        carregarArquivos
                    }
                    disabled={
                        carregando ||
                        processando
                    }
                    aria-label="Atualizar"
                >
                    ↻
                </button>

            </header>


            <main className="arquivosCameraMobileConteudo">

                <section className="arquivosCameraMobileResumo">

                    <div>

                        <span>
                            ARQUIVOS
                        </span>

                        <strong>
                            {arquivos.length}
                        </strong>

                    </div>


                    {selecionados.length > 0 && (

                        <div className="arquivosCameraMobileSelecionados">

                            <strong>
                                {selecionados.length}
                            </strong>

                            <span>
                                selecionados
                            </span>

                        </div>

                    )}

                </section>


                <div className="arquivosCameraMobileAbas">

                    <button
                        type="button"
                        className={
                            agrupamento === "pessoa"
                                ? "arquivosCameraMobileAba arquivosCameraMobileAbaAtiva"
                                : "arquivosCameraMobileAba"
                        }
                        onClick={() =>
                            setAgrupamento(
                                "pessoa"
                            )
                        }
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
                            setAgrupamento(
                                "data"
                            )
                        }
                    >
                        Datas
                    </button>

                </div>


                {arquivos.length > 0 && (

                    <section className="arquivosCameraMobileSelecao">

                        <button
                            type="button"
                            onClick={
                                selecionarTudo
                            }
                        >
                            {selecionados.length ===
                                arquivos.length
                                ? "Desmarcar tudo"
                                : "Selecionar tudo"}
                        </button>


                        {selecionados.length > 0 && (

                            <div>

                                <button
                                    type="button"
                                    onClick={
                                        baixarSelecionados
                                    }
                                    disabled={
                                        processando
                                    }
                                >
                                    ↓ ZIP
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        apagarSelecionados
                                    }
                                    disabled={
                                        processando
                                    }
                                >
                                    × Apagar
                                </button>

                            </div>

                        )}

                    </section>

                )}


                {mensagem && (

                    <div className="arquivosCameraMobileMensagem">

                        {mensagem}

                    </div>

                )}


                {carregando ? (

                    <div className="arquivosCameraMobileCarregando">

                        <div />

                        <strong>
                            Carregando arquivos
                        </strong>

                        <span>
                            Aguarde...
                        </span>

                    </div>

                ) : pastas.length === 0 ? (

                    <div className="arquivosCameraMobileVazio">

                        <div>
                            ▦
                        </div>

                        <strong>
                            Nenhum arquivo
                        </strong>

                        <span>
                            As fotos e vídeos enviados
                            pelas câmeras aparecerão aqui.
                        </span>

                    </div>

                ) : (

                    <div className="arquivosCameraMobilePastas">

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
                                            selecionados.includes(
                                                id
                                            )
                                    );


                                return (

                                    <section
                                        key={
                                            pasta.chave
                                        }
                                        className="arquivosCameraMobilePasta"
                                    >

                                        <div className="arquivosCameraMobilePastaTopo">

                                            <button
                                                type="button"
                                                className="arquivosCameraMobilePastaAbrir"
                                                onClick={() =>
                                                    alternarPasta(
                                                        pasta.chave
                                                    )
                                                }
                                            >

                                                <span>
                                                    {aberta
                                                        ? "⌄"
                                                        : "›"}
                                                </span>


                                                <div>

                                                    <strong>
                                                        {pasta.titulo}
                                                    </strong>

                                                    <small>
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
                                            >
                                                {todosSelecionados
                                                    ? "✓"
                                                    : "Selecionar"}
                                            </button>

                                        </div>


                                        {aberta && (

                                            <div className="arquivosCameraMobileGrid">

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
                                                                key={
                                                                    arquivo.id
                                                                }
                                                                className={
                                                                    selecionado
                                                                        ? "arquivosCameraMobileCard arquivosCameraMobileCardSelecionado"
                                                                        : "arquivosCameraMobileCard"
                                                                }
                                                            >

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
                                                                >
                                                                    {selecionado
                                                                        ? "✓"
                                                                        : ""}
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="arquivosCameraMobilePreview"
                                                                    onClick={() =>
                                                                        abrirVisualizacao(
                                                                            arquivo
                                                                        )
                                                                    }
                                                                >

                                                                    {video ? (

                                                                        <video
                                                                            src={
                                                                                arquivo.arquivo_url
                                                                            }
                                                                            muted
                                                                            playsInline
                                                                            preload="metadata"
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
                                                                        />

                                                                    )}


                                                                    <span>

                                                                        {video
                                                                            ? "VÍDEO"
                                                                            : "FOTO"}

                                                                    </span>

                                                                </button>


                                                                <div className="arquivosCameraMobileInfo">

                                                                    <strong>
                                                                        {arquivo.cadastrado_nome ||
                                                                            "Sem nome"}
                                                                    </strong>

                                                                    <small>
                                                                        {formatarDataHora(
                                                                            arquivo.data
                                                                        )}
                                                                    </small>

                                                                    <small>
                                                                        {formatarTamanho(
                                                                            arquivo.tamanho
                                                                        )}
                                                                    </small>

                                                                </div>


                                                                <div className="arquivosCameraMobileAcoes">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            baixarArquivo(
                                                                                arquivo
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            processando
                                                                        }
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
                                                                        disabled={
                                                                            processando
                                                                        }
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


            {arquivoVisualizando && (

                <div
                    className="arquivosCameraMobileVisualizador"
                    onClick={
                        fecharVisualizacao
                    }
                >

                    <button
                        type="button"
                        className="arquivosCameraMobileFechar"
                        onClick={
                            fecharVisualizacao
                        }
                    >
                        ×
                    </button>


                    <button
                        type="button"
                        className="arquivosCameraMobileAnterior"
                        onClick={evento => {

                            evento.stopPropagation();

                            navegarArquivo(-1);

                        }}
                    >
                        ‹
                    </button>


                    <div
                        className="arquivosCameraMobileMidia"
                        onClick={evento =>
                            evento.stopPropagation()
                        }
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
                            />

                        )}

                    </div>


                    <button
                        type="button"
                        className="arquivosCameraMobileProximo"
                        onClick={evento => {

                            evento.stopPropagation();

                            navegarArquivo(1);

                        }}
                    >
                        ›
                    </button>


                    <div
                        className="arquivosCameraMobileVisualizadorInfo"
                        onClick={evento =>
                            evento.stopPropagation()
                        }
                    >

                        <strong>
                            {arquivoVisualizando.cadastrado_nome ||
                                "Arquivo"}
                        </strong>

                        <span>
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