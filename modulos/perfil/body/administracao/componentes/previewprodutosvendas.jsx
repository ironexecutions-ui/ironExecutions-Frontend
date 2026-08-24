import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../../../../config";
import "./previewprodutosvendas.css";

export default function PreviewProdutosVenda({ venda }) {

    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {

        if (venda) {
            carregarProdutos();
        } else {
            setProdutos([]);
            setErro("");
            setCarregando(false);
        }

    }, [venda]);

    async function carregarProdutos() {

        if (!venda?.produtos) {
            setProdutos([]);
            return;
        }

        setCarregando(true);
        setErro("");

        try {

            const itens = venda.produtos
                .split(",")
                .filter(Boolean)
                .map(item => {

                    const [id, qtd] = item.split(":");

                    return {
                        id: String(id || "").trim(),
                        qtd: Number(qtd || 0)
                    };
                })
                .filter(item => item.id);

            if (itens.length === 0) {
                setProdutos([]);
                return;
            }

            const token = localStorage.getItem("token");

            const resp = await fetch(
                `${API_URL}/admin/vendas/produtos/ids`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ids: itens.map(item => item.id)
                    })
                }
            );

            if (!resp.ok) {

                throw new Error(
                    `Erro ao carregar produtos: ${resp.status}`
                );
            }

            const dados = await resp.json();

            const listaDados = Array.isArray(dados)
                ? dados
                : [];

            const combinados = itens.map(item => {

                const produto = listaDados.find(
                    dado =>
                        String(dado.id) ===
                        String(item.id)
                );

                const preco = Number(
                    produto?.preco_venda ??
                    produto?.preco ??
                    produto?.valor ??
                    0
                );

                return {
                    id: item.id,

                    nome:
                        produto?.nome ||
                        "Produto removido",

                    unidade:
                        produto?.unidade ||
                        "",

                    imagem:
                        produto?.imagem_url
                            ?.split("|")
                            ?.filter(Boolean)?.[0] ||
                        null,

                    qtd: Number(item.qtd || 0),

                    preco,

                    subtotal:
                        preco > 0
                            ? preco * Number(item.qtd || 0)
                            : null
                };
            });

            setProdutos(combinados);

        } catch (erroCarregamento) {

            console.error(
                "[PREVIEW PRODUTOS] Erro:",
                erroCarregamento
            );

            setProdutos([]);

            setErro(
                "Não foi possível carregar os produtos."
            );

        } finally {

            setCarregando(false);
        }
    }

    const quantidadeTotal = useMemo(() => {

        return produtos.reduce(
            (total, produto) =>
                total + Number(produto.qtd || 0),
            0
        );

    }, [produtos]);

    function formatarValor(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    function formatarPagamento(valor) {

        const pagamentos = {
            dinheiro: "Dinheiro",
            pix: "PIX",
            debito: "Débito",
            credito: "Crédito"
        };

        return pagamentos[
            String(valor || "").toLowerCase()
        ] || valor || "Não informado";
    }

    function primeiraLetra(nome) {

        const texto = String(nome || "?").trim();

        return texto
            ? texto.charAt(0).toUpperCase()
            : "?";
    }

    return createPortal(

        <aside
            className="ppv-painel-preview-venda"
            tabIndex={0}
        >

            {!venda && (

                <div className="ppv-preview-sem-venda">

                    <div className="ppv-preview-sem-venda-icone">
                        ◫
                    </div>

                    <strong>
                        Nenhuma venda selecionada
                    </strong>

                    <span>
                        Passe o mouse sobre uma venda para
                        visualizar os produtos.
                    </span>

                </div>
            )}

            {venda && (

                <>

                    {/* =========================
                        CABEÇALHO
                    ========================= */}

                    <div className="ppv-preview-cabecalho">

                        <div className="ppv-preview-cabecalho-texto">

                            <span className="ppv-preview-label-superior">
                                Detalhes da venda
                            </span>

                            <h5>
                                Protocolo #{venda.id}
                            </h5>

                        </div>

                        <div className="ppv-preview-status-venda">

                            {produtos.length}

                            <span>
                                {produtos.length === 1
                                    ? "produto"
                                    : "produtos"}
                            </span>

                        </div>

                    </div>

                    {/* =========================
                        RESUMO SUPERIOR
                    ========================= */}

                    <div className="ppv-preview-resumo">

                        <div className="ppv-preview-resumo-item">

                            <span>
                                Itens
                            </span>

                            <strong>
                                {quantidadeTotal}
                            </strong>

                        </div>

                        <div className="ppv-preview-resumo-divisor" />

                        <div className="ppv-preview-resumo-item">

                            <span>
                                Total
                            </span>

                            <strong>
                                {formatarValor(
                                    venda.valor_pago
                                )}
                            </strong>

                        </div>

                    </div>

                    {/* =========================
                        CARREGANDO
                    ========================= */}

                    {carregando && (

                        <div className="ppv-preview-carregando">

                            <div className="ppv-preview-spinner" />

                            <span>
                                Carregando produtos...
                            </span>

                        </div>
                    )}

                    {/* =========================
                        ERRO
                    ========================= */}

                    {!carregando && erro && (

                        <div className="ppv-preview-erro">

                            <strong>
                                Não foi possível carregar
                            </strong>

                            <span>
                                {erro}
                            </span>

                        </div>
                    )}

                    {/* =========================
                        PRODUTOS
                    ========================= */}

                    {!carregando &&
                        !erro &&
                        produtos.length > 0 && (

                            <div className="ppv-preview-lista">

                                {produtos.map(
                                    (produto, index) => (

                                        <div
                                            key={`${produto.id}-${index}`}
                                            className="ppv-preview-produto-card"
                                        >

                                            <div className="ppv-preview-imagem-box">

                                                {produto.imagem ? (

                                                    <img
                                                        src={produto.imagem}
                                                        alt={produto.nome}
                                                    />

                                                ) : (

                                                    <div className="ppv-preview-imagem-placeholder">

                                                        {primeiraLetra(
                                                            produto.nome
                                                        )}

                                                    </div>
                                                )}

                                                <span className="ppv-preview-quantidade-badge">
                                                    {produto.qtd}x
                                                </span>

                                            </div>

                                            <div className="ppv-preview-produto-conteudo">

                                                <strong className="ppv-preview-produto-nome">
                                                    {produto.nome}
                                                </strong>

                                                <div className="ppv-preview-produto-detalhes">

                                                    {produto.unidade && (

                                                        <span className="ppv-preview-unidade">
                                                            {produto.unidade}
                                                        </span>
                                                    )}

                                                    <span>
                                                        Quantidade:{" "}
                                                        <strong>
                                                            {produto.qtd}
                                                        </strong>
                                                    </span>

                                                </div>

                                                {produto.subtotal !== null && (

                                                    <div className="ppv-preview-produto-valor">

                                                        <span>
                                                            Subtotal
                                                        </span>

                                                        <strong>
                                                            {formatarValor(
                                                                produto.subtotal
                                                            )}
                                                        </strong>

                                                    </div>
                                                )}

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    {/* =========================
                        VENDA SEM PRODUTOS
                    ========================= */}

                    {!carregando &&
                        !erro &&
                        produtos.length === 0 && (

                            <div className="ppv-preview-lista-vazia">

                                Nenhum produto encontrado
                                nesta venda.

                            </div>
                        )}

                    {/* =========================
                        RODAPÉ
                    ========================= */}

                    <div className="ppv-preview-rodape">

                        <div className="ppv-preview-rodape-linha">

                            <span>
                                Pagamento
                            </span>

                            <strong>
                                {formatarPagamento(
                                    venda.pagamento
                                )}
                            </strong>

                        </div>

                        <div className="ppv-preview-rodape-linha">

                            <span>
                                Operador
                            </span>

                            <strong>
                                {venda.operador || "Não informado"}
                            </strong>

                        </div>

                        {venda.maquininha && (

                            <div className="ppv-preview-rodape-linha">

                                <span>
                                    Maquininha
                                </span>

                                <strong>
                                    {venda.maquininha}
                                </strong>

                            </div>
                        )}

                        <div className="ppv-preview-total-final">

                            <span>
                                Total da venda
                            </span>

                            <strong>
                                {formatarValor(
                                    venda.valor_pago
                                )}
                            </strong>

                        </div>

                    </div>

                </>
            )}

        </aside>,

        document.body
    );
}