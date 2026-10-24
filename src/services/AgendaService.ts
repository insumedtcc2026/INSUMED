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

// ---------------------------------------------------------
// PESSOAS AUTORIZADAS A RETIRAR
// ---------------------------------------------------------

export interface PessoaAutorizada {
  pau_id: number;
  pau_nome: string;
  pau_cpf: string;
  pau_parentesco: string | null;
  pau_telefone: string | null;
  pau_criado_em: string;
}

export interface DadosPessoaAutorizada {
  nome: string;
  cpf: string;
  parentesco: string;
  telefone: string;
}

export async function listarAutorizados(pac_id: number) {
  const { data } = await api.get(`/pacientes/${pac_id}/autorizados`, { headers: cabecalho("ADMIN") });
  return data as { autorizados: PessoaAutorizada[]; pode_editar: boolean; limite: number };
}

export async function salvarAutorizado(pac_id: number, dados: DadosPessoaAutorizada, pau_id?: number) {
  const { data } = pau_id
    ? await api.put(`/pacientes/${pac_id}/autorizados/${pau_id}`, dados, { headers: cabecalho("ADMIN") })
    : await api.post(`/pacientes/${pac_id}/autorizados`, dados, { headers: cabecalho("ADMIN") });
  return data as PessoaAutorizada;
}

export async function removerAutorizado(pac_id: number, pau_id: number) {
  await api.delete(`/pacientes/${pac_id}/autorizados/${pau_id}`, { headers: cabecalho("ADMIN") });
}

export async function listarMeusAutorizados(): Promise<PessoaAutorizada[]> {
  const { data } = await api.get("/meus-autorizados", { headers: cabecalho("PACIENTE") });
  return data;
}

// ---------------------------------------------------------
// MEUS INSUMOS (paciente)
// ---------------------------------------------------------

export interface MeuInsumo {
  ins_id: number;
  ins_nome: string;
  ins_marca: string | null;
  quantidade: number;
  situacao: "disponivel" | "indisponivel";
}

export interface PrescricaoEmUso {
  sol_id: number;
  posto: { pos_id: number; pos_nome: string; pos_endereco: string | null; pos_whatsapp: string | null };
  sol_data_vencimento: string | null;
  sol_periodicidade_dias: number | null;
  retiradas_concluidas: number;
  proxima_retirada: string | null;
  agendamento: { sol_id: number; data: string; turno: Turno | null } | null;
  itens: MeuInsumo[];
}

export async function listarMeusInsumos(): Promise<PrescricaoEmUso[]> {
  const { data } = await api.get("/meus-insumos", { headers: cabecalho("PACIENTE") });
  return data;
}

// ---------------------------------------------------------
// GESTÃO (etapa 5): lista de separação e previsão de demanda
// ---------------------------------------------------------

export interface TotalSeparacao {
  ins_id: number;
  ins_nome: string;
  ins_marca: string | null;
  separar: number;   // a separar (sem quem avisou que não vai)
  nao_vai: number;   // de quem avisou que não vai
  entregue: number;  // já retirado no dia
}

export interface PacienteSeparacao {
  sol_id: number;
  protocolo: string | null;
  turno: Turno;
  primeiro_nome: string;
  presenca: "vou" | "nao_vou" | null;
  situacao: "separar" | "nao_vai" | "entregue";
  retirado_por_nome: string | null;
  itens: { ins_id: number; ins_nome: string; ins_marca: string | null; quantidade: number }[];
}

export interface UnidadeSeparacao {
  pos_id: number;
  pos_nome: string;
  por_insumo: TotalSeparacao[];
  por_paciente: PacienteSeparacao[];
}

export async function buscarSeparacao(data: string): Promise<{ data: string; unidades: UnidadeSeparacao[] }> {
  const { data: r } = await api.get("/agendamentos/separacao", { params: { data }, headers: cabecalho("ADMIN") });
  return r;
}

export interface PrevisaoInsumo {
  ins_id: number;
  ins_nome: string;
  ins_marca: string | null;
  pos_id: number;
  pos_nome: string | null;
  estoque: number;
  agendado: number;   // coletas já agendadas
  recorrente: number; // próximos ciclos de uso contínuo
  a_agendar: number;  // autorizadas esperando a 1ª retirada
  avulso: number;     // média das retiradas avulsas
  necessidade: number;
  saldo: number;
  falta: number;
  acaba_em: string | null;
}

export interface Previsao {
  dias: number;
  de: string;
  ate: string;
  historico_dias: number;
  insumos: PrevisaoInsumo[];
}

export async function buscarPrevisao(dias: number): Promise<Previsao> {
  const { data } = await api.get("/indicadores/previsao", { params: { dias }, headers: cabecalho("ADMIN") });
  return data;
}
