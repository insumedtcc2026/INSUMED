import '../../css/universais/NavInferior.css';

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

import { MENUS, PAGINA_MAIS, estaAtivo, perfilDaRota } from './menusCelular';

/**
 * Navegação do celular (até 768px) para os três perfis, no lugar do menu
 * lateral e do rodapé. Os itens mais usados ficam na barra; os demais,
 * a ajuda, os links legais e o "Sair" ficam na página "Mais".
 */
export default function NavInferior() {
  const { pathname } = useLocation();
  const perfil = perfilDaRota(pathname);

  // reserva espaço no fim da página para a barra não cobrir o conteúdo
  useEffect(() => {
    if (!perfil) return;
    document.body.classList.add('com-nav-inferior');
    return () => document.body.classList.remove('com-nav-inferior');
  }, [perfil]);

  if (!perfil) return null;

  const menu = MENUS[perfil];
  const paginaMais = PAGINA_MAIS[perfil];
  // "Mais" fica aceso na própria página e nas páginas que só estão nela
  const maisAtivo =
    pathname.toLowerCase() === paginaMais || menu.mais.some((i) => estaAtivo(i, pathname));

  return (
    <nav className="nav-inferior" aria-label="Navegação principal">
      {menu.principais.map((item) => {
        const ativo = estaAtivo(item, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-inferior-item ${ativo ? 'nav-inferior-item-ativo' : ''}`}
            aria-current={ativo ? 'page' : undefined}
          >
            <Icon className="nav-inferior-icone" aria-hidden={true} />
            <span className="nav-inferior-texto">{item.label}</span>
          </Link>
        );
      })}

      <Link
        to={paginaMais}
        className={`nav-inferior-item ${maisAtivo ? 'nav-inferior-item-ativo' : ''}`}
        aria-current={pathname.toLowerCase() === paginaMais ? 'page' : undefined}
      >
        <MoreHorizontal className="nav-inferior-icone" aria-hidden={true} />
        <span className="nav-inferior-texto">Mais</span>
      </Link>
    </nav>
  );
}
