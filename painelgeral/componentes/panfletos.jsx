import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../config";

const PANFLETOS_QR_API = "https://quickchart.io/qr";
const PANFLETOS_WHATSAPP = "https://wa.me/5511918547818";
const PANFLETOS_POR_PAGINA = 9;

/*
 * O logo do Iron Executions fica relativo a este componente.
 * Se panfletos.jsx estiver na mesma pasta que a pasta logo,
 * o Vite resolve o arquivo corretamente no build.
 */
const PANFLETOS_LOGO_IRON =
    new URL("./logo/logo.png", import.meta.url).href;

export default function Panfletos() {
    const [comercios, setComercios] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const token = localStorage.getItem("token");

    function obterHeaders() {
        return {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
        };
    }

    /*
     * =========================================================
     * CARREGAR COMÉRCIOS
     * =========================================================
     */

    async function carregarComercios() {
        setCarregando(true);
        setErro("");

        try {
            const resposta = await fetch(
                `${API_URL}/panel/database/tabela/comercios_cadastradas`,
                {
                    method: "GET",
                    headers: obterHeaders(),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados?.detail ||
                    dados?.message ||
                    "Erro ao carregar os comércios."
                );
            }

            const linhas = Array.isArray(dados?.linhas)
                ? dados.linhas
                : Array.isArray(dados)
                    ? dados
                    : [];

            setComercios(
                linhas.map((item) => ({
                    id: item.id,
                    loja: item.loja || "",
                    imagem: item.imagem || "",
                    dominios: item.dominios || "",
                    cidade: item.cidade || "",
                    estado: item.estado || "",
                }))
            );
        } catch (error) {
            console.error(
                "[PANFLETOS] Erro ao carregar comércios:",
                error
            );

            setErro(
                error?.message ||
                "Não foi possível carregar os comércios."
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarComercios();
    }, []);

    /*
     * =========================================================
     * DOMÍNIO
     * =========================================================
     */

    function obterDominio(comercio) {
        let valor = String(
            comercio?.dominios || ""
        ).trim();

        if (!valor) {
            return "";
        }

        /*
         * O campo dominios é TEXT. Caso existam vários valores,
         * procuramos o primeiro domínio reconhecível.
         */
        const encontrados = valor.match(
            /https?:\/\/[^\s,;|]+|(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s,;|]*)?/g
        );

        if (encontrados?.length) {
            valor = encontrados[0].trim();
        }

        valor = valor
            .replace(/^["']+|["']+$/g, "")
            .trim();

        if (!valor) {
            return "";
        }

        if (
            !valor.startsWith("http://") &&
            !valor.startsWith("https://")
        ) {
            valor = `https://${valor}`;
        }

        return valor;
    }

    function obterTextoDominio(comercio) {
        return obterDominio(comercio)
            .replace(/^https?:\/\//i, "")
            .replace(/\/+$/, "");
    }

    /*
     * =========================================================
     * IMAGEM
     * =========================================================
     */

    function normalizarImagem(valor) {
        if (!valor) {
            return "";
        }

        let imagem = String(valor)
            .trim()
            .split("|")[0]
            .trim();

        if (!imagem) {
            return "";
        }

        if (
            imagem.startsWith("http://") ||
            imagem.startsWith("https://") ||
            imagem.startsWith("data:")
        ) {
            return imagem;
        }

        /*
         * Caminhos absolutos do backend, por exemplo:
         * /uploads/logo.png
         */
        if (imagem.startsWith("/")) {
            return `${String(API_URL).replace(/\/+$/, "")}${imagem}`;
        }

        return imagem;
    }

    /*
     * =========================================================
     * QR CODE
     * =========================================================
     */

    function gerarQrCode(texto, tamanho = 320) {
        if (!texto) {
            return "";
        }

        return (
            `${PANFLETOS_QR_API}` +
            `?size=${tamanho}` +
            `&margin=3` +
            `&ecLevel=H` +
            `&text=${encodeURIComponent(texto)}`
        );
    }

    /*
     * =========================================================
     * BUSCA
     * =========================================================
     */

    const comerciosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        if (!termo) {
            return comercios;
        }

        return comercios.filter((comercio) => {
            return (
                String(comercio.id || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(comercio.loja || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(comercio.dominios || "")
                    .toLowerCase()
                    .includes(termo)
            );
        });
    }, [comercios, busca]);

    /*
     * =========================================================
     * SELEÇÃO
     * =========================================================
     */

    function alternarComercio(id) {
        setSelecionados((atuais) => {
            const existe = atuais.some(
                (item) => String(item) === String(id)
            );

            if (existe) {
                return atuais.filter(
                    (item) => String(item) !== String(id)
                );
            }

            return [...atuais, id];
        });
    }

    function selecionarTodos() {
        const ids = comerciosFiltrados.map(
            (comercio) => comercio.id
        );

        setSelecionados((atuais) => {
            const todosEstaoSelecionados =
                ids.length > 0 &&
                ids.every((id) =>
                    atuais.some(
                        (selecionado) =>
                            String(selecionado) ===
                            String(id)
                    )
                );

            if (todosEstaoSelecionados) {
                return atuais.filter(
                    (id) =>
                        !ids.some(
                            (item) =>
                                String(item) ===
                                String(id)
                        )
                );
            }

            return [
                ...atuais,
                ...ids.filter(
                    (id) =>
                        !atuais.some(
                            (item) =>
                                String(item) ===
                                String(id)
                        )
                ),
            ];
        });
    }

    function limparSelecao() {
        setSelecionados([]);
    }

    const comerciosSelecionados = useMemo(() => {
        /*
         * Mantemos a ordem da lista de comércios.
         * Assim a impressão fica previsível.
         */
        return comercios.filter((comercio) =>
            selecionados.some(
                (id) =>
                    String(id) ===
                    String(comercio.id)
            )
        );
    }, [comercios, selecionados]);

    /*
     * =========================================================
     * DIVISÃO EM FOLHAS
     * =========================================================
     */

    function dividirEmPaginas(lista) {
        const paginas = [];

        for (
            let inicio = 0;
            inicio < lista.length;
            inicio += PANFLETOS_POR_PAGINA
        ) {
            paginas.push(
                lista.slice(
                    inicio,
                    inicio + PANFLETOS_POR_PAGINA
                )
            );
        }

        return paginas;
    }

    const paginasComercios = useMemo(
        () =>
            dividirEmPaginas(
                comerciosSelecionados
            ),
        [comerciosSelecionados]
    );

    /*
     * =========================================================
     * ESPERAR IMAGENS
     * =========================================================
     */

    async function esperarImagensDaImpressao() {
        const imagens = Array.from(
            document.querySelectorAll(
                ".panfletos-impressao img"
            )
        );

        await Promise.all(
            imagens.map(
                (imagem) =>
                    new Promise((resolve) => {
                        if (imagem.complete) {
                            resolve();
                            return;
                        }

                        const finalizar = () => {
                            imagem.removeEventListener(
                                "load",
                                finalizar
                            );
                            imagem.removeEventListener(
                                "error",
                                finalizar
                            );
                            resolve();
                        };

                        imagem.addEventListener(
                            "load",
                            finalizar
                        );

                        imagem.addEventListener(
                            "error",
                            finalizar
                        );
                    })
            )
        );
    }

    /*
     * =========================================================
     * IMPRIMIR
     * =========================================================
     */

    async function imprimirPanfletos() {
        if (!comerciosSelecionados.length) {
            setErro(
                "Selecione pelo menos um comércio para imprimir."
            );
            return;
        }

        setErro("");

        try {
            await esperarImagensDaImpressao();

            /*
             * Tempo pequeno para o navegador recalcular o layout
             * antes de abrir a impressão.
             */
            await new Promise((resolve) =>
                window.setTimeout(resolve, 250)
            );

            window.print();
        } catch (error) {
            console.error(
                "[PANFLETOS] Erro na impressão:",
                error
            );

            window.print();
        }
    }

    /*
     * =========================================================
     * ESTILOS
     * =========================================================
     */

    const estiloPanfletos = `
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap");
        .panfletos-root {
            width: 100%;
            box-sizing: border-box;
            color: #151515;
            font-family:
                "Inter",
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Arial,
                sans-serif;
        }

        .panfletos-tela {
            width: 100%;
            box-sizing: border-box;
            padding: 24px;
        }

        .panfletos-cabecalho {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 22px;
        }

        .panfletos-titulo {
            font-family:
                "Manrope",
                "Inter",
                "Segoe UI",
                Arial,
                sans-serif;
            margin: 0;
            font-size: 26px;
            line-height: 1.1;
            font-weight: 850;
            letter-spacing: -0.7px;
        }

        .panfletos-subtitulo {
            margin: 7px 0 0;
            color: #777;
            font-size: 14px;
            line-height: 1.4;
        }

        .panfletos-acoes {
            display: flex;
            align-items: center;
            gap: 9px;
            flex-wrap: wrap;
        }

        .panfletos-botao {
            border: 0;
            border-radius: 10px;
            padding: 11px 17px;
            font-size: 13px;
            font-weight: 750;
            cursor: pointer;
            transition:
                transform .15s ease,
                box-shadow .15s ease,
                opacity .15s ease;
        }

        .panfletos-botao:hover:not(:disabled) {
            transform: translateY(-1px);
        }

        .panfletos-botao:disabled {
            opacity: .45;
            cursor: not-allowed;
        }

        .panfletos-botao-principal {
            color: #fff;
            background: #111;
            box-shadow:
                0 7px 18px rgba(0, 0, 0, .12);
        }

        .panfletos-botao-secundario {
            color: #222;
            background: #f0f0f0;
        }

        .panfletos-controles {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 18px;
        }

        .panfletos-busca {
            flex: 1 1 300px;
            min-width: 240px;
            height: 43px;
            box-sizing: border-box;
            border: 1px solid #dedede;
            border-radius: 11px;
            padding: 0 14px;
            outline: none;
            background: #fff;
            color: #111;
            font-size: 14px;
        }

        .panfletos-busca:focus {
            border-color: #111;
            box-shadow:
                0 0 0 3px rgba(0, 0, 0, .05);
        }

        .panfletos-contador {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 43px;
            box-sizing: border-box;
            padding: 0 15px;
            border-radius: 11px;
            background: #f5f5f5;
            color: #333;
            font-size: 13px;
            font-weight: 750;
        }

        .panfletos-erro {
            margin-bottom: 16px;
            padding: 12px 14px;
            border: 1px solid #ffd4d4;
            border-radius: 10px;
            background: #fff3f3;
            color: #a4001b;
            font-size: 13px;
            font-weight: 650;
        }

        .panfletos-lista {
            display: grid;
            grid-template-columns:
                repeat(
                    auto-fill,
                    minmax(250px, 1fr)
                );
            gap: 12px;
        }

        .panfletos-card {
            display: flex;
            align-items: center;
            gap: 13px;
            min-height: 82px;
            box-sizing: border-box;
            padding: 12px;
            border: 1px solid #e3e3e3;
            border-radius: 13px;
            background: #fff;
            cursor: pointer;
            transition:
                border-color .15s ease,
                box-shadow .15s ease,
                transform .15s ease;
        }

        .panfletos-card:hover {
            transform: translateY(-1px);
            box-shadow:
                0 8px 24px rgba(0, 0, 0, .07);
        }

        .panfletos-card-selecionado {
            border-color: #111;
            box-shadow:
                0 0 0 2px rgba(0, 0, 0, .06);
        }

        .panfletos-checkbox {
            width: 19px;
            height: 19px;
            flex: 0 0 19px;
            cursor: pointer;
        }

        .panfletos-mini-logo {
            width: 50px;
            height: 50px;
            flex: 0 0 50px;
            object-fit: cover;
            border-radius: 35%;
            background: #f3f3f3;
        }

        .panfletos-mini-logo-fallback {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #555;
            font-size: 18px;
            font-weight: 850;
        }

        .panfletos-card-info {
            min-width: 0;
        }

        .panfletos-card-nome {
            overflow: hidden;
            margin: 0;
            color: #161616;
            font-size: 14px;
            line-height: 1.25;
            font-weight: 800;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .panfletos-card-dominio {
            overflow: hidden;
            margin-top: 4px;
            color: #777;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .panfletos-vazio {
            padding: 35px 20px;
            border: 1px dashed #d8d8d8;
            border-radius: 13px;
            color: #777;
            text-align: center;
        }

        /*
         * =====================================================
         * IMPRESSÃO
         *
         * A4 = 210 x 297 mm.
         *
         * 3 colunas e 3 linhas.
         * As etiquetas ficam com largura aproximada de 1/3
         * da área útil da folha.
         * =====================================================
         */

        .panfletos-impressao {
            display: none;
        }

        .panfletos-folha {
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            padding:
                8mm
                8mm
                18mm;
            background: #fff;
            break-after: page;
        }

        .panfletos-folha:last-child {
            break-after: auto;
        }

        .panfletos-grade {
            width: 100%;
            height: 260mm;
            display: grid;
            grid-template-columns:
                repeat(3, minmax(0, 1fr));
            grid-template-rows:
                repeat(3, 84mm);
            column-gap: 3mm;
            row-gap: 4mm;
            align-content: start;
        }

        .panfletos-etiqueta {
            width: 100%;
            height: 84mm;
            min-width: 0;
            min-height: 0;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            border: .4mm solid #d7d7d7;
            border-radius: 4mm;
            padding: 4mm 4mm 3.5mm;
            background: #fff;
            color: #111;
            text-align: center;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        /*
         * ETIQUETA DO COMÉRCIO
         */

        .panfletos-loja-logo {
            width: 24mm;
            height: 24mm;
            flex: 0 0 24mm;
            object-fit: cover;
            border-radius: 35%;
            background: #f4f4f4;
            margin-bottom: 2.5mm;
        }

        .panfletos-loja-logo-fallback {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #555;
            font-size: 9mm;
            font-weight: 900;
        }

        .panfletos-loja-nome {
            font-family:
                "Manrope",
                "Inter",
                "Segoe UI",
                Arial,
                sans-serif;
            width: 100%;
            max-height: 11mm;
            overflow: hidden;
            margin: 0;
            color: #111;
            font-family:
                "Manrope",
                "Inter",
                "Segoe UI",
                Arial,
                sans-serif;
            font-size: 4.6mm;
            line-height: 1.1;
            font-weight: 850;
            letter-spacing: -.12mm;
            overflow-wrap: anywhere;
        }

        .panfletos-loja-chamada {
            margin:
                1.4mm
                0
                1mm;
            color: #777;
            font-size: 2.55mm;
            line-height: 1.15;
            font-weight: 500;
        }

        .panfletos-loja-qr {
            width: 27mm;
            height: 27mm;
            flex: 0 0 27mm;
            object-fit: contain;
            margin: 0;
        }

        .panfletos-loja-dominio {
            width: 100%;
            overflow: hidden;
            margin-top: 1mm;
            color: #222;
            font-size: 2.55mm;
            line-height: 1.1;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .panfletos-loja-oferta {
            position: absolute;
            left: 4mm;
            right: 4mm;
            bottom: 3.2mm;
            margin: 0;
            color: #111;
            font-size: 2.5mm;
            line-height: 1.15;
            font-weight: 800;
        }

        /*
         * ETIQUETA DE BENEFÍCIOS
         */

        .panfletos-beneficios {
            align-items: flex-start;
            padding:
                4mm
                4.5mm
                3.5mm;
            text-align: left;
        }

        .panfletos-beneficios-logo {
            width: 16mm;
            flex: 0 0 16mm;
            object-fit: contain;
            border-radius: 30%;
            margin-bottom: 1.8mm;
        }

        .panfletos-beneficios-titulo {
            font-family:
                "Manrope",
                "Inter",
                "Segoe UI",
                Arial,
                sans-serif;
            width: 100%;
            margin: 0;
            color: #111;
            font-size: 4.1mm;
            line-height: 1.08;
            font-weight: 850;
            letter-spacing: -.1mm;
        }

        .panfletos-beneficios-subtitulo {
            width: 100%;
            margin:
                1.2mm
                0
                1.8mm;
            color: #777;
            font-size: 2.35mm;
            line-height: 1.15;
        }

        .panfletos-beneficios-lista {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1.2mm;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .panfletos-beneficio-item {
            display: flex;
            align-items: flex-start;
            gap: 1.2mm;
            width: 100%;
            color: #202020;
            font-size: 2.35mm;
            line-height: 1.12;
            font-weight: 650;
        }

        .panfletos-beneficio-check {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 3.3mm;
            height: 3.3mm;
            flex: 0 0 3.3mm;
            border-radius: 50%;
            background: #111;
            color: #fff;
            font-size: 1.9mm;
            line-height: 1;
            font-weight: 900;
        }

        .panfletos-contato {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2mm;
            margin-top: auto;
            padding-top: 1.5mm;
            border-top: .3mm solid #e3e3e3;
        }

        .panfletos-contato-texto {
            min-width: 0;
        }

        .panfletos-contato-titulo {
            margin: 0 0 .7mm;
            color: #111;
            font-size: 2.8mm;
            line-height: 1.1;
            font-weight: 850;
        }

        .panfletos-contato-numero {
            color: #777;
            font-size: 2.1mm;
            line-height: 1.1;
        }

        .panfletos-contato-qr {
            width: 15mm;
            height: 15mm;
            flex: 0 0 15mm;
            object-fit: contain;
        }

        /*
         * RODAPÉ DA FOLHA
         */

        .panfletos-rodape-folha {
            position: absolute;
            left: 8mm;
            right: 8mm;
            bottom: 4.5mm;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2.5mm;
            padding-top: 1.8mm;
            border-top: .3mm solid #e2e2e2;
        }

        .panfletos-rodape-logo {
            width: 9mm;
            height: 9mm;
            object-fit: contain;
        }

        .panfletos-rodape-texto {
            color: #555;
            font-size: 2.3mm;
            line-height: 1;
            font-weight: 700;
        }

        /*
         * =====================================================
         * IMPRESSÃO
         * =====================================================
         */

        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }

            html,
            body {
                width: 210mm !important;
                min-width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
            }

            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            body * {
                visibility: hidden !important;
            }

            .panfletos-impressao,
            .panfletos-impressao * {
                visibility: visible !important;
            }

            .panfletos-tela {
                display: none !important;
            }

            .panfletos-impressao {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .panfletos-folha {
                display: block !important;
                width: 210mm !important;
                height: 297mm !important;
                min-height: 297mm !important;
                max-height: 297mm !important;
                margin: 0 !important;
                padding:
                    8mm
                    8mm
                    18mm !important;
                overflow: hidden !important;
                background: #fff !important;
                break-after: page !important;
            }

            .panfletos-folha:last-child {
                break-after: auto !important;
            }

            .panfletos-grade {
                display: grid !important;
                width: 100% !important;
                height: 260mm !important;
                grid-template-columns:
                    repeat(3, minmax(0, 1fr)) !important;
                grid-template-rows:
                    repeat(3, 84mm) !important;
                column-gap: 3mm !important;
                row-gap: 4mm !important;
            }

            .panfletos-etiqueta {
                display: flex !important;
                visibility: visible !important;
                box-sizing: border-box !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .panfletos-rodape-folha {
                display: flex !important;
                visibility: visible !important;
            }
        }

        @media (max-width: 900px) {
            .panfletos-cabecalho {
                flex-direction: column;
            }

            .panfletos-acoes {
                width: 100%;
            }

            .panfletos-botao {
                flex: 1;
            }

            .panfletos-lista {
                grid-template-columns:
                    repeat(
                        auto-fill,
                        minmax(210px, 1fr)
                    );
            }
        }
    `;

    /*
     * =========================================================
     * ETIQUETA DO COMÉRCIO
     * =========================================================
     */

    function EtiquetaComercio({ comercio }) {
        const dominio = obterDominio(comercio);
        const textoDominio =
            obterTextoDominio(comercio);
        const imagem =
            normalizarImagem(comercio?.imagem);
        const qr =
            gerarQrCode(dominio, 320);

        return (
            <div className="panfletos-etiqueta">
                {imagem ? (
                    <img
                        src={imagem}
                        alt=""
                        className="panfletos-loja-logo"
                    />
                ) : (
                    <div
                        className="
                            panfletos-loja-logo
                            panfletos-loja-logo-fallback
                        "
                    >
                        {String(
                            comercio?.loja || "L"
                        )
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                )}

                <h2 className="panfletos-loja-nome">
                    {comercio?.loja ||
                        "Comércio"}
                </h2>

                <p className="panfletos-loja-chamada">
                    Assim pode ser seu comércio

                </p>

                {qr ? (
                    <img
                        src={qr}
                        alt="QR Code da loja"
                        className="panfletos-loja-qr"
                    />
                ) : (
                    <div
                        className="panfletos-loja-qr"
                    />
                )}

                <div className="panfletos-loja-dominio">
                    {textoDominio ||
                        "Domínio não cadastrado"}
                </div>

                <p className="panfletos-loja-oferta">
                    Por apenas R$ 98,86 mensal,
                    isso pode ser seu + 4% das
                    vendas online
                </p>
            </div>
        );
    }

    /*
     * =========================================================
     * ETIQUETA DE BENEFÍCIOS
     * =========================================================
     */

    function EtiquetaBeneficios() {
        const qrWhatsapp =
            gerarQrCode(
                PANFLETOS_WHATSAPP,
                320
            );

        const beneficios = [
            "Venda no caixa",
            "Administração da empresa",
            "Controle de estoque e produtos",
            "Loja virtual e vendas online",
            "Emissão de notas fiscais",
            "Tudo em um só lugar",
        ];

        return (
            <div
                className="
                    panfletos-etiqueta
                    panfletos-beneficios
                "
            >
                <img
                    src={PANFLETOS_LOGO_IRON}
                    alt="Iron Executions"
                    className="panfletos-beneficios-logo"
                />

                <h2 className="panfletos-beneficios-titulo">
                    Tudo para sua empresa
                    em um só lugar
                </h2>

                <p className="panfletos-beneficios-subtitulo">
                    Simplifique a operação e
                    tenha mais controle do seu negócio.
                </p>

                <ul className="panfletos-beneficios-lista">
                    {beneficios.map((beneficio) => (
                        <li
                            key={beneficio}
                            className="
                                panfletos-beneficio-item
                            "
                        >
                            <span
                                className="
                                    panfletos-beneficio-check
                                "
                            >
                                ✓
                            </span>

                            <span>
                                {beneficio}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="panfletos-contato">
                    <div className="panfletos-contato-texto">
                        <div className="panfletos-contato-titulo">
                            Entre em contato
                        </div>

                        <div className="panfletos-contato-numero">
                            WhatsApp: (11) 91185-47818
                        </div>
                    </div>

                    {qrWhatsapp && (
                        <img
                            src={qrWhatsapp}
                            alt="QR Code do WhatsApp"
                            className="
                                panfletos-contato-qr
                            "
                        />
                    )}
                </div>
            </div>
        );
    }

    /*
     * =========================================================
     * RODAPÉ
     * =========================================================
     */

    function RodapeFolha() {
        return (
            <div className="panfletos-rodape-folha">
                <img
                    src={PANFLETOS_LOGO_IRON}
                    alt="Iron Executions"
                    className="panfletos-rodape-logo"
                />

                <span className="panfletos-rodape-texto">
                    Iron Executions
                </span>
            </div>
        );
    }

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <>
            <style>
                {estiloPanfletos}
            </style>

            <div className="panfletos-root">
                <div className="panfletos-tela">
                    <div className="panfletos-cabecalho">
                        <div>
                            <h1 className="panfletos-titulo">
                                Panfletos
                            </h1>

                            <p className="panfletos-subtitulo">
                                Selecione os comércios e
                                gere as etiquetas para impressão.
                            </p>
                        </div>

                        <div className="panfletos-acoes">
                            <button
                                type="button"
                                className="
                                    panfletos-botao
                                    panfletos-botao-secundario
                                "
                                onClick={limparSelecao}
                                disabled={
                                    selecionados.length === 0
                                }
                            >
                                Limpar seleção
                            </button>

                            <button
                                type="button"
                                className="
                                    panfletos-botao
                                    panfletos-botao-principal
                                "
                                onClick={imprimirPanfletos}
                                disabled={
                                    selecionados.length === 0
                                }
                            >
                                Imprimir
                                {selecionados.length > 0
                                    ? ` (${selecionados.length})`
                                    : ""}
                            </button>
                        </div>
                    </div>

                    <div className="panfletos-controles">
                        <input
                            type="search"
                            className="panfletos-busca"
                            placeholder="Buscar comércio por nome, ID ou domínio..."
                            value={busca}
                            onChange={(evento) =>
                                setBusca(
                                    evento.target.value
                                )
                            }
                        />

                        <button
                            type="button"
                            className="
                                panfletos-botao
                                panfletos-botao-secundario
                            "
                            onClick={selecionarTodos}
                            disabled={
                                comerciosFiltrados.length === 0
                            }
                        >
                            Selecionar todos
                        </button>

                        <div className="panfletos-contador">
                            {selecionados.length} selecionado
                            {selecionados.length === 1
                                ? ""
                                : "s"}
                        </div>
                    </div>

                    {erro && (
                        <div className="panfletos-erro">
                            {erro}
                        </div>
                    )}

                    {carregando ? (
                        <div className="panfletos-vazio">
                            Carregando comércios...
                        </div>
                    ) : comerciosFiltrados.length === 0 ? (
                        <div className="panfletos-vazio">
                            Nenhum comércio encontrado.
                        </div>
                    ) : (
                        <div className="panfletos-lista">
                            {comerciosFiltrados.map(
                                (comercio) => {
                                    const selecionado =
                                        selecionados.some(
                                            (id) =>
                                                String(id) ===
                                                String(comercio.id)
                                        );

                                    const imagem =
                                        normalizarImagem(
                                            comercio.imagem
                                        );

                                    return (
                                        <div
                                            key={comercio.id}
                                            className={
                                                selecionado
                                                    ? `
                                                        panfletos-card
                                                        panfletos-card-selecionado
                                                    `
                                                    : "panfletos-card"
                                            }
                                            onClick={() =>
                                                alternarComercio(
                                                    comercio.id
                                                )
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                className="
                                                    panfletos-checkbox
                                                "
                                                checked={
                                                    selecionado
                                                }
                                                onChange={() =>
                                                    alternarComercio(
                                                        comercio.id
                                                    )
                                                }
                                                onClick={(evento) =>
                                                    evento.stopPropagation()
                                                }
                                            />

                                            {imagem ? (
                                                <img
                                                    src={imagem}
                                                    alt=""
                                                    className="
                                                        panfletos-mini-logo
                                                    "
                                                />
                                            ) : (
                                                <div
                                                    className="
                                                        panfletos-mini-logo
                                                        panfletos-mini-logo-fallback
                                                    "
                                                >
                                                    {String(
                                                        comercio.loja ||
                                                        "L"
                                                    )
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}

                                            <div className="panfletos-card-info">
                                                <p className="panfletos-card-nome">
                                                    {comercio.loja ||
                                                        `Comércio #${comercio.id}`}
                                                </p>

                                                <div className="panfletos-card-dominio">
                                                    {obterTextoDominio(
                                                        comercio
                                                    ) ||
                                                        "Sem domínio cadastrado"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>

                {/*
                 * =================================================
                 * ÁREA DE IMPRESSÃO
                 *
                 * IMPORTANTE:
                 * Primeiro imprimimos TODAS as folhas dos comércios.
                 * Depois imprimimos TODAS as folhas de benefícios.
                 *
                 * Assim, com 10 comércios:
                 *
                 * Folha 1 = comércio 1-9
                 * Folha 2 = comércio 10
                 * Folha 3 = benefícios 1-9
                 * Folha 4 = benefício 10
                 *
                 * Nunca fica comércio / benefício / comércio /
                 * benefício.
                 * =================================================
                 */}

                <div className="panfletos-impressao">
                    {/*
                     * PRIMEIRO BLOCO:
                     * todas as folhas de comércio.
                     */}
                    {paginasComercios.map(
                        (pagina, indicePagina) => (
                            <div
                                className="panfletos-folha"
                                key={
                                    `comercios-${indicePagina}`
                                }
                            >
                                <div className="panfletos-grade">
                                    {pagina.map(
                                        (comercio) => (
                                            <EtiquetaComercio
                                                key={
                                                    `loja-${comercio.id}`
                                                }
                                                comercio={
                                                    comercio
                                                }
                                            />
                                        )
                                    )}
                                </div>

                                <RodapeFolha />
                            </div>
                        )
                    )}

                    {/*
                     * SEGUNDO BLOCO:
                     * todas as folhas de benefícios.
                     *
                     * A quantidade de etiquetas de cada folha
                     * é exatamente igual à quantidade de
                     * comércios daquela página.
                     */}
                    {paginasComercios.map(
                        (pagina, indicePagina) => (
                            <div
                                className="panfletos-folha"
                                key={
                                    `beneficios-${indicePagina}`
                                }
                            >
                                <div className="panfletos-grade">
                                    {pagina.map(
                                        (comercio) => (
                                            <EtiquetaBeneficios
                                                key={
                                                    `beneficio-${comercio.id}`
                                                }
                                            />
                                        )
                                    )}
                                </div>

                                <RodapeFolha />
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}
