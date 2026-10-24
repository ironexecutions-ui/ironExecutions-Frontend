import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import FundoImagens from "./ironstockfundos";
import { API_URL } from "../../../../../config";
import exemploA from "./ex/a.png";
import exemploB from "./ex/b.png";
import exemploC from "./ex/c.png";
import "./ironstock.css";
import { createPortal } from "react-dom";






function obterToken() {
    return localStorage.getItem("token");
}

async function lerResposta(resposta) {
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(
            dados.detail ||
            dados.mensagem ||
            "Não foi possível concluir a solicitação."
        );
    }

    return dados;
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function separarFotos(valor) {
    return String(valor || "")
        .split("|")
        .map((url) => url.trim())
        .filter(Boolean);
}

export default function Ironstock() {
    const inputFotosRef = useRef(null);

    const [nome, setNome] = useState("");
    const [tipoNome, setTipoNome] = useState("exato");
    const [preco, setPreco] = useState("");
    const [descricao, setDescricao] = useState("");

    const [arquivos, setArquivos] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [produtos, setProdutos] = useState([]);
    const [limite, setLimite] = useState(0);
    const [total, setTotal] = useState(0);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [dadosQrCelular, setDadosQrCelular] = useState(null);
    const [erroQrCelular, setErroQrCelular] = useState("");
    const [segundosQrCelular, setSegundosQrCelular] = useState(0);
    const [gerandoQrCelular, setGerandoQrCelular] = useState(false);
    const [produtoEditando, setProdutoEditando] = useState(null);
    const atualizarDados = useCallback(async () => {
        const token = obterToken();

        if (!token) {
            setErro("Sua sessão expirou. Entre novamente no sistema.");
            setCarregando(false);
            return;
        }

        setCarregando(true);
        setErro("");

        try {
            const resposta = await fetch(
                `${API_URL}/ironstock/produtos`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const dados = await lerResposta(resposta);

            setProdutos(
                Array.isArray(dados.produtos)
                    ? dados.produtos
                    : []
            );

            setLimite(Number(dados.limite || 0));
            setTotal(Number(dados.total || 0));
        } catch (e) {
            setErro(
                e.message ||
                "Não foi possível carregar os produtos do IronStock."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        atualizarDados();
    }, [atualizarDados]);

    useEffect(() => {
        const urls = arquivos.map((arquivo) =>
            URL.createObjectURL(arquivo)
        );

        setPreviews(urls);

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [arquivos]);

    function selecionarFotos(evento) {
        const selecionadas = Array.from(
            evento.target.files || []
        ).filter((arquivo) => arquivo.type.startsWith("image/"));

        evento.target.value = "";

        if (!selecionadas.length) {
            setErro("Selecione arquivos de imagem válidos.");
            return;
        }

        setErro("");
        setMensagem("");

        setArquivos((atuais) => {
            const combinados = [...atuais, ...selecionadas];

            if (combinados.length > 20) {
                setErro(
                    "Você pode selecionar no máximo 20 fotos por produto."
                );

                return combinados.slice(0, 20);
            }

            return combinados;
        });
    }

    function removerFoto(indiceRemover) {
        setArquivos((atuais) =>
            atuais.filter((_, indice) => indice !== indiceRemover)
        );
    }

    function limparFormulario() {
        if (salvando) return;

        setProdutoEditando(null);
        setNome("");
        setTipoNome("exato");
        setPreco("");
        setDescricao("");
        setArquivos([]);
        setErro("");
        setMensagem("");

        if (inputFotosRef.current) {
            inputFotosRef.current.value = "";
        }
    }

    async function enviarFotos(token) {
        const formData = new FormData();

        formData.append("pasta", "produtos");

        arquivos.forEach((arquivo) => {
            formData.append("arquivos", arquivo);
        });

        const resposta = await fetch(
            `${API_URL}/upload/client/imagens`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const dados = await lerResposta(resposta);

        const urls = String(dados.urls || "")
            .split("|")
            .map((url) => url.trim())
            .filter(Boolean);

        if (urls.length < 3) {
            throw new Error(
                "O servidor precisa retornar pelo menos 3 imagens válidas."
            );
        }

        return urls;
    }
    async function gerarQrCelular(produtoId, token) {
        setGerandoQrCelular(true);
        setErroQrCelular("");

        try {
            const resposta = await fetch(
                `${API_URL}/upload/client/foto-produto-mobile/gerar`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        produto_id: produtoId,
                    }),
                    cache: "no-store",
                }
            );

            const dados = await lerResposta(resposta);

            if (!dados.url || !dados.token) {
                throw new Error("O servidor não retornou o QR Code.");
            }

            setDadosQrCelular(dados);
            setSegundosQrCelular(
                Number(dados.expira_em_segundos || 300)
            );
        } catch (e) {
            const mensagemErro =
                e.message || "Não foi possível gerar o QR Code.";

            setErroQrCelular(mensagemErro);
            setErro(mensagemErro);
            setMensagem("");
        } finally {
            setGerandoQrCelular(false);
        }
    }
    function editarProduto(produto) {
        setProdutoEditando(produto);
        setNome(produto.nome || "");
        setTipoNome(produto.tipo_nome || "exato");
        setPreco(String(produto.preco ?? ""));
        setDescricao(produto.descricao_ironstock || "");
        setArquivos([]);
        setErro("");
        setMensagem("");

        if (inputFotosRef.current) {
            inputFotosRef.current.value = "";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function cadastrarProduto(evento, gerarQrDepois = false) {
        evento.preventDefault();

        if (salvando) return;

        const nomeLimpo = nome.trim();
        const precoNumerico = Number(
            String(preco).trim().replace(",", ".")
        );

        if (!nomeLimpo) {
            setErro("Informe o nome do produto.");
            return;
        }

        if (!Number.isFinite(precoNumerico) || precoNumerico <= 0) {
            setErro("Informe um preço válido maior que zero.");
            return;
        }

        if (arquivos.length > 0 && arquivos.length < 3) {
            setErro(
                "Selecione pelo menos 3 fotos ou deixe para adicionar depois pelo celular."
            );
            return;
        }

        if (arquivos.length > 20) {
            setErro("Você pode enviar no máximo 20 fotos por produto.");
            return;
        }

        const token = obterToken();

        if (!token) {
            setErro("Sua sessão expirou. Entre novamente no sistema.");
            return;
        }

        setSalvando(true);
        setErro("");
        setMensagem("");

        try {
            const idEmEdicao = produtoEditando?.id;
            const editando = Boolean(produtoEditando);

            let imagemUrl = produtoEditando?.imagem_url || "";

            if (arquivos.length > 0) {
                const urls = await enviarFotos(token);
                imagemUrl = urls.join("|");
            }

            const url = editando
                ? `${API_URL}/ironstock/produtos/${idEmEdicao}`
                : `${API_URL}/ironstock/produtos`;

            const resposta = await fetch(url, {
                method: editando ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: nomeLimpo,
                    tipo_nome: tipoNome,
                    preco: precoNumerico,
                    descricao_ironstock: descricao.trim() || null,
                    imagem_url: imagemUrl,
                }),
                cache: "no-store",
            });

            const dadosSalvos = await lerResposta(resposta);

            let produtoIdSalvo =
                idEmEdicao ??
                dadosSalvos.produto?.id ??
                dadosSalvos.id ??
                dadosSalvos.produto_id;

            setMensagem(
                editando
                    ? "Produto atualizado com sucesso!"
                    : "Produto cadastrado com sucesso!"
            );

            setProdutoEditando(null);
            setNome("");
            setTipoNome("exato");
            setPreco("");
            setDescricao("");
            setArquivos([]);

            if (inputFotosRef.current) {
                inputFotosRef.current.value = "";
            }

            await atualizarDados();

            // Se o servidor não retornou o ID, procura o produto salvo.
            if (gerarQrDepois && !produtoIdSalvo) {
                const respostaLista = await fetch(
                    `${API_URL}/ironstock/produtos`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const dadosLista = await lerResposta(respostaLista);

                const candidatos = (dadosLista.produtos || [])
                    .filter(
                        (produto) =>
                            produto.nome?.trim() === nomeLimpo &&
                            Number(produto.preco) === precoNumerico
                    )
                    .sort((a, b) => Number(b.id) - Number(a.id));

                produtoIdSalvo = candidatos[0]?.id;
            }

            // O QR só é gerado depois de salvar o produto.
            if (gerarQrDepois) {
                if (!produtoIdSalvo) {
                    setErro(
                        "Produto salvo, mas não foi possível identificar seu ID para gerar o QR Code."
                    );
                    return;
                }

                await gerarQrCelular(produtoIdSalvo, token);
            }
        } catch (e) {
            setErro(
                e.message || "Não foi possível salvar o produto."
            );
            setMensagem("");
        } finally {
            setSalvando(false);
        }
    }


    useEffect(() => {
        const tokenQr = dadosQrCelular?.token;

        if (!tokenQr) return;

        let ativo = true;
        let verificando = false;

        async function verificarFotos() {
            if (verificando || !ativo) return;

            verificando = true;

            try {
                const resposta = await fetch(
                    `${API_URL}/upload/client/foto-produto-mobile/${encodeURIComponent(tokenQr)}/status`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${obterToken()}`,
                        },
                        cache: "no-store",
                    }
                );

                const dados = await lerResposta(resposta);

                if (!ativo) return;

                const restante = Math.max(
                    0,
                    Number(dados.segundos_restantes || 0)
                );

                setSegundosQrCelular(restante);

                const fotosRecebidas = separarFotos(
                    dados.imagem_url
                );

                if (fotosRecebidas.length >= 3) {
                    setDadosQrCelular(null);
                    setSegundosQrCelular(0);
                    setMensagem(
                        "Fotos recebidas! O produto foi atualizado com sucesso."
                    );

                    await atualizarDados();
                    return;
                }

                if (restante <= 0) {
                    setDadosQrCelular(null);
                    setErroQrCelular(
                        "O QR Code expirou. Gere outro QR Code para continuar."
                    );
                }
            } catch (e) {
                if (ativo) {
                    setErroQrCelular(
                        e.message || "Não foi possível verificar as fotos."
                    );
                }
            } finally {
                verificando = false;
            }
        }

        verificarFotos();

        const intervalo = window.setInterval(verificarFotos, 2000);

        return () => {
            ativo = false;
            window.clearInterval(intervalo);
        };
    }, [dadosQrCelular?.token, atualizarDados]);
    const bloqueado = carregando || salvando;

    return (
        <main className="ie-ironstock">
            <section className="ie-ironstock__painel ie-ironstock__cabecalho">
                <div className="ie-ironstock__cabecalho-superior">
                    <div className="ie-ironstock__identidade">
                        <span className="ie-ironstock__sobretitulo">
                            Iron Executions
                        </span>

                        <h1 className="ie-ironstock__titulo">
                            IronStock
                        </h1>

                        <p className="ie-ironstock__subtitulo">
                            Cadastre e organize produtos com fotos,
                            preços e informações para identificação.
                        </p>
                    </div>
                    <FundoImagens />
                    <button
                        type="button"
                        className="ie-ironstock__botao ie-ironstock__botao--secundario"
                        onClick={atualizarDados}
                        disabled={carregando || salvando}
                    >
                        {carregando ? "Atualizando..." : "Atualizar dados"}
                    </button>
                </div>

                <div className="ie-ironstock__indicadores">
                    <article className="ie-ironstock__indicador">
                        <span className="ie-ironstock__indicador-rotulo">
                            Produtos cadastrados
                        </span>

                        <strong className="ie-ironstock__indicador-valor">
                            {carregando ? "..." : total}
                        </strong>

                        <span className="ie-ironstock__indicador-descricao">
                            Cadastro sem limite de quantidade
                        </span>
                    </article>

                    <article className="ie-ironstock__indicador ie-ironstock__indicador--destaque">
                        <span className="ie-ironstock__indicador-rotulo">
                            Capacidade diária configurada
                        </span>

                        <strong className="ie-ironstock__indicador-valor">
                            {carregando ? "..." : limite}
                        </strong>

                        <span className="ie-ironstock__indicador-descricao">
                            Unidades de atualização por dia
                        </span>
                    </article>
                </div>

                <div className="ie-ironstock__aviso">
                    <div className="ie-ironstock__aviso-icone" aria-hidden="true">
                        i
                    </div>

                    <div className="ie-ironstock__aviso-conteudo">
                        <h2 className="ie-ironstock__aviso-titulo">
                            Como funcionam as atualizações
                        </h2>

                        <p>
                            Você pode cadastrar quantos produtos quiser.
                            O número acima representa a capacidade diária
                            de atualização configurada para o seu IronStock,
                            não a quantidade de produtos que pode cadastrar.
                        </p>

                        <p>
                            As atualizações automáticas estão programadas
                            para segundas, terças e quartas-feiras,
                            entre 18h e 21h.
                        </p>
                    </div>
                </div>

                <div className="ie-ironstock__variedades">
                    <h3 className="ie-ironstock__variedades-titulo">
                        Contabilização de variedades
                    </h3>

                    <div className="ie-ironstock__variedades-lista">
                        <div className="ie-ironstock__variedade">
                            <strong>1 a 3</strong>
                            <span>variedades</span>
                            <b>1 unidade</b>
                        </div>

                        <div className="ie-ironstock__variedade">
                            <strong>4 a 7</strong>
                            <span>variedades</span>
                            <b>2 unidades</b>
                        </div>

                        <div className="ie-ironstock__variedade">
                            <strong>8 ou mais</strong>
                            <span>variedades</span>
                            <b>3 unidades</b>
                        </div>
                    </div>

                    <p className="ie-ironstock__variedades-nota">
                        Essa regra deve ser aplicada ao processamento
                        automático das variedades, não ao cadastro de produtos.
                    </p>
                </div>

                <div className="ie-ironstock__contato">
                    <div className="ie-ironstock__contato-texto">
                        <strong>Precisa de mais atualizações por dia?</strong>

                        <span>
                            Entre em contato para consultar a possibilidade
                            de aumentar sua capacidade.
                        </span>
                    </div>

                    <a
                        className="ie-ironstock__botao ie-ironstock__botao--whatsapp"
                        href="https://wa.me/5511918547818?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20aumento%20na%20capacidade%20di%C3%A1ria%20de%20atualiza%C3%A7%C3%B5es%20do%20IronStock."
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Solicitar aumento
                    </a>
                </div>
            </section>

            <section className="ie-ironstock__painel">
                <div className="ie-ironstock__secao-cabecalho">
                    <div>
                        <h2 className="ie-ironstock__titulo-secao">
                            {produtoEditando ? "Editar produto" : "Cadastrar produto"}
                        </h2>

                        <p className="ie-ironstock__subtitulo">
                            Preencha os dados e envie fotos pelo computador
                            ou fotografe o produto usando o celular.
                        </p>
                    </div>
                </div>

                {erro && (
                    <div
                        className="ie-ironstock__mensagem ie-ironstock__mensagem--erro"
                        role="alert"
                    >
                        {erro}
                    </div>
                )}

                {mensagem && (
                    <div
                        className="ie-ironstock__mensagem ie-ironstock__mensagem--sucesso"
                        role="status"
                    >
                        {mensagem}
                    </div>
                )}

                <form
                    className="ie-ironstock__formulario"
                    onSubmit={cadastrarProduto}
                >
                    <div className="ie-ironstock__campos">
                        <label className="ie-ironstock__campo">
                            <span className="ie-ironstock__rotulo">
                                Nome do produto *
                            </span>

                            <input
                                className="ie-ironstock__input"
                                type="text"
                                value={nome}
                                onChange={(evento) => setNome(evento.target.value)}
                                maxLength={255}
                                placeholder="Ex.: Camiseta preta"
                                required
                                disabled={bloqueado}
                            />
                        </label>

                        <label className="ie-ironstock__campo">
                            <span className="ie-ironstock__rotulo">
                                Tipo de correspondência *
                            </span>

                            <select
                                className="ie-ironstock__input"
                                value={tipoNome}
                                onChange={(evento) => setTipoNome(evento.target.value)}
                                disabled={bloqueado}
                            >
                                <option value="exato">Nome exato</option>
                                <option value="parcial">Nome parcial</option>
                            </select>

                            <span className="ie-ironstock__ajuda">
                                Define como o nome será considerado na identificação.
                            </span>
                        </label>

                        <label className="ie-ironstock__campo">
                            <span className="ie-ironstock__rotulo">
                                Preço (R$) *
                            </span>

                            <input
                                className="ie-ironstock__input"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={preco}
                                onChange={(evento) => setPreco(evento.target.value)}
                                placeholder="0,00"
                                required
                                disabled={bloqueado}
                            />
                        </label>
                    </div>

                    <label className="ie-ironstock__campo ie-ironstock__campo--descricao">
                        <span className="ie-ironstock__rotulo">
                            Descrição adicional
                        </span>

                        <textarea
                            className="ie-ironstock__textarea"
                            value={descricao}
                            onChange={(evento) => setDescricao(evento.target.value)}
                            maxLength={5000}
                            placeholder="Inclua detalhes que ajudem a identificar o produto..."
                            disabled={bloqueado}
                        />

                        <span className="ie-ironstock__ajuda">
                            Campo opcional. Máximo de 5.000 caracteres.
                        </span>
                    </label>


                    <div className="ie-ironstock__campo ie-ironstock__campo--fotos">
                        <div className="ie-ironstock__exemplos">
                            <div className="ie-ironstock__exemplos-cabecalho">
                                <strong>Exemplos de imagens</strong>
                                <span>
                                    As imagens mostram os melhores ângulos do produto para ajudar o
                                    sistema a identificá-lo com mais precisão. Siga os exemplos ao
                                    fotografar seus produtos.
                                </span>
                            </div>

                            <div className="ie-ironstock__exemplos-lista">
                                <article className="ie-ironstock__exemplo">
                                    <img src={exemploA} alt="Exemplo de imagem A" />
                                    <span>Exemplos 1</span>
                                </article>

                                <article className="ie-ironstock__exemplo">
                                    <img src={exemploB} alt="Exemplo de imagem B" />
                                    <span>Exemplos 2</span>
                                </article>

                                <article className="ie-ironstock__exemplo">
                                    <img src={exemploC} alt="Exemplo de imagem C" />
                                    <span>Exemplos 3</span>
                                </article>
                            </div>
                        </div>
                        <span className="ie-ironstock__rotulo">
                            Fotos do produto (opcional — mínimo de 3 se enviar pelo computador)
                        </span>

                        <input
                            ref={inputFotosRef}
                            className="ie-ironstock__input-arquivos"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            onChange={selecionarFotos}
                            disabled={bloqueado}
                        />

                        <button
                            className="ie-ironstock__seletor-fotos"
                            type="button"
                            onClick={() => inputFotosRef.current?.click()}
                            disabled={bloqueado}
                        >
                            <span
                                className="ie-ironstock__seletor-icone"
                                aria-hidden="true"
                            >
                                +
                            </span>

                            <strong>Selecionar fotos</strong>

                            <span>
                                JPG, PNG, WEBP ou GIF. Até 20 fotos por produto.
                            </span>
                        </button>

                        <div
                            className={`ie-ironstock__contador-fotos ${arquivos.length >= 3
                                ? "ie-ironstock__contador-fotos--valido"
                                : "ie-ironstock__contador-fotos--pendente"
                                }`}
                        >
                            {arquivos.length} fotos selecionadas
                        </div>

                        {previews.length > 0 && (
                            <div className="ie-ironstock__previews">
                                {previews.map((url, indice) => (
                                    <article
                                        className="ie-ironstock__preview"
                                        key={`${url}-${indice}`}
                                    >
                                        <img
                                            className="ie-ironstock__preview-imagem"
                                            src={url}
                                            alt={`Foto ${indice + 1} do produto`}
                                        />

                                        <button
                                            className="ie-ironstock__preview-remover"
                                            type="button"
                                            onClick={() => removerFoto(indice)}
                                            disabled={bloqueado}
                                            aria-label={`Remover foto ${indice + 1}`}
                                            title="Remover foto"
                                        >
                                            ×
                                        </button>

                                        <span className="ie-ironstock__preview-nome">
                                            {arquivos[indice]?.name}
                                        </span>
                                    </article>
                                ))}
                            </div>
                        )}

                        <button
                            className="ie-ironstock__botao ie-ironstock__botao--principal"
                            type="button"
                            onClick={(evento) => cadastrarProduto(evento, true)}
                            disabled={bloqueado || gerandoQrCelular}
                        >
                            {salvando
                                ? "Salvando produto..."
                                : gerandoQrCelular
                                    ? "Gerando QR Code..."
                                    : "Gerar imagens pelo celular"}
                        </button>
                    </div>


                    <div className="ie-ironstock__acoes-formulario">
                        <button
                            className="ie-ironstock__botao ie-ironstock__botao--secundario"
                            type="button"
                            onClick={limparFormulario}
                            disabled={salvando}
                        >
                            Limpar formulário
                        </button>

                        <button
                            className="ie-ironstock__botao ie-ironstock__botao--principal"
                            type="submit"
                            disabled={bloqueado}
                        >
                            {salvando
                                ? "Salvando..."
                                : produtoEditando
                                    ? "Salvar alterações"
                                    : "Cadastrar no IronStock"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="ie-ironstock__painel">
                <div className="ie-ironstock__secao-cabecalho">
                    <div>
                        <h2 className="ie-ironstock__titulo-secao">
                            Produtos do IronStock
                        </h2>

                        <p className="ie-ironstock__subtitulo">
                            Todos os produtos cadastrados neste módulo.
                        </p>
                    </div>

                    <span className="ie-ironstock__total-listagem">
                        {carregando ? "Carregando..." : `${produtos.length} exibido(s)`}
                    </span>
                </div>

                {carregando ? (
                    <div className="ie-ironstock__estado-vazio">
                        <span className="ie-ironstock__carregador" />
                        <p>Carregando produtos...</p>
                    </div>
                ) : produtos.length === 0 ? (
                    <div className="ie-ironstock__estado-vazio">
                        <div className="ie-ironstock__estado-icone" aria-hidden="true">
                            <span>+</span>
                        </div>

                        <h3>Nenhum produto cadastrado</h3>

                        <p>
                            Cadastre seu primeiro produto usando o formulário acima.
                        </p>
                    </div>
                ) : (
                    <div className="ie-ironstock__produtos">
                        {produtos.map((produto) => {
                            const fotos = separarFotos(produto.imagem_url);

                            return (
                                <article
                                    className="ie-ironstock__produto"
                                    key={produto.id}
                                >
                                    {fotos[0] ? (
                                        <img
                                            className="ie-ironstock__produto-imagem"
                                            src={fotos[0]}
                                            alt={produto.nome || "Imagem do produto"}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="ie-ironstock__produto-sem-imagem">
                                            Sem imagem
                                        </div>
                                    )}

                                    <div className="ie-ironstock__produto-conteudo">
                                        <h3 className="ie-ironstock__produto-nome">
                                            {produto.nome}
                                        </h3>

                                        <strong className="ie-ironstock__produto-preco">
                                            {formatarPreco(produto.preco)}
                                        </strong>

                                        <span className="ie-ironstock__produto-fotos">
                                            {fotos.length} foto(s) cadastrada(s)
                                        </span>

                                        {produto.descricao_ironstock && (
                                            <p className="ie-ironstock__produto-descricao">
                                                {produto.descricao_ironstock}
                                            </p>
                                        )}
                                        <div className="ie-ironstock__produto-acoes">
                                            <button
                                                type="button"
                                                className="ie-ironstock__botao ie-ironstock__botao--secundario"
                                                onClick={() => editarProduto(produto)}
                                                disabled={salvando || gerandoQrCelular}
                                            >
                                                Editar
                                            </button>


                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
            {dadosQrCelular &&
                createPortal(
                    <div
                        className="ie-ironstock__qr-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ie-ironstock-qr-titulo"
                    >
                        <section className="ie-ironstock__qr-modal">
                            <button
                                type="button"
                                className="ie-ironstock__qr-fechar"
                                onClick={() => setDadosQrCelular(null)}
                                aria-label="Fechar QR Code"
                            >
                                ×
                            </button>

                            <span className="ie-ironstock__qr-etiqueta">
                                FOTOGRAFAR PELO CELULAR
                            </span>

                            <h2 id="ie-ironstock-qr-titulo">
                                Adicione fotos ao produto
                            </h2>

                            <p>
                                Abra a câmera do celular, escaneie o QR Code e
                                fotografe o produto. As imagens serão vinculadas
                                automaticamente a este cadastro.
                            </p>

                            <div className="ie-ironstock__qr-imagem">
                                <QRCodeSVG
                                    value={dadosQrCelular.url}
                                    size={240}
                                    level="H"
                                    includeMargin
                                />
                            </div>

                            <strong className="ie-ironstock__qr-nome">
                                {dadosQrCelular.produto?.nome ||
                                    "Produto cadastrado"}
                            </strong>

                            <p className="ie-ironstock__qr-tempo">
                                Tempo restante:{" "}
                                {Math.floor(segundosQrCelular / 60)
                                    .toString()
                                    .padStart(2, "0")}
                                :
                                {(segundosQrCelular % 60)
                                    .toString()
                                    .padStart(2, "0")}
                            </p>

                            <p className="ie-ironstock__qr-status">
                                Aguardando o envio de pelo menos 3 fotos...
                            </p>

                            {gerandoQrCelular && (
                                <p>Gerando QR Code...</p>
                            )}

                            {erroQrCelular && (
                                <p
                                    className="ie-ironstock__mensagem ie-ironstock__mensagem--erro"
                                    role="alert"
                                >
                                    {erroQrCelular}
                                </p>
                            )}

                            <button
                                type="button"
                                className="ie-ironstock__botao ie-ironstock__botao--secundario"
                                onClick={() => setDadosQrCelular(null)}
                            >
                                Fechar
                            </button>
                        </section>
                    </div>,
                    document.body
                )}
        </main>
    );
}