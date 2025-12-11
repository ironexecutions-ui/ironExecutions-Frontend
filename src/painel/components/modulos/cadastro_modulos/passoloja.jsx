import React, { useState } from "react";
import uploadImagemSupabase from "./supabaseupload";
import "./Passoloja.css";

export default function Passo1Loja({ onContinuar }) {

    const [loja, setLoja] = useState("");
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [carregando, setCarregando] = useState(false);

    function selecionarImagem(e) {
        const file = e.target.files[0];
        setImagem(file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    async function enviar(e) {
        e.preventDefault();

        if (!loja.trim()) {
            alert("Digite o nome da loja");
            return;
        }

        setCarregando(true);

        let linkFinal = null;

        if (imagem) {
            linkFinal = await uploadImagemSupabase(imagem, "ironbusiness");
        }

        onContinuar({
            loja: loja,
            imagem: linkFinal || null
        });

        setCarregando(false);
    }

    return (
        <div className="passo1-container">
            <h3 className="titulo">Informações da loja</h3>

            <form onSubmit={enviar} className="formulario">

                <label>Nome do comércio</label>
                <input
                    type="text"
                    value={loja}
                    onChange={e => setLoja(e.target.value)}
                    placeholder="Digite o nome da loja"
                    className="input-texto"
                />

                <label>Imagem do comércio</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={selecionarImagem}
                    className="input-arquivo"
                />

                {preview && (
                    <div className="preview-area">
                        <p>Prévia da imagem</p>
                        <img src={preview} alt="Preview" className="preview-img" />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={carregando}
                    className="botao-enviar"
                >
                    {carregando ? "Enviando..." : "Continuar"}
                </button>
            </form>
        </div>
    );
}
