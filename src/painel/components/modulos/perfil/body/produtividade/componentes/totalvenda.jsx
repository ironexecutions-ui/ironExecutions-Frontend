import React from "react";
import "./totalvenda.css";

export default function TotalVenda({ itens }) {

    const total = itens.reduce((soma, p) => soma + Number(p.preco), 0);

    return (
        <div className="total-box">

            <div className="total-valor">
                R$ {total.toFixed(2)}
            </div>
        </div>
    );
}
