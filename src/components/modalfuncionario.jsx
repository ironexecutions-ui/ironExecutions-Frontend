import React, { useState } from "react";
import './modalfuncionario.css';
import { API_URL } from "../../config";
import { useGoogleLogin } from "@react-oauth/google";

export default function ModalFuncionario({ fechar }) {

    const [email, setEmail] = useState("");
    const [etapa, setEtapa] = useState("email");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [funcionarioTemp, setFuncionarioTemp] = useState(null);

    const loginGoogle = useGoogleLogin({
        onSuccess: async (token) => {
            try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                    },
                });

                const data = await res.json();

                const emailExtraido = data.email;
                setEmail(emailExtraido);

                validarEmailNoBD(emailExtraido);

            } catch (err) {
                setErro("Houve um problema ao buscar informações do Google");
            }
        },

        onError: () => {
            setErro("Não foi possível entrar com o Google");
        }
    });

    async function validarEmailNoBD(emailChamado) {
        try {
            const r = await fetch(`${API_URL}/api/verificar-email?email=${emailChamado}`);
            const resp = await r.json();

            if (resp.existe) {

                // buscar dados completos ANTES de pedir a senha
                const dados = await fetch(`${API_URL}/api/dados-funcionario?email=${emailChamado}`);
                const funcionario = await dados.json();

                setFuncionarioTemp(funcionario);

                setEtapa("senha");

            } else {
                setErro("Este email não está cadastrado como funcionário");
            }

        } catch {
            setErro("Erro ao conectar com o servidor");
        }
    }

    async function validarSenha() {
        try {
            const r = await fetch(`${API_URL}/api/verificar-senha`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const resp = await r.json();

            if (resp.ok) {

                const dados = await fetch(`${API_URL}/api/dados-funcionario?email=${email}`);
                const funcionario = await dados.json();

                localStorage.setItem("funcionario", JSON.stringify(funcionario));

                window.location.href = "/painel";
            }
            else {
                setErro("Senha incorreta");
            }

        } catch {
            setErro("Não foi possível conectar com o servidor");
        }
    }

    return (
        <div className="mf-overlay">
            <div className="mf-card">

                <h2>Área de Funcionários</h2>

                {erro && <p className="mf-erro">{erro}</p>}

                {etapa === "email" && (
                    <>
                        <p>Entre usando sua conta Google cadastrada como funcionário.</p>

                        <button className="mf-btn" onClick={() => loginGoogle()}>
                            Entrar com Google
                        </button>
                    </>
                )}

                {etapa === "senha" && funcionarioTemp && (
                    <>
                        <div className="mf-info-funcionario">

                            {funcionarioTemp.foto && (
                                <img
                                    src={funcionarioTemp.foto}
                                    alt="Foto do funcionário"
                                    className="mf-foto"
                                />
                            )}

                            <h3>{funcionarioTemp.nome} {funcionarioTemp.sobrenome}</h3>

                            {funcionarioTemp.funcao && (
                                <p className="mf-funcao">{funcionarioTemp.funcao}</p>
                            )}
                        </div>

                        <p>Digite sua senha para continuar.</p>

                        <input
                            type="password"
                            className="mf-input"
                            placeholder="Sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />

                        <button className="mf-btn" onClick={validarSenha}>
                            Entrar
                        </button>
                    </>
                )}

                <button className="mf-fechar" onClick={fechar}>Fechar</button>
            </div>
        </div>
    );
}
