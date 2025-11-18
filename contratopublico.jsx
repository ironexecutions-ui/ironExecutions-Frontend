import React, { useEffect, useState } from "react";
import "./contratopublico.css";
import { API_URL } from "./config";
import { useParams } from "react-router-dom";
import AssinaturaCanvas from "./src/painel/components/info/rotas/assinaturacanvas";

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

            <h1 className="cp-titulo">Consulta de Contrato</h1>

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
                        Representante: <strong>{contrato.nome_cliente}</strong>
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

                    {/* ============================== */}
                    {/* CLÁUSULA 2 */}
                    {/* ============================== */}
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

                    {/* ============================== */}
                    {/* CLÁUSULA 3 */}
                    {/* ============================== */}
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

                    {/* ============================== */}
                    {/* CLÁUSULA 4 */}
                    {/* ============================== */}
                    <h3 className="cp-subtitulo">CLÁUSULA 4 — PRAZO DE ENTREGA</h3>

                    <p className="cp-linha">
                        O prazo estimado para entrega do projeto é de
                        <strong> {contrato.prazo_entrega} dias úteis</strong>, considerando que os sábados contam
                        normalmente. Apenas os domingos não entram na contagem. O prazo começa após o envio de
                        todos os materiais necessários pelo contratante.
                    </p>

                    {/* ============================== */}
                    {/* CLÁUSULA 5 */}
                    {/* ============================== */}
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

                    <p className="cp-linha cp-obs">
                        A liberação final do projeto acontece somente após o pagamento total acordado, incluindo
                        a entrega dos arquivos, a ativação no domínio e o acesso administrativo do site. O suporte
                        não cobre erros causados pelo contratante ou terceiros, e não cobre mudanças em plataformas
                        externas como PayPal, Google ou Instagram.
                    </p>

                    {/* ============================== */}
                    {/* CLÁUSULA 6 */}
                    {/* ============================== */}
                    <h3 className="cp-subtitulo">CLÁUSULA 6 — HOSPEDAGEM E SUPORTE</h3>

                    <p className="cp-linha">
                        Hospedagem inclusa: <strong>{contrato.hospedagem_inclusa}</strong>
                    </p>

                    <p className="cp-linha">
                        Valor da hospedagem:{" "}
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

                    {/* ============================== */}
                    {/* CLÁUSULA 7 */}
                    {/* ============================== */}
                    <h3 className="cp-subtitulo">CLÁUSULA 7 — FORO</h3>

                    <p className="cp-linha">
                        Ambas as partes elegem o foro da cidade de
                        <strong> {contrato.cidade_foro}</strong> para resolver eventuais questões judiciais.
                    </p>

                    {/* ============================== */}
                    {/* CLÁUSULA 8 */}
                    {/* ============================== */}
                    <h3 className="cp-subtitulo">CLÁUSULA 8 — ASSINATURAS</h3>

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
                                Contratante: <strong>{contrato.nome_cliente}</strong><br />
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
