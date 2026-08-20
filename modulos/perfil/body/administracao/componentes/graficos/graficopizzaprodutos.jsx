import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { API_URL } from "../../../../../../config";
import "./graficopizzaprodutos.css";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function GraficoPizzaProdutos() {

    const [carregando, setCarregando] = useState(true);

    const [modo, setModo] = useState("produtos");
    const [data, setData] = useState("");
    const [limite, setLimite] = useState(5);
    const [dados, setDados] = useState([]);

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
                "[GRAFICO PIZZA] Erro ao ler usuário:",
                erro
            );

            return null;
        }
    }


    /* =========================================================
       CHAVE DO CACHE

       O cache depende de:

       comercio_id
       modo
       data
       limite, somente quando for produtos
    ========================================================= */

    function obterChaveCache(
        modoAtual,
        dataAtual,
        limiteAtual
    ) {

        const comercioId =
            obterComercioId();

        if (!comercioId) {
            return null;
        }


        const dataCache =
            dataAtual || "todas";


        if (modoAtual === "produtos") {

            return (
                `iron_grafico_pizza_` +
                `${comercioId}_` +
                `${modoAtual}_` +
                `${dataCache}_` +
                `${limiteAtual}`
            );
        }


        return (
            `iron_grafico_pizza_` +
            `${comercioId}_` +
            `${modoAtual}_` +
            `${dataCache}`
        );
    }


    /* =========================================================
       LER CACHE
    ========================================================= */

    function lerCache(
        modoAtual,
        dataAtual,
        limiteAtual
    ) {

        const chave =
            obterChaveCache(
                modoAtual,
                dataAtual,
                limiteAtual
            );


        if (!chave) {
            return null;
        }


        try {

            const salvo =
                localStorage.getItem(chave);


            if (!salvo) {
                return null;
            }


            const cache =
                JSON.parse(salvo);


            if (!Array.isArray(cache)) {

                throw new Error(
                    "Formato do cache inválido"
                );
            }


            return cache;


        } catch (erro) {

            console.warn(
                "[GRAFICO PIZZA] Cache inválido:",
                erro
            );


            localStorage.removeItem(chave);


            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCache(
        modoAtual,
        dataAtual,
        limiteAtual,
        novosDados
    ) {

        const chave =
            obterChaveCache(
                modoAtual,
                dataAtual,
                limiteAtual
            );


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
                "[GRAFICO PIZZA] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       NORMALIZAR DADOS PARA COMPARAÇÃO
    ========================================================= */

    function normalizarDados(lista) {

        if (!Array.isArray(lista)) {
            return [];
        }


        return lista.map(item => ({

            nome:
                item.nome || "",

            quantidade:
                Number(item.quantidade) || 0,

            percentual:
                Number(item.percentual) || 0

        }));
    }


    /* =========================================================
       COMPARAR CACHE X SERVIDOR
    ========================================================= */

    function dadosIguais(
        cache,
        servidor
    ) {

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
       TROCAR MODO
    ========================================================= */

    function alternarModo() {

        if (modo === "produtos") {

            setModo("pagamentos");

            return;
        }


        if (modo === "pagamentos") {

            setModo("funcionarios");

            return;
        }


        setModo("produtos");
    }


    /* =========================================================
       BUSCAR DADOS

       1. Cache primeiro
       2. Mostra imediatamente
       3. Consulta API
       4. Compara
       5. Atualiza somente se mudou
    ========================================================= */

    useEffect(() => {

        let componenteAtivo = true;


        async function carregar() {

            /* =================================================
               GUARDA OS FILTROS DESTA REQUISIÇÃO

               Isso evita misturar respostas se o usuário
               trocar os filtros rapidamente.
            ================================================= */

            const modoAtual = modo;
            const dataAtual = data;
            const limiteAtual = limite;


            /* =================================================
               CACHE
            ================================================= */

            const cache =
                lerCache(
                    modoAtual,
                    dataAtual,
                    limiteAtual
                );


            /* =================================================
               EXISTE CACHE

               Mostra o gráfico imediatamente.
            ================================================= */

            if (Array.isArray(cache)) {

                if (componenteAtivo) {

                    setDados(cache);

                    setCarregando(false);
                }


                console.log(
                    "[GRAFICO PIZZA] Carregado do cache:",
                    {
                        modo: modoAtual,
                        data: dataAtual || "todas",
                        limite: limiteAtual
                    }
                );


            } else {

                if (componenteAtivo) {

                    /*
                        Não mostramos dados de outro filtro
                        enquanto carregamos o atual.
                    */

                    setDados([]);

                    setCarregando(true);
                }
            }


            /* =================================================
               PARÂMETROS DA API
            ================================================= */

            const params =
                new URLSearchParams();


            params.append(
                "modo",
                modoAtual
            );


            if (dataAtual) {

                params.append(
                    "data",
                    dataAtual
                );
            }


            if (
                modoAtual === "produtos" &&
                limiteAtual
            ) {

                params.append(
                    "limite",
                    limiteAtual
                );
            }


            /* =================================================
               SERVIDOR
            ================================================= */

            try {

                const resp = await fetch(
                    `${API_URL}/admin/graficos/pizza?${params.toString()}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                if (!resp.ok) {

                    throw new Error(
                        `Erro gráfico pizza: ${resp.status}`
                    );
                }


                const resposta =
                    await resp.json();


                const dadosServidor =
                    Array.isArray(resposta)
                        ? resposta
                        : [];


                if (!componenteAtivo) {
                    return;
                }


                /* =================================================
                   CACHE E SERVIDOR SÃO IGUAIS
                ================================================= */

                if (
                    dadosIguais(
                        cache,
                        dadosServidor
                    )
                ) {

                    console.log(
                        "[GRAFICO PIZZA] Cache já está atualizado."
                    );

                    return;
                }


                /* =================================================
                   DADOS MUDARAM

                   Pode ter:
                   venda nova
                   quantidade diferente
                   percentual diferente
                   produto diferente
                   funcionário diferente
                   pagamento diferente
                ================================================= */

                console.log(
                    "[GRAFICO PIZZA] Alterações encontradas. Atualizando cache."
                );


                setDados(
                    dadosServidor
                );


                salvarCache(
                    modoAtual,
                    dataAtual,
                    limiteAtual,
                    dadosServidor
                );


            } catch (erro) {

                console.error(
                    "[GRAFICO PIZZA] Erro ao consultar servidor:",
                    erro
                );


                /*
                    Se existe cache, mantemos ele.

                    Se não existe, mostramos vazio.
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


    }, [
        modo,
        data,
        limite,
        token
    ]);


    /* =========================================================
       INPUT DE LIMITE
    ========================================================= */

    const inputBloqueado =
        modo !== "produtos";


    /* =========================================================
       QUEBRAR TEXTO
    ========================================================= */

    function quebrarTexto(
        texto,
        limiteTexto = 18
    ) {

        if (!texto) {
            return "";
        }


        const palavras =
            texto.split(" ");


        const linhas = [];

        let linhaAtual = "";


        palavras.forEach(p => {

            if (
                (linhaAtual + p).length <=
                limiteTexto
            ) {

                linhaAtual +=
                    (linhaAtual ? " " : "") +
                    p;

            } else {

                if (linhaAtual) {

                    linhas.push(
                        linhaAtual
                    );
                }

                linhaAtual = p;
            }
        });


        if (linhaAtual) {

            linhas.push(
                linhaAtual
            );
        }


        return linhas.join("\n");
    }


    /* =========================================================
       LIMPAR NOME

       Remove:
       (None)
       (none)
       etc.
    ========================================================= */

    function limparNome(nomeProduto) {

        return String(
            nomeProduto || ""
        )
            .replace(
                /\s*\(None\)\s*/gi,
                ""
            )
            .trim();
    }


    /* =========================================================
       DADOS DO GRÁFICO
    ========================================================= */

    const chartData = {

        labels: dados.map(d =>

            quebrarTexto(
                limparNome(
                    d.nome
                )
            )

        ),


        datasets: [

            {

                data: dados.map(
                    d =>
                        Number(d.quantidade) || 0
                ),

                backgroundColor: [
                    "#38bdf8",
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#14b8a6",
                    "#e11d48",
                    "#0ea5e9"
                ],

                borderWidth: 1,

                borderColor: "#020617"
            }

        ]
    };


    /* =========================================================
       OPÇÕES DO GRÁFICO
    ========================================================= */

    const chartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                position: "right",

                labels: {

                    color: "#334155",
                    boxWidth: 14,

                    padding: 14,

                    font: {
                        size: 12,
                        lineHeight: 1.2
                    }
                }
            },


            tooltip: {

                callbacks: {

                    label: function (context) {

                        const item =
                            dados[
                            context.dataIndex
                            ];


                        const quantidade =
                            Number(
                                item?.quantidade
                            ) || 0;


                        const percentual =
                            Number(
                                item?.percentual
                            ) || 0;


                        return (
                            `${quantidade} ` +
                            `(${percentual}%)`
                        );
                    }
                }
            }
        }
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="grafico-pizza-container">

            <div className="grafico-pizza-topo">

                <input
                    type="date"
                    value={data}
                    onChange={e =>
                        setData(
                            e.target.value
                        )
                    }
                />


                <input
                    type="number"
                    min="1"
                    value={limite}
                    readOnly={inputBloqueado}
                    onChange={e => {

                        let valor =
                            Number(
                                e.target.value
                            );


                        if (valor < 1) {
                            valor = 1;
                        }


                        setLimite(
                            valor
                        );
                    }}
                    placeholder="Qtd itens"
                />


                <button
                    onClick={
                        alternarModo
                    }
                >

                    {modo === "produtos" &&
                        "Produtos"
                    }

                    {modo === "pagamentos" &&
                        "Pagamentos"
                    }

                    {modo === "funcionarios" &&
                        "Funcionários"
                    }

                </button>

            </div>


            <div className="grafico-pizza-conteudo">

                {carregando ? (

                    <div className="grafico-loading">

                        <div className="loading-ring"></div>

                        <span>
                            Processando dados
                        </span>

                    </div>

                ) : dados.length > 0 ? (

                    <Pie
                        data={chartData}
                        options={chartOptions}
                    />

                ) : (

                    <span className="grafico-vazio">
                        Nenhum dado encontrado
                    </span>

                )}

            </div>

        </div>
    );
}