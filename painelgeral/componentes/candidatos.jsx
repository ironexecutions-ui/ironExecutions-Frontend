
import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../config";
import "./candidatos.css";

const STATUS = {
    0: { label: "Em espera", className: "espera" },
    1: { label: "Ativo", className: "ativo" },
    2: { label: "Cancelado", className: "cancelado" },
};

export default function Candidatos() {
    const [candidatos, setCandidatos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [alterando, setAlterando] = useState(null);

    const token = localStorage.getItem("token");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const resposta = await fetch(`${API_URL}/painel/candidatos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            if (!resposta.ok) {
                const dados = await resposta.json().catch(() => ({}));
                throw new Error(
                    resposta.status === 403
                        ? "Acesso não autorizado."
                        : dados.detail || "Não foi possível carregar os candidatos."
                );
            }

            const dados = await resposta.json();
            setCandidatos(Array.isArray(dados) ? dados : []);
        } catch (e) {
            setErro(e.message || "Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function mudarStatus(id, aceita) {
        const anterior = candidatos.find((c) => c.id === id)?.aceita;

        setAlterando(id);
        setErro("");

        try {
            const resposta = await fetch(
                `${API_URL}/painel/candidatos/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ aceita }),
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Não foi possível atualizar o status."
                );
            }

            setCandidatos((lista) =>
                lista.map((c) => (c.id === id ? { ...c, aceita } : c))
            );
        } catch (e) {
            setErro(e.message || "Erro ao atualizar o status.");

            if (anterior !== undefined) {
                setCandidatos((lista) =>
                    lista.map((c) =>
                        c.id === id ? { ...c, aceita: anterior } : c
                    )
                );
            }
        } finally {
            setAlterando(null);
        }
    }

    const totalAtivos = candidatos.filter(
        (c) => Number(c.aceita) === 1
    ).length;

    const totalEspera = candidatos.filter(
        (c) => Number(c.aceita) === 0
    ).length;

    const totalCancelados = candidatos.filter(
        (c) => Number(c.aceita) === 2
    ).length;

    if (carregando) {
        return (
            <div className="cand-estado">
                <span className="cand-spinner" />
                Carregando candidatos...
            </div>
        );
    }

    if (erro && candidatos.length === 0) {
        return (
            <div className="cand-estado cand-estado-erro">
                <p>{erro}</p>
                <button onClick={carregar}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <main className="cand-painel">
            <header className="cand-header">
                <div>
                    <span className="cand-eyebrow">GESTÃO DE PARCEIROS</span>
                    <h1>Candidatos</h1>
                    <p>Gerencie candidatos e acompanhe suas indicações.</p>
                </div>

                <button
                    type="button"
                    className="cand-btn-atualizar"
                    onClick={carregar}
                    disabled={alterando !== null}
                >
                    <span aria-hidden="true">↻</span>
                    Atualizar
                </button>
            </header>

            {erro && <div className="cand-alerta">{erro}</div>}

            <section className="cand-resumo">
                <article className="cand-metrica">
                    <span className="cand-metrica-label">Total de candidatos</span>
                    <strong>{candidatos.length}</strong>
                </article>

                <article className="cand-metrica">
                    <span className="cand-metrica-label">Ativos</span>
                    <strong>{totalAtivos}</strong>
                </article>

                <article className="cand-metrica">
                    <span className="cand-metrica-label">Em espera</span>
                    <strong>{totalEspera}</strong>
                </article>

                <article className="cand-metrica">
                    <span className="cand-metrica-label">Cancelados</span>
                    <strong>{totalCancelados}</strong>
                </article>
            </section>

            <section className="cand-conteudo">
                <div className="cand-lista-header">
                    <div>
                        <h2>Lista de candidatos</h2>
                        <span>{candidatos.length} registros</span>
                    </div>
                </div>

                {candidatos.length === 0 ? (
                    <div className="cand-vazio">
                        <h3>Nenhum candidato encontrado</h3>
                        <p>Os candidatos cadastrados aparecerão aqui.</p>
                    </div>
                ) : (
                    <div className="cand-tabela-wrapper">
                        <table className="cand-tabela">
                            <thead>
                                <tr>
                                    <th>Candidato</th>
                                    <th>Comércio indicador</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {candidatos.map((c) => {
                                    const status =
                                        STATUS[Number(c.aceita)] || STATUS[0];

                                    return (
                                        <tr key={c.id}>
                                            <td>
                                                <div className="cand-pessoa">
                                                    <div className="cand-avatar">
                                                        {(c.nome || "?")
                                                            .trim()
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="cand-pessoa-info">
                                                        <strong>
                                                            {c.nome || "Sem nome"}
                                                        </strong>
                                                        <span>
                                                            {c.email || "E-mail não informado"}
                                                        </span>
                                                        <span>
                                                            {c.zap || "WhatsApp não informado"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="cand-comercio">
                                                    <strong>
                                                        {c.comercio_loja ||
                                                            "Comércio não encontrado"}
                                                    </strong>
                                                    <span>
                                                        ID: {c.comercio_indcador ?? "—"}
                                                    </span>
                                                    {c.comercio_cnpj && (
                                                        <span>
                                                            CNPJ: {c.comercio_cnpj}
                                                        </span>
                                                    )}
                                                    {(c.comercio_cidade ||
                                                        c.comercio_estado) && (
                                                            <span>
                                                                {[
                                                                    c.comercio_cidade,
                                                                    c.comercio_estado,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(" - ")}
                                                            </span>
                                                        )}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="cand-status-area">
                                                    <span
                                                        className={`cand-status ${status.className}`}
                                                    >
                                                        {status.label}
                                                    </span>

                                                    <select
                                                        aria-label={`Alterar status de ${c.nome || "candidato"}`}
                                                        value={Number(c.aceita ?? 0)}
                                                        disabled={alterando === c.id}
                                                        onChange={(e) =>
                                                            mudarStatus(
                                                                c.id,
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        className="cand-select-status"
                                                    >
                                                        <option value={0}>
                                                            Em espera
                                                        </option>
                                                        <option value={1}>
                                                            Ativo
                                                        </option>
                                                        <option value={2}>
                                                            Cancelado
                                                        </option>
                                                    </select>

                                                    {alterando === c.id && (
                                                        <span className="cand-salvando">
                                                            Salvando...
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
