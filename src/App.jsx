import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./app.css";
import "./app-responsivo.css";

import Topo from "./components/topo";
import Hero from "./components/hero";
import Oferecemos from "./components/oferecemos";
import Servicos from "./components/servicos";
import TiposSites from "./components/tipossites";
import Rodape from "./components/rodape";
import WhatsAppButton from "./components/whatsappbutton";
import SitesCriados from "./components/sitescriados";

import Pedido from "./pedido/pedido";

// páginas internas
import TipoSiteSimples from "./tipos-de-sites/tipositesimples";
import TipoSiteProfissional from "./tipos-de-sites/tipositeprofissional";
import TipoPainel from "./tipos-de-sites/tipopainel";
import TipoAgendamentos from "./tipos-de-sites/tipoagendamentos";
import TipoLojaSimples from "./tipos-de-sites/tipolojasimples";
import TipoLojaCompleta from "./tipos-de-sites/tipolojacompleta";
import TipoCursos from "./tipos-de-sites/tipocursos";

export default function App() {
  return (
    <Router>
      <div className="app">

        <Routes>

          {/* Página principal com header e whatsapp */}
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

          <Route path="/pedido" element={<Pedido />} />

          {/* páginas internas sem topo e sem whatsapp */}
          <Route path="/tipo/site-simples" element={<TipoSiteSimples />} />
          <Route path="/tipo/site-profissional" element={<TipoSiteProfissional />} />
          <Route path="/tipo/painel-administrativo" element={<TipoPainel />} />
          <Route path="/tipo/agendamentos" element={<TipoAgendamentos />} />
          <Route path="/tipo/loja-simples" element={<TipoLojaSimples />} />
          <Route path="/tipo/loja-completa" element={<TipoLojaCompleta />} />
          <Route path="/tipo/plataforma-cursos" element={<TipoCursos />} />

        </Routes>

      </div>
    </Router>
  );
}
