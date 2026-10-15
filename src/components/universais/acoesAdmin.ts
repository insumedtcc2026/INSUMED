import Swal from "sweetalert2";
import { salvarRecado } from "../../services/HistoricoService";
import { mensagemErroApi } from "../../utils/validacoes";

export const RECADO_MAX = 300;

/** Cria, altera ou apaga (texto vazio) o recado do agendamento. */
export async function editarRecado(sol_id: number, protocolo: string, atual?: string | null): Promise<boolean> {
  const resultado = await Swal.fire({
    title: "Recado para o paciente",
    text: `Aparece no agendamento ${protocolo} e no comprovante. Deixe em branco para apagar.`,
    input: "textarea",
    inputValue: atual ?? "",
    inputPlaceholder: "Ex.: traga um documento com foto",
    inputAttributes: { "aria-label": "Recado para o paciente", maxlength: String(RECADO_MAX) },
    showCancelButton: true,
    confirmButtonText: "Salvar recado",
    cancelButtonText: "Voltar",
    confirmButtonColor: "#3085d6",
    reverseButtons: true,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async (valor: string) => {
      try {
        return await salvarRecado(sol_id, valor.trim());
      } catch (e) {
        Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível salvar o recado."));
        return false;
      }
    },
  });
  return resultado.isConfirmed;
}
