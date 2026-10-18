import axios from "axios";
import { API_URL } from "../config";
import type { Perfil } from "../components/universais/sessao";
import type { PaginaNotificacoes, ResumoNotificacoes } from "../types/notificacao";

const chavesToken: Record<Perfil, string> = {
  ADMIN: "token_admin",
  AUTORIZADOR: "token_autorizador",
  PACIENTE: "token_paciente",
};

function cabecalho(perfil: Perfil) {
  return { Authorization: `Bearer ${localStorage.getItem(chavesToken[perfil]) ?? ""}` };
}

export const temSessao = (perfil: Perfil) => Boolean(localStorage.getItem(chavesToken[perfil]));

// Contador e as mais recentes (usado pelo sino, de tempos em tempos)
export async function buscarResumoNotificacoes(perfil: Perfil): Promise<ResumoNotificacoes> {
  const { data } = await axios.get(`${API_URL}/notificacoes/resumo`, { headers: cabecalho(perfil) });
  return data;
}

// Histórico paginado (página "Notificações")
export async function listarNotificacoes(
  perfil: Perfil,
  page: number,
  situacao: "todas" | "nao_lidas" = "todas",
  porPagina = 15,
): Promise<PaginaNotificacoes> {
  const { data } = await axios.get(`${API_URL}/notificacoes`, {
    params: { page, porPagina, situacao },
    headers: cabecalho(perfil),
  });
  return data;
}

export async function marcarNotificacaoLida(perfil: Perfil, id: number): Promise<number> {
  const { data } = await axios.patch(`${API_URL}/notificacoes/${id}/lida`, {}, { headers: cabecalho(perfil) });
  return data.naoLidas;
}

// "ate": a notificação mais recente que a pessoa estava vendo (as que
// chegarem depois continuam como não lidas)
export async function marcarTodasLidas(perfil: Perfil, ate?: number): Promise<number> {
  const { data } = await axios.patch(
    `${API_URL}/notificacoes/lidas`,
    ate ? { ate } : {},
    { headers: cabecalho(perfil) },
  );
  return data.naoLidas;
}
