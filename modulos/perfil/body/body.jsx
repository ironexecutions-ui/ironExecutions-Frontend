import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { API_URL } from "../../../config";

import "./body.css";

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

import Configuracoes from "./configuracoes/configuracoes";

export default function Body({ setHeaderMinimizado, atualizarHeader }) {

    const [modulosVisiveis, setModulosVisiveis] = useState([]);
    const [moduloAtivo, setModuloAtivo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [fade, setFade] = useState(false);
    const [modoModuloAberto, setModoModuloAberto] = useState(false);

    const [ComponenteAtivo, setComponenteAtivo] = useState(null);
    const [cliente, setCliente] = useState(null);

    const componentes = {
        "Produtividade": Produtividade,
        "Administracao": Administracao,
        "Administração": Administracao,
        "Delivery e vendas online": DeliveryEVendasOnline,
        "Mesas, salão e cozinha": MesasSalaoECozinha,
        "Rifa": Rifa,
        "Agendamentos": Agendamentos,
        "Gerencial": Gerencial,
        "Fiscal": Fiscal,
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

    /* ===============================
       ENTRAR EM TELA CHEIA
    =============================== */
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

    /* ===============================
       SAIR DA TELA CHEIA
    =============================== */
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

    /* ===============================
       FECHAR MÓDULO COM ATUALIZAÇÃO
    =============================== */
    async function fecharModuloComAtualizacao() {
        const naoAtualiza = ["Produtividade", "Fiscal"];

        /*
         * Se estiver em tela cheia,
         * sai antes de voltar para os módulos.
         */
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
    /* =========================================================
       CACHE DO BODY
    ========================================================= */

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

            const token =
                localStorage.getItem("token");

            if (!token) {

                if (componenteAtivo) {
                    setCarregando(false);
                }

                return;
            }


            /* =================================================
               DESCOBRE O USUÁRIO SALVO
    
               O login/header já salva "usuario".
            ================================================= */

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


            /* =================================================
               1. CARREGA CACHE IMEDIATAMENTE
            ================================================= */

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


                /*
                    Como já temos tudo necessário para
                    montar a tela, removemos o skeleton.
                */

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


                /* =================================================
                   2. BUSCA CLIENTE ATUAL
                ================================================= */

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


                /* =================================================
                   IMPORTANTE
    
                   A partir daqui usamos o ID retornado pelo
                   servidor, não confiamos somente no cache.
                ================================================= */

                const usuarioIdServidor =
                    clienteServidor.id;


                /* =================================================
                   3. BUSCA MÓDULOS E PERMISSÕES
    
                   Agora fazemos as duas chamadas simultaneamente.
                ================================================= */

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


                /* =================================================
                   4. CALCULA MÓDULOS VISÍVEIS
                ================================================= */

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


                /* =================================================
                   5. OBJETO COMPLETO QUE SERÁ CACHEADO
                ================================================= */

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


                /* =================================================
                   6. PEGA CACHE CORRETO DO USUÁRIO
    
                   Isso é importante caso o usuarioLocal estivesse
                   vazio ou pertencesse a outra conta.
                ================================================= */

                const cacheServidor =
                    lerCacheBody(
                        usuarioIdServidor
                    );


                /* =================================================
                   7. COMPARA
                ================================================= */

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


                    /*
                        Pode acontecer de não termos usado o cache
                        inicialmente porque "usuario" ainda não
                        estava disponível.
    
                        Garantimos os states aqui.
                    */

                    if (!cache) {

                        setCliente(
                            clienteServidor
                        );

                        setModulosVisiveis(
                            filtradosServidor
                        );
                    }
                }


                /* =================================================
                   8. FINALIZA CARREGAMENTO
                ================================================= */

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


                /*
                    Se existe cache, não derrubamos a tela.
                */

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

            // Administração nunca aparece para Funcionário
            if (
                cliente.funcao === "Funcionario(a)" &&
                (
                    mod.modulo === "Administracao" ||
                    mod.modulo === "Administração"
                )
            ) {
                return false;
            }

            // Demais bloqueios por permissão
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

    /* ===============================
       ABRIR MÓDULO
    =============================== */
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

        /*
         * PRODUTIVIDADE
         *
         * Como essa função é executada diretamente
         * pelo clique do usuário, o navegador permite
         * solicitar fullscreen.
         */
        if (modulo === "Produtividade") {
            await entrarTelaCheia();
        }

        setModuloAtivo(modulo);
        setModoModuloAberto(true);
        setHeaderMinimizado(true);

        const Comp = componentes[modulo];

        setComponenteAtivo(() => Comp);
    }

    /* ===============================
       FECHAR MÓDULO
    =============================== */
    async function fecharModulo() {

        if (document.fullscreenElement) {
            await sairTelaCheia();
        }

        setModoModuloAberto(false);
        setHeaderMinimizado(false);
        setComponenteAtivo(null);
    }

    /* ===============================
       CARREGANDO
    =============================== */
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
            </div>
        );
    }

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
                <div className="modulos-wrapper fade-in-up-delay">

                    <div className="modulos-lista">

                        {modulosVisiveis.map((m, i) => (
                            <button
                                key={m.modulo}
                                className={`modulo-card anim-${i}`}
                                onClick={() =>
                                    abrirModulo(m.modulo)
                                }
                            >
                                <span>
                                    {m.modulo}
                                </span>
                            </button>
                        ))}

                        {podeAcessarControle() && (
                            <button
                                className="modulo-card"
                                onClick={() =>
                                    abrirModulo("Controle")
                                }
                            >
                                <span>
                                    Controle
                                </span>
                            </button>
                        )}

                        <button
                            className="modulo-card"
                            onClick={() =>
                                abrirModulo("Configurações")
                            }
                        >
                            <span>
                                Configurações
                            </span>
                        </button>

                    </div>

                    <br />

                    <div>
                        <Funcionarios />
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

        </div>
    );
}