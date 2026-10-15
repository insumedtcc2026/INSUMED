import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, CalendarCheck, CalendarClock, CalendarPlus, ClipboardList, History, PackageX, RotateCcw, Stethoscope, Users,
} from "lucide-react";
import { buscarPainelAdmin, type PainelAdmin } from "../../services/PainelService";
import { formatarData } from "../../utils/status";
import { nomeCurto, primeiroNome } from "../../utils/nome";

type Numero = keyof Pick<
  PainelAdmin,
  "pendentes" | "autorizadasSemAgendamento" | "coletasHoje" | "aguardandoPaciente" | "coletas7dias" | "estoqueBaixo"
>;

export interface CartaoPainel<P, K extends keyof P> {
  chave: K;
  titulo: (n: number, painel: P) => string;
  detalhe?: (painel: P) => string | null;
  vazio: string;
  link: string;
  Icone: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  cor: string;
}

type Cartao = CartaoPainel<PainelAdmin, Numero>;

// Primeiro o que depende de uma ação da unidade; depois acompanhamento.
const PRIORIDADES: Cartao[] = [
  {
    chave: "pendentes",
    titulo: (n) => (n === 1 ? "prescrição para revisar" : "prescrições para revisar"),
    detalhe: (p) =>
      p.corrigidasParaRevisar > 0
        ? `${p.corrigidasParaRevisar} ${p.corrigidasParaRevisar === 1 ? "reenviada" : "reenviadas"} pelo paciente`
        : null,
    vazio: "Nenhuma prescrição esperando revisão",
    link: "/VerSolicitaçoes?status=Pendente",
    Icone: ClipboardList,
    cor: "text-amber-600 bg-amber-50",
  },
  {
    chave: "autorizadasSemAgendamento",
    titulo: (n) => (n === 1 ? "autorizada para agendar" : "autorizadas para agendar"),
    vazio: "Nenhuma autorizada esperando agendamento",
    link: "/VerSolicitaçoes?status=ParaAgendar",
    Icone: Stethoscope,
    cor: "text-blue-700 bg-blue-50",
  },
  {
    chave: "coletasHoje",
    titulo: (n) => (n === 1 ? "coleta marcada para hoje" : "coletas marcadas para hoje"),
    vazio: "Nenhuma coleta marcada para hoje",
    link: "/coletas-hoje",
    Icone: CalendarCheck,
    cor: "text-green-700 bg-green-50",
  },
];

const ACOMPANHAMENTO: Cartao[] = [
  {
    chave: "aguardandoPaciente",
    titulo: (n) => (n === 1 ? "reenvio aguardando o paciente" : "reenvios aguardando o paciente"),
    vazio: "Nenhum reenvio aguardando o paciente",
    link: "/Historicodaprescricao",
    Icone: RotateCcw,
    cor: "text-orange-700 bg-orange-50",
  },
  {
    chave: "coletas7dias",
    titulo: (n) => (n === 1 ? "coleta nos próximos 7 dias" : "coletas nos próximos 7 dias"),
    vazio: "Nenhuma coleta nos próximos 7 dias",
    link: "/Agendamentosadm",
    Icone: CalendarClock,
    cor: "text-indigo-700 bg-indigo-50",
  },
  {
    chave: "estoqueBaixo",
    titulo: (n, p) => `${n === 1 ? "insumo" : "insumos"} com estoque baixo (até ${p.limiteEstoqueBaixo})`,
    vazio: "Nenhum insumo com estoque baixo",
    link: "/insumos",
    Icone: PackageX,
    cor: "text-rose-700 bg-rose-50",
  },
];

const ATALHOS = [
  { texto: "Novo agendamento", link: "/Agendamentosadm?novo=1", Icone: CalendarPlus },
  { texto: "Pacientes", link: "/Pacientesadm", Icone: Users },
  { texto: "Histórico da prescrição", link: "/Historicodaprescricao", Icone: History },
  { texto: "Atividades da unidade", link: "/atividades", Icone: Activity },
];

