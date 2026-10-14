import axios from "axios";
import Swal from "sweetalert2";
import { salvarRecado, transferirUnidade } from "../../services/HistoricoService";
import { MOTIVO_MAX, mensagemErroApi, validarMotivo } from "../../utils/validacoes";
import { API_URL } from "../../config";

export const RECADO_MAX = 300;

const esc = (t: unknown) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/**
 * Transfere uma prescrição em andamento ou um agendamento para outra
 * unidade. Pede a unidade de destino e o motivo (obrigatório, fica no
 * histórico). Devolve true quando a transferência foi salva.
 */
export async function transferirComMotivo(sol_id: number, rotulo: string, pos_id_atual?: number | null): Promise<boolean> {
  let postos: { pos_id: number; pos_nome: string }[];
  try {
    postos = (await axios.get(`${API_URL}/postos`)).data;
  } catch (e) {
    await Swal.fire({ icon: "error", title: "Não foi possível carregar as unidades", text: mensagemErroApi(e, "Tente novamente."), confirmButtonColor: "#d33" });
    return false;
  }

  const opcoes = postos
    .filter((p) => p.pos_id !== pos_id_atual)
    .map((p) => `<option value="${p.pos_id}">${esc(p.pos_nome)}</option>`)
    .join("");

  const resultado = await Swal.fire({
    title: "Transferir para outra unidade",
    html: `
      <p style="margin-bottom:12px">${esc(rotulo)}</p>
      <label for="tr-posto" style="display:block;text-align:left;font-weight:600;margin-bottom:4px">Unidade de destino</label>
      <select id="tr-posto" class="swal2-select" style="display:block;width:100%;margin:0 0 12px">
        <option value="">Selecione</option>${opcoes}
      </select>
      <label for="tr-motivo" style="display:block;text-align:left;font-weight:600;margin-bottom:4px">Motivo da transferência</label>
      <textarea id="tr-motivo" class="swal2-textarea" maxlength="${MOTIVO_MAX}" style="display:block;width:100%;margin:0" placeholder="Ex.: paciente mudou de bairro"></textarea>`,
    showCancelButton: true,
    confirmButtonText: "Transferir",
    cancelButtonText: "Voltar",
    confirmButtonColor: "#6d28d9",
    reverseButtons: true,
    focusConfirm: false,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async () => {
      const posto = (document.getElementById("tr-posto") as HTMLSelectElement).value;
      const motivo = (document.getElementById("tr-motivo") as HTMLTextAreaElement).value;
      if (!posto) return Swal.showValidationMessage("Selecione a unidade de destino.");
      const erro = validarMotivo(motivo);
      if (erro) return Swal.showValidationMessage(erro);
      try {
        return await transferirUnidade(sol_id, Number(posto), motivo.trim());
      } catch (e) {
        Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível transferir."));
        return false;
      }
    },
  });

  if (!resultado.isConfirmed) return false;
  await Swal.fire({ icon: "success", title: resultado.value?.message ?? "Transferido", confirmButtonColor: "#3085d6" });
  return true;
}

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
