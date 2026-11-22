
import React, { useEffect, useState } from "react";
import "./blocomodulos.css";
import { URL } from "../../../url";

export default function BlocoModulos({ comercioId, podeEditar }) {

    const [modulos, setModulos] = useState([]);
    const [solicitando, setSolicitando] = useState(null);

    const token = localStorage.getItem("token");

    // ===============================
    // CARREGAR MÓDULOS
    // ===============================
    async function carregarSeguro() {

        try {

            const res = await fetch(
                `${URL}/modulos/empresa/${comercioId}`,
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Erro ao carregar módulos");
            }

            const json = await res.json();

            setModulos(Array.isArray(json) ? json : []);

            return true;

        } catch (e) {

            console.error("Erro ao carregar módulos:", e);

            setModulos([]);

            return false;
        }
    }

    // ===============================
    // CARREGAR AO ABRIR OU TROCAR COMÉRCIO
    // ===============================
    useEffect(() => {

        if (!comercioId) {
            setModulos([]);
            return;
        }

        let ativo = true;

        async function carregar() {

            try {

                setModulos([]);

                const res = await fetch(
                    `${URL}/modulos/empresa/${comercioId}`,
                    {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    }
                );

                if (!res.ok) {
                    throw new Error("Erro ao carregar módulos");
                }

                const json = await res.json();

                if (ativo) {
                    setModulos(
                        Array.isArray(json) ? json : []
                    );
                }

            } catch (e) {

                console.error(e);

                if (ativo) {
                    setModulos([]);
                }
            }
        }

        carregar();

        return () => {
            ativo = false;
        };

    }, [comercioId, token]);


    // ===============================
    // AGRUPAR POR TIPO DE COMÉRCIO
    // ===============================
    const tiposAgrupados = modulos.reduce(
        (grupos, modulo) => {

            const tipo = modulo.tipo_comercio || "Outros";

            if (!grupos[tipo]) {
                grupos[tipo] = [];
            }

            grupos[tipo].push(modulo);

            return grupos;

        },
        {}
    );


    // ===============================
    // SOLICITAR TODOS OS MÓDULOS DO TIPO
    // ===============================
    async function solicitarTipo(tipo) {

        if (solicitando !== null) return;

        const listaTipo = tiposAgrupados[tipo] || [];

        // Somente módulos ainda não solicitados
        const pendentes = listaTipo.filter(
            m => m.ativo === null
        );

        if (pendentes.length === 0) return;

        setSolicitando(tipo);

        try {

            const resultados = await Promise.allSettled(

                pendentes.map(async (m) => {

                    const res = await fetch(
                        `${URL}/modulos/solicitar`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token
                            },

                            body: JSON.stringify({
                                comercio_id: comercioId,
                                modulo: m.modulo
                            })
                        }
                    );

                    if (!res.ok) {
                        const erro = await res.json().catch(() => ({}));

                        throw new Error(
                            erro.detail || `Erro ao solicitar ${m.modulo}`
                        );
                    }

                    return m.modulo;

                })

            );

            // Verificar se alguma solicitação falhou
            const falhas = resultados.filter(
                resultado => resultado.status === "rejected"
            );

            // Atualizar a lista
            await carregarSeguro();

            if (falhas.length > 0) {

                console.error(
                    "Algumas solicitações falharam:",
                    falhas
                );

                alert(
                    `${falhas.length} módulo(s) não puderam ser solicitados. A lista foi atualizada.`
                );

            }

        } catch (e) {

            console.error("Erro ao solicitar módulos:", e);

            await carregarSeguro();

            alert("Não foi possível solicitar os módulos.");

        } finally {

            setSolicitando(null);

        }
    }


    // ===============================
    // RENDERIZAÇÃO
    // ===============================
    return (
        <div className="bm-container">

            <h2 className="bm-titulo">
                Módulos
            </h2>

            <div className="bm-lista">

                {Object.entries(tiposAgrupados).map(
                    ([tipo, lista]) => {

                        const pendentes = lista.filter(
                            m => m.ativo === null
                        );

                        const todosAtivos = lista.every(
                            m => m.ativo === 1
                        );

                        const todosResolvidos = lista.every(
                            m => m.ativo === 0 || m.ativo === 1
                        );

                        return (

                            <div
                                key={tipo}
                                className="bm-grupo-tipo"
                            >

                                {/* CABEÇALHO DO TIPO */}
                                <div className="bm-grupo-cabecalho">

                                    <div className="bm-grupo-informacoes">

                                        <div className="bm-grupo-textos">
                                            <span className="bm-grupo-titulo">
                                                {tipo}
                                            </span>

                                            <p className="bm-grupo-descricao">
                                                {lista[0]?.tipo_comercio_descricao ||
                                                    "Descrição não cadastrada para este tipo de comércio."}
                                            </p>
                                        </div>

                                        <span className="bm-grupo-contagem">
                                            {lista.length} módulos
                                        </span>

                                    </div>

                                    <div className="bm-grupo-acao">

                                        {todosAtivos && (
                                            <span className="bm-status bm-ativo">
                                                Todos ativos
                                            </span>
                                        )}

                                        {!todosResolvidos && podeEditar && (
                                            <button
                                                className="bm-btn bm-btn-solicitar"
                                                onClick={() => solicitarTipo(tipo)}
                                                disabled={solicitando !== null}
                                            >
                                                {solicitando === tipo
                                                    ? "Solicitando..."
                                                    : pendentes.length === lista.length
                                                        ? "Solicitar ativação"
                                                        : "Solicitar restantes"
                                                }
                                            </button>
                                        )}

                                        {!todosResolvidos && !podeEditar && (
                                            <span className="bm-status bm-inativo">
                                                Não solicitado
                                            </span>
                                        )}

                                        {todosResolvidos && !todosAtivos && (
                                            <span className="bm-status bm-solicitado">
                                                Solicitação realizada
                                            </span>
                                        )}

                                    </div>

                                </div>


                                {/* LISTA DE MÓDULOS DO TIPO */}
                                <div className="bm-modulos-tipo">

                                    {lista.map(m => (

                                        <div
                                            key={m.id || m.modulo}
                                            className="bm-item"
                                        >

                                            <div className="bm-clas">

                                                <span className="bm-nome">
                                                    {m.modulo}
                                                </span>

                                                <span className="bm-descricao">
                                                    {m.descricao}
                                                </span>

                                            </div>

                                            <div className="bm-acao">

                                                {m.ativo === 1 && (
                                                    <span className="bm-status bm-ativo">
                                                        Ativo
                                                    </span>
                                                )}

                                                {m.ativo === 0 && (
                                                    <span className="bm-status bm-solicitado">
                                                        Solicitado
                                                    </span>
                                                )}

                                                {m.ativo === null && (
                                                    <span className="bm-status bm-inativo">
                                                        Não solicitado
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        );
                    }
                )}

                {modulos.length === 0 && (
                    <div className="bm-vazio">
                        Nenhum módulo encontrado
                    </div>
                )}

            </div>

        </div>
    );
}
