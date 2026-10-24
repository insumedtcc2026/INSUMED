// Insumos de uma prescrição (etapa 2: uma prescrição pode ter vários).
// O backend devolve `itens` e `insumos_resumo`; prescrições antigas só
// têm ins_nome e sol_insumo_quant.

export interface ItemPrescricao {
  ins_id: number;
  ins_nome: string;
  ins_marca?: string | null;
  quantidade: number;
}

// Campos de insumo que as listas de prescrição recebem do backend
export interface ComItensPrescricao {
  itens?: ItemPrescricao[];
  insumos_resumo?: string | null;
  sol_periodicidade_dias?: number | null;
}

// "30x Bolsa, 4x Placa" (ou o insumo único das prescrições antigas)
export function resumoInsumos(p: {
  insumos_resumo?: string | null;
  ins_nome?: string | null;
  sol_insumo_quant?: number | null;
}): string {
  if (p.insumos_resumo) return p.insumos_resumo;
  return p.ins_nome ? `${p.sol_insumo_quant ?? "—"}x ${p.ins_nome}` : "";
}

// Frequências oferecidas para uso contínuo (dias)
export const FREQUENCIAS = [7, 15, 30, 60, 90];

export const textoFrequencia = (dias?: number | null) =>
  dias ? `Uso contínuo: uma retirada a cada ${dias} dias` : "Retirada única";

// Quantas retiradas cabem de hoje até o vencimento ("YYYY-MM-DD")
export function retiradasAteVencer(vencimento: string, dias: number, hoje = new Date()) {
  if (!vencimento || !dias) return 1;
  const fim = Date.parse(`${vencimento}T00:00:00Z`);
  const inicio = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (Number.isNaN(fim) || fim < inicio) return 0;
  return Math.floor((fim - inicio) / (dias * 86400000)) + 1;
}
