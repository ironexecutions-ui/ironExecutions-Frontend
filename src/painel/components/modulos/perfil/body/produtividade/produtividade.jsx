import React, { useState } from "react";

import BuscarProduto from "./componentes/buscarproduto";
import ProdutoAtual from "./componentes/produtoatual";
import ListaItens from "./componentes/listaitens";
import TotalVenda from "./componentes/totalvenda";

import "./produtividade.css";

export default function Produtividade() {

    const [produtoAtual, setProdutoAtual] = useState(null);
    const [itens, setItens] = useState([]);

    function adicionarItem(item) {
        setItens(prev => [...prev, item]);
    }

    return (
        <div className="prod-container">

            <div className="linha-superior">
                <div className="prod-card buscar">
                    <BuscarProduto
                        setProdutoAtual={setProdutoAtual}
                        adicionarItem={adicionarItem}
                    />
                </div>

                <div className="prod-card itens">
                    <ListaItens itens={itens} />
                </div>
            </div>

            <div className="linha-inferior">
                <div className="prod-card atual">
                    <ProdutoAtual produto={produtoAtual} />
                </div>

                <div className="prod-card total">
                    <TotalVenda itens={itens} />
                </div>
            </div>

        </div>
    );
}
