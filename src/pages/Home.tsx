import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Banner from '../components/Banner';
import InfoSection from '../components/InfoSection.tsx';
import TutorialSection from '../components/TutorialSection.tsx';
import Footer from '../components/Footer';
import bannerInsumed from '../assets/banners/banner-insumed.png';

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

        <InfoSection userType={userType} />

        <div className="mt-10">
          <TutorialSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
