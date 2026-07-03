import axios from "axios"



import { useState } from "react";
import "../../css/home/Cadastro.css"

  function Cadastro(){
const handleCadastro = async () => {
  
  try {
    const response = await axios.post('http://localhost:3344/pacientes', {
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
  } catch (error) {
    console.error("Erro:", error);
  }
}
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
return(
  <>
    <div className="Text-Cadastro">Cadastre-se</div>


  <div className="Cadastro-container">
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
            placeholder=""
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
            placeholder=""
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
        
          <option>Feminino</option>
          <option>Masculino</option>
          <option>Outro</option>
          <option>Prefiro não responder</option>
        </select>
      </div>

      <div className="campo">
        <label>Crie uma Senha</label>
        <input
          type="password"
          placeholder="Crie sua senha"
          pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$"
          title="A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiuscula, uma letra minúscula, qualquer caractere especial e um número."
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="campo">
        <label>Confirme sua senha</label>
        <input
          type="password"
          placeholder="Confirme sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
      </div>

      

      <div className="campo">
        <label>Cor</label>
         <select
      
          value={cor}
          required
          onChange={(e) => setCor(e.target.value)}
        >
        
          <option>Branco</option>
          <option>Preto</option>
          <option>Pardo</option>
          <option>Amarelo</option>
          <option>Indigena</option>
          <option>Prefiro não responder</option>
        </select>
      </div>





      <div className="campo">
        <label>Endereço</label>
        <input
          type="text"
          required
          placeholder=" Ex: rua blabla, n123 cidade, estado"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)} />
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



    <button type="submit"
    className="btn-login"
    onClick={() => handleCadastro()}
    > Cadastrar</button>



      
 


    </div></>
);
}
  

export default Cadastro;