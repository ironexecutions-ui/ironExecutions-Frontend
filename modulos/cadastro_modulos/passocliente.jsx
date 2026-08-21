import React, { useState } from "react";
import "./passocliente.css";

export default function Passo4Cliente({ onFinalizar }) {

    const [email, setEmail] = useState("");
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [cargo, setCargo] = useState("");
    const [funcao] = useState("Administrador(a)");
    const [matricula, setMatricula] = useState("");
    const [erro, setErro] = useState("");

    function formatarNomeCompleto(valor) {
        return valor.replace(/\b\w+/g, palavra => {
            return (
                palavra.charAt(0).toUpperCase() +
                palavra.slice(1).toLowerCase()
            );
        });
    }

    function mensagemSenha() {

        if (!confirmarSenha) {
            return "Digite novamente a senha para confirmar";
        }

        if (senha !== confirmarSenha) {
            return "As senhas não coincidem";
        }

        return "As senhas coincidem";
    }

    function statusSenha() {

        if (!confirmarSenha) return "aviso";

        if (senha !== confirmarSenha) return "erro";

        return "ok";
    }

    async function enviar(e) {

        e.preventDefault();

        setErro("");

        if (!email.trim()) {
            setErro("Digite o email do responsável.");
            return;
        }

        if (!nomeCompleto.trim()) {
            setErro("Digite o nome completo do responsável.");
            return;
        }

        if (senha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        onFinalizar({
            email,
            nome_completo: nomeCompleto,
            senha,
            cargo,
            funcao,
            matricula: matricula || null
        });
    }

    return (
        <section className="passo4-cliente-painel">

            {/* CABEÇALHO */}
            <div className="passo4-cliente-cabecalho">

                <div className="passo4-cliente-cabecalho-textos">

                    <span className="passo4-cliente-etapa">
                        ETAPA FINAL
                    </span>

                    <h3 className="passo4-cliente-titulo">
                        Responsável pelo comércio
                    </h3>

                    <p className="passo4-cliente-subtitulo">
                        Crie o acesso principal de administração do seu comércio.
                        Este usuário terá perfil de administrador no sistema.
                    </p>

                </div>

                <div className="passo4-cliente-etapa-indicador">
                    <span>Cadastro</span>
                    <strong>4 de 4</strong>
                </div>

            </div>


            <form
                onSubmit={enviar}
                className="passo4-cliente-formulario"
            >

                {erro && (
                    <div className="passo4-cliente-erro">
                        <strong>Não foi possível continuar</strong>
                        <span>{erro}</span>
                    </div>
                )}


                {/* IDENTIFICAÇÃO */}
                <div className="passo4-cliente-secao">

                    <div className="passo4-cliente-secao-cabecalho">
                        <span className="passo4-cliente-secao-numero">
                            01
                        </span>

                        <div>
                            <h4>Identificação</h4>

                            <p>
                                Informe os dados de quem será responsável
                                pelo acesso administrativo.
                            </p>
                        </div>
                    </div>


                    <div className="passo4-cliente-grid">

                        <div className="passo4-cliente-campo passo4-cliente-campo-grande">

                            <label htmlFor="passo4-email">
                                Email
                                <span>*</span>
                            </label>

                            <input
                                id="passo4-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="exemplo@empresa.com.br"
                                className="passo4-cliente-input"
                                autoComplete="email"
                            />

                            <small>
                                Este email será utilizado para acessar o sistema.
                            </small>

                        </div>


                        <div className="passo4-cliente-campo passo4-cliente-campo-grande">

                            <label htmlFor="passo4-nome">
                                Nome completo
                                <span>*</span>
                            </label>

                            <input
                                id="passo4-nome"
                                type="text"
                                value={nomeCompleto}
                                onChange={e =>
                                    setNomeCompleto(
                                        formatarNomeCompleto(e.target.value)
                                    )
                                }
                                placeholder="Nome e sobrenome"
                                className="passo4-cliente-input"
                                autoComplete="name"
                            />

                            <small>
                                Informe o nome completo do responsável.
                            </small>

                        </div>

                    </div>

                </div>


                {/* SEGURANÇA */}
                <div className="passo4-cliente-secao">

                    <div className="passo4-cliente-secao-cabecalho">

                        <span className="passo4-cliente-secao-numero">
                            02
                        </span>

                        <div>
                            <h4>Segurança da conta</h4>

                            <p>
                                Defina a senha utilizada para entrar
                                na área administrativa.
                            </p>
                        </div>

                    </div>


                    <div className="passo4-cliente-grid">

                        <div className="passo4-cliente-campo">

                            <label htmlFor="passo4-senha">
                                Senha
                                <span>*</span>
                            </label>

                            <input
                                id="passo4-senha"
                                type="password"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                placeholder="Mínimo de 6 caracteres"
                                className="passo4-cliente-input"
                                autoComplete="new-password"
                            />

                            <small>
                                Utilize pelo menos 6 caracteres.
                            </small>

                        </div>


                        <div className="passo4-cliente-campo">

                            <label htmlFor="passo4-confirmar-senha">
                                Confirmar senha
                                <span>*</span>
                            </label>

                            <input
                                id="passo4-confirmar-senha"
                                type="password"
                                value={confirmarSenha}
                                onChange={e =>
                                    setConfirmarSenha(e.target.value)
                                }
                                placeholder="Repita sua senha"
                                className={`
                                    passo4-cliente-input
                                    passo4-cliente-input-${statusSenha()}
                                `}
                                autoComplete="new-password"
                            />

                            <div
                                className={`
                                    passo4-cliente-senha-status
                                    passo4-cliente-senha-status-${statusSenha()}
                                `}
                            >
                                <span className="passo4-cliente-status-ponto" />

                                {mensagemSenha()}
                            </div>

                        </div>

                    </div>

                </div>


                {/* PERFIL */}
                <div className="passo4-cliente-secao">

                    <div className="passo4-cliente-secao-cabecalho">

                        <span className="passo4-cliente-secao-numero">
                            03
                        </span>

                        <div>
                            <h4>Perfil administrativo</h4>

                            <p>
                                Essas informações identificam a função
                                do responsável dentro do comércio.
                            </p>
                        </div>

                    </div>


                    <div className="passo4-cliente-grid">

                        <div className="passo4-cliente-campo">

                            <label htmlFor="passo4-funcao">
                                Função no sistema
                            </label>

                            <div className="passo4-cliente-input-bloqueado-area">

                                <input
                                    id="passo4-funcao"
                                    type="text"
                                    value={funcao}
                                    disabled
                                    className="
                                        passo4-cliente-input
                                        passo4-cliente-input-bloqueado
                                    "
                                />

                                <span className="passo4-cliente-admin-selo">
                                    ACESSO PRINCIPAL
                                </span>

                            </div>

                            <small>
                                O primeiro usuário é criado como administrador.
                            </small>

                        </div>


                        <div className="passo4-cliente-campo">

                            <label htmlFor="passo4-cargo">
                                Cargo
                            </label>

                            <input
                                id="passo4-cargo"
                                type="text"
                                list="passo4-cargos"
                                value={cargo}
                                onChange={e => setCargo(e.target.value)}
                                placeholder="Selecione ou digite seu cargo"
                                className="passo4-cliente-input"
                            />

                            <datalist id="passo4-cargos">
                                <option value="Gerente" />
                                <option value="Gerente Geral" />
                                <option value="Administrador" />
                                <option value="Administrador Financeiro" />
                                <option value="Diretor" />
                                <option value="Diretor Administrativo" />
                                <option value="Sócio Administrador" />
                                <option value="Responsável Legal" />
                                <option value="Gestor de Operações" />
                                <option value="Gestor Comercial" />
                                <option value="Coordenador Administrativo" />
                                <option value="Supervisor Geral" />
                            </datalist>

                            <small>
                                Você também pode escrever um cargo personalizado.
                            </small>

                        </div>


                        <div className="passo4-cliente-campo passo4-cliente-campo-total">

                            <label htmlFor="passo4-matricula">
                                Matrícula do comércio
                                <span className="passo4-cliente-opcional">
                                    OPCIONAL
                                </span>
                            </label>

                            <input
                                id="passo4-matricula"
                                type="text"
                                value={matricula}
                                onChange={e =>
                                    setMatricula(e.target.value)
                                }
                                placeholder="Informe somente se possuir matrícula"
                                className="passo4-cliente-input"
                            />

                            <small>
                                Caso seu comércio já possua uma matrícula,
                                informe-a neste campo.
                            </small>

                        </div>

                    </div>

                </div>


                {/* FINALIZAÇÃO */}
                <div className="passo4-cliente-finalizacao">

                    <div className="passo4-cliente-finalizacao-info">

                        <span className="passo4-cliente-finalizacao-icone">
                            ✓
                        </span>

                        <div>
                            <strong>
                                Última etapa
                            </strong>

                            <span>
                                Revise os dados antes de finalizar o cadastro.
                            </span>
                        </div>

                    </div>


                    <button
                        type="submit"
                        className="passo4-cliente-botao-finalizar"
                    >
                        <span>Finalizar cadastro</span>
                        <strong>→</strong>
                    </button>

                </div>

            </form>

        </section>
    );
}