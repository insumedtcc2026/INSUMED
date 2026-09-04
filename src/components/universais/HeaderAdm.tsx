import '../../css/universais/Header.css';

import { FaBell } from 'react-icons/fa';
import { HiMiniBars3 } from 'react-icons/hi2';
import { IoPersonSharp } from 'react-icons/io5';
import { useState } from 'react';

import { useDadosAdmin } from '../../hook/DadosuserAdm.tsx';

import NotificationDropdown from './NotificationDropdown.tsx';


interface AdminBadgeProps {
  nome: string;
  cpf: string;
}


function AdminBadge({ nome, cpf }: AdminBadgeProps) {
  return (
    <div className="user-badge">

      <div className="user-badge-icon">
        <IoPersonSharp className="user-icon" />
      </div>

      <div>
        <p className="user-name">
          Nome: {nome}
        </p>

        <p className="user-cpf">
          CPF: {cpf}
        </p>
      </div>

    </div>
  );
}


interface HeaderProps {
  greeting?: string;
  onMenuClick: () => void;
}


export default function Header({
    greeting = 'Olá',
    onMenuClick,
}: HeaderProps) {

    const admin = useDadosAdmin();

    const [showNotifications, setShowNotifications] =
        useState(false);

    const firstName = admin.nome.split(' ')[0];

    const secondName =
        admin.nome.split(' ')[1] || '';

    return (
        <header className="header">

            <div className="header-left">

                <button
                    onClick={onMenuClick}
                    className="menu-button"
                >
                    <HiMiniBars3 className="menu-icon" />
                </button>

                <h1 className="header-title">
                    {greeting},{' '}

                    <span className="header-user-highlight">
                        {firstName} {secondName}!
                    </span>
                </h1>

            </div>


            <div className="header-right">

                <AdminBadge
                    nome={admin.nome}
                    cpf={admin.cpf}
                />

                <div
                    className="notification-wrapper"
                    onMouseEnter={() =>
                        setShowNotifications(true)
                    }
                    onMouseLeave={() =>
                        setShowNotifications(false)
                    }
                >

                    <button className="notification-button">
                        <FaBell className="notification-icon" />
                    </button>

                    {showNotifications && (
                        <NotificationDropdown />
                    )}

                </div>

            </div>

        </header>
    );
}