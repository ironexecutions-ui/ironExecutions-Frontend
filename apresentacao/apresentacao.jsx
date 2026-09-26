import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { API_URL } from "../config";

import "./apresentacao.css";


const TEMPO_SLIDE = 15000;
const QUANTIDADE_POR_SLIDE = 3;
const SLIDES_ANTES_VIDEO = 3;


// =========================================================
// EMBARALHAR
// =========================================================

function embaralhar(lista) {

    const copia = [...lista];

    for (
        let indice = copia.length - 1;
        indice > 0;
        indice--
    ) {

        const aleatorio = Math.floor(
            Math.random() * (indice + 1)
        );

        [
            copia[indice],
            copia[aleatorio]
        ] = [
                copia[aleatorio],
                copia[indice]
            ];
    }

    return copia;
}


// =========================================================
// FORMATAR PREÇO
// =========================================================

function formatarPreco(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "";
    }

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


// =========================================================
// CRIAR ID ÚNICO DA MÍDIA
// =========================================================

function criarChaveMidia(item) {

    return [
        item.origem,
        item.id,
        item.url
    ].join("-");
}


// =========================================================
// COMPONENTE
// =========================================================

export default function Apresentacao() {

    const [carregando, setCarregando] =
        useState(true);

    const [erro, setErro] =
        useState("");

    const [dados, setDados] =
        useState(null);

    const [filaImagens, setFilaImagens] =
        useState([]);

    const [filaVideos, setFilaVideos] =
        useState([]);

    const [slideAtual, setSlideAtual] =
        useState([]);

    const [videoAtual, setVideoAtual] =
        useState(null);

    const [modo, setModo] =
        useState("imagens");

    const [contadorSlides, setContadorSlides] =
        useState(0);

    const [transicao, setTransicao] =
        useState(false);

    const filaImagensRef =
        useRef([]);

    const filaVideosRef =
        useRef([]);

    const contadorSlidesRef =
        useRef(0);

    const timerRef =
        useRef(null);

    const montadoRef =
        useRef(true);


    // =====================================================
    // LIMPAR TIMER
    // =====================================================

    const limparTimer = useCallback(() => {

        if (timerRef.current) {

            clearTimeout(
                timerRef.current
            );

            timerRef.current = null;
        }

    }, []);
    const [layoutAtual, setLayoutAtual] =
        useState("esquerda");

    const layoutAnteriorRef =
        useRef("esquerda");
    const LAYOUTS_APRESENTACAO = [
        "esquerda",
        "direita",
        "topo",
        "baixo",
        "triplo",
        "centro",
        "mosaico",
        "cinema"
    ];

    function sortearLayoutApresentacao() {

        let disponiveis =
            LAYOUTS_APRESENTACAO.filter(
                (layout) =>
                    layout !== layoutAnteriorRef?.current
            );

        return disponiveis[
            Math.floor(
                Math.random() * disponiveis.length
            )
        ];
    }
    const escolherNovoLayout =
        useCallback(() => {

            const layouts = [
                "esquerda",
                "direita",
                "topo",
                "baixo",
                "triplo",
                "centro",
                "mosaico",
                "cinema"
            ];

            const disponiveis =
                layouts.filter(
                    (layout) =>
                        layout !==
                        layoutAnteriorRef.current
                );

            const escolhido =
                disponiveis[
                Math.floor(
                    Math.random() *
                    disponiveis.length
                )
                ];

            layoutAnteriorRef.current =
                escolhido;

            setLayoutAtual(
                escolhido
            );

        }, []);
    // =====================================================
    // PEGAR PRÓXIMAS IMAGENS
    // =====================================================

    const pegarProximasImagens =
        useCallback(() => {

            let fila = [
                ...filaImagensRef.current
            ];

            if (fila.length === 0) {
                return [];
            }

            if (
                fila.length <
                QUANTIDADE_POR_SLIDE
            ) {

                fila = embaralhar(
                    [
                        ...fila,
                        ...filaImagens
                    ]
                );
            }

            const selecionadas = [];

            const usadas = new Set();

            while (
                selecionadas.length <
                QUANTIDADE_POR_SLIDE &&
                fila.length > 0
            ) {

                const item = fila.shift();

                const chave =
                    criarChaveMidia(item);

                if (usadas.has(chave)) {
                    continue;
                }

                usadas.add(chave);

                selecionadas.push(item);
            }

            if (
                selecionadas.length <
                QUANTIDADE_POR_SLIDE &&
                filaImagens.length > 0
            ) {

                const alternativas =
                    embaralhar(filaImagens);

                for (
                    const item
                    of alternativas
                ) {

                    if (
                        selecionadas.length >=
                        QUANTIDADE_POR_SLIDE
                    ) {
                        break;
                    }

                    const chave =
                        criarChaveMidia(item);

                    if (usadas.has(chave)) {
                        continue;
                    }

                    usadas.add(chave);

                    selecionadas.push(item);
                }
            }

            if (fila.length === 0) {

                fila = embaralhar(
                    filaImagens
                );
            }

            filaImagensRef.current =
                fila;

            return selecionadas;

        }, [filaImagens]);


    // =====================================================
    // PEGAR PRÓXIMO VÍDEO
    // =====================================================

    const pegarProximoVideo =
        useCallback(() => {

            if (filaVideos.length === 0) {
                return null;
            }

            let fila = [
                ...filaVideosRef.current
            ];

            if (fila.length === 0) {

                fila = embaralhar(
                    filaVideos
                );
            }

            const video =
                fila.shift();

            filaVideosRef.current =
                fila;

            return video || null;

        }, [filaVideos]);


    // =====================================================
    // CARREGAR APRESENTAÇÃO
    // =====================================================

    useEffect(() => {

        montadoRef.current = true;

        async function carregar() {

            setCarregando(true);
            setErro("");

            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {

                setErro(
                    "Sessão não encontrada."
                );

                setCarregando(false);

                return;
            }

            try {

                console.log(
                    "[APRESENTACAO] Carregando..."
                );

                const resposta =
                    await fetch(
                        `${API_URL}/apresentacao`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const json =
                    await resposta.json();

                if (!resposta.ok) {

                    throw new Error(
                        json.detail ||
                        "Não foi possível carregar a apresentação."
                    );
                }

                if (!montadoRef.current) {
                    return;
                }

                console.log(
                    "[APRESENTACAO] Dados:",
                    json
                );

                setDados(json);

            } catch (error) {

                console.error(
                    "[APRESENTACAO] Erro:",
                    error
                );

                if (montadoRef.current) {

                    setErro(
                        error.message ||
                        "Erro ao carregar apresentação."
                    );
                }

            } finally {

                if (montadoRef.current) {
                    setCarregando(false);
                }
            }
        }

        carregar();

        return () => {

            montadoRef.current = false;

            limparTimer();
        };

    }, [limparTimer]);


    // =====================================================
    // TRANSFORMAR DADOS EM MÍDIAS
    // =====================================================

    const midiasPreparadas =
        useMemo(() => {

            if (!dados) {

                return {
                    imagens: [],
                    videos: []
                };
            }

            const imagens = [];
            const videos = [];


            // =============================================
            // PRODUTOS
            // =============================================

            for (
                const produto
                of dados.produtos || []
            ) {

                for (
                    const url
                    of produto.imagens || []
                ) {

                    if (!url) {
                        continue;
                    }

                    imagens.push({
                        id: produto.id,

                        origem: "produto",

                        url,

                        titulo:
                            produto.nome ||
                            "Produto",

                        subtitulo:
                            formatarPreco(
                                produto.preco
                            ),

                        fotoPerfil: null
                    });
                }
            }


            // =============================================
            // ARQUIVOS DA CÂMERA
            // =============================================

            if (dados.camera_ativa) {

                for (
                    const arquivo
                    of dados.arquivos_camera || []
                ) {

                    if (!arquivo.url) {
                        continue;
                    }

                    const item = {
                        id: arquivo.id,

                        origem: "camera",

                        url: arquivo.url,

                        titulo:
                            arquivo.nome ||
                            "Registro da equipe",

                        /*
                         * Aqui não existe preço.
                         * O nome da pessoa aparece
                         * também na área inferior.
                         */
                        subtitulo:
                            arquivo.nome ||
                            "Registro da equipe",

                        fotoPerfil:
                            arquivo.foto || null
                    };

                    if (
                        arquivo.tipo ===
                        "video"
                    ) {

                        videos.push(item);

                    } else {

                        imagens.push(item);
                    }
                }
            }

            return {
                imagens:
                    embaralhar(imagens),

                videos:
                    embaralhar(videos)
            };

        }, [dados]);


    // =====================================================
    // SALVAR FILAS
    // =====================================================

    useEffect(() => {

        const imagens =
            midiasPreparadas.imagens;

        const videos =
            midiasPreparadas.videos;

        setFilaImagens(imagens);
        setFilaVideos(videos);

        filaImagensRef.current =
            embaralhar(imagens);

        filaVideosRef.current =
            embaralhar(videos);

        contadorSlidesRef.current = 0;

        setContadorSlides(0);

    }, [midiasPreparadas]);


    // =====================================================
    // TROCAR PARA PRÓXIMO SLIDE
    // =====================================================

    const mostrarProximoSlide =
        useCallback(() => {

            limparTimer();

            if (
                filaImagens.length === 0 &&
                filaVideos.length === 0
            ) {
                return;
            }

            const quantidadeSlides =
                contadorSlidesRef.current;


            // =============================================
            // A CADA 3 SLIDES, TENTA MOSTRAR VÍDEO
            // =============================================

            if (
                quantidadeSlides >=
                SLIDES_ANTES_VIDEO &&
                filaVideos.length > 0
            ) {

                const video =
                    pegarProximoVideo();

                if (video) {

                    setTransicao(true);

                    setTimeout(() => {

                        if (!montadoRef.current) {
                            return;
                        }

                        setVideoAtual(video);

                        setSlideAtual([]);

                        setModo("video");

                        contadorSlidesRef.current =
                            0;

                        setContadorSlides(0);

                        setTransicao(false);

                    }, 500);

                    return;
                }
            }


            // =============================================
            // IMAGENS
            // =============================================

            const novasImagens =
                pegarProximasImagens();

            if (novasImagens.length === 0) {

                /*
                 * Pode acontecer se o comércio tiver
                 * somente vídeos.
                 */

                const video =
                    pegarProximoVideo();

                if (video) {

                    setVideoAtual(video);

                    setSlideAtual([]);

                    setModo("video");
                }

                return;
            }

            setTransicao(true);

            setTimeout(() => {

                if (!montadoRef.current) {
                    return;
                }

                setVideoAtual(null);

                escolherNovoLayout();

                setSlideAtual(
                    novasImagens
                );

                setModo("imagens");

                contadorSlidesRef.current =
                    quantidadeSlides + 1;

                setContadorSlides(
                    quantidadeSlides + 1
                );

                setTransicao(false);

            }, 500);

        }, [
            filaImagens,
            filaVideos,
            limparTimer,
            pegarProximasImagens,
            pegarProximoVideo
        ]);


    // =====================================================
    // PRIMEIRO SLIDE
    // =====================================================

    useEffect(() => {

        if (
            carregando ||
            !dados
        ) {
            return;
        }

        if (
            filaImagens.length === 0 &&
            filaVideos.length === 0
        ) {
            return;
        }

        if (
            slideAtual.length === 0 &&
            !videoAtual
        ) {

            mostrarProximoSlide();
        }

    }, [
        carregando,
        dados,
        filaImagens,
        filaVideos,
        slideAtual.length,
        videoAtual,
        mostrarProximoSlide
    ]);


    // =====================================================
    // TIMER DE 15 SEGUNDOS
    // =====================================================

    useEffect(() => {

        limparTimer();

        if (
            modo !== "imagens" ||
            slideAtual.length === 0
        ) {
            return;
        }

        timerRef.current =
            setTimeout(
                () => {

                    mostrarProximoSlide();

                },
                TEMPO_SLIDE
            );

        return limparTimer;

    }, [
        modo,
        slideAtual,
        mostrarProximoSlide,
        limparTimer
    ]);


    // =====================================================
    // QUANDO VÍDEO TERMINAR
    // =====================================================

    function videoTerminou() {

        console.log(
            "[APRESENTACAO] Vídeo terminou"
        );

        setVideoAtual(null);

        setModo("imagens");

        setTimeout(() => {

            mostrarProximoSlide();

        }, 400);
    }


    // =====================================================
    // ERRO NO VÍDEO
    // =====================================================

    function videoFalhou() {

        console.warn(
            "[APRESENTACAO] Não foi possível reproduzir o vídeo."
        );

        videoTerminou();
    }


    // =====================================================
    // TELA CHEIA
    // =====================================================

    async function entrarTelaCheia() {

        try {

            const elemento =
                document.documentElement;

            if (
                !document.fullscreenElement &&
                elemento.requestFullscreen
            ) {

                await elemento.requestFullscreen();
            }

        } catch (error) {

            console.warn(
                "[APRESENTACAO] Tela cheia:",
                error
            );
        }
    }


    // =====================================================
    // CARREGANDO
    // =====================================================

    if (carregando) {

        return (

            <main className="apresentacao-carregamento">

                <div className="apresentacao-carregamento-conteudo">

                    <div className="apresentacao-carregamento-logo">
                        IE
                    </div>

                    <div className="apresentacao-carregamento-spinner" />

                    <strong>
                        Preparando apresentação
                    </strong>

                    <span>
                        Carregando imagens e vídeos...
                    </span>

                </div>

            </main>
        );
    }


    // =====================================================
    // ERRO
    // =====================================================

    if (erro) {

        return (

            <main className="apresentacao-erro">

                <div className="apresentacao-erro-caixa">

                    <span className="apresentacao-erro-simbolo">
                        !
                    </span>

                    <h2>
                        Não foi possível iniciar
                    </h2>

                    <p>
                        {erro}
                    </p>

                    <button
                        type="button"
                        className="apresentacao-erro-recarregar"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Tentar novamente
                    </button>

                </div>

            </main>
        );
    }


    // =====================================================
    // SEM CONTEÚDO
    // =====================================================

    if (
        filaImagens.length === 0 &&
        filaVideos.length === 0
    ) {

        return (

            <main className="apresentacao-vazia">

                <CabecalhoEmpresa
                    empresa={dados?.empresa}
                />

                <div className="apresentacao-vazia-conteudo">

                    <div className="apresentacao-vazia-icone">
                        ◇
                    </div>

                    <h2>
                        Apresentação pronta
                    </h2>

                    <p>
                        Ainda não existem imagens ou vídeos disponíveis.
                    </p>

                </div>

            </main>
        );
    }


    // =====================================================
    // APRESENTAÇÃO
    // =====================================================

    // =====================================================
    // APRESENTAÇÃO
    // =====================================================

    return (
        <main
            className={`apresentacao-stage ${transicao
                ? "apresentacao-stage--transition"
                : ""
                }`}
        >
            {/* FUNDO */}
            <div className="apresentacao-stage__ambient">
                <div className="apresentacao-stage__glow apresentacao-stage__glow--left" />
                <div className="apresentacao-stage__glow apresentacao-stage__glow--right" />
                <div className="apresentacao-stage__grain" />
            </div>

            {/* =================================================
            TOPO
        ================================================= */}

            <header className="apresentacao-topbar">

                <div className="apresentacao-topbar__brand">

                    {dados?.empresa?.logo ? (
                        <div className="apresentacao-topbar__logo-shell">
                            <img
                                src={dados.empresa.logo}
                                alt={dados.empresa.nome || "Empresa"}
                                className="apresentacao-topbar__logo"
                            />
                        </div>
                    ) : (
                        <div className="apresentacao-topbar__logo-fallback">
                            {String(
                                dados?.empresa?.nome || "E"
                            )
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    )}

                    <div className="apresentacao-topbar__company">
                        <span className="apresentacao-topbar__eyebrow">
                            Apresentação
                        </span>

                        <strong className="apresentacao-topbar__company-name">
                            {dados?.empresa?.nome || "Empresa"}
                        </strong>
                    </div>

                </div>


                <div className="apresentacao-topbar__right">

                    <div className="apresentacao-topbar__live">
                        <span className="apresentacao-topbar__live-dot" />

                        <span>
                            Em exibição
                        </span>
                    </div>

                    <button
                        type="button"
                        className="apresentacao-topbar__fullscreen"
                        onClick={entrarTelaCheia}
                        title="Abrir em tela cheia"
                        aria-label="Abrir em tela cheia"
                    >
                        <span className="apresentacao-topbar__fullscreen-corner apresentacao-topbar__fullscreen-corner--one" />
                        <span className="apresentacao-topbar__fullscreen-corner apresentacao-topbar__fullscreen-corner--two" />
                        <span className="apresentacao-topbar__fullscreen-corner apresentacao-topbar__fullscreen-corner--three" />
                        <span className="apresentacao-topbar__fullscreen-corner apresentacao-topbar__fullscreen-corner--four" />
                    </button>

                </div>

            </header>


            {/* =================================================
            IMAGENS
        ================================================= */}

            {modo === "imagens" && (

                <section
                    className={`
        apresentacao-showcase
        apresentacao-showcase--${slideAtual.length}
        apresentacao-showcase--layout-${layoutAtual}
    `}
                >

                    {slideAtual.map((item, indice) => {

                        const camera =
                            item.origem === "camera";

                        const principal =
                            indice === 0;

                        return (
                            <article
                                key={`${criarChaveMidia(item)}-${indice}`}
                                className={`apresentacao-media ${principal
                                    ? "apresentacao-media--hero"
                                    : "apresentacao-media--secondary"
                                    } ${camera
                                        ? "apresentacao-media--camera"
                                        : "apresentacao-media--product"
                                    }`}
                                style={{
                                    "--apresentacao-order": indice
                                }}
                            >

                                {/* IMAGEM */}

                                <div className="apresentacao-media__visual">

                                    <img
                                        src={item.url}
                                        alt={item.titulo || ""}
                                        className="apresentacao-media__image"
                                    />

                                    <div className="apresentacao-media__shade" />

                                    <div className="apresentacao-media__light" />

                                </div>


                                {/* NÚMERO DECORATIVO */}

                                <div className="apresentacao-media__number">
                                    {String(indice + 1).padStart(2, "0")}
                                </div>


                                {/* CONTEÚDO */}

                                <div className="apresentacao-media__content">

                                    {camera && (

                                        <div className="apresentacao-media__person">

                                            {item.fotoPerfil && (
                                                <img
                                                    src={item.fotoPerfil}
                                                    alt=""
                                                    className="apresentacao-media__avatar"
                                                />
                                            )}

                                            <div className="apresentacao-media__person-copy">

                                                <span>
                                                    Registro
                                                </span>

                                                <strong>
                                                    {item.titulo}
                                                </strong>

                                            </div>

                                        </div>

                                    )}


                                    {!camera && (

                                        <>
                                            <span className="apresentacao-media__label">
                                                Em destaque
                                            </span>

                                            <h2 className="apresentacao-media__title">
                                                {item.titulo}
                                            </h2>

                                            {item.subtitulo && (

                                                <div className="apresentacao-media__price-row">

                                                    <strong className="apresentacao-media__price">
                                                        {item.subtitulo}
                                                    </strong>

                                                    <span className="apresentacao-media__price-line" />

                                                </div>

                                            )}

                                        </>

                                    )}

                                </div>


                                {/* CANTO DECORATIVO */}

                                <div className="apresentacao-media__corner">
                                    <span />
                                    <span />
                                </div>

                            </article>
                        );
                    })}

                </section>

            )}


            {/* =================================================
            VÍDEO
        ================================================= */}

            {modo === "video" && videoAtual && (

                <section className="apresentacao-cinema">

                    <div className="apresentacao-cinema__frame">

                        <video
                            key={videoAtual.url}
                            className="apresentacao-cinema__video"
                            src={videoAtual.url}
                            autoPlay
                            playsInline
                            muted
                            controls={false}
                            onEnded={videoTerminou}
                            onError={videoFalhou}
                        />

                        <div className="apresentacao-cinema__gradient" />

                        <div className="apresentacao-cinema__top-detail">

                            <span />

                            <small>
                                VÍDEO
                            </small>

                        </div>


                        <div className="apresentacao-cinema__information">

                            {videoAtual.fotoPerfil && (

                                <div className="apresentacao-cinema__avatar-shell">

                                    <img
                                        src={videoAtual.fotoPerfil}
                                        alt=""
                                        className="apresentacao-cinema__avatar"
                                    />

                                </div>

                            )}

                            <div className="apresentacao-cinema__copy">

                                <span className="apresentacao-cinema__eyebrow">
                                    Registro em destaque
                                </span>

                                <strong className="apresentacao-cinema__name">
                                    {videoAtual.titulo}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =================================================
            BARRA INFERIOR
        ================================================= */}

            <footer className="apresentacao-bottom">

                <div className="apresentacao-bottom__left">

                    <span className="apresentacao-bottom__index">
                        {String(
                            Math.max(
                                contadorSlides,
                                1
                            )
                        ).padStart(2, "0")}
                    </span>

                    <span className="apresentacao-bottom__separator" />

                    <span className="apresentacao-bottom__status">
                        {modo === "video"
                            ? "Reproduzindo vídeo"
                            : "Próxima seleção em 15 segundos"}
                    </span>

                </div>


                <div className="apresentacao-bottom__progress">

                    <span
                        key={`${modo}-${contadorSlides}`}
                        className={`apresentacao-bottom__progress-fill ${modo === "video"
                            ? "apresentacao-bottom__progress-fill--video"
                            : ""
                            }`}
                    />

                </div>

            </footer>

        </main>
    );
}


// =========================================================
// CABEÇALHO DA EMPRESA
// =========================================================

function CabecalhoEmpresa({
    empresa
}) {

    if (!empresa) {
        return null;
    }

    return (

        <header className="apresentacao-empresa">

            <div className="apresentacao-empresa-texto">

                <span>
                    Apresentado por
                </span>

                <strong>
                    {empresa.nome}
                </strong>

            </div>

            {empresa.logo ? (

                <div className="apresentacao-empresa-logo-caixa">

                    <img
                        src={empresa.logo}
                        alt={empresa.nome || "Empresa"}
                        className="apresentacao-empresa-logo"
                    />

                </div>

            ) : (

                <div className="apresentacao-empresa-logo-sem-imagem">

                    {String(
                        empresa.nome || "E"
                    )
                        .trim()
                        .charAt(0)
                        .toUpperCase()}

                </div>
            )}

        </header>
    );
}


// =========================================================
// CARD DE IMAGEM
// =========================================================

function CardImagem({
    item,
    indice
}) {

    const camera =
        item.origem === "camera";

    return (

        <article
            className={
                `apresentacao-card ${camera
                    ? "apresentacao-card-camera"
                    : "apresentacao-card-produto"
                }`
            }
            style={{
                "--apresentacao-indice": indice
            }}
        >

            <div className="apresentacao-card-imagem-area">

                <img
                    src={item.url}
                    alt={item.titulo || ""}
                    className="apresentacao-card-imagem"
                />

                <div className="apresentacao-card-gradiente" />

                <div className="apresentacao-card-brilho" />

            </div>


            <div className="apresentacao-card-conteudo">

                {camera && item.fotoPerfil && (

                    <div className="apresentacao-card-avatar-area">

                        <img
                            src={item.fotoPerfil}
                            alt=""
                            className="apresentacao-card-avatar"
                        />

                    </div>
                )}


                <div className="apresentacao-card-textos">

                    {camera && (

                        <span className="apresentacao-card-tipo">
                            Registro
                        </span>

                    )}

                    <h2 className="apresentacao-card-titulo">
                        {item.titulo}
                    </h2>


                    {camera ? (

                        <div className="apresentacao-card-autor">

                            {item.subtitulo}

                        </div>

                    ) : (

                        item.subtitulo && (

                            <div className="apresentacao-card-preco">

                                {item.subtitulo}

                            </div>
                        )
                    )}

                </div>

            </div>

        </article>
    );
}