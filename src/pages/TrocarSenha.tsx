import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import images from "../assets/home-log/teste login.webp";
import ForcaSenha, { MensagemErro } from "../components/universais/ForcaSenha";
import { useValidarToken } from "../hook/Validartoken";
import { sairDoPerfil } from "../components/universais/sessao";
import { trocarMinhaSenha, type PerfilEquipe } from "../services/EquipeService";
import { mensagemErroApi, temErros, validarConfirmacaoSenha, validarSenha } from "../utils/validacoes";
import "../css/home/Loginteste.css";
import "../css/universais/Equipe.css";

const INICIO: Record<PerfilEquipe, string> = {
  ADMIN: "/homeadmin",
  AUTORIZADOR: "/verprescricoesaprovadas",
};

/**
 * Troca da própria senha do administrador ou autorizador.
 * Quem foi cadastrado pelo admin universal cai aqui logo após o login,
 * porque a senha provisória foi vista por outra pessoa.
 */
export default function TrocarSenha() {
  const [params] = useSearchParams();
  const perfil: PerfilEquipe = params.get("perfil") === "AUTORIZADOR" ? "AUTORIZADOR" : "ADMIN";
  const { verificando } = useValidarToken(perfil);
  const navigate = useNavigate();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const erros = {
    atual: atual ? null : "Informe a senha atual (a provisória, no primeiro acesso).",
    nova: validarSenha(nova) ?? (nova && nova === atual ? "A nova senha deve ser diferente da atual." : null),
    confirmacao: validarConfirmacaoSenha(nova, confirmacao),
  };
  const erroDe = (campo: keyof typeof erros) => (tentou ? erros[campo] : null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (temErros(erros)) return;
    setSalvando(true);
    try {
      await trocarMinhaSenha(perfil, { senha_atual: atual, nova_senha: nova, confirmacao_senha: confirmacao });
      await Swal.fire({ icon: "success", title: "Senha alterada", text: "Use a nova senha nos próximos acessos.", confirmButtonColor: "#0042ec" });
      navigate(INICIO[perfil]);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Não foi possível trocar a senha", text: mensagemErroApi(err, "Tente novamente."), confirmButtonColor: "#d33" });
    } finally {
      setSalvando(false);
    }
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="login-fullscreen-container">
      <div className="login-image-panel">
        <img src={images} alt="" />
      </div>
      <div className="login-form-panel">
        <div className="form-wrapper">
          <div className="login-left">Crie sua senha</div>
          <p className="equipe-ajuda" style={{ marginBottom: 16 }}>
            Para sua segurança, troque a senha antes de continuar. Ela precisa ter 8 caracteres ou mais, com letra maiúscula, minúscula, número e símbolo.
          </p>
          <form onSubmit={salvar} noValidate>
            <div className="login-inputs">
              <label htmlFor="senha-atual">Senha atual</label>
              <input id="senha-atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} className={erroDe("atual") ? "input-erro" : ""} />
              <MensagemErro erro={erroDe("atual")} />
            </div>
            <div className="login-inputs">
              <label htmlFor="senha-nova">Nova senha</label>
              <input id="senha-nova" type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} className={erroDe("nova") ? "input-erro" : ""} />
              <ForcaSenha senha={nova} />
              <MensagemErro erro={erroDe("nova")} />
            </div>
            <div className="login-inputs">
              <label htmlFor="senha-confirmacao">Confirme a nova senha</label>
              <input id="senha-confirmacao" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className={erroDe("confirmacao") ? "input-erro" : ""} />
              <MensagemErro erro={erroDe("confirmacao")} />
            </div>
            <button type="submit" className="btn-entrar" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </button>
            <p className="register-text">
              <span onClick={() => { sairDoPerfil(perfil); navigate("/login"); }}>Sair</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
