import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarPlus, CircleX, ClipboardList, History, Hourglass, Info, RefreshCcw } from "lucide-react";

import { buscarPrescricoesPendentes } from "../services/PrescricaoService";
import type { PrescricaoPendente } from "../services/PrescricaoService";

import { useValidarToken } from "../hook/Validartoken.tsx";

import Sidebaradm from "../components/universais/Siderbaradm.tsx";
import Header from "../components/universais/HeaderAdm.tsx";
import Footer from "../components/universais/Footer.tsx";
import SeloPrioridade from "../components/universais/SeloPrioridade";
import { SeloPrescricao } from "../components/universais/CartaoPrescricao";
import {
  AbasAdmin, AvatarIniciais, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CabecalhoAdmin, EstadoLista, FiltrosAdmin, type AbaAdmin,
} from "../components/universais/AdminUI";
import { exibirCPF, mensagemErroApi, somenteDigitos } from "../utils/validacoes";
import { dentroDoPeriodo, formatarData } from "../utils/status";

type Aba = "revisar" | "autorizador" | "agendar" | "agendadas" | "nao" | "todas";

// a Home e o sino abrem esta tela já filtrada (?status=...)
const ABA_DO_STATUS: Record<string, Aba> = {
  Pendente: "revisar",
  Corrigida: "revisar",
  Revisado: "autorizador",
  ParaAgendar: "agendar",
  Autorizado: "agendadas",
  "Nao Autorizado": "nao",
  Todos: "todas",
};

const NA_ABA: Record<Aba, (p: PrescricaoPendente) => boolean> = {
  revisar: (p) => p.sol_status === "Pendente",
  autorizador: (p) => p.sol_status === "Revisado" || p.sol_status === "Aprovado",
  agendar: (p) => p.sol_status === "Autorizado" && !p.agendamento_ativo,
  agendadas: (p) => p.sol_status === "Autorizado" && Boolean(p.agendamento_ativo),
  nao: (p) => p.sol_status === "Nao Autorizado",
  todas: () => true,
};

const VAZIO: Record<Aba, string> = {
  revisar: "Nenhuma prescrição esperando revisão.",
  autorizador: "Nenhuma prescrição com o autorizador.",
  agendar: "Nenhuma prescrição autorizada esperando agendamento.",
  agendadas: "Nenhuma prescrição agendada.",
  nao: "Nenhuma prescrição não autorizada.",
  todas: "Nenhuma solicitação.",
};

