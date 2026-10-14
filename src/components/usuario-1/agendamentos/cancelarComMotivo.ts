import Swal from "sweetalert2";
import { cancelarAgendamento } from "../../../services/AgendamentoService";
import { MOTIVO_MAX, mensagemErroApi, validarMotivo } from "../../../utils/validacoes";

/**
 * Pede o motivo e cancela o agendamento. Mesmo padrão da "não autorização"
 * do autorizador: o motivo é obrigatório e fica registrado no agendamento.
 * Se o backend recusar (ex.: já cancelado/concluído), a mensagem aparece no
 * próprio diálogo, sem fechá-lo. Devolve true quando o cancelamento foi salvo.
 */
export async function cancelarComMotivo(sol_id: number, protocolo: string): Promise<boolean> {
  const resultado = await Swal.fire({
    title: "Cancelar agendamento",
    text: `Informe o motivo do cancelamento do protocolo ${protocolo}. O paciente poderá ver esse motivo.`,
    input: "textarea",
    inputPlaceholder: "Escreva o motivo aqui...",
    inputAttributes: {
      "aria-label": "Motivo do cancelamento",
      maxlength: String(MOTIVO_MAX),
    },
    showCancelButton: true,
    confirmButtonText: "Cancelar agendamento",
    cancelButtonText: "Voltar",
    confirmButtonColor: "#d33",
    reverseButtons: true,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    inputValidator: (valor) => validarMotivo(valor),
    preConfirm: async (valor: string) => {
      try {
        await cancelarAgendamento(sol_id, valor.trim());
        return true;
      } catch (e) {
        Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível cancelar o agendamento."));
        return false;
      }
    },
  });

  if (!resultado.isConfirmed) return false;

  await Swal.fire({
    icon: "success",
    title: "Agendamento cancelado",
    text: "O motivo foi registrado.",
    confirmButtonColor: "#3085d6",
  });
  return true;
}
