import { useState } from 'react';
import Header from '../components/universais/Header';
import Sidebaradm from '../components/universais/Siderbaradm';
import Footer from '../components/universais/Footer';
import AgendamentosListPage from '../components/usuario-1/agendamentos/agendamentosListPage';
import NovoAgendamentoModal from '../components/usuario-1/agendamentos/NovoagendamentoModal';
import { listarAgendamentosDeHoje } from '../services/AgendamentoService';

export default function Agendamentos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />
      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <AgendamentosListPage
          titulo="Coletas de Hoje"
          subtitulo="Lista de pacientes agendados para hoje"
          fetchAgendamentos={listarAgendamentosDeHoje}
          showActions={true}
          mensagemVazio="Nenhuma coleta agendada para hoje."
        />
      </main>

      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-indigo-700"
      >
        <span className="text-lg leading-none">+</span> Novo Agendamento
      </button>

      {modalAberto && (
        <NovoAgendamentoModal
          onClose={() => setModalAberto(false)}
          onSuccess={() => setModalAberto(false)}
        />
      )}

      <Footer />
    </div>
  );
}