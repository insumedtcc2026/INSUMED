import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { buscarPacientesPorCpf } from "../../../services/PacientesServices";
import { criarAgendamento } from "../../../services/AgendamentoService";
import type { Paciente, ItemNovoAgendamento, Posto } from "../../../types/agendamento";
import { exibirCPF, hojeISO, mensagemErroApi } from "../../../utils/validacoes";

import { buscarDatasSugeridas, type DatasSugeridas } from "../../../services/PainelService";

const API_URL = "https://backend-insumed-lhac.vercel.app";

// "2026-10-15" -> "qua, 15/10"
function formatarDiaCurto(data: string) {
  const [a, m, d] = data.split("-").map(Number);
  const semana = new Date(a, m - 1, d).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return `${semana}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

interface NovoAgendamentoModalProps {
  onClose: () => void;
  onSuccess: () => void;
  cpfInicial?: string;
    insumoInicial?: string;
  quantidadeInicial?: number;
  // prescrição autorizada que originou este agendamento ("Agendar" na lista
  // de solicitações). O backend impede um segundo agendamento ativo para ela.
  solOrigemId?: number;
}

/**
 * Página 1: "Novo Agendamento" (cadastro). Renderizada como modal.
 *
 * Suporta MÚLTIPLOS insumos por agendamento. O produto NÃO é buscado num
 * catálogo existente — o admin digita o nome do produto direto (não há
 * seleção de um item já cadastrado). O backend decide, ao salvar, se
 * reaproveita um insumo já existente com esse nome ou cria um novo.
 */
export default function NovoAgendamentoModal({ onClose, onSuccess,   cpfInicial = "",  insumoInicial = "",
  quantidadeInicial = 0, solOrigemId }: NovoAgendamentoModalProps) {
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

  if (insumoInicial) {
    setNomeProduto(insumoInicial);
  }

  if (quantidadeInicial > 0) {
    setQuantidade(String(quantidadeInicial));
  }
}, [cpfInicial, insumoInicial, quantidadeInicial]);

  // --- produto sendo adicionado no momento (digitado, não buscado) ---
  const [nomeProduto, setNomeProduto] = useState("");
  const [quantidade, setQuantidade] = useState("");

  // --- lista de itens já adicionados ao agendamento ---
  const [itens, setItens] = useState<ItemNovoAgendamento[]>([]);

  // --- data da coleta ---
  const [dataColeta, setDataColeta] = useState("");

  // --- posto de coleta ---
  const [postos, setPostos] = useState<Posto[]>([]);
  const [postoSelecionado, setPostoSelecionado] = useState<Posto | null>(null);

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
        if (res.data.length === 1) setPostoSelecionado(res.data[0]);
      })
      .catch(() => setErro("Não foi possível carregar os postos de coleta."));
  }, []);

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
  if (insumoInicial && quantidadeInicial > 0) {
    setItens([
      {
        ins_nome: insumoInicial,
        quantidade: quantidadeInicial,
      },
    ]);
  }
}, [insumoInicial, quantidadeInicial]);
  function selecionarPaciente(p: Paciente) {
    setPaciente(p);
    setBuscaPaciente(`${p.pac_nome} — ${exibirCPF(p.pac_cpf)}`);
    setResultadosPaciente([]);
  }

  function adicionarItem() {
    setErro(null);
    const nome = nomeProduto.trim();
    if (!nome) {
      setErro("Informe o nome do produto antes de adicionar.");
      return;
    }
    const qtd = Number(quantidade);
    if (!Number.isInteger(qtd) || qtd <= 0) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }
    setItens((prev) => [...prev, { ins_nome: nome, quantidade: qtd }]);
    setNomeProduto("");
    setQuantidade("");
  }

  function removerItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSalvar() {
    setErro(null);
    if (!paciente) return setErro("Selecione um paciente.");
    if (itens.length === 0) return setErro("Adicione ao menos um produto.");
    if (!dataColeta) return setErro("Informe a data da coleta.");
    if (dataColeta < hojeISO()) return setErro("A data da coleta não pode estar no passado.");
    if (!postoSelecionado) return setErro("Selecione o posto de coleta.");
    if (enviando) return;

    setEnviando(true);
    try {
      const resultado = await criarAgendamento({
        paciente,
        sol_data_de_coleta: dataColeta,
        posto: postoSelecionado,
        itens,
        ...(solOrigemId ? { sol_origem_id: solOrigemId } : {}),
      });

      Swal.fire({
        icon: "success",
        title: "Agendamento criado com sucesso!",
        text: `Protocolo: ${resultado.sol_protocolo}`,
        confirmButtonColor: "#00ce11",
      });

      onSuccess?.();
    } catch (e) {
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

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/70 sm:items-center sm:px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-novo-agendamento"
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">
            +
          </span>
          <h2 id="titulo-novo-agendamento" className="text-lg font-semibold text-gray-800">Novo Agendamento</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Paciente */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-600">Paciente *</label>
            <input
              type="text"
              value={buscaPaciente}
              onChange={(e) => {
                setBuscaPaciente(e.target.value);
                setPaciente(null);
              }}
              placeholder="Busque por CPF"
              className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none sm:text-sm"
            />
            {resultadosPaciente.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                {resultadosPaciente.map((p) => (
                  <li
                    key={p.pac_id}
                    onClick={() => selecionarPaciente(p)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50"
                  >
                    {p.pac_nome} — {exibirCPF(p.pac_cpf)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Data da coleta */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Data da Coleta *</label>
            <input
              type="date"
              value={dataColeta}
              min={hojeISO()}
              aria-label="Data da coleta"
              onChange={(e) => setDataColeta(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Posto de coleta */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Posto de Coleta *</label>
            <select
              value={postoSelecionado?.pos_id ?? ""}
              onChange={(e) => {
                const posto = postos.find((p) => p.pos_id === Number(e.target.value)) ?? null;
                setPostoSelecionado(posto);
              }}
              className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none sm:text-sm"
            >
              <option value="" disabled>
                Selecione o posto
              </option>
              {postos.map((posto) => (
                <option key={posto.pos_id} value={posto.pos_id}>
                  {posto.pos_nome}
                </option>
              ))}
            </select>
          </div>

          {/* Datas sugeridas: dias úteis com menos coletas no posto escolhido */}
          {postoSelecionado && sugestoes && sugestoes.sugeridas.length > 0 && (
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Datas com menos coletas em {postoSelecionado.pos_nome}
              </p>
              <div className="flex flex-wrap gap-2">
                {sugestoes.sugeridas.map((data) => {
                  const qtd = sugestoes.datas.find((d) => d.data === data)?.agendados ?? 0;
                  const ativa = dataColeta === data;
                  return (
                    <button
                      key={data}
                      type="button"
                      onClick={() => setDataColeta(data)}
                      aria-pressed={ativa}
                      className={`min-h-11 rounded-full border px-4 text-sm transition ${
                        ativa
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                      }`}
                    >
                      {formatarDiaCurto(data)} ·{" "}
                      {qtd === 0 ? "livre" : `${qtd} ${qtd === 1 ? "coleta" : "coletas"}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Produto (digitado, não buscado) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Insumo *</label>
            <input
              type="text"
              value={nomeProduto}
              readOnly
              onChange={(e) => setNomeProduto(e.target.value)}
              placeholder="Digite o nome do produto"
              className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Quantidade + adicionar */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Quantidade *</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Insira a quantidade"
                className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none sm:text-sm"
              />
              <button
                type="button"
                onClick={adicionarItem}
                className="whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de itens adicionados (permite múltiplos insumos por agendamento) */}
        {itens.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {itens.map((item, index) => (
              <li
                key={`${item.ins_nome}-${index}`}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
              >
                <span>
                  {item.quantidade}x {item.ins_nome}
                </span>
                <button
                  type="button"
                  onClick={() => removerItem(index)}
                  className="text-rose-500 hover:text-rose-600"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}

        {erro && <p className="mt-4 text-sm text-rose-500" role="alert">{erro}</p>}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ✕ Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={enviando}
            className="min-h-11 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {enviando ? "Salvando…" : " Agendar"}
          </button>
        </div>
      </div>
    </div>
  );
}