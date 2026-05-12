import logo from '../assets/logo.png';
import {
  Home,
  CalendarDays,
  Pill,
  MapPin,
  CircleUserRound,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'Início', active: true },
    { icon: CalendarDays, label: 'Agendamentos' },
    { icon: Pill, label: 'Meus Insumos' },
    { icon: MapPin, label: 'Pontos de Coleta' },
    { icon: CircleUserRound, label: 'Perfil' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 transform bg-white p-6 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <img
      src={logo}
      alt="Logo Insumed"
      className="h-12 w-auto"
    />
    <h2 className="text-3xl font-bold text-blue-700">INSUMED</h2>
  </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="space-y-3">
          {menuItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
                active
                  ? 'bg-gradient-to-r from-blue-700 to-sky-400 text-white shadow-lg'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-2xl font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}