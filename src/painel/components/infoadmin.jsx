import React from "react";
import "./infoadmin.css";
import { useNavigate } from "react-router-dom";

export default function InfoAdmin() {

    const navigate = useNavigate();

    return (
        <div className="ia-box">

            <h2 className="ia-titulo">Informações</h2>

            <button
                className="ia-botao"
                onClick={() => navigate("/clientes")}
            >
                Tabela Clientes
            </button>

            <button
                className="ia-botao"
                onClick={() => navigate("/funcionarios")}
            >
                Sócios Executivos
            </button>

            <button style={{ display: "none" }}
                className="ia-botao"
                onClick={() => navigate("/dados")}
            >
                Dados Pessoais
            </button>

        </div>
    );
}
