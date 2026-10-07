import { useState } from 'react';
import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import BotaoVoltar from '../components/universais/BotaoVoltar';
import NavInferiorPaciente from '../components/universais/NavInferiorPaciente';
import Insumo from '../components/Insumos/Insumo';

export default function Insumos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/home" />
      </div>

      <main className="pagina-conteudo mx-auto max-w-7xl px-6 py-8">
        <Insumo />
      </main>

      <Footer />

      <NavInferiorPaciente />
    </div>
  );
}