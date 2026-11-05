import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://insumed-navy.vercel.app';

const PAGINAS_INDEXAVEIS: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'INSUMED | Gestão e retirada de insumos médicos',
    description:
      'O INSUMED ajuda pacientes e unidades de saúde a organizar prescrições, acompanhar solicitações e agendar a retirada de insumos médicos.',
  },
  '/termos': {
    title: 'Termos de Uso | INSUMED',
    description:
      'Conheça as regras de uso do INSUMED, sistema para organizar solicitações e agendamentos de retirada de insumos para a saúde.',
  },
  '/privacidade': {
    title: 'Política de Privacidade | INSUMED',
    description:
      'Saiba como o INSUMED trata dados pessoais e informações de saúde de acordo com a legislação brasileira.',
  },
  '/seguranca': {
    title: 'Segurança de Dados | INSUMED',
    description:
      'Conheça as medidas de segurança e as orientações para proteger seus dados ao usar o INSUMED.',
  },
};

function definirMeta(seletor: string, atributo: 'name' | 'property', chave: string, valor: string) {
  let elemento = document.head.querySelector<HTMLMetaElement>(seletor);
  if (!elemento) {
    elemento = document.createElement('meta');
    elemento.setAttribute(atributo, chave);
    document.head.appendChild(elemento);
  }
  elemento.content = valor;
}

export default function SeoMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const caminho = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const pagina = PAGINAS_INDEXAVEIS[caminho];

    document.title = pagina?.title ?? 'INSUMED';
    definirMeta(
      'meta[name="description"]',
      'name',
      'description',
      pagina?.description ?? 'Acesse sua conta INSUMED.',
    );
    definirMeta('meta[name="robots"]', 'name', 'robots', pagina ? 'index,follow' : 'noindex,follow');
    definirMeta(
      'meta[property="og:title"]',
      'property',
      'og:title',
      pagina?.title ?? 'INSUMED',
    );
    definirMeta(
      'meta[property="og:description"]',
      'property',
      'og:description',
      pagina?.description ?? 'Acesse sua conta INSUMED.',
    );
    definirMeta(
      'meta[property="og:url"]',
      'property',
      'og:url',
      new URL(caminho, SITE_URL).href,
    );
    definirMeta(
      'meta[name="twitter:title"]',
      'name',
      'twitter:title',
      pagina?.title ?? 'INSUMED',
    );
    definirMeta(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description',
      pagina?.description ?? 'Acesse sua conta INSUMED.',
    );

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (pagina) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = new URL(caminho, SITE_URL).href;
    } else {
      canonical?.remove();
    }
  }, [pathname]);

  return null;
}
