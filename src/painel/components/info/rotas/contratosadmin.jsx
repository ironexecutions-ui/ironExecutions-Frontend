import React, { useEffect, useState } from "react";
import "./contratosadmin.css";
import { API_URL } from "../../../../../config";
import NovoContrato from "./novocontrato";
import AssinaturaCanvas from "./assinaturacanvas";
export default function ContratosAdmin({ onModoChange }) {

    const [modo, setModo] = useState("menu");
    const [lista, setLista] = useState([]);
    const [contratoSelecionado, setContratoSelecionado] = useState(null);
    const [abrirModalAssinatura, setAbrirModalAssinatura] = useState(false);
    const [tipoAssinaturaAtual, setTipoAssinaturaAtual] = useState(null);
    const [editandoId, setEditandoId] = useState(null);
    useEffect(() => {
        if (onModoChange) {
            onModoChange(modo);
        }
    }, [modo]);
    function abrirAssinatura(tipo) {
        setTipoAssinaturaAtual(tipo);
        setAbrirModalAssinatura(true);
    }

    function fecharAssinatura() {
        setAbrirModalAssinatura(false);
        setTipoAssinaturaAtual(null);
    }

    async function carregarContratos() {
        try {
            const resp = await fetch(`${API_URL}/contratos`);
            const dados = await resp.json();
            setLista(dados);
        } catch (err) {
            console.log("Erro ao carregar contratos", err);
        }
    }

    function abrirLista() {
        carregarContratos();
        setModo("lista");
    }

    async function abrirContrato(item) {
        try {
            const resp = await fetch(`${API_URL}/contratos/${item.id}`);
            const dados = await resp.json();
            setContratoSelecionado(dados);
            setModo("ver");
        } catch (err) {
            console.log("Erro ao carregar contrato completo", err);
        }
    }

    async function apagarContrato(id) {
        const c1 = window.confirm("Deseja mesmo apagar este contrato?");
        if (!c1) return;

        const c2 = window.confirm("Tem certeza absoluta disso?");
        if (!c2) return;

        try {
            const resp = await fetch(`${API_URL}/contratos/${id}`, {
                method: "DELETE"
            });

            if (resp.ok) {
                alert("Contrato apagado.");
                carregarContratos();
            } else {
                alert("Erro ao apagar o contrato.");
            }

        } catch (e) {
            alert("Erro ao conectar ao servidor.");
        }
    }
    async function salvarData(id, campo, valor) {
        try {
            await fetch(`${API_URL}/contratos/${id}/data`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campo,
                    valor
                })
            });
        } catch (err) {
            console.log("Erro ao salvar data", err);
        }
    }


    return (
        <div className="da-box">

            {abrirModalAssinatura && (
                <div className="modal-assinatura-fundo">
                    <div className="modal-assinatura-box">

                        <button className="modal-assinatura-fechar" onClick={fecharAssinatura}>
                            Fechar
                        </button>

                        <AssinaturaCanvas
                            idContrato={contratoSelecionado.id}
                            tipo={tipoAssinaturaAtual}
                            onFinalizado={(url) => {
                                if (tipoAssinaturaAtual === "contratada") {
                                    setContratoSelecionado({
                                        ...contratoSelecionado,
                                        LOGO_ASSINATURA_CONTRATADA: url
                                    });
                                } else {
                                    setContratoSelecionado({
                                        ...contratoSelecionado,
                                        LOGO_ASSINATURA_CLIENTE: url
                                    });
                                }

                                fecharAssinatura();
                            }}
                        />
                    </div>
                </div>
            )}

            <h2 className="da-titulo">Contratos</h2>

            {modo === "menu" && (
                <div className="da-botoes-contratos">
                    <button onClick={() => setModo("novo")}>
                        Novo contrato
                    </button>

                    <button onClick={abrirLista}>
                        Contratos
                    </button>
                </div>
            )}

            {modo === "lista" && (
                <>
                    <button className="btn-voltar" onClick={() => setModo("menu")}>
                        Voltar
                    </button>

                    <div className="lista-simples">
                        {lista.map(item => (
                            <div key={item.id} className="linha-cliente">

                                <div className="linha-click" onClick={() => abrirContrato(item)}>
                                    <p>{item.nome_cliente}</p>
                                    <span>{item.telefone_cliente}</span>
                                </div>

                                <div className="acoes-lista">

                                    <button
                                        className="btn-abrir"
                                        onClick={() => abrirContrato(item)}
                                    >
                                        Abrir
                                    </button>

                                    <button
                                        className="btn-editar"
                                        onClick={() => {
                                            setEditandoId(item.id);
                                            setModo("novo");
                                        }}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="btn-apagar"
                                        onClick={() => apagarContrato(item.id)}
                                    >
                                        Apagar
                                    </button>

                                </div>


                            </div>
                        ))}
                    </div>
                </>
            )}


            {modo === "ver" && contratoSelecionado && (

                <div className="contrato-documento">

                    <button
                        className="btn-voltar"
                        onClick={() => {
                            setContratoSelecionado(null);
                            setModo("lista");
                        }}
                        style={{ marginBottom: "20px" }}
                    >
                        Voltar
                    </button>


                    <h2 className="titulo-documento">
                        Contrato de Prestação de Serviços de Desenvolvimento de Site
                    </h2>

                    <p className="linha intro">
                        Pelo presente instrumento particular, as partes abaixo identificadas
                        resolvem firmar o presente Contrato de Prestação de Serviços de
                        Desenvolvimento de Site, que será regido pelas cláusulas e condições a seguir.
                    </p>

                    {/* CONTRATADA */}
                    <h3 className="subtitulo">CLÁUSULA 1 — IDENTIFICAÇÃO DAS PARTES</h3>

                    <p className="linha bloco-titulo">Contratada</p>
                    <p className="linha">Nome empresarial: <strong>  Iron Executions </strong></p>
                    <p className="linha">
                        Responsável: <strong>{contratoSelecionado.representante_nome}</strong>
                    </p>

                    <p className="linha" style={{ display: "none" }}>
                        Documento: <strong>{contratoSelecionado.documento_empresa}</strong>
                    </p>

                    <p className="linha">
                        Link institucional: <strong>{contratoSelecionado.endereco_empresa}</strong>
                    </p>

                    <p className="linha">
                        Contato: <strong>{contratoSelecionado.telefone_empresa}</strong>
                    </p>

                    <p className="linha">
                        E-mail: <strong>{contratoSelecionado.email_empresa}</strong>
                    </p>

                    <p className="linha bloco-titulo">Contratante</p>

                    <p className="linha">
                        Negócio: <strong>{contratoSelecionado.negocio_cliente}</strong>
                    </p>

                    <p className="linha">
                        Representante: <strong>{contratoSelecionado.nome_cliente}</strong>
                    </p>

                    <p className="linha">
                        Documento: <strong>{contratoSelecionado.documento_cliente}</strong>
                    </p>

                    <p className="linha">
                        Endereço: <strong>{contratoSelecionado.endereco_cliente}</strong>
                    </p>

                    <p className="linha">
                        Contato: <strong>{contratoSelecionado.telefone_cliente}</strong>
                    </p>

                    <p className="linha">
                        E-mail: <strong>{contratoSelecionado.email_cliente}</strong>
                    </p>

                    {/* OBJETO */}
                    <h3 className="subtitulo">CLÁUSULA 2 — OBJETO DO CONTRATO</h3>

                    <p className="linha">
                        O presente contrato tem por objeto a criação e o desenvolvimento de um site
                        conforme solicitado pelo contratante, atendendo às especificações abaixo.
                    </p>

                    <p className="linha">
                        Tipo de site: <strong>{contratoSelecionado.tipo_site}</strong>
                    </p>

                    <p className="linha">
                        Tecnologias utilizadas: <strong>{contratoSelecionado.tecnologias}</strong>
                    </p>

                    <p className="linha">
                        Quantidade de páginas: <strong>{contratoSelecionado.quantidade_paginas}</strong>
                    </p>

                    {/* ESCOPO */}
                    <h3 className="subtitulo">CLÁUSULA 3 — ESCOPO E LIMITAÇÕES</h3>

                    <p className="linha">
                        O desenvolvimento inclui apenas os elementos e funcionalidades descritos abaixo. Qualquer recurso não listado será considerado serviço adicional e poderá gerar novo orçamento.                    </p>

                    <p className="linha">
                        Integrações previstas: <strong>{contratoSelecionado.integracoes}</strong>
                    </p>

                    <p className="linha">
                        Revisões inclusas: <strong>{contratoSelecionado.numero_revisoes}</strong>
                    </p>

                    <p className="linha">
                        Atualizações inclusas: <strong>{contratoSelecionado.atualizacoes_inclusas}</strong>
                    </p>



                    <p className="linha obs">
                        * As <strong>revisões </strong>  correspondem às alterações solicitadas pelo contratante durante o
                        desenvolvimento do site. O número de revisões informado neste contrato define
                        quantas modificações podem ser realizadas dentro do acordo sem custos
                        adicionais. Revisões extras, solicitadas após o limite contratado, terão custo
                        adicional conforme tabela vigente. <br />
                        * As <strong> atualizações </strong>  referem-se a ajustes
                        realizados depois da entrega final do site. Essas atualizações incluem apenas
                        alterações visuais no layout, sem mudanças de estrutura, criação de novas
                        páginas, inclusão de funcionalidades ou modificações profundas no projeto.
                    </p>


                    {/* PRAZOS */}
                    <h3 className="subtitulo">CLÁUSULA 4 — PRAZO DE ENTREGA</h3>

                    <p className="linha">
                        O prazo estimado para entrega do projeto é de
                        <strong> {contratoSelecionado.prazo_entrega} dias úteis</strong>, considerando que os sábados são
                        contabilizados normalmente. Apenas os domingos não entram na contagem do prazo.
                        O período começa após o envio de todas as informações, textos, imagens e materiais
                        necessários por parte do contratante.
                    </p>

                    {/* PAGAMENTO */}
                    <h3 className="subtitulo">CLÁUSULA 5 — VALORES E FORMAS DE PAGAMENTO</h3>

                    <p className="linha">
                        Valor total do projeto: R$ <strong>{contratoSelecionado.valor_total}</strong>
                    </p>

                    <p className="linha">
                        Forma de pagamento: <strong>{contratoSelecionado.forma_pagamento}</strong>
                    </p>

                    <p className="linha">
                        Entrada: R$ <strong>{contratoSelecionado.valor_entrada}</strong>
                    </p>

                    <p className="linha">
                        Valor final na entrega: R$ <strong>{contratoSelecionado.valor_final_entrega}</strong>
                    </p>

                    <p className="linha">
                        Valor por revisão extra: R$ <strong>{contratoSelecionado.valor_revisao_extra}</strong>
                    </p>


                    <p className="linha obs">
                        A liberação final do projeto acontece somente após o pagamento total acordado,
                        incluindo a entrega dos arquivos, a ativação no domínio e o acesso administrativo do site.
                        O suporte não cobre erros causados pelo contratante, nem alterações realizadas por terceiros
                        depois da entrega. O suporte também não cobre mudanças em plataformas externas como PayPal,
                        Google ou Instagram, uma vez que essas plataformas podem atualizar seus sistemas sem aviso prévio.
                        O suporte abrange apenas problemas diretamente relacionados ao código original entregue.
                    </p>


                    {/* HOSPEDAGEM */}
                    <h3 className="subtitulo">CLÁUSULA 6 — HOSPEDAGEM E SUPORTE</h3>

                    <p className="linha">
                        Hospedagem inclusa: <strong>{contratoSelecionado.hospedagem_inclusa}</strong>
                    </p>

                    <p className="linha">
                        Valor da hospedagem:{" "}
                        {contratoSelecionado.hospedagem_inclusa === "Não" ? (
                            <strong>Não possui hospedagem</strong>
                        ) : (
                            <>
                                R$ <strong>{contratoSelecionado.valor_hospedagem}</strong>
                            </>
                        )}
                    </p>


                    <p className="linha">
                        O contratante receberá <strong>{contratoSelecionado.dias_suporte} dias</strong> de suporte gratuito para
                        correções de erros, ajustes técnicos simples ou dúvidas sobre o uso do site.
                    </p>

                    <p className="linha obs">
                        Modificações estruturais, redesign completo, criação de novas seções, automações avançadas ou qualquer recurso adicional não são considerados suporte. Esses itens são tratados como novos serviços e exigem orçamento separado.
                    </p>

                    {/* FORO */}
                    <h3 className="subtitulo">CLÁUSULA 7 — FORO</h3>

                    <p className="linha">
                        Em caso de qualquer divergência relacionada a este contrato, as partes elegem o foro da cidade de
                        <strong> {contratoSelecionado.cidade_foro}</strong> como o responsável para resolver questões judiciais,
                        com renúncia a qualquer outro foro que possa ser aplicável.
                    </p>


                    {/* ASSINATURAS */}
                    <h3 className="subtitulo">CLÁUSULA 8 — ASSINATURAS</h3>

                    <p className="linha">
                        As partes confirmam o acordo e autorizam o prosseguimento do projeto.                    </p>

                    <div className="assinaturas-bloco">

                        {/* Assinatura da empresa */}
                        <div className="assinatura">
                            <p>Contratado(a): <strong> {contratoSelecionado.representante_nome} </strong>  <br /> Representante de: <strong> Iron Executions </strong> </p>
                            <div style={{ marginBottom: "8px" }}>
                                <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Data:</label>
                                <input
                                    type="date"
                                    value={contratoSelecionado.data_assinatura_contratada || ""}
                                    onChange={e => {
                                        const novaData = e.target.value;
                                        setContratoSelecionado({
                                            ...contratoSelecionado,
                                            data_assinatura_contratada: novaData
                                        });
                                        salvarData(contratoSelecionado.id, "data_assinatura_contratada", novaData);
                                    }}
                                    className="input-data-assinatura"
                                    style={{
                                        padding: "6px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        marginTop: "4px",
                                        width: "160px"
                                    }}
                                />
                            </div>

                            {contratoSelecionado.LOGO_ASSINATURA_CONTRATADA ? (
                                <>
                                    <img
                                        src={contratoSelecionado.LOGO_ASSINATURA_CONTRATADA}
                                        className="img-assinatura"
                                        alt="Assinatura contratada"
                                    />

                                    <button
                                        className="btn-reassinar"
                                        onClick={() => {
                                            setContratoSelecionado({
                                                ...contratoSelecionado,
                                                LOGO_ASSINATURA_CONTRATADA: null
                                            });
                                            abrirAssinatura("contratada");
                                        }}


                                    >
                                        Reassinar
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn-assinar"
                                    onClick={() => abrirAssinatura("contratada")}
                                >
                                    Assinar
                                </button>

                            )}
                        </div>

                        {/* Assinatura do cliente */}
                        <div className="assinatura">
                            <p>Contratante: <strong> {contratoSelecionado.nome_cliente} </strong>  <br /> Representante de: <strong> {contratoSelecionado.negocio_cliente} </strong> </p>
                            <div style={{ marginBottom: "8px" }}>
                                <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>Data:</label>
                                <input
                                    type="date"
                                    value={contratoSelecionado.data_assinatura_cliente || ""}
                                    onChange={e => {
                                        const novaData = e.target.value;
                                        setContratoSelecionado({
                                            ...contratoSelecionado,
                                            data_assinatura_cliente: novaData
                                        });
                                        salvarData(contratoSelecionado.id, "data_assinatura_cliente", novaData);
                                    }}
                                    className="input-data-assinatura"
                                    style={{
                                        padding: "6px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        marginTop: "4px",
                                        width: "160px"
                                    }}
                                />
                            </div>

                            {contratoSelecionado.LOGO_ASSINATURA_CLIENTE ? (
                                <>
                                    <img
                                        src={contratoSelecionado.LOGO_ASSINATURA_CLIENTE}
                                        className="img-assinatura"
                                        alt="Assinatura cliente"
                                    />

                                    <button
                                        className="btn-reassinar"
                                        onClick={() => {
                                            setContratoSelecionado({
                                                ...contratoSelecionado,
                                                LOGO_ASSINATURA_CLIENTE: null
                                            });
                                            abrirAssinatura("cliente");
                                        }}

                                    >
                                        Reassinar
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn-assinar"
                                    onClick={() => abrirAssinatura("cliente")}
                                >
                                    Assinar
                                </button>

                            )}
                        </div>

                    </div>


                    <p className="codigo-final">
                        Código interno do contrato:{" "}
                        <a
                            href={`/contrato/${contratoSelecionado.codigo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-codigo"
                        >
                            {contratoSelecionado.codigo}
                        </a>

                    </p>

                    <button
                        className="btn-copiar-profissional"
                        onClick={() => {
                            const link = `${window.location.origin}/contrato/${contratoSelecionado.codigo}`;
                            const texto =
                                `Segue o link do seu contrato digital da Iron Executions. Nele você encontra as informações do projeto, prazos e condições acordadas.

Contrato: ${link}

Estou à disposição para qualquer dúvida.
`;

                            navigator.clipboard.writeText(texto);
                            alert("Texto profissional copiado com sucesso.");
                        }}
                    >
                        Copiar mensagem profissional
                    </button>

                </div>
            )
            }


            {modo === "novo" && (
                <>
                    <button
                        className="btn-voltar"
                        onClick={() => {
                            setEditandoId(null);
                            setModo("menu");
                        }}
                    >
                        Voltar
                    </button>

                    <NovoContrato
                        voltar={() => {
                            setEditandoId(null);
                            setModo("menu");
                        }}
                        editando={editandoId}
                    />
                </>
            )}


        </div >
    );
}
