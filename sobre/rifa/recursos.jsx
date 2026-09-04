import React from "react";

export default function RifaRecursos() {
    return (
        <>
            <section className="rifa-recursos-gestao">
                <div className="rifa-recursos-gestao__container">

                    <header className="rifa-recursos-gestao__cabecalho">

                        <span className="rifa-recursos-gestao__mini">
                            CONTROLE DA RIFA
                        </span>

                        <h2 className="rifa-recursos-gestao__titulo">
                            Quanto mais a rifa cresce, mais importante é saber
                            exatamente o que está acontecendo
                        </h2>

                        <p className="rifa-recursos-gestao__descricao">
                            Uma rifa envolve mais do que disponibilizar números.
                            É necessário acompanhar quem está participando,
                            quais números foram vendidos, os pagamentos
                            relacionados e posteriormente realizar o sorteio.
                        </p>

                    </header>

                    <div className="rifa-recursos-gestao__grade">

                        <article className="rifa-recursos-gestao__card">
                            <span className="rifa-recursos-gestao__numero">01</span>
                            <small>CRIAÇÃO</small>

                            <h3>Crie e organize a rifa</h3>

                            <p>
                                O processo começa com a criação da rifa.
                                A partir daí, ela passa a ter uma área própria
                                para que as informações relacionadas à sua
                                realização possam ser acompanhadas.
                            </p>
                        </article>

                        <article className="rifa-recursos-gestao__card">
                            <span className="rifa-recursos-gestao__numero">02</span>
                            <small>NÚMEROS</small>

                            <h3>Acompanhe os números vendidos</h3>

                            <p>
                                Conforme os números são vendidos, o controle
                                permite acompanhar a movimentação da rifa
                                sem depender de anotações separadas para
                                entender quais números já participaram.
                            </p>
                        </article>

                        <article className="rifa-recursos-gestao__card">
                            <span className="rifa-recursos-gestao__numero">03</span>
                            <small>PARTICIPANTES</small>

                            <h3>Saiba quem está participando</h3>

                            <p>
                                Os participantes fazem parte da organização
                                da rifa. O módulo permite manter essas
                                informações relacionadas ao processo de
                                venda dos números.
                            </p>
                        </article>

                        <article className="rifa-recursos-gestao__card">
                            <span className="rifa-recursos-gestao__numero">04</span>
                            <small>PAGAMENTOS</small>

                            <h3>Controle os pagamentos</h3>

                            <p>
                                Além de saber que um número foi escolhido,
                                é necessário acompanhar os pagamentos
                                relacionados à participação e à arrecadação
                                da rifa.
                            </p>
                        </article>

                        <article className="rifa-recursos-gestao__card">
                            <span className="rifa-recursos-gestao__numero">05</span>
                            <small>ACOMPANHAMENTO</small>

                            <h3>Centralize as informações</h3>

                            <p>
                                Números, participantes e pagamentos ficam
                                relacionados à mesma rifa, facilitando o
                                acompanhamento durante sua realização.
                            </p>
                        </article>

                        <article className="rifa-recursos-gestao__card">
                            <span className="rifa-recursos-gestao__numero">06</span>
                            <small>SORTEIO</small>

                            <h3>Finalize com o sorteio</h3>

                            <p>
                                Depois do período de participação, a rifa
                                chega ao sorteio. Essa etapa faz parte do
                                próprio fluxo de gerenciamento do módulo.
                            </p>
                        </article>

                    </div>

                    <div className="rifa-recursos-gestao__fluxo">

                        <span className="rifa-recursos-gestao__fluxo-mini">
                            DO INÍCIO AO SORTEIO
                        </span>

                        <div className="rifa-recursos-gestao__fluxo-lista">

                            <strong>Criação</strong>
                            <span>→</span>

                            <strong>Números</strong>
                            <span>→</span>

                            <strong>Participantes</strong>
                            <span>→</span>

                            <strong>Pagamentos</strong>
                            <span>→</span>

                            <strong>Sorteio</strong>

                        </div>

                    </div>

                </div>
            </section>

            <style>{`
                .rifa-recursos-gestao {
                    width: 100%;
                    padding: 105px 24px;
                    box-sizing: border-box;
                    background: #fdfbf7;
                }

                .rifa-recursos-gestao__container {
                    width: 100%;
                    max-width: 1220px;
                    margin: 0 auto;
                }

                .rifa-recursos-gestao__cabecalho {
                    max-width: 870px;
                }

                .rifa-recursos-gestao__mini {
                    color: #d97706;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .rifa-recursos-gestao__titulo {
                    margin: 18px 0 0;
                    color: #211a0d;
                    font-size: clamp(35px, 4.5vw, 55px);
                    line-height: 1.08;
                    letter-spacing: -2px;
                }

                .rifa-recursos-gestao__descricao {
                    max-width: 780px;
                    margin: 23px 0 0;
                    color: #746c5e;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .rifa-recursos-gestao__grade {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                }

                .rifa-recursos-gestao__card {
                    min-height: 300px;
                    padding: 32px;
                    box-sizing: border-box;
                    border: 1px solid #ebe5d9;
                    border-radius: 21px;
                    background: #ffffff;
                    transition:
                        transform 0.25s ease,
                        border-color 0.25s ease;
                }

                .rifa-recursos-gestao__card:hover {
                    transform: translateY(-4px);
                    border-color: #fcd34d;
                }

                .rifa-recursos-gestao__numero {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: #fffbeb;
                    color: #d97706;
                    font-size: 11px;
                    font-weight: 900;
                }

                .rifa-recursos-gestao__card small {
                    display: block;
                    margin-top: 28px;
                    color: #d97706;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 1.6px;
                }

                .rifa-recursos-gestao__card h3 {
                    margin: 10px 0 0;
                    color: #211a0d;
                    font-size: 21px;
                    line-height: 1.3;
                }

                .rifa-recursos-gestao__card p {
                    margin: 13px 0 0;
                    color: #746c5e;
                    font-size: 14px;
                    line-height: 1.75;
                }

                .rifa-recursos-gestao__fluxo {
                    margin-top: 28px;
                    padding: 34px;
                    border-radius: 21px;
                    background:
                        radial-gradient(circle at 90% 10%, rgba(245, 158, 11, 0.1), transparent 35%),
                        #151006;
                }

                .rifa-recursos-gestao__fluxo-mini {
                    display: block;
                    margin-bottom: 23px;
                    color: #fbbf24;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .rifa-recursos-gestao__fluxo-lista {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    overflow-x: auto;
                }

                .rifa-recursos-gestao__fluxo-lista strong {
                    flex: 0 0 auto;
                    color: #ffffff;
                    font-size: 14px;
                }

                .rifa-recursos-gestao__fluxo-lista span {
                    flex: 0 0 auto;
                    color: #b78625;
                }

                @media (max-width: 900px) {
                    .rifa-recursos-gestao__grade {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 600px) {
                    .rifa-recursos-gestao {
                        padding: 75px 18px;
                    }

                    .rifa-recursos-gestao__grade {
                        grid-template-columns: 1fr;
                    }

                    .rifa-recursos-gestao__card {
                        min-height: 0;
                        padding: 27px;
                    }

                    .rifa-recursos-gestao__fluxo {
                        padding: 27px;
                    }
                }
            `}</style>
        </>
    );
}