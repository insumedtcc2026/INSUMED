import Footer from '../components/universais/Footer.tsx';
import { useState } from 'react';
import { useValidarToken } from '../hook/Validartoken.tsx';
import { useDadosAdmin } from '../hook/DadosuserAdm.tsx';
import Sidebaradm from '../components/universais/Siderbaradm.tsx';
import HeaderAdm from '../components/universais/HeaderAdm.tsx';
import FilaTrabalhoAdmin from '../components/universais/FilaTrabalhoAdmin.tsx';

/**
 * Home do administrador: painel da unidade com o que precisa de ação,
 * o que está em acompanhamento, as próximas coletas e os atalhos.
 * (O banner decorativo saiu para as prioridades aparecerem primeiro.)
 */
export default function HomeAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { verificando } = useValidarToken('ADMIN');
  const admin = useDadosAdmin();

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
        <FilaTrabalhoAdmin nome={admin.nome} />
      </main>

      <Footer />
    </div>
  );
}
