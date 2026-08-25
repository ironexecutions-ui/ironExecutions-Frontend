import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import "./painelg.css";
import Supervisionar from "./supervisionar";
export default function PainelG() {

    const [painelGSecaoAtiva, setPainelGSecaoAtiva] = useState("supervisionar");
    const [painelGTabelas, setPainelGTabelas] = useState([]);
    const [painelGTabelaSelecionada, setPainelGTabelaSelecionada] = useState("");
    const [painelGCelulaEditando, setPainelGCelulaEditando] = useState(null);
    const [painelGValorEdicao, setPainelGValorEdicao] = useState("");
    const [painelGSalvandoCelula, setPainelGSalvandoCelula] = useState(false);
    const [painelGColunas, setPainelGColunas] = useState([]);
    const [painelGLinhas, setPainelGLinhas] = useState([]);

    const [painelGCarregando, setPainelGCarregando] = useState(false);
    const [painelGErro, setPainelGErro] = useState("");
    const [painelGFiltroTabela, setPainelGFiltroTabela] = useState("");
    const [painelGSql, setPainelGSql] = useState("");
    const [painelGResultadoSql, setPainelGResultadoSql] = useState(null);
    const [painelGTabelasFixadas, setPainelGTabelasFixadas] = useState([]);
    const [painelGMostrarTodasTabelas, setPainelGMostrarTodasTabelas] = useState(false);
    const [painelGAlterandoFixada, setPainelGAlterandoFixada] = useState("");
    const token = localStorage.getItem("token");


    /* =====================================================
       HEADERS
    ===================================================== */

    function headersPainelG() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        };
    }


    /* =====================================================
       CARREGAR TABELAS
    ===================================================== */

    async function carregarTabelasPainelG() {

        setPainelGCarregando(true);
        setPainelGErro("");

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/tabelas`,
                {
                    headers: headersPainelG()
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Erro ao carregar tabelas"
                );
            }

            setPainelGTabelas(dados.tabelas || []);

        } catch (error) {

            console.error(error);

            setPainelGErro(error.message);

        } finally {

            setPainelGCarregando(false);

        }
    }


    /* =====================================================
       ABRIR TABELA
    ===================================================== */

    async function abrirTabelaPainelG(nomeTabela) {

        setPainelGTabelaSelecionada(nomeTabela);

        setPainelGCarregando(true);
        setPainelGErro("");

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/tabela/${encodeURIComponent(nomeTabela)}`,
                {
                    headers: headersPainelG()
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Erro ao abrir tabela"
                );
            }

            setPainelGColunas(dados.colunas || []);
            setPainelGLinhas(dados.linhas || []);

        } catch (error) {

            console.error(error);

            setPainelGErro(error.message);

        } finally {

            setPainelGCarregando(false);

        }
    }


    /* =====================================================
       EXECUTAR SQL
    ===================================================== */

    async function executarSqlPainelG() {

        if (!painelGSql.trim()) {
            return;
        }

        setPainelGCarregando(true);
        setPainelGErro("");
        setPainelGResultadoSql(null);

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/sql`,
                {
                    method: "POST",
                    headers: headersPainelG(),
                    body: JSON.stringify({
                        sql: painelGSql
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Erro ao executar SQL"
                );
            }

            setPainelGResultadoSql(dados);

            await carregarTabelasPainelG();

        } catch (error) {

            console.error(error);

            setPainelGErro(error.message);

        } finally {

            setPainelGCarregando(false);

        }
    }
    /* =====================================================
       INICIAR EDIÇÃO DE CÉLULA
    ===================================================== */

    function iniciarEdicaoCelulaPainelG(linha, coluna, indexLinha) {

        const colunaPrimaria = painelGColunas.find(
            item => item.Key === "PRI"
        );

        if (!colunaPrimaria) {
            setPainelGErro(
                "Essa tabela não possui chave primária. Não é possível editar células com segurança."
            );
            return;
        }

        const valorAtual = linha[coluna.Field];

        setPainelGCelulaEditando({
            indexLinha,
            coluna: coluna.Field,
            colunaId: colunaPrimaria.Field,
            valorId: linha[colunaPrimaria.Field],
            valorOriginal: valorAtual
        });

        setPainelGValorEdicao(
            valorAtual === null
                ? ""
                : String(valorAtual)
        );
    }

    /* =====================================================
       COPIAR ESTRUTURA DA TABELA
    ===================================================== */

    async function copiarEstruturaTabelaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        if (!painelGColunas.length) {
            setPainelGErro("A tabela não possui colunas carregadas.");
            return;
        }

        const estruturaColunas = painelGColunas
            .map(coluna => {

                let descricao = `${coluna.Field}: ${coluna.Type}`;

                if (coluna.Key === "PRI") {
                    descricao += " PRIMARY KEY";
                }

                return descricao;
            })
            .join("\n");

        const conteudo = [
            `Tabela: ${painelGTabelaSelecionada}`,
            "",
            "Colunas:",
            estruturaColunas
        ].join("\n");

        try {

            await navigator.clipboard.writeText(conteudo);

        } catch (error) {

            console.error(
                "[PAINEL] Erro ao copiar estrutura:",
                error
            );

            setPainelGErro(
                "Não foi possível copiar a estrutura da tabela."
            );
        }
    }
    /* =====================================================
       CANCELAR EDIÇÃO
    ===================================================== */

    function cancelarEdicaoCelulaPainelG() {

        setPainelGCelulaEditando(null);
        setPainelGValorEdicao("");
    }


    /* =====================================================
       SALVAR CÉLULA
    ===================================================== */

    async function salvarCelulaPainelG() {

        if (!painelGCelulaEditando) {
            return;
        }

        setPainelGSalvandoCelula(true);
        setPainelGErro("");

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/celula`,
                {
                    method: "PUT",
                    headers: headersPainelG(),
                    body: JSON.stringify({
                        tabela: painelGTabelaSelecionada,
                        coluna: painelGCelulaEditando.coluna,
                        coluna_id: painelGCelulaEditando.colunaId,
                        valor_id: painelGCelulaEditando.valorId,
                        valor: painelGValorEdicao
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Erro ao atualizar célula"
                );
            }

            setPainelGLinhas(linhasAnteriores =>
                linhasAnteriores.map((linha, index) => {

                    if (index !== painelGCelulaEditando.indexLinha) {
                        return linha;
                    }

                    return {
                        ...linha,
                        [painelGCelulaEditando.coluna]: painelGValorEdicao
                    };
                })
            );

            setPainelGCelulaEditando(null);
            setPainelGValorEdicao("");

        } catch (error) {

            console.error(
                "[PAINEL] Erro ao editar célula:",
                error
            );

            setPainelGErro(error.message);

        } finally {

            setPainelGSalvandoCelula(false);

        }
    }
    /* =====================================================
       CARREGAR TABELAS FIXADAS
    ===================================================== */

    async function carregarTabelasFixadasPainelG() {

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/tabelas-fixadas`,
                {
                    headers: headersPainelG()
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Erro ao carregar tabelas fixadas"
                );
            }

            setPainelGTabelasFixadas(
                dados.tabelas || []
            );

        } catch (error) {

            console.error(
                "[PAINEL] Erro tabelas fixadas:",
                error
            );

            setPainelGErro(
                error.message
            );
        }
    }


    /* =====================================================
       VERIFICAR SE ESTÁ FIXADA
    ===================================================== */

    function tabelaEstaFixadaPainelG(nomeTabela) {

        return painelGTabelasFixadas.some(
            item =>
                item.tabela_nome === nomeTabela
        );
    }


    /* =====================================================
       FIXAR TABELA
    ===================================================== */

    async function fixarTabelaPainelG(nomeTabela) {

        if (painelGAlterandoFixada) {
            return;
        }

        setPainelGAlterandoFixada(nomeTabela);
        setPainelGErro("");

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/tabelas-fixadas`,
                {
                    method: "POST",

                    headers: headersPainelG(),

                    body: JSON.stringify({
                        tabela_nome: nomeTabela
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao fixar tabela"
                );
            }

            await carregarTabelasFixadasPainelG();

        } catch (error) {

            console.error(
                "[PAINEL] Erro ao fixar:",
                error
            );

            setPainelGErro(
                error.message
            );

        } finally {

            setPainelGAlterandoFixada("");
        }
    }


    /* =====================================================
       DESAFIXAR TABELA
    ===================================================== */

    async function desafixarTabelaPainelG(nomeTabela) {

        if (painelGAlterandoFixada) {
            return;
        }

        setPainelGAlterandoFixada(nomeTabela);
        setPainelGErro("");

        try {

            const resposta = await fetch(
                `${API_URL}/panel/database/tabelas-fixadas/${encodeURIComponent(nomeTabela)}`,
                {
                    method: "DELETE",
                    headers: headersPainelG()
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao desafixar tabela"
                );
            }

            await carregarTabelasFixadasPainelG();

        } catch (error) {

            console.error(
                "[PAINEL] Erro ao desafixar:",
                error
            );

            setPainelGErro(
                error.message
            );

        } finally {

            setPainelGAlterandoFixada("");
        }
    }
    /* =====================================================
       CARREGAMENTO INICIAL
    ===================================================== */

    useEffect(() => {

        carregarTabelasPainelG();
        carregarTabelasFixadasPainelG();

    }, []);
    /* =====================================================
       NOME DA ABA DO NAVEGADOR
    ===================================================== */

    useEffect(() => {

        const titulosPainelG = {
            tabelas: "Tabelas",
            sql: "Terminal SQL",
            supervisionar: "Supervisionar"
        };

        document.title =
            titulosPainelG[painelGSecaoAtiva] || "Painel";

    }, [painelGSecaoAtiva]);

    /* =====================================================
       RETURN
    ===================================================== */
    const painelGTabelasVisiveis =
        painelGMostrarTodasTabelas
            ? painelGTabelas
            : painelGTabelas.filter(
                tabela =>
                    tabelaEstaFixadaPainelG(tabela)
            );


    const painelGTabelasFiltradas =
        painelGTabelasVisiveis.filter(
            tabela =>
                tabela
                    .toLowerCase()
                    .includes(
                        painelGFiltroTabela
                            .trim()
                            .toLowerCase()
                    )
        );


    /* =====================================================
ATALHOS SQL DA TABELA
===================================================== */

    function abrirSqlProntoPainelG(sql) {
        setPainelGSql(sql);
        setPainelGSecaoAtiva("sql");
    }


    /* =====================================================
       COPIAR DADOS DA TABELA
    ===================================================== */

    async function copiarDadosTabelaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        const colunas = painelGColunas.map(coluna => coluna.Field);

        const dados = painelGLinhas.map(linha => {

            const objeto = {};

            colunas.forEach(coluna => {
                objeto[coluna] = linha[coluna];
            });

            return objeto;
        });

        const conteudo = JSON.stringify(
            {
                tabela: painelGTabelaSelecionada,
                colunas: colunas,
                dados: dados
            },
            null,
            2
        );

        try {

            await navigator.clipboard.writeText(conteudo);

        } catch (error) {

            console.error(
                "[PAINEL] Erro ao copiar dados:",
                error
            );

            setPainelGErro("Não foi possível copiar os dados.");
        }
    }


    /* =====================================================
       SELECT * FROM
    ===================================================== */

    function gerarSelectTabelaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        abrirSqlProntoPainelG(
            `SELECT * FROM \`${painelGTabelaSelecionada}\`;`
        );
    }


    /* =====================================================
       APAGAR LINHA PELO ID
    ===================================================== */

    function gerarDeleteLinhaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        const colunaPrimaria = painelGColunas.find(
            coluna => coluna.Key === "PRI"
        );

        const colunaId = colunaPrimaria
            ? colunaPrimaria.Field
            : "id";

        abrirSqlProntoPainelG(
            `DELETE FROM \`${painelGTabelaSelecionada}\`\nWHERE \`${colunaId}\` = 00;`
        );
    }


    /* =====================================================
       ADICIONAR COLUNA TEXT
    ===================================================== */

    function gerarAdicionarColunaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        abrirSqlProntoPainelG(
            `ALTER TABLE \`${painelGTabelaSelecionada}\`\nADD COLUMN \`nova\` TEXT;`
        );
    }


    /* =====================================================
       APAGAR COLUNA
    ===================================================== */

    function gerarApagarColunaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        abrirSqlProntoPainelG(
            `ALTER TABLE \`${painelGTabelaSelecionada}\`\nDROP COLUMN \`nome_coluna\`;`
        );
    }


    /* =====================================================
       RENOMEAR COLUNA
    ===================================================== */

    function gerarRenomearColunaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        abrirSqlProntoPainelG(
            `ALTER TABLE \`${painelGTabelaSelecionada}\`\nRENAME COLUMN \`nome_atual\` TO \`novo_nome\`;`
        );
    }


    /* =====================================================
       CONTAR LINHAS
    ===================================================== */

    function gerarContarLinhasPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        abrirSqlProntoPainelG(
            `SELECT COUNT(*) AS total FROM \`${painelGTabelaSelecionada}\`;`
        );
    }


    /* =====================================================
       LIMPAR TODAS AS LINHAS
    ===================================================== */

    function gerarLimparTabelaPainelG() {

        if (!painelGTabelaSelecionada) {
            return;
        }

        abrirSqlProntoPainelG(
            `DELETE FROM \`${painelGTabelaSelecionada}\`;`
        );
    }
    return (

        <div className="painel-g-administrador-container">

            {/* MENU */}

            <div className="painel-g-administrador-menu">

                <button
                    type="button"
                    className={
                        painelGSecaoAtiva === "tabelas"
                            ? "painel-g-menu-botao painel-g-menu-botao-ativo"
                            : "painel-g-menu-botao"
                    }
                    onClick={() =>
                        setPainelGSecaoAtiva("tabelas")
                    }
                >
                    Tabelas
                </button>


                <button
                    type="button"
                    className={
                        painelGSecaoAtiva === "sql"
                            ? "painel-g-menu-botao painel-g-menu-botao-ativo"
                            : "painel-g-menu-botao"
                    }
                    onClick={() =>
                        setPainelGSecaoAtiva("sql")
                    }
                >
                    Terminal SQL
                </button>


                <button
                    type="button"
                    className={
                        painelGSecaoAtiva === "supervisionar"
                            ? "painel-g-menu-botao painel-g-menu-botao-ativo"
                            : "painel-g-menu-botao"
                    }
                    onClick={() =>
                        setPainelGSecaoAtiva("supervisionar")
                    }
                >
                    Supervisionar
                </button>

            </div>


            {/* ERRO */}

            {painelGErro && (

                <div className="painel-g-mensagem-erro">
                    {painelGErro}
                </div>

            )}

            {painelGSecaoAtiva === "supervisionar" && (
                <Supervisionar />
            )}
            {/* =====================================================
                TABELAS
            ===================================================== */}

            {painelGSecaoAtiva === "tabelas" && (

                <div className="painel-g-area-tabelas">
                    <aside className="painel-g-lista-tabelas">

                        <div className="painel-g-lista-tabelas-cabecalho">

                            <div>

                                <h2>
                                    {painelGMostrarTodasTabelas
                                        ? "Todas as tabelas"
                                        : "Tabelas fixadas"
                                    }
                                </h2>

                                <span className="painel-g-lista-tabelas-total">
                                    {painelGTabelasFiltradas.length} tabelas
                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={() => {

                                    carregarTabelasPainelG();
                                    carregarTabelasFixadasPainelG();

                                }}
                            >
                                Atualizar
                            </button>

                        </div>


                        {/* =========================================
        ABRIR / FECHAR TODAS
    ========================================= */}

                        <div className="painel-g-tabelas-modo">

                            <button
                                type="button"
                                className={
                                    painelGMostrarTodasTabelas
                                        ? "painel-g-tabelas-modo-botao painel-g-tabelas-modo-botao-aberto"
                                        : "painel-g-tabelas-modo-botao"
                                }
                                onClick={() => {

                                    setPainelGMostrarTodasTabelas(
                                        anterior => !anterior
                                    );

                                    setPainelGFiltroTabela("");

                                }}
                            >

                                {painelGMostrarTodasTabelas
                                    ? "Fechar tabelas"
                                    : "Abrir tabelas"
                                }

                            </button>

                        </div>


                        {/* =========================================
        FILTRO
    ========================================= */}

                        <div className="painel-g-filtro-tabelas">

                            <input
                                type="text"
                                value={painelGFiltroTabela}
                                onChange={e =>
                                    setPainelGFiltroTabela(
                                        e.target.value
                                    )
                                }
                                placeholder={
                                    painelGMostrarTodasTabelas
                                        ? "Buscar em todas as tabelas..."
                                        : "Buscar nas fixadas..."
                                }
                                autoComplete="off"
                            />


                            {painelGFiltroTabela && (

                                <button
                                    type="button"
                                    className="painel-g-filtro-tabelas-limpar"
                                    onClick={() =>
                                        setPainelGFiltroTabela("")
                                    }
                                >
                                    ×
                                </button>

                            )}

                        </div>


                        {/* =========================================
        LISTA
    ========================================= */}

                        <div className="painel-g-lista-tabelas-conteudo">

                            {painelGTabelasFiltradas.map(tabela => {

                                const fixada =
                                    tabelaEstaFixadaPainelG(tabela);

                                const alterando =
                                    painelGAlterandoFixada === tabela;

                                return (

                                    <div
                                        key={tabela}
                                        className={
                                            painelGTabelaSelecionada === tabela
                                                ? "painel-g-tabela-linha painel-g-tabela-linha-ativa"
                                                : "painel-g-tabela-linha"
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="painel-g-tabela-item"
                                            onClick={() =>
                                                abrirTabelaPainelG(tabela)
                                            }
                                        >

                                            <span>
                                                {tabela}
                                            </span>

                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                fixada
                                                    ? "painel-g-tabela-fixar painel-g-tabela-desafixar"
                                                    : "painel-g-tabela-fixar"
                                            }
                                            disabled={alterando}
                                            onClick={() => {

                                                if (fixada) {

                                                    desafixarTabelaPainelG(
                                                        tabela
                                                    );

                                                } else {

                                                    fixarTabelaPainelG(
                                                        tabela
                                                    );
                                                }

                                            }}
                                        >

                                            {alterando
                                                ? "..."
                                                : fixada
                                                    ? "✖️"
                                                    : "📌"
                                            }

                                        </button>

                                    </div>

                                );

                            })}


                            {painelGTabelasFiltradas.length === 0 && (

                                <div className="painel-g-filtro-tabelas-vazio">

                                    <strong>
                                        {painelGMostrarTodasTabelas
                                            ? "Nenhuma tabela encontrada"
                                            : "Nenhuma tabela fixada"
                                        }
                                    </strong>

                                    <span>
                                        {painelGMostrarTodasTabelas
                                            ? "Tente buscar por outro nome."
                                            : "Clique em Abrir tabelas para escolher quais deseja fixar."
                                        }
                                    </span>

                                </div>

                            )}

                        </div>

                    </aside>


                    {/* VISUALIZADOR */}

                    <main className="painel-g-visualizador-tabela">

                        {!painelGTabelaSelecionada && (

                            <div className="painel-g-tabela-vazia">

                                <h2>
                                    Banco de dados
                                </h2>

                                <p>
                                    Escolha uma tabela para visualizar.
                                </p>

                            </div>

                        )}


                        {painelGTabelaSelecionada && (

                            <>

                                <div className="painel-g-tabela-cabecalho">

                                    <div className="painel-g-tabela-identificacao">

                                        <span>
                                            Tabela
                                        </span>

                                        <h2>
                                            {painelGTabelaSelecionada}
                                        </h2>

                                    </div>


                                    <div className="painel-g-tabela-ferramentas">

                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-copiar"
                                            onClick={copiarDadosTabelaPainelG}
                                        >
                                            📋 Copiar dados
                                        </button>

                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-estrutura"
                                            onClick={copiarEstruturaTabelaPainelG}
                                        >
                                            Copiar estrutura
                                        </button>
                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-select"
                                            onClick={gerarSelectTabelaPainelG}
                                        >
                                            SELECT *
                                        </button>


                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-delete"
                                            onClick={gerarDeleteLinhaPainelG}
                                        >
                                            Apagar linha
                                        </button>


                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-coluna"
                                            onClick={gerarAdicionarColunaPainelG}
                                        >
                                            + Coluna
                                        </button>


                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-apagar-coluna"
                                            onClick={gerarApagarColunaPainelG}
                                        >
                                            Apagar coluna
                                        </button>


                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-renomear"
                                            onClick={gerarRenomearColunaPainelG}
                                        >
                                            Renomear coluna
                                        </button>


                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-contar"
                                            onClick={gerarContarLinhasPainelG}
                                        >
                                            Contar linhas
                                        </button>


                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-limpar"
                                            onClick={gerarLimparTabelaPainelG}
                                        >
                                            Limpar tabela
                                        </button>


                                        <button
                                            type="button"
                                            className="painel-g-ferramenta-botao painel-g-ferramenta-atualizar"
                                            onClick={() =>
                                                abrirTabelaPainelG(
                                                    painelGTabelaSelecionada
                                                )
                                            }
                                        >
                                            ↻ Atualizar
                                        </button>

                                    </div>

                                </div>


                                {/* COLUNAS */}

                                <div className="painel-g-colunas-info">

                                    {painelGColunas.map(coluna => (

                                        <div
                                            key={coluna.Field}
                                            className="painel-g-coluna-card"
                                        >

                                            <strong>
                                                {coluna.Field}
                                            </strong>

                                            <span>
                                                {coluna.Type}
                                            </span>

                                            {coluna.Key === "PRI" && (
                                                <small>
                                                    PRIMARY KEY
                                                </small>
                                            )}

                                        </div>

                                    ))}

                                </div>


                                {/* DADOS */}

                                <div className="painel-g-dados-scroll">

                                    <table className="painel-g-dados-tabela">

                                        <thead>

                                            <tr>

                                                {painelGColunas.map(coluna => (

                                                    <th key={coluna.Field}>
                                                        {coluna.Field}
                                                    </th>

                                                ))}

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {painelGLinhas.map((linha, indexLinha) => (

                                                <tr key={indexLinha}>

                                                    {painelGColunas.map(coluna => {

                                                        const editando =
                                                            painelGCelulaEditando?.indexLinha === indexLinha &&
                                                            painelGCelulaEditando?.coluna === coluna.Field;

                                                        return (

                                                            <td
                                                                key={coluna.Field}
                                                                className={
                                                                    editando
                                                                        ? "painel-g-celula-dado painel-g-celula-editando"
                                                                        : "painel-g-celula-dado"
                                                                }
                                                                onDoubleClick={() =>
                                                                    iniciarEdicaoCelulaPainelG(
                                                                        linha,
                                                                        coluna,
                                                                        indexLinha
                                                                    )
                                                                }
                                                                title="Clique duas vezes para editar"
                                                            >

                                                                {editando ? (

                                                                    <div className="painel-g-celula-editor-container">

                                                                        <input
                                                                            autoFocus
                                                                            className="painel-g-celula-editor-input"
                                                                            value={painelGValorEdicao}
                                                                            disabled={painelGSalvandoCelula}
                                                                            onChange={e =>
                                                                                setPainelGValorEdicao(
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            onKeyDown={e => {

                                                                                if (e.key === "Enter") {
                                                                                    e.preventDefault();
                                                                                    salvarCelulaPainelG();
                                                                                }

                                                                                if (e.key === "Escape") {
                                                                                    e.preventDefault();
                                                                                    cancelarEdicaoCelulaPainelG();
                                                                                }

                                                                            }}
                                                                        />

                                                                        <div className="painel-g-celula-editor-acoes">

                                                                            <button
                                                                                type="button"
                                                                                className="painel-g-celula-salvar"
                                                                                disabled={painelGSalvandoCelula}
                                                                                onClick={salvarCelulaPainelG}
                                                                            >
                                                                                {painelGSalvandoCelula
                                                                                    ? "..."
                                                                                    : "✓"
                                                                                }
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                className="painel-g-celula-cancelar"
                                                                                disabled={painelGSalvandoCelula}
                                                                                onClick={cancelarEdicaoCelulaPainelG}
                                                                            >
                                                                                ×
                                                                            </button>

                                                                        </div>

                                                                    </div>

                                                                ) : (

                                                                    <span className="painel-g-celula-valor">

                                                                        {linha[coluna.Field] === null
                                                                            ? (
                                                                                <span className="painel-g-celula-null">
                                                                                    NULL
                                                                                </span>
                                                                            )
                                                                            : String(linha[coluna.Field])
                                                                        }

                                                                    </span>

                                                                )}

                                                            </td>

                                                        );

                                                    })}

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </>

                        )}

                    </main>

                </div>

            )}


            {/* =====================================================
                TERMINAL SQL
            ===================================================== */}

            {painelGSecaoAtiva === "sql" && (

                <div className="painel-g-terminal-area">

                    <div className="painel-g-terminal-cabecalho">

                        <div>

                            <span>
                                Banco de dados
                            </span>

                            <h2>
                                Terminal SQL
                            </h2>

                        </div>

                    </div>


                    <textarea
                        className="painel-g-terminal-editor"
                        value={painelGSql}
                        onChange={e =>
                            setPainelGSql(e.target.value)
                        }
                        spellCheck="false"
                        placeholder={`SELECT * FROM clientes LIMIT 20;

CREATE TABLE exemplo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255)
);`}
                    />


                    <div className="painel-g-terminal-acoes">

                        <button
                            type="button"
                            onClick={executarSqlPainelG}
                            disabled={painelGCarregando}
                        >
                            {painelGCarregando
                                ? "Executando..."
                                : "Executar SQL"
                            }
                        </button>

                    </div>


                    {painelGResultadoSql && (

                        <div className="painel-g-terminal-resultado">

                            <pre>
                                {JSON.stringify(
                                    painelGResultadoSql,
                                    null,
                                    2
                                )}
                            </pre>

                        </div>

                    )}

                </div>

            )}

        </div>

    );
}