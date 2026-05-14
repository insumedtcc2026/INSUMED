import { useState } from 'react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

import BannerAbout from "../components/BannerAbout";
import TeamCarousel from '../components/TeamCarousel';
import InfoCards from '../components/Objetivos';
import AboutHistory from '../components/AboutHistory';


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