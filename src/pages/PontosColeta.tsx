import { useEffect, useState } from "react";
import Header from '../components/universais/Header';
import iconpng from '../assets/home-log/ubs.png'
import '../css/home/PontosColeta.css'
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
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

// faz com que o icon não fique renderizando toda hora, "Se existir um posto selecionado, use ele. Caso contrário, use a posição do usuário."

function UpdateMapCenter({
  position,
  focoPosto
}: {
  position: [number, number];
  focoPosto: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (focoPosto) {
      map.flyTo(position, 18, {
        animate: true,
        duration: 1.5
      });
    } else {
      map.setView(position, 15);
    }
  }, [position, focoPosto, map]);

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
  const [, setUsuario] = useState<any>(null);

  const navigate = useNavigate();

  // ==============================
  // ESTADO DO SIDEBAR (faltava isso)
  // ==============================
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

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
        } else {
          console.log("Token válido");
        }
      } catch (error) {
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

  const [posicao, setPosicao] = useState<[number, number]>([-22.523, -44.104]);
  const [postoSelecionado, setPostoSelecionado] =
    useState<Posto | null>(null);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [mostrarCep, setMostrarCep] = useState(false);
const [cep, setCep] = useState("");
const [buscandoCep, setBuscandoCep] = useState(false);
const [focoPosto, setFocoPosto] = useState(false);


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


  // função que pede permissão para obter a localização
  useEffect(() => {
  if (!navigator.geolocation) {
    setMostrarCep(true);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setPosicao([
        position.coords.latitude,
        position.coords.longitude,
      ]);

      setMostrarCep(false);
    },
    (error) => {
      console.log("Localização não permitida:", error);

      // Se o usuário recusar a localização,
      // mostramos a opção de informar o CEP.
      setMostrarCep(true);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}, []);


  useEffect(() => {

   // axios.get("https://backend-insumed-lhac.vercel.app/postos")
      axios.get("http://localhost:3344/postos")
      .then((res) => {
 const postosComDistancia = res.data.map((posto: Posto) => ({
        ...posto,
        distancia: calcularDistancia(
          posicao[0],
          posicao[1],
          Number(posto.pos_latitude),
          Number(posto.pos_longitude)
        ),
      }));

      setPostos(postosComDistancia);
    })
    .catch((err) => {
      console.log(err);
    });
}, []);


  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =

      Math.sin(dLat / 2) ** 2 +

      Math.cos(lat1 * Math.PI / 180) *

      Math.cos(lat2 * Math.PI / 180) *

      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

  }


  const abrirRota = (posto: Posto) => {

    const origem =
      `${posicao[0]},${posicao[1]}`;

    const destino =
      `${posto.pos_latitude},${posto.pos_longitude}`;

    window.open(

      `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`

    );

  };
const buscarCep = async () => {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    Swal.fire({
      icon: "warning",
      title: "CEP inválido",
      text: "Digite um CEP com 8 números.",
      confirmButtonColor: "#0C299A",
    });

    return;
  }

  try {
    setBuscandoCep(true);

    // 1️⃣ Busca o endereço através do CEP
    const respostaCep = await axios.get(
      `https://viacep.com.br/ws/${cepLimpo}/json/`
    );

    const endereco = respostaCep.data;

    if (endereco.erro) {
      Swal.fire({
        icon: "error",
        title: "CEP não encontrado",
        text: "Verifique o CEP informado.",
        confirmButtonColor: "#0C299A",
      });

      return;
    }

    // 2️⃣ Monta o endereço para geocodificação
    const enderecoCompleto = [
      endereco.logradouro,
      endereco.bairro,
      endereco.localidade,
      endereco.uf,
      "Brasil",
    ]
      .filter(Boolean)
      .join(", ");

    // 3️⃣ Transforma endereço em latitude/longitude
    const respostaMapa = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: enderecoCompleto,
          format: "json",
          limit: 1,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!respostaMapa.data.length) {
      Swal.fire({
        icon: "error",
        title: "Localização não encontrada",
        text: "Não conseguimos localizar esse CEP no mapa.",
        confirmButtonColor: "#0C299A",
      });

      return;
    }

    const localizacao = respostaMapa.data[0];

    const novaPosicao: [number, number] = [
      Number(localizacao.lat),
      Number(localizacao.lon),
    ];

    // 4️ Atualiza a posição usada pelo mapa
    setPosicao(novaPosicao);

    // 5️ Esconde o formulário depois de encontrar
    setMostrarCep(false);

    Swal.fire({
      icon: "success",
      title: "Localização encontrada!",
      text: `Mostrando os postos próximos ao CEP ${cep}.`,
      confirmButtonColor: "#0C299A",
    });

  } catch (error) {
    console.error("Erro ao buscar CEP:", error);

    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possível consultar o CEP.",
      confirmButtonColor: "#0C299A",
    });

  } finally {
    setBuscandoCep(false);
  }
};


const formatarCep = (valor: string) => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length <= 5) {
    return numeros;
  }

  return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
};
  return (
    <>
      <Header onMenuClick={toggleSidebar} />

      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <div className="pontos-coleta-page">
        {mostrarCep && (
  <div className="cep-container">

    <div className="cep-content">

      <h2>
        Encontre postos próximos de você
      </h2>

      <p>
        Para encontrar os postos mais próximos,
        permita sua localização ou informe seu CEP.
      </p>

      <label htmlFor="cep">
        CEP
      </label>

      <div className="cep-input-container">

        <input
          id="cep"
          type="text"
          placeholder="00000-000"
          value={cep}
          maxLength={9}
          onChange={(e) =>
            setCep(formatarCep(e.target.value))
          }
        />

        <button
          type="button"
          onClick={buscarCep}
          disabled={buscandoCep}
        >
          {buscandoCep ? "Buscando..." : "Buscar"}
        </button>

      </div>

    </div>

  </div>
)}
        <div className="mapa-wrapper" id ='mapa'>
          <MapContainer
            center={posicao}
            zoom={15}
            style={{
              height: "420px",
              width: "100%"
            }}
          >

            
             

              <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

 // attribution='&copy; OpenStreetMap'
            //  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

            //attribution="Tiles © Esri"
            //url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <UpdateMapCenter
  position={
    postoSelecionado
      ? [
          Number(postoSelecionado.pos_latitude),
          Number(postoSelecionado.pos_longitude)
        ]
      : posicao
  }
  focoPosto={focoPosto}
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
        </div>

        <div className="postos-container">

          {postos.map((posto) => (

            <div className="posto-card" key={posto.pos_id}>

              <div className="posto-topo">

                <div className="icone">
                  <i className="fas fa-hospital"></i>
                </div>

                <div className="informacoes">

                  <h3>{posto.pos_nome}</h3>

                  {posto.distancia !== undefined && (
  <p className="distancia">
    📍 Distância: {posto.distancia.toFixed(2)} km
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
                 onClick={() => {
    setPostoSelecionado(posto);
    setFocoPosto(true);

    setTimeout(() => {
      document.getElementById("mapa")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }}
>

                  Ver no mapa

                </button>

                <button
                  onClick={() => abrirRota(posto)}>

                  Ver rota

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      <Footer />

    </>

  );
}