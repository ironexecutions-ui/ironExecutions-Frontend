import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../config";
import favicon from "./favicon.png";
import "./irene.css";

const MAX_HISTORICO = 8;
const CHAVE_CACHE = "ie_irene_conversa";
const CHAVE_DATA = "ie_irene_conversa_data";

function obterDataLocal() {
    const agora = new Date();
    return [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, "0"),
        String(agora.getDate()).padStart(2, "0"),
    ].join("-");
}

function obterMensagemInicial() {
    return {
        role: "assistant",
        content: "Olá! Eu sou a Irene, a assistente inteligente a iron Executions. Como posso ajudar você hoje?",
    };
}

function carregarMensagensDoDia() {
    try {
        const hoje = obterDataLocal();
        if (localStorage.getItem(CHAVE_DATA) !== hoje) {
            localStorage.removeItem(CHAVE_CACHE);
            localStorage.setItem(CHAVE_DATA, hoje);
            return [obterMensagemInicial()];
        }

        const cache = localStorage.getItem(CHAVE_CACHE);
        if (!cache) return [obterMensagemInicial()];

        const salvas = JSON.parse(cache);
        if (
            !Array.isArray(salvas) ||
            !salvas.every(
                (item) =>
                    item &&
                    ["user", "assistant"].includes(item.role) &&
                    typeof item.content === "string"
            )
        ) {
            localStorage.removeItem(CHAVE_CACHE);
            return [obterMensagemInicial()];
        }

        return salvas.length ? salvas : [obterMensagemInicial()];
    } catch (error) {
        console.error("Erro ao carregar conversa da Irene:", error);
        return [obterMensagemInicial()];
    }
}

