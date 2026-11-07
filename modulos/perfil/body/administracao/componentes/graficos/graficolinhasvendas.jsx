
import React, { useEffect, useState } from "react";

import { Line } from "react-chartjs-2";

import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

import { API_URL } from "../../../../../../config";

import "./graficolinhasvendas.css";


ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler
);


export default function GraficoLinhasVendas() {

    const [periodo, setPeriodo] = useState("dias");

    const [dados, setDados] = useState([]);

    const [resumo, setResumo] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const token = localStorage.getItem("token");


    // =====================================================
    // FORMATAR MOEDA
    // =====================================================

    function formatarMoeda(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    // =====================================================
    // FORMATAR PERCENTUAL
    // =====================================================

    function formatarVariacao(valor) {

        if (valor === null || valor === undefined) {
            return "Sem base anterior";
        }

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "Sem comparação";
        }

        const sinal = numero > 0 ? "+" : "";

        return `${sinal}${numero.toFixed(1).replace(".", ",")}%`;

    }


    // =====================================================
    // IDENTIFICAR COR DA VARIAÇÃO
    // =====================================================

    function classeVariacao(valor) {

        if (valor === null || valor === undefined) {
            return "grafico-linhas-variacao-neutra";
        }

        if (Number(valor) > 0) {
            return "grafico-linhas-variacao-positiva";
        }

        if (Number(valor) < 0) {
            return "grafico-linhas-variacao-negativa";
        }

        return "grafico-linhas-variacao-neutra";

    }


    // =====================================================
    // ÍCONE DA VARIAÇÃO
    // =====================================================

    function iconeVariacao(valor) {

        if (valor === null || valor === undefined) {
            return "•";
        }

        if (Number(valor) > 0) {
            return "↑";
        }

        if (Number(valor) < 0) {
            return "↓";
        }

        return "→";

    }


    // =====================================================
    // CARREGAR DADOS
    // =====================================================

    useEffect(() => {

        let componenteAtivo = true;

        async function carregar() {

            setCarregando(true);

            setDados([]);

            setResumo(null);

            try {

                const params = new URLSearchParams();

                params.append("periodo", periodo);

                const resp = await fetch(
                    `${API_URL}/admin/graficos/linhas?${params.toString()}`,
                    {
                        method: "GET",

                        cache: "no-store",

                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!resp.ok) {

                    throw new Error(
                        `Erro ao carregar gráfico: ${resp.status}`
                    );

                }

                const resposta = await resp.json();

                if (!componenteAtivo) {
                    return;
                }

                if (
                    !resposta ||
                    !Array.isArray(resposta.dados)
                ) {
                    throw new Error(
                        "Formato de resposta inválido"
                    );
                }

                const dadosNormalizados = resposta.dados.map(item => ({

                    label: item.label || "",

                    total: Number(item.total) || 0,

                    quantidade: Number(item.quantidade) || 0,

                    ticket_medio: Number(item.ticket_medio) || 0,

                    variacao_percentual:
                        item.variacao_percentual === null ||
                            item.variacao_percentual === undefined
                            ? null
                            : Number(item.variacao_percentual),

                    total_anterior: Number(item.total_anterior) || 0,

                    quantidade_anterior:
                        Number(item.quantidade_anterior) || 0

                }));

                setDados(dadosNormalizados);

                setResumo(resposta.resumo || {});

            } catch (erro) {

                console.error(
                    "[GRAFICO LINHAS] Erro:",
                    erro
                );

                if (componenteAtivo) {

                    setDados([]);

                    setResumo(null);

                }

            } finally {

                if (componenteAtivo) {
                    setCarregando(false);
                }

            }

        }

        carregar();

        return () => {
            componenteAtivo = false;
        };

    }, [periodo, token]);


    // =====================================================
    // MÉTRICAS
    // =====================================================

    const totalPeriodo = Number(
        resumo?.faturamento_periodo || 0
    );

    const quantidadeVendas = Number(
        resumo?.quantidade_vendas || 0
    );

    const ticketMedio = Number(
        resumo?.ticket_medio || 0
    );

    const faturamentoHoje = Number(
        resumo?.faturamento_hoje || 0
    );

    const quantidadeHoje = Number(
        resumo?.quantidade_hoje || 0
    );

    const ticketMedioHoje = Number(
        resumo?.ticket_medio_hoje || 0
    );

    const variacaoPeriodo = resumo?.variacao_periodo;

    const variacaoHoje = resumo?.variacao_hoje;

    const mediaPeriodo = Number(
        resumo?.media_por_periodo || 0
    );

    const melhorPeriodo = resumo?.melhor_periodo;

    const melhorFaturamento = Number(
        resumo?.melhor_faturamento || 0
    );


    // =====================================================
    // ALTERNAR PERÍODO
    // =====================================================

    function alternarPeriodo() {

        if (periodo === "dias") {
            setPeriodo("semanas");
            return;
        }

        if (periodo === "semanas") {
            setPeriodo("meses");
            return;
        }

        setPeriodo("dias");

    }


    // =====================================================
    // NOME DO PERÍODO
    // =====================================================

    const nomePeriodo = {

        dias: "Últimos 7 dias",

        semanas: "Últimas 7 semanas",

        meses: "Últimos 7 meses"

    }[periodo];


    // =====================================================
    // DADOS DO GRÁFICO
    // =====================================================

    const chartData = {

        labels: dados.map(item => item.label),

        datasets: [

            {

                label: "Faturamento",

                data: dados.map(item => item.total),

                borderColor: "#2563eb",

                backgroundColor: "rgba(37, 99, 235, 0.12)",

                borderWidth: 3,

                tension: 0.4,

                fill: true,

                pointRadius: 5,

                pointHoverRadius: 8,

                pointBackgroundColor: "#2563eb",

                pointBorderColor: "#ffffff",

                pointBorderWidth: 2,

                pointHoverBackgroundColor: "#1d4ed8",

                pointHoverBorderColor: "#ffffff",

                pointHoverBorderWidth: 3

            },

            {

                label: "Média do período",

                data: dados.map(() => mediaPeriodo),

                borderColor: "rgba(71, 85, 105, 0.55)",

                borderDash: [6, 6],

                borderWidth: 2,

                pointRadius: 0,

                pointHoverRadius: 0,

                fill: false

            }

        ]

    };


    // =====================================================
    // CONFIGURAÇÕES DO GRÁFICO
    // =====================================================

    const chartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {

            mode: "index",

            intersect: false

        },

        animation: {

            duration: 750,

            easing: "easeOutQuart"

        },

        plugins: {

            legend: {

                position: "top",

                align: "end",

                labels: {

                    color: "#334155",

                    usePointStyle: true,

                    pointStyle: "circle",

                    padding: 18,

                    boxWidth: 8,

                    boxHeight: 8,

                    font: {

                        size: 12,

                        weight: "600"

                    }

                }

            },

            tooltip: {

                backgroundColor: "rgba(15, 23, 42, 0.97)",

                titleColor: "#ffffff",

                bodyColor: "#e2e8f0",

                borderColor: "rgba(59, 130, 246, 0.35)",

                borderWidth: 1,

                padding: 14,

                cornerRadius: 10,

                displayColors: true,

                callbacks: {

                    title: (items) => {

                        if (!items.length) {
                            return "";
                        }

                        return items[0].label;

                    },

                    label: (ctx) => {

                        const valor = Number(ctx.raw) || 0;

                        if (ctx.datasetIndex === 1) {

                            return ` Média: ${formatarMoeda(valor)}`;

                        }

                        return ` Faturamento: ${formatarMoeda(valor)}`;

                    },

                    afterBody: (items) => {

                        if (!items.length) {
                            return [];
                        }

                        const indice = items[0].dataIndex;

                        const item = dados[indice];

                        if (!item) {
                            return [];
                        }

                        const variacao = formatarVariacao(
                            item.variacao_percentual
                        );

                        const quantidadeAnterior =
                            item.quantidade_anterior;

                        return [

                            "",

                            `Quantidade de vendas: ${item.quantidade}`,


                            `Variação vs. ponto anterior: ${variacao}`,

                            `Faturamento anterior: ${formatarMoeda(item.total_anterior)}`,

                            `Vendas no ponto anterior: ${quantidadeAnterior}`

                        ];

                    }

                }

            }

        },

        scales: {

            x: {

                border: {
                    display: false
                },

                ticks: {

                    color: "#475569",

                    padding: 8,

                    font: {
                        size: 11,
                        weight: "500"
                    }

                },

                grid: {

                    color: "rgba(15, 23, 42, 0.055)",

                    drawTicks: false

                }

            },

            y: {

                beginAtZero: true,

                border: {
                    display: false
                },

                ticks: {

                    color: "#475569",

                    padding: 10,

                    font: {
                        size: 11,
                        weight: "500"
                    },

                    callback: value => {

                        return `R$ ${Number(value).toLocaleString(
                            "pt-BR",
                            {
                                maximumFractionDigits: 0
                            }
                        )}`;

                    }

                },

                grid: {

                    color: "rgba(15, 23, 42, 0.065)",

                    drawTicks: false

                }

            }

        }

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="grafico-linhas-container">

            {/* RESUMO PRINCIPAL */}

            <div className="grafico-linhas-resumo">

                <div className="grafico-linhas-card-periodo">

                    <span>Faturamento do período</span>

                    <strong>
                        {formatarMoeda(totalPeriodo)}
                    </strong>

                    {!carregando && (

                        <small className={classeVariacao(variacaoPeriodo)}>

                            {iconeVariacao(variacaoPeriodo)}{" "}

                            {formatarVariacao(variacaoPeriodo)}

                            <span>
                                {" "}vs. período anterior
                            </span>

                        </small>

                    )}

                </div>


                <div className="grafico-linhas-card-hoje">

                    <span>Vendas de hoje</span>

                    <strong>
                        {formatarMoeda(faturamentoHoje)}
                    </strong>

                    {!carregando && (

                        <small className={classeVariacao(variacaoHoje)}>

                            {iconeVariacao(variacaoHoje)}{" "}

                            {formatarVariacao(variacaoHoje)}

                            <span>
                                {" "}vs. ontem
                            </span>

                        </small>

                    )}

                </div>



            </div>


            {/* DETALHES COMPLEMENTARES */}

            <div className="grafico-linhas-detalhes">

                <div className="grafico-linhas-detalhe-item">

                    <span>Quantidade de vendas</span>

                    <strong>
                        {quantidadeVendas.toLocaleString("pt-BR")}
                    </strong>

                    <small>
                        {quantidadeHoje.toLocaleString("pt-BR")} hoje
                    </small>

                </div>





                <div className="grafico-linhas-detalhe-item">

                    <span>Média por intervalo</span>

                    <strong>
                        {formatarMoeda(mediaPeriodo)}
                    </strong>

                    <small>
                        No período selecionado
                    </small>

                </div>


                <div className="grafico-linhas-detalhe-item">

                    <span>Melhor intervalo</span>

                    <strong>
                        {melhorPeriodo || "Sem dados"}
                    </strong>

                    <small>
                        {formatarMoeda(melhorFaturamento)}
                    </small>

                </div>

            </div>


            {/* TOPO DO GRÁFICO */}

            <div className="grafico-linhas-topo">

                <div className="grafico-linhas-titulo">

                    <strong>Desempenho das vendas</strong>

                    <span>
                        Acompanhe a evolução do faturamento
                    </span>

                </div>

                <button
                    className="grafico-linhas-periodo-btn"
                    onClick={alternarPeriodo}
                    type="button"
                >

                    {nomePeriodo}

                    <span>⌄</span>

                </button>

            </div>


            {/* GRÁFICO */}

            <div className="grafico-linhas-conteudo">

                {carregando && (

                    <div className="grafico-loading">

                        <span className="spinner"></span>

                        <p>Atualizando indicadores...</p>

                    </div>

                )}


                {!carregando && dados.length > 0 && (

                    <Line
                        data={chartData}
                        options={chartOptions}
                    />

                )}


                {!carregando && dados.length === 0 && (

                    <span className="grafico-vazio">
                        Nenhuma venda encontrada neste período.
                    </span>

                )}

            </div>

        </div>

    );

}
