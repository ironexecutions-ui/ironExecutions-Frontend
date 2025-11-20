import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./topo.css";
import ModalFuncionario from "./modalfuncionario";

// importação correta da imagem
import GravataLogo from "./gravatalogo";

export default function Topo() {
    const navigate = useNavigate();
    const [abrirModal, setAbrirModal] = useState(false);

    function irPara(secao) {
        navigate("/", { replace: false });
        setTimeout(() => {
            const alvo = document.getElementById(secao);
            if (alvo) {
                alvo.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    }

    return (
        <>
            <header className="topo-container">
                <div className="topo-esquerda">
                    <GravataLogo />

                    <span className="topo-logo-text">Iron Executions</span>
                </div>

                <nav className="topo-nav">
                    <button className="topo-nav-link" onClick={() => irPara("inicio")}>Início</button>
                    <button className="topo-nav-link" onClick={() => irPara("servicos")}>Serviços</button>
                    <button className="topo-nav-link" onClick={() => irPara("tipos-sites")}>Tipos de Sites</button>

                    <button
                        className="topo-nav-link topo-funcionario-btn"
                        onClick={() => setAbrirModal(true)}
                    >
                        Sou funcionario
                    </button>

                </nav>
            </header>

            {abrirModal && <ModalFuncionario fechar={() => setAbrirModal(false)} />}
        </>
    );
}
