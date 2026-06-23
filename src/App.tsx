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
        path="/login"
        element={<Login />}
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