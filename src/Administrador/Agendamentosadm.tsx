import { useCallback, useEffect, useState } from "react";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import AgendamentoCard from "../components/usuario-1/agendamentos/AgendamentoCard";
import NovoAgendamentoModal from "../components/usuario-1/agendamentos/NovoagendamentoModal";
import {
  listarAgendamentos,
  concluirAgendamento,
  cancelarAgendamento,
} from "../services/AgendamentoService";
import type { Agendamento, StatusAgendamento } from "../types/agendamento";

type FiltroStatus = "todos" | StatusAgendamento;

/**
 * Página única de "Agendamentos" do ADM — substitui as antigas "Coletas
 * de Hoje", "Todos os Agendamentos" e "Histórico". O status, a busca
 * (nome/CPF/protocolo) e o intervalo de datas ficam todos na mesma tela,
 * no mesmo padrão de filtro/busca da página de Histórico da Prescrição.
 */
export default function Agendamentosadm() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatus>("agendado");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarAgendamentos({
        status: statusFiltro,
        busca,
        dataInicio,
        dataFim,
      });
      setAgendamentos(dados);
    } catch {
      setErro("Não foi possível carregar os agendamentos.");
    } finally {
      setCarregando(false);
    }
  }, [statusFiltro, busca, dataInicio, dataFim]);

  useEffect(() => {
    // Pequeno debounce pra busca/data não disparar uma chamada a cada tecla
    const t = setTimeout(carregar, 300);
    return () => clearTimeout(t);
  }, [carregar]);

  async function handleConcluir(sol_id: number) {
    await concluirAgendamento(sol_id);
    carregar();
  }

  async function handleCancelar(sol_id: number) {
    await cancelarAgendamento(sol_id);
    carregar();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />
      <HeaderAdm onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Agendamentos</h1>
          <p className="text-sm text-gray-500">
            Busque, filtre por status e veja todos os agendamentos de coleta.
          </p>
        </header>

        {/* Busca */}
        <div className="mb-4 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-gray-400">⌕</span>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou protocolo"
            className="w-full text-sm focus:outline-none focus:ring-0"
          />
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as FiltroStatus)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0"
          >
            <option value="todos">Todos os status</option>
            <option value="agendado">Agendado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0"
          />
          <span className="text-sm text-gray-400">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0"
          />
        </div>

        {/* Lista */}
        {carregando && (
          <p className="py-10 text-center text-gray-400">Carregando agendamentos…</p>
        )}

        {!carregando && erro && (
          <p className="py-10 text-center text-rose-500">{erro}</p>
        )}

        {!carregando && !erro && agendamentos.length === 0 && (
          <p className="py-10 text-center text-gray-400">
            Nenhum agendamento encontrado com esses filtros.
          </p>
        )}

        {!carregando && !erro && agendamentos.length > 0 && (
          <div className="flex flex-col gap-4">
            {agendamentos.map((agendamento) => (
              <AgendamentoCard
                key={agendamento.sol_id}
                agendamento={agendamento}
                showActions
                onConcluir={handleConcluir}
                onCancelar={handleCancelar}
              />
            ))}
          </div>
        )}
      </main>

      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-indigo-700"
      >
        <span className="text-lg leading-none">+</span> Novo Agendamento
      </button>

      {modalAberto && (
        <NovoAgendamentoModal
          onClose={() => setModalAberto(false)}
          onSuccess={() => {
            setModalAberto(false);
            carregar();
          }}
        />
      )}

      <Footer />
    </div>
  );
}