import React from "react";

export default function IronStoreRecursos() {
    return (
        <>
            <section className="ironstore-recursos-venda">
                <div className="ironstore-recursos-venda__container">

                    <header className="ironstore-recursos-venda__cabecalho">

                        <span className="ironstore-recursos-venda__mini">
                            DA VITRINE AO PEDIDO
                        </span>

                        <h2 className="ironstore-recursos-venda__titulo">
                            Não é apenas uma página mostrando produtos.
                            É um canal de vendas para o seu comércio.
                        </h2>

                        <p className="ironstore-recursos-venda__descricao">
                            A IronStore reúne as etapas necessárias para que
                            um cliente encontre um produto, realize sua compra
                            pela internet e gere um pedido que possa continuar
                            sendo processado pelo estabelecimento.
                        </p>

                    </header>

                    <div className="ironstore-recursos-venda__grade">

                        <article className="ironstore-recursos-venda__card">
                            <span className="ironstore-recursos-venda__numero">
                                01
                            </span>

                            <span className="ironstore-recursos-venda__categoria">
                                VITRINE
                            </span>

                            <h3>Produtos disponíveis online</h3>

                            <p>
                                O cliente pode acessar a loja do comércio e
                                visualizar os produtos disponibilizados para
                                venda, com as informações necessárias para
                                conhecer e escolher o que deseja comprar.
                            </p>
                        </article>

                        <article className="ironstore-recursos-venda__card">
                            <span className="ironstore-recursos-venda__numero">
                                02
                            </span>

                            <span className="ironstore-recursos-venda__categoria">
                                CARRINHO
                            </span>

                            <h3>O cliente monta sua compra</h3>

                            <p>
                                Os produtos escolhidos podem ser reunidos no
                                carrinho para que o cliente organize os itens
                                e quantidades antes de continuar com o pedido.
                            </p>
                        </article>

                        <article className="ironstore-recursos-venda__card">
                            <span className="ironstore-recursos-venda__numero">
                                03
                            </span>

                            <span className="ironstore-recursos-venda__categoria">
                                PAGAMENTO
                            </span>

                            <h3>A compra continua pela própria loja</h3>

                            <p>
                                Depois de escolher os produtos, o cliente
                                continua o processo de compra e realiza o
                                pagamento utilizando as opções disponibilizadas
                                pela operação da IronStore.
                            </p>
                        </article>

                        <article className="ironstore-recursos-venda__card">
                            <span className="ironstore-recursos-venda__numero">
                                04
                            </span>

                            <span className="ironstore-recursos-venda__categoria">
                                PEDIDO
                            </span>

                            <h3>A venda chega ao comércio</h3>

                            <p>
                                Depois da compra, o pedido passa a fazer parte
                                da operação do estabelecimento para que o
                                comércio possa acompanhar o que foi vendido
                                e dar continuidade ao atendimento.
                            </p>
                        </article>

                        <article className="ironstore-recursos-venda__card">
                            <span className="ironstore-recursos-venda__numero">
                                05
                            </span>

                            <span className="ironstore-recursos-venda__categoria">
                                PREPARAÇÃO
                            </span>

                            <h3>O comércio acompanha o pedido</h3>

                            <p>
                                A venda online não termina no pagamento.
                                O estabelecimento precisa preparar o pedido
                                e acompanhar as etapas necessárias antes
                                de enviá-lo ao cliente.
                            </p>
                        </article>

                        <article className="ironstore-recursos-venda__card">
                            <span className="ironstore-recursos-venda__numero">
                                06
                            </span>

                            <span className="ironstore-recursos-venda__categoria">
                                ENTREGA
                            </span>

                            <h3>Da loja até o cliente</h3>

                            <p>
                                A entrega faz parte do fluxo da venda online.
                                O pedido pode continuar sendo acompanhado
                                durante o processo de envio até a conclusão
                                da compra.
                            </p>
                        </article>

                    </div>

                    <div className="ironstore-recursos-venda__fluxo">

                        <span className="ironstore-recursos-venda__fluxo-mini">
                            UMA ÚNICA JORNADA
                        </span>

                        <div className="ironstore-recursos-venda__fluxo-itens">

                            <strong>Produto</strong>
                            <span>→</span>

                            <strong>Carrinho</strong>
                            <span>→</span>

                            <strong>Compra</strong>
                            <span>→</span>

                            <strong>Pedido</strong>
                            <span>→</span>

                            <strong>Preparação</strong>
                            <span>→</span>

                            <strong>Entrega</strong>

                        </div>

                    </div>

                </div>
            </section>

            <style>{`
                .ironstore-recursos-venda {
                    width: 100%;
                    padding: 105px 24px;
                    box-sizing: border-box;
                    background: #faf9fc;
                }

                .ironstore-recursos-venda__container {
                    width: 100%;
                    max-width: 1220px;
                    margin: 0 auto;
                }

                .ironstore-recursos-venda__cabecalho {
                    max-width: 880px;
                }

                .ironstore-recursos-venda__mini {
                    color: #7e22ce;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1.8px;
                }

                .ironstore-recursos-venda__titulo {
                    margin: 18px 0 0;
                    color: #17101f;
                    font-size: clamp(35px, 4.5vw, 55px);
                    line-height: 1.08;
                    letter-spacing: -2px;
                }

                .ironstore-recursos-venda__descricao {
                    max-width: 770px;
                    margin: 23px 0 0;
                    color: #6f6478;
                    font-size: 18px;
                    line-height: 1.8;
                }

                .ironstore-recursos-venda__grade {
                    margin-top: 65px;
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                }

                .ironstore-recursos-venda__card {
                    min-width: 0;
                    padding: 32px;
                    border: 1px solid #e8e2ed;
                    border-radius: 21px;
                    background: #ffffff;
                    transition:
                        transform 0.25s ease,
                        border-color 0.25s ease;
                }

                .ironstore-recursos-venda__card:hover {
                    transform: translateY(-4px);
                    border-color: #d8b4fe;
                }

                .ironstore-recursos-venda__numero {
                    display: block;
                    color: #a855f7;
                    font-size: 11px;
                    font-weight: 900;
                }

                .ironstore-recursos-venda__categoria {
                    display: block;
                    margin-top: 30px;
                    color: #7e22ce;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 1.6px;
                }

                .ironstore-recursos-venda__card h3 {
                    margin: 10px 0 0;
                    color: #17101f;
                    font-size: 21px;
                    line-height: 1.3;
                }

                .ironstore-recursos-venda__card p {
                    margin: 13px 0 0;
                    color: #746a7c;
                    font-size: 14px;
                    line-height: 1.75;
                }

                .ironstore-recursos-venda__fluxo {
                    margin-top: 30px;
                    padding: 32px;
                    border-radius: 20px;
                    background: #110a1a;
                }

                .ironstore-recursos-venda__fluxo-mini {
                    display: block;
                    margin-bottom: 22px;
                    color: #c084fc;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.7px;
                }

                .ironstore-recursos-venda__fluxo-itens {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    overflow-x: auto;
                }

                .ironstore-recursos-venda__fluxo-itens strong {
                    flex: 0 0 auto;
                    color: #ffffff;
                    font-size: 14px;
                }

                .ironstore-recursos-venda__fluxo-itens span {
                    flex: 0 0 auto;
                    color: #80549e;
                }

                @media (max-width: 900px) {
                    .ironstore-recursos-venda__grade {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 600px) {
                    .ironstore-recursos-venda {
                        padding: 75px 18px;
                    }

                    .ironstore-recursos-venda__grade {
                        grid-template-columns: 1fr;
                    }

                    .ironstore-recursos-venda__card {
                        padding: 27px;
                    }
                }
            `}</style>
        </>
    );
}