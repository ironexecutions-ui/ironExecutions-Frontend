import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { API_URL } from "../../../../../config";
import "./etiquetas.css";
import { createPortal } from "react-dom";
const CACHE_ETIQUETAS = "dgyahdasd2d62asdsaofaso";
import fundoOrnamentalUrl from "./etiquetas/fundos/1.png";
const CACHE_CONFIGURACAO_ETIQUETAS =
    "configuracao_visual_etiquetas_v1";

export default function Etiquetas() {
    const [produtos, setProdutos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);

    // Câmbio utilizado na conversão dos preços para dólar.
    const [cambio, setCambio] = useState(null);
    const [produtoVariedadesAberto, setProdutoVariedadesAberto] =
        useState(null);

    // Guarda quais produtos estão mostrando o nome completo.
    // Por padrão, a tela mostra o nome normal/reduzido.
    const [nomesCompletosVisiveis, setNomesCompletosVisiveis] =
        useState({});

    function alternarNomeProduto(produtoId) {
        setNomesCompletosVisiveis(nomesAtuais => ({
            ...nomesAtuais,
            [produtoId]: !nomesAtuais[produtoId],
        }));
    }

    function obterNomeExibicao(produto) {
        const nomeCompleto = String(
            produto?.nome || ""
        ).trim();

        if (!nomeCompleto) {
            return "";
        }

        // Primeiro tenta obter a configuração do produto.
        let configuracaoVariedade = String(
            produto?.qual_variedad || ""
        ).trim();

        // Se estiver vazia, tenta usar a configuração
        // da primeira variedade associada ao produto.
        if (!configuracaoVariedade) {
            configuracaoVariedade = String(
                produto?.variedades?.find(
                    variedade =>
                        String(variedade?.qual_variedad || "").trim()
                )?.qual_variedad || ""
            ).trim();
        }

        // Aceita parênteses vazios mesmo com espaços internos.
        const quantidadeEspacos = (
            configuracaoVariedade.match(/\(\s*\)/g) || []
        ).length;

        // Sem espaços reservados, mantém o nome original.
        if (quantidadeEspacos === 0) {
            return nomeCompleto;
        }

        // Mantém apenas a quantidade de palavras definida
        // pelos espaços reservados da configuração.
        return nomeCompleto
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, quantidadeEspacos)
            .join(" ");
    }


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

    const [nomeLojaEtiqueta, setNomeLojaEtiqueta] = useState("SUA LOJA");
    // Tipo e orientação da etiqueta escolhidos para a impressão.
    const [tipoEtiquetaImpressao, setTipoEtiquetaImpressao] = useState("basica");
    const [orientacaoEtiquetaImpressao, setOrientacaoEtiquetaImpressao] = useState("vertical");

    // Fonte exclusiva da etiqueta ornamental
    const [fonteOrnamental, setFonteOrnamental] = useState("elegante");

    const fontesOrnamentais = [
        { valor: "moderna", nome: "Moderna" },
        { valor: "elegante", nome: "Elegante" },
        { valor: "classica", nome: "Clássica" },
        { valor: "minimalista", nome: "Minimalista" },
        { valor: "destaque", nome: "Destaque" }
    ];
    const [logoEtiquetaUrl, setLogoEtiquetaUrl] = useState(null);
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
    const [alertaLimiteEtiquetas, setAlertaLimiteEtiquetas] = useState(null);
    // =========================================================
    // CARREGAR CONFIGURAÇÕES DAS ETIQUETAS DO CACHE
    // =========================================================
    // =========================================================


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

                // Modelo da etiqueta
                setTipoEtiquetaImpressao(
                    configuracao.tipoEtiquetaImpressao ?? "basica"
                );

                // Orientação
                setOrientacaoEtiquetaImpressao(
                    configuracao.orientacaoEtiquetaImpressao ?? "vertical"
                );

                // Fonte ornamental
                setFonteOrnamental(
                    configuracao.fonteOrnamental ?? "elegante"
                );

                // Configurações da etiqueta normal
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

                // Configurações da promoção
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
            // Modelo e orientação
            tipoEtiquetaImpressao,
            orientacaoEtiquetaImpressao,
            fonteOrnamental,

            // Etiqueta normal
            corFundoNormal,
            corTextoNormal,
            fonteNormal,
            estiloFonteNormal,

            // Etiqueta promoção
            corFundoPromocao,
            corTextoPromocao,
            fontePromocao,
            estiloFontePromocao
        };

        localStorage.setItem(
            CACHE_CONFIGURACAO_ETIQUETAS,
            JSON.stringify(configuracao)
        );

    }, [
        configuracaoEtiquetasCarregada,

        tipoEtiquetaImpressao,
        orientacaoEtiquetaImpressao,
        fonteOrnamental,

        corFundoNormal,
        corTextoNormal,
        fonteNormal,
        estiloFonteNormal,

        corFundoPromocao,
        corTextoPromocao,
        fontePromocao,
        estiloFontePromocao
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
            const resposta = await fetch(
                `${API_URL}/admin/etiquetas/produtos`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                    cache: "no-store",
                }
            );

            if (!resposta.ok) {
                throw new Error("Erro ao carregar produtos.");
            }

            const dadosServidor = await resposta.json();

            // Nome da loja
            setNomeLojaEtiqueta(
                String(dadosServidor.loja_nome || "SUA LOJA").trim() || "SUA LOJA"
            );

            // Logotipo cadastrado na tabela logos_etiquetas
            setLogoEtiquetaUrl(
                dadosServidor.logo_etiqueta
                    ? String(dadosServidor.logo_etiqueta).trim()
                    : null
            );
            // Produtos recebidos do servidor
            const listaNormalizada = Array.isArray(dadosServidor.produtos)
                ? dadosServidor.produtos
                : [];

            setProdutos(listaNormalizada);

            // Câmbio
            const cambioRecebido = Number(dadosServidor.cambio);

            setCambio(
                Number.isFinite(cambioRecebido) && cambioRecebido > 0
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

    // =========================================================
    // CONTROLE DE LIMITE DE PRODUTOS PARA IMPRESSÃO
    // =========================================================

    function produtoContaComoComFoto(produto) {
        return Boolean(
            produto?.usarImagemEtiqueta &&
            produto?.imagem_etiqueta
        );
    }

    function contarProdutosSelecionados(lista) {
        let comFoto = 0;
        let semFoto = 0;

        lista.forEach(produto => {
            if (produtoContaComoComFoto(produto)) {
                comFoto += 1;
            } else {
                semFoto += 1;
            }
        });

        return {
            comFoto,
            semFoto
        };
    }

    function mostrarAlertaLimite(mensagem) {
        setAlertaLimiteEtiquetas(mensagem);

        window.setTimeout(() => {
            setAlertaLimiteEtiquetas(null);
        }, 4000);
    }

    function validarLimiteSelecionados(lista) {
        const {
            comFoto,
            semFoto
        } = contarProdutosSelecionados(lista);

        // Máximo absoluto de produtos com foto
        if (comFoto > 6) {
            return {
                valido: false,
                mensagem:
                    "Você pode selecionar no máximo 6 produtos com foto."
            };
        }

        // Cada produto com foto reduz 2 posições
        // da capacidade de produtos sem foto.
        const limiteSemFoto = 16 - (comFoto * 2);

        if (semFoto > limiteSemFoto) {
            return {
                valido: false,
                mensagem:
                    comFoto === 0
                        ? "Você pode selecionar no máximo 16 produtos sem foto."
                        : `Com ${comFoto} produto${comFoto > 1 ? "s" : ""} com foto, você pode selecionar no máximo ${limiteSemFoto} produto${limiteSemFoto !== 1 ? "s" : ""} sem foto.`
            };
        }

        return {
            valido: true,
            mensagem: ""
        };
    }


    // =========================================================
    // MOVER PARA IMPRESSÃO
    // NOVO PRODUTO ENTRA PRIMEIRO
    // =========================================================

    function adicionarParaImpressao(produto) {
        setSelecionados(listaAtual => {
            const existe = listaAtual.some(
                item => item.id === produto.id
            );

            if (existe) {
                return listaAtual;
            }

            const novoProduto = {
                ...produto,
                promocao: false,
                precoAnterior: "",
                quantidadeEtiquetas: 1,
                usarImagemEtiqueta: Boolean(
                    produto.imagem_etiqueta
                ),
            };

            const novaLista = [
                novoProduto,
                ...listaAtual,
            ];

            const validacao =
                validarLimiteSelecionados(novaLista);

            if (!validacao.valido) {
                mostrarAlertaLimite(
                    validacao.mensagem
                );

                return listaAtual;
            }

            return novaLista;
        });
    }

    function moverProdutoFiltradoParaImpressao(produto) {
        const existe = selecionados.some(
            item => item.id === produto.id
        );

        if (existe) {
            return;
        }

        const novoProduto = {
            ...produto,
            promocao: false,
            precoAnterior: "",
            quantidadeEtiquetas: 1,
            usarImagemEtiqueta: Boolean(
                produto.imagem_etiqueta
            ),
        };

        const novaLista = [
            novoProduto,
            ...selecionados,
        ];

        const validacao = validarLimiteSelecionados(novaLista);

        if (!validacao.valido) {
            mostrarAlertaLimite(validacao.mensagem);
            return;
        }

        setSelecionados(novaLista);

        // Se era o último resultado, limpa todos os filtros.
        const eraUltimoResultado =
            produtosDisponiveis.length === 1 &&
            produtosDisponiveis[0].id === produto.id;

        if (eraUltimoResultado) {
            setFiltroNome("");
            setFiltroPreco("");
            setFiltroCodigoBarras("");
        }
    }
    // =========================================================
    // REMOVER DA IMPRESSÃO
    // =========================================================

    function removerDaImpressao(id) {
        setSelecionados(listaAtual =>
            listaAtual.filter(
                item => item.id !== id
            )
        );
    }


    // =========================================================
    // TIRAR TODOS DA IMPRESSÃO
    // =========================================================

    function removerTodosDaImpressao() {
        setSelecionados([]);
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
        setSelecionados(listaAtual => {
            const produtoAtual = listaAtual.find(
                item => item.id === produtoId
            );

            if (!produtoAtual) {
                return listaAtual;
            }

            if (!produtoAtual.imagem_etiqueta) {
                abrirModalImagemEtiqueta(produtoAtual);
                return listaAtual;
            }

            const novaLista = listaAtual.map(item => {
                if (item.id !== produtoId) {
                    return item;
                }

                return {
                    ...item,
                    usarImagemEtiqueta:
                        !item.usarImagemEtiqueta,
                };
            });

            const validacao =
                validarLimiteSelecionados(novaLista);

            if (!validacao.valido) {
                mostrarAlertaLimite(
                    validacao.mensagem
                );

                return listaAtual;
            }

            return novaLista;
        });
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

    // =========================================================
    // GERAR PDF ORNAMENTAL
    // A imagem deve ficar em: public/etiquetas/fundos/1.png
    // =========================================================
    async function imprimirEtiquetasOrnamentais() {
        if (selecionados.length === 0) {
            alert("Adicione pelo menos um produto para impressão.");
            return;
        }

        // =====================================================
        // CONFIGURAÇÕES VISUAIS AJUSTÁVEIS DA ETIQUETA ORNAMENTAL
        // Todas as medidas abaixo são em milímetros, exceto fontes.
        // A moldura mantém sempre sua proporção original.
        // =====================================================
        const orientacaoHorizontal = orientacaoEtiquetaImpressao === "horizontal";

        const CONFIG_ORNAMENTAL = {
            colunas: 4,
            // Vertical: 46,5 x 69,75 mm. Horizontal: 69,75 x 46,5 mm.
            largura: orientacaoHorizontal ? 69.75 : 46.5,
            altura: orientacaoHorizontal ? 46.5 : 69.75,
            margemX: orientacaoHorizontal ? 4.5 : 7.5,
            margemY: 8,
            espacamentoX: 3,
            espacamentoY: 4,

            // Posição e tamanho do logotipo tipográfico.
            logoX: 23.25,
            logoY: 8.2,
            logoRaio: 3.1,
            logoFonte: 8,

            // Nome da loja
            lojaY: 14,
            lojaFonte: 10.2,
            lojaFonteMinima: 8,

            // Nome do produto
            produtoY: 25,
            produtoFonte: 11.5,
            produtoFonteMinima: 9,

            // Preço em reais
            precoY: 46,
            precoFonte: 30,
            precoFonteMinima: 20,

            // Preço convertido em dólar
            dolarY: 52,
            dolarFonte: 10,

            // Imagem sem fundo do produto.
            imagemMaxLargura: 22,
            imagemMaxAltura: 14,
            imagemVerticalY: 53.5,
            imagemHorizontalY: 50.5,

            corDourada: [181, 125, 18],
            corTexto: [76, 58, 24],
            corPreco: [105, 67, 10]
        };

        try {
            // Carrega a moldura ornamental antes de desenhar as etiquetas.
            const fundo = await carregarImagemParaPdf(fundoOrnamentalUrl);

            async function rotacionarFundoHorizontal(imagemOriginal) {
                return new Promise((resolve, reject) => {
                    const imagem = new Image();

                    imagem.onload = () => {
                        try {
                            const canvas = document.createElement("canvas");

                            canvas.width = imagem.naturalHeight;
                            canvas.height = imagem.naturalWidth;

                            const contexto = canvas.getContext("2d");

                            contexto.translate(canvas.width, 0);
                            contexto.rotate(Math.PI / 2);

                            contexto.drawImage(
                                imagem,
                                0,
                                0
                            );

                            resolve({
                                dataUrl: canvas.toDataURL("image/png"),
                                largura: canvas.width,
                                altura: canvas.height
                            });
                        } catch (erro) {
                            reject(erro);
                        }
                    };

                    imagem.onerror = () => {
                        reject(new Error("Não foi possível girar a moldura ornamental."));
                    };

                    imagem.src = imagemOriginal.dataUrl;
                });
            }

            const fundoHorizontal = orientacaoHorizontal
                ? await rotacionarFundoHorizontal(fundo)
                : null;

            const idsProdutos = [
                ...new Set(selecionados.map(produto => produto.id))
            ];

            const respostaRegistro = await fetch(
                `${API_URL}/admin/etiquetas/produtos/registrar-impressao`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ produtos_ids: idsProdutos })
                }
            );

            if (!respostaRegistro.ok) {
                const erro = await respostaRegistro.json().catch(() => null);
                throw new Error(
                    erro?.detail || "Não foi possível registrar os preços das etiquetas."
                );
            }

            // Carrega o logotipo real do comércio
            let imagemLogoEtiqueta = null;

            if (logoEtiquetaUrl) {
                try {
                    imagemLogoEtiqueta = await carregarImagemParaPdf(
                        logoEtiquetaUrl
                    );
                } catch (erroLogo) {
                    console.error(
                        "Erro ao carregar logotipo das etiquetas:",
                        logoEtiquetaUrl,
                        erroLogo
                    );
                }
            }
            const produtosExpandido = [];
            selecionados.forEach(produto => {
                const quantidade = Math.max(
                    1,
                    parseInt(produto.quantidadeEtiquetas, 10) || 1
                );

                for (let i = 0; i < quantidade; i += 1) {
                    produtosExpandido.push({ ...produto });
                }
            });

            const imagensProdutos = new Map();

            for (const produto of produtosExpandido) {
                if (
                    produto.usarImagemEtiqueta &&
                    produto.imagem_etiqueta &&
                    !imagensProdutos.has(produto.imagem_etiqueta)
                ) {
                    try {
                        const imagem = await carregarImagemParaPdf(
                            produto.imagem_etiqueta
                        );
                        imagensProdutos.set(produto.imagem_etiqueta, imagem);
                    } catch (erroImagem) {
                        console.warn(
                            "Não foi possível carregar a imagem do produto:",
                            produto.imagem_etiqueta,
                            erroImagem
                        );
                    }
                }
            }

            const pdfOrnamental = new jsPDF({
                orientation: orientacaoHorizontal ? "landscape" : "portrait",
                unit: "mm",
                format: "a4"
            });

            const larguraFolha = orientacaoHorizontal ? 297 : 210;
            const alturaFolha = orientacaoHorizontal ? 210 : 297;
            const cfg = CONFIG_ORNAMENTAL;
            const CONFIG_FONTES_ORNAMENTAIS = {
                moderna: {
                    fonte: "helvetica",
                    estilo: "bold"
                },
                elegante: {
                    fonte: "times",
                    estilo: "bold"
                },
                classica: {
                    fonte: "times",
                    estilo: "bold"
                },
                minimalista: {
                    fonte: "helvetica",
                    estilo: "bold"
                },
                destaque: {
                    fonte: "courier",
                    estilo: "bold"
                }
            };

            const fonteOrnamentalAplicada =
                CONFIG_FONTES_ORNAMENTAIS[fonteOrnamental] ||
                CONFIG_FONTES_ORNAMENTAIS.elegante;
            // Ajusta a moldura pela proporção original, sem deformar.


            function desenharFundo(x, y, largura, altura) {
                if (orientacaoHorizontal) {
                    // A imagem já foi rotacionada antes da geração do PDF.
                    // Agora ocupa exatamente a área da etiqueta horizontal.

                    pdfOrnamental.addImage(
                        fundoHorizontal.dataUrl,
                        "PNG",
                        x,
                        y,
                        largura,
                        altura
                    );

                    return;
                }

                // Mantém o comportamento original da etiqueta vertical.
                const proporcaoImagem = fundo.largura / fundo.altura;
                const proporcaoArea = largura / altura;

                let larguraFinal = largura;
                let alturaFinal = altura;

                if (proporcaoImagem > proporcaoArea) {
                    alturaFinal = largura / proporcaoImagem;
                } else {
                    larguraFinal = altura * proporcaoImagem;
                }

                const imagemX = x + (largura - larguraFinal) / 2;
                const imagemY = y + (altura - alturaFinal) / 2;

                pdfOrnamental.addImage(
                    fundo.dataUrl,
                    "PNG",
                    imagemX,
                    imagemY,
                    larguraFinal,
                    alturaFinal
                );
            }



            function desenharImagemProporcional(imagem, x, y, larguraMax, alturaMax) {
                if (!imagem) return;

                const proporcao = imagem.largura / imagem.altura;
                let largura = larguraMax;
                let altura = largura / proporcao;

                if (altura > alturaMax) {
                    altura = alturaMax;
                    largura = altura * proporcao;
                }

                pdfOrnamental.addImage(
                    imagem.dataUrl,
                    "PNG",
                    x + (larguraMax - largura) / 2,
                    y + (alturaMax - altura) / 2,
                    largura,
                    altura
                );
            }

            function textoAjustado(texto, larguraMaxima, tamanhoInicial, tamanhoMinimo, fonte, estilo) {
                let tamanho = tamanhoInicial;
                pdfOrnamental.setFont(fonte, estilo);
                pdfOrnamental.setFontSize(tamanho);

                while (
                    pdfOrnamental.getTextWidth(texto) > larguraMaxima &&
                    tamanho > tamanhoMinimo
                ) {
                    tamanho -= 0.5;
                    pdfOrnamental.setFontSize(tamanho);
                }

                return tamanho;
            }

            function desenharLogoEtiqueta(x, y, larguraMaxima, alturaMaxima) {
                if (!imagemLogoEtiqueta) {
                    return;
                }

                desenharImagemProporcional(
                    imagemLogoEtiqueta,
                    x,
                    y,
                    larguraMaxima,
                    alturaMaxima
                );
            }

            function desenharEtiquetaNaPosicao(produto, x, y) {
                const horizontal = orientacaoEtiquetaImpressao === "horizontal";
                desenharFundo(x, y, cfg.largura, cfg.altura);

                const centroX = x + cfg.largura / 2;
                const nomeProduto = nomesCompletosVisiveis[produto.id]
                    ? String(produto?.nome || "").trim()
                    : obterNomeExibicao(produto);

                const imagemProduto = produto.usarImagemEtiqueta
                    ? imagensProdutos.get(produto.imagem_etiqueta)
                    : null;

                const corTexto = produto.promocao
                    ? converterHexParaRgb(corTextoPromocao)
                    : cfg.corTexto;

                pdfOrnamental.setTextColor(...corTexto);

                if (!horizontal) {
                    // LOGO DA LOJA NA ETIQUETA VERTICAL
                    // LOGO DA LOJA NA ETIQUETA VERTICAL
                    desenharLogoEtiqueta(
                        centroX - 7,
                        y + 3,
                        14,
                        9
                    );

                    // NOME DA LOJA NA ETIQUETA VERTICAL
                    pdfOrnamental.setFont(
                        fonteOrnamentalAplicada.fonte,
                        fonteOrnamentalAplicada.estilo
                    );

                    const nomeLojaVertical = String(
                        nomeLojaEtiqueta || "SUA LOJA"
                    ).toUpperCase().trim();

                    let fonteLojaVertical = 8;
                    let linhasLojaVertical = [];

                    do {
                        pdfOrnamental.setFontSize(fonteLojaVertical);

                        linhasLojaVertical = pdfOrnamental.splitTextToSize(
                            nomeLojaVertical,
                            cfg.largura - 12
                        );

                        if (
                            linhasLojaVertical.length <= 2 ||
                            fonteLojaVertical <= 5
                        ) {
                            break;
                        }

                        fonteLojaVertical -= 0.5;
                    } while (fonteLojaVertical >= 5);

                    pdfOrnamental.setFontSize(fonteLojaVertical);

                    pdfOrnamental.setTextColor(...cfg.corTexto);

                    pdfOrnamental.text(
                        linhasLojaVertical.slice(0, 2),
                        centroX,
                        y + 16,
                        {
                            align: "center",
                            lineHeightFactor: 1.05
                        }
                    );
                    pdfOrnamental.setFont(
                        fonteOrnamentalAplicada.fonte,
                        fonteOrnamentalAplicada.estilo
                    );

                    // Aumenta a fonte em 1/3 para nomes com até 12 palavras.
                    const quantidadePalavras = nomeProduto
                        .split(/\s+/)
                        .filter(Boolean)
                        .length;

                    let fonteNome = !produto.promocao
                        ? cfg.produtoFonte * 1.5
                        : quantidadePalavras <= 12
                            ? cfg.produtoFonte * (4 / 3)
                            : cfg.produtoFonte;

                    let nomeLinhas = [];

                    while (fonteNome >= cfg.produtoFonteMinima) {
                        pdfOrnamental.setFontSize(fonteNome);

                        nomeLinhas = pdfOrnamental.splitTextToSize(
                            nomeProduto,
                            cfg.largura - 17
                        );

                        if (nomeLinhas.length <= 2) {
                            break;
                        }

                        fonteNome -= 0.5;
                    }

                    pdfOrnamental.setFontSize(fonteNome);

                    pdfOrnamental.text(
                        nomeLinhas.slice(0, 2),
                        centroX,
                        y + cfg.produtoY,
                        {
                            align: "center",
                            lineHeightFactor: 1.05
                        }
                    );


                    // INDICAÇÃO DE PROMOÇÃO NA ETIQUETA VERTICAL
                    if (produto.promocao) {
                        // Destaque da promoção
                        pdfOrnamental.setFont("helvetica", "bold");
                        pdfOrnamental.setFontSize(11.5);
                        pdfOrnamental.setTextColor(160, 65, 45);

                        pdfOrnamental.text(
                            "PROMOÇÃO",
                            centroX,
                            y + 34,
                            { align: "center" }
                        );

                        // Preço anterior, quando informado
                        if (String(produto.precoAnterior ?? "").trim() !== "") {
                            const precoAnterior = Number(
                                String(produto.precoAnterior).replace(",", ".")
                            );

                            if (Number.isFinite(precoAnterior) && precoAnterior > 0) {
                                const textoAnterior = `R$ ${formatarPreco(precoAnterior)}`;

                                pdfOrnamental.setFont("helvetica", "normal");
                                pdfOrnamental.setFontSize(7);
                                pdfOrnamental.setTextColor(125, 110, 95);

                                pdfOrnamental.text(
                                    textoAnterior,
                                    centroX,
                                    y + 39,
                                    { align: "center" }
                                );

                                // Risco central sobre o preço antigo
                                const larguraAnterior = pdfOrnamental.getTextWidth(textoAnterior);

                                pdfOrnamental.setDrawColor(125, 110, 95);
                                pdfOrnamental.setLineWidth(0.25);

                                pdfOrnamental.line(
                                    centroX - larguraAnterior / 2,
                                    y + 38.1,
                                    centroX + larguraAnterior / 2,
                                    y + 38.1
                                );
                            }
                        }
                    }

                    const preco = `R$ ${formatarPreco(produto.preco)}`;
                    const fontePreco = textoAjustado(
                        preco,
                        cfg.largura - 14,
                        produto.promocao ? cfg.precoFonte : cfg.precoFonte + 3,
                        cfg.precoFonteMinima,
                        fonteOrnamentalAplicada.fonte,
                        fonteOrnamentalAplicada.estilo
                    );

                    pdfOrnamental.setTextColor(...cfg.corPreco);
                    pdfOrnamental.setFontSize(fontePreco);
                    pdfOrnamental.text(preco, centroX, y + cfg.precoY, {
                        align: "center"
                    });

                    const dolar = calcularPrecoDolar(produto.preco);
                    if (dolar !== null) {
                        pdfOrnamental.setTextColor(...corTexto);
                        pdfOrnamental.setFont("helvetica", "bold");
                        pdfOrnamental.setFontSize(cfg.dolarFonte);
                        pdfOrnamental.text(
                            `US$ ${Number(dolar).toFixed(2)}`,
                            centroX,
                            y + cfg.dolarY,
                            { align: "center" }
                        );
                    }

                    if (imagemProduto) {
                        desenharImagemProporcional(
                            imagemProduto,
                            centroX - cfg.imagemMaxLargura / 2,
                            y + cfg.imagemVerticalY,
                            cfg.imagemMaxLargura,
                            cfg.imagemMaxAltura
                        );
                    }


                } else {
                    // HORIZONTAL: logo à esquerda, loja à direita e produto mais abaixo.
                    // LOGO À ESQUERDA
                    desenharLogoEtiqueta(
                        x + 4.5,
                        y + 5.5,
                        12,
                        8.4
                    );

                    // PALAVRA PROMOÇÃO ABAIXO DO LOGO
                    if (produto.promocao) {
                        pdfOrnamental.setFont("helvetica", "bold");
                        pdfOrnamental.setFontSize(7);
                        pdfOrnamental.setTextColor(160, 65, 45);

                        pdfOrnamental.text(
                            "PROMOÇÃO",
                            x + 10.5,
                            y + 17,
                            { align: "center" }
                        );
                    }

                    // NOME DA LOJA À DIREITA
                    pdfOrnamental.setFont(
                        fonteOrnamentalAplicada.fonte,
                        fonteOrnamentalAplicada.estilo
                    );

                    const nomeLojaHorizontal = String(
                        nomeLojaEtiqueta || "SUA LOJA"
                    ).toUpperCase().trim();

                    let fonteLojaHorizontal = 9.8;
                    let linhasLojaHorizontal = [];

                    // Reduz a fonte até o nome ocupar no máximo duas linhas.
                    do {
                        pdfOrnamental.setFontSize(fonteLojaHorizontal);

                        linhasLojaHorizontal = pdfOrnamental.splitTextToSize(
                            nomeLojaHorizontal,
                            44
                        );

                        if (
                            linhasLojaHorizontal.length <= 2 ||
                            fonteLojaHorizontal <= 4.5
                        ) {
                            break;
                        }

                        fonteLojaHorizontal -= 0.5;
                    } while (fonteLojaHorizontal >= 4.5);

                    pdfOrnamental.setFontSize(fonteLojaHorizontal);

                    pdfOrnamental.text(
                        linhasLojaHorizontal.slice(0, 2),
                        x + cfg.largura - 10,
                        y + 10.5,
                        {
                            align: "right",
                            lineHeightFactor: 1.05
                        }
                    );

                    // NOME DO PRODUTO, UM POUCO MAIS ABAIXO
                    pdfOrnamental.setFont(
                        fonteOrnamentalAplicada.fonte,
                        fonteOrnamentalAplicada.estilo
                    );

                    pdfOrnamental.setFontSize(
                        produto.promocao ? 16 : 20
                    );
                    const nomeHorizontal = pdfOrnamental.splitTextToSize(
                        nomeProduto,
                        cfg.largura - 22
                    ).slice(0, 2);

                    pdfOrnamental.text(
                        nomeHorizontal,
                        centroX - 3,
                        y + 23,
                        {
                            align: "center",
                            lineHeightFactor: 1.08
                        }
                    );

                    // PREÇO ANTERIOR

                    if (produto.promocao && produto.precoAnterior !== "") {
                        const precoAnterior = Number(
                            String(produto.precoAnterior).replace(",", ".")
                        );

                        if (Number.isFinite(precoAnterior) && precoAnterior >= 0) {
                            const textoAnterior = `R$ ${formatarPreco(precoAnterior)}`;

                            pdfOrnamental.setFont("helvetica", "normal");
                            pdfOrnamental.setFontSize(9);
                            pdfOrnamental.setTextColor(115, 91, 57);

                            pdfOrnamental.text(textoAnterior, centroX - 3, y + 30, {
                                align: "center"
                            });

                            const larguraAnterior = pdfOrnamental.getTextWidth(textoAnterior);

                            pdfOrnamental.setDrawColor(115, 91, 57);
                            pdfOrnamental.setLineWidth(0.2);

                            pdfOrnamental.line(
                                centroX - 3 - larguraAnterior / 2,
                                y + 28.5,
                                centroX - 3 + larguraAnterior / 2,
                                y + 28.5
                            );
                        }
                    }

                    // PREÇO PRINCIPAL
                    const preco = `R$ ${formatarPreco(produto.preco)}`;

                    const fontePreco = textoAjustado(
                        preco,
                        cfg.largura - 16,
                        24,
                        17,
                        fonteOrnamentalAplicada.fonte,
                        fonteOrnamentalAplicada.estilo
                    );

                    pdfOrnamental.setTextColor(...cfg.corPreco);
                    pdfOrnamental.setFontSize(fontePreco);

                    pdfOrnamental.text(preco, centroX - 3, y + 36, {
                        align: "center"
                    });

                    // PREÇO EM DÓLAR
                    const dolar = calcularPrecoDolar(produto.preco);

                    if (dolar !== null) {
                        pdfOrnamental.setTextColor(...corTexto);
                        pdfOrnamental.setFont("helvetica", "bold");
                        pdfOrnamental.setFontSize(9.5);

                        pdfOrnamental.text(
                            `US$ ${Number(dolar).toFixed(2)}`,
                            x + 19,
                            y + 39,
                            { align: "center" }
                        );
                    }

                    // IMAGEM DO PRODUTO
                    // IMAGEM DO PRODUTO
                    if (imagemProduto) {
                        desenharImagemProporcional(
                            imagemProduto,
                            x + cfg.largura - 21,
                            y + 26,
                            18,
                            16
                        );
                    }
                }

            }

            // Distribuição fixa em quatro colunas por linha.
            // A altura da etiqueta é fixa, não cresce conforme o texto.
            const linhasPorPagina = Math.floor(
                (alturaFolha - cfg.margemY * 2 + cfg.espacamentoY) /
                (cfg.altura + cfg.espacamentoY)
            );
            const etiquetasPorPagina = cfg.colunas * linhasPorPagina;

            produtosExpandido.forEach((produto, indice) => {
                if (indice > 0 && indice % etiquetasPorPagina === 0) {
                    pdfOrnamental.addPage();
                }

                const indiceNaPagina = indice % etiquetasPorPagina;
                const coluna = indiceNaPagina % cfg.colunas;
                const linha = Math.floor(indiceNaPagina / cfg.colunas);

                const x = cfg.margemX + coluna * (
                    cfg.largura + cfg.espacamentoX
                );
                const y = cfg.margemY + linha * (
                    cfg.altura + cfg.espacamentoY
                );

                desenharEtiquetaNaPosicao(produto, x, y);
            });

            pdfOrnamental.save("etiquetas-ornamentais.pdf");
        } catch (erro) {
            console.error("Erro ao gerar etiquetas ornamentais:", erro);
            alert(
                erro.message ||
                "Não foi possível gerar as etiquetas ornamentais."
            );
        }
    }

    // ===============================
    // GERAR PDF
    // ===============================
    async function imprimirEtiquetas() {
        // O modo básico continua usando integralmente a impressão original.
        if (tipoEtiquetaImpressao === "ornamental") {
            await imprimirEtiquetasOrnamentais();
            return;
        }

        if (selecionados.length === 0) {
            alert(
                "Adicione pelo menos um produto para impressão."
            );
            return;
        }

        // Salva em preco_etiqueta o preço atual
        // dos produtos que serão impressos
        try {
            const produtosIds = [
                ...new Set(
                    selecionados.map(
                        produto => produto.id
                    )
                )
            ];

            const resposta = await fetch(
                `${API_URL}/admin/etiquetas/produtos/registrar-impressao`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        produtos_ids: produtosIds,
                    }),
                }
            );

            if (!resposta.ok) {
                const dadosErro = await resposta
                    .json()
                    .catch(() => null);

                throw new Error(
                    dadosErro?.detail ||
                    "Erro ao registrar os preços das etiquetas."
                );
            }

        } catch (erro) {
            console.error(
                "Erro ao registrar preços das etiquetas:",
                erro
            );

            alert(
                erro.message ||
                "Não foi possível registrar os preços das etiquetas."
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

            // A etiqueta imprime exatamente o modo de nome escolhido na tela:
            // completo quando o usuário clicou no nome; normal caso contrário.
            const nomeParaImprimir = nomesCompletosVisiveis[produto.id]
                ? String(produto?.nome || "").trim()
                : obterNomeExibicao(produto);

            const nomeQuebrado =
                pdf.splitTextToSize(
                    nomeParaImprimir,
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

    function alternarPainelVariedades(produtoId) {
        setProdutoVariedadesAberto(atual =>
            atual === produtoId ? null : produtoId
        );
    }

    function alternarVariedadeEtiqueta(produtoPrincipal, variedade) {
        const jaSelecionada = selecionados.some(
            item => item.id === variedade.id
        );

        if (jaSelecionada) {
            removerDaImpressao(variedade.id);
            return;
        }

        adicionarParaImpressao({
            ...variedade,
            produtoPrincipalId: produtoPrincipal.id,
            nomeProdutoPrincipal: produtoPrincipal.nome,
            ehVariedadeEtiqueta: true,
        });
    }

    // ===============================
    // CARD PRODUTO
    // ===============================
    // Substitua a função renderizarProduto(produto, lado) inteira por esta versão.
    function renderizarProduto(produto, lado) {
        const editando = editandoPrecoId === produto.id;

        return (
            <div
                className={`etq-v2-produto-card-individual ${editando
                    ? "etq-v2-produto-card-editando-preco"
                    : ""
                    }`}
                key={produto.id}
            >
                <div className="etq-v2-produto-informacoes-bloco">

                    <strong
                        className="etq-v2-produto-nome-texto"
                        role="button"
                        tabIndex={0}
                        title={
                            nomesCompletosVisiveis[produto.id]
                                ? "Clique para mostrar o nome normal"
                                : "Clique para mostrar o nome completo"
                        }
                        aria-label={
                            nomesCompletosVisiveis[produto.id]
                                ? `Mostrar nome normal de ${produto.nome || "produto"}`
                                : `Mostrar nome completo de ${produto.nome || "produto"}`
                        }
                        style={{ cursor: "pointer" }}
                        onClick={() => alternarNomeProduto(produto.id)}
                        onKeyDown={evento => {
                            if (evento.key === "Enter" || evento.key === " ") {
                                evento.preventDefault();
                                alternarNomeProduto(produto.id);
                            }
                        }}
                    >
                        {nomesCompletosVisiveis[produto.id]
                            ? String(produto?.nome || "").trim()
                            : obterNomeExibicao(produto)}
                    </strong>

                    {!editando && (
                        <span className="etq-v2-produto-preco-texto">
                            R$ {formatarPreco(produto.preco)}
                        </span>
                    )}

                    {editando && (
                        <div className="etq-v2-edicao-preco-area">

                            <span className="etq-v2-edicao-preco-prefixo">
                                R$
                            </span>

                            <input
                                className="etq-v2-edicao-preco-input"
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
                        <div className="etq-v2-quantidade-impressao-area">

                            <label
                                className="etq-v2-quantidade-impressao-label"
                                htmlFor={`quantidade-etiqueta-${produto.id}`}
                            >
                                Quantidade
                            </label>
                            {/* =========================================================
    PRÉVIA DA IMAGEM SEM FUNDO DA ETIQUETA
    SOMENTE NA COLUNA DE IMPRESSÃO
========================================================= */}

                            {lado === "direita" &&
                                produto.usarImagemEtiqueta &&
                                produto.imagem_etiqueta && (
                                    <div className="etq-v2-card-preview-imagem-sem-fundo-area">
                                        <img
                                            className="etq-v2-card-preview-imagem-sem-fundo"
                                            src={produto.imagem_etiqueta}
                                            alt=""
                                            draggable="false"
                                        />
                                    </div>
                                )}
                            <input
                                id={`quantidade-etiqueta-${produto.id}`}
                                className="etq-v2-quantidade-impressao-input"
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

                <div
                    className={`etq-v2-produto-acoes-area ${editando
                        ? "etq-v2-produto-acoes-editando-preco"
                        : ""
                        }`}
                >

                    {/* =============================================
                    PREÇO
                ============================================= */}

                    {!editando ? (
                        <button
                            type="button"
                            className="etq-v2-acao-alterar-preco"
                            onClick={() =>
                                iniciarEdicaoPreco(produto)
                            }
                        >
                            Mudar preço
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="etq-v2-acao-salvar-preco"
                                onClick={() =>
                                    salvarNovoPreco(produto)
                                }
                            >
                                Salvar
                            </button>



                            <button
                                type="button"
                                className="etq-v2-acao-cancelar-preco"
                                onClick={cancelarEdicaoPreco}
                            >
                                Cancelar
                            </button>
                        </>
                    )}


                    {/* =============================================
                    LADO ESQUERDO
                ============================================= */}

                    {lado === "esquerda" && (
                        <button
                            type="button"
                            className="etq-v2-acao-mover-direita"
                            onClick={() =>
                                moverProdutoFiltradoParaImpressao(produto)
                            }
                            title="Adicionar para impressão"
                        >
                            →
                        </button>
                    )}


                    {/* =============================================
                    LADO DIREITO

                    IMAGEM / ESCOLHER IMAGEM / PROMOÇÃO
                    SOMEM DURANTE EDIÇÃO DE PREÇO
                ============================================= */}

                    {lado === "direita" && (
                        <>

                            {!editando &&
                                Array.isArray(produto.variedades) &&
                                produto.variedades.length > 0 && (
                                    <div className="etq-v2-variedades-area">
                                        <button
                                            type="button"
                                            className="etq-v2-variedades-botao"
                                            onClick={() =>
                                                alternarPainelVariedades(produto.id)
                                            }
                                            aria-expanded={
                                                produtoVariedadesAberto === produto.id
                                            }
                                        >
                                            <span>Selecionar variedades</span>

                                            <span className="etq-v2-variedades-contador">
                                                {produto.variedades.filter(variedade =>
                                                    selecionados.some(
                                                        item => item.id === variedade.id
                                                    )
                                                ).length}
                                                {" / "}
                                                {produto.variedades.length}
                                            </span>

                                            <span className="etq-v2-variedades-seta">
                                                {produtoVariedadesAberto === produto.id
                                                    ? "−"
                                                    : "+"}
                                            </span>
                                        </button>

                                        {produtoVariedadesAberto === produto.id && (
                                            <div className="etq-v2-variedades-lista">
                                                {produto.variedades.map(variedade => {
                                                    const marcada = selecionados.some(
                                                        item => item.id === variedade.id
                                                    );

                                                    return (
                                                        <label
                                                            key={variedade.id}
                                                            className="etq-v2-variedades-item"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={marcada}
                                                                onChange={() =>
                                                                    alternarVariedadeEtiqueta(
                                                                        produto,
                                                                        variedade
                                                                    )
                                                                }
                                                            />

                                                            <span className="etq-v2-variedades-dados">
                                                                <strong>
                                                                    {String(variedade?.nome || "").trim()}
                                                                </strong>

                                                                <small>
                                                                    R$ {formatarPreco(variedade.preco)}
                                                                </small>
                                                            </span>

                                                            <span
                                                                className={
                                                                    marcada
                                                                        ? "etq-v2-variedades-status etq-v2-variedades-status-ativa"
                                                                        : "etq-v2-variedades-status"
                                                                }
                                                            >
                                                                {marcada ? "Selecionada" : "Adicionar"}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}


                            {!editando && (
                                <>
                                    <button
                                        type="button"
                                        className={`etq-v2-imagem-produto-controle ${produto.usarImagemEtiqueta &&
                                            produto.imagem_etiqueta
                                            ? "etq-v2-imagem-produto-com-imagem"
                                            : "etq-v2-imagem-produto-sem-imagem"
                                            }`}
                                        onClick={() =>
                                            alternarUsoImagemEtiqueta(
                                                produto.id
                                            )
                                        }
                                        onDoubleClick={() =>
                                            abrirModalImagemEtiqueta(
                                                produto
                                            )
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
                                        className="etq-v2-imagem-produto-editar"
                                        onClick={() =>
                                            abrirModalImagemEtiqueta(
                                                produto
                                            )
                                        }
                                    >
                                        Escolher imagem
                                    </button>

                                    <button
                                        type="button"
                                        className="etq-v2-acao-promocao"
                                        data-ativo={
                                            produto.promocao
                                                ? "true"
                                                : "false"
                                        }
                                        onClick={() =>
                                            alternarPromocao(
                                                produto.id
                                            )
                                        }
                                    >
                                        {produto.promocao
                                            ? "Promoção ✓"
                                            : "Promoção"}
                                    </button>
                                </>
                            )}


                            {/* =============================================
                            PREÇO ANTERIOR

                            Também some durante edição
                        ============================================= */}

                            {!editando && produto.promocao && (
                                <div className="etq-v2-promocao-preco-anterior-area">

                                    <label
                                        className="etq-v2-promocao-preco-anterior-label"
                                        htmlFor={`preco-anterior-promocao-${produto.id}`}
                                    >
                                        Preço anterior
                                    </label>

                                    <div className="etq-v2-promocao-preco-anterior-campo">

                                        <span className="etq-v2-promocao-preco-anterior-prefixo">
                                            R$
                                        </span>

                                        <input
                                            id={`preco-anterior-promocao-${produto.id}`}
                                            className="etq-v2-promocao-preco-anterior-input"
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
                                        />

                                    </div>

                                </div>
                            )}


                            {/* =============================================
                            REMOVER

                            CONTINUA DISPONÍVEL
                        ============================================= */}

                            <button
                                type="button"
                                className="etq-v2-acao-mover-esquerda"
                                onClick={() =>
                                    removerDaImpressao(
                                        produto.id
                                    )
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

                    {/* =====================================================
                        SELETOR DO MODELO E DA ORIENTAÇÃO DA ETIQUETA
                    ====================================================== */}
                    <div
                        className="etiquetas-seletor-modelo-ornamental"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: "12px",
                            width: "100%",
                            padding: "12px 14px",
                            marginBottom: "12px",
                            border: "1px solid #e7dfcf",
                            borderRadius: "12px",
                            background: "#fffdf8"
                        }}
                    >
                        <label
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                                minWidth: "155px",
                                color: "#55452d",
                                fontSize: "12px",
                                fontWeight: 700
                            }}
                        >
                            Modelo da etiqueta
                            <select
                                value={tipoEtiquetaImpressao}
                                onChange={e => setTipoEtiquetaImpressao(e.target.value)}
                                style={{
                                    minHeight: "38px",
                                    padding: "7px 10px",
                                    border: "1px solid #d8c9a9",
                                    borderRadius: "8px",
                                    background: "#ffffff",
                                    color: "#42351f",
                                    fontSize: "13px"
                                }}
                            >
                                <option value="basica">Básica</option>
                                <option value="ornamental">Ornamental dourada</option>
                            </select>
                        </label>

                        {tipoEtiquetaImpressao === "ornamental" && (
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "5px",
                                    minWidth: "145px",
                                    color: "#55452d",
                                    fontSize: "12px",
                                    fontWeight: 700
                                }}
                            >
                                Orientação
                                <select
                                    value={orientacaoEtiquetaImpressao}
                                    onChange={e => setOrientacaoEtiquetaImpressao(e.target.value)}
                                    style={{
                                        minHeight: "38px",
                                        padding: "7px 10px",
                                        border: "1px solid #d8c9a9",
                                        borderRadius: "8px",
                                        background: "#ffffff",
                                        color: "#42351f",
                                        fontSize: "13px"
                                    }}
                                >
                                    <option value="vertical">Vertical</option>
                                    <option value="horizontal">Horizontal</option>
                                </select>
                            </label>
                        )}{tipoEtiquetaImpressao === "ornamental" && (
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "5px",
                                    minWidth: "155px",
                                    color: "#55452d",
                                    fontSize: "12px",
                                    fontWeight: 700
                                }}
                            >
                                Fonte ornamental

                                <select
                                    value={fonteOrnamental}
                                    onChange={e => setFonteOrnamental(e.target.value)}
                                    style={{
                                        minHeight: "38px",
                                        padding: "7px 10px",
                                        border: "1px solid #d8c9a9",
                                        borderRadius: "8px",
                                        background: "#ffffff",
                                        color: "#42351f",
                                        fontSize: "13px"
                                    }}
                                >
                                    {fontesOrnamentais.map(fonte => (
                                        <option key={fonte.valor} value={fonte.valor}>
                                            {fonte.nome}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {tipoEtiquetaImpressao === "ornamental" && (

                            <span
                                style={{
                                    alignSelf: "center",
                                    color: "#8b6a2d",
                                    fontSize: "11px",
                                    lineHeight: 1.4
                                }}
                            >
                                Fundo ornamental dourado, quatro etiquetas por linha.
                            </span>
                        )}
                    </div>

                    {/* ===============================
        ETIQUETA NORMAL
    =============================== */}
                    {tipoEtiquetaImpressao === "basica" && (
                        <>
                            {/* ===============================
            PERSONALIZAÇÃO DA ETIQUETA BÁSICA
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


                        </>
                    )}
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
                    className={`etiquetas-coluna-impressao-selecionada etiquetas-impressao-layout-renovado ${abaMobileEtiquetas === "etiquetas"
                        ? "etiquetas-coluna-mobile-visivel"
                        : "etiquetas-coluna-mobile-oculta"
                        }`}
                >
                    <div className="etiquetas-coluna-cabecalho etiquetas-impressao-cabecalho-renovado">
                        <div className="etiquetas-impressao-titulo-contador-area">
                            <h3>
                                Impressão
                            </h3>

                            <span>
                                {selecionados.length}
                            </span>
                        </div>

                        {selecionados.length > 0 && (
                            <button
                                type="button"
                                className="etiquetas-impressao-remover-todos-botao"
                                onClick={removerTodosDaImpressao}
                            >
                                Tirar tudo
                            </button>
                        )}
                    </div>
                    <div className="etiquetas-listagem-impressao-scroll etiquetas-impressao-listagem-renovada">
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
                            selecionados.map(produto => (
                                <div
                                    key={produto.id}
                                    className="etiquetas-impressao-produto-wrapper-renovado"
                                >
                                    {renderizarProduto(
                                        produto,
                                        "direita"
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

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
                                        {obterNomeExibicao(modalImagemEtiqueta)}
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
            {alertaLimiteEtiquetas &&
                createPortal(
                    <div className="etiquetas-limite-alerta-overlay">
                        <div className="etiquetas-limite-alerta-modal">
                            <div className="etiquetas-limite-alerta-icone">
                                !
                            </div>

                            <div className="etiquetas-limite-alerta-conteudo">
                                <strong>
                                    Limite de impressão
                                </strong>

                                <p>
                                    {alertaLimiteEtiquetas}
                                </p>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div>
    );
}
