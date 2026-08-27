import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/universais/Sidebar";
import NovoAgendamentoModal from "../components/usuario-1/agendamentos/NovoagendamentoModal";
 
/**
 * Página 1: "Novo Agendamento", como rota própria (ex: /agendamentos/novo).
 * No protótipo o formulário aparece como modal por cima da página de
 * "Coletas de Hoje" — esse é o comportamento já implementado em
 * ColetasHoje.tsx (botão "+ Novo Agendamento").
 *
 * Este arquivo existe caso vocês também precisem acessar o formulário
 * via URL direta / rota própria. Reaproveita o mesmo componente de modal,
 * então qualquer alteração no formulário é feita em um só lugar. Se não
 * for necessária uma rota própria, esse arquivo pode ser descartado.
 */
export default function NovoAgendamento() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
 
      <main className="mx-auto max-w-7xl px-6 py-8" />
 
 
      <NovoAgendamentoModal
        onClose={() => navigate(-1)}
        onSuccess={() => navigate("/agendamentos/hoje")}
      />
    </div>
  );
}