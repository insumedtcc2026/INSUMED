import axios from 'axios'
import images from "../../assets/home-log/teste cadastro.png"; 
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import olhoAberto from '../../assets/home-log/olho aberto.png';
import olhoFechado from '../../assets/home-log/olho fechado.png';


import { useState } from "react";
import "../../css/home/Cadastro.css"

  function Cadastro(){

const navigate = useNavigate();
    
const handleCadastro = async () => {
 if (password !== confirmacaodesenha) {
    Swal.fire({
      icon: 'error',
      title: 'Ops...',
      text: 'Os campos referente a senha devem ter a mesma senha, tente novamente!',
      confirmButtonColor: '#d33'
    });
    return; // Muda essa parte
  }
  
  try {
    const response = await axios.post('https://backend-insumed-lhac.vercel.app/pacientes', {
  nome: text1,
  email: email,
  telefone: tel,
  cpf: cpf,
  data_nasc: date,
  sexo: genero,
  endereco: endereco,
  raca: cor,
  senha: password
});
    console.log(response.data);
   Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado!',
        text: 'Seu cadastro foi efetuado com êxito.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ir para o Login'
      })
      limparFormulario();
      navigate('/login');
  } catch (error) {
    console.error("Erro:", error);
    Swal.fire({
      icon: 'error',
      title: 'Ops...',
      text: 'Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente.',
      confirmButtonColor: '#d33'
    });
  }
}

const limparFormulario = () => {
  setEmail("");
  setCpf("");
  setText1("");
  setDate("");
  setGenero("");
  setTel("");
  setPassword("");
  setConfirmacao("");
  setCor("");
  setCep("");
    setEndereco("");
};
      const [email, setEmail] = useState("");
      const [cpf, setCpf] = useState("");
      const [text1, setText1] = useState("");
      const [date, setDate] = useState("");
      const [genero, setGenero] = useState("");
  const [tel, setTel] = useState("");
   const [password, setPassword] = useState(""); 
   const [cor, setCor] = useState("");
     const [cep, setCep] = useState("");
     const [endereco, setEndereco] = useState("");
     const [confirmacaodesenha, setConfirmacao] = useState("");
     const[olhoPassword, setOlhoPassword] =useState(false);
      
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      const senhasIguais = password===confirmacaodesenha
      return(
        <>
   <div className="login-fullscreen-container">
    
      <div className="login-image-panel">
        <img src={images} alt="Login Background" />
      </div>


     <div className="login-form-panel">
        <div className="form-wrapper">
    <div className="Text-Cadastro">Cadastre-se</div>

      
  
     <form className="formulario" onSubmit={(e) => { e.preventDefault(); handleCadastro(); }}>
 
      <div className="Alinha-campos">
        <div className="campo">
          <label>Seu Nome Completo</label>
          <input
            type="text"
            placeholder="Digite o seu nome completo"
            name="text"
            required
            onChange={(e) => setText1(e.target.value)} />
        </div>
        <div className="campo">
          <label>Numero de Telefone</label>
          <input
            type="tel"
            placeholder="(24) 99999-9999"
            required
            value={tel}
            onChange={(e) => setTel(e.target.value)} />
        </div>
      </div>

      <div className="Alinha-campos">
        <div className="campo">
          <label>Seu CPF</label>
          <input
            type="text"
            placeholder="123.456.789-00"
            required
            value={cpf}
            onChange={(e) => setCpf(e.target.value)} />
        </div>
        <div className="campo">
          <label>Email</label>
          <input
            type="email"
            placeholder="Digite o seu Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="Alinha-campos">
      <div className="campo">
        <label>Data de Nascimento</label>
        <input
          type="date"
          placeholder="Digite sua Data de Nascimento"
          value={date}
          required
          onChange={(e) => setDate(e.target.value)} />
      
      </div>

      <div className="campo">
        <label>Gênero</label>
        <select
      
      value={genero}
      required
      onChange={(e) => setGenero(e.target.value)}
        >
        <option></option>
          <option>Feminino</option>
          <option>Masculino</option>
          <option>Outro</option>
          <option>Prefiro não responder</option>
        </select>
      </div>
      </div>
<div className="Alinha-campos">
      <div className="campo">
        <div className="input-password">
        <label>Crie uma Senha</label>
        <input
          type={olhoPassword? 'text': 'password'}
          placeholder="Crie sua senha"
          pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$"
          title="A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiuscula, uma letra minúscula, qualquer caractere especial e um número."
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

          <img  src={olhoPassword ? olhoAberto : olhoFechado}
        alt="Mostrar senha"
        className="icone-olho"
        onClick={() => setOlhoPassword(!olhoPassword)}
        />
      </div>
      </div>

      <div className="campo">
        <div className="input-password">
        <label>Confirme sua senha</label>
        <input
          type={showConfirmPassword? 'text': 'password'}
          placeholder="Confirme sua senha"
          value={confirmacaodesenha}
          onChange={(e)=>setConfirmacao(e.target.value)}
          className={
        confirmacaodesenha === ""
        ? ""// sem classe css
        : senhasIguais//compara as senha
        ? "input-correto"
        : "input-erro"
    }
          />

            <img  src={showConfirmPassword ? olhoAberto : olhoFechado}
        alt="Mostrar senha"
        className="icone-olho"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      
       </div>   
      </div>

</div>



<div className="Alinha-campos">

      <div className="campo">


        <label>Cor</label>
         <select

value={cor}
required
onChange={(e) => setCor(e.target.value)}
>
          <option></option>
          <option>Branco</option>
          <option>Preto</option>
          <option>Pardo</option>
          <option>Amarelo</option>
          <option>Indigena</option>
          <option>Prefiro não responder</option>
        </select>
      </div>
        
        
      <div className="campo">
        <label>CEP</label>
        <input
          type="text"
          placeholder="00000-000"
          required
          value={cep}
          onChange={(e) => setCep(e.target.value)} />
        </div>
        </div>
<div className="Alinha-campos">
      <div className="campo">
       <label>Endereço</label>
        <input
          type="text"
          required
          placeholder=" Ex: rua blabla, n123 cidade, estado"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)} />
</div>
      </div>

<div className='btn-login'>
 
      <button type="submit"> Cadastrar</button>


    </div>

    <div className='btn-login1'>

    <button type="reset" onClick={limparFormulario}> Limpar</button>
</div>

    </form>

      
 </div>


    </div>
    </div>
    
    </>
);
}
  

export default Cadastro;