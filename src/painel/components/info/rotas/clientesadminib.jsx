// ClientesAdminIB.jsx
import React, { useState } from "react";
import "./clientesadminib.css";

import IBServicos from "./clientesadminib/servicos";
import IBMensalidades from "./clientesadminib/mensalidades";

export default function ClientesAdminIB({ voltar }) {

    const [aba, setAba] = useState("servicos");

    return (
        <div className="ib-container">

            <h2 className="ib-titulo">
                Serviços IronBusiness
            </h2>

            {/* BOTÕES */}
            <div className="ib-botoes">
                <button
                    className={aba === "servicos" ? "ib-btn ativo" : "ib-btn"}
                    onClick={() => setAba("servicos")}
                >
                    Serviços
                </button>

                <button
                    className={aba === "mensalidades" ? "ib-btn ativo" : "ib-btn"}
                    onClick={() => setAba("mensalidades")}
                >
                    Mensalidades
                </button>
            </div>

            {/* CONTEÚDO */}
            <div className="ib-conteudo">
                {aba === "servicos" && <IBServicos />}
                {aba === "mensalidades" && <IBMensalidades />}
            </div>



        </div>
    );
}
