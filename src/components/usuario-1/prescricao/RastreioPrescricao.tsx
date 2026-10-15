import { Link } from "react-router-dom";
import type { MinhaPrescricao } from "../../../services/PrescricaoService";
import type { EventoHistorico } from "../../../services/HistoricoService";
import { formatarData, textoMotivoReenvio } from "../../../utils/status";

type Estado = "feito" | "atual" | "pendente" | "atencao" | "erro";

interface Etapa {
  titulo: string;
  descricao?: string;
  data?: string | null;
  estado: Estado;
  // link para outra página ou ação na própria tela (ex.: reenviar)
  acao?: { texto: string; para?: string; onClick?: () => void };
}

const ultimo = (eventos: EventoHistorico[], ...acoes: string[]) =>
  [...eventos].reverse().find((e) => acoes.includes(e.acao));

const quando = (e?: EventoHistorico) => (e ? formatarData(e.quando) : null);

/**
 * Monta as 5 etapas do rastreio a partir do status atual, do agendamento
 * vinculado e do histórico (datas de cada passo).
 */
function montarEtapas(p: MinhaPrescricao, onReenviar?: () => void): { etapas: Etapa[]; resumo: string; tom: Estado } {
  const ev = p.eventos;
  const ag = p.agendamento;
  const s = p.sol_status;
  const versoes = p.versoes_anteriores ?? 0;
  // agendamento cancelado antes do atual: a remarcação não apaga o cancelamento
  const cancelamentoAnterior = p.agendamentos_cancelados?.[0];

  const analisada = ["Revisado", "Aprovado", "Autorizado", "Nao Autorizado"].includes(s);
  const autorizada = s === "Autorizado";
  const agendada = autorizada && ag && (ag.sol_status === "agendado" || ag.sol_status === "concluido");
  const retirada = autorizada && ag?.sol_status === "concluido";
  const cancelada = autorizada && ag?.sol_status === "cancelado";

  const etapas: Etapa[] = [
    {
      titulo: "Prescrição enviada",
      data: quando(ultimo(ev, "enviada")) ?? formatarData(p.sol_data_solicitacao),
      descricao: p.pos_nome ? `Para ${p.pos_nome}` : undefined,
      estado: "feito",
    },
    s === "Reenvio"
      ? {
          titulo: "A unidade pediu uma nova prescrição",
          descricao: `Motivo: ${textoMotivoReenvio(p.sol_motivo_reenvio)}. Reenvie a prescrição aqui mesmo para continuar — ela mantém o mesmo número.`,
          data: quando(ultimo(ev, "reenvio_solicitado")),
          estado: "atencao",
          acao: onReenviar ? { texto: "Reenviar prescrição", onClick: onReenviar } : undefined,
        }
      : {
          titulo: analisada ? "Analisada pela unidade" : "Em análise na unidade",
          descricao: [
            versoes > 0 ? `Você reenviou a prescrição corrigida (versão ${versoes + 1}).` : "",
            analisada
              ? p.ins_nome ? `${p.sol_insumo_quant ?? ""}x ${p.ins_nome}`.trim() : ""
              : "A equipe da unidade está conferindo sua prescrição.",
          ].filter(Boolean).join(" ") || undefined,
          data: quando(ultimo(ev, "revisada")) ?? (analisada ? null : quando(ultimo(ev, "reenviada"))),
          estado: analisada ? "feito" : "atual",
        },
    s === "Nao Autorizado"
      ? {
          titulo: "Não autorizada",
          descricao: `Motivo: ${p.sol_motivo_nao_autorizado || "não informado"}`,
          data: quando(ultimo(ev, "nao_autorizada")),
          estado: "erro",
        }
      : {
          titulo: autorizada ? "Autorizada" : "Autorização",
          descricao: autorizada ? undefined : analisada ? "Aguardando a decisão do autorizador." : undefined,
          data: quando(ultimo(ev, "autorizada")),
          estado: autorizada ? "feito" : analisada ? "atual" : "pendente",
        },
    cancelada
      ? {
          titulo: "Agendamento cancelado",
          descricao: `Motivo: ${ag?.sol_motivo_cancelamento || "não informado"}. A unidade vai marcar uma nova data.`,
          data: quando(ultimo(ev, "cancelada")),
          estado: "atencao",
        }
      : {
          titulo: agendada ? (cancelamentoAnterior ? "Coleta remarcada" : "Coleta agendada") : "Agendamento da coleta",
          descricao: agendada
            ? `${ag?.sol_protocolo ?? ""} · ${formatarData(ag?.sol_data_de_coleta)}${ag?.pos_nome ? ` · ${ag.pos_nome}` : ""}` +
              (cancelamentoAnterior
                ? `. O agendamento anterior (${cancelamentoAnterior.sol_protocolo ?? "sem protocolo"}) foi cancelado${cancelamentoAnterior.sol_motivo_cancelamento ? `: ${cancelamentoAnterior.sol_motivo_cancelamento}` : ""}.`
                : "")
            : autorizada ? "A unidade vai marcar a data da sua coleta." : undefined,
          data: quando(ultimo(ev, "reagendada", "agendada")),
          estado: agendada ? "feito" : autorizada ? "atual" : s === "Nao Autorizado" ? "pendente" : "pendente",
          acao: agendada && !retirada ? { texto: "Ver agendamento e comprovante", para: "/agendamentos" } : undefined,
        },
    {
      titulo: retirada ? "Insumos retirados" : "Retirada dos insumos",
      descricao: retirada
        ? undefined
        : agendada
          ? `Retire em ${formatarData(ag?.sol_data_de_coleta)}${ag?.pos_nome ? ` na ${ag.pos_nome}` : ""}.${ag?.sol_recado ? ` Recado da unidade: ${ag.sol_recado}` : ""}`
          : undefined,
      data: quando(ultimo(ev, "concluida")),
      estado: retirada ? "feito" : agendada ? "atual" : "pendente",
    },
  ];

  // frase de destaque (como o "chega amanhã" das entregas)
  let resumo = "Recebemos sua prescrição.";
  let tom: Estado = "atual";
  if (s === "Pendente") resumo = "Sua prescrição está em análise na unidade.";
  if (s === "Reenvio") { resumo = "A unidade precisa que você envie a prescrição de novo."; tom = "atencao"; }
  if (s === "Revisado" || s === "Aprovado") resumo = "Aguardando autorização.";
  if (s === "Nao Autorizado") { resumo = "Sua prescrição não foi autorizada."; tom = "erro"; }
  if (autorizada && !ag) resumo = "Autorizada! A unidade vai agendar sua coleta.";
  if (cancelada) { resumo = "O agendamento foi cancelado. A unidade vai remarcar."; tom = "atencao"; }
  if (agendada && !retirada) resumo = `Coleta ${cancelamentoAnterior ? "remarcada" : "marcada"} para ${formatarData(ag?.sol_data_de_coleta)}${ag?.pos_nome ? ` na ${ag.pos_nome}` : ""}.`;
  if (retirada) { resumo = "Insumos retirados. Tudo certo!"; tom = "feito"; }

  return { etapas, resumo, tom };
}


