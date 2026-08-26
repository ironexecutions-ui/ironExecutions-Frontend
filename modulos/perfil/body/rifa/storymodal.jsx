import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { createPortal } from "react-dom";

import "./storymodal.css";

export default function StoryModal({
    rifa,
    compras,
    onClose
}) {
    const gradeRef = useRef(null);

    const [dimensoesGrade, setDimensoesGrade] = useState({
        largura: 0,
        altura: 0
    });

    // =========================================================
    // INTERVALO DA RIFA
    // =========================================================

    const { inicio, fim } = useMemo(() => {
        const numeros = String(rifa?.numeros || "")
            .split("-")
            .map(Number);

        const inicioCalculado = numeros[0];
        const fimCalculado = numeros[1];

        if (
            !Number.isFinite(inicioCalculado) ||
            !Number.isFinite(fimCalculado) ||
            fimCalculado < inicioCalculado
        ) {
            return {
                inicio: 0,
                fim: -1
            };
        }

        return {
            inicio: inicioCalculado,
            fim: fimCalculado
        };
    }, [rifa?.numeros]);


    // =========================================================
    // TODOS OS NÚMEROS
    // =========================================================

    const numeros = useMemo(() => {
        if (fim < inicio) {
            return [];
        }

        return Array.from(
            {
                length: fim - inicio + 1
            },
            (_, index) => inicio + index
        );
    }, [inicio, fim]);


    // =========================================================
    // NÚMEROS VENDIDOS
    // =========================================================

    const comprados = useMemo(() => {
        return new Set(
            (compras || []).map(compra =>
                Number(compra.numero)
            )
        );
    }, [compras]);


    // =========================================================
    // ESC FECHA O STORY
    // =========================================================

    useEffect(() => {
        function aoPressionarTecla(event) {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose?.();
            }
        }

        window.addEventListener(
            "keydown",
            aoPressionarTecla
        );

        return () => {
            window.removeEventListener(
                "keydown",
                aoPressionarTecla
            );
        };
    }, [onClose]);


    // =========================================================
    // BLOQUEAR SCROLL DA PÁGINA ATRÁS
    // =========================================================

    useEffect(() => {
        const overflowAnterior =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow =
                overflowAnterior;
        };
    }, []);


    // =========================================================
    // MEDIR ESPAÇO REAL DISPONÍVEL PARA A GRADE
    // =========================================================

    useEffect(() => {
        const elemento = gradeRef.current;

        if (!elemento) {
            return;
        }

        function atualizarDimensoes() {
            const rect =
                elemento.getBoundingClientRect();

            setDimensoesGrade({
                largura: rect.width,
                altura: rect.height
            });
        }

        atualizarDimensoes();

        const observer =
            new ResizeObserver(atualizarDimensoes);

        observer.observe(elemento);

        window.addEventListener(
            "resize",
            atualizarDimensoes
        );

        return () => {
            observer.disconnect();

            window.removeEventListener(
                "resize",
                atualizarDimensoes
            );
        };
    }, []);


    // =========================================================
    // CALCULAR GRADE PARA TODOS OS NÚMEROS CABEREM
    // =========================================================

    const configuracaoGrade = useMemo(() => {
        const quantidade = numeros.length;

        const largura =
            dimensoesGrade.largura;

        const altura =
            dimensoesGrade.altura;

        if (
            quantidade === 0 ||
            largura <= 0 ||
            altura <= 0
        ) {
            return {
                colunas: 1,
                linhas: 1,
                tamanho: 30,
                gap: 3,
                fonte: 10
            };
        }

        let melhor = null;

        /*
            Testamos todas as quantidades possíveis
            de colunas e escolhemos a configuração
            que produz o maior quadrado possível.
        */
        for (
            let colunas = 1;
            colunas <= quantidade;
            colunas++
        ) {
            const linhas =
                Math.ceil(
                    quantidade / colunas
                );

            /*
                Gap pequeno porque a prioridade
                é fazer todos os números caberem.
            */
            const gap = quantidade > 300
                ? 1
                : quantidade > 150
                    ? 2
                    : 3;

            const larguraDisponivel =
                largura -
                gap * (colunas - 1);

            const alturaDisponivel =
                altura -
                gap * (linhas - 1);

            if (
                larguraDisponivel <= 0 ||
                alturaDisponivel <= 0
            ) {
                continue;
            }

            const tamanho =
                Math.min(
                    larguraDisponivel / colunas,
                    alturaDisponivel / linhas
                );

            if (
                !melhor ||
                tamanho > melhor.tamanho
            ) {
                melhor = {
                    colunas,
                    linhas,
                    tamanho,
                    gap
                };
            }
        }

        if (!melhor) {
            return {
                colunas: 1,
                linhas: quantidade,
                tamanho: 10,
                gap: 1,
                fonte: 7
            };
        }

        /*
            Fonte proporcional ao quadrado.
            Existe um limite para não ficar
            exageradamente grande.
        */
        const fonte = Math.max(
            6,
            Math.min(
                17,
                melhor.tamanho * 0.36
            )
        );

        return {
            ...melhor,
            fonte
        };
    }, [
        numeros.length,
        dimensoesGrade
    ]);


    // =========================================================
    // VARIÁVEIS CSS DINÂMICAS
    // =========================================================

    const estiloGrade = {
        "--story-colunas":
            configuracaoGrade.colunas,

        "--story-gap":
            `${configuracaoGrade.gap}px`,

        "--story-tamanho-numero":
            `${configuracaoGrade.tamanho}px`,

        "--story-fonte-numero":
            `${configuracaoGrade.fonte}px`
    };


    // =========================================================
    // SEM RIFA
    // =========================================================

    if (!rifa) {
        return null;
    }


    // =========================================================
    // PORTAL
    // =========================================================

    return createPortal(
        <div className="story-portal-overlay-premium">
            <section
                className="story-container-celular-premium"
                role="dialog"
                aria-modal="true"
                aria-label={`Story da rifa ${rifa.premio || ""}`}
            >
                <header className="story-cabecalho-premio-premium">
                    <span className="story-label-premio-premium">
                        PRÊMIO
                    </span>

                    <h1 className="story-titulo-premio-premium">
                        {rifa.premio}
                    </h1>
                </header>

                <div
                    ref={gradeRef}
                    className="story-area-grade-premium"
                >
                    {numeros.length > 0 ? (
                        <div
                            className="story-grade-numeros-premium"
                            style={estiloGrade}
                        >
                            {numeros.map(numero => {
                                const vendido =
                                    comprados.has(numero);

                                return (
                                    <div
                                        key={numero}
                                        className={[
                                            "story-numero-premium",
                                            vendido
                                                ? "story-numero-premium-vendido"
                                                : "story-numero-premium-disponivel"
                                        ].join(" ")}
                                    >
                                        {numero}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="story-sem-numeros-premium">
                            Nenhum número disponível
                        </div>
                    )}
                </div>
            </section>
        </div>,
        document.body
    );
}