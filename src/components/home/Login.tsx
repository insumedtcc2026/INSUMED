import "../../css/home/Loginteste.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MensagemErro } from "../universais/ForcaSenha";
import { mensagemErroApi, validarEmail } from "../../utils/validacoes";
import olhoAberto from '../../assets/home-log/olho aberto.png'
import olhoFechado from '../../assets/home-log/olho fechado.png'

import images from "../../assets/home-log/teste login.png"; 
import BotaoVoltar from "../universais/BotaoVoltar";



const Loginteste: React.FC = () => {

   const[olhoPassword, setOlhoPassword] =useState(false);
  const [email, setEmail] = useState("");
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

  const erroEmail = tentouEnviar ? validarEmail(email) : null;
  const erroSenha = tentouEnviar && !password ? "Informe a senha." : null;

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
) => {

    e.preventDefault();
    setTentouEnviar(true);
    setAviso("");

    if (validarEmail(email) || !password || segundosBloqueio > 0) return;

    setEnviando(true);
    try {

        
const response = await axios.post(
            "https://backend-insumed-lhac.vercel.app/login",
            {
                email: email.trim().toLowerCase(),
                senha: password
            }
        );

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
            navigate("/homeadmin");

        } else if (tipo === "AUTORIZADOR") {
            localStorage.setItem("token_autorizador", token);
            localStorage.setItem(
                "usuario_autorizador",
                JSON.stringify(usuario)
            );
            navigate("/verprescricoesaprovadas");

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

        console.error("Erro no login:", error);

        const resposta = axios.isAxiosError(error) ? error.response : undefined;

        if (resposta?.status === 429) {
            const segundos = Number(resposta.data?.tentar_novamente_em) ||
                Number(resposta.headers?.["retry-after"]) || 60;
            setAgora(Date.now());
            setBloqueadoAte(Date.now() + segundos * 1000);
            setAviso(mensagemErroApi(error, "Muitas tentativas de login. Aguarde alguns minutos."));
        } else if (resposta?.status === 401) {
            const restantes = resposta.data?.tentativas_restantes;
            setAviso(
                typeof restantes === "number" && restantes <= 3
                    ? `E-mail ou senha incorretos. Você tem mais ${restantes} tentativa(s) antes de o acesso ser bloqueado temporariamente.`
                    : "E-mail ou senha incorretos."
            );
        } else {
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
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Digite seu email" 
                value={email}
                autoComplete="email"
                maxLength={254}
                className={erroEmail ? "input-erro" : ""}
                aria-invalid={Boolean(erroEmail)}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MensagemErro erro={erroEmail} />
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