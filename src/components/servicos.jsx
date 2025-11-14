import React from "react";
import "./servicos.css";

export default function Servicos() {

    // Todas as classes deste componente começam com "servicos-" para manter organização e evitar conflitos

    return (
        <section className="servicos-container" id="servicos">
            <h2 className="servicos-titulo">Nossos serviços</h2>

            <div className="servicos-cards">

                <div className="servicos-card">
                    <h3 className="servicos-card-titulo">Sites Profissionais</h3>
                    <p className="servicos-card-texto">
                        Sites rápidos, bonitos e responsivos que representam sua marca com autoridade e profissionalismo.
                    </p>
                </div>

                <div className="servicos-card">
                    <h3 className="servicos-card-titulo">Sistemas completos</h3>
                    <p className="servicos-card-texto">
                        Plataformas com banco de dados, login, painel administrativo, pagamentos e funções sob medida.
                    </p>
                </div>

                <div className="servicos-card">
                    <h3 className="servicos-card-titulo">Identidade visual</h3>
                    <p className="servicos-card-texto">
                        Cuidamos da proteção da sua marca, garantindo registro seguro, gestão de domínios, servidores e toda a estrutura técnica necessária para manter sua identidade digital protegida e estável.
                    </p>
                </div>


            </div>
        </section>
    );
}
