import React, {
    useEffect,
    useRef
} from "react";

import { useNavigate } from "react-router-dom";

import { API_URL } from "../config";



export default function RegistroEmails() {

    const navigate = useNavigate();

    const registroIniciadoRef =
        useRef(false);


    useEffect(() => {

        if (
            registroIniciadoRef.current
        ) {
            return;
        }

        registroIniciadoRef.current = true;


        async function registrarEEncaminhar() {

            try {

                await fetch(
                    `${API_URL}/visitas-emails/registrar`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        keepalive: true
                    }
                );

            } catch (erro) {

                console.error(
                    "Não foi possível registrar a visita:",
                    erro
                );

            } finally {

                navigate(
                    "/",
                    {
                        replace: true
                    }
                );

            }

        }


        registrarEEncaminhar();

    }, [navigate]);


    return (

        <main
            className="registroEmailsPagina"
        >

            <section
                className="registroEmailsCarregamento"
            >

                <div
                    className="registroEmailsIndicador"
                    aria-hidden="true"
                />

                <p
                    className="registroEmailsMensagem"
                >
                    Abrindo a IronExecutions...
                </p>

            </section>

        </main>

    );

}