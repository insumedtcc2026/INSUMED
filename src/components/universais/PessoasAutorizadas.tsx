import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Pencil, Trash2, UserPlus, UsersRound } from "lucide-react";
import {
  listarAutorizados,
  removerAutorizado,
  salvarAutorizado,
  type DadosPessoaAutorizada,
  type PessoaAutorizada,
} from "../../services/AgendaService";
import { exibirTelefone, mascaraCPF, mascaraTelefone, mensagemErroApi, validarCPF, validarNome } from "../../utils/validacoes";

const VAZIO: DadosPessoaAutorizada = { nome: "", cpf: "", parentesco: "", telefone: "" };

/**
 * Ficha do paciente: quem pode retirar os insumos no lugar dele (familiar,
 * cuidador). No balcão, o admin escolhe a pessoa ao concluir a coleta e
 * confere o documento com foto.
 */
export default function PessoasAutorizadas({ pac_id }: { pac_id: number }) {
  const [lista, setLista] = useState<PessoaAutorizada[] | null>(null);
  const [podeEditar, setPodeEditar] = useState(false);
  const [limite, setLimite] = useState(5);
  const [erro, setErro] = useState<string | null>(null);
  // formulário aberto: null = fechado; pau_id 0 = nova pessoa
  const [editando, setEditando] = useState<{ pau_id: number; dados: DadosPessoaAutorizada } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const carregar = useCallback(() => {
    return listarAutorizados(pac_id)
      .then((r) => {
        setLista(r.autorizados);
        setPodeEditar(r.pode_editar);
        setLimite(r.limite);
        setErro(null);
      })
      .catch((e) => setErro(mensagemErroApi(e, "Não foi possível carregar as pessoas autorizadas.")));
  }, [pac_id]);

  useEffect(() => {
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [carregar]);

  function campo(nome: keyof DadosPessoaAutorizada, valor: string) {
    setEditando((e) => (e ? { ...e, dados: { ...e.dados, [nome]: valor } } : e));
  }

  async function salvar() {
    if (!editando) return;
    const { dados } = editando;
    const problema = validarNome(dados.nome) || validarCPF(dados.cpf);
    if (problema) return setErroForm(problema);
    setErroForm(null);
    setSalvando(true);
    try {
      await salvarAutorizado(pac_id, dados, editando.pau_id || undefined);
      setEditando(null);
      await carregar();
    } catch (e) {
      setErroForm(mensagemErroApi(e, "Não foi possível salvar."));
    } finally {
      setSalvando(false);
    }
  }

  async function remover(p: PessoaAutorizada) {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Remover autorização?",
      text: `${p.pau_nome} não poderá mais retirar os insumos por este paciente. As retiradas já feitas continuam no histórico.`,
      showCancelButton: true,
      confirmButtonText: "Remover",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });
    if (!ok.isConfirmed) return;
    try {
      await removerAutorizado(pac_id, p.pau_id);
      await carregar();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Não foi possível remover", text: mensagemErroApi(e, "Tente novamente."), confirmButtonColor: "#d33" });
    }
  }

  const entrada = "mt-1 min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-base focus:border-blue-400 focus:outline-none sm:text-sm";

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="autorizados-titulo">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="autorizados-titulo" className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <UsersRound aria-hidden="true" className="h-5 w-5 text-blue-700" /> Quem pode retirar pelo paciente
        </h2>
        {podeEditar && !editando && (lista?.length ?? 0) < limite && (
          <button
            type="button"
            onClick={() => { setEditando({ pau_id: 0, dados: VAZIO }); setErroForm(null); }}
            className="flex min-h-10 items-center gap-2 rounded-full border border-blue-700 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <UserPlus aria-hidden="true" className="h-4 w-4" /> Adicionar pessoa
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Familiar ou cuidador que busca os insumos quando o paciente não pode ir. No balcão, confira o documento com foto.
      </p>

      {erro && <p className="mt-3 text-sm text-rose-600" role="alert">{erro}</p>}
      {!lista && !erro && <p className="mt-3 text-sm text-gray-400" role="status">Carregando…</p>}
      {lista && lista.length === 0 && !editando && (
        <p className="mt-3 text-sm text-gray-500">Nenhuma pessoa autorizada. Só o próprio paciente retira.</p>
      )}

      {lista && lista.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-100">
          {lista.map((p) => (
            <li key={p.pau_id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">
                  {p.pau_nome}
                  {p.pau_parentesco && <span className="font-normal text-gray-500"> · {p.pau_parentesco}</span>}
                </p>
                <p className="text-sm text-gray-500">
                  CPF {p.pau_cpf}
                  {p.pau_telefone ? ` · ${exibirTelefone(p.pau_telefone)}` : ""}
                </p>
              </div>
              {podeEditar && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Editar ${p.pau_nome}`}
                    onClick={() => {
                      setEditando({
                        pau_id: p.pau_id,
                        dados: { nome: p.pau_nome, cpf: p.pau_cpf, parentesco: p.pau_parentesco ?? "", telefone: p.pau_telefone ?? "" },
                      });
                      setErroForm(null);
                    }}
                    className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${p.pau_nome}`}
                    onClick={() => remover(p)}
                    className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="mb-3 font-semibold text-gray-800">{editando.pau_id ? "Editar pessoa" : "Nova pessoa autorizada"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Nome completo *
              <input className={entrada} value={editando.dados.nome} maxLength={100} onChange={(e) => campo("nome", e.target.value)} />
            </label>
            <label className="text-sm font-medium text-gray-700">
              CPF *
              <input className={entrada} value={editando.dados.cpf} inputMode="numeric" placeholder="000.000.000-00"
                onChange={(e) => campo("cpf", mascaraCPF(e.target.value))} />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Parentesco ou vínculo
              <input className={entrada} value={editando.dados.parentesco} maxLength={40} placeholder="Ex.: filha, cuidador"
                onChange={(e) => campo("parentesco", e.target.value)} />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Telefone
              <input className={entrada} value={editando.dados.telefone} inputMode="tel" placeholder="(00) 00000-0000"
                onChange={(e) => campo("telefone", mascaraTelefone(e.target.value))} />
            </label>
          </div>
          {erroForm && <p className="mt-3 text-sm text-rose-600" role="alert">{erroForm}</p>}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setEditando(null)}
              className="min-h-11 rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="button" onClick={salvar} disabled={salvando}
              className="min-h-11 rounded-full bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {lista && !podeEditar && (
        <p className="mt-3 text-xs text-gray-500">Só a unidade onde o paciente é atendido pode alterar esta lista.</p>
      )}
    </section>
  );
}
