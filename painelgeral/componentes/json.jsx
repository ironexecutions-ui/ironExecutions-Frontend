import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import "./json.css";

export default function Json() {

    const [arquivos, setArquivos] = useState([]);

    const [resultado, setResultado] = useState("");

    const [carregando, setCarregando] = useState(false);

    const [progresso, setProgresso] = useState(0);

    function selecionarArquivos(evento) {

        const lista = Array.from(
            evento.target.files
        );

        setArquivos(lista);

    }
    function normalizarTexto(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .toLowerCase()
            .trim();
    }

    function comercioDeveSerIgnorado(texto, empresa, fantasia) {
        const conteudo = normalizarTexto(
            `${empresa || ""} ${fantasia || ""} ${texto || ""}`
        );

        const tiposIgnorados = [
            // Contabilidade
            "contabilidade",
            "contabil",
            "contador",
            "servicos contabeis",
            "escritorio contabil",

            // Cartórios
            "cartorio",
            "tabelionato",
            "registro civil",
            "registro de imoveis",
            "registro de titulos",

            // Agências de viagens
            "agencia de viagem",
            "agencia de viagens",
            "agencia de turismo",
            "operadora de turismo",
            "turismo receptivo",
            "viagens e turismo",

            // Hospedagens e pousadas
            "hospedagem",
            "hotel",
            "pousada",
            "hostel",
            "apart hotel",
            "resort",

            // Recursos humanos
            "recursos humanos",
            "recrutamento",
            "selecao de pessoal",
            "gestao de pessoas",

            // Cooperativas de táxi
            "cooperativa de taxi",
            "cooperativa taxi",
            "servico de taxi",

            // Transporte executivo
            "transporte executivo",
            "motorista executivo",
            "transporte de passageiros",

            // Museus e bibliotecas
            "museu",
            "biblioteca",
            "acervo cultural",
            "patrimonio historico",

            // Instituições sociais
            "instituicao social",
            "assistencia social",
            "projeto social",
            "organizacao social",
            "associacao beneficente",
            "entidade beneficente",

            // Serviços públicos
            "servico publico",
            "utilidade publica",
            "administracao publica",
            "orgao publico",
            "prefeitura municipal",

            // Parques e áreas de lazer
            "parque de lazer",
            "parque recreativo",
            "area de lazer",
            "area de conservacao",
            "centro de lazer",

            // Hospedagem de sites
            "hospedagem de sites",
            "hospedagem de website",
            "hospedagem de websites",
            "hosting de sites",
            "web hosting",

            // Shopping centers
            "shopping center",
            "centro comercial",
            "administracao de shopping"
        ];

        return tiposIgnorados.some(
            tipo => conteudo.includes(tipo)
        );
    }
    async function converter() {

        if (arquivos.length === 0) {

            alert(
                "Selecione pelo menos um PDF."
            );

            return;

        }

        setCarregando(true);

        setResultado("");

        let textoFinal = "";

        for (

            let i = 0;

            i < arquivos.length;

            i++

        ) {

            setProgresso(

                Math.round(

                    ((i + 1) / arquivos.length) * 100

                )

            );

            const texto = await lerPDF(

                arquivos[i]

            );

            textoFinal += converterTexto(

                texto

            );

        }

        setResultado(

            textoFinal

        );

        setCarregando(false);

    }

    async function lerPDF(arquivo) {

        const bytes = await arquivo.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({

            data: bytes

        }).promise;

        let texto = "";

        for (

            let pagina = 1;

            pagina <= pdf.numPages;

            pagina++

        ) {

            const p = await pdf.getPage(

                pagina

            );

            const conteudo = await p.getTextContent();

            texto += conteudo.items

                .map(

                    item => item.str

                )

                .join(" ");

            texto += "\n";

        }

        return texto;

    }
    function extrair(regex, texto) {

        const resultado = texto.match(regex);

        if (!resultado) {

            return "";

        }

        return resultado[1].trim();

    }

    function limparTelefone(telefone) {

        return telefone.replace(/\D/g, "");

    }

    function escapar(valor) {

        if (!valor) {

            return "";

        }

        return valor

            .replace(/\r/g, "")

            .replace(/\n/g, " ")

            .replace(/\s+/g, " ")

            .replace(/"/g, '\\"')

            .trim();

    }
    function descobrirCategoria(empresa, fantasia, mei) {

        if (mei) return "MEI";

        const nome = (
            (empresa || "") +
            " " +
            (fantasia || "")
        )
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        if (nome.includes("fono")) return "Fonoaudiologia";

        if (nome.includes("psic")) return "Psicologia";

        if (nome.includes("odonto")) return "Odontologia";

        if (nome.includes("dent")) return "Odontologia";

        if (nome.includes("med")) return "Medicina";

        if (nome.includes("clinica")) return "Clínica Médica";

        if (nome.includes("hospital")) return "Serviços Médicos";

        if (nome.includes("laboratorio")) return "Laboratório";

        if (nome.includes("farm")) return "Farmácia";

        if (nome.includes("veter")) return "Veterinária";

        if (nome.includes("pet")) return "Veterinária";

        if (nome.includes("contab")) return "Contabilidade";

        if (nome.includes("contador")) return "Contabilidade";

        if (nome.includes("adv")) return "Advocacia";

        if (nome.includes("jurid")) return "Advocacia";

        if (nome.includes("engenharia")) return "Engenharia";

        if (nome.includes("construtora")) return "Construtora e Incorporadora";

        if (nome.includes("incorporadora")) return "Construtora e Incorporadora";

        if (nome.includes("construcao")) return "Construção";

        if (nome.includes("imobili")) return "Imobiliária";

        if (nome.includes("administracao de imoveis"))
            return "Administração de Imóveis";

        if (nome.includes("tecnologia")) return "Tecnologia";

        if (nome.includes("software")) return "Tecnologia";

        if (nome.includes("informatica")) return "Tecnologia";

        if (nome.includes("sistema")) return "Tecnologia";

        if (nome.includes("digital")) return "Soluções Digitais";

        if (nome.includes("telefon")) return "Telefonia";

        if (nome.includes("celular")) return "Telefonia";

        if (nome.includes("acessorios")) return "Telefonia";

        if (nome.includes("consult")) return "Consultoria";

        if (nome.includes("finance")) return "Consultoria Financeira";

        if (nome.includes("empresarial")) return "Consultoria Empresarial";

        if (nome.includes("restaurante")) return "Restaurante";

        if (nome.includes("pizz")) return "Pizzaria";

        if (nome.includes("hamburg")) return "Hamburgueria";

        if (nome.includes("lanch")) return "Lanchonete";

        if (nome.includes("cafeteria")) return "Cafeteria";

        if (nome.includes("cafe")) return "Cafeteria";

        if (nome.includes("doceria")) return "Doceria";

        if (nome.includes("padaria")) return "Padaria";

        if (nome.includes("pastel")) return "Pastelaria";

        if (nome.includes("mercado")) return "Supermercado";

        if (nome.includes("supermercado")) return "Supermercado";

        if (nome.includes("comercial")) return "Comércio";

        if (nome.includes("comercio")) return "Comércio";

        if (nome.includes("loja")) return "Comércio";

        if (nome.includes("veiculo")) return "Comércio de Veículos";

        if (nome.includes("autopec")) return "Autopeças";

        if (nome.includes("escola")) return "Educação";

        if (nome.includes("educ")) return "Educação";

        if (nome.includes("curso")) return "Educação";

        if (nome.includes("banco")) return "Banco";

        if (nome.includes("nutri")) return "Nutrição";

        if (nome.includes("fisio")) return "Fisioterapia";

        if (nome.includes("pesquisa")) return "Pesquisa e Desenvolvimento";

        return "Outros";
    }
    function converterTexto(texto) {

        const empresa = extrair(
            /Raz[aã]o Social:\s*(.*?)\s*(?:Nome Fantasia:|Data da Abertura:)/is,
            texto
        );

        const fantasia = extrair(
            /Nome Fantasia:\s*(.*?)\s*Data da Abertura:/is,
            texto
        );

        const email = extrair(
            /E-mail:\s*([^\s(]+)/i,
            texto
        );

        // Ignora registros sem empresa identificada
        if (!empresa && !fantasia) {
            return "";
        }

        // Ignora PDFs cujo e-mail contenha **
        if (email.includes("**")) {
            return "";
        }

        // Ignora os segmentos que não interessam à IronExecutions
        if (
            comercioDeveSerIgnorado(
                texto,
                empresa,
                fantasia
            )
        ) {
            console.log(
                "Comércio ignorado:",
                empresa || fantasia
            );

            return "";
        }

        const logradouro = extrair(
            /Logradouro:\s*(.*?)\s*(?:Complemento:|Bairro:)/is,
            texto
        );

        const complemento = extrair(
            /Complemento:\s*(.*?)\s*Bairro:/is,
            texto
        );

        const bairro = extrair(
            /Bairro:\s*(.*?)\s*CEP:/is,
            texto
        );

        const cep = extrair(
            /CEP:\s*([\d\-]+)/i,
            texto
        );

        const municipio = extrair(
            /Munic[ií]pio:\s*(.*?)\s*Estado:/is,
            texto
        );

        const mei = /Op[cç][aã]o pelo MEI:\s*Sim/i.test(
            texto
        );

        const telefones = texto.match(
            /\(\d{2}\)\s*\d{4,5}-\d{4}/g
        ) || [];

        const telefone = telefones
            .map(limparTelefone)
            .join(" / ");

        let endereco = "";

        if (
            logradouro &&
            bairro &&
            cep
        ) {
            endereco = logradouro.trim();

            if (complemento) {
                endereco +=
                    " - " +
                    complemento.trim();
            }

            endereco +=
                " - " +
                bairro.trim();

            endereco +=
                ", " +
                (municipio || "Campinas");

            endereco +=
                " - SP, ";

            endereco += cep;
        }

        const categoria = descobrirCategoria(
            empresa,
            fantasia,
            mei
        );

        const nomeEmpresa =
            empresa || fantasia;

        return `
{
empresa: "${escapar(nomeEmpresa)}",
telefone: "${escapar(telefone)}",
email: "${escapar(email)}",
cidade: "${escapar(municipio || "Campinas")}",
endereco: "${escapar(endereco)}",
categoria: "${escapar(categoria)}",
fonte: "Biz"
},

`;
    }

    function copiarResultado() {

        if (!resultado) {

            return;

        }

        navigator.clipboard.writeText(resultado);

        alert("Código copiado!");

    }

    function baixarJS() {

        if (!resultado) {

            return;

        }

        const blob = new Blob(

            [resultado],

            {

                type: "text/javascript"

            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "empresas.js";

        a.click();

        URL.revokeObjectURL(url);

    }

    function limparTudo() {

        setArquivos([]);

        setResultado("");

        setProgresso(0);

    }

    function permitirDrop(evento) {

        evento.preventDefault();

    }

    function receberDrop(evento) {

        evento.preventDefault();

        const lista = Array

            .from(
                evento.dataTransfer.files
            )

            .filter(

                arquivo =>

                    arquivo.name

                        .toLowerCase()

                        .endsWith(".pdf")

            );

        setArquivos(lista);

    } function copiarCodigoPDF() {

        const codigo = `(async () => {

    function esperar(ms){
        return new Promise(r=>setTimeout(r,ms));
    }

    if (!window.jspdf) {
        await new Promise(resolve=>{
            const s=document.createElement("script");
            s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            s.onload=resolve;
            document.head.appendChild(s);
        });
    }

    document.querySelector(".btn-reveal-email")?.click();
    document.querySelector(".btn-reveal-phone")?.click();

    await esperar(2000);

    const inicio=[...document.querySelectorAll("h2")]
        .find(h=>h.innerText.includes("Informações de Registro"));

let texto="";
let atual=inicio;

while(atual){

    if(atual.innerText.trim()) {
        texto += atual.innerText.trim() + "\\n\\n";
    }

    atual = atual.nextElementSibling;
}

    const cnpj=(texto.match(/\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}/)?.[0] || "empresa")
        .replace(/[^\\d]/g,"");

    const { jsPDF } = window.jspdf;

    const pdf=new jsPDF();

    const linhas=pdf.splitTextToSize(texto,180);

    pdf.setFont("courier","normal");
    pdf.setFontSize(10);

    pdf.text(linhas,10,10);

    pdf.save(cnpj+".pdf");

})();`;

        navigator.clipboard.writeText(codigo);

        alert("Código copiado!");

    }
    function copiarCodigoGeral() {

        const codigo = `(async () => {

    function carregarJsPDF() {

        return new Promise(resolve => {

            if (window.jspdf) {

                resolve();

                return;

            }

            const s=document.createElement("script");

            s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

            s.onload=resolve;

            document.head.appendChild(s);

        });

    }

    await carregarJsPDF();

    const links=[...document.querySelectorAll("li > a")]
        .filter(link=>{

            const status=[...link.querySelectorAll("p")]
                .find(p=>["ATIVA","BAIXADA","INAPTA"].includes(p.innerText.trim()))
                ?.innerText.trim();

            return status==="ATIVA";

        })
        .map(link=>link.href);

    if(links.length===0){

        console.log("Nenhuma empresa ATIVA encontrada.");

    }else{

        const texto=\`const links = [
\${links.map(l=>\`    "\${l}"\`).join(",\\n")}
];\`;

        const { jsPDF } = window.jspdf;

        const pdf=new jsPDF();

        pdf.setFont("courier");

        pdf.setFontSize(8);

        const linhas=pdf.splitTextToSize(texto,180);

        let y=10;

        linhas.forEach(linha=>{

            if(y>285){

                pdf.addPage();

                y=10;

            }

            pdf.text(linha,10,y);

            y+=4;

        });

        pdf.save("links.pdf");

    }

    setTimeout(()=>{

        const proximaPagina=[...document.querySelectorAll("a")]
            .find(a=>a.innerText.trim()==="Próxima Página");

        if(proximaPagina){

            window.location.href=proximaPagina.href;

        }

    },1500);

})();`;

        navigator.clipboard.writeText(codigo);

        alert("Código copiado!");

    }


    return (

        <div className="jsonPagina">

            <h1>

                Conversor de PDFs para JavaScript

            </h1>

            <div

                className="jsonAreaDrop"

                onDragOver={permitirDrop}

                onDrop={receberDrop}

            >

                <h3>

                    Arraste seus PDFs aqui

                </h3>

                <p>

                    ou

                </p>

                <input

                    type="file"

                    multiple

                    accept=".pdf"

                    onChange={selecionarArquivos}

                />

            </div>

            <br />
            <div className="jsonBotoesCodigos">

                <button onClick={copiarCodigoPDF}>

                    Copiar Código para cada

                </button>

                <button onClick={copiarCodigoGeral}>

                    Copiar Código Geral

                </button>

            </div>
            <br />
            <p>

                PDFs selecionados:

                <strong>

                    {" "}

                    {arquivos.length}

                </strong>

            </p>

            <div
                className="jsonBotoes"
            >

                <button

                    onClick={converter}

                    disabled={
                        carregando ||
                        arquivos.length === 0
                    }

                >

                    Converter PDFs

                </button>

                <button

                    onClick={copiarResultado}

                    disabled={
                        !resultado
                    }

                >

                    Copiar

                </button>

                <button

                    onClick={baixarJS}

                    disabled={
                        !resultado
                    }

                >

                    Baixar JS

                </button>

                <button

                    onClick={limparTudo}

                >

                    Limpar

                </button>

            </div>

            {

                carregando &&

                <div
                    className="jsonProgresso"
                >

                    <progress

                        value={progresso}

                        max="100"

                    />

                    <p>

                        Convertendo...

                        {" "}

                        {progresso}%

                    </p>

                </div>

            }

            <textarea

                className="jsonResultado"

                value={resultado}

                readOnly

                rows={30}

                placeholder="O resultado aparecerá aqui..."

            />

        </div>

    );
}