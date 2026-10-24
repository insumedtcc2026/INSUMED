import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock, CalendarSync, Check, CircleX, History, MessageSquareText, Repeat, Sunrise, Sunset, User, UserCheck,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import ModalHistorico from "../../universais/ModalHistorico";
import { AvatarIniciais, BOTAO_CONCLUIR, MenuAcoes, type OpcaoMenu } from "../../universais/AdminUI";
import { editarRecado, remarcarComData, responderPedidoData } from "../../universais/acoesAdmin";
import { dataComTurno } from "../../../utils/agenda";
import { formatarData } from "../../../utils/status";
import { exibirCPF, hojeISO } from "../../../utils/validacoes";
import type { Agendamento } from "../../../types/agendamento";

interface Props {
  agendamentos: Agendamento[];
  onConcluir: (sol_id: number) => Promise<void> | void;
  onCancelar: (sol_id: number) => Promise<void> | void;
  // recarregar a lista depois de recado, remarcação ou resposta ao pedido
  onAtualizar: () => void;
}

function somarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** "Hoje · segunda, 26/10", "Amanhã · terça, 27/10" ou "quarta, 28/10/2026". */
function rotuloDia(dia: string) {
  if (!dia) return "Sem data";
  const hoje = hojeISO();
  const d = new Date(`${dia}T12:00:00`);
  const semana = d.toLocaleDateString("pt-BR", { weekday: "long" });
  const curta = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  if (dia === hoje) return `Hoje · ${semana}, ${curta}`;
  if (dia === somarDias(hoje, 1)) return `Amanhã · ${semana}, ${curta}`;
  if (dia === somarDias(hoje, -1)) return `Ontem · ${semana}, ${curta}`;
  return `${semana}, ${formatarData(dia)}`;
}

/**
 * Tabela de agendamentos do admin, agrupada por dia. Só "Concluir" fica à
 * vista; remarcar, recado, histórico, ficha e cancelar ficam no menu ⋮
 * (cancelar por último, em vermelho). O pedido de outra data do paciente
 * aparece numa faixa logo abaixo da linha.
 */
