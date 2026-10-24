import axios from "axios";
import { observarAcoes } from "../utils/notificacoes";

import type {
  Agendamento,
  AtendimentoAgendamento,
  ResultadoLeituraQR,
  NovoAgendamentoPayload,
  ResultadoPaginado,
  FiltrosAgendamento,
} from "../types/agendamento";
import { API_URL } from "../config";


const api = axios.create({
  baseURL: API_URL,
});

// ações que mudam dados atualizam o sino na hora
observarAcoes(api);


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

// Mesma lista, paginada no banco (agenda do posto cresce com o tempo)
export interface PaginaAgendamentos {
  itens: Agendamento[];
  total: number;
  paginaAtual: number;
  totalPaginas: number;
}

export async function listarAgendamentosPaginado(
  filtros: FiltrosAgendamento = {},
  page = 1,
  porPagina = 20,
): Promise<PaginaAgendamentos> {
  const response = await api.get("/agendamentos", {
    params: {
      status: filtros.status,
      busca: filtros.busca || undefined,
      data_inicio: filtros.dataInicio || undefined,
      data_fim: filtros.dataFim || undefined,
      pedido: filtros.pedido,
      page,
      porPagina,
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
  situacao?: "proximos" | "anteriores",
  // um agendamento só (link de uma notificação)
  sol_id?: number
): Promise<ResultadoPaginado<Agendamento>> {
  const response = await api.get("/meus-agendamentos", {
    params: {
      page: pagina,
      porPagina: itensPorPagina,
      situacao: sol_id ? undefined : situacao,
      sol_id,
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

// ---------------------------------------------------------
// LEITOR DE QR CODE (ADM)
// ---------------------------------------------------------

// Texto lido do QR do comprovante (câmera, leitor USB ou digitado). Quem
// valida o formato, o código e o posto é o backend.
export async function buscarPorQRCode(codigo: string): Promise<ResultadoLeituraQR> {
  const response = await api.get("/agendamentos/qrcode", {
    params: { codigo: codigo.trim() },
    headers: authHeader("ADMIN"),
  });
  return response.data;
}

// Dados mínimos da tela de atendimento aberta pelo leitor
export async function buscarAtendimento(sol_id: number): Promise<AtendimentoAgendamento> {
  const response = await api.get(`/agendamentos/${sol_id}/atendimento`, {
    headers: authHeader("ADMIN"),
  });
  return response.data;
}
