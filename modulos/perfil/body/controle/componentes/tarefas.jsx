import React, {
    useCallback,
    useEffect,
    useState
} from "react";
import { API_URL } from "../../../../../config";
import "./tarefas.css";

import { createPortal } from "react-dom";
export default function Tarefas() {

    const [abaMobile, setAbaMobile] =
        useState("pontuais");

    const [tarefasPontuais, setTarefasPontuais] =
        useState([]);

    const [tarefasFixas, setTarefasFixas] =
        useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [salvandoPontual, setSalvandoPontual] =
        useState(false);

    const [salvandoFixa, setSalvandoFixa] =
        useState(false);

    const [novasPontuais, setNovasPontuais] =
        useState([""]);

    const [novasFixas, setNovasFixas] =
        useState([""]);

    const [dataFazer, setDataFazer] =
        useState("");

    const [horaFazer, setHoraFazer] =
        useState("");

    const [sequenciaTipo, setSequenciaTipo] =
        useState("diario");

    const [quantidadeDias, setQuantidadeDias] =
        useState(2);

    const [diaSemana, setDiaSemana] =
        useState("segunda");

    const [diaMes, setDiaMes] =
        useState(1);
    const [modalApagar, setModalApagar] =
        useState(null);

    const [apagandoTarefa, setApagandoTarefa] =
        useState(false);
    const [modalCancelarFixa, setModalCancelarFixa] =
        useState(null);

    const [cancelandoFixa, setCancelandoFixa] =
        useState(false);
    /* =====================================================
       DADOS DO USUÁRIO
    ===================================================== */

    const token =
        localStorage.getItem("token") || "";


    /* =====================================================
       URL DA API
    ===================================================== */



    /* =====================================================
       HEADERS
    ===================================================== */

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };


    /* =====================================================
       TRATAR RESPOSTA
    ===================================================== */

    async function tratarResposta(response) {

        let dados = {};

        try {
            dados = await response.json();
        } catch {
            dados = {};
        }

        if (!response.ok) {

            throw new Error(
                dados.detail ||
                "Não foi possível concluir a operação"
            );
        }

        return dados;
    }


    /* =====================================================
       CARREGAR TAREFAS
    ===================================================== */

    const carregarTarefas = useCallback(
        async () => {

            if (!token) {
                setTarefasPontuais([]);
                setTarefasFixas([]);
                setCarregando(false);
                return;
            }

            setCarregando(true);

            try {

                const [
                    respostaPontuais,
                    respostaFixas
                ] = await Promise.all([
                    fetch(
                        `${API_URL}/tarefas/repentinas`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            }
                        }
                    ),

                    fetch(
                        `${API_URL}/tarefas/fixas`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                ]);

                const dadosPontuais =
                    await tratarResposta(
                        respostaPontuais
                    );

                const dadosFixas =
                    await tratarResposta(
                        respostaFixas
                    );

                setTarefasPontuais(
                    Array.isArray(dadosPontuais.tarefas)
                        ? dadosPontuais.tarefas
                        : []
                );

                setTarefasFixas(
                    Array.isArray(dadosFixas.tarefas)
                        ? dadosFixas.tarefas
                        : []
                );

            } catch (erro) {

                console.error(
                    "Erro ao carregar tarefas:",
                    erro
                );

                setTarefasPontuais([]);
                setTarefasFixas([]);

            } finally {

                setCarregando(false);
            }
        },
        [token]
    );


    /* =====================================================
       CARREGAMENTO INICIAL
    ===================================================== */

    useEffect(() => {

        carregarTarefas();

    }, [carregarTarefas]);


    /* =====================================================
       ALTERAR CAMPO DE TAREFA
    ===================================================== */

    function alterarTarefa(
        tipo,
        index,
        valor
    ) {

        if (tipo === "pontual") {

            setNovasPontuais((anteriores) => {

                const copia = [...anteriores];

                copia[index] = valor;

                return copia;
            });

            return;
        }

        setNovasFixas((anteriores) => {

            const copia = [...anteriores];

            copia[index] = valor;

            return copia;
        });
    }


    /* =====================================================
       ADICIONAR NOVO CAMPO
    ===================================================== */

    function adicionarCampo(tipo) {

        if (tipo === "pontual") {

            setNovasPontuais(
                (anteriores) => [
                    ...anteriores,
                    ""
                ]
            );

            return;
        }

        setNovasFixas(
            (anteriores) => [
                ...anteriores,
                ""
            ]
        );
    }


    /* =====================================================
       REMOVER CAMPO
    ===================================================== */

    function removerCampo(
        tipo,
        index
    ) {

        if (tipo === "pontual") {

            setNovasPontuais(
                (anteriores) => {

                    if (anteriores.length === 1) {
                        return [""];
                    }

                    return anteriores.filter(
                        (_, indice) =>
                            indice !== index
                    );
                }
            );

            return;
        }

        setNovasFixas(
            (anteriores) => {

                if (anteriores.length === 1) {
                    return [""];
                }

                return anteriores.filter(
                    (_, indice) =>
                        indice !== index
                );
            }
        );
    }


    /* =====================================================
       SALVAR TAREFAS PONTUAIS
    ===================================================== */

    async function salvarPontuais() {

        const tarefas = novasPontuais
            .map((tarefa) => tarefa.trim())
            .filter(Boolean);

        if (!tarefas.length) {

            alert(
                "Adicione pelo menos uma tarefa."
            );

            return;
        }

        if (!dataFazer) {

            alert(
                "Informe a data para realizar as tarefas."
            );

            return;
        }

        if (!horaFazer) {

            alert(
                "Informe o horário para realizar as tarefas."
            );

            return;
        }

        setSalvandoPontual(true);

        try {

            const response = await fetch(
                `${API_URL}/tarefas/repentinas`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        tarefas,
                        data_fazer: dataFazer,
                        hora_fazer: horaFazer
                    })
                }
            );

            await tratarResposta(response);

            setNovasPontuais([""]);
            setDataFazer("");
            setHoraFazer("");

            await carregarTarefas();

        } catch (erro) {

            alert(erro.message);

        } finally {

            setSalvandoPontual(false);
        }
    }


    /* =====================================================
       SALVAR TAREFAS FIXAS
    ===================================================== */

    async function salvarFixas() {

        const tarefas = novasFixas
            .map((tarefa) => tarefa.trim())
            .filter(Boolean);

        if (!tarefas.length) {

            alert(
                "Adicione pelo menos uma tarefa."
            );

            return;
        }

        let sequencia = sequenciaTipo;
        let lembrar = null;

        /* ================================================
           SEMANAL
        ================================================= */

        if (sequenciaTipo === "semanal") {

            if (!diaSemana) {

                alert(
                    "Escolha o dia da semana."
                );

                return;
            }

            lembrar = diaSemana;
        }

        /* ================================================
           MENSAL
        ================================================= */

        if (sequenciaTipo === "mensal") {

            const dia = Number(diaMes);

            if (
                !Number.isInteger(dia) ||
                dia < 1 ||
                dia > 31
            ) {

                alert(
                    "Informe um dia do mês entre 1 e 31."
                );

                return;
            }

            lembrar = String(dia);
        }

        /* ================================================
           A CADA X DIAS
        ================================================= */

        if (
            sequenciaTipo === "personalizado"
        ) {

            const dias = Number(
                quantidadeDias
            );

            if (
                !Number.isInteger(dias) ||
                dias < 1
            ) {

                alert(
                    "Informe uma quantidade válida de dias."
                );

                return;
            }

            sequencia =
                `a_cada_${dias}_dias`;

            lembrar = null;
        }

        /* ================================================
           TODOS OS DIAS
        ================================================= */

        if (sequenciaTipo === "diario") {

            lembrar = null;
        }

        setSalvandoFixa(true);

        try {

            const response = await fetch(
                `${API_URL}/tarefas/fixas`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        tarefas,
                        sequencia,
                        lembrar
                    })
                }
            );

            await tratarResposta(response);

            setNovasFixas([""]);

            setSequenciaTipo(
                "diario"
            );

            setQuantidadeDias(2);

            setDiaSemana(
                "segunda"
            );

            setDiaMes(1);

            await carregarTarefas();

        } catch (erro) {

            alert(
                erro.message
            );

        } finally {

            setSalvandoFixa(false);
        }
    }

    /* =====================================================
       CUMPRIR TAREFA PONTUAL
    ===================================================== */

    async function cumprirPontual(
        tarefaId
    ) {

        try {

            const response = await fetch(
                `${API_URL}/tarefas/repentinas/${tarefaId}/cumprir`,
                {
                    method: "POST",
                    headers
                }
            );

            await tratarResposta(response);

            await carregarTarefas();

        } catch (erro) {

            alert(erro.message);
        }
    }


    /* =====================================================
       CUMPRIR TAREFA FIXA
    ===================================================== */

    /* =====================================================
     ABRIR MODAL CANCELAR RECORRENTE
  ===================================================== */

    function abrirModalCancelarFixa(
        item
    ) {

        setModalCancelarFixa({
            id: item.id,
            tarefa: item.tarefa
        });
    }


    /* =====================================================
       FECHAR MODAL CANCELAR RECORRENTE
    ===================================================== */

    function fecharModalCancelarFixa() {

        if (cancelandoFixa) {
            return;
        }

        setModalCancelarFixa(null);
    }


    /* =====================================================
       CONFIRMAR CANCELAMENTO
    ===================================================== */

    async function confirmarCancelarFixa() {

        if (
            !modalCancelarFixa ||
            cancelandoFixa
        ) {
            return;
        }

        setCancelandoFixa(true);

        try {

            const response = await fetch(
                `${API_URL}/tarefas/fixas/${modalCancelarFixa.id}/cancelar`,
                {
                    method: "POST",
                    headers
                }
            );

            await tratarResposta(
                response
            );

            setModalCancelarFixa(
                null
            );

            await carregarTarefas();

        } catch (erro) {

            alert(
                erro.message
            );

        } finally {

            setCancelandoFixa(
                false
            );
        }
    }
    /* =====================================================
       APAGAR TAREFA PONTUAL
    ===================================================== */
    /* =====================================================
       ABRIR MODAL PARA APAGAR
    ===================================================== */

    function abrirModalApagar(
        tipo,
        item
    ) {

        setModalApagar({
            id: item.id,
            tipo,
            tarefa: item.tarefa
        });
    }


    /* =====================================================
       FECHAR MODAL
    ===================================================== */

    function fecharModalApagar() {

        if (apagandoTarefa) {
            return;
        }

        setModalApagar(null);
    }


    /* =====================================================
       CONFIRMAR EXCLUSÃO
    ===================================================== */

    async function confirmarApagarTarefa() {

        if (
            !modalApagar ||
            apagandoTarefa
        ) {
            return;
        }

        setApagandoTarefa(true);

        try {

            const rota =
                modalApagar.tipo === "pontual"
                    ? `${API_URL}/tarefas/repentinas/${modalApagar.id}`
                    : `${API_URL}/tarefas/fixas/${modalApagar.id}`;

            const response = await fetch(
                rota,
                {
                    method: "DELETE",
                    headers
                }
            );

            await tratarResposta(
                response
            );

            setModalApagar(null);

            await carregarTarefas();

        } catch (erro) {

            alert(
                erro.message
            );

        } finally {

            setApagandoTarefa(false);
        }
    }

    /* =====================================================
       FORMATAR DATA
    ===================================================== */

    function formatarData(data) {

        if (!data) {
            return "";
        }

        const partes =
            String(data)
                .substring(0, 10)
                .split("-");

        if (partes.length !== 3) {
            return data;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }


    /* =====================================================
       FORMATAR HORA
    ===================================================== */

    function formatarHora(hora) {

        if (!hora) {
            return "";
        }

        return String(hora)
            .substring(0, 5);
    }


    /* =====================================================
       FORMATAR SEQUÊNCIA
    ===================================================== */

    function formatarSequencia(
        sequencia
    ) {

        if (sequencia === "diario") {
            return "Todos os dias";
        }

        if (sequencia === "semanal") {
            return "Semanal";
        }

        if (sequencia === "mensal") {
            return "Mensal";
        }

        const resultado =
            String(sequencia || "")
                .match(
                    /^a_cada_(\d+)_dias$/
                );

        if (resultado) {

            return `A cada ${resultado[1]} dias`;
        }

        return sequencia;
    }


    /* =====================================================
       CAMPOS DE TAREFAS
    ===================================================== */

    function renderizarCampos(
        tipo,
        tarefas
    ) {

        return (
            <div className="tarefas-cadastro-lote-campos">

                {tarefas.map(
                    (tarefa, index) => (

                        <div
                            className="tarefas-cadastro-lote-linha"
                            key={`${tipo}-${index}`}
                        >

                            <input
                                className="tarefas-cadastro-lote-input"
                                type="text"
                                placeholder={`Tarefa ${index + 1}`}
                                value={tarefa}
                                onChange={(event) =>
                                    alterarTarefa(
                                        tipo,
                                        index,
                                        event.target.value
                                    )
                                }
                            />

                            <button
                                className="tarefas-cadastro-lote-remover"
                                type="button"
                                onClick={() =>
                                    removerCampo(
                                        tipo,
                                        index
                                    )
                                }
                                title="Remover"
                            >
                                ×
                            </button>

                        </div>
                    )
                )}

                <button
                    className="tarefas-cadastro-adicionar-linha"
                    type="button"
                    onClick={() =>
                        adicionarCampo(tipo)
                    }
                >
                    + Adicionar outra tarefa
                </button>

            </div>
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="tarefas-gestao-principal">

            <div className="tarefas-gestao-cabecalho">

                <div className="tarefas-gestao-cabecalho-textos">

                    <h1 className="tarefas-gestao-titulo">
                        Tarefas
                    </h1>

                    <p className="tarefas-gestao-subtitulo">
                        Organize tarefas pontuais e recorrentes da equipe.
                    </p>

                </div>

            </div>


            {/* =============================================
                NAVEGAÇÃO MOBILE
            ============================================= */}

            <div className="tarefas-gestao-mobile-abas">

                <button
                    type="button"
                    className={
                        abaMobile === "pontuais"
                            ? "tarefas-gestao-mobile-botao tarefas-gestao-mobile-botao-ativo"
                            : "tarefas-gestao-mobile-botao"
                    }
                    onClick={() =>
                        setAbaMobile("pontuais")
                    }
                >
                    Pontuais
                </button>

                <button
                    type="button"
                    className={
                        abaMobile === "fixas"
                            ? "tarefas-gestao-mobile-botao tarefas-gestao-mobile-botao-ativo"
                            : "tarefas-gestao-mobile-botao"
                    }
                    onClick={() =>
                        setAbaMobile("fixas")
                    }
                >
                    Recorrentes
                </button>

            </div>


            {/* =============================================
                DUAS COLUNAS
            ============================================= */}

            <div className="tarefas-gestao-colunas">

                {/* =========================================
                    TAREFAS PONTUAIS
                ========================================= */}

                <section
                    className={
                        abaMobile === "pontuais"
                            ? "tarefas-coluna-painel tarefas-coluna-painel-mobile-visivel"
                            : "tarefas-coluna-painel"
                    }
                >

                    <div className="tarefas-coluna-cabecalho">

                        <div>

                            <h2 className="tarefas-coluna-titulo">
                                Tarefas pontuais
                            </h2>

                            <span className="tarefas-coluna-descricao">
                                Atividades com data e horário definidos.
                            </span>

                        </div>

                        <span className="tarefas-coluna-contador">
                            {tarefasPontuais.length}
                        </span>

                    </div>


                    {/* CADASTRO */}

                    <div className="tarefas-cadastro-card">

                        <h3 className="tarefas-cadastro-titulo">
                            Adicionar tarefas
                        </h3>

                        {renderizarCampos(
                            "pontual",
                            novasPontuais
                        )}

                        <div className="tarefas-cadastro-agendamento">

                            <label className="tarefas-cadastro-grupo">

                                <span>
                                    Data
                                </span>

                                <input
                                    type="date"
                                    value={dataFazer}
                                    onChange={(event) =>
                                        setDataFazer(
                                            event.target.value
                                        )
                                    }
                                />

                            </label>

                            <label className="tarefas-cadastro-grupo">

                                <span>
                                    Horário
                                </span>

                                <input
                                    type="time"
                                    value={horaFazer}
                                    onChange={(event) =>
                                        setHoraFazer(
                                            event.target.value
                                        )
                                    }
                                />

                            </label>

                        </div>

                        <button
                            className="tarefas-cadastro-salvar"
                            type="button"
                            disabled={salvandoPontual}
                            onClick={salvarPontuais}
                        >
                            {salvandoPontual
                                ? "Salvando..."
                                : "Salvar tarefas"}
                        </button>

                    </div>


                    {/* LISTA */}

                    <div className="tarefas-listagem-area">

                        {carregando ? (

                            <div className="tarefas-listagem-vazia">
                                Carregando tarefas...
                            </div>

                        ) : tarefasPontuais.length === 0 ? (

                            <div className="tarefas-listagem-vazia">
                                Nenhuma tarefa pontual cadastrada.
                            </div>

                        ) : (

                            tarefasPontuais.map(
                                (item) => {

                                    const concluida =
                                        item.cumprido !== null &&
                                        item.cumprido !== undefined;

                                    return (
                                        <article
                                            className={
                                                concluida
                                                    ? "tarefas-item-card tarefas-item-card-concluido"
                                                    : "tarefas-item-card"
                                            }
                                            key={item.id}
                                        >

                                            <div className="tarefas-item-conteudo">

                                                <div className="tarefas-item-status-linha">

                                                    <span
                                                        className={
                                                            concluida
                                                                ? "tarefas-item-status tarefas-item-status-concluido"
                                                                : "tarefas-item-status tarefas-item-status-pendente"
                                                        }
                                                    >
                                                        {concluida
                                                            ? "Cumprida"
                                                            : "Pendente"}
                                                    </span>

                                                    <span className="tarefas-item-id">
                                                        #{item.id}
                                                    </span>

                                                </div>

                                                <strong className="tarefas-item-texto">
                                                    {item.tarefa}
                                                </strong>

                                                <div className="tarefas-item-detalhes">

                                                    <span>
                                                        Fazer em{" "}
                                                        <b>
                                                            {formatarData(
                                                                item.data_fazer
                                                            )}
                                                        </b>
                                                    </span>

                                                    <span>
                                                        às{" "}
                                                        <b>
                                                            {formatarHora(
                                                                item.hora_fazer
                                                            )}
                                                        </b>
                                                    </span>

                                                </div>

                                            </div>

                                            <div className="tarefas-item-acoes">

                                                {!concluida && (

                                                    <button
                                                        className="tarefas-item-cumprir"
                                                        type="button"
                                                        onClick={() =>
                                                            cumprirPontual(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        Feita
                                                    </button>

                                                )}

                                                <button
                                                    className="tarefas-item-apagar"
                                                    type="button"
                                                    onClick={() =>
                                                        abrirModalApagar(
                                                            "pontual",
                                                            item
                                                        )
                                                    }
                                                >
                                                    Apagar
                                                </button>

                                            </div>

                                        </article>
                                    );
                                }
                            )
                        )}

                    </div>

                </section>


                {/* =========================================
                    TAREFAS RECORRENTES
                ========================================= */}

                <section
                    className={
                        abaMobile === "fixas"
                            ? "tarefas-coluna-painel tarefas-coluna-painel-mobile-visivel"
                            : "tarefas-coluna-painel"
                    }
                >

                    <div className="tarefas-coluna-cabecalho">

                        <div>

                            <h2 className="tarefas-coluna-titulo">
                                Tarefas recorrentes
                            </h2>

                            <span className="tarefas-coluna-descricao">
                                Atividades que se repetem periodicamente.
                            </span>

                        </div>

                        <span className="tarefas-coluna-contador">
                            {tarefasFixas.length}
                        </span>

                    </div>


                    {/* CADASTRO */}

                    <div className="tarefas-cadastro-card">

                        <h3 className="tarefas-cadastro-titulo">
                            Adicionar tarefas
                        </h3>

                        {renderizarCampos(
                            "fixa",
                            novasFixas
                        )}

                        <label className="tarefas-cadastro-grupo">

                            <span>
                                Repetição
                            </span>

                            <select
                                value={sequenciaTipo}
                                onChange={(event) =>
                                    setSequenciaTipo(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="diario">
                                    Todos os dias
                                </option>

                                <option value="semanal">
                                    Semanal
                                </option>

                                <option value="mensal">
                                    Mensal
                                </option>

                                <option value="personalizado">
                                    A cada X dias
                                </option>
                            </select>

                        </label>
                        {/* =============================================
    DIA DA SEMANA
============================================= */}

                        {sequenciaTipo === "semanal" && (

                            <label className="tarefas-cadastro-grupo">

                                <span>
                                    Lembrar na
                                </span>

                                <select
                                    value={diaSemana}
                                    onChange={(event) =>
                                        setDiaSemana(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="segunda">
                                        Segunda-feira
                                    </option>

                                    <option value="terca">
                                        Terça-feira
                                    </option>

                                    <option value="quarta">
                                        Quarta-feira
                                    </option>

                                    <option value="quinta">
                                        Quinta-feira
                                    </option>

                                    <option value="sexta">
                                        Sexta-feira
                                    </option>

                                    <option value="sabado">
                                        Sábado
                                    </option>

                                    <option value="domingo">
                                        Domingo
                                    </option>
                                </select>

                            </label>
                        )}


                        {/* =============================================
    DIA DO MÊS
============================================= */}

                        {sequenciaTipo === "mensal" && (

                            <label className="tarefas-cadastro-grupo">

                                <span>
                                    Lembrar no dia
                                </span>

                                <div className="tarefas-cadastro-dias-personalizado">

                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={diaMes}
                                        onChange={(event) =>
                                            setDiaMes(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span>
                                        do mês
                                    </span>

                                </div>

                            </label>
                        )}
                        {sequenciaTipo ===
                            "personalizado" && (

                                <label className="tarefas-cadastro-grupo tarefas-cadastro-grupo-personalizado">

                                    <span>
                                        Repetir a cada
                                    </span>

                                    <div className="tarefas-cadastro-dias-personalizado">

                                        <input
                                            type="number"
                                            min="1"
                                            value={quantidadeDias}
                                            onChange={(event) =>
                                                setQuantidadeDias(
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <span>
                                            dias
                                        </span>

                                    </div>

                                </label>
                            )}

                        <button
                            className="tarefas-cadastro-salvar"
                            type="button"
                            disabled={salvandoFixa}
                            onClick={salvarFixas}
                        >
                            {salvandoFixa
                                ? "Salvando..."
                                : "Salvar tarefas"}
                        </button>

                    </div>


                    {/* LISTA */}

                    <div className="tarefas-listagem-area">

                        {carregando ? (

                            <div className="tarefas-listagem-vazia">
                                Carregando tarefas...
                            </div>

                        ) : tarefasFixas.length === 0 ? (

                            <div className="tarefas-listagem-vazia">
                                Nenhuma tarefa recorrente cadastrada.
                            </div>

                        ) : (

                            tarefasFixas.map(
                                (item) => {

                                    const cancelada =
                                        Number(
                                            item.cancelada
                                        ) === 1;

                                    return (

                                        <article
                                            className={
                                                cancelada
                                                    ? "tarefas-item-card tarefas-item-card-fixa tarefas-item-card-fixa-cancelada"
                                                    : "tarefas-item-card tarefas-item-card-fixa"
                                            }
                                            key={item.id}
                                        >

                                            <div className="tarefas-item-conteudo">

                                                <div className="tarefas-item-status-linha">

                                                    {cancelada && (

                                                        <span className="tarefas-item-status-cancelada">
                                                            Cancelada
                                                        </span>

                                                    )}

                                                    <span className="tarefas-item-sequencia">
                                                        {formatarSequencia(
                                                            item.sequencia
                                                        )}
                                                    </span>


                                                    {item.lembrar && (

                                                        <span className="tarefas-item-lembrete">

                                                            {item.sequencia === "semanal"
                                                                ? `Lembrar: ${{
                                                                    segunda: "Segunda-feira",
                                                                    terca: "Terça-feira",
                                                                    quarta: "Quarta-feira",
                                                                    quinta: "Quinta-feira",
                                                                    sexta: "Sexta-feira",
                                                                    sabado: "Sábado",
                                                                    domingo: "Domingo"
                                                                }[item.lembrar] || item.lembrar
                                                                }`
                                                                : item.sequencia === "mensal"
                                                                    ? `Lembrar: dia ${item.lembrar}`
                                                                    : null}

                                                        </span>

                                                    )}

                                                </div>


                                                <strong className="tarefas-item-texto">
                                                    {item.tarefa}
                                                </strong>

                                            </div>


                                            <div className="tarefas-item-acoes">

                                                {!cancelada && (

                                                    <button
                                                        className="tarefas-item-cancelar-fixa"
                                                        type="button"
                                                        onClick={() =>
                                                            abrirModalCancelarFixa(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        Cancelar
                                                    </button>

                                                )}


                                                <button
                                                    className="tarefas-item-apagar"
                                                    type="button"
                                                    onClick={() =>
                                                        abrirModalApagar(
                                                            "fixa",
                                                            item
                                                        )
                                                    }
                                                >
                                                    Apagar
                                                </button>

                                            </div>

                                        </article>
                                    );
                                }
                            )
                        )}

                    </div>

                </section>

            </div>
            {modalApagar &&
                createPortal(

                    <div
                        className="tarefas-modal-apagar-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                fecharModalApagar();
                            }
                        }}
                    >

                        <div
                            className="tarefas-modal-apagar-caixa"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="tarefas-modal-apagar-titulo"
                        >

                            <div className="tarefas-modal-apagar-icone">
                                !
                            </div>

                            <div className="tarefas-modal-apagar-conteudo">

                                <h3
                                    id="tarefas-modal-apagar-titulo"
                                    className="tarefas-modal-apagar-titulo"
                                >
                                    Apagar tarefa?
                                </h3>

                                <p className="tarefas-modal-apagar-descricao">
                                    Esta ação removerá a tarefa
                                    permanentemente.
                                </p>

                                <div className="tarefas-modal-apagar-tarefa">
                                    {modalApagar.tarefa}
                                </div>

                            </div>

                            <div className="tarefas-modal-apagar-acoes">

                                <button
                                    type="button"
                                    className="tarefas-modal-apagar-cancelar"
                                    disabled={apagandoTarefa}
                                    onClick={
                                        fecharModalApagar
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="tarefas-modal-apagar-confirmar"
                                    disabled={apagandoTarefa}
                                    onClick={
                                        confirmarApagarTarefa
                                    }
                                >
                                    {apagandoTarefa
                                        ? "Apagando..."
                                        : "Sim, apagar"}
                                </button>

                            </div>

                        </div>

                    </div>,

                    document.body
                )
            }
            {modalCancelarFixa &&
                createPortal(

                    <div
                        className="tarefas-modal-cancelar-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                fecharModalCancelarFixa();
                            }
                        }}
                    >

                        <div
                            className="tarefas-modal-cancelar-caixa"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="tarefas-modal-cancelar-titulo"
                        >

                            <div className="tarefas-modal-cancelar-icone">
                                !
                            </div>


                            <div className="tarefas-modal-cancelar-conteudo">

                                <h3
                                    id="tarefas-modal-cancelar-titulo"
                                    className="tarefas-modal-cancelar-titulo"
                                >
                                    Cancelar tarefa recorrente?
                                </h3>

                                <p className="tarefas-modal-cancelar-descricao">
                                    A tarefa continuará salva,
                                    mas deixará de gerar novos lembretes.
                                </p>

                                <div className="tarefas-modal-cancelar-tarefa">
                                    {modalCancelarFixa.tarefa}
                                </div>

                            </div>


                            <div className="tarefas-modal-cancelar-acoes">

                                <button
                                    type="button"
                                    className="tarefas-modal-cancelar-voltar"
                                    disabled={cancelandoFixa}
                                    onClick={
                                        fecharModalCancelarFixa
                                    }
                                >
                                    Voltar
                                </button>

                                <button
                                    type="button"
                                    className="tarefas-modal-cancelar-confirmar"
                                    disabled={cancelandoFixa}
                                    onClick={
                                        confirmarCancelarFixa
                                    }
                                >
                                    {cancelandoFixa
                                        ? "Cancelando..."
                                        : "Sim, cancelar"}
                                </button>

                            </div>

                        </div>

                    </div>,

                    document.body
                )
            }
        </div>
    );
}