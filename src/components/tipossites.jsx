import React from "react";
import "./tipossites.css";

export default function TiposSites() {

    // Todas as classes deste componente devem começar com "tipossites-"

    return (
        <section className="tipossites-container" id="tipos-sites">
            <h2 className="tipossites-titulo">Tipos de Sites que Criamos</h2>

            <div className="tipossites-grid">

                <a
                    href="/tipo/site-simples"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tipossites-card"
                >
                    <h3 className="tipossites-card-titulo">🌐 Site Simples</h3>
                    <p className="tipossites-card-texto">
                        Indicado para quem está começando e precisa de presença rápida na internet. Ideal para autônomos e pequenos negócios.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 4 a 7 dias.</p>
                </a>

                <a
                    href="/tipo/site-profissional"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tipossites-card"
                >
                    <h3 className="tipossites-card-titulo">🏢 Site Profissional</h3>
                    <p className="tipossites-card-texto">
                        Perfeito para empresas que precisam exibir serviços, cardápio, fotos ou portfólio com organização e autoridade.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 7 a 12 dias.</p>
                </a>

                <a
                    href="/tipo/painel-administrativo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tipossites-card"
                >
                    <h3 className="tipossites-card-titulo">🖼 Painel Administrativo</h3>
                    <p className="tipossites-card-texto">
                        O cliente pode editar textos e imagens sempre que desejar. Muito usado por escolas, igrejas e negócios com atualizações semanais.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 10 a 18 dias.</p>
                </a>

                <a
                    href="/tipo/agendamentos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tipossites-card"
                >
                    <h3 className="tipossites-card-titulo">📅 Sistema de Agendamentos</h3>
                    <p className="tipossites-card-texto">
                        Sistema com horários disponíveis e painel administrativo. Ideal para salões, esteticistas, clínicas e serviços com agenda.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 15 a 25 dias.</p>
                </a>

                <a
                    href="/tipo/loja-simples"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tipossites-card"
                >
                    <h3 className="tipossites-card-titulo">🛒 Loja Virtual Simples</h3>
                    <p className="tipossites-card-texto">
                        Loja com carrinho e pagamento online. Muito usada para roupas, cosméticos e produtos personalizados.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 15 a 25 dias.</p>
                </a>

                <a
                    href="/tipo/loja-completa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tipossites-card"
                >
                    <h3 className="tipossites-card-titulo">🏬 Loja Virtual Completa</h3>
                    <p className="tipossites-card-texto">
                        E-commerce completo com login, estoque, cupons e painel administrativo.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 20 a 30 dias.</p>
                </a>

                <a
                    href="/tipo/plataforma-cursos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tipossites-card"
                >
                    <h3 className="tipossites-card-titulo">🎓 Plataforma de Cursos</h3>
                    <p className="tipossites-card-texto">
                        Plataforma com login, aulas, vídeos hospedados no Vimeo, certificados e painel administrativo.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 30 a 45 dias.</p>
                </a>

            </div>
        </section>
    );
}
