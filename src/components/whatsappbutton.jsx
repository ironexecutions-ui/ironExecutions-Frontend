import React from "react";
import "./whatsappbutton.css";

export default function WhatsAppButton() {

    const mensagem = encodeURIComponent(
        "Olá! Gostaria de solicitar o orçamento para um site."
    );

    const link = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;

    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="zap-bolinha">
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png"
                alt="WhatsApp"
            />
        </a>
    );
}
