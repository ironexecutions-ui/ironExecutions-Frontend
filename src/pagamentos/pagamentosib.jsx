import React, { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { API_URL } from "../../config";
import "./pagamentosib.css";
import { useParams } from "react-router-dom";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

export default function PagamentosIB() {
    const { id } = useParams();

    const [aluguelId, setAluguelId] = useState("");
    const [dados, setDados] = useState(null);
    const [pix, setPix] = useState(null);
    const [erro, setErro] = useState("");
    const [processando, setProcessando] = useState(false);
    const [verificandoPix, setVerificandoPix] = useState(false);

    const emailPagador = "ironexecutions@gmail.com";
    function copiarPix() {
        if (!pix?.qr_code) return;

        navigator.clipboard.writeText(pix.qr_code);
        alert("Código PIX copiado");
    }

    // =============================
    // BUSCA AUTOMÁTICA VIA URL
    // =============================
    useEffect(() => {
        if (!id) return;

        setAluguelId(id);
        verificarPagamento(id); // 🔥 busca direta, sem depender do estado
    }, [id]);


    // Inicializa Mercado Pago
    useEffect(() => {
        if (!MP_PUBLIC_KEY) {
            setErro("Chave pública do Mercado Pago não configurada");
            return;
        }
        initMercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
    }, []);

    // =============================
    // VERIFICAR PAGAMENTO DISPONÍVEL
    // =============================
    async function verificarPagamento(idForcado = null) {
        const idBusca = idForcado ?? aluguelId;

        setErro("");
        setDados(null);
        setPix(null);
        setProcessando(true);

        if (!idBusca) {
            setErro("Informe o ID do serviço");
            setProcessando(false);
            return;
        }

        try {
            const r = await fetch(`${API_URL}/pagamentos/verificar/${idBusca}`);
            const j = await r.json();

            if (!j.disponivel) {
                setErro("Nenhum pagamento disponível");
                setProcessando(false);
                return;
            }

            setDados(j);
        } catch {
            setErro("Erro ao verificar pagamento");
        }

        setProcessando(false);
    }



    // =============================
    // PAGAMENTO CARTÃO
    // =============================
    async function processarPagamento({ selectedPaymentMethod, formData }) {
        if (processando) return;

        setProcessando(true);
        setErro("");

        try {
            const cpf = formData?.payer?.identification?.number;
            const token = formData?.token;

            if (!cpf) {
                setErro("CPF não recebido do Mercado Pago");
                setProcessando(false);
                return;
            }

            const payload = {
                pagamento_id: dados.pagamento_id,
                comercio_id: dados.comercio_id,
                valor: Number(dados.valor),
                payment_method_id: selectedPaymentMethod.id,
                email: emailPagador,
                cpf: cpf,
                token: token
            };

            const resp = await fetch(`${API_URL}/pagamentos/pagar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await resp.json();

            if (!resp.ok) {
                console.error(json);
                setErro("Pagamento recusado");
                setProcessando(false);
                return;
            }

            alert("Pagamento aprovado!");
            setDados(null);
            setAluguelId("");

        } catch (e) {
            console.error(e);
            setErro("Erro ao processar pagamento");
        }

        setProcessando(false);
    }

    // =============================
    // GERAR PIX
    // =============================
    async function pagarPix() {
        if (processando) return;

        setErro("");
        setPix(null);
        setProcessando(true);

        try {
            const r = await fetch(`${API_URL}/pagamentos/pagar-pix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pagamento_id: dados.pagamento_id,
                    comercio_id: dados.comercio_id,
                    valor: dados.valor,
                    email: emailPagador
                })
            });


            const j = await r.json();

            if (!r.ok) {
                console.error(j);
                setErro("Erro ao gerar PIX");
                setProcessando(false);
                return;
            }

            setPix(j);
            setVerificandoPix(true);

        } catch {
            setErro("Erro ao gerar PIX");
        }

        setProcessando(false);
    }

    // =============================
    // VERIFICAR STATUS PIX
    // =============================
    useEffect(() => {
        if (!pix?.mp_id || !verificandoPix) return;

        const interval = setInterval(async () => {
            try {
                const r = await fetch(`${API_URL}/pagamentos/status/${pix.mp_id}`);
                const j = await r.json();

                if (j.status === "approved") {
                    alert("PIX confirmado!");
                    clearInterval(interval);
                    setVerificandoPix(false);
                    setPix(null);
                    setDados(null);
                    setAluguelId("");
                }
            } catch {
                // ignora erro temporário
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [pix, verificandoPix]);
    // =============================
    // BUSCA AUTOMÁTICA AO DIGITAR OU VIA URL
    // =============================
    useEffect(() => {
        if (!aluguelId) return;
        if (processando) return;

        if (String(aluguelId).length < 2) return;

        const timer = setTimeout(() => {
            verificarPagamento();
        }, 500);

        return () => clearTimeout(timer);
    }, [aluguelId]);


    // =============================
    // RENDER
    // =============================
    return (
        <div className="pg-container">

            <h2>Pagamento do Serviço</h2>

            <input style={{ display: "none" }}
                className="pg-input"
                placeholder="ID do serviço"
                value={aluguelId}
                onChange={e => setAluguelId(e.target.value)}
            />




            {erro && <p className="pg-erro">{erro}</p>}

            {dados && (
                <div className="pg-box">

                    <p><strong>Valor:</strong> R$ {dados.valor}</p>
                    <p><strong>Mês:</strong> {new Date(dados.mes).toLocaleDateString("pt-BR")}</p>
                    {/* PIX */}
                    <button
                        className="pg-btn pix"
                        onClick={pagarPix}
                        disabled={processando}
                    >
                        Pagar com PIX
                    </button>
                    <br /><br /><br /><br />
                    {pix && (
                        <div className="pix-box">
                            <p>Escaneie o QR Code para pagar</p>

                            <img
                                src={`data:image/png;base64,${pix.qr_code_base64}`}
                                alt="PIX"
                            />

                            <p>Ou copie o código PIX abaixo</p>

                            <textarea
                                className="pix-texto"
                                rows={7}
                                readOnly
                                value={pix.qr_code}
                                onClick={() => {
                                    navigator.clipboard.writeText(pix.qr_code);
                                    alert("Código PIX copiado");
                                }}
                            />




                            <p className="aguarda-pix">Aguardando confirmação do pagamento...</p>
                        </div>
                    )}
                    {/* CARTÃO */}
                    <Payment
                        initialization={{ amount: Number(dados.valor) }}
                        customization={{
                            paymentMethods: {
                                creditCard: "all",
                                debitCard: "all"
                            }
                        }}
                        onSubmit={processarPagamento}
                    />




                    {processando && <p>Processando pagamento...</p>}
                </div>
            )}
            {processando && (
                <div className="pg-loading">
                    <div className="pg-loading-box">
                        <div className="pg-spinner"></div>
                        <p>Verificando pagamento…</p>
                    </div>
                </div>
            )}

        </div>
    );
}
