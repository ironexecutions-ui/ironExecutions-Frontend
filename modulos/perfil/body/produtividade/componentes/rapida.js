import { API_URL } from "../../../../../config";

/* =========================================
   CONFIGURAÇÕES
========================================= */

const API_ONLINE_VENDAS = API_URL;
const API_LOCAL = "http://localhost:8888";


/* =========================================
   DESCOBRIR SE API LOCAL ESTÁ DISPONÍVEL
========================================= */

async function descobrirApiLocal() {

    try {

        const resp = await fetch(
            `${API_LOCAL}/health`,
            {
                method: "GET"
            }
        );

        return resp.ok;

    } catch {

        return false;
    }
}


/* =========================================
   PEGAR TOKEN
========================================= */

function pegarToken() {

    return localStorage.getItem("token");
}


/* =========================================
   EXTRAIR MENSAGEM DE ERRO
========================================= */

async function extrairErroResposta(
    resp,
    mensagemPadrao
) {

    try {

        const dados = await resp.json();

        return (
            dados?.detail ||
            dados?.error ||
            dados?.message ||
            mensagemPadrao
        );

    } catch {

        return mensagemPadrao;
    }
}


/* =========================================
   REGISTRAR JOGOS
========================================= */

async function registrarJogosVenda(itens) {

    if (!itens || itens.length === 0) {
        return;
    }

    const jogos = itens.filter(item =>
        item.nome &&
        item.nome
            .toLowerCase()
            .includes("jogos")
    );

    if (jogos.length === 0) {
        return;
    }

    const totalJogos = jogos.reduce(
        (soma, item) =>
            soma + Number(item.quantidade || 0),
        0
    );

    if (totalJogos <= 0) {
        return;
    }

    try {

        await fetch(
            `${API_URL}/jogos/registrar`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        `Bearer ${pegarToken()}`
                },

                body: JSON.stringify({
                    quantos: totalJogos
                })
            }
        );

    } catch (erro) {

        /*
            Não bloqueamos a venda por causa
            do registro de jogos.

            É o mesmo princípio do seu fluxo
            tradicional.
        */

        console.warn(
            "[VENDA RÁPIDA] Falha ao registrar jogos:",
            erro
        );
    }
}


/* =========================================
   CRIAR VENDA NO BACKEND
========================================= */

async function criarVenda(venda) {

    const resp = await fetch(
        `${API_ONLINE_VENDAS}/vendas/finalizar`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${pegarToken()}`
            },

            body: JSON.stringify({
                pagamento: venda.pagamento,
                valor: venda.total,
                produtos: venda.itens,

                /*
                    Venda rápida continua sem CPF.

                    Quando precisar de CPF,
                    usamos o fluxo tradicional.
                */
                cpf: null,

                forcar_manual: false
            })
        }
    );

    if (!resp.ok) {

        const mensagem =
            await extrairErroResposta(
                resp,
                "Erro ao criar venda"
            );

        throw new Error(mensagem);
    }

    const dados = await resp.json();

    if (!dados.venda_id) {

        throw new Error(
            "Backend não retornou o ID da venda"
        );
    }

    return dados;
}


/* =========================================
   CONFIRMAR VENDA
========================================= */

async function confirmarVenda(vendaId) {

    const resp = await fetch(
        `${API_ONLINE_VENDAS}/vendas/${vendaId}/confirmar`,
        {
            method: "POST",

            headers: {
                Authorization:
                    `Bearer ${pegarToken()}`
            }
        }
    );

    /*
        Seu fluxo tradicional aceita 409.

        Mantemos o mesmo comportamento.
    */

    if (!resp.ok && resp.status !== 409) {

        const mensagem =
            await extrairErroResposta(
                resp,
                "Erro ao confirmar pagamento"
            );

        throw new Error(mensagem);
    }

    return await resp.json();
}


/* =========================================
   IMPRIMIR COMANDA
========================================= */

async function imprimirComanda(
    vendaId,
    comandaUrl
) {

    if (!comandaUrl) {

        return {
            tentou: false,
            sucesso: true
        };
    }

    const apiLocalDisponivel =
        await descobrirApiLocal();

    if (!apiLocalDisponivel) {

        return {
            tentou: true,
            sucesso: false,
            erro:
                "API local de impressão indisponível"
        };
    }

    try {

        const resp = await fetch(
            `${API_LOCAL}/imprimir`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    venda_id: vendaId,
                    url: comandaUrl
                })
            }
        );

        if (!resp.ok) {

            return {
                tentou: true,
                sucesso: false,
                erro:
                    "Erro ao imprimir comanda"
            };
        }

        return {
            tentou: true,
            sucesso: true
        };

    } catch {

        return {
            tentou: true,
            sucesso: false,
            erro:
                "Erro de conexão com a impressora"
        };
    }
}


/* =========================================
   FINALIZAR VENDA JÁ CONFIRMADA
========================================= */
/* =========================================
   EMITIR NFC-e
========================================= */

async function emitirNfce(vendaId) {

    if (!vendaId) {
        return {
            sucesso: false,
            erro: "ID da venda não informado para emissão da NFC-e"
        };
    }

    try {

        const resp = await fetch(
            `${API_ONLINE_VENDAS}/vendas/${vendaId}/emitir-nfce`,
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${pegarToken()}`
                }
            }
        );

        if (!resp.ok) {

            const mensagem =
                await extrairErroResposta(
                    resp,
                    "Erro ao emitir NFC-e"
                );

            console.error(
                `[NFC-e] Venda ${vendaId}:`,
                mensagem
            );

            return {
                sucesso: false,
                erro: mensagem
            };
        }

        const dados = await resp.json();

        console.log(
            `[NFC-e] Venda ${vendaId} emitida com sucesso:`,
            dados
        );

        return {
            sucesso: true,
            dados
        };

    } catch (erro) {

        console.error(
            `[NFC-e] Erro de conexão na venda ${vendaId}:`,
            erro
        );

        return {
            sucesso: false,
            erro:
                erro?.message ||
                "Erro de conexão ao emitir NFC-e"
        };
    }
}
/* =========================================
   FINALIZAR VENDA JÁ CONFIRMADA
========================================= */

