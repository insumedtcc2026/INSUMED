import { useState, useEffect, useRef } from "react";
import { buscarPacientesPorCpf } from "../../../services/PacientesServices";
import { buscarInsumos } from "../../../services/InsumosServices";
import { criarAgendamento } from "../../../services/AgendamentoService";
import type { Paciente, InsumoCatalogo, InsumoAgendado } from "../../../types/agendamento";
 
interface NovoAgendamentoModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}
 
/**
 * Página 1: "Novo Agendamento" (cadastro). Renderizada como modal.
 *
 * Suporta MÚLTIPLOS insumos por agendamento: o usuário busca um produto,
 * define a quantidade, clica em "Adicionar" e ele entra numa lista. O
 * agendamento só pode ser salvo com pelo menos 1 item na lista.
 */
export default function NovoAgendamentoModal({ onClose, onSuccess }: NovoAgendamentoModalProps) {
  // --- paciente ---
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [resultadosPaciente, setResultadosPaciente] = useState<Paciente[]>([]);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
 
  // --- produto (insumo) sendo adicionado no momento ---
  const [buscaProduto, setBuscaProduto] = useState("");
  const [resultadosProduto, setResultadosProduto] = useState<InsumoCatalogo[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<InsumoCatalogo | null>(null);
  const [quantidade, setQuantidade] = useState("");
 
  // --- lista de itens já adicionados ao agendamento ---
  const [itens, setItens] = useState<InsumoAgendado[]>([]);
 
  // --- data da coleta ---
  const [dataColeta, setDataColeta] = useState("");
 
  // --- envio ---
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
 
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 
  // Busca de paciente por CPF (debounced)
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
 
  // Busca de produto por nome/código (debounced)
  useEffect(() => {
    if (!buscaProduto || produtoSelecionado) {
      setResultadosProduto([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await buscarInsumos(buscaProduto);
      setResultadosProduto(res);
    }, 250);
    return () => clearTimeout(t);
  }, [buscaProduto, produtoSelecionado]);
 
  function selecionarPaciente(p: Paciente) {
    setPaciente(p);
    setBuscaPaciente(`${p.pac_nome} — ${p.pac_cpf}`);
    setResultadosPaciente([]);
  }
 
  function selecionarProduto(p: InsumoCatalogo) {
    setProdutoSelecionado(p);
    setBuscaProduto(p.ins_nome);
    setResultadosProduto([]);
  }
 
  function adicionarItem() {
    setErro(null);
    if (!produtoSelecionado) {
      setErro("Selecione um produto antes de adicionar.");
      return;
    }
    const qtd = Number(quantidade);
    if (!qtd || qtd <= 0) {
      setErro("Informe uma quantidade válida.");
      return;
    }
    setItens((prev) => [
      ...prev,
      { ins_id: produtoSelecionado.ins_id, ins_nome: produtoSelecionado.ins_nome, quantidade: qtd },
    ]);
    setProdutoSelecionado(null);
    setBuscaProduto("");
    setQuantidade("");
  }
 
  function removerItem(ins_id: number) {
    setItens((prev) => prev.filter((i) => i.ins_id !== ins_id));
  }
 
  async function handleSalvar() {
    setErro(null);
    if (!paciente) return setErro("Selecione um paciente.");
    if (itens.length === 0) return setErro("Adicione ao menos um produto.");
    if (!dataColeta) return setErro("Informe a data da coleta.");
 
    setEnviando(true);
    try {
      await criarAgendamento({
        paciente,
        sol_data_de_coleta: dataColeta,
        itens,
      });
      onSuccess?.();
    } catch {
      setErro("Não foi possível salvar o agendamento. Tente novamente.");
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
 
          {/* Produto */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-600">Produto(s) *</label>
            <input
              type="text"
              value={buscaProduto}
              onChange={(e) => {
                setBuscaProduto(e.target.value);
                setProdutoSelecionado(null);
              }}
              placeholder="Busque por nome ou código"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            />
            {resultadosProduto.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                {resultadosProduto.map((p) => (
                  <li
                    key={p.ins_id}
                    onClick={() => selecionarProduto(p)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50"
                  >
                    {p.ins_nome}
                  </li>
                ))}
              </ul>
            )}
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
            {itens.map((item) => (
              <li
                key={item.ins_id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
              >
                <span>
                  {item.quantidade}x {item.ins_nome}
                </span>
                <button
                  type="button"
                  onClick={() => removerItem(item.ins_id)}
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
 