import React, { useState, useEffect } from "react";
import HeaderPerfil from "./header/headerperfil";
import Body from "./body/body";
import {
    TemaComercioProvider,
    useTemaComercio
} from "./temacomercio";
import { API_URL } from "../../config";


/* =========================================================
   CACHE DA IDENTIDADE VISUAL DA ABA
========================================================= */

function obterChaveCacheAba(comercioId) {

    if (!comercioId) {
        return null;
    }

    return `iron_aba_comercio_cache_${comercioId}`;
}


/* =========================================================
   LER CACHE
========================================================= */

function lerCacheAba(comercioId) {

    const chave =
        obterChaveCacheAba(comercioId);

    if (!chave) {
        return null;
    }

    try {

        const salvo =
            localStorage.getItem(chave);

        if (!salvo) {
            return null;
        }

        return JSON.parse(salvo);

    } catch (erro) {

        console.warn(
            "[ABA] Cache inválido:",
            erro
        );

        localStorage.removeItem(chave);

        return null;
    }
}


/* =========================================================
   SALVAR CACHE
========================================================= */

function salvarCacheAba(
    comercioId,
    dados
) {

    const chave =
        obterChaveCacheAba(comercioId);

    if (!chave) {
        return;
    }

    try {

        localStorage.setItem(
            chave,
            JSON.stringify({
                loja: dados.loja || "",
                imagem: dados.imagem || ""
            })
        );

    } catch (erro) {

        console.warn(
            "[ABA] Erro ao salvar cache:",
            erro
        );
    }
}


/* =========================================================
   COMPARAR CACHE COM SERVIDOR
========================================================= */

function dadosAbaIguais(
    cache,
    servidor
) {

    if (!cache || !servidor) {
        return false;
    }

    return (
        (cache.loja || "") ===
        (servidor.loja || "") &&

        (cache.imagem || "") ===
        (servidor.imagem || "")
    );
}


/* =========================================================
   ATUALIZAR FAVICON
========================================================= */

function atualizarFavicon(url) {

    if (!url) {
        return;
    }


    let link =
        document.getElementById(
            "favicon"
        );


    if (!link) {

        link =
            document.createElement(
                "link"
            );

        link.id =
            "favicon";

        link.rel =
            "icon";

        document.head.appendChild(
            link
        );
    }


    /*
        Não usamos Date.now() aqui.

        Se usássemos:

        ?v=123
        ?v=456
        ?v=789

        o navegador entenderia como imagens
        diferentes toda vez.

        Como estamos trabalhando com cache,
        deixamos a URL estável.
    */

    link.href = url;
}


/* =========================================================
   APLICAR IDENTIDADE NA ABA
========================================================= */

function aplicarDadosAba(dados) {

    if (!dados) {
        return;
    }


    if (dados.loja) {

        document.title =
            dados.loja;

    }


    if (dados.imagem) {

        atualizarFavicon(
            dados.imagem
        );

    }
}


