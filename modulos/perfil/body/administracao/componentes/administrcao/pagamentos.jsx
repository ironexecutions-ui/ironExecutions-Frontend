
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import { API_URL } from "../../../../../../config";
import "./pagamentos.css";

// =====================================================
// FORMATAÇÃO
// =====================================================

const moedaPagamento = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

const dataHojePagamento = () => {
    const hoje = new Date();

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");
};

const dataFormatadaPagamento = (data) => {
    if (!data) return "";

    const [ano, mes, dia] = String(data).slice(0, 10).split("-");

    return `${dia}/${mes}/${ano}`;
};

const obterErro = (error) => {
    if (typeof error?.detail === "string") {
        return error.detail;
    }

    if (error?.detail?.mensagem) {
        return error.detail.mensagem;
    }

    return "Não foi possível concluir a operação.";
};

// =====================================================
// COMPONENTE
// =====================================================

export default function Pagamentos() {
    // -------------------------------------------------
    // DADOS
    // -------------------------------------------------

    const [fases, setFases] = useState([]);
    const [orcamentos, setOrcamentos] = useState([]);
    const [fasesPagamento, setFasesPagamento] = useState([]);

    const [periodo, setPeriodo] = useState({
        data_comeco: "",
        data_fim: "",
        deslocamento: 0
    });

    const [deslocamento, setDeslocamento] = useState(0);

    // -------------------------------------------------
    // FORMULÁRIO
    // -------------------------------------------------

    const [faseBusca, setFaseBusca] = useState("");
    const [orcamentoBusca, setOrcamentoBusca] = useState("");
    const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);

    const [valor, setValor] = useState("");
    const [observacao, setObservacao] = useState("");
    const [data, setData] = useState(dataHojePagamento());

    // -------------------------------------------------
    // ESTADOS
    // -------------------------------------------------

    const [carregando, setCarregando] = useState(true);
    const [carregandoPeriodo, setCarregandoPeriodo] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [orcamentoListaAberta, setOrcamentoListaAberta] = useState(false);
    // -------------------------------------------------
    // REQUISIÇÃO
    // -------------------------------------------------

    const requisicao = useCallback(async (rota, opcoes = {}) => {
        const resposta = await fetch(`${API_URL}${rota}`, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                ...opcoes.headers
            }
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw dados;
        }

        return dados;
    }, []);

    // -------------------------------------------------
    // CARREGAR OPÇÕES DO FORMULÁRIO
    // -------------------------------------------------

    const carregarOpcoes = useCallback(async () => {
        const dados = await requisicao(
            "/administrativa/pagamentos/opcoes"
        );

        setFases(dados.fases || []);
        setOrcamentos(dados.orcamentos || []);
    }, [requisicao]);

    // -------------------------------------------------
    // CARREGAR PAGAMENTOS DO PERÍODO
    // -------------------------------------------------


    const carregarPagamentos = useCallback(async (
        novoDeslocamento = 0,
        inicial = false
    ) => {
        if (inicial) {
            setCarregando(true);
        } else {
            setCarregandoPeriodo(true);
        }

        setErro("");

        try {
            const dados = await requisicao(
                `/administrativa/pagamentos?deslocamento=${novoDeslocamento}`
            );

            setFasesPagamento(dados.fases || []);

            setPeriodo({
                ...dados.periodo,
                ...(dados.resumo || {})
            });

            setDeslocamento(novoDeslocamento);

        } catch (error) {
            setErro(obterErro(error));
        } finally {
            setCarregando(false);
            setCarregandoPeriodo(false);
        }
    }, [requisicao]);

    // -------------------------------------------------
    // CARREGAMENTO INICIAL
    // -------------------------------------------------

    useEffect(() => {
        const iniciar = async () => {
            setCarregando(true);

            try {
                await carregarOpcoes();
                await carregarPagamentos(0, true);
            } catch (error) {
                setErro(obterErro(error));
                setCarregando(false);
            }
        };

        iniciar();
    }, [carregarOpcoes, carregarPagamentos]);

    // -------------------------------------------------
    // FILTRO DE FASE
    // -------------------------------------------------

    const faseSelecionada = useMemo(() => {
        return fases.find(
            (fase) =>
                fase.fase.toLowerCase() ===
                faseBusca.trim().toLowerCase()
        );
    }, [fases, faseBusca]);

    const orcamentosDisponiveis = useMemo(() => {
        if (!faseSelecionada) {
            return orcamentos;
        }

        return orcamentos.filter(
            (item) =>
                Number(item.fase_id) === Number(faseSelecionada.id)
        );
    }, [orcamentos, faseSelecionada]);

    const opcoesOrcamentos = useMemo(() => {
        return orcamentosDisponiveis.map((item) => ({
            ...item,
            identificacao: `${item.pagamento} | ${item.fase} | #${item.id}`
        }));
    }, [orcamentosDisponiveis]);

    // -------------------------------------------------
    // SELECIONAR ORÇAMENTO
    // -------------------------------------------------

    const selecionarOrcamento = (texto) => {
        setOrcamentoBusca(texto);
        setErro("");
        setMensagem("");

        const encontrado = opcoesOrcamentos.find(
            (item) => item.identificacao === texto
        );

        if (!encontrado) {
            setOrcamentoSelecionado(null);
            setValor("");
            return;
        }

        setOrcamentoSelecionado(encontrado);

        if (encontrado.tipo_valor === "fixo") {
            setValor(Number(encontrado.valor).toFixed(2));
        } else {
            setValor("");
        }
    };

    // -------------------------------------------------
    // REGISTRAR PAGAMENTO
    // -------------------------------------------------

    const enviarPagamento = async (event) => {
        event.preventDefault();

        setErro("");
        setMensagem("");

        if (!orcamentoSelecionado) {
            setErro("Selecione um orçamento válido.");
            return;
        }

        if (!valor || Number(valor) <= 0) {
            setErro("Informe um valor válido para o pagamento.");
            return;
        }

        if (!data) {
            setErro("Informe a data do pagamento.");
            return;
        }

        setSalvando(true);

        try {
            await requisicao("/administrativa/pagamentos", {
                method: "POST",
                body: JSON.stringify({
                    orcamento_id: orcamentoSelecionado.id,
                    observacao: observacao.trim(),
                    valor: Number(valor).toFixed(2),
                    data
                })
            });

            setMensagem("Pagamento registrado com sucesso!");

            setFaseBusca("");
            setOrcamentoBusca("");
            setOrcamentoSelecionado(null);
            setValor("");
            setObservacao("");
            setData(dataHojePagamento());

            await Promise.all([
                carregarOpcoes(),
                carregarPagamentos(deslocamento)
            ]);

        } catch (error) {
            setErro(obterErro(error));
        } finally {
            setSalvando(false);
        }
    };

    // -------------------------------------------------
    // NAVEGAÇÃO DOS PERÍODOS
    // -------------------------------------------------


    const irParaPeriodoAnterior = () => {
        carregarPagamentos(deslocamento - 1);
    };

    const irParaPeriodoSeguinte = () => {
        carregarPagamentos(deslocamento + 1);
    };

    const voltarPeriodoAtual = () => {
        carregarPagamentos(0);
    };


    // -------------------------------------------------
    // CARREGAMENTO
    // -------------------------------------------------


    if (carregando) {
        return (
            <div className="regpag-loading-container">
                <div className="regpag-loading-card">

                    <div className="regpag-loading-icon">
                        <span className="regpag-loading-spinner"></span>
                    </div>

                    <div className="regpag-loading-identificacao">
                        <strong>Iron Executions</strong>
                        <span>GESTÃO FINANCEIRA</span>
                    </div>

                    <div className="regpag-loading-conteudo">
                        <div className="regpag-loading-pontos">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <h3>Carregando pagamentos</h3>

                        <p>
                            Estamos consultando os registros e organizando
                            as informações dos pagamentos.
                        </p>
                    </div>

                    <div className="regpag-loading-rodape">
                        <span className="regpag-loading-status"></span>
                        Consultando registros financeiros...
                    </div>

                </div>
            </div>
        );
    }


    // -------------------------------------------------
    // INTERFACE
    // -------------------------------------------------


    return (
        <section className="iron-pagamentos-page">

            {/* CABEÇALHO */}
            <header className="iron-pagamentos-header">
                <div className="iron-pagamentos-header-conteudo">
                    <span className="iron-pagamentos-header-identificador">
                        ADMINISTRAÇÃO FINANCEIRA
                    </span>

                    <h2>Pagamentos</h2>

                    <p>
                        Gerencie os compromissos financeiros e acompanhe
                        os pagamentos realizados em cada fase.
                    </p>
                </div>

                <div className="iron-pagamentos-header-status">
                    <span className="iron-pagamentos-status-indicador" />
                    Controle financeiro
                </div>
            </header>

            {/* FORMULÁRIO */}
            <section className="iron-pagamentos-form-card">

                <div className="iron-pagamentos-section-heading">
                    <div className="iron-pagamentos-heading-icon">
                        <span>01</span>
                    </div>

                    <div>
                        <h3>Registrar pagamento</h3>
                        <p>
                            Informe os dados do compromisso financeiro
                            e registre o pagamento realizado.
                        </p>
                    </div>
                </div>

                <form
                    className="iron-pagamentos-form"
                    onSubmit={enviarPagamento}
                >

                    {/* FASE */}

                    <div className="iron-pagamentos-fases-seletor">
                        <label className="iron-pagamentos-fases-titulo">
                            Fase administrativa
                        </label>

                        <div className="iron-pagamentos-fases-botoes">
                            {fases.map((fase) => (
                                <button
                                    key={fase.id}
                                    type="button"
                                    className={`iron-pagamentos-fase-opcao ${faseBusca === fase.fase
                                        ? "iron-pagamentos-fase-opcao-ativa"
                                        : ""
                                        }`}
                                    onClick={() => {
                                        setFaseBusca(fase.fase);
                                        setOrcamentoBusca("");
                                        setOrcamentoSelecionado(null);
                                        setValor("");
                                    }}
                                >
                                    <span className="iron-pagamentos-fase-indicador"></span>

                                    <span className="iron-pagamentos-fase-nome">
                                        {fase.fase}
                                    </span>

                                    {faseBusca === fase.fase && (
                                        <span className="iron-pagamentos-fase-check">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <small className="iron-pagamentos-fases-ajuda">
                            Selecione uma fase para filtrar os orçamentos.
                            Para visualizar todas, desmarque a fase selecionada.
                        </small>

                        {faseBusca && (
                            <button
                                type="button"
                                className="iron-pagamentos-fases-limpar"
                                onClick={() => {
                                    setFaseBusca("");
                                    setOrcamentoBusca("");
                                    setOrcamentoSelecionado(null);
                                    setValor("");
                                }}
                            >
                                Limpar seleção
                            </button>
                        )}
                    </div>

                    {/* ORÇAMENTO............. */}

                    <div className="iron-pagamentos-compromisso-dropdown">
                        <label
                            className="iron-pagamentos-compromisso-label"
                            htmlFor="pagamento-orcamento"
                        >
                            Compromisso financeiro
                        </label>

                        <div className="iron-pagamentos-compromisso-campo">
                            <span className="iron-pagamentos-compromisso-icone">
                                <i className="fas fa-search"></i>
                            </span>

                            <input
                                id="pagamento-orcamento"
                                type="text"
                                placeholder="Pesquise um compromisso..."
                                value={orcamentoBusca}
                                onChange={(event) => {
                                    selecionarOrcamento(event.target.value);
                                    setOrcamentoListaAberta(true);
                                }}
                                onFocus={() => setOrcamentoListaAberta(true)}
                                autoComplete="off"
                            />

                            <button
                                type="button"
                                className={`iron-pagamentos-compromisso-seta ${orcamentoListaAberta ? "iron-pagamentos-compromisso-seta-ativa" : ""
                                    }`}
                                onClick={() => setOrcamentoListaAberta(!orcamentoListaAberta)}
                            >
                                <i className="fas fa-chevron-down"></i>
                            </button>
                        </div>

                        {orcamentoListaAberta && (
                            <div className="iron-pagamentos-compromisso-lista">
                                {opcoesOrcamentos
                                    .filter((item) =>
                                        item.identificacao
                                            .toLowerCase()
                                            .includes(orcamentoBusca.toLowerCase())
                                    )
                                    .map((item) => (
                                        <button
                                            type="button"
                                            key={item.id}
                                            className={`iron-pagamentos-compromisso-opcao ${orcamentoSelecionado?.id === item.id
                                                ? "iron-pagamentos-compromisso-opcao-ativa"
                                                : ""
                                                }`}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => {
                                                selecionarOrcamento(item.identificacao);
                                                setOrcamentoListaAberta(false);
                                            }}
                                        >
                                            <span className="iron-pagamentos-compromisso-opcao-icone">
                                                <i className="fas fa-file-invoice-dollar"></i>
                                            </span>

                                            <span className="iron-pagamentos-compromisso-opcao-texto">
                                                <strong>{item.identificacao}</strong>
                                                <small>Compromisso financeiro</small>
                                            </span>

                                            {orcamentoSelecionado?.id === item.id && (
                                                <span className="iron-pagamentos-compromisso-opcao-check">
                                                    <i className="fas fa-check"></i>
                                                </span>
                                            )}
                                        </button>
                                    ))}

                                {opcoesOrcamentos.filter((item) =>
                                    item.identificacao
                                        .toLowerCase()
                                        .includes(orcamentoBusca.toLowerCase())
                                ).length === 0 && (
                                        <div className="iron-pagamentos-compromisso-vazio">
                                            <i className="fas fa-folder-open"></i>
                                            <strong>Nenhum compromisso encontrado</strong>
                                            <small>Não existem compromissos correspondentes à pesquisa.</small>
                                        </div>
                                    )}
                            </div>
                        )}

                        {opcoesOrcamentos.length === 0 && (
                            <small className="iron-pagamentos-compromisso-ajuda">
                                Nenhum orçamento encontrado para essa fase.
                            </small>
                        )}
                    </div>


                    {/* DETALHES DO ORÇAMENTO */}
                    {orcamentoSelecionado && (
                        <div className="iron-pagamentos-compromisso">
                            <div className="iron-pagamentos-compromisso-topo">
                                <span>COMPROMISSO SELECIONADO</span>
                                <span className="iron-pagamentos-compromisso-check">
                                    ✓
                                </span>
                            </div>

                            <strong>
                                {orcamentoSelecionado.pagamento}
                            </strong>

                            <div className="iron-pagamentos-compromisso-detalhes">
                                <span>
                                    Fase: {orcamentoSelecionado.fase}
                                </span>

                                <span>
                                    Vencimento: dia {orcamentoSelecionado.dia_vencimento}
                                </span>

                                <span>
                                    {orcamentoSelecionado.tipo_valor === "fixo"
                                        ? `Valor original: ${moedaPagamento(
                                            orcamentoSelecionado.valor
                                        )}`
                                        : `Compromisso percentual: ${Number(
                                            orcamentoSelecionado.valor
                                        ).toLocaleString("pt-BR")}%`
                                    }
                                </span>
                            </div>
                        </div>
                    )}

                    {/* VALOR */}
                    <div className="iron-pagamentos-field">
                        <label htmlFor="pagamento-valor">
                            Valor pago
                        </label>

                        <div className="iron-pagamentos-money-input">
                            <span>R$</span>

                            <input
                                id="pagamento-valor"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0,00"
                                value={valor}
                                onChange={(event) =>
                                    setValor(event.target.value)
                                }
                            />
                        </div>

                        <small>
                            O valor pode ser alterado antes de registrar.
                        </small>
                    </div>

                    {/* DATA */}
                    <div className="iron-pagamentos-field">
                        <label htmlFor="pagamento-data">
                            Data do pagamento
                        </label>

                        <input
                            id="pagamento-data"
                            type="date"
                            value={data}
                            onChange={(event) =>
                                setData(event.target.value)
                            }
                        />
                    </div>

                    {/* OBSERVAÇÃO */}
                    <div className="iron-pagamentos-field iron-pagamentos-field-observacao">
                        <label htmlFor="pagamento-observacao">
                            Observação
                        </label>

                        <textarea
                            id="pagamento-observacao"
                            rows="3"
                            maxLength="2000"
                            placeholder="Adicione informações sobre este pagamento..."
                            value={observacao}
                            onChange={(event) =>
                                setObservacao(event.target.value)
                            }
                        />
                    </div>

                    {/* MENSAGENS */}
                    {erro && (
                        <div className="iron-pagamentos-feedback iron-pagamentos-feedback-erro">
                            <span>!</span>
                            {erro}
                        </div>
                    )}

                    {mensagem && (
                        <div className="iron-pagamentos-feedback iron-pagamentos-feedback-sucesso">
                            <span>✓</span>
                            {mensagem}
                        </div>
                    )}

                    {/* AÇÃO */}
                    <div className="iron-pagamentos-form-acoes">
                        <button
                            type="submit"
                            className="iron-pagamentos-btn-registrar"
                            disabled={
                                salvando ||
                                !orcamentoSelecionado ||
                                !valor ||
                                Number(valor) <= 0 ||
                                !data
                            }
                        >
                            {salvando
                                ? "Registrando pagamento..."
                                : "Registrar pagamento"
                            }
                        </button>
                    </div>

                </form>
            </section>

            {/* HISTÓRICO */}
            <section className="iron-pagamentos-historico">

                {/* CABEÇALHO DO HISTÓRICO */}
                <div className="iron-pagamentos-historico-header">

                    <div className="iron-pagamentos-section-heading">
                        <div className="iron-pagamentos-heading-icon">
                            <span>02</span>
                        </div>

                        <div>
                            <h3>Histórico financeiro</h3>
                            <p>
                                Acompanhe os pagamentos e resultados
                                financeiros de cada período.
                            </p>
                        </div>
                    </div>

                    {/* NAVEGAÇÃO */}
                    <div className="iron-pagamentos-periodo-navegacao">

                        <button
                            type="button"
                            className="iron-pagamentos-periodo-seta"
                            onClick={irParaPeriodoAnterior}
                            disabled={carregandoPeriodo}
                            aria-label="Período anterior"
                        >
                            &#8592;
                        </button>

                        <div className="iron-pagamentos-periodo-info">
                            <strong>
                                {dataFormatadaPagamento(periodo.data_comeco)}
                                {" "}até{" "}
                                {dataFormatadaPagamento(periodo.data_fim)}
                            </strong>

                            <span>
                                {deslocamento === 0
                                    ? "Período atual"
                                    : deslocamento < 0
                                        ? `${Math.abs(deslocamento)} ${Math.abs(deslocamento) === 1
                                            ? "período anterior"
                                            : "períodos anteriores"
                                        }`
                                        : `${deslocamento} ${deslocamento === 1
                                            ? "período seguinte"
                                            : "períodos seguintes"
                                        }`
                                }
                            </span>
                        </div>

                        <button
                            type="button"
                            className="iron-pagamentos-periodo-seta"
                            onClick={irParaPeriodoSeguinte}
                            disabled={carregandoPeriodo}
                            aria-label="Próximo período"
                        >
                            &#8594;
                        </button>

                        {deslocamento !== 0 && (
                            <button
                                type="button"
                                className="iron-pagamentos-periodo-atual"
                                onClick={voltarPeriodoAtual}
                                disabled={carregandoPeriodo}
                            >
                                Voltar ao período atual
                            </button>
                        )}

                    </div>
                </div>

                {/* INDICADORES FINANCEIROS */}
                <div className="iron-pagamentos-resumo">

                    <article className="iron-pagamentos-resumo-card iron-pagamentos-resumo-vendido">
                        <div className="iron-pagamentos-resumo-topo">
                            <span className="iron-pagamentos-resumo-label">
                                TOTAL VENDIDO
                            </span>

                            <span className="iron-pagamentos-resumo-simbolo">
                                V
                            </span>
                        </div>

                        <strong>
                            {moedaPagamento(periodo.total_vendido)}
                        </strong>

                        <small>
                            {periodo.quantidade_vendas || 0} vendas no período
                        </small>
                    </article>

                    <article className="iron-pagamentos-resumo-card iron-pagamentos-resumo-pago">
                        <div className="iron-pagamentos-resumo-topo">
                            <span className="iron-pagamentos-resumo-label">
                                TOTAL PAGO
                            </span>

                            <span className="iron-pagamentos-resumo-simbolo">
                                ✓
                            </span>
                        </div>

                        <strong>
                            {moedaPagamento(periodo.total_pago)}
                        </strong>

                        <small>
                            {periodo.quantidade_pagamentos || 0} pagamentos realizados
                        </small>
                    </article>

                    <article className="iron-pagamentos-resumo-card iron-pagamentos-resumo-saldo">
                        <div className="iron-pagamentos-resumo-topo">
                            <span className="iron-pagamentos-resumo-label">
                                SALDO RESTANTE
                            </span>

                            <span className="iron-pagamentos-resumo-simbolo">
                                $
                            </span>
                        </div>

                        <strong>
                            {moedaPagamento(periodo.saldo_restante)}
                        </strong>

                        <small>
                            Vendas menos pagamentos realizados
                        </small>
                    </article>

                </div>

                {/* LISTAGEM DAS FASES */}

                <div className="iron-pagamentos-detalhamento-area">

                    <div className="iron-pagamentos-detalhamento-heading">
                        <div>
                            <h3>Pagamentos por fase</h3>
                            <p>Detalhamento dos compromissos financeiros.</p>
                        </div>

                        <span className="iron-pagamentos-detalhamento-contagem">
                            {fasesPagamento.length} fases
                        </span>
                    </div>

                    {carregandoPeriodo ? (

                        <div className="iron-pagamentos-detalhamento-vazio">
                            <span className="iron-pagamentos-detalhamento-loading" />
                            Carregando informações financeiras...
                        </div>

                    ) : fasesPagamento.length === 0 ? (

                        <div className="iron-pagamentos-detalhamento-vazio">
                            Nenhuma fase cadastrada.
                        </div>

                    ) : (

                        <div className="iron-pagamentos-detalhamento-grid">

                            {fasesPagamento.map((fase) => (

                                <article
                                    className="iron-pagamentos-detalhamento-card"
                                    key={fase.fase_id}
                                >

                                    <div className="iron-pagamentos-detalhamento-card-topo">

                                        <div className="iron-pagamentos-detalhamento-identidade">

                                            <span className="iron-pagamentos-detalhamento-nivel">
                                                {fase.nivel}
                                            </span>

                                            <h4>{fase.fase}</h4>

                                            <span className="iron-pagamentos-detalhamento-quantidade">
                                                {fase.quantidade}{" "}
                                                {fase.quantidade === 1
                                                    ? "pagamento registrado"
                                                    : "pagamentos registrados"}
                                            </span>

                                        </div>

                                        <div className="iron-pagamentos-detalhamento-total">
                                            <span>TOTAL PAGO</span>
                                            <strong>
                                                {moedaPagamento(fase.total_pago)}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="iron-pagamentos-detalhamento-lista-area">

                                        <div className="iron-pagamentos-detalhamento-lista-heading">
                                            <span>HISTÓRICO DE PAGAMENTOS</span>
                                            <span>{fase.pagamentos.length} registros</span>
                                        </div>

                                        {fase.pagamentos.length === 0 ? (

                                            <div className="iron-pagamentos-detalhamento-sem-registros">
                                                <span>0</span>
                                                <p>
                                                    Nenhum pagamento registrado nesta fase
                                                    durante este período.
                                                </p>
                                            </div>

                                        ) : (

                                            <div className="iron-pagamentos-detalhamento-itens">

                                                {fase.pagamentos.map((item) => (

                                                    <div
                                                        className="iron-pagamentos-detalhamento-item"
                                                        key={item.id}
                                                    >

                                                        <div className="iron-pagamentos-detalhamento-item-conteudo">

                                                            <strong>
                                                                {item.pagamento}
                                                            </strong>

                                                            <span>
                                                                {dataFormatadaPagamento(item.data)}
                                                            </span>

                                                            {item.observacao && (
                                                                <p>{item.observacao}</p>
                                                            )}

                                                        </div>

                                                        <strong className="iron-pagamentos-detalhamento-item-valor">
                                                            {moedaPagamento(item.valor)}
                                                        </strong>

                                                    </div>

                                                ))}

                                            </div>

                                        )}

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </div>


            </section>

        </section>
    );

}
