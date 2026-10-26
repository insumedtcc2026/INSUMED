import { useState } from "react";
import { declararPrioridade } from "../../../services/AgendaService";
import { mensagemErroApi } from "../../../utils/validacoes";

interface Dados {
  pac_pcd?: boolean;
  pac_gestante?: boolean;
  pac_prioridade_conferida?: boolean | null;
}

const lerUsuario = (): Dados => {
  try {
    return JSON.parse(localStorage.getItem("usuario_paciente") ?? "{}");
  } catch {
    return {};
  }
};

/**
 * Atendimento prioritário (Lei 10.048/2000): o paciente informa se é pessoa
 * com deficiência ou gestante e a unidade confere no atendimento. Quem tem
 * 60 anos ou mais já entra na prioridade pela data de nascimento.
 */
export default function DeclaracaoPrioridade() {
  const [dados, setDados] = useState<Dados>(lerUsuario);
  const [pcd, setPcd] = useState(Boolean(dados.pac_pcd));
  const [gestante, setGestante] = useState(Boolean(dados.pac_gestante));
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tom: "ok" | "erro"; texto: string } | null>(null);

  const mudou = pcd !== Boolean(dados.pac_pcd) || gestante !== Boolean(dados.pac_gestante);
  const declarado = Boolean(dados.pac_pcd || dados.pac_gestante);

  async function salvar() {
    setSalvando(true);
    setMensagem(null);
    try {
      const r = await declararPrioridade(pcd, gestante);
      const atualizado = { ...lerUsuario(), ...r.usuario };
      localStorage.setItem("usuario_paciente", JSON.stringify(atualizado));
      setDados(atualizado);
      setMensagem({ tom: "ok", texto: r.mensagem });
    } catch (e) {
      setMensagem({ tom: "erro", texto: mensagemErroApi(e, "Não foi possível salvar.") });
    } finally {
      setSalvando(false);
    }
  }

  let situacao: { texto: string; classe: string } | null = null;
  if (declarado && dados.pac_prioridade_conferida === true) {
    situacao = { texto: "Confirmada pela unidade. Suas prescrições entram com prioridade na fila.", classe: "bg-emerald-50 text-emerald-900" };
  } else if (declarado && dados.pac_prioridade_conferida === false) {
    situacao = { texto: "A unidade não confirmou a informação. Fale com a unidade se houver engano.", classe: "bg-rose-50 text-rose-900" };
  } else if (declarado) {
    situacao = { texto: "Aguardando conferência. Leve o laudo ou o cartão da gestante no próximo atendimento.", classe: "bg-amber-50 text-amber-900" };
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6" aria-labelledby="titulo-prioridade">
      <div>
        <h2 id="titulo-prioridade" className="text-lg font-semibold text-gray-900">Atendimento prioritário</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pessoas com deficiência e gestantes têm prioridade na análise das prescrições. Quem tem 60 anos ou mais já tem
          prioridade pela data de nascimento.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex min-h-11 !flex-row items-center gap-3 text-base text-gray-800">
            <input type="checkbox" checked={pcd} onChange={(e) => setPcd(e.target.checked)} className="!mr-1 !h-5 !w-5 shrink-0 accent-blue-700" />
            Sou pessoa com deficiência
          </label>
          <label className="flex min-h-11 !flex-row items-center gap-3 text-base text-gray-800">
            <input type="checkbox" checked={gestante} onChange={(e) => setGestante(e.target.checked)} className="!mr-1 !h-5 !w-5 shrink-0 accent-blue-700" />
            Estou gestante
          </label>
        </div>

        {situacao && !mudou && <p className={`mt-3 rounded-xl px-4 py-3 text-sm ${situacao.classe}`}>{situacao.texto}</p>}
        {mensagem && (
          <p className={`mt-3 text-sm ${mensagem.tom === "ok" ? "text-emerald-700" : "text-rose-700"}`} role={mensagem.tom === "erro" ? "alert" : "status"}>
            {mensagem.texto}
          </p>
        )}

        {mudou && (
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="botao-novo-agendamento mt-4 disabled:opacity-50"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        )}
      </div>
    </section>
  );
}
