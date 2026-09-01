import React, {
    useEffect,
    useRef,
    useState
} from "react";

import { API_URL } from "../../../../../../config";

import "./apresentacao.css";


const LIMITE_IMAGENS = 3;

const TAMANHO_MAXIMO_IMAGEM =
    10 * 1024 * 1024;


export default function Apresentacao() {

    // ============================================================
    // ESTADOS
    // ============================================================

    const [carregando, setCarregando] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);

    const [enviandoImagem, setEnviandoImagem] =
        useState(false);

    const [limpando, setLimpando] =
        useState(false);

    const [dominioCadastrado, setDominioCadastrado] =
        useState(false);

    const [dominio, setDominio] =
        useState("");

    const [podeEditar, setPodeEditar] =
        useState(false);

    const [arquivos, setArquivos] =
        useState([]);

    const [mensagem, setMensagem] =
        useState("");

    const [segundaMensagem, setSegundaMensagem] =
        useState("");

    const [terceiraMensagem, setTerceiraMensagem] =
        useState("");

    const [erro, setErro] =
        useState("");

    const [sucesso, setSucesso] =
        useState("");

    const inputArquivoRef =
        useRef(null);


    // ============================================================
    // TOKEN
    // ============================================================

    function obterToken() {

        return localStorage.getItem(
            "token"
        );

    }


    // ============================================================
    // MENSAGEM DE ERRO
    // ============================================================

    function obterMensagemErro(
        dados
    ) {

        if (!dados) {

            return "Erro desconhecido.";

        }


        if (
            typeof dados.detail ===
            "string"
        ) {

            return dados.detail;

        }


        if (
            Array.isArray(
                dados.detail
            )
        ) {

            return dados.detail
                .map((item) => {

                    return (
                        item?.msg ||
                        item?.message ||
                        "Erro de validação"
                    );

                })
                .join(" | ");

        }


        if (
            dados.detail &&
            typeof dados.detail ===
            "object"
        ) {

            if (
                typeof dados.detail.mensagem ===
                "string"
            ) {

                return dados.detail.mensagem;

            }


            try {

                return JSON.stringify(
                    dados.detail
                );

            } catch {

                return "Erro de validação.";

            }

        }


        if (
            typeof dados.mensagem ===
            "string"
        ) {

            return dados.mensagem;

        }


        if (
            typeof dados.message ===
            "string"
        ) {

            return dados.message;

        }


        return "Não foi possível concluir a operação.";

    }


    // ============================================================
    // VERIFICAR SESSÃO
    // ============================================================

    function verificarSessao(
        resposta
    ) {

        if (
            resposta.status !== 401
        ) {

            return false;

        }


        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "usuario"
        );

        window.location.replace(
            "/"
        );


        return true;

    }


    // ============================================================
    // CARREGAR APRESENTAÇÃO
    // ============================================================

    useEffect(() => {

        let componenteAtivo =
            true;


        async function carregarApresentacao() {

            try {

                setCarregando(
                    true
                );

                setErro("");

                setSucesso("");


                const token =
                    obterToken();


                if (!token) {

                    if (
                        componenteAtivo
                    ) {

                        setErro(
                            "Sessão não encontrada."
                        );

                    }

                    return;

                }


                const resposta =
                    await fetch(
                        `${API_URL}/ironstore/configuracao/apresentacao`,
                        {
                            method: "GET",

                            headers: {

                                Accept:
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            }

                        }
                    );


                if (
                    verificarSessao(
                        resposta
                    )
                ) {

                    return;

                }


                const dados =
                    await resposta.json();


                if (!resposta.ok) {

                    throw new Error(
                        obterMensagemErro(
                            dados
                        )
                    );

                }


                if (
                    !componenteAtivo
                ) {

                    return;

                }


                // ====================================================
                // DOMÍNIO
                // ====================================================

                const temDominio =
                    dados?.dominio_cadastrado ===
                    true;


                setDominioCadastrado(
                    temDominio
                );

                setDominio(
                    dados?.dominio ||
                    ""
                );


                // ====================================================
                // PERMISSÃO
                // ====================================================

                setPodeEditar(
                    dados?.pode_editar ===
                    true
                );


                // ====================================================
                // APRESENTAÇÃO
                // ====================================================

                const apresentacao =
                    dados?.apresentacao;


                if (
                    !apresentacao
                ) {

                    setArquivos([]);

                    setMensagem("");

                    setSegundaMensagem("");

                    setTerceiraMensagem("");

                    return;

                }


                // ====================================================
                // ARQUIVOS
                // ====================================================

                let imagensRecebidas = [];


                if (
                    Array.isArray(
                        apresentacao.arquivos
                    )
                ) {

                    imagensRecebidas =
                        apresentacao.arquivos
                            .map(
                                (arquivo) =>
                                    String(
                                        arquivo ||
                                        ""
                                    ).trim()
                            )
                            .filter(
                                Boolean
                            );

                } else if (
                    apresentacao.arquivos
                ) {

                    imagensRecebidas =
                        String(
                            apresentacao.arquivos
                        )
                            .split("||")
                            .map(
                                (arquivo) =>
                                    arquivo.trim()
                            )
                            .filter(
                                Boolean
                            );

                }


                setArquivos(
                    imagensRecebidas
                );


                // ====================================================
                // MENSAGENS
                // ====================================================

                setMensagem(
                    apresentacao.mensagem ||
                    ""
                );

                setSegundaMensagem(
                    apresentacao.segunda_mensagem ||
                    ""
                );

                setTerceiraMensagem(
                    apresentacao.terceira_mensagem ||
                    ""
                );


            } catch (
            erroCarregamento
            ) {

                console.error(
                    "[IRONSTORE APRESENTAÇÃO]",
                    erroCarregamento
                );


                if (
                    componenteAtivo
                ) {

                    setErro(
                        erroCarregamento?.message ||
                        "Não foi possível carregar a apresentação."
                    );

                }


            } finally {

                if (
                    componenteAtivo
                ) {

                    setCarregando(
                        false
                    );

                }

            }

        }


        carregarApresentacao();


        return () => {

            componenteAtivo =
                false;

        };

    }, []);


    // ============================================================
    // ABRIR SELETOR DE IMAGEM
    // ============================================================

    function abrirSeletorImagem() {

        if (
            !podeEditar ||
            !dominioCadastrado ||
            enviandoImagem ||
            arquivos.length >=
            LIMITE_IMAGENS
        ) {

            return;

        }


        inputArquivoRef
            .current
            ?.click();

    }


    // ============================================================
    // ENVIAR IMAGEM PARA VPS
    // ============================================================

    async function enviarImagem(
        event
    ) {

        const arquivo =
            event.target.files?.[0];


        event.target.value =
            "";


        if (!arquivo) {

            return;

        }


        // ========================================================
        // VALIDAR DOMÍNIO
        // ========================================================

        if (
            !dominioCadastrado
        ) {

            setErro(
                "Cadastre um domínio antes de adicionar imagens."
            );

            return;

        }


        // ========================================================
        // VALIDAR PERMISSÃO
        // ========================================================

        if (
            !podeEditar
        ) {

            setErro(
                "Você não possui permissão para alterar a apresentação."
            );

            return;

        }


        // ========================================================
        // LIMITE
        // ========================================================

        if (
            arquivos.length >=
            LIMITE_IMAGENS
        ) {

            setErro(
                `A apresentação permite no máximo ${LIMITE_IMAGENS} imagens.`
            );

            return;

        }


        // ========================================================
        // TIPO
        // ========================================================

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];


        if (
            !tiposPermitidos.includes(
                arquivo.type
            )
        ) {

            setErro(
                "Formato inválido. Utilize JPG, PNG, WEBP ou GIF."
            );

            return;

        }


        // ========================================================
        // TAMANHO
        // ========================================================

        if (
            arquivo.size >
            TAMANHO_MAXIMO_IMAGEM
        ) {

            setErro(
                "A imagem deve possuir no máximo 10 MB."
            );

            return;

        }


        try {

            setEnviandoImagem(
                true
            );

            setErro("");

            setSucesso("");


            // ====================================================
            // FORM DATA
            // ====================================================

            const formData =
                new FormData();


            formData.append(
                "arquivo",
                arquivo
            );


            // ====================================================
            // UPLOAD
            // ====================================================

            const resposta =
                await fetch(
                    `${API_URL}/arquivos/imagem`,
                    {
                        method: "POST",

                        body:
                            formData
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    obterMensagemErro(
                        dados
                    )
                );

            }


            // ====================================================
            // URL RETORNADA
            // ====================================================

            const url =
                String(
                    dados?.url ||
                    ""
                ).trim();


            if (!url) {

                throw new Error(
                    "O servidor não retornou a URL da imagem."
                );

            }


            // ====================================================
            // EVITAR DUPLICIDADE
            // ====================================================

            setArquivos(
                (anteriores) => {

                    if (
                        anteriores.includes(
                            url
                        )
                    ) {

                        return anteriores;

                    }


                    return [
                        ...anteriores,
                        url
                    ];

                }
            );


            setSucesso(
                "Imagem enviada. Clique em salvar para atualizar a apresentação."
            );


        } catch (
        erroUpload
        ) {

            console.error(
                "[IRONSTORE APRESENTAÇÃO UPLOAD]",
                erroUpload
            );


            setErro(
                erroUpload?.message ||
                "Não foi possível enviar a imagem."
            );


        } finally {

            setEnviandoImagem(
                false
            );

        }

    }


    // ============================================================
    // REMOVER IMAGEM DO ESTADO
    // ============================================================

    function removerImagem(
        indice
    ) {

        if (
            !podeEditar
        ) {

            return;

        }


        setArquivos(
            (anteriores) =>
                anteriores.filter(
                    (
                        _,
                        indiceAtual
                    ) =>
                        indiceAtual !==
                        indice
                )
        );


        setErro("");

        setSucesso(
            "Imagem removida. Clique em salvar para confirmar a alteração."
        );

    }


    // ============================================================
    // MOVER IMAGEM PARA ESQUERDA
    // ============================================================

    function moverImagemEsquerda(
        indice
    ) {

        if (
            indice <= 0 ||
            !podeEditar
        ) {

            return;

        }


        setArquivos(
            (anteriores) => {

                const novaLista = [
                    ...anteriores
                ];


                [
                    novaLista[indice - 1],
                    novaLista[indice]
                ] = [
                        novaLista[indice],
                        novaLista[indice - 1]
                    ];


                return novaLista;

            }
        );

    }


    // ============================================================
    // MOVER IMAGEM PARA DIREITA
    // ============================================================

    function moverImagemDireita(
        indice
    ) {

        if (
            indice >=
            arquivos.length - 1 ||
            !podeEditar
        ) {

            return;

        }


        setArquivos(
            (anteriores) => {

                const novaLista = [
                    ...anteriores
                ];


                [
                    novaLista[indice],
                    novaLista[indice + 1]
                ] = [
                        novaLista[indice + 1],
                        novaLista[indice]
                    ];


                return novaLista;

            }
        );

    }


    // ============================================================
    // SALVAR APRESENTAÇÃO
    // ============================================================

    async function salvarApresentacao(
        event
    ) {

        event.preventDefault();


        // ========================================================
        // DOMÍNIO
        // ========================================================

        if (
            !dominioCadastrado
        ) {

            setErro(
                "Cadastre um domínio antes de configurar a apresentação."
            );

            return;

        }


        // ========================================================
        // PERMISSÃO
        // ========================================================

        if (
            !podeEditar
        ) {

            setErro(
                "Você não possui permissão para alterar a apresentação."
            );

            return;

        }


        try {

            setSalvando(
                true
            );

            setErro("");

            setSucesso("");


            const token =
                obterToken();


            if (!token) {

                setErro(
                    "Sessão não encontrada."
                );

                return;

            }


            // ====================================================
            // REQUISIÇÃO
            //
            // O DOMÍNIO NÃO É ENVIADO.
            // O BACKEND DESCOBRE PELO JWT.
            // ====================================================

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/configuracao/apresentacao`,
                    {
                        method: "PUT",

                        headers: {

                            Accept:
                                "application/json",

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                arquivos:
                                    arquivos,

                                mensagem:
                                    mensagem.trim() ||
                                    null,

                                segunda_mensagem:
                                    segundaMensagem.trim() ||
                                    null,

                                terceira_mensagem:
                                    terceiraMensagem.trim() ||
                                    null

                            })

                    }
                );


            if (
                verificarSessao(
                    resposta
                )
            ) {

                return;

            }


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    obterMensagemErro(
                        dados
                    )
                );

            }


            setSucesso(
                dados?.mensagem ||
                "Apresentação salva com sucesso."
            );


        } catch (
        erroSalvamento
        ) {

            console.error(
                "[IRONSTORE APRESENTAÇÃO SALVAR]",
                erroSalvamento
            );


            setErro(
                erroSalvamento?.message ||
                "Não foi possível salvar a apresentação."
            );


        } finally {

            setSalvando(
                false
            );

        }

    }


    // ============================================================
    // LIMPAR APRESENTAÇÃO
    //
    // NÃO EXCLUI A LINHA DA TABELA.
    // SOMENTE LIMPA ARQUIVOS E MENSAGENS.
    // ============================================================

    async function limparApresentacao() {

        if (
            !dominioCadastrado ||
            !podeEditar ||
            limpando
        ) {

            return;

        }


        const confirmou =
            window.confirm(
                "Deseja remover todas as imagens e mensagens da apresentação? O registro continuará salvo."
            );


        if (!confirmou) {

            return;

        }


        try {

            setLimpando(
                true
            );

            setErro("");

            setSucesso("");


            const token =
                obterToken();


            if (!token) {

                setErro(
                    "Sessão não encontrada."
                );

                return;

            }


            const resposta =
                await fetch(
                    `${API_URL}/ironstore/configuracao/apresentacao/limpar`,
                    {
                        method: "PUT",

                        headers: {

                            Accept:
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        }

                    }
                );


            if (
                verificarSessao(
                    resposta
                )
            ) {

                return;

            }


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    obterMensagemErro(
                        dados
                    )
                );

            }


            // ====================================================
            // LIMPAR FRONT
            // ====================================================

            setArquivos([]);

            setMensagem("");

            setSegundaMensagem("");

            setTerceiraMensagem("");


            setSucesso(
                dados?.mensagem ||
                "Apresentação limpa. O registro foi mantido."
            );


        } catch (
        erroLimpeza
        ) {

            console.error(
                "[IRONSTORE APRESENTAÇÃO LIMPAR]",
                erroLimpeza
            );


            setErro(
                erroLimpeza?.message ||
                "Não foi possível limpar a apresentação."
            );


        } finally {

            setLimpando(
                false
            );

        }

    }


    // ============================================================
    // POSSUI CONTEÚDO
    // ============================================================

    const possuiConteudo =
        arquivos.length > 0 ||
        mensagem.trim() ||
        segundaMensagem.trim() ||
        terceiraMensagem.trim();


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <section className="ironstore-apresentacao-config-area">


            {/* =====================================================
                CABEÇALHO
            ===================================================== */}

            <div className="ironstore-apresentacao-config-cabecalho">

                <div className="ironstore-apresentacao-config-titulos">

                    <span className="ironstore-apresentacao-config-etiqueta">
                        Identidade visual
                    </span>

                    <h2 className="ironstore-apresentacao-config-titulo">
                        Apresentação
                    </h2>

                    <p className="ironstore-apresentacao-config-descricao">
                        Configure as imagens e mensagens principais exibidas na apresentação da sua loja.
                    </p>

                </div>

            </div>


            {/* =====================================================
                CARREGANDO
            ===================================================== */}

            {carregando ? (

                <div className="ironstore-apresentacao-config-carregando">

                    <div className="ironstore-apresentacao-config-spinner" />

                    <span>
                        Carregando apresentação...
                    </span>

                </div>

            ) : !dominioCadastrado ? (


                /* =================================================
                    SEM DOMÍNIO
                ================================================= */

                <div className="ironstore-apresentacao-config-sem-dominio">

                    <div className="ironstore-apresentacao-config-sem-dominio-icone">
                        !
                    </div>


                    <div className="ironstore-apresentacao-config-sem-dominio-conteudo">

                        <span className="ironstore-apresentacao-config-sem-dominio-etiqueta">
                            Configuração necessária
                        </span>

                        <h3 className="ironstore-apresentacao-config-sem-dominio-titulo">
                            Cadastre o domínio da sua loja
                        </h3>

                        <p className="ironstore-apresentacao-config-sem-dominio-texto">
                            Antes de configurar a apresentação, registre o domínio que será utilizado pela IronStore.
                        </p>

                        <p className="ironstore-apresentacao-config-sem-dominio-ajuda">
                            Depois que o domínio estiver registrado, esta área será liberada automaticamente.
                        </p>

                    </div>

                </div>

            ) : (

                <form
                    className="ironstore-apresentacao-config-formulario"
                    onSubmit={salvarApresentacao}
                >


                    {/* =================================================
                        DOMÍNIO ATUAL
                    ================================================= */}

                    <div className="ironstore-apresentacao-config-dominio">

                        <div className="ironstore-apresentacao-config-dominio-status">

                            <span className="ironstore-apresentacao-config-dominio-ponto" />

                            <span className="ironstore-apresentacao-config-dominio-label">
                                Loja vinculada
                            </span>

                        </div>


                        <strong className="ironstore-apresentacao-config-dominio-valor">
                            {dominio}
                        </strong>


                        <span className="ironstore-apresentacao-config-dominio-ajuda">
                            O domínio é identificado automaticamente pelo seu comércio.
                        </span>

                    </div>


                    {/* =================================================
                        IMAGENS
                    ================================================= */}

                    <div className="ironstore-apresentacao-config-bloco ironstore-apresentacao-config-bloco-imagens">

                        <div className="ironstore-apresentacao-config-bloco-cabecalho">

                            <div className="ironstore-apresentacao-config-bloco-titulos">

                                <span className="ironstore-apresentacao-config-bloco-etiqueta">
                                    Banner principal
                                </span>

                                <h3 className="ironstore-apresentacao-config-bloco-titulo">
                                    Imagens da apresentação
                                </h3>

                                <p className="ironstore-apresentacao-config-bloco-descricao">
                                    Adicione até {LIMITE_IMAGENS} imagens. A ordem abaixo será a mesma ordem exibida na loja.
                                </p>

                            </div>


                            <div className="ironstore-apresentacao-config-contador">

                                <strong>
                                    {arquivos.length}
                                </strong>

                                <span>
                                    / {LIMITE_IMAGENS}
                                </span>

                            </div>

                        </div>


                        {/* =============================================
                            INPUT OCULTO
                        ============================================= */}

                        <input
                            ref={inputArquivoRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="ironstore-apresentacao-config-input-arquivo"
                            onChange={enviarImagem}
                        />


                        {/* =============================================
                            GRID
                        ============================================= */}

                        <div className="ironstore-apresentacao-config-imagens-grid">

                            {arquivos.map(
                                (
                                    arquivo,
                                    indice
                                ) => (

                                    <article
                                        key={`${arquivo}-${indice}`}
                                        className="ironstore-apresentacao-config-imagem-card"
                                    >

                                        <div className="ironstore-apresentacao-config-imagem-preview">

                                            <img
                                                src={arquivo}
                                                alt={`Imagem ${indice + 1} da apresentação`}
                                            />


                                            <div className="ironstore-apresentacao-config-imagem-topo">

                                                <span className="ironstore-apresentacao-config-imagem-posicao">
                                                    Imagem {indice + 1}
                                                </span>

                                            </div>


                                            {podeEditar && (

                                                <div className="ironstore-apresentacao-config-imagem-ordenacao">

                                                    <button
                                                        type="button"
                                                        className="ironstore-apresentacao-config-imagem-mover"
                                                        onClick={() =>
                                                            moverImagemEsquerda(
                                                                indice
                                                            )
                                                        }
                                                        disabled={
                                                            indice === 0
                                                        }
                                                        aria-label="Mover imagem para esquerda"
                                                    >
                                                        ‹
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="ironstore-apresentacao-config-imagem-mover"
                                                        onClick={() =>
                                                            moverImagemDireita(
                                                                indice
                                                            )
                                                        }
                                                        disabled={
                                                            indice ===
                                                            arquivos.length - 1
                                                        }
                                                        aria-label="Mover imagem para direita"
                                                    >
                                                        ›
                                                    </button>

                                                </div>

                                            )}

                                        </div>


                                        {podeEditar && (

                                            <div className="ironstore-apresentacao-config-imagem-acoes">

                                                <button
                                                    type="button"
                                                    className="ironstore-apresentacao-config-imagem-remover"
                                                    onClick={() =>
                                                        removerImagem(
                                                            indice
                                                        )
                                                    }
                                                >
                                                    Remover imagem
                                                </button>

                                            </div>

                                        )}

                                    </article>

                                )
                            )}


                            {/* =========================================
                                ADICIONAR
                            ========================================= */}

                            {podeEditar &&
                                arquivos.length <
                                LIMITE_IMAGENS && (

                                    <button
                                        type="button"
                                        className="ironstore-apresentacao-config-adicionar-imagem"
                                        onClick={abrirSeletorImagem}
                                        disabled={
                                            enviandoImagem
                                        }
                                    >

                                        <span className="ironstore-apresentacao-config-adicionar-icone">
                                            +
                                        </span>


                                        <span className="ironstore-apresentacao-config-adicionar-conteudo">

                                            <strong>
                                                {
                                                    enviandoImagem
                                                        ? "Enviando imagem..."
                                                        : "Adicionar imagem"
                                                }
                                            </strong>

                                            <small>
                                                JPG, PNG, WEBP ou GIF
                                            </small>

                                            <small>
                                                Máximo de 10 MB
                                            </small>

                                        </span>

                                    </button>

                                )}

                        </div>

                    </div>


                    {/* =================================================
                        TEXTOS
                    ================================================= */}

                    <div className="ironstore-apresentacao-config-bloco ironstore-apresentacao-config-bloco-mensagens">

                        <div className="ironstore-apresentacao-config-bloco-cabecalho">

                            <div className="ironstore-apresentacao-config-bloco-titulos">

                                <span className="ironstore-apresentacao-config-bloco-etiqueta">
                                    Conteúdo
                                </span>

                                <h3 className="ironstore-apresentacao-config-bloco-titulo">
                                    Mensagens da apresentação
                                </h3>

                                <p className="ironstore-apresentacao-config-bloco-descricao">
                                    Personalize os textos apresentados junto às imagens da loja.
                                </p>

                            </div>

                        </div>


                        <div className="ironstore-apresentacao-config-campos">


                            {/* =========================================
                                MENSAGEM 1
                            ========================================= */}

                            <div className="ironstore-apresentacao-config-campo">

                                <div className="ironstore-apresentacao-config-campo-topo">

                                    <label
                                        htmlFor="ironstore-apresentacao-mensagem-principal"
                                        className="ironstore-apresentacao-config-label"
                                    >
                                        Mensagem principal
                                    </label>

                                    <span className="ironstore-apresentacao-config-campo-numero">
                                        01
                                    </span>

                                </div>


                                <textarea
                                    id="ironstore-apresentacao-mensagem-principal"
                                    className="ironstore-apresentacao-config-textarea"
                                    value={mensagem}
                                    onChange={(event) =>
                                        setMensagem(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Tudo o que você procura em um só lugar"
                                    maxLength={180}
                                    disabled={!podeEditar}
                                />


                                <div className="ironstore-apresentacao-config-campo-rodape">

                                    <span>
                                        Texto principal da apresentação
                                    </span>

                                    <span>
                                        {mensagem.length}/180
                                    </span>

                                </div>

                            </div>


                            {/* =========================================
                                MENSAGEM 2
                            ========================================= */}

                            <div className="ironstore-apresentacao-config-campo">

                                <div className="ironstore-apresentacao-config-campo-topo">

                                    <label
                                        htmlFor="ironstore-apresentacao-segunda-mensagem"
                                        className="ironstore-apresentacao-config-label"
                                    >
                                        Segunda mensagem
                                    </label>

                                    <span className="ironstore-apresentacao-config-campo-numero">
                                        02
                                    </span>

                                </div>


                                <textarea
                                    id="ironstore-apresentacao-segunda-mensagem"
                                    className="ironstore-apresentacao-config-textarea"
                                    value={segundaMensagem}
                                    onChange={(event) =>
                                        setSegundaMensagem(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Qualidade, praticidade e ótimas opções para você"
                                    maxLength={180}
                                    disabled={!podeEditar}
                                />


                                <div className="ironstore-apresentacao-config-campo-rodape">

                                    <span>
                                        Texto complementar
                                    </span>

                                    <span>
                                        {segundaMensagem.length}/180
                                    </span>

                                </div>

                            </div>


                            {/* =========================================
                                MENSAGEM 3
                            ========================================= */}

                            <div className="ironstore-apresentacao-config-campo">

                                <div className="ironstore-apresentacao-config-campo-topo">

                                    <label
                                        htmlFor="ironstore-apresentacao-terceira-mensagem"
                                        className="ironstore-apresentacao-config-label"
                                    >
                                        Terceira mensagem
                                    </label>

                                    <span className="ironstore-apresentacao-config-campo-numero">
                                        03
                                    </span>

                                </div>


                                <textarea
                                    id="ironstore-apresentacao-terceira-mensagem"
                                    className="ironstore-apresentacao-config-textarea"
                                    value={terceiraMensagem}
                                    onChange={(event) =>
                                        setTerceiraMensagem(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Descubra produtos selecionados para você"
                                    maxLength={180}
                                    disabled={!podeEditar}
                                />


                                <div className="ironstore-apresentacao-config-campo-rodape">

                                    <span>
                                        Texto adicional
                                    </span>

                                    <span>
                                        {terceiraMensagem.length}/180
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        REGRA DE EXCLUSÃO
                    ================================================= */}

                    <div className="ironstore-apresentacao-config-regra">

                        <div className="ironstore-apresentacao-config-regra-icone">
                            i
                        </div>


                        <div className="ironstore-apresentacao-config-regra-conteudo">

                            <strong>
                                Registro protegido
                            </strong>

                            <span>
                                Ao limpar a apresentação, somente as imagens e mensagens serão removidas. O registro associado ao domínio continuará salvo.
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        SEM PERMISSÃO
                    ================================================= */}

                    {!podeEditar && (

                        <div className="ironstore-apresentacao-config-permissao">

                            <strong>
                                Somente visualização
                            </strong>

                            <span>
                                Apenas administradores podem alterar a apresentação da loja.
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        ERRO
                    ================================================= */}

                    {erro && (

                        <div className="ironstore-apresentacao-config-erro">

                            <strong>
                                Não foi possível concluir
                            </strong>

                            <span>
                                {erro}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        SUCESSO
                    ================================================= */}

                    {sucesso && (

                        <div className="ironstore-apresentacao-config-sucesso">

                            <strong>
                                Alteração registrada
                            </strong>

                            <span>
                                {sucesso}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        AÇÕES
                    ================================================= */}

                    {podeEditar && (

                        <div className="ironstore-apresentacao-config-acoes">


                            <div className="ironstore-apresentacao-config-acoes-info">

                                <span>
                                    {arquivos.length} imagem(ns)
                                </span>

                                <strong>
                                    {
                                        possuiConteudo
                                            ? "Apresentação configurada"
                                            : "Apresentação vazia"
                                    }
                                </strong>

                            </div>


                            <div className="ironstore-apresentacao-config-acoes-botoes">

                                <button
                                    type="button"
                                    className="ironstore-apresentacao-config-limpar"
                                    onClick={limparApresentacao}
                                    disabled={
                                        limpando ||
                                        salvando ||
                                        enviandoImagem ||
                                        !possuiConteudo
                                    }
                                >
                                    {
                                        limpando
                                            ? "Limpando..."
                                            : "Limpar apresentação"
                                    }
                                </button>


                                <button
                                    type="submit"
                                    className="ironstore-apresentacao-config-salvar"
                                    disabled={
                                        salvando ||
                                        limpando ||
                                        enviandoImagem
                                    }
                                >
                                    {
                                        salvando
                                            ? "Salvando..."
                                            : "Salvar apresentação"
                                    }
                                </button>

                            </div>

                        </div>

                    )}

                </form>

            )}

        </section>

    );

}