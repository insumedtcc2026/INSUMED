import axios from "axios";

import type {
  Agendamento,
  NovoAgendamentoPayload,
  ResultadoPaginado,
} from "../types/agendamento";

const API_URL = "https://backend-insumed-lhac.vercel.app";

const api = axios.create({
  baseURL: API_URL,
});

// ---------------------------------------------------------
// LISTAR AGENDAMENTOS DE HOJE
// ---------------------------------------------------------

export async function listarAgendamentosDeHoje(): Promise<Agendamento[]> {
  const response = await api.get("/agendamentos", {
    params: {
      status: "agendado",
      data: "hoje",
    },
  });

  return response.data;
}

// ---------------------------------------------------------
// LISTAR TODOS OS AGENDAMENTOS EXCETO HOJE
// ---------------------------------------------------------

export async function listarTodosAgendamentosExcetoHoje(): Promise<Agendamento[]> {
  const response = await api.get("/agendamentos", {
    params: {
      status: "agendado",
      excluir_data: "hoje",
      order: "proximidade",
    },
  });

  return response.data;
}

// ---------------------------------------------------------
// HISTÓRICO
// ---------------------------------------------------------

export async function listarHistorico(): Promise<Agendamento[]> {
  const response = await api.get("/agendamentos", {
    params: {
      status: "concluido",
    },
  });

  return response.data;
}

// ---------------------------------------------------------
// AGENDAMENTOS DO PACIENTE LOGADO
// ---------------------------------------------------------

export async function listarAgendamentosDoPaciente(
  _pac_cpf: string,
  pagina = 1,
  itensPorPagina = 4
): Promise<ResultadoPaginado<Agendamento>> {

  const token = localStorage.getItem("token");

  const response = await api.get("/meus-agendamentos", {
    params: {
      page: pagina,
      porPagina: itensPorPagina,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// ---------------------------------------------------------
// CONCLUIR AGENDAMENTO
// ---------------------------------------------------------

export async function concluirAgendamento(
  sol_id: number
): Promise<Agendamento | undefined> {

  const token = localStorage.getItem("token");

  await api.patch(
    `/agendamentos/${sol_id}/concluir`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Busca novamente o agendamento atualizado
  const response = await api.get("/agendamentos", {
    params: {
      status: "concluido",
    },
  });

  return response.data.find(
    (agendamento: Agendamento) => agendamento.sol_id === sol_id
  );
}

// ---------------------------------------------------------
// CANCELAR AGENDAMENTO
// ---------------------------------------------------------

export async function cancelarAgendamento(
  sol_id: number
): Promise<boolean> {

  const token = localStorage.getItem("token");

  await api.patch(
    `/agendamentos/${sol_id}/cancelar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return true;
}

// ---------------------------------------------------------
// CRIAR AGENDAMENTO
// ---------------------------------------------------------

export async function criarAgendamento(
  payload: NovoAgendamentoPayload
): Promise<Agendamento> {

  const token = localStorage.getItem("token");

  const response = await api.post(
    "/agendamentos",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  /*
   * O backend atualmente retorna:
   *
   * {
   *   message: "Agendamento criado com sucesso",
   *   sol_id: 10
   * }
   *
   * Portanto buscamos o agendamento recém-criado
   * para devolver um objeto Agendamento completo.
   */

  const agendamentos = await api.get("/agendamentos");

  const novoAgendamento = agendamentos.data.find(
    (agendamento: Agendamento) =>
      agendamento.sol_id ===
      (response.data.sol_id?.sol_id ?? response.data.sol_id)
  );

  return novoAgendamento;
}