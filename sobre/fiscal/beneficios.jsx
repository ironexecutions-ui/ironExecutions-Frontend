import React from "react";

export default function FiscalBeneficios() {
    return (
        <>
            <section className="fiscal-beneficios-iron">
                <div className="fiscal-beneficios-iron__container">

                    <div className="fiscal-beneficios-iron__introducao">

                        <span className="fiscal-beneficios-iron__mini">
                            OPERAÇÃO + FISCAL
                        </span>

                        <h2 className="fiscal-beneficios-iron__titulo">
                            A parte fiscal não precisa começar do zero
                            depois de cada venda
                        </h2>

                        <p className="fiscal-beneficios-iron__descricao">
                            Quando a venda já foi registrada dentro da
                            Iron Executions, o sistema já possui informações
                            daquela operação. O módulo Fiscal existe para
                            conectar esse processo comercial à etapa fiscal.
                        </p>

                    </div>

                    <div className="fiscal-beneficios-iron__comparacao">

                        <div className="fiscal-beneficios-iron__lado">

                            <span className="fiscal-beneficios-iron__lado-mini">
                                OPERAÇÃO
                            </span>

                            <strong className="fiscal-beneficios-iron__lado-titulo">
                                A venda
                            </strong>

                            <p className="fiscal-beneficios-iron__lado-texto">
                                O comércio realiza a operação e registra
                                a venda dentro do sistema.
                            </p>

                            <div className="fiscal-beneficios-iron__registro">
                                <span>Venda registrada</span>
                                <small>Informações da operação</small>
                            </div>

                        </div>

                        <div className="fiscal-beneficios-iron__ligacao">

                            <span className="fiscal-beneficios-iron__ligacao-linha" />

                            <div className="fiscal-beneficios-iron__ligacao-centro">
                                +
                            </div>

                            <span className="fiscal-beneficios-iron__ligacao-linha" />

                        </div>

                        <div className="fiscal-beneficios-iron__lado">

                            <span className="fiscal-beneficios-iron__lado-mini">
                                MÓDULO FISCAL
                            </span>

                            <strong className="fiscal-beneficios-iron__lado-titulo">
                                O documento fiscal
                            </strong>

                            <p className="fiscal-beneficios-iron__lado-texto">
                                A área Fiscal utiliza o contexto da operação
                                para auxiliar na emissão e no controle da nota.
                            </p>

                            <div className="fiscal-beneficios-iron__registro fiscal-beneficios-iron__registro--fiscal">
                                <span>Nota fiscal</span>
                                <small>Emissão e controle</small>
                            </div>

                        </div>

                    </div>

                    <div className="fiscal-beneficios-iron__resultado">

                        <div className="fiscal-beneficios-iron__resultado-icone">
                            <span />
                        </div>

                        <div className="fiscal-beneficios-iron__resultado-conteudo">

                            <span className="fiscal-beneficios-iron__resultado-mini">
                                INTEGRAÇÃO
                            </span>

                            <h3 className="fiscal-beneficios-iron__resultado-titulo">
                                Venda e documento fiscal passam a fazer parte
                                do mesmo fluxo de operação
                            </h3>

                            <p className="fiscal-beneficios-iron__resultado-texto">
                                O objetivo do módulo Fiscal é tornar a etapa
                                fiscal uma continuação organizada da operação
                                registrada na Iron Executions, oferecendo uma
                                área própria para emissão e controle das notas
                                fiscais das vendas.
                            </p>

                        </div>

                    </div>

                    <div className="fiscal-beneficios-iron__observacao">

                        <strong>
                            Importante
                        </strong>

                        <p>
                            O módulo Fiscal é uma ferramenta para auxiliar
                            na emissão e no controle fiscal das vendas dentro
                            da Iron Executions. A configuração e utilização
                            fiscal do comércio devem respeitar as regras
                            tributárias aplicáveis à empresa e à sua operação.
                        </p>

                    </div>

                </div>
            </section>

            <style>{`
                .fiscal-beneficios-iron {
                    width: 100%;
                    padding: 110px 24px;
                    box-sizing: border-box;
                    background: #ffffff;
                }

                .fiscal-beneficios-iron__container {
                    width: 100%;
                    max-width: 1160px;
                    margin: 0 auto;
                }

                .fiscal-beneficios-iron__introducao {
                    max-width: 850px;
                    margin: 0 auto;
                    text-align: center;
                }

                .fiscal-beneficios-iron__mini {
                    color: #0284c7;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .fiscal-beneficios-iron__titulo {
                    margin: 18px 0 0;
                    color: #0f172a;
                    font-size: clamp(36px, 4.5vw, 56px);
                    line-height: 1.08;
                    letter-spacing: -2.2px;
                }

                .fiscal-beneficios-iron__descricao {
                    max-width: 740px;
                    margin: 24px auto 0;
                    color: #64748b;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .fiscal-beneficios-iron__comparacao {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 90px minmax(0, 1fr);
                    align-items: stretch;
                }

                .fiscal-beneficios-iron__lado {
                    padding: 40px;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    background: #f8fafc;
                }

                .fiscal-beneficios-iron__lado-mini {
                    color: #0284c7;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .fiscal-beneficios-iron__lado-titulo {
                    display: block;
                    margin-top: 17px;
                    color: #0f172a;
                    font-size: 29px;
                }

                .fiscal-beneficios-iron__lado-texto {
                    min-height: 80px;
                    margin: 14px 0 0;
                    color: #64748b;
                    font-size: 15px;
                    line-height: 1.75;
                }

                .fiscal-beneficios-iron__registro {
                    margin-top: 30px;
                    padding: 17px 19px;
                    border: 1px solid #dce5ee;
                    border-radius: 14px;
                    background: #ffffff;
                }

                .fiscal-beneficios-iron__registro span {
                    display: block;
                    color: #172033;
                    font-size: 14px;
                    font-weight: 800;
                }

                .fiscal-beneficios-iron__registro small {
                    display: block;
                    margin-top: 4px;
                    color: #94a3b8;
                    font-size: 11px;
                }

                .fiscal-beneficios-iron__registro--fiscal {
                    border-color: #bae6fd;
                    background: #f0f9ff;
                }

                .fiscal-beneficios-iron__ligacao {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .fiscal-beneficios-iron__ligacao-linha {
                    width: 18px;
                    height: 1px;
                    background: #bae6fd;
                }

                .fiscal-beneficios-iron__ligacao-centro {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #0284c7;
                    color: #ffffff;
                    font-size: 21px;
                }

                .fiscal-beneficios-iron__resultado {
                    margin-top: 28px;
                    padding: 42px;
                    display: grid;
                    grid-template-columns: 55px minmax(0, 1fr);
                    gap: 24px;
                    border-radius: 24px;
                    background:
                        radial-gradient(
                            circle at 90% 20%,
                            rgba(14, 165, 233, 0.12),
                            transparent 30%
                        ),
                        #07111d;
                }

                .fiscal-beneficios-iron__resultado-icone {
                    padding-top: 6px;
                    display: flex;
                    justify-content: center;
                }

                .fiscal-beneficios-iron__resultado-icone span {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #38bdf8;
                    box-shadow: 0 0 20px rgba(56, 189, 248, 0.7);
                }

                .fiscal-beneficios-iron__resultado-mini {
                    color: #38bdf8;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .fiscal-beneficios-iron__resultado-titulo {
                    max-width: 760px;
                    margin: 12px 0 0;
                    color: #ffffff;
                    font-size: 28px;
                    line-height: 1.3;
                }

                .fiscal-beneficios-iron__resultado-texto {
                    max-width: 780px;
                    margin: 14px 0 0;
                    color: #91a4b9;
                    font-size: 15px;
                    line-height: 1.8;
                }

                .fiscal-beneficios-iron__observacao {
                    margin-top: 25px;
                    padding: 24px 28px;
                    display: grid;
                    grid-template-columns: 110px minmax(0, 1fr);
                    gap: 20px;
                    border: 1px solid #e2e8f0;
                    border-radius: 18px;
                    background: #f8fafc;
                }

                .fiscal-beneficios-iron__observacao strong {
                    color: #0f172a;
                    font-size: 14px;
                }

                .fiscal-beneficios-iron__observacao p {
                    margin: 0;
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.7;
                }

                @media (max-width: 750px) {
                    .fiscal-beneficios-iron {
                        padding: 75px 18px;
                    }

                    .fiscal-beneficios-iron__comparacao {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }

                    .fiscal-beneficios-iron__ligacao {
                        min-height: 50px;
                        flex-direction: column;
                    }

                    .fiscal-beneficios-iron__ligacao-linha {
                        width: 1px;
                        height: 10px;
                    }

                    .fiscal-beneficios-iron__lado {
                        padding: 28px;
                    }

                    .fiscal-beneficios-iron__lado-texto {
                        min-height: 0;
                    }

                    .fiscal-beneficios-iron__resultado {
                        grid-template-columns: 1fr;
                        padding: 30px;
                    }

                    .fiscal-beneficios-iron__resultado-icone {
                        justify-content: flex-start;
                    }

                    .fiscal-beneficios-iron__observacao {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}