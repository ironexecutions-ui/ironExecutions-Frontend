
import React, { useEffect, useState } from "react";
import "./explicacaomodulos.css";
import { API_URL } from "../../config";

export default function ExplicacaoModulos() {
    const [modulos, setModulos] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;

        async function carregarModulos() {
            try {
                setCarregando(true);
                setErro("");

                const resp = await fetch(
                    `${API_URL}/modulos/ativos/publico`,
                    { cache: "no-store" }
                );

                if (!resp.ok) {
                    throw new Error("Erro ao carregar módulos");
                }

                const dados = await resp.json();

                if (ativo) {
                    setModulos(Array.isArray(dados) ? dados : []);
                }
            } catch (err) {
                console.error("[MÓDULOS PÚBLICOS]", err);

                if (ativo) {
                    setErro("Não foi possível carregar os módulos.");
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarModulos();

        return () => {
            ativo = false;
        };
    }, []);

    /* =========================================
       TIPO DO MÓDULO
    ========================================= */

    function obterTipoModulo(modulo) {
        const nome = String(modulo.nome || "")
            .trim()
            .toLowerCase();

        if (nome.includes("produtividade")) {
            return "caixa";
        }

        if (nome.includes("administra")) {
            return "gestao";
        }

        if (nome.includes("fiscal")) {
            return "fiscal";
        }

        return "padrao";
    }

    /* =========================================
       ÍCONE DO MÓDULO
    ========================================= */

    function obterIconeModulo(modulo) {
        const tipo = obterTipoModulo(modulo);

        if (tipo === "caixa") return "▣";
        if (tipo === "gestao") return "◫";
        if (tipo === "fiscal") return "✓";

        return "◆";
    }

    /* =========================================
       IDENTIFICAR TAXAS PERCENTUAIS
    ========================================= */

    function formatarPreco(valor) {
        const preco = String(valor ?? "").trim();

        if (preco.includes("%")) {
            return {
                valor: preco,
                complemento: "do faturamento",
                porcentagem: true
            };
        }

        return {
            valor: "",
            complemento: "",
            porcentagem: false
        };
    }

    /* =========================================
       MÓDULOS VISÍVEIS
       Mantém o critério original da API.
    ========================================= */

    const modulosVisiveis = modulos.filter((modulo) => {
        const preco = String(modulo.preco ?? "").trim();

        if (preco.includes("%")) {
            return (
                parseFloat(
                    preco.replace("%", "").replace(",", ".")
                ) >= 1
            );
        }

        return Number(preco.replace(",", ".")) >= 1;
    });

    return (
        <section className="exp-modulos-premium">

            {/* CABEÇALHO */}

            <header className="exp-modulos-premium__cabecalho">
                <span className="exp-modulos-premium__mini-titulo">
                    MÓDULOS
                </span>

                <h2 className="exp-modulos-premium__titulo">
                    Tudo o que seu comércio precisa
                </h2>

                <p className="exp-modulos-premium__subtitulo">
                    Conheça os recursos disponíveis para organizar
                    e melhorar a operação do seu comércio.
                </p>
            </header>

            {/* ERRO */}

            {erro && (
                <div className="exp-modulos-premium__erro" role="alert">
                    {erro}
                </div>
            )}

            {/* MÓDULOS */}

            {carregando ? (
                <div
                    className="exp-modulos-premium__carregando"
                    role="status"
                >
                    <div className="exp-modulos-premium__loader" />
                    <span>Carregando módulos...</span>
                </div>
            ) : (
                <div className="exp-modulos-premium__grade">
                    {modulosVisiveis.map((modulo) => {
                        const tipo = obterTipoModulo(modulo);
                        const precoFormatado = formatarPreco(
                            modulo.preco
                        );

                        return (
                            <div
                                key={modulo.id}
                                className={`exp-modulos-premium__card exp-modulos-premium__card--${tipo}`}
                            >
                                <div className="exp-modulos-premium__card-topo">
                                    <div className="exp-modulos-premium__icone">
                                        {obterIconeModulo(modulo)}
                                    </div>

                                    <span className="exp-modulos-premium__disponivel">
                                        Disponível
                                    </span>
                                </div>

                                <div className="exp-modulos-premium__conteudo">
                                    <h3 className="exp-modulos-premium__nome">
                                        {modulo.nome}
                                    </h3>

                                    <p className="exp-modulos-premium__descricao">
                                        {modulo.texto}
                                    </p>
                                </div>

                                {/* Exibe somente taxas percentuais */}

                                {precoFormatado.porcentagem && (
                                    <div className="exp-modulos-premium__preco">
                                        <div className="exp-modulos-premium__preco-texto">
                                            <span>Taxa</span>

                                            <div>
                                                <strong>
                                                    {precoFormatado.valor}
                                                </strong>

                                                <small>
                                                    {precoFormatado.complemento}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PLANO E CONDIÇÕES DE PAGAMENTO */}

            <section
                className="exp-modulos-premium__oferta"
                aria-labelledby="exp-modulos-plano-titulo"
            >
                <div className="exp-modulos-premium__oferta-cabecalho">
                    <span className="exp-modulos-premium__oferta-mini">
                        PLANO COMPLETO
                    </span>

                    <h3 id="exp-modulos-plano-titulo">
                        Primeiro use. Depois pague.
                    </h3>

                    <p className="exp-modulos-premium__oferta-descricao">
                        Utilize os recursos do sistema no seu comércio
                        antes de realizar o pagamento da mensalidade.
                    </p>

                    <div className="exp-modulos-premium__preco-unico">
                        <strong>R$ 98,87</strong>
                        <span>por mês</span>
                    </div>
                </div>

                {/* REGRA DE PAGAMENTO */}

                <div className="exp-modulos-premium__regra-pagamento">
                    <span className="exp-modulos-premium__regra-icone">
                        ✓
                    </span>

                    <div className="exp-modulos-premium__regra-conteudo">
                        <strong>Primeiro usa, depois paga</strong>

                        <p>
                            Você pode começar a utilizar o sistema antes
                            de realizar o pagamento. Após o cadastro,
                            nossa equipe entrará em contato para orientar
                            sobre as condições e as instruções de pagamento.
                        </p>
                    </div>
                </div>

                {/* TAXAS PERCENTUAIS */}

                <div className="exp-modulos-premium__taxas-aviso">
                    <strong>Importante sobre as taxas</strong>

                    <p>
                        A mensalidade é de R$ 98,87 por mês. Os módulos
                        que exibem uma porcentagem possuem essa cobrança
                        adicional, conforme indicado em cada módulo.
                    </p>
                </div>
            </section>
        </section>
    );
}
