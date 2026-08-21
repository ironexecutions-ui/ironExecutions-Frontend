import React, { useEffect, useState } from "react";

import Passo1Loja from "./cadastro_modulos/passoloja";
import Passo2Personalizar from "./cadastro_modulos/passopersonalizar";
import Passo3Modulos from "./cadastro_modulos/passomodulos";
import Passo4Cliente from "./cadastro_modulos/passocliente";

import { API_URL } from "../config";

import "./cadastrocomercio.css";


const CACHE_CADASTRO_COMERCIO = "9sdf5sd1f654sd8gsdg58";


const ESTADO_INICIAL = {
    passo: 1,

    loja: {},

    personalizar: {},

    modulos: {
        modulos: [],
        quantidade_modulos: 0,

        valor_original: 0,

        percentual_desconto_quantidade: 0,
        valor_desconto_quantidade: 0,
        valor_apos_desconto_quantidade: 0,

        desconto_permanente: false,
        percentual_desconto_permanente: 0,
        valor_desconto_permanente: 0,

        pagamento_avulso: 0,
        adicional_contratacao: 0,

        pagamento_mensal: 0,
        mensalidade_final: 0,

        economia_mensal: 0
    },

    cliente: {}
};


export default function CadastroComercio() {

    /* =====================================================
       CARREGAR CACHE INICIAL
    ===================================================== */

    const [cadastro, setCadastro] = useState(() => {

        try {

            const salvo = localStorage.getItem(
                CACHE_CADASTRO_COMERCIO
            );

            if (!salvo) {
                return ESTADO_INICIAL;
            }

            const dados = JSON.parse(salvo);

            return {
                ...ESTADO_INICIAL,
                ...dados,

                loja: {
                    ...ESTADO_INICIAL.loja,
                    ...(dados.loja || {})
                },

                personalizar: {
                    ...ESTADO_INICIAL.personalizar,
                    ...(dados.personalizar || {})
                },

                modulos: {
                    ...ESTADO_INICIAL.modulos,
                    ...(dados.modulos || {})
                },

                cliente: {
                    ...ESTADO_INICIAL.cliente,
                    ...(dados.cliente || {})
                }
            };

        } catch (erro) {

            console.error(
                "[CADASTRO] Erro ao carregar cache:",
                erro
            );

            return ESTADO_INICIAL;
        }

    });


    /* =====================================================
       ESTADOS DERIVADOS
    ===================================================== */

    const passo = cadastro.passo;

    const dadosLoja = cadastro.loja;

    const dadosPersonalizar = cadastro.personalizar;

    const dadosModulos = cadastro.modulos;

    const dadosCliente = cadastro.cliente;


    /* =====================================================
       SALVAR CACHE AUTOMATICAMENTE
    ===================================================== */

    useEffect(() => {

        try {

            localStorage.setItem(
                CACHE_CADASTRO_COMERCIO,
                JSON.stringify(cadastro)
            );

        } catch (erro) {

            console.error(
                "[CADASTRO] Erro ao salvar cache:",
                erro
            );

        }

    }, [cadastro]);


    /* =====================================================
       ATUALIZAR CADASTRO
    ===================================================== */

    function atualizarCadastro(novosDados) {

        setCadastro(anterior => ({
            ...anterior,
            ...novosDados
        }));

    }


    /* =====================================================
       PASSO 1
       DADOS DO COMÉRCIO
    ===================================================== */

    function concluirPassoLoja(info) {

        atualizarCadastro({
            loja: info,
            passo: 2
        });

    }


    /* =====================================================
       PASSO 2
       PERSONALIZAÇÃO
    ===================================================== */

    function concluirPersonalizacao(info) {

        atualizarCadastro({
            personalizar: info,
            passo: 3
        });

    }


    function pularPersonalizacao() {

        atualizarCadastro({

            personalizar: {
                fundo: "#ffffff",
                letra_tipo: "Montserrat",
                letra_cor: "#000000"
            },

            passo: 3

        });

    }


    /* =====================================================
       PASSO 3
       MÓDULOS + PAGAMENTOS
    ===================================================== */

    function concluirModulos(info) {

        console.log(
            "[CADASTRO] Dados recebidos do Passo 3:",
            info
        );

        atualizarCadastro({
            modulos: info,
            passo: 4
        });

    }


    /* =====================================================
       FINALIZAR CADASTRO
    ===================================================== */

    async function finalizarCadastro(clienteInfo) {

        try {

            /*
             * O Passo3Modulos devolve um OBJETO:
             *
             * {
             *     modulos: [],
             *     pagamento_avulso: 300,
             *     pagamento_mensal: 52.50,
             *     ...
             * }
             */

            const listaModulos =
                Array.isArray(dadosModulos.modulos)
                    ? dadosModulos.modulos
                    : [];


            const pagamentoAvulso =
                Number(
                    dadosModulos.pagamento_avulso || 0
                );


            const pagamentoMensal =
                Number(
                    dadosModulos.pagamento_mensal || 0
                );


            /* =============================================
               CORPO ENVIADO PARA FASTAPI
            ============================================= */

            const corpo = {

                loja: dadosLoja,

                personalizar: dadosPersonalizar,

                modulos: listaModulos.map(modulo => ({
                    nome: modulo.nome
                })),

                cliente: clienteInfo,

                avulso: pagamentoAvulso,

                mensal: pagamentoMensal

            };


            console.log(
                "========================================"
            );

            console.log(
                "[CADASTRO] FINALIZANDO CADASTRO"
            );

            console.log(
                "[CADASTRO] Loja:",
                dadosLoja
            );

            console.log(
                "[CADASTRO] Personalização:",
                dadosPersonalizar
            );

            console.log(
                "[CADASTRO] Módulos completos:",
                dadosModulos
            );

            console.log(
                "[CADASTRO] Lista enviada:",
                listaModulos
            );

            console.log(
                "[CADASTRO] Pagamento avulso:",
                pagamentoAvulso
            );

            console.log(
                "[CADASTRO] Pagamento mensal:",
                pagamentoMensal
            );

            console.log(
                "[CADASTRO] Cliente:",
                clienteInfo
            );

            console.log(
                "[CADASTRO] Corpo final:",
                corpo
            );

            console.log(
                "========================================"
            );


            /* =============================================
               ENVIAR PARA BACKEND
            ============================================= */

            const resp = await fetch(
                `${API_URL}/cadastro/finalizar`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(corpo)
                }
            );


            const json = await resp.json();


            console.log(
                "[CADASTRO] STATUS:",
                resp.status
            );

            console.log(
                "[CADASTRO] RESPOSTA:",
                json
            );


            /* =============================================
               ERRO
            ============================================= */

            if (!resp.ok) {

                alert(
                    json.detail ||
                    "Erro ao finalizar cadastro"
                );

                return;

            }


            /* =============================================
               SUCESSO
            ============================================= */

            console.log(
                "[CADASTRO] Cadastro concluído."
            );

            console.log(
                "[CADASTRO] Comércio ID:",
                json.comercio_id
            );

            console.log(
                "[CADASTRO] Pagamento:",
                json.pagamento
            );


            /*
             * Só apagamos o cache depois que o backend
             * confirmar que TODO o cadastro foi concluído.
             */

            localStorage.removeItem(
                CACHE_CADASTRO_COMERCIO
            );


            alert(
                "Cadastro concluído com sucesso"
            );


            window.location.href = "/";


        } catch (erro) {

            console.error(
                "[CADASTRO] Erro ao finalizar:",
                erro
            );

            alert(
                "Não foi possível finalizar o cadastro."
            );

        }

    }


    /* =====================================================
       VOLTAR ETAPA
    ===================================================== */

    function voltarPasso() {

        setCadastro(anterior => ({

            ...anterior,

            passo: Math.max(
                1,
                anterior.passo - 1
            )

        }));

    }


    /* =====================================================
       LIMPAR CADASTRO
    ===================================================== */

    function limparCadastro() {

        const confirmar = window.confirm(
            "Deseja apagar os dados deste cadastro e começar novamente?"
        );

        if (!confirmar) {
            return;
        }

        localStorage.removeItem(
            CACHE_CADASTRO_COMERCIO
        );

        setCadastro(ESTADO_INICIAL);

    }


    /* =====================================================
       RETURN
    ===================================================== */

    return (

        <div className="cadastro-comercio-container">

            <div className="cadastro-comercio-topo">

                <div className="cadastro-comercio-topo-textos">

                    <span className="cadastro-comercio-etapa-geral">
                        CADASTRO DO SISTEMA
                    </span>

                    <h2>
                        Cadastro do Comércio
                    </h2>

                    <p>
                        Configure as informações necessárias
                        para criar o ambiente do seu comércio.
                    </p>

                </div>


                <div className="cadastro-comercio-progresso">

                    <span>
                        Etapa
                    </span>

                    <strong>
                        {passo} de 4
                    </strong>

                </div>

            </div>


            {/* =============================================
                CONTROLES
            ============================================= */}

            <div className="cadastro-comercio-controles">

                {passo > 1 && (

                    <button
                        type="button"
                        onClick={voltarPasso}
                        className="cadastro-comercio-botao-voltar"
                    >
                        ‹ Voltar
                    </button>

                )}


                <button
                    type="button"
                    onClick={limparCadastro}
                    className="cadastro-comercio-botao-limpar"
                >
                    Começar novamente
                </button>

            </div>


            {/* =============================================
                PASSO 1
            ============================================= */}

            {passo === 1 && (

                <Passo1Loja

                    dadosIniciais={dadosLoja}

                    onContinuar={concluirPassoLoja}

                />

            )}


            {/* =============================================
                PASSO 2
            ============================================= */}

            {passo === 2 && (

                <Passo2Personalizar

                    dadosIniciais={dadosPersonalizar}

                    onContinuar={concluirPersonalizacao}

                    onPular={pularPersonalizacao}

                />

            )}


            {/* =============================================
                PASSO 3
            ============================================= */}

            {passo === 3 && (

                <Passo3Modulos

                    dadosIniciais={dadosModulos}

                    onContinuar={concluirModulos}

                />

            )}


            {/* =============================================
                PASSO 4
            ============================================= */}

            {passo === 4 && (

                <Passo4Cliente

                    dadosIniciais={dadosCliente}

                    onFinalizar={finalizarCadastro}

                />

            )}

        </div>

    );

}