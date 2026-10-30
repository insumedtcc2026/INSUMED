import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Accessibility,
  ArrowUpRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  PackageOpen,
  QrCode,
  Users,
  X,
} from "lucide-react";

type Cor = "azul" | "branco" | "escuro";

interface Dica {
  id: string;
  titulo: string;
  subtitulo: string;
  texto: string;
  Icone: React.ComponentType<{ "aria-hidden"?: boolean }>;
  // ação do painel; sem ela o botão só fecha ("Entendi")
  acao?: { texto: string; para: string };
  selo?: string;
}

// azul, branco e azul-escuro se revezam no carrossel
const CORES: Cor[] = ["azul", "branco", "escuro"];

function textoVencimento(dias: number) {
  if (dias <= 0) return "vence hoje";
  if (dias === 1) return "vence amanhã";
  return `vence em ${dias} dias`;
}

function montarDicas(diasParaVencer: number | null): Dica[] {
  const vencendo = diasParaVencer !== null && diasParaVencer <= 30;
  return [
    {
      id: "receita",
      titulo: vencendo ? "Sua receita" : "Validade da",
      subtitulo: vencendo ? textoVencimento(diasParaVencer!) : "sua receita",
      selo: vencendo ? "Atenção" : undefined,
      texto:
        "Enquanto sua prescrição de uso contínuo estiver válida, as próximas retiradas são agendadas sozinhas. Quando ela vence, os agendamentos param. Peça uma receita nova ao seu médico antes do vencimento e envie pelo site, assim você não fica sem seus insumos.",
      Icone: Hourglass,
      acao: { texto: "Enviar nova prescrição", para: "/enviarsolicitacao" },
    },
    {
      id: "prioridade",
      titulo: "Atendimento",
      subtitulo: "prioritário",
      texto:
        "Pessoas com deficiência e gestantes têm direito a atendimento prioritário por lei. Marque essa informação no seu Perfil. A unidade confirma no balcão no dia da retirada.",
      Icone: Accessibility,
      acao: { texto: "Ir para o meu perfil", para: "/perfil" },
    },
    {
      id: "avisos",
      titulo: "Não perca",
      subtitulo: "nenhum aviso",
      texto:
        "Os avisos de coleta, de insumo em falta e de mudança de data chegam pelos seus dados de contato. Confira se o seu telefone e o seu e-mail estão certos no Perfil.",
      Icone: BellRing,
      acao: { texto: "Conferir meus dados", para: "/perfil" },
    },
    {
      id: "dia-coleta",
      titulo: "No dia",
      subtitulo: "da coleta",
      texto:
        "Chegue no turno marcado e mostre no balcão o comprovante com QR Code, que fica no seu agendamento. Se a unidade pedir algum documento, o recado aparece junto do agendamento.",
      Icone: QrCode,
      acao: { texto: "Ver meus agendamentos", para: "/agendamentos" },
    },
    {
      id: "autorizados",
      titulo: "Alguém pode",
      subtitulo: "buscar por você",
      texto:
        "Se você não puder ir, uma pessoa autorizada pode retirar no seu lugar. A unidade cadastra na sua ficha até 5 pessoas autorizadas. Na retirada, ela informa quem veio buscar.",
      Icone: Users,
    },
    {
      id: "cuidados",
      titulo: "Cuide dos",
      subtitulo: "seus insumos",
      texto:
        "Guarde os insumos em lugar seco, fresco e longe do sol. Confira a validade na embalagem e só abra o pacote na hora de usar. Se algum produto vier danificado, avise a sua unidade de saúde.",
      Icone: PackageOpen,
    },
  ];
}

/**
 * Carrossel "Dicas para você" da home do paciente: orientações curtas
 * (não são atalhos). "Saiba mais" abre um painel com o texto completo.
 * O card da receita muda quando a receita de uso contínuo está para vencer.
 */
