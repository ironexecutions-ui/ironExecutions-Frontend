import React, { useState } from "react";
import "./graficovendas.css";

import GraficoPizzaProdutos from "./graficos/graficopizzaprodutos";
import GraficoBarrasProdutos from "./graficos/graficolinhasvendas";

export default function GraficosVendas() {

    const [graficoAtivo, setGraficoAtivo] = useState("pizza");

    function renderizarGrafico() {
        if (graficoAtivo === "pizza") {
            return <GraficoPizzaProdutos />;
        }

        if (graficoAtivo === "barras") {
            return <GraficoBarrasProdutos />;
        }

        return null;
    }

    return (
        <div className="graficos-vendas-container">

            <div className="graficos-vendas-cabecalho">
                <div className="graficos-vendas-titulo-area">
                    <span className="graficos-vendas-indicador"></span>

                    <div>
                        <h4>Gráficos de Vendas</h4>
                        <p>
                            Visualize o desempenho e a distribuição das vendas
                        </p>
                    </div>
                </div>

                <div className="graficos-vendas-botoes">

                    <button
                        type="button"
                        className={
                            graficoAtivo === "pizza"
                                ? "graficos-vendas-btn ativo"
                                : "graficos-vendas-btn"
                        }
                        onClick={() => setGraficoAtivo("pizza")}
                    >
                        Produtos Vendidos (%)
                    </button>

                    <button
                        type="button"
                        className={
                            graficoAtivo === "barras"
                                ? "graficos-vendas-btn ativo"
                                : "graficos-vendas-btn"
                        }
                        onClick={() => setGraficoAtivo("barras")}
                    >
                        Evolução de Vendas
                    </button>

                </div>
            </div>

            <div
                key={graficoAtivo}
                className="graficos-vendas-conteudo"
            >
                {renderizarGrafico()}
            </div>

        </div>
    );
}