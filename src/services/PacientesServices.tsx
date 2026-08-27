import axios from "axios";
import type { Paciente } from "../types/agendamento";

const API_URL = "https://backend-insumed-lhac.vercel.app";

export async function buscarPacientesPorCpf(
  termo: string
): Promise<Paciente[]> {
  if (!termo.trim()) return [];

  try {
    const token = localStorage.getItem("token");

    const resposta = await axios.get<Paciente[]>(
      `${API_URL}/pacientes`,
      {
        params: {
          cpf: termo,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return resposta.data;
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
}