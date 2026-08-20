import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../../config";
import "./contabilidade.css";
import ContabilidadePdf from "./pdf";

export default function Contabilidade() {

    const [dados, setDados] = useState(null);
    const [modo, setModo] = useState("lista");

    const [filtro, setFiltro] = useState("");

    const [editandoId, setEditandoId] = useState(null);
    const [valorEdicao, setValorEdicao] = useState("");

    const [busca, setBusca] = useState("");
    const [produto, setProduto] = useState(null);
    const [quantos, setQuantos] = useState("");

    const token = localStorage.getItem("token");


    /* =========================================================
       DESCOBRIR COMÉRCIO
    ========================================================= */

    function obterComercioId() {

        try {

            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

            return usuario?.comercio_id || null;

        } catch (erro) {

            console.warn(
                "[CONTABILIDADE] Erro ao ler usuário:",
                erro
            );

            return null;
        }
    }


    /* =========================================================
       CHAVE DO CACHE POR COMÉRCIO
    ========================================================= */

    function obterChaveCache() {

        const comercioId =
            obterComercioId();

        if (!comercioId) {
            return null;
        }

        return `iron_contabilidade_cache_${comercioId}`;
    }


    /* =========================================================
       LER CACHE
    ========================================================= */

    function lerCache() {

        const chave =
            obterChaveCache();

        if (!chave) {
            return null;
        }

        try {

            const salvo =
                localStorage.getItem(chave);

            if (!salvo) {
                return null;
            }

            const cache =
                JSON.parse(salvo);


            /*
                Garantimos que o formato mínimo
                esperado da contabilidade existe.
            */

            if (
                !cache ||
                !Array.isArray(cache.produtos)
            ) {

                throw new Error(
                    "Formato do cache inválido"
                );
            }


            return cache;

        } catch (erro) {

            console.warn(
                "[CONTABILIDADE] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCache(novosDados) {

        const chave =
            obterChaveCache();

        if (!chave || !novosDados) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(novosDados)
            );

        } catch (erro) {

            console.warn(
                "[CONTABILIDADE] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       NORMALIZAR PARA COMPARAÇÃO

       Ordenamos produtos por ID.

       Assim, se o servidor devolver os mesmos produtos
       em ordem diferente, isso não será considerado mudança.
    ========================================================= */

    function normalizarDados(valor) {

        if (!valor) {
            return null;
        }


        const produtosNormalizados =
            Array.isArray(valor.produtos)
                ? [...valor.produtos].sort(
                    (a, b) => {

                        return String(a.id).localeCompare(
                            String(b.id),
                            undefined,
                            {
                                numeric: true
                            }
                        );

                    }
                )
                : [];


        return {
            ...valor,
            produtos: produtosNormalizados
        };
    }


    /* =========================================================
       COMPARAR CACHE COM SERVIDOR
    ========================================================= */

    function dadosIguais(
        cache,
        servidor
    ) {

        if (!cache || !servidor) {
            return false;
        }

        try {

            const cacheNormalizado =
                normalizarDados(cache);

            const servidorNormalizado =
                normalizarDados(servidor);


            return (
                JSON.stringify(cacheNormalizado) ===
                JSON.stringify(servidorNormalizado)
            );

        } catch {

            return false;
        }
    }


    /* =========================================================
       CARREGAR CONTABILIDADE

       cache primeiro
       servidor depois
    ========================================================= */

    async function carregar() {

        /* =====================================================
           1. PROCURA CACHE
        ===================================================== */

        const cache =
            lerCache();


        /* =====================================================
           2. MOSTRA CACHE IMEDIATAMENTE
        ===================================================== */

        if (cache) {

            setDados(cache);

            console.log(
                "[CONTABILIDADE] Dados carregados do cache."
            );
        }


        /* =====================================================
           3. CONSULTA SERVIDOR
        ===================================================== */

        try {

            const resp = await fetch(
                `${API_URL}/admin/contabilidade`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro contabilidade: ${resp.status}`
                );
            }


            const dadosServidor =
                await resp.json();


            if (
                !dadosServidor ||
                !Array.isArray(dadosServidor.produtos)
            ) {

                throw new Error(
                    "Resposta da contabilidade inválida"
                );
            }


            /* =================================================
               4. COMPARAR
            ================================================= */

            const iguais =
                dadosIguais(
                    cache,
                    dadosServidor
                );


            /* =================================================
               5. NÃO MUDOU
            ================================================= */

            if (iguais) {

                console.log(
                    "[CONTABILIDADE] Cache já está atualizado."
                );


                /*
                    Normalmente o cache já foi colocado
                    no state.

                    Essa condição também cobre situações
                    onde carregar() for chamado manualmente.
                */

                if (!cache) {

                    setDados(
                        dadosServidor
                    );
                }

                return;
            }


            /* =================================================
               6. SERVIDOR ESTÁ DIFERENTE
            ================================================= */

            console.log(
                "[CONTABILIDADE] Alterações detectadas. Atualizando."
            );


            setDados(
                dadosServidor
            );


            salvarCache(
                dadosServidor
            );


            console.log(
                "[CONTABILIDADE] Cache atualizado."
            );


        } catch (erro) {

            console.error(
                "[CONTABILIDADE] Erro ao consultar servidor:",
                erro
            );


            /*
                Se temos cache, continuamos mostrando.

                Só ficamos sem dados quando:
                API falhou
                E
                não existe cache.
            */

            if (!cache) {

                setDados(null);

            }
        }
    }


    /* =========================================================
       CARREGAR AO ENTRAR
    ========================================================= */

    useEffect(() => {

        carregar();

    }, []);


    /* =========================================================
       BUSCAR PRODUTO
    ========================================================= */

    async function buscarProduto() {

        try {

            const resp = await fetch(
                `${API_URL}/admin/produtos-servicos?codigo_barras=${encodeURIComponent(busca)}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao buscar produto: ${resp.status}`
                );
            }


            const lista =
                await resp.json();


            setProduto(
                Array.isArray(lista)
                    ? lista[0] || null
                    : null
            );


        } catch (erro) {

            console.error(
                "[CONTABILIDADE] Erro ao buscar produto:",
                erro
            );

            setProduto(null);

        }
    }


    /* =========================================================
       SALVAR AJUSTE
    ========================================================= */

    async function salvarAjuste(
        produto_id,
        quantosValor
    ) {

        try {

            const resp = await fetch(
                `${API_URL}/admin/contabilidade/ajustar`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        produto_id,
                        quantos:
                            parseInt(
                                quantosValor,
                                10
                            )
                    })
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao ajustar contabilidade: ${resp.status}`
                );
            }


            setEditandoId(null);

            setValorEdicao("");


            /*
                carregar() consulta novamente o servidor.

                Quando receber a quantidade nova,
                também atualiza o cache.
            */

            await carregar();


        } catch (erro) {

            console.error(
                "[CONTABILIDADE] Erro ao salvar ajuste:",
                erro
            );
        }
    }


    /* =========================================================
       LOADING

       Com cache existente, praticamente não aparecerá.
    ========================================================= */

    if (!dados) {

        return (
            <p>
                Carregando...
            </p>
        );
    }


    /* =========================================================
       FILTRO
    ========================================================= */

    const termo =
        filtro
            .trim()
            .toLowerCase();


    const produtosFiltrados =
        dados.produtos.filter(p => {

            const nomeProduto =
                String(
                    p.nome || ""
                ).toLowerCase();


            const codigoProduto =
                String(
                    p.codigo_barras || ""
                ).toLowerCase();


            return (
                nomeProduto.includes(termo) ||
                codigoProduto.includes(termo)
            );

        });


    /* =========================================================
       CONTABILIZADOS
    ========================================================= */

    const produtosContabilizados =
        produtosFiltrados.filter(
            p => !p.nao_somado
        );


    /* =========================================================
       NÃO CONTABILIZADOS
    ========================================================= */

    const produtosNaoContabilizados =
        produtosFiltrados.filter(
            p => p.nao_somado
        );


    /* =========================================================
       VERIFICAR NEGATIVOS
    ========================================================= */

    const existeNegativo =
        produtosContabilizados.some(
            p => p.negativo
        );


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="contabilidade-container">

            <h4>
                Contabilidade
            </h4>


            {/* =================================================
                AVISO DE DIVERGÊNCIA
            ================================================= */}

            {existeNegativo && (

                <p className="contabilidade-aviso erro">

                    ⚠️ Atenção: foram identificadas divergências no estoque.
                    A quantidade registrada de alguns produtos não está compatível
                    com o volume de vendas realizadas. Verifique os itens destacados
                    em vermelho para correção.

                </p>

            )}


            {/* =================================================
                LISTA PRINCIPAL
            ================================================= */}

            {modo === "lista" && (

                <>

                    <div className="contabilidade-topo">

                        <input
                            placeholder="Filtrar por nome ou código de barras"
                            value={filtro}
                            onChange={e =>
                                setFiltro(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <ContabilidadePdf />


                    <ul className="contabilidade-lista">

                        {produtosContabilizados.map(p => (

                            <li
                                key={p.id}
                                className={
                                    p.negativo
                                        ? "produto-negativo"
                                        : ""
                                }
                            >

                                <span>
                                    {p.nome}
                                </span>


                                {editandoId === p.id ? (

                                    <input
                                        type="number"
                                        autoFocus
                                        value={
                                            valorEdicao
                                        }
                                        onChange={e =>
                                            setValorEdicao(
                                                e.target.value
                                            )
                                        }
                                        onBlur={() => {

                                            setEditandoId(null);

                                            setValorEdicao("");

                                        }}
                                        onKeyDown={e => {

                                            if (
                                                e.key === "Enter" &&
                                                valorEdicao !== ""
                                            ) {

                                                salvarAjuste(
                                                    p.id,
                                                    valorEdicao
                                                );

                                            }
                                        }}
                                    />

                                ) : (

                                    <strong
                                        className={
                                            p.negativo
                                                ? "quantidade-clicavel quantidade-negativa"
                                                : "quantidade-clicavel"
                                        }
                                        onClick={() => {

                                            setEditandoId(
                                                p.id
                                            );

                                            setValorEdicao("");

                                        }}
                                    >

                                        {p.quantidade}

                                    </strong>

                                )}

                            </li>

                        ))}

                    </ul>


                    {dados.sem_contagem > 0 && (

                        <p className="contabilidade-aviso">

                            Existem {dados.sem_contagem} produtos ainda não contados

                        </p>

                    )}

                </>

            )}


            {/* =================================================
                PRODUTOS NÃO CONTABILIZADOS
            ================================================= */}

            {produtosNaoContabilizados.length > 0 && (

                <>

                    <h5 className="titulo-nao-contabilizados">
                        Produtos ainda não contabilizados
                    </h5>


                    <ul className="contabilidade-lista nao-contabilizados">

                        {produtosNaoContabilizados.map(p => (

                            <li
                                key={p.id}
                                className="produto-nao-somado"
                            >

                                <span>
                                    {p.nome}
                                </span>


                                {editandoId === p.id ? (

                                    <input
                                        type="number"
                                        autoFocus
                                        value={
                                            valorEdicao
                                        }
                                        onChange={e =>
                                            setValorEdicao(
                                                e.target.value
                                            )
                                        }
                                        onBlur={() => {

                                            setEditandoId(null);

                                            setValorEdicao("");

                                        }}
                                        onKeyDown={e => {

                                            if (
                                                e.key === "Enter" &&
                                                valorEdicao !== ""
                                            ) {

                                                salvarAjuste(
                                                    p.id,
                                                    valorEdicao
                                                );

                                            }
                                        }}
                                    />

                                ) : (

                                    <strong
                                        className="quantidade-clicavel quantidade-nao-somada"
                                        onClick={() => {

                                            setEditandoId(
                                                p.id
                                            );

                                            setValorEdicao("");

                                        }}
                                    >

                                        {p.quantidade}

                                    </strong>

                                )}

                            </li>

                        ))}

                    </ul>

                </>

            )}

        </div>

    );
}