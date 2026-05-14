
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

export default function InfoCards() {
  return (
    <section className="info-section">
      <div className="info-container">
        {cards.map((card) => (
          <div className="info-card" key={card.id}>
            <div className="info-icon">{card.icon}</div>

            <h3>{card.title}</h3>

            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}