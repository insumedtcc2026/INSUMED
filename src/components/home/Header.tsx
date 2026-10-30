import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import '../../css/home/Header.css';
import logo from '../../assets/home/Logo.webp';
import { rolarAte } from '../../hook/useRolagemSuave';

// Seções da própria home (ids em pages/HomeHome.tsx). Antes eram "Sobre"
// (página que exige login) e links externos do Instagram e do YouTube,
// que continuam no rodapé.
const secoes = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'aplicativo', label: 'Aplicativo' },
  { id: 'onde-estamos', label: 'Onde estamos' },
  { id: 'duvidas', label: 'Dúvidas' },
];

// Rolagem suave até a seção; quem pediu "reduzir movimento" no sistema
// vai direto. O foco vai junto, para teclado e leitor de tela.
function irParaSecao(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  const alvo = document.getElementById(id);
  if (!alvo) return;
  e.preventDefault();
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // com a rolagem com inércia ligada, ela mesma leva até a seção
  // (110px = espaço do header, igual ao scroll-margin-top das seções)
  if (!rolarAte(alvo, -110)) alvo.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' });
  alvo.focus({ preventScroll: true });
  window.history.replaceState(null, '', `#${id}`);
}
 
const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Controla o estilo compacto do header (sua classe .scrolled original)
      setScrolled(currentScrollY > 10);

      // 2. Controla o desaparecimento/aparecimento baseado na direção
      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        // Se rolar para BAIXO e passou de 150px, esconde
        setVisible(false);
      } else {
        // Se rolar para CIMA, mostra novamente
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  // Combinando as classes base, modificadores de scroll e modificadores de visibilidade
  const headerClassNames = [
    "insumed-header",
    scrolled ? "scrolled" : "",
    visible ? "header--show" : "header--hide"
  ].filter(Boolean).join(" ");

  return (
    <header className={headerClassNames}>
      <div className="header-inner">
        <a href="/" className="header-logo">
          <img src={logo} alt="Insumed" className="logo-image" />
        </a>
 
        <nav className="header-nav">
          {secoes.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className="nav-link" onClick={(e) => irParaSecao(e, id)}>
              {label}
            </a>
          ))}
        </nav>
 
        <Link to="/login" className="header-cta">
          Entrar
        </Link>
      </div>
    </header>
  );
};
 
export default Header;
