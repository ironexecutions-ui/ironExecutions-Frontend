import React, { useEffect, useMemo, useState } from "react";

import { API_URL } from "../../../../../config";
import "./reposicao.css";
import { createPortal } from "react-dom";
export default function Reposicao() {
    const [reposicoes, setReposicoes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [busca, setBusca] = useState("");
    const [dataCompra, setDataCompra] = useState("");
    const [produtosSelecionados, setProdutosSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [reposicaoEditandoId, setReposicaoEditandoId] = useState(null);

    const token = localStorage.getItem("token");

    const totalPendentes = reposicoes.filter((item) => !item.feito).length;
    const totalConcluidas = reposicoes.filter((item) => item.feito).length;
    const totalProdutosPendentes = reposicoes
        .filter((item) => !item.feito)
        .reduce((total, item) => total + (item.produtos?.length || 0), 0);

    const produtosFiltrados = useMemo(() => {
        const termo = busca
            .trim()
            .toLocaleLowerCase("pt-BR");

        if (!termo) {
            return produtos;
        }

        return produtos.filter((produto) => {
            const nome = String(produto.nome || "")
                .toLocaleLowerCase("pt-BR");

            const codigoBarras = String(
                produto.codigo_barras || ""
            ).toLocaleLowerCase("pt-BR");

            return (
                nome.includes(termo) ||
                codigoBarras.includes(termo)
            );
        });
    }, [busca, produtos]);

    async function lerResposta(resp) {
        const dados = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            throw new Error(dados.detail || "Não foi possível concluir a operação.");
        }

        return dados;
    }

    async function carregarReposicoes() {
        const resp = await fetch(`${API_URL}/reposicoes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const dados = await lerResposta(resp);
        setReposicoes(Array.isArray(dados) ? dados : []);
    }

    async function carregarDados() {
        if (!token) {
            setErro("Sua sessão expirou. Entre novamente.");
            setCarregando(false);
            return;
        }

        setCarregando(true);
        setErro("");

        try {
            const [respProdutos, respEmpresa, respReposicoes] = await Promise.all([
                fetch(`${API_URL}/reposicoes/produtos`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/clientes/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/reposicoes`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const [listaProdutos, dadosEmpresa, listaReposicoes] = await Promise.all([
                lerResposta(respProdutos),
                lerResposta(respEmpresa),
                lerResposta(respReposicoes)
            ]);

            setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
            setEmpresa(dadosEmpresa);
            setReposicoes(Array.isArray(listaReposicoes) ? listaReposicoes : []);
        } catch (err) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    function abrirNovaReposicao() {
        setReposicaoEditandoId(null);
        setBusca("");
        setDataCompra("");
        setProdutosSelecionados([]);
        setErro("");
        setModalAberto(true);
    }

    function abrirEditarReposicao(reposicao) {
        if (reposicao.feito) {
            return;
        }

        const ids = String(reposicao.reposicao || "")
            .split(",")
            .map((id) => Number(id.trim()))
            .filter((id) => Number.isInteger(id) && id > 0);

        setReposicaoEditandoId(reposicao.id);
        setBusca("");
        setDataCompra(reposicao.data ? String(reposicao.data).slice(0, 10) : "");
        setProdutosSelecionados(ids);
        setErro("");
        setModalAberto(true);
    }

    function alternarProduto(produtoId) {
        setProdutosSelecionados((listaAtual) => {
            if (listaAtual.includes(produtoId)) {
                return listaAtual.filter((id) => id !== produtoId);
            }

            return [...listaAtual, produtoId];
        });
    }

    async function salvarReposicao() {
        if (produtosSelecionados.length === 0) {
            setErro("Adicione pelo menos um produto à reposição.");
            return;
        }

        setSalvando(true);
        setErro("");

        try {
            const editando = reposicaoEditandoId !== null;
            const url = editando
                ? `${API_URL}/reposicoes/${reposicaoEditandoId}`
                : `${API_URL}/reposicoes`;

            const resp = await fetch(url, {
                method: editando ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    produtos_ids: produtosSelecionados,
                    data: dataCompra || null
                })
            });

            await lerResposta(resp);
            await carregarReposicoes();
            setModalAberto(false);
            setReposicaoEditandoId(null);
        } catch (err) {
            setErro(err.message);
        } finally {
            setSalvando(false);
        }
    }

    async function alterarFeito(reposicaoId, feito) {
        setErro("");

        try {
            const resp = await fetch(`${API_URL}/reposicoes/${reposicaoId}/feito`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ feito })
            });

            await lerResposta(resp);

            setReposicoes((listaAtual) =>
                listaAtual.map((item) =>
                    item.id === reposicaoId ? { ...item, feito } : item
                )
            );
        } catch (err) {
            setErro(err.message);
        }
    }

    async function baixarPdf(reposicao) {
        setErro("");

        try {
            const resp = await fetch(`${API_URL}/reposicoes/${reposicao.id}/pdf`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!resp.ok) {
                const dados = await resp.json().catch(() => ({}));
                throw new Error(dados.detail || "Não foi possível gerar o PDF.");
            }

            const arquivo = await resp.blob();
            const url = URL.createObjectURL(arquivo);
            const link = document.createElement("a");

            link.href = url;
            link.download = `reposicao-${reposicao.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setErro(err.message);
        }
    }

    function formatarData(data) {
        if (!data) return "";

        return new Intl.DateTimeFormat("pt-BR", {
            timeZone: "UTC"
        }).format(new Date(`${data}T00:00:00Z`));
    }

    return (
        <div className="administracao-reposicao-pagina">
            <div className="administracao-reposicao-cabecalho">
                <div className="administracao-reposicao-identidade">
                    {empresa?.imagem ? (
                        <div className="administracao-reposicao-logo-area">
                            <img
                                src={empresa.imagem}
                                alt={empresa?.loja || "Logo da empresa"}
                                className="administracao-reposicao-logo"
                            />
                        </div>
                    ) : (
                        <div className="administracao-reposicao-logo-placeholder">R</div>
                    )}

                    <div>
                        <span className="administracao-reposicao-legenda">
                            {empresa?.loja || "Controle de compras"}
                        </span>
                        <h1 className="administracao-reposicao-titulo">Reposição</h1>
                        <p className="administracao-reposicao-subtitulo">
                            Organize os produtos da próxima compra da empresa.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="administracao-reposicao-nova-botao"
                    onClick={abrirNovaReposicao}
                >
                    <span className="administracao-reposicao-nova-icone">+</span>
                    Nova reposição
                </button>
            </div>

            <div className="administracao-reposicao-indicadores">
                <div className="administracao-reposicao-indicador administracao-reposicao-indicador-destaque">
                    <span>Pendentes</span>
                    <strong>{totalPendentes}</strong>
                    <small>listas aguardando compra</small>
                </div>

                <div className="administracao-reposicao-indicador">
                    <span>Produtos pendentes</span>
                    <strong>{totalProdutosPendentes}</strong>
                    <small>itens para repor</small>
                </div>

                <div className="administracao-reposicao-indicador">
                    <span>Concluídas</span>
                    <strong>{totalConcluidas}</strong>
                    <small>listas já finalizadas</small>
                </div>
            </div>

            {erro && (
                <div className="administracao-reposicao-erro">{erro}</div>
            )}

            {carregando ? (
                <div className="administracao-reposicao-vazio">Carregando...</div>
            ) : reposicoes.length === 0 ? (
                <div className="administracao-reposicao-vazio">
                    Nenhuma reposição cadastrada.
                </div>
            ) : (
                <div className="administracao-reposicao-lista">
                    {reposicoes.map((reposicao) => (
                        <article
                            key={reposicao.id}
                            className={`administracao-reposicao-card ${reposicao.feito ? "administracao-reposicao-card-feito" : ""
                                }`}
                        >
                            <div className="administracao-reposicao-card-informacoes">
                                <span className="administracao-reposicao-card-codigo">
                                    <span className={`administracao-reposicao-status ${reposicao.feito
                                        ? "administracao-reposicao-status-feito"
                                        : "administracao-reposicao-status-pendente"
                                        }`}>
                                        {reposicao.feito ? "Concluída" : "Pendente"}
                                    </span>
                                    Reposição #{reposicao.id}
                                </span>

                                {reposicao.data && (
                                    <strong className="administracao-reposicao-card-data">
                                        Compra em {formatarData(reposicao.data)}
                                    </strong>
                                )}

                                <span className="administracao-reposicao-card-quantidade">
                                    {reposicao.produtos?.length || 0} produto(s)
                                </span>

                                <p className="administracao-reposicao-card-produtos">
                                    {(reposicao.produtos || [])
                                        .map((produto) => produto.nome)
                                        .join(", ")}
                                </p>
                            </div>

                            <div className="administracao-reposicao-card-acoes">
                                {!reposicao.feito && (
                                    <button
                                        type="button"
                                        className="administracao-reposicao-editar-botao"
                                        onClick={() => abrirEditarReposicao(reposicao)}
                                    >
                                        Editar
                                    </button>
                                )}

                                <label className="administracao-reposicao-feito-controle">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(reposicao.feito)}
                                        onChange={(evento) =>
                                            alterarFeito(reposicao.id, evento.target.checked)
                                        }
                                    />
                                    Feito
                                </label>

                                <button
                                    type="button"
                                    className="administracao-reposicao-pdf-botao"
                                    onClick={() => baixarPdf(reposicao)}
                                >
                                    <span aria-hidden="true">↓</span>
                                    Baixar PDF
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {modalAberto &&
                createPortal(
                    <div
                        className="administracao-reposicao-modal-fundo"
                        onMouseDown={(evento) => {
                            if (evento.target === evento.currentTarget) {
                                setModalAberto(false);
                            }
                        }}
                    >
                        <div className="administracao-reposicao-modal">
                            <div className="administracao-reposicao-modal-topo">
                                <div className="administracao-reposicao-modal-titulo-area">
                                    <div className="administracao-reposicao-modal-icone">
                                        {reposicaoEditandoId !== null ? "✎" : "+"}
                                    </div>
                                    <div>
                                        <span className="administracao-reposicao-modal-legenda">
                                            Lista de compras
                                        </span>
                                        <h2>
                                            {reposicaoEditandoId !== null
                                                ? "Editar reposição"
                                                : "Nova reposição"}
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="administracao-reposicao-modal-fechar"
                                    onClick={() => setModalAberto(false)}
                                    aria-label="Fechar"
                                >
                                    ×
                                </button>
                            </div>

                            <label className="administracao-reposicao-campo">
                                <span>Data da compra, opcional</span>
                                <input
                                    type="date"
                                    value={dataCompra}
                                    onChange={(evento) => setDataCompra(evento.target.value)}
                                />
                            </label>

                            <label className="administracao-reposicao-campo">
                                <span>Procurar produto</span>
                                <input
                                    type="search"
                                    value={busca}
                                    onChange={(evento) => setBusca(evento.target.value)}
                                    placeholder="Digite o nome ou código de barras"
                                    autoFocus
                                />
                            </label>

                            <div className="administracao-reposicao-produtos-lista">
                                {produtosFiltrados.map((produto) => {
                                    const selecionado = produtosSelecionados.includes(produto.id);

                                    return (
                                        <button
                                            type="button"
                                            key={produto.id}
                                            className={`administracao-reposicao-produto-opcao ${selecionado
                                                ? "administracao-reposicao-produto-selecionado"
                                                : ""
                                                }`}
                                            onClick={() => alternarProduto(produto.id)}
                                        >
                                            <span className="administracao-reposicao-produto-check">
                                                {selecionado ? "✓" : ""}
                                            </span>
                                            <span>{produto.nome}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="administracao-reposicao-modal-rodape">
                                <span>{produtosSelecionados.length} selecionado(s)</span>

                                <button
                                    type="button"
                                    className="administracao-reposicao-salvar-botao"
                                    onClick={salvarReposicao}
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : reposicaoEditandoId !== null
                                            ? "Salvar alterações"
                                            : "Salvar reposição"}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body

                )}
        </div>
    );
}
