// Agenda da unidade (etapa 3): turnos, vagas e o lembrete no calendário
// do paciente. Os turnos são os mesmos do backend.

export type Turno = "manha" | "tarde";
export const TURNOS: Turno[] = ["manha", "tarde"];
export const ROTULO_TURNO: Record<Turno, string> = { manha: "manhã", tarde: "tarde" };
// horário de quando a unidade não cadastrou o seu
export const HORA_PADRAO: Record<Turno, [string, string]> = { manha: ["08:00", "12:00"], tarde: ["13:00", "17:00"] };

export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const textoTurno = (turno?: string | null) =>
  turno && turno in ROTULO_TURNO ? ROTULO_TURNO[turno as Turno] : "";

// "2026-10-30" -> "qui, 30/10"
export function diaCurto(data: string) {
  const [a, m, d] = data.slice(0, 10).split("-").map(Number);
  const semana = new Date(a, m - 1, d).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return `${semana}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

// "30/10/2026, manhã"
export function dataComTurno(data?: string | null, turno?: string | null) {
  if (!data) return "Data não informada";
  const [a, m, d] = data.slice(0, 10).split("-");
  const t = textoTurno(turno);
  return `${d}/${m}/${a}${t ? `, ${t}` : ""}`;
}

// "4 vagas" | "1 vaga" | "livre" (sem limite)
export const textoVagas = (livres: number | null | undefined) =>
  livres == null ? "livre" : `${livres} ${livres === 1 ? "vaga" : "vagas"}`;

// ---------------------------------------------------------
// Adicionar ao calendário (Google Agenda ou arquivo .ics)
// ---------------------------------------------------------

export interface EventoColeta {
  titulo: string;
  data: string; // YYYY-MM-DD
  inicio: string; // HH:MM
  fim: string; // HH:MM
  local?: string | null;
  descricao?: string;
}

// horário de Brasília (UTC-3, sem horário de verão desde 2019) -> UTC
function paraUTC(data: string, hora: string) {
  const [a, m, d] = data.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  const utc = new Date(Date.UTC(a, m - 1, d, h + 3, min));
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function linkGoogleAgenda(e: EventoColeta) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.titulo,
    dates: `${paraUTC(e.data, e.inicio)}/${paraUTC(e.data, e.fim)}`,
    details: e.descricao ?? "",
    location: e.local ?? "",
    ctz: "America/Sao_Paulo",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

const escaparICS = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// Arquivo .ics (Apple, Outlook, celulares), com lembrete na véspera
export function arquivoICS(e: EventoColeta, uid: string) {
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Insumed//Agendamento//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@insumed`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${paraUTC(e.data, e.inicio)}`,
    `DTEND:${paraUTC(e.data, e.fim)}`,
    `SUMMARY:${escaparICS(e.titulo)}`,
    e.local ? `LOCATION:${escaparICS(e.local)}` : "",
    e.descricao ? `DESCRIPTION:${escaparICS(e.descricao)}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT18H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escaparICS(e.titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return linhas.join("\r\n");
}

export function baixarICS(e: EventoColeta, uid: string, nomeArquivo: string) {
  const blob = new Blob([arquivoICS(e, uid)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
