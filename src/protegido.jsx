import React from "react";
import { Navigate } from "react-router-dom";

export default function Protegido({ children }) {
    const funcionario = localStorage.getItem("funcionario");

    if (!funcionario) {
        return <Navigate to="/" />;
    }

    return children;
}
