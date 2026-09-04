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
import  Historicoadm from './Administrador/Historicoadm';
import NovoAgendamento from './Administrador/NovoAgendamento';
import TodosAgendamentos from './Administrador/TodosAgendamentos';
import Sair from './Administrador/Sair';
import  Pacientesadm  from './Administrador/Pacientesadm';
import EnviarSolicitaçao from './pages/EnviarSolicitacao';
import VerSolicitaçoes from './Administrador/VerSolicitaçoes'
import AutorizarPrescricao from './Administrador/AutorizarPrescricao'

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
        path="/agendamentosadm"
        element={<Agendamentosadm/>}
      />
      
        <Route
        path="/historicoadm"
        element={<Historicoadm/>}
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
        path="/Sair"
        element={<Sair/>}
      />

       <Route
        path="/todosagendamentos"
        element={<TodosAgendamentos/>}
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
    </Routes>
  );
}

export default App;