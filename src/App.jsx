import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";

import "./app.css";
import "./app-responsivo.css";
import Termos from "../modulos/termos/termos"
import Sobre from "../sobre/sobre";
import ModalLembretesTarefas from "../modulos/perfil/header/modals/tarefas";
import RifaCompras from "../public/rifas/rifacompras";
import Codigo from "../public/codigo";
import InicioModulos from "../modulos/iniciomodulos";
import CadastroComercio from "../modulos/cadastrocomercio";
import IronBusinessPerfil from "../modulos/perfil/ironbusiness";
import ProtegidoClientes from "./protegidoclientes";
import { useLoading } from "./loadingcontext";
import { API_URL } from "../config";
import RegistroEmails from "./registroemails";
import PainelGeral from "../painelgeral/painel";

import ironExecutions from "./imagens/ironexecutions.png";
import missionaryStoreBrasil from "./imagens/missionarystorebrasil.png";
import teste from "./imagens/teste.png";
import dass from "./imagens/dass.png";
import neide from "./imagens/neidefashion.png";
import alexsiaUtilidades from "./imagens/alexsiautilidades.png";

import CelularFoto from "../modulos/perfil/body/administracao/componentes/celularfoto";
import Camerapublica from "../camera/camerapublica";
import Geral from "../camera/geral";

import Apresentacao from "../apresentacao/apresentacao";
import FotosProdutos from "../fotos/fotos";


/* =========================================================
   MAPA FIXO
   COMERCIO_ID -> IMAGEM
========================================================= */

const FUNDOS_POR_COMERCIO = {
  11: ironExecutions,
  25: missionaryStoreBrasil,
  27: teste,
  28: dass,
  29: alexsiaUtilidades,
  38: neide
};

const CACHE_AVISO_TERMOS =
  "iron_app_aviso_termos_v1";
/* =========================================================
   CHAVE DO CACHE
========================================================= */

const CACHE_FUNDO_COMERCIO =
  "iron_app_fundo_comercio_cache";


/* =========================================================
   LER CACHE
========================================================= */

function lerCacheFundo() {

  try {

    const salvo =
      localStorage.getItem(
        CACHE_FUNDO_COMERCIO
      );

    if (!salvo) {
      return null;
    }

    return JSON.parse(salvo);

  } catch (erro) {

    console.warn(
      "[FUNDO] Cache inválido:",
      erro
    );

    localStorage.removeItem(
      CACHE_FUNDO_COMERCIO
    );

    return null;
  }
}

function obterDataLocalHojeTermos() {

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


function lerCacheAvisoTermos() {

  try {

    const salvo =
      localStorage.getItem(
        CACHE_AVISO_TERMOS
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
      CACHE_AVISO_TERMOS
    );

    return null;
  }
}


function salvarCacheAvisoTermos(dados) {

  try {

    localStorage.setItem(
      CACHE_AVISO_TERMOS,
      JSON.stringify(dados)
    );

  } catch (erro) {

    console.warn(
      "[TERMOS] Não foi possível salvar cache:",
      erro
    );
  }
}
/* =========================================================
   SALVAR CACHE
========================================================= */

function salvarCacheFundo(dados) {

  try {

    localStorage.setItem(
      CACHE_FUNDO_COMERCIO,
      JSON.stringify(dados)
    );

  } catch (erro) {

    console.warn(
      "[FUNDO] Não foi possível salvar cache:",
      erro
    );

  }
}


/* =========================================================
   REMOVER CACHE
========================================================= */

function removerCacheFundo() {

  localStorage.removeItem(
    CACHE_FUNDO_COMERCIO
  );

}


/* =========================================================
   NORMALIZAR LINK PÚBLICO DA RIFA
========================================================= */

function RifaComprasNormalizada() {

  const location = useLocation();

  const caminho = location.pathname;

  const match = caminho.match(
    /^\/rifa-compras\/(\d+)/
  );

  if (!match) {
    return <RifaCompras />;
  }

  const id = match[1];

  const caminhoCorreto =
    `/rifa-compras/${id}`;

  /*
    Se chegou algo como:

    /rifa-compras/18!**
    /rifa-compras/18!!!
    /rifa-compras/18qualquercoisa

    normaliza para:

    /rifa-compras/18

    Mantemos também query strings válidas,
    como ?fbclid=...
  */

  if (caminho !== caminhoCorreto) {

    return (
      <Navigate
        to={`${caminhoCorreto}${location.search}`}
        replace
      />
    );

  }

  return <RifaCompras />;
}

function ControleTermos({
  verificarTermosPendentes,
  setTermosPendentes,
  setAbrirModalTermos
}) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/ironbusiness/perfil") {
      setTermosPendentes([]);
      setAbrirModalTermos(false);
      return;
    }

    verificarTermosPendentes();
  }, [location.pathname]);

  return null;
}
/* =========================================================
   ROTEAMENTO
========================================================= */

