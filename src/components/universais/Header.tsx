import '../../css/universais/Header.css';
import { FaBell } from 'react-icons/fa';
import { HiMiniBars3 } from 'react-icons/hi2';
import { IoPersonSharp } from 'react-icons/io5';
import { useEffect, useRef, useState } from 'react';
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

  // Controla se o header deve ficar escondido (rolando pra baixo)
  const [hidden, setHidden] = useState(false);

  // Guarda a última posição de scroll conhecida entre renders
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      // Distância mínima de scroll pra evitar "tremedeira" com pequenos movimentos
      const delta = currentScrollY - lastScrollY.current;
      const threshold = 8;

      if (Math.abs(delta) < threshold) {
        return;
      }

      // Só esconde depois de passar da altura do próprio header,
      // pra não sumir logo no topo da página
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Rolando pra baixo
        setHidden(true);
        setShowNotifications(false); // fecha o dropdown se estiver aberto
      } else {
        // Rolando pra cima
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const firstName = user.nome.split(' ')[0];
  const secondName = user.nome.split(' ')[1] || ''; // Nao ta sendo Usado, mas caso queira usar o segundo nome, ele está aqui.

  return (
    <header className={`header ${hidden ? 'header-hidden' : ''}`}>
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