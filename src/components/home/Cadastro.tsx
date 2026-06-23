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
    <div className="Cadastro-container">

  <div className="campo">
    <label>Seu Nome Completo</label>
    <input
      type="text"
      placeholder="Digite o seu nome completo"
      value={text1}
      onChange={(e) => setText1(e.target.value)}
    />
  </div>

  <div className="campo">
    <label>Seu CPF</label>
    <input
      type="text"
      placeholder="000.000.000-00"
      value={cpf}
      onChange={(e) => setCpf(e.target.value)}
    />
  </div>

  <div className="campo">
    <label>Data de Nascimento</label>
    <input
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
    />
  </div>

  <div className="campo">
    <label>Gênero</label>
    <select
      value={genero}
      onChange={(e) => setGenero(e.target.value)}
    >
      <option>Feminino</option>
      <option>Masculino</option>
      <option>Outro</option>
      <option>Prefiro não responder</option>
    </select>
  </div>

  <div className="campo">
    <label>Numero de Telefone</label>
    <input
      type="tel"
      placeholder="+00(00) 00000-0000"
      value={tel}
      onChange={(e) => setTel(e.target.value)}
    />
  </div>

  <div className="campo">
    <label>Email</label>
    <input
      type="email"
      placeholder="Digite o seu Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

</div>
);
}

export default Cadastro;