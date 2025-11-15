import React, { useEffect, useState } from "react";
import "./equipe.css";
import { API_URL } from "../../config";

export default function Equipe() {

    const [lista, setLista] = useState([]);

    async function carregar() {
        try {
            const resp = await fetch(`${API_URL}/api/usuarios/todos`);
            const dados = await resp.json();
            setLista(dados);
        } catch (err) {
            console.log("Erro ao carregar equipe", err);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <section className="equipe-container" id="equipe">
            <h2 className="equipe-titulo">Nossa Equipe</h2>

            <div className="equipe-scroll">
                {lista.map((f, i) => (
                    <div className="equipe-card" key={i}>
                        <div className="equipe-foto">
                            <img src={f.foto} alt={f.nome} />
                        </div>

                        <h3 className="equipe-nome">
                            {f.nome} {f.sobrenome}
                        </h3>

                        <p className="equipe-funcao">{f.funcao}</p>

                        <p className="equipe-resp">
                            {f.responsabilidade}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
