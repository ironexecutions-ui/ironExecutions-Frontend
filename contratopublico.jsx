import React, { useEffect, useState } from "react";
import "./contratopublico.css";
import { API_URL } from "./config";
import { useParams } from "react-router-dom";
import AssinaturaCanvas from "./src/painel/components/info/rotas/assinaturacanvas";
import GravataLogo from "./src/components/gravatalogo";
export default function ContratoPublico() {

    const { codigo } = useParams();
    const [codigoInput, setCodigoInput] = useState(codigo || "");
    const [contrato, setContrato] = useState(null);
    const [erro, setErro] = useState("");
    const [abrirAssinaturaPublica, setAbrirAssinaturaPublica] = useState(false);
    const [permitirEscolherData, setPermitirEscolherData] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState("");

    async function buscar() {
        setErro("");
        setContrato(null);

        if (!codigoInput || codigoInput.trim() === "") {
            setErro("Digite um código válido.");
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/contratos/codigo/${encodeURIComponent(codigoInput)}`);
            if (!resp.ok) {
                setErro("Contrato não encontrado.");
                return;
            }
            const dados = await resp.json();
            setContrato(dados);

        } catch (e) {
            setErro("Erro ao carregar contrato.");
        }
    }

    function capitalizeWords(text) {
        if (!text) return "";
        return text
            .toLowerCase()
            .split(" ")
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" ");
    }

    useEffect(() => {
        if (codigo) {
            buscar();
        }
    }, []);

    return (
        <div className="cp-container">
            {abrirAssinaturaPublica && (
                <div className="modal-assinatura-fundo">
                    <div className="modal-assinatura-box">

                        <button
                            className="modal-assinatura-fechar"
                            onClick={() => setAbrirAssinaturaPublica(false)}
                        >
                            Fechar
                        </button>

                        <AssinaturaCanvas
                            idContrato={contrato.id}
                            tipo="cliente"
                            onFinalizado={(url) => {
                                setContrato({
                                    ...contrato,
                                    LOGO_ASSINATURA_CLIENTE: url
                                });
                                setAbrirAssinaturaPublica(false);
                            }}
                        />
                    </div>
                </div>
            )}

            <h1 className="cp-titulo" style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                justifyContent: "center"
            }}>
                <GravataLogo />
                Iron Executions
            </h1>

            <div style={{ display: "none" }} className="cp-input-box">
                <input
                    type="text"
                    placeholder="Digite o código do contrato"
                    value={codigoInput}
                    onChange={e => setCodigoInput(e.target.value)}
                />
                <button onClick={buscar}>Buscar</button>
            </div>

            {erro && <p className="cp-erro">{erro}</p>}

            {contrato && (
                <div className="cp-doc" id="contratoHTML">

                    <button
                        className="btn-imprimir-contrato"
                        onClick={() => window.print()}
                    >
                        Imprimir contrato
                    </button>


                    <h2 className="cp-doc-titulo">
                        Contrato de Prestação de Serviços de Desenvolvimento de Site
                    </h2>

                    <p className="cp-linha cp-intro">
                        Pelo presente instrumento particular, as partes abaixo identificadas
                        resolvem firmar o presente Contrato de Prestação de Serviços de
                        Desenvolvimento de Site, que será regido pelas cláusulas e condições a seguir.
                    </p>

                    {/* ============================== */}
                    {/* CLÁUSULA 1 */}
                    {/* ============================== */}
                    <div className="cp-clausula">

                        <h3 className="cp-subtitulo">CLÁUSULA 1 — IDENTIFICAÇÃO DAS PARTES</h3>

                        <p className="cp-bloco-titulo">Contratada</p>
                        <p className="cp-linha"><strong>Iron Executions</strong></p>
                        <p className="cp-linha">
                            Responsável: <strong>{contrato.representante_nome}</strong>
                        </p>
                        <p className="cp-linha">
                            Link institucional: <strong>{contrato.endereco_empresa}</strong>
                        </p>
                        <p className="cp-linha">
                            Contato:{" "}
                            <a
                                href={`https://wa.me/${contrato.telefone_empresa.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#25D366", fontWeight: "bold", textDecoration: "none" }}
                            >
                                {contrato.telefone_empresa}
                            </a>
                        </p>

                        <p className="cp-linha">
                            E-mail: <strong>{contrato.email_empresa}</strong>
                        </p>

                        <p className="cp-bloco-titulo">Contratante</p>
                        <p className="cp-linha">
                            Negócio: <strong>{contrato.negocio_cliente}</strong>
                        </p>
                        <p className="cp-linha">
                            Representante: <strong>{capitalizeWords(contrato.nome_cliente)}</strong>
                        </p>
                        <p className="cp-linha">
                            Documento: <strong>{contrato.documento_cliente}</strong>
                        </p>
                        <p className="cp-linha">
                            Endereço: <strong>{contrato.endereco_cliente}</strong>
                        </p>
                        <p className="cp-linha">
                            Contato:{" "}
                            <a
                                href={`https://wa.me/${contrato.telefone_cliente.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#25D366", fontWeight: "bold", textDecoration: "none" }}
                            >
                                {contrato.telefone_cliente}
                            </a>
                        </p>

                        <p className="cp-linha">
                            E-mail: <strong>{contrato.email_cliente}</strong>
                        </p>
                    </div>
                    <br />
                    {/* ============================== */}
                    {/* CLÁUSULA 2 */}
                    {/* ============================== */}
                    <div className="cp-clausula">

                        <h3 className="cp-subtitulo">CLÁUSULA 2 — OBJETO DO CONTRATO</h3>

                        <p className="cp-linha">
                            O presente contrato tem por objeto a criação e o desenvolvimento de um site
                            conforme solicitado pelo contratante, atendendo às especificações abaixo.
                        </p>

                        <p className="cp-linha">
                            Tipo de site: <strong>{contrato.tipo_site}</strong>
                        </p>

                        <p className="cp-linha">
                            Tecnologias utilizadas: <strong>{contrato.tecnologias}</strong>
                        </p>

                        <p className="cp-linha">
                            Quantidade de páginas: <strong>{contrato.quantidade_paginas}</strong>
                        </p>
                    </div>
                    {/* ============================== */}
                    {/* CLÁUSULA 3 */}
                    {/* ============================== */}
                    <div className="cp-clausula">
                        <br />
                        <h3 className="cp-subtitulo">CLÁUSULA 3 — ESCOPO E LIMITAÇÕES</h3>

                        <p className="cp-linha">
                            O desenvolvimento inclui apenas os elementos e funcionalidades descritos abaixo.
                            Qualquer recurso não listado será considerado serviço adicional e poderá gerar novo orçamento.
                        </p>

                        <p className="cp-linha">
                            Integrações previstas: <strong>{contrato.integracoes}</strong>
                        </p>

                        <p className="cp-linha">
                            Revisões inclusas: <strong>{contrato.numero_revisoes}</strong>
                        </p>

                        <p className="cp-linha">
                            Atualizações inclusas: <strong>{contrato.atualizacoes_inclusas}</strong>
                        </p>

                        <p className="cp-linha cp-obs">
                            * As revisões correspondem às alterações solicitadas pelo contratante durante o
                            desenvolvimento do site. O número de revisões define quantas modificações podem ser feitas
                            sem custo adicional. Revisões extras terão custo adicional conforme tabela vigente. <br />
                            * As atualizações referem-se a ajustes após a entrega final do site. Incluem apenas mudanças
                            visuais no layout, sem criação de novas páginas, funcionalidades ou alteração estrutural.
                        </p>
                    </div>
                    {/* ============================== */}
                    {/* CLÁUSULA 4 */}
                    {/* ============================== */}
                    <div className="cp-clausula">

                        <h3 className="cp-subtitulo">CLÁUSULA 4 — PRAZO DE ENTREGA</h3>

                        <p className="cp-linha">
                            O prazo estimado para entrega do projeto é de
                            <strong> {contrato.prazo_entrega} dias úteis</strong>, considerando que os sábados contam
                            normalmente. Apenas os domingos não entram na contagem. O prazo começa após o envio de
                            todos os materiais necessários pelo contratante.
                        </p>
                    </div>
                    {/* ============================== */}
                    {/* CLÁUSULA 5 */}
                    {/* ============================== */}
                    <div className="cp-clausula">

                        <h3 className="cp-subtitulo">CLÁUSULA 5 — VALORES E FORMAS DE PAGAMENTO</h3>

                        <p className="cp-linha">
                            Valor total do projeto: R$ <strong>{contrato.valor_total}</strong>
                        </p>

                        <p className="cp-linha">
                            Forma de pagamento: <strong>{contrato.forma_pagamento}</strong>
                        </p>

                        <p className="cp-linha">
                            Entrada: R$ <strong>{contrato.valor_entrada}</strong>
                        </p>

                        <p className="cp-linha">
                            Valor final na entrega: R$ <strong>{contrato.valor_final_entrega}</strong>
                        </p>
                        {/* Botão para ver comprovante */}
                        {contrato.comprovante && (
                            <button
                                className="btn-ver-comprovante"
                                onClick={() => window.open(contrato.comprovante, "_blank")}
                                style={{
                                    marginTop: "10px",
                                    padding: "10px 16px",
                                    background: "#4CAF50",
                                    color: "white",
                                    fontWeight: "bold",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    width: "fit-content"
                                }}
                            >
                                Ver comprovante de pagamento inicial
                            </button>
                        )}

                        <p className="cp-linha cp-obs">
                            A liberação final do projeto acontece somente após o pagamento total acordado, incluindo
                            a entrega dos arquivos, a ativação no domínio e o acesso administrativo do site. O suporte
                            não cobre erros causados pelo contratante ou terceiros, e não cobre mudanças em plataformas
                            externas como PayPal, Google ou Instagram.
                        </p>
                    </div>
                    {/* ============================== */}
                    {/* CLÁUSULA 6 */}
                    {/* ============================== */}
                    <div className="cp-clausula">
                        <br />
                        <h3 className="cp-subtitulo">CLÁUSULA 6 — HOSPEDAGEM/BANCO DE DADOS/SERVIDOR & SUPORTE</h3>

                        <p className="cp-linha">
                            Hospedagem/Banco de dados/servidor inclusa: <strong>{contrato.hospedagem_inclusa}</strong>
                        </p>

                        <p className="cp-linha">
                            Valor:{" "}
                            {contrato.hospedagem_inclusa === "Não"
                                ? <strong>Não possui hospedagem</strong>
                                : <>R$ <strong>{contrato.valor_hospedagem}</strong></>
                            }
                        </p>

                        <p className="cp-linha">
                            O contratante terá <strong>{contrato.dias_suporte} dias</strong> de suporte gratuito para
                            erros simples, ajustes ou dúvidas.
                        </p>

                        <p className="cp-linha cp-obs">
                            Modificações estruturais, redesign completo, novas seções ou automações avançadas não são
                            consideradas suporte. Esses itens exigem orçamento adicional.
                        </p>
                    </div>
                    {/* ============================== */}
                    {/* CLÁUSULA 7 */}
                    {/* ============================== */}
                    <div className="cp-clausula">

                        <h3 className="cp-subtitulo">CLÁUSULA 7 — FORO</h3>

                        <p className="cp-linha">
                            Ambas as partes elegem o foro da cidade de
                            <strong> {contrato.cidade_foro}</strong> para resolver eventuais questões judiciais.
                        </p>
                    </div>
                    <div className="cp-clausula">

                        <h3 className="cp-subtitulo">CLÁUSULA 8 — OBRIGAÇÕES DO CONTRATANTE</h3>

                        <p className="cp-linha">
                            O contratante se compromete a fornecer todos os materiais necessários para o desenvolvimento
                            do site, incluindo textos, fotos, logotipo, vídeos, cores e qualquer conteúdo adicional.
                            O prazo de entrega só começa a ser contado após o envio completo desse material.
                        </p>

                        <p className="cp-linha">
                            O contratante declara possuir todos os direitos sobre as imagens, marcas e conteúdos enviados,
                            isentando a contratada de qualquer responsabilidade relacionada a direitos autorais.
                        </p>

                        <p className="cp-linha">
                            O contratante deve responder e aprovar etapas dentro do prazo de até 5 dias úteis. A ausência
                            de resposta poderá gerar atrasos no cronograma sem que isso seja considerado responsabilidade
                            da contratada.
                        </p>

                        <p className="cp-linha">
                            O contratante deve fornecer acessos necessários para integrações, quando solicitado, incluindo
                            contas de redes sociais, Google, emails, hospedagem ou outras plataformas externas.
                        </p>
                    </div>
                    <div className="cp-clausula">
                        <br />


                        <h3 className="cp-subtitulo">CLÁUSULA 9 — PROPRIEDADE INTELECTUAL</h3>
                        <p className="cp-linha">
                            Todo o código, estrutura, componentes, automações internas, design e elementos técnicos
                            produzidos pela contratada permanecem como propriedade intelectual da Iron Executions
                            enquanto o pagamento integral do projeto não for concluído.
                        </p>

                        <p className="cp-linha">
                            Após o pagamento total, o contratante obtém o direito de uso do site, incluindo layout,
                            design visual e textos estruturados. É proibida a revenda, redistribuição, clonagem ou
                            comercialização do projeto sem autorização da contratada.
                        </p>

                        <p className="cp-linha">
                            Códigos internos, bibliotecas próprias, sistemas de automação e estruturas desenvolvidas
                            pela contratada permanecem de propriedade exclusiva da Iron Executions, mesmo após a
                            entrega final do projeto.
                        </p>
                    </div>
                    <div className="cp-clausula">

                        <h3 className="cp-subtitulo">CLÁUSULA 10 — RESCISÃO E CANCELAMENTO</h3>

                        <p className="cp-linha">
                            A entrada paga pelo contratante não é reembolsável, pois cobre custos de design inicial,
                            organização do projeto e reserva da agenda da equipe.
                        </p>

                        <p className="cp-linha">
                            Se o contratante solicitar cancelamento após o início do desenvolvimento, será cobrada multa
                            de 30% do valor restante ou o valor proporcional às horas trabalhadas, prevalecendo o maior.
                        </p>

                        <p className="cp-linha">
                            Se o cancelamento ocorrer depois da entrega completa do site, o valor total do projeto continuará sendo devido, mesmo que o contratante decida não utilizar o site.
                        </p>

                        <p className="cp-linha">
                            O projeto poderá ser pausado se o contratante deixar de enviar materiais ou não responder por
                            mais de 30 dias. A retomada estará sujeita à disponibilidade da equipe e possível reajuste de valores.
                        </p>
                        <p className="cp-linha">
                            Caso o contratante demore para enviar aprovações, informações ou materiais essenciais para a continuidade do desenvolvimento, o cronograma será automaticamente ajustado. Atrasos causados pela falta desses elementos não serão considerados responsabilidade da contratada e poderão estender o prazo de entrega conforme o tempo de espera.
                        </p>
                    </div>
                    <div className="cp-clausula">
                        <br />
                        <h3 className="cp-subtitulo">CLÁUSULA 11 — LIMITAÇÃO DE RESPONSABILIDADE</h3>

                        <p className="cp-linha">
                            A contratada não se responsabiliza por quedas, mudanças de políticas, falhas técnicas ou
                            instabilidades em plataformas externas como Instagram, Google, WhatsApp, PayPal ou serviços
                            de hospedagem que não estejam sob controle direto da Iron Executions. Caso ocorram situações
                            desse tipo, contratada e contratante poderão, de comum acordo, estabelecer soluções ou ajustes
                            que beneficiem ambas as partes, desde que tais ações não representem obrigação técnica fora do
                            escopo contratado ou ajustem o contrado.
                        </p>


                        <p className="cp-linha">
                            A contratada não é responsável por erros causados por terceiros, alterações realizadas pelo
                            contratante após a entrega, uso inadequado da plataforma ou problemas decorrentes de falta de
                            manutenção contratada.
                        </p>

                        <p className="cp-linha">
                            A contratada não garante resultados financeiros, aumento de vendas ou desempenho comercial do site,
                            pois esses fatores dependem de estratégias externas e variáveis fora de seu controle.
                        </p>

                        <p className="cp-linha">
                            A validade jurídica da assinatura digital utilizada neste contrato é garantida pela Lei nº 14.063/2020,
                            que reconhece assinaturas eletrônicas como instrumento legalmente válido.
                        </p>
                    </div>

                    {/* ============================== */}
                    {/* CLÁUSULA 12 */}
                    {/* ============================== */}
                    <div className="cp-clausula-12-wrapper">
                        <br />
                        <h3 className="cp-subtitulo">CLÁUSULA 12 — ASSINATURAS</h3>

                        <p className="cp-linha">
                            As partes declaram estar de acordo com todas as cláusulas acima.
                        </p>

                        <div className="cp-assinaturas">

                            {/* Assinatura contratada */}
                            <div className="cp-assinatura">
                                <p>
                                    Contratada: <strong>{contrato.representante_nome}</strong><br />
                                    Representante de: <strong>Iron Executions</strong>
                                </p>

                                <p>Data: <strong>{contrato.data_assinatura_contratada}</strong></p>

                                {(contrato.LOGO_ASSINATURA_CONTRATADA || contrato.logo_assinatura_contratada) && (
                                    <div> <p style={{ fontSize: "0.6rem" }} >assinatura:</p>
                                        <img
                                            style={{
                                                border: "2px solid rgba(0,0,0,0.15)",
                                                borderRadius: "10px",
                                                padding: "8px",
                                                background: "linear-gradient(to bottom right, #ffffff, #f1f1f1)",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                                            }}
                                            src={contrato.LOGO_ASSINATURA_CONTRATADA || contrato.logo_assinatura_contratada}
                                            className="cp-img-assinatura"
                                            alt="Assinatura contratada"
                                        />

                                    </div>
                                )}
                            </div>

                            {/* Assinatura cliente */}
                            <div className="cp-assinatura">
                                <p>
                                    Contratante: <strong>{capitalizeWords(contrato.nome_cliente)}</strong><br />
                                    Representante de: <strong>{contrato.negocio_cliente}</strong>
                                </p>

                                {/* DATA DO CLIENTE — só pode escolher uma vez */}

                                <div style={{ marginTop: "10px" }}>
                                    <p style={{ marginBottom: "6px" }}>
                                        Data: <strong>{contrato.data_assinatura_cliente || dataSelecionada || "—"}</strong>
                                    </p>

                                    {/* Se já tem data salva no banco, não pode mudar */}
                                    {contrato.data_assinatura_cliente ? null : (
                                        <>
                                            {/* Primeiro clique ativa a confirmação */}
                                            {!permitirEscolherData && (
                                                <button
                                                    className="btn-assinar-publico"
                                                    onClick={() => setPermitirEscolherData(true)}
                                                >
                                                    Selecionar data
                                                </button>
                                            )}

                                            {/* Após o segundo clique, mostra o input */}
                                            {permitirEscolherData && !dataSelecionada && (
                                                <input
                                                    type="date"
                                                    style={{
                                                        padding: "6px",
                                                        borderRadius: "6px",
                                                        border: "1px solid #ccc",
                                                        marginTop: "6px"
                                                    }}
                                                    onChange={async (e) => {
                                                        const valor = e.target.value;
                                                        setDataSelecionada(valor);

                                                        // Salva imediatamente no backend
                                                        await fetch(`${API_URL}/contratos/${contrato.id}/data`, {
                                                            method: "PUT",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                campo: "data_assinatura_cliente",
                                                                valor
                                                            })
                                                        });

                                                        // Atualiza visualmente
                                                        setContrato({
                                                            ...contrato,
                                                            data_assinatura_cliente: valor
                                                        });
                                                    }}
                                                />
                                            )}
                                        </>
                                    )}

                                </div>
                            </div>

                            {/* Assinatura cliente */}
                            <div className="cp-assinatura">



                                {contrato.LOGO_ASSINATURA_CLIENTE || contrato.logo_assinatura_cliente ? (
                                    <>
                                        <p style={{ fontSize: "0.6rem" }}>assinatura:</p>
                                        <img
                                            style={{
                                                border: "2px solid rgba(0,0,0,0.15)",
                                                borderRadius: "10px",
                                                padding: "8px",
                                                background: "linear-gradient(to bottom right, #ffffff, #f1f1f1)",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                                            }}
                                            src={contrato.LOGO_ASSINATURA_CLIENTE || contrato.logo_assinatura_cliente}
                                            className="cp-img-assinatura"
                                            alt="Assinatura cliente"
                                        />
                                    </>
                                ) : (
                                    <button
                                        className="btn-assinar-publico"
                                        onClick={() => setAbrirAssinaturaPublica(true)}
                                    >
                                        Assinar contrato
                                    </button>
                                )}
                            </div>

                        </div>

                    </div>



                </div>
            )}
        </div>
    );
}
