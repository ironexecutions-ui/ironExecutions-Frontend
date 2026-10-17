
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./parceiros.css";

export default function Parceiros() {
    const [comercios, setComercios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregarParceiros() {
        setCarregando(true);
        setErro("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Sessão não encontrada. Faça login novamente."
                );
            }

            const resposta = await fetch(
                `${API_URL}/parceiros/comercios`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache"
                    },
                    cache: "no-store"
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Não foi possível carregar os comércios parceiros."
                );
            }

            setComercios(
                Array.isArray(dados.comercios)
                    ? dados.comercios
                    : []
            );
        } catch (erroCarregamento) {
            console.error(
                "[Parceiros] Erro ao carregar comércios:",
                erroCarregamento
            );

            setErro(
                erroCarregamento.message ||
                "Ocorreu um erro ao carregar os parceiros."
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarParceiros();
    }, []);

    if (carregando) {
        return (
            <div className="parceiros-lista-container">
                <div className="parceiros-lista-carregando">
                    <div className="parceiros-lista-spinner" />
                    <p>Carregando comércios indicados...</p>
                </div>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="parceiros-lista-container">
                <div
                    className="parceiros-lista-erro"
                    role="alert"
                >
                    <h3>Não foi possível carregar os indicados</h3>
                    <p>{erro}</p>

                    <button
                        type="button"
                        onClick={carregarParceiros}
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="parceiros-lista-container">
            <div className="parceiros-lista-cabecalho">
                <div>
                    <h2>Comércios indicados</h2>
                    <p>
                        Confira os comércios vinculados à sua parceria.
                    </p>
                </div>

                <div className="parceiros-lista-contador">
                    <span>{comercios.length}</span>
                    <small>
                        {comercios.length === 1
                            ? "comércio"
                            : "comércios"}
                    </small>
                </div>
            </div>

            {comercios.length === 0 ? (
                <div className="parceiros-lista-vazio">
                    <div className="parceiros-lista-vazio-icone">
                        <svg
                            width="34"
                            height="34"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect
                                x="3"
                                y="7"
                                width="18"
                                height="14"
                                rx="2"
                            />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                    </div>

                    <h3>Nenhum comércio encontrado</h3>

                    <p>
                        Os comércios vinculados à sua parceria
                        aparecerão aqui.
                    </p>
                </div>
            ) : (
                <div className="parceiros-lista-itens">
                    {comercios.map((comercio) => (
                        <article
                            className="parceiros-lista-item"
                            key={comercio.id}
                        >
                            <div className="parceiros-lista-imagem">
                                {comercio.imagem ? (
                                    <img
                                        src={comercio.imagem}
                                        alt={`Logo de ${comercio.loja || "comércio"}`}
                                        loading="lazy"
                                    />
                                ) : (
                                    <span>
                                        {(comercio.loja || "C")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <div className="parceiros-lista-informacoes">
                                <h3>
                                    {comercio.loja ||
                                        "Comércio sem nome"}
                                </h3>



                                <div className="parceiros-lista-detalhes">
                                    {comercio.tipo_comercio && (
                                        <span>
                                            {comercio.tipo_comercio}
                                        </span>
                                    )}

                                    {(comercio.cidade ||
                                        comercio.estado) && (
                                            <span>
                                                {[
                                                    comercio.cidade,
                                                    comercio.estado
                                                ]
                                                    .filter(Boolean)
                                                    .join(" / ")}
                                            </span>
                                        )}

                                    {comercio.email && (
                                        <span>
                                            {comercio.email}
                                        </span>
                                    )}

                                    {comercio.celular && (
                                        <span>
                                            {comercio.celular}
                                        </span>
                                    )}

                                    {comercio.cnpj && (
                                        <span>
                                            CNPJ: {comercio.cnpj}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {comercio.nota != null && (
                                <div className="parceiros-lista-nota">
                                    <span>
                                        {Number(comercio.nota).toFixed(1)}
                                    </span>
                                    <small>Nota</small>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
