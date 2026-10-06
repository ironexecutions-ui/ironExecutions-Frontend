import React, {
    useState
} from "react";

import { API_URL } from "../../../../../../config";

import "./pdf.css"
const IRONSTORE_APP_KEY_GERAL =
    import.meta.env.VITE_IRONSTORE_APP_KEY_GERAL;

const IRONSTORE_APP_KEY_HEADER =
    import.meta.env.VITE_IRONSTORE_APP_KEY_HEADER;

const IRONSTORE_APP_KEY_FOOTER =
    import.meta.env.VITE_IRONSTORE_APP_KEY_FOOTER;


/* =========================================================
   DOMÍNIO
========================================================= */

function pegarDominioAtualPDF() {
    return "missionarystorebrasil.com.br";
}


/* =========================================================
   FORMATAR PREÇO

   Mantém a mesma lógica usada no IronStore:
   10
   10.50
   "10.50"
   "10,50"
   "R$ 10,50"
========================================================= */

function formatarPrecoPDF(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "";

    }


    let texto =
        String(valor)
            .trim()
            .replace(/\s/g, "")
            .replace("R$", "");


    if (
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    }


    const numero =
        Number(texto);


    if (
        Number.isNaN(numero)
    ) {

        return String(valor);

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   VERIFICAR PROMOÇÃO
========================================================= */

function possuiPrecoPromocionalPDF(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return false;

    }


    const texto =
        String(valor).trim();


    if (!texto) {

        return false;

    }


    const numero =
        Number(
            texto
                .replace(/\./g, "")
                .replace(",", ".")
                .replace("R$", "")
                .trim()
        );


    return (
        !Number.isNaN(numero) &&
        numero > 0
    );

}


/* =========================================================
   PEGAR PREÇO FINAL
========================================================= */

function obterPrecosPDF(
    produto
) {

    const precoNormal =
        produto?.preco;


    const promocao =
        produto?.preco_promocao;


    if (
        possuiPrecoPromocionalPDF(
            promocao
        )
    ) {

        return {

            promocao: true,

            atual:
                formatarPrecoPDF(
                    promocao
                ),

            anterior:
                formatarPrecoPDF(
                    precoNormal
                )

        };

    }


    return {

        promocao: false,

        atual:
            formatarPrecoPDF(
                precoNormal
            ),

        anterior: ""

    };

}


/* =========================================================
   NORMALIZAR PRODUTO PARA O PDF
========================================================= */

function normalizarProdutoPDF(
    produto
) {

    const variedades =
        Array.isArray(
            produto?.variedades
        )
            ? produto.variedades
            : [];


    return {

        ...produto,

        id:
            produto?.id ?? null,

        nome:
            produto?.nome || "",

        descricao:
            produto?.descricao ||
            produto?.descricao_curta ||
            "",

        categoria:
            produto?.categoria || "",

        imagem_url:
            produto?.imagem_url || "",

        preco:
            produto?.preco ?? null,

        preco_promocao:
            produto?.preco_promocao ?? "",

        variedades

    };

}


/* =========================================================
   NORMALIZAR CACHE DE CATEGORIAS

   A chave segue exatamente o padrão usado pelo IronStore:
   ironstore_categorias_{dominio}
========================================================= */

function lerCacheCategoriasPDF() {

    const dominio =
        pegarDominioAtualPDF();

    const chave =
        `ironstore_categorias_${dominio}`;


    try {

        const salvo =
            localStorage.getItem(
                chave
            );


        if (!salvo) {

            return null;

        }


        const dados =
            JSON.parse(
                salvo
            );


        return {

            ...dados,

            comercio:
                dados?.comercio || {},

            produtos:
                Array.isArray(
                    dados?.produtos
                )
                    ? dados.produtos.map(
                        normalizarProdutoPDF
                    )
                    : []

        };

    } catch (erro) {

        console.warn(
            "[PDF PRODUTOS] Cache inválido:",
            erro
        );


        localStorage.removeItem(
            chave
        );


        return null;

    }

}


/* =========================================================
   SALVAR CACHE DE CATEGORIAS

   Mantém somente os dados necessários para o fallback.
========================================================= */

function salvarCacheCategoriasPDF(
    dados
) {

    const dominio =
        pegarDominioAtualPDF();

    const chave =
        `ironstore_categorias_${dominio}`;


    try {

        localStorage.setItem(
            chave,
            JSON.stringify(
                {
                    comercio:
                        dados?.comercio || {},

                    produtos:
                        Array.isArray(
                            dados?.produtos
                        )
                            ? dados.produtos
                            : [],

                    modelo:
                        dados?.modelo ||
                        "classico"
                }
            )
        );

    } catch (erro) {

        console.warn(
            "[PDF PRODUTOS] Não foi possível salvar cache:",
            erro
        );

    }

}


/* =========================================================
   NORMALIZAR FOOTER
========================================================= */

function normalizarFooterPDF(
    dados
) {

    return {

        comercio:
            dados?.comercio || {},

        footer:
            dados?.footer || {},

        modelo:
            dados?.modelo ||
            "classico"

    };

}


