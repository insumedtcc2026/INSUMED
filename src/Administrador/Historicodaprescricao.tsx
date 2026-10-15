import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { buscarHistoricoPrescricoes } from "../services/PrescricaoService";
import type { HistoricoPrescricao } from "../services/PrescricaoService";

import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import PaginaLista, { FiltroPeriodo, SelectFiltro } from "../components/universais/PaginaLista";
import CartaoPrescricao from "../components/universais/CartaoPrescricao";
import { useValidarToken } from "../hook/Validartoken";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import { mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";

const POR_PAGINA = 20;

const OPCOES_STATUS: [string, string][] = [
  ["TODOS", "Todos os status"],
  ["Revisado", "Revisado"],
  ["Reenvio", "Reenvio"],
  ["Nao Autorizado", "Não autorizado"],
];

const MOTIVO_REENVIO: Record<string, string> = {
  FOTO_SEM_QUALIDADE: "Foto sem qualidade",
  PRESCRICAO_VENCIDA: "Prescrição vencida",
  INFORMACAO_DIFERENTE: "Informação diferente",
  OUTRO: "Outro motivo",
};

/**
 * Histórico da prescrição (admin): prescrições já analisadas pela
 * unidade, no mesmo padrão visual da página de Agendamentos.
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

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
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

  // filtro novo volta para a primeira página
  const mudarFiltro = (aplicar: () => void) => {
    aplicar();
    setPagina(1);
  };

  const filtradas = prescricoes;

  function abrir(p: HistoricoPrescricao) {
    if (p.sol_status === "Nao Autorizado") navigate(`/administrador/prescricao/nao-autorizada/${p.sol_id}`);
    else navigate(`/administrador/prescricao/autorizarprescricao/${p.sol_id}`);
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
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <PaginaLista
        titulo="Histórico da prescrição"
        subtitulo="Prescrições já analisadas pela unidade: revisadas, com reenvio pedido ou não autorizadas."
        busca={busca}
        onBusca={setBusca}
        placeholderBusca="Buscar por nome, CPF ou código"
        filtros={
          <>
            <SelectFiltro valor={statusFiltro} onMudar={(v) => mudarFiltro(() => setStatusFiltro(v))} rotulo="Filtrar por status" opcoes={OPCOES_STATUS} />
            <FiltroPeriodo
              inicio={dataInicio}
              fim={dataFim}
              onInicio={(v) => mudarFiltro(() => setDataInicio(v))}
              onFim={(v) => mudarFiltro(() => setDataFim(v))}
            />
          </>
        }
        carregando={carregando}
        erro={erro}
        onTentarNovamente={carregar}
        vazio={filtradas.length === 0}
        mensagemVazio="Nenhuma prescrição encontrada com esses filtros."
        contagem={total === 1 ? "1 prescrição" : `${total} prescrições`}
      >
        {filtradas.map((p) => (
          <CartaoPrescricao
            key={p.sol_id}
            pac_nome={p.pac_nome}
            pac_cpf={p.pac_cpf}
            codigo={p.sol_id}
            tituloInfo={p.ins_nome ? "Insumo e datas" : "Datas"}
            linhasInfo={[
              p.ins_nome && `${p.sol_insumo_quant ?? "—"}x ${p.ins_nome}`,
              `Enviada em ${formatarData(p.sol_data_solicitacao)}`,
              p.sol_data_vencimento && `Vence em ${formatarData(p.sol_data_vencimento)}`,
            ]}
            status={p.sol_status}
            acaoTexto="Ver mais"
            onAcao={() => abrir(p)}
            rodape={
              (p.sol_status === "Reenvio" && p.sol_motivo_reenvio) || (p.sol_status === "Nao Autorizado" && p.sol_motivo_nao_autorizado) ? (
                <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <span className="font-medium">Motivo:</span>{" "}
                  {p.sol_status === "Reenvio"
                    ? MOTIVO_REENVIO[p.sol_motivo_reenvio ?? ""] ?? p.sol_motivo_reenvio
                    : p.sol_motivo_nao_autorizado}
                </p>
              ) : undefined
            }
          />
        ))}
        <Pagination paginaAtual={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />
      </PaginaLista>

      <Footer />
    </div>
  );
}
