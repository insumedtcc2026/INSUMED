import {
  Activity,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Files,
  History,
  House,
  ListChecks,
  Package,
  QrCode,
  TrendingUp,
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
  soUniversal?: boolean;
}

export interface GrupoMenuAdmin {
  titulo: string;
  itens: ItemMenuAdmin[];
  // grupo recolhido que abre ao clicar (Atividades da unidade)
  recolhivel?: { rotulo: string; Icone: LucideIcon };
}

export const INICIO_ADMIN: ItemMenuAdmin = { rotulo: "Início", caminho: "/HomeAdmin", Icone: House };

export const GRUPOS_MENU_ADMIN: GrupoMenuAdmin[] = [
  {
    titulo: "Atendimento",
    itens: [
      { rotulo: "Coletas de hoje", caminho: "/coletas-hoje", Icone: ClipboardCheck, contador: "coletasHoje" },
      { rotulo: "Agendamentos", caminho: "/Agendamentosadm", Icone: CalendarDays, contador: "pedidosOutraData" },
      { rotulo: "Lista de separação", caminho: "/lista-separacao", Icone: ListChecks },
      { rotulo: "Ler QR Code", caminho: "/leitor-qrcode", Icone: QrCode, ativoEm: ["/leitor-qrcode/"] },
    ],
  },
  {
    titulo: "Prescrições",
    itens: [
      {
        rotulo: "Solicitações",
        caminho: "/VerSolicitaçoes",
        Icone: Files,
        contador: "pendentes",
        ativoEm: ["/administrador/prescricao/"],
      },
      { rotulo: "Histórico da prescrição", caminho: "/Historicodaprescricao", Icone: History },
    ],
  },
  {
    titulo: "Pacientes e estoque",
    itens: [
      { rotulo: "Pacientes", caminho: "/Pacientesadm", Icone: Users, ativoEm: ["/pacientesadm/"] },
      { rotulo: "Insumos", caminho: "/insumos", Icone: Package, contador: "estoqueBaixo" },
      { rotulo: "Previsão de demanda", caminho: "/previsao-demanda", Icone: TrendingUp },
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
  },
];

// Páginas fora do menu, só para o caminho ("Atendimento › ...") da barra superior
const OUTRAS_PAGINAS: { prefixo: string; trilha: string[] }[] = [
  { prefixo: "/perfil-admin", trilha: ["Meu perfil"] },
  { prefixo: "/notificacoes-admin", trilha: ["Notificações"] },
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

/** Trilha da barra superior para a página atual (ex.: ["Prescrições", "Solicitações"]). */
export function trilhaAdmin(pathname: string): string[] {
  if (itemAtivo(INICIO_ADMIN, pathname)) return ["Início"];
  for (const grupo of GRUPOS_MENU_ADMIN) {
    const item = grupo.itens.find((i) => itemAtivo(i, pathname));
    if (item) {
      return grupo.recolhivel ? [grupo.recolhivel.rotulo, item.rotulo] : [grupo.titulo, item.rotulo];
    }
  }
  const atual = normalizarCaminho(pathname);
  return OUTRAS_PAGINAS.find((p) => atual.startsWith(p.prefixo))?.trilha ?? [];
}

export function adminUniversal(): boolean {
  try {
    return Boolean(JSON.parse(localStorage.getItem("usuario_admin") ?? "{}").tp_universal);
  } catch {
    return false;
  }
}
