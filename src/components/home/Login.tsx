
import "../../css/home/Loginteste.css"
import{useState} from "react"
import bannerlogin from "../../assets/home-log/bannerlogin.png"

const Loginteste: React.FC = () => {
const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    return(
       <section className="container">
        <div className="banner">
    <img src={bannerlogin} alt="banner" />
  </div>


<form>
<div className="login-inputs">
    <h1 className="login-left">
        Cadastre-se
        
        </h1>

          <label>Seu CPF ou Email</label>
          <input type="email"
            name="email"
            placeholder="Digite o seu email"
            onChange={(e) => setEmail(e.target.value)}
          />
<br/>
          <label>Sua senha</label>
          <input
            type="password"
            name="password"
            placeholder="Digite a sua senha"
            onChange={(e) => setPassword(e.target.value)}
          />

          <p>Esqueceu sua senha?</p>

          <button type="submit">Entrar</button>

        </div>
</form>



</section> 


    );
};
export default Loginteste