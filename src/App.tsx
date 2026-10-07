import { Routes, Route } from 'react-router-dom';

import HomeHome from './pages/HomeHome';
import Home from './pages/Home';
import Agendamentos from './pages/Agendamentos';
import Insumos from './pages/Insumos';
import PontosColeta from './pages/PontosColeta';
import Perfil from './pages/Perfil';
import Sobre from './pages/Sobre'; 
import Login from './components/home/Login';
import Cadastro from "./components/home/Cadastro"
import CadastroADM from "../src/Administrador/CadastroADM"
import Agendamentosadm from './Administrador/Agendamentosadm';
import HomeAdmin from './Administrador/HomeAdmin';
import NovoAgendamento from './Administrador/NovoAgendamento';
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
import './index.css';

function App() {
  return (
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
        element={<NovoAgendamento/>}
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
        path="/Insumos"
        element={<Insumos />}
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

      {/* Páginas jurídicas (públicas, linkadas no footer) */}
      <Route path="/termos" element={<TermosDeUso />} />
      <Route path="/privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/seguranca" element={<SegurancaDados />} />
    </Routes>
  );
}

export default App;