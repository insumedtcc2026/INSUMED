import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';
import type { Perfil } from './sessao';
import { useNotificacoes } from '../../hook/useNotificacoes';
import type { Notificacao } from '../../types/notificacao';
import { ROTA_NOTIFICACOES } from '../../utils/notificacoes';

/**
 * Sino do cabeçalho (paciente, admin e autorizador): contador de não lidas
 * e lista das mais recentes. Abre por clique, toque ou teclado; fecha com
 * Esc ou clicando fora.
 */
export default function SinoNotificacoes({ perfil }: { perfil: Perfil }) {
  const navigate = useNavigate();
  const { naoLidas, ultimas, carregando, erro, recarregar, marcarLida, marcarTodas } = useNotificacoes(perfil);
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const idPainel = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent | TouchEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener('mousedown', fora);
    document.addEventListener('touchstart', fora);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('touchstart', fora);
      document.removeEventListener('keydown', tecla);
    };
  }, [aberto]);

  function alternar() {
    if (!aberto) recarregar();
    setAberto((v) => !v);
  }

  function abrir(n: Notificacao) {
    marcarLida(n);
    setAberto(false);
    if (n.link) navigate(n.link);
  }

  const rotulo = naoLidas > 0
    ? `Notificações, ${naoLidas} não ${naoLidas === 1 ? 'lida' : 'lidas'}`
    : 'Notificações';

  return (
    <div className="notification-wrapper" ref={caixa}>
      <button
        ref={botao}
        type="button"
        className="notification-button"
        aria-label={rotulo}
        aria-expanded={aberto}
        aria-controls={aberto ? idPainel : undefined}
        onClick={alternar}
      >
        <FaBell className="notification-icon" aria-hidden="true" />
        {naoLidas > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <NotificationDropdown
          id={idPainel}
          itens={ultimas}
          naoLidas={naoLidas}
          carregando={carregando}
          erro={erro}
          rotaHistorico={ROTA_NOTIFICACOES[perfil]}
          onAbrir={abrir}
          onMarcarTodas={marcarTodas}
          onTentarDeNovo={recarregar}
        />
      )}
    </div>
  );
}
