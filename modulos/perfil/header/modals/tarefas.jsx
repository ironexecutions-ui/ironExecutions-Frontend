import React, {
    useEffect,
    useState
} from "react";

import { createPortal } from "react-dom";

import { API_URL } from "../../../../config";

import "./tarefas.css";


export default function ModalLembretesTarefas({
    dados,
    fechar,
    atualizar
}) {

    const [dadosLocais, setDadosLocais] =
        useState(dados);

    const [
        tarefaCumprindo,
        setTarefaCumprindo
    ] = useState(null);


    /* =====================================================
       SINCRONIZAR DADOS RECEBIDOS
    ===================================================== */

    useEffect(() => {

        setDadosLocais(
            dados
        );

    }, [dados]);


    /* =====================================================
       SEM DADOS
    ===================================================== */

    if (!dadosLocais) {
        return null;
    }


    /* =====================================================
       TÍTULO DO DIA
    ===================================================== */

    function tituloDia(
        deslocamento,
        data
    ) {

        if (deslocamento === 0) {
            return "Hoje";
        }

        if (deslocamento === 1) {
            return "Amanhã";
        }

        const dataFormatada =
            new Date(
                `${data}T12:00:00`
            ).toLocaleDateString(
                "pt-BR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit"
                }
            );

        return (
            dataFormatada
                .charAt(0)
                .toUpperCase() +
            dataFormatada.slice(1)
        );
    }


    /* =====================================================
       FORMATAR HORA
    ===================================================== */

    function formatarHora(
        hora
    ) {

        if (!hora) {
            return null;
        }

        return String(
            hora
        ).slice(
            0,
            5
        );
    }


    /* =====================================================
       FORMATAR RECORRÊNCIA
    ===================================================== */

    function formatarRecorrencia(
        tarefa
    ) {

        if (
            tarefa.sequencia ===
            "diario"
        ) {
            return "Todos os dias";
        }

        if (
            tarefa.sequencia ===
            "semanal"
        ) {
            return "Semanal";
        }

        if (
            tarefa.sequencia ===
            "mensal"
        ) {
            return "Mensal";
        }

        if (
            tarefa.sequencia?.startsWith(
                "a_cada_"
            )
        ) {

            const quantidade =
                tarefa.sequencia
                    .replace(
                        "a_cada_",
                        ""
                    )
                    .replace(
                        "_dias",
                        ""
                    );

            return (
                `A cada ${quantidade} dias`
            );
        }

        return "Recorrente";
    }


    /* =====================================================
       TRATAR RESPOSTA
    ===================================================== */

    async function tratarResposta(
        response
    ) {

        let resultado = {};

        try {

            resultado =
                await response.json();

        } catch {

            resultado = {};

        }

        if (!response.ok) {

            throw new Error(
                resultado.detail ||
                "Não foi possível concluir a tarefa."
            );
        }

        return resultado;
    }


    /* =====================================================
       REMOVER PONTUAL DOS DADOS LOCAIS
    ===================================================== */

    function removerPontualLocal(
        tarefaId
    ) {

        setDadosLocais(
            (dadosAtuais) => {

                if (!dadosAtuais) {
                    return dadosAtuais;
                }

                const novosDias =
                    (dadosAtuais.dias || [])
                        .map(
                            (dia) => {

                                const tarefas =
                                    (
                                        dia.tarefas ||
                                        []
                                    ).filter(
                                        (item) => {

                                            const mesmaTarefa =
                                                item.tipo ===
                                                "pontual" &&
                                                Number(
                                                    item.id
                                                ) ===
                                                Number(
                                                    tarefaId
                                                );

                                            return (
                                                !mesmaTarefa
                                            );
                                        }
                                    );

                                return {
                                    ...dia,
                                    tarefas
                                };
                            }
                        );


                /* =========================================
                   RECALCULAR TOTAL DE HOJE
                ========================================= */

                const diaHoje =
                    novosDias.find(
                        (dia) =>
                            Number(
                                dia.deslocamento
                            ) === 0
                    );

                const totalHoje =
                    diaHoje?.tarefas
                        ?.length || 0;


                /* =========================================
                   RECALCULAR PRÓXIMOS 3 DIAS
                ========================================= */

                const totalProximos3Dias =
                    novosDias
                        .filter(
                            (dia) => {

                                const deslocamento =
                                    Number(
                                        dia.deslocamento
                                    );

                                return (
                                    deslocamento >= 1 &&
                                    deslocamento <= 3
                                );
                            }
                        )
                        .reduce(
                            (
                                total,
                                dia
                            ) =>
                                total +
                                (
                                    dia.tarefas
                                        ?.length ||
                                    0
                                ),
                            0
                        );


                return {
                    ...dadosAtuais,

                    dias:
                        novosDias,

                    total_hoje:
                        totalHoje,

                    total_proximos_3_dias:
                        totalProximos3Dias,

                    tem_tarefas_hoje:
                        totalHoje > 0
                };
            }
        );
    }


    /* =====================================================
       MARCAR PONTUAL COMO FEITA
    ===================================================== */

    async function cumprirPontual(
        tarefaId
    ) {

        if (
            tarefaCumprindo !== null
        ) {
            return;
        }

        const token =
            localStorage.getItem(
                "token"
            ) || "";

        if (!token) {

            alert(
                "Sessão não encontrada."
            );

            return;
        }


        setTarefaCumprindo(
            tarefaId
        );


        try {

            const response =
                await fetch(
                    `${API_URL}/tarefas/repentinas/${tarefaId}/cumprir`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            await tratarResposta(
                response
            );


            /* =============================================
               RETIRAR DO MODAL IMEDIATAMENTE
            ============================================= */

            removerPontualLocal(
                tarefaId
            );


            /* =============================================
               ATUALIZAR O HEADER
            ============================================= */

            if (
                typeof atualizar ===
                "function"
            ) {

                await atualizar();

            }

        } catch (erro) {

            alert(
                erro.message
            );

        } finally {

            setTarefaCumprindo(
                null
            );

        }
    }


    /* =====================================================
       MODAL
    ===================================================== */

    return createPortal(

        <div
            className="lembretes-tarefas-modal-overlay"

            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    fechar();
                }
            }}
        >

            <section
                className="lembretes-tarefas-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="lembretes-tarefas-modal-titulo"
            >

                {/* =========================================
                    CABEÇALHO
                ========================================= */}

                <header className="lembretes-tarefas-modal-header">

                    <div>

                        <span className="lembretes-tarefas-modal-sobretitulo">
                            Agenda de tarefas
                        </span>

                        <h2 id="lembretes-tarefas-modal-titulo">
                            Próximas tarefas
                        </h2>

                        <p>
                            Hoje e próximos 3 dias
                        </p>

                    </div>


                    <button
                        type="button"
                        className="lembretes-tarefas-modal-fechar"
                        onClick={fechar}
                        aria-label="Fechar"
                    >
                        ×
                    </button>

                </header>


                {/* =========================================
                    RESUMO
                ========================================= */}

                <div className="lembretes-tarefas-modal-resumo">

                    <div>

                        <strong>
                            {
                                dadosLocais
                                    .total_hoje ||
                                0
                            }
                        </strong>

                        <span>
                            Para hoje
                        </span>

                    </div>


                    <div>

                        <strong>
                            {
                                dadosLocais
                                    .total_proximos_3_dias ||
                                0
                            }
                        </strong>

                        <span>
                            Próximos 3 dias
                        </span>

                    </div>

                </div>


                {/* =========================================
                    LISTA
                ========================================= */}

                <div className="lembretes-tarefas-modal-lista">

                    {dadosLocais.dias?.map(
                        (dia) => (

                            <section
                                className="lembretes-tarefas-dia"
                                key={dia.data}
                            >

                                {/* =========================
                                    CABEÇALHO DO DIA
                                ========================= */}

                                <div className="lembretes-tarefas-dia-header">

                                    <div>

                                        <strong>
                                            {tituloDia(
                                                dia.deslocamento,
                                                dia.data
                                            )}
                                        </strong>

                                        <span>
                                            {new Date(
                                                `${dia.data}T12:00:00`
                                            ).toLocaleDateString(
                                                "pt-BR"
                                            )}
                                        </span>

                                    </div>


                                    <span className="lembretes-tarefas-dia-total">
                                        {
                                            dia.tarefas
                                                .length
                                        }
                                    </span>

                                </div>


                                {/* =========================
                                    SEM TAREFAS
                                ========================= */}

                                {dia.tarefas.length === 0 ? (

                                    <div className="lembretes-tarefas-vazio">
                                        Nenhuma tarefa prevista.
                                    </div>

                                ) : (

                                    /* =====================
                                       TAREFAS
                                    ===================== */

                                    <div className="lembretes-tarefas-itens">

                                        {dia.tarefas.map(
                                            (
                                                tarefa,
                                                indice
                                            ) => {

                                                const cumprindo =
                                                    Number(
                                                        tarefaCumprindo
                                                    ) ===
                                                    Number(
                                                        tarefa.id
                                                    );

                                                return (

                                                    <article
                                                        className="lembretes-tarefas-item"

                                                        key={
                                                            `${tarefa.tipo}-${tarefa.id}-${dia.data}-${indice}`
                                                        }
                                                    >

                                                        {/* =================
                                                            TOPO
                                                        ================= */}

                                                        <div className="lembretes-tarefas-item-topo">

                                                            <span
                                                                className={
                                                                    tarefa.tipo ===
                                                                        "pontual"
                                                                        ? "lembretes-tarefas-tipo pontual"
                                                                        : "lembretes-tarefas-tipo recorrente"
                                                                }
                                                            >
                                                                {
                                                                    tarefa.tipo ===
                                                                        "pontual"
                                                                        ? "Pontual"
                                                                        : "Recorrente"
                                                                }
                                                            </span>


                                                            {tarefa.hora && (

                                                                <span className="lembretes-tarefas-hora">

                                                                    {formatarHora(
                                                                        tarefa.hora
                                                                    )}

                                                                </span>

                                                            )}

                                                        </div>


                                                        {/* =================
                                                            CORPO
                                                        ================= */}

                                                        <div className="lembretes-tarefas-item-corpo">

                                                            <div className="lembretes-tarefas-item-informacoes">

                                                                <strong className="lembretes-tarefas-item-titulo">
                                                                    {
                                                                        tarefa.tarefa
                                                                    }
                                                                </strong>


                                                                {tarefa.tipo ===
                                                                    "recorrente" && (

                                                                        <span className="lembretes-tarefas-recorrencia">

                                                                            {formatarRecorrencia(
                                                                                tarefa
                                                                            )}

                                                                        </span>

                                                                    )}

                                                            </div>


                                                            {/* =================
                                                                FEITA
                                                                SOMENTE PONTUAL
                                                            ================= */}

                                                            {tarefa.tipo ===
                                                                "pontual" && (

                                                                    <button
                                                                        type="button"

                                                                        className="lembretes-tarefas-marcar-feito"

                                                                        disabled={
                                                                            tarefaCumprindo !==
                                                                            null
                                                                        }

                                                                        onClick={() =>
                                                                            cumprirPontual(
                                                                                tarefa.id
                                                                            )
                                                                        }
                                                                    >

                                                                        {cumprindo ? (

                                                                            <>
                                                                                <span className="lembretes-tarefas-feito-loading"></span>

                                                                                Salvando...
                                                                            </>

                                                                        ) : (

                                                                            <>
                                                                                <span className="lembretes-tarefas-feito-check">
                                                                                    ✓
                                                                                </span>

                                                                                Feita
                                                                            </>

                                                                        )}

                                                                    </button>

                                                                )}

                                                        </div>

                                                    </article>

                                                );
                                            }
                                        )}

                                    </div>

                                )}

                            </section>

                        )
                    )}

                </div>

            </section>

        </div>,

        document.body
    );
}