import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import SeloStatus from "../components/universais/SeloStatus";
import ModalHistorico from "../components/universais/ModalHistorico";
import { useValidarToken } from "../hook/Validartoken";
import { buscarFichaPaciente, type FichaPaciente as Ficha } from "../services/PainelService";
import { exibirCPF, exibirTelefone, mensagemErroApi } from "../utils/validacoes";
import { formatarData } from "../utils/status";
import { resumoInsumos } from "../utils/itensPrescricao";
import SeloPrioridade from "../components/universais/SeloPrioridade";
import PessoasAutorizadas from "../components/universais/PessoasAutorizadas";
import { conferirPrioridade } from "../services/AgendaService";
import Swal from "sweetalert2";

// Prescrições em andamento e agendamentos ainda não realizados podem mudar de unidade

const SEXOS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
  N: "Prefiro não responder",
};

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{rotulo}</dt>
      <dd className="mt-0.5 break-words text-gray-900">{valor?.toString().trim() || "—"}</dd>
    </div>
  );
}

/**
 * Ficha do paciente (visão do admin): dados de contato, prescrições e
 * agendamentos numa tela só, com atalhos para as ações de cada item.
 */
export default function FichaPaciente() {
  const { verificando } = useValidarToken("ADMIN");
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [historicoDe, setHistoricoDe] = useState<{ id: number; titulo: string } | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setFicha(await buscarFichaPaciente(Number(id)));
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar a ficha do paciente."));
    }
  }, [id]);

  // carrega fora do corpo do efeito (o estado só muda no callback)
  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  if (verificando || (!ficha && !erro)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600" role="status">Carregando ficha do paciente...</p>
      </div>
    );
  }

  const p = ficha?.paciente;

  // a unidade confere o laudo ou o cartão da gestante
  async function conferir(conferida: boolean) {
    if (!p) return;
    try {
      const r = await conferirPrioridade(p.pac_id, conferida);
      await carregar();
      Swal.fire({ icon: "success", title: r.message, confirmButtonColor: "#1d4ed8" });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Não foi possível salvar", text: mensagemErroApi(e, "Tente novamente."), confirmButtonColor: "#d33" });
    }
  }
  const declarou = Boolean(p?.pac_pcd || p?.pac_gestante);
  const oQueDeclarou = [p?.pac_pcd && "pessoa com deficiência", p?.pac_gestante && "gestante"].filter(Boolean).join(" e ");


  // Abre a prescrição na tela certa para o status dela
  function abrirPrescricao(sol_id: number, status: string) {
    if (status === "Nao Autorizado") navigate(`/administrador/prescricao/nao-autorizada/${sol_id}`);
    else if (status === "Autorizado") navigate(`/Agendamentosadm?cpf=${p?.pac_cpf ?? ""}&sol_id=${sol_id}`);
    else navigate(`/administrador/prescricao/autorizarprescricao/${sol_id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/Pacientesadm" />
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {erro && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button
              type="button"
              onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {p && ficha && (
          <>
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-700">Ficha do paciente</p>
                <h1 className="break-words text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {p.pac_nome}
                  {p.prioridade?.motivo ? <span className="ml-3 align-middle"><SeloPrioridade prioridade={p.prioridade} /></span> : null}
                </h1>
                <p className="text-sm text-gray-500">CPF {exibirCPF(p.pac_cpf)}</p>
              </div>
              <button
                type="button"
                className="botao-novo-agendamento"
                onClick={() => navigate(`/Agendamentosadm?cpf=${encodeURIComponent(p.pac_cpf)}`)}
              >
                <span aria-hidden="true">+</span> Novo agendamento
              </button>
            </header>

            {/* Atendimento prioritário declarado pelo paciente */}
            {declarou && (
              <section
                className={`mb-6 rounded-2xl border p-4 text-sm sm:p-5 ${
                  p.pac_prioridade_conferida === true
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                    : p.pac_prioridade_conferida === false
                      ? "border-gray-200 bg-white text-gray-800"
                      : "border-amber-200 bg-amber-50 text-amber-950"
                }`}
                aria-labelledby="prioridade-titulo"
              >
                <h2 id="prioridade-titulo" className="font-semibold">Atendimento prioritário</h2>
                <p className="mt-1">
                  O paciente declarou ser <strong>{oQueDeclarou}</strong>.{" "}
                  {p.pac_prioridade_conferida === true
                    ? "Confirmado pela unidade: as prescrições entram com prioridade na fila."
                    : p.pac_prioridade_conferida === false
                      ? "A unidade não confirmou; o paciente segue na ordem de chegada."
                      : "Confira o laudo ou o cartão da gestante no atendimento."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.pac_prioridade_conferida !== true && (
                    <button type="button" onClick={() => conferir(true)}
                      className="min-h-10 rounded-full bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-700">
                      Confirmar prioridade
                    </button>
                  )}
                  {p.pac_prioridade_conferida !== false && (
                    <button type="button" onClick={() => conferir(false)}
                      className="min-h-10 rounded-full border border-gray-300 bg-white px-4 font-medium text-gray-700 hover:bg-gray-50">
                      Não confirmar
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Dados */}
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="dados-titulo">
              <h2 id="dados-titulo" className="mb-4 text-lg font-semibold text-gray-800">Dados de contato</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Campo rotulo="Telefone" valor={exibirTelefone(p.pac_telefone)} />
                <Campo rotulo="E-mail" valor={p.pac_email} />
                <Campo rotulo="Data de nascimento" valor={formatarData(p.pac_data_nasc)} />
                <Campo rotulo="Endereço" valor={p.pac_endereco} />
                <Campo rotulo="CEP" valor={p.pac_cep} />
                <Campo rotulo="Gênero" valor={SEXOS[p.pac_sexo ?? ""] ?? p.pac_sexo} />
                <Campo rotulo="Raça/Cor" valor={p.pac_raca} />
              </dl>
            </section>

            <PessoasAutorizadas pac_id={p.pac_id} />

            {/* Prescrições */}
            <section className="mt-6" aria-labelledby="prescricoes-titulo">
              <h2 id="prescricoes-titulo" className="mb-3 text-lg font-semibold text-gray-800">
                Prescrições <span className="text-gray-400">({ficha.prescricoes.length})</span>
              </h2>
              {ficha.prescricoes.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-gray-500 shadow-sm">Nenhuma prescrição enviada.</p>
              ) : (
                <ul className="space-y-3">
                  {ficha.prescricoes.map((s) => (
                    <li key={s.sol_id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">Prescrição nº {s.sol_id}</p>
                          <p className="text-sm text-gray-600">
                            Enviada em {formatarData(s.sol_data_solicitacao)} · {s.pos_nome ?? "Posto não informado"}
                          </p>
                          {resumoInsumos(s) && (
                            <p className="text-sm text-gray-600">
                              {resumoInsumos(s)}
                              {s.sol_periodicidade_dias ? ` · uso contínuo, a cada ${s.sol_periodicidade_dias} dias` : ""}
                              {s.sol_data_vencimento ? ` · vence em ${formatarData(s.sol_data_vencimento)}` : ""}
                            </p>
                          )}
                        </div>
                        <SeloStatus status={s.sol_status} />
                      </div>
                      {(s.sol_motivo_nao_autorizado || s.sol_motivo_reenvio) && (
                        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                          Motivo: {s.sol_motivo_nao_autorizado || s.sol_motivo_reenvio}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold">
                        <button type="button" onClick={() => abrirPrescricao(s.sol_id, s.sol_status)} className="min-h-10 text-blue-700 hover:underline">
                          {s.sol_status === "Autorizado" ? "Agendar coleta →" : "Abrir prescrição →"}
                        </button>
                        <button type="button" onClick={() => setHistoricoDe({ id: s.sol_id, titulo: `Histórico da prescrição nº ${s.sol_id}` })} className="min-h-10 text-blue-700 hover:underline">
                          Histórico
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Agendamentos */}
            <section className="mt-6" aria-labelledby="agendamentos-titulo">
              <h2 id="agendamentos-titulo" className="mb-3 text-lg font-semibold text-gray-800">
                Agendamentos <span className="text-gray-400">({ficha.agendamentos.length})</span>
              </h2>
              {ficha.agendamentos.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-gray-500 shadow-sm">Nenhum agendamento.</p>
              ) : (
                <ul className="space-y-3">
                  {ficha.agendamentos.map((a) => (
                    <li key={a.sol_id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">
                            {a.sol_protocolo ?? `Agendamento nº ${a.sol_id}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Coleta em {formatarData(a.sol_data_de_coleta)} · {a.pos_nome ?? "Posto não informado"}
                          </p>
                          <p className="break-words text-sm text-gray-600">
                            {a.insumos?.length
                              ? a.insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ")
                              : "Sem insumos informados"}
                          </p>
                        </div>
                        <SeloStatus status={a.sol_status} />
                      </div>
                      {a.sol_status === "cancelado" && (
                        <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-900">
                          Motivo do cancelamento: {a.sol_motivo_cancelamento || "não registrado"}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold">
                        <button type="button" onClick={() => setHistoricoDe({ id: a.sol_id, titulo: `Histórico de ${a.sol_protocolo ?? "agendamento"}` })} className="min-h-10 text-blue-700 hover:underline">
                          Histórico
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      {historicoDe && (
        <ModalHistorico sol_id={historicoDe.id} perfil="ADMIN" titulo={historicoDe.titulo} onClose={() => setHistoricoDe(null)} />
      )}

      <Footer />
    </div>
  );
}
