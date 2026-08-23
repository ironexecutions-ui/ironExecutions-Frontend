import React, { useEffect, useState } from "react";
import FormularioImagens from "./formularioimagens";
import { API_URL } from "../../../../../config";
import "./formularioproduto.css";

export default function FormularioProduto({ item, voltar }) {

    function identificarTipo(itemAtual) {
        if (!itemAtual) return "produto";

        if (itemAtual.peso) {
            return "peso";
        }

        if (itemAtual.produto_id) {
            return "pacote";
        }

        if (itemAtual.tempo_servico) {
            return "servico";
        }

        return "produto";
    }

    const [categorias, setCategorias] = useState([]);
    const [tipo, setTipo] = useState(() => identificarTipo(item));
    const [produtos, setProdutos] = useState([]);

    const [form, setForm] = useState(item || {
        nome: "",
        codigo_barras: "",
        qrcode: "",
        preco: "",
        preco_recebido: "",
        categoria: "",
        imagem_url: "",
        disponivel: 1,
        unidade: "",
        peso: "",
        produto_id: 0,
        unidades: 0,
        tempo_servico: "",
        data_vencimento: ""
    });

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        const token = localStorage.getItem("token");

        const resp = await fetch(
            `${API_URL}/admin/produtos-servicos`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const dados = await resp.json();

        // Somente produtos simples podem ser usados
        // como produto base de um pacote
        setProdutos(
            dados.filter(
                p =>
                    !p.produto_id &&
                    p.unidade &&
                    !p.peso &&
                    !p.tempo_servico
            )
        );

        const categoriasUnicas = [
            ...new Set(
                dados
                    .map(p => p.categoria)
                    .filter(
                        c =>
                            c &&
                            c.trim() !== ""
                    )
            )
        ];

        setCategorias(categoriasUnicas);
    }

    function alterar(campo, valor) {
        setForm(prev => ({
            ...prev,
            [campo]: valor
        }));
    }

    function selecionarProdutoBase(nome) {
        const produto = produtos.find(
            p => p.nome === nome
        );

        if (produto) {
            alterar("produto_id", produto.id);
        }
    }

    function mudarTipo(novoTipo) {
        setTipo(novoTipo);

        setForm(prev => ({
            ...prev,

            unidade:
                novoTipo === "produto"
                    ? prev.unidade || ""
                    : "",

            peso:
                novoTipo === "peso"
                    ? prev.peso || ""
                    : "",

            produto_id:
                novoTipo === "pacote"
                    ? prev.produto_id || 0
                    : 0,

            unidades:
                novoTipo === "pacote"
                    ? prev.unidades || 0
                    : 0,

            tempo_servico:
                novoTipo === "servico"
                    ? prev.tempo_servico || ""
                    : ""
        }));
    }

    async function salvar() {
        const token = localStorage.getItem("token");

        if (!form.nome.trim()) {
            alert("Informe o nome.");
            return;
        }

        if (tipo === "peso") {
            if (!form.peso || !form.peso.trim()) {
                alert("Informe primeiro o peso.");
                return;
            }

            if (
                form.preco === "" ||
                Number(form.preco) <= 0
            ) {
                alert(
                    `Informe o preço por ${form.peso}.`
                );
                return;
            }
        }

        const payload = {
            nome: form.nome,
            codigo_barras: form.codigo_barras || null,
            qrcode: form.qrcode || null,
            categoria: form.categoria || null,
            imagem_url: form.imagem_url || null,
            preco: Number(form.preco || 0),
            preco_recebido: Number(
                form.preco_recebido || 0
            ),
            disponivel: Number(form.disponivel),
            data_vencimento:
                form.data_vencimento || null,

            unidade: null,
            peso: null,
            produto_id: null,
            unidades: 0,
            tempo_servico: null
        };

        // ===============================
        // PRODUTO NORMAL
        // ===============================

        if (tipo === "produto") {
            payload.unidade =
                form.unidade || null;

            payload.peso = null;
            payload.produto_id = null;
            payload.unidades = 0;
            payload.tempo_servico = null;
        }

        // ===============================
        // PACOTE
        // ===============================

        if (tipo === "pacote") {
            payload.produto_id =
                form.produto_id || null;

            payload.unidades = Number(
                form.unidades || 0
            );

            payload.unidade = null;
            payload.peso = null;
            payload.tempo_servico = null;
        }

        // ===============================
        // SERVIÇO
        // ===============================

        if (tipo === "servico") {
            payload.tempo_servico =
                form.tempo_servico || null;

            payload.unidade = null;
            payload.peso = null;
            payload.produto_id = null;
            payload.unidades = 0;
        }

        // ===============================
        // PRODUTO POR PESO
        // ===============================

        // ===============================
        // PRODUTO POR PESO
        // ===============================

        if (tipo === "peso") {
            payload.peso = form.peso.trim();
            payload.preco = Number(form.preco || 0);

            payload.unidade = null;
            payload.produto_id = null;
            payload.unidades = 0;
            payload.tempo_servico = null;

            payload.qrcode = null;
            payload.preco_recebido = 0;
            payload.data_vencimento = null;

            // imagem_url NÃO é apagada
            // permanece com form.imagem_url
        }

        const url = item
            ? `${API_URL}/admin/produtos-servicos/${item.id}`
            : `${API_URL}/admin/produtos-servicos`;

        const resp = await fetch(url, {
            method: item ? "PUT" : "POST",

            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const erro = await resp
                .json()
                .catch(() => null);

            console.error(
                "Erro ao salvar:",
                erro || await resp.text()
            );

            return;
        }

        voltar();
    }

    function primeiraMaiuscula(texto) {
        if (!texto) return "";

        return (
            texto.charAt(0).toUpperCase() +
            texto.slice(1)
        );
    }

    return (
        <div className="form-produto form-produto-cadastro-principal">

            <div className="topo-form formulario-produto-topo-unico">
                <button
                    className="formulario-produto-voltar-exclusivo"
                    onClick={voltar}
                >
                    Voltar
                </button>

                <h4>
                    {item
                        ? "Editar item"
                        : "Novo item"}
                </h4>
            </div>

            <div className="tipos formulario-produto-tipos-seletor">

                <button
                    className={
                        tipo === "produto"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        mudarTipo("produto")
                    }
                >
                    Produto
                </button>

                <button
                    className={
                        tipo === "peso"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        mudarTipo("peso")
                    }
                >
                    Produto por peso
                </button>

                <button
                    className={
                        tipo === "pacote"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        mudarTipo("pacote")
                    }
                >
                    Pacote
                </button>

                <button
                    className={
                        tipo === "servico"
                            ? "ativo"
                            : ""
                    }
                    onClick={() =>
                        mudarTipo("servico")
                    }
                >
                    Serviço
                </button>

            </div>

            <div className="acoes formulario-produto-acoes-principais">

                <button
                    className={`disponivel ${form.disponivel
                        ? "on"
                        : "off"
                        }`}
                    onClick={() =>
                        alterar(
                            "disponivel",
                            form.disponivel
                                ? 0
                                : 1
                        )
                    }
                >
                    {form.disponivel
                        ? "Disponível"
                        : "Indisponível"}
                </button>

                <button
                    className="salvar formulario-produto-salvar-principal"
                    onClick={salvar}
                >
                    Salvar
                </button>

            </div>

            <div className="grid formulario-produto-grid-campos">

                {/* ========================= */}
                {/* CÓDIGO DE BARRAS */}
                {/* ========================= */}

                <input
                    className="formulario-produto-campo-codigo"
                    placeholder="Código de barras"
                    value={form.codigo_barras || ""}
                    onChange={e =>
                        alterar(
                            "codigo_barras",
                            e.target.value
                        )
                    }
                />

                {/* ========================= */}
                {/* QR CODE */}
                {/* Não aparece em produto por peso */}
                {/* ========================= */}

                {tipo !== "peso" && (
                    <input
                        className="formulario-produto-campo-qrcode"
                        placeholder="QRCode"
                        value={form.qrcode || ""}
                        onChange={e =>
                            alterar(
                                "qrcode",
                                e.target.value
                            )
                        }
                    />
                )}

                {/* ========================= */}
                {/* NOME */}
                {/* ========================= */}

                <input
                    className="formulario-produto-campo-nome"
                    placeholder="Nome"
                    value={form.nome || ""}
                    onChange={e =>
                        alterar(
                            "nome",
                            primeiraMaiuscula(
                                e.target.value
                            )
                        )
                    }
                />

                {/* ========================= */}
                {/* CATEGORIA */}
                {/* ========================= */}

                <input
                    className="formulario-produto-campo-categoria"
                    list="lista-categorias"
                    placeholder="Categoria"
                    value={form.categoria || ""}
                    onChange={e =>
                        alterar(
                            "categoria",
                            primeiraMaiuscula(
                                e.target.value
                            )
                        )
                    }
                />

                <datalist id="lista-categorias">
                    {categorias.map((cat, i) => (
                        <option
                            key={i}
                            value={cat}
                        />
                    ))}
                </datalist>

                {/* ========================= */}
                {/* PRODUTO POR PESO */}
                {/* ========================= */}

                {tipo === "peso" && (
                    <>
                        <input
                            className="formulario-produto-campo-peso"
                            placeholder="Peso em gramas (ex: 100, 500, 1000)"
                            value={form.peso || ""}
                            onChange={e =>
                                alterar(
                                    "peso",
                                    e.target.value
                                )
                            }
                        />

                        <input
                            className="formulario-produto-campo-preco-peso"
                            placeholder={
                                form.peso
                                    ? `Preço por cada ${form.peso} gramas`
                                    : "Preencha o peso primeiro"
                            }
                            value={form.preco || ""}
                            disabled={!form.peso?.trim()}
                            onChange={e =>
                                alterar(
                                    "preco",
                                    e.target.value.replace(
                                        ",",
                                        "."
                                    )
                                )
                            }
                        />
                    </>
                )}

                {/* ========================= */}
                {/* PREÇOS NORMAIS */}
                {/* ========================= */}

                {tipo !== "peso" && (
                    <>
                        <input
                            className="formulario-produto-campo-preco"
                            placeholder="Preço"
                            value={form.preco || ""}
                            onChange={e =>
                                alterar(
                                    "preco",
                                    e.target.value.replace(
                                        ",",
                                        "."
                                    )
                                )
                            }
                        />

                        <input
                            className="formulario-produto-campo-preco-recebido"
                            placeholder="Preço recebido"
                            value={
                                form.preco_recebido || ""
                            }
                            onChange={e =>
                                alterar(
                                    "preco_recebido",
                                    e.target.value.replace(
                                        ",",
                                        "."
                                    )
                                )
                            }
                        />
                    </>
                )}

                {/* ========================= */}
                {/* PRODUTO NORMAL */}
                {/* ========================= */}

                {tipo === "produto" && (
                    <input
                        className="formulario-produto-campo-unidade"
                        placeholder="Unidade (ex: kg, un, caixa)"
                        value={form.unidade || ""}
                        onChange={e =>
                            alterar(
                                "unidade",
                                e.target.value
                            )
                        }
                    />
                )}

                {/* ========================= */}
                {/* PACOTE */}
                {/* ========================= */}

                {tipo === "pacote" && (
                    <>
                        <input
                            className="formulario-produto-campo-produto-base"
                            list="lista-produtos"
                            placeholder="Produto base"
                            onChange={e =>
                                selecionarProdutoBase(
                                    e.target.value
                                )
                            }
                        />

                        <datalist id="lista-produtos">
                            {produtos.map(p => (
                                <option
                                    key={p.id}
                                    value={p.nome}
                                />
                            ))}
                        </datalist>

                        <input
                            className="formulario-produto-campo-unidades-pacote"
                            placeholder="Quantidade de unidades"
                            value={form.unidades || ""}
                            onChange={e =>
                                alterar(
                                    "unidades",
                                    e.target.value
                                )
                            }
                        />
                    </>
                )}

                {/* ========================= */}
                {/* SERVIÇO */}
                {/* ========================= */}

                {tipo === "servico" && (
                    <input
                        className="formulario-produto-campo-tempo-servico"
                        placeholder="Tempo de serviço (ex: 30 min)"
                        value={
                            form.tempo_servico || ""
                        }
                        onChange={e =>
                            alterar(
                                "tempo_servico",
                                e.target.value
                            )
                        }
                    />
                )}

                {/* ========================= */}
                {/* VENCIMENTO */}
                {/* Produto por peso não usa */}
                {/* ========================= */}

                {tipo !== "peso" && (
                    <input
                        className="formulario-produto-campo-vencimento"
                        type="date"
                        value={
                            form.data_vencimento || ""
                        }
                        onChange={e =>
                            alterar(
                                "data_vencimento",
                                e.target.value
                            )
                        }
                    />
                )}

            </div>

            {/* Produto por peso terá somente
                os campos solicitados */}

            <FormularioImagens
                valor={form.imagem_url}
                alterar={imgs =>
                    alterar("imagem_url", imgs)
                }
            />

        </div>
    );
}