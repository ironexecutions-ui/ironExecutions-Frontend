
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../config";
import "./alerta.css";

const INTERVALO_LEMBRETE = 5 * 60 * 60 * 1000;
const CHAVE_CACHE = "ironstore_alerta_pedidos_adiado_v1";

function obterUsuarioLocal() {
    try {
        return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
        return null;
    }
}

function obterChaveCache() {
    const usuario = obterUsuarioLocal();

    const usuarioId = usuario?.id;
    const comercioId = usuario?.comercio_id;

    if (!usuarioId || !comercioId) {
        return null;
    }

    return `${CHAVE_CACHE}_${comercioId}_${usuarioId}`;
}

function lerHorarioAdiado() {
    const chave = obterChaveCache();

    if (!chave) {
        return null;
    }

    try {
        const valor = localStorage.getItem(chave);

        if (!valor) {
            return null;
        }

        const horario = Number(valor);

        return Number.isFinite(horario) && horario > 0
            ? horario
            : null;
    } catch {
        return null;
    }
}

function salvarHorarioAdiado() {
    const chave = obterChaveCache();

    if (!chave) {
        return false;
    }

    try {
        localStorage.setItem(chave, String(Date.now()));
        return true;
    } catch (erro) {
        console.error(
            "[ALERTA PEDIDOS] Não foi possível salvar o adiamento:",
            erro
        );

        return false;
    }
}

function pedidoEstaCancelado(pedido) {
    const status = String(pedido?.status || "")
        .trim()
        .toLowerCase();

    return (
        pedido?.cancelado === true ||
        pedido?.cancelado === 1 ||
        pedido?.cancelado === "1" ||
        ["cancelado", "cancelada", "cancelled", "canceled"].includes(status)
    );
}

function verificarPendencias(pedidos) {
    const lista = Array.isArray(pedidos) ? pedidos : [];

    const ativos = lista.filter(
        pedido => !pedidoEstaCancelado(pedido)
    );

    const porEmbalar = ativos.filter(pedido => (
        !pedido.embalado &&
        !pedido.enviado &&
        !pedido.entregue
    )).length;

    const porEnviar = ativos.filter(pedido => (
        Boolean(pedido.embalado) &&
        !pedido.enviado &&
        !pedido.entregue
    )).length;

    return {
        porEmbalar,
        porEnviar,
        total: porEmbalar + porEnviar
    };
}

export default function AlertaPedidos() {
    const [aberto, setAberto] = useState(false);
    const [pendencias, setPendencias] = useState({
        porEmbalar: 0,
        porEnviar: 0,
        total: 0
    });

    const [carregando, setCarregando] = useState(false);

    const audioRef = useRef(null);
    const audioLiberadoRef = useRef(false);
    const verificacaoEmAndamento = useRef(false);
    const componenteAtivo = useRef(true);

    const verificarPedidos = useCallback(async () => {
        if (verificacaoEmAndamento.current) {
            return;
        }

        const token = localStorage.getItem("token");
        const chaveCache = obterChaveCache();

        if (!token || !chaveCache) {
            setAberto(false);
            return;
        }

        const horarioAdiado = lerHorarioAdiado();

        if (
            horarioAdiado &&
            Date.now() - horarioAdiado < INTERVALO_LEMBRETE
        ) {
            setAberto(false);
            return;
        }

        verificacaoEmAndamento.current = true;
        setCarregando(true);

        try {
            const resposta = await fetch(
                `${API_URL}/ironstore/configuracao/pedidos`,
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache"
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    `Não foi possível consultar os pedidos (${resposta.status}).`
                );
            }

            const dados = await resposta.json();

            if (!componenteAtivo.current) {
                return;
            }

            const resultado = verificarPendencias(dados?.pedidos);

            setPendencias(resultado);

            if (resultado.total > 0) {
                setAberto(true);
            } else {
                setAberto(false);
            }
        } catch (erro) {
            console.error(
                "[ALERTA PEDIDOS] Erro ao verificar pendências:",
                erro
            );

            if (componenteAtivo.current) {
                setAberto(false);
            }
        } finally {
            verificacaoEmAndamento.current = false;

            if (componenteAtivo.current) {
                setCarregando(false);
            }
        }
    }, []);

    useEffect(() => {
        componenteAtivo.current = true;

        verificarPedidos();

        return () => {
            componenteAtivo.current = false;
        };
    }, [verificarPedidos]);

    useEffect(() => {
        if (!aberto || carregando || !audioRef.current) return;

        const audio = audioRef.current;

        audio.currentTime = 0;

        audio.play().catch(erro => {
            console.warn(
                "[ALERTA PEDIDOS] O navegador bloqueou a reprodução automática:",
                erro
            );
        });
    }, [aberto, carregando]);



    function lembrarMaisTarde() {
        salvarHorarioAdiado();

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        setAberto(false);
    }


    return (
        <>
            <audio
                ref={audioRef}
                src={new URL("./audio.m4a", import.meta.url).href}
                preload="auto"
            />

            {aberto && !carregando && createPortal(
                <div
                    className="ironstore-alerta-pedidos-overlay"
                    role="presentation"
                >
                    <section
                        className="ironstore-alerta-pedidos-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="ironstore-alerta-pedidos-titulo"
                        aria-describedby="ironstore-alerta-pedidos-descricao"
                    >
                        <div className="ironstore-alerta-pedidos-icone">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <span className="ironstore-alerta-pedidos-etiqueta">
                            LEMBRETE DA LOJA
                        </span>

                        <h2
                            id="ironstore-alerta-pedidos-titulo"
                            className="ironstore-alerta-pedidos-titulo"
                        >
                            Vamos cuidar dos seus pedidos?
                        </h2>

                        <p
                            id="ironstore-alerta-pedidos-descricao"
                            className="ironstore-alerta-pedidos-descricao"
                        >
                            Você tem pedidos aguardando preparação ou envio.
                            Reserve um momento para dar continuidade às entregas
                            e manter seus clientes informados.
                        </p>

                        <div className="ironstore-alerta-pedidos-resumo">
                            {pendencias.porEmbalar > 0 && (
                                <div className="ironstore-alerta-pedidos-item">
                                    <span className="ironstore-alerta-pedidos-ponto ironstore-alerta-pedidos-ponto-embalar" />

                                    <span>Por embalar</span>

                                    <strong>
                                        {pendencias.porEmbalar}
                                    </strong>
                                </div>
                            )}

                            {pendencias.porEnviar > 0 && (
                                <div className="ironstore-alerta-pedidos-item">
                                    <span className="ironstore-alerta-pedidos-ponto ironstore-alerta-pedidos-ponto-enviar" />

                                    <span>Por enviar</span>

                                    <strong>
                                        {pendencias.porEnviar}
                                    </strong>
                                </div>
                            )}

                            <div className="ironstore-alerta-pedidos-total">
                                <span>Total de pedidos pendentes</span>

                                <strong>{pendencias.total}</strong>
                            </div>
                        </div>

                        <p className="ironstore-alerta-pedidos-rodape">
                            Não se preocupe, você pode continuar depois.
                            Estamos aqui para ajudar na sua organização.
                        </p>

                        <button
                            type="button"
                            className="ironstore-alerta-pedidos-botao"
                            onClick={lembrarMaisTarde}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />
                                <path
                                    d="M12 7v5l3 2"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            Lembrar mais tarde
                        </button>


                    </section>
                </div>,
                document.body
            )}
        </>
    );
}
