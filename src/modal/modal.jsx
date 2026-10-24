import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { API_URL } from "../../config";
import "./modal.css";

const CAIXA_ENDPOINT = `${API_URL}/caixa-operacional`;
const TEMPO_ANIMACAO = 300;

async function requisicaoApi(url, opcoes = {}) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Sua sessão expirou. Entre novamente no sistema.");
    }

    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
            ...opcoes.headers,
        },
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(
            resultado.detail ||
            resultado.mensagem ||
            "Não foi possível concluir a operação."
        );
    }

    return resultado;
}

async function requisicaoCaixa(caminho, opcoes = {}) {
    return requisicaoApi(`${CAIXA_ENDPOINT}${caminho}`, opcoes);
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function obterDataLocal() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return "Data não informada";

    const partes = String(data).slice(0, 10).split("-");

    if (partes.length !== 3) return String(data);

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataHora(data) {
    if (!data) return "";

    const valor = String(data);
    const hora = valor.includes("T")
        ? valor.split("T")[1]?.slice(0, 5)
        : "";

    return hora
        ? `${formatarData(valor)} às ${hora}`
        : formatarData(valor);
}

export default function CaixaOperacionalModal() {
    const location = useLocation();

    const [aberto, setAberto] = useState(false);
    const [estado, setEstado] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [tipo, setTipo] = useState("abertura");
    const [quanto, setQuanto] = useState("");
    const [mensagem, setMensagem] = useState(null);
    const [erro, setErro] = useState("");
    const [historico, setHistorico] = useState(false);

    const [confirmacaoPendente, setConfirmacaoPendente] = useState(null);
    const [saindo, setSaindo] = useState(false);
    const [modalRenderizado, setModalRenderizado] = useState(false);

    const rotaPermitida = location.pathname === "/ironbusiness/perfil";

    const caixaFechado = estado?.caixa_fechado === true;
    const amanhaPreparado = estado?.amanha_preparado === true;
    const precisaIniciar = estado?.precisa_iniciar_caixa === true;

    const movimentacoes = estado?.movimentacoes || [];
    const saldoHoje = Number(estado?.saldo_hoje || 0);
    const saldoOntem = Number(estado?.saldo_ontem || 0);
    const inputValorRef = useRef(null);
    const nomeUsuario =
        usuario?.nome_completo ||
        estado?.nome_completo ||
        "Usuário";

    const nomeLoja =
        usuario?.loja ||
        estado?.loja ||
        "Minha loja";

    const fechar = useCallback(() => {
        setAberto(false);
        setErro("");
        setMensagem(null);
        setHistorico(false);
        setConfirmacaoPendente(null);
    }, []);

    const fecharComAnimacao = useCallback(() => {
        if (saindo) return;

        setSaindo(true);
        setConfirmacaoPendente(null);

        window.setTimeout(() => {
            setModalRenderizado(false);
            setSaindo(false);
            fechar();
        }, TEMPO_ANIMACAO);
    }, [saindo, fechar]);

    const solicitarConfirmacao = useCallback((acao) => {
        setConfirmacaoPendente((atual) =>
            atual === acao ? null : acao
        );
    }, []);

    const cancelarConfirmacao = useCallback(() => {
        setConfirmacaoPendente(null);
    }, []);

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [dadosCaixa, dadosUsuario] = await Promise.all([
                requisicaoCaixa("/estado"),
                requisicaoApi(`${API_URL}/clientes/me`),
            ]);

            setEstado(dadosCaixa);
            setUsuario(dadosUsuario);

            setTipo(
                dadosCaixa.precisa_iniciar_caixa
                    ? "abertura"
                    : "entrada"
            );
        } catch (erroApi) {
            setErro(
                erroApi.message ||
                "Não foi possível carregar os dados do caixa."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    // Mantém o modal renderizado durante a animação de saída.
    useEffect(() => {
        if (aberto && rotaPermitida) {
            setModalRenderizado(true);
            setSaindo(false);
        }
    }, [aberto, rotaPermitida]);

    // Atalho Ctrl + Alt + Enter.
    useEffect(() => {
        function capturarAtalho(evento) {
            const atalhoCaixa =
                evento.ctrlKey &&
                evento.altKey &&
                evento.key === "Enter";

            if (!atalhoCaixa || !rotaPermitida) return;

            evento.preventDefault();
            evento.stopPropagation();

            setAberto((anterior) => !anterior);
        }

        window.addEventListener("keydown", capturarAtalho, true);

        return () => {
            window.removeEventListener("keydown", capturarAtalho, true);
        };
    }, [rotaPermitida]);

    // Fecha quando o usuário sai da tela de perfil.
    useEffect(() => {
        if (!rotaPermitida) {
            setAberto(false);
            setModalRenderizado(false);
            setSaindo(false);
            setConfirmacaoPendente(null);
        }
    }, [rotaPermitida]);

    // Carrega os dados sempre que o modal abrir.
    useEffect(() => {
        if (aberto && rotaPermitida) {
            carregarDados();
        }
    }, [aberto, rotaPermitida, carregarDados]);

    // Fecha com Escape, respeitando a animação.
    useEffect(() => {
        if (!aberto) return;

        function capturarEscape(evento) {
            if (evento.key === "Escape") {
                fecharComAnimacao();
            }
        }

        window.addEventListener("keydown", capturarEscape);

        return () => {
            window.removeEventListener("keydown", capturarEscape);
        };
    }, [aberto, fecharComAnimacao]);
    useEffect(() => {
        if (!aberto || !modalRenderizado || carregando) return;

        const temporizador = window.setTimeout(() => {
            inputValorRef.current?.focus();
            inputValorRef.current?.select();
        }, 100);

        return () => window.clearTimeout(temporizador);
    }, [aberto, modalRenderizado, carregando]);
    function selecionarTipo(novoTipo) {
        setTipo(novoTipo);
        setQuanto("");
        setErro("");
        setMensagem(null);
    }

    async function salvarMovimentacao(evento) {
        evento.preventDefault();

        if (salvando || carregando) return;

        setErro("");
        setMensagem(null);

        if (quanto.trim() === "") {
            setErro("Informe o valor da movimentação.");
            return;
        }

        const valorNumerico = Number(
            String(quanto).trim().replace(",", ".")
        );

        if (!Number.isFinite(valorNumerico) || valorNumerico < 0) {
            setErro("Informe um valor válido e não negativo.");
            return;
        }

        const corpo = {
            tipo,
            quanto: valorNumerico,
        };

        if (tipo === "ajuste") {
            corpo.valor_desejado = valorNumerico;
        }

        setSalvando(true);

        try {
            const resultado = await requisicaoCaixa("/movimentacoes", {
                method: "POST",
                body: JSON.stringify(corpo),
            });

            setMensagem({
                texto:
                    resultado.mensagem ||
                    "Movimentação registrada com sucesso.",
                saldo: resultado.saldo_atual,
                valor: resultado.valor_movimentacao,
            });

            setQuanto("");

            await carregarDados();
        } catch (erroApi) {
            setErro(
                erroApi.message ||
                "Erro ao registrar movimentação."
            );
        } finally {
            setSalvando(false);
        }
    }

    async function carregarHistorico() {
        if (carregando) return;

        setCarregando(true);
        setErro("");

        try {
            const resultado = await requisicaoCaixa(
                `/historico?data=${obterDataLocal()}`
            );

            setEstado((anterior) => ({
                ...anterior,
                ...resultado,
                movimentacoes: resultado.movimentacoes || [],
                saldo_hoje: resultado.saldo_final,
            }));

            setHistorico(true);
        } catch (erroApi) {
            setErro(
                erroApi.message ||
                "Não foi possível carregar o histórico."
            );
        } finally {
            setCarregando(false);
        }
    }

    async function prepararAmanha() {
        if (salvando || carregando || amanhaPreparado || caixaFechado) {
            return;
        }

        setSalvando(true);
        setErro("");
        setMensagem(null);

        try {
            const resultado = await requisicaoCaixa(
                "/preparar-amanha",
                {
                    method: "POST",
                }
            );

            setMensagem({
                texto:
                    resultado.mensagem ||
                    "Caixa de amanhã preparado com sucesso.",
                saldo: resultado.saldo_fechamento,
                valor: undefined,
            });

            setConfirmacaoPendente(null);

            await carregarDados();
        } catch (erroApi) {
            setErro(
                erroApi.message ||
                "Não foi possível preparar o caixa de amanhã."
            );
        } finally {
            setSalvando(false);
        }
    }

    // Todos os hooks ficam acima deste retorno condicional.
    if (!rotaPermitida || (!aberto && !modalRenderizado)) {
        return null;
    }

    const conteudo = (
        <div
            className={[
                "ie-caixa-modal-overlay",
                saindo ? "ie-caixa-saindo" : "",
            ].filter(Boolean).join(" ")}
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) {
                    fecharComAnimacao();
                }
            }}
        >
            <section
                className="ie-caixa-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ie-caixa-titulo"
            >
                <header className="ie-caixa-modal-cabecalho">
                    <div className="ie-caixa-modal-identidade">


                        <h2 id="ie-caixa-titulo">
                            Caixa operacional
                        </h2>

                        <p>
                            {nomeUsuario} · {nomeLoja}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="ie-caixa-modal-fechar"
                        onClick={fecharComAnimacao}
                        aria-label="Fechar caixa operacional"
                    >
                        ×
                    </button>
                </header>

                <div className="ie-caixa-modal-conteudo">
                    {erro && (
                        <div
                            className="ie-caixa-alerta ie-caixa-alerta-erro"
                            role="alert"
                        >
                            {erro}
                        </div>
                    )}

                    {mensagem && (
                        <div
                            className="ie-caixa-alerta ie-caixa-alerta-sucesso"
                            role="status"
                        >
                            <strong>{mensagem.texto}</strong>

                            {mensagem.valor !== undefined && (
                                <span>
                                    Movimentação:{" "}
                                    {formatarMoeda(mensagem.valor)}
                                </span>
                            )}

                            {mensagem.saldo !== undefined && (
                                <span>
                                    Saldo atualizado:{" "}
                                    {formatarMoeda(mensagem.saldo)}
                                </span>
                            )}
                        </div>
                    )}

                    {carregando && !estado ? (
                        <div className="ie-caixa-carregamento">
                            <span className="ie-caixa-spinner" />
                            <p>Carregando informações do caixa...</p>
                        </div>
                    ) : (
                        <>
                            <div className="ie-caixa-resumo">
                                <article className="ie-caixa-card-saldo">
                                    <span>Saldo de hoje</span>

                                    <strong>
                                        {formatarMoeda(saldoHoje)}
                                    </strong>

                                    <small>
                                        {formatarData(estado?.data)}
                                    </small>
                                </article>

                                <article className="ie-caixa-card-anterior">
                                    <span>Saldo de ontem</span>

                                    <strong>
                                        {formatarMoeda(saldoOntem)}
                                    </strong>

                                    <small>
                                        {formatarData(estado?.data_anterior)}
                                    </small>
                                </article>
                            </div>

                            {precisaIniciar && (
                                <div className="ie-caixa-aviso-abertura">
                                    <strong>
                                        O caixa de hoje precisa ser iniciado
                                    </strong>

                                    <p>
                                        O saldo de ontem é apenas uma referência.
                                        Informe quanto dinheiro está deixando no
                                        caixa no início de hoje.
                                    </p>
                                </div>
                            )}

                            <div className="ie-caixa-tipos">
                                <button
                                    type="button"
                                    className={
                                        tipo === "abertura"
                                            ? "ie-caixa-tipo ativo"
                                            : "ie-caixa-tipo"
                                    }
                                    onClick={() => selecionarTipo("abertura")}
                                    disabled={
                                        !precisaIniciar ||
                                        carregando ||
                                        salvando
                                    }
                                >
                                    <strong>Iniciar caixa</strong>
                                    <small>Saldo inicial do dia</small>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        tipo === "entrada"
                                            ? "ie-caixa-tipo ativo"
                                            : "ie-caixa-tipo"
                                    }
                                    onClick={() => selecionarTipo("entrada")}
                                    disabled={
                                        precisaIniciar ||
                                        carregando ||
                                        salvando
                                    }
                                >
                                    <strong>Adicionar</strong>
                                    <small>Entrada de dinheiro</small>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        tipo === "retirada"
                                            ? "ie-caixa-tipo ativo"
                                            : "ie-caixa-tipo"
                                    }
                                    onClick={() => selecionarTipo("retirada")}
                                    disabled={
                                        precisaIniciar ||
                                        carregando ||
                                        salvando
                                    }
                                >
                                    <strong>Retirar</strong>
                                    <small>Saída de dinheiro</small>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        tipo === "ajuste"
                                            ? "ie-caixa-tipo ativo"
                                            : "ie-caixa-tipo"
                                    }
                                    onClick={() => selecionarTipo("ajuste")}
                                    disabled={
                                        precisaIniciar ||
                                        carregando ||
                                        salvando
                                    }
                                >
                                    <strong>Deixar valor</strong>
                                    <small>Definir saldo final</small>
                                </button>
                            </div>

                            <form
                                className="ie-caixa-formulario"
                                onSubmit={salvarMovimentacao}
                            >
                                <label htmlFor="ie-caixa-valor">
                                    {tipo === "abertura"
                                        ? "Quanto dinheiro está deixando para iniciar?"
                                        : tipo === "entrada"
                                            ? "Quanto dinheiro está colocando?"
                                            : tipo === "retirada"
                                                ? "Quanto dinheiro está retirando?"
                                                : "Quanto deseja deixar no caixa?"}
                                </label>

                                <div className="ie-caixa-campo-valor">
                                    <span>R$</span>

                                    <input
                                        ref={inputValorRef}
                                        id="ie-caixa-valor"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={quanto}
                                        onChange={(evento) => {
                                            setQuanto(evento.target.value);
                                            setErro("");
                                        }}
                                        required
                                    />
                                </div>

                                {tipo === "ajuste" && (
                                    <div className="ie-caixa-previa-ajuste">
                                        <span>Saldo atual</span>

                                        <strong>
                                            {formatarMoeda(saldoHoje)}
                                        </strong>

                                        <span>Diferença calculada</span>

                                        <strong>
                                            {quanto.trim() !== "" &&
                                                Number.isFinite(
                                                    Number(
                                                        String(quanto).replace(",", ".")
                                                    )
                                                )
                                                ? formatarMoeda(
                                                    Number(
                                                        String(quanto).replace(",", ".")
                                                    ) - saldoHoje
                                                )
                                                : formatarMoeda(0)}
                                        </strong>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="ie-caixa-salvar"
                                    disabled={salvando || carregando}
                                >
                                    {salvando
                                        ? "Registrando..."
                                        : tipo === "abertura"
                                            ? "Iniciar caixa"
                                            : tipo === "entrada"
                                                ? "Confirmar entrada"
                                                : tipo === "retirada"
                                                    ? "Confirmar retirada"
                                                    : "Confirmar novo saldo"}
                                </button>
                            </form>

                            {!precisaIniciar && (
                                <div className="ie-caixa-fechamento-area">
                                    <button
                                        type="button"
                                        className={[
                                            "ie-caixa-salvar",
                                            "ie-caixa-botao-fechamento",
                                            confirmacaoPendente === "fechar-caixa"
                                                ? "ie-caixa-confirmacao-pendente"
                                                : "",
                                        ].filter(Boolean).join(" ")}
                                        onClick={() => {
                                            if (
                                                confirmacaoPendente !==
                                                "fechar-caixa"
                                            ) {
                                                solicitarConfirmacao(
                                                    "fechar-caixa"
                                                );
                                                return;
                                            }

                                            cancelarConfirmacao();
                                            prepararAmanha();
                                        }}
                                        disabled={
                                            salvando ||
                                            carregando ||
                                            amanhaPreparado ||
                                            caixaFechado
                                        }
                                    >
                                        {salvando
                                            ? "Preparando próximo dia..."
                                            : amanhaPreparado || caixaFechado
                                                ? "Caixa de amanhã já preparado"
                                                : confirmacaoPendente ===
                                                    "fechar-caixa"
                                                    ? "Confirmar fechamento"
                                                    : "Fechar caixa e preparar amanhã"}
                                    </button>

                                    {confirmacaoPendente === "fechar-caixa" && (
                                        <div className="ie-caixa-confirmacao">
                                            <span className="ie-caixa-confirmacao-icone">
                                                !
                                            </span>

                                            <div className="ie-caixa-confirmacao-texto">
                                                <strong>
                                                    Confirme o fechamento
                                                </strong>

                                                <p>
                                                    O caixa de hoje será fechado
                                                    e o saldo será usado para
                                                    preparar a abertura do
                                                    próximo dia.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="ie-caixa-confirmacao-cancelar"
                                                onClick={cancelarConfirmacao}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="ie-caixa-historico-cabecalho">
                                <div>
                                    <h3>Movimentações de hoje</h3>
                                    <p>
                                        {movimentacoes.length} registro(s)
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={carregarHistorico}
                                    disabled={carregando}
                                >
                                    Atualizar
                                </button>
                            </div>

                            <div className="ie-caixa-lista">
                                {movimentacoes.length === 0 ? (
                                    <div className="ie-caixa-vazio">
                                        <strong>
                                            Nenhuma movimentação hoje
                                        </strong>

                                        <p>
                                            Inicie o caixa para começar a
                                            registrar as entradas e retiradas.
                                        </p>
                                    </div>
                                ) : (
                                    [...movimentacoes].reverse().map((movimento, indice) => {
                                        const valor = Number(
                                            movimento.quanto || 0
                                        );

                                        return (
                                            <article
                                                className="ie-caixa-movimento"
                                                key={movimento.id || indice}
                                            >
                                                <div className="ie-caixa-movimento-icone">
                                                    {valor > 0
                                                        ? "+"
                                                        : valor < 0
                                                            ? "−"
                                                            : "="}
                                                </div>

                                                <div className="ie-caixa-movimento-info">
                                                    <strong>
                                                        {{
                                                            abertura: "Abertura do caixa",
                                                            entrada: "Entrada de dinheiro",
                                                            retirada: "Retirada de dinheiro",
                                                            ajuste: "Ajuste de saldo",
                                                            fechamento: "Fechamento do caixa",
                                                        }[movimento.tipo] ||
                                                            "Movimentação"}
                                                    </strong>

                                                    <small>
                                                        {formatarDataHora(
                                                            movimento.data
                                                        )}
                                                    </small>
                                                </div>

                                                <strong
                                                    className={
                                                        valor < 0
                                                            ? "ie-caixa-valor-negativo"
                                                            : "ie-caixa-valor-positivo"
                                                    }
                                                >
                                                    {valor > 0 ? "+" : ""}
                                                    {formatarMoeda(valor)}
                                                </strong>
                                            </article>
                                        );
                                    })
                                )}
                            </div>

                            {historico && (
                                <p className="ie-caixa-historico-nota">
                                    Exibindo o histórico da data atual.
                                </p>
                            )}
                        </>
                    )}
                </div>

                <footer className="ie-caixa-modal-rodape">
                    <span>Atalho: Ctrl + Alt + Enter</span>

                    <button
                        type="button"
                        onClick={fecharComAnimacao}
                    >
                        Fechar
                    </button>
                </footer>
            </section>
        </div>
    );

    return createPortal(conteudo, document.body);
}