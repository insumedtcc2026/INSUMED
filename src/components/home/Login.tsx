
import "../../css/home/Loginteste.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bannerlogin from "../../assets/home-log/bannerlogin.png"
import { FcGoogle } from "react-icons/fc";

const Loginteste: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validação básica
    if (email.trim() && password.trim()) {
      console.log("Login com:", { email, password });
      navigate("/home");
    }
  };

  const handleGoogleLogin = () => {
    // Aqui depois adicionar lógica de login com Google
    navigate("/home");
  };

  const handleSignUp = () => {
    // Aqui depois  pode adicionar lógica de cadastro
    navigate("/cadastro")
  };

  return (
    <section className="login-container">
      <div className="container">
        <div className="banner">
          <img src={bannerlogin} alt="banner" />
        </div>

        <h1 className="login-left">Cadastre-se</h1>

        <form onSubmit={handleLogin}>
          <div className="login-inputs">
            <label>Seu CPF ou Email</label>
            <input
              type="email"
              name="email"
              placeholder="Digite o seu CPF ou Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Sua senha</label>
            <input
              type="password"
              name="password"
              placeholder="Digite a sua senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <p>Esqueceu sua senha?</p>

            <button type="submit">Entrar</button>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
            >
              Continue with Google
              <FcGoogle size={28} className="google-icon" />
            </button>

            <p className="paragrafo">Não tem uma conta? Cadastre-se</p>

            <button type="button" onClick={handleSignUp}>
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Loginteste