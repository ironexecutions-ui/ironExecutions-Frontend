import React, { useEffect, useState } from "react";

import { API_URL } from "../../../../../config";

import ModalEditarCliente from "./modaleditarcliente";

import "./controle.css";

export default function Controlee() {

    const [dados, setDados] = useState({
        administradores: [],
        supervisores: [],
        funcionarios: []
    });

    const [selecionado, setSelecionado] = useState(undefined);

    const cliente = JSON.parse(
        localStorage.getItem("cliente") || "{}"
    );

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {

        const token = localStorage.getItem("token");

        const resp = await fetch(
            `${API_URL}/controle/clientes`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const json = await resp.json();

        setDados(json);
    }

    function podeAbrir(clienteLinha) {

        if (cliente.funcao !== "Administrador(a)") {
            return;
        }

        setSelecionado(clienteLinha);
    }

    function renderTabela(titulo, lista, tipo) {

        return (
            <section className="controle-funcionarios-bloco">

                <div className="controle-funcionarios-bloco-cabecalho">

                    <div className="controle-funcionarios-bloco-titulo">

                        <span className="controle-funcionarios-tipo">
                            {tipo}
                        </span>

                        <div className="controle-funcionarios-titulo-linha">

                            <h3>
                                {titulo}
                            </h3>

                            <span className="controle-funcionarios-contador">
                                {lista.length}
                            </span>

                        </div>

                    </div>

                </div>

                <div className="controle-funcionarios-tabela-wrapper">

                    <table className="controle-funcionarios-tabela">

                        <thead>
                            <tr>
                                <th>Funcionário</th>
                                <th>Email</th>
                                <th>Cargo</th>
                                <th>Matrícula</th>

                                {cliente.funcao === "Administrador(a)" && (
                                    <th className="controle-funcionarios-coluna-acao">
                                        Ação
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>

                            {lista.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={
                                            cliente.funcao === "Administrador(a)"
                                                ? 5
                                                : 4
                                        }
                                        className="controle-funcionarios-vazio"
                                    >
                                        Nenhum registro encontrado
                                    </td>
                                </tr>

                            ) : (

                                lista.map((c) => (

                                    <tr
                                        key={c.id}
                                        className={
                                            cliente.funcao === "Administrador(a)"
                                                ? "controle-funcionarios-linha-clicavel"
                                                : ""
                                        }
                                        onClick={() => podeAbrir(c)}
                                    >

                                        <td data-label="Funcionário">

                                            <div className="controle-funcionarios-pessoa">

                                                <div className="controle-funcionarios-avatar">
                                                    {(c.nome_completo || "?")
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="controle-funcionarios-pessoa-dados">

                                                    <strong>
                                                        {c.nome_completo || "Não informado"}
                                                    </strong>

                                                    <span>
                                                        ID {c.id}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>

                                        <td data-label="Email">
                                            <span className="controle-funcionarios-email">
                                                {c.email || "Não informado"}
                                            </span>
                                        </td>

                                        <td data-label="Cargo">
                                            <span className="controle-funcionarios-cargo">
                                                {c.cargo || "Não informado"}
                                            </span>
                                        </td>

                                        <td data-label="Matrícula">
                                            <strong className="controle-funcionarios-matricula">
                                                {c.matricula || "Não informada"}
                                            </strong>
                                        </td>

                                        {cliente.funcao === "Administrador(a)" && (

                                            <td
                                                data-label="Ação"
                                                className="controle-funcionarios-coluna-acao"
                                            >
                                                <span className="controle-funcionarios-editar">
                                                    Editar
                                                    <b>›</b>
                                                </span>
                                            </td>

                                        )}

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </section>
        );
    }

    const totalFuncionarios =
        dados.administradores.length +
        dados.supervisores.length +
        dados.funcionarios.length;

    return (
        <div className="controle-funcionarios-painel">

            {/* =========================================
                CABEÇALHO
            ========================================= */}

            <div className="controle-funcionarios-cabecalho">

                <div className="controle-funcionarios-cabecalho-texto">

                    <h2>
                        Funcionários
                    </h2>

                    <p>
                        Gerencie os usuários e responsáveis pelo comércio
                    </p>

                </div>

                {cliente.funcao === "Administrador(a)" && (

                    <button
                        type="button"
                        className="controle-funcionarios-adicionar"
                        onClick={() => setSelecionado(null)}
                    >
                        <span>+</span>
                        Adicionar funcionário
                    </button>

                )}

            </div>

            {/* =========================================
                INDICADORES
            ========================================= */}

            <div className="controle-funcionarios-indicadores">

                <div className="controle-funcionarios-indicador">

                    <span>
                        Total de usuários
                    </span>

                    <strong>
                        {totalFuncionarios}
                    </strong>

                </div>

                <div className="controle-funcionarios-indicador">

                    <span>
                        Administradores
                    </span>

                    <strong>
                        {dados.administradores.length}
                    </strong>

                </div>

                <div className="controle-funcionarios-indicador">

                    <span>
                        Supervisores
                    </span>

                    <strong>
                        {dados.supervisores.length}
                    </strong>

                </div>

                <div className="controle-funcionarios-indicador">

                    <span>
                        Funcionários
                    </span>

                    <strong>
                        {dados.funcionarios.length}
                    </strong>

                </div>

            </div>

            {/* =========================================
                LISTAGENS
            ========================================= */}

            <div className="controle-funcionarios-listagens">

                {renderTabela(
                    "Administradores",
                    dados.administradores,
                    "ADMINISTRAÇÃO"
                )}

                {renderTabela(
                    "Supervisores",
                    dados.supervisores,
                    "SUPERVISÃO"
                )}

                {renderTabela(
                    "Funcionários",
                    dados.funcionarios,
                    "EQUIPE"
                )}

            </div>

            {/* =========================================
                MODAL
            ========================================= */}

            {selecionado !== undefined && (

                <ModalEditarCliente
                    cliente={selecionado}
                    fechar={() => setSelecionado(undefined)}
                    atualizar={carregar}
                />

            )}

        </div>
    );
}