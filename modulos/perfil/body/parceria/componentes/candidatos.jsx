
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./candidatos.css";

export default function Candidatos() {
    const [candidatos, setCandidatos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function carregarCandidatos() {
            try {
                const token = localStorage.getItem("token");

                const resposta = await fetch(
                    `${API_URL}/parceiros/candidatos`,
                    {
                        signal: controller.signal,
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                    }
                );

                const dados = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    throw new Error(
                        dados.detail || "Não foi possível carregar os parceiros."
                    );
                }

                setCandidatos(
                    Array.isArray(dados.candidatos)
                        ? dados.candidatos
                        : []
                );
            } catch (error) {
                if (error.name !== "AbortError") {
                    setErro(error.message || "Erro ao carregar parceiros.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        carregarCandidatos();

        return () => controller.abort();
    }, []);

    const emEspera = candidatos.filter(
        (c) => c.aceita == null || Number(c.aceita) === 0
    );

    const vinculados = candidatos.filter(
        (c) => Number(c.aceita) === 1
    );

    const recusados = candidatos.filter(
        (c) => Number(c.aceita) === 2
    );

    function renderizarLista(lista, titulo, classe, descricao) {
        return (
            <section className={`cand-secao cand-secao--${classe}`} key={classe}>
                <header className="cand-secao__topo">
                    <div className="cand-secao__titulo">
                        <span className={`cand-indicador cand-indicador--${classe}`} />
                        <div>
                            <h2>{titulo}</h2>
                            <p>{descricao}</p>
                        </div>
                    </div>

                    <span className={`cand-contador cand-contador--${classe}`}>
                        {lista.length}
                    </span>
                </header>

                {lista.length === 0 ? (
                    <div className="cand-vazio">
                        <span>Nenhum parceiro nesta categoria.</span>
                    </div>
                ) : (
                    <div className="cand-lista">
                        {lista.map((candidato) => (
                            <article className="cand-card" key={candidato.id}>
                                <div className={`cand-avatar cand-avatar--${classe}`}>
                                    {candidato.nome?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                </div>

                                <div className="cand-info">
                                    <h3>{candidato.nome || "Sem nome"}</h3>
                                    <p>{candidato.email || "E-mail não informado"}</p>
                                    {candidato.zap && (
                                        <p className="cand-telefone">{candidato.zap}</p>
                                    )}
                                </div>

                                <span className={`cand-status cand-status--${classe}`}>
                                    {classe === "espera"
                                        ? "Aguardando"
                                        : classe === "vinculado"
                                            ? "Vinculado"
                                            : "Recusado"}
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        );
    }

    if (carregando) {
        return (
            <main className="cand-pagina">
                <div className="cand-feedback">
                    <span className="cand-spinner" />
                    <p>Carregando parceiros...</p>
                </div>
            </main>
        );
    }

    if (erro) {
        return (
            <main className="cand-pagina">
                <div className="cand-feedback cand-feedback--erro">
                    <h2>Não foi possível carregar os parceiros</h2>
                    <p>{erro}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Tentar novamente
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="cand-pagina">
            <header className="cand-header">
                <div className="cand-header__texto">
                    <span className="cand-eyebrow">GESTÃO DE PARCERIAS</span>
                    <h1>Parceiros indicados</h1>
                    <p>Acompanhe as solicitações e os vínculos do seu comércio.</p>
                </div>

                <div className="cand-total">
                    <span>Total de indicações</span>
                    <strong>{candidatos.length}</strong>
                    <small>Parceiros registrados</small>
                </div>
            </header>

            <section className="cand-resumo">
                <article className="cand-resumo__card cand-resumo__card--espera">
                    <div className="cand-resumo__topo">
                        <span className="cand-resumo__rotulo">Aguardando resposta</span>
                        <span className="cand-resumo__icone">◷</span>
                    </div>
                    <strong>{emEspera.length}</strong>
                    <p>Solicitações pendentes</p>
                </article>

                <article className="cand-resumo__card cand-resumo__card--vinculado">
                    <div className="cand-resumo__topo">
                        <span className="cand-resumo__rotulo">Parceiros vinculados</span>
                        <span className="cand-resumo__icone">✓</span>
                    </div>
                    <strong>{vinculados.length}</strong>
                    <p>Parcerias confirmadas</p>
                </article>

                <article className="cand-resumo__card cand-resumo__card--recusado">
                    <div className="cand-resumo__topo">
                        <span className="cand-resumo__rotulo">Não aceitaram</span>
                        <span className="cand-resumo__icone">×</span>
                    </div>
                    <strong>{recusados.length}</strong>
                    <p>Vínculos recusados</p>
                </article>
            </section>

            {emEspera.length > 0 && (
                <div className="cand-alerta">
                    <span className="cand-alerta__icone">!</span>
                    <p>
                        <strong>{emEspera.length} solicitação(ões) aguardando.</strong>
                        {" "}Confira os parceiros que ainda não responderam.
                    </p>
                </div>
            )}

            <div className="cand-listas-titulo">
                <div>
                    <h2>Lista de parceiros</h2>
                    <p>Consulte os dados e a situação de cada indicação.</p>
                </div>
                <span>{candidatos.length} registro(s)</span>
            </div>

            {renderizarLista(
                emEspera,
                "Em espera",
                "espera",
                "Aguardando uma decisão sobre o vínculo."
            )}

            {renderizarLista(
                vinculados,
                "Vinculados",
                "vinculado",
                "Parcerias confirmadas."
            )}

            {renderizarLista(
                recusados,
                "Não aceitaram",
                "recusado",
                "Solicitações sem vínculo confirmado."
            )}
        </main>
    );
}
