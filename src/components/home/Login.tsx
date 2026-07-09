import "../../css/home/Loginteste.css";
import axios from "axios";
import { useState} from "react";
import { useNavigate } from "react-router-dom";

import images from "../../assets/home-log/images.jpg"; 



const Loginteste: React.FC = () => {

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
    const response = await axios.post(
      "https://backend-insumed-lhac.vercel.app/login",
      {
        email,
        senha: password
      }
    ); 
    localStorage.setItem(
  "usuario",
  JSON.stringify(response.data.usuario)
);


    console.log(response.data);

    navigate("/home");

  } catch (error: any) {
    alert(error.response?.data?.msg || "Email ou senha inválidos");
  }
};
const handleSignUp = () => { navigate("/cadastro"); };

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
            
            <button type="submit" className="btn-entrar" >Entrar</button>
            
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