import '../../css/universais/Header.css';
import { FaBell } from 'react-icons/fa';
import { HiMiniBars3 } from 'react-icons/hi2';
import { IoPersonSharp } from 'react-icons/io5';
import { useState } from 'react';
import { useDadosUser } from '../../hook/Dadosuser.tsx';

import NotificationDropdown from './NotificationDropdown.tsx';

interface UserBadgeProps {
  nome: string;
  cpf: string;
}

function UserBadge({ nome, cpf }: UserBadgeProps) {
  return (
    <div className="user-badge">
      <div className="user-badge-icon">
        <IoPersonSharp className="user-icon" />
      </div>

      <div>
        <p className="user-name">Nome : {nome}</p>
        <p className="user-cpf">CPF: {cpf}</p>
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
 
const user = useDadosUser();
const [showNotifications, setShowNotifications] = useState(false);


  const firstName = user.nome.split(' ')[0];
  const secondName = user.nome.split(' ')[1] || ''; // Nao ta sendo Usado, mas caso queira usar o segundo nome, ele está aqui.

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
          nome={user.nome}
          cpf={user.cpf}
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