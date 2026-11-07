import React, { useEffect, useState } from "react";

import { API_URL } from "../../../../../config";

import "./cuponsfiscais.css";

export default function CuponsFiscais() {
    const [lista, setLista] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [filtroBusca, setFiltroBusca] = useState("");
    const [filtroData, setFiltroData] = useState("");

    const [chaveCopiada, setChaveCopiada] = useState("");

    const token = localStorage.getItem("token");

    // =====================================================
    // CARREGAR DOCUMENTOS FISCAIS
    // =====================================================

    useEffect(() => {
        async function carregarDocumentos() {
            try {
                setCarregando(true);

                const resposta = await fetch(
                    `${API_URL}/fiscal/notas`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {
                    console.error(
                        "Erro ao carregar documentos fiscais:",
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
                        "Resposta inesperada:",
                        dados
                    );

                    setLista([]);
                }

            } catch (erro) {
                console.error(
                    "Erro ao carregar documentos fiscais:",
                    erro
                );

                setLista([]);

            } finally {
                setCarregando(false);
            }
        }

        carregarDocumentos();

    }, [token]);

    // =====================================================
    // COPIAR CHAVE DE ACESSO
    // =====================================================

    async function copiarChave(chave, identificador) {
        if (!chave) {
            alert("Chave de acesso não encontrada.");
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(chave);
            } else {
                const campo = document.createElement("textarea");

                campo.value = chave;
                campo.style.position = "fixed";
                campo.style.opacity = "0";

                document.body.appendChild(campo);

                campo.select();

                const sucesso = document.execCommand("copy");

                document.body.removeChild(campo);

                if (!sucesso) {
                    throw new Error("Não foi possível copiar a chave.");
                }
            }

            setChaveCopiada(identificador);

            setTimeout(() => {
                setChaveCopiada("");
            }, 2000);

        } catch (erro) {
            console.error("Erro ao copiar chave:", erro);

            alert("Não foi possível copiar a chave de acesso.");
        }
    }

    // =====================================================
    // IMPRIMIR DOCUMENTO FISCAL
    // =====================================================

    async function imprimirDocumento(documento) {
        const modelo = String(documento.modelo);

        let endpoint = "";

        if (modelo === "55") {
            endpoint = `${API_URL}/fiscal/nfe/${documento.id}/danfe`;
        } else if (modelo === "65") {
            endpoint = `${API_URL}/fiscal/nfce/${documento.id}/danfe`;
        } else {
            alert("Modelo de documento fiscal não reconhecido.");
            return;
        }

        try {
            const resposta = await fetch(endpoint, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!resposta.ok) {
                let mensagem = "Não foi possível gerar o DANFE.";

                try {
                    const dados = await resposta.json();

                    mensagem =
                        dados.detail || mensagem;
                } catch {
                    const texto = await resposta.text();

                    if (texto) {
                        mensagem = texto;
                    }
                }

                console.error(
                    `Erro ao gerar DANFE modelo ${modelo}:`,
                    resposta.status,
                    mensagem
                );

                throw new Error(mensagem);
            }

            const blob = await resposta.blob();

            if (!blob.type.includes("pdf")) {
                throw new Error(
                    "O servidor não retornou um arquivo PDF válido."
                );
            }

            const url = URL.createObjectURL(blob);

            const janela = window.open(url, "_blank");

            if (!janela) {
                URL.revokeObjectURL(url);

                alert(
                    "O navegador bloqueou a janela de impressão. Permita pop-ups para este site."
                );

                return;
            }

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 60000);

        } catch (erro) {
            console.error(
                `Erro ao imprimir NF-e/NFC-e modelo ${modelo}:`,
                erro
            );

            alert(
                erro.message ||
                `Não foi possível gerar o DANFE da nota modelo ${modelo}.`
            );
        }
    }


    // =====================================================
    // FILTRAR DOCUMENTOS
    // =====================================================

    const listaFiltrada = lista.filter((documento) => {

        if (filtroBusca.trim()) {
            const busca = filtroBusca.trim().toLowerCase();

            const vendaId = String(
                documento.venda_id ?? ""
            ).toLowerCase();

            const chave = String(
                documento.chave_acesso ?? ""
            ).toLowerCase();

            const encontrou =
                vendaId.includes(busca) ||
                chave.includes(busca);

            if (!encontrou) {
                return false;
            }
        }

        if (filtroData) {
            if (!documento.criado_em) {
                return false;
            }

            const dataDocumento = String(
                documento.criado_em
            ).slice(0, 10);

            if (dataDocumento !== filtroData) {
                return false;
            }
        }

        return true;
    });

    // =====================================================
    // LIMPAR FILTROS
    // =====================================================

    function limparFiltros() {
        setFiltroBusca("");
        setFiltroData("");
    }

    // =====================================================
    // CARREGANDO
    // =====================================================

    if (carregando) {
        return (
            <div className="cupons-fiscais">
                <p className="cupons-fiscais-loading">
                    Carregando documentos fiscais...
                </p>
            </div>
        );
    }

    // =====================================================
    // RETURN
    // =====================================================

    return (
        <div className="cupons-fiscais">

            <h4>
                Documentos Fiscais
            </h4>

            {/* FILTROS */}

            <div className="cupons-fiscais-filtros-premium">

                <div className="cupons-fiscais-filtro-protocolo-premium">

                    <label>
                        Venda ou chave de acesso
                    </label>

                    <input
                        type="text"
                        placeholder="ID da venda ou chave..."
                        value={filtroBusca}
                        onChange={(e) =>
                            setFiltroBusca(e.target.value)
                        }
                    />

                </div>

                <div className="cupons-fiscais-filtro-data-premium">

                    <label>
                        Data
                    </label>

                    <input
                        type="date"
                        value={filtroData}
                        onChange={(e) =>
                            setFiltroData(e.target.value)
                        }
                    />

                </div>

                <button
                    type="button"
                    className="cupons-fiscais-limpar-premium"
                    onClick={limparFiltros}
                >
                    Limpar filtros
                </button>

            </div>

            {/* QUANTIDADE ENCONTRADA */}

            <div className="cupons-fiscais-resultado-premium">

                <span>
                    {listaFiltrada.length}
                </span>

                {listaFiltrada.length === 1
                    ? " documento encontrado"
                    : " documentos encontrados"
                }

            </div>

            {/* SEM RESULTADOS */}

            {listaFiltrada.length === 0 ? (

                <div className="cupons-fiscais-vazio-premium">

                    <p>
                        Nenhum documento fiscal encontrado com esses filtros.
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

                /* TABELA */

                <table>

                    <thead>

                        <tr>

                            <th>
                                Modelo
                            </th>

                            <th>
                                Venda
                            </th>

                            <th>
                                Chave de acesso
                            </th>

                            <th>
                                Status
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

                        {listaFiltrada.map((documento) => {

                            const identificador =
                                `${documento.modelo}-${documento.id}`;

                            return (
                                <tr key={identificador}>

                                    <td data-label="Modelo">

                                        <span
                                            className={
                                                documento.modelo === "55"
                                                    ? "cupons-fiscais-modelo-55"
                                                    : "cupons-fiscais-modelo-65"
                                            }
                                        >
                                            {documento.modelo}
                                        </span>

                                    </td>

                                    <td data-label="Venda">

                                        #{documento.venda_id}

                                    </td>

                                    <td data-label="Chave de acesso">

                                        <button
                                            type="button"
                                            className="cupons-fiscais-copiar-chave"
                                            onClick={() =>
                                                copiarChave(
                                                    documento.chave_acesso,
                                                    identificador
                                                )
                                            }
                                            title={documento.chave_acesso}
                                            disabled={!documento.chave_acesso}
                                        >
                                            {chaveCopiada === identificador ? (
                                                <>
                                                    <span>✓</span>
                                                    Copiado
                                                </>
                                            ) : (
                                                <>
                                                    <span>⧉</span>
                                                    Copiar chave
                                                </>
                                            )}
                                        </button>

                                    </td>

                                    <td
                                        data-label="Status"
                                        className={`status-${documento.status}`}
                                    >

                                        {documento.status}

                                    </td>

                                    <td data-label="Data">

                                        {documento.criado_em
                                            ? new Date(
                                                documento.criado_em
                                            ).toLocaleString("pt-BR")
                                            : "-"
                                        }

                                    </td>

                                    <td data-label="Ações">

                                        <button
                                            type="button"
                                            className="cupons-fiscais-imprimir-premium"
                                            onClick={() =>
                                                imprimirDocumento(documento)
                                            }
                                        >
                                            Imprimir
                                        </button>

                                    </td>

                                </tr>
                            );
                        })}

                    </tbody>

                </table>

            )}

        </div>
    );
}