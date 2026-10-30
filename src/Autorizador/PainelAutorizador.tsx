import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardCheck, FilePlus2, Gavel, ListOrdered, XCircle } from "lucide-react";
import { buscarPainelAutorizador, type PainelAutorizador as Painel } from "../services/PainelService";
import { Cartao, CartoesAcao, type Acao } from "../components/universais/FilaTrabalhoAdmin";
import { AvatarIniciais } from "../components/universais/AdminUI";
import { formatarData } from "../utils/status";
import { formatarDataHora } from "../utils/acoesHistorico";
import { nomeCurto } from "../utils/nome";
import SeloPrioridade from "../components/universais/SeloPrioridade";
import { resumoInsumos } from "../utils/itensPrescricao";

/**
 * Home do autorizador, no mesmo padrão da Home do administrador: três
 * cartões com o que espera a decisão dele, a fila (da prioridade legal e
 * da mais antiga para a mais nova) e as decisões recentes. A saudação e a
 * data ficam na barra superior. Os números vêm do banco (/painel/autorizador).
 */
export default function PainelAutorizador() {
  const [painel, setPainel] = useState<Painel | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    buscarPainelAutorizador().then(setPainel).catch(() => setErro(true));
  }, []);

  const n = (v: number | undefined) => (painel ? v ?? 0 : null);
  const decididas = painel ? painel.autorizadas30 + painel.naoAutorizadas30 : null;

  const ACOES: Acao[] = [
    {
      n: n(painel?.aguardando),
      rotulo: "Aguardando sua análise",
      detalhe: "Já revisadas pela unidade",
      verbo: "Analisar agora",
      link: "/verprescricoesaprovadas",
      Icone: ClipboardCheck,
      cor: "#0042ec",
      fundo: "#e8f0ff",
    },
    {
      n: n(painel?.comNovaVersao),
      rotulo: "Com nova versão",
      detalhe: "O paciente reenviou a prescrição",
      verbo: "Ver na fila",
      link: "/verprescricoesaprovadas",
      Icone: FilePlus2,
      cor: "#0042ec",
      fundo: "#e8f0ff",
    },
    {
      n: decididas,
      rotulo: "Suas decisões em 30 dias",
      detalhe: painel ? `${painel.autorizadas30} autorizadas · ${painel.naoAutorizadas30} não autorizadas` : "Autorizadas e não autorizadas",
      verbo: "Ver histórico",
      link: "/verprescricoesaprovadas?status=Todos",
      Icone: Gavel,
      cor: "#0042ec",
      fundo: "#e8f0ff",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8" aria-labelledby="painel-aut-titulo">
      <h2 id="painel-aut-titulo" className="sr-only">Painel do autorizador</h2>

      {erro && (
        <p className="mb-4 text-sm text-rose-600" role="alert">
          Não foi possível carregar os números agora. A lista de prescrições continua disponível.
        </p>
      )}

      <CartoesAcao acoes={ACOES} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.65fr_1fr]">
        <Cartao titulo="Próximas da fila" Icone={ListOrdered} corIcone="text-blue-700" link="/verprescricoesaprovadas" textoLink="Ver todas">
          {!painel && !erro && <p className="px-5 py-6 text-sm text-gray-400" role="status">Carregando…</p>}
          {painel && painel.fila.length === 0 && (
            <p className="px-5 py-6 text-sm text-gray-500">A fila está vazia. Nenhuma prescrição esperando a sua decisão.</p>
          )}
          <ul className="px-5 py-1">
            {painel?.fila.map((p) => (
              <li key={p.sol_id}>
                <Link
                  to={`/autorizador/solicitacao/${p.sol_id}`}
                  className="flex min-h-14 items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0 hover:bg-gray-50"
                >
                  <AvatarIniciais nome={p.pac_nome} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-800">
                      {nomeCurto(p.pac_nome)}
                      {p.prioridade?.motivo ? <SeloPrioridade prioridade={p.prioridade} /> : null}
                      {p.versoes_anteriores > 0 && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">Nova versão</span>
                      )}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      nº {p.sol_id} · enviada em {formatarData(p.sol_data_solicitacao)}
                      {resumoInsumos(p) ? ` · ${resumoInsumos(p)}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-blue-700 [font-family:var(--fonte-botao)]">
                    Analisar <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao titulo="Decisões recentes" Icone={Gavel} corIcone="text-blue-700" link="/verprescricoesaprovadas?status=Todos" textoLink="Ver tudo">
          {!painel && !erro && <p className="px-5 py-6 text-sm text-gray-400" role="status">Carregando…</p>}
          {painel && painel.recentes.length === 0 && (
            <p className="px-5 py-6 text-sm text-gray-500">Você ainda não decidiu nenhuma prescrição.</p>
          )}
          <ol className="px-5 py-1">
            {painel?.recentes.map((r) => {
              const autorizada = r.acao === "autorizada";
              const Icone = autorizada ? CheckCircle2 : XCircle;
              return (
                <li key={`${r.sol_id}-${r.quando}`}>
                  <Link
                    to={`/autorizador/solicitacao/${r.sol_id}`}
                    className="flex min-h-12 items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0 hover:bg-gray-50"
                  >
                    <Icone size={19} className={`shrink-0 ${autorizada ? "text-green-600" : "text-rose-600"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-800">
                        {autorizada ? "Autorizada" : "Não autorizada"} · nº {r.sol_id}
                      </span>
                      <span className="block text-xs text-gray-500">{formatarDataHora(r.quando)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Cartao>
      </div>
    </section>
  );
}
