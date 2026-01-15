import React from "react";
import "./oferecemos.css";

export default function Oferecemos() {

    return (
        <section className="oferecemoss-container" id="oferecemos">
            <h2 className="oferecemos-titulo">O que oferecemos?</h2>

            <div className="oferecemos-conteudo">
                <p className="oferecemos-texto">
                    A Iron Executions não apenas entrega um site. Nós cuidamos de todo o processo técnico para que seu projeto tenha
                    <span className="dourado"> estabilidade</span>,
                    <span className="dourado"> segurança</span> e
                    <span className="dourado"> desempenho</span>. Desenvolvemos o código completo do seu site com padrões modernos de qualidade.
                </p>

                <p className="oferecemos-texto">
                    Também realizamos
                    <span className="dourado"> manutenção</span> contínua,
                    <span className="dourado"> suporte</span> dedicado,
                    <span className="dourado"> atualizações</span> de conteúdo, correções e melhorias sempre que necessário. Garantimos que seu site continue moderno e funcional com o passar do tempo.
                </p>

                <p className="oferecemos-texto">
                    Cada site entregue possui garantia de um mês de
                    <span className="dourado"> manutenção</span> completa. Durante esse período você pode solicitar ajustes, correções e suporte sem custo adicional. Também oferecemos
                    <span className="dourado"> atualizações</span> de layout gratuitas com quantidade variando conforme o tipo de site contratado.
                </p>

                <p className="oferecemos-texto">
                    Cuidamos de
                    <span className="dourado"> hospedagem</span>,
                    <span className="dourado"> domínio</span>, configuração de e-mails e otimização para buscas. Você não terá preocupações técnicas.
                </p>

                <p className="oferecemos-texto">
                    Quando precisar crescer estaremos aqui para evoluir seu site, adicionar páginas, criar sistemas e expandir funcionalidades ao longo do tempo.
                </p>

                <p className="oferecemos-destaque">
                    Seu site não é apenas entregue. Ele é acompanhado por
                    <span className="dourado"> profissionais</span> que caminham junto com você.
                </p>
            </div>
        </section>
    );
}
