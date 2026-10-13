import { useState } from "react";
import StatusBadge from "./StatusBadge";
import MotivoCancelamento from "./MotivoCancelamento";
import type { Agendamento } from "../../../types/agendamento";

interface AgendamentoCardProps {
  agendamento: Agendamento;
  showActions?: boolean;
  onConcluir?: (sol_id: number) => Promise<void> | void;
  onCancelar?: (sol_id: number) => Promise<void> | void;
}

type AcaoEmAndamento = "concluir" | "cancelar" | null;

/**
 * Card de um agendamento (visão ADM). Usado na página única de
 * "Agendamentos" do administrador, com os botões de ação aparecendo
 * apenas para agendamentos ainda com status 'agendado'.
 * Agendamentos cancelados mostram o motivo registrado no cancelamento.
 */
export default function AgendamentoCard({
  agendamento,
  showActions = true,
  onConcluir,
  onCancelar,
}: AgendamentoCardProps) {
  const {
    sol_id,
    sol_protocolo,
    sol_data_de_coleta,
    paciente,
    insumos,
    status,
    sol_motivo_cancelamento,
    sol_data_cancelamento,
  } = agendamento;
  const [loadingAcao, setLoadingAcao] = useState<AcaoEmAndamento>(null);

  // Regra: mesmo se a página passar showActions=true, um agendamento que já
  // não está mais 'agendado' (ex: concluído) nunca mostra os botões de ação.
  const exibirBotoes = showActions && status === "agendado";

  const resumoInsumos = insumos.length
    ? insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ")
    : "Nenhum insumo informado";
  const dataFormatada = formatarDataBR(sol_data_de_coleta);
  const protocolo = sol_protocolo ?? String(sol_id);

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
    <article className="flex flex-col gap-4 rounded-3xl bg-gray-50 px-4 py-4 shadow-sm sm:px-6 md:flex-row md:flex-wrap md:items-center">
      {/* Avatar + dados do paciente */}
      <div className="flex min-w-0 flex-1 items-start gap-3 md:items-center">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="break-words font-semibold text-gray-800">{paciente.pac_nome}</p>
          <p className="text-sm text-gray-500">CPF: {paciente.pac_cpf}</p>
          <p className="text-sm text-gray-500">Tel: {paciente.pac_telefone}</p>
          <p className="text-sm text-gray-500">
            Protocolo: {sol_protocolo ?? "—"} · Data: {dataFormatada}
          </p>
        </div>
      </div>

      {/* Insumos solicitados */}
      <div className="min-w-0 flex-1 md:min-w-[200px]">
        <p className="text-sm font-medium text-gray-400">Insumos</p>
        <p className="break-words text-gray-700">{resumoInsumos}</p>
      </div>

      {/* Status + ações */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={status} />

        {exibirBotoes && (
          <>
            <button
              type="button"
              onClick={handleConcluir}
              disabled={loadingAcao !== null}
              aria-label={`Concluir coleta do protocolo ${protocolo}`}
              className="min-h-11 flex-1 rounded-full bg-[#32D74B] px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {loadingAcao === "concluir" ? "Concluindo…" : "Concluir"}
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              disabled={loadingAcao !== null}
              aria-label={`Cancelar agendamento do protocolo ${protocolo}`}
              className="min-h-11 flex-1 rounded-full bg-[#D30000] px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {loadingAcao === "cancelar" ? "Cancelando…" : "Cancelar"}
            </button>
          </>
        )}
      </div>

      {status === "cancelado" && (
        <MotivoCancelamento motivo={sol_motivo_cancelamento} data={sol_data_cancelamento} />
      )}
    </article>
  );
}

function formatarDataBR(isoDate: string | null | undefined): string {
  if (!isoDate) return "Data não informada";
  const [ano, mes, dia] = isoDate.split("T")[0].split("-");
  if (!ano || !mes || !dia) return "Data não informada";
  return `${dia}/${mes}/${ano}`;
}
