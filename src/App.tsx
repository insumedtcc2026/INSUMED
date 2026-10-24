import { Routes, Route, Navigate } from 'react-router-dom';

import HomeHome from './pages/HomeHome';
import Home from './pages/Home';
import Agendamentos from './pages/Agendamentos';
import PontosColeta from './pages/PontosColeta';
import Perfil from './pages/Perfil';
import Sobre from './pages/Sobre'; 
import Login from './components/home/Login';
import Cadastro from "./components/home/Cadastro"
import CadastroADM from "../src/Administrador/CadastroADM"
import Agendamentosadm from './Administrador/Agendamentosadm';
import HomeAdmin from './Administrador/HomeAdmin';
import  Pacientesadm  from './Administrador/Pacientesadm';
import EnviarSolicitaçao from './pages/EnviarSolicitacao';
import VerSolicitaçoes from './Administrador/VerSolicitaçoes'
import AutorizarPrescricao from './Administrador/AutorizarPrescricao'
import Historicodaprescricao from './Administrador/Historicodaprescricao'
import CadastroAUT from './Autorizador/CadastroAUT';
import HomeAut from './Autorizador/HomeAut';
import VerPrescricoesAprovadas from './Autorizador/VerPrescricoesAprovadas';
import AutorizarPrescricaoAutorizador from './Autorizador/AutorizarPrescricoesAut';
import FluxoInsumo from './Administrador/fluxoinsumo';
import TermosDeUso from './pages/TermosDeUso';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import SegurancaDados from './pages/SegurancaDados';
import ColetasHoje from './Administrador/ColetasHoje';
import AtividadesUnidade from './Administrador/AtividadesUnidade';
import LeitorQRCode from './Administrador/LeitorQRCode';
import AtendimentoAgendamento from './Administrador/AtendimentoAgendamento';
import Prescricoes from './pages/Prescricoes';
import FichaPaciente from './Administrador/FichaPaciente';
import PerfilEquipe from './components/universais/PerfilEquipe';
import Notificacoes from './pages/Notificacoes';
import VerPrescricaoNaoAutorizada from
    "./Administrador/VerPrescricaoNaoAutorizada";
import './index.css';
import Acessibilidade from './components/universais/Acessibilidade';
import NavInferior from './components/universais/NavInferior';
import Equipe from './Administrador/Equipe';
import HorariosUnidade from './Administrador/HorariosUnidade';
import TrocarSenha from './pages/TrocarSenha';

function App() {
  return (
    <>
    {/* pular para o conteúdo, tamanho do texto e alto contraste (todas as páginas) */}
    <Acessibilidade />
    <Routes>
      <Route path="/" element={<HomeHome />} />
      <Route path="/home" element={<Home />} />

      <Route
        path="/agendamentos"
        element={<Agendamentos />}
      />
      <Route
        path="/insumos"
        element={<FluxoInsumo />}
      />

      <Route
        path="/agendamentosadm"
        element={<Agendamentosadm/>}
      />

      <Route
        path="/homeadmin"
        element={<HomeAdmin/>}
      />

         <Route
        path="/novoagendamento"
        element={<Navigate to="/Agendamentosadm?novo=1" replace />}
      />


         <Route
        path="/pacientesadm"
        element={<Pacientesadm/>}
      />

        

      

      <Route
        path="/login"
        element={<Login />}
      />

        <Route
        path="/cadastroadm"
        element={<CadastroADM />}

      />

      <Route
        path="/cadastroaut"
        element={<CadastroAUT />}

      />

      
      <Route
        path="/homeaut"
        element={<HomeAut />}

      />

      
      <Route
        path="/verprescricoesaprovadas"
        element={<VerPrescricoesAprovadas />}

      />

      <Route
        path="/autorizador/solicitacao/:id"
        element={<AutorizarPrescricaoAutorizador />}

      />



         <Route
        path="/enviarsolicitacao"
        element={<EnviarSolicitaçao />}
      />

       <Route
        path="/versolicitaçoes"
        element={<VerSolicitaçoes />}
      />
<Route
    path="/administrador/prescricao/nao-autorizada/:id"
    element={<VerPrescricaoNaoAutorizada />}
/>
      <Route
    path="/administrador/prescricao/:id"
    element={<VerSolicitaçoes />}
/>
 <Route
  path="/administrador/prescricao/autorizarprescricao/:id"
  element={<AutorizarPrescricao />}
/>
      
      <Route
  path="/Historicodaprescricao"
  element={<Historicodaprescricao />}
/>

      <Route
        path="/pontos-coleta"
        element={<PontosColeta />}
      />

      <Route
        path="/perfil"
        element={<Perfil />}
      />

      <Route
        path="/sobre"
        element={<Sobre />}
      />

       <Route
        path="/cadastro"
        element={<Cadastro />}
      />

      {/* Paciente: prescrições com rastreio */}
      <Route path="/prescricoes" element={<Prescricoes />} />

      {/* Admin: balcão, ficha do paciente e perfil */}
      <Route path="/coletas-hoje" element={<ColetasHoje />} />
      <Route path="/atividades" element={<AtividadesUnidade />} />
      {/* Admin: leitor do QR Code do comprovante e o agendamento lido */}
      <Route path="/leitor-qrcode" element={<LeitorQRCode />} />
      <Route path="/leitor-qrcode/agendamento/:id" element={<AtendimentoAgendamento />} />
      <Route path="/pacientesadm/:id" element={<FichaPaciente />} />
      {/* equipe da rede (admin universal) e troca da própria senha */}
      <Route path="/equipe" element={<Equipe />} />
      <Route path="/horarios-unidade" element={<HorariosUnidade />} />
      <Route path="/trocar-senha" element={<TrocarSenha />} />
      <Route path="/perfil-admin" element={<PerfilEquipe tipo="ADMIN" />} />
      <Route path="/perfil-autorizador" element={<PerfilEquipe tipo="AUTORIZADOR" />} />

      {/* Histórico de notificações (sino), um por perfil */}
      <Route path="/notificacoes" element={<Notificacoes perfil="PACIENTE" />} />
      <Route path="/notificacoes-admin" element={<Notificacoes perfil="ADMIN" />} />
      <Route path="/notificacoes-autorizador" element={<Notificacoes perfil="AUTORIZADOR" />} />

      {/* Páginas jurídicas (públicas, linkadas no footer) */}
      <Route path="/termos" element={<TermosDeUso />} />
      <Route path="/privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/seguranca" element={<SegurancaDados />} />
    </Routes>
    {/* barra de navegação do celular (paciente, admin e autorizador) */}
    <NavInferior />
    </>
  );
}

export default App;