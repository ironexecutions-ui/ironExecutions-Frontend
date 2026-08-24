import React, { useEffect, useState } from "react";
import FormularioFiscal from "./formulariofiscal";
import { API_URL } from "../../../../../config";
import "./registrarfiscal.css";

export default function RegistrarFiscal() {

    const [tipo, setTipo] = useState("produto");
    const [lista, setLista] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [funcao, setFuncao] = useState(null);
    const [bloqueado, setBloqueado] = useState(false);
    const [buscaProduto, setBuscaProduto] = useState("");
    // ===============================
    // IA
    // ===============================

    const [mostrarAjudaIa, setMostrarAjudaIa] = useState(false);
    const [jsonIa, setJsonIa] = useState("");
    const [dadosIa, setDadosIa] = useState(null);
    const [mensagemIa, setMensagemIa] = useState("");
    const [promptCopiado, setPromptCopiado] = useState(false);

    const token = localStorage.getItem("token");
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
                "[RegistrarFiscal] Erro ao carregar configuração fiscal da IA:",
                erro
            );

        }

        return {
            regime: "",
            origem_padrao: "",
            uf: "",
            finalidade: "",
            operacao_produto: "",
            permitir_inferencia: "sim"
        };
    });

    const [mostrarConfigIa, setMostrarConfigIa] = useState(false);
    // ===============================
    // VERIFICAR FUNÇÃO DO USUÁRIO
    // ===============================
    function alterarConfigFiscalIa(campo, valor) {

        setConfigFiscalIa(anterior => {

            const atualizado = {
                ...anterior,
                [campo]: valor
            };

            localStorage.setItem(
                "registrar_fiscal_config_ia",
                JSON.stringify(atualizado)
            );

            return atualizado;
        });
    }
    useEffect(() => {
        fetch(`${API_URL}/clientes/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(r => r.json())
            .then(dados => {

                if (dados.funcao !== "Administrador(a)") {
                    setBloqueado(true);
                } else {
                    setFuncao(dados.funcao);
                }

            })
            .catch(() => setBloqueado(true));

    }, [token]);

    // ===============================
    // CARREGAR PRODUTOS
    // ===============================

    useEffect(() => {

        if (!funcao) return;

        fetch(`${API_URL}/fiscal/produtos-servicos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(r => r.json())
            .then(setLista);

    }, [funcao, token]);

    // ===============================
    // PRODUTO POR PESO
    // ===============================

    function ehProdutoPorPeso(produto) {

        return (
            produto.peso !== null &&
            produto.peso !== undefined &&
            produto.peso !== "" &&
            Number(produto.peso) > 0 &&
            !produto.unidade &&
            !produto.produto_id &&
            !produto.tempo_servico
        );

    }

    // ===============================
    // FILTRAR PRODUTOS
    // ===============================

    const filtrados = lista.filter(p => {

        if (tipo === "servico") {
            return Boolean(p.tempo_servico);
        }

        if (tipo === "peso") {
            return ehProdutoPorPeso(p);
        }

        if (tipo === "produto") {
            return !p.tempo_servico && !ehProdutoPorPeso(p);
        }

        return false;

    });
    // ===============================
    // SELECIONAR PRODUTO
    // ID, NOME OU CÓDIGO DE BARRAS
    // ===============================

    function selecionarProduto(item) {

        setSelecionado(item || null);

        setMostrarAjudaIa(false);
        setJsonIa("");
        setDadosIa(null);
        setMensagemIa("");
    }


    function buscarProduto(valor) {

        setBuscaProduto(valor);

        const texto = String(valor || "").trim();

        if (!texto) {
            setSelecionado(null);
            return;
        }

        // Primeiro procura código de barras EXATO.
        // Isso é importante para leitor de código de barras.
        const porCodigoBarras = filtrados.find(produto =>
            String(produto.codigo_barras || "").trim() === texto
        );

        if (porCodigoBarras) {

            selecionarProduto(porCodigoBarras);

            setBuscaProduto(
                porCodigoBarras.codigo_barras || ""
            );

            return;
        }

        // Depois procura pelo ID exato.
        const porId = filtrados.find(produto =>
            String(produto.id) === texto
        );

        if (porId) {
            selecionarProduto(porId);
            return;
        }

        // Se ainda estiver digitando, não seleciona
        // um produto aleatório.
        setSelecionado(null);
    }


    // ===============================
    // ENTER DO LEITOR DE CÓDIGO
    // ===============================

    function buscarProdutoEnter() {

        const texto = String(buscaProduto || "").trim();

        if (!texto) return;

        const item = filtrados.find(produto => {

            const codigo = String(
                produto.codigo_barras || ""
            ).trim();

            const id = String(produto.id);

            const nome = String(
                produto.nome || ""
            )
                .trim()
                .toLowerCase();

            return (
                codigo === texto ||
                id === texto ||
                nome === texto.toLowerCase()
            );
        });

        if (item) {

            selecionarProduto(item);

            return;
        }

        setSelecionado(null);

        setMensagemIa(
            `Nenhum produto encontrado para "${texto}".`
        );
    }
    // ===============================
    // GERAR PROMPT PARA IA
    // ===============================

    function gerarPromptIa() {

        if (!selecionado) return "";

        const nome = selecionado.nome || "";
        const contextoFiscalComercio = `
DADOS DO COMÉRCIO:

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

Quando faltarem características específicas do produto:
${configFiscalIa.permitir_inferencia === "sim"
                ? "Utilize a classificação fiscal mais provável considerando o produto informado e o contexto do comércio. Não deixe um campo vazio apenas porque existem várias possibilidades, quando houver uma opção claramente mais provável."
                : 'Quando não for possível determinar com segurança, retorne "".'
            }
`;
        // ===============================
        // SERVIÇO
        // ===============================

        if (tipo === "servico") {

            return `
Você é um especialista brasileiro em tributação de serviços, NFS-e, ISS e Lei Complementar 116/2003.

Preciso preencher o cadastro fiscal do seguinte serviço:

NOME DO SERVIÇO:
${nome}

TEMPO DO SERVIÇO:
${selecionado.tempo_servico || "Não informado"}

Analise especificamente o serviço informado.

Preciso que determine:

1. codigo_servico
Código correspondente ao serviço na lista da LC 116/2003.

2. aliquota_iss
Alíquota de ISS normalmente aplicável ao serviço.
Retorne somente o número, sem o símbolo %.

3. municipio
Município de incidência do ISS somente se puder ser determinado pelas informações fornecidas.
Se não puder ser determinado, retorne "".

REGRAS OBRIGATÓRIAS:

- Não invente informações.
- Não escreva explicações.
- Não escreva Markdown.
- Não utilize bloco de código.
- Não escreva nada antes do JSON.
- Não escreva nada depois do JSON.
- Retorne somente JSON válido.
- Todos os valores devem ser strings.
- Se não for possível determinar algum dado com segurança, utilize "".
- Não adicione nenhuma propriedade diferente das solicitadas.

FORMATO EXATO:

{
    "codigo_servico": "",
    "aliquota_iss": "",
    "municipio": ""
}

RESPONDA SOMENTE COM O JSON.
`.trim();

        }

        // ===============================
        // PRODUTO
        // ===============================

        const descricaoTipo =
            tipo === "peso"
                ? "PRODUTO VENDIDO POR PESO"
                : "PRODUTO";

        return `
Você é um especialista brasileiro em classificação fiscal de mercadorias, NFC-e, NF-e, ICMS, PIS, COFINS, NCM, CEST, CFOP e na tributação IBS/CBS da reforma tributária brasileira.

Preciso preencher o cadastro fiscal de uma mercadoria.

${contextoFiscalComercio}

DADOS DO ITEM:

Nome:
${nome}

Tipo:
${descricaoTipo}

Peso:
${selecionado.peso || "Não informado"}

Unidade:
${selecionado.unidade || "Não informada"}

Quantidade/unidades:
${selecionado.unidades || "Não informado"}

Analise especificamente o produto "${nome}".

Você deve retornar os dados fiscais mais adequados e prováveis para esse produto.

CAMPOS:

ncm:
NCM brasileiro válido de exatamente 8 dígitos.

cfop:
CFOP considerando venda normal dentro do mesmo estado para consumidor final.

origem:
Código de origem da mercadoria.
Exemplo:
0 = nacional
1 = importação direta
2 = estrangeira adquirida no mercado interno.

Não presuma que o produto é importado sem informação que indique isso.

cst_csosn:
Código CST ou CSOSN apropriado.

icms:
Alíquota percentual do ICMS.
Somente número, sem %.

pis:
Alíquota percentual do PIS.
Somente número, sem %.

cofins:
Alíquota percentual da COFINS.
Somente número, sem %.

cest:
Código CEST somente quando realmente aplicável.
Caso não se aplique, retorne "".

cst_ibscbs:
CST correspondente ao IBS/CBS aplicável ao produto, considerando as regras vigentes.

cclass_trib:
Código cClassTrib correspondente à classificação tributária IBS/CBS.

aliquota_ibs_uf:
Alíquota percentual IBS estadual aplicável.
Somente número, sem %.

aliquota_ibs_mun:
Alíquota percentual IBS municipal aplicável.
Somente número, sem %.

aliquota_cbs:
Alíquota percentual CBS aplicável.
Somente número, sem %.

REGRAS CRÍTICAS:

- Não invente códigos fiscais.
- Analise o produto pelo nome e características informadas.
- O NCM precisa ter exatamente 8 dígitos.
- O CFOP precisa ter exatamente 4 dígitos.
- CEST somente deve ser preenchido quando aplicável.
- Não escreva justificativas.
- Não escreva observações.
- Não escreva Markdown.
- Não utilize bloco de código.
- Não coloque \`\`\`json.
- Não escreva texto antes do JSON.
- Não escreva texto depois do JSON.
- Todos os valores devem ser strings.
- Quando uma informação depender de características que não foram fornecidas e não puder ser determinada com segurança, utilize "".
- Não adicione propriedades.
- Retorne obrigatoriamente JSON válido.

A resposta deve possuir EXATAMENTE esta estrutura:

{
    "ncm": "",
    "cfop": "",
    "origem": "",
    "cst_csosn": "",
    "icms": "",
    "pis": "",
    "cofins": "",
    "cest": "",
    "cst_ibscbs": "",
    "cclass_trib": "",
    "aliquota_ibs_uf": "",
    "aliquota_ibs_mun": "",
    "aliquota_cbs": ""
}

RESPONDA SOMENTE COM O JSON.
`.trim();
    }

    // ===============================
    // COPIAR PROMPT
    // ===============================

    async function copiarPromptIa() {

        const prompt = gerarPromptIa();

        try {

            await navigator.clipboard.writeText(prompt);

            setPromptCopiado(true);
            setMensagemIa("Prompt copiado. Agora envie para sua IA favorita.");

            setTimeout(() => {
                setPromptCopiado(false);
            }, 3000);

        } catch (erro) {

            console.error(
                "[RegistrarFiscal] Erro ao copiar prompt:",
                erro
            );

            setMensagemIa(
                "Não foi possível copiar automaticamente."
            );

        }

    }

    // ===============================
    // LIMPAR JSON DA IA
    // ===============================

    function limparJsonIa(texto) {

        if (!texto) return "";

        let limpo = texto.trim();

        limpo = limpo
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/i, "")
            .trim();

        const inicio = limpo.indexOf("{");
        const fim = limpo.lastIndexOf("}");

        if (inicio !== -1 && fim !== -1) {
            limpo = limpo.substring(inicio, fim + 1);
        }

        return limpo;

    }

    // ===============================
    // VALIDAR JSON DA IA
    // ===============================

    function validarDadosIa(dados) {

        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw new Error(
                "A resposta não contém um objeto JSON válido."
            );
        }

        const camposProduto = [
            "ncm",
            "cfop",
            "origem",
            "cst_csosn",
            "icms",
            "pis",
            "cofins",
            "cest",
            "cst_ibscbs",
            "cclass_trib",
            "aliquota_ibs_uf",
            "aliquota_ibs_mun",
            "aliquota_cbs"
        ];

        const camposServico = [
            "codigo_servico",
            "aliquota_iss",
            "municipio"
        ];

        const camposPermitidos =
            tipo === "servico"
                ? camposServico
                : camposProduto;

        const resultado = {};

        camposPermitidos.forEach(campo => {

            if (
                dados[campo] === null ||
                dados[campo] === undefined
            ) {
                resultado[campo] = "";
                return;
            }

            resultado[campo] =
                String(dados[campo]).trim();
        });

        if (tipo !== "servico") {

            if (
                resultado.ncm &&
                !/^\d{8}$/.test(resultado.ncm)
            ) {
                throw new Error(
                    "O NCM informado pela IA não possui 8 dígitos."
                );
            }

            if (
                resultado.cfop &&
                !/^\d{4}$/.test(resultado.cfop)
            ) {
                throw new Error(
                    "O CFOP informado pela IA não possui 4 dígitos."
                );
            }
        }

        return resultado;
    }

    // ===============================
    // APLICAR JSON
    // ===============================

    function aplicarJsonIa() {

        setMensagemIa("");

        if (!jsonIa.trim()) {

            setMensagemIa(
                "Cole primeiro o JSON retornado pela IA."
            );

            return;

        }

        try {

            const textoLimpo = limparJsonIa(jsonIa);

            const convertido = JSON.parse(textoLimpo);

            const validado = validarDadosIa(convertido);

            console.log(
                "[RegistrarFiscal] JSON recebido da IA:",
                convertido
            );

            console.log(
                "[RegistrarFiscal] JSON validado:",
                validado
            );

            setDadosIa(validado);

            setMensagemIa(
                "Dados reconhecidos. O formulário foi preenchido."
            );

        } catch (erro) {

            console.error(
                "[RegistrarFiscal] JSON inválido:",
                erro
            );

            setMensagemIa(
                erro.message || "O JSON informado é inválido."
            );

        }

    }

    // ===============================
    // BLOQUEADO
    // ===============================

    if (bloqueado) {

        return (
            <div className="registrar-fiscal-bloqueado">
                <h4>Acesso restrito</h4>

                <p>
                    Somente administradores podem registrar dados fiscais.
                </p>
            </div>
        );

    }

    // ===============================
    // CARREGANDO
    // ===============================

    if (!funcao) {
        return <p>Carregando...</p>;
    }

    // ===============================
    // RETURN
    // ===============================

    return (

        <div className="registrar-fiscal">

            <h4>Registrar Dados Fiscais</h4>

            <div className="registrar-fiscal-topo">

                <select
                    value={tipo}
                    onChange={e => {

                        setTipo(e.target.value);

                        setBuscaProduto("");
                        setSelecionado(null);

                        setMostrarAjudaIa(false);
                        setJsonIa("");
                        setDadosIa(null);
                        setMensagemIa("");

                    }}
                >
                    <option value="produto">
                        Produto
                    </option>

                    <option value="peso">
                        Produto por peso
                    </option>

                    <option value="servico">
                        Serviço
                    </option>
                </select>

                <div className="registrar-fiscal-busca-produto">

                    <input
                        list="produtos"
                        value={buscaProduto}
                        placeholder="Nome, ID ou código de barras"
                        autoComplete="off"

                        onChange={e => {
                            buscarProduto(e.target.value);
                        }}

                        onKeyDown={e => {

                            if (e.key === "Enter") {

                                e.preventDefault();

                                buscarProdutoEnter();
                            }

                        }}
                    />

                    {buscaProduto && (

                        <button
                            type="button"
                            className="registrar-fiscal-busca-limpar"
                            onClick={() => {

                                setBuscaProduto("");
                                setSelecionado(null);

                                setMostrarAjudaIa(false);
                                setJsonIa("");
                                setDadosIa(null);
                                setMensagemIa("");

                            }}
                        >
                            ×
                        </button>

                    )}

                </div>

            </div>

            <datalist id="produtos">

                {filtrados.map(p => (

                    <option
                        key={p.id}
                        value={
                            p.codigo_barras
                                ? String(p.codigo_barras)
                                : String(p.id)
                        }
                        label={
                            Number(p.peso) > 0
                                ? `${p.nome} | Produto por peso | ${p.peso}g | Código: ${p.codigo_barras || "Sem código"}`
                                : `${p.nome} | Código: ${p.codigo_barras || "Sem código"} | ID: ${p.id}`
                        }
                    />

                ))}

            </datalist>

            {selecionado && (

                <>
                    <div className="registrar-fiscal-ajuda-ia">

                        <div className="registrar-fiscal-ajuda-ia-info">

                            <span className="registrar-fiscal-ajuda-ia-icone">
                                ✦
                            </span>

                            <div>
                                <strong>
                                    Não sabe como preencher?
                                </strong>

                                <p>
                                    Use uma IA para sugerir os dados fiscais
                                    deste item.
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            className="registrar-fiscal-ajuda-ia-botao"
                            onClick={() =>
                                setMostrarAjudaIa(
                                    anterior => !anterior
                                )
                            }
                        >
                            Ajuda com IA
                        </button>

                    </div>

                    {mostrarAjudaIa && (

                        <div className="registrar-fiscal-ia-painel">
                            <div className="registrar-fiscal-ia-config">

                                <div className="registrar-fiscal-ia-config-topo">

                                    <div>
                                        <strong>Antes de usar a IA</strong>

                                        <p>
                                            Responda algumas informações do comércio.
                                            Elas serão salvas neste dispositivo e você não
                                            precisará responder novamente nos próximos produtos.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="registrar-fiscal-ia-config-abrir"
                                        onClick={() =>
                                            setMostrarConfigIa(anterior => !anterior)
                                        }
                                    >
                                        {mostrarConfigIa
                                            ? "Fechar perguntas"
                                            : "Responder perguntas"
                                        }
                                    </button>

                                </div>

                                {mostrarConfigIa && (

                                    <div className="registrar-fiscal-ia-config-campos">

                                        <div className="registrar-fiscal-ia-config-campo">

                                            <label>
                                                Qual é o regime tributário?
                                            </label>

                                            <select
                                                value={configFiscalIa.regime}
                                                onChange={e =>
                                                    alterarConfigFiscalIa(
                                                        "regime",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">Selecione</option>
                                                <option value="Simples Nacional">
                                                    Simples Nacional
                                                </option>
                                                <option value="MEI">
                                                    MEI
                                                </option>
                                                <option value="Lucro Presumido">
                                                    Lucro Presumido
                                                </option>
                                                <option value="Lucro Real">
                                                    Lucro Real
                                                </option>
                                            </select>

                                        </div>


                                        <div className="registrar-fiscal-ia-config-campo">

                                            <label>
                                                Em qual estado fica o comércio?
                                            </label>

                                            <select
                                                value={configFiscalIa.uf}
                                                onChange={e =>
                                                    alterarConfigFiscalIa(
                                                        "uf",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">Selecione</option>

                                                {[
                                                    "AC", "AL", "AP", "AM", "BA", "CE",
                                                    "DF", "ES", "GO", "MA", "MT", "MS",
                                                    "MG", "PA", "PB", "PR", "PE", "PI",
                                                    "RJ", "RN", "RS", "RO", "RR", "SC",
                                                    "SP", "SE", "TO"
                                                ].map(uf => (
                                                    <option key={uf} value={uf}>
                                                        {uf}
                                                    </option>
                                                ))}

                                            </select>

                                        </div>


                                        <div className="registrar-fiscal-ia-config-campo">

                                            <label>
                                                De onde normalmente vêm os produtos?
                                            </label>

                                            <select
                                                value={configFiscalIa.origem_padrao}
                                                onChange={e =>
                                                    alterarConfigFiscalIa(
                                                        "origem_padrao",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Varia / não sei
                                                </option>

                                                <option value="0 - Nacional">
                                                    Nacional
                                                </option>

                                                <option value="1 - Importação direta">
                                                    Importação direta
                                                </option>

                                                <option value="2 - Estrangeira adquirida no mercado interno">
                                                    Importado comprado no Brasil
                                                </option>

                                            </select>

                                        </div>


                                        <div className="registrar-fiscal-ia-config-campo">

                                            <label>
                                                Os produtos são normalmente:
                                            </label>

                                            <select
                                                value={configFiscalIa.operacao_produto}
                                                onChange={e =>
                                                    alterarConfigFiscalIa(
                                                        "operacao_produto",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Selecione
                                                </option>

                                                <option value="Mercadoria adquirida de terceiros para revenda">
                                                    Comprados para revenda
                                                </option>

                                                <option value="Mercadoria de fabricação própria">
                                                    Fabricação própria
                                                </option>

                                                <option value="Varia conforme o produto">
                                                    Varia
                                                </option>

                                            </select>

                                        </div>


                                        <div className="registrar-fiscal-ia-config-campo">

                                            <label>
                                                Normalmente vende para:
                                            </label>

                                            <select
                                                value={configFiscalIa.finalidade}
                                                onChange={e =>
                                                    alterarConfigFiscalIa(
                                                        "finalidade",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Selecione
                                                </option>

                                                <option value="Consumidor final">
                                                    Consumidor final
                                                </option>

                                                <option value="Revenda">
                                                    Outros comércios para revenda
                                                </option>

                                                <option value="Varia conforme a venda">
                                                    Varia
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                )}

                            </div>
                            <div className="registrar-fiscal-ia-etapa">

                                <span className="registrar-fiscal-ia-numero">
                                    1
                                </span>

                                <div className="registrar-fiscal-ia-conteudo">

                                    <strong>
                                        Copie as instruções
                                    </strong>

                                    <p>
                                        O prompt já contém o produto selecionado
                                        e explica exatamente quais informações
                                        fiscais a IA deve retornar.
                                    </p>

                                    <button
                                        type="button"
                                        className="registrar-fiscal-ia-copiar"
                                        onClick={copiarPromptIa}
                                    >
                                        {promptCopiado
                                            ? "✓ Prompt copiado"
                                            : "Copiar prompt para IA"
                                        }
                                    </button>

                                </div>

                            </div>

                            <div className="registrar-fiscal-ia-etapa">

                                <span className="registrar-fiscal-ia-numero">
                                    2
                                </span>

                                <div className="registrar-fiscal-ia-conteudo">

                                    <strong>
                                        Envie para sua IA favorita
                                    </strong>

                                    <p>
                                        Cole o prompt no ChatGPT, Gemini,
                                        Claude ou outra IA e copie somente
                                        o JSON retornado.
                                    </p>

                                </div>

                            </div>

                            <div className="registrar-fiscal-ia-etapa">

                                <span className="registrar-fiscal-ia-numero">
                                    3
                                </span>

                                <div className="registrar-fiscal-ia-conteudo">

                                    <strong>
                                        Cole a resposta aqui
                                    </strong>

                                    <p>
                                        O sistema vai validar o JSON antes
                                        de preencher o formulário.
                                    </p>

                                    <textarea
                                        className="registrar-fiscal-ia-json"
                                        value={jsonIa}
                                        onChange={e =>
                                            setJsonIa(e.target.value)
                                        }
                                        placeholder={`{
  "ncm": "00000000",
  "cfop": "5102",
  "cest": "",
  "unidade_tributavel": "UN",
  "origem": "0",
  "cst_icms": "",
  "csosn": "",
  "aliquota_icms": "",
  "cst_pis": "",
  "aliquota_pis": "",
  "cst_cofins": "",
  "aliquota_cofins": ""
}`}
                                    />

                                    <button
                                        type="button"
                                        className="registrar-fiscal-ia-aplicar"
                                        onClick={aplicarJsonIa}
                                    >
                                        Aplicar dados ao formulário
                                    </button>

                                    {mensagemIa && (
                                        <div className="registrar-fiscal-ia-mensagem">
                                            {mensagemIa}
                                        </div>
                                    )}

                                </div>

                            </div>

                            <div className="registrar-fiscal-ia-aviso">
                                <strong>Importante:</strong>{" "}
                                dados tributários sugeridos por IA devem ser
                                conferidos antes da emissão fiscal.
                            </div>

                        </div>

                    )}

                    <div className="registrar-fiscal-form">

                        <FormularioFiscal
                            tipo={tipo === "peso" ? "produto" : tipo}
                            produto={selecionado}
                            produtoPorPeso={tipo === "peso"}
                            dadosIa={dadosIa}
                        />

                    </div>
                </>

            )}

        </div>
    );
}