import Banner from '../components/home-log/Banner.tsx';
import TutorialSection from '../components/home-log/TutorialSection.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerInsumed from '../assets/home-log/banner-insumed.png';
import  InfoSection from '../components/home-log/InfoSection.tsx';
import   '../css/home/Homepaciente.css'
import {useValidarToken} from '../hook/Validartoken.tsx';

import Header from '../components/universais/Header';

export default function Home() {
   
   const { verificando } = useValidarToken();

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }
 
  const toggleSidebar = () => {
  
  };

  
  return (
    <>
   <Header onMenuClick={toggleSidebar} />
      

      

      {/* Coloque Sidebar apenas se você já tiver sidebarOpen e toggleSidebar */}
      {/* <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} /> */}

      <main className="conteudo-home">
        <Banner
          imageUrl={bannerInsumed}
          alt="Banner Insumed"
        />

        
      </main>
    
      
      <InfoSection userType="paciente" />
      
      <TutorialSection />

      <Footer />
    </>
  );
}