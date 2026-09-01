import React, {
    useCallback,
    useEffect,
    useState
} from "react";

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

                                            {pedido.embalado ? (

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

            {pedidoAberto && (

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
                                        pedidoAberto.embalado
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
                            AÇÕES
                        ===================================== */}

                        <footer className="ironstore-pedidos-operacao-modal-acoes">

                            {pedidoAberto.embalado ? (

                                <DocumentoEntrega
                                    pedido={pedidoAberto}
                                />

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

                </div>

            )}

        </section>
    );
}