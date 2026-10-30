import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { useValidarToken } from "../hook/Validartoken.tsx";
import { listarAgendamentosDoPaciente } from "../services/AgendamentoService";
import AgendamentoCardPaciente from "../components/usuario-1/agendamentos/Agendamentocardpaciente";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import type { Agendamento } from "../types/agendamento";
import { hojeISO, mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";
import { faltamParaColeta, textoTurno } from "../utils/agenda";

const ITENS_POR_PAGINA = 4;

type Aba = "proximos" | "anteriores";


/**
 * "Meus agendamentos" do paciente, separado em "Próximos" (só coletas
 * ainda marcadas, a mais próxima em destaque) e "Anteriores" (coletadas
 * e canceladas).
 */
export default function Agendamentos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const { verificando } = useValidarToken("PACIENTE");

  const [aba, setAba] = useState<Aba>("proximos");
  const [itens, setItens] = useState<Agendamento[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // ?sol_id= (vindo de uma notificação): mostra só aquele agendamento
  const [params, setParams] = useSearchParams();
  const foco = Number(params.get("sol_id")) || undefined;

  const carregar = useCallback(async (pagina: number, qual: Aba) => {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await listarAgendamentosDoPaciente("", pagina, ITENS_POR_PAGINA, qual, foco);
      setItens(resultado.itens);
      setPaginaAtual(resultado.paginaAtual);
      setTotalPaginas(resultado.totalPaginas);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar seus agendamentos."));
    } finally {
      setCarregando(false);
    }
  }, [foco]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(() => carregar(1, aba), 0);
    return () => clearTimeout(t);
  }, [verificando, aba, carregar]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  // Em "Próximos", a primeira coleta (mais próxima) ganha destaque
  const destaque = !foco && aba === "proximos" && paginaAtual === 1 ? itens[0] : undefined;
  const demais = destaque ? itens.slice(1) : itens;

  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      <Header onMenuClick={toggleSidebar} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/home" />
      </div>

      <main className="pagina-conteudo mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-5 text-2xl font-bold text-blue-700">Meus agendamentos</h1>

        {foco && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <span>Mostrando o agendamento da notificação.</span>
            <button type="button" onClick={() => setParams({})} className="min-h-10 font-semibold text-blue-700 hover:underline">
              Ver todos os agendamentos
            </button>
          </div>
        )}

        {!foco && (
        <div className="mb-5 grid grid-cols-2 rounded-full bg-white p-1 shadow-sm" role="tablist" aria-label="Filtrar agendamentos">
          {([
            ["proximos", "Próximos"],
            ["anteriores", "Anteriores"],
          ] as const).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={aba === valor}
              onClick={() => setAba(valor)}
              className={`min-h-11 rounded-full text-sm font-semibold transition ${
                aba === valor ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {texto}
            </button>
          ))}
        </div>
        )}

        {carregando && <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>}

        {!carregando && erro && (
          <div className="py-10 text-center" role="alert">
            <p className="text-rose-500">{erro}</p>
            <button
              type="button"
              onClick={() => carregar(paginaAtual, aba)}
              className="mt-3 min-h-11 rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && itens.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-gray-600">
              {foco ? "Agendamento não encontrado." : aba === "proximos" ? "Você não tem coletas marcadas." : "Nenhum agendamento anterior."}
            </p>
            {aba === "proximos" && (
              <Link to="/prescricoes" className="mt-3 inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
                Acompanhar minhas prescrições →
              </Link>
            )}
          </div>
        )}

        {!carregando && !erro && destaque && (
          <section className="mb-6" aria-labelledby="proxima-coleta">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 id="proxima-coleta" className="text-lg font-semibold text-gray-800">Próxima coleta</h2>
              <span className="text-sm font-semibold text-blue-700">
                {formatarData(destaque.sol_data_de_coleta)}
                {destaque.sol_turno ? `, ${textoTurno(destaque.sol_turno)}` : ""} · {faltamParaColeta(destaque.sol_data_de_coleta, hojeISO())}
              </span>
            </div>
            <div className="rounded-[1.75rem] p-[2px]" style={{ background: "var(--gradiente-primario)" }}>
              <AgendamentoCardPaciente agendamento={destaque} onAtualizar={() => carregar(paginaAtual, aba)} />
            </div>
          </section>
        )}

        {!carregando && !erro && demais.length > 0 && (
          <>
            {destaque && <h2 className="mb-3 text-lg font-semibold text-gray-800">Depois</h2>}
            <div className="flex flex-col gap-4">
              {demais.map((agendamento) => (
                <AgendamentoCardPaciente key={agendamento.sol_id} agendamento={agendamento} onAtualizar={() => carregar(paginaAtual, aba)} />
              ))}
            </div>
          </>
        )}

        {!carregando && !erro && totalPaginas > 1 && (
          <Pagination
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            onMudarPagina={(p) => carregar(p, aba)}
          />
        )}
      </main>

      <Footer />

    </div>
  );
}
