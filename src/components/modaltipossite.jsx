import React, { useState } from "react";
import "./modaltipossite.css";

export default function ModalTipoSite({ fechar, titulo, descricao }) {

    const [lojaSelecionada, setLojaSelecionada] = useState("");
    const [infoLoja, setInfoLoja] = useState("");

    const [layoutSelecionado, setLayoutSelecionado] = useState("");
    const [infoLayout, setInfoLayout] = useState("");

    const lojas = [
        {
            nome: "Loja de Roupas",
            texto: "Ideal para moda, coleções, lançamentos e catálogo visual. Foco em apresentação estética e organização por categorias."
        },
        {
            nome: "Loja de Cosméticos",
            texto: "Perfeita para quem trabalha com beleza, skincare e maquiagem. Combina fotos detalhadas e estrutura voltada para conversão."
        },
        {
            nome: "Loja de Eletrônicos",
            texto: "Pensada para produtos técnicos com especificações, comparação entre itens e destaque para avaliações."
        },
        {
            nome: "Loja de Produtos Personalizados",
            texto: "Focada em criatividade, exibe diferentes variações de produtos e personalizações feitas pelo cliente."
        },
        {
            nome: "Loja Gourmet",
            texto: "Feita para confeitaria, cafés e produtos alimentícios. Visual saboroso, descrições completas e foco no impacto visual."
        }
    ];

    const layoutsPorLoja = {
        "Loja de Roupas": [
            { nome: "Fashion Clean", texto: "Um layout elegante e leve que destaca as fotografias. Serve muito bem para coleções e campanhas." },
            { nome: "Lookbook Dinâmico", texto: "Design inspirado em revistas. Cria impacto visual e transmite modernidade para a marca." },
            { nome: "Catálogo Premium", texto: "Organização sólida e profissional para quem deseja filtros eficientes e navegação clara." },
            { nome: "Street Urban", texto: "Visual jovem com cores fortes e energia, ideal para moda urbana." },
            { nome: "Luxury Dark", texto: "Layout preto com dourado, transmite exclusividade e sofisticação." }
        ],

        "Loja de Cosméticos": [
            { nome: "Soft Beauty", texto: "Cores suaves e curvas delicadas, transmite frescor e cuidado." },
            { nome: "Dermacare Pro", texto: "Estilo limpo e clínico, ideal para produtos de tratamento e cuidados dermatológicos." },
            { nome: "Makeup Glow", texto: "Contraste forte, brilhos e foco em produtos de maquiagem." },
            { nome: "Natural Clean", texto: "Estética orgânica com tons verdes e visuais naturais." },
            { nome: "Estética Premium", texto: "Sensação de luxo com designs elegantes e suaves." }
        ],

        "Loja de Eletrônicos": [
            { nome: "Tech Modern", texto: "Design direto, moderno e com foco em performance." },
            { nome: "Dark Neon", texto: "Visual com neon e contraste alto, muito usado para produtos gamers." },
            { nome: "Smart Grid", texto: "Estrutura baseada em blocos e linhas perfeitas, facilita busca e leitura." },
            { nome: "Ficha Técnica", texto: "Ideal para quem vende produtos com especificações técnicas importantes." },
            { nome: "Produtividade Pro", texto: "Visual corporativo focado em eletrônicos profissionais." }
        ],

        "Loja de Produtos Personalizados": [
            { nome: "Criativo Pop", texto: "Cores vivas e estilo alegre para destacar peças personalizadas." },
            { nome: "Canvas Design", texto: "Visual inspirado em galerias e artesanato." },
            { nome: "Custom Craft", texto: "Aparência artesanal com texturas e rusticidade suave." },
            { nome: "Minimal Custom", texto: "Leve e simples, foco total no produto final." },
            { nome: "Gift Shop Premium", texto: "Luxo suave com estética de loja de presentes sofisticada." }
        ],

        "Loja Gourmet": [
            { nome: "Chef Premium", texto: "Design refinado com impacto visual forte para produtos gourmet." },
            { nome: "Food Clean", texto: "Estética clara que passa limpeza e qualidade." },
            { nome: "Gourmet Dark", texto: "Tons escuros com fotos profissionais de alta qualidade." },
            { nome: "Receitas Visuais", texto: "Combinação de conteúdo e produtos, ideal para confeiteiros." },
            { nome: "Sabores Artesanais", texto: "Visual rústico e acolhedor, perfeito para alimentos caseiros." }
        ]
    };


    function escolherLoja(l) {
        setLojaSelecionada(l.nome);
        setInfoLoja(l.texto);
        setLayoutSelecionado("");
        setInfoLayout("");
    }

    function escolherLayout(l) {
        setLayoutSelecionado(l.nome);
        setInfoLayout(l.texto);
    }

    const mensagemZap = encodeURIComponent(
        `Olá! Gostaria muito de solicitar um orçamento de ${titulo} para um negócio ${lojaSelecionada} com um layout do tipo ${layoutSelecionado}. Obrigado!`
    );

    const linkZap = `https://api.whatsapp.com/send?phone=5511918547818&text=${mensagemZap}`;


    return (
        <div className="modaltipos-overlay" onClick={fechar}>
            <div className="modaltipos-content" onClick={(e) => e.stopPropagation()}>

                <h2 className="modaltipos-titulo">{titulo}</h2>
                <p className="modaltipos-texto">{descricao}</p>

                <h3 className="modaltipos-subtitulo">Escolha o tipo de loja</h3>

                <div className="modaltipos-lojas">
                    {lojas.map((l) => (
                        <button
                            key={l.nome}
                            className={`loja-botao ${lojaSelecionada === l.nome ? "ativo" : ""}`}
                            onClick={() => escolherLoja(l)}
                        >
                            {l.nome}
                        </button>
                    ))}
                </div>

                {lojaSelecionada && (
                    <>
                        <p className="modaltipos-info">{infoLoja}</p>

                        <h3 className="modaltipos-subtitulo">Escolha o tipo de layout</h3>

                        <div className="modaltipos-layouts">
                            {layoutsPorLoja[lojaSelecionada].map((lay) => (
                                <button
                                    key={lay.nome}
                                    className={`layout-botao ${layoutSelecionado === lay.nome ? "ativo" : ""}`}
                                    onClick={() => escolherLayout(lay)}
                                >
                                    {lay.nome}
                                </button>
                            ))}
                        </div>

                        {/* EXPLICAÇÃO BREVE DO LAYOUT IMEDIATAMENTE AO CLICAR */}
                        {layoutSelecionado && (
                            <p className="modaltipos-info">
                                {infoLayout}
                            </p>
                        )}
                    </>
                )}

                {layoutSelecionado && (
                    <div className="modaltipos-info-layout">
                        <a
                            href={linkZap}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="zap-orcamento"
                        >
                            Solicitar orçamento pelo WhatsApp
                        </a>
                    </div>
                )}

                <button className="modaltipos-botao-fechar" onClick={fechar}>Fechar</button>
            </div>
        </div>
    );
}
