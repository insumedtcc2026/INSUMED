import '../css/Header.css';
import { FaBell } from 'react-icons/fa';
import { HiMiniBars3 } from 'react-icons/hi2';
import { IoPersonSharp } from 'react-icons/io5';
import { useState } from 'react';

import NotificationDropdown from './NotificationDropdown';

interface UserBadgeProps {
  name: string;
  cpf: string;
}

function UserBadge({ name, cpf }: UserBadgeProps) {
  return (
    <div className="user-badge">
      <div className="user-badge-icon">
        <IoPersonSharp className="user-icon" />
      </div>

      <div>
        <p className="user-name">{name}</p>
        <p className="user-cpf">CPF: {cpf}</p>
      </div>
    </div>
  );
}

interface HeaderProps {
  userName?: string;
  userCpf?: string;
  greeting?: string;
  onMenuClick?: () => void;
}

export default function Header({
  userName = 'Usuário Paciente da Silva',
  userCpf = '123.456.789-10',
  greeting = 'Olá',
  onMenuClick,
}: HeaderProps) {
  const firstName = userName.split(' ')[0];
  const secondName = userName.split(' ')[1] || '';

  const [showNotifications, setShowNotifications] =
    useState(false);

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
        <UserBadge
          name={userName}
          cpf={userCpf}
        />

        <div
          className="notification-wrapper"
          onMouseEnter={() => setShowNotifications(true)}
          onMouseLeave={() => setShowNotifications(false)}
        >
          <button className="notification-button">
            <FaBell className="notification-icon" />
          </button>

          {showNotifications && <NotificationDropdown />}
        </div>
      </div>
    </header>
  );
}