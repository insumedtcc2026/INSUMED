import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, PackageCheck, Printer, UserX } from "lucide-react";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { useValidarToken } from "../hook/Validartoken";
import { buscarSeparacao, type PacienteSeparacao, type UnidadeSeparacao } from "../services/AgendaService";
import { ROTULO_TURNO, TURNOS } from "../utils/agenda";
import { formatarData } from "../utils/status";
import { hojeISO, mensagemErroApi } from "../utils/validacoes";
import "../css/universais/ListaSeparacao.css";

const somarDias = (iso: string, dias: number) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
};

const diaDaSemana = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "long", timeZone: "UTC" });

/**
 * Lista de separação: na véspera (ou de manhã), tudo o que a unidade
 * precisa separar para as coletas do dia, somado por insumo e por paciente.
 * Quem avisou que não vai aparece riscado e fica fora do total.
 */
export default function ListaSeparacao() {
  const { verificando } = useValidarToken("ADMIN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hoje = hojeISO();
  const amanha = somarDias(hoje, 1);
  const [data, setData] = useState(amanha);
  const [unidades, setUnidades] = useState<UnidadeSeparacao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setErro(null);
    setUnidades(null);
    buscarSeparacao(data)
      .then((r) => setUnidades(r.unidades))
      .catch((e) => setErro(mensagemErroApi(e, "Não foi possível montar a lista de separação.")));
  }, [data]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const chip = (ativo: boolean) =>
    `min-h-11 rounded-full px-4 text-sm font-semibold ${
      ativo ? "bg-blue-700 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
    }`;
  const temColetas = Boolean(unidades?.length);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/coletas-hoje" />
      </div>

      <main className="separacao-impressao mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Lista de separação</h1>
            <p className="text-sm text-gray-500">
              <span className="capitalize">{diaDaSemana(data)}</span>, {formatarData(data)}
              <span className="nao-imprimir">: o que separar para as coletas do dia, por insumo e por paciente.</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!temColetas}
            className="nao-imprimir flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <Printer aria-hidden="true" className="h-4 w-4" /> Imprimir lista
          </button>
        </header>

        <div className="nao-imprimir mb-6 flex flex-wrap items-end gap-2" role="group" aria-label="Dia da lista">
          <button type="button" className={chip(data === hoje)} aria-pressed={data === hoje} onClick={() => setData(hoje)}>Hoje</button>
          <button type="button" className={chip(data === amanha)} aria-pressed={data === amanha} onClick={() => setData(amanha)}>Amanhã</button>
          <label className="!flex-row items-center gap-2 text-sm font-medium text-gray-600">
            Outra data
            <input
              type="date"
              value={data}
              onChange={(e) => e.target.value && setData(e.target.value)}
              className="!w-auto min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-base sm:text-sm"
            />
          </label>
        </div>

        {erro && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button type="button" onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Tentar novamente
            </button>
          </div>
        )}
        {!erro && !unidades && <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>}
        {unidades && unidades.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <PackageCheck aria-hidden="true" className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-gray-600">Nenhuma coleta marcada para {formatarData(data)}.</p>
            <Link to="/Agendamentosadm" className="mt-2 inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
              Ver a agenda →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {unidades?.map((u) => <Unidade key={u.pos_id} unidade={u} varias={unidades.length > 1} data={data} />)}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Unidade({ unidade: u, varias, data }: { unidade: UnidadeSeparacao; varias: boolean; data: string }) {
  const aSeparar = u.por_paciente.filter((p) => p.situacao === "separar").length;
  const naoVao = u.por_paciente.filter((p) => p.situacao === "nao_vai").length;
  const entregues = u.por_paciente.filter((p) => p.situacao === "entregue").length;
  const titulo = `separacao-${u.pos_id}`;

  return (
    <section className="separacao-unidade rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby={titulo}>
      <h2 id={titulo} className="text-lg font-semibold text-gray-900">
        {u.pos_nome}
        {varias && <span className="so-impressao hidden text-sm font-normal"> · {formatarData(data)}</span>}
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        {aSeparar} {aSeparar === 1 ? "coleta a separar" : "coletas a separar"}
        {naoVao > 0 && ` · ${naoVao} ${naoVao === 1 ? "avisou" : "avisaram"} que não vai`}
        {entregues > 0 && ` · ${entregues} já ${entregues === 1 ? "retirou" : "retiraram"}`}
      </p>

      <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500">Total por insumo</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th scope="col" className="py-2 pr-3 font-medium">Insumo</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Separar</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Não vão</th>
              <th scope="col" className="py-2 text-right font-medium">Já entregue</th>
            </tr>
          </thead>
          <tbody>
            {u.por_insumo.map((i) => (
              <tr key={i.ins_id} className="border-b border-gray-100">
                <th scope="row" className="py-2.5 pr-3 font-medium text-gray-900">
                  {i.ins_nome}
                  {i.ins_marca && <span className="font-normal text-gray-500"> · {i.ins_marca}</span>}
                </th>
                <td className="py-2.5 pr-3 text-right text-lg font-bold tabular-nums text-gray-900">{i.separar}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-gray-500">{i.nao_vai || "—"}</td>
                <td className="py-2.5 text-right tabular-nums text-gray-500">{i.entregue || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {TURNOS.map((t) => {
        const doTurno = u.por_paciente.filter((p) => p.turno === t);
        if (!doTurno.length) return null;
        return (
          <div key={t} className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Por paciente · {ROTULO_TURNO[t]}
            </h3>
            <ul className="mt-2 divide-y divide-gray-100">
              {doTurno.map((p) => <LinhaPaciente key={p.sol_id} p={p} />)}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function LinhaPaciente({ p }: { p: PacienteSeparacao }) {
  const riscado = p.situacao === "nao_vai";
  return (
    <li className="flex flex-wrap items-start gap-x-3 gap-y-1 py-3">
      {/* quadradinho para marcar à mão na lista impressa */}
      <span aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-gray-300" />
      <div className={`min-w-0 flex-1 ${riscado ? "separacao-riscado text-gray-400" : "text-gray-900"}`}>
        <p className="text-base font-semibold">
          {p.primeiro_nome}
          <span className="ml-2 font-mono text-sm font-normal text-gray-500">{p.protocolo ?? `#${p.sol_id}`}</span>
        </p>
        <p className="text-sm">{p.itens.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(" · ") || "Sem itens"}</p>
      </div>
      {p.situacao === "nao_vai" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
          <UserX aria-hidden="true" className="h-3.5 w-3.5" /> Avisou que não vai
        </span>
      )}
      {p.situacao === "entregue" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
          {p.retirado_por_nome ? `Entregue a ${p.retirado_por_nome}` : "Entregue"}
        </span>
      )}
      {p.situacao === "separar" && p.presenca === "vou" && (
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">Confirmou</span>
      )}
    </li>
  );
}
