import Login from "./Login"
import { useState } from "react";

  function Cadastro(){
      const [email, setEmail] = useState("");
      const [cpf, setCpf] = useState("");
      const [text1, setText1] = useState("");
      const [date, setDate] = useState("");
      const [genero, setGenero] = useState("");
  const [tel, setTel] = useState("");
return(
    <> <label>Seu Nome Completo </label><input
        type="text1"
        name="text1"
        placeholder="Digite o seu nome completo"
        required
        value={text1}
        onChange={(e) => setText1(e.target.value)} />
        
        <label>Seu CPF </label>
        <input
        type="number"
        name="cpf"
        placeholder="000.000.000-00"
        required
        value={cpf}
        onChange={(e) => setCpf(e.target.value)} />

         <label>Data de Nascimento </label>
        <input
        type="date"
        name="date"
        placeholder="Selecione a data do seu nascimento"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)} />
        

         <label>Gênero </label>
        <input
        type="radio"
        name="genero"
        placeholder="Selecioneo seu gênero que você se identifique "
        required
        value={genero}
        onChange={(e) => setGenero(e.target.value)} />
        


         <label>Numero de Telefone </label>
        <input
        type="number"
        name="tel"
        placeholder="+00(00) 00000-0000"
        required
        value={tel}
        onChange={(e) => setTel(e.target.value)} />
        


         <label>Email </label>
        <input
        type="email"
        name="text1"
        placeholder="Digite o seu Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)} />
        


    
        


        
        
        
        
        </>
);
}

export default Cadastro;