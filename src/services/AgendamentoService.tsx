import axios from "axios";

import type {
  Agendamento,
  NovoAgendamentoPayload,
  ResultadoPaginado,
  FiltrosAgendamento,
} from "../types/agendamento";
import { API_URL } from "../config";


const api = axios.create({
  baseURL: API_URL,
});


type TipoUsuario = "ADMIN" | "PACIENTE" | "AUTORIZADOR";

function authHeader(tipo: TipoUsuario) {
  const chavesToken: Record<TipoUsuario, string> = {
    ADMIN: "token_admin",
    PACIENTE: "token_paciente",
    AUTORIZADOR: "token_autorizador",
  };

  const token = localStorage.getItem(chavesToken[tipo]);

  if (!token || token === "null" || token === "undefined" || !token.trim()) {
    throw new Error(
      `Token inválido para o perfil ${tipo}. Faça login novamente.`
    );
  }

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
    headers: authHeader("ADMIN"),
  });

  return response.data;
}

// ---------------------------------------------------------
// AGENDAMENTOS DO PACIENTE LOGADO (paginado)
// ---------------------------------------------------------

export async function listarAgendamentosDoPaciente(
  _pac_cpf: string,
  pagina = 1,
  itensPorPagina = 4,
  // "proximos" = só agendados (do mais próximo); "anteriores" = coletados/cancelados
  situacao?: "proximos" | "anteriores"
): Promise<ResultadoPaginado<Agendamento>> {
  const response = await api.get("/meus-agendamentos", {
    params: {
      page: pagina,
      porPagina: itensPorPagina,
      situacao,
    },
    headers: authHeader("PACIENTE"),
  });

  return response.data;
}

// ---------------------------------------------------------
// PRÓXIMO AGENDAMENTO DO PACIENTE LOGADO (usado na Home)
// ---------------------------------------------------------

export async function buscarProximoAgendamento(): Promise<Agendamento | null> {
  const response = await api.get("/meus-agendamentos/proximo", {
    headers: authHeader("PACIENTE"),
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
    { headers: authHeader("ADMIN") }
  );
}

// ---------------------------------------------------------
// CANCELAR AGENDAMENTO
// ---------------------------------------------------------

// O motivo é obrigatório (validado também no backend) e fica salvo no
// agendamento para consulta posterior pelo admin e pelo paciente.
export async function cancelarAgendamento(sol_id: number, motivo: string): Promise<void> {
  await api.patch(
    `/agendamentos/${sol_id}/cancelar`,
    { motivo },
    { headers: authHeader("ADMIN") }
  );
}

// ---------------------------------------------------------
// CRIAR AGENDAMENTO
// ---------------------------------------------------------

export async function criarAgendamento(
  payload: NovoAgendamentoPayload
): Promise<{ sol_id: number; sol_protocolo: string }> {
  const response = await api.post("/agendamentos", payload, {
    headers: authHeader("ADMIN"),
  });

  return response.data;
}