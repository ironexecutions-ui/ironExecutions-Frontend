import React from "react";
import { useLocation } from "react-router-dom";
import "./layoutcleanmoderno.css";

export default function LayoutCleanModerno() {

    // Captura o tipo de site pela URL
    const location = useLocation();
    const tipoSite = location.pathname.replace("/tipo/", "").replace("-", " ");

    // Mensagem formatada
    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento para ${tipoSite} com um tipo de layout Clean e Moderno.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;

    return (
        <section className="clean-container">

            {/* HEADER */}
            <header className="clean-header">
                <div className="clean-header-center">
                    <h2 className="clean-logo">CleanVision</h2>

                    <nav className="clean-nav">
                        <a href="#sobre">Sobre</a>
                        <a href="#servicos">Serviços</a>
                        <a href="#depoimentos">Depoimentos</a>
                        <a href="#contato">Contato</a>
                    </nav>


                </div>
            </header>





            {/* SOBRE */}
            <section id="sobre" className="clean-section">
                <h2 className="clean-titulo">Sobre o layout</h2>

                <p className="clean-texto">
                    O CleanVision foi criado com foco em leveza, estrutura organizada e leitura fácil.
                    Ele valoriza espaços, harmonia e clareza, criando uma experiência agradável tanto no
                    celular quanto no computador.
                </p>
            </section>


            {/* SERVIÇOS */}
            <section id="servicos" className="clean-section">
                <h2 className="clean-titulo">Seções principais</h2>

                <div className="clean-cards">

                    <div className="clean-card">
                        <h3 className="clean-card-titulo">Organização impecável</h3>
                        <p className="clean-card-texto">
                            Cada bloco segue um padrão claro que facilita a leitura e deixa tudo elegante.
                        </p>
                    </div>

                    <div className="clean-card">
                        <h3 className="clean-card-titulo">Design responsivo</h3>
                        <p className="clean-card-texto">
                            Adaptado automaticamente para qualquer tela, mantendo a qualidade visual.
                        </p>
                    </div>

                    <div className="clean-card">
                        <h3 className="clean-card-titulo">Minimalismo moderno</h3>
                        <p className="clean-card-texto">
                            Visual limpo, paleta clara e tipografia elegante para transmitir profissionalismo.
                        </p>
                    </div>

                </div>
            </section>


            {/* BENEFÍCIOS */}
            <section className="clean-beneficios clean-section">
                <h2 className="clean-titulo">Por que esse layout funciona</h2>

                <div className="clean-beneficios-grid">

                    <div className="clean-beneficio">
                        <h3>Clareza máxima</h3>
                        <p>O usuário encontra o que busca rapidamente.</p>
                    </div>

                    <div className="clean-beneficio">
                        <h3>Estética leve</h3>
                        <p>Ambiente arejado com ótimo espaçamento.</p>
                    </div>

                    <div className="clean-beneficio">
                        <h3>Profissionalismo</h3>
                        <p>Aparência séria e moderna que transmite confiança.</p>
                    </div>

                </div>
            </section>


            {/* DEPOIMENTOS */}
            <section id="depoimentos" className="clean-section">
                <h2 className="clean-titulo">Depoimentos</h2>

                <div className="clean-depoimentos">

                    <div className="clean-depoimento">
                        <p>“Um site extremamente claro e fácil de navegar. Exatamente o que eu buscava.”</p>
                        <span>- Marina Torres</span>
                    </div>

                    <div className="clean-depoimento">
                        <p>“Visual leve e elegante, meus clientes elogiam até hoje.”</p>
                        <span>- Consultoria Nova Era</span>
                    </div>

                </div>
            </section>


            {/* CONTATO */}
            <section id="contato" className="clean-section clean-contato">
                <h2 className="clean-titulo">Entre em contato</h2>

                <p className="clean-texto">
                    Conte sua ideia e nós criamos um site clean, moderno e profissional para você.
                </p>

                <button
                    className="clean-btn-contato"
                    onClick={() => window.open(linkZap, "_blank")}
                >
                    Enviar mensagem
                </button>
            </section>


            {/* FOOTER */}
            <footer className="clean-footer">
                <p>© 2025 CleanVision. Todos os direitos reservados.</p>
            </footer>
            {/* HERO */} <br />
            <section className="clean-hero">
                <div className="clean-hero-center">
                    <h1 className="clean-hero-titulo">
                        Um layout moderno, limpo e direto ao ponto
                    </h1>

                    <p className="clean-hero-sub">
                        Perfeito para empresas, profissionais e páginas institucionais que precisam transmitir confiança.
                    </p>

                    {/* BOTÃO DE ORÇAMENTO COM ZAP */}
                    <button
                        className="clean-btn-hero"
                        onClick={() => window.open(linkZap, "_blank")}
                    >
                        Solicitar orçamento via WhatsApp
                    </button>
                </div>
            </section>
        </section>
    );
}
