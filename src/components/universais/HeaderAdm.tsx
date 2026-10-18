import '../../css/universais/Header.css';

import { HiMiniBars3 } from 'react-icons/hi2';
import { IoPersonSharp } from 'react-icons/io5';

import { useDadosAdmin } from '../../hook/DadosuserAdm.tsx';

import SinoNotificacoes from './SinoNotificacoes.tsx';
import { nomeCurto } from '../../utils/nome';


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
                        {nomeCurto(admin.nome)}!
                    </span>
                </h1>

            </div>


            <div className="header-right">

                <AdminBadge
                    nome={admin.nome}
                    cpf={admin.cpf}
                />

                <SinoNotificacoes perfil="ADMIN" />

            </div>

        </header>
    );
}