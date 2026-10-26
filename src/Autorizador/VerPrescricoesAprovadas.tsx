import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CircleCheck, CircleX, Eye, Hourglass, Info, List, RefreshCcw } from "lucide-react";

import { buscarPrescricoesAprovadas } from "../services/PrescricaoService";
import type { PrescricaoAprovada } from "../services/PrescricaoService";
import { buscarPainelAutorizador } from "../services/PainelService";

import { useValidarToken } from "../hook/Validartoken.tsx";

import SidebarAut from "../components/universais/SidebarAut.tsx";
import Header from "../components/universais/HeaderAut.tsx";
import Footer from "../components/universais/Footer.tsx";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import SeloPrioridade from "../components/universais/SeloPrioridade";
import { SeloPrescricao } from "../components/universais/CartaoPrescricao";
import {
  AbasAdmin, AvatarIniciais, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CabecalhoAdmin, EstadoLista, FiltrosAdmin, type AbaAdmin,
} from "../components/universais/AdminUI";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import { exibirCPF, mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";
import { resumoInsumos } from "../utils/itensPrescricao";

const POR_PAGINA = 20;

// cada aba é um status do backend; por padrão abre o que espera a decisão
type Aba = "Revisado" | "Autorizado" | "Nao Autorizado" | "Todos";

const VAZIO: Record<Aba, string> = {
  Revisado: "Nenhuma prescrição aguardando a sua análise. Tudo em dia!",
  Autorizado: "Nenhuma prescrição autorizada encontrada.",
  "Nao Autorizado": "Nenhuma prescrição não autorizada encontrada.",
  Todos: "Nenhuma prescrição encontrada.",
};

const aguardando = (status: string) => status === "Revisado" || status === "Aprovado";

/** "hoje", "ontem" ou "há N dias" (quanto tempo a prescrição está na fila). */
function haQuantoTempo(iso: string): string {
  const dia = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const dias = Math.round((dia(new Date()) - dia(new Date(iso))) / 86_400_000);
  if (Number.isNaN(dias)) return "";
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

/**
 * Prescrições para análise (autorizador), no mesmo padrão das listas do
 * administrador: abas por situação, busca e período, e uma tabela com o
 * paciente, os insumos, a prioridade e a ação. A fila já vem do backend na
 * ordem de prioridade legal e data.
 */
export default function Autorizador() {
  const navigate = useNavigate();
  const { verificando } = useValidarToken("AUTORIZADOR");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prescricoes, setPrescricoes] = useState<PrescricaoAprovada[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [naFila, setNaFila] = useState<number | null>(null);

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  // a Home do autorizador abre esta tela já filtrada (ex.: ?status=Autorizado)
  const [searchParams] = useSearchParams();
  const inicial = searchParams.get("status") as Aba | null;
  const [aba, setAba] = useState<Aba>(inicial && inicial in VAZIO ? inicial : "Revisado");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // a busca vai para o servidor só depois que a pessoa para de digitar
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPagina(1);
    }, 400);
    return () => clearTimeout(t);
  }, [busca]);

  // Busca, filtros e paginação no banco (as decididas só crescem com o tempo)
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await buscarPrescricoesAprovadas({
        busca: buscaAplicada,
        status: aba,
        data_inicio: dataInicio,
        data_fim: dataFim,
        page: pagina,
        porPagina: POR_PAGINA,
      });
      setPrescricoes(resposta.itens);
      setTotal(resposta.total);
      setTotalPaginas(resposta.totalPaginas);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar as prescrições."));
    } finally {
      setCarregando(false);
    }
  }, [buscaAplicada, aba, dataInicio, dataFim, pagina]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  // número da aba "Aguardando análise" (o mesmo da Home)
  useEffect(() => {
    if (verificando) return;
    buscarPainelAutorizador()
      .then((p) => setNaFila(p.aguardando))
      .catch(() => setNaFila(null));
  }, [verificando]);

  const mudarFiltro = (aplicar: () => void) => {
    aplicar();
    setPagina(1);
  };

  const ABAS: AbaAdmin<Aba>[] = [
    { id: "Revisado", rotulo: "Aguardando análise", Icone: Hourglass, numero: naFila, atencao: true },
    { id: "Autorizado", rotulo: "Autorizadas", Icone: CircleCheck },
    { id: "Nao Autorizado", rotulo: "Não autorizadas", Icone: CircleX },
    { id: "Todos", rotulo: "Todas", Icone: List },
  ];

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
      <SidebarAut isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeaut" />
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <CabecalhoAdmin
          titulo="Prescrições para análise"
          subtitulo="Prescrições já revisadas pela unidade: confira e decida se autoriza a entrega dos insumos."
        />

        <AbasAdmin abas={ABAS} ativa={aba} onMudar={(a) => mudarFiltro(() => setAba(a))} rotulo="Situação da prescrição" />

        <FiltrosAdmin
          busca={busca}
          onBusca={setBusca}
          placeholder="Buscar por nome, CPF ou código"
          rotuloPeriodo="Enviada de"
          inicio={dataInicio}
          fim={dataFim}
          onInicio={(v) => mudarFiltro(() => setDataInicio(v))}
          onFim={(v) => mudarFiltro(() => setDataFim(v))}
          onLimpar={() => mudarFiltro(() => {
            setBusca("");
            setDataInicio("");
            setDataFim("");
          })}
        />

        {aba === "Revisado" && (
          <p className="mb-4 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">
            <Info size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              A fila já vem na ordem de atendimento: <strong>prioridade legal primeiro</strong>, depois a mais antiga.
            </span>
          </p>
        )}

        <section className="adm-cartao">
          <EstadoLista
            carregando={carregando}
            erro={erro}
            onTentarNovamente={carregar}
            vazio={prescricoes.length === 0}
            mensagemVazio={busca || dataInicio || dataFim ? "Nenhuma prescrição encontrada com esses filtros." : VAZIO[aba]}
          />
          {!carregando && !erro && prescricoes.length > 0 && (
            <>
              <table className="adm-tabela">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Código</th>
                    <th>Insumos</th>
                    <th>Enviada em</th>
                    <th>Prioridade</th>
                    <th>Situação</th>
                    <th className="adm-col-acao">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {prescricoes.map((p) => {
                    const decidir = aguardando(p.sol_status);
                    const novaVersao = (p.versoes_anteriores ?? 0) > 0;
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
                        <td data-rotulo="Insumos">
                          <span className="block max-w-[220px] truncate max-md:inline" title={resumoInsumos(p)}>{resumoInsumos(p) || "—"}</span>
                          {p.sol_periodicidade_dias ? (
                            <span className="block text-xs text-gray-500 max-md:inline max-md:before:content-['_·_']">
                              uso contínuo, a cada {p.sol_periodicidade_dias} dias
                            </span>
                          ) : null}
                        </td>
                        <td data-rotulo="Enviada em">
                          {formatarData(p.sol_data_solicitacao)}
                          <span className="block text-xs text-gray-500 max-md:inline max-md:before:content-['_·_']">
                            {haQuantoTempo(p.sol_data_solicitacao)}
                          </span>
                        </td>
                        <td>
                          <SeloPrioridade prioridade={p.prioridade} />
                          {!p.prioridade?.motivo && <span className="text-gray-300 max-md:hidden" aria-label="Sem prioridade">—</span>}
                        </td>
                        <td>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <SeloPrescricao status={p.sol_status} rotulo={decidir ? "Aguardando análise" : undefined} />
                            {novaVersao && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                <RefreshCcw size={12} aria-hidden="true" /> Versão {(p.versoes_anteriores ?? 0) + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="adm-col-acao">
                          <button
                            type="button"
                            onClick={() => navigate(`/autorizador/solicitacao/${p.sol_id}`)}
                            className={decidir ? BOTAO_PRIMARIO : BOTAO_SECUNDARIO}
                            aria-label={`${decidir ? "Analisar" : "Ver"}: ${p.pac_nome}, nº ${p.sol_id}`}
                          >
                            {decidir ? <>Analisar <ArrowRight size={16} aria-hidden="true" /></> : <><Eye size={16} aria-hidden="true" /> Ver</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500" role="status">
                {total === 1 ? "1 prescrição" : `${total} prescrições`}
              </p>
            </>
          )}
        </section>

        <Pagination paginaAtual={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />
      </main>

      <Footer />
    </div>
  );
}
