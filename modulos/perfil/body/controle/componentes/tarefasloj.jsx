import React, { useEffect, useMemo, useState } from "react";
import {
    Document,
    Image,
    Link,
    Page,
    PDFDownloadLink,
    StyleSheet,
    Text,
    View
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import { API_URL } from "../../../../../config";
import "./tarefasloj.css";
import { createPortal } from "react-dom";



const styles = StyleSheet.create({

    page: {

        paddingTop: 34,

        paddingBottom: 48,

        paddingHorizontal: 36,

        fontFamily: "Helvetica",

        fontSize: 9,

        color: "#243247",

        backgroundColor: "#FFFFFF"

    },

    topLine: {

        height: 5,

        backgroundColor: "#17365D",

        marginBottom: 18

    },

    header: {

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        paddingBottom: 14,

        borderBottomWidth: 1.5,

        borderBottomColor: "#17365D",

        marginBottom: 18

    },

    brand: {

        flexDirection: "row",

        alignItems: "center",

        flex: 1,

        gap: 10

    },

    logo: {

        width: 48,

        height: 48,

        objectFit: "contain"

    },

    brandText: { flex: 1 },

    eyebrow: {

        fontSize: 7,

        letterSpacing: 1.5,

        color: "#16815A",

        fontWeight: "bold",

        marginBottom: 4

    },

    storeName: {

        fontSize: 17,

        color: "#17365D",

        fontWeight: "bold"

    },

    subtitle: {

        fontSize: 8,

        color: "#748196",

        marginTop: 4

    },

    documentInfo: {

        width: 150,

        alignItems: "flex-end"

    },

    documentTag: {

        backgroundColor: "#17365D",

        color: "#FFFFFF",

        paddingVertical: 5,

        paddingHorizontal: 7,

        fontSize: 7,

        fontWeight: "bold",

        marginBottom: 6

    },

    documentTitle: {

        fontSize: 9,

        fontWeight: "bold",

        color: "#17365D",

        marginBottom: 4

    },

    muted: { fontSize: 7, color: "#748196", marginTop: 2 },

    summary: {

        flexDirection: "row",

        gap: 8,

        marginBottom: 20

    },

    summaryCard: {

        flexGrow: 1,

        flexBasis: 0,

        padding: 10,

        backgroundColor: "#F5F8FC",

        borderWidth: 1,

        borderColor: "#E0E7F0",

        borderRadius: 6

    },

    summaryNumber: {

        fontSize: 19,

        fontWeight: "bold",

        color: "#17365D"

    },

    summaryLabel: {

        fontSize: 7,

        color: "#718096",

        marginTop: 4

    },

    dateSection: { marginBottom: 17 },

    dateHeader: {

        flexDirection: "row",

        alignItems: "center",

        padding: 11,

        backgroundColor: "#EDF3FA",

        borderLeftWidth: 4,

        borderLeftColor: "#17365D",

        borderRadius: 5,

        marginBottom: 10

    },

    dateIndex: {

        width: 30,

        height: 30,

        backgroundColor: "#17365D",

        color: "#FFFFFF",

        textAlign: "center",

        paddingTop: 9,

        borderRadius: 4,

        fontSize: 10,

        fontWeight: "bold",

        marginRight: 10

    },

    dateInfo: { flexGrow: 1 },

    sectionEyebrow: {

        fontSize: 6.5,

        letterSpacing: 1,

        color: "#63809F",

        fontWeight: "bold",

        marginBottom: 3

    },

    dateTitle: {

        fontSize: 14,

        fontWeight: "bold",

        color: "#17365D"

    },

    dateDescription: {

        fontSize: 7,

        color: "#718096",

        marginTop: 3

    },

    datePercent: {

        fontSize: 15,

        color: "#16815A",

        fontWeight: "bold",

        marginLeft: 8

    },

    group: {

        borderWidth: 1,

        borderColor: "#DDE5EF",

        borderRadius: 6,

        marginBottom: 10,

        overflow: "hidden"

    },

    groupHeader: {

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",

        padding: 9,

        backgroundColor: "#F4F7FB",

        borderBottomWidth: 1,

        borderBottomColor: "#E3EAF2"

    },

    groupIdentity: {

        flexDirection: "row",

        alignItems: "center",

        flexGrow: 1

    },

    avatar: {

        width: 27,

        height: 27,

        borderRadius: 14,

        backgroundColor: "#17365D",

        color: "#FFFFFF",

        textAlign: "center",

        paddingTop: 7,

        fontSize: 10,

        fontWeight: "bold",

        marginRight: 8

    },

    unassignedAvatar: { backgroundColor: "#A87524" },

    groupEyebrow: {

        fontSize: 6,

        color: "#8291A5",

        letterSpacing: 0.8,

        marginBottom: 3,

        fontWeight: "bold"

    },

    groupName: {

        fontSize: 10,

        color: "#17365D",

        fontWeight: "bold"

    },

    groupCount: {

        fontSize: 7,

        color: "#52647B",

        backgroundColor: "#FFFFFF",

        borderWidth: 1,

        borderColor: "#DDE5EF",

        borderRadius: 4,

        paddingVertical: 5,

        paddingHorizontal: 7

    },

    groupProgress: {

        paddingHorizontal: 10,

        paddingTop: 7,

        paddingBottom: 6

    },

    progressTrack: {

        height: 4,

        backgroundColor: "#E7EDF4",

        borderRadius: 4,

        overflow: "hidden"

    },

    progressValue: {

        height: 4,

        backgroundColor: "#16815A",

        borderRadius: 4

    },

    progressLegend: {

        flexDirection: "row",

        justifyContent: "space-between",

        marginTop: 4,

        fontSize: 6.5,

        color: "#7A8798"

    },

    task: {

        flexDirection: "row",

        alignItems: "center",

        paddingVertical: 8,

        paddingHorizontal: 10,

        borderTopWidth: 0.6,

        borderTopColor: "#E9EEF4"

    },

    taskNumber: {

        width: 20,

        fontSize: 7,

        color: "#99A5B5"

    },

    taskCheck: {

        width: 12,

        height: 12,

        borderWidth: 1,

        borderColor: "#AEBAC9",

        borderRadius: 2,

        marginRight: 8,

        textAlign: "center",

        fontSize: 8,

        color: "#FFFFFF"

    },

    taskCheckDone: {

        backgroundColor: "#16815A",

        borderColor: "#16815A"

    },

    taskMain: { flexGrow: 1, flexShrink: 1, paddingRight: 8 },

    taskTitle: {

        fontSize: 8.5,

        lineHeight: 1.35,

        color: "#26364B",

        fontWeight: "bold"

    },

    taskMeta: {

        fontSize: 6.5,

        color: "#8793A3",

        marginTop: 3

    },

    status: {

        alignSelf: "flex-start",

        marginTop: 4,

        paddingVertical: 3,

        paddingHorizontal: 5,

        borderRadius: 3,

        fontSize: 6,

        fontWeight: "bold"

    },

    statusDone: { backgroundColor: "#E1F4E9", color: "#16734A" },

    statusPending: { backgroundColor: "#FFF1DC", color: "#A76B13" },

    qrArea: {

        width: 56,

        alignItems: "center",

        marginLeft: 5

    },

    qr: { width: 48, height: 48 },

    qrCaption: {

        fontSize: 5.5,

        color: "#718096",

        marginTop: 2

    },

    linkText: {

        fontSize: 6,

        color: "#245A91",

        marginTop: 3

    },

    signatures: {

        flexDirection: "row",

        gap: 22,

        padding: 13,

        backgroundColor: "#F7F9FC",

        borderWidth: 1,

        borderColor: "#E0E7F0",

        borderRadius: 5,

        marginTop: 12

    },

    signature: { flexGrow: 1 },

    signatureLabel: {

        fontSize: 6.5,

        color: "#8290A3",

        fontWeight: "bold",

        letterSpacing: 0.5

    },

    signatureLine: {

        borderBottomWidth: 0.8,

        borderBottomColor: "#758397",

        marginTop: 28,

        marginBottom: 5

    },

    signatureCaption: { fontSize: 7, color: "#526176" },

    footer: {

        position: "absolute",

        bottom: 20,

        left: 36,

        right: 36,

        paddingTop: 7,

        borderTopWidth: 1,

        borderTopColor: "#DCE4ED",

        flexDirection: "row",

        justifyContent: "space-between",

        color: "#8793A3",

        fontSize: 7

    },

    footerStrong: { color: "#17365D", fontWeight: "bold" }

});

function agruparPorResponsavel(tarefas = []) {

    const mapa = new Map();

    tarefas.forEach((item) => {

        const chave = item.responsavel != null && item.responsavel !== ""

            ? String(item.responsavel)

            : "sem-responsavel";

        if (!mapa.has(chave)) {

            mapa.set(chave, {

                id: chave,

                nome: item.responsavel_nome || "Não identificado",

                tarefas: []

            });

        }

        mapa.get(chave).tarefas.push(item);

    });

    return [...mapa.values()].sort((a, b) => {

        if (a.id === "sem-responsavel") return 1;

        if (b.id === "sem-responsavel") return -1;

        return a.nome.localeCompare(b.nome, "pt-BR");

    });

}

function obterTarefasDaCategoria(tarefas, categoriaId) {

    return (tarefas || []).filter(

        (item) => String(item.tarefa_nome_id) === String(categoriaId)

    );

}

function formatarDataPDF(data) {

    if (!data) return "";

    const partes = String(data).split("-");

    return partes.length === 3

        ? `${partes[2]}/${partes[1]}/${partes[0]}`

        : String(data);

}

function DocumentoTarefas({

    dados,

    categorias,

    estatisticas,

    qrCodes

}) {

    const total = estatisticas.total || 0;

    const concluidas = estatisticas.concluidas || 0;

    const pendentes = estatisticas.pendentes || 0;

    const progresso = total ? Math.round((concluidas / total) * 100) : 0;

    const emitido = new Date().toLocaleDateString("pt-BR");

    return (

        <Document

            title={`Relatório de tarefas - ${dados?.comercio?.loja || "Loja"}`}

            author="Iron Executions"

            subject="Controle operacional de tarefas"

        >

            <Page size="A4" style={styles.page} wrap>

                <View style={styles.topLine} />

                <View style={styles.header}>

                    <View style={styles.brand}>

                        {dados?.comercio?.imagem ? (

                            <Image

                                src={dados.comercio.imagem}

                                style={styles.logo}

                            />

                        ) : null}

                        <View style={styles.brandText}>

                            <Text style={styles.eyebrow}>RELATÓRIO OPERACIONAL</Text>

                            <Text style={styles.storeName}>

                                {dados?.comercio?.loja || "Minha loja"}

                            </Text>

                            <Text style={styles.subtitle}>

                                Controle e acompanhamento de atividades

                            </Text>

                        </View>

                    </View>

                    <View style={styles.documentInfo}>

                        <Text style={styles.documentTag}>DOCUMENTO INTERNO</Text>

                        <Text style={styles.documentTitle}>RELATÓRIO DE TAREFAS</Text>

                        <Text style={styles.muted}>

                            {categorias.length === 1

                                ? `Categoria: ${categorias[0].tarefa}`

                                : `${categorias.length} listas de atividades`}

                        </Text>

                        <Text style={styles.muted}>Emitido em: {emitido}</Text>

                    </View>

                </View>



                {categorias.map((categoria, indiceCategoria) => {

                    const tarefas = obterTarefasDaCategoria(

                        dados?.tarefas,

                        categoria.id

                    );

                    if (!tarefas.length) return null;

                    const grupos = agruparPorResponsavel(tarefas);

                    const concluidasData = tarefas.filter(

                        (item) => Boolean(item.pronto)

                    ).length;

                    const progressoData = Math.round(

                        (concluidasData / tarefas.length) * 100

                    );

                    return (

                        <View key={String(categoria.id)} style={styles.dateSection}>



                            {grupos.map((grupo, indiceGrupo) => {

                                const feitas = grupo.tarefas.filter(

                                    (item) => Boolean(item.pronto)

                                ).length;

                                const faltam = grupo.tarefas.length - feitas;

                                const percentual = grupo.tarefas.length

                                    ? Math.round((feitas / grupo.tarefas.length) * 100)

                                    : 0;

                                return (

                                    <View

                                        key={`${categoria.id}-${grupo.id}`}

                                        style={styles.group}

                                    >

                                        <View style={styles.groupHeader} wrap={false}>

                                            <View style={styles.groupIdentity}>

                                                <Text

                                                    style={[

                                                        styles.avatar,

                                                        grupo.id === "sem-responsavel"

                                                            ? styles.unassignedAvatar

                                                            : {}

                                                    ]}

                                                >

                                                    {grupo.id === "sem-responsavel"

                                                        ? "?"

                                                        : grupo.nome.charAt(0).toUpperCase()}

                                                </Text>

                                                <View>

                                                    <Text style={styles.groupEyebrow}>

                                                        {grupo.id === "sem-responsavel"

                                                            ? "DISTRIBUIÇÃO PENDENTE"

                                                            : `RESPONSÁVEL ${String(indiceGrupo + 1).padStart(2, "0")}`}

                                                    </Text>

                                                    <Text style={styles.groupName}>

                                                        {grupo.nome}

                                                    </Text>

                                                </View>

                                            </View>

                                            <Text style={styles.groupCount}>

                                                {grupo.tarefas.length}{" "}

                                                {grupo.tarefas.length === 1 ? "TAREFA" : "TAREFAS"}

                                            </Text>

                                        </View>

                                        <View style={styles.groupProgress} wrap={false}>

                                            <View style={styles.progressTrack}>

                                                <View

                                                    style={[

                                                        styles.progressValue,

                                                        { width: `${percentual}%` }

                                                    ]}

                                                />

                                            </View>

                                            <View style={styles.progressLegend}>

                                                <Text>{feitas} concluídas</Text>

                                                <Text>{faltam} pendentes</Text>

                                                <Text>{percentual}%</Text>

                                            </View>

                                        </View>

                                        {grupo.tarefas.map((item, indiceTarefa) => (

                                            <View

                                                key={String(item.id)}

                                                style={styles.task}

                                                wrap={false}

                                            >

                                                <Text style={styles.taskNumber}>

                                                    {String(indiceTarefa + 1).padStart(2, "0")}

                                                </Text>

                                                <Text

                                                    style={[

                                                        styles.taskCheck,

                                                        item.pronto ? styles.taskCheckDone : {}

                                                    ]}

                                                >

                                                    {item.pronto ? "✓" : ""}

                                                </Text>

                                                <View style={styles.taskMain}>

                                                    <Text style={styles.taskTitle}>

                                                        {item.tarefa}

                                                    </Text>

                                                    <Text style={styles.taskMeta}>

                                                        Responsável: {grupo.nome}

                                                    </Text>

                                                    <Text

                                                        style={[

                                                            styles.status,

                                                            item.pronto

                                                                ? styles.statusDone

                                                                : styles.statusPending

                                                        ]}

                                                    >

                                                        {item.pronto ? "CONCLUÍDA" : "PENDENTE"}

                                                    </Text>

                                                    {item.link ? (

                                                        <Link src={item.link} style={styles.linkText}>

                                                            Abrir link relacionado

                                                        </Link>

                                                    ) : null}

                                                </View>

                                                {qrCodes[item.id] ? (
                                                    <View style={styles.qrArea}>
                                                        <Image
                                                            src={qrCodes[item.id]}
                                                            style={styles.qr}
                                                        />

                                                        <Text style={styles.qrCaption}>
                                                            CONCLUIR TAREFA
                                                        </Text>
                                                    </View>
                                                ) : null}

                                            </View>

                                        ))}

                                    </View>

                                );

                            })}

                        </View>

                    );

                })}

                <View style={styles.signatures} wrap={false}>

                    <View style={styles.signature}>

                        <Text style={styles.signatureLabel}>

                            CONFERÊNCIA OPERACIONAL

                        </Text>

                        <View style={styles.signatureLine} />

                        <Text style={styles.signatureCaption}>

                            Responsável pela conferência

                        </Text>

                    </View>

                    <View style={styles.signature}>

                        <Text style={styles.signatureLabel}>

                            REGISTRO DE CONFERÊNCIA

                        </Text>

                        <View style={styles.signatureLine} />

                        <Text style={styles.signatureCaption}>

                            Data da conferência

                        </Text>

                    </View>

                </View>

                <View style={styles.footer} fixed>

                    <Text style={styles.footerStrong}>

                        {dados?.comercio?.loja || "Loja"} | Iron Executions

                    </Text>

                    <Text

                        render={({ pageNumber, totalPages }) =>

                            `Página ${pageNumber} de ${totalPages}`

                        }

                    />

                </View>

            </Page>

        </Document>

    );

}

function TarefasLojaPDF({

    dados,

    categorias,

    estatisticas,

    nomeArquivo = "relatorio-tarefas.pdf"

}) {

    const [qrCodes, setQrCodes] = useState({});

    const [gerandoQR, setGerandoQR] = useState(false);

    const tarefasPendentes = useMemo(
        () => (dados?.tarefas || []).filter((item) => !Boolean(item.pronto)),
        [dados]
    );

    const dadosParaPDF = useMemo(
        () => ({ ...dados, tarefas: tarefasPendentes }),
        [dados, tarefasPendentes]
    );

    const estatisticasCalculadas = useMemo(() => ({
        total: tarefasPendentes.length,
        concluidas: 0,
        pendentes: tarefasPendentes.length,
        progresso: 0
    }), [tarefasPendentes]);

    const estatisticasFinais = estatisticas || estatisticasCalculadas;

    const tarefasComLink = useMemo(
        () => tarefasPendentes.filter((item) => item.id),
        [tarefasPendentes]
    );

    useEffect(() => {

        let ativo = true;

        async function gerarCodigos() {

            setGerandoQR(true);

            try {

                const entradas = await Promise.all(
                    tarefasComLink.map(async (item) => {

                        const url = `https://ironexecutions.com.br/link/tarefa/${item.id}`;

                        const qr = await QRCode.toDataURL(url, {
                            width: 180,
                            margin: 1,
                            errorCorrectionLevel: "M"
                        });

                        return [item.id, qr];

                    })
                );

                if (ativo) {
                    setQrCodes(Object.fromEntries(entradas));
                }

            } catch (error) {

                console.error(
                    "Erro ao gerar QR Codes do relatório:",
                    error
                );

                if (ativo) setQrCodes({});

            } finally {

                if (ativo) setGerandoQR(false);

            }
        }

        gerarCodigos();

        return () => {
            ativo = false;
        };

    }, [tarefasComLink]);

    if (!dados || !categorias?.length) {

        return null;

    }

    if (gerandoQR) {

        return (

            <button type="button" className="tl-print-button" disabled>

                Preparando PDF...

            </button>

        );

    }

    return (

        <PDFDownloadLink

            document={

                <DocumentoTarefas

                    dados={dadosParaPDF}

                    categorias={categorias}

                    estatisticas={estatisticasFinais}

                    qrCodes={qrCodes}

                />

            }

            fileName={nomeArquivo}

            className="tl-print-button"

            style={{ textDecoration: "none" }}

        >

            {({ loading }) => loading ? "Gerando PDF..." : "Baixar PDF"}

        </PDFDownloadLink>

    );

}

function capitalizarPalavras(texto) {
    return texto.replace(
        /\b\p{L}/gu,
        letra => letra.toLocaleUpperCase("pt-BR")
    );
}

export default function Tarefasloja() {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [tarefa, setTarefa] = useState("");
    const [link, setLink] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [editando, setEditando] = useState(null);
    const [erro, setErro] = useState("");
    const [alerta, setAlerta] = useState(null);

    const token = () => (
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken")
    );

    async function requisicao(url, options = {}) {
        const resposta = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token()}`,
                ...options.headers
            }
        });

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(resultado.detail || "Erro ao realizar operação");
        }

        return resultado;
    }

    async function carregarDados() {
        try {
            setCarregando(true);
            setErro("");
            const resultado = await requisicao("/tarefas-loja/inicial");
            setDados(resultado);
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    const categoriaPrincipal = dados?.categorias?.[0] || null;

    const estatisticas = dados?.estatisticas || {
        total: 0,
        concluidas: 0,
        pendentes: 0,
        progresso: 0
    };

    const tarefasOrdenadas = useMemo(() => {
        if (!dados?.tarefas) return [];

        return [...dados.tarefas].sort((a, b) => {
            if (Boolean(a.pronto) !== Boolean(b.pronto)) {
                return Number(Boolean(a.pronto)) - Number(Boolean(b.pronto));
            }
            return Number(b.id) - Number(a.id);
        });
    }, [dados]);

    function mostrarAlerta(tipo, titulo, mensagem, acaoConfirmar = null) {
        setAlerta({ tipo, titulo, mensagem, acaoConfirmar });
    }

    function fecharAlerta() {
        setAlerta(null);
    }

    async function confirmarAlerta() {
        const acao = alerta?.acaoConfirmar;
        setAlerta(null);
        if (acao) await acao();
    }

    async function cadastrarTarefa(e) {
        e.preventDefault();

        if (!tarefa.trim()) {
            mostrarAlerta("aviso", "Campo obrigatório", "Descreva a tarefa antes de continuar.");
            return;
        }

        try {
            setErro("");

            const resultado = await requisicao("/tarefas-loja/tarefa", {
                method: "POST",
                body: JSON.stringify({
                    tarefa: tarefa.trim(),
                    link: link.trim() || null,
                    responsavel: responsavel ? Number(responsavel) : null
                })
            });

            const funcionario = dados.funcionarios.find(
                item => String(item.id) === String(responsavel)
            );

            const novaTarefa = {
                id: resultado.id ?? resultado.tarefa_id ?? `temporaria-${Date.now()}`,
                tarefa_nome_id: resultado.tarefa_nome_id ?? categoriaPrincipal?.id,
                tarefa: tarefa.trim(),
                link: link.trim() || null,
                responsavel: responsavel ? Number(responsavel) : null,
                responsavel_nome: funcionario?.nome_completo || null,
                pronto: false,
                categoria: categoriaPrincipal?.tarefa
            };

            setDados(atual => {
                if (!atual) return atual;

                const tarefas = [novaTarefa, ...atual.tarefas];
                const total = tarefas.length;
                const concluidas = tarefas.filter(item => Boolean(item.pronto)).length;
                const pendentes = total - concluidas;

                return {
                    ...atual,
                    tarefas,
                    categorias: atual.categorias.map(categoria => ({
                        ...categoria,
                        total,
                        concluidas
                    })),
                    estatisticas: {
                        total,
                        concluidas,
                        pendentes,
                        progresso: total
                            ? Math.round((concluidas / total) * 100)
                            : 0
                    }
                };
            });

            setTarefa("");
            setLink("");
            // Mantém o responsável selecionado para facilitar o cadastro da próxima tarefa.
            mostrarAlerta("sucesso", "Tarefa cadastrada", "A atividade foi adicionada à lista com sucesso.");
        } catch (error) {
            mostrarAlerta("erro", "Não foi possível cadastrar", error.message);
        }
    }

    async function alterarStatus(item) {
        const novoStatus = !Boolean(item.pronto);

        try {
            await requisicao(`/tarefas-loja/tarefa/${item.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ pronto: novoStatus })
            });

            setDados(atual => {
                if (!atual) return atual;

                const tarefas = atual.tarefas.map(tarefaAtual =>
                    String(tarefaAtual.id) === String(item.id)
                        ? { ...tarefaAtual, pronto: novoStatus }
                        : tarefaAtual
                );

                const total = tarefas.length;
                const concluidas = tarefas.filter(t => Boolean(t.pronto)).length;
                const pendentes = total - concluidas;

                return {
                    ...atual,
                    tarefas,
                    categorias: atual.categorias.map(categoria => ({
                        ...categoria,
                        total,
                        concluidas
                    })),
                    estatisticas: {
                        total,
                        concluidas,
                        pendentes,
                        progresso: total
                            ? Math.round((concluidas / total) * 100)
                            : 0
                    }
                };
            });

            mostrarAlerta(
                novoStatus ? "sucesso" : "info",
                novoStatus ? "Tarefa concluída" : "Tarefa reaberta",
                novoStatus
                    ? "O status da atividade foi atualizado para concluída."
                    : "A atividade voltou para a lista de pendências."
            );
        } catch (error) {
            mostrarAlerta("erro", "Falha ao atualizar tarefa", error.message);
        }
    }

    async function executarExclusao(id) {
        try {
            await requisicao(`/tarefas-loja/tarefa/${id}`, { method: "DELETE" });
            await carregarDados();
            mostrarAlerta("sucesso", "Tarefa excluída", "A atividade foi removida com sucesso.");
        } catch (error) {
            mostrarAlerta("erro", "Não foi possível excluir", error.message);
        }
    }

    function excluirTarefa(id) {
        mostrarAlerta(
            "confirmacao",
            "Excluir esta tarefa?",
            "Essa ação removerá a atividade da lista. Deseja realmente continuar?",
            () => executarExclusao(id)
        );
    }

    function iniciarEdicao(item) {
        setEditando({
            id: item.id,
            tarefa: item.tarefa,
            link: item.link || "",
            responsavel: item.responsavel ? String(item.responsavel) : ""
        });
    }

    async function salvarEdicao(e) {
        e.preventDefault();

        try {
            await requisicao(`/tarefas-loja/tarefa/${editando.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    tarefa: editando.tarefa.trim(),
                    link: editando.link.trim() || null,
                    responsavel: editando.responsavel
                        ? Number(editando.responsavel)
                        : null
                })
            });

            setEditando(null);
            await carregarDados();
            mostrarAlerta("sucesso", "Alterações salvas", "A tarefa foi atualizada com sucesso.");
        } catch (error) {
            mostrarAlerta("erro", "Não foi possível salvar", error.message);
        }
    }

    if (carregando) {
        return (
            <div className="tl-loading">
                <div className="tl-spinner"></div>
                <span>Carregando tarefas da loja...</span>
            </div>
        );
    }

    if (!dados) {
        return (
            <div className="tl-error">
                <h3>Não foi possível carregar as tarefas.</h3>
                <p>{erro}</p>
                <button onClick={carregarDados}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <main className="tl-container">
            <header className="tl-header">
                <div className="tl-header-info">
                    <div className="tl-header-icon">
                        <span>✓</span>
                    </div>
                    <div>
                        <span className="tl-overline">GESTÃO OPERACIONAL</span>
                        <h1>Tarefas da loja</h1>
                        <p>
                            Organize as atividades em uma única lista e acompanhe
                            a execução da sua equipe.
                        </p>
                    </div>
                </div>

                <TarefasLojaPDF
                    dados={dados}
                    categorias={categoriaPrincipal ? [categoriaPrincipal] : []}
                    nomeArquivo="relatorio-tarefas-pendentes.pdf"
                />
            </header>

            <section className="tl-stats">
                <article className="tl-stat-card">
                    <span className="tl-stat-icon tl-icon-blue">▤</span>
                    <div>
                        <strong>{estatisticas.total}</strong>
                        <span>Total de tarefas</span>
                    </div>
                </article>

                <article className="tl-stat-card">
                    <span className="tl-stat-icon tl-icon-green">✓</span>
                    <div>
                        <strong>{estatisticas.concluidas}</strong>
                        <span>Concluídas</span>
                    </div>
                </article>

                <article className="tl-stat-card">
                    <span className="tl-stat-icon tl-icon-orange">◷</span>
                    <div>
                        <strong>{estatisticas.pendentes}</strong>
                        <span>Pendentes</span>
                    </div>
                </article>

                <article className="tl-stat-card">
                    <span className="tl-stat-icon tl-icon-purple">%</span>
                    <div>
                        <strong>{estatisticas.progresso}%</strong>
                        <span>Progresso geral</span>
                    </div>
                </article>
            </section>



            <section className="tl-management">
                <div className="tl-panel">
                    <div className="tl-panel-heading">
                        <div>
                            <span className="tl-overline">NOVA ATIVIDADE</span>
                            <h2>Cadastrar tarefa</h2>
                            <p className="tl-label-optional">
                                Categoria: {categoriaPrincipal?.tarefa || dados.comercio?.loja}
                            </p>
                        </div>
                    </div>

                    <form className="tl-task-form" onSubmit={cadastrarTarefa}>
                        <label>
                            Descrição da tarefa
                            <textarea
                                value={tarefa}
                                onChange={e => setTarefa(capitalizarPalavras(e.target.value))}
                                placeholder="Descreva o que precisa ser feito..."
                                rows={3}
                                required
                            />
                        </label>

                        <div className="tl-responsavel-group">
                            <span className="tl-responsavel-label">Responsável</span>

                            <div className="tl-responsavel-grid">
                                <button
                                    type="button"
                                    className={`tl-responsavel-option ${responsavel === "" ? "tl-responsavel-active" : ""}`}
                                    onClick={() => setResponsavel("")}
                                >
                                    <span className="tl-responsavel-avatar">
                                        <icon name="users" />
                                    </span>
                                    <span className="tl-responsavel-info">
                                        <strong>Sem responsável</strong>
                                        <small>Definir depois</small>
                                    </span>
                                    {responsavel === "" && <icon name="check-circle-2" />}
                                </button>

                                {dados.funcionarios.map(func => (
                                    <button
                                        key={func.id}
                                        type="button"
                                        className={`tl-responsavel-option ${String(responsavel) === String(func.id) ? "tl-responsavel-active" : ""}`}
                                        onClick={() => setResponsavel(String(func.id))}
                                    >
                                        <span className="tl-responsavel-avatar">
                                            {func.nome_completo?.charAt(0)?.toUpperCase()}
                                        </span>
                                        <span className="tl-responsavel-info">
                                            <strong>{func.nome_completo}</strong>
                                            <small>Responsável pela tarefa</small>
                                        </span>
                                        {String(responsavel) === String(func.id) && (
                                            <icon name="check-circle-2" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label>
                            Link relacionado
                            <span className="tl-label-optional">Opcional</span>
                            <input
                                type="url"
                                value={link}
                                onChange={e => setLink(e.target.value)}
                                placeholder="https://..."
                            />
                        </label>

                        <button className="tl-submit-button" type="submit">
                            + Adicionar tarefa
                        </button>
                    </form>
                </div>
            </section>

            <section className="tl-tasks-section">
                <div className="tl-list-heading">
                    <div>
                        <span className="tl-overline">ACOMPANHAMENTO</span>
                        <h2>{categoriaPrincipal?.tarefa || "Lista de tarefas"}</h2>
                        <p>Todas as tarefas, concluídas e pendentes.</p>
                    </div>
                </div>

                <article className="tl-task-group">
                    <div className="tl-group-heading">
                        <div>
                            <h3>{categoriaPrincipal?.tarefa || dados.comercio?.loja || "Tarefas da loja"}</h3>
                            <span>{tarefasOrdenadas.length} atividades</span>
                        </div>
                        <div className="tl-group-progress">
                            {estatisticas.concluidas}/{estatisticas.total}
                        </div>
                    </div>

                    {tarefasOrdenadas.map(item => (
                        <div
                            key={item.id}
                            className={`tl-task-item ${item.pronto ? "tl-task-completed" : ""}`}
                        >
                            <label className="tl-task-check">
                                <input
                                    type="checkbox"
                                    checked={Boolean(item.pronto)}
                                    onChange={() => alterarStatus(item)}
                                />
                                <span className="tl-custom-check"></span>
                            </label>

                            <div className="tl-task-description">
                                <strong>{item.tarefa}</strong>
                                <span>
                                    Responsável: {item.responsavel_nome || "Não definido"}
                                </span>
                                {item.link && (
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Abrir link ↗
                                    </a>
                                )}
                            </div>

                            <div className="tl-task-actions">
                                <button
                                    type="button"
                                    onClick={() => iniciarEdicao(item)}
                                    title="Editar"
                                >
                                    ✎
                                </button>
                                <button
                                    type="button"
                                    onClick={() => excluirTarefa(item.id)}
                                    title="Excluir"
                                >
                                    ×
                                </button>
                            </div>

                            <span className={`tl-status ${item.pronto ? "tl-status-done" : "tl-status-pending"}`}>
                                {item.pronto ? "Concluída" : "Pendente"}
                            </span>
                        </div>
                    ))}

                    {!tarefasOrdenadas.length && (
                        <div className="tl-empty">
                            Nenhuma tarefa cadastrada nesta loja.
                        </div>
                    )}
                </article>
            </section>

            {editando && (
                <div
                    className="tl-modal-overlay"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget) setEditando(null);
                    }}
                >
                    <form className="tl-modal" onSubmit={salvarEdicao}>
                        <div className="tl-modal-heading">
                            <h2>Editar tarefa</h2>
                            <button type="button" onClick={() => setEditando(null)}>×</button>
                        </div>

                        <label>
                            Descrição
                            <textarea
                                value={editando.tarefa}
                                onChange={e => setEditando({
                                    ...editando,
                                    tarefa: capitalizarPalavras(e.target.value)
                                })}
                                required
                            />
                        </label>

                        <div className="tl-responsavel-group">
                            <span className="tl-responsavel-label">Responsável</span>
                            <div className="tl-responsavel-grid">
                                <button
                                    type="button"
                                    className={`tl-responsavel-option ${editando.responsavel === "" ? "tl-responsavel-active" : ""}`}
                                    onClick={() => setEditando({ ...editando, responsavel: "" })}
                                >
                                    <span className="tl-responsavel-avatar">
                                        <icon name="users" />
                                    </span>
                                    <span className="tl-responsavel-info">
                                        <strong>Sem responsável</strong>
                                        <small>Definir depois</small>
                                    </span>
                                    {editando.responsavel === "" && <icon name="check-circle-2" />}
                                </button>

                                {dados.funcionarios.map(func => (
                                    <button
                                        key={func.id}
                                        type="button"
                                        className={`tl-responsavel-option ${String(editando.responsavel) === String(func.id) ? "tl-responsavel-active" : ""}`}
                                        onClick={() => setEditando({
                                            ...editando,
                                            responsavel: String(func.id)
                                        })}
                                    >
                                        <span className="tl-responsavel-avatar">
                                            {func.nome_completo?.charAt(0)?.toUpperCase()}
                                        </span>
                                        <span className="tl-responsavel-info">
                                            <strong>{func.nome_completo}</strong>
                                            <small>Responsável pela tarefa</small>
                                        </span>
                                        {String(editando.responsavel) === String(func.id) && (
                                            <icon name="check-circle-2" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label>
                            Link
                            <input
                                type="url"
                                value={editando.link}
                                onChange={e => setEditando({
                                    ...editando,
                                    link: e.target.value
                                })}
                            />
                        </label>

                        <div className="tl-modal-actions">
                            <button type="button" onClick={() => setEditando(null)}>
                                Cancelar
                            </button>
                            <button type="submit">Salvar alterações</button>
                        </div>
                    </form>
                </div>
            )}

            {alerta && createPortal(
                <div className="tl-alert-portal-overlay">
                    <div className={`tl-alert-portal-modal tl-alert-${alerta.tipo}`}>

                        <div className="tl-alert-portal-icon">
                            {alerta.tipo === "sucesso" && "✓"}
                            {alerta.tipo === "erro" && "!"}
                            {alerta.tipo === "aviso" && "!"}
                            {alerta.tipo === "info" && "i"}
                            {alerta.tipo === "confirmacao" && "?"}
                        </div>

                        <h2>{alerta.titulo}</h2>
                        <p>{alerta.mensagem}</p>

                        <div className="tl-alert-portal-actions">
                            {alerta.tipo === "confirmacao" ? (
                                <>
                                    <button onClick={fecharAlerta}>
                                        Cancelar
                                    </button>
                                    <button onClick={confirmarAlerta}>
                                        Confirmar
                                    </button>
                                </>
                            ) : (
                                <button onClick={fecharAlerta}>
                                    Entendi
                                </button>
                            )}
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </main>
    );
}
