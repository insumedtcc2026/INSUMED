import "../../css/home/Loginteste.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MensagemErro } from "../universais/ForcaSenha";
import { mascaraCPF, mensagemErroApi, somenteDigitos, validarCPF, validarEmail } from "../../utils/validacoes";
import olhoAberto from '../../assets/home-log/olho aberto.webp'
import olhoFechado from '../../assets/home-log/olho fechado.webp'

import images from "../../assets/home-log/teste login.webp"; 
import BotaoVoltar from "../universais/BotaoVoltar";
import { API_URL } from "../../config";

type PerfilLogin = "ADMIN" | "AUTORIZADOR" | "PACIENTE";

const NOME_PERFIL: Record<PerfilLogin, string> = {
  PACIENTE: "Paciente",
  ADMIN: "Administrador da unidade",
  AUTORIZADOR: "Autorizador",
};

// O mesmo campo aceita e-mail ou CPF: com "@" é e-mail; só números (com ou
// sem pontuação) é CPF.
const ehEmail = (valor: string) => valor.includes("@");

function validarLogin(valor: string) {
  if (!valor.trim()) return "Informe o e-mail ou o CPF.";
  if (ehEmail(valor)) return validarEmail(valor);
  if (/^[\d.\-\s]+$/.test(valor)) return validarCPF(valor);
  return "Informe um e-mail ou um CPF válido.";
}



// relógio fora do componente (usado só nos handlers)
const agoraMs = () => Date.now();

