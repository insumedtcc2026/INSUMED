import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { buscarPacientesPorCpf } from "../../../services/PacientesServices";
import { criarAgendamento } from "../../../services/AgendamentoService";
import type { Paciente, ItemNovoAgendamento, Posto } from "../../../types/agendamento";
import { exibirCPF, exibirTelefone, hojeISO, mensagemErroApi } from "../../../utils/validacoes";
import { AvatarIniciais } from "../../universais/AdminUI";
import CampoBusca, { type OpcaoBusca } from "../../universais/CampoBusca";
import { buscarPostoHabitualDoPaciente, postoDoAdminLogado } from "../../../utils/postoSugerido";

import { buscarDatasSugeridas, type DatasSugeridas } from "../../../services/PainelService";
import { listarEstoqueDoPosto, type InsumoEstoque } from "../../../services/InsumosServices";
import { API_URL } from "../../../config";
import { diaCurto, ROTULO_TURNO, textoVagas, TURNOS, type Turno } from "../../../utils/agenda";

interface NovoAgendamentoModalProps {
  onClose: () => void;
  onSuccess: () => void;
  cpfInicial?: string;
    insumoInicial?: string;
  quantidadeInicial?: number;
  // todos os insumos da prescrição (etapa 2: uma prescrição pode ter vários)
  itensIniciais?: ItemNovoAgendamento[];
  // prescrição autorizada que originou este agendamento ("Agendar" na lista
  // de solicitações). O backend impede um segundo agendamento ativo para ela.
  solOrigemId?: number;
}

/**
 * Página 1: "Novo Agendamento" (cadastro). Renderizada como modal.
 *
 * Suporta MÚLTIPLOS insumos por agendamento. Cada insumo é escolhido no
 * estoque da unidade selecionada, mostrando quanto está disponível (estoque
 * menos o já reservado em outras coletas agendadas). Pedir mais do que o
 * disponível é permitido depois de uma confirmação, porque o insumo pode
 * chegar até a data da coleta.
 */
