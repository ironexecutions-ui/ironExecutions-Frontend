import React from "react";
import { useLocation } from "react-router-dom";
import "./layoutcorporativoprofissional.css";

export default function LayoutCorporativoProfissional() {

    // Captura o tipo de site pela URL
    const location = useLocation();
    const tipoSite = location.pathname.replace("/tipo/", "").replace("-", " ");

    // Mensagem formatada
    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento para ${tipoSite} com um tipo de layout Corporativo e Profissional.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;


    return (
        <section className="corp-container">


            {/* HEADER */}
            <header className="corp-header">
                <div className="corp-header-center">

                    <div className="corp-logo-area">
                        <h2 className="corp-logo">PrimeCorp</h2>
                        <p className="corp-logo-sub">soluções digitais corporativas</p>
                    </div>

                    <nav className="corp-nav">
                        <a href="#sobre">Sobre</a>
                        <a href="#servicos">Serviços</a>
                        <a href="#metricas">Resultados</a>
                        <a href="#clientes">Clientes</a>
                        <a href="#contato">Contato</a>
                    </nav>

                </div>
            </header>



            {/* HERO */}
            <section className="corp-hero">
                <div className="corp-hero-center">

                    <h1 className="corp-hero-titulo">
                        Tecnologia e estratégia para empresas que buscam crescimento real
                    </h1>

                    <p className="corp-hero-sub">
                        Desenvolvemos plataformas, sites institucionais, dashboards,
                        integrações e soluções digitais que elevam a competitividade da sua empresa.
                    </p>

                    <div className="corp-hero-botoes">
                        <button
                            className="corp-btn-hero"
                            onClick={() => window.open(linkZap, "_blank")}
                        >
                            Começar projeto
                        </button>

                        <button
                            className="corp-btn-hero-outline"
                            onClick={() => window.open(linkZap, "_blank")}
                        >
                            Falar com especialista
                        </button>
                    </div>

                </div>
            </section>



            {/* SOBRE */}
            <section id="sobre" className="corp-section">
                <h2 className="corp-titulo">Quem somos</h2>

                <p className="corp-texto">
                    Atuamos com foco total em eficiência, organização e resultados mensuráveis.
                    Nossos projetos combinam tecnologia moderna, design estratégico e
                    processos estruturados para entregar soluções corporativas sólidas
                    que realmente impactam o dia a dia da empresa.
                </p>
            </section>



            {/* SERVIÇOS */}
            <section id="servicos" className="corp-section">
                <h2 className="corp-titulo">O que desenvolvemos</h2>

                <div className="corp-cards">

                    <div className="corp-card">
                        <h3 className="corp-card-titulo">Sites Institucionais</h3>
                        <p className="corp-card-texto">
                            Apresentação clara e sofisticada da empresa.
                        </p>
                    </div>

                    <div className="corp-card">
                        <h3 className="corp-card-titulo">Sistemas Corporativos</h3>
                        <p className="corp-card-texto">
                            Soluções internas que otimizam produtividade.
                        </p>
                    </div>

                    <div className="corp-card">
                        <h3 className="corp-card-titulo">Integrações Técnicas</h3>
                        <p className="corp-card-texto">
                            APIs, automações e fluxos conectados.
                        </p>
                    </div>

                    <div className="corp-card">
                        <h3 className="corp-card-titulo">Projetos Personalizados</h3>
                        <p className="corp-card-texto">
                            Criados sob medida para necessidades específicas.
                        </p>
                    </div>

                </div>
            </section>



            {/* MÉTRICAS */}
            <section id="metricas" className="corp-section corp-metricas">
                <h2 className="corp-titulo">Resultados que importam</h2>

                <div className="corp-metricas-grid">

                    <div className="corp-metrica">
                        <h3 className="corp-metrica-numero">98 por cento</h3>
                        <p className="corp-metrica-texto">
                            Satisfação de clientes corporativos
                        </p>
                    </div>

                    <div className="corp-metrica">
                        <h3 className="corp-metrica-numero">120 projetos</h3>
                        <p className="corp-metrica-texto">
                            Sistemas e plataformas desenvolvidos
                        </p>
                    </div>

                    <div className="corp-metrica">
                        <h3 className="corp-metrica-numero">15 países</h3>
                        <p className="corp-metrica-texto">
                            Projetos entregues internacionalmente
                        </p>
                    </div>

                </div>
            </section>



            {/* CLIENTES */}
            <section id="clientes" className="corp-section corp-clientes">
                <h2 className="corp-titulo">Empresas que confiam em nós</h2>

                <div className="corp-clientes-grid">

                    <div className="corp-cliente">TechVision</div>
                    <div className="corp-cliente">PrimeBank</div>
                    <div className="corp-cliente">Grupo Nova Era</div>
                    <div className="corp-cliente">StrongSteel</div>
                    <div className="corp-cliente">Pro Solutions</div>
                    <div className="corp-cliente">Global Line</div>

                </div>
            </section>








            {/* FOOTER */}
            <footer className="corp-footer">
                <p>© 2025 PrimeCorp. Todos os direitos reservados.</p>
            </footer><br />
            {/* CONTATO */}
            <section id="contato" className="corp-section corp-contato">
                <h2 className="corp-titulo">Entre em contato</h2>

                <p className="corp-texto">
                    Envie sua necessidade e receba uma proposta corporativa detalhada.
                </p>

                {/* BOTÃO DE ORÇAMENTO COM ZAP */}
                <button
                    className="corp-btn-contato"
                    onClick={() => window.open(linkZap, "_blank")}
                >
                    Solicitar orçamento via WhatsApp
                </button>
            </section><br />
        </section>
    );
}
