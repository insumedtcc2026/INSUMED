import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import '../../css/home/Header.css';
import logo from '../../assets/home/Logo.png';
 
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
          <Link to="/sobre" className="nav-link">Sobre</Link>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="nav-link">
            Instagram
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="nav-link">
            Youtube
          </a>
        </nav>
 
        <Link to="/login" className="header-cta">
          Entrar
        </Link>
      </div>
    </header>
  );
};
 
export default Header;