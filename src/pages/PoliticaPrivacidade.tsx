import PaginaLegal, { type SecaoLegal } from '../components/universais/PaginaLegal';
import { EMAIL_CONTATO, RESPONSAVEL } from '../components/universais/dadosLegais';

const secoes: SecaoLegal[] = [
  {
    id: 'quem-somos',
    titulo: 'Quem trata os seus dados',
    conteudo: (
      <>
        <p>
          O INSUMED é desenvolvido e mantido pela {RESPONSAVEL}. Esta Política explica,
          de forma simples, quais dados pessoais coletamos, por que coletamos, com quem
          compartilhamos e como você pode exercer seus direitos, conforme a Lei Geral de
          Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018).
        </p>
        <p>
          Quando o sistema for utilizado por uma unidade ou secretaria de saúde, essa
          instituição atua como <strong>controladora</strong> dos dados dos seus
          pacientes, e a equipe do INSUMED atua como <strong>operadora</strong>,
          tratando os dados somente conforme as instruções da instituição.
        </p>
      </>
    ),
  },
  {
    id: 'dados-coletados',
    titulo: 'Quais dados coletamos',
    conteudo: (
      <>
        <p>
          Seguimos o princípio da <strong>necessidade</strong> (art. 6º, III): coletamos
          apenas o essencial para organizar a entrega dos insumos.
        </p>
        <div className="legal-tabela-wrapper">
          <table className="legal-tabela">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Dados</th>
                <th>Para que usamos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cadastro</td>
                <td>Nome, CPF, data de nascimento, gênero, e-mail, telefone, CEP e endereço</td>
                <td>Identificar o paciente, vincular ao polo de atendimento e entrar em contato</td>
              </tr>
              <tr>
                <td>Acesso</td>
                <td>E-mail, senha e token de sessão</td>
                <td>Fazer login e separar o acesso por perfil</td>
              </tr>
              <tr>
                <td>Saúde (dado sensível)</td>
                <td>Foto ou PDF da prescrição, observações, insumos e quantidades</td>
                <td>Analisar, autorizar e preparar os insumos do tratamento</td>
              </tr>
              <tr>
                <td>Raça/cor (dado sensível)</td>
                <td>Raça/cor autodeclarada</td>
                <td>Uso estatístico pelas políticas públicas de saúde; você pode escolher “Prefiro não responder”</td>
              </tr>
              <tr>
                <td>Agendamentos</td>
                <td>Protocolo, data, horário, ponto de coleta e status</td>
                <td>Organizar a retirada e manter o histórico de coletas</td>
              </tr>
              <tr>
                <td>Localização</td>
                <td>Localização do aparelho (com sua permissão) ou CEP digitado</td>
                <td>Mostrar os pontos de coleta mais próximos; o cálculo é feito no seu navegador</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Dados de saúde e de raça/cor são <strong>dados pessoais sensíveis</strong>{' '}
          (art. 5º, II) e recebem proteção reforçada.
        </p>
      </>
    ),
  },
  {
    id: 'bases-legais',
    titulo: 'Bases legais do tratamento',
    conteudo: (
      <ul>
        <li>
          <strong>Tutela da saúde</strong> (art. 7º, VIII e art. 11, II, “f”): para
          analisar prescrições e organizar a entrega de insumos por profissionais e
          serviços de saúde;
        </li>
        <li>
          <strong>Execução de políticas públicas</strong> (art. 7º, III e art. 11, II,
          “b”): quando o sistema for usado por órgãos públicos de saúde;
        </li>
        <li>
          <strong>Cumprimento de obrigação legal</strong> (art. 7º, II): guarda de
          registros exigida por lei;
        </li>
        <li>
          <strong>Consentimento</strong> (art. 7º, I e art. 11, I): para dados
          opcionais, como a localização do aparelho, que você pode negar ou revogar a
          qualquer momento nas configurações do navegador.
        </li>
      </ul>
    ),
  },
  {
    id: 'compartilhamento',
    titulo: 'Com quem compartilhamos',
    conteudo: (
      <>
        <p>
          <strong>Não vendemos nem alugamos dados pessoais.</strong> O compartilhamento
          acontece apenas quando necessário para o serviço funcionar:
        </p>
        <ul>
          <li>com administradores e autorizadores das unidades de saúde, para analisar e agendar as coletas;</li>
          <li>com provedores de hospedagem e banco de dados em nuvem (como Render, Vercel e Neon), que armazenam as informações do sistema;</li>
          <li>com o ViaCEP e o OpenStreetMap/Nominatim, que recebem apenas o CEP ou o endereço digitado para localizar postos no mapa;</li>
          <li>com o Google Maps, somente quando você toca em “Ver rota” (é aberto em uma nova aba com a sua origem e o destino);</li>
          <li>com o YouTube, ao assistir ao vídeo tutorial incorporado na página inicial;</li>
          <li>com autoridades públicas, quando houver obrigação legal ou ordem judicial.</li>
        </ul>
        <p>
          Alguns desses provedores podem armazenar dados fora do Brasil; nesses casos a
          transferência segue o art. 33 da LGPD.
        </p>
      </>
    ),
  },
  {
    id: 'armazenamento',
    titulo: 'Por quanto tempo guardamos',
    conteudo: (
      <>
        <p>
          Os dados ficam guardados enquanto a sua conta estiver ativa e enquanto forem
          necessários para o acompanhamento do tratamento. Depois disso, são excluídos
          ou anonimizados (art. 16), exceto quando a lei exigir a guarda por mais tempo,
          como os registros de acesso, mantidos por 6 meses (Marco Civil da Internet,
          art. 15).
        </p>
        <p>
          No seu navegador, o sistema guarda o token de sessão e dados básicos do perfil
          para manter você conectado. Eles são apagados ao clicar em “Sair”.
        </p>
      </>
    ),
  },
  {
    id: 'direitos',
    titulo: 'Seus direitos como titular',
    conteudo: (
      <>
        <p>Pelo art. 18 da LGPD, você pode pedir a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados (parte deles pode ser editada na página Perfil);</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
          <li>portabilidade dos dados a outro serviço;</li>
          <li>informação sobre com quem seus dados foram compartilhados;</li>
          <li>revogação do consentimento, quando ele for a base legal;</li>
          <li>revisão de decisões tomadas apenas de forma automatizada.</li>
        </ul>
        <p>
          Você também pode apresentar reclamação à Autoridade Nacional de Proteção de
          Dados (ANPD) pelo site gov.br/anpd.
        </p>
      </>
    ),
  },
  {
    id: 'seguranca',
    titulo: 'Segurança',
    conteudo: (
      <p>
        Adotamos medidas técnicas e administrativas para proteger seus dados contra
        acessos não autorizados, perda ou vazamento (art. 46). Os detalhes estão na
        página <a href="/seguranca">Segurança de Dados</a>.
      </p>
    ),
  },
  {
    id: 'criancas',
    titulo: 'Crianças e adolescentes',
    conteudo: (
      <p>
        Dados de pacientes menores de idade são tratados no seu melhor interesse e com
        o consentimento específico de pelo menos um dos pais ou responsável legal
        (art. 14), que realiza o cadastro e acompanha o uso do sistema.
      </p>
    ),
  },
  {
    id: 'encarregado',
    titulo: 'Encarregado e canal de contato',
    conteudo: (
      <>
        <p>
          Para exercer seus direitos ou tirar dúvidas sobre esta Política, fale com o
          encarregado pelo tratamento de dados (art. 41):{' '}
          <strong>{EMAIL_CONTATO}</strong>.
        </p>
        <p>
          Responderemos de forma clara e gratuita, no prazo de até 15 dias (art. 19,
          II). Esta Política pode ser atualizada; a data da última versão fica no topo
          da página.
        </p>
      </>
    ),
  },
];

export default function PoliticaPrivacidade() {
  return (
    <PaginaLegal
      titulo="Política de Privacidade"
      resumo="Como o INSUMED coleta, usa, compartilha e protege os seus dados pessoais e de saúde, e como você pode exercer seus direitos pela LGPD."
      secoes={secoes}
    />
  );
}
