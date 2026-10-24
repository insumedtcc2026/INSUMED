import { useState } from "react";
import Swal from "sweetalert2";
import StatusBadge from "./StatusBadge";
import ModalOutraData from "./ModalOutraData";
import MotivoCancelamento from "./MotivoCancelamento";
import ComprovanteAgendamento from "./ComprovanteAgendamento";
import ModalHistorico from "../../universais/ModalHistorico";
import ContatoUnidade from "../../universais/ContatoUnidade";
import type { Agendamento } from "../../../types/agendamento";
import { useDadosUser } from "../../../hook/Dadosuser";
import { cancelarMeuAgendamento, responderPresenca } from "../../../services/AgendaService";
import { dataComTurno } from "../../../utils/agenda";
import { hojeISO, mensagemErroApi } from "../../../utils/validacoes";

interface AgendamentoCardPacienteProps {
  agendamento: Agendamento;
  // recarregar a lista depois de pedir outra data ou cancelar
  onAtualizar?: () => void;
}

/**
 * Card de agendamento na visão do PACIENTE.
 * Layout deliberadamente diferente do AgendamentoCard do ADM (sem avatar,
 * sem CPF/telefone), mas reaproveita o StatusBadge com variant="paciente"
 * (label "Coletado" em vez de "Concluído").
 * Mostra o recado da unidade, o motivo quando cancelado, o comprovante
 * (com QR Code) e o atalho para falar com a unidade pelo WhatsApp.
 */
