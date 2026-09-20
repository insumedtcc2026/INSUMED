import "../../css/home/Footer.css";
import logo from "../../assets/home/logopb.png";

import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-logo-area">
          <img src={logo} alt="INSUMED" className="footer-logo" />
        </div>

        <div className="footer-icons">
          <FaInstagram />
          <FaFacebookF />
          <FaLinkedinIn />
          <FaYoutube />
        </div>

        <div className="footer-links">
          <div>
            <a href="">Central de Ajuda</a>
            <a href="">Perguntas Frequentes (FAQ)</a>
            <a href="">Fale Conosco</a>
            <a href="">Suporte</a>
          </div>

          <div>
            <a href="">Termos de Uso</a>
            <a href="">Política de Privacidade</a>
            <a href="">Segurança de Dados</a>
          </div>

          <div>
            <a href="">Instagram</a>
            <a href="">Facebook</a>
            <a href="">LinkedIn</a>
            <a href="">YouTube</a>
          </div>
        </div>

      </div>

      <div className="footer-title">
        INSUMED
      </div>

    </footer>
  );
}