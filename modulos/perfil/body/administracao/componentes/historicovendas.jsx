import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import PreviewProdutosVenda from "./previewprodutosvendas";
import "./historicovendas.css";

export default function HistoricoVendas() {

    const [previewAtivo, setPreviewAtivo] = useState(false);

    const [vendas, setVendas] = useState([]);
    const [limite, setLimite] = useState(20);
    const [carregando, setCarregando] = useState(true);
    const [vendaAtiva, setVendaAtiva] = useState(null);

    const [filtroProtocolo, setFiltroProtocolo] = useState("");
    const [filtroOperador, setFiltroOperador] = useState("");
    const [filtroValorMin, setFiltroValorMin] = useState("");
    const [filtroValorMax, setFiltroValorMax] = useState("");
    const [filtroDataMin, setFiltroDataMin] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const token = localStorage.getItem("token");


    /* =========================================================
       IDENTIFICAR COMÉRCIO
    ========================================================= */

    function obterComercioId() {

        try {

            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

            return usuario?.comercio_id || null;

        } catch (erro) {

            console.warn(
                "[HISTORICO VENDAS] Erro ao ler usuário:",
                erro
            );

            return null;
        }
    }


    /* =========================================================
       CHAVE DO CACHE POR COMÉRCIO
    ========================================================= */

    function obterChaveCache() {

        const comercioId = obterComercioId();

        if (!comercioId) {
            return null;
        }

        return `iron_historico_vendas_cache_${comercioId}`;
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

            const cache =
                JSON.parse(salvo);

            if (!Array.isArray(cache)) {

                throw new Error(
                    "Formato do cache inválido"
                );
            }

            return cache;

        } catch (erro) {

            console.warn(
                "[HISTORICO VENDAS] Cache inválido:",
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    /* =========================================================
       SALVAR CACHE
    ========================================================= */

    function salvarCache(novasVendas) {

        const chave = obterChaveCache();

        if (
            !chave ||
            !Array.isArray(novasVendas)
        ) {
            return;
        }

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(novasVendas)
            );

        } catch (erro) {

            console.warn(
                "[HISTORICO VENDAS] Erro ao salvar cache:",
                erro
            );
        }
    }


    /* =========================================================
       NORMALIZAR VENDAS PARA COMPARAÇÃO

       Ordenamos por ID.

       Se a API devolver os mesmos dados em uma ordem
       diferente, isso não será tratado como alteração.
    ========================================================= */

    function normalizarVendas(lista) {

        if (!Array.isArray(lista)) {
            return [];
        }

        return [...lista].sort((a, b) => {

            return String(a.id).localeCompare(
                String(b.id),
                undefined,
                {
                    numeric: true
                }
            );

        });
    }


    /* =========================================================
       COMPARAR CACHE X SERVIDOR
    ========================================================= */

    function vendasIguais(
        cache,
        servidor
    ) {

        if (
            !Array.isArray(cache) ||
            !Array.isArray(servidor)
        ) {
            return false;
        }


        if (
            cache.length !==
            servidor.length
        ) {
            return false;
        }


        try {

            const cacheNormalizado =
                normalizarVendas(cache);

            const servidorNormalizado =
                normalizarVendas(servidor);


            return (
                JSON.stringify(cacheNormalizado) ===
                JSON.stringify(servidorNormalizado)
            );

        } catch {

            return false;
        }
    }


    /* =========================================================
       TRADUZIR MÓDULO
    ========================================================= */

    function traduzirModulo(valor) {

        if (valor === 1) {
            return "Caixa";
        }

        if (valor === 4) {
            return "Online";
        }

        if (valor === 6) {
            return "Agendamento";
        }

        return "—";
    }


    /* =========================================================
       CARREGAR HISTÓRICO

       1. Cache
       2. Mostra imediatamente
       3. API
       4. Compara
       5. Atualiza se necessário
    ========================================================= */

    async function carregar() {

        /* =====================================================
           CACHE
        ===================================================== */

        const cache =
            lerCache();


        if (Array.isArray(cache)) {

            setVendas(cache);

            setCarregando(false);

            console.log(
                "[HISTORICO VENDAS] Histórico carregado do cache:",
                cache.length
            );

        } else {

            setCarregando(true);

        }


        /* =====================================================
           SERVIDOR
        ===================================================== */

        try {

            const resp = await fetch(
                `${API_URL}/admin/vendas`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                throw new Error(
                    `Erro ao carregar vendas: ${resp.status}`
                );
            }


            const resposta =
                await resp.json();


            const dadosServidor =
                Array.isArray(resposta)
                    ? resposta
                    : [];


            /* =================================================
               CACHE JÁ ESTÁ ATUALIZADO
            ================================================= */

            if (
                vendasIguais(
                    cache,
                    dadosServidor
                )
            ) {

                console.log(
                    "[HISTORICO VENDAS] Cache já está atualizado."
                );

                return;
            }


            /* =================================================
               HISTÓRICO MUDOU
            ================================================= */

            console.log(
                "[HISTORICO VENDAS] Alterações encontradas:",
                {
                    cache:
                        cache?.length || 0,

                    servidor:
                        dadosServidor.length
                }
            );


            setVendas(
                dadosServidor
            );


            salvarCache(
                dadosServidor
            );


            /* =================================================
               ATUALIZAR VENDA DO PREVIEW

               Se o preview estiver aberto e a venda tiver
               mudado no servidor, atualizamos também.
            ================================================= */

            setVendaAtiva(vendaAtual => {

                if (!vendaAtual) {
                    return null;
                }


                const vendaAtualizada =
                    dadosServidor.find(
                        venda =>
                            String(venda.id) ===
                            String(vendaAtual.id)
                    );


                return (
                    vendaAtualizada ||
                    null
                );
            });


            console.log(
                "[HISTORICO VENDAS] Cache atualizado."
            );


        } catch (erro) {

            console.error(
                "[HISTORICO VENDAS] Erro ao consultar servidor:",
                erro
            );


            /*
                Se temos cache, mantemos os dados.

                Se não temos cache e a API falhou,
                mostramos lista vazia.
            */

            if (!Array.isArray(cache)) {

                setVendas([]);

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
       FORMATAR HORA
    ========================================================= */

    function formatarHora(segundos) {

        const numeroSegundos =
            Number(segundos) || 0;


        const segundosAjustados =
            (
                numeroSegundos +
                3 * 3600
            ) % 86400;


        const h =
            Math.floor(
                segundosAjustados / 3600
            );


        const m =
            Math.floor(
                (
                    segundosAjustados %
                    3600
                ) / 60
            );


        const s =
            segundosAjustados % 60;


        return (
            `${String(h).padStart(2, "0")}:` +
            `${String(m).padStart(2, "0")}:` +
            `${String(s).padStart(2, "0")}`
        );
    }


    /* =========================================================
       ABRIR COMANDA
    ========================================================= */

    function abrirComanda(link) {

        if (!link) {
            return;
        }

        window.open(
            link,
            "_blank"
        );
    }


    /* =========================================================
       LOADING

       Se existir cache, esse loading praticamente
       não será exibido.
    ========================================================= */

    if (carregando) {

        return (

            <div className="hv-container">

                <p className="hv-loading">
                    Carregando...
                </p>

            </div>

        );
    }


    /* =========================================================
       FILTRAR VENDAS
    ========================================================= */

    const vendasFiltradas =
        vendas.filter(v => {


            /* =================================================
               PROTOCOLO
            ================================================= */

            if (
                filtroProtocolo &&
                Number(v.id) !==
                Number(filtroProtocolo)
            ) {

                return false;
            }


            /* =================================================
               OPERADOR
            ================================================= */

            if (filtroOperador) {

                const operador =
                    String(
                        v.operador || ""
                    ).toLowerCase();


                if (
                    !operador.includes(
                        filtroOperador.toLowerCase()
                    )
                ) {

                    return false;
                }
            }


            /* =================================================
               STATUS
            ================================================= */

            if (
                filtroStatus &&
                v.status !== filtroStatus
            ) {

                return false;
            }


            /* =================================================
               VALOR MÍNIMO
            ================================================= */

            if (
                filtroValorMin &&
                Number(v.valor_pago) <
                Number(filtroValorMin)
            ) {

                return false;
            }


            /* =================================================
               VALOR MÁXIMO
            ================================================= */

            if (
                filtroValorMax &&
                Number(v.valor_pago) >
                Number(filtroValorMax)
            ) {

                return false;
            }


            /* =================================================
               DATA MÍNIMA
            ================================================= */

            if (filtroDataMin) {

                const dataVenda =
                    new Date(v.data);


                const dataMinima =
                    new Date(filtroDataMin);


                if (
                    dataVenda <
                    dataMinima
                ) {

                    return false;
                }
            }


            return true;

        });


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="hv-container">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hv-header">

                <h4>
                    Histórico de Vendas
                </h4>


                <span className="hv-total">

                    {vendasFiltradas.length} vendas

                </span>

            </div>


            {/* =================================================
                FILTROS
            ================================================= */}

            <div className="hv-filtros">

                <input
                    type="number"
                    placeholder="Protocolo"
                    value={filtroProtocolo}
                    onChange={e =>
                        setFiltroProtocolo(
                            e.target.value
                        )
                    }
                />


                <input
                    type="text"
                    placeholder="Operador"
                    value={filtroOperador}
                    onChange={e =>
                        setFiltroOperador(
                            e.target.value
                        )
                    }
                />


                <input
                    type="number"
                    placeholder="Valor mínimo"
                    value={filtroValorMin}
                    onChange={e =>
                        setFiltroValorMin(
                            e.target.value
                        )
                    }
                />


                <input
                    type="number"
                    placeholder="Valor máximo"
                    value={filtroValorMax}
                    onChange={e =>
                        setFiltroValorMax(
                            e.target.value
                        )
                    }
                />


                <input
                    type="date"
                    value={filtroDataMin}
                    onChange={e =>
                        setFiltroDataMin(
                            e.target.value
                        )
                    }
                />


                <select
                    value={filtroStatus}
                    onChange={e =>
                        setFiltroStatus(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        Todos
                    </option>

                    <option value="pago">
                        Pago
                    </option>

                    <option value="cancelado">
                        Cancelado
                    </option>

                </select>


                <button
                    className={
                        `hv-toggle-preview ${previewAtivo
                            ? "ativo"
                            : ""
                        }`
                    }
                    onClick={() =>
                        setPreviewAtivo(
                            !previewAtivo
                        )
                    }
                    type="button"
                >
                    Preview
                </button>

            </div>


            {/* =================================================
                TABELA
            ================================================= */}

            <div className="hv-tabela-wrapper">

                <table className="hv-tabela">

                    <thead>

                        <tr>

                            <th>Data</th>
                            <th>Hora</th>
                            <th>Valor</th>
                            <th>Pagamento</th>
                            <th>Status</th>
                            <th>Operador</th>
                            <th>Maquininha</th>
                            <th>Módulo</th>
                            <th>Comprovante</th>

                        </tr>

                    </thead>


                    <tbody>

                        {vendasFiltradas
                            .slice(0, limite)
                            .map(v => (

                                <tr
                                    key={v.id}
                                    className={
                                        `hv-linha ${vendaAtiva?.id === v.id
                                            ? "hv-ativa"
                                            : ""
                                        }`
                                    }
                                    onMouseEnter={() =>
                                        setVendaAtiva(v)
                                    }
                                >

                                    <td>
                                        {v.data}
                                    </td>


                                    <td>
                                        {formatarHora(
                                            Number(v.hora)
                                        )}
                                    </td>


                                    <td className="hv-valor">

                                        R$ {
                                            Number(
                                                v.valor_pago
                                            ).toFixed(2)
                                        }

                                    </td>


                                    <td
                                        className={
                                            `hv-pagamento ` +
                                            `hv-pagamento-${v.pagamento}`
                                        }
                                    >
                                        {v.pagamento}
                                    </td>


                                    <td
                                        className={
                                            `hv-status ` +
                                            `hv-status-${v.status}`
                                        }
                                    >
                                        {v.status}
                                    </td>


                                    <td>
                                        {v.operador}
                                    </td>


                                    <td>
                                        {v.maquininha || "-"}
                                    </td>


                                    <td
                                        className={
                                            `hv-modulo ` +
                                            `hv-modulo-${v.modulo}`
                                        }
                                    >
                                        {traduzirModulo(
                                            v.modulo
                                        )}
                                    </td>


                                    <td>

                                        {v.comanda ? (

                                            <button
                                                className="hv-botao-comanda"
                                                onClick={() =>
                                                    abrirComanda(
                                                        v.comanda
                                                    )
                                                }
                                            >
                                                Ver comanda
                                            </button>

                                        ) : (

                                            "—"

                                        )}

                                    </td>

                                </tr>

                            ))
                        }

                    </tbody>

                </table>


                {/* =================================================
                    VER MAIS
                ================================================= */}

                {limite <
                    vendasFiltradas.length && (

                        <div className="hv-ver-mais">

                            <button
                                onClick={() =>
                                    setLimite(
                                        limite + 20
                                    )
                                }
                            >
                                Ver mais
                            </button>

                        </div>

                    )}

            </div>


            {/* =================================================
                PREVIEW
            ================================================= */}

            {previewAtivo && (

                <PreviewProdutosVenda
                    venda={vendaAtiva}
                />

            )}

        </div>
    );
}