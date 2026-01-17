import React, { useState, useEffect } from "react";
import { API_URL } from "../../../../../../../../config";
import "./modalpagamento.css";
import { useVenda } from "./vendaprovider";

export default function ModalPagamento({ total, fechar }) {
    const [infoMaquininha, setInfoMaquininha] = useState(null);
    const [erroMaquininha, setErroMaquininha] = useState(null);
    const [forcarManual, setForcarManual] = useState(false);
    const [usaMaquininha, setUsaMaquininha] = useState(false);
    const API_LOCAL_VENDAS = "http://localhost:8888"; //nao esqueça que é 8888
    const API_ONLINE_VENDAS = API_URL;
    const [apiPronta, setApiPronta] = useState(false);

    const [apiVendas, setApiVendas] = useState(null);
    const [carregandoConfirmacao, setCarregandoConfirmacao] = useState(false);

    const [etapa, setEtapa] = useState("metodo");
    const [pagamento, setPagamento] = useState(null);
    const [valorRecebido, setValorRecebido] = useState("");
    const [sucesso, setSucesso] = useState(false);
    const [processando, setProcessando] = useState(false);
    const [fechando, setFechando] = useState(false);
    const [pixQr, setPixQr] = useState(null);
    const [pixId, setPixId] = useState(null);
    const [pixPago, setPixPago] = useState(false);
    const API_PIX = apiVendas;

    const [carregandoPix, setCarregandoPix] = useState(false);
    const bloquearTudo = carregandoPix || processando || !apiPronta;
    const [vendaPId, setVendaPId] = useState(null);
    async function preRegistrarVenda(tipoPagamento) {
        const produtos = itens.map(i => ({
            id: i.id,
            quantidade: i.quantidade
        }));

        const resp = await fetch(`${apiVendas}/vendas/pre-registrar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                pagamento: tipoPagamento,
                valor: total,
                produtos,
                cpf: usarCpf ? cpf : null
            })
        });

        const data = await resp.json();
        setVendaPId(data.venda_p_id);
    }

    async function verificarStatusPix() {
        if (!pixId || pixPago) return;

        try {
            const r = await fetch(
                `${API_PIX}/vendas/pix/status/${pixId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const j = await r.json();
            if (j.status === "approved") {
                if (apiVendas === API_LOCAL_VENDAS && !vendaPId) return;

                setPixPago(true);
                setPagamento("pix");

                if (apiVendas === API_LOCAL_VENDAS) {
                    await fetch(
                        `${apiVendas}/vendas/confirmar-local/${vendaPId}`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setSucesso(true);
                } else {
                    finalizarVendaPix();
                }
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

    async function finalizarVendaPix() {
        if (processando) return;
        setProcessando(true);

        const produtos = itens.map(i => ({
            id: i.id,
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
            subtotal: i.subtotal,
            unidade: i.unidade
        }));

        const resp = await fetch(`${apiVendas}/vendas/finalizar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                pagamento: "pix",
                valor: total,
                produtos,
                forcar_manual: false,
                cpf: usarCpf ? cpf : null
            })
        });

        if (!resp.ok) {
            console.error("Erro ao finalizar venda Pix");
            setProcessando(false);
            return;
        }

        setSucesso(true);

        setTimeout(() => {
            setFechando(true);
            setTimeout(() => {
                setVendaPId(null);
                limparVenda();
                fechar();


            }, 400);
        }, 2000);
    }


    // ===== CPF (ADICIONADO) =====
    const [usarCpf, setUsarCpf] = useState(false);
    const [cpf, setCpf] = useState("");

    const { itens, limparVenda } = useVenda();

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

    const cpfValido = validarCpf(cpf);
    const bloquearPagamento = usarCpf && !cpfValido;

    const troco =
        pagamento === "dinheiro"
            ? Math.max(Number(valorRecebido || 0) - total, 0)
            : 0;

    async function confirmarPagamento() {
        if (pixPago && pagamento === "pix" && etapa === "pix_mp") return;

        if (processando) return;
        setProcessando(true);
        if (apiVendas === API_LOCAL_VENDAS && !vendaPId) {
            alert("Venda local não registrada. Reabra o pagamento.");
            setProcessando(false);
            return;
        }

        try {
            // 🔥 NODE LOCAL
            if (apiVendas === API_LOCAL_VENDAS) {
                await fetch(
                    `${apiVendas}/vendas/confirmar-local/${vendaPId}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
            }
            // 🌐 ONLINE
            else {
                await fetch(`${apiVendas}/vendas/finalizar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        pagamento,
                        valor: total,
                        produtos: itens,
                        forcar_manual: forcarManual,
                        cpf: usarCpf ? cpf : null
                    })
                });
            }

            setSucesso(true);

            setTimeout(() => {
                setFechando(true);
                setTimeout(() => {
                    setVendaPId(null);
                    limparVenda();
                    fechar();

                }, 400);
            }, 2000);

        } catch {
            alert("Erro ao confirmar pagamento");
            setProcessando(false);
        }
    }

    useEffect(() => {
        async function definirApiVendas() {
            try {
                const resp = await fetch(`${API_URL}/clientes/me`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                if (!resp.ok) throw new Error("Falha ao buscar cliente");

                const data = await resp.json();

                if (Number(data.node) === 1) {
                    console.log("[PAGAMENTO] NODE = 1 → API LOCAL 8889");
                    setApiVendas("http://localhost:8889");
                } else {
                    console.log("[PAGAMENTO] NODE = 0 → API ONLINE");
                    setApiVendas(API_ONLINE_VENDAS);
                }

            } catch (err) {
                console.error("[PAGAMENTO] Erro ao definir API", err);
                setApiVendas(API_ONLINE_VENDAS);
            } finally {
                setApiPronta(true);
            }
        }

        definirApiVendas();
    }, []);


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
    if (!apiPronta) {
        return (
            <div className="pag-overlay">
                <div className="pag-box">
                    <p>Inicializando sistema de pagamento...</p>
                </div>
            </div>
        );
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
                                    disabled={bloquearPagamento || bloquearTudo}
                                    onClick={async () => {
                                        setPagamento("debito");
                                        setEtapa("confirmar");
                                        setCarregandoConfirmacao(true);

                                        if (apiVendas === API_LOCAL_VENDAS) {
                                            await preRegistrarVenda("debito");
                                        }

                                        setCarregandoConfirmacao(false);
                                    }}

                                >
                                    Cartão Débito
                                </button>


                                <button
                                    disabled={bloquearPagamento || bloquearTudo}
                                    onClick={async () => {
                                        setPagamento("credito");
                                        setEtapa("confirmar");
                                        setCarregandoConfirmacao(true);

                                        if (apiVendas === API_LOCAL_VENDAS) {
                                            await preRegistrarVenda("credito");
                                        }

                                        setCarregandoConfirmacao(false);
                                    }}


                                >
                                    Cartão Crédito
                                </button>


                                <button
                                    disabled={bloquearPagamento || bloquearTudo}
                                    onClick={async () => {
                                        if (bloquearTudo) return;

                                        setPagamento("pix");
                                        setPixPago(false); // ← FALTAVA ISSO
                                        setCarregandoConfirmacao(true);
                                        setCarregandoPix(true);



                                        try {
                                            let usarPixMP = false;

                                            try {
                                                const r = await fetch(`${API_URL}/comercio/status-pagamento`, {
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem("token")}`
                                                    }
                                                });

                                                const j = await r.json();
                                                usarPixMP = j.api_maquininha === true;
                                            } catch {
                                                usarPixMP = false;
                                            }


                                            if (apiVendas === API_LOCAL_VENDAS) {
                                                await preRegistrarVenda("pix");
                                            }

                                            const pix = await fetch(`${API_PIX}/vendas/pix/gerar`, {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                                },
                                                body: JSON.stringify({ valor: total })
                                            }).then(r => r.json());

                                            if (pix.tipo === "pix_local") {
                                                setPixPago(true);
                                                setPagamento("pix");

                                                // CONFIRMA DIRETO
                                                if (apiVendas === API_LOCAL_VENDAS && vendaPId) {
                                                    await fetch(
                                                        `${apiVendas}/vendas/confirmar-local/${vendaPId}`,
                                                        {
                                                            method: "POST",
                                                            headers: {
                                                                Authorization: `Bearer ${localStorage.getItem("token")}`
                                                            }
                                                        }
                                                    );
                                                    setSucesso(true);
                                                    return;
                                                }

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
                                            setCarregandoPix(false);
                                            setCarregandoConfirmacao(false);
                                        }
                                    }}

                                    className={carregandoPix ? "btn-processando" : ""}

                                >
                                    {carregandoPix ? "Gerando Pix..." : "Pix"}
                                </button>




                                <button
                                    disabled={bloquearPagamento || bloquearTudo}
                                    onClick={async () => {
                                        setPagamento("dinheiro");
                                        setEtapa("confirmar");
                                        setCarregandoConfirmacao(true);

                                        if (apiVendas === API_LOCAL_VENDAS) {
                                            await preRegistrarVenda("dinheiro");
                                        }

                                        setCarregandoConfirmacao(false);
                                    }}


                                >
                                    Dinheiro
                                </button>


                                <button
                                    className="voltar"
                                    onClick={fechar}
                                    disabled={bloquearTudo}
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
                                    className="voltar"
                                    onClick={() => {
                                        setPixQr(null);
                                        setPixId(null);
                                        setVendaPId(null);
                                        setPagamento(null);
                                        setPixPago(false);
                                        setCarregandoPix(false);
                                        setCarregandoConfirmacao(false);
                                        setEtapa("metodo");
                                    }}

                                >
                                    Cancelar
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
                                    className={`confirmar ${carregandoConfirmacao || processando ? "btn-processando" : ""}`}
                                    onClick={confirmarPagamento}
                                    disabled={
                                        processando ||
                                        carregandoConfirmacao ||
                                        (pagamento === "pix" && !pixPago) ||
                                        (apiVendas === API_LOCAL_VENDAS && !vendaPId && pagamento !== "pix")
                                    }
                                >
                                    {carregandoConfirmacao
                                        ? "Preparando pagamento..."
                                        : processando
                                            ? "Processando..."
                                            : "Confirmar pagamento"}
                                </button>




                                <button
                                    className="voltar"
                                    onClick={() => setEtapa("metodo")}
                                    disabled={processando || carregandoConfirmacao}
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
