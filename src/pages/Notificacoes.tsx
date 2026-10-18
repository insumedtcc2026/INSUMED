import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/universais/Header";
import HeaderAdm from "../components/universais/HeaderAdm";
import HeaderAut from "../components/universais/HeaderAut";
import Sidebar from "../components/universais/Sidebar";
import Sidebaradm from "../components/universais/Siderbaradm";
import SidebarAut from "../components/universais/SidebarAut";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { ItemNotificacao } from "../components/universais/NotificationDropdown";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import type { Perfil } from "../components/universais/sessao";
import { useValidarToken } from "../hook/Validartoken";
import { listarNotificacoes, marcarNotificacaoLida, marcarTodasLidas } from "../services/NotificacaoService";
import type { Notificacao } from "../types/notificacao";
import { EVENTO_ATUALIZAR_NOTIFICACOES, pedirAtualizacaoNotificacoes } from "../utils/notificacoes";
import { mensagemErroApi } from "../utils/validacoes";
import "../css/universais/NotificationDropdown.css";

type Filtro = "todas" | "nao_lidas";

const LAYOUT: Record<Perfil, { Header: typeof Header; Menu: typeof Sidebar; inicio: string; classe: string }> = {
  PACIENTE: { Header, Menu: Sidebar, inicio: "/home", classe: "pagina-paciente min-h-screen bg-gray-50" },
  ADMIN: { Header: HeaderAdm, Menu: Sidebaradm, inicio: "/homeadmin", classe: "min-h-screen bg-slate-50" },
  AUTORIZADOR: { Header: HeaderAut, Menu: SidebarAut, inicio: "/homeaut", classe: "min-h-screen bg-slate-50" },
};

const POR_PAGINA = 15;

/** Histórico completo de notificações da pessoa logada (os três perfis). */
export default function Notificacoes({ perfil }: { perfil: Perfil }) {
  const { verificando } = useValidarToken(perfil);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [pagina, setPagina] = useState(1);
  const [itens, setItens] = useState<Notificacao[] | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [naoLidas, setNaoLidas] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const r = await listarNotificacoes(perfil, pagina, filtro, POR_PAGINA);
      setItens(r.itens);
      setTotalPaginas(r.totalPaginas);
      setNaoLidas(r.naoLidas);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar as notificações."));
    }
  }, [perfil, pagina, filtro]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    window.addEventListener(EVENTO_ATUALIZAR_NOTIFICACOES, carregar);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENTO_ATUALIZAR_NOTIFICACOES, carregar);
    };
  }, [verificando, carregar]);

  async function abrir(n: Notificacao) {
    if (!n.lida) {
      try {
        await marcarNotificacaoLida(perfil, n.id);
        pedirAtualizacaoNotificacoes();
      } catch {
        // abrir o registro é o principal; a marcação tenta de novo na próxima vez
      }
    }
    if (n.link) navigate(n.link);
    else carregar();
  }

  async function marcarTodas() {
    const maisRecente = (itens ?? []).reduce((max, n) => Math.max(max, n.id), 0);
    try {
      await marcarTodasLidas(perfil, filtro === "todas" && pagina === 1 && maisRecente ? maisRecente : undefined);
      pedirAtualizacaoNotificacoes();
      carregar();
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível marcar as notificações como lidas."));
    }
  }

  function trocarFiltro(novo: Filtro) {
    setFiltro(novo);
    setPagina(1);
    setItens(null);
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const { Header: Cabecalho, Menu, inicio, classe } = LAYOUT[perfil];

  return (
    <div className={classe}>
      <Menu isOpen={menuAberto} onClose={() => setMenuAberto((v) => !v)} />
      <Cabecalho onMenuClick={() => setMenuAberto((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para={inicio} />
      </div>

      <main className="pagina-conteudo mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Notificações</h1>
            <p className="text-sm text-gray-500">
              {naoLidas > 0 ? `${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}.` : "Tudo lido por aqui."}
              {" "}As notificações lidas somem depois de 180 dias.
            </p>
          </div>
          {naoLidas > 0 && (
            <button type="button" onClick={marcarTodas}
              className="min-h-11 rounded-full border border-blue-600 px-5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full bg-white p-1 shadow-sm" role="tablist" aria-label="Filtrar notificações">
          {([["todas", "Todas"], ["nao_lidas", "Não lidas"]] as const).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={filtro === valor}
              onClick={() => trocarFiltro(valor)}
              className={`min-h-11 rounded-full text-sm font-semibold transition ${
                filtro === valor ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {texto}
            </button>
          ))}
        </div>

        {erro && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button type="button" onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Tentar novamente
            </button>
          </div>
        )}

        {!erro && !itens && <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>}

        {itens && itens.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-gray-600">
              {filtro === "nao_lidas" ? "Nenhuma notificação não lida." : "Nenhuma notificação disponível."}
            </p>
          </div>
        )}

        {itens && itens.length > 0 && (
          <ul className="notif-lista overflow-hidden rounded-2xl bg-white shadow-sm">
            {itens.map((n) => (
              <li key={n.id}>
                <ItemNotificacao n={n} onAbrir={abrir} />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          paginaAtual={pagina}
          totalPaginas={totalPaginas}
          onMudarPagina={(p) => {
            setPagina(p);
            setItens(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
