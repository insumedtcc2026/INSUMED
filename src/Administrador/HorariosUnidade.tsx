import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CalendarOff, Clock, Trash2 } from "lucide-react";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import { AbasUnidade } from "../components/universais/AdminUI";
import { useValidarToken } from "../hook/Validartoken";
import { buscarMeuPerfil } from "../services/PainelService";
import {
  buscarHorarios,
  buscarOcupacao,
  fecharDia,
  reabrirDia,
  salvarHorarios,
  type DiaFechado,
  type HorarioTurno,
  type TurnoNaAgenda,
} from "../services/AgendaService";
import { DIAS_SEMANA, diaCurto, HORA_PADRAO, ROTULO_TURNO, TURNOS, type Turno } from "../utils/agenda";
import { formatarData } from "../utils/status";
import { hojeISO, mensagemErroApi } from "../utils/validacoes";
import { API_URL } from "../config";
import type { Posto } from "../types/agendamento";

// Linha editável da grade: um turno de um dia da semana
interface LinhaTurno {
  atende: boolean;
  abre: string;
  fecha: string;
  vagas: string; // vazio = sem limite
}

type Grade = Record<string, LinhaTurno>; // chave "dia:turno"

const chave = (dia: number, turno: Turno) => `${dia}:${turno}`;
// segunda primeiro, domingo no fim (como a semana de trabalho)
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];

function montarGrade(horarios: HorarioTurno[]): Grade {
  const grade: Grade = {};
  for (const dia of ORDEM_DIAS) {
    for (const turno of TURNOS) {
      const h = horarios.find((x) => x.dia_semana === dia && x.turno === turno);
      grade[chave(dia, turno)] = h
        ? { atende: true, abre: h.abre, fecha: h.fecha, vagas: h.vagas == null ? "" : String(h.vagas) }
        : { atende: false, abre: HORA_PADRAO[turno][0], fecha: HORA_PADRAO[turno][1], vagas: "" };
    }
  }
  return grade;
}

/**
 * Horários da unidade: em que dias e turnos a unidade entrega insumos,
 * quantas coletas cabem em cada turno e os dias em que ela fica fechada.
 * O agendamento (admin e pedido do paciente) só oferece turnos com vaga.
 */
