import React, { useState } from "react";
import "./arealogin.css";
import { API_URL } from "../../../../../config";

export default function AreaLogin() {

    const [modo, setModo] = useState("email");

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [codigo, setCodigo] = useState("");
    const [qrcode, setQrcode] = useState("");

    const [erro, setErro] = useState("");

    async function fazerLogin(url, body) {
        setErro("");

        // 🔒 LOGOUT GLOBAL ANTES DE LOGAR
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("cliente");
        localStorage.removeItem("clientes");
        localStorage.removeItem("funcionario");

        const resp = await fetch(`${API_URL}${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const json = await resp.json();

        if (!resp.ok) {
            setErro(json.detail);
            return;
        }

        // tenta pegar o token de todos os formatos possíveis
        const token =
            json.token ||
            json.access_token ||
            json.jwt ||
            json.accessToken;

        const cliente =
            json.usuario ||
            json.cliente ||
            json.user;

        if (!token) {
            setErro("Erro no login: token não recebido");
            return;
        }

        if (!cliente) {
            setErro("Erro no login: dados do usuário não recebidos");
            return;
        }

        // salva corretamente
        localStorage.setItem("token", token);

        // extrai o payload do JWT (fonte da verdade)
        const payload = JSON.parse(atob(token.split(".")[1]));

        // salva cliente COM FUNÇÃO, SEM DEPENDER DO BANCO
        localStorage.setItem("cliente", JSON.stringify(payload));



        // redireciona
        window.location.href = "/ironbusiness/perfil";
    }


    function entrarEmail(e) {
        e.preventDefault();
        fazerLogin("/login/email", { email, senha });
    }

    function entrarCodigo(e) {
        e.preventDefault();
        fazerLogin("/login/codigo", { codigo });
    }

    function entrarQrcode(e) {
        e.preventDefault();
        fazerLogin("/login/qrcode", { qrcode });
    }

    return (
        <div className="area-login-container">
            <h2>Entrar</h2>

            <div className="modo-botoes">
                <button onClick={() => setModo("email")}>Email e senha</button>
                <button onClick={() => setModo("codigo")}>Código de Barras</button>
                <button onClick={() => setModo("qrcode")}>QR Code</button>
            </div>

            {erro && <p className="erro">{erro}</p>}

            {modo === "email" && (
                <form onSubmit={entrarEmail} className="area-login-form">
                    <label>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} />

                    <label>Senha</label>
                    <input type="password" value={senha} onChange={e => setSenha(e.target.value)} />

                    <button type="submit">Entrar</button>
                </form>
            )}

            {modo === "codigo" && (
                <form onSubmit={entrarCodigo} className="area-login-form">
                    <label>Código de Barras</label>
                    <input style={{ color: "transparent" }} value={codigo} onChange={e => setCodigo(e.target.value)} />

                    <button type="submit">Entrar</button>
                </form>
            )}

            {modo === "qrcode" && (
                <form onSubmit={entrarQrcode} className="area-login-form">
                    <label>QR Code</label>
                    <input style={{ color: "transparent" }} value={qrcode} onChange={e => setQrcode(e.target.value)} />

                    <button type="submit">Entrar</button>
                </form>
            )}
        </div>
    );
}
