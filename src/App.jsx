import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./app.css";
import "./app-responsivo.css";
import FuncionariosPage from "./painel/components/info/funcionariospage";
import ContratoPublico from "../contratopublico";
import Painel from "./painel/painel";
import Protegido from "./protegido";
import ClientesPage from "./painel/components/info/infopage";

import Topo from "./components/topo";
import Hero from "./components/hero";
import Oferecemos from "./components/oferecemos";
import Servicos from "./components/servicos";
import TiposSites from "./components/tipossites";
import Rodape from "./components/rodape";
import WhatsAppButton from "./components/whatsappbutton";
import SitesCriados from "./components/sitescriados";
import DadosPage from "./painel/components/info/dadospage";
import Equipe from "./components/equipe";
import InicioModulos from "./painel/components/modulos/iniciomodulos";
import Pedido from "./pedido/pedido";
import CadastroComercio from "./painel/components/modulos/cadastrocomercio";
import IronBusinessPerfil from "./painel/components/modulos/perfil/ironbusiness";
import Ferramentas from "./ferramentas/ferramentas";
import ProtegidoClientes from "./protegidoclientes";
import { useLoading } from "./loadingcontext";

function RoteamentoComLoading() {

  const { setLoading } = useLoading();
  const location = useLocation();

  // sempre que a página mudar, mostra um loading curto
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Routes>

      <Route
        path="/"
        element={
          <>
            <Topo />
            <WhatsAppButton />
            <Hero />
            <Oferecemos />
            <Servicos />
            <TiposSites />
            <Equipe />
            <SitesCriados />
            <Rodape />
          </>
        }
      />
      <Route path="/contrato/:codigo" element={<ContratoPublico />} />
      <Route path="/contrato" element={<ContratoPublico />} />
      <Route path="/ironbusiness/*" element={<InicioModulos />} />
      <Route
        path="/cadastrocomercio"
        element={
          <Protegido>
            <CadastroComercio />
          </Protegido>
        }
      />
      <Route path="/pedido" element={<Pedido />} />
      <Route
        path="/ferramentas"
        element={
          <Protegido>
            <Ferramentas />
          </Protegido>
        }
      />

      <Route
        path="/painel"
        element={
          <Protegido>
            <Painel />
          </Protegido>
        }
      />

      <Route
        path="/clientes"
        element={
          <Protegido>
            <ClientesPage />
          </Protegido>
        }
      />
      <Route
        path="/ironbusiness/perfil"
        element={
          <ProtegidoClientes>
            <IronBusinessPerfil />
          </ProtegidoClientes>
        }
      />


      <Route
        path="/funcionarios"
        element={
          <Protegido>
            <FuncionariosPage />
          </Protegido>
        }
      />

      <Route
        path="/dados"
        element={
          <Protegido>
            <DadosPage />
          </Protegido>
        }
      />

    </Routes>
  );
}
export default function App() {

  useEffect(() => {
    fetch("https://nfcee.onrender.com/", {
      method: "GET",
      mode: "no-cors"
    }).catch(() => {
      // ignora erro, é só keep-alive
    });
  }, []);

  return (
    <Router>
      <div className="app">
        <RoteamentoComLoading />
      </div>
    </Router>
  );
}

