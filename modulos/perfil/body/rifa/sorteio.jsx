import React, { useState, useEffect } from "react";
import { API_URL } from "../../../../config";
import "./sorteio.css";

export default function SorteioRifa({ rifa, premio }) {

    const [tempo, setTempo] = useState("");
    const [numeroAnimado, setNumeroAnimado] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [erro, setErro] = useState(null);
    const [rodando, setRodando] = useState(false);
    const [verificandoResultado, setVerificandoResultado] = useState(true);
    const [liberadoParaSorteio, setLiberadoParaSorteio] = useState(false);
    const [comemorar, setComemorar] = useState(false);
    const [dadosGanhadorVisiveis, setDadosGanhadorVisiveis] = useState(false);

    // =========================================================
    // VERIFICAR SE O SORTEIO JÁ ESTÁ LIBERADO
    // =========================================================

    useEffect(() => {

        if (!rifa?.data_fim) return;

        const agora = new Date();
        const dataFim = new Date(rifa.data_fim);

        if (agora >= dataFim) {
            setLiberadoParaSorteio(true);
        } else {
            setLiberadoParaSorteio(false);
        }

    }, [rifa]);


    // =========================================================
    // INTERVALO DA RIFA
    // =========================================================

    const [inicioRifa, fimRifa] =
        rifa?.numeros && rifa.numeros.includes("-")
            ? rifa.numeros.split("-").map(Number)
            : [null, null];


    // =========================================================
    // TOTAL DE NÚMEROS
    // =========================================================

    const totalNumeros =
        inicioRifa !== null &&
            fimRifa !== null
            ? fimRifa - inicioRifa + 1
            : 0;


    // =========================================================
    // VERIFICAR SE JÁ FOI SORTEADA
    // =========================================================

    useEffect(() => {

        if (!rifa?.id) return;

        setVerificandoResultado(true);

        fetch(`${API_URL}/rifa/${rifa.id}/resultado`)
            .then(r => r.json())
            .then(data => {

                if (data?.sorteado) {
                    setResultado(data);
                    setNumeroAnimado(data.numero);
                }

            })
            .catch(() => { })
            .finally(() => {
                setVerificandoResultado(false);
            });

    }, [rifa]);


    // =========================================================
    // INICIAR SORTEIO
    // =========================================================

    async function iniciarSorteio() {

        if (!tempo || Number(tempo) <= 0) return;

        if (inicioRifa == null || fimRifa == null) {
            setErro("Intervalo da rifa inválido.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setErro("Sua sessão não foi encontrada. Faça login novamente.");
            return;
        }

        setRodando(true);
        setErro(null);
        setResultado(null);
        setNumeroAnimado(null);

        let resultadoBackend;

        try {

            const r = await fetch(
                `${API_URL}/rifa/${rifa.id}/sortear`,
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await r.json().catch(() => null);

            if (r.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("usuario");

                window.location.replace("/");
                return;
            }

            if (r.status === 403) {

                throw new Error(
                    data?.detail ||
                    "Você não possui permissão para realizar este sorteio."
                );
            }

            if (!r.ok) {

                throw new Error(
                    data?.detail ||
                    `Erro ao realizar sorteio (${r.status}).`
                );
            }

            resultadoBackend = data;

        } catch (e) {

            setErro(
                e?.message ||
                "Não foi possível realizar o sorteio."
            );

            setRodando(false);

            return;
        }


        // =====================================================
        // ANIMAÇÃO VISUAL
        // =====================================================

        const duracao = Number(tempo) * 1000;
        const inicioTempo = Date.now();

        const animacao = setInterval(() => {

            const fake =
                Math.floor(
                    Math.random() *
                    (fimRifa - inicioRifa + 1)
                ) + inicioRifa;

            setNumeroAnimado(fake);

            if (Date.now() - inicioTempo >= duracao) {

                clearInterval(animacao);

                setNumeroAnimado(
                    resultadoBackend.numero
                );

                setResultado(
                    resultadoBackend
                );

                setRodando(false);

                if (!resultadoBackend.sem_ganhador) {

                    setComemorar(true);

                    setTimeout(() => {
                        setComemorar(false);
                    }, 4000);
                }
            }

        }, 80);
    }


    // =========================================================
    // FINALIZAR
    // =========================================================

    async function finalizar() {

        const token = localStorage.getItem("token");

        if (!token) {
            setErro("Sua sessão não foi encontrada.");
            return;
        }

        try {

            const r = await fetch(
                `${API_URL}/rifa/${rifa.id}/sortear`,
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await r.json().catch(() => null);

            if (r.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("usuario");

                window.location.replace("/");
                return;
            }

            if (!r.ok) {

                throw new Error(
                    data?.detail ||
                    `Erro ao finalizar sorteio (${r.status}).`
                );
            }

            setNumeroAnimado(data.numero);
            setResultado(data);

        } catch (e) {

            setErro(
                e?.message ||
                "Não foi possível finalizar o sorteio."
            );

        } finally {

            setRodando(false);
        }
    }


    // =========================================================
    // VERIFICANDO STATUS
    // =========================================================

    if (verificandoResultado) {

        return (
            <div className="sorteioRifa-container">

                <section className="sorteioRifa-carregamentoPremium">

                    <div className="sorteioRifa-carregamentoCabecalho">

                        <span className="sorteioRifa-carregamentoStatus">
                            CENTRAL DE SORTEIO
                        </span>

                        <span className="sorteioRifa-carregamentoSeguro">
                            Verificação segura
                        </span>

                    </div>


                    <div className="sorteioRifa-carregamentoCentro">

                        <div className="sorteioRifa-loaderPrincipal">

                            <div className="sorteioRifa-loaderOrbita sorteioRifa-loaderOrbitaUm" />

                            <div className="sorteioRifa-loaderOrbita sorteioRifa-loaderOrbitaDois" />

                            <div className="sorteioRifa-loaderNucleo">

                                <span className="sorteioRifa-loaderNumero">
                                    ?
                                </span>

                            </div>

                        </div>


                        <div className="sorteioRifa-carregamentoTexto">

                            <span className="sorteioRifa-carregamentoEtiqueta">
                                PREPARANDO AMBIENTE
                            </span>

                            <h3>
                                Verificando o sorteio
                            </h3>

                            <p>
                                Estamos consultando o resultado registrado
                                e preparando a central de sorteio.
                            </p>

                        </div>


                        <div className="sorteioRifa-progressoVerificacao">

                            <span className="sorteioRifa-progressoBarra" />

                        </div>


                        <div className="sorteioRifa-etapasVerificacao">

                            <div className="sorteioRifa-etapaVerificacao ativa">
                                <span>01</span>
                                <p>Identificando rifa</p>
                            </div>

                            <div className="sorteioRifa-etapaVerificacao ativa">
                                <span>02</span>
                                <p>Consultando resultado</p>
                            </div>

                            <div className="sorteioRifa-etapaVerificacao">
                                <span>03</span>
                                <p>Preparando sorteio</p>
                            </div>

                        </div>

                    </div>

                </section>

            </div>
        );
    }


    // =========================================================
    // AINDA NÃO LIBERADO
    // =========================================================

    if (!liberadoParaSorteio && !resultado) {

        return (
            <div className="sorteioRifa-container">

                <section className="sorteioRifa-bloqueioPremium">

                    <div className="sorteioRifa-bloqueioIcone">
                        <span>⌛</span>
                    </div>

                    <span className="sorteioRifa-bloqueioEtiqueta">
                        SORTEIO PROGRAMADO
                    </span>

                    <h3>
                        O sorteio ainda não está disponível
                    </h3>

                    <p>
                        A central será liberada automaticamente
                        após o encerramento da rifa.
                    </p>


                    <div className="sorteioRifa-bloqueioDados">

                        <div>
                            <span>Prêmio</span>
                            <strong>
                                {premio || "Não informado"}
                            </strong>
                        </div>

                        <div>
                            <span>Números</span>
                            <strong>
                                {inicioRifa ?? "?"} até {fimRifa ?? "?"}
                            </strong>
                        </div>

                        <div>
                            <span>Encerramento</span>
                            <strong>
                                {rifa?.data_fim
                                    ? new Date(
                                        rifa.data_fim
                                    ).toLocaleString("pt-BR")
                                    : "Não informado"
                                }
                            </strong>
                        </div>

                    </div>

                </section>

            </div>
        );
    }


    // =========================================================
    // CENTRAL DO SORTEIO
    // =========================================================

    return (
        <div className="sorteioRifa-container">


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="sorteioRifa-topoPremium">

                <div className="sorteioRifa-topoTitulo">

                    <span className="sorteioRifa-topoEtiqueta">
                        CENTRAL DE SORTEIO
                    </span>

                    <h2>
                        Sorteio da rifa
                    </h2>

                    <p>
                        O resultado é definido pelo servidor
                        e registrado de forma definitiva.
                    </p>

                </div>


                <div className="sorteioRifa-topoStatus">

                    <span
                        className={
                            resultado
                                ? "sorteioRifa-statusConcluido"
                                : rodando
                                    ? "sorteioRifa-statusExecutando"
                                    : "sorteioRifa-statusPronto"
                        }
                    >
                        <i />

                        {resultado
                            ? "Sorteio concluído"
                            : rodando
                                ? "Sorteio em andamento"
                                : "Pronto para sortear"
                        }

                    </span>

                </div>

            </div>


            {/* =================================================
                INFORMAÇÕES DA RIFA
            ================================================= */}

            <div className="sorteioRifa-resumoPremium">

                <div className="sorteioRifa-resumoItem">

                    <span className="sorteioRifa-resumoLabel">
                        PRÊMIO
                    </span>

                    <strong>
                        {premio || "Não informado"}
                    </strong>

                </div>


                <div className="sorteioRifa-resumoItem">

                    <span className="sorteioRifa-resumoLabel">
                        INTERVALO
                    </span>

                    <strong>
                        {inicioRifa ?? "?"} a {fimRifa ?? "?"}
                    </strong>

                </div>


                <div className="sorteioRifa-resumoItem">

                    <span className="sorteioRifa-resumoLabel">
                        NÚMEROS
                    </span>

                    <strong>
                        {totalNumeros}
                    </strong>

                </div>


                <div className="sorteioRifa-resumoItem">

                    <span className="sorteioRifa-resumoLabel">
                        STATUS
                    </span>

                    <strong>
                        {resultado
                            ? "Finalizado"
                            : rodando
                                ? "Sorteando"
                                : "Liberado"
                        }
                    </strong>

                </div>

            </div>


            {/* =================================================
                ETAPA INICIAL / SORTEANDO
            ================================================= */}

            {!resultado && (

                <section
                    className={`sorteioRifa-palcoPremium ${rodando
                        ? "sorteioRifa-palcoRodando"
                        : ""
                        }`}
                >


                    {/* AVISO */}

                    {!rodando && (

                        <div className="sorteioRifa-avisoPremium">

                            <div className="sorteioRifa-avisoIcone">
                                !
                            </div>

                            <div>

                                <strong>
                                    Resultado definitivo
                                </strong>

                                <p>
                                    Ao iniciar, o servidor definirá o número
                                    vencedor. O resultado registrado não poderá
                                    ser alterado posteriormente.
                                </p>

                            </div>

                        </div>

                    )}


                    {/* CONFIGURAÇÃO */}

                    {!rodando && numeroAnimado === null && (

                        <div className="sorteioRifa-configuracaoPremium">

                            <div className="sorteioRifa-configuracaoTexto">

                                <span>
                                    CONFIGURAÇÃO
                                </span>

                                <h3>
                                    Prepare o sorteio
                                </h3>

                                <p>
                                    Escolha por quantos segundos a animação
                                    ficará visível antes da revelação.
                                </p>

                            </div>


                            <div className="sorteioRifa-controleTempoPremium">

                                <div className="sorteioRifa-campoTempo">

                                    <label>
                                        Duração da animação
                                    </label>

                                    <div className="sorteioRifa-inputTempoWrapper">

                                        <input
                                            type="number"
                                            className="sorteioRifa-inputTempo"
                                            placeholder="Ex: 10"
                                            min="1"
                                            value={tempo}
                                            onChange={e =>
                                                setTempo(e.target.value)
                                            }
                                            disabled={rodando}
                                        />

                                        <span>
                                            segundos
                                        </span>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="sorteioRifa-botaoIniciar"
                                    onClick={iniciarSorteio}
                                    disabled={
                                        rodando ||
                                        !tempo ||
                                        Number(tempo) <= 0
                                    }
                                >
                                    <span className="sorteioRifa-botaoIniciarIcone">
                                        ▶
                                    </span>

                                    <span className="sorteioRifa-botaoIniciarTexto">

                                        <small>
                                            RESULTADO DEFINITIVO
                                        </small>

                                        <strong>
                                            Iniciar sorteio
                                        </strong>

                                    </span>

                                </button>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        MÁQUINA DE SORTEIO
                    ================================================= */}

                    {rodando && (

                        <div className="sorteioRifa-maquinaPremium">


                            <div className="sorteioRifa-maquinaCabecalho">

                                <span className="sorteioRifa-maquinaIndicador">

                                    <i />

                                    SORTEIO EM ANDAMENTO

                                </span>

                                <span className="sorteioRifa-maquinaIntervalo">
                                    {inicioRifa} — {fimRifa}
                                </span>

                            </div>


                            <div className="sorteioRifa-maquinaCentro">


                                <div className="sorteioRifa-anelExterno">

                                    <div className="sorteioRifa-anelMedio">

                                        <div className="sorteioRifa-visorNumero">

                                            <span className="sorteioRifa-visorLegenda">
                                                NÚMERO
                                            </span>

                                            <strong
                                                key={numeroAnimado}
                                                className="sorteioRifa-numeroAtual sorteioRifa-numeroRodando"
                                            >
                                                {numeroAnimado ?? "•••"}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                <div className="sorteioRifa-pulso pulsoUm" />
                                <div className="sorteioRifa-pulso pulsoDois" />
                                <div className="sorteioRifa-pulso pulsoTres" />

                            </div>


                            <div className="sorteioRifa-maquinaRodape">

                                <div className="sorteioRifa-processando">

                                    <span />

                                    <p>
                                        Processando números...
                                    </p>

                                </div>


                                <div className="sorteioRifa-barraSorteando">

                                    <span />

                                </div>


                                <small>
                                    Aguarde a revelação do resultado definitivo
                                </small>

                            </div>


                            <div className="sorteioRifa-particulas">

                                {Array.from({ length: 22 }).map((_, i) => (

                                    <span
                                        key={i}
                                        className="sorteioRifa-particula"
                                        style={{
                                            "--particula-x":
                                                `${Math.random() * 100}%`,
                                            "--particula-delay":
                                                `${Math.random() * 2}s`,
                                            "--particula-tamanho":
                                                `${3 + Math.random() * 5}px`
                                        }}
                                    />

                                ))}

                            </div>

                        </div>

                    )}

                </section>

            )}


            {/* =================================================
                RESULTADO FINAL
            ================================================= */}

            {resultado && (

                <section className="sorteioRifa-resultadoPremium">


                    <div className="sorteioRifa-resultadoCabecalho">

                        <span>
                            SORTEIO FINALIZADO
                        </span>

                        <h3>
                            Resultado oficial
                        </h3>

                        <p>
                            O número abaixo foi registrado
                            como resultado definitivo desta rifa.
                        </p>

                    </div>


                    <div className="sorteioRifa-numeroVencedorPremium">

                        <span>
                            NÚMERO SORTEADO
                        </span>

                        <strong>
                            {resultado.numero}
                        </strong>

                    </div>


                    {resultado.sem_ganhador ? (

                        <div className="sorteioRifa-semGanhadorPremium">

                            <div className="sorteioRifa-semGanhadorIcone">
                                !
                            </div>

                            <div>

                                <span>
                                    SEM GANHADOR
                                </span>

                                <h4>
                                    O número sorteado não foi adquirido
                                </h4>

                                <p>
                                    O sorteio foi realizado normalmente,
                                    porém nenhum participante possuía
                                    o número sorteado.
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div
                            className={`sorteioRifa-ganhadorPremium ${dadosGanhadorVisiveis
                                ? "sorteioRifa-ganhadorRevelado"
                                : ""
                                }`}
                            onClick={() => {
                                setDadosGanhadorVisiveis(
                                    anterior => !anterior
                                );
                            }}
                        >
                            <div className="sorteioRifa-ganhadorCabecalho">

                                <span className="sorteioRifa-ganhadorEtiqueta">
                                    GANHADOR
                                </span>
                                <div className="sorteioRifa-dadoPrivadoWrapper">

                                    <h3 className="sorteioRifa-dadoPrivado">
                                        {resultado.nome}
                                    </h3>

                                    <span className="sorteioRifa-dadoOcultoIndicador">
                                        Passe o mouse para visualizar
                                    </span>

                                </div>


                                <div
                                    className="sorteioRifa-copiasRapidasGanhador"
                                    onClick={e => e.stopPropagation()}
                                >

                                    {resultado.email && (
                                        <button
                                            type="button"
                                            className="sorteioRifa-botaoCopiaRapida"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(
                                                        resultado.email
                                                    );

                                                    alert("Email copiado.");
                                                } catch {
                                                    alert(
                                                        "Não foi possível copiar o email."
                                                    );
                                                }
                                            }}
                                        >
                                            Copiar email
                                        </button>
                                    )}


                                    {resultado.whatsapp && (
                                        <button
                                            type="button"
                                            className="sorteioRifa-botaoCopiaRapida"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(
                                                        resultado.whatsapp
                                                    );

                                                    alert("Celular copiado.");
                                                } catch {
                                                    alert(
                                                        "Não foi possível copiar o celular."
                                                    );
                                                }
                                            }}
                                        >
                                            Copiar celular
                                        </button>
                                    )}

                                </div>

                                <p>
                                    Ganhador do prêmio
                                    <strong> {premio}</strong>
                                </p>

                            </div>


                            <div className="sorteioRifa-ganhadorDados">

                                {resultado.email && (

                                    <div>
                                        <span>Email</span>

                                        <strong className="sorteioRifa-dadoPrivado">
                                            {resultado.email}
                                        </strong>
                                    </div>

                                )}


                                {resultado.whatsapp && (

                                    <div>
                                        <span>WhatsApp</span>

                                        <strong className="sorteioRifa-dadoPrivado">
                                            {resultado.whatsapp}
                                        </strong>
                                    </div>

                                )}

                            </div>


                            <div
                                className="sorteioRifa-acoesContato"
                                onClick={e => e.stopPropagation()}
                            >

                                {resultado.whatsapp && (

                                    <a
                                        className="sorteioRifa-linkWhatsapp"
                                        href={`https://wa.me/55${resultado.whatsapp}?text=${encodeURIComponent(
                                            `Parabéns ${resultado.nome}!\n\nVocê foi o ganhador do prêmio "${premio}".`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Entrar em contato pelo WhatsApp
                                    </a>

                                )}


                                {resultado.email && (

                                    <button
                                        type="button"
                                        className="sorteioRifa-botaoCopiarEmail"
                                        onClick={() => {

                                            const msg =
                                                `Parabéns ${resultado.nome}!\n\n` +
                                                `Você foi o ganhador do prêmio "${premio}".`;

                                            navigator.clipboard.writeText(
                                                `${resultado.email}\n\n${msg}`
                                            );

                                            alert(
                                                "Email e mensagem copiados"
                                            );
                                        }}
                                    >
                                        Copiar email e mensagem
                                    </button>

                                )}

                            </div>
                        </div>

                    )}

                </section>

            )}


            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (

                <div className="sorteioRifa-mensagemErro">

                    <strong>
                        Não foi possível concluir o sorteio
                    </strong>

                    <span>
                        {erro}
                    </span>

                </div>

            )}


            {/* =================================================
                COMEMORAÇÃO
            ================================================= */}

            {comemorar && !resultado?.sem_ganhador && (

                <div
                    className="sorteioRifa-comemoracao"
                    aria-hidden="true"
                >

                    {Array.from({ length: 45 }).map((_, i) => {

                        const simbolos = [
                            "✦",
                            "✧",
                            "●",
                            "◆",
                            "★"
                        ];

                        return (

                            <span
                                key={i}
                                className="sorteioRifa-fogo"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay:
                                        `${Math.random()}s`,
                                    fontSize:
                                        `${10 + Math.random() * 18}px`
                                }}
                            >
                                {
                                    simbolos[
                                    Math.floor(
                                        Math.random() *
                                        simbolos.length
                                    )
                                    ]
                                }
                            </span>

                        );
                    })}

                </div>

            )}

        </div>
    );
}