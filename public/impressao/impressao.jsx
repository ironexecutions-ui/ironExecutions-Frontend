
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../config";
import "./impressao.css";

// =========================================================
// LOGOS DAS REDES SOCIAIS
// =========================================================
import logoFacebook from "./img/facebook.png";
import logoInstagram from "./img/instagram.jpeg";
import logoTikTok from "./img/tiktok.jpeg";
import logoX from "./img/x.avif";
import logoYouTube from "./img/youtube.avif";

// =========================================================
// CONFIGURAÇÕES
// =========================================================
const FORMATOS_PERMITIDOS = [
    ".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt",
    ".csv", ".xls", ".xlsx", ".ods", ".ppt", ".pptx",
    ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"
];

const TAMANHO_MAXIMO = 25 * 1024 * 1024;

const REDES = {
    instagram: {
        nome: "Instagram",
        imagem: logoInstagram
    },
    tiktok: {
        nome: "TikTok",
        imagem: logoTikTok
    },
    youtube: {
        nome: "YouTube",
        imagem: logoYouTube
    },
    x: {
        nome: "X",
        imagem: logoX
    },
    facebook: {
        nome: "Facebook",
        imagem: logoFacebook
    }
};

// =========================================================
// FUNÇÕES AUXILIARES
// =========================================================
function formatarTamanho(bytes) {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function prepararLinkRede(rede, valor) {
    const url = String(valor || "").trim();

    if (!url) return "";

    if (rede === "whatsapp") {
        if (/^https?:\/\//i.test(url)) return url;

        const numero = url.replace(/\D/g, "");

        return numero ? `https://wa.me/${numero}` : "";
    }

    return /^https?:\/\//i.test(url)
        ? url
        : `https://${url}`;
}

// =========================================================
// ÍCONES DA INTERFACE
// =========================================================
function IconeImpressora() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 8V3h10v5" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="7" rx="1" />
            <path d="M17 11h.01" />
        </svg>
    );
}

function IconeArquivo() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" />
            <path d="M13 3v7h7M8 15h8M8 18h6" />
        </svg>
    );
}

