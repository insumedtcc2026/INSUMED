import type { ReactNode } from "react";

interface Props {
  titulo: string;
  subtitulo?: string;
  // botão/ação no canto do cabeçalho (ex.: "Novo agendamento")
  acao?: ReactNode;
  busca: string;
  onBusca: (valor: string) => void;
  placeholderBusca?: string;
  // selects e datas, na mesma linha
  filtros?: ReactNode;
  carregando?: boolean;
  erro?: string | null;
  onTentarNovamente?: () => void;
  vazio?: boolean;
  mensagemVazio?: string;
  // texto de contagem ("12 prescrições")
  contagem?: string;
  children?: ReactNode;
}

/**
 * Estrutura das páginas de lista no padrão da página de Agendamentos do
 * admin: título + subtítulo, busca arredondada, filtros na mesma linha,
 * estados de carregando / erro / vazio e a lista de cards.
 */
export default function PaginaLista({
  titulo, subtitulo, acao, busca, onBusca, placeholderBusca = "Buscar",
  filtros, carregando, erro, onTentarNovamente, vazio, mensagemVazio = "Nada encontrado com esses filtros.",
  contagem, children,
}: Props) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{titulo}</h1>
          {subtitulo && <p className="text-sm text-gray-500">{subtitulo}</p>}
        </div>
        {acao}
      </header>

      {/* Busca */}
      <div className="mb-4 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
        <span className="text-gray-400" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder={placeholderBusca}
          aria-label={placeholderBusca}
          className="min-h-9 w-full text-base focus:outline-none focus:ring-0 sm:text-sm"
        />
      </div>

      {filtros && <div className="mb-6 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">{filtros}</div>}

      {!carregando && !erro && contagem && (
        <p className="mb-3 text-sm text-gray-500" role="status">{contagem}</p>
      )}

      {carregando && <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>}

      {!carregando && erro && (
        <div className="py-10 text-center" role="alert">
          <p className="text-rose-500">{erro}</p>
          {onTentarNovamente && (
            <button
              type="button"
              onClick={onTentarNovamente}
              className="mt-3 min-h-11 rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {!carregando && !erro && vazio && <p className="py-10 text-center text-gray-400">{mensagemVazio}</p>}

      {!carregando && !erro && !vazio && <div className="flex flex-col gap-4">{children}</div>}
    </main>
  );
}

// classes dos selects e campos de data da linha de filtros
const CLASSE_FILTRO =
  "min-h-11 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-0 sm:text-sm";

/** Select da linha de filtros (status etc.). */
export function SelectFiltro({
  valor, onMudar, rotulo, opcoes,
}: { valor: string; onMudar: (v: string) => void; rotulo: string; opcoes: [string, string][] }) {
  return (
    <select value={valor} onChange={(e) => onMudar(e.target.value)} aria-label={rotulo} className={CLASSE_FILTRO}>
      {opcoes.map(([v, texto]) => (
        <option key={v} value={v}>{texto}</option>
      ))}
    </select>
  );
}

/** Filtro de período (De / até), igual ao de Agendamentos. */
export function FiltroPeriodo({
  inicio, fim, onInicio, onFim,
}: { inicio: string; fim: string; onInicio: (v: string) => void; onFim: (v: string) => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
      <input type="date" value={inicio} onChange={(e) => onInicio(e.target.value)} aria-label="Data inicial"
        className={`${CLASSE_FILTRO} w-full min-w-0 sm:w-auto`} />
      <span className="text-sm text-gray-400">até</span>
      <input type="date" value={fim} min={inicio || undefined} onChange={(e) => onFim(e.target.value)} aria-label="Data final"
        className={`${CLASSE_FILTRO} w-full min-w-0 sm:w-auto`} />
    </div>
  );
}
