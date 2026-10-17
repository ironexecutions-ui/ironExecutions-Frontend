import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { API_URL } from "../../../../../config";
import "./relatorios.css";

const moeda = (valor) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(valor) || 0);

const dataBR = (valor) => {
    if (!valor) return "—";

    const partes = String(valor).slice(0, 10).split("-");

    return partes.length === 3
        ? `${partes[2]}/${partes[1]}/${partes[0]}`
        : valor;
};

const mesBR = (valor) => {
    if (!valor) return "Mês não informado";

    const [ano, mes] = String(valor).slice(0, 7).split("-");
    const data = new Date(Number(ano), Number(mes) - 1, 1);

    return data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
};

const nomeComercio = (comercio) =>
    comercio?.loja || `Comércio ${comercio?.id ?? ""}`;

function AvatarComercio({
    imagem,
    nome,
    className = "",
}) {
    const [imagemFalhou, setImagemFalhou] = useState(false);

    useEffect(() => {
        setImagemFalhou(false);
    }, [imagem]);

    const inicial = (nome || "?").trim().charAt(0).toUpperCase();

    return (
        <span className={`${className} rel-logo-comercio`}>
            {imagem && !imagemFalhou ? (
                <img
                    src={imagem}
                    alt={`Logo de ${nome || "comércio"}`}
                    loading="lazy"
                    onError={() => setImagemFalhou(true)}
                />
            ) : (
                <span aria-hidden="true">{inicial || "?"}</span>
            )}
        </span>
    );
}

