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

    const [abrirPagamento, setAbrirPagamento] =
        useState(false);

    const [mostrarUSD, setMostrarUSD] =
        useState(false);

    const [converte, setConverte] =
        useState(0);

    const [cambio, setCambio] =
        useState(null);


    /* ===============================
       CONFIGURAÇÃO NFC-e
    =============================== */

    const [podeEmitirNfce, setPodeEmitirNfce] =
        useState(false);

    const [comercioFiscalId, setComercioFiscalId] =
        useState(null);

    const [verificandoFiscal, setVerificandoFiscal] =
        useState(true);


    const vendaVazia =
        itens.length === 0;


    /* ===============================
       DEFINIR TEMA
    =============================== */

    useEffect(() => {

        async function definirTema() {

            let modoCliente = null;

            try {

                const token =
                    localStorage.getItem("token");

                if (token) {

                    const resp = await fetch(
                        `${API_URL}/api/clientes/modo`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                    if (resp.ok) {

                        const data =
                            await resp.json();

                        modoCliente =
                            data.modo;
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


            const hora =
                new Date().getHours();


            setTema(
                hora >= 18 || hora < 6
                    ? "escuro"
                    : "claro"
            );
        }


        definirTema();

    }, []);


    /* ===============================
       VERIFICAR SE PODE EMITIR NFC-e
    =============================== */

    useEffect(() => {

        let componenteAtivo = true;


        async function verificarFiscal() {

            setVerificandoFiscal(true);


            try {

                const token =
                    localStorage.getItem("token");


                if (!token) {

                    if (componenteAtivo) {

                        setPodeEmitirNfce(false);

                        setComercioFiscalId(null);

                        setEmitirNota(false);

                        setVerificandoFiscal(false);
                    }

                    return;
                }


                const resp = await fetch(
                    `${API_URL}/fiscal/comercio/fiscal/pode-emitir-nfce`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                if (!resp.ok) {

                    console.error(
                        "[NFC-e] Erro ao verificar configuração fiscal:",
                        resp.status
                    );


                    if (componenteAtivo) {

                        setPodeEmitirNfce(false);

                        setComercioFiscalId(null);

                        setEmitirNota(false);

                        setVerificandoFiscal(false);
                    }

                    return;
                }


                const data =
                    await resp.json();


                console.log(
                    "[NFC-e] Verificação fiscal:",
                    data
                );


                if (!componenteAtivo) {
                    return;
                }


                /* ===============================
                   NÃO PODE EMITIR
                =============================== */

                if (data.pode_emitir !== true) {

                    setPodeEmitirNfce(false);

                    setComercioFiscalId(
                        data.comercio_id ?? null
                    );

                    /*
                        Fundamental.

                        Se o comércio não estiver
                        configurado, emitirNota
                        obrigatoriamente será false.
                    */

                    setEmitirNota(false);

                    setVerificandoFiscal(false);

                    return;
                }


                /* ===============================
                   PODE EMITIR
                =============================== */

                const comercioId =
                    data.comercio_id;


                if (!comercioId) {

                    setPodeEmitirNfce(false);

                    setComercioFiscalId(null);

                    setEmitirNota(false);

                    setVerificandoFiscal(false);

                    return;
                }


                setPodeEmitirNfce(true);

                setComercioFiscalId(
                    comercioId
                );


                /* ===============================
                   LER PREFERÊNCIA DO CACHE
                =============================== */

                const chaveCache =
                    `nfce_emitir_padrao_${comercioId}`;


                const preferencia =
                    localStorage.getItem(
                        chaveCache
                    );


                console.log(
                    "[NFC-e] Preferência salva:",
                    preferencia
                );


                /*
                    Só "sim" ativa.

                    Se não existir cache,
                    o padrão será NÃO.
                */

                if (preferencia === "sim") {

                    setEmitirNota(true);

                } else {

                    setEmitirNota(false);
                }


                setVerificandoFiscal(false);


            } catch (erro) {

                console.error(
                    "[NFC-e] Erro ao verificar disponibilidade:",
                    erro
                );


                if (componenteAtivo) {

                    setPodeEmitirNfce(false);

                    setComercioFiscalId(null);

                    setEmitirNota(false);

                    setVerificandoFiscal(false);
                }
            }
        }


        verificarFiscal();


        return () => {

            componenteAtivo = false;
        };

    }, [setEmitirNota]);


    /* ===============================
       SELECIONAR SIM
    =============================== */

    function selecionarEmitirNota() {

        if (!podeEmitirNfce) {
            return;
        }


        if (!comercioFiscalId) {
            return;
        }


        setEmitirNota(true);


        const chaveCache =
            `nfce_emitir_padrao_${comercioFiscalId}`;


        localStorage.setItem(
            chaveCache,
            "sim"
        );


        console.log(
            "[NFC-e] Preferência salva: SIM"
        );
    }


    /* ===============================
       SELECIONAR NÃO
    =============================== */

    function selecionarNaoEmitirNota() {

        setEmitirNota(false);


        if (!comercioFiscalId) {
            return;
        }


        const chaveCache =
            `nfce_emitir_padrao_${comercioFiscalId}`;


        localStorage.setItem(
            chaveCache,
            "nao"
        );


        console.log(
            "[NFC-e] Preferência salva: NÃO"
        );
    }


    /* ===============================
       BUSCAR CONFIG DE CÂMBIO
    =============================== */

    useEffect(() => {

        async function buscarCambio() {

            try {

                const token =
                    localStorage.getItem("token");


                const headers = token
                    ? {
                        Authorization:
                            `Bearer ${token}`
                    }
                    : {};


                const resp = await fetch(
                    `${API_URL}/comercio/cambio`,
                    {
                        headers
                    }
                );


                console.log(
                    "STATUS CAMBIO:",
                    resp.status
                );


                if (!resp.ok) {
                    return;
                }


                const data =
                    await resp.json();


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


    /* ===============================
       ESC = CANCELAR
    =============================== */

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

    }, [
        vendaVazia,
        limparVenda
    ]);


    /* ===============================
       VALOR FORMATADO
    =============================== */

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


            return (
                `US$ ${valorArredondado.toFixed(2)}`
            );
        }


        return (
            `R$ ${total.toFixed(2)}`
        );
    }


    /* ===============================
       CANCELAR VENDA
    =============================== */

    function cancelarVenda() {

        /*
            Não alteramos emitirNota aqui.

            A escolha SIM/NÃO é uma
            preferência persistente.
        */

        limparVenda();
    }


    /* ===============================
       ABRIR PAGAMENTO
    =============================== */

    function abrirModalPagamento() {

        if (vendaVazia) {
            return;
        }


        setLimparBusca(true);

        setAbrirPagamento(true);
    }


    return (

        <div
            className={`cob-box cob-tema-${tema}`}
        >

            {/* =========================
                VALOR
            ========================= */}

            <div
                className={`cob-valor ${total > 0 &&
                    converte === 1
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

                Só existe visualmente
                quando o comércio está
                configurado.
            ========================= */}

            {/* =========================
    EMITIR NFC-e
========================= */}

            {!verificandoFiscal && podeEmitirNfce && (

                <div
                    className={`cob-fiscal-toggle-container ${vendaVazia
                            ? "cob-fiscal-toggle-container-inativo"
                            : ""
                        }`}
                >
                    <div className="cob-fiscal-toggle-info">
                        <span className="cob-fiscal-toggle-titulo">
                            Emitir NFC-e
                        </span>

                        <span className="cob-fiscal-toggle-status">
                            {emitirNota
                                ? "Emissão ativada"
                                : "Não emitir nesta venda"}
                        </span>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={emitirNota}
                        aria-label="Ativar ou desativar emissão de NFC-e"
                        disabled={vendaVazia}
                        className={`cob-fiscal-toggle-controle ${emitirNota
                                ? "cob-fiscal-toggle-controle-ativo"
                                : "cob-fiscal-toggle-controle-desligado"
                            }`}
                        onClick={() => {
                            if (emitirNota) {
                                selecionarNaoEmitirNota();
                            } else {
                                selecionarEmitirNota();
                            }
                        }}
                    >
                        <span className="cob-fiscal-toggle-indicador" />
                    </button>
                </div>

            )}

            {/* =========================
                AÇÕES
            ========================= */}

            <div
                className="cob-acoes"
            >

                <button
                    className={`cob-botao-cancelar ${vendaVazia
                        ? "desabilitado"
                        : ""
                        }`}
                    disabled={
                        vendaVazia
                    }
                    onClick={
                        cancelarVenda
                    }
                >
                    Cancelar
                </button>


                <button
                    className={`cob-botao ${vendaVazia
                        ? "cob-botao-desabilitado"
                        : ""
                        }`}
                    disabled={
                        vendaVazia
                    }
                    onClick={
                        abrirModalPagamento
                    }
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
                    emitirNota={
                        podeEmitirNfce
                            ? emitirNota
                            : false
                    }
                    fechar={() =>
                        setAbrirPagamento(false)
                    }
                />

            )}

        </div>
    );
}