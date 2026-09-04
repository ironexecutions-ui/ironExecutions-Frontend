import React from "react";
import { Link, useParams } from "react-router-dom";

import HeaderInicio from "../modulos/inicio_modulos/headerinicio";
import Rodape from "../modulos/inicio_modulos/rodape";

/* =========================================================
   ADMINISTRAÇÃO
========================================================= */
import AdministracaoExplicacao from "./administracao/administracao";
import AdministracaoRecursos from "./administracao/recursos";
import AdministracaoBeneficios from "./administracao/beneficios";

/* =========================================================
   PRODUTIVIDADE
========================================================= */
import ProdutividadeExplicacao from "./produtividade/explicação";
import ProdutividadeRecursos from "./produtividade/recursos";
import ProdutividadeBeneficios from "./produtividade/beneficios";

/* =========================================================
   FISCAL
========================================================= */
import FiscalExplicacao from "./fiscal/explicacao";
import FiscalRecursos from "./fiscal/recursos";
import FiscalBeneficios from "./fiscal/beneficios";

/* =========================================================
   IRONSTORE
========================================================= */
import IronStoreExplicacao from "./ironstore/explicacao";
import IronStoreRecursos from "./ironstore/recursos";
import IronStoreBeneficios from "./ironstore/beneficios";

/* =========================================================
   RIFA
========================================================= */
import RifaExplicacao from "./rifa/explicacao";
import RifaRecursos from "./rifa/recursos";
import RifaBeneficios from "./rifa/beneficios";

import "./sobre.css";

export default function Sobregeral() {

    const { modulo } = useParams();

    const moduloAtual = decodeURIComponent(modulo || "")
        .replace(/\+/g, " ")
        .trim()
        .toLowerCase();

    function renderizarModulo() {

        /* =====================================================
           ADMINISTRAÇÃO
        ===================================================== */
        if (
            moduloAtual === "administração" ||
            moduloAtual === "administracao"
        ) {
            return (
                <div className="sobre-modulo-administracao-pagina-ie">
                    <AdministracaoExplicacao />
                    <AdministracaoRecursos />
                    <AdministracaoBeneficios />
                </div>
            );
        }

        /* =====================================================
           PRODUTIVIDADE
        ===================================================== */
        if (
            moduloAtual === "produtividade caixa" ||
            moduloAtual === "produtividade" ||
            moduloAtual === "caixa"
        ) {
            return (
                <div className="sobre-modulo-produtividade-pagina-ie">
                    <ProdutividadeExplicacao />
                    <ProdutividadeRecursos />
                    <ProdutividadeBeneficios />
                </div>
            );
        }

        /* =====================================================
           FISCAL
        ===================================================== */
        if (moduloAtual === "fiscal") {
            return (
                <div className="sobre-modulo-fiscal-pagina-ie">
                    <FiscalExplicacao />
                    <FiscalRecursos />
                    <FiscalBeneficios />
                </div>
            );
        }

        /* =====================================================
           IRONSTORE
        ===================================================== */
        if (
            moduloAtual === "ironstore" ||
            moduloAtual === "iron store"
        ) {
            return (
                <div className="sobre-modulo-ironstore-pagina-ie">
                    <IronStoreExplicacao />
                    <IronStoreRecursos />
                    <IronStoreBeneficios />
                </div>
            );
        }

        /* =====================================================
           RIFA
        ===================================================== */
        if (
            moduloAtual === "rifa" ||
            moduloAtual === "rifas"
        ) {
            return (
                <div className="sobre-modulo-rifa-pagina-ie">
                    <RifaExplicacao />
                    <RifaRecursos />
                    <RifaBeneficios />
                </div>
            );
        }

        /* =====================================================
           NÃO ENCONTRADO
        ===================================================== */
        return (
            <section className="sobre-modulo-nao-encontrado-ie">

                <div className="sobre-modulo-nao-encontrado-ie__conteudo">

                    <span className="sobre-modulo-nao-encontrado-ie__codigo">
                        404
                    </span>

                    <h1 className="sobre-modulo-nao-encontrado-ie__titulo">
                        Módulo não encontrado
                    </h1>

                    <p className="sobre-modulo-nao-encontrado-ie__descricao">
                        Não encontramos informações para o módulo solicitado.
                    </p>

                    <Link
                        to="/"
                        className="sobre-modulo-nao-encontrado-ie__botao"
                    >
                        Voltar para o início
                    </Link>

                </div>

            </section>
        );
    }

    return (
        <div className="sobre-modulo-pagina-principal-ie">

            <main className="sobre-modulo-conteudo-principal-ie">
                {renderizarModulo()}
            </main>

            <Rodape />

            {/* BOTÃO FIXO PARA VOLTAR AO INÍCIO */}
            <Link
                to="/"
                className="sobre-modulo-botao-flutuante-inicio-ie"
                aria-label="Voltar para o início"
                title="Voltar para o início"
            >
                <img
                    src="/favicon.png"
                    alt="Iron Executions"
                    className="sobre-modulo-botao-flutuante-inicio-ie__imagem"
                />
            </Link>

        </div>
    );
}