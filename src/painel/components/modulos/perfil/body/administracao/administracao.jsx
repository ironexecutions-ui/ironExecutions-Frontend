import React, { useState } from "react";
import "./administracao.css";
import GraficosVendas from "./componentes/graficovendas";
import AnaliseProdutos from "./componentes/analiseprodutos";
import ResumoProdutos from "./componentes/resumoprodutos";
import HistoricoVendas from "./componentes/historicovendas";
import FechamentoCaixa from "./componentes/fechamentocaixa";

export default function Administracao() {
    const [abaAtiva, setAbaAtiva] = useState(null);

    return (
        <div className="administracao-container">
            <h3>Área de Administração</h3>

            <div className="administracao-botoes">
                <button
                    className={abaAtiva === "graficos" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("graficos")}
                >
                    Gráficos
                </button>

                <button
                    className={abaAtiva === "analise" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("analise")}
                >
                    Análise de Produtos
                </button>

                <button
                    className={abaAtiva === "resumo" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("resumo")}
                >
                    Resumo de Produtos
                </button>

                <button
                    className={abaAtiva === "historico" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("historico")}
                >
                    Histórico de Vendas
                </button>

                <button
                    className={abaAtiva === "fechamento" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("fechamento")}
                >
                    Fechamento de Caixa
                </button>
            </div>

            <div className="administracao-conteudo">
                {abaAtiva === "graficos" && <GraficosVendas />}
                {abaAtiva === "analise" && <AnaliseProdutos />}
                {abaAtiva === "resumo" && <ResumoProdutos />}
                {abaAtiva === "historico" && <HistoricoVendas />}
                {abaAtiva === "fechamento" && <FechamentoCaixa />}
            </div>
        </div>

    );
}
