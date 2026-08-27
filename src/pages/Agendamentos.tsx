import { useState } from 'react';
import Header from '../components/universais/Header';
import Sidebaradm from '../components/universais/Siderbaradm.tsx';
import Footer from '../components/universais/Footer';
import construcaoImage from '../assets/construcacao.png';
import {useValidarToken} from '../hook/Validartoken.tsx';


export default function Agendamentos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
   const { verificando } = useValidarToken();
    
      if (verificando) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-xl text-gray-600">Carregando seus dados...</p>
          </div>
        );
      }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900">Agendamentos</h1>
        <p className="mt-4 text-gray-600">
          Aqui você poderá ver seus agendamentos (ainda em construção).
          <img src={construcaoImage} alt="Construção" width={350} />
        </p>
      </main>

      <Footer />
    </div>
  );
}
