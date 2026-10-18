import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import SeloStatus from "../components/universais/SeloStatus";
import LinhaDoTempo from "../components/universais/LinhaDoTempo";
import ContatoUnidade from "../components/universais/ContatoUnidade";
import RastreioPrescricao from "../components/usuario-1/prescricao/RastreioPrescricao";
import ModalPrescricao from "../components/usuario-1/prescricao/ModalPrescricao";
import ModalReenvio from "../components/usuario-1/prescricao/ModalReenvio";
import Pagination from "../components/usuario-1/agendamentos/pagination";
import { useValidarToken } from "../hook/Validartoken";
import { useDadosUser } from "../hook/Dadosuser";
import { buscarMinhaPrescricao, buscarMinhasPrescricoes, type MinhaPrescricao } from "../services/PrescricaoService";
import { mensagemErroApi } from "../utils/validacoes";
import { formatarData, textoMotivoReenvio } from "../utils/status";

type Aba = "andamento" | "encerradas";

const POR_PAGINA = 10;

/**
 * "Minhas prescrições" do paciente: primeiro o estado atual e o que fazer
 * (rastreio em etapas), depois o histórico completo, que abre quando a
 * pessoa quer. Cada aba é paginada no servidor, então o histórico pode
 * crescer sem deixar a página lenta.
 */
