import axios from 'axios'
import BotaoOlho from "../components/universais/BotaoOlho";
import PainelMarca from "../components/home/PainelMarca";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { useState } from "react";
import "../css/home/Cadastro.css"
import BotaoVoltar from "../components/universais/BotaoVoltar";
import ForcaSenha, { MensagemErro } from "../components/universais/ForcaSenha";
import {
  mascaraCPF, mascaraTelefone, mensagemErroApi, temErros,
  validarConfirmacaoSenha, validarCPF, validarEmail, validarNome,
  validarSenha, validarTelefone,
} from "../utils/validacoes";
import { API_URL } from "../config";
import { useConvite } from "../hook/useConvite";
import AvisoConvite from "../components/universais/AvisoConvite";


function CadastroAUT(){

const navigate = useNavigate();
// cadastro só pelo link do convite gerado pelo administrador universal
const convite = useConvite("AUTORIZADOR");
    
const handleCadastro = async () => {
 setTentouEnviar(true);
  if (temErros(erros)) {
    Swal.fire({
      icon: 'error',
      title: 'Confira os dados',
      text: 'Alguns campos estão incorretos ou não foram preenchidos. Corrija os campos destacados.',
      confirmButtonColor: '#d33'
    });
    return;
  }
  setEnviando(true);
  try {
    await axios.post(`${API_URL}/autorizador`, {  
  nome: text1.trim().replace(/\s+/g, " "),
  email: email.trim().toLowerCase(),
  telefone: tel,
  cpf: cpf,
  senha: password,
  confirmacao_senha: confirmacaodesenha,
  convite: convite.codigo,
});
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
      text: mensagemErroApi(error, 'Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente.'),
      confirmButtonColor: '#d33'
    });
  } finally {
    setEnviando(false);
  }
}

const limparFormulario = () => {
 
  setEmail("");
  setCpf("");
  setText1("");
  setTel("");
  setPassword("");
  setConfirmacao("");
  setTentouEnviar(false);

};
      const [email, setEmail] = useState("");
     
      const [cpf, setCpf] = useState("");
      const [text1, setText1] = useState("");
  const [tel, setTel] = useState("");
   const [password, setPassword] = useState(""); 
     const [confirmacaodesenha, setConfirmacao] = useState("");
     const[olhoPassword, setOlhoPassword] =useState(false);
      
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      const senhasIguais = password===confirmacaodesenha
const [tentouEnviar, setTentouEnviar] = useState(false);
const [enviando, setEnviando] = useState(false);
const erros = {
    nome: validarNome(text1),
    telefone: validarTelefone(tel),
    cpf: validarCPF(cpf),
    email: validarEmail(email),
    senha: validarSenha(password),
    confirmacao: validarConfirmacaoSenha(password, confirmacaodesenha),
};
const erroDe = (campo: keyof typeof erros) => (tentouEnviar ? erros[campo] : null);
const classeDe = (campo: keyof typeof erros) => (erroDe(campo) ? "input-erro" : "");
      return(
        <>
   <div className="login-fullscreen-container">
    
      <PainelMarca />


     <div className="login-form-panel">
       <BotaoVoltar para="/login" className="botao-voltar--flutuante" />
        <div className="form-wrapper">
    <div className="Text-Cadastro">Cadastre-se Autorizador</div>

      
  
    {!convite.info ? (
      <AvisoConvite carregando={convite.carregando} erro={convite.erro} />
    ) : (
     <form className="formulario" noValidate onSubmit={(e) => { e.preventDefault(); handleCadastro(); }}>
        
        
        <div className="Alinha-campos">
        
            </div>

      <div className="Alinha-campos">
        <div className="campo">
          <label>Seu Nome Completo</label>
          <input
            type="text"
            placeholder="Digite o seu nome completo"
            name="text"
            required
            value={text1}
            className={classeDe("nome")}
            onChange={(e) => setText1(e.target.value)} />
            <MensagemErro erro={erroDe("nome")} />
        </div>
        
        <div className="campo">
          <label>Numero de Telefone</label>
          <input
            type="tel"
            placeholder="(24) 99999-9999"
            required
            value={tel}
            className={classeDe("telefone")}
            onChange={(e) => setTel(mascaraTelefone(e.target.value))} />
            <MensagemErro erro={erroDe("telefone")} />
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
            className={classeDe("cpf")}
            onChange={(e) => setCpf(mascaraCPF(e.target.value))} />
            <MensagemErro erro={erroDe("cpf")} />
        </div>


        <div className="campo">
          <label>Email</label>
          <input
            type="email"
            placeholder="Digite o seu Email"
            required
            value={email}
            className={classeDe("email")}
            onChange={(e) => setEmail(e.target.value)} />
            <MensagemErro erro={erroDe("email")} />
        </div>
      </div>

<div className="Alinha-campos">
      <div className="campo">
        <label>Crie uma Senha</label>
        <div className="campo-senha">
        <input
          type={olhoPassword? 'text': 'password'}
          placeholder="Crie sua senha"
          value={password}
          className={classeDe("senha")}
            onChange={(e) => setPassword(e.target.value)} />

          <BotaoOlho visivel={olhoPassword} onAlternar={() => setOlhoPassword(!olhoPassword)} />
      </div>
            <ForcaSenha senha={password} />
            <MensagemErro erro={erroDe("senha")} />
      </div>

      <div className="campo">
        <label>Confirme sua senha</label>
        <div className="campo-senha">
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

            <BotaoOlho visivel={showConfirmPassword} onAlternar={() => setShowConfirmPassword(!showConfirmPassword)} />
      
       </div>
        <MensagemErro erro={confirmacaodesenha || tentouEnviar ? erros.confirmacao : null} />   
      </div>

</div>

<div className='btn-login'>
 
      <button type="submit" disabled={enviando}>{enviando ? "Cadastrando..." : "Cadastrar"}</button>


    </div>

    <div className='btn-login1'>

    <button type="reset" onClick={limparFormulario}> Limpar</button>
</div>

    </form>
    )}

      
 </div>


    </div>
    </div>
    
    </>
);
}
  

export default CadastroAUT;