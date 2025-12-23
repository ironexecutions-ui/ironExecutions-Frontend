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
    // IMPRIMIR SEM ABRIR O PDF NA TELA
    function imprimirPDF(url) {
        const iframe = document.createElement("iframe");

        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";

        iframe.src = url;

        iframe.onload = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        };

        document.body.appendChild(iframe);
    }

    async function confirmarPagamento() {

        // abre a aba IMEDIATAMENTE no clique
        const janelaImpressao = window.open("", "_blank");

        if (!janelaImpressao) {
            alert("Permita pop-ups para imprimir a comanda");
            return;
        }

        janelaImpressao.document.write("<p>Gerando comanda...</p>");

        const produtos = itens.map(i => ({
            id: i.id,
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
            subtotal: i.subtotal,
            unidade: i.unidade
        }));

        if (produtos.length === 0) {
            janelaImpressao.close();
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
            janelaImpressao.close();
            alert("Erro ao finalizar venda");
            return;
        }

        const data = await resp.json();

        // agora sim, redireciona a aba já aberta
        janelaImpressao.location.href = data.comanda;

        janelaImpressao.onload = () => {
            janelaImpressao.focus();
            janelaImpressao.print();
        };

        // feedback visual
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