export default function Prescricoes() {
  const { verificando } = useValidarToken("PACIENTE");
  const usuario = useDadosUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aba, setAba] = useState<Aba>("andamento");
  const [pagina, setPagina] = useState(1);
  const [lista, setLista] = useState<MinhaPrescricao[] | null>(null);
  const [contagem, setContagem] = useState<{ andamento: number; encerradas: number } | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [arquivoDe, setArquivoDe] = useState<number | null>(null);
  const [reenviarDe, setReenviarDe] = useState<MinhaPrescricao | null>(null);

  // ?sol_id= (vindo de uma notificação): mostra só aquela prescrição;
  // &acao=reenviar abre direto o envio da correção
  const [params, setParams] = useSearchParams();
  const foco = Number(params.get("sol_id")) || null;
  const abrirReenvio = params.get("acao") === "reenviar";
  const reenvioAberto = useRef(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      if (foco) {
        const item = await buscarMinhaPrescricao(foco);
        setLista(item ? [item] : []);
        setTotalPaginas(1);
        if (item && abrirReenvio && item.sol_status === "Reenvio" && !reenvioAberto.current) {
          reenvioAberto.current = true;
          setReenviarDe(item);
        }
        return;
      }
      const r = await buscarMinhasPrescricoes(aba, pagina, POR_PAGINA);
      setLista(r.itens);
      setContagem(r.contagem);
      setTotalPaginas(r.totalPaginas);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar suas prescrições."));
    }
  }, [aba, pagina, foco, abrirReenvio]);

  function verTodas() {
    setParams({});
    setLista(null);
  }

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  function trocarAba(nova: Aba) {
    setAba(nova);
    setPagina(1);
    setLista(null);
  }

  function mudarPagina(nova: number) {
    setPagina(nova);
    setLista(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/home" />
      </div>

      <main className="pagina-conteudo mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Minhas prescrições</h1>
            <p className="text-sm text-gray-500">Acompanhe cada etapa, do envio até a retirada dos insumos.</p>
          </div>
          <Link to="/EnviarSolicitacao" className="botao-novo-agendamento">
            <span aria-hidden="true">+</span> Enviar prescrição
          </Link>
        </div>

        {foco && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <span>Mostrando a prescrição nº {foco}.</span>
            <button type="button" onClick={verTodas} className="min-h-10 font-semibold text-blue-700 hover:underline">
              Ver todas as prescrições
            </button>
          </div>
        )}

        {!foco && (
        <div className="mb-5 grid grid-cols-2 rounded-full bg-white p-1 shadow-sm" role="tablist" aria-label="Filtrar prescrições">
          {([
            ["andamento", "Em andamento", contagem?.andamento],
            ["encerradas", "Encerradas", contagem?.encerradas],
          ] as const).map(([valor, texto, n]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={aba === valor}
              onClick={() => trocarAba(valor)}
              className={`min-h-11 rounded-full text-sm font-semibold transition ${
                aba === valor ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {texto}{n !== undefined ? ` (${n})` : ""}
            </button>
          ))}
        </div>
        )}

        {erro && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button type="button" onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Tentar novamente
            </button>
          </div>
        )}

        {!erro && !lista && <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>}

        {lista && lista.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-gray-600">
              {foco ? "Prescrição não encontrada." : aba === "andamento" ? "Nenhuma prescrição em andamento." : "Nenhuma prescrição encerrada ainda."}
            </p>
            {aba === "andamento" && (
              <Link to="/EnviarSolicitacao" className="mt-3 inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
                Enviar uma prescrição →
              </Link>
            )}
          </div>
        )}

        <ul className="space-y-4">
          {(lista ?? []).map((p) => {
            const ag = p.agendamento;
            const cancelado = p.sol_status === "Autorizado" && (ag?.sol_status === "cancelado" || ag?.sol_status === "nao_compareceu");
            const precisaContato = p.sol_status === "Nao Autorizado" || cancelado;
            const mensagem = p.sol_status === "Nao Autorizado"
              ? `Olá! Sou ${usuario.nome}. Minha prescrição nº ${p.sol_id} não foi autorizada e gostaria de entender o motivo.`
              : `Olá! Sou ${usuario.nome}. O agendamento ${ag?.sol_protocolo ?? ""} da minha prescrição nº ${p.sol_id} foi cancelado e gostaria de saber sobre a remarcação.`;

            return (
              <li key={p.sol_id} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">Prescrição nº {p.sol_id}</p>
                    <p className="text-sm text-gray-500">Enviada em {formatarData(p.sol_data_solicitacao)}</p>
                  </div>
                  {/* status ATUAL (os eventos anteriores ficam no histórico) */}
                  <SeloStatus status={ag && p.sol_status === "Autorizado" ? ag.sol_status : p.sol_status} />
                </div>

                <RastreioPrescricao
                  prescricao={p}
                  onReenviar={p.sol_status === "Reenvio" ? () => setReenviarDe(p) : undefined}
                />

                {precisaContato && (
                  <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                    <p className="mb-2 text-sm text-gray-700">
                      Ficou com dúvida? Fale com a unidade responsável{p.pos_nome ? ` (${p.pos_nome})` : ""}.
                    </p>
                    <ContatoUnidade
                      pos_nome={cancelado ? ag?.pos_nome ?? p.pos_nome : p.pos_nome}
                      pos_whatsapp={cancelado ? ag?.pos_whatsapp ?? p.pos_whatsapp : p.pos_whatsapp}
                      mensagem={mensagem}
                    />
                  </div>
                )}

                {p.tem_prescricao && (
                  <button type="button" onClick={() => setArquivoDe(p.sol_id)}
                    className="mt-4 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Ver prescrição enviada
                  </button>
                )}

                {p.eventos.length > 0 && (
                  <details className="group mt-4 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-2">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-blue-700">
                      Histórico completo ({p.eventos.length} {p.eventos.length === 1 ? "evento" : "eventos"})
                      <span className="transition group-open:rotate-180" aria-hidden="true">▾</span>
                    </summary>
                    <div className="pb-3 pt-2">
                      <LinhaDoTempo eventos={p.eventos} agruparPorDia />
                    </div>
                  </details>
                )}
              </li>
            );
          })}
        </ul>

        <Pagination paginaAtual={pagina} totalPaginas={totalPaginas} onMudarPagina={mudarPagina} />
      </main>

      {arquivoDe && <ModalPrescricao sol_id={arquivoDe} onClose={() => setArquivoDe(null)} />}

      {reenviarDe && (
        <ModalReenvio
          sol_id={reenviarDe.sol_id}
          motivo={textoMotivoReenvio(reenviarDe.sol_motivo_reenvio)}
          onClose={() => setReenviarDe(null)}
          onReenviada={() => {
            setReenviarDe(null);
            carregar();
          }}
        />
      )}

      <Footer />
    </div>
  );
}
