import { useState, useEffect } from 'react';

import Banner from '../components/home-log/Banner.tsx';

import TutorialSection from '../components/home-log/TutorialSection.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerInsumed from '../assets/home-log/banner-insumed.png';
import   '../css/home/Homepaciente.css'

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const dados = localStorage.getItem("usuario");

    if (dados) {
      setUsuario(JSON.parse(dados));
    }
  }, []);

  return (
    <div className="home-container">
      {/* Card do usuário */}
      {usuario && (
        <div className="card-usuario">
          <div className="icone-usuario">
            <i className="fas fa-user"></i>
          </div>

          <div className="dados-usuario">
            <h3>{usuario.nome}</h3>
            <p>Email: {usuario.email}</p>
          </div>
        </div>
      )}

      

      {/* Coloque Sidebar apenas se você já tiver sidebarOpen e toggleSidebar */}
      {/* <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} /> */}

      <main className="conteudo-home">
        <Banner
          imageUrl={bannerInsumed}
          alt="Banner Insumed"
        />

        
      </main>

      <TutorialSection />

      <Footer />
    </div>
  );
}