import '../../css/universais/Footer.css';
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';

import logo from '../../assets/logo-footer.png';

interface FooterLink {
  label: string;
  href: string;
}

const linksPaciente: FooterLink[] = [
  { label: 'Início', href: '/home' },
  { label: 'Agendamentos', href: '/agendamentos' },
  { label: 'Pontos de Coleta', href: '/pontos-coleta' },
  { label: 'Enviar Prescrições', href: '/EnviarSolicitacao' },
  { label: 'Perfil', href: '/perfil' },
];

const linksAdministrador: FooterLink[] = [
  { label: 'Início', href: '/HomeAdmin' },
  { label: 'Agendamentos', href: '/Agendamentosadm' },
  { label: 'Histórico de Prescrições', href: '/Historicodaprescricao' },
  { label: 'Histórico', href: '/Historicoadm' },
  { label: 'Solicitações', href: '/VerSolicitaçoes' },
  { label: 'Novo Agendamento', href: '/NovoAgendamento' },
  { label: 'Pacientes', href: '/Pacientesadm' },
  { label: 'Todos os Agendamentos', href: '/TodosAgendamentos' },
];

function usuarioAdministrador(): boolean {
  if (localStorage.getItem('tipo') === 'ADMIN') {
    return true;
  }

  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario?.tipo === 'ADMIN';
  } catch {
    return false;
  }
}

export default function Footer() {
  const linksPrincipais = usuarioAdministrador()
    ? linksAdministrador
    : linksPaciente;

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
            {linksPrincipais.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
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