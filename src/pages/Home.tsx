import { useState } from 'react';
import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar.tsx';
import Banner from '../components/home-log/Banner.tsx';
import InfoSection from '../components/home-log/InfoSection.tsx';
import TutorialSection from '../components/home-log/TutorialSection.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerInsumed from '../assets/home-log/banner-insumed.png';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Exemplo temporário. Depois, esse valor virá do login.
  const userType = 'paciente';

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Banner
          imageUrl={bannerInsumed}
          alt="Banner Insumed"
          className="mb-10"
        />
        <br />
        <br />
        <InfoSection userType={userType} />
      </main>
        <div className="mt-10">
          <TutorialSection />
        </div>
      <Footer />
    </div>
  );
}