export default function Relatorios() {
    const [resumos, setResumos] = useState([]);
    const [fretes, setFretes] = useState([]);
    const [indicados, setIndicados] = useState([]);
    const [indicadoSelecionado, setIndicadoSelecionado] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [busca, setBusca] = useState("");

    const token = localStorage.getItem("token");

    const carregar = useCallback(async (idIndicado = null) => {
        setCarregando(true);
        setErro("");

        try {
            const parametros = new URLSearchParams();

            if (idIndicado !== null) {
                parametros.set("indicado_id", String(idIndicado));
            }

            const query = parametros.toString();

            const url = `${API_URL}/painel/relatorios-parceiros${query ? `?${query}` : ""
                }`;

            const resposta = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados.detail || "Não foi possível carregar os relatórios."
                );
            }

            setResumos(
                Array.isArray(dados.resumos_mensais)
                    ? dados.resumos_mensais
                    : []
            );

            setFretes(
                Array.isArray(dados.fretes)
                    ? dados.fretes
                    : []
            );

            setIndicados(
                Array.isArray(dados.indicados)
                    ? dados.indicados
                    : []
            );

            setIndicadoSelecionado(idIndicado);
        } catch (e) {
            setErro(e.message || "Erro ao conectar com o servidor.");
            setResumos([]);
            setFretes([]);
            setIndicados([]);
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregar(null);
    }, [carregar]);

    const nomeIndicado = useMemo(() => {
        if (indicadoSelecionado === null) {
            return "Todos os indicados";
        }

        const indicado = indicados.find(
            (item) => Number(item.id) === Number(indicadoSelecionado)
        );

        return indicado
            ? nomeComercio(indicado)
            : `Comércio ${indicadoSelecionado}`;
    }, [indicados, indicadoSelecionado]);

    const fretesFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");

        if (!termo) return fretes;

        return fretes.filter((item) =>
            [
                item.venda_id,
                item.comercio_loja,
                item.transportadora,
                item.comercio_indicado_id,
                item.frete_id,
            ]
                .filter((valor) => valor !== null && valor !== undefined)
                .some((valor) =>
                    String(valor).toLocaleLowerCase("pt-BR").includes(termo)
                )
        );
    }, [fretes, busca]);

    const indicadores = useMemo(() => ({
        compras: new Set(
            fretes.map((item) => item.venda_id)
        ).size,

        totalFretes: fretes.reduce(
            (total, item) => total + Number(item.valor_frete || 0),
            0
        ),

        comissao: fretes.reduce(
            (total, item) => total + Number(item.comissao || 0),
            0
        ),

        previsto: resumos.reduce(
            (total, item) => total + Number(item.valor_devido || 0),
            0
        ),
    }), [fretes, resumos]);

    const selecionarIndicado = (id) => {
        setBusca("");
        carregar(id);
    };

    return (
        <main className="rel-painel">
            <header className="rel-header">
                <div className="rel-header-texto">
                    <span className="rel-eyebrow">
                        GESTÃO DE PARCERIAS
                    </span>

                    <h1>Relatórios financeiros</h1>

                    <p>
                        Acompanhe o desempenho dos indicados, os fretes e
                        as comissões mensais.
                    </p>
                </div>

                <button
                    type="button"
                    className="rel-atualizar"
                    onClick={() => carregar(indicadoSelecionado)}
                    disabled={carregando}
                >
                    <span className="rel-icone-atualizar">↻</span>
                    Atualizar dados
                </button>
            </header>

            <section className="rel-regra">
                <div className="rel-regra-icone">
                    <span>R$</span>
                </div>

                <div className="rel-regra-conteudo">
                    <div className="rel-regra-titulo">
                        <h2>Como funciona sua comissão</h2>
                        <span className="rel-regra-tag">Regra mensal</span>
                    </div>

                    <p>
                        Você recebe <strong>10% do valor dos fretes</strong>
                        {" "}de cada comércio indicado. Quando a comissão
                        individual ficar abaixo de <strong>R$ 20,00 no mês</strong>,
                        o valor devido por esse indicado será de R$ 20,00.
                        Quando superar esse mínimo, vale o valor calculado.
                    </p>

                    <div className="rel-regra-rodape">
                        <span className="rel-regra-ponto" />
                        Pagamento previsto para o dia 1º do mês seguinte
                        ao período apurado.
                    </div>
                </div>
            </section>

            <section className="rel-indicadores">
                <article className="rel-indicador">
                    <div className="rel-indicador-topo">
                        <span>Compras registradas</span>
                        <span className="rel-indicador-icone">#</span>
                    </div>

                    <strong>{indicadores.compras}</strong>
                    <small>Compras distintas no histórico carregado</small>
                </article>

                <article className="rel-indicador">
                    <div className="rel-indicador-topo">
                        <span>Valor dos fretes</span>
                        <span className="rel-indicador-icone">R$</span>
                    </div>

                    <strong>{moeda(indicadores.totalFretes)}</strong>
                    <small>Total dos fretes carregados</small>
                </article>

                <article className="rel-indicador">
                    <div className="rel-indicador-topo">
                        <span>Comissão calculada</span>
                        <span className="rel-indicador-icone">%</span>
                    </div>

                    <strong>{moeda(indicadores.comissao)}</strong>
                    <small>10% dos fretes carregados</small>
                </article>


            </section>

            <section className="rel-secao rel-secao-indicados">
                <div className="rel-secao-header">
                    <div>
                        <span className="rel-secao-legenda">
                            FILTRO DE RELATÓRIO
                        </span>

                        <h2>Seus indicados</h2>

                        <p>
                            Selecione um comércio para consultar somente
                            os valores e as compras dele.
                        </p>
                    </div>

                    <span className="rel-contagem">
                        {indicados.length}{" "}
                        {indicados.length === 1 ? "indicado" : "indicados"}
                    </span>
                </div>

                <div className="rel-filtros">
                    <button
                        type="button"
                        className={`rel-filtro ${indicadoSelecionado === null ? "selecionado" : ""
                            }`}
                        onClick={() => selecionarIndicado(null)}
                        disabled={carregando}
                    >
                        <span className="rel-filtro-indicador" />
                        Todos os indicados
                    </button>

                    {indicados.map((indicado) => (
                        <button
                            type="button"
                            key={indicado.id}
                            className={`rel-filtro ${Number(indicadoSelecionado) === Number(indicado.id)
                                ? "selecionado"
                                : ""
                                }`}
                            onClick={() => selecionarIndicado(indicado.id)}
                            disabled={carregando}
                            title={`ID ${indicado.id}`}
                        >
                            <AvatarComercio
                                imagem={indicado.imagem}
                                nome={indicado.loja}
                                className="rel-filtro-avatar"
                            />

                            <span className="rel-filtro-nome">
                                {nomeComercio(indicado)}
                            </span>
                        </button>
                    ))}
                </div>

                {indicadoSelecionado !== null && (
                    <div className="rel-filtro-ativo">
                        <span>
                            Exibindo relatório de{" "}
                            <strong>{nomeIndicado}</strong>
                        </span>

                        <button
                            type="button"
                            onClick={() => selecionarIndicado(null)}
                            disabled={carregando}
                        >
                            Limpar filtro
                        </button>
                    </div>
                )}
            </section>

            {erro && (
                <div className="rel-alerta-erro" role="alert">
                    <span className="rel-alerta-icone">!</span>

                    <div>
                        <strong>Não foi possível carregar os dados</strong>
                        <p>{erro}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => carregar(indicadoSelecionado)}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {carregando ? (
                <div className="rel-carregando">
                    <span className="rel-spinner" />
                    <strong>Atualizando relatório</strong>
                    <span>Buscando compras, fretes e comissões...</span>
                </div>
            ) : !erro ? (
                <>
                    <section className="rel-secao">
                        <div className="rel-secao-header">
                            <div>
                                <span className="rel-secao-legenda">
                                    ACOMPANHAMENTO FINANCEIRO
                                </span>

                                <h2>Resumo mensal</h2>

                                <p>
                                    Valores devidos por mês para{" "}
                                    {nomeIndicado.toLowerCase()}.
                                </p>
                            </div>

                            <span className="rel-data-pagamento">
                                <span className="rel-pagamento-ponto" />
                                Vencimento: dia 1º
                            </span>
                        </div>

                        {resumos.length === 0 ? (
                            <div className="rel-vazio">
                                <div className="rel-vazio-icone">—</div>
                                <h3>Nenhum resumo disponível</h3>
                                <p>
                                    Não há valores mensais devidos para este filtro.
                                </p>
                            </div>
                        ) : (
                            <div className="rel-meses">
                                {resumos.map((item) => (
                                    <article
                                        className="rel-mes-card"
                                        key={item.mes}
                                    >
                                        <div className="rel-mes-topo">
                                            <div>
                                                <span className="rel-mes-legenda">
                                                    PERÍODO
                                                </span>

                                                <h3>{mesBR(item.mes)}</h3>
                                            </div>

                                            <span className="rel-situacao pendente">
                                                A pagar
                                            </span>
                                        </div>

                                        <div className="rel-mes-dados">
                                            <div className="rel-mes-linha">
                                                <span>Indicações com fretes</span>
                                                <strong>
                                                    {item.quantidade_indicados ?? 0}
                                                </strong>
                                            </div>

                                            <div className="rel-mes-linha">
                                                <span>Valor total dos fretes</span>
                                                <strong>
                                                    {moeda(item.total_fretes)}
                                                </strong>
                                            </div>

                                            <div className="rel-mes-linha">
                                                <span>Comissão calculada (10%)</span>
                                                <strong>
                                                    {moeda(item.comissao_calculada)}
                                                </strong>
                                            </div>
                                        </div>

                                        {indicadoSelecionado === null &&
                                            item.detalhes_indicados?.length > 0 && (
                                                <div className="rel-detalhes-indicados">
                                                    <div className="rel-detalhes-cabecalho">
                                                        <span>Valor por indicado</span>
                                                        <span>Devido</span>
                                                    </div>

                                                    {item.detalhes_indicados.map(
                                                        (detalhe) => {
                                                            const indicado =
                                                                indicados.find(
                                                                    (loja) =>
                                                                        Number(loja.id) ===
                                                                        Number(
                                                                            detalhe.comercio_indicado_id
                                                                        )
                                                                );

                                                            return (
                                                                <div
                                                                    className="rel-detalhe-indicado"
                                                                    key={
                                                                        detalhe.comercio_indicado_id
                                                                    }
                                                                >
                                                                    <div className="rel-detalhe-identidade">
                                                                        <AvatarComercio
                                                                            imagem={indicado?.imagem}
                                                                            nome={detalhe.comercio_loja}
                                                                            className="rel-detalhe-avatar"
                                                                        />

                                                                        <div>
                                                                            <strong>
                                                                                {detalhe.comercio_loja ||
                                                                                    `Comércio ${detalhe.comercio_indicado_id}`}
                                                                            </strong>

                                                                            <span>
                                                                                Comissão:{" "}
                                                                                {moeda(
                                                                                    detalhe.comissao_calculada
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <strong className="rel-detalhe-valor">
                                                                        {moeda(
                                                                            detalhe.valor_devido
                                                                        )}
                                                                    </strong>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}

                                        <div className="rel-mes-total">
                                            <span>Valor mensal devido</span>
                                            <strong>
                                                {moeda(item.valor_devido)}
                                            </strong>
                                        </div>

                                        <div className="rel-vencimento">
                                            <span>Pagamento previsto</span>
                                            <strong>
                                                {dataBR(item.data_pagamento)}
                                            </strong>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rel-secao rel-secao-historico">
                        <div className="rel-secao-header rel-historico-header">
                            <div>
                                <span className="rel-secao-legenda">
                                    MOVIMENTAÇÕES
                                </span>

                                <h2>Histórico de compras e fretes</h2>

                                <p>
                                    Consulte os registros vinculados aos
                                    seus comércios indicados.
                                </p>
                            </div>

                            <span className="rel-contagem">
                                {fretesFiltrados.length} registros
                            </span>
                        </div>

                        <div className="rel-historico-ferramentas">
                            <label className="rel-busca">
                                <span aria-hidden="true">⌕</span>

                                <input
                                    type="search"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar compra, indicado ou transportadora..."
                                />

                                {busca && (
                                    <button
                                        type="button"
                                        onClick={() => setBusca("")}
                                        aria-label="Limpar busca"
                                    >
                                        ×
                                    </button>
                                )}
                            </label>

                            <span className="rel-historico-contexto">
                                {nomeIndicado}
                            </span>
                        </div>

                        {fretesFiltrados.length === 0 ? (
                            <div className="rel-vazio">
                                <div className="rel-vazio-icone">⌕</div>
                                <h3>Nenhum registro encontrado</h3>

                                <p>
                                    {busca
                                        ? "Tente buscar por outro termo."
                                        : "Não há compras ou fretes para este filtro."}
                                </p>
                            </div>
                        ) : (
                            <div className="rel-tabela-wrapper">
                                <table className="rel-tabela">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Comércio indicado</th>
                                            <th>ID da compra</th>
                                            <th>Valor da compra</th>
                                            <th>Valor do frete</th>
                                            <th>Transportadora</th>
                                            <th>Comissão (10%)</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {fretesFiltrados.map((item) => (
                                            <tr key={item.frete_id}>
                                                <td className="rel-data-celula">
                                                    {dataBR(item.data_compra)}
                                                </td>

                                                <td>
                                                    <div className="rel-comercio-celula">
                                                        <AvatarComercio
                                                            imagem={item.comercio_imagem}
                                                            nome={item.comercio_loja}
                                                            className="rel-comercio-avatar"
                                                        />

                                                        <span>
                                                            {item.comercio_loja ||
                                                                `Comércio ${item.comercio_indicado_id}`}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="rel-id">
                                                        #{item.venda_id}
                                                    </span>
                                                </td>

                                                <td>{moeda(item.valor_compra)}</td>
                                                <td>{moeda(item.valor_frete)}</td>

                                                <td>
                                                    <span className="rel-transportadora">
                                                        {item.transportadora ||
                                                            "Não informada"}
                                                    </span>
                                                </td>

                                                <td className="rel-comissao">
                                                    {moeda(item.comissao)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <footer className="rel-tabela-rodape">
                            <span>
                                Exibindo {fretesFiltrados.length} de{" "}
                                {fretes.length} registros
                            </span>

                            <span>Valores em reais (BRL)</span>
                        </footer>
                    </section>
                </>
            ) : null}
        </main>
    );
}