/* =========================================================
   LER CACHE DO FOOTER

   A chave segue o padrão oficial:
   ironstore_footer_{dominio}
========================================================= */

function lerCacheFooterPDF() {

    const dominio =
        pegarDominioAtualPDF();

    const chave =
        `ironstore_footer_${dominio}`;


    try {

        const salvo =
            localStorage.getItem(
                chave
            );


        if (!salvo) {

            return null;

        }


        return normalizarFooterPDF(
            JSON.parse(
                salvo
            )
        );

    } catch (erro) {

        console.warn(
            "[PDF PRODUTOS] Cache do footer inválido:",
            erro
        );


        localStorage.removeItem(
            chave
        );


        return null;

    }

}


/* =========================================================
   LER CACHE DO HEADER
========================================================= */

function lerCacheHeaderPDF() {

    const dominio =
        pegarDominioAtualPDF();

    const chave =
        `ironstore_header_${dominio}`;


    try {

        const salvo =
            localStorage.getItem(
                chave
            );


        if (!salvo) {

            return null;

        }


        return JSON.parse(
            salvo
        );

    } catch {

        localStorage.removeItem(
            chave
        );

        return null;

    }

}


/* =========================================================
   ESCAPAR HTML

   Evita que nome, descrição ou dados do comércio
   que venham do backend quebrem o documento.
========================================================= */

