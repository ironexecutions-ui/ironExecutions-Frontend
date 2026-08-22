import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_URL } from "../../config";

import "./supervisionar.css";


export default function Supervisionar() {

    const navigate = useNavigate();

    const [supervisaoComercios, setSupervisaoComercios] = useState([]);
    const [supervisaoCarregando, setSupervisaoCarregando] = useState(true);
    const [supervisaoEntrandoId, setSupervisaoEntrandoId] = useState(null);
    const [supervisaoErro, setSupervisaoErro] = useState("");

    const token = localStorage.getItem("token");


    /* =====================================================
       FORMATAR CNPJ
    ===================================================== */

    function formatarCnpjSupervisao(cnpj) {

        if (!cnpj) {
            return "CNPJ não informado";
        }

        const numeros = String(cnpj).replace(/\D/g, "");

        if (numeros.length !== 14) {
            return cnpj;
        }

        return numeros.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            "$1.$2.$3/$4-$5"
        );
    }


    /* =====================================================
       CARREGAR COMÉRCIOS
    ===================================================== */

    async function carregarComerciosSupervisao() {

        setSupervisaoCarregando(true);
        setSupervisaoErro("");

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/supervisionar/comercios`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao carregar os comércios"
                );
            }

            setSupervisaoComercios(
                dados.comercios || []
            );

        } catch (error) {

            console.error(
                "[SUPERVISIONAR] Erro:",
                error
            );

            setSupervisaoErro(
                error.message
            );

        } finally {

            setSupervisaoCarregando(false);
        }
    }


    /* =====================================================
       ENTRAR NO COMÉRCIO
    ===================================================== */

    async function entrarComercioSupervisao(comercio) {

        if (supervisaoEntrandoId !== null) {
            return;
        }

        setSupervisaoEntrandoId(comercio.id);
        setSupervisaoErro("");

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/supervisionar/entrar`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        comercio_id: comercio.id
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao entrar no comércio"
                );
            }

            navigate(
                "/ironbusiness/perfil",
                {
                    replace: true
                }
            );

        } catch (error) {

            console.error(
                "[SUPERVISIONAR] Erro ao entrar:",
                error
            );

            setSupervisaoErro(
                error.message
            );

            setSupervisaoEntrandoId(null);
        }
    }


    /* =====================================================
       CARREGAMENTO INICIAL
    ===================================================== */

    useEffect(() => {

        carregarComerciosSupervisao();

    }, []);


    /* =====================================================
       RETURN
    ===================================================== */

    return (

        <div className="supervisao-empresas-container">

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="supervisao-empresas-cabecalho">

                <div>

                    <span className="supervisao-empresas-subtitulo">
                        Painel administrativo
                    </span>

                    <h1 className="supervisao-empresas-titulo">
                        Supervisionar empresas
                    </h1>

                    <p className="supervisao-empresas-descricao">
                        Selecione uma empresa para acessar o ambiente dela.
                    </p>

                </div>

                <button
                    type="button"
                    className="supervisao-empresas-atualizar"
                    onClick={carregarComerciosSupervisao}
                    disabled={
                        supervisaoCarregando ||
                        supervisaoEntrandoId !== null
                    }
                >
                    Atualizar
                </button>

            </div>


            {/* =================================================
                ERRO
            ================================================= */}

            {supervisaoErro && (

                <div className="supervisao-empresas-erro">
                    {supervisaoErro}
                </div>

            )}


            {/* =================================================
                CARREGANDO
            ================================================= */}

            {supervisaoCarregando && (

                <div className="supervisao-empresas-carregando">

                    <div className="supervisao-empresas-spinner" />

                    <span>
                        Carregando empresas...
                    </span>

                </div>

            )}


            {/* =================================================
                EMPRESAS
            ================================================= */}

            {!supervisaoCarregando && supervisaoComercios.length > 0 && (

                <div className="supervisao-empresas-grid">

                    {supervisaoComercios.map(comercio => {

                        const entrando =
                            supervisaoEntrandoId === comercio.id;

                        const localizacao =
                            comercio.cidade && comercio.estado
                                ? `${comercio.cidade} - ${comercio.estado}`
                                : comercio.cidade ||
                                comercio.estado ||
                                "Localização não informada";

                        return (

                            <div
                                key={comercio.id}
                                className={
                                    entrando
                                        ? "supervisao-empresa-card supervisao-empresa-card-entrando"
                                        : "supervisao-empresa-card"
                                }
                            >

                                {/* =========================================
                                    IMAGEM
                                ========================================= */}

                                <div className="supervisao-empresa-imagem-area">

                                    {comercio.imagem ? (

                                        <img
                                            src={comercio.imagem}
                                            alt={comercio.loja}
                                            className="supervisao-empresa-imagem"
                                            loading="lazy"
                                        />

                                    ) : (

                                        <div className="supervisao-empresa-imagem-placeholder">

                                            {comercio.loja
                                                ? comercio.loja
                                                    .charAt(0)
                                                    .toUpperCase()
                                                : "E"
                                            }

                                        </div>

                                    )}

                                </div>


                                {/* =========================================
                                    INFORMAÇÕES
                                ========================================= */}

                                <div className="supervisao-empresa-card-info">

                                    <div className="supervisao-empresa-card-topo">

                                        <span className="supervisao-empresa-card-id">
                                            ID {comercio.id}
                                        </span>

                                        <span className="supervisao-empresa-card-estado">
                                            {comercio.estado || "UF"}
                                        </span>

                                    </div>


                                    <strong className="supervisao-empresa-card-nome">
                                        {comercio.loja || "Empresa sem nome"}
                                    </strong>


                                    <div className="supervisao-empresa-detalhes">

                                        <div className="supervisao-empresa-detalhe-linha">

                                            <span className="supervisao-empresa-detalhe-label">
                                                CNPJ
                                            </span>

                                            <span className="supervisao-empresa-detalhe-valor">
                                                {formatarCnpjSupervisao(
                                                    comercio.cnpj
                                                )}
                                            </span>

                                        </div>


                                        <div className="supervisao-empresa-detalhe-linha">

                                            <span className="supervisao-empresa-detalhe-label">
                                                Local
                                            </span>

                                            <span className="supervisao-empresa-detalhe-valor">
                                                {localizacao}
                                            </span>

                                        </div>

                                    </div>


                                    {/* =====================================
                                        ACESSAR
                                    ===================================== */}

                                    <button
                                        type="button"
                                        className="supervisao-empresa-card-acao"
                                        disabled={
                                            supervisaoEntrandoId !== null
                                        }
                                        onClick={() =>
                                            entrarComercioSupervisao(comercio)
                                        }
                                    >

                                        {entrando
                                            ? "Entrando..."
                                            : "Acessar empresa"
                                        }

                                    </button>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}


            {/* =================================================
                NENHUMA EMPRESA
            ================================================= */}

            {!supervisaoCarregando &&
                supervisaoComercios.length === 0 && (

                    <div className="supervisao-empresas-vazio">

                        <h2>
                            Nenhuma empresa encontrada
                        </h2>

                        <p>
                            Não existem registros em comercios_cadastradas.
                        </p>

                    </div>

                )}

        </div>

    );
}