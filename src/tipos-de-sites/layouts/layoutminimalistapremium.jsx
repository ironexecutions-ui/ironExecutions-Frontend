import React from "react";
import { useLocation } from "react-router-dom";
import "./layoutminimalistapremium.css";

export default function LayoutMinimalistaPremium() {

    const location = useLocation();
    const tipoSite = location.pathname.replace("/tipo/", "").replace("-", " ");

    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento de um ${tipoSite} com um layout Minimalista Premium.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;

    return (
        <>
            {/* ================= HEADER ================= */}
            <header className="min-header">
                <div className="min-header-center">

                    <h1 className="min-header-logo">Plataforma Premium</h1>

                    <nav className="min-nav">
                        <a href="#sobre">Sobre</a>
                        <a href="#cursos">Cursos</a>
                        <a href="#beneficios">Benefícios</a>
                        <a href="#depoimentos">Depoimentos</a>
                        <a href="#contato" className="min-nav-btn">Contato</a>
                    </nav>

                </div>
            </header>


            <main className="min-site">


                {/* ================= HERO ================= */}
                <section className="min-hero" aria-label="Introdução da plataforma">
                    <div className="min-hero-center">

                        <h2 className="min-hero-titulo">
                            Plataforma Premium de Cursos Online
                        </h2>

                        <p className="min-hero-texto">
                            Simplicidade elegante ao serviço da educação. Cursos criados para quem busca conhecimento com qualidade, clareza e organização impecável.
                        </p>

                    </div>
                </section>



                {/* ================= SOBRE ================= */}
                <section id="sobre" className="min-sobre" aria-labelledby="titulo-sobre">
                    <div className="min-sobre-center">

                        <h2 id="titulo-sobre" className="min-sec-titulo">Quem Somos</h2>

                        <p className="min-paragrafo">
                            Somos uma plataforma de ensino especializada em conteúdos de alto valor educacional. Nosso objetivo é oferecer cursos diretos, eficientes e com uma experiência minimalista que mantém o aluno focado no que realmente importa.
                        </p>

                        <p className="min-paragrafo">
                            Trabalhamos com instrutores experientes e materiais exclusivos, organizados para proporcionar clareza e aprendizado acelerado.
                        </p>

                    </div>
                </section>



                {/* ================= CURSOS ================= */}
                <section id="cursos" className="min-cursos" aria-labelledby="titulo-cursos">
                    <h2 id="titulo-cursos" className="min-sec-titulo">Cursos em Destaque</h2>

                    <div className="min-cursos-grid">

                        <article className="min-card-curso">
                            <div className="min-card-thumb" role="img" aria-label="Imagem do curso Marketing Essencial"></div>
                            <h3 className="min-card-nome">Marketing Essencial</h3>

                            <p className="min-card-desc">
                                Aprenda os princípios fundamentais do marketing com exemplos claros e conteúdo direto ao ponto.
                            </p>

                            <p className="min-card-preco">R$ 89,90</p>
                        </article>

                        <article className="min-card-curso">
                            <div className="min-card-thumb" role="img" aria-label="Imagem do curso Produtividade Moderna"></div>
                            <h3 className="min-card-nome">Produtividade Moderna</h3>

                            <p className="min-card-desc">
                                Técnicas eficientes para melhorar sua rotina e alcançar mais com menos esforço.
                            </p>

                            <p className="min-card-preco">R$ 129,90</p>
                        </article>

                        <article className="min-card-curso">
                            <div className="min-card-thumb" role="img" aria-label="Imagem do curso Gestão de Projetos"></div>
                            <h3 className="min-card-nome">Gestão de Projetos</h3>

                            <p className="min-card-desc">
                                Abordagens práticas de gestão para quem deseja liderar projetos com precisão e simplicidade.
                            </p>

                            <p className="min-card-preco">R$ 159,90</p>
                        </article>

                    </div>
                </section>



                {/* ================= BENEFÍCIOS ================= */}
                <section id="beneficios" className="min-beneficios" aria-labelledby="titulo-beneficios">
                    <div className="min-beneficios-center">

                        <h2 id="titulo-beneficios" className="min-sec-titulo">Por que nossos cursos funcionam</h2>

                        <ul className="min-beneficios-lista">
                            <li>Abordagem minimalista que elimina distrações</li>
                            <li>Conteúdo direto, objetivo e de fácil assimilação</li>
                            <li>Instrutores com experiência real na área</li>
                            <li>Materiais multimídia organizados com precisão</li>
                            <li>Acesso ilimitado ao conteúdo após a compra</li>
                        </ul>

                    </div>
                </section>



                {/* ================= DEPOIMENTOS ================= */}
                <section id="depoimentos" className="min-depoimentos" aria-labelledby="titulo-depoimentos">
                    <h2 id="titulo-depoimentos" className="min-sec-titulo">Depoimentos</h2>

                    <div className="min-depo-grid">

                        <article className="min-depo-card">
                            <p className="min-depo-texto">
                                Conteúdo limpo, organizado e muito fácil de entender. A plataforma é agradável e acolhedora.
                            </p>
                            <footer className="min-depo-nome">Lucas Fernandes</footer>
                        </article>

                        <article className="min-depo-card">
                            <p className="min-depo-texto">
                                A experiência minimalista realmente faz diferença. O curso é direto e eficiente.
                            </p>
                            <footer className="min-depo-nome">Juliana Moreira</footer>
                        </article>

                    </div>
                </section>



                {/* ================= CONTATO ================= */}
                <section id="contato" className="min-contato" aria-labelledby="titulo-contato">
                    <h2 id="titulo-contato" className="min-sec-titulo">Entre em Contato</h2>

                    <p className="min-paragrafo">
                        Deseja criar uma plataforma premium como esta ou ter sua própria loja de cursos totalmente personalizada?
                    </p>

                    <a href={linkZap} className="min-contato-btn" target="_blank" rel="noopener noreferrer">
                        Solicitar orçamento via WhatsApp
                    </a>
                </section>

            </main>



            {/* ================= FOOTER ================= */}
            <footer className="min-footer">
                <p className="min-footer-copy">
                    © 2025 Plataforma Minimalista Premium. Todos os direitos reservados.
                </p>
            </footer>
        </>
    );
}
