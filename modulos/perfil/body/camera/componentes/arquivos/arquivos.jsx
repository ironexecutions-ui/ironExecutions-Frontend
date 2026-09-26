import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { API_URL } from "../../../../../../config";

import "./arquivos.css";


export default function Arquivos() {

    const [
        arquivos,
        setArquivos
    ] = useState([]);

    const [
        carregando,
        setCarregando
    ] = useState(true);

    const [
        selecionados,
        setSelecionados
    ] = useState([]);

    const [
        agrupamento,
        setAgrupamento
    ] = useState("pessoa");

    const [
        pastasAbertas,
        setPastasAbertas
    ] = useState({});

    const [
        processando,
        setProcessando
    ] = useState(false);

    const [
        mensagem,
        setMensagem
    ] = useState("");


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
                    .catch(() => ({}));

            if (!resposta.ok) {

                throw new Error(
                    resultado.detail ||
                    "Não foi possível carregar os arquivos."
                );
            }

            console.log(
                "[CÂMERA ARQUIVOS] Carregados:",
                resultado
            );

            setArquivos(
                resultado.arquivos || []
            );

        } catch (erro) {

            console.error(
                "[CÂMERA ARQUIVOS] Erro:",
                erro
            );

            setMensagem(
                erro.message
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

                    if (!resultado[chave]) {

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
       ABRIR PASTA
    ===================================================== */

    function alternarPasta(chave) {

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

    function estaSelecionado(id) {

        return selecionados.includes(
            id
        );
    }


    function alternarSelecao(id) {

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

        const todosSelecionados =
            ids.every(
                id =>
                    selecionados.includes(
                        id
                    )
            );

        setSelecionados(
            anteriores => {

                if (
                    todosSelecionados
                ) {

                    return anteriores.filter(
                        id =>
                            !ids.includes(id)
                    );
                }

                return Array.from(
                    new Set([
                        ...anteriores,
                        ...ids
                    ])
                );
            }
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
       BAIXAR BLOB
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


    /* =====================================================
       DOWNLOAD INDIVIDUAL
    ===================================================== */

    async function baixarArquivo(
        arquivo
    ) {

        try {

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
        }
    }


    /* =====================================================
       DOWNLOAD ZIP
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
                        method:
                            "POST",

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
       APAGAR INDIVIDUAL
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

            const token =
                obterToken();

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/admin/arquivo/${arquivo.id}`,
                    {
                        method:
                            "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const resultado =
                await resposta
                    .json()
                    .catch(() => ({}));

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
        }
    }


    /* =====================================================
       APAGAR VÁRIOS
    ===================================================== */

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
                        method:
                            "POST",

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
                    .catch(() => ({}));

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
       JSX
    ===================================================== */

    return (

        <div className="camera-arquivos-container">

            <div className="camera-arquivos-cabecalho">

                <div className="camera-arquivos-cabecalho-texto">

                    <span>
                        BIBLIOTECA DA CÂMERA
                    </span>

                    <h2 className="camera-arquivos-titulo">
                        Arquivos
                    </h2>

                    <p>
                        {arquivos.length} arquivo(s) armazenado(s)
                    </p>

                </div>


                <div className="camera-arquivos-modo">

                    <button
                        type="button"
                        className={
                            agrupamento === "pessoa"
                                ? "camera-arquivos-modo-botao camera-arquivos-modo-ativo"
                                : "camera-arquivos-modo-botao"
                        }
                        onClick={() =>
                            setAgrupamento(
                                "pessoa"
                            )
                        }
                    >
                        Por cadastrado
                    </button>

                    <button
                        type="button"
                        className={
                            agrupamento === "data"
                                ? "camera-arquivos-modo-botao camera-arquivos-modo-ativo"
                                : "camera-arquivos-modo-botao"
                        }
                        onClick={() =>
                            setAgrupamento(
                                "data"
                            )
                        }
                    >
                        Por data
                    </button>

                </div>

            </div>


            {mensagem && (

                <div className="camera-arquivos-mensagem">
                    {mensagem}
                </div>

            )}


            {arquivos.length > 0 && (

                <div className="camera-arquivos-barra">

                    <button
                        type="button"
                        className="camera-arquivos-selecionar-tudo"
                        onClick={
                            selecionarTudo
                        }
                    >
                        {selecionados.length === arquivos.length
                            ? "Desmarcar tudo"
                            : "Selecionar tudo"}
                    </button>


                    <div className="camera-arquivos-barra-total">

                        <strong>
                            {selecionados.length}
                        </strong>

                        <span>
                            selecionado(s)
                        </span>

                    </div>


                    {selecionados.length > 0 && (

                        <div className="camera-arquivos-acoes-selecao">

                            <button
                                type="button"
                                className="camera-arquivos-baixar-varios"
                                onClick={
                                    baixarSelecionados
                                }
                                disabled={
                                    processando
                                }
                            >
                                ↓ Baixar ZIP
                            </button>

                            <button
                                type="button"
                                className="camera-arquivos-apagar-varios"
                                onClick={
                                    apagarSelecionados
                                }
                                disabled={
                                    processando
                                }
                            >
                                Apagar
                            </button>

                        </div>

                    )}

                </div>

            )}


            {carregando ? (

                <div className="camera-arquivos-carregando">

                    <div className="camera-arquivos-carregando-icone" />

                    <strong>
                        Carregando arquivos
                    </strong>

                    <span>
                        Aguarde...
                    </span>

                </div>

            ) : pastas.length === 0 ? (

                <div className="camera-arquivos-vazio">

                    <div className="camera-arquivos-vazio-icone">
                        ▦
                    </div>

                    <strong>
                        Nenhum arquivo
                    </strong>

                    <span>
                        As fotos e vídeos enviados pela câmera aparecerão aqui.
                    </span>

                </div>

            ) : (

                <div className="camera-arquivos-pastas">

                    {pastas.map(
                        pasta => {

                            const aberta =
                                pastasAbertas[
                                pasta.chave
                                ] !== false;

                            const idsPasta =
                                pasta.arquivos.map(
                                    arquivo =>
                                        arquivo.id
                                );

                            const selecionouTodos =
                                idsPasta.every(
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
                                    className="camera-arquivos-pasta"
                                >

                                    <div className="camera-arquivos-pasta-cabecalho">

                                        <button
                                            type="button"
                                            className="camera-arquivos-pasta-abrir"
                                            onClick={() =>
                                                alternarPasta(
                                                    pasta.chave
                                                )
                                            }
                                        >

                                            <span className="camera-arquivos-pasta-icone">
                                                {aberta
                                                    ? "▾"
                                                    : "▸"}
                                            </span>

                                            <div className="camera-arquivos-pasta-info">

                                                <strong>
                                                    {pasta.titulo}
                                                </strong>

                                                <span>
                                                    {pasta.arquivos.length} arquivo(s)
                                                </span>

                                            </div>

                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                selecionouTodos
                                                    ? "camera-arquivos-pasta-selecionar camera-arquivos-pasta-selecionar-ativo"
                                                    : "camera-arquivos-pasta-selecionar"
                                            }
                                            onClick={() =>
                                                selecionarPasta(
                                                    pasta.arquivos
                                                )
                                            }
                                        >
                                            {selecionouTodos
                                                ? "✓ Selecionados"
                                                : "Selecionar pasta"}
                                        </button>

                                    </div>


                                    {aberta && (

                                        <div className="camera-arquivos-grid">

                                            {pasta.arquivos.map(
                                                arquivo => (

                                                    <article
                                                        key={
                                                            arquivo.id
                                                        }
                                                        className={
                                                            estaSelecionado(
                                                                arquivo.id
                                                            )
                                                                ? "camera-arquivos-card camera-arquivos-card-selecionado"
                                                                : "camera-arquivos-card"
                                                        }
                                                    >

                                                        <button
                                                            type="button"
                                                            className={
                                                                estaSelecionado(
                                                                    arquivo.id
                                                                )
                                                                    ? "camera-arquivos-check camera-arquivos-check-ativo"
                                                                    : "camera-arquivos-check"
                                                            }
                                                            onClick={() =>
                                                                alternarSelecao(
                                                                    arquivo.id
                                                                )
                                                            }
                                                        >
                                                            {estaSelecionado(
                                                                arquivo.id
                                                            )
                                                                ? "✓"
                                                                : ""}
                                                        </button>


                                                        <div className="camera-arquivos-preview">

                                                            {arquivo.tipo ===
                                                                "video" ? (

                                                                <video
                                                                    src={
                                                                        arquivo.arquivo_url
                                                                    }
                                                                    controls
                                                                    playsInline
                                                                    preload="metadata"
                                                                />

                                                            ) : (

                                                                <img
                                                                    src={
                                                                        arquivo.arquivo_url
                                                                    }
                                                                    alt=""
                                                                    loading="lazy"
                                                                />

                                                            )}

                                                            <span className="camera-arquivos-tipo">
                                                                {arquivo.tipo ===
                                                                    "video"
                                                                    ? "VÍDEO"
                                                                    : "FOTO"}
                                                            </span>

                                                        </div>


                                                        <div className="camera-arquivos-card-info">

                                                            <strong>
                                                                {arquivo.cadastrado_nome}
                                                            </strong>

                                                            <span>
                                                                {formatarDataHora(
                                                                    arquivo.data
                                                                )}
                                                            </span>

                                                        </div>


                                                        <div className="camera-arquivos-card-acoes">

                                                            <button
                                                                type="button"
                                                                className="camera-arquivos-acao-baixar"
                                                                onClick={() =>
                                                                    baixarArquivo(
                                                                        arquivo
                                                                    )
                                                                }
                                                            >
                                                                ↓
                                                                <span>
                                                                    Baixar
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="camera-arquivos-acao-apagar"
                                                                onClick={() =>
                                                                    apagarArquivo(
                                                                        arquivo
                                                                    )
                                                                }
                                                            >
                                                                ×
                                                                <span>
                                                                    Apagar
                                                                </span>
                                                            </button>

                                                        </div>

                                                    </article>

                                                )
                                            )}

                                        </div>

                                    )}

                                </section>

                            );

                        }
                    )}

                </div>

            )}

        </div>
    );
}