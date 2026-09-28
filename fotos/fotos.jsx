import React, {
    useEffect,
    useState
} from "react";

import { API_URL } from "../config";

import "./fotos.css";



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
    const [
        autenticado,
        setAutenticado
    ] = useState(
        !!localStorage.getItem("token")
    );

    const [
        loginEmail,
        setLoginEmail
    ] = useState("");

    const [
        loginSenha,
        setLoginSenha
    ] = useState("");

    const [
        loginCarregando,
        setLoginCarregando
    ] = useState(false);

    const [
        loginErro,
        setLoginErro
    ] = useState("");

    const token =
        localStorage.getItem("token");

    // =====================================================
    // LOGIN LOCAL DA PÁGINA
    // =====================================================

    async function fazerLoginFotos(e) {

        e.preventDefault();

        setLoginErro("");
        setLoginCarregando(true);

        try {

            const resposta = await fetch(
                `${API_URL}/login/email`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: loginEmail,
                        senha: loginSenha
                    })
                }
            );

            const dados =
                await resposta.json();

            if (!resposta.ok) {

                setLoginErro(
                    dados?.detail ||
                    "E-mail ou senha inválidos."
                );

                return;
            }

            const novoToken =
                dados?.token ||
                dados?.access_token ||
                dados?.jwt ||
                dados?.accessToken;

            if (!novoToken) {

                setLoginErro(
                    "O servidor não retornou o token de acesso."
                );

                return;
            }

            localStorage.setItem(
                "token",
                novoToken
            );

            // =================================================
            // SALVAR DADOS DO USUÁRIO
            // =================================================

            try {

                const partes =
                    novoToken.split(".");

                if (partes.length >= 2) {

                    const payloadBase64 =
                        partes[1]
                            .replace(/-/g, "+")
                            .replace(/_/g, "/");

                    const payload =
                        JSON.parse(
                            decodeURIComponent(
                                atob(payloadBase64)
                                    .split("")
                                    .map(
                                        caractere =>
                                            `%${(
                                                "00" +
                                                caractere
                                                    .charCodeAt(0)
                                                    .toString(16)
                                            ).slice(-2)}`
                                    )
                                    .join("")
                            )
                        );

                    localStorage.setItem(
                        "cliente",
                        JSON.stringify(payload)
                    );
                }

            } catch (erroToken) {

                console.warn(
                    "[FOTOS] Não foi possível ler o payload do token.",
                    erroToken
                );
            }

            // =================================================
            // LOGIN CONCLUÍDO
            // =================================================

            setAutenticado(true);
            setLoginEmail("");
            setLoginSenha("");
            setLoginErro("");

        } catch (erro) {

            console.error(
                "[FOTOS] Erro no login:",
                erro
            );

            setLoginErro(
                "Não foi possível conectar ao servidor."
            );

        } finally {

            setLoginCarregando(false);
        }
    }
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

            if (!localStorage.getItem("token")) {

                setAutenticado(false);
                setCarregando(false);

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

                setAutenticado(false);
                setCarregando(false);

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


    useEffect(() => {

        if (autenticado) {
            carregarProdutos();
        } else {
            setCarregando(false);
        }

    }, [autenticado]);



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

    if (!autenticado) {

        return (
            <div className="fotos-produtos-pagina">

                <div className="fotos-produtos-login">

                    <div className="fotos-produtos-login-cabecalho">

                        <span className="fotos-produtos-login-label">
                            GESTÃO DE IMAGENS
                        </span>

                        <h1 className="fotos-produtos-login-titulo">
                            Acesso necessário
                        </h1>

                        <p className="fotos-produtos-login-subtitulo">
                            Entre na sua conta para acessar
                            os links disponíveis para fotos.
                        </p>

                    </div>

                    {loginErro && (
                        <div className="fotos-produtos-login-erro">
                            {loginErro}
                        </div>
                    )}

                    <form
                        className="fotos-produtos-login-form"
                        onSubmit={fazerLoginFotos}
                    >

                        <div className="fotos-produtos-login-campo">

                            <label>
                                E-mail
                            </label>

                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) =>
                                    setLoginEmail(
                                        e.target.value
                                    )
                                }
                                autoComplete="email"
                                placeholder="Digite seu e-mail"
                                required
                            />

                        </div>

                        <div className="fotos-produtos-login-campo">

                            <label>
                                Senha
                            </label>

                            <input
                                type="password"
                                value={loginSenha}
                                onChange={(e) =>
                                    setLoginSenha(
                                        e.target.value
                                    )
                                }
                                autoComplete="current-password"
                                placeholder="Digite sua senha"
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            className="fotos-produtos-login-botao"
                            disabled={loginCarregando}
                        >

                            {loginCarregando
                                ? "Entrando..."
                                : "Entrar"
                            }

                        </button>

                    </form>

                </div>

            </div>
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