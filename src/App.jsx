import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./app.css";
import "./app-responsivo.css";
import FuncionariosPage from "./painel/components/info/funcionariospage";

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

import Pedido from "./pedido/pedido";

export default function App() {
  return (
    <Router>
      <div className="app">

        <Routes>

          {/* Página inicial */}
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
                <SitesCriados />
                <Rodape />
              </>
            }
          />

          {/* Página de pedido */}
          <Route path="/pedido" element={<Pedido />} />

          {/* Painel protegido */}
          <Route
            path="/painel"
            element={
              <Protegido>
                <Painel />
              </Protegido>
            }
          />

          {/* Página de clientes protegida também */}
          <Route
            path="/clientes"
            element={
              <Protegido>
                <ClientesPage />
              </Protegido>
            }
          />
          {/* Página de funcionários protegida */}
          <Route
            path="/funcionarios"
            element={
              <Protegido>
                <FuncionariosPage />
              </Protegido>
            }
          />

        </Routes>

      </div>
    </Router>
  );
}
