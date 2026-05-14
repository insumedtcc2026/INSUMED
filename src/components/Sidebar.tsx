import '../css/Sidebar.css';

import logo from '../assets/logo.png';

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
  const menuItems = [
    {
      icon: GoHomeFill,
      label: 'Início',
      active: true,
    },
    {
      icon: BsCalendarCheckFill,
      label: 'Agendamentos',
    },
    {
      icon: IoBandage,
      label: 'Meus Insumos',
    },
    {
      icon: MdAddLocation,
      label: 'Pontos de Coleta',
    },
    {
      icon: IoPersonSharp,
      label: 'Perfil',
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

            <h2 className="sidebar-title">
              INSUMED
            </h2>
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
            ({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={`sidebar-item ${
                  active
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