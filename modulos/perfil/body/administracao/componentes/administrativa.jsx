
import React, { useCallback, useEffect, useState } from "react";
import "./administrativa.css";
import { API_URL } from "../../../../../config";

import Pagamentos from "./administrcao/pagamentos";
import Orcamentos from "./administrcao/orcamentos";

const NIVEIS_FASE = [
    { nome: "Madeira", cor: "#A87950" },
    { nome: "Bronze", cor: "#CD7F32" },
    { nome: "Prata", cor: "#AEB8C2" },
    { nome: "Ouro", cor: "#E5B83D" },
    { nome: "Platina", cor: "#70C9C5" },
    { nome: "Diamante", cor: "#55A8E8" },
];

export default function Administrativa() {

    const [abaAtiva, setAbaAtiva] = useState("pagamentos");

    const [fases, setFases] = useState([]);
    const [nomeFase, setNomeFase] = useState("");
    const [nivelSelecionado, setNivelSelecionado] = useState("Madeira");

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const token = localStorage.getItem("token");
    const [niveisUsados, setNiveisUsados] = useState([]);
    // =====================================================
    // CARREGAR FASES
    // =====================================================

    const carregarFases = useCallback(async () => {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await fetch(
                `${API_URL}/administrativa/fases`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Não foi possível carregar as fases."
                );
            }

            setFases(dados.fases || []);

            const ocupados = dados.niveis_usados || [];

            setNiveisUsados(ocupados);

            // Selecionar automaticamente o primeiro nível disponível

            setNivelSelecionado((atual) => {
                if (!ocupados.includes(atual)) {
                    return atual;
                }

                const primeiroDisponivel = NIVEIS_FASE.find(
                    (nivel) => !ocupados.includes(nivel.nome)
                );

                return primeiroDisponivel?.nome || "";
            });

        } catch (error) {
            setErro(
                typeof error.message === "string"
                    ? error.message
                    : "Erro ao carregar fases."
            );
        } finally {
            setCarregando(false);
        }
    }, [token]);
    useEffect(() => {
        carregarFases();
    }, [carregarFases]);

    // =====================================================
    // CADASTRAR FASE
    // =====================================================

    const cadastrarFase = async (e) => {

        e.preventDefault();

        if (!nomeFase.trim()) {
            setErro("Digite o nome da fase.");
            return;
        }

        try {
            setSalvando(true);
            setErro("");
            setSucesso("");

            const resposta = await fetch(
                `${API_URL}/administrativa/fases`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        fase: nomeFase.trim(),
                        nivel: nivelSelecionado,
                    }),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Erro ao cadastrar fase."
                );
            }

            setNomeFase("");
            setNivelSelecionado("Madeira");

            setSucesso("Fase cadastrada com sucesso!");

            await carregarFases();

            setSucesso("Fase excluída! O nível foi liberado.");
        } catch (error) {
            setErro(error.message);
        } finally {
            setSalvando(false);
        }
    };

    // =====================================================
    // EXCLUIR FASE
    // =====================================================

    const excluirFase = async (faseId) => {

        if (!window.confirm(
            "Tem certeza que deseja excluir esta fase? Os pagamentos e orçamentos vinculados também serão excluídos."
        )) {
            return;
        }

        try {
            setExcluindo(faseId);
            setErro("");
            setSucesso("");

            const resposta = await fetch(
                `${API_URL}/administrativa/fases/${faseId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Erro ao excluir fase."
                );
            }

            setFases((anteriores) =>
                anteriores.filter((fase) => fase.id !== faseId)
            );

            setSucesso("Fase excluída com sucesso!");

        } catch (error) {
            setErro(error.message);
        } finally {
            setExcluindo(null);
        }
    };

    // =====================================================
    // COR DO NÍVEL
    // =====================================================

    const obterCorNivel = (nivel) => {
        return NIVEIS_FASE.find(
            (item) => item.nome === nivel
        )?.cor || "#999999";
    };

    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================

    return (

        <main className="adm-fases-container">

            {/* CABEÇALHO */}

            <header className="adm-fases-header">

                <div>

                    <span className="adm-fases-subtitulo">
                        GESTÃO ADMINISTRATIVA
                    </span>

                    <h1>Administrativa</h1>

                    <p>
                        Organize suas fases, pagamentos e orçamentos.
                    </p>

                </div>

            </header>

            {/* NAVEGAÇÃO */}

            <nav className="adm-fases-navegacao">

                <button
                    type="button"
                    className={`adm-fases-nav-btn ${abaAtiva === "fases" ? "ativo" : ""
                        }`}
                    onClick={() => {
                        setAbaAtiva("fases");
                        setErro("");
                        setSucesso("");
                    }}
                >
                    <span>01</span>
                    Fases
                </button>

                <button
                    type="button"
                    className={`adm-fases-nav-btn ${abaAtiva === "pagamentos" ? "ativo" : ""
                        }`}
                    onClick={() => {
                        setAbaAtiva("pagamentos");
                        setErro("");
                        setSucesso("");
                    }}
                >
                    <span>02</span>
                    Pagamentos
                </button>

                <button
                    type="button"
                    className={`adm-fases-nav-btn ${abaAtiva === "orcamentos" ? "ativo" : ""
                        }`}
                    onClick={() => {
                        setAbaAtiva("orcamentos");
                        setErro("");
                        setSucesso("");
                    }}
                >
                    <span>03</span>
                    Orçamentos
                </button>

            </nav>

            {/* ================================================= */}
            {/* ABA FASES */}
            {/* ================================================= */}

            {abaAtiva === "fases" && (

                <>

                    {erro && (
                        <div className="adm-fases-alerta erro">
                            {erro}
                        </div>
                    )}

                    {sucesso && (
                        <div className="adm-fases-alerta sucesso">
                            {sucesso}
                        </div>
                    )}

                    <section className="adm-fases-painel">

                        {/* CABEÇALHO DO PAINEL */}

                        <div className="adm-fases-painel-header">

                            <div>

                                <span className="adm-fases-subtitulo">
                                    CONFIGURAÇÃO
                                </span>

                                <h2>Cadastro de fases</h2>

                                <p>
                                    Defina as etapas e seus respectivos níveis.
                                </p>

                            </div>

                            <div className="adm-fases-contador">

                                <strong>{fases.length}</strong>

                                <span>Fases cadastradas</span>

                            </div>

                        </div>

                        {/* FORMULÁRIO */}

                        <form
                            className="adm-fases-formulario"
                            onSubmit={cadastrarFase}
                        >

                            <div className="adm-fases-campo">

                                <label htmlFor="adm-fase-nome">
                                    Nome da fase
                                </label>

                                <input
                                    id="adm-fase-nome"
                                    type="text"
                                    placeholder="Ex: Planejamento inicial"
                                    value={nomeFase}
                                    onChange={(e) =>
                                        setNomeFase(e.target.value)
                                    }
                                    maxLength={255}
                                />

                            </div>

                            {/* SELEÇÃO DE NÍVEL */}

                            <div className="adm-fases-campo">

                                <label>
                                    Nível da fase
                                </label>

                                <div className="adm-fases-niveis">

                                    {NIVEIS_FASE.map((nivel) => {

                                        const nivelOcupado = niveisUsados.includes(nivel.nome);

                                        return (
                                            <button
                                                key={nivel.nome}
                                                type="button"
                                                disabled={nivelOcupado}
                                                className={`adm-fases-nivel-btn ${nivelSelecionado === nivel.nome
                                                    ? "selecionado"
                                                    : ""
                                                    } ${nivelOcupado ? "ocupado" : ""}`}
                                                onClick={() => setNivelSelecionado(nivel.nome)}
                                                title={
                                                    nivelOcupado
                                                        ? "Este nível já foi utilizado"
                                                        : `Selecionar ${nivel.nome}`
                                                }
                                            >

                                                <span
                                                    className="adm-fases-nivel-cor"
                                                    style={{
                                                        backgroundColor: nivel.cor,
                                                    }}
                                                />

                                                <span>{nivel.nome}</span>

                                                {nivelOcupado && (
                                                    <small>Em uso</small>
                                                )}

                                            </button>
                                        );
                                    })}

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="adm-fases-btn-adicionar"
                                disabled={
                                    salvando ||
                                    !nivelSelecionado ||
                                    niveisUsados.length === NIVEIS_FASE.length
                                }
                            >
                                {salvando
                                    ? "Salvando..."
                                    : niveisUsados.length === NIVEIS_FASE.length
                                        ? "Todos os níveis utilizados"
                                        : "+ Adicionar fase"
                                }
                            </button>

                        </form>

                        {/* LISTAGEM */}

                        <div className="adm-fases-lista-header">

                            <h3>Suas fases</h3>

                            <span>
                                {fases.length} registros
                            </span>

                        </div>

                        {carregando ? (

                            <div className="adm-fases-vazio">
                                Carregando fases...
                            </div>

                        ) : fases.length === 0 ? (

                            <div className="adm-fases-vazio">

                                <div className="adm-fases-vazio-icone">
                                    +
                                </div>

                                <strong>
                                    Nenhuma fase cadastrada
                                </strong>

                                <p>
                                    Comece adicionando sua primeira fase acima.
                                </p>

                            </div>

                        ) : (

                            <div className="adm-fases-lista">

                                {fases.map((fase, index) => (

                                    <article
                                        className="adm-fases-item"
                                        key={fase.id}
                                    >

                                        <div className="adm-fases-item-numero">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                        <div className="adm-fases-item-info">

                                            <strong>
                                                {fase.fase}
                                            </strong>

                                            <span
                                                className="adm-fases-badge-nivel"
                                                style={{
                                                    "--cor-nivel": obterCorNivel(
                                                        fase.nivel
                                                    ),
                                                }}
                                            >

                                                <i />

                                                {fase.nivel}

                                            </span>

                                        </div>

                                        <button
                                            type="button"
                                            className="adm-fases-btn-excluir"
                                            onClick={() =>
                                                excluirFase(fase.id)
                                            }
                                            disabled={excluindo === fase.id}
                                            title="Excluir fase"
                                        >
                                            {excluindo === fase.id
                                                ? "..."
                                                : "Excluir"
                                            }
                                        </button>

                                    </article>

                                ))}

                            </div>

                        )}

                    </section>

                </>

            )}

            {/* ================================================= */}
            {/* ABA PAGAMENTOS */}
            {/* ================================================= */}

            {abaAtiva === "pagamentos" && (
                <Pagamentos />
            )}

            {/* ================================================= */}
            {/* ABA ORÇAMENTOS */}
            {/* ================================================= */}

            {abaAtiva === "orcamentos" && (
                <Orcamentos />
            )}

        </main>

    );
}
