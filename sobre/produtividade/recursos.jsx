import React from "react";

export default function ProdutividadeRecursos() {
    return (
        <>
            <section className="produtividade-recursos-caixa">
                <div className="produtividade-recursos-caixa__container">

                    <header className="produtividade-recursos-caixa__cabecalho">

                        <span className="produtividade-recursos-caixa__mini">
                            FEITO PARA A ROTINA
                        </span>

                        <h2 className="produtividade-recursos-caixa__titulo">
                            No momento da venda, o foco precisa estar no atendimento
                        </h2>

                        <p className="produtividade-recursos-caixa__descricao">
                            A Produtividade concentra a parte operacional para
                            que o usuário possa trabalhar com as vendas sem
                            precisar navegar pelas áreas administrativas do
                            sistema durante cada atendimento.
                        </p>

                    </header>

                    <div className="produtividade-recursos-caixa__processo">

                        <article className="produtividade-recursos-caixa__etapa">
                            <span className="produtividade-recursos-caixa__numero">
                                01
                            </span>

                            <small>ATENDIMENTO</small>

                            <h3>O cliente chega ao caixa</h3>

                            <p>
                                A operação começa no atendimento. O operador
                                utiliza uma área voltada para executar a venda,
                                sem precisar entrar na parte de gestão do comércio.
                            </p>
                        </article>

                        <article className="produtividade-recursos-caixa__etapa">
                            <span className="produtividade-recursos-caixa__numero">
                                02
                            </span>

                            <small>PRODUTOS</small>

                            <h3>A venda é montada</h3>

                            <p>
                                Os produtos que fazem parte da compra são
                                incluídos na operação para formar a venda que
                                está sendo realizada naquele atendimento.
                            </p>
                        </article>

                        <article className="produtividade-recursos-caixa__etapa">
                            <span className="produtividade-recursos-caixa__numero">
                                03
                            </span>

                            <small>VENDA</small>

                            <h3>A operação é registrada</h3>

                            <p>
                                Ao concluir o atendimento, a venda deixa de ser
                                apenas uma ação realizada no caixa e passa a
                                fazer parte das informações registradas pelo
                                comércio.
                            </p>
                        </article>

                    </div>

                    <div className="produtividade-recursos-caixa__divisao">

                        <div className="produtividade-recursos-caixa__divisao-texto">

                            <span>
                                UMA FUNÇÃO BEM DEFINIDA
                            </span>

                            <h3>
                                Produtividade cuida da operação.
                                Administração cuida da gestão.
                            </h3>

                            <p>
                                Essa separação evita colocar funções
                                administrativas no meio do atendimento.
                                O operador utiliza a área operacional e as
                                informações registradas podem continuar sendo
                                utilizadas pelas outras áreas da Iron Executions.
                            </p>

                        </div>

                        <div className="produtividade-recursos-caixa__divisao-fluxo">

                            <div>
                                <span>01</span>

                                <div>
                                    <strong>Operação</strong>
                                    <small>Atendimento e venda</small>
                                </div>
                            </div>

                            <i />

                            <div>
                                <span>02</span>

                                <div>
                                    <strong>Registro</strong>
                                    <small>Venda no sistema</small>
                                </div>
                            </div>

                            <i />

                            <div>
                                <span>03</span>

                                <div>
                                    <strong>Gestão</strong>
                                    <small>Informação disponível</small>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </section>

            <style>{`
                .produtividade-recursos-caixa {
                    width: 100%;
                    padding: 105px 24px;
                    box-sizing: border-box;
                    background: #f8fbf9;
                }

                .produtividade-recursos-caixa__container {
                    width: 100%;
                    max-width: 1220px;
                    margin: 0 auto;
                }

                .produtividade-recursos-caixa__cabecalho {
                    max-width: 850px;
                }

                .produtividade-recursos-caixa__mini {
                    color: #059669;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .produtividade-recursos-caixa__titulo {
                    margin: 18px 0 0;
                    color: #102019;
                    font-size: clamp(35px, 4.5vw, 55px);
                    line-height: 1.08;
                    letter-spacing: -2px;
                }

                .produtividade-recursos-caixa__descricao {
                    max-width: 760px;
                    margin: 23px 0 0;
                    color: #64756d;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .produtividade-recursos-caixa__processo {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                }

                .produtividade-recursos-caixa__etapa {
                    min-height: 300px;
                    padding: 34px;
                    box-sizing: border-box;
                    border: 1px solid #dfe9e4;
                    border-radius: 22px;
                    background: #ffffff;
                }

                .produtividade-recursos-caixa__numero {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: #ecfdf5;
                    color: #059669;
                    font-size: 11px;
                    font-weight: 900;
                }

                .produtividade-recursos-caixa__etapa small {
                    display: block;
                    margin-top: 30px;
                    color: #059669;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 1.6px;
                }

                .produtividade-recursos-caixa__etapa h3 {
                    margin: 10px 0 0;
                    color: #102019;
                    font-size: 22px;
                    line-height: 1.3;
                }

                .produtividade-recursos-caixa__etapa p {
                    margin: 14px 0 0;
                    color: #687970;
                    font-size: 14px;
                    line-height: 1.75;
                }

                .produtividade-recursos-caixa__divisao {
                    margin-top: 28px;
                    padding: 42px;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(330px, 0.75fr);
                    gap: 60px;
                    align-items: center;
                    border-radius: 24px;
                    background:
                        radial-gradient(
                            circle at 90% 10%,
                            rgba(52, 211, 153, 0.11),
                            transparent 35%
                        ),
                        #07130f;
                }

                .produtividade-recursos-caixa__divisao-texto > span {
                    color: #34d399;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .produtividade-recursos-caixa__divisao-texto h3 {
                    max-width: 620px;
                    margin: 14px 0 0;
                    color: #ffffff;
                    font-size: 30px;
                    line-height: 1.3;
                }

                .produtividade-recursos-caixa__divisao-texto p {
                    max-width: 650px;
                    margin: 15px 0 0;
                    color: #8ca398;
                    font-size: 15px;
                    line-height: 1.8;
                }

                .produtividade-recursos-caixa__divisao-fluxo {
                    display: grid;
                }

                .produtividade-recursos-caixa__divisao-fluxo > div {
                    padding: 15px 17px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 13px;
                    background: rgba(255, 255, 255, 0.035);
                }

                .produtividade-recursos-caixa__divisao-fluxo > div > span {
                    color: #34d399;
                    font-size: 10px;
                    font-weight: 900;
                }

                .produtividade-recursos-caixa__divisao-fluxo strong {
                    display: block;
                    color: #edf7f2;
                    font-size: 13px;
                }

                .produtividade-recursos-caixa__divisao-fluxo small {
                    display: block;
                    margin-top: 3px;
                    color: #72877d;
                    font-size: 10px;
                }

                .produtividade-recursos-caixa__divisao-fluxo > i {
                    width: 1px;
                    height: 16px;
                    margin-left: 24px;
                    background: rgba(52, 211, 153, 0.25);
                }

                @media (max-width: 850px) {
                    .produtividade-recursos-caixa__processo {
                        grid-template-columns: 1fr;
                    }

                    .produtividade-recursos-caixa__etapa {
                        min-height: 0;
                    }

                    .produtividade-recursos-caixa__divisao {
                        grid-template-columns: 1fr;
                        gap: 35px;
                    }
                }

                @media (max-width: 600px) {
                    .produtividade-recursos-caixa {
                        padding: 75px 18px;
                    }

                    .produtividade-recursos-caixa__etapa,
                    .produtividade-recursos-caixa__divisao {
                        padding: 27px;
                    }
                }
            `}</style>
        </>
    );
}