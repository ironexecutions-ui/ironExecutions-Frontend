import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./frete.css";

const API_PREFIX = "/ironstore/frete-avulso";

const FORM_INICIAL = {
    origem: {
        nome: "",
        email: "",
        telefone: "",
        cpf_cnpj: "",
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "SP",
    },
    destino: {
        nome: "",
        email: "",
        telefone: "",
        cpf_cnpj: "",
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "SP",
    },
    volume: {
        peso: "1",
        altura: "10",
        largura: "15",
        comprimento: "20",
        valor_declarado: "1.00",
    },
    documento: {
        tipo_documento: "dce",
        chave_documento: "",
        inscricao_estadual: "",
        cnae: "",
    },
};

function obterToken(tokenProp) {
    if (tokenProp) return tokenProp;
    try {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("token_cliente") ||
            ""
        );
    } catch {
        return "";
    }
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function mensagemErro(data, fallback) {
    const detalhe = data?.detail;
    if (typeof detalhe === "string") return detalhe;
    if (detalhe?.mensagem) return detalhe.mensagem;
    if (detalhe) return JSON.stringify(detalhe);
    return data?.mensagem || fallback;
}

function limparCep(valor) {
    return String(valor || "").replace(/\D/g, "").slice(0, 8);
}

export default function Frete({ apiBaseUrl, token: tokenProp }) {
    const [form, setForm] = useState(FORM_INICIAL);
    const [opcoes, setOpcoes] = useState([]);
    const [servicoSelecionado, setServicoSelecionado] = useState(null);
    const [pagamento, setPagamento] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [carregandoCotacao, setCarregandoCotacao] = useState(false);
    const [criandoPagamento, setCriandoPagamento] = useState(false);
    const [consultando, setConsultando] = useState(false);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");

    const baseUrl = useMemo(
        () => String(apiBaseUrl ?? import.meta.env.VITE_API_URL ?? "").replace(/\/$/, ""),
        [apiBaseUrl]
    );

    const requisicao = useCallback(
        async (caminho, opcoes = {}) => {
            const token = obterToken(tokenProp);
            const headers = {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(opcoes.headers || {}),
            };
            const resposta = await fetch(`${baseUrl}${API_PREFIX}${caminho}`, {
                ...opcoes,
                headers,
            });
            let data = {};
            try {
                data = await resposta.json();
            } catch {
                data = {};
            }
            if (!resposta.ok) {
                throw new Error(mensagemErro(data, "Não foi possível concluir a solicitação."));
            }
            return data;
        },
        [baseUrl, tokenProp]
    );

    const atualizarCampo = (grupo, campo, valor) => {
        setForm((atual) => ({
            ...atual,
            [grupo]: {
                ...atual[grupo],
                [campo]: campo === "cep" ? limparCep(valor) : valor,
            },
        }));
    };

    const validarFormulario = () => {
        const obrigatoriosEndereco = [
            ["nome", "nome"],
            ["email", "e-mail"],
            ["telefone", "telefone"],
            ["cpf_cnpj", "CPF/CNPJ"],
            ["cep", "CEP"],
            ["rua", "rua/avenida"],
            ["numero", "número"],
            ["bairro", "bairro"],
            ["cidade", "cidade"],
            ["estado", "UF"],
        ];
        for (const grupo of ["origem", "destino"]) {
            for (const [campo, rotulo] of obrigatoriosEndereco) {
                if (!String(form[grupo][campo] || "").trim()) {
                    return `Preencha ${rotulo} do ${grupo === "origem" ? "remetente" : "destinatário"}.`;
                }
            }
            if (limparCep(form[grupo].cep).length !== 8) {
                return `O CEP do ${grupo === "origem" ? "remetente" : "destinatário"} deve ter 8 dígitos.`;
            }
            const documento = String(form[grupo].cpf_cnpj || "").replace(/\D/g, "");
            if (![11, 14].includes(documento.length)) {
                return `Informe um CPF ou CNPJ válido para o ${grupo === "origem" ? "remetente" : "destinatário"}.`;
            }
        }
        const peso = Number(form.volume.peso);
        const altura = Number(form.volume.altura);
        const largura = Number(form.volume.largura);
        const comprimento = Number(form.volume.comprimento);
        const declarado = Number(String(form.volume.valor_declarado).replace(",", "."));
        if (![peso, altura, largura, comprimento, declarado].every(Number.isFinite)) {
            return "Revise peso, dimensões e valor declarado.";
        }
        if (peso <= 0 || altura <= 0 || largura <= 0 || comprimento <= 0 || declarado <= 0) {
            return "Peso, dimensões e valor declarado precisam ser maiores que zero.";
        }
        if (form.documento.tipo_documento === "nota_fiscal" && form.documento.chave_documento.replace(/\D/g, "").length !== 44) {
            return "A chave da Nota Fiscal deve conter 44 dígitos.";
        }
        return "";
    };

    const montarPayload = () => ({
        origem: {
            ...form.origem,
            cep: limparCep(form.origem.cep),
            cpf_cnpj: form.origem.cpf_cnpj.replace(/\D/g, ""),
        },
        destino: {
            ...form.destino,
            cep: limparCep(form.destino.cep),
            cpf_cnpj: form.destino.cpf_cnpj.replace(/\D/g, ""),
        },
        volume: {
            peso: Number(form.volume.peso),
            altura: Number(form.volume.altura),
            largura: Number(form.volume.largura),
            comprimento: Number(form.volume.comprimento),
            valor_declarado: Number(String(form.volume.valor_declarado).replace(",", ".")),
        },
        documento: {
            ...form.documento,
            chave_documento: form.documento.chave_documento.replace(/\D/g, ""),
        },
    });

    const calcularFrete = async (evento) => {
        evento.preventDefault();
        setErro("");
        setAviso("");
        setPagamento(null);
        setResultado(null);
        setServicoSelecionado(null);
        const validacao = validarFormulario();
        if (validacao) {
            setErro(validacao);
            return;
        }
        setCarregandoCotacao(true);
        try {
            const data = await requisicao("/cotacao", {
                method: "POST",
                body: JSON.stringify(montarPayload()),
            });
            setOpcoes(Array.isArray(data.opcoes) ? data.opcoes : []);
            if (!data.opcoes?.length) setAviso("O Melhor Envio não retornou serviços para esse trajeto e volume.");
        } catch (e) {
            setErro(e.message || "Falha ao calcular o frete.");
        } finally {
            setCarregandoCotacao(false);
        }
    };

    const criarPagamento = async () => {
        if (!servicoSelecionado) {
            setErro("Selecione uma modalidade de entrega primeiro.");
            return;
        }
        setErro("");
        setAviso("");
        setCriandoPagamento(true);
        try {
            const data = await requisicao("/pix", {
                method: "POST",
                body: JSON.stringify({
                    ...montarPayload(),
                    servico_id: String(servicoSelecionado.id),
                }),
            });
            setPagamento(data);
            setOpcoes([]);
            setAviso("PIX criado. Assim que o Mercado Pago confirmar o pagamento, o sistema tentará gerar a etiqueta automaticamente.");
        } catch (e) {
            setErro(e.message || "Não foi possível criar o PIX.");
        } finally {
            setCriandoPagamento(false);
        }
    };

    const consultarPagamento = useCallback(async () => {
        const freteId = pagamento?.frete_id;
        if (!freteId || resultado?.etiqueta_url) return;
        setConsultando(true);
        try {
            const data = await requisicao(`/pagamento/${freteId}/status`, { method: "GET" });
            setResultado(data);
            if (data.status_pagamento === "approved" && !data.etiqueta_url) {
                setAviso(data.mensagem || "Pagamento confirmado. A etiqueta está sendo processada.");
            } else if (data.etiqueta_url) {
                setAviso("Pagamento confirmado e etiqueta pronta.");
            } else {
                setAviso("Aguardando confirmação do pagamento pelo Mercado Pago.");
            }
        } catch (e) {
            setErro(e.message || "Não foi possível consultar o pagamento.");
        } finally {
            setConsultando(false);
        }
    }, [pagamento?.frete_id, resultado?.etiqueta_url, requisicao]);

    useEffect(() => {
        if (!pagamento?.frete_id || resultado?.etiqueta_url) return undefined;
        const timer = window.setInterval(() => {
            consultarPagamento();
        }, 5000);
        consultarPagamento();
        return () => window.clearInterval(timer);
    }, [pagamento?.frete_id, resultado?.etiqueta_url, consultarPagamento]);

    const copiarPix = async () => {
        const codigo = pagamento?.qr_code;
        if (!codigo) return;
        try {
            await navigator.clipboard.writeText(codigo);
            setAviso("Código PIX copiado.");
        } catch {
            setErro("Não foi possível copiar automaticamente. Selecione e copie o código PIX manualmente.");
        }
    };

    const reiniciar = () => {
        setOpcoes([]);
        setServicoSelecionado(null);
        setPagamento(null);
        setResultado(null);
        setErro("");
        setAviso("");
    };

    const renderEndereco = (grupo, titulo) => (
        <section className="isfa-card" key={grupo}>
            <div className="isfa-card__heading">
                <span className="isfa-card__step">{grupo === "origem" ? "01" : "02"}</span>
                <div>
                    <h2>{titulo}</h2>
                    <p>{grupo === "origem" ? "Endereço de coleta / remetente" : "Endereço de entrega / destinatário"}</p>
                </div>
            </div>
            <div className="isfa-grid">
                <label className="isfa-field isfa-field--wide">
                    <span>Nome completo / empresa *</span>
                    <input value={form[grupo].nome} onChange={(e) => atualizarCampo(grupo, "nome", e.target.value)} autoComplete="name" required />
                </label>
                <label className="isfa-field">
                    <span>E-mail *</span>
                    <input type="email" value={form[grupo].email} onChange={(e) => atualizarCampo(grupo, "email", e.target.value)} autoComplete="email" required />
                </label>
                <label className="isfa-field">
                    <span>Telefone *</span>
                    <input value={form[grupo].telefone} onChange={(e) => atualizarCampo(grupo, "telefone", e.target.value)} autoComplete="tel" required />
                </label>
                <label className="isfa-field isfa-field--wide">
                    <span>CPF/CNPJ *</span>
                    <input value={form[grupo].cpf_cnpj} onChange={(e) => atualizarCampo(grupo, "cpf_cnpj", e.target.value)} required />
                </label>
                <label className="isfa-field">
                    <span>CEP *</span>
                    <input inputMode="numeric" maxLength={8} value={form[grupo].cep} onChange={(e) => atualizarCampo(grupo, "cep", e.target.value)} placeholder="Somente números" required />
                </label>
                <label className="isfa-field isfa-field--wide">
                    <span>Rua / avenida *</span>
                    <input value={form[grupo].rua} onChange={(e) => atualizarCampo(grupo, "rua", e.target.value)} required />
                </label>
                <label className="isfa-field">
                    <span>Número *</span>
                    <input value={form[grupo].numero} onChange={(e) => atualizarCampo(grupo, "numero", e.target.value)} required />
                </label>
                <label className="isfa-field">
                    <span>Complemento</span>
                    <input value={form[grupo].complemento} onChange={(e) => atualizarCampo(grupo, "complemento", e.target.value)} />
                </label>
                <label className="isfa-field">
                    <span>Bairro *</span>
                    <input value={form[grupo].bairro} onChange={(e) => atualizarCampo(grupo, "bairro", e.target.value)} required />
                </label>
                <label className="isfa-field">
                    <span>Cidade *</span>
                    <input value={form[grupo].cidade} onChange={(e) => atualizarCampo(grupo, "cidade", e.target.value)} required />
                </label>
                <label className="isfa-field isfa-field--small">
                    <span>UF *</span>
                    <input maxLength={2} value={form[grupo].estado} onChange={(e) => atualizarCampo(grupo, "estado", e.target.value.toUpperCase())} required />
                </label>
            </div>
        </section>
    );

    return (
        <main className="isfa-shell">
            <header className="isfa-hero">
                <div className="isfa-hero__icon" aria-hidden="true">↗</div>
                <div>
                    <span className="isfa-eyebrow">IRONSTORE · LOGÍSTICA</span>
                    <h1>Frete avulso</h1>
                    <p>Calcule uma entrega, escolha o serviço e pague somente o frete.</p>
                </div>
                <div className="isfa-hero__tag">Envio independente</div>
            </header>

            {erro && <div className="isfa-alert isfa-alert--error" role="alert"><strong>Não foi possível continuar</strong><span>{erro}</span></div>}
            {aviso && <div className="isfa-alert isfa-alert--info" role="status"><span>{aviso}</span></div>}

            {!pagamento && (
                <form onSubmit={calcularFrete} className="isfa-form">
                    <div className="isfa-section-title">
                        <span>INFORMAÇÕES DO ENVIO</span>
                        <p>Preencha os dados de origem e destino exatamente como devem constar na etiqueta.</p>
                    </div>
                    <div className="isfa-address-grid">
                        {renderEndereco("origem", "Origem")}
                        {renderEndereco("destino", "Destino")}
                    </div>

                    <section className="isfa-card">
                        <div className="isfa-card__heading">
                            <span className="isfa-card__step">03</span>
                            <div><h2>Dimensões do pacote</h2><p>Medidas em centímetros e peso em quilogramas.</p></div>
                        </div>
                        <div className="isfa-grid isfa-grid--volume">
                            <label className="isfa-field"><span>Peso (kg) *</span><input type="number" min="0.01" step="0.001" value={form.volume.peso} onChange={(e) => setForm((f) => ({ ...f, volume: { ...f.volume, peso: e.target.value } }))} required /></label>
                            <label className="isfa-field"><span>Altura (cm) *</span><input type="number" min="1" step="0.1" value={form.volume.altura} onChange={(e) => setForm((f) => ({ ...f, volume: { ...f.volume, altura: e.target.value } }))} required /></label>
                            <label className="isfa-field"><span>Largura (cm) *</span><input type="number" min="1" step="0.1" value={form.volume.largura} onChange={(e) => setForm((f) => ({ ...f, volume: { ...f.volume, largura: e.target.value } }))} required /></label>
                            <label className="isfa-field"><span>Comprimento (cm) *</span><input type="number" min="1" step="0.1" value={form.volume.comprimento} onChange={(e) => setForm((f) => ({ ...f, volume: { ...f.volume, comprimento: e.target.value } }))} required /></label>
                            <label className="isfa-field"><span>Valor declarado (R$) *</span><input type="number" min="0.01" step="0.01" value={form.volume.valor_declarado} onChange={(e) => setForm((f) => ({ ...f, volume: { ...f.volume, valor_declarado: e.target.value } }))} required /><small>Usado como valor do conteúdo para o envio.</small></label>
                        </div>
                    </section>

                    <section className="isfa-card">
                        <div className="isfa-card__heading">
                            <span className="isfa-card__step">04</span>
                            <div><h2>Documento de envio</h2><p>Defina o documento que será associado à etiqueta.</p></div>
                        </div>
                        <div className="isfa-grid">
                            <label className="isfa-field">
                                <span>Tipo de documento *</span>
                                <select value={form.documento.tipo_documento} onChange={(e) => setForm((f) => ({ ...f, documento: { ...f.documento, tipo_documento: e.target.value } }))}>
                                    <option value="dce">Declaração de conteúdo (DC-e)</option>
                                    <option value="nota_fiscal">Nota Fiscal</option>
                                </select>
                            </label>
                            {form.documento.tipo_documento === "nota_fiscal" && <label className="isfa-field isfa-field--wide"><span>Chave da Nota Fiscal (44 dígitos) *</span><input maxLength={44} value={form.documento.chave_documento} onChange={(e) => setForm((f) => ({ ...f, documento: { ...f.documento, chave_documento: e.target.value.replace(/\D/g, "") } }))} required /></label>}
                            <label className="isfa-field"><span>Inscrição Estadual (se aplicável)</span><input value={form.documento.inscricao_estadual} onChange={(e) => setForm((f) => ({ ...f, documento: { ...f.documento, inscricao_estadual: e.target.value } }))} /></label>
                            <label className="isfa-field"><span>CNAE (se aplicável)</span><input value={form.documento.cnae} onChange={(e) => setForm((f) => ({ ...f, documento: { ...f.documento, cnae: e.target.value } }))} /></label>
                        </div>
                    </section>

                    <div className="isfa-actions">
                        <button className="isfa-button isfa-button--primary" type="submit" disabled={carregandoCotacao}>
                            {carregandoCotacao ? <><span className="isfa-spinner" /> Calculando opções…</> : "Calcular opções de frete"}
                        </button>
                    </div>
                </form>
            )}

            {opcoes.length > 0 && !pagamento && (
                <section className="isfa-card isfa-options">
                    <div className="isfa-card__heading"><span className="isfa-card__step">05</span><div><h2>Escolha a entrega</h2><p>Os valores foram retornados pelo Melhor Envio.</p></div></div>
                    <div className="isfa-option-list">
                        {opcoes.map((opcao) => {
                            const id = String(opcao.id);
                            const selecionada = String(servicoSelecionado?.id) === id;
                            return (
                                <button type="button" key={id} className={`isfa-option ${selecionada ? "isfa-option--selected" : ""}`} onClick={() => setServicoSelecionado(opcao)}>
                                    <span className="isfa-option__radio">{selecionada ? "✓" : ""}</span>
                                    <span className="isfa-option__main"><strong>{opcao.transportadora || opcao.company || "Transportadora"}</strong><span>{opcao.servico || opcao.nome || "Serviço de entrega"}</span><small>{opcao.prazo_dias ? `${opcao.prazo_dias} dia(s) útil(eis)` : "Prazo informado pelo transportador"}</small></span>
                                    <strong className="isfa-option__price">{formatarMoeda(opcao.valor_frete)}</strong>
                                </button>
                            );
                        })}
                    </div>
                    <div className="isfa-actions isfa-actions--split">
                        <button type="button" className="isfa-button isfa-button--secondary" onClick={() => setOpcoes([])}>Voltar aos dados</button>
                        <button type="button" className="isfa-button isfa-button--primary" onClick={criarPagamento} disabled={!servicoSelecionado || criandoPagamento}>
                            {criandoPagamento ? <><span className="isfa-spinner" /> Criando PIX…</> : `Pagar ${servicoSelecionado ? formatarMoeda(servicoSelecionado.valor_frete) : "frete"} com PIX`}
                        </button>
                    </div>
                </section>
            )}

            {pagamento && (
                <section className="isfa-card isfa-payment">
                    <div className="isfa-card__heading"><span className="isfa-card__step">06</span><div><h2>Pagamento do frete</h2><p>Use o QR Code ou copie o código PIX abaixo.</p></div></div>
                    <div className="isfa-payment__amount">{formatarMoeda(pagamento.valor_frete)}<span>Somente o frete avulso</span></div>
                    {pagamento.qr_code_base64 && <div className="isfa-qr"><img alt="QR Code PIX para pagamento do frete" src={`data:image/png;base64,${pagamento.qr_code_base64}`} /></div>}
                    {pagamento.qr_code && <div className="isfa-pix-code"><textarea readOnly value={pagamento.qr_code} aria-label="Código PIX copia e cola" /><button type="button" className="isfa-button isfa-button--secondary" onClick={copiarPix}>Copiar código PIX</button></div>}
                    <div className="isfa-payment__status">
                        <span className={`isfa-status-dot ${resultado?.status_pagamento === "approved" ? "isfa-status-dot--ok" : ""}`} />
                        <strong>{resultado?.status_pagamento === "approved" ? "Pagamento confirmado" : consultando ? "Consultando pagamento…" : "Aguardando pagamento"}</strong>
                        <p>{resultado?.etiqueta_url ? "Sua etiqueta e documento estão prontos." : resultado?.status_pagamento === "approved" ? "Pagamento aprovado. O sistema está finalizando a etiqueta no Melhor Envio." : "Esta tela consulta automaticamente o status do pagamento."}</p>
                    </div>
                    {resultado?.etiqueta_url && <a className="isfa-button isfa-button--primary isfa-download" href={resultado.etiqueta_url} target="_blank" rel="noreferrer">Abrir etiqueta / documento</a>}
                    {resultado?.status_pagamento === "approved" && !resultado?.etiqueta_url && <button type="button" className="isfa-button isfa-button--secondary" onClick={consultarPagamento} disabled={consultando}>{consultando ? "Verificando…" : "Tentar finalizar etiqueta novamente"}</button>}
                    <button type="button" className="isfa-text-button" onClick={reiniciar}>Iniciar outro frete avulso</button>
                </section>
            )}

            <footer className="isfa-footer">IronStore · Frete avulso independente das vendas do PDV.</footer>
        </main>
    );
}
