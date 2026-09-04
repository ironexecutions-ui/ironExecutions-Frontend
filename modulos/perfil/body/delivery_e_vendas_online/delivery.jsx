import React, {
    useState
} from "react";

import Vendas from "./componentes/vendas/vendas";
import Apresentacao from "./componentes/vendas/apresentacao";
import Modelos from "./componentes/vendas/modelos";
import Dominio from "./componentes/vendas/dominio";
import Rodape from "./componentes/vendas/rodape";
import Rastreio from "./componentes/vendas/rastreio";
import RClientes from "./componentes/vendas/clientes";

import "./delivery.css";


export default function DeliveryEVendasOnline() {

    /* ============================================================
       ESTADOS
    ============================================================ */
    const [
        abaAtiva,
        setAbaAtiva
    ] = useState("vendas");


    /* ============================================================
       TROCAR ABA
    ============================================================ */
    function abrirAba(aba) {
        setAbaAtiva(
            aba
        );
    }


    /* ============================================================
       RENDERIZAR CONTEÚDO
    ============================================================ */
    function renderizarConteudo() {
        switch (abaAtiva) {

            /* =====================================================
               VENDAS
            ===================================================== */
            case "vendas":
                return (
                    <Vendas />
                );


            /* =====================================================
               CLIENTES
            ===================================================== */
            case "clientes":
                return (
                    <RClientes />
                );


            /* =====================================================
               RASTREIO
            ===================================================== */
            case "rastreio":
                return (
                    <Rastreio />
                );


            /* =====================================================
               APRESENTAÇÃO
            ===================================================== */
            case "apresentacao":
                return (
                    <Apresentacao />
                );


            /* =====================================================
               MODELOS
            ===================================================== */
            case "modelos":
                return (
                    <Modelos />
                );


            /* =====================================================
               DOMÍNIO
            ===================================================== */
            case "dominio":
                return (
                    <Dominio />
                );


            /* =====================================================
               RODAPÉ
            ===================================================== */
            case "rodape":
                return (
                    <Rodape />
                );


            /* =====================================================
               PADRÃO
            ===================================================== */
            default:
                return (
                    <Vendas />
                );
        }
    }


    /* ============================================================
       RENDER
    ============================================================ */
    return (
        <div className="ironstore-container">

            {/* ====================================================
                TÍTULO
            ==================================================== */}
            <h3>
                IronStore
            </h3>


            {/* ====================================================
                BOTÕES
            ==================================================== */}
            <div className="ironstore-botoes">


                {/* =================================================
                    VENDAS
                ================================================= */}
                <button
                    type="button"
                    className={
                        abaAtiva === "vendas"
                            ? "ironstore-botao-aba ironstore-botao-aba-vendas-unico ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba ironstore-botao-aba-vendas-unico"
                    }
                    onClick={
                        () => abrirAba(
                            "vendas"
                        )
                    }
                >
                    Vendas
                </button>


                {/* =================================================
                    CLIENTES
                ================================================= */}
                <button
                    type="button"
                    className={
                        abaAtiva === "clientes"
                            ? "ironstore-botao-aba ironstore-botao-aba-clientes-unico ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba ironstore-botao-aba-clientes-unico"
                    }
                    onClick={
                        () => abrirAba(
                            "clientes"
                        )
                    }
                >
                    Clientes
                </button>


                {/* =================================================
                    RASTREIO
                ================================================= */}
                <button
                    type="button"
                    className={
                        abaAtiva === "rastreio"
                            ? "ironstore-botao-aba ironstore-botao-aba-rastreio-unico ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba ironstore-botao-aba-rastreio-unico"
                    }
                    onClick={
                        () => abrirAba(
                            "rastreio"
                        )
                    }
                >
                    Rastreio
                </button>


                {/* =================================================
                    APRESENTAÇÃO
                ================================================= */}
                <button
                    type="button"
                    className={
                        abaAtiva === "apresentacao"
                            ? "ironstore-botao-aba ironstore-botao-aba-apresentacao-unico ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba ironstore-botao-aba-apresentacao-unico"
                    }
                    onClick={
                        () => abrirAba(
                            "apresentacao"
                        )
                    }
                >
                    Apresentação
                </button>


                {/* =================================================
                    MODELOS
                ================================================= */}
                <button
                    type="button"
                    className={
                        abaAtiva === "modelos"
                            ? "ironstore-botao-aba ironstore-botao-aba-modelos-unico ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba ironstore-botao-aba-modelos-unico"
                    }
                    onClick={
                        () => abrirAba(
                            "modelos"
                        )
                    }
                >
                    Modelos do site
                </button>


                {/* =================================================
                    DOMÍNIO
                ================================================= */}
                <button
                    type="button"
                    className={
                        abaAtiva === "dominio"
                            ? "ironstore-botao-aba ironstore-botao-aba-dominio-unico ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba ironstore-botao-aba-dominio-unico"
                    }
                    onClick={
                        () => abrirAba(
                            "dominio"
                        )
                    }
                >
                    Domínio registrado
                </button>


                {/* =================================================
                    REDES SOCIAIS
                ================================================= */}
                <button
                    type="button"
                    className={
                        abaAtiva === "rodape"
                            ? "ironstore-botao-aba ironstore-botao-aba-redes-unico ironstore-botao-aba-ativo"
                            : "ironstore-botao-aba ironstore-botao-aba-redes-unico"
                    }
                    onClick={
                        () => abrirAba(
                            "rodape"
                        )
                    }
                >
                    Redes sociais
                </button>

            </div>


            {/* ====================================================
                CONTEÚDO DA ABA
            ==================================================== */}
            <div className="ironstore-conteudo">
                {
                    renderizarConteudo()
                }
            </div>

        </div>
    );
}