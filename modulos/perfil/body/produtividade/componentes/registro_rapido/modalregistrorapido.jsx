import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL } from "../../../../../../config";
import "./modalregistrorapido.css";

export default function ModalCadastroProduto({
    textoInicial,
    fechar,
    onCriado
}) {
    const ehCodigo = /^\d+$/.test(textoInicial || "");
    const [tipoVariedade, setTipoVariedade] = useState("");
    const [variedadeDigitada, setVariedadeDigitada] = useState("");
    const [variedades, setVariedades] = useState([]);

    const tipoVariedadeRef = useRef(null);
    const variedadeRef = useRef(null);
    const [tipo, setTipo] = useState("produto");

    const [nome, setNome] = useState(
        ehCodigo ? "" : textoInicial || ""
    );

    const [codigo, setCodigo] = useState(
        ehCodigo ? textoInicial : ""
    );

    const [unidade, setUnidade] = useState("");
    const [peso, setPeso] = useState("");
    const [preco, setPreco] = useState("");
    const [categoria, setCategoria] = useState("");

    const [produtoId, setProdutoId] = useState("");
    const [produtoBaseNome, setProdutoBaseNome] = useState("");
    const [unidades, setUnidades] = useState("");
    const [tempoServico, setTempoServico] = useState("");

    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [salvando, setSalvando] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");
    const nomeRef = useRef(null);
    const codigoRef = useRef(null);
    const categoriaRef = useRef(null);
    const unidadeRef = useRef(null);
    const pesoRef = useRef(null);
    const precoRef = useRef(null);
    const produtoBaseRef = useRef(null);
    const unidadesRef = useRef(null);
    const tempoServicoRef = useRef(null);


    function adicionarVariedade() {

        const valor = variedadeDigitada.trim();

        if (!valor) {
            return;
        }

        const jaExiste = variedades.some(
            item =>
                item.nome.toLowerCase() ===
                valor.toLowerCase()
        );

        if (jaExiste) {
            return;
        }

        setVariedades(prev => {

            const novaVariedade = {
                nome: valor,

                // Se for a primeira variedade,
                // pega o código de barras principal
                codigo_barras:
                    prev.length === 0 && codigo.trim()
                        ? codigo.trim()
                        : ""
            };

            return [
                ...prev,
                novaVariedade
            ];
        });

        /*
            NÃO limpamos mais o código principal.
    
            Se existir código de barras, ele é copiado
            para a primeira variedade.
    
            A partir do momento que existe variedade,
            o input principal fica desabilitado.
        */

        setVariedadeDigitada("");

        requestAnimationFrame(() => {
            variedadeRef.current?.focus();
        });
    }


    function alterarCodigoVariedade(index, valor) {

        setVariedades(prev =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        codigo_barras: valor
                    }
                    : item
            )
        );
    }


    function removerVariedade(index) {

        setVariedades(prev =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    }
    useEffect(() => {
        carregarDados();

        if (ehCodigo) {
            nomeRef.current?.focus();
        } else {
            codigoRef.current?.focus();
        }
    }, []);

    async function carregarDados() {
        try {
            const token = localStorage.getItem("token");

            const resp = await fetch(
                `${API_URL}/admin/produtos-servicos`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resp.ok) {
                console.error(
                    "Erro ao carregar produtos:",
                    resp.status
                );
                return;
            }

            const dados = await resp.json();

            const produtosSimples = dados.filter(
                produto =>
                    produto.unidade &&
                    !produto.produto_id &&
                    !produto.tempo_servico &&
                    !produto.peso
            );

            setProdutos(produtosSimples);

            const categoriasUnicas = [
                ...new Set(
                    dados
                        .map(produto => produto.categoria)
                        .filter(
                            categoria =>
                                categoria &&
                                categoria.trim() !== ""
                        )
                )
            ];

            setCategorias(categoriasUnicas);

        } catch (erro) {
            console.error(
                "Erro ao carregar dados do cadastro rápido:",
                erro
            );
        }
    }

    function primeiraMaiuscula(texto) {
        if (!texto) return "";

        return (
            texto.charAt(0).toUpperCase() +
            texto.slice(1)
        );
    }

    function mudarTipo(novoTipo) {
        setTipo(novoTipo);

        setUnidade("");
        setPeso("");
        setProdutoId("");
        setProdutoBaseNome("");
        setUnidades("");
        setTempoServico("");
    }

    function selecionarProdutoBase(nomeProduto) {
        setProdutoBaseNome(nomeProduto);

        const encontrado = produtos.find(
            produto => produto.nome === nomeProduto
        );

        if (encontrado) {
            setProdutoId(encontrado.id);
        } else {
            setProdutoId("");
        }
    }

    function obterCamposAtuais() {
        const camposBase = [
            nomeRef,
            codigoRef,
            categoriaRef
        ];

        if (tipo === "produto") {
            return [
                ...camposBase,
                unidadeRef,
                precoRef
            ];
        }

        if (tipo === "peso") {
            return [
                ...camposBase,
                pesoRef,
                precoRef
            ];
        }

        if (tipo === "pacote") {
            return [
                ...camposBase,
                produtoBaseRef,
                unidadesRef,
                precoRef
            ];
        }

        if (tipo === "servico") {
            return [
                ...camposBase,
                tempoServicoRef,
                precoRef
            ];
        }

        return camposBase;
    }

    function handleEnterCampo(e, refAtual) {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const campos = obterCamposAtuais();

        const index = campos.findIndex(
            ref => ref === refAtual
        );

        if (
            index !== -1 &&
            index < campos.length - 1
        ) {
            campos[index + 1].current?.focus();
            return;
        }

        salvar();
    }

    async function salvar() {
        if (salvando) return;

        setErroCadastro("");

        if (!nome.trim()) {
            nomeRef.current?.focus();
            return;
        }

        if (!categoria.trim()) {
            categoriaRef.current?.focus();
            return;
        }

        if (tipo === "produto" && !unidade.trim()) {
            unidadeRef.current?.focus();
            return;
        }

        if (tipo === "peso" && !peso.trim()) {
            pesoRef.current?.focus();
            return;
        }

        if (
            tipo === "pacote" &&
            !produtoId
        ) {
            produtoBaseRef.current?.focus();
            return;
        }

        if (
            tipo === "pacote" &&
            Number(unidades || 0) <= 0
        ) {
            unidadesRef.current?.focus();
            return;
        }

        if (
            tipo === "servico" &&
            !tempoServico.trim()
        ) {
            tempoServicoRef.current?.focus();
            return;
        }

        if (
            preco === "" ||
            Number(
                String(preco).replace(",", ".")
            ) <= 0
        ) {
            precoRef.current?.focus();
            return;
        }

        setSalvando(true);

        try {
            const token = localStorage.getItem("token");

            const payload = {
                nome: nome.trim(),
                codigo_barras: codigo.trim() || null,
                categoria: categoria.trim() || null,

                preco: Number(
                    String(preco).replace(",", ".")
                ),

                unidade: null,
                peso: null,
                produto_id: null,
                unidades: 0,
                tempo_servico: null,
                variedad_primaria:
                    tipoVariedade.trim() || null,

                variedades: variedades.map(item => ({
                    nome: item.nome.trim(),
                    codigo_barras:
                        item.codigo_barras.trim() || null
                })),
            };

            if (tipo === "produto") {
                payload.unidade =
                    unidade.trim() || null;
            }

            if (tipo === "peso") {
                payload.peso =
                    peso.trim() || null;
            }

            if (tipo === "pacote") {
                payload.produto_id =
                    Number(produtoId);

                payload.unidades =
                    Number(unidades || 0);
            }

            if (tipo === "servico") {
                payload.tempo_servico =
                    tempoServico.trim() || null;
            }

            console.log(
                "[CADASTRO RÁPIDO] Tipo:",
                tipo
            );

            console.log(
                "[CADASTRO RÁPIDO] Payload:",
                payload
            );

            const resp = await fetch(
                `${API_URL}/api/produtos_servicos/criar-rapido`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify(payload)
                }
            );

            if (!resp.ok) {
                const erro = await resp
                    .json()
                    .catch(() => null);

                console.error(
                    "[CADASTRO RÁPIDO] Erro:",
                    erro
                );

                let mensagem =
                    erro?.detail ||
                    erro?.message ||
                    erro?.error ||
                    "Não foi possível cadastrar o produto.";

                if (Array.isArray(mensagem)) {
                    mensagem = mensagem
                        .map(item =>
                            item?.msg ||
                            item?.message ||
                            String(item)
                        )
                        .join(" ");
                }

                setErroCadastro(String(mensagem));

                return;
            }

            const resultado = await resp.json();

            const produtoCriado =
                resultado?.produto || resultado;

            console.log(
                "[CADASTRO RÁPIDO] Criado:",
                resultado
            );

            onCriado(produtoCriado);
            fechar();

        } catch (erro) {
            console.error(
                "[CADASTRO RÁPIDO] Erro de conexão:",
                erro
            );

            setErroCadastro(
                "Não foi possível comunicar com o servidor. Verifique a conexão e tente novamente."
            );

        } finally {
            setSalvando(false);
        }
    }

    return createPortal(
        <div
            className="modal-backdrop modal-cadastro-rapido-backdrop"
            onClick={fechar}
        >
            <div
                className="modal-box modal-cadastro-rapido-container"
                onClick={e => e.stopPropagation()}
            >

                <h3 className="modal-cadastro-rapido-titulo">
                    Novo produto
                </h3>

                <div className="modal-cadastro-rapido-tipos">

                    <button
                        type="button"
                        className={`modal-cadastro-rapido-tipo ${tipo === "produto"
                            ? "ativo"
                            : ""
                            }`}
                        onClick={() =>
                            mudarTipo("produto")
                        }
                    >
                        Produto
                    </button>

                    <button
                        type="button"
                        className={`modal-cadastro-rapido-tipo ${tipo === "peso"
                            ? "ativo"
                            : ""
                            }`}
                        onClick={() =>
                            mudarTipo("peso")
                        }
                    >
                        Produto por peso
                    </button>

                    <button
                        type="button"
                        className={`modal-cadastro-rapido-tipo ${tipo === "pacote"
                            ? "ativo"
                            : ""
                            }`}
                        onClick={() =>
                            mudarTipo("pacote")
                        }
                    >
                        Pacote
                    </button>

                    <button
                        type="button"
                        className={`modal-cadastro-rapido-tipo ${tipo === "servico"
                            ? "ativo"
                            : ""
                            }`}
                        onClick={() =>
                            mudarTipo("servico")
                        }
                    >
                        Serviço
                    </button>

                </div>

                <div className="field modal-cadastro-rapido-campo-nome">
                    <label>Nome</label>

                    <input
                        ref={nomeRef}
                        value={nome}
                        onChange={e =>
                            setNome(
                                primeiraMaiuscula(
                                    e.target.value
                                )
                            )
                        }
                        placeholder="Ex: Banana Prata"
                        onKeyDown={e =>
                            handleEnterCampo(
                                e,
                                nomeRef
                            )
                        }
                    />
                </div>

                <div className="field modal-cadastro-rapido-campo-codigo">
                    <label>Código de barras</label>

                    <input
                        ref={codigoRef}
                        value={codigo}
                        disabled={variedades.length > 0}
                        onChange={e =>
                            setCodigo(e.target.value)
                        }
                        placeholder={
                            variedades.length > 0
                                ? "Código vinculado à primeira variedade"
                                : "Leitor ou digite"
                        }
                        onKeyDown={e =>
                            handleEnterCampo(
                                e,
                                codigoRef
                            )
                        }
                    />
                </div>

                <div className="field modal-cadastro-rapido-campo-categoria">
                    <label>Categoria</label>

                    <input
                        ref={categoriaRef}
                        list="modal-cadastro-rapido-categorias"
                        value={categoria}
                        onChange={e =>
                            setCategoria(
                                primeiraMaiuscula(
                                    e.target.value
                                )
                            )
                        }
                        placeholder="Ex: Frutas"
                        onKeyDown={e =>
                            handleEnterCampo(
                                e,
                                categoriaRef
                            )
                        }
                    />

                    <datalist id="modal-cadastro-rapido-categorias">
                        {categorias.map(
                            (categoriaItem, index) => (
                                <option
                                    key={index}
                                    value={categoriaItem}
                                />
                            )
                        )}
                    </datalist>
                </div>

                {tipo === "produto" && (
                    <div className="field modal-cadastro-rapido-campo-unidade">
                        <label>Unidade</label>

                        <input
                            ref={unidadeRef}
                            value={unidade}
                            onChange={e =>
                                setUnidade(
                                    e.target.value
                                )
                            }
                            placeholder="Ex: un, caixa"
                            onKeyDown={e =>
                                handleEnterCampo(
                                    e,
                                    unidadeRef
                                )
                            }
                        />
                    </div>
                )}

                {tipo === "peso" && (
                    <div className="field modal-cadastro-rapido-campo-peso">
                        <label>Peso em gramas</label>

                        <input
                            ref={pesoRef}
                            type="number"
                            min="1"
                            step="1"
                            value={peso}
                            onChange={e => {
                                setPeso(
                                    e.target.value
                                );

                                if (
                                    !e.target.value
                                ) {
                                    setPreco("");
                                }
                            }}
                            placeholder="Ex: 100, 500, 1000"
                            onKeyDown={e =>
                                handleEnterCampo(
                                    e,
                                    pesoRef
                                )
                            }
                        />
                    </div>
                )}

                {tipo === "pacote" && (
                    <>
                        <div className="field modal-cadastro-rapido-campo-base">
                            <label>Produto base</label>

                            <input
                                ref={produtoBaseRef}
                                list="modal-cadastro-rapido-produtos"
                                value={produtoBaseNome}
                                onChange={e =>
                                    selecionarProdutoBase(
                                        e.target.value
                                    )
                                }
                                placeholder="Selecione o produto"
                                onKeyDown={e =>
                                    handleEnterCampo(
                                        e,
                                        produtoBaseRef
                                    )
                                }
                            />

                            <datalist id="modal-cadastro-rapido-produtos">
                                {produtos.map(
                                    produto => (
                                        <option
                                            key={produto.id}
                                            value={produto.nome}
                                        />
                                    )
                                )}
                            </datalist>
                        </div>

                        <div className="field modal-cadastro-rapido-campo-unidades">
                            <label>
                                Quantidade de unidades
                            </label>

                            <input
                                ref={unidadesRef}
                                type="number"
                                min="1"
                                step="1"
                                value={unidades}
                                onChange={e =>
                                    setUnidades(
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 6"
                                onKeyDown={e =>
                                    handleEnterCampo(
                                        e,
                                        unidadesRef
                                    )
                                }
                            />
                        </div>
                    </>
                )}

                {tipo === "servico" && (
                    <div className="field modal-cadastro-rapido-campo-servico">
                        <label>
                            Tempo de serviço
                        </label>

                        <input
                            ref={tempoServicoRef}
                            value={tempoServico}
                            onChange={e =>
                                setTempoServico(
                                    e.target.value
                                )
                            }
                            placeholder="Ex: 30 min"
                            onKeyDown={e =>
                                handleEnterCampo(
                                    e,
                                    tempoServicoRef
                                )
                            }
                        />
                    </div>
                )}
                <div className="field modal-cadastro-rapido-campo-tipo-variedade">
                    <label>Tipo de variedade</label>

                    <input
                        ref={tipoVariedadeRef}
                        value={tipoVariedade}
                        onChange={e =>
                            setTipoVariedade(
                                primeiraMaiuscula(
                                    e.target.value
                                )
                            )
                        }
                        placeholder="Ex: Cor, Tamanho, Sabor"
                    />
                </div>

                <div className="field modal-cadastro-rapido-campo-variedade">
                    <label>Variedade</label>

                    <input
                        ref={variedadeRef}
                        value={variedadeDigitada}
                        onChange={e =>
                            setVariedadeDigitada(
                                primeiraMaiuscula(
                                    e.target.value
                                )
                            )
                        }
                        placeholder="Ex: Preto"
                        onKeyDown={e => {

                            if (e.key !== "Enter") {
                                return;
                            }

                            e.preventDefault();

                            adicionarVariedade();
                        }}
                    />
                </div>

                {variedades.length > 0 && (
                    <div className="modal-cadastro-rapido-variedades">

                        {variedades.map(
                            (item, index) => (

                                <div
                                    key={`${item.nome}-${index}`}
                                    className="modal-cadastro-rapido-variedade-item"
                                >

                                    <div className="modal-cadastro-rapido-variedade-nome">
                                        {item.nome}
                                    </div>

                                    <input
                                        className="modal-cadastro-rapido-variedade-codigo"
                                        value={item.codigo_barras}
                                        onChange={e =>
                                            alterarCodigoVariedade(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Código de barras opcional"
                                    />

                                    <button
                                        type="button"
                                        className="modal-cadastro-rapido-variedade-remover"
                                        onClick={() =>
                                            removerVariedade(index)
                                        }
                                    >
                                        Remover
                                    </button>

                                </div>
                            )
                        )}

                    </div>
                )}
                <div className="field modal-cadastro-rapido-campo-preco">
                    <label>
                        {tipo === "peso"
                            ? (
                                peso
                                    ? `Preço por ${peso}g`
                                    : "Preço por peso"
                            )
                            : "Preço"
                        }
                    </label>

                    <input
                        ref={precoRef}
                        value={preco}
                        disabled={
                            tipo === "peso" &&
                            !peso
                        }
                        onChange={e =>
                            setPreco(
                                e.target.value.replace(
                                    ",",
                                    "."
                                )
                            )
                        }
                        placeholder={
                            tipo === "peso"
                                ? (
                                    peso
                                        ? `Preço por ${peso}g`
                                        : "Informe o peso primeiro"
                                )
                                : "Ex: 39.90"
                        }
                        onKeyDown={e =>
                            handleEnterCampo(
                                e,
                                precoRef
                            )
                        }
                    />
                </div>

                <div className="modal-cadastro-rapido-acoes">

                    <button
                        className="modal-cadastro-rapido-salvar"
                        onClick={salvar}
                        disabled={salvando}
                    >
                        {salvando
                            ? "Salvando..."
                            : "Salvar"}
                    </button>

                    <button
                        className="modal-cadastro-rapido-cancelar"
                        onClick={fechar}
                        disabled={salvando}
                    >
                        Cancelar
                    </button>

                </div>
                {erroCadastro && (
                    <div
                        className="modal-cadastro-rapido-erro-cadastro"
                        role="alert"
                    >
                        <div className="modal-cadastro-rapido-erro-icone">
                            !
                        </div>

                        <div className="modal-cadastro-rapido-erro-conteudo">
                            <strong>
                                Produto não cadastrado
                            </strong>

                            <span>
                                {erroCadastro}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}