import React, { useState, useRef } from "react";
import { API_URL } from "../../../../../../../../config";
import "./buscarproduto.css";

export default function BuscarProduto({ setProdutoAtual, adicionarItem }) {

    const [texto, setTexto] = useState("");
    const [sugestoes, setSugestoes] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const timeoutRef = useRef(null);

    async function buscar(valor) {

        setTexto(valor);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!valor.trim()) {
            setSugestoes([]);
            return;
        }

        timeoutRef.current = setTimeout(async () => {

            setCarregando(true);

            try {
                const token = localStorage.getItem("token");

                const resp = await fetch(
                    `${API_URL}/api/produtos_servicos/buscar?query=${encodeURIComponent(valor)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const dados = resp.ok ? await resp.json() : [];
                setSugestoes(dados);

            } catch (e) {
                setSugestoes([]);
            }

            setCarregando(false);

        }, 300); // debounce suave
    }

    function selecionar(produto) {
        setProdutoAtual(produto);
        adicionarItem(produto);
        setTexto("");
        setSugestoes([]);
    }

    return (
        <div className="buscar-box">

            <label className="buscar-titulo">Buscar produto</label>

            <div className="buscar-container">

                <input
                    className="buscar-input"
                    type="text"
                    placeholder="Digite nome, código de barras ou QRCode"
                    value={texto}
                    onChange={(e) => buscar(e.target.value)}
                />

                {carregando && (
                    <div className="loader"></div>
                )}

                {sugestoes.length > 0 && (
                    <div className="sugestoes-box">
                        {sugestoes.map((p) => (
                            <div key={p.id} className="sug-item" onClick={() => selecionar(p)}>

                                <img
                                    src={p.imagem_url || "https://via.placeholder.com/60"}
                                    alt="produto"
                                    className="sug-img"
                                />

                                <div className="sug-info">
                                    <p className="sug-nome">{p.nome}</p>
                                    <span className="sug-sub">{p.unidade || p.tempo_servico || ""}</span>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>
    );
}
