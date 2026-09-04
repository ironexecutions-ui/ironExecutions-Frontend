import React from "react";

export default function ProdutividadeExplicacao() {
    return (
        <>
            <section className="produtividade-explicacao-operacional">
                <div className="produtividade-explicacao-operacional__container">

                    <div className="produtividade-explicacao-operacional__conteudo">

                        <span className="produtividade-explicacao-operacional__categoria">
                            MÓDULO PRODUTIVIDADE
                        </span>

                        <h1 className="produtividade-explicacao-operacional__titulo">
                            A área feita para a operação diária do seu comércio
                        </h1>

                        <p className="produtividade-explicacao-operacional__descricao">
                            O módulo de Produtividade é a área operacional da
                            Iron Executions. É onde o comércio realiza atividades
                            do dia a dia, principalmente o atendimento no caixa
                            e o registro das vendas.
                        </p>

                        <p className="produtividade-explicacao-operacional__descricao-secundaria">
                            Enquanto outras áreas do sistema são voltadas para
                            administração e acompanhamento do negócio, a
                            Produtividade foi criada para quem está trabalhando
                            diretamente na operação e precisa registrar uma venda
                            de maneira rápida e organizada.
                        </p>

                        <div className="produtividade-explicacao-operacional__pontos">

                            <article className="produtividade-explicacao-operacional__ponto">
                                <span>01</span>

                                <div>
                                    <strong>Atendimento</strong>
                                    <p>
                                        Uma área preparada para ser utilizada
                                        durante a rotina do comércio.
                                    </p>
                                </div>
                            </article>

                            <article className="produtividade-explicacao-operacional__ponto">
                                <span>02</span>

                                <div>
                                    <strong>Vendas</strong>
                                    <p>
                                        Registre as operações realizadas pelo
                                        estabelecimento.
                                    </p>
                                </div>
                            </article>

                            <article className="produtividade-explicacao-operacional__ponto">
                                <span>03</span>

                                <div>
                                    <strong>Operação</strong>
                                    <p>
                                        O funcionário trabalha em uma área
                                        focada no que precisa fazer no momento.
                                    </p>
                                </div>
                            </article>

                        </div>

                    </div>

                    <aside className="produtividade-explicacao-operacional__painel">

                        <div className="produtividade-explicacao-operacional__painel-topo">

                            <div className="produtividade-explicacao-operacional__painel-identidade">
                                <i />
                                PRODUTIVIDADE
                            </div>

                            <span>OPERAÇÃO</span>

                        </div>

                        <div className="produtividade-explicacao-operacional__painel-corpo">

                            <span className="produtividade-explicacao-operacional__painel-mini">
                                FLUXO DE ATENDIMENTO
                            </span>

                            <div className="produtividade-explicacao-operacional__fluxo">

                                <div className="produtividade-explicacao-operacional__fluxo-item">
                                    <span>01</span>

                                    <div>
                                        <strong>Início do atendimento</strong>
                                        <small>
                                            Operador inicia a operação
                                        </small>
                                    </div>
                                </div>

                                <div className="produtividade-explicacao-operacional__linha" />

                                <div className="produtividade-explicacao-operacional__fluxo-item">
                                    <span>02</span>

                                    <div>
                                        <strong>Produtos da venda</strong>
                                        <small>
                                            Itens são incluídos na operação
                                        </small>
                                    </div>
                                </div>

                                <div className="produtividade-explicacao-operacional__linha" />

                                <div className="produtividade-explicacao-operacional__fluxo-item produtividade-explicacao-operacional__fluxo-item--ativo">
                                    <span>03</span>

                                    <div>
                                        <strong>Venda registrada</strong>
                                        <small>
                                            A operação passa a fazer parte
                                            do sistema
                                        </small>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </aside>

                </div>
            </section>

            <style>{`
                .produtividade-explicacao-operacional {
                    width: 100%;
                    padding: 115px 24px 105px;
                    box-sizing: border-box;
                    overflow: hidden;
                    background:
                        radial-gradient(
                            circle at 82% 18%,
                            rgba(16, 185, 129, 0.15),
                            transparent 33%
                        ),
                        radial-gradient(
                            circle at 8% 90%,
                            rgba(34, 197, 94, 0.07),
                            transparent 30%
                        ),
                        #07130f;
                    color: #ffffff;
                }

                .produtividade-explicacao-operacional__container {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
                    gap: 70px;
                    align-items: center;
                }

                .produtividade-explicacao-operacional__conteudo {
                    min-width: 0;
                }

                .produtividade-explicacao-operacional__categoria {
                    display: inline-flex;
                    align-items: center;
                    min-height: 34px;
                    padding: 0 14px;
                    border: 1px solid rgba(52, 211, 153, 0.23);
                    border-radius: 100px;
                    background: rgba(16, 185, 129, 0.07);
                    color: #6ee7b7;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.8px;
                }

                .produtividade-explicacao-operacional__titulo {
                    max-width: 820px;
                    margin: 25px 0 0;
                    color: #ffffff;
                    font-size: clamp(42px, 5.4vw, 70px);
                    font-weight: 800;
                    line-height: 1.03;
                    letter-spacing: -3px;
                }

                .produtividade-explicacao-operacional__descricao {
                    max-width: 760px;
                    margin: 30px 0 0;
                    color: #d4e4dc;
                    font-size: 20px;
                    line-height: 1.7;
                }

                .produtividade-explicacao-operacional__descricao-secundaria {
                    max-width: 760px;
                    margin: 16px 0 0;
                    color: #8ca398;
                    font-size: 16px;
                    line-height: 1.8;
                }

                .produtividade-explicacao-operacional__pontos {
                    margin-top: 42px;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 12px;
                }

                .produtividade-explicacao-operacional__ponto {
                    padding: 19px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.035);
                }

                .produtividade-explicacao-operacional__ponto > span {
                    display: block;
                    margin-bottom: 15px;
                    color: #34d399;
                    font-size: 10px;
                    font-weight: 900;
                }

                .produtividade-explicacao-operacional__ponto strong {
                    display: block;
                    color: #ffffff;
                    font-size: 15px;
                }

                .produtividade-explicacao-operacional__ponto p {
                    margin: 7px 0 0;
                    color: #80978c;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .produtividade-explicacao-operacional__painel {
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 26px;
                    background: rgba(255, 255, 255, 0.045);
                    box-shadow: 0 35px 90px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(16px);
                }

                .produtividade-explicacao-operacional__painel-topo {
                    min-height: 60px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                }

                .produtividade-explicacao-operacional__painel-identidade {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    color: #c8ddd2;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.3px;
                }

                .produtividade-explicacao-operacional__painel-identidade i {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #34d399;
                    box-shadow: 0 0 18px rgba(52, 211, 153, 0.8);
                }

                .produtividade-explicacao-operacional__painel-topo > span {
                    color: #657a70;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 1.4px;
                }

                .produtividade-explicacao-operacional__painel-corpo {
                    padding: 36px;
                }

                .produtividade-explicacao-operacional__painel-mini {
                    color: #34d399;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .produtividade-explicacao-operacional__fluxo {
                    margin-top: 28px;
                }

                .produtividade-explicacao-operacional__fluxo-item {
                    padding: 18px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.025);
                }

                .produtividade-explicacao-operacional__fluxo-item > span {
                    width: 35px;
                    height: 35px;
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: rgba(52, 211, 153, 0.08);
                    color: #6ee7b7;
                    font-size: 11px;
                    font-weight: 900;
                }

                .produtividade-explicacao-operacional__fluxo-item strong {
                    display: block;
                    color: #e9f3ee;
                    font-size: 14px;
                }

                .produtividade-explicacao-operacional__fluxo-item small {
                    display: block;
                    margin-top: 4px;
                    color: #73887d;
                    font-size: 11px;
                }

                .produtividade-explicacao-operacional__fluxo-item--ativo {
                    border-color: rgba(52, 211, 153, 0.23);
                    background: rgba(16, 185, 129, 0.07);
                }

                .produtividade-explicacao-operacional__linha {
                    width: 1px;
                    height: 19px;
                    margin-left: 35px;
                    background: rgba(52, 211, 153, 0.26);
                }

                @media (max-width: 950px) {
                    .produtividade-explicacao-operacional__container {
                        grid-template-columns: 1fr;
                        gap: 45px;
                    }

                    .produtividade-explicacao-operacional__painel {
                        max-width: 650px;
                    }
                }

                @media (max-width: 650px) {
                    .produtividade-explicacao-operacional {
                        padding: 75px 18px 70px;
                    }

                    .produtividade-explicacao-operacional__titulo {
                        font-size: 41px;
                        letter-spacing: -2px;
                    }

                    .produtividade-explicacao-operacional__descricao {
                        font-size: 18px;
                    }

                    .produtividade-explicacao-operacional__pontos {
                        grid-template-columns: 1fr;
                    }

                    .produtividade-explicacao-operacional__painel-corpo {
                        padding: 26px;
                    }
                }
            `}</style>
        </>
    );
}