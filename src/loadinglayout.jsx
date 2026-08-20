import React, { useEffect, useState } from "react";
import "./loadinglayout.css";
import logo from "../favicon.png";
import { API_URL } from "../config";


/* =========================================================
   MESMA CHAVE UTILIZADA NO HEADER
========================================================= */

const CACHE_HEADER_LOJA =
    "fsd6f2d69s4f9sd485f1sdf";


export default function LoadingLayout() {

    const [empresa, setEmpresa] = useState(() => {

        /*
            Já tenta carregar o cache na criação do state.

            Isso é mais rápido do que esperar o useEffect.
        */

        try {

            const cache =
                localStorage.getItem(
                    CACHE_HEADER_LOJA
                );

            if (!cache) {
                return null;
            }

            const dados =
                JSON.parse(cache);

            if (!dados) {
                return null;
            }

            return dados;

        } catch (erro) {

            console.warn(
                "[LOADER] Cache da empresa inválido:",
                erro
            );

            return null;
        }

    });


    /* =========================================================
       COMPARAR EMPRESAS
    ========================================================= */

    function empresasIguais(cache, servidor) {

        if (!cache || !servidor) {
            return false;
        }

        try {

            return (
                JSON.stringify(cache) ===
                JSON.stringify(servidor)
            );

        } catch {

            return false;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCacheEmpresa(dados) {

        try {

            localStorage.setItem(
                CACHE_HEADER_LOJA,
                JSON.stringify(dados)
            );

        } catch (erro) {

            console.warn(
                "[LOADER] Não foi possível salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       VERIFICAR EMPRESA LOGADA
    ========================================================= */

    useEffect(() => {

        let componenteAtivo = true;


        async function verificarEmpresa() {

            const token =
                localStorage.getItem("token");


            /* =================================================
               NÃO EXISTE LOGIN
            ================================================= */

            if (!token) {

                if (componenteAtivo) {
                    setEmpresa(null);
                }

                return;
            }


            try {

                /* =================================================
                   1. DESCOBRE USUÁRIO ATUAL
                ================================================= */

                const respUsuario =
                    await fetch(
                        `${API_URL}/clientes/me`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                if (!respUsuario.ok) {

                    throw new Error(
                        `Erro /clientes/me: ${respUsuario.status}`
                    );
                }


                const usuario =
                    await respUsuario.json();


                if (!componenteAtivo) {
                    return;
                }


                /* =================================================
                   USUÁRIO NÃO POSSUI EMPRESA
                ================================================= */

                if (!usuario?.comercio_id) {

                    setEmpresa(null);

                    localStorage.removeItem(
                        CACHE_HEADER_LOJA
                    );

                    return;
                }


                /* =================================================
                   2. BUSCA EMPRESA ATUAL
                ================================================= */

                const respEmpresa =
                    await fetch(
                        `${API_URL}/comercios/${usuario.comercio_id}`
                    );


                if (!respEmpresa.ok) {

                    throw new Error(
                        `Erro comércio: ${respEmpresa.status}`
                    );
                }


                const empresaServidor =
                    await respEmpresa.json();


                if (!componenteAtivo) {
                    return;
                }


                /* =================================================
                   3. PEGA CACHE ATUAL
                ================================================= */

                let empresaCache = null;


                try {

                    const cache =
                        localStorage.getItem(
                            CACHE_HEADER_LOJA
                        );


                    if (cache) {

                        empresaCache =
                            JSON.parse(cache);

                    }

                } catch {

                    empresaCache = null;

                }


                /* =================================================
                   4. COMPARA CACHE COM SERVIDOR
                ================================================= */

                const iguais =
                    empresasIguais(
                        empresaCache,
                        empresaServidor
                    );


                if (iguais) {

                    console.log(
                        "[LOADER] Empresa já está atualizada."
                    );

                    return;
                }


                /* =================================================
                   5. EMPRESA MUDOU
                ================================================= */

                console.log(
                    "[LOADER] Empresa mudou. Atualizando cache."
                );


                setEmpresa(
                    empresaServidor
                );


                salvarCacheEmpresa(
                    empresaServidor
                );


            } catch (erro) {

                console.warn(
                    "[LOADER] Não foi possível verificar empresa:",
                    erro
                );

                /*
                    Não apagamos o cache aqui.

                    Se a API estiver fora do ar,
                    continuamos mostrando a última
                    empresa conhecida.
                */
            }
        }


        verificarEmpresa();


        return () => {

            componenteAtivo = false;

        };

    }, []);


    /* =========================================================
       DADOS VISUAIS
    ========================================================= */

    const nomeEmpresa =
        empresa?.loja ||
        "Iron Executions";


    const imagemEmpresa =
        empresa?.imagem ||
        logo;


    const usandoEmpresa =
        Boolean(
            empresa?.loja
        );


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="load-container">

            <div className="load-backlight" />


            <div className="load-center">

                <div className="load-image-wrapper">

                    <div className="load-image-ring"></div>

                    <img
                        src={imagemEmpresa}
                        alt={nomeEmpresa}
                        className="load-logo-img"
                    />

                </div>


                {usandoEmpresa ? (

                    <h1 className="load-nome load-nome-empresa">
                        {nomeEmpresa}
                    </h1>

                ) : (

                    <h1 className="load-nome">
                        Iron<span>Executions</span>
                    </h1>

                )}


                <p className="load-texto">
                    Preparando seu ambiente profissional
                </p>

            </div>

        </div>

    );
}