import React, {
    useEffect,
    useRef,
    useState
} from "react";

import { API_URL } from "../../../../../config";
import { useVenda } from "./vendaprovider";

import "./emailpromocao.css";

export default function EmailPromocao() {

    const {
        emailPromocaoPendente,
        setEmailPromocaoPendente
    } = useVenda();

    const [email, setEmail] =
        useState("");

    const [enviando, setEnviando] =
        useState(false);

    const [erro, setErro] =
        useState("");

    const inputRef =
        useRef(null);

    /* ===============================
       FOCO AUTOMÁTICO
    =============================== */

    useEffect(() => {

        if (!emailPromocaoPendente) {
            return;
        }

        requestAnimationFrame(() => {

            inputRef.current?.focus();

        });

    }, [emailPromocaoPendente]);

    /* ===============================
       VALIDAR EMAIL
    =============================== */

    function emailValido(valor) {

        const texto =
            String(valor || "").trim();

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            texto
        );
    }

    /* ===============================
       FECHAR
    =============================== */

    function agoraNao() {

        console.log(
            "[PROMOÇÃO] Cliente optou por não informar e-mail."
        );

        setEmailPromocaoPendente(null);
    }

    /* ===============================
       SALVAR
    =============================== */

    async function salvarEmail(e) {

        e?.preventDefault();

        if (enviando) {
            return;
        }

        const emailLimpo =
            email.trim().toLowerCase();

        if (!emailValido(emailLimpo)) {

            setErro(
                "Digite um e-mail válido."
            );

            inputRef.current?.focus();

            return;
        }

        const vendaId =
            emailPromocaoPendente?.vendaId;

        if (!vendaId) {

            setErro(
                "Não foi possível identificar a venda."
            );

            return;
        }

        setEnviando(true);
        setErro("");

        try {

            console.log(
                "[PROMOÇÃO] Registrando e-mail para venda:",
                vendaId
            );

            const resp = await fetch(
                `${API_URL}/vendas/${vendaId}/promocao-email`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${localStorage.getItem("token")}`
                    },

                    body: JSON.stringify({
                        email: emailLimpo
                    })
                }
            );

            let dados = null;

            try {

                dados =
                    await resp.json();

            } catch {

                dados = null;
            }

            console.log(
                "[PROMOÇÃO] Resposta cadastro:",
                dados
            );

            if (!resp.ok) {

                throw new Error(
                    dados?.detail ||
                    dados?.message ||
                    "Não foi possível registrar o e-mail."
                );
            }

            console.log(
                "[PROMOÇÃO] E-mail registrado com sucesso."
            );

            setEmail("");
            setEmailPromocaoPendente(null);

        } catch (erroSalvar) {

            console.error(
                "[PROMOÇÃO] Erro ao registrar e-mail:",
                erroSalvar
            );

            setErro(
                erroSalvar?.message ||
                "Não foi possível registrar o e-mail."
            );

        } finally {

            setEnviando(false);
        }
    }

    if (!emailPromocaoPendente) {
        return null;
    }

    return (
        <div className="email-promocao">

            <div className="email-promocao-conteudo">



                <div className="email-promocao-textos">



                    <h2>                        BENEFÍCIO PARA O CLIENTE

                    </h2>

                    <p className="email-promocao-descricao">
                        Informe o e-mail do cliente para receber os
                        códigos promocionais.
                    </p>

                    <div className="email-promocao-aviso">

                        <span className="email-promocao-relogio">
                            08:00
                        </span>

                        <div>
                            <strong>
                                Informe que o(s) código(s) chegam amanhã
                            </strong>


                        </div>

                    </div>

                </div>

                <form
                    className="email-promocao-form"
                    onSubmit={salvarEmail}
                >

                    <label className="email-promocao-label">
                        E-mail do cliente
                    </label>

                    <input
                        ref={inputRef}
                        type="email"
                        value={email}
                        disabled={enviando}
                        placeholder="cliente@email.com"
                        autoComplete="email"
                        onChange={e => {

                            setEmail(
                                e.target.value
                            );

                            if (erro) {
                                setErro("");
                            }

                        }}
                    />

                    {erro && (
                        <div className="email-promocao-erro">
                            {erro}
                        </div>
                    )}

                    <div className="email-promocao-acoes">

                        <button
                            type="button"
                            className="email-promocao-pular"
                            onClick={agoraNao}
                            disabled={enviando}
                        >
                            ❌
                        </button>

                        <button
                            type="submit"
                            className="email-promocao-salvar"
                            disabled={
                                enviando ||
                                !email.trim()
                            }
                        >
                            {enviando
                                ? "Cadastrando..."
                                : "Cadastrar"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}