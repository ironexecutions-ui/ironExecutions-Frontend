import React, { useEffect, useState } from "react";

import { API_URL } from "../../config";

import "./supervisionar.css";


export default function Supervisionar() {

    const [supervisaoComercios, setSupervisaoComercios] = useState([]);

    const [supervisaoCarregando, setSupervisaoCarregando] = useState(true);

    const [supervisaoEntrandoId, setSupervisaoEntrandoId] = useState(null);

    const [supervisaoErro, setSupervisaoErro] = useState("");

    const [supervisaoBusca, setSupervisaoBusca] = useState("");

    const [supervisaoFiltroStatus, setSupervisaoFiltroStatus] = useState("todos");

    const [supervisaoAlterandoTesteId, setSupervisaoAlterandoTesteId] =
        useState(null);

    const [supervisaoAlterandoArquivadoId, setSupervisaoAlterandoArquivadoId] =
        useState(null);


    const token = localStorage.getItem("token");


    // =========================================================
    // FORMATAR CNPJ
    // =========================================================

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


    // =========================================================
    // CARREGAR COMÉRCIOS
    // =========================================================

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


    // =========================================================
    // ALTERAR MODO TESTE
    // =========================================================

    async function alterarModoTesteSupervisao(comercio) {

        if (supervisaoAlterandoTesteId !== null) {

            return;
        }

        if (supervisaoAlterandoArquivadoId !== null) {

            return;
        }

        setSupervisaoAlterandoTesteId(comercio.id);

        setSupervisaoErro("");

        const novoTeste =
            Number(comercio.teste) === 1
                ? 0
                : 1;

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/supervisionar/teste`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        comercio_id: comercio.id,
                        teste: novoTeste
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao alterar o modo de teste"
                );
            }

            setSupervisaoComercios(comercios =>
                comercios.map(item =>
                    item.id === comercio.id
                        ? {
                            ...item,
                            teste: novoTeste
                        }
                        : item
                )
            );

        } catch (error) {

            console.error(
                "[SUPERVISIONAR] Erro ao alterar teste:",
                error
            );

            setSupervisaoErro(
                error.message
            );

        } finally {

            setSupervisaoAlterandoTesteId(null);
        }
    }


    // =========================================================
    // ARQUIVAR / DESARQUIVAR
    // =========================================================

    async function alterarArquivadoSupervisao(comercio) {

        if (supervisaoAlterandoArquivadoId !== null) {

            return;
        }

        if (supervisaoAlterandoTesteId !== null) {

            return;
        }

        setSupervisaoAlterandoArquivadoId(comercio.id);

        setSupervisaoErro("");

        const novoArquivado =
            Number(comercio.arquivado) === 1
                ? 0
                : 1;

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/supervisionar/arquivado`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        comercio_id: comercio.id,
                        arquivado: novoArquivado
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao alterar o arquivamento"
                );
            }

            setSupervisaoComercios(comercios =>
                comercios.map(item =>
                    item.id === comercio.id
                        ? {
                            ...item,
                            arquivado: novoArquivado
                        }
                        : item
                )
            );

        } catch (error) {

            console.error(
                "[SUPERVISIONAR] Erro ao alterar arquivado:",
                error
            );

            setSupervisaoErro(
                error.message
            );

        } finally {

            setSupervisaoAlterandoArquivadoId(null);
        }
    }


    // =========================================================
    // ENTRAR NO COMÉRCIO
    // =========================================================

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

            const urlPerfil =
                `${window.location.origin}/ironbusiness/perfil`;

            window.open(
                urlPerfil,
                "_blank",
                "noopener,noreferrer"
            );

            setSupervisaoEntrandoId(null);

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


    // =========================================================
    // CARREGAMENTO INICIAL
    // =========================================================

    useEffect(() => {

        carregarComerciosSupervisao();

    }, []);


    // =========================================================
    // FILTRAR EMPRESAS
    // =========================================================

    const buscaNormalizada =
        supervisaoBusca
            .trim()
            .toLowerCase();


    const supervisaoComerciosFiltrados =
        supervisaoComercios.filter(comercio => {

            const nome =
                String(
                    comercio.loja || ""
                ).toLowerCase();

            const correspondeNome =
                !buscaNormalizada ||
                nome.includes(buscaNormalizada);

            if (!correspondeNome) {

                return false;
            }

            const arquivado =
                Number(comercio.arquivado) === 1;

            const teste =
                Number(comercio.teste) === 1;


            if (
                supervisaoFiltroStatus ===
                "normais"
            ) {

                return !arquivado && !teste;
            }


            if (
                supervisaoFiltroStatus ===
                "teste"
            ) {

                return !arquivado && teste;
            }


            if (
                supervisaoFiltroStatus ===
                "arquivados"
            ) {

                return arquivado;
            }


            return true;
        });


    // =========================================================
    // SEPARAR EMPRESAS POR GRUPO
    // =========================================================

    const supervisaoEmpresasNormais =
        supervisaoComerciosFiltrados.filter(
            comercio =>
                Number(comercio.arquivado) !== 1 &&
                Number(comercio.teste) !== 1
        );


    const supervisaoEmpresasTeste =
        supervisaoComerciosFiltrados.filter(
            comercio =>
                Number(comercio.arquivado) !== 1 &&
                Number(comercio.teste) === 1
        );


    const supervisaoEmpresasArquivadas =
        supervisaoComerciosFiltrados.filter(
            comercio =>
                Number(comercio.arquivado) === 1
        );


    // =========================================================
    // RENDERIZAR CARD
    // =========================================================

    function renderizarComercioSupervisao(comercio) {

        const entrando =
            supervisaoEntrandoId === comercio.id;

        const localizacao =
            comercio.cidade &&
                comercio.estado
                ? `${comercio.cidade} - ${comercio.estado}`
                : comercio.cidade ||
                comercio.estado ||
                "Localização não informada";


        const estaEmTeste =
            Number(comercio.teste) === 1;

        const estaArquivado =
            Number(comercio.arquivado) === 1;


        return (
            <div
                key={comercio.id}
                className={
                    entrando
                        ? "supervisao-empresa-card supervisao-empresa-card-entrando"
                        : "supervisao-empresa-card"
                }
            >

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


                <div className="supervisao-empresa-card-info">

                    <div className="supervisao-empresa-card-topo">

                        <span className="supervisao-empresa-card-id">
                            ID {comercio.id}
                        </span>

                        <span className="supervisao-empresa-card-estado">
                            {comercio.estado || "UF"}
                        </span>

                    </div>


                    {estaArquivado && (

                        <span className="supervisao-empresa-card-arquivado">
                            EMPRESA ARQUIVADA
                        </span>

                    )}


                    {!estaArquivado && estaEmTeste && (

                        <span className="supervisao-empresa-card-teste">
                            EMPRESA DE TESTE
                        </span>

                    )}


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


                    <div className="supervisao-empresa-card-acoes">

                        <button
                            type="button"
                            className={
                                estaEmTeste
                                    ? "supervisao-empresa-card-teste-acao supervisao-empresa-card-teste-acao-ativo"
                                    : "supervisao-empresa-card-teste-acao"
                            }
                            disabled={
                                supervisaoAlterandoTesteId !== null ||
                                supervisaoAlterandoArquivadoId !== null ||
                                supervisaoEntrandoId !== null
                            }
                            onDoubleClick={() =>
                                alterarModoTesteSupervisao(
                                    comercio
                                )
                            }
                            title="Clique duas vezes para alterar"
                        >

                            {supervisaoAlterandoTesteId === comercio.id

                                ? "Alterando..."

                                : estaEmTeste

                                    ? "Remover modo teste"

                                    : "Marcar como teste"
                            }

                        </button>


                        <button
                            type="button"
                            className={
                                estaArquivado
                                    ? "supervisao-empresa-card-arquivar-acao supervisao-empresa-card-arquivar-acao-ativo"
                                    : "supervisao-empresa-card-arquivar-acao"
                            }
                            disabled={
                                supervisaoAlterandoArquivadoId !== null ||
                                supervisaoAlterandoTesteId !== null ||
                                supervisaoEntrandoId !== null
                            }
                            onDoubleClick={() =>
                                alterarArquivadoSupervisao(
                                    comercio
                                )
                            }
                            title="Clique duas vezes para alterar"
                        >

                            {supervisaoAlterandoArquivadoId === comercio.id

                                ? "Alterando..."

                                : estaArquivado

                                    ? "Desarquivar"

                                    : "Arquivar"
                            }

                        </button>


                        <button
                            type="button"
                            className="supervisao-empresa-card-acao"
                            disabled={
                                supervisaoEntrandoId !== null
                            }
                            onClick={() =>
                                entrarComercioSupervisao(
                                    comercio
                                )
                            }
                        >

                            {entrando
                                ? "Entrando..."
                                : "Acessar empresa"
                            }

                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =========================================================
    // RENDERIZAR SEÇÃO
    // =========================================================

    function renderizarSecaoSupervisao(
        titulo,
        descricao,
        comercios,
        tipo
    ) {

        if (comercios.length === 0) {

            return null;
        }

        return (
            <section
                className={`supervisao-empresas-secao supervisao-empresas-secao-${tipo}`}
            >

                <div className="supervisao-empresas-secao-cabecalho">

                    <div>

                        <h2 className="supervisao-empresas-secao-titulo">
                            {titulo}
                        </h2>

                        <p className="supervisao-empresas-secao-descricao">
                            {descricao}
                        </p>

                    </div>

                    <span className="supervisao-empresas-secao-contador">
                        {comercios.length}
                    </span>

                </div>


                <div className="supervisao-empresas-grid">

                    {comercios.map(
                        renderizarComercioSupervisao
                    )}

                </div>

            </section>
        );
    }


    const existemEmpresasFiltradas =
        supervisaoComerciosFiltrados.length > 0;


    return (
        <div className="supervisao-empresas-container">

            {/* =====================================================
            CABEÇALHO
        ====================================================== */}

            <header className="supervisao-empresas-cabecalho">

                <div className="supervisao-empresas-cabecalho-conteudo">

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
                    {supervisaoCarregando
                        ? "Atualizando..."
                        : "Atualizar"
                    }
                </button>

            </header>


            {/* =====================================================
            FILTROS
        ====================================================== */}

            <section
                className="supervisao-empresas-filtros"
                aria-label="Filtros de empresas"
            >

                <div className="supervisao-empresas-busca-area">

                    <input
                        type="text"
                        value={supervisaoBusca}
                        onChange={(event) =>
                            setSupervisaoBusca(event.target.value)
                        }
                        placeholder="Filtrar por nome da empresa"
                        className="supervisao-empresas-busca"
                        aria-label="Filtrar por nome da empresa"
                    />

                </div>


                <select
                    value={supervisaoFiltroStatus}
                    onChange={(event) =>
                        setSupervisaoFiltroStatus(event.target.value)
                    }
                    className="supervisao-empresas-filtro-status"
                    aria-label="Filtrar empresas por status"
                >

                    <option value="todos">
                        Todas as empresas
                    </option>

                    <option value="normais">
                        Somente em Funcionamento
                    </option>

                    <option value="teste">
                        Somente modo teste
                    </option>

                    <option value="arquivados">
                        Somente arquivados
                    </option>

                </select>

            </section>


            {/* =====================================================
            ERRO
        ====================================================== */}

            {supervisaoErro && (

                <div
                    className="supervisao-empresas-erro"
                    role="alert"
                >
                    {supervisaoErro}
                </div>

            )}


            {/* =====================================================
            CARREGAMENTO
        ====================================================== */}

            {supervisaoCarregando && (

                <div
                    className="supervisao-empresas-carregando"
                    role="status"
                    aria-live="polite"
                >

                    <div
                        className="supervisao-empresas-spinner"
                        aria-hidden="true"
                    />

                    <span>
                        Carregando empresas...
                    </span>

                </div>

            )}


            {/* =====================================================
            LISTA DE EMPRESAS
        ====================================================== */}

            {!supervisaoCarregando &&
                existemEmpresasFiltradas && (

                    <main className="supervisao-empresas-lista-secoes">

                        {/* EMPRESAS NORMAIS */}

                        {(supervisaoFiltroStatus === "todos" ||
                            supervisaoFiltroStatus === "normais") && (

                                <section
                                    className="supervisao-empresas-secao supervisao-empresas-secao-normais"
                                >

                                    {renderizarSecaoSupervisao(
                                        "Empresas em funcionamento",
                                        "Empresas ativas que não estão em modo teste.",
                                        supervisaoEmpresasNormais,
                                        "normais"
                                    )}

                                </section>

                            )}


                        {/* EMPRESAS DE TESTE */}

                        {(supervisaoFiltroStatus === "todos" ||
                            supervisaoFiltroStatus === "teste") && (

                                <section
                                    className="supervisao-empresas-secao supervisao-empresas-secao-teste"
                                >

                                    {renderizarSecaoSupervisao(
                                        "Empresas de teste",
                                        "Empresas atualmente configuradas em modo teste.",
                                        supervisaoEmpresasTeste,
                                        "teste"
                                    )}

                                </section>

                            )}


                        {/* EMPRESAS ARQUIVADAS */}

                        {(supervisaoFiltroStatus === "todos" ||
                            supervisaoFiltroStatus === "arquivados") && (

                                <section
                                    className="supervisao-empresas-secao supervisao-empresas-secao-arquivados"
                                >

                                    {renderizarSecaoSupervisao(
                                        "Empresas arquivadas",
                                        "Empresas retiradas da organização principal.",
                                        supervisaoEmpresasArquivadas,
                                        "arquivados"
                                    )}

                                </section>

                            )}

                    </main>

                )
            }


            {/* =====================================================
            NENHUMA EMPRESA
        ====================================================== */}

            {!supervisaoCarregando &&
                !existemEmpresasFiltradas && (

                    <div
                        className="supervisao-empresas-vazio"
                        role="status"
                    >

                        <h2>
                            Nenhuma empresa encontrada
                        </h2>

                        <p>
                            {supervisaoComercios.length === 0
                                ? "Não existem registros em comercios_cadastradas."
                                : "Nenhuma empresa corresponde aos filtros selecionados."
                            }
                        </p>

                    </div>

                )
            }

        </div>
    );
}