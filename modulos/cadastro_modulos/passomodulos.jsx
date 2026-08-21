import React, { useEffect, useMemo, useState } from "react";
import "./passomodulos.css";
import { API_URL } from "../../config";

export default function Passo3Modulos({ onContinuar }) {
    const [listaModulos, setListaModulos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    /* =====================================================
       CARREGAR MÓDULOS
    ===================================================== */
    useEffect(() => {
        async function carregarModulos() {
            try {
                setCarregando(true);
                setErro("");

                const resp = await fetch(`${API_URL}/modulos/ativoss`);

                if (!resp.ok) {
                    throw new Error("Erro ao carregar módulos");
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
       SELECIONAR / REMOVER
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
                currency: "BRL"
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

       1 módulo = 0%
       2 módulos = 15%
       3 ou mais = 30%
    ===================================================== */
    const percentualDesconto = useMemo(() => {
        if (selecionados.length >= 3) {
            return 30;
        }

        if (selecionados.length === 2) {
            return 15;
        }

        return 0;
    }, [selecionados]);

    /* =====================================================
       VALOR DO DESCONTO
    ===================================================== */
    const valorDesconto =
        valorOriginal * (percentualDesconto / 100);

    const valorMensal =
        valorOriginal - valorDesconto;

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

        onContinuar(modulosSelecionados);
    }

    return (
        <section className="passo3-modulos-painel">

            {/* =================================================
                CABEÇALHO
            ================================================= */}
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
                        no seu comércio. Você poderá configurar
                        os recursos de acordo com a necessidade
                        da sua operação.
                    </p>
                </div>

                <div className="passo3-modulos-etapa-indicador">
                    <span>Etapa</span>
                    <strong>3 de 4</strong>
                </div>

            </header>

            {/* =================================================
                INFORMAÇÃO
            ================================================= */}
            <div className="passo3-modulos-informativo">

                <div className="passo3-modulos-informativo-icone">
                    %
                </div>

                <div className="passo3-modulos-informativo-texto">
                    <strong>
                        Quanto mais módulos, maior o desconto
                    </strong>

                    <span>
                        Escolhendo 2 módulos você recebe 15% de
                        desconto. Com 3 ou mais módulos, o
                        desconto passa para 30%.
                    </span>
                </div>

            </div>

            {/* =================================================
                ERRO
            ================================================= */}
            {erro && (
                <div className="passo3-modulos-erro">
                    <strong>Atenção</strong>
                    <span>{erro}</span>
                </div>
            )}

            {/* =================================================
                CARREGAMENTO
            ================================================= */}
            {carregando ? (

                <div className="passo3-modulos-carregando">
                    <div className="passo3-modulos-loader" />

                    <span>
                        Buscando módulos disponíveis...
                    </span>
                </div>

            ) : (

                <>
                    {/* =========================================
                        GRID DOS MÓDULOS
                    ========================================= */}
                    <div className="passo3-modulos-grid">

                        {listaModulos.map(modulo => {
                            const ativo =
                                selecionados.includes(modulo.id);

                            return (
                                <button
                                    key={modulo.id}
                                    type="button"
                                    onClick={() =>
                                        alternarSelecao(modulo.id)
                                    }
                                    className={
                                        `passo3-modulos-card ${
                                            ativo
                                                ? "passo3-modulos-card-ativo"
                                                : ""
                                        }`
                                    }
                                >

                                    {/* CHECK */}
                                    <div className="passo3-modulos-check">
                                        {ativo ? "✓" : ""}
                                    </div>

                                    {/* CABEÇALHO CARD */}
                                    <div className="passo3-modulos-card-topo">

                                        <span className="passo3-modulos-card-label">
                                            MÓDULO
                                        </span>

                                        <h4 className="passo3-modulos-card-nome">
                                            {modulo.nome}
                                        </h4>

                                    </div>

                                    {/* DESCRIÇÃO */}
                                    <p className="passo3-modulos-card-texto">
                                        {modulo.texto ||
                                            "Recursos adicionais para o seu comércio."}
                                    </p>

                                    {/* PREÇO */}
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

                    {/* =========================================
                        RESUMO
                    ========================================= */}
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
                                    }`
                                }
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

                        </div>

                        <div className="passo3-modulos-resumo-valores">

                            {percentualDesconto > 0 && (
                                <>
                                    <div className="passo3-modulos-resumo-linha">
                                        <span>Valor original</span>

                                        <strong>
                                            {formatarPreco(valorOriginal)}
                                        </strong>
                                    </div>

                                    <div className="passo3-modulos-resumo-linha passo3-modulos-resumo-desconto">
                                        <span>
                                            Desconto de {percentualDesconto}%
                                        </span>

                                        <strong>
                                            - {formatarPreco(valorDesconto)}
                                        </strong>
                                    </div>
                                </>
                            )}

                            <div className="passo3-modulos-resumo-total">
                                <span>
                                    Mensalidade
                                </span>

                                <div>
                                    <strong>
                                        {formatarPreco(valorMensal)}
                                    </strong>

                                    <small>/ mês</small>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* =========================================
                        CONTINUAR
                    ========================================= */}
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
                                    Você poderá continuar após
                                    selecionar pelo menos um módulo.
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={confirmar}
                            className="passo3-modulos-botao-continuar"
                        >
                            <span>
                                Continuar cadastro
                            </span>

                            <strong>›</strong>
                        </button>

                    </div>
                </>
            )}

        </section>
    );
}