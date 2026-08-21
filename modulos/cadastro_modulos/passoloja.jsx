import React, { useEffect, useState } from "react";

import { API_URL } from "../../config";
import "./passoloja.css";

export default function Passo1Loja({ onContinuar }) {

    const [form, setForm] = useState({
        loja: "",
        cnpj: "",
        cep: "",
        rua: "",
        bairro: "",
        numero: "",
        cidade: "",
        estado: "",
        email: "",
        celular: ""
    });

    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    function alterarCampo(e) {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }


    function alterarCep(e) {

        let v = e.target.value.replace(/\D/g, "");

        if (v.length > 8) {
            v = v.slice(0, 8);
        }

        if (v.length > 5) {
            v = v.replace(
                /^(\d{5})(\d)/,
                "$1-$2"
            );
        }

        setForm(prev => ({
            ...prev,
            cep: v
        }));
    }


    function alterarNumero(e) {

        const v = e.target.value.replace(/\D/g, "");

        setForm(prev => ({
            ...prev,
            numero: v
        }));
    }


    function alterarEstado(e) {

        const v = e.target.value
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .slice(0, 2);

        setForm(prev => ({
            ...prev,
            estado: v
        }));
    }


    function alterarCelular(e) {

        let v = e.target.value.replace(/\D/g, "");

        if (v.length > 11) {
            v = v.slice(0, 11);
        }

        if (v.length > 6) {

            v = v.replace(
                /^(\d{2})(\d{5})(\d)/,
                "($1) $2-$3"
            );

        } else if (v.length > 2) {

            v = v.replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            );
        }

        setForm(prev => ({
            ...prev,
            celular: v
        }));
    }


    function alterarCnpj(e) {

        let v = e.target.value.replace(/\D/g, "");

        if (v.length > 14) {
            v = v.slice(0, 14);
        }

        v = v.replace(
            /^(\d{2})(\d)/,
            "$1.$2"
        );

        v = v.replace(
            /^(\d{2})\.(\d{3})(\d)/,
            "$1.$2.$3"
        );

        v = v.replace(
            /\.(\d{3})(\d)/,
            ".$1/$2"
        );

        v = v.replace(
            /(\d{4})(\d)/,
            "$1-$2"
        );

        setForm(prev => ({
            ...prev,
            cnpj: v
        }));
    }


    function selecionarImagem(e) {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setErro("Selecione um arquivo de imagem válido.");
            return;
        }

        setErro("");
        setImagem(file);

        setPreview(
            URL.createObjectURL(file)
        );
    }


    function removerImagem() {

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setImagem(null);
        setPreview(null);
    }


    useEffect(() => {

        return () => {

            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };

    }, [preview]);

