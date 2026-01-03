import React, { useEffect, useState } from "react";
import "./fiscal.css";

import RegistrarFiscal from "./componentes/registrarfiscal";
import CuponsFiscais from "./componentes/cuponsfiscais";
import RegistradosFiscal from "./componentes/registradosfiscal";
import DadosComerciaisFiscal from "./componentes/dadoscomerciofiscal";

import { API_URL } from ".././../../../../../../config";

export default function Fiscal() {

    // cupons é o padrão
    const [abaAtiva, setAbaAtiva] = useState("cupons");
    const [funcao, setFuncao] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const token = localStorage.getItem("token");

                const resp = await fetch(`${API_URL}/clientes/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const json = await resp.json();
                setFuncao(json.funcao);
            } catch {
                setFuncao(null);
            } finally {
                setCarregando(false);
            }
        }

        carregarUsuario();
    }, []);

    function renderizarConteudo() {

        // se não for administrador, só pode ver cupons
        if (funcao !== "Administrador(a)") {
            return <CuponsFiscais />;
        }

        if (abaAtiva === "registrar") {
            return <RegistrarFiscal />;
        }

        if (abaAtiva === "registrados") {
            return <RegistradosFiscal />;
        }

        if (abaAtiva === "dados-comerciais") {
            return <DadosComerciaisFiscal />;
        }

        return <CuponsFiscais />;
    }

    if (carregando) {
        return (
            <div className="fiscal-carregando">
                <div className="fiscal-loader"></div>
                <p>Carregando módulo fiscal</p>
                <span>Verificando permissões e dados</span>
            </div>
        );
    }


    return (
        <div className="fiscal-container">

            <h3>Fiscal</h3>

            <div className="fiscal-botoes">

                <button
                    className={abaAtiva === "cupons" ? "ativo" : ""}
                    onClick={() => setAbaAtiva("cupons")}
                >
                    Cupons
                </button>

                {funcao === "Administrador(a)" && (
                    <>
                        <button
                            className={abaAtiva === "registrar" ? "ativo" : ""}
                            onClick={() => setAbaAtiva("registrar")}
                        >
                            Registrar
                        </button>

                        <button
                            className={abaAtiva === "registrados" ? "ativo" : ""}
                            onClick={() => setAbaAtiva("registrados")}
                        >
                            Registrados
                        </button>

                        <button
                            className={abaAtiva === "dados-comerciais" ? "ativo" : ""}
                            onClick={() => setAbaAtiva("dados-comerciais")}
                        >
                            Dados Comerciais
                        </button>
                    </>
                )}

            </div>

            <div className="fiscal-conteudo">
                {renderizarConteudo()}
            </div>

        </div>
    );
}
