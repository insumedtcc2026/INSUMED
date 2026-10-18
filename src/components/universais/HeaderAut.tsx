import '../../css/universais/Header.css';

import { HiMiniBars3 } from 'react-icons/hi2';
import { IoPersonSharp } from 'react-icons/io5';

import { useDadosAutorizador } from '../../hook/DadosuserAut.tsx';

import SinoNotificacoes from './SinoNotificacoes.tsx';
import { nomeCurto } from '../../utils/nome';


interface AutorizadorBadgeProps {
  nome: string;
  cpf: string;
}


function AutorizadorBadge({ nome, cpf }: AutorizadorBadgeProps) {
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

  const autorizador = useDadosAutorizador();

  return (
    <header className="header">

      <div className="header-left">

        <button
          onClick={onMenuClick}
          className="menu-button"
          aria-label="Abrir menu"
        >
          <HiMiniBars3 className="menu-icon" />
        </button>

        <h1 className="header-title">
          {greeting},{' '}

          <span className="header-user-highlight">
            {nomeCurto(autorizador.nome)}!
          </span>
        </h1>

      </div>


      <div className="header-right">

        <AutorizadorBadge
          nome={autorizador.nome}
          cpf={autorizador.cpf}
        />

        <SinoNotificacoes perfil="AUTORIZADOR" />

      </div>

    </header>
  );
}