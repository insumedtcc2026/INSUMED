import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { buscarPrescricoesAprovadas } from "../services/PrescricaoService";
import type { PrescricaoAprovada } from "../services/PrescricaoService";

import { useValidarToken } from "../hook/Validartoken.tsx";

import SidebarAut from "../components/universais/SidebarAut.tsx";
import Header from "../components/universais/HeaderAut.tsx";
import Footer from "../components/universais/Footer.tsx";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import PaginaLista, { FiltroPeriodo, SelectFiltro } from "../components/universais/PaginaLista";
import CartaoPrescricao from "../components/universais/CartaoPrescricao";
import { mensagemErroApi, somenteDigitos } from "../utils/validacoes";
import { dentroDoPeriodo, formatarData } from "../utils/status";

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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Revisado");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setPrescricoes(await buscarPrescricoesAprovadas());
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar as prescrições."));
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
  const filtradas = prescricoes.filter((p) => {
    const correspondeBusca =
      !termo ||
      p.pac_nome?.toLowerCase().includes(termo) ||
      (digitos.length > 0 && somenteDigitos(p.pac_cpf ?? "").includes(digitos)) ||
      String(p.sol_id) === termo;
    const correspondeStatus =
      statusFiltro === "Todos" ||
      p.sol_status === statusFiltro ||
      (statusFiltro === "Revisado" && p.sol_status === "Aprovado");
    return correspondeBusca && correspondeStatus && dentroDoPeriodo(p.sol_data_solicitacao, dataInicio, dataFim);
  });

  const aguardando = prescricoes.filter((p) => p.sol_status === "Revisado" || p.sol_status === "Aprovado").length;

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
          carregando
            ? "Prescrições revisadas pela unidade aguardando a sua decisão."
            : aguardando === 1
              ? "1 prescrição aguardando a sua decisão."
              : `${aguardando} prescrições aguardando a sua decisão.`
        }
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
        mensagemVazio={statusFiltro === "Revisado" ? "Nenhuma prescrição aguardando análise." : "Nenhuma prescrição encontrada com esses filtros."}
        contagem={filtradas.length === 1 ? "1 prescrição" : `${filtradas.length} prescrições`}
      >
        {filtradas.map((p) => (
          <CartaoPrescricao
            key={p.sol_id}
            pac_nome={p.pac_nome}
            pac_cpf={p.pac_cpf}
            codigo={p.sol_id}
            tituloInfo="Insumo e datas"
            linhasInfo={[
              p.ins_nome && `${p.sol_insumo_quant ?? "—"}x ${p.ins_nome}`,
              `Enviada em ${formatarData(p.sol_data_solicitacao)}`,
              p.pos_nome && `Posto: ${p.pos_nome}`,
            ]}
            status={p.sol_status}
            rotuloStatus={p.sol_status === "Revisado" || p.sol_status === "Aprovado" ? "Aguardando análise" : undefined}
            acaoTexto={p.sol_status === "Revisado" || p.sol_status === "Aprovado" ? "Analisar" : "Ver mais"}
            onAcao={() => navigate(`/autorizador/solicitacao/${p.sol_id}`)}
          />
        ))}
      </PaginaLista>

      <Footer />
    </div>
  );
}