/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function IronBusinessPerfil() {


    useEffect(() => {

        let componenteAtivo = true;


        async function carregarDadosLoja() {

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {
                return;
            }


            /* =================================================
               1. DESCOBRE USUÁRIO LOCAL

               Isso permite descobrir o comercio_id
               sem esperar a API.
            ================================================= */

            let usuarioLocal = null;


            try {

                usuarioLocal =
                    JSON.parse(
                        localStorage.getItem(
                            "usuario"
                        ) || "null"
                    );

            } catch {

                usuarioLocal = null;

            }


            const comercioIdLocal =
                usuarioLocal?.comercio_id;


            /* =================================================
               2. CARREGA CACHE IMEDIATAMENTE
            ================================================= */

            let cacheInicial = null;


            if (comercioIdLocal) {

                cacheInicial =
                    lerCacheAba(
                        comercioIdLocal
                    );


                if (cacheInicial) {

                    aplicarDadosAba(
                        cacheInicial
                    );


                    console.log(
                        "[ABA] Identidade carregada do cache:",
                        comercioIdLocal
                    );
                }
            }


            /* =================================================
               3. VERIFICA USUÁRIO NO SERVIDOR
            ================================================= */

            try {

                const headers = {
                    Authorization:
                        `Bearer ${token}`
                };


                const respostaCliente =
                    await fetch(
                        `${API_URL}/retorno/me`,
                        {
                            headers
                        }
                    );


                if (!respostaCliente.ok) {

                    throw new Error(
                        `Erro /retorno/me: ${respostaCliente.status}`
                    );
                }


                const clienteServidor =
                    await respostaCliente.json();


                if (!componenteAtivo) {
                    return;
                }


                /* =================================================
                   4. SEM COMÉRCIO
                ================================================= */

                if (
                    !clienteServidor?.comercio_id
                ) {

                    console.warn(
                        "[ABA] Usuário sem comércio."
                    );

                    return;
                }


                const comercioIdServidor =
                    clienteServidor.comercio_id;


                /* =================================================
                   5. VERIFICA SE MUDOU DE COMÉRCIO

                   Exemplo:

                   localStorage = comércio 25
                   token atual = comércio 29
                ================================================= */

                if (
                    String(
                        comercioIdLocal || ""
                    ) !==
                    String(
                        comercioIdServidor
                    )
                ) {

                    console.log(
                        "[ABA] Comércio diferente detectado:",
                        {
                            cache:
                                comercioIdLocal,

                            servidor:
                                comercioIdServidor
                        }
                    );


                    /*
                        Antes mesmo da segunda API,
                        verificamos se já existe cache
                        para o comércio correto.
                    */

                    const cacheComercioCorreto =
                        lerCacheAba(
                            comercioIdServidor
                        );


                    if (
                        cacheComercioCorreto
                    ) {

                        aplicarDadosAba(
                            cacheComercioCorreto
                        );
                    }
                }


                /* =================================================
                   6. BUSCA DADOS REAIS DO COMÉRCIO
                ================================================= */

                const respostaComercio =
                    await fetch(
                        `${API_URL}/cadastro/comercio/${comercioIdServidor}`,
                        {
                            headers
                        }
                    );


                if (!respostaComercio.ok) {

                    throw new Error(
                        `Erro comércio: ${respostaComercio.status}`
                    );
                }


                const comercioServidor =
                    await respostaComercio.json();


                if (!componenteAtivo) {
                    return;
                }


                if (!comercioServidor) {
                    return;
                }


                /* =================================================
                   7. DADOS QUE REALMENTE IMPORTAM PARA ABA
                ================================================= */

                const dadosServidor = {

                    loja:
                        comercioServidor.loja || "",

                    imagem:
                        comercioServidor.imagem || ""

                };


                /* =================================================
                   8. PEGA CACHE DA EMPRESA CORRETA
                ================================================= */

                const cacheAtual =
                    lerCacheAba(
                        comercioIdServidor
                    );


                /* =================================================
                   9. COMPARA CACHE COM SERVIDOR
                ================================================= */

                const iguais =
                    dadosAbaIguais(
                        cacheAtual,
                        dadosServidor
                    );


                /* =================================================
                   10. CACHE JÁ ESTÁ CORRETO
                ================================================= */

                if (iguais) {

                    console.log(
                        "[ABA] Cache já está atualizado."
                    );


                    /*
                        Garantimos que a aba esteja
                        usando os dados corretos.
                    */

                    aplicarDadosAba(
                        dadosServidor
                    );


                    return;
                }


                /* =================================================
                   11. EMPRESA MUDOU

                   Pode ter mudado:
                   nome
                   imagem
                   empresa do usuário
                ================================================= */

                console.log(
                    "[ABA] Dados diferentes detectados. Atualizando."
                );


                aplicarDadosAba(
                    dadosServidor
                );


                salvarCacheAba(
                    comercioIdServidor,
                    dadosServidor
                );


                console.log(
                    "[ABA] Cache atualizado:",
                    comercioIdServidor
                );


            } catch (erro) {

                console.warn(
                    "[ABA] Erro ao verificar empresa:",
                    erro
                );


                /*
                    Não apagamos os dados que vieram
                    do cache.

                    Se o backend estiver temporariamente
                    indisponível, a aba continua correta
                    usando a última versão conhecida.
                */
            }
        }


        carregarDadosLoja();


        return () => {

            componenteAtivo = false;

        };

    }, []);


    return (

        <TemaComercioProvider>

            <TemaWrapper>

                <Painel />

            </TemaWrapper>

        </TemaComercioProvider>

    );
}


/* =========================================================
   TEMA WRAPPER
========================================================= */

function TemaWrapper({
    children
}) {

    const tema =
        useTemaComercio();


    const estiloContainer = {

        minHeight:
            "100vh",

        padding:
            "20px",

        background:
            tema.fundo || "",

        color:
            tema.letraCor || "",

        fontFamily:
            tema.letraTipo || ""

    };


    return (

        <div style={estiloContainer}>

            <style>
                {`
                    .painel-tema * {
                        color: ${tema.letraCor || "inherit"};
                        font-family: ${tema.letraTipo || "inherit"};
                    }
                `}
            </style>


            <div className="painel-tema">

                {children}

            </div>

        </div>

    );
}


/* =========================================================
   PAINEL
========================================================= */

function Painel() {

    const [
        headerMinimizado,
        setHeaderMinimizado
    ] = useState(false);


    const [
        headerRefreshKey,
        setHeaderRefreshKey
    ] = useState(0);


    function atualizarHeader() {

        setHeaderRefreshKey(
            prev => prev + 1
        );

    }


    return (

        <>

            <HeaderPerfil
                minimizado={
                    headerMinimizado
                }
                setMinimizado={
                    setHeaderMinimizado
                }
                refreshKey={
                    headerRefreshKey
                }
            />


            <div
                style={{
                    marginTop: "30px"
                }}
            >

                <Body
                    setHeaderMinimizado={
                        setHeaderMinimizado
                    }
                    atualizarHeader={
                        atualizarHeader
                    }
                />

            </div>

        </>

    );
}