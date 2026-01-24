import React, { useState, useMemo } from "react";
import "./rifacompras.css";
import { API_URL } from "../../config";
import ModalPagamento from "./modalpagamento";

export default function RifaCompras() {
    const [rifaId, setRifaId] = useState("");
    const [rifa, setRifa] = useState(null);
    const [comprados, setComprados] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalAberto, setModalAberto] = useState(false);
    const [etapa, setEtapa] = useState("dados"); // dados | confirmacao | pix
    const [pix, setPix] = useState(null);

    const [form, setForm] = useState({
        nome: "",
        email: "",
        whatsapp: "",
        mensagem: ""
    });

    // ===============================
    // BUSCAR RIFA
    // ===============================
    async function buscarRifa() {
        setErro("");
        setRifa(null);
        setSelecionados([]);
        setComprados([]);

        if (!rifaId) {
            setErro("Informe o ID da rifa");
            return;
        }

        try {
            setLoading(true);

            const r = await fetch(`${API_URL}/rifa/${rifaId}`);
            if (!r.ok) throw new Error();

            const data = await r.json();
            setRifa(data);

            const c = await fetch(`${API_URL}/rifa/${rifaId}/comprados`);
            const nums = await c.json();
            setComprados(nums);
        } catch {
            setErro("Rifa não encontrada");
        } finally {
            setLoading(false);
        }
    }

    // ===============================
    // GERAR NÚMEROS
    // ===============================
    const numerosOrdenados = useMemo(() => {
        if (!rifa?.numeros) return [];
        const [inicio, fim] = rifa.numeros.split("-").map(Number);
        return Array.from(
            { length: fim - inicio + 1 },
            (_, i) => inicio + i
        );
    }, [rifa]);

    // ===============================
    // SELEÇÃO DE NÚMEROS
    // ===============================
    function toggleNumero(n) {
        if (comprados.includes(n)) return;

        setSelecionados(prev =>
            prev.includes(n)
                ? prev.filter(x => x !== n)
                : [...prev, n]
        );
    }

    // ===============================
    // TOTAL
    // ===============================
    const total = rifa
        ? (selecionados.length * rifa.preco).toFixed(2)
        : "0.00";

    // ===============================
    // VALIDAÇÃO
    // ===============================
    function validarFormulario() {
        if (!form.nome || !form.email || !form.whatsapp) {
            alert("Preencha nome, email e WhatsApp");
            return false;
        }

        if (selecionados.length === 0) {
            alert("Selecione pelo menos um número");
            return false;
        }

        return true;
    }

    // ===============================
    // CONFIRMAR PAGAMENTO
    // ===============================
    async function confirmarPagamento() {
        if (!validarFormulario()) return;

        try {
            setLoading(true);

            // 1️⃣ CRIA COMPRA
            const r = await fetch(`${API_URL}/rifa/${rifa.id}/comprar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    numeros: selecionados,
                    ...form
                })
            });

            const compra = await r.json();

            if (!r.ok) {
                alert(
                    compra?.numeros
                        ? `Números indisponíveis: ${compra.numeros.join(", ")}`
                        : "Erro ao criar compra"
                );
                return;
            }

            // 2️⃣ CRIA PIX
            const p = await fetch(
                `${API_URL}/rifa/${rifa.id}/pagamento/pix`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        compra_id: compra.compra_id,
                        total: compra.total,
                        email: form.email
                    })
                }
            );

            const pixData = await p.json();

            if (!p.ok) {
                alert(pixData?.erro || "Erro ao gerar PIX");
                return;
            }

            // 3️⃣ MOSTRA PIX
            setPix(pixData);
            setEtapa("pix");

        } catch {
            alert("Erro ao iniciar pagamento");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rif-compra-container">
            <h2 className="rif-titulo">Comprar Rifa</h2>

            <div className="rif-busca">
                <input
                    type="number"
                    className="rif-busca-input"
                    placeholder="Digite o ID da rifa"
                    value={rifaId}
                    onChange={e => setRifaId(e.target.value)}
                />
                <button
                    className="rif-busca-btn"
                    onClick={buscarRifa}
                    disabled={loading}
                >
                    {loading ? "Buscando..." : "Buscar"}
                </button>
            </div>

            {erro && <p className="rif-erro">{erro}</p>}

            {rifa && (
                <>
                    <h3 className="rif-nome">{rifa.nome}</h3>

                    {rifa.premio && (
                        <div className="rif-premio">
                            <strong>Prêmio:</strong> {rifa.premio}
                        </div>
                    )}

                    <div className="rif-fotos">
                        {rifa.fotos.map((f, i) => (
                            <img key={i} src={f} alt="rifa" className="rif-foto" />
                        ))}
                    </div>

                    <p className="rif-info">
                        Números: {rifa.numeros} | Preço por número: R$ {rifa.preco}
                    </p>

                    <div className="rif-numeros">
                        {numerosOrdenados.map(n => (
                            <div
                                key={n}
                                className={`rif-numero
                                    ${comprados.includes(n) ? "rif-comprado" : ""}
                                    ${selecionados.includes(n) ? "rif-selecionado" : ""}
                                `}
                                onClick={() => toggleNumero(n)}
                            >
                                {n}
                            </div>
                        ))}
                    </div>

                    {selecionados.length > 0 && (
                        <button
                            className="rif-comprar-btn"
                            onClick={() => {
                                setForm({
                                    nome: "",
                                    email: "",
                                    whatsapp: "",
                                    mensagem: ""
                                });
                                setPix(null);
                                setEtapa("dados");
                                setModalAberto(true);
                            }}
                        >
                            Comprar ({selecionados.length}) | R$ {total}
                        </button>
                    )}
                </>
            )}

            <ModalPagamento
                aberto={modalAberto}
                etapa={etapa}
                setEtapa={setEtapa}
                pix={pix}
                onFechar={() => setModalAberto(false)}
                onConfirmarPagamento={confirmarPagamento}
                selecionados={selecionados}
                total={total}
                form={form}
                setForm={setForm}
                loading={loading}
            />
        </div>
    );
}
