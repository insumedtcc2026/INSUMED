import Swal from "sweetalert2";
import { refazerPedido, remarcarAgendamento, salvarRecado } from "../../services/HistoricoService";
import { hojeISO, mensagemErroApi, MOTIVO_MAX } from "../../utils/validacoes";

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

/**
 * Remarca o agendamento (mesmo protocolo, nova data). O paciente é avisado
 * no sino e vê "remarcado" no agendamento e no andamento.
 */
export async function remarcarComData(sol_id: number, protocolo: string, dataAtual?: string | null): Promise<boolean> {
  const atual = dataAtual ? dataAtual.slice(0, 10) : "";
  const resultado = await Swal.fire({
    title: "Remarcar coleta",
    html: `
      <p style="margin:0 0 12px;color:#5b6475">Protocolo ${protocolo}${atual ? ` · data atual ${atual.split("-").reverse().join("/")}` : ""}. O paciente será avisado.</p>
      <label for="remarcar-data" style="display:block;text-align:left;font-weight:600;margin-bottom:4px">Nova data</label>
      <input id="remarcar-data" type="date" min="${hojeISO()}" class="swal2-input" style="margin:0 0 12px;width:100%;box-sizing:border-box" />
      <label for="remarcar-motivo" style="display:block;text-align:left;font-weight:600;margin-bottom:4px">Motivo (opcional, o paciente verá)</label>
      <textarea id="remarcar-motivo" maxlength="${MOTIVO_MAX}" class="swal2-textarea" style="margin:0;width:100%;box-sizing:border-box" placeholder="Ex.: unidade fechada no feriado"></textarea>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Remarcar",
    cancelButtonText: "Voltar",
    confirmButtonColor: "#3085d6",
    reverseButtons: true,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async () => {
      const data = (document.getElementById("remarcar-data") as HTMLInputElement | null)?.value ?? "";
      const motivo = (document.getElementById("remarcar-motivo") as HTMLTextAreaElement | null)?.value.trim() ?? "";
      if (!data) {
        Swal.showValidationMessage("Escolha a nova data.");
        return false;
      }
      try {
        return await remarcarAgendamento(sol_id, data, motivo);
      } catch (e) {
        Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível remarcar."));
        return false;
      }
    },
  });
  if (resultado.isConfirmed) {
    await Swal.fire({ icon: "success", title: "Coleta remarcada", text: "O paciente foi avisado da nova data.", confirmButtonColor: "#3085d6" });
  }
  return resultado.isConfirmed;
}

/**
 * Refaz o pedido de uma prescrição não autorizada: ela volta para o
 * autorizador com uma observação da unidade (obrigatória).
 */
export async function refazerComObservacao(sol_id: number): Promise<boolean> {
  const resultado = await Swal.fire({
    title: "Refazer pedido",
    text: "A prescrição volta para o autorizador analisar de novo. Explique o que mudou ou o que ele deve considerar.",
    input: "textarea",
    inputPlaceholder: "Ex.: o paciente trouxe o laudo que faltava",
    inputAttributes: { "aria-label": "Observação para o autorizador", maxlength: String(MOTIVO_MAX) },
    showCancelButton: true,
    confirmButtonText: "Enviar ao autorizador",
    cancelButtonText: "Voltar",
    confirmButtonColor: "#3085d6",
    reverseButtons: true,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async (valor: string) => {
      if (!valor?.trim()) {
        Swal.showValidationMessage("Escreva a observação para o autorizador.");
        return false;
      }
      try {
        return await refazerPedido(sol_id, valor.trim());
      } catch (e) {
        Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível refazer o pedido."));
        return false;
      }
    },
  });
  if (resultado.isConfirmed) {
    await Swal.fire({ icon: "success", title: "Pedido reenviado", text: "A prescrição voltou para análise do autorizador.", confirmButtonColor: "#3085d6" });
  }
  return resultado.isConfirmed;
}
