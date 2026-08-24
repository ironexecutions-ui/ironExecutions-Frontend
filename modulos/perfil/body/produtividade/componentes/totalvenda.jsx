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
        setLimparBusca
    } = useVenda();

    const [tema, setTema] = useState("escuro");

    const [abrirPagamento, setAbrirPagamento] = useState(false);

    const [mostrarUSD, setMostrarUSD] = useState(false);

    // ===============================
    // CÂMBIO
    // ===============================

    const [converte, setConverte] = useState(0);

    const [cambio, setCambio] = useState(null);

    // ===============================
    // NFC-E
    // ===============================

    const [permissaoNfce, setPermissaoNfce] = useState("nao");

    const [imprimirNfce, setImprimirNfce] = useState(false);

    const [carregandoPermissaoNfce, setCarregandoPermissaoNfce] =
        useState(true);

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

            } catch (erro) {

                console.log(
                    "[TOTAL VENDA] Erro ao buscar tema:",
                    erro
                );

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
    // BUSCAR CONFIG DE CÂMBIO
    // ===============================

    useEffect(() => {

        async function buscarCambio() {

            try {

                const token = localStorage.getItem("token");

                console.log(
                    "[TOTAL VENDA] TOKEN:",
                    token
                );

                const headers = token
                    ? {
                        Authorization: `Bearer ${token}`
                    }
                    : {};

                const resp = await fetch(
                    `${API_URL}/comercio/cambio`,
                    {
                        headers
                    }
                );

                console.log(
                    "[TOTAL VENDA] STATUS CAMBIO:",
                    resp.status
                );

                if (!resp.ok) {

                    return;

                }

                const data = await resp.json();

                console.log(
                    "[TOTAL VENDA] DADOS CAMBIO:",
                    data
                );

                setConverte(
                    Number(data.converte)
                );

                setCambio(
                    Number(data.cambio)
                );

            } catch (erro) {

                console.log(
                    "[TOTAL VENDA] ERRO CAMBIO:",
                    erro
                );

                setConverte(0);

                setCambio(null);

            }

        }

        buscarCambio();

    }, []);

    // ===============================
    // BUSCAR PERMISSÃO NFC-E
    // ===============================

    useEffect(() => {

        async function buscarPermissaoNfce() {

            try {

                setCarregandoPermissaoNfce(true);

                const token = localStorage.getItem("token");

                if (!token) {

                    console.log(
                        "[TOTAL VENDA] Sem token para buscar permissão NFC-e"
                    );

                    setPermissaoNfce("nao");

                    setImprimirNfce(false);

                    return;

                }

                const resp = await fetch(
                    `${API_URL}/fiscal/permissao-impressao`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log(
                    "[TOTAL VENDA] STATUS PERMISSÃO NFC-E:",
                    resp.status
                );

                if (!resp.ok) {

                    const texto = await resp.text();

                    console.log(
                        "[TOTAL VENDA] ERRO PERMISSÃO NFC-E:",
                        texto
                    );

                    setPermissaoNfce("nao");

                    setImprimirNfce(false);

                    return;

                }

                const data = await resp.json();

                console.log(
                    "[TOTAL VENDA] PERMISSÃO NFC-E RECEBIDA:",
                    data
                );

                const permissao = String(
                    data.imprime || "nao"
                )
                    .trim()
                    .toLowerCase();

                console.log(
                    "[TOTAL VENDA] PERMISSÃO NORMALIZADA:",
                    permissao
                );

                // ===============================
                // SEMPRE IMPRIME
                // ===============================

                if (permissao === "sim") {

                    setPermissaoNfce("sim");

                    setImprimirNfce(true);

                    console.log(
                        "[TOTAL VENDA] NFC-e automática ativada"
                    );

                    return;

                }

                // ===============================
                // NUNCA IMPRIME
                // ===============================

                if (permissao === "nao") {

                    setPermissaoNfce("nao");

                    setImprimirNfce(false);

                    console.log(
                        "[TOTAL VENDA] NFC-e automática desativada"
                    );

                    return;

                }

                // ===============================
                // PERGUNTAR NA HORA
                // ===============================

                if (permissao === "na hora") {

                    setPermissaoNfce("na hora");

                    const cache = localStorage.getItem(
                        "fiscal_nfce_na_hora"
                    );

                    console.log(
                        "[TOTAL VENDA] CACHE NFC-E:",
                        cache
                    );

                    if (cache === "sim") {

                        setImprimirNfce(true);

                    } else {

                        setImprimirNfce(false);

                    }

                    return;

                }

                console.log(
                    "[TOTAL VENDA] Permissão desconhecida:",
                    permissao
                );

                setPermissaoNfce("nao");

                setImprimirNfce(false);

            } catch (erro) {

                console.log(
                    "[TOTAL VENDA] ERRO AO BUSCAR PERMISSÃO NFC-E:",
                    erro
                );

                setPermissaoNfce("nao");

                setImprimirNfce(false);

            } finally {

                setCarregandoPermissaoNfce(false);

            }

        }

        buscarPermissaoNfce();

    }, []);

    // ===============================
    // ESC = CANCELAR
    // ===============================

    useEffect(() => {

        function escCancelar(e) {

            if (
                e.key === "Escape" &&
                !vendaVazia &&
                !abrirPagamento
            ) {

                limparVenda();

                setMostrarUSD(false);

            }

        }

        window.addEventListener(
            "keydown",
            escCancelar
        );

        return () => {

            window.removeEventListener(
                "keydown",
                escCancelar
            );

        };

    }, [
        vendaVazia,
        limparVenda,
        abrirPagamento
    ]);

    // ===============================
    // CANCELAR VENDA
    // ===============================

    function cancelarVenda() {

        limparVenda();

        setMostrarUSD(false);

    }

    // ===============================
    // SELECIONAR SIM NFC-E
    // ===============================

    function selecionarNfceSim() {

        console.log(
            "[TOTAL VENDA] Nota fiscal selecionada: SIM"
        );

        setImprimirNfce(true);

        // SIM permanece salvo
        localStorage.setItem(
            "fiscal_nfce_na_hora",
            "sim"
        );

    }

    // ===============================
    // SELECIONAR NÃO NFC-E
    // ===============================

    function selecionarNfceNao() {

        console.log(
            "[TOTAL VENDA] Nota fiscal selecionada: NÃO"
        );

        setImprimirNfce(false);

        // NÃO não permanece no cache
        localStorage.removeItem(
            "fiscal_nfce_na_hora"
        );

    }

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
    // ABRIR PAGAMENTO
    // ===============================

    function abrirModalPagamento() {

        if (vendaVazia) {

            return;

        }

        console.log(
            "[TOTAL VENDA] Abrindo pagamento"
        );

        console.log(
            "[TOTAL VENDA] Permissão NFC-e:",
            permissaoNfce
        );

        console.log(
            "[TOTAL VENDA] Emitir NFC-e nesta venda:",
            imprimirNfce
        );

        setLimparBusca(true);

        setAbrirPagamento(true);

    }

    // ===============================
    // FECHAR PAGAMENTO
    // ===============================

    function fecharModalPagamento() {

        setAbrirPagamento(false);

    }

    return (

        <div
            className={`cob-box cob-tema-${tema}`}
        >

            {/* ===============================
                VALOR
            =============================== */}

            <div
                className={`
                    cob-valor
                    ${total > 0 &&
                        converte === 1
                        ? "clicavel"
                        : ""
                    }
                `}
                onClick={() => {

                    if (
                        total > 0 &&
                        converte === 1 &&
                        cambio
                    ) {

                        setMostrarUSD(
                            valorAtual => !valorAtual
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

            {/* ===============================
                PERGUNTA NFC-E
                SOMENTE PARA "NA HORA"
            =============================== */}
            {permissaoNfce === "na hora" && (
                <div className="cob-nfce-pergunta-venda">

                    <span className="cob-nfce-pergunta-texto-venda">
                        Nota fiscal?
                    </span>

                    <div className="cob-nfce-opcoes-venda">

                        <button
                            type="button"
                            className={`
                    cob-nfce-opcao-sim-venda
                    ${imprimirNfce
                                    ? "cob-nfce-opcao-selecionada-venda"
                                    : ""
                                }
                `}
                            onClick={selecionarNfceSim}
                        >
                            SIM
                        </button>

                        <button
                            type="button"
                            className={`
                    cob-nfce-opcao-nao-venda
                    ${!imprimirNfce
                                    ? "cob-nfce-opcao-selecionada-venda"
                                    : ""
                                }
                `}
                            onClick={selecionarNfceNao}
                        >
                            NÃO
                        </button>

                    </div>

                </div>
            )}

            {/* ===============================
                AÇÕES
            =============================== */}

            <div className="cob-acoes">

                <button
                    className={`
                        cob-botao-cancelar
                        ${vendaVazia
                            ? "desabilitado"
                            : ""
                        }
                    `}
                    disabled={vendaVazia}
                    onClick={cancelarVenda}
                >
                    Cancelar
                </button>

                <button
                    className={`
                        cob-botao
                        ${vendaVazia
                            ? "cob-botao-desabilitado"
                            : ""
                        }
                    `}
                    disabled={vendaVazia}
                    onClick={abrirModalPagamento}
                >
                    Cobrar
                </button>

            </div>

            {/* ===============================
                MODAL PAGAMENTO
            =============================== */}

            {abrirPagamento && (

                <ModalPagamento
                    total={total}
                    imprimirNfce={imprimirNfce}
                    fechar={fecharModalPagamento}
                />

            )}

        </div>

    );

}