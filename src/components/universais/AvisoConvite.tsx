import { useNavigate } from "react-router-dom";
import "../../css/universais/Equipe.css";

/** Cartão mostrado no lugar do formulário quando o convite falta ou não vale. */
export default function AvisoConvite({ carregando, erro }: { carregando: boolean; erro: string | null }) {
  const navigate = useNavigate();
  if (carregando) {
    return <p className="aviso-convite" role="status">Conferindo o convite...</p>;
  }
  return (
    <div className="aviso-convite aviso-convite--erro" role="alert">
      <p>{erro}</p>
      <button type="button" className="equipe-botao" onClick={() => navigate("/login")}>
        Ir para o login
      </button>
    </div>
  );
}
