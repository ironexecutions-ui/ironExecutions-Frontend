import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import { createPortal } from "react-dom";
import "./frete.css";
import { API_URL } from "../../../../config";

const API_PREFIX = "/ironstore/frete-avulso";
const CACHE_DESTINATARIOS_KEY = "ironstore_frete_avulso_destinatarios";
const CACHE_CHAVE_SOLICITACAO_KEY = "ironstore_frete_avulso_chave_solicitacao";

function normalizarTexto(valor) {
    return String(valor || "").trim().toLocaleLowerCase("pt-BR");
}
function normalizarNomeTransportadora(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

const TRANSPORTADORAS_BLOQUEADAS = [
    "standardjet",
    "standartdjet",
    "efacil",
    "totalexpress",
    "ecommerce",
    "expreso",
    "expressloggi"
];

function freteBloqueado(opcao) {
    const nome = normalizarNomeTransportadora(
        `${opcao.transportadora || ""} ${opcao.servico || ""} ${opcao.nome || ""} ${opcao.empresa || ""}`
    );

    return TRANSPORTADORAS_BLOQUEADAS.some(
        transportadora => nome.includes(transportadora)
    );
}
function lerDestinatariosCache() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CACHE_DESTINATARIOS_KEY) || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

const FORM_INICIAL = {
    origem: {
        nome: "",
        email: "",
        telefone: "",
        cpf_cnpj: "",
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "SP",
    },
    destino: {
        nome: "",
        email: "",
        telefone: "",
        cpf_cnpj: "",
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "SP",
    },
    volume: {
        peso: "1",
        altura: "10",
        largura: "15",
        comprimento: "20",
        valor_declarado: "1.00",
    },
    documento: {
        tipo_documento: "dce",
        chave_documento: "",
        inscricao_estadual: "",
        cnae: "",
    },
};

function obterToken(tokenProp) {
    if (tokenProp) return tokenProp;

    try {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("token_cliente") ||
            ""
        );
    } catch {
        return "";
    }
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function numeroProdutoFrete(valor) {
    const numero = Number(String(valor ?? "").replace(",", "."));
    return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

function primeiraImagemProdutoFrete(valor) {
    if (Array.isArray(valor)) {
        return String(valor[0] || "").trim();
    }

    return String(valor || "").split("|")[0].trim();
}

function mensagemErro(data, fallback) {
    const detalhe = data?.detail;

    if (typeof detalhe === "string") return detalhe;
    if (detalhe?.mensagem) return detalhe.mensagem;
    if (detalhe) return JSON.stringify(detalhe);

    return data?.mensagem || fallback;
}

function limparCep(valor) {
    return String(valor || "").replace(/\D/g, "").slice(0, 8);
}
function formatarCpfCnpj(valor) {
    const numeros = String(valor || "")
        .replace(/\D/g, "")
        .slice(0, 14);

    if (numeros.length <= 11) {
        return numeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1-$2");
    }

    return numeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}
function formatarData(valor) {
    if (!valor) return "Não informada";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return String(valor);
    }

    return data.toLocaleDateString("pt-BR");
}

