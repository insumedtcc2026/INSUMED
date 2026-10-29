import React from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CircleAlert, CircleCheck } from "lucide-react";
import "../../css/home/Banner.css";
// Camadas separadas da arte original do banner (fundo, homem, sinos e
// brilhos), para o texto ser texto de verdade e os sinos e avisos flutuarem.
import fundo1440 from "../../assets/home/hero-fundo-1440.webp";
import fundo2560 from "../../assets/home/hero-fundo-2560.webp";
import homem from "../../assets/home/hero-homem.webp";
import sino1 from "../../assets/home/hero-sino-1.webp";
import sino2 from "../../assets/home/hero-sino-2.webp";
import brilho from "../../assets/home/hero-brilho.webp";

// Avisos de exemplo, iguais aos que o paciente recebe no sino do site
const AVISOS = [
  { Icone: CalendarClock, tom: "agenda", titulo: "Retirada amanhã", texto: "Turno da manhã, na sua unidade de saúde." },
  { Icone: CircleCheck, tom: "sucesso", titulo: "Prescrição autorizada", texto: "Sua coleta já pode ser agendada." },
  { Icone: CircleAlert, tom: "alerta", titulo: "Insumo em falta", texto: "Avisamos antes de você sair de casa." },
] as const;

function Avisos({ classe }: { classe: string }) {
  return (
    <>
      {AVISOS.map(({ Icone, tom, titulo, texto }, i) => (
        <div key={titulo} className={`hero-aviso hero-aviso--${i + 1} ${classe}`}>
          <span className={`hero-aviso__icone hero-aviso__icone--${tom}`}>
            <Icone aria-hidden="true" />
          </span>
          <span className="hero-aviso__texto">
            <strong>{titulo}</strong>
            {texto}
          </span>
        </div>
      ))}
    </>
  );
}

/**
 * Banner da home não logada. O texto fica à esquerda e a ilustração à
 * direita é montada em camadas: os sinos balançam de leve e flutuam, os
 * avisos entram um a um (atrás da pessoa) e os brilhos piscam.
 */
const Banner: React.FC = () => {

  return (
    <section className="bannercontainer hero" aria-labelledby="hero-titulo">
      <div className="hero-palco">
        <img
          className="hero-fundo"
          src={fundo1440}
          srcSet={`${fundo1440} 1440w, ${fundo2560} 2560w`}
          sizes="100vw"
          width={1440}
          height={875}
          alt=""
          draggable={false}
          fetchPriority="high"
        />

        {/* ilustração (computador): mesmas posições da arte original */}
        <div className="hero-arte" aria-hidden="true">
          <img className="hero-camada hero-brilho hero-brilho--1" src={brilho} alt="" draggable={false} />
          <img className="hero-camada hero-brilho hero-brilho--2" src={brilho} alt="" draggable={false} />
          {/* a pessoa fica na frente dos avisos, e os sinos na frente de tudo */}
          <Avisos classe="hero-camada" />
          <img className="hero-camada hero-homem" src={homem} alt="" draggable={false} fetchPriority="high" />
          <img className="hero-camada hero-sino hero-sino--1" src={sino1} alt="" draggable={false} />
          <img className="hero-camada hero-sino hero-sino--2" src={sino2} alt="" draggable={false} />
        </div>

        <div className="hero-texto">
          <h1 id="hero-titulo" className="hero-titulo">
            Ficar sem seus insumos? <span>Nunca mais!</span>
          </h1>
          <p className="hero-descricao">
            Envie sua prescrição pelo site, acompanhe a análise da unidade de saúde e saiba o dia certo de
            retirar seus insumos, com aviso antes de cada coleta.
          </p>
          <div className="hero-acoes">
            <Link to="/cadastro" className="hero-botao hero-botao--cheio">
              Criar minha conta
            </Link>
            <Link to="/login" className="hero-botao hero-botao--contorno">
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* ilustração (celular): homem, sinos e avisos empilhados */}
        <div className="hero-arte-celular" aria-hidden="true">
          <img className="hero-sino hero-sino--1" src={sino1} alt="" draggable={false} />
          <img className="hero-sino hero-sino--2" src={sino2} alt="" draggable={false} />
          <div className="hero-avisos-celular">
            <Avisos classe="" />
          </div>
          <img className="hero-homem" src={homem} alt="" draggable={false} />
        </div>
      </div>
    </section>
  );
};

export default Banner;
