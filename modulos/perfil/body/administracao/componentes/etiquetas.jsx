import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { API_URL } from "../../../../../config";
import "./etiquetas.css";
import { createPortal } from "react-dom";
const CACHE_ETIQUETAS = "dgyahdasd2d62asdsaofaso";

const CACHE_CONFIGURACAO_ETIQUETAS =
    "configuracao_visual_etiquetas_v1";

export default function Etiquetas() {
    const [produtos, setProdutos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);

    const [fonteNormal, setFonteNormal] = useState("helvetica");
    const [estiloFonteNormal, setEstiloFonteNormal] = useState("bold");

    const [fontePromocao, setFontePromocao] = useState("helvetica");
    const [estiloFontePromocao, setEstiloFontePromocao] = useState("bold");

    const [filtroNome, setFiltroNome] = useState("");
    const [filtroPreco, setFiltroPreco] = useState("");
    const [filtroCodigoBarras, setFiltroCodigoBarras] = useState("");

    const [corFundoNormal, setCorFundoNormal] = useState("#ffffff");
    const [corTextoNormal, setCorTextoNormal] = useState("#000000");

    const [corFundoPromocao, setCorFundoPromocao] = useState("#ffeb3b");
    const [corTextoPromocao, setCorTextoPromocao] = useState("#000000");

    const [
        configuracaoEtiquetasCarregada,
        setConfiguracaoEtiquetasCarregada
    ] = useState(false);

    const [carregandoEtiquetas, setCarregandoEtiquetas] = useState(true);
    const [editandoPrecoId, setEditandoPrecoId] = useState(null);
    const [novoPreco, setNovoPreco] = useState("");

    const [cambio, setCambio] = useState(null);
    const [abaMobileEtiquetas, setAbaMobileEtiquetas] = useState("lista");

    // =========================================================
    // IMAGEM DA ETIQUETA
    // =========================================================
    const [modalImagemEtiqueta, setModalImagemEtiqueta] = useState(null);
    const [imagemEscolhidaEtiqueta, setImagemEscolhidaEtiqueta] = useState("");
    const [arquivoImagemEtiqueta, setArquivoImagemEtiqueta] = useState(null);
    const [salvandoImagemEtiqueta, setSalvandoImagemEtiqueta] = useState(false);

    const token = localStorage.getItem("token");
    const tiposFonteDisponiveis = [
        {
            valor: "helvetica",
            nome: "Helvetica"
        },
        {
            valor: "times",
            nome: "Times"
        },
        {
            valor: "courier",
            nome: "Courier"
        }
    ];
    // =========================================================
    // CARREGAR CONFIGURAÇÕES DAS ETIQUETAS DO CACHE
    // =========================================================
    // =========================================================
    // CARREGAR CONFIGURAÇÕES VISUAIS DO CACHE
    // =========================================================
    useEffect(() => {
        try {
            const cacheSalvo = localStorage.getItem(
                CACHE_CONFIGURACAO_ETIQUETAS
            );

            if (cacheSalvo) {
                const configuracao = JSON.parse(cacheSalvo);

                if (configuracao.corFundoNormal) {
                    setCorFundoNormal(
                        configuracao.corFundoNormal
                    );
                }

                if (configuracao.corTextoNormal) {
                    setCorTextoNormal(
                        configuracao.corTextoNormal
                    );
                }

                if (configuracao.fonteNormal) {
                    setFonteNormal(
                        configuracao.fonteNormal
                    );
                }

                if (configuracao.estiloFonteNormal) {
                    setEstiloFonteNormal(
                        configuracao.estiloFonteNormal
                    );
                }

                if (configuracao.corFundoPromocao) {
                    setCorFundoPromocao(
                        configuracao.corFundoPromocao
                    );
                }

                if (configuracao.corTextoPromocao) {
                    setCorTextoPromocao(
                        configuracao.corTextoPromocao
                    );
                }

                if (configuracao.fontePromocao) {
                    setFontePromocao(
                        configuracao.fontePromocao
                    );
                }

                if (configuracao.estiloFontePromocao) {
                    setEstiloFontePromocao(
                        configuracao.estiloFontePromocao
                    );
                }
            }

        } catch (erro) {
            console.error(
                "Erro ao carregar configuração das etiquetas:",
                erro
            );
        } finally {
            setConfiguracaoEtiquetasCarregada(true);
        }
    }, []);

    const estilosFonteDisponiveis = [
        {
            valor: "normal",
            nome: "Normal"
        },
        {
            valor: "bold",
            nome: "Negrito"
        },
        {
            valor: "italic",
            nome: "Itálico"
        },
        {
            valor: "bolditalic",
            nome: "Negrito + Itálico"
        }
    ];
    // =========================================================
    // ATUALIZAR CONFIGURAÇÕES NO CACHE
    // =========================================================
    // =========================================================
    // CARREGAR CONFIGURAÇÕES VISUAIS DAS ETIQUETAS
    // =========================================================
    useEffect(() => {
        try {
            const cacheSalvo = localStorage.getItem(
                CACHE_CONFIGURACAO_ETIQUETAS
            );

            if (cacheSalvo) {
                const configuracao = JSON.parse(cacheSalvo);

                setCorFundoNormal(
                    configuracao.corFundoNormal ?? "#ffffff"
                );

                setCorTextoNormal(
                    configuracao.corTextoNormal ?? "#000000"
                );

                setFonteNormal(
                    configuracao.fonteNormal ?? "helvetica"
                );

                setEstiloFonteNormal(
                    configuracao.estiloFonteNormal ?? "bold"
                );

                setCorFundoPromocao(
                    configuracao.corFundoPromocao ?? "#ffeb3b"
                );

                setCorTextoPromocao(
                    configuracao.corTextoPromocao ?? "#000000"
                );

                setFontePromocao(
                    configuracao.fontePromocao ?? "helvetica"
                );

                setEstiloFontePromocao(
                    configuracao.estiloFontePromocao ?? "bold"
                );
            }

        } catch (erro) {
            console.error(
                "Erro ao carregar configurações das etiquetas:",
                erro
            );
        } finally {
            setConfiguracaoEtiquetasCarregada(true);
        }
    }, []);


    // =========================================================
    // ATUALIZAR CONFIGURAÇÕES VISUAIS NO CACHE
    // =========================================================
    useEffect(() => {
        if (!configuracaoEtiquetasCarregada) {
            return;
        }

        const configuracao = {
            corFundoNormal,
            corTextoNormal,
            fonteNormal,
            estiloFonteNormal,

            corFundoPromocao,
            corTextoPromocao,
            fontePromocao,
            estiloFontePromocao,
        };

        localStorage.setItem(
            CACHE_CONFIGURACAO_ETIQUETAS,
            JSON.stringify(configuracao)
        );

    }, [
        configuracaoEtiquetasCarregada,
        corFundoNormal,
        corTextoNormal,
        fonteNormal,
        estiloFonteNormal,
        corFundoPromocao,
        corTextoPromocao,
        fontePromocao,
        estiloFontePromocao,
    ]);
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
                    precoAnterior: "",
                    quantidadeEtiquetas: 1,
                    usarImagemEtiqueta: Boolean(produto.imagem_etiqueta),
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
            listaAtual.map(item => {
                if (item.id !== id) {
                    return item;
                }

                const novaPromocao = !item.promocao;

                return {
                    ...item,
                    promocao: novaPromocao,
                    precoAnterior: novaPromocao
                        ? item.precoAnterior ?? ""
                        : "",
                };
            })
        );
    }

    function alterarPrecoAnterior(id, valor) {
        setSelecionados(listaAtual =>
            listaAtual.map(item =>
                item.id === id
                    ? {
                        ...item,
                        precoAnterior: valor,
                    }
                    : item
            )
        );
    }
    // ===============================
    // ALTERAR QUANTIDADE DE ETIQUETAS
    // ===============================
    function alterarQuantidadeEtiquetas(id, valor) {

        // Permite deixar vazio enquanto está digitando
        if (valor === "") {
            setSelecionados(listaAtual =>
                listaAtual.map(item =>
                    item.id === id
                        ? {
                            ...item,
                            quantidadeEtiquetas: ""
                        }
                        : item
                )
            );

            return;
        }

        const quantidade = parseInt(valor, 10);

        // Só aceita números maiores que 0
        if (
            Number.isNaN(quantidade) ||
            quantidade < 1
        ) {
            return;
        }

        setSelecionados(listaAtual =>
            listaAtual.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantidadeEtiquetas: quantidade
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

    // =========================================================
    // IMAGEM DA ETIQUETA
    // =========================================================
    function obterImagensProduto(produto) {
        return String(produto?.imagem_url || "")
            .split("|")
            .map(url => url.trim())
            .filter(Boolean);
    }

    function abrirModalImagemEtiqueta(produto) {
        setModalImagemEtiqueta(produto);
        setImagemEscolhidaEtiqueta(produto.imagem_etiqueta || "");
        setArquivoImagemEtiqueta(null);
    }

    function fecharModalImagemEtiqueta() {
        if (salvandoImagemEtiqueta) {
            return;
        }

        setModalImagemEtiqueta(null);
        setImagemEscolhidaEtiqueta("");
        setArquivoImagemEtiqueta(null);
    }

    function atualizarImagemEtiquetaProduto(produtoId, url) {
        setProdutos(listaAtual => {
            const novaLista = listaAtual.map(item =>
                item.id === produtoId
                    ? {
                        ...item,
                        imagem_etiqueta: url,
                    }
                    : item
            );

            atualizarCache(novaLista);
            return novaLista;
        });

        setSelecionados(listaAtual =>
            listaAtual.map(item =>
                item.id === produtoId
                    ? {
                        ...item,
                        imagem_etiqueta: url,
                        usarImagemEtiqueta: true,
                    }
                    : item
            )
        );
    }

    function alternarUsoImagemEtiqueta(produtoId) {
        setSelecionados(listaAtual =>
            listaAtual.map(item => {
                if (item.id !== produtoId) {
                    return item;
                }

                if (!item.imagem_etiqueta) {
                    abrirModalImagemEtiqueta(item);
                    return item;
                }

                return {
                    ...item,
                    usarImagemEtiqueta: !item.usarImagemEtiqueta,
                };
            })
        );
    }

    async function salvarImagemEtiqueta() {
        if (!modalImagemEtiqueta) {
            return;
        }

        if (!arquivoImagemEtiqueta && !imagemEscolhidaEtiqueta) {
            alert("Escolha uma imagem ou carregue uma nova.");
            return;
        }

        setSalvandoImagemEtiqueta(true);

        try {
            let resposta;

            if (arquivoImagemEtiqueta) {
                const formData = new FormData();
                formData.append("arquivo", arquivoImagemEtiqueta);

                resposta = await fetch(
                    `${API_URL}/admin/produtos-servicos/${modalImagemEtiqueta.id}/imagem-etiqueta/upload`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    }
                );
            } else {
                resposta = await fetch(
                    `${API_URL}/admin/produtos-servicos/${modalImagemEtiqueta.id}/imagem-etiqueta/url`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            url: imagemEscolhidaEtiqueta,
                        }),
                    }
                );
            }

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Não foi possível preparar a imagem da etiqueta."
                );
            }

            if (!dados.imagem_etiqueta) {
                throw new Error(
                    "O servidor não retornou a imagem da etiqueta."
                );
            }

            atualizarImagemEtiquetaProduto(
                modalImagemEtiqueta.id,
                dados.imagem_etiqueta
            );

            setModalImagemEtiqueta(null);
            setImagemEscolhidaEtiqueta("");
            setArquivoImagemEtiqueta(null);

        } catch (erro) {
            console.error(
                "Erro ao salvar imagem da etiqueta:",
                erro
            );

            alert(
                erro.message ||
                "Não foi possível salvar a imagem da etiqueta."
            );

        } finally {
            setSalvandoImagemEtiqueta(false);
        }
    }

    function carregarImagemParaPdf(url) {
        return new Promise((resolve, reject) => {
            const imagem = new Image();

            imagem.crossOrigin = "anonymous";

            imagem.onload = () => {
                try {
                    const canvas = document.createElement("canvas");

                    canvas.width =
                        imagem.naturalWidth ||
                        imagem.width;

                    canvas.height =
                        imagem.naturalHeight ||
                        imagem.height;

                    const contexto =
                        canvas.getContext("2d");

                    contexto.drawImage(
                        imagem,
                        0,
                        0
                    );

                    resolve({
                        dataUrl:
                            canvas.toDataURL("image/png"),

                        largura:
                            canvas.width,

                        altura:
                            canvas.height,
                    });

                } catch (erro) {
                    reject(erro);
                }
            };

            imagem.onerror = () => {
                reject(
                    new Error(
                        "Não foi possível carregar a imagem da etiqueta."
                    )
                );
            };

            // Evita reutilizar resposta antiga sem CORS
            const separador =
                url.includes("?")
                    ? "&"
                    : "?";

            const urlSemCache =
                `${url}${separador}v=${Date.now()}`;

            console.log(
                "[ETIQUETAS] Carregando imagem:",
                urlSemCache
            );

            imagem.src = urlSemCache;
        });
    }

    // ===============================
    // GERAR PDF
    // ===============================
    async function imprimirEtiquetas() {

        if (selecionados.length === 0) {
            alert(
                "Adicione pelo menos um produto para impressão."
            );
            return;
        }

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
                    usarImagemEtiqueta:
                        Boolean(
                            produto.usarImagemEtiqueta &&
                            produto.imagem_etiqueta
                        ),
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

        const espacoX = 3;
        const espacoY = 5;

        const larguraEtiqueta = larguraFolha * 0.22;
        const larguraEtiquetaImagem =
            larguraEtiqueta * 2 + espacoX;

        const alturaMinimaEtiqueta = 50;
        const colunas = 4;

        function obterConfiguracaoProduto(produto) {
            const corFundo =
                produto.promocao
                    ? corFundoPromocao
                    : corFundoNormal;

            const corTexto =
                produto.promocao
                    ? corTextoPromocao
                    : corTextoNormal;

            const fonteEtiqueta =
                produto.promocao
                    ? fontePromocao
                    : fonteNormal;

            const estiloFonteEtiqueta =
                produto.promocao
                    ? estiloFontePromocao
                    : estiloFonteNormal;

            return {
                corFundo,
                corTexto,
                fonteEtiqueta,
                estiloFonteEtiqueta,
            };
        }

        function calcularEtiqueta(produto) {
            const {
                fonteEtiqueta,
                estiloFonteEtiqueta,
            } = obterConfiguracaoProduto(produto);

            const comImagem =
                Boolean(
                    produto.usarImagemEtiqueta &&
                    produto.imagem_etiqueta
                );

            const larguraTotal =
                comImagem
                    ? larguraEtiquetaImagem
                    : larguraEtiqueta;

            const larguraTexto =
                comImagem
                    ? larguraEtiqueta - 4
                    : larguraEtiqueta - 8;

            let alturaConteudo = 14;

            if (produto.promocao) {
                alturaConteudo += 13;

                const precoAnteriorNumero = Number(
                    String(produto.precoAnterior ?? "")
                        .replace(",", ".")
                );

                if (
                    produto.precoAnterior !== "" &&
                    Number.isFinite(precoAnteriorNumero)
                ) {
                    alturaConteudo += 9;
                }
            }

            pdf.setFont(
                fonteEtiqueta,
                estiloFonteEtiqueta
            );

            pdf.setFontSize(15);

            const nomeQuebrado =
                pdf.splitTextToSize(
                    produto.nome || "",
                    larguraTexto
                );

            alturaConteudo +=
                nomeQuebrado.length * 6;

            alturaConteudo += 7;

            pdf.setFont(
                fonteEtiqueta,
                estiloFonteEtiqueta
            );

            pdf.setFontSize(
                produto.promocao
                    ? 27
                    : 26
            );

            const precoFormatado =
                formatarPreco(produto.preco);

            const textoPrecoCompleto =
                `R$ ${precoFormatado}`;

            const larguraMaximaPreco =
                larguraTexto - 2;

            const larguraTextoPreco =
                pdf.getTextWidth(
                    textoPrecoCompleto
                );

            const precoQuebra =
                larguraTextoPreco >
                larguraMaximaPreco;

            if (precoQuebra) {
                alturaConteudo += 18;
            } else {
                alturaConteudo += 9;
            }

            const precoDolar =
                calcularPrecoDolar(
                    produto.preco
                );

            if (precoDolar !== null) {
                alturaConteudo += 10;
            }

            alturaConteudo += 5;

            return {
                altura: Math.max(
                    alturaMinimaEtiqueta,
                    alturaConteudo
                ),
                nomeQuebrado,
                precoFormatado,
                precoQuebra,
                precoDolar,
                comImagem,
                larguraTotal,
                slots: comImagem ? 2 : 1,
            };
        }

        // =========================================================
        // ORGANIZAR ETIQUETAS EM 4 SLOTS
        // NORMAL = 1 SLOT
        // COM IMAGEM = 2 SLOTS
        // =========================================================
        const linhasEtiquetas = [];
        let linhaAtual = [];
        let slotsOcupados = 0;

        etiquetasParaImprimir.forEach(produto => {
            const dados = calcularEtiqueta(produto);

            if (
                slotsOcupados + dados.slots >
                colunas
            ) {
                linhasEtiquetas.push(linhaAtual);
                linhaAtual = [];
                slotsOcupados = 0;
            }

            linhaAtual.push({
                produto,
                dados,
                slotInicial: slotsOcupados,
            });

            slotsOcupados += dados.slots;
        });

        if (linhaAtual.length > 0) {
            linhasEtiquetas.push(linhaAtual);
        }

        // =========================================================
        // PRÉ-CARREGAR IMAGENS
        // =========================================================
        const imagensPdf = new Map();

        for (const produto of etiquetasParaImprimir) {
            if (
                !produto.usarImagemEtiqueta ||
                !produto.imagem_etiqueta ||
                imagensPdf.has(produto.imagem_etiqueta)
            ) {
                continue;
            }

            try {
                const imagem = await carregarImagemParaPdf(
                    produto.imagem_etiqueta
                );

                imagensPdf.set(
                    produto.imagem_etiqueta,
                    imagem
                );
            } catch (erro) {
                console.error(
                    "Erro ao carregar imagem para o PDF:",
                    produto.imagem_etiqueta,
                    erro
                );
            }
        }

        function desenharFormatoNormal(
            x,
            y,
            largura,
            altura
        ) {
            const corteSuperior = 7;
            const raio = 2;

            const xEsquerda = x;
            const xDireita = x + largura;
            const yTopo = y;
            const yCorte = y + corteSuperior;
            const yBase = y + altura;

            pdf.moveTo(
                xEsquerda + corteSuperior + raio,
                yTopo
            );

            pdf.lineTo(
                xDireita - corteSuperior - raio,
                yTopo
            );

            pdf.curveTo(
                xDireita - corteSuperior,
                yTopo,
                xDireita - corteSuperior + raio,
                yTopo + raio,
                xDireita - corteSuperior + raio * 1.5,
                yTopo + raio * 1.5
            );

            pdf.lineTo(
                xDireita - raio,
                yCorte - raio
            );

            pdf.curveTo(
                xDireita,
                yCorte,
                xDireita,
                yCorte,
                xDireita,
                yCorte + raio
            );

            pdf.lineTo(
                xDireita,
                yBase - raio
            );

            pdf.curveTo(
                xDireita,
                yBase,
                xDireita,
                yBase,
                xDireita - raio,
                yBase
            );

            pdf.lineTo(
                xEsquerda + raio,
                yBase
            );

            pdf.curveTo(
                xEsquerda,
                yBase,
                xEsquerda,
                yBase,
                xEsquerda,
                yBase - raio
            );

            pdf.lineTo(
                xEsquerda,
                yCorte + raio
            );

            pdf.curveTo(
                xEsquerda,
                yCorte,
                xEsquerda,
                yCorte,
                xEsquerda + raio,
                yCorte - raio
            );

            pdf.lineTo(
                xEsquerda + corteSuperior - raio * 1.5,
                yTopo + raio * 1.5
            );

            pdf.curveTo(
                xEsquerda + corteSuperior - raio,
                yTopo + raio,
                xEsquerda + corteSuperior,
                yTopo,
                xEsquerda + corteSuperior + raio,
                yTopo
            );

            pdf.close();
            pdf.fillStroke();
        }

        function desenharFormatoHorizontal(
            x,
            y,
            largura,
            altura
        ) {
            // Mesma ideia da etiqueta normal,
            // girada para a esquerda.
            const corteLateral = 7;
            const raio = 2;

            const xEsquerda = x;
            const xCorte = x + corteLateral;
            const xDireita = x + largura;
            const yTopo = y;
            const yBase = y + altura;

            pdf.moveTo(
                xCorte + raio,
                yTopo
            );

            pdf.lineTo(
                xDireita - raio,
                yTopo
            );

            pdf.curveTo(
                xDireita,
                yTopo,
                xDireita,
                yTopo,
                xDireita,
                yTopo + raio
            );

            pdf.lineTo(
                xDireita,
                yBase - raio
            );

            pdf.curveTo(
                xDireita,
                yBase,
                xDireita,
                yBase,
                xDireita - raio,
                yBase
            );

            pdf.lineTo(
                xCorte + raio,
                yBase
            );

            // Recorte inferior esquerdo
            pdf.curveTo(
                xCorte,
                yBase,
                xCorte - raio,
                yBase - raio,
                xCorte - raio * 1.5,
                yBase - raio * 1.5
            );

            pdf.lineTo(
                xEsquerda + raio,
                yBase - corteLateral + raio
            );

            pdf.curveTo(
                xEsquerda,
                yBase - corteLateral,
                xEsquerda,
                yBase - corteLateral,
                xEsquerda,
                yBase - corteLateral - raio
            );

            pdf.lineTo(
                xEsquerda,
                yTopo + corteLateral + raio
            );

            pdf.curveTo(
                xEsquerda,
                yTopo + corteLateral,
                xEsquerda,
                yTopo + corteLateral,
                xEsquerda + raio,
                yTopo + corteLateral - raio
            );

            // Recorte superior esquerdo
            pdf.lineTo(
                xCorte - raio * 1.5,
                yTopo + raio * 1.5
            );

            pdf.curveTo(
                xCorte - raio,
                yTopo + raio,
                xCorte,
                yTopo,
                xCorte + raio,
                yTopo
            );

            pdf.close();
            pdf.fillStroke();
        }

        function desenharConteudoEtiqueta(
            produto,
            dadosEtiqueta,
            x,
            y,
            alturaEtiquetaAtual
        ) {
            const {
                corFundo,
                corTexto,
                fonteEtiqueta,
                estiloFonteEtiqueta,
            } = obterConfiguracaoProduto(
                produto
            );

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

            if (dadosEtiqueta.comImagem) {
                desenharFormatoHorizontal(
                    x,
                    y,
                    dadosEtiqueta.larguraTotal,
                    alturaEtiquetaAtual
                );
            } else {
                desenharFormatoNormal(
                    x,
                    y,
                    dadosEtiqueta.larguraTotal,
                    alturaEtiquetaAtual
                );
            }

            pdf.setTextColor(
                textoR,
                textoG,
                textoB
            );

            const larguraAreaTexto =
                dadosEtiqueta.comImagem
                    ? larguraEtiqueta
                    : dadosEtiqueta.larguraTotal;

            const centroTextoX =
                x + larguraAreaTexto / 2;

            let posicaoY = y + 14;

            if (produto.promocao) {
                pdf.setFont(
                    fonteEtiqueta,
                    estiloFonteEtiqueta
                );

                pdf.setFontSize(18);

                pdf.text(
                    "PROMOÇÃO",
                    centroTextoX,
                    posicaoY,
                    {
                        align: "center",
                    }
                );

                posicaoY += 13;
            }

            pdf.setFont(
                fonteEtiqueta,
                estiloFonteEtiqueta
            );

            pdf.setFontSize(15);

            pdf.text(
                dadosEtiqueta.nomeQuebrado,
                centroTextoX,
                posicaoY,
                {
                    align: "center",
                }
            );

            posicaoY +=
                (
                    dadosEtiqueta
                        .nomeQuebrado
                        .length *
                    6
                ) + 7;

            if (
                produto.promocao &&
                produto.precoAnterior !== ""
            ) {
                const precoAnteriorNumero = Number(
                    String(produto.precoAnterior)
                        .replace(",", ".")
                );

                if (
                    Number.isFinite(
                        precoAnteriorNumero
                    )
                ) {
                    const textoPrecoAnterior =
                        `R$ ${formatarPreco(precoAnteriorNumero)}`;

                    pdf.setFont(
                        fonteEtiqueta,
                        "normal"
                    );

                    pdf.setFontSize(14);

                    pdf.text(
                        textoPrecoAnterior,
                        centroTextoX,
                        posicaoY,
                        {
                            align: "center",
                        }
                    );

                    const larguraPrecoAnterior =
                        pdf.getTextWidth(
                            textoPrecoAnterior
                        );

                    pdf.setDrawColor(
                        textoR,
                        textoG,
                        textoB
                    );

                    pdf.setLineWidth(0.6);

                    pdf.line(
                        centroTextoX -
                        larguraPrecoAnterior / 2,
                        posicaoY - 1.7,
                        centroTextoX +
                        larguraPrecoAnterior / 2,
                        posicaoY - 1.7
                    );

                    posicaoY += 8;
                }
            }

            pdf.setFont(
                fonteEtiqueta,
                estiloFonteEtiqueta
            );

            pdf.setFontSize(
                produto.promocao
                    ? 27
                    : 26
            );

            if (!dadosEtiqueta.precoQuebra) {
                pdf.text(
                    `R$ ${dadosEtiqueta.precoFormatado}`,
                    centroTextoX,
                    posicaoY,
                    {
                        align: "center",
                    }
                );
            } else {
                pdf.text(
                    "R$",
                    centroTextoX,
                    posicaoY,
                    {
                        align: "center",
                    }
                );

                posicaoY += 9;

                pdf.text(
                    dadosEtiqueta.precoFormatado,
                    centroTextoX,
                    posicaoY,
                    {
                        align: "center",
                    }
                );
            }

            if (
                dadosEtiqueta.precoDolar !==
                null
            ) {
                posicaoY += 9;

                pdf.setFont(
                    fonteEtiqueta,
                    estiloFonteEtiqueta
                );

                pdf.setFontSize(14);

                pdf.text(
                    `US$ ${dadosEtiqueta.precoDolar.toFixed(2)}`,
                    centroTextoX,
                    posicaoY,
                    {
                        align: "center",
                    }
                );
            }

            // =====================================================
            // IMAGEM NA METADE DIREITA
            // =====================================================
            if (
                dadosEtiqueta.comImagem &&
                produto.imagem_etiqueta
            ) {
                const imagem =
                    imagensPdf.get(
                        produto.imagem_etiqueta
                    );

                if (imagem) {
                    const areaX =
                        x + larguraEtiqueta + 3;

                    const areaY =
                        y + 4;

                    const areaLargura =
                        dadosEtiqueta.larguraTotal -
                        larguraEtiqueta -
                        7;

                    const areaAltura =
                        alturaEtiquetaAtual - 8;

                    const proporcaoImagem =
                        imagem.largura /
                        imagem.altura;

                    const proporcaoArea =
                        areaLargura /
                        areaAltura;

                    let larguraImagem;
                    let alturaImagem;

                    if (
                        proporcaoImagem >
                        proporcaoArea
                    ) {
                        larguraImagem =
                            areaLargura;

                        alturaImagem =
                            larguraImagem /
                            proporcaoImagem;
                    } else {
                        alturaImagem =
                            areaAltura;

                        larguraImagem =
                            alturaImagem *
                            proporcaoImagem;
                    }

                    const imagemX =
                        areaX +
                        (
                            areaLargura -
                            larguraImagem
                        ) / 2;

                    const imagemY =
                        areaY +
                        (
                            areaAltura -
                            alturaImagem
                        ) / 2;

                    pdf.addImage(
                        imagem.dataUrl,
                        "PNG",
                        imagemX,
                        imagemY,
                        larguraImagem,
                        alturaImagem
                    );
                }
            }
        }

        let yAtual = margemY;

        linhasEtiquetas.forEach(linha => {
            const alturaLinha =
                Math.max(
                    ...linha.map(
                        item =>
                            item.dados.altura
                    )
                );

            if (
                yAtual +
                alturaLinha >
                alturaFolha - margemY
            ) {
                pdf.addPage();
                yAtual = margemY;
            }

            linha.forEach(item => {
                const x =
                    margemX +
                    item.slotInicial *
                    (
                        larguraEtiqueta +
                        espacoX
                    );

                desenharConteudoEtiqueta(
                    item.produto,
                    item.dados,
                    x,
                    yAtual,
                    item.dados.altura
                );
            });

            yAtual +=
                alturaLinha +
                espacoY;
        });

        pdf.save(
            "etiquetas-produtos.pdf"
        );
    }

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
                                value={produto.quantidadeEtiquetas ?? ""}
                                onChange={e =>
                                    alterarQuantidadeEtiquetas(
                                        produto.id,
                                        e.target.value
                                    )
                                }
                                onBlur={() => {
                                    if (
                                        produto.quantidadeEtiquetas === "" ||
                                        produto.quantidadeEtiquetas == null
                                    ) {
                                        alterarQuantidadeEtiquetas(
                                            produto.id,
                                            "1"
                                        );
                                    }
                                }}
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
                                type="button"
                                className={`etiquetas-imagem-produto-controle ${produto.usarImagemEtiqueta &&
                                    produto.imagem_etiqueta
                                    ? "etiquetas-imagem-produto-com-imagem"
                                    : "etiquetas-imagem-produto-sem-imagem"
                                    }`}
                                onClick={() =>
                                    alternarUsoImagemEtiqueta(produto.id)
                                }
                                onDoubleClick={() =>
                                    abrirModalImagemEtiqueta(produto)
                                }
                                title={
                                    produto.imagem_etiqueta
                                        ? "Clique para ativar/desativar. Clique duas vezes para trocar a imagem."
                                        : "Adicionar imagem à etiqueta"
                                }
                            >
                                {produto.usarImagemEtiqueta &&
                                    produto.imagem_etiqueta
                                    ? "Imagem ✓"
                                    : "Sem imagem"}
                            </button>

                            <button
                                type="button"
                                className="etiquetas-imagem-produto-editar"
                                onClick={() =>
                                    abrirModalImagemEtiqueta(produto)
                                }
                            >
                                Escolher imagem
                            </button>

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
                            {produto.promocao && (
                                <div className="etiquetas-promocao-preco-anterior-area">
                                    <label
                                        className="etiquetas-promocao-preco-anterior-label"
                                        htmlFor={`preco-anterior-promocao-${produto.id}`}
                                    >
                                        Preço anterior
                                    </label>

                                    <div className="etiquetas-promocao-preco-anterior-campo">
                                        <span className="etiquetas-promocao-preco-anterior-prefixo">
                                            R$
                                        </span>

                                        <input
                                            id={`preco-anterior-promocao-${produto.id}`}
                                            className="etiquetas-promocao-preco-anterior-input"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0,00"
                                            value={produto.precoAnterior ?? ""}
                                            onChange={e =>
                                                alterarPrecoAnterior(
                                                    produto.id,
                                                    e.target.value
                                                )
                                            }
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}
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
        ETIQUETA NORMAL
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
                                    setCorFundoNormal(e.target.value)
                                }
                            />
                        </label>

                        <label className="etiquetas-seletor-cor-item">
                            <span>Letras</span>

                            <input
                                type="color"
                                value={corTextoNormal}
                                onChange={e =>
                                    setCorTextoNormal(e.target.value)
                                }
                            />
                        </label>


                        {/* TIPO DA FONTE */}
                        <label className="etiquetas-seletor-fonte-item">

                            <span>Fonte</span>

                            <input
                                type="text"
                                list="etiquetas-fontes-normal-lista"
                                value={fonteNormal}

                                onFocus={() => {
                                    setFonteNormal("");
                                }}

                                onClick={() => {
                                    setFonteNormal("");
                                }}

                                onChange={e => {
                                    setFonteNormal(
                                        e.target.value
                                    );
                                }}

                                onBlur={() => {
                                    if (!fonteNormal) {
                                        setFonteNormal(
                                            "helvetica"
                                        );
                                    }
                                }}

                                placeholder="Escolha a fonte"
                                autoComplete="off"
                            />

                            <datalist id="etiquetas-fontes-normal-lista">

                                {tiposFonteDisponiveis.map(
                                    fonte => (
                                        <option
                                            key={fonte.valor}
                                            value={fonte.valor}
                                        >
                                            {fonte.nome}
                                        </option>
                                    )
                                )}

                            </datalist>

                        </label>


                        {/* ESTILO */}
                        <label className="etiquetas-seletor-fonte-item">

                            <span>Estilo</span>

                            <input
                                type="text"
                                list="etiquetas-estilos-normal-lista"
                                value={estiloFonteNormal}

                                onFocus={() => {
                                    setEstiloFonteNormal("");
                                }}

                                onClick={() => {
                                    setEstiloFonteNormal("");
                                }}

                                onChange={e => {
                                    setEstiloFonteNormal(
                                        e.target.value
                                    );
                                }}

                                onBlur={() => {
                                    if (!estiloFonteNormal) {
                                        setEstiloFonteNormal(
                                            "bold"
                                        );
                                    }
                                }}

                                placeholder="Escolha o estilo"
                                autoComplete="off"
                            />

                            <datalist id="etiquetas-estilos-normal-lista">

                                {estilosFonteDisponiveis.map(
                                    estilo => (
                                        <option
                                            key={estilo.valor}
                                            value={estilo.valor}
                                        >
                                            {estilo.nome}
                                        </option>
                                    )
                                )}

                            </datalist>

                        </label>

                    </div>
                    <button
                        className="etiquetas-botao-imprimir-principall"
                        onClick={imprimirEtiquetas}
                        disabled={selecionados.length === 0}
                    >
                        Imprimir etiquetas
                        {selecionados.length > 0 &&
                            ` (${selecionados.length})`}
                    </button>

                    {/* ===============================
        ETIQUETA PROMOÇÃO
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
                                    setCorFundoPromocao(e.target.value)
                                }
                            />
                        </label>

                        <label className="etiquetas-seletor-cor-item">
                            <span>Letras</span>

                            <input
                                type="color"
                                value={corTextoPromocao}
                                onChange={e =>
                                    setCorTextoPromocao(e.target.value)
                                }
                            />
                        </label>


                        {/* TIPO DA FONTE */}
                        <label className="etiquetas-seletor-fonte-item">

                            <span>Fonte</span>

                            <input
                                type="text"
                                list="etiquetas-fontes-promocao-lista"
                                value={fontePromocao}

                                onFocus={() => {
                                    setFontePromocao("");
                                }}

                                onClick={() => {
                                    setFontePromocao("");
                                }}

                                onChange={e => {
                                    setFontePromocao(
                                        e.target.value
                                    );
                                }}

                                onBlur={() => {
                                    if (!fontePromocao) {
                                        setFontePromocao(
                                            "helvetica"
                                        );
                                    }
                                }}

                                placeholder="Escolha a fonte"
                                autoComplete="off"
                            />

                            <datalist id="etiquetas-fontes-promocao-lista">

                                {tiposFonteDisponiveis.map(
                                    fonte => (
                                        <option
                                            key={fonte.valor}
                                            value={fonte.valor}
                                        >
                                            {fonte.nome}
                                        </option>
                                    )
                                )}

                            </datalist>

                        </label>


                        {/* ESTILO */}
                        <label className="etiquetas-seletor-fonte-item">

                            <span>Estilo</span>

                            <input
                                type="text"
                                list="etiquetas-estilos-promocao-lista"
                                value={estiloFontePromocao}

                                onFocus={() => {
                                    setEstiloFontePromocao("");
                                }}

                                onClick={() => {
                                    setEstiloFontePromocao("");
                                }}

                                onChange={e => {
                                    setEstiloFontePromocao(
                                        e.target.value
                                    );
                                }}

                                onBlur={() => {
                                    if (!estiloFontePromocao) {
                                        setEstiloFontePromocao(
                                            "bold"
                                        );
                                    }
                                }}

                                placeholder="Escolha o estilo"
                                autoComplete="off"
                            />

                            <datalist id="etiquetas-estilos-promocao-lista">

                                {estilosFonteDisponiveis.map(
                                    estilo => (
                                        <option
                                            key={estilo.valor}
                                            value={estilo.valor}
                                        >
                                            {estilo.nome}
                                        </option>
                                    )
                                )}

                            </datalist>

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

            {modalImagemEtiqueta && (
                <div
                    className="etiquetas-imagem-modal-overlay"
                    onMouseDown={e => {
                        if (
                            e.target === e.currentTarget
                        ) {
                            fecharModalImagemEtiqueta();
                        }
                    }}
                >
                    <div className="etiquetas-imagem-modal-caixa">
                        <div className="etiquetas-imagem-modal-cabecalho">
                            <div>
                                <h3>
                                    Imagem da etiqueta
                                </h3>

                                <p>
                                    {modalImagemEtiqueta.nome}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="etiquetas-imagem-modal-fechar"
                                onClick={fecharModalImagemEtiqueta}
                                disabled={salvandoImagemEtiqueta}
                            >
                                ×
                            </button>
                        </div>

                        <div className="etiquetas-imagem-modal-conteudo">
                            {obterImagensProduto(
                                modalImagemEtiqueta
                            ).length > 0 && (
                                    <div className="etiquetas-imagem-modal-galeria-area">
                                        <strong>
                                            Escolha uma imagem do produto
                                        </strong>

                                        <div className="etiquetas-imagem-modal-galeria">
                                            {obterImagensProduto(
                                                modalImagemEtiqueta
                                            ).map((url, indice) => (
                                                <button
                                                    type="button"
                                                    key={`${url}-${indice}`}
                                                    className={`etiquetas-imagem-modal-opcao ${imagemEscolhidaEtiqueta === url &&
                                                        !arquivoImagemEtiqueta
                                                        ? "etiquetas-imagem-modal-opcao-ativa"
                                                        : ""
                                                        }`}
                                                    onClick={() => {
                                                        setImagemEscolhidaEtiqueta(url);
                                                        setArquivoImagemEtiqueta(null);
                                                    }}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Opção ${indice + 1}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {modalImagemEtiqueta &&
                                createPortal(
                                    <div
                                        className="etiquetas-imagem-modal-overlay"
                                        onMouseDown={(e) => {
                                            if (e.target === e.currentTarget) {
                                                fecharModalImagemEtiqueta();
                                            }
                                        }}
                                    >
                                        <div
                                            className="etiquetas-imagem-modal-container"
                                            onMouseDown={(e) => e.stopPropagation()}
                                        >
                                            {/* =====================================================
                    CABEÇALHO
                ===================================================== */}

                                            <div className="etiquetas-imagem-modal-cabecalho">
                                                <div className="etiquetas-imagem-modal-cabecalho-texto">
                                                    <h3>
                                                        Imagem da etiqueta
                                                    </h3>

                                                    <p>
                                                        {modalImagemEtiqueta.nome}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="etiquetas-imagem-modal-fechar"
                                                    onClick={fecharModalImagemEtiqueta}
                                                    aria-label="Fechar"
                                                >
                                                    ×
                                                </button>
                                            </div>


                                            {/* =====================================================
                    IMAGEM ATUAL SEM FUNDO
                ===================================================== */}

                                            {modalImagemEtiqueta.imagem_etiqueta && (
                                                <div className="etiquetas-imagem-modal-atual-area">
                                                    <strong>
                                                        Imagem atual sem fundo
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className={`
                                etiquetas-imagem-modal-opcao
                                etiquetas-imagem-modal-atual
                                ${imagemEscolhidaEtiqueta ===
                                                                modalImagemEtiqueta.imagem_etiqueta &&
                                                                !arquivoImagemEtiqueta
                                                                ? "etiquetas-imagem-modal-opcao-ativa"
                                                                : ""
                                                            }
                            `}
                                                        onClick={() => {
                                                            setImagemEscolhidaEtiqueta(
                                                                modalImagemEtiqueta.imagem_etiqueta
                                                            );

                                                            setArquivoImagemEtiqueta(null);
                                                        }}
                                                    >
                                                        <img
                                                            src={modalImagemEtiqueta.imagem_etiqueta}
                                                            alt="Imagem atual da etiqueta"
                                                        />
                                                    </button>
                                                </div>
                                            )}


                                            {/* =====================================================
                    IMAGENS EXISTENTES DO PRODUTO
                ===================================================== */}

                                            {obterImagensProduto(modalImagemEtiqueta).length > 0 && (
                                                <div className="etiquetas-imagem-modal-lista-area">
                                                    <strong>
                                                        Escolher uma imagem do produto
                                                    </strong>

                                                    <div className="etiquetas-imagem-modal-lista">
                                                        {obterImagensProduto(
                                                            modalImagemEtiqueta
                                                        ).map((url, index) => (
                                                            <button
                                                                key={`${url}-${index}`}
                                                                type="button"
                                                                className={`
                                        etiquetas-imagem-modal-opcao
                                        ${imagemEscolhidaEtiqueta === url &&
                                                                        !arquivoImagemEtiqueta
                                                                        ? "etiquetas-imagem-modal-opcao-ativa"
                                                                        : ""
                                                                    }
                                    `}
                                                                onClick={() => {
                                                                    setImagemEscolhidaEtiqueta(url);

                                                                    setArquivoImagemEtiqueta(null);
                                                                }}
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={`Imagem ${index + 1} do produto`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}


                                            {/* =====================================================
                    ENVIAR NOVA IMAGEM
                ===================================================== */}

                                            <div className="etiquetas-imagem-modal-upload-area">
                                                <strong>
                                                    Ou enviar uma nova imagem
                                                </strong>

                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    onChange={(e) => {
                                                        const arquivo =
                                                            e.target.files?.[0] || null;

                                                        setArquivoImagemEtiqueta(arquivo);

                                                        if (arquivo) {
                                                            setImagemEscolhidaEtiqueta("");
                                                        }
                                                    }}
                                                />

                                                {arquivoImagemEtiqueta && (
                                                    <div className="etiquetas-imagem-modal-arquivo-selecionado">
                                                        <span>
                                                            Arquivo selecionado:
                                                        </span>

                                                        <strong>
                                                            {arquivoImagemEtiqueta.name}
                                                        </strong>
                                                    </div>
                                                )}
                                            </div>


                                            {/* =====================================================
                    AÇÕES
                ===================================================== */}

                                            <div className="etiquetas-imagem-modal-rodape">
                                                <button
                                                    type="button"
                                                    className="etiquetas-imagem-modal-cancelar"
                                                    onClick={fecharModalImagemEtiqueta}
                                                    disabled={salvandoImagemEtiqueta}
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="etiquetas-imagem-modal-salvar"
                                                    onClick={salvarImagemEtiqueta}
                                                    disabled={
                                                        salvandoImagemEtiqueta ||
                                                        (
                                                            !imagemEscolhidaEtiqueta &&
                                                            !arquivoImagemEtiqueta
                                                        )
                                                    }
                                                >
                                                    {salvandoImagemEtiqueta
                                                        ? "Processando imagem..."
                                                        : "Usar imagem"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                )}

                            <div className="etiquetas-imagem-modal-upload-area">
                                <strong>
                                    Ou carregue uma nova imagem
                                </strong>

                                <label className="etiquetas-imagem-modal-upload-botao">
                                    Escolher arquivo

                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={e => {
                                            const arquivo =
                                                e.target.files?.[0] || null;

                                            setArquivoImagemEtiqueta(
                                                arquivo
                                            );

                                            if (arquivo) {
                                                setImagemEscolhidaEtiqueta("");
                                            }
                                        }}
                                    />
                                </label>

                                {arquivoImagemEtiqueta && (
                                    <span className="etiquetas-imagem-modal-arquivo-nome">
                                        {arquivoImagemEtiqueta.name}
                                    </span>
                                )}
                            </div>

                            <div className="etiquetas-imagem-modal-aviso">
                                Ao salvar, o fundo será removido automaticamente.
                            </div>
                        </div>

                        <div className="etiquetas-imagem-modal-rodape">
                            <button
                                type="button"
                                className="etiquetas-imagem-modal-cancelar"
                                onClick={fecharModalImagemEtiqueta}
                                disabled={salvandoImagemEtiqueta}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="etiquetas-imagem-modal-salvar"
                                onClick={salvarImagemEtiqueta}
                                disabled={
                                    salvandoImagemEtiqueta ||
                                    (
                                        !arquivoImagemEtiqueta &&
                                        !imagemEscolhidaEtiqueta
                                    )
                                }
                            >
                                {salvandoImagemEtiqueta
                                    ? "Removendo fundo..."
                                    : "Salvar imagem"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}