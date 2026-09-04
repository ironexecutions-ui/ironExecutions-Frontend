import React from "react";
import "./beneficios.css";

export default function AdministracaoBeneficios() {
    return (
        <section className="admin-beneficios-gestao-iron">
            <div className="admin-beneficios-gestao-iron__container">

                <div className="admin-beneficios-gestao-iron__principal">

                    <span className="admin-beneficios-gestao-iron__mini">
                        OPERAÇÃO + GESTÃO
                    </span>

                    <h2 className="admin-beneficios-gestao-iron__titulo">
                        Quem está vendendo precisa operar.
                        Quem administra precisa enxergar o negócio.
                    </h2>

                    <p className="admin-beneficios-gestao-iron__descricao">
                        Por isso a Iron Executions separa a área operacional
                        da área administrativa. Cada parte do sistema pode
                        cumprir uma função diferente sem transformar as
                        informações do comércio em controles isolados.
                    </p>

                </div>

                <div className="admin-beneficios-gestao-iron__comparacao">

                    <div className="admin-beneficios-gestao-iron__coluna">
                        <span className="admin-beneficios-gestao-iron__rotulo">
                            NA OPERAÇÃO
                        </span>

                        <strong className="admin-beneficios-gestao-iron__nome">
                            O comércio trabalha
                        </strong>

                        <p className="admin-beneficios-gestao-iron__texto">
                            Vendas são realizadas, produtos fazem parte
                            do atendimento e funcionários utilizam o sistema
                            durante a rotina do estabelecimento.
                        </p>
                    </div>

                    <div className="admin-beneficios-gestao-iron__separador">
                        <span>+</span>
                    </div>

                    <div className="admin-beneficios-gestao-iron__coluna">
                        <span className="admin-beneficios-gestao-iron__rotulo">
                            NA ADMINISTRAÇÃO
                        </span>

                        <strong className="admin-beneficios-gestao-iron__nome">
                            O responsável gerencia
                        </strong>

                        <p className="admin-beneficios-gestao-iron__texto">
                            As informações importantes do negócio podem
                            ser acompanhadas e administradas em uma área
                            criada especificamente para gestão.
                        </p>
                    </div>

                </div>

                <div className="admin-beneficios-gestao-iron__resultado">

                    <div className="admin-beneficios-gestao-iron__resultado-marca">
                        <span />
                    </div>

                    <div className="admin-beneficios-gestao-iron__resultado-conteudo">

                        <span className="admin-beneficios-gestao-iron__resultado-mini">
                            O RESULTADO
                        </span>

                        <h3 className="admin-beneficios-gestao-iron__resultado-titulo">
                            A gestão deixa de ser uma parte desconectada
                            da operação.
                        </h3>

                        <p className="admin-beneficios-gestao-iron__resultado-texto">
                            O objetivo do módulo de Administração é permitir
                            que informações importantes geradas e utilizadas
                            pelo comércio façam parte de uma estrutura
                            organizada de gestão dentro da Iron Executions.
                        </p>

                    </div>

                </div>

            </div>
        </section>
    );
}