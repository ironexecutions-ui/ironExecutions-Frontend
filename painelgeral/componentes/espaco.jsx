
import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";
import EspacoCalculo from "./calculo";
import "./espaco.css";

export default function Espaco() {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [aba, setAba] = useState("calculo");

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [tabelas, setTabelas] = useState([]);
    const [colunas, setColunas] = useState([]);
    const [regras, setRegras] = useState([]);

    // Formulário de regras
    const [tabelaSelecionada, setTabelaSelecionada] = useState("");
    const [colunaComercio, setColunaComercio] = useState("");
    const [colunasArquivos, setColunasArquivos] = useState([]);

    const token = localStorage.getItem("token");
    // Espaço por comércio
    const [comercios, setComercios] = useState([]);
    const [buscaComercio, setBuscaComercio] = useState("");
    const [comercioSelecionado, setComercioSelecionado] = useState(null);
    const [gbComercio, setGbComercio] = useState("1");
    const [carregandoComercios, setCarregandoComercios] = useState(false);
    const [salvandoEspacoComercio, setSalvandoEspacoComercio] = useState(false);

    // =====================================================
    // REQUISIÇÃO PADRÃO
    // =====================================================

    const requisicao = useCallback(async (rota, opcoes = {}) => {

        const resposta = await fetch(`${API_URL}/espaco${rota}`, {
            ...opcoes,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...(opcoes.headers || {})
            }
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                dados.detail || "Erro ao realizar operação"
            );
        }

        return dados;

    }, [token]);

    // =====================================================
    // CARREGAR TABELAS
    // =====================================================

    const carregarTabelas = useCallback(async () => {

        try {

            const dados = await requisicao("/tabelas");

            setTabelas(dados.tabelas || []);

        } catch (e) {

            setErro(e.message);

        }

    }, [requisicao]);

    // =====================================================
    // CARREGAR REGRAS
    // =====================================================

    const carregarRegras = useCallback(async () => {

        try {

            const dados = await requisicao("/regras");

            setRegras(dados.regras || []);

        } catch (e) {

            setErro(e.message);

        }

    }, [requisicao]);

    // =====================================================
    // CARREGAR COLUNAS DA TABELA
    // =====================================================

    const carregarColunas = useCallback(async (tabela) => {

        if (!tabela) {
            setColunas([]);
            setColunaComercio("");
            setColunasArquivos([]);
            return;
        }

        try {

            const dados = await requisicao(
                `/colunas/${encodeURIComponent(tabela)}`
            );

            const lista = dados.colunas || [];

            setColunas(lista);

            const possuiComercio = lista.some(
                coluna => coluna.nome === "comercio_id"
            );

            setColunaComercio(
                possuiComercio ? "comercio_id" : ""
            );

            setColunasArquivos([]);

        } catch (e) {

            setErro(e.message);
            setColunas([]);
            setColunaComercio("");
            setColunasArquivos([]);

        }

    }, [requisicao]);

    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    useEffect(() => {

        carregarTabelas();
        carregarRegras();

    }, [carregarTabelas, carregarRegras]);

    // =====================================================
    // SELECIONAR TABELA
    // =====================================================

    const selecionarTabela = (valor) => {

        setTabelaSelecionada(valor);
        setErro("");
        setSucesso("");

        if (tabelas.includes(valor)) {
            carregarColunas(valor);
        } else {
            setColunas([]);
            setColunaComercio("");
            setColunasArquivos([]);
        }

    };

    // =====================================================
    // SELECIONAR COLUNAS DE ARQUIVOS
    // =====================================================

    const alternarColunaArquivo = (nome) => {

        setColunasArquivos(anterior => {

            if (anterior.includes(nome)) {
                return anterior.filter(item => item !== nome);
            }

            return [...anterior, nome];

        });

    };

    // =====================================================
    // SALVAR REGRA
    // =====================================================

    const salvarRegra = async (e) => {

        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!tabelaSelecionada) {
            setErro("Selecione uma tabela.");
            return;
        }

        if (!tabelas.includes(tabelaSelecionada)) {
            setErro("Selecione uma tabela existente na lista.");
            return;
        }

        if (!colunaComercio) {
            setErro("Selecione a coluna que identifica o comércio.");
            return;
        }

        try {

            setSalvando(true);

            await requisicao("/regras", {
                method: "POST",
                body: JSON.stringify({
                    tabela: tabelaSelecionada,
                    onde_comercio: colunaComercio,
                    onde_arquivos: colunasArquivos
                })
            });

            setSucesso("Regra cadastrada com sucesso!");

            setTabelaSelecionada("");
            setColunaComercio("");
            setColunasArquivos([]);
            setColunas([]);

            await carregarRegras();
            await carregarTabelas();

        } catch (e) {

            setErro(e.message);

        } finally {

            setSalvando(false);

        }

    };

    // =====================================================
    // LIMPAR FORMULÁRIO
    // =====================================================

    const limparFormulario = () => {

        setTabelaSelecionada("");
        setColunas([]);
        setColunaComercio("");
        setColunasArquivos([]);
        setErro("");
        setSucesso("");

    };
    const carregarComercios = useCallback(async (busca = "") => {
        try {
            setCarregandoComercios(true);

            const dados = await requisicao(
                `/empresas?busca=${encodeURIComponent(busca)}`
            );

            setComercios(dados.comercios || []);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregandoComercios(false);
        }
    }, [requisicao]);


    const salvarEspacoComercio = async (e) => {
        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!comercioSelecionado) {
            setErro("Selecione uma empresa.");
            return;
        }

        const quantidade = Number(gbComercio);

        if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
            setErro("Informe uma quantidade inteira de GB, sem casas decimais.");
            return;
        }

        try {
            setSalvandoEspacoComercio(true);

            await requisicao("/comercio/espaco", {
                method: "POST",
                body: JSON.stringify({
                    comercio_id: comercioSelecionado.id,
                    espaco_gb: quantidade
                })
            });

            setSucesso(
                `Limite de ${quantidade} GB salvo para ${comercioSelecionado.loja}.`
            );

            await carregarComercios(buscaComercio);

        } catch (e) {
            setErro(e.message);
        } finally {
            setSalvandoEspacoComercio(false);
        }
    };
    // =====================================================
    // RENDERIZAÇÃO
    // =====================================================

    return (

        <main className="espaco-page">

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <header className="espaco-header">

                <div>

                    <span className="espaco-eyebrow">
                        IRON EXECUTIONS
                    </span>

                    <h1>Gerenciamento de espaço</h1>

                    <p>
                        Controle de armazenamento e regras das tabelas do sistema.
                    </p>

                </div>

                <button
                    className="espaco-refresh"
                    onClick={() => {

                        if (aba === "calculo") {
                            // O componente de cálculo possui sua própria atualização.
                            window.dispatchEvent(
                                new Event("atualizar-espaco-calculo")
                            );
                        } else {
                            carregarRegras();
                            carregarTabelas();
                        }

                    }}
                >
                    ↻ Atualizar dados
                </button>

            </header>

            {/* =================================================
                ABAS
            ================================================= */}

            <nav className="espaco-tabs">

                <button
                    className={aba === "calculo" ? "ativo" : ""}
                    onClick={() => {
                        setAba("calculo");
                        setErro("");
                        setSucesso("");
                    }}
                >
                    Cálculo de espaço
                </button>

                <button
                    className={aba === "regras" ? "ativo" : ""}
                    onClick={() => {
                        setAba("regras");
                        setErro("");
                        setSucesso("");
                    }}
                >
                    Regras de armazenamento
                </button>
                <button
                    className={aba === "comercios" ? "ativo" : ""}
                    onClick={() => {
                        setAba("comercios");
                        setErro("");
                        setSucesso("");
                        carregarComercios("");
                    }}
                >
                    Espaços por comércio
                </button>

            </nav>

            {/* =================================================
                ABA DE CÁLCULO
                COMPONENTE SEPARADO
            ================================================= */}

            {aba === "calculo" && (

                <EspacoCalculo />

            )}

            {/* =================================================
                MENSAGENS DA ABA DE REGRAS
            ================================================= */}

            {(aba === "regras" || aba === "comercios") && erro && (
                <div className="espaco-alerta erro">

                    {erro}

                    <button onClick={() => setErro("")}>
                        ×
                    </button>

                </div>

            )}

            {(aba === "regras" || aba === "comercios") && sucesso && (
                <div className="espaco-alerta sucesso">

                    {sucesso}

                    <button onClick={() => setSucesso("")}>
                        ×
                    </button>

                </div>

            )}

            {/* =================================================
                ABA DE REGRAS
                CADASTRO DE TABELAS
            ================================================= */}

            {aba === "regras" && (

                <section className="espaco-regras">

                    <div className="espaco-section-title">

                        <div>

                            <h2>Regras das tabelas</h2>

                            <p>
                                Defina onde estão os identificadores dos
                                comércios e os arquivos.
                            </p>

                        </div>

                    </div>

                    {/* FORMULÁRIO */}

                    <form
                        className="espaco-formulario"
                        onSubmit={salvarRegra}
                    >

                        <div className="espaco-form-header">

                            <h3>Adicionar nova regra</h3>

                            <p>
                                Escolha uma tabela do banco de dados.
                            </p>

                        </div>

                        {/* TABELA */}

                        <div className="espaco-campo">

                            <label>
                                Tabela do sistema
                            </label>

                            <input
                                list="espaco-lista-tabelas"
                                value={tabelaSelecionada}
                                onChange={e => selecionarTabela(e.target.value)}
                                placeholder="Digite ou selecione uma tabela..."
                                autoComplete="off"
                            />

                            <datalist id="espaco-lista-tabelas">

                                {tabelas.map(tabela => (

                                    <option
                                        key={tabela}
                                        value={tabela}
                                    />

                                ))}

                            </datalist>

                        </div>

                        {/* COLUNA DO COMÉRCIO */}

                        {tabelaSelecionada && (

                            <div className="espaco-campo">

                                <label>
                                    Coluna que identifica o comércio
                                </label>

                                {colunas.some(
                                    coluna => coluna.nome === "comercio_id"
                                ) ? (

                                    <div className="espaco-comercio-detectado">

                                        <span>✓</span>

                                        Coluna comercio_id identificada automaticamente.

                                        <strong>comercio_id</strong>

                                    </div>

                                ) : (

                                    <>

                                        <select
                                            value={colunaComercio}
                                            onChange={e =>
                                                setColunaComercio(e.target.value)
                                            }
                                        >

                                            <option value="">
                                                Selecione a coluna...
                                            </option>

                                            {colunas.map(coluna => (

                                                <option
                                                    key={coluna.nome}
                                                    value={coluna.nome}
                                                >
                                                    {coluna.nome} ({coluna.tipo})
                                                </option>

                                            ))}

                                        </select>

                                        <small>
                                            Essa tabela não possui comercio_id.
                                            Identifique manualmente a coluna
                                            que guarda o ID do comércio.
                                        </small>

                                    </>

                                )}

                            </div>

                        )}

                        {/* COLUNAS DE ARQUIVOS */}

                        {tabelaSelecionada && (

                            <div className="espaco-campo">

                                <label>
                                    Colunas que guardam links de arquivos
                                </label>

                                <p className="espaco-campo-descricao">
                                    Opcional. Você pode selecionar várias
                                    colunas ou deixar vazio.
                                </p>

                                <div className="espaco-arquivos-lista">

                                    {colunas.map(coluna => (

                                        <label
                                            className={`espaco-arquivo-opcao ${colunasArquivos.includes(coluna.nome)
                                                ? "selecionado"
                                                : ""
                                                }`}
                                            key={coluna.nome}
                                        >

                                            <input
                                                type="checkbox"
                                                checked={colunasArquivos.includes(coluna.nome)}
                                                onChange={() =>
                                                    alternarColunaArquivo(coluna.nome)
                                                }
                                            />

                                            <span>
                                                {coluna.nome}
                                            </span>

                                            <small>
                                                {coluna.tipo}
                                            </small>

                                        </label>

                                    ))}

                                </div>

                                <small>
                                    {colunasArquivos.length} colunas selecionadas.
                                    Serão armazenadas separadas por ||.
                                </small>

                            </div>

                        )}

                        {/* COLUNA DE ESPAÇO */}

                        {tabelaSelecionada && (

                            <div className="espaco-info-coluna">

                                <div>

                                    <span>
                                        Coluna de armazenamento
                                    </span>

                                    <strong>
                                        espaco_guardado_pronto
                                    </strong>

                                </div>

                                <p>
                                    O sistema verificará automaticamente
                                    se essa coluna existe na tabela.
                                    Caso não exista, será criada com capacidade
                                    para até 15 dígitos.
                                </p>

                            </div>

                        )}

                        {/* BOTÕES */}

                        <div className="espaco-form-acoes">

                            <button
                                type="button"
                                className="espaco-btn-secundario"
                                onClick={limparFormulario}
                            >
                                Limpar
                            </button>

                            <button
                                type="submit"
                                className="espaco-btn-salvar"
                                disabled={salvando || !tabelaSelecionada}
                            >
                                {salvando
                                    ? "Salvando..."
                                    : "Salvar regra"
                                }
                            </button>

                        </div>

                    </form>

                    {/* REGRAS CADASTRADAS */}

                    <div className="espaco-regras-cadastradas">

                        <div className="espaco-section-title">

                            <div>

                                <h3>Regras cadastradas</h3>

                                <p>
                                    Tabelas configuradas para monitoramento.
                                </p>

                            </div>

                            <span className="espaco-counter">
                                {regras.length} regras
                            </span>

                        </div>

                        {regras.length === 0 ? (

                            <div className="espaco-empty">

                                <h3>Nenhuma regra cadastrada</h3>

                                <p>
                                    Adicione sua primeira regra acima.
                                </p>

                            </div>

                        ) : (

                            <div className="espaco-regras-lista">

                                {regras.map(regra => (

                                    <article
                                        className="espaco-regra-card"
                                        key={regra.id}
                                    >

                                        <div className="espaco-regra-topo">

                                            <div>

                                                <span>
                                                    #{regra.id}
                                                </span>

                                                <h4>
                                                    {regra.tabela}
                                                </h4>

                                            </div>

                                            <span className="espaco-regra-status">
                                                Configurada
                                            </span>

                                        </div>

                                        <div className="espaco-regra-detalhes">

                                            <div>

                                                <small>
                                                    Identificador do comércio
                                                </small>

                                                <strong>
                                                    {regra.onde_comercio}
                                                </strong>

                                            </div>

                                            <div>

                                                <small>
                                                    Colunas de arquivos
                                                </small>

                                                <strong>
                                                    {regra.onde_arquivos?.length
                                                        ? regra.onde_arquivos.join(", ")
                                                        : "Não configuradas"
                                                    }
                                                </strong>

                                            </div>

                                            <div>

                                                <small>
                                                    Coluna de espaço
                                                </small>

                                                <strong>
                                                    espaco_guardado_pronto
                                                </strong>

                                            </div>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        )}

                    </div>

                </section>

            )}
            {aba === "comercios" && (
                <section className="espaco-comercios-painel">

                    <div className="espaco-section-title">
                        <div>
                            <h2>Espaços por comércio</h2>
                            <p>
                                Pesquise uma empresa e configure seu limite de armazenamento.
                            </p>
                        </div>
                    </div>

                    <div className="espaco-comercios-layout">

                        <div className="espaco-comercios-lista">

                            <div className="espaco-campo">
                                <label htmlFor="espaco-busca-comercio">
                                    Pesquisar empresa
                                </label>

                                <input
                                    id="espaco-busca-comercio"
                                    type="search"
                                    value={buscaComercio}
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        setBuscaComercio(valor);
                                        carregarComercios(valor);
                                    }}
                                    placeholder="Digite o nome da empresa..."
                                    autoComplete="off"
                                />
                            </div>

                            {carregandoComercios ? (
                                <div className="espaco-comercios-vazio">
                                    Carregando empresas...
                                </div>
                            ) : comercios.length === 0 ? (
                                <div className="espaco-comercios-vazio">
                                    Nenhuma empresa encontrada.
                                </div>
                            ) : (
                                <div className="espaco-comercios-resultados">

                                    {comercios.map((comercio) => (
                                        <button
                                            type="button"
                                            className={`espaco-comercio-item ${comercioSelecionado?.id === comercio.id
                                                ? "selecionado"
                                                : ""
                                                }`}
                                            key={comercio.id}
                                            onClick={() => {
                                                setComercioSelecionado(comercio);
                                                setGbComercio(
                                                    String(comercio.espaco_gb || 0)
                                                );
                                                setErro("");
                                                setSucesso("");
                                            }}
                                        >

                                            <span className="espaco-comercio-logo">
                                                {comercio.imagem ? (
                                                    <img
                                                        src={comercio.imagem}
                                                        alt={`Logo de ${comercio.loja}`}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <span>
                                                        {(comercio.loja || "E")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </span>

                                            <span className="espaco-comercio-identificacao">
                                                <strong>{comercio.loja}</strong>
                                                <small>Comércio #{comercio.id}</small>
                                            </span>

                                            <span className="espaco-comercio-limite">
                                                {comercio.espaco_gb} GB
                                            </span>

                                        </button>
                                    ))}

                                </div>
                            )}

                        </div>

                        <form
                            className="espaco-comercio-editor"
                            onSubmit={salvarEspacoComercio}
                        >

                            <div className="espaco-comercio-editor-topo">
                                <div>
                                    <h3>Definir armazenamento</h3>
                                    <p>
                                        Configure a capacidade disponível para a empresa.
                                    </p>
                                </div>
                            </div>

                            {comercioSelecionado ? (
                                <>

                                    <div className="espaco-comercio-selecionado">

                                        <span className="espaco-comercio-logo grande">
                                            {comercioSelecionado.imagem ? (
                                                <img
                                                    src={comercioSelecionado.imagem}
                                                    alt={`Logo de ${comercioSelecionado.loja}`}
                                                />
                                            ) : (
                                                <span>
                                                    {(comercioSelecionado.loja || "E")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </span>

                                        <div>
                                            <strong>{comercioSelecionado.loja}</strong>
                                            <small>
                                                Comércio #{comercioSelecionado.id}
                                            </small>
                                        </div>

                                    </div>

                                    <div className="espaco-campo">
                                        <label htmlFor="espaco-limite-gb">
                                            Limite de armazenamento
                                        </label>

                                        <div className="espaco-comercio-input-gb">
                                            <input
                                                id="espaco-limite-gb"
                                                type="number"
                                                min="0"
                                                step="1"
                                                inputMode="numeric"

                                                onChange={(e) => setGbComercio(e.target.value)}
                                                required
                                            />

                                            <span>GB</span>
                                        </div>

                                        <small>
                                            Digite somente números inteiros, como 1, 5, 10 ou 20.
                                        </small>
                                    </div>

                                    <div className="espaco-comercio-aviso">
                                        O novo limite será salvo para este comércio.
                                    </div>

                                    <button
                                        type="submit"
                                        className="espaco-comercio-salvar"
                                        disabled={salvandoEspacoComercio}
                                    >
                                        {salvandoEspacoComercio
                                            ? "Salvando..."
                                            : "Salvar limite de armazenamento"}
                                    </button>

                                </>
                            ) : (
                                <div className="espaco-comercio-escolha">
                                    <strong>Nenhuma empresa selecionada</strong>
                                    <p>
                                        Pesquise e selecione uma empresa na lista para
                                        configurar seu limite de GB.
                                    </p>
                                </div>
                            )}

                        </form>

                    </div>

                </section>
            )}
        </main>

    );

}
