import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    API_URL
} from "../../../../../../config";

import "./modelos.css";


/* =========================================================
   COMPONENTE
========================================================= */

export default function Modelos() {

    /* =====================================================
       ESTADOS
    ===================================================== */

    const [
        carregando,
        setCarregando
    ] = useState(true);


    const [
        salvando,
        setSalvando
    ] = useState(false);


    const [
        dominioCadastrado,
        setDominioCadastrado
    ] = useState(false);


    const [
        dominio,
        setDominio
    ] = useState("");


    const [
        podeEditar,
        setPodeEditar
    ] = useState(false);


    const [
        opcoes,
        setOpcoes
    ] = useState([]);


    const [
        modeloAtual,
        setModeloAtual
    ] = useState(null);


    const [
        modeloSelecionado,
        setModeloSelecionado
    ] = useState("");


    const [
        erro,
        setErro
    ] = useState("");


    const [
        sucesso,
        setSucesso
    ] = useState("");


    /* =====================================================
       TOKEN
    ===================================================== */

    function obterToken() {

        return localStorage.getItem(
            "token"
        );

    }


    /* =====================================================
       TRATAR 401
    ===================================================== */

    function tratarNaoAutorizado() {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "usuario"
        );

        window.location.href = "/";

    }


    /* =====================================================
       CARREGAR CONFIGURAÇÃO
    ===================================================== */

    const carregarModelos =
        useCallback(
            async () => {

                setCarregando(true);

                setErro("");

                setSucesso("");


                try {

                    const token =
                        obterToken();


                    if (!token) {

                        tratarNaoAutorizado();

                        return;

                    }


                    const resposta =
                        await fetch(
                            `${API_URL}/ironstore/configuracao/modelos`,
                            {
                                method:
                                    "GET",

                                headers: {
                                    Accept:
                                        "application/json",

                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (
                        resposta.status ===
                        401
                    ) {

                        tratarNaoAutorizado();

                        return;

                    }


                    const dados =
                        await resposta.json();


                    if (!resposta.ok) {

                        throw new Error(
                            dados?.detail ||
                            "Não foi possível carregar os modelos."
                        );

                    }


                    /* =====================================
                       DOMÍNIO
                    ===================================== */

                    setDominioCadastrado(
                        Boolean(
                            dados?.dominio_cadastrado
                        )
                    );


                    setDominio(
                        dados?.dominio ||
                        ""
                    );


                    /* =====================================
                       PERMISSÃO
                    ===================================== */

                    setPodeEditar(
                        Boolean(
                            dados?.pode_editar
                        )
                    );


                    /* =====================================
                       OPÇÕES

                       VÊM EXCLUSIVAMENTE DO BACKEND.
                    ===================================== */

                    const modelosRecebidos =
                        Array.isArray(
                            dados?.opcoes
                        )
                            ? dados.opcoes
                            : [];


                    setOpcoes(
                        modelosRecebidos
                    );


                    /* =====================================
                       MODELO JÁ CADASTRADO
                    ===================================== */

                    const atual =
                        dados?.modelo ||
                        null;


                    setModeloAtual(
                        atual
                    );


                    setModeloSelecionado(
                        atual?.id ||
                        ""
                    );

                } catch (error) {

                    console.error(
                        "Erro ao carregar modelos:",
                        error
                    );


                    setErro(
                        error?.message ||
                        "Erro ao carregar os modelos."
                    );

                } finally {

                    setCarregando(
                        false
                    );

                }

            },
            []
        );


    /* =====================================================
       CARREGAR
    ===================================================== */

    useEffect(
        () => {

            carregarModelos();

        },
        [
            carregarModelos
        ]
    );


    /* =====================================================
       SELECIONAR MODELO
    ===================================================== */

    function selecionarModelo(
        modelo
    ) {

        if (!podeEditar) {
            return;
        }


        if (salvando) {
            return;
        }


        setModeloSelecionado(
            modelo.id
        );


        setErro("");

        setSucesso("");

    }


    /* =====================================================
       SALVAR
    ===================================================== */

    async function salvarModelo() {

        if (salvando) {
            return;
        }


        if (!podeEditar) {

            setErro(
                "Você não possui permissão para alterar o modelo."
            );

            return;

        }


        if (!dominioCadastrado) {

            setErro(
                "Cadastre um domínio antes de selecionar o modelo."
            );

            return;

        }


        if (!modeloSelecionado) {

            setErro(
                "Selecione um modelo."
            );

            return;

        }


        setSalvando(true);

        setErro("");

        setSucesso("");


        try {

            const token =
                obterToken();


            if (!token) {

                tratarNaoAutorizado();

                return;

            }


            const resposta =
                await fetch(
                    `${API_URL}/ironstore/configuracao/modelos`,
                    {
                        method:
                            "PUT",

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
                                modelo:
                                    modeloSelecionado
                            })
                    }
                );


            if (
                resposta.status ===
                401
            ) {

                tratarNaoAutorizado();

                return;

            }


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados?.detail ||
                    "Não foi possível salvar o modelo."
                );

            }


            /* =============================================
               SINCRONIZAR MODELO ATUAL
            ============================================= */

            if (
                dados?.modelo
            ) {

                setModeloAtual(
                    dados.modelo
                );


                setModeloSelecionado(
                    dados.modelo.id
                );

            }


            setSucesso(
                dados?.mensagem ||
                "Modelo configurado com sucesso."
            );

        } catch (error) {

            console.error(
                "Erro ao salvar modelo:",
                error
            );


            setErro(
                error?.message ||
                "Erro ao salvar o modelo."
            );

        } finally {

            setSalvando(
                false
            );

        }

    }


    /* =====================================================
       ALTERAÇÃO PENDENTE
    ===================================================== */

    const possuiAlteracao =
        Boolean(
            modeloSelecionado
        )
        &&
        modeloSelecionado !==
        (
            modeloAtual?.id ||
            ""
        );


    /* =====================================================
       CARREGANDO
    ===================================================== */

    if (carregando) {

        return (

            <section
                className="
                    ironstore-modelos-site-area
                "
            >

                <div
                    className="
                        ironstore-modelos-site-carregando
                    "
                >

                    <span
                        className="
                            ironstore-modelos-site-spinner
                        "
                    />

                    <span>
                        Carregando modelos...
                    </span>

                </div>

            </section>

        );

    }


    /* =====================================================
       RETURN
    ===================================================== */

    return (

        <section
            className="
                ironstore-modelos-site-area
            "
        >

            {/* ===========================================
                CABEÇALHO
            ============================================ */}

            <div
                className="
                    ironstore-modelos-site-cabecalho
                "
            >

                <div
                    className="
                        ironstore-modelos-site-titulos
                    "
                >

                    <span
                        className="
                            ironstore-modelos-site-etiqueta
                        "
                    >
                        Aparência da loja
                    </span>


                    <h2
                        className="
                            ironstore-modelos-site-titulo
                        "
                    >
                        Modelos do site
                    </h2>


                    <p
                        className="
                            ironstore-modelos-site-descricao
                        "
                    >
                        Escolha o modelo visual que será
                        utilizado na sua loja online.
                    </p>

                </div>

            </div>


            {/* ===========================================
                SEM DOMÍNIO
            ============================================ */}

            {!dominioCadastrado && (

                <div
                    className="
                        ironstore-modelos-site-sem-dominio
                    "
                >

                    <div
                        className="
                            ironstore-modelos-site-sem-dominio-icone
                        "
                    >
                        !
                    </div>


                    <div
                        className="
                            ironstore-modelos-site-sem-dominio-conteudo
                        "
                    >

                        <span
                            className="
                                ironstore-modelos-site-sem-dominio-etiqueta
                            "
                        >
                            Configuração necessária
                        </span>


                        <strong>
                            Cadastre o domínio da loja
                        </strong>


                        <p>
                            Para selecionar um modelo,
                            primeiro é necessário possuir
                            um domínio vinculado ao comércio.
                        </p>

                    </div>

                </div>

            )}


            {/* ===========================================
                CONTEÚDO
            ============================================ */}

            {dominioCadastrado && (

                <div
                    className="
                        ironstore-modelos-site-conteudo
                    "
                >

                    {/* ===================================
                        DOMÍNIO
                    ==================================== */}

                    <div
                        className="
                            ironstore-modelos-site-dominio
                        "
                    >

                        <div
                            className="
                                ironstore-modelos-site-dominio-status
                            "
                        >

                            <span
                                className="
                                    ironstore-modelos-site-dominio-ponto
                                "
                            />

                            <span
                                className="
                                    ironstore-modelos-site-dominio-label
                                "
                            >
                                Domínio vinculado
                            </span>

                        </div>


                        <strong
                            className="
                                ironstore-modelos-site-dominio-valor
                            "
                        >
                            {dominio}
                        </strong>


                        <span
                            className="
                                ironstore-modelos-site-dominio-ajuda
                            "
                        >
                            O modelo será aplicado
                            neste domínio
                        </span>

                    </div>


                    {/* ===================================
                        MODELO ATUAL
                    ==================================== */}

                    {modeloAtual && (

                        <div
                            className="
                                ironstore-modelos-site-atual
                            "
                        >

                            <div
                                className="
                                    ironstore-modelos-site-atual-icone
                                "
                            >
                                ✓
                            </div>


                            <div
                                className="
                                    ironstore-modelos-site-atual-conteudo
                                "
                            >

                                <span>
                                    Modelo atualmente ativo
                                </span>

                                <strong>
                                    {modeloAtual.nome}
                                </strong>

                            </div>

                        </div>

                    )}


                    {/* ===================================
                        MODELOS
                    ==================================== */}

                    <div
                        className="
                            ironstore-modelos-site-bloco
                        "
                    >

                        <div
                            className="
                                ironstore-modelos-site-bloco-cabecalho
                            "
                        >

                            <div>

                                <span
                                    className="
                                        ironstore-modelos-site-bloco-etiqueta
                                    "
                                >
                                    Modelos disponíveis
                                </span>


                                <h3>
                                    Escolha a aparência
                                </h3>


                                <p>
                                    As opções disponíveis são
                                    controladas pelo sistema.
                                </p>

                            </div>


                            <span
                                className="
                                    ironstore-modelos-site-contador
                                "
                            >
                                {opcoes.length}
                                {
                                    opcoes.length === 1
                                        ? " modelo"
                                        : " modelos"
                                }
                            </span>

                        </div>


                        {/* =================================
                            GRID
                        ================================== */}

                        {opcoes.length > 0 ? (

                            <div
                                className="
                                    ironstore-modelos-site-grid
                                "
                            >

                                {opcoes.map(
                                    (
                                        modelo
                                    ) => {

                                        const selecionado =
                                            modeloSelecionado ===
                                            modelo.id;


                                        const ativo =
                                            modeloAtual?.id ===
                                            modelo.id;


                                        return (

                                            <button
                                                key={
                                                    modelo.id
                                                }
                                                type="button"
                                                className={`
                                                    ironstore-modelos-site-card

                                                    ${selecionado
                                                        ? "ironstore-modelos-site-card-selecionado"
                                                        : ""
                                                    }

                                                    ${ativo
                                                        ? "ironstore-modelos-site-card-ativo"
                                                        : ""
                                                    }
                                                `}
                                                onClick={
                                                    () =>
                                                        selecionarModelo(
                                                            modelo
                                                        )
                                                }
                                                disabled={
                                                    !podeEditar ||
                                                    salvando
                                                }
                                            >

                                                {/* =====================
                                                    PREVIEW
                                                ====================== */}

                                                <div
                                                    className="
                                                        ironstore-modelos-site-preview
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            ironstore-modelos-site-preview-browser
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                ironstore-modelos-site-preview-topo
                                                            "
                                                        >

                                                            <span />

                                                            <span />

                                                            <span />

                                                        </div>


                                                        <div
                                                            className="
                                                                ironstore-modelos-site-preview-header
                                                            "
                                                        >

                                                            <div />

                                                            <span />

                                                            <span />

                                                        </div>


                                                        <div
                                                            className="
                                                                ironstore-modelos-site-preview-banner
                                                            "
                                                        />


                                                        <div
                                                            className="
                                                                ironstore-modelos-site-preview-produtos
                                                            "
                                                        >

                                                            <span />

                                                            <span />

                                                            <span />

                                                        </div>

                                                    </div>


                                                    {ativo && (

                                                        <span
                                                            className="
                                                                ironstore-modelos-site-badge-ativo
                                                            "
                                                        >
                                                            Ativo
                                                        </span>

                                                    )}


                                                    {selecionado && !ativo && (

                                                        <span
                                                            className="
                                                                ironstore-modelos-site-badge-selecionado
                                                            "
                                                        >
                                                            Selecionado
                                                        </span>

                                                    )}

                                                </div>


                                                {/* =====================
                                                    INFORMAÇÕES
                                                ====================== */}

                                                <div
                                                    className="
                                                        ironstore-modelos-site-card-conteudo
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            ironstore-modelos-site-card-topo
                                                        "
                                                    >

                                                        <strong>
                                                            {modelo.nome}
                                                        </strong>


                                                        <span
                                                            className={`
                                                                ironstore-modelos-site-radio

                                                                ${selecionado
                                                                    ? "ironstore-modelos-site-radio-ativo"
                                                                    : ""
                                                                }
                                                            `}
                                                        >

                                                            {selecionado && (
                                                                <i />
                                                            )}

                                                        </span>

                                                    </div>


                                                    <p>
                                                        {
                                                            modelo.descricao
                                                        }
                                                    </p>

                                                </div>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        ) : (

                            <div
                                className="
                                    ironstore-modelos-site-vazio
                                "
                            >
                                Nenhum modelo está disponível
                                neste momento.
                            </div>

                        )}

                    </div>


                    {/* ===================================
                        SEM PERMISSÃO
                    ==================================== */}

                    {!podeEditar && (

                        <div
                            className="
                                ironstore-modelos-site-permissao
                            "
                        >

                            <strong>
                                Somente visualização
                            </strong>

                            <span>
                                Apenas administradores podem
                                alterar o modelo da loja.
                            </span>

                        </div>

                    )}


                    {/* ===================================
                        ERRO
                    ==================================== */}

                    {erro && (

                        <div
                            className="
                                ironstore-modelos-site-erro
                            "
                        >
                            {erro}
                        </div>

                    )}


                    {/* ===================================
                        SUCESSO
                    ==================================== */}

                    {sucesso && (

                        <div
                            className="
                                ironstore-modelos-site-sucesso
                            "
                        >
                            {sucesso}
                        </div>

                    )}


                    {/* ===================================
                        AÇÕES
                    ==================================== */}

                    {podeEditar && (

                        <div
                            className="
                                ironstore-modelos-site-acoes
                            "
                        >

                            <div
                                className="
                                    ironstore-modelos-site-acoes-info
                                "
                            >

                                <span>
                                    Modelo selecionado
                                </span>


                                <strong>
                                    {
                                        opcoes.find(
                                            (item) =>
                                                item.id ===
                                                modeloSelecionado
                                        )?.nome ||
                                        "Nenhum"
                                    }
                                </strong>

                            </div>


                            <button
                                type="button"
                                className="
                                    ironstore-modelos-site-salvar
                                "
                                onClick={
                                    salvarModelo
                                }
                                disabled={
                                    salvando ||
                                    !modeloSelecionado ||
                                    !possuiAlteracao
                                }
                            >

                                {
                                    salvando
                                        ? "Salvando..."
                                        : possuiAlteracao
                                            ? "Aplicar modelo"
                                            : modeloAtual
                                                ? "Modelo aplicado"
                                                : "Aplicar modelo"
                                }

                            </button>

                        </div>

                    )}

                </div>

            )}

        </section>

    );

}