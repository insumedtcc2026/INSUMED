import axios from "axios";
import type { Paciente } from "../types/agendamento";
import { API_URL } from "../config";


export async function buscarPacientesPorCpf(
  termo: string
): Promise<Paciente[]> {
  if (!termo.trim()) return [];

  try {
    const token = localStorage.getItem("token_admin");

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