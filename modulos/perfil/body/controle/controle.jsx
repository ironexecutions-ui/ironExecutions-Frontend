import React, { useState } from "react";

import Controlee from "./componentes/controle";
import ProdutosComercio from "./componentes/produtoscomercio";

import "./menucontrole.css";

export default function Controle() {

    const [abaAtiva, setAbaAtiva] = useState("tabelas");

    const cliente = JSON.parse(
        localStorage.getItem("cliente") || "{}"
    );

    const isAdmin = cliente.funcao === "Administrador(a)";

    return (
        <div className="menu-controle-container">

            {/* ===== BOTÕES ===== */}

            <div className="menu-controle-botoes">

                {isAdmin && (
                    <button
                        className={
                            abaAtiva === "tabelas"
                                ? "menu-controle-btn ativo"
                                : "menu-controle-btn"
                        }
                        onClick={() => setAbaAtiva("tabelas")}
                    >
                        Funcionários
                    </button>
                )}

                {/* FUTUROS BOTÕES

                <button
                    className={
                        abaAtiva === "outro"
                            ? "menu-controle-btn ativo"
                            : "menu-controle-btn"
                    }
                    onClick={() => setAbaAtiva("outro")}
                >
                    Outro módulo
                </button>

                */}

            </div>

            {/* ===== CONTEÚDO ===== */}

            <div className="menu-controle-conteudo">

                {abaAtiva === "tabelas" && (
                    <Controlee />
                )}

                {abaAtiva === "produtos" && (
                    <ProdutosComercio />
                )}

            </div>

        </div>
    );
}