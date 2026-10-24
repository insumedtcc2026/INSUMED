import { useEffect, useState } from "react";
import { buscarPainelAdmin, type PainelAdmin } from "../services/PainelService";
import { listarAgendamentosPaginado } from "../services/AgendamentoService";
import type { ChaveContador } from "../components/universais/menuAdmin";

export type ContadoresAdmin = Record<ChaveContador, number> & { unidade: string | null; painel: PainelAdmin };

// O menu é montado de novo a cada página: os números ficam guardados por
// um minuto para não repetir as mesmas chamadas a cada clique.
const VALIDADE_MS = 60_000;
let guardado: { quando: number; dados: ContadoresAdmin } | null = null;
let emAndamento: Promise<ContadoresAdmin> | null = null;

async function buscar(): Promise<ContadoresAdmin> {
  const [painel, pedidos] = await Promise.all([
    buscarPainelAdmin(),
    listarAgendamentosPaginado({ status: "todos", pedido: "pendente" }, 1, 1).catch(() => ({ total: 0 })),
  ]);
  return {
    painel,
    unidade: painel.unidade,
    coletasHoje: painel.coletasHoje,
    pendentes: painel.pendentes,
    estoqueBaixo: painel.estoqueBaixo,
    pedidosOutraData: pedidos.total ?? 0,
  };
}

export function carregarContadoresAdmin(forcar = false): Promise<ContadoresAdmin> {
  if (!forcar && guardado && Date.now() - guardado.quando < VALIDADE_MS) return Promise.resolve(guardado.dados);
  if (!emAndamento) {
    emAndamento = buscar()
      .then((dados) => {
        guardado = { quando: Date.now(), dados };
        window.dispatchEvent(new CustomEvent("contadores-admin", { detail: dados }));
        return dados;
      })
      .finally(() => {
        emAndamento = null;
      });
  }
  return emAndamento;
}

/** Depois de concluir, cancelar ou agendar: o menu busca os números de novo. */
export function atualizarContadoresAdmin() {
  carregarContadoresAdmin(true).catch(() => {});
}

/** Contadores do menu do admin (null enquanto carrega ou se falhar). */
export function useContadoresAdmin(): ContadoresAdmin | null {
  const [dados, setDados] = useState<ContadoresAdmin | null>(guardado?.dados ?? null);

  useEffect(() => {
    let ativo = true;
    carregarContadoresAdmin()
      .then((d) => ativo && setDados(d))
      .catch(() => {
        /* sem números: o menu continua funcionando */
      });
    const ouvir = (e: Event) => setDados((e as CustomEvent<ContadoresAdmin>).detail);
    window.addEventListener("contadores-admin", ouvir);
    return () => {
      ativo = false;
      window.removeEventListener("contadores-admin", ouvir);
    };
  }, []);

  return dados;
}
