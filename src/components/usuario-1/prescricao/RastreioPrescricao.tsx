import { Link } from "react-router-dom";
import type { MinhaPrescricao } from "../../../services/PrescricaoService";
import { formatarData } from "../../../utils/status";
import { montarEtapas, type Estado } from "../../../utils/etapasPrescricao";

const BOLINHA: Record<Estado, string> = {
  feito: "bg-green-600 border-green-600 text-white",
  atual: "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100",
  pendente: "bg-white border-gray-300 text-gray-300",
  atencao: "bg-amber-500 border-amber-500 text-white",
  erro: "bg-red-600 border-red-600 text-white",
};

const SIMBOLO: Record<Estado, string> = { feito: "✓", atual: "•", pendente: "", atencao: "!", erro: "×" };

const COR_RESUMO: Record<Estado, string> = {
  feito: "bg-green-50 text-green-800",
  atual: "bg-blue-50 text-blue-800",
  pendente: "bg-gray-50 text-gray-700",
  atencao: "bg-amber-50 text-amber-900",
  erro: "bg-red-50 text-red-800",
};

const ROTULO_ESTADO: Record<Estado, string> = {
  feito: "concluída", atual: "em andamento", pendente: "a seguir", atencao: "precisa de atenção", erro: "encerrada",
};

/** Rastreio da prescrição em etapas, no estilo do acompanhamento de entregas. */
export default function RastreioPrescricao({ prescricao, onReenviar }: { prescricao: MinhaPrescricao; onReenviar?: () => void }) {
  const { etapas, resumo, tom } = montarEtapas(prescricao, onReenviar);
  const feitas = etapas.filter((e) => e.estado === "feito").length;
  const progresso = Math.round((feitas / etapas.length) * 100);

  return (
    <div>
      <p className={`rounded-xl px-4 py-3 font-semibold ${COR_RESUMO[tom]}`} role="status">{resumo}</p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        <div
          className={`h-full rounded-full ${tom === "erro" ? "bg-red-500" : tom === "atencao" ? "bg-amber-500" : "bg-green-600"}`}
          style={{ width: `${progresso}%` }}
        />
      </div>

      <ol className="mt-5" aria-label="Etapas da prescrição">
        {etapas.map((e, i) => (
          <li key={e.titulo} className="relative flex gap-4 pb-5 last:pb-0">
            {i < etapas.length - 1 && (
              <span
                className={`absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-0.5 ${e.estado === "feito" ? "bg-green-600" : "bg-gray-200"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${BOLINHA[e.estado]}`}
              aria-hidden="true"
            >
              {SIMBOLO[e.estado]}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`font-medium ${e.estado === "pendente" ? "text-gray-400" : "text-gray-900"}`}>
                {e.titulo}
                <span className="sr-only"> ({ROTULO_ESTADO[e.estado]})</span>
              </p>
              {e.data && <p className="text-xs text-gray-500">{e.data}</p>}
              {e.descricao && <p className="mt-0.5 break-words text-sm text-gray-600">{e.descricao}</p>}
              {e.acao?.para && (
                <Link to={e.acao.para} className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-blue-700 hover:underline">
                  {e.acao.texto} →
                </Link>
              )}
              {e.acao?.onClick && (
                <button type="button" onClick={e.acao.onClick} className="botao-novo-agendamento mt-2">
                  {e.acao.texto}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {prescricao.sol_periodicidade_dias ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950" role="note">
          <p className="font-semibold">Uso contínuo: uma retirada a cada {prescricao.sol_periodicidade_dias} dias</p>
          <p className="mt-1">
            {prescricao.retiradas_concluidas
              ? `${prescricao.retiradas_concluidas} ${prescricao.retiradas_concluidas === 1 ? "retirada feita" : "retiradas feitas"}. `
              : ""}
            {prescricao.proxima_retirada
              ? `Próxima retirada prevista para ${formatarData(prescricao.proxima_retirada)}. A unidade agenda e você recebe o aviso.`
              : prescricao.sol_data_vencimento
                ? `Vale até ${formatarData(prescricao.sol_data_vencimento)}, sem precisar enviar outra prescrição.`
                : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
