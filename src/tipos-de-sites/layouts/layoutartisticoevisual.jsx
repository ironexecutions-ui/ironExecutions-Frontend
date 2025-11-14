import React from "react";
import { useLocation } from "react-router-dom";
import "./layoutartisticoevisual.css";

export default function LayoutArtisticoEVisual() {

    const location = useLocation();
    const tipoSite = location.pathname.replace("/tipo/", "").replace("-", " ");

    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento de um ${tipoSite} com um tipo de layout Artístico e Visual.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;

    return (
        <section className="art-container">


            {/* HEADER REAL DO SITE */}
            <header className="header-demo">
                <div className="header-wrapper">

                    <div className="header-logo">
                        <img
                            src="https://images.unsplash.com/photo-1526045612212-70caf35c14df"
                            alt="Logo da Empresa"
                        />
                        <span>Estúdio Aurora</span>
                    </div>

                    <nav className="header-nav">
                        <a href="#sobre">Sobre</a>
                        <a href="#servicos">Serviços</a>
                        <a href="#projetos">Projetos</a>
                        <a href="#contato" className="header-btn">Contato</a>
                    </nav>

                </div>
            </header>


            {/* SOBRE */}
            <section id="sobre" className="art-sobre">
                <div className="art-sobre-conteudo">
                    <h2 className="art-subtitulo">Transformando ideias em identidade visual</h2>

                    <p className="art-sobre-texto">
                        Somos um estúdio especializado em criar marcas, sites e experiências digitais
                        que se destacam pelo apelo artístico e sofisticação visual. Nossa missão é
                        transformar sua essência em arte, conectando pessoas com estética e propósito.
                    </p>

                    <p className="art-sobre-texto">
                        Cada projeto é desenvolvido com atenção aos detalhes, paletas modernas e
                        composições harmônicas que tornam sua presença visual única.
                    </p>
                </div>
            </section>


            {/* SERVIÇOS */}
            <section id="servicos" className="art-servicos">
                <h2 className="art-subtitulo">Nossos serviços</h2>

                <div className="art-servicos-grid">

                    <div className="art-servico-card">
                        <img src="https://images.unsplash.com/photo-1506765515384-028b60a970df" alt="" />
                        <h3>Criação de Identidade Visual</h3>
                        <p>Construímos o visual completo da sua marca com estética profissional e alma artística.</p>
                    </div>

                    <div className="art-servico-card">
                        <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f" alt="" />
                        <h3>Design de Sites Modernos</h3>
                        <p>Sites com visual marcante, animações suaves e experiência de navegação elegante.</p>
                    </div>

                    <div className="art-servico-card">
                        <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5" alt="" />
                        <h3>Branding e Direção de Arte</h3>
                        <p>Criamos estratégias visuais que transmitem sua essência e destacam sua marca.</p>
                    </div>

                    <div className="art-servico-card">
                        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" alt="" />
                        <h3>Produção de Conteúdo</h3>
                        <p>Fotografias, banners e artes profissionais para redes sociais e campanhas.</p>
                    </div>

                </div>
            </section>


            {/* GALERIA */}
            <section id="projetos" className="art-galeria">
                <h2 className="art-subtitulo">Projetos Recentes</h2>

                <div className="art-galeria-grid">
                    <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2" alt="" />
                    <img src="https://images.unsplash.com/photo-1503602642458-232111445657" alt="" />
                    <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e" alt="" />
                </div>
            </section>


            {/* DESTAQUE */}
            <section className="art-destaque">
                <div className="art-destaque-conteudo">
                    <h2>Design que inspira emoção</h2>
                    <p>
                        Criamos layouts que despertam sensação, contam histórias e transformam a forma como sua marca é percebida.
                    </p>
                </div>
            </section>


            {/* VANTAGENS */}
            <section className="art-beneficios">
                <h2 className="art-subtitulo">Por que nossos projetos funcionam</h2>

                <div className="art-grid-beneficios">

                    <div className="art-card">
                        <h3>Design Estratégico</h3>
                        <p>Tudo é pensado para transmitir a essência da marca com clareza e impacto.</p>
                    </div>

                    <div className="art-card">
                        <h3>Experiência Fluida</h3>
                        <p>Navegação confortável e harmoniosa que mantém o usuário no site por mais tempo.</p>
                    </div>

                    <div className="art-card">
                        <h3>Estética Refinada</h3>
                        <p>Visual sofisticado com equilíbrio de cores, tipografia e composição criativa.</p>
                    </div>

                </div>
            </section>


            {/* DEPOIMENTOS */}
            <section className="art-depoimentos">
                <h2 className="art-subtitulo">Depoimentos</h2>

                <div className="art-grid-depoimentos">

                    <div className="art-depoimento">
                        <p className="art-depoimento-texto">“Meu site ficou totalmente profissional e lindo.”</p>
                        <span className="art-depoimento-nome">Ana Duarte</span>
                    </div>

                    <div className="art-depoimento">
                        <p className="art-depoimento-texto">“Um dos melhores investimentos que fiz.”</p>
                        <span className="art-depoimento-nome">Studio Lume</span>
                    </div>

                </div>
            </section>





            {/* FOOTER PROFISSIONAL */}
            <footer className="footer-real">
                <div className="footer-real-grid">

                    <div className="footer-col">
                        <h3>Estúdio Aurora</h3>
                        <p>Design, arte e experiências digitais.</p>
                    </div>

                    <div className="footer-col">
                        <h4>Menu</h4>
                        <a href="#sobre">Sobre nós</a>
                        <a href="#servicos">Serviços</a>
                        <a href="#projetos">Projetos</a>
                    </div>

                    <div className="footer-col">
                        <h4>Contato</h4>
                        <p>Email: contato@estudioaurora.com</p>
                        <p>Telefone: (11) 99999-9999</p>
                    </div>

                    <div className="footer-col">
                        <h4>Redes Sociais</h4>
                        <a href="#">Instagram</a>
                        <a href="#">Behance</a>
                        <a href="#">YouTube</a>
                    </div>

                </div>

                <p className="footer-copy">
                    © 2025 Estúdio Aurora. Todos os direitos reservados.
                </p>
            </footer><br />
            {/* CTA FINAL - ÚNICA PARTE COMERCIAL */}
            <footer id="contato" className="art-footer">
                <h2 className="art-footer-titulo">Quer um site com esse visual?</h2>
                <p className="art-footer-texto">
                    Clique abaixo para solicitar um orçamento completamente personalizado.
                </p>
                <a href={linkZap} className="art-botao-footer">
                    Solicitar orçamento via WhatsApp
                </a>
            </footer>
        </section>
    );
}
