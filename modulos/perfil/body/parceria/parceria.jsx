import React, { useState } from "react";
import "./parceria.css";

import Indicacoes from "./componentes/indicacao";
import Parceiros from "./componentes/parceiros";
import Relatorios from "./componentes/relatorios.jsx";
import Candidatos from "./componentes/candidatos";

export default function Parceria() {
    const [abaAtiva, setAbaAtiva] = useState("indicacoes");

    function renderizarConteudo() {
        switch (abaAtiva) {
            case "indicacoes":
                return <Indicacoes />;

            case "parceiros":
                return <Parceiros />;

            case "candidatos":
                return <Candidatos />;

            case "relatorios":
                return <Relatorios />;

            default:
                return <Indicacoes />;
        }
    }

    return (
        <div className="parceria-container">
            <h3>Parceria</h3>

            <div
                className="parceria-botoes"
                role="tablist"
                aria-label="Áreas de parceria"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === "indicacoes"}
                    className={abaAtiva === "indicacoes" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("indicacoes")}
                >
                    Indicações
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === "parceiros"}
                    className={abaAtiva === "parceiros" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("parceiros")}
                >
                    Indicados
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === "candidatos"}
                    className={abaAtiva === "candidatos" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("candidatos")}
                >
                    Candidatos
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === "relatorios"}
                    className={abaAtiva === "relatorios" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("relatorios")}
                >
                    Relatórios
                </button>
            </div>

            <div className="parceria-conteudo">
                {renderizarConteudo()}
            </div>
        </div>
    );
}