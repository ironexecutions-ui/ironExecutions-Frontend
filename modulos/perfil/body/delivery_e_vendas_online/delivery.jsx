import React, { useState } from "react";

import Vendas from "./componentes/vendas/vendas";

import "./delivery.css";

export default function DeliveryEVendasOnline() {

    // ============================================================
    // ESTADOS
    // ============================================================

    const [abaAtiva, setAbaAtiva] = useState("vendas");


    // ============================================================
    // TROCAR ABA
    // ============================================================

    function abrirAba(aba) {
        setAbaAtiva(aba);
    }


    // ============================================================
    // RENDERIZAR CONTEÚDO
    // ============================================================

    function renderizarConteudo() {

        if (abaAtiva === "vendas") {
            return <Vendas />;
        }

        return <Vendas />;
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="ironstore-container">

            <h3>IronStore</h3>

            <div className="ironstore-botoes">

                <button
                    className={
                        abaAtiva === "vendas"
                            ? "ironstore-botao-aba ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba"
                    }
                    onClick={() => abrirAba("vendas")}
                >
                    Vendas
                </button>

            </div>

            <div className="ironstore-conteudo">
                {renderizarConteudo()}
            </div>

        </div>
    );
}