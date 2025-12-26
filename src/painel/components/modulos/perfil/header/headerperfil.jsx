import React, { useEffect, useState } from "react";
import ModalModulos from "./modals/modalmodulos";
import ModalCodigo from "./modals/modalcodigo";
import ModalQrcode from "./modals/modaqrcode";
import { API_URL } from "../../../../../../config";
import "./headerperfil.css";

export default function HeaderPerfil({ minimizado, setMinimizado }) {
    const [eventoInstalacao, setEventoInstalacao] = useState(null);

    const [dados, setDados] = useState(null);
    const [loja, setLoja] = useState(null);
    const [fade, setFade] = useState(false);

    const [secaoAtiva, setSecaoAtiva] = useState(null);

    useEffect(() => {
        async function carregar() {
            try {
                const token = localStorage.getItem("token");
                const resp = await fetch(`${API_URL}/clientes/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const json = await resp.json();
                setDados(json);

                // ESSENCIAL
                localStorage.setItem("usuario", JSON.stringify(json));


                if (json.comercio_id) {
                    const respLoja = await fetch(`${API_URL}/comercios/${json.comercio_id}`);
                    const lojaJson = await respLoja.json();
                    setLoja(lojaJson);
                }

                setTimeout(() => setFade(true), 150);

            } catch (err) {
                console.log("Erro ao carregar dados");
            }
        }

        carregar();
    }, []);
    useEffect(() => {
        function capturar(e) {
            e.preventDefault();
            setEventoInstalacao(e);
        }

        window.addEventListener("beforeinstallprompt", capturar);

        return () => {
            window.removeEventListener("beforeinstallprompt", capturar);
        };
    }, []);

    function abrirOuFechar(secao) {
        setSecaoAtiva(prev => prev === secao ? null : secao);
    }

    // skeleton
    if (!dados) {
        return (
            <div className="skeleton-header">
                <div className="loading-logo"></div>
                <div className="loading-lines">
                    <div className="loading-line"></div>
                    <div className="loading-line small"></div>
                </div>
            </div>
        );
    }

    if (minimizado) {
        return (
            <div style={{ display: "none" }}
                className="header-mini header-mini-anim"
                onClick={() => {
                    setMinimizado(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
            >
                <img src={loja?.imagem} className="mini-img" />
                <span className="mini-nome">{loja?.loja}</span>
            </div>
        );
    }
    async function instalarApp() {
        if (!eventoInstalacao) {
            alert("Instalação não disponível neste navegador");
            return;
        }

        eventoInstalacao.prompt();
        const escolha = await eventoInstalacao.userChoice;

        if (escolha.outcome === "accepted") {
            console.log("App instalado");
        }

        setEventoInstalacao(null);
    }

    return (
        <>
            <header className={`per-header fade-in ${fade ? "show" : ""} header-full-anim`}>

                {loja && (
                    <div className="per-loja">
                        <img src={loja.imagem} alt="Logo" className="per-loja-img" />
                        <h2 className="per-loja-nome">{loja.loja}</h2>
                    </div>
                )}

                <div className="per-info">
                    <h2 className="per-nome">{dados.nome_completo}</h2>
                    <p className="per-cargo">Cargo: <strong> {dados.cargo} </strong> </p>
                    <p className="per-funcao">Função no sistema: <strong> {dados.funcao} </strong> </p>
                </div>

                <div className="per-acoes">

                    {dados.funcao === "Administrador(a)" && (
                        <button className="per-btn" onClick={() => abrirOuFechar("modulos")}>
                            Módulos
                        </button>
                    )}

                    <button className="per-btn" onClick={() => abrirOuFechar("codigo")}>
                        Código
                    </button>

                    <button className="per-btn" onClick={() => abrirOuFechar("qrcode")}>
                        QR Code
                    </button>

                    {eventoInstalacao && (
                        <button className="per-btn baixar-app" onClick={instalarApp}>
                            Baixar App
                        </button>
                    )}

                </div>

            </header>

            {/* ÁREA EXPANSÍVEL */}
            <div className={`secao-expandida ${secaoAtiva ? "abrir" : ""}`}>
                {secaoAtiva === "modulos" && (
                    <ModalModulos dados={dados} fechar={() => setSecaoAtiva(null)} />
                )}

                {secaoAtiva === "codigo" && (
                    <ModalCodigo codigo={dados.codigo} fechar={() => setSecaoAtiva(null)} />
                )}

                {secaoAtiva === "qrcode" && (
                    <ModalQrcode qrcode={dados.qrcode} fechar={() => setSecaoAtiva(null)} />
                )}
            </div>
        </>
    );
}
