import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtegidoClientes({ children }) {
    const cliente =
        JSON.parse(localStorage.getItem("cliente")) ||
        JSON.parse(localStorage.getItem("clientes"));

    if (!cliente || !cliente.id) {
        return <Navigate to="/ironbusiness" replace />;
    }

    return children;
}
