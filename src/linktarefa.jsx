
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./linktarefa.css";
import { API_URL } from "../config";
import logoIron from "../favicon.png";

export default function LinkTarefa() {

    const { id } = useParams();

    const [status, setStatus] = useState("carregando");
    const [mensagem, setMensagem] = useState("");
    const [nomeTarefa, setNomeTarefa] = useState("");

    useEffect(() => {

        let ativo = true;

        async function marcarTarefa() {

            if (!id || !/^\d+$/.test(id)) {
                setStatus("erro");
                setMensagem("Identificação da tarefa inválida.");
                return;
            }

            try {

                const resposta = await fetch(
                    `${API_URL}/tarefas-loja/${id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok || !dados.ok) {
                    throw new Error(
                        dados.detail || "Não foi possível marcar a tarefa."
                    );
                }

                if (ativo) {
                    setStatus("sucesso");
                    setMensagem(dados.mensagem);
                    setNomeTarefa(dados.tarefa);
                }

            } catch (erro) {

                if (ativo) {
                    setStatus("erro");
                    setMensagem(erro.message);
                }

            }
        }

        marcarTarefa();

        return () => {
            ativo = false;
        };

    }, [id]);

    return (
        <main className="linktarefa-page">

            <div className="linktarefa-background-effect"></div>

            <section className="linktarefa-content">

                <header className="linktarefa-header">
                    <img
                        src={logoIron}
                        alt="Iron Executions"
                        className="linktarefa-logo"
                    />
                </header>

                <div className="linktarefa-divider"></div>

                {status === "carregando" && (
                    <div className="linktarefa-result">

                        <div className="linktarefa-loader"></div>

                        <h1>Registrando tarefa</h1>

                        <p>
                            Estamos atualizando as informações no sistema.
                        </p>

                    </div>
                )}

                {status === "sucesso" && (
                    <div className="linktarefa-result linktarefa-success">

                        <div className="linktarefa-success-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M5 12.5L10 17L19 7"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <span className="linktarefa-status-label">
                            OPERAÇÃO CONCLUÍDA
                        </span>

                        <h1>Tarefa registrada!</h1>

                        <p>
                            {mensagem}
                        </p>

                        {nomeTarefa && (
                            <div className="linktarefa-task-reference">
                                <span>Tarefa concluída</span>
                                <strong>{nomeTarefa}</strong>
                            </div>
                        )}

                    </div>
                )}

                {status === "erro" && (
                    <div className="linktarefa-result">

                        <div className="linktarefa-error-icon">
                            !
                        </div>

                        <span className="linktarefa-status-label linktarefa-error-label">
                            NÃO FOI POSSÍVEL CONCLUIR
                        </span>

                        <h1>Ocorreu um problema</h1>

                        <p>{mensagem}</p>

                    </div>
                )}

                <footer className="linktarefa-footer">
                    <span>IRON EXECUTIONS</span>
                    <span className="linktarefa-footer-dot"></span>
                    <span>GESTÃO INTELIGENTE</span>
                </footer>

            </section>

        </main>
    );
}
