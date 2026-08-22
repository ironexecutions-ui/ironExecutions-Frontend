import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./cuponsfiscais.css";

export default function CuponsFiscais() {

    const [lista, setLista] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${API_URL}/fiscal/nfce`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(r => r.json())
            .then(dados => {
                setLista(dados);
                setCarregando(false);
            });
    }, []);

    async function imprimirDanfe(id) {
        try {
            const resposta = await fetch(
                `${API_URL}/fiscal/nfce/${id}/danfe`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                const texto = await resposta.text();

                console.error(
                    "Erro ao buscar DANFE:",
                    resposta.status,
                    texto
                );

                throw new Error(
                    `Erro ${resposta.status} ao gerar DANFE`
                );
            }

            const blob = await resposta.blob();

            const url = URL.createObjectURL(blob);

            window.open(
                url,
                "_blank"
            );

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 60000);

        } catch (erro) {
            console.error(
                "Erro ao imprimir DANFE:",
                erro
            );

            alert(
                "Não foi possível gerar o DANFE da NFC-e."
            );
        }
    } if (carregando) {
        return (
            <div className="cupons-fiscais">
                <p className="cupons-fiscais-loading">
                    Carregando cupons fiscais...
                </p>
            </div>
        );
    }

    return (
        <div className="cupons-fiscais">
            <h4>Cupons Fiscais (NFC-e)</h4>

            <table>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Série</th>
                        <th>Status</th>
                        <th>Ambiente</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {lista.map(n => (
                        <tr key={n.id}>
                            <td data-label="Número">
                                {n.numero_nfce}
                            </td>

                            <td data-label="Série">
                                {n.serie}
                            </td>

                            <td
                                data-label="Status"
                                className={`status-${n.status}`}
                            >
                                {n.status}
                            </td>

                            <td data-label="Ambiente">
                                {n.ambiente}
                            </td>

                            <td data-label="Data">
                                {new Date(n.criado_em).toLocaleString()}
                            </td>

                            <td data-label="Ações">
                                <button onClick={() => imprimirDanfe(n.id)}>
                                    Imprimir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
