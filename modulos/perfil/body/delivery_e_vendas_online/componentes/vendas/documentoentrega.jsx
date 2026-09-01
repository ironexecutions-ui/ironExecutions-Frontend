import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    API_URL
} from "../../../../../../config";

import "./documentoentrega.css";


export default function DocumentoEntrega({
    pedido
}) {

    // ========================================================
    // ESTADOS
    // ========================================================

    const [
        carregando,
        setCarregando
    ] = useState(false);

    const [
        gerando,
        setGerando
    ] = useState(false);

    const [
        dados,
        setDados
    ] = useState(null);

    const [
        erro,
        setErro
    ] = useState("");

    const [
        erroGeracao,
        setErroGeracao
    ] = useState("");

    const [
        mensagem,
        setMensagem
    ] = useState("");

    const [
        formularioDocumentoAberto,
        setFormularioDocumentoAberto
    ] = useState(false);

    const [
        tipoDocumento,
        setTipoDocumento
    ] = useState("");

    const [
        chaveNota,
        setChaveNota
    ] = useState("");

    const [
        inscricaoEstadual,
        setInscricaoEstadual
    ] = useState("");

    const [
        cnae,
        setCnae
    ] = useState("");

    const [
        agenciaId,
        setAgenciaId
    ] = useState("");

    const [
        agencias,
        setAgencias
    ] = useState([]);

    const [
        carregandoAgencias,
        setCarregandoAgencias
    ] = useState(false);

    const [
        erroAgencias,
        setErroAgencias
    ] = useState("");

    const [
        agenciaObrigatoria,
        setAgenciaObrigatoria
    ] = useState(false);


    // ========================================================
    // TOKEN
    // ========================================================

    const buscarToken = () => {

        return localStorage.getItem(
            "token"
        );

    };


    // ========================================================
    // FORMATAR DINHEIRO
    // ========================================================

    const formatarDinheiro = (
        valor
    ) => {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    };


    // ========================================================
    // EXTRAIR ERRO DA API
    // ========================================================

    // ========================================================
    // EXTRAIR ERRO DA API
    // ========================================================

    const extrairErroApi = (
        respostaDados,
        fallback
    ) => {

        const detail =
            respostaDados?.detail;


        // ====================================================
        // PERSONALIZAR SALDO INSUFICIENTE
        // ====================================================

        const mensagemSaldoInsuficiente = () => {

            const protocolo =
                pedido?.id
                    ?
                    `#${pedido.id}`
                    :
                    "do pedido";

            return (
                `O pagamento desta entrega ainda precisa ser confirmado. ` +
                `Antes de entrar em contato com o suporte, confira o e-mail ` +
                `cadastrado no sistema e procure por uma mensagem com o assunto ` +
                `"Pagamento da entrega - Protocolo ${protocolo}". ` +
                `Nesse e-mail estão as informações e o PIX para realizar o pagamento da entrega. ` +
                `Caso não tenha recebido esse e-mail, entre em contato com o suporte pelo ` +
                `WhatsApp (11) 91854-7818.`
            );

        };


        // ====================================================
        // IDENTIFICAR ERRO DE SALDO
        // ====================================================

        const verificarSaldoInsuficiente = (
            valor
        ) => {

            if (!valor) {
                return false;
            }

            let conteudo = "";

            if (
                typeof valor === "string"
            ) {

                conteudo =
                    valor;

            } else {

                try {

                    conteudo =
                        JSON.stringify(
                            valor
                        );

                } catch {

                    return false;

                }

            }

            conteudo =
                conteudo
                    .toLowerCase();

            return (
                conteudo.includes(
                    "saldo"
                )
                &&
                (
                    conteudo.includes(
                        "insuficiente"
                    )
                    ||
                    conteudo.includes(
                        "insufficient"
                    )
                )
            );

        };


        // ====================================================
        // VERIFICAR TODA A RESPOSTA PRIMEIRO
        // ====================================================

        if (
            verificarSaldoInsuficiente(
                respostaDados
            )
        ) {

            return mensagemSaldoInsuficiente();

        }


        // ====================================================
        // DETAIL COMO STRING
        // ====================================================

        if (
            typeof detail === "string"
        ) {

            if (
                verificarSaldoInsuficiente(
                    detail
                )
            ) {

                return mensagemSaldoInsuficiente();

            }

            return detail;

        }


        // ====================================================
        // DETAIL COMO OBJETO
        // ====================================================

        if (
            detail &&
            typeof detail === "object"
        ) {

            const erroMelhorEnvio =
                detail.erro_melhor_envio;


            // ================================================
            // SALDO INSUFICIENTE
            // ================================================

            if (
                verificarSaldoInsuficiente(
                    erroMelhorEnvio
                )
            ) {

                return mensagemSaldoInsuficiente();

            }


            // ================================================
            // MENSAGEM DO BACKEND
            // ================================================

            if (
                typeof detail.mensagem ===
                "string"
            ) {

                if (
                    typeof erroMelhorEnvio ===
                    "string"
                ) {

                    return (
                        `${detail.mensagem} ` +
                        erroMelhorEnvio
                    );

                }

                return detail.mensagem;

            }


            // ================================================
            // OUTROS ERROS
            // ================================================

            try {

                return JSON.stringify(
                    detail
                );

            } catch {

                return fallback;

            }

        }


        // ====================================================
        // FALLBACK
        // ====================================================

        return (
            respostaDados?.message ||
            fallback
        );

    };


    // ========================================================
    // CONSULTAR DOCUMENTO
    // ========================================================

    const consultarDocumento = useCallback(
        async (
            silencioso = false
        ) => {

            if (
                !pedido?.id ||
                !pedido?.embalado
            ) {

                setDados(
                    null
                );

                return;

            }

            if (!silencioso) {

                setCarregando(
                    true
                );

            }

            setErro("");

            try {

                const token =
                    buscarToken();

                if (!token) {

                    throw new Error(
                        "Sessão não encontrada."
                    );

                }

                const resposta =
                    await fetch(
                        `${API_URL}/ironstore/configuracao/documento-entrega/${pedido.id}`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const respostaDados =
                    await resposta.json();

                if (!resposta.ok) {

                    throw new Error(
                        extrairErroApi(
                            respostaDados,
                            "Não foi possível verificar o documento."
                        )
                    );

                }

                setDados(
                    respostaDados
                );

                return respostaDados;

            } catch (
            erroRequisicao
            ) {

                console.error(
                    "Erro documento entrega:",
                    erroRequisicao
                );

                setErro(
                    erroRequisicao?.message ||
                    "Erro ao verificar documento."
                );

                return null;

            } finally {

                if (!silencioso) {

                    setCarregando(
                        false
                    );

                }

            }

        },
        [
            pedido?.id,
            pedido?.embalado
        ]
    );


    // ========================================================
    // CARREGAR
    // ========================================================

    useEffect(
        () => {

            consultarDocumento();

        },
        [
            consultarDocumento
        ]
    );


    // ========================================================
    // BUSCAR AGÊNCIAS DE POSTAGEM
    // ========================================================

    const buscarAgencias = async () => {

        if (!pedido?.id) {
            return;
        }

        setCarregandoAgencias(true);
        setErroAgencias("");

        try {

            const token =
                buscarToken();

            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/configuracao/documento-entrega/${pedido.id}/agencias`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const respostaDados =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    extrairErroApi(
                        respostaDados,
                        "Não foi possível buscar as unidades de postagem."
                    )
                );

            }

            const lista =
                Array.isArray(
                    respostaDados?.agencias
                )
                    ?
                    respostaDados.agencias
                    :
                    [];

            setAgencias(
                lista
            );

            setAgenciaObrigatoria(
                Boolean(
                    respostaDados
                        ?.agencia_obrigatoria
                )
            );

            if (
                lista.length === 1
                &&
                !agenciaId
            ) {

                setAgenciaId(
                    String(
                        lista[0].id
                    )
                );

            }

        } catch (
        erroRequisicao
        ) {

            console.error(
                "Erro ao buscar agências:",
                erroRequisicao
            );

            setAgencias([]);

            setErroAgencias(
                erroRequisicao?.message ||
                "Erro ao buscar unidades de postagem."
            );

        } finally {

            setCarregandoAgencias(
                false
            );

        }

    };


    // ========================================================
    // ABRIR ESCOLHA DO DOCUMENTO
    // ========================================================

    const abrirFormularioDocumento = () => {

        setErroGeracao("");
        setMensagem("");

        const tipoSalvo =
            dados?.documento
                ?.tipo_documento;

        if (
            tipoSalvo === "dce" ||
            tipoSalvo === "nota_fiscal"
        ) {

            setTipoDocumento(
                tipoSalvo
            );

        } else {

            setTipoDocumento("");

        }

        setChaveNota(
            dados?.documento
                ?.chave_documento ||
            ""
        );

        setFormularioDocumentoAberto(
            true
        );

        buscarAgencias();

    };


    // ========================================================
    // FECHAR MODAL
    // ========================================================




    // ========================================================
    // VALIDAR NOTA
    // ========================================================

    const validarChaveNota = () => {

        const chave =
            String(
                chaveNota || ""
            )
                .replace(
                    /\D/g,
                    ""
                );

        return chave;

    };


    // ========================================================
    // GERAR DOCUMENTO
    // ========================================================

    const gerarDocumento = async () => {

        if (!pedido?.id) {

            return;

        }

        setErroGeracao("");
        setMensagem("");

        if (!tipoDocumento) {

            setErroGeracao(
                "Escolha DC-e ou Nota Fiscal."
            );

            return;

        }

        const chaveLimpa =
            validarChaveNota();

        if (
            tipoDocumento ===
            "nota_fiscal"
            &&
            chaveLimpa.length !== 44
        ) {

            setErroGeracao(
                "A chave da Nota Fiscal deve possuir 44 dígitos."
            );

            return;

        }

        if (
            agenciaObrigatoria
            &&
            !String(
                agenciaId || ""
            ).trim()
        ) {

            setErroGeracao(
                "Selecione a unidade de postagem da transportadora."
            );

            return;

        }

        setGerando(
            true
        );

        try {

            const token =
                buscarToken();

            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }

            const body = {
                tipo_documento:
                    tipoDocumento
            };

            if (
                tipoDocumento ===
                "nota_fiscal"
            ) {

                body.chave_documento =
                    chaveLimpa;

                if (
                    String(
                        inscricaoEstadual ||
                        ""
                    ).trim()
                ) {

                    body.inscricao_estadual =
                        String(
                            inscricaoEstadual
                        ).trim();

                }

            }

            if (
                String(
                    cnae || ""
                ).trim()
            ) {

                body.cnae =
                    String(
                        cnae
                    ).replace(
                        /\D/g,
                        ""
                    );

            }

            if (
                String(
                    agenciaId || ""
                ).trim()
            ) {

                const agenciaNumero =
                    Number(
                        agenciaId
                    );

                if (
                    Number.isInteger(
                        agenciaNumero
                    )
                    &&
                    agenciaNumero > 0
                ) {

                    body.agencia_id =
                        agenciaNumero;

                }

            }

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/configuracao/documento-entrega/${pedido.id}/gerar`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );

            const respostaDados =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    extrairErroApi(
                        respostaDados,
                        "Não foi possível gerar o documento."
                    )
                );

            }

            if (
                respostaDados
                    ?.etiqueta_url
            ) {

                setMensagem(
                    "Documento gerado com sucesso."
                );

                setFormularioDocumentoAberto(
                    false
                );
                const atualizados =
                    await consultarDocumento(
                        true
                    );

                const url =
                    atualizados
                        ?.documento
                        ?.etiqueta_url
                    ||
                    respostaDados
                        ?.etiqueta_url;

                if (url) {

                    window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }

                return;

            }

            if (
                respostaDados
                    ?.processando
            ) {

                setMensagem(
                    respostaDados
                        ?.mensagem
                    ||
                    "A etiqueta está sendo processada."
                );

                await consultarDocumento(
                    true
                );

                return;

            }

            setMensagem(
                respostaDados
                    ?.mensagem
                ||
                "Operação realizada."
            );

            await consultarDocumento(
                true
            );

        } catch (
        erroRequisicao
        ) {

            console.error(
                "Erro ao gerar documento:",
                erroRequisicao
            );

            setErroGeracao(
                erroRequisicao
                    ?.message
                ||
                "Erro ao gerar documento."
            );

        } finally {

            setGerando(
                false
            );

        }

    };


    // ========================================================
    // CONTINUAR PROCESSAMENTO
    // ========================================================

    const continuarProcessamento = () => {

        const tipoSalvo =
            dados?.documento
                ?.tipo_documento;

        if (
            tipoSalvo === "dce" ||
            tipoSalvo === "nota_fiscal"
        ) {

            setTipoDocumento(
                tipoSalvo
            );

            setChaveNota(
                dados?.documento
                    ?.chave_documento ||
                ""
            );

        }

        setErroGeracao("");
        setMensagem("");
        setFormularioDocumentoAberto(
            true
        );

    };


    // ========================================================
    // NÃO EMBALADO
    // ========================================================

    if (!pedido?.embalado) {

        return null;

    }


    // ========================================================
    // CARREGANDO
    // ========================================================

    if (carregando) {

        return (
            <div className="ironstore-documento-entrega-carregando">

                <span className="ironstore-documento-entrega-spinner" />

                <span>
                    Verificando envio...
                </span>

            </div>
        );

    }


    // ========================================================
    // ERRO
    // ========================================================

    if (erro) {

        return (
            <div className="ironstore-documento-entrega-erro">

                <strong>
                    Documento indisponível
                </strong>

                <span>
                    {erro}
                </span>

                <button
                    type="button"
                    onClick={
                        consultarDocumento
                    }
                >
                    Verificar novamente
                </button>

            </div>
        );

    }


    // ========================================================
    // SEM DADOS
    // ========================================================

    if (!dados) {

        return null;

    }


    // ========================================================
    // DOCUMENTO JÁ EXISTE
    // ========================================================

    if (
        dados.etiqueta_existente &&
        dados.documento
            ?.etiqueta_url
    ) {

        return (
            <div className="ironstore-documento-entrega-pronto">

                <div className="ironstore-documento-entrega-pronto-info">

                    <span>
                        Documento de entrega
                    </span>

                    <strong>
                        Documento disponível
                    </strong>

                    {
                        dados.documento
                            ?.tipo_documento
                        &&
                        (
                            <small>
                                {
                                    dados.documento
                                        .tipo_documento ===
                                        "nota_fiscal"
                                        ?
                                        "Envio com Nota Fiscal"
                                        :
                                        "Envio com DC-e"
                                }
                            </small>
                        )
                    }

                    {
                        dados.documento
                            ?.codigo_rastreio
                        &&
                        (
                            <small>
                                Rastreio: {
                                    dados.documento
                                        .codigo_rastreio
                                }
                            </small>
                        )
                    }

                </div>

                <button
                    type="button"
                    onClick={() => {

                        window.open(
                            dados.documento
                                .etiqueta_url,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }}
                    className="ironstore-documento-entrega-abrir"
                >
                    Abrir documento
                </button>

            </div>
        );

    }


    // ========================================================
    // CAMPOS FALTANDO
    // ========================================================

    if (
        Array.isArray(
            dados.campos_faltando
        )
        &&
        dados.campos_faltando.length > 0
    ) {

        return (
            <div className="ironstore-documento-entrega-incompleto">

                <strong>
                    Dados incompletos
                </strong>

                <span>
                    Antes de gerar o documento,
                    confira os seguintes dados:
                </span>

                <div className="ironstore-documento-entrega-campos">

                    {
                        dados.campos_faltando.map(
                            campo => (

                                <span
                                    key={campo}
                                >
                                    {campo}
                                </span>

                            )
                        )
                    }

                </div>

            </div>
        );

    }


    // ========================================================
    // RENDER PRINCIPAL
    // ========================================================



    return (
        <div className="ironstore-documento-entrega-wrapper">

            <div className="ironstore-documento-entrega-area">

                <div className="ironstore-documento-entrega-cabecalho">

                    <div>

                        <span className="ironstore-documento-entrega-etiqueta">
                            Próxima etapa
                        </span>

                        <strong>
                            Gerar documento de entrega
                        </strong>

                        <p>
                            O pedido está embalado e
                            pronto para preparar o envio.
                        </p>

                    </div>

                    <div className="ironstore-documento-entrega-status">

                        {
                            dados.etiqueta_em_andamento
                                ?
                                "Processando"
                                :
                                "Pronto"
                        }

                    </div>

                </div>


                <div className="ironstore-documento-entrega-resumo">

                    <div>
                        <span>
                            Transportadora
                        </span>

                        <strong>
                            {
                                dados.frete
                                    ?.transportadora
                                ||
                                "Não informado"
                            }
                        </strong>
                    </div>


                    <div>
                        <span>
                            Serviço
                        </span>

                        <strong>
                            {
                                dados.frete
                                    ?.servico
                                ||
                                "Não informado"
                            }
                        </strong>
                    </div>


                    <div>
                        <span>
                            Frete
                        </span>

                        <strong>
                            {
                                formatarDinheiro(
                                    dados.frete
                                        ?.valor
                                )
                            }
                        </strong>
                    </div>


                    <div>
                        <span>
                            Destino
                        </span>

                        <strong>
                            {
                                dados.frete
                                    ?.cep_destino
                                ||
                                "Não informado"
                            }
                        </strong>
                    </div>

                </div>


                {
                    dados.etiqueta_em_andamento
                        ?
                        (
                            <div className="ironstore-documento-entrega-aviso">

                                <strong>
                                    Envio em processamento
                                </strong>

                                <span>
                                    O envio já foi criado.
                                    Continue para verificar
                                    e concluir a geração da
                                    etiqueta. Uma nova compra
                                    não será criada.
                                </span>

                            </div>
                        )
                        :
                        (
                            <div className="ironstore-documento-entrega-aviso">

                                <strong>
                                    Pedido pronto para envio
                                </strong>

                                <span>
                                    Escolha se este envio
                                    utilizará DC-e ou Nota
                                    Fiscal antes de gerar
                                    a etiqueta.
                                </span>

                            </div>
                        )
                }


                {
                    !formularioDocumentoAberto
                    &&
                    (
                        <button
                            type="button"
                            className="ironstore-documento-entrega-gerar"
                            onClick={
                                dados.etiqueta_em_andamento
                                    ?
                                    continuarProcessamento
                                    :
                                    abrirFormularioDocumento
                            }
                        >
                            {
                                dados.etiqueta_em_andamento
                                    ?
                                    "Continuar geração da etiqueta"
                                    :
                                    "Gerar documento de entrega"
                            }
                        </button>
                    )
                }

            </div>


            {
                formularioDocumentoAberto
                &&
                (
                    <section className="ironstore-documento-entrega-configuracao">

                        <div className="ironstore-documento-entrega-configuracao-topo">

                            <span className="ironstore-documento-entrega-configuracao-etiqueta">
                                Documento do envio
                            </span>

                            <h3>
                                Como este pedido será enviado?
                            </h3>

                            <p>
                                Escolha o documento fiscal
                                correspondente antes de gerar
                                a etiqueta de envio.
                            </p>

                        </div>


                        <div className="ironstore-documento-entrega-modal-opcoes">

                            <button
                                type="button"
                                className={
                                    `ironstore-documento-entrega-opcao ${tipoDocumento === "dce"
                                        ?
                                        "ironstore-documento-entrega-opcao-ativa"
                                        :
                                        ""
                                    }`
                                }
                                onClick={() => {

                                    if (gerando) {
                                        return;
                                    }

                                    setTipoDocumento(
                                        "dce"
                                    );

                                    setErroGeracao("");

                                }}
                            >

                                <span className="ironstore-documento-entrega-opcao-radio">
                                    {
                                        tipoDocumento === "dce"
                                        &&
                                        <i />
                                    }
                                </span>

                                <span className="ironstore-documento-entrega-opcao-conteudo">

                                    <strong>
                                        DC-e / Declaração de Conteúdo
                                    </strong>

                                    <small>
                                        Para envios legalmente
                                        dispensados de Nota Fiscal.
                                    </small>

                                </span>

                            </button>


                            <button
                                type="button"
                                className={
                                    `ironstore-documento-entrega-opcao ${tipoDocumento === "nota_fiscal"
                                        ?
                                        "ironstore-documento-entrega-opcao-ativa"
                                        :
                                        ""
                                    }`
                                }
                                onClick={() => {

                                    if (gerando) {
                                        return;
                                    }

                                    setTipoDocumento(
                                        "nota_fiscal"
                                    );

                                    setErroGeracao("");

                                }}
                            >

                                <span className="ironstore-documento-entrega-opcao-radio">
                                    {
                                        tipoDocumento === "nota_fiscal"
                                        &&
                                        <i />
                                    }
                                </span>

                                <span className="ironstore-documento-entrega-opcao-conteudo">

                                    <strong>
                                        Nota Fiscal
                                    </strong>

                                    <small>
                                        Utilize a chave de acesso
                                        da NF-e emitida para
                                        este pedido.
                                    </small>

                                </span>

                            </button>

                        </div>


                        {
                            tipoDocumento === "dce"
                            &&
                            (
                                <div className="ironstore-documento-entrega-dce-aviso">

                                    <strong>
                                        Declaração de Conteúdo
                                    </strong>

                                    <p>
                                        Utilize esta opção somente
                                        quando o envio estiver
                                        legalmente dispensado de
                                        Nota Fiscal.
                                    </p>

                                </div>
                            )
                        }


                        {
                            tipoDocumento === "nota_fiscal"
                            &&
                            (
                                <div className="ironstore-documento-entrega-fiscal">

                                    <label>

                                        <span>
                                            Chave da Nota Fiscal
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={60}
                                            value={
                                                chaveNota
                                            }
                                            onChange={
                                                evento => {

                                                    setChaveNota(
                                                        evento.target.value
                                                    );

                                                    setErroGeracao("");

                                                }
                                            }
                                            placeholder="44 dígitos da chave de acesso"
                                            disabled={
                                                gerando
                                            }
                                        />

                                        <small>
                                            {
                                                validarChaveNota()
                                                    .length
                                            }/44 dígitos
                                        </small>

                                    </label>


                                    <label>

                                        <span>
                                            Inscrição Estadual
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                inscricaoEstadual
                                            }
                                            onChange={
                                                evento => {

                                                    setInscricaoEstadual(
                                                        evento.target.value
                                                    );

                                                }
                                            }
                                            placeholder="Informe se aplicável"
                                            disabled={
                                                gerando
                                            }
                                        />

                                    </label>

                                </div>
                            )
                        }


                        <div className="ironstore-documento-entrega-dados-adicionais">

                            <label>

                                <span>
                                    CNAE
                                </span>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        cnae
                                    }
                                    onChange={
                                        evento => {

                                            setCnae(
                                                evento.target.value
                                            );

                                        }
                                    }
                                    placeholder="Informe quando necessário"
                                    disabled={
                                        gerando
                                    }
                                />

                            </label>


                            <label className="ironstore-documento-entrega-agencia-campo">

                                <span>
                                    Unidade de postagem

                                    <small>
                                        {
                                            agenciaObrigatoria
                                                ?
                                                "Obrigatória"
                                                :
                                                "Quando exigida"
                                        }
                                    </small>
                                </span>

                                {
                                    carregandoAgencias
                                        ?
                                        (
                                            <div className="ironstore-documento-entrega-agencia-carregando">
                                                <span className="ironstore-documento-entrega-spinner" />
                                                Buscando unidades da transportadora...
                                            </div>
                                        )
                                        :
                                        (
                                            <select
                                                value={
                                                    agenciaId
                                                }
                                                onChange={
                                                    evento => {

                                                        setAgenciaId(
                                                            evento.target.value
                                                        );

                                                        setErroGeracao("");

                                                    }
                                                }
                                                disabled={
                                                    gerando ||
                                                    agencias.length === 0
                                                }
                                            >
                                                <option value="">
                                                    {
                                                        agencias.length > 0
                                                            ?
                                                            "Selecione uma unidade"
                                                            :
                                                            "Nenhuma unidade encontrada"
                                                    }
                                                </option>

                                                {
                                                    agencias.map(
                                                        agencia => {

                                                            const local = [
                                                                agencia.endereco,
                                                                agencia.numero,
                                                                agencia.bairro,
                                                                agencia.cidade,
                                                                agencia.estado
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" - ");

                                                            return (
                                                                <option
                                                                    key={
                                                                        agencia.id
                                                                    }
                                                                    value={
                                                                        agencia.id
                                                                    }
                                                                >
                                                                    {
                                                                        `${agencia.nome}${local ? ` | ${local}` : ""}`
                                                                    }
                                                                </option>
                                                            );

                                                        }
                                                    )
                                                }
                                            </select>
                                        )
                                }

                                {
                                    erroAgencias
                                    &&
                                    (
                                        <small className="ironstore-documento-entrega-agencia-erro">
                                            {erroAgencias}
                                        </small>
                                    )
                                }

                                {
                                    !carregandoAgencias
                                    &&
                                    agenciaObrigatoria
                                    &&
                                    agencias.length === 0
                                    &&
                                    !erroAgencias
                                    &&
                                    (
                                        <small className="ironstore-documento-entrega-agencia-erro">
                                            Nenhuma unidade válida foi encontrada para esta transportadora na origem cadastrada.
                                        </small>
                                    )
                                }

                            </label>

                        </div>


                        {
                            erroGeracao
                            &&
                            (
                                <div className="ironstore-documento-entrega-modal-erro">

                                    <strong>
                                        Não foi possível continuar
                                    </strong>

                                    <span>
                                        {erroGeracao}
                                    </span>

                                </div>
                            )
                        }


                        {
                            mensagem
                            &&
                            (
                                <div className="ironstore-documento-entrega-modal-mensagem">
                                    <span>
                                        {mensagem}
                                    </span>
                                </div>
                            )
                        }


                        <div className="ironstore-documento-entrega-configuracao-acoes">

                            <button
                                type="button"
                                className="ironstore-documento-entrega-configuracao-cancelar"
                                onClick={() => {

                                    if (gerando) {
                                        return;
                                    }

                                    setFormularioDocumentoAberto(
                                        false
                                    );

                                    setErroGeracao("");
                                    setMensagem("");

                                }}
                                disabled={
                                    gerando
                                }
                            >
                                Cancelar
                            </button>


                            <button
                                type="button"
                                className="ironstore-documento-entrega-modal-confirmar"
                                onClick={
                                    gerarDocumento
                                }
                                disabled={
                                    gerando ||
                                    carregandoAgencias ||
                                    !tipoDocumento ||
                                    (
                                        agenciaObrigatoria &&
                                        !String(
                                            agenciaId || ""
                                        ).trim()
                                    )
                                }
                            >

                                {
                                    gerando
                                        ?
                                        (
                                            <>
                                                <span className="ironstore-documento-entrega-spinner" />
                                                Processando envio...
                                            </>
                                        )
                                        :
                                        "Gerar etiqueta de envio"
                                }

                            </button>

                        </div>

                    </section>
                )
            }

        </div>
    );

}