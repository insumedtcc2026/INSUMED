import axios from "axios";

import type {
  Agendamento,
  NovoAgendamentoPayload,
  ResultadoPaginado,
  FiltrosAgendamento,
} from "../types/agendamento";

const API_URL = "https://backend-insumed-lhac.vercel.app";

const api = axios.create({
  baseURL: API_URL,
});

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

// ---------------------------------------------------------
// LISTAR AGENDAMENTOS (ADM) — página única, com filtros
// ---------------------------------------------------------
// Substitui listarAgendamentosDeHoje / listarTodosAgendamentosExcetoHoje /
// listarHistorico: agora é uma função só, parametrizada pelos filtros que
// o próprio ADM escolhe na tela (status, busca por nome/CPF/protocolo,
// intervalo de datas).

export async function listarAgendamentos(
  filtros: FiltrosAgendamento = {}
): Promise<Agendamento[]> {
  const response = await api.get("/agendamentos", {
    params: {
      status: filtros.status,
      busca: filtros.busca || undefined,
      data_inicio: filtros.dataInicio || undefined,
      data_fim: filtros.dataFim || undefined,
    },
    headers: authHeader(),
  });

  return response.data;
}

// ---------------------------------------------------------
// AGENDAMENTOS DO PACIENTE LOGADO (paginado)
// ---------------------------------------------------------

export async function listarAgendamentosDoPaciente(
  _pac_cpf: string,
  pagina = 1,
  itensPorPagina = 4
): Promise<ResultadoPaginado<Agendamento>> {
  const response = await api.get("/meus-agendamentos", {
    params: {
      page: pagina,
      porPagina: itensPorPagina,
    },
    headers: authHeader(),
  });

  return response.data;
}

// ---------------------------------------------------------
// PRÓXIMO AGENDAMENTO DO PACIENTE LOGADO (usado na Home)
// ---------------------------------------------------------

export async function buscarProximoAgendamento(): Promise<Agendamento | null> {
  const response = await api.get("/meus-agendamentos/proximo", {
    headers: authHeader(),
  });

  return response.data;
}

// ---------------------------------------------------------
// CONCLUIR AGENDAMENTO
// ---------------------------------------------------------

export async function concluirAgendamento(sol_id: number): Promise<void> {
  await api.patch(
    `/agendamentos/${sol_id}/concluir`,
    {},
    { headers: authHeader() }
  );
}

// ---------------------------------------------------------
// CANCELAR AGENDAMENTO
// ---------------------------------------------------------

export async function cancelarAgendamento(sol_id: number): Promise<void> {
  await api.patch(
    `/agendamentos/${sol_id}/cancelar`,
    {},
    { headers: authHeader() }
  );
}

// ---------------------------------------------------------
// CRIAR AGENDAMENTO
// ---------------------------------------------------------

export async function criarAgendamento(
  payload: NovoAgendamentoPayload
): Promise<{ sol_id: number; sol_protocolo: string }> {
  const response = await api.post("/agendamentos", payload, {
    headers: authHeader(),
  });

  return response.data;
}