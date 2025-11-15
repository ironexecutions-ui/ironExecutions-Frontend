import React, { useState } from "react";
import "./dadosadmin.css";
import { API_URL } from "../../../../../config";

export default function DadosAdmin() {

    const funcionario = JSON.parse(localStorage.getItem("funcionario") || "{}");

    const [editando, setEditando] = useState(null); // nome, sobrenome, email, senha, foto
    const [valorTemp, setValorTemp] = useState("");

    const [mensagem, setMensagem] = useState("");

    function iniciarEdicao(campo, valorAtual) {
        setEditando(campo);
        setValorTemp(valorAtual || "");
    }

    async function salvarCampo(campo) {

        setMensagem("");

        try {
            let valorEnviado = valorTemp;

            if (!valorEnviado || valorEnviado.trim() === "") {
                setMensagem("Este campo não pode ficar vazio");
                return;
            }

            if (valorTemp === funcionario[campo]) {
                setMensagem("Nada foi alterado");
                setEditando(null);
                return;
            }

            if (campo === "senha") {
                valorEnviado = valorTemp.trim();
            }

            // monta o objeto apenas com o campo específico
            const dadosEnviar = {};
            dadosEnviar.id = funcionario.id;
            dadosEnviar[campo] = valorEnviado;

            const resp = await fetch(`${API_URL}/api/usuarios/atualizar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosEnviar)
            });

            const dados = await resp.json();

            if (resp.ok) {

                // atualiza só o campo alterado
                const atualizado = {
                    ...funcionario,
                    [campo]: valorEnviado
                };

                localStorage.setItem("funcionario", JSON.stringify(atualizado));

                setMensagem("Alteração salva com sucesso");
                setEditando(null);

            } else {
                setMensagem(dados.erro || "Erro ao salvar");
            }

        } catch (err) {
            setMensagem("Erro de conexão");
        }
    }



    return (
        <div className="da-box">

            <h2 className="da-titulo">Meus Dados</h2>

            {/* FOTO */}
            <div className="da-item">
                <span>Foto</span>

                <div className="da-foto-area-mini">
                    <img src={funcionario.foto || "https://via.placeholder.com/120"} className="da-foto-mini" />
                </div>

                {editando === "foto" ? (
                    <>
                        <input
                            className="da-input"
                            value={valorTemp}
                            onChange={e => setValorTemp(e.target.value)}
                        />
                        <button className="da-salvar-mini" onClick={() => salvarCampo("foto")}>Salvar</button>
                    </>
                ) : (
                    <button className="da-editar" onClick={() => iniciarEdicao("foto", funcionario.foto)}>Editar</button>
                )}
            </div>


            {/* NOME */}
            <div className="da-item">
                <span>Nome</span>

                {editando === "nome" ? (
                    <>
                        <input
                            className="da-input"
                            value={valorTemp}
                            onChange={e => setValorTemp(e.target.value)}
                        />
                        <button className="da-salvar-mini" onClick={() => salvarCampo("nome")}>Salvar</button>
                    </>
                ) : (
                    <>
                        <p>{funcionario.nome}</p>
                        <button className="da-editar" onClick={() => iniciarEdicao("nome", funcionario.nome)}>Editar</button>
                    </>
                )}
            </div>


            {/* SOBRENOME */}
            <div className="da-item">
                <span>Sobrenome</span>

                {editando === "sobrenome" ? (
                    <>
                        <input
                            className="da-input"
                            value={valorTemp}
                            onChange={e => setValorTemp(e.target.value)}
                        />
                        <button className="da-salvar-mini" onClick={() => salvarCampo("sobrenome")}>Salvar</button>
                    </>
                ) : (
                    <>
                        <p>{funcionario.sobrenome}</p>
                        <button className="da-editar" onClick={() => iniciarEdicao("sobrenome", funcionario.sobrenome)}>Editar</button>
                    </>
                )}
            </div>


            {/* EMAIL */}
            <div className="da-item">
                <span>Email</span>

                {editando === "email" ? (
                    <>
                        <input
                            className="da-input"
                            value={valorTemp}
                            onChange={e => setValorTemp(e.target.value)}
                        />
                        <button className="da-salvar-mini" onClick={() => salvarCampo("email")}>Salvar</button>
                    </>
                ) : (
                    <>
                        <p>{funcionario.email}</p>
                        <button className="da-editar" onClick={() => iniciarEdicao("email", funcionario.email)}>Editar</button>
                    </>
                )}
            </div>


            {/* SENHA */}
            <div className="da-item">
                <span>Senha</span>

                {editando === "senha" ? (
                    <>
                        <input
                            type="password"
                            className="da-input"
                            placeholder="Nova senha"
                            value={valorTemp}
                            onChange={e => setValorTemp(e.target.value)}
                        />
                        <button className="da-salvar-mini" onClick={() => salvarCampo("senha")}>Salvar</button>
                    </>
                ) : (
                    <>
                        <p>••••••••</p>
                        <button className="da-editar" onClick={() => iniciarEdicao("senha", "")}>Editar</button>
                    </>
                )}
            </div>

            {mensagem && <p className="da-mensagem">{mensagem}</p>}

        </div>
    );
}
