import '../../css/universais/Sidebar.css';

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import logo from '../../assets/home/Logo.webp';

import { ClipboardCheck, LogOut, UserCog, X } from 'lucide-react';
import { GoHomeFill } from 'react-icons/go';

import { sairDoPerfil } from './sessao';

interface SidebarAutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemMenu {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  // rotas que também deixam este item destacado (ex.: tela de análise)
  ativoEm?: (pathname: string) => boolean;
  sair?: boolean;
}

// Só o que o perfil AUTORIZADOR pode acessar no backend:
// a fila de prescrições revisadas e a análise de cada uma.
const itensMenu: ItemMenu[] = [
  {
    icon: GoHomeFill,
    label: 'Início',
    path: '/homeaut',
  },
  {
    icon: ClipboardCheck,
    label: 'Prescrições para análise',
    path: '/verprescricoesaprovadas',
    ativoEm: (p) => p.startsWith('/autorizador/solicitacao/'),
  },
  {
    icon: UserCog,
    label: 'Meu perfil',
    path: '/perfil-autorizador',
  },
  {
    icon: LogOut,
    label: 'Sair',
    path: '/login',
    sair: true,
  },
];

/** Menu lateral do autorizador (mesmo visual do menu do administrador). */
export default function SidebarAut({ isOpen, onClose }: SidebarAutProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const atual = pathname.toLowerCase();

  // Fecha com Esc, como os demais diálogos
  useEffect(() => {
    if (!isOpen) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Menu do autorizador"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={logo} alt="Logo Insumed" className="sidebar-logo" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sidebar-close-button"
            aria-label="Fechar menu"
          >
            <X className="sidebar-close-icon" />
          </button>
        </div>

        <p className="sidebar-perfil">Autorizador</p>

        <nav className="sidebar-nav">
          {itensMenu.map(({ icon: Icon, label, path, ativoEm, sair }) => {
            const ativo = atual === path.toLowerCase() || Boolean(ativoEm?.(atual));

            return (
              <button
                key={label}
                type="button"
                aria-current={ativo ? 'page' : undefined}
                onClick={() => {
                  if (sair) sairDoPerfil('AUTORIZADOR');
                  navigate(path);
                  onClose();
                }}
                className={`sidebar-item ${ativo ? 'sidebar-item-active' : ''} ${sair ? 'sidebar-item-sair' : ''}`}
              >
                <Icon className="sidebar-item-icon" />
                <span className="sidebar-item-text">{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
