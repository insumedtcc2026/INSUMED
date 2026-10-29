import { Eye, EyeOff } from "lucide-react";
import "../../css/universais/CampoSenha.css";

interface Props {
  visivel: boolean;
  onAlternar: () => void;
}

/**
 * Botão de mostrar/ocultar a senha. Fica dentro de um
 * <div className="campo-senha"> junto com o input, centralizado na
 * altura do campo (a mensagem de erro fica fora desse div).
 */
export default function BotaoOlho({ visivel, onAlternar }: Props) {
  return (
    <button
      type="button"
      className="botao-olho"
      onClick={onAlternar}
      aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
      aria-pressed={visivel}
      title={visivel ? "Ocultar senha" : "Mostrar senha"}
    >
      {visivel ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
    </button>
  );
}
