import React from "react";

export default function ProdutividadeBeneficios() {
    return (
        <>
            <section className="produtividade-beneficios-operacao">
                <div className="produtividade-beneficios-operacao__container">

                    <header className="produtividade-beneficios-operacao__cabecalho">

                        <span className="produtividade-beneficios-operacao__mini">
                            POR QUE SEPARAR A OPERAÇÃO
                        </span>

                        <h2 className="produtividade-beneficios-operacao__titulo">
                            Quem está atendendo precisa de uma área feita
                            para atender e vender
                        </h2>

                        <p className="produtividade-beneficios-operacao__descricao">
                            Durante uma venda, o objetivo é executar a operação.
                            Informações administrativas e ferramentas de gestão
                            possuem outra finalidade. Por isso a Produtividade
                            funciona como uma área operacional própria.
                        </p>

                    </header>

                    <div className="produtividade-beneficios-operacao__grade">

                        <article className="produtividade-beneficios-operacao__card">

                            <span>01</span>

                            <h3>
                                Menos funções administrativas durante o atendimento
                            </h3>

                            <p>
                                O operador não precisa trabalhar dentro de uma
                                área criada para administrar toda a empresa.
                                A interface operacional pode permanecer focada
                                nas atividades relacionadas ao atendimento.
                            </p>

                        </article>

                        <article className="produtividade-beneficios-operacao__card">

                            <span>02</span>

                            <h3>
                                A venda já nasce registrada no sistema
                            </h3>

                            <p>
                                Quando a operação é concluída dentro da
                                Iron Executions, aquela venda passa a fazer
                                parte das informações do comércio e pode ser
                                utilizada pelas áreas relacionadas.
                            </p>

                        </article>

                        <article className="produtividade-beneficios-operacao__card">

                            <span>03</span>

                            <h3>
                                Operação e gestão podem trabalhar juntas
                            </h3>

                            <p>
                                Separar as áreas não significa separar os dados.
                                A operação registra o que acontece no comércio
                                e a gestão pode trabalhar posteriormente com
                                essas informações.
                            </p>

                        </article>

                    </div>

                    <div className="produtividade-beneficios-operacao__resultado">

                        <div className="produtividade-beneficios-operacao__resultado-conteudo">

                            <span>
                                NA PRÁTICA
                            </span>

                            <h3>
                                Uma venda realizada no caixa não precisa ser
                                registrada novamente para existir na gestão
                            </h3>

                            <p>
                                A proposta é criar continuidade entre aquilo
                                que acontece durante o atendimento e aquilo
                                que posteriormente precisa ser acompanhado
                                pelo responsável pelo comércio.
                            </p>

                        </div>

                        <div className="produtividade-beneficios-operacao__resultado-fluxo">

                            <div>
                                <small>PASSO 01</small>
                                <strong>Cliente é atendido</strong>
                            </div>

                            <span>↓</span>

                            <div>
                                <small>PASSO 02</small>
                                <strong>Venda é realizada</strong>
                            </div>

                            <span>↓</span>

                            <div>
                                <small>PASSO 03</small>
                                <strong>Operação é registrada</strong>
                            </div>

                            <span>↓</span>

                            <div className="produtividade-beneficios-operacao__resultado-fluxo-final">
                                <small>RESULTADO</small>
                                <strong>Informação disponível no sistema</strong>
                            </div>

                        </div>

                    </div>

                    <div className="produtividade-beneficios-operacao__frase">

                        <span className="produtividade-beneficios-operacao__frase-marca" />

                        <div>
                            <small>
                                PRODUTIVIDADE
                            </small>

                            <strong>
                                Feita para transformar a rotina do atendimento
                                em informações organizadas dentro da
                                Iron Executions.
                            </strong>
                        </div>

                    </div>

                </div>
            </section>

            <style>{`
                .produtividade-beneficios-operacao {
                    width: 100%;
                    padding: 110px 24px;
                    box-sizing: border-box;
                    background: #ffffff;
                }

                .produtividade-beneficios-operacao__container {
                    width: 100%;
                    max-width: 1160px;
                    margin: 0 auto;
                }

                .produtividade-beneficios-operacao__cabecalho {
                    max-width: 860px;
                    margin: 0 auto;
                    text-align: center;
                }

                .produtividade-beneficios-operacao__mini {
                    color: #059669;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .produtividade-beneficios-operacao__titulo {
                    margin: 18px 0 0;
                    color: #102019;
                    font-size: clamp(36px, 4.5vw, 56px);
                    line-height: 1.08;
                    letter-spacing: -2.2px;
                }

                .produtividade-beneficios-operacao__descricao {
                    max-width: 750px;
                    margin: 24px auto 0;
                    color: #66766e;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .produtividade-beneficios-operacao__grade {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                }

                .produtividade-beneficios-operacao__card {
                    min-height: 290px;
                    padding: 34px;
                    box-sizing: border-box;
                    border: 1px solid #dfe9e4;
                    border-radius: 22px;
                    background: #f9fbfa;
                }

                .produtividade-beneficios-operacao__card > span {
                    display: block;
                    color: #059669;
                    font-size: 11px;
                    font-weight: 900;
                }

                .produtividade-beneficios-operacao__card h3 {
                    margin: 30px 0 0;
                    color: #102019;
                    font-size: 22px;
                    line-height: 1.35;
                }

                .produtividade-beneficios-operacao__card p {
                    margin: 14px 0 0;
                    color: #697a71;
                    font-size: 14px;
                    line-height: 1.75;
                }

                .produtividade-beneficios-operacao__resultado {
                    margin-top: 28px;
                    padding: 45px;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 350px;
                    gap: 60px;
                    align-items: center;
                    border-radius: 25px;
                    background:
                        radial-gradient(
                            circle at 90% 15%,
                            rgba(52, 211, 153, 0.12),
                            transparent 35%
                        ),
                        #07130f;
                }

                .produtividade-beneficios-operacao__resultado-conteudo > span {
                    color: #34d399;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .produtividade-beneficios-operacao__resultado-conteudo h3 {
                    max-width: 650px;
                    margin: 14px 0 0;
                    color: #ffffff;
                    font-size: 30px;
                    line-height: 1.3;
                }

                .produtividade-beneficios-operacao__resultado-conteudo p {
                    max-width: 650px;
                    margin: 16px 0 0;
                    color: #8da399;
                    font-size: 15px;
                    line-height: 1.8;
                }

                .produtividade-beneficios-operacao__resultado-fluxo {
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                }

                .produtividade-beneficios-operacao__resultado-fluxo > div {
                    padding: 14px 17px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.035);
                }

                .produtividade-beneficios-operacao__resultado-fluxo small {
                    display: block;
                    color: #5e776b;
                    font-size: 8px;
                    font-weight: 900;
                    letter-spacing: 1.3px;
                }

                .produtividade-beneficios-operacao__resultado-fluxo strong {
                    display: block;
                    margin-top: 4px;
                    color: #e8f3ed;
                    font-size: 12px;
                }

                .produtividade-beneficios-operacao__resultado-fluxo > span {
                    height: 19px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #34d399;
                    font-size: 11px;
                }

                .produtividade-beneficios-operacao__resultado-fluxo-final {
                    border-color: rgba(52, 211, 153, 0.24) !important;
                    background: rgba(16, 185, 129, 0.08) !important;
                }

                .produtividade-beneficios-operacao__frase {
                    margin-top: 28px;
                    padding: 30px 35px;
                    display: grid;
                    grid-template-columns: 14px minmax(0, 1fr);
                    gap: 20px;
                    align-items: center;
                    border: 1px solid #dfe9e4;
                    border-radius: 20px;
                    background: #f8fbf9;
                }

                .produtividade-beneficios-operacao__frase-marca {
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.35);
                }

                .produtividade-beneficios-operacao__frase small {
                    display: block;
                    color: #059669;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                }

                .produtividade-beneficios-operacao__frase strong {
                    display: block;
                    max-width: 850px;
                    margin-top: 7px;
                    color: #263c32;
                    font-size: 17px;
                    line-height: 1.55;
                }

                @media (max-width: 850px) {
                    .produtividade-beneficios-operacao__grade {
                        grid-template-columns: 1fr;
                    }

                    .produtividade-beneficios-operacao__card {
                        min-height: 0;
                    }

                    .produtividade-beneficios-operacao__resultado {
                        grid-template-columns: 1fr;
                        gap: 35px;
                    }
                }

                @media (max-width: 600px) {
                    .produtividade-beneficios-operacao {
                        padding: 75px 18px;
                    }

                    .produtividade-beneficios-operacao__card,
                    .produtividade-beneficios-operacao__resultado {
                        padding: 27px;
                    }

                    .produtividade-beneficios-operacao__frase {
                        padding: 25px;
                    }
                }
            `}</style>
        </>
    );
}