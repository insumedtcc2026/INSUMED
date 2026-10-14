import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { buscarPrescricoesPendentes } from "../services/PrescricaoService";
import type { PrescricaoPendente } from "../services/PrescricaoService";

import { useValidarToken } from "../hook/Validartoken.tsx";

import Sidebaradm from "../components/universais/Siderbaradm.tsx";
import Header from "../components/universais/HeaderAdm.tsx";
import Footer from "../components/universais/Footer.tsx";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import PaginaLista, { FiltroPeriodo, SelectFiltro } from "../components/universais/PaginaLista";
import CartaoPrescricao from "../components/universais/CartaoPrescricao";
import { mensagemErroApi, somenteDigitos } from "../utils/validacoes";
import { dentroDoPeriodo, formatarData } from "../utils/status";

const OPCOES_STATUS: [string, string][] = [
  ["Todos", "Todos os status"],
  ["Pendente", "Pendente"],
  ["Revisado", "Revisado"],
  ["Autorizado", "Autorizado"],
  ["ParaAgendar", "Autorizado, falta agendar"],
  ["Nao Autorizado", "Não autorizado"],
];

/**
 * Solicitações (admin): prescrições do posto em andamento, no mesmo
 * padrão visual da página de Agendamentos (busca, filtros e cards).
 */
export default function Pendencias() {
  const navigate = useNavigate();
  // a Home do admin abre esta tela já filtrada (ex.: ?status=ParaAgendar)
  const [searchParams] = useSearchParams();
  const { verificando } = useValidarToken("ADMIN");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prescricoes, setPrescricoes] = useState<PrescricaoPendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState(searchParams.get("status") ?? "Todos");
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
  const filtradas = prescricoes.filter((p) => {
    const correspondeBusca =
      !termo ||
      p.pac_nome.toLowerCase().includes(termo) ||
      (digitos.length > 0 && somenteDigitos(p.pac_cpf).includes(digitos)) ||
      String(p.sol_id) === termo;
    // "ParaAgendar" = autorizada que ainda não virou agendamento
    const correspondeStatus =
      statusFiltro === "Todos" ||
      (statusFiltro === "ParaAgendar"
        ? p.sol_status === "Autorizado" && !p.agendamento_ativo
        : p.sol_status === statusFiltro);
    return correspondeBusca && correspondeStatus && dentroDoPeriodo(p.sol_data_solicitacao, dataInicio, dataFim);
  });

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

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <PaginaLista
        titulo="Solicitações"
        subtitulo="Prescrições enviadas pelos pacientes: revise, acompanhe a autorização e agende."
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
        mensagemVazio="Nenhuma solicitação encontrada com esses filtros."
        contagem={filtradas.length === 1 ? "1 solicitação" : `${filtradas.length} solicitações`}
      >
        {filtradas.map((p) => (
          <CartaoPrescricao
            key={p.sol_id}
            pac_nome={p.pac_nome}
            pac_cpf={p.pac_cpf}
            codigo={p.sol_id}
            linhasInfo={[`Enviada em ${formatarData(p.sol_data_solicitacao)}`]}
            status={p.sol_status}
            rotuloStatus={p.sol_status === "Autorizado" && p.agendamento_ativo ? "Agendado" : undefined}
            acaoTexto={p.sol_status !== "Autorizado" ? "Ver mais" : p.agendamento_ativo ? "Ver agendamento" : "Agendar"}
            onAcao={() => abrir(p)}
          />
        ))}
      </PaginaLista>

      <Footer />
    </div>
  );
}
