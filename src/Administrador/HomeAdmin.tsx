import Footer from '../components/universais/Footer.tsx';
import { useState } from 'react';
import Banner from '../components/home-log/Banner.tsx';
import bannerAdministrador from '../assets/home-log/banner-administrador.webp';
import { useValidarToken } from '../hook/Validartoken.tsx';
import Sidebaradm from '../components/universais/Siderbaradm.tsx';
import HeaderAdm from '../components/universais/HeaderAdm.tsx';
import FilaTrabalhoAdmin from '../components/universais/FilaTrabalhoAdmin.tsx';

/**
 * Home do administrador: painel da unidade com o que precisa de ação,
 * o que está em acompanhamento, as próximas coletas e os atalhos.
 * O banner no topo é o mesmo padrão das homes do paciente e do autorizador.
 */
export default function HomeAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { verificando } = useValidarToken('ADMIN');

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
    <div className="home-admin-page min-h-screen bg-slate-50">
      <HeaderAdm onMenuClick={toggleSidebar} />

      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />

      <main className="compensa-header pb-10">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <Banner imageUrl={bannerAdministrador} alt="INSUMED: facilitando a coleta de insumos médicos" className="banner--painel" />
        </div>
        <FilaTrabalhoAdmin />
      </main>

      <Footer />
    </div>
  );
}
