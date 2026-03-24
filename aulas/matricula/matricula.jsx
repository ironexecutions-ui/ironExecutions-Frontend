import React, { useState } from "react";
import Cadastro from "./componentes/cadastro";
import Aulas from "./componentes/aulas";
import Alunos from "./componentes/aluno";

import "./matricula.css";

export default function Matricula() {

    const [aba, setAba] = useState(3);

    return (
        <div className="matricula_container">

            {/* HEADER */}
            <div className="matricula_header">
                <h1>Gestão de Alunos</h1>
                <p>Controle completo de matrículas, aulas e alunos</p>
            </div>

            {/* TABS */}
            <div className="matricula_tabs">
                <button className={aba === 1 ? "ativo" : ""} onClick={() => setAba(1)}>
                    Cadastro
                </button>

                <button className={aba === 2 ? "ativo" : ""} onClick={() => setAba(2)}>
                    Aulas
                </button>

                <button className={aba === 3 ? "ativo" : ""} onClick={() => setAba(3)}>
                    Alunos
                </button>
            </div>

            {/* CONTEÚDO */}
            <div className="matricula_conteudo">
                {aba === 1 && <Cadastro />}
                {aba === 2 && <Aulas />}
                {aba === 3 && <Alunos />}
            </div>

        </div>
    );
}