import React, {
    useEffect,
    useState
} from "react";

import { API_URL } from "../../../../../config";

import "./promocoes.css";


export default function Promocoes() {

    /*
    =========================================================
    FORMULÁRIO
    =========================================================
    */

    const [tipoDesconto, setTipoDesconto] =
        useState("porcentagem");

    const [desconto, setDesconto] =
        useState("");

    const [minimo, setMinimo] =
        useState("");

    const [ate, setAte] =
        useState("");


    /*
    =========================================================
    TELA
    =========================================================
    */

    const [promocoes, setPromocoes] =
        useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);

    const [excluindoId, setExcluindoId] =
        useState(null);

    const [alterandoStatusId, setAlterandoStatusId] =
        useState(null);


    /*
    =========================================================
    ALERTA
    =========================================================
    */

    const [alerta, setAlerta] = useState({
        visivel: false,
        tipo: "sucesso",
        mensagem: ""
    });


    function mostrarAlerta(
        mensagem,
        tipo = "sucesso"
    ) {

        setAlerta({
            visivel: true,
            tipo,
            mensagem
        });

        window.setTimeout(() => {

            setAlerta({
                visivel: false,
                tipo: "sucesso",
                mensagem: ""
            });

        }, 3000);

    }


    /*
    =========================================================
    CARREGAR PROMOÇÕES
    =========================================================
    */

    async function carregarPromocoes() {

        try {

            setCarregando(true);

            const token =
                localStorage.getItem("token");

            if (!token) {

                mostrarAlerta(
                    "Sessão não encontrada.",
                    "erro"
                );

                return;

            }

            const resposta = await fetch(
                `${API_URL}/comercio/promocoes/lista`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta
                .json()
                .catch(() => ({}));

            if (!resposta.ok) {

                console.error(
                    "[PROMOÇÕES] Erro ao carregar:",
                    dados
                );

                mostrarAlerta(
                    dados?.detail ||
                    "Não foi possível carregar as promoções.",
                    "erro"
                );

                return;

            }

            const lista =
                Array.isArray(dados?.promocoes)
                    ? dados.promocoes
                    : [];

            console.log(
                "[PROMOÇÕES] Promoções carregadas:",
                lista
            );

            setPromocoes(
                lista
            );

        } catch (erro) {

            console.error(
                "[PROMOÇÕES] Erro ao carregar:",
                erro
            );

            mostrarAlerta(
                "Erro ao conectar com o servidor.",
                "erro"
            );

        } finally {

            setCarregando(false);

        }

    }


    /*
    =========================================================
    CARREGAR
    =========================================================
    */

    useEffect(() => {

        carregarPromocoes();

    }, []);


    /*
    =========================================================
    CRIAR PROMOÇÃO
    =========================================================
    */

    async function criarPromocao(evento) {

        evento.preventDefault();

        const descontoNumero =
            Number(desconto);

        const minimoNumero =
            minimo === ""
                ? 0
                : Number(minimo);


        /*
        =====================================================
        VALIDAR DESCONTO
        =====================================================
        */

        if (
            !desconto ||
            Number.isNaN(descontoNumero) ||
            descontoNumero <= 0
        ) {

            mostrarAlerta(
                "Informe um desconto maior que zero.",
                "erro"
            );

            return;

        }


        if (
            tipoDesconto === "porcentagem" &&
            descontoNumero > 100
        ) {

            mostrarAlerta(
                "O desconto percentual não pode ultrapassar 100%.",
                "erro"
            );

            return;

        }


        /*
        =====================================================
        VALIDAR MÍNIMO
        =====================================================
        */

        if (
            Number.isNaN(minimoNumero) ||
            minimoNumero < 0
        ) {

            mostrarAlerta(
                "O valor mínimo não pode ser negativo.",
                "erro"
            );

            return;

        }


        /*
        =====================================================
        VALIDAR DATA
        =====================================================
        */

        if (ate) {

            const dataSelecionada =
                new Date(ate);

            if (
                Number.isNaN(
                    dataSelecionada.getTime()
                ) ||
                dataSelecionada <= new Date()
            ) {

                mostrarAlerta(
                    "A validade precisa ser uma data futura.",
                    "erro"
                );

                return;

            }

        }


        /*
        =====================================================
        ENVIAR
        =====================================================
        */

        try {

            setSalvando(true);

            const token =
                localStorage.getItem("token");

            if (!token) {

                mostrarAlerta(
                    "Sessão não encontrada.",
                    "erro"
                );

                return;

            }

            const corpo = {

                tipo_desconto:
                    tipoDesconto,

                desconto:
                    descontoNumero,

                minimo:
                    minimoNumero,

                ate:
                    ate
                        ? new Date(ate).toISOString()
                        : null
            };

            console.log(
                "[PROMOÇÕES] Criando:",
                corpo
            );

            const resposta = await fetch(
                `${API_URL}/comercio/promocoes`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(corpo)
                }
            );

            const dados = await resposta
                .json()
                .catch(() => ({}));

            if (!resposta.ok) {

                console.error(
                    "[PROMOÇÕES] Erro ao criar:",
                    dados
                );

                mostrarAlerta(
                    dados?.detail ||
                    "Não foi possível criar a promoção.",
                    "erro"
                );

                return;

            }


            /*
            =================================================
            LIMPAR
            =================================================
            */

            setTipoDesconto(
                "porcentagem"
            );

            setDesconto("");
            setMinimo("");
            setAte("");


            mostrarAlerta(
                "Promoção criada com sucesso.",
                "sucesso"
            );


            await carregarPromocoes();

        } catch (erro) {

            console.error(
                "[PROMOÇÕES] Erro:",
                erro
            );

            mostrarAlerta(
                "Erro ao conectar com o servidor.",
                "erro"
            );

        } finally {

            setSalvando(false);

        }

    }


    /*
    =========================================================
    ATIVAR / DESATIVAR
    =========================================================
    */

    async function alterarStatusPromocao(
        promocao
    ) {

        /*
        =====================================================
        PROMOÇÃO EXPIRADA
        =====================================================
        */

        if (promocao.expirada) {

            mostrarAlerta(
                "Esta promoção já expirou.",
                "erro"
            );

            return;

        }


        /*
        =====================================================
        NOVO STATUS
        =====================================================
        */

        const novoStatus =
            promocao.ativa
                ? 0
                : 1;


        try {

            setAlterandoStatusId(
                promocao.id
            );

            const token =
                localStorage.getItem("token");

            if (!token) {

                mostrarAlerta(
                    "Sessão não encontrada.",
                    "erro"
                );

                return;

            }


            console.log(
                "[PROMOÇÕES] Alterando status:",
                {
                    id: promocao.id,
                    atual: promocao.ativa,
                    novo: novoStatus
                }
            );


            const resposta = await fetch(
                `${API_URL}/comercio/promocoes/${promocao.id}/ativa`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        ativa: novoStatus
                    })
                }
            );


            const dados = await resposta
                .json()
                .catch(() => ({}));


            if (!resposta.ok) {

                console.error(
                    "[PROMOÇÕES] Erro ao alterar status:",
                    dados
                );

                mostrarAlerta(
                    dados?.detail ||
                    "Não foi possível alterar a promoção.",
                    "erro"
                );

                return;

            }


            /*
            =================================================
            ATUALIZAR SOMENTE O CARD
            =================================================
            */

            setPromocoes(
                lista =>
                    lista.map(item => {

                        if (
                            item.id !== promocao.id
                        ) {

                            return item;

                        }

                        return {
                            ...item,

                            ativa:
                                Boolean(
                                    dados.ativa
                                ),

                            expirada:
                                Boolean(
                                    dados.expirada
                                ),

                            disponivel:
                                Boolean(
                                    dados.disponivel
                                )
                        };

                    })
            );


            /*
            =================================================
            ALERTA
            =================================================
            */

            mostrarAlerta(
                novoStatus === 1
                    ? "Promoção ativada com sucesso."
                    : "Promoção desativada com sucesso.",
                "sucesso"
            );


            console.log(
                "[PROMOÇÕES] Status atualizado:",
                dados
            );

        } catch (erro) {

            console.error(
                "[PROMOÇÕES] Erro ao alterar status:",
                erro
            );

            mostrarAlerta(
                "Erro ao alterar o status da promoção.",
                "erro"
            );

        } finally {

            setAlterandoStatusId(
                null
            );

        }

    }


    /*
    =========================================================
    EXCLUIR
    =========================================================
    */

    async function excluirPromocao(id) {

        const confirmou =
            window.confirm(
                "Deseja realmente excluir esta promoção?"
            );

        if (!confirmou) {
            return;
        }


        try {

            setExcluindoId(id);

            const token =
                localStorage.getItem("token");

            const resposta = await fetch(
                `${API_URL}/comercio/promocoes/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta
                .json()
                .catch(() => ({}));

            if (!resposta.ok) {

                mostrarAlerta(
                    dados?.detail ||
                    "Não foi possível excluir a promoção.",
                    "erro"
                );

                return;

            }

            setPromocoes(
                lista =>
                    lista.filter(
                        promocao =>
                            promocao.id !== id
                    )
            );

            mostrarAlerta(
                "Promoção excluída.",
                "sucesso"
            );

        } catch (erro) {

            console.error(
                "[PROMOÇÕES] Erro ao excluir:",
                erro
            );

            mostrarAlerta(
                "Erro ao excluir a promoção.",
                "erro"
            );

        } finally {

            setExcluindoId(null);

        }

    }

    /*
    =========================================================
    COPIAR CÓDIGO DA PROMOÇÃO
    =========================================================
    */

    async function copiarCodigoPromocao(codigo) {

        if (!codigo) {

            mostrarAlerta(
                "Esta promoção não possui código.",
                "erro"
            );

            return;

        }

        try {

            await navigator.clipboard.writeText(
                codigo
            );

            console.log(
                "[PROMOÇÕES] Código copiado:",
                codigo
            );

            mostrarAlerta(
                `Código ${codigo} copiado.`,
                "sucesso"
            );

        } catch (erro) {

            console.error(
                "[PROMOÇÕES] Erro ao copiar código:",
                erro
            );

            /*
            =============================================
            FALLBACK
            =============================================
            */

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                codigo;

            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            document.body.removeChild(
                textarea
            );

            mostrarAlerta(
                `Código ${codigo} copiado.`,
                "sucesso"
            );

        }

    }
    /*
    =========================================================
    FORMATAR DINHEIRO
    =========================================================
    */

    function formatarDinheiro(valor) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /*
    =========================================================
    FORMATAR DATA
    =========================================================
    */

    function formatarData(data) {

        if (!data) {
            return "Sem prazo";
        }

        const dataFormatada =
            new Date(data);

        if (
            Number.isNaN(
                dataFormatada.getTime()
            )
        ) {

            return "Sem prazo";

        }

        return dataFormatada
            .toLocaleString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }


    /*
    =========================================================
    CONTADORES
    =========================================================
    */

    const quantidadeAtivas =
        promocoes.filter(
            promocao =>
                promocao.ativa &&
                !promocao.expirada
        ).length;


    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (

        <section className="iron-promocoes-area">


            {/* =================================================
                ALERTA
            ================================================= */}

            {alerta.visivel && (

                <div
                    className={`
                        iron-promocoes-alerta
                        iron-promocoes-alerta-${alerta.tipo}
                    `}
                >

                    <div className="iron-promocoes-alerta-icone">

                        {alerta.tipo === "sucesso"
                            ? "✓"
                            : "!"
                        }

                    </div>

                    <span className="iron-promocoes-alerta-texto">
                        {alerta.mensagem}
                    </span>

                </div>

            )}


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <header className="iron-promocoes-header">

                <div className="iron-promocoes-header-textos">

                    <span className="iron-promocoes-header-etiqueta">
                        Administração
                    </span>

                    <h2 className="iron-promocoes-header-titulo">
                        Promoções
                    </h2>

                    <p className="iron-promocoes-header-descricao">
                        Crie descontos e defina as condições
                        para cada promoção do seu comércio.
                    </p>

                </div>


                <div className="iron-promocoes-resumo">

                    <div className="iron-promocoes-resumo-item">

                        <span className="iron-promocoes-resumo-numero">
                            {promocoes.length}
                        </span>

                        <span className="iron-promocoes-resumo-label">
                            cadastradas
                        </span>

                    </div>

                    <div className="iron-promocoes-resumo-divisor" />

                    <div className="iron-promocoes-resumo-item">

                        <span className="iron-promocoes-resumo-numero">
                            {quantidadeAtivas}
                        </span>

                        <span className="iron-promocoes-resumo-label">
                            ativas
                        </span>

                    </div>

                </div>

            </header>


            {/* =================================================
                NOVA PROMOÇÃO
            ================================================= */}

            <div className="iron-promocoes-criacao-card">

                <div className="iron-promocoes-criacao-header">

                    <div className="iron-promocoes-criacao-icone">
                        %
                    </div>

                    <div className="iron-promocoes-criacao-textos">

                        <h3 className="iron-promocoes-criacao-titulo">
                            Nova promoção
                        </h3>

                        <p className="iron-promocoes-criacao-descricao">
                            Configure abaixo as regras do desconto.
                        </p>

                    </div>

                </div>


                <form
                    className="iron-promocoes-formulario"
                    onSubmit={criarPromocao}
                >

                    <div className="iron-promocoes-campo iron-promocoes-campo-tipo">

                        <label className="iron-promocoes-label">
                            Tipo de desconto
                        </label>


                        <div className="iron-promocoes-tipo-opcoes">

                            <button
                                type="button"
                                className={`
                                    iron-promocoes-tipo-botao
                                    ${tipoDesconto === "porcentagem"
                                        ? "iron-promocoes-tipo-botao-ativo"
                                        : ""
                                    }
                                `}
                                onClick={() =>
                                    setTipoDesconto(
                                        "porcentagem"
                                    )
                                }
                            >

                                <span className="iron-promocoes-tipo-simbolo">
                                    %
                                </span>

                                <span className="iron-promocoes-tipo-texto">
                                    Porcentagem
                                </span>

                            </button>


                            <button
                                type="button"
                                className={`
                                    iron-promocoes-tipo-botao
                                    ${tipoDesconto === "valor"
                                        ? "iron-promocoes-tipo-botao-ativo"
                                        : ""
                                    }
                                `}
                                onClick={() =>
                                    setTipoDesconto(
                                        "valor"
                                    )
                                }
                            >

                                <span className="iron-promocoes-tipo-simbolo">
                                    R$
                                </span>

                                <span className="iron-promocoes-tipo-texto">
                                    Valor fixo
                                </span>

                            </button>

                        </div>

                    </div>


                    <div className="iron-promocoes-form-grid">


                        {/* DESCONTO */}

                        <div className="iron-promocoes-campo">

                            <label className="iron-promocoes-label">
                                Desconto
                            </label>

                            <div className="iron-promocoes-input-box">

                                <span className="iron-promocoes-input-prefixo">

                                    {tipoDesconto === "porcentagem"
                                        ? "%"
                                        : "R$"
                                    }

                                </span>

                                <input
                                    className="iron-promocoes-input"
                                    type="number"
                                    min="0"
                                    max={
                                        tipoDesconto === "porcentagem"
                                            ? "100"
                                            : undefined
                                    }
                                    step="0.01"
                                    placeholder={
                                        tipoDesconto === "porcentagem"
                                            ? "Ex: 15"
                                            : "Ex: 20,00"
                                    }
                                    value={desconto}
                                    onChange={
                                        e =>
                                            setDesconto(
                                                e.target.value
                                            )
                                    }
                                />

                            </div>

                            <span className="iron-promocoes-campo-ajuda">

                                {tipoDesconto === "porcentagem"
                                    ? "Percentual aplicado sobre o valor da compra."
                                    : "Valor fixo retirado do total da compra."
                                }

                            </span>

                        </div>


                        {/* MÍNIMO */}

                        <div className="iron-promocoes-campo">

                            <label className="iron-promocoes-label">
                                Compra mínima
                            </label>

                            <div className="iron-promocoes-input-box">

                                <span className="iron-promocoes-input-prefixo">
                                    R$
                                </span>

                                <input
                                    className="iron-promocoes-input"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Sem mínimo"
                                    value={minimo}
                                    onChange={
                                        e =>
                                            setMinimo(
                                                e.target.value
                                            )
                                    }
                                />

                            </div>

                            <span className="iron-promocoes-campo-ajuda">
                                Vazio significa que não existe valor mínimo.
                            </span>

                        </div>


                        {/* VALIDADE */}

                        <div className="iron-promocoes-campo">

                            <label className="iron-promocoes-label">
                                Disponível até
                            </label>

                            <div className="iron-promocoes-input-box">

                                <input
                                    className="iron-promocoes-input iron-promocoes-input-data"
                                    type="datetime-local"
                                    value={ate}
                                    onChange={
                                        e =>
                                            setAte(
                                                e.target.value
                                            )
                                    }
                                />

                            </div>

                            <span className="iron-promocoes-campo-ajuda">
                                Vazio significa que a promoção não expira.
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        PRÉVIA
                    ================================================= */}

                    <div className="iron-promocoes-preview">

                        <div className="iron-promocoes-preview-conteudo">

                            <span className="iron-promocoes-preview-label">
                                Prévia da promoção
                            </span>

                            <strong className="iron-promocoes-preview-desconto">

                                {desconto
                                    ? (
                                        tipoDesconto === "porcentagem"
                                            ? `${Number(desconto)}% OFF`
                                            : `${formatarDinheiro(desconto)} OFF`
                                    )
                                    : "Defina o desconto"
                                }

                            </strong>

                            <span className="iron-promocoes-preview-condicao">

                                {Number(minimo || 0) > 0
                                    ? `Em compras a partir de ${formatarDinheiro(minimo)}`
                                    : "Sem valor mínimo de compra"
                                }

                            </span>

                        </div>


                        <div className="iron-promocoes-preview-validade">

                            <span className="iron-promocoes-preview-validade-label">
                                Validade
                            </span>

                            <strong className="iron-promocoes-preview-validade-valor">

                                {ate
                                    ? formatarData(ate)
                                    : "Sem prazo"
                                }

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        AÇÕES
                    ================================================= */}

                    <div className="iron-promocoes-form-acoes">

                        <button
                            type="button"
                            className="iron-promocoes-botao-limpar"
                            onClick={() => {

                                setTipoDesconto(
                                    "porcentagem"
                                );

                                setDesconto("");
                                setMinimo("");
                                setAte("");

                            }}
                        >
                            Limpar
                        </button>


                        <button
                            type="submit"
                            className="iron-promocoes-botao-criar"
                            disabled={salvando}
                        >

                            {salvando
                                ? (
                                    <>
                                        <span className="iron-promocoes-spinner" />
                                        Salvando...
                                    </>
                                )
                                : (
                                    <>
                                        <span className="iron-promocoes-botao-mais">
                                            +
                                        </span>

                                        Criar promoção
                                    </>
                                )
                            }

                        </button>

                    </div>

                </form>

            </div>


            {/* =================================================
                LISTA
            ================================================= */}

            <div className="iron-promocoes-lista-area">

                <div className="iron-promocoes-lista-header">

                    <div>

                        <h3 className="iron-promocoes-lista-titulo">
                            Promoções cadastradas
                        </h3>

                        <p className="iron-promocoes-lista-descricao">
                            Acompanhe as promoções disponíveis
                            no seu comércio.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="iron-promocoes-atualizar"
                        onClick={carregarPromocoes}
                        disabled={carregando}
                    >
                        Atualizar
                    </button>

                </div>


                {/* =================================================
                    CARREGANDO
                ================================================= */}

                {carregando && (

                    <div className="iron-promocoes-loading">

                        <span className="iron-promocoes-loading-spinner" />

                        <span className="iron-promocoes-loading-texto">
                            Carregando promoções...
                        </span>

                    </div>

                )}


                {/* =================================================
                    VAZIO
                ================================================= */}

                {!carregando &&
                    promocoes.length === 0 && (

                        <div className="iron-promocoes-vazio">

                            <div className="iron-promocoes-vazio-icone">
                                %
                            </div>

                            <h4 className="iron-promocoes-vazio-titulo">
                                Nenhuma promoção cadastrada
                            </h4>

                            <p className="iron-promocoes-vazio-descricao">
                                Quando você criar uma promoção,
                                ela aparecerá aqui.
                            </p>

                        </div>

                    )}


                {/* =================================================
                    CARDS
                ================================================= */}

                {!carregando &&
                    promocoes.length > 0 && (

                        <div className="iron-promocoes-cards">

                            {promocoes.map(
                                promocao => {

                                    const percentual =
                                        promocao.tipo_desconto ===
                                        "porcentagem";

                                    const alterando =
                                        alterandoStatusId ===
                                        promocao.id;


                                    /*
                                    =====================================
                                    CLASSE DO CARD
                                    =====================================
                                    */

                                    let classeCard =
                                        "iron-promocoes-card-ativo";

                                    if (promocao.expirada) {

                                        classeCard =
                                            "iron-promocoes-card-expirado";

                                    } else if (!promocao.ativa) {

                                        classeCard =
                                            "iron-promocoes-card-desativado";

                                    }


                                    /*
                                    =====================================
                                    CLASSE STATUS
                                    =====================================
                                    */

                                    let classeStatus =
                                        "iron-promocoes-card-status-ativo";

                                    if (promocao.expirada) {

                                        classeStatus =
                                            "iron-promocoes-card-status-expirado";

                                    } else if (!promocao.ativa) {

                                        classeStatus =
                                            "iron-promocoes-card-status-desativado";

                                    }


                                    return (

                                        <article
                                            key={promocao.id}
                                            className={`
                                            iron-promocoes-card
                                            ${classeCard}
                                        `}
                                        >

                                            <div className="iron-promocoes-card-header">


                                                {/* DESCONTO */}

                                                <div className="iron-promocoes-card-desconto">

                                                    <span className="iron-promocoes-card-desconto-valor">

                                                        {percentual
                                                            ? `${Number(promocao.desconto)}%`
                                                            : formatarDinheiro(
                                                                promocao.desconto
                                                            )
                                                        }

                                                    </span>

                                                    <span className="iron-promocoes-card-desconto-texto">
                                                        de desconto
                                                    </span>

                                                </div>


                                                {/* =================================
                                                STATUS CLICÁVEL
                                            ================================= */}

                                                <button
                                                    type="button"
                                                    disabled={
                                                        alterando ||
                                                        promocao.expirada
                                                    }
                                                    onClick={() =>
                                                        alterarStatusPromocao(
                                                            promocao
                                                        )
                                                    }
                                                    className={`
                                                    iron-promocoes-card-status
                                                    iron-promocoes-card-status-botao
                                                    ${classeStatus}
                                                `}
                                                >

                                                    {alterando
                                                        ? (
                                                            <>
                                                                <span className="iron-promocoes-status-spinner" />

                                                                <span className="iron-promocoes-status-texto-normal">
                                                                    Alterando
                                                                </span>
                                                            </>
                                                        )
                                                        : promocao.expirada
                                                            ? (
                                                                <>
                                                                    <span className="iron-promocoes-card-status-ponto" />

                                                                    <span className="iron-promocoes-status-texto-normal">
                                                                        Expirada
                                                                    </span>
                                                                </>
                                                            )
                                                            : promocao.ativa
                                                                ? (
                                                                    <>
                                                                        <span className="iron-promocoes-card-status-ponto" />

                                                                        <span className="iron-promocoes-status-texto-normal">
                                                                            Ativa
                                                                        </span>

                                                                        <span className="iron-promocoes-status-texto-hover">
                                                                            Desativar
                                                                        </span>
                                                                    </>
                                                                )
                                                                : (
                                                                    <>
                                                                        <span className="iron-promocoes-card-status-ponto" />

                                                                        <span className="iron-promocoes-status-texto-normal">
                                                                            Desativada
                                                                        </span>

                                                                        <span className="iron-promocoes-status-texto-hover">
                                                                            Ativar
                                                                        </span>
                                                                    </>
                                                                )
                                                    }

                                                </button>

                                            </div>


                                            <div className="iron-promocoes-card-linha" />

                                            {/* =====================================
    CÓDIGO DA PROMOÇÃO
===================================== */}

                                            <div className="iron-promocoes-card-codigo-area">

                                                <div className="iron-promocoes-card-codigo-conteudo">

                                                    <span className="iron-promocoes-card-codigo-label">
                                                        Código promocional
                                                    </span>

                                                    <strong className="iron-promocoes-card-codigo">

                                                        {promocao.codigo
                                                            ? promocao.codigo
                                                            : "Sem código"
                                                        }

                                                    </strong>

                                                </div>


                                                {promocao.codigo && (

                                                    <button
                                                        type="button"
                                                        className="iron-promocoes-card-copiar"
                                                        onClick={() =>
                                                            copiarCodigoPromocao(
                                                                promocao.codigo
                                                            )
                                                        }
                                                        title="Copiar código"
                                                    >

                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            aria-hidden="true"
                                                            className="iron-promocoes-card-copiar-icone"
                                                        >
                                                            <path
                                                                d="M8 8V5.8C8 4.81 8.81 4 9.8 4h8.4c.99 0 1.8.81 1.8 1.8v8.4c0 .99-.81 1.8-1.8 1.8H16"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />

                                                            <rect
                                                                x="4"
                                                                y="8"
                                                                width="12"
                                                                height="12"
                                                                rx="2"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                            />
                                                        </svg>

                                                        <span>
                                                            Copiar
                                                        </span>

                                                    </button>

                                                )}

                                            </div>
                                            {/* =====================================
                                            INFORMAÇÕES
                                        ===================================== */}

                                            <div className="iron-promocoes-card-informacoes">

                                                <div className="iron-promocoes-card-info">

                                                    <span className="iron-promocoes-card-info-label">
                                                        Compra mínima
                                                    </span>

                                                    <strong className="iron-promocoes-card-info-valor">

                                                        {Number(promocao.minimo) > 0
                                                            ? formatarDinheiro(
                                                                promocao.minimo
                                                            )
                                                            : "Sem mínimo"
                                                        }

                                                    </strong>

                                                </div>


                                                <div className="iron-promocoes-card-info">

                                                    <span className="iron-promocoes-card-info-label">
                                                        Validade
                                                    </span>

                                                    <strong className="iron-promocoes-card-info-valor">

                                                        {formatarData(
                                                            promocao.ate
                                                        )}

                                                    </strong>

                                                </div>

                                            </div>


                                            {/* =====================================
                                            RODAPÉ
                                        ===================================== */}

                                            <div className="iron-promocoes-card-rodape">

                                                <span className="iron-promocoes-card-id">
                                                    Promoção #{promocao.id}
                                                </span>


                                                <button
                                                    type="button"
                                                    className="iron-promocoes-card-excluir"
                                                    disabled={
                                                        excluindoId === promocao.id
                                                    }
                                                    onClick={() =>
                                                        excluirPromocao(
                                                            promocao.id
                                                        )
                                                    }
                                                >

                                                    {excluindoId === promocao.id
                                                        ? "Excluindo..."
                                                        : "Excluir"
                                                    }

                                                </button>

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}

            </div>

        </section>

    );

}