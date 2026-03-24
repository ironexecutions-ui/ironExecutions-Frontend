import React, { useState } from "react";
import "./estruturacurso.css";

export default function EstruturaCurso() {

    const [visivel, setVisivel] = useState(2);

    const meses = [

        {
            titulo: "🔵 MÊS 1 – FUNDAMENTOS DE HTML",
            semanas: [
                {
                    titulo: "Semana 1 – Estrutura base",
                    aulas: [
                        {
                            nome: "Aula 1",
                            duracao: "1h30",
                            conteudo: [
                                "Como o navegador interpreta HTML",
                                "Criação do primeiro arquivo index.html",
                                "Estrutura base: html, head, body",
                                "Uso de títulos (h1 até h6)",
                                "Parágrafos e organização de texto",
                                "Erros comuns de iniciantes"
                            ]
                        },
                        {
                            nome: "Aula 2",
                            duracao: "2h",
                            conteudo: [
                                "Listas ordenadas e não ordenadas",
                                "Uso de li na prática",
                                "Separadores com hr e quebras com br",
                                "Organização visual do conteúdo",
                                "Criação de página com estrutura completa"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 2 – Navegação",
                    aulas: [
                        {
                            nome: "Aula 3",
                            duracao: "1h30",
                            conteudo: [
                                "Inserção de imagens (img, src, alt)",
                                "Caminhos de arquivos (relativo vs absoluto)",
                                "Criação de links (a, href)",
                                "Abrir links em nova aba",
                                "Boas práticas com imagens"
                            ]
                        },
                        {
                            nome: "Aula 4",
                            duracao: "2h",
                            conteudo: [
                                "Criação de menu de navegação",
                                "Estrutura de múltiplas páginas",
                                "Conectar páginas com links",
                                "Organização de pastas do projeto",
                                "Construção de mini site com 2 páginas"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 3 – Estrutura avançada",
                    aulas: [
                        {
                            nome: "Aula 5",
                            duracao: "1h30",
                            conteudo: [
                                "Criação de tabelas (table, tr, td, th)",
                                "Organização de dados em tabela",
                                "Uso real de tabelas em projetos"
                            ]
                        },
                        {
                            nome: "Aula 6",
                            duracao: "2h",
                            conteudo: [
                                "Tags semânticas (header, main, footer, section)",
                                "Diferença entre div e semântica",
                                "Estrutura profissional de site",
                                "Montagem de layout completo"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 4 – Formulários",
                    aulas: [
                        {
                            nome: "Aula 7",
                            duracao: "1h30",
                            conteudo: [
                                "Inputs: text, email, password",
                                "Uso correto de labels",
                                "Organização de formulário",
                                "Validações básicas do HTML"
                            ]
                        },
                        {
                            nome: "Aula 8",
                            duracao: "2h",
                            conteudo: [
                                "Select, textarea, button",
                                "Criação de formulário completo",
                                "Simulação de cadastro",
                                "Estrutura de página de cadastro"
                            ]
                        }
                    ]
                }
            ]
        },

        {
            titulo: "🟣 MÊS 2 – CSS (ESTILO E DESIGN)",
            semanas: [
                {
                    titulo: "Semana 5 – Introdução ao CSS",
                    aulas: [
                        {
                            nome: "Aula 9",
                            duracao: "1h30",
                            conteudo: [
                                "O que é CSS e como funciona",
                                "CSS inline, interno e externo",
                                "Criação do arquivo styles.css",
                                "Seletores básicos"
                            ]
                        },
                        {
                            nome: "Aula 10",
                            duracao: "2h",
                            conteudo: [
                                "Cores (hex, rgb)",
                                "Fontes e tamanhos",
                                "Estilização de texto",
                                "Melhoria visual do HTML"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 6 – Box Model",
                    aulas: [
                        {
                            nome: "Aula 11",
                            duracao: "1h30",
                            conteudo: [
                                "Margin, padding, border",
                                "Espaçamento entre elementos",
                                "Visualização do box model"
                            ]
                        },
                        {
                            nome: "Aula 12",
                            duracao: "2h",
                            conteudo: [
                                "Width e height",
                                "Controle de tamanho de elementos",
                                "Criação de layout organizado"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 7 – Layout moderno",
                    aulas: [
                        {
                            nome: "Aula 13",
                            duracao: "1h30",
                            conteudo: [
                                "Display flex",
                                "Direção (row, column)",
                                "Alinhamento básico"
                            ]
                        },
                        {
                            nome: "Aula 14",
                            duracao: "2h",
                            conteudo: [
                                "Justify-content e align-items",
                                "Centralização completa",
                                "Criação de layout moderno"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 8 – Responsividade",
                    aulas: [
                        {
                            nome: "Aula 15",
                            duracao: "1h30",
                            conteudo: [
                                "Media queries",
                                "Mobile first",
                                "Adaptação de layout"
                            ]
                        },
                        {
                            nome: "Aula 16",
                            duracao: "2h",
                            conteudo: [
                                "Ajustes para celular",
                                "Correções de layout quebrado",
                                "Projeto responsivo completo"
                            ]
                        }
                    ]
                }
            ]
        },

        {
            titulo: "🟡 MÊS 3 – JAVASCRIPT (BASE)",
            semanas: [
                {
                    titulo: "Semana 9 – Introdução",
                    aulas: [
                        {
                            nome: "Aula 17",
                            duracao: "1h30",
                            conteudo: [
                                "O que é JavaScript",
                                "Variáveis (let, const)",
                                "Boas práticas"
                            ]
                        },
                        {
                            nome: "Aula 18",
                            duracao: "2h",
                            conteudo: [
                                "Tipos de dados",
                                "console.log",
                                "Primeiros exercícios"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 10 – Lógica",
                    aulas: [
                        {
                            nome: "Aula 19",
                            duracao: "1h30",
                            conteudo: [
                                "If e else",
                                "Operadores lógicos"
                            ]
                        },
                        {
                            nome: "Aula 20",
                            duracao: "2h",
                            conteudo: [
                                "Funções",
                                "Reutilização de código"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 11 – DOM",
                    aulas: [
                        {
                            nome: "Aula 21",
                            duracao: "1h30",
                            conteudo: [
                                "getElementById",
                                "querySelector",
                                "Selecionar elementos"
                            ]
                        },
                        {
                            nome: "Aula 22",
                            duracao: "2h",
                            conteudo: [
                                "Alterar texto e HTML",
                                "Manipulação dinâmica"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 12 – Eventos",
                    aulas: [
                        {
                            nome: "Aula 23",
                            duracao: "1h30",
                            conteudo: [
                                "Eventos click, input e submit",
                                "Interação com usuário"
                            ]
                        },
                        {
                            nome: "Aula 24",
                            duracao: "2h",
                            conteudo: [
                                "Validação de formulário",
                                "Projeto com JavaScript"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            titulo: "🟢 MÊS 4 – JAVASCRIPT INTERMEDIÁRIO",
            semanas: [
                {
                    titulo: "Semana 13 – Estruturas",
                    aulas: [
                        {
                            nome: "Aula 25",
                            duracao: "1h30",
                            conteudo: [
                                "Arrays",
                                "Adicionar e remover itens",
                                "Percorrer arrays",
                                "Uso real em listas"
                            ]
                        },
                        {
                            nome: "Aula 26",
                            duracao: "2h",
                            conteudo: [
                                "Objetos",
                                "Chave e valor",
                                "Acessar dados",
                                "Simular dados de usuário"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 14 – Manipulação de dados",
                    aulas: [
                        {
                            nome: "Aula 27",
                            duracao: "1h30",
                            conteudo: [
                                "Loop for",
                                "Percorrer listas",
                                "Gerar conteúdo dinâmico"
                            ]
                        },
                        {
                            nome: "Aula 28",
                            duracao: "2h",
                            conteudo: [
                                "map",
                                "filter",
                                "Transformar dados",
                                "Criar listas dinâmicas"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 15 – API",
                    aulas: [
                        {
                            nome: "Aula 29",
                            duracao: "1h30",
                            conteudo: [
                                "O que é API",
                                "Formato JSON",
                                "Requisição e resposta"
                            ]
                        },
                        {
                            nome: "Aula 2",
                            duracao: "2h",
                            conteudo: [
                                "fetch GET",
                                "Consumir API pública",
                                "Mostrar dados na tela"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 16 – Integração",
                    aulas: [
                        {
                            nome: "Aula 30",
                            duracao: "1h30",
                            conteudo: [
                                "Trabalhar com dados externos",
                                "Renderizar dados no HTML",
                                "Atualizar conteúdo dinâmico"
                            ]
                        },
                        {
                            nome: "Aula 31",
                            duracao: "2h",
                            conteudo: [
                                "Projeto com API",
                                "Lista dinâmica",
                                "Simulação de sistema real"
                            ]
                        }
                    ]
                }
            ]
        },

        {
            titulo: "🔴 MÊS 5 – BACKEND (PYTHON + MYSQL)",
            semanas: [
                {
                    titulo: "Semana 17 – Python",
                    aulas: [
                        {
                            nome: "Aula 32",
                            duracao: "1h30",
                            conteudo: [
                                "Introdução ao Python",
                                "Variáveis e print",
                                "Tipos de dados"
                            ]
                        },
                        {
                            nome: "Aula 33",
                            duracao: "2h",
                            conteudo: [
                                "If e else",
                                "Funções",
                                "Lógica aplicada"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 18 – FastAPI",
                    aulas: [
                        {
                            nome: "Aula 34",
                            duracao: "1h30",
                            conteudo: [
                                "Criar servidor FastAPI",
                                "Rodar API local",
                                "Primeira rota GET"
                            ]
                        },
                        {
                            nome: "Aula 35",
                            duracao: "2h",
                            conteudo: [
                                "Rotas POST",
                                "Receber dados",
                                "Testar no Postman"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 19 – MySQL",
                    aulas: [
                        {
                            nome: "Aula 36",
                            duracao: "1h30",
                            conteudo: [
                                "Criar banco de dados",
                                "Criar tabelas",
                                "Estrutura de dados"
                            ]
                        },
                        {
                            nome: "Aula 37",
                            duracao: "2h",
                            conteudo: [
                                "Insert",
                                "Select",
                                "Consultas reais"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 20 – Integração",
                    aulas: [
                        {
                            nome: "Aula 38",
                            duracao: "1h30",
                            conteudo: [
                                "Conectar Python ao banco",
                                "Salvar dados via API"
                            ]
                        },
                        {
                            nome: "Aula 39",
                            duracao: "2h",
                            conteudo: [
                                "CRUD completo",
                                "Criar sistema de cadastro real",
                                "Testar fluxo completo"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            titulo: "🟠 MÊS 6 – GIT, GITHUB E DEPLOY",
            semanas: [
                {
                    titulo: "Semana 21 – Git",
                    aulas: [
                        {
                            nome: "Aula 40",
                            duracao: "1h30",
                            conteudo: [
                                "git init",
                                "git add",
                                "git commit",
                                "Controle de versão"
                            ]
                        },
                        {
                            nome: "Aula 41",
                            duracao: "2h",
                            conteudo: [
                                "Histórico de commits",
                                "Voltar versões",
                                "Fluxo real de desenvolvimento"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 22 – Deploy",
                    aulas: [
                        {
                            nome: "Aula 42",
                            duracao: "1h30",
                            conteudo: [
                                "Criar repositório no GitHub",
                                "push e pull",
                                "Sincronização de código"
                            ]
                        },
                        {
                            nome: "Aula 43",
                            duracao: "2h",
                            conteudo: [
                                "Deploy no Render",
                                "Subir backend",
                                "Testar API online"
                            ]
                        }
                    ]
                }
            ]
        },

        {
            titulo: "⚫ MÊS 7 – PROJETO FINAL",
            semanas: [
                {
                    titulo: "Semana 23 – Planejamento",
                    aulas: [
                        {
                            nome: "Aula 44",
                            duracao: "1h30",
                            conteudo: [
                                "Definir ideia do projeto",
                                "Planejamento de páginas",
                                "Listar funcionalidades"
                            ]
                        },
                        {
                            nome: "Aula 45",
                            duracao: "2h",
                            conteudo: [
                                "Criar estrutura HTML",
                                "Aplicar CSS inicial",
                                "Organizar projeto"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 24 – Desenvolvimento",
                    aulas: [
                        {
                            nome: "Aula 46",
                            duracao: "1h30",
                            conteudo: [
                                "Construir frontend completo",
                                "Interações com JavaScript"
                            ]
                        },
                        {
                            nome: "Aula 47",
                            duracao: "2h",
                            conteudo: [
                                "Conectar backend",
                                "Testar sistema completo"
                            ]
                        }
                    ]
                },
                {
                    titulo: "Semana 25 – Finalização",
                    aulas: [
                        {
                            nome: "Aula 48",
                            duracao: "1h30",
                            conteudo: [
                                "Correção de erros",
                                "Ajustes finais"
                            ]
                        },
                        {
                            nome: "Aula 49",
                            duracao: "2h",
                            conteudo: [
                                "Apresentação do projeto",
                                "Revisão geral",
                                "Preparação para próximos passos"
                            ]
                        }
                    ]
                }
            ]
        }

    ];

    return (
        <section className="estruturaCurso_container">

            <h2 className="estruturaCurso_titulo">
                Como você vai aprender na prática
            </h2>

            <p className="estruturaCurso_subtitulo">
                Cada aula é guiada e aplicada diretamente em projetos reais
            </p>

            <div className="estruturaCurso_lista">

                {meses.slice(0, visivel).map((mes, index) => (

                    <div key={index} className="estruturaCurso_card">

                        <h3 className="estruturaCurso_mes">
                            {mes.titulo}
                        </h3>

                        {mes.semanas.map((semana, i) => (

                            <div key={i} className="estruturaCurso_semana">

                                <h4 className="estruturaCurso_semanaTitulo">
                                    {semana.titulo}
                                </h4>

                                {semana.aulas.map((aula, j) => (

                                    <div key={j} className="estruturaCurso_aula">

                                        <div className="estruturaCurso_aulaHeader">
                                            <span className="estruturaCurso_nomeAula">
                                                {aula.nome}
                                            </span>

                                            <span className="estruturaCurso_duracao">
                                                {aula.duracao}
                                            </span>
                                        </div>

                                        <ul>
                                            {aula.conteudo.map((item, k) => (
                                                <li key={k}>{item}</li>
                                            ))}
                                        </ul>

                                    </div>

                                ))}

                            </div>

                        ))}

                    </div>

                ))}

            </div>

            {visivel < meses.length && (
                <button
                    className="estruturaCurso_botao"
                    onClick={() => setVisivel(visivel + 2)}
                >
                    Ver mais conteúdo
                </button>
            )}

        </section>
    );
}