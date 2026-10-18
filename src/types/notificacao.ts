// Notificações do sino (backend: /notificacoes)

// Ícone e cor de cada notificação (mesmo padrão do design do sino)
export type TomNotificacao = "agenda" | "sucesso" | "alerta" | "erro" | "info";

export interface Notificacao {
  id: number;
  evento: string;
  tom: TomNotificacao;
  titulo: string;
  mensagem: string;
  prioridade: number;
  link: string | null;
  sol_id: number | null;
  criada_em: string;
  atualizada_em: string;
  lida: boolean;
  lida_em: string | null;
}

export interface ResumoNotificacoes {
  naoLidas: number;
  ultimas: Notificacao[];
}

export interface PaginaNotificacoes {
  itens: Notificacao[];
  total: number;
  paginaAtual: number;
  totalPaginas: number;
  naoLidas: number;
}
