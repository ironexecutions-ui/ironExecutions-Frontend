import React, { useCallback, useEffect, useState } from "react";



import { API_URL } from "../../../../../../config";

import "./parceirosextensao.css";



export default function ParceirosExtensao({ parceiro }) {

    const [aba, setAba] = useState("meus-produtos");

    const [busca, setBusca] = useState("");

    const [resultados, setResultados] = useState([]);

    const [selecionados, setSelecionados] = useState({});

    const [meusProdutos, setMeusProdutos] = useState([]);



    const [carregandoBusca, setCarregandoBusca] = useState(false);

    const [carregandoLista, setCarregandoLista] = useState(true);

    const [salvando, setSalvando] = useState(false);



    const [erro, setErro] = useState("");

    const [sucesso, setSucesso] = useState("");



    const token = localStorage.getItem("token");

    const parceriaId = parceiro?.id;

    const [dataFiltro, setDataFiltro] = useState(

        new Date().toLocaleDateString("en-CA")

    );

    const headers = {

        Authorization: `Bearer ${token}`

    };

    const [produtosParceiro, setProdutosParceiro] = useState([]);

    const [carregandoProdutosParceiro, setCarregandoProdutosParceiro] =

        useState(false);

    const [salvandoProdutoParceiro, setSalvandoProdutoParceiro] =

        useState(false);

    const [editandoProdutoParceiro, setEditandoProdutoParceiro] =

        useState(null);

    const [novoAdicionalPorProduto, setNovoAdicionalPorProduto] = useState({});

    const [historicoVendas, setHistoricoVendas] = useState([]);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [dataFiltroHistorico, setDataFiltroHistorico] = useState(
        new Date().toLocaleDateString("en-CA")
    );
    const [protocoloAberto, setProtocoloAberto] = useState(null);




    const [formProdutoParceiro, setFormProdutoParceiro] = useState({

        produto: "",

        adicionais: "",

        valor: ""

    });

    const tratarErro = async resposta => {

        const dados = await resposta.json().catch(() => ({}));



        if (!resposta.ok) {

            throw new Error(

                typeof dados.detail === "string"

                    ? dados.detail

                    : "Não foi possível concluir a operação."

            );

        }



        return dados;

    };

    const produtosPorData = meusProdutos.filter((item) => {

        if (!dataFiltro) return true;



        return String(item.data || "").slice(0, 10) === dataFiltro;

    });



    const quantidadeTotal = produtosPorData.reduce(

        (total, item) => total + Number(item.quantos || 0),

        0

    );



    const valorTotal = produtosPorData.reduce(

        (total, item) =>

            total +

            Number(item.quantos || 0) * Number(item.valor || 0),

        0

    );



    function escaparHTML(valor) {

        return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#39;"

        })[caractere]);

    }



    function imprimirRelatorio() {

        if (produtosPorData.length === 0) {

            setErro("Não existem produtos cadastrados para a data selecionada.");

            return;

        }



        const nomeParceiro =

            parceiro?.parceiro_nome ||

            parceiro?.parceiro ||

            produtosPorData[0]?.parceiro_nome ||

            "Não informado";



        const nomeComercio =

            parceiro?.comercio_nome ||

            produtosPorData[0]?.comercio_nome ||

            "Comércio não informado";



        const dataFormatada = formatarData(dataFiltro);



        const linhas = produtosPorData.map((item) => {

            const quantidade = Number(item.quantos || 0);

            const valorUnitario = Number(item.valor || 0);

            const totalProduto = quantidade * valorUnitario;



            return `

        <tr>

            <td>${escaparHTML(

                item.nome_produto || `Produto #${item.produto_id}`

            )}</td>

            <td class="numero">${quantidade}</td>

            <td class="numero">${formatarValor(valorUnitario)}</td>

            <td class="numero">${formatarValor(totalProduto)}</td>

        </tr>

    `;

        }).join("");



        const janela = window.open("", "_blank", "width=1100,height=800");



        if (!janela) {

            setErro("O navegador bloqueou a impressão. Permita janelas pop-up para este site.");

            return;

        }



        janela.document.write(`

        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>Relatório de Produtos - ${escaparHTML(dataFormatada)}</title>



            <style>

                * {

                    box-sizing: border-box;

                }



                body {

                    font-family: Arial, Helvetica, sans-serif;

                    color: #172033;

                    margin: 32px;

                    font-size: 12px;

                }



                header {

                    border-bottom: 3px solid #2457d6;

                    padding-bottom: 16px;

                    margin-bottom: 24px;

                }



                h1 {

                    margin: 0 0 8px;

                    font-size: 23px;

                    color: #173fa8;

                }



                h2 {

                    font-size: 15px;

                    margin: 24px 0 10px;

                }



                p {

                    margin: 5px 0;

                }



                .resumo {

                    display: flex;

                    gap: 12px;

                    margin: 20px 0;

                }



                .resumo div {

                    flex: 1;

                    border: 1px solid #d7deea;

                    padding: 12px;

                    border-radius: 5px;

                }



                .resumo strong {

                    display: block;

                    margin-top: 6px;

                    font-size: 16px;

                }



                table {

                    width: 100%;

                    border-collapse: collapse;

                    margin-top: 14px;

                }



                th, td {

                    border: 1px solid #cbd3df;

                    padding: 9px 7px;

                    text-align: left;

                }



                th {

                    background: #edf3ff;

                    color: #173fa8;

                }



                .numero {

                    text-align: right;

                    white-space: nowrap;

                }



                tfoot td {

                    font-weight: bold;

                    background: #f4f6fa;

                }



                .assinaturas {

                    display: flex;

                    gap: 50px;

                    margin-top: 65px;

                }



                .assinaturas div {

                    flex: 1;

                    text-align: center;

                    border-top: 1px solid #333;

                    padding-top: 8px;

                }



                .rodape {

                    margin-top: 30px;

                    color: #5b6473;

                    font-size: 10px;

                }



                @media print {

                    body {

                        margin: 10mm;

                    }



                    .nao-imprimir {

                        display: none;

                    }



                    tr {

                        break-inside: avoid;

                    }

                }

            </style>

        </head>



        <body>

            <header>

                <h1>Relatório de Produtos da Parceria</h1>

                <p><strong>Comércio:</strong> ${escaparHTML(nomeComercio)}</p>

                <p><strong>Parceiro:</strong> ${escaparHTML(nomeParceiro)}</p>

                <p><strong>Data do relatório:</strong> ${escaparHTML(dataFormatada)}</p>

            </header>



            <section class="resumo">

                <div>

                    Produtos 

                    <strong>${produtosPorData.length}</strong>

                </div>



                <div>

                    Quantidade total de itens

                    <strong>${quantidadeTotal}</strong>

                </div>



                <div>

                    Valor total

                    <strong>${formatarValor(valorTotal)}</strong>

                </div>

            </section>



            <h2>Detalhamento dos produtos</h2>



            <table>

                <thead>

                    <tr>

                        <th>Produto</th>

                        <th class="numero">Quantidade</th>

                        <th class="numero">Valor unitário</th>

                        <th class="numero">Total</th>

                    </tr>

                </thead>



                <tbody>

                    ${linhas}

                </tbody>



                <tfoot>

                    <tr>

                        <td colspan="2">TOTAL GERAL</td>

                       

                        <td class="numero">${formatarValor(valorTotal)}</td>

                    </tr>

                </tfoot>

            </table>



            <div class="assinaturas">

                <div>Responsável pelo comércio</div>

                <div>Responsável pela parceria</div>

            </div>



            <p class="rodape">

                Documento gerado pelo sistema Iron Executions.

            </p>



            <div class="nao-imprimir" style="margin-top: 25px;">

                <button onclick="window.print()">Imprimir documento</button>

            </div>



            <script>

                window.onload = function() {

                    window.print();

                };

            <\\/script>

        </body>

        </html>

    `);



        janela.document.close();

    }

    const carregarMeusProdutos = useCallback(async () => {

        if (!token || !parceriaId) {

            setCarregandoLista(false);

            return;

        }



        setCarregandoLista(true);



        try {

            const resposta = await fetch(

                `${API_URL}/parceiros-produtos/${parceriaId}`,

                { headers }

            );



            const dados = await tratarErro(resposta);

            setMeusProdutos(dados);

        } catch (error) {

            setErro(error.message);

        } finally {

            setCarregandoLista(false);

        }

    }, [token, parceriaId]);



    useEffect(() => {

        setAba("meus-produtos");

        setBusca("");

        setResultados([]);

        setSelecionados({});

        setErro("");

        setSucesso("");



        carregarMeusProdutos();

    }, [carregarMeusProdutos]);



    async function pesquisarProdutos(event) {

        event.preventDefault();



        const termo = busca.trim();



        if (!termo) {

            setErro("Digite o nome ou o código de barras do produto.");

            return;

        }



        setCarregandoBusca(true);

        setErro("");

        setSucesso("");

        setResultados([]);

        setSelecionados({});



        try {

            const resposta = await fetch(

                `${API_URL}/parceiros-produtos/${parceriaId}/buscar?q=${encodeURIComponent(termo)}`,

                { headers }

            );



            const dados = await tratarErro(resposta);

            setResultados(dados);



            if (dados.length === 0) {

                setSucesso("Nenhum produto encontrado.");

            }

        } catch (error) {

            setErro(error.message);

        } finally {

            setCarregandoBusca(false);

        }

    }



    function alternarSelecao(produto) {

        setSelecionados(atual => {

            const novo = { ...atual };



            if (novo[produto.id]) {

                delete novo[produto.id];

            } else {

                novo[produto.id] = {

                    produto,

                    quantos: 1,

                    valor: Number(produto.preco || 0)

                };

            }



            return novo;

        });

    }



    function atualizarSelecionado(produtoId, campo, valor) {

        setSelecionados(atual => ({

            ...atual,

            [produtoId]: {

                ...atual[produtoId],

                [campo]: valor

            }

        }));

    }



    async function adicionarSelecionados() {

        const lista = Object.values(selecionados);



        if (lista.length === 0) {

            setErro("Selecione pelo menos um produto.");

            return;

        }



        for (const item of lista) {

            if (

                !Number.isInteger(Number(item.quantos)) ||

                Number(item.quantos) < 1

            ) {

                setErro(`Informe uma quantidade válida para ${item.produto.nome}.`);

                return;

            }



            if (

                item.valor === "" ||

                !Number.isFinite(Number(item.valor)) ||

                Number(item.valor) < 0

            ) {

                setErro(`Informe um valor válido para ${item.produto.nome}.`);

                return;

            }

        }



        setSalvando(true);

        setErro("");

        setSucesso("");



        let adicionados = 0;



        try {

            for (const item of lista) {

                const resposta = await fetch(

                    `${API_URL}/parceiros-produtos/${parceriaId}`,

                    {

                        method: "POST",

                        headers: {

                            ...headers,

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify({

                            produto_id: Number(item.produto.id),

                            quantos: Number(item.quantos),

                            valor: Number(item.valor)

                        })

                    }

                );



                await tratarErro(resposta);

                adicionados++;

            }



            setSucesso(

                `${adicionados} produto(s) adicionado(s) à parceria.`

            );



            setSelecionados({});

            setResultados([]);

            setBusca("");



            await carregarMeusProdutos();

        } catch (error) {

            setErro(

                `${error.message} ${adicionados > 0

                    ? `${adicionados} produto(s) já foram adicionados.`

                    : ""}`

            );



            if (adicionados > 0) {

                await carregarMeusProdutos();

            }

        } finally {

            setSalvando(false);

        }

    }



    async function excluirProduto(item) {

        const confirmar = window.confirm(

            `Deseja remover "${item.nome_produto || "este produto"}" desta parceria?`

        );



        if (!confirmar) return;



        setErro("");

        setSucesso("");



        try {

            const resposta = await fetch(

                `${API_URL}/parceiros-produtos/${parceriaId}/${item.id}`,

                {

                    method: "DELETE",

                    headers

                }

            );



            await tratarErro(resposta);



            setSucesso("Produto removido da parceria.");

            await carregarMeusProdutos();

        } catch (error) {

            setErro(error.message);

        }

    }



    function obterImagem(imagemUrl) {

        if (!imagemUrl) return "";



        if (Array.isArray(imagemUrl)) {

            return imagemUrl[0] || "";

        }



        return String(imagemUrl)

            .split("|")

            .map(url => url.trim())

            .find(Boolean) || "";

    }



    function formatarValor(valor) {

        return Number(valor || 0).toLocaleString("pt-BR", {

            style: "currency",

            currency: "BRL"

        });

    }



    function formatarData(data) {

        if (!data) return "Sem data";



        const somenteData = String(data).slice(0, 10);

        const partes = somenteData.split("-");



        if (partes.length !== 3) return somenteData;



        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }

    const carregarHistoricoVendas = useCallback(async () => {
        if (!token || !parceriaId) return;

        setCarregandoHistorico(true);
        setErro("");

        try {
            const resposta = await fetch(
                `${API_URL}/parceiros-catalogo/parceiros-historico/${parceriaId}`,
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        ...headers,
                        "Cache-Control": "no-cache"
                    }
                }
            );

            const dados = await tratarErro(resposta);
            const lista = Array.isArray(dados)
                ? dados
                : Array.isArray(dados.itens)
                    ? dados.itens
                    : Array.isArray(dados.vendas)
                        ? dados.vendas
                        : [];

            setHistoricoVendas(lista);
        } catch (error) {
            setErro(error.message || "Não foi possível carregar o histórico de vendas.");
        } finally {
            setCarregandoHistorico(false);
        }
    }, [token, parceriaId]);

    useEffect(() => {
        if (aba === "historico-vendas") {
            carregarHistoricoVendas();
        }
    }, [aba, carregarHistoricoVendas]);

    const historicoPorData = historicoVendas.filter((item) => {
        const data = String(item.data_venda || item.data || "").slice(0, 10);
        return !dataFiltroHistorico || data === dataFiltroHistorico;
    });

    const vendasAgrupadas = historicoPorData.reduce((grupos, item) => {
        const data = String(item.data_venda || item.data || "").slice(0, 10) || "sem-data";
        const protocolo = String(item.protocolo ?? "sem-protocolo");
        const chave = `${data}__${protocolo}`;

        if (!grupos[chave]) {
            grupos[chave] = {
                chave,
                data,
                protocolo,
                itens: [],
                total: 0
            };
        }

        grupos[chave].itens.push(item);
        grupos[chave].total += Number(item.valor || 0);
        return grupos;
    }, {});

    const listaVendasAgrupadas = Object.values(vendasAgrupadas).sort((a, b) => {
        const dataComparacao = b.data.localeCompare(a.data);
        if (dataComparacao !== 0) return dataComparacao;
        return Number(b.protocolo) - Number(a.protocolo);
    });

    function imprimirHistoricoVendas() {
        if (historicoPorData.length === 0) {
            setErro("Não existem vendas para o período selecionado.");
            return;
        }

        const nomeParceiro =
            parceiro?.parceiro_nome ||
            parceiro?.parceiro ||
            "Não informado";

        const nomeComercio = parceiro?.comercio_nome || "Comércio não informado";
        const dataRelatorio = dataFiltroHistorico
            ? formatarData(dataFiltroHistorico)
            : "Todas as datas";

        const grupos = Object.values(
            historicoPorData.reduce((acc, item) => {
                const data = String(item.data_venda || item.data || "").slice(0, 10) || "sem-data";
                const protocolo = String(item.protocolo ?? "sem-protocolo");
                const chave = `${data}__${protocolo}`;

                if (!acc[chave]) {
                    acc[chave] = { data, protocolo, itens: [], total: 0 };
                }
                acc[chave].itens.push(item);
                acc[chave].total += Number(item.valor || 0);
                return acc;
            }, {})
        ).sort((a, b) => {
            const comparacao = b.data.localeCompare(a.data);
            return comparacao || Number(b.protocolo) - Number(a.protocolo);
        });

        const totalGeral = grupos.reduce((total, venda) => total + venda.total, 0);
        const totalItens = historicoPorData.length;

        const secaoVendas = grupos.map((venda) => {
            const linhas = venda.itens.map((item) => `
                <tr>
                    <td>${escaparHTML(item.produto || item.nome_produto || `Produto #${item.produto_id}`)}</td>
                    <td>${escaparHTML(item.acompanhantes || "—")}</td>
                    <td class="numero">${formatarValor(item.valor)}</td>
                </tr>
            `).join("");

            return `
                <section class="venda">
                    <div class="venda-topo">
                        <div>
                            <span class="rotulo">PROTOCOLO</span>
                            <strong class="protocolo">${escaparHTML(venda.protocolo)}</strong>
                            <span class="data">Data: ${escaparHTML(formatarData(venda.data))}</span>
                        </div>
                        <div class="total-venda">
                            <span>Total desta venda</span>
                            <strong>${formatarValor(venda.total)}</strong>
                        </div>
                    </div>
                    <table>
                        <thead><tr><th>Produto</th><th>Acompanhantes / adicionais</th><th class="numero">Valor</th></tr></thead>
                        <tbody>${linhas}</tbody>
                        <tfoot><tr><td colspan="2">Subtotal do protocolo</td><td class="numero">${formatarValor(venda.total)}</td></tr></tfoot>
                    </table>
                </section>
            `;
        }).join("");

        const janela = window.open("", "_blank", "width=1100,height=850");
        if (!janela) {
            setErro("O navegador bloqueou a impressão. Permita janelas pop-up para este site.");
            return;
        }

        janela.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Prestação de contas — ${escaparHTML(dataRelatorio)}</title>
                <style>
                    * { box-sizing: border-box; }
                    body { margin: 16mm; color: #172033; font: 11px/1.5 Arial, Helvetica, sans-serif; }
                    header { border-bottom: 3px solid #1949b8; padding-bottom: 16px; }
                    .marca { color: #1949b8; font-size: 10px; font-weight: 800; letter-spacing: 2px; }
                    h1 { margin: 5px 0 10px; font-size: 25px; color: #14264a; }
                    .subtitulo { color: #667085; font-size: 12px; }
                    .resumo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0 24px; }
                    .cartao { border: 1px solid #d9e1ee; border-radius: 8px; padding: 13px; background: #f7f9fc; }
                    .cartao span { display: block; color: #667085; font-size: 10px; }
                    .cartao strong { display: block; margin-top: 5px; font-size: 18px; color: #173fa8; }
                    .venda { margin: 18px 0 24px; break-inside: avoid; }
                    .venda-topo { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 12px; border: 1px solid #d9e1ee; border-bottom: 0; background: #f3f6fc; }
                    .rotulo { display: block; color: #667085; font-size: 9px; font-weight: 800; letter-spacing: 1.4px; }
                    .protocolo { display: block; color: #173fa8; font-size: 20px; }
                    .data { display: block; margin-top: 3px; color: #667085; }
                    .total-venda { text-align: right; }
                    .total-venda span { display: block; color: #667085; font-size: 10px; }
                    .total-venda strong { font-size: 17px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; border: 1px solid #d8deea; text-align: left; overflow-wrap: anywhere; }
                    th { background: #eaf0fb; color: #173fa8; }
                    .numero { text-align: right; white-space: nowrap; }
                    tfoot td { font-weight: 800; background: #f7f9fc; }
                    .total-geral { margin-top: 28px; padding: 18px; background: #14264a; color: #fff; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
                    .total-geral strong { font-size: 24px; }
                    .assinaturas { display: flex; gap: 50px; margin-top: 70px; break-inside: avoid; }
                    .assinaturas div { flex: 1; text-align: center; border-top: 1px solid #475467; padding-top: 8px; }
                    .rodape { margin-top: 30px; padding-top: 10px; border-top: 1px solid #d8deea; color: #667085; font-size: 9px; }
                    .nao-imprimir { margin: 20px 0; }
                    .nao-imprimir button { padding: 10px 16px; border: 0; border-radius: 6px; background: #1949b8; color: white; font-weight: bold; }
                    @page { size: A4; margin: 12mm; }
                    @media print { body { margin: 0; } .nao-imprimir { display: none; } }
                </style>
            </head>
            <body>
                <header>
                    <span class="marca">IRON EXECUTIONS</span>
                    <h1>Relatório de prestação de contas</h1>
                    <div class="subtitulo">Histórico de vendas agrupado por data e protocolo</div>
                    <p><strong>Comércio:</strong> ${escaparHTML(nomeComercio)}</p>
                    <p><strong>Parceiro:</strong> ${escaparHTML(nomeParceiro)}</p>
                    <p><strong>Período:</strong> ${escaparHTML(dataRelatorio)}</p>
                    <p><strong>Emitido em:</strong> ${escaparHTML(new Date().toLocaleString("pt-BR"))}</p>
                </header>
                <section class="resumo">
                    <div class="cartao"><span>Vendas / protocolos</span><strong>${grupos.length}</strong></div>
                    <div class="cartao"><span>Produtos registrados</span><strong>${totalItens}</strong></div>
                    <div class="cartao"><span>Valor total apurado</span><strong>${formatarValor(totalGeral)}</strong></div>
                </section>
                <h2>Detalhamento por venda</h2>
                ${secaoVendas}
                <div class="total-geral"><span>TOTAL GERAL DO PERÍODO</span><strong>${formatarValor(totalGeral)}</strong></div>
                <div class="assinaturas">
                    <div>Responsável pelo comércio</div>
                    <div>Responsável pela conferência</div>
                </div>
                <p class="rodape">Documento gerado pelo Iron Executions para conferência e prestação de contas. Os valores refletem os registros disponíveis no histórico no momento da emissão.</p>
                <div class="nao-imprimir"><button onclick="window.print()">Imprimir / salvar em PDF</button></div>
                <script>window.onload = function () { window.print(); };</script>
            </body>
            </html>
        `);
        janela.document.close();
    }

    const carregarProdutosParceiro = useCallback(async () => {

        if (!token || !parceriaId) return;



        setCarregandoProdutosParceiro(true);



        try {

            const resposta = await fetch(

                `${API_URL}/parceiros-catalogo/${parceriaId}`,

                { headers }

            );



            const dados = await tratarErro(resposta);

            setProdutosParceiro(dados);

        } catch (error) {

            setErro(error.message);

        } finally {

            setCarregandoProdutosParceiro(false);

        }

    }, [token, parceriaId]);



    useEffect(() => {

        if (aba === "produtos-parceiro") {

            carregarProdutosParceiro();

        }

    }, [aba, carregarProdutosParceiro]);



    function limparFormularioParceiro() {

        setFormProdutoParceiro({

            produto: "",

            adicionais: "",

            valor: ""

        });

        setEditandoProdutoParceiro(null);

    }



    function editarProdutoParceiro(item) {

        setEditandoProdutoParceiro(item.id);



        setFormProdutoParceiro({

            produto: item.produto || "",

            adicionais: item.adicionais || "",

            valor: String(item.valor ?? "")

        });



        setErro("");

        setSucesso("");



        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }



    async function salvarProdutoParceiro(event) {

        event.preventDefault();



        const produto = formProdutoParceiro.produto.trim();

        const adicionais = formProdutoParceiro.adicionais

            .split("|")

            .map((item) => item.trim())

            .filter(Boolean)

            .join(" | ");



        const valor = Number(formProdutoParceiro.valor);

        const acaoCadastro =

            event.nativeEvent?.submitter?.value || "cadastrar";

        if (!produto) {

            setErro("Informe o nome do produto.");

            return;

        }



        if (

            formProdutoParceiro.valor === "" ||

            !Number.isFinite(valor) ||

            valor < 0

        ) {

            setErro("Informe um valor válido.");

            return;

        }



        setSalvandoProdutoParceiro(true);

        setErro("");

        setSucesso("");



        try {

            const editando = editandoProdutoParceiro !== null;



            const url = editando

                ? `${API_URL}/parceiros-catalogo/${parceriaId}/${editandoProdutoParceiro}`

                : `${API_URL}/parceiros-catalogo/${parceriaId}`;



            const resposta = await fetch(url, {

                method: editando ? "PUT" : "POST",

                headers: {

                    ...headers,

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    produto,

                    adicionais,

                    valor

                })

            });



            const resultado = await tratarErro(resposta);



            setSucesso(

                resultado.mensagem ||

                (editando

                    ? "Produto atualizado com sucesso."

                    : "Produto cadastrado com sucesso.")

            );



            if (!editando && acaoCadastro === "continuar") {

                // Mantém os adicionais para o próximo cadastro.

                setFormProdutoParceiro((atual) => ({

                    produto: "",

                    adicionais: atual.adicionais,

                    valor: ""

                }));



                setEditandoProdutoParceiro(null);

            } else {

                // Cadastro normal ou edição: limpa o formulário.

                limparFormularioParceiro();

            }



            await carregarProdutosParceiro();

        } catch (error) {

            setErro(error.message);

        } finally {

            setSalvandoProdutoParceiro(false);

        }

    }



    async function excluirProdutoParceiro(item) {

        const confirmar = window.confirm(

            `Deseja excluir o produto "${item.produto}" deste parceiro?`

        );



        if (!confirmar) return;



        setErro("");

        setSucesso("");



        try {

            const resposta = await fetch(

                `${API_URL}/parceiros-catalogo/${parceriaId}/${item.id}`,

                {

                    method: "DELETE",

                    headers

                }

            );



            const resultado = await tratarErro(resposta);



            setSucesso(resultado.mensagem || "Produto excluído.");



            if (editandoProdutoParceiro === item.id) {

                limparFormularioParceiro();

            }



            await carregarProdutosParceiro();

        } catch (error) {

            setErro(error.message);

        }

    } async function salvarAdicionaisDoProduto(item) {

        setErro("");

        setSucesso("");



        try {

            const resposta = await fetch(

                `${API_URL}/parceiros-catalogo/${parceriaId}/${item.id}`,

                {

                    method: "PUT",

                    headers: {

                        ...headers,

                        "Content-Type": "application/json",

                    },

                    body: JSON.stringify({

                        produto: item.produto,

                        adicionais: item.adicionais || "",

                        valor: Number(item.valor),

                    }),

                }

            );



            const resultado = await tratarErro(resposta);



            setSucesso(resultado.mensagem || "Adicionais salvos com sucesso.");



            await carregarProdutosParceiro();

        } catch (error) {

            setErro(error.message);

        }

    }

    return (

        <div className="pe-container">





            <nav className="pe-abas">

                <button

                    type="button"

                    className={aba === "meus-produtos" ? "ativo" : ""}

                    onClick={() => setAba("meus-produtos")}

                >

                    Meus Produtos

                </button>



                <button

                    type="button"

                    className={aba === "produtos-parceiro" ? "ativo" : ""}

                    onClick={() => setAba("produtos-parceiro")}

                >

                    Produtos do Parceiro

                </button>

                <button
                    type="button"
                    className={aba === "historico-vendas" ? "ativo" : ""}
                    onClick={() => setAba("historico-vendas")}
                >
                    Histórico de vendas
                </button>

            </nav>



            {erro && (

                <div className="pe-alerta pe-erro">

                    {erro}

                </div>

            )}



            {sucesso && (

                <div className="pe-alerta pe-sucesso">

                    {sucesso}

                </div>

            )}



            {aba === "meus-produtos" && (

                <>

                    <form

                        className="pe-pesquisa"

                        onSubmit={pesquisarProdutos}

                    >

                        <div className="pe-pesquisa-campo">

                            <label htmlFor="pe-busca">

                                Pesquisar no seu estoque

                            </label>



                            <input

                                id="pe-busca"

                                type="search"

                                value={busca}

                                onChange={e => setBusca(e.target.value)}

                                placeholder="Nome ou código de barras..."

                                maxLength={255}

                            />

                        </div>



                        <button

                            type="submit"

                            disabled={carregandoBusca || !busca.trim()}

                        >

                            {carregandoBusca ? "Pesquisando..." : "Pesquisar"}

                        </button>

                    </form>



                    {resultados.length > 0 && (

                        <section className="pe-resultados">

                            <div className="pe-titulo-secao">

                                <h3>Resultados da pesquisa</h3>

                                <span>{resultados.length} produto(s)</span>

                            </div>



                            {resultados.map(produto => {

                                const imagem = obterImagem(produto.imagem_url);

                                const selecionado = Boolean(

                                    selecionados[produto.id]

                                );

                                const item = selecionados[produto.id];



                                return (

                                    <article

                                        className={`pe-produto ${selecionado ? "pe-selecionado" : ""

                                            }`}

                                        key={produto.id}

                                    >

                                        <label className="pe-checkbox">

                                            <input

                                                type="checkbox"

                                                checked={selecionado}

                                                onChange={() =>

                                                    alternarSelecao(produto)

                                                }

                                            />

                                        </label>



                                        {imagem ? (

                                            <img

                                                className="pe-imagem"

                                                src={imagem}

                                                alt={produto.nome}

                                                loading="lazy"

                                            />

                                        ) : (

                                            <div className="pe-sem-imagem">

                                                Sem imagem

                                            </div>

                                        )}



                                        <div className="pe-produto-info">

                                            <strong>{produto.nome}</strong>



                                            <span>

                                                Código: {produto.codigo_barras || "Não informado"}

                                            </span>



                                            <span>

                                                Preço original: {formatarValor(produto.preco)}

                                            </span>

                                        </div>



                                        {selecionado && (

                                            <div className="pe-campos-produto">

                                                <label>

                                                    Quantidade

                                                    <input

                                                        type="number"

                                                        min="1"

                                                        step="1"

                                                        value={item.quantos}

                                                        onChange={e =>

                                                            atualizarSelecionado(

                                                                produto.id,

                                                                "quantos",

                                                                e.target.value

                                                            )

                                                        }

                                                    />

                                                </label>



                                                <label>

                                                    Valor unitário (R$)

                                                    <input

                                                        type="number"

                                                        min="0"

                                                        step="0.01"

                                                        value={item.valor}

                                                        onChange={e =>

                                                            atualizarSelecionado(

                                                                produto.id,

                                                                "valor",

                                                                e.target.value

                                                            )

                                                        }

                                                    />

                                                </label>

                                            </div>

                                        )}

                                    </article>

                                );

                            })}



                            <button

                                type="button"

                                className="pe-adicionar"

                                onClick={adicionarSelecionados}

                                disabled={

                                    salvando ||

                                    Object.keys(selecionados).length === 0

                                }

                            >

                                {salvando

                                    ? "Salvando produtos..."

                                    : `Adicionar selecionados (${Object.keys(selecionados).length})`}

                            </button>

                        </section>

                    )}



                    <section className="pe-lista-salvos pe-relatorio">

                        <div className="pe-titulo-secao">

                            <div>

                                <h3>Produtos desta parceria</h3>

                                <span>

                                    {produtosPorData.length} registro(s) na data selecionada

                                </span>

                            </div>

                        </div>



                        <div className="pe-filtro-data">

                            <label htmlFor="pe-data-filtro">

                                Consultar produtos por data

                            </label>



                            <input

                                id="pe-data-filtro"

                                type="date"

                                value={dataFiltro}

                                onChange={(e) => setDataFiltro(e.target.value)}

                            />



                            <button

                                type="button"

                                onClick={() => setDataFiltro("")}

                            >

                                Todas as datas

                            </button>



                            <button

                                type="button"

                                className="pe-imprimir"

                                onClick={imprimirRelatorio}

                                disabled={carregandoLista || produtosPorData.length === 0}

                            >

                                Imprimir relatório

                            </button>

                        </div>



                        <div className="pe-resumo-financeiro">

                            <article>

                                <span>Registros na data</span>

                                <strong>{produtosPorData.length}</strong>

                            </article>



                            <article>

                                <span>Quantidade total de itens</span>

                                <strong>{quantidadeTotal}</strong>

                            </article>



                            <article>

                                <span>Valor total dos produtos</span>

                                <strong>{formatarValor(valorTotal)}</strong>

                            </article>

                        </div>



                        {carregandoLista ? (

                            <p className="pe-vazio">Carregando produtos...</p>

                        ) : produtosPorData.length === 0 ? (

                            <p className="pe-vazio">

                                Nenhum produto encontrado para esta data.

                            </p>

                        ) : (

                            <div className="pe-tabela-container">

                                <table className="pe-tabela-relatorio">

                                    <thead>

                                        <tr>

                                            <th>Produto</th>

                                            <th>Quantidade</th>

                                            <th>Valor unitário</th>

                                            <th>Total</th>

                                            <th>Data</th>

                                            <th>Ação</th>

                                        </tr>

                                    </thead>



                                    <tbody>

                                        {produtosPorData.map((item) => (

                                            <tr key={item.id}>

                                                <td>

                                                    {item.nome_produto ||

                                                        `Produto #${item.produto_id}`}

                                                </td>





                                                <td>{item.quantos}</td>



                                                <td>{formatarValor(item.valor)}</td>



                                                <td>

                                                    <strong>

                                                        {formatarValor(

                                                            Number(item.quantos || 0) *

                                                            Number(item.valor || 0)

                                                        )}

                                                    </strong>

                                                </td>



                                                <td>{formatarData(item.data)}</td>



                                                <td>

                                                    <button

                                                        type="button"

                                                        className="pe-excluir"

                                                        onClick={() => excluirProduto(item)}

                                                    >

                                                        Excluir

                                                    </button>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>



                                    <tfoot>

                                        <tr>

                                            <td>TOTAL</td>

                                            <td>{quantidadeTotal}</td>

                                            <td></td>

                                            <td>{formatarValor(valorTotal)}</td>

                                            <td colSpan={2}></td>

                                        </tr>

                                    </tfoot>

                                </table>

                            </div>

                        )}

                    </section>

                </>

            )}



            {aba === "produtos-parceiro" && (

                <section className="pe-catalogo-parceiro">

                    <div className="pe-catalogo-cabecalho">

                        <div>

                            <h3>Produtos do Parceiro</h3>

                            <p>

                                Cadastre e gerencie os produtos oferecidos por{" "}

                                <strong>{parceiro?.parceiro || "este parceiro"}</strong>.

                            </p>

                        </div>



                        <span className="pe-catalogo-contador">

                            {produtosParceiro.length} produto(s)

                        </span>

                    </div>



                    <form

                        className="pe-form-parceiro"

                        onSubmit={salvarProdutoParceiro}

                    >

                        <h4>

                            {editandoProdutoParceiro !== null

                                ? "Editar produto"

                                : "Cadastrar novo produto"}

                        </h4>



                        <div className="pe-form-parceiro-grid">

                            <label className="pe-campo-parceiro pe-campo-nome">

                                Nome do produto

                                <input

                                    type="text"

                                    maxLength={255}

                                    placeholder="Ex.: Hambúrguer artesanal"

                                    value={formProdutoParceiro.produto}

                                    onChange={(e) =>

                                        setFormProdutoParceiro((atual) => ({

                                            ...atual,

                                            produto: e.target.value

                                        }))

                                    }

                                    required

                                />

                            </label>



                            <label className="pe-campo-parceiro">

                                Valor (R$)

                                <input

                                    type="number"

                                    min="0"

                                    step="0.01"

                                    placeholder="0,00"

                                    value={formProdutoParceiro.valor}

                                    onChange={(e) =>

                                        setFormProdutoParceiro((atual) => ({

                                            ...atual,

                                            valor: e.target.value

                                        }))

                                    }

                                    required

                                />

                            </label>



                            <label className="pe-campo-parceiro pe-campo-adicionais">

                                Adicionais



                                <div className="pe-lista-inputs-adicionais">

                                    {formProdutoParceiro.adicionais

                                        .split("|")

                                        .map((adicional) => adicional.trim())

                                        .filter(Boolean)

                                        .map((adicional, index) => (

                                            <div

                                                className="pe-input-adicional-item"

                                                key={`${index}-${adicional}`}

                                            >

                                                <input

                                                    type="text"

                                                    value={adicional}

                                                    readOnly

                                                />



                                                <button

                                                    type="button"

                                                    onClick={() => {

                                                        const lista = formProdutoParceiro.adicionais

                                                            .split("|")

                                                            .map((item) => item.trim())

                                                            .filter(Boolean);



                                                        lista.splice(index, 1);



                                                        setFormProdutoParceiro((atual) => ({

                                                            ...atual,

                                                            adicionais: lista.join("|")

                                                        }));

                                                    }}

                                                >

                                                    ×

                                                </button>

                                            </div>

                                        ))}



                                    <input

                                        type="text"

                                        placeholder="Digite um adicional e aperte Enter"

                                        onKeyDown={(e) => {

                                            if (e.key !== "Enter") return;



                                            e.preventDefault();



                                            const novo = e.currentTarget.value.trim();

                                            if (!novo) return;



                                            const lista = formProdutoParceiro.adicionais

                                                .split("|")

                                                .map((item) => item.trim())

                                                .filter(Boolean);



                                            if (

                                                lista.some(

                                                    (item) => item.toLowerCase() === novo.toLowerCase()

                                                )

                                            ) {

                                                e.currentTarget.value = "";

                                                return;

                                            }



                                            setFormProdutoParceiro((atual) => ({

                                                ...atual,

                                                adicionais: [...lista, novo].join("|")

                                            }));



                                            e.currentTarget.value = "";

                                        }}

                                    />

                                </div>

                            </label>

                        </div>



                        <div className="pe-acoes-form-parceiro">

                            <button

                                type="submit"

                                name="acaoCadastro"

                                value="cadastrar"

                                className="pe-botao-salvar-parceiro"

                                disabled={salvandoProdutoParceiro}

                            >

                                {salvandoProdutoParceiro

                                    ? "Salvando..."

                                    : editandoProdutoParceiro !== null

                                        ? "Salvar alterações"

                                        : "Cadastrar produto"}

                            </button>



                            {editandoProdutoParceiro === null && (

                                <button

                                    type="submit"

                                    name="acaoCadastro"

                                    value="continuar"

                                    className="pe-botao-continuar-parceiro"

                                    disabled={salvandoProdutoParceiro}

                                >

                                    {salvandoProdutoParceiro

                                        ? "Salvando..."

                                        : "Cadastrar e continuar"}

                                </button>

                            )}



                            {editandoProdutoParceiro !== null && (

                                <button

                                    type="button"

                                    className="pe-botao-cancelar-parceiro"

                                    onClick={limparFormularioParceiro}

                                >

                                    Cancelar edição

                                </button>

                            )}

                        </div>

                    </form>



                    <div className="pe-lista-catalogo-parceiro">

                        <div className="pe-titulo-secao">

                            <h4>Catálogo cadastrado</h4>

                        </div>



                        {carregandoProdutosParceiro ? (

                            <p className="pe-vazio">Carregando produtos...</p>

                        ) : produtosParceiro.length === 0 ? (

                            <p className="pe-vazio">

                                Este parceiro ainda não possui produtos cadastrados.

                            </p>

                        ) : (

                            <div className="pe-catalogo-grid">

                                {produtosParceiro.map((item) => {

                                    const adicionais = String(item.adicionais || "")

                                        .split("|")

                                        .map((adicional) => adicional.trim())

                                        .filter(Boolean);



                                    return (

                                        <article

                                            className="pe-card-catalogo-parceiro"

                                            key={item.id}

                                        >

                                            <div className="pe-card-catalogo-topo">

                                                <div className="pe-card-produto-icone">P</div>



                                                <span className="pe-card-produto-id">

                                                    Produto #{item.id}

                                                </span>

                                            </div>



                                            <h5>{item.produto}</h5>



                                            <div className="pe-card-adicionais">

                                                <span>Adicionais disponíveis</span>



                                                <div className="pe-lista-inputs-adicionais">

                                                    {adicionais.map((adicional, index) => (

                                                        <div

                                                            className="pe-input-adicional-item"

                                                            key={`${item.id}-${index}`}

                                                        >

                                                            <input

                                                                type="text"

                                                                value={adicional}

                                                                readOnly

                                                                aria-label={`Adicional ${index + 1}`}

                                                            />



                                                            <button

                                                                type="button"

                                                                onClick={() => {

                                                                    const novosAdicionais = adicionais.filter(

                                                                        (_, i) => i !== index

                                                                    );



                                                                    // Atualiza a lista de adicionais do produto.

                                                                    setProdutosParceiro((anteriores) =>

                                                                        anteriores.map((produto) =>

                                                                            produto.id === item.id

                                                                                ? {

                                                                                    ...produto,

                                                                                    adicionais: novosAdicionais.join("|"),

                                                                                }

                                                                                : produto

                                                                        )

                                                                    );

                                                                }}

                                                                title="Remover adicional"

                                                                aria-label={`Remover ${adicional}`}

                                                            >

                                                                ×

                                                            </button>

                                                        </div>

                                                    ))}



                                                    <input

                                                        type="text"

                                                        className="pe-novo-adicional-input"

                                                        placeholder="Digite um adicional e aperte Enter"

                                                        value={novoAdicionalPorProduto?.[item.id] || ""}

                                                        onChange={(e) =>

                                                            setNovoAdicionalPorProduto((anterior) => ({

                                                                ...anterior,

                                                                [item.id]: e.target.value,

                                                            }))

                                                        }

                                                        onKeyDown={(e) => {

                                                            if (e.key === "Enter") {

                                                                e.preventDefault();



                                                                const texto = (

                                                                    novoAdicionalPorProduto?.[item.id] || ""

                                                                ).trim();



                                                                if (!texto) return;



                                                                const listaAtual = adicionais || [];



                                                                // Evita adicionais duplicados.

                                                                if (

                                                                    listaAtual.some(

                                                                        (a) => a.toLowerCase() === texto.toLowerCase()

                                                                    )

                                                                ) {

                                                                    setNovoAdicionalPorProduto((anterior) => ({

                                                                        ...anterior,

                                                                        [item.id]: "",

                                                                    }));

                                                                    return;

                                                                }



                                                                const novaLista = [...listaAtual, texto];



                                                                setProdutosParceiro((anteriores) =>

                                                                    anteriores.map((produto) =>

                                                                        produto.id === item.id

                                                                            ? {

                                                                                ...produto,

                                                                                adicionais: novaLista.join("|"),

                                                                            }

                                                                            : produto

                                                                    )

                                                                );



                                                                setNovoAdicionalPorProduto((anterior) => ({

                                                                    ...anterior,

                                                                    [item.id]: "",

                                                                }));

                                                            }

                                                        }}

                                                    />

                                                </div>



                                                {adicionais.length === 0 && (

                                                    <p>Nenhum adicional cadastrado. Digite acima e aperte Enter.</p>

                                                )}

                                            </div>



                                            <div className="pe-card-produto-rodape">

                                                <div>

                                                    <span>Valor do produto</span>

                                                    <strong>

                                                        {formatarValor(item.valor)}

                                                    </strong>

                                                </div>



                                                <div className="pe-acoes-produto-parceiro">

                                                    <button

                                                        type="button"

                                                        onClick={() =>

                                                            editarProdutoParceiro(item)

                                                        }

                                                    >

                                                        Editar

                                                    </button>



                                                    <button

                                                        type="button"

                                                        className="pe-excluir"

                                                        onClick={() =>

                                                            excluirProdutoParceiro(item)

                                                        }

                                                    >

                                                        Excluir

                                                    </button>

                                                </div>

                                            </div>

                                        </article>

                                    );

                                })}

                            </div>

                        )}

                    </div>

                </section>

            )}

            {aba === "historico-vendas" && (
                <section className="pe-historico-vendas">
                    <div className="pe-historico-cabecalho">
                        <div>
                            <span className="pe-historico-eyebrow">IRONSTORE · CONTROLE FINANCEIRO</span>
                            <h3>Histórico de vendas</h3>
                            <p>Consulte as vendas por data. Cada linha representa um protocolo e reúne todos os produtos registrados naquela venda.</p>
                        </div>
                        <button
                            type="button"
                            className="pe-historico-atualizar"
                            onClick={carregarHistoricoVendas}
                            disabled={carregandoHistorico}
                        >
                            {carregandoHistorico ? "Atualizando..." : "Atualizar histórico"}
                        </button>
                    </div>

                    <div className="pe-historico-filtros">
                        <label htmlFor="pe-historico-data">Filtrar por data</label>
                        <input
                            id="pe-historico-data"
                            type="date"
                            value={dataFiltroHistorico}
                            onChange={(e) => setDataFiltroHistorico(e.target.value)}
                        />
                        <button type="button" onClick={() => setDataFiltroHistorico("")}>
                            Todas as datas
                        </button>
                        <button
                            type="button"
                            className="pe-historico-imprimir"
                            onClick={imprimirHistoricoVendas}
                            disabled={carregandoHistorico || historicoPorData.length === 0}
                        >
                            Imprimir prestação de contas
                        </button>
                    </div>

                    <div className="pe-historico-indicadores">
                        <article>
                            <span>Vendas / protocolos</span>
                            <strong>{listaVendasAgrupadas.length}</strong>
                        </article>
                        <article>
                            <span>Produtos registrados</span>
                            <strong>{historicoPorData.length}</strong>
                        </article>
                        <article>
                            <span>Total do período</span>
                            <strong>
                                {formatarValor(
                                    historicoPorData.reduce((total, item) => total + Number(item.valor || 0), 0)
                                )}
                            </strong>
                        </article>
                    </div>

                    {carregandoHistorico ? (
                        <div className="pe-historico-estado">
                            <span className="pe-historico-spinner" />
                            <strong>Carregando histórico de vendas...</strong>
                            <p>Consultando os protocolos registrados.</p>
                        </div>
                    ) : listaVendasAgrupadas.length === 0 ? (
                        <div className="pe-historico-estado">
                            <strong>Nenhuma venda encontrada</strong>
                            <p>Não existem vendas para a data selecionada ou o histórico ainda está vazio.</p>
                        </div>
                    ) : (
                        <div className="pe-historico-tabela-wrap">
                            <table className="pe-historico-tabela">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Protocolo</th>
                                        <th>Produtos</th>
                                        <th className="pe-historico-numero">Valor total</th>
                                        <th>Detalhes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaVendasAgrupadas.map((venda) => {
                                        const aberta = protocoloAberto === venda.chave;
                                        return (
                                            <React.Fragment key={venda.chave}>
                                                <tr
                                                    className={`pe-historico-linha ${aberta ? "pe-historico-linha-ativa" : ""}`}
                                                    onClick={() => setProtocoloAberto(aberta ? null : venda.chave)}
                                                >
                                                    <td>{formatarData(venda.data)}</td>
                                                    <td>
                                                        <strong className="pe-historico-protocolo">
                                                            {venda.protocolo === "sem-protocolo"
                                                                ? "Sem protocolo"
                                                                : `#${venda.protocolo}`}
                                                        </strong>
                                                    </td>
                                                    <td>{venda.itens.length}</td>
                                                    <td className="pe-historico-numero">
                                                        <strong>{formatarValor(venda.total)}</strong>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="pe-historico-ver"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setProtocoloAberto(aberta ? null : venda.chave);
                                                            }}
                                                        >
                                                            {aberta ? "Ocultar" : "Ver detalhes"}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {aberta && (
                                                    <tr className="pe-historico-detalhes-linha">
                                                        <td colSpan={5}>
                                                            <div className="pe-historico-detalhes">
                                                                <div className="pe-historico-detalhes-topo">
                                                                    <div>
                                                                        <span>DETALHES DA VENDA</span>
                                                                        <h4>Protocolo #{venda.protocolo}</h4>
                                                                        <p>Data: {formatarData(venda.data)}</p>
                                                                    </div>
                                                                    <div className="pe-historico-detalhes-total">
                                                                        <span>Total da venda</span>
                                                                        <strong>{formatarValor(venda.total)}</strong>
                                                                    </div>
                                                                </div>
                                                                <div className="pe-historico-itens">
                                                                    {venda.itens.map((item, indice) => (
                                                                        <article key={`${venda.chave}-${item.id ?? indice}`}>
                                                                            <div>
                                                                                <span>ITEM {String(indice + 1).padStart(2, "0")}</span>
                                                                                <strong>{item.produto || item.nome_produto || `Produto #${item.produto_id}`}</strong>
                                                                                {item.acompanhantes && (
                                                                                    <small>Adicionais: {item.acompanhantes}</small>
                                                                                )}
                                                                            </div>
                                                                            <strong>{formatarValor(item.valor)}</strong>
                                                                        </article>
                                                                    ))}
                                                                </div>
                                                                <div className="pe-historico-subtotal">
                                                                    <span>Total consolidado do protocolo</span>
                                                                    <strong>{formatarValor(venda.total)}</strong>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3}>TOTAL DO PERÍODO</td>
                                        <td className="pe-historico-numero">
                                            {formatarValor(
                                                listaVendasAgrupadas.reduce((total, venda) => total + venda.total, 0)
                                            )}
                                        </td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    <p className="pe-historico-nota">
                        Para prestação de contas, use “Imprimir prestação de contas”. O documento reúne os protocolos e seus itens, com subtotais por venda, total geral e campos para assinatura.
                    </p>
                </section>
            )}

        </div>

    );

}