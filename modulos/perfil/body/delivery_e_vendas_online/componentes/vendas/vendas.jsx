import React, { useEffect, useState } from "react";

import { API_URL } from "../../../../../../config";

import Tabela from "./tabela";


export default function Vendas() {

    // ============================================================
    // ESTADOS
    // ============================================================

    const [carregando, setCarregando] = useState(true);

    const [autorizado, setAutorizado] = useState(false);

    const [erro, setErro] = useState("");

    const [dadosAcesso, setDadosAcesso] = useState(null);


    // ============================================================
    // VERIFICAR ACESSO
    // ============================================================

    useEffect(() => {

        let componenteAtivo = true;


        async function verificarAcesso() {

            try {

                // =================================================
                // TOKEN
                // =================================================

                const token =
                    localStorage.getItem("token");


                if (!token) {

                    if (componenteAtivo) {

                        setAutorizado(false);

                        setErro(
                            "Sessão não encontrada."
                        );

                        setCarregando(false);

                    }

                    return;
                }


                // =================================================
                // CONSULTAR BACKEND
                // =================================================

                const resposta = await fetch(
                    `${API_URL}/ironstore/acesso`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                // =================================================
                // TOKEN EXPIRADO / INVÁLIDO
                // =================================================

                if (
                    resposta.status === 401
                ) {

                    localStorage.removeItem("token");
                    localStorage.removeItem("usuario");

                    window.location.replace("/");

                    return;
                }


                // =================================================
                // SEM PERMISSÃO
                // =================================================

                if (resposta.status === 403) {

                    const dados =
                        await resposta.json();

                    if (componenteAtivo) {

                        setAutorizado(false);

                        setErro(
                            dados?.detail ||
                            "Você não possui acesso ao IronStore."
                        );

                    }

                    return;
                }


                // =================================================
                // OUTROS ERROS
                // =================================================

                if (!resposta.ok) {

                    throw new Error(
                        `Erro ao verificar acesso: ${resposta.status}`
                    );
                }


                // =================================================
                // RESPOSTA
                // =================================================

                const dados =
                    await resposta.json();


                if (!componenteAtivo) {
                    return;
                }


                if (
                    dados?.ok === true &&
                    dados?.autorizado === true
                ) {

                    setDadosAcesso(dados);

                    setAutorizado(true);

                    setErro("");

                } else {

                    setAutorizado(false);

                    setErro(
                        "Acesso ao IronStore não autorizado."
                    );

                }


            } catch (erro) {

                console.error(
                    "[IRONSTORE] Erro verificando acesso:",
                    erro
                );


                if (componenteAtivo) {

                    setAutorizado(false);

                    setErro(
                        "Não foi possível verificar o acesso ao IronStore."
                    );

                }


            } finally {

                if (componenteAtivo) {
                    setCarregando(false);
                }

            }
        }


        verificarAcesso();


        return () => {
            componenteAtivo = false;
        };

    }, []);


    // ============================================================
    // CARREGANDO
    // ============================================================

    if (carregando) {

        return (
            <div className="ironstore-vendas-carregando">
                Verificando acesso...
            </div>
        );
    }


    // ============================================================
    // SEM ACESSO
    // ============================================================

    if (!autorizado) {

        return (
            <div className="ironstore-vendas-sem-acesso">

                <h3>
                    Acesso não autorizado
                </h3>

                <p>
                    {erro}
                </p>

            </div>
        );
    }


    // ============================================================
    // ACESSO AUTORIZADO
    // ============================================================

    return (
        <div className="ironstore-vendas-area">

            <Tabela
                comercioId={
                    dadosAcesso?.comercio?.id
                }
                usuario={
                    dadosAcesso?.usuario
                }
                comercio={
                    dadosAcesso?.comercio
                }
            />

        </div>
    );
}