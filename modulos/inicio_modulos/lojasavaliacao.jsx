import React, { useEffect, useState } from "react";

import "./lojasavaliacao.css";
import { API_URL } from "../../config";

export default function LojasAvaliacao() {

    const [lojas, setLojas] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {

        async function carregar() {

            try {

                setCarregando(true);
                setErro("");

                const resp = await fetch(
                    `${API_URL}/cadastrados/comercios_cadastradas`
                );

                if (!resp.ok) {
                    throw new Error("Erro ao carregar lojas");
                }

                const dados = await resp.json();

                setLojas(Array.isArray(dados) ? dados : []);

            } catch (err) {

                console.error("[LOJAS AVALIAÇÃO] Erro:", err);

                setErro("Não foi possível carregar os comércios.");

            } finally {

                setCarregando(false);

            }

        }

        carregar();

    }, []);


    function renderEstrelas(nota) {

        if (
            nota === null ||
            nota === undefined ||
            Number.isNaN(Number(nota))
        ) {
            return (
                <span className="lojas-avaliacao-sem-nota">
                    Ainda sem avaliação
                </span>
            );
        }

        const notaNumero = Number(nota);

        const estrelasCheias = Math.floor(notaNumero);
        const meiaEstrela = notaNumero % 1 >= 0.5;

        const estrelasVazias =
            5 -
            estrelasCheias -
            (meiaEstrela ? 1 : 0);

        const icones = [];

        for (let i = 0; i < estrelasCheias; i++) {
            icones.push(
                <span
                    key={`cheia-${i}`}
                    className="lojas-avaliacao-estrela lojas-avaliacao-estrela-cheia"
                >
                    ★
                </span>
            );
        }

        if (meiaEstrela) {
            icones.push(
                <span
                    key="meia"
                    className="lojas-avaliacao-estrela lojas-avaliacao-estrela-meia"
                >
                    ★
                </span>
            );
        }

        for (let i = 0; i < estrelasVazias; i++) {
            icones.push(
                <span
                    key={`vazia-${i}`}
                    className="lojas-avaliacao-estrela lojas-avaliacao-estrela-vazia"
                >
                    ★
                </span>
            );
        }

        return (
            <div className="lojas-avaliacao-nota-area">

                <div className="lojas-avaliacao-estrelas">
                    {icones}
                </div>

                <span className="lojas-avaliacao-nota-numero">
                    {notaNumero.toFixed(1)}
                </span>

            </div>
        );

    }


    function imagemErro(e, nomeLoja) {

        e.currentTarget.style.display = "none";

        const placeholder =
            e.currentTarget.parentElement?.querySelector(
                ".lojas-avaliacao-logo-placeholder"
            );

        if (placeholder) {
            placeholder.style.display = "flex";
            placeholder.textContent =
                nomeLoja?.charAt(0)?.toUpperCase() || "?";
        }

    }


    return (

        <section className="lojas-avaliacao-container">

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="lojas-avaliacao-cabecalho">

              

                <h2 className="lojas-avaliacao-titulo">
                    Comércios que usam nosso sistema
                </h2>

                <p className="lojas-avaliacao-subtitulo">
                    Empresas que já fazem parte da nossa plataforma
                </p>

            </div>


            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (

                <div className="lojas-avaliacao-erro">
                    {erro}
                </div>

            )}


            {/* =================================================
                CARREGANDO
            ================================================= */}

            {carregando && (

                <div className="lojas-avaliacao-carregando">

                    <div className="lojas-avaliacao-loader" />

                    <span>
                        Carregando comércios...
                    </span>

                </div>

            )}


            {/* =================================================
                LISTA
            ================================================= */}

            {!carregando && !erro && lojas.length > 0 && (

                <div className="lojas-avaliacao-scroll">

                    <ul className="lojas-avaliacao-lista">

                        {lojas.map((loja, index) => (

                            <li
                                key={loja.id || index}
                                className="lojas-avaliacao-card"
                            >

                                <div className="lojas-avaliacao-logo-area">

                                    <div className="lojas-avaliacao-logo-fundo">

                                        {loja.imagem && (

                                            <img
                                                src={loja.imagem}
                                                alt={loja.loja}
                                                className="lojas-avaliacao-logo"
                                                loading="lazy"
                                                onError={(e) =>
                                                    imagemErro(
                                                        e,
                                                        loja.loja
                                                    )
                                                }
                                            />

                                        )}

                                        <div
                                            className="lojas-avaliacao-logo-placeholder"
                                            style={{
                                                display: loja.imagem
                                                    ? "none"
                                                    : "flex"
                                            }}
                                        >
                                            {loja.loja
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                        </div>

                                    </div>

                                    <div
                                        className="lojas-avaliacao-status"
                                        title="Empresa ativa"
                                    />

                                </div>


                                <div className="lojas-avaliacao-info">

                                    <h3 className="lojas-avaliacao-nome">
                                        {loja.loja}
                                    </h3>

                                    <div className="lojas-avaliacao-status-texto">

                                        <span className="lojas-avaliacao-status-icone" />

                                        Utiliza Iron Business

                                    </div>

                                    {loja.nota !== undefined && (
                                        <div className="lojas-avaliacao-avaliacao">
                                            {renderEstrelas(loja.nota)}
                                        </div>
                                    )}

                                </div>


                                <div className="lojas-avaliacao-card-detalhe">
                                    <span />
                                </div>

                            </li>

                        ))}

                    </ul>

                </div>

            )}


            {/* =================================================
                LISTA VAZIA
            ================================================= */}

            {!carregando && !erro && lojas.length === 0 && (

                <div className="lojas-avaliacao-vazio">

                    <div className="lojas-avaliacao-vazio-icone">
                        ◇
                    </div>

                    <strong>
                        Nenhum comércio encontrado
                    </strong>

                    <span>
                        Novos comércios aparecerão aqui.
                    </span>

                </div>

            )}

        </section>

    );

}