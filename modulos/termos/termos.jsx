import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIronExecutions from "./logo.png";
import { API_URL } from "../../config";

import "./termos.css";


const CACHE_TERMOS_USUARIO =
    "iron_termos_usuario_cache_v1";


function lerCacheTermos() {

    try {

        const salvo =
            localStorage.getItem(
                CACHE_TERMOS_USUARIO
            );

        if (!salvo) {
            return null;
        }

        return JSON.parse(salvo);

    } catch (erro) {

        console.warn(
            "[TERMOS] Cache inválido:",
            erro
        );

        localStorage.removeItem(
            CACHE_TERMOS_USUARIO
        );

        return null;
    }
}


function salvarCacheTermos(dados) {

    try {

        localStorage.setItem(
            CACHE_TERMOS_USUARIO,
            JSON.stringify(dados)
        );

    } catch (erro) {

        console.warn(
            "[TERMOS] Não foi possível salvar cache:",
            erro
        );
    }
}


function obterDataLocalHoje() {

    const agora = new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarData(data) {

    if (!data) {
        return "";
    }

    const texto =
        String(data);

    const partes =
        texto.split(" ")[0]?.split("-");

    if (
        !partes ||
        partes.length !== 3
    ) {
        return texto;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


export default function Termos() {



    const navigate =
        useNavigate();

    const [termos, setTermos] =
        useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [erro, setErro] =
        useState(null);

    const [assinandoId, setAssinandoId] =
        useState(null);

    const [mensagem, setMensagem] =
        useState(null);
    const [clienteMe, setClienteMe] = useState(null);
    useEffect(() => {
        async function carregarCliente() {
            const token = localStorage.getItem("token");

            console.log("[TERMOS] Token:", token ? "EXISTE" : "NÃO EXISTE");
            console.log("[TERMOS] URL clientes/me:", `${API_URL}/clientes/me`);

            if (!token) {
                console.error("[TERMOS] Token não encontrado.");
                return;
            }

            try {
                const resposta = await fetch(
                    `${API_URL}/clientes/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log(
                    "[TERMOS] Status /clientes/me:",
                    resposta.status
                );

                const dados = await resposta.json();

                console.log(
                    "[TERMOS] RESPOSTA COMPLETA /clientes/me:",
                    dados
                );

                if (!resposta.ok) {
                    throw new Error(
                        dados?.detail ||
                        `Erro ${resposta.status} ao carregar cliente`
                    );
                }

                setClienteMe(dados);

            } catch (erro) {
                console.error(
                    "[TERMOS] ERRO /clientes/me:",
                    erro
                );
            }
        }

        carregarCliente();
    }, []);
    async function carregarTermos() {

        const token =
            localStorage.getItem("token");

        if (!token) {

            navigate("/");

            return;
        }

        try {

            setCarregando(true);
            setErro(null);

            const resposta =
                await fetch(
                    `${API_URL}/termos`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            if (
                resposta.status === 401 ||
                resposta.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                navigate("/");

                return;
            }

            if (!resposta.ok) {

                throw new Error(
                    `Erro ao carregar termos: ${resposta.status}`
                );
            }

            const json =
                await resposta.json();

            const lista =
                Array.isArray(json?.termos)
                    ? json.termos
                    : [];

            setTermos(lista);

        } catch (erroAtual) {

            console.error(
                "[TERMOS] Erro:",
                erroAtual
            );

            setErro(
                "Não foi possível carregar os termos. Tente novamente."
            );

        } finally {

            setCarregando(false);
        }
    }


    useEffect(() => {

        carregarTermos();

    }, []);


    const termosPendentes =
        useMemo(
            () =>
                termos.filter(
                    termo =>
                        Boolean(
                            termo.pendente
                        )
                ),
            [termos]
        );


    const termosAceitos =
        useMemo(
            () =>
                termos.filter(
                    termo =>
                        !Boolean(
                            termo.pendente
                        )
                ),
            [termos]
        );


    async function aceitarTermo(termo) {

        if (!termo?.id) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {

            navigate("/");

            return;
        }

        try {

            setAssinandoId(
                termo.id
            );

            setMensagem(null);

            const resposta =
                await fetch(
                    `${API_URL}/termos/${termo.id}/assinar`,
                    {
                        method: "POST",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            if (
                resposta.status === 401 ||
                resposta.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                navigate("/");

                return;
            }

            const json =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    json?.detail ||
                    "Não foi possível aceitar o termo."
                );
            }

            setMensagem(
                "Termo aceito com sucesso."
            );

            /*
             * Atualiza imediatamente a tela
             * sem depender de um novo login.
             */

            setTermos(
                atual =>
                    atual.map(item => {

                        if (
                            String(item.id) !==
                            String(termo.id)
                        ) {
                            return item;
                        }

                        return {
                            ...item,
                            pendente: false,
                            data_assinatura:
                                json.data_assinatura
                        };
                    })
            );

            /*
             * Remove a pendência do cache
             * para evitar que o modal continue
             * aparecendo enquanto o servidor
             * já confirmou a assinatura.
             */

            const cache =
                lerCacheTermos();

            if (cache) {

                const pendentes =
                    Array.isArray(
                        cache.termos_pendentes
                    )
                        ? cache.termos_pendentes
                            .filter(
                                id =>
                                    String(id) !==
                                    String(termo.id)
                            )
                        : [];

                salvarCacheTermos({
                    ...cache,
                    termos_pendentes:
                        pendentes,
                    total_pendentes:
                        pendentes.length,
                    atualizado_em:
                        new Date().toISOString()
                });
            }

        } catch (erroAtual) {

            console.error(
                "[TERMOS] Erro ao assinar:",
                erroAtual
            );

            setMensagem(
                erroAtual.message ||
                "Não foi possível aceitar o termo."
            );

        } finally {

            setAssinandoId(null);
        }
    }

    const nomeComercio =
        clienteMe?.loja || "Seu Comércio";

    const logoComercio =
        clienteMe?.imagem || null;
    function obterUrlImagemComercio(imagem) {

        if (!imagem) {
            return null;
        }

        if (
            imagem.startsWith("http://") ||
            imagem.startsWith("https://") ||
            imagem.startsWith("blob:")
        ) {
            return imagem;
        }

        return `${API_URL}${imagem.startsWith("/") ? "" : "/"}${imagem}`;
    }
    if (carregando) {

        return (
            <div className="termos-pagina">

                <div className="termos-carregamento">

                    <div className="termos-spinner" />

                    <h2>
                        Carregando termos
                    </h2>

                    <p>
                        Aguarde enquanto verificamos
                        os termos disponíveis.
                    </p>

                </div>

            </div>
        );
    }


    return (
        <div className="termos-pagina">

            <main className="termos-conteudo">

                {/* ================================
                CABEÇALHO INSTITUCIONAL
            ================================= */}

                <section className="termos-aliança">

                    <button
                        type="button"
                        className="termos-botao-voltar"
                        onClick={() => navigate(-1)}
                    >
                        ← Voltar
                    </button>

                    <div className="termos-aliança-conteudo">

                        <div className="termos-marca ironexecutions-marca">

                            <img
                                src={logoIronExecutions}
                                alt="Iron Executions"
                                className="termos-logo-ironexecutions-imagem"
                            />

                            <div className="termos-ironexecutions-nome">
                                IRON EXECUTIONS
                            </div>

                            <span className="termos-marca-legenda">
                                Tecnologia, gestão e inovação
                            </span>

                        </div>






                        <div className="termos-aliança-simbolo">
                            <span className="termos-aliança-linha" />

                            <div className="termos-aliança-icone">
                                ×
                            </div>

                            <span className="termos-aliança-linha" />
                        </div>


                        <div className="termos-marca comercio-marca">

                            {logoComercio && (
                                <img
                                    src={logoComercio}
                                    alt={nomeComercio}
                                    className="termos-logo-comercio"
                                />
                            )}

                            <div className="termos-comercio-nome">
                                {nomeComercio}
                            </div>

                            <span className="termos-marca-legenda">
                                Comércio parceiro
                            </span>

                        </div>

                    </div>


                    <div className="termos-aliança-titulo">

                        <span className="termos-aliança-etiqueta">
                            RELAÇÃO COMERCIAL
                        </span>

                        <h1>
                            Termos e Condições
                        </h1>

                        <p>
                            Documento oficial que estabelece as condições de
                            utilização da plataforma e a relação entre a
                            Iron Executions e o seu comércio.
                        </p>

                    </div>

                </section>


                {/* ================================
                MENSAGEM DE STATUS
            ================================= */}

                {mensagem && (
                    <div
                        className={
                            mensagem.includes("sucesso")
                                ? "termos-mensagem termos-mensagem-sucesso"
                                : "termos-mensagem termos-mensagem-erro"
                        }
                    >
                        {mensagem}
                    </div>
                )}


                {/* ================================
                ERRO
            ================================= */}

                {erro && (
                    <section className="termos-erro">

                        <h2>
                            Não foi possível carregar
                        </h2>

                        <p>
                            {erro}
                        </p>

                        <button
                            type="button"
                            className="termos-botao-recarregar"
                            onClick={carregarTermos}
                        >
                            Tentar novamente
                        </button>

                    </section>
                )}


                {!erro && (
                    <>

                        {/* ================================
                        TERMOS PENDENTES
                    ================================= */}

                        {termosPendentes.length > 0 && (
                            <section className="termos-secao">

                                <div className="termos-secao-cabecalho">

                                    <div>

                                        <span className="termos-status-pendente">
                                            AÇÃO NECESSÁRIA
                                        </span>

                                        <h2>
                                            Termos aguardando aceitação
                                        </h2>

                                        <p>
                                            Leia atentamente os documentos abaixo
                                            e confirme sua aceitação para manter
                                            seu cadastro atualizado.
                                        </p>

                                    </div>

                                    <span className="termos-contador-pendente">
                                        {termosPendentes.length}
                                    </span>

                                </div>


                                <div className="termos-lista">

                                    {termosPendentes.map((termo) => (

                                        <article
                                            key={termo.id}
                                            className="termos-card termos-card-pendente"
                                        >

                                            <div className="termos-card-topo">

                                                <div>

                                                    <span className="termos-card-numero">
                                                        DOCUMENTO #{termo.id}
                                                    </span>

                                                    <h3>
                                                        {termo.tema ||
                                                            "Termos e condições"}
                                                    </h3>

                                                </div>

                                                <span className="termos-card-badge-pendente">
                                                    Pendente
                                                </span>

                                            </div>


                                            <div className="termos-card-data">
                                                Atualizado em{" "}
                                                {formatarData(termo.data)}
                                            </div>


                                            <div className="termos-card-clausulas">
                                                {termo.clausulas}
                                            </div>


                                            <div className="termos-card-rodape">

                                                <p>
                                                    Este documento precisa ser
                                                    aceito para que sua assinatura
                                                    permaneça atualizada.
                                                </p>

                                                <button
                                                    type="button"
                                                    className="termos-botao-aceitar"
                                                    disabled={
                                                        assinandoId === termo.id
                                                    }
                                                    onClick={() =>
                                                        aceitarTermo(termo)
                                                    }
                                                >
                                                    {assinandoId === termo.id
                                                        ? "Registrando..."
                                                        : "Aceitar termos"}
                                                </button>

                                            </div>

                                        </article>

                                    ))}

                                </div>

                            </section>
                        )}


                        {/* ================================
                        TERMOS ACEITOS
                    ================================= */}

                        {termosAceitos.length > 0 && (
                            <section className="termos-secao termos-secao-aceitos">

                                <div className="termos-secao-cabecalho">

                                    <div>

                                        <span className="termos-status-aceito">
                                            ATUALIZADOS
                                        </span>

                                        <h2>
                                            Termos aceitos
                                        </h2>

                                        <p>
                                            Estes documentos estão atualizados
                                            para o seu comércio.
                                        </p>

                                    </div>

                                </div>


                                <div className="termos-lista">

                                    {termosAceitos.map((termo) => (

                                        <article
                                            key={termo.id}
                                            className="termos-card termos-card-aceito"
                                        >

                                            <div className="termos-card-topo">

                                                <div>

                                                    <span className="termos-card-numero">
                                                        DOCUMENTO #{termo.id}
                                                    </span>

                                                    <h3>
                                                        {termo.tema ||
                                                            "Termos e condições"}
                                                    </h3>

                                                </div>

                                                <span className="termos-card-badge-aceito">
                                                    Aceito
                                                </span>

                                            </div>


                                            <div className="termos-card-data">
                                                Atualizado em{" "}
                                                {formatarData(termo.data)}
                                            </div>


                                            <div className="termos-card-clausulas">
                                                {termo.clausulas}
                                            </div>


                                            {termo.data_assinatura && (
                                                <div className="termos-card-assinatura">
                                                    Aceito em{" "}
                                                    {formatarData(
                                                        termo.data_assinatura
                                                    )}
                                                </div>
                                            )}

                                        </article>

                                    ))}

                                </div>

                            </section>
                        )}


                        {/* ================================
                        NENHUM TERMO
                    ================================= */}

                        {termos.length === 0 && (
                            <section className="termos-vazio">

                                <h2>
                                    Nenhum termo disponível
                                </h2>

                                <p>
                                    No momento não existem termos disponíveis
                                    para este comércio.
                                </p>

                            </section>
                        )}

                    </>
                )}


                {/* ================================
                RODAPÉ INSTITUCIONAL
            ================================= */}

                <footer className="termos-rodape">

                    <div className="termos-rodape-marca">
                        <strong>
                            IRON EXECUTIONS
                        </strong>
                        {" "}
                        <span>
                            Plataforma de tecnologia e gestão.
                        </span>
                    </div>
                    {"  "}
                    <div className="termos-rodape-divisor" />

                    <p><span> </span>
                        Documento destinado ao comércio
                        <strong> {nomeComercio}</strong>.
                    </p>

                </footer>

            </main>

        </div>
    );
}