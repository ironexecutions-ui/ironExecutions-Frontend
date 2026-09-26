import React, {
    useEffect,
    useState
} from "react";

import QRCode from "qrcode";

import { API_URL } from "../../../../../../config";

import "./cadastrados.css";


export default function Cadastrados() {

    const [cadastrados, setCadastrados] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [cadastrando, setCadastrando] = useState(false);

    const [qrCodes, setQrCodes] = useState({});

    const [qrAberto, setQrAberto] = useState(null);

    const [mensagem, setMensagem] = useState("");


    /* =====================================================
       CARREGAR CADASTRADOS
    ===================================================== */

    useEffect(() => {

        carregarCadastrados();

    }, []);


    async function carregarCadastrados() {

        try {

            setCarregando(true);

            const token =
                localStorage.getItem("token");

            if (!token) {

                console.error(
                    "[CÂMERA CADASTRADOS] Token não encontrado"
                );

                return;
            }


            console.log(
                "[CÂMERA CADASTRADOS] Carregando..."
            );


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


            console.log(
                "[CÂMERA CADASTRADOS] Recebidos:",
                dados
            );


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


            console.log(
                "[CÂMERA CADASTRADOS] Criando cadastro..."
            );


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


            console.log(
                "[CÂMERA CADASTRADOS] Criado:",
                dados
            );


            const novoCadastro =
                dados.cadastro;


            /*
             * Coloca imediatamente
             * no começo da lista.
             */

            setCadastrados(
                anteriores => [
                    novoCadastro,
                    ...anteriores
                ]
            );


            /*
             * Já abre o QR Code
             * automaticamente.
             */

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
       GERAR / ABRIR QR CODE
    ===================================================== */

    async function abrirQrCode(cadastro) {

        try {

            /*
             * Se clicar novamente no mesmo,
             * fecha o QR.
             */

            if (qrAberto === cadastro.id) {

                setQrAberto(null);

                return;

            }


            const link =
                `https://ironexecutions.com.br/camera/${cadastro.token}`

            /*
             * Se já geramos anteriormente,
             * não precisa gerar novamente.
             */

            if (qrCodes[cadastro.id]) {

                setQrAberto(
                    cadastro.id
                );

                return;

            }


            console.log(
                "[CÂMERA QR] Gerando:",
                link
            );


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
                `https://ironexecutions.com.br/camera/${cadastro.token}`

            let imagemQr =
                qrCodes[cadastro.id];


            /*
             * Caso ainda não tenha sido
             * gerado, gera agora.
             */

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
       RENDER
    ===================================================== */

    return (

        <div className="camera-cadastrados-container">


            {/* =============================================
                CABECALHO
            ============================================= */}

            <div className="camera-cadastrados-cabecalho">

                <div>

                    <h2 className="camera-cadastrados-titulo">
                        Cadastrados
                    </h2>

                    <p className="camera-cadastrados-descricao">
                        Gerencie as pessoas cadastradas
                        para utilizar a câmera.
                    </p>

                </div>


                <button
                    type="button"
                    className="camera-cadastrados-novo"
                    onClick={cadastrarNovo}
                    disabled={cadastrando}
                >

                    <span className="camera-cadastrados-novo-mais">
                        +
                    </span>

                    {cadastrando
                        ? "Cadastrando..."
                        : "Cadastrar novo"
                    }

                </button>

            </div>


            {/* =============================================
                MENSAGEM
            ============================================= */}

            {mensagem && (

                <div className="camera-cadastrados-mensagem">

                    {mensagem}

                </div>

            )}


            {/* =============================================
                CARREGANDO
            ============================================= */}

            {carregando && (

                <div className="camera-cadastrados-carregando">

                    Carregando cadastrados...

                </div>

            )}


            {/* =============================================
                LISTA VAZIA
            ============================================= */}

            {!carregando &&
                cadastrados.length === 0 && (

                    <div className="camera-cadastrados-vazio">

                        <strong>
                            Nenhum cadastro
                        </strong>

                        <span>
                            Clique em "Cadastrar novo"
                            para gerar o primeiro acesso.
                        </span>

                    </div>

                )}


            {/* =============================================
                LISTA
            ============================================= */}

            {!carregando &&
                cadastrados.length > 0 && (

                    <div className="camera-cadastrados-lista">

                        {cadastrados.map(
                            cadastro => {

                                const link =
                                    `https://ironexecutions.com.br/camera/${cadastro.token}`
                                const aberto =
                                    qrAberto === cadastro.id;


                                return (

                                    <div
                                        className="camera-cadastrado-card"
                                        key={cadastro.id}
                                    >


                                        {/* FOTO */}

                                        <div className="camera-cadastrado-foto">

                                            {cadastro.foto ? (

                                                <img
                                                    src={cadastro.foto}
                                                    alt={
                                                        cadastro.nome ||
                                                        "Cadastrado"
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    ?
                                                </span>

                                            )}

                                        </div>


                                        {/* INFORMACOES */}

                                        <div className="camera-cadastrado-informacoes">

                                            <strong className="camera-cadastrado-nome">

                                                {cadastro.nome ||
                                                    "Não informado"}

                                            </strong>


                                            <span className="camera-cadastrado-email">

                                                {cadastro.email ||
                                                    "Não informado"}

                                            </span>


                                            <span className="camera-cadastrado-token">

                                                Token: {cadastro.token}

                                            </span>

                                        </div>


                                        {/* ACOES */}

                                        <div className="camera-cadastrado-acoes">

                                            <button
                                                type="button"
                                                className={
                                                    aberto
                                                        ? "camera-cadastrado-qrcode camera-cadastrado-qrcode-ativo"
                                                        : "camera-cadastrado-qrcode"
                                                }
                                                onClick={() =>
                                                    abrirQrCode(
                                                        cadastro
                                                    )
                                                }
                                            >

                                                {aberto
                                                    ? "Fechar QR Code"
                                                    : "Gerar QR Code"
                                                }

                                            </button>

                                        </div>


                                        {/* QR CODE */}

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
                                                                alt="QR Code"
                                                                className="camera-cadastrado-qr-imagem"
                                                            />

                                                        )}

                                                </div>


                                                <div className="camera-cadastrado-qr-dados">

                                                    <strong>
                                                        QR Code de acesso
                                                    </strong>

                                                    <span>
                                                        Aponte a câmera
                                                        do celular para
                                                        acessar.
                                                    </span>


                                                    <div className="camera-cadastrado-link">

                                                        {link}

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="camera-cadastrado-baixar"
                                                        onClick={() =>
                                                            baixarQrCode(
                                                                cadastro
                                                            )
                                                        }
                                                    >

                                                        Baixar QR Code

                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

        </div>

    );

}