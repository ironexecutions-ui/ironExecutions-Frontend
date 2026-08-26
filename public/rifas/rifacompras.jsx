import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./rifacompras.css";
import { API_URL } from "../../config";
import ModalPagamento from "./modalpagamento";

export default function RifaCompras() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fotoAtualRifa, setFotoAtualRifa] = useState(0);
    const [fotoAnteriorRifa, setFotoAnteriorRifa] = useState(null);
    const [animandoFotoRifa, setAnimandoFotoRifa] = useState(false);
    const [rifaId, setRifaId] = useState("");
    const [rifa, setRifa] = useState(null);
    const [comprados, setComprados] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultadoRifa, setResultadoRifa] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [etapa, setEtapa] = useState("dados"); // dados | confirmacao | pix
    const [pix, setPix] = useState(null);
    const [compraId, setCompraId] = useState(null);
    const [form, setForm] = useState({
        nome: "",
        email: "",
        whatsapp: "",
        mensagem: ""
    });
    useEffect(() => {
        if (!rifa?.fotos || rifa.fotos.length <= 1) {
            return;
        }

        const intervaloFotos = setInterval(() => {
            setFotoAtualRifa(atual => {
                let proxima = atual;

                while (
                    proxima === atual &&
                    rifa.fotos.length > 1
                ) {
                    proxima = Math.floor(
                        Math.random() * rifa.fotos.length
                    );
                }

                setFotoAnteriorRifa(atual);
                setAnimandoFotoRifa(true);

                setTimeout(() => {
                    setFotoAnteriorRifa(null);
                    setAnimandoFotoRifa(false);
                }, 650);

                return proxima;
            });
        }, 3000);

        return () => {
            clearInterval(intervaloFotos);
        };
    }, [rifa?.fotos]);
    // ===============================
    // SINCRONIZAR URL -> INPUT
    // ===============================
    useEffect(() => {
        if (id) {
            setRifaId(id);
        }
    }, [id]);

    // ===============================
    // BUSCAR AUTOMATICAMENTE SE VIER DA URL
    // ===============================
    useEffect(() => {
        if (rifaId) {
            buscarRifa();
        }
    }, [rifaId]);
    function formatarDataHora(data) {
        if (!data) return null;

        const d = new Date(data);

        const dataFormatada = d.toLocaleDateString("pt-BR");
        const horaFormatada = d.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        return `${dataFormatada} às ${horaFormatada}`;
    }


    // ===============================
    // BUSCAR RIFA
    // ===============================
    async function buscarRifa() {
        setErro("");
        setRifa(null);
        setResultadoRifa(null);
        setSelecionados([]);
        setComprados([]);

        if (!rifaId) {
            setErro("Informe o ID da rifa");
            return;
        }

        try {
            setLoading(true);

            // ===============================
            // RIFA
            // ===============================

            const r = await fetch(
                `${API_URL}/rifa/${rifaId}`
            );

            if (!r.ok) {
                throw new Error();
            }

            const data = await r.json();

            setRifa(data);


            // ===============================
            // NÚMEROS COMPRADOS
            // ===============================

            const c = await fetch(
                `${API_URL}/rifa/${rifaId}/comprados`
            );

            if (c.ok) {
                const nums = await c.json();

                setComprados(
                    Array.isArray(nums)
                        ? nums
                        : []
                );
            }


            // ===============================
            // RESULTADO OFICIAL
            // ===============================

            const respostaResultado = await fetch(
                `${API_URL}/rifa/${rifaId}/resultado`
            );

            if (respostaResultado.ok) {
                const resultado =
                    await respostaResultado.json();

                console.log(
                    "[RIFA] Resultado oficial:",
                    resultado
                );

                if (resultado?.sorteado) {
                    setResultadoRifa(resultado);
                }
            }

        } catch (erro) {

            console.error(
                "[RIFA] Erro ao carregar:",
                erro
            );

            setErro(
                "Rifa não encontrada"
            );

        } finally {

            setLoading(false);
        }
    }
    function abrirWhatsApp(numero) {
        if (!numero) return;

        const limpo = numero.replace(/\D/g, "");
        const url = `https://wa.me/${limpo}`;
        window.open(url, "_blank");
    }

    async function copiarEmail(email) {
        if (!email) return;

        try {
            await navigator.clipboard.writeText(email);
            alert("Email copiado para a área de transferência");
        } catch {
            alert("Não foi possível copiar o email");
        }
    }

    // ===============================
    // GERAR NÚMEROS
    // ===============================
    const numerosOrdenados = useMemo(() => {
        if (!rifa?.numeros) return [];
        const [inicio, fim] = rifa.numeros.split("-").map(Number);
        return Array.from(
            { length: fim - inicio + 1 },
            (_, i) => inicio + i
        );
    }, [rifa]);
    const estaFinalizada = rifa?.data_fim
        ? rifaFinalizada(rifa.data_fim)
        : false;

    // ===============================
    // SELEÇÃO DE NÚMEROS
    // ===============================
    function toggleNumero(n) {
        if (comprados.includes(n)) return;

        setSelecionados(prev =>
            prev.includes(n)
                ? prev.filter(x => x !== n)
                : [...prev, n]
        );
    }

    // ===============================
    // TOTAL
    // ===============================
    const total = rifa
        ? (selecionados.length * rifa.preco).toFixed(2)
        : "0.00";

    // ===============================
    // VALIDAÇÃO
    // ===============================
    function validarFormulario() {
        if (!form.nome || !form.email || !form.whatsapp) {
            alert("Preencha nome, email e WhatsApp");
            return false;
        }

        if (selecionados.length === 0) {
            alert("Selecione pelo menos um número");
            return false;
        }

        return true;
    }

    // ===============================
    // CONFIRMAR PAGAMENTO
    // ===============================
    // ===============================
    // CRIAR COMPRA
    // ===============================

    async function criarCompra() {

        if (!validarFormulario()) {
            return null;
        }

        // Se a compra já foi criada neste fluxo,
        // não cria outra novamente.
        if (compraId) {
            return {
                compra_id: compraId,
                total: Number(total)
            };
        }

        const resposta = await fetch(
            `${API_URL}/rifa/${rifa.id}/comprar`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    numeros: selecionados,
                    ...form
                })
            }
        );

        const json = await resposta.json();

        if (!resposta.ok) {

            const detail = json?.detail;

            if (
                detail &&
                typeof detail === "object" &&
                detail.erro === "NUMEROS_INDISPONIVEIS"
            ) {

                throw new Error(
                    `Números indisponíveis: ${(detail.numeros || []).join(", ")
                    }`
                );
            }

            throw new Error(
                typeof detail === "string"
                    ? detail
                    : "Não foi possível criar a compra"
            );
        }

        setCompraId(
            json.compra_id
        );

        return json;
    }


    // ===============================
    // PAGAMENTO PIX
    // ===============================

    async function confirmarPagamento() {

        try {

            setLoading(true);

            const compra =
                await criarCompra();

            if (!compra) {
                return;
            }

            const resposta = await fetch(
                `${API_URL}/rifa/${rifa.id}/pagamento/pix`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        compra_id:
                            compra.compra_id
                    })
                }
            );

            const json =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    typeof json?.detail === "string"
                        ? json.detail
                        : "Erro ao gerar PIX"
                );
            }

            setPix(json);

            setEtapa(
                "pix"
            );

        } catch (erro) {

            console.error(
                "[PAGAMENTO PIX]",
                erro
            );

            alert(
                erro.message ||
                "Erro ao iniciar pagamento"
            );

        } finally {

            setLoading(false);
        }
    }
    // ===============================
    // PREPARAR PAGAMENTO COM CARTÃO
    // ===============================

    async function prepararPagamentoCartao() {

        try {

            setLoading(true);

            const compra =
                await criarCompra();

            if (!compra) {
                return false;
            }

            setCompraId(
                compra.compra_id
            );

            setEtapa(
                "cartao"
            );

            return true;

        } catch (erro) {

            console.error(
                "[PAGAMENTO CARTÃO]",
                erro
            );

            alert(
                erro.message ||
                "Não foi possível iniciar o pagamento com cartão"
            );

            return false;

        } finally {

            setLoading(false);
        }
    }
    function rifaFinalizada(dataFim) {
        if (!dataFim) return false;

        const dataFimISO = dataFim.replace(" ", "T") + "-03:00";
        const agora = new Date();
        const fim = new Date(dataFimISO);

        return agora >= fim;
    }

    return (
        <div className="rif-compra-container">
            <h2 className="rif-titulo">Comprar Rifa</h2>

            <div
                style={{ display: "none" }} className="rif-busca">
                <input
                    type="number"
                    className="rif-busca-input"
                    placeholder="Digite o ID da rifa"
                    value={rifaId}
                    onChange={e => setRifaId(e.target.value)}
                />
                <button
                    className="rif-busca-btn"
                    onClick={() => {
                        if (!rifaId) {
                            setErro("Informe o ID da rifa");
                            return;
                        }
                        navigate(`/rifa-compras/${rifaId}`);
                    }}
                    disabled={loading}
                >
                    {loading ? "Buscando..." : "Buscar"}
                </button>
            </div>

            {erro && <p className="rif-erro">{erro}</p>}

            {rifa && estaFinalizada && (
                <div className="rif-resultado">

                    {resultadoRifa?.sorteado ? (

                        resultadoRifa.sem_ganhador ? (

                            <>
                                <h3 className="rif-ganhador-titulo">
                                    Resultado da Rifa
                                </h3>

                                <p className="rif-ganhador-numero">
                                    Número sorteado: {resultadoRifa.numero}
                                </p>

                                <p className="rif-ganhador-sem">
                                    O número sorteado não havia sido adquirido, portanto não houve ganhador nesta rifa.
                                </p>
                            </>

                        ) : (

                            <>
                                <h3 className="rif-ganhador-titulo">
                                    Ganhador da Rifa
                                </h3>

                                <p className="rif-ganhador-nome">
                                    {resultadoRifa.nome}
                                </p>

                                <p className="rif-ganhador-numero">
                                    Número sorteado: {resultadoRifa.numero}
                                </p>
                            </>

                        )

                    ) : (

                        <>
                            <h3 className="rif-ganhador-titulo">
                                Rifa encerrada
                            </h3>

                            <p className="rif-ganhador-sem">
                                A rifa foi encerrada e o resultado do sorteio ainda não está disponível.
                            </p>
                        </>

                    )}

                </div>
            )}


            {rifa && !estaFinalizada && (
                <>
                    <h3 className="rif-nome">{rifa.nome}</h3>

                    {rifa.premio && (
                        <div className="rif-premio">
                            <strong>Prêmio:</strong> {rifa.premio}
                        </div>
                    )}

                    {rifa.data_fim && (
                        <div className="rif-data-fim">
                            <strong>Data final da rifa:</strong> {formatarDataHora(rifa.data_fim)}
                        </div>
                    )}

                    <div className="rif-vitrine-premio-interativa">

                        <div className="rif-vitrine-premio-viewport">

                            {fotoAnteriorRifa !== null && (
                                <img
                                    key={`anterior-${fotoAnteriorRifa}`}
                                    src={rifa.fotos[fotoAnteriorRifa]}
                                    alt="Prêmio da rifa"
                                    className="
                    rif-vitrine-imagem-premio
                    rif-vitrine-imagem-saindo
                "
                                />
                            )}

                            <img
                                key={`atual-${fotoAtualRifa}`}
                                src={rifa.fotos[fotoAtualRifa]}
                                alt="Prêmio da rifa"
                                className={`
                rif-vitrine-imagem-premio
                ${animandoFotoRifa
                                        ? "rif-vitrine-imagem-entrando"
                                        : "rif-vitrine-imagem-estatica"
                                    }
            `}
                            />

                            <div className="rif-vitrine-sombra-interna" />

                        </div>

                        {rifa.fotos.length > 1 && (
                            <div className="rif-vitrine-indicadores">
                                {rifa.fotos.map((_, indice) => (
                                    <button
                                        key={indice}
                                        type="button"
                                        aria-label={`Ver imagem ${indice + 1}`}
                                        className={`
                        rif-vitrine-indicador
                        ${indice === fotoAtualRifa
                                                ? "rif-vitrine-indicador-ativo"
                                                : ""
                                            }
                    `}
                                        onClick={() => {
                                            if (indice === fotoAtualRifa) {
                                                return;
                                            }

                                            setFotoAnteriorRifa(fotoAtualRifa);
                                            setFotoAtualRifa(indice);
                                            setAnimandoFotoRifa(true);

                                            setTimeout(() => {
                                                setFotoAnteriorRifa(null);
                                                setAnimandoFotoRifa(false);
                                            }, 650);
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                    </div>

                    <p className="rif-info">
                        Preço por número: R$ {rifa.preco}
                    </p>

                    {rifa?.comercio && (
                        <div className="rif-comercio">
                            {rifa.comercio.imagem && (
                                <img
                                    src={rifa.comercio.imagem}
                                    alt={rifa.comercio.loja}
                                    className="rif-comercio-logo"
                                />
                            )}

                            <div className="rif-comercio-info">
                                <p className="rif-comercio-nome">
                                    Rifa realizada por <strong>{rifa.comercio.loja}</strong>
                                </p>

                                {rifa.comercio.email && (
                                    <p
                                        className="rif-comercio-contato rif-comercio-link"
                                        onClick={() => copiarEmail(rifa.comercio.email)}
                                    >
                                        Email: {rifa.comercio.email}
                                    </p>
                                )}

                                {rifa.comercio.celular && (
                                    <p
                                        className="rif-comercio-contato rif-comercio-link"
                                        onClick={() => abrirWhatsApp(rifa.comercio.celular)}
                                    >
                                        WhatsApp: {rifa.comercio.celular}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="rif-numeros">
                        {numerosOrdenados.map(n => (
                            <div
                                key={n}
                                className={`rif-numero
                        ${comprados.includes(n) ? "rif-comprado" : ""}
                        ${selecionados.includes(n) ? "rif-selecionado" : ""}
                    `}
                                onClick={() => toggleNumero(n)}
                            >
                                {n}
                            </div>
                        ))}
                    </div>

                    {selecionados.length > 0 && (
                        <button
                            className="rif-comprar-btn"
                            onClick={() => {
                                setForm({
                                    nome: "",
                                    email: "",
                                    whatsapp: "",
                                    mensagem: ""
                                });
                                setPix(null);
                                setEtapa("dados");
                                setModalAberto(true);
                            }}
                        >
                            Comprar ({selecionados.length}) | R$ {total}
                        </button>
                    )}
                </>
            )}


            <ModalPagamento
                aberto={modalAberto}
                etapa={etapa}
                setEtapa={setEtapa}

                pix={pix}

                rifaId={rifa?.id}
                compraId={compraId}

                onFechar={() => {
                    setModalAberto(false);
                }}

                onConfirmarPagamento={
                    confirmarPagamento
                }

                onPrepararCartao={
                    prepararPagamentoCartao
                }

                selecionados={
                    selecionados
                }

                total={
                    total
                }

                form={
                    form
                }

                setForm={
                    setForm
                }

                loading={
                    loading
                }
            />
        </div>
    );
}