export default function HorariosUnidade() {
  const { verificando } = useValidarToken("ADMIN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const [universal, setUniversal] = useState(false);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [posId, setPosId] = useState<number | null>(null);

  const [grade, setGrade] = useState<Grade | null>(null);
  const [padrao, setPadrao] = useState(false);
  const [bloqueios, setBloqueios] = useState<DiaFechado[]>([]);
  const [ocupacao, setOcupacao] = useState<TurnoNaAgenda[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [alterado, setAlterado] = useState(false);

  const [novoDia, setNovoDia] = useState("");
  const [novoMotivo, setNovoMotivo] = useState("");

  // unidade do admin (o universal escolhe na lista)
  useEffect(() => {
    if (verificando) return;
    buscarMeuPerfil("ADMIN")
      .then((p) => {
        setUniversal(Boolean(p.universal));
        if (p.posto) setPosId(p.posto.pos_id);
        if (p.universal) {
          return axios.get<Posto[]>(`${API_URL}/postos`).then((r) => {
            setPostos(r.data);
            if (!p.posto && r.data.length) setPosId(r.data[0].pos_id);
          });
        }
      })
      .catch((e) => setErro(mensagemErroApi(e, "Não foi possível carregar a sua unidade.")));
  }, [verificando]);

  const carregar = useCallback(async (pos_id: number) => {
    setErro(null);
    try {
      const [h, o] = await Promise.all([buscarHorarios(pos_id), buscarOcupacao(pos_id)]);
      setGrade(montarGrade(h.horarios));
      setPadrao(h.padrao);
      setBloqueios(h.bloqueios);
      setOcupacao(o);
      setAlterado(false);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar os horários."));
    }
  }, []);

  // carrega fora do corpo do efeito (o estado só muda no callback)
  useEffect(() => {
    if (!posId) return;
    const t = setTimeout(() => carregar(posId), 0);
    return () => clearTimeout(t);
  }, [posId, carregar]);

  function mudar(dia: number, turno: Turno, campo: Partial<LinhaTurno>) {
    setGrade((g) => (g ? { ...g, [chave(dia, turno)]: { ...g[chave(dia, turno)], ...campo } } : g));
    setAlterado(true);
  }

  async function salvar() {
    if (!grade || !posId) return;
    const horarios: HorarioTurno[] = [];
    for (const dia of ORDEM_DIAS) {
      for (const turno of TURNOS) {
        const l = grade[chave(dia, turno)];
        if (!l.atende) continue;
        horarios.push({ dia_semana: dia, turno, abre: l.abre, fecha: l.fecha, vagas: l.vagas === "" ? null : Number(l.vagas) });
      }
    }
    if (!horarios.length) {
      setErro("Marque pelo menos um turno de atendimento.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await salvarHorarios(posId, horarios);
      await carregar(posId);
      Swal.fire({ icon: "success", title: "Horários salvos", text: "Os próximos agendamentos já seguem os novos turnos e vagas.", confirmButtonColor: "#1d4ed8" });
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível salvar os horários."));
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarFechado() {
    if (!posId) return;
    if (!novoDia) {
      setErro("Escolha o dia em que a unidade estará fechada.");
      return;
    }
    setErro(null);
    try {
      const r = await fecharDia(posId, novoDia, novoMotivo.trim());
      setNovoDia("");
      setNovoMotivo("");
      await carregar(posId);
      if (r.agendamentos_no_dia > 0) {
        Swal.fire({
          icon: "warning",
          title: "Há coletas marcadas neste dia",
          text: `${r.agendamentos_no_dia} ${r.agendamentos_no_dia === 1 ? "agendamento precisa" : "agendamentos precisam"} ser remarcados. Em Agendamentos, filtre pela data ${formatarData(r.data)} e use "Remarcar".`,
          confirmButtonColor: "#1d4ed8",
        });
      }
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível marcar o dia como fechado."));
    }
  }

  async function reabrir(b: DiaFechado) {
    if (!posId) return;
    try {
      await reabrirDia(posId, b.id);
      await carregar(posId);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível reabrir o dia."));
    }
  }

  // ocupação: uma linha por dia, com os dois turnos
  const ocupacaoPorDia = useMemo(() => {
    const mapa = new Map<string, TurnoNaAgenda[]>();
    for (const t of ocupacao) mapa.set(t.data, [...(mapa.get(t.data) ?? []), t]);
    return [...mapa];
  }, [ocupacao]);

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const campo = "min-h-10 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-base focus:border-blue-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 sm:text-sm";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />
      <HeaderAdm onMenuClick={toggleSidebar} />

      <main className="compensa-header mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="pt-6">
          <AbasUnidade />
        </div>
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Horários da unidade</h1>
            <p className="text-sm text-gray-500">
              Dias e turnos de entrega, vagas por turno e dias em que a unidade fecha.
            </p>
          </div>
          {universal && postos.length > 0 && (
            <label className="flex flex-col text-sm font-medium text-gray-600">
              Unidade
              <select
                value={posId ?? ""}
                onChange={(e) => setPosId(Number(e.target.value))}
                className="mt-1 min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-base sm:text-sm"
              >
                {postos.map((p) => (
                  <option key={p.pos_id} value={p.pos_id}>{p.pos_nome}</option>
                ))}
              </select>
            </label>
          )}
        </header>

        {erro && (
          <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{erro}</p>
        )}

        {!grade && !erro && <p className="py-10 text-center text-gray-400" role="status">Carregando horários…</p>}

        {grade && (
          <>
            {/* TURNOS */}
            <section className="mb-6 rounded-3xl bg-white p-4 shadow-sm sm:p-6" aria-labelledby="titulo-turnos">
              <h2 id="titulo-turnos" className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Clock aria-hidden="true" className="h-5 w-5 text-blue-700" /> Turnos de atendimento
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Vagas é o máximo de coletas no turno. Deixe em branco para não limitar.
              </p>
              {padrao && (
                <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  A unidade ainda usa o horário padrão (segunda a sexta, manhã e tarde, sem limite de vagas). Ajuste e salve para personalizar.
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3">
                {ORDEM_DIAS.map((dia) => (
                  <fieldset key={dia} className="rounded-2xl border border-gray-100 p-3">
                    <legend className="px-1 text-sm font-semibold text-gray-800">{DIAS_SEMANA[dia]}</legend>
                    <div className="grid gap-3 md:grid-cols-2">
                      {TURNOS.map((turno) => {
                        const l = grade[chave(dia, turno)];
                        const id = `h-${dia}-${turno}`;
                        return (
                          <div key={turno} className={`rounded-xl px-3 py-2 ${l.atende ? "bg-blue-50/60" : "bg-gray-50"}`}>
                            <label className="flex min-h-10 !flex-row items-center gap-2 text-sm font-medium text-gray-800">
                              <input
                                type="checkbox"
                                checked={l.atende}
                                onChange={(e) => mudar(dia, turno, { atende: e.target.checked })}
                                className="!mr-1 !h-5 !w-5 shrink-0 accent-blue-700"
                              />
                              Atende de {ROTULO_TURNO[turno]}
                            </label>
                            <div className="mt-1 grid grid-cols-3 gap-2">
                              <label className="text-xs text-gray-500" htmlFor={`${id}-abre`}>
                                Abre
                                <input id={`${id}-abre`} type="time" value={l.abre} disabled={!l.atende}
                                  onChange={(e) => mudar(dia, turno, { abre: e.target.value })} className={campo} />
                              </label>
                              <label className="text-xs text-gray-500" htmlFor={`${id}-fecha`}>
                                Fecha
                                <input id={`${id}-fecha`} type="time" value={l.fecha} disabled={!l.atende}
                                  onChange={(e) => mudar(dia, turno, { fecha: e.target.value })} className={campo} />
                              </label>
                              <label className="text-xs text-gray-500" htmlFor={`${id}-vagas`}>
                                Vagas
                                <input id={`${id}-vagas`} type="number" min={1} max={500} inputMode="numeric" placeholder="sem limite"
                                  value={l.vagas} disabled={!l.atende}
                                  onChange={(e) => mudar(dia, turno, { vagas: e.target.value })} className={campo} />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                {alterado && <span className="text-sm text-amber-700" role="status">Alterações não salvas</span>}
                <button
                  type="button"
                  onClick={salvar}
                  disabled={salvando}
                  className="min-h-11 rounded-full bg-blue-700 px-6 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {salvando ? "Salvando…" : "Salvar horários"}
                </button>
              </div>
            </section>

            {/* DIAS FECHADOS */}
            <section className="mb-6 rounded-3xl bg-white p-4 shadow-sm sm:p-6" aria-labelledby="titulo-fechados">
              <h2 id="titulo-fechados" className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <CalendarOff aria-hidden="true" className="h-5 w-5 text-blue-700" /> Dias fechados
              </h2>
              <p className="mt-1 text-sm text-gray-500">Feriados, reformas ou campanhas: ninguém consegue agendar nesses dias.</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
                <label className="text-sm font-medium text-gray-600">
                  Dia
                  <input type="date" min={hojeISO()} value={novoDia} onChange={(e) => setNovoDia(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-lg border border-gray-200 px-3 text-base sm:text-sm" />
                </label>
                <label className="text-sm font-medium text-gray-600">
                  Motivo (aparece para o paciente)
                  <input type="text" maxLength={120} value={novoMotivo} onChange={(e) => setNovoMotivo(e.target.value)}
                    placeholder="Ex.: feriado municipal"
                    className="mt-1 min-h-11 w-full rounded-lg border border-gray-200 px-3 text-base sm:text-sm" />
                </label>
                <button type="button" onClick={adicionarFechado}
                  className="min-h-11 rounded-full border border-blue-700 px-5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  Fechar o dia
                </button>
              </div>

              {bloqueios.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">Nenhum dia fechado daqui para frente.</p>
              ) : (
                <ul className="mt-4 divide-y divide-gray-100">
                  {bloqueios.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span>
                        <strong className="text-gray-800">{formatarData(b.data)}</strong>
                        <span className="text-gray-500"> · {b.motivo ?? "Unidade fechada"}</span>
                      </span>
                      <button type="button" onClick={() => reabrir(b)} aria-label={`Reabrir ${formatarData(b.data)}`}
                        className="flex min-h-10 items-center gap-1 rounded-full px-3 font-medium text-rose-700 hover:bg-rose-50">
                        <Trash2 aria-hidden="true" className="h-4 w-4" /> Reabrir
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* OCUPAÇÃO */}
            <section className="rounded-3xl bg-white p-4 shadow-sm sm:p-6" aria-labelledby="titulo-ocupacao">
              <h2 id="titulo-ocupacao" className="text-lg font-semibold text-gray-800">Próximas duas semanas</h2>
              <p className="mt-1 text-sm text-gray-500">Coletas marcadas em cada turno.</p>
              {ocupacaoPorDia.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">A unidade não atende nos próximos 14 dias.</p>
              ) : (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {ocupacaoPorDia.map(([data, turnos]) => (
                    <li key={data} className="flex flex-wrap items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 text-sm">
                      <span className="w-24 shrink-0 font-medium capitalize text-gray-800">{diaCurto(data)}</span>
                      {turnos[0].fechado_motivo ? (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                          Fechado · {turnos[0].fechado_motivo}
                        </span>
                      ) : (
                        turnos.map((t) => {
                          const lotado = t.livres === 0;
                          return (
                            <span key={t.turno}
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${lotado ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-900"}`}>
                              {ROTULO_TURNO[t.turno]}: {t.ocupadas}{t.vagas ? `/${t.vagas}` : ""}{lotado ? " · lotado" : ""}
                            </span>
                          );
                        })
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
