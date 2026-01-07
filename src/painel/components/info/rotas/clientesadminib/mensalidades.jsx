// IBMensalidades.jsx
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../../config";
import IBMensalidadeForm from "./mensform";
import "./mensalidades.css"
export default function IBMensalidades() {

    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);

    async function carregar() {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/ib/mensalidades`);
            const json = await res.json();
            setLista(json);
        } catch (err) {
            console.log("Erro ao carregar mensalidades", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <div className="mens-container">

            {/* CABEÇALHO */}
            <div className="mens-header">
                <h3 className="mens-titulo">Mensalidades</h3>

                <button
                    className="mens-btn-add"
                    onClick={() => setMostrarForm(true)}
                >
                    Adicionar
                </button>
            </div>

            {/* MODAL FORM */}
            {mostrarForm && (
                <IBMensalidadeForm
                    fechar={() => setMostrarForm(false)}
                    recarregar={carregar}
                />
            )}

            {/* ESTADOS */}
            {loading ? (
                <p className="mens-info">Carregando mensalidades...</p>
            ) : lista.length === 0 ? (
                <p className="mens-info">Nenhuma mensalidade encontrada.</p>
            ) : (

                <table className="mens-tabela">
                    <thead>
                        <tr>
                            <th>Loja</th>
                            <th>Data início</th>
                            <th>Valor</th>
                            <th>Situação</th>
                        </tr>
                    </thead>

                    <tbody>
                        {lista.map(item => (
                            <tr key={item.id} className="mens-linha">

                                <td className="mens-loja">
                                    {item.imagem ? (
                                        <img
                                            src={item.imagem}
                                            alt={item.loja}
                                            className="mens-img"
                                        />
                                    ) : (
                                        <div className="mens-img-placeholder">—</div>
                                    )}
                                    <span className="mens-loja-nome">{item.loja}</span>
                                </td>

                                <td className="mens-data">
                                    {new Date(item.data_inicio).toLocaleDateString("pt-BR")}
                                </td>

                                <td className="mens-valor">
                                    R$ {Number(item.valor).toFixed(2)}
                                </td>

                                <td className="mens-situacao">
                                    <span
                                        className={`mens-status mens-${item.comercio_id === 11 ? "admin" : item.situacao}`}
                                    >
                                        {item.comercio_id === 11 ? "admin" : item.situacao}
                                    </span>
                                </td>

                            </tr>
                        ))}
                    </tbody>


                </table>
            )}

        </div>
    );

}
