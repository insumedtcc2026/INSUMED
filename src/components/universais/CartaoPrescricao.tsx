import type { ReactNode } from "react";
import { exibirCPF } from "../../utils/validacoes";
import { CLASSE_SELO, CLASSES_TOM, infoStatus } from "../../utils/status";

// Status da prescrição na pílula padrão do site (fundo claro, texto colorido);
// rótulos da visão da equipe; as cores vêm do tom padrão (utils/status.ts)
const ROTULO_STATUS: Record<string, string> = {
  Pendente: "Pendente",
  Reenvio: "Reenvio",
  Revisado: "Revisado",
  Aprovado: "Revisado",
  Autorizado: "Autorizado",
  "Nao Autorizado": "Não autorizado",
};

export function SeloPrescricao({ status, rotulo }: { status: string; rotulo?: string }) {
  return (
    <span className={`${CLASSE_SELO} ${CLASSES_TOM[infoStatus(status).tom]}`}>
      {rotulo ?? ROTULO_STATUS[status] ?? status}
    </span>
  );
}

interface Props {
  pac_nome: string;
  pac_cpf: string;
  codigo: number | string;
  // bloco do meio: título + linhas (ex.: "Informações", ["Enviada em 13/10"])
  tituloInfo?: string;
  linhasInfo?: (string | null | undefined | false)[];
  status: string;
  rotuloStatus?: string;
  acaoTexto: string;
  onAcao: () => void;
  // conteúdo extra embaixo (ex.: motivo)
  rodape?: ReactNode;
}

/**
 * Card de prescrição no mesmo padrão do card de agendamento do admin:
 * avatar + paciente, bloco de informações, status e ação à direita.
 */
export default function CartaoPrescricao({
  pac_nome, pac_cpf, codigo, tituloInfo = "Informações", linhasInfo = [],
  status, rotuloStatus, acaoTexto, onAcao, rodape,
}: Props) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-gray-50 px-4 py-4 shadow-sm sm:px-6 md:flex-row md:flex-wrap md:items-center">
      {/* Avatar + paciente */}
      <div className="flex min-w-0 flex-1 items-start gap-3 md:items-center">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="break-words font-semibold text-gray-800">{pac_nome}</p>
          <p className="text-sm text-gray-500">CPF: {exibirCPF(pac_cpf)}</p>
          <p className="text-sm text-gray-500">Código: {codigo}</p>
        </div>
      </div>

      {/* Informações */}
      <div className="min-w-0 flex-1 md:min-w-[200px]">
        <p className="text-sm font-medium text-gray-400">{tituloInfo}</p>
        {linhasInfo.filter(Boolean).map((linha, i) => (
          <p key={i} className="break-words text-gray-700">{linha}</p>
        ))}
      </div>

      {/* Status + ação */}
      <div className="flex flex-wrap items-center gap-3">
        <SeloPrescricao status={status} rotulo={rotuloStatus} />
        <button
          type="button"
          onClick={onAcao}
          className="botao-novo-agendamento flex-1 sm:flex-none"
        >
          {acaoTexto}
        </button>
      </div>

      {rodape && <div className="w-full basis-full">{rodape}</div>}
    </article>
  );
}
