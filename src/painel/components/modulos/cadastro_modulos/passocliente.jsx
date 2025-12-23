import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./passocliente.css";

export default function Passo4Cliente({ onFinalizar }) {


    const [email, setEmail] = useState("");
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [cargo, setCargo] = useState("");
    const [funcao, setFuncao] = useState("");
    const [matricula, setMatricula] = useState("");

    const [erro, setErro] = useState("");

    async function emailExiste(emailDigitado) {
        return false;
    }

    async function enviar(e) {
        e.preventDefault();
        setErro("");

        if (!email.trim()) {
            setErro("Digite o email");
            return;
        }

        const existe = await emailExiste(email);

        if (existe) {
            setErro("Este email já está cadastrado");
            return;
        }

        if (!nomeCompleto.trim()) {
            setErro("Digite o nome completo");
            return;
        }

        if (senha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem");
            return;
        }

        onFinalizar({
            email: email,
            nome_completo: nomeCompleto,
            senha: senha,
            cargo: cargo,
            funcao: funcao,
            matricula: matricula || null
        });

    }

    return (
        <div className="passo4-container">
            <h3 className="titulo">Informações do responsável pelo comércio</h3>

            <form onSubmit={enviar} className="formulario">

                {erro && (
                    <div className="erro-box">
                        {erro}
                    </div>
                )}

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="input-texto"
                />

                <label>Nome completo</label>
                <input
                    type="text"
                    value={nomeCompleto}
                    onChange={e => setNomeCompleto(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="input-texto"
                />

                <label>Senha</label>
                <input
                    type="password"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Digite a senha"
                    className="input-texto"
                />

                <label>Confirmar senha</label>
                <input
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
                    className="input-texto"
                />

                <label>Cargo</label>
                <input
                    type="text"
                    value={cargo}
                    onChange={e => setCargo(e.target.value)}
                    placeholder="Exemplo gerente"
                    className="input-texto"
                />

                <label>Função</label>
                <input
                    list="funcao" type="text"
                    value={funcao}
                    onChange={e => setFuncao(e.target.value)}
                    placeholder="Exemplo administrador do sistema"
                    className="input-texto"
                />
                <datalist id="funcao" >
                    <option value="Administrador(a)">Administrador(a)</option>
                    <option value="Supervisor(a)">Supervisor(a)</option>
                    <option value="Funcionario(a)">Funcionari(a)</option>
                </datalist>
                <label>Matrícula do comércio (opcional)</label>
                <input
                    type="text"
                    value={matricula}
                    onChange={e => setMatricula(e.target.value)}
                    placeholder="Opcional"
                    className="input-texto"
                />

                <button type="submit" className="botao-enviar">
                    Finalizar cadastro
                </button>

            </form>
        </div>
    );
}
