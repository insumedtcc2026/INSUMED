import type { StatusAgendamento } from "../../../types/agendamento";
 
const STYLES: Record<StatusAgendamento, string> = {
  agendado: "bg-[#001ED3] text-white",
  concluido: "bg-[#32D74B] text-white",
  cancelado: "bg-[#D30000] text-white",
};
 
type Variant = "adm" | "paciente";
 
// A label do status "concluido" muda de acordo com a audiência:
// o ADM vê "Concluído" (ele que concluiu a ação), o paciente vê
// "Coletado" (linguagem do resultado, não da ação administrativa).
const LABELS: Record<Variant, Record<StatusAgendamento, string>> = {
  adm: {
    agendado: "Agendado",
    concluido: "Concluído",
    cancelado: "Cancelado",
  },
  paciente: {
    agendado: "Agendado",
    concluido: "Coletado",
    cancelado: "Cancelado",
  },
};
 
interface StatusBadgeProps {
  status: StatusAgendamento;
  variant?: Variant;
}
 
/** Pílula de status usada dentro dos cards de agendamento. */
export default function StatusBadge({ status, variant = "adm" }: StatusBadgeProps) {
  const labels = LABELS[variant];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${STYLES[status]}`}
    >
      {labels[status]}
    </span>
  );
}
 