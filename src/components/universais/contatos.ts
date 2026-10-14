// Contatos e redes sociais oficiais do Insumed, usados nos rodapés.
// Os números do WhatsApp ficam "por trás" dos links de atendimento
// (Central de Ajuda, Fale Conosco, Suporte), sem exibir o número.

export interface LinkExterno {
  label: string;
  href: string;
  // texto para leitores de tela (diz para onde o link leva)
  ariaLabel: string;
}

export const linksAtendimento: LinkExterno[] = [
  {
    label: 'Central de Ajuda',
    href: 'https://wa.me/5524981357165',
    ariaLabel: 'Central de Ajuda pelo WhatsApp (abre em nova aba)',
  },
  {
    label: 'Fale Conosco',
    href: 'https://wa.me/5524981758970',
    ariaLabel: 'Fale Conosco pelo WhatsApp (abre em nova aba)',
  },
  {
    label: 'Suporte',
    href: 'https://wa.me/5524998732914',
    ariaLabel: 'Suporte pelo WhatsApp (abre em nova aba)',
  },
];

export const redesSociais = {
  instagram: 'https://instagram.com/lucasliberatto?obrf=MTR0bG9mNTltbGtrZw%3D%3D&utm_source=qr',
  youtube: 'https://www.youtube.com/@Insumed-y7h',
  linkedin: 'https://www.linkedin.com/in/lucas-liberatto/?locale=pt-BR',
};

// Abertura externa segura: nova aba sem acesso ao window.opener
export const propsLinkExterno = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;
