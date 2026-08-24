import React, { useEffect, useState } from "react";
import FormularioFiscal from "./formulariofiscal";
import { API_URL } from "../../../../../config";
import "./registradosfiscal.css";

export default function RegistradosFiscal() {

    const [tipo, setTipo] = useState("produto");
    const [lista, setLista] = useState([]);
    const [editando, setEditando] = useState(null);

    const [filtroNome, setFiltroNome] = useState("");
    const [filtroCodigo, setFiltroCodigo] = useState("");
    const [limiteVisivel, setLimiteVisivel] = useState(8);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const token = localStorage.getItem("token");


    // =====================================================
    // CARREGAR REGISTRADOS
    // =====================================================

    async function carregar() {

        setCarregando(true);
        setErro("");

        try {

            const resp = await fetch(
                `${API_URL}/fiscal/registrados?tipo=${tipo}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resp.json();

            console.log(
                "[RegistradosFiscal] Resposta /registrados:",
                dados
            );

            if (!resp.ok) {
                throw new Error(
                    dados.detail ||
                    "Erro ao carregar registros fiscais"
                );
            }

            if (!Array.isArray(dados)) {

                console.error(
                    "[RegistradosFiscal] A resposta não é uma lista:",
                    dados
                );

                setLista([]);
                return;
            }

            setLista(dados);

        } catch (erroCarregar) {

            console.error(
                "[RegistradosFiscal] Erro:",
                erroCarregar
            );

            setErro(
                erroCarregar.message ||
                "Erro ao carregar registros fiscais"
            );

            setLista([]);

        } finally {

            setCarregando(false);

        }
    }


    // =====================================================
    // RECARREGAR QUANDO TROCAR O TIPO
    // =====================================================
    useEffect(() => {

        carregar();

        setEditando(null);
        setFiltroNome("");
        setFiltroCodigo("");
        setLimiteVisivel(8);

    }, [tipo]);


    // =====================================================
    // TEXTO DA UNIDADE
    // =====================================================

    function textoUnidade(item) {

        if (item.unidade) {
            return item.unidade;
        }

        if (item.unidades) {
            return `${item.unidades} unidades`;
        }

        if (item.tempo_servico) {
            return item.tempo_servico;
        }

        return "-";
    }


    // =====================================================
    // ABRIR EDIÇÃO
    // =====================================================

    function abrirEdicao(item) {

        console.log(
            "[RegistradosFiscal] CLICOU EM EDITAR:",
            item
        );

        const produtoId = item.produto_id;

        console.log(
            "[RegistradosFiscal] fiscal_id:",
            item.fiscal_id
        );

        console.log(
            "[RegistradosFiscal] produto_id:",
            produtoId
        );

        console.log(
            "[RegistradosFiscal] id:",
            item.id
        );

        if (!produtoId) {

            console.error(
                "[RegistradosFiscal] ERRO: produto_id não veio do backend.",
                item
            );

            setErro(
                "Este registro fiscal não possui produto_id. A rota /fiscal/registrados precisa retornar o produto_id."
            );

            return;
        }

        setErro("");

        setEditando({
            ...item,
            produto_id: produtoId
        });

        setTimeout(() => {

            const formulario = document.getElementById(
                "registrados-fiscal-formulario-edicao"
            );

            if (formulario) {
                formulario.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }, 100);
    }


    // =====================================================
    // FILTROS
    // =====================================================

    const listaFiltrada = lista.filter(item => {

        const nome = String(
            item.nome || ""
        ).toLowerCase();

        const codigo = String(
            item.codigo_barras || ""
        );

        const nomeOk = nome.includes(
            filtroNome.toLowerCase()
        );

        const codigoOk = codigo.includes(
            filtroCodigo
        );

        return nomeOk && codigoOk;
    });

    const listaVisivel = listaFiltrada.slice(
        0,
        limiteVisivel
    );

    const temMaisRegistros =
        limiteVisivel < listaFiltrada.length;

    const quantidadeRestante =
        listaFiltrada.length - limiteVisivel;
    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="registrados-fiscal">

            <h4>
                Dados Fiscais Registrados
            </h4>


            {/* =================================================
                FILTROS
            ================================================= */}

            <div className="registrados-fiscal-filtros">

                <select
                    value={tipo}
                    onChange={e =>
                        setTipo(e.target.value)
                    }
                >

                    <option value="produto">
                        Produtos
                    </option>

                    <option value="servico">
                        Serviços
                    </option>

                </select>


                <input
                    placeholder="Filtrar por nome"
                    value={filtroNome}
                    onChange={e => {
                        setFiltroNome(e.target.value);
                        setLimiteVisivel(8);
                    }}
                />


                <input
                    placeholder="Filtrar por código de barras"
                    value={filtroCodigo}
                    onChange={e => {
                        setFiltroCodigo(e.target.value);
                        setLimiteVisivel(8);
                    }}
                />

            </div>


            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (

                <div className="registrados-fiscal-erro">
                    {erro}
                </div>

            )}


            {/* =================================================
                CARREGANDO
            ================================================= */}

            {carregando && (

                <div className="registrados-fiscal-carregando">
                    Carregando registros...
                </div>

            )}


            {/* =================================================
                TABELA
            ================================================= */}

            {!carregando && (

                <table>

                    <thead>

                        <tr>

                            <th>
                                Nome
                            </th>

                            <th>
                                Unidade
                            </th>

                            <th>
                                CFOP
                            </th>

                            <th>
                                CST
                            </th>

                            <th>
                                Ações
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {listaVisivel.map(item => (
                            <tr
                                key={
                                    item.fiscal_id ||
                                    item.produto_id ||
                                    item.id
                                }
                            >

                                <td>
                                    {item.nome}
                                </td>

                                <td>
                                    {textoUnidade(item)}
                                </td>

                                <td>
                                    {item.cfop || "-"}
                                </td>

                                <td>
                                    {item.cst_csosn || "-"}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            abrirEdicao(item)
                                        }
                                    >
                                        Editar
                                    </button>

                                </td>

                            </tr>

                        ))}


                        {listaFiltrada.length === 0 && (

                            <tr>

                                <td
                                    colSpan="5"
                                    style={{
                                        opacity: 0.6
                                    }}
                                >
                                    Nenhum registro encontrado
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            )}

            {temMaisRegistros && (

                <div className="registrados-fiscal-ver-mais-area">

                    <button
                        type="button"
                        className="registrados-fiscal-ver-mais"
                        onClick={() =>
                            setLimiteVisivel(anterior =>
                                anterior + 8
                            )
                        }
                    >
                        Ver mais 8
                    </button>

                    <span>
                        Exibindo {listaVisivel.length} de {listaFiltrada.length}
                    </span>

                </div>

            )}
            {/* =================================================
                FORMULÁRIO DE EDIÇÃO
            ================================================= */}

            {editando && (

                <div
                    id="registrados-fiscal-formulario-edicao"
                    className="registrados-fiscal-edicao"
                >
                    <div className="registrados-fiscal-edicao-topo">

                        <div>

                            <strong>
                                Editando
                            </strong>

                            <span>
                                {editando.nome}
                            </span>

                        </div>


                        <button
                            type="button"
                            className="registrados-fiscal-fechar-edicao"
                            onClick={() =>
                                setEditando(null)
                            }
                        >
                            Fechar
                        </button>

                    </div>


                    <FormularioFiscal
                        key={
                            editando.produto_id ||
                            editando.id
                        }
                        tipo={tipo}
                        produto={editando}
                        modo="editar"
                        onSalvo={() => {

                            console.log(
                                "[RegistradosFiscal] Edição salva."
                            );

                            setEditando(null);

                            carregar();
                        }}
                    />

                </div>

            )}

        </div>
    );
}