import React, { useEffect, useState } from "react";

import { createPortal } from "react-dom";



import { API_URL } from "../../../config";



import "./body.css";

import Irene from "./irene/irene";

// Importa todos os módulos

import Produtividade from "./produtividade/produtividade";

import Administracao from "./administracao/administracao";

import DeliveryEVendasOnline from "./delivery_e_vendas_online/delivery";

import MesasSalaoECozinha from "./mesa_salao_cozinha/mesasalaocozinha";

import Rifa from "./rifa/rifa";

import Agendamentos from "./agendamentos/agendamentos";

import Gerencial from "./gerencial/ferencial";

import Fiscal from "./fiscal/fiscal";

import Controle from "./controle/controle";

import Funcionarios from "./funcionarios/clientes_exibicao";

import Camera from "./camera/camera";

import Configuracoes from "./configuracoes/configuracoes";

import Parceria from "./parceria/parceria";

import Frete from "./frete/frete";





const CHAVE_CACHE_SEMANAL = "iron_body_data_hora_ultima_limpeza";
const PRAZO_CACHE_SEMANAL = 7 * 24 * 60 * 60 * 1000;

export default function Body({ setHeaderMinimizado, atualizarHeader }) {



    const [modulosVisiveis, setModulosVisiveis] = useState([]);

    const [moduloAtivo, setModuloAtivo] = useState("");

    const [carregando, setCarregando] = useState(true);

    const [fade, setFade] = useState(false);

    const [modoModuloAberto, setModoModuloAberto] = useState(false);


    const [ComponenteAtivo, setComponenteAtivo] = useState(null);

    const [cliente, setCliente] = useState(null);
    const [limpezaEmAndamento, setLimpezaEmAndamento] = useState(false);
    const [erroNaLimpeza, setErroNaLimpeza] = useState(false);

    const componentes = {

        "Produtividade": Produtividade,



        "Administracao": Administracao,

        "Administração": Administracao,



        "Delivery e vendas online": DeliveryEVendasOnline,

        "IronStore": DeliveryEVendasOnline,

        "parceria": Parceria,

        "Mesas, salão e cozinha": MesasSalaoECozinha,

        "Frete": Frete,

        "Rifa": Rifa,



        "Agendamentos": Agendamentos,



        "Gerencial": Gerencial,



        "Fiscal": Fiscal,



        "Câmera": Camera,



        "Controle": Controle,



        "Configurações": Configuracoes

    };



    function podeAcessarConfiguracoes() {

        if (!cliente) return false;



        return (

            cliente.funcao === "Administrador(a)" ||

            cliente.funcao === "Supervisor(a)"

        );

    }



    /* ===============================*

 *       ENTRAR EM TELA CHEIA*

 *    =============================== */

    async function entrarTelaCheia() {

        try {

            if (document.fullscreenElement) {

                return;

            }



            const elemento = document.documentElement;



            if (elemento.requestFullscreen) {

                await elemento.requestFullscreen();

            }

        } catch (erro) {

            console.error("Erro ao entrar em tela cheia:", erro);

        }

    }



    /* ===============================*

 *       SAIR DA TELA CHEIA*

 *    =============================== */

    async function sairTelaCheia() {

        try {

            if (!document.fullscreenElement) {

                return;

            }



            if (document.exitFullscreen) {

                await document.exitFullscreen();

            }

        } catch (erro) {

            console.error("Erro ao sair da tela cheia:", erro);

        }

    }



    /* ===============================*

 *       FECHAR MÓDULO COM ATUALIZAÇÃO*

 *    =============================== */

    async function fecharModuloComAtualizacao() {

        const naoAtualiza = ["Produtividade", "Fiscal"];



        /**

 *         * Se estiver em tela cheia,*

 *         * sai antes de voltar para os módulos.*

 *         */

        if (document.fullscreenElement) {

            await sairTelaCheia();

        }



        setModoModuloAberto(false);

        setHeaderMinimizado(false);

        setComponenteAtivo(null);



        if (!naoAtualiza.includes(moduloAtivo)) {

            atualizarHeader();

        }

    }

    /* =========================================================*

 *       CACHE DO BODY*

 *    ========================================================= */



    function obterChaveCacheBody(usuarioId) {

        return `iron_body_modulos_cache_${usuarioId}`;

    }





    function lerCacheBody(usuarioId) {



        if (!usuarioId) {

            return null;

        }



        try {



            const chave =

                obterChaveCacheBody(usuarioId);



            const salvo =

                localStorage.getItem(chave);



            if (!salvo) {

                return null;

            }



            return JSON.parse(salvo);



        } catch (erro) {



            console.warn(

                "[BODY] Erro ao ler cache:",

                erro

            );



            return null;

        }

    }





    function salvarCacheBody(usuarioId, dadosCache) {



        if (!usuarioId) {

            return;

        }



        try {



            localStorage.setItem(

                obterChaveCacheBody(usuarioId),

                JSON.stringify(dadosCache)

            );



        } catch (erro) {



            console.warn(

                "[BODY] Erro ao salvar cache:",

                erro

            );

        }

    }



    /* =========================================================*

 *       CONTROLE DE LIMPEZA AUTOMÁTICA A CADA 7 DIAS*

 *    ========================================================= */



    async function verificarLimpezaSemanal() {
        const agora = Date.now();

        let dataSalva;

        try {
            dataSalva = localStorage.getItem(CHAVE_CACHE_SEMANAL);
        } catch (erro) {
            console.error("[BODY] Não foi possível consultar a data de limpeza:", erro);
            return;
        }

        // Primeira execução: registra data e hora sem apagar nenhum dado.
        if (!dataSalva) {
            try {
                localStorage.setItem(CHAVE_CACHE_SEMANAL, agora.toString());
                console.log(
                    "[BODY] Data inicial registrada:",
                    new Date(agora).toLocaleString("pt-BR")
                );
            } catch (erro) {
                console.error("[BODY] Não foi possível registrar a data:", erro);
            }

            return;
        }

        const dataAnterior = Number(dataSalva);

        // Corrige um registro inválido sem limpar os dados do usuário.
        if (!Number.isFinite(dataAnterior) || dataAnterior <= 0) {
            try {
                localStorage.setItem(CHAVE_CACHE_SEMANAL, agora.toString());
            } catch (erro) {
                console.error("[BODY] Não foi possível corrigir a data:", erro);
            }

            return;
        }

        const tempoDecorrido = agora - dataAnterior;

        // Só executa depois de completar 168 horas.
        if (tempoDecorrido < PRAZO_CACHE_SEMANAL) {
            console.log("[BODY] Cache preservado. Ainda não completou 7 dias.");
            return;
        }

        console.log("[BODY] 7 dias completos. Renovando caches da aplicação.");

        setLimpezaEmAndamento(true);
        setErroNaLimpeza(false);

        // Dá tempo para o React exibir o modal antes de iniciar a limpeza.
        await new Promise(resolve => setTimeout(resolve, 650));

        try {
            // Preserva token, usuário e demais dados do localStorage.
            // Remove somente o cache de módulos criado por este Body.
            const chavesParaRemover = [];

            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);

                if (chave && chave.startsWith("iron_body_modulos_cache_")) {
                    chavesParaRemover.push(chave);
                }
            }

            chavesParaRemover.forEach(chave => {
                localStorage.removeItem(chave);
            });

            // Limpa o armazenamento temporário da sessão.
            sessionStorage.clear();

            // Limpa Cache Storage, quando disponível.
            if ("caches" in window) {
                const nomesCaches = await caches.keys();

                await Promise.all(
                    nomesCaches.map(nome => caches.delete(nome))
                );
            }

            console.log("[BODY] Limpeza dos caches concluída.");

            // Atualiza o marco de 7 dias somente após a limpeza.
            localStorage.setItem(
                CHAVE_CACHE_SEMANAL,
                Date.now().toString()
            );

            console.log(
                "[BODY] Próxima limpeza permitida após mais 7 dias."
            );

            // Após concluir a limpeza, retorna à página inicial da aplicação.
            window.location.assign("/");

        } catch (erro) {
            console.error("[BODY] Erro durante a limpeza dos caches:", erro);
            setLimpezaEmAndamento(false);
            setErroNaLimpeza(true);
        }
    }

    function renderizarModalLimpeza() {
        if (!limpezaEmAndamento && !erroNaLimpeza) {
            return null;
        }

        return createPortal(
            <div className="iron-cache-modal-overlay" role="dialog" aria-modal="true" aria-live="polite">
                <div className="iron-cache-modal-card">
                    {limpezaEmAndamento ? (
                        <>
                            <div className="iron-cache-modal-spinner" aria-hidden="true" />
                            <h2 className="iron-cache-modal-titulo">Otimizando sua aplicação</h2>
                            <p className="iron-cache-modal-texto">
                                Estamos realizando uma limpeza periódica dos arquivos temporários e caches.
                                Isso pode levar alguns instantes.
                            </p>
                            <div className="iron-cache-modal-progresso">
                                <span />
                            </div>
                            <span className="iron-cache-modal-status">Não feche esta página durante a operação.</span>
                        </>
                    ) : (
                        <>
                            <div className="iron-cache-modal-erro-icone">!</div>
                            <h2 className="iron-cache-modal-titulo">Não foi possível concluir a limpeza</h2>
                            <p className="iron-cache-modal-texto">
                                Ocorreu um problema ao limpar os caches. Seus dados de acesso foram preservados.
                                Você pode continuar usando a aplicação.
                            </p>
                            <button
                                type="button"
                                className="iron-cache-modal-botao"
                                onClick={() => setErroNaLimpeza(false)}
                            >
                                Continuar
                            </button>
                        </>
                    )}
                </div>
            </div>,
            document.body
        );
    }

    function dadosBodyIguais(cache, servidor) {



        if (!cache || !servidor) {

            return false;

        }



        try {



            return JSON.stringify(cache) ===

                JSON.stringify(servidor);



        } catch {

            return false;

        }

    }

    useEffect(() => {



        let componenteAtivo = true;



        async function carregar() {



            // Verifica se já passaram 7 dias completos*

            await verificarLimpezaSemanal();



            if (!componenteAtivo) {

                return;

            }



            const token =

                localStorage.getItem("token");



            if (!token) {



                if (componenteAtivo) {

                    setCarregando(false);

                }



                return;

            }





            /* =================================================*

 *               DESCOBRE O USUÁRIO SALVO*



 *               O login/header já salva "usuario".*

 *            ================================================= */



            let usuarioLocal = null;



            try {



                usuarioLocal = JSON.parse(

                    localStorage.getItem("usuario") || "null"

                );



            } catch {



                usuarioLocal = null;



            }





            const usuarioIdCache =

                usuarioLocal?.id;





            /* =================================================*

 *               1. CARREGA CACHE IMEDIATAMENTE*

 *            ================================================= */



            const cache =

                lerCacheBody(usuarioIdCache);





            if (

                cache &&

                cache.cliente &&

                Array.isArray(cache.modulosVisiveis)

            ) {



                console.log(

                    "[BODY] Cache encontrado."

                );





                setCliente(

                    cache.cliente

                );





                setModulosVisiveis(

                    cache.modulosVisiveis

                );





                /**

 *                    Como já temos tudo necessário para*

 *                    montar a tela, removemos o skeleton.*

 *                */



                setCarregando(false);





                requestAnimationFrame(() => {



                    if (componenteAtivo) {

                        setFade(true);

                    }



                });





                console.log(

                    "[BODY] Interface carregada pelo cache."

                );

            }





            try {



                const headers = {

                    Authorization: `Bearer ${token}`

                };





                /* =================================================*

 *                   2. BUSCA CLIENTE ATUAL*

 *                ================================================= */



                const respostaCliente =

                    await fetch(

                        `${API_URL}/retorno/me`,

                        {

                            headers

                        }

                    );





                if (!respostaCliente.ok) {



                    throw new Error(

                        `Erro /retorno/me: ${respostaCliente.status}`

                    );

                }





                const clienteServidor =

                    await respostaCliente.json();





                if (!componenteAtivo) {

                    return;

                }





                /* =================================================*

 *                   IMPORTANTE*



 *                   A partir daqui usamos o ID retornado pelo*

 *                   servidor, não confiamos somente no cache.*

 *                ================================================= */



                const usuarioIdServidor =

                    clienteServidor.id;





                /* =================================================*

 *                   3. BUSCA MÓDULOS E PERMISSÕES*



 *                   Agora fazemos as duas chamadas simultaneamente.*

 *                ================================================= */



                const [

                    respostaModulos,

                    respostaPermissoes

                ] = await Promise.all([



                    fetch(

                        `${API_URL}/retorno/modulos`,

                        {

                            headers

                        }

                    ),



                    fetch(

                        `${API_URL}/retorno/permissoes/${usuarioIdServidor}`,

                        {

                            headers

                        }

                    )



                ]);





                if (!respostaModulos.ok) {



                    throw new Error(

                        `Erro módulos: ${respostaModulos.status}`

                    );

                }





                if (!respostaPermissoes.ok) {



                    throw new Error(

                        `Erro permissões: ${respostaPermissoes.status}`

                    );

                }





                const [

                    modulosServidor,

                    permissoesServidor

                ] = await Promise.all([



                    respostaModulos.json(),



                    respostaPermissoes.json()



                ]);





                if (!componenteAtivo) {

                    return;

                }





                /* =================================================*

 *                   4. CALCULA MÓDULOS VISÍVEIS*

 *                ================================================= */



                const filtradosServidor =

                    filtrarModulos({

                        modulos: Array.isArray(modulosServidor)

                            ? modulosServidor

                            : [],



                        cliente: clienteServidor,



                        permissoes: Array.isArray(permissoesServidor)

                            ? permissoesServidor

                            : []

                    });





                /* =================================================*

 *                   5. OBJETO COMPLETO QUE SERÁ CACHEADO*

 *                ================================================= */



                const dadosServidor = {



                    cliente:

                        clienteServidor,



                    modulos:

                        Array.isArray(modulosServidor)

                            ? modulosServidor

                            : [],



                    permissoes:

                        Array.isArray(permissoesServidor)

                            ? permissoesServidor

                            : [],



                    modulosVisiveis:

                        filtradosServidor



                };





                /* =================================================*

 *                   6. PEGA CACHE CORRETO DO USUÁRIO*



 *                   Isso é importante caso o usuarioLocal estivesse*

 *                   vazio ou pertencesse a outra conta.*

 *                ================================================= */



                const cacheServidor =

                    lerCacheBody(

                        usuarioIdServidor

                    );





                /* =================================================*

 *                   7. COMPARA*

 *                ================================================= */



                const iguais =

                    dadosBodyIguais(

                        cacheServidor,

                        dadosServidor

                    );





                if (!iguais) {



                    console.log(

                        "[BODY] Servidor mudou. Atualizando cache."

                    );





                    setCliente(

                        clienteServidor

                    );





                    setModulosVisiveis(

                        filtradosServidor

                    );





                    salvarCacheBody(

                        usuarioIdServidor,

                        dadosServidor

                    );





                } else {



                    console.log(

                        "[BODY] Cache já está atualizado."

                    );





                    /**

 *                        Pode acontecer de não termos usado o cache*

 *                        inicialmente porque "usuario" ainda não*

 *                        estava disponível.*



 *                        Garantimos os states aqui.*

 *                    */



                    if (!cache) {



                        setCliente(

                            clienteServidor

                        );



                        setModulosVisiveis(

                            filtradosServidor

                        );

                    }

                }





                /* =================================================*

 *                   8. FINALIZA CARREGAMENTO*

 *                ================================================= */



                if (componenteAtivo) {



                    setCarregando(false);



                    requestAnimationFrame(() => {



                        if (componenteAtivo) {

                            setFade(true);

                        }



                    });

                }





            } catch (erro) {



                console.error(

                    "[BODY] Erro ao atualizar dados:",

                    erro

                );





                /**

 *                    Se existe cache, não derrubamos a tela.*

 *                */



                if (!cache && componenteAtivo) {



                    setCarregando(false);



                    setFade(true);



                }

            }

        }





        carregar();





        return () => {



            componenteAtivo = false;



        };



    }, []);

    function filtrarModulos({

        modulos,

        cliente,

        permissoes

    }) {

        return modulos.filter(mod => {



            if (mod.ativo === 0) {

                return false;

            }



            const modulosDoComercio =

                cliente.modulos_comercio || [];



            if (!modulosDoComercio.includes(mod.modulo)) {

                return false;

            }



            // Administração nunca aparece para Funcionário*

            if (

                cliente.funcao === "Funcionario(a)" &&

                (

                    mod.modulo === "Administracao" ||

                    mod.modulo === "Administração"

                )

            ) {

                return false;

            }



            // Demais bloqueios por permissão*

            if (cliente.funcao === "Funcionario(a)") {

                const bloqueado = permissoes.find(

                    p => p.modulo === mod.modulo

                );



                if (bloqueado) {

                    return false;

                }

            }



            return true;

        });

    }



    function podeAcessarControle() {

        if (!cliente) return false;



        return (

            cliente.funcao === "Administrador(a)" ||

            cliente.funcao === "Supervisor(a)"

        );

    }



    /* ===============================*

 *       ABRIR MÓDULO*

 *    =============================== */

    async function abrirModulo(modulo) {



        if (

            modulo === "Controle" &&

            !podeAcessarControle()

        ) {

            return;

        }



        if (

            modulo === "Configurações" &&

            !podeAcessarConfiguracoes()

        ) {

            return;

        }



        /**

 *         * PRODUTIVIDADE*

 *         **

 *         * Como essa função é executada diretamente*

 *         * pelo clique do usuário, o navegador permite*

 *         * solicitar fullscreen.*

 *         */

        if (modulo === "Produtividade") {

            await entrarTelaCheia();

        }



        setModuloAtivo(modulo);

        setModoModuloAberto(true);

        setHeaderMinimizado(true);



        const Comp = componentes[modulo];



        setComponenteAtivo(() => Comp);

    }



    /* ===============================*

 *       FECHAR MÓDULO*

 *    =============================== */

    async function fecharModulo() {



        if (document.fullscreenElement) {

            await sairTelaCheia();

        }



        setModoModuloAberto(false);

        setHeaderMinimizado(false);

        setComponenteAtivo(null);

    }



    /* ===============================*

 *       ESC = VOLTAR DOS MÓDULOS*

 *       =============================== */



    useEffect(() => {

        function voltarComEsc(e) {

            if (

                e.key === "Escape" &&

                modoModuloAberto

            ) {

                e.preventDefault();

                fecharModuloComAtualizacao();

            }

        }



        window.addEventListener("keydown", voltarComEsc);



        return () => {

            window.removeEventListener("keydown", voltarComEsc);

        };

    }, [modoModuloAberto, moduloAtivo]);



    /* ===============================*

 *       CARREGANDO*

 *    =============================== */

    if (carregando) {

        return (

            <div className="body-skeleton">

                <div className="sk-title"></div>



                <div className="sk-modulos">

                    <div className="sk-card"></div>

                    <div className="sk-card"></div>

                    <div className="sk-card"></div>

                </div>



                <div className="sk-area"></div>

                {renderizarModalLimpeza()}

            </div>

        );

    }

    const totalModulosNaTela =

        modulosVisiveis.length +

        (podeAcessarControle() ? 1 : 0) +

        1; // Configurações



    const usarDuasLinhas = totalModulosNaTela > 8;

    return (

        <div

            className={`body-container body-fade ${fade ? "show" : ""

                }`}

        >



            {!modoModuloAberto && (

                <h1 className="titulo-body fade-in-up">

                    Módulos do seu comércio

                </h1>

            )}





            {!modoModuloAberto && (

                <div className="modulos-wrapper fade-in-up-delay body-posicao-horizontal">



                    <div

                        className={`modulos-lista ${usarDuasLinhas ? "modulos-lista--duas-linhas" : ""

                            }`}

                    >

                        {modulosVisiveis.map((m, i) => (

                            <button

                                key={m.modulo}

                                className={`modulo-card anim-${i}`}

                                onClick={() => abrirModulo(m.modulo)}

                            >

                                <span>

                                    {m.modulo === "Delivery e vendas online"

                                        ? "IronStore"

                                        : m.modulo}

                                </span>

                            </button>

                        ))}



                        {podeAcessarControle() && (

                            <button

                                className="modulo-card"

                                onClick={() => abrirModulo("Controle")}

                            >

                                <span>

                                    Controle

                                </span>

                            </button>

                        )}



                        <button

                            className="modulo-card"

                            onClick={() => abrirModulo("Configurações")}

                        >

                            <span>

                                Configurações

                            </span>

                        </button>



                    </div>



                    <div className="body-funcionarios-direita">

                        <Funcionarios cliente={cliente} />

                    </div>



                </div>

            )}





            {modoModuloAberto && createPortal(

                <div

                    className="modulo-tag-flutuante"

                    onClick={fecharModuloComAtualizacao}

                >

                    <span className="modulo-tag-nome">

                        {moduloAtivo}

                    </span>



                    <span className="modulo-tag-voltar">

                        voltar

                    </span>

                </div>,

                document.body

            )}



            {modoModuloAberto && (

                <div className="area-modulo-ativa fade-expand">

                    <div className="conteudo-modulo">



                        {ComponenteAtivo ? (

                            <ComponenteAtivo />

                        ) : (

                            <p>Carregando...</p>

                        )}



                    </div>

                </div>

            )}

            {!modoModuloAberto && <Irene />}

            {renderizarModalLimpeza()}

        </div>

    );

}