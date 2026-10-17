
import React, { useEffect, useRef, useState } from "react";
import "./bv.css";

const CHAVE_CACHE = "ie_boas_vindas_data";
const TEMPO_EXIBICAO = 12000;

function obterDataLocal() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function lerUsuario() {
    try {
        return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
        return null;
    }
}

function obterIdentificador(usuario) {
    const identificador =
        usuario?.id ??
        usuario?.cliente_id ??
        usuario?.usuario_id ??
        usuario?.email ??
        usuario?.comercio_id;

    if (identificador !== null && identificador !== undefined) {
        return String(identificador);
    }

    // Alternativa para sessões sem identificador no objeto usuario.
    const token = localStorage.getItem("token");

    if (token) {
        let hash = 0;

        for (let i = 0; i < token.length; i++) {
            hash = (hash * 31 + token.charCodeAt(i)) | 0;
        }

        return `sessao_${Math.abs(hash)}`;
    }

    return "usuario";
}

function obterPrimeiroNome(usuario) {
    const nome =
        usuario?.nome ??
        usuario?.nome_completo ??
        usuario?.name ??
        usuario?.nome_usuario ??
        usuario?.primeiro_nome ??
        "";

    const primeiroNome = String(nome).trim().split(/\s+/)[0];

    return primeiroNome || "tudo bem";
}

export default function BV() {
    const [visivel, setVisivel] = useState(false);
    const [nome, setNome] = useState("tudo bem");
    const verificacaoRealizada = useRef(false);

    useEffect(() => {
        if (verificacaoRealizada.current) return;

        verificacaoRealizada.current = true;

        if (!localStorage.getItem("token")) return;

        const usuario = lerUsuario();
        const identificador = obterIdentificador(usuario);
        const chave = `${CHAVE_CACHE}_${identificador}`;
        const hoje = obterDataLocal();

        try {
            const ultimaExibicao = localStorage.getItem(chave);

            if (ultimaExibicao === hoje) {
                return;
            }

            // Registra a data antes de exibir para impedir duplicações.
            localStorage.setItem(chave, hoje);
        } catch (erro) {
            console.warn(
                "[BV] Não foi possível acessar o cache:",
                erro
            );
        }

        setNome(obterPrimeiroNome(usuario));
        setVisivel(true);
    }, []);

    useEffect(() => {
        if (!visivel) return;

        const temporizador = window.setTimeout(() => {
            setVisivel(false);
        }, TEMPO_EXIBICAO);

        return () => window.clearTimeout(temporizador);
    }, [visivel]);
    useEffect(() => {
        if (!visivel) return;

        function fecharAoClicar() {
            setVisivel(false);
        }

        document.addEventListener("click", fecharAoClicar);

        return () => {
            document.removeEventListener("click", fecharAoClicar);
        };
    }, [visivel]);

    function fecharAviso() {
        setVisivel(false);
    }
    function fecharAviso() {
        setVisivel(false);
    }

    if (!visivel) return null;


    return (
        <aside
            className="ie-bv-toast"
            role="status"
            aria-live="polite"
            aria-label="Mensagem de boas-vindas"
        >
            <div className="ie-bv-top-line" />

            <div className="ie-bv-heading">
                <div className="ie-bv-icon-area" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 3v3" />
                        <path d="M12 18v3" />
                        <path d="M3 12h3" />
                        <path d="M18 12h3" />
                        <path d="m5.64 5.64 2.12 2.12" />
                        <path d="m16.24 16.24 2.12 2.12" />
                        <path d="m18.36 5.64-2.12 2.12" />
                        <path d="m7.76 16.24-2.12 2.12" />
                        <circle cx="12" cy="12" r="4" />
                    </svg>
                </div>

                <div className="ie-bv-brand">
                    <span>IRON EXECUTIONS</span>
                    <small>SEU PARCEIRO DE CRESCIMENTO</small>
                </div>
            </div>

            <div className="ie-bv-content">
                <span className="ie-bv-greeting">
                    É muito bom ter você aqui!
                </span>

                <h2>
                    Seja Bem Vindo(a),
                    <span className="ie-bv-name"> {nome}!</span>
                </h2>

                <p>
                    Seja muito bem-vindo à Iron Executions.
                    Estamos aqui para ajudar você a simplificar
                    sua operação, aproveitar novas oportunidades
                    e levar seu negócio ainda mais longe.
                </p>
            </div>

            <div className="ie-bv-footer">
                <div className="ie-bv-footer-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12.5 9.5 17 19 7.5" />
                    </svg>
                </div>

                <span>Seu próximo passo começa aqui.</span>
            </div>

            <button
                type="button"
                className="ie-bv-close"
                onClick={fecharAviso}
                aria-label="Fechar mensagem de boas-vindas"
                title="Fechar"
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m18 6-12 12M6 6l12 12" />
                </svg>
            </button>

            <div className="ie-bv-progress" aria-hidden="true">
                <span />
            </div>
        </aside>
    );

}
