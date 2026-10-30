import type { MinhaPrescricao } from "../services/PrescricaoService";
import type { EventoHistorico } from "../services/HistoricoService";
import { formatarData, textoMotivoReenvio } from "./status";
import { resumoInsumos } from "./itensPrescricao";

export type Estado = "feito" | "atual" | "pendente" | "atencao" | "erro";

export interface Etapa {
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
export function montarEtapas(p: MinhaPrescricao, onReenviar?: () => void): { etapas: Etapa[]; resumo: string; tom: Estado } {
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
  const cancelada = autorizada && (ag?.sol_status === "cancelado" || ag?.sol_status === "nao_compareceu");
  const naoCompareceu = autorizada && ag?.sol_status === "nao_compareceu";

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
              ? resumoInsumos(p)
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
          titulo: naoCompareceu ? "Coleta não realizada" : "Agendamento cancelado",
          descricao: naoCompareceu
            ? `A retirada de ${formatarData(ag?.sol_data_de_coleta)} não foi feita. Fale com a unidade para combinar uma nova data.`
            : `Motivo: ${ag?.sol_motivo_cancelamento || "não informado"}. A unidade vai marcar uma nova data.`,
          data: quando(ultimo(ev, naoCompareceu ? "nao_compareceu" : "cancelada")),
          estado: "atencao",
        }
      : {
          titulo: agendada ? (cancelamentoAnterior || ag?.sol_data_anterior ? "Coleta remarcada" : "Coleta agendada") : "Agendamento da coleta",
          descricao: agendada
            ? `${ag?.sol_protocolo ?? ""} · ${formatarData(ag?.sol_data_de_coleta)}${ag?.pos_nome ? ` · ${ag.pos_nome}` : ""}` +
              (ag?.sol_data_anterior && !retirada ? ` (a data anterior era ${formatarData(ag.sol_data_anterior)})` : "") +
              (cancelamentoAnterior
                ? `. O agendamento anterior (${cancelamentoAnterior.sol_protocolo ?? "sem protocolo"}) ${cancelamentoAnterior.sol_status === "nao_compareceu" ? "não foi retirado" : "foi cancelado"}${cancelamentoAnterior.sol_motivo_cancelamento ? `: ${cancelamentoAnterior.sol_motivo_cancelamento}` : ""}.`
                : "")
            : autorizada ? "A unidade vai marcar a data da sua coleta." : undefined,
          data: quando(ultimo(ev, "remarcada", "reagendada", "agendada")),
          estado: agendada ? "feito" : autorizada ? "atual" : s === "Nao Autorizado" ? "pendente" : "pendente",
          acao: agendada && !retirada ? { texto: "Ver agendamento e comprovante", para: `/agendamentos?sol_id=${ag?.sol_id}` } : undefined,
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
  if (cancelada) { resumo = naoCompareceu ? "A coleta não foi retirada na data. Fale com a unidade." : "O agendamento foi cancelado. A unidade vai remarcar."; tom = "atencao"; }
  if (agendada && !retirada) resumo = `Coleta ${cancelamentoAnterior || ag?.sol_data_anterior ? "remarcada" : "marcada"} para ${formatarData(ag?.sol_data_de_coleta)}${ag?.pos_nome ? ` na ${ag.pos_nome}` : ""}.`;
  if (retirada) { resumo = "Insumos retirados. Tudo certo!"; tom = "feito"; }

  return { etapas, resumo, tom };
}
