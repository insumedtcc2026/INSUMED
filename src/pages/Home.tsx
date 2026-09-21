import Banner from '../components/home-log/Banner.tsx';
import TutorialSection from '../components/home-log/TutorialSection.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerInsumed from '../assets/home-log/banner-insumed.png';
import  InfoSection from '../components/home-log/InfoSection.tsx';
import   '../css/home/Homepaciente.css'
import { useEffect, useState } from 'react';
import {useValidarToken} from '../hook/Validartoken.tsx';
import Sidebar from '../components/universais/Sidebar.tsx';

import Header from '../components/universais/Header';
import AgendamentoCardPaciente from '../components/usuario-1/agendamentos/Agendamentocardpaciente';
import { buscarProximoAgendamento } from '../services/AgendamentoService';
import type { Agendamento } from '../types/agendamento';

export default function Home() {
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const [proximoAgendamento, setProximoAgendamento] = useState<Agendamento | null>(null);
   const [carregandoAgendamento, setCarregandoAgendamento] = useState(true);

   const { verificando } = useValidarToken();

   useEffect(() => {
     buscarProximoAgendamento()
       .then(setProximoAgendamento)
       .catch(() => setProximoAgendamento(null))
       .finally(() => setCarregandoAgendamento(false));
   }, []);

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
    <>
   <Header onMenuClick={toggleSidebar} />

      {/* Coloque Sidebar apenas se você já tiver sidebarOpen e toggleSidebar */}
       <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} /> 

      <main className="conteudo-home">
        <Banner
          imageUrl={bannerInsumed}
          alt="Banner Insumed"
        />
      </main>
    
      
      <InfoSection userType="paciente" />

      {/* Próximo agendamento, logo abaixo dos cards de atalho */}
      {!carregandoAgendamento && proximoAgendamento && (
        <section className="mx-auto max-w-2xl px-6 py-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Seu próximo agendamento
          </h2>
          <AgendamentoCardPaciente agendamento={proximoAgendamento} />
        </section>
      )}

      <TutorialSection />

      <Footer />
    </>
  );
}