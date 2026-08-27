import StatusBadge from "./StatusBadge";
import type { Agendamento } from "../../../types/agendamento";
 
interface AgendamentoCardPacienteProps {
  agendamento: Agendamento;
}
 
/**
 * Card de agendamento na visão do PACIENTE (somente leitura).
 * Layout deliberadamente diferente do AgendamentoCard do ADM (sem avatar,
 * sem CPF/telefone, sem botões de ação), mas reaproveita o StatusBadge
 * com variant="paciente" (label "Coletado" em vez de "Concluído").
 */
export default function AgendamentoCardPaciente({ agendamento }: AgendamentoCardPacienteProps) {
  const { sol_data_de_coleta, sol_hora_coleta, posto, insumos, status } = agendamento;
 
  const resumoInsumos = insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ");
  const dataFormatada = formatarDataBR(sol_data_de_coleta);
 
  return (
    <div className="rounded-3xl bg-gray-50 px-6 py-5 shadow-sm">
      <p className="text-gray-700">
        <span className="font-bold">Coleta:</span> {resumoInsumos}
      </p>
      <p className="text-gray-700">
        <span className="font-bold">Data:</span> {dataFormatada}
        {sol_hora_coleta ? ` • ${sol_hora_coleta}` : ""}
      </p>
      <p className="mb-3 text-gray-700">
        <span className="font-bold">Local:</span> {posto.pos_nome}
      </p>
      <StatusBadge status={status} variant="paciente" />
    </div>
  );
}
 
function formatarDataBR(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}
 