
import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../../config";
import favicon from "./favicon.png";
import "./irene.css";
import { useNavigate } from "react-router-dom";
const MAX_HISTORICO = 8;
const CHAVE_CACHE = "ie_irene_conversa";
const CHAVE_DATA = "ie_irene_conversa_data";

function obterDataLocal() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function obterMensagemInicial(nomeUsuario = "") {
    const nome = nomeUsuario.trim();

    return {
        role: "assistant",
        content: nome
            ? `Olá, ${nome}! Eu sou a Irene, a inteligência artificial do Iron Executions. Como posso ajudar você com a plataforma?`
            : "Olá! Eu sou a Irene, a inteligência artificial do Iron Executions. Como posso ajudar você com a plataforma?",
    };
}

function carregarMensagensDoDia() {
    try {
        const hoje = obterDataLocal();
        const dataSalva = localStorage.getItem(CHAVE_DATA);

        // Nunca recuperar mensagens de outro dia.
        if (dataSalva !== hoje) {
            localStorage.removeItem(CHAVE_CACHE);
            localStorage.setItem(CHAVE_DATA, hoje);
            return [obterMensagemInicial()];
        }

        const cache = localStorage.getItem(CHAVE_CACHE);

        if (!cache) {
            return [obterMensagemInicial()];
        }

        const mensagensSalvas = JSON.parse(cache);

        if (
            !Array.isArray(mensagensSalvas) ||
            !mensagensSalvas.every(
                (item) =>
                    item &&
                    ["user", "assistant"].includes(item.role) &&
                    typeof item.content === "string"
            )
        ) {
            localStorage.removeItem(CHAVE_CACHE);
            return [obterMensagemInicial()];
        }

        return mensagensSalvas.length
            ? mensagensSalvas
            : [obterMensagemInicial()];
    } catch (error) {
        console.error("Erro ao recuperar conversa da Irene:", error);
        return [obterMensagemInicial()];
    }
}

