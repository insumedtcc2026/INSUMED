import PaginaLegal, { type SecaoLegal } from '../components/universais/PaginaLegal';
import { EMAIL_CONTATO } from '../components/universais/dadosLegais';

const secoes: SecaoLegal[] = [
  {
    id: 'compromisso',
    titulo: 'Nosso compromisso',
    conteudo: (
      <p>
        O INSUMED lida com dados de saúde, que são dados pessoais sensíveis. Por isso,
        a segurança faz parte do sistema desde o projeto (privacidade desde a
        concepção), seguindo os princípios de segurança e prevenção da LGPD (art. 6º,
        VII e VIII) e o dever de proteger os dados previsto no art. 46.
      </p>
    ),
  },
  {
    id: 'acesso',
    titulo: 'Controle de acesso',
    conteudo: (
      <ul>
        <li>login individual com e-mail e senha, sem contas compartilhadas;</li>
        <li>autenticação por token (JSON Web Token – JWT), validado a cada página da área restrita;</li>
        <li>sessão encerrada automaticamente quando o token expira ou é inválido, com novo login obrigatório;</li>
        <li>acesso separado por perfil: o paciente vê apenas os próprios dados, e somente administradores e autorizadores acessam as funções de gestão;</li>
        <li>botão “Sair”, que apaga o token e os dados do perfil guardados no navegador.</li>
      </ul>
    ),
  },
  {
    id: 'transmissao',
    titulo: 'Proteção na transmissão e no armazenamento',
    conteudo: (
      <ul>
        <li>toda a comunicação entre o aplicativo e o servidor acontece por HTTPS (conexão criptografada);</li>
        <li>dados armazenados em provedores de nuvem com controles de acesso e cópias de segurança;</li>
        <li>senhas que nunca são exibidas no sistema e devem ser guardadas no servidor apenas de forma criptografada (hash);</li>
        <li>envio de prescrições limitado a imagens (JPG, PNG) e PDF de até 5 MB.</li>
      </ul>
    ),
  },
  {
    id: 'minimizacao',
    titulo: 'Menos dados, menos riscos',
    conteudo: (
      <>
        <p>
          Conforme a documentação do projeto, o sistema armazena apenas os dados
          essenciais para a coleta dos insumos (datas, quantidades, nomes dos insumos e
          dados de contato), sem informações clínicas além da prescrição enviada.
        </p>
        <p>
          A sua localização é usada apenas no navegador para calcular a distância até os
          pontos de coleta e não é salva no sistema.
        </p>
      </>
    ),
  },
  {
    id: 'equipe',
    titulo: 'Boas práticas da equipe',
    conteudo: (
      <ul>
        <li>acesso aos dados apenas por quem precisa deles para o atendimento;</li>
        <li>registro das alterações feitas em agendamentos e solicitações;</li>
        <li>atualização frequente das bibliotecas e dependências do sistema;</li>
        <li>orientação de administradores e autorizadores sobre sigilo e proteção de dados.</li>
      </ul>
    ),
  },
  {
    id: 'incidentes',
    titulo: 'Em caso de incidente',
    conteudo: (
      <p>
        Se ocorrer um incidente de segurança que possa causar risco ou dano relevante
        aos titulares, ele será contido e investigado, e os pacientes afetados e a
        Autoridade Nacional de Proteção de Dados (ANPD) serão comunicados em prazo
        razoável, com a descrição do ocorrido, dos dados envolvidos e das medidas
        adotadas (art. 48 da LGPD).
      </p>
    ),
  },
  {
    id: 'voce',
    titulo: 'Como você pode se proteger',
    conteudo: (
      <>
        <ul>
          <li>crie uma senha forte e não use a mesma senha de outros sites;</li>
          <li>não compartilhe sua senha, nem com familiares ou funcionários;</li>
          <li>clique em “Sair” ao terminar, principalmente em aparelhos compartilhados;</li>
          <li>mantenha o navegador e o celular atualizados;</li>
          <li>
            desconfie de mensagens que peçam sua senha: a equipe do INSUMED nunca pede
            senha por telefone, e-mail ou WhatsApp.
          </li>
        </ul>
        <div className="legal-destaque">
          Percebeu algo estranho na sua conta? Troque sua senha e avise imediatamente
          pelo e-mail <strong>{EMAIL_CONTATO}</strong>.
        </div>
      </>
    ),
  },
];

export default function SegurancaDados() {
  return (
    <PaginaLegal
      titulo="Segurança de Dados"
      resumo="As medidas que protegem as suas informações de saúde no INSUMED e as atitudes simples que ajudam a manter a sua conta segura."
      secoes={secoes}
    />
  );
}
