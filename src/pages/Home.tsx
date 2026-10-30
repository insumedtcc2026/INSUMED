import Banner from '../components/home-log/Banner.tsx';
import TutorialSection from '../components/home-log/TutorialSection.tsx';
import Footer from '../components/universais/Footer.tsx';
import bannerPaciente from '../assets/home-log/banner-paciente.webp';
import   '../css/home/Homepaciente.css'
import { useEffect, useState } from 'react';
import {useValidarToken} from '../hook/Validartoken.tsx';
import Sidebar from '../components/universais/Sidebar.tsx';

import Header from '../components/universais/Header';
import AtalhosPaciente from '../components/usuario-1/home/AtalhosPaciente';
import DicasPaciente from '../components/usuario-1/home/DicasPaciente';
import ResumoPaciente from '../components/usuario-1/home/ResumoPaciente';
import TopoPaciente from '../components/usuario-1/home/TopoPaciente';
import { buscarProximoAgendamento } from '../services/AgendamentoService';
import { buscarMinhasPrescricoes, type MinhaPrescricao } from '../services/PrescricaoService';
import type { Agendamento } from '../types/agendamento';
import { hojeISO } from '../utils/validacoes';
import '../css/home/HomePacienteNova.css';

// dias até a receita de uso contínuo (em andamento) que vence primeiro
function diasAteVencer(prescricoes: MinhaPrescricao[]): number | null {
  const datas = prescricoes
    .filter((p) => p.sol_periodicidade_dias && p.sol_data_vencimento)
    .map((p) => p.sol_data_vencimento!.slice(0, 10))
    .sort();
  if (!datas.length) return null;
  const dia = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  return Math.round((dia(datas[0]) - dia(hojeISO())) / 86400000);
}

export default function Home() {
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const [proximoAgendamento, setProximoAgendamento] = useState<Agendamento | null>(null);
   const [carregandoAgendamento, setCarregandoAgendamento] = useState(true);
   const [prescricoes, setPrescricoes] = useState<MinhaPrescricao[]>([]);
   const [ultimaPrescricao, setUltimaPrescricao] = useState<MinhaPrescricao | null>(null);

   const { verificando } = useValidarToken("PACIENTE");

   useEffect(() => {
     buscarProximoAgendamento()
       .then(setProximoAgendamento)
       .catch(() => setProximoAgendamento(null))
       .finally(() => setCarregandoAgendamento(false));

     // em andamento primeiro; sem nenhuma, a última encerrada
     buscarMinhasPrescricoes("andamento", 1, 10)
       .then(async (r) => {
         setPrescricoes(r.itens);
         if (r.itens.length) return setUltimaPrescricao(r.itens[0]);
         const encerradas = await buscarMinhasPrescricoes("encerradas", 1, 1);
         setUltimaPrescricao(encerradas.itens[0] ?? null);
       })
       .catch(() => undefined);
   }, []);

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }
 
  const toggleSidebar = () => {
  setSidebarOpen((prev) => !prev);
  };

  
  return (
    <div className="pagina-paciente home-pac-pagina">
   <Header onMenuClick={toggleSidebar} />

      {/* Coloque Sidebar apenas se você já tiver sidebarOpen e toggleSidebar */}
       <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} /> 

      <main className="conteudo-home">
        {/* computador: banner; celular: bloco azul junto do header */}
        <Banner
          imageUrl={bannerPaciente}
          alt="INSUMED: facilitando a coleta de insumos médicos"
          className="hp-banner-computador"
        />
        <TopoPaciente agendamento={proximoAgendamento} carregando={carregandoAgendamento} />

        <div className="home-pac">
          <AtalhosPaciente />

          <DicasPaciente diasParaVencer={diasAteVencer(prescricoes)} />

          {!carregandoAgendamento && (
            <ResumoPaciente
              agendamento={proximoAgendamento}
              prescricao={ultimaPrescricao}
              onAtualizar={() => buscarProximoAgendamento().then(setProximoAgendamento).catch(() => setProximoAgendamento(null))}
            />
          )}
        </div>
      </main>

      <TutorialSection />

      <Footer />

    </div>
  );
}