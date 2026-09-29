import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import QRCode from "qrcode";
import { createPortal } from "react-dom";

import { API_URL } from "../../../../../../config";

import "./cadastrados.css";


export default function Cadastrados() {

    /* =====================================================
       ESTADOS
    ===================================================== */

    const [cadastrados, setCadastrados] =
        useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [cadastrando, setCadastrando] =
        useState(false);

    const [atualizando, setAtualizando] =
        useState(false);

    const [qrCodes, setQrCodes] =
        useState({});

    const [qrAberto, setQrAberto] =
        useState(null);

    const [mensagem, setMensagem] =
        useState("");

    const [busca, setBusca] =
        useState("");

    const [copiado, setCopiado] =
        useState(null);
    const [apagando, setApagando] =
        useState(null);

    const [limpandoIncompletos, setLimpandoIncompletos] =
        useState(false);

    const [alerta, setAlerta] =
        useState(null);
    /* =====================================================
       APAGAR CADASTRO
    ===================================================== */

    async function apagarCadastro(cadastro) {

        if (apagando) {
            return;
        }

        const nome =
            cadastro.nome ||
            cadastro.email ||
            "este cadastro";

        const confirmou = await abrirAlertaConfirmacao({
            tipo: "perigo",
            titulo: "Apagar cadastro?",
            mensagem:
                `Você está prestes a apagar ${nome}. ` +
                "Essa ação não pode ser desfeita.",
            confirmarTexto: "Apagar cadastro",
            cancelarTexto: "Cancelar"
        });

        if (!confirmou) {
            return;
        }

        try {

            setApagando(cadastro.id);
            setMensagem("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }

            const resposta = await fetch(
                `${API_URL}/camera/cadastrados/${cadastro.id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const dados =
                await resposta
                    .json()
                    .catch(() => ({}));

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Não foi possível apagar o cadastro."
                );

            }

            setCadastrados(
                anteriores =>
                    anteriores.filter(
                        item =>
                            item.id !== cadastro.id
                    )
            );

            setQrAberto(
                anterior =>
                    anterior === cadastro.id
                        ? null
                        : anterior
            );

            setQrCodes(
                anteriores => {

                    const novos = {
                        ...anteriores
                    };

                    delete novos[cadastro.id];

                    return novos;
                }
            );

        } catch (erro) {

            console.error(
                "[CÂMERA CADASTRADOS] Erro ao apagar:",
                erro
            );

            setMensagem(
                erro.message ||
                "Não foi possível apagar o cadastro."
            );

        } finally {

            setApagando(null);

        }
    }
    /* =====================================================
       APAGAR CADASTROS INCOMPLETOS
    ===================================================== */

    async function apagarIncompletos() {

        if (limpandoIncompletos) {
            return;
        }

        const incompletos =
            cadastrados.filter(cadastro => {

                const nome =
                    String(
                        cadastro.nome || ""
                    ).trim();

                const email =
                    String(
                        cadastro.email || ""
                    ).trim();

                const foto =
                    String(
                        cadastro.foto || ""
                    ).trim();

                return (
                    !nome &&
                    !email &&
                    !foto
                );
            });

        if (incompletos.length === 0) {

            setMensagem(
                "Não existem cadastros incompletos para apagar."
            );

            return;
        }

        const confirmou = await abrirAlertaConfirmacao({
            tipo: "perigo",
            titulo: "Limpar cadastros incompletos?",
            mensagem:
                `Foram encontrados ${incompletos.length} ` +
                `cadastro(s) sem nome, e-mail e foto. ` +
                "Todos esses cadastros serão apagados.",
            confirmarTexto: "Apagar todos",
            cancelarTexto: "Cancelar"
        });

        if (!confirmou) {
            return;
        }

        try {

            setLimpandoIncompletos(true);
            setMensagem("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }

            const resposta = await fetch(
                `${API_URL}/camera/cadastrados/incompletos`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const dados =
                await resposta
                    .json()
                    .catch(() => ({}));

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Não foi possível limpar os cadastros incompletos."
                );

            }

            setCadastrados(
                anteriores =>
                    anteriores.filter(cadastro => {

                        const nome =
                            String(
                                cadastro.nome || ""
                            ).trim();

                        const email =
                            String(
                                cadastro.email || ""
                            ).trim();

                        const foto =
                            String(
                                cadastro.foto || ""
                            ).trim();

                        return (
                            nome ||
                            email ||
                            foto
                        );

                    })
            );

            setQrAberto(null);

            setQrCodes({});

            setMensagem(
                dados.mensagem ||
                `${dados.quantidade || 0} cadastro(s) incompleto(s) apagado(s).`
            );

        } catch (erro) {

            console.error(
                "[CÂMERA CADASTRADOS] Erro ao limpar incompletos:",
                erro
            );

            setMensagem(
                erro.message ||
                "Não foi possível limpar os cadastros incompletos."
            );

        } finally {

            setLimpandoIncompletos(false);

        }
    }
    /* =====================================================
       ALERTA PERSONALIZADO
    ===================================================== */

    function abrirAlertaConfirmacao({
        tipo = "perigo",
        titulo,
        mensagem,
        confirmarTexto = "Confirmar",
        cancelarTexto = "Cancelar"
    }) {

        return new Promise(resolve => {

            setAlerta({
                tipo,
                titulo,
                mensagem,
                confirmarTexto,
                cancelarTexto,
                resolver: resolve
            });

        });
    }


    function fecharAlerta(resultado) {

        if (!alerta) {
            return;
        }

        const resolver =
            alerta.resolver;

        setAlerta(null);

        if (resolver) {
            resolver(resultado);
        }

    }


    /* =====================================================
       CARREGAR CADASTRADOS
    ===================================================== */

    useEffect(() => {

        carregarCadastrados();

    }, []);


    async function carregarCadastrados() {

        try {

            setCarregando(true);
            setMensagem("");

            const token =
                localStorage.getItem("token");


            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }


            const resposta = await fetch(
                `${API_URL}/camera/cadastrados`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const dados =
                await resposta
                    .json()
                    .catch(() => ({}));


            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Não foi possível carregar os cadastrados."
                );

            }


            setCadastrados(
                dados.cadastrados || []
            );

        } catch (erro) {

            console.error(
                "[CÂMERA CADASTRADOS] Erro:",
                erro
            );

            setMensagem(
                erro.message ||
                "Erro ao carregar cadastrados."
            );

        } finally {

            setCarregando(false);

        }

    }


    /* =====================================================
       ATUALIZAR
    ===================================================== */

    async function atualizarLista() {

        if (atualizando) {
            return;
        }

        try {

            setAtualizando(true);
            setMensagem("");

            await carregarCadastrados();

        } finally {

            setAtualizando(false);

        }

    }


    /* =====================================================
       CADASTRAR NOVO
    ===================================================== */

    async function cadastrarNovo() {

        if (cadastrando) {
            return;
        }


        try {

            setCadastrando(true);
            setMensagem("");


            const token =
                localStorage.getItem("token");


            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }


            const resposta = await fetch(
                `${API_URL}/camera/cadastrados`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const dados =
                await resposta
                    .json()
                    .catch(() => ({}));


            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Não foi possível criar o cadastro."
                );

            }


            const novoCadastro =
                dados.cadastro;


            setCadastrados(
                anteriores => [
                    novoCadastro,
                    ...anteriores
                ]
            );


            await abrirQrCode(
                novoCadastro
            );


        } catch (erro) {

            console.error(
                "[CÂMERA CADASTRADOS] Erro ao cadastrar:",
                erro
            );

            setMensagem(
                erro.message ||
                "Não foi possível cadastrar."
            );

        } finally {

            setCadastrando(false);

        }

    }


    /* =====================================================
       LINK DE ACESSO
    ===================================================== */

    function obterLink(cadastro) {

        return (
            `https://ironexecutions.com.br/camera/${cadastro.token}`
        );

    }


    /* =====================================================
       GERAR / ABRIR QR CODE
    ===================================================== */

    async function abrirQrCode(cadastro) {

        try {

            if (
                qrAberto === cadastro.id
            ) {

                setQrAberto(null);

                return;

            }


            const link =
                obterLink(cadastro);


            if (qrCodes[cadastro.id]) {

                setQrAberto(
                    cadastro.id
                );

                return;

            }


            const imagemQr =
                await QRCode.toDataURL(
                    link,
                    {
                        width: 600,

                        margin: 2,

                        errorCorrectionLevel: "H"
                    }
                );


            setQrCodes(
                anteriores => ({
                    ...anteriores,

                    [cadastro.id]:
                        imagemQr
                })
            );


            setQrAberto(
                cadastro.id
            );


        } catch (erro) {

            console.error(
                "[CÂMERA QR] Erro:",
                erro
            );

            setMensagem(
                "Não foi possível gerar o QR Code."
            );

        }

    }


    /* =====================================================
       BAIXAR QR CODE
    ===================================================== */

    async function baixarQrCode(cadastro) {

        try {

            const link =
                obterLink(cadastro);


            let imagemQr =
                qrCodes[cadastro.id];


            if (!imagemQr) {

                imagemQr =
                    await QRCode.toDataURL(
                        link,
                        {
                            width: 1200,

                            margin: 2,

                            errorCorrectionLevel: "H"
                        }
                    );

            }


            const elemento =
                document.createElement("a");


            elemento.href =
                imagemQr;


            elemento.download =
                `camera-${cadastro.token}.png`;


            document.body.appendChild(
                elemento
            );


            elemento.click();


            elemento.remove();


        } catch (erro) {

            console.error(
                "[CÂMERA QR] Erro ao baixar:",
                erro
            );

            setMensagem(
                "Não foi possível baixar o QR Code."
            );

        }

    }


    /* =====================================================
       COPIAR LINK
    ===================================================== */

    async function copiarLink(cadastro) {

        try {

            const link =
                obterLink(cadastro);


            await navigator.clipboard.writeText(
                link
            );


            setCopiado(
                cadastro.id
            );


            setTimeout(() => {

                setCopiado(null);

            }, 2200);


        } catch (erro) {

            console.error(
                "[CÂMERA LINK] Erro ao copiar:",
                erro
            );

            setMensagem(
                "Não foi possível copiar o link."
            );

        }

    }


    /* =====================================================
       ABRIR CÂMERA
    ===================================================== */

    function abrirCamera(cadastro) {

        const link =
            obterLink(cadastro);


        window.open(
            link,
            "_blank",
            "noopener,noreferrer"
        );

    }


    /* =====================================================
       FILTRAR CADASTRADOS
    ===================================================== */

    const cadastradosFiltrados =
        useMemo(() => {

            const termo =
                busca
                    .trim()
                    .toLowerCase();


            if (!termo) {

                return cadastrados;

            }


            return cadastrados.filter(
                cadastro => {

                    const nome =
                        String(
                            cadastro.nome || ""
                        ).toLowerCase();


                    const email =
                        String(
                            cadastro.email || ""
                        ).toLowerCase();


                    const token =
                        String(
                            cadastro.token || ""
                        ).toLowerCase();


                    return (
                        nome.includes(termo) ||
                        email.includes(termo) ||
                        token.includes(termo)
                    );

                }
            );

        }, [
            cadastrados,
            busca
        ]);


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="camera-cadastrados-container">


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="camera-cadastrados-cabecalho">

                <div className="camera-cadastrados-cabecalho-texto">

                    <span className="camera-cadastrados-kicker">
                        CONTROLE DE ACESSOS
                    </span>

                    <h2 className="camera-cadastrados-titulo">
                        Cadastrados
                    </h2>

                    <p className="camera-cadastrados-descricao">
                        Gerencie as pessoas autorizadas a
                        acessar a câmera e seus respectivos
                        links de acesso.
                    </p>

                </div>


                <div className="camera-cadastrados-cabecalho-acoes">
                    <button
                        type="button"
                        className="camera-cadastrados-limpar"
                        onClick={apagarIncompletos}
                        disabled={
                            limpandoIncompletos ||
                            carregando
                        }
                        title="Apagar cadastros que ainda não foram preenchidos"
                    >
                        <span>
                            {limpandoIncompletos ? "..." : "⌫"}
                        </span>

                        {limpandoIncompletos
                            ? "Limpando..."
                            : "Limpar incompletos"
                        }
                    </button>
                    <button
                        type="button"
                        className="camera-cadastrados-atualizar"
                        onClick={atualizarLista}
                        disabled={
                            carregando ||
                            atualizando
                        }
                        title="Atualizar lista"
                    >

                        <span
                            className={
                                atualizando
                                    ? "camera-cadastrados-rotacionando"
                                    : ""
                            }
                        >
                            ↻
                        </span>

                        Atualizar

                    </button>


                    <button
                        type="button"
                        className="camera-cadastrados-novo"
                        onClick={cadastrarNovo}
                        disabled={cadastrando}
                    >

                        <span>
                            +
                        </span>

                        {cadastrando
                            ? "Cadastrando..."
                            : "Cadastrar novo"
                        }

                    </button>

                </div>

            </div>


            {/* =================================================
                RESUMO
            ================================================= */}

            {!carregando && (

                <div className="camera-cadastrados-resumo">

                    <div className="camera-cadastrados-resumo-card">

                        <div>

                            <span>
                                Total de acessos
                            </span>

                            <strong>
                                {cadastrados.length}
                            </strong>

                        </div>

                        <div className="camera-cadastrados-resumo-icone">
                            #
                        </div>

                    </div>


                    <div className="camera-cadastrados-resumo-card">

                        <div>

                            <span>
                                Resultados
                            </span>

                            <strong>
                                {cadastradosFiltrados.length}
                            </strong>

                        </div>

                        <div className="camera-cadastrados-resumo-icone camera-cadastrados-resumo-icone-azul">
                            ✓
                        </div>

                    </div>


                    <div className="camera-cadastrados-resumo-card">

                        <div>

                            <span>
                                QR Codes
                            </span>

                            <strong>
                                {Object.keys(
                                    qrCodes
                                ).length}
                            </strong>

                        </div>

                        <div className="camera-cadastrados-resumo-icone camera-cadastrados-resumo-icone-roxo">
                            QR
                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                MENSAGEM
            ================================================= */}

            {mensagem && (

                <div className="camera-cadastrados-mensagem">

                    <span>
                        !
                    </span>

                    {mensagem}

                </div>

            )}


            {/* =================================================
                BARRA DE FERRAMENTAS
            ================================================= */}

            {!carregando &&
                cadastrados.length > 0 && (

                    <div className="camera-cadastrados-ferramentas">

                        <div className="camera-cadastrados-busca">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={busca}
                                onChange={evento =>
                                    setBusca(
                                        evento.target.value
                                    )
                                }
                                placeholder="Buscar por nome, e-mail ou token..."
                            />

                            {busca && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setBusca("")
                                    }
                                    title="Limpar busca"
                                >
                                    ×
                                </button>

                            )}

                        </div>


                        <span className="camera-cadastrados-resultados">

                            {cadastradosFiltrados.length}

                            {" "}

                            {cadastradosFiltrados.length === 1
                                ? "resultado"
                                : "resultados"
                            }

                        </span>

                    </div>

                )}


            {/* =================================================
                CARREGANDO
            ================================================= */}

            {carregando && (

                <div className="camera-cadastrados-carregando">

                    <div className="camera-cadastrados-spinner" />

                    <strong>
                        Carregando acessos
                    </strong>

                    <span>
                        Buscando os cadastrados da câmera.
                    </span>

                </div>

            )}


            {/* =================================================
                LISTA VAZIA
            ================================================= */}

            {!carregando &&
                cadastrados.length === 0 && (

                    <div className="camera-cadastrados-vazio">

                        <div className="camera-cadastrados-vazio-icone">
                            +
                        </div>

                        <strong>
                            Nenhum acesso cadastrado
                        </strong>

                        <span>
                            Crie um novo cadastro para gerar
                            um acesso exclusivo à câmera.
                        </span>

                        <button
                            type="button"
                            onClick={cadastrarNovo}
                            disabled={cadastrando}
                        >
                            {cadastrando
                                ? "Criando acesso..."
                                : "Criar primeiro acesso"
                            }
                        </button>

                    </div>

                )}


            {/* =================================================
                NENHUM RESULTADO
            ================================================= */}

            {!carregando &&
                cadastrados.length > 0 &&
                cadastradosFiltrados.length === 0 && (

                    <div className="camera-cadastrados-vazio camera-cadastrados-vazio-busca">

                        <div className="camera-cadastrados-vazio-icone">
                            ⌕
                        </div>

                        <strong>
                            Nenhum resultado encontrado
                        </strong>

                        <span>
                            Tente buscar por outro nome,
                            e-mail ou token.
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setBusca("")
                            }
                        >
                            Limpar busca
                        </button>

                    </div>

                )}


            {/* =================================================
                LISTA
            ================================================= */}

            {!carregando &&
                cadastradosFiltrados.length > 0 && (

                    <div className="camera-cadastrados-lista">

                        {cadastradosFiltrados.map(
                            cadastro => {

                                const link =
                                    obterLink(
                                        cadastro
                                    );


                                const aberto =
                                    qrAberto ===
                                    cadastro.id;


                                const foiCopiado =
                                    copiado ===
                                    cadastro.id;


                                return (

                                    <div
                                        className={
                                            aberto
                                                ? "camera-cadastrado-card camera-cadastrado-card-aberto"
                                                : "camera-cadastrado-card"
                                        }
                                        key={cadastro.id}
                                    >


                                        {/* =====================================
                                            CONTEÚDO PRINCIPAL
                                        ===================================== */}

                                        <div className="camera-cadastrado-principal">


                                            {/* FOTO */}

                                            <div className="camera-cadastrado-foto">

                                                {cadastro.foto ? (

                                                    <img
                                                        src={
                                                            cadastro.foto
                                                        }
                                                        alt={
                                                            cadastro.nome ||
                                                            "Cadastrado"
                                                        }
                                                    />

                                                ) : (

                                                    <span>
                                                        {(cadastro.nome ||
                                                            "?")
                                                            .charAt(0)
                                                            .toUpperCase()
                                                        }
                                                    </span>

                                                )}

                                            </div>


                                            {/* INFORMAÇÕES */}

                                            <div className="camera-cadastrado-informacoes">

                                                <div className="camera-cadastrado-identificacao">

                                                    <strong className="camera-cadastrado-nome">

                                                        {cadastro.nome ||
                                                            "Não informado"
                                                        }

                                                    </strong>

                                                    <span className="camera-cadastrado-status">

                                                        <i />

                                                        Acesso ativo

                                                    </span>

                                                </div>


                                                <span className="camera-cadastrado-email">

                                                    {cadastro.email ||
                                                        "E-mail não informado"
                                                    }

                                                </span>


                                                <div className="camera-cadastrado-token-area">

                                                    <span>
                                                        TOKEN
                                                    </span>

                                                    <code>
                                                        {cadastro.token}
                                                    </code>

                                                </div>

                                            </div>


                                            {/* AÇÕES */}

                                            <div className="camera-cadastrado-acoes">


                                                <button
                                                    type="button"
                                                    className="camera-cadastrado-acao"
                                                    onClick={() =>
                                                        copiarLink(
                                                            cadastro
                                                        )
                                                    }
                                                    title="Copiar link"
                                                >

                                                    <span>
                                                        {foiCopiado
                                                            ? "✓"
                                                            : "⧉"
                                                        }
                                                    </span>

                                                    {foiCopiado
                                                        ? "Copiado"
                                                        : "Copiar link"
                                                    }

                                                </button>


                                                <button
                                                    type="button"
                                                    className="camera-cadastrado-acao"
                                                    onClick={() =>
                                                        abrirCamera(
                                                            cadastro
                                                        )
                                                    }
                                                    title="Abrir câmera"
                                                >

                                                    <span>
                                                        ↗
                                                    </span>

                                                    Abrir acesso

                                                </button>


                                                <button
                                                    type="button"
                                                    className={
                                                        aberto
                                                            ? "camera-cadastrado-acao camera-cadastrado-acao-principal camera-cadastrado-acao-ativo"
                                                            : "camera-cadastrado-acao camera-cadastrado-acao-principal"
                                                    }
                                                    onClick={() =>
                                                        abrirQrCode(
                                                            cadastro
                                                        )
                                                    }
                                                    title="Gerar QR Code"
                                                >

                                                    <span>
                                                        QR
                                                    </span>

                                                    {aberto
                                                        ? "Fechar QR"
                                                        : "QR Code"
                                                    }

                                                </button>
                                                <button
                                                    type="button"
                                                    className="camera-cadastrado-acao camera-cadastrado-acao-excluir"
                                                    onClick={() =>
                                                        apagarCadastro(cadastro)
                                                    }
                                                    disabled={
                                                        apagando === cadastro.id
                                                    }
                                                    title="Apagar cadastro"
                                                >
                                                    <span>
                                                        {apagando === cadastro.id
                                                            ? "..."
                                                            : "×"
                                                        }
                                                    </span>

                                                    {apagando === cadastro.id
                                                        ? "Apagando..."
                                                        : "Apagar"
                                                    }
                                                </button>
                                            </div>

                                        </div>


                                        {/* =====================================
                                            LINK
                                        ===================================== */}

                                        <div className="camera-cadastrado-link-area">

                                            <div>

                                                <span>
                                                    LINK DE ACESSO
                                                </span>

                                                <code>
                                                    {link}
                                                </code>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copiarLink(
                                                        cadastro
                                                    )
                                                }
                                            >
                                                {foiCopiado
                                                    ? "Copiado"
                                                    : "Copiar"
                                                }
                                            </button>

                                        </div>


                                        {/* =====================================
                                            QR CODE
                                        ===================================== */}

                                        {aberto && (

                                            <div className="camera-cadastrado-qr-area">

                                                <div className="camera-cadastrado-qr-box">

                                                    {qrCodes[
                                                        cadastro.id
                                                    ] && (

                                                            <img
                                                                src={
                                                                    qrCodes[
                                                                    cadastro.id
                                                                    ]
                                                                }
                                                                alt="QR Code de acesso"
                                                                className="camera-cadastrado-qr-imagem"
                                                            />

                                                        )}

                                                </div>


                                                <div className="camera-cadastrado-qr-dados">

                                                    <span className="camera-cadastrado-qr-kicker">
                                                        ACESSO RÁPIDO
                                                    </span>

                                                    <strong>
                                                        QR Code da câmera
                                                    </strong>

                                                    <p>
                                                        Aponte a câmera do
                                                        celular para acessar
                                                        diretamente o ambiente
                                                        da câmera.
                                                    </p>


                                                    <div className="camera-cadastrado-qr-link">

                                                        {link}

                                                    </div>


                                                    <div className="camera-cadastrado-qr-acoes">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                baixarQrCode(
                                                                    cadastro
                                                                )
                                                            }
                                                        >
                                                            Baixar QR Code
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                abrirCamera(
                                                                    cadastro
                                                                )
                                                            }
                                                        >
                                                            Abrir acesso
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            {alerta &&
                createPortal(
                    <div
                        className="camera-cadastrados-alerta-overlay"
                        onMouseDown={evento => {

                            if (
                                evento.target ===
                                evento.currentTarget
                            ) {
                                fecharAlerta(false);
                            }

                        }}
                    >

                        <div
                            className={
                                `camera-cadastrados-alerta ` +
                                `camera-cadastrados-alerta-${alerta.tipo}`
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="camera-cadastrados-alerta-titulo"
                        >

                            <div className="camera-cadastrados-alerta-icone">
                                {alerta.tipo === "perigo"
                                    ? "!"
                                    : "✓"
                                }
                            </div>

                            <div className="camera-cadastrados-alerta-conteudo">

                                <h3
                                    id="camera-cadastrados-alerta-titulo"
                                >
                                    {alerta.titulo}
                                </h3>

                                <p>
                                    {alerta.mensagem}
                                </p>

                                <div className="camera-cadastrados-alerta-acoes">

                                    <button
                                        type="button"
                                        className="camera-cadastrados-alerta-cancelar"
                                        onClick={() =>
                                            fecharAlerta(false)
                                        }
                                    >
                                        {alerta.cancelarTexto}
                                    </button>

                                    <button
                                        type="button"
                                        className="camera-cadastrados-alerta-confirmar"
                                        onClick={() =>
                                            fecharAlerta(true)
                                        }
                                    >
                                        {alerta.confirmarTexto}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>,
                    document.body
                )}

        </div>

    );

}