import React, { useState } from "react";
import "./tipossites.css";
import ModalTipoSite from "./modaltipossite";

export default function TiposSites() {

    const [modalAberto, setModalAberto] = useState(false);
    const [modalInfo, setModalInfo] = useState({
        titulo: "",
        descricao: ""
    });

    function abrirModal(titulo, descricao) {
        setModalInfo({ titulo, descricao });
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
    }

    return (
        <section className="tipossites-container" id="tipos-sites">
            <h2 className="tipossites-titulo">Tipos de Sites que Criamos</h2>

            <div className="tipossites-grid">

                <div
                    className="tipossites-card"
                    onClick={() =>
                        abrirModal(
                            "Site Simples",
                            "Indicado para quem está começando e precisa de presença rápida na internet. Ideal para autônomos e pequenos negócios."
                        )
                    }
                >
                    <h3 className="tipossites-card-titulo">🌐 Site Simples</h3>
                    <p className="tipossites-card-texto">
                        Indicado para quem está começando e precisa de presença rápida na internet. Ideal para autônomos e pequenos negócios.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 4 a 7 dias.</p>
                </div>

                <div
                    className="tipossites-card"
                    onClick={() =>
                        abrirModal(
                            "Site Profissional",
                            "Perfeito para empresas que precisam exibir serviços, cardápio, fotos ou portfólio com organização e autoridade."
                        )
                    }
                >
                    <h3 className="tipossites-card-titulo">🏢 Site Profissional</h3>
                    <p className="tipossites-card-texto">
                        Perfeito para empresas que precisam exibir serviços, cardápio, fotos ou portfólio com organização e autoridade.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 7 a 12 dias.</p>
                </div>

                <div
                    className="tipossites-card"
                    onClick={() =>
                        abrirModal(
                            "Painel Administrativo",
                            "O cliente pode editar textos e imagens sempre que desejar. Muito usado por escolas, igrejas e negócios com atualizações semanais."
                        )
                    }
                >
                    <h3 className="tipossites-card-titulo">🖼 Painel Administrativo</h3>
                    <p className="tipossites-card-texto">
                        O cliente pode editar textos e imagens sempre que desejar. Muito usado por escolas, igrejas e negócios com atualizações semanais.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 10 a 18 dias.</p>
                </div>

                <div
                    className="tipossites-card"
                    onClick={() =>
                        abrirModal(
                            "Sistema de Agendamentos",
                            "Sistema com horários disponíveis e painel administrativo. Ideal para salões, esteticistas, clínicas e serviços com agenda."
                        )
                    }
                >
                    <h3 className="tipossites-card-titulo">📅 Sistema de Agendamentos</h3>
                    <p className="tipossites-card-texto">
                        Sistema com horários disponíveis e painel administrativo. Ideal para salões, esteticistas, clínicas e serviços com agenda.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 15 a 25 dias.</p>
                </div>

                <div
                    className="tipossites-card"
                    onClick={() =>
                        abrirModal(
                            "Loja Virtual Simples",
                            "Loja com carrinho e pagamento online. Muito usada para roupas, cosméticos e produtos personalizados."
                        )
                    }
                >
                    <h3 className="tipossites-card-titulo">🛒 Loja Virtual Simples</h3>
                    <p className="tipossites-card-texto">
                        Loja com carrinho e pagamento online. Muito usada para roupas, cosméticos e produtos personalizados.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 15 a 25 dias.</p>
                </div>

                <div
                    className="tipossites-card"
                    onClick={() =>
                        abrirModal(
                            "Loja Virtual Completa",
                            "E commerce completo com login, estoque, cupons e painel administrativo."
                        )
                    }
                >
                    <h3 className="tipossites-card-titulo">🏬 Loja Virtual Completa</h3>
                    <p className="tipossites-card-texto">
                        E commerce completo com login, estoque, cupons e painel administrativo.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 20 a 30 dias.</p>
                </div>

                <div
                    className="tipossites-card"
                    onClick={() =>
                        abrirModal(
                            "Plataforma de Cursos",
                            "Plataforma com login, aulas, vídeos hospedados no Vimeo, certificados e painel administrativo."
                        )
                    }
                >
                    <h3 className="tipossites-card-titulo">🎓 Plataforma de Cursos</h3>
                    <p className="tipossites-card-texto">
                        Plataforma com login, aulas, vídeos hospedados no Vimeo, certificados e painel administrativo.
                    </p>
                    <p className="tipossites-prazo">Prazo de entrega de 30 a 45 dias.</p>
                </div>

            </div>

            {modalAberto && (
                <ModalTipoSite
                    fechar={fecharModal}
                    titulo={modalInfo.titulo}
                    descricao={modalInfo.descricao}
                />
            )}
        </section>
    );
}
