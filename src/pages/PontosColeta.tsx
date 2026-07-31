import { useEffect, useState } from "react";
import Header from '../components/universais/Header';
import iconpng from'../assets/home-log/ubs.png'
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

const iconPosto = L.icon({
  iconUrl: iconpng,
  iconSize: [50, 50],
  iconAnchor: [21, 42],
  popupAnchor: [0, -40],
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

interface Posto {
  pos_id: number;
  pos_nome: string;
  pos_endereco: string;
  pos_latitude: number;
  pos_longitude: number;
  distancia?: number
}

export default function PontosColeta() {
    // eslint-disable-next-line
  const [ setUsuario] = useState<any>(null);

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
  // eslint-disable-next-line

  const toggleSidebar = () => {
  
  };


const [posicao, setPosicao]= useState <[number, number]> ([ -22.523,  -44.104]);
const [postoSelecionado, setPostoSelecionado] =
useState<Posto | null>(null);
const [postos, setPostos] = useState<Posto[]>([]);


useEffect(() => {
    if (postos.length === 0) return;

    setPostos((postosAnteriores) =>
        postosAnteriores.map((posto) => ({
            ...posto,
            
            distancia: calcularDistancia(
              
                posicao[0],
                posicao[1],
                Number(posto.pos_latitude),
                Number(posto.pos_longitude)
            ),
        }))
    );
}, [posicao]);


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


  useEffect(() => {

    //axios.get("https://backend-insumed-lhac.vercel.app/postos")
    axios.get("http://localhost:3344/postos")
        .then((res) => {

          

          setPostos(res.data);

        })
        .catch((err) => {

            console.log(err);

        });

}, []);


function calcularDistancia(
    lat1:number,
    lon1:number,
    lat2:number,
    lon2:number
){

    const R = 6371;

    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;

    const a =

        Math.sin(dLat/2) **2 +

        Math.cos(lat1*Math.PI/180) *

        Math.cos(lat2*Math.PI/180) *

        Math.sin(dLon/2) **2;

    const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

    return R*c;

}

useEffect(() => {

    if(postos.length===0)
        return;

    let menor = Infinity;

    let escolhido: Posto | null = null;

    postos.forEach((posto)=>{

        const distancia = calcularDistancia(

            posicao[0],
            posicao[1],

            posto.pos_latitude,
            posto.pos_longitude

        );

        if(distancia<menor){

            menor=distancia;

            escolhido={
              ...posto,
    distancia
            };

        }

    });

   

},[postos,posicao]);

const abrirRota = (posto: Posto) => {

    const origem =
        `${posicao[0]},${posicao[1]}`;

    const destino =
        `${posto.pos_latitude},${posto.pos_longitude}`;

    window.open(

`https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`

    );

};

  return (
    <>
    
     

      <Header onMenuClick={toggleSidebar} />
      

      <MapContainer
                  center={posicao}
                  zoom={15}
                  style={{
                      height: "420px",
                      width: "100%",
                       borderRadius:"25px"
                  }}
              >
      
                  <TileLayer
                      attribution='&copy; OpenStreetMap'
                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

                  //attribution="Tiles © Esri"
                   //url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />
                   <UpdateMapCenter   position={
        postoSelecionado
            ? [
                postoSelecionado.pos_latitude,
                postoSelecionado.pos_longitude
              ]
            : posicao
    }
/>
                    
                 {postos.map((posto) => (
                  
  <Marker
    key={posto.pos_id}
   position={[
    posto.pos_latitude,
    posto.pos_longitude

    
]}

 

 icon={iconPosto}

  />

  

  
))}

<Marker
    position={posicao}
    icon={icon}
/>
                
              </MapContainer>
              
            
   
   
    

     <div className="postos-container">

  {postos.map((posto) => (

    <div className="posto-card" key={posto.pos_id}>

      <div className="posto-topo">

        <div className="icone">
          <i className="fas fa-hospital"></i>
        </div>

        <div className="informacoes">

          <h3>{posto.pos_nome}</h3>

          <p>{posto.pos_endereco}</p>
          {postoSelecionado?.pos_id === posto.pos_id && (
    <p className="distancia">
        📍 Distância: {posto.distancia?.toFixed(2)} km
    </p>
)}

          <div className="tags">
            <span>Privado</span>
            <span>Municipal</span>
          </div>

        </div>

      </div>

      <div className="acoes">

       <button
            onClick={() => setPostoSelecionado(posto)}
>

      Ver no mapa

     </button>

       <button
         onClick={()=> abrirRota(posto)}>

        Ver rota

        </button>

      </div>

    </div>

  ))}

</div>


      <Footer />
        
          
          
          
</>
          
);
}

