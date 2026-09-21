import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { removeBackground } from "@imgly/background-removal";
import { API_URL } from "../../../../../config";
import "./formularioimagens.css";
export default function FormularioImagens({
    valor,
    alterar,
    obterProdutoId
}) {
    const imagensSalvas = String(valor || "").split("|").filter(Boolean);
    const [preview, setPreview] = useState([]);
    const [arrastando, setArrastando] = useState(false);
    const [modalMobile, setModalMobile] = useState(false);
    const [fotoCapturada, setFotoCapturada] = useState(null);
    const [processando, setProcessando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const inputArquivosRef = useRef(null);
    const inputCameraRef = useRef(null);
    const [gerandoQrCelular, setGerandoQrCelular] = useState(false);
    const [modalQrCelular, setModalQrCelular] = useState(false);
    const [dadosQrCelular, setDadosQrCelular] = useState(null);
    const [erroQrCelular, setErroQrCelular] = useState("");
    const [segundosQrCelular, setSegundosQrCelular] = useState(0);
    useEffect(() => {
        return () => {
            preview.forEach(url => URL.revokeObjectURL(url));
            if (fotoCapturada?.url) URL.revokeObjectURL(fotoCapturada.url);
        };
    }, [preview, fotoCapturada]);
    useEffect(() => {
        if (!modalQrCelular) return;
        if (segundosQrCelular <= 0) return;

        const intervalo = window.setInterval(() => {
            setSegundosQrCelular(anterior => {
                if (anterior <= 1) {
                    window.clearInterval(intervalo);
                    return 0;
                }

                return anterior - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalo);
        };
    }, [
        modalQrCelular,
        segundosQrCelular > 0
    ]);
    function dispositivoMobile() {
        return window.matchMedia("(max-width: 800px)").matches;
    }

    function abrirSeletor() {
        setMensagem("");
        if (dispositivoMobile()) {
            setModalMobile(true);
            return;
        }
        inputArquivosRef.current?.click();
    }

    function fecharModal() {
        if (processando) return;
        setModalMobile(false);
        descartarFotoCapturada();
    }

    function descartarFotoCapturada() {
        if (fotoCapturada?.url) URL.revokeObjectURL(fotoCapturada.url);
        setFotoCapturada(null);
        if (inputCameraRef.current) inputCameraRef.current.value = "";
    }

    async function upload(files) {
        const arquivos = Array.from(files || []).filter(file =>
            file.type.startsWith("image/")
        );
        if (!arquivos.length) return;

        const token = localStorage.getItem("token");
        const blobs = arquivos.map(file => URL.createObjectURL(file));
        setPreview(prev => [...prev, ...blobs]);
        setMensagem("");

        try {
            const formData = new FormData();
            formData.append("pasta", "produtos");
            arquivos.forEach(file => formData.append("arquivos", file));

            const resp = await fetch(`${API_URL}/upload/client/imagens`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const json = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                throw new Error(json.detail || json.mensagem || "Não foi possível enviar a imagem.");
            }

            const novasUrls = String(json.urls || "").split("|").filter(Boolean);
            if (!novasUrls.length) throw new Error("O servidor não retornou a imagem enviada.");

            alterar([...imagensSalvas, ...novasUrls].join("|"));
        } catch (erro) {
            console.error("Erro ao enviar imagens:", erro);
            setMensagem(erro.message || "Erro ao enviar a imagem.");
        } finally {
            setPreview(prev => {
                prev.forEach(url => URL.revokeObjectURL(url));
                return [];
            });
            if (inputArquivosRef.current) inputArquivosRef.current.value = "";
        }
    }

    function selecionarFotoCamera(evento) {
        const arquivo = evento.target.files?.[0];
        if (!arquivo) return;
        descartarFotoCapturada();
        setFotoCapturada({ arquivo, url: URL.createObjectURL(arquivo) });
    }

    async function criarImagemComFundoBranco(arquivo) {
        const recorte = await removeBackground(arquivo, {
            output: { format: "image/png", quality: 1 }
        });
        const urlRecorte = URL.createObjectURL(recorte);

        try {
            const imagem = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error("Não foi possível preparar o recorte."));
                img.src = urlRecorte;
            });

            const canvas = document.createElement("canvas");
            canvas.width = imagem.naturalWidth;
            canvas.height = imagem.naturalHeight;
            const contexto = canvas.getContext("2d");
            contexto.fillStyle = "#ffffff";
            contexto.fillRect(0, 0, canvas.width, canvas.height);
            contexto.drawImage(imagem, 0, 0);

            const blobFinal = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    blob => blob ? resolve(blob) : reject(new Error("Falha ao finalizar a foto.")),
                    "image/jpeg",
                    0.94
                );
            });

            return new File([blobFinal], `produto-${Date.now()}.jpg`, {
                type: "image/jpeg"
            });
        } finally {
            URL.revokeObjectURL(urlRecorte);
        }
    }

    async function usarFoto() {
        if (!fotoCapturada?.arquivo || processando) return;
        setProcessando(true);
        setMensagem("");

        try {
            const fotoPronta = await criarImagemComFundoBranco(fotoCapturada.arquivo);
            setModalMobile(false);
            descartarFotoCapturada();
            await upload([fotoPronta]);
        } catch (erro) {
            console.error("Erro ao remover fundo:", erro);
            setMensagem("Não foi possível remover o fundo. Tente outra foto com boa iluminação.");
        } finally {
            setProcessando(false);
        }
    }

    function remover(index) {
        alterar(imagensSalvas.filter((_, i) => i !== index).join("|"));
    }

    function soltar(evento) {
        evento.preventDefault();
        setArrastando(false);
        if (evento.dataTransfer.files.length) upload(evento.dataTransfer.files);
    }
    async function adicionarPeloCelular(evento) {
        evento?.stopPropagation();

        if (gerandoQrCelular) return;

        setGerandoQrCelular(true);
        setErroQrCelular("");

        try {
            console.log("[FOTO CELULAR] Preparando produto...");

            if (typeof obterProdutoId !== "function") {
                throw new Error(
                    "Não foi possível preparar o produto para receber fotos."
                );
            }

            /*
             * Essa função virá do FormularioProduto.
             *
             * Se o produto ainda não existir:
             * 1. salva
             * 2. recebe o ID
             *
             * Se já existir:
             * retorna o ID existente.
             */
            const produtoId = await obterProdutoId();

            console.log(
                "[FOTO CELULAR] Produto preparado:",
                produtoId
            );

            if (!produtoId) {
                throw new Error(
                    "Não foi possível identificar o produto."
                );
            }

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Sua sessão não foi encontrada."
                );
            }

            console.log(
                "[FOTO CELULAR] Gerando acesso temporário..."
            );

            const resposta = await fetch(
                `${API_URL}/upload/client/foto-produto-mobile/gerar`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        produto_id: Number(produtoId)
                    })
                }
            );

            const json = await resposta
                .json()
                .catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    json.detail ||
                    "Não foi possível gerar o acesso pelo celular."
                );
            }

            console.log(
                "[FOTO CELULAR] Acesso criado:",
                json
            );

            setDadosQrCelular(json);

            setSegundosQrCelular(
                Number(json.expira_em_segundos || 300)
            );

            setModalQrCelular(true);

        } catch (erro) {
            console.error(
                "[FOTO CELULAR] Erro:",
                erro
            );

            setErroQrCelular(
                erro.message ||
                "Não foi possível gerar o acesso pelo celular."
            );

            setModalQrCelular(true);

        } finally {
            setGerandoQrCelular(false);
        }
    }
    return (
        <div className="imagens-produto-profissional-container">

            <input
                ref={inputArquivosRef}
                className="imagens-produto-profissional-input-arquivos"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={evento => upload(evento.target.files)}
            />

            <input
                ref={inputCameraRef}
                className="imagens-produto-profissional-input-camera"
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={selecionarFotoCamera}
            />

            <div
                className={`imagens-produto-profissional-dropzone ${arrastando
                    ? "imagens-produto-profissional-dropzone-ativo"
                    : ""
                    }`}
                onClick={abrirSeletor}
                onDragOver={evento => {
                    evento.preventDefault();
                    setArrastando(true);
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={soltar}
                role="button"
                tabIndex={0}
                onKeyDown={evento => {
                    if (
                        evento.key === "Enter" ||
                        evento.key === " "
                    ) {
                        abrirSeletor();
                    }
                }}
            >
                <strong className="imagens-produto-profissional-dropzone-titulo">
                    Arraste as imagens aqui
                </strong>

                <span className="imagens-produto-profissional-dropzone-descricao">
                    ou clique para adicionar
                </span>
            </div>

            {mensagem && (
                <p className="imagens-produto-profissional-erro">
                    {mensagem}
                </p>
            )}

            {(imagensSalvas.length > 0 || preview.length > 0) && (
                <div className="imagens-produto-profissional-lista">

                    {imagensSalvas.map((img, i) => (
                        <div
                            className="imagens-produto-profissional-card"
                            key={`db-${img}-${i}`}
                        >
                            <img
                                className="imagens-produto-profissional-card-imagem"
                                src={img}
                                alt={`Imagem ${i + 1} do produto`}
                            />

                            <button
                                className="imagens-produto-profissional-card-remover"
                                type="button"
                                onClick={() => remover(i)}
                                aria-label="Remover imagem"
                            >
                                <span className="imagens-produto-profissional-card-remover-icone">
                                    ✕
                                </span>
                            </button>
                        </div>
                    ))}

                    {preview.map((img, i) => (
                        <div
                            className="imagens-produto-profissional-card imagens-produto-profissional-card-carregando"
                            key={`blob-${i}`}
                        >
                            <img
                                className="imagens-produto-profissional-card-imagem imagens-produto-profissional-card-imagem-preview"
                                src={img}
                                alt="Imagem sendo enviada"
                            />

                            <span className="imagens-produto-profissional-card-status">
                                Enviando...
                            </span>
                        </div>
                    ))}

                </div>
            )}

            {modalMobile && createPortal(
                <div
                    className="captura-produto-mobile-fundo"
                    onMouseDown={evento => {
                        if (evento.target === evento.currentTarget) {
                            fecharModal();
                        }
                    }}
                >
                    <section
                        className="captura-produto-mobile-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Adicionar foto do produto"
                    >
                        <button
                            className="captura-produto-mobile-fechar"
                            type="button"
                            onClick={fecharModal}
                            disabled={processando}
                            aria-label="Fechar janela"
                        >
                            <span className="captura-produto-mobile-fechar-icone">
                                ✕
                            </span>
                        </button>

                        {!fotoCapturada ? (
                            <div className="captura-produto-mobile-inicio">

                                <div className="captura-produto-mobile-icone">
                                    <span className="captura-produto-mobile-icone-camera">
                                        📷
                                    </span>
                                </div>

                                <h2 className="captura-produto-mobile-titulo">
                                    Adicionar imagem do produto
                                </h2>

                                <p className="captura-produto-mobile-descricao">
                                    Use uma foto bem iluminada e deixe todo o
                                    produto visível.
                                </p>

                                <button
                                    className="captura-produto-mobile-opcao captura-produto-mobile-opcao-principal"
                                    type="button"
                                    onClick={() =>
                                        inputCameraRef.current?.click()
                                    }
                                >
                                    <span className="captura-produto-mobile-opcao-icone captura-produto-mobile-opcao-icone-camera">
                                        📸
                                    </span>

                                    <div className="captura-produto-mobile-opcao-conteudo">
                                        <strong className="captura-produto-mobile-opcao-titulo captura-produto-mobile-opcao-titulo-camera">
                                            Abrir câmera
                                        </strong>

                                        <small className="captura-produto-mobile-opcao-descricao captura-produto-mobile-opcao-descricao-camera">
                                            Fotografar e remover o fundo
                                        </small>
                                    </div>

                                    <span
                                        className="captura-produto-mobile-opcao-seta captura-produto-mobile-opcao-seta-camera"
                                        aria-hidden="true"
                                    >
                                        ›
                                    </span>
                                </button>

                                <button
                                    className="captura-produto-mobile-opcao captura-produto-mobile-opcao-arquivos"
                                    type="button"
                                    onClick={() => {
                                        setModalMobile(false);
                                        inputArquivosRef.current?.click();
                                    }}
                                >
                                    <span className="captura-produto-mobile-opcao-icone captura-produto-mobile-opcao-icone-arquivos">
                                        🖼️
                                    </span>

                                    <div className="captura-produto-mobile-opcao-conteudo">
                                        <strong className="captura-produto-mobile-opcao-titulo captura-produto-mobile-opcao-titulo-arquivos">
                                            Carregar arquivos
                                        </strong>

                                        <small className="captura-produto-mobile-opcao-descricao captura-produto-mobile-opcao-descricao-arquivos">
                                            Escolher uma ou mais imagens
                                        </small>
                                    </div>

                                    <span
                                        className="captura-produto-mobile-opcao-seta captura-produto-mobile-opcao-seta-arquivos"
                                        aria-hidden="true"
                                    >
                                        ›
                                    </span>
                                </button>

                            </div>
                        ) : (
                            <div className="captura-produto-mobile-confirmacao">

                                <h2 className="captura-produto-mobile-titulo captura-produto-mobile-titulo-confirmacao">
                                    Confira a foto
                                </h2>

                                <p className="captura-produto-mobile-descricao captura-produto-mobile-descricao-confirmacao">
                                    Ao continuar, o fundo será removido e ficará
                                    branco.
                                </p>

                                <div className="captura-produto-mobile-preview">
                                    <img
                                        className="captura-produto-mobile-preview-imagem"
                                        src={fotoCapturada.url}
                                        alt="Foto capturada do produto"
                                    />

                                    {processando && (
                                        <div className="captura-produto-mobile-processando">
                                            <span className="captura-produto-mobile-processando-spinner" />

                                            <strong className="captura-produto-mobile-processando-texto">
                                                Removendo o fundo...
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                {mensagem && (
                                    <p className="captura-produto-mobile-erro">
                                        {mensagem}
                                    </p>
                                )}

                                <div className="captura-produto-mobile-acoes">
                                    <button
                                        className="captura-produto-mobile-botao-refazer"
                                        type="button"
                                        onClick={() =>
                                            inputCameraRef.current?.click()
                                        }
                                        disabled={processando}
                                    >
                                        <span className="captura-produto-mobile-botao-refazer-texto">
                                            Refazer
                                        </span>
                                    </button>

                                    <button
                                        className="captura-produto-mobile-botao-confirmar"
                                        type="button"
                                        onClick={usarFoto}
                                        disabled={processando}
                                    >
                                        <span className="captura-produto-mobile-botao-confirmar-texto">
                                            {processando
                                                ? "Processando..."
                                                : "Usar esta foto"}
                                        </span>
                                    </button>
                                </div>

                            </div>
                        )}
                    </section>
                </div>,
                document.body
            )}
            <div
                className="imagens-produto-profissional-celular-area"
                onClick={evento => evento.stopPropagation()}
            >
                <div className="imagens-produto-profissional-celular-divisor">
                    <span className="imagens-produto-profissional-celular-divisor-linha" />

                    <span className="imagens-produto-profissional-celular-divisor-texto">
                        ou
                    </span>

                    <span className="imagens-produto-profissional-celular-divisor-linha" />
                </div>

                <button
                    type="button"
                    className="imagens-produto-profissional-celular-botao"
                    onClick={adicionarPeloCelular}
                    disabled={gerandoQrCelular}
                >
                    <span className="imagens-produto-profissional-celular-botao-icone">
                        📱
                    </span>

                    <span className="imagens-produto-profissional-celular-botao-conteudo">
                        <strong className="imagens-produto-profissional-celular-botao-titulo">
                            {gerandoQrCelular
                                ? "Preparando acesso..."
                                : "Adicionar fotos pelo celular"}
                        </strong>

                        <small className="imagens-produto-profissional-celular-botao-descricao">
                            Escaneie um QR Code e fotografe o produto pelo celular
                        </small>
                    </span>

                    {!gerandoQrCelular && (
                        <span
                            className="imagens-produto-profissional-celular-botao-seta"
                            aria-hidden="true"
                        >
                            ›
                        </span>
                    )}

                    {gerandoQrCelular && (
                        <span className="imagens-produto-profissional-celular-carregando" />
                    )}
                </button>
                {modalQrCelular && createPortal(
                    <div
                        className="foto-celular-qr-fundo"
                        onMouseDown={evento => {
                            if (evento.target === evento.currentTarget) {
                                setModalQrCelular(false);
                            }
                        }}
                    >
                        <section
                            className="foto-celular-qr-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Adicionar fotos pelo celular"
                        >
                            <button
                                type="button"
                                className="foto-celular-qr-fechar"
                                onClick={() => setModalQrCelular(false)}
                                aria-label="Fechar"
                            >
                                ✕
                            </button>

                            {erroQrCelular ? (
                                <div className="foto-celular-qr-erro-area">
                                    <div className="foto-celular-qr-erro-icone">
                                        !
                                    </div>

                                    <h2 className="foto-celular-qr-titulo">
                                        Não foi possível gerar o acesso
                                    </h2>

                                    <p className="foto-celular-qr-erro">
                                        {erroQrCelular}
                                    </p>

                                    <button
                                        type="button"
                                        className="foto-celular-qr-tentar-novamente"
                                        onClick={adicionarPeloCelular}
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : dadosQrCelular ? (
                                <>
                                    <div className="foto-celular-qr-cabecalho">
                                        <div className="foto-celular-qr-icone">
                                            📱
                                        </div>

                                        <div>
                                            <h2 className="foto-celular-qr-titulo">
                                                Adicionar fotos pelo celular
                                            </h2>

                                            <p className="foto-celular-qr-subtitulo">
                                                Escaneie o QR Code com a câmera do celular
                                            </p>
                                        </div>
                                    </div>

                                    {dadosQrCelular.produto && (
                                        <div className="foto-celular-qr-produto">
                                            <span className="foto-celular-qr-produto-label">
                                                Produto
                                            </span>

                                            <strong className="foto-celular-qr-produto-nome">
                                                {dadosQrCelular.produto.nome}
                                            </strong>

                                            {dadosQrCelular.produto.categoria && (
                                                <span className="foto-celular-qr-produto-categoria">
                                                    {dadosQrCelular.produto.categoria}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {segundosQrCelular > 0 ? (
                                        <>
                                            <div className="foto-celular-qr-codigo-area">
                                                <div className="foto-celular-qr-codigo">
                                                    <QRCodeSVG
                                                        value={dadosQrCelular.url}
                                                        size={230}
                                                        level="M"
                                                        includeMargin={false}
                                                    />
                                                </div>
                                            </div>

                                            <div className="foto-celular-qr-tempo">
                                                <span className="foto-celular-qr-tempo-ponto" />

                                                <span>
                                                    Este QR Code expira em{" "}
                                                    <strong>
                                                        {String(
                                                            Math.floor(segundosQrCelular / 60)
                                                        ).padStart(2, "0")}
                                                        :
                                                        {String(
                                                            segundosQrCelular % 60
                                                        ).padStart(2, "0")}
                                                    </strong>
                                                </span>
                                            </div>

                                            <p className="foto-celular-qr-instrucao">
                                                Abra a câmera do celular, aponte para o QR Code
                                                e toque no link que aparecer.
                                            </p>

                                            <button
                                                type="button"
                                                className="foto-celular-qr-abrir-link"
                                                onClick={() =>
                                                    window.open(
                                                        dadosQrCelular.url,
                                                        "_blank",
                                                        "noopener,noreferrer"
                                                    )
                                                }
                                            >
                                                Abrir link neste dispositivo
                                            </button>
                                        </>
                                    ) : (
                                        <div className="foto-celular-qr-expirado">
                                            <div className="foto-celular-qr-expirado-icone">
                                                ⏱
                                            </div>

                                            <strong className="foto-celular-qr-expirado-titulo">
                                                QR Code expirado
                                            </strong>

                                            <p className="foto-celular-qr-expirado-texto">
                                                Por segurança, este acesso ficou disponível
                                                durante 5 minutos.
                                            </p>

                                            <button
                                                type="button"
                                                className="foto-celular-qr-gerar-novo"
                                                onClick={adicionarPeloCelular}
                                            >
                                                Gerar novo QR Code
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="foto-celular-qr-carregando">
                                    Preparando QR Code...
                                </div>
                            )}
                        </section>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
}
