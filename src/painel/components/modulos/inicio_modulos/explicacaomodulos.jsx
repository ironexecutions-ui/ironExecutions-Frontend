import React, { useEffect, useState } from "react";
import "./explicacaomodulos.css";
import { API_URL } from "../../../../../config";

export default function ExplicacaoModulos() {

    const [modulos, setModulos] = useState([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const resp = await fetch(`${API_URL}/modulos/ativos/publico`);
                const dados = await resp.json();
                setModulos(dados);
            } catch (err) {
                setErro("Não foi possível carregar os módulos.");
            }
        }

        carregar();
    }, []);

    return (
        <div className="explicacao-container-pub">

            <h2>Conheça os módulos</h2>

            <p className="explicacao-texto-pub">
                Cada módulo possui seu valor individual. Quando você contrata
                <strong className="negrito-azul"> o primeiro módulo</strong>,
                os <strong className="negrito-azul">2 módulos seguintes </strong>
                ficam com <strong className="negrito-azul">30% de desconto</strong>.
                A partir do <strong className="negrito-azul">4º módulo</strong>,
                todos passam a custar <strong className="negrito-azul">50% do valor original</strong>,
                o que reduz bastante o custo mensal total.
            </p>

            <p className="explicacao-texto-pub">
                Existe ainda a possibilidade de realizar um pagamento inicial de
                <strong className="negrito-azul"> R$ 100 por módulo contratado</strong>.
                Esse valor é cobrado uma única vez no início da contratação.
                Ao optar por esse pagamento antecipado,
                <strong className="negrito-azul"> todas as mensalidades de todos os módulos passam automaticamente a ter 50% de desconto</strong>,
                independentemente da quantidade de módulos ativa.
            </p>

            {erro && <p style={{ color: "red" }}>{erro}</p>}

            <div className="explicacao-bloco-pub">
                {modulos.length > 0 ? (
                    modulos.map((m) => (
                        <div key={m.id} className="modulo-card-pub">
                            <h3>{m.nome}</h3>
                            <p>{m.texto}</p>

                            <p className="preco-info-pub">
                                Preço sugerido, R$ {m.preco},00 mensais
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="carregando-pub">
                        Carregando módulos...
                    </p>
                )}
            </div>
        </div>
    );
}
