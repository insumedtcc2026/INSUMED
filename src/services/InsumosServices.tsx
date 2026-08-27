import axios from "axios";
import type { InsumoCatalogo } from "../types/agendamento";

const API_URL = "https://backend-insumed-lhac.vercel.app";

export async function buscarInsumos(
  termo: string
): Promise<InsumoCatalogo[]> {
  if (!termo.trim()) return [];

  try {
    const token = localStorage.getItem("accessToken");

    console.log("Termo:", termo);
    console.log("Token:", token);

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

    console.log("Resposta:", resposta.data);

    return resposta.data;
  } catch (error) {
    console.error("Erro ao buscar insumos:", error);
    return [];
  }
}