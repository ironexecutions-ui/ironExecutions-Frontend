import React, { useState, useEffect } from "react";
import "./modalpagamento.css";
import { API_URL } from "../../config";

export default function ModalPagamento({
    aberto,
    etapa,
    setEtapa,
    pix,
    onFechar,
    onConfirmarPagamento,
    selecionados,
    total,
    form,
    setForm,
    loading
}) {
    const [metodo, setMetodo] = useState("pix"); // pix | cartao
    const [statusPix, setStatusPix] = useState("aguardando");

    const [cartao, setCartao] = useState({
        numero: "",
        nome: "",
        validade: "",
        cvv: ""
    });

    // ===============================
    // RESET AO ABRIR MODAL
    // ===============================
    useEffect(() => {
        if (aberto) {
            setStatusPix("aguardando");
            setMetodo("pix");
            setCartao({
                numero: "",
                nome: "",
                validade: "",
                cvv: ""
            });
        }
    }, [aberto]);

    // ===============================
    // POLLING PIX
    // ===============================
    useEffect(() => {
        if (!aberto || etapa !== "pix" || !pix?.id) return;

        const interval = setInterval(async () => {
            try {
                const r = await fetch(
                    `${API_URL}/rifa/pagamento/status/${pix.id}`
                );
                const json = await r.json();

                if (json.status === "approved") {
                    setStatusPix("pago");
                    clearInterval(interval);
                }
            } catch { }
        }, 3000);

        return () => clearInterval(interval);
    }, [aberto, etapa, pix]);

    if (!aberto) return null;

    // ===============================
    // VALIDAR CARTÃO
    // ===============================
    const cartaoValido =
        cartao.numero.length >= 13 &&
        cartao.nome.length > 3 &&
        cartao.validade.length === 5 &&
        cartao.cvv.length >= 3;

    return (
        <div
            className="rif-mp-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onFechar();
                }
            }}
        >
            <div
                className="rif-mp-modal"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ===== DADOS ===== */}
                {etapa === "dados" && (
                    <div className="rif-mp-etapa">
                        <h3>Dados do comprador</h3>

                        <input
                            value={form.nome}
                            placeholder="Nome"
                            onChange={e => setForm({ ...form, nome: e.target.value })}
                        />

                        <input
                            value={form.email}
                            placeholder="Email"
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />

                        <input
                            value={form.whatsapp}
                            placeholder="WhatsApp"
                            onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                        />

                        <textarea
                            value={form.mensagem}
                            placeholder="Mensagem (opcional)"
                            onChange={e => setForm({ ...form, mensagem: e.target.value })}
                        />

                        <button
                            disabled={!form.nome || !form.email || !form.whatsapp}
                            onClick={() => setEtapa("confirmacao")}
                        >
                            Confirmar dados
                        </button>

                        <button onClick={onFechar}>Cancelar</button>
                    </div>
                )}

                {/* ===== CONFIRMAÇÃO ===== */}
                {etapa === "confirmacao" && (
                    <div className="rif-mp-etapa">
                        <h3>Confirmação</h3>

                        <p><b>Nome:</b> {form.nome}</p>
                        <p><b>Email:</b> {form.email}</p>
                        <p><b>WhatsApp:</b> {form.whatsapp}</p>
                        <p><b>Números:</b> {selecionados.join(", ")}</p>
                        <p><b>Total:</b> R$ {total}</p>

                        <div className="rif-mp-metodo">
                            <button
                                className={metodo === "pix" ? "ativo" : ""}
                                onClick={() => setMetodo("pix")}
                            >
                                PIX
                            </button>

                            <button
                                className={metodo === "cartao" ? "ativo" : ""}
                                onClick={() => setMetodo("cartao")}
                            >
                                Cartão
                            </button>
                        </div>

                        <button
                            disabled={loading}
                            onClick={() => {
                                if (metodo === "pix") {
                                    onConfirmarPagamento();
                                } else {
                                    setEtapa("cartao");
                                }
                            }}
                        >
                            {loading ? "Processando..." : "Ir para pagamento"}
                        </button>

                    </div>
                )}

                {/* ===== PIX ===== */}
                {etapa === "pix" && metodo === "pix" && pix && (
                    <div className="rif-mp-etapa">
                        {statusPix === "aguardando" && (
                            <>
                                <h3>Pagamento via PIX</h3>
                                <p>Aguardando pagamento...</p>

                                <img
                                    src={`data:image/png;base64,${pix.qr_code_base64}`}
                                    alt="PIX"
                                />

                                <textarea readOnly value={pix.qr_code} />
                            </>
                        )}

                        {statusPix === "pago" && (
                            <>
                                <h3>Pagamento confirmado</h3>
                                <p>Obrigado por participar da rifa.</p>

                                <button onClick={() => window.location.reload()}>
                                    Fechar
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ===== CARTÃO ===== */}
                {etapa === "cartao" && metodo === "cartao" && (
                    <div className="rif-mp-etapa">
                        <h3>Pagamento com cartão</h3>

                        <input
                            placeholder="Número do cartão"
                            value={cartao.numero}
                            onChange={e =>
                                setCartao({ ...cartao, numero: e.target.value.replace(/\D/g, "") })
                            }
                        />

                        <input
                            placeholder="Nome no cartão"
                            value={cartao.nome}
                            onChange={e =>
                                setCartao({ ...cartao, nome: e.target.value })
                            }
                        />

                        <input
                            placeholder="Validade (MM/AA)"
                            value={cartao.validade}
                            onChange={e =>
                                setCartao({ ...cartao, validade: e.target.value })
                            }
                        />

                        <input
                            placeholder="CVV"
                            value={cartao.cvv}
                            onChange={e =>
                                setCartao({ ...cartao, cvv: e.target.value.replace(/\D/g, "") })
                            }
                        />

                        <button
                            disabled={!cartaoValido}
                            onClick={() => {
                                console.log("DADOS DO CARTÃO:", cartao);
                                alert("Dados do cartão capturados. Backend vem depois.");
                            }}
                        >
                            Confirmar pagamento
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
