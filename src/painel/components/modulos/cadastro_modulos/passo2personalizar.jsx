import React, { useState } from "react";
import "./Passo2Personalizar.css";

export default function Passo2Personalizar({ onContinuar, onPular }) {

    const [mostrarForm, setMostrarForm] = useState(false);

    const [fundo, setFundo] = useState("#ffffff");
    const [letraTipo, setLetraTipo] = useState("Montserrat");
    const [letraCor, setLetraCor] = useState("#000000");

    function enviar(e) {
        e.preventDefault();

        onContinuar({
            fundo: fundo,
            letra_tipo: letraTipo,
            letra_cor: letraCor
        });
    }

    return (
        <div className="passo2-container">

            <h3 className="titulo">Personalização do comércio</h3>

            {!mostrarForm && (
                <div className="botao-container">

                    <button
                        onClick={() => setMostrarForm(true)}
                        className="botao-verde"
                    >
                        Personalizar agora
                    </button>

                    <button
                        onClick={onPular}
                        className="botao-cinza"
                    >
                        Personalizar depois
                    </button>

                </div>
            )}

            {mostrarForm && (
                <form onSubmit={enviar} className="formulario">

                    <label>Cor de fundo</label>
                    <input
                        type="color"
                        value={fundo}
                        onChange={e => setFundo(e.target.value)}
                        className="input-cor"
                    />

                    <label>Estilo de letra</label>
                    <select
                        value={letraTipo}
                        onChange={e => setLetraTipo(e.target.value)}
                        className="input-select"
                    >
                        <option value="Montserrat">Montserrat</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Inter">Inter</option>
                    </select>

                    <label>Cor da letra</label>
                    <input
                        type="color"
                        value={letraCor}
                        onChange={e => setLetraCor(e.target.value)}
                        className="input-cor"
                    />

                    <button
                        type="submit"
                        className="botao-verde"
                    >
                        Continuar
                    </button>
                </form>
            )}
        </div>
    );
}
