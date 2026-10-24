import axios from "axios";
import { API_URL } from "../config";
import { observarAcoes } from "../utils/notificacoes";
import type { Turno } from "../utils/agenda";

// Agenda da unidade (etapa 3): horários e vagas, dias fechados, pedido de
// outra data, confirmação de presença e prioridade legal.

const api = axios.create({ baseURL: API_URL });
// ações que mudam dados atualizam o sino na hora
observarAcoes(api);

type Perfil = "ADMIN" | "PACIENTE";
const chaves: Record<Perfil, string> = { ADMIN: "token_admin", PACIENTE: "token_paciente" };
const cabecalho = (perfil: Perfil) => ({ Authorization: `Bearer ${localStorage.getItem(chaves[perfil]) ?? ""}` });

// ---------------------------------------------------------
// HORÁRIOS DA UNIDADE
// ---------------------------------------------------------

export interface HorarioTurno {
  dia_semana: number; // 0 = domingo
  turno: Turno;
  abre: string;
  fecha: string;
  vagas: number | null; // null = sem limite
}

export interface DiaFechado {
  id: number;
  data: string;
  motivo: string | null;
}

export interface HorariosUnidade {
  posto: { pos_id: number; pos_nome: string };
  padrao: boolean; // a unidade ainda não cadastrou (segunda a sexta, sem limite)
  horarios: HorarioTurno[];
  bloqueios: DiaFechado[];
}

export interface TurnoNaAgenda {
  data: string;
  turno: Turno;
  abre: string;
  fecha: string;
  vagas: number | null;
  ocupadas: number;
  livres: number | null;
  fechado_motivo: string | null;
}

export async function buscarHorarios(pos_id: number): Promise<HorariosUnidade> {
  const { data } = await api.get(`/postos/${pos_id}/horarios`);
  return data;
}

export async function salvarHorarios(pos_id: number, horarios: HorarioTurno[]) {
  const { data } = await api.put(`/postos/${pos_id}/horarios`, { horarios }, { headers: cabecalho("ADMIN") });
  return data as { message: string; horarios: HorarioTurno[] };
}

export async function fecharDia(pos_id: number, dia: string, motivo: string) {
  const { data } = await api.post(`/postos/${pos_id}/bloqueios`, { data: dia, motivo }, { headers: cabecalho("ADMIN") });
  return data as { id: number; data: string; motivo: string | null; agendamentos_no_dia: number };
}

export async function reabrirDia(pos_id: number, id: number) {
  await api.delete(`/postos/${pos_id}/bloqueios/${id}`, { headers: cabecalho("ADMIN") });
}

export async function buscarOcupacao(pos_id: number, inicio?: string, fim?: string): Promise<TurnoNaAgenda[]> {
  const { data } = await api.get(`/postos/${pos_id}/agenda`, { params: { inicio, fim }, headers: cabecalho("ADMIN") });
  return data;
}

// ---------------------------------------------------------
// PACIENTE NA AGENDA
// ---------------------------------------------------------

export interface OpcaoData {
  data: string;
  turno: Turno;
  abre: string;
  fecha: string;
  livres: number | null;
}

export async function buscarOpcoesOutraData(sol_id: number): Promise<OpcaoData[]> {
  const { data } = await api.get(`/meus-agendamentos/${sol_id}/opcoes`, { headers: cabecalho("PACIENTE") });
  return data;
}

export async function pedirOutraData(sol_id: number, dia: string, turno: Turno, motivo: string) {
  const { data } = await api.post(
    `/meus-agendamentos/${sol_id}/outra-data`,
    { data: dia, turno, motivo },
    { headers: cabecalho("PACIENTE") },
  );
  return data as { message: string };
}

export async function responderPresenca(sol_id: number, resposta: "vou" | "nao_vou") {
  const { data } = await api.patch(`/meus-agendamentos/${sol_id}/presenca`, { resposta }, { headers: cabecalho("PACIENTE") });
  return data as { message: string; sol_presenca: "vou" | "nao_vou" };
}

export async function cancelarMeuAgendamento(sol_id: number, motivo: string) {
  const { data } = await api.patch(`/meus-agendamentos/${sol_id}/cancelar`, { motivo }, { headers: cabecalho("PACIENTE") });
  return data as { message: string };
}

// a unidade responde ao pedido de outra data
export async function responderPedidoOutraData(sol_id: number, aceitar: boolean, resposta = "") {
  const { data } = await api.patch(
    `/agendamentos/${sol_id}/pedido-outra-data`,
    { aceitar, resposta },
    { headers: cabecalho("ADMIN") },
  );
  return data as { message: string };
}

// ---------------------------------------------------------
// PRIORIDADE LEGAL
// ---------------------------------------------------------

export interface Prioridade {
  grupo: 1 | 2 | 3;
  motivo: "80+" | "60+" | "pcd" | "gestante" | null;
  aguardando_conferencia: boolean;
}

export async function declararPrioridade(pcd: boolean, gestante: boolean) {
  const { data } = await api.patch("/pacientes/minha-prioridade", { pcd, gestante }, { headers: cabecalho("PACIENTE") });
  return data as { mensagem: string; prioridade: Prioridade; usuario: Record<string, unknown> };
}

export async function conferirPrioridade(pac_id: number, conferida: boolean) {
  const { data } = await api.patch(`/pacientes/${pac_id}/prioridade`, { conferida }, { headers: cabecalho("ADMIN") });
  return data as { message: string; prioridade: Prioridade };
}
