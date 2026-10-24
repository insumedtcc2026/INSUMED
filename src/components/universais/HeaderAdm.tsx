import '../../css/universais/Header.css';
import '../../css/universais/LayoutAdmin.css';

import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { HiMiniBars3 } from 'react-icons/hi2';
import { ChevronRight, MapPin } from 'lucide-react';

import { useDadosAdmin } from '../../hook/DadosuserAdm.tsx';
import { useContadoresAdmin } from '../../hook/useContadoresAdmin';
import SinoNotificacoes from './SinoNotificacoes.tsx';
import { iniciais, nomeCurto } from '../../utils/nome';
import { trilhaAdmin } from './menuAdmin';

interface HeaderProps {
  // mantido por compatibilidade com as páginas que ainda passam a saudação
  greeting?: string;
  onMenuClick: () => void;
}

/**
 * Barra superior do administrador: onde a pessoa está (Prescrições ›
 * Solicitações), a unidade, o sino e quem está logado. O CPF saiu do
 * cabeçalho; continua em "Meu perfil".
 */
export default function Header({ onMenuClick }: HeaderProps) {
  const admin = useDadosAdmin();
  const contadores = useContadoresAdmin();
  const { pathname } = useLocation();
  const trilha = trilhaAdmin(pathname);

  return (
    <header className="adm-topo">
      <div className="adm-topo-esq">
        <button onClick={onMenuClick} className="adm-topo-menu" aria-label="Abrir menu">
          <HiMiniBars3 aria-hidden="true" />
        </button>
        {trilha.length > 0 && (
          <nav aria-label="Você está em" className="adm-trilha">
            {trilha.map((parte, i) => (
              <Fragment key={parte}>
                {i > 0 && <ChevronRight aria-hidden="true" size={14} />}
                {i === trilha.length - 1 ? <strong aria-current="page">{parte}</strong> : <span>{parte}</span>}
              </Fragment>
            ))}
          </nav>
        )}
      </div>

      <div className="adm-topo-dir">
        {contadores?.unidade && (
          <span className="adm-unidade" title="Unidade">
            <MapPin aria-hidden="true" size={15} /> {contadores.unidade}
          </span>
        )}
        <SinoNotificacoes perfil="ADMIN" />
        <div className="adm-usuario">
          <span className="adm-usuario-avatar" aria-hidden="true">{iniciais(admin.nome) || 'AD'}</span>
          <span className="adm-usuario-texto">
            <strong>{nomeCurto(admin.nome)}</strong>
            <small>Administrador</small>
          </span>
        </div>
      </div>
    </header>
  );
}
