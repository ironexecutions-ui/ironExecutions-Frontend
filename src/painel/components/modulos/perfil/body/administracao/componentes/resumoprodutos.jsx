import React, { useEffect, useState } from "react";
import FormularioProduto from "./formularioproduto";
import { API_URL } from ".././../../../../../../../config";
import "./resumoprodutos.css";

export default function ResumoProdutos() {

    const [lista, setLista] = useState([]);
    const [modo, setModo] = useState("lista");
    const [editar, setEditar] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [confirmarApagar, setConfirmarApagar] = useState(null);

    const [limite, setLimite] = useState(30);

    const token = localStorage.getItem("token");

    async function carregar() {
        setCarregando(true);

        const resp = await fetch(`${API_URL}/admin/produtos-servicos`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const dados = await resp.json();
        setLista(dados);
        setCarregando(false);
    }

    useEffect(() => { carregar(); }, []);

    function colunaUnidade(item) {
        if (item.produto_id > 0)
            return `${item.unidades}x ${item.nome_produto_base}`;
        if (item.unidade) return item.unidade;
        return item.tempo_servico;
    }

    if (modo !== "lista") {
        return (
            <FormularioProduto
                item={editar}
                voltar={() => {
                    setModo("lista");
                    setEditar(null);
                    setLimite(30);
                    carregar();
                }}
            />
        );
    }

    const itensVisiveis = lista.slice(0, limite);
    const temMais = lista.length > limite;

    return (
        <div className="resumo-produtos">
            <div className="topo">
                <h4>Produtos e Serviços</h4>
                <button onClick={() => setModo("novo")}>Adicionar</button>
            </div>

            <div className="conteudo-scroll">
                {carregando ? (
                    <div className="loading-area">
                        <div className="spinner"></div>
                        <span style={{ color: "white" }} >Carregando produtos...</span>
                    </div>
                ) : (
                    <>
                        <div className="lista-cards">
                            {itensVisiveis.map(item => (
                                <div className="card-produto" key={item.id}>
                                    <div onClick={() => {
                                        setEditar(item);
                                        setModo("editar");
                                    }} className="card-info">
                                        <h5>{item.nome}</h5>

                                        <span className="sub">
                                            {colunaUnidade(item)} · {item.categoria}
                                        </span>

                                        <div className="precos">
                                            <div>
                                                <label>Preço </label>
                                                <strong>R$ {item.preco}</strong>
                                            </div>
                                            <div>
                                                <label>Recebido </label>
                                                <strong>R$ {item.preco_recebido}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-acoes">

                                        <button
                                            className="apagar"
                                            onClick={() => setConfirmarApagar(item)}
                                        >
                                            Apagar
                                        </button>

                                    </div>
                                </div>
                            ))}
                        </div>

                        {temMais && (
                            <div className="ver-mais-area">
                                <button
                                    className="ver-mais"
                                    onClick={() => setLimite(l => l + 30)}
                                >
                                    Ver mais
                                </button>
                                <span>
                                    Mostrando {itensVisiveis.length} de {lista.length}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
            {confirmarApagar && (
                <div className="modal-overlay">
                    <div className="modal-confirmacao">
                        <h5>Confirmar exclusão</h5>
                        <p>
                            Tem certeza que deseja apagar
                            <strong> {confirmarApagar.nome}</strong>?
                        </p>

                        <div className="modal-acoes">
                            <button
                                className="cancelar"
                                onClick={() => setConfirmarApagar(null)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="confirmar"
                                onClick={apagarConfirmado}
                            >
                                Apagar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

    async function apagarConfirmado() {
        if (!confirmarApagar) return;

        const id = confirmarApagar.id;

        await fetch(`${API_URL}/admin/produtos-servicos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        setConfirmarApagar(null);
        carregar();
    }

}
