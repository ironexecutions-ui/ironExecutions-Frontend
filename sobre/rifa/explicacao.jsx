import React from "react";

export default function RifaExplicacao() {
    return (
        <>
            <section className="rifa-explicacao-iron">
                <div className="rifa-explicacao-iron__container">

                    <div className="rifa-explicacao-iron__conteudo">

                        <span className="rifa-explicacao-iron__categoria">
                            MÓDULO RIFA
                        </span>

                        <h1 className="rifa-explicacao-iron__titulo">
                            Crie uma rifa e acompanhe toda a organização em um só lugar
                        </h1>

                        <p className="rifa-explicacao-iron__descricao">
                            O módulo de Rifa da Iron Executions foi desenvolvido
                            para organizar o processo completo de uma rifa,
                            desde sua criação até o sorteio.
                        </p>

                        <p className="rifa-explicacao-iron__descricao-secundaria">
                            Conforme os números são vendidos, a quantidade de
                            participantes e informações para controlar aumenta.
                            O módulo centraliza números, participantes e
                            pagamentos para facilitar o acompanhamento da rifa.
                        </p>

                        <div className="rifa-explicacao-iron__resumo">

                            <article className="rifa-explicacao-iron__resumo-item">
                                <span>01</span>
                                <strong>Números</strong>
                                <p>
                                    Acompanhe os números vendidos durante
                                    a realização da rifa.
                                </p>
                            </article>

                            <article className="rifa-explicacao-iron__resumo-item">
                                <span>02</span>
                                <strong>Participantes</strong>
                                <p>
                                    Mantenha os participantes relacionados
                                    aos números da rifa.
                                </p>
                            </article>

                            <article className="rifa-explicacao-iron__resumo-item">
                                <span>03</span>
                                <strong>Pagamentos</strong>
                                <p>
                                    Organize as informações dos pagamentos
                                    realizados pelos participantes.
                                </p>
                            </article>

                        </div>

                    </div>

                    <aside className="rifa-explicacao-iron__painel">

                        <div className="rifa-explicacao-iron__painel-topo">

                            <div className="rifa-explicacao-iron__painel-identidade">
                                <i />
                                RIFA
                            </div>

                            <span>IRON EXECUTIONS</span>

                        </div>

                        <div className="rifa-explicacao-iron__painel-corpo">

                            <span className="rifa-explicacao-iron__painel-mini">
                                CICLO DA RIFA
                            </span>

                            <div className="rifa-explicacao-iron__fluxo">

                                <div className="rifa-explicacao-iron__fluxo-item">
                                    <span>01</span>
                                    <div>
                                        <strong>Criação</strong>
                                        <small>
                                            A rifa é criada e organizada
                                        </small>
                                    </div>
                                </div>

                                <div className="rifa-explicacao-iron__linha" />

                                <div className="rifa-explicacao-iron__fluxo-item">
                                    <span>02</span>
                                    <div>
                                        <strong>Venda dos números</strong>
                                        <small>
                                            Participantes entram na rifa
                                        </small>
                                    </div>
                                </div>

                                <div className="rifa-explicacao-iron__linha" />

                                <div className="rifa-explicacao-iron__fluxo-item">
                                    <span>03</span>
                                    <div>
                                        <strong>Pagamentos</strong>
                                        <small>
                                            A arrecadação é acompanhada
                                        </small>
                                    </div>
                                </div>

                                <div className="rifa-explicacao-iron__linha" />

                                <div className="rifa-explicacao-iron__fluxo-item rifa-explicacao-iron__fluxo-item--ativo">
                                    <span>04</span>
                                    <div>
                                        <strong>Sorteio</strong>
                                        <small>
                                            A rifa chega à etapa final
                                        </small>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </aside>

                </div>
            </section>

            <style>{`
                .rifa-explicacao-iron {
                    width: 100%;
                    padding: 115px 24px 105px;
                    box-sizing: border-box;
                    overflow: hidden;
                    background:
                        radial-gradient(circle at 82% 18%, rgba(245, 158, 11, 0.15), transparent 33%),
                        radial-gradient(circle at 8% 90%, rgba(234, 179, 8, 0.07), transparent 30%),
                        #151006;
                    color: #ffffff;
                }

                .rifa-explicacao-iron__container {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
                    gap: 70px;
                    align-items: center;
                }

                .rifa-explicacao-iron__categoria {
                    display: inline-flex;
                    align-items: center;
                    min-height: 34px;
                    padding: 0 14px;
                    border: 1px solid rgba(251, 191, 36, 0.25);
                    border-radius: 100px;
                    background: rgba(245, 158, 11, 0.08);
                    color: #fbbf24;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.8px;
                }

                .rifa-explicacao-iron__titulo {
                    max-width: 820px;
                    margin: 25px 0 0;
                    color: #ffffff;
                    font-size: clamp(42px, 5.4vw, 70px);
                    font-weight: 800;
                    line-height: 1.03;
                    letter-spacing: -3px;
                }

                .rifa-explicacao-iron__descricao {
                    max-width: 760px;
                    margin: 30px 0 0;
                    color: #e7dfcf;
                    font-size: 20px;
                    line-height: 1.7;
                }

                .rifa-explicacao-iron__descricao-secundaria {
                    max-width: 760px;
                    margin: 16px 0 0;
                    color: #a69b87;
                    font-size: 16px;
                    line-height: 1.8;
                }

                .rifa-explicacao-iron__resumo {
                    margin-top: 42px;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 12px;
                }

                .rifa-explicacao-iron__resumo-item {
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.035);
                }

                .rifa-explicacao-iron__resumo-item > span {
                    display: block;
                    margin-bottom: 14px;
                    color: #fbbf24;
                    font-size: 10px;
                    font-weight: 900;
                }

                .rifa-explicacao-iron__resumo-item strong {
                    color: #ffffff;
                    font-size: 15px;
                }

                .rifa-explicacao-iron__resumo-item p {
                    margin: 7px 0 0;
                    color: #928775;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .rifa-explicacao-iron__painel {
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 26px;
                    background: rgba(255, 255, 255, 0.045);
                    box-shadow: 0 35px 90px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(16px);
                }

                .rifa-explicacao-iron__painel-topo {
                    min-height: 60px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                }

                .rifa-explicacao-iron__painel-identidade {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    color: #e3d9c5;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.4px;
                }

                .rifa-explicacao-iron__painel-identidade i {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #fbbf24;
                    box-shadow: 0 0 18px rgba(251, 191, 36, 0.8);
                }

                .rifa-explicacao-iron__painel-topo > span {
                    color: #766b59;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 1.2px;
                }

                .rifa-explicacao-iron__painel-corpo {
                    padding: 36px;
                }

                .rifa-explicacao-iron__painel-mini {
                    color: #fbbf24;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .rifa-explicacao-iron__fluxo {
                    margin-top: 28px;
                }

                .rifa-explicacao-iron__fluxo-item {
                    padding: 17px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.025);
                }

                .rifa-explicacao-iron__fluxo-item > span {
                    width: 35px;
                    height: 35px;
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: rgba(245, 158, 11, 0.09);
                    color: #fbbf24;
                    font-size: 11px;
                    font-weight: 900;
                }

                .rifa-explicacao-iron__fluxo-item strong {
                    display: block;
                    color: #f4efe5;
                    font-size: 14px;
                }

                .rifa-explicacao-iron__fluxo-item small {
                    display: block;
                    margin-top: 4px;
                    color: #807563;
                    font-size: 11px;
                }

                .rifa-explicacao-iron__fluxo-item--ativo {
                    border-color: rgba(251, 191, 36, 0.25);
                    background: rgba(245, 158, 11, 0.07);
                }

                .rifa-explicacao-iron__linha {
                    width: 1px;
                    height: 18px;
                    margin-left: 35px;
                    background: rgba(251, 191, 36, 0.25);
                }

                @media (max-width: 950px) {
                    .rifa-explicacao-iron__container {
                        grid-template-columns: 1fr;
                        gap: 45px;
                    }
                }

                @media (max-width: 650px) {
                    .rifa-explicacao-iron {
                        padding: 75px 18px 70px;
                    }

                    .rifa-explicacao-iron__titulo {
                        font-size: 41px;
                        letter-spacing: -2px;
                    }

                    .rifa-explicacao-iron__resumo {
                        grid-template-columns: 1fr;
                    }

                    .rifa-explicacao-iron__painel-corpo {
                        padding: 26px;
                    }
                }
            `}</style>
        </>
    );
}