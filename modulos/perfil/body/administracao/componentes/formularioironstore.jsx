import React from "react";
import { createPortal } from "react-dom";

import "./formularioironstore.css";
import { URL } from "../../url";


export default function FormularioIronStore({
    form,
    alterar,
    salvar
}) {

    const estaDisponivel =
        Number(form.disponivel) === 1;

    const [alterandoDisponibilidade, setAlterandoDisponibilidade] =
        React.useState(false);

    const [modalAlerta, setModalAlerta] = React.useState({
        aberto: false,
        titulo: "",
        mensagem: "",
        itens: [],
        tipo: "aviso"
    });


    /* =========================================================
       ALERTA
    ========================================================= */

    function abrirAlerta({
        titulo = "Atenção",
        mensagem = "",
        itens = [],
        tipo = "aviso"
    }) {

        setModalAlerta({
            aberto: true,
            titulo,
            mensagem,
            itens,
            tipo
        });
    }


    function fecharAlerta() {

        setModalAlerta({
            aberto: false,
            titulo: "",
            mensagem: "",
            itens: [],
            tipo: "aviso"
        });
    }


    /* =========================================================
       ALTERAR DISPONIBILIDADE
    ========================================================= */

    async function alterarDisponibilidadeIronStore() {

        if (alterandoDisponibilidade) {
            return;
        }

        if (!form.id) {

            abrirAlerta({
                titulo: "Salve o produto primeiro",
                mensagem:
                    "O produto precisa estar salvo antes de ser ativado na IronStore.",
                tipo: "aviso"
            });

            return;
        }

        try {

            setAlterandoDisponibilidade(true);

            // =====================================================
            // SE ESTÁ INATIVO E VAI SER ATIVADO
            // PRIMEIRO SALVA TODAS AS ALTERAÇÕES
            // =====================================================

            if (!estaDisponivel) {

                // =====================================================
                // GARANTIR QUE A FUNÇÃO DE SALVAR EXISTE
                // =====================================================

                if (typeof salvar !== "function") {

                    abrirAlerta({
                        titulo: "Erro ao salvar",
                        mensagem:
                            "A função de salvamento do produto não está disponível.",
                        tipo: "erro"
                    });

                    return;
                }

                try {

                    // =====================================================
                    // 1. SALVA SEM SAIR DA TELA
                    // 2. ESPERA O PUT TERMINAR
                    // =====================================================

                    const salvou = await salvar(false);

                    // =====================================================
                    // SE NÃO SALVOU, NÃO TENTA ATIVAR
                    // =====================================================

                    if (salvou !== true) {
                        return;
                    }

                } catch (erroSalvar) {

                    console.error(
                        "Erro ao salvar antes de ativar:",
                        erroSalvar
                    );

                    abrirAlerta({
                        titulo: "Não foi possível salvar",
                        mensagem:
                            "As alterações do produto não puderam ser salvas. O produto não foi ativado.",
                        tipo: "erro"
                    });

                    return;
                }
            }


            // =====================================================
            // SOMENTE CHEGA AQUI DEPOIS QUE SALVAR() RETORNOU TRUE
            // =====================================================

            const token =
                localStorage.getItem("token");

            // =====================================================
            // DEFINIR O NOVO ESTADO
            // =====================================================

            const novaDisponibilidade =
                estaDisponivel ? 0 : 1;


            // =====================================================
            // ALTERAR DISPONIBILIDADE
            // =====================================================

            const resposta = await fetch(
                `${URL}/admin/produtos-servicos/${form.id}/ironstore/disponibilidade`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        disponivel: novaDisponibilidade
                    })
                }
            );


            // =====================================================
            // LER RESPOSTA
            // =====================================================

            const dados = await resposta
                .json()
                .catch(() => null);


            // =====================================================
            // ERRO
            // =====================================================

            if (!resposta.ok) {

                const detalhe =
                    dados?.detail;

                if (
                    detalhe &&
                    typeof detalhe === "object" &&
                    Array.isArray(detalhe.faltando)
                ) {

                    abrirAlerta({
                        titulo: "Produto incompleto",
                        mensagem:
                            detalhe.mensagem ||
                            "Este produto ainda não pode ser ativado na IronStore.",
                        itens: detalhe.faltando,
                        tipo: "aviso"
                    });

                } else {

                    abrirAlerta({
                        titulo: "Não foi possível alterar",
                        mensagem:
                            typeof detalhe === "string"
                                ? detalhe
                                : "Não foi possível alterar a disponibilidade do produto.",
                        tipo: "erro"
                    });
                }

                return;
            }


            // =====================================================
            // ATUALIZAR STATUS LOCAL
            // =====================================================

            alterar(
                "disponivel",
                dados.disponivel
            );



            // =====================================================
            // ATUALIZA STATUS NO FORM
            // =====================================================

            alterar(
                "disponivel",
                dados.disponivel
            );

        } catch (erro) {

            console.error(
                "Erro ao alterar disponibilidade IronStore:",
                erro
            );

            abrirAlerta({
                titulo: "Erro de conexão",
                mensagem:
                    "Não foi possível alterar a disponibilidade do produto. Tente novamente.",
                tipo: "erro"
            });

        } finally {

            setAlterandoDisponibilidade(false);
        }
    }

    /* =========================================================
       SELECIONAR DESTAQUE
    ========================================================= */

    function selecionarDestaque(valor) {

        if (form.destaque === valor) {

            alterar(
                "destaque",
                ""
            );

            return;
        }


        alterar(
            "destaque",
            valor
        );
    }


    /* =========================================================
       JSX
    ========================================================= */

    return (

        <div className="ironstore-produto-painel">


            {/* =====================================================
                CABEÇALHO
            ===================================================== */}

            <div className="ironstore-produto-topo">

                <div className="ironstore-produto-topo-identidade">

                    <div className="ironstore-produto-topo-icone">

                        <span className="ironstore-produto-topo-icone-sacola">
                            IS
                        </span>

                    </div>


                    <div className="ironstore-produto-topo-textos">

                        <span className="ironstore-produto-topo-etiqueta">
                            IronStore
                        </span>

                        <h3 className="ironstore-produto-topo-titulo">
                            Informações para venda online
                        </h3>

                        <p className="ironstore-produto-topo-descricao">
                            Configure como este produto será apresentado
                            para seus clientes na loja.
                        </p>

                    </div>

                </div>


                <div
                    className={
                        estaDisponivel
                            ? "ironstore-produto-topo-situacao ativo"
                            : "ironstore-produto-topo-situacao inativo"
                    }
                >

                    <span className="ironstore-produto-topo-situacao-ponto" />

                    <div className="ironstore-produto-topo-situacao-textos">

                        <span className="ironstore-produto-topo-situacao-label">
                            Status
                        </span>

                        <strong>
                            {estaDisponivel
                                ? "Disponível na loja"
                                : "Não publicado"
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* =====================================================
                DISPONIBILIDADE
            ===================================================== */}

            <section className="ironstore-produto-secao ironstore-produto-secao-publicacao">

                <div className="ironstore-produto-secao-cabecalho">

                    <div className="ironstore-produto-secao-numero">
                        01
                    </div>


                    <div className="ironstore-produto-secao-titulos">

                        <h4>
                            Publicação
                        </h4>

                        <p>
                            Controle se este produto pode aparecer
                            e ser vendido pela IronStore.
                        </p>

                    </div>

                </div>


                <div className="ironstore-produto-publicacao-card">

                    <div className="ironstore-produto-publicacao-info">

                        <div
                            className={
                                estaDisponivel
                                    ? "ironstore-produto-publicacao-indicador ativo"
                                    : "ironstore-produto-publicacao-indicador inativo"
                            }
                        >

                            <span />

                        </div>


                        <div className="ironstore-produto-publicacao-textos">

                            <strong>
                                {estaDisponivel
                                    ? "Produto publicado"
                                    : "Produto desativado"
                                }
                            </strong>

                            <span>
                                {estaDisponivel
                                    ? "Este produto está disponível para venda online."
                                    : "Ative quando todas as informações necessárias estiverem preenchidas."
                                }
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        disabled={alterandoDisponibilidade}
                        className={
                            estaDisponivel
                                ? "ironstore-produto-status-botao ativo"
                                : "ironstore-produto-status-botao inativo"
                        }
                        onClick={alterarDisponibilidadeIronStore}
                    >

                        <span className="ironstore-produto-status-botao-ponto" />

                        {alterandoDisponibilidade
                            ? "Verificando..."
                            : estaDisponivel
                                ? "Ativo"
                                : "Inativo"
                        }

                    </button>

                </div>

            </section>


            {/* =====================================================
                INFORMAÇÕES COMERCIAIS
            ===================================================== */}

            <section className="ironstore-produto-secao">

                <div className="ironstore-produto-secao-cabecalho">

                    <div className="ironstore-produto-secao-numero">
                        02
                    </div>


                    <div className="ironstore-produto-secao-titulos">

                        <h4>
                            Apresentação do produto
                        </h4>

                        <p>
                            Informações que o cliente verá
                            antes de realizar a compra.
                        </p>

                    </div>

                </div>


                <div className="ironstore-produto-campos">


                    {/* DESCRIÇÃO */}

                    <div className="ironstore-produto-campo ironstore-produto-campo-descricao">

                        <div className="ironstore-produto-campo-topo">

                            <label>
                                Descrição completa
                            </label>

                            <span>
                                Conteúdo principal
                            </span>

                        </div>


                        <textarea
                            className="ironstore-produto-textarea"
                            placeholder="Descreva o produto, suas características, materiais, benefícios e outras informações importantes..."
                            value={form.descricao || ""}
                            onChange={(e) =>
                                alterar(
                                    "descricao",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* DESCRIÇÃO CURTA */}

                    <div className="ironstore-produto-campo ironstore-produto-campo-resumo">

                        <div className="ironstore-produto-campo-topo">

                            <label>
                                Descrição curta
                            </label>

                            <span>
                                Resumo
                            </span>

                        </div>


                        <input
                            className="ironstore-produto-input"
                            type="text"
                            placeholder="Ex: Camiseta masculina 100% algodão"
                            value={form.descricao_curta || ""}
                            onChange={(e) =>
                                alterar(
                                    "descricao_curta",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* PREÇO PROMOCIONAL */}

                    <div className="ironstore-produto-campo ironstore-produto-campo-promocao">

                        <div className="ironstore-produto-campo-topo">

                            <label>
                                Preço promocional
                            </label>

                            <span>
                                Opcional
                            </span>

                        </div>


                        <div className="ironstore-produto-input-moeda">

                            <span className="ironstore-produto-input-moeda-prefixo">
                                R$
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                value={form.preco_promocao || ""}
                                onChange={(e) =>
                                    alterar(
                                        "preco_promocao",
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                DESTAQUE
            ===================================================== */}

            <section className="ironstore-produto-secao">

                <div className="ironstore-produto-secao-cabecalho">

                    <div className="ironstore-produto-secao-numero">
                        03
                    </div>


                    <div className="ironstore-produto-secao-titulos">

                        <h4>
                            Destaque na loja
                        </h4>

                        <p>
                            Defina a prioridade visual deste produto
                            dentro da IronStore.
                        </p>

                    </div>

                </div>


                <div className="ironstore-produto-destaques">


                    {/* FERRO */}

                    <button
                        type="button"
                        className={
                            form.destaque === "ferro"
                                ? "ironstore-produto-destaque ferro ativo"
                                : "ironstore-produto-destaque ferro"
                        }
                        onClick={() =>
                            selecionarDestaque("ferro")
                        }
                    >

                        <span className="ironstore-produto-destaque-marcador">
                            F
                        </span>


                        <span className="ironstore-produto-destaque-conteudo">

                            <strong>
                                Ferro
                            </strong>

                            <small>
                                Exibição padrão
                            </small>

                        </span>


                        <span className="ironstore-produto-destaque-check">
                            {form.destaque === "ferro"
                                ? "✓"
                                : ""
                            }
                        </span>

                    </button>


                    {/* OURO */}

                    <button
                        type="button"
                        className={
                            form.destaque === "ouro"
                                ? "ironstore-produto-destaque ouro ativo"
                                : "ironstore-produto-destaque ouro"
                        }
                        onClick={() =>
                            selecionarDestaque("ouro")
                        }
                    >

                        <span className="ironstore-produto-destaque-marcador">
                            O
                        </span>


                        <span className="ironstore-produto-destaque-conteudo">

                            <strong>
                                Ouro
                            </strong>

                            <small>
                                Maior visibilidade
                            </small>

                        </span>


                        <span className="ironstore-produto-destaque-check">
                            {form.destaque === "ouro"
                                ? "✓"
                                : ""
                            }
                        </span>

                    </button>


                    {/* DIAMANTE */}

                    <button
                        type="button"
                        className={
                            form.destaque === "diamante"
                                ? "ironstore-produto-destaque diamante ativo"
                                : "ironstore-produto-destaque diamante"
                        }
                        onClick={() =>
                            selecionarDestaque("diamante")
                        }
                    >

                        <span className="ironstore-produto-destaque-marcador">
                            D
                        </span>


                        <span className="ironstore-produto-destaque-conteudo">

                            <strong>
                                Diamante
                            </strong>

                            <small>
                                Destaque máximo
                            </small>

                        </span>


                        <span className="ironstore-produto-destaque-check">
                            {form.destaque === "diamante"
                                ? "✓"
                                : ""
                            }
                        </span>

                    </button>

                </div>

            </section>


            {/* =====================================================
                LOGÍSTICA
            ===================================================== */}

            <section className="ironstore-produto-secao">

                <div className="ironstore-produto-secao-cabecalho">

                    <div className="ironstore-produto-secao-numero">
                        04
                    </div>


                    <div className="ironstore-produto-secao-titulos">

                        <h4>
                            Peso e dimensões
                        </h4>

                        <p>
                            Essas informações podem ser utilizadas
                            no cálculo e organização das entregas.
                        </p>

                    </div>

                </div>


                <div className="ironstore-produto-logistica-grid">


                    {/* PESO */}

                    <div className="ironstore-produto-campo">

                        <div className="ironstore-produto-campo-topo">

                            <label>
                                Peso
                            </label>

                            <span>
                                gramas
                            </span>

                        </div>


                        <div className="ironstore-produto-input-unidade">

                            <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="500"
                                value={form.peso_g || ""}
                                onChange={(e) =>
                                    alterar(
                                        "peso_g",
                                        e.target.value
                                    )
                                }
                            />

                            <span>
                                g
                            </span>

                        </div>

                    </div>


                    {/* ALTURA */}

                    <div className="ironstore-produto-campo">

                        <div className="ironstore-produto-campo-topo">

                            <label>
                                Altura
                            </label>

                            <span>
                                centímetros
                            </span>

                        </div>


                        <div className="ironstore-produto-input-unidade">

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="20"
                                value={form.altura_cm || ""}
                                onChange={(e) =>
                                    alterar(
                                        "altura_cm",
                                        e.target.value
                                    )
                                }
                            />

                            <span>
                                cm
                            </span>

                        </div>

                    </div>


                    {/* COMPRIMENTO */}

                    <div className="ironstore-produto-campo">

                        <div className="ironstore-produto-campo-topo">

                            <label>
                                Comprimento
                            </label>

                            <span>
                                centímetros
                            </span>

                        </div>


                        <div className="ironstore-produto-input-unidade">

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="30"
                                value={form.cumprimento_cm || ""}
                                onChange={(e) =>
                                    alterar(
                                        "cumprimento_cm",
                                        e.target.value
                                    )
                                }
                            />

                            <span>
                                cm
                            </span>

                        </div>

                    </div>


                    {/* LARGURA */}

                    <div className="ironstore-produto-campo">

                        <div className="ironstore-produto-campo-topo">

                            <label>
                                Largura
                            </label>

                            <span>
                                centímetros
                            </span>

                        </div>


                        <div className="ironstore-produto-input-unidade">

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="15"
                                value={form.largura_cm || ""}
                                onChange={(e) =>
                                    alterar(
                                        "largura_cm",
                                        e.target.value
                                    )
                                }
                            />

                            <span>
                                cm
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                RODAPÉ / SALVAR
            ===================================================== */}

            {salvar && (

                <div className="ironstore-produto-rodape">

                    <div className="ironstore-produto-rodape-info">

                        <span className="ironstore-produto-rodape-indicador" />

                        <div>

                            <strong>
                                Informações da IronStore
                            </strong>

                            <span>
                                Salve para aplicar as alterações deste produto.
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="ironstore-produto-salvar"
                        onClick={salvar}
                    >
                        <span>
                            Salvar alterações
                        </span>

                        <span className="ironstore-produto-salvar-seta">
                            →
                        </span>
                    </button>

                </div>

            )}


            {/* =====================================================
                MODAL
            ===================================================== */}

            {modalAlerta.aberto &&
                createPortal(

                    <div
                        className="cadastro-ironstore-alerta-overlay"
                        onMouseDown={fecharAlerta}
                    >

                        <div
                            className={`cadastro-ironstore-alerta-modal ${modalAlerta.tipo}`}
                            onMouseDown={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="cadastro-ironstore-alerta-cabecalho">

                                <div
                                    className={`cadastro-ironstore-alerta-indicador ${modalAlerta.tipo}`}
                                >
                                    {modalAlerta.tipo === "erro"
                                        ? "!"
                                        : "i"
                                    }
                                </div>


                                <div className="cadastro-ironstore-alerta-titulos">

                                    <strong className="cadastro-ironstore-alerta-titulo">
                                        {modalAlerta.titulo}
                                    </strong>


                                    {modalAlerta.mensagem && (

                                        <span className="cadastro-ironstore-alerta-mensagem">
                                            {modalAlerta.mensagem}
                                        </span>

                                    )}

                                </div>


                                <button
                                    type="button"
                                    className="cadastro-ironstore-alerta-fechar"
                                    onClick={fecharAlerta}
                                    aria-label="Fechar"
                                >
                                    ×
                                </button>

                            </div>


                            {modalAlerta.itens.length > 0 && (

                                <div className="cadastro-ironstore-alerta-pendencias">

                                    <span className="cadastro-ironstore-alerta-pendencias-titulo">
                                        Falta preencher
                                    </span>


                                    <div className="cadastro-ironstore-alerta-lista">

                                        {modalAlerta.itens.map(
                                            (item, index) => (

                                                <div
                                                    key={`${item}-${index}`}
                                                    className="cadastro-ironstore-alerta-item"
                                                >

                                                    <span className="cadastro-ironstore-alerta-item-marcador">
                                                        {index + 1}
                                                    </span>


                                                    <span className="cadastro-ironstore-alerta-item-texto">
                                                        {item}
                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            <div className="cadastro-ironstore-alerta-acoes">

                                <button
                                    type="button"
                                    className="cadastro-ironstore-alerta-entendi"
                                    onClick={fecharAlerta}
                                >
                                    Entendi
                                </button>

                            </div>

                        </div>

                    </div>,

                    document.body
                )
            }

        </div>
    );
}