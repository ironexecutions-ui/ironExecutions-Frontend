import React, {
    useEffect,
    useRef,
    useState
} from "react";

import "./modalpagamento.css";

import {
    API_URL
} from "../../config";

import {
    useGoogleLogin
} from "@react-oauth/google";

import {
    loadMercadoPago
} from "@mercadopago/sdk-js";

export default function ModalPagamento({
    aberto,
    etapa,
    setEtapa,
    pix,

    rifaId,
    compraId,

    onFechar,
    onConfirmarPagamento,
    onPrepararCartao,

    selecionados,
    total,
    form,
    setForm,
    loading
}) {
    const [metodo, setMetodo] =
        useState("pix");

    const [statusPix, setStatusPix] =
        useState("aguardando");

    const [erroGoogle, setErroGoogle] =
        useState("");

    const [erroCartao, setErroCartao] =
        useState("");

    const [processandoCartao, setProcessandoCartao] =
        useState(false);

    const [cartaoPronto, setCartaoPronto] =
        useState(false);

    const [resultadoCartao, setResultadoCartao] =
        useState(null);

    const cardFormRef =
        useRef(null);

    const inicializandoCartaoRef =
        useRef(false);


    // =====================================================
    // PUBLIC KEY
    // =====================================================

    const MP_PUBLIC_KEY =
        import.meta.env.VITE_MP_PUBLIC_KEY;


    // =====================================================
    // EMAIL VÁLIDO
    // =====================================================

    const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            form.email || ""
        );


    // =====================================================
    // LOGIN GOOGLE
    // =====================================================

    const loginGoogle = useGoogleLogin({

        onSuccess: async (token) => {

            try {

                const res = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token.access_token}`
                        }
                    }
                );

                const data =
                    await res.json();

                const partesNome =
                    (data.name || "")
                        .split(" ");

                setForm(prev => ({
                    ...prev,

                    nome:
                        partesNome[0] || "",

                    sobrenome:
                        partesNome
                            .slice(1)
                            .join(" "),

                    email:
                        data.email ||
                        prev.email,

                    googleLogado: true
                }));

                setErroGoogle("");

            } catch {

                setErroGoogle(
                    "Erro ao obter dados do Google"
                );
            }
        },

        onError: () => {

            setErroGoogle(
                "Não foi possível entrar com o Google"
            );
        }
    });


    // =====================================================
    // BLOQUEAR SCROLL DA PÁGINA
    // =====================================================

    useEffect(() => {

        if (aberto) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";
        }

        return () => {

            document.body.style.overflow =
                "";
        };

    }, [aberto]);


    // =====================================================
    // RESET AO ABRIR
    // =====================================================

    useEffect(() => {

        if (!aberto) {
            return;
        }

        setStatusPix(
            "aguardando"
        );

        setMetodo(
            "pix"
        );

        setErroCartao(
            ""
        );

        setResultadoCartao(
            null
        );

        setProcessandoCartao(
            false
        );

        setCartaoPronto(
            false
        );

    }, [aberto]);


    // =====================================================
    // STATUS PIX
    // =====================================================

    useEffect(() => {

        if (
            !aberto ||
            etapa !== "pix" ||
            !pix?.id
        ) {
            return;
        }

        const interval =
            setInterval(
                async () => {

                    try {

                        const r =
                            await fetch(
                                `${API_URL}/rifa/pagamento/status/${pix.id}`
                            );

                        const json =
                            await r.json();

                        if (
                            json.status ===
                            "approved"
                        ) {

                            setStatusPix(
                                "pago"
                            );

                            clearInterval(
                                interval
                            );
                        }

                    } catch {
                        // mantém consulta
                    }

                },
                3000
            );

        return () =>
            clearInterval(
                interval
            );

    }, [
        aberto,
        etapa,
        pix
    ]);


    // =====================================================
    // INICIALIZAR CARTÃO MERCADO PAGO
    // =====================================================

    useEffect(() => {

        if (
            !aberto ||
            etapa !== "cartao" ||
            metodo !== "cartao"
        ) {
            return;
        }

        if (
            cardFormRef.current ||
            inicializandoCartaoRef.current
        ) {
            return;
        }

        let ativo = true;

        async function iniciarCartao() {

            inicializandoCartaoRef.current =
                true;

            setErroCartao("");

            setCartaoPronto(false);

            try {

                if (!MP_PUBLIC_KEY) {

                    throw new Error(
                        "Public Key do Mercado Pago não configurada."
                    );
                }


                // =========================================
                // CARREGAR SDK
                // =========================================

                await loadMercadoPago();


                if (
                    !ativo ||
                    !window.MercadoPago
                ) {
                    return;
                }


                // =========================================
                // INSTÂNCIA MP
                // =========================================

                const mp =
                    new window.MercadoPago(
                        MP_PUBLIC_KEY,
                        {
                            locale: "pt-BR"
                        }
                    );


                // =========================================
                // CRIAR CARDFORM
                // =========================================

                const cardForm =
                    mp.cardForm({

                        amount:
                            String(total),

                        iframe: true,

                        form: {

                            id:
                                "rif-mp-form-cartao",

                            cardNumber: {
                                id:
                                    "rif-mp-card-number",
                                placeholder:
                                    "Número do cartão"
                            },

                            expirationDate: {
                                id:
                                    "rif-mp-card-expiration",
                                placeholder:
                                    "MM/AA"
                            },

                            securityCode: {
                                id:
                                    "rif-mp-card-security",
                                placeholder:
                                    "CVV"
                            },

                            cardholderName: {
                                id:
                                    "rif-mp-card-holder",
                                placeholder:
                                    "Nome impresso no cartão"
                            },

                            issuer: {
                                id:
                                    "rif-mp-card-issuer",
                                placeholder:
                                    "Banco emissor"
                            },

                            installments: {
                                id:
                                    "rif-mp-card-installments",
                                placeholder:
                                    "Parcelas"
                            },

                            identificationType: {
                                id:
                                    "rif-mp-card-document-type",
                                placeholder:
                                    "Tipo de documento"
                            },

                            identificationNumber: {
                                id:
                                    "rif-mp-card-document",
                                placeholder:
                                    "CPF"
                            },

                            cardholderEmail: {
                                id:
                                    "rif-mp-card-email",
                                placeholder:
                                    "Email"
                            }
                        },


                        // =================================
                        // FORM MONTADO
                        // =================================

                        callbacks: {

                            onFormMounted: error => {

                                if (!ativo) {
                                    return;
                                }

                                if (error) {

                                    console.error(
                                        "[MERCADO PAGO] Erro ao montar cartão:",
                                        error
                                    );

                                    setErroCartao(
                                        "Não foi possível carregar o formulário do cartão."
                                    );

                                    return;
                                }

                                setCartaoPronto(
                                    true
                                );
                            },


                            // =============================
                            // SUBMIT
                            // =============================

                            onSubmit: async event => {

                                event.preventDefault();

                                if (
                                    processandoCartao
                                ) {
                                    return;
                                }

                                setErroCartao("");

                                setProcessandoCartao(
                                    true
                                );

                                try {

                                    const dados =
                                        cardForm
                                            .getCardFormData();


                                    console.log(
                                        "[CARTÃO] Dados tokenizados:",
                                        {
                                            paymentMethodId:
                                                dados.paymentMethodId,

                                            issuerId:
                                                dados.issuerId,

                                            installments:
                                                dados.installments,

                                            tokenGerado:
                                                Boolean(
                                                    dados.token
                                                )
                                        }
                                    );


                                    // =====================
                                    // VALIDAR TOKEN
                                    // =====================

                                    if (
                                        !dados.token
                                    ) {

                                        throw new Error(
                                            "Não foi possível tokenizar o cartão."
                                        );
                                    }


                                    if (
                                        !dados.paymentMethodId
                                    ) {

                                        throw new Error(
                                            "Não foi possível identificar a bandeira do cartão."
                                        );
                                    }


                                    // =====================
                                    // COMPRA ID
                                    // =====================



                                    if (!compraId) {

                                        throw new Error(
                                            "Compra não encontrada para realizar o pagamento."
                                        );
                                    }


                                    // =====================
                                    // ENVIAR BACKEND
                                    // =====================

                                    const resposta =
                                        await fetch(
                                            `${API_URL}/rifa/${rifaId}/pagamento/cartao`, {
                                            method:
                                                "POST",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body:
                                                JSON.stringify({

                                                    compra_id:
                                                        compraId,

                                                    token:
                                                        dados.token,

                                                    issuer_id:
                                                        dados.issuerId,

                                                    payment_method_id:
                                                        dados.paymentMethodId,

                                                    installments:
                                                        Number(
                                                            dados.installments ||
                                                            1
                                                        )
                                                })
                                        }
                                        );


                                    const json =
                                        await resposta.json();


                                    if (
                                        !resposta.ok
                                    ) {

                                        console.error(
                                            "[CARTÃO] Backend:",
                                            json
                                        );

                                        throw new Error(
                                            typeof json.detail ===
                                                "string"
                                                ? json.detail
                                                : "Não foi possível processar o cartão."
                                        );
                                    }


                                    // =====================
                                    // RESULTADO
                                    // =====================

                                    setResultadoCartao(
                                        json
                                    );


                                    if (
                                        json.status ===
                                        "approved"
                                    ) {

                                        setEtapa(
                                            "cartao_aprovado"
                                        );

                                        return;
                                    }


                                    if (
                                        json.status ===
                                        "pending" ||
                                        json.status ===
                                        "in_process"
                                    ) {

                                        setEtapa(
                                            "cartao_processando"
                                        );

                                        return;
                                    }


                                    // =====================
                                    // RECUSADO
                                    // =====================

                                    throw new Error(
                                        traduzirErroCartao(
                                            json.status_detail
                                        )
                                    );

                                } catch (erro) {

                                    console.error(
                                        "[CARTÃO] Erro:",
                                        erro
                                    );

                                    setErroCartao(
                                        erro.message ||
                                        "Não foi possível realizar o pagamento."
                                    );

                                } finally {

                                    setProcessandoCartao(
                                        false
                                    );
                                }
                            },


                            // =============================
                            // REQUISIÇÕES DO CARDFORM
                            // =============================

                            onFetching: resource => {

                                console.log(
                                    "[MERCADO PAGO]",
                                    resource
                                );
                            }
                        }
                    });


                cardFormRef.current =
                    cardForm;

            } catch (erro) {

                console.error(
                    "[MERCADO PAGO] Inicialização:",
                    erro
                );

                if (ativo) {

                    setErroCartao(
                        erro.message ||
                        "Não foi possível inicializar o pagamento com cartão."
                    );
                }

            } finally {

                inicializandoCartaoRef.current =
                    false;
            }
        }


        iniciarCartao();


        return () => {

            ativo = false;

            cardFormRef.current =
                null;

            inicializandoCartaoRef.current =
                false;
        };

    }, [
        aberto,
        etapa,
        metodo,
        total,
        MP_PUBLIC_KEY
    ]);


    // =====================================================
    // TRADUZIR MOTIVO DE RECUSA
    // =====================================================

    function traduzirErroCartao(
        statusDetail
    ) {

        const erros = {

            cc_rejected_bad_filled_card_number:
                "Confira o número do cartão.",

            cc_rejected_bad_filled_date:
                "Confira a validade do cartão.",

            cc_rejected_bad_filled_security_code:
                "Confira o código de segurança.",

            cc_rejected_bad_filled_other:
                "Confira os dados informados.",

            cc_rejected_insufficient_amount:
                "O cartão não possui limite suficiente.",

            cc_rejected_call_for_authorize:
                "O banco solicitou autorização para esta compra.",

            cc_rejected_card_disabled:
                "O cartão está desabilitado.",

            cc_rejected_duplicated_payment:
                "Este pagamento já foi processado.",

            cc_rejected_high_risk:
                "O pagamento não foi autorizado.",

            cc_rejected_max_attempts:
                "O limite de tentativas para este cartão foi atingido."
        };

        return (
            erros[statusDetail] ||
            "O pagamento não foi aprovado. Tente novamente ou utilize outro cartão."
        );
    }


    // =====================================================
    // MODAL FECHADO
    // =====================================================

    if (!aberto) {
        return null;
    }


    return (

        <div
            className="rif-mp-overlay"
            onClick={e => {

                if (
                    e.target ===
                    e.currentTarget
                ) {
                    onFechar();
                }
            }}
        >

            <div
                className="rif-mp-modal"
                onClick={e =>
                    e.stopPropagation()
                }
            >

                {/* ========================================
                    DADOS
                ======================================== */}

                {etapa === "dados" && (

                    <div className="rif-mp-etapa">

                        <h3>
                            Dados do comprador
                        </h3>

                        <h4>
                            As informações informadas serão utilizadas para contato oficial em caso de premiação.
                        </h4>


                        {!form.googleLogado && (

                            <>

                                <button
                                    type="button"
                                    className="rif-mp-google"
                                    onClick={() =>
                                        loginGoogle()
                                    }
                                >
                                    Entrar com Google
                                </button>


                                {erroGoogle && (

                                    <small>
                                        {erroGoogle}
                                    </small>
                                )}

                            </>
                        )}


                        <input
                            value={
                                `${form.nome || ""} ${form.sobrenome || ""}`.trim()
                            }
                            placeholder="Nome e sobrenome"
                            disabled
                        />


                        <input
                            value={
                                form.email
                            }
                            placeholder="Email"
                            readOnly
                        />


                        {form.email &&
                            !emailValido && (

                                <small>
                                    Email inválido
                                </small>
                            )}


                        <input
                            value={
                                form.whatsapp
                            }
                            placeholder="WhatsApp"
                            onChange={e =>
                                setForm({
                                    ...form,
                                    whatsapp:
                                        e.target.value
                                })
                            }
                        />


                        <textarea
                            value={
                                form.mensagem
                            }
                            placeholder="Mensagem (opcional)"
                            onChange={e =>
                                setForm({
                                    ...form,
                                    mensagem:
                                        e.target.value
                                })
                            }
                        />


                        <button
                            disabled={
                                !form.googleLogado ||
                                !form.nome ||
                                !emailValido ||
                                !form.whatsapp
                            }
                            onClick={() =>
                                setEtapa(
                                    "confirmacao"
                                )
                            }
                        >
                            Confirmar dados
                        </button>


                        <button
                            onClick={
                                onFechar
                            }
                        >
                            Cancelar
                        </button>

                    </div>
                )}


                {/* ========================================
                    CONFIRMAÇÃO
                ======================================== */}

                {etapa === "confirmacao" && (

                    <div className="rif-mp-etapa">

                        <h3>
                            Confirmação
                        </h3>


                        <p>
                            <b>Nome:</b>{" "}
                            {form.nome}{" "}
                            {form.sobrenome}
                        </p>

                        <p>
                            <b>Email:</b>{" "}
                            {form.email}
                        </p>

                        <p>
                            <b>WhatsApp:</b>{" "}
                            {form.whatsapp}
                        </p>

                        <p>
                            <b>Números:</b>{" "}
                            {selecionados.join(", ")}
                        </p>

                        <p>
                            <b>Total:</b>{" "}
                            R$ {total}
                        </p>


                        <div className="rif-mp-metodo">

                            <button
                                className={
                                    metodo === "pix"
                                        ? "ativo"
                                        : ""
                                }
                                onClick={() =>
                                    setMetodo("pix")
                                }
                            >
                                PIX
                            </button>


                            <button
                                className={
                                    metodo === "cartao"
                                        ? "ativo"
                                        : ""
                                }
                                onClick={() =>
                                    setMetodo("cartao")
                                }
                            >
                                Cartão
                            </button>

                        </div>


                        <button
                            disabled={
                                loading ||
                                !emailValido
                            }
                            onClick={() => {

                                if (metodo === "pix") {

                                    onConfirmarPagamento();

                                } else {

                                    onPrepararCartao();
                                }
                            }}
                        >
                            {loading
                                ? "Processando..."
                                : "Ir para pagamento"}
                        </button>


                        <button
                            onClick={() =>
                                setEtapa(
                                    "dados"
                                )
                            }
                        >
                            Voltar
                        </button>

                    </div>
                )}


                {/* ========================================
                    PIX
                ======================================== */}

                {etapa === "pix" &&
                    metodo === "pix" &&
                    pix && (

                        <div className="rif-mp-etapa">

                            {statusPix ===
                                "aguardando" && (

                                    <>

                                        <h3>
                                            Pagamento via PIX
                                        </h3>

                                        <p>
                                            Aguardando pagamento...
                                        </p>


                                        <img
                                            src={
                                                `data:image/png;base64,${pix.qr_code_base64}`
                                            }
                                            alt="PIX"
                                        />


                                        <textarea
                                            readOnly
                                            value={
                                                pix.qr_code
                                            }
                                        />


                                        <button
                                            onClick={() =>
                                                setEtapa(
                                                    "confirmacao"
                                                )
                                            }
                                        >
                                            Voltar
                                        </button>

                                    </>
                                )}


                            {statusPix ===
                                "pago" && (

                                    <>

                                        <h3>
                                            Pagamento confirmado
                                        </h3>

                                        <p>
                                            Obrigado por participar da rifa.
                                        </p>


                                        <button
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                        >
                                            Fechar
                                        </button>

                                    </>
                                )}

                        </div>
                    )}


                {/* ========================================
                    CARTÃO
                ======================================== */}

                {etapa === "cartao" &&
                    metodo === "cartao" && (

                        <div className="rif-mp-etapa">

                            <h3>
                                Pagamento com cartão
                            </h3>

                            <h4>
                                Seus dados são processados de forma segura pelo Mercado Pago.
                            </h4>


                            {!cartaoPronto && (
                                <div className="rif-mp-cartao-carregando">
                                    Preparando pagamento seguro...
                                </div>
                            )}


                            <form
                                id="rif-mp-form-cartao"
                                className="rif-mp-form-cartao"
                            >

                                {/* NÚMERO */}

                                <label className="rif-mp-campo-cartao">

                                    <span>
                                        Número do cartão
                                    </span>

                                    <div
                                        id="rif-mp-card-number"
                                        className="rif-mp-input-seguro"
                                    />

                                </label>


                                {/* TITULAR */}

                                <label className="rif-mp-campo-cartao">

                                    <span>
                                        Nome no cartão
                                    </span>

                                    <input
                                        id="rif-mp-card-holder"
                                        type="text"
                                        autoComplete="cc-name"
                                        placeholder="Como está impresso no cartão"
                                    />

                                </label>


                                {/* VALIDADE + CVV */}

                                <div className="rif-mp-linha-cartao">

                                    <label className="rif-mp-campo-cartao">

                                        <span>
                                            Validade
                                        </span>

                                        <div
                                            id="rif-mp-card-expiration"
                                            className="rif-mp-input-seguro"
                                        />

                                    </label>


                                    <label className="rif-mp-campo-cartao">

                                        <span>
                                            CVV
                                        </span>

                                        <div
                                            id="rif-mp-card-security"
                                            className="rif-mp-input-seguro"
                                        />

                                    </label>

                                </div>


                                {/* EMISSOR */}

                                <label className="rif-mp-campo-cartao">

                                    <span>
                                        Emissor
                                    </span>

                                    <select
                                        id="rif-mp-card-issuer"
                                    />

                                </label>


                                {/* PARCELAS */}

                                <label className="rif-mp-campo-cartao">

                                    <span>
                                        Parcelamento
                                    </span>

                                    <select
                                        id="rif-mp-card-installments"
                                    />

                                </label>


                                {/* DOCUMENTO */}

                                <div className="rif-mp-linha-documento">

                                    <label className="rif-mp-campo-cartao">

                                        <span>
                                            Documento
                                        </span>

                                        <select
                                            id="rif-mp-card-document-type"
                                        />

                                    </label>


                                    <label className="rif-mp-campo-cartao">

                                        <span>
                                            Número
                                        </span>

                                        <input
                                            id="rif-mp-card-document"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="CPF"
                                        />

                                    </label>

                                </div>


                                {/* EMAIL */}

                                <label className="rif-mp-campo-cartao">

                                    <span>
                                        Email
                                    </span>

                                    <input
                                        id="rif-mp-card-email"
                                        type="email"
                                        defaultValue={
                                            form.email
                                        }
                                        readOnly
                                    />

                                </label>


                                {/* TOTAL */}

                                <div className="rif-mp-total-cartao">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        R$ {total}
                                    </strong>

                                </div>


                                {erroCartao && (

                                    <div className="rif-mp-erro-cartao">
                                        {erroCartao}
                                    </div>
                                )}


                                <button
                                    id="rif-mp-card-submit"
                                    type="submit"
                                    disabled={
                                        !cartaoPronto ||
                                        processandoCartao
                                    }
                                >
                                    {processandoCartao
                                        ? "Processando pagamento..."
                                        : `Pagar R$ ${total}`}
                                </button>

                            </form>


                            <button
                                type="button"
                                onClick={() =>
                                    setEtapa(
                                        "confirmacao"
                                    )
                                }
                                disabled={
                                    processandoCartao
                                }
                            >
                                Voltar
                            </button>

                        </div>
                    )}


                {/* ========================================
                    CARTÃO APROVADO
                ======================================== */}

                {etapa ===
                    "cartao_aprovado" && (

                        <div className="rif-mp-etapa rif-mp-cartao-sucesso">

                            <h3>
                                Pagamento aprovado
                            </h3>

                            <p>
                                Seu pagamento foi confirmado com sucesso.
                            </p>

                            {resultadoCartao?.payment_id && (

                                <p>
                                    <b>Pagamento:</b>{" "}
                                    #{resultadoCartao.payment_id}
                                </p>
                            )}


                            <button
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                Concluir
                            </button>

                        </div>
                    )}


                {/* ========================================
                    CARTÃO PROCESSANDO
                ======================================== */}

                {etapa ===
                    "cartao_processando" && (

                        <div className="rif-mp-etapa">

                            <h3>
                                Pagamento em análise
                            </h3>

                            <p>
                                O Mercado Pago está processando o pagamento.
                            </p>

                            <button
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                Entendi
                            </button>

                        </div>
                    )}

            </div>

        </div>
    );
}