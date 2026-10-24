import Swal from "sweetalert2";
import { refazerPedido, remarcarAgendamento, salvarRecado } from "../../services/HistoricoService";
import { hojeISO, mensagemErroApi, MOTIVO_MAX } from "../../utils/validacoes";
import { dataComTurno } from "../../utils/agenda";
import { listarAutorizados, responderPedidoOutraData } from "../../services/AgendaService";

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
 * Remarca o agendamento (mesmo protocolo, nova data e turno). O paciente é
 * avisado no sino e vê "remarcado" no agendamento e no andamento. Mesmo
 * dia com outro turno também vale.
 */
export async function remarcarComData(sol_id: number, protocolo: string, dataAtual?: string | null, turnoAtual?: string | null): Promise<boolean> {
  const atual = dataAtual ? dataAtual.slice(0, 10) : "";
  const resultado = await Swal.fire({
    title: "Remarcar coleta",
    html: `
      <p style="margin:0 0 12px;color:#5b6475">Protocolo ${protocolo}${atual ? ` · hoje marcada para ${dataComTurno(atual, turnoAtual)}` : ""}. O paciente será avisado.</p>
      <label for="remarcar-data" style="display:block;text-align:left;font-weight:600;margin-bottom:4px">Nova data</label>
      <input id="remarcar-data" type="date" min="${hojeISO()}" class="swal2-input" style="margin:0 0 12px;width:100%;box-sizing:border-box" />
      <label for="remarcar-turno" style="display:block;text-align:left;font-weight:600;margin-bottom:4px">Turno</label>
      <select id="remarcar-turno" class="swal2-select" style="margin:0 0 12px;width:100%;box-sizing:border-box;display:block">
        <option value="">Primeiro turno com vaga</option>
        <option value="manha">Manhã</option>
        <option value="tarde">Tarde</option>
      </select>
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
      const turno = (document.getElementById("remarcar-turno") as HTMLSelectElement | null)?.value ?? "";
      const motivo = (document.getElementById("remarcar-motivo") as HTMLTextAreaElement | null)?.value.trim() ?? "";
      if (!data) {
        Swal.showValidationMessage("Escolha a nova data.");
        return false;
      }
      try {
        return await remarcarAgendamento(sol_id, data, motivo, turno);
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

/**
 * Responde ao pedido de outra data do paciente. Aceitar remarca a coleta
 * (mesmo protocolo); recusar exige explicar o motivo ao paciente.
 */
export async function responderPedidoData(
  sol_id: number,
  protocolo: string,
  pedido: { data: string | null; turno: string | null },
  aceitar: boolean,
): Promise<boolean> {
  const quando = dataComTurno(pedido.data, pedido.turno);
  const resultado = aceitar
    ? await Swal.fire({
        icon: "question",
        title: "Aceitar a nova data?",
        text: `A coleta ${protocolo} passa para ${quando}. O paciente será avisado.`,
        showCancelButton: true,
        confirmButtonText: "Aceitar e remarcar",
        cancelButtonText: "Voltar",
        confirmButtonColor: "#16a34a",
        reverseButtons: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            return await responderPedidoOutraData(sol_id, true);
          } catch (e) {
            Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível aceitar o pedido."));
            return false;
          }
        },
      })
    : await Swal.fire({
        title: "Recusar o pedido",
        text: `O paciente pediu ${quando}. Explique por que não é possível; ele verá a resposta e a data atual continua valendo.`,
        input: "textarea",
        inputPlaceholder: "Ex.: não há vaga nesse turno; a próxima é na terça de manhã",
        inputAttributes: { "aria-label": "Motivo da recusa", maxlength: "300" },
        showCancelButton: true,
        confirmButtonText: "Recusar pedido",
        cancelButtonText: "Voltar",
        confirmButtonColor: "#d33",
        reverseButtons: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async (valor: string) => {
          if (!valor?.trim()) {
            Swal.showValidationMessage("Escreva o motivo para o paciente.");
            return false;
          }
          try {
            return await responderPedidoOutraData(sol_id, false, valor.trim());
          } catch (e) {
            Swal.showValidationMessage(mensagemErroApi(e, "Não foi possível recusar o pedido."));
            return false;
          }
        },
      });
  return resultado.isConfirmed;
}

const escHtml = (t: unknown) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/**
 * Confirmação da entrega no balcão. Se o paciente tem pessoas autorizadas
 * na ficha, pergunta quem está retirando. Devolve null se o admin voltou;
 * senão { retirado_por } (null = o próprio paciente).
 */
export async function confirmarEntrega(opcoes: {
  pac_id?: number;
  protocolo: string;
  paciente: string;
  linhas: string[]; // texto simples, escapado aqui
  textoConfirmar?: string;
}): Promise<{ retirado_por: number | null } | null> {
  const autorizados = opcoes.pac_id
    ? await listarAutorizados(opcoes.pac_id).then((r) => r.autorizados).catch(() => [])
    : [];
  const html = `<p><strong>${escHtml(opcoes.protocolo)}</strong> · ${escHtml(opcoes.paciente)}</p>` +
    opcoes.linhas.map((l) => `<p style="margin-top:6px">${escHtml(l)}</p>`).join("") +
    (autorizados.length ? `<p style="margin-top:12px;font-weight:600">Quem está retirando?</p>` : "");

  const resultado = await Swal.fire({
    icon: "question",
    title: "Entregar e concluir?",
    html,
    ...(autorizados.length
      ? {
          input: "select" as const,
          inputOptions: Object.fromEntries([
            ["", "O próprio paciente"],
            ...autorizados.map((a) => [
              String(a.pau_id),
              `${a.pau_nome}${a.pau_parentesco ? ` (${a.pau_parentesco})` : ""} · CPF ${a.pau_cpf}`,
            ]),
          ]),
          inputValue: "",
          inputAttributes: { "aria-label": "Quem está retirando" },
        }
      : {}),
    showCancelButton: true,
    confirmButtonText: opcoes.textoConfirmar ?? "Concluir coleta",
    cancelButtonText: "Voltar",
    confirmButtonColor: "#16a34a",
    reverseButtons: true,
    focusConfirm: true,
  });
  if (!resultado.isConfirmed) return null;
  const id = Number(resultado.value);
  return { retirado_por: autorizados.length && id ? id : null };
}