export default function AgendamentoCardPaciente({ agendamento, onAtualizar }: AgendamentoCardPacienteProps) {
  const {
    sol_id,
    sol_protocolo,
    sol_data_de_coleta,
    sol_ciclo,
    sol_hora_coleta,
    posto,
    insumos,
    status,
    sol_motivo_cancelamento,
    sol_data_cancelamento,
    sol_recado,
    sol_data_anterior,
    sol_turno,
    pedido_outra_data: pedido,
    sol_retirado_por_nome,
  } = agendamento;
  const usuario = useDadosUser();
  const [verComprovante, setVerComprovante] = useState(false);
  const [verHistorico, setVerHistorico] = useState(false);
  const [pedirData, setPedirData] = useState(false);
  // resposta de presença: atualizada na hora, sem recarregar a lista
  const [presenca, setPresenca] = useState(agendamento.sol_presenca ?? null);
  const [salvandoPresenca, setSalvandoPresenca] = useState(false);

  const resumoInsumos = insumos.map((i) => `${i.quantidade}x ${i.ins_nome}`).join(", ");
  const dataFormatada = sol_data_de_coleta ? dataComTurno(sol_data_de_coleta, sol_turno) : formatarDataBR(sol_data_de_coleta);
  const protocolo = sol_protocolo ?? `#${sol_id}`;
  const dia = sol_data_de_coleta?.slice(0, 10) ?? "";
  const aberto = status === "agendado";
  // outra data: até a véspera e sem outro pedido esperando resposta
  const podePedirData = aberto && dia > hojeISO() && pedido?.situacao !== "pedido";

  async function marcarPresenca(resposta: "vou" | "nao_vou") {
    setSalvandoPresenca(true);
    try {
      const r = await responderPresenca(sol_id, resposta);
      setPresenca(r.sol_presenca);
      if (resposta === "nao_vou") {
        const quer = await Swal.fire({
          icon: "info",
          title: "Obrigado por avisar",
          text: "A unidade foi avisada. Quer pedir outra data agora?",
          showCancelButton: true,
          confirmButtonText: "Pedir outra data",
          cancelButtonText: "Agora não",
          confirmButtonColor: "#1d4ed8",
          reverseButtons: true,
        });
        if (quer.isConfirmed && podePedirData) setPedirData(true);
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Não foi possível salvar", text: mensagemErroApi(e, "Tente novamente."), confirmButtonColor: "#d33" });
    } finally {
      setSalvandoPresenca(false);
    }
  }

  async function cancelar() {
    const r = await Swal.fire({
      title: "Cancelar este agendamento?",
      text: `A coleta ${protocolo} de ${dataFormatada} será cancelada e a vaga fica para outra pessoa. Se quiser só trocar o dia, use "Pedir outra data".`,
      input: "textarea",
      inputPlaceholder: "Motivo (opcional)",
      inputAttributes: { "aria-label": "Motivo do cancelamento", maxlength: "300" },
      showCancelButton: true,
      confirmButtonText: "Cancelar agendamento",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#d33",
      reverseButtons: true,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async (valor: string) => {
        try {
          return await cancelarMeuAgendamento(sol_id, (valor ?? "").trim());
        } catch (e) {
          Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível cancelar."));
          return false;
        }
      },
    });
    if (r.isConfirmed) {
      await Swal.fire({ icon: "success", title: "Agendamento cancelado", text: "A unidade foi avisada.", confirmButtonColor: "#1d4ed8" });
      onAtualizar?.();
    }
  }

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
        {sol_ciclo && sol_ciclo > 1 ? (
          <span className="ml-2 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            {sol_ciclo}ª retirada · uso contínuo
          </span>
        ) : null}
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
      {status === "concluido" && sol_retirado_por_nome && (
        <p className="mt-2 text-sm text-gray-600">Retirado por {sol_retirado_por_nome}</p>
      )}

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

      {aberto && pedido?.situacao === "pedido" && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          <span className="font-medium">Você pediu outra data:</span> {dataComTurno(pedido.data, pedido.turno)}. Aguardando a resposta da unidade; até lá, vale a data atual.
        </p>
      )}

      {aberto && pedido?.situacao === "recusado" && (
        <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <span className="font-medium">A unidade não pôde atender o pedido para {dataComTurno(pedido.data, pedido.turno)}.</span>
          {pedido.resposta ? ` ${pedido.resposta}` : ""}
        </p>
      )}

      {/* Você vai? Ajuda a unidade a separar os insumos e liberar a vaga */}
      {aberto && dia >= hojeISO() && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm">
          <span className="mr-1 font-medium text-gray-800">
            {presenca === "vou" ? "Você confirmou presença." : presenca === "nao_vou" ? "Você avisou que não vai." : "Você vai à coleta?"}
          </span>
          <button
            type="button"
            disabled={salvandoPresenca}
            aria-pressed={presenca === "vou"}
            onClick={() => marcarPresenca("vou")}
            className={`min-h-10 rounded-full border px-4 font-medium transition disabled:opacity-50 ${
              presenca === "vou" ? "border-emerald-600 bg-emerald-600 text-white" : "border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            Vou
          </button>
          <button
            type="button"
            disabled={salvandoPresenca}
            aria-pressed={presenca === "nao_vou"}
            onClick={() => marcarPresenca("nao_vou")}
            className={`min-h-10 rounded-full border px-4 font-medium transition disabled:opacity-50 ${
              presenca === "nao_vou" ? "border-rose-600 bg-rose-600 text-white" : "border-rose-300 bg-white text-rose-800 hover:bg-rose-50"
            }`}
          >
            Não vou
          </button>
        </div>
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
        {podePedirData && (
          <button
            type="button"
            onClick={() => setPedirData(true)}
            className="min-h-11 rounded-full px-4 text-sm font-medium text-blue-700 hover:underline"
          >
            Pedir outra data
          </button>
        )}
        {aberto && (
          <button
            type="button"
            onClick={cancelar}
            className="min-h-11 rounded-full px-4 text-sm font-medium text-rose-700 hover:underline"
          >
            Cancelar agendamento
          </button>
        )}
      </div>

      {pedirData && (
        <ModalOutraData
          sol_id={sol_id}
          protocolo={protocolo}
          dataAtual={sol_data_de_coleta}
          turnoAtual={sol_turno}
          onClose={() => setPedirData(false)}
          onEnviado={() => {
            setPedirData(false);
            Swal.fire({ icon: "success", title: "Pedido enviado", text: "A unidade vai responder pelo sino.", confirmButtonColor: "#1d4ed8" });
            onAtualizar?.();
          }}
        />
      )}

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