/** Cartões com número e atalho (usado nas Homes do admin e do autorizador). */
export function CartoesPainel<P, K extends keyof P>({
  cartoes, painel, destaque = false,
}: { cartoes: CartaoPainel<P, K>[]; painel: P | null; destaque?: boolean }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cartoes.map(({ chave, titulo, detalhe, vazio, link, Icone, cor }) => {
        const n = painel ? Number(painel[chave]) : undefined;
        const extra = painel && detalhe ? detalhe(painel) : null;
        return (
          <li key={String(chave)}>
            <Link
              to={link}
              className={`flex h-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
                destaque && n ? "ring-blue-200" : "ring-gray-100"
              }`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cor}`}>
                <Icone className="h-6 w-6" aria-hidden={true} />
              </span>
              <span className="min-w-0">
                {painel && n === 0 ? (
                  <span className="block text-sm text-gray-500">{vazio}</span>
                ) : (
                  <>
                    <span className="block text-3xl font-bold leading-none text-gray-900">{painel ? n : "…"}</span>
                    <span className="mt-1 block text-sm text-gray-600">{painel ? titulo(n ?? 0, painel) : "carregando"}</span>
                    {extra && <span className="mt-0.5 block text-xs font-medium text-amber-700">{extra}</span>}
                  </>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Faixa de boas-vindas das Homes da equipe (data, nome e unidade). */
export function BoasVindasEquipe({ nome, subtitulo }: { nome?: string; subtitulo?: string | null }) {
  const hojeExtenso = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const primeiro = primeiroNome(nome);
  return (
    <header className="mb-6 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white shadow-sm sm:p-6">
      <p className="text-sm first-letter:uppercase opacity-90">{hojeExtenso}</p>
      <h2 id="painel-titulo" className="mt-1 text-2xl font-semibold sm:text-3xl">
        {primeiro ? `Olá, ${primeiro}!` : "Olá!"}
      </h2>
      {subtitulo && <p className="mt-1 text-sm opacity-90">{subtitulo}</p>}
    </header>
  );
}

/**
 * Home do admin: o que precisa de uma ação da unidade agora, o que está em
 * acompanhamento, as próximas coletas e os atalhos. Todos os números vêm do
 * banco (/painel/admin), já limitados ao posto do administrador.
 */
export default function FilaTrabalhoAdmin({ nome }: { nome?: string }) {
  const [painel, setPainel] = useState<PainelAdmin | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    buscarPainelAdmin().then(setPainel).catch(() => setErro(true));
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6" aria-labelledby="painel-titulo">
      <BoasVindasEquipe nome={nome} subtitulo={painel?.unidade} />

      {erro && (
        <p className="mb-4 text-sm text-rose-600" role="alert">
          Não foi possível carregar os números agora. Os atalhos continuam funcionando.
        </p>
      )}

      <h3 className="mb-3 text-lg font-semibold text-gray-800">Precisa da sua ação</h3>
      <CartoesPainel cartoes={PRIORIDADES} painel={painel} destaque />

      <h3 className="mb-3 mt-8 text-lg font-semibold text-gray-800">Em acompanhamento</h3>
      <CartoesPainel cartoes={ACOMPANHAMENTO} painel={painel} />

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100" aria-labelledby="proximas-coletas">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 id="proximas-coletas" className="text-lg font-semibold text-gray-800">Próximas coletas</h3>
            <Link to="/Agendamentosadm" className="inline-flex min-h-10 items-center text-sm font-semibold text-blue-700 hover:underline">
              Ver agenda
            </Link>
          </div>
          {!painel && !erro && <p className="text-sm text-gray-400" role="status">Carregando…</p>}
          {painel && painel.proximasColetas.length === 0 && (
            <p className="text-sm text-gray-500">Nenhuma coleta agendada a partir de hoje.</p>
          )}
          <ul className="divide-y divide-gray-100">
            {painel?.proximasColetas.map((c) => (
              <li key={c.sol_id}>
                <Link
                  to={`/Agendamentosadm?busca=${encodeURIComponent(c.protocolo ?? String(c.sol_id))}`}
                  className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-1 py-2 hover:bg-gray-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-gray-800">{nomeCurto(c.pac_nome) || "Paciente"}</span>
                    <span className="block text-xs text-gray-500">{c.protocolo ?? `Agendamento ${c.sol_id}`}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {formatarData(c.data)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100" aria-label="Atalhos">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Atalhos</h3>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {ATALHOS.map(({ texto, link, Icone }) => (
              <li key={link}>
                <Link to={link} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                  <Icone className="h-5 w-5 shrink-0 text-blue-600" aria-hidden={true} />
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
