import React, { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import "../../css/home/DuvidasFrequentes.css";
import { useRevelar } from "../../hook/useRevelar";

import telasDispositivos from "../../assets/home/telas-dispositivos.webp";

interface Duvida {
  pergunta: string;
  resposta: React.ReactNode;
}

const DUVIDAS: Duvida[] = [
  {
    pergunta: "Quem pode usar o INSUMED?",
    resposta:
      "Pacientes atendidos pelas unidades de saúde da rede pública que usam o INSUMED e que precisam retirar insumos, como fraldas, curativos e sondas. Basta criar uma conta com seus dados.",
  },
  {
    pergunta: "Como envio minha prescrição?",
    resposta:
      "Depois de entrar na sua conta, abra “Enviar prescrição”, escolha a unidade de saúde e mande uma foto nítida ou o PDF da receita (até 5 MB). Você acompanha cada etapa da análise em “Minhas prescrições”.",
  },
  {
    pergunta: "Como fico sabendo do dia da retirada?",
    resposta:
      "Quando a prescrição é autorizada, a unidade marca o dia e o turno da coleta. Você recebe um aviso no site, vê tudo em “Agendamentos” e ainda pode adicionar a data ao calendário do celular.",
  },
  {
    pergunta: "E se eu não puder ir no dia marcado?",
    resposta:
      "Na página do agendamento, responda “Não vou” ou peça outra data. A unidade recebe o pedido e responde por lá mesmo.",
  },
  {
    pergunta: "Outra pessoa pode retirar por mim?",
    resposta:
      "Pode. A unidade cadastra na sua ficha as pessoas autorizadas a retirar no seu lugar (até 5). Na retirada, ela informa quem veio buscar.",
  },
  {
    pergunta: "O que levo no dia da coleta?",
    resposta:
      "Mostre no balcão o comprovante com QR Code, que fica no seu agendamento. Se a unidade pedir algum documento, o recado aparece junto do agendamento.",
  },
];

/** Dúvidas frequentes da home: uma pergunta aberta por vez, com animação. */
export default function DuvidasFrequentes() {
  const secao = useRef<HTMLElement>(null);
  const [aberta, setAberta] = useState<number | null>(0);
  const base = useId();
  useRevelar(secao);

  return (
    <section className="duvidas" ref={secao} aria-labelledby={`${base}-titulo`}>
      <div className="duvidas__conteudo">
        <div className="duvidas__topo" data-revelar="">
          <h2 id={`${base}-titulo`} className="duvidas__titulo">
            Dúvidas frequentes
          </h2>
          <p className="duvidas__subtitulo">
            O que os pacientes mais perguntam sobre o INSUMED. Não achou sua resposta? Fale com a sua unidade de
            saúde.
          </p>

          {/* telas do site num notebook e num celular */}
          <div className="duvidas__telas">
            <span className="duvidas__circulo" aria-hidden="true" />
            <img
              src={telasDispositivos}
              alt="Telas Minhas prescrições, no notebook, e Enviar prescrição, no celular"
              width={1246}
              height={966}
              loading="lazy"
            />
          </div>
        </div>

        <ul className="duvidas__lista">
          {DUVIDAS.map((d, i) => {
            const aberto = aberta === i;
            return (
              <li
                key={d.pergunta}
                className={`duvida ${aberto ? "duvida--aberta" : ""}`}
                data-revelar=""
                style={{ "--atraso": `${Math.min(i, 5) * 70}ms` } as React.CSSProperties}
              >
                <h3 className="duvida__cabeca">
                  <button
                    type="button"
                    id={`${base}-p${i}`}
                    className="duvida__pergunta"
                    aria-expanded={aberto}
                    aria-controls={`${base}-r${i}`}
                    onClick={() => setAberta(aberto ? null : i)}
                  >
                    <span>{d.pergunta}</span>
                    <ChevronDown className="duvida__seta" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={`${base}-r${i}`}
                  role="region"
                  aria-labelledby={`${base}-p${i}`}
                  className="duvida__resposta"
                  hidden={!aberto}
                >
                  <p>{d.resposta}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
