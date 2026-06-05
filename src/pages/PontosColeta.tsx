import { useState } from 'react';
import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import construcaoImage from '../assets/construcacao.png';

export default function PontosColeta() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900">Pontos de Coleta</h1>
        <p className="mt-4 text-gray-600">
          Aqui você poderá ver os pontos de coleta (ainda em construção).
                <img src={construcaoImage} alt="Construção" width={350} />

        </p>
      </main>

      <Footer />
    </div>
  );
}