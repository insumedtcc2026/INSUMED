import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/universais/HeaderAdm';
import Sidebaradm from '../components/universais/Siderbaradm';
import Footer from '../components/universais/Footer';
import type { Paciente } from '../types/agendamento';
import { buscarPacientesPorCpf } from '../services/PacientesServices';
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { useValidarToken } from '../hook/Validartoken';
import { exibirCPF, exibirTelefone, mascaraCPF } from "../utils/validacoes";

// Só dígitos/pontuação = CPF (aplica a máscara); com letras = nome.
const pareceCPF = (valor: string) => !/[A-Za-zÀ-ÿ]/.test(valor);

// Busca só a partir de 3 dígitos de CPF ou 2 letras de nome.
const termoCurto = (valor: string) => {
  const v = valor.trim();
  return pareceCPF(v) ? v.replace(/\D/g, '').length < 3 : v.length < 2;
};

export default function Pacientes() {
  const { verificando } = useValidarToken('ADMIN');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [termo, setTermo] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  function alterarTermo(valor: string) {
    const novo = pareceCPF(valor) ? mascaraCPF(valor) : valor;
    setTermo(novo);
    if (termoCurto(novo)) {
      setPacientes([]);
      setBuscou(false);
    }
  }

  useEffect(() => {
    clearTimeout(debounce.current);
    const valor = termo.trim();
    if (termoCurto(valor)) return;

    debounce.current = setTimeout(async () => {
      setCarregando(true);
      try {
        setPacientes(await buscarPacientesPorCpf(valor));
      } finally {
        setCarregando(false);
        setBuscou(true);
      }
    }, 300);

    return () => clearTimeout(debounce.current);
  }, [termo]);

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebaradm
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
      />

      <Header onMenuClick={toggleSidebar} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Pacientes
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Busque pelo nome ou CPF e abra a ficha com dados, prescrições e agendamentos.
        </p>

        <div className="mt-6">
          <label
            htmlFor="busca-paciente"
            className="mb-2 block font-medium text-gray-700"
          >
            Nome ou CPF
          </label>

          <input
            id="busca-paciente"
            type="search"
            value={termo}
            onChange={(e) => alterarTermo(e.target.value)}
            placeholder="Ex.: Maria Souza ou 000.000.000-00"
            autoComplete="off"
            autoFocus
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-blue-500"
          />

          {carregando && (
            <p className="mt-3 text-gray-500" role="status">
              Buscando...
            </p>
          )}

          {pacientes.length > 0 && (
            <ul className="mt-4 space-y-3">
              {pacientes.map((paciente) => (
                <li key={paciente.pac_id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/pacientesadm/${paciente.pac_id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <span className="min-w-0">
                      <span className="block break-words font-semibold text-gray-900">
                        {paciente.pac_nome}
                      </span>
                      <span className="block text-sm text-gray-600">
                        CPF: {exibirCPF(paciente.pac_cpf)}
                      </span>
                      <span className="block text-sm text-gray-600">
                        Telefone: {exibirTelefone(paciente.pac_telefone)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-blue-700">
                      Ver ficha →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!carregando && buscou && pacientes.length === 0 && (
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
