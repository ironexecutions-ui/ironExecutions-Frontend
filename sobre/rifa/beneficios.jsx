import React from "react";

export default function RifaBeneficios() {
    return (
        <>
            <section className="rifa-beneficios-controle">
                <div className="rifa-beneficios-controle__container">

                    <header className="rifa-beneficios-controle__cabecalho">

                        <span className="rifa-beneficios-controle__mini">
                            ORGANIZAÇÃO DO COMEÇO AO FIM
                        </span>

                        <h2 className="rifa-beneficios-controle__titulo">
                            Uma rifa pode começar simples e rapidamente
                            envolver dezenas ou centenas de participantes
                        </h2>

                        <p className="rifa-beneficios-controle__descricao">
                            Conforme os números são vendidos, controlar
                            participantes, pagamentos e a própria evolução
                            da rifa manualmente se torna cada vez mais
                            trabalhoso. O módulo foi criado para centralizar
                            esse processo.
                        </p>

                    </header>

                    <div className="rifa-beneficios-controle__comparacao">

                        <article className="rifa-beneficios-controle__lado">

                            <span className="rifa-beneficios-controle__lado-mini">
                                SEM CENTRALIZAÇÃO
                            </span>

                            <h3>
                                Cada informação precisa ser controlada
                                separadamente
                            </h3>

                            <div className="rifa-beneficios-controle__lista">
                                <div>
                                    <span />
                                    Números vendidos
                                </div>

                                <div>
                                    <span />
                                    Participantes
                                </div>

                                <div>
                                    <span />
                                    Pagamentos
                                </div>

                                <div>
                                    <span />
                                    Informações da rifa
                                </div>
                            </div>

                        </article>

                        <div className="rifa-beneficios-controle__centro">
                            →
                        </div>

                        <article className="rifa-beneficios-controle__lado rifa-beneficios-controle__lado--iron">

                            <span className="rifa-beneficios-controle__lado-mini">
                                COM O MÓDULO RIFA
                            </span>

                            <h3>
                                A rifa passa a ter uma área própria
                                para ser administrada
                            </h3>

                            <p>
                                Participantes, números e pagamentos podem
                                fazer parte da mesma estrutura, permitindo
                                acompanhar a realização da rifa até sua
                                etapa final.
                            </p>

                            <div className="rifa-beneficios-controle__centralizado">
                                <i />
                                <span>
                                    Informações centralizadas
                                </span>
                            </div>

                        </article>

                    </div>

                    <div className="rifa-beneficios-controle__taxa">

                        <div className="rifa-beneficios-controle__taxa-valor">
                            <small>
                                TAXA DE SERVIÇO
                            </small>

                            <strong>
                                6%
                            </strong>

                            <span>
                                sobre o valor arrecadado
                            </span>
                        </div>

                        <div className="rifa-beneficios-controle__taxa-conteudo">

                            <span className="rifa-beneficios-controle__taxa-mini">
                                MODELO DE COBRANÇA
                            </span>

                            <h3>
                                A taxa está relacionada ao valor arrecadado pela rifa
                            </h3>

                            <p>
                                Cada rifa realizada através do módulo possui
                                uma taxa de serviço de 6% sobre o valor
                                arrecadado.
                            </p>

                            <div className="rifa-beneficios-controle__exemplo">

                                <div>
                                    <small>EXEMPLO</small>
                                    <span>Rifa arrecada</span>
                                    <strong>R$ 1.000,00</strong>
                                </div>

                                <span className="rifa-beneficios-controle__exemplo-seta">
                                    →
                                </span>

                                <div>
                                    <small>TAXA DE 6%</small>
                                    <span>Taxa de serviço</span>
                                    <strong>R$ 60,00</strong>
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="rifa-beneficios-controle__final">

                        <span className="rifa-beneficios-controle__final-ponto" />

                        <div>
                            <small>
                                MÓDULO RIFA
                            </small>

                            <strong>
                                Da criação dos números ao sorteio, uma estrutura
                                criada para manter a rifa organizada dentro
                                da Iron Executions.
                            </strong>
                        </div>

                    </div>

                </div>
            </section>

            <style>{`
                .rifa-beneficios-controle {
                    width: 100%;
                    padding: 110px 24px;
                    box-sizing: border-box;
                    background: #ffffff;
                }

                .rifa-beneficios-controle__container {
                    width: 100%;
                    max-width: 1160px;
                    margin: 0 auto;
                }

                .rifa-beneficios-controle__cabecalho {
                    max-width: 880px;
                    margin: 0 auto;
                    text-align: center;
                }

                .rifa-beneficios-controle__mini {
                    color: #d97706;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .rifa-beneficios-controle__titulo {
                    margin: 18px 0 0;
                    color: #211a0d;
                    font-size: clamp(36px, 4.5vw, 56px);
                    line-height: 1.08;
                    letter-spacing: -2.2px;
                }

                .rifa-beneficios-controle__descricao {
                    max-width: 760px;
                    margin: 24px auto 0;
                    color: #746c5e;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .rifa-beneficios-controle__comparacao {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 75px minmax(0, 1fr);
                    align-items: stretch;
                }

                .rifa-beneficios-controle__lado {
                    padding: 40px;
                    border: 1px solid #ebe5d9;
                    border-radius: 24px;
                    background: #fdfbf7;
                }

                .rifa-beneficios-controle__lado--iron {
                    border-color: #fde68a;
                    background: #fffcf2;
                }

                .rifa-beneficios-controle__lado-mini {
                    color: #d97706;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .rifa-beneficios-controle__lado h3 {
                    margin: 18px 0 0;
                    color: #211a0d;
                    font-size: 26px;
                    line-height: 1.3;
                }

                .rifa-beneficios-controle__lado p {
                    margin: 17px 0 0;
                    color: #746c5e;
                    font-size: 15px;
                    line-height: 1.75;
                }

                .rifa-beneficios-controle__lista {
                    margin-top: 28px;
                    display: grid;
                    gap: 10px;
                }

                .rifa-beneficios-controle__lista div {
                    padding: 13px 15px;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    border: 1px solid #ebe5d9;
                    border-radius: 11px;
                    background: #ffffff;
                    color: #665d4f;
                    font-size: 13px;
                    font-weight: 700;
                }

                .rifa-beneficios-controle__lista div span {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #c4b9a5;
                }

                .rifa-beneficios-controle__centro {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #d97706;
                    font-size: 27px;
                }

                .rifa-beneficios-controle__centralizado {
                    width: fit-content;
                    margin-top: 25px;
                    padding: 11px 14px;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    border-radius: 100px;
                    background: #fef3c7;
                    color: #92400e;
                    font-size: 11px;
                    font-weight: 800;
                }

                .rifa-beneficios-controle__centralizado i {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #f59e0b;
                }

                .rifa-beneficios-controle__taxa {
                    margin-top: 28px;
                    padding: 42px;
                    display: grid;
                    grid-template-columns: 250px minmax(0, 1fr);
                    gap: 50px;
                    align-items: center;
                    border-radius: 25px;
                    background:
                        radial-gradient(circle at 90% 15%, rgba(245, 158, 11, 0.11), transparent 35%),
                        #151006;
                }

                .rifa-beneficios-controle__taxa-valor {
                    padding: 30px;
                    text-align: center;
                    border: 1px solid rgba(251, 191, 36, 0.18);
                    border-radius: 20px;
                    background: rgba(245, 158, 11, 0.07);
                }

                .rifa-beneficios-controle__taxa-valor small {
                    display: block;
                    color: #c79c46;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                }

                .rifa-beneficios-controle__taxa-valor strong {
                    display: block;
                    margin-top: 10px;
                    color: #fbbf24;
                    font-size: 60px;
                    line-height: 1;
                }

                .rifa-beneficios-controle__taxa-valor span {
                    display: block;
                    margin-top: 9px;
                    color: #9f9178;
                    font-size: 11px;
                }

                .rifa-beneficios-controle__taxa-mini {
                    color: #fbbf24;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .rifa-beneficios-controle__taxa-conteudo h3 {
                    max-width: 650px;
                    margin: 13px 0 0;
                    color: #ffffff;
                    font-size: 27px;
                    line-height: 1.3;
                }

                .rifa-beneficios-controle__taxa-conteudo > p {
                    margin: 14px 0 0;
                    color: #9f9178;
                    font-size: 15px;
                    line-height: 1.75;
                }

                .rifa-beneficios-controle__exemplo {
                    margin-top: 25px;
                    padding: 18px;
                    display: grid;
                    grid-template-columns: 1fr 35px 1fr;
                    align-items: center;
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 15px;
                    background: rgba(255,255,255,.035);
                }

                .rifa-beneficios-controle__exemplo div {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .rifa-beneficios-controle__exemplo small {
                    color: #a5823e;
                    font-size: 8px;
                    font-weight: 900;
                    letter-spacing: 1.2px;
                }

                .rifa-beneficios-controle__exemplo div span {
                    color: #8e826d;
                    font-size: 10px;
                }

                .rifa-beneficios-controle__exemplo strong {
                    color: #ffffff;
                    font-size: 17px;
                }

                .rifa-beneficios-controle__exemplo-seta {
                    color: #fbbf24;
                    text-align: center;
                }

                .rifa-beneficios-controle__final {
                    margin-top: 28px;
                    padding: 30px 35px;
                    display: grid;
                    grid-template-columns: 14px minmax(0, 1fr);
                    gap: 20px;
                    align-items: center;
                    border: 1px solid #ebe5d9;
                    border-radius: 20px;
                    background: #fdfbf7;
                }

                .rifa-beneficios-controle__final-ponto {
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                    background: #f59e0b;
                }

                .rifa-beneficios-controle__final small {
                    display: block;
                    color: #d97706;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                }

                .rifa-beneficios-controle__final strong {
                    display: block;
                    max-width: 900px;
                    margin-top: 7px;
                    color: #453b29;
                    font-size: 17px;
                    line-height: 1.55;
                }

                @media (max-width: 800px) {
                    .rifa-beneficios-controle__comparacao {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }

                    .rifa-beneficios-controle__centro {
                        min-height: 40px;
                        transform: rotate(90deg);
                    }

                    .rifa-beneficios-controle__taxa {
                        grid-template-columns: 1fr;
                        gap: 30px;
                    }

                    .rifa-beneficios-controle__taxa-valor {
                        max-width: 250px;
                    }
                }

                @media (max-width: 600px) {
                    .rifa-beneficios-controle {
                        padding: 75px 18px;
                    }

                    .rifa-beneficios-controle__lado,
                    .rifa-beneficios-controle__taxa {
                        padding: 27px;
                    }

                    .rifa-beneficios-controle__exemplo {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .rifa-beneficios-controle__exemplo-seta {
                        transform: rotate(90deg);
                    }

                    .rifa-beneficios-controle__final {
                        padding: 25px;
                    }
                }
            `}</style>
        </>
    );
}