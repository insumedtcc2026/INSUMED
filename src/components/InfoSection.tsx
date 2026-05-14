import '../css/InfoSection.css';

import coletasImg from '../assets/images/coletas.png';
import calendarioImg from '../assets/images/calendario.png';
import notificacaoImg from '../assets/images/notificacao.png';


interface InfoCard {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
}

interface InfoSectionProps {
  userType: 'paciente' | 'medico' | 'fornecedor';
}

const cardsByUser: Record<InfoSectionProps['userType'], InfoCard[]> = {
  paciente: [
    {
      id: 'coletas',
      title: 'Pontos de Coleta',
      imageUrl: coletasImg,
      href: '/pontos-de-coleta',
    },
    {
      id: 'insumos',
      title: 'Meus Insumos',
      imageUrl: calendarioImg,
      href: '/meus-insumos',
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      imageUrl: notificacaoImg,
      href: '/agendamentos',
    },
  ],

  medico: [
    {
      id: 'pacientes',
      title: 'Pacientes',
      imageUrl: calendarioImg,
      href: '/pacientes',
    },
    {
      id: 'solicitacoes',
      title: 'Solicitações',
      imageUrl: calendarioImg,
      href: '/solicitacoes',
    },
    {
      id: 'agenda',
      title: 'Agenda Médica',
      imageUrl: calendarioImg,
      href: '/agenda',
    },
  ],

  fornecedor: [
    {
      id: 'pedidos',
      title: 'Pedidos',
      imageUrl: calendarioImg,
      href: '/pedidos',
    },
    {
      id: 'estoque',
      title: 'Estoque',
      imageUrl: calendarioImg,
      href: '/estoque',
    },
    {
      id: 'entregas',
      title: 'Entregas',
      imageUrl: notificacaoImg,
      href: '/entregas',
    },
  ],
};

export default function InfoSection({
  userType,
}: InfoSectionProps) {
  const cards = cardsByUser[userType];

  return (
    <section className="info-section">
      <div className="info-grid">
        {cards.map((card) => (
          <a
            key={card.id}
            href={card.href}
            className="info-card"
          >
            <img
              src={card.imageUrl}
              alt={card.title}
              className="info-card-image"
            />
          </a>
        ))}
      </div>
    </section>
  );
}