import type { Prioridade } from "../../services/AgendaService";

// Prioridade legal (Estatuto da Pessoa Idosa e Lei 10.048/2000): a fila de
// análise já vem nessa ordem do backend; o selo explica por que o paciente
// passou na frente. PcD e gestante só contam depois da conferência.
const TEXTO: Record<string, string> = {
  "80+": "Prioridade 80+",
  "60+": "Prioridade 60+",
  pcd: "Prioridade PcD",
  gestante: "Prioridade gestante",
};

export default function SeloPrioridade({ prioridade, mostrarPendente = false }: { prioridade?: Prioridade | null; mostrarPendente?: boolean }) {
  if (!prioridade) return null;
  if (prioridade.motivo) {
    const tom = prioridade.grupo === 1 ? "bg-violet-100 text-violet-900" : "bg-indigo-50 text-indigo-900";
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tom}`}>
        {TEXTO[prioridade.motivo]}
      </span>
    );
  }
  if (mostrarPendente && prioridade.aguardando_conferencia) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
        PcD/gestante a conferir
      </span>
    );
  }
  return null;
}
