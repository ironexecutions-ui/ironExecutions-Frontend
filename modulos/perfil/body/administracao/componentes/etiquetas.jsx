import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { API_URL } from "../../../../../config";
import "./etiquetas.css";

const CACHE_ETIQUETAS = "dgyahdasd2d62asdsaofaso";

export default function Etiquetas() {
    const [produtos, setProdutos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);

    const [filtroNome, setFiltroNome] = useState("");
    const [filtroPreco, setFiltroPreco] = useState("");
    const [filtroCodigoBarras, setFiltroCodigoBarras] = useState("");

    const [corFundoNormal, setCorFundoNormal] = useState("#ffffff");
    const [corTextoNormal, setCorTextoNormal] = useState("#000000");

    const [corFundoPromocao, setCorFundoPromocao] = useState("#ffeb3b");
    const [corTextoPromocao, setCorTextoPromocao] = useState("#000000");

    const [carregandoEtiquetas, setCarregandoEtiquetas] = useState(true);
    const [editandoPrecoId, setEditandoPrecoId] = useState(null);
    const [novoPreco, setNovoPreco] = useState("");

    const [cambio, setCambio] = useState(null);
    const [abaMobileEtiquetas, setAbaMobileEtiquetas] = useState("lista");
    const token = localStorage.getItem("token");

    // ===============================
    // CARREGAR CACHE + SINCRONIZAR
    // ===============================
    useEffect(() => {
        carregarProdutosEtiquetas();
    }, []);

    async function carregarProdutosEtiquetas() {
        setCarregandoEtiquetas(true);

        try {
            // ===============================
            // CARREGA CACHE PRIMEIRO
            // ===============================
            const cacheSalvo =
                localStorage.getItem(CACHE_ETIQUETAS);

            if (cacheSalvo) {
                try {
                    const produtosCache =
                        JSON.parse(cacheSalvo);

                    if (Array.isArray(produtosCache)) {
                        setProdutos(produtosCache);
                    }
                } catch (erro) {
                    console.error(
                        "Erro ao ler cache de etiquetas:",
                        erro
                    );
                }
            }

            // ===============================
            // SINCRONIZA COM SERVIDOR
            // ===============================
            const resposta = await fetch(
                `${API_URL}/admin/etiquetas/produtos`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao carregar produtos."
                );
            }

            const dadosServidor =
                await resposta.json();

            // ===============================
            // PRODUTOS
            // ===============================
            const listaNormalizada =
                Array.isArray(dadosServidor.produtos)
                    ? dadosServidor.produtos
                    : [];

            setProdutos(listaNormalizada);

            localStorage.setItem(
                CACHE_ETIQUETAS,
                JSON.stringify(listaNormalizada)
            );

            // ===============================
            // CÂMBIO CONFIGURADO
            // ===============================
            const cambioRecebido =
                Number(dadosServidor.cambio);

            setCambio(
                Number.isFinite(cambioRecebido) &&
                    cambioRecebido > 0
                    ? cambioRecebido
                    : null
            );

        } catch (erro) {
            console.error(
                "Erro ao sincronizar produtos:",
                erro
            );
        } finally {
            setCarregandoEtiquetas(false);
        }
    }

    // ===============================
    // ATUALIZAR CACHE
    // ===============================
    function atualizarCache(lista) {
        localStorage.setItem(
            CACHE_ETIQUETAS,
            JSON.stringify(lista)
        );
    }

    // ===============================
    // PRODUTOS DISPONÍVEIS
    // ===============================
    const produtosDisponiveis = useMemo(() => {
        const idsSelecionados = new Set(
            selecionados.map(item => item.id)
        );

        return produtos.filter(produto => {

            // ===============================
            // JÁ ESTÁ NA IMPRESSÃO
            // ===============================
            if (idsSelecionados.has(produto.id)) {
                return false;
            }

            // ===============================
            // CÓDIGO DE BARRAS
            // ===============================
            if (filtroCodigoBarras.trim() !== "") {
                const codigoProduto = String(
                    produto.codigo_barras ?? ""
                ).trim();

                const codigoBuscado =
                    filtroCodigoBarras.trim();

                if (codigoProduto !== codigoBuscado) {
                    return false;
                }
            }

            // ===============================
            // NOME
            // ===============================
            if (filtroNome.trim() !== "") {
                const nomeProduto =
                    produto.nome?.toLowerCase() || "";

                const buscaNome =
                    filtroNome.trim().toLowerCase();

                if (!nomeProduto.includes(buscaNome)) {
                    return false;
                }
            }

            // ===============================
            // PREÇO
            // ===============================
            if (filtroPreco !== "") {
                const precoProduto =
                    Number(produto.preco);

                const precoBusca =
                    Number(
                        String(filtroPreco)
                            .replace(",", ".")
                    );

                if (
                    !Number.isNaN(precoBusca) &&
                    precoProduto !== precoBusca
                ) {
                    return false;
                }
            }

            return true;
        });

    }, [
        produtos,
        selecionados,
        filtroNome,
        filtroPreco,
        filtroCodigoBarras
    ]);

    // ===============================
    // MOVER PARA IMPRESSÃO
    // ===============================

    function adicionarParaImpressao(produto) {
        setSelecionados(listaAtual => {
            const existe = listaAtual.some(
                item => item.id === produto.id
            );

            if (existe) {
                return listaAtual;
            }

            return [
                ...listaAtual,
                {
                    ...produto,
                    promocao: false,
                    quantidadeEtiquetas: 1,
                }
            ];
        });
    }

    // ===============================
    // REMOVER DA IMPRESSÃO
    // ===============================
    function removerDaImpressao(id) {
        setSelecionados(listaAtual =>
            listaAtual.filter(
                item => item.id !== id
            )
        );
    }

    // ===============================
    // PROMOÇÃO
    // ===============================
    function alternarPromocao(id) {
        setSelecionados(listaAtual =>
            listaAtual.map(item =>
                item.id === id
                    ? {
                        ...item,
                        promocao: !item.promocao,
                    }
                    : item
            )
        );
    }
    // ===============================
    // ALTERAR QUANTIDADE DE ETIQUETAS
    // ===============================
    function alterarQuantidadeEtiquetas(id, valor) {
        let quantidade = parseInt(valor, 10);

        if (
            Number.isNaN(quantidade) ||
            quantidade < 1
        ) {
            quantidade = 1;
        }

        setSelecionados(listaAtual =>
            listaAtual.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantidadeEtiquetas: quantidade,
                    }
                    : item
            )
        );
    }
    // ===============================
    // COMEÇAR EDIÇÃO DE PREÇO
    // ===============================
    function iniciarEdicaoPreco(produto) {
        setEditandoPrecoId(produto.id);
        setNovoPreco(produto.preco);
    }

    // ===============================
    // CANCELAR EDIÇÃO
    // ===============================
    function cancelarEdicaoPreco() {
        setEditandoPrecoId(null);
        setNovoPreco("");
    }

    // ===============================
    // SALVAR NOVO PREÇO
    // ===============================
    async function salvarNovoPreco(produto) {
        const precoConvertido = Number(
            String(novoPreco).replace(",", ".")
        );

        if (
            Number.isNaN(precoConvertido) ||
            precoConvertido < 0
        ) {
            alert("Digite um preço válido.");
            return;
        }

        try {
            const produtoAtualizado = {
                nome: produto.nome,
                unidade: produto.unidade ?? null,
                codigo_barras: produto.codigo_barras ?? null,
                qrcode: produto.qrcode ?? null,
                preco: precoConvertido,
                preco_recebido: produto.preco_recebido ?? 0,
                categoria: produto.categoria ?? null,
                imagem_url: produto.imagem_url ?? null,
                disponivel: produto.disponivel ?? 1,
                produto_id: produto.produto_id ?? null,
                unidades: produto.unidades ?? 0,
                tempo_servico: produto.tempo_servico ?? null,
                data_vencimento: produto.data_vencimento ?? null,
            };

            const resposta = await fetch(
                `${API_URL}/admin/produtos-servicos/${produto.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(produtoAtualizado),
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao alterar preço."
                );
            }

            const novaLista = produtos.map(item =>
                item.id === produto.id
                    ? {
                        ...item,
                        preco: precoConvertido,
                    }
                    : item
            );

            setProdutos(novaLista);
            atualizarCache(novaLista);

            setSelecionados(listaAtual =>
                listaAtual.map(item =>
                    item.id === produto.id
                        ? {
                            ...item,
                            preco: precoConvertido,
                        }
                        : item
                )
            );

            setEditandoPrecoId(null);
            setNovoPreco("");

        } catch (erro) {
            console.error(erro);

            alert(
                "Não foi possível alterar o preço."
            );
        }
    }

    // ===============================
    // FORMATAR PREÇO EM REAL
    // ===============================
    function formatarPreco(valor) {
        const numero = Number(valor || 0);

        return numero.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    // ===============================
    // CALCULAR PREÇO EM DÓLAR
    // ===============================
    function calcularPrecoDolar(precoReal) {
        const valorCambio = Number(cambio);
        const valorReal = Number(precoReal);

        // Se não existe câmbio configurado,
        // não mostra dólar na etiqueta
        if (
            !Number.isFinite(valorCambio) ||
            valorCambio <= 0 ||
            !Number.isFinite(valorReal)
        ) {
            return null;
        }

        const convertido =
            valorReal / valorCambio;

        const inteiro =
            Math.floor(convertido);

        const centavos =
            convertido - inteiro;

        const valorArredondado =
            centavos > 0.30
                ? Math.ceil(convertido)
                : Math.floor(convertido);

        return valorArredondado;
    }

    // ===============================
    // HEX PARA RGB
    // ===============================
    function converterHexParaRgb(hex) {
        const cor = hex.replace("#", "");

        const r = parseInt(
            cor.substring(0, 2),
            16
        );

        const g = parseInt(
            cor.substring(2, 4),
            16
        );

        const b = parseInt(
            cor.substring(4, 6),
            16
        );

        return [r, g, b];
    }

    // ===============================
    // GERAR PDF
    // ===============================
    function imprimirEtiquetas() {
        if (selecionados.length === 0) {
            alert(
                "Adicione pelo menos um produto para impressão."
            );
            return;
        }
        // ===============================
        // GERAR LISTA COM AS QUANTIDADES
        // ===============================
        const etiquetasParaImprimir = [];

        selecionados.forEach(produto => {
            const quantidade = Math.max(
                1,
                parseInt(
                    produto.quantidadeEtiquetas,
                    10
                ) || 1
            );

            for (let i = 0; i < quantidade; i++) {
                etiquetasParaImprimir.push({
                    ...produto,
                });
            }
        });
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const larguraFolha = 210;
        const alturaFolha = 297;

        const margemX = 5;
        const margemY = 10;

        const espacoX = 5;
        const espacoY = 5;

        // ===============================
        // TAMANHO DAS ETIQUETAS
        // ===============================
        const larguraEtiqueta =
            larguraFolha * 0.30;

        const alturaEtiqueta = 68;

        const colunas = 3;

        const linhasPorPagina =
            Math.floor(
                (alturaFolha - margemY * 2) /
                (alturaEtiqueta + espacoY)
            );

        const etiquetasPorPagina =
            linhasPorPagina * colunas;

        etiquetasParaImprimir.forEach(
            (produto, index) => {

                const indicePagina =
                    index % etiquetasPorPagina;

                if (
                    index > 0 &&
                    indicePagina === 0
                ) {
                    pdf.addPage();
                }

                const colunaPagina =
                    indicePagina % colunas;

                const linhaPagina =
                    Math.floor(
                        indicePagina / colunas
                    );

                const x =
                    margemX +
                    colunaPagina *
                    (
                        larguraEtiqueta +
                        espacoX
                    );

                const y =
                    margemY +
                    linhaPagina *
                    (
                        alturaEtiqueta +
                        espacoY
                    );

                // ===============================
                // CORES
                // ===============================
                const corFundo =
                    produto.promocao
                        ? corFundoPromocao
                        : corFundoNormal;

                const corTexto =
                    produto.promocao
                        ? corTextoPromocao
                        : corTextoNormal;

                const [
                    fundoR,
                    fundoG,
                    fundoB
                ] = converterHexParaRgb(
                    corFundo
                );

                const [
                    textoR,
                    textoG,
                    textoB
                ] = converterHexParaRgb(
                    corTexto
                );

                // ===============================
                // FUNDO
                // ===============================
                pdf.setFillColor(
                    fundoR,
                    fundoG,
                    fundoB
                );

                pdf.setDrawColor(
                    0,
                    0,
                    0
                );

                pdf.setLineWidth(0.5);

                pdf.roundedRect(
                    x,
                    y,
                    larguraEtiqueta,
                    alturaEtiqueta,
                    2,
                    2,
                    "FD"
                );

                // ===============================
                // COR DO TEXTO
                // ===============================
                pdf.setTextColor(
                    textoR,
                    textoG,
                    textoB
                );

                let posicaoY = y + 14;

                // ===============================
                // PROMOÇÃO
                // ===============================
                if (produto.promocao) {
                    pdf.setFont(
                        "helvetica",
                        "bold"
                    );

                    pdf.setFontSize(18);

                    pdf.text(
                        "PROMOÇÃO",
                        x +
                        larguraEtiqueta / 2,
                        posicaoY,
                        {
                            align: "center",
                        }
                    );

                    posicaoY += 13;
                }

                // ===============================
                // NOME DO PRODUTO
                // ===============================
                pdf.setFont(
                    "helvetica",
                    "bold"
                );

                pdf.setFontSize(15);

                const nomeQuebrado =
                    pdf.splitTextToSize(
                        produto.nome || "",
                        larguraEtiqueta - 8
                    );

                pdf.text(
                    nomeQuebrado,
                    x +
                    larguraEtiqueta / 2,
                    posicaoY,
                    {
                        align: "center",
                    }
                );

                // Espaço de acordo com
                // quantidade de linhas do nome
                posicaoY +=
                    (
                        nomeQuebrado.length *
                        6
                    ) + 7;

                // ===============================
                // PREÇO EM REAL
                // ===============================
                pdf.setFont(
                    "helvetica",
                    "bold"
                );

                pdf.setFontSize(
                    produto.promocao
                        ? 27
                        : 26
                );

                pdf.text(
                    `R$ ${formatarPreco(
                        produto.preco
                    )}`,
                    x +
                    larguraEtiqueta / 2,
                    posicaoY,
                    {
                        align: "center",
                    }
                );

                // ===============================
                // PREÇO EM DÓLAR
                // ===============================
                const precoDolar =
                    calcularPrecoDolar(
                        produto.preco
                    );

                if (precoDolar !== null) {
                    posicaoY += 9;

                    pdf.setFont(
                        "helvetica",
                        "bold"
                    );

                    pdf.setFontSize(14);

                    pdf.text(
                        `US$ ${precoDolar.toFixed(2)}`,
                        x +
                        larguraEtiqueta / 2,
                        posicaoY,
                        {
                            align: "center",
                        }
                    );
                }
            }
        );

        pdf.save(
            "etiquetas-produtos.pdf"
        );
    }

    // ===============================
    // CARD PRODUTO
    // ===============================
    // ===============================
    // CARD PRODUTO
    // ===============================
    // ===============================
    // CARD PRODUTO
    // ===============================
    function renderizarProduto(produto, lado) {
        const editando = editandoPrecoId === produto.id;

        return (
            <div
                className="etiquetas-produto-card-individual"
                key={produto.id}
            >
                <div className="etiquetas-produto-informacoes-bloco">

                    <strong className="etiquetas-produto-nome-texto">
                        {produto.nome}
                    </strong>

                    {!editando && (
                        <span className="etiquetas-produto-preco-texto">
                            R$ {formatarPreco(produto.preco)}
                        </span>
                    )}

                    {editando && (
                        <div className="etiquetas-edicao-preco-area">

                            <span>R$</span>

                            <input
                                className="etiquetas-edicao-preco-input"
                                type="number"
                                step="0.01"
                                value={novoPreco}
                                onChange={e =>
                                    setNovoPreco(
                                        e.target.value
                                    )
                                }
                                autoFocus
                            />

                        </div>
                    )}

                    {/* QUANTIDADE SOMENTE DO LADO DIREITO */}
                    {lado === "direita" && (
                        <div className="etiquetas-quantidade-impressao-area">

                            <label
                                className="etiquetas-quantidade-impressao-label"
                                htmlFor={`quantidade-etiqueta-${produto.id}`}
                            >
                                Quantidade
                            </label>

                            <input
                                id={`quantidade-etiqueta-${produto.id}`}
                                className="etiquetas-quantidade-impressao-input"
                                type="number"
                                min="1"
                                step="1"
                                value={
                                    produto.quantidadeEtiquetas ?? 1
                                }
                                onChange={e =>
                                    alterarQuantidadeEtiquetas(
                                        produto.id,
                                        e.target.value
                                    )
                                }
                            />

                        </div>
                    )}

                </div>

                <div className="etiquetas-produto-acoes-area">

                    {!editando ? (
                        <button
                            className="etiquetas-acao-alterar-preco"
                            onClick={() =>
                                iniciarEdicaoPreco(produto)
                            }
                        >
                            Mudar preço
                        </button>
                    ) : (
                        <>
                            <button
                                className="etiquetas-acao-salvar-preco"
                                onClick={() =>
                                    salvarNovoPreco(produto)
                                }
                            >
                                Salvar
                            </button>

                            <button
                                className="etiquetas-acao-cancelar-preco"
                                onClick={cancelarEdicaoPreco}
                            >
                                Cancelar
                            </button>
                        </>
                    )}

                    {lado === "esquerda" && (
                        <button
                            className="etiquetas-acao-mover-direita"
                            onClick={() =>
                                adicionarParaImpressao(produto)
                            }
                            title="Adicionar para impressão"
                        >
                            →
                        </button>
                    )}

                    {lado === "direita" && (
                        <>
                            <button
                                className="etiquetas-acao-promocao"
                                data-ativo={
                                    produto.promocao
                                        ? "true"
                                        : "false"
                                }
                                onClick={() =>
                                    alternarPromocao(produto.id)
                                }
                            >
                                {produto.promocao
                                    ? "Promoção ✓"
                                    : "Promoção"}
                            </button>

                            <button
                                className="etiquetas-acao-mover-esquerda"
                                onClick={() =>
                                    removerDaImpressao(produto.id)
                                }
                                title="Remover da impressão"
                            >
                                ←
                            </button>
                        </>
                    )}

                </div>
            </div>
        );
    }

    // ===============================
    // RETURN PRINCIPAL
    // ===============================
    return (
        <div className="etiquetas-painel-principal">

            <div className="etiquetas-painel-cabecalho">

                <div className="etiquetas-cabecalho-identificacao">
                    <h2 className="etiquetas-painel-titulo">
                        Etiquetas
                    </h2>

                    <p className="etiquetas-painel-subtitulo">
                        Selecione os produtos que deseja imprimir
                    </p>
                </div>

                <div className="etiquetas-configuracoes-impressao-area">

                    {/* ===============================
                        CORES ETIQUETA NORMAL
                    =============================== */}
                    <div className="etiquetas-grupo-cores-normal">

                        <span className="etiquetas-grupo-cores-titulo">
                            Etiqueta
                        </span>

                        <label className="etiquetas-seletor-cor-item">
                            <span>Fundo</span>

                            <input
                                type="color"
                                value={corFundoNormal}
                                onChange={e =>
                                    setCorFundoNormal(
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <label className="etiquetas-seletor-cor-item">
                            <span>Letras</span>

                            <input
                                type="color"
                                value={corTextoNormal}
                                onChange={e =>
                                    setCorTextoNormal(
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                    </div>

                    {/* ===============================
                        CORES ETIQUETA PROMOÇÃO
                    =============================== */}
                    <div className="etiquetas-grupo-cores-promocao">

                        <span className="etiquetas-grupo-cores-titulo">
                            Promoção
                        </span>

                        <label className="etiquetas-seletor-cor-item">
                            <span>Fundo</span>

                            <input
                                type="color"
                                value={corFundoPromocao}
                                onChange={e =>
                                    setCorFundoPromocao(
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <label className="etiquetas-seletor-cor-item">
                            <span>Letras</span>

                            <input
                                type="color"
                                value={corTextoPromocao}
                                onChange={e =>
                                    setCorTextoPromocao(
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                    </div>

                    {/* ===============================
                        IMPRIMIR
                    =============================== */}
                    <button
                        className="etiquetas-botao-imprimir-principal"
                        onClick={imprimirEtiquetas}
                        disabled={selecionados.length === 0}
                    >
                        Imprimir etiquetas
                        {selecionados.length > 0 &&
                            ` (${selecionados.length})`}
                    </button>

                </div>

            </div>
            <div className="etiquetas-navegacao-mobile-abas">
                <button
                    type="button"
                    className={`etiquetas-mobile-aba-botao ${abaMobileEtiquetas === "lista"
                        ? "etiquetas-mobile-aba-ativa"
                        : ""
                        }`}
                    onClick={() =>
                        setAbaMobileEtiquetas("lista")
                    }
                >
                    Lista

                    <span className="etiquetas-mobile-aba-contador">
                        {produtosDisponiveis.length}
                    </span>
                </button>

                <button
                    type="button"
                    className={`etiquetas-mobile-aba-botao ${abaMobileEtiquetas === "etiquetas"
                        ? "etiquetas-mobile-aba-ativa"
                        : ""
                        }`}
                    onClick={() =>
                        setAbaMobileEtiquetas("etiquetas")
                    }
                >
                    Etiquetas

                    <span className="etiquetas-mobile-aba-contador">
                        {selecionados.length}
                    </span>
                </button>
            </div>
            <div className="etiquetas-duas-colunas-layout">

                {/* ===============================
                    PRODUTOS DISPONÍVEIS
                =============================== */}
                <section
                    className={`etiquetas-coluna-produtos-disponiveis ${abaMobileEtiquetas === "lista"
                        ? "etiquetas-coluna-mobile-visivel"
                        : "etiquetas-coluna-mobile-oculta"
                        }`}
                >
                    <div className="etiquetas-coluna-cabecalho">
                        <h3>
                            Produtos
                        </h3>

                        <span>
                            {produtosDisponiveis.length}
                        </span>
                    </div>

                    {/* ===============================
                        FILTROS
                    =============================== */}
                    <div className="etiquetas-filtros-produtos-area">

                        <input
                            className="etiquetas-filtro-nome-input"
                            type="text"
                            placeholder="Filtrar por nome..."
                            value={filtroNome}
                            onChange={e =>
                                setFiltroNome(e.target.value)
                            }
                        />

                        <input
                            className="etiquetas-filtro-preco-input"
                            type="number"
                            step="0.01"
                            placeholder="Filtrar por preço..."
                            value={filtroPreco}
                            onChange={e =>
                                setFiltroPreco(e.target.value)
                            }
                        />

                        <input
                            className="etiquetas-filtro-codigo-barras-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="Código de barras..."
                            value={filtroCodigoBarras}
                            onChange={e =>
                                setFiltroCodigoBarras(
                                    e.target.value
                                )
                            }
                            autoComplete="off"
                        />

                    </div>

                    {/* ===============================
                        LISTAGEM
                    =============================== */}
                    <div className="etiquetas-listagem-produtos-scroll">

                        {carregandoEtiquetas &&
                            produtos.length === 0 && (
                                <div className="etiquetas-carregamento-produtos">
                                    Carregando produtos...
                                </div>
                            )}

                        {!carregandoEtiquetas &&
                            produtosDisponiveis.length === 0 && (
                                <div className="etiquetas-lista-vazia-mensagem">
                                    Nenhum produto encontrado.
                                </div>
                            )}

                        {produtosDisponiveis.map(produto =>
                            renderizarProduto(
                                produto,
                                "esquerda"
                            )
                        )}

                    </div>

                </section>

                {/* ===============================
                    PRODUTOS PARA IMPRESSÃO
                =============================== */}
                <section
                    className={`etiquetas-coluna-impressao-selecionada ${abaMobileEtiquetas === "etiquetas"
                            ? "etiquetas-coluna-mobile-visivel"
                            : "etiquetas-coluna-mobile-oculta"
                        }`}
                >
                    <div className="etiquetas-coluna-cabecalho">
                        <h3>
                            Impressão
                        </h3>

                        <span>
                            {selecionados.length}
                        </span>
                    </div>

                    <div className="etiquetas-listagem-impressao-scroll">

                        {selecionados.length === 0 ? (
                            <div className="etiquetas-impressao-vazia-area">

                                <div className="etiquetas-impressao-vazia-icone">
                                    →
                                </div>

                                <strong>
                                    Nenhum produto selecionado
                                </strong>

                                <p>
                                    Adicione produtos da lista ao lado.
                                </p>

                            </div>
                        ) : (
                            selecionados.map(produto =>
                                renderizarProduto(
                                    produto,
                                    "direita"
                                )
                            )
                        )}

                    </div>

                </section>

            </div>
        </div>
    );
}