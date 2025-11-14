import react from "react";
import "./layoutexample.css";

import layoutcleanmoderno from "../layouts/layoutcleanmoderno";
import layoutjovemcriativo from "../layouts/layoutjovemcriativo";
import layoutdarkfuturista from "../layouts/layoutdarkfuturista";
import layouteleganteluxuoso from "../layouts/layouteleganteluxuoso";
import layoutcorporativoprofissional from "../layouts/layoutcorporativoprofissional";
import layoutartisticoevisual from "../layouts/layoutartisticoevisual";
import layoutminimalistapremium from "../layouts/layoutminimalistapremium";
import layoutdinamicoparavendas from "../layouts/layoutdinamicoparavendas";

export default function layoutexample({ tipo }) {

    const Clean = layoutcleanmoderno;
    const Jovem = layoutjovemcriativo;
    const Dark = layoutdarkfuturista;
    const Luxo = layouteleganteluxuoso;
    const Corp = layoutcorporativoprofissional;
    const Art = layoutartisticoevisual;
    const Min = layoutminimalistapremium;
    const Venda = layoutdinamicoparavendas;

    const modelos = {
        "clean e moderno": <Clean />,
        "jovem e criativo": <Jovem />,
        "dark e futurista": <Dark />,
        "elegante e luxuoso": <Luxo />,
        "corporativo profissional": <Corp />,
        "artístico e visual": <Art />,
        "minimalista premium": <Min />,
        "dinâmico para vendas": <Venda />
    };

    return (
        <div className="le-container">
            {modelos[tipo.toLowerCase()] || (
                <p className="le-erro">nenhum layout selecionado</p>
            )}
        </div>
    );
}
