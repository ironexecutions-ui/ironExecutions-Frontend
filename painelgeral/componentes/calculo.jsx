
import React, {
    useState,
    useEffect,
    useCallback,
    useRef
} from "react";

import { API_URL } from "../../config";
import "./calculo.css";

export default function EspacoCalculo() {
    // =====================================================
    // ESTADOS
    // =====================================================

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [comercios, setComercios] = useState([]);
    const [resultado, setResultado] = useState(null);
    const [comerciosAbertos, setComerciosAbertos] = useState({});

    const processamentoEmAndamento = useRef(false);
    const token = localStorage.getItem("token");

    // =====================================================
    // REQUISIÇÃO PADRÃO
    // =====================================================

    const requisicao = useCallback(async (rota, opcoes = {}) => {
        const resposta = await fetch(`${API_URL}/calcular${rota}`, {
            ...opcoes,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...(opcoes.headers || {})
            }
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                dados.detail || "Erro ao realizar operação"
            );
        }

        return dados;
    }, [token]);

    // =====================================================
    // CARREGAR COMÉRCIOS
    // =====================================================

    const buscarComercios = useCallback(async () => {
        const dados = await requisicao("/comercios");

        setComercios(
            Array.isArray(dados.comercios)
                ? dados.comercios
                : []
        );
    }, [requisicao]);

    // =====================================================
    // PROCESSAR APENAS UM LOTE
    // =====================================================

    const atualizarDados = useCallback(async () => {
        if (processamentoEmAndamento.current) {
            return;
        }

        processamentoEmAndamento.current = true;

        try {
            setCarregando(true);
            setErro("");

            await buscarComercios();

            const calculo = await requisicao("/calcular", {
                method: "POST"
            });

            const errosTabelas = (calculo.resultados || [])
                .filter(item => item.erro);

            if (errosTabelas.length > 0) {
                const nomes = [
                    ...new Set(
                        errosTabelas.map(item => item.tabela)
                    )
                ];

                throw new Error(
                    `Não foi possível calcular estas tabelas: ${nomes.join(", ")}. Verifique o log do backend.`
                );
            }

            setResultado({
                total_processados: Number(calculo.total_processados || 0),
                total_ignorados: Number(calculo.total_ignorados || 0),
                total_bytes: Number(calculo.total_bytes || 0),
                linhas_lidas: Number(calculo.linhas_lidas || 0),
                lotes: 1,
                tem_mais: Boolean(calculo.tem_mais)
            });

            await buscarComercios();

        } catch (e) {
            setErro(e.message || "Erro inesperado ao calcular armazenamento.");

            try {
                await buscarComercios();
            } catch (erroConsulta) {
                console.error(
                    "Erro ao atualizar lista de comércios:",
                    erroConsulta
                );
            }
        } finally {
            setCarregando(false);
            processamentoEmAndamento.current = false;
        }
    }, [requisicao, buscarComercios]);

    // =====================================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // =====================================================

    useEffect(() => {
        atualizarDados();

        const atualizar = () => {
            atualizarDados();
        };

        window.addEventListener(
            "atualizar-espaco-calculo",
            atualizar
        );

        return () => {
            window.removeEventListener(
                "atualizar-espaco-calculo",
                atualizar
            );
        };
    }, [atualizarDados]);

    // =====================================================
    // FORMATAR BYTES
    // =====================================================

    const formatarBytes = (valor) => {
        const bytes = Math.max(0, Number(valor) || 0);

        if (bytes < 1024) {
            return `${bytes.toFixed(0)} Bytes`;
        }

        if (bytes < 1024 ** 2) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }

        if (bytes < 1024 ** 3) {
            return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
        }

        if (bytes < 1024 ** 4) {
            return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
        }

        return `${(bytes / 1024 ** 4).toFixed(2)} TB`;
    };

    // =====================================================
    // FORMATAR GB
    // =====================================================

    const formatarGB = (bytes) => {
        const gb = Math.max(0, Number(bytes) || 0) / (1024 ** 3);

        return `${gb.toFixed(2)} GB`;
    };

    // =====================================================
    // CALCULAR UTILIZAÇÃO DE CADA COMÉRCIO
    // =====================================================

    const calcularArmazenamento = (comercio) => {
        const utilizadoBytes = Math.max(
            0,
            Number(comercio.espaco_total) || 0
        );

        // O limite é configurado em GB na tela de gerenciamento.
        const limiteGB = Math.max(
            0,
            Number(comercio.espaco_gb) || 0
        );

        const limiteBytes = limiteGB * (1024 ** 3);

        // Sem limite configurado, não existe percentual confiável.
        if (limiteBytes <= 0) {
            return {
                configurado: false,
                utilizadoBytes,
                limiteBytes: 0,
                limiteGB: 0,
                percentualUso: 0,
                percentualRestante: 0,
                restanteBytes: 0,
                excedidoBytes: 0,
                situacao: "sem-limite"
            };
        }

        const percentualUso =
            (utilizadoBytes / limiteBytes) * 100;

        const percentualRestante = Math.max(
            0,
            100 - percentualUso
        );

        const restanteBytes = Math.max(
            0,
            limiteBytes - utilizadoBytes
        );

        const excedidoBytes = Math.max(
            0,
            utilizadoBytes - limiteBytes
        );

        let situacao = "normal";

        if (percentualUso >= 100) {
            situacao = "critico";
        } else if (percentualUso > 70) {
            situacao = "alerta";
        }

        return {
            configurado: true,
            utilizadoBytes,
            limiteBytes,
            limiteGB,
            percentualUso,
            percentualRestante,
            restanteBytes,
            excedidoBytes,
            situacao
        };
    };

    // =====================================================
    // FORMATAR PERCENTUAL
    // =====================================================

    const formatarPercentual = (valor) => {
        return `${Number(valor || 0).toFixed(1).replace(".", ",")}%`;
    };

    // =====================================================
    // ABRIR / FECHAR TABELAS
    // =====================================================

    const alternarTabelas = (comercioId) => {
        setComerciosAbertos(anterior => ({
            ...anterior,
            [comercioId]: !anterior[comercioId]
        }));
    };

    // =====================================================
    // TOTAL GERAL
    // =====================================================

    const totalGeral = comercios.reduce(
        (total, comercio) =>
            total + Math.max(0, Number(comercio.espaco_total) || 0),
        0
    );

    const totalLimites = comercios.reduce(
        (total, comercio) =>
            total + Math.max(0, Number(comercio.espaco_gb) || 0),
        0
    );

    const comerciosConfigurados = comercios.filter(
        comercio => Number(comercio.espaco_gb) > 0
    ).length;

    const comerciosEmAlerta = comercios.filter(
        comercio => calcularArmazenamento(comercio).situacao === "alerta"
    ).length;

    const comerciosCriticos = comercios.filter(
        comercio => calcularArmazenamento(comercio).situacao === "critico"
    ).length;

    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================

    return (
        <section className="espaco-comercios">

            <header className="espaco-dashboard-header">
                <div className="espaco-dashboard-heading">
                    <span className="espaco-dashboard-eyebrow">
                        IRON EXECUTIONS · INFRAESTRUTURA
                    </span>

                    <h2>Monitoramento de armazenamento</h2>

                    <p>
                        Acompanhe o consumo, a capacidade contratada e o espaço
                        disponível de cada comércio.
                    </p>
                </div>

                <div className="espaco-dashboard-header-status">
                    <span className={`espaco-status-indicator ${erro ? "com-erro" : carregando ? "processando" : "operacional"}`} />

                    <span>
                        {erro
                            ? "Atenção necessária"
                            : carregando
                                ? "Processamento em andamento"
                                : "Sistema operacional"}
                    </span>
                </div>
            </header>

            {/* INDICADORES GERAIS */}

            <div className="espaco-dashboard-indicadores">

                <article className="espaco-indicador-card espaco-indicador-principal">
                    <div className="espaco-indicador-topo">
                        <span className="espaco-indicador-icone">▣</span>
                        <span className="espaco-indicador-legenda">
                            ARMAZENAMENTO UTILIZADO
                        </span>
                    </div>

                    <strong className="espaco-indicador-valor">
                        {formatarBytes(totalGeral)}
                    </strong>

                    <span className="espaco-indicador-descricao">
                        Volume contabilizado em todos os comércios
                    </span>
                </article>

                <article className="espaco-indicador-card">
                    <div className="espaco-indicador-topo">
                        <span className="espaco-indicador-icone">▤</span>
                        <span className="espaco-indicador-legenda">
                            COMÉRCIOS REGISTRADOS
                        </span>
                    </div>

                    <strong className="espaco-indicador-valor">
                        {comercios.length}
                    </strong>

                    <span className="espaco-indicador-descricao">
                        {comerciosConfigurados} com limite configurado
                    </span>
                </article>

                <article className="espaco-indicador-card">
                    <div className="espaco-indicador-topo">
                        <span className="espaco-indicador-icone">▦</span>
                        <span className="espaco-indicador-legenda">
                            CAPACIDADE CONTRATADA
                        </span>
                    </div>

                    <strong className="espaco-indicador-valor">
                        {totalLimites.toFixed(2).replace(".", ",")} GB
                    </strong>

                    <span className="espaco-indicador-descricao">
                        Soma dos limites configurados
                    </span>
                </article>

            </div>

            {/* RESUMO DE ALERTAS */}

            <div className="espaco-alertas-resumo">

                <div className="espaco-alertas-resumo-item">
                    <span className="espaco-alerta-resumo-ponto normal" />
                    <div>
                        <strong>{Math.max(0, comerciosConfigurados - comerciosEmAlerta - comerciosCriticos)}</strong>
                        <small>Dentro do limite</small>
                    </div>
                </div>

                <div className="espaco-alertas-resumo-item">
                    <span className="espaco-alerta-resumo-ponto alerta" />
                    <div>
                        <strong>{comerciosEmAlerta}</strong>
                        <small>Acima de 70%</small>
                    </div>
                </div>

                <div className="espaco-alertas-resumo-item">
                    <span className="espaco-alerta-resumo-ponto critico" />
                    <div>
                        <strong>{comerciosCriticos}</strong>
                        <small>Capacidade esgotada</small>
                    </div>
                </div>

            </div>

            {/* PROCESSAMENTO */}

            {carregando && (
                <div className="espaco-processamento">
                    <div className="espaco-processamento-cabecalho">
                        <div className="espaco-processamento-identidade">
                            <span className="espaco-processamento-spinner" />

                            <div>
                                <strong>Contabilizando armazenamento</strong>
                                <p>
                                    Processando um lote de até 50 registros.
                                </p>
                            </div>
                        </div>

                        <span className="espaco-processamento-badge">
                            EM EXECUÇÃO
                        </span>
                    </div>

                    {resultado && (
                        <div className="espaco-processamento-detalhe">
                            <span>Registros calculados nesta execução</span>
                            <strong>{resultado.total_processados}</strong>
                        </div>
                    )}

                    <div className="espaco-processamento-barra">
                        <span />
                    </div>

                    <small>
                        Aguarde a conclusão da operação antes de iniciar outro lote.
                    </small>
                </div>
            )}

            {/* RESULTADO DO LOTE */}

            {!carregando && resultado && (
                <div className="espaco-resultado">
                    <div className="espaco-resultado-cabecalho">
                        <div className="espaco-resultado-icone">
                            {resultado.tem_mais ? "↻" : "✓"}
                        </div>

                        <div className="espaco-resultado-titulo">
                            <strong>
                                {resultado.tem_mais
                                    ? "Lote concluído com sucesso"
                                    : "Contabilização concluída"}
                            </strong>

                            <p>
                                {resultado.tem_mais
                                    ? "Existem outros registros aguardando processamento."
                                    : "Todos os registros disponíveis foram contabilizados."}
                            </p>
                        </div>

                        <span className="espaco-resultado-status">
                            {resultado.tem_mais ? "EM ANDAMENTO" : "CONCLUÍDO"}
                        </span>
                    </div>

                    <div className="espaco-resultado-indicadores">
                        <div className="espaco-resultado-item">
                            <span>Calculados</span>
                            <strong>{resultado.total_processados}</strong>
                        </div>

                        <div className="espaco-resultado-item">
                            <span>Ignorados</span>
                            <strong>{resultado.total_ignorados}</strong>
                        </div>

                        <div className="espaco-resultado-item">
                            <span>Linhas lidas</span>
                            <strong>{resultado.linhas_lidas}</strong>
                        </div>

                        <div className="espaco-resultado-item">
                            <span>Espaço acrescentado</span>
                            <strong>{formatarBytes(resultado.total_bytes)}</strong>
                        </div>
                    </div>

                    <div className="espaco-resultado-rodape">
                        <span>
                            Limite de processamento: 50 registros por execução.
                        </span>

                        {resultado.tem_mais && (
                            <button
                                type="button"
                                className="espaco-btn-proximo-lote"
                                onClick={atualizarDados}
                                disabled={carregando}
                            >
                                Processar próximo lote
                                <span>→</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ERRO */}

            {erro && (
                <div className="espaco-erro">
                    <div className="espaco-erro-icone">!</div>

                    <div className="espaco-erro-conteudo">
                        <strong>Não foi possível concluir a operação</strong>
                        <p>{erro}</p>
                    </div>

                    <button
                        type="button"
                        className="espaco-erro-fechar"
                        onClick={() => setErro("")}
                        aria-label="Fechar mensagem de erro"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* CABEÇALHO DOS COMÉRCIOS */}

            <div className="espaco-lista-cabecalho">
                <div>
                    <span className="espaco-lista-eyebrow">
                        VISÃO GERAL
                    </span>

                    <h3>Armazenamento por comércio</h3>

                    <p>
                        Acompanhe quanto cada empresa já utilizou e quanto ainda
                        pode armazenar.
                    </p>
                </div>

                <span className="espaco-counter">
                    <span className="espaco-counter-ponto" />
                    {comercios.length} {comercios.length === 1 ? "comércio" : "comércios"}
                </span>
            </div>

            {/* LISTA */}

            {carregando && comercios.length === 0 ? (
                <div className="espaco-loading">
                    <span className="espaco-loading-spinner" />

                    <strong>Preparando painel</strong>

                    <p>
                        Buscando os dados de armazenamento dos comércios.
                    </p>
                </div>
            ) : comercios.length === 0 ? (
                <div className="espaco-empty">
                    <div className="espaco-empty-icone">▤</div>

                    <h3>Nenhum armazenamento registrado</h3>

                    <p>
                        Quando os registros forem contabilizados,
                        as informações aparecerão nesta área.
                    </p>
                </div>
            ) : (
                <div className="espaco-lista-comercios">

                    {comercios.map((comercio, index) => {
                        const aberto = Boolean(
                            comerciosAbertos[comercio.comercio_id]
                        );

                        const tabelas = Array.isArray(comercio.tabelas)
                            ? comercio.tabelas
                            : [];

                        const armazenamento = calcularArmazenamento(comercio);

                        const classeSituacao =
                            armazenamento.situacao === "critico"
                                ? "espaco-nivel-critico"
                                : armazenamento.situacao === "alerta"
                                    ? "espaco-nivel-alerta"
                                    : armazenamento.situacao === "normal"
                                        ? "espaco-nivel-normal"
                                        : "espaco-nivel-sem-limite";

                        return (
                            <article
                                className={`espaco-comercio-card espaco-comercio-detalhado ${classeSituacao} ${aberto ? "espaco-card-aberto" : ""}`}
                                key={comercio.comercio_id}
                                style={{
                                    "--espaco-card-index": index
                                }}
                            >

                                {/* IDENTIFICAÇÃO */}

                                <div className="espaco-comercio-topo">

                                    <div className="espaco-comercio-identidade">

                                        <div className="espaco-logo-comercio">
                                            {comercio.imagem ? (
                                                <img
                                                    src={comercio.imagem}
                                                    alt={`Logo ${comercio.loja || "comércio"}`}
                                                    loading="lazy"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <span>▣</span>
                                            )}
                                        </div>

                                        <div className="espaco-identidade-textos">
                                            <span className="espaco-comercio-legenda">
                                                COMÉRCIO #{comercio.comercio_id}
                                            </span>

                                            <h3>
                                                {comercio.loja || `Comércio #${comercio.comercio_id}`}
                                            </h3>

                                            <p>
                                                <span className="espaco-status-mini" />
                                                {tabelas.length} {tabelas.length === 1 ? "tabela contabilizada" : "tabelas contabilizadas"}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="espaco-comercio-total">
                                        <small>ESPAÇO UTILIZADO</small>

                                        <strong>
                                            {formatarBytes(armazenamento.utilizadoBytes)}
                                        </strong>

                                        <span>
                                            {armazenamento.configurado
                                                ? `Limite: ${formatarGB(armazenamento.limiteBytes)}`
                                                : "Limite não configurado"}
                                        </span>
                                    </div>

                                </div>

                                {/* INDICADOR DE CAPACIDADE */}

                                <div className="espaco-capacidade">

                                    {armazenamento.configurado ? (
                                        <>
                                            <div className="espaco-capacidade-cabecalho">
                                                <div className="espaco-capacidade-titulo">
                                                    <span>Consumo da capacidade</span>

                                                    <strong className="espaco-percentual-uso">
                                                        {formatarPercentual(armazenamento.percentualUso)}
                                                    </strong>
                                                </div>

                                                <span className={`espaco-capacidade-status ${classeSituacao}`}>
                                                    {armazenamento.situacao === "critico"
                                                        ? "LIMITE EXCEDIDO"
                                                        : armazenamento.situacao === "alerta"
                                                            ? "ATENÇÃO"
                                                            : "DENTRO DO LIMITE"}
                                                </span>
                                            </div>

                                            <div
                                                className="espaco-capacidade-barra"
                                                role="progressbar"
                                                aria-label={`Consumo de armazenamento de ${comercio.loja || "comércio"}`}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={Math.min(100, armazenamento.percentualUso)}
                                            >
                                                <span
                                                    className="espaco-capacidade-preenchimento"
                                                    style={{
                                                        width: `${Math.min(100, armazenamento.percentualUso)}%`
                                                    }}
                                                />
                                            </div>

                                            <div className="espaco-capacidade-detalhes">

                                                <div className="espaco-capacidade-detalhe">
                                                    <span className="espaco-capacidade-ponto utilizado" />
                                                    <div>
                                                        <small>Utilizado</small>
                                                        <strong>
                                                            {formatarPercentual(armazenamento.percentualUso)}
                                                        </strong>
                                                    </div>
                                                </div>

                                                <div className="espaco-capacidade-detalhe">
                                                    <span className="espaco-capacidade-ponto restante" />
                                                    <div>
                                                        <small>Restante</small>
                                                        <strong>
                                                            {formatarPercentual(armazenamento.percentualRestante)}
                                                        </strong>
                                                    </div>
                                                </div>

                                                <div className="espaco-capacidade-detalhe">
                                                    <span className="espaco-capacidade-ponto limite" />
                                                    <div>
                                                        <small>Disponível</small>
                                                        <strong>
                                                            {formatarGB(armazenamento.restanteBytes)}
                                                        </strong>
                                                    </div>
                                                </div>

                                            </div>

                                            {armazenamento.situacao === "critico" && (
                                                <div className="espaco-capacidade-aviso critico">
                                                    <strong>Capacidade ultrapassada.</strong>
                                                    <span>
                                                        Excedente de {formatarBytes(armazenamento.excedidoBytes)}.
                                                    </span>
                                                </div>
                                            )}

                                            {armazenamento.situacao === "alerta" && (
                                                <div className="espaco-capacidade-aviso alerta">
                                                    <strong>Armazenamento próximo do limite.</strong>
                                                    <span>
                                                        Restam {formatarGB(armazenamento.restanteBytes)} disponíveis.
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="espaco-capacidade-sem-limite">
                                            <div>
                                                <strong>Limite de armazenamento não configurado</strong>
                                                <p>
                                                    Configure a capacidade desta empresa para acompanhar
                                                    o percentual utilizado e o espaço restante.
                                                </p>
                                            </div>

                                            <span>SEM LIMITE</span>
                                        </div>
                                    )}

                                </div>

                                {/* AÇÕES */}

                                <div className="espaco-comercio-acoes">

                                    <div className="espaco-comercio-resumo">
                                        <span>
                                            <strong>{tabelas.length}</strong>
                                            {tabelas.length === 1 ? " estrutura" : " estruturas"}
                                        </span>

                                        <span className="espaco-resumo-separador" />

                                        <span>
                                            Total: <strong>{formatarBytes(comercio.espaco_total)}</strong>
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={`espaco-btn-ver-tabelas ${aberto ? "ativo" : ""}`}
                                        onClick={() => alternarTabelas(comercio.comercio_id)}
                                        aria-expanded={aberto}
                                        aria-controls={`espaco-tabelas-${comercio.comercio_id}`}
                                    >
                                        {aberto
                                            ? "Ocultar tabelas"
                                            : "Explorar tabelas"}

                                        <span className={`espaco-seta-tabelas ${aberto ? "aberta" : ""}`}>
                                            ▾
                                        </span>
                                    </button>

                                </div>

                                {/* DETALHAMENTO */}

                                {aberto && (
                                    <div
                                        className="espaco-tabela-lista espaco-tabelas-expansao"
                                        id={`espaco-tabelas-${comercio.comercio_id}`}
                                    >
                                        <div className="espaco-tabelas-cabecalho">
                                            <div>
                                                <span className="espaco-tabelas-eyebrow">
                                                    DETALHAMENTO
                                                </span>

                                                <h4>Consumo por tabela</h4>
                                            </div>

                                            <span className="espaco-tabelas-contagem">
                                                {tabelas.length} registros
                                            </span>
                                        </div>

                                        {tabelas.length > 0 ? (
                                            <div className="espaco-tabelas-conteudo">
                                                {tabelas.map((item, tabelaIndex) => (
                                                    <div
                                                        className="espaco-tabela-item"
                                                        key={`${item.tabela}-${tabelaIndex}`}
                                                    >
                                                        <div className="espaco-tabela-identidade">
                                                            <span className="espaco-tabela-ponto" />

                                                            <strong>
                                                                {item.tabela}
                                                            </strong>
                                                        </div>

                                                        <span className="espaco-tabela-tamanho">
                                                            {formatarBytes(item.espaco)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="espaco-tabelas-sem-dados">
                                                Nenhuma tabela disponível para este comércio.
                                            </div>
                                        )}
                                    </div>
                                )}

                            </article>
                        );
                    })}

                </div>
            )}

            {/* RODAPÉ */}

            <footer className="espaco-dashboard-footer">
                <span className="espaco-footer-indicador" />

                <p>
                    Monitoramento de armazenamento
                    <strong> IRON EXECUTIONS</strong>
                </p>

                <span className="espaco-footer-total">
                    {comercios.length} empresas monitoradas
                </span>
            </footer>

        </section>
    );
}
