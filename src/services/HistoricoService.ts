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

// Versões anteriores da prescrição (guardadas quando o paciente reenvia
// uma correção dentro da mesma solicitação)
export interface VersaoPrescricao {
  ver_numero: number;
  ver_prescricao_tipo: string | null;
  ver_observacao: string | null;
  ver_motivo_reenvio: string | null;
  ver_motivo_reenvio_texto: string | null;
  ver_enviada_em: string | null;
  ver_substituida_em: string;
}

export async function buscarVersoes(sol_id: number, perfil: PerfilLogado): Promise<VersaoPrescricao[]> {
  const { data } = await axios.get(`${API_URL}/solicitacao/${sol_id}/versoes`, { headers: cabecalho(perfil) });
  return data;
}

export async function buscarArquivoVersao(sol_id: number, versao: number, perfil: PerfilLogado): Promise<Blob> {
  const { data } = await axios.get(`${API_URL}/solicitacao/${sol_id}/versoes/${versao}/arquivo`, {
    headers: cabecalho(perfil),
    responseType: "blob",
  });
  return data;
}

export async function salvarRecado(sol_id: number, recado: string) {
  const { data } = await axios.patch(
    `${API_URL}/agendamentos/${sol_id}/recado`,
    { recado },
    { headers: cabecalho("ADMIN") },
  );
  return data as { message: string; sol_recado: string | null };
}

// Nova data no MESMO agendamento (mesmo protocolo); o paciente é avisado
// turno vazio = o primeiro turno do dia com vaga
export async function remarcarAgendamento(sol_id: number, sol_data_de_coleta: string, motivo: string, sol_turno = "") {
  const { data } = await axios.patch(
    `${API_URL}/agendamentos/${sol_id}/remarcar`,
    { sol_data_de_coleta, motivo, ...(sol_turno ? { sol_turno } : {}) },
    { headers: cabecalho("ADMIN") },
  );
  return data as { message: string; sol_data_de_coleta: string; sol_data_anterior: string };
}

// Prescrição não autorizada volta ao autorizador, com observação da unidade
export async function refazerPedido(sol_id: number, observacao: string) {
  const { data } = await axios.patch(
    `${API_URL}/solicitacao/${sol_id}/refazer`,
    { observacao },
    { headers: cabecalho("ADMIN") },
  );
  return data as { message: string };
}
