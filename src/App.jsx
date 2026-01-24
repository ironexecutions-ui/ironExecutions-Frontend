import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./app.css";
import "./app-responsivo.css";

import PagamentosIB from "./pagamentos/pagamentosib";
import RifaCompras from "../public/rifas/rifacompras"
import InicioModulos from "../modulos/iniciomodulos";
import CadastroComercio from "../modulos/cadastrocomercio";
import IronBusinessPerfil from "../modulos/perfil/ironbusiness";
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

      <Route path="/rifa-compras" element={<RifaCompras />} />

      <Route path="/pagamento" element={<PagamentosIB />} />
      <Route path="/pagamento/:id" element={<PagamentosIB />} />

      <Route path="/*" element={<InicioModulos />} />
      <Route
        path="/cadastrocomercio"
        element={
          <CadastroComercio />
        }
      />


      <Route
        path="/perfil"
        element={
          <ProtegidoClientes>
            <IronBusinessPerfil />
          </ProtegidoClientes>
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