function escaparHTMLPDF(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   QUEBRAR TEXTO
========================================================= */

function textoSeguroPDF(
    valor
) {

    return escaparHTMLPDF(
        valor
    )
        .replace(
            /\r?\n/g,
            "<br>"
        );

}


/* =========================================================
   IMAGENS

   imagem_url pode conter várias URLs separadas por "|".
========================================================= */

function separarImagensPDF(
    imagemURL
) {

    return String(
        imagemURL || ""
    )
        .split("|")
        .map(
            imagem =>
                imagem.trim()
        )
        .filter(
            Boolean
        );

}


/* =========================================================
   IMAGEM PRINCIPAL
========================================================= */

function primeiraImagemPDF(
    imagemURL
) {

    return (
        separarImagensPDF(
            imagemURL
        )[0] || ""
    );

}


/* =========================================================
   CONVERTER VALOR EM TEXTO
========================================================= */

function valorOuVazioPDF(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(
        valor
    ).trim();

}


/* =========================================================
   MONTAR PRODUTO
========================================================= */

function montarProdutoHTMLPDF(
    produto,
    indice
) {

    const nome =
        valorOuVazioPDF(
            produto?.nome
        ) ||
        "Produto";


    const descricao =
        valorOuVazioPDF(
            produto?.descricao
        ) ||
        valorOuVazioPDF(
            produto?.descricao_curta
        );


    const categoria =
        valorOuVazioPDF(
            produto?.categoria
        );


    const imagem =
        primeiraImagemPDF(
            produto?.imagem_url
        );


    const precos =
        obterPrecosPDF(
            produto
        );


    const variedades =
        Array.isArray(
            produto?.variedades
        )
            ? produto.variedades
            : [];


    const variedadesVisiveis =
        variedades.filter(
            variedade =>
                valorOuVazioPDF(
                    variedade?.nome
                )
        );


    const imagemHTML =
        imagem
            ? `
                <div class="pdfprodutos-produto-imagem">
                    <img
                        src="${escaparHTMLPDF(imagem)}"
                        alt="${escaparHTMLPDF(nome)}"
                    >
                </div>
            `
            : `
                <div class="pdfprodutos-produto-imagem pdfprodutos-produto-imagem-vazia">
                    <div class="pdfprodutos-imagem-placeholder">
                        <span>Sem imagem</span>
                    </div>
                </div>
            `;


    const categoriaHTML =
        categoria
            ? `
                <div class="pdfprodutos-produto-categoria">
                    ${escaparHTMLPDF(categoria)}
                </div>
            `
            : "";


    const descricaoHTML =
        descricao
            ? `
                <div class="pdfprodutos-produto-descricao">
                    ${textoSeguroPDF(descricao)}
                </div>
            `
            : `
                <div class="pdfprodutos-produto-descricao pdfprodutos-produto-descricao-vazia">
                    Consulte a loja para mais informações.
                </div>
            `;


    const precoHTML =
        precos.promocao
            ? `
                <div class="pdfprodutos-produto-preco-box">
                    <div class="pdfprodutos-produto-preco-anterior">
                        ${escaparHTMLPDF(precos.anterior)}
                    </div>

                    <div class="pdfprodutos-produto-preco-promocional">
                        ${escaparHTMLPDF(precos.atual)}
                    </div>

                    <div class="pdfprodutos-produto-preco-legenda">
                        Oferta
                    </div>
                </div>
            `
            : `
                <div class="pdfprodutos-produto-preco-box">
                    <div class="pdfprodutos-produto-preco-normal">
                        ${escaparHTMLPDF(precos.atual)}
                    </div>
                </div>
            `;


    let variedadesHTML = "";


    if (
        variedadesVisiveis.length > 0
    ) {

        const linhas =
            variedadesVisiveis.map(
                variedade => {

                    const precoVariedade =
                        obterPrecosPDF(
                            {
                                preco:
                                    variedade?.preco,

                                preco_promocao:
                                    variedade?.preco_promocao
                            }
                        );


                    return `
                        <div class="pdfprodutos-variedade-linha">

                            <span class="pdfprodutos-variedade-nome">
                                ${escaparHTMLPDF(
                        variedade.nome
                    )}
                            </span>

                            <span class="pdfprodutos-variedade-preco">

                                ${precoVariedade.promocao
                            ? `
                                            <span class="pdfprodutos-variedade-preco-anterior">
                                                ${escaparHTMLPDF(
                                precoVariedade.anterior
                            )}
                                            </span>

                                            <strong>
                                                ${escaparHTMLPDF(
                                precoVariedade.atual
                            )}
                                            </strong>
                                        `
                            : `
                                            <strong>
                                                ${escaparHTMLPDF(
                                precoVariedade.atual
                            )}
                                            </strong>
                                        `
                        }

                            </span>

                        </div>
                    `;

                }
            ).join("");


        variedadesHTML = `
            <div class="pdfprodutos-variedades">

                <div class="pdfprodutos-variedades-titulo">
                    Opções disponíveis
                </div>

                <div class="pdfprodutos-variedades-lista">
                    ${linhas}
                </div>

            </div>
        `;

    }


    return `
        <article
            class="pdfprodutos-produto"
            data-produto="${indice + 1}"
        >

            <div class="pdfprodutos-produto-numero">
                ${String(indice + 1).padStart(2, "0")}
            </div>

            ${imagemHTML}

            <div class="pdfprodutos-produto-conteudo">

                ${categoriaHTML}

                <h2 class="pdfprodutos-produto-nome">
                    ${escaparHTMLPDF(nome)}
                </h2>

                ${descricaoHTML}

                ${variedadesHTML}

                <div class="pdfprodutos-produto-rodape">
                    ${precoHTML}
                </div>

            </div>

        </article>
    `;

}


/* =========================================================
   ESPERAR IMAGENS
========================================================= */

function esperarImagensPDF(
    janela
) {

    return new Promise(
        resolve => {

            const imagens =
                Array.from(
                    janela.document.images
                );


            if (
                imagens.length === 0
            ) {

                resolve();

                return;

            }


            let carregadas = 0;


            const finalizar =
                () => {

                    carregadas += 1;

                    if (
                        carregadas >=
                        imagens.length
                    ) {

                        resolve();

                    }

                };


            imagens.forEach(
                imagem => {

                    if (
                        imagem.complete
                    ) {

                        finalizar();

                        return;

                    }


                    imagem.addEventListener(
                        "load",
                        finalizar,
                        {
                            once: true
                        }
                    );


                    imagem.addEventListener(
                        "error",
                        finalizar,
                        {
                            once: true
                        }
                    );

                }
            );


            setTimeout(
                resolve,
                8000
            );

        }
    );

}


/* =========================================================
   CARREGAR PRODUTOS

   Backend primeiro.
   Cache somente como fallback.
========================================================= */

async function carregarProdutosPDF() {

    if (
        !IRONSTORE_APP_KEY_GERAL
    ) {

        throw new Error(
            "VITE_IRONSTORE_APP_KEY_GERAL não configurada."
        );

    }


    const dominio =
        pegarDominioAtualPDF();


    try {

        const resposta =
            await fetch(
                `${API_URL}/ironstore/categorias?dominio=${encodeURIComponent(
                    dominio
                )}&_=${Date.now()}`,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {

                        "X-IronStore-Key":
                            IRONSTORE_APP_KEY_GERAL,

                        "Cache-Control":
                            "no-cache, no-store, max-age=0",

                        "Pragma":
                            "no-cache"

                    }

                }
            );


        let resultado =
            null;


        try {

            resultado =
                await resposta.json();

        } catch {

            resultado = null;

        }


        if (
            !resposta.ok
        ) {

            throw new Error(
                resultado?.detail ||
                `Erro HTTP ${resposta.status}`
            );

        }


        const dados = {

            ...resultado,

            produtos:
                Array.isArray(
                    resultado?.produtos
                )
                    ? resultado.produtos.map(
                        normalizarProdutoPDF
                    )
                    : []

        };


        salvarCacheCategoriasPDF(
            dados
        );


        return dados;

    } catch (erro) {

        console.warn(
            "[PDF PRODUTOS] Backend indisponível. Usando cache.",
            erro
        );


        const cache =
            lerCacheCategoriasPDF();


        if (
            cache &&
            Array.isArray(
                cache.produtos
            )
        ) {

            return cache;

        }


        throw erro;

    }

}


/* =========================================================
   CARREGAR HEADER
========================================================= */

