import React from "react";
import "../../css/home/Footer.css";
import logo from "../../assets/home/logopb.png";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
 
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <img src={logo} alt="Insumed Logo" className="footer__logo" />
          <p className="footer__description">
            Soluções digitais para gestão de insumos, agendamentos e comunicação em saúde.
          </p>
          <div className="footer__socials">
            <a href="#" aria-label="Instagram" className="footer__social-link">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Facebook" className="footer__social-link">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="LinkedIn" className="footer__social-link">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="YouTube" className="footer__social-link">
              <FaYoutube />
            </a>
          </div>
        </div>
 
        <div className="footer__groups">
          <nav className="footer__nav" aria-label="Suporte">
            <span className="footer__nav-title">Suporte</span>
            <a href="#" className="footer__link">Central de Ajuda</a>
            <a href="#" className="footer__link">Perguntas Frequentes (FAQ)</a>
            <a href="#" className="footer__link">Fale Conosco</a>
            <a href="#" className="footer__link">Suporte</a>
          </nav>

          <nav className="footer__nav" aria-label="Legal">
            <span className="footer__nav-title">Legal</span>
            <a href="#" className="footer__link">Termos de Uso</a>
            <a href="#" className="footer__link">Política de Privacidade</a>
            <a href="#" className="footer__link">Segurança de Dados</a>
          </nav>
        </div>
      </div>
 
      {/* Brand name bar */}
      <div className="footer__wordmark" aria-hidden="true">
        INSUMED
      </div>
    </footer>
  );
};
 
export default Footer;