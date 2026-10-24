import axios from "axios";
import { API_URL } from "../config";

// Gestão da equipe da rede (rotas só do administrador universal) e troca
// da própria senha (administrador ou autorizador).

export type PerfilEquipe = "ADMIN" | "AUTORIZADOR";

const chavesToken: Record<PerfilEquipe, string> = {
  ADMIN: "token_admin",
  AUTORIZADOR: "token_autorizador",
};

const cabecalho = (perfil: PerfilEquipe = "ADMIN") => ({
  Authorization: `Bearer ${localStorage.getItem(chavesToken[perfil]) ?? ""}`,
});

export interface Funcionario {
  perfil: PerfilEquipe;
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  matricula?: string | null;
  universal?: boolean;
  unidade: string | null;
  ativo: boolean;
  senha_provisoria: boolean;
}

export type SituacaoConvite = "pendente" | "usado" | "cancelado" | "expirado";

export interface Convite {
  cnv_id: number;
  cnv_perfil: PerfilEquipe;
  pos_id: number | null;
  pos_nome: string | null;
  cnv_criado_em: string;
  cnv_expira_em: string;
  cnv_usado_em: string | null;
  cnv_usado_email: string | null;
  situacao: SituacaoConvite;
}

export interface ConviteCriado {
  cnv_id: number;
  codigo: string;
  perfil: PerfilEquipe;
  posto: { pos_id: number; pos_nome: string } | null;
  expira_em: string;
}

export interface NovoFuncionario {
  perfil: PerfilEquipe;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  matricula?: string;
  posto_id?: number;
}

export async function listarEquipe(): Promise<Funcionario[]> {
  const { data } = await axios.get(`${API_URL}/equipe`, { headers: cabecalho() });
  return data;
}

/** Devolve a senha provisória, que só aparece nesta resposta. */
export async function cadastrarFuncionario(dados: NovoFuncionario): Promise<{ senha_provisoria: string }> {
  const { data } = await axios.post(`${API_URL}/equipe`, dados, { headers: cabecalho() });
  return data;
}

export async function alterarAtivo(perfil: PerfilEquipe, id: number, ativo: boolean) {
  const { data } = await axios.patch(`${API_URL}/equipe/${perfil}/${id}/ativo`, { ativo }, { headers: cabecalho() });
  return data as { message: string };
}

export async function listarConvites(): Promise<Convite[]> {
  const { data } = await axios.get(`${API_URL}/convites`, { headers: cabecalho() });
  return data;
}

export async function criarConvite(perfil: PerfilEquipe, posto_id?: number): Promise<ConviteCriado> {
  const { data } = await axios.post(`${API_URL}/convites`, { perfil, posto_id }, { headers: cabecalho() });
  return data;
}

export async function cancelarConvite(id: number) {
  await axios.delete(`${API_URL}/convites/${id}`, { headers: cabecalho() });
}

/** Link que o convidado abre para se cadastrar. */
export const linkDoConvite = (perfil: PerfilEquipe, codigo: string) =>
  `${window.location.origin}/${perfil === "ADMIN" ? "cadastroadm" : "cadastroaut"}?convite=${encodeURIComponent(codigo)}`;

export async function trocarMinhaSenha(
  perfil: PerfilEquipe,
  dados: { senha_atual: string; nova_senha: string; confirmacao_senha: string },
) {
  const { data } = await axios.put(`${API_URL}/minha-senha`, dados, { headers: cabecalho(perfil) });
  return data as { message: string };
}
