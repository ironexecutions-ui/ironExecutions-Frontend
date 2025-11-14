import React from "react";
import { useNavigate } from "react-router-dom";
import "./hero.css";

export default function Hero() {

    const navigate = useNavigate(); // aqui você ativa o navigate
    const quantidade = 180;

    return (
        <section className="hero-container" id="inicio">

            {[...Array(quantidade)].map((_, i) => {
                const tamanho = Math.random() * 4 + 1;
                const left = Math.random() * 100;
                const bottom = Math.random() * 100;
                const duracao = Math.random() * 15 + 8;
                const delay = Math.random() * -20;
                const cores = ["#ff4d4d", "#4dd2ff", "#ffd84d", "#b84dff", "#ffffff"];
                const cor = cores[Math.floor(Math.random() * cores.length)];

                return (
                    <span
                        key={i}
                        className="particle"
                        style={{
                            width: tamanho,
                            height: tamanho,
                            background: cor,
                            left: `${left}%`,
                            bottom: `${bottom}%`,
                            animationDuration: `${duracao}s`,
                            animationDelay: `${delay}s`
                        }}
                    />
                );
            })}

            <div className="hero-conteudo">
                <br /><br /><br /><br />

                <h1 className="hero-titulo">
                    Desenvolvemos sites modernos e profissionais
                </h1>

                <p className="hero-texto">
                    A Iron Executions transforma sua ideia em uma presença digital de verdade, com design elegante, tecnologia atual e foco em resultados reais.
                </p>

                <button style={{ display: "none" }}
                    className="hero-botao"
                    onClick={() => navigate("/pedido")}
                >
                    Falar sobre meu projeto
                </button>
            </div>
        </section>
    );
}


