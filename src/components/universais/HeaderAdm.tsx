import '../../css/universais/Header.css';
import '../../css/universais/LayoutAdmin.css';

import { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiMiniBars3 } from 'react-icons/hi2';
import { ChevronRight, MapPin } from 'lucide-react';

import { useDadosAdmin } from '../../hook/DadosuserAdm.tsx';
import { useContadoresAdmin } from '../../hook/useContadoresAdmin';
import SinoNotificacoes from './SinoNotificacoes.tsx';
import { UserBadge } from './Header.tsx';
import { nomeCurto } from '../../utils/nome';
import { trilhaAdmin } from './menuAdmin';

interface HeaderProps {
  // mantido por compatibilidade com as páginas que ainda passam a saudação
  greeting?: string;
  onMenuClick: () => void;
}

/**
 * Barra superior do administrador, no mesmo padrão da do paciente:
 * "Olá, nome!" e a data à esquerda; a unidade (com o cargo), a cápsula
 * com nome e CPF e o sino à direita. A trilha (Início › Solicitações)
 * fica logo abaixo da barra, já dentro da página.
 */
export default function Header({ greeting = 'Olá', onMenuClick }: HeaderProps) {
  const admin = useDadosAdmin();
  const contadores = useContadoresAdmin();
  const { pathname } = useLocation();
  const trilha = trilhaAdmin(pathname);
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // com trilha, as páginas descem um pouco para ela caber abaixo da barra
  const comTrilha = trilha.length > 0;
  useEffect(() => {
    document.body.classList.toggle('adm-com-trilha', comTrilha);
    return () => document.body.classList.remove('adm-com-trilha');
  }, [comTrilha]);

  return (
    <>
      <header className="header adm-topo">
        <div className="header-left adm-topo-esq">
          <button onClick={onMenuClick} className="menu-button adm-topo-menu" aria-label="Abrir ou fechar o menu">
            <HiMiniBars3 className="menu-icon" aria-hidden="true" />
          </button>
          <div className="adm-saudacao">
            <h1 className="header-title">
              {greeting}, <span className="header-user-highlight">{nomeCurto(admin.nome)}!</span>
            </h1>
            <p className="adm-data">{hoje}</p>
          </div>
        </div>

        <div className="header-right adm-topo-dir">
          {contadores?.unidade && (
            <span className="adm-unidade" title="Unidade">
              <MapPin aria-hidden="true" size={16} />
              <span className="adm-unidade-texto">
                <strong>{contadores.unidade}</strong>
                <small>Administrador</small>
              </span>
            </span>
          )}
          <UserBadge nome={admin.nome} cpf={admin.cpf} />
          <SinoNotificacoes perfil="ADMIN" />
        </div>
      </header>

      {comTrilha && (
        <nav aria-label="Você está em" className="adm-trilha">
          <div className="adm-trilha-conteudo">
            {trilha.map((parte, i) => (
              <Fragment key={parte.rotulo}>
                {i > 0 && <ChevronRight aria-hidden="true" size={14} />}
                {i === trilha.length - 1 ? (
                  <strong aria-current="page">{parte.rotulo}</strong>
                ) : parte.caminho ? (
                  <Link to={parte.caminho}>{parte.rotulo}</Link>
                ) : (
                  <span>{parte.rotulo}</span>
                )}
              </Fragment>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
