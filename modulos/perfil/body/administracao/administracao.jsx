import React, { useEffect, useState } from "react";

import "./administracao.css";

import GraficosVendas from "./componentes/graficovendas";
import AnaliseProdutos from "./componentes/analiseprodutos";
import ResumoProdutos from "./componentes/resumoprodutos";
import HistoricoVendas from "./componentes/historicovendas";
import FechamentoCaixa from "./componentes/fechamentocaixa";
import Reposicao from "./componentes/reposicao";
import Pendencias from "./componentes/pendencias";
import Promocoes from "./componentes/promocoes";

import { API_URL } from "../../../../config";

export default function Administracao() {

    const [abaAtiva, setAbaAtiva] = useState("resumo");

    const [mostrarParceria, setMostrarParceria] = useState(false);

    const [permitePromocoes, setPermitePromocoes] = useState(false);

    /*
    =========================================================
    VERIFICAR COMÉRCIO
    =========================================================
    */

    useEffect(() => {

        async function verificarComercio() {

            try {

                const token = localStorage.getItem("token");

                if (!token) return;

                const res = await fetch(
                    `${API_URL}/retorno/me`,
                    {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    }
                );

                if (!res.ok) {

                    console.error(
                        "Erro ao buscar dados do comércio:",
                        res.status
                    );

                    return;
                }

                const cliente = await res.json();

                if (
                    [25, 11, 28].includes(
                        Number(cliente?.comercio_id)
                    )
                ) {

                    setMostrarParceria(true);

                }

            } catch (err) {

                console.error(
                    "Erro ao verificar comercio_id",
                    err
                );

            }

        }

        verificarComercio();

    }, []);

    /*
    =========================================================
    VERIFICAR SE O COMÉRCIO ACEITA PROMOÇÕES
    =========================================================
    */

    useEffect(() => {

        async function verificarPromocoes() {

            try {

                const token = localStorage.getItem("token");

                if (!token) {

                    setPermitePromocoes(false);
                    return;

                }

                const resposta = await fetch(
                    `${API_URL}/comercio/promocoes`,
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!resposta.ok) {

                    console.error(
                        "[PROMOÇÕES] Erro ao verificar permissão:",
                        resposta.status
                    );

                    setPermitePromocoes(false);

                    return;

                }

                const dados = await resposta.json();

                const permitido =
                    Number(dados?.promocoes) === 1;

                setPermitePromocoes(permitido);

                console.log(
                    "[PROMOÇÕES] Disponível:",
                    permitido
                );

            } catch (erro) {

                console.error(
                    "[PROMOÇÕES] Erro ao consultar configuração:",
                    erro
                );

                setPermitePromocoes(false);

            }

        }

        verificarPromocoes();

    }, []);

    /*
    =========================================================
    PARCERIA
    =========================================================
    */

    function irParaParceria() {

        window.open(
            "https://ironexecutions.com.br/parceria",
            "_blank",
            "noopener,noreferrer"
        );

    }

    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (

        <div className="administracao-container">

            <h3>
                Área de Administração
            </h3>

            <div className="administracao-botoes">

                <button
                    className={
                        abaAtiva === "graficos"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setAbaAtiva("graficos")
                    }
                >
                    Gráficos
                </button>

                <button
                    className={
                        abaAtiva === "analise"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setAbaAtiva("analise")
                    }
                >
                    Análise de Produtos
                </button>

                <button
                    className={
                        abaAtiva === "resumo"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setAbaAtiva("resumo")
                    }
                >
                    Lista Produtos
                </button>

                <button
                    className={
                        abaAtiva === "historico"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setAbaAtiva("historico")
                    }
                >
                    Histórico de Vendas
                </button>

                <button
                    className={
                        abaAtiva === "reposicao"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setAbaAtiva("reposicao")
                    }
                >
                    Reposição
                </button>

                <button
                    className={
                        abaAtiva === "pendencias"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setAbaAtiva("pendencias")
                    }
                >
                    Pendências
                </button>
                {/* =============================================
                    PROMOÇÕES
                    SÓ APARECE QUANDO promocoes = 1
                ============================================= */}

                {permitePromocoes && (

                    <button
                        className={
                            abaAtiva === "promocoes"
                                ? "ativo"
                                : ""
                        }
                        onClick={() =>
                            setAbaAtiva("promocoes")
                        }
                    >
                        Promoções
                    </button>

                )}
                <button
                    className={
                        abaAtiva === "fechamento"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setAbaAtiva("fechamento")
                    }
                >
                    Fechamento de Caixa
                </button>



            </div>

            <div className="administracao-conteudo">

                {abaAtiva === "graficos" && (
                    <GraficosVendas />
                )}

                {abaAtiva === "analise" && (
                    <AnaliseProdutos />
                )}

                {abaAtiva === "resumo" && (
                    <ResumoProdutos />
                )}

                {abaAtiva === "historico" && (
                    <HistoricoVendas />
                )}

                {abaAtiva === "reposicao" && (
                    <Reposicao />
                )}

                {abaAtiva === "pendencias" && (
                    <Pendencias />
                )}

                {abaAtiva === "fechamento" && (
                    <FechamentoCaixa />
                )}

                {abaAtiva === "promocoes" && permitePromocoes && (
                    <Promocoes />
                )}

            </div>

        </div>

    );

}