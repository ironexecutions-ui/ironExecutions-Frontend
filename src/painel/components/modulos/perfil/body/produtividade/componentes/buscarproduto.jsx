import React, { useState, useRef, useEffect } from "react";
import { API_URL } from "../../../../../../../../config";
import { useVenda } from "./vendaprovider";
import "./buscarproduto.css";
import { createPortal } from "react-dom";

export default function BuscarProduto() {

    const { setProdutoAtual, adicionarItem, limparBusca, setLimparBusca } = useVenda();

    const [texto, setTexto] = useState("");
    const [sugestoes, setSugestoes] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const inputRef = useRef(null);
    const itensRef = useRef([]);
    const timeoutRef = useRef(null);

    const [indiceAtivo, setIndiceAtivo] = useState(-1);
    const [tema, setTema] = useState("escuro");
    useEffect(() => {
        if (limparBusca) {
            setTexto("");
            setSugestoes([]);
            setIndiceAtivo(-1);
            setProdutoAtual(null);

            if (inputRef.current) {
                inputRef.current.blur();
            }

            setLimparBusca(false);
        }
    }, [limparBusca]);

    /* reset índice ao mudar sugestões */
    useEffect(() => {
        setIndiceAtivo(-1);
        itensRef.current = [];
    }, [sugestoes]);

    /* scroll acompanha setas */
    useEffect(() => {
        if (indiceAtivo < 0) return;

        const el = itensRef.current[indiceAtivo];
        if (!el) return;

        el.scrollIntoView({
            block: "nearest",
            behavior: "smooth"
        });
    }, [indiceAtivo]);

    /* ===============================
       DEFINIR TEMA LOCAL
    =============================== */
    useEffect(() => {
        async function definirTema() {
            let modoCliente = null;

            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const resp = await fetch(
                        `${API_URL}/api/clientes/modo`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (resp.ok) {
                        const data = await resp.json();
                        modoCliente = data.modo;
                    }
                }
            } catch { }

            if (modoCliente === 1) return setTema("escuro");
            if (modoCliente === 2) return setTema("claro");

            const hora = new Date().getHours();
            setTema(hora >= 18 || hora < 6 ? "escuro" : "claro");
        }

        definirTema();
    }, []);

    /* ===============================
       BUSCAR PRODUTO
    =============================== */
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

            } catch {
                setSugestoes([]);
            }

            setCarregando(false);

        }, 300);
    }

    function selecionar(produto) {
        setProdutoAtual(produto);
        adicionarItem(produto);
        setTexto("");
        setSugestoes([]);
    }

    function handleKeyDown(e) {

        if (!sugestoes.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndiceAtivo(prev =>
                prev < sugestoes.length - 1 ? prev + 1 : 0
            );
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndiceAtivo(prev =>
                prev > 0 ? prev - 1 : sugestoes.length - 1
            );
        }

        if (e.key === "Enter" && indiceAtivo >= 0) {
            e.preventDefault();
            selecionar(sugestoes[indiceAtivo]);
        }

        if (e.key === "Escape") {
            setSugestoes([]);
            setIndiceAtivo(-1);
        }
    }

    function getPosicao() {
        if (!inputRef.current) return null;

        const rect = inputRef.current.getBoundingClientRect();

        return {
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
            width: rect.width
        };
    }

    return (
        <div className={`buscar-box tema-${tema}`}>

            <label className="buscar-titulo">Buscar produto</label>

            <div className="buscar-container">

                <input
                    ref={inputRef}
                    className="buscar-input"
                    type="text"
                    placeholder="Digite nome, código de barras ou QRCode"
                    value={texto}
                    onChange={(e) => buscar(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                {carregando && <div className="loader"></div>}

                {texto.trim() !== "" && sugestoes.length > 0 && inputRef.current && createPortal(
                    (() => {
                        const pos = getPosicao();
                        if (!pos) return null;

                        return (
                            <div
                                className="sugestoes-box portal"
                                style={{
                                    top: pos.top,
                                    left: pos.left,
                                    width: pos.width
                                }}
                            >
                                {sugestoes.map((p, index) => (
                                    <div
                                        key={p.id}
                                        ref={el => itensRef.current[index] = el}
                                        className={`sug-item ${index === indiceAtivo ? "ativo" : ""}`}
                                        onClick={() => selecionar(p)}
                                    >
                                        <img
                                            src={p.imagem_url || "https://via.placeholder.com/60"}
                                            alt=""
                                            className="sug-img"
                                        />

                                        <div className="sug-info">
                                            <p className="sug-nome">{p.nome}</p>
                                            <span className="sug-sub">
                                                {p.unidade || p.tempo_servico || ""}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })(),
                    document.body
                )}

            </div>
        </div>
    );
}
