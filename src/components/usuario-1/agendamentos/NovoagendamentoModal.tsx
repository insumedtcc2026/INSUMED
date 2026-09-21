import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { buscarPacientesPorCpf } from "../../../services/PacientesServices";
import { criarAgendamento } from "../../../services/AgendamentoService";
import type { Paciente, ItemNovoAgendamento, Posto } from "../../../types/agendamento";

const API_URL = "https://backend-insumed-lhac.vercel.app";

interface NovoAgendamentoModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Página 1: "Novo Agendamento" (cadastro). Renderizada como modal.
 *
 * Suporta MÚLTIPLOS insumos por agendamento. O produto NÃO é buscado num
 * catálogo existente — o admin digita o nome do produto direto (não há
 * seleção de um item já cadastrado). O backend decide, ao salvar, se
 * reaproveita um insumo já existente com esse nome ou cria um novo.
 */
export default function NovoAgendamentoModal({ onClose, onSuccess }: NovoAgendamentoModalProps) {
  // --- paciente ---
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [resultadosPaciente, setResultadosPaciente] = useState<Paciente[]>([]);
  const [paciente, setPaciente] = useState<Paciente | null>(null);

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

  function selecionarPaciente(p: Paciente) {
    setPaciente(p);
    setBuscaPaciente(`${p.pac_nome} — ${p.pac_cpf}`);
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
    if (!qtd || qtd <= 0) {
      setErro("Informe uma quantidade válida.");
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
    if (!postoSelecionado) return setErro("Selecione o posto de coleta.");

    setEnviando(true);
    try {
      const resultado = await criarAgendamento({
        paciente,
        sol_data_de_coleta: dataColeta,
        posto: postoSelecionado,
        itens,
      });

      Swal.fire({
        icon: "success",
        title: "Agendamento criado com sucesso!",
        text: `Protocolo: ${resultado.sol_protocolo}`,
        confirmButtonColor: "#00ce11",
      });

      onSuccess?.();
    } catch {
      setErro("Não foi possível salvar o agendamento. Tente novamente.");

      Swal.fire({
        icon: "error",
        title: "Erro ao criar agendamento!",
        text: "Não foi possível salvar o agendamento.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">
            +
          </span>
          <h2 className="text-lg font-semibold text-gray-800">Novo Agendamento</h2>
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
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
            {resultadosPaciente.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                {resultadosPaciente.map((p) => (
                  <li
                    key={p.pac_id}
                    onClick={() => selecionarPaciente(p)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50"
                  >
                    {p.pac_nome} — {p.pac_cpf}
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
              onChange={(e) => setDataColeta(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
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
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
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

          {/* Produto (digitado, não buscado) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Produto *</label>
            <input
              type="text"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              placeholder="Digite o nome do produto"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
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

        {erro && <p className="mt-4 text-sm text-rose-500">{erro}</p>}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ✕ Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={enviando}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {enviando ? "Salvando…" : " Agendar"}
          </button>
        </div>
      </div>
    </div>
  );
}