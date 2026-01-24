import React, { useEffect, useState } from "react";
import { useVenda } from "./vendaprovider";
import { API_URL } from "../../../../../config";
import ModalPagamento from "./modalpagamento";
import "./totalvenda.css";

export default function TotalVenda() {

    const { total, itens, limparVenda, setLimparBusca } = useVenda();

    const [tema, setTema] = useState("escuro");
    const [abrirPagamento, setAbrirPagamento] = useState(false);

    const [mostrarUSD, setMostrarUSD] = useState(false);
    const [cotacaoUSD, setCotacaoUSD] = useState(null);

    const vendaVazia = itens.length === 0;

    // ===============================
    // DEFINIR TEMA
    // ===============================
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

    // ===============================
    // BUSCAR COTAÇÃO USD
    // ===============================
    useEffect(() => {
        async function buscarCotacao() {
            try {
                const r = await fetch(
                    "https://economia.awesomeapi.com.br/json/last/USD-BRL"
                );
                const j = await r.json();

                const valor = parseFloat(j.USDBRL.bid);
                if (!isNaN(valor)) {
                    setCotacaoUSD(valor);
                }
            } catch {
                setCotacaoUSD(null);
            }
        }

        buscarCotacao();
    }, []);

    // ===============================
    // ESC = CANCELAR
    // ===============================
    useEffect(() => {
        function escCancelar(e) {
            if (e.key === "Escape" && !vendaVazia) {
                limparVenda();
            }
        }

        window.addEventListener("keydown", escCancelar);
        return () => window.removeEventListener("keydown", escCancelar);
    }, [vendaVazia, limparVenda]);

    // ===============================
    // VALOR FORMATADO
    // ===============================
    function valorExibido() {
        if (mostrarUSD && cotacaoUSD && total > 0) {
            const usd = total / cotacaoUSD;
            return `US$ ${usd.toFixed(2)}`;
        }
        return `R$ ${total.toFixed(2)}`;
    }

    return (
        <div className={`cob-box cob-tema-${tema}`}>

            <div
                className={`cob-valor ${total > 0 ? "clicavel" : ""}`}
                onClick={() => {
                    if (total > 0 && cotacaoUSD) {
                        setMostrarUSD(v => !v);
                    }
                }}
                title={total > 0 ? "Clique para alternar moeda" : ""}
            >
                {valorExibido()}
            </div>

            <div className="cob-acoes">

                <button
                    className={`cob-botao-cancelar ${vendaVazia ? "desabilitado" : ""}`}
                    disabled={vendaVazia}
                    onClick={limparVenda}
                >
                    Cancelar
                </button>

                <button
                    className={`cob-botao ${vendaVazia ? "cob-botao-desabilitado" : ""}`}
                    disabled={vendaVazia}
                    onClick={() => {
                        setLimparBusca(true);
                        setAbrirPagamento(true);
                    }}
                >
                    Cobrar
                </button>

            </div>

            {abrirPagamento && (
                <ModalPagamento
                    total={total}
                    fechar={() => setAbrirPagamento(false)}
                />
            )}

        </div>
    );
}
