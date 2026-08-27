import React, { useState } from "react";
import { createPortal } from "react-dom";

import { URL } from "../../url";

import "./modaleditarcliente.css";

export default function ModalEditarCliente({
    cliente,
    fechar,
    atualizar
}) {

    const [form, setForm] = useState({
        email: cliente?.email || "",
        nome_completo: cliente?.nome_completo || "",
        cargo: cliente?.cargo || "",
        matricula: cliente?.matricula || ""
    });

    function alterar(campo, valor) {
        setForm({
            ...form,
            [campo]: valor
        });
    }

    async function salvar() {

        const token = localStorage.getItem("token");

        const url = cliente
            ? `${URL}/controle/clientes/${cliente.id}`
            : `${URL}/controle/clientes`;

        const method = cliente
            ? "PUT"
            : "POST";

        await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        atualizar();
        fechar();
    }

    async function apagar() {

        if (!cliente) return;

        const confirmar = window.confirm(
            "Tem certeza que deseja apagar este usuário? Essa ação não pode ser desfeita."
        );

        if (!confirmar) return;

        const token = localStorage.getItem("token");

        await fetch(
            `${URL}/controle/clientes/${cliente.id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        atualizar();
        fechar();
    }

    async function baixar(tipo) {

        const token = localStorage.getItem("token");

        const resp = await fetch(
            `${URL}/controle/clientes/${cliente.id}/pdf/${tipo}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!resp.ok) {
            alert("Erro ao gerar PDF");
            return;
        }

        const blob = await resp.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download =
            tipo === "codigo"
                ? "codigo_barras.pdf"
                : "qr_code.pdf";

        document.body.appendChild(a);

        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
    }

    return createPortal(
        <div
            className="modal-cliente-overlay-administrativo"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    fechar();
                }
            }}
        >

            <div className="modal-cliente-painel-administrativo">

                {/* =========================================
                    CABEÇALHO
                ========================================= */}

                <div className="modal-cliente-cabecalho-administrativo">

                    <div className="modal-cliente-cabecalho-texto">

                        <span className="modal-cliente-identificador">
                            {cliente
                                ? "GERENCIAR FUNCIONÁRIO"
                                : "NOVO FUNCIONÁRIO"
                            }
                        </span>

                        <h3>
                            {cliente
                                ? "Editar funcionário"
                                : "Adicionar funcionário"
                            }
                        </h3>

                        <p>
                            {cliente
                                ? "Atualize as informações e dados de acesso deste funcionário."
                                : "Preencha as informações para cadastrar um novo funcionário."
                            }
                        </p>

                    </div>

                    <button
                        type="button"
                        className="modal-cliente-fechar-superior"
                        onClick={fechar}
                        aria-label="Fechar"
                    >
                        ×
                    </button>

                </div>


                {/* =========================================
                    DOWNLOADS
                ========================================= */}

                {cliente && (

                    <div className="modal-cliente-acessos-impressao">

                        <div className="modal-cliente-acessos-texto">

                            <strong>
                                Identificação do funcionário
                            </strong>

                            <span>
                                Baixe os códigos utilizados para identificação.
                            </span>

                        </div>

                        <div className="modal-cliente-botoes-download">

                            <button
                                type="button"
                                onClick={() => baixar("codigo")}
                            >
                                Código de barras
                            </button>

                            <button
                                type="button"
                                onClick={() => baixar("qrcode")}
                            >
                                QR Code
                            </button>

                        </div>

                    </div>

                )}


                {/* =========================================
                    FORMULÁRIO
                ========================================= */}

                <div className="modal-cliente-formulario-administrativo">

                    <div className="modal-cliente-campo modal-cliente-campo-nome">

                        <label htmlFor="modal-cliente-nome">
                            Nome completo
                        </label>

                        <input
                            id="modal-cliente-nome"
                            type="text"
                            value={form.nome_completo}
                            onChange={(e) =>
                                alterar(
                                    "nome_completo",
                                    e.target.value
                                )
                            }
                            placeholder="Nome completo do funcionário"
                        />

                    </div>


                    <div className="modal-cliente-campo modal-cliente-campo-email">

                        <label htmlFor="modal-cliente-email">
                            Email
                        </label>

                        <input
                            id="modal-cliente-email"
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                alterar(
                                    "email",
                                    e.target.value
                                )
                            }
                            placeholder="exemplo@email.com"
                        />

                    </div>


                    <div className="modal-cliente-campo modal-cliente-campo-cargo">

                        <label htmlFor="modal-cliente-cargo">
                            Cargo
                        </label>

                        <input
                            id="modal-cliente-cargo"
                            type="text"
                            value={form.cargo}
                            onChange={(e) =>
                                alterar(
                                    "cargo",
                                    e.target.value
                                )
                            }
                            placeholder="Cargo do funcionário"
                        />

                    </div>


                    <div className="modal-cliente-campo modal-cliente-campo-matricula">

                        <label htmlFor="modal-cliente-matricula">
                            Matrícula
                        </label>

                        <input
                            id="modal-cliente-matricula"
                            type="text"
                            value={form.matricula}
                            onChange={(e) =>
                                alterar(
                                    "matricula",
                                    e.target.value
                                )
                            }
                            placeholder="Matrícula"
                        />

                    </div>

                </div>


                {/* =========================================
                    RODAPÉ
                ========================================= */}

                <div className="modal-cliente-rodape-administrativo">

                    <div className="modal-cliente-rodape-esquerda">

                        {cliente && (

                            <button
                                type="button"
                                className="modal-cliente-botao-apagar"
                                onClick={apagar}
                            >
                                Apagar funcionário
                            </button>

                        )}

                    </div>

                    <div className="modal-cliente-rodape-direita">

                        <button
                            type="button"
                            className="modal-cliente-botao-cancelar"
                            onClick={fechar}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="modal-cliente-botao-salvar"
                            onClick={salvar}
                        >
                            {cliente
                                ? "Salvar alterações"
                                : "Adicionar funcionário"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>,
        document.body
    );
}