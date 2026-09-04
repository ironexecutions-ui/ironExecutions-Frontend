import React from "react";

export default function IronStoreExplicacao() {
    return (
        <>
            <section className="ironstore-sobre-apresentacao">
                <div className="ironstore-sobre-apresentacao__container">

                    <div className="ironstore-sobre-apresentacao__conteudo">

                        <span className="ironstore-sobre-apresentacao__categoria">
                            MÓDULO IRONSTORE
                        </span>

                        <h1 className="ironstore-sobre-apresentacao__titulo">
                            Seu comércio aberto para vendas também pela internet
                        </h1>

                        <p className="ironstore-sobre-apresentacao__descricao">
                            A IronStore é a área de vendas online da
                            Iron Executions. Ela permite que o comércio tenha
                            sua própria loja virtual para apresentar produtos,
                            receber compras, pagamentos e organizar a entrega
                            dos pedidos aos clientes.
                        </p>

                        <p className="ironstore-sobre-apresentacao__descricao-secundaria">
                            O objetivo não é apenas colocar produtos em uma
                            página. A IronStore cria um canal de vendas conectado
                            à operação do comércio, permitindo que uma compra
                            realizada pelo cliente na internet continue sendo
                            acompanhada pelo estabelecimento dentro do sistema.
                        </p>

                        <div className="ironstore-sobre-apresentacao__resumo">

                            <div className="ironstore-sobre-apresentacao__resumo-item">
                                <strong>Loja virtual</strong>
                                <span>
                                    Produtos disponíveis para seus clientes
                                    acessarem pela internet.
                                </span>
                            </div>

                            <div className="ironstore-sobre-apresentacao__resumo-item">
                                <strong>Compra online</strong>
                                <span>
                                    O cliente pode escolher produtos e realizar
                                    seu pedido pela loja.
                                </span>
                            </div>

                            <div className="ironstore-sobre-apresentacao__resumo-item">
                                <strong>Entrega</strong>
                                <span>
                                    O pedido continua sendo acompanhado até
                                    chegar ao cliente.
                                </span>
                            </div>

                        </div>

                    </div>

                    <aside className="ironstore-sobre-apresentacao__painel">

                        <div className="ironstore-sobre-apresentacao__painel-topo">
                            <div className="ironstore-sobre-apresentacao__painel-marca">
                                <span />
                                IRONSTORE
                            </div>

                            <small>VENDA ONLINE</small>
                        </div>

                        <div className="ironstore-sobre-apresentacao__painel-corpo">

                            <span className="ironstore-sobre-apresentacao__painel-mini">
                                UMA COMPRA NA IRONSTORE
                            </span>

                            <div className="ironstore-sobre-apresentacao__fluxo">

                                <div className="ironstore-sobre-apresentacao__fluxo-item">
                                    <span>01</span>

                                    <div>
                                        <strong>Cliente acessa</strong>
                                        <small>
                                            Entra na loja virtual do comércio
                                        </small>
                                    </div>
                                </div>

                                <div className="ironstore-sobre-apresentacao__linha" />

                                <div className="ironstore-sobre-apresentacao__fluxo-item">
                                    <span>02</span>

                                    <div>
                                        <strong>Escolhe os produtos</strong>
                                        <small>
                                            Navega pela loja e monta sua compra
                                        </small>
                                    </div>
                                </div>

                                <div className="ironstore-sobre-apresentacao__linha" />

                                <div className="ironstore-sobre-apresentacao__fluxo-item">
                                    <span>03</span>

                                    <div>
                                        <strong>Realiza o pedido</strong>
                                        <small>
                                            A compra entra na operação da loja
                                        </small>
                                    </div>
                                </div>

                                <div className="ironstore-sobre-apresentacao__linha" />

                                <div className="ironstore-sobre-apresentacao__fluxo-item ironstore-sobre-apresentacao__fluxo-item--ativo">
                                    <span>04</span>

                                    <div>
                                        <strong>Pedido é preparado</strong>
                                        <small>
                                            O comércio acompanha o processo
                                            até a entrega
                                        </small>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </aside>

                </div>
            </section>

            <style>{`
                .ironstore-sobre-apresentacao {
                    width: 100%;
                    padding: 115px 24px 105px;
                    box-sizing: border-box;
                    overflow: hidden;
                    background:
                        radial-gradient(
                            circle at 82% 18%,
                            rgba(124, 58, 237, 0.17),
                            transparent 34%
                        ),
                        radial-gradient(
                            circle at 8% 88%,
                            rgba(168, 85, 247, 0.08),
                            transparent 30%
                        ),
                        #0b0714;
                    color: #ffffff;
                }

                .ironstore-sobre-apresentacao__container {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
                    gap: 70px;
                    align-items: center;
                }

                .ironstore-sobre-apresentacao__conteudo {
                    min-width: 0;
                }

                .ironstore-sobre-apresentacao__categoria {
                    display: inline-flex;
                    align-items: center;
                    min-height: 34px;
                    padding: 0 14px;
                    border: 1px solid rgba(192, 132, 252, 0.25);
                    border-radius: 100px;
                    background: rgba(126, 34, 206, 0.09);
                    color: #c084fc;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.8px;
                }

                .ironstore-sobre-apresentacao__titulo {
                    max-width: 820px;
                    margin: 25px 0 0;
                    color: #ffffff;
                    font-size: clamp(42px, 5.4vw, 70px);
                    font-weight: 800;
                    line-height: 1.03;
                    letter-spacing: -3px;
                }

                .ironstore-sobre-apresentacao__descricao {
                    max-width: 760px;
                    margin: 30px 0 0;
                    color: #ded4e9;
                    font-size: 20px;
                    line-height: 1.7;
                }

                .ironstore-sobre-apresentacao__descricao-secundaria {
                    max-width: 760px;
                    margin: 16px 0 0;
                    color: #9c8daa;
                    font-size: 16px;
                    line-height: 1.8;
                }

                .ironstore-sobre-apresentacao__resumo {
                    margin-top: 42px;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 12px;
                }

                .ironstore-sobre-apresentacao__resumo-item {
                    padding: 19px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.035);
                }

                .ironstore-sobre-apresentacao__resumo-item strong {
                    display: block;
                    color: #ffffff;
                    font-size: 14px;
                }

                .ironstore-sobre-apresentacao__resumo-item span {
                    display: block;
                    margin-top: 7px;
                    color: #8f819d;
                    font-size: 12px;
                    line-height: 1.55;
                }

                .ironstore-sobre-apresentacao__painel {
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 26px;
                    background: rgba(255, 255, 255, 0.045);
                    box-shadow: 0 35px 90px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(16px);
                }

                .ironstore-sobre-apresentacao__painel-topo {
                    min-height: 60px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                }

                .ironstore-sobre-apresentacao__painel-marca {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    color: #d7c8e5;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.4px;
                }

                .ironstore-sobre-apresentacao__painel-marca span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #c084fc;
                    box-shadow: 0 0 18px rgba(192, 132, 252, 0.8);
                }

                .ironstore-sobre-apresentacao__painel-topo small {
                    color: #695c77;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 1.2px;
                }

                .ironstore-sobre-apresentacao__painel-corpo {
                    padding: 36px;
                }

                .ironstore-sobre-apresentacao__painel-mini {
                    color: #c084fc;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .ironstore-sobre-apresentacao__fluxo {
                    margin-top: 28px;
                }

                .ironstore-sobre-apresentacao__fluxo-item {
                    padding: 17px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.025);
                }

                .ironstore-sobre-apresentacao__fluxo-item > span {
                    width: 35px;
                    height: 35px;
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: rgba(192, 132, 252, 0.08);
                    color: #d8b4fe;
                    font-size: 11px;
                    font-weight: 900;
                }

                .ironstore-sobre-apresentacao__fluxo-item strong {
                    display: block;
                    color: #eee8f4;
                    font-size: 14px;
                }

                .ironstore-sobre-apresentacao__fluxo-item small {
                    display: block;
                    margin-top: 4px;
                    color: #776b83;
                    font-size: 11px;
                    line-height: 1.4;
                }

                .ironstore-sobre-apresentacao__fluxo-item--ativo {
                    border-color: rgba(192, 132, 252, 0.24);
                    background: rgba(126, 34, 206, 0.08);
                }

                .ironstore-sobre-apresentacao__linha {
                    width: 1px;
                    height: 18px;
                    margin-left: 35px;
                    background: rgba(192, 132, 252, 0.25);
                }

                @media (max-width: 950px) {
                    .ironstore-sobre-apresentacao__container {
                        grid-template-columns: 1fr;
                        gap: 45px;
                    }

                    .ironstore-sobre-apresentacao__painel {
                        max-width: 650px;
                    }
                }

                @media (max-width: 650px) {
                    .ironstore-sobre-apresentacao {
                        padding: 75px 18px 70px;
                    }

                    .ironstore-sobre-apresentacao__titulo {
                        font-size: 41px;
                        letter-spacing: -2px;
                    }

                    .ironstore-sobre-apresentacao__descricao {
                        font-size: 18px;
                    }

                    .ironstore-sobre-apresentacao__resumo {
                        grid-template-columns: 1fr;
                    }

                    .ironstore-sobre-apresentacao__painel-corpo {
                        padding: 26px;
                    }
                }
            `}</style>
        </>
    );
}