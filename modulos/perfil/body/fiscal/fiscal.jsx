import React, { useEffect, useState } from "react";

import "./fiscal.css";

import RegistrarFiscal from "./componentes/registrarfiscal";

import CuponsFiscais from "./componentes/cuponsfiscais";

import RegistradosFiscal from "./componentes/registradosfiscal";

import DadosComerciaisFiscal from "./componentes/dadoscomerciofiscal";

import EmitirNfce from "./componentes/emitirnfce";

import RegistrarFiscalMassa from "./componentes/fiscalmassa";

import { API_URL } from "../../../../config";

export default function Fiscal() {

    // ============================================================

    // ESTADOS

    // ============================================================

    const [abaAtiva, setAbaAtiva] = useState("cupons");

    const [funcao, setFuncao] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const [

        produtosFiscalMassa,

        setProdutosFiscalMassa

    ] = useState([]);

    const [

        vendaFiscalPendente,

        setVendaFiscalPendente

    ] = useState(null);

    // ============================================================

    // IDENTIFICAR ABA PELO LINK

    // ============================================================

    useEffect(() => {

        const caminhoAtual = window.location.pathname.replace(/\/+$/, "");

        if (caminhoAtual !== "/ironbusiness/perfil/fiscal") {
            return;
        }

        function identificarAba() {
            const hashCompleto = decodeURIComponent(
                window.location.hash.slice(1)
            );

            // A primeira parte é o nome da aba.
            // A segunda parte pode conter o ID da venda.
            const [nomeAba] = hashCompleto.split("#");

            const abas = {
                "Cupons": "cupons",
                "Emitir Notas": "emitir-nfce",
                "Registrar": "registrar",
                "Registrar em massa": "registrar-massa",
                "Registrados": "registrados",
                "Dados Comerciais": "dados-comerciais"
            };

            const abaEncontrada = abas[nomeAba];

            if (abaEncontrada) {
                setAbaAtiva(abaEncontrada);
            }
        }

        identificarAba();

        window.addEventListener("hashchange", identificarAba);

        return () => {

            window.removeEventListener("hashchange", identificarAba);

        };

    }, []);

    // ============================================================

    // CARREGAR USUÁRIO

    // ============================================================

    useEffect(() => {

        async function carregarUsuario() {

            try {

                const token =

                    localStorage.getItem("token");

                const resp = await fetch(

                    `${API_URL}/clientes/me`,

                    {

                        headers: {

                            Authorization:

                                `Bearer ${token}`

                        }

                    }

                );

                const json = await resp.json();

                setFuncao(json.funcao);

            } catch (erro) {

                console.error(

                    "[Fiscal] Erro ao carregar usuário:",

                    erro

                );

                setFuncao(null);

            } finally {

                setCarregando(false);

            }

        }

        carregarUsuario();

    }, []);

    // ============================================================

    // ESCUTAR PEDIDO PARA ABRIR FISCAL EM MASSA

    // ============================================================

    useEffect(() => {

        function abrirFiscalMassa(evento) {

            const detail =

                evento?.detail || {};

            let produtos =

                Array.isArray(detail.produtos)

                    ? detail.produtos

                    : [];

            let vendaId =

                detail.vendaId ?? null;

            // Recupera os produtos salvos pelo fluxo de emissão, caso o evento não os envie.
            if (produtos.length === 0) {

                try {

                    const produtosSalvos =

                        sessionStorage.getItem(

                            "fiscal_massa_produtos_pendentes"

                        );

                    if (produtosSalvos) {

                        const parsed =

                            JSON.parse(produtosSalvos);

                        if (Array.isArray(parsed)) {

                            produtos = parsed;

                        }

                    }

                } catch (erro) {

                    console.error(

                        "[Fiscal] Erro recuperando produtos pendentes:",

                        erro

                    );

                }

            }

            if (!vendaId) {

                const vendaSalva =

                    sessionStorage.getItem(

                        "fiscal_massa_venda_pendente"

                    );

                if (vendaSalva) {

                    vendaId = Number(vendaSalva);

                }

            }

            console.log(

                "[Fiscal] ABRINDO FISCAL EM MASSA"

            );

            console.log(

                "[Fiscal] Produtos que devem ser marcados:",

                produtos

            );

            console.log(

                "[Fiscal] Venda pendente:",

                vendaId

            );

            setProdutosFiscalMassa(

                [...produtos]

            );

            setVendaFiscalPendente(

                vendaId

            );

            setAbaAtiva(

                "registrar-massa"

            );

        }

        window.addEventListener(

            "abrir-fiscal-massa",

            abrirFiscalMassa

        );

        return () => {

            window.removeEventListener(

                "abrir-fiscal-massa",

                abrirFiscalMassa

            );

        };

    }, []);

    // ============================================================

    // TROCAR ABA MANUALMENTE

    // ============================================================

    function abrirAba(aba, nomeBotao) {

        if (aba !== "registrar-massa") {

            setProdutosFiscalMassa([]);

            setVendaFiscalPendente(null);

        }

        setAbaAtiva(aba);

        if (window.location.pathname.replace(/\/+$/, "") === "/ironbusiness/perfil/fiscal") {

            window.location.hash = encodeURIComponent(nomeBotao);

        }

    }

    // ============================================================

    // RENDERIZAR CONTEÚDO

    // ============================================================

    function renderizarConteudo() {

        if (abaAtiva === "emitir-nfce") {

            return <EmitirNfce />;

        }

        if (String(funcao || "").trim().toLowerCase() !== "administrador(a)") {

            return <CuponsFiscais />;

        }

        if (abaAtiva === "registrar") {

            return <RegistrarFiscal />;

        }

        if (abaAtiva === "registrados") {

            return <RegistradosFiscal />;

        }

        if (abaAtiva === "registrar-massa") {

            return (

                <RegistrarFiscalMassa

                    produtosIniciais={

                        produtosFiscalMassa

                    }

                    vendaId={

                        vendaFiscalPendente

                    }

                />

            );

        }

        if (abaAtiva === "dados-comerciais") {

            return <DadosComerciaisFiscal />;

        }

        return <CuponsFiscais />;

    }

    // ============================================================

    // CARREGANDO

    // ============================================================

    if (carregando) {

        return (

            <div className="fiscal-container">

                <h3>Fiscal</h3>

                <div className="fiscal-conteudo">

                    Carregando...

                </div>

            </div>

        );

    }

    // ============================================================

    // RENDER

    // ============================================================

    return (

        <div className="fiscal-container">

            <h3>Fiscal</h3>

            <div className="fiscal-botoes">

                <button

                    className={abaAtiva === "cupons" ? "ativo" : ""}

                    onClick={() => abrirAba("cupons", "Cupons")}

                >

                    Cupons

                </button>

                <button

                    className={abaAtiva === "emitir-nfce" ? "ativo" : ""}

                    onClick={() => abrirAba("emitir-nfce", "Emitir Notas")}

                >

                    Emitir Notas

                </button>

                {String(funcao || "").trim().toLowerCase() === "administrador(a)" && (

                    <>

                        <button

                            className={abaAtiva === "registrar" ? "ativo" : ""}

                            onClick={() => abrirAba("registrar", "Registrar")}

                        >

                            Registrar

                        </button>


                        <button

                            className={abaAtiva === "registrados" ? "ativo" : ""}

                            onClick={() => abrirAba("registrados", "Registrados")}

                        >

                            Registrados

                        </button>

                        <button

                            className={abaAtiva === "dados-comerciais" ? "ativo" : ""}

                            onClick={() => abrirAba("dados-comerciais", "Dados Comerciais")}

                        >

                            Dados Comerciais

                        </button>

                    </>

                )}

            </div>

            <div className="fiscal-conteudo">

                {renderizarConteudo()}

            </div>

        </div>

    );

}
