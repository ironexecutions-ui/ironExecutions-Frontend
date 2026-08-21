import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import AreaLogin from "./inicio_modulos/arealogin";
import LojasAvaliacao from "./inicio_modulos/lojasavaliacao";
import Rodape from "./inicio_modulos/rodape";
import ExplicacaoModulos from "./inicio_modulos/explicacaomodulos";
import HeaderInicio from "./inicio_modulos/headerinicio";

import "./inicio-modulos.css";

export default function InicioModulos() {

    const location = useLocation();

    /* =====================================================
       MENSAGENS DO ASSISTENTE
    ===================================================== */

    const mensagensAssistenteIron = [
        "Olá! Posso te ajudar a conhecer melhor o Iron Executions?",

        "Quer descobrir quais módulos fazem mais sentido para o seu comércio?",

        "Seu sistema pode ser montado de acordo com as necessidades do seu negócio.",

        "Tem alguma dúvida sobre valores, módulos ou funcionamento do sistema?",

        "Clique aqui e fale diretamente com Andy de Oliveira, criador da Iron Executions.",

        "Quer modernizar a gestão do seu comércio? Posso te mostrar por onde começar.",

        "Conheça uma solução criada para simplificar vendas, administração e gestão do seu negócio.",

        "Não sabe qual módulo contratar? Fale com Andy e descubra a melhor opção para seu comércio.",

        "Precisa de algo específico para sua empresa? A Iron Executions também desenvolve soluções personalizadas.",

        "Seu comércio pode ter um sistema mais rápido, organizado e adaptado à sua rotina.",

        "Quer entender quanto custaria o sistema ideal para o seu negócio? Clique aqui para conversar.",

        "Produtividade, Administração e Fiscal podem trabalhar juntos para facilitar sua operação.",

        "Quer começar a usar o Iron Business? Fale diretamente com Andy pelo WhatsApp.",

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
       EMPRESA PELO SLUG
    ===================================================== */

    const empresaSlug = location.pathname
        .replace("/", "")
        .replace(/^\/+/, "");


    /* =====================================================
       WHATSAPP
    ===================================================== */

    function solicitarWhatsapp() {

        const numero = "5511918547818";

        const mensagem = encodeURIComponent(
            "Olá! Conheci a Iron Executions e gostaria de saber mais sobre o sistema comercial."
        );

        window.open(
            `https://wa.me/${numero}?text=${mensagem}`,
            "_blank",
            "noopener,noreferrer"
        );

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
                    onClick={solicitarWhatsapp}
                    aria-label="Falar com Andy de Oliveira"
                >

                    <div className="inicio-modulos-whatsapp-assistente-topo">

                        <span
                            className="inicio-modulos-whatsapp-assistente-status"
                        />

                        

                    </div>


                    <span className="inicio-modulos-whatsapp-assistente-texto">

                        {
                            mensagensAssistenteIron[
                                mensagemAssistenteAtual
                            ]
                        }

                    </span>


                    <span className="inicio-modulos-whatsapp-assistente-acao">

                        Falar com Andy →

                    </span>

                </button>


                {/* =================================================
                    BOTÃO WHATSAPP
                ================================================= */}

                <button
                    type="button"
                    onClick={solicitarWhatsapp}
                    className="inicio-modulos-whatsapp-button"
                    aria-label="Falar com Andy de Oliveira pelo WhatsApp"
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
                RODAPÉ
            ================================================= */}

            <Rodape />

        </div>

    );

}