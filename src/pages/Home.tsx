import { useState, useEffect } from 'react';
import Banner from '../components/home-log/Banner.tsx';
import TutorialSection from '../components/home-log/TutorialSection.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerInsumed from '../assets/home-log/banner-insumed.png';
import   '../css/home/Homepaciente.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null);

  const navigate = useNavigate();
  
  useEffect(() => {
    
    
    const validarToken = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) navigate("/login");
      
      try {
        const response = await axios.get("https://backend-insumed-lhac.vercel.app/validar", {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        if (response.status === 403) {
          navigate("/login");
          return Swal.fire({
            icon: 'error',
            title: 'Ops...',
            text: 'Por favor, faça login novamente.',
            confirmButtonColor: '#d33'
          });
        }else {
          console.log("Token válido");
        }
      }catch (error) {
        alert("Token inválido. Por favor, faça login novamente.");
        navigate("/login");
        console.error("Erro ao validar token:", error);
      }
      
      if (dados) {
        setUsuario(JSON.parse(dados));
      }
    };
    
    validarToken();
  }, []);

  const dados = localStorage.getItem("usuario");
  
  return (
    <div className="home-container">
      {/* Card do usuário */}
      {usuario && (
        <div className="card-usuario">
          <div className="icone-usuario">
            <i className="fas fa-user"></i>
          </div>

          <div className="dados-usuario">
            <h3>{usuario.pac_nome}</h3>
            <p>Email: {usuario.pac_email}</p>
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