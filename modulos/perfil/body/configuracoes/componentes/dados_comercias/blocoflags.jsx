import React, { useEffect, useState } from "react";

import { URL } from "../../../url";

import "./blocoflags.css";

export default function BlocoFlags({ dados, podeEditar, salvar }) {

    const [converteLocal, setConverteLocal] = useState(
        Number(dados?.converte || 0)
    );

    const [cambioLocal, setCambioLocal] = useState(
        Number(dados?.cambio || 0)
    );

    const [promocoesLocal, setPromocoesLocal] = useState(
        Number(dados?.promocoes || 0)
    );

    /*
    =========================================================
    SINCRONIZAR DADOS RECEBIDOS
    =========================================================
    */

    useEffect(() => {

        setConverteLocal(
            Number(dados?.converte || 0)
        );

        setCambioLocal(
            Number(dados?.cambio || 0)
        );

        setPromocoesLocal(
            Number(dados?.promocoes || 0)
        );

    }, [
        dados?.converte,
        dados?.cambio,
        dados?.promocoes
    ]);

    /*
    =========================================================
    ATUALIZAR CÂMBIO
    =========================================================
    */

    async function atualizarCambio(novoConverte, novoCambio) {

        try {

            const token = localStorage.getItem("token");

            const resposta = await fetch(
                `${URL}/comercio/cambio`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        converte: novoConverte,
                        cambio: novoCambio
                    })
                }
            );

            if (!resposta.ok) {

                const erro = await resposta.json().catch(() => null);

                console.log(
                    "Erro ao atualizar câmbio:",
                    erro
                );

                return;
            }

            console.log(
                "[CONFIGURAÇÕES] Câmbio atualizado:",
                {
                    converte: novoConverte,
                    cambio: novoCambio
                }
            );

        } catch (e) {

            console.log(
                "Erro ao atualizar câmbio",
                e
            );

        }

    }

    /*
    =========================================================
    ATUALIZAR PROMOÇÕES
    =========================================================
    */

    async function atualizarPromocoes(novoValor) {

        try {

            const token = localStorage.getItem("token");

            const resposta = await fetch(
                `${URL}/comercio/promocoes`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        promocoes: novoValor
                    })
                }
            );

            if (!resposta.ok) {

                const erro = await resposta.json().catch(() => null);

                console.log(
                    "Erro ao atualizar promoções:",
                    erro
                );

                return false;
            }

            console.log(
                "[CONFIGURAÇÕES] Promoções atualizadas:",
                novoValor
            );

            return true;

        } catch (e) {

            console.log(
                "Erro ao atualizar promoções",
                e
            );

            return false;

        }

    }

    /*
    =========================================================
    ALTERAR PROMOÇÕES
    =========================================================
    */

    async function handlePromocoesChange(e) {

        const valorAnterior = promocoesLocal;

        const novoValor = Number(
            e.target.value
        );

        setPromocoesLocal(novoValor);

        const sucesso = await atualizarPromocoes(
            novoValor
        );

        if (!sucesso) {

            setPromocoesLocal(
                valorAnterior
            );

        }

    }

    return (

        <div className="bf-container">

            <h2 className="bf-titulo">
                Configurações internas
            </h2>

            <div className="bf-lista">

                {/* ================= PROMOÇÕES ================= */}

                <div className="bf-item">

                    <label className="bf-label">
                        Disponibilizar promoções
                    </label>

                    <br />

                    <select
                        className="bf-select bf-select-promocoes"
                        disabled={!podeEditar}
                        value={promocoesLocal}
                        onChange={handlePromocoesChange}
                    >

                        <option value={0}>
                            Não
                        </option>

                        <option value={1}>
                            Sim
                        </option>

                    </select>

                </div>

                {/* ================= CONVERSÃO ================= */}

                <div className="bf-item">

                    <label className="bf-label">
                        Permitir conversão de moeda
                    </label>

                    <br />

                    <select
                        className="bf-select bf-select-conversao"
                        disabled={!podeEditar}
                        value={converteLocal}
                        onChange={e => {

                            const valor = Number(
                                e.target.value
                            );

                            setConverteLocal(valor);

                            atualizarCambio(
                                valor,
                                cambioLocal
                            );

                        }}
                    >

                        <option value={0}>
                            Não
                        </option>

                        <option value={1}>
                            Sim
                        </option>

                    </select>

                </div>

                {/* ================= VALOR DO CÂMBIO ================= */}

                {converteLocal === 1 && (

                    <div className="bf-item">

                        <label className="bf-label">
                            Valor do câmbio
                        </label>

                        <br />

                        <input
                            type="number"
                            step="0.01"
                            className="bf-select bf-input-cambio"
                            disabled={!podeEditar}
                            value={cambioLocal}
                            onChange={e => {

                                const valor = Number(
                                    e.target.value
                                );

                                setCambioLocal(valor);

                                atualizarCambio(
                                    converteLocal,
                                    valor
                                );

                            }}
                        />

                    </div>

                )}

                {/* ================= EDITAR PREÇOS ================= */}

                <div className="bf-item">

                    <label className="bf-label">
                        Permitir funcionários editarem preços
                    </label>

                    <br />

                    <select
                        className="bf-select bf-select-editar-preco"
                        disabled={!podeEditar}
                        value={dados.editar_preco}
                        onChange={e =>
                            salvar(
                                "editar_preco",
                                Number(e.target.value)
                            )
                        }
                    >

                        <option value={0}>
                            Não
                        </option>

                        <option value={1}>
                            Sim
                        </option>

                    </select>

                </div>

                {/* ================= COMANDA ================= */}

                <div className="bf-item">

                    <label className="bf-label">
                        Impressão automática da comanda
                    </label>

                    <br />

                    <select
                        className="bf-select bf-select-comanda"
                        disabled={!podeEditar}
                        value={dados.node}
                        onChange={e =>
                            salvar(
                                "node",
                                Number(e.target.value)
                            )
                        }
                    >

                        <option value={0}>
                            Inativo
                        </option>

                        <option value={1}>
                            Ativo
                        </option>

                    </select>

                </div>

                {/* ================= MAQUININHA ================= */}

                <div className="bf-item">

                    <label className="bf-label">
                        Conectar maquininha automaticamente
                    </label>

                    <br />

                    <select
                        className="bf-select bf-select-maquininha"
                        disabled={!podeEditar}
                        value={dados.api}
                        onChange={e =>
                            salvar(
                                "api",
                                Number(e.target.value)
                            )
                        }
                    >

                        <option value={0}>
                            Não
                        </option>

                        <option value={1}>
                            Sim
                        </option>

                    </select>

                </div>

            </div>

        </div>

    );

}