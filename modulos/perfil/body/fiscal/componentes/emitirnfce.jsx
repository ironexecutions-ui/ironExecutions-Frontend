import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../../../../config";

import "./emitirnfce.css";
// =====================================================
// CONFIGURAÇÃO DE TESTE DA NF-e
// =====================================================

const USAR_DADOS_TESTE_NFE = true;

const DADOS_TESTE_DESTINATARIO_NFE = {
    nome: "Andy Jose de Oliveira Romero",
    documento: "64593886000107",

    email: "ELDERROMERO565@GMAIL.COM",
    telefone: "1118547818",

    inscricao_estadual: "239241180111",
    indicador_inscricao_estadual: "1",

    cep: "07718025",
    logradouro: "RUA JOSE FAILLACE",
    numero: "214",
    complemento: "ANDAR CASA",
    bairro: "VERA TEREZA",

    codigo_municipio: "3509004",
    municipio: "CAIEIRAS",
    uf: "SP"
};
export default function EmitirNfce() {

    const [vendas, setVendas] = useState([]);
    function vendaJaPossuiDocumentoFiscal(vendaId) {
        const venda = vendas.find(
            item => Number(item.id) === Number(vendaId)
        );

        return (
            Number(venda?.nfce_emitida) === 1 ||
            Number(venda?.nfe_emitida) === 1
        );
    }

    const [carregando, setCarregando] = useState(true);

    const [emitindoVendaId, setEmitindoVendaId] = useState(null);

    const token = localStorage.getItem("token");

    const [dataFiltro, setDataFiltro] = useState("");
    const [documentoNfce, setDocumentoNfce] = useState("");
    const [modeloFiscalSelecionado, setModeloFiscalSelecionado] = useState("65");
    const [salvandoDocumentoNfce, setSalvandoDocumentoNfce] = useState(false);
    const [horaMinima, setHoraMinima] = useState("");
    const [protocoloFiltroNfce, setProtocoloFiltroNfce] = useState("");
    const [valorFiltroNfce, setValorFiltroNfce] = useState("");
    const [quantidadeVisivelNfce, setQuantidadeVisivelNfce] = useState(5);


    const [alertaNfce, setAlertaNfce] = useState(null);
    // =====================================================
    // DADOS DO DESTINATÁRIO DA NF-e MODELO 55
    // =====================================================

    const [destinatarioNfe, setDestinatarioNfe] = useState({
        nome: "",
        documento: "",
        email: "",
        telefone: "",
        inscricao_estadual: "",
        indicador_inscricao_estadual: "9",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        codigo_municipio: "",
        municipio: "",
        uf: ""
    });

    const [salvandoDestinatarioNfe, setSalvandoDestinatarioNfe] = useState(false);
    useEffect(() => {

        carregar();

    }, []);
    useEffect(() => {

        setQuantidadeVisivelNfce(5);

    }, [
        dataFiltro,
        protocoloFiltroNfce,
        valorFiltroNfce
    ]);
    async function carregar() {

        setCarregando(true);

        try {

            const resposta = await fetch(
                `${API_URL}/vendas/nfce-pendentes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            console.log(
                "[NFC-e] RESPOSTA:",
                dados
            );

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    dados.erro ||
                    "Erro ao carregar vendas pendentes"
                );

            }

            if (Array.isArray(dados)) {

                setVendas(dados);

            } else {

                setVendas([]);

            }

        } catch (erro) {

            console.error(
                "[NFC-e] Erro ao carregar:",
                erro
            );

            setVendas([]);

        } finally {

            setCarregando(false);

        }
    }

    /*
     * =====================================================
     * SOLICITAR EMISSÃO
     * =====================================================
     */

    function solicitarEmissao(vendaId) {
        if (emitindoVendaId !== null) {
            return;
        }

        if (vendaJaPossuiDocumentoFiscal(vendaId)) {
            setAlertaNfce({
                tipo: "aviso",
                titulo: "NFC-e já emitida",
                mensagem: "Esta venda já possui uma NFC-e emitida.",
                vendaId: null
            });

            return;
        }

        setAlertaNfce({
            tipo: "tipo_operacao",
            titulo: "Onde será realizada a operação?",
            mensagem: "Informe se o destinatário está dentro ou fora do estado do estabelecimento.",
            vendaId
        });
    }

    // =====================================================
    // FORMATAR DOCUMENTO DA NF-e
    // =====================================================

    function atualizarDestinatarioNfe(campo, valor) {
        setDestinatarioNfe(atual => ({
            ...atual,
            [campo]: valor
        }));
    }


    // =====================================================
    // SELECIONAR OPERAÇÃO FISCAL
    // =====================================================

    function selecionarOperacaoFiscal(tipo) {
        const vendaId = alertaNfce?.vendaId;

        if (!vendaId) return;

        const vendaSelecionada = vendas.find(
            venda => Number(venda.id) === Number(vendaId)
        );

        const documentoAtual = vendaSelecionada?.cpf_consumidor || "";

        if (tipo === "interestadual") {
            setModeloFiscalSelecionado("55");

            // Quando a constante estiver true, abre o formulário
            // preenchido automaticamente com os dados definidos para teste.
            // Quando estiver false, mantém o comportamento normal.
            if (USAR_DADOS_TESTE_NFE) {
                setDestinatarioNfe({
                    ...DADOS_TESTE_DESTINATARIO_NFE
                });
            } else {
                setDestinatarioNfe(atual => ({
                    ...atual,
                    documento: String(documentoAtual).replace(/\\D/g, "")
                }));
            }

            setAlertaNfce({
                tipo: "destinatario_nfe",
                titulo: "Dados do destinatário",
                mensagem: USAR_DADOS_TESTE_NFE
                    ? "Formulário preenchido com os dados de teste. Confira os campos antes de continuar."
                    : "Informe os dados necessários para emitir a NF-e modelo 55.",
                vendaId
            });

            return;
        }

        // FLUXO ORIGINAL DA NFC-e MODELO 65

        setModeloFiscalSelecionado("65");

        setDocumentoNfce(
            formatarCpfCnpjNfce(documentoAtual)
        );

        setAlertaNfce({
            tipo: "documento",
            titulo: "CPF/CNPJ na nota?",
            mensagem: documentoAtual
                ? "Esta venda já possui um CPF/CNPJ. Você pode mantê-lo ou informar outro."
                : "Deseja informar o CPF ou CNPJ do consumidor?",
            vendaId
        });
    }


    // =====================================================
    // VALIDAR E CONTINUAR COM A NF-e
    // =====================================================

    async function salvarDestinatarioNfe() {
        const vendaId = alertaNfce?.vendaId;

        if (!vendaId) return;

        const dados = {
            ...destinatarioNfe,
            documento: destinatarioNfe.documento.replace(/\D/g, ""),
            cep: destinatarioNfe.cep.replace(/\D/g, ""),
            telefone: destinatarioNfe.telefone.replace(/\D/g, ""),
            codigo_municipio: destinatarioNfe.codigo_municipio.replace(/\D/g, ""),
            uf: destinatarioNfe.uf.trim().toUpperCase()
        };

        if (!dados.nome.trim()) {
            setAlertaNfce(atual => ({
                ...atual,
                mensagem: "Informe o nome ou a razão social do destinatário.",
                erroDestinatario: true
            }));
            return;
        }

        if (![11, 14].includes(dados.documento.length)) {
            setAlertaNfce(atual => ({
                ...atual,
                mensagem: "Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.",
                erroDestinatario: true
            }));
            return;
        }

        if (
            !dados.cep ||
            dados.cep.length !== 8 ||
            !dados.logradouro.trim() ||
            !dados.numero.trim() ||
            !dados.bairro.trim() ||
            !dados.codigo_municipio ||
            dados.codigo_municipio.length !== 7 ||
            !dados.municipio.trim() ||
            !dados.uf
        ) {
            setAlertaNfce(atual => ({
                ...atual,
                mensagem: "Preencha todos os campos obrigatórios do endereço.",
                erroDestinatario: true
            }));
            return;
        }

        const ufsValidas = [
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES",
            "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR",
            "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
            "SP", "SE", "TO"
        ];

        if (!ufsValidas.includes(dados.uf)) {
            setAlertaNfce(atual => ({
                ...atual,
                mensagem: "Informe uma UF válida.",
                erroDestinatario: true
            }));
            return;
        }

        if (
            dados.indicador_inscricao_estadual === "1" &&
            !dados.inscricao_estadual.trim()
        ) {
            setAlertaNfce(atual => ({
                ...atual,
                mensagem: "Informe a Inscrição Estadual do destinatário.",
                erroDestinatario: true
            }));
            return;
        }

        setSalvandoDestinatarioNfe(true);

        try {
            setDestinatarioNfe(dados);

            setAlertaNfce({
                tipo: "confirmacao",
                titulo: "Emitir NF-e",
                mensagem: `Confirma a emissão da NF-e modelo 55 referente à venda #${vendaId}?`,
                vendaId,
                modeloFiscal: "55",
                destinatario: dados
            });

        } finally {
            setSalvandoDestinatarioNfe(false);
        }
    }



    function abrirConfirmacaoEmissao(vendaId) {
        const modeloFiscal = modeloFiscalSelecionado;

        setAlertaNfce({
            tipo: "confirmacao",
            titulo: modeloFiscal === "55"
                ? "Emitir NF-e"
                : "Emitir NFC-e",
            mensagem: modeloFiscal === "55"
                ? `Confirma a emissão da NF-e modelo 55 referente à venda #${vendaId}?`
                : `Confirma a emissão da NFC-e modelo 65 referente à venda #${vendaId}?`,
            vendaId,
            modeloFiscal
        });
    }


    function formatarCpfCnpjNfce(valor) {

        const numeros = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 14);

        if (numeros.length <= 11) {

            return numeros
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }

        return numeros
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }


    function continuarSemDocumentoNfce() {

        const vendaId = alertaNfce?.vendaId;

        if (!vendaId) {
            return;
        }

        setDocumentoNfce("");

        abrirConfirmacaoEmissao(vendaId);
    }


    async function salvarDocumentoNfce() {

        const vendaId = alertaNfce?.vendaId;

        if (!vendaId) {
            return;
        }

        const documentoLimpo = documentoNfce.replace(/\D/g, "");

        if (
            documentoLimpo.length !== 11 &&
            documentoLimpo.length !== 14
        ) {

            setAlertaNfce({
                tipo: "documento",
                titulo: "CPF/CNPJ na nota?",
                mensagem: "Digite um CPF com 11 dígitos ou CNPJ com 14 dígitos.",
                vendaId,
                erroDocumento: true
            });

            return;
        }

        setSalvandoDocumentoNfce(true);

        try {

            const resposta = await fetch(
                `${API_URL}/vendas/${vendaId}/cpf-cnpj`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        documento: documentoLimpo
                    })
                }
            );
            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    dados.erro ||
                    "Não foi possível salvar o CPF/CNPJ"
                );
            }

            abrirConfirmacaoEmissao(vendaId);

        } catch (erro) {

            console.error(
                "[NFC-e] Erro ao salvar CPF/CNPJ:",
                erro
            );

            setAlertaNfce({
                tipo: "documento",
                titulo: "CPF/CNPJ na nota?",
                mensagem:
                    erro.message ||
                    "Não foi possível salvar o CPF/CNPJ.",
                vendaId,
                erroDocumento: true
            });

        } finally {

            setSalvandoDocumentoNfce(false);
        }
    }
    /*
     * =====================================================
     * EMITIR NFC-e
     * =====================================================
     */

    async function emitir(
        vendaId,
        modeloFiscal = modeloFiscalSelecionado,
        destinatario = null
    ) {        /*
         * Impede duas emissões simultâneas.
         */

        if (emitindoVendaId !== null) {

            return;

        }

        /*
         * =====================================================
         * VERIFICAR NOVAMENTE SE A VENDA JÁ POSSUI NFC-e
         * =====================================================
         */

        if (vendaJaPossuiDocumentoFiscal(vendaId)) {

            setAlertaNfce({
                tipo: "aviso",
                titulo: "NFC-e já emitida",
                mensagem: "Esta venda já possui uma NFC-e emitida.",
                vendaId: null
            });

            return;

        }

        /*
         * =====================================================
         * DESABILITAR IMEDIATAMENTE
         * =====================================================
         */

        setEmitindoVendaId(vendaId);

        /*
         * =====================================================
         * MODAL DE PROCESSAMENTO
         * =====================================================
         */

        setAlertaNfce({
            tipo: "processando",
            titulo: modeloFiscal === "55" ? "Emitindo NF-e" : "Emitindo NFC-e",
            mensagem: "Comunicando com a SEFAZ. Aguarde a conclusão da emissão.",
            vendaId: vendaId
        });

        try {

            const endpoint = modeloFiscal === "55"
                ? "emitir-nfe"
                : "emitir-nfce";

            const resposta = await fetch(
                `${API_URL}/vendas/${vendaId}/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        modeloFiscal === "55"
                            ? destinatario
                            : {
                                modelo: Number(modeloFiscal)
                            }
                    )
                }
            );


            const data =
                await resposta.json();

            /*
             * =====================================================
             * ERRO HTTP
             * =====================================================
             */

            if (!resposta.ok) {

                // ============================================================
                // PRODUTOS SEM CADASTRO FISCAL
                // ============================================================
                const detalheEstruturado =
                    data?.detail &&
                        typeof data.detail === "object"
                        ? data.detail
                        : null;

                const codigoErro =
                    detalheEstruturado?.codigo ??
                    data?.codigo ??
                    null;

                const produtosErro =
                    Array.isArray(detalheEstruturado?.produtos)
                        ? detalheEstruturado.produtos
                        : Array.isArray(data?.produtos)
                            ? data.produtos
                            : [];

                const mensagemErro =
                    detalheEstruturado?.mensagem ??
                    (
                        typeof data?.detail === "string"
                            ? data.detail
                            : null
                    ) ??
                    data?.erro ??
                    data?.mensagem ??
                    "";

                const detalheErro =
                    String(mensagemErro || "");

                const matchProdutoSemFiscal =
                    detalheErro.match(
                        /Produto\s+(\d+)\s+sem dados fiscais cadastrados/i
                    );

                if (
                    (
                        codigoErro === "PRODUTOS_SEM_DADOS_FISCAIS" &&
                        produtosErro.length > 0
                    ) ||
                    matchProdutoSemFiscal
                ) {

                    let produtosSemFiscal = [];

                    if (produtosErro.length > 0) {

                        produtosSemFiscal =
                            produtosErro.map(produto => ({

                                produto_id:
                                    produto.produto_id ??
                                    produto.id,

                                id:
                                    produto.produto_id ??
                                    produto.id,

                                nome:
                                    produto.nome ??
                                    `Produto ${produto.produto_id ??
                                    produto.id
                                    }`
                            }));

                    } else if (matchProdutoSemFiscal) {

                        const produtoId =
                            Number(matchProdutoSemFiscal[1]);

                        produtosSemFiscal = [
                            {
                                produto_id: produtoId,
                                id: produtoId,
                                nome: `Produto ${produtoId}`
                            }
                        ];
                    }
                    // Salva temporariamente quais produtos precisam
                    // ser cadastrados na tela Fiscal em Massa.
                    sessionStorage.setItem(
                        "fiscal_massa_produtos_pendentes",
                        JSON.stringify(produtosSemFiscal)
                    );

                    // Também guardamos a venda que originou o problema.
                    // Depois podemos usar isso para voltar e tentar emitir
                    // exatamente a mesma NFC-e.
                    sessionStorage.setItem(
                        "fiscal_massa_venda_pendente",
                        String(vendaId)
                    );

                    setAlertaNfce({
                        tipo: "fiscal_pendente",
                        titulo: "Produtos sem dados fiscais",
                        mensagem:
                            produtosSemFiscal.length === 1
                                ? `${produtosSemFiscal[0].nome} precisa do cadastro fiscal antes da emissão.`
                                : `${produtosSemFiscal.length} produtos precisam do cadastro fiscal antes da emissão.`,
                        vendaId,
                        produtos: produtosSemFiscal
                    });

                    return;
                }

                // ============================================================
                // DEMAIS ERROS
                // ============================================================

                throw new Error(
                    mensagemErro ||
                    "Erro desconhecido ao emitir NFC-e"
                );
            }

            /*
             * =====================================================
             * SUCESSO
             * =====================================================
             */

            setAlertaNfce({
                tipo: "sucesso",
                titulo: modeloFiscal === "55"
                    ? "NF-e emitida com sucesso"
                    : "NFC-e emitida com sucesso",
                mensagem:
                    data.mensagem ||
                    `A ${modeloFiscal === "55" ? "NF-e" : "NFC-e"} do protocolo #${vendaId} foi emitida e registrada com sucesso.`,

                vendaId: vendaId
            });

            /*
             * =====================================================
             * RECARREGAR
             *
             * Isso consulta novamente:
             *
             * /fiscal/nfce
             *
             * e encontra o novo venda_id.
             * =====================================================
             */

            await carregar();

        } catch (erro) {

            console.error(
                "[NFC-e] Erro ao emitir NFC-e:",
                erro
            );

            setAlertaNfce({
                tipo: "erro",
                titulo: modeloFiscal === "55"
                    ? "Falha na emissão da NF-e"
                    : "Falha na emissão da NFC-e",
                mensagem:
                    erro.message ||
                    "Ocorreu um erro inesperado durante a emissão.",
                vendaId: vendaId,
                modeloFiscal: modeloFiscal,
                destinatario: destinatario
            });

        } finally {

            setEmitindoVendaId(null);

        }
    }

    /*
     * =====================================================
     * FECHAR ALERTA
     * =====================================================
     */

    function fecharAlertaNfce() {

        /*
         * Não permite fechar enquanto estiver processando.
         */

        if (
            alertaNfce?.tipo === "processando"
        ) {

            return;

        }

        setAlertaNfce(null);
    }

    /*
     * =====================================================
     * CONFIRMAR EMISSÃO PELO MODAL
     * =====================================================
     */

    function confirmarEmissaoNfce() {
        if (!alertaNfce?.vendaId) {
            return;
        }

        const vendaId = alertaNfce.vendaId;

        if (alertaNfce.modeloFiscal === "55") {
            emitir(
                vendaId,
                "55",
                alertaNfce.destinatario
            );
            return;
        }

        emitir(vendaId, "65");
    }

    /*
     * =====================================================
     * TENTAR NOVAMENTE
     * =====================================================
     */

    function tentarNovamenteNfce() {
        if (!alertaNfce?.vendaId) {
            return;
        }

        const vendaId = alertaNfce.vendaId;

        emitir(
            vendaId,
            alertaNfce.modeloFiscal,
            alertaNfce.destinatario || null
        );
    }

    /*
     * =====================================================
     * CONVERTER HORA PARA SEGUNDOS
     * =====================================================
     */

    function horaParaSegundos(hora) {

        if (!hora) {

            return 0;

        }

        const [h, m, s] =
            hora
                .split(":")
                .map(Number);

        return (
            h * 3600 +
            m * 60 +
            s
        );
    }

    /*
     * =====================================================
     * CARREGANDO
     * =====================================================
     */

    if (carregando) {

        return (
            <div className="emitir-nfce-loading">

                <p>
                    Carregando vendas pendentes...
                </p>

            </div>
        );

    }

    /*
     * =====================================================
     * NENHUMA VENDA
     * =====================================================
     */

    if (vendas.length === 0) {

        return (
            <>
                <div className="emitir-nfce-empty">

                    <p>
                        Nenhuma venda pendente de NFC-e.
                    </p>

                </div>




            </>
        );

    }

    /*
     * =====================================================
     * FILTROS
     * =====================================================
     */
    const vendasFiltradas =
        vendas.filter(v => {

            /*
             * =====================================================
             * FILTRO POR DATA
             * =====================================================
             */

            if (dataFiltro) {

                const dataVenda =
                    String(v.data || "")
                        .trim();

                if (
                    dataVenda !== dataFiltro
                ) {

                    return false;

                }

            }

            /*
             * =====================================================
             * FILTRO POR PROTOCOLO / ID
             * =====================================================
             */

            if (protocoloFiltroNfce.trim()) {

                const protocoloVenda =
                    String(v.id || "")
                        .toLowerCase()
                        .trim();

                const protocoloDigitado =
                    protocoloFiltroNfce
                        .toLowerCase()
                        .trim();

                if (
                    !protocoloVenda.includes(
                        protocoloDigitado
                    )
                ) {

                    return false;

                }

            }

            /*
             * =====================================================
             * FILTRO POR VALOR
             * =====================================================
             */

            if (valorFiltroNfce.trim()) {

                const valorDigitado =
                    valorFiltroNfce
                        .replace(",", ".")
                        .replace(/[^\d.]/g, "");

                const numeroDigitado =
                    Number(valorDigitado);

                const valorVenda =
                    Number(v.valor_pago);

                if (
                    !Number.isNaN(numeroDigitado) &&
                    valorVenda !== numeroDigitado
                ) {

                    return false;

                }

            }

            return true;

        });


    /*
     * =====================================================
     * LIMITAR QUANTIDADE EXIBIDA
     * =====================================================
     */

    const vendasVisiveisNfce =
        vendasFiltradas.slice(
            0,
            quantidadeVisivelNfce
        );


    /*
     * =====================================================
     * VERIFICAR SE EXISTEM MAIS VENDAS
     * =====================================================
     */

    const possuiMaisVendasNfce =
        quantidadeVisivelNfce <
        vendasFiltradas.length;


    const quantidadeDigitosDocumentoNfce =
        documentoNfce.replace(/\D/g, "").length;

    const documentoNfceCompleto =
        quantidadeDigitosDocumentoNfce === 11 ||
        quantidadeDigitosDocumentoNfce === 14;
    return (

        <div className="emitir-nfce">

            <h4>
                Vendas pendentes de NFC-e
            </h4>

            <div className="filtros-nfce">

                <div className="filtro-nfce-data">

                    <label>
                        Protocolo
                    </label>

                    <input
                        type="text"
                        placeholder="Ex: 4306"
                        value={protocoloFiltroNfce}
                        onChange={e =>
                            setProtocoloFiltroNfce(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="filtro-nfce-data">

                    <label>
                        Data
                    </label>

                    <input
                        type="date"
                        value={dataFiltro}
                        onChange={e =>
                            setDataFiltro(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="filtro-nfce-data">

                    <label>
                        Valor
                    </label>

                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 49,90"
                        value={valorFiltroNfce}
                        onChange={e =>
                            setValorFiltroNfce(
                                e.target.value
                            )
                        }
                    />

                </div>

                <button
                    type="button"
                    className="btn-limpar"
                    onClick={() => {

                        setDataFiltro("");

                        setHoraMinima("");

                        setProtocoloFiltroNfce("");

                        setValorFiltroNfce("");

                        setQuantidadeVisivelNfce(5);

                    }}
                >
                    Limpar filtros
                </button>

            </div>

            {vendasFiltradas.length === 0 ? (

                <div className="emitir-nfce-empty">

                    <p>
                        Nenhuma venda encontrada com esses filtros.
                    </p>

                </div>

            ) : (

                <table>

                    <thead>

                        <tr>

                            <th>
                                Protocolo
                            </th>

                            <th>
                                Valor
                            </th>

                            <th>
                                Pagamento
                            </th>

                            <th>
                                Data
                            </th>

                            <th>
                                Comanda
                            </th>

                            <th>
                                Ação
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {vendasVisiveisNfce.map(v => {
                            const possuiNfce =
                                Number(v.nfce_emitida) === 1 ||
                                Number(v.nfe_emitida) === 1;

                            const estaEmitindo =
                                Number(emitindoVendaId) === Number(v.id);

                            return (
                                <tr key={v.id}>

                                    <td>
                                        {v.id}
                                    </td>

                                    <td>
                                        R$ {Number(v.valor_pago).toFixed(2)}
                                    </td>

                                    <td>
                                        {v.pagamento}
                                    </td>

                                    <td>
                                        {v.data}
                                    </td>

                                    <td>

                                        {v.comanda ? (

                                            <button
                                                type="button"
                                                className="btn-comanda"
                                                onClick={() =>
                                                    window.open(
                                                        v.comanda,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                Ver comanda
                                            </button>

                                        ) : (

                                            <span className="sem-comanda">
                                                Venda online
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            className={
                                                possuiNfce
                                                    ? "btn-nfce-emitida"
                                                    : estaEmitindo
                                                        ? "btn-nfce-processando"
                                                        : "btn-emitir-nfce"
                                            }
                                            disabled={
                                                possuiNfce ||
                                                estaEmitindo
                                            }
                                            onClick={() =>
                                                solicitarEmissao(v.id)
                                            }
                                        >

                                            {possuiNfce
                                                ? "NFC-e emitida"
                                                : estaEmitindo
                                                    ? "Emitindo..."
                                                    : "Emitir NFC-e"
                                            }

                                        </button>

                                    </td>

                                </tr>
                            );

                        })}

                    </tbody>

                </table>

            )}
            {possuiMaisVendasNfce && (

                <div className="nfce-carregar-mais-area">

                    <button
                        type="button"
                        className="nfce-carregar-mais-btn"
                        onClick={() =>
                            setQuantidadeVisivelNfce(
                                quantidadeAtual =>
                                    quantidadeAtual + 5
                            )
                        }
                    >
                        Carregar mais 5
                    </button>

                    <span className="nfce-carregar-mais-info">
                        Exibindo{" "}
                        {Math.min(
                            quantidadeVisivelNfce,
                            vendasFiltradas.length
                        )}{" "}
                        de{" "}
                        {vendasFiltradas.length}
                    </span>

                </div>

            )}
            {/*
             * =====================================================
             * MODAL PERSONALIZADO NFC-e
             * =====================================================
             */}

            {alertaNfce && createPortal(

                <div className="nfce-alerta-overlay-premium">

                    <div
                        className={`nfce-alerta-modal-premium nfce-alerta-modal-${alertaNfce.tipo}`}
                    >

                        {/*
                         * =====================================================
                         * ÍCONE
                         * =====================================================
                         */}

                        <div className="nfce-alerta-icone-area-premium">
                            {alertaNfce.tipo === "tipo_operacao" && (
                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-operacao">
                                    UF
                                </div>
                            )}

                            {alertaNfce.tipo === "nfe_indisponivel" && (
                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-aviso">
                                    NF
                                </div>
                            )}
                            {alertaNfce.tipo === "confirmacao" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-confirmacao">
                                    NF
                                </div>

                            )}

                            {alertaNfce.tipo === "processando" && (

                                <div className="nfce-alerta-spinner-premium"></div>

                            )}

                            {alertaNfce.tipo === "sucesso" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-sucesso">
                                    ✓
                                </div>

                            )}




                            {alertaNfce.tipo === "fiscal_pendente" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-aviso">
                                    !
                                </div>

                            )}


                            {alertaNfce.tipo === "erro" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-erro">
                                    !
                                </div>

                            )}



                            {alertaNfce.tipo === "aviso" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-aviso">
                                    !
                                </div>

                            )}

                        </div>

                        {/*
                         * =====================================================
                         * CONTEÚDO
                         * =====================================================
                         */}

                        <div className="nfce-alerta-conteudo-premium">

                            <h3>
                                {alertaNfce.titulo}
                            </h3>

                            <p>
                                {alertaNfce.mensagem}
                            </p>
                            {alertaNfce.tipo === "tipo_operacao" && (
                                <div className="nfce-operacao-escolha">

                                    <button
                                        type="button"
                                        className="nfce-operacao-card nfce-operacao-interna"
                                        onClick={() => selecionarOperacaoFiscal("interna")}
                                    >
                                        <span className="nfce-operacao-card-icone">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </span>

                                        <span className="nfce-operacao-card-texto">
                                            <strong>Dentro do estado</strong>
                                            <small>Continuar com NFC-e, modelo 65</small>
                                        </span>

                                        <span className="nfce-operacao-card-seta">
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className="nfce-operacao-card nfce-operacao-externa"
                                        onClick={() => selecionarOperacaoFiscal("interestadual")}
                                    >
                                        <span className="nfce-operacao-card-icone">
                                            <i className="fa-solid fa-truck-fast"></i>
                                        </span>

                                        <span className="nfce-operacao-card-texto">
                                            <strong>Fora do estado</strong>
                                            <small>Direcionar para NF-e, modelo 55</small>
                                        </span>

                                        <span className="nfce-operacao-card-seta">
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </span>
                                    </button>

                                </div>
                            )}

                            {alertaNfce.tipo === "tipo_operacao" && (
                                <div className="nfce-alerta-acoes-premium">

                                    <button
                                        type="button"
                                        className="nfce-alerta-btn-cancelar-premium"
                                        onClick={fecharAlertaNfce}
                                    >
                                        Cancelar
                                    </button>

                                </div>
                            )}

                            {alertaNfce.tipo === "nfe_indisponivel" && (
                                <div className="nfce-alerta-acoes-premium">

                                    <button
                                        type="button"
                                        className="nfce-alerta-btn-cancelar-premium"
                                        onClick={() => {
                                            const vendaId = alertaNfce.vendaId;

                                            setAlertaNfce({
                                                tipo: "tipo_operacao",
                                                titulo: "Onde será realizada a operação?",
                                                mensagem: "Informe se o destinatário está dentro ou fora do estado do estabelecimento.",
                                                vendaId
                                            });
                                        }}
                                    >
                                        Voltar
                                    </button>

                                    <button
                                        type="button"
                                        className="nfce-alerta-btn-confirmar-premium"
                                        onClick={fecharAlertaNfce}
                                    >
                                        Entendido
                                    </button>

                                </div>
                            )}

                            {alertaNfce.tipo === "documento" && (

                                <div className="nfce-documento-consumidor-area">

                                    <label
                                        className="nfce-documento-consumidor-label"
                                        htmlFor="nfce-documento-consumidor-input"
                                    >
                                        CPF ou CNPJ
                                    </label>

                                    <input
                                        id="nfce-documento-consumidor-input"
                                        className="nfce-documento-consumidor-input"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                        maxLength={18}
                                        value={documentoNfce}
                                        disabled={salvandoDocumentoNfce}
                                        onChange={(e) => {

                                            setDocumentoNfce(
                                                formatarCpfCnpjNfce(
                                                    e.target.value
                                                )
                                            );

                                        }}
                                    />

                                    {alertaNfce.erroDocumento && (

                                        <span className="nfce-documento-consumidor-erro">
                                            {alertaNfce.mensagem}
                                        </span>

                                    )}

                                </div>

                            )}

                            {alertaNfce.tipo === "destinatario_nfe" && (
                                <div className="nfe-destinatario-form">

                                    <div className="nfe-destinatario-introducao">
                                        <strong>Dados do destinatário da NF-e</strong>
                                        <span>Preencha os dados necessários para a emissão.</span>
                                    </div>

                                    <div className="nfe-destinatario-grid">

                                        <div className="nfe-destinatario-campo nfe-destinatario-largo">
                                            <label>Nome ou razão social *</label>
                                            <input
                                                value={destinatarioNfe.nome}
                                                onChange={e => atualizarDestinatarioNfe("nome", e.target.value)}
                                                placeholder="Nome completo ou razão social"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>CPF ou CNPJ *</label>
                                            <input
                                                value={destinatarioNfe.documento}
                                                onChange={e => atualizarDestinatarioNfe("documento", e.target.value.replace(/\D/g, "").slice(0, 14))}
                                                placeholder="Somente números"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>E-mail</label>
                                            <input
                                                type="email"
                                                value={destinatarioNfe.email}
                                                onChange={e => atualizarDestinatarioNfe("email", e.target.value)}
                                                placeholder="email@exemplo.com"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>Telefone</label>
                                            <input
                                                value={destinatarioNfe.telefone}
                                                onChange={e => atualizarDestinatarioNfe("telefone", e.target.value)}
                                                placeholder="Telefone"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>Indicador de Inscrição Estadual *</label>
                                            <select
                                                value={destinatarioNfe.indicador_inscricao_estadual}
                                                onChange={e => atualizarDestinatarioNfe("indicador_inscricao_estadual", e.target.value)}
                                            >
                                                <option value="1">Contribuinte ICMS</option>
                                                <option value="2">Contribuinte isento</option>
                                                <option value="9">Não contribuinte</option>
                                            </select>
                                        </div>

                                        {destinatarioNfe.indicador_inscricao_estadual === "1" && (
                                            <div className="nfe-destinatario-campo">
                                                <label>Inscrição Estadual *</label>
                                                <input
                                                    value={destinatarioNfe.inscricao_estadual}
                                                    onChange={e => atualizarDestinatarioNfe("inscricao_estadual", e.target.value)}
                                                    placeholder="Inscrição Estadual"
                                                />
                                            </div>
                                        )}

                                    </div>

                                    <div className="nfe-destinatario-separador">
                                        Endereço do destinatário
                                    </div>

                                    <div className="nfe-destinatario-grid">

                                        <div className="nfe-destinatario-campo">
                                            <label>CEP *</label>
                                            <input
                                                value={destinatarioNfe.cep}
                                                onChange={e => atualizarDestinatarioNfe("cep", e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                placeholder="00000000"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo nfe-destinatario-largo">
                                            <label>Logradouro *</label>
                                            <input
                                                value={destinatarioNfe.logradouro}
                                                onChange={e => atualizarDestinatarioNfe("logradouro", e.target.value)}
                                                placeholder="Rua, avenida..."
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>Número *</label>
                                            <input
                                                value={destinatarioNfe.numero}
                                                onChange={e => atualizarDestinatarioNfe("numero", e.target.value)}
                                                placeholder="Número"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>Complemento</label>
                                            <input
                                                value={destinatarioNfe.complemento}
                                                onChange={e => atualizarDestinatarioNfe("complemento", e.target.value)}
                                                placeholder="Apartamento, sala..."
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>Bairro *</label>
                                            <input
                                                value={destinatarioNfe.bairro}
                                                onChange={e => atualizarDestinatarioNfe("bairro", e.target.value)}
                                                placeholder="Bairro"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>Código IBGE do município *</label>
                                            <input
                                                value={destinatarioNfe.codigo_municipio}
                                                onChange={e => atualizarDestinatarioNfe("codigo_municipio", e.target.value.replace(/\D/g, "").slice(0, 7))}
                                                placeholder="7 dígitos"
                                                inputMode="numeric"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>Município *</label>
                                            <input
                                                value={destinatarioNfe.municipio}
                                                onChange={e => atualizarDestinatarioNfe("municipio", e.target.value)}
                                                placeholder="Cidade"
                                            />
                                        </div>

                                        <div className="nfe-destinatario-campo">
                                            <label>UF *</label>
                                            <input
                                                value={destinatarioNfe.uf}
                                                onChange={e => atualizarDestinatarioNfe("uf", e.target.value.toUpperCase().slice(0, 2))}
                                                placeholder="SP"
                                                maxLength={2}
                                            />
                                        </div>

                                    </div>
                                </div>
                            )}

                            {alertaNfce.tipo === "processando" && (

                                <span className="nfce-alerta-processando-texto-premium">
                                    Não feche esta tela durante o processamento.
                                </span>

                            )}

                        </div>

                        {/*
                         * =====================================================
                         * CONFIRMAÇÃO
                         * =====================================================
                         */}
                        {alertaNfce.tipo === "documento" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    disabled={salvandoDocumentoNfce}
                                    onClick={continuarSemDocumentoNfce}
                                >
                                    Não
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-confirmar-premium"
                                    disabled={
                                        salvandoDocumentoNfce ||
                                        !documentoNfceCompleto
                                    }
                                    title={
                                        !documentoNfceCompleto
                                            ? "Os dados informados estão incorretos."
                                            : ""
                                    }
                                    onClick={salvarDocumentoNfce}
                                >
                                    {salvandoDocumentoNfce
                                        ? "Salvando..."
                                        : "Sim"}
                                </button>

                            </div>

                        )}
                        {alertaNfce.tipo === "destinatario_nfe" && (
                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    onClick={fecharAlertaNfce}
                                    disabled={salvandoDestinatarioNfe}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-confirmar-premium"
                                    onClick={salvarDestinatarioNfe}
                                    disabled={salvandoDestinatarioNfe}
                                >
                                    {salvandoDestinatarioNfe ? "Validando..." : "Continuar"}
                                </button>

                            </div>
                        )}

                        {alertaNfce.tipo === "confirmacao" && (
                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-confirmar-premium"
                                    onClick={confirmarEmissaoNfce}
                                >
                                    {alertaNfce.modeloFiscal === "55"
                                        ? "Emitir NF-e"
                                        : "Emitir NFC-e"}
                                </button>

                            </div>
                        )}
                        {/*
                         * =====================================================
                         * SUCESSO
                         * =====================================================
                         */}

                        {alertaNfce.tipo === "sucesso" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-sucesso-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Entendido
                                </button>

                            </div>

                        )}
                        {/*
 * =====================================================
 * FISCAL PENDENTE
 * =====================================================
 */}

                        {alertaNfce.tipo === "fiscal_pendente" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Fechar
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-confirmar-premium"
                                    onClick={() => {

                                        const produtos =
                                            alertaNfce.produtos || [];

                                        const vendaId =
                                            alertaNfce.vendaId;

                                        setAlertaNfce(null);

                                        window.dispatchEvent(
                                            new CustomEvent(
                                                "abrir-fiscal-massa",
                                                {
                                                    detail: {
                                                        produtos,
                                                        vendaId
                                                    }
                                                }
                                            )
                                        );

                                    }}
                                >
                                    Cadastrar dados fiscais
                                </button>

                            </div>

                        )}
                        {/*
                         * =====================================================
                         * ERRO
                         * =====================================================
                         */}

                        {alertaNfce.tipo === "erro" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Fechar
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-erro-premium"
                                    onClick={tentarNovamenteNfce}
                                >
                                    Tentar novamente
                                </button>

                            </div>

                        )}

                        {/*
                         * =====================================================
                         * AVISO
                         * =====================================================
                         */}

                        {alertaNfce.tipo === "aviso" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-principal-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Entendido
                                </button>

                            </div>

                        )}

                    </div>

                </div>,

                document.body

            )}

        </div>

    );
}