import React, { useState } from "react";
import { API_URL } from "../../../config";
import "./cadastro.css";

export default function Cadastro() {

    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
        idade: "",
        telefone: "",
        grupo: "",
        data_inicio: "",
        diaum: "",
        diadois: ""
    });

    function atualizar(campo, valor) {
        setForm(prev => ({ ...prev, [campo]: valor }));
    }

    async function cadastrar() {

        if (!form.nome || !form.email || !form.senha || !form.idade || !form.data_inicio || !form.telefone) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        const payload = {
            ...form,
            idade: Number(form.idade)
        };

        try {
            const r = await fetch(`${API_URL}/aulas/matricula`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await r.json();

            if (!r.ok) {

                // 🔥 erro de validação do FastAPI
                if (Array.isArray(data.detail)) {
                    const msg = data.detail.map(e =>
                        `${e.loc[1]}: ${e.msg}`
                    ).join("\n");

                    alert(msg);
                    return;
                }

                // 🔥 erro direto
                if (typeof data.detail === "string") {
                    alert(data.detail);
                    return;
                }

                alert("Erro desconhecido");
                return;
            }

            alert("Aluno cadastrado com sucesso");

            window.location.reload();
        } catch (err) {
            console.log(err);
            alert("Erro de conexão com servidor");
        }
    }

    return (
        <div className="cadastro_container">

            <h2>Cadastrar aluno</h2>

            <input
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => {
                    const valor = e.target.value;

                    const formatado = valor
                        .toLowerCase()
                        .split(" ")
                        .map(palavra =>
                            palavra ? palavra[0].toUpperCase() + palavra.slice(1) : ""
                        )
                        .join(" ");

                    atualizar("nome", formatado);
                }}
            />
            <input placeholder="Email" onChange={e => atualizar("email", e.target.value)} />
            <input
                placeholder="Telefone (99) 99999-9999"
                value={form.telefone}
                onChange={(e) => {
                    let valor = e.target.value.replace(/\D/g, "");

                    if (valor.length > 11) valor = valor.slice(0, 11);

                    if (valor.length > 6) {
                        valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
                    } else if (valor.length > 2) {
                        valor = valor.replace(/(\d{2})(\d{0,5})/, "($1) $2");
                    } else {
                        valor = valor.replace(/(\d*)/, "($1");
                    }

                    atualizar("telefone", valor);
                }}
            />
            <input placeholder="Senha" onChange={e => atualizar("senha", e.target.value)} />
            <input placeholder="Idade" onChange={e => atualizar("idade", e.target.value)} />
            <input placeholder="Grupo" onChange={e => atualizar("grupo", e.target.value)} />
            <input type="date" onChange={e => atualizar("data_inicio", e.target.value)} />
            <input placeholder="Dia 1" onChange={e => atualizar("diaum", e.target.value)} />
            <input placeholder="Dia 2" onChange={e => atualizar("diadois", e.target.value)} />

            <button onClick={cadastrar}>Salvar</button>

        </div>
    );
}