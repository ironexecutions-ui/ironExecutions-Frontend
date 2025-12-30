import React from "react";
import "./sitescriados.css";

export default function SitesCriados() {
    return (
        <section className="sites-criados">
            <h2 className="sites-titulo">Sites criados pela Iron Executions</h2>

            <div className="sites-grid">

                {/* IronGoals */}
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
                        Plataforma moderna focada em desenvolvimento profissional, com cursos,
                        rankings, metas, perfis personalizados, currículo automático,
                        sistema de vendas e estrutura corporativa completa.
                    </p>
                </a>

                {/* Alexsia Utilidades */}
                <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-card"
                >
                    <img
                        src="https://alexsia-utilidades-8x70.onrender.com/assets/logo-ZZAVR0GM.jpg"
                        alt="Logo Alexsia Utilidades"
                        className="site-logo"
                    />

                    <h3 className="site-nome">Alexsia Utilidades</h3>

                    <p className="site-descricao">
                        Sistema completo de vendas para mercados e comércios,
                        com controle de produtos, estoque, preços, fluxo de caixa,
                        pedidos e uma base sólida para operações profissionais no varejo.
                    </p>
                </a>

                {/* Missionary Store Brasil */}
                <a
                    href="https://www.missionarystorebrasil.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-card"
                >
                    <img
                        src="https://mehkqondzeigwbgpotkr.supabase.co/storage/v1/object/public/produtos/m.png"
                        alt="Logo Missionary Store Brasil"
                        className="site-logo"
                    />

                    <h3 className="site-nome">Missionary Store Brasil</h3>

                    <p className="site-descricao">
                        Loja online voltada ao público missionário,
                        oferecendo produtos específicos para missionários de A Igreja de Jesus Cristo dos Santos dos Ultimos Dias,
                        com navegação simples, visual profissional e foco em praticidade.
                    </p>
                </a>

            </div>
        </section>
    );
}
