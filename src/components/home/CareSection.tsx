import React, { useEffect, useRef } from "react";
import "../../css/home/CareSection.css";
 
import calendarIcon from "../../assets/home/calendar.png";
import seloIcon from "../../assets/home/selo.png";
import comunicacaoIcon from "../../assets/home/comunicacao.png";
 
interface CardProps {
  icon: string;
  title: string;
  description: string;
}
 
const cards: CardProps[] = [
  {
    icon: calendarIcon,
    title: "Agendamento",
    description: "Veja as datas de retirada e as últimas coletas em um único sistema digital.",
  },
  {
    icon: seloIcon,
    title: "Gestão de Insumos",
    description: "Controle e a distribuição de insumos médicos de forma mais organizada e eficiente.",
  },
  {
    icon: comunicacaoIcon,
    title: "Comunicação",
    description: "Reduza falhas de comunicação entre pacientes e unidades de saúde.",
  },
];
 
const CareSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !pathRef.current) return;

      const section = sectionRef.current;
      const path = pathRef.current;

      // Pegamos o comprimento total do traçado do SVG dinamicamente
      const pathLength = path.getTotalLength();
      
      // Define o tamanho inicial do traço e do espaço vazio igual ao tamanho da linha
      path.style.strokeDasharray = `${pathLength}`;

      // Calcula onde a seção está na tela em relação ao topo da janela
      const sectionTop = section.getBoundingClientRect().top;
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;

      // Mapeia o progresso do scroll do início ao fim da seção (de 0 a 1)
      let progress = (windowHeight - sectionTop) / (sectionHeight + windowHeight / 2);
      
      // Limitamos o progresso estritamente entre 0 e 1 para a linha não bugar fora da seção
      progress = Math.max(0, Math.min(1, progress));

      // O offset move o "vazio" da linha. Se progress for 1, offset é 0 (linha totalmente desenhada)
      path.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Dispara uma vez no carregamento caso o usuário já caia no meio da página
    handleScroll(); 

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="care-section" ref={sectionRef}>
      <div className="care-section__content">
        <h2 className="care-section__title">
          Nós nos preocupamos <br /> com você
        </h2>
        <p className="care-section__subtitle">
          Controle e a distribuição de insumos médicos de forma mais organizada e eficiente.
        </p>
 
        <div className="care-section__cards-wrapper">
          
          {/* ONDA EM CÓDIGO NATIVO SVG */}
          <svg 
  className="care-section__wave-svg" 
  viewBox="0 0 1440 250" 
  fill="none" 
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  style={{ width: "100vw", overflow: "visible" }} /* Garante expansão infinita para fora da tela */
>
  <defs>
    <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#0066FF" />
      <stop offset="50%" stopColor="#2C67DD" />
      <stop offset="100%" stopColor="#0C299A" />
    </linearGradient>
  </defs>
  <path 
    ref={pathRef}
    /* M-150 e 1590 esticam o desenho bem para fora das laterais do navegador */
    d="M-150,175 Q250,265 520,135 T1080,115 T1590,45" 
    stroke="url(#wave-gradient)" 
    strokeWidth="76" /* Deixa a linha encorpada e grossa como no Figma */
    strokeLinecap="round" /* Mantém o acabamento das pontas arredondado e suave */
    fill="none"
  />
</svg>

          <div className="care-section__cards">
            {cards.map((card, index) => (
              <div className="care-card" key={index}>
                <div className="care-card__icon-wrapper">
                  <img
                    src={card.icon}
                    alt={card.title}
                    className="care-card__icon"
                  />
                </div>
                <h3 className="care-card__title">{card.title}</h3>
                <p className="care-card__description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
 
export default CareSection;