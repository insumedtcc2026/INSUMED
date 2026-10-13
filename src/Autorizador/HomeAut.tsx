import Banner from '../components/home-log/Banner.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerInsumed from '../assets/home-log/banner-insumed.png';
import InfoSection from '../components/home-log/InfoSection.tsx';
import '../css/home/Homepaciente.css';
import { useState } from 'react';
import { useValidarToken } from '../hook/Validartoken.tsx';
import SidebarAut from '../components/universais/SidebarAut.tsx';
import HeaderAut from '../components/universais/HeaderAut.tsx';

/**
 * Home do autorizador: header e menu lateral próprios do perfil e o atalho
 * para a fila de prescrições que aguardam análise.
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
    <div className="home-admin-page home-aut-page">
      <HeaderAut onMenuClick={toggleSidebar} />

      <SidebarAut isOpen={sidebarOpen} onClose={toggleSidebar} />

      <main className="conteudo-home">
        <Banner imageUrl={bannerInsumed} alt="Banner Insumed" />
      </main>

      <InfoSection userType="autorizador" />

      <Footer />
    </div>
  );
}