import React, { useEffect, useState } from "react";

import { API_URL } from "../../../../config";

import "./produtoSemPreco.css";


export default function ProdutosSemPreco() {
    const [dados, setDados] = useState({
        resumo: {
            total_sem_preco: 0,
            total_preco_alterado: 0,
            total_pendencias: 0
        },
        produtos_sem_preco: [],
        produtos_preco_alterado: []
    });

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [listaMobile, setListaMobile] = useState("sem_preco");

    useEffect(() => {
        carregarProdutos();
    }, []);

    async function carregarProdutos() {
        const token = localStorage.getItem("token") || "";

        if (!token) {
            setErro("Sessão não encontrada.");
            setCarregando(false);
            return;
        }

        try {
            setCarregando(true);
            setErro("");

            const resposta = await fetch(
                `${API_URL}/tarefas/produtos-precos-etiquetas`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail ||
                    "Não foi possível carregar os produtos."
                );
            }

            setDados(resultado);
        } catch (erroCarregamento) {
            setErro(
                erroCarregamento.message ||
                "Não foi possível carregar os produtos."
            );
        } finally {
            setCarregando(false);
        }
    }

    function formatarPreco(valor) {
        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "R$ 0,00";
        }

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarNomeProduto(produto) {
        const nomeCompleto = String(
            produto.nome || "Produto sem nome"
        ).trim();

        const marcadores = String(
            produto.qual_variedad || ""
        ).match(/\(\)/g);

        const quantidadePalavras = marcadores?.length || 0;

        if (quantidadePalavras === 0) {
            return nomeCompleto;
        }

        const palavras = nomeCompleto
            .split(/\s+/)
            .filter(Boolean);

        return palavras
            .slice(0, quantidadePalavras)
            .join(" ");
    }

    function renderizarProduto(produto, tipo) {
        return (
            <article
                className="controle-etiquetas-produto-card"
                key={produto.id}
            >
                <div className="controle-etiquetas-produto-identidade">
                    <strong>{formatarNomeProduto(produto)}</strong>
                    <span>Produto #{produto.id}</span>
                </div>

                <div className="controle-etiquetas-produto-valores">
                    <div>
                        <span>Preço atual</span>
                        <strong>{formatarPreco(produto.preco)}</strong>
                    </div>

                    {tipo === "alterado" && (
                        <div>
                            <span>Preço da etiqueta</span>
                            <strong>{formatarPreco(produto.preco_etiqueta)}</strong>
                        </div>
                    )}
                </div>
            </article>
        );
    }

    if (carregando) {
        return (
            <div className="controle-etiquetas-estado">
                Carregando produtos...
            </div>
        );
    }

    if (erro) {
        return (
            <div className="controle-etiquetas-estado controle-etiquetas-estado-erro">
                <span>{erro}</span>
                <button type="button" onClick={carregarProdutos}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <section className="controle-etiquetas-painel">
            <div className="controle-etiquetas-relatorio">
                <div>
                    <span>Sem preço de etiqueta</span>
                    <strong>{dados.resumo.total_sem_preco}</strong>
                </div>

                <div>
                    <span>Preços alterados</span>
                    <strong>{dados.resumo.total_preco_alterado}</strong>
                </div>

                <div>
                    <span>Total para revisar</span>
                    <strong>{dados.resumo.total_pendencias}</strong>
                </div>
            </div>

            <div className="controle-etiquetas-mobile-navegacao">
                <button
                    type="button"
                    className={listaMobile === "sem_preco" ? "ativo" : ""}
                    onClick={() => setListaMobile("sem_preco")}
                >
                    Sem preço ({dados.resumo.total_sem_preco})
                </button>

                <button
                    type="button"
                    className={listaMobile === "alterados" ? "ativo" : ""}
                    onClick={() => setListaMobile("alterados")}
                >
                    Alterados ({dados.resumo.total_preco_alterado})
                </button>
            </div>

            <div className="controle-etiquetas-listas">
                <section className={`controle-etiquetas-coluna ${listaMobile === "sem_preco" ? "controle-etiquetas-coluna-mobile-visivel" : ""}`}>
                    <header>
                        <div>
                            <span>Pendências</span>
                            <h3>Produtos sem preço</h3>
                        </div>
                        <strong>{dados.resumo.total_sem_preco}</strong>
                    </header>

                    <div className="controle-etiquetas-coluna-conteudo">
                        {dados.produtos_sem_preco.length === 0 ? (
                            <p className="controle-etiquetas-lista-vazia">
                                Nenhum produto sem preço de etiqueta.
                            </p>
                        ) : (
                            dados.produtos_sem_preco.map(produto =>
                                renderizarProduto(produto, "sem_preco")
                            )
                        )}
                    </div>
                </section>

                <section className={`controle-etiquetas-coluna ${listaMobile === "alterados" ? "controle-etiquetas-coluna-mobile-visivel" : ""}`}>
                    <header>
                        <div>
                            <span>Reimpressão</span>
                            <h3>Preços alterados</h3>
                        </div>
                        <strong>{dados.resumo.total_preco_alterado}</strong>
                    </header>

                    <div className="controle-etiquetas-coluna-conteudo">
                        {dados.produtos_preco_alterado.length === 0 ? (
                            <p className="controle-etiquetas-lista-vazia">
                                Nenhum preço foi alterado.
                            </p>
                        ) : (
                            dados.produtos_preco_alterado.map(produto =>
                                renderizarProduto(produto, "alterado")
                            )
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}
