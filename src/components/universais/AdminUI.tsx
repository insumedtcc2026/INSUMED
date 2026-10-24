import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Clock, EllipsisVertical, Search, UsersRound, X, type LucideIcon } from "lucide-react";
import "../../css/universais/LayoutAdmin.css";
import { iniciais } from "../../utils/nome";
import { adminUniversal } from "./menuAdmin";

/** Título da página do admin, com subtítulo e ações à direita. */
export function CabecalhoAdmin({ titulo, subtitulo, acoes }: { titulo: string; subtitulo?: ReactNode; acoes?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="!mb-0 !text-[26px] sm:!text-[28px]">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-gray-500">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">{acoes}</div>}
    </header>
  );
}

export interface AbaAdmin<T extends string> {
  id: T;
  rotulo: string;
  Icone?: LucideIcon;
  numero?: number | null;
  // contador amarelo (pede atenção) em vez do cinza
  atencao?: boolean;
}

/** Abas de status com contador (substituem o select de status). */
export function AbasAdmin<T extends string>({
  abas, ativa, onMudar, rotulo,
}: { abas: AbaAdmin<T>[]; ativa: T; onMudar: (id: T) => void; rotulo: string }) {
  return (
    <div className="adm-abas" role="tablist" aria-label={rotulo}>
      {abas.map(({ id, rotulo: texto, Icone, numero, atencao }) => {
        const selecionada = id === ativa;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => onMudar(id)}
            className={`adm-aba ${selecionada ? "adm-aba--ativa" : ""}`}
          >
            {Icone && <Icone size={16} aria-hidden="true" />}
            {texto}
            {numero != null && numero > 0 && (
              <span className={`adm-aba-num ${atencao && !selecionada ? "adm-aba-num--atencao" : ""}`}>{numero}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const CAMPO =
  "min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-base text-gray-800 focus:border-blue-500 focus:outline-none sm:text-sm";

/** Linha de filtros: busca, período (De / até) e "Limpar". */
export function FiltrosAdmin({
  busca, onBusca, placeholder, inicio, fim, onInicio, onFim, rotuloPeriodo = "De", onLimpar, extra,
}: {
  busca: string;
  onBusca: (v: string) => void;
  placeholder: string;
  inicio: string;
  fim: string;
  onInicio: (v: string) => void;
  onFim: (v: string) => void;
  rotuloPeriodo?: string;
  onLimpar?: () => void;
  extra?: ReactNode;
}) {
  const temFiltro = Boolean(busca || inicio || fim);
  return (
    <div className="adm-filtros mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
      <label className="adm-filtros-busca flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-blue-500">
        <Search size={17} className="shrink-0 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-h-10 w-full bg-transparent text-base focus:outline-none sm:text-sm"
        />
      </label>
      <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2 sm:flex">
        <span className="whitespace-nowrap text-sm text-gray-500">{rotuloPeriodo}</span>
        <input type="date" value={inicio} onChange={(e) => onInicio(e.target.value)} aria-label="Data inicial" className={`${CAMPO} min-w-0`} />
        <span className="text-sm text-gray-500">até</span>
        <input type="date" value={fim} min={inicio || undefined} onChange={(e) => onFim(e.target.value)} aria-label="Data final" className={`${CAMPO} min-w-0`} />
      </div>
      {extra}
      {onLimpar && (
        <button
          type="button"
          onClick={onLimpar}
          disabled={!temFiltro}
          className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          <X size={15} aria-hidden="true" /> Limpar
        </button>
      )}
    </div>
  );
}

/** Iniciais do paciente no círculo da lista. */
export function AvatarIniciais({ nome }: { nome?: string | null }) {
  const texto = iniciais(nome);
  return <span className="adm-avatar" aria-hidden="true">{texto || "?"}</span>;
}

export interface OpcaoMenu {
  texto: string;
  Icone: LucideIcon;
  onClick: () => void;
  perigo?: boolean;
}

/** Botão ⋮ com as ações secundárias (a principal fica à vista). */
export function MenuAcoes({ opcoes, rotulo }: { opcoes: OpcaoMenu[]; rotulo: string }) {
  const [aberto, setAberto] = useState(false);
  const [paraCima, setParaCima] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function alternar() {
    // perto do fim da tela, a lista abre para cima
    const r = caixa.current?.getBoundingClientRect();
    setParaCima(Boolean(r && window.innerHeight - r.bottom < 60 + opcoes.length * 44));
    setAberto((v) => !v);
  }

  return (
    <div className="adm-menu-acoes" ref={caixa}>
      <button
        type="button"
        onClick={alternar}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={id}
        aria-label={rotulo}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-gray-600 hover:bg-gray-50 ${
          aberto ? "border-blue-500 text-blue-700" : "border-gray-200"
        }`}
      >
        <EllipsisVertical size={18} aria-hidden="true" />
      </button>
      {aberto && (
        <div id={id} role="menu" className={`adm-menu-lista ${paraCima ? "adm-menu-lista--cima" : ""}`}>
          {opcoes.map(({ texto, Icone, onClick, perigo }) => (
            <button
              key={texto}
              type="button"
              role="menuitem"
              className={`adm-menu-opcao ${perigo ? "adm-menu-opcao--perigo" : ""}`}
              onClick={() => {
                setAberto(false);
                onClick();
              }}
            >
              <Icone size={16} aria-hidden="true" /> {texto}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Estados de carregando / erro / vazio das listas. */
export function EstadoLista({
  carregando, erro, onTentarNovamente, vazio, mensagemVazio,
}: { carregando: boolean; erro: string | null; onTentarNovamente?: () => void; vazio: boolean; mensagemVazio: string }) {
  if (carregando) return <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>;
  if (erro)
    return (
      <div className="py-10 text-center" role="alert">
        <p className="text-rose-600">{erro}</p>
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
    );
  if (vazio) return <p className="py-10 text-center text-gray-500">{mensagemVazio}</p>;
  return null;
}

export const BOTAO_PRIMARIO =
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#001ed3] via-[#0042ec] to-[#0192fe] px-4 text-sm font-bold text-white shadow-[0_6px_16px_rgba(0,66,236,0.25)] transition hover:brightness-110 [font-family:var(--fonte-botao)]";
export const BOTAO_SECUNDARIO =
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#9dbcff] bg-white px-4 text-sm font-bold text-[#0042ec] transition hover:bg-blue-50 [font-family:var(--fonte-botao)]";
export const BOTAO_CONCLUIR =
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-green-600 px-4 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50 [font-family:var(--fonte-botao)]";

const ABAS_UNIDADE = [
  { para: "/atividades", rotulo: "Registro de atividades", Icone: Activity },
  { para: "/horarios-unidade", rotulo: "Horários e vagas", Icone: Clock },
  { para: "/equipe", rotulo: "Equipe da rede", Icone: UsersRound, soUniversal: true },
];

/** Abas de "Atividades da unidade": registro, horários e equipe (só universal). */
export function AbasUnidade() {
  const { pathname } = useLocation();
  const universal = adminUniversal();
  const atual = pathname.toLowerCase();
  return (
    <nav className="adm-abas" aria-label="Atividades da unidade">
      {ABAS_UNIDADE.filter((a) => universal || !a.soUniversal).map(({ para, rotulo, Icone }) => {
        const ativa = atual.startsWith(para);
        return (
          <Link key={para} to={para} aria-current={ativa ? "page" : undefined} className={`adm-aba ${ativa ? "adm-aba--ativa" : ""}`}>
            <Icone size={16} aria-hidden="true" />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
