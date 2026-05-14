
import {
  FiPaperclip,
  FiMessageSquare,
  FiPlus,
} from "react-icons/fi";

import "../css/Objetivos.css";

const cards = [
  {
    id: 1,
    icon: <FiPaperclip />,
    title: "Organização e Controle",
    description: "Mais organização na gestão de insumos médicos.",
  },
  {
    id: 2,
    icon: <FiMessageSquare />,
    title: "Comunicação Inteligente",
    description: "Informações rápidas e claras para os pacientes.",
  },
  {
    id: 3,
    icon: <FiPlus />,
    title: "Acessibilidade e Eficiência",
    description: "Atendimento mais ágil, seguro e acessível.",
  },
];

export default function Objetivos() {
  return (
    <section className="objectives-section">
      <div className="objectives-container">
        {cards.map((card) => (
          <div className="objectives-card" key={card.id}>
            <div className="objectives-icon">
              {card.icon}
            </div>

            <h3 className="objectives-title">
              {card.title}
            </h3>

            <p className="objectives-description">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}