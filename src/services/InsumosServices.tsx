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