async function carregarHeaderPDF() {

    const dominio =
        pegarDominioAtualPDF();


    if (
        !IRONSTORE_APP_KEY_HEADER
    ) {

        return (
            lerCacheHeaderPDF() ||
            {}
        );

    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/ironstore/header?dominio=${encodeURIComponent(
                    dominio
                )}&_=${Date.now()}`,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {

                        "X-IronStore-Key":
                            IRONSTORE_APP_KEY_HEADER,

                        "Cache-Control":
                            "no-cache, no-store, max-age=0",

                        "Pragma":
                            "no-cache"

                    }

                }
            );


        if (
            !resposta.ok
        ) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );

        }


        return await resposta.json();

    } catch (erro) {

        console.warn(
            "[PDF PRODUTOS] Header indisponível. Usando cache.",
            erro
        );


        return (
            lerCacheHeaderPDF() ||
            {}
        );

    }

}


/* =========================================================
   CARREGAR FOOTER
========================================================= */

async function carregarFooterPDF() {

    const dominio =
        pegarDominioAtualPDF();


    if (
        !IRONSTORE_APP_KEY_FOOTER
    ) {

        return (
            lerCacheFooterPDF() ||
            {}
        );

    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/ironstore/footer?dominio=${encodeURIComponent(
                    dominio
                )}&_=${Date.now()}`,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {

                        "X-IronStore-Key":
                            IRONSTORE_APP_KEY_FOOTER,

                        "Cache-Control":
                            "no-cache, no-store, max-age=0",

                        "Pragma":
                            "no-cache"

                    }

                }
            );


        if (
            !resposta.ok
        ) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );

        }


        const resultado =
            await resposta.json();


        try {

            localStorage.setItem(
                `ironstore_footer_${dominio}`,
                JSON.stringify(
                    resultado
                )
            );

        } catch {

            /* Cache é somente fallback. */

        }


        return resultado;

    } catch (erro) {

        console.warn(
            "[PDF PRODUTOS] Footer indisponível. Usando cache.",
            erro
        );


        return (
            lerCacheFooterPDF() ||
            {}
        );

    }

}


/* =========================================================
   CSS DO CATÁLOGO

   Tudo fica dentro do arquivo para que o componente seja
   independente e não crie dependência de outro CSS.
========================================================= */

