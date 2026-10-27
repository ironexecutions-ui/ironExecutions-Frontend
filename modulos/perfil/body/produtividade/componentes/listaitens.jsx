import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useVenda } from "./vendaprovider";
import { API_URL } from "../../../../../config";
import "./listaitens.css";

const CODIGOS_IMPRESSAO = ["10", "11"];

const NOMES_IMPRESSAO = [

    "impressão branco e preto",

    "impressão colorida"

];

function normalizarTexto(valor) {

    return String(valor ?? "")

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g, "")

        .trim()

        .toLowerCase();

}

function ehProdutoImpressao(item) {

    const codigo = String(

        item?.codigo_barras ??

        item?.codigo_barra ??

        item?.codigo ??

        ""

    ).trim();

    const nome = normalizarTexto(item?.nome);

    return (

        CODIGOS_IMPRESSAO.includes(codigo) ||

        NOMES_IMPRESSAO.some(

            nomeImpressao => normalizarTexto(nomeImpressao) === nome

        )

    );

}

function obterUrlArquivo(arquivo) {
    const caminho = String(arquivo ?? "").trim();

    if (!caminho) return "";

    // Mantém URLs completas que já estejam cadastradas.
    if (/^https?:\/\//i.test(caminho)) {
        return caminho;
    }

    // Usa apenas o nome do arquivo, sem diretórios.
    const nomeArquivo = caminho
        .replace(/\\/g, "/")
        .split("/")
        .pop();

    if (
        !nomeArquivo ||
        nomeArquivo === "." ||
        nomeArquivo === ".."
    ) {
        return "";
    }

    return `${API_URL.replace(/\/+$/, "")}/arquivos-impressao/${encodeURIComponent(nomeArquivo)}`;
}

