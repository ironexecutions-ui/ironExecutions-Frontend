import React from "react";
import "./pedido.css";

export default function Pedido() {
    return (
        <div className="pedido-container">
            <br /><br /><br /><br />
            <h1 className="pedido-titulo">Fale sobre seu projeto</h1>
            <p className="pedido-texto">
                Preencha as informações do seu projeto para que a Iron Executions possa entrar em contato com você.
            </p>

            <form className="pedido-form">
                <input type="text" placeholder="Seu nome" required />
                <input type="email" placeholder="Seu email" required />
                <textarea placeholder="Descreva seu projeto" required />

                <button type="submit" className="pedido-botao">
                    Enviar pedido
                </button>
            </form>
        </div>
    );
}