function RoteamentoComLoading() {

  const { setLoading } = useLoading();

  const location =
    useLocation();


  useEffect(() => {

    setLoading(true);

    const timer =
      setTimeout(
        () => setLoading(false),
        600
      );

    return () =>
      clearTimeout(timer);

  }, [
    location.pathname,
    setLoading
  ]);


  return (

    <Routes>
      <Route
        path="/link/geral/:idComercioCriptografado"
        element={<Geral />}
      />
      <Route
        path="/camera/:token"
        element={<Camerapublica />}
      />

      <Route
        path="/apresentacao-local"
        element={<Apresentacao />}
      />

      <Route
        path="/rifa-compras/:id?"
        element={<RifaComprasNormalizada />}
      />

      <Route
        path="/sp"
        element={<RegistroEmails />}
      />

      <Route
        path="/fotos"
        element={<FotosProdutos />}
      />

      <Route
        path="/adicionar-foto/:token"
        element={<CelularFoto />}
      />

      <Route
        path="/cadastrocomercio"
        element={<CadastroComercio />}
      />

      <Route
        path="ironbusiness/perfil"
        element={
          <ProtegidoClientes>
            <IronBusinessPerfil />
          </ProtegidoClientes>
        }
      />

      <Route
        path="/*"
        element={<InicioModulos />}
      />

      <Route
        path="/codigo"
        element={<Codigo />}
      />

      <Route
        path="/painel"
        element={<PainelGeral />}
      />

      <Route
        path="/sobre/:modulo"
        element={<Sobre />}
      />
      <Route
        path="/termos"
        element={
          <Termos />
        }
      />
    </Routes>

  );
}


/* =========================================================
   LEMBRETES POR INATIVIDADE

   5 MINUTOS
========================================================= */

const TEMPO_INATIVIDADE_LEMBRETES =
  5 * 60 * 1000;


/* =========================================================
   ROTAS SEM LEMBRETES
========================================================= */

