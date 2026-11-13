
import React, { useEffect, useMemo, useState } from "react";
import "./contatos.css";
import { API_URL } from "../../../../../config";

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const NIVEIS = [
    {
        valor: "Ouro",
        classe: "ouro",
        descricao: "Relacionamento estratégico",
        ordem: 1
    },
    {
        valor: "Prata",
        classe: "prata",
        descricao: "Relacionamento prioritário",
        ordem: 2
    },
    {
        valor: "Bronze",
        classe: "bronze",
        descricao: "Relacionamento comercial",
        ordem: 3
    }
];

// ============================================================
// ÍCONES
// ============================================================

const Icone = ({ nome, size = 20 }) => {

    const propriedades = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true
    };

    const icones = {

        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),

        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),

        whatsapp: (
            <>
                <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5Z" />
                <path d="M9 9c.5 2 2 3.5 4 4l1-1 2 1-.5 2c-4 .5-8-3.5-7.5-7.5l2-0.5 1 2Z" />
            </>
        ),

        copy: (
            <>
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
            </>
        ),

        check: (
            <path d="m5 12 4 4L19 6" />
        ),

        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
            </>
        ),

        refresh: (
            <>
                <path d="M20 7v5h-5" />
                <path d="M4 17v-5h5" />
                <path d="M5.5 9A7 7 0 0 1 18 6l2 6" />
                <path d="M18.5 15A7 7 0 0 1 6 18l-2-6" />
            </>
        ),

        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),

        crown: (
            <>
                <path d="m2 8 5 4 5-7 5 7 5-4-2 12H4L2 8Z" />
                <path d="M4 20h16" />
            </>
        ),

        medal: (
            <>
                <circle cx="12" cy="8" r="6" />
                <path d="m8.2 13-1.2 8 5-3 5 3-1.2-8" />
                <path d="m9.5 8 1.5 1.5 3-3" />
            </>
        ),

        phone: (
            <>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.1 10.4a16 16 0 0 0 6 6l1.9-1.9a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 2.2 2.5Z" />
            </>
        ),

        close: (
            <>
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
            </>
        ),

        arrow: (
            <>
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
            </>
        )

    };

    return (
        <svg {...propriedades}>
            {icones[nome]}
        </svg>
    );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Contatos() {

    // ========================================================
    // ESTADOS
    // ========================================================

    const [contatos, setContatos] = useState([]);

    const [fornecedor, setFornecedor] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [nivel, setNivel] = useState("Ouro");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroNivel, setFiltroNivel] = useState("Todos");

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);

    const [mensagem, setMensagem] = useState(null);
    const [copiado, setCopiado] = useState(null);

    // ========================================================
    // AUTENTICAÇÃO
    // ========================================================

    const obterToken = () => {

        return (
            localStorage.getItem("token") ||
            localStorage.getItem("access_token")
        );
    };

    const obterHeaders = () => {

        const token = obterToken();

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        };
    };

    // ========================================================
    // NOTIFICAÇÕES
    // ========================================================

    const notificar = (texto, tipo = "sucesso") => {

        setMensagem({
            texto,
            tipo,
            id: Date.now()
        });
    };

    useEffect(() => {

        if (!mensagem) return;

        const timer = setTimeout(() => {
            setMensagem(null);
        }, 3500);

        return () => clearTimeout(timer);

    }, [mensagem]);

    // ========================================================
    // TRATAMENTO DE RESPOSTA
    // ========================================================

    const processarResposta = async (resposta) => {

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {

            if (resposta.status === 401) {
                throw new Error("Sua sessão expirou. Entre novamente.");
            }

            throw new Error(
                dados.detail || "Não foi possível concluir a operação."
            );
        }

        return dados;
    };

    // ========================================================
    // CARREGAR CONTATOS
    // ========================================================

    const carregarContatos = async (mostrarLoading = true) => {

        if (mostrarLoading) {
            setCarregando(true);
        }

        try {

            const resposta = await fetch(
                `${API_URL}/contatos/`,
                {
                    method: "GET",
                    headers: obterHeaders()
                }
            );

            const dados = await processarResposta(resposta);

            setContatos(dados.contatos || []);

        } catch (erro) {

            notificar(
                erro.message || "Erro ao carregar fornecedores.",
                "erro"
            );

        } finally {

            setCarregando(false);

        }
    };

    useEffect(() => {

        carregarContatos();

    }, []);

    // ========================================================
    // MÁSCARA DO WHATSAPP
    // ========================================================

    const formatarWhatsapp = (valor) => {

        const numero = valor
            .replace(/\D/g, "")
            .slice(0, 11);

        if (numero.length <= 2) {
            return numero;
        }

        if (numero.length <= 6) {
            return `(${numero.slice(0, 2)}) ${numero.slice(2)}`;
        }

        if (numero.length <= 10) {
            return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
        }

        return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    };

    const alterarWhatsapp = (valor) => {

        setWhatsapp(formatarWhatsapp(valor));

    };

    // ========================================================
    // CADASTRAR FORNECEDOR
    // ========================================================

    const cadastrarContato = async (e) => {

        e.preventDefault();

        const nome = fornecedor.trim();
        const numero = whatsapp.replace(/\D/g, "");

        if (nome.length < 2) {

            notificar(
                "Informe o nome do fornecedor.",
                "erro"
            );

            return;
        }

        if (numero.length !== 10 && numero.length !== 11) {

            notificar(
                "Informe um WhatsApp válido com DDD.",
                "erro"
            );

            return;
        }

        setSalvando(true);

        try {

            const resposta = await fetch(
                `${API_URL}/contatos/`,
                {
                    method: "POST",
                    headers: obterHeaders(),
                    body: JSON.stringify({
                        fornecedor: nome,
                        contato: numero,
                        nivel
                    })
                }
            );

            await processarResposta(resposta);

            setFornecedor("");
            setWhatsapp("");
            setNivel("Ouro");

            notificar(
                "Fornecedor cadastrado com sucesso!",
                "sucesso"
            );

            await carregarContatos(false);

        } catch (erro) {

            notificar(
                erro.message || "Erro ao cadastrar fornecedor.",
                "erro"
            );

        } finally {

            setSalvando(false);

        }
    };

    // ========================================================
    // ABRIR WHATSAPP
    // ========================================================

    const abrirWhatsapp = (numero) => {

        const telefone = `55${numero.replace(/\D/g, "")}`;

        window.open(
            `https://wa.me/${telefone}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // ========================================================
    // COPIAR WHATSAPP
    // ========================================================

    const copiarWhatsapp = async (numero, id) => {

        try {

            await navigator.clipboard.writeText(
                numero.replace(/\D/g, "")
            );

            setCopiado(id);

            notificar(
                "Número copiado com sucesso!",
                "sucesso"
            );

            setTimeout(() => {
                setCopiado(atual => atual === id ? null : atual);
            }, 2000);

        } catch {

            notificar(
                "Não foi possível copiar o número.",
                "erro"
            );

        }
    };

    // ========================================================
    // EXCLUIR FORNECEDOR
    // ========================================================

    const excluirContato = async (id) => {

        const confirmar = window.confirm(
            "Deseja realmente excluir este fornecedor?\n\nEssa ação não poderá ser desfeita."
        );

        if (!confirmar) return;

        setExcluindo(id);

        try {

            const resposta = await fetch(
                `${API_URL}/contatos/${id}`,
                {
                    method: "DELETE",
                    headers: obterHeaders()
                }
            );

            await processarResposta(resposta);

            setContatos(anterior =>
                anterior.filter(item => item.id !== id)
            );

            notificar(
                "Fornecedor removido com sucesso.",
                "sucesso"
            );

        } catch (erro) {

            notificar(
                erro.message || "Erro ao excluir fornecedor.",
                "erro"
            );

        } finally {

            setExcluindo(null);

        }
    };

    // ========================================================
    // ESTATÍSTICAS
    // ========================================================

    const estatisticas = useMemo(() => {

        return {

            total: contatos.length,

            ouro: contatos.filter(
                item => item.nivel === "Ouro"
            ).length,

            prata: contatos.filter(
                item => item.nivel === "Prata"
            ).length,

            bronze: contatos.filter(
                item => item.nivel === "Bronze"
            ).length

        };

    }, [contatos]);

    // ========================================================
    // FILTRAGEM E PESQUISA
    // ========================================================

    const contatosFiltrados = useMemo(() => {

        return contatos.filter(item => {

            const termo = pesquisa.toLowerCase().trim();

            const correspondePesquisa =
                item.fornecedor?.toLowerCase().includes(termo) ||
                item.contato?.includes(termo.replace(/\D/g, ""));

            const correspondeNivel =
                filtroNivel === "Todos" ||
                item.nivel === filtroNivel;

            return correspondePesquisa && correspondeNivel;

        });

    }, [contatos, pesquisa, filtroNivel]);

    // ========================================================
    // RENDERIZAÇÃO
    // ========================================================

    return (

        <main className="contatos-iron-crm-contatos">

            {/* ==================================================
                NOTIFICAÇÕES
            ================================================== */}

            {mensagem && (

                <div
                    key={mensagem.id}
                    className={`iron-crm-toast ${mensagem.tipo}`}
                    role="status"
                >

                    <span className="contatos-iron-crm-toast-icon">

                        {mensagem.tipo === "sucesso" ? (
                            <Icone nome="check" size={18} />
                        ) : (
                            <Icone nome="close" size={18} />
                        )}

                    </span>

                    <span>{mensagem.texto}</span>

                    <button
                        type="button"
                        onClick={() => setMensagem(null)}
                        aria-label="Fechar notificação"
                    >
                        <Icone nome="close" size={15} />
                    </button>

                </div>

            )}

            {/* ==================================================
                CABEÇALHO
            ================================================== */}

            <header className="contatos-iron-crm-header">

                <div className="contatos-iron-crm-header-content">

                    <div className="contatos-iron-crm-breadcrumb">
                        <span>IRON EXECUTIONS</span>
                        <span className="contatos-iron-crm-breadcrumb-separator">/</span>
                        <span>RELACIONAMENTO</span>
                    </div>

                    <div className="contatos-iron-crm-title-area">

                        <div className="contatos-iron-crm-title-icon">
                            <Icone nome="users" size={25} />
                        </div>

                        <div>
                            <h1>Contatos comerciais</h1>

                            <p>
                                Gerencie seus fornecedores e fortaleça
                                seus relacionamentos comerciais.
                            </p>
                        </div>

                    </div>

                </div>

                <div className="contatos-iron-crm-header-actions">

                    <div className="contatos-iron-crm-header-status">
                        <span className="contatos-iron-crm-status-indicator" />
                        <span>Gerenciamento ativo</span>
                    </div>

                    <button
                        type="button"
                        className="contatos-iron-crm-refresh-button"
                        onClick={() => carregarContatos()}
                        disabled={carregando}
                        title="Atualizar contatos"
                    >
                        <Icone nome="refresh" size={18} />
                    </button>

                </div>

            </header>

            {/* ==================================================
                INDICADORES
            ================================================== */}

            <section className="contatos-iron-crm-stats">

                <article className="contatos-iron-crm-stat-card iron-crm-stat-total">

                    <div className="contatos-iron-crm-stat-top">
                        <span>Total de fornecedores</span>

                        <div className="contatos-iron-crm-stat-icon">
                            <Icone nome="users" size={21} />
                        </div>
                    </div>

                    <div className="contatos-iron-crm-stat-value">
                        {estatisticas.total}
                    </div>

                    <span className="contatos-iron-crm-stat-description">
                        Contatos registrados no sistema
                    </span>

                    <div className="contatos-iron-crm-stat-progress">
                        <span />
                    </div>

                </article>

                <article className="contatos-iron-crm-stat-card iron-crm-stat-gold">

                    <div className="contatos-iron-crm-stat-top">
                        <span>Categoria Ouro</span>

                        <div className="contatos-iron-crm-stat-icon">
                            <Icone nome="crown" size={21} />
                        </div>
                    </div>

                    <div className="contatos-iron-crm-stat-value">
                        {estatisticas.ouro}
                    </div>

                    <span className="contatos-iron-crm-stat-description">
                        Relacionamentos estratégicos
                    </span>

                    <div className="contatos-iron-crm-stat-progress">
                        <span
                            style={{
                                width: `${estatisticas.total ? estatisticas.ouro / estatisticas.total * 100 : 0}%`
                            }}
                        />
                    </div>

                </article>

                <article className="contatos-iron-crm-stat-card iron-crm-stat-silver">

                    <div className="contatos-iron-crm-stat-top">
                        <span>Categoria Prata</span>

                        <div className="contatos-iron-crm-stat-icon">
                            <Icone nome="medal" size={21} />
                        </div>
                    </div>

                    <div className="contatos-iron-crm-stat-value">
                        {estatisticas.prata}
                    </div>

                    <span className="contatos-iron-crm-stat-description">
                        Relacionamentos prioritários
                    </span>

                    <div className="contatos-iron-crm-stat-progress">
                        <span
                            style={{
                                width: `${estatisticas.total ? estatisticas.prata / estatisticas.total * 100 : 0}%`
                            }}
                        />
                    </div>

                </article>

                <article className="contatos-iron-crm-stat-card iron-crm-stat-bronze">

                    <div className="contatos-iron-crm-stat-top">
                        <span>Categoria Bronze</span>

                        <div className="contatos-iron-crm-stat-icon">
                            <Icone nome="medal" size={21} />
                        </div>
                    </div>

                    <div className="contatos-iron-crm-stat-value">
                        {estatisticas.bronze}
                    </div>

                    <span className="contatos-iron-crm-stat-description">
                        Relacionamentos comerciais
                    </span>

                    <div className="contatos-iron-crm-stat-progress">
                        <span
                            style={{
                                width: `${estatisticas.total ? estatisticas.bronze / estatisticas.total * 100 : 0}%`
                            }}
                        />
                    </div>

                </article>

            </section>

            {/* ==================================================
                CADASTRO
            ================================================== */}

            <section className="contatos-iron-crm-registration">

                <div className="contatos-iron-crm-section-header">

                    <div className="contatos-iron-crm-section-heading">

                        <div className="contatos-iron-crm-section-icon">
                            <Icone nome="plus" size={21} />
                        </div>

                        <div>
                            <span className="contatos-iron-crm-section-eyebrow">
                                NOVO REGISTRO
                            </span>

                            <h2>Adicionar fornecedor</h2>

                            <p>
                                Insira as informações do seu novo contato comercial.
                            </p>
                        </div>

                    </div>

                    <span className="contatos-iron-crm-required-label">
                        * Campos obrigatórios
                    </span>

                </div>

                <form
                    className="contatos-iron-crm-form"
                    onSubmit={cadastrarContato}
                >

                    <div className="contatos-iron-crm-form-grid">

                        <div className="contatos-iron-crm-field">

                            <label htmlFor="iron-crm-fornecedor">
                                Nome do fornecedor
                                <span>*</span>
                            </label>

                            <div className="contatos-iron-crm-input-wrapper">

                                <Icone nome="users" size={18} />

                                <input
                                    id="iron-crm-fornecedor"
                                    type="text"
                                    placeholder="Ex.: Distribuidora Central"
                                    value={fornecedor}
                                    onChange={e => setFornecedor(e.target.value)}
                                    maxLength={255}
                                    required
                                    autoComplete="organization"
                                />

                            </div>

                            <small>
                                Informe o nome da empresa ou fornecedor.
                            </small>

                        </div>

                        <div className="contatos-iron-crm-field">

                            <label htmlFor="iron-crm-whatsapp">
                                WhatsApp comercial
                                <span>*</span>
                            </label>

                            <div className="contatos-iron-crm-input-wrapper">

                                <Icone nome="phone" size={18} />

                                <input
                                    id="iron-crm-whatsapp"
                                    type="tel"
                                    placeholder="(11) 99999-9999"
                                    value={whatsapp}
                                    onChange={e => alterarWhatsapp(e.target.value)}
                                    maxLength={15}
                                    required
                                    autoComplete="tel"
                                />

                            </div>

                            <small>
                                Digite o DDD e o número, sem o código do país.
                            </small>

                        </div>

                    </div>

                    {/* NÍVEIS */}

                    <div className="contatos-iron-crm-level-section">

                        <div className="contatos-iron-crm-level-heading">

                            <label>
                                Classificação do relacionamento
                                <span>*</span>
                            </label>

                            <span>
                                A classificação define a posição na lista.
                            </span>

                        </div>

                        <div className="contatos-iron-crm-level-grid">

                            {NIVEIS.map(item => (

                                <button
                                    key={item.valor}
                                    type="button"
                                    className={`iron-crm-level-card iron-crm-level-${item.classe} ${nivel === item.valor ? "active" : ""}`}
                                    onClick={() => setNivel(item.valor)}
                                    aria-pressed={nivel === item.valor}
                                >

                                    <span className="contatos-iron-crm-level-symbol">

                                        {item.valor === "Ouro" ? (
                                            <Icone nome="crown" size={22} />
                                        ) : (
                                            <Icone nome="medal" size={22} />
                                        )}

                                    </span>

                                    <span className="contatos-iron-crm-level-text">

                                        <strong>{item.valor}</strong>

                                        <small>{item.descricao}</small>

                                    </span>

                                    <span className="contatos-iron-crm-level-selector">

                                        {nivel === item.valor && (
                                            <Icone nome="check" size={15} />
                                        )}

                                    </span>

                                </button>

                            ))}

                        </div>

                    </div>

                    {/* RODAPÉ DO FORMULÁRIO */}

                    <div className="contatos-iron-crm-form-footer">

                        <div className="contatos-iron-crm-form-information">

                            <span className="contatos-iron-crm-information-dot" />

                            <span>
                                O fornecedor será posicionado automaticamente
                                conforme sua classificação.
                            </span>

                        </div>

                        <button
                            type="submit"
                            className="contatos-iron-crm-submit-button"
                            disabled={salvando}
                        >

                            {salvando ? (

                                <>
                                    <span className="contatos-iron-crm-button-loader" />
                                    Cadastrando...
                                </>

                            ) : (

                                <>
                                    <Icone nome="plus" size={18} />
                                    Cadastrar fornecedor
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </section>

            {/* ==================================================
                LISTAGEM
            ================================================== */}

            <section className="contatos-iron-crm-directory">

                <div className="contatos-iron-crm-directory-header">

                    <div className="contatos-iron-crm-directory-title">

                        <span className="contatos-iron-crm-section-eyebrow">
                            SUA REDE DE CONTATOS
                        </span>

                        <h2>Fornecedores cadastrados</h2>

                        <p>
                            Acompanhe e acesse rapidamente seus contatos comerciais.
                        </p>

                    </div>

                    <div className="contatos-iron-crm-directory-counter">

                        <strong>{contatosFiltrados.length}</strong>

                        <span>
                            {contatosFiltrados.length === 1
                                ? "resultado"
                                : "resultados"}
                        </span>

                    </div>

                </div>

                {/* PESQUISA E FILTROS */}

                <div className="contatos-iron-crm-toolbar">

                    <div className="contatos-iron-crm-search">

                        <Icone nome="search" size={19} />

                        <input
                            type="search"
                            placeholder="Pesquisar fornecedor ou WhatsApp..."
                            value={pesquisa}
                            onChange={e => setPesquisa(e.target.value)}
                        />

                        {pesquisa && (

                            <button
                                type="button"
                                onClick={() => setPesquisa("")}
                                title="Limpar pesquisa"
                            >
                                <Icone nome="close" size={16} />
                            </button>

                        )}

                    </div>

                    <div className="contatos-iron-crm-filters">

                        <span>Filtrar:</span>

                        {["Todos", "Ouro", "Prata", "Bronze"].map(item => (

                            <button
                                key={item}
                                type="button"
                                className={`iron-crm-filter-button ${filtroNivel === item ? "active" : ""} ${item.toLowerCase()}`}
                                onClick={() => setFiltroNivel(item)}
                                aria-pressed={filtroNivel === item}
                            >
                                {item}
                            </button>

                        ))}

                    </div>

                </div>

                {/* LISTAGEM */}

                {carregando ? (

                    <div className="contatos-iron-crm-loading">

                        <span className="contatos-iron-crm-loading-spinner" />

                        <strong>Carregando fornecedores</strong>

                        <p>Estamos preparando sua lista comercial.</p>

                    </div>

                ) : contatosFiltrados.length === 0 ? (

                    <div className="contatos-iron-crm-empty">

                        <div className="contatos-iron-crm-empty-icon">
                            <Icone
                                nome={pesquisa || filtroNivel !== "Todos" ? "search" : "users"}
                                size={29}
                            />
                        </div>

                        <h3>
                            {contatos.length === 0
                                ? "Sua rede comercial está começando"
                                : "Nenhum fornecedor encontrado"}
                        </h3>

                        <p>
                            {contatos.length === 0
                                ? "Cadastre seu primeiro fornecedor para começar a organizar seus relacionamentos comerciais."
                                : "Não encontramos fornecedores com os critérios selecionados. Experimente alterar a pesquisa ou o filtro."}
                        </p>

                        {(pesquisa || filtroNivel !== "Todos") && (

                            <button
                                type="button"
                                onClick={() => {
                                    setPesquisa("");
                                    setFiltroNivel("Todos");
                                }}
                            >
                                Limpar filtros
                            </button>

                        )}

                    </div>

                ) : (

                    <div className="contatos-iron-crm-contact-list">

                        {contatosFiltrados.map((item, index) => {

                            const nivelAtual = NIVEIS.find(
                                n => n.valor === item.nivel
                            );

                            const classeNivel = nivelAtual
                                ? nivelAtual.classe
                                : "bronze";

                            return (

                                <article
                                    key={item.id}
                                    className={`iron-crm-contact-card iron-crm-contact-${classeNivel}`}
                                    style={{
                                        "--iron-crm-card-index": index
                                    }}
                                >

                                    {/* POSIÇÃO */}

                                    <div className="contatos-iron-crm-contact-position">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>

                                    {/* IDENTIFICAÇÃO */}

                                    <div className="contatos-iron-crm-contact-main">

                                        <div className={`iron-crm-contact-level iron-crm-contact-level-${classeNivel}`}>

                                            {item.nivel}

                                        </div>

                                        <div className="contatos-iron-crm-contact-information">

                                            <h3>{item.fornecedor}</h3>

                                            <div className="contatos-iron-crm-contact-phone">

                                                <Icone nome="phone" size={14} />

                                                <span>
                                                    +55 {formatarWhatsapp(item.contato)}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    {/* CLASSIFICAÇÃO */}

                                    <div className="contatos-iron-crm-contact-classification">

                                        <span>CLASSIFICAÇÃO</span>

                                        <strong>
                                            {item.nivel}
                                        </strong>

                                    </div>

                                    {/* AÇÕES */}

                                    <div className="contatos-iron-crm-contact-actions">

                                        <button
                                            type="button"
                                            className="contatos-iron-crm-action-whatsapp"
                                            onClick={() => abrirWhatsapp(item.contato)}
                                            title="Abrir conversa no WhatsApp"
                                        >

                                            <Icone nome="whatsapp" size={18} />

                                            <span>WhatsApp</span>

                                            <Icone nome="arrow" size={14} />

                                        </button>

                                        <button
                                            type="button"
                                            className={`iron-crm-action-copy ${copiado === item.id ? "copied" : ""}`}
                                            onClick={() => copiarWhatsapp(item.contato, item.id)}
                                            title="Copiar número"
                                            aria-label="Copiar WhatsApp"
                                        >

                                            <Icone
                                                nome={copiado === item.id ? "check" : "copy"}
                                                size={18}
                                            />

                                        </button>

                                        <button
                                            type="button"
                                            className="contatos-iron-crm-action-delete"
                                            onClick={() => excluirContato(item.id)}
                                            disabled={excluindo === item.id}
                                            title="Excluir fornecedor"
                                            aria-label="Excluir fornecedor"
                                        >

                                            {excluindo === item.id ? (
                                                <span className="contatos-iron-crm-button-loader" />
                                            ) : (
                                                <Icone nome="trash" size={18} />
                                            )}

                                        </button>

                                    </div>

                                </article>

                            );

                        })}

                    </div>

                )}

                {/* RODAPÉ DA LISTAGEM */}

                {!carregando && contatos.length > 0 && (

                    <div className="contatos-iron-crm-directory-footer">

                        <span>
                            Exibindo {contatosFiltrados.length} de {contatos.length} fornecedores.
                        </span>

                        <span>
                            <Icone nome="check" size={14} />
                            Lista atualizada
                        </span>

                    </div>

                )}

            </section>

            {/* ==================================================
                RODAPÉ
            ================================================== */}

            <footer className="contatos-iron-crm-footer">

                <span>
                    IRON EXECUTIONS
                </span>

                <span>
                    Gestão de relacionamentos comerciais
                </span>

            </footer>

        </main>

    );

}
