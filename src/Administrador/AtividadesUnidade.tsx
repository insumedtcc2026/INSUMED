import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import { AbasUnidade } from "../components/universais/AdminUI";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import { useValidarToken } from "../hook/Validartoken";
import { buscarAtividades, type Atividade, type FiltrosAtividades } from "../services/PainelService";
import { ACOES_HISTORICO, PAPEL_USUARIO, formatarDataHora } from "../utils/acoesHistorico";
import { mensagemErroApi } from "../utils/validacoes";

const FILTROS_VAZIOS: FiltrosAtividades = { data_inicio: "", data_fim: "", acao: "", usuario: "", busca: "" };

/**
 * Atividades da unidade (admin): tudo o que foi feito nas prescrições e
 * agendamentos do posto — quem revisou, autorizou, agendou, entregou,
 * cancelou ou deixou recado — com filtros por data, tipo,
 * pessoa e paciente/protocolo.
 */
export default function AtividadesUnidade() {
  const { verificando } = useValidarToken("ADMIN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosAtividades>(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<{ itens: Atividade[]; total: number; totalPaginas: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const intervaloInvalido = Boolean(filtros.data_inicio && filtros.data_fim && filtros.data_inicio > filtros.data_fim);

  const carregar = useCallback(async (f: FiltrosAtividades, p: number) => {
    setCarregando(true);
    setErro(null);
    try {
      const r = await buscarAtividades({ ...f, page: p });
      setDados(r);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar as atividades."));
    } finally {
      setCarregando(false);
    }
  }, []);

  // recarrega ao mudar filtros/página (com pequena espera para a digitação)
  useEffect(() => {
    if (verificando || intervaloInvalido) return;
    const t = setTimeout(() => carregar(filtros, pagina), 350);
    return () => clearTimeout(t);
  }, [verificando, filtros, pagina, intervaloInvalido, carregar]);

  function mudar(campo: keyof FiltrosAtividades, valor: string) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
    setPagina(1);
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const campo = "min-h-11 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-base focus:border-blue-500 focus:outline-none sm:text-sm";
  const temFiltro = Object.values(filtros).some(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <main className="compensa-header mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="pt-6">
          <AbasUnidade />
        </div>
        <header className="mb-5">
          <h1 className="text-2xl font-semibold text-gray-800">Atividades da unidade</h1>
          <p className="text-sm text-gray-500">
            Tudo o que foi registrado nas prescrições e agendamentos da unidade, do mais recente para o mais antigo.
          </p>
        </header>

        {/* Filtros */}
        <section className="mb-5 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3" aria-label="Filtros">
          <label className="text-sm font-medium text-gray-600">
            Paciente ou protocolo
            <input type="search" className={`${campo} mt-1`} value={filtros.busca} placeholder="Ex.: Maria ou AG000123"
              onChange={(e) => mudar("busca", e.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-600">
            Feito por
            <input type="search" className={`${campo} mt-1`} value={filtros.usuario} placeholder="Nome de quem fez"
              onChange={(e) => mudar("usuario", e.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-600">
            Tipo de atividade
            <select className={`${campo} mt-1`} value={filtros.acao} onChange={(e) => mudar("acao", e.target.value)}>
              <option value="">Todas</option>
              {Object.entries(ACOES_HISTORICO).map(([valor, { titulo }]) => (
                <option key={valor} value={valor}>{titulo}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-600">
            De
            <input type="date" className={`${campo} mt-1`} value={filtros.data_inicio} onChange={(e) => mudar("data_inicio", e.target.value)} />
          </label>
          <label className="text-sm font-medium text-gray-600">
            Até
            <input type="date" className={`${campo} mt-1`} value={filtros.data_fim} min={filtros.data_inicio || undefined}
              onChange={(e) => mudar("data_fim", e.target.value)} />
          </label>
          <div className="flex items-end">
            <button type="button" disabled={!temFiltro} onClick={() => { setFiltros(FILTROS_VAZIOS); setPagina(1); }}
              className="min-h-11 w-full rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40">
              Limpar filtros
            </button>
          </div>
        </section>

        {intervaloInvalido && (
          <p className="mb-4 text-sm text-rose-600" role="alert">A data inicial não pode ser maior que a data final.</p>
        )}

        {!intervaloInvalido && dados && !carregando && !erro && (
          <p className="mb-3 text-sm text-gray-500" role="status">
            {dados.total === 1 ? "1 atividade" : `${dados.total} atividades`}
          </p>
        )}

        {carregando && <p className="py-8 text-center text-gray-400" role="status">Carregando…</p>}

        {!carregando && erro && (
          <div className="py-8 text-center" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button type="button" onClick={() => carregar(filtros, pagina)}
              className="mt-3 min-h-11 rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && dados && dados.itens.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-gray-500 shadow-sm">
            Nenhuma atividade encontrada{temFiltro ? " com esses filtros" : ""}.
          </p>
        )}

        {!carregando && !erro && dados && dados.itens.length > 0 && (
          <ol className="space-y-3">
            {dados.itens.map((a) => {
              const info = ACOES_HISTORICO[a.acao] ?? { titulo: a.acao, cor: "bg-gray-400" };
              return (
                <li key={a.his_id} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${info.cor}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-medium text-gray-900">{info.titulo}</p>
                      <time className="text-xs text-gray-500" dateTime={a.quando}>{formatarDataHora(a.quando)}</time>
                    </div>
                    <p className="text-sm text-gray-600">
                      {a.usuario_nome
                        ? <>por <strong className="font-semibold text-gray-800">{a.usuario_nome}</strong>{a.usuario_tipo ? ` · ${PAPEL_USUARIO[a.usuario_tipo] ?? ""}` : ""}</>
                        : "registro do sistema"}
                    </p>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {a.pac_id ? (
                        <Link to={`/pacientesadm/${a.pac_id}`} className="font-medium text-blue-700 hover:underline">{a.pac_nome}</Link>
                      ) : "Paciente não informado"}
                      {" · "}{a.protocolo ?? `nº ${a.sol_id}`}
                      {a.pos_nome ? ` · ${a.pos_nome}` : ""}
                    </p>
                    {a.detalhe && <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{a.detalhe}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {!carregando && dados && dados.totalPaginas > 1 && (
          <Pagination paginaAtual={pagina} totalPaginas={dados.totalPaginas} onMudarPagina={setPagina} />
        )}
      </main>

      <Footer />
    </div>
  );
}
