
import React, { useEffect, useState } from "react";
import "./parceiros.css";
import { API_URL } from "../../config";

export default function Parceiros() {
    const [parceiros, setParceiros] = useState(null);
    const [detalhesAbertos, setDetalhesAbertos] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function carregarParceiros() {
            try {
                const resposta = await fetch(
                    `${API_URL}/cadastrados/parceiros`,
                    { cache: "no-store" }
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao carregar parceiros.");
                }

                const dados = await resposta.json();

                if (ativo) {
                    setParceiros(Array.isArray(dados) ? dados : []);
                }
            } catch (erro) {
                console.error(
                    "[PARCEIROS IRON EXECUTIONS] Erro:",
                    erro
                );

                if (ativo) {
                    setParceiros([]);
                }
            }
        }

        carregarParceiros();

        return () => {
            ativo = false;
        };
    }, []);

    function imagemErro(evento) {
        evento.currentTarget.style.display = "none";

        const placeholder =
            evento.currentTarget.parentElement?.querySelector(
                ".iron-parceiros-logo-placeholder"
            );

        if (placeholder) {
            placeholder.style.display = "flex";
        }
    }

    if (!parceiros || parceiros.length === 0) {
        return null;
    }

    return (
        <section
            className="iron-parceiros-container"
            aria-labelledby="iron-parceiros-titulo"
        >
            <header className="iron-parceiros-cabecalho">
                <span className="iron-parceiros-etiqueta">
                    NOSSA REDE
                </span>

                <h2
                    id="iron-parceiros-titulo"
                    className="iron-parceiros-titulo"
                >
                    Lojas parceiras
                </h2>

                <p className="iron-parceiros-subtitulo">
                    Conheça os comércios que fazem parte da rede
                    de parceiros da Iron Executions.
                </p>
            </header>

            <ul className="iron-parceiros-lista">
                {parceiros.map((parceiro) => (
                    <li
                        key={parceiro.id}
                        className="iron-parceiros-card"
                    >
                        <div className="iron-parceiros-logo-fundo">
                            {parceiro.imagem && (
                                <img
                                    src={parceiro.imagem}
                                    alt={`Logo de ${parceiro.loja || "parceiro"}`}
                                    className="iron-parceiros-logo"
                                    loading="lazy"
                                    onError={imagemErro}
                                />
                            )}

                            <div
                                className="iron-parceiros-logo-placeholder"
                                style={{
                                    display: parceiro.imagem
                                        ? "none"
                                        : "flex",
                                }}
                            >
                                {parceiro.loja
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                            </div>
                        </div>

                        <div className="iron-parceiros-info">
                            <h3 className="iron-parceiros-nome">
                                {parceiro.loja}
                            </h3>

                            <span className="iron-parceiros-status-texto">
                                <span className="iron-parceiros-status-ponto" />
                                Parceiro oficial
                            </span>
                        </div>

                        <span
                            className="iron-parceiros-selo"
                            title="Parceiro da Iron Executions"
                            aria-label="Parceiro da Iron Executions"
                        >
                            ✓
                        </span>
                    </li>
                ))}
            </ul>

            <div className="iron-parceiros-mais-area">
                <button
                    type="button"
                    className="iron-parceiros-mais-botao"
                    onClick={() =>
                        setDetalhesAbertos((aberto) => !aberto)
                    }
                    aria-expanded={detalhesAbertos}
                    aria-controls="iron-parceiros-detalhes"
                >
                    <span>
                        {detalhesAbertos
                            ? "Fechar explicação"
                            : "Como funciona o programa?"}
                    </span>

                    <span
                        className={`iron-parceiros-mais-seta ${detalhesAbertos ? "aberta" : ""
                            }`}
                        aria-hidden="true"
                    >
                        ↓
                    </span>
                </button>
            </div>

            {detalhesAbertos && (
                <div
                    id="iron-parceiros-detalhes"
                    className="iron-parceiros-detalhes"
                >
                    <header className="iron-parceiros-detalhes-cabecalho">
                        <span className="iron-parceiros-detalhes-etiqueta">
                            PROGRAMA DE PARCEIROS
                        </span>

                        <h3>
                            Indique lojistas. Ganhe mensalmente.
                        </h3>

                        <p>
                            Você indica novos lojistas para a Iron
                            Executions e pode receber uma remuneração
                            mensal pela atividade deles na plataforma.
                            Veja como funciona.
                        </p>
                    </header>

                    <div className="iron-parceiros-etapas">
                        <article className="iron-parceiros-etapa">
                            <span className="iron-parceiros-etapa-numero">
                                01
                            </span>

                            <div>
                                <h4>Receba seu link e QR Code</h4>

                                <p>
                                    Depois de aprovado como parceiro,
                                    você terá um link exclusivo e um
                                    QR Code próprio para compartilhar
                                    com os lojistas.
                                </p>
                            </div>
                        </article>

                        <article className="iron-parceiros-etapa">
                            <span className="iron-parceiros-etapa-numero">
                                02
                            </span>

                            <div>
                                <h4>Compartilhe com uma loja</h4>

                                <p>
                                    Envie o link pelo WhatsApp ou mostre
                                    seu QR Code. O lojista acessa,
                                    realiza o cadastro e aguarda a
                                    aprovação da Iron Executions.
                                </p>
                            </div>
                        </article>

                        <article className="iron-parceiros-etapa">
                            <span className="iron-parceiros-etapa-numero">
                                03
                            </span>

                            <div>
                                <h4>A indicação fica registrada</h4>

                                <p>
                                    O cadastro feito pelo seu link ou
                                    QR Code permite identificar a
                                    indicação. Depois disso, o sistema
                                    acompanha a atividade do lojista,
                                    sem você precisar fazer um registro
                                    manual.
                                </p>

                                <p className="iron-parceiros-observacao">
                                    Lojistas que já estavam cadastrados
                                    não contam como novas indicações.
                                </p>
                            </div>
                        </article>
                    </div>

                    <section className="iron-parceiros-remuneracao">
                        <span className="iron-parceiros-remuneracao-etiqueta">
                            SUA REMUNERAÇÃO
                        </span>

                        <h4>Quanto você pode receber?</h4>

                        <p className="iron-parceiros-remuneracao-intro">
                            Para cada lojista indicado, aprovado e
                            elegível, você recebe o maior destes valores:
                        </p>

                        <div className="iron-parceiros-valores">
                            <div className="iron-parceiros-valor-card">
                                <span>Valor mínimo mensal</span>
                                <strong>R$ 20,00</strong>
                                <small>Por lojista indicado elegível</small>
                            </div>

                            <div className="iron-parceiros-valor-ou">
                                OU
                            </div>

                            <div className="iron-parceiros-valor-card">
                                <span>Comissão sobre fretes</span>
                                <strong>10%</strong>
                                <small>
                                    Do valor dos fretes elegíveis
                                    utilizados pelo lojista
                                </small>
                            </div>
                        </div>

                        <div className="iron-parceiros-exemplo">
                            <span className="iron-parceiros-exemplo-titulo">
                                EXEMPLO PRÁTICO
                            </span>

                            <p>
                                Se o lojista utilizar R$ 300,00 em fretes
                                elegíveis durante o mês, 10% corresponde
                                a <strong>R$ 30,00</strong>. Como esse
                                valor supera R$ 20,00, a remuneração
                                será de R$ 30,00 nesse exemplo.
                            </p>
                        </div>

                        <div className="iron-parceiros-pagamento">
                            <span
                                className="iron-parceiros-pagamento-icone"
                                aria-hidden="true"
                            >
                                $
                            </span>

                            <div>
                                <strong>Pagamento todo mês via Pix</strong>
                                <p>
                                    Você recebe o valor devido
                                    mensalmente, sem precisar acumular
                                    um saldo mínimo para receber.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="iron-parceiros-duvidas">
                        <article className="iron-parceiros-duvida">
                            <span className="iron-parceiros-duvida-icone">
                                ✓
                            </span>

                            <div>
                                <h4>Por quanto tempo recebo?</h4>

                                <p>
                                    Enquanto o lojista indicado
                                    permanecer ativo e cumprir as
                                    regras do programa de parceiros.
                                </p>
                            </div>
                        </article>

                        <article className="iron-parceiros-duvida">
                            <span className="iron-parceiros-duvida-icone">
                                ✓
                            </span>

                            <div>
                                <h4>O lojista precisa vender na vitrine?</h4>

                                <p>
                                    Não. Para a comissão de fretes,
                                    o que importa é a utilização dos
                                    serviços de frete elegíveis.
                                    O produto não precisa estar cadastrado
                                    na vitrine online.
                                </p>
                            </div>
                        </article>

                        <article className="iron-parceiros-duvida">
                            <span className="iron-parceiros-duvida-icone">
                                ✓
                            </span>

                            <div>
                                <h4>Posso ganhar com encomendas?</h4>

                                <p>
                                    Sim. Se você atuar no recebimento
                                    ou na distribuição de encomendas,
                                    poderá existir remuneração adicional
                                    conforme as regras da transportadora.
                                </p>
                            </div>
                        </article>
                    </div>

                    <div className="iron-parceiros-aviso">
                        <strong>Importante</strong>

                        <p>
                            Somente parceiros aprovados podem participar.
                            O pagamento depende da aprovação da indicação,
                            da atividade do lojista e das regras do
                            programa. A remuneração de 10% considera
                            apenas os fretes elegíveis.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
