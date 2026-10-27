
import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../config";
import "./impressao.css";

const FORMATOS_PERMITIDOS = [
    ".pdf",
    ".doc",
    ".docx",
    ".odt",
    ".rtf",
    ".txt",
    ".csv",
    ".xls",
    ".xlsx",
    ".ods",
    ".ppt",
    ".pptx",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff"
];

const TAMANHO_MAXIMO = 25 * 1024 * 1024;

export default function Impressao() {
    const { idCriptografado } = useParams();
    const inputRef = useRef(null);

    const [arquivo, setArquivo] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    function selecionarArquivo(evento) {
        const selecionado = evento.target.files?.[0];

        setMensagem("");
        setTipoMensagem("");
        setArquivo(null);

        if (!selecionado) return;

        const extensao =
            "." + (selecionado.name.split(".").pop() || "").toLowerCase();

        if (!FORMATOS_PERMITIDOS.includes(extensao)) {
            setMensagem(
                "Formato não permitido. Envie documentos, planilhas, PDFs ou imagens."
            );
            setTipoMensagem("erro");
            evento.target.value = "";
            return;
        }

        if (selecionado.size > TAMANHO_MAXIMO) {
            setMensagem("O arquivo ultrapassa o limite de 25 MB.");
            setTipoMensagem("erro");
            evento.target.value = "";
            return;
        }

        setArquivo(selecionado);
    }

    async function enviarArquivo(evento) {
        evento.preventDefault();

        if (!arquivo || enviando) return;

        setEnviando(true);
        setMensagem("");
        setTipoMensagem("");

        try {
            const formulario = new FormData();
            formulario.append("arquivo", arquivo);

            const resposta = await fetch(
                `${API_URL}/impressao/${encodeURIComponent(idCriptografado)}/enviar`,
                {
                    method: "POST",
                    body: formulario,
                    cache: "no-store"
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Não foi possível enviar o arquivo."
                );
            }

            setMensagem("Arquivo enviado com sucesso!");
            setTipoMensagem("sucesso");
            setArquivo(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } catch (erro) {
            setMensagem(
                erro.message || "Erro ao enviar o arquivo. Tente novamente."
            );
            setTipoMensagem("erro");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="impressao-pagina">
            <section className="impressao-cartao">
                <div className="impressao-icone" aria-hidden="true">
                    <svg
                        viewBox="0 0 24 24"
                        width="36"
                        height="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    >
                        <path d="M7 8V3h10v5" />
                        <rect x="5" y="14" width="14" height="7" rx="1" />
                        <path d="M5 17H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <path d="M17 11h1" />
                    </svg>
                </div>

                <span className="impressao-etiqueta">
                    SERVIÇO DE IMPRESSÃO
                </span>

                <h1>Envie seu arquivo</h1>

                <p className="impressao-descricao">
                    Selecione o documento, a planilha, o PDF ou a imagem
                    que deseja imprimir.
                </p>

                <form onSubmit={enviarArquivo}>
                    <label
                        className="impressao-seletor"
                        htmlFor="impressao-arquivo"
                    >
                        <span className="impressao-upload-icone">↑</span>
                        <strong>
                            {arquivo
                                ? "Arquivo selecionado"
                                : "Escolher arquivo"}
                        </strong>
                        <span>
                            {arquivo
                                ? arquivo.name
                                : "Clique aqui para procurar no dispositivo"}
                        </span>
                        <small>Limite de 25 MB por arquivo</small>
                    </label>

                    <input
                        ref={inputRef}
                        id="impressao-arquivo"
                        type="file"
                        accept={FORMATOS_PERMITIDOS.join(",")}
                        onChange={selecionarArquivo}
                        disabled={enviando}
                        hidden
                    />

                    {arquivo && (
                        <div className="impressao-arquivo-selecionado">
                            <span>{arquivo.name}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setArquivo(null);
                                    if (inputRef.current) {
                                        inputRef.current.value = "";
                                    }
                                }}
                                disabled={enviando}
                            >
                                Remover
                            </button>
                        </div>
                    )}

                    {mensagem && (
                        <div
                            className={`impressao-mensagem ${tipoMensagem}`}
                            role="status"
                        >
                            {mensagem}
                        </div>
                    )}

                    <button
                        className="impressao-botao-enviar"
                        type="submit"
                        disabled={!arquivo || enviando}
                    >
                        {enviando ? "Enviando arquivo..." : "Enviar para impressão"}
                    </button>
                </form>

                <p className="impressao-privacidade">
                    Não é necessário fazer login para enviar seu arquivo.
                </p>
            </section>
        </main>
    );
}
