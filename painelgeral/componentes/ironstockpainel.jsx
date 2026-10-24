import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { API_URL } from "../../config";
import "./ironstock.css";
const API_BASE = API_URL.replace(/\/+$/, "");
const ROTAS = {
    me: "/panel/me",
    estado: "/ironstock/painel/estado",
    comercios: "/ironstock/comercios",
    produtos: (comercioId) =>
        `/ironstock/comercios/${comercioId}/produtos`,
    pdf: (produtoId) => `/ironstock/produtos/${produtoId}/pdf`,
    processar: (produtoId) => `/ironstock/produtos/${produtoId}/processar`,
    pdfVariedade: (produtoId) =>
        `/ironstock/produtos/${produtoId}/variedade-pdf`,
    pdfImagemProduto: (produtoId) =>
        `/ironstock/produtos/${produtoId}/imagem-produto-pdf`,
};

const CAMPOS = [
    { key: "nome", label: "Nome do produto", required: true },
    { key: "categoria", label: "Categoria", required: true },
    { key: "unidade", label: "Unidade", required: true },
    { key: "preco", label: "Preço (R$)", type: "number", required: true },
    { key: "preco_ironstore", label: "Preço IronStore (R$)", type: "number" },
    { key: "preco_promocao", label: "Preço promocional (R$)", type: "number" },
    {
        key: "destaque",
        label: "Destaque",
        type: "select",
        options: [
            { value: "ferro", label: "Ferro" },
            { value: "ouro", label: "Ouro" },
            { value: "diamante", label: "Diamante" },
        ],
        required: true,
    },
    { key: "peso_g", label: "Peso (gramas)", type: "number", required: true },
    { key: "altura_cm", label: "Altura (cm)", type: "number", required: true },
    {
        key: "cumprimento_cm",
        label: "Comprimento (cm)",
        type: "number",
        required: true,
    },
    { key: "largura_cm", label: "Largura (cm)", type: "number", required: true },
];



const PROMPT_IA = `Você é um especialista em cadastro de produtos para comércio eletrônico e preparação de encomendas para transporte.

Analise cuidadosamente todas as imagens e informações disponíveis sobre o produto, incluindo as instruções específicas cadastradas no IronStock.

OBJETIVO PRINCIPAL:
Identificar o produto e estimar o peso e as dimensões externas da embalagem necessária para enviá-lo por uma transportadora.

COMO ESTIMAR PESO E DIMENSÕES:
1. Observe o formato, material, estrutura e tamanho aparente do produto nas imagens.
2. Estime o peso total em gramas e as dimensões externas da embalagem pronta para envio.
3. Considere o espaço necessário para acondicionamento e proteção, sem criar embalagens excessivamente grandes.
4. Considere se o produto pode ser dobrado, enrolado, desmontado ou acondicionado de forma compacta.
5. Para roupas, considere a peça dobrada dentro de uma embalagem plástica ou envelope apropriado.
6. Para objetos rígidos, estime uma caixa que comporte o produto e a proteção necessária.
7. Para produtos frágeis, considere espaço adicional para material de proteção.
8. Não confunda as dimensões do produto aberto com as dimensões da embalagem pronta para envio.
9. Se houver tamanhos ou variedades, considere se o peso e a embalagem podem variar. Preserve as variedades informadas nas instruções específicas do IronStock.
10. Use primeiro os pesos e as dimensões reais existentes nos dados. Se não existirem, faça uma estimativa logística plausível com base no tipo de produto e nas imagens.
11. NÃO retorne null para peso_g, altura_cm, cumprimento_cm ou largura_cm apenas porque não há medidas exatas. Faça uma estimativa numérica positiva sempre que houver informação visual ou contextual suficiente para estimar.
12. Somente use null para algum desses campos quando não houver base suficiente para uma estimativa minimamente responsável.

TIPO DE VARIEDADE — REGRA OBRIGATÓRIA:

- Analise as imagens e as informações do produto para identificar
  qual característica diferencia suas variedades.
- Retorne essa característica no campo "tipo_variedade" do produto principal.
- Retorne também "tipo_variedade" em cada objeto dentro de "variedades".
- O tipo deve identificar a característica, não o valor específico.
- Exemplos:
  - Camisa preta e vermelha: "Cor"
  - Camisa P, M e G: "Tamanho"
  - Produto 110V e 220V: "Voltagem"
  - Modelos diferentes: "Modelo"
  - Produto com opções de cor e tamanho: "Cor e Tamanho"
- No campo "nome" de cada variedade, coloque a opção específica,
  como "Preto", "Vermelho", "P", "M" ou "G".
- Não confunda "tipo_variedade" com "nome".
- Se não houver variedades, retorne "tipo_variedade": ""
  e "variedades": [].
- Não invente variedades que não estejam sustentadas pelas informações.
SIGNIFICADO DOS CAMPOS:
- peso_g: peso estimado do produto acondicionado, em gramas.
- altura_cm: altura externa da embalagem, em centímetros.
- cumprimento_cm: comprimento externo da embalagem, em centímetros.
- largura_cm: largura externa da embalagem, em centímetros.
- Os quatro campos devem conter números positivos, sem unidades textuais.

CADASTRO DO PRODUTO:
- Identifique nome, categoria, material, cor e características visíveis.
- Escreva uma descrição clara e adequada à venda online.
- Crie variedades somente quando forem sustentadas pelas imagens ou informações fornecidas.
- Preserve os tamanhos, opções e códigos de barras existentes.
- Nunca invente códigos de barras.
- Não invente preços. Se não houver informação de preço, retorne null.
- Use somente URLs reais fornecidas para as imagens.
- Não invente características que não possam ser sustentadas pelas informações disponíveis.
- Siga as instruções específicas do IronStock, sem ignorá-las.

VALIDAÇÃO OBRIGATÓRIA ANTES DE RESPONDER:
Confira se peso_g, altura_cm, cumprimento_cm e largura_cm contêm números positivos sempre que for possível estimá-los. Não deixe esses campos como null por excesso de cautela quando uma estimativa logística razoável for possível.
Confira também se o JSON está válido e se todos os campos exigidos estão presentes.
- Identifique o tipo de variedade correspondente às opções do produto.
- O campo "tipo_variedade" representa a característica que diferencia as variedades, não o nome de uma variedade específica.
- Exemplos: "Cor" para Preto/Vermelho; "Tamanho" para P/M/G; "Modelo" para modelos diferentes; "Voltagem" para 110V/220V.
- Se as variedades diferirem por mais de uma característica, informe todas, como "Cor e Tamanho".
- Analise o produto e as variedades antes de decidir. Não confunda categoria do produto com tipo de variedade.
- Retorne "tipo_variedade" no produto principal e em cada objeto de variedades.
Retorne SOMENTE um objeto JSON válido, sem Markdown ou explicações fora do JSON, usando exatamente esta estrutura:
{
  "nome": "",
  "categoria": "",
  "unidade": "unidade",
  "preco": null,
  "preco_ironstore": null,
  "preco_promocao": null,
  "destaque": "ferro",
  "descricao": "",
  "descricao_curta": "",
  "peso_g": null,
  "altura_cm": null,
  "cumprimento_cm": null,
  "largura_cm": null,
  "imagem_url": [],
  "tipo_variedade": "",
  "variedades": [
    {
      "nome": "",
      "tipo_variedade": "",
      "codigo_barras": "",
      "imagem_url": []
    }
  ]
}`;

