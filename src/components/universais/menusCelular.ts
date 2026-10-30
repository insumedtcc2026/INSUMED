import {
  Activity, CalendarClock, CalendarPlus, ClipboardCheck, ClipboardList, FileText, ListChecks,
  Package, QrCode, Upload, UserCog, Users,
} from 'lucide-react';
import { MdAddLocation } from 'react-icons/md';
import { IoPersonSharp } from 'react-icons/io5';
import { BsCalendarCheckFill } from 'react-icons/bs';
import { GoHomeFill } from 'react-icons/go';

import type { ComponentType } from 'react';

import type { Perfil } from './sessao';

// Menus do celular: a barra inferior (NavInferior) e a página "Mais".

export type Icone = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

export interface Item {
  label: string;
  path: string;
  icon: Icone;
  // outras rotas que também deixam o item ativo
  ativoEm?: string[];
}

interface Menu {
  // até 4 itens fixos na barra; o resto fica em "Mais"
  principais: Item[];
  mais: Item[];
}

// Mesmas rotas dos menus laterais (que continuam no computador).
export const MENUS: Record<Perfil, Menu> = {
  PACIENTE: {
    principais: [
      { label: 'Início', path: '/home', icon: GoHomeFill },
      { label: 'Agenda', path: '/agendamentos', icon: BsCalendarCheckFill },
      { label: 'Prescrições', path: '/prescricoes', icon: FileText },
      { label: 'Enviar', path: '/EnviarSolicitacao', icon: Upload },
    ],
    mais: [
      { label: 'Meus insumos', path: '/meus-insumos', icon: Package },
      { label: 'Pontos de coleta', path: '/pontos-coleta', icon: MdAddLocation },
      { label: 'Meu perfil', path: '/perfil', icon: IoPersonSharp },
    ],
  },
  ADMIN: {
    principais: [
      { label: 'Início', path: '/HomeAdmin', icon: GoHomeFill },
      { label: 'Agenda', path: '/Agendamentosadm', icon: BsCalendarCheckFill },
      { label: 'Hoje', path: '/coletas-hoje', icon: ClipboardCheck },
      {
        label: 'Solicitações',
        path: '/VerSolicitaçoes',
        icon: ClipboardList,
        ativoEm: ['/administrador/prescricao', '/historicodaprescricao'],
      },
    ],
    mais: [
      { label: 'Ler QR Code', path: '/leitor-qrcode', icon: QrCode },
      { label: 'Lista de separação', path: '/lista-separacao', icon: ListChecks },
      { label: 'Novo agendamento', path: '/Agendamentosadm?novo=1', icon: CalendarPlus },
      { label: 'Pacientes', path: '/Pacientesadm', icon: Users },
      { label: 'Horários da unidade', path: '/horarios-unidade', icon: CalendarClock },
      { label: 'Atividades da unidade', path: '/atividades', icon: Activity },
      { label: 'Insumos', path: '/insumos', icon: Package },
      { label: 'Meu perfil', path: '/perfil-admin', icon: UserCog },
    ],
  },
  AUTORIZADOR: {
    principais: [
      { label: 'Início', path: '/homeaut', icon: GoHomeFill },
      {
        label: 'Análise',
        path: '/verprescricoesaprovadas',
        icon: ClipboardCheck,
        ativoEm: ['/autorizador/solicitacao/'],
      },
      { label: 'Perfil', path: '/perfil-autorizador', icon: UserCog },
    ],
    mais: [],
  },
};

// Página "Mais" de cada perfil (os caminhos caem nas ROTAS do perfil)
export const PAGINA_MAIS: Record<Perfil, string> = {
  PACIENTE: '/mais',
  ADMIN: '/administrador/mais',
  AUTORIZADOR: '/autorizador/mais',
};

// Qual perfil a página pertence (as rotas do sistema não têm prefixo comum).
const ROTAS: Record<Perfil, string[]> = {
  PACIENTE: ['/home', '/mais', '/agendamentos', '/prescricoes', '/enviarsolicitacao', '/pontos-coleta', '/perfil', '/meus-insumos'],
  ADMIN: [
    '/homeadmin', '/agendamentosadm', '/coletas-hoje', '/versolicitaçoes', '/historicodaprescricao',
    '/pacientesadm', '/atividades', '/perfil-admin', '/administrador/', '/leitor-qrcode', '/horarios-unidade',
    '/lista-separacao',
  ],
  AUTORIZADOR: ['/homeaut', '/verprescricoesaprovadas', '/autorizador/', '/perfil-autorizador'],
};

export function perfilDaRota(pathname: string): Perfil | null {
  let caminho = pathname;
  try {
    caminho = decodeURIComponent(pathname);
  } catch {
    /* mantém como veio */
  }
  // "/insumos" é o estoque do admin (as rotas não diferenciam maiúsculas)
  if (caminho.toLowerCase() === '/insumos') return 'ADMIN';
  const minusculo = caminho.toLowerCase();
  const casa = (rotas: string[]) =>
    rotas.some((r) => (r.endsWith('/') ? minusculo.startsWith(r) : minusculo === r || minusculo.startsWith(`${r}/`)));
  // a ordem importa: "/perfil-admin" não pode cair em "/perfil" do paciente
  if (casa(ROTAS.AUTORIZADOR)) return 'AUTORIZADOR';
  if (casa(ROTAS.ADMIN)) return 'ADMIN';
  if (casa(ROTAS.PACIENTE)) return 'PACIENTE';
  return null;
}

export function estaAtivo(item: Item, pathname: string) {
  const atual = decodeURIComponent(pathname).toLowerCase();
  const base = item.path.split('?')[0].toLowerCase();
  return atual === base || Boolean(item.ativoEm?.some((r) => atual.startsWith(r.toLowerCase())));
}
