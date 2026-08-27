import { useState } from "react";
import StatusBadge from "./StatusBadge";
import type  {Agendamento}  from "../../../types/agendamento";
 
interface AgendamentoCardProps {
  agendamento: Agendamento;
  showActions?: boolean;
  onConcluir?: (sol_id: number) => Promise<void> | void;
  onCancelar?: (sol_id: number) => Promise<void> | void;
}
 
type AcaoEmAndamento = "concluir" | "cancelar" | null;
 
/**
 * Card de um agendamento. Reciclado em:
 *  - Coletas de Hoje        (showActions = true)
 *  - Todos os Agendamentos  (showActions = true)
 *  - Histórico de Coletas   (showActions = false -> concluído, sem botões)
 */
export default function AgendamentoCard({
  agendamento,
  showActions = true,
  onConcluir,
  onCancelar,
}: AgendamentoCardProps) {
  const { sol_id, paciente, insumos, status } = agendamento;
  const [loadingAcao, setLoadingAcao] = useState<AcaoEmAndamento>(null);
 
  // Regra: mesmo se a página passar showActions=true, um agendamento que já
  // não está mais 'agendado' (ex: concluído) nunca mostra os botões de ação.
  const exibirBotoes = showActions && status === "agendado";
 
  const resumoInsumos = insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ");
 
  async function handleConcluir() {
    if (!onConcluir) return;
    setLoadingAcao("concluir");
    try {
      await onConcluir(sol_id);
    } finally {
      setLoadingAcao(null);
    }
  }
 
  async function handleCancelar() {
    if (!onCancelar) return;
    setLoadingAcao("cancelar");
    try {
      await onCancelar(sol_id);
    } finally {
      setLoadingAcao(null);
    }
  }
 
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-gray-50 px-6 py-4 shadow-sm">
      {/* Avatar + dados do paciente */}
      <div className="flex flex-1 min-w-[220px] items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-gray-800">{paciente.pac_nome}</p>
          <p className="text-sm text-gray-500">CPF: {paciente.pac_cpf}</p>
          <p className="text-sm text-gray-500">Tel: {paciente.pac_telefone}</p>
        </div>
      </div>
 
      {/* Insumos solicitados */}
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-medium text-gray-400">Insumos</p>
        <p className="text-gray-700">{resumoInsumos}</p>
      </div>
 
      {/* Status + ações */}
      <div className="flex items-center gap-3">
        <StatusBadge status={status} />
 
        {exibirBotoes && (
          <>
            <button
              type="button"
              onClick={handleConcluir}
              disabled={loadingAcao !== null}
              className="rounded-full bg-[#32D74B] px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {loadingAcao === "concluir" ? "Concluindo…" : "Concluir"}
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              disabled={loadingAcao !== null}
              className="rounded-full bg-[#D30000] px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
            >
              {loadingAcao === "cancelar" ? "Cancelando…" : "Cancelar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
 