import React, { useEffect, useMemo, useState } from "react";

import { API_URL } from "../../../../../config";

import "./pendencias.css";

export default function Pendencias() {
    const [pendencias, setPendencias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [buscandoVenda, setBuscandoVenda] = useState(false);
    const [registrando, setRegistrando] = useState(false);
    const [alterandoStatus, setAlterandoStatus] = useState(null);

    const [protocolo, setProtocolo] = useState("");
    const [nomeCliente, setNomeCliente] = useState("");
    const [vendaEncontrada, setVendaEncontrada] = useState(null);

    const [filtroStatus, setFiltroStatus] = useState("");
    const [filtroCliente, setFiltroCliente] = useState("");
    const [mensagem, setMensagem] = useState(null);

    const token = localStorage.getItem("token") || "";


    function mostrarMensagem(tipo, texto) {
        setMensagem({
            tipo,
            texto
        });
    }


    function obterMensagemErro(dados, padrao) {
        if (typeof dados?.detail === "string") {
            return dados.detail;
        }

        return padrao;
    }


    function formatarDinheiro(valor) {
        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    function formatarData(data) {
        if (!data) {
            return "Não informada";
        }

        const somenteData = String(data).slice(0, 10);
        const partes = somenteData.split("-");

        if (partes.length !== 3) {
            return data;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }


    async function carregarPendencias() {
        try {
            setCarregando(true);

            const resposta = await fetch(
                `${API_URL}/admin/pendencias/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    obterMensagemErro(
                        dados,
                        "Não foi possível carregar as pendências"
                    )
                );
            }

            setPendencias(
                Array.isArray(dados)
                    ? dados
                    : []
            );
        } catch (erro) {
            console.error(
                "[PENDÊNCIAS] Erro ao carregar:",
                erro
            );

            mostrarMensagem(
                "erro",
                erro.message
            );

            setPendencias([]);
        } finally {
            setCarregando(false);
        }
    }


    useEffect(() => {
        carregarPendencias();
    }, []);


    async function buscarVenda(evento) {
        evento?.preventDefault();

        setMensagem(null);
        setVendaEncontrada(null);

        const vendaId = Number(protocolo);

        if (!vendaId || vendaId <= 0) {
            mostrarMensagem(
                "erro",
                "Informe um protocolo válido"
            );

            return;
        }

        try {
            setBuscandoVenda(true);

            const resposta = await fetch(
                `${API_URL}/admin/pendencias/buscar-venda/${vendaId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    obterMensagemErro(
                        dados,
                        "Venda não encontrada"
                    )
                );
            }

            setVendaEncontrada(dados);

            if (dados.ja_registrada) {
                mostrarMensagem(
                    "erro",
                    "Essa venda já está registrada nas pendências"
                );
            } else {
                mostrarMensagem(
                    "sucesso",
                    "Venda encontrada. Informe o nome do cliente."
                );
            }
        } catch (erro) {
            console.error(
                "[PENDÊNCIAS] Erro ao buscar venda:",
                erro
            );

            mostrarMensagem(
                "erro",
                erro.message
            );
        } finally {
            setBuscandoVenda(false);
        }
    }


    async function registrarPendencia() {
        setMensagem(null);

        if (!vendaEncontrada) {
            mostrarMensagem(
                "erro",
                "Busque uma venda antes de registrar"
            );

            return;
        }

        if (vendaEncontrada.ja_registrada) {
            mostrarMensagem(
                "erro",
                "Essa venda já está registrada"
            );

            return;
        }

        if (nomeCliente.trim().length < 2) {
            mostrarMensagem(
                "erro",
                "Informe o nome do cliente"
            );

            return;
        }

        try {
            setRegistrando(true);

            const resposta = await fetch(
                `${API_URL}/admin/pendencias/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        venda_id: vendaEncontrada.venda_id,
                        nome_cliente: nomeCliente.trim()
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    obterMensagemErro(
                        dados,
                        "Não foi possível registrar a pendência"
                    )
                );
            }

            mostrarMensagem(
                "sucesso",
                "Pendência registrada com sucesso"
            );

            setProtocolo("");
            setNomeCliente("");
            setVendaEncontrada(null);

            await carregarPendencias();
        } catch (erro) {
            console.error(
                "[PENDÊNCIAS] Erro ao registrar:",
                erro
            );

            mostrarMensagem(
                "erro",
                erro.message
            );
        } finally {
            setRegistrando(false);
        }
    }


    async function alterarStatus(pendencia, novoStatus) {
        try {
            setAlterandoStatus(pendencia.id);
            setMensagem(null);

            const resposta = await fetch(
                `${API_URL}/admin/pendencias/${pendencia.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: novoStatus
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    obterMensagemErro(
                        dados,
                        "Não foi possível atualizar o status"
                    )
                );
            }

            setPendencias(listaAtual =>
                listaAtual.map(item =>
                    item.id === pendencia.id
                        ? dados.pendencia
                        : item
                )
            );

            mostrarMensagem(
                "sucesso",
                "Status atualizado com sucesso"
            );
        } catch (erro) {
            console.error(
                "[PENDÊNCIAS] Erro ao alterar status:",
                erro
            );

            mostrarMensagem(
                "erro",
                erro.message
            );
        } finally {
            setAlterandoStatus(null);
        }
    }


    function abrirComprovante(link) {
        if (!link) {
            mostrarMensagem(
                "erro",
                "Essa venda não possui comprovante"
            );

            return;
        }

        window.open(
            link,
            "_blank",
            "noopener,noreferrer"
        );
    }


    async function abrirNotaFiscal(pendencia) {
        if (!pendencia.nota_fiscal_url) {
            mostrarMensagem(
                "erro",
                "Essa venda não possui nota fiscal autorizada"
            );

            return;
        }

        try {
            const resposta = await fetch(
                `${API_URL}${pendencia.nota_fiscal_url}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                let mensagemErro =
                    "Não foi possível abrir a nota fiscal";

                try {
                    const dados = await resposta.json();

                    mensagemErro = obterMensagemErro(
                        dados,
                        mensagemErro
                    );
                } catch {
                    console.warn(
                        "[PENDÊNCIAS] Resposta do DANFE não é JSON"
                    );
                }

                throw new Error(mensagemErro);
            }

            const arquivo = await resposta.blob();
            const urlTemporaria = URL.createObjectURL(arquivo);

            window.open(
                urlTemporaria,
                "_blank",
                "noopener,noreferrer"
            );

            setTimeout(() => {
                URL.revokeObjectURL(urlTemporaria);
            }, 60000);
        } catch (erro) {
            console.error(
                "[PENDÊNCIAS] Erro ao abrir DANFE:",
                erro
            );

            mostrarMensagem(
                "erro",
                erro.message
            );
        }
    }

    const clientesConhecidos = useMemo(() => {
        const clientesUnicos = new Map();

        pendencias.forEach(pendencia => {
            const nome = String(
                pendencia.nome_cliente || ""
            ).trim();

            if (!nome) {
                return;
            }

            const chave = nome.toLocaleLowerCase(
                "pt-BR"
            );

            if (!clientesUnicos.has(chave)) {
                clientesUnicos.set(chave, nome);
            }
        });

        return Array
            .from(clientesUnicos.values())
            .sort((clienteA, clienteB) =>
                clienteA.localeCompare(
                    clienteB,
                    "pt-BR",
                    {
                        sensitivity: "base"
                    }
                )
            );
    }, [pendencias]);
    const pendenciasFiltradas = useMemo(() => {
        const clienteBuscado = filtroCliente
            .trim()
            .toLocaleLowerCase("pt-BR");

        const listaFiltrada = pendencias.filter(
            pendencia => {
                if (
                    filtroStatus &&
                    pendencia.status !== filtroStatus
                ) {
                    return false;
                }

                if (clienteBuscado) {
                    const nomeClientePendencia = String(
                        pendencia.nome_cliente || ""
                    ).toLocaleLowerCase("pt-BR");

                    if (
                        !nomeClientePendencia.includes(
                            clienteBuscado
                        )
                    ) {
                        return false;
                    }
                }

                return true;
            }
        );

        return [...listaFiltrada].sort(
            (pendenciaA, pendenciaB) => {
                /*
                    Pendentes recebem prioridade 0.
    
                    Pagos e cancelados recebem prioridade 1,
                    portanto ficam embaixo de todos os pendentes.
                */

                const prioridadeA =
                    pendenciaA.status === "pendente"
                        ? 0
                        : 1;

                const prioridadeB =
                    pendenciaB.status === "pendente"
                        ? 0
                        : 1;

                if (prioridadeA !== prioridadeB) {
                    return prioridadeA - prioridadeB;
                }

                /*
                    Lista invertida dentro de cada grupo.
    
                    IDs menores aparecem primeiro.
                    IDs maiores aparecem depois.
                */

                return (
                    Number(pendenciaB.id) -
                    Number(pendenciaA.id)
                );
            }
        );
    }, [
        pendencias,
        filtroStatus,
        filtroCliente
    ]);

    const totalPendente = useMemo(() => {
        return pendencias
            .filter(
                item =>
                    item.status === "pendente" &&
                    Number(item.pago) !== 1
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(item.valor_venda || 0),
                0
            );
    }, [pendencias]);


    const quantidadePendentes = pendencias.filter(
        item =>
            item.status === "pendente" &&
            Number(item.pago) !== 1
    ).length;


    const quantidadePagas = pendencias.filter(
        item =>
            item.status === "pago" ||
            Number(item.pago) === 1
    ).length;

    async function colarProtocoloCopiado() {
        try {
            if (
                !navigator.clipboard ||
                !window.isSecureContext
            ) {
                return;
            }

            const textoCopiado =
                await navigator.clipboard.readText();

            const protocoloCopiado =
                String(textoCopiado || "")
                    .trim()
                    .replace("#", "");

            const protocoloValido =
                /^\d{4,5}$/.test(protocoloCopiado);

            if (!protocoloValido) {
                return;
            }

            setProtocolo(protocoloCopiado);
            setVendaEncontrada(null);

        } catch (erro) {
            console.warn(
                "[PENDÊNCIAS] Não foi possível ler o conteúdo copiado:",
                erro
            );
        }
    }
    return (
        <section className="pendencias-administracao-pagina">


            <header className="pendencias-administracao-cabecalho">
                <div>
                    <h2>
                        Pendências de clientes
                    </h2>

                    <p>
                        Registre vendas ainda não pagas e acompanhe os documentos.
                    </p>
                </div>

                <div className="pendencias-administracao-resumo">
                    <div className="pendencias-administracao-indicador">
                        <span>Pendentes</span>
                        <strong>{quantidadePendentes}</strong>
                    </div>

                    <div className="pendencias-administracao-indicador">
                        <span>Pagas</span>
                        <strong>{quantidadePagas}</strong>
                    </div>

                    <div className="pendencias-administracao-indicador">
                        <span>A receber</span>
                        <strong>
                            {formatarDinheiro(totalPendente)}
                        </strong>
                    </div>
                </div>
            </header>

            {mensagem && (
                <div
                    className={
                        `pendencias-administracao-aviso ` +
                        `pendencias-administracao-aviso-${mensagem.tipo}`
                    }
                >
                    {mensagem.texto}
                </div>
            )}

            <form
                className="pendencias-administracao-formulario"
                onSubmit={buscarVenda}
            >
                <h3>
                    Registrar nova pendência
                </h3>

                <div className="pendencias-administracao-campos">
                    <div className="pendencias-administracao-campo">
                        <label htmlFor="pendencia-protocolo-venda">
                            Protocolo da venda
                        </label>

                        <input
                            id="pendencia-protocolo-venda"
                            type="number"
                            min="1"
                            placeholder="Clique para colar o protocolo"
                            value={protocolo}
                            onClick={colarProtocoloCopiado}
                            onChange={evento => {
                                setProtocolo(
                                    evento.target.value
                                );

                                setVendaEncontrada(null);
                            }}
                        />
                    </div>

                    <div className="pendencias-administracao-campo">
                        <label htmlFor="pendencia-nome-cliente">
                            Nome do cliente
                        </label>

                        <input
                            id="pendencia-nome-cliente"
                            type="text"
                            maxLength="255"
                            list="pendencias-clientes-cadastrados"
                            autoComplete="off"
                            placeholder="Digite ou selecione um cliente"
                            value={nomeCliente}
                            onChange={evento =>
                                setNomeCliente(evento.target.value)
                            }
                        />

                        <datalist id="pendencias-clientes-cadastrados">
                            {clientesConhecidos.map(cliente => (
                                <option
                                    key={cliente.toLocaleLowerCase("pt-BR")}
                                    value={cliente}
                                />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div className="pendencias-administracao-acoes-formulario">
                    <button
                        type="submit"
                        className="pendencias-administracao-botao-buscar"
                        disabled={buscandoVenda}
                    >
                        {buscandoVenda
                            ? "Buscando..."
                            : "Buscar venda"
                        }
                    </button>

                    <button
                        type="button"
                        className="pendencias-administracao-botao-registrar"
                        disabled={
                            !vendaEncontrada ||
                            vendaEncontrada.ja_registrada ||
                            registrando
                        }
                        onClick={registrarPendencia}
                    >
                        {registrando
                            ? "Registrando..."
                            : "Registrar pendência"
                        }
                    </button>
                </div>

                {vendaEncontrada && (
                    <div className="pendencias-administracao-venda-encontrada">
                        <div className="pendencias-administracao-dado-venda">
                            <span>Protocolo</span>
                            <strong>
                                #{vendaEncontrada.venda_id}
                            </strong>
                        </div>

                        <div className="pendencias-administracao-dado-venda">
                            <span>Valor</span>
                            <strong>
                                {formatarDinheiro(
                                    vendaEncontrada.valor_venda
                                )}
                            </strong>
                        </div>

                        <div className="pendencias-administracao-dado-venda">
                            <span>Data</span>
                            <strong>
                                {formatarData(
                                    vendaEncontrada.data_venda
                                )}
                            </strong>
                        </div>

                        <div className="pendencias-administracao-dado-venda">
                            <span>Operador</span>
                            <strong>
                                {vendaEncontrada.operador}
                            </strong>
                        </div>

                        <div className="pendencias-administracao-dado-venda">
                            <span>Status da venda</span>
                            <strong>
                                {vendaEncontrada.venda_status || "Sem status"}
                            </strong>
                        </div>

                        <div className="pendencias-administracao-dado-venda">
                            <span>Comprovante</span>
                            <strong>
                                {vendaEncontrada.comprovante_url
                                    ? "Disponível"
                                    : "Não disponível"
                                }
                            </strong>
                        </div>

                        <div className="pendencias-administracao-dado-venda">
                            <span>Nota fiscal</span>
                            <strong>
                                {vendaEncontrada.nota_fiscal_id
                                    ? `NFC-e ${vendaEncontrada.numero_nfce}`
                                    : "Não emitida"
                                }
                            </strong>
                        </div>
                    </div>
                )}
            </form>

            <div className="pendencias-administracao-listagem">
                <div className="pendencias-administracao-listagem-titulo">
                    <h3>
                        Pendências registradas
                    </h3>

                    <span>
                        {pendenciasFiltradas.length}
                        {pendenciasFiltradas.length === 1
                            ? " registro encontrado"
                            : " registros encontrados"
                        }
                    </span>
                </div>

                <div className="pendencias-administracao-filtros">
                    <div className="pendencias-administracao-filtro-cliente">
                        <label htmlFor="pendencias-filtro-cliente">
                            Cliente
                        </label>

                        <input
                            id="pendencias-filtro-cliente"
                            type="text"
                            list="pendencias-clientes-filtro"
                            autoComplete="off"
                            placeholder="Filtrar por cliente"
                            value={filtroCliente}
                            onChange={evento =>
                                setFiltroCliente(
                                    evento.target.value
                                )
                            }
                        />

                        <datalist id="pendencias-clientes-filtro">
                            {clientesConhecidos.map(cliente => (
                                <option
                                    key={`filtro-${cliente.toLocaleLowerCase("pt-BR")}`}
                                    value={cliente}
                                />
                            ))}
                        </datalist>
                    </div>

                    <div className="pendencias-administracao-filtro-pagamento">
                        <label htmlFor="pendencias-filtro-status">
                            Pagamento
                        </label>

                        <select
                            id="pendencias-filtro-status"
                            className="pendencias-administracao-filtro-status"
                            value={filtroStatus}
                            onChange={evento =>
                                setFiltroStatus(
                                    evento.target.value
                                )
                            }
                        >
                            <option value="">
                                Todos os status
                            </option>

                            <option value="pendente">
                                Pendentes
                            </option>

                            <option value="pago">
                                Pagas
                            </option>

                            <option value="cancelado">
                                Canceladas
                            </option>
                        </select>
                    </div>

                    {(filtroCliente || filtroStatus) && (
                        <button
                            type="button"
                            className="pendencias-administracao-limpar-filtros"
                            onClick={() => {
                                setFiltroCliente("");
                                setFiltroStatus("");
                            }}
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>

                {carregando ? (
                    <div className="pendencias-administracao-carregando">
                        Carregando pendências...
                    </div>
                ) : pendenciasFiltradas.length === 0 ? (
                    <div className="pendencias-administracao-vazio">
                        Nenhuma pendência encontrada.
                    </div>
                ) : (
                    <div className="pendencias-administracao-tabela-area">
                        <table className="pendencias-administracao-tabela">
                            <thead>
                                <tr>
                                    <th>Protocolo</th>
                                    <th>Cliente</th>
                                    <th>Valor</th>
                                    <th>Data</th>
                                    <th>Operador</th>
                                    <th>Status da venda</th>
                                    <th>Pagamento</th>
                                    <th>Documentos</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pendenciasFiltradas.map(pendencia => (
                                    <tr key={pendencia.id}>
                                        <td>
                                            #{pendencia.venda_id}
                                        </td>

                                        <td>
                                            {pendencia.nome_cliente}
                                        </td>

                                        <td className="pendencias-administracao-valor">
                                            {formatarDinheiro(
                                                pendencia.valor_venda
                                            )}
                                        </td>

                                        <td>
                                            {formatarData(
                                                pendencia.data_venda
                                            )}
                                        </td>

                                        <td>
                                            {pendencia.operador ||
                                                "Não identificado"
                                            }
                                        </td>

                                        <td>
                                            {pendencia.venda_status ||
                                                "Sem status"
                                            }
                                        </td>

                                        <td>
                                            <select
                                                className={
                                                    `pendencias-administracao-status-select ` +
                                                    `pendencias-administracao-status-${pendencia.status}`
                                                }
                                                value={pendencia.status}
                                                disabled={
                                                    alterandoStatus ===
                                                    pendencia.id
                                                }
                                                onChange={evento =>
                                                    alterarStatus(
                                                        pendencia,
                                                        evento.target.value
                                                    )
                                                }
                                            >
                                                <option value="pendente">
                                                    Pendente
                                                </option>

                                                <option value="pago">
                                                    Pago
                                                </option>

                                                <option value="cancelado">
                                                    Cancelado
                                                </option>
                                            </select>
                                        </td>

                                        <td>
                                            <div className="pendencias-administracao-documentos">
                                                {pendencia.comprovante_url ? (
                                                    <button
                                                        type="button"
                                                        className="pendencias-administracao-botao-documento"
                                                        onClick={() =>
                                                            abrirComprovante(
                                                                pendencia.comprovante_url
                                                            )
                                                        }
                                                    >
                                                        Comprovante
                                                    </button>
                                                ) : (
                                                    <span className="pendencias-administracao-sem-documento">
                                                        Sem comprovante
                                                    </span>
                                                )}

                                                {pendencia.nota_fiscal_url && (
                                                    <button
                                                        type="button"
                                                        className="pendencias-administracao-botao-documento"
                                                        onClick={() =>
                                                            abrirNotaFiscal(
                                                                pendencia
                                                            )
                                                        }
                                                    >
                                                        Nota fiscal
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}