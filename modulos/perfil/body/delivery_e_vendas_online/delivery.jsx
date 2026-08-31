import React, { useState } from "react";

import Vendas from "./componentes/vendas/vendas";
import Apresentacao from "./componentes/vendas/apresentacao";
import Modelos from "./componentes/vendas/modelos";
import Dominio from "./componentes/vendas/dominio";

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

        switch (abaAtiva) {

            case "vendas":

                return <Vendas />;


            case "apresentacao":

                return <Apresentacao />;


            case "modelos":

                return <Modelos />;


            case "dominio":

                return <Dominio />;


            default:

                return <Vendas />;

        }

    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="ironstore-container">

            <h3>
                IronStore
            </h3>


            <div className="ironstore-botoes">

                <button
                    type="button"
                    className={
                        abaAtiva === "vendas"
                            ? "ironstore-botao-aba ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba"
                    }
                    onClick={() => abrirAba("vendas")}
                >
                    Vendas
                </button>


                <button
                    type="button"
                    className={
                        abaAtiva === "apresentacao"
                            ? "ironstore-botao-aba ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba"
                    }
                    onClick={() => abrirAba("apresentacao")}
                >
                    Apresentação
                </button>


                <button
                    type="button"
                    className={
                        abaAtiva === "modelos"
                            ? "ironstore-botao-aba ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba"
                    }
                    onClick={() => abrirAba("modelos")}
                >
                    Modelos do site
                </button>


                <button
                    type="button"
                    className={
                        abaAtiva === "dominio"
                            ? "ironstore-botao-aba ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba"
                    }
                    onClick={() => abrirAba("dominio")}
                >
                    Domínio registrado
                </button>

            </div>


            <div className="ironstore-conteudo">

                {renderizarConteudo()}

            </div>

        </div>

    );

}