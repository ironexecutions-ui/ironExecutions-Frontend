import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL } from "../../config";
import logoIronExecutions from "./img.png";
import "./parceirosgeral.css";

export default function ParceirosGeral() {
    const { comercio_id } = useParams();

    const [formulario, setFormulario] = useState({
        nome: "",
        email: "",
        zap: "",
    });

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [mostrarRecursos, setMostrarRecursos] = useState(false);
    const [comercioIndicador, setComercioIndicador] = useState(null);
    const [erroIndicador, setErroIndicador] = useState(false);

    useEffect(() => {
        const indicadorId = Number(comercio_id);

        if (!Number.isInteger(indicadorId) || indicadorId <= 0) {
            setErroIndicador(true);
            return;
        }

        const controller = new AbortController();

        async function carregarIndicador() {
            try {
                const resposta = await fetch(
                    `${API_URL}/parceiros/indicador/${indicadorId}`,
                    { signal: controller.signal }
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar o indicador.");
                }

                const dados = await resposta.json();

                setComercioIndicador(dados);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setErroIndicador(true);
                }
            }
        }

        carregarIndicador();

        return () => controller.abort();
    }, [comercio_id]);
    function atualizarCampo(campo, valor) {
        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));

        setErro("");
    }

    async function enviarCadastro(evento) {
        evento.preventDefault();
        setErro("");

        const indicadorId = Number(comercio_id);

        if (!Number.isInteger(indicadorId) || indicadorId <= 0) {
            setErro("O link de indicação é inválido.");
            return;
        }

        const nome = formulario.nome.trim();
        const email = formulario.email.trim().toLowerCase();
        const zap = formulario.zap.trim();

        if (!nome || !email || !zap) {
            setErro("Preencha todos os campos para continuar.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(
                `${API_URL}/parceiros/candidatos`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        zap,
                        comercio_indcador: indicadorId,
                    }),
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    typeof dados.detail === "string"
                        ? dados.detail
                        : "Não foi possível salvar seu cadastro."
                );
            }

            if (!dados.loja || !dados.indicador_nome) {
                throw new Error(
                    "Cadastro recebido, mas não foi possível obter os dados da indicação. Entre em contato com nossa equipe."
                );
            }

            const mensagem =
                `Olá, sou representante da loja ${dados.loja}, ` +
                `indicado por ${dados.indicador_nome}, ` +
                "e gostaria de saber mais.";

            const urlWhatsApp =
                `https://wa.me/5511918547818?text=${encodeURIComponent(mensagem)}`;

            window.location.assign(urlWhatsApp);
        } catch (error) {
            setErro(
                error.message ||
                "Erro de conexão. Verifique sua internet e tente novamente."
            );

            setCarregando(false);
        }
    }

    return (
        <main className="pg-candidato">
            <div
                className="pg-candidato__decoracao"
                aria-hidden="true"
            />

            <section className="pg-candidato__card">
                <header className="pg-candidato__header">
                    <Link
                        to="/"
                        className="pg-candidato__marca"
                        aria-label="Iron Executions, página inicial"
                    >
                        <img
                            src={logoIronExecutions}
                            alt="Iron Executions"
                            className="pg-candidato__logo"
                        />

                        <span className="pg-candidato__marca-texto">
                            IRON
                            <span>EXECUTIONS</span>
                        </span>
                    </Link>

                    <span className="pg-candidato__parceria">
                        <span aria-hidden="true">←</span>
                        <span>EM PARCERIA</span>
                        <span aria-hidden="true">→</span>
                    </span>

                    <div className="pg-candidato__indicador">
                        {comercioIndicador ? (
                            <>
                                {comercioIndicador.imagem ? (
                                    <img
                                        src={comercioIndicador.imagem}
                                        alt={comercioIndicador.loja}
                                        className="pg-candidato__indicador-logo"
                                        onError={(evento) => {
                                            evento.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="pg-candidato__indicador-inicial">
                                        {comercioIndicador.loja?.charAt(0)?.toUpperCase() || "L"}
                                    </div>
                                )}

                                <span className="pg-candidato__indicador-nome">
                                    {comercioIndicador.loja}
                                </span>
                            </>
                        ) : (
                            <span className="pg-candidato__indicador-nome">
                                {erroIndicador ? "Loja parceira" : "Carregando..."}
                            </span>
                        )}
                    </div>
                </header>

                <div className="pg-candidato__conteudo">
                    <section className="pg-candidato__apresentacao">
                        <span className="pg-candidato__eyebrow">
                            TECNOLOGIA PARA O SEU NEGÓCIO
                        </span>

                        <h1>
                            Sua loja merece
                            <span> ir mais longe.</span>
                        </h1>

                        <p className="pg-candidato__descricao">
                            Simplifique sua gestão, amplie suas vendas e
                            tenha mais ferramentas para desenvolver seu negócio.
                        </p>

                        <button
                            type="button"
                            className="pg-candidato__ver-mais"
                            onClick={() =>
                                setMostrarRecursos((anterior) => !anterior)
                            }
                            aria-expanded={mostrarRecursos}
                            aria-controls="pg-recursos"
                        >
                            {mostrarRecursos
                                ? "Ocultar recursos"
                                : "Conhecer os recursos"}

                            <span
                                className={`pg-candidato__seta ${mostrarRecursos
                                    ? "pg-candidato__seta--aberta"
                                    : ""
                                    }`}
                                aria-hidden="true"
                            >
                                ↓
                            </span>
                        </button>

                        <div
                            id="pg-recursos"
                            className={`pg-candidato__recursos ${mostrarRecursos
                                ? "pg-candidato__recursos--abertos"
                                : ""
                                }`}
                            aria-hidden={!mostrarRecursos}
                            inert={!mostrarRecursos}
                        >
                            <div className="pg-candidato__recursos-interior">
                                <article className="pg-candidato__recurso">
                                    <span className="pg-candidato__recurso-numero">
                                        01
                                    </span>

                                    <div>
                                        <h3>Vendas no caixa</h3>
                                        <p>
                                            Registre vendas presenciais e
                                            organize sua operação.
                                        </p>
                                    </div>
                                </article>

                                <article className="pg-candidato__recurso">
                                    <span className="pg-candidato__recurso-numero">
                                        02
                                    </span>

                                    <div>
                                        <h3>Emissão de notas fiscais</h3>
                                        <p>
                                            Utilize recursos fiscais para
                                            atender às necessidades da sua loja.
                                        </p>
                                    </div>
                                </article>

                                <article className="pg-candidato__recurso">
                                    <span className="pg-candidato__recurso-numero">
                                        03
                                    </span>

                                    <div>
                                        <h3>Vendas online</h3>
                                        <p>
                                            Apresente seus produtos e receba
                                            pedidos pela internet.
                                        </p>
                                    </div>
                                </article>

                                <article className="pg-candidato__recurso">
                                    <span className="pg-candidato__recurso-numero">
                                        04
                                    </span>

                                    <div>
                                        <h3>Site e presença no Google</h3>
                                        <p>
                                            Tenha um espaço online para divulgar
                                            sua loja e seus produtos.
                                        </p>
                                    </div>
                                </article>

                                <article className="pg-candidato__recurso">
                                    <span className="pg-candidato__recurso-numero">
                                        05
                                    </span>

                                    <div>
                                        <h3>Muito mais possibilidades</h3>
                                        <p>
                                            Conheça ferramentas de gestão,
                                            administração e vendas.
                                        </p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </section>

                    <div className="pg-candidato__divisor">
                        <span />
                        <span>FAÇA PARTE</span>
                        <span />
                    </div>

                    <section className="pg-candidato__form-secao">
                        <div className="pg-candidato__form-cabecalho">
                            <h2>Cadastre sua loja</h2>

                            <p>
                                Informe seus dados para conversar com nossa equipe.
                            </p>
                        </div>

                        <form
                            className="pg-candidato__formulario"
                            onSubmit={enviarCadastro}
                        >
                            <div className="pg-candidato__campo">
                                <label htmlFor="pg-nome">
                                    Nome da loja
                                </label>

                                <input
                                    id="pg-nome"
                                    name="nome"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="Nome comercial"
                                    maxLength={150}
                                    value={formulario.nome}
                                    onChange={(evento) =>
                                        atualizarCampo(
                                            "nome",
                                            evento.target.value
                                        )
                                    }
                                    disabled={carregando}
                                    required
                                />
                            </div>

                            <div className="pg-candidato__campo">
                                <label htmlFor="pg-email">
                                    E-mail comercial
                                </label>

                                <input
                                    id="pg-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="voce@empresa.com.br"
                                    maxLength={255}
                                    value={formulario.email}
                                    onChange={(evento) =>
                                        atualizarCampo(
                                            "email",
                                            evento.target.value
                                        )
                                    }
                                    disabled={carregando}
                                    required
                                />
                            </div>

                            <div className="pg-candidato__campo">
                                <label htmlFor="pg-zap">
                                    WhatsApp para contato
                                </label>

                                <input
                                    id="pg-zap"
                                    name="zap"
                                    type="tel"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    placeholder="DDD + número"
                                    maxLength={30}
                                    value={formulario.zap}
                                    onChange={(evento) =>
                                        atualizarCampo(
                                            "zap",
                                            evento.target.value.replace(
                                                /[^\d+()\s-]/g,
                                                ""
                                            )
                                        )
                                    }
                                    disabled={carregando}
                                    required
                                />
                            </div>

                            {erro && (
                                <p
                                    className="pg-candidato__erro"
                                    role="alert"
                                >
                                    {erro}
                                </p>
                            )}

                            <button
                                className="pg-candidato__botao"
                                type="submit"
                                disabled={carregando}
                            >
                                <span>
                                    {carregando
                                        ? "Salvando cadastro..."
                                        : "Falar com nossa equipe"}
                                </span>

                                {!carregando && (
                                    <span
                                        className="pg-candidato__botao-seta"
                                        aria-hidden="true"
                                    >
                                        ↗
                                    </span>
                                )}
                            </button>

                            <p className="pg-candidato__privacidade">
                                Seus dados serão utilizados para dar
                                continuidade ao atendimento.
                            </p>
                        </form>
                    </section>

                    <Link
                        className="pg-candidato__site"
                        to="/"
                    >
                        <span>Conhecer o site oficial</span>
                        <span aria-hidden="true">↗</span>
                    </Link>
                </div>

                <footer className="pg-candidato__rodape">
                    <span>IRON EXECUTIONS</span>
                    <span>TECNOLOGIA PARA O SEU NEGÓCIO</span>
                </footer>
            </section>
        </main>
    );
}