import React, {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import {
    GoogleOAuthProvider,
    GoogleLogin
} from "@react-oauth/google";

import { API_URL } from "../config";

import Lente from "./lente";

import cameraImagem from "./camera.png";

import "./camerapublica.css";


const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID;


export default function Camerapublica() {

    const { token } =
        useParams();


    const [
        carregando,
        setCarregando
    ] = useState(true);


    const [
        valido,
        setValido
    ] = useState(null);


    const [
        dados,
        setDados
    ] = useState(null);


    const [
        usuario,
        setUsuario
    ] = useState(null);


    const [
        erro,
        setErro
    ] = useState("");


    /* =====================================================
       CARREGAR TOKEN
    ===================================================== */

    useEffect(() => {

        consultarToken();

    }, [token]);


    /* =====================================================
       TITULO E ICONE DA ABA
    ===================================================== */

    useEffect(() => {

        if (!dados?.camera_nome) {
            return;
        }


        document.title =
            dados.camera_nome;


        let favicon =
            document.querySelector(
                'link[rel="icon"]'
            );


        if (!favicon) {

            favicon =
                document.createElement(
                    "link"
                );

            favicon.rel =
                "icon";

            document.head.appendChild(
                favicon
            );

        }


        favicon.href =
            cameraImagem;


    }, [dados]);


    /* =====================================================
       CONSULTAR TOKEN
    ===================================================== */

    async function consultarToken() {

        try {

            setCarregando(true);

            setErro("");

            setValido(null);


            console.log(
                "[CÂMERA PÚBLICA] Consultando token:",
                token
            );


            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/${encodeURIComponent(token)}`
                );


            const resultado =
                await resposta
                    .json()
                    .catch(() => ({}));


            if (!resposta.ok) {

                setValido(false);

                return;

            }


            console.log(
                "[CÂMERA PÚBLICA] Dados:",
                resultado
            );


            setDados(
                resultado
            );


            setValido(true);


        } catch (erro) {

            console.error(
                "[CÂMERA PÚBLICA] Erro:",
                erro
            );


            setValido(false);


        } finally {

            setCarregando(false);

        }

    }


    /* =====================================================
       DECODIFICAR DADOS GOOGLE
    ===================================================== */

    function decodificarGoogle(
        credential
    ) {

        try {

            const parte =
                credential.split(".")[1];


            const normalizada =
                parte
                    .replace(/-/g, "+")
                    .replace(/_/g, "/");


            const json =
                decodeURIComponent(
                    atob(normalizada)
                        .split("")
                        .map(
                            caractere =>
                                "%" +
                                (
                                    "00" +
                                    caractere
                                        .charCodeAt(0)
                                        .toString(16)
                                ).slice(-2)
                        )
                        .join("")
                );


            return JSON.parse(json);


        } catch (erro) {

            console.error(
                "[GOOGLE] Não foi possível ler credencial:",
                erro
            );


            return null;

        }

    }


    /* =====================================================
       LOGIN GOOGLE
    ===================================================== */

    async function loginGoogle(
        respostaGoogle
    ) {

        try {

            setErro("");


            if (!respostaGoogle?.credential) {

                throw new Error(
                    "O Google não retornou uma credencial."
                );

            }


            const perfilGoogle =
                decodificarGoogle(
                    respostaGoogle.credential
                );


            if (!perfilGoogle?.email) {

                throw new Error(
                    "Não foi possível identificar seu e-mail Google."
                );

            }


            console.log(
                "[CÂMERA PÚBLICA] Google:",
                perfilGoogle.email
            );


            /*
             * Se o token já possui email,
             * impedimos inclusive antes
             * da chamada ao backend.
             *
             * O backend também deve conferir.
             */

            if (
                dados?.email &&
                perfilGoogle.email
                    .toLowerCase() !==
                dados.email
                    .toLowerCase()
            ) {

                throw new Error(
                    `Você deve entrar com ${dados.email}`
                );

            }


            const resposta =
                await fetch(
                    `${API_URL}/camera-publica/login/google`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            token,

                            email:
                                perfilGoogle.email,

                            nome:
                                perfilGoogle.name ||
                                null,

                            foto:
                                perfilGoogle.picture ||
                                null

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
                    "Não foi possível entrar."
                );

            }


            console.log(
                "[CÂMERA PÚBLICA] Login realizado:",
                resultado
            );


            setUsuario(
                resultado.usuario
            );


        } catch (erro) {

            console.error(
                "[CÂMERA PÚBLICA] Login recusado:",
                erro
            );


            setErro(
                erro.message ||
                "Não foi possível entrar."
            );

        }

    }


    /* =====================================================
       CARREGANDO
    ===================================================== */

    if (carregando) {

        return (

            <div className="camera-publica-status">

                <img
                    src={cameraImagem}
                    alt="Câmera"
                />

                <strong>
                    Verificando acesso
                </strong>

                <span>
                    Aguarde um momento...
                </span>

            </div>

        );

    }


    /* =====================================================
       TOKEN INVALIDO
    ===================================================== */

    if (!valido) {

        return (

            <div className="camera-publica-invalido">

                <div className="camera-publica-invalido-card">

                    <div className="camera-publica-invalido-icone">
                        !
                    </div>

                    <h1>
                        Link inválido
                    </h1>

                    <p>
                        Este acesso à câmera não existe
                        ou não está mais disponível.
                    </p>

                    <span>
                        Verifique se o QR Code ou o link
                        utilizado está correto.
                    </span>

                </div>

            </div>

        );

    }


    /* =====================================================
       USUARIO AUTENTICADO
    ===================================================== */

    if (usuario) {

        return (

            <Lente
                usuario={usuario}
                camera={dados}
            />

        );

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    return (

        <GoogleOAuthProvider
            clientId={
                GOOGLE_CLIENT_ID
            }
        >

            <div className="camera-publica-login">

                <div className="camera-publica-login-card">


                    <img
                        src={cameraImagem}
                        alt="Câmera"
                        className="camera-publica-logo"
                    />


                    <div className="camera-publica-login-cabecalho">

                        <span>
                            ACESSO À CÂMERA
                        </span>

                        <h1>
                            {dados?.camera_nome ||
                                "Câmera"}
                        </h1>

                    </div>


                    {dados?.email ? (

                        <div className="camera-publica-email-obrigatorio">

                            <span>
                                Entre utilizando exatamente
                                esta conta Google:
                            </span>

                            <strong>
                                {dados.email}
                            </strong>

                            <small>
                                Nenhuma outra conta poderá
                                acessar esta câmera.
                            </small>

                        </div>

                    ) : (

                        <div className="camera-publica-primeiro-acesso">

                            <strong>
                                Primeiro acesso
                            </strong>

                            <span>
                                Entre com sua conta Google
                                para concluir seu cadastro.
                            </span>

                        </div>

                    )}


                    <div className="camera-publica-google">

                        <GoogleLogin

                            onSuccess={
                                loginGoogle
                            }

                            onError={() => {

                                setErro(
                                    "Não foi possível entrar com o Google."
                                );

                            }}

                            useOneTap={false}

                            theme="outline"

                            size="large"

                            width="320"

                            text="continue_with"

                            shape="rectangular"

                        />

                    </div>


                    {erro && (

                        <div className="camera-publica-erro">

                            {erro}

                        </div>

                    )}


                    <div className="camera-publica-seguranca">

                        Acesso individual protegido
                    </div>

                </div>

            </div>

        </GoogleOAuthProvider>

    );

}