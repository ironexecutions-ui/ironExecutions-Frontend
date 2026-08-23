import React, { useEffect, useState } from "react";

import { API_URL } from "../../../../../config";

import "./cuponsfiscais.css";

export default function CuponsFiscais() {

    const [lista, setLista] = useState([]);

    const [carregando, setCarregando] = useState(true);

    /* =====================================================
       FILTROS
    ===================================================== */

    const [filtroProtocolo, setFiltroProtocolo] = useState("");

    const [filtroData, setFiltroData] = useState("");

    const [filtroValorMin, setFiltroValorMin] = useState("");

    const [filtroValorMax, setFiltroValorMax] = useState("");

    const token = localStorage.getItem("token");


    /* =====================================================
       CARREGAR CUPONS FISCAIS
    ===================================================== */

    useEffect(() => {

        async function carregarCupons() {

            try {

                setCarregando(true);

                const resposta = await fetch(
                    `${API_URL}/fiscal/nfce`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {

                    console.error(
                        "Erro ao carregar cupons fiscais:",
                        resposta.status,
                        dados
                    );

                    setLista([]);

                    return;
                }

                if (Array.isArray(dados)) {

                    setLista(dados);

                } else {

                    console.error(
                        "Resposta inesperada ao carregar cupons:",
                        dados
                    );

                    setLista([]);
                }

            } catch (erro) {

                console.error(
                    "Erro ao carregar cupons fiscais:",
                    erro
                );

                setLista([]);

            } finally {

                setCarregando(false);
            }
        }

        carregarCupons();

    }, [token]);


    /* =====================================================
       IMPRIMIR DANFE
    ===================================================== */

    async function imprimirDanfe(id) {

        try {

            const resposta = await fetch(
                `${API_URL}/fiscal/nfce/${id}/danfe`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {

                const texto = await resposta.text();

                console.error(
                    "Erro ao buscar DANFE:",
                    resposta.status,
                    texto
                );

                throw new Error(
                    `Erro ${resposta.status} ao gerar DANFE`
                );
            }

            const blob = await resposta.blob();

            const url = URL.createObjectURL(blob);

            window.open(
                url,
                "_blank"
            );

            setTimeout(() => {

                URL.revokeObjectURL(url);

            }, 60000);

        } catch (erro) {

            console.error(
                "Erro ao imprimir DANFE:",
                erro
            );

            alert(
                "Não foi possível gerar o DANFE da NFC-e."
            );
        }
    }


    /* =====================================================
       DESCOBRIR VALOR DO CUPOM
    ===================================================== */

    function obterValorCupom(n) {

        const valor =
            n.valor_total ??
            n.valor_pago ??
            n.valor ??
            0;

        const numero = Number(valor);

        if (Number.isNaN(numero)) {

            return 0;
        }

        return numero;
    }


    /* =====================================================
       FILTRAR CUPONS
    ===================================================== */

    const listaFiltrada = lista.filter((n) => {

        /* =================================================
           PROTOCOLO / ID / NÚMERO NFC-e
        ================================================= */

        if (filtroProtocolo.trim()) {

            const busca = filtroProtocolo
                .trim()
                .toLowerCase();

            const id = String(
                n.id ?? ""
            ).toLowerCase();

            const protocolo = String(
                n.protocolo ??
                n.protocolo_autorizacao ??
                n.n_protocolo ??
                ""
            ).toLowerCase();

            const numeroNfce = String(
                n.numero_nfce ?? ""
            ).toLowerCase();

            const encontrou =
                id.includes(busca) ||
                protocolo.includes(busca) ||
                numeroNfce.includes(busca);

            if (!encontrou) {

                return false;
            }
        }


        /* =================================================
           DATA
        ================================================= */

        if (filtroData) {

            if (!n.criado_em) {

                return false;
            }

            const dataCupom = String(
                n.criado_em
            ).slice(0, 10);

            if (dataCupom !== filtroData) {

                return false;
            }
        }


        /* =================================================
           VALOR
        ================================================= */

        const valorCupom = obterValorCupom(n);


        /* =================================================
           VALOR MÍNIMO
        ================================================= */

        if (
            filtroValorMin !== "" &&
            valorCupom < Number(filtroValorMin)
        ) {

            return false;
        }


        /* =================================================
           VALOR MÁXIMO
        ================================================= */

        if (
            filtroValorMax !== "" &&
            valorCupom > Number(filtroValorMax)
        ) {

            return false;
        }


        return true;
    });


    /* =====================================================
       LIMPAR FILTROS
    ===================================================== */

    function limparFiltros() {

        setFiltroProtocolo("");

        setFiltroData("");

        setFiltroValorMin("");

        setFiltroValorMax("");
    }


    /* =====================================================
       CARREGANDO
    ===================================================== */

    if (carregando) {

        return (

            <div className="cupons-fiscais">

                <p className="cupons-fiscais-loading">

                    Carregando cupons fiscais...

                </p>

            </div>
        );
    }


    /* =====================================================
       RETURN
    ===================================================== */

    return (

        <div className="cupons-fiscais">

            <h4>
                Cupons Fiscais (NFC-e)
            </h4>


            {/* =================================================
                FILTROS
            ================================================= */}

            <div className="cupons-fiscais-filtros-premium">


                {/* PROTOCOLO / ID */}

                <div className="cupons-fiscais-filtro-protocolo-premium">

                    <label>
                        Protocolo / ID
                    </label>

                    <input
                        type="text"
                        placeholder="ID, protocolo ou número..."
                        value={filtroProtocolo}
                        onChange={(e) =>
                            setFiltroProtocolo(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* DATA */}

                <div className="cupons-fiscais-filtro-data-premium">

                    <label>
                        Data
                    </label>

                    <input
                        type="date"
                        value={filtroData}
                        onChange={(e) =>
                            setFiltroData(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* VALOR MÍNIMO */}

                <div className="cupons-fiscais-filtro-valor-premium">

                    <label>
                        Valor mínimo
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="R$ 0,00"
                        value={filtroValorMin}
                        onChange={(e) =>
                            setFiltroValorMin(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* VALOR MÁXIMO */}

                <div className="cupons-fiscais-filtro-valor-premium">

                    <label>
                        Valor máximo
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="R$ 0,00"
                        value={filtroValorMax}
                        onChange={(e) =>
                            setFiltroValorMax(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* LIMPAR */}

                <button
                    type="button"
                    className="cupons-fiscais-limpar-premium"
                    onClick={limparFiltros}
                >
                    Limpar filtros
                </button>

            </div>


            {/* =================================================
                QUANTIDADE ENCONTRADA
            ================================================= */}

            <div className="cupons-fiscais-resultado-premium">

                <span>
                    {listaFiltrada.length}
                </span>

                {listaFiltrada.length === 1
                    ? " cupom encontrado"
                    : " cupons encontrados"
                }

            </div>


            {/* =================================================
                SEM RESULTADOS
            ================================================= */}

            {listaFiltrada.length === 0 ? (

                <div className="cupons-fiscais-vazio-premium">

                    <p>
                        Nenhum cupom fiscal encontrado com esses filtros.
                    </p>

                    <button
                        type="button"
                        className="cupons-fiscais-limpar-vazio-premium"
                        onClick={limparFiltros}
                    >
                        Limpar filtros
                    </button>

                </div>

            ) : (

                /* =================================================
                   TABELA
                ================================================= */

                <table>

                    <thead>

                        <tr>

                            <th>
                                Número
                            </th>

                            <th>
                                Série
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Ambiente
                            </th>

                            <th>
                                Data
                            </th>

                            <th>
                                Ações
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {listaFiltrada.map((n) => (

                            <tr key={n.id}>

                                <td data-label="Número">

                                    {n.numero_nfce}

                                </td>


                                <td data-label="Série">

                                    {n.serie}

                                </td>


                                <td
                                    data-label="Status"
                                    className={`status-${n.status}`}
                                >

                                    {n.status}

                                </td>


                                <td data-label="Ambiente">

                                    {n.ambiente}

                                </td>


                                <td data-label="Data">

                                    {n.criado_em
                                        ? new Date(
                                            n.criado_em
                                        ).toLocaleString(
                                            "pt-BR"
                                        )
                                        : "-"
                                    }

                                </td>


                                <td data-label="Ações">

                                    <button
                                        type="button"
                                        className="cupons-fiscais-imprimir-premium"
                                        onClick={() =>
                                            imprimirDanfe(n.id)
                                        }
                                    >
                                        Imprimir
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>
    );
}