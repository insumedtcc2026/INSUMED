import type { ComItensPrescricao } from "../utils/itensPrescricao";
import type { Prioridade } from "./AgendaService";
import axios from "axios";
import { API_URL } from "../config";


type Perfil = "ADMIN" | "AUTORIZADOR";

const chavesToken: Record<Perfil, string> = {
  ADMIN: "token_admin",
  AUTORIZADOR: "token_autorizador",
};

function cabecalho(perfil: Perfil) {
  return { Authorization: `Bearer ${localStorage.getItem(chavesToken[perfil]) ?? ""}` };
}

// ---------------------------------------------------------
// PERFIL PESSOAL (admin e autorizador)
// ---------------------------------------------------------

export interface PerfilEquipe {
  tipo: Perfil;
  id?: number; // só o autorizador tem id
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  matricula?: string;
  universal?: boolean;
  posto?: { pos_id: number; pos_nome: string; pos_endereco?: string | null } | null;
}

export async function buscarMeuPerfil(perfil: Perfil): Promise<PerfilEquipe> {
  const { data } = await axios.get(`${API_URL}/perfil`, { headers: cabecalho(perfil) });
  return data;
}

export async function atualizarMeuPerfil(
  perfil: Perfil,
  dados: { nome: string; email: string; telefone: string },
): Promise<PerfilEquipe> {
  const { data } = await axios.put(`${API_URL}/perfil`, dados, { headers: cabecalho(perfil) });
  // o admin é identificado pelo e-mail: se ele mudou, o backend manda um token novo
  if (data.token) localStorage.setItem(chavesToken[perfil], data.token);
  return data.perfil;
}

// ---------------------------------------------------------
// HOME DO ADMIN (fila de trabalho)
// ---------------------------------------------------------

export interface PainelAdmin {
  hoje: string;
  unidade: string | null;
  pendentes: number;
  autorizadasSemAgendamento: number;
  coletasHoje: number;
  estoqueBaixo: number;
  limiteEstoqueBaixo: number;
  // pendentes que o paciente já corrigiu (reenvio na mesma solicitação)
  corrigidasParaRevisar: number;
  // reenvio pedido, esperando o paciente
  aguardandoPaciente: number;
  coletas7dias: number;
  proximasColetas: { sol_id: number; protocolo: string | null; data: string; pac_nome: string | null }[];
}

export async function buscarPainelAdmin(): Promise<PainelAdmin> {
  const { data } = await axios.get(`${API_URL}/painel/admin`, { headers: cabecalho("ADMIN") });
  return data;
}

// ---------------------------------------------------------
// HOME DO AUTORIZADOR
// ---------------------------------------------------------

export interface PainelAutorizador {
  aguardando: number;
  comNovaVersao: number;
  autorizadas30: number;
  naoAutorizadas30: number;
  fila: {
    sol_id: number;
    sol_data_solicitacao: string;
    sol_insumo_quant: number | null;
    pac_nome: string;
    ins_nome: string | null;
    versoes_anteriores: number;
    prioridade?: Prioridade;
  }[];
  recentes: { sol_id: number; acao: string; quando: string }[];
}

export async function buscarPainelAutorizador(): Promise<PainelAutorizador> {
  const { data } = await axios.get(`${API_URL}/painel/autorizador`, { headers: cabecalho("AUTORIZADOR") });
  return data;
}

// ---------------------------------------------------------
// DATAS SUGERIDAS PARA AGENDAR
// ---------------------------------------------------------

export interface OpcaoTurno {
  data: string;
  turno: "manha" | "tarde";
  abre: string;
  fecha: string;
  vagas: number | null;
  ocupadas: number;
  livres: number | null; // null = sem limite
}

export interface DatasSugeridas {
  datas: { data: string; agendados: number }[];
  sugeridas: string[];
  // dias e turnos com vaga (horário da unidade, sem os dias fechados)
  opcoes?: OpcaoTurno[];
  // os 3 turnos mais vazios
  sugeridas_turnos?: OpcaoTurno[];
}

export async function buscarDatasSugeridas(pos_id: number): Promise<DatasSugeridas> {
  const { data } = await axios.get(`${API_URL}/agendamentos/datas-sugeridas`, {
    params: { pos_id },
    headers: cabecalho("ADMIN"),
  });
  return data;
}

// ---------------------------------------------------------
// FICHA DO PACIENTE (visão do admin)
// ---------------------------------------------------------

export interface ItemHistoricoPaciente extends ComItensPrescricao {
  sol_id: number;
  sol_status: string;
  sol_protocolo: string | null;
  sol_data_solicitacao: string | null;
  sol_data_de_coleta: string | null;
  sol_data_vencimento: string | null;
  sol_insumo_quant: number | null;
  sol_motivo_nao_autorizado: string | null;
  sol_motivo_reenvio: string | null;
  sol_motivo_cancelamento: string | null;
  sol_origem_id: number | null;
  pos_nome: string | null;
  ins_nome: string | null;
  tem_prescricao: boolean;
  insumos?: { ins_nome: string; quantidade: number }[];
}

export interface FichaPaciente {
  paciente: {
    pac_id: number;
    pac_nome: string;
    pac_cpf: string;
    pac_email: string;
    pac_telefone: string;
    pac_data_nasc: string | null;
    pac_cep: string | null;
    pac_endereco: string | null;
    pac_sexo: string | null;
    pac_raca: string | null;
    // atendimento prioritário declarado pelo paciente (etapa 3)
    pac_pcd?: boolean;
    pac_gestante?: boolean;
    pac_prioridade_conferida?: boolean | null;
    prioridade?: Prioridade;
  };
  prescricoes: ItemHistoricoPaciente[];
  agendamentos: ItemHistoricoPaciente[];
}

export async function buscarFichaPaciente(pac_id: number): Promise<FichaPaciente> {
  const { data } = await axios.get(`${API_URL}/pacientes/${pac_id}/resumo`, { headers: cabecalho("ADMIN") });
  return data;
}

// ---------------------------------------------------------
// ATIVIDADES DA UNIDADE (histórico geral de quem fez o quê)
// ---------------------------------------------------------

export interface Atividade {
  his_id: number;
  sol_id: number;
  acao: string;
  de: string | null;
  para: string | null;
  detalhe: string | null;
  quando: string;
  usuario_tipo: string | null;
  usuario_nome: string | null;
  protocolo: string | null;
  status_atual: string | null;
  pac_id: number | null;
  pac_nome: string | null;
  pos_nome: string | null;
}

export interface FiltrosAtividades {
  data_inicio?: string;
  data_fim?: string;
  acao?: string;
  usuario?: string;
  busca?: string;
  page?: number;
}

export async function buscarAtividades(filtros: FiltrosAtividades) {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== "" && v !== undefined));
  const { data } = await axios.get(`${API_URL}/atividades`, { params, headers: cabecalho("ADMIN") });
  return data as { itens: Atividade[]; total: number; paginaAtual: number; totalPaginas: number };
}
