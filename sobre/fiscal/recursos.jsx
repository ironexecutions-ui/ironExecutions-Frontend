import React from "react";

export default function FiscalRecursos() {
    return (
        <>
            <section className="fiscal-recursos-iron">
                <div className="fiscal-recursos-iron__container">

                    <header className="fiscal-recursos-iron__cabecalho">

                        <span className="fiscal-recursos-iron__mini">
                            COMO O MÓDULO PARTICIPA DA VENDA
                        </span>

                        <h2 className="fiscal-recursos-iron__titulo">
                            A nota fiscal faz parte de uma operação que já
                            aconteceu no comércio
                        </h2>

                        <p className="fiscal-recursos-iron__descricao">
                            Quando uma venda é realizada, diversas informações
                            daquela operação já existem dentro do sistema.
                            O módulo Fiscal utiliza esse contexto para auxiliar
                            na emissão e manter o controle das notas fiscais
                            relacionadas às vendas.
                        </p>

                    </header>

                    <div className="fiscal-recursos-iron__processo">

                        <article className="fiscal-recursos-iron__etapa">

                            <div className="fiscal-recursos-iron__etapa-topo">
                                <span>01</span>
                                <small>OPERAÇÃO</small>
                            </div>

                            <h3>Primeiro existe uma venda</h3>

                            <p>
                                O processo fiscal está relacionado a uma
                                operação comercial. A venda realizada pelo
                                estabelecimento contém informações que fazem
                                parte do processo posterior de emissão fiscal.
                            </p>

                        </article>

                        <div className="fiscal-recursos-iron__seta">
                            <span>›</span>
                        </div>

                        <article className="fiscal-recursos-iron__etapa">

                            <div className="fiscal-recursos-iron__etapa-topo">
                                <span>02</span>
                                <small>FISCAL</small>
                            </div>

                            <h3>O módulo Fiscal recebe esse contexto</h3>

                            <p>
                                Em vez de começar um processo totalmente
                                desconectado da operação, a área Fiscal trabalha
                                com as informações relacionadas à venda
                                registrada no sistema.
                            </p>

                        </article>

                        <div className="fiscal-recursos-iron__seta">
                            <span>›</span>
                        </div>

                        <article className="fiscal-recursos-iron__etapa">

                            <div className="fiscal-recursos-iron__etapa-topo">
                                <span>03</span>
                                <small>DOCUMENTO</small>
                            </div>

                            <h3>A nota passa a fazer parte do controle</h3>

                            <p>
                                O módulo auxilia na emissão e no controle
                                das notas fiscais vinculadas às vendas,
                                mantendo essa etapa dentro da estrutura
                                da Iron Executions.
                            </p>

                        </article>

                    </div>

                    <div className="fiscal-recursos-iron__detalhes">

                        <article className="fiscal-recursos-iron__detalhe">

                            <span className="fiscal-recursos-iron__detalhe-numero">
                                01
                            </span>

                            <div>
                                <h3>Emissão de notas fiscais</h3>

                                <p>
                                    A área Fiscal concentra o processo de
                                    emissão das notas relacionadas às vendas
                                    realizadas pelo comércio, utilizando as
                                    informações necessárias da operação.
                                </p>
                            </div>

                        </article>

                        <article className="fiscal-recursos-iron__detalhe">

                            <span className="fiscal-recursos-iron__detalhe-numero">
                                02
                            </span>

                            <div>
                                <h3>Controle das notas emitidas</h3>

                                <p>
                                    Além da emissão, o módulo existe para que
                                    as informações fiscais das vendas possam
                                    ser acompanhadas dentro do próprio sistema.
                                </p>
                            </div>

                        </article>

                        <article className="fiscal-recursos-iron__detalhe">

                            <span className="fiscal-recursos-iron__detalhe-numero">
                                03
                            </span>

                            <div>
                                <h3>Relação entre venda e documento</h3>

                                <p>
                                    A parte fiscal não precisa existir como um
                                    controle isolado. A nota está relacionada
                                    à venda que deu origem àquela operação.
                                </p>
                            </div>

                        </article>

                        <article className="fiscal-recursos-iron__detalhe">

                            <span className="fiscal-recursos-iron__detalhe-numero">
                                04
                            </span>

                            <div>
                                <h3>Uma área específica para o processo fiscal</h3>

                                <p>
                                    As funções fiscais ficam separadas das
                                    atividades operacionais do caixa, mantendo
                                    cada área do sistema focada na função que
                                    precisa desempenhar.
                                </p>
                            </div>

                        </article>

                    </div>

                </div>
            </section>

            <style>{`
                .fiscal-recursos-iron {
                    width: 100%;
                    padding: 105px 24px;
                    box-sizing: border-box;
                    background: #f7f9fc;
                }

                .fiscal-recursos-iron__container {
                    width: 100%;
                    max-width: 1220px;
                    margin: 0 auto;
                }

                .fiscal-recursos-iron__cabecalho {
                    max-width: 850px;
                }

                .fiscal-recursos-iron__mini {
                    color: #0284c7;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .fiscal-recursos-iron__titulo {
                    margin: 18px 0 0;
                    color: #0f172a;
                    font-size: clamp(35px, 4.5vw, 55px);
                    line-height: 1.08;
                    letter-spacing: -2px;
                }

                .fiscal-recursos-iron__descricao {
                    max-width: 760px;
                    margin: 23px 0 0;
                    color: #64748b;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .fiscal-recursos-iron__processo {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1fr)
                        50px
                        minmax(0, 1fr)
                        50px
                        minmax(0, 1fr);
                    align-items: center;
                }

                .fiscal-recursos-iron__etapa {
                    min-height: 280px;
                    padding: 32px;
                    box-sizing: border-box;
                    border: 1px solid #dfe7ef;
                    border-radius: 22px;
                    background: #ffffff;
                }

                .fiscal-recursos-iron__etapa-topo {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                }

                .fiscal-recursos-iron__etapa-topo > span {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 11px;
                    background: #eaf7fd;
                    color: #0284c7;
                    font-size: 12px;
                    font-weight: 900;
                }

                .fiscal-recursos-iron__etapa-topo small {
                    color: #94a3b8;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                }

                .fiscal-recursos-iron__etapa h3 {
                    margin: 30px 0 0;
                    color: #142033;
                    font-size: 22px;
                    line-height: 1.3;
                }

                .fiscal-recursos-iron__etapa p {
                    margin: 14px 0 0;
                    color: #6b7b8f;
                    font-size: 14px;
                    line-height: 1.75;
                }

                .fiscal-recursos-iron__seta {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .fiscal-recursos-iron__seta span {
                    color: #38a9d6;
                    font-size: 38px;
                    font-weight: 300;
                }

                .fiscal-recursos-iron__detalhes {
                    margin-top: 30px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 16px;
                }

                .fiscal-recursos-iron__detalhe {
                    padding: 30px;
                    display: grid;
                    grid-template-columns: 45px minmax(0, 1fr);
                    gap: 18px;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    background: #ffffff;
                }

                .fiscal-recursos-iron__detalhe-numero {
                    color: #0284c7;
                    font-size: 11px;
                    font-weight: 900;
                }

                .fiscal-recursos-iron__detalhe h3 {
                    margin: 0;
                    color: #0f172a;
                    font-size: 19px;
                }

                .fiscal-recursos-iron__detalhe p {
                    margin: 10px 0 0;
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.7;
                }

                @media (max-width: 950px) {
                    .fiscal-recursos-iron__processo {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }

                    .fiscal-recursos-iron__etapa {
                        min-height: 0;
                    }

                    .fiscal-recursos-iron__seta {
                        height: 50px;
                    }

                    .fiscal-recursos-iron__seta span {
                        transform: rotate(90deg);
                    }
                }

                @media (max-width: 650px) {
                    .fiscal-recursos-iron {
                        padding: 75px 18px;
                    }

                    .fiscal-recursos-iron__detalhes {
                        grid-template-columns: 1fr;
                    }

                    .fiscal-recursos-iron__etapa,
                    .fiscal-recursos-iron__detalhe {
                        padding: 26px;
                    }
                }
            `}</style>
        </>
    );
}