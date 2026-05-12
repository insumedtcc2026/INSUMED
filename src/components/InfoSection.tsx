import placeholderImg from '../assets/images/coletas.png';

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
      imageUrl: placeholderImg,
      href: '/pontos-de-coleta',
    },
    {
      id: 'insumos',
      title: 'Meus Insumos',
      imageUrl: placeholderImg,
      href: '/meus-insumos',
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      imageUrl: placeholderImg,
      href: '/agendamentos',
    },
  ],
  medico: [
    {
      id: 'pacientes',
      title: 'Pacientes',
      imageUrl: placeholderImg,
      href: '/pacientes',
    },
    {
      id: 'solicitacoes',
      title: 'Solicitações',
      imageUrl: placeholderImg,
      href: '/solicitacoes',
    },
    {
      id: 'agenda',
      title: 'Agenda Médica',
      imageUrl: placeholderImg,
      href: '/agenda',
    },
  ],
  fornecedor: [
    {
      id: 'pedidos',
      title: 'Pedidos',
      imageUrl: placeholderImg,
      href: '/pedidos',
    },
    {
      id: 'estoque',
      title: 'Estoque',
      imageUrl: placeholderImg,
      href: '/estoque',
    },
    {
      id: 'entregas',
      title: 'Entregas',
      imageUrl: placeholderImg,
      href: '/entregas',
    },
  ],
};

export default function InfoSection({ userType }: InfoSectionProps) {
  const cards = cardsByUser[userType];

  return (
    <section className="mt-12">
      <br />
      <br />
      <h2 className="mb-8 text-center text-5xl font-bold text-blue-700">
        INFORMAÇÃO
      </h2>
      <br />
      <br />

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.id}
            href={card.href}
            className="group overflow-hidden rounded-3xl shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <img
              src={card.imageUrl}
              alt={card.title}
              className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}