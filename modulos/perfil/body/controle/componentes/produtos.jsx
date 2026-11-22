
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./produtos.css";

export default function Espaco() {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarEspaco() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Você precisa estar logado.");
                }

                const resposta = await fetch(`${API_URL}/espacocom/meu`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        resultado.detail ||
                        "Não foi possível consultar o armazenamento."
                    );
                }

                setDados(resultado);

            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        buscarEspaco();
    }, []);

    const formatar = (valor, casas = 2) => {
        return Number(valor || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: casas,
            maximumFractionDigits: casas
        });
    };

    if (carregando) {
        return (
            <div className="iron-storage-loading">
                <div className="iron-storage-loading-line" />
                <span>Consultando armazenamento...</span>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="iron-storage-error">
                <span>{erro}</span>
                <button onClick={() => window.location.reload()}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!dados) return null;

    const percentual = Number(dados.percentual || 0);
    const percentualVisual = Math.min(Math.max(percentual, 0), 100);

    const limiteAtingido = dados.limite_atingido;
    const proximoAlerta = percentual >= 80;

    return (
        <section className="iron-storage-page">

            <header className="iron-storage-header">
                <div>
                    <span className="iron-storage-overline">
                        GERENCIAMENTO
                    </span>

                    <h1>Armazenamento</h1>

                    <p>
                        Acompanhe o consumo e o espaço disponível do seu comércio.
                    </p>
                </div>
            </header>

            <div className="iron-storage-card">

                <div className="iron-storage-top">
                    <div>
                        <span className="iron-storage-label">
                            Espaço utilizado
                        </span>

                        <div className="iron-storage-main-value">
                            {formatar(dados.utilizado_mb, 2)}
                            <span> MB</span>
                        </div>
                    </div>

                    <div className="iron-storage-status">
                        <span className={
                            limiteAtingido
                                ? "iron-storage-status-dot iron-storage-dot-danger"
                                : proximoAlerta
                                    ? "iron-storage-status-dot iron-storage-dot-warning"
                                    : "iron-storage-status-dot"
                        } />

                        {limiteAtingido
                            ? "Limite atingido"
                            : proximoAlerta
                                ? "Próximo do limite"
                                : "Armazenamento normal"}
                    </div>
                </div>

                <div className="iron-storage-progress-info">
                    <span>Utilização do plano</span>

                    <strong>
                        {formatar(percentual)}%
                    </strong>
                </div>

                <div className="iron-storage-progress">
                    <div
                        className={`iron-storage-progress-fill ${limiteAtingido
                                ? "iron-storage-progress-danger"
                                : proximoAlerta
                                    ? "iron-storage-progress-warning"
                                    : ""
                            }`}
                        style={{
                            width: `${percentualVisual}%`
                        }}
                    />
                </div>

                <div className="iron-storage-divider" />

                <div className="iron-storage-details">

                    <div className="iron-storage-detail">
                        <span className="iron-storage-detail-label">
                            Limite contratado
                        </span>

                        <strong>
                            {formatar(dados.limite_gb, 2)} GB
                        </strong>
                    </div>

                    <div className="iron-storage-detail">
                        <span className="iron-storage-detail-label">
                            Espaço disponível
                        </span>

                        <strong className="iron-storage-available">
                            {formatar(dados.disponivel_gb, 4)} GB
                        </strong>
                    </div>

                </div>

                {limiteAtingido && (
                    <div className="iron-storage-notice iron-storage-notice-danger">
                        O limite de armazenamento do seu plano foi atingido.
                    </div>
                )}

                {!limiteAtingido && proximoAlerta && (
                    <div className="iron-storage-notice iron-storage-notice-warning">
                        Seu armazenamento está próximo do limite contratado.
                    </div>
                )}

            </div>

        </section>
    );
}
