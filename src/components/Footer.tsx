import '../css/Footer.css';
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';

import logo from '../assets/logo-footer.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img
            src={logo}
            alt="INSUMED"
            className="footer-logo"
          />
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <a href="/">Início</a>
            <a href="/agendamentos">Agendamentos</a>
            <a href="/meus-insumos">Meus Insumos</a>
            <a href="/pontos-de-coleta">Pontos de Coleta</a>
            <a href="/perfil">Perfil</a>
          </div>

          <div className="footer-column">
            <a href="/ajuda">Central de Ajuda</a>
            <a href="/sobre">Sobre</a>
            <a href="/contato">Fale Conosco</a>
            <a href="/suporte">Suporte</a>
          </div>

          <div className="footer-column">
            <a href="/termos">Termos de Uso</a>
            <a href="/privacidade">Política de Privacidade</a>
            <a href="/seguranca">Segurança de Dados</a>
          </div>

          <div className="footer-social">
            <a href="/">
              <FaInstagram size={18} />
              Instagram
            </a>

            <a href="/">
              <FaFacebookF size={18} />
              Facebook
            </a>

            <a href="/">
              <FaLinkedinIn size={18} />
              LinkedIn
            </a>

            <a href="/">
              <FaYoutube size={18} />
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}