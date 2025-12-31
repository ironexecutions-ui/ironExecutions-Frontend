import React, { useRef, useState } from "react";
import "./formularioimagens.css";

export default function FormularioImagens({ valor, alterar }) {

    const imagens = valor ? valor.split("|").filter(Boolean) : [];
    const inputRef = useRef(null);
    const [arrastando, setArrastando] = useState(false);

    function adicionarArquivos(files) {
        const novas = Array.from(files).map(file =>
            URL.createObjectURL(file)
        );
        alterar([...imagens, ...novas].join("|"));
    }

    function remover(index) {
        alterar(imagens.filter((_, i) => i !== index).join("|"));
    }

    function soltar(e) {
        e.preventDefault();
        setArrastando(false);
        if (e.dataTransfer.files.length) {
            adicionarArquivos(e.dataTransfer.files);
        }
    }

    return (
        <div className="imagens-container">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                hidden
                onChange={e => adicionarArquivos(e.target.files)}
            />

            <div
                className={`dropzone ${arrastando ? "ativo" : ""}`}
                onClick={() => inputRef.current.click()}
                onDragOver={e => {
                    e.preventDefault();
                    setArrastando(true);
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={soltar}
            >
                <strong>Arraste as imagens aqui</strong>
                <span>ou clique para adicionar</span>
            </div>

            {imagens.length > 0 && (
                <div className="lista-imagens">
                    {imagens.map((img, i) => (
                        <div className="imagem-card" key={i}>
                            <img src={img} alt="" />
                            <button onClick={() => remover(i)}>✕</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
