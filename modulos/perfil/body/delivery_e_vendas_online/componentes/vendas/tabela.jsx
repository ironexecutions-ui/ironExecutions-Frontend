import React, {
    useCallback,
    useEffect,
    useState
} from "react";
import { createPortal } from "react-dom";

import { API_URL } from "../../../../../../config";
import DocumentoEntrega from "./documentoentrega";
import "./tabela.css";


export default function Tabela() {

    // ========================================================
    // ESTADOS
    // ========================================================

    const [
        pedidos,
        setPedidos
    ] = useState([]);

    const [
        carregando,
        setCarregando
    ] = useState(true);

    const [
        erro,
        setErro
    ] = useState("");

    const [
        pedidoAberto,
        setPedidoAberto
    ] = useState(null);

    const [
        embalando,
        setEmbalando
    ] = useState(null);
    const [
        enviando,
        setEnviando
    ] = useState(null);


    const [
        entregando,
        setEntregando
    ] = useState(null);

    const [
        mensagemEnvio,
        setMensagemEnvio
    ] = useState("");
    const [
        codigoRastreioEnvio,
        setCodigoRastreioEnvio
    ] = useState("");
    // ========================================================
    // TOKEN
    // ========================================================


    const mensagensEnvioPadrao = [
        "Olá! Agradecemos pela preferência e pela confiança em nossa loja. Seu pedido já foi enviado!",

        "Muito obrigado por escolher nossa loja! Ficamos felizes com sua compra e desejamos que você aproveite muito seu pedido.",

        "Olá! Agradecemos de coração pela sua preferência. Seu pedido já está a caminho. Volte sempre!",

        "Obrigado por comprar conosco! Sua preferência é muito importante para nós. Esperamos atender você novamente em breve.",

        "Agradecemos pela confiança em nossa loja! Foi um prazer preparar seu pedido. Conte conosco sempre!",

        "Olá! Muito obrigado pela preferência. Ficamos felizes em fazer parte da sua compra e esperamos receber você novamente!",

        "Obrigado por escolher nossa loja entre tantas opções! Valorizamos muito sua confiança e preferência.",

        "Agradecemos imensamente pela sua compra e pela preferência. Esperamos que sua experiência com nossa loja seja excelente!",

        "Olá! Obrigado pela confiança e por comprar conosco. Sua preferência nos motiva a oferecer sempre o melhor atendimento!",

        "Muito obrigado pela preferência! Foi um prazer atender você. Esperamos que goste da sua compra e volte sempre!"
    ];

    const [indiceMensagemEnvio, setIndiceMensagemEnvio] = useState(0);

    const proximaMensagemEnvio = () => {
        const proximoIndice =
            (indiceMensagemEnvio + 1) % mensagensEnvioPadrao.length;

        setIndiceMensagemEnvio(proximoIndice);
        setMensagemEnvio(mensagensEnvioPadrao[proximoIndice]);
    };

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

        const numero = Number(
            valor || 0
        );

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    };


    // ========================================================
    // FORMATAR DATA
    // ========================================================

    const formatarData = (
        valor
    ) => {

        if (!valor) {
            return "Não informado";
        }

        const texto = String(
            valor
        );

        const partes = texto.split(
            "-"
        );

        if (partes.length !== 3) {
            return texto;
        }

        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
        );

    };

    const obterProdutosPedido = (
        pedido
    ) => {

        const valor = pedido?.produtos;

        if (Array.isArray(valor)) {
            return valor;
        }

        if (typeof valor === "string") {

            try {

                const produtos = JSON.parse(
                    valor
                );

                return Array.isArray(produtos)
                    ? produtos
                    : [];

            } catch {

                return [];

            }

        }

        return [];

    };
    // ========================================================
    // BUSCAR PEDIDOS
    // ========================================================

    const buscarPedidos = useCallback(
        async (
            silencioso = false
        ) => {

            if (!silencioso) {
                setCarregando(true);
            }

            setErro("");

            try {

                const token = buscarToken();

                if (!token) {

                    throw new Error(
                        "Sessão não encontrada."
                    );

                }

                const resposta = await fetch(
                    `${API_URL}/ironstore/configuracao/pedidos`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {

                    throw new Error(
                        dados?.detail ||
                        "Não foi possível carregar os pedidos."
                    );

                }

                setPedidos(
                    Array.isArray(
                        dados?.pedidos
                    )
                        ? dados.pedidos
                        : []
                );

            } catch (erroRequisicao) {

                console.error(
                    "Erro ao buscar pedidos:",
                    erroRequisicao
                );

                setErro(
                    erroRequisicao?.message ||
                    "Erro ao carregar pedidos."
                );

            } finally {

                if (!silencioso) {
                    setCarregando(false);
                }

            }

        },
        []
    );


    // ========================================================
    // CARREGAR
    // ========================================================

    useEffect(
        () => {

            buscarPedidos();

        },
        [
            buscarPedidos
        ]
    );


    // ========================================================
    // ABRIR DETALHES
    // ========================================================

    const abrirPedido = (
        pedido
    ) => {

        setPedidoAberto(
            pedido
        );

        const indiceAleatorio = Math.floor(
            Math.random() * mensagensEnvioPadrao.length
        );

        setIndiceMensagemEnvio(indiceAleatorio);

        setMensagemEnvio(
            pedido?.protocolo?.mensagem ||
            mensagensEnvioPadrao[indiceAleatorio]
        );
        setCodigoRastreioEnvio(
            String(
                pedido?.protocolo?.codigo_rastreio ||
                pedido?.frete?.codigo_rastreio ||
                ""
            ).toUpperCase()
        );
    };


    // ========================================================
    // FECHAR DETALHES
    // ========================================================

    const fecharPedido = () => {

        if (embalando) {
            return;
        }

        setPedidoAberto(
            null
        );

    };


    // ========================================================
    // EMBALAR
    // ========================================================

    const marcarComoEmbalado = async (
        pedido
    ) => {

        if (
            !pedido ||
            pedido.embalado
        ) {
            return;
        }

        if (
            pedido.inconsistencia_frete
        ) {

            setErro(
                pedido.motivo_inconsistencia ||
                "Existe uma inconsistência no frete."
            );

            return;
        }

        setEmbalando(
            pedido.id
        );

        setErro("");

        try {

            const token = buscarToken();

            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }

            const resposta = await fetch(
                `${API_URL}/ironstore/configuracao/pedidos/${pedido.id}/embalar`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    dados?.detail ||
                    "Não foi possível embalar o pedido."
                );

            }

            // =================================================
            // ATUALIZAR LOCALMENTE
            // =================================================

            setPedidos(
                atuais =>
                    atuais.map(
                        item =>
                            item.id === pedido.id
                                ? {
                                    ...item,
                                    embalado: true,
                                    protocolo: {
                                        ...(item.protocolo || {}),
                                        protocolo:
                                            pedido.id,
                                        embalado:
                                            "1",
                                        data_embalado:
                                            dados.data_embalado,
                                        hora_embalado:
                                            dados.hora_embalado
                                    }
                                }
                                : item
                    )
            );

            setPedidoAberto(
                atual => {

                    if (
                        !atual ||
                        atual.id !== pedido.id
                    ) {
                        return atual;
                    }

                    return {
                        ...atual,

                        embalado:
                            true,

                        protocolo: {
                            ...(atual.protocolo || {}),

                            protocolo:
                                pedido.id,

                            embalado:
                                "1",

                            data_embalado:
                                dados.data_embalado,

                            hora_embalado:
                                dados.hora_embalado
                        }
                    };

                }
            );

        } catch (erroRequisicao) {

            console.error(
                "Erro ao embalar pedido:",
                erroRequisicao
            );

            setErro(
                erroRequisicao?.message ||
                "Erro ao atualizar pedido."
            );

        } finally {

            setEmbalando(
                null
            );

        }

    };


    const marcarComoEnviado = async (pedido) => {

        if (
            !pedido ||
            !pedido.embalado ||
            enviando === pedido.id
        ) {
            return;
        }

        setEnviando(pedido.id);
        setErro("");

        try {

            const token = buscarToken();

            if (!token) {
                throw new Error(
                    "Sessão não encontrada."
                );
            }

            const resposta = await fetch(
                `${API_URL}/ironstore/configuracao/pedidos/${pedido.id}/enviar`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        mensagem: mensagemEnvio.trim(),
                        codigo_rastreio: codigoRastreioEnvio.trim().toUpperCase()
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados?.detail ||
                    "Não foi possível marcar o pedido como enviado."
                );
            }

            // =====================================================
            // ATUALIZAR LISTA
            // =====================================================

            setPedidos(
                atuais =>
                    atuais.map(
                        item =>
                            item.id === pedido.id
                                ? {
                                    ...item,

                                    embalado: false,
                                    enviado: true,

                                    protocolo: {
                                        ...(item.protocolo || {}),

                                        embalado: null,
                                        enviado: "1",

                                        codigo_rastreio:
                                            dados.codigo_rastreio,

                                        mensagem:
                                            dados.mensagem_envio,

                                        data_enviado:
                                            dados.data_enviado,

                                        hora_enviado:
                                            dados.hora_enviado
                                    }
                                }
                                : item
                    )
            );

            // =====================================================
            // ATUALIZAR PEDIDO ABERTO
            // =====================================================

            setPedidoAberto(
                atual => {

                    if (
                        !atual ||
                        atual.id !== pedido.id
                    ) {
                        return atual;
                    }

                    return {
                        ...atual,

                        embalado: false,
                        enviado: true,

                        protocolo: {
                            ...(atual.protocolo || {}),

                            embalado: null,
                            enviado: "1",

                            codigo_rastreio:
                                dados.codigo_rastreio,

                            mensagem:
                                dados.mensagem_envio,

                            data_enviado:
                                dados.data_enviado,

                            hora_enviado:
                                dados.hora_enviado
                        }
                    };
                }
            );

            // Mantém o estado da mensagem sincronizado
            setMensagemEnvio(
                dados.mensagem_envio || ""
            );

        } catch (erroRequisicao) {

            console.error(
                "Erro ao enviar pedido:",
                erroRequisicao
            );

            setErro(
                erroRequisicao?.message ||
                "Erro ao marcar pedido como enviado."
            );

        } finally {

            setEnviando(null);

        }

    };
    const marcarComoEntregue = async (pedido) => {

        if (
            !pedido ||
            !pedido.enviado ||
            pedido.entregue ||
            entregando === pedido.id
        ) {
            return;
        }

        setEntregando(
            pedido.id
        );

        setErro("");

        try {

            const token = buscarToken();

            if (!token) {
                throw new Error(
                    "Sessão não encontrada."
                );
            }

            const resposta = await fetch(
                `${API_URL}/ironstore/configuracao/pedidos/${pedido.id}/entregar`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados?.detail ||
                    "Não foi possível marcar o pedido como entregue."
                );
            }

            // =====================================================
            // ATUALIZAR LISTA
            // =====================================================

            setPedidos(
                atuais =>
                    atuais.map(
                        item =>
                            item.id === pedido.id
                                ? {
                                    ...item,

                                    embalado: false,
                                    enviado: false,
                                    entregue: true,

                                    protocolo: {
                                        ...(item.protocolo || {}),

                                        embalado: null,
                                        enviado: null,
                                        entregue: "1",

                                        data_entregue:
                                            dados.data_entregue,

                                        hora_entregue:
                                            dados.hora_entregue
                                    },

                                    frete: {
                                        ...(item.frete || {}),

                                        data_entrega:
                                            dados.data_entregue
                                    }
                                }
                                : item
                    )
            );

            // =====================================================
            // ATUALIZAR MODAL
            // =====================================================

            setPedidoAberto(
                atual => {

                    if (
                        !atual ||
                        atual.id !== pedido.id
                    ) {
                        return atual;
                    }

                    return {
                        ...atual,

                        embalado: false,
                        enviado: false,
                        entregue: true,

                        protocolo: {
                            ...(atual.protocolo || {}),

                            embalado: null,
                            enviado: null,
                            entregue: "1",

                            data_entregue:
                                dados.data_entregue,

                            hora_entregue:
                                dados.hora_entregue
                        },

                        frete: {
                            ...(atual.frete || {}),

                            data_entrega:
                                dados.data_entregue
                        }
                    };
                }
            );

        } catch (erroRequisicao) {

            console.error(
                "Erro ao entregar pedido:",
                erroRequisicao
            );

            setErro(
                erroRequisicao?.message ||
                "Erro ao marcar pedido como entregue."
            );

        } finally {

            setEntregando(
                null
            );

        }

    };




    // ========================================================
    // CARREGANDO
    // ========================================================

    if (carregando) {

        return (
            <section className="ironstore-pedidos-operacao-area">

                <div className="ironstore-pedidos-operacao-carregando">

                    <span className="ironstore-pedidos-operacao-spinner" />

                    <strong>
                        Carregando pedidos
                    </strong>

                    <span>
                        Consultando as vendas da IronStore.
                    </span>

                </div>

            </section>
        );

    }


    // ========================================================
    // RETURN
    // ========================================================

    return (
        <section className="ironstore-pedidos-operacao-area">

            {/* ================================================
                CABEÇALHO
            ================================================= */}

            <header className="ironstore-pedidos-operacao-cabecalho">

                <div className="ironstore-pedidos-operacao-titulos">

                    <span className="ironstore-pedidos-operacao-etiqueta">
                        Operação
                    </span>

                    <h1 className="ironstore-pedidos-operacao-titulo">
                        Pedidos online
                    </h1>

                    <p className="ironstore-pedidos-operacao-descricao">
                        Acompanhe os pedidos pagos, confira
                        os dados de entrega e prepare os
                        produtos para envio.
                    </p>

                </div>

                <div className="ironstore-pedidos-operacao-resumo">

                    <span>
                        Pedidos
                    </span>

                    <strong>
                        {pedidos.length}
                    </strong>

                </div>

            </header>


            {/* ================================================
                ERRO
            ================================================= */}

            {erro && (

                <div className="ironstore-pedidos-operacao-erro">
                    {erro}
                </div>

            )}


            {/* ================================================
                VAZIO
            ================================================= */}

            {pedidos.length === 0 ? (

                <div className="ironstore-pedidos-operacao-vazio">

                    <strong>
                        Nenhum pedido pago
                    </strong>

                    <span>
                        Os novos pedidos da loja aparecerão
                        aqui depois da confirmação do pagamento.
                    </span>

                </div>

            ) : (

                <div className="ironstore-pedidos-operacao-tabela-container">

                    <table className="ironstore-pedidos-operacao-tabela">

                        <thead>

                            <tr>

                                <th>
                                    Pedido
                                </th>

                                <th>
                                    Cliente
                                </th>

                                <th>
                                    Data
                                </th>

                                <th>
                                    Pagamento
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Frete
                                </th>

                                <th>
                                    Preparação
                                </th>

                                <th />

                            </tr>

                        </thead>

                        <tbody>

                            {pedidos.map(
                                pedido => (

                                    <tr
                                        key={pedido.id}

                                        onClick={() =>
                                            abrirPedido(
                                                pedido
                                            )
                                        }

                                        className={
                                            pedido.inconsistencia_frete
                                                ? "ironstore-pedidos-operacao-linha ironstore-pedidos-operacao-linha-alerta"
                                                : "ironstore-pedidos-operacao-linha"
                                        }
                                    >

                                        <td>

                                            <div className="ironstore-pedidos-operacao-pedido">

                                                <strong>
                                                    #{pedido.id}
                                                </strong>

                                                <span>
                                                    {
                                                        pedido.codigo ||
                                                        "Sem código"
                                                    }
                                                </span>

                                            </div>

                                        </td>

                                        <td>

                                            <div className="ironstore-pedidos-operacao-cliente">

                                                <strong>
                                                    {
                                                        pedido.nome_cliente ||
                                                        "Cliente não identificado"
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        pedido.cliente?.email ||
                                                        "E-mail não informado"
                                                    }
                                                </span>

                                            </div>

                                        </td>

                                        <td>
                                            {formatarData(
                                                pedido.data
                                            )}
                                        </td>

                                        <td>

                                            <span className="ironstore-pedidos-operacao-pago">
                                                Pago
                                            </span>

                                        </td>

                                        <td>

                                            <strong>
                                                {formatarDinheiro(
                                                    pedido.valor_pago
                                                )}
                                            </strong>

                                        </td>

                                        <td>

                                            {pedido.inconsistencia_frete ? (

                                                <span className="ironstore-pedidos-operacao-inconsistencia">
                                                    Inconsistência
                                                </span>

                                            ) : (

                                                <div className="ironstore-pedidos-operacao-frete-ok">

                                                    <strong>
                                                        {formatarDinheiro(
                                                            pedido.frete?.valor_frete
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {
                                                            pedido.frete?.transportadora ||
                                                            "Frete pago"
                                                        }
                                                    </span>

                                                </div>

                                            )}

                                        </td>

                                        <td>

                                            {pedido.entregue ? (

                                                <span className="ironstore-pedidos-operacao-entregue">
                                                    Entregue
                                                </span>

                                            ) : pedido.enviado ? (

                                                <span className="ironstore-pedidos-operacao-enviado">
                                                    Enviado
                                                </span>

                                            ) : pedido.embalado ? (

                                                <span className="ironstore-pedidos-operacao-embalado">
                                                    Embalado
                                                </span>

                                            ) : (

                                                <span className="ironstore-pedidos-operacao-pendente">
                                                    A embalar
                                                </span>

                                            )}

                                        </td>

                                        <td>

                                            <button
                                                type="button"

                                                className="ironstore-pedidos-operacao-detalhes"

                                                onClick={evento => {

                                                    evento.stopPropagation();

                                                    abrirPedido(
                                                        pedido
                                                    );

                                                }}
                                            >
                                                Ver pedido
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* ================================================
                DETALHES
            ================================================= */}

            {pedidoAberto && createPortal(

                <div
                    className="ironstore-pedidos-operacao-modal-fundo"

                    onClick={
                        fecharPedido
                    }
                >

                    <article
                        className="ironstore-pedidos-operacao-modal"

                        onClick={
                            evento =>
                                evento.stopPropagation()
                        }
                    >

                        {/* ====================================
                            MODAL HEADER
                        ===================================== */}

                        <header className="ironstore-pedidos-operacao-modal-cabecalho">

                            <div>

                                <span>
                                    Pedido
                                </span>

                                <h2>
                                    #{pedidoAberto.id}
                                </h2>

                            </div>

                            <button
                                type="button"

                                onClick={
                                    fecharPedido
                                }

                                className="ironstore-pedidos-operacao-modal-fechar"
                            >
                                ×
                            </button>

                        </header>


                        {/* ====================================
                            STATUS
                        ===================================== */}

                        <div className="ironstore-pedidos-operacao-status-grid">

                            <div className="ironstore-pedidos-operacao-status-card">

                                <span>
                                    Pagamento
                                </span>

                                <strong>
                                    Pago
                                </strong>

                            </div>

                            <div className="ironstore-pedidos-operacao-status-card">

                                <span>
                                    Preparação
                                </span>

                                <strong>
                                    {
                                        pedidoAberto.entregue
                                            ? "Entregue"
                                            : pedidoAberto.enviado
                                                ? "Enviado"
                                                : pedidoAberto.embalado
                                                    ? "Embalado"
                                                    : "Aguardando embalagem"
                                    }
                                </strong>

                            </div>

                            <div className="ironstore-pedidos-operacao-status-card">

                                <span>
                                    Frete
                                </span>

                                <strong>
                                    {
                                        pedidoAberto.frete_pago
                                            ? "Pago"
                                            : "Inconsistente"
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* ====================================
                            CLIENTE
                        ===================================== */}

                        <section className="ironstore-pedidos-operacao-modal-secao">

                            <div className="ironstore-pedidos-operacao-modal-secao-titulo">

                                <span>
                                    Cliente
                                </span>

                                <h3>
                                    Dados para entrega
                                </h3>

                            </div>

                            <div className="ironstore-pedidos-operacao-dados-grid">

                                <div>
                                    <span>
                                        Nome
                                    </span>

                                    <strong>
                                        {
                                            pedidoAberto.nome_cliente ||
                                            "Não informado"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        E-mail
                                    </span>

                                    <strong>
                                        {
                                            pedidoAberto.cliente?.email ||
                                            "Não informado"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        WhatsApp
                                    </span>

                                    <strong>
                                        {
                                            pedidoAberto.cliente?.whatsapp ||
                                            "Não informado"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        CPF/CNPJ
                                    </span>

                                    <strong>
                                        {
                                            pedidoAberto.cliente?.cpf_cnpj ||
                                            "Não informado"
                                        }
                                    </strong>
                                </div>

                            </div>

                        </section>


                        {/* ====================================
                            ENDEREÇO
                        ===================================== */}

                        <section className="ironstore-pedidos-operacao-modal-secao">

                            <div className="ironstore-pedidos-operacao-modal-secao-titulo">

                                <span>
                                    Destino
                                </span>

                                <h3>
                                    Endereço de entrega
                                </h3>

                            </div>

                            <div className="ironstore-pedidos-operacao-endereco">

                                <strong>
                                    {
                                        pedidoAberto.cliente?.rua_avenida ||
                                        "Endereço não informado"
                                    }
                                    {
                                        pedidoAberto.cliente?.numero
                                            ? `, ${pedidoAberto.cliente.numero}`
                                            : ""
                                    }
                                </strong>

                                <span>
                                    {
                                        pedidoAberto.cliente?.bairro ||
                                        ""
                                    }

                                    {
                                        pedidoAberto.cliente?.cidade
                                            ? ` • ${pedidoAberto.cliente.cidade}`
                                            : ""
                                    }
                                </span>

                                <span>
                                    CEP: {
                                        pedidoAberto.cliente?.cep ||
                                        "Não informado"
                                    }
                                </span>

                            </div>

                        </section>


                        {/* ====================================
                            FRETE
                        ===================================== */}

                        <section className="ironstore-pedidos-operacao-modal-secao">

                            <div className="ironstore-pedidos-operacao-modal-secao-titulo">

                                <span>
                                    Logística
                                </span>

                                <h3>
                                    Frete
                                </h3>

                            </div>

                            {pedidoAberto.inconsistencia_frete ? (

                                <div className="ironstore-pedidos-operacao-frete-alerta">

                                    <strong>
                                        Inconsistência no frete
                                    </strong>

                                    <span>
                                        {
                                            pedidoAberto.motivo_inconsistencia
                                        }
                                    </span>

                                </div>

                            ) : (

                                <div className="ironstore-pedidos-operacao-frete-detalhes">

                                    <div>
                                        <span>
                                            Valor
                                        </span>

                                        <strong>
                                            {formatarDinheiro(
                                                pedidoAberto.frete?.valor_frete
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Transportadora
                                        </span>

                                        <strong>
                                            {
                                                pedidoAberto.frete?.transportadora ||
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
                                                pedidoAberto.frete?.servico ||
                                                "Não informado"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Prazo
                                        </span>

                                        <strong>
                                            {
                                                pedidoAberto.frete?.prazo_dias
                                                    ? `${pedidoAberto.frete.prazo_dias} dias`
                                                    : "Não informado"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            CEP origem
                                        </span>

                                        <strong>
                                            {
                                                pedidoAberto.frete?.cep_origem ||
                                                "Não informado"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            CEP destino
                                        </span>

                                        <strong>
                                            {
                                                pedidoAberto.frete?.cep_destino ||
                                                "Não informado"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            )}

                        </section>
                        {/* ====================================
    RESUMO DA VENDA
===================================== */}

                        <section className="ironstore-pedidos-operacao-resumo">

                            <div className="ironstore-pedidos-operacao-secao-titulo">

                                <span>
                                    Resumo da venda
                                </span>

                                <strong>
                                    #{pedidoAberto.codigo || pedidoAberto.id}
                                </strong>

                            </div>

                            <div className="ironstore-pedidos-operacao-resumo-info">

                                <div>

                                    <span>
                                        Data da compra
                                    </span>

                                    <strong>
                                        {formatarData(
                                            pedidoAberto.data ||
                                            pedidoAberto.created_at
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Pagamento
                                    </span>

                                    <strong>
                                        {pedidoAberto.pagamento ||
                                            "Não informado"}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Total pago
                                    </span>

                                    <strong>
                                        {formatarDinheiro(
                                            pedidoAberto.valor_pago
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <div className="ironstore-pedidos-operacao-produtos">

                                <strong>
                                    Produtos comprados
                                </strong>

                                {obterProdutosPedido(
                                    pedidoAberto
                                ).length > 0 ? (

                                    obterProdutosPedido(
                                        pedidoAberto
                                    ).map(
                                        (produto, indice) => {

                                            const quantidade =
                                                Number(
                                                    produto?.quantidade || 1
                                                );

                                            const preco =
                                                Number(
                                                    produto?.preco_unitario ||
                                                    produto?.preco ||
                                                    0
                                                );

                                            const subtotal =
                                                Number(
                                                    produto?.subtotal ||
                                                    quantidade * preco
                                                );

                                            return (

                                                <div
                                                    key={
                                                        produto?.produto_id ||
                                                        produto?.id ||
                                                        indice
                                                    }
                                                    className="ironstore-pedidos-operacao-produto"
                                                >

                                                    <div>

                                                        <strong>
                                                            {produto?.nome ||
                                                                "Produto"}
                                                        </strong>

                                                        <span>
                                                            Quantidade:{" "}
                                                            {quantidade}
                                                        </span>

                                                    </div>

                                                    <div>

                                                        <span>
                                                            {formatarDinheiro(
                                                                preco
                                                            )} cada
                                                        </span>

                                                        <strong>
                                                            {formatarDinheiro(
                                                                subtotal
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )

                                ) : (

                                    <span>
                                        Produtos da venda não informados.
                                    </span>

                                )}

                            </div>

                        </section>
                        {/* ====================================
    DOCUMENTO DE ENTREGA
===================================== */}

                        <section className="ironstore-pedidos-operacao-documento">

                            <div className="ironstore-pedidos-operacao-secao-titulo">

                                <span>
                                    Documento de entrega
                                </span>

                                <strong>
                                    {pedidoAberto.frete?.etiqueta_url
                                        ? "Emitido"
                                        : "Não emitido"}
                                </strong>

                            </div>

                            {pedidoAberto.frete?.etiqueta_url ? (

                                <div className="ironstore-pedidos-operacao-frete-detalhes">

                                    <div>

                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            Documento emitido
                                        </strong>

                                    </div>

                                    {pedidoAberto.frete?.codigo_rastreio && (

                                        <div>

                                            <span>
                                                Código de rastreio
                                            </span>

                                            <strong>
                                                {pedidoAberto.frete.codigo_rastreio}
                                            </strong>

                                        </div>

                                    )}

                                    {pedidoAberto.frete?.melhor_envio_protocol && (

                                        <div>

                                            <span>
                                                Protocolo Melhor Envio
                                            </span>

                                            <strong>
                                                {pedidoAberto.frete.melhor_envio_protocol}
                                            </strong>

                                        </div>

                                    )}

                                    <a
                                        href={
                                            pedidoAberto.frete.etiqueta_url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ironstore-pedidos-operacao-detalhes"
                                        onClick={evento =>
                                            evento.stopPropagation()
                                        }
                                    >
                                        Abrir documento de entrega
                                    </a>

                                </div>

                            ) : (

                                <div className="ironstore-pedidos-operacao-frete-alerta">

                                    <strong>
                                        Documento ainda não emitido
                                    </strong>

                                    <span>
                                        O documento de entrega aparecerá aqui assim que for emitido.
                                    </span>

                                </div>

                            )}

                        </section>
                        {/* ====================================
                            AÇÕES
                        ===================================== */}

                        <footer className="ironstore-pedidos-operacao-modal-acoes">

                            {pedidoAberto.entregue ? (

                                <div className="ironstore-pedidos-operacao-entregue-info">

                                    <strong>
                                        Pedido entregue
                                    </strong>

                                    <span>
                                        Entregue em{" "}
                                        {formatarData(
                                            pedidoAberto.protocolo?.data_entregue
                                        )}

                                        {pedidoAberto.protocolo?.hora_entregue
                                            ? ` às ${pedidoAberto.protocolo.hora_entregue}`
                                            : ""
                                        }
                                    </span>
                                    {(
                                        pedidoAberto.protocolo?.codigo_rastreio ||
                                        pedidoAberto.frete?.codigo_rastreio
                                    ) && (

                                            <span>

                                                Código de rastreio:{" "}

                                                {
                                                    pedidoAberto.protocolo?.codigo_rastreio ||
                                                    pedidoAberto.frete?.codigo_rastreio
                                                }

                                            </span>

                                        )}

                                </div>

                            ) : pedidoAberto.enviado ? (

                                <>
                                    <div className="ironstore-pedidos-operacao-enviado-info">

                                        <strong>
                                            Pedido enviado
                                        </strong>

                                        {pedidoAberto.protocolo?.codigo_rastreio && (
                                            <span>
                                                Código de rastreio:{" "}
                                                {pedidoAberto.protocolo.codigo_rastreio}
                                            </span>
                                        )}

                                    </div>

                                    <button
                                        type="button"

                                        disabled={
                                            entregando === pedidoAberto.id
                                        }

                                        onClick={() =>
                                            marcarComoEntregue(
                                                pedidoAberto
                                            )
                                        }

                                        className="ironstore-pedidos-operacao-entregar"
                                    >
                                        {
                                            entregando === pedidoAberto.id
                                                ? "Marcando como entregue..."
                                                : "Marcar como entregue"
                                        }
                                    </button>
                                </>

                            ) : pedidoAberto.embalado ? (

                                <>
                                    <DocumentoEntrega
                                        pedido={pedidoAberto}
                                    />

                                    <div className="ironstore-pedidos-operacao-mensagem-envio">

                                        <div className="ironstore-pedidos-operacao-mensagem-envio-topo">

                                            <strong>
                                                Mensagem para o cliente
                                            </strong>

                                            <span>
                                                Opcional
                                            </span>

                                        </div>

                                        <textarea
                                            value={mensagemEnvio}
                                            onKeyDown={evento => {
                                                if (
                                                    evento.ctrlKey &&
                                                    evento.shiftKey &&
                                                    evento.key.toLowerCase() === "m"
                                                ) {
                                                    evento.preventDefault();
                                                    proximaMensagemEnvio();
                                                }
                                            }}
                                            onChange={evento =>
                                                setMensagemEnvio(
                                                    evento.target.value
                                                )
                                            }

                                            maxLength={2000}

                                            disabled={
                                                enviando === pedidoAberto.id
                                            }

                                            placeholder="Ex.: Seu pedido foi enviado. Você pode acompanhar a entrega pelo código de rastreio informado."

                                            className="ironstore-pedidos-operacao-mensagem-envio-textarea"
                                        />
                                        <div className="ironstore-pedidos-operacao-atalho-mensagem">
                                            <strong>Atalho para variar a mensagem</strong>
                                            <span>
                                                Pressione <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd>
                                                para substituir o texto pela próxima sugestão.
                                            </span>
                                        </div>
                                        <div className="ironstore-pedidos-operacao-mensagem-envio-rodape">

                                            <span>
                                                Essa mensagem ficará registrada no pedido.
                                            </span>

                                            <span>
                                                {mensagemEnvio.length}/2000
                                            </span>

                                        </div>

                                    </div>


                                    <div className="ironstore-pedidos-operacao-rastreio-acoes">
                                        <div className="ironstore-pedidos-operacao-rastreio-campo">
                                            <label htmlFor="ironstore-pedido-codigo-rastreio">
                                                Código de rastreio
                                            </label>

                                            <input
                                                id="ironstore-pedido-codigo-rastreio"
                                                type="text"
                                                value={codigoRastreioEnvio}
                                                onChange={evento =>
                                                    setCodigoRastreioEnvio(
                                                        evento.target.value.toUpperCase()
                                                    )
                                                }
                                                maxLength={150}
                                                disabled={enviando === pedidoAberto.id}
                                                placeholder="Digite o código de rastreio"
                                                autoComplete="off"
                                                spellCheck={false}
                                                className="ironstore-pedidos-operacao-rastreio-input"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            disabled={
                                                enviando === pedidoAberto.id ||
                                                !codigoRastreioEnvio.trim()
                                            }
                                            onClick={() => marcarComoEnviado(pedidoAberto)}
                                            className="ironstore-pedidos-operacao-enviar"
                                        >
                                            {enviando === pedidoAberto.id
                                                ? "Marcando como enviado..."
                                                : "Marcar como enviado"}
                                        </button>
                                    </div>

                                </>

                            ) : (

                                <button
                                    type="button"

                                    disabled={
                                        embalando === pedidoAberto.id ||
                                        pedidoAberto.inconsistencia_frete
                                    }

                                    onClick={() =>
                                        marcarComoEmbalado(
                                            pedidoAberto
                                        )
                                    }

                                    className="ironstore-pedidos-operacao-embalar"
                                >
                                    {
                                        embalando === pedidoAberto.id
                                            ? "Marcando..."
                                            : "Marcar como embalado"
                                    }
                                </button>

                            )}
                        </footer>

                    </article>

                </div>,

                document.body


            )}

        </section>
    );
}