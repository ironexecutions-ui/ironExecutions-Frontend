import React, { useEffect, useState } from "react";

import { API_URL } from "../../../../../../config";
import "./nomecamera.css";
import cameraImagem from "../../camera.png";





export default function NomeCamera() {

    const [nome, setNome] = useState("");
    const [nomeOriginal, setNomeOriginal] = useState("");

    const [cadastrado, setCadastrado] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [editandoNome, setEditandoNome] = useState(false);

    /* =========================================================
       CARREGAR NOME DA CÂMERA
    ========================================================= */

    useEffect(() => {

        async function carregarCamera() {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("[CÂMERA] Token não encontrado.");
                    return;
                }

                console.log("[CÂMERA] Buscando configuração...");

                const resposta = await fetch(
                    `${API_URL}/camera/nome`,
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!resposta.ok) {

                    const erro = await resposta.json().catch(() => ({}));

                    throw new Error(
                        erro.detail ||
                        "Erro ao carregar câmera"
                    );
                }

                const dados = await resposta.json();

                console.log(
                    "[CÂMERA] Configuração recebida:",
                    dados
                );

                if (
                    dados.cadastrado &&
                    dados.camera
                ) {

                    const nomeRecebido =
                        dados.camera.nome || "";

                    setNome(nomeRecebido);
                    setNomeOriginal(nomeRecebido);
                    setCadastrado(true);

                } else {

                    setNome("");
                    setNomeOriginal("");
                    setCadastrado(false);

                }

            } catch (erro) {

                console.error(
                    "[CÂMERA] Erro ao carregar:",
                    erro
                );

                setMensagem(
                    erro.message ||
                    "Não foi possível carregar a câmera."
                );

                setTipoMensagem("erro");

            } finally {

                setCarregando(false);

            }

        }

        carregarCamera();

    }, []);


    /* =========================================================
       SALVAR
    ========================================================= */

    async function salvarCamera() {

        const nomeLimpo = nome.trim();

        if (!nomeLimpo) {

            setMensagem(
                "Digite um nome para a câmera."
            );

            setTipoMensagem("erro");

            return;
        }

        if (nomeLimpo.length > 255) {

            setMensagem(
                "O nome pode ter no máximo 255 caracteres."
            );

            setTipoMensagem("erro");

            return;
        }

        try {

            setSalvando(true);
            setMensagem("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Sessão não encontrada."
                );
            }

            console.log(
                "[CÂMERA] Salvando nome:",
                nomeLimpo
            );

            const resposta = await fetch(
                `${API_URL}/camera/nome`,
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        nome: nomeLimpo
                    })
                }
            );

            const dados =
                await resposta.json().catch(() => ({}));

            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao salvar câmera"
                );
            }

            console.log(
                "[CÂMERA] Salvo:",
                dados
            );

            setNome(dados.nome);
            setNomeOriginal(dados.nome);

            setCadastrado(true);
            setEditandoNome(false);
            setMensagem(
                dados.acao === "cadastrado"
                    ? "Câmera cadastrada com sucesso."
                    : "Nome da câmera atualizado com sucesso."
            );

            setTipoMensagem("sucesso");

        } catch (erro) {

            console.error(
                "[CÂMERA] Erro ao salvar:",
                erro
            );

            setMensagem(
                erro.message ||
                "Não foi possível salvar."
            );

            setTipoMensagem("erro");

        } finally {

            setSalvando(false);

        }

    }


    /* =========================================================
       VERIFICAR ALTERAÇÃO
    ========================================================= */

    const foiAlterado =
        nome.trim() !== nomeOriginal.trim();


    /* =========================================================
       CARREGANDO
    ========================================================= */

    if (carregando) {

        return (
            <div className="camera-nome-camera-container">

                <div className="camera-nome-camera-carregando">
                    Carregando configuração...
                </div>

            </div>
        );
    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="camera-nome-camera-container">

            <div className="camera-nome-camera-cabecalho">

                <div>

                    <h2 className="camera-nome-camera-titulo">
                        Identificação da câmera
                    </h2>

                    <p className="camera-nome-camera-descricao">
                        Defina como esta câmera será identificada dentro do sistema.
                    </p>

                </div>

            </div>


            {/* =====================================================
            CÂMERA JÁ CADASTRADA
        ===================================================== */}

            {cadastrado && !editandoNome && (

                <div className="camera-identificacao-card">

                    <div className="camera-identificacao-topo">


                        <div className="camera-identificacao-icone">

                            <img
                                src={cameraImagem}
                                alt="Câmera"
                                className="camera-identificacao-imagem"
                            />



                        </div>


                        <div className="camera-identificacao-status">

                            <span className="camera-identificacao-status-ponto" />

                            Câmera cadastrada

                        </div>

                    </div>


                    <div className="camera-identificacao-corpo">

                        <span className="camera-identificacao-label">
                            Nome da câmera
                        </span>

                        <strong className="camera-identificacao-nome">
                            {nomeOriginal}
                        </strong>

                        <span className="camera-identificacao-info">
                            Identificação utilizada no sistema
                        </span>

                    </div>


                    <div className="camera-identificacao-rodape">

                        <button
                            type="button"
                            className="camera-identificacao-editar"
                            onClick={() => {

                                setNome(nomeOriginal);
                                setMensagem("");
                                setEditandoNome(true);

                            }}
                        >
                            Editar nome
                        </button>

                    </div>

                </div>

            )}


            {/* =====================================================
            CADASTRO / EDIÇÃO
        ===================================================== */}

            {(!cadastrado || editandoNome) && (

                <div className="camera-nome-camera-formulario">

                    <label
                        className="camera-nome-camera-label"
                        htmlFor="camera-nome"
                    >
                        {cadastrado
                            ? "Alterar nome da câmera"
                            : "Nome da câmera"
                        }
                    </label>


                    <input
                        id="camera-nome"
                        type="text"
                        value={nome}
                        maxLength={255}
                        disabled={salvando}
                        placeholder="Ex: Camera do caixa"
                        className="camera-nome-camera-input"

                        onChange={(event) => {

                            let valor = event.target.value;

                            valor = valor.replace(
                                /[^\p{L}\p{N}\s]/gu,
                                ""
                            );

                            valor = valor.replace(
                                /\s+/g,
                                " "
                            );

                            if (valor.length > 0) {

                                valor =
                                    valor
                                        .charAt(0)
                                        .toLocaleUpperCase("pt-BR") +
                                    valor.slice(1);

                            }

                            setNome(valor);

                            if (mensagem) {
                                setMensagem("");
                            }

                        }}

                        onKeyDown={(event) => {

                            if (
                                event.key === "Enter" &&
                                !salvando &&
                                (!cadastrado || foiAlterado)
                            ) {

                                salvarCamera();

                            }

                        }}
                    />


                    <div className="camera-nome-camera-rodape">

                        <span className="camera-nome-camera-contador">
                            {nome.length}/255
                        </span>


                        <div className="camera-nome-camera-acoes">

                            {cadastrado && (

                                <button
                                    type="button"
                                    className="camera-nome-camera-cancelar"
                                    disabled={salvando}
                                    onClick={() => {

                                        setNome(nomeOriginal);
                                        setMensagem("");
                                        setEditandoNome(false);

                                    }}
                                >
                                    Cancelar
                                </button>

                            )}


                            <button
                                type="button"
                                onClick={salvarCamera}
                                disabled={
                                    salvando ||
                                    !nome.trim() ||
                                    (cadastrado && !foiAlterado)
                                }
                                className="camera-nome-camera-botao"
                            >

                                {salvando
                                    ? "Salvando..."
                                    : cadastrado
                                        ? "Salvar alteração"
                                        : "Cadastrar câmera"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
            MENSAGEM
        ===================================================== */}

            {mensagem && (

                <div
                    className={
                        `camera-nome-camera-mensagem ${tipoMensagem === "sucesso"
                            ? "camera-nome-camera-mensagem-sucesso"
                            : "camera-nome-camera-mensagem-erro"
                        }`
                    }
                >
                    {mensagem}
                </div>

            )}

        </div>

    );
}