import type { EventoHistorico } from "../../services/HistoricoService";

// Texto e cor de cada ação registrada no histórico (backend: utils/historico.js)
const ACOES: Record<string, { titulo: string; cor: string }> = {
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

const PAPEL: Record<string, string> = {
  ADMIN: "administrador(a) da unidade",
  AUTORIZADOR: "autorizador(a)",
  PACIENTE: "paciente",
};

function quem(e: EventoHistorico) {
  if (!e.usuario_tipo) return null;
  if (e.usuario_nome) return `por ${e.usuario_nome} · ${PAPEL[e.usuario_tipo] ?? ""}`;
  // paciente vendo ação da equipe: mostra só o papel
  return e.usuario_tipo === "AUTORIZADOR" ? "pelo autorizador" : e.usuario_tipo === "ADMIN" ? "pela unidade" : null;
}

function quando(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Linha do tempo de uma solicitação/agendamento: o que aconteceu, quando e por quem. */
export default function LinhaDoTempo({ eventos }: { eventos: EventoHistorico[] }) {
  if (!eventos.length) {
    return (
      <p className="text-sm text-gray-500">
        Nenhum registro ainda. O histórico começa a ser gravado a partir desta versão do sistema.
      </p>
    );
  }

  return (
    <ol className="relative ml-2 border-l-2 border-gray-200">
      {eventos.map((e) => {
        const info = ACOES[e.acao] ?? { titulo: e.acao, cor: "bg-gray-400" };
        const autor = quem(e);
        return (
          <li key={e.his_id} className="relative mb-5 ml-5 last:mb-0">
            <span className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${info.cor}`} aria-hidden="true" />
            <p className="font-medium text-gray-900">{info.titulo}</p>
            <p className="text-xs text-gray-500">
              {quando(e.quando)}
              {autor ? ` · ${autor}` : ""}
            </p>
            {e.detalhe && <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{e.detalhe}</p>}
          </li>
        );
      })}
    </ol>
  );
}
