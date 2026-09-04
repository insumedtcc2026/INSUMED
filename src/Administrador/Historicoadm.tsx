import { useState } from "react";
import Header from "../components/universais/Header";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import AgendamentosListPage from "../components/usuario-1/agendamentos/agendamentosListPage";
import { listarHistorico } from "../services/AgendamentoService";
 
/**
 * Página 4: "Histórico de Coletas"
 * Lista agendamentos com status 'concluido'.
 * showActions=false: o AgendamentoCard não renderiza os botões
 * Concluir/Cancelar (e nunca renderizaria mesmo que fosse true,
 * pois eles só aparecem quando status === 'agendado').
 */
export default function HistoricoColetas() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />
      <Header onMenuClick={toggleSidebar} />
 
      <main className="mx-auto max-w-7xl px-6 py-8">
        <AgendamentosListPage
          titulo="Histórico de Coletas"
          subtitulo="Lista de pacientes concluídos"
          fetchAgendamentos={listarHistorico}
          showActions={false}
          mensagemVazio="Nenhuma coleta concluída ainda."
        />
      </main>
 
      <Footer />
    </div>
  );
}
 