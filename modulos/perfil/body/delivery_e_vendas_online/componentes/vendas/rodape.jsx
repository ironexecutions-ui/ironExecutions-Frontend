import React, {
    useEffect,
    useState
} from "react";

import { API_URL } from "../../../../../../config";

import "./rodape.css";


const REDES_SOCIAIS = [
    {
        campo: "instagram",
        nome: "Instagram",
        sigla: "IG",
        placeholder: "https://instagram.com/sualoja",
        ajuda: "Perfil oficial da sua loja no Instagram"
    },
    {
        campo: "tiktok",
        nome: "TikTok",
        sigla: "TK",
        placeholder: "https://tiktok.com/@sualoja",
        ajuda: "Perfil oficial da sua loja no TikTok"
    },
    {
        campo: "youtube",
        nome: "YouTube",
        sigla: "YT",
        placeholder: "https://youtube.com/@sualoja",
        ajuda: "Canal oficial da sua loja no YouTube"
    },
    {
        campo: "x",
        nome: "X",
        sigla: "X",
        placeholder: "https://x.com/sualoja",
        ajuda: "Perfil oficial da sua loja no X"
    },
    {
        campo: "facebook",
        nome: "Facebook",
        sigla: "FB",
        placeholder: "https://facebook.com/sualoja",
        ajuda: "Página oficial da sua loja no Facebook"
    },
    {
        campo: "whatsapp",
        nome: "WhatsApp",
        sigla: "WA",
        placeholder: "5511912345678",
        ajuda: "Número de atendimento com DDD e código do país"
    }
];