function IconeEscudo() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function IconeUpload() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 16V4m-5 5 5-5 5 5" />
            <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
        </svg>
    );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function Impressao() {
    const { idCriptografado } = useParams();
    const inputRef = useRef(null);

    const [arquivo, setArquivo] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [dadosComercio, setDadosComercio] = useState(null);
    const [carregandoComercio, setCarregandoComercio] = useState(true);


    // =====================================================
    // CARREGAR DADOS DA LOJA
    // =====================================================
    useEffect(() => {
        let cancelado = false;

        async function carregarComercio() {
            setCarregandoComercio(true);

            try {
                const resposta = await fetch(
                    `${API_URL}/impressao/publico/${encodeURIComponent(idCriptografado)}`,
                    { cache: "no-store" }
                );

                const dados = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    throw new Error(
                        dados.detail ||
                        "Não foi possível carregar os dados da loja."
                    );
                }

                if (!cancelado) {
                    setDadosComercio({
                        comercio: {
                            nome: dados?.comercio?.nome || "",
                            logo: dados?.comercio?.logo || "",
                            dominio: dados?.comercio?.dominio || ""
                        },
                        redes_sociais: dados?.redes_sociais || {}
                    });
                }
            } catch (erro) {
                console.error(
                    "Erro ao carregar dados da loja:",
                    erro
                );

                if (!cancelado) {
                    setDadosComercio({
                        comercio: {
                            nome: "",
                            logo: ""
                        },
                        redes_sociais: {}
                    });
                }
            } finally {
                if (!cancelado) {
                    setCarregandoComercio(false);
                }
            }
        }

        if (idCriptografado) {
            carregarComercio();
        } else {
            setCarregandoComercio(false);

            setDadosComercio({
                comercio: { nome: "", logo: "" },
                redes_sociais: {}
            });
        }

        return () => {
            cancelado = true;
        };
    }, [idCriptografado]);

    // =====================================================
    // SELECIONAR ARQUIVO
    // =====================================================
    function selecionarArquivo(evento) {
        const selecionado = evento.target.files?.[0];

        setMensagem("");
        setTipoMensagem("");
        setArquivo(null);

        if (!selecionado) return;

        const extensao =
            `.${selecionado.name.split(".").pop() || ""}`.toLowerCase();

        if (!FORMATOS_PERMITIDOS.includes(extensao)) {
            setMensagem(
                "Formato não permitido. Selecione um documento, planilha, PDF ou imagem compatível."
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

    // =====================================================
    // REMOVER ARQUIVO SELECIONADO
    // =====================================================
    function removerArquivo() {
        if (enviando) return;

        setArquivo(null);
        setMensagem("");
        setTipoMensagem("");

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    // =====================================================
    // ENVIAR ARQUIVO PARA O BACKEND
    // =====================================================
    async function enviarArquivo(evento) {
        evento.preventDefault();

        if (!arquivo || enviando || !idCriptografado) return;

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
                    dados.detail ||
                    "Não foi possível enviar o arquivo. Tente novamente."
                );
            }

            setMensagem(
                "Arquivo enviado com sucesso! A loja já pode recebê-lo para impressão."
            );

            setTipoMensagem("sucesso");
            setArquivo(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } catch (erro) {
            setMensagem(
                erro.message ||
                "Ocorreu um erro ao enviar o arquivo."
            );

            setTipoMensagem("erro");
        } finally {
            setEnviando(false);
        }
    }

    // =====================================================
    // DADOS DA LOJA E LINKS DAS REDES
    // =====================================================
    const comercio = dadosComercio?.comercio || {};
    const redesSociais = dadosComercio?.redes_sociais || {};

    const dominioUrl = prepararLinkRede("site", comercio.dominio || "");

    const letrasNomeLoja = Array.from(comercio.nome || "");
    const instagramUrl = prepararLinkRede(
        "instagram",
        redesSociais.instagram
    );

    const outrasRedes = Object.entries(REDES)
        .filter(([rede]) => rede !== "instagram")
        .map(([rede, configuracao]) => ({
            rede,
            nome: configuracao.nome,
            imagem: configuracao.imagem,
            href: prepararLinkRede(
                rede,
                redesSociais[rede]
            )
        }))
        .filter((rede) => Boolean(rede.href));

    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================
    return (
        <main className="impressao-pagina">
            <div
                className="impressao-fundo-luz impressao-fundo-luz-um"
                aria-hidden="true"
            />

            <div
                className="impressao-fundo-luz impressao-fundo-luz-dois"
                aria-hidden="true"
            />

            <div className="impressao-layout">
                {/* CABEÇALHO DA LOJA */}
                <header className="impressao-cabecalho">
                    <div className="impressao-marca">
                        {comercio.logo ? (
                            <img
                                className="impressao-logo"
                                src={comercio.logo}
                                alt={
                                    comercio.nome
                                        ? `Logo de ${comercio.nome}`
                                        : "Logo da loja"
                                }
                                onError={(evento) => {
                                    evento.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <div
                                className="impressao-logo-placeholder"
                                aria-hidden="true"
                            >
                                <IconeImpressora />
                            </div>
                        )}

                        <div className="impressao-identidade">
                            {carregandoComercio ? (
                                <span className="impressao-texto-carregando">
                                    Carregando loja...
                                </span>
                            ) : (
                                <>
                                    {comercio.nome && (
                                        <h2 className="impressao-nome-loja">
                                            {comercio.nome}
                                        </h2>
                                    )}

                                    <span className="impressao-loja-legenda">
                                        Atendimento para impressão
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* OUTRAS REDES SOCIAIS */}
                    {outrasRedes.length > 0 && (
                        <nav
                            className="impressao-redes"
                            aria-label="Redes sociais da loja"
                        >
                            {outrasRedes.map(
                                ({ rede, nome, imagem, href }) => (
                                    <a
                                        key={rede}
                                        className={`impressao-rede-link impressao-rede-${rede}`}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Abrir ${nome} da loja`}
                                        title={nome}
                                    >
                                        <span className="impressao-rede-imagem">
                                            <img
                                                src={imagem}
                                                alt=""
                                                loading="lazy"
                                            />
                                        </span>

                                        <span className="impressao-rede-nome">
                                            {nome}
                                        </span>

                                        <span
                                            className="impressao-rede-externa"
                                            aria-hidden="true"
                                        >
                                            ↗
                                        </span>
                                    </a>
                                )
                            )}
                        </nav>
                    )}
                </header>

                {/* CARTÃO PRINCIPAL */}
                <section className="impressao-cartao">
                    <div className="impressao-cartao-topo">
                        <div className="impressao-icone-principal">
                            <IconeImpressora />
                        </div>



                        <h1>
                            Seu documento,
                            <span> pronto para imprimir na {comercio.nome}.</span>
                        </h1>

                        <p className="impressao-descricao">
                            Envie seu documento de maneira simples e rápida.
                            Escolha o arquivo no seu dispositivo e envie para a loja.
                        </p>
                    </div>

                    {/* FORMULÁRIO */}
                    <form
                        className="impressao-formulario"
                        onSubmit={enviarArquivo}
                    >
                        <label
                            className={`impressao-seletor ${arquivo ? "tem-arquivo" : ""
                                } ${enviando ? "desativado" : ""}`}
                            htmlFor="impressao-arquivo"
                        >
                            <span className="impressao-upload-icone">
                                {arquivo
                                    ? <IconeArquivo />
                                    : <IconeUpload />}
                            </span>

                            <strong>
                                {arquivo
                                    ? "Arquivo selecionado"
                                    : "Escolha seu arquivo"}
                            </strong>

                            <span className="impressao-seletor-descricao">
                                {arquivo
                                    ? "Confira os dados antes de enviar"
                                    : "Toque aqui para procurar no celular ou computador"}
                            </span>

                            <span className="impressao-formatos">
                                PDF · Word · Excel · PowerPoint · Imagens
                            </span>

                            <span className="impressao-limite">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>

                                Até 25 MB por arquivo
                            </span>
                        </label>

                        <input
                            ref={inputRef}
                            id="impressao-arquivo"
                            className="impressao-input-arquivo"
                            type="file"
                            accept={FORMATOS_PERMITIDOS.join(",")}
                            onChange={selecionarArquivo}
                            disabled={enviando}
                        />

                        {/* DETALHES DO ARQUIVO */}
                        {arquivo && (
                            <div className="impressao-arquivo-selecionado">
                                <div className="impressao-arquivo-icone">
                                    <IconeArquivo />
                                </div>

                                <div className="impressao-arquivo-info">
                                    <strong title={arquivo.name}>
                                        {arquivo.name}
                                    </strong>

                                    <span>
                                        {formatarTamanho(arquivo.size)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="impressao-remover"
                                    onClick={removerArquivo}
                                    disabled={enviando}
                                    aria-label="Remover arquivo selecionado"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" />
                                    </svg>

                                    Remover
                                </button>
                            </div>
                        )}

                        {/* MENSAGENS DE SUCESSO E ERRO */}
                        {mensagem && (
                            <div
                                className={`impressao-mensagem ${tipoMensagem}`}
                                role={
                                    tipoMensagem === "erro"
                                        ? "alert"
                                        : "status"
                                }
                                aria-live="polite"
                            >
                                <span className="impressao-mensagem-icone">
                                    {tipoMensagem === "sucesso" ? "✓" : "!"}
                                </span>

                                <span>{mensagem}</span>
                            </div>
                        )}

                        {/* BOTÃO DE ENVIO */}
                        <button
                            className="impressao-botao-enviar"
                            type="submit"
                            disabled={
                                !arquivo ||
                                enviando ||
                                !idCriptografado
                            }
                        >
                            {enviando ? (
                                <>
                                    <span
                                        className="impressao-spinner"
                                        aria-hidden="true"
                                    />

                                    Enviando arquivo...
                                </>
                            ) : (
                                <>
                                    Enviar arquivo

                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M5 12h14m-6-6 6 6-6 6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>



                    {/* FORMATOS */}
                    <footer className="impressao-rodape">
                        <span>Formatos compatíveis</span>

                        <div aria-label="Formatos aceitos">
                            <span>PDF</span>
                            <span>DOCX</span>
                            <span>XLSX</span>
                            <span>PPTX</span>
                            <span>JPG</span>
                            <span>PNG</span>
                        </div>
                    </footer>
                </section>

                <p className="impressao-assinatura">
                    Uma experiência de envio simples e prática
                </p>
            </div>



            {/* INSTAGRAM FIXO NO CANTO INFERIOR DIREITO */}
            {instagramUrl && (
                <a
                    className="impressao-instagram-flutuante"
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visitar o Instagram da loja"
                    title="Visite nosso Instagram"
                >
                    <span
                        className="impressao-instagram-brilho"
                        aria-hidden="true"
                    />

                    <img
                        src={logoInstagram}
                        alt=""
                    />

                    <span className="impressao-instagram-texto">
                        Instagram
                    </span>
                </a>
            )}
            {/* BOTÃO FLUTUANTE DO SITE DA LOJA */}
            {dominioUrl && comercio.logo && (
                <a
                    className="impressao-dominio-flutuante"
                    href={dominioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar o site de ${comercio.nome}`}
                    title={`Visitar ${comercio.nome}`}
                >
                    <span className="impressao-dominio-logo-area">
                        <img
                            className="impressao-dominio-logo"
                            src={comercio.logo}
                            alt=""
                            onError={(evento) => {
                                evento.currentTarget.style.visibility = "hidden";
                            }}
                        />
                    </span>

                    <span
                        className="impressao-dominio-nome"
                        aria-hidden="true"
                    >
                        {letrasNomeLoja.map((letra, indice) => {
                            const direcoes = [
                                ["-24px", "-30px"],
                                ["25px", "22px"],
                                ["-20px", "28px"],
                                ["28px", "-25px"],
                                ["0px", "34px"],
                                ["-32px", "-12px"],
                                ["20px", "-32px"],
                            ];

                            const [x, y] = direcoes[indice % direcoes.length];

                            return (
                                <span
                                    key={`${letra}-${indice}`}
                                    className="impressao-dominio-letra"

                                    style={{
                                        "--dominio-x": x,
                                        "--dominio-y": y,

                                        // Entrada começa após 3 segundos.
                                        "--dominio-atraso": `${3 + indice * 0.075}s`,

                                        // Saída começa 10 segundos após a última letra
                                        // terminar de entrar.
                                        "--dominio-saida-letra": `${3 + (letrasNomeLoja.length - 1) * 0.075 + 0.55 + 10
                                            }s`,

                                        // Fecha o espaço depois que as letras saírem.
                                        "--dominio-saida": `${3 + (letrasNomeLoja.length - 1) * 0.075 + 0.55 + 10.45
                                            }s`,
                                    }}

                                >
                                    {letra === " " ? "\u00A0" : letra}
                                </span>
                            );
                        })}
                    </span>

                    <span
                        className="impressao-dominio-seta"
                        aria-hidden="true"
                    >
                        ↗
                    </span>
                </a>
            )}
        </main>
    );
}
