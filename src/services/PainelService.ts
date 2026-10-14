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
  id: number;
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
  return data.perfil;
}

// ---------------------------------------------------------
// HOME DO ADMIN (fila de trabalho)
// ---------------------------------------------------------

export interface PainelAdmin {
  hoje: string;
  pendentes: number;
  autorizadasSemAgendamento: number;
  coletasHoje: number;
  estoqueBaixo: number;
  limiteEstoqueBaixo: number;
}

export async function buscarPainelAdmin(): Promise<PainelAdmin> {
  const { data } = await axios.get(`${API_URL}/painel/admin`, { headers: cabecalho("ADMIN") });
  return data;
}

// ---------------------------------------------------------
// DATAS SUGERIDAS PARA AGENDAR
// ---------------------------------------------------------

export interface DatasSugeridas {
  datas: { data: string; agendados: number }[];
  sugeridas: string[];
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

export interface ItemHistoricoPaciente {
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
  };
  prescricoes: ItemHistoricoPaciente[];
  agendamentos: ItemHistoricoPaciente[];
}

export async function buscarFichaPaciente(pac_id: number): Promise<FichaPaciente> {
  const { data } = await axios.get(`${API_URL}/pacientes/${pac_id}/resumo`, { headers: cabecalho("ADMIN") });
  return data;
}
