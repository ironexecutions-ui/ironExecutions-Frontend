import React from "react";
import "./rodape.css";

export default function Rodape() {

    // Todas as classes deste componente começam com "rodape-" para manter organização e evitar conflitos

    return (
        <footer className="rodape-container" id="contato">
            <p className="rodape-texto">
                Iron Executions cria sites modernos e sistemas profissionais
            </p>
            <p className="rodape-copy">
                © 2025 Todos os direitos reservados
            </p>
        </footer>
    );
}
