import React, { useState } from "react";
import { createPortal } from "react-dom";

import { URL } from "../../url";

import "./modaleditarcliente.css";


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function primeiraMaiusculaPalavras(texto) {

    if (!texto) {
        return "";
    }

    return texto
        .toLocaleLowerCase("pt-BR")
        .replace(
            /(^|[\s'-])([\p{L}])/gu,
            (resultado, separador, letra) =>
                separador + letra.toLocaleUpperCase("pt-BR")
        );
}


function gerarCodigoBarrasAleatorio() {

    const numeros = new Uint32Array(12);

    crypto.getRandomValues(numeros);

    return Array.from(numeros)
        .map((numero) => numero % 10)
        .join("");
}


function gerarQrCodeAleatorio() {

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const numeros = new Uint32Array(16);

    crypto.getRandomValues(numeros);

    return Array.from(numeros)
        .map(
            (numero) =>
                caracteres[
                numero % caracteres.length
                ]
        )
        .join("");
}


/* =========================================================
   COMPONENTE
========================================================= */

export default function ModalEditarCliente({
    cliente,
    fechar,
    atualizar
}) {

    const editando = Boolean(cliente);

    /*
        Quando for cadastro novo:
        código e QR Code já começam preenchidos.

        Quando for edição:
        mantém exatamente os códigos que já estão
        cadastrados para o usuário.
    */

    const [form, setForm] = useState(() => ({
        email: cliente?.email || "",

        nome_completo:
            cliente?.nome_completo || "",

        cargo:
            cliente?.cargo || "",

        matricula:
            cliente?.matricula || "",

        funcao:
            cliente?.funcao ||
            "Funcionario(a)",

        codigo:
            cliente?.codigo ||
            gerarCodigoBarrasAleatorio(),

        qrcode:
            cliente?.qrcode ||
            gerarQrCodeAleatorio(),

        senha: ""
    }));


    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState("");

    const [sucesso, setSucesso] =
        useState("");


    /* =====================================================
       ALTERAR CAMPO
    ===================================================== */

    function alterar(campo, valor) {

        let valorFinal = valor;

        if (
            campo === "nome_completo" ||
            campo === "cargo"
        ) {
            valorFinal =
                primeiraMaiusculaPalavras(valor);
        }

        if (campo === "codigo") {

            valorFinal = valor
                .replace(/\D/g, "")
                .slice(0, 30);
        }

        if (campo === "qrcode") {

            valorFinal = valor
                .toUpperCase()
                .replace(
                    /[^A-Z0-9]/g,
                    ""
                )
                .slice(0, 100);
        }

        setForm((anterior) => ({
            ...anterior,
            [campo]: valorFinal
        }));

        setErro("");
        setSucesso("");
    }


    /* =====================================================
       GERAR NOVO CÓDIGO DE BARRAS
    ===================================================== */

    function gerarCodigoLocal() {

        const novoCodigo =
            gerarCodigoBarrasAleatorio();

        console.log(
            "[CONTROLE] Novo código de barras:",
            novoCodigo
        );

        alterar(
            "codigo",
            novoCodigo
        );
    }


    /* =====================================================
       GERAR NOVO QR CODE
    ===================================================== */

    function gerarQrCodeLocal() {

        const novoQrCode =
            gerarQrCodeAleatorio();

        console.log(
            "[CONTROLE] Novo QR Code:",
            novoQrCode
        );

        alterar(
            "qrcode",
            novoQrCode
        );
    }


    /* =====================================================
       SALVAR
    ===================================================== */

    async function salvar() {

        if (salvando) {
            return;
        }

        setErro("");
        setSucesso("");


        /* =============================================
           VALIDAÇÕES
        ============================================= */

        if (!form.nome_completo.trim()) {

            setErro(
                "Informe o nome completo."
            );

            return;
        }


        if (!form.email.trim()) {

            setErro(
                "Informe o email."
            );

            return;
        }


        if (
            !editando &&
            !form.senha.trim()
        ) {

            setErro(
                "Informe uma senha para o novo usuário."
            );

            return;
        }


        if (
            !editando &&
            form.senha.trim().length < 6
        ) {

            setErro(
                "A senha precisa ter pelo menos 6 caracteres."
            );

            return;
        }


        if (
            editando &&
            form.senha &&
            form.senha.length < 6
        ) {

            setErro(
                "A nova senha precisa ter pelo menos 6 caracteres."
            );

            return;
        }


        if (!form.codigo.trim()) {

            setErro(
                "Informe ou gere um código de barras."
            );

            return;
        }


        if (!form.qrcode.trim()) {

            setErro(
                "Informe ou gere um QR Code."
            );

            return;
        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            setErro(
                "Sessão não encontrada."
            );

            return;
        }


        const url = editando
            ? `${URL}/controle/clientes/${cliente.id}`
            : `${URL}/controle/clientes`;


        const method = editando
            ? "PUT"
            : "POST";


        try {

            setSalvando(true);


            /*
                Antes de enviar, garantimos novamente
                a formatação do nome e cargo.
            */

            const dadosEnviar = {

                ...form,

                email:
                    form.email
                        .trim()
                        .toLowerCase(),

                nome_completo:
                    primeiraMaiusculaPalavras(
                        form.nome_completo.trim()
                    ),

                cargo:
                    primeiraMaiusculaPalavras(
                        form.cargo.trim()
                    ),

                codigo:
                    form.codigo.trim(),

                qrcode:
                    form.qrcode
                        .trim()
                        .toUpperCase()
            };


            console.log(
                "[CONTROLE] Salvando usuário:",
                {
                    ...dadosEnviar,

                    senha:
                        dadosEnviar.senha
                            ? "********"
                            : ""
                }
            );


            const resp = await fetch(
                url,
                {
                    method,

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            dadosEnviar
                        )
                }
            );


            let json = {};


            try {

                json =
                    await resp.json();

            } catch {

                json = {};

            }


            console.log(
                "[CONTROLE] Resposta:",
                resp.status,
                json
            );


            if (!resp.ok) {

                setErro(
                    json?.detail ||
                    "Não foi possível salvar o usuário."
                );

                return;
            }


            setSucesso(
                editando
                    ? "Usuário atualizado com sucesso."
                    : "Usuário adicionado com sucesso."
            );


            await atualizar();

            fechar();


        } catch (error) {

            console.error(
                "[CONTROLE] Erro ao salvar:",
                error
            );


            setErro(
                "Erro de comunicação com o servidor."
            );


        } finally {

            setSalvando(false);

        }
    }


    /* =====================================================
       APAGAR
    ===================================================== */

    async function apagar() {

        if (!cliente) {
            return;
        }


        const confirmar =
            window.confirm(
                "Tem certeza que deseja apagar este usuário? Essa ação não pode ser desfeita."
            );


        if (!confirmar) {
            return;
        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            setErro(
                "Sessão não encontrada."
            );

            return;
        }


        try {

            setSalvando(true);
            setErro("");


            const resp = await fetch(
                `${URL}/controle/clientes/${cliente.id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            let json = {};


            try {

                json =
                    await resp.json();

            } catch {

                json = {};

            }


            if (!resp.ok) {

                setErro(
                    json?.detail ||
                    "Não foi possível apagar o usuário."
                );

                return;
            }


            await atualizar();

            fechar();


        } catch (error) {

            console.error(
                "[CONTROLE] Erro ao apagar:",
                error
            );


            setErro(
                "Erro de comunicação com o servidor."
            );


        } finally {

            setSalvando(false);

        }
    }


    /* =====================================================
       BAIXAR PDF
    ===================================================== */

    async function baixar(tipo) {

        if (!cliente) {
            return;
        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            setErro(
                "Sessão não encontrada."
            );

            return;
        }


        try {

            setErro("");


            const resp = await fetch(
                `${URL}/controle/clientes/${cliente.id}/pdf/${tipo}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!resp.ok) {

                let json = {};


                try {

                    json =
                        await resp.json();

                } catch {

                    json = {};

                }


                setErro(
                    json?.detail ||
                    "Erro ao gerar PDF."
                );

                return;
            }


            const blob =
                await resp.blob();


            const blobUrl =
                window.URL
                    .createObjectURL(blob);


            const a =
                document
                    .createElement("a");


            a.href = blobUrl;


            a.download =
                tipo === "codigo"
                    ? "codigo_barras.pdf"
                    : "qr_code.pdf";


            document.body
                .appendChild(a);


            a.click();

            a.remove();


            window.URL
                .revokeObjectURL(
                    blobUrl
                );


        } catch (error) {

            console.error(
                "[CONTROLE] Erro ao baixar:",
                error
            );


            setErro(
                "Erro ao gerar o arquivo."
            );

        }
    }


    /* =====================================================
       JSX
    ===================================================== */

    return createPortal(

        <div
            className="modal-cliente-overlay-administrativo"

            onMouseDown={(e) => {

                if (
                    e.target ===
                    e.currentTarget
                ) {
                    fechar();
                }

            }}
        >

            <div className="modal-cliente-painel-administrativo">


                {/* =========================================
                    CABEÇALHO
                ========================================= */}

                <div className="modal-cliente-cabecalho-administrativo">

                    <div className="modal-cliente-cabecalho-texto">

                        <span className="modal-cliente-identificador">

                            {editando
                                ? "GERENCIAR USUÁRIO"
                                : "NOVO USUÁRIO"
                            }

                        </span>


                        <h3>

                            {editando
                                ? "Editar usuário"
                                : "Adicionar usuário"
                            }

                        </h3>


                        <p>

                            {editando
                                ? "Atualize os dados, função e formas de identificação deste usuário."
                                : "Cadastre um novo usuário e defina suas informações de acesso."
                            }

                        </p>

                    </div>


                    <button
                        type="button"
                        className="modal-cliente-fechar-superior"
                        onClick={fechar}
                        aria-label="Fechar"
                    >
                        ×
                    </button>

                </div>


                {/* =========================================
                    MENSAGENS
                ========================================= */}

                {erro && (

                    <div className="modal-cliente-alerta-erro">
                        {erro}
                    </div>

                )}


                {sucesso && (

                    <div className="modal-cliente-alerta-sucesso">
                        {sucesso}
                    </div>

                )}


                {/* =========================================
                    IDENTIFICAÇÃO
                ========================================= */}

                {editando && (

                    <div className="modal-cliente-acessos-impressao">

                        <div className="modal-cliente-acessos-texto">

                            <strong>
                                Identificação do usuário
                            </strong>

                            <span>
                                Baixe os códigos utilizados para identificação.
                            </span>

                        </div>


                        <div className="modal-cliente-botoes-download">

                            <button
                                type="button"
                                onClick={() =>
                                    baixar("codigo")
                                }
                            >
                                Código de barras
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    baixar("qrcode")
                                }
                            >
                                QR Code
                            </button>

                        </div>

                    </div>

                )}


                {/* =========================================
                    FORMULÁRIO
                ========================================= */}

                <div className="modal-cliente-formulario-administrativo">


                    {/* NOME */}

                    <div className="modal-cliente-campo modal-cliente-campo-nome">

                        <label htmlFor="modal-cliente-nome">
                            Nome completo
                        </label>

                        <input
                            id="modal-cliente-nome"
                            type="text"

                            value={
                                form.nome_completo
                            }

                            onChange={(e) =>
                                alterar(
                                    "nome_completo",
                                    e.target.value
                                )
                            }

                            placeholder="Nome completo"

                            autoComplete="off"
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="modal-cliente-campo modal-cliente-campo-email">

                        <label htmlFor="modal-cliente-email">
                            Email
                        </label>

                        <input
                            id="modal-cliente-email"
                            type="email"

                            value={
                                form.email
                            }

                            onChange={(e) =>
                                alterar(
                                    "email",
                                    e.target.value
                                )
                            }

                            placeholder="exemplo@email.com"

                            autoComplete="off"
                        />

                    </div>


                    {/* FUNÇÃO */}

                    <div className="modal-cliente-campo modal-cliente-campo-funcao">

                        <label htmlFor="modal-cliente-funcao">
                            Função no sistema
                        </label>

                        <select
                            id="modal-cliente-funcao"

                            value={
                                form.funcao
                            }

                            onChange={(e) =>
                                alterar(
                                    "funcao",
                                    e.target.value
                                )
                            }
                        >

                            <option value="Funcionario(a)">
                                Funcionário(a)
                            </option>

                            <option value="Supervisor(a)">
                                Supervisor(a)
                            </option>

                            <option value="Administrador(a)">
                                Administrador(a)
                            </option>

                        </select>

                    </div>


                    {/* CARGO */}

                    <div className="modal-cliente-campo modal-cliente-campo-cargo">

                        <label htmlFor="modal-cliente-cargo">
                            Cargo
                        </label>

                        <input
                            id="modal-cliente-cargo"
                            type="text"

                            value={
                                form.cargo
                            }

                            onChange={(e) =>
                                alterar(
                                    "cargo",
                                    e.target.value
                                )
                            }

                            placeholder="Ex: Vendedor, Caixa, Gerente"
                        />

                    </div>


                    {/* MATRÍCULA */}

                    <div className="modal-cliente-campo modal-cliente-campo-matricula">

                        <label htmlFor="modal-cliente-matricula">
                            Matrícula
                        </label>

                        <input
                            id="modal-cliente-matricula"
                            type="text"

                            value={
                                form.matricula
                            }

                            onChange={(e) =>
                                alterar(
                                    "matricula",
                                    e.target.value
                                )
                            }

                            placeholder="Matrícula"
                        />

                    </div>


                    {/* SENHA */}

                    <div className="modal-cliente-campo modal-cliente-campo-senha">

                        <label htmlFor="modal-cliente-senha">

                            {editando
                                ? "Nova senha"
                                : "Senha"
                            }

                        </label>

                        <input
                            id="modal-cliente-senha"
                            type="password"

                            value={
                                form.senha
                            }

                            onChange={(e) =>
                                alterar(
                                    "senha",
                                    e.target.value
                                )
                            }

                            placeholder={
                                editando
                                    ? "Deixe vazio para manter a senha atual"
                                    : "Mínimo de 6 caracteres"
                            }

                            autoComplete="new-password"
                        />


                        {editando && (

                            <small className="modal-cliente-campo-ajuda">
                                Deixe vazio caso não queira alterar a senha.
                            </small>

                        )}

                    </div>


                    {/* =====================================
                        CÓDIGO DE BARRAS
                    ===================================== */}

                    <div className="modal-cliente-campo modal-cliente-campo-codigo">

                        <label htmlFor="modal-cliente-codigo">
                            Código de barras
                        </label>


                        <div className="modal-cliente-campo-com-botao">

                            <input
                                id="modal-cliente-codigo"

                                type="text"

                                inputMode="numeric"

                                value={
                                    form.codigo
                                }

                                onChange={(e) =>
                                    alterar(
                                        "codigo",
                                        e.target.value
                                    )
                                }

                                placeholder="Código numérico"
                            />


                            <button
                                type="button"

                                className="modal-cliente-gerar-identificador"

                                onClick={
                                    gerarCodigoLocal
                                }
                            >
                                Gerar
                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        QR CODE
                    ===================================== */}

                    <div className="modal-cliente-campo modal-cliente-campo-qrcode">

                        <label htmlFor="modal-cliente-qrcode">
                            QR Code
                        </label>


                        <div className="modal-cliente-campo-com-botao">

                            <input
                                id="modal-cliente-qrcode"

                                type="text"

                                value={
                                    form.qrcode
                                }

                                onChange={(e) =>
                                    alterar(
                                        "qrcode",
                                        e.target.value
                                    )
                                }

                                placeholder="Código alfanumérico"
                            />


                            <button
                                type="button"

                                className="modal-cliente-gerar-identificador"

                                onClick={
                                    gerarQrCodeLocal
                                }
                            >
                                Gerar
                            </button>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    RODAPÉ
                ========================================= */}

                <div className="modal-cliente-rodape-administrativo">

                    <div className="modal-cliente-rodape-esquerda">

                        {editando && (

                            <button
                                type="button"

                                className="modal-cliente-botao-apagar"

                                onClick={
                                    apagar
                                }

                                disabled={
                                    salvando
                                }
                            >
                                Apagar usuário
                            </button>

                        )}

                    </div>


                    <div className="modal-cliente-rodape-direita">

                        <button
                            type="button"

                            className="modal-cliente-botao-cancelar"

                            onClick={
                                fechar
                            }

                            disabled={
                                salvando
                            }
                        >
                            Cancelar
                        </button>


                        <button
                            type="button"

                            className="modal-cliente-botao-salvar"

                            onClick={
                                salvar
                            }

                            disabled={
                                salvando
                            }
                        >

                            {salvando
                                ? "Salvando..."
                                : editando
                                    ? "Salvar alterações"
                                    : "Adicionar usuário"
                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>,

        document.body
    );
}