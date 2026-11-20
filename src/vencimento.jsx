
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../config";
import "./vencimento.css";

const TEMPO_INATIVIDADE = 15 * 1000;
const TEMPO_EXIBICAO = 8 * 1000;
const TEMPO_SAIDA = 480;
const INTERVALO_ATUALIZACAO = 10 * 60 * 1000;

export default function AlertaVencimentoDiamante() {
    const location = useLocation();

    // =========================================================
    // ESTADOS
    // =========================================================

    const [alertas, setAlertas] = useState([]);
    const [comercio, setComercio] = useState(null);
    const [visivel, setVisivel] = useState(false);
    const [alertaAtual, setAlertaAtual] = useState(null);
    const [saindo, setSaindo] = useState(false);

    // =========================================================
    // REFERÊNCIAS
    // =========================================================

    const timerInatividadeRef = useRef(null);
    const timerExibicaoRef = useRef(null);
    const timerSaidaRef = useRef(null);

    const montadoRef = useRef(false);
    const visivelRef = useRef(false);
    const alertasRef = useRef([]);

    const ultimoAlertaRef = useRef(null);

    const estaNaRota = location.pathname === "/ironbusiness/perfil";

    // =========================================================
    // LIMPAR TEMPORIZADORES
    // =========================================================

    const limparTimer = (ref) => {
        if (ref.current) {
            clearTimeout(ref.current);
            ref.current = null;
        }
    };

    const limparTodosTimers = () => {
        limparTimer(timerInatividadeRef);
        limparTimer(timerExibicaoRef);
        limparTimer(timerSaidaRef);
    };

    // =========================================================
    // CARREGAR ALERTAS
    // =========================================================

    const carregarAlertas = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alertasRef.current = [];

            setAlertas([]);
            setComercio(null);
            setAlertaAtual(null);
            setVisivel(false);
            setSaindo(false);

            visivelRef.current = false;

            limparTodosTimers();

            return;
        }

        try {
            const resposta = await fetch(
                `${API_URL}/orcamentos/alertas-vencimento`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    `Erro ao consultar vencimentos: ${resposta.status}`
                );
            }

            const dados = await resposta.json();

            const lista = Array.isArray(dados?.alertas)
                ? dados.alertas
                : [];

            alertasRef.current = lista;

            setAlertas(lista);
            setComercio(dados?.comercio || null);

            if (lista.length === 0) {
                visivelRef.current = false;

                setVisivel(false);
                setSaindo(false);
                setAlertaAtual(null);

                ultimoAlertaRef.current = null;

                limparTimer(timerExibicaoRef);
                limparTimer(timerSaidaRef);
            }

        } catch (erro) {
            console.error(
                "[ALERTAS FINANCEIROS] Erro:",
                erro
            );
        }
    }, []);

    // =========================================================
    // SELECIONAR ALERTA ALEATÓRIO
    // =========================================================

    const selecionarAlertaAleatorio = useCallback(() => {
        const lista = alertasRef.current;

        if (!lista.length) return null;

        let candidatos = lista;

        if (
            lista.length > 1 &&
            ultimoAlertaRef.current !== null
        ) {
            candidatos = lista.filter(
                item => item.id !== ultimoAlertaRef.current
            );
        }

        const indice = Math.floor(
            Math.random() * candidatos.length
        );

        const selecionado = candidatos[indice];

        ultimoAlertaRef.current = selecionado.id;

        return selecionado;
    }, []);

    // =========================================================
    // INICIAR CONTAGEM DE INATIVIDADE
    // =========================================================

    const iniciarContagemInatividade = useCallback(
        (atraso = TEMPO_INATIVIDADE) => {

            limparTimer(timerInatividadeRef);

            if (!montadoRef.current || !estaNaRota) return;

            timerInatividadeRef.current = setTimeout(() => {

                if (!montadoRef.current || !estaNaRota) return;

                if (alertasRef.current.length > 0) {

                    const selecionado = selecionarAlertaAleatorio();

                    if (!selecionado) {
                        iniciarContagemInatividade();
                        return;
                    }

                    limparTimer(timerExibicaoRef);
                    limparTimer(timerSaidaRef);

                    setAlertaAtual(selecionado);
                    setSaindo(false);

                    visivelRef.current = true;
                    setVisivel(true);

                    // Após 8 segundos, inicia a saída.

                    timerExibicaoRef.current = setTimeout(() => {

                        if (!montadoRef.current) return;

                        setSaindo(true);

                        // Aguarda a animação de saída terminar.

                        timerSaidaRef.current = setTimeout(() => {

                            if (!montadoRef.current) return;

                            visivelRef.current = false;

                            setVisivel(false);
                            setSaindo(false);

                            setAlertaAtual(null);

                            // Aguarda mais 15 segundos
                            // antes da próxima notificação.

                            iniciarContagemInatividade(
                                TEMPO_INATIVIDADE
                            );

                        }, TEMPO_SAIDA);

                    }, TEMPO_EXIBICAO);

                } else {

                    iniciarContagemInatividade(
                        TEMPO_INATIVIDADE
                    );

                }

            }, Math.max(0, atraso));

        },
        [estaNaRota, selecionarAlertaAleatorio]
    );

    // =========================================================
    // EFEITO PRINCIPAL
    // =========================================================

    useEffect(() => {

        if (!estaNaRota) {

            montadoRef.current = false;
            visivelRef.current = false;

            setVisivel(false);
            setSaindo(false);
            setAlertaAtual(null);

            setAlertas([]);
            setComercio(null);

            alertasRef.current = [];

            ultimoAlertaRef.current = null;

            limparTodosTimers();

            return;
        }

        montadoRef.current = true;

        // -----------------------------------------------------
        // REGISTRAR ATIVIDADE DO USUÁRIO
        // -----------------------------------------------------

        const registrarAtividade = () => {

            if (!visivelRef.current && !saindo) {
                iniciarContagemInatividade(
                    TEMPO_INATIVIDADE
                );
            }

        };

        const eventos = [
            "mousemove",
            "mousedown",
            "keydown",
            "touchstart",
            "scroll",
            "click"
        ];

        eventos.forEach(evento => {
            window.addEventListener(
                evento,
                registrarAtividade,
                { passive: true }
            );
        });

        // -----------------------------------------------------
        // PRIMEIRA CONSULTA
        // -----------------------------------------------------

        carregarAlertas();

        iniciarContagemInatividade(
            TEMPO_INATIVIDADE
        );

        // -----------------------------------------------------
        // ATUALIZAÇÃO AUTOMÁTICA
        // -----------------------------------------------------

        const intervalo = setInterval(() => {
            carregarAlertas();
        }, INTERVALO_ATUALIZACAO);

        // -----------------------------------------------------
        // LIMPEZA
        // -----------------------------------------------------

        return () => {

            montadoRef.current = false;

            eventos.forEach(evento => {
                window.removeEventListener(
                    evento,
                    registrarAtividade
                );
            });

            clearInterval(intervalo);

            limparTodosTimers();

        };

    }, [
        estaNaRota,
        carregarAlertas,
        iniciarContagemInatividade
    ]);

    // =========================================================
    // FORMATAÇÃO DE VALORES
    // =========================================================

    const formatarValor = (item) => {

        if (item.tipo_valor === "porcentagem") {

            return `${Number(
                item.porcentagem || 0
            ).toLocaleString("pt-BR")}%`;

        }

        return Number(
            item.valor || 0
        ).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    };

    // =========================================================
    // FORMATAÇÃO DE DATA
    // =========================================================

    const formatarData = (data) => {

        if (!data) return "";

        const dataLimpa = String(data).split("T")[0];

        const partes = dataLimpa.split("-");

        if (partes.length !== 3) return data;

        const [ano, mes, dia] = partes;

        return `${dia}/${mes}/${ano}`;

    };

    // =========================================================
    // IMAGEM DO COMÉRCIO
    // =========================================================

    const obterImagemComercio = () => {

        const imagem = comercio?.imagem;

        if (!imagem) return null;

        if (
            imagem.startsWith("http://") ||
            imagem.startsWith("https://") ||
            imagem.startsWith("data:")
        ) {
            return imagem;
        }

        const base = API_URL.replace(/\/+$/, "");

        const caminho = imagem.startsWith("/")
            ? imagem
            : `/${imagem}`;

        return `${base}${caminho}`;

    };

    // =========================================================
    // VALIDAR EXIBIÇÃO
    // =========================================================

    if (
        !estaNaRota ||
        !visivel ||
        !alertaAtual
    ) {
        return null;
    }

    // =========================================================
    // DADOS DO ALERTA ATUAL
    // =========================================================

    const imagemComercio = obterImagemComercio();

    const textoVencimento =
        alertaAtual.dias_restantes === 0
            ? "Vence hoje"
            : alertaAtual.dias_restantes === 1
                ? "Vence amanhã"
                : `Vence em ${alertaAtual.dias_restantes} dias`;

    // =========================================================
    // RENDERIZAÇÃO
    // =========================================================

    return (

        <aside
            className={`iron-diamante-lembrete ${saindo ? "iron-diamante-saindo" : ""}`}
            role="status"
            aria-live="polite"
            onMouseEnter={(e) => {
                e.currentTarget.classList.add("iron-diamante-hover-oculto");
            }}
        >

            {/* LOGO DO COMÉRCIO */}

            <div className="iron-diamante-lembrete-logo">

                {imagemComercio ? (

                    <img
                        src={imagemComercio}
                        alt={comercio?.loja || "Logo do comércio"}
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />

                ) : (

                    <span>
                        {(comercio?.loja || "C")
                            .charAt(0)
                            .toUpperCase()}
                    </span>

                )}

            </div>

            {/* CONTEÚDO */}

            <div className="iron-diamante-lembrete-conteudo">

                <span className="iron-diamante-lembrete-titulo">
                    Lembrete de pagamento
                </span>

                <strong className="iron-diamante-lembrete-pagamento">
                    {alertaAtual.pagamento || "Compromisso financeiro"}
                </strong>

                <div className="iron-diamante-lembrete-detalhes">

                    <span>
                        {textoVencimento}
                    </span>

                    <span className="iron-diamante-lembrete-separador">
                        •
                    </span>

                    <span>
                        {formatarData(alertaAtual.data_vencimento)}
                    </span>

                </div>

            </div>

            {/* VALOR */}

            <div className="iron-diamante-lembrete-valor">
                {formatarValor(alertaAtual)}
            </div>

        </aside>

    );

}
