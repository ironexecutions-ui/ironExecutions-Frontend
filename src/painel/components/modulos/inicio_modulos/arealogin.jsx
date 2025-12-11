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

        // salva o token JWT (FINALMENTE)
        localStorage.setItem("token", json.token);

        // salva os dados do usuário
        localStorage.setItem("usuario", JSON.stringify(json.usuario));

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
