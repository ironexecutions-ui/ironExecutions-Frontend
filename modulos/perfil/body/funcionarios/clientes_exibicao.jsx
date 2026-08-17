import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./clientes_exibicao.css";

export default function Funcionarios() {

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    const [loja, setLoja] = useState("");

    const [carregando, setCarregando] = useState(true);

    const [dados, setDados] = useState({
        "Administrador(a)": [],
        "Supervisor(a)": [],
        "Funcionario(a)": []
    });

    async function carregar() {

        if (!usuario.comercio_id) {
            setCarregando(false);
            return;
        }

        try {

            setCarregando(true);

            const resp = await fetch(
                `${API_URL}/exibicao/funcionarios/${usuario.comercio_id}`
            );

            if (!resp.ok) {
                throw new Error("Erro ao carregar equipe");
            }

            const json = await resp.json();

            setLoja(json.loja || "");

            setDados({
                "Administrador(a)": json["Administrador(a)"] || [],
                "Supervisor(a)": json["Supervisor(a)"] || [],
                "Funcionario(a)": json["Funcionario(a)"] || []
            });

        } catch (e) {

            console.log("Erro ao carregar funcionários", e);

        } finally {

            setCarregando(false);

        }
    }

    useEffect(() => {
        carregar();
    }, []);


    function renderizarPessoas(lista) {

        if (lista.length === 0) {
            return (
                <div className="equipe-premium-vazio">
                    <span>Nenhum usuário nesta função</span>
                </div>
            );
        }

        return lista.map((p, i) => (

            <div
                className="equipe-premium-pessoa"
                key={p.id || `${p.nome}-${i}`}
            >

                <div className="equipe-premium-avatar">
                    {p.nome?.trim()?.charAt(0)?.toUpperCase() || "?"}
                </div>

                <div className="equipe-premium-pessoa-info">

                    <strong>
                        {p.nome}
                    </strong>

                    <span>
                        {p.cargo || "Cargo não informado"}
                    </span>

                </div>

            </div>

        ));
    }


    if (carregando) {

        return (

            <div className="equipe-premium-container">

                <div className="equipe-premium-topo">

                    <div className="equipe-premium-titulo-area">

                        <div className="equipe-premium-skeleton equipe-premium-sk-titulo"></div>

                        <div className="equipe-premium-skeleton equipe-premium-sk-subtitulo"></div>

                    </div>

                </div>


                <div className="equipe-premium-colunas">

                    {[1, 2, 3].map(coluna => (

                        <div
                            className="equipe-premium-coluna equipe-premium-coluna-loading"
                            key={coluna}
                        >

                            <div className="equipe-premium-coluna-cabecalho">

                                <div className="equipe-premium-skeleton equipe-premium-sk-cabecalho"></div>

                                <div className="equipe-premium-skeleton equipe-premium-sk-contador"></div>

                            </div>


                            {[1, 2, 3].map(item => (

                                <div
                                    className="equipe-premium-pessoa equipe-premium-pessoa-loading"
                                    key={item}
                                >

                                    <div className="equipe-premium-skeleton equipe-premium-sk-avatar"></div>

                                    <div className="equipe-premium-loading-info">

                                        <div className="equipe-premium-skeleton equipe-premium-sk-nome"></div>

                                        <div className="equipe-premium-skeleton equipe-premium-sk-cargo"></div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ))}

                </div>

            </div>

        );

    }


    return (

        <section className="equipe-premium-container">

            <div className="equipe-premium-topo">

                <div className="equipe-premium-titulo-area">

                    <span className="equipe-premium-etiqueta">
                        EQUIPE
                    </span>

                    <h2>
                        Pessoas do seu comércio
                    </h2>

                    <p>
                        {loja
                            ? `Equipe cadastrada em ${loja}`
                            : "Usuários cadastrados no sistema"
                        }
                    </p>

                </div>


                <div className="equipe-premium-total">

                    <span>Total</span>

                    <strong>
                        {
                            dados["Administrador(a)"].length +
                            dados["Supervisor(a)"].length +
                            dados["Funcionario(a)"].length
                        }
                    </strong>

                </div>

            </div>


            <div className="equipe-premium-colunas">

                <div className="equipe-premium-coluna equipe-premium-administradores">

                    <div className="equipe-premium-coluna-cabecalho">

                        <div>


                            <h3>Administradores</h3>
                        </div>

                        <span className="equipe-premium-contador">
                            {dados["Administrador(a)"].length}
                        </span>

                    </div>

                    <div className="equipe-premium-lista">
                        {renderizarPessoas(dados["Administrador(a)"])}
                    </div>

                </div>


                <div className="equipe-premium-coluna equipe-premium-supervisores">

                    <div className="equipe-premium-coluna-cabecalho">

                        <div>

                            <h3>Supervisores</h3>
                        </div>

                        <span className="equipe-premium-contador">
                            {dados["Supervisor(a)"].length}
                        </span>

                    </div>

                    <div className="equipe-premium-lista">
                        {renderizarPessoas(dados["Supervisor(a)"])}
                    </div>

                </div>


                <div className="equipe-premium-coluna equipe-premium-funcionarios">

                    <div className="equipe-premium-coluna-cabecalho">

                        <div>


                            <h3>Funcionários</h3>
                        </div>

                        <span className="equipe-premium-contador">
                            {dados["Funcionario(a)"].length}
                        </span>

                    </div>

                    <div className="equipe-premium-lista">
                        {renderizarPessoas(dados["Funcionario(a)"])}
                    </div>

                </div>

            </div>

        </section>

    );
}