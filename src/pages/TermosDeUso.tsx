import PaginaLegal, { type SecaoLegal } from '../components/universais/PaginaLegal';
import { EMAIL_CONTATO, RESPONSAVEL } from '../components/universais/dadosLegais';

const secoes: SecaoLegal[] = [
  {
    id: 'aceitacao',
    titulo: 'Aceitação dos termos',
    conteudo: (
      <>
        <p>
          Estes Termos de Uso regulam o acesso e a utilização do <strong>INSUMED</strong>,
          sistema web para a gestão operacional e o agendamento da coleta periódica de
          insumos para a saúde, mantido pela {RESPONSAVEL}.
        </p>
        <p>
          Ao criar uma conta ou utilizar o sistema, você declara que leu, entendeu e
          concorda com estes Termos, com a{' '}
          <a href="/privacidade">Política de Privacidade</a> e com a página de{' '}
          <a href="/seguranca">Segurança de Dados</a>. Caso não concorde, não utilize o
          sistema.
        </p>
      </>
    ),
  },
  {
    id: 'servico',
    titulo: 'O que o INSUMED oferece',
    conteudo: (
      <>
        <p>
          O INSUMED aproxima pacientes, administradores das unidades de saúde e
          autorizadores para organizar a retirada de insumos médicos (como curativos e
          bolsas de colostomia). Pelo sistema é possível:
        </p>
        <ul>
          <li>cadastrar-se e acessar uma área restrita por perfil (paciente, administrador ou autorizador);</li>
          <li>enviar a foto ou o PDF da prescrição para análise e autorização;</li>
          <li>acompanhar o status das solicitações e o histórico de prescrições;</li>
          <li>consultar os agendamentos de coleta (data, horário, local e insumos);</li>
          <li>localizar pontos de coleta e traçar rotas até eles;</li>
          <li>receber avisos sobre solicitações, autorizações e agendamentos.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'limites',
    titulo: 'Limites do serviço',
    conteudo: (
      <>
        <div className="legal-destaque">
          O INSUMED <strong>não é um serviço de emergência</strong> e não substitui
          consulta, diagnóstico ou orientação de profissionais de saúde. Em caso de
          urgência, procure a unidade de saúde mais próxima ou ligue 192 (SAMU).
        </div>
        <p>
          O sistema organiza a comunicação e o agendamento das coletas, mas{' '}
          <strong>não garante a disponibilidade física dos insumos</strong>, que depende
          da compra e do estoque de cada unidade de saúde. As informações de estoque e
          de datas são fornecidas pelas próprias unidades.
        </p>
        <p>
          O funcionamento também depende de conexão com a internet e de serviços de
          terceiros (hospedagem, mapas e consulta de CEP), que podem ficar
          temporariamente indisponíveis.
        </p>
      </>
    ),
  },
  {
    id: 'cadastro',
    titulo: 'Cadastro e conta de acesso',
    conteudo: (
      <>
        <p>Para usar a área restrita, você se compromete a:</p>
        <ul>
          <li>informar dados verdadeiros, completos e atualizados;</li>
          <li>manter sua senha em sigilo e não compartilhar sua conta com outras pessoas;</li>
          <li>sair da conta (“Sair”) ao usar computadores ou celulares compartilhados;</li>
          <li>avisar imediatamente caso perceba qualquer uso não autorizado da sua conta.</li>
        </ul>
        <p>
          Pacientes menores de 18 anos ou que não possam realizar os atos da vida civil
          devem ser cadastrados e acompanhados por um responsável legal, que autoriza o
          tratamento dos dados conforme o art. 14 da LGPD.
        </p>
      </>
    ),
  },
  {
    id: 'perfis',
    titulo: 'Responsabilidades de cada perfil',
    conteudo: (
      <>
        <p>
          <strong>Paciente:</strong> enviar prescrições legíveis e autênticas, conferir
          os dados do agendamento e comparecer ao ponto de coleta na data marcada.
        </p>
        <p>
          <strong>Administrador:</strong> manter corretos o cadastro de pacientes, de
          insumos e os agendamentos, registrando as alterações realizadas.
        </p>
        <p>
          <strong>Autorizador:</strong> analisar as solicitações com base na prescrição
          enviada e registrar a decisão (autorizada ou não autorizada).
        </p>
        <p>
          Profissionais e servidores que acessam dados de pacientes devem utilizá-los
          somente para a finalidade do atendimento, respeitando o sigilo profissional.
        </p>
      </>
    ),
  },
  {
    id: 'uso-proibido',
    titulo: 'Condutas proibidas',
    conteudo: (
      <ul>
        <li>enviar documentos falsos, adulterados ou de outra pessoa sem autorização;</li>
        <li>tentar acessar contas, dados ou áreas para as quais não tem permissão;</li>
        <li>copiar, vender ou divulgar dados de pacientes obtidos pelo sistema;</li>
        <li>usar programas automáticos, ataques ou qualquer meio que prejudique o funcionamento do sistema;</li>
        <li>utilizar o INSUMED para fins ilegais ou diferentes da gestão de insumos de saúde.</li>
      </ul>
    ),
  },
  {
    id: 'suspensao',
    titulo: 'Suspensão e encerramento da conta',
    conteudo: (
      <>
        <p>
          Contas podem ser suspensas ou encerradas em caso de descumprimento destes
          Termos, suspeita de fraude ou a pedido do próprio usuário. O pedido de
          exclusão pode ser feito pelo canal de contato indicado abaixo.
        </p>
        <p>
          Mesmo após o encerramento, alguns dados podem ser mantidos pelo tempo exigido
          em lei ou para o cumprimento de obrigações das unidades de saúde, conforme a{' '}
          <a href="/privacidade">Política de Privacidade</a>.
        </p>
      </>
    ),
  },
  {
    id: 'propriedade',
    titulo: 'Propriedade intelectual',
    conteudo: (
      <p>
        A marca, o logotipo, o layout, as imagens e o código do INSUMED pertencem à
        equipe do projeto. Não é permitido copiá-los ou reutilizá-los sem autorização,
        exceto para fins acadêmicos com a devida citação.
      </p>
    ),
  },
  {
    id: 'alteracoes',
    titulo: 'Alterações destes termos',
    conteudo: (
      <p>
        Estes Termos podem ser atualizados para refletir melhorias no sistema ou
        mudanças na legislação. A data da última atualização fica no topo desta página
        e, em mudanças relevantes, os usuários serão avisados no próprio sistema.
      </p>
    ),
  },
  {
    id: 'legislacao',
    titulo: 'Legislação aplicável e contato',
    conteudo: (
      <>
        <p>
          Estes Termos seguem as leis brasileiras, em especial a Constituição Federal
          (art. 196), a Lei Orgânica da Saúde (Lei nº 8.080/1990), o Marco Civil da
          Internet (Lei nº 12.965/2014) e a Lei Geral de Proteção de Dados Pessoais
          (Lei nº 13.709/2018). Fica eleito o foro da comarca de Volta Redonda/RJ.
        </p>
        <p>
          Dúvidas, sugestões ou reclamações: <strong>{EMAIL_CONTATO}</strong>.
        </p>
      </>
    ),
  },
];

export default function TermosDeUso() {
  return (
    <PaginaLegal
      titulo="Termos de Uso"
      resumo="As regras para usar o INSUMED com segurança: o que o sistema oferece, o que ele não faz e as responsabilidades de pacientes, administradores e autorizadores."
      secoes={secoes}
    />
  );
}
