
import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../config";
import "./irene.css";

const MENSAGEM_INICIAL = {
    role: "assistant",
    content:
        "Olá! Eu sou a Irene, a assistente inteligente do Iron Executions. Como posso ajudar você hoje?",
};

export default function Irene() {
    const [mensagens, setMensagens] = useState([MENSAGEM_INICIAL]);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const listaMensagensRef = useRef(null);
    const campoMensagemRef = useRef(null);

    useEffect(() => {
        if (listaMensagensRef.current) {
            listaMensagensRef.current.scrollTo({
                top: listaMensagensRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [mensagens, carregando]);

    async function enviarMensagem(event) {
        event?.preventDefault();

        const texto = mensagem.trim();

        if (!texto || carregando) return;

        const token = localStorage.getItem("token");

        if (!token) {
            setErro("Sua sessão não foi encontrada. Entre novamente no sistema.");
            return;
        }

        const novaMensagem = {
            role: "user",
            content: texto,
        };

        const historicoAtualizado = [...mensagens, novaMensagem];

        setMensagens(historicoAtualizado);
        setMensagem("");
        setErro("");
        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/ia/conversar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mensagem: texto,
                    historico: historicoAtualizado
                        .slice(0, -1)
                        .filter(
                            (item) =>
                                item.role === "user" ||
                                item.role === "assistant"
                        )
                        .map((item) => ({
                            role: item.role,
                            content: item.content,
                        })),
                }),
            });

            if (resposta.status === 401) {
                throw new Error(
                    "Sua sessão expirou. Entre novamente no Iron Executions."
                );
            }

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    typeof dados.detail === "string"
                        ? dados.detail
                        : "Não foi possível obter uma resposta da Irene."
                );
            }

            if (
                typeof dados.resposta !== "string" ||
                !dados.resposta.trim()
            ) {
                throw new Error(
                    "A Irene recebeu uma resposta inválida do servidor."
                );
            }

            setMensagens((atuais) => [
                ...atuais,
                {
                    role: "assistant",
                    content: dados.resposta.trim(),
                },
            ]);
        } catch (error) {
            setErro(
                error.message ||
                "Não foi possível conectar à Irene. Tente novamente."
            );
        } finally {
            setCarregando(false);
            campoMensagemRef.current?.focus();
        }
    }

    function tratarTecla(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            enviarMensagem(event);
        }
    }

    function limparConversa() {
        if (carregando) return;

        setMensagens([MENSAGEM_INICIAL]);
        setMensagem("");
        setErro("");
        campoMensagemRef.current?.focus();
    }

    return (
        <main className="ie-irene">
            <section className="ie-irene__painel">
                <header className="ie-irene__cabecalho">
                    <div className="ie-irene__identidade">
                        <div className="ie-irene__avatar">
                            <span>I</span>
                            <span className="ie-irene__indicador" />
                        </div>

                        <div className="ie-irene__identidade-textos">
                            <h1 className="ie-irene__titulo">Irene</h1>
                            <p className="ie-irene__subtitulo">
                                Inteligência artificial do Iron Executions
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="ie-irene__botao-limpar"
                        onClick={limparConversa}
                        disabled={carregando}
                        title="Começar uma nova conversa"
                        aria-label="Limpar conversa"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 6h18M9 6V4h6v2m-9 0 1 14h10l1-14M10 10v6m4-6v6"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </header>

                <div
                    className="ie-irene__mensagens"
                    ref={listaMensagensRef}
                    role="log"
                    aria-label="Conversa com Irene"
                    aria-live="polite"
                    aria-relevant="additions"
                >
                    <div className="ie-irene__mensagens-inner">
                        {mensagens.map((item, indice) => (
                            <article
                                className={`ie-irene__mensagem ie-irene__mensagem--${item.role}`}
                                key={`${indice}-${item.role}`}
                            >
                                {item.role === "assistant" && (
                                    <div
                                        className="ie-irene__avatar-mensagem"
                                        aria-hidden="true"
                                    >
                                        I
                                    </div>
                                )}

                                <div className="ie-irene__mensagem-conteudo">
                                    <span className="ie-irene__autor">
                                        {item.role === "user"
                                            ? "Você"
                                            : "Irene"}
                                    </span>

                                    <div className="ie-irene__balao">
                                        {item.content}
                                    </div>
                                </div>
                            </article>
                        ))}

                        {carregando && (
                            <article className="ie-irene__mensagem ie-irene__mensagem--assistant">
                                <div
                                    className="ie-irene__avatar-mensagem"
                                    aria-hidden="true"
                                >
                                    I
                                </div>

                                <div className="ie-irene__mensagem-conteudo">
                                    <span className="ie-irene__autor">
                                        Irene
                                    </span>

                                    <div
                                        className="ie-irene__balao ie-irene__balao--digitando"
                                        aria-label="Irene está respondendo"
                                    >
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>
                            </article>
                        )}

                        <div className="ie-irene__fim-mensagens" />
                    </div>
                </div>

                {erro && (
                    <div className="ie-irene__erro" role="alert">
                        <span>{erro}</span>

                        <button
                            type="button"
                            onClick={() => setErro("")}
                            aria-label="Fechar mensagem de erro"
                        >
                            ×
                        </button>
                    </div>
                )}

                <form
                    className="ie-irene__formulario"
                    onSubmit={enviarMensagem}
                >
                    <div className="ie-irene__campo-container">
                        <textarea
                            ref={campoMensagemRef}
                            className="ie-irene__campo"
                            value={mensagem}
                            onChange={(event) =>
                                setMensagem(event.target.value)
                            }
                            onKeyDown={tratarTecla}
                            placeholder="Pergunte qualquer coisa à Irene..."
                            aria-label="Escreva sua mensagem"
                            rows={1}
                            maxLength={6000}
                            disabled={carregando}
                        />

                        <button
                            type="submit"
                            className="ie-irene__botao-enviar"
                            disabled={!mensagem.trim() || carregando}
                            aria-label="Enviar mensagem"
                            title="Enviar mensagem"
                        >
                            {carregando ? (
                                <span className="ie-irene__spinner" />
                            ) : (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
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
                    </div>

                    <p className="ie-irene__aviso">
                        A Irene pode cometer erros. Confira informações
                        importantes antes de tomar decisões.
                    </p>
                </form>
            </section>
        </main>
    );
}
