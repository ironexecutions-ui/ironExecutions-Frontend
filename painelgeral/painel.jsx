import React, { useEffect, useState } from "react";
import { API_URL } from "../config";
import PainelG from "./componentes/painelg";
export default function PainelGeral() {

    const [painelGeralCarregando, setPainelGeralCarregando] = useState(true);
    const [painelGeralAutorizado, setPainelGeralAutorizado] = useState(false);

    useEffect(() => {

        async function verificarAcessoPainel() {

            const token = localStorage.getItem("token");

            if (!token) {
                setPainelGeralAutorizado(false);
                setPainelGeralCarregando(false);
                return;
            }

            try {

                const resposta = await fetch(
                    `${API_URL}/panel/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!resposta.ok) {
                    setPainelGeralAutorizado(false);
                    return;
                }

                const dados = await resposta.json();

                setPainelGeralAutorizado(
                    dados.autorizado === true
                );

            } catch (error) {

                console.error(
                    "[PAINEL GERAL] Erro ao verificar acesso:",
                    error
                );

                setPainelGeralAutorizado(false);

            } finally {

                setPainelGeralCarregando(false);

            }
        }

        verificarAcessoPainel();

    }, []);


    if (painelGeralCarregando) {
        return (
            <div className="painel-geral-validacao-carregando">
                <h1>Verificando acesso...</h1>
            </div>
        );
    }


    if (!painelGeralAutorizado) {
        return (
            <div className="painel-geral-validacao-negada">
                <h1>Acesso negado</h1>
            </div>
        );
    }


    return (
        <div className="painel-geral-conteudo-principal">
            <PainelG />
        </div>
    );
}