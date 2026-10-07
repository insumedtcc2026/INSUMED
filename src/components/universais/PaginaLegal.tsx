import '../../css/universais/PaginasLegais.css';

import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

import logo from '../../assets/home/Logo.png';
import BotaoVoltar from './BotaoVoltar';
import Footer from './Footer';
import { DATA_ATUALIZACAO } from './dadosLegais';

export interface SecaoLegal {
  id: string;
  titulo: string;
  conteudo: ReactNode;
}

interface PaginaLegalProps {
  titulo: string;
  resumo: string;
  secoes: SecaoLegal[];
}

const documentos = [
  { path: '/termos', label: 'Termos de Uso' },
  { path: '/privacidade', label: 'Política de Privacidade' },
  { path: '/seguranca', label: 'Segurança de Dados' },
];

/**
 * Layout padrão das páginas jurídicas (Termos de Uso, Política de
 * Privacidade e Segurança de Dados). Página pública: não exige login.
 */
export default function PaginaLegal({ titulo, resumo, secoes }: PaginaLegalProps) {
  const location = useLocation();

  return (
    <div className="pagina-legal">
      <header className="legal-topo">
        <div className="legal-topo-conteudo">
          <BotaoVoltar para="/" />

          <a href="/" className="legal-logo-link">
            <img src={logo} alt="INSUMED" className="legal-logo" />
          </a>
        </div>
      </header>

      <section className="legal-hero">
        <div className="legal-hero-conteudo">
          <span className="legal-selo">
            <ShieldCheck size={16} strokeWidth={2.5} />
            LGPD · Lei nº 13.709/2018
          </span>

          <h1>{titulo}</h1>

          <p className="legal-resumo">{resumo}</p>

          <p className="legal-atualizacao">
            Última atualização: {DATA_ATUALIZACAO}
          </p>

          <nav className="legal-abas" aria-label="Documentos jurídicos">
            {documentos.map((doc) => (
              <Link
                key={doc.path}
                to={doc.path}
                className={`legal-aba ${
                  location.pathname === doc.path ? 'legal-aba-ativa' : ''
                }`}
              >
                {doc.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <main className="legal-corpo">
        <aside className="legal-sumario">
          <p className="legal-sumario-titulo">Nesta página</p>
          <ol>
            {secoes.map((secao) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`}>{secao.titulo}</a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="legal-artigo">
          {secoes.map((secao, indice) => (
            <section key={secao.id} id={secao.id} className="legal-secao">
              <h2>
                <span className="legal-numero">{indice + 1}</span>
                {secao.titulo}
              </h2>
              <div className="legal-texto">{secao.conteudo}</div>
            </section>
          ))}

          <p className="legal-aviso">
            Este documento foi elaborado como parte do Trabalho de Conclusão de
            Curso INSUMED, com base na Lei Geral de Proteção de Dados Pessoais
            (Lei nº 13.709/2018), no Marco Civil da Internet (Lei nº
            12.965/2014) e na documentação do projeto. Antes do uso em produção
            com pacientes reais, ele deve ser revisado por um profissional
            jurídico e pela instituição de saúde responsável pelo serviço.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
