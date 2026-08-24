import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../../../../config";
import FormularioFiscal from "./formulariofiscal";
import "./fiscalmassa.css";

export default function RegistrarFiscalMassa({
    produtosIniciais = [],
    vendaId = null
}) {
    const [limiteProdutos, setLimiteProdutos] = useState(20);
    const token = localStorage.getItem("token");
    const [idsProdutosCadastrados, setIdsProdutosCadastrados] = useState([]);
    const [verificandoCadastros, setVerificandoCadastros] = useState(true);
    const [produtos, setProdutos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    // ============================================================
    // RECEBER PRODUTOS VINDOS DA EMISSÃO NFC-e
    // ============================================================

    useEffect(() => {

        if (
            !Array.isArray(produtosIniciais) ||
            produtosIniciais.length === 0 ||
            produtos.length === 0
        ) {
            return;
        }

        console.log(
            "[RegistrarFiscalMassa] Produtos recebidos da NFC-e:",
            produtosIniciais
        );

        console.log(
            "[RegistrarFiscalMassa] Venda pendente:",
            vendaId
        );

        const idsRecebidos = produtosIniciais
            .map(item =>
                Number(
                    item?.produto_id ??
                    item?.id
                )
            )
            .filter(id =>
                Number.isFinite(id) &&
                id > 0
            );

        console.log(
            "[RegistrarFiscalMassa] IDs que precisam ser marcados:",
            idsRecebidos
        );

        if (idsRecebidos.length === 0) {
            return;
        }

        const encontrados = produtos.filter(produto =>
            idsRecebidos.includes(
                Number(produto.id)
            )
        );

        console.log(
            "[RegistrarFiscalMassa] Produtos encontrados:",
            encontrados
        );

        if (encontrados.length === 0) {

            console.error(
                "[RegistrarFiscalMassa] Nenhum ID recebido foi encontrado na lista de produtos."
            );

            return;
        }

        /*
         * Coloca os produtos vindos da NFC-e no começo da lista.
         * Assim eles ficam visíveis mesmo que originalmente estejam
         * depois dos primeiros 20.
         */


        /*
         * Marca automaticamente SOMENTE os produtos
         * que vieram do erro da NFC-e.
         */
        setSelecionados(encontrados);

        /*
         * Garante que todos os produtos recebidos
         * estejam dentro da quantidade visível.
         */
        setLimiteProdutos(anterior =>
            Math.max(
                anterior,
                encontrados.length,
                20
            )
        );

        setResultadosIa([]);
        setJsonTexto("");
        setErroJson("");
        setProdutoConferindo(null);
        setCopiado(false);

        console.log(
            "[RegistrarFiscalMassa] MARCADOS AUTOMATICAMENTE:",
            encontrados.map(item => ({
                id: item.id,
                nome: item.nome
            }))
        );

    }, [
        produtosIniciais,
        vendaId,
        produtos
    ]);




    const [carregandoProdutos, setCarregandoProdutos] = useState(true);
    const [erroProdutos, setErroProdutos] = useState("");

    const [busca, setBusca] = useState("");

    const [configFiscalIa, setConfigFiscalIa] = useState(() => {

        try {

            const salvo = localStorage.getItem(
                "registrar_fiscal_config_ia"
            );

            if (salvo) {
                return JSON.parse(salvo);
            }

        } catch (erro) {

            console.error(
                "[RegistrarFiscalMassa] Erro ao carregar configuração fiscal:",
                erro
            );
        }

        return {
            regime: "",
            origem_padrao: "0 - Nacional",
            uf: "",
            finalidade: "Consumidor final",
            operacao_produto:
                "Mercadoria adquirida de terceiros para revenda",
            permitir_inferencia: "sim"
        };
    });

    const [copiado, setCopiado] = useState(false);

    const [jsonTexto, setJsonTexto] = useState("");
    const [erroJson, setErroJson] = useState("");

    const [resultadosIa, setResultadosIa] = useState([]);

    const [produtoConferindo, setProdutoConferindo] = useState(null);

    const [enviandoTodos, setEnviandoTodos] = useState(false);
    const [progressoEnvio, setProgressoEnvio] = useState({
        atual: 0,
        total: 0
    });

    const MAXIMO_PRODUTOS = 30;
    useEffect(() => {

        try {

            localStorage.setItem(
                "registrar_fiscal_config_ia",
                JSON.stringify(configFiscalIa)
            );

        } catch (erro) {

            console.error(
                "[RegistrarFiscalMassa] Erro ao salvar configuração fiscal:",
                erro
            );
        }

    }, [configFiscalIa]);


    function alterarConfigFiscal(campo, valor) {

        setConfigFiscalIa(anterior => ({
            ...anterior,
            [campo]: valor
        }));
    }

    // ============================================================
    // CAMPOS FISCAIS
    // ============================================================

    const CAMPOS_FISCAIS = [
        {
            campo: "ncm",
            label: "NCM",
            obrigatorio: true
        },
        {
            campo: "cfop",
            label: "CFOP",
            obrigatorio: true
        },
        {
            campo: "origem",
            label: "Origem",
            obrigatorio: true
        },
        {
            campo: "cst_csosn",
            label: "CST / CSOSN",
            obrigatorio: true
        },
        {
            campo: "icms",
            label: "ICMS",
            obrigatorio: true
        },
        {
            campo: "pis",
            label: "PIS",
            obrigatorio: true
        },
        {
            campo: "cofins",
            label: "COFINS",
            obrigatorio: true
        },
        {
            campo: "cest",
            label: "CEST",
            obrigatorio: false
        },
        {
            campo: "cst_ibscbs",
            label: "CST IBS/CBS",
            obrigatorio: false
        },
        {
            campo: "cclass_trib",
            label: "cClassTrib",
            obrigatorio: false
        },
        {
            campo: "aliquota_ibs_uf",
            label: "IBS UF",
            obrigatorio: false
        },
        {
            campo: "aliquota_ibs_mun",
            label: "IBS Município",
            obrigatorio: false
        },
        {
            campo: "aliquota_cbs",
            label: "CBS",
            obrigatorio: false
        }
    ];


    // ============================================================
    // CARREGAR PRODUTOS
    // ============================================================

    useEffect(() => {

        async function carregarProdutos() {

            setCarregandoProdutos(true);
            setErroProdutos("");

            try {

                const resp = await fetch(
                    `${API_URL}/fiscal/produtos-servicos`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const dados = await resp.json();

                console.log(
                    "[RegistrarFiscalMassa] Produtos recebidos:",
                    dados
                );

                if (!resp.ok) {
                    throw new Error(
                        dados.detail ||
                        "Erro ao carregar produtos"
                    );
                }

                if (!Array.isArray(dados)) {
                    throw new Error(
                        "A API de produtos não retornou uma lista"
                    );
                }

                setProdutos(dados);

            } catch (erro) {

                console.error(
                    "[RegistrarFiscalMassa] Erro produtos:",
                    erro
                );

                setErroProdutos(
                    erro.message ||
                    "Erro ao carregar produtos"
                );

            } finally {

                setCarregandoProdutos(false);
            }
        }

        carregarProdutos();

    }, [token]);


    useEffect(() => {

        async function carregarCadastrosExistentes() {

            setVerificandoCadastros(true);

            try {

                const resp = await fetch(
                    `${API_URL}/fiscal/registrados?tipo=produto`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const dados = await resp.json();

                if (!resp.ok) {

                    throw new Error(
                        dados.detail ||
                        "Erro ao carregar produtos já cadastrados"
                    );
                }

                if (!Array.isArray(dados)) {

                    throw new Error(
                        "A API de produtos cadastrados não retornou uma lista"
                    );
                }

                const ids = dados
                    .map(item => Number(item.produto_id))
                    .filter(id => Number.isFinite(id));

                console.log(
                    "[RegistrarFiscalMassa] IDs já cadastrados:",
                    ids
                );

                setIdsProdutosCadastrados(ids);

            } catch (erro) {

                console.error(
                    "[RegistrarFiscalMassa] Erro ao carregar cadastros existentes:",
                    erro
                );

                setIdsProdutosCadastrados([]);

            } finally {

                setVerificandoCadastros(false);
            }
        }

        carregarCadastrosExistentes();

    }, [token]);


    // ============================================================
    // PRODUTOS FILTRADOS
    // ============================================================

    const produtosFiltrados = useMemo(() => {

        const texto = busca
            .trim()
            .toLowerCase();

        return produtos.filter(produto => {

            const jaCadastrado =
                idsProdutosCadastrados.includes(
                    Number(produto.id)
                );

            if (jaCadastrado) {
                return false;
            }

            if (!texto) {
                return true;
            }

            const nome = String(
                produto.nome || ""
            ).toLowerCase();

            const codigo = String(
                produto.codigo_barras || ""
            ).toLowerCase();

            return (
                nome.includes(texto) ||
                codigo.includes(texto)
            );
        });

    }, [
        produtos,
        busca,
        idsProdutosCadastrados
    ]);

    const produtosVisiveis = useMemo(() => {

        const idsSelecionados = new Set(
            selecionados.map(item => Number(item.id))
        );

        const selecionadosPrimeiro = produtosFiltrados.filter(
            produto => idsSelecionados.has(Number(produto.id))
        );

        const restantes = produtosFiltrados.filter(
            produto => !idsSelecionados.has(Number(produto.id))
        );

        return [
            ...selecionadosPrimeiro,
            ...restantes
        ].slice(0, limiteProdutos);

    }, [
        produtosFiltrados,
        limiteProdutos,
        selecionados
    ]);

    // ============================================================
    // VERIFICAR SE ESTÁ SELECIONADO
    // ============================================================

    function estaSelecionado(produtoId) {

        return selecionados.some(
            item => Number(item.id) === Number(produtoId)
        );
    }


    // ============================================================
    // SELECIONAR PRODUTO
    // ============================================================

    function alternarProduto(produto) {

        const existe = estaSelecionado(produto.id);

        if (existe) {

            setSelecionados(anterior =>
                anterior.filter(
                    item =>
                        Number(item.id) !==
                        Number(produto.id)
                )
            );

            return;
        }

        if (selecionados.length >= MAXIMO_PRODUTOS) {

            alert(
                `Você pode selecionar no máximo ${MAXIMO_PRODUTOS} produtos.`
            );

            return;
        }

        setSelecionados(anterior => [
            ...anterior,
            produto
        ]);
    }


    // ============================================================
    // SELECIONAR VISÍVEIS
    // ============================================================

    function selecionarVisiveis() {

        const novos = [...selecionados];

        for (const produto of produtosFiltrados) {

            if (novos.length >= MAXIMO_PRODUTOS) {
                break;
            }

            const existe = novos.some(
                item =>
                    Number(item.id) ===
                    Number(produto.id)
            );

            if (!existe) {
                novos.push(produto);
            }
        }

        setSelecionados(novos);
    }


    // ============================================================
    // LIMPAR SELEÇÃO
    // ============================================================

    function limparSelecao() {

        setSelecionados([]);
        setResultadosIa([]);
        setJsonTexto("");
        setErroJson("");
        setProdutoConferindo(null);
        setCopiado(false);
    }


    // ============================================================
    // PEGAR DADO DO COMÉRCIO
    // ============================================================


    // ============================================================
    // GERAR PROMPT PARA IA
    // ============================================================

    function montarPromptIa() {

        if (selecionados.length === 0) {
            return "";
        }

        const produtosTexto = selecionados
            .map((produto, index) => {

                return `
============================================================
PRODUTO ${index + 1}
============================================================

produto_id:
${produto.id}

Nome:
${produto.nome || "Não informado"}

Tipo:
PRODUTO

Código de barras:
${produto.codigo_barras || "Não informado"}

Peso:
${produto.peso ?? "Não informado"}

Unidade:
${produto.unidade || "Não informada"}

Quantidade/unidades:
${produto.unidades ?? "Não informado"}
`.trim();

            })
            .join("\n\n");


        const regraInferencia =
            configFiscalIa.permitir_inferencia === "sim"
                ? `
Quando faltarem características específicas de um produto, utilize a classificação fiscal mais provável considerando o nome do produto e o contexto do comércio.

Não deixe um campo vazio apenas porque existem várias possibilidades quando houver uma opção claramente mais provável.
`.trim()
                : `
Quando não houver informação suficiente para determinar um campo fiscal com segurança, retorne null nesse campo.
`.trim();


        return `
Você é um especialista brasileiro em classificação fiscal de mercadorias, NFC-e, NF-e, ICMS, PIS, COFINS, NCM, CEST, CFOP e na tributação IBS/CBS da reforma tributária brasileira.

Preciso preencher o cadastro fiscal de vários produtos de um comércio.

Analise TODOS os produtos informados abaixo.

============================================================
DADOS DO COMÉRCIO
============================================================

Regime tributário:
${configFiscalIa.regime || "Não informado"}

UF do estabelecimento:
${configFiscalIa.uf || "Não informada"}

Origem padrão das mercadorias:
${configFiscalIa.origem_padrao || "Não informada"}

Finalidade normal das vendas:
${configFiscalIa.finalidade || "Não informada"}

Operação normal dos produtos:
${configFiscalIa.operacao_produto || "Não informada"}


============================================================
REGRAS DE ANÁLISE
============================================================

${regraInferencia}

Analise cada produto individualmente.

Não misture informações entre produtos.

O produto_id recebido deve ser devolvido exatamente como foi informado.

NCM deve possuir exatamente 8 dígitos.

CFOP deve ser compatível com a operação informada.

Considere o regime tributário informado pelo comércio.

Considere a finalidade normal das vendas informada pelo comércio.

Para campos percentuais, retorne somente números.

Quando CEST realmente não for aplicável, retorne null.

Para IBS/CBS, utilize a classificação mais adequada considerando as regras vigentes e o produto informado.


============================================================
PRODUTOS
============================================================

${produtosTexto}


============================================================
FORMATO OBRIGATÓRIO DA RESPOSTA
============================================================

Retorne EXCLUSIVAMENTE JSON válido.

Não escreva explicações.

Não utilize markdown.

Não coloque o JSON dentro de blocos de código.

Não escreva texto antes ou depois do JSON.

A resposta deve seguir exatamente esta estrutura:

{
    "produtos": [
        {
            "produto_id": 1,
            "nome": "Nome do produto",
            "ncm": "00000000",
            "cfop": "5102",
            "origem": "0",
            "cst_csosn": "102",
            "icms": 0,
            "pis": 0,
            "cofins": 0,
            "cest": null,
            "cst_ibscbs": "",
            "cclass_trib": "",
            "aliquota_ibs_uf": 0,
            "aliquota_ibs_mun": 0,
            "aliquota_cbs": 0
        }
    ]
}

IMPORTANTE:

A propriedade "produtos" deve possuir exatamente ${selecionados.length} produtos.

Os produto_id devem corresponder exatamente aos IDs recebidos.

Não invente produto_id.

Não omita nenhum produto.
`.trim();
    }


    // ============================================================
    // COPIAR PERGUNTA PARA IA
    // ============================================================

    async function copiarPrompt() {

        if (selecionados.length === 0) {

            alert("Selecione pelo menos um produto.");

            return;
        }

        const prompt = montarPromptIa();

        console.log(
            "[RegistrarFiscalMassa] Prompt que será copiado:",
            prompt
        );

        try {

            await navigator.clipboard.writeText(prompt);

            setCopiado(true);

            setTimeout(() => {
                setCopiado(false);
            }, 2500);

        } catch (erro) {

            console.error(
                "[RegistrarFiscalMassa] Erro ao copiar pergunta:",
                erro
            );

            alert(
                "Não foi possível copiar a pergunta automaticamente."
            );
        }
    }

    // ============================================================
    // LIMPAR JSON DE MARKDOWN
    // ============================================================

    function limparJsonRecebido(texto) {

        let limpo = String(texto || "").trim();

        if (limpo.startsWith("```json")) {
            limpo = limpo.substring(7);
        } else if (limpo.startsWith("```")) {
            limpo = limpo.substring(3);
        }

        if (limpo.endsWith("```")) {
            limpo = limpo.substring(
                0,
                limpo.length - 3
            );
        }

        return limpo.trim();
    }


    // ============================================================
    // NORMALIZAR ITEM DA IA
    // ============================================================

    function normalizarItemIa(item) {

        return {
            produto_id:
                Number(item.produto_id),

            nome:
                item.nome ?? "",

            ncm:
                item.ncm ?? "",

            cfop:
                item.cfop ?? "",

            origem:
                item.origem ?? "",

            cst_csosn:
                item.cst_csosn ?? "",

            icms:
                item.icms ?? "",

            pis:
                item.pis ?? "",

            cofins:
                item.cofins ?? "",

            cest:
                item.cest ?? "",

            cst_ibscbs:
                item.cst_ibscbs ?? "",

            cclass_trib:
                item.cclass_trib ?? "",

            aliquota_ibs_uf:
                item.aliquota_ibs_uf ?? "",

            aliquota_ibs_mun:
                item.aliquota_ibs_mun ?? "",

            aliquota_cbs:
                item.aliquota_cbs ?? ""
        };
    }


    // ============================================================
    // PROCESSAR JSON
    // ============================================================

    function processarJson() {

        setErroJson("");
        setProdutoConferindo(null);

        if (!jsonTexto.trim()) {

            setErroJson(
                "Cole primeiro o JSON retornado pela IA."
            );

            return;
        }

        try {

            const textoLimpo =
                limparJsonRecebido(jsonTexto);

            const json =
                JSON.parse(textoLimpo);

            let produtosIa = [];

            if (Array.isArray(json)) {

                produtosIa = json;

            } else if (
                json &&
                Array.isArray(json.produtos)
            ) {

                produtosIa = json.produtos;

            } else {

                throw new Error(
                    'O JSON precisa possuir a propriedade "produtos".'
                );
            }


            const idsSelecionados =
                selecionados.map(
                    produto => Number(produto.id)
                );


            const idsRecebidos =
                produtosIa.map(
                    item => Number(item.produto_id)
                );


            const duplicados =
                idsRecebidos.filter(
                    (id, index) =>
                        idsRecebidos.indexOf(id) !== index
                );


            if (duplicados.length > 0) {

                throw new Error(
                    `Existem produto_id duplicados no JSON: ${[
                        ...new Set(duplicados)
                    ].join(", ")}`
                );
            }


            const desconhecidos =
                idsRecebidos.filter(
                    id =>
                        !idsSelecionados.includes(id)
                );


            if (desconhecidos.length > 0) {

                throw new Error(
                    `A IA retornou produto_id que não estavam selecionados: ${desconhecidos.join(", ")}`
                );
            }


            const resultados =
                selecionados.map(produto => {

                    const encontrado =
                        produtosIa.find(
                            item =>
                                Number(item.produto_id) ===
                                Number(produto.id)
                        );

                    if (!encontrado) {

                        return {
                            produto,
                            dadosIa: null,
                            status: "sem_retorno",
                            erro:
                                "A IA não retornou este produto."
                        };
                    }

                    return {
                        produto,
                        dadosIa:
                            normalizarItemIa(encontrado),
                        status: "pronto",
                        erro: ""
                    };
                });


            console.log(
                "[RegistrarFiscalMassa] Resultados processados:",
                resultados
            );

            setResultadosIa(resultados);

        } catch (erro) {

            console.error(
                "[RegistrarFiscalMassa] JSON inválido:",
                erro
            );

            setResultadosIa([]);

            setErroJson(
                erro.message ||
                "JSON inválido."
            );
        }
    }


    // ============================================================
    // VERIFICAR VALOR VAZIO
    // ============================================================

    function valorVazio(valor) {

        return (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === ""
        );
    }


    // ============================================================
    // CAMPOS FALTANDO
    // ============================================================

    function camposFaltando(itemResultado) {

        if (!itemResultado?.dadosIa) {

            return CAMPOS_FISCAIS
                .filter(campo => campo.obrigatorio)
                .map(campo => campo.label);
        }

        return CAMPOS_FISCAIS
            .filter(campo => {

                if (!campo.obrigatorio) {
                    return false;
                }

                return valorVazio(
                    itemResultado.dadosIa[campo.campo]
                );
            })
            .map(campo => campo.label);
    }


    // ============================================================
    // CAMPOS OPCIONAIS VAZIOS
    // ============================================================

    function camposOpcionaisVazios(itemResultado) {

        if (!itemResultado?.dadosIa) {
            return [];
        }

        return CAMPOS_FISCAIS
            .filter(campo => {

                if (campo.obrigatorio) {
                    return false;
                }

                return valorVazio(
                    itemResultado.dadosIa[campo.campo]
                );
            })
            .map(campo => campo.label);
    }


    // ============================================================
    // STATUS DO PRODUTO
    // ============================================================

    function obterStatusVisual(item) {

        if (item.status === "enviando") {

            return {
                texto: "Enviando",
                classe:
                    "registrar-massa-status-enviando"
            };
        }

        if (item.status === "registrado") {

            return {
                texto: "Registrado",
                classe:
                    "registrar-massa-status-registrado"
            };
        }

        if (item.status === "erro") {

            return {
                texto: "Erro",
                classe:
                    "registrar-massa-status-erro"
            };
        }

        if (item.status === "sem_retorno") {

            return {
                texto: "Sem retorno",
                classe:
                    "registrar-massa-status-incompleto"
            };
        }

        const faltando =
            camposFaltando(item);

        if (faltando.length > 0) {

            return {
                texto: "Incompleto",
                classe:
                    "registrar-massa-status-incompleto"
            };
        }

        return {
            texto: "Pronto",
            classe:
                "registrar-massa-status-pronto"
        };
    }


    // ============================================================
    // ABRIR CONFERÊNCIA
    // ============================================================

    function abrirConferencia(item) {

        if (!item.dadosIa) {

            alert(
                "Este produto não possui dados retornados pela IA."
            );

            return;
        }

        setProdutoConferindo(item);

        setTimeout(() => {

            const elemento =
                document.getElementById(
                    "registrar-massa-conferencia"
                );

            if (elemento) {

                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }, 100);
    }


    // ============================================================
    // VERIFICAR SE PRODUTO JÁ POSSUI CADASTRO
    // ============================================================

    async function verificarCadastroExistente(produtoId) {

        try {

            const resp = await fetch(
                `${API_URL}/fiscal/dados/${produtoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (resp.status === 404) {
                return false;
            }

            if (!resp.ok) {

                const json = await resp.json().catch(
                    () => ({})
                );

                throw new Error(
                    json.detail ||
                    `Erro ao verificar produto ${produtoId}`
                );
            }

            return true;

        } catch (erro) {

            console.error(
                "[RegistrarFiscalMassa] Erro verificando cadastro:",
                erro
            );

            throw erro;
        }
    }


    // ============================================================
    // NORMALIZAR DADOS PARA API
    // ============================================================

    function prepararDadosApi(item) {

        const dados = {
            tipo: "produto",

            produto_id:
                Number(item.produto.id),

            ncm:
                item.dadosIa.ncm || null,

            cfop:
                item.dadosIa.cfop || null,

            origem:
                item.dadosIa.origem || null,

            cst_csosn:
                item.dadosIa.cst_csosn || null,

            icms:
                item.dadosIa.icms === ""
                    ? null
                    : Number(item.dadosIa.icms),

            pis:
                item.dadosIa.pis === ""
                    ? null
                    : Number(item.dadosIa.pis),

            cofins:
                item.dadosIa.cofins === ""
                    ? null
                    : Number(item.dadosIa.cofins),

            cest:
                item.dadosIa.cest || null,

            cst_ibscbs:
                item.dadosIa.cst_ibscbs || null,

            cclass_trib:
                item.dadosIa.cclass_trib || null,

            aliquota_ibs_uf:
                item.dadosIa.aliquota_ibs_uf === ""
                    ? null
                    : Number(
                        item.dadosIa.aliquota_ibs_uf
                    ),

            aliquota_ibs_mun:
                item.dadosIa.aliquota_ibs_mun === ""
                    ? null
                    : Number(
                        item.dadosIa.aliquota_ibs_mun
                    ),

            aliquota_cbs:
                item.dadosIa.aliquota_cbs === ""
                    ? null
                    : Number(
                        item.dadosIa.aliquota_cbs
                    ),

            codigo_servico: null,
            aliquota_iss: null,
            municipio: null
        };


        Object.keys(dados).forEach(chave => {

            if (
                typeof dados[chave] === "number" &&
                Number.isNaN(dados[chave])
            ) {
                dados[chave] = null;
            }
        });


        return dados;
    }


    // ============================================================
    // ALTERAR STATUS DE UM RESULTADO
    // ============================================================

    function atualizarResultado(
        produtoId,
        alteracoes
    ) {

        setResultadosIa(anterior =>
            anterior.map(item => {

                if (
                    Number(item.produto.id) !==
                    Number(produtoId)
                ) {
                    return item;
                }

                return {
                    ...item,
                    ...alteracoes
                };
            })
        );
    }


    // ============================================================
    // ENVIAR UM PRODUTO
    // ============================================================

    async function enviarProduto(item) {

        const produtoId =
            Number(item.produto.id);

        atualizarResultado(
            produtoId,
            {
                status: "enviando",
                erro: ""
            }
        );


        try {

            if (!item.dadosIa) {

                throw new Error(
                    "Produto sem dados da IA."
                );
            }


            const faltando =
                camposFaltando(item);

            if (faltando.length > 0) {

                throw new Error(
                    `Campos obrigatórios faltando: ${faltando.join(", ")}`
                );
            }


            const existe =
                await verificarCadastroExistente(
                    produtoId
                );


            const dados =
                prepararDadosApi(item);


            const url = existe
                ? `${API_URL}/fiscal/atualizar/${produtoId}`
                : `${API_URL}/fiscal/registrar`;


            const method = existe
                ? "PUT"
                : "POST";


            console.log(
                `[RegistrarFiscalMassa] ${method} produto ${produtoId}:`,
                dados
            );


            const resp = await fetch(
                url,
                {
                    method,
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },
                    body:
                        JSON.stringify(dados)
                }
            );


            const json =
                await resp.json().catch(
                    () => ({})
                );


            if (!resp.ok) {

                throw new Error(
                    json.detail ||
                    `Erro HTTP ${resp.status}`
                );
            }


            atualizarResultado(
                produtoId,
                {
                    status: "registrado",
                    erro: ""
                }
            );


            return {
                sucesso: true,
                produtoId
            };

        } catch (erro) {

            console.error(
                `[RegistrarFiscalMassa] Erro produto ${produtoId}:`,
                erro
            );


            atualizarResultado(
                produtoId,
                {
                    status: "erro",
                    erro:
                        erro.message ||
                        "Erro desconhecido"
                }
            );


            return {
                sucesso: false,
                produtoId,
                erro:
                    erro.message ||
                    "Erro desconhecido"
            };
        }
    }


    // ============================================================
    // ENVIAR TODOS
    // ============================================================

    async function enviarTodos() {

        if (enviandoTodos) {
            return;
        }


        if (resultadosIa.length === 0) {

            alert(
                "Primeiro processe o JSON retornado pela IA."
            );

            return;
        }


        const pendentes =
            resultadosIa.filter(item =>
                item.status !== "registrado"
            );


        if (pendentes.length === 0) {

            alert(
                "Todos os produtos já foram registrados."
            );

            return;
        }


        setEnviandoTodos(true);

        setProgressoEnvio({
            atual: 0,
            total: pendentes.length
        });


        let atual = 0;


        for (const item of pendentes) {

            atual += 1;

            setProgressoEnvio({
                atual,
                total: pendentes.length
            });


            await enviarProduto(item);
        }


        setEnviandoTodos(false);

        console.log(
            "[RegistrarFiscalMassa] Envio em massa finalizado."
        );
    }


    // ============================================================
    // CONTADORES
    // ============================================================

    const quantidadeRegistrados =
        resultadosIa.filter(
            item => item.status === "registrado"
        ).length;


    const quantidadeErros =
        resultadosIa.filter(
            item => item.status === "erro"
        ).length;


    const quantidadeIncompletos =
        resultadosIa.filter(
            item =>
                item.status === "sem_retorno" ||
                camposFaltando(item).length > 0
        ).length;


    // ============================================================
    // RETURN
    // ============================================================

    return (

        <div className="registrar-massa-container">


            {/* ====================================================
                CABEÇALHO
            ==================================================== */}

            <div className="registrar-massa-cabecalho">

                <div>

                    <span className="registrar-massa-etiqueta">
                        CADASTRO EM MASSA
                    </span>

                    <h4>
                        Registrar produtos com IA
                    </h4>

                    <p>
                        Informe os dados da loja, selecione até 30 produtos,
                        copie a pergunta para a IA e cole a resposta
                        para registrar os dados fiscais.
                    </p>

                </div>

                <div className="registrar-massa-contador">

                    <strong>
                        {selecionados.length}
                    </strong>

                    <span>
                        / {MAXIMO_PRODUTOS}
                    </span>

                </div>

            </div>
            {/* ====================================================
    CONFIGURAÇÃO FISCAL PARA IA
==================================================== */}

            <section className="registrar-massa-secao registrar-massa-configuracao-ia">

                <div className="registrar-massa-secao-topo">

                    <div>
                        <h5>
                            1. Informações da loja
                        </h5>

                        <p>
                            Responda estas informações para a IA classificar
                            corretamente os produtos.
                        </p>
                    </div>

                </div>

                <div className="registrar-massa-config-grid">

                    <label className="registrar-massa-config-campo">

                        <span>
                            Regime tributário
                        </span>

                        <select
                            value={configFiscalIa.regime}
                            onChange={e =>
                                alterarConfigFiscal(
                                    "regime",
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Selecione
                            </option>

                            <option value="Simples Nacional">
                                Simples Nacional
                            </option>

                            <option value="Lucro Presumido">
                                Lucro Presumido
                            </option>

                            <option value="Lucro Real">
                                Lucro Real
                            </option>

                            <option value="MEI">
                                MEI
                            </option>

                        </select>

                    </label>


                    <label className="registrar-massa-config-campo">

                        <span>
                            UF do estabelecimento
                        </span>

                        <select
                            value={configFiscalIa.uf}
                            onChange={e =>
                                alterarConfigFiscal(
                                    "uf",
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Selecione
                            </option>

                            <option value="AC">AC</option>
                            <option value="AL">AL</option>
                            <option value="AP">AP</option>
                            <option value="AM">AM</option>
                            <option value="BA">BA</option>
                            <option value="CE">CE</option>
                            <option value="DF">DF</option>
                            <option value="ES">ES</option>
                            <option value="GO">GO</option>
                            <option value="MA">MA</option>
                            <option value="MT">MT</option>
                            <option value="MS">MS</option>
                            <option value="MG">MG</option>
                            <option value="PA">PA</option>
                            <option value="PB">PB</option>
                            <option value="PR">PR</option>
                            <option value="PE">PE</option>
                            <option value="PI">PI</option>
                            <option value="RJ">RJ</option>
                            <option value="RN">RN</option>
                            <option value="RS">RS</option>
                            <option value="RO">RO</option>
                            <option value="RR">RR</option>
                            <option value="SC">SC</option>
                            <option value="SP">SP</option>
                            <option value="SE">SE</option>
                            <option value="TO">TO</option>

                        </select>

                    </label>


                    <label className="registrar-massa-config-campo">

                        <span>
                            Origem padrão das mercadorias
                        </span>

                        <select
                            value={configFiscalIa.origem_padrao}
                            onChange={e =>
                                alterarConfigFiscal(
                                    "origem_padrao",
                                    e.target.value
                                )
                            }
                        >

                            <option value="0 - Nacional">
                                0 - Nacional
                            </option>

                            <option value="1 - Estrangeira - Importação direta">
                                1 - Estrangeira, importação direta
                            </option>

                            <option value="2 - Estrangeira - Adquirida no mercado interno">
                                2 - Estrangeira, adquirida no mercado interno
                            </option>

                        </select>

                    </label>


                    <label className="registrar-massa-config-campo">

                        <span>
                            Finalidade normal das vendas
                        </span>

                        <select
                            value={configFiscalIa.finalidade}
                            onChange={e =>
                                alterarConfigFiscal(
                                    "finalidade",
                                    e.target.value
                                )
                            }
                        >

                            <option value="Consumidor final">
                                Consumidor final
                            </option>

                            <option value="Revenda">
                                Revenda
                            </option>

                            <option value="Industrialização">
                                Industrialização
                            </option>

                        </select>

                    </label>


                    <label className="registrar-massa-config-campo registrar-massa-config-campo-largo">

                        <span>
                            Operação normal dos produtos
                        </span>

                        <select
                            value={configFiscalIa.operacao_produto}
                            onChange={e =>
                                alterarConfigFiscal(
                                    "operacao_produto",
                                    e.target.value
                                )
                            }
                        >

                            <option value="Mercadoria adquirida de terceiros para revenda">
                                Mercadoria adquirida de terceiros para revenda
                            </option>

                            <option value="Mercadoria de produção própria">
                                Mercadoria de produção própria
                            </option>

                        </select>

                    </label>


                    <label className="registrar-massa-config-campo registrar-massa-config-campo-largo">

                        <span>
                            Quando faltarem informações do produto
                        </span>

                        <select
                            value={configFiscalIa.permitir_inferencia}
                            onChange={e =>
                                alterarConfigFiscal(
                                    "permitir_inferencia",
                                    e.target.value
                                )
                            }
                        >

                            <option value="sim">
                                Usar a classificação fiscal mais provável
                            </option>

                            <option value="nao">
                                Não inferir, deixar como não informado
                            </option>

                        </select>

                    </label>

                </div>

            </section>

            {/* ====================================================
                SELEÇÃO
            ==================================================== */}

            <section className="registrar-massa-secao">

                <div className="registrar-massa-secao-topo">

                    <div>

                        <h5>
                            2. Selecione os produtos                        </h5>

                        <p>
                            Escolha os produtos que serão
                            enviados para análise.
                        </p>

                    </div>

                    <div className="registrar-massa-acoes-selecao">

                        <button
                            type="button"
                            className="registrar-massa-botao-secundario"
                            onClick={selecionarVisiveis}
                        >
                            Selecionar visíveis
                        </button>

                        <button
                            type="button"
                            className="registrar-massa-botao-limpar"
                            onClick={limparSelecao}
                        >
                            Limpar
                        </button>

                    </div>

                </div>


                <div className="registrar-massa-busca-area">

                    <input
                        type="text"
                        className="registrar-massa-busca"
                        placeholder="Buscar produto ou código de barras..."
                        value={busca}
                        onChange={e => {
                            setBusca(e.target.value);
                            setLimiteProdutos(20);
                        }}
                    />

                </div>


                {(carregandoProdutos || verificandoCadastros) && (
                    <div className="registrar-massa-carregando">
                        {carregandoProdutos
                            ? "Carregando produtos..."
                            : "Verificando produtos já cadastrados..."
                        }
                    </div>
                )}


                {erroProdutos && (

                    <div className="registrar-massa-erro">
                        {erroProdutos}
                    </div>

                )}


                {!carregandoProdutos && (

                    <div className="registrar-massa-produtos">

                        {!carregandoProdutos && !verificandoCadastros && (
                            <>
                                <div className="registrar-massa-produtos">

                                    {produtosVisiveis.map(produto => {

                                        const marcado =
                                            estaSelecionado(produto.id);

                                        return (
                                            <button
                                                key={produto.id}
                                                type="button"
                                                className={
                                                    marcado
                                                        ? "registrar-massa-produto registrar-massa-produto-selecionado"
                                                        : "registrar-massa-produto"
                                                }
                                                onClick={() =>
                                                    alternarProduto(produto)
                                                }
                                            >
                                                <div className="registrar-massa-produto-check">
                                                    {marcado ? "✓" : ""}
                                                </div>

                                                <div className="registrar-massa-produto-info">
                                                    <strong>
                                                        {produto.nome}
                                                    </strong>

                                                    <span>
                                                        ID {produto.id}

                                                        {produto.codigo_barras
                                                            ? ` • ${produto.codigo_barras}`
                                                            : ""
                                                        }
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}

                                </div>

                                {produtosVisiveis.length === 0 && (
                                    <div className="registrar-massa-carregando">
                                        Nenhum produto pendente de cadastro fiscal.
                                    </div>
                                )}

                                {limiteProdutos < produtosFiltrados.length && (
                                    <button
                                        type="button"
                                        className="registrar-massa-carregar-mais-produtos"
                                        onClick={() =>
                                            setLimiteProdutos(
                                                anterior => anterior + 20
                                            )
                                        }
                                    >
                                        Carregar mais 20
                                    </button>
                                )}
                            </>
                        )}

                    </div>

                )}

            </section>


            {/* ====================================================
    COPIAR PERGUNTA
==================================================== */}

            <section className="registrar-massa-secao">

                <div className="registrar-massa-secao-topo">

                    <div>

                        <h5>
                            3. Copie a pergunta para a IA
                        </h5>

                        <p>
                            A pergunta será montada automaticamente com as
                            informações da loja e os produtos selecionados.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="registrar-massa-botao-principal"
                    onClick={copiarPrompt}
                    disabled={
                        selecionados.length === 0
                    }
                >
                    {copiado
                        ? "Pergunta copiada"
                        : `Copiar pergunta de ${selecionados.length} produto(s)`
                    }
                </button>

            </section>

            {/* ====================================================
                JSON
            ==================================================== */}

            <section className="registrar-massa-secao">

                <div className="registrar-massa-secao-topo">

                    <div>

                        <h5>
                            4. Cole a resposta da IA                        </h5>

                        <p>
                            Cole aqui o JSON completo retornado
                            pela inteligência artificial.
                        </p>

                    </div>

                </div>


                <textarea
                    className="registrar-massa-json"
                    placeholder={`{
    "produtos": [
        {
            "produto_id": 1,
            "ncm": "00000000",
            "cfop": "5102"
        }
    ]
}`}
                    value={jsonTexto}
                    onChange={e =>
                        setJsonTexto(e.target.value)
                    }
                />


                {erroJson && (

                    <div className="registrar-massa-erro">
                        {erroJson}
                    </div>

                )}


                <button
                    type="button"
                    className="registrar-massa-botao-principal"
                    onClick={processarJson}
                    disabled={!jsonTexto.trim()}
                >
                    Processar JSON
                </button>

            </section>


            {/* ====================================================
                RESULTADOS
            ==================================================== */}

            {resultadosIa.length > 0 && (

                <section className="registrar-massa-secao">

                    <div className="registrar-massa-secao-topo">

                        <div>

                            <h5>
                                5. Confira os produtos                            </h5>

                            <p>
                                Verifique os campos encontrados
                                antes de registrar.
                            </p>

                        </div>

                    </div>


                    <div className="registrar-massa-resumo">

                        <div>
                            <strong>
                                {resultadosIa.length}
                            </strong>
                            <span>
                                Produtos
                            </span>
                        </div>

                        <div>
                            <strong>
                                {quantidadeRegistrados}
                            </strong>
                            <span>
                                Registrados
                            </span>
                        </div>

                        <div>
                            <strong>
                                {quantidadeIncompletos}
                            </strong>
                            <span>
                                Incompletos
                            </span>
                        </div>

                        <div>
                            <strong>
                                {quantidadeErros}
                            </strong>
                            <span>
                                Erros
                            </span>
                        </div>

                    </div>


                    <div className="registrar-massa-resultados">

                        {resultadosIa.map(item => {

                            const status =
                                obterStatusVisual(item);

                            const faltando =
                                camposFaltando(item);

                            const opcionais =
                                camposOpcionaisVazios(
                                    item
                                );

                            return (

                                <div
                                    key={item.produto.id}
                                    className="registrar-massa-resultado"
                                >

                                    <div className="registrar-massa-resultado-topo">

                                        <div>

                                            <strong>
                                                {item.produto.nome}
                                            </strong>

                                            <span>
                                                Produto #{item.produto.id}
                                            </span>

                                        </div>

                                        <span
                                            className={
                                                `registrar-massa-status ${status.classe}`
                                            }
                                        >
                                            {status.texto}
                                        </span>

                                    </div>


                                    {item.dadosIa && (

                                        <div className="registrar-massa-campos">

                                            {CAMPOS_FISCAIS.map(
                                                campo => {

                                                    const valor =
                                                        item.dadosIa[
                                                        campo.campo
                                                        ];

                                                    const vazio =
                                                        valorVazio(
                                                            valor
                                                        );

                                                    return (

                                                        <div
                                                            key={campo.campo}
                                                            className={
                                                                vazio
                                                                    ? "registrar-massa-campo registrar-massa-campo-vazio"
                                                                    : "registrar-massa-campo registrar-massa-campo-ok"
                                                            }
                                                        >

                                                            <span>
                                                                {campo.label}
                                                            </span>

                                                            <strong>
                                                                {vazio
                                                                    ? "Faltando"
                                                                    : String(valor)
                                                                }
                                                            </strong>

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>

                                    )}


                                    {faltando.length > 0 && (

                                        <div className="registrar-massa-aviso-faltando">

                                            <strong>
                                                Campos obrigatórios faltando:
                                            </strong>

                                            <span>
                                                {faltando.join(", ")}
                                            </span>

                                        </div>

                                    )}


                                    {opcionais.length > 0 && (

                                        <div className="registrar-massa-aviso-opcional">

                                            <strong>
                                                Campos opcionais vazios:
                                            </strong>

                                            <span>
                                                {opcionais.join(", ")}
                                            </span>

                                        </div>

                                    )}


                                    {item.erro && (

                                        <div className="registrar-massa-erro-item">
                                            {item.erro}
                                        </div>

                                    )}


                                    <div className="registrar-massa-resultado-acoes">

                                        <button
                                            type="button"
                                            className="registrar-massa-botao-ver"
                                            onClick={() =>
                                                abrirConferencia(
                                                    item
                                                )
                                            }
                                            disabled={
                                                !item.dadosIa ||
                                                item.status === "enviando"
                                            }
                                        >
                                            Ver / Conferir
                                        </button>


                                        <button
                                            type="button"
                                            className="registrar-massa-botao-individual"
                                            disabled={
                                                enviandoTodos ||
                                                item.status === "enviando" ||
                                                item.status === "registrado" ||
                                                !item.dadosIa
                                            }
                                            onClick={() =>
                                                enviarProduto(
                                                    item
                                                )
                                            }
                                        >
                                            {item.status === "registrado"
                                                ? "Registrado"
                                                : item.status === "enviando"
                                                    ? "Enviando..."
                                                    : "Enviar este"
                                            }
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </section>

            )}


            {/* ====================================================
                FORMULÁRIO PARA CONFERÊNCIA
            ==================================================== */}

            {produtoConferindo && (

                <section
                    id="registrar-massa-conferencia"
                    className="registrar-massa-conferencia"
                >

                    <div className="registrar-massa-conferencia-topo">

                        <div>

                            <span>
                                CONFERÊNCIA
                            </span>

                            <h5>
                                {produtoConferindo.produto.nome}
                            </h5>

                        </div>

                        <button
                            type="button"
                            className="registrar-massa-fechar"
                            onClick={() =>
                                setProdutoConferindo(
                                    null
                                )
                            }
                        >
                            Fechar
                        </button>

                    </div>


                    <FormularioFiscal
                        key={produtoConferindo.produto.id}
                        tipo="produto"
                        produto={produtoConferindo.produto}
                        dadosIa={produtoConferindo.dadosIa}
                        modo="novo"
                        onSalvo={() => {
                            atualizarResultado(
                                produtoConferindo.produto.id,
                                {
                                    status: "registrado",
                                    erro: ""
                                }
                            );

                            setProdutoConferindo(null);
                        }}
                    />

                </section>

            )}


            {/* ====================================================
                ENVIAR TODOS
            ==================================================== */}

            {resultadosIa.length > 0 && (

                <section className="registrar-massa-envio-final">

                    <div className="registrar-massa-envio-final-info">

                        <strong>
                            Registrar produtos
                        </strong>

                        <span>
                            Cada produto será enviado individualmente.
                            Se algum apresentar erro, os demais continuarão.
                        </span>

                    </div>


                    {enviandoTodos && (

                        <div className="registrar-massa-progresso">

                            <div className="registrar-massa-progresso-texto">

                                <span>
                                    Enviando produtos...
                                </span>

                                <strong>
                                    {progressoEnvio.atual}
                                    /
                                    {progressoEnvio.total}
                                </strong>

                            </div>


                            <div className="registrar-massa-progresso-barra">

                                <div
                                    className="registrar-massa-progresso-preenchimento"
                                    style={{
                                        width:
                                            progressoEnvio.total > 0
                                                ? `${(
                                                    progressoEnvio.atual /
                                                    progressoEnvio.total
                                                ) * 100}%`
                                                : "0%"
                                    }}
                                />

                            </div>

                        </div>

                    )}


                    <button
                        type="button"
                        className="registrar-massa-enviar-todos"
                        onClick={enviarTodos}
                        disabled={enviandoTodos}
                    >

                        {enviandoTodos
                            ? `Enviando ${progressoEnvio.atual}/${progressoEnvio.total}`
                            : "Enviar todos os produtos"
                        }

                    </button>

                </section>

            )}

        </div>
    );
}