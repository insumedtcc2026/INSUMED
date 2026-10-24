import { useState } from "react";
import StatusBadge from "./StatusBadge";
import MotivoCancelamento from "./MotivoCancelamento";
import ModalHistorico from "../../universais/ModalHistorico";
import { editarRecado, remarcarComData, responderPedidoData } from "../../universais/acoesAdmin";
import { dataComTurno } from "../../../utils/agenda";
import type { Agendamento } from "../../../types/agendamento";
import { exibirCPF, exibirTelefone } from "../../../utils/validacoes";

interface AgendamentoCardProps {
  agendamento: Agendamento;
  showActions?: boolean;
  onConcluir?: (sol_id: number) => Promise<void> | void;
  onCancelar?: (sol_id: number) => Promise<void> | void;
  // recarregar a lista depois de salvar o recado
  onAtualizar?: () => void;
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
  onAtualizar,
}: AgendamentoCardProps) {
  const {
    sol_id,
    sol_protocolo,
    sol_data_de_coleta,
    sol_ciclo,
    paciente,
    insumos,
    status,
    sol_motivo_cancelamento,
    sol_data_cancelamento,
    sol_recado,
    sol_data_anterior,
    sol_turno,
    sol_presenca,
    pedido_outra_data: pedido,
    sol_retirado_por_nome,
  } = agendamento;
  const [loadingAcao, setLoadingAcao] = useState<AcaoEmAndamento>(null);
  const [verHistorico, setVerHistorico] = useState(false);

  // Regra: mesmo se a página passar showActions=true, um agendamento que já
  // não está mais 'agendado' (ex: concluído) nunca mostra os botões de ação.
  const exibirBotoes = showActions && status === "agendado";

  const resumoInsumos = insumos.length
    ? insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ")
    : "Nenhum insumo informado";
  const dataFormatada = sol_data_de_coleta ? dataComTurno(sol_data_de_coleta, sol_turno) : "Data não informada";
  const pedidoAberto = status === "agendado" && pedido?.situacao === "pedido" ? pedido : null;
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

  async function handleRecado() {
    if (await editarRecado(sol_id, protocolo, sol_recado)) onAtualizar?.();
  }

  async function handleRemarcar() {
    if (await remarcarComData(sol_id, protocolo, sol_data_de_coleta, sol_turno)) onAtualizar?.();
  }

  async function handlePedido(aceitar: boolean) {
    if (pedidoAberto && (await responderPedidoData(sol_id, protocolo, pedidoAberto, aceitar))) onAtualizar?.();
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
          <p className="text-sm text-gray-500">CPF: {exibirCPF(paciente.pac_cpf)}</p>
          <p className="text-sm text-gray-500">Tel: {exibirTelefone(paciente.pac_telefone)}</p>
          <p className="text-sm text-gray-500">
            Protocolo: {sol_protocolo ?? "—"} · Data: {dataFormatada}
            {sol_ciclo && sol_ciclo > 1 ? ` · ${sol_ciclo}ª retirada (uso contínuo)` : ""}
            {sol_data_anterior && status === "agendado" ? ` (remarcada; era ${formatarDataBR(sol_data_anterior)})` : ""}
          </p>
          {status === "concluido" && sol_retirado_por_nome && (
            <p className="text-sm text-gray-500">Retirado por {sol_retirado_por_nome}</p>
          )}
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
        {status === "agendado" && sol_presenca === "vou" && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Paciente confirmou</span>
        )}
        {status === "agendado" && sol_presenca === "nao_vou" && (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">Avisou que não vai</span>
        )}

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

      {status === "nao_compareceu" && (
        <p className="w-full basis-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          A data passou há mais de 7 dias sem retirada nem remarcação. Para atender o paciente, crie um novo agendamento.
        </p>
      )}

      {pedidoAberto && (
        <div className="w-full basis-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p>
            <span className="font-semibold">Pedido de outra data:</span> o paciente pediu{" "}
            <strong>{dataComTurno(pedidoAberto.data, pedidoAberto.turno)}</strong>.
            {pedidoAberto.motivo ? ` Motivo: ${pedidoAberto.motivo}` : ""}
          </p>
          {exibirBotoes && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePedido(true)}
                className="min-h-10 rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Aceitar e remarcar
              </button>
              <button
                type="button"
                onClick={() => handlePedido(false)}
                className="min-h-10 rounded-full border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 hover:bg-amber-100"
              >
                Recusar
              </button>
            </div>
          )}
        </div>
      )}

      {sol_recado && (
        <p className="w-full basis-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span className="font-medium">Recado para o paciente:</span> {sol_recado}
        </p>
      )}

      {/* Ações secundárias: histórico sempre; recado só se ainda agendado */}
      <div className="flex w-full basis-full flex-wrap gap-x-5 gap-y-1 border-t border-gray-200 pt-2 text-sm">
        <button type="button" onClick={() => setVerHistorico(true)} className="min-h-10 font-medium text-blue-700 hover:underline">
          Histórico
        </button>
        {exibirBotoes && (
          <button type="button" onClick={handleRecado} className="min-h-10 font-medium text-blue-700 hover:underline">
            {sol_recado ? "Editar recado" : "Deixar recado"}
          </button>
        )}
        {exibirBotoes && (
          <button type="button" onClick={handleRemarcar} className="min-h-10 font-medium text-blue-700 hover:underline">
            Remarcar
          </button>
        )}
      </div>

      {verHistorico && (
        <ModalHistorico
          sol_id={sol_id}
          perfil="ADMIN"
          titulo={`Histórico de ${protocolo}`}
          onClose={() => setVerHistorico(false)}
        />
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
