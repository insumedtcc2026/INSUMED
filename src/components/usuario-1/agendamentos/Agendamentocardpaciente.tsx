import StatusBadge from "./StatusBadge";
import MotivoCancelamento from "./MotivoCancelamento";
import type { Agendamento } from "../../../types/agendamento";

interface AgendamentoCardPacienteProps {
  agendamento: Agendamento;
}

/**
 * Card de agendamento na visão do PACIENTE (somente leitura).
 * Layout deliberadamente diferente do AgendamentoCard do ADM (sem avatar,
 * sem CPF/telefone, sem botões de ação), mas reaproveita o StatusBadge
 * com variant="paciente" (label "Coletado" em vez de "Concluído").
 * Quando cancelado, mostra o motivo informado pelo administrador.
 */
export default function AgendamentoCardPaciente({ agendamento }: AgendamentoCardPacienteProps) {
  const {
    sol_protocolo,
    sol_data_de_coleta,
    sol_hora_coleta,
    posto,
    insumos,
    status,
    sol_motivo_cancelamento,
    sol_data_cancelamento,
  } = agendamento;

  const resumoInsumos = insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ");
  const dataFormatada = formatarDataBR(sol_data_de_coleta);

  return (
    <div className="agendamento-card-paciente rounded-3xl bg-white px-5 py-5 shadow-sm sm:px-6">
      <p className="break-words text-gray-700">
        <span className="font-bold">Protocolo:</span> {sol_protocolo ?? "—"}
      </p>
      <p className="break-words text-gray-700">
        <span className="font-bold">Coleta:</span> {resumoInsumos}
      </p>
      <p className="text-gray-700">
        <span className="font-bold">Data:</span> {dataFormatada}
        {sol_hora_coleta ? ` • ${sol_hora_coleta}` : ""}
      </p>
      <p className="mb-3 break-words text-gray-700">
        <span className="font-bold">Local:</span> {posto.pos_nome}
      </p>
      <StatusBadge status={status} variant="paciente" />
      {status === "cancelado" && (
        <div className="mt-3">
          <MotivoCancelamento motivo={sol_motivo_cancelamento} data={sol_data_cancelamento} />
        </div>
      )}
    </div>
  );
}

function formatarDataBR(isoDate: string | null | undefined): string {
  if (!isoDate) return "Data não informada";
  const [ano, mes, dia] = isoDate.split("T")[0].split("-");
  if (!ano || !mes || !dia) return "Data não informada";
  return `${dia}/${mes}/${ano}`;
}
