import '../../css/universais/Sidebar.css';


import { useNavigate, useLocation } from 'react-router-dom';

import logo from '../../assets/home/Logo.png';

import {
  CalendarPlus,
  Files,
  LogOut,
  RotateCcwIcon,
  X,
} from 'lucide-react';

import { IoBandage, IoPersonSharp } from 'react-icons/io5';
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
      icon: RotateCcwIcon,
      label: 'Historico da prescrição',
      path: '/Historicodaprescricao',
    },
    {
      icon: IoBandage,
      label: 'Historico',
      path: '/Historicoadm',
    },

    {
      icon: Files,
      label: 'Solicitações',
      path: '/VerSolicitaçoes',
    },
    {
      icon: CalendarPlus,
      label: 'Novo Agendamento',
      path: '/NovoAgendamento',
    },
    {
      icon: IoPersonSharp,
      label: 'Pacientes',
      path: '/Pacientesadm',
    },
    {
      icon: IoPersonSharp,
      label: 'TodosAgendamentos',
      path: '/TodosAgendamentos',
    },



    {
      icon: LogOut,
      label: 'Sair',
      path: '/login',
       action: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
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