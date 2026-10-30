import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, CalendarClock, CalendarDays, CalendarSync, ClipboardCheck, ClipboardList, Eye, ListChecks,
  PackageX, QrCode, RotateCcw, Stethoscope, Sunrise, Sunset,
} from "lucide-react";
import type { Atividade } from "../../services/PainelService";
import { buscarAtividades } from "../../services/PainelService";
import { listarAgendamentos } from "../../services/AgendamentoService";
import { listarEstoqueAdmin, type InsumoEstoque } from "../../services/InsumosServices";
import { carregarContadoresAdmin, type ContadoresAdmin } from "../../hook/useContadoresAdmin";
import type { Agendamento } from "../../types/agendamento";
import { formatarData } from "../../utils/status";
import { hojeISO } from "../../utils/validacoes";
import { nomeCurto } from "../../utils/nome";
import { ACOES_HISTORICO, formatarDataHora } from "../../utils/acoesHistorico";
import { AvatarIniciais, BOTAO_SECUNDARIO } from "./AdminUI";

export interface Acao {
  n: number | null;
  rotulo: string;
  detalhe: string;
  verbo: string;
  link: string;
  Icone: React.ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>;
  // cor do ícone
  cor: string;
  fundo: string;
}

/** Cartões com o número, o que é e o atalho (Homes do admin e do autorizador). */
export function CartoesAcao({ acoes }: { acoes: Acao[] }) {
  return (
    <ul className={`mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 ${acoes.length === 3 ? "lg:grid-cols-3" : "xl:grid-cols-4"}`}>
      {acoes.map(({ n: num, rotulo, detalhe, verbo, link, Icone, cor, fundo }) => (
        <li key={rotulo}>
          <Link
            to={link}
            className="flex h-full flex-col gap-3 rounded-[18px] border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: fundo, color: cor }}>
                <Icone size={20} aria-hidden={true} />
              </span>
              <span className="text-[32px] font-extrabold leading-none text-gray-900">{num ?? "…"}</span>
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-900">{rotulo}</span>
              <span className="block text-xs text-gray-500">{detalhe}</span>
            </span>
            <span className="mt-auto flex items-center gap-1 border-t border-gray-100 pt-2.5 text-sm font-bold text-blue-700 [font-family:var(--fonte-botao)]">
              {verbo} <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const PRESENCA: Record<string, { texto: string; classe: string }> = {
  vou: { texto: "Confirmou", classe: "bg-blue-50 text-blue-800" },
  nao_vou: { texto: "Não vai", classe: "bg-red-50 text-red-700" },
};

function LinhaColeta({ a, concluida }: { a: Agendamento; concluida?: boolean }) {
  const presenca = !concluida && a.sol_presenca ? PRESENCA[a.sol_presenca] : null;
  return (
    <li className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0">
      <AvatarIniciais nome={a.paciente.pac_nome} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-800">{a.paciente.pac_nome}</span>
        <span className="block truncate text-xs text-gray-500">
          {a.sol_protocolo ?? `nº ${a.sol_id}`} · {a.insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ") || "—"}
        </span>
      </span>
      {concluida ? (
        <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">Concluída</span>
      ) : presenca ? (
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${presenca.classe}`}>{presenca.texto}</span>
      ) : null}
    </li>
  );
}

/** Cartão branco com título, ícone e link à direita (Homes da equipe). */
export function Cartao({ titulo, Icone, corIcone, link, textoLink, children, extra }: {
  titulo: string;
  Icone: React.ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>;
  corIcone: string;
  link?: string;
  textoLink?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <section className="adm-cartao">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
          <Icone size={19} className={corIcone} aria-hidden={true} /> {titulo} {extra}
        </h3>
        {link && (
          <Link to={link} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
            {textoLink} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Home do admin: o que depende de uma ação da unidade, as coletas de hoje
 * por turno, as próximas coletas, o que está em acompanhamento (com os
 * insumos em estoque baixo) e as últimas atividades. Os números vêm do
 * banco, já limitados à unidade do administrador.
 */
export default function FilaTrabalhoAdmin() {
  const [contadores, setContadores] = useState<ContadoresAdmin | null>(null);
  const [erro, setErro] = useState(false);
  const [abertas, setAbertas] = useState<Agendamento[] | null>(null);
  const [concluidas, setConcluidas] = useState<Agendamento[]>([]);
  const [baixo, setBaixo] = useState<InsumoEstoque[]>([]);
  const [atividades, setAtividades] = useState<Atividade[] | null>(null);
  const hoje = hojeISO();

  useEffect(() => {
    carregarContadoresAdmin(true).then(setContadores).catch(() => setErro(true));
    Promise.all([
      listarAgendamentos({ status: "agendado", dataInicio: hoje, dataFim: hoje }),
      listarAgendamentos({ status: "concluido", dataInicio: hoje, dataFim: hoje }),
    ])
      .then(([a, c]) => {
        setAbertas(a);
        setConcluidas(c);
      })
      .catch(() => setAbertas([]));
    buscarAtividades({ page: 1 })
      .then((r) => setAtividades(r.itens.slice(0, 5)))
      .catch(() => setAtividades([]));
    listarEstoqueAdmin()
      .then(setBaixo)
      .catch(() => {
        /* sem a lista: o número continua aparecendo */
      });
  }, [hoje]);

  const painel = contadores?.painel ?? null;
  const n = (v: number | undefined) => (painel ? v ?? 0 : null);
  const totalHoje = (abertas?.length ?? 0) + concluidas.length;
  const limite = painel?.limiteEstoqueBaixo ?? 5;
  const insumosBaixos = baixo.filter((i) => i.ins_quantidade <= limite);

  const ACOES: Acao[] = [
    {
      n: n(painel?.pendentes),
      rotulo: "Prescrições para revisar",
      detalhe: painel && painel.corrigidasParaRevisar > 0
        ? `${painel.corrigidasParaRevisar} ${painel.corrigidasParaRevisar === 1 ? "reenviada" : "reenviadas"} pelo paciente`
        : "Enviadas pelos pacientes",
      verbo: "Revisar agora",
      link: "/VerSolicitaçoes?status=Pendente",
      Icone: ClipboardList,
      cor: "#0042ec",
      fundo: "#e8f0ff",
    },
    {
      n: n(painel?.autorizadasSemAgendamento),
      rotulo: "Autorizadas para agendar",
      detalhe: "Já liberadas pelo autorizador",
      verbo: "Agendar",
      link: "/VerSolicitaçoes?status=ParaAgendar",
      Icone: Stethoscope,
      cor: "#0042ec",
      fundo: "#e8f0ff",
    },
    {
      n: painel ? contadores?.pedidosOutraData ?? 0 : null,
      rotulo: "Pedidos de outra data",
      detalhe: "Paciente aguarda resposta",
      verbo: "Responder",
      link: "/Agendamentosadm?aba=pedidos",
      Icone: CalendarSync,
      cor: "#0042ec",
      fundo: "#e8f0ff",
    },
    {
      n: abertas ? abertas.length : n(painel?.coletasHoje),
      rotulo: "Coletas a atender hoje",
      detalhe: abertas ? `${concluidas.length} já ${concluidas.length === 1 ? "concluída" : "concluídas"} · ${totalHoje} no total` : "Marcadas para hoje",
      verbo: "Abrir balcão",
      link: "/coletas-hoje",
      Icone: ClipboardCheck,
      cor: "#0042ec",
      fundo: "#e8f0ff",
    },
  ];

  const porTurno = (t: "manha" | "tarde") => (abertas ?? []).filter((a) => (a.sol_turno ?? "manha") === t);
  const concluidasTurno = (t: "manha" | "tarde") => concluidas.filter((a) => (a.sol_turno ?? "manha") === t);
  const confirmaram = (abertas ?? []).filter((a) => a.sol_presenca === "vou").length;
  const naoVao = (abertas ?? []).filter((a) => a.sol_presenca === "nao_vou").length;

  // próximas coletas agrupadas por dia (a de hoje já aparece no cartão acima)
  const proximas = (painel?.proximasColetas ?? []).filter((c) => c.data.slice(0, 10) > hoje);
  const dias = [...new Set(proximas.map((c) => c.data.slice(0, 10)))];
  const amanha = (() => {
    const d = new Date(`${hoje}T12:00:00`);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const rotuloDia = (d: string) => {
    const texto = new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
    return d === amanha ? `Amanhã · ${texto}` : texto;
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8" aria-labelledby="painel-titulo">
      {/* a saudação e a data ficam na barra superior */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link to="/leitor-qrcode" className={BOTAO_SECUNDARIO}><QrCode size={17} aria-hidden="true" /> Ler QR Code</Link>
        <Link to="/lista-separacao" className={BOTAO_SECUNDARIO}><ListChecks size={17} aria-hidden="true" /> Lista de separação</Link>
      </div>

      {erro && (
        <p className="mb-4 text-sm text-rose-600" role="alert">
          Não foi possível carregar os números agora. O menu e os atalhos continuam funcionando.
        </p>
      )}

      <h2 id="painel-titulo" className="sr-only">Painel da unidade</h2>
      <CartoesAcao acoes={ACOES} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.65fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <Cartao titulo="Coletas de hoje" Icone={ClipboardCheck} corIcone="text-blue-700" link="/coletas-hoje" textoLink="Abrir balcão">
            {!abertas ? (
              <p className="px-5 py-6 text-sm text-gray-400" role="status">Carregando…</p>
            ) : totalHoje === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">Nenhuma coleta marcada para hoje.</p>
            ) : (
              <>
                <div className="px-5 pt-3">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span><strong>{concluidas.length} de {totalHoje}</strong> concluídas</span>
                    {(confirmaram > 0 || naoVao > 0) && (
                      <span className="text-gray-500">
                        {confirmaram > 0 && `${confirmaram} ${confirmaram === 1 ? "confirmou" : "confirmaram"} presença`}
                        {confirmaram > 0 && naoVao > 0 && " · "}
                        {naoVao > 0 && `${naoVao} ${naoVao === 1 ? "avisou" : "avisaram"} que não vai`}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                    <div className="h-full rounded-full bg-green-600" style={{ width: `${Math.round((concluidas.length / totalHoje) * 100)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {(["manha", "tarde"] as const).map((t, i) => (
                    <div key={t} className={`px-5 pb-3 ${i ? "md:border-l md:border-gray-200" : ""}`}>
                      <p className="mb-1 mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                        {t === "manha" ? <Sunrise size={14} aria-hidden="true" /> : <Sunset size={14} aria-hidden="true" />}
                        {t === "manha" ? "Manhã" : "Tarde"}
                      </p>
                      <ul>
                        {concluidasTurno(t).map((a) => <LinhaColeta key={a.sol_id} a={a} concluida />)}
                        {porTurno(t).map((a) => <LinhaColeta key={a.sol_id} a={a} />)}
                        {porTurno(t).length + concluidasTurno(t).length === 0 && (
                          <li className="py-2.5 text-sm text-gray-400">Nenhuma coleta neste turno.</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Cartao>

          <Cartao
            titulo="Próximas coletas"
            Icone={CalendarDays}
            corIcone="text-blue-700"
            link="/Agendamentosadm"
            textoLink="Ver agenda"
            extra={painel ? (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                {painel.coletas7dias} nos próximos 7 dias
              </span>
            ) : null}
          >
            {!painel && !erro && <p className="px-5 py-6 text-sm text-gray-400" role="status">Carregando…</p>}
            {painel && dias.length === 0 && <p className="px-5 py-6 text-sm text-gray-500">Nenhuma coleta agendada depois de hoje.</p>}
            {dias.map((d) => (
              <div key={d}>
                <p className="px-5 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-gray-500">{rotuloDia(d)}</p>
                <ul className="px-5 pb-2">
                  {proximas.filter((c) => c.data.slice(0, 10) === d).map((c) => (
                    <li key={c.sol_id}>
                      <Link
                        to={`/Agendamentosadm?busca=${encodeURIComponent(c.protocolo ?? String(c.sol_id))}`}
                        className="flex min-h-12 items-center gap-3 border-b border-gray-100 py-2 hover:bg-gray-50"
                      >
                        <AvatarIniciais nome={c.pac_nome} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-gray-800">{nomeCurto(c.pac_nome) || "Paciente"}</span>
                          <span className="block text-xs text-gray-500">{c.protocolo ?? `Agendamento ${c.sol_id}`}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{formatarData(c.data)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Cartao>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Cartao titulo="Em acompanhamento" Icone={Eye} corIcone="text-blue-700">
            <ul className="px-5 py-1">
              <li>
                <Link to="/Historicodaprescricao" className="flex min-h-14 items-center gap-3 border-b border-gray-100 py-2.5 hover:bg-gray-50">
                  <RotateCcw size={19} className="shrink-0 text-blue-700" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800">Reenvios aguardando o paciente</span>
                    <span className="block text-xs text-gray-500">Pedido de nova prescrição ou foto</span>
                  </span>
                  <span className="text-lg font-extrabold">{painel ? painel.aguardandoPaciente : "…"}</span>
                </Link>
              </li>
              <li>
                <Link to="/Agendamentosadm" className="flex min-h-14 items-center gap-3 border-b border-gray-100 py-2.5 hover:bg-gray-50">
                  <CalendarClock size={19} className="shrink-0 text-blue-700" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800">Coletas nos próximos 7 dias</span>
                    <span className="block text-xs text-gray-500">Inclui retiradas de uso contínuo</span>
                  </span>
                  <span className="text-lg font-extrabold">{painel ? painel.coletas7dias : "…"}</span>
                </Link>
              </li>
              <li>
                <Link to="/insumos" className="flex items-start gap-3 py-3 hover:bg-gray-50">
                  <PackageX size={19} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800">Estoque baixo (até {limite} unidades)</span>
                    {insumosBaixos.length > 0 ? (
                      <span className="mt-1.5 flex flex-col gap-1">
                        {insumosBaixos.slice(0, 4).map((i) => (
                          <span key={i.ins_id} className="flex items-center justify-between gap-2 text-xs text-gray-700">
                            <span className="truncate">{i.ins_nome}</span>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${i.ins_quantidade <= 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
                              {i.ins_quantidade <= 0 ? "Esgotado" : `${i.ins_quantidade} un.`}
                            </span>
                          </span>
                        ))}
                        {insumosBaixos.length > 4 && <span className="text-xs text-gray-500">e mais {insumosBaixos.length - 4}</span>}
                      </span>
                    ) : (
                      <span className="block text-xs text-gray-500">{painel?.estoqueBaixo === 0 ? "Nenhum insumo com estoque baixo" : "Toque para ver o estoque"}</span>
                    )}
                  </span>
                  <span className="text-lg font-extrabold">{painel ? painel.estoqueBaixo : "…"}</span>
                </Link>
              </li>
            </ul>
          </Cartao>

          <Cartao titulo="Atividade recente" Icone={Activity} corIcone="text-blue-700" link="/atividades" textoLink="Ver tudo">
            {!atividades && <p className="px-5 py-6 text-sm text-gray-400" role="status">Carregando…</p>}
            {atividades && atividades.length === 0 && <p className="px-5 py-6 text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>}
            <ol className="px-5 py-1">
              {atividades?.map((a) => {
                const info = ACOES_HISTORICO[a.acao] ?? { titulo: a.acao, cor: "bg-gray-400" };
                return (
                  <li key={a.his_id} className="flex gap-3 border-b border-gray-100 py-2.5 last:border-b-0">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${info.cor}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm text-gray-800">
                        <strong className="font-semibold">{info.titulo}</strong>
                        {a.pac_nome ? ` · ${nomeCurto(a.pac_nome)}` : ""}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {a.usuario_nome ? `por ${nomeCurto(a.usuario_nome)}` : "registro do sistema"} · {a.protocolo ?? `nº ${a.sol_id}`} · {formatarDataHora(a.quando)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Cartao>
        </div>
      </div>
    </section>
  );
}