const ESTILOS_PDF = `

    @page {
        size: A4;
        margin: 13mm 12mm 17mm 12mm;
    }

    * {
        box-sizing: border-box;
    }

    html,
    body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #18202a;
        font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    body {
        font-size: 10.5pt;
    }

    .pdfprodutos-documento {
        width: 100%;
        max-width: 210mm;
        margin: 0 auto;
    }

    .pdfprodutos-capa {
        min-height: 265mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 12mm 3mm 5mm;
        page-break-after: always;
        break-after: page;
    }

    .pdfprodutos-capa-topo {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        padding-bottom: 7mm;
        border-bottom: 1px solid #dfe4e8;
    }

    .pdfprodutos-marca {
        display: flex;
        align-items: center;
        gap: 13px;
        min-width: 0;
    }

    .pdfprodutos-marca-logo {
        width: 55px;
        height: 55px;
        border-radius: 14px;
        object-fit: contain;
        border: 1px solid #e2e6ea;
        background: #fff;
    }

    .pdfprodutos-marca-sem-logo {
        width: 55px;
        height: 55px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #111827;
        color: #fff;
        font-weight: 800;
        font-size: 18px;
    }

    .pdfprodutos-marca-nome {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.3px;
    }

    .pdfprodutos-marca-dominio {
        margin-top: 3px;
        color: #68727d;
        font-size: 9px;
        word-break: break-all;
    }

    .pdfprodutos-capa-data {
        text-align: right;
        color: #68727d;
        font-size: 9px;
        line-height: 1.5;
    }

    .pdfprodutos-capa-centro {
        padding: 20mm 0;
    }

    .pdfprodutos-capa-etiqueta {
        display: inline-block;
        margin-bottom: 9px;
        padding: 6px 10px;
        border-radius: 999px;
        background: #f0f3f5;
        color: #46515d;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 1.1px;
        text-transform: uppercase;
    }

    .pdfprodutos-capa-titulo {
        max-width: 145mm;
        margin: 0;
        color: #101820;
        font-size: 38px;
        line-height: 1.04;
        letter-spacing: -1.6px;
        font-weight: 850;
    }

    .pdfprodutos-capa-subtitulo {
        max-width: 125mm;
        margin: 13px 0 0;
        color: #69737d;
        font-size: 13px;
        line-height: 1.6;
    }

    .pdfprodutos-capa-estatisticas {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        max-width: 145mm;
        margin-top: 22mm;
    }

    .pdfprodutos-capa-estatistica {
        padding: 14px;
        border: 1px solid #e2e6ea;
        border-radius: 13px;
        background: #fbfcfd;
    }

    .pdfprodutos-capa-estatistica-valor {
        font-size: 21px;
        font-weight: 850;
        color: #111827;
    }

    .pdfprodutos-capa-estatistica-label {
        margin-top: 3px;
        color: #707984;
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: .7px;
    }

    .pdfprodutos-capa-base {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding-top: 7mm;
        border-top: 1px solid #dfe4e8;
        color: #69737d;
        font-size: 8.5px;
        line-height: 1.5;
    }

    .pdfprodutos-catalogo-cabecalho {
        margin-bottom: 8mm;
        padding-bottom: 4mm;
        border-bottom: 2px solid #151b22;
    }

    .pdfprodutos-catalogo-cabecalho-linha {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 15px;
    }

    .pdfprodutos-catalogo-titulo {
        margin: 0;
        color: #111827;
        font-size: 23px;
        letter-spacing: -.6px;
    }

    .pdfprodutos-catalogo-contador {
        color: #6b7480;
        font-size: 9px;
        font-weight: 700;
        white-space: nowrap;
    }

    .pdfprodutos-produtos {
        display: block;
    }

    .pdfprodutos-produto {
        position: relative;
        display: grid;
        grid-template-columns: 63mm 1fr;
        gap: 8mm;
        min-height: 68mm;
        margin-bottom: 8mm;
        padding: 7mm;
        border: 1px solid #dfe4e8;
        border-radius: 15px;
        background: #fff;
        break-inside: avoid;
        page-break-inside: avoid;
    }

    .pdfprodutos-produto-numero {
        position: absolute;
        top: 5mm;
        left: 5mm;
        z-index: 2;
        min-width: 25px;
        padding: 4px 6px;
        border-radius: 7px;
        background: rgba(255,255,255,.94);
        border: 1px solid #e1e5e9;
        color: #606a75;
        font-size: 7px;
        font-weight: 850;
        text-align: center;
    }

    .pdfprodutos-produto-imagem {
        width: 63mm;
        height: 63mm;
        overflow: hidden;
        border-radius: 12px;
        background: #f5f6f7;
        border: 1px solid #e5e8eb;
    }

    .pdfprodutos-produto-imagem img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
        background: #fff;
    }

    .pdfprodutos-produto-imagem-vazia {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pdfprodutos-imagem-placeholder {
        color: #9aa2ab;
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: .8px;
        font-weight: 700;
    }

    .pdfprodutos-produto-conteudo {
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    .pdfprodutos-produto-categoria {
        color: #78818b;
        font-size: 7.5px;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    .pdfprodutos-produto-nome {
        margin: 4px 0 7px;
        color: #101820;
        font-size: 18px;
        line-height: 1.15;
        letter-spacing: -.3px;
    }

    .pdfprodutos-produto-descricao {
        color: #58636e;
        font-size: 9px;
        line-height: 1.55;
    }

    .pdfprodutos-produto-descricao-vazia {
        color: #9aa2ab;
        font-style: italic;
    }

    .pdfprodutos-variedades {
        margin-top: 9px;
        padding-top: 8px;
        border-top: 1px solid #eceff1;
    }

    .pdfprodutos-variedades-titulo {
        margin-bottom: 5px;
        color: #626c76;
        font-size: 7.5px;
        font-weight: 800;
        letter-spacing: .7px;
        text-transform: uppercase;
    }

    .pdfprodutos-variedades-lista {
        display: grid;
        gap: 3px;
    }

    .pdfprodutos-variedade-linha {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 4px 6px;
        border-radius: 5px;
        background: #f7f8f9;
        font-size: 8px;
    }

    .pdfprodutos-variedade-nome {
        color: #39434d;
        min-width: 0;
    }

    .pdfprodutos-variedade-preco {
        white-space: nowrap;
        color: #151b22;
    }

    .pdfprodutos-variedade-preco-anterior {
        margin-right: 5px;
        color: #8b949d;
        text-decoration: line-through;
        font-size: 7px;
    }

    .pdfprodutos-produto-rodape {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        margin-top: auto;
        padding-top: 10px;
    }

    .pdfprodutos-produto-preco-box {
        text-align: right;
    }

    .pdfprodutos-produto-preco-anterior {
        color: #8c959e;
        font-size: 8px;
        text-decoration: line-through;
    }

    .pdfprodutos-produto-preco-promocional {
        margin-top: 1px;
        color: #101820;
        font-size: 21px;
        font-weight: 850;
        letter-spacing: -.5px;
    }

    .pdfprodutos-produto-preco-normal {
        color: #101820;
        font-size: 20px;
        font-weight: 850;
        letter-spacing: -.5px;
    }

    .pdfprodutos-produto-preco-legenda {
        margin-top: 2px;
        color: #7a838d;
        font-size: 7px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .8px;
    }

    .pdfprodutos-documento-rodape {
        margin-top: 11mm;
        padding-top: 5mm;
        border-top: 1px solid #dfe4e8;
        break-inside: avoid;
        page-break-inside: avoid;
    }

    .pdfprodutos-rodape-principal {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 14mm;
        padding-bottom: 5mm;
    }

    .pdfprodutos-rodape-marca {
        display: flex;
        gap: 10px;
        align-items: flex-start;
    }

    .pdfprodutos-rodape-logo {
        width: 38px;
        height: 38px;
        border-radius: 9px;
        object-fit: contain;
        border: 1px solid #e1e5e8;
        flex: 0 0 auto;
    }

    .pdfprodutos-rodape-nome {
        margin: 0;
        color: #18202a;
        font-size: 10px;
        font-weight: 850;
    }

    .pdfprodutos-rodape-mensagem {
        margin-top: 3px;
        color: #69737d;
        font-size: 8px;
        line-height: 1.45;
    }

    .pdfprodutos-rodape-contato {
        color: #59646f;
        font-size: 8px;
        line-height: 1.65;
    }

    .pdfprodutos-rodape-contato strong {
        color: #252e37;
    }

    .pdfprodutos-rodape-redes {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 7px;
    }

    .pdfprodutos-rodape-rede {
        padding: 4px 7px;
        border: 1px solid #e0e4e7;
        border-radius: 5px;
        color: #5c6670;
        font-size: 7px;
        font-weight: 700;
    }

    .pdfprodutos-rodape-final {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding-top: 4mm;
        border-top: 1px solid #eceff1;
        color: #8a939c;
        font-size: 7px;
    }

    .pdfprodutos-rodape-final-direita {
        text-align: right;
    }

    @media print {

        body {
            background: #fff !important;
        }

        .pdfprodutos-botao-container {
            display: none !important;
        }

        .pdfprodutos-documento {
            max-width: none;
        }

    }

`;


