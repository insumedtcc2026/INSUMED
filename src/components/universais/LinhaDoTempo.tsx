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
