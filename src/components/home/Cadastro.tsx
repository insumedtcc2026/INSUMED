import Login from "./Login"
import { useState } from "react";
import "../../css/home/Cadastro.css"

  function Cadastro(){
      const [email, setEmail] = useState("");
      const [cpf, setCpf] = useState("");
      const [text1, setText1] = useState("");
      const [date, setDate] = useState("");
      const [genero, setGenero] = useState("");
  const [tel, setTel] = useState("");
return(
    <div className="Cadastro-container"> <label>Seu Nome Completo </label>
             <br></br>

    <input
        type="text1"
        name="text1"
        placeholder="Digite o seu nome completo"
        required
        value={text1}
        onChange={(e) => setText1(e.target.value)}    />
        <br></br>
        <label>Seu CPF </label>
                 <br></br>

        <input
        type="text"
        name="cpf"
        placeholder="000.000.000-00"
        required
        value={cpf}
        onChange={(e) => setCpf(e.target.value)} />
        <br></br>
         <label>Data de Nascimento </label>
                  <br></br>

        <input
        type="date"
        name="date"
        placeholder="Selecione a data do seu nascimento"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)} />
        <br></br>

         
         <label htmlFor="genero">Gênero:</label>
                  <br></br>


<select id="genero" name="genero"
        
        value={genero}
        onChange={(e) => setGenero(e.target.value)} >
  <option value="volvo">Feminino</option>
  <option value="saab">Masculino</option>
  <option value="opel">Outro</option>
  <option value="audi">Prefiro não responder</option>
        
</select>
    
        
            <br></br>

         <label>Numero de Telefone </label>
         <br></br>
        <input
        type="tel"
        name="tel"
        placeholder="+00(00) 00000-0000"
        required
        value={tel}
        onChange={(e) => setTel(e.target.value)} />
        

         <br></br>
         <label>Email </label>
                  <br></br>

        <input
        type="email"
        name="text1"
        placeholder="Digite o seu Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)} />
        


    
        


        
        
        
        
        </div>
);
}

export default Cadastro;