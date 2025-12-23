import React, { useEffect, useState } from "react";

import BuscarProduto from "./componentes/buscarproduto";
import ProdutoAtual from "./componentes/produtoatual";
import ListaItens from "./componentes/listaitens";
import TotalVenda from "./componentes/totalvenda";

import { VendaProvider } from "./componentes/vendaprovider";
import { API_URL } from "../../../../../../../config";

import "./produtividade.css";

export default function Produtividade() {

    const [tema, setTema] = useState("escuro");

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
            } catch {
                modoCliente = null;
            }

            if (modoCliente === 1) {
                setTema("escuro");
                return;
            }

            if (modoCliente === 2) {
                setTema("claro");
                return;
            }

            const hora = new Date().getHours();

            if (hora >= 18 || hora < 6) {
                setTema("escuro");
            } else {
                setTema("claro");
            }
        }

        definirTema();
    }, []);

    return (
        <VendaProvider>

            <div className={`prod-container tema-${tema}`}>

                <div className="linha-superior">
                    <div className="prod-card buscar">
                        <BuscarProduto />
                    </div>

                    <div className="prod-card itens">
                        <ListaItens />
                    </div>
                </div>

                <div className="linha-inferior">
                    <div className="prod-card atual">
                        <ProdutoAtual />
                    </div>

                    <div className="prod-card total">
                        <TotalVenda />
                    </div>
                </div>

            </div>

        </VendaProvider>
    );
}