function lerToken() {
    const chaves = [
        "token",
        "access_token",
        "accessToken",
        "jwt_token",
        "authToken",
    ];

    for (const chave of chaves) {
        const valor = localStorage.getItem(chave);
        if (valor) return valor;
    }

    return "";
}

function normalizarImagens(valor) {
    if (Array.isArray(valor)) {
        return [...new Set(
            valor.map((item) => String(item || "").trim()).filter(Boolean)
        )];
    }

    return [...new Set(
        String(valor || "")
            .split("|")
            .map((item) => item.trim())
            .filter(Boolean)
    )];
}

function juntarImagens(valor) {
    return normalizarImagens(valor).join("|");
}

function valorNumerico(valor) {
    if (valor === "" || valor === null || valor === undefined) return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function formatarMoeda(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "—";

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function mensagemErro(dados, fallback) {
    if (typeof dados?.detail === "string") return dados.detail;
    if (typeof dados?.mensagem === "string") return dados.mensagem;
    if (typeof dados?.detail?.mensagem === "string") {
        return dados.detail.mensagem;
    }
    return fallback;
}

function normalizarProduto(produto) {
    return {
        ...produto,
        nome: produto?.nome || "",
        categoria: produto?.categoria || "",
        unidade: produto?.unidade || "unidade",
        preco: produto?.preco ?? "",
        preco_ironstore: produto?.preco_ironstore ?? "",
        preco_promocao: produto?.preco_promocao ?? "",
        destaque: produto?.destaque || "ferro",
        descricao: produto?.descricao || "",
        descricao_curta: produto?.descricao_curta || "",
        peso_g: produto?.peso_g ?? "",
        altura_cm: produto?.altura_cm ?? "",
        cumprimento_cm: produto?.cumprimento_cm ?? "",
        largura_cm: produto?.largura_cm ?? "",
        imagem_url: normalizarImagens(produto?.imagem_url),

        tipo_variedade: produto?.tipo_variedade || "",

        variedades: Array.isArray(produto?.variedades)
            ? produto.variedades.map((variedade) => ({
                nome: variedade?.nome || "",
                tipo_variedade: variedade?.tipo_variedade || "",
                codigo_barras: variedade?.codigo_barras || "",
                imagem_url: normalizarImagens(variedade?.imagem_url),
            }))
            : [],
    };
}

function prepararPayload(produto) {
    const imagensVariedades = produto.variedades.flatMap(
        (variedade) => normalizarImagens(variedade.imagem_url)
    );

    const imagensPrincipais = normalizarImagens([
        ...normalizarImagens(produto.imagem_url),
        ...imagensVariedades,
    ]);

    return {
        nome: String(produto.nome || "").trim(),
        categoria: String(produto.categoria || "").trim(),
        unidade: String(produto.unidade || "").trim(),
        preco: valorNumerico(produto.preco),
        preco_ironstore: valorNumerico(produto.preco_ironstore),
        preco_promocao: valorNumerico(produto.preco_promocao),
        destaque: produto.destaque || "ferro",
        descricao: String(produto.descricao || "").trim(),
        descricao_curta: String(produto.descricao_curta || "").trim(),
        peso_g: valorNumerico(produto.peso_g),
        altura_cm: valorNumerico(produto.altura_cm),
        cumprimento_cm: valorNumerico(produto.cumprimento_cm),
        largura_cm: valorNumerico(produto.largura_cm),
        imagem_url: imagensPrincipais,

        tipo_variedade: String(produto.tipo_variedade || "").trim(),

        variedades: produto.variedades.map((variedade) => ({
            nome: String(variedade.nome || "").trim(),
            tipo_variedade: String(
                variedade.tipo_variedade || produto.tipo_variedade || ""
            ).trim(),
            codigo_barras: String(variedade.codigo_barras || "").trim(),
            imagem_url: normalizarImagens(variedade.imagem_url),
        })),
    };
}

function validarProduto(produto) {
    const erros = [];

    if (!produto.nome.trim()) erros.push("Informe o nome do produto.");
    if (!produto.categoria.trim()) erros.push("Informe a categoria.");
    if (!produto.unidade.trim()) erros.push("Informe a unidade.");

    if (!(Number(produto.preco) > 0)) {
        erros.push("O preço deve ser maior que zero.");
    }

    if (!["ferro", "ouro", "diamante"].includes(produto.destaque)) {
        erros.push("Selecione um destaque válido.");
    }

    for (const [campo, rotulo] of [
        ["peso_g", "Peso"],
        ["altura_cm", "Altura"],
        ["cumprimento_cm", "Comprimento"],
        ["largura_cm", "Largura"],
    ]) {
        if (!(Number(produto[campo]) > 0)) {
            erros.push(`${rotulo} deve ser maior que zero.`);
        }
    }

    if (!normalizarImagens(produto.imagem_url).length) {
        erros.push("Adicione pelo menos uma imagem ao produto.");
    }

    produto.variedades.forEach((variedade, indice) => {
        if (!variedade.nome.trim()) {
            erros.push(`Informe o nome da variedade ${indice + 1}.`);
        }

        if (!normalizarImagens(variedade.imagem_url).length) {
            erros.push(
                `Adicione pelo menos uma imagem à variedade ${indice + 1}.`
            );
        }
    });

    return erros;
}

function horarioNoBrasil() {
    const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        weekday: "short",
        hour: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const dia = partes.find((parte) => parte.type === "weekday")?.value;
    const hora = Number(
        partes.find((parte) => parte.type === "hour")?.value
    );

    const diasPermitidos = ["Mon", "Wed", "Fri"];
    return diasPermitidos.includes(dia) && hora >= 17 && hora < 22;
}

export default function Ironstock() {
    const [autorizado, setAutorizado] = useState(false);
    const [carregandoInicial, setCarregandoInicial] = useState(true);
    const [carregando, setCarregando] = useState(false);
    const [horario, setHorario] = useState({
        disponivel: false,
        mensagem: "",
        proxima_abertura: null,
    });

    const [comercios, setComercios] = useState([]);
    const [comercioSelecionado, setComercioSelecionado] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    const [jsonIA, setJsonIA] = useState("");
    const [produtoEditavel, setProdutoEditavel] = useState(null);

    const [busca, setBusca] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [processando, setProcessando] = useState(false);
    const inputImagensRef = useRef(null);

    const [destinoUploadImagem, setDestinoUploadImagem] = useState({
        tipo: "produto",
        indiceVariedade: null,
    });

    const [enviandoImagens, setEnviandoImagens] = useState(false);

    const [erroUploadImagem, setErroUploadImagem] = useState("");

    function selecionarImagemLocal(tipo = "produto", indiceVariedade = null) {
        setErroUploadImagem("");

        setDestinoUploadImagem({
            tipo,
            indiceVariedade,
        });

        inputImagensRef.current?.click();
    }

    async function enviarImagensSelecionadas(evento) {
        const arquivos = Array.from(evento.target.files || []).filter(
            (arquivo) => arquivo.type.startsWith("image/")
        );

        // Permite selecionar novamente o mesmo arquivo depois.
        evento.target.value = "";

        if (!arquivos.length) return;

        setEnviandoImagens(true);
        setErroUploadImagem("");

        try {
            const tokenUpload = lerToken();

            if (!tokenUpload) {
                throw new Error("Sua sessão expirou. Entre novamente no sistema.");
            }

            const formData = new FormData();

            formData.append("pasta", "produtos");

            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });

            const resposta = await fetch(
                `${API_BASE}/upload/client/imagens`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${tokenUpload}`,
                    },
                    body: formData,
                    cache: "no-store",
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    dados.mensagem ||
                    `Não foi possível enviar as imagens (HTTP ${resposta.status}).`
                );
            }

            const novasUrls = String(dados.urls || "")
                .split("|")
                .map((url) => url.trim())
                .filter(Boolean);

            if (!novasUrls.length) {
                throw new Error("O servidor não retornou as URLs das imagens.");
            }

            if (destinoUploadImagem.tipo === "produto") {
                setProdutoEditavel((atual) => {
                    if (!atual) return atual;

                    return {
                        ...atual,
                        imagem_url: [
                            ...normalizarImagens(atual.imagem_url),
                            ...novasUrls,
                        ],
                    };
                });
            } else {
                const indice = destinoUploadImagem.indiceVariedade;

                setProdutoEditavel((atual) => {
                    if (!atual) return atual;

                    return {
                        ...atual,
                        variedades: atual.variedades.map((variedade, i) =>
                            i === indice
                                ? {
                                    ...variedade,
                                    imagem_url: [
                                        ...normalizarImagens(variedade.imagem_url),
                                        ...novasUrls,
                                    ],
                                }
                                : variedade
                        ),
                    };
                });
            }

            setSucesso(
                `${novasUrls.length} imagem(ns) enviada(s) com sucesso.`
            );
        } catch (erro) {
            setErroUploadImagem(
                erro.message || "Erro ao enviar as imagens."
            );
        } finally {
            setEnviandoImagens(false);
        }
    }
    const token = useMemo(() => lerToken(), []);

    const requisicao = useCallback(async (rota, opcoes = {}) => {
        const headers = {
            ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...opcoes.headers,
        };

        const resposta = await fetch(`${API_BASE}${rota}`, {
            ...opcoes,
            headers,
            cache: "no-store",
        });

        const tipo = resposta.headers.get("content-type") || "";
        let dados = null;

        if (tipo.includes("application/json")) {
            dados = await resposta.json();
        } else if (!opcoes.esperarBlob) {
            dados = await resposta.text();
        }

        if (!resposta.ok) {
            throw new Error(
                mensagemErro(dados, `Erro HTTP ${resposta.status}.`)
            );
        }

        return opcoes.esperarBlob ? resposta.blob() : dados;
    }, [token]);

    const atualizarEstadoHorario = useCallback(async () => {
        try {
            const dados = await requisicao(ROTAS.estado);
            setHorario({
                disponivel: Boolean(dados?.disponivel),
                mensagem: dados?.mensagem || "",
                proxima_abertura: dados?.proxima_abertura || null,
            });
        } catch (e) {
            setHorario({
                disponivel: horarioNoBrasil(),
                mensagem: "",
                proxima_abertura: null,
            });
        }
    }, [requisicao]);

    const carregarComercios = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const dados = await requisicao(ROTAS.comercios);
            const lista = Array.isArray(dados)
                ? dados
                : dados?.comercios || [];

            setComercios(lista);
        } catch (e) {
            setErro(e.message || "Não foi possível carregar as lojas.");
        } finally {
            setCarregando(false);
        }
    }, [requisicao]);

    const carregarProdutos = useCallback(async (comercio) => {
        setCarregando(true);
        setErro("");
        setSucesso("");

        try {
            const dados = await requisicao(ROTAS.produtos(comercio.id));
            const lista = Array.isArray(dados)
                ? dados
                : dados?.produtos || [];

            setProdutos(lista);
            setComercioSelecionado(comercio);
            setProdutoSelecionado(null);
            setProdutoEditavel(null);
            setJsonIA("");
        } catch (e) {
            setErro(e.message || "Não foi possível carregar os produtos.");
        } finally {
            setCarregando(false);
        }
    }, [requisicao]);

    useEffect(() => {
        let ativo = true;

        async function iniciar() {
            setCarregandoInicial(true);
            setErro("");

            try {
                await requisicao(ROTAS.me);

                if (!ativo) return;
                setAutorizado(true);

                const estado = await requisicao(ROTAS.estado);
                if (!ativo) return;

                setHorario({
                    disponivel: Boolean(estado?.disponivel),
                    mensagem: estado?.mensagem || "",
                    proxima_abertura: estado?.proxima_abertura || null,
                });

                if (estado?.disponivel) {
                    await carregarComercios();
                }
            } catch (e) {
                if (!ativo) return;
                setAutorizado(false);
                setErro(
                    e.message ||
                    "Você não tem autorização para acessar este painel."
                );
            } finally {
                if (ativo) setCarregandoInicial(false);
            }
        }

        iniciar();

        return () => {
            ativo = false;
        };
    }, [requisicao, carregarComercios]);

    useEffect(() => {
        const intervalo = window.setInterval(async () => {
            try {
                const dados = await requisicao(ROTAS.estado);
                setHorario({
                    disponivel: Boolean(dados?.disponivel),
                    mensagem: dados?.mensagem || "",
                    proxima_abertura: dados?.proxima_abertura || null,
                });

                if (!dados?.disponivel) {
                    setComercioSelecionado(null);
                    setProdutos([]);
                    setProdutoSelecionado(null);
                    setProdutoEditavel(null);
                }
            } catch {
                // A próxima requisição poderá recuperar o estado.
            }
        }, 60_000);

        return () => window.clearInterval(intervalo);
    }, [requisicao]);

    const produtosFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        if (!termo) return produtos;

        return produtos.filter((produto) =>
            String(produto.nome || "").toLocaleLowerCase("pt-BR").includes(termo)
            || String(produto.id || "").includes(termo)
        );
    }, [produtos, busca]);

    function abrirProduto(produto) {
        setProdutoSelecionado(produto);
        setProdutoEditavel(null);
        setJsonIA("");
        setErro("");
        setSucesso("");
    }

    async function baixarPDF(produto) {
        setErro("");
        setSucesso("");

        try {
            const blob = await requisicao(
                ROTAS.pdf(produto.id),
                { esperarBlob: true }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ironstock-produto-${produto.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            setSucesso("PDF do produto preparado para download.");
        } catch (e) {
            setErro(e.message || "Não foi possível baixar o PDF.");
        }
    }

    function importarJSON() {
        setErro("");
        setSucesso("");

        try {
            const texto = jsonIA.trim();
            if (!texto) {
                throw new Error("Cole primeiro o JSON recebido da IA.");
            }

            let dados;
            try {
                dados = JSON.parse(texto);
            } catch {
                const semMarcadores = texto
                    .replace(/^```(?:json)?\s*/i, "")
                    .replace(/\s*```$/i, "");
                dados = JSON.parse(semMarcadores);
            }

            if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
                throw new Error("O conteúdo precisa ser um objeto JSON.");
            }

            const normalizado = normalizarProduto(dados);

            if (!normalizado.nome && produtoSelecionado?.nome) {
                normalizado.nome = produtoSelecionado.nome;
            }

            if (!normalizado.imagem_url.length && produtoSelecionado?.imagem_url) {
                normalizado.imagem_url = normalizarImagens(
                    produtoSelecionado.imagem_url
                );
            }

            setProdutoEditavel(normalizado);
            setSucesso(
                "JSON importado. Revise todos os campos e as imagens antes de salvar."
            );
        } catch (e) {
            setErro(e.message || "JSON inválido. Confira o conteúdo recebido.");
        }
    }

    function atualizarCampo(campo, valor) {
        setProdutoEditavel((atual) => ({
            ...atual,
            [campo]: valor,
        }));
    }

    function atualizarVariedade(indice, campo, valor) {
        setProdutoEditavel((atual) => ({
            ...atual,
            variedades: atual.variedades.map((variedade, i) =>
                i === indice
                    ? { ...variedade, [campo]: valor }
                    : variedade
            ),
        }));
    }

    function adicionarVariedade() {
        setProdutoEditavel((atual) => ({
            ...atual,
            variedades: [
                ...atual.variedades,
                { nome: "", codigo_barras: "", imagem_url: [] },
            ],
        }));
    }

    function removerVariedade(indice) {
        setProdutoEditavel((atual) => ({
            ...atual,
            variedades: atual.variedades.filter((_, i) => i !== indice),
        }));
    }

    function adicionarImagemProduto() {
        setProdutoEditavel((atual) => ({
            ...atual,
            imagem_url: [...normalizarImagens(atual.imagem_url), ""],
        }));
    }

    function atualizarImagemProduto(indice, valor) {
        setProdutoEditavel((atual) => ({
            ...atual,
            imagem_url: atual.imagem_url.map((imagem, i) =>
                i === indice ? valor : imagem
            ),
        }));
    }

    function removerImagemProduto(indice) {
        setProdutoEditavel((atual) => ({
            ...atual,
            imagem_url: atual.imagem_url.filter((_, i) => i !== indice),
        }));
    }

    function adicionarImagemVariedade(indiceVariedade) {
        setProdutoEditavel((atual) => ({
            ...atual,
            variedades: atual.variedades.map((variedade, i) =>
                i === indiceVariedade
                    ? {
                        ...variedade,
                        imagem_url: [
                            ...normalizarImagens(variedade.imagem_url),
                            "",
                        ],
                    }
                    : variedade
            ),
        }));
    }

    function atualizarImagemVariedade(
        indiceVariedade,
        indiceImagem,
        valor
    ) {
        setProdutoEditavel((atual) => ({
            ...atual,
            variedades: atual.variedades.map((variedade, i) =>
                i === indiceVariedade
                    ? {
                        ...variedade,
                        imagem_url: variedade.imagem_url.map((imagem, j) =>
                            j === indiceImagem ? valor : imagem
                        ),
                    }
                    : variedade
            ),
        }));
    }

    function removerImagemVariedade(indiceVariedade, indiceImagem) {
        setProdutoEditavel((atual) => ({
            ...atual,
            variedades: atual.variedades.map((variedade, i) =>
                i === indiceVariedade
                    ? {
                        ...variedade,
                        imagem_url: variedade.imagem_url.filter(
                            (_, j) => j !== indiceImagem
                        ),
                    }
                    : variedade
            ),
        }));
    }

    async function salvarProduto(evento) {
        evento.preventDefault();
        setErro("");
        setSucesso("");

        if (!produtoSelecionado || !produtoEditavel || !comercioSelecionado) {
            setErro("Selecione um produto e importe os dados da IA primeiro.");
            return;
        }

        const payload = prepararPayload(produtoEditavel);
        const erros = validarProduto(payload);

        if (erros.length) {
            setErro(erros.join(" "));
            return;
        }

        setProcessando(true);

        try {
            const resposta = await requisicao(
                ROTAS.processar(produtoSelecionado.id),
                {
                    method: "POST",
                    body: JSON.stringify({
                        comercio_id: comercioSelecionado.id,
                        ...payload,
                    }),
                }
            );

            setSucesso(
                resposta?.mensagem ||
                "Produto processado e enviado para a IronStore com sucesso."
            );

            setProdutoSelecionado(null);
            setProdutoEditavel(null);
            setJsonIA("");

            await carregarProdutos(comercioSelecionado);
            await carregarComercios();
        } catch (e) {
            setErro(e.message || "Não foi possível processar o produto.");
        } finally {
            setProcessando(false);
        }
    }

    function voltarParaLojas() {
        setComercioSelecionado(null);
        setProdutos([]);
        setProdutoSelecionado(null);
        setProdutoEditavel(null);
        setJsonIA("");
        setBusca("");
        setErro("");
        setSucesso("");
        carregarComercios();
    }

    function voltarParaProdutos() {
        setProdutoSelecionado(null);
        setProdutoEditavel(null);
        setJsonIA("");
        setErro("");
        setSucesso("");
    }

    if (carregandoInicial) {
        return (
            <main className="ironstock-page">
                <section className="ironstock-loading">
                    <span className="ironstock-spinner" />
                    <h2>Verificando acesso ao IronStock</h2>
                    <p>Aguarde enquanto validamos sua sessão e o horário.</p>
                </section>
            </main>
        );
    }

    if (!autorizado) {
        return (
            <main className="ironstock-page">
                <section className="ironstock-access-denied">
                    <div className="ironstock-status-icon">!</div>
                    <h1>Acesso não autorizado</h1>
                    <p>
                        Este painel é restrito ao usuário autorizado pela
                        administração da Iron Executions.
                    </p>
                    {erro && <div className="ironstock-alert error">{erro}</div>}
                </section>
            </main>
        );
    }

    if (!horario.disponivel) {
        return (
            <main className="ironstock-page">
                <header className="ironstock-header">
                    <div>
                        <span className="ironstock-eyebrow">IRON EXECUTIONS</span>
                        <h1>IronStock</h1>
                        <p>Central de preparação e publicação de produtos.</p>
                    </div>
                    <span className="ironstock-pill closed">Painel fechado</span>
                </header>

                <section className="ironstock-closed-card">
                    <div className="ironstock-closed-symbol">◷</div>
                    <h2>O painel não está disponível neste horário</h2>
                    <p>
                        O IronStock funciona às <strong>segundas, quartas e
                            sextas-feiras, das 17h às 22h</strong>, no horário de
                        Brasília.
                    </p>
                    {horario.mensagem && (
                        <p className="ironstock-muted">{horario.mensagem}</p>
                    )}
                    {horario.proxima_abertura && (
                        <p className="ironstock-next-opening">
                            Próxima abertura: {horario.proxima_abertura}
                        </p>
                    )}
                    <button
                        className="ironstock-button secondary"
                        onClick={atualizarEstadoHorario}
                        type="button"
                    >
                        Verificar novamente
                    </button>
                </section>
            </main>
        );
    }
    async function baixarPDFVariedade(variedade, indiceVariedade) {
        setErro("");
        setSucesso("");

        if (!produtoSelecionado || !comercioSelecionado) {
            setErro("Selecione o produto e a loja antes de gerar o PDF.");
            return;
        }

        if (!variedade.nome.trim()) {
            setErro("Informe o nome da variedade antes de gerar o PDF.");
            return;
        }

        try {
            const blob = await requisicao(ROTAS.pdfVariedade(produtoSelecionado.id), {
                method: "POST",
                body: JSON.stringify({
                    comercio_id: comercioSelecionado.id,
                    nome_variedade: variedade.nome.trim(),
                    indice_variedade: indiceVariedade,
                    imagens_variedade: normalizarImagens(variedade.imagem_url),
                }),
                esperarBlob: true,
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                `ironstock-produto-${produtoSelecionado.id}-variedade-${indiceVariedade + 1}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);

            setSucesso("PDF de referência da variedade preparado para download.");
        } catch (e) {
            setErro(e.message || "Não foi possível gerar o PDF da variedade.");
        }
    }
    async function baixarPDFImagemProduto() {
        setErro("");
        setSucesso("");

        if (!produtoSelecionado || !comercioSelecionado || !produtoEditavel) {
            setErro("Selecione um produto e carregue os dados para editar.");
            return;
        }

        const imagens = normalizarImagens(produtoEditavel.imagem_url);

        if (!imagens.length) {
            setErro("Adicione pelo menos uma imagem normal do produto.");
            return;
        }

        try {
            const blob = await requisicao(
                ROTAS.pdfImagemProduto(produtoSelecionado.id),
                {
                    method: "POST",
                    body: JSON.stringify({
                        comercio_id: comercioSelecionado.id,
                        imagens_produto: imagens,
                    }),
                    esperarBlob: true,
                }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                `ironstock-produto-${produtoSelecionado.id}-imagem-comercial.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => URL.revokeObjectURL(url), 1000);

            setSucesso("PDF para gerar a imagem comercial baixado com sucesso.");
        } catch (e) {
            setErro(
                e.message || "Não foi possível gerar o PDF da imagem comercial."
            );
        }
    }
    return (
        <main className="ironstock-page">
            <header className="ironstock-header">
                <div>
                    <span className="ironstock-eyebrow">IRON EXECUTIONS</span>
                    <h1>IronStock</h1>
                    <p>Preparação inteligente de produtos para a IronStore.</p>
                </div>

                <div className="ironstock-header-actions">
                    <span className="ironstock-pill open">
                        <span className="ironstock-status-dot" />
                        Painel disponível
                    </span>
                    <button
                        className="ironstock-button secondary"
                        type="button"
                        onClick={comercioSelecionado
                            ? () => carregarProdutos(comercioSelecionado)
                            : carregarComercios}
                        disabled={carregando}
                    >
                        Atualizar dados
                    </button>
                </div>
            </header>

            <section className="ironstock-summary">
                <div className="ironstock-summary-card">
                    <span className="ironstock-summary-label">Lojas disponíveis</span>
                    <strong>{comercios.length}</strong>
                    <small>Lojas com limite diário pendente</small>
                </div>
                <div className="ironstock-summary-card">
                    <span className="ironstock-summary-label">Produtos na lista</span>
                    <strong>{produtos.length}</strong>
                    <small>
                        {comercioSelecionado
                            ? `Loja: ${comercioSelecionado.loja}`
                            : "Selecione uma loja para ver os produtos"}
                    </small>
                </div>
                <div className="ironstock-summary-card">
                    <span className="ironstock-summary-label">Janela de trabalho</span>
                    <strong>17h–22h</strong>
                    <small>Segunda, quarta e sexta</small>
                </div>
            </section>

            {erro && (
                <div className="ironstock-alert error" role="alert">
                    <span>{erro}</span>
                    <button type="button" onClick={() => setErro("")}>×</button>
                </div>
            )}

            {sucesso && (
                <div className="ironstock-alert success" role="status">
                    <span>{sucesso}</span>
                    <button type="button" onClick={() => setSucesso("")}>×</button>
                </div>
            )}

            {!comercioSelecionado && (
                <section className="ironstock-section">
                    <div className="ironstock-section-heading">
                        <div>
                            <h2>Selecione uma loja</h2>
                            <p>
                                Só aparecem lojas que ainda possuem produtos
                                dentro do limite diário de processamento.
                            </p>
                        </div>
                        <span className="ironstock-count">
                            {comercios.length} disponível(is)
                        </span>
                    </div>

                    {carregando ? (
                        <div className="ironstock-inline-loading">
                            <span className="ironstock-spinner" />
                            Carregando lojas...
                        </div>
                    ) : comercios.length === 0 ? (
                        <div className="ironstock-empty">
                            <h3>Nenhuma loja pendente</h3>
                            <p>
                                Todas as lojas atingiram o limite diário ou
                                não possuem produtos aguardando processamento.
                            </p>
                        </div>
                    ) : (
                        <div className="ironstock-store-grid">
                            {comercios.map((comercio) => {
                                const limite = Number(comercio.ironstock_limite || 0);
                                const concluidos = Number(
                                    comercio.concluidos_hoje || 0
                                );
                                const restantes = Math.max(0, limite - concluidos);
                                const progresso = limite > 0
                                    ? Math.min(100, (concluidos / limite) * 100)
                                    : 100;

                                return (
                                    <article
                                        className="ironstock-store-card"
                                        key={comercio.id}
                                    >
                                        <div className="ironstock-store-image">
                                            {comercio.imagem ? (
                                                <img
                                                    src={comercio.imagem}
                                                    alt={`Logo de ${comercio.loja || "loja"}`}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="ironstock-store-placeholder">
                                                    {String(comercio.loja || "L")
                                                        .slice(0, 1)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="ironstock-store-content">
                                            <h3>{comercio.loja || `Loja ${comercio.id}`}</h3>
                                            <p className="ironstock-store-cnpj">
                                                CNPJ: {comercio.cnpj || "Não informado"}
                                            </p>

                                            <div className="ironstock-progress-info">
                                                <span>Progresso diário</span>
                                                <strong>
                                                    {concluidos} / {limite}
                                                </strong>
                                            </div>

                                            <div
                                                className="ironstock-progress-track"
                                                aria-label={`${concluidos} de ${limite} produtos concluídos`}
                                            >
                                                <span style={{ width: `${progresso}%` }} />
                                            </div>

                                            <div className="ironstock-store-footer">
                                                <span>
                                                    {restantes} restante(s) hoje
                                                </span>
                                                <button
                                                    type="button"
                                                    className="ironstock-button primary"
                                                    onClick={() => carregarProdutos(comercio)}
                                                >
                                                    Abrir loja
                                                    <span aria-hidden="true">→</span>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {comercioSelecionado && !produtoSelecionado && (
                <section className="ironstock-section">
                    <div className="ironstock-breadcrumb">
                        <button
                            type="button"
                            className="ironstock-link-button"
                            onClick={voltarParaLojas}
                        >
                            ← Todas as lojas
                        </button>
                        <span>/</span>
                        <strong>{comercioSelecionado.loja}</strong>
                    </div>

                    <div className="ironstock-section-heading">
                        <div>
                            <h2>Produtos aguardando processamento</h2>
                            <p>
                                Estes produtos estão marcados com
                                <code> ironstock = 1 </code>
                                para esta loja.
                            </p>
                        </div>
                        <span className="ironstock-count">
                            {produtos.length} produto(s)
                        </span>
                    </div>

                    <div className="ironstock-toolbar">
                        <label className="ironstock-search">
                            <span aria-hidden="true">⌕</span>
                            <input
                                type="search"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar por nome ou ID..."
                            />
                        </label>
                    </div>

                    {carregando ? (
                        <div className="ironstock-inline-loading">
                            <span className="ironstock-spinner" />
                            Carregando produtos...
                        </div>
                    ) : produtosFiltrados.length === 0 ? (
                        <div className="ironstock-empty">
                            <h3>Nenhum produto encontrado</h3>
                            <p>
                                Não há produtos pendentes para esta busca nesta loja.
                            </p>
                        </div>
                    ) : (
                        <div className="ironstock-product-list">
                            {produtosFiltrados.map((produto) => {
                                const imagens = normalizarImagens(produto.imagem_url);

                                return (
                                    <article
                                        className="ironstock-product-row"
                                        key={produto.id}
                                    >
                                        <div className="ironstock-product-thumb">
                                            {imagens[0] ? (
                                                <img
                                                    src={imagens[0]}
                                                    alt={produto.nome || "Produto"}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="ironstock-no-image">
                                                    Sem imagem
                                                </div>
                                            )}
                                        </div>

                                        <div className="ironstock-product-info">
                                            <span className="ironstock-product-id">
                                                PRODUTO #{produto.id}
                                            </span>
                                            <h3>{produto.nome || "Produto sem nome"}</h3>
                                            <p>
                                                {imagens.length} imagem(ns)
                                                {" · "}
                                                {produto.descricao_ironstock
                                                    ? "Possui instruções adicionais"
                                                    : "Sem instruções adicionais"}
                                            </p>
                                        </div>

                                        <div className="ironstock-product-actions">
                                            <button
                                                type="button"
                                                className="ironstock-button secondary"
                                                onClick={() => baixarPDF(produto)}
                                            >
                                                Baixar PDF
                                            </button>
                                            <button
                                                type="button"
                                                className="ironstock-button primary"
                                                onClick={() => abrirProduto(produto)}
                                            >
                                                Processar produto
                                                <span aria-hidden="true">→</span>
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {produtoSelecionado && (
                <section className="ironstock-section ironstock-workspace">
                    <div className="ironstock-breadcrumb">
                        <button
                            type="button"
                            className="ironstock-link-button"
                            onClick={voltarParaLojas}
                        >
                            Lojas
                        </button>
                        <span>/</span>
                        <button
                            type="button"
                            className="ironstock-link-button"
                            onClick={voltarParaProdutos}
                        >
                            {comercioSelecionado?.loja}
                        </button>
                        <span>/</span>
                        <strong>Produto #{produtoSelecionado.id}</strong>
                    </div>

                    <div className="ironstock-section-heading">
                        <div>
                            <h2>Processar produto</h2>
                            <p>
                                Baixe o PDF, envie para a IA e cole aqui o JSON
                                retornado. Revise tudo antes de salvar.
                            </p>
                        </div>
                        <span className="ironstock-count">
                            ID #{produtoSelecionado.id}
                        </span>
                    </div>

                    <div className="ironstock-workflow">
                        <div className="ironstock-workflow-step active">
                            <span>1</span>
                            <div>
                                <strong>Baixar PDF</strong>
                                <small>Dados e imagens de origem</small>
                            </div>
                        </div>
                        <div className="ironstock-workflow-line" />
                        <div className={`ironstock-workflow-step ${produtoEditavel ? "active" : ""}`}>
                            <span>2</span>
                            <div>
                                <strong>Importar JSON</strong>
                                <small>Resposta da inteligência artificial</small>
                            </div>
                        </div>
                        <div className="ironstock-workflow-line" />
                        <div className="ironstock-workflow-step">
                            <span>3</span>
                            <div>
                                <strong>Revisar e salvar</strong>
                                <small>Atualização da IronStore</small>
                            </div>
                        </div>
                    </div>

                    <div className="ironstock-source-card">
                        <div className="ironstock-source-heading">
                            <div>
                                <span className="ironstock-eyebrow">PRODUTO DE ORIGEM</span>
                                <h3>{produtoSelecionado.nome || "Produto sem nome"}</h3>
                                <p>
                                    Loja: {comercioSelecionado?.loja}
                                    {" · "}ID: {produtoSelecionado.id}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ironstock-button primary"
                                onClick={() => baixarPDF(produtoSelecionado)}
                            >
                                Baixar PDF para IA
                            </button>
                        </div>

                        {produtoSelecionado.descricao_ironstock && (
                            <div className="ironstock-source-description">
                                <strong>Instruções adicionais</strong>
                                <p>{produtoSelecionado.descricao_ironstock}</p>
                            </div>
                        )}

                        <div className="ironstock-source-images">
                            {normalizarImagens(produtoSelecionado.imagem_url).map(
                                (imagem, indice) => (
                                    <a
                                        href={imagem}
                                        target="_blank"
                                        rel="noreferrer"
                                        key={`${imagem}-${indice}`}
                                        title="Abrir imagem em nova aba"
                                    >
                                        <img src={imagem} alt={`Imagem ${indice + 1}`} />
                                    </a>
                                )
                            )}
                        </div>
                    </div>

                    <div className="ironstock-json-panel">
                        <div className="ironstock-panel-heading">
                            <div>
                                <h3>Resposta da IA (JSON)</h3>
                                <p>
                                    Cole o JSON completo. Ele será convertido em
                                    campos editáveis.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ironstock-button secondary"
                                onClick={() => setJsonIA(PROMPT_IA)}
                            >
                                Inserir prompt de referência
                            </button>
                        </div>

                        <textarea
                            className="ironstock-json-textarea"
                            value={jsonIA}
                            onChange={(e) => setJsonIA(e.target.value)}
                            onClick={async (e) => {
                                if (jsonIA.trim()) return;

                                try {
                                    const texto = await navigator.clipboard.readText();

                                    if (texto.trim()) {
                                        setJsonIA(texto);
                                    } else {
                                        e.currentTarget.focus();
                                    }
                                } catch {
                                    e.currentTarget.focus();
                                }
                            }}
                            placeholder={'Cole aqui o JSON retornado pela IA...\n\n{\n  "nome": "...",\n  "categoria": "...",\n  "variedades": []\n}'}
                            rows={12}
                            spellCheck={false}
                        />

                        <div className="ironstock-json-actions">
                            <span>
                                {jsonIA.length.toLocaleString("pt-BR")} caracteres
                            </span>
                            <button
                                type="button"
                                className="ironstock-button primary"
                                onClick={importarJSON}
                            >
                                Importar e editar campos
                            </button>
                        </div>
                    </div>

                    {produtoEditavel && (
                        <form className="ironstock-editor" onSubmit={salvarProduto}>
                            <input
                                ref={inputImagensRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                multiple
                                hidden
                                onChange={enviarImagensSelecionadas}
                            />

                            {erroUploadImagem && (
                                <div className="ironstock-alert error">
                                    {erroUploadImagem}
                                </div>
                            )}

                            {enviandoImagens && (
                                <div className="ironstock-inline-loading">
                                    <span className="ironstock-spinner" />
                                    Enviando imagem(ns) para o servidor...
                                </div>
                            )}
                            <div className="ironstock-editor-heading">
                                <div>
                                    <span className="ironstock-eyebrow">
                                        REVISÃO MANUAL
                                    </span>
                                    <h2>Dados para a IronStore</h2>
                                    <p>
                                        Confira as informações. Os campos com
                                        valores desconhecidos precisam ser preenchidos
                                        antes de salvar.
                                    </p>
                                </div>
                                <span className="ironstock-pill review">
                                    Editável
                                </span>
                            </div>

                            <div className="ironstock-form-grid">
                                {CAMPOS.map((campo) => (
                                    <label
                                        className="ironstock-field"
                                        key={campo.key}
                                    >
                                        <span>
                                            {campo.label}
                                            {campo.required && <b> *</b>}
                                        </span>

                                        {campo.type === "select" ? (
                                            <select
                                                value={produtoEditavel[campo.key]}
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        campo.key,
                                                        e.target.value
                                                    )
                                                }
                                                required={campo.required}
                                            >
                                                {campo.options.map((opcao) => (
                                                    <option
                                                        value={opcao.value}
                                                        key={opcao.value}
                                                    >
                                                        {opcao.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={campo.type || "text"}
                                                value={produtoEditavel[campo.key] ?? ""}
                                                onChange={(e) =>
                                                    atualizarCampo(
                                                        campo.key,
                                                        e.target.value
                                                    )
                                                }
                                                min={campo.type === "number" ? 0 : undefined}
                                                step={campo.type === "number" ? "any" : undefined}
                                                required={campo.required}
                                            />
                                        )}
                                    </label>
                                ))}
                            </div>

                            <div className="ironstock-form-section">
                                <h3>Descrição comercial</h3>
                                <label className="ironstock-field">
                                    <span>Descrição completa *</span>
                                    <textarea
                                        rows={5}
                                        value={produtoEditavel.descricao}
                                        onChange={(e) =>
                                            atualizarCampo("descricao", e.target.value)
                                        }
                                        required
                                    />
                                </label>
                                <label className="ironstock-field">
                                    <span>Descrição curta *</span>
                                    <textarea
                                        rows={2}
                                        value={produtoEditavel.descricao_curta}
                                        onChange={(e) =>
                                            atualizarCampo("descricao_curta", e.target.value)
                                        }
                                        required
                                    />
                                </label>
                            </div>

                            <div className="ironstock-form-section">
                                <div className="ironstock-panel-heading">
                                    <div>
                                        <h3>Imagens do produto</h3>
                                        <p>
                                            Informe URLs válidas. As imagens das
                                            variedades também serão incluídas nas
                                            imagens do produto principal.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="ironstock-button secondary"
                                        onClick={adicionarImagemProduto}
                                    >
                                        + Adicionar imagem
                                    </button>
                                    <button
                                        type="button"
                                        className="ironstock-button secondary"
                                        onClick={baixarPDFImagemProduto}
                                        disabled={
                                            !produtoEditavel.imagem_url.some(
                                                (imagem) => String(imagem || "").trim()
                                            )
                                        }
                                    >
                                        PDF para gerar imagem comercial
                                    </button>
                                    <button
                                        type="button"
                                        className="ironstock-button primary"
                                        onClick={() => selecionarImagemLocal("produto")}
                                        disabled={enviandoImagens}
                                    >
                                        {enviandoImagens
                                            ? "Enviando..."
                                            : "Selecionar imagem do computador"}
                                    </button>
                                </div>

                                {produtoEditavel.imagem_url.map((imagem, indice) => (
                                    <div
                                        className="ironstock-image-editor-row"
                                        key={`produto-imagem-${indice}`}
                                    >
                                        <span className="ironstock-image-index">
                                            {indice + 1}
                                        </span>
                                        <input
                                            type="url"
                                            value={imagem}
                                            onChange={(e) =>
                                                atualizarImagemProduto(
                                                    indice,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="https://..."
                                        />
                                        {imagem && (
                                            <img
                                                className="ironstock-image-preview"
                                                src={imagem}
                                                alt={`Prévia ${indice + 1}`}
                                            />
                                        )}
                                        <button
                                            type="button"
                                            className="ironstock-icon-button danger"
                                            onClick={() => removerImagemProduto(indice)}
                                            aria-label="Remover imagem"
                                            title="Remover imagem"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="ironstock-form-section">
                                <div className="ironstock-panel-heading">
                                    <div>
                                        <h3>Variedades do produto</h3>
                                        <p>
                                            Cada variedade precisa ter um nome e
                                            pelo menos uma imagem.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="ironstock-button secondary"
                                        onClick={adicionarVariedade}
                                    >
                                        + Adicionar variedade
                                    </button>
                                </div>

                                {produtoEditavel.variedades.length === 0 && (
                                    <div className="ironstock-inline-notice">
                                        Nenhuma variedade cadastrada. Adicione
                                        variedades apenas quando o produto realmente
                                        possuir modelos, cores ou tamanhos diferentes.
                                    </div>
                                )}

                                {produtoEditavel.variedades.map(
                                    (variedade, indiceVariedade) => (
                                        <article
                                            className="ironstock-variety-card"
                                            key={`variedade-${indiceVariedade}`}
                                        >
                                            <label className="ironstock-field">
                                                <span>Tipo de variedade *</span>
                                                <input
                                                    value={variedade.tipo_variedade || produtoEditavel.tipo_variedade || ""}
                                                    onChange={(e) =>
                                                        atualizarVariedade(
                                                            indiceVariedade,
                                                            "tipo_variedade",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    placeholder="Ex.: Cor, Tamanho, Voltagem"
                                                />
                                            </label>
                                            <div className="ironstock-variety-heading">
                                                <h4>Variedade {indiceVariedade + 1}</h4>
                                                <button
                                                    type="button"
                                                    className="ironstock-link-button danger-text"
                                                    onClick={() =>
                                                        removerVariedade(indiceVariedade)
                                                    }
                                                >
                                                    Remover variedade
                                                </button>
                                            </div>

                                            <div className="ironstock-form-grid">
                                                <label className="ironstock-field">
                                                    <span>Nome da variedade *</span>
                                                    <input
                                                        value={variedade.nome}
                                                        onChange={(e) =>
                                                            atualizarVariedade(
                                                                indiceVariedade,
                                                                "nome",
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                        placeholder="Ex.: Preto, tamanho M"
                                                    />
                                                </label>

                                                <label className="ironstock-field">
                                                    <span>Código de barras (opcional)</span>
                                                    <input
                                                        value={variedade.codigo_barras}
                                                        onChange={(e) =>
                                                            atualizarVariedade(
                                                                indiceVariedade,
                                                                "codigo_barras",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Código real, se disponível"
                                                    />
                                                </label>
                                            </div>

                                            <div className="ironstock-variety-images">
                                                <div className="ironstock-panel-heading">
                                                    <div>
                                                        <strong>Imagens desta variedade *</strong>
                                                        <p>
                                                            Use URLs de imagens que
                                                            correspondam a esta variedade.
                                                        </p>
                                                    </div>
                                                    <div className="ironstock-save-actions">


                                                        <button
                                                            type="button"
                                                            className="ironstock-button primary small"
                                                            onClick={() =>
                                                                selecionarImagemLocal("variedade", indiceVariedade)
                                                            }
                                                            disabled={enviandoImagens}
                                                        >
                                                            {enviandoImagens ? "Enviando..." : "Selecionar imagem"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="ironstock-button secondary small"
                                                            onClick={() =>
                                                                baixarPDFVariedade(variedade, indiceVariedade)
                                                            }
                                                            disabled={enviandoImagens || processando}
                                                        >
                                                            Baixar PDF para gerar imagem
                                                        </button>
                                                    </div>
                                                </div>

                                                {variedade.imagem_url.map(
                                                    (imagem, indiceImagem) => (
                                                        <div
                                                            className="ironstock-image-editor-row"
                                                            key={`var-${indiceVariedade}-img-${indiceImagem}`}
                                                        >
                                                            <input
                                                                type="url"
                                                                value={imagem}
                                                                onChange={(e) =>
                                                                    atualizarImagemVariedade(
                                                                        indiceVariedade,
                                                                        indiceImagem,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://..."
                                                            />
                                                            {imagem && (
                                                                <img
                                                                    className="ironstock-image-preview"
                                                                    src={imagem}
                                                                    alt={`Imagem da variedade ${indiceVariedade + 1}`}
                                                                />
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="ironstock-icon-button danger"
                                                                onClick={() =>
                                                                    removerImagemVariedade(
                                                                        indiceVariedade,
                                                                        indiceImagem
                                                                    )
                                                                }
                                                                aria-label="Remover imagem da variedade"
                                                                title="Remover imagem"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>

                            <div className="ironstock-save-footer">
                                <div>
                                    <strong>Pronto para publicar?</strong>
                                    <p>
                                        O backend deverá validar os dados, atualizar
                                        o produto e suas variedades, ativar na IronStore
                                        e registrar a conclusão do dia.
                                    </p>
                                </div>

                                <div className="ironstock-save-actions">
                                    <button
                                        type="button"
                                        className="ironstock-button secondary"
                                        onClick={voltarParaProdutos}
                                        disabled={processando || enviandoImagens}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="ironstock-button primary"
                                        disabled={processando}
                                    >
                                        {processando
                                            ? "Salvando produto..."
                                            : "Salvar e publicar na IronStore"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </section>
            )}
        </main>
    );
}
