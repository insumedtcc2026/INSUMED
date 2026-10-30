import Footer from '../components/universais/Footer.tsx';
import { useState } from 'react';
import Banner from '../components/home-log/Banner.tsx';
import bannerAutorizador from '../assets/home-log/banner-autorizador.webp';
import { useValidarToken } from '../hook/Validartoken.tsx';
import SidebarAut from '../components/universais/SidebarAut.tsx';
import HeaderAut from '../components/universais/HeaderAut.tsx';
import PainelAutorizador from './PainelAutorizador.tsx';

/**
 * Home do autorizador: a fila de prescrições que esperam a decisão dele,
 * as que chegaram com nova versão e as próprias decisões recentes.
 */
export default function HomeAut() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { verificando } = useValidarToken("AUTORIZADOR");

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="home-admin-page home-aut-page min-h-screen bg-slate-50">
      <HeaderAut onMenuClick={toggleSidebar} />

      <SidebarAut isOpen={sidebarOpen} onClose={toggleSidebar} />

      <main className="compensa-header pb-10">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <Banner imageUrl={bannerAutorizador} alt="INSUMED: facilitando a coleta de insumos médicos" className="banner--painel" />
        </div>
        <PainelAutorizador />
      </main>

      <Footer />
    </div>
  );
}
