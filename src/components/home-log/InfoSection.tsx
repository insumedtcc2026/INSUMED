import '../../css/home-log/InfoSection.css';

import coletasImg from '../../assets/home-log/coletas.png';
import calendarioImg from '../../assets/home-log/calendario.png';
import notificacaoImg from '../../assets/home-log/notificacao.png';
import agendamentoAdmImg from '../../assets/home-log/Agendamento.png';
import pacientesAdmImg from '../../assets/home-log/Pacientes.png';
import solicitacoesAdmImg from '../../assets/home-log/Solicitações.png';


interface InfoCard {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
}

interface InfoSectionProps {
  userType: 'paciente' | 'administrador' | 'autorizador';
}

const cardsByUser: Record<InfoSectionProps['userType'], InfoCard[]> = {
  paciente: [
    {
      id: 'coletas',
      title: 'Pontos de Coleta',
      imageUrl: coletasImg,
      href: '/pontos-coleta',
    },
    {
      id: 'insumos',
      title: 'Meus Insumos',
      imageUrl: calendarioImg,
      href: '/insumos',
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      imageUrl: notificacaoImg,
      href: '/agendamentos',
    },
  ],

  administrador: [
    {
      id: 'agendamento',
      title: 'Agendamento',
      imageUrl: agendamentoAdmImg,
      href: '/agendamentosadm',
    },
    {
      id: 'solicitacoes',
      title: 'Solicitações',
      imageUrl: solicitacoesAdmImg,
      href: '/versolicitaçoes',
    },
    {
      id: 'pacientes',
      title: 'Pacientes',
      imageUrl: pacientesAdmImg,
      href: '/pacientesadm',
    },
  ],

  autorizador: [
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