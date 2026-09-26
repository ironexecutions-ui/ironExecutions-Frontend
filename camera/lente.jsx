import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import {
    API_URL
} from "../config";

import "./lente.css";


const MAXIMO_ARQUIVOS = 50;
const LIMITE_DIARIO_CAPTURAS = 50;
const DURACAO_MAXIMA_VIDEO = 90;


export default function Lente({
    usuario,
    camera
}) {

    const { token } =
        useParams();


    /* =====================================================
       REFS
    ===================================================== */

    const videoRef =
        useRef(null);

    const streamRef =
        useRef(null);

    const recorderRef =
        useRef(null);

    const partesVideoRef =
        useRef([]);

    const timerVideoRef =
        useRef(null);

    const canvasRef =
        useRef(null);


    /* =====================================================
       STATES
    ===================================================== */

    const [
        arquivos,
        setArquivos
    ] = useState([]);


    const [
        arquivosServidor,
        setArquivosServidor
    ] = useState([]);


    const [
        modoArquivos,
        setModoArquivos
    ] = useState(false);


    const [
        gravando,
        setGravando
    ] = useState(false);


    const [
        segundosVideo,
        setSegundosVideo
    ] = useState(0);


    const [
        enviando,
        setEnviando
    ] = useState(false);


    const [
        progresso,
        setProgresso
    ] = useState(0);


    const [
        mensagem,
        setMensagem
    ] = useState("");


    const [
        cameraAtual,
        setCameraAtual
    ] = useState("environment");


    const [
        flashFoto,
        setFlashFoto
    ] = useState(false);
    const [
        fotoAmpliada,
        setFotoAmpliada
    ] = useState(null);
    const [
        capturasHoje,
        setCapturasHoje
    ] = useState(0);
    /* =====================================================
       INICIAR
    ===================================================== */

    useEffect(() => {

        iniciarCamera(
            "environment"
        );

        return () => {

            pararCamera();

            if (
                timerVideoRef.current
            ) {

                clearInterval(
                    timerVideoRef.current
                );

            }

        };

    }, []);


    useEffect(() => {

        carregarArquivosServidor();

    }, [token]);

    /* =====================================================
       RECONECTAR CAMERA AO VOLTAR DOS ARQUIVOS
    ===================================================== */

    useEffect(() => {

        if (modoArquivos) {
            return;
        }

        const reconectarCamera = async () => {

            // Espera o React montar novamente o <video>
            await new Promise(resolve =>
                requestAnimationFrame(resolve)
            );

            const video =
                videoRef.current;

            if (!video) {
                return;
            }

            /* =============================================
               SE O STREAM AINDA ESTÁ ATIVO
               apenas reconecta no novo elemento <video>
            ============================================= */

            if (streamRef.current) {

                const tracksAtivas =
                    streamRef.current
                        .getVideoTracks()
                        .filter(
                            track =>
                                track.readyState === "live"
                        );

                if (tracksAtivas.length > 0) {

                    console.log(
                        "[LENTE] Reconectando stream existente..."
                    );

                    video.srcObject =
                        streamRef.current;

                    try {

                        await video.play();

                        console.log(
                            "[LENTE] Câmera reconectada."
                        );

                    } catch (erro) {

                        console.error(
                            "[LENTE] Erro ao reproduzir câmera:",
                            erro
                        );

                    }

                    return;
                }

            }

            /* =============================================
               STREAM MORREU
               inicia novamente
            ============================================= */

            console.log(
                "[LENTE] Stream não está ativo. Reiniciando câmera..."
            );

            await iniciarCamera(
                cameraAtual
            );

        };

        reconectarCamera();

    }, [modoArquivos]);
    /* =====================================================
       CAMERA
    ===================================================== */

    async function iniciarCamera(
        facingMode = cameraAtual
    ) {

        try {

            setMensagem("");

            pararCamera();


            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices
                    .getUserMedia
            ) {

                throw new Error(
                    "Este dispositivo não oferece acesso à câmera."
                );

            }


            const stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            facingMode: {
                                ideal:
                                    facingMode
                            },

                            width: {
                                ideal: 1920
                            },

                            height: {
                                ideal: 1080
                            }

                        },

                        audio: true

                    });


            streamRef.current =
                stream;


            if (
                videoRef.current
            ) {

                videoRef.current.srcObject =
                    stream;

                await videoRef.current
                    .play()
                    .catch(() => { });

            }

        } catch (erro) {

            console.error(
                "[LENTE] Erro câmera:",
                erro
            );

            setMensagem(
                "Não foi possível acessar a câmera. Verifique a permissão do navegador."
            );

        }

    }


    function pararCamera() {

        if (
            !streamRef.current
        ) {
            return;
        }

        streamRef.current
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        streamRef.current =
            null;

    }


    async function trocarCamera() {

        if (gravando) {
            return;
        }

        const novaCamera =
            cameraAtual ===
                "environment"
                ? "user"
                : "environment";

        setCameraAtual(
            novaCamera
        );

        await iniciarCamera(
            novaCamera
        );

    }
    /* =====================================================
       LIMITE DIÁRIO - CACHE
    ===================================================== */

    function obterDataLocalHoje() {

        const agora =
            new Date();

        const ano =
            agora.getFullYear();

        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                agora.getDate()
            ).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }


    function obterChaveLimiteDiario() {

        return (
            `lente_capturas_${token || "sem-token"}_${obterDataLocalHoje()}`
        );
    }


    function obterCapturasHoje() {

        try {

            const valor =
                Number(
                    localStorage.getItem(
                        obterChaveLimiteDiario()
                    ) || 0
                );

            if (
                !Number.isFinite(valor) ||
                valor < 0
            ) {
                return 0;
            }

            return valor;

        } catch (erro) {

            console.error(
                "[LENTE] Erro ao ler limite diário:",
                erro
            );

            return 0;
        }
    }


    function registrarCapturaDiaria() {

        try {

            const atual =
                obterCapturasHoje();

            const novoTotal =
                Math.min(
                    atual + 1,
                    LIMITE_DIARIO_CAPTURAS
                );

            localStorage.setItem(
                obterChaveLimiteDiario(),
                String(novoTotal)
            );

            setCapturasHoje(
                novoTotal
            );

            console.log(
                `[LENTE] Capturas hoje: ${novoTotal}/${LIMITE_DIARIO_CAPTURAS}`
            );

            return novoTotal;

        } catch (erro) {

            console.error(
                "[LENTE] Erro ao registrar captura:",
                erro
            );

            return capturasHoje;
        }
    }


    function podeCapturarHoje() {

        const total =
            obterCapturasHoje();

        setCapturasHoje(
            total
        );

        if (
            total >=
            LIMITE_DIARIO_CAPTURAS
        ) {

            setMensagem(
                "Você atingiu o limite diário de 50 fotos e vídeos. Novas capturas serão liberadas amanhã."
            );

            return false;
        }

        return true;
    }
    useEffect(() => {

        const total =
            obterCapturasHoje();

        setCapturasHoje(
            total
        );

        console.log(
            `[LENTE] Limite diário: ${total}/${LIMITE_DIARIO_CAPTURAS}`
        );

    }, [token]);
    /* =====================================================
       LIMITE
    ===================================================== */

    function podeAdicionarArquivo() {

        if (
            !podeCapturarHoje()
        ) {
            return false;
        }

        if (
            arquivos.length >=
            MAXIMO_ARQUIVOS
        ) {

            setMensagem(
                "Você atingiu o limite de 50 arquivos nesta sessão. Finalize o envio antes de continuar."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       FOTO
    ===================================================== */

    function tirarFoto() {

        if (
            !podeAdicionarArquivo()
        ) {
            return;
        }


        const video =
            videoRef.current;

        const canvas =
            canvasRef.current;


        if (
            !video ||
            !canvas
        ) {
            return;
        }


        const largura =
            video.videoWidth;

        const altura =
            video.videoHeight;


        if (
            !largura ||
            !altura
        ) {

            setMensagem(
                "A câmera ainda está carregando."
            );

            return;

        }


        canvas.width =
            largura;

        canvas.height =
            altura;


        const contexto =
            canvas.getContext(
                "2d"
            );


        if (
            cameraAtual ===
            "user"
        ) {

            contexto.translate(
                largura,
                0
            );

            contexto.scale(
                -1,
                1
            );

        }


        contexto.drawImage(
            video,
            0,
            0,
            largura,
            altura
        );


        setFlashFoto(true);

        setTimeout(
            () => {
                setFlashFoto(false);
            },
            180
        );


        canvas.toBlob(

            blob => {

                if (!blob) {
                    return;
                }


                const arquivo =
                    new File(
                        [blob],
                        `foto-${Date.now()}.jpg`,
                        {
                            type:
                                "image/jpeg"
                        }
                    );


                const preview =
                    URL.createObjectURL(
                        arquivo
                    );


                setArquivos(
                    anteriores => [

                        ...anteriores,

                        {
                            id:
                                crypto.randomUUID(),

                            tipo:
                                "foto",

                            arquivo,

                            preview
                        }

                    ]
                );
                registrarCapturaDiaria();

                setMensagem("");

            },

            "image/jpeg",

            0.94

        );

    }


    /* =====================================================
       MIME VIDEO
    ===================================================== */

    function obterMimeVideo() {

        const opcoes = [

            "video/webm;codecs=vp9,opus",

            "video/webm;codecs=vp8,opus",

            "video/webm",

            "video/mp4"

        ];


        for (
            const tipo of opcoes
        ) {

            if (
                window.MediaRecorder &&
                MediaRecorder
                    .isTypeSupported(tipo)
            ) {

                return tipo;

            }

        }


        return "";

    }


    /* =====================================================
       VIDEO
    ===================================================== */

    function iniciarVideo() {

        if (
            !podeAdicionarArquivo()
        ) {
            return;
        }


        if (
            !streamRef.current
        ) {

            setMensagem(
                "A câmera não está disponível."
            );

            return;

        }


        if (
            !window.MediaRecorder
        ) {

            setMensagem(
                "Este navegador não permite gravação de vídeo."
            );

            return;

        }


        try {

            partesVideoRef.current =
                [];


            const mime =
                obterMimeVideo();


            const configuracao =
                mime
                    ? {
                        mimeType:
                            mime,

                        videoBitsPerSecond:
                            5_000_000
                    }
                    : {};


            const recorder =
                new MediaRecorder(
                    streamRef.current,
                    configuracao
                );


            recorderRef.current =
                recorder;


            recorder.ondataavailable =
                evento => {

                    if (
                        evento.data &&
                        evento.data.size > 0
                    ) {

                        partesVideoRef.current
                            .push(
                                evento.data
                            );

                    }

                };


            recorder.onstop =
                finalizarVideo;


            recorder.start(
                1000
            );


            setGravando(true);

            setSegundosVideo(0);

            setMensagem("");


            timerVideoRef.current =
                setInterval(

                    () => {

                        setSegundosVideo(
                            anterior => {

                                const novo =
                                    anterior + 1;


                                if (
                                    novo >=
                                    DURACAO_MAXIMA_VIDEO
                                ) {

                                    pararVideo();

                                    return (
                                        DURACAO_MAXIMA_VIDEO
                                    );

                                }


                                return novo;

                            }
                        );

                    },

                    1000

                );

        } catch (erro) {

            console.error(
                "[LENTE] Erro vídeo:",
                erro
            );

            setMensagem(
                "Não foi possível iniciar a gravação."
            );

        }

    }


    function pararVideo() {

        if (
            timerVideoRef.current
        ) {

            clearInterval(
                timerVideoRef.current
            );

            timerVideoRef.current =
                null;

        }


        const recorder =
            recorderRef.current;


        if (
            recorder &&
            recorder.state !==
            "inactive"
        ) {

            recorder.stop();

        }


        setGravando(false);

    }


    function finalizarVideo() {

        const partes =
            partesVideoRef.current;


        if (
            !partes.length
        ) {
            return;
        }


        const tipo =
            recorderRef.current
                ?.mimeType ||
            partes[0]?.type ||
            "video/webm";


        const blob =
            new Blob(
                partes,
                {
                    type: tipo
                }
            );


        const extensao =
            tipo.includes("mp4")
                ? "mp4"
                : "webm";


        const arquivo =
            new File(
                [blob],
                `video-${Date.now()}.${extensao}`,
                {
                    type: tipo
                }
            );


        const preview =
            URL.createObjectURL(
                arquivo
            );


        setArquivos(
            anteriores => [

                ...anteriores,

                {
                    id:
                        crypto.randomUUID(),

                    tipo:
                        "video",

                    arquivo,

                    preview
                }

            ]
        );

        registrarCapturaDiaria();
        partesVideoRef.current =
            [];

    }


    /* =====================================================
       REMOVER LOCAL
    ===================================================== */

    function removerLocal(id) {

        setArquivos(
            anteriores => {

                const encontrado =
                    anteriores.find(
                        item =>
                            item.id === id
                    );


                if (
                    encontrado?.preview
                ) {

                    URL.revokeObjectURL(
                        encontrado.preview
                    );

                }


                return anteriores.filter(
                    item =>
                        item.id !== id
                );

            }
        );

    }


    /* =====================================================
       ENVIAR
    ===================================================== */

    async function finalizarEnvio() {

        if (
            !arquivos.length
        ) {

            setMensagem(
                "Nenhum arquivo foi capturado."
            );

            return;

        }


        if (gravando) {

            setMensagem(
                "Finalize a gravação do vídeo primeiro."
            );

            return;

        }


        try {

            setEnviando(true);

            setMensagem("");

            setProgresso(0);


            let enviados = 0;


            for (
                const item of arquivos
            ) {

                const formData =
                    new FormData();


                formData.append(
                    "token",
                    token
                );


                formData.append(
                    "arquivo",
                    item.arquivo
                );


                const resposta =
                    await fetch(
                        `${API_URL}/camera-publica/arquivo`,
                        {
                            method:
                                "POST",

                            body:
                                formData
                        }
                    );


                const resultado =
                    await resposta
                        .json()
                        .catch(
                            () => ({})
                        );


                if (
                    !resposta.ok
                ) {

                    throw new Error(
                        resultado.detail ||
                        `Erro ao enviar ${item.arquivo.name}`
                    );

                }


                enviados++;


                setProgresso(
                    Math.round(
                        (
                            enviados /
                            arquivos.length
                        ) *
                        100
                    )
                );

            }


            arquivos.forEach(
                item => {

                    if (
                        item.preview
                    ) {

                        URL.revokeObjectURL(
                            item.preview
                        );

                    }

                }
            );


            setArquivos([]);

            await carregarArquivosServidor();

            setMensagem(
                "Arquivos enviados com sucesso."
            );

            setModoArquivos(true);

        } catch (erro) {

            console.error(
                "[LENTE] Erro envio:",
                erro
            );

            setMensagem(
                erro.message ||
                "Não foi possível enviar os arquivos."
            );

        } finally {

            setEnviando(false);

        }

    }


    /* =====================================================
       ARQUIVOS VPS
    ===================================================== */

    async function carregarArquivosServidor() {

        try {

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/arquivos/${encodeURIComponent(token)}`
                );


            const resultado =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (
                !resposta.ok
            ) {
                return;
            }


            setArquivosServidor(
                resultado.arquivos ||
                []
            );

        } catch (erro) {

            console.error(
                "[LENTE] Erro arquivos:",
                erro
            );

        }

    }


    /* =====================================================
       APAGAR VPS
    ===================================================== */

    async function apagarArquivoServidor(
        arquivoId
    ) {

        try {

            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/arquivo/${arquivoId}?token=${encodeURIComponent(token)}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            if (
                !resposta.ok
            ) {

                const resultado =
                    await resposta
                        .json()
                        .catch(
                            () => ({})
                        );

                throw new Error(
                    resultado.detail ||
                    "Não foi possível apagar."
                );

            }


            setArquivosServidor(
                anteriores =>
                    anteriores.filter(
                        item =>
                            item.id !==
                            arquivoId
                    )
            );

        } catch (erro) {

            console.error(
                "[LENTE] Erro exclusão:",
                erro
            );

            setMensagem(
                erro.message
            );

        }

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function formatarTempo(
        segundos
    ) {

        const minutos =
            Math.floor(
                segundos / 60
            );

        const resto =
            segundos % 60;


        return (
            `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`
        );

    }


    function arquivoEhVideo(url) {

        const limpa =
            String(url || "")
                .split("?")[0]
                .toLowerCase();


        return (
            limpa.endsWith(".mp4") ||
            limpa.endsWith(".webm") ||
            limpa.endsWith(".mov")
        );

    }


    function formatarData(data) {

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
                dateStyle:
                    "short",

                timeStyle:
                    "short"
            }
        );

    }


    const totalArquivos =
        arquivos.length;


    const ultimoArquivo =
        arquivos[
        arquivos.length - 1
        ];


    const inicialUsuario =
        (
            usuario?.nome ||
            usuario?.email ||
            "U"
        )
            .charAt(0)
            .toUpperCase();


    /* =====================================================
       JSX
    ===================================================== */

    return (

        <div className="lenteProPagina">

            <div className="lenteProAparelho">


                {/* =========================================
                    VISOR
                ========================================= */}

                {!modoArquivos && (

                    <div className="lenteProVisor">


                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={
                                cameraAtual ===
                                    "user"
                                    ? "lenteProVideo lenteProVideoEspelhado"
                                    : "lenteProVideo"
                            }
                        />


                        <canvas
                            ref={canvasRef}
                            style={{
                                display:
                                    "none"
                            }}
                        />


                        <div className="lenteProSombra" />


                        <div className="lenteProGrid">
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>


                        {flashFoto && (
                            <div className="lenteProFlash" />
                        )}


                        {/* =================================
                            TOPO
                        ================================= */}

                        <div className="lenteProTopo">


                            {/* LOJA */}

                            <div className="lenteProLoja">

                                <div className="lenteProLojaLogo">

                                    {camera?.imagem ? (

                                        <img
                                            src={camera.imagem}
                                            alt={
                                                camera?.loja ||
                                                "Loja"
                                            }
                                        />

                                    ) : (

                                        <span>
                                            {(camera?.loja || "L")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>

                                    )}

                                </div>


                                <div className="lenteProLojaTexto">

                                    <span className="lenteProLojaLabel">
                                        CÂMERA DE
                                    </span>

                                    <strong>
                                        {camera?.loja ||
                                            "Loja"}
                                    </strong>

                                    <small>
                                        {camera?.camera_nome ||
                                            "Câmera"}
                                    </small>

                                </div>

                            </div>


                            {/* CONTADOR */}

                            <button
                                type="button"
                                className="lenteProArquivos"
                                onClick={() =>
                                    setModoArquivos(
                                        true
                                    )
                                }
                            >

                                <span className="lenteProArquivosIcone">
                                    ▦
                                </span>

                                <span className="lenteProArquivosTexto">
                                    Arquivos
                                </span>

                                <strong>
                                    {totalArquivos}
                                </strong>

                            </button>

                        </div>


                        {/* =================================
                            USUÁRIO CADASTRADO
                        ================================= */}

                        <div className="lenteProUsuario">

                            <div className="lenteProUsuarioFoto">

                                {usuario?.foto ? (

                                    <img
                                        src={usuario.foto}
                                        alt={
                                            usuario?.nome ||
                                            "Usuário"
                                        }
                                    />

                                ) : (

                                    <span>
                                        {inicialUsuario}
                                    </span>

                                )}

                                <i />

                            </div>


                            <div className="lenteProUsuarioInfo">

                                <span>
                                    OPERADOR
                                </span>

                                <strong>
                                    {usuario?.nome ||
                                        "Usuário cadastrado"}
                                </strong>

                                {usuario?.email && (

                                    <small>
                                        {usuario.email}
                                    </small>

                                )}

                            </div>

                        </div>


                        {/* =================================
                            GRAVAÇÃO
                        ================================= */}

                        {gravando && (

                            <div className="lenteProRec">

                                <span />

                                <strong>
                                    REC
                                </strong>

                                <b>
                                    {formatarTempo(
                                        segundosVideo
                                    )}
                                </b>

                                <small>
                                    / 01:30
                                </small>

                            </div>

                        )}


                        {/* =================================
                            MENSAGEM
                        ================================= */}

                        {mensagem && (

                            <div className="lenteProMensagem">
                                {mensagem}
                            </div>

                        )}


                        {/* =================================
                            CONTROLES
                        ================================= */}

                        <div className="lenteProControles">


                            {/* GALERIA */}

                            <button
                                type="button"
                                className="lenteProControleSecundario lenteProMiniatura"
                                onClick={() =>
                                    setModoArquivos(
                                        true
                                    )
                                }
                            >

                                {ultimoArquivo ? (

                                    ultimoArquivo.tipo ===
                                        "foto"
                                        ? (

                                            <img
                                                src={
                                                    ultimoArquivo.preview
                                                }
                                                alt=""
                                            />

                                        )
                                        : (

                                            <video
                                                src={
                                                    ultimoArquivo.preview
                                                }
                                                muted
                                                playsInline
                                            />

                                        )

                                ) : (

                                    <span className="lenteProGaleriaIcone">
                                        ▦
                                    </span>

                                )}

                                {totalArquivos > 0 && (

                                    <strong className="lenteProMiniaturaNumero">
                                        {totalArquivos}
                                    </strong>

                                )}

                            </button>


                            {/* TROCAR CAMERA */}

                            <button
                                type="button"
                                className="lenteProControleSecundario lenteProTrocar"
                                onClick={
                                    trocarCamera
                                }
                                disabled={
                                    gravando
                                }
                                aria-label="Trocar câmera"
                            >

                                <span>
                                    ↻
                                </span>

                            </button>


                            {/* FOTO / STOP */}

                            {!gravando ? (

                                <button
                                    type="button"
                                    className="lenteProDisparador"
                                    onClick={
                                        tirarFoto
                                    }
                                    disabled={
                                        totalArquivos >=
                                        MAXIMO_ARQUIVOS
                                    }
                                    aria-label="Tirar foto"
                                >

                                    <span />

                                </button>

                            ) : (

                                <button
                                    type="button"
                                    className="lenteProDisparador lenteProDisparadorStop"
                                    onClick={
                                        pararVideo
                                    }
                                    aria-label="Parar gravação"
                                >

                                    <span />

                                </button>

                            )}


                            {/* VIDEO */}

                            <button
                                type="button"
                                className={
                                    gravando
                                        ? "lenteProControleSecundario lenteProVideoBotao lenteProVideoBotaoAtivo"
                                        : "lenteProControleSecundario lenteProVideoBotao"
                                }
                                onClick={
                                    gravando
                                        ? pararVideo
                                        : iniciarVideo
                                }
                                disabled={
                                    totalArquivos >=
                                    MAXIMO_ARQUIVOS
                                }
                                aria-label={
                                    gravando
                                        ? "Parar vídeo"
                                        : "Gravar vídeo"
                                }
                            >

                                <span />

                            </button>


                            {/* FINALIZAR */}

                            <button
                                type="button"
                                className="lenteProFinalizarRapido"
                                onClick={
                                    finalizarEnvio
                                }
                                disabled={
                                    enviando ||
                                    gravando ||
                                    !arquivos.length
                                }
                            >

                                <span>
                                    {enviando
                                        ? `${progresso}%`
                                        : "✓"}
                                </span>

                                <small>
                                    Finalizar
                                </small>

                            </button>

                        </div>


                        <div className="lenteProLimite">

                            <span>
                                {capturasHoje}
                            </span>

                            <small>
                                / {LIMITE_DIARIO_CAPTURAS} hoje
                            </small>

                        </div>

                    </div>

                )}


                {/* =========================================
                    ARQUIVOS
                ========================================= */}

                {modoArquivos && (

                    <div className="lenteProGaleriaPagina">


                        {/* CABEÇALHO */}

                        <header className="lenteProGaleriaHeader">

                            <button
                                type="button"
                                className="lenteProVoltar"
                                onClick={() =>
                                    setModoArquivos(
                                        false
                                    )
                                }
                            >
                                ‹
                            </button>


                            <div className="lenteProGaleriaTitulo">

                                <span>
                                    SUA SESSÃO
                                </span>

                                <strong>
                                    Arquivos
                                </strong>

                            </div>


                            <div className="lenteProGaleriaUsuario">

                                {usuario?.foto ? (

                                    <img
                                        src={usuario.foto}
                                        alt=""
                                    />

                                ) : (

                                    <span>
                                        {inicialUsuario}
                                    </span>

                                )}

                            </div>

                        </header>


                        {/* IDENTIDADE */}

                        <section className="lenteProGaleriaIdentidade">

                            <div className="lenteProGaleriaLoja">

                                {camera?.imagem ? (

                                    <img
                                        src={camera.imagem}
                                        alt=""
                                    />

                                ) : (

                                    <span>
                                        {(camera?.loja || "L")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>

                                )}

                            </div>


                            <div>

                                <span>
                                    {camera?.camera_nome ||
                                        "Câmera"}
                                </span>

                                <strong>
                                    {camera?.loja ||
                                        "Loja"}
                                </strong>

                                <small>
                                    Capturado por{" "}
                                    {usuario?.nome ||
                                        usuario?.email ||
                                        "usuário"}
                                </small>

                            </div>

                        </section>


                        {/* PENDENTES */}

                        <section className="lenteProSecao">

                            <div className="lenteProSecaoTitulo">

                                <div>

                                    <span>
                                        AGUARDANDO ENVIO
                                    </span>

                                    <strong>
                                        Capturados agora
                                    </strong>

                                </div>

                                <b>
                                    {arquivos.length}
                                </b>

                            </div>


                            {arquivos.length > 0 ? (

                                <div className="lenteProGridArquivos">

                                    {arquivos.map(
                                        item => (

                                            <article
                                                key={
                                                    item.id
                                                }
                                                className="lenteProArquivoCard"
                                            >

                                                {item.tipo ===
                                                    "foto"
                                                    ? (

                                                        <img
                                                            src={item.preview}
                                                            alt=""
                                                            className="lenteProFotoClicavel"
                                                            onClick={() =>
                                                                setFotoAmpliada(
                                                                    item.preview
                                                                )
                                                            }
                                                        />

                                                    )
                                                    : (

                                                        <video
                                                            src={
                                                                item.preview
                                                            }
                                                            controls
                                                            playsInline
                                                        />

                                                    )}


                                                <div className="lenteProArquivoTipo">

                                                    {item.tipo ===
                                                        "foto"
                                                        ? "FOTO"
                                                        : "VÍDEO"}

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removerLocal(
                                                            item.id
                                                        )
                                                    }
                                                    aria-label="Excluir arquivo"
                                                >
                                                    ×
                                                </button>

                                            </article>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div className="lenteProVazio">

                                    <div>
                                        ▦
                                    </div>

                                    <strong>
                                        Nenhum arquivo pendente
                                    </strong>

                                    <span>
                                        As novas fotos e vídeos aparecerão aqui.
                                    </span>

                                </div>

                            )}

                        </section>


                        {/* VPS */}

                        <section className="lenteProSecao">

                            <div className="lenteProSecaoTitulo">

                                <div>

                                    <span>
                                        SALVOS NA VPS
                                    </span>

                                    <strong>
                                        Arquivos enviados
                                    </strong>

                                </div>

                                <b>
                                    {arquivosServidor.length}
                                </b>

                            </div>


                            {arquivosServidor.length > 0 ? (

                                <div className="lenteProGridArquivos">

                                    {arquivosServidor.map(
                                        item => (

                                            <article
                                                key={
                                                    item.id
                                                }
                                                className="lenteProArquivoCard"
                                            >

                                                {arquivoEhVideo(
                                                    item.arquivo_url
                                                )
                                                    ? (

                                                        <video
                                                            src={
                                                                item.arquivo_url
                                                            }
                                                            controls
                                                            playsInline
                                                        />

                                                    )
                                                    : (

                                                        <img
                                                            src={item.arquivo_url}
                                                            alt=""
                                                            className="lenteProFotoClicavel"
                                                            onClick={() =>
                                                                setFotoAmpliada(
                                                                    item.arquivo_url
                                                                )
                                                            }
                                                        />

                                                    )}


                                                <small className="lenteProArquivoData">
                                                    {formatarData(
                                                        item.data
                                                    )}
                                                </small>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        apagarArquivoServidor(
                                                            item.id
                                                        )
                                                    }
                                                    aria-label="Excluir arquivo"
                                                >
                                                    ×
                                                </button>

                                            </article>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div className="lenteProVazio">

                                    <div>
                                        ☁
                                    </div>

                                    <strong>
                                        Nenhum arquivo enviado
                                    </strong>

                                    <span>
                                        Quando você finalizar uma sessão, os arquivos aparecerão aqui.
                                    </span>

                                </div>

                            )}

                        </section>


                        {/* FINALIZAR */}

                        {arquivos.length > 0 && (

                            <div className="lenteProBarraFinalizar">

                                {enviando && (

                                    <div className="lenteProProgresso">

                                        <span
                                            style={{
                                                width:
                                                    `${progresso}%`
                                            }}
                                        />

                                    </div>

                                )}


                                <div>

                                    <span>
                                        {arquivos.length}{" "}
                                        {arquivos.length === 1
                                            ? "arquivo"
                                            : "arquivos"}
                                    </span>

                                    <small>
                                        {enviando
                                            ? `Enviando ${progresso}%`
                                            : "Prontos para enviar"}
                                    </small>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        finalizarEnvio
                                    }
                                    disabled={
                                        enviando ||
                                        gravando
                                    }
                                >

                                    {enviando
                                        ? `${progresso}%`
                                        : "Finalizar"}

                                </button>

                            </div>

                        )}


                        {mensagem && (

                            <div className="lenteProGaleriaMensagem">
                                {mensagem}
                            </div>

                        )}

                    </div>

                )}

            </div>
            {fotoAmpliada &&
                createPortal(
                    <div
                        className="lenteProVisualizador"
                        onClick={() =>
                            setFotoAmpliada(null)
                        }
                        role="dialog"
                        aria-modal="true"
                        aria-label="Visualizar foto"
                    >
                        <img
                            src={fotoAmpliada}
                            alt="Foto ampliada"
                            className="lenteProVisualizadorImagem"
                        />
                    </div>,
                    document.body
                )
            }
        </div>

    );

}