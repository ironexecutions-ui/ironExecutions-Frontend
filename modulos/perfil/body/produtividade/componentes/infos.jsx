import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import { useVenda } from "./vendaprovider";
import "./infos.css";

export default function Infos() {

    const [hora, setHora] = useState(new Date());
    const [nome, setNome] = useState("Carregando...");
    const [funcao, setFuncao] = useState("");

    const {
        vendasProcessando,
        removerVendaProcessando
    } = useVenda();

    /* ===============================
       BUSCAR USUÁRIO LOGADO
    =============================== */
    useEffect(() => {
        const token = localStorage.getItem("token");

        async function carregarUsuario() {
            try {
                const resp = await fetch(`${API_URL}/retorno/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!resp.ok) {
                    setNome("Não identificado");
                    return;
                }

                const data = await resp.json();

                setNome(data.nome);
                setFuncao(data.funcao);

            } catch {
                setNome("Não identificado");
            }
        }

        carregarUsuario();
    }, []);

    /* ===============================
       RELÓGIO EM TEMPO REAL
    =============================== */
    useEffect(() => {

        const timer = setInterval(() => {
            setHora(new Date());
        }, 1000);

        return () => clearInterval(timer);

    }, []);

    /* ===============================
       REMOVER VENDAS CONCLUÍDAS
       DEPOIS DE ALGUNS SEGUNDOS
    =============================== */
    useEffect(() => {

        const timers = [];

        vendasProcessando.forEach(venda => {

            if (venda.status === "concluida") {

                const timer = setTimeout(() => {
                    removerVendaProcessando(venda.idLocal);
                }, 3500);

                timers.push(timer);
            }

        });

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };

    }, [
        vendasProcessando,
        removerVendaProcessando
    ]);

    /* ===============================
       NOME DO PAGAMENTO
    =============================== */
    function nomePagamento(pagamento) {

        if (pagamento === "debito") {
            return "Débito";
        }

        if (pagamento === "credito") {
            return "Crédito";
        }

        if (pagamento === "pix") {
            return "Pix";
        }

        if (pagamento === "dinheiro") {
            return "Dinheiro";
        }

        return "Pagamento";
    }

    /* ===============================
       TEXTO DO STATUS
    =============================== */
    function textoStatus(status) {

        if (status === "aguardando") {
            return "Preparando venda";
        }

        if (status === "processando") {
            return "Processando";
        }

        if (status === "aguardando_pagamento") {
            return "Aguardando pagamento";
        }

        if (status === "imprimindo") {
            return "Imprimindo";
        }

        if (status === "emitindo_nfce") {
            return "Emitindo nota fiscal";
        }

        if (status === "concluida") {
            return "Venda concluída";
        }

        if (status === "erro") {
            return "Erro na venda";
        }

        return "Processando";
    }

    /* ===============================
       CLASSE DO STATUS
    =============================== */
    function classeStatus(status) {

        if (status === "concluida") {
            return "infos-venda-concluida";
        }

        if (status === "erro") {
            return "infos-venda-erro";
        }

        if (status === "aguardando_pagamento") {
            return "infos-venda-aguardando";
        }

        return "infos-venda-processando";
    }

    /* ===============================
       FORMATAR VALOR
    =============================== */
    function formatarValor(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    return (
        <div className="infos-container">

            {/* =========================
                FUNCIONÁRIO
            ========================= */}
            <div className="infos-linha">
                <span className="infos-label">
                    Funcionário:{" "}
                </span>

                <strong>{nome}</strong>
            </div>

            {/* =========================
                VENDAS EM BACKGROUND
            ========================= */}
            {vendasProcessando.length > 0 && (

                <div className="infos-vendas-background">

                    {vendasProcessando.map(venda => (

                        <div
                            key={venda.idLocal}
                            className={`infos-venda-item ${classeStatus(venda.status)}`}
                        >

                            <div className="infos-venda-indicador">

                                {venda.status === "concluida" ? (

                                    <span className="infos-venda-check">
                                        ✓
                                    </span>

                                ) : venda.status === "erro" ? (

                                    <span className="infos-venda-erro-icone">
                                        !
                                    </span>

                                ) : (

                                    <span className="infos-venda-loader"></span>

                                )}

                            </div>

                            <div className="infos-venda-dados">

                                <div className="infos-venda-principal">

                                    <strong>
                                        {textoStatus(venda.status)}
                                    </strong>

                                    <span className="infos-venda-separador">
                                        •
                                    </span>

                                    <span>
                                        {nomePagamento(venda.pagamento)}
                                    </span>

                                </div>

                                <div className="infos-venda-valor">
                                    {formatarValor(venda.total)}
                                </div>

                                {venda.status === "erro" && venda.erro && (
                                    <div className="infos-venda-mensagem-erro">
                                        {venda.erro}
                                    </div>
                                )}

                                {venda.status === "concluida" && venda.aviso && (
                                    <div className="infos-venda-mensagem-aviso">
                                        {venda.aviso}
                                    </div>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {/* =========================
                DATA E HORA
            ========================= */}
            <div className="infos-linha infos-datahora">

                <strong className="infos-data">
                    {hora.toLocaleDateString("pt-BR")}
                </strong>

                <span className="infos-separador">
                    •
                </span>

                <strong className="infos-hora">
                    {hora.toLocaleTimeString("pt-BR")}
                </strong>

            </div>

        </div>
    );
}