function haQuantoTempo(iso: string): string {
  const dia = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const dias = Math.round((dia(new Date()) - dia(new Date(iso))) / 86_400_000);
  if (Number.isNaN(dias)) return "";
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

/**
 * Solicitações (admin): prescrições do posto em andamento, separadas em
 * abas pela situação (para revisar, com o autorizador, para agendar...).
 * A lista já vem do backend na ordem de prioridade legal e data.
 */
export default function Pendencias() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verificando } = useValidarToken("ADMIN");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prescricoes, setPrescricoes] = useState<PrescricaoPendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<Aba>(ABA_DO_STATUS[searchParams.get("status") ?? ""] ?? "revisar");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setPrescricoes(await buscarPrescricoesPendentes());
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar as solicitações."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  const termo = busca.toLowerCase().trim();
  const digitos = somenteDigitos(busca);
  // busca e período valem para todas as abas (os contadores acompanham)
  const buscadas = prescricoes.filter((p) => {
    const correspondeBusca =
      !termo ||
      p.pac_nome.toLowerCase().includes(termo) ||
      (digitos.length > 0 && somenteDigitos(p.pac_cpf).includes(digitos)) ||
      String(p.sol_id) === termo;
    return correspondeBusca && dentroDoPeriodo(p.sol_data_solicitacao, dataInicio, dataFim);
  });
  const filtradas = buscadas.filter(NA_ABA[aba]);
  const contar = (a: Aba) => (carregando ? null : buscadas.filter(NA_ABA[a]).length);

  const ABAS: AbaAdmin<Aba>[] = [
    { id: "revisar", rotulo: "Para revisar", Icone: ClipboardList, numero: contar("revisar") },
    { id: "autorizador", rotulo: "Com o autorizador", Icone: Hourglass, numero: contar("autorizador") },
    { id: "agendar", rotulo: "Para agendar", Icone: CalendarPlus, numero: contar("agendar"), atencao: true },
    { id: "agendadas", rotulo: "Agendadas", Icone: CalendarCheck, numero: contar("agendadas") },
    { id: "nao", rotulo: "Não autorizadas", Icone: CircleX, numero: contar("nao") },
    { id: "todas", rotulo: "Todas", numero: contar("todas") },
  ];

  function abrir(p: PrescricaoPendente) {
    if (p.sol_status === "Autorizado" && p.agendamento_ativo) {
      // já agendada: abre a lista de agendamentos filtrada pelo CPF
      navigate(`/Agendamentosadm?busca=${encodeURIComponent(p.pac_cpf)}`);
    } else if (p.sol_status === "Autorizado") {
      navigate(`/Agendamentosadm?cpf=${p.pac_cpf}&sol_id=${p.sol_id}`);
    } else if (p.sol_status === "Nao Autorizado") {
      navigate(`/administrador/prescricao/nao-autorizada/${p.sol_id}`);
    } else {
      navigate(`/administrador/prescricao/autorizarprescricao/${p.sol_id}`);
    }
  }

  function acao(p: PrescricaoPendente) {
    if (p.sol_status === "Pendente") return { texto: "Revisar", primaria: true, Icone: ArrowRight };
    if (p.sol_status === "Autorizado" && !p.agendamento_ativo) return { texto: "Agendar", primaria: true, Icone: CalendarPlus };
    if (p.sol_status === "Autorizado") return { texto: "Ver agendamento", primaria: false, Icone: null };
    if (p.sol_status === "Nao Autorizado") return { texto: "Ver e refazer pedido", primaria: false, Icone: null };
    return { texto: "Ver prescrição", primaria: false, Icone: null };
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />

      <main className="compensa-header mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="pt-6">
          <CabecalhoAdmin
            titulo="Solicitações"
            subtitulo="Prescrições enviadas pelos pacientes: revise, acompanhe a autorização e agende."
            acoes={
              <button type="button" className={BOTAO_SECUNDARIO} onClick={() => navigate("/Historicodaprescricao")}>
                <History size={17} aria-hidden="true" /> Histórico da prescrição
              </button>
            }
          />

          <AbasAdmin abas={ABAS} ativa={aba} onMudar={setAba} rotulo="Situação da prescrição" />

          <FiltrosAdmin
            busca={busca}
            onBusca={setBusca}
            placeholder="Buscar por nome, CPF ou código"
            rotuloPeriodo="Enviada de"
            inicio={dataInicio}
            fim={dataFim}
            onInicio={setDataInicio}
            onFim={setDataFim}
            onLimpar={() => {
              setBusca("");
              setDataInicio("");
              setDataFim("");
            }}
          />

          {aba === "revisar" && (
            <p className="mb-4 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">
              <Info size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                A fila já vem na ordem de atendimento: <strong>prioridade legal primeiro</strong> (80+, 60+, PcD e gestante
                conferidos), depois a mais antiga.
              </span>
            </p>
          )}

          <section className="adm-cartao">
            <EstadoLista
              carregando={carregando}
              erro={erro}
              onTentarNovamente={carregar}
              vazio={filtradas.length === 0}
              mensagemVazio={busca || dataInicio || dataFim ? "Nenhuma solicitação encontrada com esses filtros." : VAZIO[aba]}
            />
            {!carregando && !erro && filtradas.length > 0 && (
              <>
                <table className="adm-tabela">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Código</th>
                      <th>Enviada em</th>
                      <th>Prioridade</th>
                      <th>Situação</th>
                      <th className="adm-col-acao">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map((p) => {
                      const a = acao(p);
                      const corrigida = p.sol_status === "Pendente" && (p.versoes_anteriores ?? 0) > 0;
                      return (
                        <tr key={p.sol_id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <AvatarIniciais nome={p.pac_nome} />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900">{p.pac_nome}</p>
                                <p className="text-xs text-gray-500">CPF {exibirCPF(p.pac_cpf)}</p>
                              </div>
                            </div>
                          </td>
                          <td data-rotulo="Código" className="whitespace-nowrap">nº {p.sol_id}</td>
                          <td data-rotulo="Enviada em">
                            {formatarData(p.sol_data_solicitacao)}
                            <span className="block text-xs text-gray-500 max-md:inline max-md:before:content-['_·_']">
                              {haQuantoTempo(p.sol_data_solicitacao)}
                            </span>
                          </td>
                          <td>
                            <SeloPrioridade prioridade={p.prioridade} mostrarPendente />
                            {!p.prioridade?.motivo && !p.prioridade?.aguardando_conferencia && (
                              <span className="text-gray-300 max-md:hidden" aria-label="Sem prioridade">—</span>
                            )}
                          </td>
                          <td>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <SeloPrescricao
                                status={p.sol_status}
                                rotulo={
                                  p.sol_status === "Autorizado"
                                    ? (p.agendamento_ativo ? "Agendado" : "Autorizado · falta agendar")
                                    : p.sol_status === "Revisado" || p.sol_status === "Aprovado"
                                      ? "Com o autorizador"
                                      : undefined
                                }
                              />
                              {corrigida && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                  <RefreshCcw size={12} aria-hidden="true" /> Corrigida · versão {(p.versoes_anteriores ?? 0) + 1}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="adm-col-acao">
                            <button
                              type="button"
                              onClick={() => abrir(p)}
                              className={a.primaria ? BOTAO_PRIMARIO : BOTAO_SECUNDARIO}
                              aria-label={`${a.texto}: ${p.pac_nome}, nº ${p.sol_id}`}
                            >
                              {a.Icone && a.texto !== "Revisar" && <a.Icone size={16} aria-hidden="true" />}
                              {a.texto}
                              {a.Icone && a.texto === "Revisar" && <a.Icone size={16} aria-hidden="true" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500" role="status">
                  {filtradas.length === 1 ? "1 solicitação" : `${filtradas.length} solicitações`}
                </p>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
