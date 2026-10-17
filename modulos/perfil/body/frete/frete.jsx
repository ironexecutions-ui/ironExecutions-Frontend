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

function gerarChaveSolicitacao() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    if (globalThis.crypto?.getRandomValues) {
        const bytes = new Uint8Array(16);
        globalThis.crypto.getRandomValues(bytes);
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    // Fallback para ambientes sem crypto disponível.
    return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

function normalizarTexto(valor) {
    return String(valor || "").trim().toLocaleLowerCase("pt-BR");
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
    // A mesma chave é reutilizada durante toda a tentativa de pagamento,
    // inclusive nas consultas automáticas após a recarga.
    const chaveSolicitacaoRef = useRef(null);

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
    // CALCULAR COTAÇÃO
    // =========================================================

    const calcularFrete = async (evento) => {
        evento.preventDefault();

        setErro("");
        setAviso("");
        setPagamento(null);
        setResultado(null);
        setServicoSelecionado(null);
        setOpcoes([]);
        chaveSolicitacaoRef.current = null;

        const validacao = validarFormulario();

        if (validacao) {
            setErro(validacao);
            return;
        }

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

        // Uma chave por tentativa; não gerar outra ao repetir a mesma chamada.
        if (!chaveSolicitacaoRef.current) {
            chaveSolicitacaoRef.current = gerarChaveSolicitacao();
        }

        try {
            const data = await requisicao("/pix-inteligente", {
                method: "POST",
                body: JSON.stringify({
                    ...montarPayload(),
                    servico_id: String(servicoSelecionado.id),
                    chave_solicitacao: chaveSolicitacaoRef.current,
                }),
            });

            setPagamento(data);
            setResultado(null);

            if (data.tipo_fluxo === "recarga_melhor_envio") {
                setAviso(
                    "Aguardando a confirmação da recarga no Melhor Envio. Quando o saldo ficar disponível, o frete será registrado como pago e seguirá para a geração da etiqueta, sem cobrar outro PIX."
                );
            } else {
                setOpcoes([]);
                setAviso(
                    "Como já havia saldo suficiente no Melhor Envio, o pagamento será feito à Iron Executions. Após a confirmação do PIX, o frete seguirá para a geração da etiqueta."
                );
            }
        } catch (e) {
            setErro(e.message || "Não foi possível criar o PIX.");
        } finally {
            setCriandoPagamento(false);
        }
    };

    const verificarSaldoEContinuar = async () => {
        if (!pagamento || pagamento.tipo_fluxo !== "recarga_melhor_envio") {
            return;
        }

        setErro("");
        setAviso("");
        setCriandoPagamento(true);

        try {
            const dadosSaldo = await requisicao("/carteira/saldo", {
                method: "GET",
            });
            const saldo = Number(dadosSaldo.saldo);
            const valorFrete = Number(pagamento.valor_frete);

            if (!Number.isFinite(saldo) || !Number.isFinite(valorFrete)) {
                throw new Error("Não foi possível validar o saldo da carteira.");
            }

            if (saldo < valorFrete) {
                setPagamento((atual) => ({
                    ...atual,
                    saldo_melhor_envio: saldo,
                }));
                setAviso(
                    `A carteira ainda não tem saldo suficiente. Saldo consultado: ${formatarMoeda(saldo)}. Necessário para este frete: ${formatarMoeda(valorFrete)}. Confirme a recarga no Melhor Envio e tente novamente.`
                );
                return;
            }

            // Só neste ponto criamos o PIX do cliente e o registro de frete.
            // A recarga em si nunca é gravada como pagamento em ironstore_fretes.
            const data = await requisicao("/pix-inteligente", {
                method: "POST",
                body: JSON.stringify({
                    ...montarPayload(),
                    servico_id: String(servicoSelecionado.id),
                    chave_solicitacao: chaveSolicitacaoRef.current ||
                        (chaveSolicitacaoRef.current = gerarChaveSolicitacao()),
                    confirmar_recarga: true,
                }),
            });

            if (data.status === "pago" || data.status_pagamento === "approved") {
                setPagamento({
                    ...data,
                    tipo_fluxo: "saldo_melhor_envio",
                    saldo_melhor_envio: saldo,
                });
                setResultado({ status_pagamento: "approved" });
                setOpcoes([]);
                setAviso("Recarga confirmada e saldo suficiente. Nenhum novo PIX será cobrado do cliente. O frete foi liberado para a próxima etapa.");
                await carregarFretesPagos();
                if (data.frete_id) {
                    await gerarDocumentoFrete(data.frete_id);
                }
            } else {
                setPagamento({ ...data, tipo_fluxo: "pix_cliente", saldo_melhor_envio: saldo });
                setResultado(null);
                setOpcoes([]);
                setAviso("O saldo foi confirmado. O pagamento do frete será feito à Iron Executions por PIX.");
            }
        } catch (e) {
            setErro(e.message || "Não foi possível consultar o saldo da carteira.");
        } finally {
            setCriandoPagamento(false);
        }
    };
    // =========================================================
    // VERIFICAÇÃO AUTOMÁTICA DA RECARGA
    // Consulta o saldo a cada 5 segundos e libera o PIX do frete.
    // =========================================================

    const verificacaoAutomaticaEmAndamento = useRef(false);

    useEffect(() => {
        if (
            pagamento?.tipo_fluxo !== "recarga_melhor_envio" ||
            !servicoSelecionado
        ) {
            return;
        }

        let ativo = true;
        let intervalo = null;

        const verificarAutomaticamente = async () => {
            if (
                !ativo ||
                verificacaoAutomaticaEmAndamento.current
            ) {
                return;
            }

            verificacaoAutomaticaEmAndamento.current = true;

            try {
                const dadosSaldo = await requisicao(
                    "/carteira/saldo",
                    {
                        method: "GET",
                    }
                );

                if (!ativo) return;

                const saldo = Number(dadosSaldo.saldo);
                const valorFrete = Number(pagamento.valor_frete);

                if (
                    !Number.isFinite(saldo) ||
                    !Number.isFinite(valorFrete)
                ) {
                    return;
                }

                setPagamento((atual) => {
                    if (atual?.tipo_fluxo !== "recarga_melhor_envio") {
                        return atual;
                    }

                    return {
                        ...atual,
                        saldo_melhor_envio: saldo,
                    };
                });

                if (saldo < valorFrete) {
                    return;
                }

                // Interrompe novas verificações antes de criar o PIX.
                if (intervalo) {
                    clearInterval(intervalo);
                }

                setCriandoPagamento(true);
                setErro("");
                setAviso(
                    "Recarga identificada. Gerando o PIX do frete..."
                );

                const data = await requisicao(
                    "/pix-inteligente",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            ...montarPayload(),
                            servico_id: String(servicoSelecionado.id),
                            chave_solicitacao: chaveSolicitacaoRef.current ||
                                (chaveSolicitacaoRef.current = gerarChaveSolicitacao()),
                            confirmar_recarga: true,
                        }),
                    }
                );

                if (!ativo) return;

                setPagamento({
                    ...data,
                    tipo_fluxo: "saldo_melhor_envio",
                    saldo_melhor_envio: saldo,
                });
                setResultado({ status_pagamento: "approved" });
                setOpcoes([]);
                setAviso("Recarga confirmada! O saldo do Melhor Envio já cobre o frete. Você não precisa pagar outro PIX; liberando a geração da etiqueta.");
                await carregarFretesPagos();
                if (data.frete_id) {
                    await gerarDocumentoFrete(data.frete_id);
                }
            } catch (e) {
                if (ativo) {
                    console.error(
                        "[Frete Avulso] Verificação automática:",
                        e
                    );
                }
            } finally {
                verificacaoAutomaticaEmAndamento.current = false;

                if (ativo) {
                    setCriandoPagamento(false);
                }
            }
        };

        // Faz a primeira consulta imediatamente.
        verificarAutomaticamente();

        // Continua verificando a cada 5 segundos.
        intervalo = setInterval(
            verificarAutomaticamente,
            5000
        );

        return () => {
            ativo = false;

            if (intervalo) {
                clearInterval(intervalo);
            }
        };
    }, [
        pagamento?.tipo_fluxo,
        pagamento?.valor_frete,
        servicoSelecionado,
        requisicao,
    ]);
    // =========================================================
    // CONSULTAR STATUS DO PAGAMENTO
    // =========================================================

    const consultarPagamento = useCallback(async () => {
        const freteId = pagamento?.frete_id;

        if (
            !freteId ||
            pagamento?.tipo_fluxo === "recarga_melhor_envio" ||
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
                    "Pagamento confirmado à Iron Executions. O frete foi liberado e a geração da etiqueta será iniciada automaticamente."
                );

                await carregarFretesPagos();
                if (pagamento?.frete_id) {
                    await gerarDocumentoFrete(pagamento.frete_id);
                }
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
            pagamento?.tipo_fluxo === "recarga_melhor_envio" ||
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
            setAviso(
                pagamento?.tipo_fluxo === "recarga_melhor_envio"
                    ? "Código PIX de recarga copiado. Ele é destinado à carteira da Iron Executions no Melhor Envio, não ao pagamento do frete."
                    : "Código PIX do frete copiado."
            );
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
        chaveSolicitacaoRef.current = null;
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

    // =========================================================
    // INTERFACE
    // =========================================================

    // =========================================================
    // INTERFACE COMPLETA
    // =========================================================

    return (
        <main className="isfa-shell">
            {/* CABEÇALHO PRINCIPAL */}
            <header className="isfa-hero">
                <div className="isfa-hero__icon" aria-hidden="true">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                        <path d="M3 7.5 12 12l9-4.5" />
                        <path d="M12 12v9" />
                        <path d="m8 5 9 4.5" />
                    </svg>
                </div>

                <div className="isfa-hero__content">
                    <span className="isfa-eyebrow">
                        IRONSTORE / LOGÍSTICA
                    </span>

                    <h1>Frete avulso</h1>

                    <p>
                        Gerencie envios, consulte transportadoras,
                        acompanhe pagamentos e gere suas etiquetas
                        em um único lugar.
                    </p>
                </div>

                <div className="isfa-hero__tag">
                    <span className="isfa-hero__tag-dot" />
                    Envio independente
                </div>
            </header>

            {/* RESUMO OPERACIONAL */}
            <section
                className="isfa-overview"
                aria-label="Resumo dos fretes"
            >
                <article className="isfa-overview__item">
                    <span className="isfa-overview__icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="4" width="18" height="16" rx="3" />
                            <path d="M7 9h10M7 13h6" />
                        </svg>
                    </span>

                    <div className="isfa-overview__content">
                        <span>Fretes registrados</span>
                        <strong>{fretesPagos.length}</strong>
                        <small>Envios disponíveis nesta lista</small>
                    </div>
                </article>


                <article className="isfa-overview__item">
                    <span className="isfa-overview__icon isfa-overview__icon--brand">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 7h16v13H4z" />
                            <path d="M8 7V4h8v3M8 12h8M8 16h5" />
                        </svg>
                    </span>

                    <div className="isfa-overview__content">
                        <span>Documentação</span>
                        <strong>
                            {fretesPagos.filter(
                                (frete) => Boolean(frete.etiqueta_url)
                            ).length}
                        </strong>
                        <small>Etiquetas disponíveis para abertura</small>
                    </div>
                </article>
            </section>

            {/* =================================================
                FRETES PAGOS
            ================================================== */}

            <section className="isfa-card isfa-lista-pagos">
                <div className="isfa-card__heading isfa-lista-pagos__heading">
                    <span className="isfa-card__step">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 5h16v14H4z" />
                            <path d="M8 9h8M8 13h5" />
                            <path d="m15 16 2 2 4-4" />
                        </svg>
                    </span>

                    <div className="isfa-card__heading-content">
                        <h2>Seus fretes</h2>
                        <p>
                            Consulte pagamentos, acompanhe códigos
                            de rastreamento e gerencie documentos.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="isfa-button isfa-button--secondary"
                        onClick={carregarFretesPagos}
                        disabled={carregandoLista}
                    >
                        {carregandoLista ? (
                            <>
                                <span className="isfa-spinner" />
                                Atualizando...
                            </>
                        ) : (
                            <>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 7v5h-5" />
                                    <path d="M4 17v-5h5" />
                                    <path d="M5.5 9A7 7 0 0 1 17 5l3 7" />
                                    <path d="M18.5 15A7 7 0 0 1 7 19l-3-7" />
                                </svg>
                                Atualizar lista
                            </>
                        )}
                    </button>
                </div>

                {erroLista && (
                    <div
                        className="isfa-alert isfa-alert--error"
                        role="alert"
                    >
                        <strong>
                            Não foi possível processar a solicitação
                        </strong>
                        <span>{erroLista}</span>
                    </div>
                )}

                {carregandoLista && fretesPagos.length === 0 ? (
                    <div className="isfa-lista-vazia">
                        <span
                            className="isfa-spinner"
                            aria-hidden="true"
                        />
                        <h3>Carregando seus fretes</h3>
                        <p>
                            Estamos consultando os registros disponíveis.
                        </p>
                    </div>
                ) : fretesPagos.length === 0 ? (
                    <div className="isfa-lista-vazia">
                        <span className="isfa-empty-state__icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="M3 10h18M8 15h3" />
                            </svg>
                        </span>

                        <h3>Nenhum frete encontrado</h3>

                        <p>
                            Quando um pagamento for confirmado e o
                            respectivo frete estiver registrado, ele
                            aparecerá nesta seção.
                        </p>

                        <button
                            type="button"
                            className="isfa-button isfa-button--secondary"
                            onClick={() => {
                                document.querySelector(".isfa-form")?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                });
                            }}
                        >
                            Calcular primeiro frete
                        </button>
                    </div>
                ) : (
                    <div className="isfa-lista-itens">
                        {fretesPagos
                            .slice(0, limiteFretesVisiveis)
                            .map((frete) => {
                                const etiquetaUrl = frete.etiqueta_url;
                                const etiquetaPronta = Boolean(etiquetaUrl);

                                const gerando =
                                    gerandoEtiquetaId === frete.id;

                                const statusEtiqueta = normalizarStatus(
                                    frete.etiqueta_status
                                );

                                const editando =
                                    rastreamentoEditandoId === frete.id;

                                const salvando =
                                    salvandoRastreamentoId === frete.id;

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
                                                    <span className="isfa-status-dot isfa-status-dot--ok" />
                                                    Pago
                                                </span>
                                            </div>

                                            <div className="isfa-frete-pago__transportadora">
                                                <span className="isfa-frete-pago__transportadora-icon">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M3 7h11v11H3z" />
                                                        <path d="M14 11h4l3 3v4h-7z" />
                                                        <circle cx="7.5" cy="19" r="1.5" />
                                                        <circle cx="17.5" cy="19" r="1.5" />
                                                    </svg>
                                                </span>

                                                <div>
                                                    <strong>
                                                        {frete.transportadora ||
                                                            "Transportadora"}
                                                    </strong>
                                                    <span>
                                                        {frete.servico ||
                                                            "Serviço de envio"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="isfa-frete-pago__rota">
                                                <div className="isfa-frete-pago__rota-item">
                                                    <span className="isfa-frete-pago__rota-point isfa-frete-pago__rota-point--origin" />

                                                    <div>
                                                        <small>Origem</small>
                                                        <strong>
                                                            {frete.cep_origem ||
                                                                "CEP não informado"}
                                                        </strong>
                                                    </div>
                                                </div>

                                                <span className="isfa-frete-pago__rota-line" />

                                                <div className="isfa-frete-pago__rota-item">
                                                    <span className="isfa-frete-pago__rota-point isfa-frete-pago__rota-point--destination" />

                                                    <div>
                                                        <small>Destino</small>
                                                        <strong>
                                                            {frete.cep_destino ||
                                                                "CEP não informado"}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="isfa-rastreamento">
                                                <span className="isfa-rastreamento__label">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <circle cx="11" cy="11" r="7" />
                                                        <path d="m16 16 4 4M11 7v4l3 2" />
                                                    </svg>
                                                    Rastreamento
                                                </span>

                                                {editando ? (
                                                    <div className="isfa-rastreamento__editor">
                                                        <input
                                                            type="text"
                                                            value={codigoRastreioEditando}
                                                            onChange={(e) =>
                                                                setCodigoRastreioEditando(
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Código de rastreamento"
                                                            maxLength={150}
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    salvarRastreamento(
                                                                        frete.id
                                                                    );
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
                                                                onClick={() =>
                                                                    salvarRastreamento(
                                                                        frete.id
                                                                    )
                                                                }
                                                                disabled={salvando}
                                                            >
                                                                {salvando
                                                                    ? "Salvando..."
                                                                    : "Salvar código"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="isfa-rastreamento__cancelar"
                                                                onClick={
                                                                    cancelarEdicaoRastreamento
                                                                }
                                                                disabled={salvando}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="isfa-rastreamento__clicavel"
                                                        onClick={() =>
                                                            iniciarEdicaoRastreamento(
                                                                frete
                                                            )
                                                        }
                                                        title="Adicionar ou editar o código de rastreamento"
                                                    >
                                                        <span>
                                                            {frete.codigo_rastreio ||
                                                                "Adicionar código de rastreamento"}
                                                        </span>

                                                        <span className="isfa-rastreamento__editar">
                                                            {frete.codigo_rastreio
                                                                ? "Editar"
                                                                : "Adicionar"}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>

                                            <span className="isfa-frete-pago__data">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <circle cx="12" cy="12" r="9" />
                                                    <path d="M12 7v5l3 2" />
                                                </svg>

                                                Solicitado em{" "}
                                                {formatarData(
                                                    frete.data_criacao
                                                )}
                                            </span>
                                        </div>

                                        <div className="isfa-frete-pago__acao">
                                            <div className="isfa-frete-pago__valor">
                                                <span>Valor do frete</span>
                                                <strong>
                                                    {formatarMoeda(
                                                        frete.valor_frete
                                                    )}
                                                </strong>
                                            </div>

                                            <div
                                                className={
                                                    etiquetaPronta
                                                        ? "isfa-etiqueta-status isfa-etiqueta-status--pronta"
                                                        : "isfa-etiqueta-status"
                                                }
                                            >
                                                <span className="isfa-etiqueta-status__dot" />

                                                {etiquetaPronta
                                                    ? "Documento disponível"
                                                    : `Documento: ${statusEtiqueta}`}
                                            </div>

                                            {etiquetaPronta ? (
                                                <a
                                                    className="isfa-button isfa-button--primary"
                                                    href={etiquetaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M14 3h7v7" />
                                                        <path d="m21 3-9 9" />
                                                        <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
                                                    </svg>
                                                    Abrir documento
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
                                                            Processando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="M7 3h8l5 5v13H7z" />
                                                                <path d="M15 3v6h5M10 14h7M10 18h7" />
                                                            </svg>
                                                            Gerar documento
                                                        </>
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
                        <span>
                            Exibindo{" "}
                            {Math.min(
                                limiteFretesVisiveis,
                                fretesPagos.length
                            )}{" "}
                            de {fretesPagos.length} fretes
                        </span>

                        <div className="isfa-lista-paginacao__acoes">
                            {limiteFretesVisiveis < fretesPagos.length && (
                                <button
                                    type="button"
                                    className="isfa-button isfa-button--secondary"
                                    onClick={() => {
                                        setLimiteFretesVisiveis((atual) =>
                                            Math.min(
                                                atual + 5,
                                                fretesPagos.length
                                            )
                                        );
                                    }}
                                >
                                    Ver mais
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m7 10 5 5 5-5" />
                                    </svg>
                                </button>
                            )}

                            {limiteFretesVisiveis > 2 && (
                                <button
                                    type="button"
                                    className="isfa-button isfa-button--secondary"
                                    onClick={() =>
                                        setLimiteFretesVisiveis(2)
                                    }
                                >
                                    Ver menos
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* =================================================
                FEEDBACK GLOBAL
            ================================================== */}

            {erro && (
                <div
                    className="isfa-alert isfa-alert--error"
                    role="alert"
                >
                    <span className="isfa-alert__symbol">!</span>
                    <div>
                        <strong>Não foi possível continuar</strong>
                        <span>{erro}</span>
                    </div>
                </div>
            )}

            {aviso && (
                <div
                    className="isfa-alert isfa-alert--info"
                    role="status"
                >
                    <span className="isfa-alert__symbol">i</span>
                    <div>
                        <span>{aviso}</span>
                    </div>
                </div>
            )}

            {/* =================================================
                FORMULÁRIO
            ================================================== */}

            {!pagamento && (
                <form
                    onSubmit={calcularFrete}
                    className="isfa-form"
                >
                    <div className="isfa-section-title">
                        <div className="isfa-section-title__main">
                            <span className="isfa-eyebrow">
                                NOVO ENVIO
                            </span>

                            <h2>Prepare sua entrega</h2>

                            <p>
                                Informe os endereços, as dimensões do pacote
                                e o documento necessário para calcular
                                as opções disponíveis.
                            </p>
                        </div>

                        <div className="isfa-section-title__progress">
                            <span>4 etapas</span>
                            <div className="isfa-section-title__progress-track">
                                <span />
                            </div>
                        </div>
                    </div>

                    {/* ENDEREÇOS */}
                    <div className="isfa-address-grid">
                        {renderEndereco("origem", "Origem")}
                        {renderEndereco("destino", "Destino")}
                    </div>

                    {/* DIMENSÕES */}
                    <section className="isfa-card isfa-form-section">
                        <div className="isfa-card__heading">
                            <span className="isfa-card__step">03</span>

                            <div className="isfa-card__heading-content">
                                <h2>Dimensões do pacote</h2>
                                <p>
                                    Preencha as medidas reais da embalagem
                                    para obter uma cotação adequada.
                                </p>
                            </div>
                        </div>

                        <div className="isfa-grid isfa-grid--volume">
                            <label className="isfa-field">
                                <span>Peso do pacote *</span>
                                <div className="isfa-field__unit">
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.001"
                                        value={form.volume.peso}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                volume: {
                                                    ...f.volume,
                                                    peso: e.target.value,
                                                },
                                            }))
                                        }
                                        placeholder="1.000"
                                        required
                                    />
                                    <span>kg</span>
                                </div>
                            </label>

                            <label className="isfa-field">
                                <span>Altura *</span>
                                <div className="isfa-field__unit">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={form.volume.altura}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                volume: {
                                                    ...f.volume,
                                                    altura: e.target.value,
                                                },
                                            }))
                                        }
                                        placeholder="10"
                                        required
                                    />
                                    <span>cm</span>
                                </div>
                            </label>

                            <label className="isfa-field">
                                <span>Largura *</span>
                                <div className="isfa-field__unit">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={form.volume.largura}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                volume: {
                                                    ...f.volume,
                                                    largura: e.target.value,
                                                },
                                            }))
                                        }
                                        placeholder="15"
                                        required
                                    />
                                    <span>cm</span>
                                </div>
                            </label>

                            <label className="isfa-field">
                                <span>Comprimento *</span>
                                <div className="isfa-field__unit">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={form.volume.comprimento}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                volume: {
                                                    ...f.volume,
                                                    comprimento: e.target.value,
                                                },
                                            }))
                                        }
                                        placeholder="20"
                                        required
                                    />
                                    <span>cm</span>
                                </div>
                            </label>

                            <label className="isfa-field">
                                <span>Valor declarado *</span>
                                <div className="isfa-field__unit isfa-field__unit--currency">
                                    <span>R$</span>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.volume.valor_declarado}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                volume: {
                                                    ...f.volume,
                                                    valor_declarado: e.target.value,
                                                },
                                            }))
                                        }
                                        placeholder="1.00"
                                        required
                                    />
                                </div>
                                <small>
                                    Valor do conteúdo informado para o envio.
                                </small>
                            </label>
                        </div>

                        <div className="isfa-form-tip">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 11v5M12 8h.01" />
                            </svg>
                            <span>
                                Confira as medidas e o peso antes de calcular.
                                Informações incorretas podem alterar o valor
                                final do transporte.
                            </span>
                        </div>
                    </section>

                    {/* DOCUMENTAÇÃO */}
                    <section className="isfa-card isfa-form-section">
                        <div className="isfa-card__heading">
                            <span className="isfa-card__step">04</span>

                            <div className="isfa-card__heading-content">
                                <h2>Documento de envio</h2>
                                <p>
                                    Selecione o documento que será associado
                                    ao envio.
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
                                                tipo_documento: e.target.value,
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
                                            Chave de acesso da Nota Fiscal *
                                        </span>

                                        <input
                                            inputMode="numeric"
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
                                                            e.target.value
                                                                .replace(/\D/g, "")
                                                                .slice(0, 44),
                                                    },
                                                }))
                                            }
                                            placeholder="Informe os 44 dígitos"
                                            required
                                        />

                                        <small>
                                            {form.documento.chave_documento.length}
                                            /44 dígitos
                                        </small>
                                    </label>
                                )}

                            <label className="isfa-field">
                                <span>Inscrição Estadual</span>

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
                                    placeholder="Se aplicável"
                                />
                            </label>

                            <label className="isfa-field">
                                <span>CNAE</span>

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
                                    placeholder="Se aplicável"
                                />
                            </label>
                        </div>
                    </section>

                    {/* AÇÃO PRINCIPAL */}
                    <div className="isfa-form-footer">
                        <div className="isfa-form-footer__text">
                            <strong>Pronto para calcular?</strong>
                            <span>
                                Consulte as modalidades e escolha a melhor
                                opção para o seu envio.
                            </span>
                        </div>

                        <button
                            className="isfa-button isfa-button--primary isfa-button--large"
                            type="submit"
                            disabled={carregandoCotacao}
                        >
                            {carregandoCotacao ? (
                                <>
                                    <span className="isfa-spinner" />
                                    Consultando transportadoras...
                                </>
                            ) : (
                                <>
                                    Calcular opções de frete
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 12h14M13 6l6 6-6 6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* =================================================
                OPÇÕES DE FRETE
            ================================================== */}

            {opcoes.length > 0 && !pagamento && (
                <section className="isfa-card isfa-options">
                    <div className="isfa-card__heading">
                        <span className="isfa-card__step">05</span>

                        <div className="isfa-card__heading-content">
                            <h2>Escolha a modalidade de entrega</h2>
                            <p>
                                Compare os preços e os prazos retornados
                                pelo Melhor Envio.
                            </p>
                        </div>
                    </div>

                    {servicoSelecionado && (
                        <div className="isfa-selection-summary">
                            <span>Serviço selecionado</span>
                            <strong>
                                {servicoSelecionado.transportadora ||
                                    servicoSelecionado.company ||
                                    "Transportadora"}
                                {" · "}
                                {servicoSelecionado.servico ||
                                    servicoSelecionado.nome ||
                                    "Serviço de entrega"}
                            </strong>
                            <strong>
                                {formatarMoeda(
                                    servicoSelecionado.valor_frete
                                )}
                            </strong>
                        </div>
                    )}

                    <div className="isfa-option-list">
                        {opcoes.map((opcao) => {
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
                                    aria-pressed={selecionada}
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

                                    <span className="isfa-option__price">
                                        <small>Valor do frete</small>
                                        <strong>
                                            {formatarMoeda(
                                                opcao.valor_frete
                                            )}
                                        </strong>
                                    </span>
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
                            className="isfa-button isfa-button--primary isfa-button--large"
                            onClick={criarPagamento}
                            disabled={
                                !servicoSelecionado || criandoPagamento
                            }
                        >
                            {criandoPagamento ? (
                                <>
                                    <span className="isfa-spinner" />
                                    Preparando pagamento...
                                </>
                            ) : (
                                <>
                                    Continuar para pagamento
                                    <span>
                                        {servicoSelecionado
                                            ? formatarMoeda(
                                                servicoSelecionado.valor_frete
                                            )
                                            : "PIX"}
                                    </span>
                                </>
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

                        <div className="isfa-card__heading-content">
                            <h2>
                                {pagamento.tipo_fluxo ===
                                    "recarga_melhor_envio"
                                    ? "Recarga da carteira"
                                    : "Pagamento do frete"}
                            </h2>

                            <p>
                                {pagamento.tipo_fluxo ===
                                    "recarga_melhor_envio"
                                    ? "Adicione saldo à carteira da Iron Executions no Melhor Envio para prosseguir."
                                    : "Finalize o pagamento por PIX e acompanhe a confirmação nesta tela."}
                            </p>
                        </div>
                    </div>

                    <div className="isfa-payment__summary">
                        <span className="isfa-payment__summary-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M7 3h10v18l-5-3-5 3z" />
                                <path d="M10 8h4M10 12h4" />
                            </svg>
                        </span>

                        <div>
                            <span>
                                {pagamento.tipo_fluxo ===
                                    "recarga_melhor_envio"
                                    ? "Valor da recarga"
                                    : "Total do frete"}
                            </span>

                            <strong>
                                {formatarMoeda(
                                    pagamento.tipo_fluxo ===
                                        "recarga_melhor_envio"
                                        ? pagamento.valor_recarga
                                        : pagamento.valor_frete
                                )}
                            </strong>

                            <small>
                                {pagamento.tipo_fluxo ===
                                    "recarga_melhor_envio"
                                    ? "Crédito para a carteira da Iron Executions"
                                    : "Pagamento do envio selecionado"}
                            </small>
                        </div>
                    </div>

                    {pagamento.tipo_fluxo === "recarga_melhor_envio" && (
                        <div
                            className="isfa-alert isfa-alert--info"
                            role="note"
                        >
                            <span className="isfa-alert__symbol">i</span>

                            <div>
                                <strong>
                                    Esta cobrança é uma recarga de carteira
                                </strong>

                                <span>
                                    O valor será destinado à carteira da Iron
                                    Executions no Melhor Envio. Ele não quita
                                    o frete do cliente, não confirma o
                                    pagamento do frete e não registra um
                                    frete como pago. Depois que a recarga
                                    for confirmada, verifique o saldo para
                                    gerar o PIX correto do frete.
                                </span>
                            </div>
                        </div>
                    )}

                    {pagamento.qr_code_base64 && (
                        <div className="isfa-payment__content">
                            <div className="isfa-payment__instructions">
                                <span className="isfa-eyebrow">
                                    PAGAMENTO VIA PIX
                                </span>

                                <h3>
                                    Escaneie o QR Code
                                </h3>

                                <p>
                                    Abra o aplicativo do seu banco, escolha
                                    a opção de pagar com PIX e aponte a
                                    câmera para o código.
                                </p>
                            </div>

                            <div className="isfa-qr">
                                <img
                                    alt={
                                        pagamento.tipo_fluxo ===
                                            "recarga_melhor_envio"
                                            ? "QR Code PIX para recarga da carteira da Iron Executions"
                                            : "QR Code PIX para pagamento do frete"
                                    }
                                    src={`data:image/png;base64,${pagamento.qr_code_base64}`}
                                />
                            </div>
                        </div>
                    )}

                    {pagamento.qr_code && (
                        <div className="isfa-pix-code">
                            <label
                                className="isfa-field"
                                htmlFor="isfa-pix-copia-cola"
                            >
                                <span>PIX copia e cola</span>

                                <textarea
                                    id="isfa-pix-copia-cola"
                                    readOnly
                                    value={pagamento.qr_code}
                                    aria-label="Código PIX copia e cola"
                                />
                            </label>

                            <button
                                type="button"
                                className="isfa-button isfa-button--secondary"
                                onClick={copiarPix}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="8" y="8" width="13" height="13" rx="2" />
                                    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                                </svg>
                                Copiar código PIX
                            </button>
                        </div>
                    )}

                    {pagamento.tipo_fluxo === "recarga_melhor_envio" &&
                        !pagamento.qr_code_base64 &&
                        pagamento.qr_code_url && (
                            <div className="isfa-qr isfa-qr--link">
                                <img
                                    src={pagamento.qr_code_url}
                                    alt="QR Code PIX do Melhor Envio"
                                    className="frete-avulso-qr-code"
                                />

                                <p>
                                    Escaneie o código para abrir o pagamento
                                    PIX no celular.
                                </p>
                            </div>
                        )}

                    {/* CONTINUAÇÃO DA RECARGA */}
                    {pagamento.tipo_fluxo === "recarga_melhor_envio" && (
                        <div className="isfa-payment__next-step">

                            <div className="isfa-next-step">
                                <span className="isfa-eyebrow">
                                    ATENÇÃO · PRÓXIMA ETAPA
                                </span>

                                <h3>
                                    Já confirmou a recarga? Consulte seu saldo!
                                </h3>

                                <p>
                                    <strong>Importante:</strong> depois de realizar a recarga
                                    da carteira no Melhor Envio, aguarde a confirmação do crédito
                                    e consulte o saldo disponível abaixo.
                                </p>

                                <p>
                                    <strong>Somente com saldo suficiente</strong>, você poderá
                                    solicitar a geração do PIX específico para pagar este frete.
                                    A recarga da carteira, por si só, não realiza o pagamento
                                    do frete.
                                </p>
                            </div>


                            <button
                                type="button"
                                className="isfa-button isfa-button--primary isfa-button--large"
                                onClick={verificarSaldoEContinuar}
                                disabled={criandoPagamento}
                            >
                                {criandoPagamento ? (
                                    <>
                                        <span className="isfa-spinner" />
                                        Consultando carteira...
                                    </>
                                ) : (
                                    <>
                                        Verificar saldo e continuar
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 12h14M13 6l6 6-6 6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STATUS DO PAGAMENTO DO FRETE */}
                    {pagamento.tipo_fluxo !== "recarga_melhor_envio" && (
                        <div className="isfa-payment__status">
                            <span
                                className={`isfa-status-dot ${resultado?.status_pagamento === "approved"
                                    ? "isfa-status-dot--ok"
                                    : ""
                                    }`}
                            />

                            <div>
                                <strong>
                                    {resultado?.status_pagamento ===
                                        "approved"
                                        ? "Pagamento confirmado"
                                        : consultando
                                            ? "Verificando pagamento..."
                                            : "Aguardando pagamento"}
                                </strong>

                                <p>
                                    {resultado?.status_pagamento ===
                                        "approved"
                                        ? "O pagamento foi aprovado. O frete está registrado e disponível na lista, conforme os dados retornados pelo sistema."
                                        : "O sistema consulta automaticamente o status do pagamento. Após a aprovação, o frete será atualizado na lista."}
                                </p>
                            </div>
                        </div>
                    )}

                    {pagamento.tipo_fluxo !== "recarga_melhor_envio" &&
                        resultado?.status_pagamento === "approved" && (
                            <div
                                className="isfa-alert isfa-alert--info"
                                role="status"
                            >
                                <span className="isfa-alert__symbol">i</span>

                                <div>
                                    <strong>
                                        Pagamento aprovado
                                    </strong>

                                    <span>
                                        A etiqueta não é gerada
                                        automaticamente. Acesse a lista de
                                        fretes pagos e solicite a geração do
                                        documento quando necessário.
                                    </span>
                                </div>
                            </div>
                        )}

                    {/* AÇÕES FINAIS */}
                    <div className="isfa-actions isfa-actions--payment">
                        <button
                            type="button"
                            className="isfa-button isfa-button--secondary"
                            onClick={reiniciar}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Iniciar outro frete
                        </button>

                        <button
                            type="button"
                            className="isfa-button isfa-button--secondary"
                            onClick={carregarFretesPagos}
                            disabled={carregandoLista}
                        >
                            {carregandoLista ? (
                                <>
                                    <span className="isfa-spinner" />
                                    Atualizando...
                                </>
                            ) : (
                                <>
                                    Consultar fretes pagos
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 7v5h-5" />
                                        <path d="M4 17v-5h5" />
                                        <path d="M5.5 9A7 7 0 0 1 17 5l3 7" />
                                        <path d="M18.5 15A7 7 0 0 1 7 19l-3-7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </section>
            )}

            {/* =================================================
                ALERTA PERSONALIZADO VIA PORTAL
            ================================================== */}

            {alertaPersonalizado &&
                typeof document !== "undefined" &&
                createPortal(
                    <aside
                        className="isfa-custom-alert"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="isfa-custom-alert-title"
                        aria-describedby="isfa-custom-alert-description"
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

                                    <h3 id="isfa-custom-alert-title">
                                        {alertaPersonalizado.titulo}
                                    </h3>
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

                            <p
                                id="isfa-custom-alert-description"
                                className="isfa-custom-alert__message"
                            >
                                {alertaPersonalizado.mensagem}
                            </p>

                            <div className="isfa-custom-alert__actions">
                                <a
                                    className="isfa-custom-alert__support"
                                    href={`https://wa.me/5511918547818?text=${encodeURIComponent(
                                        `Olá, preciso de ajuda com uma situação de ${alertaPersonalizado.codigo ===
                                            "#502"
                                            ? "#502"
                                            : "frete avulso"
                                        }. ${alertaPersonalizado.mensagem
                                        }`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M20.52 3.48A11.78 11.78 0 0 0 12.14 0C5.6 0 .28 5.31.28 11.85c0 2.09.55 4.13 1.6 5.93L.18 24l6.38-1.67a11.9 11.9 0 0 0 5.58 1.42h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.49-8.41ZM12.15 21.7a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.79.99 1.01-3.7-.24-.38a9.82 9.82 0 0 1-1.51-5.17c0-5.46 4.45-9.91 9.92-9.91a9.84 9.84 0 0 1 7.01 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.46-4.45 9.91-9.91 9.91Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.78-1.69-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                                    </svg>

                                    Falar com o suporte
                                </a>

                                <button
                                    type="button"
                                    className="isfa-custom-alert__ok"
                                    onClick={() =>
                                        setAlertaPersonalizado(null)
                                    }
                                >
                                    Entendi
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