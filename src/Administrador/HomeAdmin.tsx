import Banner from '../components/home-log/Banner.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerInsumed from '../assets/home-log/banner-insumed.png';
import InfoSection from '../components/home-log/InfoSection.tsx';
import '../css/home/Homepaciente.css';
import { useState } from 'react';
import { useValidarToken } from '../hook/Validartoken.tsx';
import Sidebaradm from '../components/universais/Siderbaradm.tsx';
import HeaderAdm from '../components/universais/HeaderAdm.tsx';

/**
 * Home do administrador — equivalente a pages/Home.tsx (paciente), só que
 * com o Header/Sidebar de admin e os cards de atalho voltados pra quem
 * administra o sistema (InfoSection já tinha um conjunto de cards pronto
 * pra userType="administrador", só não existia nenhuma página usando).
 *
 * Esta é a página que "Início" no menu do ADM deve abrir — não a lista de
 * agendamentos.
 */
export default function HomeAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { verificando } = useValidarToken();

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
    <div className="home-admin-page">
      <HeaderAdm onMenuClick={toggleSidebar} />

      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />

      <main className="conteudo-home">
        <Banner imageUrl={bannerInsumed} alt="Banner Insumed" />
      </main>

      <InfoSection userType="administrador" />

      <Footer />
    </div>
  );
}