const BOLINHA: Record<Estado, string> = {
  feito: "bg-green-600 border-green-600 text-white",
  atual: "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100",
  pendente: "bg-white border-gray-300 text-gray-300",
  atencao: "bg-amber-500 border-amber-500 text-white",
  erro: "bg-red-600 border-red-600 text-white",
};

const SIMBOLO: Record<Estado, string> = { feito: "✓", atual: "•", pendente: "", atencao: "!", erro: "×" };

const COR_RESUMO: Record<Estado, string> = {
  feito: "bg-green-50 text-green-800",
  atual: "bg-blue-50 text-blue-800",
  pendente: "bg-gray-50 text-gray-700",
  atencao: "bg-amber-50 text-amber-900",
  erro: "bg-red-50 text-red-800",
};

const ROTULO_ESTADO: Record<Estado, string> = {
  feito: "concluída", atual: "em andamento", pendente: "a seguir", atencao: "precisa de atenção", erro: "encerrada",
};

/** Rastreio da prescrição em etapas, no estilo do acompanhamento de entregas. */
export default function RastreioPrescricao({ prescricao, onReenviar }: { prescricao: MinhaPrescricao; onReenviar?: () => void }) {
  const { etapas, resumo, tom } = montarEtapas(prescricao, onReenviar);
  const feitas = etapas.filter((e) => e.estado === "feito").length;
  const progresso = Math.round((feitas / etapas.length) * 100);

  return (
    <div>
      <p className={`rounded-xl px-4 py-3 font-semibold ${COR_RESUMO[tom]}`} role="status">{resumo}</p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        <div
          className={`h-full rounded-full ${tom === "erro" ? "bg-red-500" : tom === "atencao" ? "bg-amber-500" : "bg-green-600"}`}
          style={{ width: `${progresso}%` }}
        />
      </div>

      <ol className="mt-5" aria-label="Etapas da prescrição">
        {etapas.map((e, i) => (
          <li key={e.titulo} className="relative flex gap-4 pb-5 last:pb-0">
            {i < etapas.length - 1 && (
              <span
                className={`absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-0.5 ${e.estado === "feito" ? "bg-green-600" : "bg-gray-200"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${BOLINHA[e.estado]}`}
              aria-hidden="true"
            >
              {SIMBOLO[e.estado]}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`font-medium ${e.estado === "pendente" ? "text-gray-400" : "text-gray-900"}`}>
                {e.titulo}
                <span className="sr-only"> ({ROTULO_ESTADO[e.estado]})</span>
              </p>
              {e.data && <p className="text-xs text-gray-500">{e.data}</p>}
              {e.descricao && <p className="mt-0.5 break-words text-sm text-gray-600">{e.descricao}</p>}
              {e.acao?.para && (
                <Link to={e.acao.para} className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-blue-700 hover:underline">
                  {e.acao.texto} →
                </Link>
              )}
              {e.acao?.onClick && (
                <button type="button" onClick={e.acao.onClick} className="botao-novo-agendamento mt-2">
                  {e.acao.texto}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
