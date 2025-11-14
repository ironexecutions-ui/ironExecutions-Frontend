import React from "react";
import "./sitescriados.css";

export default function SitesCriados() {
    return (
        <section className="sites-criados">
            <h2 className="sites-titulo">Sites criados pela Iron Executions</h2>

            <div className="sites-grid">

                <a
                    href="https://irongoals.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-card"
                >
                    <img
                        src="https://sbeotetrpndvnvjgddyv.supabase.co/storage/v1/object/public/fotosdeperfis/perfis/I_round.png"
                        alt="Logo IronGoals"
                        className="site-logo"
                    />

                    <h3 className="site-nome">IronGoals</h3>

                    <p className="site-descricao">
                        Plataforma moderna com cursos, rankings, perfis, metas, currículo automático,
                        sistema de vendas e estrutura profissional completa.
                    </p>
                </a>

            </div>
        </section>
    );
}
