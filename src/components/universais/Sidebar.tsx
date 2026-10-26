import '../../css/universais/Sidebar.css';

import { useNavigate, useLocation } from 'react-router-dom';

import logo from '../../assets/home/Logo.webp';
import { sairDoPerfil } from './sessao';

import { FileText, LogOut, Package, Upload, X } from 'lucide-react';

import { MdAddLocation } from 'react-icons/md';
import { IoPersonSharp } from 'react-icons/io5';
import { BsCalendarCheckFill } from 'react-icons/bs';
import { GoHomeFill } from 'react-icons/go';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  const location = useLocation();

  const menuItems = [
    {
      icon: GoHomeFill,
      label: 'Início',
      path: '/home',
    },
    {
      icon: BsCalendarCheckFill,
      label: 'Agendamentos',
      path: '/agendamentos',
    },
    {
      icon: FileText,
      label: 'Minhas prescrições',
      path: '/prescricoes',
    },
    {
      icon: Package,
      label: 'Meus insumos',
      path: '/meus-insumos',
    },
    {
      icon: Upload,
      label: 'Enviar prescrição',
      path: '/EnviarSolicitacao',
    },
    {
      icon: MdAddLocation,
      label: 'Pontos de Coleta',
      path: '/pontos-coleta',
    },
    {
      icon: IoPersonSharp,
      label: 'Perfil',
      path: '/perfil',
    },
    {
      icon: LogOut,
      label: 'Sair',
      path: '/login',
       action: () => {
        sairDoPerfil('PACIENTE');
      }
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          isOpen ? 'sidebar-open' : ''
        }`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img
              src={logo}
              alt="Logo Insumed"
              className="sidebar-logo"
            />
          </div>

          <button
            onClick={onClose}
            className="sidebar-close-button"
            aria-label="Fechar menu"
          >
            <X className="sidebar-close-icon" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(
            ({ icon: Icon, label, path, action }) => (
              <button
                key={label}
                onClick={() => {
                  if (action) {
                    action();
                  }
                  navigate(path);

                  onClose();
                }}
                className={`sidebar-item ${
                  location.pathname === path
                    ? 'sidebar-item-active'
                    : ''
                } ${label === 'Sair' ? 'sidebar-item-sair' : ''}`}
              >
                <Icon className="sidebar-item-icon" />

                <span className="sidebar-item-text">
                  {label}
                </span>
              </button>
            )
          )}
        </nav>
      </aside>
    </>
  );
}