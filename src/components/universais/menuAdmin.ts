import {
  Activity,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Files,
  House,
  ListChecks,
  Package,
  QrCode,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

// Contador mostrado ao lado do item (vem de useContadoresAdmin)
export type ChaveContador = "coletasHoje" | "pedidosOutraData" | "pendentes" | "estoqueBaixo";

export interface ItemMenuAdmin {
  rotulo: string;
  caminho: string;
  Icone: LucideIcon;
  contador?: ChaveContador;
  // outras rotas que pertencem a este item (telas de detalhe)
  ativoEm?: string[];
  // nome da tela de detalhe na trilha (ex.: Pacientes › Ficha do paciente)
  rotuloDetalhe?: string;
  soUniversal?: boolean;
}

export interface GrupoMenuAdmin {
  titulo: string;
  itens: ItemMenuAdmin[];
  // grupo recolhido que abre ao clicar (Atividades da unidade)
  recolhivel?: { rotulo: string; Icone: LucideIcon };
  // itens comuns mostrados logo abaixo do grupo recolhido (Insumos)
  depois?: ItemMenuAdmin[];
}

export const INICIO_ADMIN: ItemMenuAdmin = { rotulo: "Início", caminho: "/HomeAdmin", Icone: House };

export const GRUPOS_MENU_ADMIN: GrupoMenuAdmin[] = [
  {
    titulo: "Atendimento",
    itens: [
      { rotulo: "Coletas de hoje", caminho: "/coletas-hoje", Icone: ClipboardCheck, contador: "coletasHoje" },
      { rotulo: "Agendamentos", caminho: "/Agendamentosadm", Icone: CalendarDays, contador: "pedidosOutraData" },
      { rotulo: "Lista de separação", caminho: "/lista-separacao", Icone: ListChecks },
      { rotulo: "Ler QR Code", caminho: "/leitor-qrcode", Icone: QrCode, ativoEm: ["/leitor-qrcode/"], rotuloDetalhe: "Atendimento no balcão" },
    ],
  },
  {
    titulo: "Prescrições e pacientes",
    itens: [
      {
        rotulo: "Solicitações",
        caminho: "/VerSolicitaçoes",
        Icone: Files,
        contador: "pendentes",
        // o histórico da prescrição fica dentro de Solicitações
        ativoEm: ["/administrador/prescricao/", "/historicodaprescricao"],
      },
      { rotulo: "Pacientes", caminho: "/Pacientesadm", Icone: Users, ativoEm: ["/pacientesadm/"], rotuloDetalhe: "Ficha do paciente" },
    ],
  },
  {
    titulo: "Unidade",
    recolhivel: { rotulo: "Atividades da unidade", Icone: Activity },
    itens: [
      { rotulo: "Registro de atividades", caminho: "/atividades", Icone: Activity },
      { rotulo: "Horários e vagas", caminho: "/horarios-unidade", Icone: CalendarClock },
      { rotulo: "Equipe da rede", caminho: "/equipe", Icone: UsersRound, soUniversal: true },
    ],
    depois: [{ rotulo: "Insumos", caminho: "/insumos", Icone: Package, contador: "estoqueBaixo" }],
  },
];

// Uma parte da trilha "Início › Solicitações › ..." (com caminho = clicável)
export interface ParteTrilha {
  rotulo: string;
  caminho?: string;
}

const SOLICITACOES: ParteTrilha = { rotulo: "Solicitações", caminho: "/VerSolicitaçoes" };

// Páginas fora do menu, só para a trilha de navegação
const OUTRAS_PAGINAS: { prefixo: string; trilha: ParteTrilha[] }[] = [
  { prefixo: "/historicodaprescricao", trilha: [SOLICITACOES, { rotulo: "Histórico da prescrição" }] },
  { prefixo: "/administrador/prescricao/", trilha: [SOLICITACOES, { rotulo: "Prescrição" }] },
  { prefixo: "/perfil-admin", trilha: [{ rotulo: "Meu perfil" }] },
  { prefixo: "/notificacoes-admin", trilha: [{ rotulo: "Notificações" }] },
];

/** Caminho sem codificação e em minúsculas (as rotas não diferenciam). */
export function normalizarCaminho(pathname: string): string {
  let caminho = pathname;
  try {
    caminho = decodeURIComponent(pathname);
  } catch {
    /* mantém como veio */
  }
  return caminho.toLowerCase().replace(/\/+$/, "") || "/";
}

export function itemAtivo(item: ItemMenuAdmin, pathname: string): boolean {
  const atual = normalizarCaminho(pathname);
  const base = normalizarCaminho(item.caminho.split("?")[0]);
  return atual === base || Boolean(item.ativoEm?.some((r) => atual.startsWith(r.toLowerCase())));
}

/**
 * Trilha mostrada logo abaixo da barra superior, começando em "Início"
 * (ex.: Início › Atividades da unidade › Horários e vagas). Na Home fica vazia.
 */
export function trilhaAdmin(pathname: string): ParteTrilha[] {
  if (itemAtivo(INICIO_ADMIN, pathname)) return [];
  const inicio: ParteTrilha = { rotulo: INICIO_ADMIN.rotulo, caminho: INICIO_ADMIN.caminho };
  const atual = normalizarCaminho(pathname);
  const outra = OUTRAS_PAGINAS.find((p) => atual.startsWith(p.prefixo));
  if (outra) return [inicio, ...outra.trilha];
  for (const grupo of GRUPOS_MENU_ADMIN) {
    const item = [...grupo.itens, ...(grupo.depois ?? [])].find((i) => itemAtivo(i, pathname));
    if (!item) continue;
    // a página de detalhe (ex.: ficha do paciente) mostra o item como link
    const detalhe = atual !== normalizarCaminho(item.caminho.split("?")[0]);
    const parte: ParteTrilha = detalhe ? { rotulo: item.rotulo, caminho: item.caminho } : { rotulo: item.rotulo };
    const noRecolhivel = grupo.recolhivel && grupo.itens.includes(item);
    return [inicio, ...(noRecolhivel ? [{ rotulo: grupo.recolhivel!.rotulo }] : []), parte, ...(detalhe ? [{ rotulo: item.rotuloDetalhe ?? "Detalhes" }] : [])];
  }
  return [];
}

export function adminUniversal(): boolean {
  try {
    return Boolean(JSON.parse(localStorage.getItem("usuario_admin") ?? "{}").tp_universal);
  } catch {
    return false;
  }
}
