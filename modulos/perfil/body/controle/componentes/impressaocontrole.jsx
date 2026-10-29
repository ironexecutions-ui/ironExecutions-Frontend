import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./impressaocontrole.css";

const ICP_PRODUTOS = [
    {
        codigo: "10",
        nome: "Impressão branco e preto",
    },
    {
        codigo: "11",
        nome: "Impressão colorida",
       
    },
     {
    codigo: null,
    nome: "Impressão",
       
    },
];
 
export default function Impressaocontrole() {
    const [produtos, setProdutos] = useState([]);
    const [precos, setPrecos] = useState({
        "10": "",
        "11": "",
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState("");
    const [mensagem, setMensagem] = useState(null);

    const token = localStorage.getItem("token");

    const carregarProdutos = useCallback(async () => {
        setCarregando(true);
        setMensagem(null);

        try {
            const resposta = await fetch(
                `${API_URL}/admin/produtos-servicos/`,
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                    },
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    `Não foi possível consultar os produtos (${resposta.status}).`
                );
            }

            const dados = await resposta.json();

            if (!Array.isArray(dados)) {
                throw new Error("O backend retornou uma lista inválida.");
            }

            const encontrados = ICP_PRODUTOS.map((config) => {
                const correspondentes = dados.filter(
                    (produto) =>
                        String(produto.codigo_barras ?? "").trim() ===
                        config.codigo ||
                        String(produto.nome ?? "").trim().toLowerCase() ===
                        config.nome.toLowerCase()
                );

                return {
                    ...config,
                    produto: correspondentes.length === 1
                        ? correspondentes[0]
                        : null,
                    duplicados: correspondentes.length > 1,
                };
            });

            setProdutos(encontrados);

            setPrecos((anteriores) => {
                const novos = { ...anteriores };

                encontrados.forEach((item) => {
                    if (item.produto) {
                        novos[item.codigo] = String(item.produto.preco ?? "");
                    }
                });

                return novos;
            });

            if (encontrados.some((item) => item.duplicados)) {
                setMensagem({
                    tipo: "erro",
                    texto:
                        "Existem produtos duplicados por nome ou código. " +
                        "Corrija os cadastros antes de alterar esses itens.",
                });
            }
        } catch (erro) {
            setMensagem({
                tipo: "erro",
                texto: erro.message || "Erro ao consultar os produtos.",
            });
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarProdutos();
    }, [carregarProdutos]);

    function alterarPreco(codigo, valor) {
        setPrecos((anteriores) => ({
            ...anteriores,
            [codigo]: valor,
        }));
    }

    async function salvarProduto(item) {
        if (salvando) return;

        const precoInformado = precos[item.codigo];

        if (
            precoInformado === "" ||
            !Number.isFinite(Number(precoInformado)) ||
            Number(precoInformado) < 0
        ) {
            setMensagem({
                tipo: "erro",
                texto: "Informe um preço válido, igual ou superior a zero.",
            });
            return;
        }

        setSalvando(item.codigo);
        setMensagem(null);

        try {
            let resposta;

            if (item.produto) {
                resposta = await fetch(
                    `${API_URL}/admin/produtos-servicos/${item.produto.id}/preco`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            preco: Number(precoInformado),
                        }),
                    }
                );
            } else {
                resposta = await fetch(
                    `${API_URL}/admin/produtos-servicos/controle-impressoes`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            codigo_barras: item.codigo,
                            preco: Number(precoInformado),
                        }),
                    }
                );
            }

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    typeof resultado.detail === "string"
                        ? resultado.detail
                        : "Não foi possível salvar o produto."
                );
            }

            setMensagem({
                tipo: "sucesso",
                texto: resultado.mensagem || "Preço salvo com sucesso.",
            });

            await carregarProdutos();
        } catch (erro) {
            setMensagem({
                tipo: "erro",
                texto: erro.message || "Erro ao salvar o produto.",
            });
        } finally {
            setSalvando("");
        }
    }

    function formatarPreco(valor) {
        const numero = Number(valor);

        if (!Number.isFinite(numero)) return "R$ 0,00";

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    if (carregando) {
        return (
            <section className="icp-painel">
                <div className="icp-carregamento">
                    <span className="icp-spinner" />
                    <p>Consultando produtos de impressão...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="icp-painel">
            <header className="icp-cabecalho">
                <div className="icp-cabecalho-identidade">
                    <div className="icp-cabecalho-icone">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M7 14h10v7H7z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="icp-cabecalho-texto">
                        <span className="icp-cabecalho-legenda">
                            CONFIGURAÇÕES
                        </span>
                        <h1>Controle de impressões</h1>
                        <p>
                            Gerencie os serviços e defina os preços por impressão.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="icp-atualizar"
                    onClick={carregarProdutos}
                    disabled={salvando !== ""}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M20 7v5h-5M4 17v-5h5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M5.6 9a7 7 0 0 1 11.7-2L20 12M4 12l2.7 5a7 7 0 0 0 11.7-2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Atualizar
                </button>
            </header>

            {mensagem && (
                <div
                    className={`icp-mensagem icp-mensagem-${mensagem.tipo}`}
                    role="status"
                    aria-live="polite"
                >
                    {mensagem.texto}
                </div>
            )}

            <div className="icp-resumo">
                <div className="icp-resumo-texto">
                    <h2>Serviços de impressão</h2>
                    <p>
                        Configure cada serviço individualmente.
                    </p>
                </div>

                <span className="icp-resumo-contagem">
                    {produtos.filter((item) => item.produto).length} de{" "}
                    {produtos.length} cadastrados
                </span>
            </div>

            <div className="icp-lista">
                {produtos.map((item) => (
                    <article
                        className={`icp-produto ${item.produto
                                ? "icp-produto-cadastrado"
                                : "icp-produto-pendente"
                            }`}
                        key={item.codigo}
                    >
                        <div className="icp-produto-info">
                            <div
                                className={`icp-produto-icone icp-produto-icone-${item.codigo}`}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    {item.codigo === "10" ? (
                                        <>
                                            <path
                                                d="M7 3h10v5H7zM5 8h14a2 2 0 0 1 2 2v6h-4v5H7v-5H3v-6a2 2 0 0 1 2-2Z"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M7 16h10M17 11h.01"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <rect
                                                x="4"
                                                y="4"
                                                width="16"
                                                height="16"
                                                rx="3"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                            />
                                            <path
                                                d="M8 8h8v8H8z"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                            />
                                            <path
                                                d="M4 9h3M17 15h3M9 4v3M15 17v3"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                            />
                                        </>
                                    )}
                                </svg>
                            </div>

                            <div className="icp-produto-detalhes">
                                <div className="icp-produto-titulo">
                                    <h3>{item.nome}</h3>

                                    <span
                                        className={`icp-status ${item.duplicados
                                                ? "icp-status-erro"
                                                : item.produto
                                                    ? "icp-status-ok"
                                                    : "icp-status-pendente"
                                            }`}
                                    >
                                        {item.duplicados
                                            ? "Duplicado"
                                            : item.produto
                                                ? "Ativo"
                                                : "Pendente"}
                                    </span>
                                </div>

                                <span className="icp-produto-codigo">
                                    Código do produto: {item.codigo}
                                </span>

                                <p className="icp-produto-descricao">
                                    {item.codigo === "10"
                                        ? "Impressões monocromáticas em preto e branco."
                                        : "Impressões com reprodução de cores."}
                                </p>
                            </div>
                        </div>

                        <div className="icp-produto-edicao">
                            <label htmlFor={`icp-preco-${item.codigo}`}>
                                Preço por página
                            </label>

                            <div className="icp-campo-preco">
                                <span className="icp-preco-moeda">R$</span>

                                <input
                                    id={`icp-preco-${item.codigo}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    value={precos[item.codigo]}
                                    onChange={(evento) =>
                                        alterarPreco(
                                            item.codigo,
                                            evento.target.value
                                        )
                                    }
                                    disabled={
                                        item.duplicados || salvando !== ""
                                    }
                                    aria-label={`Preço de ${item.nome}`}
                                />
                            </div>

                            {item.produto && (
                                <div className="icp-preco-atual">
                                    <span>Preço cadastrado</span>
                                    <strong>
                                        {formatarPreco(item.produto.preco)}
                                    </strong>
                                </div>
                            )}

                            <button
                                type="button"
                                className="icp-salvar"
                                disabled={
                                    item.duplicados ||
                                    salvando !== "" ||
                                    precos[item.codigo] === "" ||
                                    !Number.isFinite(Number(precos[item.codigo])) ||
                                    Number(precos[item.codigo]) < 0 ||
                                    (item.produto &&
                                        Number(precos[item.codigo]) ===
                                        Number(item.produto.preco))
                                }
                                onClick={() => salvarProduto(item)}
                            >
                                {salvando === item.codigo ? (
                                    <>
                                        <span className="icp-botao-spinner" />
                                        Salvando...
                                    </>
                                ) : item.produto ? (
                                    <>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M12 20h9"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        Salvar alteração
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M12 5v14M5 12h14"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        Cadastrar serviço
                                    </>
                                )}
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
