import { useState} from 'react';
import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import '../css/home/perfil.css';
import { useDadosUser } from '../hook/Dadosuser.tsx';
import {useValidarToken} from '../hook/Validartoken.tsx';
import { usePrescricao } from '../hook/Pacienteprescriao.tsx';
import Swal from 'sweetalert2';

export default function Perfil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const { verificando } = useValidarToken();
  const user = useDadosUser();
  const { prescricoes, carregando, erro } = usePrescricao();
  

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  if (carregando) {
    return (
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
    );
  }
  if (erro){
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: erro
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="titulo-secao">Meu Perfil</h1>
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
        <h1 className="titulo-secao">Prescrições</h1>
      </main>
      {carregando ? (
        <p className="text-xl text-gray-600">Carregando prescrições...</p>
      ) : erro ? (
        <p className="text-xl text-gray-3200">Erro ao carregar prescrições.</p>
      ) : (
        <div className="prescricao-list">
  {prescricoes.length === 0 ? (
    <p className="text-xl text-gray-600">'{user.nome}' não tem prescrições.</p> 
  ) : (
    prescricoes.map((prescricao) => {
      const statusClass = prescricao.sol_status.toLowerCase().replace(" ", "-");

      return (
        <div className="prescricao-card" key={prescricao.sol_id}>
          <p className="prescricao-data">
            <strong>Data:</strong> {new Date(prescricao.sol_data_solicitacao).toLocaleDateString('pt-BR')}
          </p>
          <div className="prescricao-arquivo">
            {prescricao.sol_prescricao ? 'Arquivo_prescricao.png' : 'Nenhum arquivo anexado'}
          </div>

          <div className="prescricao-acoes">
            <span className={`status-badge status-${statusClass}`}>
              {prescricao.sol_status}
            </span>
            
            <a 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-ver-mais"
            >
              Ver mais <span>&#8963;</span>
            </a>
          </div>
        </div>
      );
    })
  )}
</div>
      )}
</div>
      <Footer />
    </div>
  );
}