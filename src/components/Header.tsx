import { Menu, Bell, User } from 'lucide-react';

interface UserBadgeProps {
  name: string;
  cpf: string;
}

function UserBadge({ name, cpf }: UserBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-700 to-blue-500 px-5 py-3 text-white shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
        <User className="h-6 w-6" />
      </div>

      <div>
        <p className="text-sm font-medium leading-tight">{name}</p>
        <p className="text-xs opacity-90">CPF: {cpf}</p>
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

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="text-gray-800 transition hover:text-blue-600"
        >
          <Menu className="h-8 w-8" />
        </button>

        <h1 className="text-4xl font-light text-black">
          {greeting},{' '}
          <span className="font-normal text-blue-600">
            {firstName} {secondName}!
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <UserBadge name={userName} cpf={userCpf} />

        <button className="text-black transition hover:text-blue-600">
          <Bell className="h-8 w-8" />
        </button>
      </div>
    </header>
  );
}