export default function Irene() {
    const [mensagens, setMensagens] = useState(carregarMensagensDoDia);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [textoDigitado, setTextoDigitado] = useState("");
    const [indiceDigitando, setIndiceDigitando] = useState(null);

    const listaMensagensRef = useRef(null);
    const campoMensagemRef = useRef(null);
    const animacaoRef = useRef(null);

    useEffect(() => {
        try {
            if (localStorage.getItem(CHAVE_DATA) !== obterDataLocal()) {
                localStorage.setItem(CHAVE_DATA, obterDataLocal());
                localStorage.removeItem(CHAVE_CACHE);
                return;
            }
            localStorage.setItem(CHAVE_CACHE, JSON.stringify(mensagens));
        } catch (error) {
            console.error("Erro ao salvar conversa da Irene:", error);
        }
    }, [mensagens]);

    useEffect(() => {
        function verificarData() {
            const hoje = obterDataLocal();
            if (localStorage.getItem(CHAVE_DATA) === hoje) return;

            localStorage.setItem(CHAVE_DATA, hoje);
            localStorage.removeItem(CHAVE_CACHE);
            if (animacaoRef.current) clearInterval(animacaoRef.current);
            animacaoRef.current = null;
            setMensagens([obterMensagemInicial()]);
            setMensagem("");
            setErro("");
            setCarregando(false);
            setTextoDigitado("");
            setIndiceDigitando(null);
        }

        window.addEventListener("focus", verificarData);
        document.addEventListener("visibilitychange", verificarData);
        return () => {
            window.removeEventListener("focus", verificarData);
            document.removeEventListener("visibilitychange", verificarData);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (animacaoRef.current) clearInterval(animacaoRef.current);
        };
    }, []);

    useEffect(() => {
        const lista = listaMensagensRef.current;
        if (lista) {
            lista.scrollTo({
                top: lista.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [mensagens, carregando, textoDigitado]);

    function animarResposta(texto, indice) {
        if (animacaoRef.current) clearInterval(animacaoRef.current);
        setTextoDigitado("");
        setIndiceDigitando(indice);

        let posicao = 0;
        animacaoRef.current = setInterval(() => {
            posicao += 1;
            setTextoDigitado(texto.slice(0, posicao));

            if (posicao >= texto.length) {
                clearInterval(animacaoRef.current);
                animacaoRef.current = null;
                setIndiceDigitando(null);
            }
        }, 18);
    }

    useEffect(() => {
        const sincronizarCache = () => {
            try {
                const hoje = obterDataLocal();
                const dataSalva = localStorage.getItem(CHAVE_DATA);

                if (dataSalva !== hoje) {
                    localStorage.setItem(CHAVE_DATA, hoje);
                    localStorage.removeItem(CHAVE_CACHE);
                    setMensagens([obterMensagemInicial()]);
                    setMensagem("");
                    setErro("");
                    setCarregando(false);
                    return;
                }

                const cache = localStorage.getItem(CHAVE_CACHE);
                if (!cache) return;

                const mensagensCache = JSON.parse(cache);

                if (
                    !Array.isArray(mensagensCache) ||
                    !mensagensCache.every(
                        (item) =>
                            item &&
                            ["user", "assistant"].includes(item.role) &&
                            typeof item.content === "string"
                    )
                ) {
                    return;
                }

                setMensagens((atuais) => {
                    if (
                        JSON.stringify(atuais) ===
                        JSON.stringify(mensagensCache)
                    ) {
                        return atuais;
                    }

                    return mensagensCache;
                });
            } catch (error) {
                console.error("Erro ao sincronizar cache da Irene:", error);
            }
        };

        const intervalo = setInterval(sincronizarCache, 1000);

        return () => clearInterval(intervalo);
    }, []);

    function obterToken() {
        return localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            "";
    }

    async function enviarMensagem(event) {
        event?.preventDefault();
        const texto = mensagem.trim();
        if (!texto || carregando) return;

        const hoje = obterDataLocal();
        let mensagensAtuais = mensagens;

        if (localStorage.getItem(CHAVE_DATA) !== hoje) {
            mensagensAtuais = [obterMensagemInicial()];
            localStorage.removeItem(CHAVE_CACHE);
            localStorage.setItem(CHAVE_DATA, hoje);
            setMensagens(mensagensAtuais);
        }

        const novaMensagem = { role: "user", content: texto };
        const historicoCompleto = [...mensagensAtuais, novaMensagem];
        const historicoParaApi = historicoCompleto
            .slice(-MAX_HISTORICO)
            .slice(0, -1)
            .map(({ role, content }) => ({ role, content }));

        const mensagensComUsuario = [...mensagensAtuais, novaMensagem];
        setMensagens(mensagensComUsuario);
        setMensagem("");
        setErro("");
        setCarregando(true);

        try {
            const token = obterToken();
            if (!token) {
                throw new Error("Sua sessão não foi encontrada. Entre novamente no sistema.");
            }

            const resposta = await fetch(`${API_URL}/ia/conversar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mensagem: texto,
                    historico: historicoParaApi,
                }),
            });

            if (resposta.status === 401) {
                throw new Error("Sua sessão expirou. Entre novamente no Iron Executions.");
            }

            const dados = await resposta.json().catch(() => ({}));
            if (!resposta.ok) {
                throw new Error(
                    typeof dados.detail === "string"
                        ? dados.detail
                        : "Não foi possível obter uma resposta da Irene."
                );
            }

            if (typeof dados.resposta !== "string" || !dados.resposta.trim()) {
                throw new Error("A Irene recebeu uma resposta inválida do servidor.");
            }

            if (obterDataLocal() !== hoje) {
                const inicial = [obterMensagemInicial()];
                setMensagens(inicial);
                setErro("O dia mudou. Comece uma nova conversa com a Irene.");
                return;
            }

            const respostaIrene = dados.resposta.trim();
            const indiceResposta = mensagensComUsuario.length;
            const conversaFinal = [
                ...mensagensComUsuario,
                { role: "assistant", content: respostaIrene },
            ];

            setMensagens(conversaFinal);
            animarResposta(respostaIrene, indiceResposta);
        } catch (error) {
            setErro(error.message || "Não foi possível conectar à Irene. Tente novamente.");
        } finally {
            setCarregando(false);
            campoMensagemRef.current?.focus();
        }
    }

    function tratarTecla(event) {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            enviarMensagem(event);
        }
    }

    function limparConversa() {
        if (carregando) return;
        if (animacaoRef.current) clearInterval(animacaoRef.current);
        animacaoRef.current = null;

        const inicial = [obterMensagemInicial()];
        setMensagens(inicial);
        setMensagem("");
        setErro("");
        setTextoDigitado("");
        setIndiceDigitando(null);

        try {
            localStorage.setItem(CHAVE_DATA, obterDataLocal());
            localStorage.setItem(CHAVE_CACHE, JSON.stringify(inicial));
        } catch (error) {
            console.error("Erro ao limpar conversa da Irene:", error);
        }
        campoMensagemRef.current?.focus();
    }

    return (
        <main className="ie-irene-page">
            <section className="ie-irene-page__workspace">
                <header className="ie-irene-page__header">
                    <div className="ie-irene-page__brand">
                        <div className="ie-irene-page__brand-image-wrap">
                            <img
                                className="ie-irene-page__brand-image"
                                src={favicon}
                                alt="Irene"
                            />
                            <span className="ie-irene-page__online-dot" />
                        </div>
                        <div className="ie-irene-page__brand-copy">
                            <div className="ie-irene-page__title-line">
                                <h1 className="ie-irene-page__title">Irene</h1>
                                <span className="ie-irene-page__badge">AI ASSISTANT</span>
                            </div>
                            <p className="ie-irene-page__subtitle">
                                Sua assistente inteligente a iron Executions
                            </p>
                        </div>
                    </div>

                    <div className="ie-irene-page__header-actions">
                        <div className="ie-irene-page__status">
                            <span className="ie-irene-page__status-dot" />
                            <span>Assistente disponível</span>
                        </div>
                        <button
                            type="button"
                            className="ie-irene-page__clear-button"
                            onClick={limparConversa}
                            disabled={carregando}
                            title="Começar uma nova conversa"
                            aria-label="Limpar conversa"
                        >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                    d="M3 6h18M9 6V4h6v2m-9 0 1 14h10l1-14M10 10v6m4-6v6"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>Nova conversa</span>
                        </button>
                    </div>
                </header>

                <div
                    className="ie-irene-page__conversation"
                    ref={listaMensagensRef}
                    role="log"
                    aria-label="Conversa com Irene"
                    aria-live="polite"
                    aria-relevant="additions text"
                >
                    <div className="ie-irene-page__conversation-inner">
                        {mensagens.length === 1 && (
                            <div className="ie-irene-page__welcome">
                                <div className="ie-irene-page__welcome-orb">
                                    <img src={favicon} alt="" />
                                </div>
                                <span className="ie-irene-page__eyebrow">
                                    IRON EXECUTIONS INTELLIGENCE
                                </span>
                                <h2>Como posso ajudar você hoje?</h2>
                                <p>
                                    Tire dúvidas sobre a plataforma e encontre
                                    orientações para utilizar os recursos a iron Executions.
                                </p>
                            </div>
                        )}

                        {mensagens.map((item, indice) => (
                            <article
                                className={`ie-irene-page__message ie-irene-page__message--${item.role}`}
                                key={`${indice}-${item.role}`}
                            >
                                {item.role === "assistant" && (
                                    <div className="ie-irene-page__message-avatar">
                                        <img src={favicon} alt="" />
                                    </div>
                                )}

                                <div className="ie-irene-page__message-main">
                                    <div className="ie-irene-page__message-meta">
                                        <span className="ie-irene-page__message-author">
                                            {item.role === "user" ? "Você" : "Irene"}
                                        </span>
                                        {item.role === "assistant" && (
                                            <span className="ie-irene-page__verified">
                                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                    <path
                                                        d="m4 8 2.4 2.4L12 4.8"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                Iron Executions
                                            </span>
                                        )}
                                    </div>

                                    <div className="ie-irene-page__bubble">
                                        {item.role === "assistant" && indice === indiceDigitando
                                            ? textoDigitado
                                            : item.content}
                                        {item.role === "assistant" &&
                                            indice === indiceDigitando && (
                                                <span className="ie-irene-page__typing-cursor" aria-hidden="true" />
                                            )}
                                    </div>
                                </div>
                            </article>
                        ))}

                        {carregando && (
                            <article className="ie-irene-page__message ie-irene-page__message--assistant">
                                <div className="ie-irene-page__message-avatar">
                                    <img src={favicon} alt="" />
                                </div>
                                <div className="ie-irene-page__message-main">
                                    <div className="ie-irene-page__message-meta">
                                        <span className="ie-irene-page__message-author">Irene</span>
                                        <span className="ie-irene-page__working-label">Preparando resposta</span>
                                    </div>
                                    <div className="ie-irene-page__typing">
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>
                            </article>
                        )}
                    </div>
                </div>

                {erro && (
                    <div className="ie-irene-page__error" role="alert">
                        <span className="ie-irene-page__error-icon">!</span>
                        <span className="ie-irene-page__error-text">{erro}</span>
                        <button
                            type="button"
                            onClick={() => setErro("")}
                            aria-label="Fechar mensagem de erro"
                        >
                            ×
                        </button>
                    </div>
                )}

                <footer className="ie-irene-page__composer-area">
                    <form className="ie-irene-page__composer" onSubmit={enviarMensagem}>
                        <textarea
                            ref={campoMensagemRef}
                            className="ie-irene-page__textareaa"
                            value={mensagem}
                            onChange={(event) => setMensagem(event.target.value)}
                            onKeyDown={tratarTecla}
                            placeholder="Escreva sua mensagem para Irene..."
                            aria-label="Escreva sua mensagem"
                            rows={1}
                            maxLength={6000}
                            disabled={carregando}
                        />
                        <button
                            type="submit"
                            className="ie-irene-page__send-button"
                            disabled={!mensagem.trim() || carregando}
                            aria-label="Enviar mensagem"
                            title="Enviar mensagem"
                        >
                            {carregando ? (
                                <span className="ie-irene-page__spinner" />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path
                                        d="M12 19V5m-7 7 7-7 7 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    </form>
                    <div className="ie-irene-page__composer-footer">
                        <span className="ie-irene-page__hint">
                            <kbd>Enter</kbd> para enviar <span>·</span> <kbd>Shift + Enter</kbd> para nova linha
                        </span>
                        <span className="ie-irene-page__disclaimer">
                            A Irene pode cometer erros. Confira informações importantes.
                        </span>
                    </div>
                </footer>
            </section>
        </main>
    );
}
