import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";
import "./termos.css";

export default function Termos() {
    const token = localStorage.getItem("token");

    const [termos, setTermos] = useState([]);
    const [comercios, setComercios] = useState([]);
    const [comercioSelecionado, setComercioSelecionado] = useState(null);
    const [detalhesComercio, setDetalhesComercio] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [carregandoComercios, setCarregandoComercios] = useState(false);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoFormulario, setModoFormulario] = useState("novo");

    const [termoEditando, setTermoEditando] = useState(null);

    const [tema, setTema] = useState("");
    const [clausulas, setClausulas] = useState("");
    const [disponivel, setDisponivel] = useState("sim");

    const [salvando, setSalvando] = useState(false);
    const [apagandoId, setApagandoId] = useState(null);

    function headers() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    function limparMensagens() {
        setErro("");
        setMensagem("");
    }

    function formatarData(data) {
        if (!data) {
            return "Não informado";
        }

        const valor = String(data).trim();

        if (!valor) {
            return "Não informado";
        }

        const dataNormalizada = valor.replace(" ", "T");

        const objeto = new Date(dataNormalizada);

        if (Number.isNaN(objeto.getTime())) {
            return valor;
        }

        return objeto.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function obterImagemComercio(imagem) {
        if (!imagem) {
            return null;
        }

        const valor = String(imagem).trim();

        if (!valor) {
            return null;
        }

        if (
            valor.startsWith("http://") ||
            valor.startsWith("https://") ||
            valor.startsWith("data:")
        ) {
            return valor;
        }

        if (valor.startsWith("/")) {
            return `${API_URL}${valor}`;
        }

        return `${API_URL}/${valor}`;
    }

    async function carregarTermos() {
        setCarregando(true);
        setErro("");

        try {
            const resposta = await fetch(
                `${API_URL}/termos/admin`,
                {
                    headers: headers(),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Não foi possível carregar os termos."
                );
            }

            setTermos(dados.termos || []);
        } catch (error) {
            console.error(error);
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarComercios() {
        setCarregandoComercios(true);

        try {
            const resposta = await fetch(
                `${API_URL}/termos/admin/comercios`,
                {
                    headers: headers(),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Não foi possível carregar os comércios."
                );
            }

            setComercios(dados.comercios || []);
        } catch (error) {
            console.error(error);
            setErro(error.message);
        } finally {
            setCarregandoComercios(false);
        }
    }

    async function carregarDetalhesComercio(comercio) {
        if (!comercio) {
            return;
        }

        setComercioSelecionado(comercio);
        setDetalhesComercio(null);
        setCarregandoDetalhes(true);
        setErro("");

        try {
            const resposta = await fetch(
                `${API_URL}/termos/admin/comercio/${comercio.id}`,
                {
                    headers: headers(),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Não foi possível carregar os termos da loja."
                );
            }

            setDetalhesComercio(dados);
        } catch (error) {
            console.error(error);
            setErro(error.message);
        } finally {
            setCarregandoDetalhes(false);
        }
    }

    useEffect(() => {
        carregarTermos();
        carregarComercios();

        document.title = "Gerenciar Termos";
    }, []);

    function abrirNovoTermo() {
        limparMensagens();

        setModoFormulario("novo");
        setTermoEditando(null);

        setTema("");
        setClausulas("");
        setDisponivel("sim");

        setMostrarFormulario(true);
    }

    function abrirEditarTermo(termo) {
        limparMensagens();

        setModoFormulario("editar");
        setTermoEditando(termo);

        setTema(termo.tema || "");
        setClausulas(termo.clausulas || "");

        const valorDisponivel = String(
            termo.disponivel ?? ""
        ).trim().toLowerCase();

        if (
            valorDisponivel === "sim" ||
            valorDisponivel === "true" ||
            valorDisponivel === "1" ||
            valorDisponivel === "ativo"
        ) {
            setDisponivel("sim");
        } else {
            setDisponivel("nao");
        }

        setMostrarFormulario(true);
    }

    function fecharFormulario() {
        if (salvando) {
            return;
        }

        setMostrarFormulario(false);
        setTermoEditando(null);

        setTema("");
        setClausulas("");
        setDisponivel("sim");
    }

    async function salvarTermo(evento) {
        evento.preventDefault();

        limparMensagens();

        const temaLimpo = tema.trim();
        const clausulasLimpa = clausulas.trim();

        if (!temaLimpo) {
            setErro("Informe o tema do termo.");
            return;
        }

        if (!clausulasLimpa) {
            setErro("Informe as cláusulas do termo.");
            return;
        }

        setSalvando(true);

        try {
            const payload = {
                tema: temaLimpo,
                clausulas: clausulas,
                disponivel: disponivel,
            };

            let url = `${API_URL}/termos/admin`;
            let metodo = "POST";

            if (
                modoFormulario === "editar" &&
                termoEditando?.id
            ) {
                url =
                    `${API_URL}/termos/admin/` +
                    encodeURIComponent(termoEditando.id);

                metodo = "PUT";
            }

            const resposta = await fetch(
                url,
                {
                    method: metodo,
                    headers: headers(),
                    body: JSON.stringify(payload),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Não foi possível salvar o termo."
                );
            }

            setMensagem(
                modoFormulario === "editar"
                    ? "Termo atualizado com sucesso."
                    : "Termo criado com sucesso."
            );

            fecharFormulario();

            await carregarTermos();
            await carregarComercios();

            if (comercioSelecionado) {
                await carregarDetalhesComercio(
                    comercioSelecionado
                );
            }
        } catch (error) {
            console.error(error);
            setErro(error.message);
        } finally {
            setSalvando(false);
        }
    }

    async function apagarTermo(termo) {
        if (!termo?.id) {
            return;
        }

        const confirmou = window.confirm(
            `Tem certeza que deseja apagar o termo "${termo.tema}"?\n\n` +
            "As assinaturas relacionadas a este termo também serão removidas."
        );

        if (!confirmou) {
            return;
        }

        limparMensagens();
        setApagandoId(termo.id);

        try {
            const resposta = await fetch(
                `${API_URL}/termos/admin/${encodeURIComponent(
                    termo.id
                )}`,
                {
                    method: "DELETE",
                    headers: headers(),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.detail ||
                    "Não foi possível apagar o termo."
                );
            }

            setMensagem("Termo apagado com sucesso.");

            if (
                termoEditando?.id === termo.id
            ) {
                fecharFormulario();
            }

            await carregarTermos();
            await carregarComercios();

            if (comercioSelecionado) {
                await carregarDetalhesComercio(
                    comercioSelecionado
                );
            }
        } catch (error) {
            console.error(error);
            setErro(error.message);
        } finally {
            setApagandoId(null);
        }
    }

    function renderStatusTermo(termo) {
        if (termo.pendente) {
            return (
                <span className="gerenciar-termos-status gerenciar-termos-status-pendente">
                    Pendente
                </span>
            );
        }

        return (
            <span className="gerenciar-termos-status gerenciar-termos-status-aceito">
                Aceito
            </span>
        );
    }

    return (
        <div className="gerenciar-termos-page">

            <header className="gerenciar-termos-header">

                <div className="gerenciar-termos-header-esquerda">

                    <button
                        type="button"
                        className="gerenciar-termos-voltar"
                        onClick={() => {
                            window.location.href =
                                "/painel-g";
                        }}
                    >
                        ←
                    </button>

                    <div>
                        <span className="gerenciar-termos-overline">
                            ADMINISTRAÇÃO
                        </span>

                        <h1>
                            Termos e condições
                        </h1>

                        <p>
                            Gerencie os termos utilizados
                            pela plataforma e acompanhe
                            as assinaturas dos comércios.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="gerenciar-termos-botao-principal"
                    onClick={abrirNovoTermo}
                >
                    + Novo termo
                </button>

            </header>

            {erro && (
                <div className="gerenciar-termos-alerta gerenciar-termos-alerta-erro">
                    <strong>Erro</strong>
                    <span>{erro}</span>

                    <button
                        type="button"
                        onClick={() => setErro("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {mensagem && (
                <div className="gerenciar-termos-alerta gerenciar-termos-alerta-sucesso">
                    <strong>Sucesso</strong>
                    <span>{mensagem}</span>

                    <button
                        type="button"
                        onClick={() => setMensagem("")}
                    >
                        ×
                    </button>
                </div>
            )}

            <main className="gerenciar-termos-conteudo">

                <section className="gerenciar-termos-resumo">

                    <div className="gerenciar-termos-resumo-card">
                        <span>Termos cadastrados</span>
                        <strong>{termos.length}</strong>
                    </div>

                    <div className="gerenciar-termos-resumo-card">
                        <span>Termos disponíveis</span>
                        <strong>
                            {
                                termos.filter(
                                    termo =>
                                        String(
                                            termo.disponivel
                                        )
                                            .trim()
                                            .toLowerCase() ===
                                        "sim"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="gerenciar-termos-resumo-card">
                        <span>Comércios</span>
                        <strong>{comercios.length}</strong>
                    </div>

                </section>

                <section className="gerenciar-termos-bloco">

                    <div className="gerenciar-termos-bloco-cabecalho">

                        <div>
                            <span className="gerenciar-termos-secao-label">
                                DOCUMENTOS
                            </span>

                            <h2>
                                Termos cadastrados
                            </h2>

                            <p>
                                Edite, ative, desative ou
                                remova versões dos termos.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="gerenciar-termos-botao-secundario"
                            onClick={carregarTermos}
                            disabled={carregando}
                        >
                            {carregando
                                ? "Atualizando..."
                                : "Atualizar"}
                        </button>

                    </div>

                    {carregando ? (
                        <div className="gerenciar-termos-carregando">
                            Carregando termos...
                        </div>
                    ) : termos.length === 0 ? (
                        <div className="gerenciar-termos-vazio">
                            <strong>
                                Nenhum termo cadastrado
                            </strong>

                            <span>
                                Crie o primeiro termo para
                                começar a controlar as
                                versões e assinaturas.
                            </span>

                            <button
                                type="button"
                                onClick={abrirNovoTermo}
                            >
                                Criar primeiro termo
                            </button>
                        </div>
                    ) : (
                        <div className="gerenciar-termos-lista">

                            {termos.map(termo => (
                                <article
                                    key={termo.id}
                                    className="gerenciar-termos-card"
                                >

                                    <div className="gerenciar-termos-card-topo">

                                        <div className="gerenciar-termos-card-identificacao">

                                            <span className="gerenciar-termos-card-id">
                                                TERMO #{termo.id}
                                            </span>

                                            <h3>
                                                {termo.tema ||
                                                    "Sem título"}
                                            </h3>

                                            <span className="gerenciar-termos-card-data">
                                                Atualizado em{" "}
                                                {formatarData(
                                                    termo.data
                                                )}
                                            </span>

                                        </div>

                                        <span
                                            className={
                                                String(
                                                    termo.disponivel
                                                )
                                                    .trim()
                                                    .toLowerCase() ===
                                                    "sim"
                                                    ? "gerenciar-termos-disponibilidade gerenciar-termos-disponibilidade-sim"
                                                    : "gerenciar-termos-disponibilidade gerenciar-termos-disponibilidade-nao"
                                            }
                                        >
                                            {String(
                                                termo.disponivel
                                            )
                                                .trim()
                                                .toLowerCase() ===
                                                "sim"
                                                ? "SIM"
                                                : "NÃO"}
                                        </span>

                                    </div>

                                    <div className="gerenciar-termos-card-preview">
                                        {termo.clausulas || (
                                            <span>
                                                Nenhuma cláusula
                                                cadastrada.
                                            </span>
                                        )}
                                    </div>

                                    <div className="gerenciar-termos-card-acoes">

                                        <button
                                            type="button"
                                            className="gerenciar-termos-acao-editar"
                                            onClick={() =>
                                                abrirEditarTermo(
                                                    termo
                                                )
                                            }
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="gerenciar-termos-acao-apagar"
                                            disabled={
                                                apagandoId ===
                                                termo.id
                                            }
                                            onClick={() =>
                                                apagarTermo(
                                                    termo
                                                )
                                            }
                                        >
                                            {apagandoId ===
                                                termo.id
                                                ? "Apagando..."
                                                : "Apagar"}
                                        </button>

                                    </div>

                                </article>
                            ))}

                        </div>
                    )}

                </section>

                <section className="gerenciar-termos-bloco">

                    <div className="gerenciar-termos-bloco-cabecalho">

                        <div>
                            <span className="gerenciar-termos-secao-label">
                                ASSINATURAS
                            </span>

                            <h2>
                                Comércios
                            </h2>

                            <p>
                                Consulte quais lojas estão
                                com os termos aceitos ou
                                pendentes.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="gerenciar-termos-botao-secundario"
                            onClick={carregarComercios}
                            disabled={
                                carregandoComercios
                            }
                        >
                            {carregandoComercios
                                ? "Atualizando..."
                                : "Atualizar"}
                        </button>

                    </div>

                    {carregandoComercios ? (
                        <div className="gerenciar-termos-carregando">
                            Carregando comércios...
                        </div>
                    ) : comercios.length === 0 ? (
                        <div className="gerenciar-termos-vazio">
                            <strong>
                                Nenhum comércio encontrado
                            </strong>
                        </div>
                    ) : (
                        <div className="gerenciar-termos-comercios">

                            {comercios.map(comercio => (

                                <button
                                    type="button"
                                    key={comercio.id}
                                    className={
                                        comercioSelecionado?.id ===
                                            comercio.id
                                            ? "gerenciar-termos-comercio-card gerenciar-termos-comercio-card-ativo"
                                            : "gerenciar-termos-comercio-card"
                                    }
                                    onClick={() =>
                                        carregarDetalhesComercio(
                                            comercio
                                        )
                                    }
                                >

                                    <div className="gerenciar-termos-comercio-logo">

                                        {obterImagemComercio(
                                            comercio.imagem
                                        ) ? (
                                            <img
                                                src={obterImagemComercio(
                                                    comercio.imagem
                                                )}
                                                alt={
                                                    comercio.nome ||
                                                    "Comércio"
                                                }
                                            />
                                        ) : (
                                            <span>
                                                {(comercio.nome ||
                                                    "C")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}

                                    </div>

                                    <div className="gerenciar-termos-comercio-info">

                                        <strong>
                                            {comercio.nome ||
                                                "Comércio sem nome"}
                                        </strong>

                                        <span>
                                            ID #{comercio.id}
                                        </span>

                                    </div>

                                    <div className="gerenciar-termos-comercio-indicadores">

                                        <div>
                                            <strong>
                                                {
                                                    comercio
                                                        .termos_assinados ??
                                                    0
                                                }
                                            </strong>

                                            <span>
                                                assinados
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                {
                                                    comercio
                                                        .termos_pendentes ??
                                                    0
                                                }
                                            </strong>

                                            <span>
                                                pendentes
                                            </span>
                                        </div>

                                    </div>

                                </button>

                            ))}

                        </div>
                    )}

                </section>

                {comercioSelecionado && (
                    <section className="gerenciar-termos-bloco">

                        <div className="gerenciar-termos-bloco-cabecalho">

                            <div>
                                <span className="gerenciar-termos-secao-label">
                                    DETALHAMENTO
                                </span>

                                <h2>
                                    {comercioSelecionado.nome}
                                </h2>

                                <p>
                                    Situação dos termos para
                                    este comércio.
                                </p>
                            </div>

                        </div>

                        {carregandoDetalhes ? (
                            <div className="gerenciar-termos-carregando">
                                Carregando situação dos termos...
                            </div>
                        ) : !detalhesComercio ? (
                            <div className="gerenciar-termos-vazio">
                                Não foi possível carregar os detalhes.
                            </div>
                        ) : (
                            <div className="gerenciar-termos-detalhes">

                                <div className="gerenciar-termos-detalhes-resumo">

                                    <div>
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {
                                                detalhesComercio
                                                    .total_termos ??
                                                0
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Aceitos
                                        </span>

                                        <strong>
                                            {
                                                detalhesComercio
                                                    .total_assinados ??
                                                0
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Pendentes
                                        </span>

                                        <strong>
                                            {
                                                detalhesComercio
                                                    .total_pendentes ??
                                                0
                                            }
                                        </strong>
                                    </div>

                                </div>

                                <div className="gerenciar-termos-detalhes-lista">

                                    {(detalhesComercio.termos ||
                                        []).map(termo => (

                                            <div
                                                key={termo.id}
                                                className={
                                                    termo.pendente
                                                        ? "gerenciar-termos-detalhe-card gerenciar-termos-detalhe-card-pendente"
                                                        : "gerenciar-termos-detalhe-card"
                                                }
                                            >

                                                <div className="gerenciar-termos-detalhe-principal">

                                                    <div>
                                                        <span>
                                                            TERMO #{termo.id}
                                                        </span>

                                                        <h3>
                                                            {termo.tema}
                                                        </h3>
                                                    </div>

                                                    {renderStatusTermo(
                                                        termo
                                                    )}

                                                </div>

                                                <div className="gerenciar-termos-detalhe-informacoes">

                                                    <div>
                                                        <span>
                                                            Versão publicada
                                                        </span>

                                                        <strong>
                                                            {formatarData(
                                                                termo.data
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Assinatura
                                                        </span>

                                                        <strong>
                                                            {termo.data_assinatura
                                                                ? formatarData(
                                                                    termo.data_assinatura
                                                                )
                                                                : "Ainda não assinado"}
                                                        </strong>
                                                    </div>

                                                </div>

                                            </div>

                                        ))}

                                </div>

                            </div>
                        )}

                    </section>
                )}

            </main>

            {mostrarFormulario && (
                <div
                    className="gerenciar-termos-modal-overlay"
                    onMouseDown={evento => {
                        if (
                            evento.target ===
                            evento.currentTarget
                        ) {
                            fecharFormulario();
                        }
                    }}
                >

                    <div className="gerenciar-termos-modal">

                        <div className="gerenciar-termos-modal-header">

                            <div>
                                <span>
                                    {modoFormulario ===
                                        "editar"
                                        ? "EDITAR TERMO"
                                        : "NOVO TERMO"}
                                </span>

                                <h2>
                                    {modoFormulario ===
                                        "editar"
                                        ? "Editar termos"
                                        : "Adicionar termo"}
                                </h2>

                                <p>
                                    A alteração de um termo
                                    cria uma nova versão pela
                                    atualização da data.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fecharFormulario}
                                disabled={salvando}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="gerenciar-termos-formulario"
                            onSubmit={salvarTermo}
                        >

                            <label>
                                <span>
                                    Tema / título
                                </span>

                                <input
                                    type="text"
                                    value={tema}
                                    onChange={evento =>
                                        setTema(
                                            evento.target.value
                                        )
                                    }
                                    placeholder="Ex.: Termos de Uso da Plataforma"
                                    maxLength={500}
                                    disabled={salvando}
                                />
                            </label>

                            <label>
                                <span>
                                    Disponibilidade
                                </span>

                                <select
                                    value={disponivel}
                                    onChange={evento =>
                                        setDisponivel(
                                            evento.target.value
                                        )
                                    }
                                    disabled={salvando}
                                >
                                    <option value="sim">
                                        SIM
                                    </option>

                                    <option value="nao">
                                        NÃO
                                    </option>
                                </select>
                            </label>

                            <label className="gerenciar-termos-label-clausulas">

                                <div className="gerenciar-termos-label-clausulas-topo">

                                    <span>
                                        Cláusulas
                                    </span>

                                    <small>
                                        As quebras de linha
                                        serão preservadas.
                                    </small>

                                </div>

                                <textarea
                                    value={clausulas}
                                    onChange={evento =>
                                        setClausulas(
                                            evento.target.value
                                        )
                                    }
                                    placeholder={
                                        "Digite o conteúdo completo do termo aqui...\n\n" +
                                        "1. Objetivo\n\n" +
                                        "2. Responsabilidades\n\n" +
                                        "3. Condições de uso"
                                    }
                                    disabled={salvando}
                                    spellCheck="false"
                                />

                            </label>

                            <div className="gerenciar-termos-formulario-acoes">

                                <button
                                    type="button"
                                    className="gerenciar-termos-formulario-cancelar"
                                    onClick={
                                        fecharFormulario
                                    }
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="gerenciar-termos-formulario-salvar"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : modoFormulario ===
                                            "editar"
                                            ? "Salvar alterações"
                                            : "Criar termo"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}