import "../../css/home/Loginteste.css";
import axios from "axios";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import olhoAberto from '../../assets/home-log/olho aberto.png'
import olhoFechado from '../../assets/home-log/olho fechado.png'

import images from "../../assets/home-log/teste login.png"; 
import BotaoVoltar from "../universais/BotaoVoltar";



const Loginteste: React.FC = () => {

   const[olhoPassword, setOlhoPassword] =useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
) => {

    e.preventDefault();

    try {

        
const response = await axios.post(
            "https://backend-insumed-lhac.vercel.app/login",
            {
                email,
                senha: password
            }
        );

        console.log("RESPOSTA DO LOGIN:", response.data);

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

        console.log("TIPO DO USUÁRIO:", tipo);
    } catch (error: any) {

        console.error(
            "ERRO NO LOGIN:",
            error.response?.data || error
        );

        Swal.fire({
            icon: "error",
            title: "Ops...",
            text: "Email ou senha inválidos!",
            confirmButtonColor: "#d33"
        });
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
              <div className="input-password1">
              <label>Senha</label>
              <input 
                type={olhoPassword? 'text': 'password'}
                placeholder="Digite sua senha"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
               <img  src={olhoPassword ? olhoAberto : olhoFechado}
        alt="Mostrar senha"
        className="icone-olho1"
        onClick={() => setOlhoPassword(!olhoPassword)}
        />
        </div>
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