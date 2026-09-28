import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../config";

export default function Geral() {
    const { idComercioCriptografado } = useParams();

    useEffect(() => {
        async function acessar() {
            try {
                if (!idComercioCriptografado) {
                    window.location.replace("/");
                    return;
                }

                const resposta = await fetch(
                    `${API_URL}/link/geral/${encodeURIComponent(
                        idComercioCriptografado
                    )}`
                );

                const dados = await resposta.json();

                if (
                    !resposta.ok ||
                    !dados.ok ||
                    !dados.token
                ) {
                    window.location.replace("/");
                    return;
                }

                window.location.replace(
                    `/camera/${encodeURIComponent(dados.token)}`
                );

            } catch (erro) {
                console.error(
                    "[LINK GERAL] Erro:",
                    erro
                );

                window.location.replace("/");
            }
        }

        acessar();
    }, [idComercioCriptografado]);

    return null;
}