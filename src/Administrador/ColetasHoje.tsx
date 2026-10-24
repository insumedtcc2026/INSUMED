import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarClock, CircleCheck, CircleX, History, ListChecks, MessageSquareText, PackageCheck, QrCode, ScanLine, Sunrise, Sunset, User, UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import ModalHistorico from "../components/universais/ModalHistorico";
import { AvatarIniciais, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CabecalhoAdmin, MenuAcoes } from "../components/universais/AdminUI";
import { atualizarContadoresAdmin } from "../hook/useContadoresAdmin";
import { cancelarComMotivo } from "../components/usuario-1/agendamentos/cancelarComMotivo";
import { confirmarEntrega, editarRecado, remarcarComData } from "../components/universais/acoesAdmin";
import { concluirAgendamento, listarAgendamentos } from "../services/AgendamentoService";
import type { Agendamento } from "../types/agendamento";
import { useValidarToken } from "../hook/Validartoken";
import { exibirCPF, exibirTelefone, hojeISO, mensagemErroApi, somenteDigitos } from "../utils/validacoes";

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
  const [historico, setHistorico] = useState<{ sol_id: number; protocolo: string } | null>(null);
  const navigate = useNavigate();
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

  const turnoDe = (a: Agendamento) => (a.sol_turno ?? "manha") as "manha" | "tarde";
  const confirmaram = agendados.filter((a) => a.sol_presenca === "vou").length;
  const naoVao = agendados.filter((a) => a.sol_presenca === "nao_vou").length;
  const TURNOS = [
    { id: "manha" as const, rotulo: "Manhã", Icone: Sunrise, cor: "text-amber-600" },
    { id: "tarde" as const, rotulo: "Tarde", Icone: Sunset, cor: "text-violet-600" },
  ];
  const hojeExtenso = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  function cartao(a: Agendamento) {
    const protocolo = a.sol_protocolo ?? String(a.sol_id);
    return (
      <article key={a.sol_id} className="adm-cartao mb-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AvatarIniciais nome={a.paciente.pac_nome} />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{a.paciente.pac_nome}</p>
              <p className="text-xs text-gray-500">
                CPF {exibirCPF(a.paciente.pac_cpf)}
                {a.paciente.pac_telefone ? ` · ${exibirTelefone(a.paciente.pac_telefone)}` : ""}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-extrabold tracking-wide text-blue-700 [font-family:var(--fonte-botao)]">{protocolo}</span>
        </div>
        <div className="my-3 flex flex-wrap gap-1.5">
          {a.insumos.map((i) => (
            <span key={i.ins_id ?? i.ins_nome} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-gray-800">
              {i.quantidade}x {i.ins_nome}
            </span>
          ))}
          {a.sol_presenca === "vou" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
              <UserCheck size={13} aria-hidden="true" /> Confirmou
            </span>
          )}
          {a.sol_presenca === "nao_vou" && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Avisou que não vai</span>
          )}
          {a.sol_ciclo && a.sol_ciclo > 1 ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-gray-600">{a.sol_ciclo}ª retirada</span>
          ) : null}
        </div>
        {a.sol_recado && (
          <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">
            <MessageSquareText size={14} className="mt-px shrink-0" aria-hidden="true" /> Recado: {a.sol_recado}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => concluir(a.sol_id)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700 [font-family:var(--fonte-botao)]"
            aria-label={`Entregar e concluir a coleta ${protocolo}`}
          >
            <PackageCheck size={18} aria-hidden="true" /> Entregar e concluir
          </button>
          <MenuAcoes
            rotulo={`Mais ações do protocolo ${protocolo}`}
            opcoes={[
              {
                texto: "Remarcar",
                Icone: CalendarClock,
                onClick: async () => {
                  if (await remarcarComData(a.sol_id, protocolo, a.sol_data_de_coleta, a.sol_turno)) carregar();
                },
              },
              {
                texto: a.sol_recado ? "Editar recado" : "Deixar recado",
                Icone: MessageSquareText,
                onClick: async () => {
                  if (await editarRecado(a.sol_id, protocolo, a.sol_recado)) carregar();
                },
              },
              { texto: "Histórico", Icone: History, onClick: () => setHistorico({ sol_id: a.sol_id, protocolo }) },
              { texto: "Ficha do paciente", Icone: User, onClick: () => navigate(`/pacientesadm/${a.paciente.pac_id}`) },
              { texto: "Cancelar agendamento", Icone: CircleX, perigo: true, onClick: () => cancelar(a.sol_id) },
            ]}
          />
        </div>
      </article>
    );
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

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5" role="status">
            <div className="adm-cartao flex items-center gap-3 px-4 py-3">
              <span className="text-2xl font-extrabold text-blue-700">{carregando ? "…" : agendados.length}</span>
              <span className="text-sm text-gray-600">a atender</span>
            </div>
            <div className="adm-cartao flex items-center gap-3 px-4 py-3">
              <span className="text-2xl font-extrabold text-green-600">{carregando ? "…" : concluidos.length}</span>
              <span className="text-sm text-gray-600">já concluídas</span>
            </div>
            {TURNOS.map(({ id, rotulo, Icone, cor }) => {
              const pend = agendados.filter((a) => turnoDe(a) === id).length;
              const tot = pend + concluidos.filter((a) => turnoDe(a) === id).length;
              return (
                <div key={id} className="adm-cartao flex items-center gap-3 px-4 py-3">
                  <Icone size={20} className={`shrink-0 ${cor}`} aria-hidden="true" />
                  <span className="text-sm leading-tight text-gray-600">
                    <strong className="block text-base text-gray-900">{carregando ? "…" : `${pend} de ${tot}`}</strong>
                    {rotulo.toLowerCase()} {pend === 1 ? "pendente" : "pendentes"}
                  </span>
                </div>
              );
            })}
            <div className="adm-cartao col-span-2 flex items-center gap-3 px-4 py-3 md:col-span-1">
              <UserCheck size={20} className="shrink-0 text-green-600" aria-hidden="true" />
              <span className="text-sm leading-tight text-gray-600">
                <strong className="block text-base text-gray-900">{confirmaram} {confirmaram === 1 ? "confirmou" : "confirmaram"}</strong>
                {naoVao} {naoVao === 1 ? "avisou" : "avisaram"} que não vai
              </span>
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

          {!carregando && !erro && (agendados.length > 0 || concluidos.length > 0) && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {TURNOS.map(({ id, rotulo, Icone, cor }) => {
                const lista = filtrados.filter((a) => turnoDe(a) === id);
                const feitas = concluidos.filter((a) => turnoDe(a) === id);
                return (
                  <section key={id} aria-label={`Coletas da ${rotulo.toLowerCase()}`}>
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                      <Icone size={19} className={cor} aria-hidden="true" /> {rotulo}
                      <span className="text-sm font-medium text-gray-500">
                        · {lista.length} a atender
                      </span>
                    </h2>
                    {lista.map(cartao)}
                    {lista.length === 0 && (
                      <p className="mb-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-4 text-sm text-gray-500">
                        {busca ? "Nenhuma coleta deste turno corresponde à busca." : "Nenhuma coleta pendente neste turno."}
                      </p>
                    )}
                    {feitas.length > 0 && (
                      <>
                        <p className="mb-2 mt-4 text-sm font-semibold text-gray-500">Concluídas {id === "manha" ? "nesta manhã" : "nesta tarde"}</p>
                        <ul className="flex flex-col gap-2">
                          {feitas.map((a) => (
                            <li key={a.sol_id} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-600">
                              <CircleCheck size={17} className="shrink-0 text-green-600" aria-hidden="true" />
                              <strong className="text-gray-800">{a.paciente.pac_nome}</strong>
                              <span>· {a.sol_protocolo ?? a.sol_id}</span>
                              <span className="ml-auto text-xs">
                                {a.sol_retirado_por_nome ? `retirado por ${a.sol_retirado_por_nome}` : "retirado pelo próprio paciente"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {historico && (
        <ModalHistorico
          sol_id={historico.sol_id}
          perfil="ADMIN"
          titulo={`Histórico de ${historico.protocolo}`}
          onClose={() => setHistorico(null)}
        />
      )}

      <Footer />
    </div>
  );
}
