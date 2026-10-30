import '../css/universais/MaisOpcoes.css';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, HelpCircle, LogOut, ShieldCheck } from 'lucide-react';

import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import HeaderAdm from '../components/universais/HeaderAdm';
import Sidebaradm from '../components/universais/Siderbaradm';
import HeaderAut from '../components/universais/HeaderAut';
import SidebarAut from '../components/universais/SidebarAut';
import { useValidarToken } from '../hook/Validartoken';
import { MENUS } from '../components/universais/menusCelular';
import { linksAtendimento, propsLinkExterno } from '../components/universais/contatos';
import { sairDoPerfil, type Perfil } from '../components/universais/sessao';

const TOPO: Record<Perfil, { Cabecalho: typeof Header; Menu: typeof Sidebar }> = {
  PACIENTE: { Cabecalho: Header, Menu: Sidebar },
  ADMIN: { Cabecalho: HeaderAdm, Menu: Sidebaradm },
  AUTORIZADOR: { Cabecalho: HeaderAut, Menu: SidebarAut },
};

/**
 * "Mais" do celular como página (antes era uma folha que subia do rodapé):
 * as páginas que não cabem na barra, a ajuda, os links legais e o "Sair".
 */
export default function MaisOpcoes({ perfil }: { perfil: Perfil }) {
  const { verificando } = useValidarToken(perfil);
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const { Cabecalho, Menu } = TOPO[perfil];
  const paginas = MENUS[perfil].mais;

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Carregando...</p>
      </div>
    );
  }

  function sair() {
    sairDoPerfil(perfil);
    navigate('/login');
  }

  return (
    <div className={`${perfil === 'PACIENTE' ? 'pagina-paciente ' : ''}min-h-screen bg-gray-50`}>
      <Menu isOpen={menuAberto} onClose={() => setMenuAberto((v) => !v)} />
      <Cabecalho onMenuClick={() => setMenuAberto((v) => !v)} />

      <main id="conteudo" className="mais-pagina compensa-header">
        <h1 className="mais-titulo">Mais opções</h1>

        {paginas.length > 0 && (
          <section aria-labelledby="mais-paginas">
            <h2 id="mais-paginas" className="mais-secao">Páginas</h2>
            <ul className="mais-grupo">
              {paginas.map(({ label, path, icon: Icone }) => (
                <li key={path}>
                  <Link to={path} className="mais-item">
                    <span className="mais-item__icone">
                      <Icone aria-hidden={true} />
                    </span>
                    <span className="mais-item__texto">{label}</span>
                    <ChevronRight className="mais-item__seta" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="mais-ajuda">
          <h2 id="mais-ajuda" className="mais-secao">Ajuda e informações</h2>
          <ul className="mais-grupo">
            {linksAtendimento.map((link) => (
              <li key={link.href}>
                <a href={link.href} aria-label={link.ariaLabel} {...propsLinkExterno} className="mais-item">
                  <span className="mais-item__icone">
                    <HelpCircle aria-hidden="true" />
                  </span>
                  <span className="mais-item__texto">{link.label}</span>
                  <ChevronRight className="mais-item__seta" aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <Link to="/termos" className="mais-item">
                <span className="mais-item__icone">
                  <ShieldCheck aria-hidden="true" />
                </span>
                <span className="mais-item__texto">Termos, privacidade e segurança</span>
                <ChevronRight className="mais-item__seta" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </section>

        <ul className="mais-grupo mais-grupo--sair">
          <li>
            <button type="button" onClick={sair} className="mais-item mais-item--sair">
              <span className="mais-item__icone">
                <LogOut aria-hidden="true" />
              </span>
              <span className="mais-item__texto">Sair da conta</span>
            </button>
          </li>
        </ul>
      </main>
    </div>
  );
}
