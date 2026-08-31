import React, {
    useEffect,
    useState
} from "react";
import { createPortal } from "react-dom";

import { API_URL } from "../../../../../../config";
import "./dominio.css"

export default function Dominio() {

    // ============================================================
    // ESTADOS
    // ============================================================

    const [dominio, setDominio] = useState("");

    const [dominioOriginal, setDominioOriginal] = useState("");

    const [podeEditar, setPodeEditar] = useState(false);

    const [carregando, setCarregando] = useState(true);

    const [salvando, setSalvando] = useState(false);

    const [mensagem, setMensagem] = useState("");

    const [erro, setErro] = useState("");

    const [modalConfirmacao, setModalConfirmacao] =
        useState(false);

    const [dominioPendente, setDominioPendente] =
        useState("");


    // ============================================================
    // REMOVER BARRAS FINAIS
    // ============================================================

    function removerBarrasFinais(valor) {

        return String(
            valor || ""
        )
            .trim()
            .replace(/\/+$/, "");

    }


    // ============================================================
    // ERRO DA API
    // ============================================================

    function obterMensagemErro(dados) {

        if (!dados) {

            return "Erro desconhecido.";

        }

        if (
            typeof dados.detail === "string"
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

                    const local =
                        Array.isArray(
                            item?.loc
                        )
                            ? item.loc.join(" > ")
                            : "";

                    const mensagem =
                        item?.msg ||
                        item?.message ||
                        "Erro de validação";

                    return local
                        ? `${local}: ${mensagem}`
                        : mensagem;

                })
                .join(" | ");

        }

        if (
            dados.detail &&
            typeof dados.detail === "object"
        ) {

            try {

                return JSON.stringify(
                    dados.detail
                );

            } catch {

                return "Erro de validação.";

            }

        }

        if (
            typeof dados.message === "string"
        ) {

            return dados.message;

        }

        return "Erro desconhecido.";

    }


    // ============================================================
    // CARREGAR DOMÍNIO
    // ============================================================

    useEffect(() => {

        let componenteAtivo = true;


        async function carregarDominio() {

            try {

                setCarregando(true);

                setErro("");

                setMensagem("");


                const token =
                    localStorage.getItem(
                        "token"
                    );


                if (!token) {

                    if (componenteAtivo) {

                        setErro(
                            "Sessão não encontrada."
                        );

                    }

                    return;

                }


                const resposta = await fetch(
                    `${API_URL}/ironstore/adicionar/dominio`,
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
                    resposta.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "usuario"
                    );

                    window.location.replace(
                        "/"
                    );

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


                if (!componenteAtivo) {

                    return;

                }


                const dominioRecebido =
                    removerBarrasFinais(
                        dados?.dominio || ""
                    );


                setDominio(
                    dominioRecebido
                );

                setDominioOriginal(
                    dominioRecebido
                );

                setPodeEditar(
                    dados?.pode_editar === true
                );


            } catch (erroCarregamento) {

                console.error(
                    "[IRONSTORE DOMÍNIO]",
                    erroCarregamento
                );


                if (componenteAtivo) {

                    setErro(
                        erroCarregamento?.message ||
                        "Não foi possível carregar o domínio."
                    );

                }


            } finally {

                if (componenteAtivo) {

                    setCarregando(false);

                }

            }

        }


        carregarDominio();


        return () => {

            componenteAtivo = false;

        };

    }, []);


    // ============================================================
    // ALTERAR INPUT
    // ============================================================

    function alterarDominio(event) {

        if (!podeEditar) {

            return;

        }


        setDominio(
            event.target.value
        );

        setMensagem("");

        setErro("");

    }


    // ============================================================
    // PEDIR CONFIRMAÇÃO
    // ============================================================

    function solicitarAlteracao(event) {

        event.preventDefault();


        if (!podeEditar) {

            setErro(
                "Você não possui permissão para alterar o domínio."
            );

            return;

        }


        const dominioLimpo =
            removerBarrasFinais(
                dominio
            );


        if (!dominioLimpo) {

            setErro(
                "Informe o domínio da loja."
            );

            return;

        }


        const dominioAtualLimpo =
            removerBarrasFinais(
                dominioOriginal
            );


        if (
            dominioLimpo ===
            dominioAtualLimpo
        ) {

            setErro(
                "O domínio informado já é o domínio atual."
            );

            return;

        }


        setDominio(
            dominioLimpo
        );

        setDominioPendente(
            dominioLimpo
        );

        setErro("");

        setMensagem("");

        setModalConfirmacao(true);

    }


    // ============================================================
    // CANCELAR ALTERAÇÃO
    // ============================================================

    function cancelarAlteracao() {

        if (salvando) {

            return;

        }

        setModalConfirmacao(false);

        setDominioPendente("");

    }


    // ============================================================
    // CONFIRMAR ALTERAÇÃO
    // ============================================================

    async function confirmarAlteracao() {

        if (salvando) {

            return;

        }


        const dominioLimpo =
            removerBarrasFinais(
                dominioPendente
            );


        if (!dominioLimpo) {

            setModalConfirmacao(false);

            setErro(
                "Informe um domínio válido."
            );

            return;

        }


        try {

            setSalvando(true);

            setErro("");

            setMensagem("");


            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                setModalConfirmacao(false);

                setErro(
                    "Sessão não encontrada."
                );

                return;

            }


            // ====================================================
            // ROTA CORRETA
            // ====================================================

            const resposta = await fetch(
                `${API_URL}/ironstore/adicionar/dominio`,
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

                    body: JSON.stringify({

                        dominio:
                            dominioLimpo

                    })

                }
            );


            if (
                resposta.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                window.location.replace(
                    "/"
                );

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


            const dominioSalvo =
                removerBarrasFinais(
                    dados?.dominio ||
                    dominioLimpo
                );


            setDominio(
                dominioSalvo
            );

            setDominioOriginal(
                dominioSalvo
            );

            setDominioPendente("");

            setModalConfirmacao(false);

            setMensagem(
                "Domínio alterado com sucesso."
            );


        } catch (erroSalvamento) {

            console.error(
                "[IRONSTORE DOMÍNIO]",
                erroSalvamento
            );


            // Fecha o modal para mostrar
            // claramente o erro retornado pela API.

            setModalConfirmacao(false);

            setErro(
                erroSalvamento?.message ||
                "Não foi possível alterar o domínio."
            );


        } finally {

            setSalvando(false);

        }

    }


    // ============================================================
    // DOMÍNIO FOI ALTERADO
    // ============================================================

    const dominioFoiAlterado =
        removerBarrasFinais(
            dominio
        ) !==
        removerBarrasFinais(
            dominioOriginal
        );


    // ============================================================
    // ABRIR DOMÍNIO
    // ============================================================

    function abrirDominio() {

        const dominioLimpo =
            removerBarrasFinais(
                dominioOriginal
            );


        if (!dominioLimpo) {

            return;

        }


        const link =
            dominioLimpo.startsWith(
                "http://"
            ) ||
                dominioLimpo.startsWith(
                    "https://"
                )
                ? dominioLimpo
                : `https://${dominioLimpo}`;


        window.open(
            link,
            "_blank",
            "noopener,noreferrer"
        );

    }
    // ============================================================
    // NOTIFICAR SUPORTE SOBRE ALTERAÇÃO DE DOMÍNIO
    // ============================================================

    function notificarSuporteDominio() {

        const numeroSuporte =
            "5511918547818";

        const mensagemSuporte =
            [
                "Olá, suporte Iron Executions.",
                "",
                "Estou solicitando autorização para alteração do domínio da minha loja.",
                "",
                `Domínio atual: ${dominioOriginal || "Não cadastrado"}`,
                `Novo domínio: ${dominioPendente || dominio}`,
                "",
                "Estou ciente de que a alteração pode levar até 4 horas úteis, dentro do horário de atendimento das 12h às 21h."
            ].join("\n");


        const linkWhatsApp =
            `https://wa.me/${numeroSuporte}?text=${encodeURIComponent(
                mensagemSuporte
            )}`;


        window.open(
            linkWhatsApp,
            "_blank",
            "noopener,noreferrer"
        );

    }
    // ============================================================
    // MODAL DE CONFIRMAÇÃO COM PORTAL
    // ============================================================

    const modalConfirmacaoPortal =
        modalConfirmacao &&
            typeof document !== "undefined"
            ? createPortal(

                <div
                    className="ironstore-dominio-modal-premium-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            cancelarAlteracao();

                        }

                    }}
                >

                    <div
                        className="ironstore-dominio-modal-premium-caixa"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ironstore-dominio-modal-titulo"
                        onMouseDown={(event) => {

                            event.stopPropagation();

                        }}
                    >

                        {/* =============================================
                        ÍCONE
                    ============================================= */}

                        <div className="ironstore-dominio-modal-premium-icone">

                            <span>
                                !
                            </span>

                        </div>


                        {/* =============================================
                        CABEÇALHO
                    ============================================= */}

                        <div className="ironstore-dominio-modal-premium-cabecalho">

                            <span className="ironstore-dominio-modal-premium-etiqueta">
                                Confirmação necessária
                            </span>

                            <h3
                                id="ironstore-dominio-modal-titulo"
                                className="ironstore-dominio-modal-premium-titulo"
                            >
                                Alterar o domínio da loja?
                            </h3>

                            <div className="ironstore-dominio-modal-premium-suporte-info">

                                <p className="ironstore-dominio-modal-premium-descricao">

                                    A alteração de domínio precisa ser previamente
                                    autorizada pelo suporte da Iron Executions. Após solicitar
                                    a mudança, o processo pode levar até

                                    <strong>
                                        {" "}4 horas úteis
                                    </strong>

                                    , considerando o horário de atendimento das

                                    <strong>
                                        {" "}12h às 21h
                                    </strong>

                                    .

                                </p>


                                <p className="ironstore-dominio-modal-premium-suporte-texto">

                                    Antes de confirmar, notifique nosso suporte para que
                                    a alteração possa ser preparada e autorizada.

                                </p>
                                <p className="ironstore-dominio-modal-premium-suporte-texto">

                                    Após notificar o suporte e receber a autorização, você poderá alterar o domínio.
                                </p>

                                <button
                                    type="button"
                                    className="ironstore-dominio-modal-premium-whatsapp"
                                    onClick={notificarSuporteDominio}
                                >

                                    <span className="ironstore-dominio-modal-premium-whatsapp-icone">
                                        WhatsApp
                                    </span>

                                    <span className="ironstore-dominio-modal-premium-whatsapp-conteudo">

                                        <strong>
                                            Notificar suporte
                                        </strong>

                                        <small>
                                            Enviar solicitação pelo WhatsApp
                                        </small>

                                    </span>

                                    <span className="ironstore-dominio-modal-premium-whatsapp-seta">
                                        →
                                    </span>

                                </button>

                            </div>

                        </div>


                        {/* =============================================
                        COMPARAÇÃO
                    ============================================= */}

                        <div className="ironstore-dominio-modal-premium-comparacao">

                            {dominioOriginal && (

                                <div
                                    className="
                                    ironstore-dominio-modal-premium-dominio
                                    ironstore-dominio-modal-premium-dominio-antigo
                                "
                                >

                                    <span>
                                        Domínio atual
                                    </span>

                                    <strong>
                                        {dominioOriginal}
                                    </strong>

                                </div>

                            )}


                            <div className="ironstore-dominio-modal-premium-seta">
                                ↓
                            </div>


                            <div
                                className="
                                ironstore-dominio-modal-premium-dominio
                                ironstore-dominio-modal-premium-dominio-novo
                            "
                            >

                                <span>
                                    Novo domínio
                                </span>

                                <strong>
                                    {dominioPendente}
                                </strong>

                            </div>

                        </div>


                        {/* =============================================
                        AVISO
                    ============================================= */}

                        <div className="ironstore-dominio-modal-premium-aviso">

                            <strong>
                                Atenção
                            </strong>

                            <p>
                                O novo domínio substituirá o domínio atualmente
                                associado a este comércio, tem certeza que deseja trocar?.
                            </p>

                        </div>


                        {/* =============================================
                        AÇÕES
                    ============================================= */}

                        <div className="ironstore-dominio-modal-premium-acoes">

                            <button
                                type="button"
                                className="ironstore-dominio-modal-premium-cancelar"
                                onClick={cancelarAlteracao}
                                disabled={salvando}
                            >
                                Cancelar
                            </button>


                            <button
                                type="button"
                                className="ironstore-dominio-modal-premium-confirmar"
                                onClick={confirmarAlteracao}
                                disabled={salvando}
                            >

                                {
                                    salvando
                                        ? "Alterando..."
                                        : "Sim, alterar domínio"
                                }

                            </button>

                        </div>

                    </div>

                </div>,

                document.body

            )
            : null;
    // ============================================================
    // RENDER
    // ============================================================

    return (

        <>

            <section className="ironstore-dominio-premium-area">

                {/* =================================================
                    CABEÇALHO
                ================================================= */}

                <div className="ironstore-dominio-premium-cabecalho">

                    <div className="ironstore-dominio-premium-cabecalho-conteudo">

                        <span className="ironstore-dominio-premium-etiqueta">
                            Configuração da loja
                        </span>

                        <h2 className="ironstore-dominio-premium-titulo">
                            Domínio registrado
                        </h2>

                        <p className="ironstore-dominio-premium-descricao">
                            Defina o endereço utilizado para identificar sua loja online.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    CARREGANDO
                ================================================= */}

                {carregando ? (

                    <div className="ironstore-dominio-premium-carregando">

                        <div className="ironstore-dominio-premium-spinner" />

                        <span>
                            Carregando domínio...
                        </span>

                    </div>

                ) : (

                    <div className="ironstore-dominio-premium-conteudo">

                        {/* =============================================
                            DOMÍNIO ATUAL
                        ============================================= */}

                        {dominioOriginal && (

                            <div className="ironstore-dominio-premium-atual">

                                <div className="ironstore-dominio-premium-atual-info">

                                    <span className="ironstore-dominio-premium-atual-label">
                                        Domínio atualmente registrado
                                    </span>

                                    <strong className="ironstore-dominio-premium-atual-valor">
                                        {dominioOriginal}
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="ironstore-dominio-premium-visitar"
                                    onClick={abrirDominio}
                                >
                                    Visitar domínio
                                </button>

                            </div>

                        )}


                        {/* =============================================
                            FORMULÁRIO
                        ============================================= */}

                        <form
                            className="ironstore-dominio-premium-formulario"
                            onSubmit={solicitarAlteracao}
                        >

                            <div className="ironstore-dominio-premium-campo">

                                <label
                                    className="ironstore-dominio-premium-label"
                                    htmlFor="ironstore-dominio-premium-input"
                                >
                                    Endereço do domínio
                                </label>


                                <div className="ironstore-dominio-premium-input-area">



                                    <input
                                        id="ironstore-dominio-premium-input"
                                        type="text"
                                        className="ironstore-dominio-premium-input"
                                        value={dominio}
                                        onChange={alterarDominio}
                                        placeholder="minhaloja.com.br"
                                        autoComplete="off"
                                        spellCheck="false"
                                        readOnly={!podeEditar}
                                        disabled={salvando}
                                    />

                                </div>


                                <span className="ironstore-dominio-premium-ajuda">
                                    Informe somente o domínio principal. Barras no final serão removidas automaticamente.
                                </span>

                            </div>


                            {podeEditar && (

                                <div className="ironstore-dominio-premium-acoes">

                                    <button
                                        type="submit"
                                        className="ironstore-dominio-premium-salvar"
                                        disabled={
                                            salvando ||
                                            !dominio.trim() ||
                                            !dominioFoiAlterado
                                        }
                                    >
                                        Alterar domínio
                                    </button>

                                </div>

                            )}

                        </form>


                        {/* =============================================
                            SEM DOMÍNIO
                        ============================================= */}

                        {!dominioOriginal && !erro && (

                            <div className="ironstore-dominio-premium-vazio">

                                <strong>
                                    Nenhum domínio registrado
                                </strong>

                                <span>
                                    Cadastre o domínio que será utilizado pela sua loja.
                                </span>

                            </div>

                        )}


                        {/* =============================================
                            SEM PERMISSÃO
                        ============================================= */}

                        {!podeEditar && !erro && (

                            <div className="ironstore-dominio-premium-permissao">

                                <strong>
                                    Somente visualização
                                </strong>

                                <span>
                                    Apenas administradores podem alterar o domínio registrado.
                                </span>

                            </div>

                        )}


                        {/* =============================================
                            ERRO
                        ============================================= */}

                        {erro && (

                            <div className="ironstore-dominio-premium-erro">

                                <strong>
                                    Não foi possível concluir
                                </strong>

                                <span>
                                    {erro}
                                </span>

                            </div>

                        )}


                        {/* =============================================
                            SUCESSO
                        ============================================= */}

                        {mensagem && (

                            <div className="ironstore-dominio-premium-sucesso">

                                <strong>
                                    Alteração concluída
                                </strong>

                                <span>
                                    {mensagem}
                                </span>

                            </div>

                        )}

                    </div>

                )}

            </section>


            {/* =====================================================
                MODAL DE CONFIRMAÇÃO
            ===================================================== */}

            {modalConfirmacaoPortal}


        </>

    );

}