import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import "./arealogin.css";
import { API_URL } from "../../config";

export default function AreaLogin() {
    const [modo, setModo] = useState("email");

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [codigo, setCodigo] = useState("");
    const [qrcode, setQrcode] = useState("");

    const [erro, setErro] = useState("");

    const [cameraAberta, setCameraAberta] = useState(false);
    const [iniciandoCamera, setIniciandoCamera] = useState(false);

    const codigoRef = useRef(null);
    const qrcodeRef = useRef(null);

    const leitorRef = useRef(null);
    const processandoLeituraRef = useRef(false);

    /* =====================================================
       LOGIN
    ===================================================== */

    async function fazerLogin(url, body) {
        setErro("");

        try {
            const resp = await fetch(`${API_URL}${url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const json = await resp.json();

            if (!resp.ok) {
                setErro(json.detail || "Não foi possível realizar o login.");
                return;
            }

            const token =
                json.token ||
                json.access_token ||
                json.jwt ||
                json.accessToken;

            if (!token) {
                setErro("Erro no login: token não recebido.");
                return;
            }

            localStorage.setItem("token", token);

            const payloadBase64 = token.split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const payload = JSON.parse(
                decodeURIComponent(
                    atob(payloadBase64)
                        .split("")
                        .map(
                            caractere =>
                                `%${("00" + caractere.charCodeAt(0).toString(16)).slice(-2)}`
                        )
                        .join("")
                )
            );

            localStorage.setItem(
                "cliente",
                JSON.stringify(payload)
            );

            // =====================================================
            // REDIRECIONAMENTO DEFINIDO PELO BACKEND
            // =====================================================

            window.location.href =
                json.redirect || "/ironbusiness/perfil";

        } catch (error) {
            console.error("[LOGIN] Erro:", error);

            setErro(
                "Não foi possível conectar ao servidor."
            );
        }
    }

    /* =====================================================
       LOGIN EMAIL
    ===================================================== */

    function entrarEmail(e) {
        e.preventDefault();

        fazerLogin("/login/email", {
            email,
            senha
        });
    }

    /* =====================================================
       LOGIN CÓDIGO DE BARRAS
    ===================================================== */

    function entrarCodigo(e) {
        e.preventDefault();

        const valor = codigo.trim();

        if (!valor) return;

        fazerLogin("/login/codigo", {
            codigo: valor
        });
    }

    /* =====================================================
       LOGIN QR CODE
    ===================================================== */

    function entrarQrcode(e) {
        e.preventDefault();

        const valor = qrcode.trim();

        if (!valor) return;

        fazerLogin("/login/qrcode", {
            qrcode: valor
        });
    }

    /* =====================================================
       PARAR CÂMERA
    ===================================================== */

    async function fecharCamera() {
        processandoLeituraRef.current = false;

        const leitor = leitorRef.current;

        if (leitor) {
            try {
                const estado = leitor.getState();

                if (estado === 2 || estado === 3) {
                    await leitor.stop();
                }
            } catch (error) {
                console.warn(
                    "[CAMERA] Erro ao parar:",
                    error
                );
            }

            try {
                await leitor.clear();
            } catch (error) {
                console.warn(
                    "[CAMERA] Erro ao limpar:",
                    error
                );
            }
        }

        leitorRef.current = null;

        setCameraAberta(false);
        setIniciandoCamera(false);
    }

    /* =====================================================
       RESULTADO DA LEITURA
    ===================================================== */

    async function codigoDetectado(texto) {
        if (processandoLeituraRef.current) {
            return;
        }

        const valor = texto?.trim();

        if (!valor) {
            return;
        }

        processandoLeituraRef.current = true;

        console.log(
            "[CAMERA] Código detectado:",
            valor
        );

        if (modo === "codigo") {
            setCodigo(valor);
        }

        if (modo === "qrcode") {
            setQrcode(valor);
        }

        await fecharCamera();

        if (modo === "codigo") {
            fazerLogin("/login/codigo", {
                codigo: valor
            });
        }

        if (modo === "qrcode") {
            fazerLogin("/login/qrcode", {
                qrcode: valor
            });
        }
    }

    /* =====================================================
       ABRIR CÂMERA
    ===================================================== */

    async function abrirCamera() {
        if (cameraAberta || iniciandoCamera) {
            return;
        }

        setErro("");
        setCameraAberta(true);
        setIniciandoCamera(true);

        processandoLeituraRef.current = false;

        try {
            /*
             * Aguarda o React renderizar a DIV
             * #area-login-camera-reader
             */
            await new Promise(resolve =>
                setTimeout(resolve, 150)
            );

            const leitor = new Html5Qrcode(
                "area-login-camera-reader"
            );

            leitorRef.current = leitor;

            await leitor.start(
                {
                    facingMode: "environment"
                },
                {
                    fps: 10,

                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const largura = Math.min(
                            viewfinderWidth * 0.85,
                            320
                        );

                        if (modo === "codigo") {
                            return {
                                width: largura,
                                height: 130
                            };
                        }

                        const tamanho = Math.min(
                            viewfinderWidth * 0.72,
                            viewfinderHeight * 0.72,
                            280
                        );

                        return {
                            width: tamanho,
                            height: tamanho
                        };
                    }
                },
                codigoDetectado,
                () => {
                    /*
                     * Ignora tentativas em que nenhum
                     * código foi encontrado no frame.
                     */
                }
            );

            setIniciandoCamera(false);
        } catch (error) {
            console.error(
                "[CAMERA] Erro ao abrir câmera:",
                error
            );

            leitorRef.current = null;

            setCameraAberta(false);
            setIniciandoCamera(false);

            setErro(
                "Não foi possível abrir a câmera. Verifique a permissão da câmera no navegador."
            );
        }
    }

    /* =====================================================
       TROCAR MODO
    ===================================================== */

    async function trocarModo(novoModo) {
        if (cameraAberta) {
            await fecharCamera();
        }

        setErro("");
        setModo(novoModo);
    }

    /* =====================================================
       FECHAR CÂMERA AO SAIR
    ===================================================== */

    useEffect(() => {
        return () => {
            const leitor = leitorRef.current;

            if (!leitor) {
                return;
            }

            try {
                leitor.stop().catch(() => { });
            } catch {
                // câmera já estava parada
            }
        };
    }, []);

    return (
        <div className="area-login-container">

            <h2>Entrar</h2>

            <div className="modo-botoes">

                <button
                    type="button"
                    className={
                        modo === "email"
                            ? "area-login-modo-ativo"
                            : ""
                    }
                    onClick={() => trocarModo("email")}
                >
                    Email e senha
                </button>

                <button
                    type="button"
                    className={
                        modo === "codigo"
                            ? "area-login-modo-ativo"
                            : ""
                    }
                    onClick={() => trocarModo("codigo")}
                >
                    Código de Barras
                </button>

                <button
                    type="button"
                    className={
                        modo === "qrcode"
                            ? "area-login-modo-ativo"
                            : ""
                    }
                    onClick={() => trocarModo("qrcode")}
                >
                    QR Code
                </button>

            </div>

            {erro && (
                <p className="erro">
                    {erro}
                </p>
            )}

            {/* =================================================
                EMAIL
            ================================================= */}

            {modo === "email" && (

                <form
                    onSubmit={entrarEmail}
                    className="area-login-form"
                >

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={e =>
                            setEmail(e.target.value)
                        }
                        autoComplete="email"
                    />

                    <label>Senha</label>

                    <input
                        type="password"
                        value={senha}
                        onChange={e =>
                            setSenha(e.target.value)
                        }
                        autoComplete="current-password"
                    />

                    <button type="submit">
                        Entrar
                    </button>

                </form>

            )}

            {/* =================================================
                CÓDIGO DE BARRAS
            ================================================= */}

            {modo === "codigo" && (

                <form
                    onSubmit={entrarCodigo}
                    className="area-login-form"
                >

                    {!cameraAberta && (
                        <>
                            <div
                                className="barcode-box"
                                onClick={() =>
                                    codigoRef.current?.focus()
                                }
                            >

                                <span>
                                    Clique e escaneie o código
                                </span>

                                <input
                                    ref={codigoRef}
                                    value={codigo}
                                    onChange={e =>
                                        setCodigo(
                                            e.target.value
                                        )
                                    }
                                    className="barcode-input"
                                    autoFocus
                                />

                            </div>

                            <button
                                type="button"
                                className="area-login-camera-botao"
                                onClick={abrirCamera}
                            >
                                <span className="area-login-camera-icone">
                                    ▣
                                </span>

                                Abrir câmera
                            </button>
                        </>
                    )}

                </form>

            )}

            {/* =================================================
                QR CODE
            ================================================= */}

            {modo === "qrcode" && (

                <form
                    onSubmit={entrarQrcode}
                    className="area-login-form"
                >

                    {!cameraAberta && (
                        <>
                            <div
                                className="qrcode-box"
                                onClick={() =>
                                    qrcodeRef.current?.focus()
                                }
                            >

                                <div className="qrcode-desenho" />

                                <span>
                                    Clique e escaneie o QR Code
                                </span>

                                <input
                                    ref={qrcodeRef}
                                    value={qrcode}
                                    onChange={e =>
                                        setQrcode(
                                            e.target.value
                                        )
                                    }
                                    className="barcode-input"
                                    autoFocus
                                />

                            </div>

                            <button
                                type="button"
                                className="area-login-camera-botao"
                                onClick={abrirCamera}
                            >
                                <span className="area-login-camera-icone">
                                    ▣
                                </span>

                                Abrir câmera
                            </button>
                        </>
                    )}

                </form>

            )}

            {/* =================================================
                CÂMERA
            ================================================= */}

            {cameraAberta && (

                <div className="area-login-camera-modal">

                    <div className="area-login-camera-cabecalho">

                        <div>
                            <strong>
                                {modo === "codigo"
                                    ? "Ler código de barras"
                                    : "Ler QR Code"}
                            </strong>

                            <span>
                                Aponte a câmera para o código
                            </span>
                        </div>

                        <button
                            type="button"
                            className="area-login-camera-fechar"
                            onClick={fecharCamera}
                        >
                            ×
                        </button>

                    </div>

                    <div className="area-login-camera-visor">

                        <div
                            id="area-login-camera-reader"
                            className="area-login-camera-reader"
                        />

                        <div
                            className={
                                modo === "codigo"
                                    ? "area-login-camera-mira area-login-camera-mira-barra"
                                    : "area-login-camera-mira area-login-camera-mira-qr"
                            }
                        />

                        {iniciandoCamera && (
                            <div className="area-login-camera-carregando">
                                Abrindo câmera...
                            </div>
                        )}

                    </div>

                    <p className="area-login-camera-instrucao">
                        {modo === "codigo"
                            ? "Posicione o código de barras dentro da área indicada."
                            : "Posicione o QR Code dentro do quadrado."}
                    </p>

                </div>

            )}

        </div>
    );
}