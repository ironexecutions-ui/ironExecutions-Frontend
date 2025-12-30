import React from "react";
import "./blocomodulos.css";

export default function BlocoModulos({ dados, podeEditar, salvar }) {
    return (
        <div className="bm-container">

            <h2 className="bm-titulo">Módulos</h2>

            <div className="bm-lista">
                {[
                    ["produtividade", "Produtividade"],
                    ["administracao", "Administração"],
                    ["delivery_vendas", "Delivery e Vendas"],
                    ["mesas_salao_cozinha", "Mesas / Salão / Cozinha"],
                    ["integracao_ifood", "Integração iFood"],
                    ["agendamentos", "Agendamentos"],
                    ["gerencial", "Gerencial"],
                    ["fiscal", "Fiscal"]
                ].map(([campo, nome]) => (
                    <div key={campo} className="bm-item">

                        <span className="bm-nome">{nome}</span>

                        <div className="bm-acao">

                            {dados[campo] === 0 && (
                                podeEditar ? (
                                    <button
                                        className="bm-btn bm-btn-solicitar"
                                        onClick={() => salvar(campo, 1)}
                                    >
                                        Solicitar
                                    </button>
                                ) : (
                                    <span className="bm-status bm-inativo">
                                        Inativo
                                    </span>
                                )
                            )}

                            {dados[campo] === 1 && (
                                <span className="bm-status bm-solicitado">
                                    Solicitado
                                </span>
                            )}

                            {dados[campo] === 2 && (
                                <span className="bm-status bm-ativo">
                                    Ativo
                                </span>
                            )}

                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}
