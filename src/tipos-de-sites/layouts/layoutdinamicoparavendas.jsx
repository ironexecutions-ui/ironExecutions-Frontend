import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./layoutdinamicoparavendas.css";

export default function LayoutDinamicoParaVendas() {

    const location = useLocation();
    const tipoSite = location.pathname.replace("/tipo/", "").replace("-", " ");

    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento de um ${tipoSite} com um layout Dinâmico para Vendas.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;

    const produtos = [
        { id: 1, nome: "Combo de Pizza Familiar", descricao: "Pizza grande, refrigerante dois litros, borda recheada incluida.", preco: 74.90 },
        { id: 2, nome: "Combo Individual Simples", descricao: "Mini pizza com dois sabores, bebida lata incluida.", preco: 32.50 },
        { id: 3, nome: "Pizza Quatro Queijos", descricao: "Mussarela, parmesao, provolone, gouda, temperos especiais.", preco: 58.00 },
        { id: 4, nome: "Pizza Calabresa Artesanal", descricao: "Calabresa selecionada, massa fina, molho exclusivo.", preco: 45.90 },
        { id: 5, nome: "Pizza Marguerita Premium", descricao: "Manjericao fresco, tomate selecionado, azeite especial.", preco: 48.90 },
        { id: 6, nome: "Pizza Pepperoni Extra", descricao: "Pepperoni crocante, massa artesanal com fermentacao lenta.", preco: 56.90 },
        { id: 7, nome: "Esfiha aberta", descricao: "Carne especial, massa leve, temperos selecionados.", preco: 8.90 },
        { id: 8, nome: "Esfiha de queijo", descricao: "Queijo derretido com leve toque de oregano.", preco: 7.50 },
        { id: 9, nome: "Porcao de batatas rústicas", descricao: "Cortadas a mao, assadas com ervas, acompanha molho.", preco: 22.00 },
        { id: 10, nome: "Porcao de frango crocante", descricao: "Empanado artesanal, molho especial da casa.", preco: 29.00 },
        { id: 11, nome: "Refrigerante lata", descricao: "Bebida gelada, diversos sabores.", preco: 6.50 },
        { id: 12, nome: "Refrigerante dois litros", descricao: "Bebida para toda a familia.", preco: 12.00 }
    ];

    const [carrinho, setCarrinho] = useState([]);

    const adicionar = item => {
        setCarrinho(prev => [...prev, item]);
    };

    const remover = id => {
        setCarrinho(prev => prev.filter(p => p.id !== id));
    };

    const total = carrinho.reduce((acc, item) => acc + item.preco, 0).toFixed(2);

    return (
        <main className="dpv-root">

            {/* ========================================================== */}
            {/* HEADER */}
            {/* ========================================================== */}

            <header className="dpv-header">
                <div className="dpv-header-inner">

                    <div className="dpv-header-brand">
                        <div className="dpv-header-logo-placeholder"></div>
                        <span className="dpv-header-title">Pizzaria Napoli Digital</span>
                    </div>

                    <nav className="dpv-header-nav">
                        <a href="#inicio">Inicio</a>
                        <a href="#cardapio">Cardapio</a>
                        <a href="#sobre">Sobre</a>
                        <a href="#avaliacoes">Avaliacoes</a>
                        <a href="#contato" className="dpv-header-nav-btn">Contato</a>
                    </nav>
                </div>
            </header>



            {/* ========================================================== */}
            {/* HERO */}
            {/* ========================================================== */}

            <section id="inicio" className="dpv-hero-section">
                <div className="dpv-hero-overlay"></div>

                <div className="dpv-hero-content">
                    <h1 className="dpv-hero-title">
                        Experiencia gastronômica com sabor autêntico e preparo artesanal
                    </h1>

                    <p className="dpv-hero-sub">
                        Um cardapio completo pensado para encantar seus clientes.
                        Perfeito para demonstrar a potencia de um site de vendas moderno.
                    </p>

                    <a href="#cardapio" className="dpv-hero-action">
                        Acessar o cardapio
                    </a>
                </div>
            </section>



            {/* ========================================================== */}
            {/* SESSAO SOBRE */}
            {/* ========================================================== */}

            <section id="sobre" className="dpv-sobre-section">
                <div className="dpv-sobre-inner">

                    <h2 className="dpv-sobre-title">Sobre nossa plataforma de exemplo</h2>

                    <p className="dpv-sobre-text">
                        Este site foi desenvolvido como uma demonstração profissional para apresentar a estrutura, organizacao, qualidade visual e logica comercial que um site dinamico para vendas pode oferecer. A ideia é entregar uma base sólida e bem estruturada que possa ser adaptada a diversos tipos de negocios.
                        Aqui o foco é mostrar navegacao clara, organizacao impecavel, textos alinhados e componentes funcionais como o carrinho, sistema de precos e botao de pedido integrado ao WhatsApp.
                    </p>

                    <p className="dpv-sobre-text">
                        A proposta é oferecer uma experiencia moderna e realista. Nada de elementos genéricos ou paginas vazias. Cada parte foi pensada para que o cliente veja de forma concreta o potencial do site que voce pode oferecer. Alem disso, mantivemos um padrao visual coerente, sem uso de imagens reais, mas com elementos esteticos utilizando sombreamentos, espacamentos, cores e formas que simulam uma identidade visual profissional.
                    </p>

                    <p className="dpv-sobre-text">
                        A estrutura utiliza navegacao fixa no topo, seções organizadas, bloco de produtos, funcionalidade de carrinho, textos informativos, depoimentos, secao de contato, rodape completo e um chamamento comercial final para solicitacao de orçamento. Tudo isso mantendo padroes semanticos corretos.
                    </p>

                </div>
            </section>



            {/* ========================================================== */}
            {/* CARDAPIO */}
            {/* ========================================================== */}

            <section id="cardapio" className="dpv-cardapio-section">
                <h2 className="dpv-cardapio-title">Cardapio completo</h2>

                <p className="dpv-cardapio-sub">
                    Exemplos de itens para demonstrar como um comercio pode exibir produtos e promover vendas em um layout dinâmico.
                </p>

                <div className="dpv-cardapio-grid">

                    {produtos.map(prod => (
                        <article key={prod.id} className="dpv-produto-card">

                            <div className="dpv-produto-thumb"></div>

                            <h3 className="dpv-produto-nome">{prod.nome}</h3>

                            <p className="dpv-produto-desc">{prod.descricao}</p>

                            <div className="dpv-produto-preco-box">
                                <span className="dpv-produto-preco">R$ {prod.preco.toFixed(2)}</span>

                                <button className="dpv-produto-btn" onClick={() => adicionar(prod)}>
                                    Adicionar
                                </button>
                            </div>
                        </article>
                    ))}

                </div>
            </section>



            {/* ========================================================== */}
            {/* CARRINHO */}
            {/* ========================================================== */}

            <section id="delivery" className="dpv-carrinho-section">

                <h2 className="dpv-carrinho-title">Seu carrinho</h2>

                {carrinho.length === 0 && (
                    <p className="dpv-carrinho-empty">Ainda nao existem itens no carrinho</p>
                )}

                <ul className="dpv-carrinho-list">

                    {carrinho.map((item, index) => (
                        <li key={index} className="dpv-carrinho-item">

                            <div className="dpv-carrinho-info">
                                <span className="dpv-carrinho-nome">{item.nome}</span>
                                <span className="dpv-carrinho-preco">R$ {item.preco.toFixed(2)}</span>
                            </div>

                            <button className="dpv-carrinho-remove" onClick={() => remover(item.id)}>
                                Remover
                            </button>

                        </li>
                    ))}

                </ul>

                {carrinho.length > 0 && (
                    <div className="dpv-carrinho-total-box">
                        <p className="dpv-carrinho-total">
                            Total do pedido: <strong>R$ {total}</strong>
                        </p>

                        <a
                            className="dpv-carrinho-finalizar"

                        >
                            Finalizar pedido
                        </a>
                    </div>
                )}
            </section>



            {/* ========================================================== */}
            {/* AVALIACOES */}
            {/* ========================================================== */}

            <section id="avaliacoes" className="dpv-aval-section">

                <h2 className="dpv-aval-title">Avaliacoes de clientes</h2>

                <div className="dpv-aval-grid">

                    <article className="dpv-aval-card">
                        <p className="dpv-aval-text">
                            Atendimento excelente, rapidez no pedido e site muito fácil de usar.
                            A navegacao intuitiva deixa tudo mais simples e o sistema de carrinho facilita bastante.
                        </p>
                        <span className="dpv-aval-nome">Carolina Mendes</span>
                    </article>

                    <article className="dpv-aval-card">
                        <p className="dpv-aval-text">
                            O cardapio bem organizado ajuda muito na tomada de decisao.
                            Gostei da forma como os produtos sao apresentados e o fluxo para finalizar o pedido é direto e sem confusoes.
                        </p>
                        <span className="dpv-aval-nome">Rodrigo Sousa</span>
                    </article>

                    <article className="dpv-aval-card">
                        <p className="dpv-aval-text">
                            O site demonstra credibilidade. Esse tipo de layout moderno faz diferença para quem quer vender mais.
                            Certamente contrataria um site assim para meu negocio.
                        </p>
                        <span className="dpv-aval-nome">Marina Gomes</span>
                    </article>

                </div>

            </section>






            {/* ========================================================== */}
            {/* FOOTER */}
            {/* ========================================================== */}

            <footer className="dpv-footer">

                <div className="dpv-footer-grid">

                    <div className="dpv-footer-col">
                        <h3 className="dpv-footer-col-title">Pizzaria Napoli Digital</h3>
                        <p className="dpv-footer-col-text">
                            Plataforma de exemplo criada para demonstrar como um site pode vender mais utilizando estrutura organizada e um layout moderno.
                        </p>
                    </div>

                    <div className="dpv-footer-col">
                        <h4 className="dpv-footer-col-title">Navegacao</h4>

                        <ul className="dpv-footer-links">
                            <li><a href="#inicio">Inicio</a></li>
                            <li><a href="#sobre">Sobre</a></li>
                            <li><a href="#cardapio">Cardapio</a></li>
                            <li><a href="#avaliacoes">Avaliacoes</a></li>
                            <li><a href="#contato">Contato</a></li>
                        </ul>
                    </div>

                    <div className="dpv-footer-col">
                        <h4 className="dpv-footer-col-title">Informacoes</h4>

                        <p className="dpv-footer-col-text">
                            Este site é apenas uma demonstracao com fins de apresentacao comercial.
                            Aqui voce visualiza exatamente como sua pagina pode ficar com um layout profissional.
                        </p>
                    </div>

                </div>

                <p className="dpv-footer-copy">
                    © 2025 Pizzaria Napoli Digital. Todos os direitos reservados.
                </p>

            </footer>



            {/* ========================================================== */}
            {/* CTA FINAL COMERCIAL */}
            {/* ========================================================== */}

            <footer className="dpv-cta-final">

                <h2 className="dpv-cta-final-title">
                    Gostou deste modelo.
                </h2>

                <p className="dpv-cta-final-text">
                    Posso criar um site profissional e completo para seu negocio com esse mesmo nivel de qualidade.
                </p>

                <a href={linkZap} className="dpv-cta-final-btn" target="_blank">
                    Solicitar orçamento agora
                </a>

            </footer>

        </main>
    );
}
