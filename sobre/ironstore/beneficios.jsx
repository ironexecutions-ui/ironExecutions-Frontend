import React from "react";

export default function IronStoreBeneficios() {
    return (
        <>
            <section className="ironstore-beneficios-negocio">
                <div className="ironstore-beneficios-negocio__container">

                    <header className="ironstore-beneficios-negocio__cabecalho">

                        <span className="ironstore-beneficios-negocio__mini">
                            UM NOVO CANAL DE VENDAS
                        </span>

                        <h2 className="ironstore-beneficios-negocio__titulo">
                            Sua loja física continua existindo.
                            A IronStore adiciona uma nova forma de vender.
                        </h2>

                        <p className="ironstore-beneficios-negocio__descricao">
                            O cliente não precisa estar dentro do seu
                            estabelecimento para conhecer seus produtos e
                            iniciar uma compra. Com a IronStore, o comércio
                            passa a ter também uma operação de vendas online.
                        </p>

                    </header>

                    <div className="ironstore-beneficios-negocio__comparacao">

                        <article className="ironstore-beneficios-negocio__lado">

                            <span className="ironstore-beneficios-negocio__lado-mini">
                                VENDA PRESENCIAL
                            </span>

                            <h3>
                                O cliente compra no estabelecimento
                            </h3>

                            <p>
                                A operação presencial continua funcionando
                                normalmente. O cliente é atendido diretamente
                                pelo comércio e a venda acontece no local.
                            </p>

                            <div className="ironstore-beneficios-negocio__tipo">
                                <span>Comércio</span>
                                <i />
                                <span>Cliente</span>
                            </div>

                        </article>

                        <div className="ironstore-beneficios-negocio__mais">
                            +
                        </div>

                        <article className="ironstore-beneficios-negocio__lado ironstore-beneficios-negocio__lado--online">

                            <span className="ironstore-beneficios-negocio__lado-mini">
                                IRONSTORE
                            </span>

                            <h3>
                                O cliente também pode comprar pela internet
                            </h3>

                            <p>
                                Seus produtos ficam disponíveis através da
                                loja virtual, permitindo que o cliente faça
                                uma compra sem precisar iniciar o atendimento
                                presencialmente.
                            </p>

                            <div className="ironstore-beneficios-negocio__tipo">
                                <span>Comércio</span>
                                <i />
                                <span>Internet</span>
                                <i />
                                <span>Cliente</span>
                            </div>

                        </article>

                    </div>

                    <div className="ironstore-beneficios-negocio__integracao">

                        <div className="ironstore-beneficios-negocio__integracao-texto">

                            <span className="ironstore-beneficios-negocio__integracao-mini">
                                O DIFERENCIAL
                            </span>

                            <h3>
                                A venda online continua fazendo parte
                                da operação do comércio
                            </h3>

                            <p>
                                Depois que o cliente compra, existe um pedido
                                real que precisa ser recebido, preparado,
                                acompanhado e entregue. A IronStore mantém
                                essa jornada conectada à operação da loja.
                            </p>

                        </div>

                        <div className="ironstore-beneficios-negocio__integracao-etapas">

                            <div>
                                <span>01</span>
                                <strong>Venda online</strong>
                            </div>

                            <div>
                                <span>02</span>
                                <strong>Pedido recebido</strong>
                            </div>

                            <div>
                                <span>03</span>
                                <strong>Preparação</strong>
                            </div>

                            <div>
                                <span>04</span>
                                <strong>Entrega</strong>
                            </div>

                        </div>

                    </div>

                    <div className="ironstore-beneficios-negocio__taxa">

                        <div className="ironstore-beneficios-negocio__taxa-valor">
                            <span>Taxa por venda</span>
                            <strong>10%</strong>
                        </div>

                        <div className="ironstore-beneficios-negocio__taxa-conteudo">

                            <h3>
                                A taxa acompanha as vendas realizadas
                                pela IronStore
                            </h3>

                            <p>
                                Cada venda realizada através da IronStore
                                possui uma taxa de serviço de 10% sobre o
                                valor da venda.
                            </p>

                            <span className="ironstore-beneficios-negocio__taxa-observacao">
                                A cobrança percentual está relacionada às
                                vendas realizadas pelo módulo.
                            </span>

                        </div>

                    </div>
                    <div className="ironstore-beneficios-negocio__exemplo">

                        <div className="ironstore-beneficios-negocio__exemplo-conteudo">

                            <span className="ironstore-beneficios-negocio__exemplo-mini">
                                VEJA UMA IRONSTORE FUNCIONANDO
                            </span>

                            <h3>
                                Veja um exemplo real de loja criada com a IronStore
                            </h3>

                            <p>
                                Conheça a Missionary Store Brasil e veja na prática como
                                produtos, navegação e vendas online podem funcionar através
                                de uma loja utilizando a estrutura da IronStore.
                            </p>

                            <a
                                href="https://missionarystorebrasil.com.br"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ironstore-beneficios-negocio__exemplo-botao"
                            >
                                <span>Ver loja de exemplo</span>
                                <strong>↗</strong>
                            </a>

                        </div>

                        <div className="ironstore-beneficios-negocio__exemplo-site">

                            <span className="ironstore-beneficios-negocio__exemplo-site-label">
                                EXEMPLO REAL
                            </span>

                            <strong>
                                Missionary Store Brasil
                            </strong>

                            <span className="ironstore-beneficios-negocio__exemplo-dominio">
                                missionarystorebrasil.com.br
                            </span>

                            <div className="ironstore-beneficios-negocio__exemplo-status">
                                <i />
                                Loja online
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            <style>{`
                .ironstore-beneficios-negocio {
                    width: 100%;
                    padding: 110px 24px;
                    box-sizing: border-box;
                    background: #ffffff;
                }
.ironstore-beneficios-negocio__exemplo {
    margin-top: 28px;
    padding: 45px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 55px;
    align-items: center;
    border: 1px solid #e9d5ff;
    border-radius: 25px;
    background:
        radial-gradient(
            circle at 90% 20%,
            rgba(168, 85, 247, 0.08),
            transparent 35%
        ),
        #fcfaff;
}

.ironstore-beneficios-negocio__exemplo-conteudo {
    min-width: 0;
}

.ironstore-beneficios-negocio__exemplo-mini {
    display: block;
    color: #7e22ce;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.7px;
}

.ironstore-beneficios-negocio__exemplo-conteudo h3 {
    max-width: 600px;
    margin: 14px 0 0;
    color: #17101f;
    font-size: 29px;
    line-height: 1.3;
    letter-spacing: -0.7px;
}

.ironstore-beneficios-negocio__exemplo-conteudo p {
    max-width: 650px;
    margin: 15px 0 0;
    color: #706578;
    font-size: 15px;
    line-height: 1.8;
}

.ironstore-beneficios-negocio__exemplo-botao {
    width: fit-content;
    min-height: 50px;
    margin-top: 25px;
    padding: 0 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    border-radius: 13px;
    background: #7e22ce;
    color: #ffffff;
    text-decoration: none;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.ironstore-beneficios-negocio__exemplo-botao span {
    font-size: 13px;
    font-weight: 800;
}

.ironstore-beneficios-negocio__exemplo-botao strong {
    font-size: 18px;
    font-weight: 400;
}

.ironstore-beneficios-negocio__exemplo-botao:hover {
    transform: translateY(-2px);
    background: #6b21a8;
    box-shadow: 0 12px 30px rgba(126, 34, 206, 0.2);
}

.ironstore-beneficios-negocio__exemplo-site {
    min-height: 190px;
    padding: 30px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid #e8dff0;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 18px 50px rgba(74, 34, 94, 0.07);
}

.ironstore-beneficios-negocio__exemplo-site-label {
    color: #a855f7;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1.7px;
}

.ironstore-beneficios-negocio__exemplo-site > strong {
    display: block;
    margin-top: 14px;
    color: #17101f;
    font-size: 21px;
}

.ironstore-beneficios-negocio__exemplo-dominio {
    display: block;
    margin-top: 5px;
    color: #7e22ce;
    font-size: 13px;
    font-weight: 700;
}

.ironstore-beneficios-negocio__exemplo-status {
    width: fit-content;
    margin-top: 25px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 100px;
    background: #f7f0fc;
    color: #695274;
    font-size: 11px;
    font-weight: 700;
}

.ironstore-beneficios-negocio__exemplo-status i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
}
                .ironstore-beneficios-negocio__container {
                    width: 100%;
                    max-width: 1160px;
                    margin: 0 auto;
                }

                .ironstore-beneficios-negocio__cabecalho {
                    max-width: 880px;
                    margin: 0 auto;
                    text-align: center;
                }

                .ironstore-beneficios-negocio__mini {
                    color: #7e22ce;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .ironstore-beneficios-negocio__titulo {
                    margin: 18px 0 0;
                    color: #17101f;
                    font-size: clamp(36px, 4.5vw, 56px);
                    line-height: 1.08;
                    letter-spacing: -2.2px;
                }

                .ironstore-beneficios-negocio__descricao {
                    max-width: 740px;
                    margin: 24px auto 0;
                    color: #706578;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .ironstore-beneficios-negocio__comparacao {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 75px minmax(0, 1fr);
                    align-items: stretch;
                }

                .ironstore-beneficios-negocio__lado {
                    padding: 40px;
                    border: 1px solid #e8e2ed;
                    border-radius: 24px;
                    background: #faf9fb;
                }

                .ironstore-beneficios-negocio__lado--online {
                    border-color: #e9d5ff;
                    background: #fcf8ff;
                }

                .ironstore-beneficios-negocio__lado-mini {
                    color: #7e22ce;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .ironstore-beneficios-negocio__lado h3 {
                    margin: 18px 0 0;
                    color: #17101f;
                    font-size: 27px;
                    line-height: 1.3;
                }

                .ironstore-beneficios-negocio__lado p {
                    min-height: 105px;
                    margin: 15px 0 0;
                    color: #746a7c;
                    font-size: 15px;
                    line-height: 1.75;
                }

                .ironstore-beneficios-negocio__tipo {
                    margin-top: 30px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    border: 1px solid #e8e2ed;
                    border-radius: 14px;
                    background: #ffffff;
                }

                .ironstore-beneficios-negocio__tipo span {
                    color: #4d4256;
                    font-size: 12px;
                    font-weight: 800;
                }

                .ironstore-beneficios-negocio__tipo i {
                    width: 20px;
                    height: 1px;
                    background: #c084fc;
                }

                .ironstore-beneficios-negocio__mais {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #7e22ce;
                    font-size: 30px;
                    font-weight: 500;
                }

                .ironstore-beneficios-negocio__integracao {
                    margin-top: 28px;
                    padding: 42px;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(350px, 0.75fr);
                    gap: 55px;
                    align-items: center;
                    border-radius: 25px;
                    background:
                        radial-gradient(
                            circle at 90% 10%,
                            rgba(168, 85, 247, 0.13),
                            transparent 35%
                        ),
                        #0d0715;
                }

                .ironstore-beneficios-negocio__integracao-mini {
                    color: #c084fc;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .ironstore-beneficios-negocio__integracao h3 {
                    margin: 14px 0 0;
                    color: #ffffff;
                    font-size: 30px;
                    line-height: 1.3;
                }

                .ironstore-beneficios-negocio__integracao p {
                    margin: 15px 0 0;
                    color: #998ba5;
                    font-size: 15px;
                    line-height: 1.8;
                }

                .ironstore-beneficios-negocio__integracao-etapas {
                    display: grid;
                    gap: 9px;
                }

                .ironstore-beneficios-negocio__integracao-etapas div {
                    padding: 14px 17px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 12px;
                    background: rgba(255,255,255,.035);
                }

                .ironstore-beneficios-negocio__integracao-etapas span {
                    color: #c084fc;
                    font-size: 10px;
                    font-weight: 900;
                }

                .ironstore-beneficios-negocio__integracao-etapas strong {
                    color: #e9e1ef;
                    font-size: 13px;
                }

                .ironstore-beneficios-negocio__taxa {
                    margin-top: 28px;
                    padding: 38px;
                    display: grid;
                    grid-template-columns: 220px minmax(0, 1fr);
                    gap: 45px;
                    align-items: center;
                    border: 1px solid #eadcf4;
                    border-radius: 24px;
                    background: #fcfaff;
                }

                .ironstore-beneficios-negocio__taxa-valor {
                    padding: 28px;
                    text-align: center;
                    border-radius: 18px;
                    background: #7e22ce;
                    color: #ffffff;
                }

                .ironstore-beneficios-negocio__taxa-valor span {
                    display: block;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .ironstore-beneficios-negocio__taxa-valor strong {
                    display: block;
                    margin-top: 6px;
                    font-size: 48px;
                    line-height: 1;
                }

                .ironstore-beneficios-negocio__taxa-conteudo h3 {
                    margin: 0;
                    color: #17101f;
                    font-size: 24px;
                }

                .ironstore-beneficios-negocio__taxa-conteudo p {
                    margin: 12px 0 0;
                    color: #6f6478;
                    line-height: 1.7;
                }

                .ironstore-beneficios-negocio__taxa-observacao {
                    display: block;
                    margin-top: 12px;
                    color: #95899e;
                    font-size: 12px;
                }

                @media (max-width: 800px) {
                    .ironstore-beneficios-negocio__comparacao {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }

                    .ironstore-beneficios-negocio__mais {
                        min-height: 40px;
                    }

                    .ironstore-beneficios-negocio__lado p {
                        min-height: 0;
                    }

                    .ironstore-beneficios-negocio__integracao {
                        grid-template-columns: 1fr;
                        gap: 35px;
                    }

                    .ironstore-beneficios-negocio__taxa {
                        grid-template-columns: 1fr;
                    }

                    .ironstore-beneficios-negocio__taxa-valor {
                        max-width: 220px;
                    }
                }

                @media (max-width: 600px) {
                    .ironstore-beneficios-negocio {
                        padding: 75px 18px;
                    }

                    .ironstore-beneficios-negocio__lado,
                    .ironstore-beneficios-negocio__integracao,
                    .ironstore-beneficios-negocio__taxa {
                        padding: 28px;
                    }

                    .ironstore-beneficios-negocio__tipo {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </>
    );
}