import { useCallback, useEffect, useState } from "react";
import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";
import Footer from "../components/universais/Footer";
import { useValidarToken } from "../hook/Validartoken.tsx";
import { useDadosUser } from "../hook/Dadosuser";
import { listarAgendamentosDoPaciente } from "../services/AgendamentoService";
import AgendamentoCardPaciente from "../components/usuario-1/agendamentos/Agendamentocardpaciente";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import type { Agendamento } from "../types/agendamento";

const ITENS_POR_PAGINA = 4;

/**
 * Página 5: "Meus Agendamentos" — visão do PACIENTE.
 * Mostra somente os agendamentos (qualquer status) do próprio paciente
 * logado. Somente leitura: sem botões de Concluir/Cancelar (isso é
 * exclusivo do ADM, nas outras 3 telas).
 */
export default function Agendamentos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const { verificando } = useValidarToken();
  const { cpf } = useDadosUser();
  // O hook devolve uma string de erro fixa quando não há paciente logado
  // (ex: sessão de administrador) — tratamos isso como "sem CPF válido".
  const cpfValido = cpf && !cpf.includes("não encontrado") ? cpf : null;

  const [itens, setItens] = useState<Agendamento[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (pagina: number) => {
      if (!cpfValido) return;
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await listarAgendamentosDoPaciente(cpfValido, pagina, ITENS_POR_PAGINA);
        setItens(resultado.itens);
        setPaginaAtual(resultado.paginaAtual);
        setTotalPaginas(resultado.totalPaginas);
      } catch {
        setErro("Não foi possível carregar seus agendamentos.");
      } finally {
        setCarregando(false);
      }
    },
    [cpfValido]
  );

  useEffect(() => {
    carregar(1);
  }, [carregar]);

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
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-blue-700">
            Meus Agendamentos
          </h1>

          {!cpfValido && (
            <p className="py-10 text-center text-gray-400">
              Faça login para ver seus agendamentos.
            </p>
          )}

          {cpfValido && carregando && (
            <p className="py-10 text-center text-gray-400">Carregando…</p>
          )}

          {cpfValido && !carregando && erro && (
            <p className="py-10 text-center text-rose-500">{erro}</p>
          )}

          {cpfValido && !carregando && !erro && itens.length === 0 && (
            <p className="py-10 text-center text-gray-400">
              Você ainda não tem nenhum agendamento.
            </p>
          )}

          {cpfValido && !carregando && !erro && itens.length > 0 && (
            <div className="flex flex-col gap-4">
              {itens.map((agendamento) => (
                <AgendamentoCardPaciente key={agendamento.sol_id} agendamento={agendamento} />
              ))}
            </div>
          )}

          {cpfValido && (
            <Pagination
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onMudarPagina={(p) => carregar(p)}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}