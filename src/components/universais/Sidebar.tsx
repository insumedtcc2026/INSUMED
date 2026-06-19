import '../../css/universais/Sidebar.css';

import { useNavigate, useLocation } from 'react-router-dom';

import logo from '../../assets/home/Logo.png';

import { X } from 'lucide-react';

import { MdAddLocation } from 'react-icons/md';
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
      path: '/home',
    },
    {
      icon: BsCalendarCheckFill,
      label: 'Agendamentos',
      path: '/agendamentos',
    },
    {
      icon: IoBandage,
      label: 'Meus Insumos',
      path: '/Insumo',
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
            ({ icon: Icon, label, path }) => (
              <button
                key={label}
                onClick={() => {
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