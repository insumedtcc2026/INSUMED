import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { buscarPrescricoesAprovadas } from "../services/PrescricaoService";
import type { PrescricaoAprovada } from "../services/PrescricaoService";

import { useValidarToken } from "../hook/Validartoken.tsx";

import SidebarAut from "../components/universais/SidebarAut.tsx";
import Header from "../components/universais/HeaderAut.tsx";
import Footer from "../components/universais/Footer.tsx";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import PaginaLista, { FiltroPeriodo, SelectFiltro } from "../components/universais/PaginaLista";
import CartaoPrescricao from "../components/universais/CartaoPrescricao";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import { mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";
import { resumoInsumos } from "../utils/itensPrescricao";

const POR_PAGINA = 20;

// Por padrão o autorizador vê primeiro o que espera a decisão dele
const OPCOES_STATUS: [string, string][] = [
  ["Revisado", "Aguardando análise"],
  ["Todos", "Todos os status"],
  ["Autorizado", "Autorizado"],
  ["Nao Autorizado", "Não autorizado"],
];

/**
 * Prescrições para análise (autorizador), no mesmo padrão visual da
 * página de Agendamentos do admin.
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

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  // a Home do autorizador abre esta tela já filtrada (ex.: ?status=Autorizado)
  const [searchParams] = useSearchParams();
  const [statusFiltro, setStatusFiltro] = useState(searchParams.get("status") ?? "Revisado");
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
      setErro(mensagemErroApi(e, "Não foi possível carregar as prescrições."));
    } finally {
      setCarregando(false);
    }
  }, [buscaAplicada, statusFiltro, dataInicio, dataFim, pagina]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  const mudarFiltro = (aplicar: () => void) => {
    aplicar();
    setPagina(1);
  };

  const filtradas = prescricoes;
  const aguardandoNaTela = statusFiltro === "Revisado";

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

      <PaginaLista
        titulo="Prescrições para análise"
        subtitulo={
          carregando || !aguardandoNaTela
            ? "Prescrições revisadas pela unidade aguardando a sua decisão."
            : total === 1
              ? "1 prescrição aguardando a sua decisão."
              : `${total} prescrições aguardando a sua decisão.`
        }
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
        mensagemVazio={statusFiltro === "Revisado" ? "Nenhuma prescrição aguardando análise." : "Nenhuma prescrição encontrada com esses filtros."}
        contagem={total === 1 ? "1 prescrição" : `${total} prescrições`}
      >
        {filtradas.map((p) => (
          <CartaoPrescricao
            key={p.sol_id}
            pac_nome={p.pac_nome}
            pac_cpf={p.pac_cpf}
            codigo={p.sol_id}
            tituloInfo="Insumos e datas"
            linhasInfo={[
              resumoInsumos(p),
              p.sol_periodicidade_dias ? `Uso contínuo: a cada ${p.sol_periodicidade_dias} dias` : null,
              `Enviada em ${formatarData(p.sol_data_solicitacao)}`,
              p.pos_nome && `Posto: ${p.pos_nome}`,
              (p.versoes_anteriores ?? 0) > 0 && `Nova versão enviada pelo paciente (versão ${(p.versoes_anteriores ?? 0) + 1})`,
            ]}
            status={p.sol_status}
            rotuloStatus={p.sol_status === "Revisado" || p.sol_status === "Aprovado" ? "Aguardando análise" : undefined}
            acaoTexto={p.sol_status === "Revisado" || p.sol_status === "Aprovado" ? "Analisar" : "Ver mais"}
            onAcao={() => navigate(`/autorizador/solicitacao/${p.sol_id}`)}
          />
        ))}
        <Pagination paginaAtual={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />
      </PaginaLista>

      <Footer />
    </div>
  );
}
