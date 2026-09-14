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

// Usada na LISTAGEM — bate com o que "prescicaodopaciente" retorna
export interface SolicitacaoPaciente {
    sol_id: number;
    sol_data_solicitacao: string;
    sol_status: string;
    sol_observacao: string | null;
    tem_prescricao: boolean;
    sol_prescricao_tipo: string | null; 
}

// DETALHE — bate com o que "detalhesPrescricaoPaciente" retorna
export interface DetalhesPrescricao {
    sol_id: number;
    sol_status: string;
    sol_data_solicitacao: string;
    sol_observacao: string | null;
    sol_prescricao_base64: string | null;
    sol_prescricao_mimetype: string | null; // NOVO
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

// LISTA: chama /solicitacao/pacienteid
export const prescricaopaciente = async (): Promise<SolicitacaoPaciente[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get<SolicitacaoPaciente[]>(
        `${API_URL}/solicitacao/pacienteid`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// DETALHE: chama /solicitacao/:id/detalhes, sob demanda
export const buscarDetalhesPrescricao = async (
    sol_id: number
): Promise<DetalhesPrescricao> => {
    const token = localStorage.getItem("token");
    const response = await axios.get<DetalhesPrescricao>(
        `${API_URL}/solicitacao/${sol_id}/detalhes`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export interface HistoricoPrescricao {

    sol_id: number;

    pac_id: number;

    pac_nome: string;

    pac_cpf: string;

    ins_nome?: string;

    pos_nome?: string;

    sol_status: string;

    sol_data_solicitacao: string;

    sol_data_analise?: string;

    sol_motivo_reenvio?: string;

    sol_observacao?: string;

    sol_prescricao_tipo?: string;
}


export const buscarHistoricoPrescricoes =
    async (): Promise<HistoricoPrescricao[]> => {

        const response =
            await axios.get<HistoricoPrescricao[]>(
                `${API_URL}/prescricoes/historico`
            );

        return response.data;
    };

export async function enviarPrescricao (
  pos_id: number,
  sol_prescricao: string,
  sol_observacao: string,
  sol_prescricao_tipo: string, 
) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/solicitacoes`,
    {
      pos_id,
      sol_prescricao,
      sol_observacao,
      sol_prescricao_tipo,
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