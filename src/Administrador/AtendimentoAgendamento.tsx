import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { AlertTriangle, CalendarClock, CheckCircle2, History, QrCode, XCircle } from "lucide-react";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import StatusBadge from "../components/usuario-1/agendamentos/StatusBadge";
import { cancelarComMotivo } from "../components/usuario-1/agendamentos/cancelarComMotivo";
import ModalHistorico from "../components/universais/ModalHistorico";
import { remarcarComData } from "../components/universais/acoesAdmin";
import { buscarAtendimento, concluirAgendamento } from "../services/AgendamentoService";
import type { AtendimentoAgendamento as Atendimento } from "../types/agendamento";
import { useValidarToken } from "../hook/Validartoken";
import { mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";
import "../css/universais/LeitorQRCode.css";

// textos vindos do banco entram no HTML do alerta: escapar sempre
const esc = (t: unknown) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/**
 * Agendamento aberto pelo leitor de QR Code. Só mostra o necessário para
 * conferir no balcão e oferece as ações do card de agendamento que fazem
 * sentido ali: concluir, cancelar, remarcar e ver o histórico. Recado,
 * ficha do paciente e prescrição continuam nas páginas próprias. As regras
 * (status, estoque, prescrição vencida, posto) são as do backend.
 */
export default function AtendimentoAgendamento() {
  const { verificando } = useValidarToken("ADMIN");
  const { id } = useParams();
  const sol_id = Number(id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ag, setAg] = useState<Atendimento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [verHistorico, setVerHistorico] = useState(false);
  // quem está retirando: "" = o próprio paciente; senão o pau_id da pessoa autorizada
  const [retirante, setRetirante] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setAg(await buscarAtendimento(sol_id));
    } catch (e) {
      setAg(null);
      setErro(mensagemErroApi(e, "Não foi possível abrir este agendamento."));
    } finally {
      setCarregando(false);
    }
  }, [sol_id]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  const protocolo = ag?.sol_protocolo ?? `#${sol_id}`;
  const outroDia = Boolean(ag?.sol_data_de_coleta && ag.sol_data_de_coleta !== ag.hoje);
  const semEstoque = ag?.insumos.filter((i) => i.estoque < i.quantidade) ?? [];

  async function concluir() {
    if (!ag) return;
    const itens = ag.insumos.map((i) => `${i.quantidade}x ${esc(i.ins_nome)}`).join("<br>");
    const pessoa = ag.autorizados?.find((a) => String(a.pau_id) === retirante);
    const quem = pessoa
      ? `<p style="margin-top:10px">Retirado por <strong>${esc(pessoa.pau_nome)}</strong>${pessoa.pau_parentesco ? ` (${esc(pessoa.pau_parentesco)})` : ""}. Confira o documento com foto.</p>`
      : "";
    const aviso = outroDia
      ? `<p style="margin-top:10px;color:#b45309"><strong>Atenção:</strong> esta coleta estava marcada para ${esc(formatarData(ag.sol_data_de_coleta))}.</p>`
      : "";

    const ok = await Swal.fire({
      icon: "question",
      title: "Entregar e concluir?",
      html: `<p><strong>${esc(protocolo)}</strong> · ${esc(ag.paciente.pac_nome)}</p>
             <p style="margin-top:6px">${itens}</p>${quem}${aviso}`,
      showCancelButton: true,
      confirmButtonText: "Concluir coleta",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#16a34a",
      reverseButtons: true,
      focusConfirm: true,
    });
    if (!ok.isConfirmed) return;

    setEnviando(true);
    try {
      await concluirAgendamento(ag.sol_id, pessoa?.pau_id ?? null);
      await Swal.fire({ icon: "success", title: "Coleta concluída", text: "O estoque foi atualizado.", timer: 1600, showConfirmButton: false });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Não foi possível concluir",
        text: mensagemErroApi(e, "Tente novamente."),
        confirmButtonColor: "#d33",
      });
    } finally {
      setEnviando(false);
      carregar();
    }
  }

  async function cancelar() {
    if (!ag) return;
    setEnviando(true);
    try {
      await cancelarComMotivo(ag.sol_id, protocolo);
    } finally {
      setEnviando(false);
      carregar();
    }
  }

  async function remarcar() {
    if (!ag) return;
    setEnviando(true);
    try {
      if (await remarcarComData(ag.sol_id, protocolo, ag.sol_data_de_coleta)) await carregar();
    } finally {
      setEnviando(false);
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
        <BotaoVoltar para="/leitor-qrcode" />
      </div>

      <main id="conteudo" className="leitor-pagina leitor-pagina--estreita">
        {carregando && (
          <p className="py-10 text-center text-gray-400" role="status">Carregando agendamento…</p>
        )}

        {!carregando && erro && (
          <div className="leitor-cartao text-center" role="alert">
            <p className="text-rose-600">{erro}</p>
            <Link to="/leitor-qrcode" className="leitor-botao mt-4">
              <QrCode size={18} aria-hidden="true" /> Ler outro QR Code
            </Link>
          </div>
        )}

        {!carregando && ag && (
          <article className="leitor-cartao atendimento" aria-labelledby="titulo-atendimento">
            <header className="atendimento-topo">
              <div>
                <p className="atendimento-rotulo">Agendamento</p>
                <h1 id="titulo-atendimento" className="atendimento-protocolo">{protocolo}</h1>
              </div>
              <StatusBadge status={ag.status} />
            </header>

            <dl className="atendimento-dados">
              <div className="atendimento-dados--largo">
                <dt>Paciente</dt>
                <dd>{ag.paciente.pac_nome}</dd>
              </div>
              <div>
                <dt>CPF</dt>
                <dd>{ag.paciente.pac_cpf_parcial ?? "—"}</dd>
              </div>
              <div>
                <dt>Data da coleta</dt>
                <dd>{formatarData(ag.sol_data_de_coleta)}</dd>
              </div>
              <div className="atendimento-dados--largo">
                <dt>Unidade</dt>
                <dd>{ag.posto.pos_nome ?? "—"}</dd>
              </div>
              <div className="atendimento-dados--largo">
                <dt>Insumos</dt>
                <dd>
                  <ul className="atendimento-insumos">
                    {ag.insumos.map((i) => (
                      <li key={i.ins_id}>
                        <span>{i.quantidade}x {i.ins_nome}</span>
                        {ag.status === "agendado" && (
                          <span className={i.estoque < i.quantidade ? "atendimento-estoque--falta" : "atendimento-estoque"}>
                            estoque: {i.estoque}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            {ag.status === "agendado" && (
              <>
                {outroDia && (
                  <p className="leitor-aviso leitor-aviso--alerta">
                    <AlertTriangle size={18} aria-hidden="true" />
                    Esta coleta está marcada para {formatarData(ag.sol_data_de_coleta)}, não para hoje.
                  </p>
                )}
                {ag.prescricao_vencida && (
                  <p className="leitor-aviso leitor-aviso--erro">
                    <AlertTriangle size={18} aria-hidden="true" />
                    A prescrição deste agendamento venceu. A coleta não pode ser concluída.
                  </p>
                )}
                {semEstoque.length > 0 && (
                  <p className="leitor-aviso leitor-aviso--erro">
                    <AlertTriangle size={18} aria-hidden="true" />
                    Estoque insuficiente de {semEstoque.map((i) => i.ins_nome).join(", ")}.
                  </p>
                )}

                {/* Quem está no balcão: o paciente ou alguém autorizado na ficha dele */}
                {(ag.autorizados?.length ?? 0) > 0 && (
                  <fieldset className="atendimento-retirante">
                    <legend>Quem está retirando?</legend>
                    <label>
                      <input type="radio" name="retirante" value="" checked={retirante === ""} onChange={() => setRetirante("")} />
                      <span>O próprio paciente</span>
                    </label>
                    {ag.autorizados!.map((a) => (
                      <label key={a.pau_id}>
                        <input type="radio" name="retirante" value={a.pau_id} checked={retirante === String(a.pau_id)}
                          onChange={() => setRetirante(String(a.pau_id))} />
                        <span>
                          {a.pau_nome}
                          {a.pau_parentesco ? ` (${a.pau_parentesco})` : ""}
                          <small>CPF {a.pau_cpf_parcial ?? "—"}</small>
                        </span>
                      </label>
                    ))}
                    {retirante && <p className="atendimento-retirante-aviso">Confira o documento com foto antes de entregar.</p>}
                  </fieldset>
                )}

                <div className="atendimento-acoes">
                  <button type="button" className="leitor-botao leitor-botao--sucesso" onClick={concluir}
                    disabled={enviando || ag.prescricao_vencida || semEstoque.length > 0}>
                    <CheckCircle2 size={18} aria-hidden="true" /> Concluir coleta
                  </button>
                  <button type="button" className="leitor-botao leitor-botao--perigo" onClick={cancelar} disabled={enviando}>
                    <XCircle size={18} aria-hidden="true" /> Cancelar agendamento
                  </button>
                </div>
              </>
            )}

            {ag.status !== "agendado" && (
              <p className="leitor-aviso">
                {ag.status === "concluido" &&
                  `Esta coleta já foi concluída${ag.sol_retirado_por_nome ? `, retirada por ${ag.sol_retirado_por_nome}` : ""}.`}
                {ag.status === "cancelado" && `Este agendamento foi cancelado${ag.sol_motivo_cancelamento ? `: ${ag.sol_motivo_cancelamento}` : "."}`}
                {ag.status === "nao_compareceu" && "Este agendamento foi registrado como \"não compareceu\". Crie um novo agendamento na página Agendamentos."}
              </p>
            )}

            {/* ações secundárias, como no card de agendamento: histórico sempre; remarcar só se ainda agendado */}
            <div className="atendimento-secundarias">
              <button type="button" onClick={() => setVerHistorico(true)}>
                <History size={16} aria-hidden="true" /> Histórico
              </button>
              {ag.status === "agendado" && (
                <button type="button" onClick={remarcar} disabled={enviando}>
                  <CalendarClock size={16} aria-hidden="true" /> Remarcar
                </button>
              )}
            </div>

            <div className="atendimento-rodape">
              <Link to="/leitor-qrcode" className="leitor-botao leitor-botao--contorno">
                <QrCode size={18} aria-hidden="true" /> Ler próximo QR Code
              </Link>
            </div>
          </article>
        )}
      </main>

      {verHistorico && ag && (
        <ModalHistorico
          sol_id={ag.sol_id}
          perfil="ADMIN"
          titulo={`Histórico de ${protocolo}`}
          onClose={() => setVerHistorico(false)}
        />
      )}

      <Footer />
    </div>
  );
}
