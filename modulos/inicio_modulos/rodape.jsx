import React from "react";

import "./rodape.css";
import logoIronExecutions from "/favicon.png";

export default function Rodape() {

    const anoAtual = new Date().getFullYear();

    return (
        <footer className="iron-footer">

            {/* =========================================
                ÁREA PRINCIPAL
            ========================================= */}

            <div className="iron-footer__principal">

                <div className="iron-footer__conteudo">

                    {/* =================================
                        MARCA
                    ================================= */}

                    <div className="iron-footer__marca">

                        <div className="iron-footer__logo-area">

                            <div className="iron-footer__logo-brilho" />

                            <img
                                src={logoIronExecutions}
                                alt="Iron Executions"
                                className="iron-footer__logo"
                            />

                        </div>


                        <div className="iron-footer__marca-info">

                            <h2 className="iron-footer__nome">
                                Iron
                                <span>Executions</span>
                            </h2>

                            <p className="iron-footer__descricao">
                                Tecnologia criada para transformar
                                a gestão do seu negócio.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        MENSAGEM
                    ================================= */}

                    <div className="iron-footer__mensagem">

                 

                        <h3>
                            Seu comércio.
                            <br />
                            Mais simples.
                            <br />
                            Mais inteligente.
                        </h3>

                    </div>

                </div>

            </div>


            {/* =========================================
                FAIXA INFERIOR
            ========================================= */}

            <div className="iron-footer__inferior">

                <div className="iron-footer__inferior-conteudo">

                    <div className="iron-footer__copyright">

                        <strong>
                            © {anoAtual} Iron Executions
                        </strong>

                        <span>
                            Todos os direitos reservados.
                        </span>

                    </div>


                    <div className="iron-footer__sistema">

                        <span className="iron-footer__sistema-ponto" />

                      

                    </div>

                </div>

            </div>

        </footer>
    );

}