export default function Irene() {
    const [chatAberto, setChatAberto] = useState(false);
    const [mensagens, setMensagens] = useState(carregarMensagensDoDia);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const navigate = useNavigate();
    const [textoDigitado, setTextoDigitado] = useState("");
    const [digitandoResposta, setDigitandoResposta] = useState(false);
    const animacaoRef = useRef(null);
    const mensagensRef = useRef(null);
    const [nomeUsuario, setNomeUsuario] = useState("");
    const inputRef = useRef(null);
    function animarResposta(texto) {
        if (animacaoRef.current) {
            clearInterval(animacaoRef.current);
        }

        setTextoDigitado("");
        setDigitandoResposta(true);

        let indice = 0;

        animacaoRef.current = setInterval(() => {
            indice++;

            setTextoDigitado(texto.slice(0, indice));

            if (indice >= texto.length) {
                clearInterval(animacaoRef.current);
                animacaoRef.current = null;
                setDigitandoResposta(false);
            }
        }, 20);
    }
    useEffect(() => {
        let cancelado = false;

        async function carregarNomeUsuario() {
            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("access_token") ||
                "";

            if (!token) return;

            try {
                const resposta = await fetch(`${API_URL}/ia/sessao`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                });

                if (!resposta.ok) return;

                const dados = await resposta.json();
                if (cancelado) return;

                const nome = dados.nome_usuario?.trim();
                if (!nome) return;

                setNomeUsuario(nome);

                setMensagens((atuais) => {
                    // Personaliza somente a saudação inicial,
                    // sem apagar conversas que já começaram.
                    if (
                        atuais.length === 1 &&
                        atuais[0].role === "assistant"
                    ) {
                        return [obterMensagemInicial(nome)];
                    }

                    return atuais;
                });
            } catch (error) {
                console.error(
                    "Não foi possível carregar o nome do usuário da Irene:",
                    error
                );
            }
        }

        carregarNomeUsuario();

        return () => {
            cancelado = true;
        };
    }, []);
    // Atualiza a conversa salva sempre que as mensagens mudarem.
    useEffect(() => {
        try {
            const hoje = obterDataLocal();
            const dataSalva = localStorage.getItem(CHAVE_DATA);

            if (dataSalva !== hoje) {
                localStorage.removeItem(CHAVE_CACHE);
                localStorage.setItem(CHAVE_DATA, hoje);

                setMensagens([obterMensagemInicial()]);
                setMensagem("");
                setErro("");
                setCarregando(false);
                return;
            }

            localStorage.setItem(CHAVE_CACHE, JSON.stringify(mensagens));
        } catch (error) {
            console.error("Erro ao salvar conversa da Irene:", error);
        }
    }, [mensagens]);

    /* Sincroniza a conversa com o cache a cada segundo */
    useEffect(() => {
        const intervalo = setInterval(() => {
            try {
                const hoje = obterDataLocal();
                const dataSalva = localStorage.getItem(CHAVE_DATA);

                if (dataSalva !== hoje) {
                    localStorage.removeItem(CHAVE_CACHE);
                    localStorage.setItem(CHAVE_DATA, hoje);

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
                    if (JSON.stringify(atuais) === JSON.stringify(mensagensCache)) {
                        return atuais;
                    }

                    return mensagensCache;
                });
            } catch (error) {
                console.error("Erro ao sincronizar cache da Irene:", error);
            }
        }, 1000);

        return () => clearInterval(intervalo);
    }, []);

    // Verifica a mudança de dia enquanto o componente estiver aberto.
    useEffect(() => {
        function verificarNovoDia() {
            const hoje = obterDataLocal();
            const dataSalva = localStorage.getItem(CHAVE_DATA);

            if (dataSalva !== hoje) {
                try {
                    localStorage.removeItem(CHAVE_CACHE);
                    localStorage.setItem(CHAVE_DATA, hoje);
                } catch (error) {
                    console.error("Erro ao atualizar a data da conversa:", error);
                }

                setMensagens([obterMensagemInicial()]);
                setMensagem("");
                setErro("");
                setCarregando(false);
            }
        }

        function aoRetornarParaPagina() {
            if (document.visibilityState === "visible") {
                verificarNovoDia();
            }
        }

        document.addEventListener("visibilitychange", aoRetornarParaPagina);
        window.addEventListener("focus", verificarNovoDia);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                aoRetornarParaPagina
            );
            window.removeEventListener("focus", verificarNovoDia);
        };
    }, []);
    useEffect(() => {
        function fecharComEsc(event) {
            if (event.key === "Escape" && chatAberto) {
                event.preventDefault();
                fecharChat();
            }
        }

        window.addEventListener("keydown", fecharComEsc);

        return () => {
            window.removeEventListener("keydown", fecharComEsc);
        };
    }, [chatAberto]);
    useEffect(() => {
        if (!chatAberto) return;

        mensagensRef.current?.scrollTo({
            top: mensagensRef.current.scrollHeight,
            behavior: "smooth",
        });

        inputRef.current?.focus();
    }, [chatAberto, mensagens, carregando, erro]);

    function obterToken() {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            ""
        );
    }

    async function enviarMensagem(event) {
        event?.preventDefault();

        const texto = mensagem.trim();

        if (!texto || carregando) return;

        // Evita enviar uma conversa antiga caso o dia tenha mudado.
        const hoje = obterDataLocal();
        const dataSalva = localStorage.getItem(CHAVE_DATA);

        let mensagensAtuais = mensagens;

        if (dataSalva !== hoje) {
            mensagensAtuais = [obterMensagemInicial()];

            try {
                localStorage.removeItem(CHAVE_CACHE);
                localStorage.setItem(CHAVE_DATA, hoje);
            } catch (error) {
                console.error("Erro ao reiniciar conversa:", error);
            }

            setMensagens(mensagensAtuais);
        }

        const historicoAnterior = mensagensAtuais
            .filter(
                (item) =>
                    item.role === "user" || item.role === "assistant"
            )
            .slice(-MAX_HISTORICO)
            .map((item) => ({
                role: item.role,
                content: item.content,
            }));

        setMensagens((anteriores) => [
            ...anteriores,
            { role: "user", content: texto },
        ]);

        setMensagem("");
        setCarregando(true);
        setErro("");

        try {

            const token = obterToken();

            const endpoint = token
                ? `${API_URL}/ia/conversar`
                : `${API_URL}/ia/conversar-livre`;

            const headers = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const resposta = await fetch(endpoint, {
                method: "POST",
                headers,
                cache: "no-store",
                body: JSON.stringify({
                    mensagem: texto,
                    historico: historicoAnterior,
                }),
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    typeof dados.detail === "string"
                        ? dados.detail
                        : "Não foi possível obter uma resposta da Irene."
                );
            }


            // Não adiciona uma resposta atrasada a uma conversa de outro dia.
            if (obterDataLocal() !== hoje) {
                setMensagens([obterMensagemInicial()]);
                setErro(
                    "O dia mudou. Comece uma nova conversa com a Irene."
                );
                return;
            }

            const respostaIrene =
                dados.resposta ||
                "Não consegui gerar uma resposta neste momento.";

            setMensagens((anteriores) => [
                ...anteriores,
                {
                    role: "assistant",
                    content: respostaIrene,
                },
            ]);

            animarResposta(respostaIrene);
        } catch (error) {
            setErro(
                error.message ||
                "Não foi possível conectar à Irene. Tente novamente."
            );
        } finally {
            setCarregando(false);
        }
    }

    function fecharChat() {
        setChatAberto(false);
    }

    return (
        <>
            {!chatAberto && (
                <button
                    type="button"
                    className="ie-assistant-launcher"
                    onClick={() => setChatAberto(true)}
                    aria-label="Abrir chat com Irene"
                >
                    <span className="ie-assistant-launcher-avatar">
                        <img src={favicon} alt="Irene" />
                    </span>

                    <span className="ie-assistant-launcher-info">
                        <strong className="ie-assistant-launcher-name">
                            Irene
                        </strong>

                        <span className="ie-assistant-launcher-description">
                            Sua assistente inteligente
                        </span>

                        <span className="ie-assistant-availability">
                            <span className="ie-assistant-status-dot" />
                            Disponível para ajudar
                        </span>
                    </span>

                    <span
                        className="ie-assistant-launcher-arrow"
                        aria-hidden="true"
                    >
                        ↗
                    </span>
                </button>
            )}

            {chatAberto && (
                <section
                    className="ie-assistant-chat"
                    role="dialog"
                    aria-label="Chat com Irene"
                    aria-modal="false"
                >
                    <header className="ie-assistant-header">
                        <a
                            className="ie-assistant-brand"
                            href="/irene"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir Irene em nova aba"
                        >
                            <span className="ie-assistant-avatar">
                                <img src={favicon} alt="" />
                            </span>

                            <span className="ie-assistant-brand-info">
                                <strong className="ie-assistant-brand-name">
                                    Irene
                                </strong>

                                <span className="ie-assistant-header-status">
                                    <span className="ie-assistant-status-dot" />
                                    Assistente do Iron Executions
                                </span>
                            </span>
                        </a>

                        <button
                            type="button"
                            className="ie-assistant-close"
                            onClick={fecharChat}
                            aria-label="Fechar chat"
                            title="Fechar"
                        >
                            ×
                        </button>
                    </header>

                    <div
                        className="ie-assistant-messages"
                        ref={mensagensRef}
                        aria-live="polite"
                        aria-relevant="additions text"
                    >
                        {mensagens.map((item, index) => (
                            <div
                                key={`${index}-${item.role}`}
                                className={`ie-assistant-message ie-assistant-message-${item.role}`}
                            >
                                {item.role === "assistant" && (
                                    <span className="ie-assistant-message-avatar">
                                        <img src={favicon} alt="" />
                                    </span>
                                )}

                                <div className="ie-assistant-message-bubble">
                                    {item.role === "assistant" &&
                                        index === mensagens.length - 1 &&
                                        digitandoResposta
                                        ? textoDigitado
                                        : item.content}
                                </div>
                            </div>
                        ))}

                        {carregando && (
                            <div className="ie-assistant-message ie-assistant-message-assistant">
                                <span className="ie-assistant-message-avatar">
                                    <img src={favicon} alt="" />
                                </span>

                                <div
                                    className="ie-assistant-message-bubble ie-assistant-typing"
                                    aria-label="Irene está respondendo"
                                    role="status"
                                >
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        {erro && (
                            <div className="ie-assistant-error" role="alert">
                                <span>{erro}</span>

                                <button
                                    type="button"
                                    onClick={() => setErro("")}
                                    aria-label="Fechar aviso"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>

                    <form
                        className="ie-assistant-composer"
                        onSubmit={enviarMensagem}
                    >
                        <textarea
                            ref={inputRef}
                            className="ie-assistant-input"
                            value={mensagem}
                            onChange={(event) => setMensagem(event.target.value)}
                            placeholder="Pergunte algo à Irene..."
                            aria-label="Mensagem para Irene"
                            rows={1}
                            maxLength={4000}
                            disabled={carregando}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" &&
                                    !event.shiftKey &&
                                    !event.nativeEvent.isComposing
                                ) {
                                    event.preventDefault();
                                    enviarMensagem(event);
                                }
                            }}
                        />

                        <button
                            type="submit"
                            className="ie-assistant-send"
                            disabled={!mensagem.trim() || carregando}
                            aria-label="Enviar mensagem"
                            title="Enviar"
                        >
                            ➤
                        </button>
                    </form>

                    <footer className="ie-assistant-footer">
                        Irene · Inteligência artificial do Iron Executions
                    </footer>
                </section>
            )}
        </>
    );
}
