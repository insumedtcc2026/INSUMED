// "nao_compareceu": a data passou há mais de 7 dias sem retirada nem remarcação
export type StatusAgendamento = "agendado" | "concluido" | "cancelado" | "nao_compareceu";

export interface Paciente {
  pac_id: number;
  pac_nome: string;
  pac_cpf: string;
  pac_telefone: string;
}

export interface Posto {
  pos_id: number;
  pos_nome: string;
  pos_endereco?: string | null;
  // só dígitos com DDI+DDD (ex.: 5524999999999); vazio = posto sem WhatsApp
  pos_whatsapp?: string | null;
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
  // insumo escolhido no estoque da unidade (o nome fica para exibir)
  ins_id?: number;
  ins_nome: string;
  quantidade: number;
}

// Alias para manter compatibilidade com importações existentes
export type InsumoNoAgendamento = InsumoAgendado;

export interface Agendamento {
  sol_id: number;
  sol_protocolo: string | null;
  sol_data_de_coleta: string | null;
  sol_hora_coleta?: string;
  status: StatusAgendamento;
  // preenchidos quando o admin cancela o agendamento
  sol_motivo_cancelamento?: string | null;
  sol_data_cancelamento?: string | null;
  // prescrição autorizada que originou o agendamento (null nos antigos)
  sol_origem_id?: number | null;
  // uso contínuo: 1 = primeira retirada da prescrição, 2 = segunda...
  sol_ciclo?: number;
  // recado do admin para o paciente (ex.: "traga documento com foto")
  sol_recado?: string | null;
  // data anterior quando o admin remarcou o agendamento
  sol_data_anterior?: string | null;
  // código secreto do QR Code do comprovante (só vem para o próprio paciente)
  sol_codigo_qr?: string | null;
  paciente: Paciente;
  posto: Posto;
  insumos: InsumoNoAgendamento[];
}

export interface NovoAgendamentoPayload {
  paciente: Paciente;
  sol_data_de_coleta: string;
  posto?: Posto;
  itens: ItemNovoAgendamento[];
  sol_origem_id?: number;
  // agendar mesmo com estoque disponível menor que o pedido
  confirmar_sem_estoque?: boolean;
}

export interface ResultadoPaginado<T> {
  itens: T[];
  paginaAtual: number;
  totalPaginas: number;
  total?: number;
}



// Filtros da página única de agendamentos do ADM (substitui as antigas
// páginas separadas de "hoje" / "todos" / "histórico").
export interface FiltrosAgendamento {
  status?: "todos" | StatusAgendamento;
  busca?: string; // nome, CPF ou protocolo
  dataInicio?: string;
  dataFim?: string;
}
// Tela de atendimento aberta pelo leitor de QR Code: só o necessário para
// conferir e concluir/cancelar no balcão (sem telefone, endereço ou prescrição).
export interface AtendimentoAgendamento {
  sol_id: number;
  sol_protocolo: string | null;
  sol_data_de_coleta: string | null;
  status: StatusAgendamento;
  sol_motivo_cancelamento: string | null;
  paciente: { pac_nome: string; pac_cpf_parcial: string | null };
  posto: { pos_nome: string | null };
  prescricao_vencida: boolean;
  // "hoje" no fuso de Brasília, segundo o servidor
  hoje: string;
  insumos: { ins_id: number; ins_nome: string; quantidade: number; estoque: number }[];
}

export interface ResultadoLeituraQR {
  sol_id: number;
  sol_protocolo: string;
  status: StatusAgendamento;
}