export default function DicasPaciente({ diasParaVencer }: { diasParaVencer: number | null }) {
  const dicas = montarDicas(diasParaVencer);
  const trilho = useRef<HTMLUListElement>(null);
  const [atual, setAtual] = useState(0);
  const [aberta, setAberta] = useState<Dica | null>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const origem = useRef<HTMLElement | null>(null);

  // bolinha ativa acompanha a rolagem do carrossel
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const aoRolar = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const passo = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
      setAtual(Math.min(dicas.length - 1, Math.round(el.scrollLeft / passo)));
    };
    el.addEventListener("scroll", aoRolar, { passive: true });
    return () => el.removeEventListener("scroll", aoRolar);
  }, [dicas.length]);

  // painel: Esc fecha e o foco volta para o botão que abriu
  useEffect(() => {
    if (!aberta) return;
    fechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(null);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      origem.current?.focus();
    };
  }, [aberta]);

  function irPara(indice: number) {
    const el = trilho.current;
    const card = el?.children[indice] as HTMLElement | undefined;
    if (!el || !card) return;
    const primeiro = el.firstElementChild as HTMLElement;
    el.scrollTo({ left: card.offsetLeft - primeiro.offsetLeft, behavior: "smooth" });
  }

  return (
    <section className="hp-secao" aria-labelledby="hp-dicas-titulo">
      <div className="hp-dicas__topo">
        <h2 id="hp-dicas-titulo" className="hp-titulo">Dicas para você</h2>
        <div className="hp-dicas__setas">
          <button type="button" onClick={() => irPara(Math.max(0, atual - 1))} disabled={atual === 0} aria-label="Dica anterior">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => irPara(Math.min(dicas.length - 1, atual + 1))}
            disabled={atual === dicas.length - 1}
            aria-label="Próxima dica"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul className="hp-dicas" ref={trilho}>
        {dicas.map((d, i) => {
          const { Icone } = d;
          return (
            <li key={d.id} className={`hp-dica hp-dica--${CORES[i % CORES.length]}`}>
              {d.selo && <span className="hp-dica__selo">{d.selo}</span>}
              <h3 className="hp-dica__titulo">
                {d.titulo} <span>{d.subtitulo}</span>
              </h3>
              <button
                type="button"
                className="hp-dica__mais"
                onClick={(e) => {
                  origem.current = e.currentTarget;
                  setAberta(d);
                }}
                aria-label={`Saiba mais: ${d.titulo} ${d.subtitulo}`}
              >
                <span className="hp-dica__seta">
                  <ArrowUpRight aria-hidden="true" />
                </span>
                Saiba mais
              </button>
              <span className="hp-dica__objeto" aria-hidden="true">
                <Icone aria-hidden />
              </span>
            </li>
          );
        })}
      </ul>

      <div className="hp-dicas__pontos" aria-hidden="true">
        {dicas.map((d, i) => (
          <span key={d.id} className={i === atual ? "ativo" : ""} />
        ))}
      </div>

      {aberta && (
        <div className="hp-painel-fundo" onClick={() => setAberta(null)}>
          <div
            className="hp-painel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hp-painel-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" ref={fechar} className="hp-painel__fechar" onClick={() => setAberta(null)} aria-label="Fechar">
              <X aria-hidden="true" />
            </button>
            <span className="hp-painel__icone" aria-hidden="true">
              <aberta.Icone aria-hidden />
            </span>
            <h3 id="hp-painel-titulo" className="hp-painel__titulo">
              {aberta.titulo} {aberta.subtitulo}
            </h3>
            <p className="hp-painel__texto">{aberta.texto}</p>
            {aberta.acao ? (
              <Link to={aberta.acao.para} className="hp-botao hp-botao--cheio">
                {aberta.acao.texto}
              </Link>
            ) : (
              <button type="button" className="hp-botao hp-botao--cheio" onClick={() => setAberta(null)}>
                Entendi
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
