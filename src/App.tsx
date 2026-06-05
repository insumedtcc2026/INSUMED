import { Routes, Route } from 'react-router-dom';

import HomeHome from './pages/HomeHome';
import Home from './pages/Home';
import Agendamentos from './pages/Agendamentos';
import Insumos from './pages/Insumos';
import PontosColeta from './pages/PontosColeta';
import Perfil from './pages/Perfil';
import Sobre from './pages/Sobre'; 

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
    </Routes>
  );
}

export default App;