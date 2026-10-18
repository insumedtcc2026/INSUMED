import { Link } from 'react-router-dom';
import '../../css/universais/NotificationDropdown.css';
import IconeNotificacao from './IconeNotificacao';
import type { Notificacao } from '../../types/notificacao';
import { quandoFoi } from '../../utils/notificacoes';

interface Props {
  id: string;
  itens: Notificacao[];
  naoLidas: number;
  carregando: boolean;
  erro: boolean;
  rotaHistorico: string;
  onAbrir: (n: Notificacao) => void;
  onMarcarTodas: () => void;
  onTentarDeNovo: () => void;
}

/** Item da lista (também usado na página de histórico). */
export function ItemNotificacao({ n, onAbrir }: { n: Notificacao; onAbrir: (n: Notificacao) => void }) {
  return (
    <button
      type="button"
      className={n.lida ? 'notif-item' : 'notif-item notif-item--nao-lida'}
      onClick={() => onAbrir(n)}
    >
      <IconeNotificacao tom={n.tom} />
      <span className="notif-texto">
        <span className="notif-mensagem">
          <strong>{n.titulo}:</strong> {n.mensagem}
        </span>
        <span className="notif-data">
          {!n.lida && <span className="notif-sr">Não lida. </span>}
          {quandoFoi(n.atualizada_em ?? n.criada_em)}
        </span>
      </span>
      {!n.lida && <span className="notif-ponto" aria-hidden="true" />}
    </button>
  );
}

export default function NotificationDropdown({
  id, itens, naoLidas, carregando, erro, rotaHistorico, onAbrir, onMarcarTodas, onTentarDeNovo,
}: Props) {
  let conteudo;
  if (carregando && itens.length === 0) {
    conteudo = (
      <div className="notification-empty" role="status">
        <p>Carregando…</p>
      </div>
    );
  } else if (erro && itens.length === 0) {
    conteudo = (
      <div className="notification-empty" role="alert">
        <p>Não foi possível carregar as notificações.</p>
        <button type="button" className="notif-tentar" onClick={onTentarDeNovo}>Tentar de novo</button>
      </div>
    );
  } else if (itens.length === 0) {
    conteudo = (
      <div className="notification-empty">
        <p>Nenhuma notificação disponível.</p>
      </div>
    );
  } else {
    conteudo = (
      <ul className="notif-lista">
        {itens.map((n) => (
          <li key={n.id}>
            <ItemNotificacao n={n} onAbrir={onAbrir} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="notification-dropdown" id={id} role="dialog" aria-label="Notificações">
      <div className="notification-header">
        <h3>Notificações!</h3>
        {naoLidas > 0 && (
          <button type="button" className="notif-marcar-todas" onClick={onMarcarTodas}>
            Marcar todas como lidas
          </button>
        )}
      </div>

      {conteudo}

      <div className="notification-footer">
        <Link to={rotaHistorico} className="notif-ver-todas">Ver todas as notificações</Link>
      </div>
    </div>
  );
}
