import React, { useEffect, useState } from "react";

import BuscarProduto from "./componentes/buscarproduto";
import ProdutoAtual from "./componentes/produtoatual";
import ListaItens from "./componentes/listaitens";
import TotalVenda from "./componentes/totalvenda";
import Infos from "./componentes/infos";
import ModalPagamento from "./componentes/modalpagamento";
import {
    VendaProvider,
    useVenda
} from "./componentes/vendaprovider";

import {
    buscarInputRef
} from "./componentes/buscarproduto";

import {
    processarVendaRapida,
    iniciarPixRapido
} from "./componentes/rapida";
import "./produtividade.css";

/* ===============================
   CONTEÚDO COM CONTEXTO
=============================== */
function ProdutividadeConteudo() {

    const {
        itens,
        total,

        aumentarQuantidade,
        diminuirQuantidade,

        modalAberto,

        limparVenda,
        setLimparBusca,

        emitirNota,

        criarSnapshotVenda,
        adicionarVendaProcessando,
        atualizarVendaProcessando,

        pixRapidoAtual,
        abrirPixRapido,
        fecharPixRapido
    } = useVenda();
    /* ===============================
       VENDA RÁPIDA EM ANDAMENTO

       Impede dois atalhos dispararem
       exatamente ao mesmo tempo antes
       do React limpar o carrinho.
    =============================== */
    const vendaRapidaBloqueadaRef = React.useRef(false);

    /* ===============================
       EXECUTAR VENDA RÁPIDA
    =============================== */
    function executarVendaRapida(pagamento) {

        /*
            Não permite venda rápida
            enquanto existe algum modal.
        */
        if (modalAberto) {
            return;
        }

        /*
            Não existe venda para finalizar.
        */
        if (!itens || itens.length === 0) {
            return;
        }

        if (!total || total <= 0) {
            return;
        }

        /*
            Evita Ctrl + 1 duplicado
            antes do React atualizar
            o estado do carrinho.
        */
        if (vendaRapidaBloqueadaRef.current) {
            return;
        }

        vendaRapidaBloqueadaRef.current = true;

        /* ===============================
           1. CONGELAR VENDA ATUAL
        =============================== */

        const venda =
            criarSnapshotVenda(pagamento);

        if (!venda) {
            vendaRapidaBloqueadaRef.current = false;
            return;
        }

        /* ===============================
           2. COLOCAR VENDA NA FILA

           A partir daqui o Infos.jsx
           consegue mostrar a venda.
        =============================== */

        adicionarVendaProcessando(venda);

        /* ===============================
           3. LIBERAR O CAIXA

           Isso acontece ANTES de esperar
           o backend.
        =============================== */

        limparVenda();

        setLimparBusca(true);

        /* ===============================
           4. DEVOLVER FOCO AO BUSCADOR
        =============================== */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                const input =
                    buscarInputRef.current;

                if (input) {
                    input.focus();
                }

                /*
                    O snapshot já existe e o
                    carrinho anterior já foi
                    liberado.

                    Permitimos outra venda.
                */

                vendaRapidaBloqueadaRef.current = false;
            });

        });

        /* ===============================
           5. PROCESSAR EM BACKGROUND

           IMPORTANTE:

           Não usamos await aqui.

           O operador não precisa esperar
           essa função terminar.
        =============================== */

        processarVendaRapida({
            venda,

            atualizarVenda:
                atualizarVendaProcessando
        }).catch(erro => {

            /*
                processarVendaRapida já possui
                tratamento interno.

                Isto fica como uma proteção
                adicional contra erro inesperado.
            */

            console.error(
                "[VENDA RÁPIDA] Erro inesperado:",
                erro
            );

            atualizarVendaProcessando(
                venda.idLocal,
                {
                    status: "erro",
                    erro:
                        erro?.message ||
                        "Erro inesperado na venda"
                }
            );
        });
    }
    /* ===============================
       EXECUTAR PIX RÁPIDO
    =============================== */
    async function executarPixRapido() {

        /* ===============================
           VALIDAÇÕES
        =============================== */

        if (modalAberto) {
            return;
        }

        if (!itens || itens.length === 0) {
            return;
        }

        if (!total || total <= 0) {
            return;
        }

        if (vendaRapidaBloqueadaRef.current) {
            return;
        }

        vendaRapidaBloqueadaRef.current = true;

        /* ===============================
           1. CONGELAR VENDA
        =============================== */

        const venda =
            criarSnapshotVenda("pix");

        if (!venda) {
            vendaRapidaBloqueadaRef.current = false;
            return;
        }

        /* ===============================
           2. MOSTRAR PROCESSAMENTO
        =============================== */

        adicionarVendaProcessando(venda);

        /* ===============================
           3. LIBERAR CARRINHO
    
           O snapshot já guardou os produtos.
        =============================== */

        limparVenda();

        setLimparBusca(true);

        /* ===============================
           4. DEVOLVER FOCO
        =============================== */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                const input =
                    buscarInputRef.current;

                if (input) {
                    input.focus();
                }

                vendaRapidaBloqueadaRef.current = false;
            });

        });

        /* ===============================
           5. GERAR PIX
        =============================== */

        try {

            const resultado =
                await iniciarPixRapido({
                    venda,

                    atualizarVenda:
                        atualizarVendaProcessando
                });

            /* ===============================
               ERRO
            =============================== */

            if (!resultado?.ok) {
                return;
            }

            /* ===============================
               PIX LOCAL
    
               iniciarPixRapido já finalizou.
               Não existe QR para mostrar.
            =============================== */

            if (
                resultado.aguardandoPagamento !== true
            ) {
                return;
            }

            /* ===============================
               PIX MERCADO PAGO
    
               Guardamos tudo que pertence
               à venda congelada.
            =============================== */

            abrirPixRapido({
                venda,

                vendaId:
                    resultado.vendaId,

                paymentId:
                    resultado.paymentId,

                comandaUrl:
                    resultado.comandaUrl,

                qrCode:
                    resultado.qrCode,

                qrCodeBase64:
                    resultado.qrCodeBase64,

                total:
                    resultado.total
            });

        } catch (erro) {

            console.error(
                "[PIX RÁPIDO] Erro inesperado:",
                erro
            );

            atualizarVendaProcessando(
                venda.idLocal,
                {
                    status: "erro",

                    erro:
                        erro?.message ||
                        "Erro inesperado ao gerar Pix"
                }
            );
        }
    }
    /* ===============================
   ABRIR PAGAMENTO PARA NFC-e
=============================== */
    function abrirPagamentoComNota() {

        if (!itens || itens.length === 0) {
            return;
        }

        if (!total || total <= 0) {
            return;
        }

        const btnCobrar =
            document.querySelector(".cob-botao");

        if (
            btnCobrar &&
            !btnCobrar.disabled
        ) {
            btnCobrar.click();
        }
    }
    /* ===============================
       TECLADO GLOBAL
    =============================== */
    useEffect(() => {

        function handleKeyDown(e) {

            /* ===============================
               MODAL BLOQUEIA ATALHOS
            =============================== */

            if (modalAberto) {
                return;
            }
            /* ===============================
      CTRL + 1 = DÉBITO
   =============================== */

            if (
                e.ctrlKey &&
                !e.shiftKey &&
                !e.altKey &&
                e.key === "1"
            ) {
                e.preventDefault();

                if (e.repeat) {
                    return;
                }

                if (emitirNota) {
                    abrirPagamentoComNota();
                    return;
                }

                executarVendaRapida("debito");

                return;
            }


            /* ===============================
               CTRL + 2 = CRÉDITO
            =============================== */

            if (
                e.ctrlKey &&
                !e.shiftKey &&
                !e.altKey &&
                e.key === "2"
            ) {
                e.preventDefault();

                if (e.repeat) {
                    return;
                }

                if (emitirNota) {
                    abrirPagamentoComNota();
                    return;
                }

                executarVendaRapida("credito");

                return;
            }


            /* ===============================
               CTRL + 3 = PIX
            =============================== */

            if (
                e.ctrlKey &&
                !e.shiftKey &&
                !e.altKey &&
                e.key === "3"
            ) {
                e.preventDefault();

                if (e.repeat) {
                    return;
                }

                if (emitirNota) {
                    abrirPagamentoComNota();
                    return;
                }

                executarPixRapido();

                return;
            }


            /* ===============================
               CTRL + 4 = DINHEIRO
            =============================== */

            if (
                e.ctrlKey &&
                !e.shiftKey &&
                !e.altKey &&
                e.key === "4"
            ) {
                e.preventDefault();

                if (e.repeat) {
                    return;
                }

                if (emitirNota) {
                    abrirPagamentoComNota();
                    return;
                }

                executarVendaRapida("dinheiro");

                return;
            }
            /* ===============================
               FOCO AUTOMÁTICO NO BUSCADOR
            =============================== */

            const input =
                buscarInputRef.current;

            if (!input) {
                return;
            }

            const ativo =
                document.activeElement;

            const ehCampo =
                ativo &&
                (
                    ativo.tagName === "INPUT" ||
                    ativo.tagName === "TEXTAREA"
                );

            if (!ehCampo && ativo !== input) {
                input.focus();
            }

            /* ===============================
               CTRL + ENTER = COBRAR

               Mantém exatamente o fluxo
               tradicional.
            =============================== */

            if (e.key === "Enter") {

                const inputAtual =
                    buscarInputRef.current;

                if (!inputAtual) {
                    return;
                }

                /*
                    ENTER sozinho nunca cobra.
                */

                if (!e.ctrlKey) {
                    return;
                }

                /*
                    Só cobra se o buscador
                    estiver vazio.
                */

                if (
                    inputAtual.value.trim() !== ""
                ) {
                    return;
                }

                e.preventDefault();

                const btnCobrar =
                    document.querySelector(
                        ".cob-botao"
                    );

                if (
                    btnCobrar &&
                    !btnCobrar.disabled &&
                    itens.length > 0
                ) {
                    btnCobrar.click();
                }

                return;
            }

            /* ===============================
               + AUMENTA QUANTIDADE
            =============================== */

            if (e.key === "+") {

                e.preventDefault();

                if (itens.length > 0) {

                    const ultimo =
                        itens[itens.length - 1];

                    aumentarQuantidade(
                        ultimo.id
                    );
                }

                return;
            }

            /* ===============================
               - DIMINUI QUANTIDADE
            =============================== */

            if (e.key === "-") {

                e.preventDefault();

                if (itens.length > 0) {

                    const ultimo =
                        itens[itens.length - 1];

                    diminuirQuantidade(
                        ultimo.id
                    );
                }
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };

    }, [
        itens,
        total,
        modalAberto,
        emitirNota,
        aumentarQuantidade,
        diminuirQuantidade,
        criarSnapshotVenda,
        adicionarVendaProcessando,
        atualizarVendaProcessando
    ]);

    /* ===============================
       INTERFACE
    =============================== */

    return (
        <div className="prod-container tema-escuro">

            <div className="linha-superior">

                <div
                    style={{
                        background: "#102038",
                        border: "2px solid #d4af37",
                        maxHeight: "100%"
                    }}
                    className="prod-card buscar buscar-wrapper"
                >
                    <BuscarProduto />

                    <Infos />
                </div>

                <div className="prod-card itens">
                    <ListaItens />
                </div>

            </div>

            <div className="linha-inferior">

                <div className="prod-card atual">
                    <ProdutoAtual />
                </div>

                <div
                    style={{
                        padding: "0",
                        background: "transparent",
                        border: "none"
                    }}
                    className="prod-card total"
                >
                    <TotalVenda />
                </div>

            </div>

            {/* ===============================
                MODAL PIX RÁPIDO
            =============================== */}

            {pixRapidoAtual && (
                <ModalPagamento
                    total={pixRapidoAtual.total}
                    modoPixRapido={true}
                    dadosPixRapido={pixRapidoAtual}
                    fechar={() => {
                        fecharPixRapido();
                    }}
                />
            )}

        </div>
    );
}

/* ===============================
   COMPONENTE PRINCIPAL
=============================== */

export default function Produtividade() {

    const [bloqueado, setBloqueado] =
        useState(false);

    /* ===============================
       BLOQUEAR CELULARES
    =============================== */

    useEffect(() => {

        function verificarDispositivo() {

            setBloqueado(
                window.innerWidth < 624
            );
        }

        verificarDispositivo();

        window.addEventListener(
            "resize",
            verificarDispositivo
        );

        return () => {

            window.removeEventListener(
                "resize",
                verificarDispositivo
            );
        };

    }, []);

    if (bloqueado) {

        return (
            <div className="bloqueio-mobile">

                <h1>
                    Acesso não autorizado
                </h1>

                <p>
                    Este sistema não pode ser utilizado
                    em celulares ou telas pequenas.
                </p>

                <p>
                    Utilize um computador ou notebook
                    para continuar.
                </p>

            </div>
        );
    }

    return (
        <VendaProvider>
            <ProdutividadeConteudo />
        </VendaProvider>
    );
}