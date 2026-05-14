import React, { useMemo, useState } from "react";
import { API_URL } from "../config";
import "./codigo.css";
import { Html5Qrcode } from "html5-qrcode";
export default function Codigo() {

    const [copiadoId, setCopiadoId] = useState(null);

    const [produtoApagarId, setProdutoApagarId] = useState(null);

    const [editandoPrecoId, setEditandoPrecoId] = useState(null);
    const [uploadandoImagemId, setUploadandoImagemId] = useState(null);
    const [novoPreco, setNovoPreco] = useState("");
    const [cameraAberta, setCameraAberta] = useState(false);
    const [scannerAtivo, setScannerAtivo] = useState(null);
    const [senha, setSenha] = useState("");
    const [autorizado, setAutorizado] = useState(false);
    const [editandoQuantidadeId, setEditandoQuantidadeId] = useState(null);
    const [modalImagens, setModalImagens] = useState(false);

    const [produtoModal, setProdutoModal] = useState(null);

    const [imagensModal, setImagensModal] = useState([]);
    const [novaQuantidade, setNovaQuantidade] = useState("");
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState("");
    // =========================
    // ENVIAR IMAGENS
    // =========================
    const enviarImagens = async (
        produtoId,
        files
    ) => {

        try {

            if (!files || files.length === 0) {
                return;
            }

            setUploadandoImagemId(produtoId);

            const formData = new FormData();

            Array.from(files).forEach((file) => {

                formData.append(
                    "arquivos",
                    file
                );

            });

            const res = await fetch(
                `${API_URL}/produtos-servicos/${produtoId}/imagens`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();

            setProdutos(prev =>
                prev.map(produto => {

                    if (produto.id === produtoId) {

                        return {
                            ...produto,
                            imagem_url: data.urls
                        };

                    }

                    return produto;

                })
            );

            // 🔥 ATUALIZA MODAL
            if (
                produtoModal &&
                produtoModal.id === produtoId
            ) {

                const imagensAtualizadas =
                    data.urls
                        ? data.urls
                            .split("|")
                            .map(img => img.trim())
                            .filter(img => img !== "")
                        : [];

                setImagensModal(
                    imagensAtualizadas
                );

                setProdutoModal(prev => ({
                    ...prev,
                    imagem_url: data.urls
                }));

            }

        } catch (err) {

            console.log(err);

        } finally {

            setUploadandoImagemId(null);

        }
    };

    // =========================
    // ABRIR MODAL IMAGENS
    // =========================
    const abrirModalImagens = (produto) => {

        const imagens = produto.imagem_url
            ? produto.imagem_url
                .split("|")
                .map(img => img.trim())
                .filter(img => img !== "")
            : [];

        setProdutoModal(produto);

        setImagensModal(imagens);

        setModalImagens(true);
    };
    // =========================
    // APAGAR IMAGEM
    // =========================
    const apagarImagem = async (
        produtoId,
        url
    ) => {

        try {

            const res = await fetch(
                `${API_URL}/produtos-servicos/${produtoId}/imagem`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        url
                    })
                }
            );

            const data = await res.json();

            setProdutos(prev =>
                prev.map(produto => {

                    if (produto.id === produtoId) {

                        return {
                            ...produto,
                            imagem_url: data.urls
                        };

                    }

                    return produto;

                })
            );

        } catch (err) {

            console.log(err);

        }
    };
    // =========================
    // VERIFICAR SENHA
    // =========================
    const verificarSenha = async () => {

        try {

            const res = await fetch(`${API_URL}/verificar-senha-produtos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    senha
                })
            });

            const data = await res.json();

            if (data.autorizado) {

                setAutorizado(true);

                carregarProdutos();

            }

        } catch (err) {

            console.log(err);

        }
    };

    // =========================
    // CARREGAR PRODUTOS
    // =========================
    const carregarProdutos = async () => {

        try {

            const res = await fetch(`${API_URL}/produtos-servicos`);

            const data = await res.json();
            const token = localStorage.getItem("token");

            const estoqueRes = await fetch(
                `${API_URL}/admin/contabilidade/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const estoqueData = await estoqueRes.json();

            const mapaEstoque = {};

            (estoqueData.produtos || []).forEach((item) => {

                mapaEstoque[item.id] = item;

            });

            const produtosComEstoque = (Array.isArray(data)
                ? data
                : []
            ).map((produto) => {

                const estoque = mapaEstoque[produto.id];

                return {
                    ...produto,
                    quantidade: estoque?.quantidade || 0,
                    negativo: estoque?.negativo || false
                };

            });

            setProdutos(produtosComEstoque);

            return;

        } catch (err) {

            console.log(err);

        }
    };
    // =========================
    // SALVAR QUANTIDADE
    // =========================
    const salvarQuantidade = async (produtoId) => {

        try {

            const token = localStorage.getItem("token");

            const quantidadeNumerica =
                parseInt(novaQuantidade);

            if (isNaN(quantidadeNumerica)) {
                return;
            }

            await fetch(
                `${API_URL}/admin/contabilidade/ajustar`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        produto_id: produtoId,
                        quantos: quantidadeNumerica
                    })
                }
            );

            setProdutos(prev =>
                prev.map(produto => {

                    if (produto.id === produtoId) {

                        const novaQtd =
                            Number(produto.quantidade || 0)
                            + quantidadeNumerica;

                        return {
                            ...produto,
                            quantidade: novaQtd,
                            negativo: novaQtd < 0
                        };

                    }

                    return produto;

                })
            );

            setNovaQuantidade("");

            setEditandoQuantidadeId(null);

        } catch (err) {

            console.log(err);

        }
    };
    // =========================
    // FILTRO
    // =========================
    const produtosFiltrados = useMemo(() => {

        return produtos.filter((produto) => {

            const buscaLower = busca.toLowerCase();

            return (
                produto.nome?.toLowerCase().includes(buscaLower) ||
                produto.codigo_barras?.toLowerCase().includes(buscaLower)
            );

        });

    }, [produtos, busca]);

    // =========================
    // COPIAR
    // =========================
    const copiarCodigo = async (codigo, id) => {

        try {

            await navigator.clipboard.writeText(String(codigo));

            setCopiadoId(id);

            setTimeout(() => {
                setCopiadoId(null);
            }, 3000);

        } catch (err) {

            console.log(err);

        }
    };

    // =========================
    // APAGAR
    // =========================
    const apagarProduto = async (produto) => {

        // 🔥 PRIMEIRO CLIQUE
        if (produtoApagarId !== produto.id) {

            setProdutoApagarId(produto.id);

            setTimeout(() => {
                setProdutoApagarId(null);
            }, 3000);

            return;
        }

        // 🔥 SEGUNDO CLIQUE
        try {

            await fetch(`${API_URL}/produtos-servicos/${produto.id}`, {
                method: "DELETE"
            });

            setProdutos(prev =>
                prev.filter(p => p.id !== produto.id)
            );

            setProdutoApagarId(null);

        } catch (err) {

            console.log(err);

        }
    };

    // =========================
    // SALVAR PREÇO
    // =========================
    const salvarPreco = async (produtoId) => {

        try {

            const precoNumerico = Number(
                String(novoPreco).replace(",", ".")
            );

            if (isNaN(precoNumerico)) return;

            await fetch(
                `${API_URL}/produtos-servicos/${produtoId}/preco`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        preco: precoNumerico
                    })
                }
            );

            setProdutos(prev =>
                prev.map(produto => {

                    if (produto.id === produtoId) {

                        return {
                            ...produto,
                            preco: precoNumerico
                        };

                    }

                    return produto;

                })
            );

            setEditandoPrecoId(null);

        } catch (err) {

            console.log(err);

        }
    };
    // =========================
    // ABRIR CAMERA
    // =========================
    // =========================
    // ABRIR CAMERA
    // =========================
    const abrirScanner = async () => {

        try {

            // 🔥 NÃO ABRE 2 VEZES
            if (cameraAberta) return;

            setCameraAberta(true);

            setTimeout(async () => {

                try {

                    const scanner = new Html5Qrcode("reader");

                    setScannerAtivo(scanner);

                    let leuCodigo = false;

                    await scanner.start(
                        {
                            facingMode: "environment"
                        },
                        {
                            fps: 10,
                            qrbox: {
                                width: 250,
                                height: 120
                            }
                        },

                        async (codigoLido) => {

                            // 🔥 IMPEDE LEITURA DUPLA
                            if (leuCodigo) return;

                            leuCodigo = true;

                            // 🔥 MANTÉM O CÓDIGO
                            setBusca(String(codigoLido));

                            // 🔥 FECHA DIRETO
                            await fecharScanner();

                        },

                        () => { }
                    );

                } catch (err) {

                    console.log(err);

                }

            }, 300);

        } catch (err) {

            console.log(err);

        }
    };

    // =========================
    // FECHAR CAMERA
    // =========================
    const fecharScanner = async () => {

        try {

            if (scannerAtivo) {

                try {

                    await scannerAtivo.stop();

                } catch { }

                try {

                    await scannerAtivo.clear();

                } catch { }

            }

        } catch (err) {

            console.log(err);

        }

        setScannerAtivo(null);

        setCameraAberta(false);
    };
    // =========================
    // SENHA
    // =========================
    if (!autorizado) {

        return (

            <div className="codigoSenhaContainer">

                <div className="codigoSenhaCard">

                    <h1 className="codigoSenhaTitulo">
                        Área Protegida
                    </h1>

                    <input
                        type="password"
                        placeholder="Digite a senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="codigoSenhaInput"
                    />

                    <button
                        onClick={verificarSenha}
                        className="codigoSenhaBotao"
                    >
                        Entrar
                    </button>

                </div>

            </div>

        );
    }

    // =========================
    // LISTA
    // =========================
    return (

        <div className="codigoRoot">

            <div className="codigoTopo">

                <h1 className="codigoTitulo">
                    Lista de Produtos
                </h1>

                <div className="codigoBuscaArea">

                    <input
                        type="text"
                        placeholder="Buscar produto ou código..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="codigoBuscaInput"
                    />

                    {busca && (

                        <button
                            onClick={() => {

                                // 🔥 LIMPA MANUALMENTE
                                setBusca("");

                            }}
                            className="codigoLimparBuscaBotao"
                        >
                            ✕
                        </button>

                    )}

                    <button
                        onClick={abrirScanner}
                        className="codigoCameraBotao"
                    >
                        📷
                    </button>

                </div>

                {cameraAberta && (

                    <div className="codigoScannerModal">

                        <div className="codigoScannerCard">

                            <div
                                id="reader"
                                className="codigoReader"
                            />

                            <button
                                onClick={fecharScanner}
                                className="codigoFecharScanner"
                            >
                                Fechar
                            </button>

                        </div>

                    </div>

                )}
            </div>

            <div className="codigoLista">

                {produtosFiltrados.map((produto) => {

                    const imagens = produto.imagem_url
                        ? produto.imagem_url
                            .split("|")
                            .map(img => img.trim())
                            .filter(img => img !== "")
                        : [];

                    return (

                        <div
                            key={produto.id}
                            className="codigoCardProduto"
                        >

                            {/* IMAGEM */}
                            <div
                                className="codigoAreaImagem"

                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}

                                onDrop={(e) => {

                                    e.preventDefault();

                                    enviarImagens(
                                        produto.id,
                                        e.dataTransfer.files
                                    );

                                }}
                            >

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"

                                    capture="environment"

                                    id={`upload-${produto.id}`}

                                    style={{
                                        display: "none"
                                    }}

                                    onChange={(e) => {

                                        enviarImagens(
                                            produto.id,
                                            e.target.files
                                        );

                                    }}
                                />

                                {imagens.length > 0 ? (

                                    <div className="codigoImagemContainer">

                                        <img
                                            src={imagens[0]}
                                            alt={produto.nome}
                                            className="codigoImagemProduto"

                                            onClick={() => abrirModalImagens(produto)}
                                        />

                                        <button
                                            className="codigoTrocarImagemBotao"

                                            onClick={() => {

                                                document
                                                    .getElementById(
                                                        `upload-${produto.id}`
                                                    )
                                                    ?.click();

                                            }}
                                        >
                                            📷
                                        </button>

                                    </div>

                                ) : (

                                    <div
                                        className="codigoSemImagem"

                                        onClick={() => {

                                            document
                                                .getElementById(
                                                    `upload-${produto.id}`
                                                )
                                                ?.click();

                                        }}
                                    >

                                        {uploadandoImagemId === produto.id
                                            ? "Enviando..."
                                            : "Adicionar imagem"}

                                    </div>

                                )}

                            </div>

                            {/* INFOS */}
                            <div className="codigoInfosProduto">

                                <h2 className="codigoNomeProduto">
                                    {produto.nome}
                                </h2>

                                <p className="codigoNumeroBarras">
                                    Código: {produto.codigo_barras}
                                </p>

                                {editandoPrecoId === produto.id ? (

                                    <div className="codigoEditarPrecoArea">

                                        <input
                                            type="text"
                                            value={novoPreco}
                                            onChange={(e) =>
                                                setNovoPreco(e.target.value)
                                            }
                                            className="codigoInputPreco"
                                        />

                                        <button
                                            onClick={() =>
                                                salvarPreco(produto.id)
                                            }
                                            className="codigoSalvarPrecoBotao"
                                        >
                                            Salvar
                                        </button>

                                    </div>

                                ) : (

                                    <p
                                        className="codigoPrecoProduto"
                                        onClick={() => {

                                            setEditandoPrecoId(produto.id);

                                            setNovoPreco(
                                                produto.preco || 0
                                            );

                                        }}
                                    >
                                        R$ {Number(
                                            produto.preco || 0
                                        ).toFixed(2)}
                                    </p>

                                )}
                                {editandoQuantidadeId === produto.id ? (

                                    <div className="codigoEditarQuantidadeArea">

                                        <input
                                            type="number"
                                            value={novaQuantidade}
                                            onChange={(e) =>
                                                setNovaQuantidade(e.target.value)
                                            }
                                            placeholder="+10 ou -5"
                                            className="codigoInputQuantidade"
                                        />

                                        <button
                                            onClick={() =>
                                                salvarQuantidade(produto.id)
                                            }
                                            className="codigoSalvarQuantidadeBotao"
                                        >
                                            Salvar
                                        </button>

                                    </div>

                                ) : (

                                    <p
                                        onClick={() => {

                                            setEditandoQuantidadeId(produto.id);

                                            setNovaQuantidade("");

                                        }}
                                        className={
                                            produto.negativo ? "codigoQuantidadeNegativa"
                                                : "codigoQuantidadeProduto"
                                        }
                                    >
                                        Estoque: {produto.quantidade || 0}
                                    </p>

                                )}
                            </div>

                            {/* BOTÕES */}
                            <div className="codigoAreaBotoes">

                                <button
                                    onClick={() =>
                                        copiarCodigo(
                                            produto.codigo_barras,
                                            produto.id
                                        )
                                    }
                                    className="codigoCopiarBotao"
                                >
                                    {copiadoId === produto.id
                                        ? "Copiado"
                                        : "Copiar"}
                                </button>

                                <button
                                    onClick={() => apagarProduto(produto)}
                                    className="codigoApagarBotao"
                                >
                                    {produtoApagarId === produto.id
                                        ? "Confirmar"
                                        : "Apagar"}
                                </button>

                            </div>

                        </div>

                    );

                })}

            </div>
            {modalImagens && produtoModal && (

                <div
                    className="codigoModalImagensOverlay"

                    onClick={() => {

                        setModalImagens(false);

                    }}
                >

                    <div
                        className="codigoModalImagens"

                        onClick={(e) => {
                            e.stopPropagation();
                        }}

                        onDragOver={(e) => {
                            e.preventDefault();
                        }}

                        onDrop={(e) => {

                            e.preventDefault();

                            enviarImagens(
                                produtoModal.id,
                                e.dataTransfer.files
                            );

                            setTimeout(() => {

                                carregarProdutos();

                            }, 1000);

                        }}
                    >

                        <div className="codigoModalTopo">

                            <h2 className="codigoModalTitulo">
                                Imagens do Produto
                            </h2>

                            <button
                                className="codigoFecharModal"

                                onClick={() => {

                                    setModalImagens(false);

                                }}
                            >
                                ✕
                            </button>

                        </div>

                        <input
                            type="file"
                            multiple
                            accept="image/*"

                            capture="environment"

                            id="upload-modal-imagens"

                            style={{
                                display: "none"
                            }}

                            onChange={(e) => {

                                enviarImagens(
                                    produtoModal.id,
                                    e.target.files
                                );

                                setTimeout(() => {

                                    carregarProdutos();

                                }, 1000);

                            }}
                        />

                        <button
                            className="codigoAdicionarImagemModal"

                            onClick={() => {

                                document
                                    .getElementById(
                                        "upload-modal-imagens"
                                    )
                                    ?.click();

                            }}
                        >
                            📷 Adicionar imagens
                        </button>

                        <div className="codigoGridImagensModal">

                            {imagensModal.length > 0 ? (

                                imagensModal.map((img, index) => (

                                    <div
                                        key={index}
                                        className="codigoItemImagemModal"
                                    >

                                        <img
                                            src={img}
                                            alt=""
                                            className="codigoImagemModal"
                                        />

                                        <button
                                            className="codigoApagarImagemModal"

                                            onClick={async () => {

                                                await apagarImagem(
                                                    produtoModal.id,
                                                    img
                                                );

                                                setImagensModal(prev =>
                                                    prev.filter(
                                                        i => i !== img
                                                    )
                                                );

                                                carregarProdutos();

                                            }}
                                        >
                                            Apagar
                                        </button>

                                    </div>

                                ))

                            ) : (

                                <div className="codigoSemImagemModal">
                                    Nenhuma imagem
                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}
        </div >

    );
}