import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../config";
import HorasDetalhes from "./horasdetalhes";
import HorasForm from "./horasform";

export default function HorasLista() {
    const [semanas, setSemanas] = useState([]);
    const [selecionada, setSelecionada] = useState(null);
    const [usuario, setUsuario] = useState(null);

    const detalhesRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/";
            return;
        }

        fetch(`${API_URL}/retorno/me`, {
            headers: { Authorization: "Bearer " + token }
        })
            .then(r => r.json())
            .then(setUsuario);

        fetch(`${API_URL}/horas/semanas`, {
            headers: { Authorization: "Bearer " + token }
        })
            .then(r => r.json())
            .then(setSemanas);
    }, []);

    useEffect(() => {
        if (selecionada && detalhesRef.current) {
            detalhesRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [selecionada]);

    if (!usuario) return null;

    if (![11, 25, 28].includes(usuario.comercio_id)) {
        window.location.href = "/";
        return null;
    }
    function abrirDetalhes(semanaInicio) {
        setSelecionada(semanaInicio);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const el = document.querySelector(".horas-detalhes-wrapper");
                if (el) {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            });
        });
    }


    return (
        <div className="horas-container">
            <h2>Controle de Hoddddras</h2>

            <table className="horas-tabela">
                <thead>
                    <tr>
                        <th>Semana</th>
                        <th>Horas usadas</th>
                        <th>Saldo</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {semanas.map(s => (
                        <tr key={s.semana_inicio}>
                            <td>{s.semana_inicio} até {s.semana_fim}</td>
                            <td>{s.total_horas}h</td>
                            <td>{s.saldo_disponivel}h</td>
                            <td>
                                <button
                                    type="button"
                                    onClick={() => abrirDetalhes(s.semana_inicio)}
                                >
                                    Ver detalhes
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {usuario.comercio_id === 11 && (
                <div className="horas-form-wrapper">
                    <HorasForm />
                </div>
            )}

            {selecionada && (
                <div ref={detalhesRef} className="horas-detalhes-wrapper">
                    <HorasDetalhes semanaInicio={selecionada} />
                </div>
            )}
        </div>
    );
}
