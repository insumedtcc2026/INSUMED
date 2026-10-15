import "../../css/home/Footer.css";
import logo from "../../assets/home/logopb.webp";

import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

import {
  linksAtendimento,
  propsLinkExterno,
  redesSociais,
} from "../universais/contatos";

// Rodapé da página inicial pública. A classe "footer-home" isola estes
// estilos do rodapé das páginas logadas (os dois usam a classe "footer").
export default function Footer() {
  const redes = [
    { nome: "Instagram", href: redesSociais.instagram, Icone: FaInstagram },
    { nome: "LinkedIn", href: redesSociais.linkedin, Icone: FaLinkedinIn },
    { nome: "YouTube", href: redesSociais.youtube, Icone: FaYoutube },
  ];

  return (
    <footer className="footer footer-home">

      <div className="footer-top">

        <div className="footer-logo-area">
          <img src={logo} alt="INSUMED" className="footer-logo" />
        </div>

        <div className="footer-icons">
          {redes.map(({ nome, href, Icone }) => (
            <a
              key={nome}
              href={href}
              aria-label={`${nome} do Insumed (abre em nova aba)`}
              {...propsLinkExterno}
            >
              <Icone aria-hidden="true" />
            </a>
          ))}
        </div>

        <div className="footer-links">
          <div>
            <span className="footer-links-titulo">Atendimento</span>
            {linksAtendimento.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-label={link.ariaLabel}
                {...propsLinkExterno}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <span className="footer-links-titulo">Jurídico</span>
            <a href="/termos">Termos de Uso</a>
            <a href="/privacidade">Política de Privacidade</a>
            <a href="/seguranca">Segurança de Dados</a>
          </div>

          <div>
            <span className="footer-links-titulo">Redes sociais</span>
            {redes.map(({ nome, href }) => (
              <a
                key={nome}
                href={href}
                aria-label={`${nome} do Insumed (abre em nova aba)`}
                {...propsLinkExterno}
              >
                {nome}
              </a>
            ))}
          </div>
        </div>

      </div>

      <div className="footer-title" aria-hidden="true">
        INSUMED
      </div>

    </footer>
  );
}
