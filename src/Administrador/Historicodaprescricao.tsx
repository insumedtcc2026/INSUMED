import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Files, Repeat } from "lucide-react";

import { buscarHistoricoPrescricoes } from "../services/PrescricaoService";
import type { HistoricoPrescricao } from "../services/PrescricaoService";

import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import { SeloPrescricao } from "../components/universais/CartaoPrescricao";
import {
  AbasAdmin, AvatarIniciais, BOTAO_SECUNDARIO, CabecalhoAdmin, EstadoLista, FiltrosAdmin, type AbaAdmin,
} from "../components/universais/AdminUI";
import { useValidarToken } from "../hook/Validartoken";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import { exibirCPF, hojeISO, mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";
import { resumoInsumos } from "../utils/itensPrescricao";

const POR_PAGINA = 20;

type Status = "TODOS" | "Revisado" | "Reenvio" | "Nao Autorizado";
const STATUS: Status[] = ["TODOS", "Revisado", "Reenvio", "Nao Autorizado"];
const ROTULO: Record<Status, string> = {
  TODOS: "Todas",
  Revisado: "Revisado",
  Reenvio: "Reenvio",
  "Nao Autorizado": "Não autorizado",
};

const MOTIVO_REENVIO: Record<string, string> = {
  FOTO_SEM_QUALIDADE: "Foto sem qualidade",
  PRESCRICAO_VENCIDA: "Prescrição vencida",
  INFORMACAO_DIFERENTE: "Informação diferente",
  OUTRO: "Outro motivo",
};

/**
 * Histórico da prescrição (admin): prescrições já analisadas pela
 * unidade, numa tabela com abas por status (com a quantidade de cada um),
 * insumos, validade e o motivo do reenvio ou da não autorização.
 */
export default function Historico() {
  const navigate = useNavigate();
  const { verificando } = useValidarToken("ADMIN");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prescricoes, setPrescricoes] = useState<HistoricoPrescricao[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [contagem, setContagem] = useState<Partial<Record<Status, number>>>({});

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<Status>("TODOS");
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

  // Busca, filtros e paginação são feitos no banco: a página não carrega
  // o histórico inteiro da unidade de uma vez.
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await buscarHistoricoPrescricoes({
        busca: buscaAplicada,
        status: statusFiltro,
        data_inicio: dataInicio,
        data_fim: dataFim,
        page: pagina,
        porPagina: POR_PAGINA,
      });
      setPrescricoes(resposta.itens);
      setTotal(resposta.total);
      setTotalPaginas(resposta.totalPaginas);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar o histórico."));
    } finally {
      setCarregando(false);
    }
  }, [buscaAplicada, statusFiltro, dataInicio, dataFim, pagina]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  // quantidade de cada status com a busca e o período atuais (só o total)
  useEffect(() => {
    if (verificando) return;
    let ativo = true;
    Promise.all(
      STATUS.map((status) =>
        buscarHistoricoPrescricoes({ busca: buscaAplicada, status, data_inicio: dataInicio, data_fim: dataFim, page: 1, porPagina: 1 })
          .then((r) => [status, r.total] as const)
          .catch(() => [status, undefined] as const),
      ),
    ).then((pares) => ativo && setContagem(Object.fromEntries(pares.filter(([, n]) => n != null)) as Record<Status, number>));
    return () => {
      ativo = false;
    };
  }, [verificando, buscaAplicada, dataInicio, dataFim]);

  // filtro novo volta para a primeira página
  const mudarFiltro = (aplicar: () => void) => {
    aplicar();
    setPagina(1);
  };

  function abrir(p: HistoricoPrescricao) {
    if (p.sol_status === "Nao Autorizado") navigate(`/administrador/prescricao/nao-autorizada/${p.sol_id}`);
    else navigate(`/administrador/prescricao/autorizarprescricao/${p.sol_id}`);
  }

  const ABAS: AbaAdmin<Status>[] = STATUS.map((s) => ({ id: s, rotulo: ROTULO[s], numero: contagem[s] ?? null }));
  const hoje = hojeISO();
  const inicioLista = (pagina - 1) * POR_PAGINA + 1;

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
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <main className="compensa-header mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="pt-6">
          <CabecalhoAdmin
            titulo="Histórico da prescrição"
            subtitulo="Prescrições já analisadas pela unidade: revisadas, com reenvio pedido ou não autorizadas."
            acoes={
              <button type="button" className={BOTAO_SECUNDARIO} onClick={() => navigate("/VerSolicitaçoes")}>
                <Files size={17} aria-hidden="true" /> Voltar às solicitações
              </button>
            }
          />

          <AbasAdmin abas={ABAS} ativa={statusFiltro} onMudar={(s) => mudarFiltro(() => setStatusFiltro(s))} rotulo="Status" />

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

          <section className="adm-cartao">
            <EstadoLista
              carregando={carregando}
              erro={erro}
              onTentarNovamente={carregar}
              vazio={prescricoes.length === 0}
              mensagemVazio="Nenhuma prescrição encontrada com esses filtros."
            />
            {!carregando && !erro && prescricoes.length > 0 && (
              <>
                <table className="adm-tabela">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Código</th>
                      <th>Insumos</th>
                      <th>Enviada</th>
                      <th>Validade</th>
                      <th>Situação e motivo</th>
                      <th className="adm-col-acao"><span className="sr-only">Ação</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescricoes.map((p) => {
                      const motivo =
                        p.sol_status === "Reenvio" && p.sol_motivo_reenvio
                          ? MOTIVO_REENVIO[p.sol_motivo_reenvio] ?? p.sol_motivo_reenvio
                          : p.sol_status === "Nao Autorizado"
                            ? p.sol_motivo_nao_autorizado
                            : null;
                      const vencida = Boolean(p.sol_data_vencimento && p.sol_data_vencimento.slice(0, 10) < hoje);
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
                            {resumoInsumos(p) || "—"}
                            {p.sol_periodicidade_dias ? (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Repeat size={12} aria-hidden="true" /> Uso contínuo · a cada {p.sol_periodicidade_dias} dias
                              </span>
                            ) : null}
                          </td>
                          <td data-rotulo="Enviada" className="whitespace-nowrap">{formatarData(p.sol_data_solicitacao)}</td>
                          <td data-rotulo="Validade" className="whitespace-nowrap">
                            {p.sol_data_vencimento ? (
                              <span className={vencida ? "font-semibold text-red-700" : ""}>
                                {formatarData(p.sol_data_vencimento)}
                                {vencida && <span className="block text-xs font-normal text-gray-500 max-md:inline max-md:before:content-['_·_']">vencida</span>}
                              </span>
                            ) : "—"}
                          </td>
                          <td>
                            <SeloPrescricao status={p.sol_status} />
                            {motivo && (
                              <span className="mt-1.5 block max-w-64 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                                {motivo}
                              </span>
                            )}
                          </td>
                          <td className="adm-col-acao">
                            <button
                              type="button"
                              onClick={() => abrir(p)}
                              className={BOTAO_SECUNDARIO}
                              aria-label={`Ver prescrição nº ${p.sol_id} de ${p.pac_nome}`}
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 px-4 py-2 sm:flex-row">
                  <p className="text-sm text-gray-500" role="status">
                    Mostrando <strong>{inicioLista}–{inicioLista + prescricoes.length - 1}</strong> de <strong>{total}</strong>{" "}
                    {total === 1 ? "prescrição" : "prescrições"}
                  </p>
                  <Pagination paginaAtual={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
