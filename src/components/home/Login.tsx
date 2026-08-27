import "../../css/home/Loginteste.css";
import axios from "axios";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import olhoAberto from '../../assets/home-log/olho aberto.png'
import olhoFechado from '../../assets/home-log/olho fechado.png'



import images from "../../assets/home-log/teste login.png"; 



const Loginteste: React.FC = () => {

   const[olhoPassword, setOlhoPassword] =useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
    const response = await axios.post(
          "https://backend-insumed-lhac.vercel.app/login",
           //("http://localhost:3344/login"),
          {
        email,
        senha: password
      }
    ); 
    console.log("RESPOSTA:", response.data);

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("usuario",JSON.stringify(response.data.usuario)
);


    console.log(response.data);

   if (response.data.tipo === "PACIENTE") {
    navigate("/home");
}

if (response.data.tipo === "PRESCRITOR") {
    navigate("/homePrescritor");
}

if (response.data.tipo === "ADMIN") {
    navigate("/Agendamentos");
}

  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Ops...',
      text: 'Email ou senha inválidos!',
      confirmButtonColor: '#d33'
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