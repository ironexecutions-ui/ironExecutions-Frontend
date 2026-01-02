import React, { useEffect, useState } from "react";
import "./blocomodulos.css";
import { URL } from "../../../url";

export default function BlocoModulos({ comercioId, podeEditar }) {

    const [modulos, setModulos] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        carregar();
    }, []);

    function carregar() {
        fetch(`${URL}/modulos/empresa/${comercioId}`, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(r => r.json())
            .then(setModulos);
    }

    function solicitar(modulo) {
        fetch(`${URL}/modulos/solicitar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                comercio_id: comercioId,
                modulo
            })
        }).then(() => carregar());
    }

    return (
        <div className="bm-container">

            <h2 className="bm-titulo">Módulos</h2>

            <div className="bm-lista">
                {modulos.map(m => (
                    <div key={m.modulo} className="bm-item">
                        <div className="bm-clas"> <span className="bm-nome">{m.modulo}</span>
                            <span className="bm-descricao">{m.descricao}</span>
                        </div>

                        <div className="bm-acao">

                            {m.ativo === null && (
                                podeEditar ? (
                                    <button
                                        className="bm-btn bm-btn-solicitar"
                                        onClick={() => solicitar(m.modulo)}
                                    >
                                        Solicitar
                                    </button>
                                ) : (
                                    <span className="bm-status bm-inativo">
                                        Inativo
                                    </span>
                                )
                            )}

                            {m.ativo === 0 && (
                                <span className="bm-status bm-solicitado">
                                    Solicitado
                                </span>
                            )}

                            {m.ativo === 1 && (
                                <span className="bm-status bm-ativo">
                                    Ativo
                                </span>
                            )}

                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}
