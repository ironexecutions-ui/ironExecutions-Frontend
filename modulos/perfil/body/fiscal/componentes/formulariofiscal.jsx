import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./formulariofiscal.css";

export default function FormularioFiscal({
    tipo,
    produto,
    produtoPorPeso = false,
    modo = "novo",
    onSalvo,
    dadosIa = null
}) {
    const token = localStorage.getItem("token");
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [possuiCadastroFiscal, setPossuiCadastroFiscal] = useState(false);
    const [form, setForm] = useState({
        produto_id: produto.id,

        ncm: "",
        cfop: "",
        origem: "",
        cst_csosn: "",

        icms: "",
        pis: "",
        cofins: "",
        cest: "",

        cst_ibscbs: "",
        cclass_trib: "",
        aliquota_ibs_uf: "",
        aliquota_ibs_mun: "",
        aliquota_cbs: "",

        codigo_servico: "",
        aliquota_iss: "",
        municipio: ""
    });

    const [sugestoes, setSugestoes] = useState({
        cfop: [],
        cst_csosn: [],
        origem: [],
        cest: [],
        codigo_servico: [],
        municipio: []
    });

    const sufixo = produto.id;
    /* ===============================
       PREENCHER COM DADOS DA IA
    =============================== */

    useEffect(() => {

        if (!dadosIa) return;

        console.log(
            "[FormularioFiscal] Dados recebidos da IA:",
            dadosIa
        );

        setForm(anterior => {

            const atualizado = {
                ...anterior
            };

            // ===============================
            // PRODUTO
            // ===============================

            if (tipo === "produto") {

                if (dadosIa.ncm !== undefined) {
                    atualizado.ncm = dadosIa.ncm;
                }

                if (dadosIa.cfop !== undefined) {
                    atualizado.cfop = dadosIa.cfop;
                }

                if (dadosIa.origem !== undefined) {
                    atualizado.origem = dadosIa.origem;
                }

                if (dadosIa.cst_csosn !== undefined) {
                    atualizado.cst_csosn = dadosIa.cst_csosn;
                }

                if (dadosIa.icms !== undefined) {
                    atualizado.icms =
                        dadosIa.icms === ""
                            ? ""
                            : Number(dadosIa.icms);
                }

                if (dadosIa.pis !== undefined) {
                    atualizado.pis =
                        dadosIa.pis === ""
                            ? ""
                            : Number(dadosIa.pis);
                }

                if (dadosIa.cofins !== undefined) {
                    atualizado.cofins =
                        dadosIa.cofins === ""
                            ? ""
                            : Number(dadosIa.cofins);
                }

                if (dadosIa.cest !== undefined) {
                    atualizado.cest = dadosIa.cest;
                }

                // ===============================
                // IBS / CBS
                // ===============================

                if (dadosIa.cst_ibscbs !== undefined) {
                    atualizado.cst_ibscbs =
                        dadosIa.cst_ibscbs;
                }

                if (dadosIa.cclass_trib !== undefined) {
                    atualizado.cclass_trib =
                        dadosIa.cclass_trib;
                }

                if (dadosIa.aliquota_ibs_uf !== undefined) {
                    atualizado.aliquota_ibs_uf =
                        dadosIa.aliquota_ibs_uf === ""
                            ? ""
                            : Number(dadosIa.aliquota_ibs_uf);
                }

                if (dadosIa.aliquota_ibs_mun !== undefined) {
                    atualizado.aliquota_ibs_mun =
                        dadosIa.aliquota_ibs_mun === ""
                            ? ""
                            : Number(dadosIa.aliquota_ibs_mun);
                }

                if (dadosIa.aliquota_cbs !== undefined) {
                    atualizado.aliquota_cbs =
                        dadosIa.aliquota_cbs === ""
                            ? ""
                            : Number(dadosIa.aliquota_cbs);
                }
            }

            // ===============================
            // SERVIÇO
            // ===============================

            if (tipo === "servico") {

                if (dadosIa.codigo_servico !== undefined) {
                    atualizado.codigo_servico =
                        dadosIa.codigo_servico;
                }

                if (dadosIa.aliquota_iss !== undefined) {
                    atualizado.aliquota_iss =
                        dadosIa.aliquota_iss === ""
                            ? ""
                            : Number(dadosIa.aliquota_iss);
                }

                if (dadosIa.municipio !== undefined) {
                    atualizado.municipio =
                        dadosIa.municipio;
                }
            }

            console.log(
                "[FormularioFiscal] Formulário após IA:",
                atualizado
            );

            return atualizado;
        });

    }, [dadosIa, tipo]);
    /* ===============================
       CARREGAR DADOS PARA EDIÇÃO
    =============================== */
    useEffect(() => {

        const produtoId = produto.produto_id || produto.id;

        // Sempre limpa primeiro ao trocar de produto.
        // Isso evita mostrar por alguns milissegundos
        // os dados fiscais do produto anterior.
        setForm({
            produto_id: produtoId,

            ncm: "",
            cfop: "",
            origem: "",
            cst_csosn: "",

            icms: "",
            pis: "",
            cofins: "",
            cest: "",

            cst_ibscbs: "",
            cclass_trib: "",
            aliquota_ibs_uf: "",
            aliquota_ibs_mun: "",
            aliquota_cbs: "",

            codigo_servico: "",
            aliquota_iss: "",
            municipio: ""
        });

        async function carregarDadosFiscais() {

            try {

                const resp = await fetch(
                    `${API_URL}/fiscal/dados/${produtoId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // Produto ainda não possui cadastro fiscal.
                // Continua com o formulário vazio.
                if (resp.status === 404) {

                    console.log(
                        `[FormularioFiscal] Produto ${produtoId} ainda não possui cadastro fiscal.`
                    );

                    setPossuiCadastroFiscal(false);

                    return;
                }

                if (!resp.ok) {

                    let detalhe = "";

                    try {
                        const erro = await resp.json();
                        detalhe = erro.detail || "";
                    } catch {
                        // resposta sem JSON
                    }

                    throw new Error(
                        detalhe ||
                        `Erro ao carregar dados fiscais. HTTP ${resp.status}`
                    );
                }

                const dados = await resp.json();
                setPossuiCadastroFiscal(true);
                console.log(
                    "[FormularioFiscal] Dados fiscais existentes:",
                    dados
                );

                setForm(anterior => ({
                    ...anterior,
                    ...dados,
                    produto_id: produtoId,

                    ncm: dados.ncm ?? "",
                    cfop: dados.cfop ?? "",
                    origem: dados.origem ?? "",
                    cst_csosn: dados.cst_csosn ?? "",

                    icms: dados.icms ?? "",
                    pis: dados.pis ?? "",
                    cofins: dados.cofins ?? "",
                    cest: dados.cest ?? "",

                    cst_ibscbs: dados.cst_ibscbs ?? "",
                    cclass_trib: dados.cclass_trib ?? "",
                    aliquota_ibs_uf: dados.aliquota_ibs_uf ?? "",
                    aliquota_ibs_mun: dados.aliquota_ibs_mun ?? "",
                    aliquota_cbs: dados.aliquota_cbs ?? "",

                    codigo_servico: dados.codigo_servico ?? "",
                    aliquota_iss: dados.aliquota_iss ?? "",
                    municipio: dados.municipio ?? ""
                }));

            } catch (erro) {

                console.error(
                    "[FormularioFiscal] Erro ao carregar cadastro fiscal:",
                    erro
                );
            }
        }

        carregarDadosFiscais();

    }, [produto.id, produto.produto_id, token]);

    /* ===============================
       LISTAS PADRÃO (LEGAIS)
    =============================== */
    const CFOPS_PADRAO = ["5102", "5405", "6102", "6108"];

    const CST_CSOSN_PADRAO = [
        "101", "102", "103", "300", "400", "500", "900",
        "00", "20", "40", "41", "60", "90"
    ];

    const ORIGEM_PADRAO = [
        { valor: "0", label: "0 - Nacional" },
        { valor: "1", label: "1 - Importado direto" },
        { valor: "2", label: "2 - Importado mercado interno" }
    ];

    /* ===============================
       BUSCAR SUGESTÕES DO BANCO
    =============================== */
    useEffect(() => {
        const campos = [
            "cfop",
            "cst_csosn",
            "origem",
            "cest",
            "codigo_servico",
            "municipio"
        ];

        campos.forEach(campo => {
            fetch(`${API_URL}/fiscal/sugestoes/${campo}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(dados => {
                    setSugestoes(s => ({
                        ...s,
                        [campo]: dados.map(i => i[campo])
                    }));
                })
                .catch(() => { });
        });
    }, [token]);

    /* ===============================
       ENVIAR
    =============================== */
    async function enviar() {
        setSalvando(true);
        setMensagem("");

        const produtoId = produto.produto_id || produto.id;

        const deveAtualizar =
            modo === "editar" || possuiCadastroFiscal;

        const url = deveAtualizar
            ? `${API_URL}/fiscal/atualizar/${produtoId}`
            : `${API_URL}/fiscal/registrar`;

        const method = deveAtualizar
            ? "PUT"
            : "POST";

        const dadosLimpos = normalizarFormulario({
            ...form,
            tipo
        });

        try {
            const resp = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dadosLimpos)
            });

            const json = await resp.json();
            if (!resp.ok) throw new Error(json.detail);

            setMensagem("Dados fiscais salvos com sucesso");
            if (onSalvo) onSalvo();

        } catch (e) {
            setMensagem(e.message);
        } finally {
            setSalvando(false);
        }
    }


    function normalizarFormulario(form) {
        const copia = { ...form };

        Object.keys(copia).forEach(k => {
            if (copia[k] === "") {
                copia[k] = null;
            }
            if (Number.isNaN(copia[k])) {
                copia[k] = null;
            }
        });

        return copia;
    }
    function campoVazioIa(campo) {

        // Só destaca depois que a IA foi aplicada
        if (!dadosIa) {
            return false;
        }

        const valor = form[campo];

        return (
            valor === "" ||
            valor === null ||
            valor === undefined
        );
    }
    return (
        <div className="formulario-fiscal">

            {/* =====================================================
            CABEÇALHO
        ===================================================== */}

            <div className="formulario-fiscal-cabecalho-premium">

                <div className="formulario-fiscal-cabecalho-textos-premium">

                    <span className="formulario-fiscal-etiqueta-premium">
                        {tipo === "produto" ? "PRODUTO" : "SERVIÇO"}
                    </span>

                    <h5>
                        {produto.nome}
                    </h5>

                    <p>
                        Configure as informações fiscais utilizadas na emissão.
                    </p>

                </div>

            </div>


            {/* =====================================================
            PRODUTO
        ===================================================== */}

            {tipo === "produto" && (

                <>

                    {/* =================================================
                    CLASSIFICAÇÃO FISCAL
                ================================================= */}

                    <section className="formulario-fiscal-secao-premium">

                        <div className="formulario-fiscal-secao-titulo-premium">

                            <div>

                                <h6>Classificação fiscal</h6>

                                <p>
                                    Identificação e enquadramento fiscal do produto.
                                </p>

                            </div>

                        </div>


                        <div className="formulario-fiscal-grade-premium">

                            {/* NCM */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    NCM
                                </label>

                                <input
                                    className={
                                        campoVazioIa("ncm")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    placeholder="Ex: 22021000"
                                    value={form.ncm || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            ncm: e.target.value
                                        })
                                    }
                                />

                                <small>
                                    Nomenclatura Comum do Mercosul
                                </small>

                            </div>


                            {/* CFOP */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    CFOP
                                </label>

                                <input
                                    className={
                                        campoVazioIa("cfop")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    list={`cfop-${sufixo}`}
                                    placeholder="Ex: 5102"
                                    value={form.cfop || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            cfop: e.target.value
                                        })
                                    }
                                />

                                <small>
                                    Código fiscal da operação
                                </small>

                                <datalist id={`cfop-${sufixo}`}>

                                    {CFOPS_PADRAO.map((v) => (
                                        <option
                                            key={v}
                                            value={v}
                                        />
                                    ))}

                                    {sugestoes.cfop.map((v) => (
                                        <option
                                            key={v}
                                            value={v}
                                        />
                                    ))}

                                </datalist>

                            </div>


                            {/* ORIGEM */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    Origem
                                </label>

                                <input
                                    className={
                                        campoVazioIa("origem")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    list={`origem-${sufixo}`}
                                    placeholder="Selecione a origem"
                                    value={form.origem || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            origem: e.target.value
                                        })
                                    }
                                />

                                <small>
                                    Origem fiscal da mercadoria
                                </small>

                                <datalist id={`origem-${sufixo}`}>

                                    {ORIGEM_PADRAO.map((o) => (
                                        <option
                                            key={o.valor}
                                            value={o.valor}
                                            label={o.label}
                                        />
                                    ))}

                                    {sugestoes.origem.map((v) => (
                                        <option
                                            key={v}
                                            value={v}
                                        />
                                    ))}

                                </datalist>

                            </div>


                            {/* CST / CSOSN */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    CST / CSOSN
                                </label>

                                <input
                                    className={
                                        campoVazioIa("cst_csosn")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    list={`cst-${sufixo}`}
                                    placeholder="Ex: 102"
                                    value={form.cst_csosn || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            cst_csosn: e.target.value
                                        })
                                    }
                                />

                                <small>
                                    Situação tributária do produto
                                </small>

                                <datalist id={`cst-${sufixo}`}>

                                    {CST_CSOSN_PADRAO.map((v) => (
                                        <option
                                            key={v}
                                            value={v}
                                        />
                                    ))}

                                    {sugestoes.cst_csosn.map((v) => (
                                        <option
                                            key={v}
                                            value={v}
                                        />
                                    ))}

                                </datalist>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                    TRIBUTAÇÃO
                ================================================= */}

                    <section className="formulario-fiscal-secao-premium">

                        <div className="formulario-fiscal-secao-titulo-premium">

                            <div>

                                <h6>Tributação</h6>

                                <p>
                                    Alíquotas utilizadas para este produto.
                                </p>

                            </div>

                        </div>


                        <div className="formulario-fiscal-grade-premium formulario-fiscal-grade-impostos-premium">

                            {/* ICMS */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    ICMS
                                </label>

                                <div className="formulario-fiscal-input-percentual-premium">

                                    <input
                                        className={
                                            campoVazioIa("icms")
                                                ? "formulario-fiscal-input-ia-vazio"
                                                : ""
                                        }
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={
                                            form.icms === 0
                                                ? 0
                                                : form.icms || ""
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                icms:
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                            })
                                        }
                                    />

                                    <span>%</span>

                                </div>

                                <small>
                                    Imposto sobre circulação
                                </small>

                            </div>


                            {/* PIS */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    PIS
                                </label>

                                <div className="formulario-fiscal-input-percentual-premium">

                                    <input
                                        className={
                                            campoVazioIa("pis")
                                                ? "formulario-fiscal-input-ia-vazio"
                                                : ""
                                        }
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={
                                            form.pis === 0
                                                ? 0
                                                : form.pis || ""
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                pis:
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                            })
                                        }
                                    />

                                    <span>%</span>

                                </div>

                                <small>
                                    Alíquota de PIS
                                </small>

                            </div>


                            {/* COFINS */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    COFINS
                                </label>

                                <div className="formulario-fiscal-input-percentual-premium">

                                    <input
                                        className={
                                            campoVazioIa("cofins")
                                                ? "formulario-fiscal-input-ia-vazio"
                                                : ""
                                        }
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={
                                            form.cofins === 0
                                                ? 0
                                                : form.cofins || ""
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                cofins:
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                            })
                                        }
                                    />

                                    <span>%</span>

                                </div>

                                <small>
                                    Alíquota de COFINS
                                </small>

                            </div>


                            {/* CEST */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    CEST
                                </label>

                                <input
                                    className={
                                        campoVazioIa("cest")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    list={`cest-${sufixo}`}
                                    placeholder="Quando aplicável"
                                    value={form.cest || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            cest: e.target.value
                                        })
                                    }
                                />

                                <small>
                                    Código de substituição tributária
                                </small>

                                <datalist id={`cest-${sufixo}`}>

                                    {sugestoes.cest.map((v) => (
                                        <option
                                            key={v}
                                            value={v}
                                        />
                                    ))}

                                </datalist>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                    IBS / CBS
                ================================================= */}

                    <section
                        className={`formulario-fiscal-secao-premium formulario-fiscal-secao-ibscbs-premium ${produtoPorPeso
                            ? "formulario-fiscal-secao-ibscbs-peso-premium"
                            : "formulario-fiscal-secao-ibscbs-produto-premium"
                            }`}
                    >

                        <div className="formulario-fiscal-secao-titulo-premium">

                            <div>

                                <h6>Tributação IBS / CBS</h6>

                                <p>
                                    {produtoPorPeso
                                        ? "Configure a tributação IBS/CBS deste produto vendido por peso."
                                        : "Configure a tributação IBS/CBS aplicável a este produto."
                                    }
                                </p>

                            </div>

                        </div>


                        {produtoPorPeso && (

                            <div className="formulario-fiscal-aviso-peso-ibscbs-premium">

                                <strong>
                                    Produto vendido por peso
                                </strong>

                                <span>
                                    {produto.nome}
                                </span>

                            </div>

                        )}


                        <div className="formulario-fiscal-grade-premium">

                            {/* CST IBS/CBS */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    CST IBS/CBS
                                </label>

                                <input
                                    className={
                                        campoVazioIa("cst_ibscbs")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ex: 200"
                                    value={form.cst_ibscbs || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            cst_ibscbs: e.target.value
                                        })
                                    }
                                />

                                <small>
                                    Código de situação tributária do IBS/CBS
                                </small>

                            </div>


                            {/* CLASSIFICAÇÃO TRIBUTÁRIA */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    cClassTrib
                                </label>

                                <input
                                    className={
                                        campoVazioIa("cclass_trib")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ex: 200014"
                                    value={form.cclass_trib || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            cclass_trib: e.target.value
                                        })
                                    }
                                />

                                <small>
                                    Código de classificação tributária
                                </small>

                            </div>


                            {/* IBS ESTADUAL */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    Alíquota IBS UF
                                </label>

                                <div className="formulario-fiscal-input-percentual-premium">

                                    <input
                                        className={
                                            campoVazioIa("aliquota_ibs_uf")
                                                ? "formulario-fiscal-input-ia-vazio"
                                                : ""
                                        }
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={
                                            form.aliquota_ibs_uf === 0
                                                ? 0
                                                : form.aliquota_ibs_uf || ""
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                aliquota_ibs_uf:
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                            })
                                        }
                                    />

                                    <span>%</span>

                                </div>

                                <small>
                                    Alíquota estadual do IBS
                                </small>

                            </div>


                            {/* IBS MUNICIPAL */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    Alíquota IBS Município
                                </label>

                                <div className="formulario-fiscal-input-percentual-premium">

                                    <input
                                        className={
                                            campoVazioIa("aliquota_ibs_mun")
                                                ? "formulario-fiscal-input-ia-vazio"
                                                : ""
                                        }
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={
                                            form.aliquota_ibs_mun === 0
                                                ? 0
                                                : form.aliquota_ibs_mun || ""
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                aliquota_ibs_mun:
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                            })
                                        }
                                    />

                                    <span>%</span>

                                </div>

                                <small>
                                    Alíquota municipal do IBS
                                </small>

                            </div>


                            {/* CBS */}

                            <div className="formulario-fiscal-campo-premium">

                                <label>
                                    Alíquota CBS
                                </label>

                                <div className="formulario-fiscal-input-percentual-premium">

                                    <input
                                        className={
                                            campoVazioIa("aliquota_cbs")
                                                ? "formulario-fiscal-input-ia-vazio"
                                                : ""
                                        }
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={
                                            form.aliquota_cbs === 0
                                                ? 0
                                                : form.aliquota_cbs || ""
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                aliquota_cbs:
                                                    e.target.value === ""
                                                        ? ""
                                                        : Number(e.target.value)
                                            })
                                        }
                                    />

                                    <span>%</span>

                                </div>

                                <small>
                                    Alíquota da CBS
                                </small>

                            </div>

                        </div>

                    </section>

                </>

            )}


            {/* =====================================================
            SERVIÇO
        ===================================================== */}

            {tipo === "servico" && (

                <section className="formulario-fiscal-secao-premium">

                    <div className="formulario-fiscal-secao-titulo-premium">

                        <div>

                            <h6>Tributação do serviço</h6>

                            <p>
                                Configure os dados fiscais necessários para o serviço.
                            </p>

                        </div>

                    </div>


                    <div className="formulario-fiscal-grade-premium">

                        {/* CÓDIGO SERVIÇO */}

                        <div className="formulario-fiscal-campo-premium">

                            <label>
                                Código do serviço
                            </label>

                            <input
                                className={
                                    campoVazioIa("codigo_servico")
                                        ? "formulario-fiscal-input-ia-vazio"
                                        : ""
                                }
                                list={`codigo_servico-${sufixo}`}
                                placeholder="Código LC 116"
                                value={form.codigo_servico || ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        codigo_servico: e.target.value
                                    })
                                }
                            />

                            <small>
                                Código correspondente na LC 116
                            </small>

                            <datalist id={`codigo_servico-${sufixo}`}>

                                {sugestoes.codigo_servico.map((v) => (
                                    <option
                                        key={v}
                                        value={v}
                                    />
                                ))}

                            </datalist>

                        </div>


                        {/* ISS */}

                        <div className="formulario-fiscal-campo-premium">

                            <label>
                                Alíquota ISS
                            </label>

                            <div className="formulario-fiscal-input-percentual-premium">

                                <input
                                    className={
                                        campoVazioIa("aliquota_iss")
                                            ? "formulario-fiscal-input-ia-vazio"
                                            : ""
                                    }
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={
                                        form.aliquota_iss === 0
                                            ? 0
                                            : form.aliquota_iss || ""
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            aliquota_iss:
                                                e.target.value === ""
                                                    ? ""
                                                    : Number(e.target.value)
                                        })
                                    }
                                />

                                <span>%</span>

                            </div>

                            <small>
                                Percentual de ISS aplicado
                            </small>

                        </div>


                        {/* MUNICÍPIO */}

                        <div className="formulario-fiscal-campo-premium">

                            <label>
                                Município
                            </label>

                            <input
                                className={
                                    campoVazioIa("municipio")
                                        ? "formulario-fiscal-input-ia-vazio"
                                        : ""
                                }
                                list={`municipio-${sufixo}`}
                                placeholder="Município da tributação"
                                value={form.municipio || ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        municipio: e.target.value
                                    })
                                }
                            />

                            <small>
                                Município de incidência do ISS
                            </small>

                            <datalist id={`municipio-${sufixo}`}>

                                {sugestoes.municipio.map((v) => (
                                    <option
                                        key={v}
                                        value={v}
                                    />
                                ))}

                            </datalist>

                        </div>

                    </div>

                </section>

            )}


            {/* =====================================================
            MENSAGEM
        ===================================================== */}

            {mensagem && (

                <div className="formulario-fiscal-mensagem">
                    {mensagem}
                </div>

            )}


            {/* =====================================================
            RODAPÉ
        ===================================================== */}

            <div className="formulario-fiscal-acoes-premium">

                <div className="formulario-fiscal-aviso-premium">

                    <strong>Importante</strong>

                    <span>
                        Confira os dados tributários antes de salvar.
                    </span>

                </div>


                <button
                    type="button"
                    className="formulario-fiscal-salvar-premium"
                    onClick={enviar}
                    disabled={salvando}
                >
                    {salvando
                        ? "Salvando..."
                        : modo === "editar"
                            ? "Salvar alterações"
                            : "Salvar dados fiscais"
                    }
                </button>

            </div>

        </div>
    );
}
