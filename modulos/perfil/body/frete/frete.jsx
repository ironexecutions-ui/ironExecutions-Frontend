import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import "./frete.css";
import { API_URL } from "../../../../config";

const API_PREFIX = "/ironstore/frete-avulso";
const CACHE_DESTINATARIOS_KEY = "ironstore_frete_avulso_destinatarios";

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
    const [gerandoEtiquetaId, setGerandoEtiquetaId] = useState(null);
    // =========================================================
    // DADOS DO REMETENTE — COMÉRCIO AUTENTICADO
    // =========================================================

    const origemEditada = useRef(false);

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

            setErroLista(
                e.message || "Não foi possível gerar o documento."
            );

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

        try {
            const data = await requisicao("/pix", {
                method: "POST",
                body: JSON.stringify({
                    ...montarPayload(),
                    servico_id: String(servicoSelecionado.id),
                }),
            });

            setPagamento(data);
            setResultado(null);
            setOpcoes([]);

            setAviso(
                "PIX criado. Após a confirmação do pagamento, o frete aparecerá na lista de fretes pagos. A etiqueta não será gerada automaticamente."
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
            setAviso("Código PIX copiado.");
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
                        Calcule uma entrega, escolha o serviço e pague
                        somente o frete.
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

                {erroLista && (
                    <div
                        className="isfa-alert isfa-alert--error"
                        role="alert"
                    >
                        <strong>
                            Não foi possível carregar ou processar a lista
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
                MENSAGENS
            ================================================== */}

            {erro && (
                <div
                    className="isfa-alert isfa-alert--error"
                    role="alert"
                >
                    <strong>Não foi possível continuar</strong>
                    <span>{erro}</span>
                </div>
            )}

            {aviso && (
                <div
                    className="isfa-alert isfa-alert--info"
                    role="status"
                >
                    <span>{aviso}</span>
                </div>
            )}

            {/* =================================================
                FORMULÁRIO DO FRETE
            ================================================== */}

            {!pagamento && (
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
                                    placeholder="Ex.: 1"
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

            {opcoes.length > 0 && !pagamento && (
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
                                Use o QR Code ou copie o código PIX abaixo.
                            </p>
                        </div>
                    </div>

                    <div className="isfa-payment__amount">
                        {formatarMoeda(pagamento.valor_frete)}
                        <span>Somente o frete avulso</span>
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
                                aria-label="Código PIX copia e cola"
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
                                ? "Pagamento aprovado. Seu frete está registrado. A geração da etiqueta ou do documento deverá ser iniciada separadamente na lista de fretes pagos."
                                : "Esta tela consulta automaticamente o status do pagamento."}
                        </p>
                    </div>

                    {resultado?.status_pagamento === "approved" && (
                        <div className="isfa-alert isfa-alert--info">
                            <span>
                                Pagamento confirmado. O frete foi atualizado
                                na lista. A etiqueta não será gerada
                                automaticamente.
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
        </main>
    );
}