export default function Rodape() {

    // ============================================================
    // ESTADOS
    // ============================================================

    const [carregando, setCarregando] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);

    const [limpando, setLimpando] =
        useState(false);

    const [dominioCadastrado, setDominioCadastrado] =
        useState(false);

    const [dominio, setDominio] =
        useState("");

    const [podeEditar, setPodeEditar] =
        useState(false);

    const [redes, setRedes] =
        useState({
            instagram: "",
            tiktok: "",
            youtube: "",
            x: "",
            facebook: "",
            whatsapp: ""
        });

    const [mensagem, setMensagem] =
        useState("");

    const [erro, setErro] =
        useState("");

    const [sucesso, setSucesso] =
        useState("");


    // ============================================================
    // TOKEN
    // ============================================================

    function obterToken() {

        return localStorage.getItem(
            "token"
        );

    }


    // ============================================================
    // MENSAGEM DE ERRO
    // ============================================================

    function obterMensagemErro(
        dados
    ) {

        if (!dados) {

            return "Erro desconhecido.";

        }

        if (
            typeof dados.detail ===
            "string"
        ) {

            return dados.detail;

        }

        if (
            Array.isArray(
                dados.detail
            )
        ) {

            return dados.detail
                .map((item) => {

                    return (
                        item?.msg ||
                        item?.message ||
                        "Erro de validação"
                    );

                })
                .join(" | ");

        }

        if (
            dados.detail &&
            typeof dados.detail ===
            "object"
        ) {

            if (
                typeof dados.detail.mensagem ===
                "string"
            ) {

                return dados.detail.mensagem;

            }

            try {

                return JSON.stringify(
                    dados.detail
                );

            } catch {

                return "Erro de validação.";

            }

        }

        if (
            typeof dados.mensagem ===
            "string"
        ) {

            return dados.mensagem;

        }

        if (
            typeof dados.message ===
            "string"
        ) {

            return dados.message;

        }

        return "Não foi possível concluir a operação.";

    }


    // ============================================================
    // VERIFICAR SESSÃO
    // ============================================================

    function verificarSessao(
        resposta
    ) {

        if (
            resposta.status !== 401
        ) {

            return false;

        }

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "usuario"
        );

        window.location.replace(
            "/"
        );

        return true;

    }


    // ============================================================
    // ALTERAR REDE
    // ============================================================

    function alterarRede(
        campo,
        valor
    ) {

        setRedes(
            (anteriores) => ({
                ...anteriores,
                [campo]: valor
            })
        );

        setErro("");

        setSucesso("");

    }


    // ============================================================
    // CARREGAR RODAPÉ
    // ============================================================

    useEffect(() => {

        let componenteAtivo =
            true;


        async function carregarRodape() {

            try {

                setCarregando(
                    true
                );

                setErro("");

                setSucesso("");

                const token =
                    obterToken();

                if (!token) {

                    if (
                        componenteAtivo
                    ) {

                        setErro(
                            "Sessão não encontrada."
                        );

                    }

                    return;

                }

                const resposta =
                    await fetch(
                        `${API_URL}/ironstore/configuracao/rodape`,
                        {
                            method: "GET",

                            headers: {

                                Accept:
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            }

                        }
                    );

                if (
                    verificarSessao(
                        resposta
                    )
                ) {

                    return;

                }

                const dados =
                    await resposta.json();

                if (!resposta.ok) {

                    throw new Error(
                        obterMensagemErro(
                            dados
                        )
                    );

                }

                if (
                    !componenteAtivo
                ) {

                    return;

                }

                // ====================================================
                // DOMÍNIO
                // ====================================================

                const temDominio =
                    dados?.dominio_cadastrado ===
                    true;

                setDominioCadastrado(
                    temDominio
                );

                setDominio(
                    dados?.dominio ||
                    ""
                );

                // ====================================================
                // PERMISSÃO
                // ====================================================

                setPodeEditar(
                    dados?.pode_editar ===
                    true
                );

                // ====================================================
                // RODAPÉ
                // ====================================================

                const rodape =
                    dados?.rodape;

                if (!rodape) {

                    setRedes({
                        instagram: "",
                        tiktok: "",
                        youtube: "",
                        x: "",
                        facebook: "",
                        whatsapp: ""
                    });

                    setMensagem("");

                    return;

                }

                setRedes({

                    instagram:
                        rodape.instagram || "",

                    tiktok:
                        rodape.tiktok || "",

                    youtube:
                        rodape.youtube || "",

                    x:
                        rodape.x || "",

                    facebook:
                        rodape.facebook || "",

                    whatsapp:
                        rodape.whatsapp || ""

                });

                setMensagem(
                    rodape.mensagem ||
                    ""
                );

            } catch (
            erroCarregamento
            ) {

                console.error(
                    "[IRONSTORE RODAPÉ]",
                    erroCarregamento
                );

                if (
                    componenteAtivo
                ) {

                    setErro(
                        erroCarregamento?.message ||
                        "Não foi possível carregar o rodapé."
                    );

                }

            } finally {

                if (
                    componenteAtivo
                ) {

                    setCarregando(
                        false
                    );

                }

            }

        }


        carregarRodape();


        return () => {

            componenteAtivo =
                false;

        };

    }, []);


    // ============================================================
    // SALVAR
    // ============================================================

    async function salvarRodape(
        event
    ) {

        event.preventDefault();

        if (
            !dominioCadastrado
        ) {

            setErro(
                "Cadastre um domínio antes de configurar o rodapé."
            );

            return;

        }

        if (
            !podeEditar
        ) {

            setErro(
                "Você não possui permissão para alterar o rodapé."
            );

            return;

        }

        try {

            setSalvando(
                true
            );

            setErro("");

            setSucesso("");

            const token =
                obterToken();

            if (!token) {

                setErro(
                    "Sessão não encontrada."
                );

                return;

            }

            // ====================================================
            // O DOMÍNIO NÃO É ENVIADO
            // BACKEND DESCOBRE PELO JWT
            // ====================================================

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/configuracao/rodape`,
                    {
                        method: "PUT",

                        headers: {

                            Accept:
                                "application/json",

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                instagram:
                                    redes.instagram.trim() ||
                                    null,

                                tiktok:
                                    redes.tiktok.trim() ||
                                    null,

                                youtube:
                                    redes.youtube.trim() ||
                                    null,

                                x:
                                    redes.x.trim() ||
                                    null,

                                facebook:
                                    redes.facebook.trim() ||
                                    null,

                                whatsapp:
                                    redes.whatsapp.trim() ||
                                    null,

                                mensagem:
                                    mensagem.trim() ||
                                    null

                            })

                    }
                );

            if (
                verificarSessao(
                    resposta
                )
            ) {

                return;

            }

            const dados =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    obterMensagemErro(
                        dados
                    )
                );

            }

            if (
                dados?.rodape
            ) {

                const rodapeAtualizado =
                    dados.rodape;

                setRedes({

                    instagram:
                        rodapeAtualizado.instagram || "",

                    tiktok:
                        rodapeAtualizado.tiktok || "",

                    youtube:
                        rodapeAtualizado.youtube || "",

                    x:
                        rodapeAtualizado.x || "",

                    facebook:
                        rodapeAtualizado.facebook || "",

                    whatsapp:
                        rodapeAtualizado.whatsapp || ""

                });

                setMensagem(
                    rodapeAtualizado.mensagem ||
                    ""
                );

            }

            setSucesso(
                dados?.mensagem ||
                "Rodapé salvo com sucesso."
            );

        } catch (
        erroSalvamento
        ) {

            console.error(
                "[IRONSTORE RODAPÉ SALVAR]",
                erroSalvamento
            );

            setErro(
                erroSalvamento?.message ||
                "Não foi possível salvar o rodapé."
            );

        } finally {

            setSalvando(
                false
            );

        }

    }


    // ============================================================
    // LIMPAR
    // ============================================================

    async function limparRodape() {

        if (
            !dominioCadastrado ||
            !podeEditar ||
            limpando
        ) {

            return;

        }

        const confirmou =
            window.confirm(
                "Deseja remover todas as redes sociais e a mensagem do rodapé? O registro continuará salvo."
            );

        if (!confirmou) {

            return;

        }

        try {

            setLimpando(
                true
            );

            setErro("");

            setSucesso("");

            const token =
                obterToken();

            if (!token) {

                setErro(
                    "Sessão não encontrada."
                );

                return;

            }

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/configuracao/rodape/limpar`,
                    {
                        method: "PUT",

                        headers: {

                            Accept:
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        }

                    }
                );

            if (
                verificarSessao(
                    resposta
                )
            ) {

                return;

            }

            const dados =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    obterMensagemErro(
                        dados
                    )
                );

            }

            setRedes({
                instagram: "",
                tiktok: "",
                youtube: "",
                x: "",
                facebook: "",
                whatsapp: ""
            });

            setMensagem("");

            setSucesso(
                dados?.mensagem ||
                "Rodapé limpo com sucesso."
            );

        } catch (
        erroLimpeza
        ) {

            console.error(
                "[IRONSTORE RODAPÉ LIMPAR]",
                erroLimpeza
            );

            setErro(
                erroLimpeza?.message ||
                "Não foi possível limpar o rodapé."
            );

        } finally {

            setLimpando(
                false
            );

        }

    }


    // ============================================================
    // POSSUI CONTEÚDO
    // ============================================================

    const quantidadeRedes =
        Object.values(
            redes
        ).filter(
            (valor) =>
                String(
                    valor || ""
                ).trim()
        ).length;


    const possuiConteudo =
        quantidadeRedes > 0 ||
        mensagem.trim();


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <section className="ironstore-rodape-config-area">

            <div className="ironstore-rodape-config-cabecalho">

                <div className="ironstore-rodape-config-titulos">

                    <span className="ironstore-rodape-config-etiqueta">
                        Contato e presença digital
                    </span>

                    <h2 className="ironstore-rodape-config-titulo">
                        Rodapé da loja
                    </h2>

                    <p className="ironstore-rodape-config-descricao">
                        Configure as redes sociais, WhatsApp e a mensagem exibida no rodapé da sua loja.
                    </p>

                </div>

            </div>


            {carregando ? (

                <div className="ironstore-rodape-config-carregando">

                    <div className="ironstore-rodape-config-spinner" />

                    <span>
                        Carregando rodapé...
                    </span>

                </div>

            ) : !dominioCadastrado ? (

                <div className="ironstore-rodape-config-sem-dominio">

                    <div className="ironstore-rodape-config-sem-dominio-icone">
                        !
                    </div>

                    <div className="ironstore-rodape-config-sem-dominio-conteudo">

                        <span className="ironstore-rodape-config-sem-dominio-etiqueta">
                            Configuração necessária
                        </span>

                        <h3 className="ironstore-rodape-config-sem-dominio-titulo">
                            Cadastre o domínio da sua loja
                        </h3>

                        <p className="ironstore-rodape-config-sem-dominio-texto">
                            Antes de configurar o rodapé, registre o domínio que será utilizado pela IronStore.
                        </p>

                    </div>

                </div>

            ) : (

                <form
                    className="ironstore-rodape-config-formulario"
                    onSubmit={salvarRodape}
                >

                    <div className="ironstore-rodape-config-dominio">

                        <div className="ironstore-rodape-config-dominio-status">

                            <span className="ironstore-rodape-config-dominio-ponto" />

                            <span className="ironstore-rodape-config-dominio-label">
                                Loja vinculada
                            </span>

                        </div>

                        <strong className="ironstore-rodape-config-dominio-valor">
                            {dominio}
                        </strong>

                        <span className="ironstore-rodape-config-dominio-ajuda">
                            O domínio é identificado automaticamente pelo seu comércio.
                        </span>

                    </div>


                    <div className="ironstore-rodape-config-bloco">

                        <div className="ironstore-rodape-config-bloco-cabecalho">

                            <div className="ironstore-rodape-config-bloco-titulos">

                                <span className="ironstore-rodape-config-bloco-etiqueta">
                                    Redes sociais
                                </span>

                                <h3 className="ironstore-rodape-config-bloco-titulo">
                                    Canais da sua loja
                                </h3>

                                <p className="ironstore-rodape-config-bloco-descricao">
                                    Adicione somente os canais que deseja exibir publicamente no site.
                                </p>

                            </div>

                            <div className="ironstore-rodape-config-contador">

                                <strong>
                                    {quantidadeRedes}
                                </strong>

                                <span>
                                    / 6
                                </span>

                            </div>

                        </div>


                        <div className="ironstore-rodape-config-redes-grid">

                            {REDES_SOCIAIS.map(
                                (rede) => (

                                    <div
                                        key={rede.campo}
                                        className="ironstore-rodape-config-rede-card"
                                    >

                                        <div className="ironstore-rodape-config-rede-topo">

                                            <span className="ironstore-rodape-config-rede-icone">
                                                {rede.sigla}
                                            </span>

                                            <div className="ironstore-rodape-config-rede-identidade">

                                                <label
                                                    htmlFor={`ironstore-rodape-${rede.campo}`}
                                                    className="ironstore-rodape-config-rede-label"
                                                >
                                                    {rede.nome}
                                                </label>

                                                <small>
                                                    {rede.ajuda}
                                                </small>

                                            </div>

                                        </div>

                                        <input
                                            id={`ironstore-rodape-${rede.campo}`}
                                            type="text"
                                            className="ironstore-rodape-config-input"
                                            value={redes[rede.campo]}
                                            onChange={(event) =>
                                                alterarRede(
                                                    rede.campo,
                                                    event.target.value
                                                )
                                            }
                                            placeholder={rede.placeholder}
                                            disabled={!podeEditar}
                                            autoComplete="off"
                                        />

                                        <div className="ironstore-rodape-config-rede-status">

                                            <span
                                                className={
                                                    redes[rede.campo].trim()
                                                        ? "ironstore-rodape-config-rede-status-ponto ironstore-rodape-config-rede-status-ponto-ativo"
                                                        : "ironstore-rodape-config-rede-status-ponto"
                                                }
                                            />

                                            <span>
                                                {
                                                    redes[rede.campo].trim()
                                                        ? "Configurado"
                                                        : "Não configurado"
                                                }
                                            </span>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>


                    <div className="ironstore-rodape-config-bloco">

                        <div className="ironstore-rodape-config-bloco-cabecalho">

                            <div className="ironstore-rodape-config-bloco-titulos">

                                <span className="ironstore-rodape-config-bloco-etiqueta">
                                    Mensagem
                                </span>

                                <h3 className="ironstore-rodape-config-bloco-titulo">
                                    Texto do rodapé
                                </h3>

                                <p className="ironstore-rodape-config-bloco-descricao">
                                    Adicione uma mensagem curta para complementar as informações da loja.
                                </p>

                            </div>

                        </div>


                        <div className="ironstore-rodape-config-mensagem-campo">

                            <textarea
                                id="ironstore-rodape-mensagem"
                                className="ironstore-rodape-config-textarea"
                                value={mensagem}
                                onChange={(event) => {
                                    setMensagem(
                                        event.target.value
                                    );

                                    setErro("");

                                    setSucesso("");
                                }}
                                placeholder="Qualidade, confiança e praticidade para você."
                                maxLength={300}
                                disabled={!podeEditar}
                            />

                            <div className="ironstore-rodape-config-mensagem-rodape">

                                <span>
                                    Esta mensagem aparecerá no rodapé público da loja.
                                </span>

                                <strong>
                                    {mensagem.length}/300
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="ironstore-rodape-config-regra">

                        <div className="ironstore-rodape-config-regra-icone">
                            i
                        </div>

                        <div className="ironstore-rodape-config-regra-conteudo">

                            <strong>
                                Exibição automática
                            </strong>

                            <span>
                                Somente redes sociais preenchidas serão exibidas no rodapé público da IronStore.
                            </span>

                        </div>

                    </div>


                    {!podeEditar && (

                        <div className="ironstore-rodape-config-permissao">

                            <strong>
                                Somente visualização
                            </strong>

                            <span>
                                Apenas administradores podem alterar o rodapé da loja.
                            </span>

                        </div>

                    )}


                    {erro && (

                        <div className="ironstore-rodape-config-erro">

                            <strong>
                                Não foi possível concluir
                            </strong>

                            <span>
                                {erro}
                            </span>

                        </div>

                    )}


                    {sucesso && (

                        <div className="ironstore-rodape-config-sucesso">

                            <strong>
                                Alteração registrada
                            </strong>

                            <span>
                                {sucesso}
                            </span>

                        </div>

                    )}


                    {podeEditar && (

                        <div className="ironstore-rodape-config-acoes">

                            <div className="ironstore-rodape-config-acoes-info">

                                <span>
                                    {quantidadeRedes} rede(s) configurada(s)
                                </span>

                                <strong>
                                    {
                                        possuiConteudo
                                            ? "Rodapé configurado"
                                            : "Rodapé vazio"
                                    }
                                </strong>

                            </div>

                            <div className="ironstore-rodape-config-acoes-botoes">

                                <button
                                    type="button"
                                    className="ironstore-rodape-config-limpar"
                                    onClick={limparRodape}
                                    disabled={
                                        limpando ||
                                        salvando ||
                                        !possuiConteudo
                                    }
                                >
                                    {
                                        limpando
                                            ? "Limpando..."
                                            : "Limpar rodapé"
                                    }
                                </button>

                                <button
                                    type="submit"
                                    className="ironstore-rodape-config-salvar"
                                    disabled={
                                        salvando ||
                                        limpando
                                    }
                                >
                                    {
                                        salvando
                                            ? "Salvando..."
                                            : "Salvar rodapé"
                                    }
                                </button>

                            </div>

                        </div>

                    )}

                </form>

            )}

        </section>

    );

}