/* =========================================================
   COMPONENTE
========================================================= */

export default function PDFProdutos() {

    const [
        imprimindo,
        setImprimindo
    ] = useState(false);


    async function imprimirCatalogo() {

        if (
            imprimindo
        ) {

            return;

        }


        const janela =
            window.open(
                "",
                "_blank",
                "width=1100,height=850"
            );


        if (!janela) {

            window.alert(
                "O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente novamente."
            );

            return;

        }


        setImprimindo(
            true
        );


        janela.document.open();


        janela.document.write(
            `
                <!DOCTYPE html>

                <html lang="pt-BR">

                <head>

                    <meta
                        charset="UTF-8"
                    >

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>
                        Catálogo de Produtos
                    </title>

                    <style>
                        ${ESTILOS_PDF}
                    </style>

                </head>

                <body>

                    <div
                        id="pdfprodutos-raiz"
                        class="pdfprodutos-documento"
                    >

                        <div
                            class="pdfprodutos-capa"
                        >

                            <div>
                                Preparando catálogo...
                            </div>

                        </div>

                    </div>

                </body>

                </html>
            `
        );


        janela.document.close();


        try {

            const [
                dadosProdutos,
                dadosHeader,
                dadosFooter
            ] = await Promise.all([
                carregarProdutosPDF(),
                carregarHeaderPDF(),
                carregarFooterPDF()
            ]);


            const comercioProdutos =
                dadosProdutos?.comercio ||
                {};


            const comercioFooter =
                dadosFooter?.comercio ||
                {};


            const comercio =
            {
                ...comercioProdutos,
                ...comercioFooter,
                ...(dadosHeader?.comercio || {})
            };


            const produtos =
                Array.isArray(
                    dadosProdutos?.produtos
                )
                    ? dadosProdutos.produtos.map(
                        normalizarProdutoPDF
                    )
                    : [];


            const footer =
                dadosFooter?.footer ||
                {};


            const nomeLoja =
                comercio?.loja ||
                dadosHeader?.comercio?.loja ||
                "Missionary Store Brasil";


            const logo =
                comercio?.imagem ||
                dadosHeader?.comercio?.imagem ||
                "";


            const dominio =
                pegarDominioAtualPDF();


            const agora =
                new Date();


            const dataGeracao =
                agora.toLocaleDateString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                );


            const quantidadeProdutos =
                produtos.length;


            const produtosHTML =
                produtos.length > 0
                    ? produtos
                        .map(
                            (
                                produto,
                                indice
                            ) =>
                                montarProdutoHTMLPDF(
                                    produto,
                                    indice
                                )
                        )
                        .join("")
                    : `
                        <div
                            class="pdfprodutos-produto"
                            style="display:block;"
                        >
                            <h2 class="pdfprodutos-produto-nome">
                                Nenhum produto disponível
                            </h2>

                            <div class="pdfprodutos-produto-descricao">
                                Não existem produtos disponíveis para exibição neste momento.
                            </div>
                        </div>
                    `;


            const enderecoPartes =
                [
                    comercio?.rua,
                    comercio?.numero,
                    comercio?.bairro,
                    comercio?.cidade,
                    comercio?.estado,
                    comercio?.cep
                ]
                    .map(
                        valor =>
                            valorOuVazioPDF(
                                valor
                            )
                    )
                    .filter(
                        Boolean
                    );


            const endereco =
                enderecoPartes.join(
                    ", "
                );


            const telefone =
                valorOuVazioPDF(
                    comercio?.celular
                );


            const email =
                valorOuVazioPDF(
                    comercio?.email
                );


            const cnpj =
                valorOuVazioPDF(
                    comercio?.cnpj
                );


            const redes = [
                [
                    "Instagram",
                    footer?.instagram
                ],
                [
                    "TikTok",
                    footer?.tiktok
                ],
                [
                    "YouTube",
                    footer?.youtube
                ],
                [
                    "Facebook",
                    footer?.facebook
                ],
                [
                    "X",
                    footer?.x
                ],
                [
                    "WhatsApp",
                    footer?.whatsapp
                ]
            ].filter(
                (
                    [, valor]
                ) =>
                    valor &&
                    String(
                        valor
                    ).trim()
            );


            const redesHTML =
                redes.length > 0
                    ? `
                        <div class="pdfprodutos-rodape-redes">
                            ${redes
                        .map(
                            (
                                [
                                    nomeRede
                                ]
                            ) =>
                                `
                                            <span class="pdfprodutos-rodape-rede">
                                                ${escaparHTMLPDF(
                                    nomeRede
                                )}
                                            </span>
                                        `
                        )
                        .join("")}
                        </div>
                    `
                    : "";


            const logoCapaHTML =
                logo
                    ? `
                        <img
                            class="pdfprodutos-marca-logo"
                            src="${escaparHTMLPDF(logo)}"
                            alt="${escaparHTMLPDF(nomeLoja)}"
                        >
                    `
                    : `
                        <div class="pdfprodutos-marca-sem-logo">
                            MS
                        </div>
                    `;


            const logoFooterHTML =
                logo
                    ? `
                        <img
                            class="pdfprodutos-rodape-logo"
                            src="${escaparHTMLPDF(logo)}"
                            alt="${escaparHTMLPDF(nomeLoja)}"
                        >
                    `
                    : "";


            const mensagem =
                valorOuVazioPDF(
                    footer?.mensagem
                );


            const documentoHTML = `

                <section
                    class="pdfprodutos-capa"
                >

                    <div
                        class="pdfprodutos-capa-topo"
                    >

                        <div
                            class="pdfprodutos-marca"
                        >

                            ${logoCapaHTML}

                            <div>

                                <h1
                                    class="pdfprodutos-marca-nome"
                                >
                                    ${escaparHTMLPDF(
                nomeLoja
            )}
                                </h1>

                                <div
                                    class="pdfprodutos-marca-dominio"
                                >
                                    ${escaparHTMLPDF(
                dominio
            )}
                                </div>

                            </div>

                        </div>


                        <div
                            class="pdfprodutos-capa-data"
                        >
                            Catálogo de produtos<br>
                            ${escaparHTMLPDF(
                dataGeracao
            )}
                        </div>

                    </div>


                    <div
                        class="pdfprodutos-capa-centro"
                    >

                        <div
                            class="pdfprodutos-capa-etiqueta"
                        >
                            Catálogo oficial
                        </div>

                        <h2
                            class="pdfprodutos-capa-titulo"
                        >
                            Produtos da<br>
                            ${escaparHTMLPDF(
                nomeLoja
            )}
                        </h2>

                        <p
                            class="pdfprodutos-capa-subtitulo"
                        >
                            Uma apresentação completa dos produtos disponíveis na loja, com imagens, descrições, preços e opções cadastradas.
                        </p>


                        <div
                            class="pdfprodutos-capa-estatisticas"
                        >

                            <div
                                class="pdfprodutos-capa-estatistica"
                            >

                                <div
                                    class="pdfprodutos-capa-estatistica-valor"
                                >
                                    ${quantidadeProdutos}
                                </div>

                                <div
                                    class="pdfprodutos-capa-estatistica-label"
                                >
                                    Produtos
                                </div>

                            </div>


                            <div
                                class="pdfprodutos-capa-estatistica"
                            >

                                <div
                                    class="pdfprodutos-capa-estatistica-valor"
                                >
                                    ${produtos.filter(
                produto =>
                    possuiPrecoPromocionalPDF(
                        produto?.preco_promocao
                    )
            ).length}
                                </div>

                                <div
                                    class="pdfprodutos-capa-estatistica-label"
                                >
                                    Em oferta
                                </div>

                            </div>


                            <div
                                class="pdfprodutos-capa-estatistica"
                            >

                                <div
                                    class="pdfprodutos-capa-estatistica-valor"
                                >
                                    ${produtos.reduce(
                (
                    total,
                    produto
                ) =>
                    total +
                    (
                        Array.isArray(
                            produto?.variedades
                        )
                            ? produto.variedades.length
                            : 0
                    ),
                0
            )}
                                </div>

                                <div
                                    class="pdfprodutos-capa-estatistica-label"
                                >
                                    Opções
                                </div>

                            </div>

                        </div>

                    </div>


                    <div
                        class="pdfprodutos-capa-base"
                    >

                        <span>
                            ${escaparHTMLPDF(
                nomeLoja
            )}
                        </span>

                        <span>
                            ${escaparHTMLPDF(
                dominio
            )}
                        </span>

                    </div>

                </section>


                <main>

                    <div
                        class="pdfprodutos-catalogo-cabecalho"
                    >

                        <div
                            class="pdfprodutos-catalogo-cabecalho-linha"
                        >

                            <h2
                                class="pdfprodutos-catalogo-titulo"
                            >
                                Catálogo de produtos
                            </h2>

                            <div
                                class="pdfprodutos-catalogo-contador"
                            >
                                ${quantidadeProdutos}
                                ${quantidadeProdutos === 1
                    ? " produto"
                    : " produtos"
                }
                            </div>

                        </div>

                    </div>


                    <section
                        class="pdfprodutos-produtos"
                    >

                        ${produtosHTML}

                    </section>

                </main>


                <footer
                    class="pdfprodutos-documento-rodape"
                >

                    <div
                        class="pdfprodutos-rodape-principal"
                    >

                        <div
                            class="pdfprodutos-rodape-marca"
                        >

                            ${logoFooterHTML}

                            <div>

                                <div
                                    class="pdfprodutos-rodape-nome"
                                >
                                    ${escaparHTMLPDF(
                    nomeLoja
                )}
                                </div>

                                ${mensagem
                    ? `
                                            <div
                                                class="pdfprodutos-rodape-mensagem"
                                            >
                                                ${textoSeguroPDF(
                        mensagem
                    )}
                                            </div>
                                        `
                    : ""
                }

                                ${redesHTML}

                            </div>

                        </div>


                        <div
                            class="pdfprodutos-rodape-contato"
                        >

                            ${endereco
                    ? `
                                        <div>
                                            <strong>Endereço:</strong>
                                            ${escaparHTMLPDF(
                        endereco
                    )}
                                        </div>
                                    `
                    : ""
                }

                            ${telefone
                    ? `
                                        <div>
                                            <strong>Telefone:</strong>
                                            ${escaparHTMLPDF(
                        telefone
                    )}
                                        </div>
                                    `
                    : ""
                }

                            ${email
                    ? `
                                        <div>
                                            <strong>E-mail:</strong>
                                            ${escaparHTMLPDF(
                        email
                    )}
                                        </div>
                                    `
                    : ""
                }

                            ${cnpj
                    ? `
                                        <div>
                                            <strong>CNPJ:</strong>
                                            ${escaparHTMLPDF(
                        cnpj
                    )}
                                        </div>
                                    `
                    : ""
                }

                        </div>

                    </div>


                    <div
                        class="pdfprodutos-rodape-final"
                    >

                        <span>
                            © ${agora.getFullYear()}
                            ${escaparHTMLPDF(
                    nomeLoja
                )}
                        </span>

                        <span
                            class="pdfprodutos-rodape-final-direita"
                        >
                            Catálogo gerado em
                            ${escaparHTMLPDF(
                    dataGeracao
                )}
                        </span>

                    </div>

                </footer>

            `;


            const raiz =
                janela.document.getElementById(
                    "pdfprodutos-raiz"
                );


            if (!raiz) {

                throw new Error(
                    "Não foi possível montar o documento de impressão."
                );

            }


            raiz.innerHTML =
                documentoHTML;


            await esperarImagensPDF(
                janela
            );


            janela.focus();


            setTimeout(
                () => {

                    janela.print();

                },
                250
            );


        } catch (erro) {

            console.error(
                "[PDF PRODUTOS] Erro ao gerar catálogo:",
                erro
            );


            janela.document.body.innerHTML = `
                <div
                    style="
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        color: #20252b;
                    "
                >

                    <h1>
                        Não foi possível gerar o catálogo
                    </h1>

                    <p>
                        ${escaparHTMLPDF(
                erro?.message ||
                "Erro desconhecido."
            )}
                    </p>

                </div>
            `;


        } finally {

            setImprimindo(
                false
            );

        }

    }


    return (

        <div
            className="pdfprodutos-botao-container"
        >

            <button
                type="button"
                className="pdfprodutos-botao"
                onClick={
                    imprimirCatalogo
                }
                disabled={
                    imprimindo
                }
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    minHeight: "44px",
                    padding: "0 18px",
                    border: "1px solid #d9dee3",
                    color: "white",
                    borderRadius: "10px",
                    background: imprimindo
                        ? "#f1f3f5"
                        : "#111827",
                    color: imprimindo
                        ? "#727b85"
                        : "#ffffff",
                    fontSize: "13px",
                    fontWeight: 750,
                    cursor: imprimindo
                        ? "wait"
                        : "pointer",
                    transition: "all .2s ease",
                    boxShadow: imprimindo
                        ? "none"
                        : "0 3px 10px rgba(17,24,39,.14)"
                }}
            >

                <span
                    aria-hidden="true"
                    style={{
                        fontSize: "16px",
                        lineHeight: 1
                    }}
                >
                    {imprimindo ? "⏳" : "▣"}
                </span>

                <span style={{ color: "white" }} >
                    {
                        imprimindo
                            ? "Preparando catálogo..."
                            : "Imprimir catálogo PDF"
                    }
                </span>

            </button>

        </div>

    );

}