async function finalizarVendaConfirmada({
    venda,
    vendaId,
    comandaUrl,
    atualizar
}) {

    /* =====================================
       1. CONFIRMAR VENDA
    ===================================== */

    const confirmacao =
        await confirmarVenda(vendaId);

    let erroImpressao = null;
    let erroNfce = null;
    let nfceEmitida = false;

    /* =====================================
       2. IMPRESSÃO
    ===================================== */

    if (confirmacao.imprimir === true) {

        atualizar({
            status: "imprimindo"
        });

        const resultadoImpressao =
            await imprimirComanda(
                vendaId,
                comandaUrl
            );

        if (!resultadoImpressao.sucesso) {

            erroImpressao =
                resultadoImpressao.erro;
        }
    }

    /* =====================================
       3. EMITIR NFC-e

       Só acontece quando esta venda
       foi congelada com emitirNota = true.
    ===================================== */

    if (venda.emitirNota === true) {

        atualizar({
            status: "emitindo_nfce"
        });

        const resultadoNfce =
            await emitirNfce(vendaId);

        if (resultadoNfce.sucesso) {

            nfceEmitida = true;

        } else {

            erroNfce =
                resultadoNfce.erro ||
                "Não foi possível emitir a NFC-e";
        }
    }

    /* =====================================
       4. MONTAR AVISO

       Erro fiscal NÃO transforma uma
       venda paga em venda com erro.
    ===================================== */

    const avisos = [];

    if (erroImpressao) {
        avisos.push(erroImpressao);
    }

    if (erroNfce) {
        avisos.push(
            `Venda concluída, mas a NFC-e não foi emitida: ${erroNfce}`
        );
    }

    const avisoFinal =
        avisos.length > 0
            ? avisos.join(" | ")
            : null;

    /* =====================================
       5. CONCLUÍDA
    ===================================== */

    atualizar({
        status: "concluida",

        concluidaEm:
            new Date().toISOString(),

        aviso:
            avisoFinal,

        emitirNota:
            venda.emitirNota === true,

        nfceEmitida,

        erroNfce:
            erroNfce || null
    });

    return {
        ok: true,

        vendaId,

        comandaUrl,

        aviso:
            avisoFinal,

        emitirNota:
            venda.emitirNota === true,

        nfceEmitida,

        erroNfce:
            erroNfce || null
    };
}

/* =========================================================
   DÉBITO / CRÉDITO / FLUXO RÁPIDO TRADICIONAL
========================================================= */

