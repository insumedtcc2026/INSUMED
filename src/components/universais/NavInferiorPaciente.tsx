import '../../css/universais/AppPaciente.css';

import { Link, useLocation } from 'react-router-dom';

import { Upload } from 'lucide-react';
import { MdAddLocation } from 'react-icons/md';
import { BsCalendarCheckFill } from 'react-icons/bs';
import { GoHomeFill } from 'react-icons/go';

/**
 * Barra de navegação inferior no estilo aplicativo.
 * Aparece somente no celular (até 768px) e somente nas páginas do paciente,
 * seguindo o protótipo do Figma. Usa os mesmos caminhos do Sidebar.
 */
const itens = [
  { icon: GoHomeFill, label: 'Início', path: '/home' },
  { icon: BsCalendarCheckFill, label: 'Agenda', path: '/agendamentos' },
  { icon: Upload, label: 'Enviar', path: '/EnviarSolicitacao' },
  { icon: MdAddLocation, label: 'Coletas', path: '/pontos-coleta' },
];

export default function NavInferiorPaciente() {
  const location = useLocation();
  const atual = location.pathname.toLowerCase();

  return (
    <nav className="nav-inferior-paciente" aria-label="Navegação principal">
      {itens.map(({ icon: Icon, label, path }) => {
        const ativo = atual === path.toLowerCase();

        return (
          <Link
            key={path}
            to={path}
            className={`nav-inferior-item ${ativo ? 'nav-inferior-item-ativo' : ''}`}
            aria-current={ativo ? 'page' : undefined}
          >
            <Icon className="nav-inferior-icone" />
            <span className="nav-inferior-texto">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
