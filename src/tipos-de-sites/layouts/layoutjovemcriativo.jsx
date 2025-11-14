import React from "react";
import { useLocation } from "react-router-dom";
import "./layoutjovemcriativo.css";

export default function LayoutJovemCriativo() {

    const location = useLocation();
    const tipoSite = location.pathname.replace("/tipo/", "").replace("-", " ");

    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento de um ${tipoSite} com um layout Jovem e Criativo.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;

    return (
        <main className="jovem-site">


            {/* HERO COLORIDO */}
            <section className="jovem-hero">
                <div className="jovem-hero-center">
                    <h1 className="jovem-hero-titulo">
                        Confeitaria Doce Melodia
                    </h1>

                    <p className="jovem-hero-texto">
                        Bolos criativos para festas e ocasiões especiais, com cores vibrantes que fazem qualquer mesa brilhar.
                    </p>

                    <a href="#contato" className="jovem-hero-botao">
                        Ver mais detalhes
                    </a>
                </div>
            </section>



            {/* SOBRE A CONFEITARIA */}
            <section className="jovem-sobre">
                <div className="jovem-sobre-center">

                    <h2 className="jovem-titulo-section">Quem Somos</h2>

                    <p className="jovem-paragrafo">
                        Somos uma confeitaria criativa apaixonada por cores e sabores. Transformamos cada bolo em uma experiência divertida e cheia de personalidade.
                    </p>

                    <p className="jovem-paragrafo">
                        Nossa equipe trabalha com ingredientes selecionados, mas o diferencial está na criatividade que colocamos em cada detalhe.
                    </p>

                </div>
            </section>



            {/* PRODUTOS */}
            <section className="jovem-produtos">
                <h2 className="jovem-titulo-section">Nossos doces favoritos</h2>

                <div className="jovem-produtos-grid">

                    <div className="jovem-produto-card">
                        <div className="jovem-produto-thumb"></div>
                        <h3 className="jovem-produto-nome">Bolo Arco Iris</h3>
                        <p className="jovem-produto-desc">
                            Colorido por dentro e por fora, com sabor suave e cobertura cremosa.
                        </p>
                        <p className="jovem-produto-preco">R$ 72,90</p>
                    </div>

                    <div className="jovem-produto-card">
                        <div className="jovem-produto-thumb"></div>
                        <h3 className="jovem-produto-nome">Cupcakes Criativos</h3>
                        <p className="jovem-produto-desc">
                            Coberturas temáticas e massa macia. Ideal para aniversários modernos.
                        </p>
                        <p className="jovem-produto-preco">R$ 9,90 cada</p>
                    </div>

                    <div className="jovem-produto-card">
                        <div className="jovem-produto-thumb"></div>
                        <h3 className="jovem-produto-nome">Cookies Coloridos</h3>
                        <p className="jovem-produto-desc">
                            Crocantes por fora e macios por dentro. Feitos com confeitos coloridos.
                        </p>
                        <p className="jovem-produto-preco">R$ 5,00 cada</p>
                    </div>

                    <div className="jovem-produto-card">
                        <div className="jovem-produto-thumb"></div>
                        <h3 className="jovem-produto-nome">Mini Tortas Criativas</h3>
                        <p className="jovem-produto-desc">
                            Tortinhas especiais com decoração artística que encanta qualquer mesa.
                        </p>
                        <p className="jovem-produto-preco">R$ 18,00</p>
                    </div>

                </div>
            </section>



            {/* VANTAGENS */}
            <section className="jovem-vantagens">
                <div className="jovem-vantagens-center">

                    <h2 className="jovem-titulo-section">Por que escolher nossa confeitaria?</h2>

                    <ul className="jovem-lista-vantagens">
                        <li>Cores vibrantes em cada doce</li>
                        <li>Ingredientes cuidadosamente selecionados</li>
                        <li>Decorações criativas que encantam</li>
                        <li>Atendimento personalizado</li>
                        <li>Entrega rápida com embalagens seguras</li>
                    </ul>

                </div>
            </section>



            {/* DEPOIMENTOS */}
            <section className="jovem-depoimentos">
                <h2 className="jovem-titulo-section">O que os clientes dizem</h2>

                <div className="jovem-depo-grid">

                    <div className="jovem-depo-card">
                        <p className="jovem-depo-texto">
                            O bolo arco iris fez a festa inteira sorrir. Perfeito em tudo.
                        </p>
                        <span className="jovem-depo-nome">Mariana Costa</span>
                    </div>

                    <div className="jovem-depo-card">
                        <p className="jovem-depo-texto">
                            Os cupcakes estavam lindos e muito gostosos. Voltarei sempre.
                        </p>
                        <span className="jovem-depo-nome">Daniela Ramos</span>
                    </div>

                </div>
            </section>



            {/* CONTATO */}
            <section id="contato" className="jovem-contato">
                <h2 className="jovem-titulo-section">Fale com a gente</h2>

                <p className="jovem-paragrafo">
                    Encomendas para eventos, aniversários, casamentos e mais.
                    Conte sua ideia e criamos algo especial exclusivamente para você.
                </p>

                <a href={linkZap} target="_blank" className="jovem-contato-btn">
                    Solicitar orçamento
                </a>
            </section>



            {/* FOOTER */}
            <footer className="jovem-footer">
                <p className="jovem-footer-copy">
                    © 2025 Confeitaria Doce Melodia. Todos os direitos reservados.
                </p>
            </footer>

        </main>
    );
}
