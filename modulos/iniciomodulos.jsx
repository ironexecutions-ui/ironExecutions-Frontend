import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AreaLogin from "./inicio_modulos/arealogin";
import LojasAvaliacao from "./inicio_modulos/lojasavaliacao";
import Rodape from "./inicio_modulos/rodape";
import ExplicacaoModulos from "./inicio_modulos/explicacaomodulos";
import HeaderInicio from "./inicio_modulos/headerinicio";

import "./inicio-modulos.css";

export default function InicioModulos() {

    const location = useLocation();
    const navigate = useNavigate();

    /* =====================================================
       MODAL
    ===================================================== */

    const [modalContatoAberto, setModalContatoAberto] = useState(false);

    /* =====================================================
       MENSAGENS DO ASSISTENTE
    ===================================================== */

    const mensagensAssistenteIron = [
        "Olá! Posso te ajudar a conhecer melhor o Iron Executions?",

        "Quer descobrir quais módulos fazem mais sentido para o seu comércio?",

        "Seu sistema pode ser montado de acordo com as necessidades do seu negócio.",

        "Tem alguma dúvida sobre valores, módulos ou funcionamento do sistema?",

        "Clique aqui para começar seu cadastro ou falar diretamente com Andy de Oliveira.",

        "Quer modernizar a gestão do seu comércio? Posso te mostrar por onde começar.",

        "Conheça uma solução criada para simplificar vendas, administração e gestão do seu negócio.",

        "Não sabe qual módulo contratar? Fale com Andy e descubra a melhor opção para seu comércio.",

        "Precisa de algo específico para sua empresa? A Iron Executions também desenvolve soluções personalizadas.",

        "Seu comércio pode ter um sistema mais rápido, organizado e adaptado à sua rotina.",

        "Quer entender quanto custaria o sistema ideal para o seu negócio? Clique aqui para continuar.",

        "Produtividade, Administração e Fiscal podem trabalhar juntos para facilitar sua operação.",

        "Quer começar a usar o Iron Business? Você pode realizar seu cadastro agora.",

        "Ainda está conhecendo o sistema? Tire suas dúvidas diretamente com quem desenvolveu a plataforma.",

        "Cada comércio funciona de uma maneira. Vamos encontrar a configuração ideal para o seu?"
    ];

    /* =====================================================
       ASSISTENTE
    ===================================================== */

    const [mensagemAssistenteAtual, setMensagemAssistenteAtual] =
        useState(() =>
            Math.floor(
                Math.random() * mensagensAssistenteIron.length
            )
        );

    const [assistenteVisivel, setAssistenteVisivel] =
        useState(true);

    /* =====================================================
       TROCAR MENSAGEM ALEATORIAMENTE
    ===================================================== */

    useEffect(() => {

        let timeoutTroca;

        const intervalo = setInterval(() => {

            setAssistenteVisivel(false);

            timeoutTroca = setTimeout(() => {

                setMensagemAssistenteAtual(atual => {

                    let novaMensagem;

                    do {

                        novaMensagem = Math.floor(
                            Math.random() *
                            mensagensAssistenteIron.length
                        );

                    } while (
                        novaMensagem === atual &&
                        mensagensAssistenteIron.length > 1
                    );

                    return novaMensagem;
                });

                setAssistenteVisivel(true);

            }, 2000);

        }, 8000);

        return () => {

            clearInterval(intervalo);

            if (timeoutTroca) {
                clearTimeout(timeoutTroca);
            }

        };

    }, []);

    /* =====================================================
       BLOQUEAR SCROLL QUANDO MODAL ABRIR
    ===================================================== */

    useEffect(() => {

        if (modalContatoAberto) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };

    }, [modalContatoAberto]);

    /* =====================================================
       FECHAR MODAL COM ESC
    ===================================================== */

    useEffect(() => {

        function fecharComEsc(event) {

            if (event.key === "Escape") {
                setModalContatoAberto(false);
            }

        }

        window.addEventListener("keydown", fecharComEsc);

        return () => {
            window.removeEventListener("keydown", fecharComEsc);
        };

    }, []);

    /* =====================================================
       EMPRESA PELO SLUG
    ===================================================== */

    const empresaSlug = location.pathname
        .replace("/", "")
        .replace(/^\/+/, "");

    /* =====================================================
       ABRIR MODAL
    ===================================================== */

    function abrirModalContato() {
        setModalContatoAberto(true);
    }

    function fecharModalContato() {
        setModalContatoAberto(false);
    }

    /* =====================================================
       CADASTRAR COMÉRCIO
    ===================================================== */

    function cadastrarComercio() {

        setModalContatoAberto(false);

        navigate("/cadastrocomercios");

    }

    /* =====================================================
       WHATSAPP
    ===================================================== */

    function solicitarWhatsapp() {

        const numero = "5511918547818";

        const mensagem = encodeURIComponent(
            "Olá Andy! Conheci a Iron Executions e gostaria de saber mais sobre o sistema comercial."
        );

        window.open(
            `https://wa.me/${numero}?text=${mensagem}`,
            "_blank",
            "noopener,noreferrer"
        );

        setModalContatoAberto(false);
    }

    return (

        <div className="inicio-modulos-fundo">

            {/* =================================================
                HEADER
            ================================================= */}

            <HeaderInicio
                empresaInicial={empresaSlug}
            />

            {/* =================================================
                LOGIN
            ================================================= */}

            <AreaLogin />

            <br />

            {/* =================================================
                LOJAS
            ================================================= */}

            <LojasAvaliacao />

            {/* =================================================
                MÓDULOS
            ================================================= */}

            <ExplicacaoModulos />

            {/* =================================================
                ASSISTENTE FLUTUANTE
            ================================================= */}

            <div className="inicio-modulos-whatsapp-float">

                <button
                    type="button"
                    className={`
                        inicio-modulos-whatsapp-assistente
                        ${
                            assistenteVisivel
                                ? "inicio-modulos-whatsapp-assistente--visivel"
                                : "inicio-modulos-whatsapp-assistente--oculto"
                        }
                    `}
                    onClick={abrirModalContato}
                    aria-label="Abrir opções da Iron Executions"
                >

                    <div className="inicio-modulos-whatsapp-assistente-topo">

                        <span
                            className="inicio-modulos-whatsapp-assistente-status"
                        />

                        <span className="inicio-modulos-whatsapp-assistente-nome">
                            Assistente Iron
                        </span>

                    </div>

                    <span className="inicio-modulos-whatsapp-assistente-texto">

                        {
                            mensagensAssistenteIron[
                                mensagemAssistenteAtual
                            ]
                        }

                    </span>

                    <span className="inicio-modulos-whatsapp-assistente-acao">
                        Ver opções →
                    </span>

                </button>

                {/* =================================================
                    BOTÃO FLUTUANTE
                ================================================= */}

                <button
                    type="button"
                    onClick={abrirModalContato}
                    className="inicio-modulos-whatsapp-button"
                    aria-label="Abrir opções de atendimento"
                >

                    <img
                        src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg"
                        alt=""
                        className="inicio-modulos-whatsapp-icon"
                    />

                    <span className="inicio-modulos-whatsapp-online" />

                </button>

            </div>

            {/* =================================================
                MODAL
            ================================================= */}

            {modalContatoAberto && (

                <div
                    className="inicio-modulos-modal-overlay"
                    onMouseDown={fecharModalContato}
                >

                    <div
                        className="inicio-modulos-modal-caixa"
                        onMouseDown={e => e.stopPropagation()}
                    >

                        {/* TOPO */}

                        <div className="inicio-modulos-modal-topo">

                            <div className="inicio-modulos-modal-marca">

                            <div className="inicio-modulos-modal-icone">
    <img
        src="/favicon.png"
        alt="Iron Executions"
        className="inicio-modulos-modal-logo"
    />
</div>

                                <div>

                                    <span className="inicio-modulos-modal-etiqueta">
                                        IRON EXECUTIONS
                                    </span>

                                    <h3>
                                        Como podemos ajudar?
                                    </h3>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={fecharModalContato}
                                className="inicio-modulos-modal-fechar"
                                aria-label="Fechar"
                            >
                                ×
                            </button>

                        </div>

                        {/* TEXTO */}

                        <p className="inicio-modulos-modal-descricao">

                            Escolha como deseja continuar. Você pode
                            iniciar agora o cadastro do seu comércio ou
                            conversar diretamente com o criador da
                            Iron Executions.

                        </p>

                        {/* OPÇÕES */}

                        <div className="inicio-modulos-modal-opcoes">

                            {/* CADASTRO */}

                            <button
                                type="button"
                                onClick={cadastrarComercio}
                                className="inicio-modulos-modal-opcao inicio-modulos-modal-opcao-cadastro"
                            >

                                <div className="inicio-modulos-modal-opcao-icone">
                                    +
                                </div>

                                <div className="inicio-modulos-modal-opcao-conteudo">

                                    <strong>
                                        Cadastrar meu comércio
                                    </strong>

                                    <span>
                                        Monte seu sistema, escolha os módulos
                                        e envie seu cadastro.
                                    </span>

                                </div>

                                <span className="inicio-modulos-modal-seta">
                                    →
                                </span>

                            </button>

                            {/* ANDY */}

                            <button
                                type="button"
                                onClick={solicitarWhatsapp}
                                className="inicio-modulos-modal-opcao inicio-modulos-modal-opcao-whatsapp"
                            >

                                <div className="inicio-modulos-modal-opcao-icone">
                                    W
                                </div>

                                <div className="inicio-modulos-modal-opcao-conteudo">

                                    <strong>
                                        Falar com Andy
                                    </strong>

                                    <span>
                                        Converse diretamente com Andy de Oliveira,
                                        criador da Iron Executions.
                                    </span>

                                </div>

                                <span className="inicio-modulos-modal-seta">
                                    →
                                </span>

                            </button>

                        </div>

                        {/* RODAPÉ MODAL */}

                        <div className="inicio-modulos-modal-rodape">

                            <span className="inicio-modulos-modal-status" />

                            Atendimento direto pela Iron Executions

                        </div>

                    </div>

                </div>

            )}

            {/* =================================================
                RODAPÉ
            ================================================= */}

            <Rodape />

        </div>

    );
}