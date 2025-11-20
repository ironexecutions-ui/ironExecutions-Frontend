import React, { useEffect, useState } from "react";
import "./equipe.css";
import { API_URL } from "../../config";

export default function Equipe() {

    const [lista, setLista] = useState([]);
    const [visivel, setVisivel] = useState(false);

    async function carregar() {
        try {
            const resp = await fetch(`${API_URL}/api/usuarios/todos`);
            if (!resp.ok) {
                setVisivel(false);
                return;
            }

            const dados = await resp.json();

            if (Array.isArray(dados) && dados.length > 0) {
                setLista(dados);
                setVisivel(true);
            } else {
                setVisivel(false);
            }

        } catch (err) {
            console.log("Erro ao carregar equipe", err);
            setVisivel(false);
        }
    }

    useEffect(() => {
        carregar();

        const intervalo = setInterval(() => {
            carregar();
        }, 5000);  

        return () => clearInterval(intervalo);
    }, []);

    if (!visivel) {
        return null;
    }

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

                        <p className="equipe-resp">{f.responsabilidade}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
