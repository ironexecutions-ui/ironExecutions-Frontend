import React, {
    useEffect,
    useState
} from "react";

import { API_URL } from "../config";

import "./fotos.css";


// =========================================================
// FOTOS PRODUTOS
// =========================================================
//
// Lista os links temporários disponíveis para tirar fotos
// pelo celular.
//
// Cada link permanece disponível por 5 minutos.
//
// Fluxo:
//
// /fotos
//     ↓
// lista dos acessos temporários ativos
//     ↓
// /adicionar-foto/{token}
//     ↓
// celular tira as fotos
//
// =========================================================


export default function FotosProdutos() {

    const [
        produtos,
        setProdutos
    ] = useState([]);


    const [
        carregando,
        setCarregando
    ] = useState(true);


    const [
        erro,
        setErro
    ] = useState("");


    const token =
        localStorage.getItem("token");


    // =====================================================
    // CARREGAR LINKS DISPONÍVEIS
    // =====================================================

    async function carregarProdutos() {

        setCarregando(true);

        setErro("");


        try {

            // =============================================
            // VALIDAR LOGIN
            // =============================================

            if (!token) {

                window.location.href =
                    "/login";

                return;
            }


            // =============================================
            // CONSULTAR LINKS TEMPORÁRIOS
            // =============================================

            const resposta = await fetch(
                `${API_URL}/upload/client/produtos-sem-imagem`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            // =============================================
            // TOKEN INVÁLIDO
            // =============================================

            if (resposta.status === 401) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                window.location.href =
                    "/login";

                return;
            }


            // =============================================
            // LER RESPOSTA
            // =============================================

            const dados =
                await resposta.json();


            // =============================================
            // ERRO DA API
            // =============================================

            if (!resposta.ok) {

                throw new Error(
                    dados?.detail ||
                    "Não foi possível carregar os links disponíveis."
                );
            }


            // =============================================
            // LINKS
            // =============================================
            //
            // A API agora retorna:
            //
            // {
            //     ok: true,
            //     total: 1,
            //     links: [...]
            // }
            //
            // =============================================

            setProdutos(
                Array.isArray(dados?.links)
                    ? [...dados.links].sort(
                        (a, b) =>
                            Number(b?.segundos_restantes || 0) -
                            Number(a?.segundos_restantes || 0)
                    )
                    : []
            );

        } catch (e) {

            console.error(
                "[FOTOS PRODUTOS]",
                e
            );


            setErro(
                e.message ||
                "Erro ao carregar os links disponíveis."
            );

        } finally {

            setCarregando(false);
        }
    }


    // =====================================================
    // CARREGAR AO ABRIR A PÁGINA
    // =====================================================

    useEffect(() => {

        carregarProdutos();

    }, []);


    // =====================================================
    // ABRIR LINK
    // =====================================================
    //
    // O link já vem pronto da API:
    //
    // https://ironexecutions.com.br/adicionar-foto/{token}
    //
    // ================================================

    function abrirLink(produto) {

        if (!produto?.url) {

            setErro(
                "Link de foto não encontrado."
            );

            return;
        }


        window.location.href =
            produto.url;
    }


    // =====================================================
    // FORMATAR TEMPO RESTANTE
    // =====================================================

    function formatarTempo(segundos) {

        const total =
            Math.max(
                0,
                Number(segundos) || 0
            );


        const minutos =
            Math.floor(
                total / 60
            );


        const segundosRestantes =
            total % 60;


        return (
            `${minutos}:${String(
                segundosRestantes
            ).padStart(2, "0")}`
        );
    }


    // =====================================================
    // LISTA
    // =====================================================

    return (

        <div className="fotos-produtos-pagina">


            {/* ================================================= */}
            {/* TOPO */}
            {/* ================================================= */}

            <div className="fotos-produtos-topo">

                <div>

                    <span className="fotos-produtos-topo-label">

                        GESTÃO DE IMAGENS

                    </span>


                    <h1 className="fotos-produtos-titulo">

                        Links disponíveis para fotos

                    </h1>


                    <p className="fotos-produtos-subtitulo">

                        Acesse um link ativo para abrir a
                        câmera do celular e adicionar fotos
                        ao produto.

                    </p>

                </div>


                {/* ================================================= */}
                {/* CONTADOR */}
                {/* ================================================= */}

                <div className="fotos-produtos-acoes-topo">

                    <button
                        type="button"
                        className="fotos-produtos-botao-atualizar"
                        onClick={carregarProdutos}
                        disabled={carregando}
                    >
                        <span
                            className={
                                carregando
                                    ? "fotos-produtos-icone-atualizar carregando"
                                    : "fotos-produtos-icone-atualizar"
                            }
                        >
                            ↻
                        </span>

                        <span>
                            {carregando
                                ? "Atualizando..."
                                : "Atualizar lista"
                            }
                        </span>
                    </button>

                    <div className="fotos-produtos-contador">

                        <strong>
                            {produtos.length}
                        </strong>

                        <span>
                            {produtos.length === 1
                                ? "link ativo"
                                : "links ativos"
                            }
                        </span>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* CARREGANDO */}
            {/* ================================================= */}

            {carregando && (

                <div className="fotos-produtos-estado">

                    <div
                        className="fotos-produtos-spinner"
                    />

                    <span>

                        Procurando links disponíveis...

                    </span>

                </div>
            )}


            {/* ================================================= */}
            {/* ERRO */}
            {/* ================================================= */}

            {!carregando && erro && (

                <div className="fotos-produtos-erro">

                    <strong>

                        Não foi possível carregar
                        os links.

                    </strong>


                    <span>

                        {erro}

                    </span>


                    <button
                        type="button"
                        className="fotos-produtos-botao-retry"
                        onClick={
                            carregarProdutos
                        }
                    >

                        Tentar novamente

                    </button>

                </div>
            )}


            {/* ================================================= */}
            {/* NENHUM LINK */}
            {/* ================================================= */}

            {!carregando &&
                !erro &&
                produtos.length === 0 && (

                    <div className="fotos-produtos-vazio">

                        <div className="fotos-produtos-vazio-icone">

                            +

                        </div>


                        <h2>

                            Nenhum link ativo

                        </h2>


                        <p>

                            Não existem links disponíveis
                            para tirar fotos no momento.

                            Gere um novo acesso pelo
                            formulário do produto.

                        </p>

                    </div>
                )
            }


            {/* ================================================= */}
            {/* LISTA DE LINKS */}
            {/* ================================================= */}

            {!carregando &&
                !erro &&
                produtos.length > 0 && (

                    <div className="fotos-produtos-lista">

                        {produtos.map(
                            (acesso) => {

                                const produto =
                                    acesso?.produto || {};


                                return (

                                    <button
                                        key={acesso.id}
                                        type="button"
                                        className="fotos-produtos-card"
                                        onClick={() =>
                                            abrirLink(
                                                acesso
                                            )
                                        }
                                    >


                                        {/* ================================= */}
                                        {/* ÍCONE */}
                                        {/* ================================= */}

                                        <div className="fotos-produtos-card-imagem">

                                            <div className="fotos-produtos-card-imagem-icone">

                                                📷

                                            </div>

                                        </div>


                                        {/* ================================= */}
                                        {/* CONTEÚDO */}
                                        {/* ================================= */}

                                        <div className="fotos-produtos-card-conteudo">


                                            {/* CATEGORIA */}

                                            <span className="fotos-produtos-card-categoria">

                                                {produto.categoria ||
                                                    "Produto"
                                                }

                                            </span>


                                            {/* NOME */}

                                            <strong className="fotos-produtos-card-nome">

                                                {produto.nome ||
                                                    "Produto sem nome"
                                                }

                                            </strong>


                                            {/* VARIEDADE */}

                                            {produto.variedade && (

                                                <span className="fotos-produtos-card-variedade">

                                                    {produto.variedad_primaria ||
                                                        "Variedade"
                                                    }

                                                    {": "}

                                                    {produto.variedade}

                                                </span>
                                            )}


                                            {/* PREÇO */}

                                            <span className="fotos-produtos-card-preco">

                                                R${" "}

                                                {Number(
                                                    produto.preco || 0
                                                ).toFixed(2)}

                                            </span>


                                            {/* ================================= */}
                                            {/* TEMPO RESTANTE */}
                                            {/* ================================= */}

                                            <span
                                                className="fotos-produtos-card-tempo"
                                            >

                                                Disponível por{" "}

                                                <strong>

                                                    {formatarTempo(
                                                        acesso.segundos_restantes
                                                    )}

                                                </strong>

                                            </span>

                                        </div>


                                        {/* ================================= */}
                                        {/* AÇÃO */}
                                        {/* ================================= */}

                                        <div className="fotos-produtos-card-acao">

                                            <span>

                                                Abrir câmera

                                            </span>


                                            <strong>

                                                →

                                            </strong>

                                        </div>

                                    </button>
                                );
                            }
                        )}

                    </div>
                )
            }

        </div>
    );
}