export default function ListaItens() {

    const {

        itens,

        aumentarQuantidade,

        diminuirQuantidade,

        removerItem,

        promocaoAplicada,

        removerPromocao,

        valorDesconto

    } = useVenda();

    const [tema, setTema] = useState("escuro");

    const [modalImpressaoAberto, setModalImpressaoAberto] =

        useState(false);

    const [arquivosImpressao, setArquivosImpressao] =

        useState([]);

    const [carregandoImpressao, setCarregandoImpressao] =

        useState(false);

    const [erroImpressao, setErroImpressao] =

        useState("");

    const [produtoImpressaoSelecionado, setProdutoImpressaoSelecionado] =

        useState("");

    useEffect(() => {

        async function definirTema() {

            let modoCliente = null;

            try {

                const token = localStorage.getItem("token");

                if (token) {

                    const resp = await fetch(

                        `${API_URL}/api/clientes/modo`,

                        {

                            headers: {

                                Authorization: `Bearer ${token}`

                            }

                        }

                    );

                    if (resp.ok) {

                        const data = await resp.json();

                        modoCliente = data.modo;

                    }

                }

            } catch {

                modoCliente = null;

            }

            if (modoCliente === 1) {

                setTema("escuro");

                return;

            }

            if (modoCliente === 2) {

                setTema("claro");

                return;

            }

            const hora = new Date().getHours();

            setTema(

                hora >= 18 || hora < 6

                    ? "escuro"

                    : "claro"

            );

        }

        definirTema();

    }, []);

    useEffect(() => {

        if (!modalImpressaoAberto) return;

        function tratarTecla(evento) {

            if (evento.key === "Escape") {

                fecharModalImpressao();

            }

        }

        document.addEventListener("keydown", tratarTecla);

        return () => {

            document.removeEventListener("keydown", tratarTecla);

        };

    }, [modalImpressaoAberto]);
    async function atualizarArquivosImpressao() {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sua sessão expirou. Entre novamente.");
            }

            const resposta = await fetch(
                `${API_URL}/impressao/arquivos-recentes`,
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados?.detail ||
                    "Não foi possível atualizar os arquivos de impressão."
                );
            }

            setArquivosImpressao(
                Array.isArray(dados.arquivos) ? dados.arquivos : []
            );

            setErroImpressao("");
        } catch (erro) {
            console.error(
                "[IMPRESSÃO] Erro ao atualizar arquivos:",
                erro
            );
        }
    }
    useEffect(() => {
        if (!modalImpressaoAberto) return;

        let cancelado = false;
        let temporizador = null;
        let controller = null;

        async function atualizarPeriodicamente() {
            if (cancelado) return;

            controller = new AbortController();

            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Sua sessão expirou. Entre novamente.");
                }

                const resposta = await fetch(
                    `${API_URL}/impressao/arquivos-recentes`,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Cache-Control": "no-cache",
                            Pragma: "no-cache",
                        },
                    }
                );

                const dados = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    throw new Error(
                        dados?.detail ||
                        `Falha ao consultar arquivos (HTTP ${resposta.status}).`
                    );
                }

                if (!cancelado) {
                    setArquivosImpressao(
                        Array.isArray(dados.arquivos)
                            ? dados.arquivos
                            : []
                    );

                    setErroImpressao("");
                }
            } catch (erro) {
                if (erro.name !== "AbortError" && !cancelado) {
                    console.error("[IMPRESSÃO] Falha na atualização:", erro);

                    setErroImpressao(
                        erro.message ||
                        "Não foi possível atualizar os arquivos."
                    );
                }
            } finally {
                if (!cancelado) {
                    temporizador = setTimeout(
                        atualizarPeriodicamente,
                        5000
                    );
                }
            }
        }

        atualizarPeriodicamente();

        return () => {
            cancelado = true;
            clearTimeout(temporizador);
            controller?.abort();
        };
    }, [modalImpressaoAberto]);
    async function abrirModalImpressao(item) {

        if (modalImpressaoAberto) return;

        setProdutoImpressaoSelecionado(item.nome);

        setModalImpressaoAberto(true);

        setArquivosImpressao([]);

        setErroImpressao("");

        setCarregandoImpressao(true);

        try {

            const token = localStorage.getItem("token");

            if (!token) {

                throw new Error("Sua sessão expirou. Entre novamente.");

            }

            const resposta = await fetch(

                `${API_URL}/impressao/chamada`,

                {

                    method: "POST",

                    cache: "no-store",

                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Cache-Control": "no-cache"

                    }

                }

            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {

                throw new Error(

                    dados?.detail ||

                    "Não foi possível carregar os arquivos de impressão."

                );

            }

            setArquivosImpressao(

                Array.isArray(dados.arquivos)

                    ? dados.arquivos

                    : []

            );

        } catch (erro) {

            setErroImpressao(

                erro?.message ||

                "Erro ao consultar os arquivos de impressão."

            );

        } finally {

            setCarregandoImpressao(false);

        }

    }

    function fecharModalImpressao() {

        setModalImpressaoAberto(false);

        setArquivosImpressao([]);

        setErroImpressao("");

        setProdutoImpressaoSelecionado("");

        setCarregandoImpressao(false);

    }

    if (itens.length === 0 && !promocaoAplicada) {

        return (

            <>

                <div className={`lista-itens-box tema-${tema}`}>

                    <p className="lista-vazio">

                        Nenhum item adicionado

                    </p>

                </div>

                {modalImpressaoAberto &&
                    createPortal(
                        renderizarModal(),
                        document.body
                    )}
            </>

        );

    }

    function renderizarModal() {

        return (

            <div

                className="im-modal-fundo"

                onMouseDown={(evento) => {

                    if (evento.target === evento.currentTarget) {

                        fecharModalImpressao();

                    }

                }}

            >

                <section

                    className="im-modal"

                    role="dialog"

                    aria-modal="true"

                    aria-labelledby="im-modal-titulo"

                >

                    <header className="im-modal-cabecalho">

                        <div className="im-modal-identidade">

                            <div className="im-modal-icone">

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

                            <div>

                                <h2 id="im-modal-titulo">

                                    Arquivos para impressão

                                </h2>

                                <p>{produtoImpressaoSelecionado}</p>

                            </div>

                        </div>

                        <button

                            type="button"

                            className="im-modal-fechar"

                            onClick={fecharModalImpressao}

                            aria-label="Fechar arquivos de impressão"

                            title="Fechar"

                        >

                            ×

                        </button>

                    </header>

                    <div className="im-modal-conteudo">

                        {carregandoImpressao && (

                            <div className="im-modal-estado">

                                <span className="im-modal-spinner" />

                                <p>Buscando arquivos recentes...</p>

                            </div>

                        )}

                        {!carregandoImpressao && erroImpressao && (

                            <div className="im-modal-erro" role="alert">

                                <strong>Não foi possível carregar</strong>

                                <p>{erroImpressao}</p>

                            </div>

                        )}

                        {!carregandoImpressao &&

                            !erroImpressao &&

                            arquivosImpressao.length === 0 && (

                                <div className="im-modal-vazio">

                                    <div className="im-modal-vazio-icone">

                                        <svg

                                            viewBox="0 0 24 24"

                                            fill="none"

                                            aria-hidden="true"

                                        >

                                            <path

                                                d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"

                                                stroke="currentColor"

                                                strokeWidth="1.7"

                                                strokeLinejoin="round"

                                            />

                                            <path

                                                d="M14 3v6h5M9 14h6M9 17h6"

                                                stroke="currentColor"

                                                strokeWidth="1.7"

                                                strokeLinecap="round"

                                            />

                                        </svg>

                                    </div>

                                    <h3>Nenhum arquivo recente</h3>

                                    <p>

                                        Não há arquivos deste comércio

                                        cadastrados nos últimos cinco minutos.

                                    </p>

                                </div>

                            )}

                        {!carregandoImpressao &&

                            !erroImpressao &&

                            arquivosImpressao.length > 0 && (

                                <div className="im-arquivos-lista">

                                    <div className="im-arquivos-resumo">

                                        <span>

                                            {arquivosImpressao.length}{" "}

                                            {arquivosImpressao.length === 1

                                                ? "arquivo disponível"

                                                : "arquivos disponíveis"}

                                        </span>

                                        <span className="im-arquivos-periodo">

                                            Últimos 5 minutos

                                        </span>

                                    </div>

                                    {arquivosImpressao.map((arquivo) => {

                                        const url = obterUrlArquivo(

                                            arquivo.arquivo

                                        );

                                        const nomeArquivo = String(

                                            arquivo.arquivo || ""

                                        )

                                            .split(/[\\/]/)

                                            .pop() || "Arquivo de impressão";

                                        return (

                                            <a

                                                key={arquivo.id}

                                                className="im-arquivo-item"

                                                href={url || undefined}

                                                target="_blank"

                                                rel="noopener noreferrer"

                                                onClick={(evento) => {

                                                    if (!url) {

                                                        evento.preventDefault();

                                                    }

                                                }}

                                            >

                                                <span className="im-arquivo-icone">

                                                    <svg

                                                        viewBox="0 0 24 24"

                                                        fill="none"

                                                        aria-hidden="true"

                                                    >

                                                        <path

                                                            d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"

                                                            stroke="currentColor"

                                                            strokeWidth="1.7"

                                                            strokeLinejoin="round"

                                                        />

                                                        <path

                                                            d="M14 3v6h5M9 14h6M9 17h6"

                                                            stroke="currentColor"

                                                            strokeWidth="1.7"

                                                            strokeLinecap="round"

                                                        />

                                                    </svg>

                                                </span>

                                                <span className="im-arquivo-dados">

                                                    <strong title={nomeArquivo}>

                                                        {nomeArquivo}

                                                    </strong>

                                                    <small>

                                                        Abrir para visualizar e imprimir

                                                    </small>

                                                </span>

                                                <span

                                                    className="im-arquivo-abrir"

                                                    aria-hidden="true"

                                                >

                                                    ↗

                                                </span>

                                            </a>

                                        );

                                    })}

                                </div>

                            )}

                    </div>

                    <footer className="im-modal-rodape">

                        <span>

                            Somente arquivos recentes do seu comércio.

                        </span>

                        <button

                            type="button"

                            className="im-modal-botao-fechar"

                            onClick={fecharModalImpressao}

                        >

                            Fechar

                        </button>

                    </footer>

                </section>

            </div>

        );

    }

    return (

        <>

            <div className={`lista-itens-box tema-${tema}`}>

                <div className="lista-itens-conteudo">

                    {[...itens].reverse().map((item, index) => {

                        const itemImpressao = ehProdutoImpressao(item);

                        return (

                            <div

                                key={

                                    item.ehProdutoPeso

                                        ? item.itemKey

                                        : item.id

                                }

                                className={`item-linha ${item.ehProdutoPeso

                                    ? "item-linha-peso"

                                    : ""

                                    } ${itemImpressao

                                        ? "item-linha-impressao"

                                        : ""

                                    }`}

                                style={{

                                    animationDelay: `${index * 40}ms`

                                }}

                            >

                                {itemImpressao ? (

                                    <button

                                        type="button"

                                        className="lista-item-nome-impressao"

                                        onClick={() =>

                                            abrirModalImpressao(item)

                                        }

                                        title="Ver arquivos recentes de impressão"

                                    >

                                        <span className="lista-item-nome-texto">

                                            {item.nome}

                                        </span>

                                        <span

                                            className="lista-item-abrir-impressao"

                                            aria-hidden="true"

                                        >

                                            <svg

                                                viewBox="0 0 24 24"

                                                fill="none"

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

                                        </span>

                                    </button>

                                ) : (

                                    <span className="item-nome">

                                        {item.nome}

                                        {item.ehProdutoPeso ? (

                                            <span className="item-und item-und-peso">

                                                {" "}

                                                (

                                                {Number(item.gramas).toLocaleString("pt-BR")}

                                                g)

                                            </span>

                                        ) : item.unidade ? (

                                            <span className="item-und">

                                                {" "}

                                                ({item.unidade})

                                            </span>

                                        ) : null}

                                    </span>

                                )}

                                <div className="item-controles">

                                    {!item.ehProdutoPeso && (

                                        <>

                                            <button

                                                type="button"

                                                className="btn-menos"

                                                onClick={() =>

                                                    diminuirQuantidade(item.id)

                                                }

                                                aria-label={`Diminuir ${item.nome}`}

                                            >

                                                −

                                            </button>

                                            <span className="item-qtd">

                                                {item.quantidade}

                                            </span>

                                            <button

                                                type="button"

                                                className="btn-mais"

                                                onClick={() =>

                                                    aumentarQuantidade(item.id)

                                                }

                                                aria-label={`Aumentar ${item.nome}`}

                                            >

                                                +

                                            </button>

                                        </>

                                    )}

                                    {item.ehProdutoPeso && (

                                        <span className="item-peso-info">

                                            {Number(item.gramas).toLocaleString("pt-BR")}g

                                        </span>

                                    )}

                                    <button

                                        type="button"

                                        className="btn-remover"

                                        onClick={() =>

                                            removerItem(

                                                item.ehProdutoPeso

                                                    ? item.itemKey

                                                    : item.id

                                            )

                                        }

                                        aria-label={`Remover ${item.nome}`}

                                    >

                                        ×

                                    </button>

                                </div>

                                <strong className="item-preco">

                                    R${" "}

                                    {Number(item.subtotal).toLocaleString(

                                        "pt-BR",

                                        {

                                            minimumFractionDigits: 2,

                                            maximumFractionDigits: 2

                                        }

                                    )}

                                </strong>

                            </div>

                        );

                    })}

                    {promocaoAplicada && (

                        <div className="item-linha item-linha-promocao">

                            <span className="item-nome item-nome-promocao">

                                Promoção

                                <span className="item-promocao-codigo">

                                    {promocaoAplicada.codigo}

                                </span>

                                <span className="item-und item-promocao-tipo">

                                    {promocaoAplicada.tipo_desconto === "porcentagem"

                                        ? `(${Number(promocaoAplicada.desconto)}% de desconto)`

                                        : `(${Number(

                                            promocaoAplicada.desconto

                                        ).toLocaleString("pt-BR", {

                                            style: "currency",

                                            currency: "BRL"

                                        })} de desconto)`}

                                </span>

                            </span>

                            <div className="item-controles">

                                <button

                                    type="button"

                                    className="btn-remover btn-remover-promocao"

                                    onClick={removerPromocao}

                                    title="Remover promoção"

                                    aria-label="Remover promoção"

                                >

                                    ×

                                </button>

                            </div>

                            <strong className="item-preco item-preco-promocao">

                                -{" "}

                                {Number(valorDesconto || 0).toLocaleString(

                                    "pt-BR",

                                    {

                                        style: "currency",

                                        currency: "BRL"

                                    }

                                )}

                            </strong>

                        </div>

                    )}

                </div>

            </div>

            {modalImpressaoAberto &&
                createPortal(
                    renderizarModal(),
                    document.body
                )}
        </>

    );

}