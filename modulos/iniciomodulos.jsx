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

                                <div className="ie-irene-header-buttons">
                                    <a
                                        href="https://wa.me/5511918547818"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ie-irene-header-button ie-irene-header-button-suporte"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                            fill="currentColor"
                                        >
                                            <path d="M12 2a9.8 9.8 0 0 0-8.45 14.76L2 22l5.4-1.42A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.08-1.12l-.29-.17-3.2.84.86-3.12-.19-.31A8 8 0 1 1 12 20Zm4.4-5.98c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.51.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
                                        </svg>

                                        Suporte
                                    </a>

                                    <button
                                        type="button"
                                        className="ie-irene-header-button ie-irene-header-button-cadastro"
                                        onClick={() => navigate("/cadastrocomercio")}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="10" cy="7" r="4" />
                                            <path d="M20 8v6M17 11h6" />
                                        </svg>

                                        Cadastrar-se
                                    </button>
                                </div>
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
                                    {item.content
                                        .split(/(https:\/\/wa\.me\/5511918547818)/g)
                                        .map((parte, indice) =>
                                            parte === "https://wa.me/5511918547818" ? (
                                                <a
                                                    key={`whatsapp-${indice}`}
                                                    href="https://wa.me/5511918547818"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ie-irene-whatsapp-link"
                                                >
                                                    Falar com Andy pelo WhatsApp
                                                </a>
                                            ) : (
                                                parte
                                            )
                                        )}
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
