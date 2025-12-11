import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { API_URL } from "../../../../../../config";
import "./body.css";

// Importa todos os módulos
import Produtividade from "./produtividade/produtividade";
import Administracao from "./administracao/administracao";
import DeliveryEVendasOnline from "./delivery_e_vendas_online/delivery";
import MesasSalaoECozinha from "./mesa_salao_cozinha/mesasalaocozinha";
import IntegracaoIFood from "./integracao_ifood/ifood";
import Agendamentos from "./agendamentos/agendamentos";
import Gerencial from "./gerencial/ferencial";
import Fiscal from "./fiscal/fiscal";
import Controle from "./controle/controle";

export default function Body({ setHeaderMinimizado }) {

    const [modulosVisiveis, setModulosVisiveis] = useState([]);
    const [moduloAtivo, setModuloAtivo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [fade, setFade] = useState(false);
    const [modoModuloAberto, setModoModuloAberto] = useState(false);

    const [ComponenteAtivo, setComponenteAtivo] = useState(null);

    const componentes = {
        "Produtividade": Produtividade,
        "Administracao": Administracao,
        "Administração": Administracao,
        "Delivery e vendas online": DeliveryEVendasOnline,
        "Mesas, salão e cozinha": MesasSalaoECozinha,
        "Integração iFood": IntegracaoIFood,
        "Agendamentos": Agendamentos,
        "Gerencial": Gerencial,
        "Fiscal": Fiscal,
        "Controle": Controle
    };

    useEffect(() => {
        async function carregar() {
            const token = localStorage.getItem("token");
            if (!token) return;

            const h = { Authorization: "Bearer " + token };

            const cliente = await (await fetch(`${API_URL}/retorno/me`, { headers: h })).json();
            const modulos = await (await fetch(`${API_URL}/retorno/modulos`, { headers: h })).json();
            const permissoes = await (await fetch(`${API_URL}/retorno/permissoes/${cliente.id}`, { headers: h })).json();

            const filtrados = filtrarModulos({ modulos, cliente, permissoes });
            setModulosVisiveis(filtrados);

            setTimeout(() => {
                setCarregando(false);
                setFade(true);
            }, 150);
        }

        carregar();
    }, []);

    function filtrarModulos({ modulos, cliente, permissoes }) {
        return modulos.filter(mod => {
            if (mod.ativo === 0) return false;

            const modulosDoComercio = cliente.modulos_comercio || [];
            const temNoComercio = modulosDoComercio.includes(mod.modulo);
            if (!temNoComercio) return false;

            if (cliente.funcao === "Funcionario(a)") {
                const bloqueado = permissoes.find(p => p.modulo === mod.modulo);
                if (bloqueado) return false;
            }

            return true;
        });
    }

    function abrirModulo(modulo) {
        setModuloAtivo(modulo);
        setModoModuloAberto(true);
        setHeaderMinimizado(true);

        const Comp = componentes[modulo];
        setComponenteAtivo(() => Comp);
    }

    function fecharModulo() {
        setModoModuloAberto(false);
        setHeaderMinimizado(false);
        setComponenteAtivo(null);
    }

    if (carregando) {
        return (
            <div className="body-skeleton">
                <div className="sk-title"></div>
                <div className="sk-modulos">
                    <div className="sk-card"></div>
                    <div className="sk-card"></div>
                    <div className="sk-card"></div>
                </div>
                <div className="sk-area"></div>
            </div>
        );
    }

    return (
        <div className={`body-container body-fade ${fade ? "show" : ""}`}>

            {!modoModuloAberto && (
                <h1 className="titulo-body fade-in-up">Módulos do seu comércio</h1>
            )}

            {!modoModuloAberto && (
                <div className="modulos-wrapper fade-in-up-delay">
                    <div className="modulos-lista">
                        {modulosVisiveis.map((m, i) => (
                            <button
                                key={m.modulo}
                                className={`modulo-card anim-${i}`}
                                onClick={() => abrirModulo(m.modulo)}
                            >
                                <span>{m.modulo}</span>
                            </button>
                        ))}

                        <button
                            className="modulo-card"
                            onClick={() => abrirModulo("Controle")}
                        >
                            <span>Controle</span>
                        </button>
                    </div>
                </div>
            )}

            {/* RENDERIZAÇÃO DO BOTÃO FIXO COM PORTAL */}
            {modoModuloAberto && createPortal(
                <div className="modulo-tag-flutuante" onClick={fecharModulo}>
                    <span className="modulo-tag-nome">{moduloAtivo}</span>
                    <span className="modulo-tag-voltar">voltar</span>
                </div>,
                document.body
            )}

            {modoModuloAberto && (
                <div className="area-modulo-ativa fade-expand">
                    <div className="conteudo-modulo">
                        {ComponenteAtivo ? <ComponenteAtivo /> : <p>Carregando...</p>}
                    </div>
                </div>
            )}

        </div>
    );
}
