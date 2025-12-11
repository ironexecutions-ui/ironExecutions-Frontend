import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtegidoClientes({ children }) {

    const cliente = JSON.parse(localStorage.getItem("usuario"));

    if (!cliente) {
        return <Navigate to="/ironbusiness" />;
    }

    return children;
}
