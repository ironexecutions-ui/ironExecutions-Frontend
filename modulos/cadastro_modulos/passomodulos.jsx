
import React, { useEffect, useMemo, useState } from "react";
import "./passomodulos.css";
import { API_URL } from "../../config";

export default function Passo3Modulos({ onContinuar }) {

    const [listaModulos, setListaModulos] = useState([]);
    const [tipoSelecionado, setTipoSelecionado] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // ==========================================
    // CARREGAR MÓDULOS E TIPOS DE COMÉRCIO
    // ==========================================
    useEffect(() => {

        let ativo = true;

        async function carregarModulos() {

            try {
                setCarregando(true);
                setErro("");

                const resp = await fetch(
                    `${API_URL}/modulos/ativoss`
                );

                if (!resp.ok) {
                    throw new Error("Erro ao carregar opções");
                }

                const dados = await resp.json();

                if (ativo) {
                    setListaModulos(
                        Array.isArray(dados) ? dados : []
                    );
                }

            } catch (err) {

                console.error(
                    "[PASSO 3 CADASTRO] Erro:",
                    err
                );

                if (ativo) {
                    setErro(
                        "Não foi possível carregar os tipos de comércio."
                    );
                }

            } finally {

                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarModulos();

        return () => {
            ativo = false;
        };

    }, []);

    // ==========================================
    // AGRUPAR TIPOS DE COMÉRCIO
    // ==========================================
    const tiposComercio = useMemo(() => {

        const agrupados = new Map();

        listaModulos.forEach((modulo) => {

            const tipo = modulo.tipo_comercio;

            if (!tipo) return;

            if (!agrupados.has(tipo)) {

                agrupados.set(tipo, {
                    id: modulo.tipo_comercio_id,
                    tipo: tipo,
                    descricao:
                        modulo.tipo_comercio_descricao || "",
                    modulos: []
                });
            }

            agrupados.get(tipo).modulos.push(modulo);
        });

        return Array.from(agrupados.values());

    }, [listaModulos]);

    // ==========================================
    // TIPO SELECIONADO
    // ==========================================
    const comercioEscolhido = useMemo(() => {

        return tiposComercio.find(
            item => item.tipo === tipoSelecionado
        ) || null;

    }, [tiposComercio, tipoSelecionado]);

    // ==========================================
    // SELECIONAR TIPO DE COMÉRCIO
    // ==========================================
    function selecionarTipo(tipo) {

        setTipoSelecionado(tipo);
        setErro("");
    }

    // ==========================================
    // CONTINUAR CADASTRO
    // ==========================================
    function confirmar() {

        if (!comercioEscolhido) {

            setErro(
                "Selecione um tipo de comércio para continuar."
            );

            return;
        }

        setErro("");

        onContinuar({

            tipo_comercio: comercioEscolhido.tipo,

            tipo_comercio_id: comercioEscolhido.id,

            modulos: comercioEscolhido.modulos,

            quantidade_modulos:
                comercioEscolhido.modulos.length

        });
    }

    // ==========================================
    // RENDERIZAÇÃO
    // ==========================================
    return (

        <section className="passo3-modulos-painel">

            {/* CABEÇALHO */}

            <header className="passo3-modulos-cabecalho">

                <div className="passo3-modulos-cabecalho-textos">

                    <span className="passo3-modulos-etapa">
                        CONFIGURAÇÃO DO COMÉRCIO
                    </span>

                    <h3 className="passo3-modulos-titulo">
                        Qual é o tipo do seu comércio?
                    </h3>

                    <p className="passo3-modulos-subtitulo">
                        Escolha a categoria que melhor representa
                        sua atividade. Os módulos correspondentes
                        serão incluídos automaticamente no seu cadastro.
                    </p>

                </div>

                <div className="passo3-modulos-etapa-indicador">

                    <span>Etapa</span>

                    <strong>3 de 4</strong>

                </div>

            </header>

            {/* ERRO */}

            {erro && (

                <div className="passo3-modulos-erro">

                    <strong>Atenção</strong>

                    <span>{erro}</span>

                </div>

            )}

            {/* CARREGAMENTO */}

            {carregando ? (

                <div className="passo3-modulos-carregando">

                    <div className="passo3-modulos-loader" />

                    <span>
                        Buscando tipos de comércio disponíveis...
                    </span>

                </div>

            ) : (

                <>

                    {/* TIPOS DE COMÉRCIO */}

                    <div className="passo3-modulos-secao-titulo">

                        <span className="passo3-modulos-secao-etiqueta">
                            CATEGORIAS DISPONÍVEIS
                        </span>

                        <h4>
                            Selecione seu tipo de comércio
                        </h4>

                        <p>
                            Você poderá escolher apenas uma categoria.
                        </p>

                    </div>

                    <div className="passo3-modulos-grid">

                        {tiposComercio.map((item) => {

                            const selecionado =
                                tipoSelecionado === item.tipo;

                            return (

                                <button
                                    key={item.id || item.tipo}
                                    type="button"
                                    onClick={() =>
                                        selecionarTipo(item.tipo)
                                    }
                                    className={
                                        `passo3-modulos-card ${selecionado
                                            ? "passo3-modulos-card-ativo"
                                            : ""
                                        }`
                                    }
                                >

                                    <div className="passo3-modulos-check">
                                        {selecionado ? "✓" : ""}
                                    </div>

                                    <div className="passo3-modulos-card-topo">

                                        <span className="passo3-modulos-card-label">
                                            TIPO DE COMÉRCIO
                                        </span>

                                        <h4 className="passo3-modulos-card-nome">
                                            {item.tipo}
                                        </h4>

                                    </div>

                                    <p className="passo3-modulos-card-texto">
                                        {item.descricao ||
                                            "Categoria de atividades comerciais."}
                                    </p>

                                    <div className="passo3-modulos-card-rodape">

                                        <span>
                                            {item.modulos.length}
                                            {" "}
                                            {item.modulos.length === 1
                                                ? "módulo disponível"
                                                : "módulos disponíveis"}
                                        </span>

                                        <strong>
                                            {selecionado
                                                ? "Selecionado"
                                                : "Escolher categoria"}
                                        </strong>

                                    </div>

                                </button>

                            );
                        })}

                    </div>

                    {/* MÓDULOS DO TIPO ESCOLHIDO */}

                    {comercioEscolhido && (

                        <div className="passo3-modulos-detalhes">

                            <div className="passo3-modulos-detalhes-cabecalho">

                                <div>

                                    <span>
                                        MÓDULOS INCLUÍDOS
                                    </span>

                                    <h4>
                                        {comercioEscolhido.tipo}
                                    </h4>

                                    <p>
                                        Estes são os módulos que farão
                                        parte da configuração inicial
                                        do seu comércio.
                                    </p>

                                </div>

                                <div className="passo3-modulos-detalhes-contagem">

                                    <strong>
                                        {comercioEscolhido.modulos.length}
                                    </strong>

                                    <span>
                                        módulos
                                    </span>

                                </div>

                            </div>

                            <div className="passo3-modulos-detalhes-lista">

                                {comercioEscolhido.modulos.map(
                                    (modulo) => (

                                        <div
                                            key={modulo.id}
                                            className="passo3-modulos-detalhe-item"
                                        >

                                            <div className="passo3-modulos-detalhe-icone">
                                                ✓
                                            </div>

                                            <div className="passo3-modulos-detalhe-conteudo">

                                                <strong>
                                                    {modulo.nome}
                                                </strong>

                                                <p>
                                                    {modulo.texto ||
                                                        "Módulo disponível para este tipo de comércio."}
                                                </p>

                                            </div>

                                            <span className="passo3-modulos-detalhe-incluido">
                                                Incluído
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                            <div className="passo3-modulos-detalhes-aviso">

                                <strong>
                                    Configuração automática
                                </strong>

                                <span>
                                    Todos os módulos apresentados
                                    serão associados ao seu cadastro.
                                    Não é necessário selecionar cada
                                    módulo individualmente.
                                </span>

                            </div>

                        </div>

                    )}

                    {/* NENHUM TIPO */}

                    {tiposComercio.length === 0 && (

                        <div className="passo3-modulos-vazio">
                            Nenhum tipo de comércio disponível no momento.
                        </div>

                    )}

                    {/* FINALIZAÇÃO */}

                    <div className="passo3-modulos-finalizacao">

                        <div className="passo3-modulos-finalizacao-info">

                            <div className="passo3-modulos-finalizacao-numero">
                                {comercioEscolhido
                                    ? comercioEscolhido.modulos.length
                                    : "0"}
                            </div>

                            <div>

                                <strong>
                                    {comercioEscolhido
                                        ? comercioEscolhido.tipo
                                        : "Escolha uma categoria"}
                                </strong>

                                <span>
                                    {comercioEscolhido
                                        ? "Tipo de comércio selecionado para o cadastro."
                                        : "Selecione o tipo de comércio para continuar."}
                                </span>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={!comercioEscolhido}
                            className="passo3-modulos-botao-continuar"
                        >

                            <span>
                                Continuar cadastro
                            </span>

                            <strong>›</strong>

                        </button>

                    </div>

                </>

            )}

        </section>

    );
}
