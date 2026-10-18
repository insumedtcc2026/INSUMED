// Atualização do sino sem recarregar a página.
//
// Qualquer ação da própria pessoa que muda dados (POST/PATCH/PUT/DELETE no
// backend) avisa o sino para buscar de novo na hora: assim o contador
// reflete, por exemplo, a confirmação de "prescrição recebida" logo depois
// do envio, sem esperar a próxima consulta automática.
import type { AxiosInstance } from "axios";
import { API_URL } from "../config";

export const EVENTO_ATUALIZAR_NOTIFICACOES = "insumed:notificacoes-atualizar";

export function pedirAtualizacaoNotificacoes() {
  window.dispatchEvent(new Event(EVENTO_ATUALIZAR_NOTIFICACOES));
}

const MUDA_DADOS = ["post", "patch", "put", "delete"];

export function observarAcoes(instancia: AxiosInstance) {
  instancia.interceptors.response.use((resposta) => {
    const { method, url = "", baseURL = "" } = resposta.config;
    const completa = url.startsWith("http") ? url : `${baseURL}${url}`;
    const doBackend = completa.startsWith(API_URL);
    // ler/marcar notificações e login não mudam nada que gere aviso
    const ignorar = /\/notificacoes|\/login/.test(completa);
    if (doBackend && !ignorar && MUDA_DADOS.includes(String(method).toLowerCase())) {
      // um instante para o servidor terminar de gerar os avisos
      setTimeout(pedirAtualizacaoNotificacoes, 300);
    }
    return resposta;
  });
}

// "agora", "há 5 min", "há 3 h", "ontem às 14:20", "12/10/2026 às 09:15"
export function quandoFoi(iso: string, agora = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const minutos = Math.floor((agora.getTime() - d.getTime()) / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (mesmoDia(d, agora)) return `há ${Math.floor(minutos / 60)} h`;
  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  if (mesmoDia(d, ontem)) return `ontem às ${hora}`;
  return `${d.toLocaleDateString("pt-BR")} às ${hora}`;
}

// Página com o histórico completo, por perfil
export const ROTA_NOTIFICACOES = {
  PACIENTE: "/notificacoes",
  ADMIN: "/notificacoes-admin",
  AUTORIZADOR: "/notificacoes-autorizador",
} as const;
