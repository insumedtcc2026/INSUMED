import { useEffect, useState, useCallback, type ReactNode } from "react";
import AgendamentoCard from "./AgendamentoCard";
import { concluirAgendamento, cancelarAgendamento } from "../../../services/AgendamentoService";
import type { Agendamento } from "../../../types/agendamento";
 
interface AgendamentosListPageProps {
  titulo: string;
  subtitulo: string;
  fetchAgendamentos: () => Promise<Agendamento[]>;
  showActions: boolean;
  extraHeaderContent?: ReactNode; // ex: botão "+ Novo Agendamento"
  mensagemVazio?: string;
}
 
/**
 * Estrutura compartilhada pelas 3 páginas de visualização de agendamentos.
 * Cada página só passa: título, subtítulo, a função de busca (com o filtro
 * já aplicado) e se deve mostrar os botões de ação.
 */
export default function AgendamentosListPage({
  titulo,
  subtitulo,
  fetchAgendamentos,
  showActions,
  extraHeaderContent,
  mensagemVazio = "Nenhum agendamento encontrado.",
}: AgendamentosListPageProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
 
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await fetchAgendamentos();
      setAgendamentos(dados);
    } catch {
      setErro("Não foi possível carregar os agendamentos.");
    } finally {
      setCarregando(false);
    }
  }, [fetchAgendamentos]);
 
  useEffect(() => {
    carregar();
  }, [carregar]);
 
  async function handleConcluir(sol_id: number) {
    await concluirAgendamento(sol_id);
    // Recarrega a lista: o agendamento concluído sai desta página
    // (ela só lista status 'agendado') e passaria a aparecer no Histórico.
    carregar();
  }
 
  async function handleCancelar(sol_id: number) {
    await cancelarAgendamento(sol_id);
    carregar();
  }
 
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="mt-1 h-6 w-6 text-indigo-500">
            <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h10v2H4z" />
          </svg>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{titulo}</h1>
            <p className="text-sm text-gray-500">{subtitulo}</p>
          </div>
        </div>
        {extraHeaderContent}
      </header>
 
      {carregando && (
        <p className="py-10 text-center text-gray-400">Carregando agendamentos…</p>
      )}
 
      {!carregando && erro && <p className="py-10 text-center text-rose-500">{erro}</p>}
 
      {!carregando && !erro && agendamentos.length === 0 && (
        <p className="py-10 text-center text-gray-400">{mensagemVazio}</p>
      )}
 
      {!carregando && !erro && agendamentos.length > 0 && (
        <div className="flex flex-col gap-4">
          {agendamentos.map((agendamento) => (
            <AgendamentoCard
              key={agendamento.sol_id}
              agendamento={agendamento}
              showActions={showActions}
              onConcluir={showActions ? handleConcluir : undefined}
              onCancelar={showActions ? handleCancelar : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}