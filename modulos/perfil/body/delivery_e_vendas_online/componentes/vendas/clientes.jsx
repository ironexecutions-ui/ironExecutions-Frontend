import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    API_URL
} from "../../../../../../config";

import "./clientes.css";


export default function RClientes() {

    /* ============================================================
       ESTADOS
    ============================================================ */

    const [
        carregando,
        setCarregando
    ] = useState(true);

    const [
        atualizando,
        setAtualizando
    ] = useState(false);

    const [
        erro,
        setErro
    ] = useState("");

    const [
        clientes,
        setClientes
    ] = useState([]);

    const [
        busca,
        setBusca
    ] = useState("");
    const [
        clienteEntrando,
        setClienteEntrando
    ] = useState(null);
    /* ============================================================
       CADASTRO DE NOVO CLIENTE
    ============================================================ */

    const [
        comercio,
        setComercio
    ] = useState(null);


    const [
        modalCadastro,
        setModalCadastro
    ] = useState(false);


    const [
        cadastro,
        setCadastro
    ] = useState({
        email: "",
        nome: "",
        sobrenome: "",
        data_nascimento: "",
        whatsapp: "",
        cpf_cnpj: "",
        cep: "",
        rua_avenida: "",
        numero: "",
        bairro: "",
        cidade: ""
    });


    const [
        verificandoEmail,
        setVerificandoEmail
    ] = useState(false);


    const [
        emailVerificado,
        setEmailVerificado
    ] = useState(false);


    const [
        clienteEmailExistente,
        setClienteEmailExistente
    ] = useState(null);


    const [
        buscandoCepCadastro,
        setBuscandoCepCadastro
    ] = useState(false);


    const [
        salvandoCliente,
        setSalvandoCliente
    ] = useState(false);


    const [
        erroCadastro,
        setErroCadastro
    ] = useState("");
    /* ============================================================
       BUSCAR CLIENTES
    ============================================================ */

    async function buscarClientes(
        mostrarLoadingPrincipal = false
    ) {

        try {

            if (mostrarLoadingPrincipal) {

                setCarregando(true);

            } else {

                setAtualizando(true);

            }

            setErro("");


            /* =====================================================
               TOKEN DO PAINEL
            ===================================================== */

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                throw new Error(
                    "Sessão não encontrada."
                );

            }


            /* =====================================================
               CONSULTA

               O comércio não é enviado pelo frontend.

               O backend identifica:
               token
               -> usuário
               -> comercio_id
               -> domínio
               -> clientes da loja
            ===================================================== */

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/clientes/painel`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            /* =====================================================
               SESSÃO EXPIRADA
            ===================================================== */

            if (
                resposta.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                window.location.replace(
                    "/"
                );

                return;

            }


            /* =====================================================
               RESPOSTA
            ===================================================== */

            const dados =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!resposta.ok) {

                throw new Error(
                    dados?.detail ||
                    `Erro ${resposta.status} ao carregar clientes.`
                );

            }


            /* =====================================================
               SALVAR CLIENTES
            ===================================================== */

            setClientes(
                Array.isArray(
                    dados?.clientes
                )
                    ? dados.clientes
                    : []
            );
            setComercio(
                dados?.comercio ||
                null
            );

        } catch (erro) {

            console.error(
                "[IRONSTORE CLIENTES]",
                erro
            );

            setErro(
                erro?.message ||
                "Não foi possível carregar os clientes."
            );


        } finally {

            setCarregando(false);

            setAtualizando(false);

        }

    }


    /* ============================================================
       PRIMEIRO CARREGAMENTO
    ============================================================ */

    useEffect(
        () => {

            buscarClientes(true);

        },
        []
    );
    /* ============================================================
       VERIFICAR EMAIL DO NOVO CLIENTE
    ============================================================ */

    useEffect(
        () => {

            if (
                !modalCadastro
            ) {
                return;
            }


            const email =
                String(
                    cadastro.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            /*
                SEMPRE INVALIDA A VERIFICAÇÃO
                QUANDO O EMAIL MUDA
            */

            setEmailVerificado(
                false
            );

            setClienteEmailExistente(
                null
            );


            if (
                !email ||
                !email.includes("@")
            ) {
                return;
            }


            /*
                ESPERA 500ms PARA NÃO CONSULTAR
                A CADA TECLA
            */

            const timeout =
                setTimeout(
                    async () => {

                        const token =
                            localStorage.getItem(
                                "token"
                            );


                        if (!token) {
                            return;
                        }


                        try {

                            setVerificandoEmail(
                                true
                            );


                            const resposta =
                                await fetch(
                                    `${API_URL}/ironstore/clientes/painel/verificar-email?email=${encodeURIComponent(
                                        email
                                    )}`,
                                    {
                                        method:
                                            "GET",

                                        headers: {
                                            Authorization:
                                                `Bearer ${token}`
                                        }
                                    }
                                );


                            const resultado =
                                await resposta
                                    .json()
                                    .catch(
                                        () => ({})
                                    );


                            if (
                                !resposta.ok
                            ) {

                                throw new Error(
                                    resultado?.detail ||
                                    "Não foi possível verificar o e-mail."
                                );
                            }


                            setEmailVerificado(
                                true
                            );


                            setClienteEmailExistente(
                                resultado?.cadastrado
                                    ? resultado?.cliente
                                    : null
                            );


                        } catch (erroEmail) {

                            console.error(
                                "[IRONSTORE VERIFICAR EMAIL]",
                                erroEmail
                            );


                            setEmailVerificado(
                                false
                            );


                        } finally {

                            setVerificandoEmail(
                                false
                            );
                        }

                    },
                    500
                );


            return () => {

                clearTimeout(
                    timeout
                );
            };

        },
        [
            cadastro.email,
            modalCadastro
        ]
    );

    /* ============================================================
       ESTATÍSTICAS
    ============================================================ */

    const estatisticas =
        useMemo(
            () => {

                let comWhatsapp = 0;

                let comEndereco = 0;

                let comDocumento = 0;


                clientes.forEach(
                    (cliente) => {

                        if (
                            String(
                                cliente?.whatsapp || ""
                            ).trim()
                        ) {

                            comWhatsapp += 1;

                        }


                        if (
                            String(
                                cliente?.cep || ""
                            ).trim() ||
                            String(
                                cliente?.rua_avenida || ""
                            ).trim() ||
                            String(
                                cliente?.cidade || ""
                            ).trim()
                        ) {

                            comEndereco += 1;

                        }


                        if (
                            String(
                                cliente?.cpf_cnpj || ""
                            ).trim()
                        ) {

                            comDocumento += 1;

                        }

                    }
                );


                return {

                    total:
                        clientes.length,

                    comWhatsapp,

                    comEndereco,

                    comDocumento

                };

            },
            [
                clientes
            ]
        );


    /* ============================================================
       CLIENTES FILTRADOS
    ============================================================ */

    const clientesFiltrados =
        useMemo(
            () => {

                const termo =
                    busca
                        .trim()
                        .toLowerCase();


                if (!termo) {

                    return clientes;

                }


                return clientes.filter(
                    (cliente) => {

                        const campos = [

                            cliente?.id,

                            cliente?.nome,

                            cliente?.sobrenome,

                            cliente?.nome_completo,

                            cliente?.email,

                            cliente?.whatsapp,

                            cliente?.cpf_cnpj,

                            cliente?.cep,

                            cliente?.rua_avenida,

                            cliente?.numero,

                            cliente?.bairro,

                            cliente?.cidade,

                            cliente?.data_nascimento

                        ];


                        return campos.some(
                            (campo) =>
                                String(
                                    campo || ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        termo
                                    )
                        );

                    }
                );

            },
            [
                busca,
                clientes
            ]
        );


    /* ============================================================
       PEGAR NOME COMPLETO
    ============================================================ */

    function pegarNomeCompleto(
        cliente
    ) {

        const nomeCompleto =
            String(
                cliente?.nome_completo || ""
            ).trim();


        if (nomeCompleto) {

            return nomeCompleto;

        }


        const nome =
            String(
                cliente?.nome || ""
            ).trim();

        const sobrenome =
            String(
                cliente?.sobrenome || ""
            ).trim();


        return (
            `${nome} ${sobrenome}`.trim() ||
            "Cliente sem nome"
        );

    }


    /* ============================================================
       PEGAR INICIAIS
    ============================================================ */

    function pegarIniciais(
        cliente
    ) {

        const nome =
            pegarNomeCompleto(
                cliente
            );


        const partes =
            nome
                .split(" ")
                .filter(Boolean);


        if (
            partes.length === 0
        ) {

            return "C";

        }


        if (
            partes.length === 1
        ) {

            return partes[0]
                .charAt(0)
                .toUpperCase();

        }


        return (
            partes[0]
                .charAt(0) +
            partes[
                partes.length - 1
            ].charAt(0)
        ).toUpperCase();

    }


    /* ============================================================
       FORMATAR DOCUMENTO
    ============================================================ */

    function formatarDocumento(
        valor
    ) {

        const numeros =
            String(
                valor || ""
            ).replace(
                /\D/g,
                ""
            );


        if (
            numeros.length === 11
        ) {

            return numeros.replace(
                /(\d{3})(\d{3})(\d{3})(\d{2})/,
                "$1.$2.$3-$4"
            );

        }


        if (
            numeros.length === 14
        ) {

            return numeros.replace(
                /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
                "$1.$2.$3/$4-$5"
            );

        }


        return (
            valor ||
            "Não informado"
        );

    }


    /* ============================================================
       FORMATAR WHATSAPP
    ============================================================ */

    function formatarWhatsapp(
        valor
    ) {

        const numeros =
            String(
                valor || ""
            ).replace(
                /\D/g,
                ""
            );


        if (
            numeros.length === 11
        ) {

            return numeros.replace(
                /(\d{2})(\d{5})(\d{4})/,
                "($1) $2-$3"
            );

        }


        if (
            numeros.length === 10
        ) {

            return numeros.replace(
                /(\d{2})(\d{4})(\d{4})/,
                "($1) $2-$3"
            );

        }


        return (
            valor ||
            "Não informado"
        );

    }


    /* ============================================================
       FORMATAR CEP
    ============================================================ */

    function formatarCep(
        valor
    ) {

        const numeros =
            String(
                valor || ""
            ).replace(
                /\D/g,
                ""
            );


        if (
            numeros.length === 8
        ) {

            return numeros.replace(
                /(\d{5})(\d{3})/,
                "$1-$2"
            );

        }


        return (
            valor ||
            ""
        );

    }


    /* ============================================================
       MONTAR ENDEREÇO
    ============================================================ */

    function montarEndereco(
        cliente
    ) {

        const rua =
            String(
                cliente?.rua_avenida || ""
            ).trim();

        const numero =
            String(
                cliente?.numero || ""
            ).trim();

        const bairro =
            String(
                cliente?.bairro || ""
            ).trim();

        const cidade =
            String(
                cliente?.cidade || ""
            ).trim();

        const cep =
            formatarCep(
                cliente?.cep
            );


        const primeiraLinha = [
            rua,
            numero
                ? `nº ${numero}`
                : ""
        ]
            .filter(Boolean)
            .join(", ");


        const segundaLinha = [
            bairro,
            cidade
        ]
            .filter(Boolean)
            .join(" • ");


        return {

            primeiraLinha:
                primeiraLinha ||
                "Endereço não informado",

            segundaLinha,

            cep

        };

    }


    /* ============================================================
       FORMATAR DATA DE NASCIMENTO
    ============================================================ */

    function formatarDataNascimento(
        valor
    ) {

        if (!valor) {

            return "Não informada";

        }


        const texto =
            String(
                valor
            ).trim();


        const partes =
            texto.split("-");


        if (
            partes.length === 3 &&
            partes[0].length === 4
        ) {

            return (
                `${partes[2]}/${partes[1]}/${partes[0]}`
            );

        }


        return texto;

    }


    /* ============================================================
   SOMENTE NÚMEROS
============================================================ */

    function somenteNumeros(
        valor
    ) {

        return String(
            valor || ""
        ).replace(
            /\D/g,
            ""
        );
    }


    /* ============================================================
       MÁSCARA WHATSAPP - CADASTRO
    ============================================================ */

    function mascaraWhatsappCadastro(
        valor
    ) {

        const numeros =
            somenteNumeros(
                valor
            ).slice(
                0,
                11
            );


        if (
            numeros.length <= 2
        ) {
            return numeros;
        }


        if (
            numeros.length <= 6
        ) {

            return numeros.replace(
                /^(\d{2})(\d+)/,
                "($1) $2"
            );
        }


        if (
            numeros.length <= 10
        ) {

            return numeros.replace(
                /^(\d{2})(\d{4})(\d+)/,
                "($1) $2-$3"
            );
        }


        return numeros.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );
    }


    /* ============================================================
       MÁSCARA CPF / CNPJ - CADASTRO
    ============================================================ */

    function mascaraCpfCnpjCadastro(
        valor
    ) {

        const numeros =
            somenteNumeros(
                valor
            ).slice(
                0,
                14
            );


        if (
            numeros.length <= 11
        ) {

            return numeros
                .replace(
                    /^(\d{3})(\d)/,
                    "$1.$2"
                )
                .replace(
                    /^(\d{3})\.(\d{3})(\d)/,
                    "$1.$2.$3"
                )
                .replace(
                    /\.(\d{3})(\d)/,
                    ".$1-$2"
                );
        }


        return numeros
            .replace(
                /^(\d{2})(\d)/,
                "$1.$2"
            )
            .replace(
                /^(\d{2})\.(\d{3})(\d)/,
                "$1.$2.$3"
            )
            .replace(
                /\.(\d{3})(\d)/,
                ".$1/$2"
            )
            .replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );
    }


    /* ============================================================
       MÁSCARA CEP - CADASTRO
    ============================================================ */

    function mascaraCepCadastro(
        valor
    ) {

        const numeros =
            somenteNumeros(
                valor
            ).slice(
                0,
                8
            );


        if (
            numeros.length <= 5
        ) {
            return numeros;
        }


        return numeros.replace(
            /^(\d{5})(\d+)/,
            "$1-$2"
        );
    }


    /* ============================================================
       ABRIR MODAL
    ============================================================ */

    function abrirModalCadastro() {

        setCadastro({
            email: "",
            nome: "",
            sobrenome: "",
            data_nascimento: "",
            whatsapp: "",
            cpf_cnpj: "",
            cep: "",
            rua_avenida: "",
            numero: "",
            bairro: "",
            cidade: ""
        });


        setVerificandoEmail(
            false
        );

        setEmailVerificado(
            false
        );

        setClienteEmailExistente(
            null
        );

        setBuscandoCepCadastro(
            false
        );

        setErroCadastro("");

        setModalCadastro(
            true
        );
    }


    /* ============================================================
       FECHAR MODAL
    ============================================================ */

    function fecharModalCadastro() {

        if (
            salvandoCliente
        ) {
            return;
        }


        setModalCadastro(
            false
        );

        setErroCadastro("");
    }


    /* ============================================================
       CONSULTAR CEP
    ============================================================ */

    async function buscarCepCadastro(
        valorCep
    ) {

        const cep =
            somenteNumeros(
                valorCep
            );


        if (
            cep.length !== 8
        ) {
            return;
        }


        try {

            setBuscandoCepCadastro(
                true
            );

            setErroCadastro("");


            const resposta =
                await fetch(
                    `https://viacep.com.br/ws/${cep}/json/`
                );


            if (
                !resposta.ok
            ) {

                throw new Error(
                    "Não foi possível consultar o CEP."
                );
            }


            const resultado =
                await resposta.json();


            if (
                resultado?.erro
            ) {

                throw new Error(
                    "CEP não encontrado."
                );
            }


            setCadastro(
                anterior => ({

                    ...anterior,

                    cep:
                        mascaraCepCadastro(
                            cep
                        ),

                    rua_avenida:
                        resultado.logradouro ||
                        "",

                    bairro:
                        resultado.bairro ||
                        "",

                    cidade:
                        resultado.localidade ||
                        ""
                })
            );


        } catch (erroCep) {

            console.error(
                "[IRONSTORE CADASTRO CEP]",
                erroCep
            );


            setErroCadastro(
                erroCep?.message ||
                "Não foi possível consultar o CEP."
            );


        } finally {

            setBuscandoCepCadastro(
                false
            );
        }
    }


    /* ============================================================
       CADASTRAR CLIENTE
    ============================================================ */

    async function cadastrarNovoCliente() {

        if (
            salvandoCliente
        ) {
            return;
        }


        if (
            !emailVerificado
        ) {

            setErroCadastro(
                "Aguarde a verificação do e-mail."
            );

            return;
        }


        if (
            clienteEmailExistente
        ) {

            setErroCadastro(
                "Este e-mail já está cadastrado."
            );

            return;
        }


        if (
            !cadastro.nome.trim()
        ) {

            setErroCadastro(
                "Informe o nome do cliente."
            );

            return;
        }


        if (
            !cadastro.sobrenome.trim()
        ) {

            setErroCadastro(
                "Informe o sobrenome do cliente."
            );

            return;
        }


        try {

            setSalvandoCliente(
                true
            );

            setErroCadastro("");


            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                throw new Error(
                    "Sessão do painel não encontrada."
                );
            }


            const resposta =
                await fetch(
                    `${API_URL}/ironstore/clientes/painel/cadastrar`,
                    {
                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                cadastro
                            )
                    }
                );


            const resultado =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (
                resposta.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                window.location.replace(
                    "/"
                );

                return;
            }


            if (
                !resposta.ok
            ) {

                throw new Error(
                    resultado?.detail ||
                    "Não foi possível cadastrar o cliente."
                );
            }


            /*
                ADICIONA IMEDIATAMENTE
                NA TABELA
            */

            if (
                resultado?.cliente
            ) {

                setClientes(
                    anteriores => [

                        resultado.cliente,

                        ...anteriores.filter(
                            cliente =>
                                cliente.id !==
                                resultado.cliente.id
                        )
                    ]
                );
            }


            setModalCadastro(
                false
            );


        } catch (erroSalvar) {

            console.error(
                "[IRONSTORE CADASTRAR CLIENTE]",
                erroSalvar
            );


            setErroCadastro(
                erroSalvar?.message ||
                "Não foi possível cadastrar o cliente."
            );


        } finally {

            setSalvandoCliente(
                false
            );
        }
    }
    /* ============================================================
       ENTRAR COMO CLIENTE
    ============================================================ */

    async function entrarComoCliente(
        cliente
    ) {

        if (!cliente?.id) {
            return;
        }

        try {

            setClienteEntrando(
                cliente.id
            );


            /* =====================================================
               TOKEN DO PAINEL
            ===================================================== */

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                throw new Error(
                    "Sessão do painel não encontrada."
                );

            }


            /* =====================================================
               SOLICITAR ACESSO TEMPORÁRIO
            ===================================================== */

            const resposta =
                await fetch(
                    `${API_URL}/ironstore/clientes/painel/${cliente.id}/entrar`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            /* =====================================================
               SESSÃO DO PAINEL EXPIRADA
            ===================================================== */

            if (
                resposta.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                window.location.replace(
                    "/"
                );

                return;

            }


            /* =====================================================
               RESPOSTA
            ===================================================== */

            const dados =
                await resposta
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!resposta.ok) {

                throw new Error(
                    dados?.detail ||
                    `Erro ${resposta.status} ao acessar cliente.`
                );

            }


            /* =====================================================
               VALIDAR URL
            ===================================================== */

            const url =
                String(
                    dados?.url || ""
                ).trim();


            if (!url) {

                throw new Error(
                    "O servidor não retornou o endereço de acesso."
                );

            }


            /* =====================================================
               ABRIR LOJA
            ===================================================== */

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );


        } catch (erro) {

            console.error(
                "[IRONSTORE ENTRAR COMO CLIENTE]",
                erro
            );

            alert(
                erro?.message ||
                "Não foi possível entrar na conta deste cliente."
            );

        } finally {

            setClienteEntrando(
                null
            );

        }

    }
    /* ============================================================
       ABRIR WHATSAPP
    ============================================================ */

    function abrirWhatsapp(
        whatsapp
    ) {

        const numeros =
            String(
                whatsapp || ""
            ).replace(
                /\D/g,
                ""
            );


        if (!numeros) {

            return;

        }


        let telefone =
            numeros;


        if (
            numeros.length === 10 ||
            numeros.length === 11
        ) {

            telefone =
                `55${numeros}`;

        }


        window.open(
            `https://wa.me/${telefone}`,
            "_blank",
            "noopener,noreferrer"
        );

    }


    /* ============================================================
       CARREGANDO
    ============================================================ */

    if (carregando) {

        return (

            <div className="ironstore-rclientes-loading">

                <div className="ironstore-rclientes-loading-spinner" />

                <strong>
                    Carregando clientes
                </strong>

                <span>
                    Buscando os clientes cadastrados na sua loja.
                </span>

            </div>

        );

    }


    /* ============================================================
       INTERFACE
    ============================================================ */

    return (

        <section className="ironstore-rclientes-container">


            {/* ====================================================
                CABEÇALHO
            ==================================================== */}

            <div className="ironstore-rclientes-cabecalho">

                <div className="ironstore-rclientes-cabecalho-conteudo">

                    <div className="ironstore-rclientes-cabecalho-icone">
                        ◎
                    </div>

                    <div className="ironstore-rclientes-cabecalho-textos">

                        <span className="ironstore-rclientes-eyebrow">
                            IRONSTORE CLIENTES
                        </span>

                        <h2 className="ironstore-rclientes-titulo">
                            Clientes
                        </h2>

                        <p className="ironstore-rclientes-descricao">
                            Visualize e gerencie os clientes cadastrados na sua loja.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="ironstore-rclientes-botao-atualizar"
                    onClick={
                        () =>
                            buscarClientes(
                                false
                            )
                    }
                    disabled={
                        atualizando
                    }
                >

                    <span
                        className={
                            atualizando
                                ? "ironstore-rclientes-atualizar-icone ironstore-rclientes-atualizar-icone-girando"
                                : "ironstore-rclientes-atualizar-icone"
                        }
                    >
                        ↻
                    </span>

                    {
                        atualizando
                            ? "Atualizando..."
                            : "Atualizar dados"
                    }

                </button>

            </div>


            {/* ====================================================
                ERRO
            ==================================================== */}

            {
                erro && (

                    <div className="ironstore-rclientes-alerta">

                        <div className="ironstore-rclientes-alerta-icone">
                            !
                        </div>

                        <div className="ironstore-rclientes-alerta-texto">

                            <strong>
                                Não foi possível carregar os clientes
                            </strong>

                            <span>
                                {erro}
                            </span>

                        </div>

                    </div>

                )
            }


            {/* ====================================================
                ESTATÍSTICAS
            ==================================================== */}

            <div className="ironstore-rclientes-resumo">

                <article className="ironstore-rclientes-card ironstore-rclientes-card-total">

                    <div className="ironstore-rclientes-card-topo">

                        <span>
                            Total de clientes
                        </span>

                        <div className="ironstore-rclientes-card-icone">
                            ◎
                        </div>

                    </div>

                    <strong>
                        {
                            estatisticas.total
                                .toLocaleString(
                                    "pt-BR"
                                )
                        }
                    </strong>

                    <small>
                        Clientes cadastrados
                    </small>

                </article>


                <article className="ironstore-rclientes-card ironstore-rclientes-card-whatsapp">

                    <div className="ironstore-rclientes-card-topo">

                        <span>
                            Com WhatsApp
                        </span>

                        <div className="ironstore-rclientes-card-icone">
                            ◉
                        </div>

                    </div>

                    <strong>
                        {
                            estatisticas.comWhatsapp
                                .toLocaleString(
                                    "pt-BR"
                                )
                        }
                    </strong>

                    <small>
                        Contatos disponíveis
                    </small>

                </article>


                <article className="ironstore-rclientes-card ironstore-rclientes-card-endereco">

                    <div className="ironstore-rclientes-card-topo">

                        <span>
                            Com endereço
                        </span>

                        <div className="ironstore-rclientes-card-icone">
                            ◇
                        </div>

                    </div>

                    <strong>
                        {
                            estatisticas.comEndereco
                                .toLocaleString(
                                    "pt-BR"
                                )
                        }
                    </strong>

                    <small>
                        Endereços cadastrados
                    </small>

                </article>


                <article className="ironstore-rclientes-card ironstore-rclientes-card-documento">

                    <div className="ironstore-rclientes-card-topo">

                        <span>
                            Com CPF/CNPJ
                        </span>

                        <div className="ironstore-rclientes-card-icone">
                            ▣
                        </div>

                    </div>

                    <strong>
                        {
                            estatisticas.comDocumento
                                .toLocaleString(
                                    "pt-BR"
                                )
                        }
                    </strong>

                    <small>
                        Documentos cadastrados
                    </small>

                </article>

            </div>


            {/* ====================================================
                PAINEL
            ==================================================== */}

            <div className="ironstore-rclientes-painel">


                {/* =================================================
                    TOPO DA LISTA
                ================================================= */}

                <div className="ironstore-rclientes-painel-topo">

                    <div className="ironstore-rclientes-painel-titulo">

                        <h3>
                            Clientes cadastrados
                        </h3>

                        <p>
                            Consulte os dados dos clientes vinculados à sua loja.
                        </p>

                    </div>
                    <button
                        type="button"
                        className="ironstore-rclientes-novo-cliente"
                        onClick={
                            abrirModalCadastro
                        }
                    >
                        <span>
                            +
                        </span>

                        Registrar novo cliente
                    </button>

                    <div className="ironstore-rclientes-busca">

                        <span className="ironstore-rclientes-busca-icone">
                            ⌕
                        </span>

                        <input
                            type="text"
                            value={
                                busca
                            }
                            onChange={
                                (evento) =>
                                    setBusca(
                                        evento.target.value
                                    )
                            }
                            placeholder="Buscar nome, e-mail, CPF, telefone..."
                        />

                        {
                            busca && (

                                <button
                                    type="button"
                                    className="ironstore-rclientes-busca-limpar"
                                    onClick={
                                        () =>
                                            setBusca("")
                                    }
                                    aria-label="Limpar busca"
                                >
                                    ×
                                </button>

                            )
                        }

                    </div>

                </div>


                {/* =================================================
                    INFORMAÇÕES
                ================================================= */}

                <div className="ironstore-rclientes-info">

                    <span className="ironstore-rclientes-status">

                        <i />

                        Dados atualizados

                    </span>

                    <span className="ironstore-rclientes-quantidade">

                        {
                            clientesFiltrados.length
                        } {
                            clientesFiltrados.length === 1
                                ? "cliente"
                                : "clientes"
                        }

                    </span>

                </div>


                {/* =================================================
                    LISTA VAZIA
                ================================================= */}

                {
                    clientesFiltrados.length === 0 && (

                        <div className="ironstore-rclientes-vazio">

                            <div className="ironstore-rclientes-vazio-icone">
                                ◎
                            </div>

                            <strong>
                                Nenhum cliente encontrado
                            </strong>

                            <p>
                                {
                                    busca
                                        ? "Nenhum cliente corresponde à sua busca."
                                        : "Ainda não existem clientes cadastrados nesta loja."
                                }
                            </p>

                        </div>

                    )
                }


                {/* =================================================
                    TABELA
                ================================================= */}

                {
                    clientesFiltrados.length > 0 && (

                        <div className="ironstore-rclientes-tabela-container">

                            <table className="ironstore-rclientes-tabela">

                                <thead>

                                    <tr>

                                        <th>
                                            Cliente
                                        </th>

                                        <th>
                                            Contato
                                        </th>

                                        <th>
                                            CPF/CNPJ
                                        </th>

                                        <th>
                                            Endereço
                                        </th>

                                        <th>
                                            Nascimento
                                        </th>

                                        <th className="ironstore-rclientes-th-acoes">
                                            Ações
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        clientesFiltrados.map(
                                            (cliente) => {

                                                const endereco =
                                                    montarEndereco(
                                                        cliente
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            cliente.id
                                                        }
                                                    >

                                                        {/* =========================
                                                            CLIENTE
                                                        ========================= */}

                                                        <td>

                                                            <div className="ironstore-rclientes-cliente">

                                                                <div className="ironstore-rclientes-avatar">

                                                                    {
                                                                        cliente?.foto
                                                                            ? (

                                                                                <img
                                                                                    src={
                                                                                        cliente.foto
                                                                                    }
                                                                                    alt={
                                                                                        pegarNomeCompleto(
                                                                                            cliente
                                                                                        )
                                                                                    }
                                                                                />

                                                                            )
                                                                            : (

                                                                                <span>
                                                                                    {
                                                                                        pegarIniciais(
                                                                                            cliente
                                                                                        )
                                                                                    }
                                                                                </span>

                                                                            )
                                                                    }

                                                                </div>


                                                                <div className="ironstore-rclientes-cliente-dados">

                                                                    <strong>
                                                                        {
                                                                            pegarNomeCompleto(
                                                                                cliente
                                                                            )
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            cliente?.email ||
                                                                            "E-mail não informado"
                                                                        }
                                                                    </span>

                                                                    <small>
                                                                        ID #{cliente.id}
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* =========================
                                                            CONTATO
                                                        ========================= */}

                                                        <td>

                                                            <div className="ironstore-rclientes-contato">

                                                                <strong>
                                                                    {
                                                                        formatarWhatsapp(
                                                                            cliente?.whatsapp
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        cliente?.email ||
                                                                        "Sem e-mail"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* =========================
                                                            DOCUMENTO
                                                        ========================= */}

                                                        <td>

                                                            <span className="ironstore-rclientes-documento">

                                                                {
                                                                    formatarDocumento(
                                                                        cliente?.cpf_cnpj
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* =========================
                                                            ENDEREÇO
                                                        ========================= */}

                                                        <td>

                                                            <div className="ironstore-rclientes-endereco">

                                                                <strong>
                                                                    {
                                                                        endereco.primeiraLinha
                                                                    }
                                                                </strong>

                                                                {
                                                                    endereco.segundaLinha && (

                                                                        <span>
                                                                            {
                                                                                endereco.segundaLinha
                                                                            }
                                                                        </span>

                                                                    )
                                                                }

                                                                {
                                                                    endereco.cep && (

                                                                        <small>
                                                                            CEP {
                                                                                endereco.cep
                                                                            }
                                                                        </small>

                                                                    )
                                                                }

                                                            </div>

                                                        </td>


                                                        {/* =========================
                                                            NASCIMENTO
                                                        ========================= */}

                                                        <td>

                                                            <span className="ironstore-rclientes-nascimento">

                                                                {
                                                                    formatarDataNascimento(
                                                                        cliente?.data_nascimento
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* =========================
                                                            AÇÕES
                                                        ========================= */}

                                                        <td>

                                                            <div className="ironstore-rclientes-acoes">

                                                                <button
                                                                    type="button"
                                                                    className="ironstore-rclientes-acao ironstore-rclientes-acao-entrar"
                                                                    onClick={
                                                                        () =>
                                                                            entrarComoCliente(
                                                                                cliente
                                                                            )
                                                                    }
                                                                    disabled={
                                                                        clienteEntrando === cliente.id
                                                                    }
                                                                    title="Entrar na conta deste cliente"
                                                                >
                                                                    {
                                                                        clienteEntrando === cliente.id
                                                                            ? "Abrindo..."
                                                                            : "Entrar"
                                                                    }
                                                                </button>


                                                                {
                                                                    cliente?.whatsapp && (

                                                                        <button
                                                                            type="button"
                                                                            className="ironstore-rclientes-acao ironstore-rclientes-acao-whatsapp"
                                                                            onClick={
                                                                                () =>
                                                                                    abrirWhatsapp(
                                                                                        cliente.whatsapp
                                                                                    )
                                                                            }
                                                                            title="Abrir WhatsApp"
                                                                        >
                                                                            WhatsApp
                                                                        </button>

                                                                    )
                                                                }


                                                                {
                                                                    cliente?.email && (

                                                                        <a
                                                                            className="ironstore-rclientes-acao ironstore-rclientes-acao-email"
                                                                            href={
                                                                                `mailto:${cliente.email}`
                                                                            }
                                                                        >
                                                                            E-mail
                                                                        </a>

                                                                    )
                                                                }

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    )
                }

            </div>
            {/* ====================================================
    MODAL CADASTRAR CLIENTE
==================================================== */}

            {
                modalCadastro && (

                    <div
                        className="ironstore-rclientes-modal-fundo"
                        onMouseDown={
                            fecharModalCadastro
                        }
                    >

                        <div
                            className="ironstore-rclientes-modal"
                            onMouseDown={
                                evento =>
                                    evento.stopPropagation()
                            }
                        >

                            {/* CABEÇALHO */}

                            <div className="ironstore-rclientes-modal-cabecalho">

                                <div className="ironstore-rclientes-modal-identidade">

                                    {
                                        comercio?.imagem && (

                                            <img
                                                src={
                                                    comercio.imagem
                                                }
                                                alt={
                                                    comercio?.loja ||
                                                    "Loja"
                                                }
                                            />

                                        )
                                    }


                                    <div>

                                        <span>
                                            Novo cliente
                                        </span>

                                        <strong>
                                            {
                                                comercio?.loja ||
                                                "IronStore"
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="ironstore-rclientes-modal-fechar"
                                    onClick={
                                        fecharModalCadastro
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* CONTEÚDO */}

                            <div className="ironstore-rclientes-modal-conteudo">

                                {/* EMAIL */}

                                <div className="ironstore-rclientes-form-campo ironstore-rclientes-form-email">

                                    <label>
                                        E-mail do cliente
                                    </label>

                                    <input
                                        type="email"
                                        autoFocus
                                        value={
                                            cadastro.email
                                        }
                                        placeholder="cliente@email.com"
                                        onChange={
                                            evento => {

                                                setCadastro(
                                                    anterior => ({
                                                        ...anterior,

                                                        email:
                                                            evento.target.value
                                                    })
                                                );

                                                setErroCadastro("");
                                            }
                                        }
                                    />


                                    {
                                        verificandoEmail && (

                                            <small className="ironstore-rclientes-email-verificando">
                                                Verificando e-mail...
                                            </small>

                                        )
                                    }


                                    {
                                        !verificandoEmail &&
                                        emailVerificado &&
                                        clienteEmailExistente && (

                                            <div className="ironstore-rclientes-email-existente">

                                                <strong>
                                                    Este e-mail já está cadastrado.
                                                </strong>

                                                <span>
                                                    Cliente: {
                                                        clienteEmailExistente.nome_completo ||
                                                        "Cliente cadastrado"
                                                    }
                                                </span>

                                            </div>

                                        )
                                    }


                                    {
                                        !verificandoEmail &&
                                        emailVerificado &&
                                        !clienteEmailExistente && (

                                            <small className="ironstore-rclientes-email-disponivel">
                                                E-mail disponível. Preencha os dados abaixo.
                                            </small>

                                        )
                                    }

                                </div>


                                {/* RESTANTE DO FORMULÁRIO */}

                                {
                                    emailVerificado &&
                                    !clienteEmailExistente && (

                                        <>

                                            <div className="ironstore-rclientes-form-grid">

                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        Nome
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            cadastro.nome
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,
                                                                        nome:
                                                                            evento.target.value
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>


                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        Sobrenome
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            cadastro.sobrenome
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,
                                                                        sobrenome:
                                                                            evento.target.value
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>


                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        Data de nascimento
                                                    </label>

                                                    <input
                                                        type="date"
                                                        value={
                                                            cadastro.data_nascimento
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,
                                                                        data_nascimento:
                                                                            evento.target.value
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>


                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        WhatsApp
                                                    </label>

                                                    <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        maxLength={15}
                                                        placeholder="(11) 99999-9999"
                                                        value={
                                                            cadastro.whatsapp
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,

                                                                        whatsapp:
                                                                            mascaraWhatsappCadastro(
                                                                                evento.target.value
                                                                            )
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>


                                                <div className="ironstore-rclientes-form-campo ironstore-rclientes-form-largo">

                                                    <label>
                                                        CPF / CNPJ
                                                    </label>

                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={18}
                                                        placeholder="CPF ou CNPJ"
                                                        value={
                                                            cadastro.cpf_cnpj
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,

                                                                        cpf_cnpj:
                                                                            mascaraCpfCnpjCadastro(
                                                                                evento.target.value
                                                                            )
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>

                                            </div>


                                            <div className="ironstore-rclientes-form-secao">
                                                Endereço
                                            </div>


                                            <div className="ironstore-rclientes-form-grid">

                                                <div className="ironstore-rclientes-form-campo ironstore-rclientes-form-largo">

                                                    <label>
                                                        CEP
                                                    </label>

                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={9}
                                                        placeholder="00000-000"
                                                        value={
                                                            cadastro.cep
                                                        }
                                                        onChange={
                                                            evento => {

                                                                const cep =
                                                                    mascaraCepCadastro(
                                                                        evento.target.value
                                                                    );


                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,
                                                                        cep
                                                                    })
                                                                );


                                                                if (
                                                                    somenteNumeros(
                                                                        cep
                                                                    ).length === 8
                                                                ) {

                                                                    buscarCepCadastro(
                                                                        cep
                                                                    );
                                                                }
                                                            }
                                                        }
                                                    />


                                                    {
                                                        buscandoCepCadastro && (

                                                            <small>
                                                                Buscando endereço...
                                                            </small>

                                                        )
                                                    }

                                                </div>


                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        Rua / Avenida
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            cadastro.rua_avenida
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,

                                                                        rua_avenida:
                                                                            evento.target.value
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>


                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        Número
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            cadastro.numero
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,

                                                                        numero:
                                                                            evento.target.value
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>


                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        Bairro
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            cadastro.bairro
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,

                                                                        bairro:
                                                                            evento.target.value
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>


                                                <div className="ironstore-rclientes-form-campo">

                                                    <label>
                                                        Cidade
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            cadastro.cidade
                                                        }
                                                        onChange={
                                                            evento =>
                                                                setCadastro(
                                                                    anterior => ({
                                                                        ...anterior,

                                                                        cidade:
                                                                            evento.target.value
                                                                    })
                                                                )
                                                        }
                                                    />

                                                </div>

                                            </div>

                                        </>

                                    )
                                }


                                {
                                    erroCadastro && (

                                        <div className="ironstore-rclientes-form-erro">
                                            {erroCadastro}
                                        </div>

                                    )
                                }

                            </div>


                            {/* AÇÕES */}

                            <div className="ironstore-rclientes-modal-acoes">

                                <button
                                    type="button"
                                    onClick={
                                        fecharModalCadastro
                                    }
                                    disabled={
                                        salvandoCliente
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="button"
                                    className="principal"
                                    onClick={
                                        cadastrarNovoCliente
                                    }
                                    disabled={
                                        salvandoCliente ||
                                        verificandoEmail ||
                                        !emailVerificado ||
                                        Boolean(
                                            clienteEmailExistente
                                        )
                                    }
                                >

                                    {
                                        salvandoCliente
                                            ? "Cadastrando..."
                                            : "Cadastrar cliente"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )
            }
        </section>

    );

}