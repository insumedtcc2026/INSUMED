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

// Item digitado no formulário de "Novo Agendamento": o admin só escreve o
// nome do produto (não busca/seleciona um já cadastrado), então ainda não
// existe um ins_id — o backend decide, ao salvar, se reaproveita um insumo
// já existente com esse nome ou cria um novo.
export interface ItemNovoAgendamento {
  ins_nome: string;
  quantidade: number;
}

// Alias para manter compatibilidade com importações existentes
export type InsumoNoAgendamento = InsumoAgendado;

export interface Agendamento {
  sol_id: number;
  sol_data_de_coleta: string | null;
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
  itens: ItemNovoAgendamento[];
}

export interface ResultadoPaginado<T> {
  itens: T[];
  paginaAtual: number;
  totalPaginas: number;
}