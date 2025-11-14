import React, { useState } from "react";
import "./layouteleganteluxuoso.css";

export default function LayouteEleganteLuxuoso() {

    const [agendamento, setAgendamento] = useState({
        nome: "",
        telefone: "",
        servico: "",
        data: "",
        horario: ""
    });

    const servicos = [
        { id: 1, nome: "Design de Sobrancelhas", duracao: "40 min", preco: "R$ 45,00" },
        { id: 2, nome: "Limpeza Facial Premium", duracao: "1h", preco: "R$ 120,00" },
        { id: 3, nome: "Corte Feminino Luxo", duracao: "50 min", preco: "R$ 90,00" },
        { id: 4, nome: "Hidratação Profunda", duracao: "45 min", preco: "R$ 80,00" },
        { id: 5, nome: "Massagem Relaxante", duracao: "1h 20 min", preco: "R$ 150,00" },
        { id: 6, nome: "Manicure e Pedicure Deluxe", duracao: "1h 10 min", preco: "R$ 75,00" }
    ];

    const horariosDisponiveis = [
        "09:00", "09:40", "10:20", "11:00", "11:40",
        "13:00", "13:40", "14:20", "15:00", "15:40",
        "16:20", "17:00"
    ];

    function atualizar(e) {
        const { name, value } = e.target;
        setAgendamento(prev => ({ ...prev, [name]: value }));
    }

    const mensagem = encodeURIComponent(
        `Olá, gostaria de solicitar um orçamento referente ao layout Elegante Luxuoso.`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagem}`;

    return (
        <main className="luxo-site">

            {/* ================= HEADER E HERO ================= */}

            <header className="luxo-header">
                <div className="luxo-header-center">
                    <h1 className="luxo-logo">Studio Elegance</h1>

                    <nav className="luxo-nav">
                        <a href="#sobre">Sobre</a>
                        <a href="#servicos">Serviços</a>
                        <a href="#agendamento">Agendamento</a>
                        <a href="#contato">Contato</a>
                    </nav>
                </div>
            </header>

            <section className="luxo-hero">
                <div className="luxo-hero-content">
                    <h2 className="luxo-hero-titulo">
                        sofisticação que transforma beleza em arte
                    </h2>

                    <p className="luxo-hero-texto">
                        atendimento premium, ambiente aconchegante e serviços realizados
                        com máxima excelência.
                    </p>

                    <a href={linkZap} className="luxo-hero-botao">
                        Solicitar Orçamento
                    </a>
                </div>
            </section>


            {/* ================= SOBRE ================= */}

            <section id="sobre" className="luxo-sobre">
                <div className="luxo-sobre-center">

                    <h2 className="luxo-titulo-section">Sobre o Studio</h2>

                    <p className="luxo-paragrafo">
                        O Studio Elegance nasceu com a missão de proporcionar experiências únicas
                        em beleza e bem-estar. Nosso espaço combina estética refinada com técnicas
                        modernas que valorizam a individualidade de cada cliente.
                    </p>

                    <p className="luxo-paragrafo">
                        Todos os nossos procedimentos seguem padrões rigorosos de higiene,
                        qualidade e profissionalismo. Acreditamos que cada detalhe importa e
                        trabalhamos para que você se sinta cuidada, confiante e renovada.
                    </p>

                </div>
            </section>


            {/* ================= LISTA DE SERVIÇOS ================= */}

            <section id="servicos" className="luxo-servicos">
                <h2 className="luxo-titulo-section">Serviços Premium</h2>

                <div className="luxo-servicos-grid">

                    {servicos.map(s => (
                        <div key={s.id} className="luxo-servico-card">

                            <div className="luxo-servico-thumb"></div>

                            <h3 className="luxo-servico-nome">{s.nome}</h3>

                            <p className="luxo-servico-info">
                                duração aproximada <strong>{s.duracao}</strong>
                            </p>

                            <p className="luxo-servico-preco">{s.preco}</p>

                        </div>
                    ))}

                </div>
            </section>


            {/* ================= SISTEMA DE AGENDAMENTO ================= */}

            <section id="agendamento" className="luxo-agenda">
                <div className="luxo-agenda-center">

                    <h2 className="luxo-titulo-section">Agendamento</h2>

                    <p className="luxo-paragrafo">
                        Preencha os dados abaixo para verificar horários disponíveis para seu
                        atendimento. Este é apenas um exemplo funcional.
                    </p>

                    <form className="luxo-form">

                        <div className="luxo-form-group">
                            <label>Seu nome</label>
                            <input
                                name="nome"
                                type="text"
                                placeholder="Digite seu nome"
                                onChange={atualizar}
                            />
                        </div>

                        <div className="luxo-form-group">
                            <label>Telefone</label>
                            <input
                                name="telefone"
                                type="text"
                                placeholder="(DDD) 00000-0000"
                                onChange={atualizar}
                            />
                        </div>

                        <div className="luxo-form-group">
                            <label>Serviço desejado</label>
                            <select name="servico" onChange={atualizar}>
                                <option value="">Selecione</option>
                                {servicos.map(s => (
                                    <option key={s.id} value={s.nome}>{s.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="luxo-form-group">
                            <label>Data</label>
                            <input
                                name="data"
                                type="date"
                                onChange={atualizar}
                            />
                        </div>

                        <div className="luxo-form-group">
                            <label>Horário</label>
                            <select name="horario" onChange={atualizar}>
                                <option value="">Selecione</option>
                                {horariosDisponiveis.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                        </div>

                        <div className="luxo-form-resultado">
                            <h4>Pré-visualização do agendamento</h4>

                            <p><strong>Nome:</strong> {agendamento.nome || "---"}</p>
                            <p><strong>Telefone:</strong> {agendamento.telefone || "---"}</p>
                            <p><strong>Serviço:</strong> {agendamento.servico || "---"}</p>
                            <p><strong>Data:</strong> {agendamento.data || "---"}</p>
                            <p><strong>Horário:</strong> {agendamento.horario || "---"}</p>
                        </div>

                    </form>

                </div>
            </section>


            {/* ================= CONTATO ================= */}

            <section id="contato" className="luxo-contato-section">
                <div className="luxo-contato-center">

                    <h2 className="luxo-titulo-section">Contato</h2>

                    <p className="luxo-paragrafo">
                        Estamos à disposição para dúvidas, informações e atendimento personalizado.
                    </p>

                    <div className="luxo-contato-info">
                        <p><strong>Telefone:</strong> (11) 90000-0000</p>
                        <p><strong>Email:</strong> contato@studioelegance.com</p>
                        <p><strong>Endereço:</strong> Alameda Central, 215 — São Paulo</p>
                    </div>

                </div>
            </section>


            {/* ================= FOOTER ================= */}

            <footer className="luxo-footer">
                <div className="luxo-footer-center">

                    <div className="luxo-footer-col">
                        <h3>Studio Elegance</h3>
                        <p>Beleza elevada ao mais alto nível</p>
                    </div>

                    <div className="luxo-footer-col">
                        <h4>Seções</h4>
                        <a href="#sobre">Sobre</a>
                        <a href="#servicos">Serviços</a>
                        <a href="#agendamento">Agendar</a>
                        <a href="#contato">Contato</a>
                    </div>

                </div>

                <p className="luxo-copy">© 2025 Studio Elegance. Layout de exemplo.</p>
            </footer>

        </main>
    );
}
