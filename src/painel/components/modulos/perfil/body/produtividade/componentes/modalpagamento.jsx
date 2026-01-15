import React, { useState, useEffect } from "react";
import { API_URL } from "../../../../../../../../config";
import "./modalpagamento.css";
import { useVenda } from "./vendaprovider";

export default function ModalPagamento({ total, fechar }) {
    const [infoMaquininha, setInfoMaquininha] = useState(null);
    const [erroMaquininha, setErroMaquininha] = useState(null);
    const [forcarManual, setForcarManual] = useState(false);
    const [usaMaquininha, setUsaMaquininha] = useState(false);

    const [etapa, setEtapa] = useState("metodo");
    const [pagamento, setPagamento] = useState(null);
    const [valorRecebido, setValorRecebido] = useState("");
    const [sucesso, setSucesso] = useState(false);
    const [processando, setProcessando] = useState(false);
    const [fechando, setFechando] = useState(false);
    const [pixQr, setPixQr] = useState(null);
    const [pixId, setPixId] = useState(null);
    const [pixPago, setPixPago] = useState(false);
    const [carregandoPix, setCarregandoPix] = useState(false);
    const bloquearTudo = carregandoPix || processando;

    async function verificarStatusPix() {
        if (!pixId || pixPago) return;

        try {
            const r = await fetch(
                `${API_URL}/vendas/pix/status/${pixId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const j = await r.json();
            if (j.status === "approved") {
                setPixPago(true);
                setPagamento("pix");
                finalizarVendaPix(); // 🔥 ISSO REGISTRA A VENDA


            }

        } catch {
            // silencioso
        }
    }
    useEffect(() => {
        if (etapa !== "pix_mp") return;
        if (!pixId || pixPago) return;

        const interval = setInterval(() => {
            verificarStatusPix();
        }, 3000);

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

        const resp = await fetch(`${API_URL}/vendas/finalizar`, {
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

        if (produtos.length === 0) {
            alert("Nenhum produto na venda");
            setProcessando(false);
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/vendas/finalizar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    pagamento,
                    valor: total,
                    produtos,
                    forcar_manual: forcarManual,
                    cpf: usarCpf ? cpf : null
                })
            });

            if (!resp.ok) {
                const erro = await resp.json().catch(() => ({}));

                if (erro.detail && erro.detail.includes("Maquininha não conectada.")) {
                    setErroMaquininha(erro.detail);
                    setProcessando(false);
                    return;
                }

                setErroMaquininha("Pagamento recusado ou erro ao finalizar venda");
                setProcessando(false);
                return;
            }

            const data = await resp.json();
            if (data.maquininha && data.maquininha.apelido) {
                setInfoMaquininha(data.maquininha);
            }

            setSucesso(true);

            setTimeout(() => {
                setFechando(true);
                setTimeout(() => {
                    limparVenda();
                    fechar();
                }, 400);
            }, 2000);

        } catch {
            alert("Erro de conexão com o servidor");
            setProcessando(false);
        }
    }

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
                                    onClick={() => { setPagamento("debito"); setEtapa("confirmar"); }}
                                >
                                    Cartão Débito
                                </button>

                                <button
                                    disabled={bloquearPagamento || bloquearTudo}
                                    onClick={() => { setPagamento("credito"); setEtapa("confirmar"); }}
                                >
                                    Cartão Crédito
                                </button>


                                <button
                                    disabled={bloquearPagamento || bloquearTudo}
                                    onClick={async () => {

                                        if (bloquearTudo) return;

                                        setCarregandoPix(true);

                                        try {
                                            const r = await fetch(`${API_URL}/comercio/pix/ativo`, {
                                                headers: {
                                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                                }
                                            });

                                            const j = await r.json();

                                            if (j.ativo) {
                                                const pix = await fetch(`${API_URL}/vendas/pix/gerar`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${localStorage.getItem("token")}`
                                                    },
                                                    body: JSON.stringify({ valor: total })
                                                }).then(r => r.json());

                                                setPixQr(pix.qr_code_base64);
                                                setPixId(pix.id);
                                                setPagamento("pix");
                                                setEtapa("pix_mp");
                                                return;
                                            }

                                            setPagamento("pix");
                                            setEtapa("confirmar");

                                        } catch {
                                            alert("Erro ao gerar Pix. Tente novamente.");
                                        } finally {
                                            setCarregandoPix(false);
                                        }
                                    }}
                                >
                                    {carregandoPix ? "Gerando Pix..." : "Pix"}
                                </button>




                                <button
                                    disabled={bloquearPagamento || bloquearTudo}
                                    onClick={() => { setPagamento("dinheiro"); setEtapa("confirmar"); }}
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
                                        setPagamento(null);
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
                                    className="confirmar"
                                    onClick={confirmarPagamento}
                                    disabled={processando}
                                >
                                    {processando ? "Processando..." : "Confirmar pagamento"}
                                </button>

                                <button
                                    className="voltar"
                                    onClick={() => setEtapa("metodo")}
                                    disabled={processando}
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
