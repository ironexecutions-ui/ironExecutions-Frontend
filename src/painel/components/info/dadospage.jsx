import React from "react";
import HeaderAdmin from "../headeradmin";
import DadosAdmin from "./rotas/dadosadmin";

export default function DadosPage() {

    const funcionario = JSON.parse(localStorage.getItem("funcionario"));

    return (
        <div style={{ height: "100vh" }}>

            <HeaderAdmin funcionario={funcionario} />

            <div style={{ padding: "20px" }}>
                <DadosAdmin />
            </div>

        </div>
    );
}
