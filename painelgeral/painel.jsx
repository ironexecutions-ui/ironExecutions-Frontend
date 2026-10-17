import React, { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "../config";
import PainelG from "./componentes/painelg";
import "./painel.css";

export default function PainelGeral() {
    const [painelGeralCarregando, setPainelGeralCarregando] = useState(true);
    const [painelGeralAutorizado, setPainelGeralAutorizado] = useState(false);
    const [painelGeralWsStatus, setPainelGeralWsStatus] = useState("desconectado");
    const [painelGeralNotificacaoAtiva, setPainelGeralNotificacaoAtiva] = useState(
        typeof Notification !== "undefined" && Notification.permission === "granted"
    );
    const [painelGeralUltimoFrete, setPainelGeralUltimoFrete] = useState(null);

    const painelGeralWsRef = useRef(null);
    const painelGeralReconectarRef = useRef(null);
    const painelGeralMontadoRef = useRef(false);
    const painelGeralTentativaRef = useRef(0);

    const mostrarNotificacaoPainelGeral = useCallback(async (titulo, mensagem, tag) => {
        if (!("Notification" in window)) {
            throw new Error("Este navegador não oferece suporte a notificações.");
        }

        if (Notification.permission !== "granted") {
            throw new Error("A permissão para notificações não está concedida.");
        }

        if (!("serviceWorker" in navigator)) {
            throw new Error("Este navegador não oferece suporte a Service Worker.");
        }

        const registro = await navigator.serviceWorker.ready;

        if (!registro || typeof registro.showNotification !== "function") {
            throw new Error("O Service Worker não oferece suporte a notificações.");
        }

        await registro.showNotification(titulo, {
            body: mensagem,
            icon: "/favicon.ico",
            tag,
            requireInteraction: true,
            data: { url: window.location.href }
        });
    }, []);

    const ativarNotificacoesPainelGeral = useCallback(async () => {
        if (!("Notification" in window)) {
            alert("Este navegador não oferece suporte a notificações.");
            return;
        }

        if (!window.isSecureContext) {
            alert("As notificações precisam de HTTPS ou localhost.");
            return;
        }

        try {
            let permissao = Notification.permission;

            if (permissao !== "granted") {
                permissao = await Notification.requestPermission();
            }

            setPainelGeralNotificacaoAtiva(permissao === "granted");

            if (permissao !== "granted") {
                alert(
                    "As notificações não foram autorizadas. " +
                    "Permita notificações para o site nas configurações do Chrome."
                );
                return;
            }

            await mostrarNotificacaoPainelGeral(
                "Iron Executions",
                "Teste de notificação do sistema. As notificações estão configuradas.",
                "iron-executions-teste"
            );

            console.info("[PAINEL GERAL] Notificação de teste solicitada ao Service Worker.");
        } catch (error) {
            console.error("[PAINEL GERAL] Erro ao exibir notificação de teste:", error);
            alert(
                "Não foi possível exibir a notificação. " +
                "Confira as permissões do Chrome e do Windows."
            );
        }
    }, [mostrarNotificacaoPainelGeral]);

    useEffect(() => {
        painelGeralMontadoRef.current = true;

        async function verificarAcessoPainel() {
            const token = localStorage.getItem("token");

            if (!token) {
                setPainelGeralAutorizado(false);
                setPainelGeralCarregando(false);
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/panel/me`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!resposta.ok) {
                    setPainelGeralAutorizado(false);
                    return;
                }

                const dados = await resposta.json();

                if (!painelGeralMontadoRef.current) return;

                setPainelGeralAutorizado(dados.autorizado === true);
            } catch (error) {
                console.error("[PAINEL GERAL] Erro ao verificar acesso:", error);

                if (painelGeralMontadoRef.current) {
                    setPainelGeralAutorizado(false);
                }
            } finally {
                if (painelGeralMontadoRef.current) {
                    setPainelGeralCarregando(false);
                }
            }
        }

        verificarAcessoPainel();

        return () => {
            painelGeralMontadoRef.current = false;
            clearTimeout(painelGeralReconectarRef.current);

            if (painelGeralWsRef.current) {
                painelGeralWsRef.current.onclose = null;
                painelGeralWsRef.current.close();
                painelGeralWsRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!painelGeralAutorizado) return;

        let cancelado = false;

        function conectarWebSocket() {
            if (cancelado) return;

            const token = localStorage.getItem("token");
            if (!token) {
                setPainelGeralWsStatus("desconectado");
                return;
            }

            setPainelGeralWsStatus("conectando");

            const baseWebSocket = API_URL
                .replace(/^https:/i, "wss:")
                .replace(/^http:/i, "ws:")
                .replace(/\/+$/, "");

            const urlWebSocket =
                `${baseWebSocket}/panel/ws/ironstore/fretes` +
                `?token=${encodeURIComponent(token)}`;

            const socket = new WebSocket(urlWebSocket);
            painelGeralWsRef.current = socket;

            socket.onopen = () => {
                if (cancelado) {
                    socket.close();
                    return;
                }

                painelGeralTentativaRef.current = 0;
                setPainelGeralWsStatus("conectado");
                console.info("[PAINEL GERAL] WebSocket conectado.");
            };

            socket.onmessage = async (evento) => {
                if (cancelado) return;

                try {
                    const dados = JSON.parse(evento.data);

                    if (dados.tipo !== "novo_frete" && dados.evento !== "novo_frete") {
                        return;
                    }

                    const freteId = dados.id ?? dados.frete_id;
                    if (freteId === undefined || freteId === null) {
                        console.warn("[PAINEL GERAL] Evento sem ID de frete:", dados);
                        return;
                    }

                    setPainelGeralUltimoFrete({
                        id: freteId,
                        recebidoEm: new Date().toISOString()
                    });

                    const titulo = "Novo frete recebido";
                    const mensagem = `Um novo registro foi adicionado à ironstore_fretes. ID: ${freteId}`;

                    if ("Notification" in window && Notification.permission === "granted") {
                        try {
                            await mostrarNotificacaoPainelGeral(
                                titulo,
                                mensagem,
                                `iron-frete-${freteId}`
                            );
                            console.info(
                                "[PAINEL GERAL] Notificação do sistema solicitada para o frete:",
                                freteId
                            );
                        } catch (error) {
                            console.error(
                                "[PAINEL GERAL] Não foi possível mostrar a notificação do frete:",
                                error
                            );
                        }
                    } else {
                        console.warn(
                            "[PAINEL GERAL] Notificação não enviada: permissão não concedida."
                        );
                    }

                    console.info("[PAINEL GERAL] Novo frete recebido:", dados);
                } catch (error) {
                    console.error("[PAINEL GERAL] Mensagem WebSocket inválida:", error);
                }
            };

            socket.onerror = (error) => {
                console.error("[PAINEL GERAL] Erro no WebSocket:", error);
            };

            socket.onclose = () => {
                if (painelGeralWsRef.current === socket) {
                    painelGeralWsRef.current = null;
                }

                if (cancelado) return;

                setPainelGeralWsStatus("desconectado");

                const tentativa = painelGeralTentativaRef.current;
                const intervalo = Math.min(1000 * Math.pow(2, tentativa), 30000);
                painelGeralTentativaRef.current = tentativa + 1;

                painelGeralReconectarRef.current = setTimeout(conectarWebSocket, intervalo);
            };
        }

        conectarWebSocket();

        return () => {
            cancelado = true;
            clearTimeout(painelGeralReconectarRef.current);

            if (painelGeralWsRef.current) {
                painelGeralWsRef.current.onclose = null;
                painelGeralWsRef.current.close();
                painelGeralWsRef.current = null;
            }
        };
    }, [painelGeralAutorizado, mostrarNotificacaoPainelGeral]);

    if (painelGeralCarregando) {
        return (
            <div className="painel-geral-validacao-carregando">
                <h1>Verificando acesso...</h1>
            </div>
        );
    }

    if (!painelGeralAutorizado) {
        return (
            <div className="painel-geral-validacao-negada">
                <h1>Acesso negado</h1>
            </div>
        );
    }

    return (
        <div className="painel-geral-conteudo-principal">
            <PainelG />

            <div className="painel-geral-notificacoes">
                <div
                    className={
                        painelGeralWsStatus === "conectado"
                            ? "painel-geral-ws-status painel-geral-ws-conectado"
                            : "painel-geral-ws-status painel-geral-ws-desconectado"
                    }
                >
                    <span className="painel-geral-ws-indicador" />
                    {painelGeralWsStatus === "conectado"
                        ? "Monitoramento de fretes conectado"
                        : painelGeralWsStatus === "conectando"
                            ? "Conectando ao monitoramento..."
                            : "Reconectando ao monitoramento..."}
                </div>

                <button
                    type="button"
                    className="painel-geral-notificacoes-botao"
                    onClick={ativarNotificacoesPainelGeral}
                    disabled={painelGeralNotificacaoAtiva}
                >
                    {painelGeralNotificacaoAtiva
                        ? "Notificações ativadas"
                        : "Ativar notificações"}
                </button>

                {painelGeralUltimoFrete && (
                    <div className="painel-geral-ultimo-frete" role="status">
                        Novo frete recebido. ID: {painelGeralUltimoFrete.id}
                    </div>
                )}
            </div>
        </div>
    );
}
