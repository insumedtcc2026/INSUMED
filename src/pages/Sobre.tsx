import { useState } from 'react';

import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';

import BannerAbout from "../components/sobre/BannerAbout";
import TeamCarousel from '../components/sobre/TeamCarousel';
import InfoCards from '../components/sobre/Objetivos';
import AboutHistory from '../components/sobre/AboutHistory';
import {useValidarToken} from '../hook/Validartoken.tsx';

export default function Sobre() {
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
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

<>
      <BannerAbout />
    </>

      <main>
        <InfoCards />

        <TeamCarousel />

        <AboutHistory />
      </main>

      <Footer />
    </div>
  );
}