export default function NovoAgendamentoModal({ onClose, onSuccess,   cpfInicial = "",  insumoInicial = "",
  quantidadeInicial = 0, itensIniciais, solOrigemId }: NovoAgendamentoModalProps) {
  // --- paciente ---
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [resultadosPaciente, setResultadosPaciente] = useState<Paciente[]>([]);
  const [paciente, setPaciente] = useState<Paciente | null>(null);

  useEffect(() => {
  if (cpfInicial) {
    setBuscaPaciente(cpfInicial);
  }
}, [cpfInicial]);
useEffect(() => {
  if (cpfInicial) {
    setBuscaPaciente(cpfInicial);
  }


  if (quantidadeInicial > 0) {
    setQuantidade(String(quantidadeInicial));
  }
}, [cpfInicial, insumoInicial, quantidadeInicial]);

  // --- insumo sendo adicionado (escolhido no estoque da unidade) ---
  const [insumoEscolhido, setInsumoEscolhido] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [estoque, setEstoque] = useState<InsumoEstoque[]>([]);
  const [carregandoEstoque, setCarregandoEstoque] = useState(false);

  // --- lista de itens já adicionados ao agendamento ---
  const [itens, setItens] = useState<ItemNovoAgendamento[]>([]);

  // --- data e turno da coleta ("" = o primeiro turno do dia com vaga) ---
  const [dataColeta, setDataColeta] = useState("");
  const [turno, setTurno] = useState<Turno | "">("");

  // --- posto de coleta ---
  const [postos, setPostos] = useState<Posto[]>([]);
  const [postoSelecionado, setPostoSelecionado] = useState<Posto | null>(null);
  // sugestões de unidade: a do próprio admin e a que o paciente mais usa
  // (o admin pode escolher qualquer outra; depois disso não trocamos sozinhos)
  const [postoDoAdmin] = useState(postoDoAdminLogado);
  const [habitual, setHabitual] = useState<{ pac_id: number; pos_id: number | null } | null>(null);
  const escolheuPostoManual = useRef(false);
  const postosRef = useRef<Posto[]>([]);
  const habitualRef = useRef<number | null>(null);

  // --- datas sugeridas para o posto escolhido ---
  const [sugestoes, setSugestoes] = useState<DatasSugeridas | null>(null);

  useEffect(() => {
    setSugestoes(null);
    if (!postoSelecionado) return;
    let ativo = true;
    buscarDatasSugeridas(postoSelecionado.pos_id)
      .then((d) => ativo && setSugestoes(d))
      .catch(() => {
        /* sem sugestões; o admin escolhe a data no calendário normalmente */
      });
    return () => {
      ativo = false;
    };
  }, [postoSelecionado]);

  // estoque da unidade escolhida; itens já adicionados são ligados ao insumo
  // de mesmo nome desta unidade (ou ficam sem ins_id, e o aviso aparece)
  useEffect(() => {
    setEstoque([]);
    if (!postoSelecionado) return;
    let ativo = true;
    setCarregandoEstoque(true);
    listarEstoqueDoPosto(postoSelecionado.pos_id)
      .then((lista) => {
        if (!ativo) return;
        setEstoque(lista);
        const porNome = (nome: string) =>
          lista.find((i) => i.ins_nome.trim().toLowerCase() === nome.trim().toLowerCase());
        setItens((prev) => prev.map((item) => ({ ...item, ins_id: porNome(item.ins_nome)?.ins_id })));
        // insumo da prescrição já vem escolhido
        if (insumoInicial) setInsumoEscolhido(String(porNome(insumoInicial)?.ins_id ?? ""));
      })
      .catch(() => ativo && setErro("Não foi possível carregar o estoque desta unidade."))
      .finally(() => ativo && setCarregandoEstoque(false));
    return () => {
      ativo = false;
    };
  }, [postoSelecionado, insumoInicial]);

  const insumoPorId = (id?: number) => estoque.find((i) => i.ins_id === id);

  // --- envio ---
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Carrega a lista de postos assim que o modal abre (backend exige
  // posto.pos_id pra criar o agendamento, então precisamos que o ADM escolha)
  useEffect(() => {
    axios
      .get<Posto[]>(`${API_URL}/postos`)
      .then((res) => {
        setPostos(res.data);
        postosRef.current = res.data;
        if (res.data.length === 1) setPostoSelecionado(res.data[0]);
        // começa pela habitual do paciente (se já conhecida) ou pela unidade do admin
        else {
          const sugerido = res.data.find((p) => p.pos_id === (habitualRef.current ?? postoDoAdmin));
          setPostoSelecionado((atual) => atual ?? sugerido ?? null);
        }
      })
      .catch(() => setErro("Não foi possível carregar os postos de coleta."));
  }, [postoDoAdmin]);

  // Busca de paciente por CPF (debounced) — esta busca continua existindo,
  // só a de produto que foi removida.
  useEffect(() => {
    if (!buscaPaciente || paciente) {
      setResultadosPaciente([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await buscarPacientesPorCpf(buscaPaciente);
      setResultadosPaciente(res);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [buscaPaciente, paciente]);



  useEffect(() => {
  if (itensIniciais?.length) {
    setItens(itensIniciais);
  } else if (insumoInicial && quantidadeInicial > 0) {
    setItens([
      {
        ins_nome: insumoInicial,
        quantidade: quantidadeInicial,
      },
    ]);
  }
}, [itensIniciais, insumoInicial, quantidadeInicial]);
  // unidade habitual do paciente escolhido (pelas coletas e prescrições dele);
  // ela vale mais que a do admin, enquanto o admin não escolher outra
  useEffect(() => {
    if (!paciente) return;
    let ativo = true;
    buscarPostoHabitualDoPaciente(paciente.pac_id)
      .then((pos_id) => {
        if (!ativo) return;
        habitualRef.current = pos_id;
        setHabitual({ pac_id: paciente.pac_id, pos_id });
        const posto = postosRef.current.find((p) => p.pos_id === pos_id);
        if (posto) setPostoSelecionado((atual) => (escolheuPostoManual.current ? atual : posto));
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [paciente]);
  const postoHabitual = habitual && habitual.pac_id === paciente?.pac_id ? habitual.pos_id : null;

  function escolherPosto(pos_id: number) {
    escolheuPostoManual.current = true;
    setPostoSelecionado(postos.find((p) => p.pos_id === pos_id) ?? null);
  }

  // postos para a busca, com as sugestões no topo e marcadas
  const opcoesPosto = useMemo<OpcaoBusca[]>(() => {
    const selo = (pos_id: number) =>
      [pos_id === postoHabitual && "Habitual do paciente", pos_id === postoDoAdmin && "Sua unidade"].filter(Boolean).join(" · ");
    const sugerido = (p: Posto) => (p.pos_id === postoHabitual ? 0 : p.pos_id === postoDoAdmin ? 1 : 2);
    return [...postos]
      .sort((a, b) => sugerido(a) - sugerido(b))
      .map((p) => ({ valor: String(p.pos_id), rotulo: p.pos_nome, detalhe: p.pos_endereco ?? undefined, selo: selo(p.pos_id) || undefined }));
  }, [postos, postoHabitual, postoDoAdmin]);

  const sugestoesPosto = [
    { pos_id: postoHabitual, rotulo: "Habitual do paciente" },
    { pos_id: postoDoAdmin, rotulo: "Sua unidade" },
  ].filter((s, i, todas) => s.pos_id && s.pos_id !== postoSelecionado?.pos_id && todas.findIndex((t) => t.pos_id === s.pos_id) === i)
    .map((s) => ({ ...s, posto: postos.find((p) => p.pos_id === s.pos_id) }))
    .filter((s) => s.posto);

  const opcoesInsumo = useMemo<OpcaoBusca[]>(
    () =>
      estoque.map((i) => ({
        valor: String(i.ins_id),
        rotulo: `${i.ins_nome}${i.ins_marca ? ` (${i.ins_marca})` : ""}`,
        detalhe: `disponível ${i.ins_disponivel}`,
      })),
    [estoque]
  );

  function selecionarPaciente(p: Paciente) {
    setPaciente(p);
    setBuscaPaciente(`${p.pac_nome} — ${exibirCPF(p.pac_cpf)}`);
    setResultadosPaciente([]);
  }

  function adicionarItem() {
    setErro(null);
    const insumo = insumoPorId(Number(insumoEscolhido));
    if (!insumo) {
      setErro("Escolha o insumo no estoque da unidade antes de adicionar.");
      return;
    }
    const qtd = Number(quantidade);
    if (!Number.isInteger(qtd) || qtd <= 0) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }
    // o mesmo insumo duas vezes vira uma linha só
    setItens((prev) => {
      const existente = prev.find((i) => i.ins_id === insumo.ins_id);
      if (existente) {
        return prev.map((i) => (i.ins_id === insumo.ins_id ? { ...i, quantidade: i.quantidade + qtd } : i));
      }
      return [...prev, { ins_id: insumo.ins_id, ins_nome: insumo.ins_nome, quantidade: qtd }];
    });
    setInsumoEscolhido("");
    setQuantidade("");
  }

  function removerItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  // botões − / + da tabela de insumos (mínimo 1)
  function alterarQuantidade(index: number, delta: number) {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, quantidade: Math.max(1, item.quantidade + delta) } : item)));
  }

  function trocarPaciente() {
    setPaciente(null);
    setBuscaPaciente("");
  }

  async function handleSalvar(confirmarSemEstoque = false) {
    setErro(null);
    if (!paciente) return setErro("Selecione um paciente.");
    if (itens.length === 0) return setErro("Adicione ao menos um produto.");
    if (!dataColeta) return setErro("Informe a data da coleta.");
    if (dataColeta < hojeISO()) return setErro("A data da coleta não pode estar no passado.");
    if (!postoSelecionado) return setErro("Selecione o posto de coleta.");
    const semEstoque = itens.find((i) => !i.ins_id);
    if (semEstoque) {
      return setErro(`"${semEstoque.ins_nome}" não está no estoque de ${postoSelecionado.pos_nome}. Remova o item ou cadastre o insumo nesta unidade.`);
    }
    if (enviando) return;

    setEnviando(true);
    try {
      const resultado = await criarAgendamento({
        paciente,
        sol_data_de_coleta: dataColeta,
        ...(turno ? { sol_turno: turno } : {}),
        posto: postoSelecionado,
        itens,
        ...(solOrigemId ? { sol_origem_id: solOrigemId } : {}),
        ...(confirmarSemEstoque ? { confirmar_sem_estoque: true } : {}),
      });

      Swal.fire({
        icon: "success",
        title: "Agendamento criado com sucesso!",
        text: `Protocolo: ${resultado.sol_protocolo}`,
        confirmButtonColor: "#00ce11",
      });

      onSuccess?.();
    } catch (e) {
      // estoque disponível menor que o pedido: pergunta antes de agendar
      const dados = axios.isAxiosError(e) ? e.response?.data : undefined;
      if (axios.isAxiosError(e) && e.response?.status === 409 && dados?.codigo === "ESTOQUE_INSUFICIENTE") {
        setEnviando(false);
        const lista = (dados.itens as { ins_nome: string; pedido: number; disponivel: number }[])
          .map((i) => `${i.ins_nome}: pedido ${i.pedido}, disponível ${i.disponivel}`)
          .join("\n");
        const resposta = await Swal.fire({
          icon: "warning",
          title: "Estoque disponível insuficiente",
          text: `${lista}\n\nO disponível já desconta o que está reservado para outras coletas. Agendar mesmo assim? Lembre de repor o estoque até a data.`,
          showCancelButton: true,
          confirmButtonText: "Agendar mesmo assim",
          cancelButtonText: "Voltar",
          confirmButtonColor: "#d97706",
          reverseButtons: true,
        });
        if (resposta.isConfirmed) return handleSalvar(true);
        return;
      }

      const mensagem = mensagemErroApi(e, "Não foi possível salvar o agendamento. Tente novamente.");
      setErro(mensagem);

      Swal.fire({
        icon: "error",
        title: "Erro ao criar agendamento!",
        text: mensagem,
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setEnviando(false);
    }
  }

  // turnos com vaga no dia escolhido (das opções que o backend calculou)
  const opcoes = sugestoes?.opcoes ?? [];
  const opcoesDoDia = opcoes.filter((o) => o.data === dataColeta);
  const ultimaOpcao = opcoes.length ? opcoes[opcoes.length - 1].data : "";
  const semVagaNoDia = Boolean(dataColeta && ultimaOpcao && dataColeta <= ultimaOpcao && opcoesDoDia.length === 0);
  const sugeridasTurnos = sugestoes?.sugeridas_turnos ?? [];

  const campo =
    "adm-campo min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base focus:border-blue-500 focus:outline-none disabled:bg-gray-50 sm:text-sm";
  const rotulo = "mb-1.5 block text-xs font-semibold text-gray-600";
  const passoFeito = (ok: boolean, n: number) => (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${ok ? "bg-green-600" : "bg-blue-700"}`}
      aria-hidden="true"
    >
      {ok ? "✓" : n}
    </span>
  );
  const acimaDoDisponivel = itens.filter((item) => {
    const noEstoque = insumoPorId(item.ins_id);
    return noEstoque && item.quantidade > noEstoque.ins_disponivel;
  }).length;
  const dataExtenso = dataColeta
    ? new Date(`${dataColeta}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/60 sm:px-4 sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-novo-agendamento"
        className="adm-novo-agendamento w-full max-w-5xl bg-slate-50 pb-[env(safe-area-inset-bottom)] shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:rounded-t-2xl sm:px-6">
          <div>
            <h2 id="titulo-novo-agendamento" className="text-2xl font-bold text-blue-700">Novo agendamento</h2>
            <p className="text-sm text-gray-500">Três passos: paciente, quando e onde, e os insumos. O resumo mostra o que será agendado.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            ✕ <span className="hidden sm:inline">Cancelar</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {solOrigemId && (
            <p className="mb-4 rounded-xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">
              Agendando a <strong>prescrição nº {solOrigemId}</strong>, já autorizada. Paciente e insumos vieram preenchidos.
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
            <div className="adm-cartao divide-y divide-gray-200">
              {/* 1. Paciente */}
              <section className="p-5" aria-labelledby="passo-paciente">
                <div className="mb-3 flex items-center gap-3">
                  {passoFeito(Boolean(paciente), 1)}
                  <div>
                    <h3 id="passo-paciente" className="font-bold text-gray-900">Paciente</h3>
                    <p className="text-xs text-gray-500">Busque pelo CPF</p>
                  </div>
                </div>
                {paciente ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <AvatarIniciais nome={paciente.pac_nome} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{paciente.pac_nome}</p>
                      <p className="text-xs text-gray-600">
                        CPF {exibirCPF(paciente.pac_cpf)}
                        {paciente.pac_telefone ? ` · ${exibirTelefone(paciente.pac_telefone)}` : ""}
                      </p>
                    </div>
                    <button type="button" onClick={trocarPaciente} className="min-h-10 text-sm font-semibold text-blue-700 hover:underline">
                      Trocar paciente
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <label htmlFor="paciente-agendamento" className="sr-only">Paciente</label>
                    <input
                      id="paciente-agendamento"
                      type="text"
                      value={buscaPaciente}
                      onChange={(e) => {
                        setBuscaPaciente(e.target.value);
                        setPaciente(null);
                      }}
                      placeholder="Digite o CPF do paciente"
                      autoComplete="off"
                      className={campo}
                    />
                    {resultadosPaciente.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                        {resultadosPaciente.map((p) => (
                          <li key={p.pac_id}>
                            <button
                              type="button"
                              onClick={() => selecionarPaciente(p)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50"
                            >
                              <AvatarIniciais nome={p.pac_nome} />
                              <span>
                                <span className="block font-semibold text-gray-800">{p.pac_nome}</span>
                                <span className="text-xs text-gray-500">CPF {exibirCPF(p.pac_cpf)}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>

              {/* 2. Quando e onde */}
              <section className="p-5" aria-labelledby="passo-quando">
                <div className="mb-3 flex items-center gap-3">
                  {passoFeito(Boolean(postoSelecionado && dataColeta), 2)}
                  <div>
                    <h3 id="passo-quando" className="font-bold text-gray-900">Quando e onde</h3>
                    <p className="text-xs text-gray-500">Posto, data e turno da coleta</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="posto-agendamento" className={rotulo}>Posto de coleta *</label>
                    <CampoBusca
                      id="posto-agendamento"
                      opcoes={opcoesPosto}
                      valor={postoSelecionado ? String(postoSelecionado.pos_id) : ""}
                      onEscolher={(v) => escolherPosto(Number(v))}
                      placeholder="Busque ou escolha o posto"
                      semResultado="Nenhum posto com esse nome"
                    />
                    {sugestoesPosto.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-gray-500">Sugestão:</span>
                        {sugestoesPosto.map((s) => (
                          <button
                            key={s.pos_id}
                            type="button"
                            onClick={() => escolherPosto(s.pos_id!)}
                            className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-blue-800 transition hover:-translate-y-px hover:bg-blue-100"
                          >
                            {s.posto!.pos_nome} <span className="font-normal text-blue-700">· {s.rotulo}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="data-agendamento" className={rotulo}>Data da coleta *</label>
                    <input
                      id="data-agendamento"
                      type="date"
                      value={dataColeta}
                      min={hojeISO()}
                      onChange={(e) => setDataColeta(e.target.value)}
                      className={campo}
                    />
                  </div>
                </div>
                {semVagaNoDia && (
                  <p className="mt-2 text-sm text-amber-700" role="status">
                    Sem vaga neste dia (unidade fechada, lotada ou sem atendimento). Escolha outra data.
                  </p>
                )}

                {postoSelecionado && sugeridasTurnos.length > 0 && (
                  <div className="mt-4">
                    <p className={rotulo}>Turnos com mais vagas em {postoSelecionado.pos_nome}</p>
                    <div className="flex flex-wrap gap-2">
                      {sugeridasTurnos.map((op) => {
                        const ativa = dataColeta === op.data && turno === op.turno;
                        return (
                          <button
                            key={`${op.data}-${op.turno}`}
                            type="button"
                            onClick={() => {
                              setDataColeta(op.data);
                              setTurno(op.turno);
                            }}
                            aria-pressed={ativa}
                            className={`min-h-10 rounded-full border px-4 text-sm transition ${
                              ativa ? "border-blue-700 bg-blue-700 text-white" : "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
                            }`}
                          >
                            {diaCurto(op.data)} · {ROTULO_TURNO[op.turno]} · {textoVagas(op.livres)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <fieldset className="mt-4">
                  <legend className={rotulo}>Turno</legend>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[...TURNOS, ""].map((t) => {
                      const op = t ? opcoesDoDia.find((o) => o.turno === t) : undefined;
                      const ativo = turno === t;
                      const titulo = t ? (t === "manha" ? "Manhã" : "Tarde") : "Primeiro com vaga";
                      const detalhe = t
                        ? op ? `${op.abre} às ${op.fecha} · ${textoVagas(op.livres)}` : dataColeta ? "sem vaga neste dia" : "escolha a data"
                        : "o sistema escolhe";
                      return (
                        <label
                          key={t || "primeiro"}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 ${
                            ativo ? "border-2 border-blue-700 bg-blue-50/60" : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="turno-agendamento"
                            value={t}
                            checked={ativo}
                            onChange={() => setTurno(t as Turno | "")}
                            className="adm-radio mt-1"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-gray-900">{titulo}</span>
                            <span className="block text-xs text-gray-500">{detalhe}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </section>

              {/* 3. Insumos */}
              <section className="p-5" aria-labelledby="passo-insumos">
                <div className="mb-3 flex items-center gap-3">
                  {passoFeito(itens.length > 0, 3)}
                  <div>
                    <h3 id="passo-insumos" className="font-bold text-gray-900">Insumos</h3>
                    <p className="text-xs text-gray-500">
                      Escolhidos no estoque {postoSelecionado ? `de ${postoSelecionado.pos_nome}` : "da unidade"} (o disponível já desconta o reservado)
                    </p>
                  </div>
                </div>

                {itens.length > 0 && (
                  <ul className="mb-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {itens.map((item, index) => {
                      const noEstoque = insumoPorId(item.ins_id);
                      const acima = noEstoque && item.quantidade > noEstoque.ins_disponivel;
                      return (
                        <li key={`${item.ins_id ?? item.ins_nome}-${index}`} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">{item.ins_nome}</p>
                            {!item.ins_id ? (
                              <p className="text-xs text-rose-600">Não está no estoque desta unidade</p>
                            ) : noEstoque ? (
                              <p className={`text-xs ${acima ? "text-amber-700" : "text-gray-500"}`}>
                                Disponível: {noEstoque.ins_disponivel}
                                {acima ? " · pedido maior que o disponível (você poderá confirmar ao agendar)" : ""}
                              </p>
                            ) : null}
                          </div>
                          <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-200">
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(index, -1)}
                              className="h-9 w-9 bg-slate-50 font-bold text-blue-700 hover:bg-blue-50"
                              aria-label={`Diminuir ${item.ins_nome}`}
                            >
                              −
                            </button>
                            <span className="min-w-10 text-center text-sm font-bold" aria-live="polite">{item.quantidade}</span>
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(index, 1)}
                              className="h-9 w-9 bg-slate-50 font-bold text-blue-700 hover:bg-blue-50"
                              aria-label={`Aumentar ${item.ins_nome}`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removerItem(index)}
                            className="min-h-9 rounded-lg px-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                          >
                            Remover
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_130px_auto]">
                  <div>
                    <label htmlFor="insumo-agendamento" className="sr-only">Insumo</label>
                    <CampoBusca
                      id="insumo-agendamento"
                      opcoes={opcoesInsumo}
                      valor={insumoEscolhido}
                      onEscolher={setInsumoEscolhido}
                      disabled={!postoSelecionado || carregandoEstoque || !estoque.length}
                      placeholder={
                        !postoSelecionado
                          ? "Escolha o posto primeiro"
                          : carregandoEstoque
                            ? "Carregando estoque…"
                            : estoque.length
                              ? itens.length ? "Buscar outro insumo do estoque…" : "Busque ou escolha o insumo"
                              : "Nenhum insumo nesta unidade"
                      }
                      semResultado="Nenhum insumo com esse nome nesta unidade"
                    />
                  </div>
                  <div>
                    <label htmlFor="quantidade-agendamento" className="sr-only">Quantidade</label>
                    <input
                      id="quantidade-agendamento"
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="Quantidade"
                      className={campo}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={adicionarItem}
                    className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-blue-300 bg-white px-4 text-sm font-bold text-blue-700 hover:bg-blue-50"
                  >
                    + Adicionar
                  </button>
                </div>
              </section>
            </div>

            {/* Resumo */}
            <aside className="adm-cartao h-fit p-5 lg:sticky lg:top-6" aria-label="Resumo do agendamento">
              <h3 className="mb-1 font-bold text-gray-900">Resumo</h3>
              <dl className="divide-y divide-gray-100 text-sm">
                <div className="py-2.5">
                  <dt className="text-xs text-gray-500">Paciente</dt>
                  <dd className="font-semibold text-gray-900">{paciente?.pac_nome ?? <span className="font-normal text-gray-400">não escolhido</span>}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-gray-500">Posto</dt>
                  <dd className="font-semibold text-gray-900">
                    {postoSelecionado?.pos_nome ?? <span className="font-normal text-gray-400">não escolhido</span>}
                    {postoSelecionado?.pos_endereco && <span className="block text-xs font-normal text-gray-500">{postoSelecionado.pos_endereco}</span>}
                  </dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-gray-500">Data e turno</dt>
                  <dd className="font-semibold text-gray-900 first-letter:uppercase">
                    {dataColeta ? `${dataExtenso} · ${turno ? ROTULO_TURNO[turno] : "primeiro turno com vaga"}` : <span className="font-normal text-gray-400">não escolhida</span>}
                  </dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-gray-500">Insumos ({itens.length})</dt>
                  <dd className="font-semibold text-gray-900">
                    {itens.length ? itens.map((i) => <span key={`${i.ins_id ?? i.ins_nome}`} className="block">{i.quantidade}x {i.ins_nome}</span>) : <span className="font-normal text-gray-400">nenhum</span>}
                  </dd>
                </div>
              </dl>

              {acimaDoDisponivel > 0 && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {acimaDoDisponivel === 1 ? "1 insumo acima" : `${acimaDoDisponivel} insumos acima`} do disponível. Lembre de repor o estoque até a data.
                </p>
              )}

              {erro && <p className="mt-3 text-sm text-rose-600" role="alert">{erro}</p>}

              <button
                type="button"
                onClick={() => handleSalvar()}
                disabled={enviando}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#001ed3] via-[#0042ec] to-[#0192fe] px-4 text-base font-bold text-white shadow-[0_6px_16px_rgba(0,66,236,0.25)] hover:brightness-110 disabled:opacity-60 [font-family:var(--fonte-botao)]"
              >
                {enviando ? "Salvando…" : "Agendar coleta"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 min-h-11 w-full rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <p className="mt-2 text-center text-xs text-gray-500">O protocolo aparece assim que o agendamento é criado.</p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
