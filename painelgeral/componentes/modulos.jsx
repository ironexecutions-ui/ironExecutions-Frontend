import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../config";
import "./modulos.css"
export default function Modulos() {

    const [comercios, setComercios] = useState([]);
    const [comercioSelecionado, setComercioSelecionado] = useState(null);
    const [modulos, setModulos] = useState([]);

    const [buscaComercio, setBuscaComercio] = useState("");

    const [carregandoComercios, setCarregandoComercios] = useState(true);
    const [carregandoModulos, setCarregandoModulos] = useState(false);

    const [alterandoModulo, setAlterandoModulo] = useState(null);

    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarComercios();
    }, []);

    async function carregarComercios() {

        setCarregandoComercios(true);
        setErro("");

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sessão não encontrada.");
            }

            const resposta = await fetch(
                `${API_URL}/panel/database/modulos/comercios`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados?.detail ||
                    "Não foi possível carregar os comércios."
                );
            }

            setComercios(
                Array.isArray(dados)
                    ? dados
                    : dados?.comercios || []
            );

        } catch (error) {

            console.error(
                "[MODULOS] Erro ao carregar comércios:",
                error
            );

            setErro(
                error.message ||
                "Erro ao carregar os comércios."
            );

        } finally {

            setCarregandoComercios(false);

        }
    }

    async function carregarModulosComercio(comercio) {

        if (!comercio) {
            return;
        }

        setComercioSelecionado(comercio);
        setCarregandoModulos(true);
        setErro("");

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sessão não encontrada.");
            }

            const resposta = await fetch(
                `${API_URL}/panel/database/modulos/comercio/${comercio.id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados?.detail ||
                    "Não foi possível carregar os módulos."
                );
            }

            if (dados?.comercio) {
                setComercioSelecionado(dados.comercio);
            }

            setModulos(
                Array.isArray(dados?.modulos)
                    ? dados.modulos
                    : []
            );

        } catch (error) {

            console.error(
                "[MODULOS] Erro ao carregar módulos:",
                error
            );

            setModulos([]);

            setErro(
                error.message ||
                "Erro ao carregar os módulos."
            );

        } finally {

            setCarregandoModulos(false);

        }
    }

    async function alterarModulo(modulo) {

        if (!comercioSelecionado || !modulo) {
            return;
        }

        const novoStatus =
            Number(modulo.ativo) === 1
                ? 0
                : 1;

        setAlterandoModulo(modulo.id);
        setErro("");

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sessão não encontrada.");
            }

            const resposta = await fetch(
                `${API_URL}/panel/database/modulos`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        comercio_cadastrado_id:
                            comercioSelecionado.id,
                        modulo: modulo.modulo,
                        ativo: novoStatus
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados?.detail ||
                    "Não foi possível alterar o módulo."
                );
            }

            setModulos(lista =>
                lista.map(item =>
                    item.modulo === modulo.modulo
                        ? {
                            ...item,
                            ativo: novoStatus
                        }
                        : item
                )
            );

        } catch (error) {

            console.error(
                "[MODULOS] Erro ao alterar módulo:",
                error
            );

            setErro(
                error.message ||
                "Erro ao alterar o módulo."
            );

        } finally {

            setAlterandoModulo(null);

        }
    }

    const comerciosFiltrados = useMemo(() => {

        const termo = buscaComercio
            .trim()
            .toLowerCase();

        if (!termo) {
            return comercios;
        }

        return comercios.filter(comercio => {

            const loja =
                String(comercio.loja || "")
                    .toLowerCase();

            const cidade =
                String(comercio.cidade || "")
                    .toLowerCase();

            const cnpj =
                String(comercio.cnpj || "")
                    .toLowerCase();

            const id =
                String(comercio.id || "")
                    .toLowerCase();

            return (
                loja.includes(termo) ||
                cidade.includes(termo) ||
                cnpj.includes(termo) ||
                id.includes(termo)
            );

        });

    }, [comercios, buscaComercio]);

    const quantidadeAtivos = useMemo(() => {

        return modulos.filter(
            modulo => Number(modulo.ativo) === 1
        ).length;

    }, [modulos]);

    const quantidadeInativos = useMemo(() => {

        return modulos.length - quantidadeAtivos;

    }, [modulos, quantidadeAtivos]);

    const percentualAtivos = useMemo(() => {

        if (!modulos.length) {
            return 0;
        }

        return Math.round(
            (quantidadeAtivos / modulos.length) * 100
        );

    }, [modulos, quantidadeAtivos]);

    return (
        <section className="painel-modulos-container">

            <header className="painel-modulos-cabecalho">

                <div className="painel-modulos-cabecalho-conteudo">

                    <div className="painel-modulos-cabecalho-icone">
                        <span>⚙</span>
                    </div>

                    <div>

                        <span className="painel-modulos-cabecalho-label">
                            ADMINISTRAÇÃO
                        </span>

                        <h1 className="painel-modulos-titulo">
                            Permissões de módulos
                        </h1>

                        <p className="painel-modulos-subtitulo">
                            Controle quais recursos estão disponíveis
                            para cada comércio.
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    className="painel-modulos-atualizar"
                    onClick={() => {

                        carregarComercios();

                        if (comercioSelecionado) {
                            carregarModulosComercio(
                                comercioSelecionado
                            );
                        }

                    }}
                    disabled={
                        carregandoComercios ||
                        carregandoModulos
                    }
                >

                    <span className="painel-modulos-atualizar-icone">
                        ↻
                    </span>

                    <span>
                        Atualizar
                    </span>

                </button>

            </header>


            {erro && (

                <div className="painel-modulos-erro">

                    <div className="painel-modulos-erro-icone">
                        !
                    </div>

                    <div>
                        <strong>
                            Não foi possível concluir a operação
                        </strong>

                        <span>
                            {erro}
                        </span>
                    </div>

                </div>

            )}


            <div className="painel-modulos-layout">


                <aside className="painel-modulos-comercios">

                    <div className="painel-modulos-comercios-cabecalho">

                        <div>

                            <span className="painel-modulos-comercios-titulo">
                                Comércios
                            </span>

                            <span className="painel-modulos-comercios-contador">
                                {comercios.length}
                            </span>

                        </div>

                        <small>
                            Selecione uma empresa
                        </small>

                    </div>


                    <div className="painel-modulos-busca">

                        <span className="painel-modulos-busca-icone">
                            ⌕
                        </span>

                        <input
                            type="text"
                            value={buscaComercio}
                            onChange={event =>
                                setBuscaComercio(
                                    event.target.value
                                )
                            }
                            placeholder="Buscar comércio..."
                            autoComplete="off"
                        />

                        {buscaComercio && (

                            <button
                                type="button"
                                className="painel-modulos-busca-limpar"
                                onClick={() =>
                                    setBuscaComercio("")
                                }
                            >
                                ×
                            </button>

                        )}

                    </div>


                    <div className="painel-modulos-lista-comercios">

                        {carregandoComercios && (

                            <div className="painel-modulos-carregando">

                                <span className="painel-modulos-spinner" />

                                <span>
                                    Carregando comércios...
                                </span>

                            </div>

                        )}


                        {!carregandoComercios &&
                            comerciosFiltrados.map(comercio => {

                                const selecionado =
                                    comercioSelecionado?.id ===
                                    comercio.id;

                                return (

                                    <button
                                        type="button"
                                        key={comercio.id}
                                        className={
                                            selecionado
                                                ? "painel-modulos-comercio-item painel-modulos-comercio-item-ativo"
                                                : "painel-modulos-comercio-item"
                                        }
                                        onClick={() =>
                                            carregarModulosComercio(
                                                comercio
                                            )
                                        }
                                    >

                                        <div className="painel-modulos-comercio-imagem">

                                            {comercio.imagem ? (

                                                <img
                                                    src={comercio.imagem}
                                                    alt={comercio.loja}
                                                />

                                            ) : (

                                                <span>
                                                    {comercio.loja
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "?"}
                                                </span>

                                            )}

                                        </div>


                                        <div className="painel-modulos-comercio-info">

                                            <strong>
                                                {comercio.loja ||
                                                    "Comércio sem nome"}
                                            </strong>

                                            <span>
                                                #{comercio.id}
                                                {" · "}
                                                {comercio.cidade ||
                                                    "Cidade não informada"}
                                            </span>

                                        </div>


                                        <span className="painel-modulos-comercio-seta">
                                            →
                                        </span>

                                    </button>

                                );

                            })}


                        {!carregandoComercios &&
                            comerciosFiltrados.length === 0 && (

                                <div className="painel-modulos-vazio-pequeno">

                                    <span>
                                        ⌕
                                    </span>

                                    <strong>
                                        Nenhum comércio encontrado
                                    </strong>

                                    <small>
                                        Tente buscar por nome,
                                        cidade ou ID.
                                    </small>

                                </div>

                            )}

                    </div>

                </aside>


                <main className="painel-modulos-area">

                    {!comercioSelecionado && (

                        <div className="painel-modulos-selecione">

                            <div className="painel-modulos-selecione-icone">
                                <span>⚙</span>
                            </div>

                            <span className="painel-modulos-selecione-label">
                                GERENCIAMENTO
                            </span>

                            <h2>
                                Selecione um comércio
                            </h2>

                            <p>
                                Escolha um comércio na lista ao lado
                                para visualizar e administrar as
                                permissões dos módulos.
                            </p>

                        </div>

                    )}


                    {comercioSelecionado && (

                        <div className="painel-modulos-conteudo">


                            <div className="painel-modulos-comercio-cabecalho">

                                <div className="painel-modulos-comercio-identidade">

                                    <div className="painel-modulos-comercio-cabecalho-imagem">

                                        {comercioSelecionado.imagem ? (

                                            <img
                                                src={comercioSelecionado.imagem}
                                                alt={
                                                    comercioSelecionado.loja
                                                }
                                            />

                                        ) : (

                                            <span>
                                                {comercioSelecionado.loja
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "?"}
                                            </span>

                                        )}

                                    </div>


                                    <div className="painel-modulos-comercio-cabecalho-info">

                                        <span>
                                            COMÉRCIO #{comercioSelecionado.id}
                                        </span>

                                        <h2>
                                            {comercioSelecionado.loja ||
                                                "Comércio sem nome"}
                                        </h2>

                                        <p>
                                            {comercioSelecionado.cidade ||
                                                "Cidade não informada"}

                                            {comercioSelecionado.estado
                                                ? `, ${comercioSelecionado.estado}`
                                                : ""}
                                        </p>

                                    </div>

                                </div>


                                <div className="painel-modulos-comercio-indicador">

                                    <span className="painel-modulos-comercio-indicador-ponto" />

                                    <span>
                                        Configuração ativa
                                    </span>

                                </div>

                            </div>


                            <div className="painel-modulos-resumo">

                                <div className="painel-modulos-resumo-card">

                                    <div className="painel-modulos-resumo-card-icone">
                                        ▦
                                    </div>

                                    <div>

                                        <span>
                                            Total de módulos
                                        </span>

                                        <strong>
                                            {modulos.length}
                                        </strong>

                                    </div>

                                </div>


                                <div className="painel-modulos-resumo-card painel-modulos-resumo-ativo">

                                    <div className="painel-modulos-resumo-card-icone">
                                        ✓
                                    </div>

                                    <div>

                                        <span>
                                            Módulos ativos
                                        </span>

                                        <strong>
                                            {quantidadeAtivos}
                                        </strong>

                                    </div>

                                </div>


                                <div className="painel-modulos-resumo-card painel-modulos-resumo-inativo">

                                    <div className="painel-modulos-resumo-card-icone">
                                        ×
                                    </div>

                                    <div>

                                        <span>
                                            Módulos inativos
                                        </span>

                                        <strong>
                                            {quantidadeInativos}
                                        </strong>

                                    </div>

                                </div>


                                <div className="painel-modulos-resumo-card painel-modulos-resumo-percentual">

                                    <div className="painel-modulos-resumo-card-icone">
                                        %
                                    </div>

                                    <div>

                                        <span>
                                            Disponibilidade
                                        </span>

                                        <strong>
                                            {percentualAtivos}%
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            <div className="painel-modulos-secao-titulo">

                                <div>

                                    <span>
                                        PERMISSÕES
                                    </span>

                                    <h3>
                                        Módulos disponíveis
                                    </h3>

                                </div>

                                <small>
                                    {quantidadeAtivos} de{" "}
                                    {modulos.length} ativos
                                </small>

                            </div>


                            {carregandoModulos && (

                                <div className="painel-modulos-carregando-area">

                                    <span className="painel-modulos-spinner painel-modulos-spinner-grande" />

                                    <strong>
                                        Carregando permissões
                                    </strong>

                                    <span>
                                        Buscando os módulos deste comércio...
                                    </span>

                                </div>

                            )}


                            {!carregandoModulos &&
                                modulos.length === 0 && (

                                    <div className="painel-modulos-vazio">

                                        <div className="painel-modulos-vazio-icone">
                                            ▦
                                        </div>

                                        <strong>
                                            Nenhum módulo encontrado
                                        </strong>

                                        <span>
                                            Esse comércio ainda não possui
                                            registros na tabela
                                            <b> modulos_comercio</b>.
                                        </span>

                                    </div>

                                )}


                            {!carregandoModulos &&
                                modulos.length > 0 && (

                                    <div className="painel-modulos-lista">

                                        {modulos.map(modulo => {

                                            const ativo =
                                                Number(modulo.ativo) === 1;

                                            const alterando =
                                                alterandoModulo ===
                                                modulo.id;

                                            return (

                                                <article
                                                    key={modulo.id}
                                                    className={
                                                        ativo
                                                            ? "painel-modulo-card painel-modulo-card-ativo"
                                                            : "painel-modulo-card painel-modulo-card-inativo"
                                                    }
                                                >

                                                    <div className="painel-modulo-card-indicador" />


                                                    <div className="painel-modulo-card-icone">
                                                        {ativo ? "✓" : "○"}
                                                    </div>


                                                    <div className="painel-modulo-card-info">

                                                        <div className="painel-modulo-card-topo">

                                                            <div>

                                                                <span className="painel-modulo-card-label">
                                                                    MÓDULO
                                                                </span>

                                                                <h3>
                                                                    {modulo.modulo}
                                                                </h3>

                                                            </div>


                                                            <span
                                                                className={
                                                                    ativo
                                                                        ? "painel-modulo-status painel-modulo-status-ativo"
                                                                        : "painel-modulo-status painel-modulo-status-inativo"
                                                                }
                                                            >

                                                                <span />

                                                                {ativo
                                                                    ? "ATIVO"
                                                                    : "INATIVO"}

                                                            </span>

                                                        </div>




                                                    </div>


                                                    <button
                                                        type="button"
                                                        className={
                                                            ativo
                                                                ? "painel-modulo-acao painel-modulo-acao-desativar"
                                                                : "painel-modulo-acao painel-modulo-acao-ativar"
                                                        }
                                                        disabled={
                                                            alterandoModulo !== null
                                                        }
                                                        onClick={() =>
                                                            alterarModulo(
                                                                modulo
                                                            )
                                                        }
                                                    >

                                                        {alterando ? (

                                                            <>
                                                                <span className="painel-modulos-spinner pequeno" />
                                                                Salvando
                                                            </>

                                                        ) : (

                                                            ativo
                                                                ? "Desativar módulo"
                                                                : "Ativar módulo"

                                                        )}

                                                    </button>

                                                </article>

                                            );

                                        })}

                                    </div>

                                )}

                        </div>

                    )}

                </main>

            </div>

        </section>
    );
}