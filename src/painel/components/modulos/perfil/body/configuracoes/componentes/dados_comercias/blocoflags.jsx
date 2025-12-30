import React from "react";
import "./blocoflags.css";

export default function BlocoFlags({ dados, podeEditar, salvar }) {
    return (
        <div className="bf-container">

            <h2 className="bf-titulo">Configurações internas</h2>

            <div className="bf-lista">

                {/* EDITAR PREÇO */}
                <div className="bf-item">
                    <label className="bf-label">
                        Permitir funcionários editarem preços
                    </label>
                    <br />
                    <select
                        className="bf-select"
                        disabled={!podeEditar}
                        value={dados.editar_preco}
                        onChange={e =>
                            salvar("editar_preco", Number(e.target.value))
                        }
                    >
                        <option value={0}>Não</option>
                        <option value={1}>Sim</option>
                    </select>
                </div>

                {/* IMPRESSÃO */}
                <div className="bf-item">
                    <label className="bf-label">
                        Impressão automática da comanda
                    </label>
                    <br />
                    <select
                        className="bf-select"
                        disabled={!podeEditar}
                        value={dados.node}
                        onChange={e =>
                            salvar("node", Number(e.target.value))
                        }
                    >
                        <option value={0}>Inativo</option>
                        <option value={1}>Ativo</option>
                    </select>
                </div>

                {/* MAQUININHA / API */}
                <div className="bf-item">
                    <label className="bf-label">
                        <strong>Conectar maquininha automaticamente nos computadores </strong>  <br />
                        <span style={{
                            fontSize: "1rem"
                        }} > é necessario Conectar as maquininhas no computadores manualmente </span>
                    </label>
                    <br />
                    <select
                        className="bf-select"
                        disabled={!podeEditar}
                        value={dados.api}
                        onChange={e =>
                            salvar("api", Number(e.target.value))
                        }
                    >
                        <option value={0}>Não</option>
                        <option value={1}>Sim</option>
                    </select>
                </div>

            </div>

        </div>
    );
}
