import React, { useState } from "react";

import "./camera.css";

import NomeCamera from "./componentes/nomecamera/nomecamera";
import Cadastrados from "./componentes/cadastrados/cadastrados";
import Arquivos from "./componentes/arquivos/arquivos";

export default function Camera() {

    const [abaAtiva, setAbaAtiva] = useState("arquivos");

    return (
        <div className="camera-modulo-painel-principal">

            <div className="camera-modulo-cabecalho-superior">

                <h1 className="camera-modulo-titulo-principal">
                    Câmera
                </h1>



            </div>


            {/* =============================================
                NAVEGAÇÃO
            ============================================= */}

            <div className="camera-modulo-navegacao-abas">

                <button
                    type="button"
                    className={
                        abaAtiva === "nome_camera"
                            ? "camera-modulo-botao-aba camera-modulo-botao-aba-ativo"
                            : "camera-modulo-botao-aba"
                    }
                    onClick={() => setAbaAtiva("nome_camera")}
                >
                    Nome da câmera
                </button>


                <button
                    type="button"
                    className={
                        abaAtiva === "cadastrados"
                            ? "camera-modulo-botao-aba camera-modulo-botao-aba-ativo"
                            : "camera-modulo-botao-aba"
                    }
                    onClick={() => setAbaAtiva("cadastrados")}
                >
                    Cadastrados
                </button>


                <button
                    type="button"
                    className={
                        abaAtiva === "arquivos"
                            ? "camera-modulo-botao-aba camera-modulo-botao-aba-ativo"
                            : "camera-modulo-botao-aba"
                    }
                    onClick={() => setAbaAtiva("arquivos")}
                >
                    Arquivos
                </button>

            </div>


            {/* =============================================
                CONTEÚDO DA ABA
            ============================================= */}

            <div className="camera-modulo-area-conteudo">

                {abaAtiva === "nome_camera" && (
                    <NomeCamera />
                )}

                {abaAtiva === "cadastrados" && (
                    <Cadastrados />
                )}

                {abaAtiva === "arquivos" && (
                    <Arquivos />
                )}

            </div>

        </div>
    );
}