export async function processarVendaRapida({
    venda,
    atualizarVenda
}) {

    if (!venda) {

        throw new Error(
            "Venda rápida não informada"
        );
    }

    if (!venda.idLocal) {

        throw new Error(
            "Venda rápida sem identificador local"
        );
    }

    if (
        !venda.itens ||
        venda.itens.length === 0
    ) {

        throw new Error(
            "Venda rápida sem produtos"
        );
    }

    if (!venda.total || venda.total <= 0) {

        throw new Error(
            "Venda rápida com valor inválido"
        );
    }

    if (!venda.pagamento) {

        throw new Error(
            "Forma de pagamento não informada"
        );
    }

    const atualizar = alteracoes => {

        if (
            typeof atualizarVenda === "function"
        ) {

            atualizarVenda(
                venda.idLocal,
                alteracoes
            );
        }
    };

    try {

        /* =================================
           PROCESSANDO
        ================================= */

        atualizar({
            status: "processando",
            erro: null
        });

        /* =================================
           REGISTRAR JOGOS
        ================================= */

        await registrarJogosVenda(
            venda.itens
        );

        /* =================================
           CRIAR VENDA
        ================================= */

        const dadosVenda =
            await criarVenda(venda);

        const vendaId =
            dadosVenda.venda_id;

        const comandaUrl =
            dadosVenda.comanda || null;

        atualizar({
            vendaId,
            comandaUrl,

            statusBackend:
                dadosVenda.status || null
        });

        /* =================================
           CONFIRMAR E FINALIZAR
        ================================= */

        return await finalizarVendaConfirmada({
            venda,
            vendaId,
            comandaUrl,
            atualizar
        });

    } catch (erro) {

        console.error(
            "[VENDA RÁPIDA]",
            erro
        );

        atualizar({
            status: "erro",

            erro:
                erro?.message ||
                "Erro desconhecido ao processar venda",

            falhouEm:
                new Date().toISOString()
        });

        return {
            ok: false,

            erro:
                erro?.message ||
                "Erro desconhecido ao processar venda"
        };
    }
}


/* =========================================================
   GERAR PIX NO BACKEND
========================================================= */

