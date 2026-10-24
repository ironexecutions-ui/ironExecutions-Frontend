import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import favicon from "/favicon.png";
import { API_URL } from "../config";
import AreaLogin from "./inicio_modulos/arealogin";
import LojasAvaliacao from "./inicio_modulos/lojasavaliacao";
import Rodape from "./inicio_modulos/rodape";
import ExplicacaoModulos from "./inicio_modulos/explicacaomodulos";
import HeaderInicio from "./inicio_modulos/headerinicio";
import Parceiros from "./inicio_modulos/parceiros";
import "./inicio-modulos.css";


const MENSAGEM_INICIAL = {
    role: "assistant",
    content:
        "Olá! Eu sou a Irene, a assistente virtual do Iron Executions. Posso ajudar você a conhecer a plataforma e tirar dúvidas. Como posso ajudar?",
};

const MAX_HISTORICO = 8;

export default function InicioModulos() {
    const location = useLocation();
    const navigate = useNavigate();

    const [chatAberto, setChatAberto] = useState(false);
    const [mensagens, setMensagens] = useState([MENSAGEM_INICIAL]);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const listaMensagensRef = useRef(null);
    const campoMensagemRef = useRef(null);

    const empresaSlug = location.pathname
        .replace("/", "")
        .replace(/^\/+/, "");

    useEffect(() => {
        if (listaMensagensRef.current) {
            listaMensagensRef.current.scrollTo({
                top: listaMensagensRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [mensagens, carregando]);

    useEffect(() => {
        if (!chatAberto) return undefined;

        const overflowAnterior = document.body.style.overflow;
        const bloquearScroll = () => {
            if (window.matchMedia("(max-width: 640px)").matches) {
                document.body.style.overflow = "hidden";
            }
        };

        bloquearScroll();
        window.addEventListener("resize", bloquearScroll);

        const timer = window.setTimeout(() => campoMensagemRef.current?.focus(), 120);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("resize", bloquearScroll);
            document.body.style.overflow = overflowAnterior;
        };
    }, [chatAberto]);

    useEffect(() => {
        function fecharComEsc(event) {
            if (event.key === "Escape") setChatAberto(false);
        }

        window.addEventListener("keydown", fecharComEsc);
        return () => window.removeEventListener("keydown", fecharComEsc);
    }, []);

    async function enviarMensagem(event) {
        event?.preventDefault();

        const texto = mensagem.trim();
        if (!texto || carregando) return;

        const historicoAnterior = mensagens
            .filter((item) => item.role === "user" || item.role === "assistant")
            .slice(-MAX_HISTORICO);

        const mensagemUsuario = { role: "user", content: texto };
        const historicoAtualizado = [...mensagens, mensagemUsuario];

        setMensagens(historicoAtualizado);
        setMensagem("");
        setErro("");
        setCarregando(true);

        try {
            // Rota pública: não envia token e não consulta dados privados do comércio.
            const resposta = await fetch(`${API_URL}/ia/conversar-livre`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mensagem: texto,
                    historico: historicoAnterior.slice(-MAX_HISTORICO),
                }),
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    typeof dados.detail === "string"
                        ? dados.detail
                        : "Não consegui responder agora. Tente novamente."
                );
            }

            const conteudo = String(dados.resposta || "").trim();
            if (!conteudo) {
                throw new Error("A Irene retornou uma resposta vazia. Tente novamente.");
            }

            setMensagens((atuais) => [
                ...atuais,
                { role: "assistant", content: conteudo },
            ]);
        } catch (e) {
            setErro(
                e?.message ||
                "Não foi possível conectar à Irene. Verifique sua conexão e tente novamente."
            );
        } finally {
            setCarregando(false);
            window.setTimeout(() => campoMensagemRef.current?.focus(), 50);
        }
    }

    function abrirChat() {
        setChatAberto(true);
        setErro("");
    }

    function fecharChat() {
        setChatAberto(false);
    }

    function limparConversa() {
        setMensagens([MENSAGEM_INICIAL]);
        setMensagem("");
        setErro("");
    }

    return (
        <div className="inicio-modulos-fundo">
            <HeaderInicio empresaInicial={empresaSlug} />

            <AreaLogin />
            <br />
            <LojasAvaliacao />
            <Parceiros />
            <ExplicacaoModulos />

            {/* Botão flutuante da Irene */}
            {!chatAberto && (
                <button
                    type="button"
                    className="ie-irene-launcher"
                    onClick={abrirChat}
                    aria-label="Abrir conversa com Irene"
                    title="Conversar com Irene"
                >
                    <span className="ie-irene-launcher-pulse" aria-hidden="true" />
                    <img src={favicon} alt="" className="ie-irene-launcher-logo" />
                    <span className="ie-irene-launcher-status" aria-hidden="true" />
                </button>
            )}

            {/* Chat flutuante no desktop e tela cheia no celular */}
            {chatAberto && (
                <section
                    className="ie-irene-chat"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Chat com Irene"
                >
                    <header className="ie-irene-chat-header">
                        <div className="ie-irene-chat-brand">
                            <div className="ie-irene-chat-avatar">
                                <img src={favicon} alt="" />
                            </div>
                            <div className="ie-irene-chat-brand-text">
                                <strong>Irene</strong>
                                <span>
                                    <i aria-hidden="true" />
                                    Assistente do Iron Executions
                                </span>
                            </div>
                        </div>

                        <div className="ie-irene-chat-actions">
                            <button
                                type="button"
                                onClick={limparConversa}
                                className="ie-irene-icon-button"
                                aria-label="Nova conversa"
                                title="Nova conversa"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 7v5h5M5.5 16a7.5 7.5 0 1 0-.3-7.2L4 12" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={fecharChat}
                                className="ie-irene-icon-button"
                                aria-label="Fechar Irene"
                                title="Fechar"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="m6 6 12 12M18 6 6 18" />
                                </svg>
                            </button>
                        </div>
                    </header>

                    <div className="ie-irene-chat-subheader">
                        Tire dúvidas sobre a plataforma ou converse livremente.
                    </div>

                    <div
                        className="ie-irene-chat-messages"
                        ref={listaMensagensRef}
                        aria-live="polite"
                        aria-relevant="additions text"
                    >
                        {mensagens.map((item, index) => (
                            <div
                                key={`${index}-${item.role}`}
                                className={`ie-irene-message ${item.role === "user"
                                    ? "ie-irene-message-user"
                                    : "ie-irene-message-assistant"
                                    }`}
                            >
                                {item.role === "assistant" && (
                                    <img
                                        src={favicon}
                                        alt=""
                                        className="ie-irene-message-avatar"
                                    />
                                )}
                                <div className="ie-irene-message-bubble">
                                    {item.content}
                                </div>
                            </div>
                        ))}

                        {carregando && (
                            <div className="ie-irene-message ie-irene-message-assistant">
                                <img
                                    src={favicon}
                                    alt=""
                                    className="ie-irene-message-avatar"
                                />
                                <div className="ie-irene-message-bubble ie-irene-typing">
                                    <span />
                                    <span />
                                    <span />
                                    <em>Irene está pensando…</em>
                                </div>
                            </div>
                        )}
                    </div>

                    {erro && (
                        <div className="ie-irene-chat-error" role="alert">
                            <span>{erro}</span>
                            <button type="button" onClick={() => setErro("")} aria-label="Dispensar erro">
                                ×
                            </button>
                        </div>
                    )}

                    <form className="ie-irene-chat-composer" onSubmit={enviarMensagem}>
                        <textarea
                            ref={campoMensagemRef}
                            value={mensagem}
                            onChange={(event) => setMensagem(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    enviarMensagem(event);
                                }
                            }}
                            placeholder="Escreva sua mensagem..."
                            aria-label="Mensagem para Irene"
                            rows={1}
                            maxLength={4000}
                            disabled={carregando}
                        />
                        <button
                            type="submit"
                            className="ie-irene-send"
                            disabled={!mensagem.trim() || carregando}
                            aria-label="Enviar mensagem"
                            title="Enviar"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 12 20 4l-5 16-3-7-8-1Z" />
                                <path d="m12 13 8-9" />
                            </svg>
                        </button>
                    </form>
                    <div className="ie-irene-chat-footnote">
                        A Irene pode cometer erros. Não envie senhas ou dados confidenciais.
                    </div>
                </section>
            )}

            <Rodape />
        </div>
    );
}
