import "../../css/home/Loginteste.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import images from "../../assets/home-log/images.jpg"; // Sua imagem da esquerda

const Loginteste: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      console.log("Login com:", { email, password });
      navigate("/home");
    }
  };

  const handleGoogleLogin = () => {
    navigate("/home");
  };

  const handleSignUp = () => {
    navigate("/cadastro");
  };

  return (
    <div className="login-fullscreen-container">
      
      
      <div className="login-image-panel">
        <img src={images} alt="Login Background" />
      </div>

   
      <div className="login-form-panel">
        <div className="form-wrapper">
          
          <div className="login-left">Bem-vindo</div>
          
          <form onSubmit={handleLogin}>
            <div className="login-inputs">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Digite seu email" 
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="login-inputs">
              <label>Senha</label>
              <input 
                type="password" 
                placeholder="Digite sua senha"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn-entrar">Entrar</button>
            
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <FcGoogle size={22} /> Entrar com Google
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