import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../../../config";
import "./modalpagamento.css";
import { useVenda } from "./vendaprovider";

export default function ModalPagamento({
    total,
    fechar,
    modoPixRapido = false,
    dadosPixRapido = null
}) {
    const [infoMaquininha, setInfoMaquininha] = useState(null);
    const [erroMaquininha, setErroMaquininha] = useState(null);
    const [forcarManual, setForcarManual] = useState(false);
    const [usaMaquininha, setUsaMaquininha] = useState(false);
    const API_LOCAL = "http://localhost:8888";
    const [vendaId, setVendaId] = useState(null);
    const criandoVendaRef = useRef(false);

    const [comandaUrl, setComandaUrl] = useState(null);
    const [statusVenda, setStatusVenda] = useState(null);
    const pixAutomatico = false; // enquanto não tem QR configurado
    const [metodoProcessando, setMetodoProcessando] = useState(null);
    const [bloqueandoMetodo, setBloqueandoMetodo] = useState(false);


    const API_ONLINE_VENDAS = API_URL;

    const [apiPronta, setApiPronta] = useState(false);
    const [apiLocalDisponivel, setApiLocalDisponivel] = useState(false);
    const [carregandoConfirmacao, setCarregandoConfirmacao] = useState(false);
    const [processando, setProcessando] = useState(false);
    const [fechando, setFechando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const imprimindoRef = useRef(false);

    const [etapa, setEtapa] = useState("metodo");
    const [pagamento, setPagamento] = useState(null);

    const [valorRecebido, setValorRecebido] = useState("");

    const [pixQr, setPixQr] = useState(null);
    const [pixId, setPixId] = useState(null);
    const [pixPago, setPixPago] = useState(false);
    const [carregandoPix, setCarregandoPix] = useState(false);
    const bloquearTudo =
        carregandoPix ||
        processando ||
        bloqueandoMetodo ||
        !apiPronta;
    const jogosRegistradosRef = useRef(false);

    const {
        itens,
        limparVenda,
        setModalAberto,

        atualizarVendaProcessando,
        fecharPixRapido
    } = useVenda();
    /* ===============================
   DADOS DO PIX RÁPIDO
=============================== */

    const vendaRapidaSnapshot =
        dadosPixRapido?.venda || null;

    const vendaRapidaLocalId =
        vendaRapidaSnapshot?.idLocal || null;

    const vendaRapidaVendaId =
        dadosPixRapido?.vendaId || null;

    const vendaRapidaPaymentId =
        dadosPixRapido?.paymentId || null;

    const vendaRapidaComandaUrl =
        dadosPixRapido?.comandaUrl || null;

    const vendaRapidaQr =
        dadosPixRapido?.qrCodeBase64 || null;
    /* ===============================
INICIALIZAR PIX RÁPIDO
=============================== */

    useEffect(() => {

        if (!modoPixRapido) {
            return;
        }

        if (!dadosPixRapido) {
            return;
        }

        setPagamento("pix");

        setVendaId(
            vendaRapidaVendaId
        );

        setComandaUrl(
            vendaRapidaComandaUrl
        );

        setPixId(
            vendaRapidaPaymentId
        );

        setPixQr(
            vendaRapidaQr
        );

        setPixPago(false);

        setEtapa("pix_mp");

    }, [
        modoPixRapido,
        dadosPixRapido,
        vendaRapidaVendaId,
        vendaRapidaComandaUrl,
        vendaRapidaPaymentId,
        vendaRapidaQr
    ]);
    async function criarVendaInicial(tipoPagamento) {


        const resp = await fetch(`${API_ONLINE_VENDAS}/vendas/finalizar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                pagamento: tipoPagamento,
                valor: total,
                produtos: itens,
                forcar_manual: forcarManual,
                cpf: usarCpf ? cpf : null
            })
        });

        if (!resp.ok) {
            criandoVendaRef.current = false;
            throw new Error("Erro ao criar venda");
        }

        const dados = await resp.json();

        setVendaId(dados.venda_id);
        setComandaUrl(dados.comanda);
        setStatusVenda(dados.status);

        return dados; // 🔥 ESSENCIAL
    }


    // ===============================
    // CPF
    // ===============================
    const [usarCpf, setUsarCpf] = useState(false);
    const [cpf, setCpf] = useState("");

    function mascararCpf(valor) {
        return valor
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .slice(0, 14);
    }

    function validarCpf(valor) {
        const cpfLimpo = valor.replace(/\D/g, "");
        if (cpfLimpo.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpfLimpo)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += cpfLimpo[i] * (10 - i);
        let resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== Number(cpfLimpo[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += cpfLimpo[i] * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;

        return resto === Number(cpfLimpo[10]);
    }
    function fecharModalSemCancelar() {
        criandoVendaRef.current = false;
        setModalAberto(false);
        fechar();
    }



    const cpfValido = validarCpf(cpf);
    const bloquearPagamento = usarCpf && !cpfValido;

    const troco =
        pagamento === "dinheiro"
            ? Math.max(Number(valorRecebido || 0) - total, 0)
            : 0;

    // ===============================
    // FINALIZAR VENDA (ÚNICO FLUXO)
    // ===============================
    async function cancelarVendaAtual() {
        try {
            if (vendaId) {
                await fetch(
                    `${API_ONLINE_VENDAS}/vendas/${vendaId}/cancelar`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
            }
        } catch (e) {
            console.warn("Erro ao cancelar venda (ignorado):", e);
        }

        // 🔥 RESET TOTAL — ISSO É O MAIS IMPORTANTE
        criandoVendaRef.current = false;

        setVendaId(null);
        setComandaUrl(null);
        setStatusVenda(null);
        setPagamento(null);
        setValorRecebido("");
        setPixQr(null);
        setPixId(null);
        setPixPago(false);
        setProcessando(false);
        setCarregandoPix(false);
        setEtapa("metodo");
        jogosRegistradosRef.current = false;

        // limpa carrinho se quiser
        // limparVenda();

        // NÃO fecha o modal automaticamente
    }

    async function confirmarPagamento() {

        if (imprimindoRef.current) {
            console.warn(
                "[VENDA] Finalização já em andamento."
            );
            return;
        }

        imprimindoRef.current = true;
        setProcessando(true);

        let erroImpressao = false;
        let mensagemErroImpressao = null;

        try {

            // ==========================================
            // 1. CONFIRMAR VENDA NO BACKEND ONLINE
            // ==========================================

            console.log(
                "[VENDA] Confirmando venda:",
                vendaId
            );

            const confResp = await fetch(
                `${API_ONLINE_VENDAS}/vendas/${vendaId}/confirmar`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            console.log(
                "[VENDA] STATUS CONFIRMAÇÃO:",
                confResp.status
            );

            if (!confResp.ok && confResp.status !== 409) {

                const texto = await confResp.text();

                console.error(
                    "[VENDA] Erro confirmação:",
                    texto
                );

                throw new Error(
                    "Erro ao confirmar venda"
                );
            }

            const confData = await confResp.json();

            console.log(
                "[VENDA] Confirmação recebida:",
                confData
            );

            console.log(
                "[VENDA] Deve imprimir:",
                confData.imprimir
            );

            console.log(
                "[VENDA] URL comprovante:",
                comandaUrl
            );

            // ==========================================
            // 2. IMPRIMIR COMPROVANTE
            // ==========================================

            if (confData.imprimir === true) {

                console.log(
                    "[IMPRESSÃO] Venda configurada para impressão."
                );

                if (!apiLocalDisponivel) {

                    console.warn(
                        "[IMPRESSÃO] API local não está disponível."
                    );

                    erroImpressao = true;

                    mensagemErroImpressao =
                        "O servidor local de impressão não está disponível.";

                } else if (!comandaUrl) {

                    console.error(
                        "[IMPRESSÃO] URL da comanda não encontrada."
                    );

                    erroImpressao = true;

                    mensagemErroImpressao =
                        "O comprovante não possui URL para impressão.";

                } else {

                    try {

                        console.log(
                            "[IMPRESSÃO] Enviando para:",
                            `${API_LOCAL}/imprimir`
                        );

                        console.log(
                            "[IMPRESSÃO] Venda:",
                            vendaId
                        );

                        console.log(
                            "[IMPRESSÃO] PDF:",
                            comandaUrl
                        );

                        const impResp = await fetch(
                            `${API_LOCAL}/imprimir`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    venda_id: vendaId,
                                    url: comandaUrl
                                })
                            }
                        );

                        console.log(
                            "[IMPRESSÃO] STATUS:",
                            impResp.status
                        );

                        if (!impResp.ok) {

                            const resposta =
                                await impResp.text();

                            console.error(
                                "[IMPRESSÃO] Erro:",
                                resposta
                            );

                            erroImpressao = true;

                            mensagemErroImpressao =
                                "O servidor local não conseguiu imprimir o comprovante.";

                        } else {

                            const resposta =
                                await impResp.json();

                            console.log(
                                "[IMPRESSÃO] SUCESSO:",
                                resposta
                            );
                        }

                    } catch (erro) {

                        console.error(
                            "[IMPRESSÃO] Falha de comunicação:",
                            erro
                        );

                        erroImpressao = true;

                        mensagemErroImpressao =
                            "Não foi possível comunicar com a impressora.";
                    }
                }

            } else {

                console.log(
                    "[IMPRESSÃO] Backend informou que esta venda não deve ser impressa."
                );
            }

            // ==========================================
            // 3. VENDA CONCLUÍDA
            // ==========================================

            setSucesso(true);

            setTimeout(() => {

                imprimindoRef.current = false;
                criandoVendaRef.current = false;

                setVendaId(null);
                setComandaUrl(null);
                setStatusVenda(null);
                setPagamento(null);
                setPixQr(null);
                setPixId(null);
                setPixPago(false);
                setEtapa("metodo");

                // ======================================
                // PIX RÁPIDO
                // ======================================

                if (modoPixRapido) {

                    if (vendaRapidaLocalId) {

                        atualizarVendaProcessando(
                            vendaRapidaLocalId,
                            {
                                status: "concluida",
                                pixAprovado: true,

                                concluidaEm:
                                    new Date().toISOString(),

                                aviso:
                                    erroImpressao
                                        ? (
                                            mensagemErroImpressao ||
                                            "Erro ao imprimir comprovante"
                                        )
                                        : null
                            }
                        );
                    }

                    fecharPixRapido();

                    setModalAberto(false);

                    fechar();

                } else {

                    // ==================================
                    // VENDA NORMAL
                    // ==================================

                    limparVenda();

                    setModalAberto(false);

                    fechar();
                }

                // ======================================
                // AVISO DE IMPRESSÃO
                // ======================================

                if (erroImpressao) {

                    alert(
                        "Venda concluída com sucesso, mas ocorreu um problema na impressão.\n\n" +
                        (
                            mensagemErroImpressao ||
                            "Verifique a impressora."
                        )
                    );
                }

            }, 1500);

        } catch (erro) {

            console.error(
                "[VENDA] Erro ao confirmar pagamento:",
                erro
            );

            imprimindoRef.current = false;

            setProcessando(false);

            // ==========================================
            // PIX RÁPIDO
            // ==========================================

            if (modoPixRapido) {

                if (vendaRapidaLocalId) {

                    atualizarVendaProcessando(
                        vendaRapidaLocalId,
                        {
                            status: "erro",

                            erro:
                                erro?.message ||
                                "Pix pago, mas ocorreu erro ao finalizar a venda"
                        }
                    );
                }

                alert(
                    erro?.message ||
                    "Pix pago, mas ocorreu erro ao finalizar a venda"
                );

                return;
            }

            // ==========================================
            // VENDA NORMAL
            // ==========================================

            alert(
                erro?.message ||
                "Erro ao confirmar pagamento"
            );

            resetarModal();
        }
    }

    async function registrarJogosQuizAntecipado() {
        if (jogosRegistradosRef.current) return;

        if (!itens || itens.length === 0) return;

        const jogos = itens.filter(
            item =>
                item.nome &&
                item.nome.toLowerCase().includes("jogos")
        );

        if (jogos.length === 0) return;

        const totalJogos = jogos.reduce(
            (soma, item) => soma + (item.quantidade || 0),
            0
        );

        if (totalJogos <= 0) return;

        jogosRegistradosRef.current = true;

        try {
            await fetch(`${API_URL}/jogos/registrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ quantos: totalJogos })
            });

            console.log(`[JOGOS] Registro antecipado: ${totalJogos}`);
        } catch (e) {
            console.warn("[JOGOS] Falha ao registrar antecipadamente:", e);
            jogosRegistradosRef.current = false;
        }
    }



    // ===============================
    // PIX – VERIFICAR STATUS
    // ===============================
    async function verificarStatusPix() {
        if (!pixId || pixPago) return;

        try {
            const r = await
                fetch(`${API_ONLINE_VENDAS}/vendas/pix/status/${pixId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

            const j = await r.json();

            if (j.status === "approved") {
                setPixPago(true);

                // Pix aprovado = confirma automaticamente
                await confirmarPagamento();
            }


        } catch {
            // silencioso
        }
    }

    useEffect(() => {
        if (etapa !== "pix_mp" || !pixId || pixPago) return;

        const interval = setInterval(verificarStatusPix, 3000);
        return () => clearInterval(interval);
    }, [etapa, pixId, pixPago]);

    // ===============================
    // VERIFICAR API LOCAL DE IMPRESSÃO
    // ===============================
    useEffect(() => {
        async function verificarApiLocal() {
            try {
                console.log(
                    "[IMPRESSÃO LOCAL] Verificando:",
                    `${API_LOCAL}/health`
                );

                const resp = await fetch(
                    `${API_LOCAL}/health`,
                    {
                        method: "GET"
                    }
                );

                console.log(
                    "[IMPRESSÃO LOCAL] STATUS:",
                    resp.status
                );

                if (resp.ok) {
                    console.log(
                        "[IMPRESSÃO LOCAL] Servidor de impressão disponível."
                    );

                    setApiLocalDisponivel(true);
                } else {
                    console.warn(
                        "[IMPRESSÃO LOCAL] Servidor respondeu, mas não está OK."
                    );

                    setApiLocalDisponivel(false);
                }

            } catch (erro) {
                console.warn(
                    "[IMPRESSÃO LOCAL] Servidor indisponível:",
                    erro
                );

                setApiLocalDisponivel(false);

            } finally {
                setApiPronta(true);
            }
        }

        verificarApiLocal();
    }, []);

    // ===============================
    // STATUS MAQUININHA
    // ===============================
    useEffect(() => {
        async function carregarApiMaquininha() {
            try {
                const resp = await fetch(`${API_URL}/comercio/status-pagamento`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                if (!resp.ok) return;

                const data = await resp.json();
                setUsaMaquininha(data.api_maquininha === true);
            } catch {
                setUsaMaquininha(false);
            }
        }

        carregarApiMaquininha();
    }, []);

    function resetarModal() {
        criandoVendaRef.current = false;

        setProcessando(false);
        setCarregandoPix(false);
        setVendaId(null);
        setComandaUrl(null);
        setStatusVenda(null);
        setPagamento(null);
        setValorRecebido("");
        setPixQr(null);
        setPixId(null);
        setPixPago(false);
        setEtapa("metodo");
        setModalAberto(false);


        fechar();
    }



    return (
        <div className={`pag-overlay ${fechando ? "overlay-fechar" : ""}`}>
            <div className={`pag-box ${sucesso ? "pag-box-sucesso" : ""}`}>

                {sucesso ? (
                    <div className="pag-sucesso anim-sucesso">
                        <div className="sucesso-icon">✔</div>
                        <h2>Venda realizada</h2>
                        <p>Pagamento confirmado com sucesso</p>
                    </div>
                ) : (
                    <>
                        {etapa === "metodo" && (
                            <>
                                <h3>Total: R$ {total.toFixed(2)}</h3>

                                <div className="cpf-area">
                                    <label className="cpf-toggle">
                                        <input
                                            type="checkbox"
                                            checked={usarCpf}
                                            onChange={e => {
                                                setUsarCpf(e.target.checked);
                                                setCpf("");
                                            }}
                                        />
                                        Cupom fiscal (CPF na nota)
                                    </label>

                                    {usarCpf && (
                                        <>
                                            <input
                                                className={`cpf-input ${cpfValido ? "cpf-valido" : "cpf-invalido"}`}
                                                type="text"
                                                placeholder="000.000.000-00"
                                                value={cpf}
                                                onChange={e => setCpf(mascararCpf(e.target.value))}
                                            />
                                            <div className="cpf-ajuda">
                                                <br />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* DÉBITO */}
                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (bloqueandoMetodo || criandoVendaRef.current) return;

                                        criandoVendaRef.current = true;
                                        setBloqueandoMetodo(true);
                                        setMetodoProcessando("debito");
                                        setPagamento("debito");

                                        try {
                                            await registrarJogosQuizAntecipado();

                                            const dados = await criarVendaInicial("debito");
                                            if (!dados) return;
                                            setEtapa("confirmar");
                                        } catch {
                                            alert("Erro ao iniciar pagamento");
                                            setPagamento(null);
                                        } finally {
                                            criandoVendaRef.current = false;
                                            setMetodoProcessando(null);
                                            setBloqueandoMetodo(false);
                                        }
                                    }}
                                    className={metodoProcessando === "debito" ? "btn-processando" : ""}
                                >
                                    {metodoProcessando === "debito" ? "Processando..." : "Cartão Débito"}
                                </button>

                                {/* CRÉDITO */}
                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (bloqueandoMetodo || criandoVendaRef.current) return;

                                        criandoVendaRef.current = true;
                                        setBloqueandoMetodo(true);
                                        setMetodoProcessando("credito");
                                        setPagamento("credito");

                                        try {
                                            await registrarJogosQuizAntecipado();

                                            const dados = await criarVendaInicial("credito");
                                            if (!dados) return;
                                            setEtapa("confirmar");
                                        } catch {
                                            alert("Erro ao iniciar pagamento");
                                            setPagamento(null);
                                        } finally {
                                            criandoVendaRef.current = false;
                                            setMetodoProcessando(null);
                                            setBloqueandoMetodo(false);
                                        }
                                    }}
                                    className={metodoProcessando === "credito" ? "btn-processando" : ""}
                                >
                                    {metodoProcessando === "credito" ? "Processando..." : "Cartão Crédito"}
                                </button>

                                {/* PIX */}
                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (criandoVendaRef.current) return;

                                        criandoVendaRef.current = true;
                                        setPagamento("pix");
                                        setPixPago(false);
                                        setCarregandoPix(true);

                                        try {
                                            await registrarJogosQuizAntecipado();

                                            await criarVendaInicial("pix");

                                            const pix = await fetch(
                                                `${API_ONLINE_VENDAS}/vendas/pix/gerar`,
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${localStorage.getItem("token")}`
                                                    },
                                                    body: JSON.stringify({ valor: total })
                                                }
                                            ).then(r => r.json());

                                            if (pix.tipo === "pix_local") {
                                                setPagamento("pix");
                                                setPixPago(true);
                                                setEtapa("confirmar");
                                                return;
                                            }

                                            setPixQr(pix.qr_code_base64);
                                            setPixId(pix.id);
                                            setEtapa("pix_mp");

                                        } catch {
                                            alert("Erro ao gerar Pix");
                                            setEtapa("metodo");
                                        } finally {
                                            criandoVendaRef.current = false;
                                            setCarregandoPix(false);
                                        }
                                    }}
                                    className={carregandoPix ? "btn-processando" : ""}
                                >
                                    {carregandoPix ? "Gerando Pix..." : "Pix"}
                                </button>

                                {/* DINHEIRO */}
                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (bloqueandoMetodo || criandoVendaRef.current) return;

                                        criandoVendaRef.current = true;
                                        setBloqueandoMetodo(true);
                                        setMetodoProcessando("dinheiro");
                                        setPagamento("dinheiro");

                                        try {
                                            await registrarJogosQuizAntecipado();

                                            const dados = await criarVendaInicial("dinheiro");
                                            if (!dados) return;
                                            setEtapa("confirmar");
                                        }
                                        catch {
                                            alert("Erro ao iniciar pagamento");
                                            setPagamento(null);
                                        } finally {
                                            criandoVendaRef.current = false;
                                            setMetodoProcessando(null);
                                            setBloqueandoMetodo(false);
                                        }
                                    }}
                                    className={metodoProcessando === "dinheiro" ? "btn-processando" : ""}
                                >
                                    {metodoProcessando === "dinheiro" ? "Processando..." : "Dinheiro"}
                                </button>

                                <button
                                    className="voltar"
                                    onClick={fecharModalSemCancelar}
                                >
                                    Voltar
                                </button>
                            </>
                        )}


                        {etapa === "pix_mp" && pixQr && (
                            <>
                                <h3>Pagamento Pix</h3>

                                <div className="pix-qrcode">
                                    <img
                                        src={`data:image/png;base64,${pixQr}`}
                                        alt="Pix QR Code"
                                    />
                                    <p>
                                        {!pixPago && "Aguardando pagamento…"}
                                        {pixPago && "Pagamento recebido ✔ Finalizando venda…"}
                                    </p>
                                </div>
                                <button
                                    className="cancelar"
                                    onClick={() => {

                                        if (modoPixRapido) {

                                            if (vendaRapidaLocalId) {
                                                atualizarVendaProcessando(
                                                    vendaRapidaLocalId,
                                                    {
                                                        status: "erro",
                                                        erro: "Pix cancelado pelo operador"
                                                    }
                                                );
                                            }

                                            fecharPixRapido();
                                            setModalAberto(false);
                                            fechar();

                                            return;
                                        }

                                        cancelarVendaAtual();
                                    }}
                                >
                                    Cancelar Venda
                                </button>





                            </>
                        )}

                        {etapa === "confirmar" && (
                            <>
                                <h3>Pagamento: {pagamento}</h3>

                                {pagamento === "dinheiro" && (
                                    <>
                                        <input
                                            type="number"
                                            placeholder="Valor recebido"
                                            value={valorRecebido}
                                            onChange={e => setValorRecebido(e.target.value)}
                                        />
                                        <p>Troco: R$ {troco.toFixed(2)}</p>
                                    </>
                                )}

                                <button
                                    className={`confirmar ${processando ? "btn-processando" : ""}`}
                                    onClick={confirmarPagamento}
                                    disabled={
                                        processando ||
                                        (pagamento === "pix" && pixAutomatico && !pixPago)
                                    }

                                >
                                    {processando ? "Processando..." : "Confirmar pagamento"}
                                </button>
                                <button
                                    className="cancelar"
                                    onClick={cancelarVendaAtual}
                                >
                                    Cancelar Venda
                                </button>



                                <button
                                    className="voltar"
                                    onClick={cancelarVendaAtual}
                                >
                                    Voltar
                                </button>


                            </>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}