import React from "react";
import "./explicacao.css";

export default function AdministracaoExplicacao() {
    return (
        <section className="admin-sobre-hero-iron">
            <div className="admin-sobre-hero-iron__container">

                <div className="admin-sobre-hero-iron__conteudo">

                    <span className="admin-sobre-hero-iron__categoria">
                        MÓDULO ADMINISTRAÇÃO
                    </span>

                    <h1 className="admin-sobre-hero-iron__titulo">
                        A área de gestão do seu comércio dentro da
                        Iron Executions
                    </h1>

                    <p className="admin-sobre-hero-iron__descricao">
                        O módulo de Administração concentra as informações
                        utilizadas para acompanhar e administrar o funcionamento
                        do seu negócio.
                    </p>

                    <p className="admin-sobre-hero-iron__descricao-secundaria">
                        É nessa área que o responsável pelo comércio pode
                        acompanhar vendas, administrar produtos, trabalhar
                        com informações de funcionários e acessar dados
                        importantes para a gestão da empresa.
                    </p>

                    <div className="admin-sobre-hero-iron__destaques">

                        <div className="admin-sobre-hero-iron__destaque">
                            <strong>Vendas</strong>
                            <span>
                                Acompanhe informações das vendas registradas
                                pelo comércio.
                            </span>
                        </div>

                        <div className="admin-sobre-hero-iron__destaque">
                            <strong>Produtos</strong>
                            <span>
                                Gerencie informações dos produtos utilizados
                                na operação.
                            </span>
                        </div>

                        <div className="admin-sobre-hero-iron__destaque">
                            <strong>Funcionários</strong>
                            <span>
                                Mantenha a estrutura da equipe integrada
                                à gestão do comércio.
                            </span>
                        </div>

                    </div>

                </div>

                <aside className="admin-sobre-hero-iron__painel">

                    <div className="admin-sobre-hero-iron__painel-topo">
                        <span className="admin-sobre-hero-iron__painel-status" />

                        <span className="admin-sobre-hero-iron__painel-label">
                            ADMINISTRAÇÃO
                        </span>
                    </div>

                    <div className="admin-sobre-hero-iron__painel-corpo">

                        <span className="admin-sobre-hero-iron__painel-mini">
                            GESTÃO CENTRALIZADA
                        </span>

                        <h2 className="admin-sobre-hero-iron__painel-titulo">
                            Sua operação gera informações.
                            A Administração ajuda você a gerenciá-las.
                        </h2>

                        <p className="admin-sobre-hero-iron__painel-descricao">
                            O que acontece no comércio não precisa ficar
                            espalhado entre diferentes controles. A proposta
                            é reunir informações importantes dentro da mesma
                            estrutura de gestão.
                        </p>

                    </div>

                </aside>

            </div>
        </section>
    );
}