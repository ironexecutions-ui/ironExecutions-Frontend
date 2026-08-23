import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./formulariofiscal.css";

export default function FormularioFiscal({ tipo, produto, modo = "novo", onSalvo }) {

    const token = localStorage.getItem("token");
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");

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
       CARREGAR DADOS PARA EDIÇÃO
    =============================== */
    useEffect(() => {
        if (modo !== "editar") return;

        fetch(`${API_URL}/fiscal/dados/${produto.produto_id || produto.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(dados => {
                setForm({
                    ...dados,
                    produto_id: produto.produto_id || produto.id
                });
            });
    }, [modo, produto, token]);

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

        const url =
            modo === "editar"
                ? `${API_URL}/fiscal/atualizar/${produto.produto_id || produto.id}`
                : `${API_URL}/fiscal/registrar`;

        const method = modo === "editar" ? "PUT" : "POST";

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
                                                icms: Number(e.target.value)
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
                                                pis: Number(e.target.value)
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
                                                cofins: Number(e.target.value)
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

                        <div className="formulario-fiscal-campo-premium">

                            <label>
                                Código do serviço
                            </label>

                            <input
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


                        <div className="formulario-fiscal-campo-premium">

                            <label>
                                Alíquota ISS
                            </label>

                            <div className="formulario-fiscal-input-percentual-premium">

                                <input
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
                                            aliquota_iss: Number(e.target.value)
                                        })
                                    }
                                />

                                <span>%</span>

                            </div>

                            <small>
                                Percentual de ISS aplicado
                            </small>

                        </div>


                        <div className="formulario-fiscal-campo-premium">

                            <label>
                                Município
                            </label>

                            <input
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
