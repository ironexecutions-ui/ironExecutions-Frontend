import React, { useState } from "react";
import "./layoutbuttons.css";

export default function LayoutButtons({ onSelect }) {

    const [mostrarBotoes, setMostrarBotoes] = useState(true);

    const layouts = [
        "Clean e Moderno",
        "Jovem e Criativo",
        "Dark e Futurista",
        "Elegante e Luxuoso",
        "Corporativo Profissional",
        "Artístico e Visual",
        "Minimalista Premium",
        "Dinâmico para Vendas"
    ];

    function selecionarLayout(item) {
        setMostrarBotoes(false);     // some os botões
        onSelect(item);              // ativa o layout no site
    }

    function reabrirLayouts() {
        setMostrarBotoes(true);      // volta os botões
        onSelect(null);              // some o site demonstrativo
    }

    return (
        <>

            {/* BOTÃO FIXO PARA VOLTAR */}
            {!mostrarBotoes && (
                <button className="lb-voltar" onClick={reabrirLayouts}>
                    Outros layouts
                </button>
            )}

            {/* BOTÕES DE LAYOUT */}
            {mostrarBotoes && (
                <div className="lb-container">
                    {layouts.map((item, index) => (
                        <button
                            key={index}
                            className="lb-btn"
                            onClick={() => selecionarLayout(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}

        </>
    );
}
