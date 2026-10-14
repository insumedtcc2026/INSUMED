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
import { mensagemErroApi, somenteDigitos } from "../utils/validacoes";
import { dentroDoPeriodo, formatarData } from "../utils/status";

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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setPrescricoes(await buscarHistoricoPrescricoes());
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar o histórico."));
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
  const filtradas = prescricoes
    .filter((p) => {
      const correspondeBusca =
        !termo ||
        p.pac_nome.toLowerCase().includes(termo) ||
        (digitos.length > 0 && somenteDigitos(p.pac_cpf).includes(digitos)) ||
        String(p.sol_id) === termo;
      // "Revisado" inclui o status antigo "Aprovado" (mesma etapa)
      const correspondeStatus =
        statusFiltro === "TODOS" ||
        p.sol_status === statusFiltro ||
        (statusFiltro === "Revisado" && p.sol_status === "Aprovado");
      return correspondeBusca && correspondeStatus && dentroDoPeriodo(p.sol_data_solicitacao, dataInicio, dataFim);
    })
    .sort((a, b) => String(b.sol_data_solicitacao).localeCompare(String(a.sol_data_solicitacao)));

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
            <SelectFiltro valor={statusFiltro} onMudar={setStatusFiltro} rotulo="Filtrar por status" opcoes={OPCOES_STATUS} />
            <FiltroPeriodo inicio={dataInicio} fim={dataFim} onInicio={setDataInicio} onFim={setDataFim} />
          </>
        }
        carregando={carregando}
        erro={erro}
        onTentarNovamente={carregar}
        vazio={filtradas.length === 0}
        mensagemVazio="Nenhuma prescrição encontrada com esses filtros."
        contagem={filtradas.length === 1 ? "1 prescrição" : `${filtradas.length} prescrições`}
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
      </PaginaLista>

      <Footer />
    </div>
  );
}
