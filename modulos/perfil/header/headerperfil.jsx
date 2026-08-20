import React, { useEffect, useState } from "react";
import ModalModulos from "./modals/modalmodulos";
import ModalCodigo from "./modals/modalcodigo";
import ModalQrcode from "./modals/modaqrcode";
import { API_URL } from "../../../config";

import "./headerperfil.css";

export default function HeaderPerfil({ minimizado, setMinimizado, refreshKey }) {
    const [eventoInstalacao, setEventoInstalacao] = useState(null);
    const [confirmarLogout, setConfirmarLogout] = useState(false);
    const [abrirFechamento, setAbrirFechamento] = useState(false);
    const [comandas, setComandas] = useState([]);
    const [tempoLogout, setTempoLogout] = useState(null);
    const [fechandoCaixa, setFechandoCaixa] = useState(false);
    const [dados, setDados] = useState(null);
    const [loja, setLoja] = useState(null);
    const [fade, setFade] = useState(false);
    const [alertaVencimento, setAlertaVencimento] = useState(null);
    const [pwaInstalado, setPwaInstalado] = useState(false);
    const CACHE_HEADER_USUARIO = "fasfdfbgfdg64fsd41f8sdfsdf";
    const CACHE_HEADER_LOJA = "fsd6f2d69s4f9sd485f1sdf";
    const CACHE_HEADER_COMANDAS = "4f5sd1f4esdf4658esdf";
    const [secaoAtiva, setSecaoAtiva] = useState(null);
    async function carregarComandas() {

        const cache = lerCache(
            CACHE_HEADER_COMANDAS
        );

        /* ==============================================
           MOSTRA CACHE IMEDIATAMENTE
        ============================================== */

        if (Array.isArray(cache)) {

            setComandas(cache);

            console.log(
                "[COMANDAS] Cache carregado:",
                cache.length
            );
        }

        try {

            const token =
                localStorage.getItem("token");

            const resp = await fetch(
                `${API_URL}/caixa/comandas`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resp.ok) {

                throw new Error(
                    `Erro ao buscar comandas: ${resp.status}`
                );
            }

            const json = await resp.json();

            const dadosServidor =
                Array.isArray(json)
                    ? json
                    : [];

            /* ==============================================
               COMPARA SERVIDOR COM CACHE
            ============================================== */

            if (
                !dadosCacheIguais(
                    cache,
                    dadosServidor
                )
            ) {

                console.log(
                    "[COMANDAS] Dados diferentes. Atualizando cache."
                );

                setComandas(
                    dadosServidor
                );

                salvarCache(
                    CACHE_HEADER_COMANDAS,
                    dadosServidor
                );

            } else {

                console.log(
                    "[COMANDAS] Cache já atualizado."
                );
            }

        } catch (erro) {

            console.error(
                "[COMANDAS] Erro ao consultar servidor:",
                erro
            );

            /*
                Se a API falhar e existe cache,
                simplesmente continuamos mostrando o cache.
            */

            if (!Array.isArray(cache)) {
                setComandas([]);
            }
        }
    }
    useEffect(() => {
        const modoStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;

        setPwaInstalado(modoStandalone);
    }, []);
    function dadosCacheIguais(cache, servidor) {

        if (cache === null || servidor === null) {
            return cache === servidor;
        }

        try {
            return JSON.stringify(cache) === JSON.stringify(servidor);
        } catch {
            return false;
        }
    }


    function lerCache(chave) {

        try {

            const salvo = localStorage.getItem(chave);

            if (!salvo) {
                return null;
            }

            return JSON.parse(salvo);

        } catch (erro) {

            console.warn(
                `[CACHE] Cache inválido: ${chave}`,
                erro
            );

            localStorage.removeItem(chave);

            return null;
        }
    }


    function salvarCache(chave, dados) {

        try {

            localStorage.setItem(
                chave,
                JSON.stringify(dados)
            );

        } catch (erro) {

            console.warn(
                `[CACHE] Não foi possível salvar: ${chave}`,
                erro
            );
        }
    }
    function gerarSlugEmpresa(nome) {
        if (!nome) return "";

        return nome
            .toLowerCase()
            .normalize("NFD")                 // remove acentos
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")     // remove caracteres inválidos
            .trim()
            .replace(/\s+/g, "-");            // troca espaços por -
    }
    async function carregarAlertaVencimento() {
        const token = localStorage.getItem("token");

        try {
            const resp = await fetch(`${API_URL}/admin/produtos-servicos/alerta-vencimento`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!resp.ok) {
                setAlertaVencimento(null);
                return;
            }

            const json = await resp.json();
            setAlertaVencimento(json);

        } catch {
            setAlertaVencimento(null);
        }
    }

    useEffect(() => {
        if (!dados) return;

        // Se NÃO existir função, inicia o contador
        if (!dados.funcao) {
            setTempoLogout(10);

            const intervalo = setInterval(() => {
                setTempoLogout(prev => {
                    if (prev === 1) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("usuario");
                        window.location.href = "/";
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(intervalo);
        }

        // Se existir função, não faz nada
        setTempoLogout(null);
    }, [dados]);


    useEffect(() => {

        let componenteAtivo = true;

        async function carregar() {

            /* ==============================================
               1. CARREGA USUÁRIO DO CACHE
            ============================================== */

            const usuarioCache =
                lerCache(CACHE_HEADER_USUARIO);

            const lojaCache =
                lerCache(CACHE_HEADER_LOJA);


            if (
                componenteAtivo &&
                usuarioCache
            ) {

                setDados(
                    usuarioCache
                );

                console.log(
                    "[HEADER] Usuário carregado do cache."
                );
            }


            if (
                componenteAtivo &&
                lojaCache
            ) {

                setLoja(
                    lojaCache
                );

                console.log(
                    "[HEADER] Loja carregada do cache."
                );
            }


            /*
                Se existe cache, o header já aparece
                imediatamente.
    
                A partir daqui verificamos o servidor
                em segundo plano.
            */

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {

                    console.warn(
                        "[HEADER] Token não encontrado."
                    );

                    return;
                }


                /* ==============================================
                   2. BUSCA USUÁRIO ATUAL
                ============================================== */

                const resp = await fetch(
                    `${API_URL}/clientes/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );


                if (!resp.ok) {

                    throw new Error(
                        `Erro /clientes/me: ${resp.status}`
                    );
                }


                const json =
                    await resp.json();


                if (!componenteAtivo) {
                    return;
                }


                /* ==============================================
                   3. COMPARA USUÁRIO
                ============================================== */

                if (
                    !dadosCacheIguais(
                        usuarioCache,
                        json
                    )
                ) {

                    console.log(
                        "[HEADER] Usuário mudou. Atualizando cache."
                    );

                    setDados(
                        json
                    );

                    salvarCache(
                        CACHE_HEADER_USUARIO,
                        json
                    );

                } else {

                    console.log(
                        "[HEADER] Usuário sem alterações."
                    );
                }


                /*
                    Mantemos seu localStorage "usuario"
                    porque outras partes do sistema podem
                    depender dele.
                */

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(json)
                );


                /* ==============================================
                   4. CARREGA LOJA
                ============================================== */

                if (json.comercio_id) {

                    try {

                        const respLoja =
                            await fetch(
                                `${API_URL}/comercios/${json.comercio_id}`
                            );


                        if (!respLoja.ok) {

                            throw new Error(
                                `Erro ao buscar comércio: ${respLoja.status}`
                            );
                        }


                        const lojaJson =
                            await respLoja.json();


                        if (!componenteAtivo) {
                            return;
                        }


                        /* ======================================
                           5. COMPARA LOJA
                        ====================================== */

                        if (
                            !dadosCacheIguais(
                                lojaCache,
                                lojaJson
                            )
                        ) {

                            console.log(
                                "[HEADER] Loja mudou. Atualizando cache."
                            );

                            setLoja(
                                lojaJson
                            );

                            salvarCache(
                                CACHE_HEADER_LOJA,
                                lojaJson
                            );

                        } else {

                            console.log(
                                "[HEADER] Loja sem alterações."
                            );
                        }


                    } catch (erroLoja) {

                        console.error(
                            "[HEADER] Erro ao atualizar loja:",
                            erroLoja
                        );

                        /*
                            Só remove visualmente a loja
                            se também não existir cache.
                        */

                        if (!lojaCache) {
                            setLoja(null);
                        }
                    }


                    /* ==============================================
                       ALERTA CONTINUA NORMAL
                    ============================================== */

                    await carregarAlertaVencimento();
                }


                /* ==============================================
                   ANIMAÇÃO
                ============================================== */

                if (componenteAtivo) {

                    setFade(false);

                    setTimeout(() => {

                        if (componenteAtivo) {
                            setFade(true);
                        }

                    }, 120);
                }


            } catch (erro) {

                console.error(
                    "[HEADER] Erro ao atualizar header:",
                    erro
                );

                /*
                    Não apagamos os states aqui.
    
                    Se o servidor estiver fora,
                    usuário continua vendo o cache.
                */
            }
        }


        carregar();


        return () => {

            componenteAtivo = false;

        };

    }, [refreshKey]);

    useEffect(() => {
        function capturar(e) {
            console.log("beforeinstallprompt disparou");
            e.preventDefault();
            setEventoInstalacao(e);
        }

        window.addEventListener("beforeinstallprompt", capturar);

        return () => {
            window.removeEventListener("beforeinstallprompt", capturar);
        };
    }, []);


    async function instalarApp() {
        if (!eventoInstalacao) {
            alert("Instalação não disponível neste navegador");
            return;
        }

        eventoInstalacao.prompt();
        const escolha = await eventoInstalacao.userChoice;

        if (escolha.outcome === "accepted") {
            setPwaInstalado(true);
            setEventoInstalacao(null);
        }
    }


    function abrirOuFechar(secao) {
        setSecaoAtiva(prev => prev === secao ? null : secao);
    }

    // skeleton
    if (!dados) {
        return (
            <div className="skeleton-header">
                <div className="loading-logo"></div>
                <div className="loading-lines">
                    <div className="loading-line"></div>
                    <div className="loading-line small"></div>
                </div>
            </div>
        );
    }

    if (minimizado) {
        return (
            <div style={{ display: "none" }}
                className="header-mini header-mini-anim"
                onClick={() => {
                    setMinimizado(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
            >
                <img src={loja?.imagem} className="mini-img" />
                <span className="mini-nome">{loja?.loja}</span>
            </div>
        );
    }

    function logout() {
        if (!confirmarLogout) {
            setConfirmarLogout(true);

            setTimeout(() => {
                setConfirmarLogout(false);
            }, 3000);

            return;
        }

        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        const nomeEmpresa =
            loja?.loja ||
            usuario.loja ||
            usuario.nome_empresa ||
            usuario.empresa;

        const empresaSlug = gerarSlugEmpresa(nomeEmpresa);

        if (empresaSlug) {
            const baseUrl = window.location.origin;
            window.location.href = `${baseUrl}/${empresaSlug}`;
        } else {
            window.location.href = "/";
        }
    }


    return (
        <>
            <header className={`per-header fade-in ${fade ? "show" : ""} header-full-anim`}>

                {loja && (
                    <div className="per-loja">
                        <img src={loja.imagem} alt="Logo" className="per-loja-img" />
                        <h2 className="per-loja-nome">{loja.loja}</h2>
                    </div>
                )}

                <div className="per-info">
                    <h2 className="per-nome">{dados.nome_completo}</h2>
                    <p className="per-cargo">Cargo: <strong> {dados.cargo} </strong> </p>
                    <p className="per-funcao">
                        Função no sistema:{" "}
                        {dados.funcao ? (
                            <strong>{dados.funcao}</strong>
                        ) : (
                            <strong className="funcao-alerta">
                                sessão inválida, saindo em {tempoLogout}s
                            </strong>
                        )}
                    </p>
                    {alertaVencimento?.alerta && (
                        <p className="alerta-vencimento">
                            ⚠️ Existem {alertaVencimento.total} produtos que vão vencer ou já venceram
                        </p>
                    )}

                </div>

                <div className="per-acoes">
                    <button
                        className="per-btn fechar-caixa"
                        onClick={() => {
                            setAbrirFechamento(true);
                            carregarComandas();
                        }}
                    >
                        Fechamento
                    </button>





                    <button className="per-btn" onClick={() => abrirOuFechar("codigo")}>
                        Código
                    </button>

                    <button className="per-btn" onClick={() => abrirOuFechar("qrcode")}>
                        QR Code
                    </button>

                    {eventoInstalacao && !pwaInstalado && (
                        <button className="per-btn baixar-app" onClick={instalarApp}>
                            Baixar App
                        </button>
                    )}

                    <button className="per-btn logout-btn" onClick={logout}>
                        {confirmarLogout ? "Confirmar saída" : "Sair"}
                    </button>


                </div>

            </header>

            {/* ÁREA EXPANSÍVEL */}
            <div className={`secao-expandida ${secaoAtiva ? "abrir" : ""}`}>
                {secaoAtiva === "modulos" && (
                    <ModalModulos dados={dados} fechar={() => setSecaoAtiva(null)} />
                )}

                {secaoAtiva === "codigo" && (
                    <ModalCodigo codigo={dados.codigo} fechar={() => setSecaoAtiva(null)} />
                )}

                {secaoAtiva === "qrcode" && (
                    <ModalQrcode qrcode={dados.qrcode} fechar={() => setSecaoAtiva(null)} />
                )}
            </div>
            {abrirFechamento && (
                <div className="modal-overlay">
                    <div className="modal-fechamento">

                        {/* BOTÃO FECHAR MODAL */}
                        <button
                            className="modal-fechar"
                            onClick={() => setAbrirFechamento(false)}
                        >
                            ✕
                        </button>

                        {/* BOTÃO FECHAR CAIXA */}
                        <button
                            className="per-btn fechar-caixa"
                            disabled={fechandoCaixa}
                            onClick={async () => {

                                if (fechandoCaixa) return;

                                try {

                                    setFechandoCaixa(true);

                                    const token = localStorage.getItem("token");

                                    const resp = await fetch(`${API_URL}/caixa/fechar`, {
                                        method: "POST",
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    });

                                    if (!resp.ok) {

                                        const erro = await resp.json();

                                        alert(erro.detail || "Erro ao fechar caixa");

                                        setFechandoCaixa(false);

                                        return;
                                    }

                                    alert("Caixa fechado com sucesso");

                                    carregarComandas();

                                } catch {

                                    alert("Erro ao fechar caixa");

                                } finally {

                                    setFechandoCaixa(false);

                                }
                            }}
                        >
                            {fechandoCaixa ? "Fechando caixa..." : "Fechar Caixa"}
                        </button>

                        {/* LISTA DE COMANDAS */}
                        <div className="lista-comandas">
                            {comandas.length === 0 && (
                                <p className="sem-comandas">Nenhuma comanda registrada</p>
                            )}

                            {comandas.map(c => (
                                <div
                                    key={c.id}
                                    className="item-comanda"
                                    onClick={() => window.open(c.link, "_blank")}
                                >
                                    <strong>Comanda</strong>
                                    <span>{c.data} {c.hora}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}

        </>
    );
}
