
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import "./administrativa.css";
import { API_URL } from "../../../../../config";

const ADMIN_DESPESAS_API = `${API_URL}/admin/despesas`;

const NOMES_MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function dataAtual() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function mesAtual() {
    return dataAtual().slice(0, 7);
}

function primeiroDiaDoMes(mesSelecionado) {
    return `${mesSelecionado}-01`;
}

function dataInicialDoFormulario(mesSelecionado) {
    if (mesSelecionado === mesAtual()) {
        return dataAtual();
    }

    return primeiroDiaDoMes(mesSelecionado);
}

function formatarData(valor) {
    if (!valor) {
        return "Data não informada";
    }

    const [ano, mes, dia] = String(valor)
        .slice(0, 10)
        .split("-");

    return `${dia}/${mes}/${ano}`;
}

function formatarMes(mesSelecionado) {
    const [ano, mes] = mesSelecionado.split("-");

    return `${NOMES_MESES[Number(mes) - 1]} de ${ano}`;
}

export default function Administrativa() {
    const [mesSelecionado, setMesSelecionado] = useState(mesAtual());

    const [despesas, setDespesas] = useState([]);

    const [resumo, setResumo] = useState({
        total_vendas: 0,
        total_despesas: 0,
        saldo: 0,
    });
    const [sugestoesDespesas, setSugestoesDespesas] = useState([]);
    const [formulario, setFormulario] = useState({
        despesa: "",
        quanto: "",
        data: dataAtual(),
        observacoes: "",
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    // =====================================================
    // REQUISIÇÃO À API
    // =====================================================
    const [alerta, setAlerta] = useState(null);
    const [confirmacao, setConfirmacao] = useState(null);

    const temporizadorAlerta = useRef(null);

    const mostrarAlerta = useCallback((tipo, mensagem) => {
        if (temporizadorAlerta.current) {
            clearTimeout(temporizadorAlerta.current);
        }

        setAlerta({
            id: Date.now(),
            tipo,
            mensagem,
        });

        temporizadorAlerta.current = setTimeout(() => {
            setAlerta(null);
            temporizadorAlerta.current = null;
        }, 4000);
    }, []);

    useEffect(() => {
        return () => {
            if (temporizadorAlerta.current) {
                clearTimeout(temporizadorAlerta.current);
            }
        };
    }, []);

    function fecharAlerta() {
        if (temporizadorAlerta.current) {
            clearTimeout(temporizadorAlerta.current);
            temporizadorAlerta.current = null;
        }

        setAlerta(null);
    } useEffect(() => {
        if (!erro && !sucesso) return;

        const temporizador = setTimeout(() => {
            setErro("");
            setSucesso("");
        }, 4000);

        return () => clearTimeout(temporizador);
    }, [erro, sucesso]);
    const requisicao = useCallback(async (url, opcoes = {}) => {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error(
                "Sua sessão expirou. Entre novamente."
            );
        }

        const resposta = await fetch(url, {
            ...opcoes,
            headers: {
                Authorization: `Bearer ${token}`,

                ...(opcoes.body
                    ? {
                        "Content-Type": "application/json",
                    }
                    : {}),

                ...opcoes.headers,
            },
        });

        if (!resposta.ok) {
            let mensagem =
                "Não foi possível concluir a operação.";

            try {
                const dados = await resposta.json();

                if (typeof dados.detail === "string") {
                    mensagem = dados.detail;
                }
            } catch {
                // Mantém a mensagem padrão.
            }

            throw new Error(mensagem);
        }

        if (resposta.status === 204) {
            return null;
        }

        return resposta.json();
    }, []);

    // =====================================================
    // CARREGAR DESPESAS E RESUMO DO MÊS SELECIONADO
    // =====================================================

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [ano, mes] = mesSelecionado.split("-");

            const parametros = new URLSearchParams({
                ano,
                mes: String(Number(mes)),
            });

            const [lista, financeiro, sugestoes] = await Promise.all([
                requisicao(
                    `${ADMIN_DESPESAS_API}/?${parametros.toString()}`
                ),
                requisicao(
                    `${ADMIN_DESPESAS_API}/resumo?${parametros.toString()}`
                ),
                requisicao(
                    `${ADMIN_DESPESAS_API}/sugestoes`
                ),
            ]);

            setDespesas(Array.isArray(lista) ? lista : []);

            setSugestoesDespesas(
                Array.isArray(sugestoes) ? sugestoes : []
            );

            setResumo({
                total_vendas: Number(financeiro.total_vendas || 0),
                total_despesas: Number(financeiro.total_despesas || 0),
                saldo: Number(financeiro.saldo || 0),
            });

            setDespesas(
                Array.isArray(lista) ? lista : []
            );

            setResumo({
                total_vendas: Number(
                    financeiro.total_vendas || 0
                ),

                total_despesas: Number(
                    financeiro.total_despesas || 0
                ),

                saldo: Number(
                    financeiro.saldo || 0
                ),
            });
        } catch (err) {
            setErro(
                err.message ||
                "Erro ao carregar os dados financeiros."
            );
        } finally {
            setCarregando(false);
        }
    }, [mesSelecionado, requisicao]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // =====================================================
    // ALTERAR CAMPOS DO FORMULÁRIO
    // =====================================================

    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }
    function atualizarDespesaComHistorico(evento) {
        const descricaoDigitada = evento.target.value;

        const descricaoNormalizada = descricaoDigitada
            .trim()
            .toLocaleLowerCase("pt-BR");

        const despesaEncontrada = sugestoesDespesas.find(
            (item) =>
                item.despesa.trim().toLocaleLowerCase("pt-BR") ===
                descricaoNormalizada
        );

        setFormulario((anterior) => ({
            ...anterior,
            despesa: descricaoDigitada,

            quanto: despesaEncontrada
                ? String(despesaEncontrada.quanto).replace(".", ",")
                : "",

            observacoes: despesaEncontrada
                ? despesaEncontrada.observacoes || ""
                : "",
        }));
    }
    // =====================================================
    // ALTERAR MÊS
    // =====================================================

    function alterarMes(evento) {
        const novoMes = evento.target.value;

        if (!novoMes) {
            return;
        }

        setMesSelecionado(novoMes);

        setFormulario((anterior) => ({
            ...anterior,

            data: dataInicialDoFormulario(novoMes),
        }));

        setErro("");
        setSucesso("");
    }

    // =====================================================
    // CADASTRAR DESPESA
    // =====================================================

    async function cadastrarDespesa(evento) {
        evento.preventDefault();

        setErro("");
        setSucesso("");

        const valorTexto = formulario.quanto
            .trim()
            .replace(/\s/g, "");

        let valor;

        if (
            valorTexto.includes(",") &&
            valorTexto.includes(".")
        ) {
            valor = Number(
                valorTexto.replace(/\./g, "").replace(",", ".")
            );
        } else {
            valor = Number(
                valorTexto.replace(",", ".")
            );
        }

        if (!formulario.despesa.trim()) {
            setErro("Informe o nome da despesa.");
            return;
        }

        if (
            !Number.isFinite(valor) ||
            valor <= 0 ||
            Math.round(valor * 100) / 100 !== valor
        ) {
            setErro(
                "Informe um valor válido com até duas casas decimais."
            );
            return;
        }

        if (!formulario.data) {
            setErro("Informe a data da despesa.");
            return;
        }

        if (
            formulario.data.slice(0, 7) !== mesSelecionado
        ) {
            setErro(
                "A data da despesa precisa pertencer ao mês selecionado."
            );
            return;
        }

        setSalvando(true);

        try {
            await requisicao(
                `${ADMIN_DESPESAS_API}/`,
                {
                    method: "POST",

                    body: JSON.stringify({
                        despesa: formulario.despesa.trim(),
                        quanto: valor,
                        data: formulario.data,

                        observacoes:
                            formulario.observacoes.trim() || null,
                    }),
                }
            );

            setFormulario({
                despesa: "",
                quanto: "",

                data: dataInicialDoFormulario(
                    mesSelecionado
                ),

                observacoes: "",
            });

            setSucesso(
                "Despesa cadastrada com sucesso."
            );

            await carregarDados();
        } catch (err) {
            setErro(
                err.message ||
                "Não foi possível cadastrar a despesa."
            );
        } finally {
            setSalvando(false);
        }
    }

    // =====================================================
    // EXCLUIR DESPESA
    // =====================================================

    function excluirDespesa(id) {
        setConfirmacao({
            titulo: "Excluir despesa",
            mensagem:
                "Tem certeza de que deseja excluir esta despesa? Essa ação não pode ser desfeita.",
            confirmarTexto: "Excluir despesa",
            acao: async () => {
                setExcluindo(id);

                try {
                    await requisicao(`${ADMIN_DESPESAS_API}/${id}`, {
                        method: "DELETE",
                    });

                    mostrarAlerta(
                        "sucesso",
                        "Despesa excluída com sucesso."
                    );

                    await carregarDados();
                } catch (err) {
                    mostrarAlerta(
                        "erro",
                        err.message || "Não foi possível excluir a despesa."
                    );
                } finally {
                    setExcluindo(null);
                }
            },
        });
    }

    async function executarConfirmacao() {
        const acao = confirmacao?.acao;

        setConfirmacao(null);

        if (acao) {
            await acao();
        }
    }
    const despesasAgrupadas = Object.values(
        despesas.reduce((grupos, item) => {
            const nomeNormalizado = String(item.despesa || "")
                .trim()
                .toLocaleLowerCase("pt-BR");

            const mesAno = String(item.data || "").slice(0, 7);
            const chave = `${nomeNormalizado}_${mesAno}`;

            if (!grupos[chave]) {
                grupos[chave] = {
                    nome: item.despesa,
                    total: 0,
                    itens: [],
                };
            }

            grupos[chave].total += Number(item.quanto || 0);
            grupos[chave].itens.push(item);

            return grupos;
        }, {})
    );
    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================

    return (
        <section className="administrativa-despesas-container">

            <header className="administrativa-despesas-cabecalho">
                <div>
                    <span className="administrativa-despesas-etiqueta">
                        CONTROLE FINANCEIRO
                    </span>

                    <h1>Administração</h1>

                    <p>
                        Acompanhe os ganhos, registre despesas
                        e consulte o saldo mensal do seu comércio.
                    </p>
                </div>

                <button
                    type="button"
                    className="administrativa-despesas-atualizar"
                    onClick={carregarDados}
                    disabled={carregando}
                >
                    {carregando
                        ? "Atualizando..."
                        : "Atualizar dados"}
                </button>
            </header>

            {/* FILTRO MENSAL */}

            <div className="administrativa-despesas-filtro-mensal">
                <div>
                    <label htmlFor="administrativa-despesas-mes">
                        Mês de referência
                    </label>

                    <strong>
                        {formatarMes(mesSelecionado)}
                    </strong>
                </div>

                <input
                    id="administrativa-despesas-mes"
                    className="administrativa-despesas-seletor-mes"
                    type="month"
                    value={mesSelecionado}
                    onChange={alterarMes}
                    aria-label="Selecionar mês financeiro"
                />
            </div>

            {/* MENSAGENS */}

            {erro && (
                <div
                    className="administrativa-despesas-alerta administrativa-despesas-alerta-erro"
                    role="alert"
                >
                    {erro}
                </div>
            )}

            {sucesso && (
                <div
                    className="administrativa-despesas-alerta administrativa-despesas-alerta-sucesso"
                    role="status"
                >
                    {sucesso}
                </div>
            )}

            {/* RESUMO FINANCEIRO */}

            <div className="administrativa-despesas-resumo">

                <article className="administrativa-despesas-card">
                    <span>Ganhos do mês</span>

                    <strong>
                        {carregando
                            ? "Carregando..."
                            : moeda(resumo.total_vendas)}
                    </strong>

                    <small>
                        Vendas de {formatarMes(mesSelecionado)}
                    </small>
                </article>

                <article className="administrativa-despesas-card">
                    <span>Despesas do mês</span>

                    <strong>
                        {carregando
                            ? "Carregando..."
                            : moeda(resumo.total_despesas)}
                    </strong>

                    <small>
                        Gastos de {formatarMes(mesSelecionado)}
                    </small>
                </article>

                <article
                    className={`administrativa-despesas-card ${Number(resumo.saldo) < 0
                        ? "administrativa-despesas-card-negativo"
                        : "administrativa-despesas-card-saldo"
                        }`}
                >
                    <span>Saldo do mês</span>

                    <strong>
                        {carregando
                            ? "Carregando..."
                            : moeda(resumo.saldo)}
                    </strong>

                    <small>
                        Ganhos menos despesas
                    </small>
                </article>

            </div>

            {/* FORMULÁRIO E HISTÓRICO */}

            <div className="administrativa-despesas-layout">

                {/* CADASTRO */}

                <section className="administrativa-despesas-painel">

                    <div className="administrativa-despesas-titulo">
                        <h2>Nova despesa</h2>

                        <p>
                            Registre um gasto de{" "}
                            {formatarMes(mesSelecionado)}.
                        </p>
                    </div>

                    <form
                        className="administrativa-despesas-formulario"
                        onSubmit={cadastrarDespesa}
                    >
                        <label htmlFor="administrativa-despesa-nome">
                            Descrição da despesa
                        </label>


                        <input
                            id="administrativa-despesa-nome"
                            name="despesa"
                            type="text"
                            list="administrativa-despesas-sugestoes"
                            placeholder="Ex.: Aluguel, energia, fornecedor"
                            value={formulario.despesa}
                            onChange={atualizarDespesaComHistorico}
                            maxLength={255}
                            autoComplete="off"
                            required
                        />

                        <datalist id="administrativa-despesas-sugestoes">
                            {sugestoesDespesas.map((item) => (
                                <option
                                    key={item.despesa}
                                    value={item.despesa}
                                />
                            ))}
                        </datalist>


                        <div className="administrativa-despesas-campos">

                            <div>
                                <label htmlFor="administrativa-despesa-valor">
                                    Valor (R$)
                                </label>

                                <input
                                    id="administrativa-despesa-valor"
                                    name="quanto"
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    value={formulario.quanto}
                                    onChange={atualizarCampo}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="administrativa-despesa-data">
                                    Data
                                </label>

                                <input
                                    id="administrativa-despesa-data"
                                    name="data"
                                    type="date"
                                    value={formulario.data}
                                    onChange={atualizarCampo}
                                    required
                                />
                            </div>

                        </div>

                        <label htmlFor="administrativa-despesa-observacoes">
                            Observações
                        </label>

                        <textarea
                            id="administrativa-despesa-observacoes"
                            name="observacoes"
                            placeholder="Detalhes adicionais, se necessário"
                            value={formulario.observacoes}
                            onChange={atualizarCampo}
                            maxLength={5000}
                            rows={4}
                        />

                        <button
                            type="submit"
                            className="administrativa-despesas-salvar"
                            disabled={salvando}
                        >
                            {salvando
                                ? "Salvando..."
                                : "Cadastrar despesa"}
                        </button>
                    </form>

                </section>

                {/* HISTÓRICO MENSAL */}

                <section className="administrativa-despesas-painel administrativa-despesas-historico">

                    <div className="administrativa-despesas-titulo">
                        <h2>
                            Despesas de {formatarMes(mesSelecionado)}
                        </h2>

                        <p>
                            {carregando
                                ? "Consultando registros..."
                                : `${despesas.length} ${despesas.length === 1
                                    ? "despesa encontrada"
                                    : "despesas encontradas"
                                }`}
                        </p>
                    </div>

                    {carregando ? (
                        <div className="administrativa-despesas-vazio">
                            Carregando informações do mês...
                        </div>
                    ) : despesas.length === 0 ? (
                        <div className="administrativa-despesas-vazio">
                            <strong>
                                Nenhuma despesa neste mês
                            </strong>

                            <span>
                                Cadastre uma despesa para ela aparecer aqui.
                            </span>
                        </div>
                    ) : (
                        <div className="administrativa-despesas-lista">

                            {despesasAgrupadas.map((grupo) => (
                                <article
                                    className="administrativa-despesas-item"
                                    key={`${grupo.nome}-${grupo.itens[0].data}`}
                                >
                                    <div className="administrativa-despesas-item-principal">

                                        <strong>{grupo.nome}</strong>

                                        {grupo.itens
                                            .slice()
                                            .sort((a, b) =>
                                                String(a.data).localeCompare(String(b.data))
                                            )
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        gap: "10px",
                                                        flexWrap: "wrap",
                                                        marginTop: "8px",
                                                    }}
                                                >
                                                    <span>
                                                        {formatarData(item.data)}

                                                        {String(item.data).slice(0, 10) > dataAtual() && (
                                                            <strong className="administrativa-despesa-status-pendente">
                                                                {" "}Por pagar
                                                            </strong>
                                                        )}
                                                    </span>

                                                    <span>
                                                        {moeda(item.quanto)}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="administrativa-despesas-excluir"
                                                        onClick={() => excluirDespesa(item.id)}
                                                        disabled={excluindo === item.id}
                                                        aria-label={`Excluir despesa ${item.despesa} de ${formatarData(item.data)}`}
                                                    >
                                                        {excluindo === item.id
                                                            ? "Excluindo..."
                                                            : "Excluir"}
                                                    </button>
                                                </div>
                                            ))}

                                        {grupo.itens.some((item) => item.observacoes) && (
                                            <p>
                                                {grupo.itens
                                                    .filter((item) => item.observacoes)
                                                    .map((item) =>
                                                        `${formatarData(item.data)}: ${item.observacoes}`
                                                    )
                                                    .join(" | ")}
                                            </p>
                                        )}

                                    </div>

                                    <div className="administrativa-despesas-item-acoes">

                                        <strong>
                                            {moeda(grupo.total)}
                                        </strong>

                                        <small>
                                            {grupo.itens.length}{" "}
                                            {grupo.itens.length === 1
                                                ? "registro"
                                                : "registros"}
                                        </small>

                                    </div>
                                </article>
                            ))}

                        </div>
                    )}

                </section>

            </div>
            {/* ALERTAS PROFISSIONAIS */}
            {alerta &&
                createPortal(
                    <div
                        key={alerta.id}
                        className={`admin-toast admin-toast-${alerta.tipo}`}
                        role={alerta.tipo === "erro" ? "alert" : "status"}
                        aria-live={alerta.tipo === "erro" ? "assertive" : "polite"}
                    >
                        <div className="admin-toast-indicador" />

                        <div className="admin-toast-icone" aria-hidden="true">
                            {alerta.tipo === "sucesso" ? "✓" : "!"}
                        </div>

                        <div className="admin-toast-conteudo">
                            <strong>
                                {alerta.tipo === "sucesso" ? "Sucesso" : "Não foi possível concluir"}
                            </strong>

                            <span>{alerta.mensagem}</span>
                        </div>

                        <button
                            type="button"
                            className="admin-toast-fechar"
                            onClick={fecharAlerta}
                            aria-label="Fechar notificação"
                        >
                            ×
                        </button>

                        <div className="admin-toast-progresso" />
                    </div>,
                    document.body
                )}

            {/* CONFIRMAÇÃO PERSONALIZADA */}
            {confirmacao &&
                createPortal(
                    <div
                        className="admin-confirmacao-fundo"
                        onMouseDown={(evento) => {
                            if (evento.target === evento.currentTarget) {
                                setConfirmacao(null);
                            }
                        }}
                    >
                        <section
                            className="admin-confirmacao-modal"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="admin-confirmacao-titulo"
                            aria-describedby="admin-confirmacao-mensagem"
                        >
                            <div className="admin-confirmacao-icone" aria-hidden="true">
                                !
                            </div>

                            <h2 id="admin-confirmacao-titulo">
                                {confirmacao.titulo}
                            </h2>

                            <p id="admin-confirmacao-mensagem">
                                {confirmacao.mensagem}
                            </p>

                            <div className="admin-confirmacao-acoes">
                                <button
                                    type="button"
                                    className="admin-confirmacao-cancelar"
                                    onClick={() => setConfirmacao(null)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="admin-confirmacao-excluir"
                                    onClick={executarConfirmacao}
                                >
                                    {confirmacao.confirmarTexto}
                                </button>
                            </div>
                        </section>
                    </div>,
                    document.body
                )}
        </section>
    );
}
