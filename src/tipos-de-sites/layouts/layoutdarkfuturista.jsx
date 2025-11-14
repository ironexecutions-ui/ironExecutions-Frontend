import React from "react";
import { useLocation } from "react-router-dom";
import "./layoutdarkfuturista.css";

export default function LayoutDarkFuturista() {

    // Captura o tipo de site pela URL
    const location = useLocation();
    const tipoSite = location.pathname.replace("/tipo/", "").replace("-", " ");

    // Mensagem para WhatsApp
    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento para ${tipoSite} com um tipo de layout Dark e Futurista.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;


    return (
        <section className="dark-container">


            {/* HEADER */}
            <header className="dark-header">
                <div className="dark-header-center">

                    <div className="dark-logo">
                        <span>NeoTech</span>
                    </div>

                    <nav className="dark-nav">
                        <a href="#sobre">Sobre</a>
                        <a href="#features">Tecnologia</a>
                        <a href="#projetos">Projetos</a>
                        <a href="#contato">Contato</a>
                    </nav>

                </div>
            </header>



            {/* HERO */}
            <section className="dark-hero">
                <div className="dark-hero-content">
                    <h1>O futuro começa aqui</h1>

                    <p>
                        Criamos experiências digitais com atmosfera tecnológica,
                        efeitos neon e visual sofisticado para marcas modernas.
                    </p>

                    <button
                        className="dark-btn-hero"
                        onClick={() => window.open(linkZap, "_blank")}
                    >
                        Solicitar orçamento via WhatsApp
                    </button>
                </div>
            </section>



            {/* SOBRE */}
            <section id="sobre" className="dark-section">
                <h2 className="dark-titulo-sec">Um estilo que transmite inovação</h2>

                <p className="dark-texto-sec">
                    O visual dark futurista cria impacto imediato, une contraste com iluminação neon,
                    transmite tecnologia e reforça a sensação de modernidade.
                </p>
            </section>



            {/* FEATURES */}
            <section id="features" className="dark-features">
                <h2 className="dark-titulo-sec">Tecnologias aplicadas</h2>

                <div className="dark-features-grid">

                    <div className="dark-feature-card">
                        <h3>Interface Neon</h3>
                        <p>Luzes suaves e detalhes brilhantes destacam sua marca.</p>
                    </div>

                    <div className="dark-feature-card">
                        <h3>Movimento Fluido</h3>
                        <p>Animações intuitivas que deixam a navegação leve.</p>
                    </div>

                    <div className="dark-feature-card">
                        <h3>Clima Tech</h3>
                        <p>Composição moderna que lembra sistemas e plataformas avançadas.</p>
                    </div>

                    <div className="dark-feature-card">
                        <h3>Design Minimalista</h3>
                        <p>Ambiente focado no conteúdo com estética limpa.</p>
                    </div>

                </div>
            </section>



            {/* GALERIA */}
            <section id="projetos" className="dark-galeria">
                <h2 className="dark-titulo-sec">Projetos em estilo futurista</h2>

                <div className="dark-galeria-grid">

                    <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e" alt="" />
                    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475" alt="" />
                    <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d" alt="" />

                </div>
            </section>



            {/* DEPOIMENTOS */}
            <section className="dark-depoimentos">
                <h2 className="dark-titulo-sec">Depoimentos</h2>

                <div className="dark-depoimentos-grid">

                    <div className="dark-depoimento">
                        <p>“O estilo futurista deixou meu site impressionante.”</p>
                        <span>Luma Design</span>
                    </div>

                    <div className="dark-depoimento">
                        <p>“O visual escuro e neon elevou minha marca.”</p>
                        <span>TechWave Studio</span>
                    </div>

                </div>
            </section>







            {/* FOOTER */}
            <footer className="dark-footer">
                <p>© 2025 NeoTech. Todos os direitos reservados.</p>
            </footer><br />
            {/* CONTATO */}
            <section id="contato" className="dark-contato">
                <h2 className="dark-titulo-sec">Entre em contato</h2>

                <p className="dark-texto-sec">
                    Conte sua ideia e receba um projeto futurista criado especialmente para você.
                </p>

                <button
                    className="dark-btn-contato"
                    onClick={() => window.open(linkZap, "_blank")}
                >
                    Solicitar orçamento via WhatsApp
                </button>
            </section>
        </section>
    );
}
