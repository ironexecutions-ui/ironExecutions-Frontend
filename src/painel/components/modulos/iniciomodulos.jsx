import React from "react";
import { useNavigate } from "react-router-dom";
import AreaLogin from "./inicio_modulos/arealogin";
import LojasAvaliacao from "./inicio_modulos/lojasavaliacao";
import Rodape from "./inicio_modulos/rodape";
import ExplicacaoModulos from "./inicio_modulos/explicacaomodulos";
import "./inicio-modulos.css";

export default function InicioModulos() {

    const navigate = useNavigate();

    function solicitarWhatsapp() {
        const numero = "5511918547818";
        const mensagem = encodeURIComponent("Olá! Gostaria de solicitar um sistema comercial.");
        window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
    }

    return (
        <div className="inicio-modulos-fundo">

            <AreaLogin />

            <div style={{ textAlign: "center", marginTop: "20px", padding: "10px" }}>
                <p style={{ color: "white", fontSize: "18px" }}>
                    Não tem seu sistema ainda?
                </p>

                <button
                    onClick={solicitarWhatsapp}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        cursor: "pointer",
                        borderRadius: "6px",
                        backgroundColor: "#25D366",
                        color: "white",
                        border: "none"
                    }}
                >
                    Solicitar sistema comercial via WhatsApp
                </button>
            </div>

            <LojasAvaliacao />
            <ExplicacaoModulos />
            <Rodape />
        </div>
    );

}
