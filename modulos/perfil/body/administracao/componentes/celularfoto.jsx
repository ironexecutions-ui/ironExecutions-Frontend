import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { removeBackground } from "@imgly/background-removal";
import { API_URL } from "../../../../../config";
import "./celularfoto.css";

export default function CelularFoto() {

    const { token } = useParams();

    const inputCameraRef = useRef(null);
    const inputGaleriaRef = useRef(null);

    // =========================================================
    // REFERÊNCIAS DE NAVEGAÇÃO MOBILE
    // =========================================================

    const paginaRef = useRef(null);
    const produtoRef = useRef(null);
    const areaPrincipalRef = useRef(null);
    const confirmacaoRef = useRef(null);
    const imagensRef = useRef(null);

    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [produto, setProduto] = useState(null);
    const [fotoCapturada, setFotoCapturada] = useState(null);
    const [imagens, setImagens] = useState([]);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [segundosRestantes, setSegundosRestantes] = useState(null);
    const [expirado, setExpirado] = useState(false);


    // =========================================================
    // SCROLL / MOBILIDADE MOBILE
    // =========================================================

    function obterElementoComScroll() {

        // Nesta tela o scroll é controlado explicitamente pelo <main>.
        // Isso evita conflitos com #root, body ou layouts globais do sistema.
        return paginaRef.current;
    }


    function rolarPara(ref, opcoes = {}) {

        const elemento = ref?.current;
        const pagina = paginaRef.current;

        if (!elemento || !pagina) {
            return;
        }

        const {
            atraso = 100,
            margem = 18
        } = opcoes;

        window.setTimeout(() => {

            window.requestAnimationFrame(() => {

                const paginaRect =
                    pagina.getBoundingClientRect();

                const elementoRect =
                    elemento.getBoundingClientRect();

                const destino =
                    pagina.scrollTop +
                    elementoRect.top -
                    paginaRect.top -
                    margem;

                pagina.scrollTo({
                    top: Math.max(0, destino),
                    left: 0,
                    behavior: "smooth"
                });

            });

        }, atraso);
    }


    function rolarParaTopo() {

        const pagina = paginaRef.current;

        if (!pagina) {
            return;
        }

        pagina.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }


    function rolarParaConfirmacao() {

        // A confirmação só entra no DOM depois do setFotoCapturada.
        // Esperamos React renderizar antes de procurar a referência.
        let tentativas = 0;

        function tentar() {

            tentativas += 1;

            if (confirmacaoRef.current) {

                rolarPara(
                    confirmacaoRef,
                    {
                        atraso: 20,
                        margem: 74
                    }
                );

                return;
            }

            if (tentativas < 12) {
                window.setTimeout(tentar, 50);
            }
        }

        window.setTimeout(tentar, 30);
    }


    function rolarParaImagens() {

        // A lista pode estar sendo criada justamente depois do upload.
        let tentativas = 0;

        function tentar() {

            tentativas += 1;

            if (imagensRef.current) {

                rolarPara(
                    imagensRef,
                    {
                        atraso: 20,
                        margem: 74
                    }
                );

                return;
            }

            if (tentativas < 12) {
                window.setTimeout(tentar, 50);
            }
        }

        window.setTimeout(tentar, 30);
    }


    // =========================================================
    // AJUSTAR ALTURA REAL DO CELULAR
    // =========================================================

    useEffect(() => {

        function atualizarAlturaMobile() {

            const altura =
                window.visualViewport?.height ||
                window.innerHeight;

            document.documentElement.style.setProperty(
                "--celular-foto-altura-real",
                `${altura}px`
            );
        }

        atualizarAlturaMobile();

        window.addEventListener(
            "resize",
            atualizarAlturaMobile
        );

        window.addEventListener(
            "orientationchange",
            atualizarAlturaMobile
        );

        window.visualViewport?.addEventListener(
            "resize",
            atualizarAlturaMobile
        );

        return () => {

            window.removeEventListener(
                "resize",
                atualizarAlturaMobile
            );

            window.removeEventListener(
                "orientationchange",
                atualizarAlturaMobile
            );

            window.visualViewport?.removeEventListener(
                "resize",
                atualizarAlturaMobile
            );
        };

    }, []);


    // =========================================================
    // CARREGAR ACESSO
    // =========================================================

    useEffect(() => {

        if (!token) {
            setErro("Link inválido.");
            setCarregando(false);
            return;
        }

        carregarAcesso();

    }, [token]);


    // =========================================================
    // LIMPAR PREVIEW
    // =========================================================

    useEffect(() => {

        return () => {

            if (fotoCapturada?.url) {
                URL.revokeObjectURL(fotoCapturada.url);
            }

        };

    }, [fotoCapturada]);


    // =========================================================
    // CONTADOR
    // =========================================================

    useEffect(() => {

        if (
            segundosRestantes === null ||
            segundosRestantes <= 0 ||
            expirado
        ) {
            return;
        }

        const intervalo = window.setInterval(() => {

            setSegundosRestantes(anterior => {

                if (anterior <= 1) {

                    window.clearInterval(intervalo);

                    setExpirado(true);

                    return 0;
                }

                return anterior - 1;
            });

        }, 1000);

        return () => {
            window.clearInterval(intervalo);
        };

    }, [segundosRestantes, expirado]);


    // =========================================================
    // CARREGAR TOKEN
    // =========================================================

    async function carregarAcesso() {

        setCarregando(true);
        setErro("");

        try {

            console.log(
                "[CELULAR FOTO] Consultando acesso:",
                token
            );

            const resposta = await fetch(
                `${API_URL}/upload/client/foto-produto-mobile/${encodeURIComponent(token)}`
            );

            const dados = await resposta
                .json()
                .catch(() => ({}));

            console.log(
                "[CELULAR FOTO] Dados recebidos:",
                dados
            );

            if (!resposta.ok) {

                if (
                    resposta.status === 401 ||
                    resposta.status === 403 ||
                    resposta.status === 404 ||
                    resposta.status === 410
                ) {
                    setExpirado(true);
                }

                throw new Error(
                    dados.detail ||
                    "Este acesso não está mais disponível."
                );
            }


            // =================================================
            // PRODUTO
            // =================================================

            const produtoRecebido =
                dados.produto || {
                    id: dados.produto_id,
                    nome: dados.nome,
                    preco: dados.preco,
                    categoria: dados.categoria,
                    imagem_url: dados.imagem_url
                };

            setProduto(produtoRecebido);


            // =================================================
            // IMAGENS
            // =================================================

            const imagensExistentes = String(
                produtoRecebido?.imagem_url || ""
            )
                .split("|")
                .map(url => url.trim())
                .filter(Boolean);

            setImagens(imagensExistentes);


            // =================================================
            // TEMPO
            // =================================================

            const segundos = Number(
                dados.expira_em_segundos ??
                dados.segundos_restantes ??
                300
            );

            setSegundosRestantes(
                Math.max(0, segundos)
            );

            if (segundos <= 0) {
                setExpirado(true);
            }

            window.requestAnimationFrame(() => {
                paginaRef.current?.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto"
                });
            });

        } catch (erroCarregar) {

            console.error(
                "[CELULAR FOTO] Erro:",
                erroCarregar
            );

            setErro(
                erroCarregar.message ||
                "Não foi possível abrir este acesso."
            );

        } finally {

            setCarregando(false);
        }
    }


    // =========================================================
    // VERIFICAR ACESSO
    // =========================================================

    function acessoAtivo() {

        if (
            expirado ||
            segundosRestantes === 0
        ) {

            setExpirado(true);

            setErro(
                "Este acesso expirou. Gere um novo QR Code no computador."
            );

            return false;
        }

        return true;
    }


    // =========================================================
    // FORMATAR PREÇO
    // =========================================================

    function formatarPreco(valor) {

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "";
        }

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    // =========================================================
    // FORMATAR TEMPO
    // =========================================================

    function formatarTempo(segundos) {

        const total = Math.max(
            0,
            Number(segundos || 0)
        );

        const minutos =
            Math.floor(total / 60);

        const resto =
            total % 60;

        return (
            `${String(minutos).padStart(2, "0")}:` +
            `${String(resto).padStart(2, "0")}`
        );
    }


    // =========================================================
    // LIMPAR FOTO
    // =========================================================

    function limparFoto() {

        setFotoCapturada(anterior => {

            if (anterior?.url) {
                URL.revokeObjectURL(anterior.url);
            }

            return null;
        });

        if (inputCameraRef.current) {
            inputCameraRef.current.value = "";
        }
    }


    // =========================================================
    // FOTO DA CÂMERA
    // =========================================================

    function selecionarFotoCamera(evento) {

        const arquivo =
            evento.target.files?.[0];

        if (!arquivo) {
            return;
        }

        if (!acessoAtivo()) {
            evento.target.value = "";
            return;
        }

        console.log(
            "[CELULAR FOTO] Foto capturada:",
            arquivo.name
        );

        limparFoto();

        setFotoCapturada({
            arquivo,
            url: URL.createObjectURL(arquivo)
        });

        setErro("");
        setSucesso("");

        rolarParaConfirmacao();
    }


    // =========================================================
    // GALERIA
    // =========================================================

    async function selecionarGaleria(evento) {

        const arquivos = Array.from(
            evento.target.files || []
        ).filter(
            arquivo =>
                arquivo.type.startsWith("image/")
        );

        if (!arquivos.length) {
            return;
        }

        if (!acessoAtivo()) {
            evento.target.value = "";
            return;
        }

        console.log(
            "[CELULAR FOTO] Imagens da galeria:",
            arquivos.length
        );

        await enviarArquivos(arquivos);

        evento.target.value = "";
    }


    // =========================================================
    // REMOVER FUNDO
    // COLOCAR FUNDO BRANCO
    // =========================================================

    async function criarImagemComFundoBranco(arquivo) {

        console.log(
            "[CELULAR FOTO] Removendo fundo..."
        );

        const recorte = await removeBackground(
            arquivo,
            {
                output: {
                    format: "image/png",
                    quality: 1
                }
            }
        );

        const urlRecorte =
            URL.createObjectURL(recorte);

        try {

            const imagem = await new Promise(
                (resolve, reject) => {

                    const img = new Image();

                    img.onload = () =>
                        resolve(img);

                    img.onerror = () =>
                        reject(
                            new Error(
                                "Não foi possível preparar a imagem."
                            )
                        );

                    img.src = urlRecorte;
                }
            );


            // =================================================
            // CANVAS
            // =================================================

            const canvas =
                document.createElement("canvas");

            canvas.width =
                imagem.naturalWidth;

            canvas.height =
                imagem.naturalHeight;

            const contexto =
                canvas.getContext("2d");

            if (!contexto) {
                throw new Error(
                    "Não foi possível processar a imagem."
                );
            }


            // =================================================
            // FUNDO BRANCO
            // =================================================

            contexto.fillStyle = "#ffffff";

            contexto.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            // =================================================
            // PRODUTO RECORTADO
            // =================================================

            contexto.drawImage(
                imagem,
                0,
                0
            );


            // =================================================
            // GERAR JPEG
            // =================================================

            const blobFinal =
                await new Promise(
                    (resolve, reject) => {

                        canvas.toBlob(
                            blob => {

                                if (blob) {
                                    resolve(blob);
                                    return;
                                }

                                reject(
                                    new Error(
                                        "Não foi possível finalizar a imagem."
                                    )
                                );
                            },
                            "image/jpeg",
                            0.94
                        );
                    }
                );


            console.log(
                "[CELULAR FOTO] Fundo removido."
            );


            return new File(
                [blobFinal],
                `produto-${Date.now()}.jpg`,
                {
                    type: "image/jpeg"
                }
            );

        } finally {

            URL.revokeObjectURL(
                urlRecorte
            );
        }
    }


    // =========================================================
    // USAR FOTO DA CÂMERA
    // =========================================================

    async function usarFoto() {

        if (
            !fotoCapturada?.arquivo ||
            processando ||
            enviando
        ) {
            return;
        }

        if (!acessoAtivo()) {
            return;
        }

        setProcessando(true);
        setErro("");
        setSucesso("");

        try {

            const fotoPronta =
                await criarImagemComFundoBranco(
                    fotoCapturada.arquivo
                );

            if (!acessoAtivo()) {
                return;
            }

            await enviarArquivos(
                [fotoPronta]
            );

            limparFoto();

        } catch (erroProcessamento) {

            console.error(
                "[CELULAR FOTO] Erro ao remover fundo:",
                erroProcessamento
            );

            setErro(
                erroProcessamento.message ||
                "Não foi possível remover o fundo. Tente novamente com boa iluminação."
            );

        } finally {

            setProcessando(false);
        }
    }


    // =========================================================
    // ENVIAR PARA BACKEND
    // =========================================================

    async function enviarArquivos(arquivos) {

        if (
            !arquivos?.length ||
            enviando
        ) {
            return;
        }

        if (!acessoAtivo()) {
            return;
        }

        setEnviando(true);
        setErro("");
        setSucesso("");

        try {

            const formData =
                new FormData();

            arquivos.forEach(arquivo => {

                formData.append(
                    "arquivos",
                    arquivo
                );
            });


            console.log(
                "[CELULAR FOTO] Enviando:",
                arquivos.length
            );


            const resposta = await fetch(
                `${API_URL}/upload/client/foto-produto-mobile/${encodeURIComponent(token)}/imagens`,
                {
                    method: "POST",
                    body: formData
                }
            );


            const dados = await resposta
                .json()
                .catch(() => ({}));


            console.log(
                "[CELULAR FOTO] Upload:",
                dados
            );


            if (!resposta.ok) {

                if (
                    resposta.status === 401 ||
                    resposta.status === 403 ||
                    resposta.status === 404 ||
                    resposta.status === 410
                ) {

                    setExpirado(true);
                    setSegundosRestantes(0);
                }

                throw new Error(
                    dados.detail ||
                    dados.mensagem ||
                    "Não foi possível enviar a foto."
                );
            }


            // =================================================
            // URLS RETORNADAS
            // =================================================

            const novasUrls = String(
                dados.urls ||
                dados.imagem_url ||
                ""
            )
                .split("|")
                .map(url => url.trim())
                .filter(Boolean);


            if (novasUrls.length) {

                setImagens(anterior => [
                    ...new Set([
                        ...anterior,
                        ...novasUrls
                    ])
                ]);
            }


            setSucesso(
                arquivos.length === 1
                    ? "Foto adicionada com sucesso."
                    : `${arquivos.length} fotos adicionadas com sucesso.`
            );


            // =================================================
            // SINCRONIZAR COM BANCO
            // =================================================

            await atualizarStatus();

            rolarParaImagens();

        } catch (erroUpload) {

            console.error(
                "[CELULAR FOTO] Erro no upload:",
                erroUpload
            );

            setErro(
                erroUpload.message ||
                "Não foi possível enviar a foto."
            );

        } finally {

            setEnviando(false);
        }
    }


    // =========================================================
    // ATUALIZAR STATUS
    // =========================================================

    async function atualizarStatus() {

        try {

            const resposta = await fetch(
                `${API_URL}/upload/client/foto-produto-mobile/${encodeURIComponent(token)}/status`
            );

            const dados = await resposta
                .json()
                .catch(() => ({}));

            console.log(
                "[CELULAR FOTO] Status:",
                dados
            );

            if (!resposta.ok) {
                return;
            }


            if (dados.produto) {

                setProduto(anterior => ({
                    ...(anterior || {}),
                    ...dados.produto
                }));
            }


            const imagemUrl =
                dados.produto?.imagem_url ??
                dados.imagem_url;

            if (
                imagemUrl !== undefined
            ) {

                const lista = String(
                    imagemUrl || ""
                )
                    .split("|")
                    .map(url => url.trim())
                    .filter(Boolean);

                setImagens(lista);
            }

        } catch (erroStatus) {

            console.error(
                "[CELULAR FOTO] Erro ao atualizar status:",
                erroStatus
            );
        }
    }


    // =========================================================
    // REFAZER FOTO
    // =========================================================

    function refazerFoto() {

        limparFoto();

        window.setTimeout(() => {

            rolarPara(
                areaPrincipalRef,
                {
                    atraso: 20,
                    margem: 74
                }
            );

            inputCameraRef.current?.click();

        }, 100);
    }


    // =========================================================
    // CARREGANDO
    // =========================================================

    if (carregando) {

        return (
            <main className="celular-foto-pagina">

                <div className="celular-foto-carregando">

                    <span className="celular-foto-spinner" />

                    <strong>
                        Preparando acesso...
                    </strong>

                    <span>
                        Aguarde um momento
                    </span>

                </div>

            </main>
        );
    }


    // =========================================================
    // LINK INVÁLIDO / EXPIRADO
    // =========================================================

    if (
        expirado &&
        !produto
    ) {

        return (
            <main className="celular-foto-pagina">

                <section className="celular-foto-expirado">

                    <div className="celular-foto-expirado-icone">
                        ⏱
                    </div>

                    <h1>
                        Acesso expirado
                    </h1>

                    <p>
                        Este link ficou disponível por apenas
                        5 minutos.
                    </p>

                    <p>
                        Volte ao computador e gere um novo
                        QR Code para continuar.
                    </p>

                </section>

            </main>
        );
    }


    // =========================================================
    // TELA
    // =========================================================

    return (

        <main
            ref={paginaRef}
            className="celular-foto-pagina"
        >


            {/* ================================================= */}
            {/* INPUT CÂMERA */}
            {/* ================================================= */}

            <input
                ref={inputCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={selecionarFotoCamera}
            />


            {/* ================================================= */}
            {/* INPUT GALERIA */}
            {/* ================================================= */}

            <input
                ref={inputGaleriaRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={selecionarGaleria}
            />


            <div className="celular-foto-container">


                {/* ================================================= */}
                {/* CABEÇALHO */}
                {/* ================================================= */}

                <header className="celular-foto-cabecalho">

                    <div className="celular-foto-marca">

                        <div className="celular-foto-marca-icone">
                            IE
                        </div>

                        <div className="celular-foto-marca-textos">

                            <strong>
                                IronExecutions
                            </strong>

                            <span>
                                Fotos do produto
                            </span>

                        </div>

                    </div>


                    {!expirado && (
                        <div className="celular-foto-tempo">

                            <span className="celular-foto-tempo-ponto" />

                            <strong>
                                {formatarTempo(
                                    segundosRestantes
                                )}
                            </strong>

                        </div>
                    )}

                </header>


                {/* ================================================= */}
                {/* PRODUTO */}
                {/* ================================================= */}

                {produto && (

                    <section
                        ref={produtoRef}
                        className="celular-foto-produto"
                    >

                        <span className="celular-foto-produto-label">
                            Adicionando fotos para
                        </span>

                        <h1 className="celular-foto-produto-nome">
                            {produto.nome || "Produto"}
                        </h1>

                        <div className="celular-foto-produto-detalhes">

                            {produto.categoria && (

                                <span className="celular-foto-produto-categoria">
                                    {produto.categoria}
                                </span>

                            )}

                            {formatarPreco(produto.preco) && (

                                <strong className="celular-foto-produto-preco">
                                    {formatarPreco(
                                        produto.preco
                                    )}
                                </strong>

                            )}

                        </div>

                    </section>
                )}


                {/* ================================================= */}
                {/* MENSAGENS */}
                {/* ================================================= */}

                {erro && (

                    <div className="celular-foto-mensagem celular-foto-mensagem-erro">
                        {erro}
                    </div>

                )}


                {sucesso && (

                    <div className="celular-foto-mensagem celular-foto-mensagem-sucesso">
                        ✓ {sucesso}
                    </div>

                )}


                {/* ================================================= */}
                {/* EXPIRADO */}
                {/* ================================================= */}

                {expirado ? (

                    <section className="celular-foto-expirado celular-foto-expirado-interno">

                        <div className="celular-foto-expirado-icone">
                            ⏱
                        </div>

                        <h2>
                            Tempo encerrado
                        </h2>

                        <p>
                            Este acesso expirou.
                        </p>

                        <p>
                            Gere um novo QR Code no computador
                            para adicionar mais fotos.
                        </p>

                    </section>

                ) : fotoCapturada ? (


                    /* ================================================= */
                    /* PREVIEW DA FOTO */
                    /* ================================================= */

                    <section
                        ref={confirmacaoRef}
                        className="celular-foto-confirmacao celular-foto-area-scroll"
                    >

                        <div className="celular-foto-confirmacao-topo">

                            <span className="celular-foto-etapa">
                                Foto capturada
                            </span>

                            <h2>
                                Confira a foto
                            </h2>

                            <p>
                                Ao continuar, o fundo será removido
                                automaticamente e ficará branco.
                            </p>

                        </div>


                        <div className="celular-foto-preview">

                            <img
                                src={fotoCapturada.url}
                                alt="Foto capturada do produto"
                            />


                            {processando && (

                                <div className="celular-foto-processando">

                                    <span className="celular-foto-spinner" />

                                    <strong>
                                        Removendo o fundo...
                                    </strong>

                                    <small>
                                        Aguarde alguns segundos
                                    </small>

                                </div>

                            )}

                        </div>


                        <div className="celular-foto-confirmacao-acoes">

                            <button
                                type="button"
                                className="celular-foto-botao-refazer"
                                disabled={
                                    processando ||
                                    enviando
                                }
                                onClick={refazerFoto}
                            >
                                Refazer foto
                            </button>


                            <button
                                type="button"
                                className="celular-foto-botao-usar"
                                disabled={
                                    processando ||
                                    enviando
                                }
                                onClick={usarFoto}
                            >

                                {processando
                                    ? "Removendo fundo..."
                                    : enviando
                                        ? "Enviando..."
                                        : "Usar esta foto"
                                }

                            </button>

                        </div>

                    </section>

                ) : (


                    /* ================================================= */
                    /* ESCOLHER FOTO */
                    /* ================================================= */

                    <section
                        ref={areaPrincipalRef}
                        className="celular-foto-adicionar celular-foto-area-scroll"
                    >

                        <div className="celular-foto-adicionar-topo">

                            <div className="celular-foto-camera-icone">
                                📷
                            </div>

                            <h2>
                                Adicione fotos do produto
                            </h2>

                            <p>
                                Fotografe o produto inteiro e use
                                um ambiente bem iluminado para obter
                                um recorte melhor.
                            </p>

                        </div>


                        {/* ================================================= */}
                        {/* TIRAR FOTO */}
                        {/* ================================================= */}

                        <button
                            type="button"
                            className="celular-foto-opcao celular-foto-opcao-camera"
                            disabled={enviando}
                            onClick={() =>
                                inputCameraRef.current?.click()
                            }
                        >

                            <span className="celular-foto-opcao-icone">
                                📸
                            </span>

                            <span className="celular-foto-opcao-conteudo">

                                <strong>
                                    Tirar foto
                                </strong>

                                <small>
                                    Fotografar, remover o fundo e deixar branco
                                </small>

                            </span>

                            <span className="celular-foto-opcao-seta">
                                ›
                            </span>

                        </button>


                        {/* ================================================= */}
                        {/* GALERIA */}
                        {/* ================================================= */}

                        <button
                            type="button"
                            className="celular-foto-opcao celular-foto-opcao-galeria"
                            disabled={enviando}
                            onClick={() =>
                                inputGaleriaRef.current?.click()
                            }
                        >

                            <span className="celular-foto-opcao-icone">
                                🖼️
                            </span>

                            <span className="celular-foto-opcao-conteudo">

                                <strong>
                                    Escolher da galeria
                                </strong>

                                <small>
                                    Selecione uma ou mais fotos
                                </small>

                            </span>

                            <span className="celular-foto-opcao-seta">
                                ›
                            </span>

                        </button>


                        {enviando && (

                            <div className="celular-foto-enviando">

                                <span className="celular-foto-spinner" />

                                <strong>
                                    Enviando fotos...
                                </strong>

                            </div>

                        )}

                    </section>

                )}


                {/* ================================================= */}
                {/* FOTOS JÁ ADICIONADAS */}
                {/* ================================================= */}

                {imagens.length > 0 && (

                    <section
                        ref={imagensRef}
                        className="celular-foto-imagens celular-foto-area-scroll"
                    >

                        <div className="celular-foto-imagens-topo">

                            <div>

                                <span className="celular-foto-imagens-label">
                                    Fotos adicionadas
                                </span>

                                <h2>
                                    {imagens.length}{" "}
                                    {imagens.length === 1
                                        ? "foto"
                                        : "fotos"
                                    }
                                </h2>

                            </div>

                            <span className="celular-foto-imagens-check">
                                ✓
                            </span>

                        </div>


                        <div className="celular-foto-imagens-grid">

                            {imagens.map(
                                (imagem, index) => (

                                    <div
                                        className="celular-foto-imagem-card"
                                        key={`${imagem}-${index}`}
                                    >

                                        <img
                                            src={imagem}
                                            alt={`Foto ${index + 1} do produto`}
                                        />

                                        <span className="celular-foto-imagem-numero">
                                            {index + 1}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </section>

                )}


                {/* ================================================= */}
                {/* VOLTAR AO TOPO */}
                {/* ================================================= */}

                {(imagens.length > 3 || fotoCapturada) && (

                    <button
                        type="button"
                        className="celular-foto-voltar-topo"
                        onClick={rolarParaTopo}
                        aria-label="Voltar ao topo"
                    >
                        <span aria-hidden="true">↑</span>
                    </button>

                )}


                {/* ================================================= */}
                {/* RODAPÉ */}
                {/* ================================================= */}

                <footer className="celular-foto-rodape">

                    <span>
                        🔒
                    </span>

                    <p>
                        Acesso temporário protegido pela
                        IronExecutions.
                    </p>

                </footer>

            </div>

        </main>
    );
}