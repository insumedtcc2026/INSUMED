import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ClipboardCheck, FilePlus2, XCircle } from "lucide-react";
import { buscarPainelAutorizador, type PainelAutorizador as Painel } from "../services/PainelService";
import { BoasVindasEquipe, CartoesPainel, type CartaoPainel } from "../components/universais/FilaTrabalhoAdmin";
import { formatarData } from "../utils/status";
import { formatarDataHora } from "../utils/acoesHistorico";
import { nomeCurto } from "../utils/nome";
import SeloPrioridade from "../components/universais/SeloPrioridade";
import { resumoInsumos } from "../utils/itensPrescricao";

type Numero = keyof Pick<Painel, "aguardando" | "comNovaVersao" | "autorizadas30" | "naoAutorizadas30">;

const ANALISE: CartaoPainel<Painel, Numero>[] = [
  {
    chave: "aguardando",
    titulo: (n) => (n === 1 ? "prescrição aguardando sua análise" : "prescrições aguardando sua análise"),
    vazio: "Nenhuma prescrição aguardando análise",
    link: "/verprescricoesaprovadas",
    Icone: ClipboardCheck,
    cor: "text-amber-600 bg-amber-50",
  },
  {
    chave: "comNovaVersao",
    titulo: (n) => (n === 1 ? "com nova versão enviada pelo paciente" : "com novas versões enviadas pelo paciente"),
    vazio: "Nenhuma prescrição com nova versão",
    link: "/verprescricoesaprovadas",
    Icone: FilePlus2,
    cor: "text-blue-700 bg-blue-50",
  },
];

const DECISOES: CartaoPainel<Painel, Numero>[] = [
  {
    chave: "autorizadas30",
    titulo: (n) => (n === 1 ? "autorizada por você (30 dias)" : "autorizadas por você (30 dias)"),
    vazio: "Nenhuma autorização sua nos últimos 30 dias",
    link: "/verprescricoesaprovadas?status=Autorizado",
    Icone: CheckCircle2,
    cor: "text-green-700 bg-green-50",
  },
  {
    chave: "naoAutorizadas30",
    titulo: (n) => (n === 1 ? "não autorizada por você (30 dias)" : "não autorizadas por você (30 dias)"),
    vazio: "Nenhuma não autorização sua nos últimos 30 dias",
    link: "/verprescricoesaprovadas?status=Nao%20Autorizado",
    Icone: XCircle,
    cor: "text-rose-700 bg-rose-50",
  },
];

/**
 * Home do autorizador: o que espera a decisão dele (a fila, da mais antiga
 * para a mais nova), o que chegou com nova versão e as próprias decisões
 * recentes. Os números vêm do banco (/painel/autorizador).
 */
export default function PainelAutorizador({ nome }: { nome?: string }) {
  const [painel, setPainel] = useState<Painel | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    buscarPainelAutorizador().then(setPainel).catch(() => setErro(true));
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6" aria-labelledby="painel-titulo">
      <BoasVindasEquipe nome={nome} subtitulo="Análise de prescrições" />

      {erro && (
        <p className="mb-4 text-sm text-rose-600" role="alert">
          Não foi possível carregar os números agora. A lista de prescrições continua disponível.
        </p>
      )}

      <h3 className="mb-3 text-lg font-semibold text-gray-800">Para analisar</h3>
      <CartoesPainel cartoes={ANALISE} painel={painel} destaque />

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100" aria-labelledby="proximas-fila">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 id="proximas-fila" className="text-lg font-semibold text-gray-800">Próximas da fila</h3>
            <Link to="/verprescricoesaprovadas" className="inline-flex min-h-10 items-center text-sm font-semibold text-blue-700 hover:underline">
              Ver todas
            </Link>
          </div>
          {!painel && !erro && <p className="text-sm text-gray-400" role="status">Carregando…</p>}
          {painel && painel.fila.length === 0 && <p className="text-sm text-gray-500">A fila está vazia.</p>}
          <ul className="divide-y divide-gray-100">
            {painel?.fila.map((p) => (
              <li key={p.sol_id}>
                <Link to={`/autorizador/solicitacao/${p.sol_id}`} className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-1 py-2 hover:bg-gray-50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-gray-800">
                      Nº {p.sol_id} · {nomeCurto(p.pac_nome)}
                      {p.prioridade?.motivo ? <span className="ml-2 align-middle"><SeloPrioridade prioridade={p.prioridade} /></span> : null}
                    </span>
                    <span className="block text-xs text-gray-500">
                      Enviada em {formatarData(p.sol_data_solicitacao)}
                      {resumoInsumos(p) ? ` · ${resumoInsumos(p)}` : ""}
                    </span>
                    {p.versoes_anteriores > 0 && (
                      <span className="mt-0.5 block text-xs font-medium text-blue-700">Nova versão do paciente</span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-blue-700">Analisar →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100" aria-labelledby="minhas-decisoes">
          <h3 id="minhas-decisoes" className="mb-3 text-lg font-semibold text-gray-800">Suas decisões</h3>
          <CartoesPainel cartoes={DECISOES} painel={painel} />
          {painel && painel.recentes.length > 0 && (
            <ul className="mt-4 divide-y divide-gray-100">
              {painel.recentes.map((r) => (
                <li key={`${r.sol_id}-${r.quando}`}>
                  <Link to={`/autorizador/solicitacao/${r.sol_id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-sm hover:bg-gray-50">
                    <span>
                      Nº {r.sol_id} · {r.acao === "autorizada" ? "Autorizada" : "Não autorizada"}
                    </span>
                    <span className="text-xs text-gray-500">{formatarDataHora(r.quando)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
