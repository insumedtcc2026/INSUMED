// Texto e cor de cada ação registrada no histórico (backend: src/utils/historico.js).
// Usado na linha do tempo e na página "Atividades da unidade".

export const ACOES_HISTORICO: Record<string, { titulo: string; cor: string }> = {
  enviada: { titulo: "Prescrição enviada", cor: "bg-blue-500" },
  revisada: { titulo: "Revisada pela unidade e enviada para autorização", cor: "bg-blue-500" },
  reenvio_solicitado: { titulo: "Unidade pediu o reenvio da prescrição", cor: "bg-amber-500" },
  autorizada: { titulo: "Prescrição autorizada", cor: "bg-green-600" },
  nao_autorizada: { titulo: "Prescrição não autorizada", cor: "bg-red-600" },
  agendada: { titulo: "Coleta agendada", cor: "bg-blue-600" },
  concluida: { titulo: "Insumos entregues (coleta concluída)", cor: "bg-green-600" },
  cancelada: { titulo: "Agendamento cancelado", cor: "bg-red-600" },
  transferida: { titulo: "Transferida para outra unidade", cor: "bg-violet-600" },
  recado: { titulo: "Recado da unidade", cor: "bg-slate-500" },
};

export const PAPEL_USUARIO: Record<string, string> = {
  ADMIN: "administrador(a) da unidade",
  AUTORIZADOR: "autorizador(a)",
  PACIENTE: "paciente",
};

export function formatarDataHora(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
