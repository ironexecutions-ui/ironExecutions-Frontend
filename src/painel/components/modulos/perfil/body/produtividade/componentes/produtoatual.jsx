import React from "react";
import "./produtoatual.css";

export default function ProdutoAtual({ produto }) {

    if (!produto) {
        return (
            <div className="produto-atual-box">
                <h3 className="produto-atual-titulo">Produto atual</h3>
                <p className="produto-atual-vazio">Nenhum produto selecionado</p>
            </div>
        );
    }

    return (
        <div className="produto-atual-box">

            <div className="produto-atual-conteudo">

                <div className="produto-atual-esq">
                    {produto.imagem_url && (
                        <img
                            src={produto.imagem_url}
                            alt=""
                            className="produto-atual-img"
                        />
                    )}
                </div>

                <div className="produto-atual-dir">
                    <p className="produto-atual-nome"><strong>{produto.nome}</strong></p>

                    <p className="produto-atual-preco">
                        Preço R$ <span> {Number(produto.preco).toFixed(2)} </span>
                    </p>

                    <p className="produto-atual-und">
                        {produto.unidade || produto.tempo_servico}
                    </p>
                </div>

            </div>
        </div>
    );

}
