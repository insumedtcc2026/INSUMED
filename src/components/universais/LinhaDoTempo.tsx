import type { EventoHistorico } from "../../services/HistoricoService";
import { ACOES_HISTORICO, PAPEL_USUARIO, formatarDataHora } from "../../utils/acoesHistorico";

const ACOES = ACOES_HISTORICO;
const PAPEL = PAPEL_USUARIO;

function quem(e: EventoHistorico) {
  if (!e.usuario_tipo) return null;
  if (e.usuario_nome) return `por ${e.usuario_nome} · ${PAPEL[e.usuario_tipo] ?? ""}`;
  // paciente vendo ação da equipe: mostra só o papel
  return e.usuario_tipo === "AUTORIZADOR" ? "pelo autorizador" : e.usuario_tipo === "ADMIN" ? "pela unidade" : null;
}

const quando = formatarDataHora;

// "14/10/2026" a partir da data/hora do evento (fuso do navegador)
const dia = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};

function Evento({ e }: { e: EventoHistorico }) {
  const info = ACOES[e.acao] ?? { titulo: e.acao, cor: "bg-gray-400" };
  const autor = quem(e);
  return (
    <li className="relative mb-5 ml-5 last:mb-0">
      <span className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${info.cor}`} aria-hidden="true" />
      <p className="font-medium text-gray-900">{info.titulo}</p>
      <p className="text-xs text-gray-500">
        {quando(e.quando)}
        {autor ? ` · ${autor}` : ""}
      </p>
      {e.detalhe && <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{e.detalhe}</p>}
    </li>
  );
}

/**
 * Linha do tempo de uma solicitação/agendamento: o que aconteceu e quando,
 * em ordem cronológica. Com agruparPorDia, os eventos ficam sob o dia em
 * que aconteceram (útil em históricos longos).
 */
export default function LinhaDoTempo({ eventos, agruparPorDia = false }: { eventos: EventoHistorico[]; agruparPorDia?: boolean }) {
  if (!eventos.length) {
    return (
      <p className="text-sm text-gray-500">
        Nenhum registro ainda. O histórico começa a ser gravado a partir desta versão do sistema.
      </p>
    );
  }

  if (!agruparPorDia) {
    return (
      <ol className="relative ml-2 border-l-2 border-gray-200">
        {eventos.map((e) => <Evento key={e.his_id} e={e} />)}
      </ol>
    );
  }

  const grupos: { dia: string; itens: EventoHistorico[] }[] = [];
  for (const e of eventos) {
    const d = dia(e.quando);
    if (grupos[grupos.length - 1]?.dia !== d) grupos.push({ dia: d, itens: [] });
    grupos[grupos.length - 1].itens.push(e);
  }

  return (
    <div className="space-y-4">
      {grupos.map((g) => (
        <section key={g.dia} aria-label={g.dia}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{g.dia}</h4>
          <ol className="relative ml-2 border-l-2 border-gray-200">
            {g.itens.map((e) => <Evento key={e.his_id} e={e} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}
