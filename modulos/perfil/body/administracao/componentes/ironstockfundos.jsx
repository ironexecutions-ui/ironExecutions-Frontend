import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../../../../config";
import "./ironstockfundos.css";

export default function FundoImagens() {
    const [aberto, setAberto] = useState(false);
    const [fundos, setFundos] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [adicionando, setAdicionando] = useState(null);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [sugestoes, setSugestoes] = useState([]);
    const [carregandoSugestoes, setCarregandoSugestoes] = useState(false);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

    const inputRef = useRef(null);

    const token = () => localStorage.getItem("token");

    async function lerResposta(resposta) {
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                dados.detail ||
                dados.mensagem ||
                "Não foi possível concluir a operação."
            );
        }

        return dados;
    }

    // Carrega somente as imagens que já pertencem à loja.
    async function carregarFundos() {
        setCarregando(true);
        setErro("");

        try {
            const resposta = await fetch(`${API_URL}/ironstock/fundos`, {
                headers: {
                    Authorization: `Bearer ${token()}`,
                },
                cache: "no-store",
            });

            const dados = await lerResposta(resposta);

            setFundos(Array.isArray(dados.fundos) ? dados.fundos : []);
        } catch (e) {
            setErro(e.message || "Erro ao carregar imagens da loja.");
        } finally {
            setCarregando(false);
        }
    }

    // Abre o modal e carrega a biblioteca da loja.
    function abrirModal() {
        setErro("");
        setMensagem("");
        setSugestoes([]);
        setMostrarSugestoes(false);
        setAberto(true);
    }

    function fecharModal() {
        setAberto(false);
        setSugestoes([]);
        setMostrarSugestoes(false);
        setErro("");
    }

    useEffect(() => {
        if (aberto) {
            carregarFundos();
        }
    }, [aberto]);

    // Busca sugestões aleatórias no backend somente quando solicitado.
    async function verSugestoes() {
        setMostrarSugestoes(true);
        setCarregandoSugestoes(true);
        setSugestoes([]);
        setErro("");
        setMensagem("");

        try {
            const resposta = await fetch(
                `${API_URL}/ironstock/fundos/sugestoes`,
                {
                    headers: {
                        Authorization: `Bearer ${token()}`,
                    },
                    cache: "no-store",
                }
            );

            const dados = await lerResposta(resposta);

            setSugestoes(
                Array.isArray(dados.sugestoes) ? dados.sugestoes : []
            );
        } catch (e) {
            setErro(e.message || "Não foi possível carregar as sugestões.");
        } finally {
            setCarregandoSugestoes(false);
        }
    }

    // Adiciona uma imagem global à biblioteca da loja.
    async function adicionarFundo(fundo) {
        setAdicionando(fundo.id);
        setErro("");
        setMensagem("");

        try {
            const resposta = await fetch(
                `${API_URL}/ironstock/fundos/${fundo.id}/adicionar`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token()}`,
                    },
                }
            );

            const dados = await lerResposta(resposta);

            setMensagem(dados.mensagem || "Imagem adicionada à sua loja.");

            // Remove a imagem das sugestões imediatamente.
            setSugestoes((atuais) =>
                atuais.filter(
                    (item) => item.imagem_url !== fundo.imagem_url
                )
            );

            // Atualiza a biblioteca da loja.
            await carregarFundos();
        } catch (e) {
            setErro(e.message || "Não foi possível adicionar a imagem.");
        } finally {
            setAdicionando(null);
        }
    }

    // Envia uma imagem própria.
    async function enviarImagem(evento) {
        const arquivo = evento.target.files?.[0];
        evento.target.value = "";

        if (!arquivo) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
            setErro("Selecione uma imagem JPG, PNG ou WEBP.");
            return;
        }

        if (arquivo.size > 10 * 1024 * 1024) {
            setErro("A imagem deve ter no máximo 10 MB.");
            return;
        }

        setEnviando(true);
        setErro("");
        setMensagem("");

        try {
            const formData = new FormData();
            formData.append("arquivo", arquivo);

            const resposta = await fetch(
                `${API_URL}/ironstock/fundos/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token()}`,
                    },
                    body: formData,
                }
            );

            const dados = await lerResposta(resposta);

            setMensagem(dados.mensagem || "Imagem enviada com sucesso.");

            await carregarFundos();
        } catch (e) {
            setErro(e.message || "Não foi possível enviar a imagem.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <>
            {/* BOTÃO QUE ABRE O MODAL */}
            <div className="ie-ironstock__fundos-atalho">
                <div className="ie-ironstock__fundos-atalho-texto">
                    <strong>Imagens de fundo</strong>

                    <span>
                        Consulte imagens disponíveis e adicione imagens
                        personalizadas à biblioteca do seu comércio.
                    </span>
                </div>

                <button
                    type="button"
                    className="ie-ironstock__botao ie-ironstock__botao--secundario"
                    onClick={abrirModal}
                >
                    Imagens de fundo
                </button>
            </div>

            {/* MODAL */}
            {aberto &&
                createPortal(
                    <div
                        className="ie-fundos__overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ie-fundos-titulo"
                        onMouseDown={(evento) => {
                            if (evento.target === evento.currentTarget) {
                                fecharModal();
                            }
                        }}
                    >
                        <section className="ie-fundos__modal">
                            {/* CABEÇALHO */}
                            <header className="ie-fundos__cabecalho">
                                <div>
                                    <span className="ie-fundos__etiqueta">
                                        IRONSTOCK
                                    </span>

                                    <h2 id="ie-fundos-titulo">
                                        Biblioteca de imagens de fundo
                                    </h2>

                                    <p>
                                        Gerencie suas imagens, escolha sugestões
                                        do sistema ou envie imagens próprias.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="ie-fundos__fechar"
                                    onClick={fecharModal}
                                    aria-label="Fechar modal"
                                >
                                    ×
                                </button>
                            </header>

                            <div className="ie-fundos__conteudo">
                                {/* ENVIO DE IMAGEM PRÓPRIA */}
                                <div className="ie-fundos__upload">
                                    <div>
                                        <strong>Adicionar imagem própria</strong>

                                        <span>
                                            JPG, PNG ou WEBP. Tamanho máximo
                                            de 10 MB.
                                        </span>
                                    </div>

                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        hidden
                                        onChange={enviarImagem}
                                        disabled={enviando}
                                    />

                                    <button
                                        type="button"
                                        className="ie-ironstock__botao ie-ironstock__botao--principal"
                                        onClick={() => inputRef.current?.click()}
                                        disabled={enviando}
                                    >
                                        {enviando
                                            ? "Enviando..."
                                            : "Enviar imagem"}
                                    </button>
                                </div>

                                {/* AVISOS */}
                                {erro && (
                                    <div
                                        className="ie-fundos__mensagem ie-fundos__mensagem--erro"
                                        role="alert"
                                    >
                                        {erro}
                                    </div>
                                )}

                                {mensagem && (
                                    <div
                                        className="ie-fundos__mensagem ie-fundos__mensagem--sucesso"
                                        role="status"
                                    >
                                        {mensagem}
                                    </div>
                                )}

                                {/* IMAGENS DA LOJA */}
                                <div className="ie-fundos__secao-titulo">
                                    <h3>Imagens da sua loja</h3>

                                    <span>
                                        Imagens que já pertencem à biblioteca
                                        do seu comércio.
                                    </span>
                                </div>

                                {carregando ? (
                                    <div className="ie-fundos__estado">
                                        Carregando imagens da loja...
                                    </div>
                                ) : fundos.length === 0 ? (
                                    <div className="ie-fundos__estado">
                                        Você ainda não possui imagens na sua
                                        biblioteca.
                                    </div>
                                ) : (
                                    <div className="ie-fundos__grade">
                                        {fundos.map((fundo) => (
                                            <article
                                                className="ie-fundos__card"
                                                key={fundo.id}
                                            >
                                                <img
                                                    src={fundo.imagem_url}
                                                    alt="Imagem de fundo da loja"
                                                    loading="lazy"
                                                />

                                                <div className="ie-fundos__card-info">
                                                    <span>
                                                        Na sua biblioteca
                                                    </span>

                                                    <span className="ie-fundos__propria">
                                                        Adicionada
                                                    </span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}

                                {/* SUGESTÕES DO SISTEMA */}
                                <div className="ie-fundos__sugestoes-cabecalho">
                                    <div className="ie-fundos__secao-titulo">
                                        <h3>Sugestões do sistema</h3>

                                        <span>
                                            Escolha imagens para adicionar à
                                            biblioteca da sua loja.
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="ie-ironstock__botao ie-ironstock__botao--secundario"
                                        onClick={verSugestoes}
                                        disabled={
                                            carregandoSugestoes ||
                                            adicionando !== null ||
                                            enviando
                                        }
                                    >
                                        {carregandoSugestoes
                                            ? "Buscando..."
                                            : "Ver sugestões"}
                                    </button>
                                </div>

                                {!mostrarSugestoes ? (
                                    <div className="ie-fundos__estado">
                                        Clique em “Ver sugestões” para carregar
                                        imagens disponíveis.
                                    </div>
                                ) : carregandoSugestoes ? (
                                    <div className="ie-fundos__estado">
                                        Buscando sugestões...
                                    </div>
                                ) : sugestoes.length === 0 ? (
                                    <div className="ie-fundos__estado">
                                        Nenhuma sugestão disponível no momento.
                                    </div>
                                ) : (
                                    <div className="ie-fundos__grade">
                                        {sugestoes.map((fundo) => (
                                            <article
                                                className="ie-fundos__card"
                                                key={fundo.id}
                                            >
                                                <img
                                                    src={fundo.imagem_url}
                                                    alt="Sugestão de imagem de fundo"
                                                    loading="lazy"
                                                />

                                                <div className="ie-fundos__card-info">
                                                    <span>
                                                        Imagem do sistema
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="ie-ironstock__botao ie-ironstock__botao--secundario"
                                                        onClick={() =>
                                                            adicionarFundo(fundo)
                                                        }
                                                        disabled={
                                                            adicionando !== null ||
                                                            enviando
                                                        }
                                                    >
                                                        {adicionando === fundo.id
                                                            ? "Adicionando..."
                                                            : "Adicionar à loja"}
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* RODAPÉ */}
                            <footer className="ie-fundos__rodape">
                                <button
                                    type="button"
                                    className="ie-ironstock__botao ie-ironstock__botao--secundario"
                                    onClick={fecharModal}
                                >
                                    Fechar
                                </button>
                            </footer>
                        </section>
                    </div>,
                    document.body
                )}
        </>
    );
}