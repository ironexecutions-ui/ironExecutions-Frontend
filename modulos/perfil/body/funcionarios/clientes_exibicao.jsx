import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./clientes_exibicao.css";

export default function Funcionarios() {

    const usuario = JSON.parse(
        localStorage.getItem("usuario") || "{}"
    );

    const [loja, setLoja] = useState("");

    const [carregando, setCarregando] = useState(true);

    const [dados, setDados] = useState({
        "Administrador(a)": [],
        "Supervisor(a)": [],
        "Funcionario(a)": []
    });


    /* =========================================================
       CHAVE DO CACHE
       UM CACHE DIFERENTE PARA CADA COMÉRCIO
    ========================================================= */

    function obterChaveCache() {

        if (!usuario.comercio_id) {
            return null;
        }

        return `iron_equipe_cache_${usuario.comercio_id}`;
    }


    /* =========================================================
       LER CACHE
    ========================================================= */

    function lerCache() {

        const chave = obterChaveCache();

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
                "[EQUIPE] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCache(dadosCache) {

        const chave = obterChaveCache();

        if (!chave) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(dadosCache)
            );

        } catch (erro) {

            console.warn(
                "[EQUIPE] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       NORMALIZAR RESPOSTA
    ========================================================= */

    function normalizarDados(json) {

        return {
            loja: json?.loja || "",

            dados: {
                "Administrador(a)":
                    Array.isArray(json?.["Administrador(a)"])
                        ? json["Administrador(a)"]
                        : [],

                "Supervisor(a)":
                    Array.isArray(json?.["Supervisor(a)"])
                        ? json["Supervisor(a)"]
                        : [],

                "Funcionario(a)":
                    Array.isArray(json?.["Funcionario(a)"])
                        ? json["Funcionario(a)"]
                        : []
            }
        };
    }


    /* =========================================================
       NORMALIZAR PARA COMPARAÇÃO

       Ordena as pessoas por ID para não considerar alteração
       apenas porque a API retornou em outra ordem.
    ========================================================= */

    function normalizarParaComparacao(objeto) {

        if (!objeto) {
            return null;
        }

        function ordenar(lista) {

            if (!Array.isArray(lista)) {
                return [];
            }

            return [...lista]
                .map((pessoa) => ({
                    ...pessoa
                }))
                .sort((a, b) => {

                    const idA =
                        String(
                            a.id ??
                            a.nome ??
                            ""
                        );

                    const idB =
                        String(
                            b.id ??
                            b.nome ??
                            ""
                        );

                    return idA.localeCompare(
                        idB,
                        "pt-BR",
                        {
                            numeric: true
                        }
                    );
                });
        }


        return {
            loja: objeto.loja || "",

            dados: {
                "Administrador(a)": ordenar(
                    objeto.dados?.["Administrador(a)"]
                ),

                "Supervisor(a)": ordenar(
                    objeto.dados?.["Supervisor(a)"]
                ),

                "Funcionario(a)": ordenar(
                    objeto.dados?.["Funcionario(a)"]
                )
            }
        };
    }


    /* =========================================================
       COMPARAR CACHE COM SERVIDOR
    ========================================================= */

    function dadosIguais(cache, servidor) {

        if (!cache || !servidor) {
            return false;
        }

        try {

            const cacheNormalizado =
                normalizarParaComparacao(cache);

            const servidorNormalizado =
                normalizarParaComparacao(servidor);

            return (
                JSON.stringify(cacheNormalizado) ===
                JSON.stringify(servidorNormalizado)
            );

        } catch (erro) {

            console.warn(
                "[EQUIPE] Erro ao comparar dados:",
                erro
            );

            return false;
        }
    }


    /* =========================================================
       APLICAR DADOS NA TELA
    ========================================================= */

    function aplicarDados(resultado) {

        if (!resultado) {
            return;
        }

        setLoja(
            resultado.loja || ""
        );

        setDados({
            "Administrador(a)":
                resultado.dados?.["Administrador(a)"] || [],

            "Supervisor(a)":
                resultado.dados?.["Supervisor(a)"] || [],

            "Funcionario(a)":
                resultado.dados?.["Funcionario(a)"] || []
        });
    }


    /* =========================================================
       CARREGAR
    ========================================================= */

    async function carregar() {

        if (!usuario.comercio_id) {

            setCarregando(false);

            return;
        }


        /* =====================================================
           1. TENTA CARREGAR CACHE
        ===================================================== */

        const cache =
            lerCache();


        if (cache) {

            console.log(
                "[EQUIPE] Cache encontrado."
            );

            aplicarDados(cache);

            /*
                Como temos cache, já podemos mostrar
                a equipe imediatamente.
            */

            setCarregando(false);

            console.log(
                "[EQUIPE] Interface carregada pelo cache."
            );

        } else {

            /*
                Só mostra skeleton se realmente
                não existir nada no cache.
            */

            setCarregando(true);

        }


        /* =====================================================
           2. CONSULTA SERVIDOR EM SEGUNDO PLANO
        ===================================================== */

        try {

            const resp = await fetch(
                `${API_URL}/exibicao/funcionarios/${usuario.comercio_id}`
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao carregar equipe: ${resp.status}`
                );
            }


            const json =
                await resp.json();


            /* =================================================
               3. NORMALIZA RESPOSTA
            ================================================= */

            const dadosServidor =
                normalizarDados(json);


            /* =================================================
               4. COMPARA CACHE COM SERVIDOR
            ================================================= */

            const iguais =
                dadosIguais(
                    cache,
                    dadosServidor
                );


            /* =================================================
               5. SE NÃO MUDOU, NÃO FAZ NADA
            ================================================= */

            if (iguais) {

                console.log(
                    "[EQUIPE] Cache já está atualizado."
                );

                return;
            }


            /* =================================================
               6. DADOS DIFERENTES

               Atualiza:
               STATE
               LOCALSTORAGE
            ================================================= */

            console.log(
                "[EQUIPE] Alteração encontrada. Atualizando."
            );


            aplicarDados(
                dadosServidor
            );


            salvarCache(
                dadosServidor
            );


            console.log(
                "[EQUIPE] Cache atualizado."
            );


        } catch (erro) {

            console.error(
                "[EQUIPE] Erro ao consultar servidor:",
                erro
            );


            /*
                Se já temos cache, não limpamos a tela.

                Continua mostrando a última versão
                disponível.
            */

            if (!cache) {

                setLoja("");

                setDados({
                    "Administrador(a)": [],
                    "Supervisor(a)": [],
                    "Funcionario(a)": []
                });
            }


        } finally {

            setCarregando(false);

        }
    }


    /* =========================================================
       CARREGAR AO ENTRAR
    ========================================================= */

    useEffect(() => {

        carregar();

    }, []);


    /* =========================================================
       RENDERIZAR PESSOAS
    ========================================================= */

    function renderizarPessoas(lista) {

        if (lista.length === 0) {

            return (

                <div className="equipe-premium-vazio">

                    <span>
                        Nenhum usuário nesta função
                    </span>

                </div>

            );
        }


        return lista.map((p, i) => (

            <div
                className="equipe-premium-pessoa"
                key={p.id || `${p.nome}-${i}`}
            >

                <div className="equipe-premium-avatar">

                    {p.nome
                        ?.trim()
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}

                </div>


                <div className="equipe-premium-pessoa-info">

                    <strong>
                        {p.nome}
                    </strong>

                    <span>
                        {p.cargo || "Cargo não informado"}
                    </span>

                </div>

            </div>

        ));
    }


    /* =========================================================
       LOADING
    ========================================================= */

    if (carregando) {

        return (

            <div className="equipe-premium-container">

                <div className="equipe-premium-topo">

                    <div className="equipe-premium-titulo-area">

                        <div className="equipe-premium-skeleton equipe-premium-sk-titulo"></div>

                        <div className="equipe-premium-skeleton equipe-premium-sk-subtitulo"></div>

                    </div>

                </div>


                <div className="equipe-premium-colunas">

                    {[1, 2, 3].map(coluna => (

                        <div
                            className="equipe-premium-coluna equipe-premium-coluna-loading"
                            key={coluna}
                        >

                            <div className="equipe-premium-coluna-cabecalho">

                                <div className="equipe-premium-skeleton equipe-premium-sk-cabecalho"></div>

                                <div className="equipe-premium-skeleton equipe-premium-sk-contador"></div>

                            </div>


                            {[1, 2, 3].map(item => (

                                <div
                                    className="equipe-premium-pessoa equipe-premium-pessoa-loading"
                                    key={item}
                                >

                                    <div className="equipe-premium-skeleton equipe-premium-sk-avatar"></div>

                                    <div className="equipe-premium-loading-info">

                                        <div className="equipe-premium-skeleton equipe-premium-sk-nome"></div>

                                        <div className="equipe-premium-skeleton equipe-premium-sk-cargo"></div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ))}

                </div>

            </div>

        );
    }


    /* =========================================================
       CONTEÚDO
    ========================================================= */

    return (

        <section className="equipe-premium-container">

            <div className="equipe-premium-topo">

                <div className="equipe-premium-titulo-area">

                    <span className="equipe-premium-etiqueta">
                        EQUIPE
                    </span>

                    <h2>
                        Funcionarios registrados
                    </h2>

                    <p>

                        {loja
                            ? `Equipe cadastrada em ${loja}`
                            : "Usuários cadastrados no sistema"
                        }

                    </p>

                </div>


                <div className="equipe-premium-total">

                    <span>
                        Total
                    </span>

                    <strong>

                        {
                            dados["Administrador(a)"].length +
                            dados["Supervisor(a)"].length +
                            dados["Funcionario(a)"].length
                        }

                    </strong>

                </div>

            </div>


            <div className="equipe-premium-colunas">

                {/* =================================================
                    ADMINISTRADORES
                ================================================= */}

                <div className="equipe-premium-coluna equipe-premium-administradores">

                    <div className="equipe-premium-coluna-cabecalho">

                        <div>

                            <h3>
                                Administradores
                            </h3>

                        </div>

                        <span className="equipe-premium-contador">

                            {dados["Administrador(a)"].length}

                        </span>

                    </div>


                    <div className="equipe-premium-lista">

                        {renderizarPessoas(
                            dados["Administrador(a)"]
                        )}

                    </div>

                </div>


                {/* =================================================
                    SUPERVISORES
                ================================================= */}

                <div className="equipe-premium-coluna equipe-premium-supervisores">

                    <div className="equipe-premium-coluna-cabecalho">

                        <div>

                            <h3>
                                Supervisores
                            </h3>

                        </div>

                        <span className="equipe-premium-contador">

                            {dados["Supervisor(a)"].length}

                        </span>

                    </div>


                    <div className="equipe-premium-lista">

                        {renderizarPessoas(
                            dados["Supervisor(a)"]
                        )}

                    </div>

                </div>


                {/* =================================================
                    FUNCIONÁRIOS
                ================================================= */}

                <div className="equipe-premium-coluna equipe-premium-funcionarios">

                    <div className="equipe-premium-coluna-cabecalho">

                        <div>

                            <h3>
                                Funcionários
                            </h3>

                        </div>

                        <span className="equipe-premium-contador">

                            {dados["Funcionario(a)"].length}

                        </span>

                    </div>


                    <div className="equipe-premium-lista">

                        {renderizarPessoas(
                            dados["Funcionario(a)"]
                        )}

                    </div>

                </div>

            </div>

        </section>

    );
}