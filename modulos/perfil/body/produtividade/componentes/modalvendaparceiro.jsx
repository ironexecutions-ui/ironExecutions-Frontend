
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../../../../config";
import "./modalvendaparceiro.css";

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function lerAdicionais(valor) {
    const lista = Array.isArray(valor)
        ? valor
        : String(valor || "").split("|");

    return lista
        .map((item) => String(item).trim())
        .filter(Boolean);
}

function mensagemErro(dados, padrao) {
    return dados?.detail || dados?.message || dados?.error || padrao;
}

export default function ModalVendaParceiro({
    parceriaId,
    parceriaNome = "",
    fechar,
}) {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [recebido, setRecebido] = useState("");
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [registrando, setRegistrando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [vendaConcluida, setVendaConcluida] = useState(null);
    const token = localStorage.getItem("token");
const [nomeComercio, setNomeComercio] = useState("");
const [nomeParceiroApi, setNomeParceiroApi] = useState("");
    useEffect(() => {
        let ativo = true;

        async function carregarProdutos() {
            setCarregando(true);
            setErro("");

            try {
                const resposta = await fetch(
                    `${API_URL}/parceiros-catalogo/${parceriaId}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Cache-Control": "no-cache",
                        },
                    }
                );

                const dados = await resposta.json().catch(() => []);

                if (!resposta.ok) {
                    throw new Error(
                        mensagemErro(
                            dados,
                            "Não foi possível carregar os produtos do parceiro."
                        )
                    );
                }

                if (ativo) {
                    setProdutos(Array.isArray(dados) ? dados : []);
                }
            } catch (e) {
                if (ativo) {
                    setErro(e.message || "Erro ao carregar produtos.");
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarProdutos();

        return () => {
            ativo = false;
        };
    }, [parceriaId, token]);
useEffect(() => {
    let ativo = true;

    async function carregarIdentificacao() {
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
            };

            const [respostaCliente, respostaParceiros] = await Promise.all([
                fetch(`${API_URL}/clientes/me`, {
                    method: "GET",
                    headers,
                    cache: "no-store",
                }),
                fetch(`${API_URL}/clientes/parceiros`, {
                    method: "GET",
                    headers,
                    cache: "no-store",
                }),
            ]);

            if (!respostaCliente.ok) {
                throw new Error("Não foi possível identificar o comércio.");
            }

            const cliente = await respostaCliente.json();

            const parceiros = respostaParceiros.ok
                ? await respostaParceiros.json()
                : [];

            const parceiroEncontrado = Array.isArray(parceiros)
                ? parceiros.find(
                      (item) => Number(item.id) === Number(parceriaId)
                  )
                : null;

            if (ativo) {
                setNomeComercio(
                    String(cliente.loja || "").trim()
                );

                setNomeParceiroApi(
                    String(parceiroEncontrado?.parceiro || "").trim()
                );
            }
        } catch (erro) {
            console.error(
                "Erro ao carregar identificação da etiqueta:",
                erro
            );
        }
    }

    if (token && parceriaId != null) {
        carregarIdentificacao();
    }

    return () => {
        ativo = false;
    };
}, [token, parceriaId]);



    useEffect(() => {
        function tratarTeclado(evento) {
            if (evento.key === "Escape" && !registrando) {
                fechar();
            }
        }

        window.addEventListener("keydown", tratarTeclado);

        return () => {
            window.removeEventListener("keydown", tratarTeclado);
        };
    }, [fechar, registrando]);

    const produtosFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");

        if (!termo) return produtos;

        return produtos.filter((produto) =>
            String(produto.produto || produto.nome || "")
                .toLocaleLowerCase("pt-BR")
                .includes(termo)
        );
    }, [produtos, busca]);

    const total = useMemo(
        () =>
            Number(
                carrinho
                    .reduce((soma, item) => soma + Number(item.valor || 0), 0)
                    .toFixed(2)
            ),
        [carrinho]
    );

    const valorRecebidoNumero = Number(
        String(recebido).trim().replace(",", ".")
    );

    const recebeuValorValido =
        recebido.trim() !== "" &&
        Number.isFinite(valorRecebidoNumero) &&
        valorRecebidoNumero >= 0;

    const recebidoInsuficiente =
        recebeuValorValido && valorRecebidoNumero < total;

    const troco = recebeuValorValido
        ? Number(Math.max(0, valorRecebidoNumero - total).toFixed(2))
        : null;

    function adicionarProduto(produto) {
        const adicionais = lerAdicionais(produto.adicionais);

        setCarrinho((lista) => [
            {
                chave: `${produto.id}-${Date.now()}-${Math.random()}`,
                produto_id: Number(produto.id),
                produto: produto.produto || produto.nome || "Produto",
                valor: Number(produto.valor || 0),
                adicionaisDisponiveis: adicionais,
                selecionados: [],
            },
            ...lista,
        ]);

        setErro("");
        setSucesso("");
    }

    function alterarAdicional(chave, adicional, marcado) {
        setCarrinho((lista) =>
            lista.map((item) => {
                if (item.chave !== chave) return item;

                const selecionados = marcado
                    ? [...item.selecionados, adicional]
                    : item.selecionados.filter(
                        (atual) => atual !== adicional
                    );

                return { ...item, selecionados };
            })
        );
    }

    function removerItem(chave) {
        setCarrinho((lista) =>
            lista.filter((item) => item.chave !== chave)
        );
    }
   function imprimirEtiqueta() {
    if (!vendaConcluida) return;

    if (!nomeComercio.trim()) {
        setErro("Não foi possível identificar o nome do comércio pela API /clientes/me.");
        return;
    }

    if (!nomeParceiroApi.trim()) {
        setErro("Não foi possível identificar o parceiro pela API /clientes/parceiros.");
        return;
    }

    if (!vendaConcluida.protocolo) {
        setErro("A API de registro não retornou o protocolo da venda.");
        return;
    }

    const escaparHTML = (valor) =>
        String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        })[caractere]);

    const empresa = escaparHTML(nomeComercio);
    const parceiro = escaparHTML(nomeParceiroApi);
    const protocolo = escaparHTML(vendaConcluida.protocolo);
    const data = escaparHTML(new Date().toLocaleString("pt-BR"));

    const janela = window.open("", "_blank", "width=400,height=600");

    if (!janela) {
        setErro("O navegador bloqueou a janela de impressão. Permita pop-ups e tente novamente.");
        return;
    }

    janela.onload = () => {
        janela.focus();
        janela.print();
    };

    janela.document.open();
    janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Etiqueta de venda</title>

    <style>
        @page {
            size: 58mm auto;
            margin: 2mm;
        }

        * {
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            padding: 0;
            width: 54mm;
            background: #fff;
            color: #000;
            font-family: Arial, Helvetica, sans-serif;
        }

        .etiqueta {
            width: 54mm;
            padding: 2mm 1mm;
            text-align: center;
            overflow-wrap: anywhere;
        }

        .marca {
            font-size: 19pt;
            font-weight: 900;
            letter-spacing: 1px;
        }

        .submarca {
            margin-top: 1mm;
            font-size: 7pt;
            font-weight: 700;
        }

        .linha {
            border-top: 1.5px solid #000;
            margin: 3mm 0;
        }

        .rotulo {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
        }

        .nome {
            margin: 2mm 0;
            font-size: 13pt;
            font-weight: 900;
            line-height: 1.2;
            overflow-wrap: anywhere;
        }

        .protocolo-titulo {
            margin-top: 3mm;
            font-size: 8pt;
            font-weight: 800;
        }

        .protocolo {
            margin: 2mm 0;
            font-size: 25pt;
            font-weight: 900;
            line-height: 1.1;
            overflow-wrap: anywhere;
        }

        .autenticidade {
            font-size: 9pt;
            font-weight: 900;
            line-height: 1.3;
        }

        .descricao {
            margin-top: 2mm;
            font-size: 8pt;
            line-height: 1.4;
        }

        .data {
            margin-top: 3mm;
            font-size: 7pt;
        }

        .rodape {
            margin-top: 2mm;
            font-size: 7pt;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <main class="etiqueta">
        <div class="marca">IRONEXECUTIONS</div>
        <div class="submarca">REGISTRO DE VENDA</div>

        <div class="linha"></div>

        <div class="rotulo">Comércio responsável</div>
        <div class="nome">${empresa}</div>

        <div class="linha"></div>

        <div class="rotulo">Parceiro</div>
        <div class="nome">${parceiro}</div>

        <div class="linha"></div>

        <div class="protocolo-titulo">PROTOCOLO DA VENDA</div>
        <div class="protocolo">${protocolo}</div>

        <div class="linha"></div>

        <div class="autenticidade">
            IDENTIFICAÇÃO DE VENDA
        </div>

        <div class="descricao">
            Etiqueta emitida para identificar a operação registrada
            no sistema IronStore.
            <br><br>
            Consulte o protocolo no histórico oficial de vendas.
        </div>

        <div class="data">Emitida em: ${data}</div>

        <div class="linha"></div>

        <div class="rodape">IRONEXECUTIONS · REGISTRO DE OPERAÇÃO</div>
    </main>
</body>
</html>`);
    janela.document.close();
}
    async function registrarVenda() {
        if (registrando) return;

        if (carrinho.length === 0) {
            setErro("Adicione pelo menos um produto à venda.");
            return;
        }

        if (recebeuValorValido && recebidoInsuficiente) {
            setErro("O valor recebido é menor que o total da venda.");
            return;
        }

        setRegistrando(true);
        setErro("");
        setSucesso("");

        try {
            const itens = carrinho.map((item) => ({
                produto_id: item.produto_id,
                produto: item.produto,
                acompanhantes: item.selecionados.join("|"),
                valor: Number(item.valor.toFixed(2)),
            }));

            const resposta = await fetch(
                `${API_URL}/caixa/parceiros-historico/${parceriaId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ itens }),
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    mensagemErro(
                        dados,
                        "Não foi possível registrar a venda."
                    )
                );
            }

            setVendaConcluida({
                protocolo: dados?.protocolo || dados?.protocolo_venda || null,
                mensagem:
                    dados?.mensagem ||
                    `${itens.length} produto(s) registrado(s) com sucesso.`,
            });

            setCarrinho([]);
            setRecebido("");
            setBusca("");
        } catch (e) {
            setErro(e.message || "Erro ao registrar a venda.");
        } finally {
            setRegistrando(false);
        }
    }

    return createPortal(
        <div
            className="mvp-overlay"
            onMouseDown={(evento) => {
                if (
                    evento.target === evento.currentTarget &&
                    !registrando
                ) {
                    fechar();
                }
            }}
        >
            <section
                className="mvp-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mvp-titulo"
            >
                <header className="mvp-header">
                    <div className="mvp-header-identidade">
                        <div className="mvp-logo-parceiro" aria-hidden="true">
                            P
                        </div>

                        <div className="mvp-header-texto">
                            <span className="mvp-eyebrow">
                                IRONSTORE · VENDA DE PARCEIRO
                            </span>

                            <h2 id="mvp-titulo">
                                {parceriaNome.trim() ||
                                    "Venda para parceiro"}
                            </h2>

                            <p>
                                Selecione os produtos, configure os adicionais
                                e registre a venda.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="mvp-fechar"
                        onClick={fechar}
                        disabled={registrando}
                        aria-label="Fechar modal"
                        title="Fechar"
                    >
                        ×
                    </button>
                </header>
                {vendaConcluida && (
                    <div
                        className="mvp-confirmacao"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mvp-confirmacao-titulo"
                    >
                        <div className="mvp-confirmacao-icone">✓</div>



                        <h2 id="mvp-confirmacao-titulo">
                            Venda finalizada com sucesso!
                        </h2>

                        <p>{vendaConcluida.mensagem}</p>

                        <div className="mvp-protocolo">
                            <span>Protocolo da venda</span>

                            <strong>
                                {vendaConcluida.protocolo ||
                                    "Protocolo não retornado pelo servidor"}
                            </strong>


                        </div>
<button
    type="button"
    className="mvp-botao-imprimir-etiqueta"
    onClick={imprimirEtiqueta}
>
    Imprimir etiqueta 
</button>

<button
    type="button"
    className="mvp-registrar"
    onClick={fechar}
>
    Aceitar e fechar
</button>
                       
                    </div>
                )}
                <div className="mvp-status-bar">
                    <span className="mvp-status-ponto" />
                    <span>Registro de venda</span>
                    <span className="mvp-status-separador">/</span>
                    <span>
                        {carrinho.length}{" "}
                        {carrinho.length === 1 ? "item selecionado" : "itens selecionados"}
                    </span>
                </div>

                {erro && (
                    <div className="mvp-alerta mvp-erro" role="alert">
                        <span className="mvp-alerta-icone">!</span>
                        <span>{erro}</span>
                        <button
                            type="button"
                            onClick={() => setErro("")}
                            aria-label="Fechar mensagem de erro"
                        >
                            ×
                        </button>
                    </div>
                )}

                {sucesso && (
                    <div className="mvp-alerta mvp-sucesso" role="status">
                        <span className="mvp-alerta-icone">✓</span>
                        <span>{sucesso}</span>
                    </div>
                )}

                <div className="mvp-layout">
                    <section className="mvp-catalogo">
                        <div className="mvp-secao-cabecalho">
                            <div>
                                <span className="mvp-secao-etiqueta">
                                    CATÁLOGO
                                </span>
                                <h3>Produtos disponíveis</h3>
                                <p>Selecione um produto para adicionar à venda.</p>
                            </div>

                            <span className="mvp-contador">
                                {produtosFiltrados.length}
                            </span>
                        </div>

                        <label className="mvp-busca-wrap" htmlFor="mvp-busca">
                            <span className="mvp-busca-icone" aria-hidden="true">
                                ⌕
                            </span>
                            <input
                                id="mvp-busca"
                                className="mvp-input mvp-input-busca"
                                value={busca}
                                onChange={(evento) =>
                                    setBusca(evento.target.value)
                                }
                                placeholder="Buscar produto..."
                                autoFocus
                            />
                            {busca && (
                                <button
                                    type="button"
                                    className="mvp-limpar-busca"
                                    onClick={() => setBusca("")}
                                    aria-label="Limpar busca"
                                >
                                    ×
                                </button>
                            )}
                        </label>

                        <div className="mvp-lista-catalogo">
                            {carregando ? (
                                <div className="mvp-estado-vazio">
                                    <span className="mvp-spinner" />
                                    <strong>Carregando catálogo</strong>
                                    <p>Buscando os produtos do parceiro...</p>
                                </div>
                            ) : produtosFiltrados.length === 0 ? (
                                <div className="mvp-estado-vazio">
                                    <span className="mvp-vazio-icone">⌕</span>
                                    <strong>
                                        {busca
                                            ? "Nenhum resultado encontrado"
                                            : "Catálogo vazio"}
                                    </strong>
                                    <p>
                                        {busca
                                            ? "Tente buscar usando outro nome."
                                            : "Este parceiro ainda não possui produtos cadastrados."}
                                    </p>
                                </div>
                            ) : (
                                produtosFiltrados.map((produto) => (
                                    <article
                                        className="mvp-produto-catalogo"
                                        key={produto.id}
                                    >
                                        <div className="mvp-produto-simbolo">
                                            {(produto.produto ||
                                                produto.nome ||
                                                "P")
                                                .trim()
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="mvp-produto-info">
                                            <strong>
                                                {produto.produto ||
                                                    produto.nome ||
                                                    "Produto sem nome"}
                                            </strong>

                                            <span>
                                                {lerAdicionais(
                                                    produto.adicionais
                                                ).length > 0
                                                    ? "Possui adicionais"
                                                    : "Produto disponível"}
                                            </span>

                                            <b>{dinheiro(produto.valor)}</b>
                                        </div>

                                        <button
                                            type="button"
                                            className="mvp-botao-adicionar"
                                            onClick={() =>
                                                adicionarProduto(produto)
                                            }
                                            title="Adicionar à venda"
                                        >
                                            <span aria-hidden="true">+</span>
                                            <span>Adicionar</span>
                                        </button>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="mvp-venda">
                        <div className="mvp-secao-cabecalho">
                            <div>
                                <span className="mvp-secao-etiqueta">
                                    SUA VENDA
                                </span>
                                <h3>Resumo do pedido</h3>
                                <p>Confira os itens antes de registrar.</p>
                            </div>

                            <span className="mvp-contador mvp-contador-carrinho">
                                {carrinho.length}
                            </span>
                        </div>

                        <div className="mvp-itens-venda">
                            {carrinho.length === 0 ? (
                                <div className="mvp-estado-vazio mvp-carrinho-vazio">
                                    <span className="mvp-vazio-icone">＋</span>
                                    <strong>Sua venda está vazia</strong>
                                    <p>
                                        Adicione produtos do catálogo para
                                        começar.
                                    </p>
                                </div>
                            ) : (
                                carrinho.map((item, indice) => (
                                    <article
                                        className="mvp-item-venda"
                                        key={item.chave}
                                    >
                                        <div className="mvp-item-cabecalho">
                                            <div className="mvp-item-identidade">
                                                <span className="mvp-item-numero">
                                                    ITEM {String(indice + 1).padStart(2, "0")}
                                                </span>
                                                <strong>{item.produto}</strong>
                                            </div>

                                            <button
                                                type="button"
                                                className="mvp-remover"
                                                onClick={() =>
                                                    removerItem(item.chave)
                                                }
                                                aria-label={`Remover ${item.produto}`}
                                            >
                                                Remover
                                            </button>
                                        </div>

                                        <div className="mvp-adicionais">
                                            <span className="mvp-label">
                                                Adicionais
                                            </span>

                                            {item.adicionaisDisponiveis.length ===
                                                0 ? (
                                                <small className="mvp-sem-adicionais">
                                                    Sem adicionais cadastrados.
                                                </small>
                                            ) : (
                                                <div className="mvp-lista-adicionais">
                                                    {item.adicionaisDisponiveis.map(
                                                        (adicional) => (
                                                            <label
                                                                className="mvp-checkbox"
                                                                key={adicional}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.selecionados.includes(
                                                                        adicional
                                                                    )}
                                                                    onChange={(
                                                                        evento
                                                                    ) =>
                                                                        alterarAdicional(
                                                                            item.chave,
                                                                            adicional,
                                                                            evento
                                                                                .target
                                                                                .checked
                                                                        )
                                                                    }
                                                                />
                                                                <span>
                                                                    {adicional}
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mvp-item-rodape">
                                            <span>Valor do produto</span>
                                            <strong>{dinheiro(item.valor)}</strong>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        <div className="mvp-resumo">
                            <div className="mvp-total-linha">
                                <div>
                                    <span>Total da venda</span>
                                    <small>
                                        {carrinho.length}{" "}
                                        {carrinho.length === 1
                                            ? "produto"
                                            : "produtos"}
                                    </small>
                                </div>
                                <strong>{dinheiro(total)}</strong>
                            </div>

                            <div className="mvp-recebimento">
                                <label
                                    className="mvp-label"
                                    htmlFor="mvp-recebido"
                                >
                                    Valor recebido
                                    <span>Opcional</span>
                                </label>

                                <div className="mvp-input-dinheiro">
                                    <span>R$</span>
                                    <input
                                        id="mvp-recebido"
                                        className="mvp-input"
                                        inputMode="decimal"
                                        value={recebido}
                                        onChange={(evento) =>
                                            setRecebido(evento.target.value)
                                        }
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            {troco !== null && (
                                <div
                                    className={
                                        "mvp-troco " +
                                        (recebidoInsuficiente
                                            ? "mvp-troco-insuficiente"
                                            : "")
                                    }
                                >
                                    <span>
                                        {recebidoInsuficiente
                                            ? "Valor insuficiente"
                                            : "Troco a devolver"}
                                    </span>
                                    <strong>
                                        {recebidoInsuficiente
                                            ? dinheiro(0)
                                            : dinheiro(troco)}
                                    </strong>
                                </div>
                            )}

                            <button
                                type="button"
                                className="mvp-registrar"
                                onClick={registrarVenda}
                                disabled={
                                    registrando ||
                                    carregando ||
                                    carrinho.length === 0 ||
                                    recebidoInsuficiente
                                }
                            >
                                {registrando ? (
                                    <>
                                        <span className="mvp-spinner mvp-spinner-botao" />
                                        Registrando venda...
                                    </>
                                ) : (
                                    <>
                                        <span aria-hidden="true">✓</span>
                                        Registrar venda
                                    </>
                                )}
                            </button>

                            <p className="mvp-nota-seguranca">
                                A venda será registrada no histórico do parceiro.
                            </p>
                        </div>
                    </section>
                </div>
            </section>
        </div>,
        document.body
    );
}
