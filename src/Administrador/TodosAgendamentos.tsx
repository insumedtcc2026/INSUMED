import { useState } from "react";
import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";
import Footer from "../components/universais/Footer";
import AgendamentosListPage from "../components/usuario-1/agendamentos/agendamentosListPage";
import { listarTodosAgendamentosExcetoHoje } from "../services/AgendamentoService";
 
/**
 * Página 3: "Todos os Agendamentos"
 * Lista agendamentos com status 'agendado', exceto os de hoje,
 * ordenados do mais próximo da data atual pro mais distante.
 */
export default function TodosAgendamentos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      <Header onMenuClick={toggleSidebar} />
 
      <main className="mx-auto max-w-7xl px-6 py-8">
        <AgendamentosListPage
          titulo="Todos os Agendamentos"
          subtitulo="Lista de pacientes agendados para os próximos dias em ordem de mais perto até a data mais distante"
          fetchAgendamentos={listarTodosAgendamentosExcetoHoje}
          showActions={true}
          mensagemVazio="Nenhum outro agendamento encontrado."
        />
      </main>
 
      <Footer />
    </div>
  );
}
 