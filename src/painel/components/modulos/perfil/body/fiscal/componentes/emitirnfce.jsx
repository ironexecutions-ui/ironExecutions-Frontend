import React, { useEffect, useState } from "react";
import { API_URL } from ".././../../../../../../../config";
import "./emitirnfce.css";

export default function EmitirNfce() {

    const [vendas, setVendas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const token = localStorage.getItem("token");
    const [dataFiltro, setDataFiltro] = useState("");
    const [horaMinima, setHoraMinima] = useState("");

    useEffect(() => {
        carregar();
    }, []);

    function carregar() {
        setCarregando(true);

        fetch(`${API_URL}/vendas/nfce-pendentes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(r => r.json())
            .then(d => {
                if (Array.isArray(d)) {
                    setVendas(d);
                } else {
                    setVendas([]);
                }
                setCarregando(false);
            })
            .catch(() => {
                setVendas([]);
                setCarregando(false);
            });

    }

    function emitir(vendaId) {
        if (!window.confirm(`Emitir NFC-e da venda ${vendaId}?`)) return;

        fetch(`${API_URL}/vendas/${vendaId}/emitir-nfce`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || data.erro || "Erro desconhecido ao emitir NFC-e");
                }

                return data;
            })
            .then((data) => {
                alert(data.mensagem || "NFC-e emitida com sucesso");
                carregar();
            })
            .catch((err) => {
                alert(`Falha ao emitir NFC-e:\n${err.message}`);
            });
    }

    function formatarHora(hora) {
        if (!hora) return "—";

        const h = hora.toString().padStart(6, "0");

        const hh = h.slice(0, 2);
        const mm = h.slice(2, 4);
        const ss = h.slice(4, 6);

        return `${hh}:${mm}:${ss}`;
    }
    function horaParaSegundos(hora) {
        if (!hora) return 0;

        const h = hora.toString().padStart(6, "0");
        const hh = parseInt(h.slice(0, 2), 10);
        const mm = parseInt(h.slice(2, 4), 10);
        const ss = parseInt(h.slice(4, 6), 10);

        return hh * 3600 + mm * 60 + ss;
    }

    if (carregando) {
        return <p>Carregando vendas pendentes...</p>;
    }

    if (vendas.length === 0) {
        return <p>Nenhuma venda pendente de NFC-e.</p>;
    }
    const vendasFiltradas = vendas.filter(v => {

        // filtro por data exata
        if (dataFiltro && v.data !== dataFiltro) {
            return false;
        }

        // filtro por hora mínima
        if (horaMinima) {
            const horaVenda = horaParaSegundos(v.hora);
            const horaFiltro = horaParaSegundos(horaMinima.replace(":", "") + "00");

            if (horaVenda < horaFiltro) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="emitir-nfce">
            <h4>Vendas pendentes de NFC-e</h4>
            <div className="filtros-nfce">
                <div>
                    <label>Data</label>
                    <input
                        type="date"
                        value={dataFiltro}
                        onChange={e => setDataFiltro(e.target.value)}
                    />
                </div>

                <div>
                    <label>Hora mínima</label>
                    <input
                        type="time"
                        value={horaMinima}
                        onChange={e => setHoraMinima(e.target.value)}
                    />
                </div>

                <button
                    className="btn-limpar"
                    onClick={() => {
                        setDataFiltro("");
                        setHoraMinima("");
                    }}
                >
                    Limpar filtros
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Valor</th>
                        <th>Pagamento</th>
                        <th>Data</th>
                        <th>Hora</th>
                        <th>Comanda</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {vendasFiltradas.map(v => (
                        <tr key={v.id}>
                            <td>{v.id}</td>
                            <td>R$ {Number(v.valor_pago).toFixed(2)}</td>
                            <td>{v.pagamento}</td>
                            <td>{v.data}</td>
                            <td>{formatarHora(v.hora)}</td>
                            <td>
                                {v.comanda ? (
                                    <button
                                        className="btn-comanda"
                                        onClick={() => window.open(v.comanda, "_blank")}
                                    >
                                        Ver comanda
                                    </button>
                                ) : (
                                    <span className="sem-comanda">—</span>
                                )}
                            </td>
                            <td>
                                <button onClick={() => emitir(v.id)}>
                                    Emitir NFC-e
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
