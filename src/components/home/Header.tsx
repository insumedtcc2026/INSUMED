
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import '../../css/home/Header.css';
import logo from '../../assets/home/Logo.png';
 
const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
 
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  return (
    <header className={`insumed-header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        <a href="/" className="header-logo">
          <img src={logo} alt="Insumed" className="logo-image" />
        </a>
 
        <nav className="header-nav">
          <Link to="/sobre" className="nav-link">Sobre</Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            Instagram
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            Youtube
          </a>
        </nav>
 
        <Link to="/home" className="header-cta">
          Entrar
        </Link>
      </div>
    </header>
  );
};
 
export default Header;