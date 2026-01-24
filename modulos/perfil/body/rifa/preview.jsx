import React, { useState, useMemo } from "react";
import "./preview.css";

export default function RifaPreview({ rifas = [], onSalvarNome }) {
    const [indexAtual, setIndexAtual] = useState(0);
    const [editando, setEditando] = useState(false);
    const [nomeEditavel, setNomeEditavel] = useState("");

    const rifa =
        Array.isArray(rifas) && rifas.length > 0
            ? rifas[indexAtual]
            : null;

    // ===============================
    // 🔢 GERAR NÚMEROS A PARTIR DE "1-100"
    // ===============================
    const numerosOrdenados = useMemo(() => {
        if (!rifa || !rifa.numeros) return [];

        const partes = String(rifa.numeros).split("-");

        if (partes.length !== 2) return [];

        const inicio = Number(partes[0]);
        const fim = Number(partes[1]);

        if (
            !Number.isInteger(inicio) ||
            !Number.isInteger(fim) ||
            inicio <= 0 ||
            fim < inicio
        ) {
            return [];
        }

        return Array.from(
            { length: fim - inicio + 1 },
            (_, i) => inicio + i
        );
    }, [rifa]);

    function iniciarEdicao() {
        if (!rifa) return;
        setNomeEditavel(rifa.nome || "");
        setEditando(true);
    }

    function cancelarEdicao() {
        setEditando(false);
        setNomeEditavel("");
    }

    async function salvarEdicao() {
        if (!rifa || !nomeEditavel.trim()) return;
        await onSalvarNome(rifa.id, nomeEditavel);
        setEditando(false);
    }

    function proximaRifa() {
        if (indexAtual < rifas.length - 1) {
            setIndexAtual(prev => prev + 1);
            setEditando(false);
        }
    }

    function rifaAnterior() {
        if (indexAtual > 0) {
            setIndexAtual(prev => prev - 1);
            setEditando(false);
        }
    }

    if (!rifa) {
        return (
            <div className="rifa-preview">
                <p>Nenhuma rifa cadastrada</p>
            </div>
        );
    }

    return (
        <div className="rifa-preview">
            <div className="rifa-preview-header">
                {!editando ? (
                    <>
                        <h4>{rifa.nome}</h4>
                        <button onClick={iniciarEdicao}>Editar</button>
                    </>
                ) : (
                    <div className="rifa-edicao">
                        <input
                            type="text"
                            value={nomeEditavel}
                            onChange={e => setNomeEditavel(e.target.value)}
                        />
                        <div className="rifa-edicao-acoes">
                            <button onClick={salvarEdicao}>Salvar</button>
                            <button onClick={cancelarEdicao} className="secundario">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="rifa-info">
                <span>Números: {rifa.numeros}</span>
                <span>Preço: R$ {rifa.preco}</span>
            </div>

            <div className="rifa-numeros">
                {numerosOrdenados.length > 0 ? (
                    numerosOrdenados.map(numero => (
                        <div key={numero} className="rifa-numero">
                            {numero}
                        </div>
                    ))
                ) : (
                    <span className="rifa-vazia">
                        Nenhum número gerado
                    </span>
                )}
            </div>

            {/* ===============================
                BOTÕES DE NAVEGAÇÃO
               =============================== */}
            <div className="rifa-navegacao">
                {indexAtual > 0 && (
                    <button
                        className="ver-mais"
                        onClick={rifaAnterior}
                    >
                        Ver rifa anterior
                    </button>
                )}

                {indexAtual < rifas.length - 1 && (
                    <button
                        className="ver-mais"
                        onClick={proximaRifa}
                    >
                        Ver próxima rifa
                    </button>
                )}
            </div>
        </div>
    );
}
