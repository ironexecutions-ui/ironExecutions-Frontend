import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../../../../../config";
import "./code.css";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

export default function Code() {

    const [modo, setModo] = useState("codigo_barras");
    const [produtos, setProdutos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const areaImpressaoRef = useRef();

    const [categorias, setCategorias] = useState([]);
    const [categoriasAtivas, setCategoriasAtivas] = useState([]);

    const [gerando, setGerando] = useState(false);
    const [carregandoLista, setCarregandoLista] = useState(false);

    const token = localStorage.getItem("token");


    /* =========================================================
       DESCOBRIR COMÉRCIO
    ========================================================= */

    function obterComercioId() {

        try {

            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

            return usuario?.comercio_id || null;

        } catch (erro) {

            console.warn(
                "[CÓDIGOS] Erro ao ler usuário:",
                erro
            );

            return null;
        }
    }


    /* =========================================================
       CHAVE DO CACHE

       Cada comércio possui sua própria lista.
    ========================================================= */

    function obterChaveCache() {

        const comercioId = obterComercioId();

        if (!comercioId) {
            return null;
        }

        return `iron_codigos_produtos_cache_${comercioId}`;
    }


    /* =========================================================
       LER CACHE
    ========================================================= */

    function lerCache() {

        const chave = obterChaveCache();

        if (!chave) {
            return null;
        }

        try {

            const salvo = localStorage.getItem(chave);

            if (!salvo) {
                return null;
            }

            const dados = JSON.parse(salvo);

            if (!Array.isArray(dados)) {
                throw new Error("Cache não contém uma lista");
            }

            return dados;

        } catch (erro) {

            console.warn(
                "[CÓDIGOS] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCache(dados) {

        const chave = obterChaveCache();

        if (!chave) {
            return;
        }

        if (!Array.isArray(dados)) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(dados)
            );

        } catch (erro) {

            console.warn(
                "[CÓDIGOS] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       NORMALIZAR PRODUTOS PARA COMPARAÇÃO

       Ordenamos pelo ID para uma simples mudança na ordem
       da API não ser interpretada como alteração.
    ========================================================= */

    function normalizarProdutos(lista) {

        if (!Array.isArray(lista)) {
            return [];
        }

        return [...lista].sort((a, b) => {

            return String(a.id).localeCompare(
                String(b.id),
                undefined,
                {
                    numeric: true
                }
            );

        });
    }


    /* =========================================================
       COMPARAR CACHE X SERVIDOR
    ========================================================= */

    function produtosIguais(cache, servidor) {

        if (
            !Array.isArray(cache) ||
            !Array.isArray(servidor)
        ) {
            return false;
        }

        if (cache.length !== servidor.length) {
            return false;
        }

        try {

            const cacheNormalizado =
                normalizarProdutos(cache);

            const servidorNormalizado =
                normalizarProdutos(servidor);

            return (
                JSON.stringify(cacheNormalizado) ===
                JSON.stringify(servidorNormalizado)
            );

        } catch {

            return false;
        }
    }


    /* =========================================================
       EXTRAIR CATEGORIAS
    ========================================================= */

    function atualizarCategorias(lista) {

        if (!Array.isArray(lista)) {

            setCategorias([]);

            return;
        }

        const cats = [
            ...new Set(
                lista
                    .map(p => p.categoria)
                    .filter(Boolean)
            )
        ];

        setCategorias(cats);
    }


    /* =========================================================
       CARREGAR PRODUTOS

       1. Cache primeiro
       2. API depois
       3. Compara
       4. Atualiza somente se mudou
    ========================================================= */

    async function carregarProdutos() {

        if (!modo) {
            return;
        }


        /* =====================================================
           CACHE
        ===================================================== */

        const cache = lerCache();


        if (Array.isArray(cache)) {

            setProdutos(cache);

            atualizarCategorias(cache);

            setCarregandoLista(false);

            console.log(
                "[CÓDIGOS] Produtos carregados do cache:",
                cache.length
            );

        } else {

            setCarregandoLista(true);

        }


        /* =====================================================
           SERVIDOR
        ===================================================== */

        try {

            const resp = await fetch(
                `${API_URL}/admin/codigos/produtos`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao carregar produtos: ${resp.status}`
                );
            }


            const resposta = await resp.json();


            const dadosServidor =
                Array.isArray(resposta)
                    ? resposta
                    : [];


            /* =================================================
               COMPARAÇÃO
            ================================================= */

            if (
                produtosIguais(
                    cache,
                    dadosServidor
                )
            ) {

                console.log(
                    "[CÓDIGOS] Cache já está atualizado."
                );

                return;
            }


            /* =================================================
               ALTERAÇÃO ENCONTRADA
            ================================================= */

            console.log(
                "[CÓDIGOS] Produtos alterados no servidor.",
                {
                    cache: cache?.length || 0,
                    servidor: dadosServidor.length
                }
            );


            setProdutos(
                dadosServidor
            );


            atualizarCategorias(
                dadosServidor
            );


            salvarCache(
                dadosServidor
            );


            console.log(
                "[CÓDIGOS] Cache atualizado."
            );


        } catch (erro) {

            console.error(
                "[CÓDIGOS] Erro ao consultar produtos:",
                erro
            );


            /*
                Se temos cache, mantemos a lista.

                Se não temos cache, não existe
                nenhuma informação para mostrar.
            */

            if (!Array.isArray(cache)) {

                setProdutos([]);
                setCategorias([]);

            }

        } finally {

            setCarregandoLista(false);

        }
    }


    /* =========================================================
       CARREGAR
    ========================================================= */

    useEffect(() => {

        carregarProdutos();

    }, [modo]);


    /* =========================================================
       UNIDADE
    ========================================================= */

    function unidadeProduto(p) {

        if (
            p.unidade &&
            p.unidade.trim() !== ""
        ) {
            return p.unidade;
        }


        if (
            p.unidades !== null &&
            p.unidades !== undefined
        ) {
            return "Pacote de " + p.unidades + " Unidades";
        }


        if (p.tempo_servico) {
            return p.tempo_servico;
        }


        return "sem unidade definida";
    }


    /* =========================================================
       CATEGORIA
    ========================================================= */

    function toggleCategoria(cat) {

        setCategoriasAtivas(prev =>

            prev.includes(cat)

                ? prev.filter(
                    c => c !== cat
                )

                : [
                    ...prev,
                    cat
                ]

        );
    }


    /* =========================================================
       MOVER PRODUTO
    ========================================================= */

    function moverProduto(p) {

        setSelecionados(prev => [
            ...prev,
            p
        ]);


        setProdutos(prev =>
            prev.filter(
                i => i.id !== p.id
            )
        );
    }


    /* =========================================================
       DESIGNAR CÓDIGOS
    ========================================================= */

    async function designar() {

        if (gerando) {
            return;
        }


        const ids = selecionados
            .filter(p => !p[modo])
            .map(p => p.id);


        if (!ids.length) {
            return;
        }


        setGerando(true);


        try {

            /* =================================================
               DESIGNAR
            ================================================= */

            const respostaDesignar =
                await fetch(
                    `${API_URL}/admin/codigos/designar`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            ids,
                            tipo: modo
                        })
                    }
                );


            if (!respostaDesignar.ok) {

                throw new Error(
                    `Erro ao designar códigos: ${respostaDesignar.status}`
                );
            }


            /* =================================================
               BUSCAR LISTA ATUALIZADA
            ================================================= */

            const resp =
                await fetch(
                    `${API_URL}/admin/codigos/produtos`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao atualizar produtos: ${resp.status}`
                );
            }


            const resposta =
                await resp.json();


            const dadosAtualizados =
                Array.isArray(resposta)
                    ? resposta
                    : [];


            /* =================================================
               IMPORTANTE

               Atualizamos o cache com a lista COMPLETA
               retornada pelo servidor.

               Não salvamos somente os produtos da esquerda.
            ================================================= */

            salvarCache(
                dadosAtualizados
            );


            atualizarCategorias(
                dadosAtualizados
            );


            /* =================================================
               MANTER SELECIONADOS NA DIREITA
            ================================================= */

            setProdutos(

                dadosAtualizados.filter(

                    p =>
                        !selecionados.some(
                            s => s.id === p.id
                        )

                )

            );


            /* =================================================
               ATUALIZAR CÓDIGOS DOS SELECIONADOS
            ================================================= */

            setSelecionados(prev =>

                prev.map(sel =>

                    dadosAtualizados.find(
                        p => p.id === sel.id
                    ) || sel

                )

            );


            console.log(
                "[CÓDIGOS] Códigos designados e cache atualizado."
            );


        } catch (erro) {

            console.error(
                "[CÓDIGOS] Erro ao designar:",
                erro
            );


        } finally {

            setGerando(false);

        }
    }


    /* =========================================================
       IMPRIMIR
    ========================================================= */

    function imprimir() {

        if (!selecionados.length) {
            return;
        }


        const win = window.open(
            "about:blank",
            "_blank",
            "width=800,height=600"
        );


        if (!win) {

            alert(
                "Popup bloqueado pelo navegador"
            );

            return;
        }


        win.document.open();


        win.document.write(`
            <html>
                <head>

                    <title>Impressão</title>

                    <style>

                        body {
                            font-family: Arial;
                            padding: 20px;
                        }

                        .etiqueta {
                            width: 280px;
                            margin-bottom: 40px;
                            text-align: center;
                            page-break-inside: avoid;
                        }

                        .nome {
                            font-size: 14px;
                            font-weight: bold;
                            margin-bottom: 8px;
                        }

                    </style>

                </head>

                <body>

                    <div id="conteudo">
                        Preparando impressão...
                    </div>

                </body>

            </html>
        `);


        win.document.close();


        setTimeout(() => {

            gerarConteudoImpressao(
                win
            );

        }, 50);
    }


    /* =========================================================
       GERAR CONTEÚDO DE IMPRESSÃO
    ========================================================= */

    async function gerarConteudoImpressao(win) {

        const container =
            win.document.getElementById(
                "conteudo"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        for (const p of selecionados) {

            const etiqueta =
                win.document.createElement(
                    "div"
                );


            etiqueta.className =
                "etiqueta";


            const nome =
                win.document.createElement(
                    "div"
                );


            nome.className =
                "nome";


            nome.textContent =
                p.nome || "";


            etiqueta.appendChild(
                nome
            );


            /* =================================================
               QR CODE
            ================================================= */

            if (modo === "qrcode") {

                if (!p.qrcode) {
                    continue;
                }


                const svgQR =
                    await QRCode.toString(
                        String(p.qrcode),
                        {
                            type: "svg",
                            width: 120,
                            margin: 1
                        }
                    );


                etiqueta.insertAdjacentHTML(
                    "beforeend",
                    svgQR
                );

            }

            /* =================================================
               CÓDIGO DE BARRAS
            ================================================= */

            else {

                if (!p.codigo_barras) {
                    continue;
                }


                const svg =
                    win.document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg"
                    );


                const codigo =
                    String(
                        p.codigo_barras
                    );


                const formato =
                    validarEAN13(codigo)
                        ? "EAN13"
                        : "CODE128";


                JsBarcode(
                    svg,
                    codigo,
                    {
                        format: formato,
                        displayValue: false,
                        height: 70,
                        margin: 0
                    }
                );


                etiqueta.appendChild(
                    svg
                );
            }


            container.appendChild(
                etiqueta
            );
        }


        /* =====================================================
           AGUARDAR RENDERIZAÇÃO
        ===================================================== */

        win.requestAnimationFrame(() => {

            win.requestAnimationFrame(() => {

                win.focus();

                win.print();

            });

        });
    }


    /* =========================================================
       VALIDAR EAN13
    ========================================================= */

    function validarEAN13(codigo) {

        if (!/^\d{13}$/.test(codigo)) {
            return false;
        }


        let soma = 0;


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            soma +=
                Number(codigo[i]) *
                (
                    i % 2 === 0
                        ? 1
                        : 3
                );
        }


        const digito =
            (
                10 -
                (soma % 10)
            ) % 10;


        return (
            digito ===
            Number(codigo[12])
        );
    }


    /* =========================================================
       REMOVER DOS SELECIONADOS
    ========================================================= */

    function removerProduto(p) {

        setProdutos(prev => [
            ...prev,
            p
        ]);


        setSelecionados(prev =>
            prev.filter(
                i => i.id !== p.id
            )
        );
    }


    /* =========================================================
       PRODUTOS FILTRADOS
    ========================================================= */

    const produtosFiltrados =
        categoriasAtivas.length

            ? produtos.filter(
                p =>
                    categoriasAtivas.includes(
                        p.categoria
                    )
            )

            : produtos;


    /* =========================================================
       MOVER SEM CÓDIGO
    ========================================================= */

    function moverSemCodigo() {

        const semCodigo =
            produtos.filter(
                p => !p[modo]
            );


        if (!semCodigo.length) {
            return;
        }


        setSelecionados(prev => [
            ...prev,
            ...semCodigo
        ]);


        setProdutos(prev =>
            prev.filter(
                p => p[modo]
            )
        );
    }


    /* =========================================================
       MOVER TODOS VISÍVEIS
    ========================================================= */

    function moverTodosVisiveis() {

        if (!produtosFiltrados.length) {
            return;
        }


        setSelecionados(prev => [
            ...prev,
            ...produtosFiltrados
        ]);


        setProdutos(prev =>

            prev.filter(
                p =>
                    !produtosFiltrados.some(
                        v => v.id === p.id
                    )
            )

        );
    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="codigos-container">

            {/* =================================================
                TOPO
            ================================================= */}

            <div className="codigos-topo">

                <button
                    className={
                        modo === "codigo_barras"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setModo("codigo_barras")
                    }
                >
                    Código de Barras
                </button>


                <button
                    className={
                        modo === "qrcode"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        setModo("qrcode")
                    }
                >
                    QR Code
                </button>

            </div>


            {modo && (

                <div className="listas">

                    {/* =========================================
                        LISTA ESQUERDA
                    ========================================= */}

                    <div className="lista">

                        <div className="lista-header">

                            <h4>
                                Produtos
                            </h4>


                            <button
                                className="btn-sem-codigo"
                                onClick={
                                    moverSemCodigo
                                }
                                disabled={
                                    produtos.filter(
                                        p => !p[modo]
                                    ).length === 0
                                }
                            >
                                Mover itens sem código
                            </button>


                            <button
                                className="btn-sem-codigo"
                                onClick={
                                    moverTodosVisiveis
                                }
                                disabled={
                                    produtosFiltrados.length === 0
                                }
                            >
                                Mover todos os itens visíveis
                            </button>


                            {categorias.length > 0 && (

                                <div className="categorias-filtro">

                                    {categorias.map(cat => (

                                        <button
                                            key={cat}
                                            onClick={() =>
                                                toggleCategoria(cat)
                                            }
                                            className={
                                                categoriasAtivas.includes(cat)
                                                    ? "ativo"
                                                    : ""
                                            }
                                        >
                                            {cat}
                                        </button>

                                    ))}

                                </div>

                            )}

                        </div>


                        {(gerando || carregandoLista) && (

                            <div className="code-overlay-gerando">

                                <div className="code-box-gerando">

                                    <div className="code-spinner" />

                                    <span>

                                        {
                                            gerando
                                                ? "Gerando códigos..."
                                                : "Carregando produtos..."
                                        }

                                    </span>

                                </div>

                            </div>

                        )}


                        <div className="lista-body">

                            {produtosFiltrados.map(p => (

                                <div
                                    key={p.id}
                                    className="linha"
                                >

                                    <div className="linha-info">

                                        <span className="nome-produto">
                                            {p.nome}
                                        </span>


                                        <span className="unidade-produto">

                                            {unidadeProduto(p)}

                                        </span>


                                        <span
                                            className={
                                                `codigo-produto ${!p[modo]
                                                    ? "sem-codigo"
                                                    : ""
                                                }`
                                            }
                                        >

                                            {p[modo] || "Sem código"}

                                        </span>

                                    </div>


                                    <button
                                        className="btn-mover"
                                        onClick={() =>
                                            moverProduto(p)
                                        }
                                    >
                                        ➜
                                    </button>

                                </div>

                            ))}

                        </div>

                    </div>


                    {/* =========================================
                        LISTA DIREITA
                    ========================================= */}

                    <div className="lista selecionados">

                        <div className="lista-header fixo">

                            <h4>
                                Selecionados
                            </h4>


                            <div className="acoes">

                                <button
                                    onClick={
                                        designar
                                    }
                                    disabled={
                                        gerando ||
                                        selecionados.length === 0
                                    }
                                >

                                    {
                                        gerando
                                            ? "Gerando..."
                                            : "Designar código"
                                    }

                                </button>


                                <button
                                    onClick={
                                        imprimir
                                    }
                                    disabled={
                                        selecionados.length === 0
                                    }
                                >
                                    Imprimir
                                </button>

                            </div>

                        </div>


                        <div className="lista-body">

                            {selecionados.map(p => (

                                <div
                                    key={p.id}
                                    className="linha"
                                >

                                    <div className="linha-info">

                                        <span className="nome-produto">
                                            {p.nome}
                                        </span>


                                        <span className="unidade-produto">

                                            {unidadeProduto(p)}

                                        </span>


                                        <span className="codigo-produto">

                                            {p[modo] || "Sem código"}

                                        </span>

                                    </div>


                                    <button
                                        className="btn-remover"
                                        onClick={() =>
                                            removerProduto(p)
                                        }
                                        title="Remover da lista"
                                    >
                                        ✕
                                    </button>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}