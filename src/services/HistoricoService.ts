import axios from "axios";
import { API_URL } from "../config";


export type PerfilLogado = "ADMIN" | "AUTORIZADOR" | "PACIENTE";

const chavesToken: Record<PerfilLogado, string> = {
  ADMIN: "token_admin",
  AUTORIZADOR: "token_autorizador",
  PACIENTE: "token_paciente",
};

const cabecalho = (perfil: PerfilLogado) => ({
  Authorization: `Bearer ${localStorage.getItem(chavesToken[perfil]) ?? ""}`,
});

export interface EventoHistorico {
  his_id: number;
  sol_id: number;
  acao: string;
  de: string | null;
  para: string | null;
  detalhe: string | null;
  quando: string;
  usuario_tipo: PerfilLogado | null;
  // null para o paciente quando a ação foi da equipe (ele vê só o papel)
  usuario_nome: string | null;
}

export async function buscarHistorico(sol_id: number, perfil: PerfilLogado): Promise<EventoHistorico[]> {
  const { data } = await axios.get(`${API_URL}/solicitacao/${sol_id}/historico`, { headers: cabecalho(perfil) });
  return data;
}

export async function transferirUnidade(sol_id: number, pos_id: number, motivo: string) {
  const { data } = await axios.patch(
    `${API_URL}/solicitacao/${sol_id}/transferir`,
    { pos_id, motivo },
    { headers: cabecalho("ADMIN") },
  );
  return data as { message: string; pos_id: number; pos_nome: string };
}

export async function salvarRecado(sol_id: number, recado: string) {
  const { data } = await axios.patch(
    `${API_URL}/agendamentos/${sol_id}/recado`,
    { recado },
    { headers: cabecalho("ADMIN") },
  );
  return data as { message: string; sol_recado: string | null };
}
