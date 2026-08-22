import React, { useEffect, useState } from "react";
import CampoEditavel from "./dados_comercias/campoeditavel";
import BlocoFlags from "./dados_comercias/blocoflags";
import BlocoModulos from "./dados_comercias/blocomodulos";
import ModalEndereco from "./dados_comercias/modalendereco";
import "./dados_comerciais.css";
import { URL } from "../../url";
import BlocoPix from "./dados_comercias/blocopix";

export default function DadosComerciais() {

    const [tiposLetra, setTiposLetra] = useState([]);
    const [dados, setDados] = useState(null);
    const [abrirEndereco, setAbrirEndereco] = useState(false);
    const [imagemEnviando, setImagemEnviando] = useState(false);
    const [imagemPreview, setImagemPreview] = useState(null);
    const [imagemCarregada, setImagemCarregada] = useState(false);
    const [imagemErro, setImagemErro] = useState("");
    const [imagemSucesso, setImagemSucesso] = useState(false);
    const cliente = JSON.parse(
        localStorage.getItem("cliente") || "{}"
    );

    const token = localStorage.getItem("token");

    const podeEditar =
        cliente.funcao === "Administrador(a)";

    function obterUrlImagemComercio(imagem) {

        if (!imagem) {
            return null;
        }

        if (
            imagem.startsWith("http://") ||
            imagem.startsWith("https://") ||
            imagem.startsWith("blob:")
        ) {
            return imagem;
        }

        return `${URL}${imagem.startsWith("/") ? "" : "/"}${imagem}`;
    }
    /* =========================================================
       IDENTIFICAR COMÉRCIO
    ========================================================= */

    function obterComercioId() {

        /*
            Primeiro tenta pelo cliente,
            porque este componente já trabalha com ele.
        */

        if (cliente?.comercio_id) {
            return cliente.comercio_id;
        }


        /*
            Fallback para usuario caso o comercio_id
            esteja armazenado lá.
        */

        try {

            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "{}"
            );

            return usuario?.comercio_id || null;

        } catch {

            return null;
        }
    }


    /* =========================================================
       CHAVES DO CACHE
    ========================================================= */

    function obterChaveCacheComercio() {

        const comercioId =
            obterComercioId();

        if (!comercioId) {
            return null;
        }

        return `iron_dados_comerciais_${comercioId}`;
    }


    const CHAVE_CACHE_TIPOS_LETRA =
        "iron_tipos_letra";


    /* =========================================================
       LER CACHE DO COMÉRCIO
    ========================================================= */

    function lerCacheComercio() {

        const chave =
            obterChaveCacheComercio();

        if (!chave) {
            return null;
        }

        try {

            const salvo =
                localStorage.getItem(chave);

            if (!salvo) {
                return null;
            }

            const cache =
                JSON.parse(salvo);

            if (
                !cache ||
                typeof cache !== "object" ||
                Array.isArray(cache)
            ) {
                throw new Error(
                    "Cache do comércio inválido"
                );
            }

            return cache;

        } catch (erro) {

            console.warn(
                "[DADOS COMERCIAIS] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE DO COMÉRCIO
    ========================================================= */

    function salvarCacheComercio(novosDados) {

        const chave =
            obterChaveCacheComercio();

        if (!chave || !novosDados) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(novosDados)
            );

        } catch (erro) {

            console.warn(
                "[DADOS COMERCIAIS] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       ATUALIZAR STATE + CACHE

       Usaremos esta função sempre que algo do comércio mudar.
    ========================================================= */

    function atualizarDadosComercio(alteracoes) {

        setDados(dadosAtuais => {

            const novosDados = {
                ...(dadosAtuais || {}),
                ...alteracoes
            };

            salvarCacheComercio(
                novosDados
            );

            return novosDados;
        });
    }


    /* =========================================================
       COMPARAR CACHE COM SERVIDOR
    ========================================================= */

    function dadosIguais(cache, servidor) {

        if (!cache || !servidor) {
            return false;
        }

        try {

            return (
                JSON.stringify(cache) ===
                JSON.stringify(servidor)
            );

        } catch {

            return false;
        }
    }


    /* =========================================================
       CACHE DOS TIPOS DE LETRA
    ========================================================= */

    function lerCacheTiposLetra() {

        try {

            const salvo =
                localStorage.getItem(
                    CHAVE_CACHE_TIPOS_LETRA
                );

            if (!salvo) {
                return null;
            }

            const cache =
                JSON.parse(salvo);

            return Array.isArray(cache)
                ? cache
                : null;

        } catch {

            localStorage.removeItem(
                CHAVE_CACHE_TIPOS_LETRA
            );

            return null;
        }
    }


    function salvarCacheTiposLetra(lista) {

        if (!Array.isArray(lista)) {
            return;
        }

        try {

            localStorage.setItem(
                CHAVE_CACHE_TIPOS_LETRA,
                JSON.stringify(lista)
            );

        } catch (erro) {

            console.warn(
                "[DADOS COMERCIAIS] Erro cache tipos letra:",
                erro
            );
        }
    }


    /* =========================================================
       CARREGAR TIPOS DE LETRA

       Cache primeiro.
       API depois.
    ========================================================= */

    useEffect(() => {

        let ativo = true;

        async function carregarTipos() {

            const cache =
                lerCacheTiposLetra();

            if (cache && ativo) {

                setTiposLetra(cache);

                console.log(
                    "[DADOS COMERCIAIS] Tipos de letra carregados do cache."
                );
            }

            try {

                const resp = await fetch(
                    `${URL}/comercio/tipos-letra`
                );

                if (!resp.ok) {

                    throw new Error(
                        `Erro ${resp.status}`
                    );
                }

                const servidor =
                    await resp.json();

                if (
                    !ativo ||
                    !Array.isArray(servidor)
                ) {
                    return;
                }

                const mudou =
                    JSON.stringify(cache) !==
                    JSON.stringify(servidor);

                if (mudou) {

                    setTiposLetra(
                        servidor
                    );

                    salvarCacheTiposLetra(
                        servidor
                    );

                    console.log(
                        "[DADOS COMERCIAIS] Tipos de letra atualizados."
                    );
                }

            } catch (erro) {

                console.error(
                    "Erro ao carregar tipos de letra",
                    erro
                );
            }
        }

        carregarTipos();

        return () => {
            ativo = false;
        };

    }, []);


    /* =========================================================
       CARREGAR DADOS DO COMÉRCIO

       Cache primeiro.
       API depois.
    ========================================================= */

    useEffect(() => {

        let ativo = true;

        async function carregarComercio() {

            const cache =
                lerCacheComercio();


            /* =================================================
               MOSTRA CACHE IMEDIATAMENTE
            ================================================= */

            if (cache && ativo) {

                setDados(cache);

                console.log(
                    "[DADOS COMERCIAIS] Comércio carregado do cache."
                );
            }


            /* =================================================
               VERIFICAR SERVIDOR
            ================================================= */

            try {

                const resp = await fetch(
                    `${URL}/comercio/me`,
                    {
                        headers: {
                            Authorization:
                                "Bearer " + token
                        }
                    }
                );

                if (!resp.ok) {

                    throw new Error(
                        `Erro ${resp.status}`
                    );
                }

                const servidor =
                    await resp.json();

                if (
                    !ativo ||
                    !servidor
                ) {
                    return;
                }


                /* =================================================
                   GARANTIA EXTRA CONTRA EMPRESA ERRADA

                   Se a API retornar ID e ele for diferente do
                   comércio atualmente logado, não usamos os dados.
                ================================================= */

                const comercioEsperado =
                    obterComercioId();

                if (
                    comercioEsperado &&
                    servidor.id &&
                    String(servidor.id) !==
                    String(comercioEsperado)
                ) {

                    console.warn(
                        "[DADOS COMERCIAIS] API retornou comércio diferente.",
                        {
                            esperado:
                                comercioEsperado,

                            recebido:
                                servidor.id
                        }
                    );

                    return;
                }


                /* =================================================
                   COMPARAR
                ================================================= */

                if (
                    dadosIguais(
                        cache,
                        servidor
                    )
                ) {

                    console.log(
                        "[DADOS COMERCIAIS] Cache já está atualizado."
                    );

                    return;
                }


                /* =================================================
                   MUDOU
                ================================================= */

                console.log(
                    "[DADOS COMERCIAIS] Dados diferentes encontrados."
                );

                setDados(
                    servidor
                );

                salvarCacheComercio(
                    servidor
                );

            } catch (erro) {

                console.error(
                    "[DADOS COMERCIAIS] Erro ao consultar comércio:",
                    erro
                );
            }
        }

        carregarComercio();

        return () => {
            ativo = false;
        };

    }, [token]);


    /* =========================================================
       SALVAR CAMPO
    ========================================================= */

    async function salvarCampo(
        campo,
        valor
    ) {

        try {

            const resp = await fetch(
                `${URL}/comercio/editar-campo`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        campo,
                        valor
                    })
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao salvar campo: ${resp.status}`
                );
            }


            /*
                Atualiza imediatamente:

                React
                +
                localStorage
            */

            atualizarDadosComercio({
                [campo]: valor
            });


        } catch (erro) {

            console.error(
                "[DADOS COMERCIAIS] Erro ao salvar campo:",
                erro
            );
        }
    }


    /* =========================================================
       UPLOAD DA IMAGEM
    ========================================================= */

    /* =========================================================
      UPLOAD DA IMAGEM
   ========================================================= */

    async function alterarImagem(arquivo) {

        if (!arquivo) {
            return;
        }

        if (!arquivo.type.startsWith("image/")) {

            setImagemErro(
                "Selecione um arquivo de imagem válido."
            );

            return;
        }

        const limite = 5 * 1024 * 1024;

        if (arquivo.size > limite) {

            setImagemErro(
                "A imagem deve ter no máximo 5 MB."
            );

            return;
        }


        /* =====================================================
           PREVIEW IMEDIATO
        ===================================================== */

        const previewLocal =
            window.URL.createObjectURL(arquivo);

        setImagemPreview(previewLocal);

        setImagemEnviando(true);
        setImagemCarregada(false);
        setImagemErro("");
        setImagemSucesso(false);


        try {

            const form = new FormData();

            form.append(
                "arquivo",
                arquivo
            );


            const resp = await fetch(
                `${URL}/comercio/imagem`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    },

                    body: form
                }
            );


            const resposta =
                await resp.json();


            if (!resp.ok) {

                throw new Error(
                    resposta?.detail ||
                    `Erro upload: ${resp.status}`
                );
            }


            if (!resposta?.imagem) {

                throw new Error(
                    "O servidor não retornou a imagem."
                );
            }


            /* =================================================
               ATUALIZA DADOS E CACHE
            ================================================= */

            atualizarDadosComercio({
                imagem: resposta.imagem
            });


            /* =================================================
               REMOVE PREVIEW TEMPORÁRIO
    
               Agora passamos a utilizar a imagem da VPS.
            ================================================= */

            window.URL.revokeObjectURL(
                previewLocal
            );

            setImagemPreview(null);
            setImagemCarregada(false);
            setImagemSucesso(true);


            setTimeout(() => {

                setImagemSucesso(false);

            }, 3000);


        } catch (erro) {

            console.error(
                "[DADOS COMERCIAIS] Erro ao alterar imagem:",
                erro
            );

            setImagemErro(
                erro.message ||
                "Não foi possível enviar a imagem."
            );


        } finally {

            setImagemEnviando(false);
        }
    }

    /* =========================================================
       PERMISSÃO
    ========================================================= */

    if (
        cliente.funcao === "Funcionario(a)" ||
        cliente.funcao === "Supervisor(a)"
    ) {

        return (
            <h2 className="dc-sem-acesso">
                Acesso não autorizado
            </h2>
        );
    }


    /* =========================================================
       LOADING

       Com cache existente, praticamente não aparecerá.
    ========================================================= */

    if (!dados) {

        return (

            <div className="dc-loading-container">

                <div className="dc-loading-card">

                    <div className="dc-loading-bar" />

                    <div className="dc-loading-line" />

                    <div className="dc-loading-line" />

                    <div className="dc-loading-line small" />

                </div>

            </div>
        );
    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="dc-container">

            {/* =================================================
                IDENTIDADE
            ================================================= */}

            <section className="dc-section">

                <h2 className="dc-title">
                    Identidade
                </h2>


                <CampoEditavel
                    label="Nome da loja"
                    valor={dados.loja}
                    podeEditar={podeEditar}
                    onSalvar={v =>
                        salvarCampo(
                            "loja",
                            v
                        )
                    }
                />


                <CampoEditavel
                    label="Tipo de letra"
                    valor={dados.letra_tipo}
                    tipo="letra"
                    podeEditar={podeEditar}
                    opcoes={
                        Array.isArray(tiposLetra)
                            ? tiposLetra
                            : []
                    }
                    onSalvar={v =>
                        salvarCampo(
                            "letra_tipo",
                            v
                        )
                    }
                />

            </section>


            {/* =================================================
                CONTATO
            ================================================= */}

            <section className="dc-section">

                <h2 className="dc-title">
                    Contato
                </h2>


                <CampoEditavel
                    label="Email"
                    valor={dados.email}
                    podeEditar={podeEditar}
                    onSalvar={v =>
                        salvarCampo(
                            "email",
                            v
                        )
                    }
                />


                <CampoEditavel
                    label="Celular"
                    valor={dados.celular}
                    tipo="celular"
                    podeEditar={podeEditar}
                    onSalvar={v =>
                        salvarCampo(
                            "celular",
                            v
                        )
                    }
                />


                <CampoEditavel
                    label="Tipo de letra"
                    valor={dados.letra_tipo}
                    tipo="letra"
                    podeEditar={podeEditar}
                    opcoes={
                        Array.isArray(tiposLetra)
                            ? tiposLetra
                            : []
                    }
                    onSalvar={v =>
                        salvarCampo(
                            "letra_tipo",
                            v
                        )
                    }
                />

            </section>


            {/* =================================================
                ENDEREÇO
            ================================================= */}

            <section className="dc-section">

                <h2 className="dc-title">
                    Endereço
                </h2>


                <div className="dc-endereco-resumo">

                    {dados.rua}, {dados.numero} – {dados.bairro}, {dados.cidade}

                </div>


                {podeEditar && (

                    <button
                        className="dc-btn-secundario"
                        onClick={() =>
                            setAbrirEndereco(true)
                        }
                    >
                        Editar endereço
                    </button>

                )}


                {abrirEndereco && (

                    <ModalEndereco
                        dados={dados}
                        fechar={() =>
                            setAbrirEndereco(false)
                        }
                        onSalvar={novo => {

                            atualizarDadosComercio(
                                novo
                            );

                        }}
                    />

                )}

            </section>


            {/* =================================================
                IMAGEM
            ================================================= */}

            <section className="dc-section">

                <div className="dc-imagem-cabecalho">

                    <div>
                        <h2 className="dc-title">
                            Imagem do comércio
                        </h2>

                        <p className="dc-imagem-descricao">
                            Logo ou imagem utilizada para identificar o comércio.
                        </p>
                    </div>

                    {dados.imagem && !imagemEnviando && (
                        <span className="dc-imagem-status">
                            Imagem carregada
                        </span>
                    )}

                </div>


                <div className="dc-imagem-area">

                    <div className="dc-imagem-box">

                        {(imagemPreview || dados.imagem) ? (
                            <>

                                {!imagemCarregada && (
                                    <div className="dc-imagem-carregando">

                                        <div className="dc-imagem-spinner" />

                                        <span>
                                            Carregando imagem...
                                        </span>

                                    </div>
                                )}

                                <img
                                    src={
                                        imagemPreview ||
                                        obterUrlImagemComercio(dados.imagem)
                                    }
                                    className={
                                        imagemCarregada
                                            ? "dc-imagem dc-imagem-visivel"
                                            : "dc-imagem"
                                    }
                                    alt={dados.loja || "Imagem do comércio"}
                                    onLoad={() => {
                                        setImagemCarregada(true);
                                        setImagemErro("");
                                    }}
                                    onError={() => {
                                        setImagemCarregada(true);
                                        setImagemErro(
                                            "Não foi possível carregar a imagem."
                                        );
                                    }}
                                />

                            </>
                        ) : (

                            <div className="dc-imagem-sem-foto">

                                <div className="dc-imagem-sem-foto-icone">
                                    +
                                </div>

                                <strong>
                                    Nenhuma imagem
                                </strong>

                                <span>
                                    Adicione uma imagem do comércio
                                </span>

                            </div>

                        )}

                    </div>


                    {podeEditar && (

                        <div className="dc-imagem-controles">

                            <label
                                className={
                                    imagemEnviando
                                        ? "dc-imagem-upload-btn dc-imagem-upload-btn-bloqueado"
                                        : "dc-imagem-upload-btn"
                                }
                            >

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    disabled={imagemEnviando}
                                    onChange={e => {

                                        const arquivo = e.target.files?.[0];

                                        if (arquivo) {
                                            alterarImagem(arquivo);
                                        }

                                        e.target.value = "";
                                    }}
                                />

                                {imagemEnviando
                                    ? "Enviando..."
                                    : dados.imagem
                                        ? "Trocar imagem"
                                        : "Adicionar imagem"
                                }

                            </label>

                            <span className="dc-imagem-ajuda">
                                PNG, JPG ou WEBP, máximo 5 MB
                            </span>

                        </div>

                    )}

                </div>


                {imagemSucesso && (
                    <div className="dc-imagem-mensagem-sucesso">
                        Imagem atualizada com sucesso.
                    </div>
                )}


                {imagemErro && (
                    <div className="dc-imagem-mensagem-erro">

                        <span>
                            {imagemErro}
                        </span>

                        <button
                            type="button"
                            onClick={() => setImagemErro("")}
                        >
                            ×
                        </button>

                    </div>
                )}

            </section>


            {/* =================================================
                MÓDULOS
            ================================================= */}

            <section className="dc-section">

                <h2 className="dc-title">
                    Módulos
                </h2>

                <BlocoModulos
                    comercioId={dados.id}
                    podeEditar={podeEditar}
                />

            </section>


            {/* =================================================
                CONFIGURAÇÕES
            ================================================= */}

            <section className="dc-section">

                <h2 className="dc-title">
                    Configurações
                </h2>

                <BlocoFlags
                    dados={dados}
                    podeEditar={podeEditar}
                    salvar={salvarCampo}
                />

            </section>


            {/* =================================================
                PIX
            ================================================= */}

            <BlocoPix
                token={token}
            />

        </div>
    );
}