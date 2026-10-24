import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { QrCode } from "lucide-react";
import Swal from "sweetalert2";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import AgendamentoCard from "../components/usuario-1/agendamentos/AgendamentoCard";
import { cancelarComMotivo } from "../components/usuario-1/agendamentos/cancelarComMotivo";
import { concluirAgendamento, listarAgendamentos } from "../services/AgendamentoService";
import type { Agendamento } from "../types/agendamento";
import { useValidarToken } from "../hook/Validartoken";
import { exibirCPF, hojeISO, mensagemErroApi, somenteDigitos } from "../utils/validacoes";

// textos vindos do banco entram no HTML do alerta: escapar sempre
const esc = (t: unknown) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// QR novo do comprovante ("INSUMED:AG000042:<código>"): aqui só o protocolo
// interessa (o leitor completo, que confere o código, fica em /leitor-qrcode).
// Leitor USB em teclado ABNT2 pode trocar ":" por "Ç" ou ";".
const protocoloDoQR = (t: string) => /^\s*insumed[:;ç](ag\d+)[:;ç]/i.exec(t)?.[1] ?? t;

/**
 * Atendimento no balcão: coletas marcadas para hoje.
 * O campo de busca já abre selecionado e aceita protocolo, CPF ou nome.
 * Um leitor de código (USB) "digita" o protocolo do QR Code do
 * comprovante e aperta Enter: com um único resultado, a conclusão já
 * é oferecida, e o campo volta limpo para o próximo paciente.
 */
export default function ColetasHoje() {
  const { verificando } = useValidarToken("ADMIN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agendados, setAgendados] = useState<Agendamento[]>([]);
  const [concluidosHoje, setConcluidosHoje] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const campo = useRef<HTMLInputElement>(null);
  const hoje = hojeISO();

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [abertos, concluidos] = await Promise.all([
        listarAgendamentos({ status: "agendado", dataInicio: hoje, dataFim: hoje }),
        listarAgendamentos({ status: "concluido", dataInicio: hoje, dataFim: hoje }),
      ]);
      setAgendados(abertos);
      setConcluidosHoje(concluidos.length);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar as coletas de hoje."));
    } finally {
      setCarregando(false);
    }
  }, [hoje]);

  // carrega fora do corpo do efeito (o estado só muda no callback)
  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  const filtrados = useMemo(() => {
    const termo = normalizar(protocoloDoQR(busca));
    if (!termo) return agendados;
    const digitos = somenteDigitos(busca);
    return agendados.filter((a) => {
      const protocolo = normalizar(a.sol_protocolo ?? "");
      return (
        protocolo.includes(termo) ||
        normalizar(a.paciente.pac_nome).includes(termo) ||
        (digitos.length >= 3 && somenteDigitos(a.paciente.pac_cpf ?? "").includes(digitos))
      );
    });
  }, [agendados, busca]);

  function voltarAoCampo() {
    setBusca("");
    setTimeout(() => campo.current?.focus(), 50);
  }

  async function concluir(sol_id: number) {
    const ag = agendados.find((a) => a.sol_id === sol_id);
    const itens = ag?.insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ") || "—";

    const ok = await Swal.fire({
      icon: "question",
      title: "Entregar e concluir?",
      html: `<p><strong>${esc(ag?.sol_protocolo ?? sol_id)}</strong> · ${esc(ag?.paciente.pac_nome)}</p>
             <p style="margin-top:6px">CPF ${esc(exibirCPF(ag?.paciente.pac_cpf))}</p>
             <p style="margin-top:6px">${esc(itens)}</p>`,
      showCancelButton: true,
      confirmButtonText: "Concluir coleta",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#16a34a",
      reverseButtons: true,
      focusConfirm: true,
    });
    if (!ok.isConfirmed) return voltarAoCampo();

    try {
      await concluirAgendamento(sol_id);
      await Swal.fire({
        icon: "success",
        title: "Coleta concluída",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Não foi possível concluir",
        text: mensagemErroApi(e, "Tente novamente."),
        confirmButtonColor: "#d33",
      });
    }
    await carregar();
    voltarAoCampo();
  }

  async function cancelar(sol_id: number) {
    const ag = agendados.find((a) => a.sol_id === sol_id);
    await cancelarComMotivo(sol_id, ag?.sol_protocolo ?? `#${sol_id}`);
    await carregar();
    voltarAoCampo();
  }

  // Enter com um único resultado (ex.: protocolo lido do QR Code) já oferece concluir
  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (filtrados.length === 1) {
      concluir(filtrados[0].sol_id);
    } else if (busca.trim() && filtrados.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Nenhuma coleta de hoje encontrada",
        text: "Confira o protocolo ou o CPF. Se a coleta for de outro dia, use a página Agendamentos.",
        confirmButtonColor: "#3085d6",
      }).then(voltarAoCampo);
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
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Coletas de hoje</h1>
            <p className="text-sm text-gray-500">
              Digite ou leia o protocolo do comprovante, ou busque pelo CPF ou nome.
            </p>
          </div>
          <Link to="/leitor-qrcode" className="botao-novo-agendamento">
            <QrCode size={18} aria-hidden="true" /> Ler QR Code com a câmera
          </Link>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-3xl font-bold text-blue-700">{carregando ? "…" : agendados.length}</p>
            <p className="text-sm text-gray-500">a atender</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-3xl font-bold text-green-600">{carregando ? "…" : concluidosHoje}</p>
            <p className="text-sm text-gray-500">já concluídas</p>
          </div>
        </div>

        {/* turnos e respostas de presença do dia */}
        {!carregando && agendados.length > 0 && (
          <p className="-mt-2 mb-5 flex flex-wrap gap-2 text-sm" role="status">
            {(["manha", "tarde"] as const).map((t) => {
              const n = agendados.filter((a) => (a.sol_turno ?? "manha") === t).length;
              return n ? (
                <span key={t} className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-900">
                  {n} de {t === "manha" ? "manhã" : "tarde"}
                </span>
              ) : null;
            })}
            {agendados.some((a) => a.sol_presenca === "vou") && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
                {agendados.filter((a) => a.sol_presenca === "vou").length} confirmaram
              </span>
            )}
            {agendados.some((a) => a.sol_presenca === "nao_vou") && (
              <span className="rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-800">
                {agendados.filter((a) => a.sol_presenca === "nao_vou").length} avisaram que não vão
              </span>
            )}
          </p>
        )}

        <label htmlFor="busca-balcao" className="sr-only">
          Protocolo, CPF ou nome
        </label>
        <input
          id="busca-balcao"
          ref={campo}
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={aoTeclar}
          autoFocus
          autoComplete="off"
          placeholder="Protocolo (AG000123), CPF ou nome"
          className="mb-6 min-h-14 w-full rounded-2xl border-2 border-blue-200 bg-white px-5 text-lg shadow-sm outline-none focus:border-blue-600"
        />

        {carregando && <p className="py-8 text-center text-gray-400" role="status">Carregando…</p>}

        {!carregando && erro && (
          <div className="py-8 text-center" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button
              type="button"
              onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && agendados.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-gray-500 shadow-sm">
            Nenhuma coleta pendente para hoje.
          </p>
        )}

        {!carregando && !erro && agendados.length > 0 && filtrados.length === 0 && (
          <p className="py-6 text-center text-gray-500">Nenhuma coleta de hoje corresponde à busca.</p>
        )}

        <div className="flex flex-col gap-4">
          {filtrados.map((a) => (
            <AgendamentoCard
              key={a.sol_id}
              agendamento={a}
              showActions
              onConcluir={concluir}
              onCancelar={cancelar}
              onAtualizar={carregar}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
