import React, { useCallback, useEffect, useState } from "react";

import { API_URL } from "../../../../../../config";
import ParceirosExtensao from "./parceirosextensao";

import "./parceiros.css";

export default function Parceiros() {
    const [parceiros, setParceiros] = useState([]);
    const [nomeParceiro, setNomeParceiro] = useState("");
    const [parceiroSelecionado, setParceiroSelecionado] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const token = localStorage.getItem("token");

    const carregarParceiros = useCallback(async () => {
        if (!token) {
            setErro("Sessão não encontrada. Faça login novamente.");
            setCarregando(false);
            return;
        }

        try {
            setErro("");

            const resposta = await fetch(`${API_URL}/clientes/parceiros`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os parceiros.");
            }

            const dados = await resposta.json();
            setParceiros(dados);

            // Fecha a extensão se o parceiro deixou de estar ativo.
            setParceiroSelecionado(atual => {
                if (!atual) return null;

                const atualizado = dados.find(
                    item => Number(item.id) === Number(atual.id)
                );

                return atualizado && Number(atualizado.ativo) === 1
                    ? atualizado
                    : null;
            });
        } catch (error) {
            setErro(error.message || "Erro ao carregar parceiros.");
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarParceiros();
    }, [carregarParceiros]);

    async function adicionarParceiro(event) {
        event.preventDefault();

        const nome = nomeParceiro.trim();

        if (!nome) {
            setErro("Digite o nome do parceiro.");
            return;
        }

        setSalvando(true);
        setErro("");
        setSucesso("");

        try {
            const resposta = await fetch(`${API_URL}/clientes/parceiros`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    parceiro: nome
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail || "Não foi possível cadastrar."
                );
            }

            setNomeParceiro("");
            setSucesso("Parceiro cadastrado e ativado com sucesso!");

            await carregarParceiros();
        } catch (error) {
            setErro(error.message || "Erro ao cadastrar parceiro.");
        } finally {
            setSalvando(false);
        }
    }

    async function alterarStatus(parceiro) {
        const novoStatus = Number(parceiro.ativo) === 1 ? 0 : 1;

        setErro("");
        setSucesso("");

        try {
            const resposta = await fetch(
                `${API_URL}/clientes/parceiros/${parceiro.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ativo: novoStatus
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail || "Não foi possível alterar o status."
                );
            }

            // Fecha a extensão imediatamente ao desativar.
            if (
                novoStatus === 0 &&
                Number(parceiroSelecionado?.id) === Number(parceiro.id)
            ) {
                setParceiroSelecionado(null);
            }

            setSucesso(
                novoStatus === 1
                    ? "Parceiro ativado com sucesso!"
                    : "Parceiro desativado com sucesso!"
            );

            await carregarParceiros();
        } catch (error) {
            setErro(error.message || "Erro ao alterar o parceiro.");
        }
    }

    function abrirParceiro(parceiro) {
        if (Number(parceiro.ativo) !== 1) return;

        setErro("");
        setParceiroSelecionado(parceiro);
    }


    return (
        <main className="prx-container">
            <div className="prx-background-glow prx-background-glow-one" />
            <div className="prx-background-glow prx-background-glow-two" />

            <div className="prx-content">
                <header className="prx-header">
                    <div className="prx-header-main">
                        <div className="prx-brand-icon" aria-hidden="true">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="10" cy="7" r="4" />
                                <path d="M20 8v6M23 11h-6" />
                            </svg>
                        </div>

                        <div className="prx-heading">
                            <span className="prx-eyebrow">
                                GESTÃO COMERCIAL
                            </span>

                            <h1>Meus parceiros</h1>

                            <p>
                                Gerencie seus parceiros, controle os acessos e
                                acompanhe cada relacionamento comercial.
                            </p>
                        </div>
                    </div>

                    <div className="prx-header-stats">
                        <div className="prx-stat-icon" aria-hidden="true">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="10" cy="7" r="4" />
                                <path d="M16 11l2 2 4-4" />
                            </svg>
                        </div>

                        <div className="prx-stat-content">
                            <span>Parceiros ativos</span>
                            <strong>
                                {parceiros.filter(
                                    (item) => Number(item.ativo) === 1
                                ).length}
                            </strong>
                        </div>

                        <span className="prx-stat-indicator" />
                    </div>
                </header>

                <section className="prx-registration">
                    <div className="prx-section-heading">
                        <div className="prx-section-icon" aria-hidden="true">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>

                        <div>
                            <h2>Novo parceiro</h2>
                            <p>
                                Cadastre um parceiro para liberar sua área de
                                gerenciamento.
                            </p>
                        </div>
                    </div>

                    <form
                        className="prx-form"
                        onSubmit={adicionarParceiro}
                    >
                        <div className="prx-field">
                            <label htmlFor="parceiro-nome">
                                Nome do parceiro
                                <span className="prx-required">*</span>
                            </label>

                            <div className="prx-input-wrap">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                                </svg>

                                <input
                                    id="parceiro-nome"
                                    type="text"
                                    placeholder="Ex.: Distribuidora Central"
                                    value={nomeParceiro}
                                    onChange={(event) =>
                                        setNomeParceiro(event.target.value)
                                    }
                                    maxLength={255}
                                    disabled={salvando}
                                    autoComplete="organization"
                                    required
                                />
                            </div>

                            <small>
                                Utilize o nome pelo qual você identifica esse
                                parceiro comercial.
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="prx-button prx-button-primary"
                            disabled={salvando || !nomeParceiro.trim()}
                        >
                            {salvando ? (
                                <>
                                    <span className="prx-spinner" />
                                    Cadastrando parceiro...
                                </>
                            ) : (
                                <>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    Adicionar parceiro
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {(erro || sucesso) && (
                    <div
                        className={`prx-alert ${erro ? "prx-alert-error" : "prx-alert-success"
                            }`}
                        role={erro ? "alert" : "status"}
                    >
                        <span className="prx-alert-icon" aria-hidden="true">
                            {erro ? "!" : "✓"}
                        </span>

                        <span>{erro || sucesso}</span>
                    </div>
                )}

                <section className="prx-partners-section">
                    <div className="prx-list-heading">
                        <div>
                            <span className="prx-eyebrow">
                                SUA REDE COMERCIAL
                            </span>

                            <h2>Parceiros cadastrados</h2>

                            <p>
                                Consulte os parceiros e gerencie a disponibilidade
                                de acesso.
                            </p>
                        </div>

                        <div className="prx-total-badge">
                            <span className="prx-total-dot" />
                            {parceiros.length}{" "}
                            {parceiros.length === 1
                                ? "parceiro cadastrado"
                                : "parceiros cadastrados"}
                        </div>
                    </div>

                    {carregando ? (
                        <div className="prx-state-card">
                            <span className="prx-spinner prx-spinner-large" />
                            <strong>Carregando parceiros</strong>
                            <p>Estamos buscando os dados da sua rede comercial.</p>
                        </div>
                    ) : parceiros.length === 0 ? (
                        <div className="prx-state-card">
                            <div className="prx-empty-icon" aria-hidden="true">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="9" cy="8" r="3.5" />
                                    <path d="M2.5 20v-1.5A6.5 6.5 0 0 1 9 12a6.5 6.5 0 0 1 6.5 6.5V20" />
                                    <path d="M18 8v6M21 11h-6" />
                                </svg>
                            </div>

                            <strong>Nenhum parceiro cadastrado</strong>

                            <p>
                                Sua rede comercial ainda está vazia. Cadastre o
                                primeiro parceiro no formulário acima para começar.
                            </p>

                            <button
                                type="button"
                                className="prx-button prx-button-secondary"
                                onClick={() => {
                                    document
                                        .getElementById("parceiro-nome")
                                        ?.focus();
                                }}
                            >
                                Cadastrar primeiro parceiro
                            </button>
                        </div>
                    ) : (
                        <div className="prx-partners-grid">
                            {parceiros.map((parceiro) => {
                                const ativo = Number(parceiro.ativo) === 1;

                                const selecionado =
                                    Number(parceiroSelecionado?.id) ===
                                    Number(parceiro.id);

                                const nome = String(
                                    parceiro.parceiro || "Parceiro"
                                ).trim();

                                const inicial = nome.charAt(0).toUpperCase();

                                return (
                                    <article
                                        className={`prx-partner-card ${selecionado ? "is-selected" : ""
                                            } ${!ativo ? "is-inactive" : ""}`}
                                        key={parceiro.id}
                                    >
                                        <div className="prx-card-top">
                                            <div
                                                className={`prx-partner-avatar ${selecionado
                                                        ? "avatar-selected"
                                                        : ""
                                                    }`}
                                            >
                                                {inicial || "P"}
                                            </div>

                                            <span
                                                className={`prx-status ${ativo
                                                        ? "prx-status-active"
                                                        : "prx-status-inactive"
                                                    }`}
                                            >
                                                <span className="prx-status-dot" />
                                                {ativo ? "Ativo" : "Inativo"}
                                            </span>
                                        </div>

                                        <div className="prx-partner-details">
                                            <span className="prx-partner-label">
                                                PARCEIRO COMERCIAL
                                            </span>

                                            <h3 title={nome}>{nome}</h3>

                                            <span className="prx-partner-id">
                                                Identificação #{parceiro.id}
                                            </span>
                                        </div>

                                        <div className="prx-card-divider" />

                                        <div className="prx-card-actions">
                                            {ativo && (
                                                <button
                                                    type="button"
                                                    className={`prx-button ${selecionado
                                                            ? "prx-button-open"
                                                            : "prx-button-secondary"
                                                        }`}
                                                    onClick={() =>
                                                        selecionado
                                                            ? setParceiroSelecionado(
                                                                null
                                                            )
                                                            : abrirParceiro(
                                                                parceiro
                                                            )
                                                    }
                                                >
                                                    {selecionado ? (
                                                        <>
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="m18 6-12 12M6 6l12 12" />
                                                            </svg>
                                                            Fechar área
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="M3 10.5 12 3l9 7.5" />
                                                                <path d="M5 9v12h14V9M9 21v-7h6v7" />
                                                            </svg>
                                                            Abrir área
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className={`prx-button prx-button-status ${ativo
                                                        ? "prx-button-deactivate"
                                                        : "prx-button-activate"
                                                    }`}
                                                onClick={() =>
                                                    alterarStatus(parceiro)
                                                }
                                            >
                                                {ativo ? "Desativar" : "Ativar"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {parceiroSelecionado &&
                    Number(parceiroSelecionado.ativo) === 1 && (
                        <section className="prx-extension">
                            <div className="prx-extension-heading">
                                <div>
                                    <span className="prx-eyebrow">
                                        ÁREA DO PARCEIRO
                                    </span>

                                    <h2>
                                        {parceiroSelecionado.parceiro ||
                                            "Parceiro selecionado"}
                                    </h2>

                                    <p>
                                        Gerencie produtos, informações e recursos
                                        desta parceria.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="prx-button prx-button-secondary"
                                    onClick={() => setParceiroSelecionado(null)}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="m18 6-12 12M6 6l12 12" />
                                    </svg>
                                    Fechar área
                                </button>
                            </div>

                            <ParceirosExtensao
                                parceiro={parceiroSelecionado}
                            />
                        </section>
                    )}
            </div>
        </main>
    );

}