import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../../../../../../config";
import "./modalpagamento.css";
import { useVenda } from "./vendaprovider";

export default function ModalPagamento({ total, fechar }) {
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
    const [processandoMetodo, setProcessandoMetodo] = useState(null);
    // valores: "debito" | "credito" | "dinheiro" | null

    const API_ONLINE_VENDAS = API_URL;

    const [apiPronta, setApiPronta] = useState(false);
    const [apiVendas, setApiVendas] = useState(null);

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
        processandoMetodo ||
        !apiPronta;

    const { itens, limparVenda } = useVenda();

    async function criarVendaInicial(tipoPagamento) {
        if (criandoVendaRef.current) return null;

        criandoVendaRef.current = true;

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

        // limpa carrinho se quiser
        // limparVenda();

        // NÃO fecha o modal automaticamente
    }

    async function confirmarPagamento() {
        if (imprimindoRef.current) {
            console.warn("Impressão já em andamento, ignorando chamada duplicada");
            return;
        }

        imprimindoRef.current = true;


        // Pix não precisa passar por botão manual
        setProcessando(true);


        if (apiVendas !== API_LOCAL) {
            imprimindoRef.current = false;
            alert("Impressão local indisponível");
            return;
        }


        setProcessando(true);

        try {
            // SEMPRE tenta confirmar
            const conf = await fetch(
                `${API_ONLINE_VENDAS}/vendas/${vendaId}/confirmar`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            // 409 NÃO BLOQUEIA
            if (!conf.ok && conf.status !== 409) {
                throw new Error("Erro ao confirmar venda");
            }

            // IMPRIME SEMPRE
            const imp = await fetch(`${API_LOCAL}/imprimir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    venda_id: vendaId,
                    url: comandaUrl
                })
            });

            if (!imp.ok) {
                throw new Error("Falha na impressão");
            }

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
                limparVenda();
                fechar();
            }, 1500);

        } catch (e) {
            imprimindoRef.current = false;

            alert("Erro ao confirmar ou imprimir");
            setProcessando(false);
            resetarModal();
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
    // DEFINIR API
    // ===============================
    useEffect(() => {
        async function definirApiVendas() {
            try {
                const r = await fetch(`${API_LOCAL}/health`, {
                    method: "GET"
                });

                if (r.ok) {
                    console.log("API LOCAL ativa, usando 8888");
                    setApiVendas(API_LOCAL);
                    return;
                }
            } catch {
                // silencioso
            }

            console.log("API LOCAL indisponível, usando ONLINE");
            setApiVendas(API_ONLINE_VENDAS);
        }

        definirApiVendas().finally(() => setApiPronta(true));
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

                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (processandoMetodo) return;

                                        setProcessandoMetodo("debito");
                                        setPagamento("debito");

                                        try {
                                            const dados = await criarVendaInicial("debito");
                                            if (!dados) return;

                                            setEtapa("confirmar");
                                        } catch {
                                            alert("Erro ao iniciar pagamento");
                                            setPagamento(null);
                                        } finally {
                                            setProcessandoMetodo(false);
                                        }
                                    }}

                                    className={processandoMetodo === "debito" ? "btn-processando" : ""}
                                >
                                    {processandoMetodo === "debito" ? "Processando..." : "Cartão Débito"}
                                </button>


                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (processandoMetodo) return;

                                        setProcessandoMetodo("credito");
                                        setPagamento("credito");

                                        try {
                                            const dados = await criarVendaInicial("credito");
                                            if (!dados) return;

                                            setEtapa("confirmar");
                                        } catch {
                                            alert("Erro ao iniciar pagamento");
                                            setPagamento(null);
                                        } finally {
                                            setProcessandoMetodo(false);
                                        }
                                    }}
                                    className={processandoMetodo === "credito" ? "btn-processando" : ""}


                                >
                                    {processandoMetodo === "credito" ? "Processando..." : "Cartão Crédito"}
                                </button>

                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (bloquearTudo) return;

                                        setPagamento("pix");
                                        setPixPago(false);
                                        setCarregandoPix(true);

                                        try {
                                            // cria a venda normalmente (igual hoje)
                                            await criarVendaInicial("pix");

                                            // 🔥 CHAMA O PIX IGUAL AO CÓDIGO ANTIGO
                                            const pix = await fetch(`${API_ONLINE_VENDAS}/vendas/pix/gerar`, {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                                },
                                                body: JSON.stringify({ valor: total })
                                            }).then(r => r.json());

                                            // PIX LOCAL → CONFIRMA DIRETO
                                            if (pix.tipo === "pix_local") {
                                                setPixPago(true);
                                                setEtapa("confirmar");
                                                return;
                                            }

                                            // PIX MERCADO PAGO → MOSTRA QR
                                            setPixQr(pix.qr_code_base64);
                                            setPixId(pix.id);
                                            setEtapa("pix_mp");

                                        } catch (e) {
                                            alert("Erro ao gerar Pix");
                                            setEtapa("metodo");
                                        } finally {
                                            setCarregandoPix(false);
                                        }
                                    }}


                                    className={carregandoPix ? "btn-processando" : ""}
                                >
                                    {carregandoPix ? "Gerando Pix..." : "Pix"}
                                </button>

                                <button
                                    disabled={
                                        bloquearPagamento ||
                                        bloquearTudo ||
                                        vendaId ||
                                        criandoVendaRef.current
                                    }
                                    onClick={async () => {
                                        if (processandoMetodo) return;

                                        setProcessandoMetodo("dinheiro");
                                        setPagamento("dinheiro");

                                        try {
                                            const dados = await criarVendaInicial("dinheiro");
                                            if (!dados) return;

                                            setEtapa("confirmar");
                                        } catch {
                                            alert("Erro ao iniciar pagamento");
                                            setPagamento(null);
                                        } finally {
                                            setProcessandoMetodo(false);
                                        }
                                    }}

                                    className={processandoMetodo === "dinheiro" ? "btn-processando" : ""}


                                >
                                    {processandoMetodo === "dinheiro" ? "Processando..." : "Dinheiro"}
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
                                    onClick={cancelarVendaAtual}
                                >
                                    Cancelar Venda
                                </button>





                            </>
                        )}

                        {etapa === "confirmar" && pagamento !== "pix" && (
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