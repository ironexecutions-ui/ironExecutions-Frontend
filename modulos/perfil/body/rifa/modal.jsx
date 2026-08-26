import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { createPortal } from "react-dom";

import { API_URL } from "../../../../config";

import "./modal.css";

export default function RegistrarCompraManual({
    aberto,
    onClose,
    rifas,
    onRegistrado
}) {
    const [rifaId, setRifaId] = useState("");

    const [nome, setNome] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [numerosSelecionados, setNumerosSelecionados] = useState([]);
    const [numerosVendidos, setNumerosVendidos] = useState([]);

    const [carregandoNumeros, setCarregandoNumeros] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const token = localStorage.getItem("token");
    const rifaRef = useRef(null);
    const nomeRef = useRef(null);
    const whatsappRef = useRef(null);
    const emailRef = useRef(null);
    const mensagemRef = useRef(null);
    const botaoRegistrarRef = useRef(null);
    const rifaSelecionada = useMemo(() => {
        return rifas.find(
            rifa => Number(rifa.id) === Number(rifaId)
        );
    }, [rifas, rifaId]);

    const intervalo = useMemo(() => {
        if (
            !rifaSelecionada ||
            !rifaSelecionada.numeros ||
            !rifaSelecionada.numeros.includes("-")
        ) {
            return [];
        }

        const [inicio, fim] = rifaSelecionada.numeros
            .split("-")
            .map(Number);

        if (
            !Number.isInteger(inicio) ||
            !Number.isInteger(fim) ||
            fim < inicio
        ) {
            return [];
        }

        return Array.from(
            { length: fim - inicio + 1 },
            (_, index) => inicio + index
        );
    }, [rifaSelecionada]);

    const vendidosSet = useMemo(() => {
        return new Set(
            numerosVendidos.map(numero => Number(numero))
        );
    }, [numerosVendidos]);

    useEffect(() => {
        if (!aberto) {
            return;
        }

        setErro("");
        setSucesso("");
    }, [aberto]);

    useEffect(() => {
        if (!aberto || !rifaId) {
            setNumerosVendidos([]);
            setNumerosSelecionados([]);
            return;
        }

        carregarNumerosVendidos();
    }, [aberto, rifaId]);
    function formatarNome(valor) {
        return valor
            .replace(/\s+/g, " ")
            .replace(/(^|\s)\S/g, letra =>
                letra.toUpperCase()
            );
    }


    function formatarWhatsapp(valor) {
        const numeros = valor
            .replace(/\D/g, "")
            .slice(0, 11);

        if (numeros.length === 0) {
            return "";
        }

        if (numeros.length <= 2) {
            return `(${numeros}`;
        }

        if (numeros.length <= 6) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        }

        if (numeros.length <= 10) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
        }

        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }


    function proximoCampo(e, proximoRef) {
        if (e.key !== "Enter") {
            return;
        }

        e.preventDefault();

        proximoRef?.current?.focus();
    }


    function tentarRegistrarComEnter(e) {
        if (e.key !== "Enter") {
            return;
        }

        /*
            Shift + Enter continua permitindo
            quebrar linha na observação.
        */
        if (e.shiftKey) {
            return;
        }

        e.preventDefault();

        if (!rifaId) {
            setErro("Selecione uma rifa.");
            rifaRef.current?.focus();
            return;
        }

        if (!nome.trim()) {
            setErro("Informe o nome do comprador.");
            nomeRef.current?.focus();
            return;
        }

        if (numerosSelecionados.length === 0) {
            setErro(
                "Selecione pelo menos um número antes de registrar."
            );
            return;
        }

        botaoRegistrarRef.current?.click();
    }
    async function carregarNumerosVendidos() {
        setCarregandoNumeros(true);
        setErro("");
        setNumerosSelecionados([]);

        try {
            if (!token) {
                throw new Error(
                    "Sua sessão não foi encontrada. Faça login novamente."
                );
            }

            const res = await fetch(
                `${API_URL}/rifa/${rifaId}/compras-detalhadas`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const json = await res.json();

            if (!res.ok) {
                throw new Error(
                    json.detail ||
                    "Não foi possível carregar os números vendidos"
                );
            }

            const vendidos = Array.isArray(json)
                ? json.map(item => Number(item.numero))
                : [];

            setNumerosVendidos(vendidos);
        } catch (err) {
            setNumerosVendidos([]);
            setErro(
                err.message ||
                "Erro ao carregar números vendidos"
            );
        } finally {
            setCarregandoNumeros(false);
        }
    }

    function selecionarNumero(numero) {
        if (vendidosSet.has(numero)) {
            return;
        }

        setNumerosSelecionados(anteriores => {
            if (anteriores.includes(numero)) {
                return anteriores.filter(
                    item => item !== numero
                );
            }

            return [
                ...anteriores,
                numero
            ].sort((a, b) => a - b);
        });
    }

    function limparFormulario() {
        setRifaId("");
        setNome("");
        setWhatsapp("");
        setEmail("");
        setMensagem("");
        setNumerosSelecionados([]);
        setNumerosVendidos([]);
        setErro("");
        setSucesso("");
    }

    function fecharModal() {
        if (salvando) {
            return;
        }

        limparFormulario();
        onClose();
    }

    async function registrarCompra(e) {
        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!token) {
            setErro(
                "Sua sessão não foi encontrada. Faça login novamente."
            );
            return;
        }

        if (!rifaId) {
            setErro("Selecione uma rifa.");
            return;
        }

        if (!nome.trim()) {
            setErro("Informe o nome do comprador.");
            return;
        }

        if (numerosSelecionados.length === 0) {
            setErro(
                "Selecione pelo menos um número."
            );
            return;
        }

        setSalvando(true);

        try {
            const res = await fetch(
                `${API_URL}/rifa/${rifaId}/compra-manual`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nome: nome.trim(),
                        whatsapp: whatsapp.trim() || null,
                        email: email.trim() || null,
                        mensagem: mensagem.trim() || null,
                        numeros: numerosSelecionados
                    })
                }
            );

            const json = await res.json();

            if (!res.ok) {
                throw new Error(
                    json.detail ||
                    "Não foi possível registrar a compra"
                );
            }

            setSucesso(
                "Compra manual registrada com sucesso."
            );

            setNome("");
            setWhatsapp("");
            setEmail("");
            setMensagem("");
            setNumerosSelecionados([]);

            await carregarNumerosVendidos();

            if (onRegistrado) {
                await onRegistrado();
            }
        } catch (err) {
            setErro(
                err.message ||
                "Erro ao registrar compra manual"
            );
        } finally {
            setSalvando(false);
        }
    }

    if (!aberto) {
        return null;
    }

    return createPortal(
        <div
            className="rcm-overlay-seguranca-rifa"
            onMouseDown={e => {
                if (e.target === e.currentTarget) {
                    fecharModal();
                }
            }}
        >
            <div
                className="rcm-modal-registro-administrativo"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rcm-titulo-modal"
            >
                <div className="rcm-cabecalho-registro">
                    <div className="rcm-cabecalho-textos">
                        <h2 id="rcm-titulo-modal">
                            Registrar compra manual
                        </h2>

                        <p>
                            Use para pagamentos recebidos diretamente
                            pelo comércio.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="rcm-botao-fechar-registro"
                        onClick={fecharModal}
                        disabled={salvando}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <form
                    className="rcm-formulario-compra-manual"
                    onSubmit={registrarCompra}
                >
                    <label className="rcm-campo-selecao-rifa">
                        <span>Rifa</span>

                        <select
                            ref={rifaRef}
                            value={rifaId}
                            onChange={e => {
                                setRifaId(e.target.value);
                                setErro("");
                                setSucesso("");
                            }}
                            onKeyDown={e =>
                                proximoCampo(e, nomeRef)
                            }
                            disabled={salvando}
                        >
                            <option value="">
                                Selecione uma rifa
                            </option>

                            {rifas
                                .filter(
                                    rifa =>
                                        rifa.ganhador == null ||
                                        Number(rifa.ganhador) === 0
                                )
                                .map(rifa => (
                                    <option
                                        key={rifa.id}
                                        value={rifa.id}
                                    >
                                        {rifa.nome} | {rifa.numeros}
                                    </option>
                                ))}
                        </select>
                    </label>

                    <div className="rcm-linha-dados-comprador">
                        <label className="rcm-campo-nome-comprador">
                            <span>Nome do comprador</span>

                            <input
                                ref={nomeRef}
                                type="text"
                                value={nome}
                                maxLength={120}
                                onChange={e => {
                                    setNome(
                                        formatarNome(e.target.value)
                                    );

                                    setErro("");
                                }}
                                onKeyDown={e =>
                                    proximoCampo(e, whatsappRef)
                                }
                                placeholder="Nome completo"
                                autoComplete="name"
                                disabled={salvando}
                            />
                        </label>

                        <label className="rcm-campo-whatsapp-comprador">
                            <span>WhatsApp</span>

                            <input
                                ref={whatsappRef}
                                type="tel"
                                value={whatsapp}
                                maxLength={15}
                                inputMode="numeric"
                                autoComplete="tel"
                                onChange={e => {
                                    setWhatsapp(
                                        formatarWhatsapp(e.target.value)
                                    );

                                    setErro("");
                                }}
                                onKeyDown={e =>
                                    proximoCampo(e, emailRef)
                                }
                                placeholder="(11) 99999-9999"
                                disabled={salvando}
                            />
                        </label>
                    </div>

                    <label className="rcm-campo-email-comprador">
                        <span>Email</span>

                        <input
                            ref={emailRef}
                            type="email"
                            value={email}
                            maxLength={120}
                            autoComplete="email"
                            onChange={e => {
                                setEmail(e.target.value);
                                setErro("");
                            }}
                            onKeyDown={e =>
                                proximoCampo(e, mensagemRef)
                            }
                            placeholder="cliente@email.com"
                            disabled={salvando}
                        />
                    </label>

                    <label className="rcm-campo-observacao-compra">
                        <span>Observação</span>

                        <textarea
                            ref={mensagemRef}
                            value={mensagem}
                            maxLength={1000}
                            onChange={e => {
                                setMensagem(e.target.value);
                                setErro("");
                            }}
                            onKeyDown={tentarRegistrarComEnter}
                            placeholder="Ex.: pagamento recebido via Pix diretamente pelo comércio"
                            disabled={salvando}
                        />
                    </label>

                    {rifaSelecionada && (
                        <div className="rcm-area-numeros-rifa">
                            <div className="rcm-topo-selecao-numeros">
                                <div>
                                    <strong>
                                        Selecione os números
                                    </strong>

                                    <span>
                                        {numerosSelecionados.length} selecionado(s)
                                    </span>
                                </div>

                                {numerosSelecionados.length > 0 && (
                                    <button
                                        type="button"
                                        className="rcm-botao-limpar-selecao"
                                        onClick={() =>
                                            setNumerosSelecionados([])
                                        }
                                        disabled={salvando}
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>

                            {carregandoNumeros ? (
                                <div className="rcm-carregando-numeros">
                                    Carregando números...
                                </div>
                            ) : (
                                <div className="rcm-grade-numeros-disponiveis">
                                    {intervalo.map(numero => {
                                        const vendido =
                                            vendidosSet.has(numero);

                                        const selecionado =
                                            numerosSelecionados.includes(
                                                numero
                                            );

                                        return (
                                            <button
                                                key={numero}
                                                type="button"
                                                disabled={
                                                    vendido ||
                                                    salvando
                                                }
                                                onClick={() =>
                                                    selecionarNumero(numero)
                                                }
                                                className={[
                                                    "rcm-numero-rifa-manual",
                                                    vendido
                                                        ? "rcm-numero-ja-vendido"
                                                        : "",
                                                    selecionado
                                                        ? "rcm-numero-selecionado"
                                                        : ""
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                title={
                                                    vendido
                                                        ? "Número já vendido"
                                                        : `Número ${numero}`
                                                }
                                            >
                                                {numero}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="rcm-legenda-numeros">
                                <span className="rcm-legenda-disponivel">
                                    Disponível
                                </span>

                                <span className="rcm-legenda-selecionado">
                                    Selecionado
                                </span>

                                <span className="rcm-legenda-vendido">
                                    Vendido
                                </span>
                            </div>
                        </div>
                    )}

                    {erro && (
                        <div className="rcm-mensagem-erro-registro">
                            {erro}
                        </div>
                    )}

                    {sucesso && (
                        <div className="rcm-mensagem-sucesso-registro">
                            {sucesso}
                        </div>
                    )}

                    <div className="rcm-acoes-registro-manual">
                        <button
                            type="button"
                            className="rcm-botao-cancelar-registro"
                            onClick={fecharModal}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            ref={botaoRegistrarRef}
                            type="submit"
                            className="rcm-botao-confirmar-registro"
                            disabled={
                                salvando ||
                                !rifaId ||
                                numerosSelecionados.length === 0
                            }
                        >
                            {salvando
                                ? "Registrando..."
                                : "Registrar compra"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}