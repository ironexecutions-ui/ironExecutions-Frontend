
import React, { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "../../../../../config";
import "./categorias.css";

export default function Categorias() {

    const [categorias, setCategorias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState("");
    const [uploadAtual, setUploadAtual] = useState(null);
    const [arrastando, setArrastando] = useState(null);
    const [erro, setErro] = useState("");

    const arquivosRef = useRef({});

    const token = localStorage.getItem("token");

    // =====================================================
    // CARREGAR CATEGORIAS
    // =====================================================

    const carregarCategorias = useCallback(async () => {

        try {

            setCarregando(true);
            setErro("");

            const resposta = await fetch(
                `${API_URL}/categorias/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar as categorias.");
            }

            const dados = await resposta.json();

            setCategorias(
                Array.isArray(dados.categorias)
                    ? dados.categorias
                    : []
            );

        } catch (erro) {

            console.error("[CATEGORIAS]", erro);

            setErro(erro.message);

        } finally {

            setCarregando(false);

        }

    }, [token]);

    useEffect(() => {
        carregarCategorias();
    }, [carregarCategorias]);


    // =====================================================
    // ATUALIZAR CATEGORIA NO ESTADO
    // =====================================================

    function atualizarCategoriaLocal(id, alteracoes) {

        setCategorias(lista =>
            lista.map(item =>
                String(item.id) === String(id)
                    ? { ...item, ...alteracoes }
                    : item
            )
        );

    }


    // =====================================================
    // ATUALIZAR DADOS NO BACKEND
    // =====================================================

    async function salvarCategoria(id, dados) {

        const resposta = await fetch(
            `${API_URL}/categorias/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        if (!resposta.ok) {

            const resultado = await resposta.json().catch(() => ({}));

            throw new Error(
                resultado.detail || "Erro ao salvar categoria."
            );

        }

        return resposta.json();

    }


    // =====================================================
    // VALIDAR IMAGEM
    // =====================================================

    function validarImagem(arquivo) {

        if (!arquivo) {
            throw new Error("Selecione uma imagem.");
        }

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {
            throw new Error("Formato não permitido. Use JPG, PNG, WEBP ou GIF.");
        }

        if (arquivo.size > 10 * 1024 * 1024) {
            throw new Error("A imagem deve ter no máximo 10 MB.");
        }

    }


    // =====================================================
    // ENVIAR IMAGEM PARA A VPS
    // =====================================================

    async function enviarImagem(arquivo) {

        const formulario = new FormData();

        formulario.append("arquivo", arquivo);

        const resposta = await fetch(
            `${API_URL}/arquivos/imagem`,
            {
                method: "POST",
                body: formulario
            }
        );

        if (!resposta.ok) {

            const resultado = await resposta.json().catch(() => ({}));

            throw new Error(
                resultado.detail || "Erro ao enviar imagem."
            );

        }

        const resultado = await resposta.json();

        if (!resultado.url) {
            throw new Error("O servidor não retornou a URL da imagem.");
        }

        return resultado.url;

    }


    // =====================================================
    // UPLOAD E SALVAMENTO DA CATEGORIA
    // =====================================================

    async function processarImagem(categoria, arquivo) {

        if (uploadAtual !== null) {
            return;
        }

        try {

            validarImagem(arquivo);

            setErro("");

            setUploadAtual(categoria.id);

            // 1. Enviar arquivo para VPS

            const urlImagem = await enviarImagem(arquivo);

            // 2. Salvar URL na tabela categoris_imagens

            await salvarCategoria(categoria.id, {
                imagem: urlImagem
            });

            // 3. Atualizar interface

            atualizarCategoriaLocal(categoria.id, {
                imagem: urlImagem
            });

        } catch (erro) {

            console.error("[CATEGORIAS UPLOAD]", erro);

            setErro(erro.message);

        } finally {

            setUploadAtual(null);

            if (arquivosRef.current[categoria.id]) {
                arquivosRef.current[categoria.id].value = "";
            }

        }

    }


    // =====================================================
    // SELECIONAR IMAGEM
    // =====================================================

    function selecionarImagem(categoria) {

        arquivosRef.current[categoria.id]?.click();

    }


    // =====================================================
    // ARRASTAR IMAGEM
    // =====================================================

    function iniciarArraste(evento, categoria) {

        evento.preventDefault();

        setArrastando(categoria.id);

    }


    function soltarImagem(evento, categoria) {

        evento.preventDefault();

        setArrastando(null);

        const arquivo = evento.dataTransfer.files?.[0];

        if (arquivo) {
            processarImagem(categoria, arquivo);
        }

    }


    // =====================================================
    // AUTORIZAR / DESAUTORIZAR
    // =====================================================

    async function alterarExibicao(categoria) {

        const novoValor =
            String(categoria.aparece) === "1"
                ? "0"
                : "1";

        try {

            setErro("");

            // Atualização otimista da interface

            atualizarCategoriaLocal(categoria.id, {
                aparece: novoValor
            });

            await salvarCategoria(categoria.id, {
                aparece: novoValor
            });

        } catch (erro) {

            // Reverter se falhar

            atualizarCategoriaLocal(categoria.id, {
                aparece: categoria.aparece
            });

            setErro(erro.message);

        }

    }


    // =====================================================
    // FILTRAR CATEGORIAS
    // =====================================================

    const categoriasFiltradas = categorias.filter(item =>
        String(item.categoria || "")
            .toLowerCase()
            .includes(busca.toLowerCase())
    );


    // =====================================================
    // CONTADORES
    // =====================================================

    const autorizadas = categorias.filter(
        item => String(item.aparece) === "1"
    ).length;


    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================

    return (

        <div className="iron-categorias-container">

            {/* CABEÇALHO */}

            <div className="iron-categorias-topo">

                <div className="iron-categorias-titulo">

                    <span className="iron-categorias-subtitulo">
                        ORGANIZAÇÃO DA LOJA
                    </span>

                    <h2>Categorias</h2>

                    <p>
                        Gerencie as imagens e a exibição das categorias
                        dos seus produtos.
                    </p>

                </div>

                <button
                    type="button"
                    className="iron-categorias-atualizar"
                    onClick={carregarCategorias}
                    disabled={carregando}
                >
                    ↻ Atualizar
                </button>

            </div>


            {/* INDICADORES */}

            <div className="iron-categorias-indicadores">

                <div className="iron-categorias-indicador">

                    <span>Total de categorias</span>

                    <strong>{categorias.length}</strong>

                </div>

                <div className="iron-categorias-indicador">

                    <span>Autorizadas</span>

                    <strong>{autorizadas}</strong>

                </div>

                <div className="iron-categorias-indicador">

                    <span>Não autorizadas</span>

                    <strong>{categorias.length - autorizadas}</strong>

                </div>

            </div>


            {/* BUSCA */}

            <div className="iron-categorias-busca">

                <span>⌕</span>

                <input
                    type="text"
                    placeholder="Pesquisar categoria..."
                    value={busca}
                    onChange={evento => setBusca(evento.target.value)}
                />

            </div>


            {/* ERRO */}

            {erro && (

                <div className="iron-categorias-erro">
                    {erro}
                </div>

            )}


            {/* CARREGAMENTO */}

            {carregando ? (

                <div className="iron-categorias-loading">

                    <div className="iron-categorias-spinner" />

                    <span>Carregando categorias...</span>

                </div>

            ) : categoriasFiltradas.length === 0 ? (

                <div className="iron-categorias-vazio">

                    <span>▧</span>

                    <strong>
                        {busca
                            ? "Nenhuma categoria encontrada"
                            : "Nenhuma categoria cadastrada"}
                    </strong>

                    <p>
                        As categorias dos seus produtos aparecerão aqui automaticamente.
                    </p>

                </div>

            ) : (

                /* LISTA */

                <div className="iron-categorias-grid">

                    {categoriasFiltradas.map(categoria => {

                        const enviando =
                            String(uploadAtual) === String(categoria.id);

                        const aparece =
                            String(categoria.aparece) === "1";

                        const temImagem =
                            Boolean(categoria.imagem?.trim());

                        const estaArrastando =
                            String(arrastando) === String(categoria.id);

                        return (

                            <div
                                className="iron-categorias-card"
                                key={categoria.id}
                            >

                                {/* IMAGEM */}

                                <div
                                    className={`iron-categorias-upload ${estaArrastando ? "arrastando" : ""
                                        }`}
                                    onClick={() => selecionarImagem(categoria)}
                                    onDragOver={evento =>
                                        iniciarArraste(evento, categoria)
                                    }
                                    onDragLeave={() => setArrastando(null)}
                                    onDrop={evento =>
                                        soltarImagem(evento, categoria)
                                    }
                                >

                                    <input
                                        ref={elemento => {
                                            arquivosRef.current[categoria.id] = elemento;
                                        }}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        hidden
                                        onChange={evento => {

                                            const arquivo =
                                                evento.target.files?.[0];

                                            if (arquivo) {
                                                processarImagem(categoria, arquivo);
                                            }

                                        }}
                                    />

                                    {temImagem ? (

                                        <img
                                            src={categoria.imagem}
                                            alt={categoria.categoria}
                                            className="iron-categorias-imagem"
                                        />

                                    ) : (

                                        <div className="iron-categorias-sem-imagem">

                                            <span>▧</span>

                                            <strong>
                                                Adicionar imagem
                                            </strong>

                                            <small>
                                                Clique ou arraste uma foto
                                            </small>

                                        </div>

                                    )}

                                    {enviando && (

                                        <div className="iron-categorias-upload-overlay">

                                            <div className="iron-categorias-spinner" />

                                            <span>Enviando imagem...</span>

                                        </div>

                                    )}

                                    {!enviando && temImagem && (

                                        <div className="iron-categorias-alterar-imagem">
                                            Alterar imagem
                                        </div>

                                    )}

                                </div>


                                {/* INFORMAÇÕES */}

                                <div className="iron-categorias-card-info">

                                    <div className="iron-categorias-card-nome">

                                        <strong>
                                            {categoria.categoria}
                                        </strong>

                                        <span>
                                            {aparece
                                                ? "Autorizada"
                                                : "Não autorizada"}
                                        </span>

                                    </div>


                                    {/* AUTORIZAÇÃO */}

                                    <div className="iron-categorias-controle">

                                        <div className="iron-categorias-controle-texto">

                                            <strong>
                                                Exibir categoria
                                            </strong>

                                            <small>
                                                Autorizar exibição na loja
                                            </small>

                                        </div>

                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={aparece}
                                            aria-label={`Exibir categoria ${categoria.categoria}`}
                                            className={`iron-categorias-switch ${aparece ? "ativo" : ""
                                                }`}
                                            disabled={enviando}
                                            onClick={() =>
                                                alterarExibicao(categoria)
                                            }
                                        >

                                            <span />

                                        </button>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}
