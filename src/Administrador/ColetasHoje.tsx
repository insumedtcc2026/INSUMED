import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks, QrCode, ScanLine } from "lucide-react";
import Swal from "sweetalert2";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import TabelaAgendamentos from "../components/usuario-1/agendamentos/TabelaAgendamentos";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CabecalhoAdmin } from "../components/universais/AdminUI";
import { atualizarContadoresAdmin } from "../hook/useContadoresAdmin";
import { cancelarComMotivo } from "../components/usuario-1/agendamentos/cancelarComMotivo";
import { confirmarEntrega } from "../components/universais/acoesAdmin";
import { concluirAgendamento, listarAgendamentos } from "../services/AgendamentoService";
import type { Agendamento } from "../types/agendamento";
import { useValidarToken } from "../hook/Validartoken";
import { exibirCPF, hojeISO, mensagemErroApi, somenteDigitos } from "../utils/validacoes";

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
  const [concluidos, setConcluidos] = useState<Agendamento[]>([]);
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
      setConcluidos(concluidos);
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

  // busca do balcão: protocolo (ou o QR do comprovante), nome ou CPF
  const corresponde = useCallback((a: Agendamento) => {
    const termo = normalizar(protocoloDoQR(busca));
    if (!termo) return true;
    const digitos = somenteDigitos(busca);
    return (
      normalizar(a.sol_protocolo ?? "").includes(termo) ||
      normalizar(a.paciente.pac_nome).includes(termo) ||
      (digitos.length >= 3 && somenteDigitos(a.paciente.pac_cpf ?? "").includes(digitos))
    );
  }, [busca]);
  const filtrados = useMemo(() => agendados.filter(corresponde), [agendados, corresponde]);

  function voltarAoCampo() {
    setBusca("");
    setTimeout(() => campo.current?.focus(), 50);
  }

  async function concluir(sol_id: number) {
    const ag = agendados.find((a) => a.sol_id === sol_id);
    const itens = ag?.insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ") || "—";

    const ok = await confirmarEntrega({
      pac_id: ag?.paciente.pac_id,
      protocolo: String(ag?.sol_protocolo ?? sol_id),
      paciente: ag?.paciente.pac_nome ?? "",
      linhas: [`CPF ${exibirCPF(ag?.paciente.pac_cpf)}`, itens],
    });
    if (!ok) return voltarAoCampo();

    try {
      await concluirAgendamento(sol_id, ok.retirado_por);
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
    atualizarContadoresAdmin();
    voltarAoCampo();
  }

  async function cancelar(sol_id: number) {
    const ag = agendados.find((a) => a.sol_id === sol_id);
    await cancelarComMotivo(sol_id, ag?.sol_protocolo ?? `#${sol_id}`);
    await carregar();
    atualizarContadoresAdmin();
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

  // uma tabela só, como a de Agendamentos: pendentes (manhã antes da
  // tarde) e, no fim, as já concluídas hoje
  const ordemTurno = (a: Agendamento) => (a.sol_turno === "tarde" ? 1 : 0);
  const lista = [
    ...[...filtrados].sort((x, y) => ordemTurno(x) - ordemTurno(y)),
    ...concluidos.filter(corresponde).sort((x, y) => ordemTurno(x) - ordemTurno(y)),
  ];
  const hojeExtenso = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

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

      <main className="compensa-header mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="pt-6">
          <CabecalhoAdmin
            titulo="Coletas de hoje"
            subtitulo={<span className="first-letter:uppercase">{hojeExtenso}</span>}
            acoes={
              <>
                <Link to="/lista-separacao" className={BOTAO_SECUNDARIO}>
                  <ListChecks size={17} aria-hidden="true" /> Lista de separação
                </Link>
                <Link to="/leitor-qrcode" className={BOTAO_PRIMARIO}>
                  <QrCode size={17} aria-hidden="true" /> Ler QR Code com a câmera
                </Link>
              </>
            }
          />

          {/* campo do balcão: leitor USB ou digitação */}
          <div className="mb-4 flex items-center gap-4 rounded-[20px] border-2 border-blue-200 bg-white p-4 shadow-[0_0_0_5px_rgba(0,66,236,0.06)] focus-within:border-blue-600">
            <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 sm:grid">
              <ScanLine size={26} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
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
                className="adm-campo-balcao"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leitor USB: leia o QR Code do comprovante e aperte Enter. Com um único resultado, a conclusão já abre.
              </p>
            </div>
          </div>

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

          {!carregando && !erro && agendados.length === 0 && concluidos.length === 0 && (
            <p className="adm-cartao p-6 text-center text-gray-500">Nenhuma coleta marcada para hoje.</p>
          )}

          {!carregando && !erro && agendados.length > 0 && filtrados.length === 0 && (
            <p className="py-6 text-center text-gray-500">Nenhuma coleta de hoje corresponde à busca.</p>
          )}

          {!carregando && !erro && lista.length > 0 && (
            <section className="adm-cartao" aria-label="Coletas de hoje">
              <TabelaAgendamentos agendamentos={lista} onConcluir={concluir} onCancelar={cancelar} onAtualizar={carregar} />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
