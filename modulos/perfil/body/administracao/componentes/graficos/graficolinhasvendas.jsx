import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
} from "chart.js";

import { API_URL } from "../../../../../../config";
import "./graficolinhasvendas.css";

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);

export default function GraficoLinhasVendas() {

    const [periodo, setPeriodo] = useState("dias");
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const token = localStorage.getItem("token");


    /* =========================================================
       IDENTIFICAR COMÉRCIO
    ========================================================= */

    function obterComercioId() {
        try {
            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

            return usuario?.comercio_id || null;

        } catch (erro) {
            console.warn(
                "[GRAFICO LINHAS] Erro ao ler usuário:",
                erro
            );

            return null;
        }
    }


    /* =========================================================
       CHAVE DO CACHE
    ========================================================= */

    function obterChaveCache(periodoAtual) {

        const comercioId = obterComercioId();

        if (!comercioId) {
            return null;
        }

        return `iron_grafico_linhas_${comercioId}_${periodoAtual}`;
    }


    /* =========================================================
       LER CACHE
    ========================================================= */

    function lerCache(periodoAtual) {

        const chave = obterChaveCache(periodoAtual);

        if (!chave) {
            return null;
        }

        try {

            const salvo = localStorage.getItem(chave);

            if (!salvo) {
                return null;
            }

            const dadosCache = JSON.parse(salvo);

            if (!Array.isArray(dadosCache)) {
                throw new Error("Formato do cache inválido");
            }

            return dadosCache;

        } catch (erro) {

            console.warn(
                "[GRAFICO LINHAS] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCache(periodoAtual, novosDados) {

        const chave = obterChaveCache(periodoAtual);

        if (
            !chave ||
            !Array.isArray(novosDados)
        ) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(novosDados)
            );

        } catch (erro) {

            console.warn(
                "[GRAFICO LINHAS] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       NORMALIZAR DADOS
    ========================================================= */

    function normalizarDados(lista) {

        if (!Array.isArray(lista)) {
            return [];
        }

        return lista.map(item => ({
            label: item.label || "",
            total: Number(item.total) || 0
        }));
    }


    /* =========================================================
       COMPARAR CACHE COM SERVIDOR
    ========================================================= */

    function dadosIguais(cache, servidor) {

        if (
            !Array.isArray(cache) ||
            !Array.isArray(servidor)
        ) {
            return false;
        }

        try {

            const cacheNormalizado =
                normalizarDados(cache);

            const servidorNormalizado =
                normalizarDados(servidor);

            return (
                JSON.stringify(cacheNormalizado) ===
                JSON.stringify(servidorNormalizado)
            );

        } catch {
            return false;
        }
    }


    /* =========================================================
       MÉTRICAS DERIVADAS
    ========================================================= */

    const totalPeriodo = dados.reduce(
        (acc, d) =>
            acc + (Number(d.total) || 0),
        0
    );

    const mediaPeriodo =
        dados.length
            ? totalPeriodo / dados.length
            : 0;

    const maiorValor = Math.max(
        ...dados.map(
            d => Number(d.total) || 0
        ),
        0
    );


    /* =========================================================
       TROCAR PERÍODO
    ========================================================= */

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


    /* =========================================================
       CARREGAR DADOS

       1. Procura cache
       2. Se existir, mostra imediatamente
       3. Consulta API
       4. Compara
       5. Atualiza somente se mudou
    ========================================================= */

    useEffect(() => {

        let componenteAtivo = true;

        async function carregar() {

            /* ===============================
               CACHE DO PERÍODO ATUAL
            =============================== */

            const cache = lerCache(periodo);


            /* ===============================
               MOSTRAR CACHE
            =============================== */

            if (Array.isArray(cache)) {

                if (componenteAtivo) {
                    setDados(cache);
                    setCarregando(false);
                }

                console.log(
                    `[GRAFICO LINHAS] ${periodo} carregado do cache.`
                );

            } else {

                if (componenteAtivo) {
                    setDados([]);
                    setCarregando(true);
                }
            }


            /* ===============================
               PARÂMETROS
            =============================== */

            const params = new URLSearchParams();

            params.append(
                "periodo",
                periodo
            );


            /* ===============================
               CONSULTAR SERVIDOR
            =============================== */

            try {

                const resp = await fetch(
                    `${API_URL}/admin/graficos/linhas?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                if (!resp.ok) {

                    throw new Error(
                        `Erro gráfico linhas: ${resp.status}`
                    );
                }


                const resposta = await resp.json();

                const dadosServidor =
                    Array.isArray(resposta)
                        ? resposta
                        : [];


                if (!componenteAtivo) {
                    return;
                }


                /* ===============================
                   COMPARAR CACHE
                =============================== */

                const iguais =
                    dadosIguais(
                        cache,
                        dadosServidor
                    );


                /* ===============================
                   CACHE JÁ ATUALIZADO
                =============================== */

                if (iguais) {

                    console.log(
                        `[GRAFICO LINHAS] Cache de ${periodo} já está atualizado.`
                    );

                    return;
                }


                /* ===============================
                   SERVIDOR MUDOU
                =============================== */

                console.log(
                    `[GRAFICO LINHAS] Dados de ${periodo} mudaram. Atualizando cache.`
                );


                setDados(dadosServidor);

                salvarCache(
                    periodo,
                    dadosServidor
                );


            } catch (erro) {

                console.error(
                    "[GRAFICO LINHAS] Erro ao consultar servidor:",
                    erro
                );


                /*
                    Se existir cache, mantém o cache.
                    Caso contrário, mostra vazio.
                */

                if (
                    !Array.isArray(cache) &&
                    componenteAtivo
                ) {
                    setDados([]);
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


    /* =========================================================
       DADOS DO GRÁFICO
    ========================================================= */

    const chartData = {

        labels: dados.map(
            d => d.label
        ),

        datasets: [

            {
                label: "Total de Vendas",

                data: dados.map(
                    d => Number(d.total) || 0
                ),

                borderColor: "#2563eb",

                backgroundColor:
                    "rgba(37, 99, 235, 0.12)",

                borderWidth: 3,

                tension: 0.4,

                fill: true,

                pointRadius: 4,

                pointHoverRadius: 7,

                pointBackgroundColor: "#2563eb",

                pointBorderColor: "#ffffff",

                pointBorderWidth: 2,

                pointHoverBackgroundColor: "#1d4ed8",

                pointHoverBorderColor: "#ffffff",

                pointHoverBorderWidth: 3
            },

            {
                label: "Média",

                data: dados.map(
                    () => mediaPeriodo
                ),

                borderColor:
                    "rgba(71, 85, 105, 0.55)",

                borderDash: [6, 6],

                borderWidth: 2,

                pointRadius: 0,

                pointHoverRadius: 0,

                fill: false
            }
        ]
    };


    /* =========================================================
       OPÇÕES DO GRÁFICO
    ========================================================= */

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


        /* ===============================
           PLUGINS
        =============================== */

        plugins: {

            /* ===============================
               LEGENDA
            =============================== */

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


            /* ===============================
               TOOLTIP
            =============================== */

            tooltip: {

                backgroundColor:
                    "rgba(15, 23, 42, 0.96)",

                titleColor: "#ffffff",

                bodyColor: "#e2e8f0",

                borderColor:
                    "rgba(59, 130, 246, 0.35)",

                borderWidth: 1,

                padding: 13,

                cornerRadius: 10,

                displayColors: true,

                callbacks: {

                    label: ctx => {

                        const valor =
                            Number(ctx.raw) || 0;

                        const percentual =
                            totalPeriodo
                                ? (
                                    (
                                        valor /
                                        totalPeriodo
                                    ) * 100
                                ).toFixed(1)
                                : 0;


                        if (
                            ctx.dataset.label === "Média"
                        ) {
                            return (
                                ` Média: R$ ${valor.toFixed(2)}`
                            );
                        }


                        return (
                            ` R$ ${valor.toFixed(2)} • ` +
                            `${percentual}% do período`
                        );
                    }
                }
            }
        },


        /* ===============================
           ESCALAS
        =============================== */

        scales: {

            /* ===============================
               EIXO X
            =============================== */

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

                    color:
                        "rgba(15, 23, 42, 0.055)",

                    drawTicks: false
                }
            },


            /* ===============================
               EIXO Y
            =============================== */

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

                        const numero =
                            Number(value) || 0;

                        return `R$ ${numero.toLocaleString(
                            "pt-BR",
                            {
                                maximumFractionDigits: 0
                            }
                        )}`;
                    }
                },

                grid: {

                    color:
                        "rgba(15, 23, 42, 0.065)",

                    drawTicks: false
                }
            }
        }
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="grafico-linhas-container">


            {/* ===============================
                RESUMO
            =============================== */}

            <div className="grafico-linhas-resumo">

                <div>

                    <span>
                        Total
                    </span>

                    <strong>
                        R$ {totalPeriodo.toFixed(2)}
                    </strong>

                </div>


                <div>

                    <span>
                        Média
                    </span>

                    <strong>
                        R$ {mediaPeriodo.toFixed(2)}
                    </strong>

                </div>


                <div>

                    <span>
                        Pico
                    </span>

                    <strong>
                        R$ {maiorValor.toFixed(2)}
                    </strong>

                </div>

            </div>


            {/* ===============================
                PERÍODO
            =============================== */}

            <div className="grafico-linhas-topo">

                <button
                    className="grafico-linhas-periodo-btn"
                    onClick={alternarPeriodo}
                    type="button"
                >

                    {periodo === "dias" &&
                        "Últimos 7 dias"
                    }

                    {periodo === "semanas" &&
                        "Últimas 7 semanas"
                    }

                    {periodo === "meses" &&
                        "Últimos 7 meses"
                    }

                </button>

            </div>


            {/* ===============================
                GRÁFICO
            =============================== */}

            <div className="grafico-linhas-conteudo">


                {carregando && (

                    <div className="grafico-loading">

                        <span className="spinner"></span>

                        <p>
                            Carregando dados…
                        </p>

                    </div>

                )}


                {!carregando &&
                    dados.length > 0 && (

                        <Line
                            data={chartData}
                            options={chartOptions}
                        />

                    )
                }


                {!carregando &&
                    dados.length === 0 && (

                        <span className="grafico-vazio">
                            Nenhum dado encontrado
                        </span>

                    )
                }

            </div>

        </div>
    );
}