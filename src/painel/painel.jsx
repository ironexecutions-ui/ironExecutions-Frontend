import React from "react";
import HeaderAdmin from "./components/headeradmin";
import InfoAdmin from "./components/infoadmin";
import ServicosAdmin from "./components/servicosadmin";
import OutrosAdmin from "./components/outrosadmin";
import "./painel.css";

export default function Painel() {

    const funcionario = JSON.parse(localStorage.getItem("funcionario"));

    if (!funcionario) {
        return <p style={{ padding: "40px" }}>Nenhum funcionário logado.</p>;
    }

    return (
        <div className="pa-grid">

            <div className="pa-header">
                <HeaderAdmin funcionario={funcionario} />
            </div>

            <div className="pa-info">
                <InfoAdmin />
            </div>

            <div className="pa-serv">
                <ServicosAdmin />
            </div>

            <div className="pa-outros">
                <OutrosAdmin />
            </div>

        </div>
    );
}
