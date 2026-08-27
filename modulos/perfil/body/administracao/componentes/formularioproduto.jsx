import React, { useEffect, useState } from "react";
import FormularioImagens from "./formularioimagens";
import { API_URL } from "../../../../../config";
import { createPortal } from "react-dom";
import "./formularioproduto.css";
import CadastroIronStore from "./formularioironstore";
export default function FormularioProduto({ item, voltar }) {
    const [cadastroIronStore, setCadastroIronStore] = useState(false);
    const [variedades, setVariedades] = useState([]);
    const [novaVariedade, setNovaVariedade] = useState("");
    const [temModuloIronStore, setTemModuloIronStore] = useState(false);
    const [modalAlerta, setModalAlerta] = useState({
        aberto: false,
        titulo: "",
        mensagem: "",
        itens: [],
        tipo: "aviso"
    });


    function abrirAlerta({
        titulo = "Atenção",
        mensagem = "",
        itens = [],
        tipo = "aviso"
    }) {

        setModalAlerta({
            aberto: true,
            titulo,
            mensagem,
            itens,
            tipo
        });
    }


    function fecharAlerta() {

        setModalAlerta({
            aberto: false,
            titulo: "",
            mensagem: "",
            itens: [],
            tipo: "aviso"
        });
    }
    async function verificarModuloIronStore() {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                setTemModuloIronStore(false);
                return;
            }

            const resposta = await fetch(
                `${API_URL}/retorno/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                setTemModuloIronStore(false);
                return;
            }

            const dados = await resposta.json();

            const modulos = Array.isArray(dados.modulos_comercio)
                ? dados.modulos_comercio
                : [];

            const possuiIronStore = modulos.includes("IronStore");

            setTemModuloIronStore(possuiIronStore);

        } catch (erro) {

            console.error(
                "Erro ao verificar módulo IronStore:",
                erro
            );

            setTemModuloIronStore(false);
        }
    }
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
    function adicionarVariedadeEnter(e) {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const valor = novaVariedade.trim();

        if (!valor) return;

        adicionarVariedade(valor);
        setNovaVariedade("");
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

        // Por padrão o produto começa indisponível.
        disponivel: 0,

        unidade: "",
        peso: "",
        produto_id: 0,
        unidades: 0,
        tempo_servico: "",
        data_vencimento: "",

        descricao: "",
        descricao_curta: "",
        preco_promocao: "",
        destaque: "",
        peso_g: "",
        altura_cm: "",
        cumprimento_cm: "",
        largura_cm: "",
        variedade: "",
        variedad_primaria: ""
    });
    function adicionarVariedade(nome) {
        const nomeLimpo = nome.trim();

        if (!nomeLimpo) return;

        const jaExiste = variedades.some(
            v =>
                v.nome.toLowerCase() ===
                nomeLimpo.toLowerCase()
        );

        if (jaExiste) {

            abrirAlerta({
                titulo: "Variedade repetida",
                mensagem: `A variedade "${nomeLimpo}" já foi adicionada a este produto.`,
                tipo: "aviso"
            });

            return;
        }

        const primeiraVariedade = variedades.length === 0;

        const codigoInicial =
            primeiraVariedade
                ? (form.codigo_barras || "").trim()
                : "";

        setVariedades(prev => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                nome: nomeLimpo,
                codigo_barras: codigoInicial
            }
        ]);

        // =====================================================
        // AO CRIAR A PRIMEIRA VARIEDADE
        // =====================================================
        // Se o produto já possuía código de barras,
        // esse código passa a pertencer à primeira variedade.
        //
        // A partir daqui o produto não possui mais um código
        // principal. Cada variedade terá seu próprio código.
        // =====================================================

        if (primeiraVariedade) {
            alterar("codigo_barras", "");
        }
    }


    function removerVariedade(index) {
        setVariedades(prev =>
            prev.filter((_, i) => i !== index)
        );
    }


    function alterarCodigoVariedade(index, codigo) {
        setVariedades(prev =>
            prev.map((variedade, i) =>
                i === index
                    ? {
                        ...variedade,
                        codigo_barras: codigo
                    }
                    : variedade
            )
        );
    }
    function podeFicarDisponivel() {

        // =====================================================
        // REGRAS PARA UM PRODUTO FICAR DISPONÍVEL
        // =====================================================
        // REGRA ATUAL:
        // 1. O produto precisa possuir nome.
        //
        // IMPORTANTE:
        // Novas regras de disponibilidade serão adicionadas
        // posteriormente nesta função.
        // =====================================================

        if (!form.nome || !form.nome.trim()) {
            return false;
        }

        return true;
    }


    function alterarDisponibilidade() {

        if (form.disponivel) {
            alterar("disponivel", 0);
            return;
        }

        if (!podeFicarDisponivel()) {

            abrirAlerta({
                titulo: "Produto incompleto",
                mensagem:
                    "Preencha o nome do produto antes de deixá-lo disponível.",
                itens: [
                    "Nome do produto"
                ],
                tipo: "aviso"
            });

            return;

        }

        alterar("disponivel", 1);
    }
    useEffect(() => {

        carregarDados();

        verificarModuloIronStore();

        if (item?.id) {
            carregarProdutoEdicao();
        }

    }, [item?.id]);
    async function carregarProdutoEdicao() {

        const token = localStorage.getItem("token");

        try {

            const resp = await fetch(
                `${API_URL}/admin/produtos-servicos/${item.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resp.ok) {

                const erro = await resp
                    .json()
                    .catch(() => null);

                console.error(
                    "Erro ao carregar produto:",
                    erro
                );

                abrirAlerta({
                    titulo: "Erro ao carregar produto",
                    mensagem:
                        typeof erro?.detail === "string"
                            ? erro.detail
                            : "Não foi possível carregar o produto.",
                    tipo: "erro"
                });

                return;
            }

            const dados = await resp.json();

            // =================================================
            // PREENCHER FORMULÁRIO
            // =================================================

            setForm({
                ...dados,

                nome:
                    dados.nome || "",

                codigo_barras:
                    dados.codigo_barras || "",

                qrcode:
                    dados.qrcode || "",

                preco:
                    dados.preco ?? "",

                preco_recebido:
                    dados.preco_recebido ?? "",

                categoria:
                    dados.categoria || "",

                imagem_url:
                    dados.imagem_url || "",

                disponivel:
                    Number(dados.disponivel || 0),

                unidade:
                    dados.unidade || "",

                peso:
                    dados.peso || "",

                produto_id:
                    dados.produto_id || 0,

                unidades:
                    dados.unidades || 0,

                tempo_servico:
                    dados.tempo_servico || "",

                data_vencimento:
                    dados.data_vencimento || "",

                descricao:
                    dados.descricao || "",

                descricao_curta:
                    dados.descricao_curta || "",

                preco_promocao:
                    dados.preco_promocao || "",

                destaque:
                    dados.destaque || "",

                peso_g:
                    dados.peso_g || "",

                altura_cm:
                    dados.altura_cm || "",

                cumprimento_cm:
                    dados.cumprimento_cm || "",

                largura_cm:
                    dados.largura_cm || "",

                variedade:
                    dados.variedade || "",

                variedad_primaria:
                    dados.variedad_primaria || ""
            });

            // =================================================
            // CARREGAR VARIEDADES
            // =================================================

            if (
                Array.isArray(dados.variedades) &&
                dados.variedades.length > 0
            ) {

                setVariedades(
                    dados.variedades.map(variedade => ({
                        id: variedade.id,
                        nome: variedade.nome || "",
                        codigo_barras:
                            variedade.codigo_barras || ""
                    }))
                );

            } else {

                setVariedades([]);

            }

            setTipo(
                identificarTipo(dados)
            );

        } catch (erro) {

            console.error(
                "Erro ao carregar produto para edição:",
                erro
            );

            abrirAlerta({
                titulo: "Erro ao carregar produto",
                mensagem:
                    "Não foi possível carregar os dados do produto.",
                tipo: "erro"
            });
        }
    }
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
                    Number(p.produto_variedade_id || 0) <= 0 &&
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

            abrirAlerta({
                titulo: "Nome obrigatório",
                mensagem:
                    "Informe o nome do produto antes de salvar.",
                itens: [
                    "Nome do produto"
                ],
                tipo: "aviso"
            });

            return;
        }


        // =====================================================
        // VALIDAR DISPONIBILIDADE
        // =====================================================

        if (
            Number(form.disponivel) === 1 &&
            !podeFicarDisponivel()
        ) {
            abrirAlerta({
                titulo: "Produto incompleto",
                mensagem:
                    "Este produto ainda não atende aos requisitos para ficar disponível.",
                tipo: "aviso"
            });
            return;
        }


        // =====================================================
        // VALIDAR PRODUTO POR PESO
        // =====================================================

        if (tipo === "peso") {

            if (!form.peso || !form.peso.trim()) {
                abrirAlerta({
                    titulo: "Peso obrigatório",
                    mensagem:
                        "Informe o peso do produto antes de continuar.",
                    itens: [
                        "Peso em gramas"
                    ],
                    tipo: "aviso"
                }); return;
            }

            if (
                form.preco === "" ||
                Number(form.preco) <= 0
            ) {
                abrirAlerta({
                    titulo: "Preço obrigatório",
                    mensagem:
                        `Informe o preço correspondente a ${form.peso} gramas.`,
                    itens: [
                        "Preço"
                    ],
                    tipo: "aviso"
                });
                return;
            }
        }


        // =====================================================
        // VALIDAR VARIEDADES
        // =====================================================
        // Código de barras NÃO é obrigatório.
        //
        // Se duas ou mais variedades POSSUÍREM código,
        // os códigos informados precisam ser diferentes.
        // =====================================================

        if (variedades.length > 0) {

            const codigosPreenchidos = variedades
                .map(v => (v.codigo_barras || "").trim())
                .filter(codigo => codigo !== "");

            const codigosUnicos = new Set(
                codigosPreenchidos
            );

            if (
                codigosUnicos.size !==
                codigosPreenchidos.length
            ) {
                abrirAlerta({
                    titulo: "Código de barras repetido",
                    mensagem:
                        "Duas ou mais variedades possuem o mesmo código de barras.",
                    itens: [
                        "Cada código de barras preenchido deve ser diferente"
                    ],
                    tipo: "aviso"
                });
                return;
            }
        }

        // =====================================================
        // PAYLOAD PRINCIPAL
        // =====================================================

        const payload = {
            nome: form.nome.trim(),

            codigo_barras:
                form.codigo_barras || null,

            qrcode:
                form.qrcode || null,

            categoria:
                form.categoria || null,

            imagem_url:
                form.imagem_url || null,

            preco:
                Number(form.preco || 0),

            preco_recebido:
                Number(form.preco_recebido || 0),

            disponivel:
                Number(form.disponivel),

            data_vencimento:
                form.data_vencimento || null,

            unidade: null,
            peso: null,
            produto_id: null,
            unidades: 0,
            tempo_servico: null,

            descricao:
                form.descricao || null,

            descricao_curta:
                form.descricao_curta || null,

            preco_promocao:
                form.preco_promocao || null,

            destaque:
                form.destaque || null,

            peso_g:
                form.peso_g || null,

            altura_cm:
                form.altura_cm || null,

            cumprimento_cm:
                form.cumprimento_cm || null,

            largura_cm:
                form.largura_cm || null,

            variedade: null,

            variedad_primaria:
                form.variedad_primaria || null,

            variedades: variedades.map(v => ({
                nome: v.nome.trim(),

                codigo_barras:
                    (v.codigo_barras || "").trim() || null
            }))
        };


        // =====================================================
        // PRODUTO NORMAL
        // =====================================================

        if (tipo === "produto") {
            payload.unidade =
                form.unidade || null;
        }


        // =====================================================
        // PACOTE
        // =====================================================

        if (tipo === "pacote") {

            payload.produto_id =
                form.produto_id || null;

            payload.unidades =
                Number(form.unidades || 0);
        }


        // =====================================================
        // SERVIÇO
        // =====================================================

        if (tipo === "servico") {
            payload.tempo_servico =
                form.tempo_servico || null;
        }


        // =====================================================
        // PRODUTO POR PESO
        // =====================================================

        if (tipo === "peso") {

            payload.peso =
                form.peso.trim();

            payload.preco =
                Number(form.preco || 0);

            payload.qrcode = null;
            payload.preco_recebido = 0;
            payload.data_vencimento = null;
        }


        // =====================================================
        // SALVAR
        // =====================================================

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
                erro
            );

            const detalheErro = erro?.detail;

            if (
                detalheErro &&
                typeof detalheErro === "object" &&
                Array.isArray(detalheErro.faltando)
            ) {

                abrirAlerta({
                    titulo: "Produto incompleto",
                    mensagem:
                        detalheErro.mensagem ||
                        "Existem informações que precisam ser preenchidas.",
                    itens: detalheErro.faltando,
                    tipo: "aviso"
                });

            } else {

                abrirAlerta({
                    titulo: "Erro ao salvar",
                    mensagem:
                        typeof detalheErro === "string"
                            ? detalheErro
                            : "Não foi possível salvar o produto.",
                    tipo: "erro"
                });

            }

            return;
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

                {temModuloIronStore && (
                    <button
                        type="button"
                        className={`formulario-produto-botao-cadastro-ironstore ${cadastroIronStore ? "ativo" : ""
                            }`}
                        onClick={() =>
                            setCadastroIronStore(prev => !prev)
                        }
                    >
                        Cadastro IronStore
                    </button>
                )}
                <button
                    className="salvar formulario-produto-salvar-principal"
                    onClick={salvar}
                >
                    Salvar
                </button>

            </div>

            <div className="grid formulario-produto-grid-campos">

                {/* ===================================================== */}
                {/* CÓDIGO DE BARRAS */}
                {/* ===================================================== */}

                <div className="formulario-produto-grupo-codigo">
                    <label className="formulario-produto-label-codigo">
                        Código de barras
                    </label>

                    <input
                        className="formulario-produto-campo-codigo"
                        placeholder={
                            variedades.length > 0
                                ? "Código definido por variedade"
                                : "Código de barras"
                        }
                        value={form.codigo_barras || ""}
                        disabled={variedades.length > 0}
                        onChange={e =>
                            alterar(
                                "codigo_barras",
                                e.target.value
                            )
                        }
                    />
                </div>


                {/* ===================================================== */}
                {/* QR CODE */}
                {/* ===================================================== */}

                {tipo !== "peso" && (
                    <div className="formulario-produto-grupo-qrcode">
                        <label className="formulario-produto-label-qrcode">
                            QR Code
                        </label>

                        <input
                            className="formulario-produto-campo-qrcode"
                            placeholder="QRCode"
                            value={form.qrcode || ""}
                            onChange={e =>
                                alterar("qrcode", e.target.value)
                            }
                        />
                    </div>
                )}


                {/* ===================================================== */}
                {/* NOME */}
                {/* ===================================================== */}

                <div className="formulario-produto-grupo-nome">
                    <label className="formulario-produto-label-nome">
                        Nome
                    </label>

                    <input
                        className="formulario-produto-campo-nome"
                        placeholder="Nome"
                        value={form.nome || ""}
                        onChange={e =>
                            alterar(
                                "nome",
                                primeiraMaiuscula(e.target.value)
                            )
                        }
                    />
                </div>


                {/* ===================================================== */}
                {/* CATEGORIA */}
                {/* ===================================================== */}

                <div className="formulario-produto-grupo-categoria">
                    <label className="formulario-produto-label-categoria">
                        Categoria
                    </label>

                    <input
                        className="formulario-produto-campo-categoria"
                        list="lista-categorias"
                        placeholder="Categoria"
                        value={form.categoria || ""}
                        onChange={e =>
                            alterar(
                                "categoria",
                                primeiraMaiuscula(e.target.value)
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
                </div>


                {/* ===================================================== */}
                {/* PRODUTO POR PESO */}
                {/* ===================================================== */}

                {tipo === "peso" && (
                    <>
                        <div className="formulario-produto-grupo-peso">
                            <label className="formulario-produto-label-peso">
                                Peso em gramas
                            </label>

                            <input
                                className="formulario-produto-campo-peso"
                                type="number"
                                placeholder="Ex: 100, 500, 1000"
                                value={form.peso || ""}
                                onChange={e =>
                                    alterar("peso", e.target.value)
                                }
                            />
                        </div>

                        <div className="formulario-produto-grupo-preco-peso">
                            <label className="formulario-produto-label-preco-peso">
                                Preço
                            </label>

                            <input
                                className="formulario-produto-campo-preco-peso"
                                type="number"
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
                                        e.target.value.replace(",", ".")
                                    )
                                }
                            />
                        </div>
                    </>
                )}


                {/* ===================================================== */}
                {/* PREÇOS NORMAIS */}
                {/* ===================================================== */}

                {tipo !== "peso" && (
                    <>
                        <div className="formulario-produto-grupo-preco">
                            <label className="formulario-produto-label-preco">
                                Preço
                            </label>

                            <input
                                className="formulario-produto-campo-preco"
                                type="number"
                                step="0.01"
                                placeholder="Preço"
                                value={form.preco || ""}
                                onChange={e =>
                                    alterar(
                                        "preco",
                                        e.target.value.replace(",", ".")
                                    )
                                }
                            />
                        </div>

                        <div className="formulario-produto-grupo-preco-recebido">
                            <label className="formulario-produto-label-preco-recebido">
                                Preço recebido
                            </label>

                            <input
                                className="formulario-produto-campo-preco-recebido"
                                type="number"
                                step="0.01"
                                placeholder="Preço recebido"
                                value={form.preco_recebido || ""}
                                onChange={e =>
                                    alterar(
                                        "preco_recebido",
                                        e.target.value.replace(",", ".")
                                    )
                                }
                            />
                        </div>
                    </>
                )}


                {/* ===================================================== */}
                {/* UNIDADE */}
                {/* ===================================================== */}

                {tipo === "produto" && (
                    <div className="formulario-produto-grupo-unidade">
                        <label className="formulario-produto-label-unidade">
                            Unidade
                        </label>

                        <input
                            className="formulario-produto-campo-unidade"
                            placeholder="Ex: kg, un, caixa"
                            value={form.unidade || ""}
                            onChange={e =>
                                alterar("unidade", e.target.value)
                            }
                        />
                    </div>
                )}


                {/* ===================================================== */}
                {/* PACOTE */}
                {/* ===================================================== */}

                {tipo === "pacote" && (
                    <>
                        <div className="formulario-produto-grupo-produto-base">
                            <label className="formulario-produto-label-produto-base">
                                Produto base
                            </label>

                            <input
                                className="formulario-produto-campo-produto-base"
                                list="lista-produtos"
                                placeholder="Produto base"
                                onChange={e =>
                                    selecionarProdutoBase(e.target.value)
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
                        </div>

                        <div className="formulario-produto-grupo-unidades-pacote">
                            <label className="formulario-produto-label-unidades-pacote">
                                Quantidade de unidades
                            </label>

                            <input
                                className="formulario-produto-campo-unidades-pacote"
                                type="number"
                                placeholder="Quantidade de unidades"
                                value={form.unidades || ""}
                                onChange={e =>
                                    alterar("unidades", e.target.value)
                                }
                            />
                        </div>
                    </>
                )}


                {/* ===================================================== */}
                {/* SERVIÇO */}
                {/* ===================================================== */}

                {tipo === "servico" && (
                    <div className="formulario-produto-grupo-tempo-servico">
                        <label className="formulario-produto-label-tempo-servico">
                            Tempo de serviço
                        </label>

                        <input
                            className="formulario-produto-campo-tempo-servico"
                            placeholder="Ex: 30 min"
                            value={form.tempo_servico || ""}
                            onChange={e =>
                                alterar("tempo_servico", e.target.value)
                            }
                        />
                    </div>
                )}


                {/* ===================================================== */}
                {/* VENCIMENTO */}
                {/* ===================================================== */}

                {tipo !== "peso" && (
                    <div className="formulario-produto-grupo-vencimento">
                        <label className="formulario-produto-label-vencimento">
                            Data de vencimento
                        </label>

                        <input
                            className="formulario-produto-campo-vencimento"
                            type="date"
                            value={form.data_vencimento || ""}
                            onChange={e =>
                                alterar(
                                    "data_vencimento",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                )}


                {/* ===================================================== */}
                {/* VARIEDADES, LINHA EXCLUSIVA */}
                {/* ===================================================== */}

                {/* ===================================================== */}
                {/* VARIEDADES, DISPONÍVEL PARA TODOS OS TIPOS */}
                {/* ===================================================== */}

                <div className="formulario-produto-linha-variedades">

                    {/* ================================================= */}
                    {/* TIPO DA VARIEDADE */}
                    {/* ================================================= */}

                    <div className="formulario-produto-grupo-tipo-variedade">

                        <label className="formulario-produto-label-tipo-variedade">
                            Tipo de variedade
                        </label>

                        <input
                            className="formulario-produto-campo-tipo-variedade"
                            type="text"
                            placeholder="Ex: Cor, Tamanho, Sabor"
                            value={form.variedad_primaria || ""}
                            onChange={e =>
                                alterar(
                                    "variedad_primaria",
                                    primeiraMaiuscula(e.target.value)
                                )
                            }
                        />

                    </div>


                    {/* ================================================= */}
                    {/* ADICIONAR VARIEDADE */}
                    {/* ================================================= */}

                    <div className="formulario-produto-grupo-nova-variedade">

                        <label className="formulario-produto-label-nova-variedade">
                            Variedade
                        </label>

                        <input
                            className="formulario-produto-campo-nova-variedade"
                            type="text"
                            placeholder="Digite e pressione Enter"
                            value={novaVariedade}
                            onChange={e =>
                                setNovaVariedade(e.target.value)
                            }
                            onKeyDown={adicionarVariedadeEnter}
                        />

                    </div>


                    {/* ================================================= */}
                    {/* LISTA DAS VARIEDADES ADICIONADAS */}
                    {/* ================================================= */}

                    {variedades.length > 0 && (

                        <div className="formulario-produto-lista-variedades">

                            {variedades.map((variedade, index) => (

                                <div
                                    key={variedade.id}
                                    className="formulario-produto-item-variedade"
                                >

                                    {/* ========================================= */}
                                    {/* NOME COMPLETO */}
                                    {/* ========================================= */}

                                    <div className="formulario-produto-variedade-nome-area">

                                        <span className="formulario-produto-variedade-nome">

                                            {form.nome
                                                ? `${form.nome} ${variedade.nome}`
                                                : variedade.nome}

                                        </span>

                                    </div>


                                    {/* ========================================= */}
                                    {/* CÓDIGO DE BARRAS OPCIONAL */}
                                    {/* ========================================= */}

                                    <div className="formulario-produto-variedade-codigo-area">

                                        <label className="formulario-produto-variedade-codigo-label">
                                            Código de barras
                                        </label>

                                        <input
                                            className="formulario-produto-variedade-codigo-input"
                                            type="text"
                                            placeholder={`Código de ${variedade.nome}`}
                                            value={variedade.codigo_barras || ""}
                                            onChange={e =>
                                                alterarCodigoVariedade(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* ========================================= */}
                                    {/* REMOVER */}
                                    {/* ========================================= */}

                                    <button
                                        type="button"
                                        className="formulario-produto-variedade-remover"
                                        onClick={() =>
                                            removerVariedade(index)
                                        }
                                    >
                                        Remover
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>
            {/* Produto por peso terá somente
                os campos solicitados */}
            {temModuloIronStore && cadastroIronStore && (
                <CadastroIronStore
                    form={form}
                    alterar={alterar}
                    variedades={variedades}
                    adicionarVariedade={adicionarVariedade}
                    removerVariedade={removerVariedade}
                    alterarCodigoVariedade={alterarCodigoVariedade}
                />
            )}
            <FormularioImagens
                valor={form.imagem_url}
                alterar={imgs =>
                    alterar("imagem_url", imgs)
                }
            />

            {modalAlerta.aberto &&
                createPortal(
                    <div
                        className="formulario-produto-alerta-overlay"
                        onMouseDown={fecharAlerta}
                    >

                        <div
                            className={`formulario-produto-alerta-modal ${modalAlerta.tipo}`}
                            onMouseDown={(e) => e.stopPropagation()}
                        >

                            <div className="formulario-produto-alerta-cabecalho">

                                <div
                                    className={`formulario-produto-alerta-indicador ${modalAlerta.tipo}`}
                                >
                                    {modalAlerta.tipo === "erro" ? "!" : "i"}
                                </div>

                                <div className="formulario-produto-alerta-textos">

                                    <strong className="formulario-produto-alerta-titulo">
                                        {modalAlerta.titulo}
                                    </strong>

                                    {modalAlerta.mensagem && (
                                        <span className="formulario-produto-alerta-mensagem">
                                            {modalAlerta.mensagem}
                                        </span>
                                    )}

                                </div>

                                <button
                                    type="button"
                                    className="formulario-produto-alerta-fechar"
                                    onClick={fecharAlerta}
                                    aria-label="Fechar"
                                >
                                    ×
                                </button>

                            </div>


                            {modalAlerta.itens.length > 0 && (

                                <div className="formulario-produto-alerta-pendencias">

                                    <span className="formulario-produto-alerta-pendencias-titulo">
                                        Verifique os campos
                                    </span>

                                    <div className="formulario-produto-alerta-lista">

                                        {modalAlerta.itens.map((itemAlerta, index) => (

                                            <div
                                                key={`${itemAlerta}-${index}`}
                                                className="formulario-produto-alerta-item"
                                            >

                                                <span className="formulario-produto-alerta-numero">
                                                    {index + 1}
                                                </span>

                                                <span className="formulario-produto-alerta-item-texto">
                                                    {itemAlerta}
                                                </span>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            )}


                            <div className="formulario-produto-alerta-acoes">

                                <button
                                    type="button"
                                    className="formulario-produto-alerta-entendi"
                                    onClick={fecharAlerta}
                                >
                                    Entendi
                                </button>

                            </div>

                        </div>

                    </div>,
                    document.body
                )
            }


        </div>
    );
}