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

import RifaCompras from "../public/rifas/rifacompras";
import Codigo from "../public/codigo";
import InicioModulos from "../modulos/iniciomodulos";
import CadastroComercio from "../modulos/cadastrocomercio";
import IronBusinessPerfil from "../modulos/perfil/ironbusiness";
import ProtegidoClientes from "./protegidoclientes";
import { useLoading } from "./loadingcontext";
import { API_URL } from "../config";
import Aulas from "../aulas/aulas";
import Matricula from "../aulas/matricula/matricula";
import Perfil from "../aulas/perfil/perfil";
import Pagos from "..//aulas/pagos/pagos";
import Aula_pagamentos from "../aulas/pagamentos/aulas_pagamentos";
import PainelGeral from "../painelgeral/painel";
import ironExecutions from "./imagens/ironexecutions.png";
import missionaryStoreBrasil from "./imagens/missionarystorebrasil.png";
import teste from "./imagens/teste.png";
import dass from "./imagens/dass.png";
import alexsiaUtilidades from "./imagens/alexsiautilidades.png";


/* =========================================================
   MAPA FIXO
   COMERCIO_ID -> IMAGEM
========================================================= */

const FUNDOS_POR_COMERCIO = {
  11: ironExecutions,
  25: missionaryStoreBrasil,
  27: teste,
  28: dass,
  29: alexsiaUtilidades
};


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
        path="/rifa-compras/:id?"
        element={<RifaComprasNormalizada />}
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
        path="/aulas"
        element={<Aulas />}
      />

      <Route
        path="/aulas/matricula"
        element={<Matricula />}
      />

      <Route
        path="/aulas/perfil"
        element={<Perfil />}
      />

      <Route
        path="/pagos"
        element={<Pagos />}
      />

      <Route
        path="/pagos/:id"
        element={<Aula_pagamentos />}
      />

    </Routes>

  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [fundoComercio, setFundoComercio] =
    useState(null);


  /* =======================================================
     KEEP ALIVE BACKEND
  ======================================================= */

  useEffect(() => {

    fetch(
      "https://nota-dz60.onrender.com/",
      {
        method: "GET",
        mode: "no-cors"
      }
    ).catch(() => { });

  }, []);


  /* =======================================================
     FUNDO DO COMÉRCIO COM CACHE
  ======================================================= */

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

          localStorage.removeItem("token");
          localStorage.removeItem("usuario");

          removerCacheFundo();

          window.location.replace("/");

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


        if (!componenteAtivo) {
          return;
        }


        /* =================================================
           4. NÃO TEM COMÉRCIO
        ================================================= */

        if (!usuarioServidor?.comercio_id) {

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


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <Router>

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

      </div>

    </Router>

  );
}