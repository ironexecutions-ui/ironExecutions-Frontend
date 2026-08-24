import React, { useEffect, useState } from "react";

import { useVenda } from "./vendaprovider";

import { API_URL } from "../../../../../config";

import ModalPagamento from "./modalpagamento";

import "./totalvenda.css";

export default function TotalVenda() {

    const {
        total,
        itens,
        limparVenda,
        setLimparBusca,
        emitirNota,
        setEmitirNota
    } = useVenda();

    const [tema, setTema] = useState("escuro");

    const [abrirPagamento, setAbrirPagamento] = useState(false);

    const [mostrarUSD, setMostrarUSD] = useState(false);

    const [converte, setConverte] = useState(0);

    const [cambio, setCambio] = useState(null);

    const vendaVazia = itens.length === 0;

    // ===============================
    // DEFINIR TEMA
    // ===============================

    useEffect(() => {

        async function definirTema() {

            let modoCliente = null;

            try {

                const token = localStorage.getItem("token");

                if (token) {

                    const resp = await fetch(
                        `${API_URL}/api/clientes/modo`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    if (resp.ok) {

                        const data = await resp.json();

                        modoCliente = data.modo;
                    }
                }

            } catch {
                modoCliente = null;
            }

            if (modoCliente === 1) {
                setTema("escuro");
                return;
            }

            if (modoCliente === 2) {
                setTema("claro");
                return;
            }

            const hora = new Date().getHours();

            setTema(
                hora >= 18 || hora < 6
                    ? "escuro"
                    : "claro"
            );
        }

        definirTema();

    }, []);

    // ===============================
    // BUSCAR CONFIG DE CAMBIO
    // ===============================

    useEffect(() => {

        async function buscarCambio() {

            try {

                const token =
                    localStorage.getItem("token");

                console.log("TOKEN:", token);

                const headers = token
                    ? {
                        Authorization: `Bearer ${token}`
                    }
                    : {};

                const resp = await fetch(
                    `${API_URL}/comercio/cambio`,
                    { headers }
                );

                console.log(
                    "STATUS CAMBIO:",
                    resp.status
                );

                if (!resp.ok) {
                    return;
                }

                const data = await resp.json();

                console.log(
                    "DADOS CAMBIO:",
                    data
                );

                setConverte(
                    Number(data.converte)
                );

                setCambio(
                    Number(data.cambio)
                );

            } catch (e) {

                console.log(
                    "ERRO CAMBIO:",
                    e
                );

                setConverte(0);

                setCambio(null);
            }
        }

        buscarCambio();

    }, []);

    // ===============================
    // ESC = CANCELAR
    // ===============================

    useEffect(() => {

        function escCancelar(e) {

            if (
                e.key === "Escape" &&
                !vendaVazia
            ) {
                limparVenda();
            }
        }

        window.addEventListener(
            "keydown",
            escCancelar
        );

        return () =>
            window.removeEventListener(
                "keydown",
                escCancelar
            );

    }, [vendaVazia, limparVenda]);

    // ===============================
    // VALOR FORMATADO
    // ===============================

    function valorExibido() {

        if (
            mostrarUSD &&
            converte === 1 &&
            cambio &&
            total > 0
        ) {

            const convertido =
                total / cambio;

            const inteiro =
                Math.floor(convertido);

            const centavos =
                convertido - inteiro;

            const valorArredondado =
                centavos > 0.30
                    ? Math.ceil(convertido)
                    : Math.floor(convertido);

            return `US$ ${valorArredondado.toFixed(2)}`;
        }

        return `R$ ${total.toFixed(2)}`;
    }

    // ===============================
    // CANCELAR VENDA
    // ===============================

    function cancelarVenda() {

        limparVenda();

        setEmitirNota(false);
    }

    return (

        <div
            className={`cob-box cob-tema-${tema}`}
        >

            {/* =========================
                VALOR
            ========================= */}

            <div
                className={`cob-valor ${total > 0 && converte === 1
                    ? "clicavel"
                    : ""
                    }`}
                onClick={() => {

                    if (
                        total > 0 &&
                        converte === 1 &&
                        cambio
                    ) {
                        setMostrarUSD(
                            valor => !valor
                        );
                    }
                }}
                title={
                    total > 0 &&
                        converte === 1
                        ? "Clique para alternar moeda"
                        : ""
                }
            >
                {valorExibido()}
            </div>

            {/* =========================
                EMITIR NOTA
            ========================= */}

            <div
                className={`cob-nfce-escolha ${vendaVazia
                    ? "cob-nfce-escolha-desabilitada"
                    : ""
                    }`}
            >

                <span className="cob-nfce-pergunta">
                    Emitir nota?
                </span>

                <div className="cob-nfce-opcoes">

                    <button
                        type="button"
                        className={`cob-nfce-opcao cob-nfce-opcao-sim ${emitirNota
                            ? "cob-nfce-opcao-ativa"
                            : ""
                            }`}
                        disabled={vendaVazia}
                        onClick={() =>
                            setEmitirNota(true)
                        }
                    >
                        Sim
                    </button>

                    <button
                        type="button"
                        className={`cob-nfce-opcao cob-nfce-opcao-nao ${!emitirNota
                            ? "cob-nfce-opcao-ativa"
                            : ""
                            }`}
                        disabled={vendaVazia}
                        onClick={() =>
                            setEmitirNota(false)
                        }
                    >
                        Não
                    </button>

                </div>

            </div>

            {/* =========================
                AÇÕES
            ========================= */}

            <div className="cob-acoes">

                <button
                    className={`cob-botao-cancelar ${vendaVazia
                        ? "desabilitado"
                        : ""
                        }`}
                    disabled={vendaVazia}
                    onClick={cancelarVenda}
                >
                    Cancelar
                </button>

                <button
                    className={`cob-botao ${vendaVazia
                        ? "cob-botao-desabilitado"
                        : ""
                        }`}
                    disabled={vendaVazia}
                    onClick={() => {

                        setLimparBusca(true);

                        setAbrirPagamento(true);
                    }}
                >
                    Cobrar
                </button>

            </div>

            {/* =========================
                MODAL PAGAMENTO
            ========================= */}

            {abrirPagamento && (

                <ModalPagamento
                    total={total}
                    emitirNota={emitirNota}
                    fechar={() => setAbrirPagamento(false)}
                />

            )}

        </div>
    );
}