async function enviarImagemVps(arquivo) {

    const formData = new FormData();

    formData.append("arquivo", arquivo);

    const resp = await fetch(
        `${API_URL}/upload/imagem`,
        {
            method: "POST",
            body: formData
        }
    );

    const json = await resp.json();

    if (!resp.ok) {
        throw new Error(
            json.detail || "Erro ao enviar imagem"
        );
    }

    return json.url;
}
    async function enviar(e) {

        e.preventDefault();

        setErro("");

        if (!form.loja.trim()) {
            setErro("Digite o nome do comércio.");
            return;
        }

        try {

            setCarregando(true);

            let linkFinal = null;

         if (imagem) {

    linkFinal = await enviarImagemVps(
        imagem
    );
}

            onContinuar({
                ...form,
                imagem: linkFinal || null
            });

        } catch (err) {

            console.error(
                "[CADASTRO COMÉRCIO] Erro:",
                err
            );

            setErro(
                "Não foi possível enviar as informações. Tente novamente."
            );

        } finally {

            setCarregando(false);
        }
    }


    return (
        <section className="passo1-loja-painel">

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="passo1-loja-cabecalho">

                <div className="passo1-loja-cabecalho-textos">

                    <span className="passo1-loja-etapa">
                        CONFIGURAÇÃO INICIAL
                    </span>

                    <h3 className="passo1-loja-titulo">
                        Informações do comércio
                    </h3>

                    <p className="passo1-loja-subtitulo">
                        Vamos começar configurando as informações
                        principais que identificarão seu comércio
                        dentro da plataforma.
                    </p>

                </div>


                <div className="passo1-loja-etapa-indicador">

                    <span>
                        Cadastro
                    </span>

                    <strong>
                        1 de 4
                    </strong>

                </div>

            </div>


            <form
                onSubmit={enviar}
                className="passo1-loja-formulario"
            >

                {/* =================================================
                    ERRO
                ================================================= */}

                {erro && (

                    <div className="passo1-loja-erro">

                        <strong>
                            Verifique as informações
                        </strong>

                        <span>
                            {erro}
                        </span>

                    </div>
                )}


                {/* =================================================
                    IDENTIFICAÇÃO
                ================================================= */}

                <div className="passo1-loja-secao">

                    <div className="passo1-loja-secao-cabecalho">

                        <span className="passo1-loja-secao-numero">
                            01
                        </span>

                        <div>

                            <h4>
                                Identificação do comércio
                            </h4>

                            <p>
                                Informe os dados principais
                                do estabelecimento.
                            </p>

                        </div>

                    </div>


                    <div className="passo1-loja-grid">

                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-nome">
                                Nome do comércio
                                
                            </label>

                            <input
                                id="passo1-loja-nome"
                                name="loja"
                                type="text"
                                value={form.loja}
                                onChange={alterarCampo}
                                placeholder="Ex: Mercado Central"
                                className="passo1-loja-input"
                            />

                            <small>
                                Nome que aparecerá dentro do sistema.
                            </small>

                        </div>


                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-cnpj">
                                CNPJ
                            </label>

                            <input
                                id="passo1-loja-cnpj"
                                name="cnpj"
                                type="text"
                                value={form.cnpj}
                                onChange={alterarCnpj}
                                placeholder="00.000.000/0000-00"
                                className="passo1-loja-input"
                                inputMode="numeric"
                            />

                            <small>
                                Informe o CNPJ vinculado ao comércio.
                            </small>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ENDEREÇO
                ================================================= */}

                <div className="passo1-loja-secao">

                    <div className="passo1-loja-secao-cabecalho">

                        <span className="passo1-loja-secao-numero">
                            02
                        </span>

                        <div>

                            <h4>
                                Endereço
                            </h4>

                            <p>
                                Informe a localização principal
                                do estabelecimento.
                            </p>

                        </div>

                    </div>


                    <div className="passo1-loja-grid passo1-loja-grid-endereco">

                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-cep">
                                CEP
                            </label>

                            <input
                                id="passo1-loja-cep"
                                name="cep"
                                type="text"
                                value={form.cep}
                                onChange={alterarCep}
                                placeholder="00000-000"
                                className="passo1-loja-input"
                                inputMode="numeric"
                            />

                        </div>


                        <div className="passo1-loja-campo passo1-loja-campo-rua">

                            <label htmlFor="passo1-loja-rua">
                                Rua
                            </label>

                            <input
                                id="passo1-loja-rua"
                                name="rua"
                                type="text"
                                value={form.rua}
                                onChange={alterarCampo}
                                placeholder="Nome da rua ou avenida"
                                className="passo1-loja-input"
                            />

                        </div>


                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-numero">
                                Número
                            </label>

                            <input
                                id="passo1-loja-numero"
                                name="numero"
                                type="text"
                                value={form.numero}
                                onChange={alterarNumero}
                                placeholder="123"
                                className="passo1-loja-input"
                                inputMode="numeric"
                            />

                        </div>


                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-bairro">
                                Bairro
                            </label>

                            <input
                                id="passo1-loja-bairro"
                                name="bairro"
                                type="text"
                                value={form.bairro}
                                onChange={alterarCampo}
                                placeholder="Bairro"
                                className="passo1-loja-input"
                            />

                        </div>


                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-cidade">
                                Cidade
                            </label>

                            <input
                                id="passo1-loja-cidade"
                                name="cidade"
                                type="text"
                                value={form.cidade}
                                onChange={alterarCampo}
                                placeholder="Cidade"
                                className="passo1-loja-input"
                            />

                        </div>


                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-estado">
                                Estado
                            </label>

                            <input
                                id="passo1-loja-estado"
                                name="estado"
                                type="text"
                                value={form.estado}
                                onChange={alterarEstado}
                                list="passo1-loja-ufs"
                                maxLength={2}
                                placeholder="UF"
                                className="passo1-loja-input"
                            />

                            <datalist id="passo1-loja-ufs">
                                <option value="AC" />
                                <option value="AL" />
                                <option value="AP" />
                                <option value="AM" />
                                <option value="BA" />
                                <option value="CE" />
                                <option value="DF" />
                                <option value="ES" />
                                <option value="GO" />
                                <option value="MA" />
                                <option value="MT" />
                                <option value="MS" />
                                <option value="MG" />
                                <option value="PA" />
                                <option value="PB" />
                                <option value="PR" />
                                <option value="PE" />
                                <option value="PI" />
                                <option value="RJ" />
                                <option value="RN" />
                                <option value="RS" />
                                <option value="RO" />
                                <option value="RR" />
                                <option value="SC" />
                                <option value="SP" />
                                <option value="SE" />
                                <option value="TO" />
                            </datalist>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CONTATO
                ================================================= */}

                <div className="passo1-loja-secao">

                    <div className="passo1-loja-secao-cabecalho">

                        <span className="passo1-loja-secao-numero">
                            03
                        </span>

                        <div>

                            <h4>
                                Contato comercial
                            </h4>

                            <p>
                                Dados utilizados para identificar
                                e entrar em contato com o comércio.
                            </p>

                        </div>

                    </div>


                    <div className="passo1-loja-grid">

                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-email">
                                Email do comércio
                            </label>

                            <input
                                id="passo1-loja-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={alterarCampo}
                                placeholder="contato@comercio.com.br"
                                className="passo1-loja-input"
                                autoComplete="email"
                            />

                        </div>


                        <div className="passo1-loja-campo">

                            <label htmlFor="passo1-loja-celular">
                                Celular
                            </label>

                            <input
                                id="passo1-loja-celular"
                                name="celular"
                                type="tel"
                                value={form.celular}
                                onChange={alterarCelular}
                                placeholder="(00) 00000-0000"
                                className="passo1-loja-input"
                                inputMode="tel"
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    IDENTIDADE VISUAL
                ================================================= */}

                <div className="passo1-loja-secao">

                    <div className="passo1-loja-secao-cabecalho">

                        <span className="passo1-loja-secao-numero">
                            04
                        </span>

                        <div>

                            <h4>
                                Identidade visual
                            </h4>

                            <p>
                                Adicione a logo ou imagem principal
                                que representará seu comércio.
                            </p>

                        </div>

                    </div>


                    <div className="passo1-loja-upload-area">

                        <div className="passo1-loja-upload-preview">

                            {preview ? (

                                <img
                                    src={preview}
                                    alt="Pré-visualização do comércio"
                                    className="passo1-loja-preview-imagem"
                                />

                            ) : (

                                <div className="passo1-loja-preview-vazio">

                                    <span>
                                        IMAGEM
                                    </span>

                                    <strong>
                                        Sua logo aparecerá aqui
                                    </strong>

                                </div>
                            )}

                        </div>


                        <div className="passo1-loja-upload-controles">

                            <div className="passo1-loja-upload-textos">

                                <strong>
                                    Imagem do comércio
                                </strong>

                                <span>
                                    Escolha uma logo ou imagem de boa
                                    qualidade para identificar sua empresa.
                                </span>

                            </div>


                            <label className="passo1-loja-upload-botao">

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={selecionarImagem}
                                />

                                <span>
                                    {imagem
                                        ? "Trocar imagem"
                                        : "Selecionar imagem"}
                                </span>

                            </label>


                            {imagem && (

                                <button
                                    type="button"
                                    onClick={removerImagem}
                                    className="passo1-loja-remover-imagem"
                                >
                                    Remover imagem
                                </button>
                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CONTINUAR
                ================================================= */}

                <div className="passo1-loja-finalizacao">

                    <div className="passo1-loja-finalizacao-info">

                        <span className="passo1-loja-finalizacao-numero">
                            1
                        </span>

                        <div>

                            <strong>
                                Primeira etapa
                            </strong>

                            <span>
                                Depois você poderá configurar
                                as demais informações do sistema.
                            </span>

                        </div>

                    </div>


                    <button
                        type="submit"
                        disabled={carregando}
                        className="passo1-loja-botao-continuar"
                    >

                        <span>
                            {carregando
                                ? "Salvando informações..."
                                : "Continuar cadastro"}
                        </span>

                        {!carregando && (
                            <strong>
                                →
                            </strong>
                        )}

                    </button>

                </div>

            </form>

        </section>
    );
}