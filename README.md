# INSUMED

Aplicação web para organizar o processo de solicitação, análise e retirada de insumos de saúde. O INSUMED conecta pacientes às unidades de saúde que utilizam o sistema, permitindo acompanhar prescrições e agendamentos; profissionais da unidade podem administrar cadastros, estoque e atendimentos conforme seu perfil de acesso.

- **Site:** [insumed-navy.vercel.app](https://insumed-navy.vercel.app)
- **Repositório:** [insumedtcc2026/INSUMED](https://github.com/insumedtcc2026/INSUMED)
- **Tipo de projeto:** aplicação frontend React. A API e o banco de dados são serviços separados; este repositório não contém o backend.

## O que o sistema oferece

### Para pacientes

- Criar uma conta e acessar as funcionalidades disponíveis para seu perfil;
- Enviar uma prescrição para análise da unidade de saúde;
- Acompanhar o andamento e o histórico das prescrições;
- Consultar agendamentos de retirada, receber notificações e visualizar comprovantes com QR Code;
- Consultar pontos de coleta, horários e informações para chegar à unidade;
- Solicitar alterações relacionadas a um agendamento, quando essa opção estiver disponível.

### Para administradores de unidades

- Gerenciar pacientes, equipe, horários e atividades da unidade;
- Acompanhar solicitações, prescrições e agendamentos;
- Organizar coletas, separação de insumos e atendimento no balcão;
- Consultar informações necessárias para a operação da unidade.

### Para autorizadores

- Analisar solicitações e prescrições encaminhadas para autorização;
- Consultar prescrições aprovadas e registrar decisões conforme o fluxo do sistema.

As opções disponíveis dependem do perfil, da autenticação e da configuração da unidade. O INSUMED é uma ferramenta de organização e comunicação: não substitui atendimento, diagnóstico nem orientação de profissionais de saúde e não garante a disponibilidade de insumos.

## Tecnologias

- **Frontend:** React 19, TypeScript 6 e Vite 8;
- **Navegação:** React Router;
- **Estilos:** CSS, Tailwind CSS 4 e plugin do Tailwind para Vite;
- **Requisições HTTP:** Axios;
- **Mapas:** Leaflet e React Leaflet;
- **Ícones:** Lucide React, React Icons e Font Awesome;
- **Hospedagem/configuração de rotas:** Vercel.

O frontend consome uma API hospedada separadamente. A URL padrão está configurada em `src/config.ts`; uma URL alternativa pode ser definida pela variável `VITE_API_URL`.

## Requisitos

- Node.js `^20.19.0` ou `>=22.12.0` (conforme o requisito do Vite instalado);
- npm;
- Acesso à API do INSUMED para testar fluxos que dependam de dados do servidor.

## Executar localmente

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/insumedtcc2026/INSUMED.git
   cd INSUMED
   ```

2. Instale as dependências registradas no lockfile:

   ```bash
   npm ci
   ```

3. (Opcional) Para apontar para outra API, crie `.env.local` na raiz:

   ```env
   VITE_API_URL=http://localhost:3344
   ```

   Sem essa variável, o frontend usa a API padrão definida em `src/config.ts`. Reinicie o servidor de desenvolvimento após alterar variáveis de ambiente.

4. Inicie o Vite:

   ```bash
   npm run dev
   ```

   O terminal informa o endereço local, normalmente `http://localhost:5173`.

Não coloque senhas, tokens ou outras credenciais em variáveis `VITE_*`: esses valores podem ser incluídos no código enviado ao navegador. O arquivo `.env.local` é ignorado pelo Git; não compartilhe credenciais nem dados reais de pacientes em ambientes de teste.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite. |
| `npm run build` | Executa a verificação TypeScript e gera a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente a versão gerada em `dist/` para conferência. Execute `npm run build` antes. |
| `npm run lint` | Executa o ESLint no projeto. |

## Organização do código

```text
.
├── public/                 # Arquivos públicos servidos sem processamento
├── src/
│   ├── Administrador/      # Telas e fluxos administrativos
│   ├── Autorizador/        # Telas do perfil autorizador
│   ├── assets/             # Imagens e outros recursos importados
│   ├── components/         # Componentes organizados por área
│   ├── css/                # Estilos das páginas e componentes
│   ├── hook/               # Hooks React compartilhados
│   ├── pages/              # Páginas e telas do paciente e institucionais
│   ├── services/           # Comunicação com a API
│   ├── types/              # Tipos TypeScript compartilhados
│   ├── utils/              # Funções auxiliares
│   ├── App.tsx              # Rotas da aplicação
│   ├── config.ts            # Configuração da URL da API
│   └── main.tsx             # Inicialização do React e do roteador
├── index.html               # HTML-base e metadados da página inicial
├── vercel.json              # Reescrita das rotas para a aplicação React
└── package.json             # Dependências e comandos npm
```

### Rotas principais

As rotas são definidas em `src/App.tsx`. Entre as áreas disponíveis estão:

- `/` — página pública de apresentação;
- `/login` e `/cadastro` — acesso e cadastro de paciente;
- `/termos`, `/privacidade` e `/seguranca` — páginas institucionais;
- `/home`, `/prescricoes`, `/agendamentos`, `/enviarsolicitacao` e `/pontos-coleta` — recursos do paciente;
- `/homeadmin`, `/agendamentosadm`, `/pacientesadm` e outras rotas de gestão — recursos administrativos;
- `/homeaut` e `/verprescricoesaprovadas` — recursos do autorizador.

Há rotas adicionais para detalhes, notificações, perfis, atendimento e operações internas. A existência de uma rota não dispensa autenticação ou autorização; o acesso efetivo depende das validações implementadas no sistema.

## API e ambiente

O endereço padrão da API é configurado em `src/config.ts`. Para desenvolvimento, `VITE_API_URL` pode sobrescrevê-lo, por exemplo, no arquivo `.env.local`:

```env
VITE_API_URL=http://localhost:3344
```

Na Vercel, configure `VITE_API_URL` nas variáveis de ambiente do projeto somente quando precisar usar uma API diferente da padrão. Como variáveis `VITE_*` são públicas no frontend, elas não devem conter segredos.

## Build e publicação

Para validar e gerar os arquivos de produção:

```bash
npm run build
npm run preview
```

A saída do build fica em `dist/`. A configuração em `vercel.json` encaminha as URLs da aplicação para `index.html`, permitindo que o React Router resolva rotas ao abrir uma URL diretamente. A publicação requer que a Vercel esteja conectada ao repositório e configurada para executar o build do Vite; a API é publicada e configurada separadamente.

## SEO e indexação

O projeto mantém configurações básicas de descoberta e apresentação nos mecanismos de busca:

- Título, descrição, URL canônica e metadados Open Graph/Twitter para a página inicial;
- Metadados específicos para as páginas de Termos de Uso, Política de Privacidade e Segurança de Dados;
- Dados estruturados `WebSite`;
- `public/robots.txt`, que permite o rastreamento e aponta para o sitemap;
- `public/sitemap.xml`, com a página inicial e as páginas institucionais públicas;
- Rotas fora da lista pública marcadas com `noindex` pelo aplicativo.

O domínio usado nessas configurações é `https://insumed-navy.vercel.app`. Como o frontend é uma aplicação React renderizada no navegador, os metadados das rotas são atualizados após a execução do JavaScript.

Para acompanhar a indexação, verifique o domínio no [Google Search Console](https://search.google.com/search-console) e envie `https://insumed-navy.vercel.app/sitemap.xml`. A solicitação de indexação não garante inclusão nos resultados de busca.

## Privacidade e uso responsável

O sistema pode lidar com dados pessoais e informações relacionadas à saúde. Use somente contas e dados de teste autorizados durante o desenvolvimento. A configuração da API e as permissões de acesso devem ser tratadas com cuidado; não publique informações pessoais, tokens ou credenciais em issues, commits, logs ou capturas de tela.

Consulte as páginas de [Termos de Uso](https://insumed-navy.vercel.app/termos), [Privacidade](https://insumed-navy.vercel.app/privacidade) e [Segurança de Dados](https://insumed-navy.vercel.app/seguranca) para as informações institucionais disponíveis no site.

## Contexto do projeto

O INSUMED foi desenvolvido como projeto acadêmico do curso Técnico em Informática para Internet da Escola Técnica Estadual de Volta Redonda (FAETEC). O propósito é apoiar a organização do processo de solicitação e retirada de insumos de saúde e a comunicação entre pacientes e unidades participantes.

## Licença e reutilização

Este repositório não contém um arquivo de licença que conceda permissões de reutilização. A indicação de finalidade acadêmica, por si só, não equivale a uma licença de software livre. Consulte os responsáveis pelo projeto antes de copiar, modificar ou redistribuir o código, as imagens ou a identidade visual.