async function gerarPix(valor) {

    const resp = await fetch(
        `${API_ONLINE_VENDAS}/vendas/pix/gerar`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${pegarToken()}`
            },

            body: JSON.stringify({
                valor: Number(valor)
            })
        }
    );

    if (!resp.ok) {

        const mensagem =
            await extrairErroResposta(
                resp,
                "Erro ao gerar Pix"
            );

        throw new Error(mensagem);
    }

    const dados = await resp.json();

    if (!dados.tipo) {

        throw new Error(
            "Backend retornou um Pix inválido"
        );
    }

    return dados;
}


/* =========================================================
   INICIAR PIX RÁPIDO

   IMPORTANTE:

   Esta função NÃO confirma automaticamente
   um Pix Mercado Pago.

   Ela cria a venda, gera o Pix e devolve
   os dados necessários para o modal.
========================================================= */

export async function iniciarPixRapido({
    venda,
    atualizarVenda
}) {

    if (!venda) {

        throw new Error(
            "Venda Pix não informada"
        );
    }

    if (!venda.idLocal) {

        throw new Error(
            "Venda Pix sem identificador local"
        );
    }

    if (
        !venda.itens ||
        venda.itens.length === 0
    ) {

        throw new Error(
            "Venda Pix sem produtos"
        );
    }

    if (!venda.total || venda.total <= 0) {

        throw new Error(
            "Venda Pix com valor inválido"
        );
    }

    const atualizar = alteracoes => {

        if (
            typeof atualizarVenda === "function"
        ) {

            atualizarVenda(
                venda.idLocal,
                alteracoes
            );
        }
    };

    try {

        /* =================================
           1. PREPARANDO
        ================================= */

        atualizar({
            status: "processando",
            erro: null
        });

        /* =================================
           2. REGISTRAR JOGOS
        ================================= */

        await registrarJogosVenda(
            venda.itens
        );

        /* =================================
           3. CRIAR VENDA

           A venda é criada primeiro para
           termos o venda_id correto.
        ================================= */

        const dadosVenda =
            await criarVenda({
                ...venda,
                pagamento: "pix"
            });

        const vendaId =
            dadosVenda.venda_id;

        const comandaUrl =
            dadosVenda.comanda || null;

        atualizar({
            vendaId,
            comandaUrl,

            statusBackend:
                dadosVenda.status || null
        });

        /* =================================
           4. GERAR PIX
        ================================= */

        const pix =
            await gerarPix(venda.total);

        /* =================================
           5. PIX LOCAL
        ================================= */

        if (pix.tipo === "pix_local") {

            /*
                Não existe QR Mercado Pago.

                Nesse cenário seguimos a regra
                que seu backend já possui:
                Pix local é confirmado no caixa.
            */

            atualizar({
                status: "processando",
                tipoPix: "pix_local"
            });

            return await finalizarVendaConfirmada({
                venda,
                vendaId,
                comandaUrl,
                atualizar
            });
        }

        /* =================================
           6. PIX MERCADO PAGO
        ================================= */

        if (pix.tipo === "pix_mp") {

            if (!pix.id) {

                throw new Error(
                    "Mercado Pago não retornou o ID do Pix"
                );
            }

            if (
                !pix.qr_code &&
                !pix.qr_code_base64
            ) {

                throw new Error(
                    "Mercado Pago não retornou o QR Code"
                );
            }

            /*
                MUITO IMPORTANTE:

                NÃO confirmamos a venda aqui.

                Apenas guardamos o Pix e
                devolvemos os dados para
                abrir o modal.
            */

            atualizar({
                status:
                    "aguardando_pagamento",

                tipoPix:
                    "pix_mp",

                paymentId:
                    pix.id,

                qrCode:
                    pix.qr_code || null,

                qrCodeBase64:
                    pix.qr_code_base64 || null
            });

            return {
                ok: true,

                aguardandoPagamento: true,

                tipo: "pix_mp",

                vendaLocalId:
                    venda.idLocal,

                vendaId,

                comandaUrl,

                paymentId:
                    pix.id,

                qrCode:
                    pix.qr_code || null,

                qrCodeBase64:
                    pix.qr_code_base64 || null,

                total:
                    venda.total
            };
        }

        /* =================================
           TIPO DESCONHECIDO
        ================================= */

        throw new Error(
            `Tipo de Pix não reconhecido: ${pix.tipo}`
        );

    } catch (erro) {

        console.error(
            "[PIX RÁPIDO]",
            erro
        );

        atualizar({
            status: "erro",

            erro:
                erro?.message ||
                "Erro ao iniciar Pix",

            falhouEm:
                new Date().toISOString()
        });

        return {
            ok: false,

            erro:
                erro?.message ||
                "Erro ao iniciar Pix"
        };
    }
}


/* =========================================================
   CONSULTAR STATUS DO PIX MERCADO PAGO
========================================================= */

export async function consultarStatusPixRapido(
    paymentId
) {

    if (!paymentId) {

        throw new Error(
            "ID do pagamento Pix não informado"
        );
    }

    const resp = await fetch(
        `${API_ONLINE_VENDAS}/vendas/pix/status/${paymentId}`,
        {
            headers: {
                Authorization:
                    `Bearer ${pegarToken()}`
            }
        }
    );

    if (!resp.ok) {

        const mensagem =
            await extrairErroResposta(
                resp,
                "Erro ao consultar Pix"
            );

        throw new Error(mensagem);
    }

    const dados = await resp.json();

    return {
        status:
            dados.status || "pending"
    };
}


/* =========================================================
   CONFIRMAR PIX RÁPIDO APÓS APROVAÇÃO

   Esta função só será chamada quando
   /status/{payment_id} retornar approved.
========================================================= */

export async function confirmarPixRapido({
    venda,
    vendaId,
    comandaUrl,
    atualizarVenda
}) {

    if (!venda) {

        throw new Error(
            "Venda Pix não informada"
        );
    }

    if (!venda.idLocal) {

        throw new Error(
            "Venda Pix sem identificador local"
        );
    }

    if (!vendaId) {

        throw new Error(
            "Venda Pix sem ID do backend"
        );
    }

    const atualizar = alteracoes => {

        if (
            typeof atualizarVenda === "function"
        ) {

            atualizarVenda(
                venda.idLocal,
                alteracoes
            );
        }
    };

    try {

        /* =================================
           PAGAMENTO APROVADO
        ================================= */

        atualizar({
            status: "processando",
            pixAprovado: true
        });

        /* =================================
           CONFIRMAR VENDA
        ================================= */

        return await finalizarVendaConfirmada({
            venda,
            vendaId,
            comandaUrl,
            atualizar
        });

    } catch (erro) {

        console.error(
            "[PIX RÁPIDO CONFIRMAÇÃO]",
            erro
        );

        atualizar({
            status: "erro",

            erro:
                erro?.message ||
                "Pix aprovado, mas ocorreu erro ao finalizar a venda",

            falhouEm:
                new Date().toISOString()
        });

        return {
            ok: false,

            erro:
                erro?.message ||
                "Erro ao finalizar Pix"
        };
    }
}