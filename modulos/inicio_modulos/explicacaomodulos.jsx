
import React, { useEffect, useMemo, useState } from "react";
import "./explicacaomodulos.css";
import { API_URL } from "../../config";

export default function ExplicacaoModulos() {
    const [modulos, setModulos] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [tipoExpandido, setTipoExpandido] = useState(null);

    useEffect(() => {
        let ativo = true;

        async function carregarModulos() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await fetch(
                    `${API_URL}/modulos/ativos/publico`,
                    { cache: "no-store" }
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao carregar módulos.");
                }

                const dados = await resposta.json();

                if (ativo) {
                    setModulos(Array.isArray(dados) ? dados : []);
                }
            } catch (error) {
                console.error("[MÓDULOS PÚBLICOS]", error);

                if (ativo) {
                    setErro("Não foi possível carregar os módulos.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarModulos();

        return () => {
            ativo = false;
        };
    }, []);

    const tiposComercio = useMemo(() => {
        const agrupados = new Map();

        modulos.forEach((modulo) => {
            const tipo = String(modulo.tipo_comercio || "").trim();

            if (!tipo) return;

            if (!agrupados.has(tipo)) {
                agrupados.set(tipo, {
                    id: modulo.tipo_comercio_id || tipo,
                    tipo,
                    descricao: modulo.tipo_comercio_descricao || "",
                    modulos: []
                });
            }

            agrupados.get(tipo).modulos.push(modulo);
        });

        return Array.from(agrupados.values());
    }, [modulos]);

    const totalModulos = tiposComercio.reduce(
        (total, item) => total + item.modulos.length,
        0
    );

    function alternarTipo(tipo) {
        setTipoExpandido((atual) => atual === tipo ? null : tipo);
    }

    return (
        <main className="iron-apresentacao">

            {/* ABERTURA COM OFERTA GRATUITA */}

            <section className="iron-abertura">
                <div className="iron-abertura-conteudo">
                    <span className="iron-identidade">
                        IRON EXECUTIONS
                    </span>

                    <div className="iron-oferta-selo">
                        <span className="iron-oferta-ponto" />
                        ACESSO GRATUITO DISPONÍVEL
                    </div>

                    <h1>
                        Sua empresa pode começar
                        <span> sem pagar nada.</span>
                    </h1>

                    <p className="iron-abertura-descricao">
                        Uma plataforma de gestão e operação desenvolvida
                        para empresas de diferentes segmentos. Cadastre
                        seu negócio, conheça os recursos e comece a
                        utilizar o sistema com armazenamento gratuito.
                    </p>

                    <div className="iron-abertura-beneficio">
                        <div className="iron-beneficio-numero">
                            <strong>1</strong>
                            <span>GB</span>
                        </div>

                        <div className="iron-beneficio-texto">
                            <strong>GRÁTIS PARA SUA EMPRESA</strong>
                            <span>
                                Seu primeiro espaço de armazenamento,
                                sem mensalidade.
                            </span>
                        </div>
                    </div>

                    <a
                        href="#iron-segmentos"
                        className="iron-abertura-link"
                    >
                        Conheça os recursos disponíveis
                        <span>↗</span>
                    </a>
                </div>

                <div className="iron-abertura-lateral">
                    <div className="iron-armazenamento-card">
                        <div className="iron-armazenamento-topo">
                            <div>
                                <span className="iron-armazenamento-legenda">
                                    SEU ESPAÇO INICIAL
                                </span>
                                <strong>Armazenamento</strong>
                            </div>

                            <span className="iron-armazenamento-status">
                                GRATUITO
                            </span>
                        </div>

                        <div className="iron-armazenamento-valor">
                            <strong>1 GB</strong>
                            <span>incluído na entrada</span>
                        </div>

                        <div className="iron-armazenamento-barra">
                            <span />
                        </div>

                        <div className="iron-armazenamento-rodape">
                            <span>Espaço disponibilizado</span>
                            <strong>R$ 0,00</strong>
                        </div>

                        <div className="iron-armazenamento-divisor" />

                        <div className="iron-armazenamento-mensagem">
                            <span className="iron-armazenamento-check">✓</span>
                            <p>
                                Comece a utilizar o sistema sem contratar
                                um plano de armazenamento.
                            </p>
                        </div>
                    </div>

                    <div className="iron-abertura-observacao">
                        <strong>Uma plataforma para diferentes empresas.</strong>
                        <span>
                            Os recursos são organizados conforme o segmento
                            e as necessidades de cada negócio.
                        </span>
                    </div>
                </div>
            </section>

            {/* PROPOSTA DE VALOR */}

            <section className="iron-proposta">
                <div className="iron-proposta-titulo">
                    <span className="iron-secao-label">
                        UMA PLATAFORMA PARA NEGÓCIOS
                    </span>

                    <h2>
                        Tecnologia para organizar.
                        <span> Estrutura para crescer.</span>
                    </h2>

                    <p>
                        A Iron Executions foi desenvolvida para atender
                        empresas de diferentes áreas. Em vez de limitar
                        a plataforma a um único segmento, os recursos
                        são organizados de acordo com a atividade de cada
                        negócio.
                    </p>
                </div>

                <div className="iron-proposta-pilares">
                    <article>
                        <span className="iron-pilar-numero">01</span>
                        <strong>Diferentes segmentos</strong>
                        <p>
                            Soluções organizadas por tipo de comércio,
                            com módulos e funcionalidades correspondentes.
                        </p>
                    </article>

                    <article>
                        <span className="iron-pilar-numero">02</span>
                        <strong>Comece gratuitamente</strong>
                        <p>
                            Acesse a plataforma e receba 1 GB de
                            armazenamento sem mensalidade.
                        </p>
                    </article>

                    <article>
                        <span className="iron-pilar-numero">03</span>
                        <strong>Amplie quando precisar</strong>
                        <p>
                            Contrate espaço adicional ou escolha o
                            armazenamento ilimitado.
                        </p>
                    </article>
                </div>
            </section>

            {/* SEGMENTOS E MÓDULOS */}

            <section className="iron-segmentos" id="iron-segmentos">
                <div className="iron-segmentos-cabecalho">
                    <div>
                        <span className="iron-secao-label">
                            RECURSOS DA PLATAFORMA
                        </span>

                        <h2>
                            Cada empresa tem suas necessidades.
                            <span> Nós temos os módulos.</span>
                        </h2>

                        <p>
                            Selecione um segmento para conhecer os módulos
                            e as funcionalidades disponíveis para aquela
                            atividade comercial.
                        </p>
                    </div>

                    <div className="iron-segmentos-indicadores">
                        <div>
                            <strong>{tiposComercio.length}</strong>
                            <span>Segmentos</span>
                        </div>
                        <div>
                            <strong>{totalModulos}</strong>
                            <span>Módulos</span>
                        </div>
                    </div>
                </div>

                {erro && (
                    <div className="iron-erro" role="alert">
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <div className="iron-carregando">
                        <span className="iron-spinner" />
                        <p>Carregando os recursos da plataforma...</p>
                    </div>
                ) : tiposComercio.length === 0 ? (
                    <div className="iron-vazio">
                        <strong>Recursos indisponíveis no momento.</strong>
                        <p>
                            Não encontramos segmentos cadastrados para
                            apresentar.
                        </p>
                    </div>
                ) : (
                    <div className="iron-segmentos-lista">
                        {tiposComercio.map((item, indice) => {
                            const expandido = tipoExpandido === item.tipo;

                            return (
                                <article
                                    className={`iron-segmento ${expandido ? "iron-segmento-aberto" : ""
                                        }`}
                                    key={item.id}
                                >
                                    <button
                                        type="button"
                                        className="iron-segmento-cabecalho"
                                        onClick={() => alternarTipo(item.tipo)}
                                        aria-expanded={expandido}
                                    >
                                        <span className="iron-segmento-indice">
                                            {String(indice + 1).padStart(2, "0")}
                                        </span>

                                        <span className="iron-segmento-identificacao">
                                            <strong>{item.tipo}</strong>
                                            <small>
                                                {item.modulos.length}{" "}
                                                {item.modulos.length === 1
                                                    ? "módulo disponível"
                                                    : "módulos disponíveis"}
                                            </small>
                                        </span>

                                        <span className="iron-segmento-abrir">
                                            {expandido ? "−" : "+"}
                                        </span>
                                    </button>

                                    {expandido && (
                                        <div className="iron-segmento-corpo">
                                            {item.descricao && (
                                                <p className="iron-segmento-descricao">
                                                    {item.descricao}
                                                </p>
                                            )}

                                            <div className="iron-modulos-grade">
                                                {item.modulos.map((modulo) => (
                                                    <div
                                                        className="iron-modulo"
                                                        key={modulo.id}
                                                    >
                                                        <span className="iron-modulo-check">
                                                            ✓
                                                        </span>

                                                        <div>
                                                            <strong>
                                                                {modulo.nome}
                                                            </strong>
                                                            <p>
                                                                {modulo.texto ||
                                                                    "Funcionalidade disponível na plataforma."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* EXPLICAÇÃO DO ARMAZENAMENTO */}

            <section className="iron-armazenamento-explicacao">
                <div className="iron-armazenamento-explicacao-titulo">
                    <span className="iron-secao-label">
                        ENTENDA COMO FUNCIONA
                    </span>

                    <h2>
                        O que é contabilizado no armazenamento?
                    </h2>

                    <p>
                        O espaço utilizado pela empresa é calculado
                        considerando o conjunto de informações e arquivos
                        armazenados na plataforma, e não somente as fotos
                        e os documentos enviados.
                    </p>
                </div>

                <div className="iron-armazenamento-conteudo">
                    <div className="iron-armazenamento-itens">
                        <article>
                            <span>01</span>
                            <div>
                                <strong>Arquivos e documentos</strong>
                                <p>
                                    PDFs, documentos, arquivos enviados
                                    e outros conteúdos armazenados.
                                </p>
                            </div>
                        </article>

                        <article>
                            <span>02</span>
                            <div>
                                <strong>Imagens e fotografias</strong>
                                <p>
                                    Fotos de produtos, imagens de cadastros,
                                    imagens de perfil e demais arquivos visuais.
                                </p>
                            </div>
                        </article>

                        <article>
                            <span>03</span>
                            <div>
                                <strong>Dados e registros</strong>
                                <p>
                                    Informações cadastradas e registros
                                    armazenados nos módulos do sistema,
                                    conforme o consumo efetivo de dados.
                                </p>
                            </div>
                        </article>

                        <article>
                            <span>04</span>
                            <div>
                                <strong>Demais conteúdos salvos</strong>
                                <p>
                                    Outros dados e arquivos que permaneçam
                                    armazenados na estrutura da plataforma.
                                </p>
                            </div>
                        </article>
                    </div>

                    <aside className="iron-armazenamento-nota">
                        <span className="iron-armazenamento-nota-icone">
                            i
                        </span>

                        <strong>O cálculo considera o armazenamento total.</strong>

                        <p>
                            O consumo é calculado pela soma dos dados e
                            arquivos efetivamente armazenados pela empresa
                            no sistema. Portanto, mesmo informações que
                            não sejam imagens ou documentos podem ocupar
                            parte do espaço disponível.
                        </p>

                        <div className="iron-armazenamento-nota-exemplo">
                            <span>Exemplo de consumo</span>
                            <strong>
                                Dados + imagens + documentos + arquivos
                            </strong>
                            <small>
                                Tudo entra no cálculo do espaço utilizado.
                            </small>
                        </div>
                    </aside>
                </div>
            </section>

            {/* CONDIÇÕES DE ARMAZENAMENTO */}

            <section className="iron-planos">
                <div className="iron-planos-cabecalho">
                    <span className="iron-secao-label">
                        CRESÇA NO SEU RITMO
                    </span>

                    <h2>
                        Seu espaço começa gratuito.
                        <span> Você escolhe quando ampliar.</span>
                    </h2>

                    <p>
                        Não é necessário contratar armazenamento adicional
                        para começar. Utilize o espaço gratuito e escolha
                        uma expansão quando sua empresa precisar.
                    </p>
                </div>

                <div className="iron-planos-grade">

                    <article className="iron-plano iron-plano-gratuito">
                        <div className="iron-plano-topo">
                            <span className="iron-plano-categoria">
                                ACESSO INICIAL
                            </span>
                            <span className="iron-plano-status">
                                GRATUITO
                            </span>
                        </div>

                        <h3>Comece grátis</h3>

                        <div className="iron-plano-preco">
                            <strong>R$ 0</strong>
                            <span>sem mensalidade pelo espaço inicial</span>
                        </div>

                        <div className="iron-plano-capacidade">
                            <strong>1 GB</strong>
                            <span>de armazenamento gratuito</span>
                        </div>

                        <p>
                            Entre na plataforma e comece a utilizar os
                            recursos disponíveis para sua empresa.
                        </p>

                        <ul>
                            <li>1 GB incluído gratuitamente</li>
                            <li>Sem mensalidade pelo espaço inicial</li>
                            <li>Possibilidade de ampliar posteriormente</li>
                        </ul>

                        <div className="iron-plano-rodape">
                            <strong>Seu primeiro passo não custa nada.</strong>
                        </div>
                    </article>

                    <article className="iron-plano">
                        <div className="iron-plano-topo">
                            <span className="iron-plano-categoria">
                                EXPANSÃO DE ESPAÇO
                            </span>
                        </div>

                        <h3>Mais 5 GB</h3>

                        <div className="iron-plano-preco">
                            <strong>R$ 62,90</strong>
                            <span>Avulso</span>
                        </div>

                        <div className="iron-plano-capacidade iron-plano-capacidade-azul">
                            <strong>+5 GB</strong>
                            <span>por contratação</span>
                        </div>

                        <p>
                            Amplie o espaço disponível quando os dados
                            e arquivos da sua empresa crescerem.
                        </p>

                        <ul>
                            <li>Pagamento avulso</li>

                            <li>Pacote adicional de 5 GB</li>
                            <li>Ampliação do espaço disponível</li>
                            <li>Contrate conforme sua necessidade</li>
                        </ul>

                        <div className="iron-plano-rodape">
                            <strong>Mais capacidade para sua operação.</strong>
                        </div>
                    </article>

                    <article className="iron-plano iron-plano-ilimitado">
                        <div className="iron-plano-topo">
                            <span className="iron-plano-categoria">
                                MÁXIMA CAPACIDADE
                            </span>
                            <span className="iron-plano-status">
                                ILIMITADO
                            </span>
                        </div>

                        <h3>Espaço ilimitado</h3>

                        <div className="iron-plano-preco">
                            <strong>R$ 97,90</strong>
                            <span>por mês</span>
                        </div>

                        <div className="iron-plano-capacidade iron-plano-capacidade-escura">
                            <strong>∞</strong>
                            <span>armazenamento ilimitado</span>
                        </div>

                        <p>
                            Para empresas que preferem não se preocupar
                            com a contratação de pacotes adicionais
                            de armazenamento.
                        </p>

                        <ul>
                            <li>Armazenamento ilimitado</li>
                            <li>Mensalidade de R$ 97,90</li>
                            <li>Sem contratação de pacotes de 5 GB</li>
                        </ul>

                        <div className="iron-plano-rodape">
                            <strong>Mais liberdade para armazenar.</strong>
                        </div>
                    </article>
                </div>

                <div className="iron-planos-aviso">
                    <strong>Importante sobre a mudança para o ilimitado</strong>
                    <p>
                        Se sua empresa contratar pacotes adicionais de 5 GB
                        e posteriormente optar pelo espaço ilimitado,
                        os valores pagos anteriormente pelos pacotes
                        adicionais não serão devolvidos, reembolsados
                        ou convertidos em créditos.
                    </p>
                </div>
            </section>

            {/* TAXA DE VENDAS ONLINE */}

            <section className="iron-taxa-online">
                <div className="iron-taxa-conteudo">
                    <span className="iron-secao-label">
                        VENDA PELA INTERNET
                    </span>

                    <h2>
                        Sua empresa vende online.
                        <span> A taxa é de 10% sobre essas vendas.</span>
                    </h2>

                    <p>
                        Nas vendas realizadas por meio da operação online
                        da Iron Executions, é aplicada uma taxa de 10%
                        sobre o valor dessas vendas.
                    </p>

                    <p className="iron-taxa-observacao">
                        Essa taxa se refere às vendas online realizadas
                        pela plataforma, não ao faturamento total da empresa
                        nem às vendas feitas fora dela.
                    </p>
                </div>

                <div className="iron-taxa-numero">
                    <strong>10<span>%</span></strong>
                    <small>Sobre vendas online</small>
                </div>
            </section>

            {/* RESUMO COMERCIAL */}

            <section className="iron-resumo">
                <span className="iron-secao-label">
                    CLAREZA EM CADA CONDIÇÃO
                </span>

                <h2>O que você precisa saber</h2>

                <div className="iron-resumo-linha">
                    <span>01</span>
                    <div>
                        <strong>Entrada gratuita</strong>
                        <p>
                            Sua empresa recebe 1 GB de armazenamento
                            gratuito para começar.
                        </p>
                    </div>
                </div>

                <div className="iron-resumo-linha">
                    <span>02</span>
                    <div>
                        <strong>Contabilização do espaço</strong>
                        <p>
                            Todos os dados e arquivos armazenados pela
                            empresa na plataforma entram no cálculo
                            do espaço utilizado.
                        </p>
                    </div>
                </div>

                <div className="iron-resumo-linha">
                    <span>03</span>
                    <div>
                        <strong>Expansão opcional</strong>
                        <p>
                            Cada pacote adicional de 5 GB custa R$ 62,90.
                            O espaço ilimitado custa R$ 97,90 por mês.
                        </p>
                    </div>
                </div>

                <div className="iron-resumo-linha iron-resumo-alerta">
                    <span>04</span>
                    <div>
                        <strong>Sem devolução de pacotes anteriores</strong>
                        <p>
                            A contratação posterior do espaço ilimitado
                            não gera reembolso ou crédito pelos pacotes
                            de armazenamento adquiridos anteriormente.
                        </p>
                    </div>
                </div>

                <div className="iron-resumo-linha">
                    <span>05</span>
                    <div>
                        <strong>Vendas online</strong>
                        <p>
                            As vendas realizadas online pela plataforma
                            possuem taxa de 10%.
                        </p>
                    </div>
                </div>
            </section>

            {/* ENCERRAMENTO */}

            <section className="iron-encerramento">
                <span>IRON EXECUTIONS</span>

                <h2>
                    Sua empresa pode começar hoje.
                    <strong> E o primeiro 1 GB é por nossa conta.</strong>
                </h2>

                <p>
                    Conheça a plataforma, encontre os recursos do seu
                    segmento e comece gratuitamente.
                </p>

                <div className="iron-encerramento-destaque">
                    <strong>1 GB GRATUITO</strong>
                    <span>R$ 0 para começar</span>
                </div>
            </section>

        </main>
    );
}
