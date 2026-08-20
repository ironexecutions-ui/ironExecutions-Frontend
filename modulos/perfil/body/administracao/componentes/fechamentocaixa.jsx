import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../../../../config";
import "./fechamentocaixa.css";

export default function FechamentoCaixa() {

    const [fechamentos, setFechamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");

    const [horaInicial, setHoraInicial] = useState("");
    const [horaFinal, setHoraFinal] = useState("");
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState("");
    const [mostrarResumoMensal, setMostrarResumoMensal] = useState(false);

    const CHAVE_CACHE_FECHAMENTOS =
        "85498f54sd6f26sd5f9ds5f9s5f";


    useEffect(() => {

        carregarFechamentos();

    }, []);


    /* =========================================================
       COMPARAR CACHE COM SERVIDOR
    ========================================================= */

    function dadosFechamentosIguais(cache, servidor) {

        if (!Array.isArray(cache) || !Array.isArray(servidor)) {
            return false;
        }

        if (cache.length !== servidor.length) {
            return false;
        }

        /*
            Ordenamos pelo ID antes de comparar.
    
            Assim, se a API devolver os mesmos registros
            em outra ordem, não consideramos como alteração.
        */

        const normalizar = (lista) => {

            return [...lista]
                .map((item) => ({
                    id: item.id,
                    usuario_id: item.usuario_id,
                    nome_completo: item.nome_completo || "",
                    link: item.link || "",
                    data: item.data || "",
                    hora: item.hora || "",
                    valor_total: Number(
                        item.valor_total || 0
                    )
                }))
                .sort((a, b) => {

                    return Number(a.id) - Number(b.id);

                });
        };


        const cacheNormalizado =
            normalizar(cache);

        const servidorNormalizado =
            normalizar(servidor);


        return JSON.stringify(cacheNormalizado) ===
            JSON.stringify(servidorNormalizado);
    }


    /* =========================================================
       CARREGAR FECHAMENTOS
    ========================================================= */

    async function carregarFechamentos() {

        let cacheEncontrado = false;
        let dadosCache = [];

        try {

            /* =================================================
               1. TENTA CARREGAR CACHE PRIMEIRO
            ================================================= */

            const cacheSalvo = localStorage.getItem(
                CHAVE_CACHE_FECHAMENTOS
            );

            if (cacheSalvo) {

                try {

                    const cacheConvertido =
                        JSON.parse(cacheSalvo);

                    if (Array.isArray(cacheConvertido)) {

                        dadosCache = cacheConvertido;

                        cacheEncontrado = true;

                        /*
                            Mostra os dados imediatamente.
                            Não espera o servidor.
                        */

                        setFechamentos(
                            cacheConvertido
                        );

                        setCarregando(false);

                        console.log(
                            "[FECHAMENTOS] Cache carregado:",
                            cacheConvertido.length
                        );
                    }

                } catch (erroCache) {

                    console.warn(
                        "[FECHAMENTOS] Cache inválido. Removendo.",
                        erroCache
                    );

                    localStorage.removeItem(
                        CHAVE_CACHE_FECHAMENTOS
                    );
                }
            }


            /* =================================================
               2. SE NÃO EXISTE CACHE, MOSTRA LOADING
            ================================================= */

            if (!cacheEncontrado) {

                setCarregando(true);

            }


            /* =================================================
               3. BUSCA VERSÃO ATUAL DO SERVIDOR
            ================================================= */

            const token =
                localStorage.getItem("token");

            const resp = await fetch(
                `${API_URL}/caixa/fechamentos-empresa`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao buscar fechamentos: ${resp.status}`
                );

            }


            const json = await resp.json();
            console.log("====================================");
            console.log("[FECHAMENTOS API] STATUS:", resp.status);
            console.log("[FECHAMENTOS API] API_URL:", API_URL);
            console.log("[FECHAMENTOS API] RESPOSTA COMPLETA:");
            console.log(json);
            console.log("[FECHAMENTOS API] QUANTIDADE:", Array.isArray(json) ? json.length : "NÃO É ARRAY");
            console.log("====================================");

            const dadosServidor =
                Array.isArray(json)
                    ? json
                    : [];


            /* =================================================
               4. NÃO EXISTIA CACHE
               SALVA TUDO
            ================================================= */

            if (!cacheEncontrado) {

                setFechamentos(
                    dadosServidor
                );

                localStorage.setItem(
                    CHAVE_CACHE_FECHAMENTOS,
                    JSON.stringify(dadosServidor)
                );

                console.log(
                    "[FECHAMENTOS] Cache criado:",
                    dadosServidor.length
                );

                return;
            }


            /* =================================================
               5. COMPARA CACHE COM SERVIDOR
            ================================================= */

            const saoIguais =
                dadosFechamentosIguais(
                    dadosCache,
                    dadosServidor
                );


            /* =================================================
               6. SE FOREM IGUAIS NÃO FAZ NADA
            ================================================= */

            if (saoIguais) {

                console.log(
                    "[FECHAMENTOS] Cache já está atualizado."
                );

                return;
            }


            /* =================================================
               7. SERVIDOR MUDOU
               ATUALIZA STATE + CACHE
            ================================================= */

            console.log(
                "[FECHAMENTOS] Novos dados encontrados."
            );


            setFechamentos(
                dadosServidor
            );


            localStorage.setItem(
                CHAVE_CACHE_FECHAMENTOS,
                JSON.stringify(dadosServidor)
            );


            console.log(
                "[FECHAMENTOS] Cache atualizado:",
                dadosServidor.length
            );


        } catch (err) {

            console.error(
                "[FECHAMENTOS] Erro:",
                err
            );


            /*
                IMPORTANTE:
    
                Se temos cache, não mostramos erro para
                o usuário porque ele ainda consegue utilizar
                os dados salvos.
    
                Se não existe cache, aí sim mostramos erro.
            */

            if (!cacheEncontrado) {

                alert(
                    "Erro ao carregar fechamentos de caixa"
                );

            } else {

                console.warn(
                    "[FECHAMENTOS] API indisponível. Usando cache."
                );

            }


        } finally {

            setCarregando(false);

        }
    }

    function converterValor(valor) {

        const numero = Number(valor);

        if (Number.isNaN(numero)) {
            return 0;
        }

        return numero;
    }

    function formatarDinheiro(valor) {

        return converterValor(valor).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    function formatarData(data) {

        if (!data) return "";

        const partes = String(data).split("-");

        if (partes.length !== 3) {
            return data;
        }

        const [ano, mes, dia] = partes;

        return `${dia}/${mes}/${ano}`;
    }

    function obterNomeMes(chaveMes) {

        if (!chaveMes) return "";

        const [ano, mes] = chaveMes.split("-");

        const data = new Date(
            Number(ano),
            Number(mes) - 1,
            1
        );

        const nome = data.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );

        return nome.charAt(0).toUpperCase() + nome.slice(1);
    }
    const fechamentosSemDuplicados = useMemo(() => {

        // =====================================================
        // CONTA QUANTAS VEZES DATA + VALOR APARECEM
        // =====================================================

        const quantidadePorChave = new Map();

        fechamentos.forEach((fechamento) => {

            const data = fechamento.data || "";

            const valor = converterValor(
                fechamento.valor_total
            );

            const chave =
                `${data}|${valor.toFixed(2)}`;

            quantidadePorChave.set(
                chave,
                (quantidadePorChave.get(chave) || 0) + 1
            );
        });

        // =====================================================
        // SÓ MANTÉM OS QUE APARECEM EXATAMENTE UMA VEZ
        // =====================================================

        return fechamentos.filter((fechamento) => {

            const data = fechamento.data || "";

            const valor = converterValor(
                fechamento.valor_total
            );

            const chave =
                `${data}|${valor.toFixed(2)}`;

            return quantidadePorChave.get(chave) === 1;
        });

    }, [fechamentos]);
    const funcionariosFechamentos = useMemo(() => {

        const mapaFuncionarios = new Map();

        fechamentosSemDuplicados.forEach((fechamento) => {

            if (!fechamento.usuario_id) {
                return;
            }

            const id = String(fechamento.usuario_id);

            if (!mapaFuncionarios.has(id)) {
                mapaFuncionarios.set(id, {
                    id,
                    nome: fechamento.nome_completo || "Não informado"
                });
            }

        });

        return Array.from(mapaFuncionarios.values())
            .sort((a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR",
                    { sensitivity: "base" }
                )
            );

    }, [fechamentosSemDuplicados]);
    const fechamentosFiltrados = useMemo(() => {

        return fechamentosSemDuplicados
            .filter((fechamento) => {

                const data = fechamento.data || "";
                const hora = fechamento.hora || "";

                if (
                    funcionarioSelecionado &&
                    String(fechamento.usuario_id) !== funcionarioSelecionado
                ) {
                    return false;
                }

                if (
                    dataInicial &&
                    data < dataInicial
                ) {
                    return false;
                }

                if (
                    dataFinal &&
                    data > dataFinal
                ) {
                    return false;
                }

                if (
                    horaInicial &&
                    hora < horaInicial
                ) {
                    return false;
                }

                if (
                    horaFinal &&
                    hora > horaFinal
                ) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {

                const dataA =
                    `${a.data || ""} ${a.hora || ""}`;

                const dataB =
                    `${b.data || ""} ${b.hora || ""}`;

                return dataB.localeCompare(dataA);
            });

    }, [
        fechamentosSemDuplicados,
        funcionarioSelecionado,
        dataInicial,
        dataFinal,
        horaInicial,
        horaFinal
    ]);

    const totalPeriodo = useMemo(() => {

        return fechamentosFiltrados.reduce(
            (total, fechamento) => {
                return total + converterValor(fechamento.valor_total);
            },
            0
        );

    }, [fechamentosFiltrados]);

    const fechamentosPorData = useMemo(() => {

        const grupos = {};

        fechamentosFiltrados.forEach((fechamento) => {

            const data = fechamento.data || "Sem data";

            if (!grupos[data]) {
                grupos[data] = [];
            }

            grupos[data].push(fechamento);
        });

        return grupos;

    }, [fechamentosFiltrados]);

    const resumoMensal = useMemo(() => {

        const meses = {};

        fechamentosSemDuplicados.forEach((fechamento) => {
            if (!fechamento.data) {
                return;
            }

            const mes = fechamento.data.substring(0, 7);

            if (!meses[mes]) {
                meses[mes] = {
                    mes,
                    total: 0,
                    quantidade: 0
                };
            }

            meses[mes].total += converterValor(
                fechamento.valor_total
            );

            meses[mes].quantidade += 1;
        });

        const lista = Object.values(meses)
            .sort((a, b) => a.mes.localeCompare(b.mes));

        return lista.map((item, index) => {

            const anterior = lista[index - 1];

            let percentual = null;
            let tipo = "neutro";

            if (
                anterior &&
                anterior.total > 0
            ) {

                percentual =
                    (
                        (
                            item.total - anterior.total
                        ) /
                        anterior.total
                    ) * 100;

                if (percentual > 0) {
                    tipo = "aumento";
                }

                if (percentual < 0) {
                    tipo = "queda";
                }
            }

            return {
                ...item,
                percentual,
                tipo
            };
        }).reverse();

    }, [fechamentosSemDuplicados]);
    useEffect(() => {

        console.log("==============================================");
        console.log("🔎 DIAGNÓSTICO COMPLETO FECHAMENTOS");
        console.log("==============================================");

        // 1. DADOS BRUTOS NO STATE
        console.log(
            "[1] FECHAMENTOS NO STATE:",
            fechamentos.length
        );

        console.table(
            fechamentos.map((f) => ({
                id: f.id,
                usuario_id: f.usuario_id,
                nome: f.nome_completo,
                data: f.data,
                hora: f.hora,
                valor: f.valor_total
            }))
        );


        // 2. VERIFICAR IDs DUPLICADOS
        const ids = new Map();

        fechamentos.forEach((f) => {

            const id = String(f.id);

            ids.set(
                id,
                (ids.get(id) || 0) + 1
            );

        });

        const idsDuplicados = Array.from(ids.entries())
            .filter(([, quantidade]) => quantidade > 1);

        console.log(
            "[2] IDs DUPLICADOS:",
            idsDuplicados
        );


        // 3. VER EXATAMENTE QUAIS REGISTROS
        // SUA REGRA DATA + VALOR ESTÁ REMOVENDO

        const mapaDataValor = new Map();

        fechamentos.forEach((f) => {

            const valor = converterValor(
                f.valor_total
            );

            const chave =
                `${f.data || ""}|${valor.toFixed(2)}`;

            if (!mapaDataValor.has(chave)) {
                mapaDataValor.set(chave, []);
            }

            mapaDataValor.get(chave).push(f);

        });

        const gruposRemovidos =
            Array.from(mapaDataValor.entries())
                .filter(([, registros]) => registros.length > 1);

        console.log(
            "[3] GRUPOS DATA + VALOR CONSIDERADOS DUPLICADOS:",
            gruposRemovidos.length
        );

        gruposRemovidos.forEach(([chave, registros]) => {

            console.log(
                "❌ CHAVE REMOVIDA:",
                chave,
                "QUANTIDADE:",
                registros.length
            );

            console.table(
                registros.map((f) => ({
                    id: f.id,
                    usuario_id: f.usuario_id,
                    nome: f.nome_completo,
                    data: f.data,
                    hora: f.hora,
                    valor: f.valor_total
                }))
            );

        });


        // 4. RESULTADO DEPOIS DA REMOÇÃO
        console.log(
            "[4] ANTES DA REMOÇÃO:",
            fechamentos.length
        );

        console.log(
            "[4] DEPOIS DA REMOÇÃO:",
            fechamentosSemDuplicados.length
        );

        console.log(
            "[4] TOTAL REMOVIDO:",
            fechamentos.length -
            fechamentosSemDuplicados.length
        );


        // 5. FUNCIONÁRIOS ENCONTRADOS
        console.log(
            "[5] FUNCIONÁRIOS:",
            funcionariosFechamentos.length
        );

        console.table(
            funcionariosFechamentos
        );


        // 6. FILTROS ATIVOS
        console.log(
            "[6] FILTROS:",
            {
                funcionarioSelecionado,
                dataInicial,
                dataFinal,
                horaInicial,
                horaFinal
            }
        );


        // 7. RESULTADO FINAL DEPOIS DOS FILTROS
        console.log(
            "[7] FECHAMENTOS APÓS FILTROS:",
            fechamentosFiltrados.length
        );

        console.table(
            fechamentosFiltrados.map((f) => ({
                id: f.id,
                usuario_id: f.usuario_id,
                nome: f.nome_completo,
                data: f.data,
                hora: f.hora,
                valor: f.valor_total
            }))
        );


        // 8. TOTAL BRUTO
        const totalBruto = fechamentos.reduce(
            (total, f) =>
                total + converterValor(f.valor_total),
            0
        );

        console.log(
            "[8] TOTAL BRUTO DOS 290:",
            totalBruto
        );


        // 9. TOTAL DEPOIS DE REMOVER DUPLICADOS
        const totalSemDuplicados =
            fechamentosSemDuplicados.reduce(
                (total, f) =>
                    total + converterValor(f.valor_total),
                0
            );

        console.log(
            "[9] TOTAL SEM DUPLICADOS:",
            totalSemDuplicados
        );


        // 10. TOTAL FINAL DA TELA
        console.log(
            "[10] TOTAL FINAL EXIBIDO:",
            totalPeriodo
        );


        // 11. RESUMO POR MÊS
        console.log(
            "[11] RESUMO MENSAL:"
        );

        console.table(
            resumoMensal.map((m) => ({
                mes: m.mes,
                quantidade: m.quantidade,
                total: m.total,
                percentual: m.percentual,
                tipo: m.tipo
            }))
        );


        // 12. CACHE
        try {

            const cache =
                JSON.parse(
                    localStorage.getItem(
                        CHAVE_CACHE_FECHAMENTOS
                    ) || "[]"
                );

            console.log(
                "[12] REGISTROS NO CACHE:",
                cache.length
            );

            console.log(
                "[12] CACHE IGUAL AO STATE:",
                JSON.stringify(cache) ===
                JSON.stringify(fechamentos)
            );

        } catch (erro) {

            console.error(
                "[12] ERRO AO LER CACHE:",
                erro
            );

        }


        console.log("==============================================");
        console.log("🔎 FIM DO DIAGNÓSTICO");
        console.log("==============================================");

    }, [
        fechamentos,
        fechamentosSemDuplicados,
        funcionariosFechamentos,
        fechamentosFiltrados,
        totalPeriodo,
        resumoMensal,
        funcionarioSelecionado,
        dataInicial,
        dataFinal,
        horaInicial,
        horaFinal
    ]);
    function limparFiltros() {

        setDataInicial("");
        setDataFinal("");
        setHoraInicial("");
        setHoraFinal("");
        setFuncionarioSelecionado("");

    }

    return (
        <div className="fechamento-caixa-painel-master">

            <div className="fechamento-caixa-cabecalho-premium">

                <div className="fechamento-caixa-titulo-area">


                    <h4 className="fechamento-caixa-titulo-principal">
                        Fechamentos de Caixa
                    </h4>

                    <p className="fechamento-caixa-subtitulo">
                        Consulte, filtre e acompanhe os fechamentos realizados
                    </p>
                </div>

                <button
                    type="button"
                    className={`fechamento-caixa-botao-mensal ${mostrarResumoMensal
                        ? "fechamento-caixa-botao-mensal-ativo"
                        : ""
                        }`}
                    onClick={() =>
                        setMostrarResumoMensal(
                            valor => !valor
                        )
                    }
                >
                    {mostrarResumoMensal
                        ? "Ocultar resumo mensal"
                        : "Ver resumo mensal"}
                </button>

            </div>
            <div className="fechamento-caixa-funcionarios-filtro">

                <div className="fechamento-caixa-funcionarios-cabecalho">

                    <span>FILTRAR POR RESPONSÁVEL</span>

                    {funcionarioSelecionado && (
                        <strong>
                            {funcionariosFechamentos.find(
                                funcionario =>
                                    funcionario.id === funcionarioSelecionado
                            )?.nome}
                        </strong>
                    )}

                </div>

                <div className="fechamento-caixa-funcionarios-botoes">

                    <button
                        type="button"
                        className={`fechamento-caixa-funcionario-botao ${funcionarioSelecionado === ""
                            ? "fechamento-caixa-funcionario-ativo"
                            : ""
                            }`}
                        onClick={() => setFuncionarioSelecionado("")}
                    >
                        Todos
                    </button>

                    {funcionariosFechamentos.map((funcionario) => (

                        <button
                            type="button"
                            key={funcionario.id}
                            className={`fechamento-caixa-funcionario-botao ${funcionarioSelecionado === funcionario.id
                                ? "fechamento-caixa-funcionario-ativo"
                                : ""
                                }`}
                            onClick={() =>
                                setFuncionarioSelecionado(funcionario.id)
                            }
                        >
                            {funcionario.nome}
                        </button>

                    ))}

                </div>

            </div>
            <div className="fechamento-caixa-filtros-premium">

                <div className="fechamento-caixa-filtro-grupo">

                    <label>
                        Data inicial
                    </label>

                    <input
                        type="date"
                        value={dataInicial}
                        onChange={(e) =>
                            setDataInicial(e.target.value)
                        }
                    />

                </div>

                <div className="fechamento-caixa-filtro-grupo">

                    <label>
                        Data final
                    </label>

                    <input
                        type="date"
                        value={dataFinal}
                        onChange={(e) =>
                            setDataFinal(e.target.value)
                        }
                    />

                </div>

                <div className="fechamento-caixa-filtro-grupo">

                    <label>
                        Hora inicial
                    </label>

                    <input
                        type="time"
                        value={horaInicial}
                        onChange={(e) =>
                            setHoraInicial(e.target.value)
                        }
                    />

                </div>

                <div className="fechamento-caixa-filtro-grupo">

                    <label>
                        Hora final
                    </label>

                    <input
                        type="time"
                        value={horaFinal}
                        onChange={(e) =>
                            setHoraFinal(e.target.value)
                        }
                    />

                </div>

                <button
                    type="button"
                    className="fechamento-caixa-limpar-filtros"
                    onClick={limparFiltros}
                >
                    Limpar filtros
                </button>

            </div>

            <div className="fechamento-caixa-indicadores">

                <div className="fechamento-caixa-indicador-card">

                    <span>
                        Total vendido no período
                    </span>

                    <strong>
                        {formatarDinheiro(totalPeriodo)}
                    </strong>

                </div>

                <div className="fechamento-caixa-indicador-card">

                    <span>
                        Fechamentos encontrados
                    </span>

                    <strong>
                        {fechamentosFiltrados.length}
                    </strong>

                </div>

                <div className="fechamento-caixa-indicador-card">

                    <span>
                        Média por fechamento
                    </span>

                    <strong>
                        {formatarDinheiro(
                            fechamentosFiltrados.length > 0
                                ? totalPeriodo /
                                fechamentosFiltrados.length
                                : 0
                        )}
                    </strong>

                </div>

            </div>

            {mostrarResumoMensal && (
                <div className="fechamento-caixa-resumo-mensal">

                    <div className="fechamento-caixa-resumo-mensal-cabecalho">

                        <div>
                            <span>
                                HISTÓRICO
                            </span>

                            <h5>
                                Desempenho mensal
                            </h5>
                        </div>

                    </div>

                    <div className="fechamento-caixa-meses-grid">

                        {resumoMensal.map((mes) => (

                            <div
                                key={mes.mes}
                                className="fechamento-caixa-mes-card"
                            >

                                <div className="fechamento-caixa-mes-topo">

                                    <strong>
                                        {obterNomeMes(mes.mes)}
                                    </strong>

                                    <span>
                                        {mes.quantidade} fechamentos
                                    </span>

                                </div>

                                <div className="fechamento-caixa-mes-valor">
                                    {formatarDinheiro(mes.total)}
                                </div>

                                {mes.percentual !== null ? (

                                    <div
                                        className={`fechamento-caixa-variacao fechamento-caixa-variacao-${mes.tipo}`}
                                    >

                                        <strong>
                                            {mes.percentual > 0
                                                ? "↑"
                                                : mes.percentual < 0
                                                    ? "↓"
                                                    : "="}

                                            {" "}

                                            {Math.abs(
                                                mes.percentual
                                            ).toFixed(1)}%
                                        </strong>

                                        <span>
                                            comparado ao mês anterior
                                        </span>

                                    </div>

                                ) : (

                                    <div className="fechamento-caixa-variacao fechamento-caixa-variacao-neutra">
                                        Primeiro mês registrado
                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                </div>
            )}

            <div className="fechamento-caixa-listagem-area">

                {carregando && (
                    <div className="fechamento-caixa-carregando-premium">
                        Carregando fechamentos...
                    </div>
                )}

                {!carregando &&
                    fechamentosFiltrados.length === 0 && (

                        <div className="fechamento-caixa-vazio-premium">

                            <strong>
                                Nenhum fechamento encontrado
                            </strong>

                            <span>
                                Tente alterar os filtros selecionados.
                            </span>

                        </div>

                    )}

                {!carregando &&
                    Object.entries(fechamentosPorData).map(
                        ([data, itens]) => {

                            const totalDia = itens.reduce(
                                (total, fechamento) =>
                                    total +
                                    converterValor(
                                        fechamento.valor_total
                                    ),
                                0
                            );

                            return (
                                <section
                                    key={data}
                                    className="fechamento-caixa-grupo-data"
                                >

                                    <div className="fechamento-caixa-data-cabecalho">

                                        <div className="fechamento-caixa-data-info">

                                            <span>
                                                DATA
                                            </span>

                                            <strong>
                                                {formatarData(data)}
                                            </strong>

                                        </div>

                                        <div className="fechamento-caixa-data-resumo">

                                            <span>
                                                {itens.length}{" "}
                                                {itens.length === 1
                                                    ? "fechamento"
                                                    : "fechamentos"}
                                            </span>

                                            <strong>
                                                {formatarDinheiro(
                                                    totalDia
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                    <div className="fechamento-caixa-itens-dia">

                                        {itens.map((f) => (

                                            <button
                                                type="button"
                                                key={f.id}
                                                className="fechamento-caixa-item-interativo"
                                                onClick={() => {
                                                    if (f.link) {
                                                        window.open(
                                                            f.link,
                                                            "_blank",
                                                            "noopener,noreferrer"
                                                        );
                                                    }
                                                }}
                                            >

                                                <div className="fechamento-caixa-item-hora">
                                                    {f.hora || "--:--"}
                                                </div>

                                                <div className="fechamento-caixa-item-pessoa">

                                                    <span>
                                                        Responsável
                                                    </span>

                                                    <strong>
                                                        {f.nome_completo ||
                                                            "Não informado"}
                                                    </strong>

                                                </div>

                                                <div className="fechamento-caixa-item-valor">

                                                    <span>
                                                        Total vendido
                                                    </span>

                                                    <strong>
                                                        {formatarDinheiro(
                                                            f.valor_total
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="fechamento-caixa-item-acao">
                                                    Abrir fechamento
                                                    <span>›</span>
                                                </div>

                                            </button>

                                        ))}

                                    </div>

                                </section>
                            );
                        }
                    )}

            </div>

        </div>
    );
}