export default function TabelaAgendamentos({ agendamentos, onConcluir, onCancelar, onAtualizar }: Props) {
  const navigate = useNavigate();
  const [historico, setHistorico] = useState<{ sol_id: number; protocolo: string } | null>(null);
  const [concluindo, setConcluindo] = useState<number | null>(null);

  // agrupa os agendamentos seguidos do mesmo dia (a lista já vem por data)
  const grupos: { dia: string; itens: Agendamento[] }[] = [];
  for (const a of agendamentos) {
    const dia = a.sol_data_de_coleta?.slice(0, 10) ?? "";
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.dia === dia) ultimo.itens.push(a);
    else grupos.push({ dia, itens: [a] });
  }

  async function concluir(sol_id: number) {
    setConcluindo(sol_id);
    try {
      await onConcluir(sol_id);
    } finally {
      setConcluindo(null);
    }
  }

  function opcoes(a: Agendamento): OpcaoMenu[] {
    const protocolo = a.sol_protocolo ?? String(a.sol_id);
    const aberto = a.status === "agendado";
    return [
      ...(aberto
        ? [
            {
              texto: "Remarcar",
              Icone: CalendarClock,
              onClick: async () => {
                if (await remarcarComData(a.sol_id, protocolo, a.sol_data_de_coleta, a.sol_turno)) onAtualizar();
              },
            },
            {
              texto: a.sol_recado ? "Editar recado" : "Deixar recado",
              Icone: MessageSquareText,
              onClick: async () => {
                if (await editarRecado(a.sol_id, protocolo, a.sol_recado)) onAtualizar();
              },
            },
          ]
        : []),
      { texto: "Histórico", Icone: History, onClick: () => setHistorico({ sol_id: a.sol_id, protocolo }) },
      { texto: "Ficha do paciente", Icone: User, onClick: () => navigate(`/pacientesadm/${a.paciente.pac_id}`) },
      ...(aberto
        ? [{ texto: "Cancelar agendamento", Icone: CircleX, perigo: true, onClick: () => onCancelar(a.sol_id) }]
        : []),
    ];
  }

  return (
    <>
      <table className="adm-tabela">
        <thead>
          <tr>
            <th>Turno</th>
            <th>Protocolo</th>
            <th>Paciente</th>
            <th>Insumos</th>
            <th>Situação</th>
            <th className="adm-col-acao">Ações</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map(({ dia, itens }) => {
            const aAtender = itens.filter((a) => a.status === "agendado").length;
            return (
              <Fragment key={`${dia}-${itens[0].sol_id}`}>
                <tr className="adm-linha-dia">
                  <td colSpan={6}>
                    {rotuloDia(dia)}
                    {dia === hojeISO() && aAtender > 0 ? ` — ${aAtender} a atender` : ""}
                  </td>
                </tr>
                {itens.map((a) => {
                  const protocolo = a.sol_protocolo ?? String(a.sol_id);
                  const aberto = a.status === "agendado";
                  const pedido = aberto && a.pedido_outra_data?.situacao === "pedido" ? a.pedido_outra_data : null;
                  return (
                    <Fragment key={a.sol_id}>
                      <tr className={pedido ? "adm-linha-destaque" : undefined}>
                        <td className={`whitespace-nowrap font-semibold ${a.sol_turno ? "" : "max-md:hidden"}`}>
                          <span className="inline-flex items-center gap-1.5">
                            {a.sol_turno === "tarde" ? <Sunset size={15} aria-hidden="true" /> : a.sol_turno ? <Sunrise size={15} aria-hidden="true" /> : null}
                            {a.sol_turno === "tarde" ? "Tarde" : a.sol_turno === "manha" ? "Manhã" : "—"}
                          </span>
                        </td>
                        <td data-rotulo="Protocolo" className="whitespace-nowrap font-bold text-gray-900">{protocolo}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <AvatarIniciais nome={a.paciente.pac_nome} />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">{a.paciente.pac_nome}</p>
                              <p className="text-xs text-gray-500">CPF {exibirCPF(a.paciente.pac_cpf)}</p>
                            </div>
                          </div>
                        </td>
                        <td data-rotulo="Insumos">
                          {a.insumos.length ? a.insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ") : "—"}
                          {a.sol_ciclo && a.sol_ciclo > 1 ? (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Repeat size={12} aria-hidden="true" /> {a.sol_ciclo}ª retirada (uso contínuo)
                            </span>
                          ) : null}
                          {a.sol_data_anterior && aberto && (
                            <span className="block text-xs text-gray-500">Remarcada; era {formatarData(a.sol_data_anterior)}</span>
                          )}
                          {a.sol_recado && (
                            <span className="flex items-start gap-1 text-xs text-blue-800">
                              <MessageSquareText size={12} className="mt-0.5 shrink-0" aria-hidden="true" /> Recado: {a.sol_recado}
                            </span>
                          )}
                          {a.status === "concluido" && a.sol_retirado_por_nome && (
                            <span className="block text-xs text-gray-500">Retirado por {a.sol_retirado_por_nome}</span>
                          )}
                        </td>
                        <td>
                          {aberto ? (
                            a.sol_presenca === "vou" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                                <UserCheck size={13} aria-hidden="true" /> Confirmou
                              </span>
                            ) : a.sol_presenca === "nao_vou" ? (
                              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Avisou que não vai</span>
                            ) : (
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">Sem resposta</span>
                            )
                          ) : (
                            <StatusBadge status={a.status} />
                          )}
                        </td>
                        <td className="adm-col-acao">
                          <div className="inline-flex items-center gap-2">
                            {aberto && (
                              <button
                                type="button"
                                onClick={() => concluir(a.sol_id)}
                                disabled={concluindo !== null}
                                className={BOTAO_CONCLUIR}
                                aria-label={`Concluir coleta do protocolo ${protocolo}`}
                              >
                                <Check size={16} aria-hidden="true" /> {concluindo === a.sol_id ? "Concluindo…" : "Concluir"}
                              </button>
                            )}
                            <MenuAcoes opcoes={opcoes(a)} rotulo={`Mais ações do protocolo ${protocolo}`} />
                          </div>
                        </td>
                      </tr>
                      {pedido && (
                        <tr className="adm-linha-destaque">
                          <td colSpan={6} className="!pt-0">
                            <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 md:flex-row md:items-center">
                              <CalendarSync size={17} className="hidden shrink-0 md:block" aria-hidden="true" />
                              <p className="flex-1">
                                <strong>Pedido de outra data:</strong> o paciente pediu{" "}
                                <strong>{dataComTurno(pedido.data, pedido.turno)}</strong>.
                                {pedido.motivo ? ` Motivo: ${pedido.motivo}` : ""}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (await responderPedidoData(a.sol_id, protocolo, pedido, true)) onAtualizar();
                                  }}
                                  className={BOTAO_CONCLUIR}
                                >
                                  Aceitar e remarcar
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (await responderPedidoData(a.sol_id, protocolo, pedido, false)) onAtualizar();
                                  }}
                                  className="min-h-10 rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                                >
                                  Recusar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {a.status === "cancelado" && (
                        <tr>
                          <td colSpan={6} className="!pt-0 text-sm text-rose-800">
                            <span className="block rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                              <strong>Motivo do cancelamento:</strong>{" "}
                              {a.sol_motivo_cancelamento?.trim() || "não registrado (cancelamento antigo)."}
                              {a.sol_data_cancelamento ? ` · em ${new Date(a.sol_data_cancelamento).toLocaleDateString("pt-BR")}` : ""}
                            </span>
                          </td>
                        </tr>
                      )}
                      {a.status === "nao_compareceu" && (
                        <tr>
                          <td colSpan={6} className="!pt-0 text-sm text-amber-900">
                            <span className="block rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                              A data passou há mais de 7 dias sem retirada nem remarcação. Para atender o paciente, crie um novo agendamento.
                            </span>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {historico && (
        <ModalHistorico
          sol_id={historico.sol_id}
          perfil="ADMIN"
          titulo={`Histórico de ${historico.protocolo}`}
          onClose={() => setHistorico(null)}
        />
      )}
    </>
  );
}