const ROTAS_SEM_LEMBRETES = [
  "/",
  "/apresentacao-local",
  "/painel"
];


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [fundoComercio, setFundoComercio] =
    useState(null);


  const [
    lembretesInatividade,
    setLembretesInatividade
  ] = useState(null);


  const [
    abrirLembretesInatividade,
    setAbrirLembretesInatividade
  ] = useState(false);

  const [termosPendentes, setTermosPendentes] =
    useState([]);

  const [abrirModalTermos, setAbrirModalTermos] =
    useState(false);

  const [carregandoTermos, setCarregandoTermos] =
    useState(false);


  async function verificarTermosPendentes() {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("[TERMOS] Nenhum token encontrado.");
      setTermosPendentes([]);
      setAbrirModalTermos(false);
      return;
    }

    try {
      setCarregandoTermos(true);

      console.log("[TERMOS] Verificando termos pendentes...");

      const resposta = await fetch(
        `${API_URL}/termos`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("[TERMOS] Status da API:", resposta.status);

      if (resposta.status === 401 || resposta.status === 403) {
        console.log("[TERMOS] Usuário não autorizado.");

        setTermosPendentes([]);
        setAbrirModalTermos(false);

        return;
      }

      if (!resposta.ok) {
        throw new Error(
          `Erro ao verificar termos: ${resposta.status}`
        );
      }

      const dados = await resposta.json();

      console.log("[TERMOS] Resposta:", dados);

      const pendentes = Array.isArray(
        dados?.termos_pendentes
      )
        ? dados.termos_pendentes
        : [];

      const comercioId =
        dados?.comercio_id ?? null;

      console.log(
        "[TERMOS] Comércio:",
        comercioId
      );

      console.log(
        "[TERMOS] Termos pendentes:",
        pendentes.length
      );

      setTermosPendentes(pendentes);

      /*
       * Nenhum termo pendente.
       * Não abre o modal.
       */
      if (pendentes.length === 0) {
        console.log(
          "[TERMOS] Nenhum termo pendente."
        );

        setAbrirModalTermos(false);

        return;
      }

      /*
       * Descobre o ID do usuário diretamente
       * do JWT.
       */
      let usuarioId = null;

      try {
        const partes = token.split(".");

        if (partes.length === 3) {
          let payloadBase64 = partes[1];

          payloadBase64 = payloadBase64
            .replace(/-/g, "+")
            .replace(/_/g, "/");

          const payload = JSON.parse(
            atob(payloadBase64)
          );

          usuarioId =
            payload?.id ??
            payload?.cliente_id ??
            null;
        }
      } catch (erro) {
        console.warn(
          "[TERMOS] Não foi possível ler o usuário do token:",
          erro
        );
      }

      console.log(
        "[TERMOS] Usuário:",
        usuarioId
      );

      /*
       * Verifica se o usuário clicou em
       * "Depois" hoje.
       */
      const cache = lerCacheAvisoTermos();

      const hoje =
        obterDataLocalHojeTermos();

      const mesmoUsuario =
        cache?.usuario_id &&
        usuarioId &&
        String(cache.usuario_id) ===
        String(usuarioId);

      const mesmoComercio =
        cache?.comercio_id &&
        comercioId &&
        String(cache.comercio_id) ===
        String(comercioId);

      const foiDispensadoHoje =
        cache?.data === hoje &&
        mesmoUsuario &&
        mesmoComercio;

      if (foiDispensadoHoje) {
        console.log(
          "[TERMOS] Modal já foi dispensado hoje."
        );

        setAbrirModalTermos(false);

        return;
      }

      /*
       * Existem termos pendentes e o usuário
       * ainda não dispensou o aviso hoje.
       */
      console.log(
        "[TERMOS] Abrindo modal de termos pendentes."
      );

      setAbrirModalTermos(true);

    } catch (erro) {
      console.error(
        "[TERMOS] Erro ao verificar termos:",
        erro
      );

      setTermosPendentes([]);
      setAbrirModalTermos(false);

    } finally {
      setCarregandoTermos(false);
    }
  }



  useEffect(() => {
    const caminhoAtual = window.location.pathname;

    if (caminhoAtual !== "/ironbusiness/perfil") {
      setTermosPendentes([]);
      setAbrirModalTermos(false);
      return;
    }

    verificarTermosPendentes();
  }, []);
  function adiarAvisoTermos() {

    const usuario =
      (() => {

        try {

          return JSON.parse(
            localStorage.getItem(
              "usuario"
            ) || "null"
          );

        } catch {

          return null;
        }

      })();

    salvarCacheAvisoTermos({
      usuario_id:
        usuario?.id || null,

      comercio_id:
        usuario?.comercio_id || null,

      data:
        obterDataLocalHojeTermos(),

      termos_pendentes:
        termosPendentes.map(
          termo => termo.id
        )
    });

    setAbrirModalTermos(false);
  }
  function irParaTermos() {
    setAbrirModalTermos(false);

    window.open("/termos", "_blank");
  }
  /* =========================================================
     CARREGAR LEMBRETES
  ========================================================= */

  async function carregarLembretesInatividade() {

    const token =
      localStorage.getItem("token");


    if (!token) {

      setLembretesInatividade(null);

      return null;
    }


    try {

      const response =
        await fetch(
          `${API_URL}/tarefas/lembretes`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      if (!response.ok) {

        setLembretesInatividade(
          null
        );

        return null;
      }


      const resultado =
        await response.json();


      setLembretesInatividade(
        resultado
      );


      return resultado;

    } catch (erro) {

      console.error(
        "[LEMBRETES] Erro ao carregar:",
        erro
      );


      setLembretesInatividade(
        null
      );


      return null;
    }
  }


  /* =========================================================
     DETECTOR GLOBAL DE INATIVIDADE
  ========================================================= */

  function ControleInatividade() {

    const location =
      useLocation();


    const rotaAtual =
      location.pathname;


    const rotaBloqueada =
      ROTAS_SEM_LEMBRETES.includes(
        rotaAtual
      );


    useEffect(() => {

      let timerInatividade = null;

      let componenteAtivo = true;


      /* =====================================================
         ABRIR LEMBRETES
      ===================================================== */

      async function abrirPorInatividade() {

        /*
          Verifica a rota novamente quando
          o contador terminar.
        */

        const caminhoAtual =
          window.location.pathname;


        if (
          ROTAS_SEM_LEMBRETES.includes(
            caminhoAtual
          )
        ) {

          setAbrirLembretesInatividade(
            false
          );

          return;
        }


        const token =
          localStorage.getItem("token");


        /*
          Sem login não mostramos o modal.
        */

        if (!token) {
          return;
        }


        try {

          const response =
            await fetch(
              `${API_URL}/tarefas/lembretes`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );


          if (!response.ok) {
            return;
          }


          const resultado =
            await response.json();


          if (!componenteAtivo) {
            return;
          }


          /*
            Verifica novamente a rota depois
            que a API respondeu.
          */

          const caminhoDepois =
            window.location.pathname;


          if (
            ROTAS_SEM_LEMBRETES.includes(
              caminhoDepois
            )
          ) {

            setAbrirLembretesInatividade(
              false
            );

            return;
          }


          setLembretesInatividade(
            resultado
          );


          /*
            Só abre se realmente existir
            alguma tarefa.
          */

          if (
            Number(
              resultado?.total || 0
            ) > 0
          ) {

            setAbrirLembretesInatividade(
              true
            );

          }

        } catch (erro) {

          console.error(
            "[INATIVIDADE] Erro ao carregar lembretes:",
            erro
          );

        }
      }


      /* =====================================================
         INICIAR / REINICIAR CONTADOR
      ===================================================== */

      function reiniciarContador() {

        if (timerInatividade) {

          clearTimeout(
            timerInatividade
          );

        }


        /*
          Se estiver em uma rota bloqueada,
          não inicia o contador.
        */

        if (rotaBloqueada) {

          setAbrirLembretesInatividade(
            false
          );

          return;
        }


        timerInatividade =
          setTimeout(
            abrirPorInatividade,
            TEMPO_INATIVIDADE_LEMBRETES
          );

      }


      /* =====================================================
         ATIVIDADE DETECTADA
      ===================================================== */

      function registrarAtividade() {

        /*
          Qualquer atividade fecha
          o modal.
        */

        setAbrirLembretesInatividade(
          false
        );


        /*
          Reinicia os 5 minutos.
        */

        reiniciarContador();

      }


      /* =====================================================
         EVENTOS GLOBAIS
      ===================================================== */

      const eventos = [
        "mousemove",
        "mousedown",
        "keydown",
        "touchstart",
        "scroll"
      ];


      eventos.forEach(
        (evento) => {

          window.addEventListener(
            evento,
            registrarAtividade,
            {
              passive: true
            }
          );

        }
      );


      /*
        Começa a contar somente
        se a rota permitir.
      */

      reiniciarContador();


      /* =====================================================
         CLEANUP
      ===================================================== */

      return () => {

        componenteAtivo = false;


        if (timerInatividade) {

          clearTimeout(
            timerInatividade
          );

        }


        eventos.forEach(
          (evento) => {

            window.removeEventListener(
              evento,
              registrarAtividade
            );

          }
        );

      };

    }, [
      rotaAtual,
      rotaBloqueada
    ]);


    return null;
  }


  /* =========================================================
     KEEP ALIVE BACKEND
  ========================================================= */

  useEffect(() => {

    fetch(
      "https://nota-dz60.onrender.com/",
      {
        method: "GET",
        mode: "no-cors"
      }
    ).catch(() => { });

  }, []);


  /* =========================================================
     FUNDO DO COMÉRCIO COM CACHE
  ========================================================= */

  useEffect(() => {

    let componenteAtivo = true;


    async function carregarFundo() {

      const token =
        localStorage.getItem("token");


      /* ===================================================
         SEM TOKEN
      =================================================== */

      if (!token) {

        if (componenteAtivo) {

          setFundoComercio(null);

        }

        return;
      }


      /* ===================================================
         1. TENTA DESCOBRIR USUÁRIO LOCAL
      =================================================== */

      let usuarioLocal = null;


      try {

        usuarioLocal =
          JSON.parse(
            localStorage.getItem("usuario") ||
            "null"
          );

      } catch {

        usuarioLocal = null;

      }


      /* ===================================================
         2. TENTA CACHE DO FUNDO
      =================================================== */

      const cache =
        lerCacheFundo();


      /*
        Só usamos o cache se ele pertencer ao
        usuário atualmente salvo.
      */

      if (
        cache &&
        usuarioLocal?.id &&
        String(cache.usuario_id) ===
        String(usuarioLocal.id)
      ) {

        const imagemCache =
          FUNDOS_POR_COMERCIO[
          cache.comercio_id
          ];


        if (imagemCache) {

          setFundoComercio(
            imagemCache
          );


          console.log(
            "[FUNDO] Fundo carregado do cache:",
            cache.comercio_id
          );

        } else {

          setFundoComercio(null);

        }

      } else if (
        usuarioLocal?.comercio_id
      ) {

        /*
          Se ainda não existe nosso cache específico,
          podemos aproveitar o usuario já salvo.
        */

        const imagemLocal =
          FUNDOS_POR_COMERCIO[
          usuarioLocal.comercio_id
          ];


        if (imagemLocal) {

          setFundoComercio(
            imagemLocal
          );


          console.log(
            "[FUNDO] Fundo carregado pelo usuario local:",
            usuarioLocal.comercio_id
          );

        }

      }


      /* ===================================================
         3. VERIFICA SERVIDOR
      =================================================== */

      try {

        const resposta =
          await fetch(
            `${API_URL}/retorno/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        /* =================================================
           TOKEN EXPIRADO / SESSÃO INVÁLIDA
        ================================================= */

        if (
          resposta.status === 401 ||
          resposta.status === 403
        ) {

          console.warn(
            "[AUTH] Token expirado ou inválido. Encerrando sessão."
          );


          localStorage.removeItem(
            "token"
          );


          localStorage.removeItem(
            "usuario"
          );


          removerCacheFundo();


          window.location.replace(
            "/"
          );


          return;
        }


        /* =================================================
           OUTROS ERROS DA API
        ================================================= */

        if (!resposta.ok) {

          throw new Error(
            `Erro /retorno/me: ${resposta.status}`
          );

        }


        const usuarioServidor =
          await resposta.json();


        console.log(
          "[FUNDO] USUÁRIO RETORNADO PELO SERVIDOR:",
          usuarioServidor
        );


        console.log(
          "[FUNDO] COMERCIO_ID:",
          usuarioServidor?.comercio_id
        );


        console.log(
          "[FUNDO] IMAGEM ENCONTRADA:",
          FUNDOS_POR_COMERCIO[
          usuarioServidor?.comercio_id
          ]
        );


        if (!componenteAtivo) {
          return;
        }


        /* =================================================
           4. NÃO TEM COMÉRCIO
        ================================================= */

        if (
          !usuarioServidor?.comercio_id
        ) {

          setFundoComercio(null);


          removerCacheFundo();


          console.log(
            "[FUNDO] Usuário sem comércio."
          );


          return;
        }


        /* =================================================
           5. DESCOBRE FUNDO CORRETO
        ================================================= */

        const comercioIdServidor =
          usuarioServidor.comercio_id;


        const imagemServidor =
          FUNDOS_POR_COMERCIO[
          comercioIdServidor
          ];


        /* =================================================
           6. COMÉRCIO NÃO TEM IMAGEM CONFIGURADA
        ================================================= */

        if (!imagemServidor) {

          setFundoComercio(null);


          salvarCacheFundo({
            usuario_id:
              usuarioServidor.id,

            comercio_id:
              comercioIdServidor
          });


          console.log(
            "[FUNDO] Comércio sem fundo personalizado:",
            comercioIdServidor
          );


          return;
        }


        /* =================================================
           7. COMPARA CACHE
        ================================================= */

        const cacheAtualizado =
          lerCacheFundo();


        const mesmoUsuario =
          cacheAtualizado &&
          String(
            cacheAtualizado.usuario_id
          ) ===
          String(
            usuarioServidor.id
          );


        const mesmoComercio =
          cacheAtualizado &&
          String(
            cacheAtualizado.comercio_id
          ) ===
          String(
            comercioIdServidor
          );


        /* =================================================
           8. CACHE JÁ ESTÁ CERTO
        ================================================= */

        if (
          mesmoUsuario &&
          mesmoComercio
        ) {

          console.log(
            "[FUNDO] Cache já está atualizado."
          );


          /*
            Garantimos o fundo correto no state.
          */

          setFundoComercio(
            imagemServidor
          );


          return;
        }


        /* =================================================
           9. USUÁRIO OU COMÉRCIO MUDOU
        ================================================= */

        console.log(
          "[FUNDO] Alteração detectada.",
          {
            usuario:
              usuarioServidor.id,

            comercio:
              comercioIdServidor
          }
        );


        setFundoComercio(
          imagemServidor
        );


        salvarCacheFundo({
          usuario_id:
            usuarioServidor.id,

          comercio_id:
            comercioIdServidor
        });


        console.log(
          "[FUNDO] Cache atualizado."
        );


      } catch (erro) {

        /*
          Não apagamos o fundo se a API falhar.

          Se já conseguimos carregar pelo cache,
          continuamos usando ele.
        */

        console.warn(
          "[FUNDO] Servidor indisponível. Mantendo cache.",
          erro
        );

      }
    }


    carregarFundo();


    return () => {

      componenteAtivo = false;

    };

  }, []);


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <Router>

      <ControleTermos
        verificarTermosPendentes={verificarTermosPendentes}
        setTermosPendentes={setTermosPendentes}
        setAbrirModalTermos={setAbrirModalTermos}
      />

      <ControleInatividade />

      <div
        className="app"
        style={
          fundoComercio
            ? {
              backgroundImage:
                `url(${fundoComercio})`,

              backgroundSize:
                "cover",

              backgroundPosition:
                "center",

              backgroundRepeat:
                "no-repeat",

              minHeight:
                "100vh"
            }
            : undefined
        }
      >

        <RoteamentoComLoading />
        {abrirModalTermos && termosPendentes.length > 0 && (
          <div className="modal-termos-overlay">
            <div className="modal-termos">

              <div className="modal-termos-header">
                <div>
                  <span className="modal-termos-tag">
                    ATENÇÃO
                  </span>

                  <h2>
                    Novos termos disponíveis
                  </h2>
                </div>
              </div>

              <div className="modal-termos-body">

                <p className="modal-termos-intro">
                  Existem termos de uso que precisam ser revisados
                  e aceitos para continuar utilizando a plataforma.
                </p>

                <div className="modal-termos-lista">



                </div>

                <div className="modal-termos-aviso">
                  <strong>
                    A aceitação é necessária.
                  </strong>

                  <span>
                    Você poderá revisar todo o conteúdo antes de aceitar.
                  </span>
                </div>

              </div>

              <div className="modal-termos-footer">

                <button
                  type="button"
                  className="modal-termos-btn-depois"
                  onClick={adiarAvisoTermos}
                >
                  Depois
                </button>

                <button
                  type="button"
                  className="modal-termos-btn-aceitar"
                  onClick={irParaTermos}
                >
                  Ver termos
                </button>

              </div>

            </div>
          </div>
        )}

        {abrirLembretesInatividade &&
          lembretesInatividade && (

            <ModalLembretesTarefas
              dados={
                lembretesInatividade
              }

              fechar={() =>
                setAbrirLembretesInatividade(
                  false
                )
              }

              atualizar={
                carregarLembretesInatividade
              }
            />

          )}

      </div>

    </Router>

  );
}