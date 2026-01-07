import React, { useEffect, useState } from "react";

import BuscarProduto from "./componentes/buscarproduto";
import ProdutoAtual from "./componentes/produtoatual";
import ListaItens from "./componentes/listaitens";
import TotalVenda from "./componentes/totalvenda";
import Infos from "./componentes/infos";

import { VendaProvider } from "./componentes/vendaprovider";
import { API_URL } from "../../../../../../../config";

import "./produtividade.css";

export default function Produtividade() {

    const [tema, setTema] = useState("escuro");
    const [bloqueado, setBloqueado] = useState(false);

    /* ===============================
       BLOQUEAR CELULARES
    =============================== */
    useEffect(() => {
        function verificarDispositivo() {
            if (window.innerWidth < 624) {
                setBloqueado(true);
            } else {
                setBloqueado(false);
            }
        }

        verificarDispositivo();
        window.addEventListener("resize", verificarDispositivo);

        return () => {
            window.removeEventListener("resize", verificarDispositivo);
        };
    }, []);


    /* ===============================
       TELA BLOQUEADA PARA CELULAR
    =============================== */
    if (bloqueado) {
        return (
            <div className="bloqueio-mobile">
                <h1>Acesso não autorizado</h1>
                <p>
                    Este sistema não pode ser utilizado em celulares ou telas pequenas.
                </p>
                <p>
                    Utilize um computador ou notebook para continuar.
                </p>
            </div>
        );
    }

    return (
        <VendaProvider>

            <div className={`prod-container tema-${tema}`}>

                <div className="linha-superior">

                    <div style={{ background: "#102038", border: "2px solid #d4af37", maxHeight: "95%" }} className="prod-card buscar buscar-wrapper">
                        <BuscarProduto />
                        <Infos />
                    </div>

                    <div className="prod-card itens">
                        <ListaItens />
                    </div>

                </div>

                <div className="linha-inferior">
                    <div className="prod-card atual">
                        <ProdutoAtual />
                    </div>

                    <div style={{ padding: "0", background: "transparent", border: "none" }} className="prod-card total">
                        <TotalVenda />
                    </div>
                </div>

            </div>

        </VendaProvider>
    );
}
