import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../../../../config";

import "./emitirnfce.css";

export default function EmitirNfce() {

    const [vendas, setVendas] = useState([]);

    const [vendasComNfce, setVendasComNfce] = useState(new Set());

    const [carregando, setCarregando] = useState(true);

    const [emitindoVendaId, setEmitindoVendaId] = useState(null);

    const token = localStorage.getItem("token");

    const [dataFiltro, setDataFiltro] = useState("");

    const [horaMinima, setHoraMinima] = useState("");
    const [protocoloFiltroNfce, setProtocoloFiltroNfce] = useState("");
    const [valorFiltroNfce, setValorFiltroNfce] = useState("");
    const [quantidadeVisivelNfce, setQuantidadeVisivelNfce] = useState(5);    /*
     * =====================================================
     * ALERTA PERSONALIZADO NFC-e
     * =====================================================
     */

    const [alertaNfce, setAlertaNfce] = useState(null);

    useEffect(() => {

        carregar();

    }, []);
    useEffect(() => {

        setQuantidadeVisivelNfce(5);

    }, [
        dataFiltro,
        protocoloFiltroNfce,
        valorFiltroNfce
    ]);
    async function carregar() {

        setCarregando(true);

        try {

            const resposta = await fetch(
                `${API_URL}/vendas/nfce-pendentes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            console.log(
                "[NFC-e] RESPOSTA:",
                dados
            );

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    dados.erro ||
                    "Erro ao carregar vendas pendentes"
                );

            }

            if (Array.isArray(dados)) {

                setVendas(dados);

            } else {

                setVendas([]);

            }

        } catch (erro) {

            console.error(
                "[NFC-e] Erro ao carregar:",
                erro
            );

            setVendas([]);

        } finally {

            setCarregando(false);

        }
    }

    /*
     * =====================================================
     * SOLICITAR EMISSÃO
     * =====================================================
     */

    function solicitarEmissao(vendaId) {

        /*
         * Impede duas emissões simultâneas.
         */

        if (emitindoVendaId !== null) {

            return;

        }

        /*
         * =====================================================
         * VERIFICAR NOVAMENTE SE A VENDA JÁ POSSUI NFC-e
         * =====================================================
         */

        if (
            vendasComNfce.has(
                Number(vendaId)
            )
        ) {

            setAlertaNfce({
                tipo: "aviso",
                titulo: "NFC-e já emitida",
                mensagem: "Esta venda já possui uma NFC-e emitida.",
                vendaId: null
            });

            return;

        }

        /*
         * =====================================================
         * ABRIR CONFIRMAÇÃO PERSONALIZADA
         * =====================================================
         */

        setAlertaNfce({
            tipo: "confirmacao",
            titulo: "Emitir NFC-e",
            mensagem: `Confirma a emissão da NFC-e referente à venda #${vendaId}?`,
            vendaId: vendaId
        });
    }

    /*
     * =====================================================
     * EMITIR NFC-e
     * =====================================================
     */

    async function emitir(vendaId) {

        /*
         * Impede duas emissões simultâneas.
         */

        if (emitindoVendaId !== null) {

            return;

        }

        /*
         * =====================================================
         * VERIFICAR NOVAMENTE SE A VENDA JÁ POSSUI NFC-e
         * =====================================================
         */

        if (
            vendasComNfce.has(
                Number(vendaId)
            )
        ) {

            setAlertaNfce({
                tipo: "aviso",
                titulo: "NFC-e já emitida",
                mensagem: "Esta venda já possui uma NFC-e emitida.",
                vendaId: null
            });

            return;

        }

        /*
         * =====================================================
         * DESABILITAR IMEDIATAMENTE
         * =====================================================
         */

        setEmitindoVendaId(vendaId);

        /*
         * =====================================================
         * MODAL DE PROCESSAMENTO
         * =====================================================
         */

        setAlertaNfce({
            tipo: "processando",
            titulo: "Emitindo NFC-e",
            mensagem: "Comunicando com a SEFAZ. Aguarde a conclusão da emissão.",
            vendaId: vendaId
        });

        try {

            const resposta = await fetch(
                `${API_URL}/vendas/${vendaId}/emitir-nfce`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                await resposta.json();

            /*
             * =====================================================
             * ERRO HTTP
             * =====================================================
             */

            if (!resposta.ok) {

                // ============================================================
                // PRODUTOS SEM CADASTRO FISCAL
                // ============================================================
                const detalheEstruturado =
                    data?.detail &&
                        typeof data.detail === "object"
                        ? data.detail
                        : null;

                const codigoErro =
                    detalheEstruturado?.codigo ??
                    data?.codigo ??
                    null;

                const produtosErro =
                    Array.isArray(detalheEstruturado?.produtos)
                        ? detalheEstruturado.produtos
                        : Array.isArray(data?.produtos)
                            ? data.produtos
                            : [];

                const mensagemErro =
                    detalheEstruturado?.mensagem ??
                    (
                        typeof data?.detail === "string"
                            ? data.detail
                            : null
                    ) ??
                    data?.erro ??
                    data?.mensagem ??
                    "";

                const detalheErro =
                    String(mensagemErro || "");

                const matchProdutoSemFiscal =
                    detalheErro.match(
                        /Produto\s+(\d+)\s+sem dados fiscais cadastrados/i
                    );

                if (
                    (
                        codigoErro === "PRODUTOS_SEM_DADOS_FISCAIS" &&
                        produtosErro.length > 0
                    ) ||
                    matchProdutoSemFiscal
                ) {

                    let produtosSemFiscal = [];

                    if (produtosErro.length > 0) {

                        produtosSemFiscal =
                            produtosErro.map(produto => ({

                                produto_id:
                                    produto.produto_id ??
                                    produto.id,

                                id:
                                    produto.produto_id ??
                                    produto.id,

                                nome:
                                    produto.nome ??
                                    `Produto ${produto.produto_id ??
                                    produto.id
                                    }`
                            }));

                    } else if (matchProdutoSemFiscal) {

                        const produtoId =
                            Number(matchProdutoSemFiscal[1]);

                        produtosSemFiscal = [
                            {
                                produto_id: produtoId,
                                id: produtoId,
                                nome: `Produto ${produtoId}`
                            }
                        ];
                    }
                    // Salva temporariamente quais produtos precisam
                    // ser cadastrados na tela Fiscal em Massa.
                    sessionStorage.setItem(
                        "fiscal_massa_produtos_pendentes",
                        JSON.stringify(produtosSemFiscal)
                    );

                    // Também guardamos a venda que originou o problema.
                    // Depois podemos usar isso para voltar e tentar emitir
                    // exatamente a mesma NFC-e.
                    sessionStorage.setItem(
                        "fiscal_massa_venda_pendente",
                        String(vendaId)
                    );

                    setAlertaNfce({
                        tipo: "fiscal_pendente",
                        titulo: "Produtos sem dados fiscais",
                        mensagem:
                            produtosSemFiscal.length === 1
                                ? `${produtosSemFiscal[0].nome} precisa do cadastro fiscal antes da emissão.`
                                : `${produtosSemFiscal.length} produtos precisam do cadastro fiscal antes da emissão.`,
                        vendaId,
                        produtos: produtosSemFiscal
                    });

                    return;
                }

                // ============================================================
                // DEMAIS ERROS
                // ============================================================

                throw new Error(
                    mensagemErro ||
                    "Erro desconhecido ao emitir NFC-e"
                );
            }

            /*
             * =====================================================
             * SUCESSO
             * =====================================================
             */

            setAlertaNfce({
                tipo: "sucesso",
                titulo: "NFC-e emitida com sucesso",
                mensagem:
                    data.mensagem ||
                    `A NFC-e do protocolo #${vendaId} foi emitida e registrada com sucesso.`,
                vendaId: vendaId
            });

            /*
             * =====================================================
             * RECARREGAR
             *
             * Isso consulta novamente:
             *
             * /fiscal/nfce
             *
             * e encontra o novo venda_id.
             * =====================================================
             */

            await carregar();

        } catch (erro) {

            console.error(
                "[NFC-e] Erro ao emitir NFC-e:",
                erro
            );

            setAlertaNfce({
                tipo: "erro",
                titulo: "Falha na emissão da NFC-e",
                mensagem:
                    erro.message ||
                    "Ocorreu um erro inesperado durante a emissão.",
                vendaId: vendaId
            });

        } finally {

            setEmitindoVendaId(null);

        }
    }

    /*
     * =====================================================
     * FECHAR ALERTA
     * =====================================================
     */

    function fecharAlertaNfce() {

        /*
         * Não permite fechar enquanto estiver processando.
         */

        if (
            alertaNfce?.tipo === "processando"
        ) {

            return;

        }

        setAlertaNfce(null);
    }

    /*
     * =====================================================
     * CONFIRMAR EMISSÃO PELO MODAL
     * =====================================================
     */

    function confirmarEmissaoNfce() {

        if (
            !alertaNfce?.vendaId
        ) {

            return;

        }

        const vendaId =
            alertaNfce.vendaId;

        emitir(vendaId);
    }

    /*
     * =====================================================
     * TENTAR NOVAMENTE
     * =====================================================
     */

    function tentarNovamenteNfce() {

        if (
            !alertaNfce?.vendaId
        ) {

            return;

        }

        const vendaId =
            alertaNfce.vendaId;

        emitir(vendaId);
    }

    /*
     * =====================================================
     * CONVERTER HORA PARA SEGUNDOS
     * =====================================================
     */

    function horaParaSegundos(hora) {

        if (!hora) {

            return 0;

        }

        const [h, m, s] =
            hora
                .split(":")
                .map(Number);

        return (
            h * 3600 +
            m * 60 +
            s
        );
    }

    /*
     * =====================================================
     * CARREGANDO
     * =====================================================
     */

    if (carregando) {

        return (
            <div className="emitir-nfce-loading">

                <p>
                    Carregando vendas pendentes...
                </p>

            </div>
        );

    }

    /*
     * =====================================================
     * NENHUMA VENDA
     * =====================================================
     */

    if (vendas.length === 0) {

        return (
            <>
                <div className="emitir-nfce-empty">

                    <p>
                        Nenhuma venda pendente de NFC-e.
                    </p>

                </div>




            </>
        );

    }

    /*
     * =====================================================
     * FILTROS
     * =====================================================
     */
    const vendasFiltradas =
        vendas.filter(v => {

            /*
             * =====================================================
             * FILTRO POR DATA
             * =====================================================
             */

            if (dataFiltro) {

                const dataVenda =
                    String(v.data || "")
                        .trim();

                if (
                    dataVenda !== dataFiltro
                ) {

                    return false;

                }

            }

            /*
             * =====================================================
             * FILTRO POR PROTOCOLO / ID
             * =====================================================
             */

            if (protocoloFiltroNfce.trim()) {

                const protocoloVenda =
                    String(v.id || "")
                        .toLowerCase()
                        .trim();

                const protocoloDigitado =
                    protocoloFiltroNfce
                        .toLowerCase()
                        .trim();

                if (
                    !protocoloVenda.includes(
                        protocoloDigitado
                    )
                ) {

                    return false;

                }

            }

            /*
             * =====================================================
             * FILTRO POR VALOR
             * =====================================================
             */

            if (valorFiltroNfce.trim()) {

                const valorDigitado =
                    valorFiltroNfce
                        .replace(",", ".")
                        .replace(/[^\d.]/g, "");

                const numeroDigitado =
                    Number(valorDigitado);

                const valorVenda =
                    Number(v.valor_pago);

                if (
                    !Number.isNaN(numeroDigitado) &&
                    valorVenda !== numeroDigitado
                ) {

                    return false;

                }

            }

            return true;

        });


    /*
     * =====================================================
     * LIMITAR QUANTIDADE EXIBIDA
     * =====================================================
     */

    const vendasVisiveisNfce =
        vendasFiltradas.slice(
            0,
            quantidadeVisivelNfce
        );


    /*
     * =====================================================
     * VERIFICAR SE EXISTEM MAIS VENDAS
     * =====================================================
     */

    const possuiMaisVendasNfce =
        quantidadeVisivelNfce <
        vendasFiltradas.length;

    /*
     * =====================================================
     * INTERFACE
     * =====================================================
     */

    return (

        <div className="emitir-nfce">

            <h4>
                Vendas pendentes de NFC-e
            </h4>

            <div className="filtros-nfce">

                <div className="filtro-nfce-data">

                    <label>
                        Protocolo
                    </label>

                    <input
                        type="text"
                        placeholder="Ex: 4306"
                        value={protocoloFiltroNfce}
                        onChange={e =>
                            setProtocoloFiltroNfce(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="filtro-nfce-data">

                    <label>
                        Data
                    </label>

                    <input
                        type="date"
                        value={dataFiltro}
                        onChange={e =>
                            setDataFiltro(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="filtro-nfce-data">

                    <label>
                        Valor
                    </label>

                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 49,90"
                        value={valorFiltroNfce}
                        onChange={e =>
                            setValorFiltroNfce(
                                e.target.value
                            )
                        }
                    />

                </div>

                <button
                    type="button"
                    className="btn-limpar"
                    onClick={() => {

                        setDataFiltro("");

                        setHoraMinima("");

                        setProtocoloFiltroNfce("");

                        setValorFiltroNfce("");

                        setQuantidadeVisivelNfce(5);

                    }}
                >
                    Limpar filtros
                </button>

            </div>

            {vendasFiltradas.length === 0 ? (

                <div className="emitir-nfce-empty">

                    <p>
                        Nenhuma venda encontrada com esses filtros.
                    </p>

                </div>

            ) : (

                <table>

                    <thead>

                        <tr>

                            <th>
                                Protocolo
                            </th>

                            <th>
                                Valor
                            </th>

                            <th>
                                Pagamento
                            </th>

                            <th>
                                Data
                            </th>

                            <th>
                                Comanda
                            </th>

                            <th>
                                Ação
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {vendasVisiveisNfce.map(v => {
                            const possuiNfce =
                                Number(v.nfce_emitida) === 1;

                            const estaEmitindo =
                                Number(emitindoVendaId) === Number(v.id);

                            return (
                                <tr key={v.id}>

                                    <td>
                                        {v.id}
                                    </td>

                                    <td>
                                        R$ {Number(v.valor_pago).toFixed(2)}
                                    </td>

                                    <td>
                                        {v.pagamento}
                                    </td>

                                    <td>
                                        {v.data}
                                    </td>

                                    <td>

                                        {v.comanda ? (

                                            <button
                                                type="button"
                                                className="btn-comanda"
                                                onClick={() =>
                                                    window.open(
                                                        v.comanda,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                Ver comanda
                                            </button>

                                        ) : (

                                            <span className="sem-comanda">
                                                —
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            className={
                                                possuiNfce
                                                    ? "btn-nfce-emitida"
                                                    : estaEmitindo
                                                        ? "btn-nfce-processando"
                                                        : "btn-emitir-nfce"
                                            }
                                            disabled={
                                                possuiNfce ||
                                                estaEmitindo
                                            }
                                            onClick={() =>
                                                solicitarEmissao(v.id)
                                            }
                                        >

                                            {possuiNfce
                                                ? "NFC-e emitida"
                                                : estaEmitindo
                                                    ? "Emitindo..."
                                                    : "Emitir NFC-e"
                                            }

                                        </button>

                                    </td>

                                </tr>
                            );

                        })}

                    </tbody>

                </table>

            )}
            {possuiMaisVendasNfce && (

                <div className="nfce-carregar-mais-area">

                    <button
                        type="button"
                        className="nfce-carregar-mais-btn"
                        onClick={() =>
                            setQuantidadeVisivelNfce(
                                quantidadeAtual =>
                                    quantidadeAtual + 5
                            )
                        }
                    >
                        Carregar mais 5
                    </button>

                    <span className="nfce-carregar-mais-info">
                        Exibindo{" "}
                        {Math.min(
                            quantidadeVisivelNfce,
                            vendasFiltradas.length
                        )}{" "}
                        de{" "}
                        {vendasFiltradas.length}
                    </span>

                </div>

            )}
            {/*
             * =====================================================
             * MODAL PERSONALIZADO NFC-e
             * =====================================================
             */}

            {alertaNfce && createPortal(

                <div className="nfce-alerta-overlay-premium">

                    <div
                        className={`nfce-alerta-modal-premium nfce-alerta-modal-${alertaNfce.tipo}`}
                    >

                        {/*
                         * =====================================================
                         * ÍCONE
                         * =====================================================
                         */}

                        <div className="nfce-alerta-icone-area-premium">

                            {alertaNfce.tipo === "confirmacao" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-confirmacao">
                                    NF
                                </div>

                            )}

                            {alertaNfce.tipo === "processando" && (

                                <div className="nfce-alerta-spinner-premium"></div>

                            )}

                            {alertaNfce.tipo === "sucesso" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-sucesso">
                                    ✓
                                </div>

                            )}




                            {alertaNfce.tipo === "fiscal_pendente" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-aviso">
                                    !
                                </div>

                            )}


                            {alertaNfce.tipo === "erro" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-erro">
                                    !
                                </div>

                            )}



                            {alertaNfce.tipo === "aviso" && (

                                <div className="nfce-alerta-icone-premium nfce-alerta-icone-aviso">
                                    !
                                </div>

                            )}

                        </div>

                        {/*
                         * =====================================================
                         * CONTEÚDO
                         * =====================================================
                         */}

                        <div className="nfce-alerta-conteudo-premium">

                            <h3>
                                {alertaNfce.titulo}
                            </h3>

                            <p>
                                {alertaNfce.mensagem}
                            </p>

                            {alertaNfce.tipo === "processando" && (

                                <span className="nfce-alerta-processando-texto-premium">
                                    Não feche esta tela durante o processamento.
                                </span>

                            )}

                        </div>

                        {/*
                         * =====================================================
                         * CONFIRMAÇÃO
                         * =====================================================
                         */}

                        {alertaNfce.tipo === "confirmacao" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-confirmar-premium"
                                    onClick={confirmarEmissaoNfce}
                                >
                                    Emitir NFC-e
                                </button>

                            </div>

                        )}

                        {/*
                         * =====================================================
                         * SUCESSO
                         * =====================================================
                         */}

                        {alertaNfce.tipo === "sucesso" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-sucesso-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Entendido
                                </button>

                            </div>

                        )}
                        {/*
 * =====================================================
 * FISCAL PENDENTE
 * =====================================================
 */}

                        {alertaNfce.tipo === "fiscal_pendente" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Fechar
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-confirmar-premium"
                                    onClick={() => {

                                        const produtos =
                                            alertaNfce.produtos || [];

                                        const vendaId =
                                            alertaNfce.vendaId;

                                        setAlertaNfce(null);

                                        window.dispatchEvent(
                                            new CustomEvent(
                                                "abrir-fiscal-massa",
                                                {
                                                    detail: {
                                                        produtos,
                                                        vendaId
                                                    }
                                                }
                                            )
                                        );

                                    }}
                                >
                                    Cadastrar dados fiscais
                                </button>

                            </div>

                        )}
                        {/*
                         * =====================================================
                         * ERRO
                         * =====================================================
                         */}

                        {alertaNfce.tipo === "erro" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-cancelar-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Fechar
                                </button>

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-erro-premium"
                                    onClick={tentarNovamenteNfce}
                                >
                                    Tentar novamente
                                </button>

                            </div>

                        )}

                        {/*
                         * =====================================================
                         * AVISO
                         * =====================================================
                         */}

                        {alertaNfce.tipo === "aviso" && (

                            <div className="nfce-alerta-acoes-premium">

                                <button
                                    type="button"
                                    className="nfce-alerta-btn-principal-premium"
                                    onClick={fecharAlertaNfce}
                                >
                                    Entendido
                                </button>

                            </div>

                        )}

                    </div>

                </div>,

                document.body

            )}

        </div>

    );
}