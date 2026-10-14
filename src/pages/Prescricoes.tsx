import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import NavInferiorPaciente from "../components/universais/NavInferiorPaciente";
import SeloStatus from "../components/universais/SeloStatus";
import RastreioPrescricao from "../components/usuario-1/prescricao/RastreioPrescricao";
import ModalPrescricao from "../components/usuario-1/prescricao/ModalPrescricao";
import { useValidarToken } from "../hook/Validartoken";
import { buscarMinhasPrescricoes, type MinhaPrescricao } from "../services/PrescricaoService";
import { mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";

// Em andamento = ainda falta alguma etapa; encerradas = retiradas ou não autorizadas
const encerrada = (p: MinhaPrescricao) =>
  p.sol_status === "Nao Autorizado" || p.agendamento?.sol_status === "concluido";

/**
 * "Minhas prescrições" do paciente: cada prescrição com o rastreio das
 * etapas (enviada → análise → autorização → agendamento → retirada),
 * no estilo de acompanhamento de entregas. Antes ficava dentro do Perfil.
 */
export default function Prescricoes() {
  const { verificando } = useValidarToken("PACIENTE");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lista, setLista] = useState<MinhaPrescricao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<"andamento" | "encerradas">("andamento");
  const [arquivoDe, setArquivoDe] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setLista(await buscarMinhasPrescricoes());
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar suas prescrições."));
    }
  }, []);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const emAndamento = (lista ?? []).filter((p) => !encerrada(p));
  const encerradas = (lista ?? []).filter(encerrada);
  const visiveis = aba === "andamento" ? emAndamento : encerradas;

  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/home" />
      </div>

      <main className="pagina-conteudo mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Minhas prescrições</h1>
            <p className="text-sm text-gray-500">Acompanhe cada etapa, do envio até a retirada dos insumos.</p>
          </div>
          <Link to="/EnviarSolicitacao" className="botao-novo-agendamento">
            <span aria-hidden="true">+</span> Enviar prescrição
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full bg-white p-1 shadow-sm" role="tablist" aria-label="Filtrar prescrições">
          {([
            ["andamento", `Em andamento (${emAndamento.length})`],
            ["encerradas", `Encerradas (${encerradas.length})`],
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

        {lista && visiveis.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-gray-600">
              {aba === "andamento" ? "Nenhuma prescrição em andamento." : "Nenhuma prescrição encerrada ainda."}
            </p>
            {aba === "andamento" && (
              <Link to="/EnviarSolicitacao" className="mt-3 inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
                Enviar uma prescrição →
              </Link>
            )}
          </div>
        )}

        <ul className="space-y-4">
          {visiveis.map((p) => (
            <li key={p.sol_id} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">Prescrição nº {p.sol_id}</p>
                  <p className="text-sm text-gray-500">Enviada em {formatarData(p.sol_data_solicitacao)}</p>
                </div>
                <SeloStatus status={p.agendamento && p.sol_status === "Autorizado" ? p.agendamento.sol_status : p.sol_status} />
              </div>

              <RastreioPrescricao prescricao={p} />

              {p.tem_prescricao && (
                <button type="button" onClick={() => setArquivoDe(p.sol_id)}
                  className="mt-4 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Ver prescrição enviada
                </button>
              )}
            </li>
          ))}
        </ul>
      </main>

      {arquivoDe && <ModalPrescricao sol_id={arquivoDe} onClose={() => setArquivoDe(null)} />}

      <Footer />
      <NavInferiorPaciente />
    </div>
  );
}
