import axios from "axios";

const API_URL = "https://backend-insumed-lhac.vercel.app";

export interface PrescricaoPendente {
    sol_id: number;
    pac_id: number;
    sol_status: string;
    sol_data_solicitacao: string;
    pac_nome: string;
    pac_cpf: string;
    sol_prescricao: string;
}

export const buscarPrescricoesPendentes = async (): Promise<PrescricaoPendente[]> => {

    const token = localStorage.getItem("token");

    const response = await axios.get<PrescricaoPendente[]>(
        `${API_URL}/pendentes`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;

  };

export const prescricaopaciente = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/solicitacao/pacienteid`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export async function enviarPrescricao (
  pos_id: number,
  sol_prescricao: string,
  sol_observacao: string,
  sol_status: string,
  sol_data_solicitacao: string

) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/solicitacoes`,
    {
      pos_id,
      sol_prescricao,
      sol_observacao,
      sol_status,
      sol_data_solicitacao
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
 