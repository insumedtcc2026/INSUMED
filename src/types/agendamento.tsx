export type StatusAgendamento = "agendado" | "concluido" | "cancelado";

export interface Paciente {
  pac_id: number;
  pac_nome: string;
  pac_cpf: string;
  pac_telefone: string;
}

export interface Posto {
  pos_id: number;
  pos_nome: string;
}

export interface InsumoCatalogo {
  ins_id: number;
  ins_nome: string;
  ins_quantidade: number;
}

export interface InsumoAgendado {
  ins_id: number;
  ins_nome: string;
  quantidade: number;
}

export interface InsumoNoAgendamento {
  ins_id: number;
  ins_nome: string;
  quantidade: number;
}

export interface Agendamento {
  sol_id: number;
  sol_data_de_coleta: string;
  sol_hora_coleta?: string;
  status: StatusAgendamento;
  paciente: Paciente;
  posto: Posto;
  insumos: InsumoNoAgendamento[];
}

export interface NovoAgendamentoPayload {
  paciente: Paciente;
  sol_data_de_coleta: string;
  posto?: Posto;
  itens: InsumoAgendado[];
}

export interface ResultadoPaginado<T> {
  itens: T[];
  paginaAtual: number;
  totalPaginas: number;
}
