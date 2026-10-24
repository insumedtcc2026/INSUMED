import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import TabelaAgendamentos from "../components/usuario-1/agendamentos/TabelaAgendamentos";
import { AbasAdmin, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CabecalhoAdmin, EstadoLista, FiltrosAdmin, type AbaAdmin } from "../components/universais/AdminUI";
import { atualizarContadoresAdmin } from "../hook/useContadoresAdmin";
import { CalendarPlus, CalendarSync, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NovoAgendamentoModal from "../components/usuario-1/agendamentos/NovoagendamentoModal";
import { cancelarComMotivo } from "../components/usuario-1/agendamentos/cancelarComMotivo";
import { confirmarEntrega } from "../components/universais/acoesAdmin";
import {
  listarAgendamentosPaginado,
  concluirAgendamento,
} from "../services/AgendamentoService";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import type { Agendamento, ItemNovoAgendamento, StatusAgendamento } from "../types/agendamento";
import { useValidarToken } from "../hook/Validartoken";
import { mensagemErroApi } from "../utils/validacoes";
import axios from "axios";
import { API_URL } from "../config";

type FiltroStatus = "todos" | StatusAgendamento;
type Aba = FiltroStatus | "pedidos";

const POR_PAGINA = 20;

/**
 * Página única de "Agendamentos" do ADM — substitui as antigas "Coletas
 * de Hoje", "Todos os Agendamentos" e "Histórico". O status, a busca
 * (nome/CPF/protocolo) e o intervalo de datas ficam todos na mesma tela,
 * no mesmo padrão de filtro/busca da página de Histórico da Prescrição.
 */
export default function Agendamentosadm() {
  const { verificando } = useValidarToken("ADMIN");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cpfUrl = searchParams.get("cpf");
  const solIdUrl = searchParams.get("sol_id");
  // "Ver agendamento" na lista de solicitações abre já filtrado pelo CPF
  const buscaUrl = searchParams.get("busca");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // aba "Pedidos de outra data" (link do sino: ?aba=pedidos)
  const [abaPedidos, setAbaPedidos] = useState(searchParams.get("aba") === "pedidos");
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalAgendados, setTotalAgendados] = useState<number | null>(null);
  // "Novo Agendamento" no menu lateral chega aqui com ?novo=1
  const [modalAberto, setModalAberto] = useState(searchParams.get("novo") === "1");

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  // paginação feita no banco (a agenda do posto só cresce)
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState(buscaUrl ?? "");
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatus>(buscaUrl ? "todos" : "agendado");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [insumoInicial, setInsumoInicial] = useState("");
const [quantidadeInicial, setQuantidadeInicial] = useState(0);
  const [itensIniciais, setItensIniciais] = useState<ItemNovoAgendamento[]>([]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const intervaloInvalido = Boolean(dataInicio && dataFim && dataInicio > dataFim);

  const carregar = useCallback(async () => {
    if (intervaloInvalido) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const [dados, pedidos, agendados] = await Promise.all([
        listarAgendamentosPaginado({
          status: abaPedidos ? "todos" : statusFiltro,
          busca,
          dataInicio,
          dataFim,
          ...(abaPedidos ? { pedido: "pendente" as const } : {}),
        }, pagina, POR_PAGINA),
        listarAgendamentosPaginado({ status: "todos", pedido: "pendente" }, 1, 1),
        listarAgendamentosPaginado({ status: "agendado", busca, dataInicio, dataFim }, 1, 1),
      ]);
      setTotalAgendados(agendados.total);
      setAgendamentos(dados.itens);
      setTotal(dados.total);
      setTotalPaginas(dados.totalPaginas);
      setTotalPedidos(pedidos.total);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar os agendamentos."));
    } finally {
      setCarregando(false);
    }
  }, [statusFiltro, busca, dataInicio, dataFim, intervaloInvalido, pagina, abaPedidos]);

  // o link do sino pode chegar com a página já aberta
  const abaUrl = searchParams.get("aba");
  const [abaUrlVista, setAbaUrlVista] = useState(abaUrl);
  if (abaUrl !== abaUrlVista) {
    setAbaUrlVista(abaUrl);
    if (abaUrl === "pedidos") setAbaPedidos(true);
  }

useEffect(() => {
  async function carregarDadosSolicitacao() {
    if (!solIdUrl) return;

    try {
      const token = localStorage.getItem("token_admin");

      const resposta = await axios.get(
        `${API_URL}/solicitacao/${solIdUrl}`,
      // `"http://localhost:3344/solicitacao/${solIdUrl}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInsumoInicial(resposta.data.ins_nome || "");
      setQuantidadeInicial(
        Number(resposta.data.sol_insumo_quant || 0)
      );
      // prescrição com vários insumos: todos já entram no agendamento
      setItensIniciais(
        (resposta.data.itens ?? []).map((i: { ins_id: number; ins_nome: string; quantidade: number }) => ({
          ins_id: i.ins_id, ins_nome: i.ins_nome, quantidade: Number(i.quantidade),
        }))
      );
    } catch (error) {
      console.error(
        "Erro ao buscar dados da solicitação:",
        error
      );
    }
  }

  carregarDadosSolicitacao();
}, [solIdUrl]);

  useEffect(() => {
    if (verificando) return;
    // Pequeno debounce pra busca/data não disparar uma chamada a cada tecla
    const t = setTimeout(carregar, 300);
    return () => clearTimeout(t);
  }, [carregar, verificando]);

  useEffect(() => {
  if (cpfUrl) {
    setBusca(cpfUrl);
    setModalAberto(true);
  }
}, [cpfUrl]);

  // clicar em "Novo Agendamento" no menu estando já nesta página
  const novoUrl = searchParams.get("novo");
  useEffect(() => {
    if (novoUrl === "1") setModalAberto(true);
  }, [novoUrl]);


  function protocoloDe(sol_id: number) {
    return agendamentos.find((a) => a.sol_id === sol_id)?.sol_protocolo ?? `#${sol_id}`;
  }

  async function handleConcluir(sol_id: number) {
    const ag = agendamentos.find((a) => a.sol_id === sol_id);
    const confirmacao = await confirmarEntrega({
      pac_id: ag?.paciente.pac_id,
      protocolo: protocoloDe(sol_id),
      paciente: ag?.paciente.pac_nome ?? "",
      linhas: ["Os insumos serão descontados do estoque."],
      textoConfirmar: "Concluir",
    });
    if (!confirmacao) return;

    try {
      await concluirAgendamento(sol_id, confirmacao.retirado_por);
      Swal.fire({
        icon: "success",
        title: "Coleta concluída!",
        text: "O estoque foi atualizado.",
        confirmButtonColor: "#00ce11",
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Não foi possível concluir",
        text: mensagemErroApi(e, "Tente novamente em instantes."),
        confirmButtonColor: "#d33",
      });
    } finally {
      carregar();
      atualizarContadoresAdmin();
    }
  }

  // Motivo obrigatório, registrado no agendamento (ver cancelarComMotivo).
  async function handleCancelar(sol_id: number) {
    await cancelarComMotivo(sol_id, protocoloDe(sol_id));
    carregar();
    atualizarContadoresAdmin();
  }

  const abaAtual: Aba = abaPedidos ? "pedidos" : statusFiltro;
  const ABAS: AbaAdmin<Aba>[] = [
    { id: "agendado", rotulo: "Agendados", numero: totalAgendados },
    { id: "pedidos", rotulo: "Pedidos de outra data", Icone: CalendarSync, numero: totalPedidos, atencao: true },
    { id: "concluido", rotulo: "Concluídos" },
    { id: "cancelado", rotulo: "Cancelados" },
    { id: "nao_compareceu", rotulo: "Não compareceu" },
    { id: "todos", rotulo: "Todos" },
  ];

  function mudarAba(aba: Aba) {
    if (aba === "pedidos") {
      setAbaPedidos(true);
    } else {
      setAbaPedidos(false);
      setStatusFiltro(aba);
    }
    setPagina(1);
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
      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />
      <HeaderAdm onMenuClick={toggleSidebar} />

      <main className="compensa-header mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="pt-6">
          <CabecalhoAdmin
            titulo="Agendamentos"
            subtitulo="Todos os agendamentos de coleta da unidade, agrupados por dia."
            acoes={
              <>
                <button type="button" className={BOTAO_SECUNDARIO} onClick={() => navigate("/coletas-hoje")}>
                  <ClipboardCheck size={17} aria-hidden="true" /> Coletas de hoje
                </button>
                <button type="button" className={BOTAO_PRIMARIO} onClick={() => setModalAberto(true)}>
                  <CalendarPlus size={17} aria-hidden="true" /> Novo agendamento
                </button>
              </>
            }
          />

          <AbasAdmin abas={ABAS} ativa={abaAtual} onMudar={mudarAba} rotulo="Tipo de lista" />

          <FiltrosAdmin
            busca={busca}
            onBusca={(v) => { setBusca(v); setPagina(1); }}
            placeholder="Buscar por nome, CPF ou protocolo"
            inicio={dataInicio}
            fim={dataFim}
            onInicio={(v) => { setDataInicio(v); setPagina(1); }}
            onFim={(v) => { setDataFim(v); setPagina(1); }}
            onLimpar={() => { setBusca(""); setDataInicio(""); setDataFim(""); setPagina(1); }}
          />

          {intervaloInvalido && (
            <p className="mb-4 text-sm text-rose-600" role="alert">
              A data inicial não pode ser maior que a data final.
            </p>
          )}

          <section className="adm-cartao">
            <EstadoLista
              carregando={carregando}
              erro={erro}
              onTentarNovamente={carregar}
              vazio={!intervaloInvalido && agendamentos.length === 0}
              mensagemVazio={abaPedidos ? "Nenhum pedido de outra data esperando resposta." : "Nenhum agendamento encontrado com esses filtros."}
            />
            {!carregando && !erro && !intervaloInvalido && agendamentos.length > 0 && (
              <>
                <TabelaAgendamentos
                  agendamentos={agendamentos}
                  onConcluir={handleConcluir}
                  onCancelar={handleCancelar}
                  onAtualizar={() => { carregar(); atualizarContadoresAdmin(); }}
                />
                <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 px-4 py-2 sm:flex-row">
                  <p className="text-sm text-gray-500" role="status">
                    {total <= POR_PAGINA
                      ? (total === 1 ? "1 agendamento" : `${total} agendamentos`)
                      : `Mostrando ${(pagina - 1) * POR_PAGINA + 1}–${(pagina - 1) * POR_PAGINA + agendamentos.length} de ${total} agendamentos`}
                  </p>
                  <Pagination paginaAtual={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {modalAberto && (
        <NovoAgendamentoModal
          cpfInicial={cpfUrl || ""}
          insumoInicial={insumoInicial}
          quantidadeInicial={quantidadeInicial}
          itensIniciais={itensIniciais}
          solOrigemId={solIdUrl ? Number(solIdUrl) : undefined}
          onClose={() => setModalAberto(false)}
          onSuccess={() => {
            setModalAberto(false);
            carregar();
            atualizarContadoresAdmin();
          }}
        />
      )}

      <Footer />
    </div>
  );
}
