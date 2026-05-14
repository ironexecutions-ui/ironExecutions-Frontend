import React, { useMemo, useState } from "react";
import { API_URL } from "../config";
import "./codigo.css";
import { Html5Qrcode } from "html5-qrcode";
export default function Codigo() {

    const [copiadoId, setCopiadoId] = useState(null);

    const [produtoApagarId, setProdutoApagarId] = useState(null);

    const [editandoPrecoId, setEditandoPrecoId] = useState(null);

    const [novoPreco, setNovoPreco] = useState("");
    const [cameraAberta, setCameraAberta] = useState(false);
    const [scannerAtivo, setScannerAtivo] = useState(null);
    const [senha, setSenha] = useState("");
    const [autorizado, setAutorizado] = useState(false);

    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState("");

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

            setProdutos(Array.isArray(data) ? data : []);

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
    const abrirScanner = async () => {

        try {

            setCameraAberta(true);

            setTimeout(async () => {

                try {

                    const scanner = new Html5Qrcode("reader");

                    setScannerAtivo(scanner);

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
                        (codigoLido) => {

                            setBusca(codigoLido);

                            fecharScanner();

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

                await scannerAtivo.stop();

                await scannerAtivo.clear();

            }

        } catch (err) {

            console.log(err);

        }

        setCameraAberta(false);

        setScannerAtivo(null);
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
                            <div className="codigoAreaImagem">

                                {imagens.length > 0 ? (

                                    <img
                                        src={imagens[0]}
                                        alt={produto.nome}
                                        className="codigoImagemProduto"
                                    />

                                ) : (

                                    <div className="codigoSemImagem">
                                        Sem imagem
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

        </div>

    );
}