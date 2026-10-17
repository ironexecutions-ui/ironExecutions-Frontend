import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { API_URL } from "../../../../../config";
import "./indicacao.css";

export default function Indicacao() {
    const [empresa, setEmpresa] = useState(null);
    const [comercioId, setComercioId] = useState(null);
    const [linkIndicacao, setLinkIndicacao] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            try {
                setCarregando(true);
                setErro("");

                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Sua sessão expirou. Entre novamente.");
                }

                const respostaUsuario = await fetch(
                    `${API_URL}/clientes/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!respostaUsuario.ok) {
                    throw new Error(
                        respostaUsuario.status === 401 ||
                            respostaUsuario.status === 403
                            ? "Sua sessão expirou. Entre novamente."
                            : "Não foi possível identificar sua conta."
                    );
                }

                const usuario = await respostaUsuario.json();
                const id = usuario.comercio_id;

                if (id === null || id === undefined || id === "") {
                    throw new Error(
                        "Sua conta não possui um comércio vinculado."
                    );
                }

                const respostaEmpresa = await fetch(
                    `${API_URL}/comercios/${encodeURIComponent(id)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!respostaEmpresa.ok) {
                    throw new Error(
                        "Não foi possível carregar os dados da empresa."
                    );
                }

                const dadosEmpresa = await respostaEmpresa.json();

                const nomeEmpresa =
                    dadosEmpresa.loja ||
                    dadosEmpresa.nome_empresa ||
                    dadosEmpresa.nome ||
                    "Minha empresa";

                const link = `https://ironexecutions.com.br/indicacao/${encodeURIComponent(id)}`;

                const imagemQR = await QRCode.toDataURL(link, {
                    width: 600,
                    margin: 3,
                    errorCorrectionLevel: "H",
                    color: {
                        dark: "#14264D",
                        light: "#FFFFFF",
                    },
                });

                if (!ativo) return;

                setComercioId(id);
                setEmpresa({
                    nome: nomeEmpresa,
                    imagem: dadosEmpresa.imagem || "",
                });
                setLinkIndicacao(link);
                setQrCode(imagemQR);
            } catch (error) {
                if (ativo) {
                    setErro(
                        error.message ||
                        "Ocorreu um erro ao preparar sua indicação."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarDados();

        return () => {
            ativo = false;
        };
    }, []);

    async function copiarLink() {
        if (!linkIndicacao) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(linkIndicacao);
            } else {
                const campo = document.createElement("textarea");
                campo.value = linkIndicacao;
                campo.setAttribute("readonly", "");
                campo.style.position = "fixed";
                campo.style.left = "-9999px";

                document.body.appendChild(campo);
                campo.select();

                const sucesso = document.execCommand("copy");
                campo.remove();

                if (!sucesso) {
                    throw new Error("Falha ao copiar");
                }
            }

            setCopiado(true);
            window.setTimeout(() => setCopiado(false), 2500);
        } catch {
            setErro(
                "Não foi possível copiar automaticamente. Selecione o link e copie manualmente."
            );
        }
    }

    async function compartilharLink() {
        if (!linkIndicacao) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Indicação de ${empresa?.nome || "uma empresa"}`,
                    text: `Conheça a Iron Executions através da indicação de ${empresa?.nome || "nossa empresa"}.`,
                    url: linkIndicacao,
                });
            } else {
                await copiarLink();
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                setErro("Não foi possível compartilhar o link.");
            }
        }
    }

    function baixarQRCode() {
        if (!qrCode || comercioId === null) return;

        const elemento = document.createElement("a");
        elemento.href = qrCode;
        elemento.download = `indicacao-${comercioId}.png`;
        document.body.appendChild(elemento);
        elemento.click();
        elemento.remove();
    }

    if (carregando) {
        return (
            <section className="ie-indicacao-page">
                <div className="ie-indicacao-loading">
                    <div className="ie-indicacao-spinner" />
                    <h3>Preparando sua central de indicações</h3>
                    <p>Carregando os dados da sua empresa...</p>
                </div>
            </section>
        );
    }

    if (erro && !linkIndicacao) {
        return (
            <section className="ie-indicacao-page">
                <div className="ie-indicacao-error-card">
                    <div className="ie-indicacao-error-icon">!</div>
                    <h3>Não foi possível carregar sua indicação</h3>
                    <p>{erro}</p>
                    <button
                        type="button"
                        className="ie-indicacao-primary-button"
                        onClick={() => window.location.reload()}
                    >
                        Tentar novamente
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="ie-indicacao-page">
            <header className="ie-indicacao-hero">
                <div className="ie-indicacao-hero-content">
                    <span className="ie-indicacao-eyebrow">
                        CENTRAL DE PARCERIAS
                    </span>

                    <div className="ie-indicacao-company">
                        {empresa?.imagem ? (
                            <img
                                src={empresa.imagem}
                                alt={`Logo de ${empresa.nome}`}
                                className="ie-indicacao-company-logo"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="ie-indicacao-company-initial">
                                {(empresa?.nome || "E")
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}

                        <div className="ie-indicacao-company-info">
                            <span>Indicações de</span>
                            <h2>{empresa?.nome}</h2>
                        </div>
                    </div>

                    <h1>Transforme conexões em oportunidades.</h1>

                    <p>
                        Compartilhe seu link exclusivo, apresente a Iron
                        Executions a outras empresas e amplie sua rede de
                        contatos.
                    </p>
                </div>

                <div className="ie-indicacao-hero-decoration" aria-hidden="true">
                    <svg viewBox="0 0 100 100">
                        <path d="M50 5 90 27v46L50 95 10 73V27L50 5Z" />
                        <path d="M38 60 48 35h10l-6 15h14L43 72l5-12H38Z" />
                    </svg>
                </div>
            </header>

            {erro && (
                <div className="ie-indicacao-inline-error" role="alert">
                    <span>{erro}</span>
                    <button
                        type="button"
                        onClick={() => setErro("")}
                        aria-label="Fechar aviso"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="ie-indicacao-company-strip">
                <div className="ie-indicacao-strip-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4" />
                    </svg>
                </div>

                <div className="ie-indicacao-strip-info">
                    <span>Empresa vinculada à indicação</span>
                    <strong>{empresa?.nome}</strong>
                </div>

                <div className="ie-indicacao-active-status">
                    <span />
                    Link gerado
                </div>
            </div>

            <div className="ie-indicacao-grid">
                <article className="ie-indicacao-card ie-indicacao-link-card">
                    <div className="ie-indicacao-card-header">
                        <div>
                            <span className="ie-indicacao-section-label">
                                01 · LINK PERSONALIZADO
                            </span>
                            <h3>Seu link de indicação</h3>
                        </div>

                        <div className="ie-indicacao-card-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.72" />
                                <path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.72-1.72" />
                            </svg>
                        </div>
                    </div>

                    <p className="ie-indicacao-description">
                        O endereço abaixo identifica as indicações vinculadas
                        à sua empresa.
                    </p>

                    <label
                        className="ie-indicacao-field-label"
                        htmlFor="ie-link-indicacao"
                    >
                        Endereço exclusivo
                    </label>

                    <div className="ie-indicacao-input-group">
                        <input
                            id="ie-link-indicacao"
                            type="text"
                            value={linkIndicacao}
                            readOnly
                            onFocus={(event) => event.target.select()}
                        />

                        <button
                            type="button"
                            onClick={copiarLink}
                            className={`ie-indicacao-copy-button ${copiado ? "ie-indicacao-is-copied" : ""
                                }`}
                        >
                            {copiado ? "Copiado!" : "Copiar link"}
                        </button>
                    </div>

                    <div className="ie-indicacao-tip">
                        <span className="ie-indicacao-tip-dot" />
                        <span>
                            O link já contém o identificador da sua empresa.
                        </span>
                    </div>



                    <button
                        type="button"
                        onClick={compartilharLink}
                        className="ie-indicacao-primary-button"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" />
                        </svg>
                        Compartilhar indicação
                    </button>
                </article>

                <article className="ie-indicacao-card ie-indicacao-qr-card">
                    <div className="ie-indicacao-card-header">
                        <div>
                            <span className="ie-indicacao-section-label">
                                02 · QR CODE
                            </span>
                            <h3>Acesso por leitura</h3>
                        </div>

                        <div className="ie-indicacao-card-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1" />
                            </svg>
                        </div>
                    </div>

                    <p className="ie-indicacao-description">
                        Use seu código em materiais promocionais, mensagens,
                        cartões ou apresentações comerciais.
                    </p>

                    <div className="ie-indicacao-qr-panel">
                        <div className="ie-indicacao-qr-brand">
                            {empresa?.imagem ? (
                                <img
                                    src={empresa.imagem}
                                    alt=""
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <span>
                                    {(empresa?.nome || "E")
                                        .trim()
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            )}

                            <div>
                                <strong>{empresa?.nome}</strong>
                                <small>LINK DE INDICAÇÃO</small>
                            </div>
                        </div>

                        <div className="ie-indicacao-qr-image">
                            <img
                                src={qrCode}
                                alt={`QR Code de indicação de ${empresa?.nome}`}
                            />
                        </div>

                        <div className="ie-indicacao-qr-caption">
                            <strong>Escaneie para conhecer</strong>
                            <span>Iron Executions</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={baixarQRCode}
                        className="ie-indicacao-download-button"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="m7 10 5 5 5-5M12 15V3" />
                        </svg>
                        Baixar QR Code em PNG
                    </button>

                    <span className="ie-indicacao-download-note">
                        PNG em alta resolução, pronto para compartilhar.
                    </span>
                </article>
            </div>

            <footer className="ie-indicacao-footer">
                <div className="ie-indicacao-footer-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                </div>

                <div>
                    <strong>Identificação da indicação</strong>
                    <p>
                        Seu link está associado à empresa {empresa?.nome} e ao
                        comércio #{comercioId}. Compartilhe o endereço completo
                        para preservar esse identificador.
                    </p>
                </div>
            </footer>
        </section>
    );
}