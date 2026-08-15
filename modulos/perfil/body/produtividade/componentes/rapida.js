import React from "react";
import { API_URL } from "../../../../../config";

/* =========================================
   CONFIGURAÇÕES
========================================= */

const API_ONLINE_VENDAS = API_URL;
const API_LOCAL = "http://localhost:8888";

/* =========================================
   DESCOBRIR SE A API LOCAL ESTÁ DISPONÍVEL

   Usada somente para recursos locais,
   principalmente impressão.
========================================= */

async function descobrirApiLocal() {
    try {
        const resp = await fetch(`${API_LOCAL}/health`, {
            method: "GET"
        });

        if (resp.ok) {
            return true;
        }

        return false;

    } catch {
        return false;
    }
}

/* =========================================
   REGISTRAR JOGOS

   Mantém a mesma regra que existe no
   ModalPagamento.
========================================= */

async function registrarJogosVenda(itens) {

    if (!itens || itens.length === 0) {
        return;
    }

    const jogos = itens.filter(item =>
        item.nome &&
        item.nome.toLowerCase().includes("jogos")
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
        await fetch(`${API_URL}/jogos/registrar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                quantos: totalJogos
            })
        });

    } catch (erro) {
        /*
            Mantemos o comportamento não bloqueante
            que já existe no fluxo tradicional.

            Falha ao registrar jogos não impede
            a venda principal.
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

    const token = localStorage.getItem("token");

    const resp = await fetch(
        `${API_ONLINE_VENDAS}/vendas/finalizar`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                pagamento: venda.pagamento,
                valor: venda.total,
                produtos: venda.itens,

                /*
                    Venda rápida inicialmente
                    será sem CPF.

                    Quando precisar CPF,
                    o fluxo tradicional continua
                    disponível.
                */
                cpf: null,

                /*
                    Mantemos o mesmo campo que
                    o ModalPagamento envia.
                */
                forcar_manual: false
            })
        }
    );

    if (!resp.ok) {

        let mensagem = "Erro ao criar venda";

        try {
            const dadosErro = await resp.json();

            mensagem =
                dadosErro.detail ||
                dadosErro.error ||
                mensagem;

        } catch {
            // resposta não era JSON
        }

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

    const token = localStorage.getItem("token");

    const resp = await fetch(
        `${API_ONLINE_VENDAS}/vendas/${vendaId}/confirmar`,
        {
            method: "POST",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    /*
        Seu fluxo atual considera 409 aceitável.

        Vamos manter a mesma regra.
    */

    if (!resp.ok && resp.status !== 409) {

        let mensagem =
            "Erro ao confirmar pagamento";

        try {
            const dadosErro = await resp.json();

            mensagem =
                dadosErro.detail ||
                dadosErro.error ||
                mensagem;

        } catch {
            // resposta não era JSON
        }

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
            erro: "API local de impressão indisponível"
        };
    }

    try {

        /*
            Mantemos a chamada que o seu
            ModalPagamento atual utiliza.

            Seu serviço local responsável pela
            venda/impressão pode continuar
            tratando esse endpoint.
        */

        const resp = await fetch(
            `${API_LOCAL}/imprimir`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
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
                erro: "Erro ao imprimir comanda"
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
            erro: "Erro de conexão com a impressora"
        };
    }
}

/* =========================================
   MOTOR PRINCIPAL DA VENDA RÁPIDA
========================================= */

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

    if (!venda.itens || venda.itens.length === 0) {
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

    const atualizar = (alteracoes) => {

        if (typeof atualizarVenda === "function") {
            atualizarVenda(
                venda.idLocal,
                alteracoes
            );
        }
    };

    try {

        /* =================================
           1. PROCESSANDO
        ================================= */

        atualizar({
            status: "processando",
            erro: null
        });

        /* =================================
           2. REGISTRAR JOGOS
        ================================= */

        await registrarJogosVenda(venda.itens);

        /* =================================
           3. CRIAR VENDA
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
           4. CONFIRMAR PAGAMENTO
        ================================= */

        const confirmacao =
            await confirmarVenda(vendaId);

        /* =================================
           5. IMPRESSÃO

           Só imprime quando o backend
           informar imprimir === true.
        ================================= */

        let erroImpressao = null;

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

        /* =================================
           6. VENDA CONCLUÍDA

           Falha de impressão NÃO transforma
           uma venda confirmada em venda
           financeira com erro.
        ================================= */

        atualizar({
            status: "concluida",
            concluidaEm:
                new Date().toISOString(),

            aviso:
                erroImpressao || null
        });

        return {
            ok: true,
            vendaId,
            comandaUrl,
            aviso: erroImpressao
        };

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