import '../../css/universais/Footer.css';
import { useLocation } from 'react-router-dom';
import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';

import logo from '../../assets/logo-footer.webp';
import { linksAtendimento, propsLinkExterno, redesSociais } from './contatos';

interface FooterLink {
  label: string;
  href: string;
}

const linksPaciente: FooterLink[] = [
  { label: 'Início', href: '/home' },
  { label: 'Agendamentos', href: '/agendamentos' },
  { label: 'Minhas prescrições', href: '/prescricoes' },
  { label: 'Pontos de Coleta', href: '/pontos-coleta' },
  { label: 'Enviar Prescrições', href: '/EnviarSolicitacao' },
  { label: 'Perfil', href: '/perfil' },
];

// Só rotas que existem no App.tsx (as antigas /Historicoadm e
// /TodosAgendamentos levavam a uma página em branco).
const linksAdministrador: FooterLink[] = [
  { label: 'Início', href: '/HomeAdmin' },
  { label: 'Agendamentos', href: '/Agendamentosadm' },
  { label: 'Coletas de hoje', href: '/coletas-hoje' },
  { label: 'Solicitações', href: '/VerSolicitaçoes' },
  { label: 'Histórico de Prescrições', href: '/Historicodaprescricao' },
  { label: 'Insumos', href: '/insumos' },
  { label: 'Pacientes', href: '/Pacientesadm' },
  { label: 'Atividades da unidade', href: '/atividades' },
];

const linksAutorizador: FooterLink[] = [
  { label: 'Início', href: '/homeaut' },
  { label: 'Prescrições para análise', href: '/verprescricoesaprovadas' },
];

const rotasAdministrador = [
  '/homeadmin',
  '/agendamentosadm',
  '/novoagendamento',
  '/pacientesadm',
  '/versolicitaçoes',
  '/historicodaprescricao',
  '/administrador/',
  '/coletas-hoje',
  '/perfil-admin',
  '/atividades',
];

const rotasAutorizador = ['/homeaut', '/verprescricoesaprovadas', '/autorizador/', '/perfil-autorizador'];

// O perfil é deduzido pela página em que o rodapé aparece (antes ele lia
// as chaves "tipo"/"usuario", que o login não grava mais, e o admin via
// os links do paciente).
function linksDaPagina(pathname: string): FooterLink[] {
  let caminho = pathname.toLowerCase();
  try {
    caminho = decodeURIComponent(caminho);
  } catch {
    /* mantém o caminho como veio */
  }

  const comeca = (rotas: string[]) => rotas.some((r) => caminho.startsWith(r));

  if (comeca(rotasAutorizador)) return linksAutorizador;
  // "/insumos" (minúsculo) é o fluxo de estoque do admin
  if (comeca(rotasAdministrador) || pathname === '/insumos') return linksAdministrador;
  return linksPaciente;
}

export default function Footer() {
  const { pathname } = useLocation();
  const linksPrincipais = linksDaPagina(pathname);

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
          <nav className="footer-column" aria-label="Navegação">
            <p className="footer-column-titulo">Navegação</p>
            {linksPrincipais.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="footer-column">
            <p className="footer-column-titulo">Atendimento</p>
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
            <a href="/sobre">Sobre</a>
          </div>

          <div className="footer-column">
            <p className="footer-column-titulo">Jurídico</p>
            <a href="/termos">Termos de Uso</a>
            <a href="/privacidade">Política de Privacidade</a>
            <a href="/seguranca">Segurança de Dados</a>
          </div>

          <div className="footer-social">
            <p className="footer-column-titulo">Redes sociais</p>
            <a
              href={redesSociais.instagram}
              aria-label="Instagram do Insumed (abre em nova aba)"
              {...propsLinkExterno}
            >
              <FaInstagram size={18} aria-hidden="true" />
              Instagram
            </a>

            <a
              href={redesSociais.linkedin}
              aria-label="LinkedIn do Insumed (abre em nova aba)"
              {...propsLinkExterno}
            >
              <FaLinkedinIn size={18} aria-hidden="true" />
              LinkedIn
            </a>

            <a
              href={redesSociais.youtube}
              aria-label="YouTube do Insumed (abre em nova aba)"
              {...propsLinkExterno}
            >
              <FaYoutube size={18} aria-hidden="true" />
              YouTube
            </a>
          </div>
        </div>
      </div>

      <div className="footer-base">
        <p>© {new Date().getFullYear()} INSUMED. Todos os direitos reservados.</p>
        <p>
          Seus dados são tratados conforme a LGPD (Lei nº 13.709/2018).
        </p>
      </div>
    </footer>
  );
}
