import React from "react";

export default function FiscalExplicacao() {
    return (
        <>
            <section className="fiscal-explicacao-iron">
                <div className="fiscal-explicacao-iron__container">

                    <div className="fiscal-explicacao-iron__conteudo">

                        <span className="fiscal-explicacao-iron__categoria">
                            MÓDULO FISCAL
                        </span>

                        <h1 className="fiscal-explicacao-iron__titulo">
                            A venda acontece no sistema.
                            A parte fiscal continua a partir dela.
                        </h1>

                        <p className="fiscal-explicacao-iron__descricao">
                            O módulo Fiscal da Iron Executions é a área
                            responsável por auxiliar na emissão e no controle
                            das notas fiscais relacionadas às vendas realizadas
                            pelo comércio.
                        </p>

                        <p className="fiscal-explicacao-iron__descricao-secundaria">
                            A proposta é evitar que a operação comercial e a
                            parte fiscal sejam tratadas como processos
                            completamente separados. As informações da venda
                            registrada no sistema podem continuar sendo
                            utilizadas no fluxo fiscal.
                        </p>

                        <div className="fiscal-explicacao-iron__pontos">

                            <div className="fiscal-explicacao-iron__ponto">
                                <span className="fiscal-explicacao-iron__ponto-numero">
                                    01
                                </span>

                                <div>
                                    <strong>Venda registrada</strong>
                                    <p>
                                        A operação comercial acontece e as
                                        informações da venda ficam registradas
                                        no sistema.
                                    </p>
                                </div>
                            </div>

                            <div className="fiscal-explicacao-iron__ponto">
                                <span className="fiscal-explicacao-iron__ponto-numero">
                                    02
                                </span>

                                <div>
                                    <strong>Processo fiscal</strong>
                                    <p>
                                        A área Fiscal utiliza as informações
                                        necessárias para dar continuidade ao
                                        processo relacionado à nota fiscal.
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>

                    <aside className="fiscal-explicacao-iron__painel">

                        <div className="fiscal-explicacao-iron__painel-topo">
                            <div className="fiscal-explicacao-iron__painel-identidade">
                                <span className="fiscal-explicacao-iron__status" />

                                <span>
                                    FISCAL
                                </span>
                            </div>

                            <span className="fiscal-explicacao-iron__painel-sistema">
                                IRON EXECUTIONS
                            </span>
                        </div>

                        <div className="fiscal-explicacao-iron__painel-corpo">

                            <span className="fiscal-explicacao-iron__painel-mini">
                                VENDA
                            </span>

                            <div className="fiscal-explicacao-iron__fluxo-linha">

                                <div className="fiscal-explicacao-iron__fluxo-item">
                                    <span>1</span>

                                    <div>
                                        <strong>Operação realizada</strong>
                                        <small>
                                            Venda registrada no sistema
                                        </small>
                                    </div>
                                </div>

                                <div className="fiscal-explicacao-iron__fluxo-conector" />

                                <div className="fiscal-explicacao-iron__fluxo-item">
                                    <span>2</span>

                                    <div>
                                        <strong>Informações da venda</strong>
                                        <small>
                                            Dados utilizados no fluxo fiscal
                                        </small>
                                    </div>
                                </div>

                                <div className="fiscal-explicacao-iron__fluxo-conector" />

                                <div className="fiscal-explicacao-iron__fluxo-item fiscal-explicacao-iron__fluxo-item--ativo">
                                    <span>3</span>

                                    <div>
                                        <strong>Nota fiscal</strong>
                                        <small>
                                            Emissão e controle pelo módulo
                                        </small>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </aside>

                </div>
            </section>

            <style>{`
                .fiscal-explicacao-iron {
                    width: 100%;
                    padding: 115px 24px 105px;
                    box-sizing: border-box;
                    overflow: hidden;
                    background:
                        radial-gradient(
                            circle at 82% 18%,
                            rgba(14, 165, 233, 0.14),
                            transparent 32%
                        ),
                        radial-gradient(
                            circle at 5% 90%,
                            rgba(59, 130, 246, 0.07),
                            transparent 28%
                        ),
                        #07111d;
                    color: #ffffff;
                }

                .fiscal-explicacao-iron__container {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
                    gap: 70px;
                    align-items: center;
                }

                .fiscal-explicacao-iron__conteudo {
                    min-width: 0;
                }

                .fiscal-explicacao-iron__categoria {
                    display: inline-flex;
                    align-items: center;
                    min-height: 34px;
                    padding: 0 14px;
                    border: 1px solid rgba(56, 189, 248, 0.22);
                    border-radius: 100px;
                    background: rgba(14, 165, 233, 0.07);
                    color: #7dd3fc;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.8px;
                }

                .fiscal-explicacao-iron__titulo {
                    max-width: 800px;
                    margin: 25px 0 0;
                    color: #ffffff;
                    font-size: clamp(42px, 5.4vw, 70px);
                    font-weight: 800;
                    line-height: 1.03;
                    letter-spacing: -3px;
                }

                .fiscal-explicacao-iron__descricao {
                    max-width: 760px;
                    margin: 30px 0 0;
                    color: #d3deea;
                    font-size: 20px;
                    line-height: 1.7;
                }

                .fiscal-explicacao-iron__descricao-secundaria {
                    max-width: 760px;
                    margin: 16px 0 0;
                    color: #8ea2b8;
                    font-size: 16px;
                    line-height: 1.8;
                }

                .fiscal-explicacao-iron__pontos {
                    margin-top: 42px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 14px;
                }

                .fiscal-explicacao-iron__ponto {
                    padding: 20px;
                    display: flex;
                    gap: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 17px;
                    background: rgba(255, 255, 255, 0.035);
                }

                .fiscal-explicacao-iron__ponto-numero {
                    color: #38bdf8;
                    font-size: 11px;
                    font-weight: 900;
                }

                .fiscal-explicacao-iron__ponto strong {
                    display: block;
                    color: #ffffff;
                    font-size: 15px;
                }

                .fiscal-explicacao-iron__ponto p {
                    margin: 7px 0 0;
                    color: #8194aa;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .fiscal-explicacao-iron__painel {
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 25px;
                    background: rgba(255, 255, 255, 0.045);
                    box-shadow: 0 35px 90px rgba(0, 0, 0, 0.25);
                    backdrop-filter: blur(16px);
                }

                .fiscal-explicacao-iron__painel-topo {
                    min-height: 60px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                }

                .fiscal-explicacao-iron__painel-identidade {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    color: #b5c4d5;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.4px;
                }

                .fiscal-explicacao-iron__status {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #38bdf8;
                    box-shadow: 0 0 18px rgba(56, 189, 248, 0.8);
                }

                .fiscal-explicacao-iron__painel-sistema {
                    color: #5e7188;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 1.2px;
                }

                .fiscal-explicacao-iron__painel-corpo {
                    padding: 36px;
                }

                .fiscal-explicacao-iron__painel-mini {
                    color: #38bdf8;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .fiscal-explicacao-iron__fluxo-linha {
                    margin-top: 28px;
                }

                .fiscal-explicacao-iron__fluxo-item {
                    padding: 18px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.025);
                }

                .fiscal-explicacao-iron__fluxo-item > span {
                    width: 34px;
                    height: 34px;
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: rgba(56, 189, 248, 0.08);
                    color: #7dd3fc;
                    font-size: 12px;
                    font-weight: 900;
                }

                .fiscal-explicacao-iron__fluxo-item strong {
                    display: block;
                    color: #e8eef5;
                    font-size: 14px;
                }

                .fiscal-explicacao-iron__fluxo-item small {
                    display: block;
                    margin-top: 4px;
                    color: #708399;
                    font-size: 11px;
                }

                .fiscal-explicacao-iron__fluxo-item--ativo {
                    border-color: rgba(56, 189, 248, 0.22);
                    background: rgba(14, 165, 233, 0.06);
                }

                .fiscal-explicacao-iron__fluxo-conector {
                    width: 1px;
                    height: 20px;
                    margin-left: 35px;
                    background: rgba(56, 189, 248, 0.28);
                }

                @media (max-width: 950px) {
                    .fiscal-explicacao-iron__container {
                        grid-template-columns: 1fr;
                        gap: 45px;
                    }

                    .fiscal-explicacao-iron__painel {
                        max-width: 650px;
                    }
                }

                @media (max-width: 650px) {
                    .fiscal-explicacao-iron {
                        padding: 75px 18px 70px;
                    }

                    .fiscal-explicacao-iron__titulo {
                        font-size: 41px;
                        letter-spacing: -2px;
                    }

                    .fiscal-explicacao-iron__descricao {
                        font-size: 18px;
                    }

                    .fiscal-explicacao-iron__pontos {
                        grid-template-columns: 1fr;
                    }

                    .fiscal-explicacao-iron__painel-corpo {
                        padding: 26px;
                    }
                }
            `}</style>
        </>
    );
}