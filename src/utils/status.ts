// Rótulos e cores padronizados para os status de prescrição e agendamento.
// Usado nas telas novas para todos verem o mesmo nome e a mesma cor.

export type TomStatus = "neutro" | "andamento" | "atencao" | "sucesso" | "erro";

interface InfoStatus {
  rotulo: string;
  tom: TomStatus;
}

const STATUS: Record<string, InfoStatus> = {
  // prescrição
  Pendente: { rotulo: "Em análise na unidade", tom: "andamento" },
  Reenvio: { rotulo: "Reenvio solicitado", tom: "atencao" },
  Revisado: { rotulo: "Aguardando autorização", tom: "andamento" },
  Aprovado: { rotulo: "Aguardando autorização", tom: "andamento" },
  Autorizado: { rotulo: "Autorizada", tom: "sucesso" },
  "Nao Autorizado": { rotulo: "Não autorizada", tom: "erro" },
  // agendamento
  agendado: { rotulo: "Agendado", tom: "andamento" },
  concluido: { rotulo: "Coletado", tom: "sucesso" },
  cancelado: { rotulo: "Cancelado", tom: "erro" },
};

export function infoStatus(status: string | null | undefined): InfoStatus {
  return STATUS[status ?? ""] ?? { rotulo: status || "—", tom: "neutro" };
}

export const CLASSES_TOM: Record<TomStatus, string> = {
  neutro: "bg-gray-100 text-gray-700",
  andamento: "bg-blue-100 text-blue-800",
  atencao: "bg-amber-100 text-amber-800",
  sucesso: "bg-green-100 text-green-800",
  erro: "bg-red-100 text-red-800",
};

// Datas: "2026-10-14" ou "2026-10-14T03:00:00.000Z" -> "14/10/2026".
// Data pura (sem hora) não passa por fuso, para não "voltar um dia".
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "—";
  // colunas DATE chegam como meia-noite UTC (o servidor da Vercel roda em UTC)
  const soData = /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(valor);
  if (soData) {
    const [a, m, d] = valor.slice(0, 10).split("-");
    return `${d}/${m}/${a}`;
  }
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleDateString("pt-BR");
}
