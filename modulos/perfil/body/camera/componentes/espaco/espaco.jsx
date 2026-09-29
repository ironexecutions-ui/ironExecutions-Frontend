
import React, {
    useEffect,
    useState
} from "react";

import { API_URL } from "../../../../../../config";

import "./espaco.css";

export default function Espaco() {

    const [dados, setDados] = useState(null);

    const [carregando, setCarregando] =
        useState(true);

    const [erro, setErro] =
        useState("");

    async function carregarEspaco() {

        try {

            setCarregando(true);
            setErro("");

            const token =
                localStorage.getItem("token");

            const resposta = await fetch(
                `${API_URL}/camera-publica/admin/espaco`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const resultado =
                await resposta.json();

            if (!resposta.ok) {

                throw new Error(
                    resultado.detail ||
                    "Não foi possível carregar o espaço."
                );
            }

            setDados(resultado);

        } catch (error) {

            console.error(
                "[CÂMERA ESPAÇO]",
                error
            );

            setErro(
                error.message ||
                "Erro ao carregar espaço."
            );

        } finally {

            setCarregando(false);
        }
    }

    useEffect(() => {

        carregarEspaco();

    }, []);

    if (carregando) {

        return (
            <div className="camera-espaco-container">

                <div className="camera-espaco-carregando">

                    <div className="camera-espaco-spinner" />

                    <strong>
                        Calculando armazenamento
                    </strong>

                    <span>
                        Verificando o espaço utilizado pelos
                        arquivos da câmera.
                    </span>

                </div>

            </div>
        );
    }

    if (erro) {

        return (
            <div className="camera-espaco-container">

                <div className="camera-espaco-erro">

                    <div className="camera-espaco-erro-icone">
                        !
                    </div>

                    <strong>
                        Não foi possível carregar o armazenamento
                    </strong>

                    <span>
                        {erro}
                    </span>

                    <button
                        type="button"
                        onClick={carregarEspaco}
                    >
                        Tentar novamente
                    </button>

                </div>

            </div>
        );
    }

    if (!dados) {
        return null;
    }

    const totalGB =
        Number(dados.espaco_total_gb) || 0;

    const usadoGB =
        Number(dados.espaco_usado_gb) || 0;

    const disponivelGB =
        Number(dados.espaco_disponivel_gb) || 0;

    const percentual =
        Math.min(
            Math.max(
                Number(dados.percentual) || 0,
                0
            ),
            100
        );

    const quantidadeArquivos =
        Number(
            dados.quantidade_arquivos
        ) || 0;

    function formatarGB(valor) {

        return valor
            .toFixed(2)
            .replace(".", ",");
    }

    let statusTexto =
        "Armazenamento saudável";

    let statusClasse =
        "camera-espaco-status-normal";

    if (percentual >= 90) {

        statusTexto =
            "Armazenamento quase cheio";

        statusClasse =
            "camera-espaco-status-critico";

    } else if (percentual >= 70) {

        statusTexto =
            "Armazenamento em atenção";

        statusClasse =
            "camera-espaco-status-atencao";
    }

    return (

        <div className="camera-espaco-container">

            {/* =====================================================
                CABEÇALHO
            ===================================================== */}

            <div className="camera-espaco-cabecalho">

                <div className="camera-espaco-cabecalho-texto">

                    <span className="camera-espaco-kicker">
                        ARMAZENAMENTO
                    </span>

                    <h2>
                        Espaço da câmera
                    </h2>

                    <p>
                        Gerencie e acompanhe o armazenamento
                        utilizado pelas fotos e vídeos da sua câmera.
                    </p>

                </div>

                <button
                    type="button"
                    className="camera-espaco-atualizar"
                    onClick={carregarEspaco}
                    title="Atualizar armazenamento"
                >
                    <span>
                        ↻
                    </span>

                    Atualizar
                </button>

            </div>


            {/* =====================================================
                CARDS RESUMO
            ===================================================== */}

            <div className="camera-espaco-resumo">

                <div className="camera-espaco-card">

                    <div className="camera-espaco-card-topo">

                        <span>
                            Espaço total
                        </span>

                        <div className="camera-espaco-card-icone">
                            GB
                        </div>

                    </div>

                    <strong>
                        {formatarGB(totalGB)}
                        <small>
                            GB
                        </small>
                    </strong>

                    <p>
                        Capacidade contratada
                    </p>

                </div>


                <div className="camera-espaco-card">

                    <div className="camera-espaco-card-topo">

                        <span>
                            Espaço utilizado
                        </span>

                        <div className="camera-espaco-card-icone camera-espaco-card-icone-azul">
                            ↑
                        </div>

                    </div>

                    <strong>
                        {formatarGB(usadoGB)}
                        <small>
                            GB
                        </small>
                    </strong>

                    <p>
                        {percentual
                            .toFixed(1)
                            .replace(".", ",")
                        }% da capacidade
                    </p>

                </div>


                <div className="camera-espaco-card">

                    <div className="camera-espaco-card-topo">

                        <span>
                            Espaço disponível
                        </span>

                        <div className="camera-espaco-card-icone camera-espaco-card-icone-verde">
                            ✓
                        </div>

                    </div>

                    <strong className="camera-espaco-disponivel">
                        {formatarGB(disponivelGB)}
                        <small>
                            GB
                        </small>
                    </strong>

                    <p>
                        Disponível para novos arquivos
                    </p>

                </div>


                <div className="camera-espaco-card">

                    <div className="camera-espaco-card-topo">

                        <span>
                            Arquivos armazenados
                        </span>

                        <div className="camera-espaco-card-icone camera-espaco-card-icone-roxo">
                            #
                        </div>

                    </div>

                    <strong>
                        {quantidadeArquivos.toLocaleString(
                            "pt-BR"
                        )}
                    </strong>

                    <p>
                        Fotos e vídeos
                    </p>

                </div>

            </div>


            {/* =====================================================
                PAINEL PRINCIPAL
            ===================================================== */}

            <div className="camera-espaco-painel">

                <div className="camera-espaco-painel-cabecalho">

                    <div>

                        <span className="camera-espaco-painel-kicker">
                            USO DO ARMAZENAMENTO
                        </span>

                        <h3>
                            Consumo atual
                        </h3>

                        <p>
                            Acompanhe quanto do espaço contratado
                            já foi utilizado.
                        </p>

                    </div>

                    <div
                        className={
                            `camera-espaco-status ${statusClasse}`
                        }
                    >

                        <span />

                        {statusTexto}

                    </div>

                </div>


                {/* =================================================
                    PERCENTUAL
                ================================================= */}

                <div className="camera-espaco-uso">

                    <div className="camera-espaco-uso-valores">

                        <div>

                            <strong>
                                {percentual
                                    .toFixed(1)
                                    .replace(".", ",")
                                }%
                            </strong>

                            <span>
                                utilizado
                            </span>

                        </div>

                        <div className="camera-espaco-uso-total">

                            <strong>
                                {formatarGB(usadoGB)}
                                {" "}
                                GB
                            </strong>

                            <span>
                                de {formatarGB(totalGB)} GB
                            </span>

                        </div>

                    </div>


                    {/* BARRA */}

                    <div className="camera-espaco-barra">

                        <div
                            className="camera-espaco-barra-progresso"
                            style={{
                                width: `${percentual}%`
                            }}
                        />

                    </div>


                    {/* LEGENDA */}

                    <div className="camera-espaco-legenda">

                        <span>

                            <i className="camera-espaco-legenda-ponto camera-espaco-legenda-ponto-usado" />

                            Utilizado

                        </span>

                        <span>

                            <i className="camera-espaco-legenda-ponto camera-espaco-legenda-ponto-disponivel" />

                            Disponível

                        </span>

                    </div>

                </div>


                {/* =================================================
                    INFORMAÇÕES INFERIORES
                ================================================= */}

                <div className="camera-espaco-informacoes">

                    <div>

                        <span>
                            Utilizado
                        </span>

                        <strong>
                            {formatarGB(usadoGB)} GB
                        </strong>

                    </div>

                    <div>

                        <span>
                            Disponível
                        </span>

                        <strong className="camera-espaco-info-verde">
                            {formatarGB(disponivelGB)} GB
                        </strong>

                    </div>

                    <div>

                        <span>
                            Capacidade total
                        </span>

                        <strong>
                            {formatarGB(totalGB)} GB
                        </strong>

                    </div>

                    <div>

                        <span>
                            Arquivos
                        </span>

                        <strong>
                            {quantidadeArquivos.toLocaleString(
                                "pt-BR"
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}

