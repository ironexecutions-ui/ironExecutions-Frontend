import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "../../../../config";

import "./descricao.css";

export default function DescricaoRifa({
    descricao,
    setDescricao
}) {
    const [modo, setModo] = useState("sem");

    const [buscaProduto, setBuscaProduto] = useState("");
    const [resultados, setResultados] = useState([]);
    const [produtosSelecionados, setProdutosSelecionados] = useState([]);

    const [buscando, setBuscando] = useState(false);
    const [erroBusca, setErroBusca] = useState("");

    const debounceRef = useRef(null);

    const token = localStorage.getItem("token");


    // =====================================================
    // VALOR TOTAL DOS PRODUTOS
    // =====================================================

    const valorTotalProdutos = useMemo(() => {
        return produtosSelecionados.reduce(
            (total, produto) => {
                return total + Number(produto.preco || 0);
            },
            0
        );
    }, [produtosSelecionados]);


    // =====================================================
    // ALTERAR MODO
    // =====================================================

    function alterarModo(novoModo) {
        setModo(novoModo);
        setErroBusca("");

        if (novoModo === "sem") {
            setDescricao("");
            setBuscaProduto("");
            setResultados([]);
            setProdutosSelecionados([]);
        }

        if (novoModo === "manual") {
            setBuscaProduto("");
            setResultados([]);
            setProdutosSelecionados([]);
        }
    }


    // =====================================================
    // BUSCAR PRODUTOS
    // =====================================================

    async function buscarProdutos(termo) {
        const texto = String(termo || "").trim();

        if (!texto) {
            setResultados([]);
            return;
        }

        try {
            setBuscando(true);
            setErroBusca("");

            const resposta = await fetch(
                `${API_URL}/rifa/produtos/buscar?q=${encodeURIComponent(texto)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const json = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    json.detail ||
                    "Não foi possível buscar os produtos"
                );
            }

            setResultados(
                Array.isArray(json.produtos)
                    ? json.produtos
                    : []
            );

        } catch (erro) {
            console.error(
                "[RIFA] Erro ao buscar produtos:",
                erro
            );

            setResultados([]);

            setErroBusca(
                erro.message ||
                "Erro ao buscar produtos"
            );

        } finally {
            setBuscando(false);
        }
    }


    // =====================================================
    // BUSCA AUTOMÁTICA
    // =====================================================

    useEffect(() => {
        if (modo !== "produtos") {
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const termo = buscaProduto.trim();

        if (!termo) {
            setResultados([]);
            return;
        }

        debounceRef.current = setTimeout(() => {
            buscarProdutos(termo);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };

    }, [buscaProduto, modo]);


    // =====================================================
    // ADICIONAR PRODUTO
    // =====================================================

    function adicionarProduto(produto) {
        if (!produto?.id) {
            return;
        }

        const jaExiste = produtosSelecionados.some(
            item => item.id === produto.id
        );

        if (jaExiste) {
            setBuscaProduto("");
            setResultados([]);
            return;
        }

        setProdutosSelecionados(prev => [
            ...prev,
            produto
        ]);

        setBuscaProduto("");
        setResultados([]);
        setErroBusca("");
    }


    // =====================================================
    // ENTER
    // =====================================================

    function tratarEnter(evento) {
        if (evento.key !== "Enter") {
            return;
        }

        evento.preventDefault();

        if (resultados.length === 0) {
            return;
        }

        adicionarProduto(
            resultados[0]
        );
    }


    // =====================================================
    // REMOVER PRODUTO
    // =====================================================

    function removerProduto(produtoId) {
        setProdutosSelecionados(prev =>
            prev.filter(
                produto => produto.id !== produtoId
            )
        );
    }


    // =====================================================
    // GERAR DESCRIÇÃO PROFISSIONAL
    // =====================================================

    function redigirDescricaoProfissional() {
        if (produtosSelecionados.length === 0) {
            setErroBusca(
                "Adicione pelo menos um produto para redigir a descrição."
            );
            return;
        }

        const nomes = produtosSelecionados
            .map(produto => produto.nome?.trim())
            .filter(Boolean);

        if (nomes.length === 0) {
            return;
        }

        let listaProdutos = "";

        if (nomes.length === 1) {
            listaProdutos = nomes[0];
        } else if (nomes.length === 2) {
            listaProdutos = `${nomes[0]} e ${nomes[1]}`;
        } else {
            listaProdutos =
                `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
        }

        const texto =
            `Esta rifa reúne uma seleção especial de prêmios:\n\n` +
            nomes
                .map((nome, indice) => `${indice + 1}. ${nome}`)
                .join("\n") +
            `\n\nUma excelente oportunidade para concorrer a todos esses prêmios em um único sorteio. ` +
            `Participe escolhendo seus números e acompanhe a rifa até a realização do sorteio.`;

        setDescricao(texto);
        setErroBusca("");
    }


    // =====================================================
    // FORMATAR PREÇO
    // =====================================================

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    return (
        <div className="drf-area-descricao-rifa">

            <div className="drf-cabecalho-descricao">
                <div>
                    <h4 className="drf-titulo-descricao">
                        Descrição da rifa
                    </h4>

                    <p className="drf-subtitulo-descricao">
                        Escolha como deseja apresentar os prêmios aos participantes.
                    </p>
                </div>
            </div>


            <div className="drf-opcoes-descricao">

                <button
                    type="button"
                    className={`drf-opcao-descricao ${modo === "sem"
                        ? "drf-opcao-descricao-ativa"
                        : ""
                        }`}
                    onClick={() => alterarModo("sem")}
                >
                    Sem descrição
                </button>

                <button
                    type="button"
                    className={`drf-opcao-descricao ${modo === "manual"
                        ? "drf-opcao-descricao-ativa"
                        : ""
                        }`}
                    onClick={() => alterarModo("manual")}
                >
                    Redigir descrição
                </button>

                <button
                    type="button"
                    className={`drf-opcao-descricao ${modo === "produtos"
                        ? "drf-opcao-descricao-ativa"
                        : ""
                        }`}
                    onClick={() => alterarModo("produtos")}
                >
                    Meus produtos
                </button>

            </div>


            {modo === "manual" && (
                <div className="drf-editor-manual">

                    <textarea
                        className="drf-textarea-descricao"
                        value={descricao}
                        onChange={e =>
                            setDescricao(e.target.value)
                        }
                        placeholder="Descreva os prêmios, condições ou outras informações importantes desta rifa..."
                        rows={6}
                        maxLength={5000}
                    />

                    <span className="drf-contador-descricao">
                        {descricao.length}/5000
                    </span>

                </div>
            )}


            {modo === "produtos" && (
                <div className="drf-area-produtos">

                    <div className="drf-buscador-produtos">

                        <input
                            type="text"
                            className="drf-input-busca-produto"
                            value={buscaProduto}
                            onChange={e =>
                                setBuscaProduto(e.target.value)
                            }
                            onKeyDown={tratarEnter}
                            placeholder="Digite o nome ou código de barras..."
                            autoComplete="off"
                        />

                        {buscando && (
                            <span className="drf-status-busca">
                                Buscando...
                            </span>
                        )}

                    </div>


                    {resultados.length > 0 && (
                        <div className="drf-resultados-produtos">

                            {resultados.map(produto => (
                                <button
                                    type="button"
                                    key={produto.id}
                                    className="drf-resultado-produto"
                                    onClick={() =>
                                        adicionarProduto(produto)
                                    }
                                >

                                    <div className="drf-resultado-produto-dados">

                                        <strong>
                                            {produto.nome}
                                        </strong>

                                        {produto.codigo_barras && (
                                            <span>
                                                {produto.codigo_barras}
                                            </span>
                                        )}

                                    </div>

                                    <span className="drf-resultado-produto-preco">
                                        {formatarPreco(produto.preco)}
                                    </span>

                                </button>
                            ))}

                        </div>
                    )}


                    {produtosSelecionados.length > 0 && (
                        <div className="drf-produtos-selecionados">

                            <div className="drf-lista-produtos-cabecalho">

                                <strong>
                                    Prêmios selecionados
                                </strong>

                                <span>
                                    {produtosSelecionados.length}
                                </span>

                            </div>


                            {produtosSelecionados.map(produto => (
                                <div
                                    key={produto.id}
                                    className="drf-produto-selecionado"
                                >

                                    <span className="drf-produto-selecionado-nome">
                                        {produto.nome}
                                    </span>

                                    <div className="drf-produto-selecionado-final">

                                        <strong>
                                            {formatarPreco(produto.preco)}
                                        </strong>

                                        <button
                                            type="button"
                                            className="drf-remover-produto"
                                            onClick={() =>
                                                removerProduto(produto.id)
                                            }
                                            aria-label={`Remover ${produto.nome}`}
                                        >
                                            ×
                                        </button>

                                    </div>

                                </div>
                            ))}


                            <div className="drf-total-produtos">

                                <span>
                                    Valor total dos prêmios
                                </span>

                                <strong>
                                    {formatarPreco(valorTotalProdutos)}
                                </strong>

                            </div>


                            <button
                                type="button"
                                className="drf-botao-redigir-automaticamente"
                                onClick={redigirDescricaoProfissional}
                            >
                                Redigir descrição
                            </button>

                        </div>
                    )}


                    {descricao && (
                        <div className="drf-descricao-gerada">

                            <div className="drf-descricao-gerada-topo">
                                Descrição
                            </div>

                            <textarea
                                className="drf-textarea-descricao-gerada"
                                value={descricao}
                                onChange={e =>
                                    setDescricao(e.target.value)
                                }
                                rows={6}
                                maxLength={5000}
                            />

                        </div>
                    )}

                </div>
            )}


            {erroBusca && (
                <p className="drf-erro-descricao">
                    {erroBusca}
                </p>
            )}

        </div>
    );
}