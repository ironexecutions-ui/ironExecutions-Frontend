import React, { useState } from "react";
import uploadImagemSupabase from "./supabaseupload";
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

    function alterarCampo(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function selecionarImagem(e) {
        const file = e.target.files[0];
        setImagem(file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    async function enviar(e) {
        e.preventDefault();

        if (!form.loja.trim()) {
            alert("Digite o nome da loja");
            return;
        }

        setCarregando(true);

        let linkFinal = null;

        if (imagem) {
            linkFinal = await uploadImagemSupabase(imagem, "ironbusiness");
        }

        onContinuar({
            ...form,
            imagem: linkFinal || null
        });

        setCarregando(false);
    }

    return (
        <div className="passo1-container">
            <h3 className="titulo">Informações da loja</h3>

            <form onSubmit={enviar} className="formulario">

                <label>Nome do comércio</label>
                <input name="loja" value={form.loja} onChange={alterarCampo} />

                <label>CNPJ</label>
                <input name="cnpj" value={form.cnpj} onChange={alterarCampo} />

                <label>CEP</label>
                <input name="cep" value={form.cep} onChange={alterarCampo} />

                <label>Rua</label>
                <input name="rua" value={form.rua} onChange={alterarCampo} />

                <label>Bairro</label>
                <input name="bairro" value={form.bairro} onChange={alterarCampo} />

                <label>Número</label>
                <input name="numero" value={form.numero} onChange={alterarCampo} />

                <label>Cidade</label>
                <input name="cidade" value={form.cidade} onChange={alterarCampo} />

                <label>Estado</label>
                <input name="estado" value={form.estado} onChange={alterarCampo} maxLength={2} />

                <label>Email do comércio</label>
                <input name="email" value={form.email} onChange={alterarCampo} />

                <label>Celular</label>
                <input name="celular" value={form.celular} onChange={alterarCampo} />

                <label>Imagem do comércio</label>
                <input type="file" accept="image/*" onChange={selecionarImagem} />

                {preview && <img src={preview} className="preview-img" />}

                <button type="submit" disabled={carregando}>
                    {carregando ? "Enviando..." : "Continuar"}
                </button>
            </form>
        </div>
    );
}
