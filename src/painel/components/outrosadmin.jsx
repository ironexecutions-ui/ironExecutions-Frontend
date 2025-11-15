import React, { useEffect, useState } from "react";
import "./outrosadmin.css";
import { API_URL } from "../../../config";

export default function OutrosAdmin() {

    const [meses, setMeses] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [socios, setSocios] = useState([]);
    const [mostrarSocios, setMostrarSocios] = useState(false);

    const email = localStorage.getItem("email");

    async function carregarGanhos() {
        try {
            const resp = await fetch(`${API_URL}/ganhos/mensais?email=${email}`);
            const dados = await resp.json();

            console.log("RETORNO DA API:", dados); // AQUI
            setMeses(dados);

        } catch (err) {
            console.log("Erro ao carregar ganhos", err);
        }
    }


    async function carregarSocios() {
        try {
            const resp = await fetch(`${API_URL}/ganhos/socios`);
            const dados = await resp.json();
            setSocios(dados);
        } catch (err) {
            console.log("Erro ao carregar socios", err);
        }
    }

    useEffect(() => {
        carregarGanhos();
        carregarSocios();
    }, []);

    return (
        <div className="oa-box">

            <h2 className="oa-titulo">Ganhos</h2>

            {/* Botões dos meses */}
            <div className="oa-meses">
                {meses.length === 0 ? (
                    <p className="oa-sem-ganhos">Nenhum ganho encontrado</p>
                ) : (
                    meses.map((item, index) => (
                        <button
                            key={index}
                            className="oa-mes-botao"
                            onClick={() => setSelecionado(item)}
                        >
                            {item.mes} ({item.ganho_usuario.toFixed(2)} R$)
                        </button>
                    ))
                )}
            </div>


            {/* Detalhes do mês */}
            {selecionado && (
                <div className="oa-detalhes">
                    <h3>Detalhes do mês {selecionado.mes}</h3>

                    <p className="oa-usuario-info">
                        {selecionado.usuario}, porcentagem {selecionado.porcentagem}, recebeu
                        <strong> {selecionado.ganho_usuario.toFixed(2)} R$</strong>
                    </p>

                    <div className="oa-servicos-lista">
                        {selecionado.servicos.map((s, i) => (
                            <div key={i} className="oa-servico">
                                <p><strong>Cliente:</strong> {s.cliente}</p>
                                <p><strong>Valor:</strong> {s.valor} R$</p>
                                <a href={s.link} target="_blank" rel="noreferrer">link do cliente</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Botão para abrir ganhos dos sócios */}
            <button className="oa-socios-botao" onClick={() => setMostrarSocios(true)}>
                Ver ganhos dos outros sócios
            </button>

            {/* Modal dos sócios */}
            {mostrarSocios && (
                <div className="oa-modal">
                    <div className="oa-modal-conteudo">

                        <h3 className="oa-modal-titulo">Ganhos dos Sócios</h3>

                        {socios.map((s, i) => (
                            <div key={i} className="oa-socio-bloco">

                                <h4 className="oa-socio-nome">
                                    {s.socio} ({s.porcentagem}%)
                                </h4>

                                {s.meses.map((m, idx) => (
                                    <p key={idx} className="oa-socio-linha">
                                        {m.mes}: <strong>{m.ganho_socio.toFixed(2)} R$</strong>
                                    </p>
                                ))}
                            </div>
                        ))}

                        <button className="oa-fechar" onClick={() => setMostrarSocios(false)}>
                            Fechar
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}
