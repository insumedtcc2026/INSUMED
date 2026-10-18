import { useState } from "react";
import StatusBadge from "./StatusBadge";
import MotivoCancelamento from "./MotivoCancelamento";
import ComprovanteAgendamento from "./ComprovanteAgendamento";
import ModalHistorico from "../../universais/ModalHistorico";
import ContatoUnidade from "../../universais/ContatoUnidade";
import type { Agendamento } from "../../../types/agendamento";
import { useDadosUser } from "../../../hook/Dadosuser";

interface AgendamentoCardPacienteProps {
  agendamento: Agendamento;
}

/**
 * Card de agendamento na visão do PACIENTE.
 * Layout deliberadamente diferente do AgendamentoCard do ADM (sem avatar,
 * sem CPF/telefone), mas reaproveita o StatusBadge com variant="paciente"
 * (label "Coletado" em vez de "Concluído").
 * Mostra o recado da unidade, o motivo quando cancelado, o comprovante
 * (com QR Code) e o atalho para falar com a unidade pelo WhatsApp.
 */
export default function AgendamentoCardPaciente({ agendamento }: AgendamentoCardPacienteProps) {
  const {
    sol_id,
    sol_protocolo,
    sol_data_de_coleta,
    sol_hora_coleta,
    posto,
    insumos,
    status,
    sol_motivo_cancelamento,
    sol_data_cancelamento,
    sol_recado,
    sol_data_anterior,
  } = agendamento;
  const usuario = useDadosUser();
  const [verComprovante, setVerComprovante] = useState(false);
  const [verHistorico, setVerHistorico] = useState(false);

  const resumoInsumos = insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ");
  const dataFormatada = formatarDataBR(sol_data_de_coleta);

  // Mensagem pronta para o WhatsApp do posto (o botão só aparece se o posto tiver número)
  const mensagemUnidade = status === "cancelado"
    ? `Olá! Sou ${usuario.nome}. Meu agendamento ${sol_protocolo ?? ""} de ${dataFormatada} na ${posto.pos_nome} foi cancelado e gostaria de saber mais.`
    : status === "nao_compareceu"
    ? `Olá! Sou ${usuario.nome}. Não consegui retirar a coleta ${sol_protocolo ?? ""} de ${dataFormatada} na ${posto.pos_nome} e gostaria de combinar uma nova data.`
    : `Olá! Sou ${usuario.nome}. Tenho a coleta ${sol_protocolo ?? ""} agendada para ${dataFormatada} na ${posto.pos_nome}. `;

  return (
    <div className="agendamento-card-paciente rounded-3xl bg-white px-5 py-5 shadow-sm sm:px-6">
      <p className="break-words text-gray-700">
        <span className="font-bold">Protocolo:</span> {sol_protocolo ?? "—"}
      </p>
      <p className="break-words text-gray-700">
        <span className="font-bold">Coleta:</span> {resumoInsumos}
      </p>
      <p className="text-gray-700">
        <span className="font-bold">Data:</span> {dataFormatada}
        {sol_hora_coleta ? ` • ${sol_hora_coleta}` : ""}
      </p>
      <p className="mb-3 break-words text-gray-700">
        <span className="font-bold">Local:</span> {posto.pos_nome}
      </p>
      <StatusBadge status={status} variant="paciente" />

      {sol_data_anterior && status === "agendado" && (
        <p className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span className="font-medium">Coleta remarcada:</span> a data anterior era {formatarDataBR(sol_data_anterior)}.
        </p>
      )}

      {status === "nao_compareceu" && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          A retirada não foi feita na data marcada. Fale com a unidade para combinar uma nova data.
        </p>
      )}

      {sol_recado && status === "agendado" && (
        <p className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span className="font-medium">Recado da unidade:</span> {sol_recado}
        </p>
      )}

      {status === "cancelado" && (
        <div className="mt-3">
          <MotivoCancelamento motivo={sol_motivo_cancelamento} data={sol_data_cancelamento} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {status === "agendado" && (
          <button type="button" onClick={() => setVerComprovante(true)} className="botao-novo-agendamento">
            Ver comprovante
          </button>
        )}
        {(status === "agendado" || status === "cancelado" || status === "nao_compareceu") && (posto?.pos_whatsapp || status !== "agendado") && (
          <ContatoUnidade pos_nome={posto?.pos_nome} pos_whatsapp={posto?.pos_whatsapp} mensagem={mensagemUnidade} />
        )}
        <button
          type="button"
          onClick={() => setVerHistorico(true)}
          className="min-h-11 rounded-full px-4 text-sm font-medium text-blue-700 hover:underline"
        >
          Ver andamento
        </button>
      </div>

      {verComprovante && (
        <ComprovanteAgendamento
          agendamento={agendamento}
          nomePaciente={usuario.nome}
          cpfPaciente={usuario.cpf}
          onClose={() => setVerComprovante(false)}
        />
      )}

      {verHistorico && (
        <ModalHistorico
          sol_id={sol_id}
          perfil="PACIENTE"
          titulo={`Andamento de ${sol_protocolo ?? "seu agendamento"}`}
          onClose={() => setVerHistorico(false)}
        />
      )}
    </div>
  );
}

function formatarDataBR(isoDate: string | null | undefined): string {
  if (!isoDate) return "Data não informada";
  const [ano, mes, dia] = isoDate.split("T")[0].split("-");
  if (!ano || !mes || !dia) return "Data não informada";
  return `${dia}/${mes}/${ano}`;
}
