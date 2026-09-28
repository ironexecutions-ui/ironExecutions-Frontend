import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../config";

export default function Geral() {

    const {
        idComercioCriptografado
    } = useParams();

    useEffect(() => {

        async function acessarLoja() {

            try {

                if (!idComercioCriptografado) {
                    window.location.replace("/");
                    return;
                }

                const resposta = await fetch(
                    `${API_URL}/link/geral/${encodeURIComponent(
                        idComercioCriptografado
                    )}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json"
                        }
                    }
                );

                const resultado = await resposta
                    .json()
                    .catch(() => ({}));

                if (
                    !resposta.ok ||
                    !resultado.ok ||
                    !resultado.url
                ) {
                    window.location.replace("/");
                    return;
                }

                window.location.replace(
                    resultado.url
                );

            } catch (error) {

                console.error(
                    "[LINK GERAL] Erro:",
                    error
                );

                window.location.replace("/");
            }
        }

        acessarLoja();

    }, [
        idComercioCriptografado
    ]);

    return null;
}