const Loginteste: React.FC = () => {

   const[olhoPassword, setOlhoPassword] =useState(false);
  const [login, setLogin] = useState("");
  // mesma pessoa com dois perfis (ex.: paciente e funcionária): escolhe por qual entrar
  const [perfisParaEscolher, setPerfisParaEscolher] = useState<{ tipo: PerfilLogin; nome: string }[]>([]);
  const [password, setPassword] = useState("");
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  // Momento (ms) até quando o login está bloqueado pelo limite de tentativas do servidor.
  const [bloqueadoAte, setBloqueadoAte] = useState(0);
  const [agora, setAgora] = useState(() => Date.now());
  const navigate = useNavigate();

  const segundosBloqueio = Math.max(0, Math.ceil((bloqueadoAte - agora) / 1000));

  useEffect(() => {
    if (!bloqueadoAte) return;
    const timer = setInterval(() => {
      const t = Date.now();
      setAgora(t);
      if (t >= bloqueadoAte) {
        setBloqueadoAte(0);
        setAviso("");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [bloqueadoAte]);

  const erroLogin = tentouEnviar ? validarLogin(login) : null;
  const erroSenha = tentouEnviar && !password ? "Informe a senha." : null;

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPerfisParaEscolher([]);
    entrar();
  };

  const entrar = async (perfil?: PerfilLogin) => {
    setTentouEnviar(true);
    setAviso("");

    if (validarLogin(login) || !password || segundosBloqueio > 0) return;

    setEnviando(true);
    try {

        const response = await axios.post(
            `${API_URL}/login`,
            {
                login: ehEmail(login) ? login.trim().toLowerCase() : somenteDigitos(login),
                senha: password,
                ...(perfil ? { perfil } : {}),
            }
        );

        if (response.data?.escolher_perfil) {
            setPerfisParaEscolher(response.data.perfis ?? []);
            return;
        }

        const token = response.data.token;
        const usuario = response.data.usuario;

        if (!token) {
            throw new Error("Token não recebido");
        }

        const tipo = (
            usuario?.tipo || response.data.tipo || ""
        ).toUpperCase();

        // Cada perfil mantém seu próprio token e seus dados.
        if (tipo === "ADMIN") {
            localStorage.setItem("token_admin", token);
            localStorage.setItem(
                "usuario_admin",
                JSON.stringify(usuario)
            );
            // cadastro feito pelo admin universal: troca a senha provisória antes
            navigate(response.data.trocar_senha ? "/trocar-senha?perfil=ADMIN" : "/homeadmin");

        } else if (tipo === "AUTORIZADOR") {
            localStorage.setItem("token_autorizador", token);
            localStorage.setItem(
                "usuario_autorizador",
                JSON.stringify(usuario)
            );
            navigate(response.data.trocar_senha ? "/trocar-senha?perfil=AUTORIZADOR" : "/verprescricoesaprovadas");

        } else if (tipo === "PACIENTE") {
            localStorage.setItem("token_paciente", token);
            localStorage.setItem(
                "usuario_paciente",
                JSON.stringify(usuario)
            );
            navigate("/home");

        } else {
            throw new Error(
                `Tipo de usuário desconhecido: ${tipo || "não informado"}`
            );
        }
    } catch (error) {

        const resposta = axios.isAxiosError(error) ? error.response : undefined;
        console.error("Erro no login:", resposta?.status ?? (error instanceof Error ? error.message : error));
        const credencial = ehEmail(login) ? "E-mail" : "CPF";

        if (resposta?.status === 429) {
            const segundos = Number(resposta.data?.tentar_novamente_em) ||
                Number(resposta.headers?.["retry-after"]) || 60;
            const inicio = agoraMs();
            setAgora(inicio);
            setBloqueadoAte(inicio + segundos * 1000);
            setAviso(mensagemErroApi(error, "Muitas tentativas de login. Aguarde alguns minutos."));
        } else if (resposta?.status === 401) {
            const restantes = resposta.data?.tentativas_restantes;
            setAviso(
                typeof restantes === "number" && restantes <= 3
                    ? `${credencial} ou senha incorretos. Você tem mais ${restantes} tentativa(s) antes de o acesso ser bloqueado temporariamente.`
                    : `${credencial} ou senha incorretos.`
            );
        } else {
            // 403: conta desativada pela administração
            setAviso(mensagemErroApi(error, "Não foi possível entrar. Tente novamente."));
        }
    } finally {
        setEnviando(false);
    }
};
const handleSignUp = () => { navigate("/cadastro"); };

  return (
    <div className="login-fullscreen-container">
      
      
      <div className="login-image-panel">
        <img src={images} alt="Login Background" />
      </div>

   
      <div className="login-form-panel">
        <BotaoVoltar para="/" className="botao-voltar--flutuante" />
        <div className="form-wrapper">
          
          <div className="login-left">Bem-vindo</div>
          
          <form onSubmit={handleLogin} noValidate>
            {aviso && (
              <p className="aviso-formulario" role="alert">
                {aviso}
                {segundosBloqueio > 0 && ` (${segundosBloqueio}s)`}
              </p>
            )}
            <div className="login-inputs">
              <label htmlFor="login-usuario">E-mail ou CPF</label>
              <input 
                id="login-usuario"
                type="text" 
                inputMode={ehEmail(login) || /[a-z]/i.test(login) ? "email" : "text"}
                placeholder="seu@email.com ou 000.000.000-00" 
                value={login}
                autoComplete="username"
                maxLength={254}
                className={erroLogin ? "input-erro" : ""}
                aria-invalid={Boolean(erroLogin)}
                onChange={(e) => {
                  const valor = e.target.value;
                  // só números: aplica a máscara do CPF
                  setLogin(/^[\d.\-\s]+$/.test(valor) ? mascaraCPF(valor) : valor);
                  setPerfisParaEscolher([]);
                }}
              />
              <MensagemErro erro={erroLogin} />
            </div>
            
            <div className="login-inputs">
              <div className="input-password1">
              <label>Senha</label>
              <input 
                type={olhoPassword? 'text': 'password'}
                placeholder="Digite sua senha"
                value={password}
                autoComplete="current-password"
                maxLength={128}
                className={erroSenha ? "input-erro" : ""}
                aria-invalid={Boolean(erroSenha)}
                onChange={(e) => setPassword(e.target.value)}
              />
               <img  src={olhoPassword ? olhoAberto : olhoFechado}
        alt="Mostrar senha"
        className="icone-olho1"
        onClick={() => setOlhoPassword(!olhoPassword)}
        />
        </div>
              <MensagemErro erro={erroSenha} />
            </div>
            
            {perfisParaEscolher.length > 0 && (
              <div className="login-escolher-perfil" role="group" aria-label="Escolha o perfil">
                <p>Encontramos mais de um perfil com estes dados. Como você quer entrar?</p>
                {perfisParaEscolher.map((p) => (
                  <button
                    key={p.tipo}
                    type="button"
                    className="btn-perfil"
                    disabled={enviando}
                    onClick={() => entrar(p.tipo)}
                  >
                    {NOME_PERFIL[p.tipo] ?? p.tipo}
                  </button>
                ))}
              </div>
            )}

            <button type="submit" className="btn-entrar" disabled={enviando || segundosBloqueio > 0}>
              {enviando ? "Entrando..." : segundosBloqueio > 0 ? `Aguarde ${segundosBloqueio}s` : "Entrar"}
            </button>
            
            <p className="register-text">
              Ainda não tem conta? <span onClick={handleSignUp}>Cadastre-se</span>
            </p>
          </form>

        </div>
      </div>

    </div>
  );
}

export default Loginteste;