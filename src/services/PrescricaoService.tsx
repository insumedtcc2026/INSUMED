import axios from "axios";
import type { EventoHistorico } from "./HistoricoService";
import { API_URL } from "../config";


export interface PrescricaoPendente {
    sol_id: number;
    pac_id: number;
    sol_status: string;
    sol_data_solicitacao: string;
    pac_nome: string;
    pac_cpf: string;
    sol_prescricao: string;
    pac_avatar: string;
    // true quando a prescrição autorizada já tem agendamento ativo
    agendamento_ativo?: boolean;
    // > 0 = o paciente já reenviou uma versão corrigida
    versoes_anteriores?: number;
}

// Resposta paginada pelo backend (mesmo formato de "Meus agendamentos")
export interface Pagina<T> {
    itens: T[];
    total: number;
    paginaAtual: number;
    totalPaginas: number;
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
      ins_id: number | null;
  ins_nome: string | null;
  sol_insumo_quant: number | null;
}

export const buscarPrescricoesPendentes = async (): Promise<PrescricaoPendente[]> => {

    const token = localStorage.getItem("token_admin");

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
    const token = localStorage.getItem("token_paciente");
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
    const token = localStorage.getItem("token_paciente");
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

     pac_avatar: string;

    sol_data_solicitacao: string;

    sol_data_vencimento?: string;

    sol_data_analise?: string;

    sol_motivo_reenvio?: string;

    sol_motivo_nao_autorizado?: string | null;


    sol_observacao?: string;

    sol_prescricao_tipo?: string;
      ins_id: number | null;
  
  sol_insumo_quant: number | null;
}


export interface FiltrosListaPrescricoes {
    busca?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    porPagina?: number;
}

// Só envia os filtros preenchidos
const semVazios = (filtros: FiltrosListaPrescricoes) =>
    Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ""));

// Histórico da prescrição (admin): busca, filtros e paginação feitos no banco
export const buscarHistoricoPrescricoes = async (
    filtros: FiltrosListaPrescricoes = {},
): Promise<Pagina<HistoricoPrescricao>> => {
    const token = localStorage.getItem("token_admin");
    const response = await axios.get<Pagina<HistoricoPrescricao>>(`${API_URL}/prescricoes/historico`, {
        params: { page: 1, ...semVazios(filtros) },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};



// Prescrições para análise (autorizador): busca, filtros e paginação no banco
export async function buscarPrescricoesAprovadas(
    filtros: FiltrosListaPrescricoes = {},
): Promise<Pagina<PrescricaoAprovada>> {
    const token = localStorage.getItem("token_autorizador");
    const response = await axios.get<Pagina<PrescricaoAprovada>>(`${API_URL}/prescricao/aprovadas`, {
        params: { page: 1, ...semVazios(filtros) },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}
export interface PrescricaoAprovada {
    sol_id: number;
    pac_id: number;
    pos_id: number;
  
    sol_status: string;
    sol_data_solicitacao: string;
    sol_data_vencimento?: string | null;

    sol_motivo_reenvio?: string | null;
    sol_observacao?: string | null;
    sol_prescricao_tipo?: string | null;

    pac_nome: string;
    pac_cpf: string;
    pac_avatar?: string | null;

     ins_id: number | null;
  ins_nome: string | null;
  sol_insumo_quant: number | null;
    pos_nome?: string | null;
    // > 0 = o paciente reenviou uma versão corrigida antes da revisão
    versoes_anteriores?: number;
}



export async function enviarPrescricao (
  pos_id: number,
  sol_prescricao: string,
  sol_observacao: string,
  sol_prescricao_tipo: string, 
) {
  const token = localStorage.getItem("token_paciente");

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
// ---------------------------------------------------------
// RASTREIO DAS PRESCRIÇÕES (paciente): cada prescrição com o
// agendamento mais recente feito a partir dela e a linha do tempo
// ---------------------------------------------------------

export interface AgendamentoDaPrescricao {
    sol_id: number;
    sol_status: "agendado" | "concluido" | "cancelado";
    sol_protocolo: string | null;
    sol_data_de_coleta: string | null;
    sol_motivo_cancelamento: string | null;
    sol_data_cancelamento?: string | null;
    sol_recado: string | null;
    pos_nome: string | null;
    pos_endereco: string | null;
    pos_whatsapp?: string | null;
}

// Agendamento cancelado antes do atual (continua no histórico)
export interface AgendamentoCancelado {
    sol_id: number;
    sol_protocolo: string | null;
    sol_data_de_coleta: string | null;
    sol_motivo_cancelamento: string | null;
    sol_data_cancelamento: string | null;
}

export interface MinhaPrescricao {
    sol_id: number;
    sol_status: string;
    sol_data_solicitacao: string;
    sol_data_vencimento: string | null;
    sol_observacao: string | null;
    sol_prescricao_tipo: string | null;
    sol_insumo_quant: number | null;
    sol_motivo_nao_autorizado: string | null;
    sol_motivo_reenvio: string | null;
    pos_id?: number | null;
    pos_nome: string | null;
    pos_whatsapp?: string | null;
    ins_nome: string | null;
    tem_prescricao: boolean;
    versoes_anteriores?: number;
    agendamento: AgendamentoDaPrescricao | null;
    agendamentos_cancelados?: AgendamentoCancelado[];
    eventos: EventoHistorico[];
}

export interface PaginaMinhasPrescricoes extends Pagina<MinhaPrescricao> {
    contagem: { andamento: number; encerradas: number };
}

// Uma página de uma aba ("andamento" ou "encerradas"), paginada no banco
export const buscarMinhasPrescricoes = async (
    situacao: "andamento" | "encerradas",
    page = 1,
    porPagina = 10,
): Promise<PaginaMinhasPrescricoes> => {
    const token = localStorage.getItem("token_paciente");
    const response = await axios.get<PaginaMinhasPrescricoes>(`${API_URL}/minhas-prescricoes`, {
        params: { situacao, page, porPagina },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Reenvio feito pelo paciente DENTRO da mesma solicitação (após pedido da unidade)
export async function corrigirPrescricao(
    sol_id: number,
    sol_prescricao: string,
    sol_prescricao_tipo: string,
    sol_observacao: string,
): Promise<{ message: string; sol_id: number; versao: number }> {
    const token = localStorage.getItem("token_paciente");
    const response = await axios.patch(
        `${API_URL}/solicitacao/${sol_id}/corrigir`,
        { sol_prescricao, sol_prescricao_tipo, sol_observacao },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
}
