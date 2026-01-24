import React, { useState } from "react";

import LucroGeral from "./analises/lucrogeral";
import Code from "./analises/code";
import LucroPorMes from "./analises/lucropormes";
import Contabilidade from "./analises/contabilidade";

import "./analiseprodutos.css";

export default function AnaliseProdutos() {

    const [aba, setAba] = useState("lucro-geral");

    return (
        <div className="analise-produtos-container">

            <div className="analise-botoes">
                <button
                    className={aba === "lucro-geral" ? "ativo" : ""}
                    onClick={() => setAba("lucro-geral")}
                >
                    % Lucro Geral
                </button>

                <button
                    className={aba === "ranking" ? "ativo" : ""}
                    onClick={() => setAba("ranking")}
                >
                    Codigo de barras & QrCode
                </button>

                <button
                    style={{ display: "none" }}

                    className={aba === "lucro-mes" ? "ativo" : ""}
                    onClick={() => setAba("lucro-mes")}
                >
                    Lucro por Mês
                </button>

                <button
                    className={aba === "sem-venda" ? "ativo" : ""}
                    onClick={() => setAba("sem-venda")}
                >
                    Contabilidade
                </button>
            </div>


            <div className="analise-conteudo">
                {aba === "lucro-geral" && <LucroGeral />}
                {aba === "ranking" && <Code />}
                {aba === "lucro-mes" && <LucroPorMes />}
                {aba === "sem-venda" && <Contabilidade />}
            </div>

        </div>
    );
}
