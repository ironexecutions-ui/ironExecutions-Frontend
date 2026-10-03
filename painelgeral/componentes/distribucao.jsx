import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../config";
import "./distribucao.css";

export default function Distribuicao() {
    const [comercios, setComercios] = useState([]);
    const [comerciosDestino, setComerciosDestino] = useState([]);

    const [comercioSelecionado, setComercioSelecionado] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [produtosTeste, setProdutosTeste] = useState([]);

    const [produtosSelecionados, setProdutosSelecionados] = useState([]);

    const [comercioDestino, setComercioDestino] = useState("");

    const [buscaComercio, setBuscaComercio] = useState("");
    const [buscaProduto, setBuscaProduto] = useState("");
    const [buscaTeste, setBuscaTeste] = useState("");

    const [carregandoComercios, setCarregandoComercios] = useState(true);
    const [carregandoProdutos, setCarregandoProdutos] = useState(false);
    const [carregandoTestes, setCarregandoTestes] = useState(false);

    const [copiando, setCopiando] = useState(false);
    const [apagandoTeste, setApagandoTeste] = useState(false);

    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        carregarComercios();
        carregarComerciosDestino();
        carregarProdutosTeste();
    }, []);

    function obterHeaders() {
        const token = localStorage.getItem("token");

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    async function tratarResposta(resposta) {
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                dados?.detail ||
                dados?.message ||
                "Não foi possível concluir a operação."
            );
        }

        return dados;
    }

    async function carregarComercios() {
        try {
            setCarregandoComercios(true);
            setErro("");

            const resposta = await fetch(
                `${API_URL}/distribuicao/comercios`,
                {
                    method: "GET",
                    headers: obterHeaders(),
                }
            );

            const dados = await tratarResposta(resposta);

            setComercios(Array.isArray(dados) ? dados : []);
        } catch (error) {
            console.error(error);
            setErro(
                error.message ||
                "Erro ao carregar os comércios."
            );
        } finally {
            setCarregandoComercios(false);
        }
    }

    async function carregarComerciosDestino() {
        try {
            const resposta = await fetch(
                `${API_URL}/distribuicao/comercios/destino`,
                {
                    method: "GET",
                    headers: obterHeaders(),
                }
            );

            const dados = await tratarResposta(resposta);

            setComerciosDestino(
                Array.isArray(dados) ? dados : []
            );
        } catch (error) {
            console.error(error);
        }
    }

    async function carregarProdutos(comercioId) {
        if (!comercioId) {
            return;
        }

        try {
            setCarregandoProdutos(true);
            setErro("");
            setMensagem("");
            setProdutosSelecionados([]);

            const resposta = await fetch(
                `${API_URL}/distribuicao/comercio/${comercioId}/produtos`,
                {
                    method: "GET",
                    headers: obterHeaders(),
                }
            );

            const dados = await tratarResposta(resposta);

            setProdutos(Array.isArray(dados) ? dados : []);
        } catch (error) {
            console.error(error);

            setProdutos([]);

            setErro(
                error.message ||
                "Erro ao carregar os produtos do comércio."
            );
        } finally {
            setCarregandoProdutos(false);
        }
    }

    async function carregarProdutosTeste() {
        try {
            setCarregandoTestes(true);

            const resposta = await fetch(
                `${API_URL}/distribuicao/testes`,
                {
                    method: "GET",
                    headers: obterHeaders(),
                }
            );

            const dados = await tratarResposta(resposta);

            setProdutosTeste(
                Array.isArray(dados) ? dados : []
            );
        } catch (error) {
            console.error(error);
            setProdutosTeste([]);
        } finally {
            setCarregandoTestes(false);
        }
    }

    function selecionarComercio(comercio) {
        setComercioSelecionado(comercio);
        setBuscaProduto("");
        setMensagem("");
        setErro("");

        carregarProdutos(comercio.id);
    }

    function voltarParaComercios() {
        setComercioSelecionado(null);
        setProdutos([]);
        setProdutosSelecionados([]);
        setBuscaProduto("");
        setMensagem("");
        setErro("");
    }

    function alternarProduto(produtoId) {
        setProdutosSelecionados((estadoAtual) => {
            if (estadoAtual.includes(produtoId)) {
                return estadoAtual.filter(
                    (id) => id !== produtoId
                );
            }

            return [...estadoAtual, produtoId];
        });
    }

    function selecionarTodosVisiveis() {
        const idsVisiveis = produtosFiltrados.map(
            (produto) => produto.id
        );

        setProdutosSelecionados((estadoAtual) => {
            const todosSelecionados = idsVisiveis.every(
                (id) => estadoAtual.includes(id)
            );

            if (todosSelecionados) {
                return estadoAtual.filter(
                    (id) => !idsVisiveis.includes(id)
                );
            }

            return [
                ...new Set([
                    ...estadoAtual,
                    ...idsVisiveis,
                ]),
            ];
        });
    }

    async function copiarProdutos() {
        if (produtosSelecionados.length === 0) {
            setErro("Selecione pelo menos um produto.");
            return;
        }

        if (!comercioDestino) {
            setErro(
                "Selecione o comércio de destino."
            );
            return;
        }

        if (
            String(comercioSelecionado?.id) ===
            String(comercioDestino)
        ) {
            setErro(
                "O comércio de destino precisa ser diferente do comércio de origem."
            );
            return;
        }

        try {
            setCopiando(true);
            setErro("");
            setMensagem("");

            let quantidadeCopiada = 0;

            for (const produtoId of produtosSelecionados) {
                const resposta = await fetch(
                    `${API_URL}/distribuicao/copiar`,
                    {
                        method: "POST",
                        headers: obterHeaders(),
                        body: JSON.stringify({
                            produto_id: produtoId,
                            comercio_destino_id:
                                Number(comercioDestino),
                        }),
                    }
                );

                await tratarResposta(resposta);

                quantidadeCopiada += 1;
            }

            setProdutosSelecionados([]);

            setMensagem(
                `${quantidadeCopiada} ${quantidadeCopiada === 1
                    ? "produto foi copiado"
                    : "produtos foram copiados"
                } com sucesso.`
            );
        } catch (error) {
            console.error(error);

            setErro(
                error.message ||
                "Erro ao copiar os produtos."
            );
        } finally {
            setCopiando(false);
        }
    }

    async function apagarProdutoTeste(produtoId) {
        const confirmar = window.confirm(
            "Deseja realmente apagar este produto de teste?"
        );

        if (!confirmar) {
            return;
        }

        try {
            setApagandoTeste(true);
            setErro("");
            setMensagem("");

            const resposta = await fetch(
                `${API_URL}/distribuicao/produto/${produtoId}`,
                {
                    method: "DELETE",
                    headers: obterHeaders(),
                }
            );

            await tratarResposta(resposta);

            setProdutosTeste((estadoAtual) =>
                estadoAtual.filter(
                    (produto) => produto.id !== produtoId
                )
            );

            setMensagem(
                "Produto de teste apagado com sucesso."
            );
        } catch (error) {
            console.error(error);

            setErro(
                error.message ||
                "Erro ao apagar o produto de teste."
            );
        } finally {
            setApagandoTeste(false);
        }
    }

    async function apagarTodosTestes() {
        if (produtosTeste.length === 0) {
            setMensagem(
                "Não existem produtos de teste para apagar."
            );
            return;
        }

        const confirmar = window.confirm(
            `Deseja realmente apagar todos os ${produtosTeste.length} produtos de teste?`
        );

        if (!confirmar) {
            return;
        }

        try {
            setApagandoTeste(true);
            setErro("");
            setMensagem("");

            const resposta = await fetch(
                `${API_URL}/distribuicao/testes`,
                {
                    method: "DELETE",
                    headers: obterHeaders(),
                }
            );

            await tratarResposta(resposta);

            setProdutosTeste([]);

            setMensagem(
                "Todos os produtos de teste foram apagados com sucesso."
            );
        } catch (error) {
            console.error(error);

            setErro(
                error.message ||
                "Erro ao apagar os produtos de teste."
            );
        } finally {
            setApagandoTeste(false);
        }
    }

    function formatarPreco(preco) {
        if (
            preco === null ||
            preco === undefined ||
            preco === ""
        ) {
            return "R$ 0,00";
        }

        const numero = Number(preco);

        if (Number.isNaN(numero)) {
            return "R$ 0,00";
        }

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function obterImagem(produto) {
        if (!produto?.imagem_url) {
            return null;
        }

        return String(produto.imagem_url)
            .split("|")[0]
            .trim();
    }

    function obterNomeComercio(comercioId) {
        const comercio = comerciosDestino.find(
            (item) =>
                String(item.id) ===
                String(comercioId)
        );

        return comercio?.nome || `Comércio #${comercioId}`;
    }

    const comerciosFiltrados = useMemo(() => {
        const termo = buscaComercio
            .toLowerCase()
            .trim();

        if (!termo) {
            return comercios;
        }

        return comercios.filter((comercio) => {
            return (
                String(comercio.nome || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(comercio.id || "")
                    .includes(termo)
            );
        });
    }, [comercios, buscaComercio]);

    const produtosFiltrados = useMemo(() => {
        const termo = buscaProduto
            .toLowerCase()
            .trim();

        if (!termo) {
            return produtos;
        }

        return produtos.filter((produto) => {
            return (
                String(produto.nome || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(produto.categoria || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(produto.variedade || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(produto.id || "")
                    .includes(termo)
            );
        });
    }, [produtos, buscaProduto]);

    const produtosTesteFiltrados = useMemo(() => {
        const termo = buscaTeste
            .toLowerCase()
            .trim();

        if (!termo) {
            return produtosTeste;
        }

        return produtosTeste.filter((produto) => {
            return (
                String(produto.nome || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(produto.teste || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(produto.id || "")
                    .includes(termo)
            );
        });
    }, [produtosTeste, buscaTeste]);

    const todosVisiveisSelecionados =
        produtosFiltrados.length > 0 &&
        produtosFiltrados.every((produto) =>
            produtosSelecionados.includes(produto.id)
        );

    return (
        <div className="painel-distribuicao-container">

            <div className="painel-distribuicao-topo">

                <div className="painel-distribuicao-titulo-area">

                    <span className="painel-distribuicao-etiqueta">
                        DISTRIBUIÇÃO
                    </span>

                    <h2>
                        {comercioSelecionado
                            ? comercioSelecionado.nome
                            : "Distribuição de produtos"}
                    </h2>

                    <p>
                        {comercioSelecionado
                            ? "Selecione os produtos deste comércio e distribua para outro comércio."
                            : "Escolha um comércio para visualizar e distribuir seus produtos."}
                    </p>

                </div>

                <div className="painel-distribuicao-topo-acoes">

                    {comercioSelecionado && (
                        <button
                            type="button"
                            className="painel-distribuicao-botao-secundario"
                            onClick={voltarParaComercios}
                        >
                            ← Comércios
                        </button>
                    )}

                    <button
                        type="button"
                        className="painel-distribuicao-botao-atualizar"
                        onClick={() => {
                            carregarComercios();
                            carregarComerciosDestino();

                            if (comercioSelecionado) {
                                carregarProdutos(
                                    comercioSelecionado.id
                                );
                            }

                            carregarProdutosTeste();
                        }}
                    >
                        ↻ Atualizar
                    </button>

                </div>

            </div>

            {erro && (
                <div className="painel-distribuicao-alerta painel-distribuicao-alerta-erro">
                    <strong>Não foi possível concluir.</strong>
                    <span>{erro}</span>

                    <button
                        type="button"
                        onClick={() => setErro("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {mensagem && (
                <div className="painel-distribuicao-alerta painel-distribuicao-alerta-sucesso">
                    <strong>Operação concluída</strong>
                    <span>{mensagem}</span>

                    <button
                        type="button"
                        onClick={() => setMensagem("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {!comercioSelecionado && (
                <>
                    <div className="painel-distribuicao-controles">

                        <div className="painel-distribuicao-busca">

                            <span className="painel-distribuicao-icone-busca">
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Buscar comércio..."
                                value={buscaComercio}
                                onChange={(e) =>
                                    setBuscaComercio(
                                        e.target.value
                                    )
                                }
                            />

                            {buscaComercio && (
                                <button
                                    type="button"
                                    className="painel-distribuicao-limpar-busca"
                                    onClick={() =>
                                        setBuscaComercio("")
                                    }
                                >
                                    ×
                                </button>
                            )}

                        </div>

                        <div className="painel-distribuicao-contador">
                            <strong>
                                {comerciosFiltrados.length}
                            </strong>

                            <span>
                                {comerciosFiltrados.length === 1
                                    ? "comércio"
                                    : "comércios"}
                            </span>
                        </div>

                    </div>

                    {carregandoComercios ? (
                        <div className="painel-distribuicao-carregando">
                            <div className="painel-distribuicao-spinner"></div>

                            <span>
                                Carregando comércios...
                            </span>
                        </div>
                    ) : comerciosFiltrados.length === 0 ? (
                        <div className="painel-distribuicao-vazio">

                            <div className="painel-distribuicao-vazio-icone">
                                ◌
                            </div>

                            <h3>
                                Nenhum comércio encontrado
                            </h3>

                            <p>
                                Não existem comércios correspondentes à pesquisa.
                            </p>

                        </div>
                    ) : (
                        <div className="painel-distribuicao-comercios-grid">

                            {comerciosFiltrados.map(
                                (comercio) => (
                                    <button
                                        type="button"
                                        key={comercio.id}
                                        className="painel-distribuicao-comercio-card"
                                        onClick={() =>
                                            selecionarComercio(
                                                comercio
                                            )
                                        }
                                    >

                                        <div className="painel-distribuicao-comercio-imagem">
                                            {comercio.imagem ? (
                                                <img
                                                    src={comercio.imagem}
                                                    alt={comercio.nome || "Comércio"}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                        e.currentTarget.parentElement.classList.add(
                                                            "sem-imagem"
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <span>
                                                    {String(comercio.nome || "C")
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="painel-distribuicao-comercio-info">

                                            <span>
                                                Comércio
                                            </span>

                                            <strong>
                                                {comercio.nome ||
                                                    `Comércio #${comercio.id}`}
                                            </strong>

                                            <small>
                                                ID #{comercio.id}
                                            </small>

                                        </div>

                                        <div className="painel-distribuicao-comercio-seta">
                                            →
                                        </div>

                                    </button>
                                )
                            )}

                        </div>
                    )}

                    <section className="painel-distribuicao-testes">

                        <div className="painel-distribuicao-secao-cabecalho">

                            <div>
                                <span className="painel-distribuicao-mini-etiqueta">
                                    LIMPEZA
                                </span>

                                <h3>
                                    Produtos de teste
                                </h3>

                                <p>
                                    Produtos que possuem conteúdo no campo teste.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="painel-distribuicao-botao-perigo"
                                disabled={
                                    apagandoTeste ||
                                    produtosTeste.length === 0
                                }
                                onClick={
                                    apagarTodosTestes
                                }
                            >
                                {apagandoTeste
                                    ? "Apagando..."
                                    : "Apagar todos"}
                            </button>

                        </div>

                        <div className="painel-distribuicao-teste-controles">

                            <div className="painel-distribuicao-busca">

                                <span className="painel-distribuicao-icone-busca">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    placeholder="Buscar produto de teste..."
                                    value={buscaTeste}
                                    onChange={(e) =>
                                        setBuscaTeste(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            <div className="painel-distribuicao-contador">
                                <strong>
                                    {produtosTesteFiltrados.length}
                                </strong>

                                <span>
                                    {produtosTesteFiltrados.length ===
                                        1
                                        ? "teste"
                                        : "testes"}
                                </span>
                            </div>

                        </div>

                        {carregandoTestes ? (
                            <div className="painel-distribuicao-carregando">
                                <div className="painel-distribuicao-spinner"></div>

                                <span>
                                    Carregando testes...
                                </span>
                            </div>
                        ) : produtosTesteFiltrados.length ===
                            0 ? (
                            <div className="painel-distribuicao-teste-vazio">
                                Nenhum produto de teste encontrado.
                            </div>
                        ) : (
                            <div className="painel-distribuicao-teste-lista">

                                {produtosTesteFiltrados.map(
                                    (produto) => {

                                        const imagem =
                                            obterImagem(
                                                produto
                                            );

                                        return (
                                            <div
                                                key={
                                                    produto.id
                                                }
                                                className="painel-distribuicao-teste-item"
                                            >

                                                <div className="painel-distribuicao-teste-imagem">

                                                    {imagem ? (
                                                        <img
                                                            src={
                                                                imagem
                                                            }
                                                            alt={
                                                                produto.nome ||
                                                                "Produto"
                                                            }
                                                        />
                                                    ) : (
                                                        <span>
                                                            Sem foto
                                                        </span>
                                                    )}

                                                </div>

                                                <div className="painel-distribuicao-teste-info">

                                                    <strong>
                                                        {produto.nome ||
                                                            "Produto sem nome"}
                                                    </strong>

                                                    <span>
                                                        ID #
                                                        {
                                                            produto.id
                                                        }
                                                    </span>

                                                    <small>
                                                        Comércio:{" "}
                                                        {obterNomeComercio(
                                                            produto.comercio_id
                                                        )}
                                                    </small>

                                                </div>

                                                <div className="painel-distribuicao-teste-valor">
                                                    {formatarPreco(
                                                        produto.preco
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="painel-distribuicao-teste-excluir"
                                                    disabled={
                                                        apagandoTeste
                                                    }
                                                    onClick={() =>
                                                        apagarProdutoTeste(
                                                            produto.id
                                                        )
                                                    }
                                                >
                                                    Excluir
                                                </button>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </section>
                </>
            )}

            {comercioSelecionado && (
                <>

                    <div className="painel-distribuicao-origem">

                        <div className="painel-distribuicao-origem-icon">
                            {String(
                                comercioSelecionado.nome ||
                                "C"
                            )
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <span>
                                COMÉRCIO DE ORIGEM
                            </span>

                            <strong>
                                {comercioSelecionado.nome}
                            </strong>

                            <small>
                                ID #
                                {comercioSelecionado.id}
                            </small>
                        </div>

                    </div>

                    <div className="painel-distribuicao-acoes">

                        <div className="painel-distribuicao-destino">

                            <label>
                                Comércio de destino
                            </label>

                            <select
                                value={comercioDestino}
                                onChange={(e) =>
                                    setComercioDestino(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Selecione o comércio de destino
                                </option>

                                {comerciosDestino
                                    .filter(
                                        (comercio) =>
                                            String(
                                                comercio.id
                                            ) !==
                                            String(
                                                comercioSelecionado.id
                                            )
                                    )
                                    .map((comercio) => (
                                        <option
                                            key={
                                                comercio.id
                                            }
                                            value={
                                                comercio.id
                                            }
                                        >
                                            {comercio.nome ||
                                                `Comércio #${comercio.id}`}
                                        </option>
                                    ))}
                            </select>

                        </div>

                        <div className="painel-distribuicao-selecao-resumo">

                            <span>
                                Produtos selecionados
                            </span>

                            <strong>
                                {
                                    produtosSelecionados.length
                                }
                            </strong>

                        </div>

                        <button
                            type="button"
                            className="painel-distribuicao-botao-copiar"
                            disabled={
                                copiando ||
                                produtosSelecionados.length ===
                                0 ||
                                !comercioDestino
                            }
                            onClick={copiarProdutos}
                        >
                            {copiando
                                ? "Copiando produtos..."
                                : `Copiar ${produtosSelecionados.length ||
                                ""
                                } produto${produtosSelecionados.length ===
                                    1
                                    ? ""
                                    : "s"
                                }`}
                        </button>

                    </div>

                    <div className="painel-distribuicao-controles">

                        <div className="painel-distribuicao-busca">

                            <span className="painel-distribuicao-icone-busca">
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Buscar produto..."
                                value={buscaProduto}
                                onChange={(e) =>
                                    setBuscaProduto(
                                        e.target.value
                                    )
                                }
                            />

                            {buscaProduto && (
                                <button
                                    type="button"
                                    className="painel-distribuicao-limpar-busca"
                                    onClick={() =>
                                        setBuscaProduto("")
                                    }
                                >
                                    ×
                                </button>
                            )}

                        </div>

                        <div className="painel-distribuicao-selecao-todos">

                            <span>
                                {produtosFiltrados.length}{" "}
                                {produtosFiltrados.length ===
                                    1
                                    ? "produto"
                                    : "produtos"}
                            </span>

                            <button
                                type="button"
                                onClick={
                                    selecionarTodosVisiveis
                                }
                                disabled={
                                    produtosFiltrados.length ===
                                    0
                                }
                            >
                                {todosVisiveisSelecionados
                                    ? "Desmarcar todos"
                                    : "Selecionar todos"}
                            </button>

                        </div>

                    </div>

                    {carregandoProdutos ? (
                        <div className="painel-distribuicao-carregando">
                            <div className="painel-distribuicao-spinner"></div>

                            <span>
                                Carregando produtos...
                            </span>
                        </div>
                    ) : produtosFiltrados.length ===
                        0 ? (
                        <div className="painel-distribuicao-vazio">

                            <div className="painel-distribuicao-vazio-icone">
                                ◌
                            </div>

                            <h3>
                                Nenhum produto encontrado
                            </h3>

                            <p>
                                Este comércio não possui produtos disponíveis para distribuição.
                            </p>

                        </div>
                    ) : (
                        <div className="painel-distribuicao-grid">

                            {produtosFiltrados.map(
                                (produto) => {

                                    const imagem =
                                        obterImagem(
                                            produto
                                        );

                                    const selecionado =
                                        produtosSelecionados.includes(
                                            produto.id
                                        );

                                    return (
                                        <article
                                            key={
                                                produto.id
                                            }
                                            className={`painel-distribuicao-card ${selecionado
                                                ? "selecionado"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                alternarProduto(
                                                    produto.id
                                                )
                                            }
                                        >

                                            <div className="painel-distribuicao-card-selecao">

                                                <span
                                                    className={`painel-distribuicao-checkbox ${selecionado
                                                        ? "ativo"
                                                        : ""
                                                        }`}
                                                >
                                                    {selecionado
                                                        ? "✓"
                                                        : ""}
                                                </span>

                                            </div>

                                            <div className="painel-distribuicao-card-imagem">

                                                {imagem ? (
                                                    <img
                                                        src={
                                                            imagem
                                                        }
                                                        alt={
                                                            produto.nome ||
                                                            "Produto"
                                                        }
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="painel-distribuicao-sem-imagem">
                                                        <span>
                                                            Sem imagem
                                                        </span>
                                                    </div>
                                                )}

                                                <span className="painel-distribuicao-status disponivel">
                                                    Disponível
                                                </span>

                                            </div>

                                            <div className="painel-distribuicao-card-conteudo">

                                                <div className="painel-distribuicao-card-identificacao">

                                                    <span className="painel-distribuicao-card-id">
                                                        #
                                                        {
                                                            produto.id
                                                        }
                                                    </span>

                                                    {produto.categoria && (
                                                        <span className="painel-distribuicao-card-categoria">
                                                            {
                                                                produto.categoria
                                                            }
                                                        </span>
                                                    )}

                                                </div>

                                                <h3>
                                                    {produto.nome ||
                                                        "Produto sem nome"}
                                                </h3>

                                                {produto.variedade && (
                                                    <span className="painel-distribuicao-variedade">
                                                        {
                                                            produto.variedade
                                                        }
                                                    </span>
                                                )}

                                                {produto.descricao_curta && (
                                                    <p className="painel-distribuicao-card-descricao">
                                                        {
                                                            produto.descricao_curta
                                                        }
                                                    </p>
                                                )}

                                                <div className="painel-distribuicao-card-rodape">

                                                    <div className="painel-distribuicao-preco">

                                                        <span>
                                                            Preço
                                                        </span>

                                                        <strong>
                                                            {formatarPreco(
                                                                produto.preco
                                                            )}
                                                        </strong>

                                                    </div>

                                                    {produto.unidades !==
                                                        null &&
                                                        produto.unidades !==
                                                        undefined && (
                                                            <div className="painel-distribuicao-estoque">

                                                                <span>
                                                                    Estoque
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        produto.unidades
                                                                    }
                                                                </strong>

                                                            </div>
                                                        )}

                                                </div>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>
                    )}

                </>
            )}

        </div>
    );
}