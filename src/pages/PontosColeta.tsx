import { useEffect, useState } from "react";
import Header from '../components/universais/Header';

import '../css/home/PontosColeta.css'
import Footer from '../components/universais/Footer';

import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
//importa o icon
import L from "leaflet"
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// Corrigindo o ícone padrão do Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


function UpdateMapCenter({ position }: { position: [number, number] }) {
//faz com que o icon não fique renderizando toda hora, "Se existir um posto selecionado, use ele. Caso contrário, use a posição do usuário."
    const map = useMap();

    useEffect(() => {
        map.setView(position, 15, {
            animate: true
        });
    }, [position, map]);

    return null;
}

const postos = [
  {
    id: 1,
    nome: "UBSF Conforto",
    endereco: "Av. Nossa Senhora da Conceição, 359 – Conforto",
    latitude: -22.5235,
    longitude: -44.1040,
  },
  {
    id: 2,
    nome: "Posto de Saúde Volta Grande",
    endereco: "Rua Sargento Paulo Moreira, 200 – Volta Grande",
    latitude: -22.5038,
    longitude: -44.0867,
  },
  {
    id: 3,
    nome: "UBSF São João Eber Gomes",
    endereco: "Rua Araribóia, 332 – São João",
    latitude: -22.5310,
    longitude: -44.0894,
  },
];


export default function PontosColeta() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };


const [posicao, setPosicao]= useState <[number, number]> ([ -22.523,  -44.104]);
const [postoSelecionado, setPostoSelecionado] = useState<[number, number] | null>(null);
//funçao que pede permissão para obter a localização
useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosicao([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.log(error);
        alert("Não foi possível obter sua localização.");
      }
    );
  }, []);

  return (
    <>
    
     

      <Header onMenuClick={toggleSidebar} />
      

      <MapContainer
                  center={posicao}
                  zoom={15}
                  style={{
                      height: "500px",
                      width: "100%"
                  }}
              >
      
                  <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                   <UpdateMapCenter  position={postoSelecionado ?? posicao} />
                    
                 {postos.map((posto) => (
  <Marker
    key={posto.id}
    position={[posto.latitude, posto.longitude]}
    icon={icon}
  />
))}
                
              </MapContainer>

     <div className="postos-container">

  {postos.map((posto) => (

    <div className="posto-card" key={posto.id}>

      <div className="posto-topo">

        <div className="icone">
          <i className="fas fa-hospital"></i>
        </div>

        <div className="informacoes">

          <h3>{posto.nome}</h3>

          <p>{posto.endereco}</p>

          <div className="tags">
            <span>Privado</span>
            <span>Municipal</span>
          </div>

        </div>

      </div>

      <div className="acoes">

        <button>
          <i className="fas fa-chevron-right"></i>
          Detalhes
        </button>

        <button   onClick={() =>
        setPostoSelecionado([
            posto.latitude,
            posto.longitude
        ])
    }>
          
          <i className="fas fa-chevron-right"></i>
          
          Ver no mapa
        </button>

      </div>

    </div>

  ))}

</div>


      <Footer />
    </>
       );
}