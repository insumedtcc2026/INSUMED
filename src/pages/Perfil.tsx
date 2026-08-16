import { useState} from 'react';
import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import '../css/home/perfil.css';
import { useDadosUser } from '../hook/Dadosuser.tsx';
import {useValidarToken} from '../hook/Validartoken.tsx';

export default function Perfil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const { verificando } = useValidarToken();
  const user = useDadosUser();

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900">Meu Perfil</h1>
      </main>

      <div className="perfil-container-form">
       <label >
      <p>Nome Completo</p>
        <input
        type="text"
        value={user.nome}
        />
       </label>
              <label >
      <p>CPF</p>
        <input
        type="text"
        value={user.cpf}
        />
       </label>

        <label >
      <p>CEP</p>
        <input
        type="text"
        value={user.cep}
        />
       </label>

      <label >
      <p>Data de Nascimento</p>
        <input
        type="text"
        value={user.data_nascimento}
        />
       </label>

      <label >
      <p>Endereço de Email</p>
        <input
        type="text"
        value={user.email}
        />
       </label>

      <label >
      <p>Endereço</p>
        <input
        type="text"
        value={user.endereco}
        />
       </label>

              <label >
      <p>Telefone</p>
        <input
        type="text"
        value={user.telefone}
        />
       </label>

    <label >
      <p>Raça/Cor</p>
        <input
        type="text"
        value={user.raca}
        />
       </label>
      </div>

      <div className="prescrição-container">
        <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900">Prescrições</h1>
      </main>

      </div>


      <Footer />
    </div>
  );
}