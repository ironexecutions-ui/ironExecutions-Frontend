import React, { useState } from "react";
import LayoutButtons from "./components/layoutbuttons";
import LayoutExample from "./components/layoutexample";
import "./components/layouts.css";

export default function TipoModeloBase({ titulo }) {

    const [layoutSelecionado, setLayoutSelecionado] = useState(null);

    return (
        <div className="tipo-container">

            {/* Área inicial que some quando o layout é escolhido */}
            {!layoutSelecionado && (
                <>
                    <button className="voltar-btn" onClick={() => window.close()}>
                        Voltar ao início
                    </button>

                    <h1 className="tipo-titulo">{titulo}</h1>

                    <p className="tipo-sub">
                        Escolha um estilo de layout e visualize um exemplo moderno.
                    </p>
                </>
            )}

            {/* LayoutButtons SEMPRE aparece,
                mas ele mesmo controla quando mostrar os botões */}
            <LayoutButtons onSelect={setLayoutSelecionado} layoutAtivo={layoutSelecionado} />

            {/* Exibir layout escolhido */}
            {layoutSelecionado && (
                <LayoutExample tipo={layoutSelecionado} />
            )}
        </div>
    );
}