function normalizarStatus(valor) {
    return String(valor || "pendente")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export default function Frete({ token: tokenProp }) {
    const [form, setForm] = useState(FORM_INICIAL);
    const [destinatariosCache, setDestinatariosCache] = useState(
        lerDestinatariosCache
    );

    // Produtos disponíveis para preencher automaticamente os dados do pacote.
    const [produtosFrete, setProdutosFrete] = useState([]);
    const [produtosSelecionadosFrete, setProdutosSelecionadosFrete] = useState([]);
    const [buscaProdutosFrete, setBuscaProdutosFrete] = useState("");
    const [carregandoProdutosFrete, setCarregandoProdutosFrete] = useState(false);
    const [erroProdutosFrete, setErroProdutosFrete] = useState("");

    // Cotação rápida: apenas CEPs e exibição dos preços, sem seleção de serviço.
    const [modalCotacaoAberto, setModalCotacaoAberto] = useState(false);
    const [cepDestinoCotacao, setCepDestinoCotacao] = useState("");
    const [opcoesCotacaoRapida, setOpcoesCotacaoRapida] = useState([]);
    const [carregandoCotacaoRapida, setCarregandoCotacaoRapida] = useState(false);
    const [erroCotacaoRapida, setErroCotacaoRapida] = useState("");
    const [avisoCotacaoRapida, setAvisoCotacaoRapida] = useState("");
    const [mostrarFormularioCompleto, setMostrarFormularioCompleto] = useState(false);

    const [opcoes, setOpcoes] = useState([]);
    const [servicoSelecionado, setServicoSelecionado] = useState(null);

    const [pagamento, setPagamento] = useState(null);
    const [resultado, setResultado] = useState(null);

    const [carregandoCotacao, setCarregandoCotacao] = useState(false);
    const [criandoPagamento, setCriandoPagamento] = useState(false);
    const [consultando, setConsultando] = useState(false);

    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");

    // Lista de fretes pagos
    const [fretesPagos, setFretesPagos] = useState([]);
    const [carregandoLista, setCarregandoLista] = useState(true);
    const [erroLista, setErroLista] = useState("");
    const [alertaPersonalizado, setAlertaPersonalizado] = useState(null);
    const [gerandoEtiquetaId, setGerandoEtiquetaId] = useState(null);
    // =========================================================
    // DADOS DO REMETENTE — COMÉRCIO AUTENTICADO
    // =========================================================

    const origemEditada = useRef(false);
    const chaveSolicitacaoRef = useRef(null);

    const gerarChaveSolicitacao = () => {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        // Compatibilidade com navegadores sem crypto.randomUUID.
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            (caractere) => {
                const numero = Math.floor(Math.random() * 16);
                const valor = caractere === "x"
                    ? numero
                    : (numero & 0x3) | 0x8;

                return valor.toString(16);
            }
        );
    };

    const criarNovaChaveSolicitacao = () => {
        const chave = gerarChaveSolicitacao();
        chaveSolicitacaoRef.current = chave;

        try {
            sessionStorage.setItem(
                CACHE_CHAVE_SOLICITACAO_KEY,
                chave
            );
        } catch (erroStorage) {
            console.warn(
                "[Frete Avulso] Não foi possível guardar a chave da solicitação na sessão:",
                erroStorage
            );
        }

        return chave;
    };

    const obterChaveSolicitacao = () => {
        if (chaveSolicitacaoRef.current) {
            return chaveSolicitacaoRef.current;
        }

        try {
            const chaveSalva = sessionStorage.getItem(
                CACHE_CHAVE_SOLICITACAO_KEY
            );

            if (chaveSalva) {
                chaveSolicitacaoRef.current = chaveSalva;
                return chaveSalva;
            }
        } catch (erroStorage) {
            console.warn(
                "[Frete Avulso] Não foi possível recuperar a chave da solicitação:",
                erroStorage
            );
        }

        return criarNovaChaveSolicitacao();
    };

    const [carregandoRemetente, setCarregandoRemetente] = useState(true);
    const [rastreamentoEditandoId, setRastreamentoEditandoId] =
        useState(null);

    const [codigoRastreioEditando, setCodigoRastreioEditando] =
        useState("");
    const [limiteFretesVisiveis, setLimiteFretesVisiveis] = useState(2);
    const [salvandoRastreamentoId, setSalvandoRastreamentoId] =
        useState(null);
    useEffect(() => {
        let ativo = true;

        async function carregarRemetente() {
            setCarregandoRemetente(true);

            try {
                const token = obterToken(tokenProp);

                if (!token) {
                    console.warn(
                        "[Frete Avulso] Token não encontrado para carregar o remetente."
                    );
                    return;
                }

                const baseURL = API_URL.replace(/\/+$/, "");

                // A rota /comercio/me retorna os dados do comércio autenticado.
                const resposta = await fetch(`${baseURL}/comercio/me`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    cache: "no-store"
                });

                const data = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    throw new Error(
                        data?.detail ||
                        `Não foi possível carregar o comércio (HTTP ${resposta.status}).`
                    );
                }

                if (!ativo || !data) return;

                // Não substitui os dados se o usuário já começou a editar
                // o endereço de coleta enquanto a requisição estava pendente.
                if (origemEditada.current) return;

                setForm((atual) => ({
                    ...atual,

                    origem: {
                        ...atual.origem,

                        nome: data.loja ?? atual.origem.nome,
                        email: data.email ?? atual.origem.email,
                        telefone: data.celular ?? atual.origem.telefone,
                        cpf_cnpj: data.cnpj ?? atual.origem.cpf_cnpj,

                        cep: data.cep != null
                            ? String(data.cep)
                            : atual.origem.cep,

                        rua: data.rua ?? atual.origem.rua,
                        numero: data.numero != null
                            ? String(data.numero)
                            : atual.origem.numero,

                        bairro: data.bairro ?? atual.origem.bairro,
                        cidade: data.cidade ?? atual.origem.cidade,

                        estado: data.estado
                            ? String(data.estado).toUpperCase()
                            : atual.origem.estado
                    }
                }));

                console.info(
                    "[Frete Avulso] Dados do remetente preenchidos com o cadastro do comércio."
                );
            } catch (erro) {
                console.error(
                    "[Frete Avulso] Erro ao carregar dados do remetente:",
                    erro
                );
            } finally {
                if (ativo) {
                    setCarregandoRemetente(false);
                }
            }
        }

        carregarRemetente();

        return () => {
            ativo = false;
        };
    }, [tokenProp]);

    // =========================================================
    // CARREGAR DADOS FISCAIS DO COMÉRCIO
    // GET /fiscal/comercio/
    // CNAE e Inscrição Estadual serão usados como valores iniciais
    // no documento do frete, sem sobrescrever o que o usuário editar.
    // =========================================================

    useEffect(() => {
        let ativo = true;

        async function carregarDadosFiscaisFrete() {
            const token = obterToken(tokenProp);

            if (!token) return;

            try {
                const baseURL = API_URL.replace(/\/+$/, "");
                const resposta = await fetch(`${baseURL}/fiscal/comercio/`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                const data = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    throw new Error(
                        data?.detail ||
                        `Não foi possível carregar os dados fiscais (HTTP ${resposta.status}).`
                    );
                }

                if (!ativo) return;

                const fiscal = data?.fiscal || {};

                setForm((atual) => ({
                    ...atual,
                    documento: {
                        ...atual.documento,
                        inscricao_estadual:
                            String(fiscal.inscricao_estadual ?? "").trim() ||
                            atual.documento.inscricao_estadual,
                        cnae:
                            String(fiscal.cnae ?? "").trim() ||
                            atual.documento.cnae,
                    },
                }));
            } catch (erroFiscal) {
                console.warn(
                    "[Frete Avulso] Não foi possível carregar CNAE e Inscrição Estadual:",
                    erroFiscal
                );
            }
        }

        carregarDadosFiscaisFrete();

        return () => {
            ativo = false;
        };
    }, [tokenProp]);

    // =========================================================
    // CARREGAR PRODUTOS DISPONÍVEIS DO COMÉRCIO
    // GET /admin/produtos-servicos/
    // =========================================================

    useEffect(() => {
        let ativo = true;

        async function carregarProdutosFrete() {
            const token = obterToken(tokenProp);

            if (!token) {
                setErroProdutosFrete("Faça login novamente para carregar seus produtos.");
                return;
            }

            setCarregandoProdutosFrete(true);
            setErroProdutosFrete("");

            try {
                const baseURL = API_URL.replace(/\/+$/, "");
                const resposta = await fetch(
                    `${baseURL}/admin/produtos-servicos/`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const data = await resposta.json().catch(() => []);

                if (!resposta.ok) {
                    const detalhe = data?.detail;
                    throw new Error(
                        typeof detalhe === "string"
                            ? detalhe
                            : "Não foi possível carregar os produtos do comércio."
                    );
                }

                if (!ativo) return;

                const lista = Array.isArray(data) ? data : [];
                setProdutosFrete(
                    lista
                        .filter((produto) => Number(produto.disponivel) === 1)
                        .map((produto) => ({
                            id: produto.id,
                            nome: String(produto.nome || "Produto sem nome"),
                            preco: numeroProdutoFrete(produto.preco),
                            imagem: primeiraImagemProdutoFrete(produto.imagem_url),
                            pesoKg: numeroProdutoFrete(produto.peso_g) / 1000,
                            altura: numeroProdutoFrete(produto.altura_cm),
                            largura: numeroProdutoFrete(produto.largura_cm),
                            comprimento: numeroProdutoFrete(produto.cumprimento_cm),
                        }))
                );
            } catch (e) {
                if (ativo) {
                    setErroProdutosFrete(
                        e.message || "Erro ao carregar os produtos."
                    );
                }
            } finally {
                if (ativo) setCarregandoProdutosFrete(false);
            }
        }

        carregarProdutosFrete();

        return () => {
            ativo = false;
        };
    }, [tokenProp]);

    // =========================================================
    // REQUISIÇÕES À API
    // =========================================================

    const requisicao = useCallback(
        async (caminho, opcoes = {}) => {
            const token = obterToken(tokenProp);

            const url = `${API_URL.replace(/\/$/, "")}${API_PREFIX}${caminho}`;

            const headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(opcoes.headers || {}),
            };

            console.info("[Frete Avulso] Requisição iniciada", {
                method: opcoes.method || "GET",
                url,
                tokenPresente: Boolean(token),
            });

            let resposta;

            try {
                resposta = await fetch(url, {
                    ...opcoes,
                    headers,
                    cache: "no-store",
                });
            } catch (erroRede) {
                console.error(
                    "[Frete Avulso] Falha de rede/CORS:",
                    { url, erro: erroRede }
                );

                throw new Error(
                    `Falha de rede ao acessar ${url}. Verifique o Nginx, o FastAPI e o CORS. Detalhe: ${erroRede?.message || erroRede
                    }`
                );
            }

            const textoResposta = await resposta.text();

            let data = {};

            try {
                data = textoResposta ? JSON.parse(textoResposta) : {};
            } catch {
                data = {
                    resposta_texto: textoResposta.slice(0, 1200),
                };
            }

            console.info("[Frete Avulso] Resposta recebida", {
                url,
                status: resposta.status,
                ok: resposta.ok,
                resposta: data,
            });

            if (!resposta.ok) {
                const detalhe = mensagemErro(data, "");

                const detalheTexto =
                    typeof detalhe === "string"
                        ? detalhe
                        : JSON.stringify(detalhe);

                const mensagem =
                    detalheTexto ||
                    data?.resposta_texto ||
                    `O servidor respondeu HTTP ${resposta.status} sem uma mensagem de erro.`;

                throw new Error(
                    `HTTP ${resposta.status} em ${url}: ${mensagem}`
                );
            }

            if (
                data?.resposta_texto &&
                !Object.keys(data).some(
                    (chave) => chave !== "resposta_texto"
                )
            ) {
                throw new Error(
                    `A rota ${url} respondeu com conteúdo que não é JSON: ${data.resposta_texto.slice(
                        0,
                        300
                    )}`
                );
            }

            return data;
        },
        [tokenProp]
    );

    // =========================================================
    // LISTAR FRETES PAGOS
    // GET /ironstore/frete-avulso/lista
    // =========================================================


    const iniciarEdicaoRastreamento = (frete) => {
        setRastreamentoEditandoId(frete.id);
        setCodigoRastreioEditando(frete.codigo_rastreio || "");
        setErroLista("");
        setAviso("");
    };

    const cancelarEdicaoRastreamento = () => {
        setRastreamentoEditandoId(null);
        setCodigoRastreioEditando("");
    };

    const salvarRastreamento = async (freteId) => {
        const codigo = codigoRastreioEditando.trim();

        if (!codigo) {
            setErroLista("Informe o código de rastreamento.");
            return;
        }

        setSalvandoRastreamentoId(freteId);
        setErroLista("");
        setAviso("");

        try {
            await requisicao(`/${freteId}/rastreamento`, {
                method: "PATCH",
                body: JSON.stringify({
                    codigo_rastreio: codigo,
                }),
            });

            setFretesPagos((atuais) =>
                atuais.map((frete) =>
                    frete.id === freteId
                        ? { ...frete, codigo_rastreio: codigo }
                        : frete
                )
            );

            cancelarEdicaoRastreamento();

            setAviso(
                `Rastreamento do frete #${freteId} salvo com sucesso.`
            );
        } catch (e) {
            setErroLista(
                e.message || "Não foi possível salvar o rastreamento."
            );
        } finally {
            setSalvandoRastreamentoId(null);
        }
    };

    const carregarFretesPagos = useCallback(async () => {
        setCarregandoLista(true);
        setErroLista("");

        try {
            const data = await requisicao("/lista", {
                method: "GET",
            });

            setFretesPagos(
                Array.isArray(data.fretes) ? data.fretes : []
            );
        } catch (e) {
            console.error(
                "[Frete Avulso] Erro ao carregar fretes pagos:",
                e
            );

            setErroLista(
                e.message || "Não foi possível carregar os fretes pagos."
            );
        } finally {
            setCarregandoLista(false);
        }
    }, [requisicao]);


    useEffect(() => {
        carregarFretesPagos();
    }, [carregarFretesPagos]);

    // =========================================================
    // GERAR ETIQUETA MANUALMENTE
    // POST /ironstore/frete-avulso/{id}/tentar-etiqueta
    // =========================================================

    const gerarDocumentoFrete = async (freteId) => {
        if (gerandoEtiquetaId !== null) return;

        setGerandoEtiquetaId(freteId);
        setErroLista("");
        setAviso("");

        try {
            const data = await requisicao(
                `/${freteId}/tentar-etiqueta`,
                {
                    method: "POST",
                }
            );

            await carregarFretesPagos();

            if (data?.etiqueta_url) {
                window.open(
                    data.etiqueta_url,
                    "_blank",
                    "noopener,noreferrer"
                );
            } else if (data?.processando) {
                setAviso(
                    `A etiqueta do frete #${freteId} está sendo processada. Atualize a lista para consultar o resultado.`
                );
            } else if (data?.mensagem) {
                setAviso(data.mensagem);
            } else {
                setAviso(
                    `Solicitação de geração enviada para o frete #${freteId}. Confira o status na lista.`
                );
            }
        } catch (e) {
            console.error(
                "[Frete Avulso] Erro ao gerar documento:",
                e
            );

            const mensagemOriginal =
                e?.message || "Não foi possível gerar a etiqueta.";

            const saldoInsuficiente =
                /saldo/i.test(mensagemOriginal) &&
                /insuficiente/i.test(mensagemOriginal);

            const erro502 = /HTTP 502|502 Bad Gateway/i.test(
                mensagemOriginal
            );

            setErroLista("");

            setAlertaPersonalizado({
                tipo: saldoInsuficiente ? "saldo" : "erro",

                codigo: erro502 ? "#502" : "ATENÇÃO",

                titulo: saldoInsuficiente
                    ? "Saldo insuficiente no Melhor Envio"
                    : "Não foi possível concluir",

                mensagem: saldoInsuficiente
                    ? "A carteira do Melhor Envio não possui saldo suficiente para pagar esta etiqueta. Entre em contato com o suporte para receber ajuda."
                    : mensagemOriginal,
            });

            await carregarFretesPagos();
        } finally {
            setGerandoEtiquetaId(null);
        }
    };

    // =========================================================
    // FORMULÁRIO
    // =========================================================

    const atualizarCampo = (grupo, campo, valor) => {
        if (grupo === "origem") {
            origemEditada.current = true;
        }

        // Se o nome digitado corresponder exatamente a um destinatário salvo,
        // preenche os demais campos do endereço automaticamente.
        if (grupo === "destino" && campo === "nome") {
            const destinatarioEncontrado = destinatariosCache.find(
                (destinatario) =>
                    normalizarTexto(destinatario.nome) === normalizarTexto(valor)
            );

            if (destinatarioEncontrado) {
                setForm((atual) => ({
                    ...atual,
                    destino: {
                        ...atual.destino,
                        ...destinatarioEncontrado,
                        nome: valor,
                    },
                }));
                return;
            }
        }

        let valorAtualizado = valor;

        if (campo === "cep") {
            valorAtualizado = limparCep(valor);
        }

        if (campo === "cpf_cnpj") {
            valorAtualizado = formatarCpfCnpj(valor);
        }

        setForm((atual) => ({
            ...atual,
            [grupo]: {
                ...atual[grupo],
                [campo]: valorAtualizado
            }
        }));
    };

    const aplicarProdutosNoVolume = (selecionados) => {
        if (!selecionados.length) {
            setForm((atual) => ({
                ...atual,
                volume: {
                    ...atual.volume,
                    peso: "1",
                    altura: "10",
                    largura: "15",
                    comprimento: "20",
                    valor_declarado: "1.00",
                },
            }));
            return;
        }

        const pesoTotal = selecionados.reduce(
            (total, item) => total + item.produto.pesoKg * item.quantidade,
            0
        );

        const valorTotal = selecionados.reduce(
            (total, item) => total + item.produto.preco * item.quantidade,
            0
        );

        // As maiores medidas são uma sugestão inicial. A embalagem final
        // deve ser conferida e pode ser ajustada manualmente pelo usuário.
        const altura = Math.max(
            ...selecionados.map((item) => item.produto.altura),
            0
        );
        const largura = Math.max(
            ...selecionados.map((item) => item.produto.largura),
            0
        );
        const comprimento = Math.max(
            ...selecionados.map((item) => item.produto.comprimento),
            0
        );

        setForm((atual) => ({
            ...atual,
            volume: {
                ...atual.volume,
                peso: pesoTotal > 0 ? pesoTotal.toFixed(3) : atual.volume.peso,
                altura: altura > 0 ? String(altura) : atual.volume.altura,
                largura: largura > 0 ? String(largura) : atual.volume.largura,
                comprimento: comprimento > 0
                    ? String(comprimento)
                    : atual.volume.comprimento,
                valor_declarado: valorTotal > 0
                    ? valorTotal.toFixed(2)
                    : atual.volume.valor_declarado,
            },
        }));
    };

    const alternarProdutoFrete = (produto) => {
        const jaSelecionado = produtosSelecionadosFrete.some(
            (item) => item.produto.id === produto.id
        );

        const novos = jaSelecionado
            ? produtosSelecionadosFrete.filter(
                (item) => item.produto.id !== produto.id
            )
            : [...produtosSelecionadosFrete, { produto, quantidade: 1 }];

        setProdutosSelecionadosFrete(novos);
        aplicarProdutosNoVolume(novos);
    };

    const alterarQuantidadeProdutoFrete = (produtoId, quantidadeInformada) => {
        const quantidade = Math.max(
            1,
            Math.min(999, Number.parseInt(quantidadeInformada, 10) || 1)
        );

        const novos = produtosSelecionadosFrete.map((item) =>
            item.produto.id === produtoId
                ? { ...item, quantidade }
                : item
        );

        setProdutosSelecionadosFrete(novos);
        aplicarProdutosNoVolume(novos);
    };

    const produtosFreteFiltrados = produtosFrete.filter((produto) =>
        normalizarTexto(produto.nome).includes(
            normalizarTexto(buscaProdutosFrete)
        )
    );

    const renderSeletorProdutosFrete = (origemSeletor) => (
        <section
            className={`isfa-produtos-frete isfa-produtos-frete--${origemSeletor}`}
            aria-label="Selecionar produtos para o frete"
        >
            <div className="isfa-produtos-frete__cabecalho">
                <div>
                    <span className="isfa-produtos-frete__eyebrow">
                        PREENCHIMENTO AUTOMÁTICO
                    </span>
                    <h3>Adicionar produtos da loja</h3>
                    <p>
                        Selecione os produtos que farão parte deste envio.
                    </p>
                </div>
                <span className="isfa-produtos-frete__contador">
                    {produtosSelecionadosFrete.length} selecionado(s)
                </span>
            </div>

            <label className="isfa-produtos-frete__busca">
                <span aria-hidden="true">⌕</span>
                <input
                    type="search"
                    value={buscaProdutosFrete}
                    onChange={(evento) => setBuscaProdutosFrete(evento.target.value)}
                    placeholder="Buscar produto pelo nome..."
                    aria-label="Buscar produto"
                />
            </label>

            {carregandoProdutosFrete ? (
                <p className="isfa-produtos-frete__estado">
                    Carregando produtos disponíveis...
                </p>
            ) : erroProdutosFrete ? (
                <p className="isfa-produtos-frete__erro" role="alert">
                    {erroProdutosFrete}
                </p>
            ) : produtosFreteFiltrados.length ? (
                <div className="isfa-produtos-frete__lista">
                    {produtosFreteFiltrados.map((produto) => {
                        const selecionado = produtosSelecionadosFrete.some(
                            (item) => item.produto.id === produto.id
                        );

                        return (
                            <button
                                type="button"
                                key={produto.id}
                                className={`isfa-produtos-frete__produto ${selecionado
                                    ? "isfa-produtos-frete__produto--selecionado"
                                    : ""
                                    }`}
                                onClick={() => alternarProdutoFrete(produto)}
                                aria-pressed={selecionado}
                            >
                                <span className="isfa-produtos-frete__foto">
                                    {produto.imagem ? (
                                        <img
                                            src={produto.imagem}
                                            alt=""
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span aria-hidden="true">□</span>
                                    )}
                                </span>
                                <span className="isfa-produtos-frete__produto-info">
                                    <strong>{produto.nome}</strong>
                                    <span>{formatarMoeda(produto.preco)}</span>
                                </span>
                                <span className="isfa-produtos-frete__selecao" aria-hidden="true">
                                    {selecionado ? "✓" : "+"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <p className="isfa-produtos-frete__estado">
                    {produtosFrete.length
                        ? "Nenhum produto encontrado para essa busca."
                        : "Não há produtos disponíveis na loja. Ative os produtos para utilizá-los aqui."}
                </p>
            )}

            {produtosSelecionadosFrete.length > 0 && (
                <div className="isfa-produtos-frete__selecionados">
                    <div className="isfa-produtos-frete__selecionados-titulo">
                        <strong>Produtos neste envio</strong>
                        <button
                            type="button"
                            onClick={() => {
                                setProdutosSelecionadosFrete([]);
                            }}
                        >
                            Limpar seleção
                        </button>
                    </div>

                    {produtosSelecionadosFrete.map((item) => (
                        <div
                            className="isfa-produtos-frete__item"
                            key={item.produto.id}
                        >
                            <span>{item.produto.nome}</span>
                            <label>
                                <span>Qtd.</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    value={item.quantidade}
                                    onChange={(evento) =>
                                        alterarQuantidadeProdutoFrete(
                                            item.produto.id,
                                            evento.target.value
                                        )
                                    }
                                />
                            </label>
                            <strong>
                                {formatarMoeda(
                                    item.produto.preco * item.quantidade
                                )}
                            </strong>
                            <button
                                type="button"
                                aria-label={`Remover ${item.produto.nome}`}
                                onClick={() => alternarProdutoFrete(item.produto)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="isfa-produtos-frete__nota">
                O peso e o valor declarado são somados automaticamente.
                As dimensões recebem as maiores medidas dos produtos e devem
                ser ajustadas para corresponder à embalagem real.
            </p>
        </section>
    );

    const salvarDestinatarioCache = () => {
        const destino = {
            nome: String(form.destino.nome || "").trim(),
            email: String(form.destino.email || "").trim(),
            telefone: String(form.destino.telefone || "").trim(),
            cpf_cnpj: String(form.destino.cpf_cnpj || "").trim(),
            cep: String(form.destino.cep || "").trim(),
            rua: String(form.destino.rua || "").trim(),
            numero: String(form.destino.numero || "").trim(),
            complemento: String(form.destino.complemento || "").trim(),
            bairro: String(form.destino.bairro || "").trim(),
            cidade: String(form.destino.cidade || "").trim(),
            estado: String(form.destino.estado || "").trim().toUpperCase(),
        };

        if (!destino.nome) return;

        const documentoAtual = destino.cpf_cnpj.replace(/\D/g, "");
        const atualizados = [
            ...destinatariosCache.filter((existente) => {
                const documentoExistente = String(
                    existente.cpf_cnpj || ""
                ).replace(/\D/g, "");

                // CPF/CNPJ é o identificador preferencial. Se não houver
                // documento, usa o nome para evitar duplicatas.
                if (documentoAtual && documentoExistente) {
                    return documentoAtual !== documentoExistente;
                }

                return (
                    normalizarTexto(existente.nome) !==
                    normalizarTexto(destino.nome)
                );
            }),
            destino,
        ];

        try {
            localStorage.setItem(
                CACHE_DESTINATARIOS_KEY,
                JSON.stringify(atualizados)
            );
            setDestinatariosCache(atualizados);
        } catch (erroCache) {
            console.warn(
                "[Frete Avulso] Não foi possível salvar os destinatários no cache:",
                erroCache
            );
        }
    };

    const validarFormulario = () => {
        const obrigatoriosEndereco = [
            ["nome", "nome"],
            ["email", "e-mail"],
            ["telefone", "telefone"],
            ["cpf_cnpj", "CPF/CNPJ"],
            ["cep", "CEP"],
            ["rua", "rua/avenida"],
            ["numero", "número"],
            ["bairro", "bairro"],
            ["cidade", "cidade"],
            ["estado", "UF"],
        ];

        for (const grupo of ["origem", "destino"]) {
            const rotuloGrupo =
                grupo === "origem" ? "remetente" : "destinatário";

            for (const [campo, rotulo] of obrigatoriosEndereco) {
                if (!String(form[grupo][campo] || "").trim()) {
                    return `Preencha ${rotulo} do ${rotuloGrupo}.`;
                }
            }

            if (limparCep(form[grupo].cep).length !== 8) {
                return `O CEP do ${rotuloGrupo} deve ter 8 dígitos.`;
            }

            const documento = String(
                form[grupo].cpf_cnpj || ""
            ).replace(/\D/g, "");

            if (![11, 14].includes(documento.length)) {
                return `Informe um CPF ou CNPJ válido para o ${rotuloGrupo}.`;
            }
        }

        const peso = Number(form.volume.peso);
        const altura = Number(form.volume.altura);
        const largura = Number(form.volume.largura);
        const comprimento = Number(form.volume.comprimento);

        const declarado = Number(
            String(form.volume.valor_declarado).replace(",", ".")
        );

        if (
            ![
                peso,
                altura,
                largura,
                comprimento,
                declarado,
            ].every(Number.isFinite)
        ) {
            return "Revise peso, dimensões e valor declarado.";
        }

        if (
            peso <= 0 ||
            altura <= 0 ||
            largura <= 0 ||
            comprimento <= 0 ||
            declarado <= 0
        ) {
            return "Peso, dimensões e valor declarado precisam ser maiores que zero.";
        }

        if (
            form.documento.tipo_documento === "nota_fiscal" &&
            form.documento.chave_documento.replace(/\D/g, "").length !== 44
        ) {
            return "A chave da Nota Fiscal deve conter 44 dígitos.";
        }

        return "";
    };

    const montarPayload = () => ({
        origem: {
            ...form.origem,
            cep: limparCep(form.origem.cep),
            cpf_cnpj: form.origem.cpf_cnpj.replace(/\D/g, ""),
        },
        destino: {
            ...form.destino,
            cep: limparCep(form.destino.cep),
            cpf_cnpj: form.destino.cpf_cnpj.replace(/\D/g, ""),
        },
        volume: {
            peso: Number(form.volume.peso),
            altura: Number(form.volume.altura),
            largura: Number(form.volume.largura),
            comprimento: Number(form.volume.comprimento),
            valor_declarado: Number(
                String(form.volume.valor_declarado).replace(",", ".")
            ),
        },
        documento: {
            ...form.documento,
            chave_documento: form.documento.chave_documento.replace(
                /\D/g,
                ""
            ),
        },
    });

    // =========================================================
    // COTAÇÃO RÁPIDA POR CEP, SOMENTE PARA VISUALIZAR PREÇOS
    // =========================================================

    const abrirModalCotacao = () => {
        setErroCotacaoRapida("");
        setAvisoCotacaoRapida("");
        setOpcoesCotacaoRapida([]);
        setModalCotacaoAberto(true);
    };

    const fecharModalCotacao = () => {
        if (carregandoCotacaoRapida) return;
        setModalCotacaoAberto(false);
    };

    useEffect(() => {
        if (!modalCotacaoAberto) return undefined;

        const tratarTecla = (evento) => {
            if (evento.key === "Escape" && !carregandoCotacaoRapida) {
                setModalCotacaoAberto(false);
            }
        };

        window.addEventListener("keydown", tratarTecla);
        return () => window.removeEventListener("keydown", tratarTecla);
    }, [modalCotacaoAberto, carregandoCotacaoRapida]);

    const montarEnderecoSomenteCotacao = (endereco, cep) => {
        const documento = String(endereco?.cpf_cnpj || "").replace(/\D/g, "");
        const estado = String(endereco?.estado || "SP").trim().toUpperCase();

        // A rota atual do backend exige campos completos no schema mesmo que
        // o endpoint de cálculo utilize somente os CEPs e as dimensões.
        // Estes valores de contingência são usados apenas na cotação, nunca
        // são salvos como dados de remetente/destinatário nem usados na etiqueta.
        return {
            nome: String(endereco?.nome || "Consulta de frete"),
            email: String(endereco?.email || "cotacao@ironexecutions.com.br"),
            telefone: String(endereco?.telefone || "11999999999").replace(/\D/g, "") || "11999999999",
            cpf_cnpj: [11, 14].includes(documento.length) ? documento : "00000000000",
            cep: limparCep(cep),
            rua: String(endereco?.rua || "Endereço informado para cotação"),
            numero: String(endereco?.numero || "S/N"),
            complemento: String(endereco?.complemento || ""),
            bairro: String(endereco?.bairro || "Centro"),
            cidade: String(endereco?.cidade || "São Paulo"),
            estado: /^[A-Z]{2}$/.test(estado) ? estado : "SP",
        };
    };

    const consultarCotacaoRapida = async (evento) => {
        evento.preventDefault();
        setErroCotacaoRapida("");
        setAvisoCotacaoRapida("");
        setOpcoesCotacaoRapida([]);

        const cepOrigem = limparCep(form.origem.cep);
        const cepDestino = limparCep(cepDestinoCotacao);

        if (cepOrigem.length !== 8) {
            setErroCotacaoRapida("O CEP da loja ainda não está disponível. Confira o endereço cadastrado no comércio e tente novamente.");
            return;
        }

        if (cepDestino.length !== 8) {
            setErroCotacaoRapida("Informe um CEP de destino válido com 8 dígitos.");
            return;
        }

        setCarregandoCotacaoRapida(true);

        try {
            const payloadRapido = {
                origem: montarEnderecoSomenteCotacao(form.origem, cepOrigem),
                destino: montarEnderecoSomenteCotacao({}, cepDestino),
                volume: {
                    peso: Number(form.volume.peso) > 0 ? Number(form.volume.peso) : 1,
                    altura: Number(form.volume.altura) > 0 ? Number(form.volume.altura) : 10,
                    largura: Number(form.volume.largura) > 0 ? Number(form.volume.largura) : 15,
                    comprimento: Number(form.volume.comprimento) > 0 ? Number(form.volume.comprimento) : 20,
                    valor_declarado: Number(String(form.volume.valor_declarado || "1").replace(",", ".")) > 0
                        ? Number(String(form.volume.valor_declarado || "1").replace(",", "."))
                        : 1,
                },
                documento: {
                    tipo_documento: "dce",
                    chave_documento: "",
                    inscricao_estadual: form.documento.inscricao_estadual || "",
                    cnae: form.documento.cnae || "",
                },
            };

            const data = await requisicao("/cotacao", {
                method: "POST",
                body: JSON.stringify(payloadRapido),
            });

            const resultados = Array.isArray(data?.opcoes) ? data.opcoes : [];
            setOpcoesCotacaoRapida(resultados);

            if (!resultados.length) {
                setAvisoCotacaoRapida("Não encontramos fretes disponíveis para esse trajeto.");
            }
        } catch (e) {
            setErroCotacaoRapida(e?.message || "Não foi possível consultar os fretes disponíveis.");
        } finally {
            setCarregandoCotacaoRapida(false);
        }
    };

    // =========================================================
    // CALCULAR COTAÇÃO COMPLETA PARA PAGAMENTO E ETIQUETA
    // =========================================================

    const calcularFrete = async (evento) => {
        evento.preventDefault();

        setErro("");
        setAviso("");
        setPagamento(null);
        setResultado(null);
        setServicoSelecionado(null);
        setOpcoes([]);

        const validacao = validarFormulario();

        if (validacao) {
            setErro(validacao);
            return;
        }

        // Cada nova cotação completa inicia uma nova solicitação de frete.
        // A mesma chave será reutilizada nas tentativas de pagamento e na
        // confirmação de saldo, evitando registros ou cobranças duplicadas.
        criarNovaChaveSolicitacao();

        // Salva os dados do destino antes da cotação. Assim, os dados ficam
        // disponíveis mesmo se a API de frete apresentar uma falha.
        salvarDestinatarioCache();

        setCarregandoCotacao(true);

        try {
            const data = await requisicao("/cotacao", {
                method: "POST",
                body: JSON.stringify(montarPayload()),
            });

            setOpcoes(
                Array.isArray(data.opcoes) ? data.opcoes : []
            );

            if (!data.opcoes?.length) {
                setAviso(
                    "O Melhor Envio não retornou serviços para esse trajeto e volume."
                );
            }
        } catch (e) {
            setErro(e.message || "Falha ao calcular o frete.");
        } finally {
            setCarregandoCotacao(false);
        }
    };

    // =========================================================
    // CRIAR PAGAMENTO PIX
    // =========================================================

    const criarPagamento = async () => {
        if (!servicoSelecionado) {
            setErro("Selecione uma modalidade de entrega primeiro.");
            return;
        }

        setErro("");
        setAviso("");
        setCriandoPagamento(true);

        try {
            // O cliente paga sempre o PIX da Iron Executions.
            // O saldo da carteira Melhor Envio é responsabilidade da operação.
            const data = await requisicao("/pix-inteligente", {
                method: "POST",
                body: JSON.stringify({
                    ...montarPayload(),
                    servico_id: String(servicoSelecionado.id),
                    chave_solicitacao: obterChaveSolicitacao(),
                }),
            });

            setPagamento({
                ...data,
                tipo_fluxo: "pix_cliente",
            });
            setResultado(null);
            setOpcoes([]);
            setAviso(
                "PIX do frete criado. Após a confirmação do pagamento pelo Mercado Pago, o frete será liberado para geração da etiqueta."
            );
        } catch (e) {
            setErro(e.message || "Não foi possível criar o PIX.");
        } finally {
            setCriandoPagamento(false);
        }
    };

    // =========================================================
    // CONSULTAR STATUS DO PAGAMENTO
    // =========================================================

    const consultarPagamento = useCallback(async () => {
        const freteId = pagamento?.frete_id;

        if (
            !freteId ||
            resultado?.status_pagamento === "approved"
        ) {
            return;
        }

        setConsultando(true);

        try {
            const data = await requisicao(
                `/pagamento/${freteId}/status`,
                {
                    method: "GET",
                }
            );

            setResultado(data);

            if (data.status_pagamento === "approved") {
                setAviso(
                    "Pagamento confirmado. O frete está disponível na lista de fretes pagos. A geração da etiqueta deve ser iniciada separadamente."
                );

                await carregarFretesPagos();
            } else {
                setAviso(
                    "Aguardando confirmação do pagamento pelo Mercado Pago."
                );
            }
        } catch (e) {
            setErro(
                e.message || "Não foi possível consultar o pagamento."
            );
        } finally {
            setConsultando(false);
        }
    }, [
        pagamento?.frete_id,
        pagamento?.tipo_fluxo,
        resultado?.status_pagamento,
        requisicao,
        carregarFretesPagos,
    ]);

    useEffect(() => {
        if (
            !pagamento?.frete_id ||
            resultado?.status_pagamento === "approved"
        ) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            consultarPagamento();
        }, 5000);

        consultarPagamento();

        return () => window.clearInterval(timer);
    }, [
        pagamento?.frete_id,
        pagamento?.tipo_fluxo,
        resultado?.status_pagamento,
        consultarPagamento,
    ]);

    // =========================================================
    // COPIAR PIX
    // =========================================================

    const copiarPix = async () => {
        const codigo = pagamento?.qr_code;

        if (!codigo) return;

        try {
            await navigator.clipboard.writeText(codigo);
            setAviso("Código PIX do frete copiado.");
            setErro("");
        } catch {
            setErro(
                "Não foi possível copiar automaticamente. Selecione e copie o código PIX manualmente."
            );
        }
    };

    // =========================================================
    // REINICIAR FORMULÁRIO
    // =========================================================

    const reiniciar = () => {
        setOpcoes([]);
        setServicoSelecionado(null);
        setPagamento(null);
        setResultado(null);
        setErro("");
        setAviso("");

        // O próximo envio precisa receber uma nova chave de idempotência.
        chaveSolicitacaoRef.current = null;

        try {
            sessionStorage.removeItem(CACHE_CHAVE_SOLICITACAO_KEY);
        } catch (erroStorage) {
            console.warn(
                "[Frete Avulso] Não foi possível limpar a chave da solicitação:",
                erroStorage
            );
        }
    };

    const avancarInputDestino = (e) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const formulario = e.currentTarget.form;
        if (!formulario) return;

        const campos = Array.from(
            formulario.querySelectorAll(
                "input:not([type='hidden']):not(:disabled), select:not(:disabled), textarea:not(:disabled)"
            )
        ).filter((campo) => campo.offsetParent !== null);

        const indiceAtual = campos.indexOf(e.currentTarget);

        if (indiceAtual !== -1 && indiceAtual < campos.length - 1) {
            campos[indiceAtual + 1].focus();
        }
    };

    // =========================================================
    // ENDEREÇOS
    // =========================================================

    const renderEndereco = (grupo, titulo) => (
        <section className="isfa-card" key={grupo}>
            <div className="isfa-card__heading">
                <span className="isfa-card__step">
                    {grupo === "origem" ? "01" : "02"}
                </span>

                <div>
                    <h2>{titulo}</h2>
                    <p>
                        {grupo === "origem"
                            ? "Endereço de coleta / remetente"
                            : "Endereço de entrega / destinatário"}
                    </p>
                </div>
            </div>

            <div className="isfa-grid">
                <label className="isfa-field isfa-field--wide">
                    <span>Nome completo / empresa *</span>
                    <input
                        value={form[grupo].nome}
                        onChange={(e) =>
                            atualizarCampo(grupo, "nome", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        list={grupo === "destino" ? "isfa-destinatarios-cache" : undefined}
                        placeholder="Digite o nome completo ou da empresa"
                        autoComplete="name"
                        required
                    />

                    {grupo === "destino" && (
                        <datalist id="isfa-destinatarios-cache">
                            {destinatariosCache.map((destinatario, indice) => (
                                <option
                                    key={`${destinatario.cpf_cnpj || destinatario.nome}-${indice}`}
                                    value={destinatario.nome}
                                    label={[
                                        destinatario.cpf_cnpj,
                                        destinatario.cidade,
                                        destinatario.estado,
                                    ].filter(Boolean).join(" · ")}
                                />
                            ))}
                        </datalist>
                    )}
                </label>

                <label className="isfa-field">
                    <span>E-mail *</span>
                    <input
                        type="email"
                        value={form[grupo].email}
                        onChange={(e) =>
                            atualizarCampo(grupo, "email", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="exemplo@email.com"
                        autoComplete="email"
                        required
                    />
                </label>

                <label className="isfa-field">
                    <span>Telefone *</span>
                    <input
                        value={form[grupo].telefone}
                        onChange={(e) =>
                            atualizarCampo(grupo, "telefone", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                        required
                    />
                </label>

                <label className="isfa-field isfa-field--wide">
                    <span>CPF/CNPJ *</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={form[grupo].cpf_cnpj}
                        onChange={(e) =>
                            atualizarCampo(grupo, "cpf_cnpj", e.target.value)
                        }
                        placeholder="Digite o CPF ou CNPJ"
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        autoComplete="off"
                        maxLength={18}
                        required
                    />
                </label>

                <label className="isfa-field">
                    <span>CEP *</span>
                    <input
                        inputMode="numeric"
                        maxLength={8}
                        value={form[grupo].cep}
                        onChange={(e) =>
                            atualizarCampo(grupo, "cep", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="Digite o CEP, somente números"
                        required
                    />
                </label>

                <label className="isfa-field isfa-field--wide">
                    <span>Rua / avenida *</span>
                    <input
                        value={form[grupo].rua}
                        onChange={(e) =>
                            atualizarCampo(grupo, "rua", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="Digite o nome da rua ou avenida"
                        required
                    />
                </label>

                <label className="isfa-field">
                    <span>Número *</span>
                    <input
                        value={form[grupo].numero}
                        onChange={(e) =>
                            atualizarCampo(grupo, "numero", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="Nº do imóvel"
                        required
                    />
                </label>

                <label className="isfa-field">
                    <span>Complemento</span>
                    <input
                        value={form[grupo].complemento}
                        onChange={(e) =>
                            atualizarCampo(grupo, "complemento", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="Apartamento, bloco, sala etc. (opcional)"
                    />
                </label>

                <label className="isfa-field">
                    <span>Bairro *</span>
                    <input
                        value={form[grupo].bairro}
                        onChange={(e) =>
                            atualizarCampo(grupo, "bairro", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="Digite o bairro"
                        required
                    />
                </label>

                <label className="isfa-field">
                    <span>Cidade *</span>
                    <input
                        value={form[grupo].cidade}
                        onChange={(e) =>
                            atualizarCampo(grupo, "cidade", e.target.value)
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="Digite a cidade"
                        required
                    />
                </label>

                <label className="isfa-field isfa-field--small">
                    <span>UF *</span>
                    <input
                        maxLength={2}
                        value={form[grupo].estado}
                        onChange={(e) =>
                            atualizarCampo(
                                grupo,
                                "estado",
                                e.target.value.toUpperCase()
                            )
                        }
                        onKeyDown={grupo === "destino" ? avancarInputDestino : undefined}
                        placeholder="SP"
                        required
                    />
                </label>
            </div>
        </section>
    );
    const opcoesCotacaoRapidaVisiveis =
        opcoesCotacaoRapida.filter(opcao => !freteBloqueado(opcao));

    const opcoesVisiveis =
        opcoes.filter(opcao => !freteBloqueado(opcao));
    // =========================================================
    // ALERTAS FLUTUANTES
    // =========================================================

    // Mantém apenas uma notificação geral visível por vez.
    // A ordem prioriza erros da lista, depois erros do formulário e avisos.
    const alertaFlutuante = erroLista
        ? {
            tipo: "error",
            codigo: "ERRO",
            titulo: "Não foi possível carregar ou processar a lista",
            mensagem: erroLista,
        }
        : erro
            ? {
                tipo: "error",
                codigo: "ATENÇÃO",
                titulo: "Não foi possível continuar",
                mensagem: erro,
            }
            : aviso
                ? {
                    tipo: "info",
                    codigo: "AVISO",
                    titulo: "Operação concluída",
                    mensagem: aviso,
                }
                : null;

    const fecharAlertaFlutuante = () => {
        if (erroLista) {
            setErroLista("");
        } else if (erro) {
            setErro("");
        } else if (aviso) {
            setAviso("");
        }
    };

    // =========================================================
    // INTERFACE
    // =========================================================

    return (
        <main className="isfa-shell">
            <header className="isfa-hero">
                <div
                    className="isfa-hero__icon"
                    aria-hidden="true"
                >
                    ↗
                </div>

                <div>
                    <span className="isfa-eyebrow">
                        IRONSTORE · LOGÍSTICA
                    </span>

                    <h1>Frete avulso</h1>

                    <p>
                        Consulte preços de entrega por CEP ou preencha os dados completos para criar um envio.
                    </p>
                </div>

                <div className="isfa-hero__tag">
                    Envio independente
                </div>
            </header>

            {/* =================================================
                LISTA DE FRETES PAGOS
            ================================================== */}

            <section className="isfa-card isfa-lista-pagos">
                <div className="isfa-card__heading isfa-lista-pagos__heading">
                    <span
                        className="isfa-card__step"
                        aria-hidden="true"
                    >
                        FP
                    </span>

                    <div>
                        <h2>Fretes pagos</h2>
                        <p>
                            Consulte seus envios pagos e gere a etiqueta
                            ou o documento quando precisar.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="isfa-button isfa-button--secondary"
                        onClick={carregarFretesPagos}
                        disabled={carregandoLista}
                    >
                        {carregandoLista
                            ? "Atualizando..."
                            : "Atualizar lista"}
                    </button>
                </div>

                {carregandoLista && fretesPagos.length === 0 ? (
                    <div className="isfa-lista-vazia">
                        <span
                            className="isfa-spinner"
                            aria-hidden="true"
                        />
                        <p>Carregando fretes pagos...</p>
                    </div>
                ) : fretesPagos.length === 0 ? (
                    <div className="isfa-lista-vazia">
                        <h3>Nenhum frete pago encontrado</h3>
                        <p>
                            Depois que um pagamento PIX for confirmado,
                            o frete deverá aparecer aqui.
                        </p>
                    </div>
                ) : (
                    <div className="isfa-lista-itens">
                        {fretesPagos.slice(0, limiteFretesVisiveis).map((frete) => {
                            const etiquetaUrl = frete.etiqueta_url;
                            const etiquetaPronta = Boolean(etiquetaUrl);

                            const gerando =
                                gerandoEtiquetaId === frete.id;

                            const statusEtiqueta = normalizarStatus(
                                frete.etiqueta_status
                            );

                            return (
                                <article
                                    className="isfa-frete-pago"
                                    key={frete.id}
                                >
                                    <div className="isfa-frete-pago__info">
                                        <div className="isfa-frete-pago__titulo">
                                            <strong>
                                                Frete #{frete.id}
                                            </strong>

                                            <span className="isfa-pago-badge">
                                                Pagamento confirmado
                                            </span>
                                        </div>

                                        <span>
                                            {frete.transportadora ||
                                                "Transportadora"}
                                            {" · "}
                                            {frete.servico ||
                                                "Serviço de envio"}
                                        </span>

                                        <span>
                                            Origem:{" "}
                                            {frete.cep_origem ||
                                                "Não informado"}
                                        </span>

                                        <span>
                                            Destino:{" "}
                                            {frete.cep_destino ||
                                                "Não informado"}
                                        </span>

                                        <div className="isfa-rastreamento">
                                            <span className="isfa-rastreamento__label">
                                                Rastreamento
                                            </span>

                                            {rastreamentoEditandoId === frete.id ? (
                                                <div className="isfa-rastreamento__editor">
                                                    <input
                                                        type="text"
                                                        value={codigoRastreioEditando}
                                                        onChange={(e) =>
                                                            setCodigoRastreioEditando(e.target.value)
                                                        }
                                                        placeholder="Digite o código de rastreamento"
                                                        maxLength={150}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                salvarRastreamento(frete.id);
                                                            }

                                                            if (e.key === "Escape") {
                                                                cancelarEdicaoRastreamento();
                                                            }
                                                        }}
                                                    />

                                                    <div className="isfa-rastreamento__botoes">
                                                        <button
                                                            type="button"
                                                            className="isfa-rastreamento__salvar"
                                                            onClick={() => salvarRastreamento(frete.id)}
                                                            disabled={salvandoRastreamentoId === frete.id}
                                                        >
                                                            {salvandoRastreamentoId === frete.id
                                                                ? "Salvando..."
                                                                : "Salvar"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="isfa-rastreamento__cancelar"
                                                            onClick={cancelarEdicaoRastreamento}
                                                            disabled={salvandoRastreamentoId === frete.id}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="isfa-rastreamento__clicavel"
                                                    onClick={() => iniciarEdicaoRastreamento(frete)}
                                                    title="Clique para adicionar ou editar o código"
                                                >
                                                    <span>
                                                        {frete.codigo_rastreio || "Adicionar código de rastreamento"}
                                                    </span>

                                                    <span className="isfa-rastreamento__editar">
                                                        Editar
                                                    </span>
                                                </button>
                                            )}
                                        </div>

                                        <span>
                                            Solicitado em:{" "}
                                            {formatarData(frete.data_criacao)}
                                        </span>
                                    </div>

                                    <div className="isfa-frete-pago__acao">
                                        <strong>
                                            {formatarMoeda(
                                                frete.valor_frete
                                            )}
                                        </strong>

                                        <span
                                            className={
                                                etiquetaPronta
                                                    ? "isfa-etiqueta-status isfa-etiqueta-status--pronta"
                                                    : "isfa-etiqueta-status"
                                            }
                                        >
                                            {etiquetaPronta
                                                ? "Documento pronto"
                                                : `Documento: ${statusEtiqueta}`}
                                        </span>

                                        {etiquetaPronta ? (
                                            <a
                                                className="isfa-button isfa-button--primary"
                                                href={etiquetaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Abrir etiqueta / documento
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                className="isfa-button isfa-button--primary"
                                                onClick={() =>
                                                    gerarDocumentoFrete(
                                                        frete.id
                                                    )
                                                }
                                                disabled={
                                                    gerandoEtiquetaId !==
                                                    null ||
                                                    carregandoLista
                                                }
                                            >
                                                {gerando ? (
                                                    <>
                                                        <span className="isfa-spinner" />
                                                        Gerando documento...
                                                    </>
                                                ) : (
                                                    "Gerar documento"
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {fretesPagos.length > 2 && (
                    <div className="isfa-lista-paginacao">
                        {limiteFretesVisiveis < fretesPagos.length && (
                            <button
                                type="button"
                                className="isfa-button isfa-button--secondary"
                                onClick={() => {
                                    setLimiteFretesVisiveis((atual) =>
                                        Math.min(atual + 5, fretesPagos.length)
                                    );
                                }}
                            >
                                Ver mais
                                {" "}
                                ({fretesPagos.length - limiteFretesVisiveis} restantes)
                            </button>
                        )}

                        {limiteFretesVisiveis > 2 && (
                            <button
                                type="button"
                                className="isfa-button isfa-button--secondary"
                                onClick={() => setLimiteFretesVisiveis(2)}
                            >
                                Ver menos
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* =================================================
                COTAÇÃO RÁPIDA, BOTÃO SEMPRE DISPONÍVEL
            ================================================== */}

            <section className="isfa-cotacao-entry" aria-label="Calcular frete por CEP">
                <div className="isfa-cotacao-entry__copy">
                    <span className="isfa-cotacao-entry__eyebrow">CONSULTA RÁPIDA</span>
                    <h2>Quer saber quanto custa o envio?</h2>
                    <p>Informe o CEP de destino para ver os preços disponíveis, sem selecionar nem contratar um serviço.</p>
                </div>
                <button
                    type="button"
                    className="isfa-button isfa-button--primary isfa-cotacao-entry__button"
                    onClick={abrirModalCotacao}
                >
                    <span aria-hidden="true">⌕</span>
                    Calcular frete
                </button>
            </section>

            {!pagamento && (
                <div className="isfa-completo-toggle">
                    <div>
                        <strong>Precisa pagar um frete e emitir uma etiqueta?</strong>
                        <p>Para criar o envio, será necessário preencher os dados completos do remetente, destinatário e pacote.</p>
                    </div>
                    <button
                        type="button"
                        className="isfa-button isfa-button--secondary"
                        onClick={() => setMostrarFormularioCompleto((atual) => !atual)}
                        aria-expanded={mostrarFormularioCompleto}
                    >
                        {mostrarFormularioCompleto ? "Ocultar formulário completo" : "Preencher dados completos"}
                    </button>
                </div>
            )}

            {/* =================================================
                MENSAGENS
            ================================================== */}

            {/* =================================================
                FORMULÁRIO DO FRETE
            ================================================== */}

            {!pagamento && mostrarFormularioCompleto && (
                <form
                    onSubmit={calcularFrete}
                    className="isfa-form"
                >
                    <div className="isfa-section-title">
                        <span>INFORMAÇÕES DO ENVIO</span>
                        <p>
                            Preencha os dados de origem e destino
                            exatamente como devem constar na etiqueta.
                        </p>
                    </div>

                    <div className="isfa-address-grid">
                        {renderEndereco("origem", "Origem")}
                        {renderEndereco("destino", "Destino")}
                    </div>

                    {renderSeletorProdutosFrete("completo")}

                    {/* DIMENSÕES */}

                    <section className="isfa-card">
                        <div className="isfa-card__heading">
                            <span className="isfa-card__step">03</span>

                            <div>
                                <h2>Dimensões do pacote</h2>
                                <p>
                                    Medidas em centímetros e peso em
                                    quilogramas.
                                </p>
                            </div>
                        </div>

                        <div className="isfa-grid isfa-grid--volume">
                            <label className="isfa-field">
                                <span>Peso (kg) *</span>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.001"
                                    value={form.volume.peso}
                                    placeholder="Ex.: 1 ou 0.500"
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            volume: {
                                                ...f.volume,
                                                peso: e.target.value,
                                            },
                                        }))
                                    }
                                    required
                                />
                            </label>

                            <label className="isfa-field">
                                <span>Altura (cm) *</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.1"
                                    value={form.volume.altura}
                                    placeholder="Ex.: 10"
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            volume: {
                                                ...f.volume,
                                                altura: e.target.value,
                                            },
                                        }))
                                    }
                                    required
                                />
                            </label>

                            <label className="isfa-field">
                                <span>Largura (cm) *</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.1"
                                    value={form.volume.largura}
                                    placeholder="Ex.: 15"
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            volume: {
                                                ...f.volume,
                                                largura: e.target.value,
                                            },
                                        }))
                                    }
                                    required
                                />
                            </label>

                            <label className="isfa-field">
                                <span>Comprimento (cm) *</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.1"
                                    value={form.volume.comprimento}
                                    placeholder="Ex.: 20"
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            volume: {
                                                ...f.volume,
                                                comprimento: e.target.value,
                                            },
                                        }))
                                    }
                                    required
                                />
                            </label>

                            <label className="isfa-field">
                                <span>Valor declarado (R$) *</span>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.volume.valor_declarado}
                                    placeholder="Ex.: 1,00"
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            volume: {
                                                ...f.volume,
                                                valor_declarado: e.target.value,
                                            },
                                        }))
                                    }
                                    required
                                />
                                <small>
                                    Usado como valor do conteúdo para o envio.
                                </small>
                            </label>
                        </div>
                    </section>

                    {/* DOCUMENTO */}

                    <section className="isfa-card">
                        <div className="isfa-card__heading">
                            <span className="isfa-card__step">04</span>

                            <div>
                                <h2>Documento de envio</h2>
                                <p>
                                    Defina o documento que será associado
                                    à etiqueta.
                                </p>
                            </div>
                        </div>

                        <div className="isfa-grid">
                            <label className="isfa-field">
                                <span>Tipo de documento *</span>

                                <select
                                    value={form.documento.tipo_documento}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            documento: {
                                                ...f.documento,
                                                tipo_documento:
                                                    e.target.value,
                                            },
                                        }))
                                    }
                                >
                                    <option value="dce">
                                        Declaração de conteúdo (DC-e)
                                    </option>

                                    <option value="nota_fiscal">
                                        Nota Fiscal
                                    </option>
                                </select>
                            </label>

                            {form.documento.tipo_documento ===
                                "nota_fiscal" && (
                                    <label className="isfa-field isfa-field--wide">
                                        <span>
                                            Chave da Nota Fiscal (44 dígitos) *
                                        </span>

                                        <input
                                            maxLength={44}
                                            value={
                                                form.documento.chave_documento
                                            }
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    documento: {
                                                        ...f.documento,
                                                        chave_documento:
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                ""
                                                            ),
                                                    },
                                                }))
                                            }
                                            required
                                        />
                                    </label>
                                )}

                            <label className="isfa-field">
                                <span>
                                    Inscrição Estadual (se aplicável)
                                </span>

                                <input
                                    value={
                                        form.documento.inscricao_estadual
                                    }
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            documento: {
                                                ...f.documento,
                                                inscricao_estadual:
                                                    e.target.value,
                                            },
                                        }))
                                    }
                                />
                            </label>

                            <label className="isfa-field">
                                <span>CNAE (se aplicável)</span>

                                <input
                                    value={form.documento.cnae}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            documento: {
                                                ...f.documento,
                                                cnae: e.target.value,
                                            },
                                        }))
                                    }
                                />
                            </label>
                        </div>
                    </section>

                    <div className="isfa-actions">
                        <button
                            className="isfa-button isfa-button--primary"
                            type="submit"
                            disabled={carregandoCotacao}
                        >
                            {carregandoCotacao ? (
                                <>
                                    <span className="isfa-spinner" />
                                    Calculando opções...
                                </>
                            ) : (
                                "Calcular opções de frete"
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* =================================================
                OPÇÕES DE FRETE
            ================================================== */}

            {opcoesVisiveis.length > 0 && !pagamento && (
                <section className="isfa-card isfa-options">
                    <div className="isfa-card__heading">
                        <span className="isfa-card__step">05</span>

                        <div>
                            <h2>Escolha a entrega</h2>
                            <p>
                                Os valores foram retornados pelo Melhor Envio.
                            </p>
                        </div>
                    </div>

                    <div className="isfa-option-list">
                        {opcoesVisiveis.map((opcao) => {
                            const id = String(opcao.id);

                            const selecionada =
                                String(servicoSelecionado?.id) === id;

                            return (
                                <button
                                    type="button"
                                    key={id}
                                    className={`isfa-option ${selecionada
                                        ? "isfa-option--selected"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        setServicoSelecionado(opcao)
                                    }
                                >
                                    <span className="isfa-option__radio">
                                        {selecionada ? "✓" : ""}
                                    </span>

                                    <span className="isfa-option__main">
                                        <strong>
                                            {opcao.transportadora ||
                                                opcao.company ||
                                                "Transportadora"}
                                        </strong>

                                        <span>
                                            {opcao.servico ||
                                                opcao.nome ||
                                                "Serviço de entrega"}
                                        </span>

                                        <small>
                                            {opcao.prazo_dias
                                                ? `${opcao.prazo_dias} dia(s) útil(eis)`
                                                : "Prazo informado pelo transportador"}
                                        </small>
                                    </span>

                                    <strong className="isfa-option__price">
                                        {formatarMoeda(opcao.valor_frete)}
                                    </strong>
                                </button>
                            );
                        })}
                    </div>

                    <div className="isfa-actions isfa-actions--split">
                        <button
                            type="button"
                            className="isfa-button isfa-button--secondary"
                            onClick={() => {
                                setOpcoes([]);
                                setServicoSelecionado(null);
                            }}
                        >
                            Voltar aos dados
                        </button>

                        <button
                            type="button"
                            className="isfa-button isfa-button--primary"
                            onClick={criarPagamento}
                            disabled={
                                !servicoSelecionado || criandoPagamento
                            }
                        >
                            {criandoPagamento ? (
                                <>
                                    <span className="isfa-spinner" />
                                    Criando PIX...
                                </>
                            ) : (
                                `Pagar ${servicoSelecionado
                                    ? formatarMoeda(
                                        servicoSelecionado.valor_frete
                                    )
                                    : "frete"
                                } com PIX`
                            )}
                        </button>
                    </div>
                </section>
            )}

            {/* =================================================
                PAGAMENTO PIX
            ================================================== */}

            {pagamento && (
                <section className="isfa-card isfa-payment">
                    <div className="isfa-card__heading">
                        <span className="isfa-card__step">06</span>

                        <div>
                            <h2>Pagamento do frete</h2>
                            <p>
                                Use o QR Code ou copie o código PIX abaixo para pagar o frete.
                            </p>
                        </div>
                    </div>

                    <div className="isfa-payment__amount">
                        {formatarMoeda(pagamento.valor_frete)}
                        <span>Pagamento do frete avulso pelo cliente</span>
                    </div>

                    {pagamento.qr_code_base64 && (
                        <div className="isfa-qr">
                            <img
                                alt="QR Code PIX para pagamento do frete"
                                src={`data:image/png;base64,${pagamento.qr_code_base64}`}
                            />
                        </div>
                    )}

                    {pagamento.qr_code && (
                        <div className="isfa-pix-code">
                            <textarea
                                readOnly
                                value={pagamento.qr_code}
                                aria-label="Código PIX copia e cola para pagamento do frete"
                            />

                            <button
                                type="button"
                                className="isfa-button isfa-button--secondary"
                                onClick={copiarPix}
                            >
                                Copiar código PIX
                            </button>
                        </div>
                    )}

                    <div className="isfa-payment__status">
                        <span
                            className={`isfa-status-dot ${resultado?.status_pagamento === "approved"
                                ? "isfa-status-dot--ok"
                                : ""
                                }`}
                        />

                        <strong>
                            {resultado?.status_pagamento === "approved"
                                ? "Pagamento confirmado"
                                : consultando
                                    ? "Consultando pagamento..."
                                    : "Aguardando pagamento"}
                        </strong>

                        <p>
                            {resultado?.status_pagamento === "approved"
                                ? "Pagamento aprovado. Seu frete está registrado e liberado para gerar a etiqueta na lista de fretes pagos."
                                : "Esta tela consulta automaticamente o status do pagamento."}
                        </p>
                    </div>

                    {resultado?.status_pagamento === "approved" && (
                        <div className="isfa-alert isfa-alert--info">
                            <span>
                                Pagamento confirmado. O frete foi atualizado na lista de fretes pagos. Você já pode iniciar a geração da etiqueta.
                            </span>
                        </div>
                    )}

                    <div className="isfa-actions">
                        <button
                            type="button"
                            className="isfa-button isfa-button--secondary"
                            onClick={reiniciar}
                        >
                            Iniciar outro frete avulso
                        </button>

                        <button
                            type="button"
                            className="isfa-button isfa-button--secondary"
                            onClick={carregarFretesPagos}
                            disabled={carregandoLista}
                        >
                            {carregandoLista
                                ? "Atualizando lista..."
                                : "Atualizar fretes pagos"}
                        </button>
                    </div>
                </section>
            )}
            {modalCotacaoAberto && typeof document !== "undefined" && createPortal(
                <div
                    className="isfa-cotacao-modal-backdrop"
                    role="presentation"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) fecharModalCotacao();
                    }}
                >
                    <section
                        className="isfa-cotacao-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="isfa-cotacao-modal-titulo"
                    >
                        <header className="isfa-cotacao-modal__header">
                            <div className="isfa-cotacao-modal__icon" aria-hidden="true">↗</div>
                            <div className="isfa-cotacao-modal__heading">
                                <span className="isfa-cotacao-modal__eyebrow">IRONSTORE · COTAÇÃO</span>
                                <h2 id="isfa-cotacao-modal-titulo">Calcular frete</h2>
                                <p>Consulte os valores disponíveis para o trajeto.</p>
                            </div>
                            <button
                                type="button"
                                className="isfa-cotacao-modal__close"
                                onClick={fecharModalCotacao}
                                disabled={carregandoCotacaoRapida}
                                aria-label="Fechar modal"
                            >×</button>
                        </header>

                        <div className="isfa-cotacao-modal__notice">
                            <span className="isfa-cotacao-modal__notice-icon" aria-hidden="true">i</span>
                            <p><strong>Para emitir a etiqueta de entrega, é necessário preencher os dados completos.</strong> A consulta abaixo mostra somente os preços dos fretes, sem selecionar transportadora ou contratar o envio.</p>
                        </div>

                        <form className="isfa-cotacao-modal__form" onSubmit={consultarCotacaoRapida}>
                            <div className="isfa-cotacao-modal__fields">
                                <label className="isfa-cotacao-modal__field">
                                    <span>CEP de origem, loja</span>
                                    <input
                                        type="text"
                                        value={limparCep(form.origem.cep).replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                                        readOnly
                                        aria-label="CEP de origem da loja"
                                    />
                                    <small>Preenchido pelo cadastro da loja</small>
                                </label>
                                <label className="isfa-cotacao-modal__field">
                                    <span>CEP de destino</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        placeholder="00000-000"
                                        maxLength={9}
                                        value={cepDestinoCotacao.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                                        onChange={(evento) => setCepDestinoCotacao(limparCep(evento.target.value))}
                                        aria-label="CEP de destino"
                                        required
                                    />
                                    <small>Digite o CEP para consultar as modalidades</small>
                                </label>
                            </div>
                            {renderSeletorProdutosFrete("rapido")}

                            <div className="isfa-cotacao-modal__package">
                                <div className="isfa-cotacao-modal__section-heading">
                                    <span className="isfa-cotacao-modal__section-icon" aria-hidden="true">
                                        ▦
                                    </span>
                                    <div>
                                        <strong>Dimensões do pacote</strong>
                                        <small>Informe as medidas reais para calcular o frete.</small>
                                    </div>
                                </div>

                                <div className="isfa-cotacao-modal__fields isfa-cotacao-modal__fields--package">
                                    <label className="isfa-cotacao-modal__field">
                                        <span>Peso (kg)</span>
                                        <input
                                            type="number"
                                            name="peso"
                                            value={form.volume.peso}
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Ex.: 1.5 ou 0.500"
                                            onChange={(evento) =>
                                                atualizarCampo("volume", "peso", evento.target.value)
                                            }
                                            required
                                        />
                                        <small>Peso total do pacote.</small>
                                    </label>

                                    <label className="isfa-cotacao-modal__field">
                                        <span>Altura (cm)</span>
                                        <input
                                            type="number"
                                            name="altura"
                                            value={form.volume.altura}
                                            min="1"
                                            step="0.1"
                                            placeholder="Ex.: 10"
                                            onChange={(evento) =>
                                                atualizarCampo("volume", "altura", evento.target.value)
                                            }
                                            required
                                        />
                                        <small>Da base até o topo.</small>
                                    </label>

                                    <label className="isfa-cotacao-modal__field">
                                        <span>Largura (cm)</span>
                                        <input
                                            type="number"
                                            name="largura"
                                            value={form.volume.largura}
                                            min="1"
                                            step="0.1"
                                            placeholder="Ex.: 15"
                                            onChange={(evento) =>
                                                atualizarCampo("volume", "largura", evento.target.value)
                                            }
                                            required
                                        />
                                        <small>De um lado ao outro.</small>
                                    </label>

                                    <label className="isfa-cotacao-modal__field">
                                        <span>Comprimento (cm)</span>
                                        <input
                                            type="number"
                                            name="comprimento"
                                            value={form.volume.comprimento}
                                            min="1"
                                            step="0.1"
                                            placeholder="Ex.: 20"
                                            onChange={(evento) =>
                                                atualizarCampo("volume", "comprimento", evento.target.value)
                                            }
                                            required
                                        />
                                        <small>Medida do lado mais longo.</small>
                                    </label>
                                </div>

                                <div className="isfa-cotacao-modal__fields">
                                    <label className="isfa-cotacao-modal__field">
                                        <span>Valor declarado (R$)</span>
                                        <input
                                            type="number"
                                            name="valor_declarado"
                                            min="0.01"
                                            step="0.01"
                                            value={form.volume.valor_declarado}
                                            onChange={(evento) =>
                                                atualizarCampo(
                                                    "volume",
                                                    "valor_declarado",
                                                    evento.target.value
                                                )
                                            }
                                            required
                                        />
                                        <small>Valor total dos produtos selecionados.</small>
                                    </label>
                                </div>
                            </div>
                            {erroCotacaoRapida && <div className="isfa-cotacao-modal__message isfa-cotacao-modal__message--error" role="alert">{erroCotacaoRapida}</div>}
                            {avisoCotacaoRapida && <div className="isfa-cotacao-modal__message isfa-cotacao-modal__message--info" role="status">{avisoCotacaoRapida}</div>}

                            <button
                                type="submit"
                                className="isfa-button isfa-button--primary isfa-cotacao-modal__submit"
                                disabled={carregandoCotacaoRapida}
                            >
                                {carregandoCotacaoRapida ? <><span className="isfa-spinner" /> Consultando fretes...</> : "Ver fretes disponíveis"}
                            </button>
                        </form>

                        {opcoesCotacaoRapidaVisiveis.length > 0 && (<section className="isfa-cotacao-results" aria-label="Valores dos fretes disponíveis">
                            <div className="isfa-cotacao-results__heading">
                                <div>
                                    <span>RESULTADOS DA CONSULTA</span>
                                    <h3>
                                        {opcoesCotacaoRapidaVisiveis.length}
                                        {" "}
                                        {opcoesCotacaoRapidaVisiveis.length === 1
                                            ? "opção encontrada"
                                            : "opções encontradas"}
                                    </h3>
                                </div>
                                <span className="isfa-cotacao-results__readonly">Somente consulta</span>
                            </div>
                            <div className="isfa-cotacao-results__list">
                                {opcoesCotacaoRapidaVisiveis.map((opcao, indice) => (
                                    <article className="isfa-cotacao-result" key={`${opcao.id || "servico"}-${indice}`}>
                                        <div className="isfa-cotacao-result__brand">
                                            {opcao.imagem ? <img src={opcao.imagem} alt="" loading="lazy" /> : <span aria-hidden="true">↗</span>}
                                        </div>
                                        <div className="isfa-cotacao-result__details">
                                            <strong>{opcao.transportadora || "Transportadora"}</strong>
                                            <span>{opcao.servico || "Serviço de entrega"}</span>
                                            {opcao.prazo_dias != null && <small>Prazo estimado: {opcao.prazo_dias} {Number(opcao.prazo_dias) === 1 ? "dia útil" : "dias úteis"}</small>}
                                        </div>
                                        <div className="isfa-cotacao-result__price">{formatarMoeda(opcao.valor_frete)}</div>
                                    </article>
                                ))}
                            </div>
                        </section>
                        )}

                        <footer className="isfa-cotacao-modal__footer">
                            <span>Os valores são estimativas retornadas pelo Melhor Envio e podem mudar.</span>
                            <button type="button" className="isfa-button isfa-button--secondary" onClick={fecharModalCotacao} disabled={carregandoCotacaoRapida}>Fechar</button>
                        </footer>
                    </section>
                </div>,
                document.body
            )}

            {alertaFlutuante &&
                !alertaPersonalizado &&
                typeof document !== "undefined" &&
                createPortal(
                    <aside
                        className="isfa-custom-alert isfa-custom-alert--toast"
                        role={alertaFlutuante.tipo === "error" ? "alert" : "status"}
                        aria-live={alertaFlutuante.tipo === "error" ? "assertive" : "polite"}
                    >
                        <div
                            className={`isfa-custom-alert__card ${alertaFlutuante.tipo === "info"
                                ? "isfa-custom-alert__card--info"
                                : "isfa-custom-alert__card--error"
                                }`}
                        >
                            <div className="isfa-custom-alert__top">
                                <div className="isfa-custom-alert__icon" aria-hidden="true">
                                    {alertaFlutuante.tipo === "info" ? "✓" : "!"}
                                </div>

                                <div className="isfa-custom-alert__heading">
                                    <span className="isfa-custom-alert__code">
                                        {alertaFlutuante.codigo}
                                    </span>
                                    <h3>{alertaFlutuante.titulo}</h3>
                                </div>

                                <button
                                    type="button"
                                    className="isfa-custom-alert__close"
                                    onClick={fecharAlertaFlutuante}
                                    aria-label="Fechar notificação"
                                    title="Fechar"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="isfa-custom-alert__message">
                                {alertaFlutuante.mensagem}
                            </p>
                        </div>
                    </aside>,
                    document.body
                )}

            {alertaPersonalizado &&
                typeof document !== "undefined" &&
                createPortal(
                    <aside
                        className="isfa-custom-alert"
                        role="alert"
                        aria-live="assertive"
                    >
                        <div
                            className={`isfa-custom-alert__card ${alertaPersonalizado.tipo === "saldo"
                                ? "isfa-custom-alert__card--warning"
                                : "isfa-custom-alert__card--error"
                                }`}
                        >
                            <div className="isfa-custom-alert__top">
                                <div className="isfa-custom-alert__icon">
                                    {alertaPersonalizado.tipo === "saldo"
                                        ? "!"
                                        : "×"}
                                </div>

                                <div className="isfa-custom-alert__heading">
                                    <span className="isfa-custom-alert__code">
                                        {alertaPersonalizado.codigo}
                                    </span>

                                    <h3>{alertaPersonalizado.titulo}</h3>
                                </div>

                                <button
                                    type="button"
                                    className="isfa-custom-alert__close"
                                    onClick={() =>
                                        setAlertaPersonalizado(null)
                                    }
                                    aria-label="Fechar alerta"
                                    title="Fechar"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="isfa-custom-alert__message">
                                {alertaPersonalizado.mensagem}
                            </p>

                            <div className="isfa-custom-alert__actions">
                                <a
                                    className="isfa-custom-alert__support"
                                    href={`https://wa.me/5511918547818?text=${encodeURIComponent(
                                        "Tô com uma situação de #502"
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M20.52 3.48A11.78 11.78 0 0 0 12.14 0C5.6 0 .28 5.31.28 11.85c0 2.09.55 4.13 1.6 5.93L.18 24l6.38-1.67a11.9 11.9 0 0 0 5.58 1.42h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.49-8.41ZM12.15 21.7a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.79.99 1.01-3.7-.24-.38a9.82 9.82 0 0 1-1.51-5.17c0-5.46 4.45-9.91 9.92-9.91a9.84 9.84 0 0 1 7.01 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.46-4.45 9.91-9.91 9.91Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.78-1.69-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
                                        />
                                    </svg>

                                    Entrar em contato com o suporte
                                </a>

                                <button
                                    type="button"
                                    className="isfa-custom-alert__ok"
                                    onClick={() =>
                                        setAlertaPersonalizado(null)
                                    }
                                >
                                    OK
                                </button>
                            </div>

                            <span className="isfa-custom-alert__footer">
                                Iron Executions · Suporte técnico
                            </span>
                        </div>
                    </aside>,
                    document.body
                )}
        </main>
    );
}
