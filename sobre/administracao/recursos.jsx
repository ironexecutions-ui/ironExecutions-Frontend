import React from "react";
import "./recursos.css";

export default function AdministracaoRecursos() {
    return (
        <section className="admin-recursos-operacao-iron">
            <div className="admin-recursos-operacao-iron__container">

                <header className="admin-recursos-operacao-iron__cabecalho">

                    <span className="admin-recursos-operacao-iron__mini">
                        COMO FUNCIONA
                    </span>

                    <h2 className="admin-recursos-operacao-iron__titulo">
                        A operação acontece.
                        A Administração permite acompanhar e gerenciar.
                    </h2>

                    <p className="admin-recursos-operacao-iron__descricao">
                        A Administração não substitui o caixa. Ela possui
                        outra função dentro da Iron Executions: oferecer
                        uma área voltada à gestão das informações do comércio.
                    </p>

                </header>

                <div className="admin-recursos-operacao-iron__fluxo">

                    <article className="admin-recursos-operacao-iron__item">
                        <span className="admin-recursos-operacao-iron__numero">
                            01
                        </span>

                        <div>
                            <h3>O comércio realiza suas operações</h3>

                            <p>
                                Durante o funcionamento do estabelecimento,
                                vendas e outras atividades fazem parte da
                                rotina operacional da empresa.
                            </p>
                        </div>
                    </article>

                    <article className="admin-recursos-operacao-iron__item">
                        <span className="admin-recursos-operacao-iron__numero">
                            02
                        </span>

                        <div>
                            <h3>As informações ficam dentro do sistema</h3>

                            <p>
                                As informações utilizadas pela operação podem
                                fazer parte da mesma estrutura utilizada pela
                                gestão, evitando controles completamente
                                separados.
                            </p>
                        </div>
                    </article>

                    <article className="admin-recursos-operacao-iron__item">
                        <span className="admin-recursos-operacao-iron__numero">
                            03
                        </span>

                        <div>
                            <h3>A Administração entra na gestão</h3>

                            <p>
                                O responsável pelo comércio utiliza a área
                                administrativa para acompanhar e administrar
                                informações importantes da empresa.
                            </p>
                        </div>
                    </article>

                </div>

                <div className="admin-recursos-operacao-iron__areas">

                    <article className="admin-recursos-operacao-iron__area">
                        <span>VENDAS</span>

                        <h3>Acompanhe o que foi vendido</h3>

                        <p>
                            As vendas fazem parte das informações importantes
                            para a administração do comércio. O módulo permite
                            que a gestão tenha acesso a essa parte da operação.
                        </p>
                    </article>

                    <article className="admin-recursos-operacao-iron__area">
                        <span>PRODUTOS</span>

                        <h3>Administre o que sua empresa comercializa</h3>

                        <p>
                            Os produtos utilizados pelo comércio precisam
                            fazer parte de uma estrutura organizada. A área
                            administrativa permite trabalhar com essas
                            informações dentro do sistema.
                        </p>
                    </article>

                    <article className="admin-recursos-operacao-iron__area">
                        <span>FUNCIONÁRIOS</span>

                        <h3>Gestão também envolve sua equipe</h3>

                        <p>
                            Informações relacionadas aos funcionários fazem
                            parte da administração do estabelecimento e podem
                            ser mantidas dentro da estrutura de gestão.
                        </p>
                    </article>

                    <article className="admin-recursos-operacao-iron__area">
                        <span>NEGÓCIO</span>

                        <h3>Uma área voltada para quem administra</h3>

                        <p>
                            O objetivo é separar a rotina operacional das
                            funções administrativas sem separar as informações
                            que fazem parte do mesmo comércio.
                        </p>
                    </article>

                </div>

            </div>
        </section>
    );
}