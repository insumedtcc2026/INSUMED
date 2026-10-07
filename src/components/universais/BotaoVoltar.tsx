import '../../css/universais/BotaoVoltar.css';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BotaoVoltarProps {
  /** Rota usada quando não existe página anterior no histórico (ex: link aberto direto). */
  para?: string;
  rotulo?: string;
  className?: string;
}

/**
 * Botão "Voltar" com seta, padrão em todas as páginas.
 * Volta para a página anterior; se o usuário abriu a página
 * direto pelo link, vai para a rota informada em "para".
 */
export default function BotaoVoltar({
  para = '/',
  rotulo = 'Voltar',
  className = '',
}: BotaoVoltarProps) {
  const navigate = useNavigate();

  const voltar = () => {
    const temHistorico = (window.history.state?.idx ?? 0) > 0;

    if (temHistorico) {
      navigate(-1);
    } else {
      navigate(para);
    }
  };

  return (
    <button
      type="button"
      onClick={voltar}
      className={`botao-voltar ${className}`}
      aria-label={rotulo}
    >
      <span className="botao-voltar-icone">
        <ArrowLeft size={18} strokeWidth={2.5} />
      </span>
      <span className="botao-voltar-texto">{rotulo}</span>
    </button>
  );
}
