
import "../../css/home/Loginteste.css"
import{useState} from "react"
import bannerlogin from "../../assets/home-log/bannerlogin.png"
import { FcGoogle } from "react-icons/fc";

const Loginteste: React.FC = () => {
const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    return(
       <section className="container">
        <div className="banner">
    <img src={bannerlogin} alt="banner" />
  </div>

<h1 className="login-left">
        Cadastre-se
        
        </h1>
<form>
<div className="login-inputs">
    

          <label>Seu CPF ou Email</label>
          <input type="email"
            name="email"
            placeholder="Digite o seu CPF ou Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
<br/>
          <label>Sua senha</label>
          <input
            type="password"
            name="password"
            placeholder="Digite a sua senha"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <p>Esqueceu sua senha?</p>

          <button type="submit">Entrar</button>
<button className="google-btn"> Continue with Google
  <FcGoogle size={28} className="google-icon" />
</button>
<p className="paragrafo">Não tem uma conta? Cadastre-se</p>
<button>Cadastrar</button>
         

        </div>
</form>



</section> 


    );
};
export default Loginteste