import { requisitosSenha } from "../../utils/validacoes";
import "../../css/universais/Validacao.css";

// Barra de força + checklist dos requisitos da senha, atualizados enquanto o usuário digita.
function ForcaSenha({ senha }: { senha: string }) {
  if (!senha) return null;

  const requisitos = requisitosSenha(senha);
  const atendidos = requisitos.filter((r) => r.ok).length;
  const nivel = atendidos <= 2 ? "fraca" : atendidos <= 4 ? "media" : "forte";
  const rotulo = { fraca: "Fraca", media: "Média", forte: "Forte" }[nivel];

  return (
    <div className="forca-senha" aria-live="polite">
      <div className="forca-senha-barra">
        <span
          className={`forca-senha-preenchido forca-${nivel}`}
          style={{ width: `${(atendidos / requisitos.length) * 100}%` }}
        />
      </div>
      <span className={`forca-senha-rotulo forca-${nivel}`}>Senha {rotulo}</span>
      <ul className="forca-senha-requisitos">
        {requisitos.map((r) => (
          <li key={r.texto} className={r.ok ? "ok" : ""}>
            {r.ok ? "✓" : "•"} {r.texto}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MensagemErro({ erro }: { erro?: string | null }) {
  if (!erro) return null;
  return (
    <span className="campo-erro-msg" role="alert">
      {erro}
    </span>
  );
}

export default ForcaSenha;
