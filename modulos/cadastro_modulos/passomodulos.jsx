import React, { useEffect, useMemo, useState } from "react";
import "./passomodulos.css";
import { API_URL } from "../../config";

export default function Passo3Modulos({ onContinuar }) {

    const [listaModulos, setListaModulos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [
        descontoPermanente,
        setDescontoPermanente
    ] = useState(false);


    /* =====================================================
       CARREGAR MÓDULOS
    ===================================================== */

    useEffect(() => {

        async function carregarModulos() {

            try {

                setCarregando(true);
                setErro("");

                const resp = await fetch(
                    `${API_URL}/modulos/ativoss`
                );

                if (!resp.ok) {
                    throw new Error(
                        "Erro ao carregar módulos"
                    );
                }

                const dados = await resp.json();

                setListaModulos(
                    Array.isArray(dados)
                        ? dados
                        : []
                );

            } catch (err) {

                console.error(
                    "[PASSO 3 MÓDULOS] Erro:",
                    err
                );

                setErro(
                    "Não foi possível carregar os módulos disponíveis."
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarModulos();

    }, []);


    /* =====================================================
       SELECIONAR / REMOVER MÓDULO
    ===================================================== */

    function alternarSelecao(id) {

        setSelecionados(prev => {

            if (prev.includes(id)) {

                return prev.filter(
                    moduloId => moduloId !== id
                );

            }

            return [...prev, id];

        });

    }


    /* =====================================================
       FORMATAR PREÇO
    ===================================================== */

    function formatarPreco(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2
            }
        );

    }


    /* =====================================================
       MÓDULOS SELECIONADOS
    ===================================================== */

    const modulosSelecionados = useMemo(() => {

        return listaModulos.filter(
            modulo =>
                selecionados.includes(modulo.id)
        );

    }, [listaModulos, selecionados]);


    /* =====================================================
       VALOR ORIGINAL

       Soma o preço normal de todos os módulos.
    ===================================================== */

    const valorOriginal = useMemo(() => {

        return modulosSelecionados.reduce(
            (total, modulo) =>
                total + Number(modulo.preco || 0),
            0
        );

    }, [modulosSelecionados]);


    /* =====================================================
       DESCONTO POR QUANTIDADE

       1 módulo     = 0%
       2 módulos    = 15%
       3 ou mais    = 30%
    ===================================================== */

    const percentualDescontoQuantidade = useMemo(() => {

        if (selecionados.length >= 3) {
            return 30;
        }

        if (selecionados.length === 2) {
            return 15;
        }

        return 0;

    }, [selecionados]);


    /* =====================================================
       VALOR DO DESCONTO POR QUANTIDADE
    ===================================================== */

    const valorDescontoQuantidade =
        valorOriginal *
        (percentualDescontoQuantidade / 100);


    /* =====================================================
       VALOR DEPOIS DO DESCONTO POR QUANTIDADE
    ===================================================== */

    const valorDepoisDescontoQuantidade =
        valorOriginal - valorDescontoQuantidade;


    /* =====================================================
       DESCONTO PERMANENTE

       Caso o cliente escolha pagar R$ 100 adicionais
       por módulo na contratação, recebe mais 50%
       de desconto permanentemente.
    ===================================================== */

    const percentualDescontoPermanente =
        descontoPermanente ? 50 : 0;


    const valorDescontoPermanente =
        descontoPermanente
            ? valorDepoisDescontoQuantidade * 0.50
            : 0;


    /* =====================================================
       MENSALIDADE FINAL
    ===================================================== */

    const valorMensalFinal =
        valorDepoisDescontoQuantidade -
        valorDescontoPermanente;


    /* =====================================================
       ADICIONAL DA CONTRATAÇÃO

       R$ 100 por módulo.
    ===================================================== */

    const valorAdicionalContratacao =
        descontoPermanente
            ? selecionados.length * 100
            : 0;


    /* =====================================================
       ECONOMIA MENSAL TOTAL
    ===================================================== */

    const economiaMensal =
        valorOriginal - valorMensalFinal;


    /* =====================================================
       PERCENTUAL EFETIVO DE ECONOMIA
    ===================================================== */

    const percentualEconomiaEfetiva =
        valorOriginal > 0
            ? (
                (economiaMensal / valorOriginal) *
                100
            )
            : 0;


    /* =====================================================
       CONTINUAR
    ===================================================== */

    function confirmar() {

        if (selecionados.length === 0) {

            setErro(
                "Selecione pelo menos um módulo para continuar."
            );

            return;

        }

        setErro("");

        onContinuar({

            modulos: modulosSelecionados,

            quantidade_modulos:
                selecionados.length,

            valor_original:
                Number(valorOriginal.toFixed(2)),

            percentual_desconto_quantidade:
                percentualDescontoQuantidade,

            valor_desconto_quantidade:
                Number(
                    valorDescontoQuantidade.toFixed(2)
                ),

            valor_apos_desconto_quantidade:
                Number(
                    valorDepoisDescontoQuantidade.toFixed(2)
                ),

            desconto_permanente:
                descontoPermanente,

            percentual_desconto_permanente:
                percentualDescontoPermanente,

            valor_desconto_permanente:
                Number(
                    valorDescontoPermanente.toFixed(2)
                ),

            adicional_contratacao:
                Number(
                    valorAdicionalContratacao.toFixed(2)
                ),

            mensalidade_final:
                Number(
                    valorMensalFinal.toFixed(2)
                ),

            economia_mensal:
                Number(
                    economiaMensal.toFixed(2)
                )

        });

    }


    return (

        <section className="passo3-modulos-painel">

            {/* =============================================
                CABEÇALHO
            ============================================= */}

            <header className="passo3-modulos-cabecalho">

                <div className="passo3-modulos-cabecalho-textos">

                    <span className="passo3-modulos-etapa">
                        CONFIGURAÇÃO DO SISTEMA
                    </span>

                    <h3 className="passo3-modulos-titulo">
                        Escolha os módulos
                    </h3>

                    <p className="passo3-modulos-subtitulo">
                        Selecione as áreas que deseja utilizar
                        no seu comércio. A mensalidade será
                        calculada automaticamente conforme
                        sua escolha.
                    </p>

                </div>

                <div className="passo3-modulos-etapa-indicador">

                    <span>
                        Etapa
                    </span>

                    <strong>
                        3 de 4
                    </strong>

                </div>

            </header>


            {/* =============================================
                INFORMAÇÃO DE DESCONTOS
            ============================================= */}

            <div className="passo3-modulos-informativo">

                <div className="passo3-modulos-informativo-icone">
                    %
                </div>

                <div className="passo3-modulos-informativo-texto">

                    <strong>
                        Quanto mais módulos, maior o desconto
                    </strong>

                    <span>
                        Escolhendo 2 módulos você recebe
                        15% de desconto. Com 3 ou mais módulos,
                        o desconto passa para 30%.
                    </span>

                </div>

            </div>


            {/* =============================================
                ERRO
            ============================================= */}

            {erro && (

                <div className="passo3-modulos-erro">

                    <strong>
                        Atenção
                    </strong>

                    <span>
                        {erro}
                    </span>

                </div>

            )}


            {/* =============================================
                CARREGAMENTO
            ============================================= */}

            {carregando ? (

                <div className="passo3-modulos-carregando">

                    <div className="passo3-modulos-loader" />

                    <span>
                        Buscando módulos disponíveis...
                    </span>

                </div>

            ) : (

                <>

                    {/* =====================================
                        GRID DOS MÓDULOS
                    ===================================== */}

                    <div className="passo3-modulos-grid">

                        {listaModulos.map(modulo => {

                            const ativo =
                                selecionados.includes(
                                    modulo.id
                                );

                            return (

                                <button
                                    key={modulo.id}
                                    type="button"
                                    onClick={() =>
                                        alternarSelecao(
                                            modulo.id
                                        )
                                    }
                                    className={
                                        `passo3-modulos-card ${
                                            ativo
                                                ? "passo3-modulos-card-ativo"
                                                : ""
                                        }`
                                    }
                                >

                                    <div className="passo3-modulos-check">
                                        {ativo ? "✓" : ""}
                                    </div>

                                    <div className="passo3-modulos-card-topo">

                                        <span className="passo3-modulos-card-label">
                                            MÓDULO
                                        </span>

                                        <h4 className="passo3-modulos-card-nome">
                                            {modulo.nome}
                                        </h4>

                                    </div>

                                    <p className="passo3-modulos-card-texto">

                                        {modulo.texto ||
                                            "Recursos adicionais para o seu comércio."}

                                    </p>

                                    <div className="passo3-modulos-card-rodape">

                                        <div className="passo3-modulos-card-preco-area">

                                            <span>
                                                Mensalidade
                                            </span>

                                            <strong>
                                                {formatarPreco(
                                                    modulo.preco
                                                )}
                                            </strong>

                                        </div>

                                        <span className="passo3-modulos-card-status">

                                            {ativo
                                                ? "Selecionado"
                                                : "Selecionar"}

                                        </span>

                                    </div>

                                </button>

                            );

                        })}

                    </div>


                    {/* =====================================
                        DESCONTO PERMANENTE
                    ===================================== */}

                    {selecionados.length > 0 && (

                        <div className="passo3-modulos-permanente">

                            <button
                                type="button"
                                onClick={() =>
                                    setDescontoPermanente(
                                        prev => !prev
                                    )
                                }
                                className={
                                    `passo3-modulos-permanente-opcao ${
                                        descontoPermanente
                                            ? "passo3-modulos-permanente-opcao-ativa"
                                            : ""
                                    }`
                                }
                            >

                                <div className="passo3-modulos-permanente-check">

                                    {descontoPermanente
                                        ? "✓"
                                        : ""}

                                </div>

                                <div className="passo3-modulos-permanente-conteudo">

                                    <span className="passo3-modulos-permanente-etiqueta">
                                        OPÇÃO DE ECONOMIA
                                    </span>

                                    <strong>
                                        Receba 50% de desconto permanente
                                    </strong>

                                    <p>
                                        Pague R$ 100 adicionais uma
                                        única vez por módulo contratado
                                        e receba mais 50% de desconto
                                        permanentemente nas mensalidades.
                                    </p>

                                    <div className="passo3-modulos-permanente-valores">

                                        <span>
                                            Adicional na contratação
                                        </span>

                                        <strong>
                                            {formatarPreco(
                                                selecionados.length *
                                                100
                                            )}
                                        </strong>

                                    </div>

                                    {descontoPermanente && (

                                        <div className="passo3-modulos-permanente-ativo-texto">

                                            Benefício ativado para
                                            esta contratação

                                        </div>

                                    )}

                                </div>

                            </button>

                        </div>

                    )}


                    {/* =====================================
                        RESUMO
                    ===================================== */}

                    <div className="passo3-modulos-resumo">

                        <div className="passo3-modulos-resumo-esquerda">

                            <span className="passo3-modulos-resumo-label">
                                SUA CONFIGURAÇÃO
                            </span>

                            <strong className="passo3-modulos-resumo-quantidade">

                                {selecionados.length === 0
                                    ? "Nenhum módulo selecionado"
                                    : `${selecionados.length} ${
                                        selecionados.length === 1
                                            ? "módulo selecionado"
                                            : "módulos selecionados"
                                    }`}

                            </strong>

                            {selecionados.length > 0 && (

                                <div className="passo3-modulos-resumo-nomes">

                                    {modulosSelecionados.map(
                                        modulo => (

                                            <span key={modulo.id}>
                                                {modulo.nome}
                                            </span>

                                        )
                                    )}

                                </div>

                            )}

                            {descontoPermanente && (

                                <div className="passo3-modulos-resumo-beneficio">

                                    <strong>
                                        50% permanente ativo
                                    </strong>

                                    <span>
                                        Aplicado após o desconto
                                        por quantidade.
                                    </span>

                                </div>

                            )}

                        </div>


                        {/* =================================
                            VALORES
                        ================================= */}

                        <div className="passo3-modulos-resumo-valores">

                            {selecionados.length > 0 && (

                                <div className="passo3-modulos-resumo-linha">

                                    <span>
                                        Valor dos módulos
                                    </span>

                                    <strong>
                                        {formatarPreco(
                                            valorOriginal
                                        )}
                                    </strong>

                                </div>

                            )}


                            {percentualDescontoQuantidade > 0 && (

                                <div className="passo3-modulos-resumo-linha passo3-modulos-resumo-desconto">

                                    <span>
                                        Desconto por quantidade (
                                        {percentualDescontoQuantidade}%)
                                    </span>

                                    <strong>
                                        - {formatarPreco(
                                            valorDescontoQuantidade
                                        )}
                                    </strong>

                                </div>

                            )}


                            {descontoPermanente && (

                                <div className="passo3-modulos-resumo-linha passo3-modulos-resumo-desconto">

                                    <span>
                                        Desconto permanente (50%)
                                    </span>

                                    <strong>
                                        - {formatarPreco(
                                            valorDescontoPermanente
                                        )}
                                    </strong>

                                </div>

                            )}


                            {descontoPermanente && (

                                <div className="passo3-modulos-resumo-linha passo3-modulos-resumo-adicional">

                                    <span>
                                        Adicional na contratação
                                    </span>

                                    <strong>
                                        {formatarPreco(
                                            valorAdicionalContratacao
                                        )}
                                    </strong>

                                </div>

                            )}


                            {economiaMensal > 0 && (

                                <div className="passo3-modulos-resumo-economia">

                                    <span>
                                        Sua economia mensal
                                    </span>

                                    <strong>
                                        {formatarPreco(
                                            economiaMensal
                                        )}
                                    </strong>

                                    {descontoPermanente && (
                                        <small>
                                            Economia total de aproximadamente{" "}
                                            {percentualEconomiaEfetiva.toFixed(0)}%
                                            {" "}sobre o valor original
                                        </small>
                                    )}

                                </div>

                            )}


                            <div className="passo3-modulos-resumo-total">

                                <span>
                                    Sua mensalidade
                                </span>

                                <div>

                                    <strong>
                                        {formatarPreco(
                                            valorMensalFinal
                                        )}
                                    </strong>

                                    <small>
                                        / mês
                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        FINALIZAÇÃO
                    ===================================== */}

                    <div className="passo3-modulos-finalizacao">

                        <div className="passo3-modulos-finalizacao-info">

                            <div className="passo3-modulos-finalizacao-numero">
                                {selecionados.length}
                            </div>

                            <div>

                                <strong>
                                    Revise sua seleção
                                </strong>

                                <span>

                                    {selecionados.length === 0
                                        ? "Selecione pelo menos um módulo para continuar."
                                        : `Sua mensalidade atual é de ${formatarPreco(valorMensalFinal)}.`}

                                </span>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={
                                selecionados.length === 0
                            }
                            className="passo3-modulos-botao-continuar"
                        >

                            <span>
                                Continuar cadastro
                            </span>

                            <strong>
                                ›
                            </strong>

                        </button>

                    </div>

                </>

            )}

        </section>

    );

}