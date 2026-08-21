import React, { useEffect, useState } from "react";

import "./explicacaomodulos.css";
import { API_URL } from "../../config";

export default function ExplicacaoModulos() {

    const [modulos, setModulos] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {

        async function carregarModulos() {

            try {

                setCarregando(true);
                setErro("");

                const resp = await fetch(
                    `${API_URL}/modulos/ativos/publico`
                );

                if (!resp.ok) {
                    throw new Error("Erro ao carregar módulos");
                }

                const dados = await resp.json();

                setModulos(
                    Array.isArray(dados)
                        ? dados
                        : []
                );

            } catch (err) {

                console.error(
                    "[MÓDULOS PÚBLICOS]",
                    err
                );

                setErro(
                    "Não foi possível carregar os módulos."
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarModulos();

    }, []);


    /* =====================================================
       TIPO DO MÓDULO
    ===================================================== */

    function obterTipoModulo(modulo) {

        const nome = String(modulo.nome || "")
            .trim()
            .toLowerCase();

        if (nome.includes("produtividade")) {
            return "caixa";
        }

        if (nome.includes("administra")) {
            return "gestao";
        }

        if (nome.includes("fiscal")) {
            return "fiscal";
        }

        return "padrao";

    }


    /* =====================================================
       ÍCONE DO MÓDULO
    ===================================================== */

    function obterIconeModulo(modulo) {

        const tipo = obterTipoModulo(modulo);

        if (tipo === "caixa") {
            return "▣";
        }

        if (tipo === "gestao") {
            return "◫";
        }

        if (tipo === "fiscal") {
            return "✓";
        }

        return "◆";

    }


    /* =====================================================
       FORMATAR PREÇO
    ===================================================== */

    function formatarPreco(valor) {

        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2
            }
        );

    }


    /* =====================================================
       MÓDULOS VISÍVEIS
    ===================================================== */

    const modulosVisiveis = modulos.filter(
        modulo => Number(modulo.preco) >= 1
    );


    return (

        <section className="exp-modulos-premium">

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <header className="exp-modulos-premium__cabecalho">

                <span className="exp-modulos-premium__mini-titulo">
                    MÓDULOS
                </span>

                <h2 className="exp-modulos-premium__titulo">
                    Tudo o que seu comércio precisa
                </h2>

                <p className="exp-modulos-premium__subtitulo">
                    Escolha os módulos que fazem sentido para
                    sua operação e monte seu sistema.
                </p>

            </header>


            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (

                <div className="exp-modulos-premium__erro">
                    {erro}
                </div>

            )}


            {/* =================================================
                MÓDULOS
            ================================================= */}

            {carregando ? (

                <div className="exp-modulos-premium__carregando">

                    <div className="exp-modulos-premium__loader" />

                    <span>
                        Carregando módulos...
                    </span>

                </div>

            ) : (

                <div className="exp-modulos-premium__grade">

                    {modulosVisiveis.map(modulo => {

                        const tipo = obterTipoModulo(modulo);

                        return (

                            <article
                                key={modulo.id}
                                className={`exp-modulos-premium__card exp-modulos-premium__card--${tipo}`}
                            >

                                {/* =============================
                                    TOPO
                                ============================= */}

                                <div className="exp-modulos-premium__card-topo">

                                    <div className="exp-modulos-premium__icone">
                                        {obterIconeModulo(modulo)}
                                    </div>

                                    <span className="exp-modulos-premium__disponivel">
                                        Disponível
                                    </span>

                                </div>


                                {/* =============================
                                    CONTEÚDO
                                ============================= */}

                                <div className="exp-modulos-premium__conteudo">

                                    <h3 className="exp-modulos-premium__nome">
                                        {modulo.nome}
                                    </h3>

                                    <p className="exp-modulos-premium__descricao">
                                        {modulo.texto}
                                    </p>

                                </div>


                                {/* =============================
                                    PREÇO
                                ============================= */}

                                <div className="exp-modulos-premium__preco">

                                    <div className="exp-modulos-premium__preco-texto">

                                        <span>
                                            Mensalidade
                                        </span>

                                        <div>

                                            <strong>
                                                {formatarPreco(modulo.preco)}
                                            </strong>

                                            <small>
                                                /mês
                                            </small>

                                        </div>

                                    </div>

                                </div>

                            </article>

                        );

                    })}

                </div>

            )}


            {/* =================================================
                DESCONTOS
            ================================================= */}

            <div className="exp-modulos-premium__oferta">

                <div className="exp-modulos-premium__oferta-cabecalho">

                    <span className="exp-modulos-premium__oferta-mini">
                        ECONOMIZE MAIS
                    </span>

                    <h3>
                        Quanto mais módulos, menor a mensalidade
                    </h3>

                    <p>
                        Os descontos são calculados automaticamente
                        de acordo com sua contratação.
                    </p>

                </div>


                {/* =================================================
                    CARDS DOS DESCONTOS
                ================================================= */}

                <div className="exp-modulos-premium__descontos">

                    {/* 15% */}

                    <div className="exp-modulos-premium__desconto">

                        <div className="exp-modulos-premium__desconto-numero">
                            15%
                        </div>

                        <div className="exp-modulos-premium__desconto-info">

                            <strong>
                                Contratando 2 módulos
                            </strong>

                            <span>
                                de desconto em cada mensalidade
                            </span>

                        </div>

                    </div>


                    {/* 30% */}

                    <div className="exp-modulos-premium__desconto">

                        <div className="exp-modulos-premium__desconto-numero">
                            30%
                        </div>

                        <div className="exp-modulos-premium__desconto-info">

                            <strong>
                                Contratando 3 módulos
                            </strong>

                            <span>
                                de desconto em cada mensalidade
                            </span>

                        </div>

                    </div>


                    {/* 50% */}

                    <div className="exp-modulos-premium__desconto exp-modulos-premium__desconto--destaque">

                        <div className="exp-modulos-premium__desconto-numero">
                            50%
                        </div>

                        <div className="exp-modulos-premium__desconto-info">

                            <strong>
                                Desconto permanente
                            </strong>

                            <span>
                                Ao contratar, pague R$ 100 adicionais
                                por módulo, além do valor da contratação,
                                e receba 50% de desconto permanente
                                nas mensalidades.
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    OBSERVAÇÃO
                ================================================= */}

                <div className="exp-modulos-premium__observacao">

                    <span className="exp-modulos-premium__observacao-icone">
                        i
                    </span>

                    <p>
                        O desconto permanente de 50% é adicional
                        aos descontos por quantidade de módulos.
                        Os descontos são aplicados somente às
                        mensalidades dos módulos e não incluem
                        serviços adicionais, implementações
                        personalizadas ou outros serviços contratados.
                    </p>

                </div>
<div className="passo3-modulos-pagamento-pos-cadastro">

    <div className="passo3-modulos-pagamento-pos-cadastro-icone">
        ✓
    </div>

    <div className="passo3-modulos-pagamento-pos-cadastro-conteudo">

        <strong>
            Nenhum pagamento será realizado agora
        </strong>

        <p>
            Primeiro, finalize o cadastro do seu comércio.
            Após a conclusão, nossa equipe entrará em contato
            com você e enviará uma mensagem com as informações
            e instruções necessárias para realizar o pagamento.
        </p>

        <span>
            Você poderá revisar os valores antes de efetuar o pagamento.
        </span>

    </div>

</div>
            </div>

        </section>

    );

}