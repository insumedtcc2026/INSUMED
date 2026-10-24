import axios from "axios";
import type { InsumoCatalogo } from "../types/agendamento";
import { API_URL } from "../config";


export async function buscarInsumos(
  termo: string
): Promise<InsumoCatalogo[]> {
  if (!termo.trim()) return [];

  try {
    const token = localStorage.getItem("token_admin");

    const resposta = await axios.get<InsumoCatalogo[]>(
      `${API_URL}/insumos`,
      {
        params: {
          busca: termo,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return resposta.data;
  } catch (error) {
    console.error("Erro ao buscar insumos:", error);
    return [];
  }
}

export interface InsumoEstoque {
  ins_id: number;
  ins_nome: string;
  ins_marca?: string | null;
  ins_quantidade: number;
  ins_reservado: number;
  ins_disponivel: number;
  pos_id: number | null;
}

/**
 * Estoque de uma unidade, com o reservado em coletas agendadas e o
 * disponível. O admin universal escolhe a unidade; o admin de unidade
 * sempre recebe o próprio estoque (por isso o filtro por pos_id aqui).
 */
export async function listarEstoqueDoPosto(pos_id: number): Promise<InsumoEstoque[]> {
  const token = localStorage.getItem("token_admin");
  const resposta = await axios.get<InsumoEstoque[]>(`${API_URL}/insumos/listar`, {
    params: { pos_id },
    headers: { Authorization: `Bearer ${token}` },
  });
  return resposta.data.filter((i) => Number(i.pos_id) === Number(pos_id));
}
