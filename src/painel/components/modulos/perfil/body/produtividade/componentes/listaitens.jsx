import React from "react";
import "./listaitens.css";

export default function ListaItens({ itens }) {

    return (
        <div className="lista-itens-box">

            {itens.length === 0 && (
                <p className="lista-vazio">Nenhum item adicionado</p>
            )}

            <div className="lista-itens-conteudo">
                {itens.map((item, i) => (
                    <div key={i} className="item-linha">
                        <span className="item-nome">{item.nome}</span>
                        <strong className="item-preco">
                            R$ {Number(item.preco).toFixed(2)}
                        </strong>
                    </div>
                ))}
            </div>
        </div>
    );
}
