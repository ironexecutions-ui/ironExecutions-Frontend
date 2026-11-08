
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../../config";
import "./dadoscomerciofiscal.css";
import UploadCertificadoA1 from "./uploadcertificadoa1";

export default function DadosComerciaisFiscal() {

    const [dados, setDados] = useState(null);
    const [editando, setEditando] = useState(null);
    const [valorTemp, setValorTemp] = useState("");

    const [funcao, setFuncao] = useState(null);
    const [bloqueado, setBloqueado] = useState(false);

    const token = localStorage.getItem("token");

    // =========================================
    // VERIFICAR FUNÇÃO DO USUÁRIO
    // =========================================

    useEffect(() => {

        fetch(`${API_URL}/clientes/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(r => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then(dados => {

                if (
                    dados.funcao !== "Administrador(a)" &&
                    dados.funcao !== "Administradora"
                ) {
                    setBloqueado(true);
                } else {
                    setFuncao(dados.funcao);
                }

            })
            .catch(() => setBloqueado(true));

    }, []);

    // =========================================
    // CARREGAR DADOS DO COMÉRCIO
    // =========================================

    useEffect(() => {

        if (!funcao) return;

        carregar();

    }, [funcao]);

    async function carregar() {

        try {

            const resposta = await fetch(
                `${API_URL}/fiscal/comercio/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error("Erro ao carregar dados fiscais");
            }

            const resultado = await resposta.json();

            setDados(resultado);

        } catch (erro) {

            console.error(
                "[DadosComerciaisFiscal] Erro:",
                erro
            );

            setBloqueado(true);

        }

    }

    // =========================================
    // SALVAR CAMPO
    // =========================================

    async function salvar(tabela, campo, valor) {

        try {

            const resposta = await fetch(
                `${API_URL}/fiscal/comercio/salvar-campo`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        tabela,
                        campo,
                        valor: String(valor ?? "")
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.detail || "Erro ao salvar campo"
                );
            }

            await carregar();

        } catch (erro) {

            console.error(
                "[DadosComerciaisFiscal] Erro ao salvar:",
                erro
            );

            alert(
                erro.message || "Não foi possível salvar."
            );

            await carregar();

        }

    }

    // =========================================
    // CAMPO EDITÁVEL
    // =========================================

    function Campo({
        tabela,
        campo,
        label,
        value,
        datalist,
        type = "text"
    }) {

        const identificador = `${tabela}.${campo}`;

        const estaEditando = editando === identificador;

        function iniciarEdicao() {

            setEditando(identificador);

            setValorTemp(
                value === null || value === undefined
                    ? ""
                    : String(value)
            );

        }

        function finalizar() {

            if (editando !== identificador) return;

            const valorOriginal =
                value === null || value === undefined
                    ? ""
                    : String(value);

            const novoValor = valorTemp;

            setEditando(null);

            if (novoValor !== valorOriginal) {

                salvar(
                    tabela,
                    campo,
                    novoValor
                );

            }

        }

        return (
            <div className="campo-inline">

                <label>{label}</label>

                {!estaEditando && (

                    <p
                        className="campo-visual"
                        onClick={iniciarEdicao}
                    >
                        {value !== null &&
                            value !== undefined &&
                            String(value).trim() !== ""
                            ? value
                            : "Clique para editar"}
                    </p>

                )}

                {estaEditando && (

                    <input
                        type={type}
                        list={datalist}
                        value={valorTemp}
                        autoFocus

                        onChange={e =>
                            setValorTemp(e.target.value)
                        }

                        onBlur={finalizar}

                        onKeyDown={e => {

                            if (e.key === "Enter") {
                                e.preventDefault();
                                e.currentTarget.blur();
                            }

                            if (e.key === "Escape") {
                                setEditando(null);
                            }

                        }}
                    />

                )}

            </div>
        );

    }

    // =========================================
    // BLOQUEIO
    // =========================================

    if (bloqueado) {

        return (
            <div className="dados-comercio-bloqueado">

                <h4>Acesso restrito</h4>

                <p>
                    Somente administradores podem acessar
                    dados fiscais do comércio.
                </p>

            </div>
        );

    }

    if (!dados) {

        return <p>Carregando dados comerciais...</p>;

    }

    const fiscal = dados.fiscal || {};
    const comercio = dados.comercio || {};

    const tabelaFiscal = "fiscal_dados_comercio";
    const tabelaComercio = "comercios_cadastradas";

    return (

        <div className="dados-comercio">

            <h4>Dados do Comércio</h4>

            <Campo
                tabela={tabelaComercio}
                campo="loja"
                label="Nome da loja"
                value={comercio.loja}
            />

            <Campo
                tabela={tabelaComercio}
                campo="cnpj"
                label="CNPJ"
                value={comercio.cnpj}
            />

            <Campo
                tabela={tabelaComercio}
                campo="cep"
                label="CEP"
                value={comercio.cep}
            />

            <Campo
                tabela={tabelaComercio}
                campo="cidade"
                label="Cidade"
                value={comercio.cidade}
            />

            {/* ================================= */}
            {/* DADOS FISCAIS */}
            {/* ================================= */}

            <h4>Dados Fiscais</h4>

            <Campo
                tabela={tabelaFiscal}
                campo="razao_social"
                label="Razão Social"
                value={fiscal.razao_social}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="nome_fantasia"
                label="Nome Fantasia"
                value={fiscal.nome_fantasia}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="inscricao_estadual"
                label="Inscrição Estadual"
                value={fiscal.inscricao_estadual}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="inscricao_municipal"
                label="Inscrição Municipal"
                value={fiscal.inscricao_municipal}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="cnae"
                label="CNAE"
                value={fiscal.cnae}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="codigo_municipio"
                label="Código do Município (IBGE)"
                value={fiscal.codigo_municipio}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="regime_tributario"
                label="Regime Tributário"
                value={fiscal.regime_tributario}
                datalist="regimes-fiscais"
            />

            <Campo
                tabela={tabelaFiscal}
                campo="crt"
                label="CRT"
                value={fiscal.crt}
                datalist="crt-fiscais"
            />

            {/* ================================= */}
            {/* PADRÕES FISCAIS DOS PRODUTOS */}
            {/* ================================= */}

            <h4>Padrões Fiscais dos Produtos</h4>

            <p>
                Configure os valores fiscais habituais
                que poderão ser utilizados como padrão
                no cadastro dos produtos.
            </p>

            {/* OPERAÇÃO E ORIGEM */}

            <Campo
                tabela={tabelaFiscal}
                campo="cfop_padrao"
                label="CFOP Padrão"
                value={fiscal.cfop_padrao}
                datalist="cfops-fiscais"
            />

            <Campo
                tabela={tabelaFiscal}
                campo="origem_padrao"
                label="Origem Padrão da Mercadoria"
                value={fiscal.origem_padrao}
                datalist="origens-fiscais"
            />

            {/* ICMS */}

            <h4>Tributação ICMS</h4>

            <Campo
                tabela={tabelaFiscal}
                campo="cst_icms_padrao"
                label="CST ICMS Padrão"
                value={fiscal.cst_icms_padrao}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="csosn_padrao"
                label="CSOSN Padrão"
                value={fiscal.csosn_padrao}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="aliquota_icms_padrao"
                label="Alíquota ICMS (%)"
                value={fiscal.aliquota_icms_padrao}
                type="number"
            />

            {/* PIS */}

            <h4>Tributação PIS / COFINS</h4>

            <Campo
                tabela={tabelaFiscal}
                campo="cst_pis_padrao"
                label="CST PIS Padrão"
                value={fiscal.cst_pis_padrao}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="aliquota_pis_padrao"
                label="Alíquota PIS (%)"
                value={fiscal.aliquota_pis_padrao}
                type="number"
            />

            <Campo
                tabela={tabelaFiscal}
                campo="cst_cofins_padrao"
                label="CST COFINS Padrão"
                value={fiscal.cst_cofins_padrao}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="aliquota_cofins_padrao"
                label="Alíquota COFINS (%)"
                value={fiscal.aliquota_cofins_padrao}
                type="number"
            />

            {/* ================================= */}
            {/* IBS / CBS */}
            {/* ================================= */}

            <h4>Tributação IBS / CBS</h4>

            <Campo
                tabela={tabelaFiscal}
                campo="cst_ibscbs_padrao"
                label="CST IBS/CBS Padrão"
                value={fiscal.cst_ibscbs_padrao}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="aliquota_ibs_uf_padrao"
                label="Alíquota IBS UF (%)"
                value={fiscal.aliquota_ibs_uf_padrao}
                type="number"
            />

            <Campo
                tabela={tabelaFiscal}
                campo="aliquota_ibs_mun_padrao"
                label="Alíquota IBS Município (%)"
                value={fiscal.aliquota_ibs_mun_padrao}
                type="number"
            />

            <Campo
                tabela={tabelaFiscal}
                campo="aliquota_cbs_padrao"
                label="Alíquota CBS (%)"
                value={fiscal.aliquota_cbs_padrao}
                type="number"
            />

            {/* ================================= */}
            {/* SEGURANÇA FISCAL */}
            {/* ================================= */}

            <h4>Segurança Fiscal</h4>

            <UploadCertificadoA1 onSucesso={carregar} />

            <Campo
                tabela={tabelaFiscal}
                campo="csc_id"
                label="ID do CSC"
                value={fiscal.csc_id}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="csc_token"
                label="CSC Token"
                value={fiscal.csc_token}
            />

            {/* ================================= */}
            {/* NFC-e */}
            {/* ================================= */}

            <h4>Configuração de Emissão NFC-e</h4>

            <Campo
                tabela={tabelaFiscal}
                campo="ambiente_emissao"
                label="Ambiente de Emissão"
                value={fiscal.ambiente_emissao}
                datalist="ambientes-fiscais"
            />

            <Campo
                tabela={tabelaFiscal}
                campo="serie_nfce"
                label="Série NFC-e"
                value={fiscal.serie_nfce}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="numero_inicial_nfce"
                label="Número Inicial NFC-e"
                value={fiscal.numero_inicial_nfce}
                type="number"
            />

            {/* ================================= */}
            {/* NF-e */}
            {/* ================================= */}

            <h4>Configuração de Emissão NF-e</h4>

            <Campo
                tabela={tabelaFiscal}
                campo="serie_nfe"
                label="Série NF-e"
                value={fiscal.serie_nfe}
            />

            <Campo
                tabela={tabelaFiscal}
                campo="numero_inicial_nfe"
                label="Número Inicial NF-e"
                value={fiscal.numero_inicial_nfe}
                type="number"
            />

            {/* ================================= */}
            {/* LISTAS */}
            {/* ================================= */}

            <datalist id="regimes-fiscais">
                <option value="Simples Nacional" />
                <option value="Lucro Presumido" />
                <option value="Lucro Real" />
                <option value="MEI" />
            </datalist>

            <datalist id="crt-fiscais">
                <option value="1" />
                <option value="2" />
                <option value="3" />
                <option value="4" />
            </datalist>

            <datalist id="ambientes-fiscais">
                <option value="homologacao" />
                <option value="producao" />
            </datalist>

            <datalist id="origens-fiscais">
                <option value="0" />
                <option value="1" />
                <option value="2" />
                <option value="3" />
                <option value="4" />
                <option value="5" />
                <option value="6" />
                <option value="7" />
                <option value="8" />
            </datalist>

            <datalist id="cfops-fiscais">
                <option value="5102" />
                <option value="5101" />
                <option value="5405" />
                <option value="6102" />
                <option value="6101" />
                <option value="6404" />
            </datalist>

        </div>

    );

}
