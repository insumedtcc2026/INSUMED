import { listarAgendamentosDoPaciente } from "../services/AgendamentoService";
import { buscarMinhasPrescricoes } from "../services/PrescricaoService";
import { buscarFichaPaciente } from "../services/PainelService";

// Um uso do paciente numa unidade: uma coleta (agendamento) ou uma prescrição enviada
export interface UsoDoPosto {
  pos_id: number | null | undefined;
  data: string | null | undefined;
  // coleta já feita conta mais que uma prescrição só enviada
  peso: number;
}

/**
 * Unidade que o paciente mais usou nos últimos usos (as 10 mais recentes).
 * Coleta concluída vale 3, outros agendamentos 2 e prescrição enviada 1;
 * no empate, ganha a usada mais recentemente. Sem histórico: null.
 */
export function postoMaisUsado(usos: UsoDoPosto[]): number | null {
  const recentes = usos
    .filter((u) => u.pos_id)
    .sort((a, b) => String(b.data ?? "").localeCompare(String(a.data ?? "")))
    .slice(0, 10);

  const pontos = new Map<number, { total: number; ordem: number }>();
  recentes.forEach((u, ordem) => {
    const atual = pontos.get(u.pos_id!) ?? { total: 0, ordem };
    pontos.set(u.pos_id!, { total: atual.total + u.peso, ordem: atual.ordem });
  });

  let melhor: number | null = null;
  let melhorPontos = { total: -1, ordem: Infinity };
  for (const [pos_id, p] of pontos) {
    if (p.total > melhorPontos.total || (p.total === melhorPontos.total && p.ordem < melhorPontos.ordem)) {
      melhor = pos_id;
      melhorPontos = p;
    }
  }
  return melhor;
}

/** Unidade sugerida para o paciente logado (coletas + prescrições recentes). */
export async function buscarPostoSugeridoDoPaciente(): Promise<number | null> {
  const [agendamentos, prescricoes] = await Promise.all([
    listarAgendamentosDoPaciente("", 1, 20).catch(() => null),
    buscarMinhasPrescricoes("encerradas", 1, 10).catch(() => null),
  ]);

  const usos: UsoDoPosto[] = [
    ...(agendamentos?.itens ?? []).map((a) => ({
      pos_id: a.posto?.pos_id,
      data: a.sol_data_de_coleta,
      peso: a.status === "concluido" ? 3 : 2,
    })),
    ...(prescricoes?.itens ?? []).map((p) => ({
      pos_id: p.pos_id,
      data: p.sol_data_solicitacao,
      peso: 1,
    })),
  ];
  return postoMaisUsado(usos);
}

/** Unidade habitual de um paciente, vista pelo admin (ficha do paciente). */
export async function buscarPostoHabitualDoPaciente(pac_id: number): Promise<number | null> {
  const ficha = await buscarFichaPaciente(pac_id);
  return postoMaisUsado([
    ...ficha.agendamentos.map((a) => ({
      pos_id: a.pos_id,
      data: a.sol_data_de_coleta ?? a.sol_data_solicitacao,
      peso: a.sol_status === "concluido" ? 3 : 2,
    })),
    ...ficha.prescricoes.map((p) => ({ pos_id: p.pos_id, data: p.sol_data_solicitacao, peso: 1 })),
  ]);
}

/** Unidade do admin logado (vem no login), ou null. */
export function postoDoAdminLogado(): number | null {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario_admin") ?? "null");
    return Number(usuario?.posto_id) || null;
  } catch {
    return null;
  }
}
