import '../../css/universais/NavInferior.css';

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, CalendarPlus, ClipboardCheck, ClipboardList, FileText, HelpCircle, History, LogOut,
  MoreHorizontal, Package, ShieldCheck, Upload, UserCog, Users, X,
} from 'lucide-react';
import { MdAddLocation } from 'react-icons/md';
import { IoPersonSharp } from 'react-icons/io5';
import { BsCalendarCheckFill } from 'react-icons/bs';
import { GoHomeFill } from 'react-icons/go';

import { sairDoPerfil, type Perfil } from './sessao';
import { linksAtendimento, propsLinkExterno } from './contatos';

type Icone = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

interface Item {
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
const MENUS: Record<Perfil, Menu> = {
  PACIENTE: {
    principais: [
      { label: 'Início', path: '/home', icon: GoHomeFill },
      { label: 'Agenda', path: '/agendamentos', icon: BsCalendarCheckFill },
      { label: 'Prescrições', path: '/prescricoes', icon: FileText },
      { label: 'Enviar', path: '/EnviarSolicitacao', icon: Upload },
    ],
    mais: [
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
        ativoEm: ['/administrador/prescricao'],
      },
    ],
    mais: [
      { label: 'Novo agendamento', path: '/Agendamentosadm?novo=1', icon: CalendarPlus },
      { label: 'Histórico da prescrição', path: '/Historicodaprescricao', icon: History },
      { label: 'Pacientes', path: '/Pacientesadm', icon: Users },
      { label: 'Insumos', path: '/insumos', icon: Package },
      { label: 'Atividades da unidade', path: '/atividades', icon: Activity },
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

// Qual perfil a página pertence (as rotas do sistema não têm prefixo comum).
const ROTAS: Record<Perfil, string[]> = {
  PACIENTE: ['/home', '/agendamentos', '/prescricoes', '/enviarsolicitacao', '/pontos-coleta', '/perfil'],
  ADMIN: [
    '/homeadmin', '/agendamentosadm', '/coletas-hoje', '/versolicitaçoes', '/historicodaprescricao',
    '/pacientesadm', '/atividades', '/perfil-admin', '/administrador/',
  ],
  AUTORIZADOR: ['/homeaut', '/verprescricoesaprovadas', '/autorizador/', '/perfil-autorizador'],
};

function perfilDaRota(pathname: string): Perfil | null {
  let caminho = pathname;
  try {
    caminho = decodeURIComponent(pathname);
  } catch {
    /* mantém como veio */
  }
  // "/Insumos" (maiúsculo) é a página do paciente; "/insumos" é o estoque do admin
  if (caminho === '/Insumos') return 'PACIENTE';
  if (caminho === '/insumos') return 'ADMIN';
  const minusculo = caminho.toLowerCase();
  const casa = (rotas: string[]) =>
    rotas.some((r) => (r.endsWith('/') ? minusculo.startsWith(r) : minusculo === r || minusculo.startsWith(`${r}/`)));
  // a ordem importa: "/perfil-admin" não pode cair em "/perfil" do paciente
  if (casa(ROTAS.AUTORIZADOR)) return 'AUTORIZADOR';
  if (casa(ROTAS.ADMIN)) return 'ADMIN';
  if (casa(ROTAS.PACIENTE)) return 'PACIENTE';
  return null;
}

function estaAtivo(item: Item, pathname: string) {
  const atual = decodeURIComponent(pathname).toLowerCase();
  const base = item.path.split('?')[0].toLowerCase();
  return atual === base || Boolean(item.ativoEm?.some((r) => atual.startsWith(r.toLowerCase())));
}

/**
 * Navegação do celular (até 768px) para os três perfis, no lugar do menu
 * lateral e do rodapé. Os itens mais usados ficam na barra; os demais,
 * a ajuda, os links legais e o "Sair" ficam em "Mais".
 */
export default function NavInferior() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [maisAberto, setMaisAberto] = useState(false);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const perfil = perfilDaRota(pathname);

  // reserva espaço no fim da página para a barra não cobrir o conteúdo
  useEffect(() => {
    if (!perfil) return;
    document.body.classList.add('com-nav-inferior');
    return () => document.body.classList.remove('com-nav-inferior');
  }, [perfil]);

  useEffect(() => {
    if (!maisAberto) return;
    fecharRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setMaisAberto(false);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [maisAberto]);

  if (!perfil) return null;

  const menu = MENUS[perfil];
  const maisAtivo = menu.mais.some((i) => estaAtivo(i, pathname));

  function sair() {
    sairDoPerfil(perfil as Perfil);
    setMaisAberto(false);
    navigate('/login');
  }

  return (
    <>
      <nav className="nav-inferior" aria-label="Navegação principal">
        {menu.principais.map((item) => {
          const ativo = estaAtivo(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-inferior-item ${ativo ? 'nav-inferior-item-ativo' : ''}`}
              aria-current={ativo ? 'page' : undefined}
            >
              <Icon className="nav-inferior-icone" aria-hidden={true} />
              <span className="nav-inferior-texto">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          className={`nav-inferior-item ${maisAtivo || maisAberto ? 'nav-inferior-item-ativo' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={maisAberto}
          onClick={() => setMaisAberto(true)}
        >
          <MoreHorizontal className="nav-inferior-icone" aria-hidden={true} />
          <span className="nav-inferior-texto">Mais</span>
        </button>
      </nav>

      {maisAberto && (
        <div className="nav-mais-fundo" onClick={() => setMaisAberto(false)}>
          <div
            className="nav-mais"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nav-mais-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-mais-topo">
              <h2 id="nav-mais-titulo">Mais opções</h2>
              <button ref={fecharRef} type="button" onClick={() => setMaisAberto(false)} aria-label="Fechar" className="nav-mais-fechar">
                <X aria-hidden={true} />
              </button>
            </div>

            {menu.mais.length > 0 && (
              <ul className="nav-mais-lista">
                {menu.mais.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link to={item.path} onClick={() => setMaisAberto(false)} className="nav-mais-item"
                        aria-current={estaAtivo(item, pathname) ? 'page' : undefined}>
                        <Icon className="nav-mais-icone" aria-hidden={true} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="nav-mais-secao">Ajuda e informações</p>
            <ul className="nav-mais-lista">
              {linksAtendimento.map((link) => (
                <li key={link.href}>
                  <a href={link.href} aria-label={link.ariaLabel} {...propsLinkExterno} className="nav-mais-item">
                    <HelpCircle className="nav-mais-icone" aria-hidden={true} />
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/termos" onClick={() => setMaisAberto(false)} className="nav-mais-item">
                  <ShieldCheck className="nav-mais-icone" aria-hidden={true} />
                  Termos, privacidade e segurança
                </Link>
              </li>
            </ul>

            <button type="button" onClick={sair} className="nav-mais-item nav-mais-sair">
              <LogOut className="nav-mais-icone" aria-hidden={true} />
              Sair
            </button>
          </div>
        </div>
      )}
    </>
  );
}
