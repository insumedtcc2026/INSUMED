import { useState } from 'react';

import Header from '../components/home/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';

import BannerAbout from "../components/sobre/BannerAbout";
import TeamCarousel from '../components/sobre/TeamCarousel';
import InfoCards from '../components/sobre/Objetivos';
import AboutHistory from '../components/sobre/AboutHistory';


export default function Sobre() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

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