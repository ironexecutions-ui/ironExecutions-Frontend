import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../../../../../config";
import "./orcamentos.css";

// =====================================================
// FORMATAÇÃO
// =====================================================

const moeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

const formatarData = (data) => {
    if (!data) return "";

    const [ano, mes, dia] = String(data).slice(0, 10).split("-");

    return `${dia}/${mes}/${ano}`;
};

const calcularDataFim = (dataInicio) => {
    if (!dataInicio) return "";

    const [ano, mes, dia] = dataInicio.split("-").map(Number);

    const proximoMes = mes === 12 ? 1 : mes + 1;
    const proximoAno = mes === 12 ? ano + 1 : ano;

    const ultimoDia = new Date(
        proximoAno,
        proximoMes,
        0
    ).getDate();

    const diaFinal = Math.min(dia, ultimoDia);

    const resultado = new Date(
        proximoAno,
        proximoMes - 1,
        diaFinal
    );

    resultado.setDate(resultado.getDate() - 1);

    return [
        resultado.getFullYear(),
        String(resultado.getMonth() + 1).padStart(2, "0"),
        String(resultado.getDate()).padStart(2, "0"),
    ].join("-");
};

const obterErro = (error) => {
    const detalhe = error?.detail;

    if (typeof detalhe === "string") {
        return detalhe;
    }

    if (detalhe?.mensagem) {
        return detalhe.mensagem;
    }

    return "Não foi possível concluir a operação.";
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function Orcamentos() {
    // =====================================================
    // DATAS DA ADMINISTRAÇÃO
    // =====================================================

    const [dataComeco, setDataComeco] = useState("");
    const [dataComecoSalva, setDataComecoSalva] = useState("");
    const [dataFimSalva, setDataFimSalva] = useState("");
    const [periodoConfigurado, setPeriodoConfigurado] = useState(false);
    const [periodoAberto, setPeriodoAberto] = useState(true);

    // =====================================================
    // FASES E ORÇAMENTOS
    // =====================================================

    const [fases, setFases] = useState([]);
    const [orcamentos, setOrcamentos] = useState([]);

    // =====================================================
    // FORMULÁRIO
    // =====================================================

    const [faseSelecionada, setFaseSelecionada] = useState("");
    const [pagamento, setPagamento] = useState("");
    const [diaPagamento, setDiaPagamento] = useState("");
    const [valor, setValor] = useState("");

    // =====================================================
    // CARREGAMENTO E MENSAGENS
    // =====================================================

    const [carregando, setCarregando] = useState(true);
    const [salvandoDatas, setSalvandoDatas] = useState(false);
    const [salvandoOrcamento, setSalvandoOrcamento] = useState(false);
    const [excluindoId, setExcluindoId] = useState(null);

    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoValor, setTipoValor] = useState("fixo");
    // =====================================================
    // CÁLCULOS
    // =====================================================

    const dataFimCalculada = calcularDataFim(dataComeco);

    const datasAlteradas = dataComeco !== dataComecoSalva;

    const periodoPronto =
        periodoConfigurado &&
        !datasAlteradas &&
        Boolean(dataComecoSalva);

    const valorNumerico =
        Number(String(valor).replace(",", ".")) || 0;

    const diaNumerico = Number(diaPagamento);

    const diaValido =
        diaPagamento !== "" &&
        Number.isInteger(diaNumerico) &&
        diaNumerico >= 1 &&
        diaNumerico <= 31;

    const totalCadastrado = orcamentos.reduce(
        (total, item) => {
            if (item.tipo_valor === "porcentagem") return total;
            return total + Number(item.valor || 0);
        },
        0
    );

    const totalPorcentagemCadastrada = orcamentos.reduce(
        (total, item) => {
            if (item.tipo_valor !== "porcentagem") return total;
            return total + Number(item.valor || 0);
        },
        0
    );

    const quantidadeOrcamentos = orcamentos.length;

    const resumoPorFase = fases.map((fase) => {
        const compromissosDaFase = orcamentos.filter(
            (item) => Number(item.fase_id) === Number(fase.id)
        );

        const totalFixo = compromissosDaFase.reduce(
            (total, item) => {
                if (item.tipo_valor === "porcentagem") return total;
                return total + Number(item.valor || 0);
            },
            0
        );

        const totalPorcentagem = compromissosDaFase.reduce(
            (total, item) => {
                if (item.tipo_valor !== "porcentagem") return total;
                return total + Number(item.valor || 0);
            },
            0
        );

        return {
            id: fase.id,
            nome: fase.fase,
            nivel: fase.nivel,
            quantidade: compromissosDaFase.length,
            totalFixo,
            totalPorcentagem,
            compromissos: compromissosDaFase
        };
    });

    // =====================================================
    // REQUISIÇÕES
    // =====================================================

    const requisicao = useCallback(async (rota, opcoes = {}) => {
        const resposta = await fetch(`${API_URL}${rota}`, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                ...opcoes.headers,
            },
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw dados;
        }

        return dados;
    }, []);

    // =====================================================
    // CARREGAR FASES
    // =====================================================

    const carregarFases = useCallback(async () => {
        const dados = await requisicao("/administrativa/fases");

        setFases(dados.fases || []);
    }, [requisicao]);

    // =====================================================
    // CARREGAR ORÇAMENTOS
    // =====================================================

    const carregarResumo = useCallback(async () => {
        const dados = await requisicao(
            "/administrativa/orcamentos/resumo"
        );

        const listaOrdenada = [...(dados.orcamentos || [])].sort(
            (a, b) =>
                Number(a.dia_vencimento || 0) -
                Number(b.dia_vencimento || 0)
        );

        setOrcamentos(listaOrdenada);
    }, [requisicao]);

    // =====================================================
    // CARREGAR CONFIGURAÇÕES INICIAIS
    // =====================================================

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [dadosDatas] = await Promise.all([
                requisicao("/administrativa/datas-administracao"),
                carregarFases(),
            ]);

            if (dadosDatas.configurado && dadosDatas.periodo) {
                const inicio = String(
                    dadosDatas.periodo.data_comeco
                ).slice(0, 10);

                const fim = String(
                    dadosDatas.periodo.data_fim
                ).slice(0, 10);

                setDataComeco(inicio);
                setDataComecoSalva(inicio);
                setDataFimSalva(fim);
                setPeriodoConfigurado(true);
                setPeriodoAberto(false);

                await carregarResumo();
            } else {
                setPeriodoConfigurado(false);
                setPeriodoAberto(true);

                setDataComeco("");
                setDataComecoSalva("");
                setDataFimSalva("");

                setOrcamentos([]);
            }
        } catch (error) {
            setErro(obterErro(error));
        } finally {
            setCarregando(false);
        }
    }, [requisicao, carregarFases, carregarResumo]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // =====================================================
    // SALVAR DATAS DA ADMINISTRAÇÃO
    // =====================================================

    const salvarDatas = async () => {
        if (!dataComeco) {
            setErro("Informe a data de início da administração.");
            return;
        }

        setErro("");
        setMensagem("");
        setSalvandoDatas(true);

        try {
            const dados = await requisicao(
                "/administrativa/datas-administracao",
                {
                    method: "POST",
                    body: JSON.stringify({
                        data_comeco: dataComeco,
                    }),
                }
            );

            const inicio = String(
                dados.periodo.data_comeco
            ).slice(0, 10);

            const fim = String(
                dados.periodo.data_fim
            ).slice(0, 10);

            setDataComeco(inicio);
            setDataComecoSalva(inicio);
            setDataFimSalva(fim);
            setPeriodoConfigurado(true);
            setPeriodoAberto(false);

            await carregarResumo();

            setMensagem(
                "Datas da administração salvas com sucesso!"
            );
        } catch (error) {
            setErro(obterErro(error));
        } finally {
            setSalvandoDatas(false);
        }
    };

    // =====================================================
    // ADICIONAR ORÇAMENTO
    // =====================================================

    const adicionarOrcamento = async (event) => {
        event.preventDefault();

        setErro("");
        setMensagem("");

        if (!periodoPronto) {
            setErro("Salve primeiro as datas da administração.");
            return;
        }

        if (!faseSelecionada) {
            setErro("Selecione uma fase.");
            return;
        }

        if (!pagamento.trim()) {
            setErro("Informe o que será pago.");
            return;
        }

        if (!diaValido) {
            setErro("Informe um dia de vencimento válido entre 1 e 31.");
            return;
        }

        if (valorNumerico <= 0) {
            setErro("Informe um valor maior que zero.");
            return;
        }

        if (tipoValor === "porcentagem" && valorNumerico > 100) {
            setErro("A porcentagem não pode ser superior a 100%.");
            return;
        }

        setSalvandoOrcamento(true);

        try {
            await requisicao("/administrativa/orcamentos", {
                method: "POST",
                body: JSON.stringify({
                    fase_id: Number(faseSelecionada),
                    pagamento: pagamento.trim(),
                    dia_vencimento: diaNumerico,
                    tipo_valor: tipoValor,
                    valor: valorNumerico.toFixed(2)
                })
            });

            setValor("");
            setFaseSelecionada("");
            setPagamento("");
            setDiaPagamento("");
            setTipoValor("fixo");

            await carregarResumo();

            setMensagem("Compromisso cadastrado com sucesso!");

        } catch (error) {
            setErro(obterErro(error));
        } finally {
            setSalvandoOrcamento(false);
        }
    };

    // =====================================================
    // EXCLUIR ORÇAMENTO
    // =====================================================

    const excluirOrcamento = async (id) => {
        const confirmar = window.confirm(
            "Deseja realmente excluir este orçamento?"
        );

        if (!confirmar) return;

        setErro("");
        setMensagem("");
        setExcluindoId(id);

        try {
            await requisicao(
                `/administrativa/orcamentos/${id}`,
                {
                    method: "DELETE",
                }
            );

            await carregarResumo();

            setMensagem(
                "Orçamento excluído com sucesso!"
            );
        } catch (error) {
            setErro(obterErro(error));
        } finally {
            setExcluindoId(null);
        }
    };

    // =====================================================
    // CARREGAMENTO
    // =====================================================


    if (carregando) {
        return (
            <div className="orc-loading-container">
                <div className="orc-loading-card">
                    <div className="orc-loading-brand">
                        <div className="orc-loading-icon">
                            <span className="orc-loading-spinner"></span>
                        </div>

                        <div className="orc-loading-identificacao">
                            <strong>Iron Executions</strong>
                            <span>ADMINISTRAÇÃO FINANCEIRA</span>
                        </div>
                    </div>

                    <div className="orc-loading-conteudo">
                        <div className="orc-loading-indicador">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <h3>Preparando seu ambiente</h3>

                        <p>
                            Estamos organizando as informações financeiras
                            para apresentar seus dados.
                        </p>
                    </div>

                    <div className="orc-loading-rodape">
                        <span className="orc-loading-ponto"></span>
                        Sincronizando informações...
                    </div>
                </div>
            </div>
        );
    }


    // =====================================================
    // INTERFACE
    // =====================================================


    // =====================================================
    // CARREGAMENTO
    // =====================================================

    if (carregando) {
        return (
            <section className="orc-container">
                <div className="orc-loading">
                    <span className="orc-loading-spinner"></span>
                    <p>Carregando administração financeira...</p>
                </div>
            </section>
        );
    }

    // =====================================================
    // INTERFACE
    // =====================================================

    return (
        <section className="orc-container">

            {/* CABEÇALHO PRINCIPAL */}
            <header className="orc-header">
                <div className="orc-header-content">
                    <div className="orc-header-identificacao">
                        <span className="orc-header-eyebrow">
                            GESTÃO FINANCEIRA
                        </span>

                        <h2>Orçamentos</h2>

                        <p>
                            Organize os compromissos financeiros da empresa,
                            controle os vencimentos e acompanhe os valores
                            distribuídos entre as fases administrativas.
                        </p>
                    </div>

                    <div className="orc-header-indicador">
                        <span className="orc-header-indicador-label">
                            SITUAÇÃO DA ADMINISTRAÇÃO
                        </span>

                        <span
                            className={`orc-header-status ${periodoPronto ? "orc-status-ativo" : "orc-status-pendente"
                                }`}
                        >
                            <span className="orc-status-ponto"></span>
                            {periodoPronto ? "Período configurado" : "Aguardando configuração"}
                        </span>
                    </div>
                </div>
            </header>

            {/* PERÍODO DA ADMINISTRAÇÃO */}
            <section className="orc-periodo-section">

                {periodoConfigurado && !periodoAberto ? (
                    <div className="orc-periodo-resumo">
                        <div className="orc-periodo-resumo-info">
                            <div className="orc-periodo-icone">
                                <span>CAL</span>
                            </div>

                            <div>
                                <span className="orc-section-eyebrow">
                                    PERÍODO ADMINISTRATIVO
                                </span>

                                <h3>Administração em andamento</h3>

                                <p>
                                    De <strong>{formatarData(dataComecoSalva)}</strong>
                                    {" "}até{" "}
                                    <strong>{formatarData(dataFimSalva)}</strong>
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="orc-btn-secundario"
                            onClick={() => {
                                setPeriodoAberto(true);
                                setErro("");
                                setMensagem("");
                            }}
                        >
                            Editar período
                        </button>
                    </div>
                ) : (
                    <div className="orc-panel orc-periodo-panel">

                        <div className="orc-panel-header">
                            <div>
                                <span className="orc-section-eyebrow">
                                    CONFIGURAÇÃO INICIAL
                                </span>

                                <h3>Período da administração</h3>

                                <p>
                                    Defina a data de início. A data de encerramento
                                    será calculada automaticamente pelo sistema.
                                </p>
                            </div>

                            <span
                                className={`orc-periodo-badge ${periodoPronto ? "orc-periodo-badge-ativo" : "orc-periodo-badge-pendente"
                                    }`}
                            >
                                {periodoPronto ? "Configurado" : "Pendente"}
                            </span>
                        </div>

                        <div className="orc-periodo-form">

                            <div className="orc-field">
                                <label htmlFor="orc-data-inicio">
                                    Data de início
                                </label>

                                <input
                                    id="orc-data-inicio"
                                    type="date"
                                    value={dataComeco}
                                    onChange={(event) => {
                                        setDataComeco(event.target.value);
                                        setErro("");
                                        setMensagem("");
                                    }}
                                />
                            </div>

                            <div className="orc-field">
                                <label htmlFor="orc-data-fim">
                                    Encerramento automático
                                </label>

                                <input
                                    id="orc-data-fim"
                                    type="date"
                                    value={dataFimCalculada}
                                    readOnly
                                />

                                <small>
                                    Calculado automaticamente pelo sistema.
                                </small>
                            </div>

                            <div className="orc-periodo-acoes">
                                <button
                                    type="button"
                                    className="orc-btn-principal"
                                    onClick={salvarDatas}
                                    disabled={
                                        salvandoDatas ||
                                        !dataComeco ||
                                        (!datasAlteradas && periodoConfigurado)
                                    }
                                >
                                    {salvandoDatas
                                        ? "Salvando..."
                                        : "Salvar período"}
                                </button>

                                {periodoConfigurado && (
                                    <button
                                        type="button"
                                        className="orc-btn-texto"
                                        onClick={() => {
                                            setDataComeco(dataComecoSalva);
                                            setPeriodoAberto(false);
                                            setErro("");
                                            setMensagem("");
                                        }}
                                    >
                                        Cancelar edição
                                    </button>
                                )}
                            </div>
                        </div>

                        {periodoConfigurado && (
                            <div className="orc-periodo-confirmacao">
                                <span className="orc-confirmacao-indicador"></span>

                                <span>
                                    Administração cadastrada de{" "}
                                    <strong>{formatarData(dataComecoSalva)}</strong>
                                    {" "}até{" "}
                                    <strong>{formatarData(dataFimSalva)}</strong>
                                </span>
                            </div>
                        )}

                        {periodoConfigurado && datasAlteradas && (
                            <div className="orc-alerta orc-alerta-erro">
                                <strong>Atenção:</strong> você alterou a data de
                                início. Salve o novo período antes de cadastrar
                                compromissos financeiros.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* MENSAGENS DO SISTEMA */}
            {erro && (
                <div className="orc-alerta orc-alerta-erro">
                    <strong>Não foi possível concluir.</strong>
                    <span>{erro}</span>
                </div>
            )}

            {mensagem && (
                <div className="orc-alerta orc-alerta-sucesso">
                    <strong>Operação concluída.</strong>
                    <span>{mensagem}</span>
                </div>
            )}

            {/* CONTEÚDO FINANCEIRO */}
            {!periodoPronto ? (
                <div className="orc-empty-state">
                    <div className="orc-empty-icon">
                        <span>!</span>
                    </div>

                    <h3>Configure sua administração</h3>

                    <p>
                        Antes de cadastrar compromissos financeiros,
                        é necessário definir o período administrativo
                        da empresa.
                    </p>

                    <span className="orc-empty-hint">
                        Após configurar o período, todas as ferramentas
                        financeiras estarão disponíveis.
                    </span>
                </div>
            ) : (
                <div className="orc-workspace">

                    {/* CADASTRO DE COMPROMISSOS */}
                    <section className="orc-panel orc-cadastro-panel">

                        <div className="orc-panel-header">
                            <div>
                                <span className="orc-section-eyebrow">
                                    NOVO REGISTRO
                                </span>

                                <h3>Cadastrar compromisso financeiro</h3>

                                <p>
                                    Registre as despesas e obrigações financeiras
                                    vinculadas a cada fase da empresa.
                                </p>
                            </div>

                            <div className="orc-panel-icon">
                                +
                            </div>
                        </div>

                        <form
                            onSubmit={adicionarOrcamento}
                            className="orc-formulario"
                        >


                            <div className="orc-fase-selecao">
                                <div className="orc-fase-selecao-header">
                                    <div>
                                        <label>Fase administrativa</label>
                                        <p>Selecione a fase à qual este compromisso pertence.</p>
                                    </div>

                                    <span className="orc-fase-selecao-contador">
                                        {fases.length} {fases.length === 1 ? "fase" : "fases"}
                                    </span>
                                </div>

                                {fases.length > 0 ? (
                                    <div className="orc-fase-opcoes">
                                        {fases.map((fase) => {
                                            const selecionada =
                                                Number(faseSelecionada) === Number(fase.id);

                                            return (
                                                <button
                                                    key={fase.id}
                                                    type="button"
                                                    className={`orc-fase-opcao ${selecionada ? "orc-fase-opcao-ativa" : ""
                                                        }`}
                                                    onClick={() => setFaseSelecionada(String(fase.id))}
                                                    aria-pressed={selecionada}
                                                >
                                                    <span className="orc-fase-opcao-nivel">
                                                        {fase.nivel}
                                                    </span>

                                                    <span className="orc-fase-opcao-info">
                                                        <strong>{fase.fase}</strong>
                                                        <small>Fase administrativa</small>
                                                    </span>

                                                    <span className="orc-fase-opcao-check">
                                                        {selecionada ? "✓" : ""}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="orc-fase-sem-opcoes">
                                        Nenhuma fase cadastrada. Cadastre uma fase antes de adicionar
                                        compromissos financeiros.
                                    </div>
                                )}

                                {!faseSelecionada && fases.length > 0 && (
                                    <small className="orc-fase-selecao-ajuda">
                                        Selecione uma fase para continuar.
                                    </small>
                                )}
                            </div>


                            <div className="orc-field">
                                <label htmlFor="orc-pagamento">
                                    Descrição do compromisso
                                </label>

                                <input
                                    id="orc-pagamento"
                                    type="text"
                                    placeholder="Ex.: Aluguel, internet, energia elétrica..."
                                    maxLength={255}
                                    value={pagamento}
                                    onChange={(event) =>
                                        setPagamento(event.target.value)
                                    }
                                />
                            </div>

                            <div className="orc-form-row">

                                <div className="orc-field">
                                    <label htmlFor="orc-vencimento">
                                        Dia do vencimento
                                    </label>

                                    <input
                                        id="orc-vencimento"
                                        type="number"
                                        min="1"
                                        max="31"
                                        step="1"
                                        placeholder="Ex.: 10"
                                        value={diaPagamento}
                                        onChange={(event) => {
                                            const novoValor = event.target.value;

                                            if (
                                                novoValor === "" ||
                                                (
                                                    /^\d+$/.test(novoValor) &&
                                                    Number(novoValor) <= 31
                                                )
                                            ) {
                                                setDiaPagamento(novoValor);
                                            }
                                        }}
                                    />

                                    <small>
                                        Informe um dia entre 1 e 31.
                                    </small>

                                    {diaPagamento !== "" && !diaValido && (
                                        <small className="orc-field-error">
                                            Informe um dia inteiro válido.
                                        </small>
                                    )}
                                </div>


                                <div className="orc-field">
                                    <label>Tipo de compromisso</label>

                                    <div className="orc-tipo-opcoes">
                                        <button
                                            type="button"
                                            className={`orc-tipo-opcao ${tipoValor === "fixo" ? "orc-tipo-opcao-ativa" : ""
                                                }`}
                                            onClick={() => setTipoValor("fixo")}
                                            aria-pressed={tipoValor === "fixo"}
                                        >
                                            <span className="orc-tipo-opcao-icone">R$</span>
                                            <span className="orc-tipo-opcao-texto">
                                                <strong>Valor fixo</strong>
                                                <strong style={{ fontWeight: "12px" }} > Em reais</strong>
                                            </span>
                                            <span className="orc-tipo-opcao-check">
                                                {tipoValor === "fixo" ? "✓" : ""}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            className={`orc-tipo-opcao ${tipoValor === "porcentagem" ? "orc-tipo-opcao-ativa" : ""
                                                }`}
                                            onClick={() => setTipoValor("porcentagem")}
                                            aria-pressed={tipoValor === "porcentagem"}
                                        >
                                            <span className="orc-tipo-opcao-icone">%</span>
                                            <span className="orc-tipo-opcao-texto">
                                                <strong>Porcentagem</strong>
                                                <strong style={{ fontWeight: "12px" }} > Em percentual</strong>

                                            </span>
                                            <span className="orc-tipo-opcao-check">
                                                {tipoValor === "porcentagem" ? "✓" : ""}
                                            </span>
                                        </button>
                                    </div>

                                    <small>
                                        Escolha como o compromisso será contabilizado.
                                    </small>
                                </div>

                            </div>

                            <div className="orc-field">
                                <label htmlFor="orc-valor">
                                    {tipoValor === "fixo"
                                        ? "Valor do compromisso"
                                        : "Porcentagem do compromisso"}
                                </label>

                                <div className="orc-input-valor">
                                    <span>
                                        {tipoValor === "fixo" ? "R$" : "%"}
                                    </span>

                                    <input
                                        id="orc-valor"
                                        type="number"
                                        min="0.01"
                                        max={tipoValor === "porcentagem" ? "100" : undefined}
                                        step="0.01"
                                        placeholder="0,00"
                                        value={valor}
                                        onChange={(event) =>
                                            setValor(event.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="orc-form-footer">
                                <span>
                                    Os dados serão vinculados à fase selecionada.
                                </span>

                                <button
                                    type="submit"
                                    className="orc-btn-principal orc-btn-adicionar"
                                    disabled={
                                        salvandoOrcamento ||
                                        !periodoPronto ||
                                        !faseSelecionada ||
                                        !pagamento.trim() ||
                                        !diaValido ||
                                        valorNumerico <= 0 ||
                                        (tipoValor === "porcentagem" && valorNumerico > 100)
                                    }
                                >
                                    {salvandoOrcamento
                                        ? "Salvando compromisso..."
                                        : "Adicionar compromisso"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* INDICADORES FINANCEIROS */}
                    <section className="orc-indicadores">

                        <article className="orc-indicador-card orc-indicador-total">
                            <div className="orc-indicador-topo">
                                <span className="orc-indicador-label">
                                    TOTAL DE VALORES CADASTRADOS
                                </span>

                                <span className="orc-indicador-icon">
                                    R$
                                </span>
                            </div>

                            <strong className="orc-indicador-valor">
                                {moeda(totalCadastrado)}
                            </strong>

                            <span className="orc-indicador-descricao">
                                Soma dos compromissos com valores fixos.
                            </span>
                        </article>

                        <article className="orc-indicador-card orc-indicador-quantidade">
                            <div className="orc-indicador-topo">
                                <span className="orc-indicador-label">
                                    COMPROMISSOS CADASTRADOS
                                </span>

                                <span className="orc-indicador-icon">
                                    Nº
                                </span>
                            </div>

                            <strong className="orc-indicador-valor">
                                {quantidadeOrcamentos}
                            </strong>

                            <span className="orc-indicador-descricao">
                                {quantidadeOrcamentos === 1
                                    ? "Registro financeiro cadastrado."
                                    : "Registros financeiros cadastrados."}
                            </span>
                        </article>

                        <article className="orc-indicador-card orc-indicador-percentual">
                            <div className="orc-indicador-topo">
                                <span className="orc-indicador-label">
                                    PORCENTAGENS CADASTRADAS
                                </span>

                                <span className="orc-indicador-icon">
                                    %
                                </span>
                            </div>

                            <strong className="orc-indicador-valor">
                                {totalPorcentagemCadastrada.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}%
                            </strong>

                            <span className="orc-indicador-descricao">
                                Soma das porcentagens dos compromissos.
                            </span>
                        </article>

                    </section>

                    {/* VALORES CADASTRADOS POR FASE */}
                    <section className="orc-resumo-section">

                        <div className="orc-resumo-header">
                            <div>
                                <span className="orc-section-eyebrow">
                                    DISTRIBUIÇÃO FINANCEIRA
                                </span>

                                <h3>Valores cadastrados por fase</h3>

                                <p>
                                    Consulte os compromissos, valores fixos
                                    e porcentagens de cada fase administrativa.
                                </p>
                            </div>

                            <div className="orc-resumo-contador">
                                <strong>{fases.length}</strong>
                                <span>
                                    {fases.length === 1 ? "FASE" : "FASES"}
                                </span>
                            </div>
                        </div>

                        {resumoPorFase.length === 0 ? (
                            <div className="orc-empty-state orc-empty-fases">
                                <div className="orc-empty-icon">
                                    !
                                </div>

                                <h3>Nenhuma fase cadastrada</h3>

                                <p>
                                    Cadastre as fases administrativas para
                                    organizar seus compromissos financeiros.
                                </p>
                            </div>
                        ) : (
                            <div className="orc-fases-grid">

                                {resumoPorFase.map((fase) => (
                                    <article
                                        key={fase.id}
                                        className="orc-fase-card"
                                    >

                                        {/* CABEÇALHO DA FASE */}
                                        <div className="orc-fase-header">
                                            <div className="orc-fase-identificacao">
                                                <span className="orc-fase-nivel">
                                                    {fase.nivel}
                                                </span>

                                                <div className="orc-fase-titulo">
                                                    <span>FASE ADMINISTRATIVA</span>
                                                    <h4>{fase.nome}</h4>
                                                </div>
                                            </div>

                                            <span className="orc-fase-quantidade">
                                                {fase.quantidade}{" "}
                                                {fase.quantidade === 1
                                                    ? "compromisso"
                                                    : "compromissos"}
                                            </span>
                                        </div>

                                        {/* INDICADORES DA FASE */}
                                        <div className="orc-fase-indicadores">

                                            <div className="orc-fase-indicador">
                                                <span>
                                                    VALORES FIXOS
                                                </span>

                                                <strong>
                                                    {moeda(fase.totalFixo)}
                                                </strong>
                                            </div>

                                            <div className="orc-fase-indicador orc-fase-indicador-percentual">
                                                <span>
                                                    PORCENTAGENS
                                                </span>

                                                <strong>
                                                    {fase.totalPorcentagem.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}%
                                                </strong>
                                            </div>

                                        </div>

                                        {/* LISTA DE COMPROMISSOS */}
                                        <div className="orc-fase-compromissos">

                                            <div className="orc-fase-compromissos-header">
                                                <span>COMPROMISSOS</span>

                                                <span>
                                                    {fase.quantidade}
                                                </span>
                                            </div>

                                            {fase.compromissos.length > 0 ? (
                                                <div className="orc-compromissos-lista">

                                                    {fase.compromissos.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="orc-compromisso-item"
                                                        >

                                                            <div className="orc-compromisso-info">
                                                                <strong>
                                                                    {item.pagamento}
                                                                </strong>

                                                                <span>
                                                                    Vencimento todo dia{" "}
                                                                    <strong>
                                                                        {item.dia_vencimento}
                                                                    </strong>
                                                                </span>
                                                            </div>

                                                            <div className="orc-compromisso-acoes">

                                                                <strong className="orc-compromisso-valor">
                                                                    {item.tipo_valor === "porcentagem"
                                                                        ? `${Number(item.valor).toLocaleString("pt-BR", {
                                                                            minimumFractionDigits: 2,
                                                                            maximumFractionDigits: 2
                                                                        })}%`
                                                                        : moeda(item.valor)}
                                                                </strong>

                                                                <button
                                                                    type="button"
                                                                    className="orc-btn-excluir"
                                                                    disabled={excluindoId === item.id}
                                                                    onClick={() =>
                                                                        excluirOrcamento(item.id)
                                                                    }
                                                                    title="Excluir compromisso"
                                                                >
                                                                    {excluindoId === item.id
                                                                        ? "Excluindo..."
                                                                        : "Excluir"}
                                                                </button>

                                                            </div>
                                                        </div>
                                                    ))}

                                                </div>
                                            ) : (
                                                <div className="orc-compromissos-vazio">
                                                    Nenhum compromisso cadastrado nesta fase.
                                                </div>
                                            )}
                                        </div>

                                    </article>
                                ))}

                            </div>
                        )}
                    </section>

                </div>
            )}

        </section>
    );

}