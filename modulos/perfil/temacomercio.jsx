import React, {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";

import { API_URL } from "../../config";


const TemaComercioContext = createContext();


export function useTemaComercio() {
    return useContext(TemaComercioContext);
}


/* =========================================================
   TEMA PADRÃO
========================================================= */

const TEMA_PADRAO = {
    fundo: "",
    letraCor: "",
    letraTipo: "",
    carregado: false
};


/* =========================================================
   CHAVE DO CACHE POR COMÉRCIO
========================================================= */

function obterChaveCacheTema(comercioId) {

    if (!comercioId) {
        return null;
    }

    return `iron_tema_comercio_cache_${comercioId}`;
}


/* =========================================================
   LER CACHE
========================================================= */

function lerCacheTema(comercioId) {

    const chave =
        obterChaveCacheTema(comercioId);

    if (!chave) {
        return null;
    }

    try {

        const salvo =
            localStorage.getItem(chave);

        if (!salvo) {
            return null;
        }

        const dados =
            JSON.parse(salvo);

        if (!dados) {
            return null;
        }

        return {
            fundo: dados.fundo || "",
            letraCor: dados.letraCor || "",
            letraTipo: dados.letraTipo || "",
            carregado: true
        };

    } catch (erro) {

        console.warn(
            "[TEMA] Cache inválido:",
            erro
        );

        localStorage.removeItem(chave);

        return null;
    }
}


/* =========================================================
   SALVAR CACHE
========================================================= */

function salvarCacheTema(
    comercioId,
    dados
) {

    const chave =
        obterChaveCacheTema(comercioId);

    if (!chave) {
        return;
    }

    try {

        localStorage.setItem(
            chave,
            JSON.stringify({
                fundo: dados.fundo || "",
                letraCor: dados.letraCor || "",
                letraTipo: dados.letraTipo || ""
            })
        );

    } catch (erro) {

        console.warn(
            "[TEMA] Erro ao salvar cache:",
            erro
        );
    }
}


/* =========================================================
   COMPARAR CACHE COM SERVIDOR
========================================================= */

function temasIguais(cache, servidor) {

    if (!cache || !servidor) {
        return false;
    }

    return (
        (cache.fundo || "") ===
        (servidor.fundo || "") &&

        (cache.letraCor || "") ===
        (servidor.letraCor || "") &&

        (cache.letraTipo || "") ===
        (servidor.letraTipo || "")
    );
}


/* =========================================================
   PROVIDER
========================================================= */

export function TemaComercioProvider({
    children
}) {

    const [tema, setTema] =
        useState(TEMA_PADRAO);


    useEffect(() => {

        let componenteAtivo = true;


        async function carregar() {

            const token =
                localStorage.getItem("token");


            /* =================================================
               SEM LOGIN
            ================================================= */

            if (!token) {

                if (componenteAtivo) {

                    setTema({
                        ...TEMA_PADRAO,
                        carregado: true
                    });
                }

                return;
            }


            /* =================================================
               1. TENTA DESCOBRIR COMÉRCIO PELO USUÁRIO LOCAL

               Isso permite carregar o cache antes da API.
            ================================================= */

            let usuarioLocal = null;


            try {

                usuarioLocal =
                    JSON.parse(
                        localStorage.getItem("usuario") ||
                        "null"
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
                    lerCacheTema(
                        comercioIdLocal
                    );


                if (
                    cacheInicial &&
                    componenteAtivo
                ) {

                    setTema(
                        cacheInicial
                    );


                    console.log(
                        "[TEMA] Tema carregado do cache:",
                        comercioIdLocal
                    );
                }
            }


            /* =================================================
               3. CONSULTA /CLIENTES/ME

               Mesmo com cache, verificamos o servidor.
            ================================================= */

            try {

                const respMe =
                    await fetch(
                        `${API_URL}/clientes/me`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (!respMe.ok) {

                    throw new Error(
                        `Erro /clientes/me: ${respMe.status}`
                    );
                }


                const cliente =
                    await respMe.json();


                if (!componenteAtivo) {
                    return;
                }


                /* =================================================
                   4. USUÁRIO NÃO POSSUI COMÉRCIO
                ================================================= */

                if (!cliente?.comercio_id) {

                    setTema({
                        ...TEMA_PADRAO,
                        carregado: true
                    });

                    return;
                }


                const comercioIdServidor =
                    cliente.comercio_id;


                /* =================================================
                   5. SE O COMÉRCIO DO SERVIDOR FOR DIFERENTE
                   DO COMÉRCIO SALVO LOCALMENTE

                   Procuramos o cache correto.
                ================================================= */

                let cacheCorreto =
                    cacheInicial;


                if (
                    String(comercioIdLocal || "") !==
                    String(comercioIdServidor)
                ) {

                    console.log(
                        "[TEMA] Comércio diferente detectado:",
                        {
                            local:
                                comercioIdLocal,

                            servidor:
                                comercioIdServidor
                        }
                    );


                    cacheCorreto =
                        lerCacheTema(
                            comercioIdServidor
                        );


                    /*
                        Se já temos cache para a empresa
                        correta, troca imediatamente.
                    */

                    if (
                        cacheCorreto &&
                        componenteAtivo
                    ) {

                        setTema(
                            cacheCorreto
                        );
                    }
                }


                /* =================================================
                   6. BUSCA TEMA REAL DO COMÉRCIO
                ================================================= */

                const respComercio =
                    await fetch(
                        `${API_URL}/cadastro/comercio/${comercioIdServidor}`
                    );


                if (!respComercio.ok) {

                    throw new Error(
                        `Erro comércio: ${respComercio.status}`
                    );
                }


                const comercio =
                    await respComercio.json();


                if (!componenteAtivo) {
                    return;
                }


                /* =================================================
                   7. NORMALIZA DADOS DO SERVIDOR
                ================================================= */

                const temaServidor = {

                    fundo:
                        comercio.fundo || "",

                    letraCor:
                        comercio.letra_cor || "",

                    letraTipo:
                        comercio.letra_tipo || "",

                    carregado: true
                };


                /* =================================================
                   8. PEGA CACHE DA EMPRESA CORRETA

                   Lemos novamente porque pode ter mudado.
                ================================================= */

                const cacheAtual =
                    lerCacheTema(
                        comercioIdServidor
                    );


                /* =================================================
                   9. COMPARA
                ================================================= */

                const iguais =
                    temasIguais(
                        cacheAtual,
                        temaServidor
                    );


                /* =================================================
                   10. NÃO MUDOU
                ================================================= */

                if (iguais) {

                    console.log(
                        "[TEMA] Cache já está atualizado."
                    );


                    /*
                        Caso não tenha sido possível mostrar
                        o cache inicialmente, garantimos o state.
                    */

                    if (!cacheInicial) {

                        setTema(
                            temaServidor
                        );
                    }

                    return;
                }


                /* =================================================
                   11. TEMA MUDOU

                   Atualiza state e cache.
                ================================================= */

                console.log(
                    "[TEMA] Tema diferente detectado. Atualizando."
                );


                setTema(
                    temaServidor
                );


                salvarCacheTema(
                    comercioIdServidor,
                    temaServidor
                );


                console.log(
                    "[TEMA] Cache atualizado:",
                    comercioIdServidor
                );


            } catch (erro) {

                console.error(
                    "[TEMA] Erro ao verificar tema:",
                    erro
                );


                /*
                    Se já conseguimos carregar um cache,
                    não mexemos nele.

                    O usuário continua utilizando
                    o último tema conhecido.
                */

                if (
                    !cacheInicial &&
                    componenteAtivo
                ) {

                    setTema({
                        ...TEMA_PADRAO,
                        carregado: true
                    });
                }
            }
        }


        carregar();


        return () => {

            componenteAtivo = false;

        };

    }, []);


    return (

        <TemaComercioContext.Provider
            value={tema}
        >

            {children}

        </TemaComercioContext.Provider>

    );
}