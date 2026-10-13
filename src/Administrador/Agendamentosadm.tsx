import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import AgendamentoCard from "../components/usuario-1/agendamentos/AgendamentoCard";
import NovoAgendamentoModal from "../components/usuario-1/agendamentos/NovoagendamentoModal";
import { cancelarComMotivo } from "../components/usuario-1/agendamentos/cancelarComMotivo";
import {
  listarAgendamentos,
  concluirAgendamento,
} from "../services/AgendamentoService";
import type { Agendamento, StatusAgendamento } from "../types/agendamento";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { useValidarToken } from "../hook/Validartoken";
import { mensagemErroApi } from "../utils/validacoes";
import axios from "axios";

type FiltroStatus = "todos" | StatusAgendamento;

/**
 * Página única de "Agendamentos" do ADM — substitui as antigas "Coletas
 * de Hoje", "Todos os Agendamentos" e "Histórico". O status, a busca
 * (nome/CPF/protocolo) e o intervalo de datas ficam todos na mesma tela,
 * no mesmo padrão de filtro/busca da página de Histórico da Prescrição.
 */
export default function Agendamentosadm() {
  const { verificando } = useValidarToken("ADMIN");
  const [searchParams] = useSearchParams();

  const cpfUrl = searchParams.get("cpf");
  const solIdUrl = searchParams.get("sol_id");
  // "Ver agendamento" na lista de solicitações abre já filtrado pelo CPF
  const buscaUrl = searchParams.get("busca");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // "Novo Agendamento" no menu lateral chega aqui com ?novo=1
  const [modalAberto, setModalAberto] = useState(searchParams.get("novo") === "1");

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState(buscaUrl ?? "");
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatus>(buscaUrl ? "todos" : "agendado");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [insumoInicial, setInsumoInicial] = useState("");
const [quantidadeInicial, setQuantidadeInicial] = useState(0);

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
      const dados = await listarAgendamentos({
        status: statusFiltro,
        busca,
        dataInicio,
        dataFim,
      });
      setAgendamentos(dados);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar os agendamentos."));
    } finally {
      setCarregando(false);
    }
  }, [statusFiltro, busca, dataInicio, dataFim, intervaloInvalido]);

useEffect(() => {
  async function carregarDadosSolicitacao() {
    if (!solIdUrl) return;

    try {
      const token = localStorage.getItem("token_admin");

      const resposta = await axios.get(
        `https://backend-insumed-lhac.vercel.app/solicitacao/${solIdUrl}`,
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
    const confirmacao = await Swal.fire({
      icon: "question",
      title: "Concluir coleta?",
      text: `O protocolo ${protocoloDe(sol_id)} será marcado como concluído e os insumos serão descontados do estoque.`,
      showCancelButton: true,
      confirmButtonText: "Concluir",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#32D74B",
      reverseButtons: true,
    });
    if (!confirmacao.isConfirmed) return;

    try {
      await concluirAgendamento(sol_id);
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
    }
  }

  // Motivo obrigatório, registrado no agendamento (ver cancelarComMotivo).
  async function handleCancelar(sol_id: number) {
    await cancelarComMotivo(sol_id, protocoloDe(sol_id));
    carregar();
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

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Agendamentos</h1>
            <p className="text-sm text-gray-500">
              Busque, filtre por status e veja todos os agendamentos de coleta.
            </p>
          </div>

          {/* Botão no fluxo da página (antes era flutuante e cobria o rodapé) */}
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="botao-novo-agendamento"
          >
            <span className="text-lg leading-none" aria-hidden="true">+</span> Novo Agendamento
          </button>
        </header>

        {/* Busca */}
        <div className="mb-4 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-gray-400" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou protocolo"
            aria-label="Buscar por nome, CPF ou protocolo"
            className="min-h-9 w-full text-base focus:outline-none focus:ring-0 sm:text-sm"
          />
        </div>

        {/* Filtros */}
        <div className="mb-2 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as FiltroStatus)}
            aria-label="Filtrar por status"
            className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-0 sm:text-sm"
          >
            <option value="todos">Todos os status</option>
            <option value="agendado">Agendado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              aria-label="Data inicial"
              className="min-h-11 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-0 sm:w-auto sm:text-sm"
            />
            <span className="text-sm text-gray-400">até</span>
            <input
              type="date"
              value={dataFim}
              min={dataInicio || undefined}
              onChange={(e) => setDataFim(e.target.value)}
              aria-label="Data final"
              className="min-h-11 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-0 sm:w-auto sm:text-sm"
            />
          </div>
        </div>

        {intervaloInvalido && (
          <p className="mb-4 text-sm text-rose-600" role="alert">
            A data inicial não pode ser maior que a data final.
          </p>
        )}

        <div className="mb-4" />

        {/* Lista */}
        {carregando && (
          <p className="py-10 text-center text-gray-400" role="status">Carregando agendamentos…</p>
        )}

        {!carregando && erro && (
          <div className="py-10 text-center" role="alert">
            <p className="text-rose-500">{erro}</p>
            <button
              type="button"
              onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && !intervaloInvalido && agendamentos.length === 0 && (
          <p className="py-10 text-center text-gray-400">
            Nenhum agendamento encontrado com esses filtros.
          </p>
        )}

        {!carregando && !erro && !intervaloInvalido && agendamentos.length > 0 && (
          <div className="flex flex-col gap-4">
            {agendamentos.map((agendamento) => (
              <AgendamentoCard
                key={agendamento.sol_id}
                agendamento={agendamento}
                showActions
                onConcluir={handleConcluir}
                onCancelar={handleCancelar}
              />
            ))}
          </div>
        )}
      </main>

      {modalAberto && (

        <NovoAgendamentoModal
        cpfInicial={cpfUrl || ""}
         insumoInicial={insumoInicial}
  quantidadeInicial={quantidadeInicial}
          solOrigemId={solIdUrl ? Number(solIdUrl) : undefined}
          onClose={() => setModalAberto(false)}
          onSuccess={() => {
            setModalAberto(false);
            carregar();
          }}
        />
      )}

      <Footer />
    </div>
  );
}
