import '../../css/universais/Sidebar.css';


import { useNavigate, useLocation } from 'react-router-dom';

import logo from '../../assets/home/Logo.png';
import { sairDoPerfil } from './sessao';

import {
  CalendarPlus,
  Files,
  LogOut,
  Package,
  RotateCcwIcon,
  X,
} from 'lucide-react';

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
      path: '/HomeAdmin',
    },
    {
      icon: BsCalendarCheckFill,
      label: 'Agendamentos',
      path: '/Agendamentosadm',
    },
    {
      // abre o formulário direto na página de agendamentos
      icon: CalendarPlus,
      label: 'Novo Agendamento',
      path: '/Agendamentosadm?novo=1',
    },
    {
      icon: Files,
      label: 'Solicitações',
      path: '/VerSolicitaçoes',
    },
    {
      icon: RotateCcwIcon,
      label: 'Histórico da prescrição',
      path: '/Historicodaprescricao',
    },
    {
      icon: Package,
      label: 'Insumos',
      path: '/insumos',
    },
    {
      icon: IoPersonSharp,
      label: 'Pacientes',
      path: '/Pacientesadm',
    },



    {
      icon: LogOut,
      label: 'Sair',
      path: '/login',
       action: () => {
        sairDoPerfil('ADMIN');
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
                }`}
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