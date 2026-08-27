import { useState } from 'react';
import Header from '../components/universais/Header';
import Sidebaradm from '../components/universais/Siderbaradm';
import Footer from '../components/universais/Footer';
import type { Paciente } from '../types/agendamento';
import { buscarPacientesPorCpf } from '../services/PacientesServices';

export default function Pacientes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [cpf, setCpf] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleBuscar = async (valor: string) => {
    setCpf(valor);

    if (!valor.trim()) {
      setPacientes([]);
      return;
    }

    setCarregando(true);

    try {
      const resultado = await buscarPacientesPorCpf(valor);
      setPacientes(resultado);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebaradm
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
      />

      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Pacientes
        </h1>

        <div className="mt-6 max-w-xl">
          <label
            htmlFor="cpf"
            className="block mb-2 font-medium text-gray-700"
          >
            Buscar paciente pelo CPF
          </label>

          <input
            id="cpf"
            type="text"
            value={cpf}
            onChange={(e) => handleBuscar(e.target.value)}
            placeholder="Digite o CPF"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          {carregando && (
            <p className="mt-2 text-gray-500">
              Buscando...
            </p>
          )}

          {pacientes.length > 0 && (
            <div className="mt-4 space-y-3">
              {pacientes.map((paciente) => (
                <div
                  key={paciente.pac_id}
                  className="rounded-xl bg-white p-4 shadow-sm border"
                >
                  <p className="font-semibold text-gray-900">
                    {paciente.pac_nome}
                  </p>

                  <p className="text-gray-600">
                    CPF: {paciente.pac_cpf}
                  </p>

                  <p className="text-gray-600">
                    Telefone: {paciente.pac_telefone}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!carregando &&
            cpf.trim() &&
            pacientes.length === 0 && (
              <p className="mt-4 text-gray-500">
                Nenhum paciente encontrado.
              </p>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}