import React, { useState } from "react";
import "./headeradmin.css";

export default function HeaderAdmin({ funcionario }) {

    const [mostrarModal, setMostrarModal] = useState(false);

    return (
        <>
            <header className="ha-header">
                <img
                    src={funcionario.foto}
                    alt="Foto do funcionário"
                    className="ha-foto"
                />

                <div>
                    <h2 className="ha-nome">
                        {funcionario.nome} {funcionario.sobrenome}
                    </h2>

                    <p
                        className="ha-funcao"
                        onClick={() => setMostrarModal(true)}
                    >
                        {funcionario.funcao}
                    </p>
                </div>
            </header>

            {mostrarModal && (
                <div
                    className="ha-modal-overlay"
                    onClick={() => setMostrarModal(false)}
                >
                    <div
                        className="ha-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="ha-modal-titulo">Responsabilidade</h2>

                        <p className="ha-modal-texto">
                            {funcionario.responsabilidade}
                        </p>

                        <button
                            className="ha-modal-botao"
                            onClick={() => setMostrarModal(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
