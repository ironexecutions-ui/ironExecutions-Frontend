import React, { useState } from "react";
import { API_URL } from "../../../../../../../../config";
import "./modalpagamento.css";
import { useVenda } from "./vendaprovider";

export default function ModalPagamento({ total, fechar }) {

    const [etapa, setEtapa] = useState("metodo");
    const [pagamento, setPagamento] = useState(null);
    const [valorRecebido, setValorRecebido] = useState("");
    const [sucesso, setSucesso] = useState(false);
    const { itens, limparVenda } = useVenda();
    const [fechando, setFechando] = useState(false);

    const troco =
        pagamento === "dinheiro"
            ? Math.max(Number(valorRecebido || 0) - total, 0)
            : 0;


    async function confirmarPagamento() {
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
            return;
        }

        const resp = await fetch(`${API_URL}/vendas/finalizar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                pagamento,
                valor: total,
                produtos
            })
        });

        if (!resp.ok) {
            alert("Erro ao finalizar venda");
            return;
        }

        const data = await resp.json();

        if (data.impressao === "direta") {
            try {
                await fetch("http://localhost:3333/print", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: data.comanda })
                });
            } catch {
                alert("Node Printer não está rodando");
            }

        } else if (data.impressao === "download") {

            const respPdf = await fetch(data.comanda, {
                cache: "no-store"
            });

            if (!respPdf.ok) {
                alert("Erro ao baixar comanda");
                return;
            }

            const blob = await respPdf.blob();

            // ===== DATA E HORA BRASIL =====
            const agora = new Date();

            const dataStr = agora.toLocaleDateString("pt-BR").replace(/\//g, "-");
            const hora = agora.toLocaleTimeString("pt-BR", { hour12: false }).replace(/:/g, "-");

            const nomeArquivo = `comanda_${dataStr}_${hora}.pdf`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = nomeArquivo;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        }

        else {
            alert("Erro ao processar a comanda");
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

                                <button onClick={() => { setPagamento("debito"); setEtapa("confirmar"); }}>
                                    Cartão Débito
                                </button>

                                <button onClick={() => { setPagamento("credito"); setEtapa("confirmar"); }}>
                                    Cartão Crédito
                                </button>

                                <button onClick={() => { setPagamento("pix"); setEtapa("confirmar"); }}>
                                    Pix
                                </button>

                                <button onClick={() => { setPagamento("dinheiro"); setEtapa("confirmar"); }}>
                                    Dinheiro
                                </button>

                                <button className="voltar" onClick={fechar}>
                                    Voltar
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

                                <button className="confirmar" onClick={confirmarPagamento}>
                                    Confirmar pagamento
                                </button>

                                <button className="voltar" onClick={() => setEtapa("metodo")}>
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
