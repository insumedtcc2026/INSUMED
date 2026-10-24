import axios from 'axios'
import images from "../assets/home-log/teste cadastro.webp"; 
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import olhoAberto from '../assets/home-log/olho aberto.webp';
import olhoFechado from '../assets/home-log/olho fechado.webp';
import { useState } from "react";
import "../css/home/Cadastro.css"
import BotaoVoltar from "../components/universais/BotaoVoltar";
import ForcaSenha, { MensagemErro } from "../components/universais/ForcaSenha";
import {
  mascaraCPF, mascaraTelefone, mensagemErroApi, temErros,
  validarConfirmacaoSenha, validarCPF, validarEmail, validarNome,
  validarObrigatorio, validarSenha, validarTelefone, validarMatricula, normalizarMatricula, MATRICULA_MAX,
} from "../utils/validacoes";
import { API_URL } from "../config";
import { useConvite } from "../hook/useConvite";
import AvisoConvite from "../components/universais/AvisoConvite";

function CadastroADM(){

const navigate = useNavigate(); 
const [email, setEmail] = useState("");
const [matricula, setMatricula] = useState("");
const [cpf, setCpf] = useState("");
const [text1, setText1] = useState(""); 
const [tel, setTel] = useState("");
// a unidade vem do convite (escolhida por quem convidou)
const convite = useConvite("ADMIN");
const posto_id = convite.info?.posto ? String(convite.info.posto.pos_id) : "";
const [password, setPassword] = useState(""); 
const [confirmacaodesenha, setConfirmacao] = useState("");
const[olhoPassword, setOlhoPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const senhasIguais = password === confirmacaodesenha;
const [tentouEnviar, setTentouEnviar] = useState(false);
const [enviando, setEnviando] = useState(false);
const erros = {
    matricula: validarMatricula(matricula),
    posto_id: validarObrigatorio(posto_id, "a unidade de saúde"),
    nome: validarNome(text1),
    telefone: validarTelefone(tel),
    cpf: validarCPF(cpf),
    email: validarEmail(email),
    senha: validarSenha(password),
    confirmacao: validarConfirmacaoSenha(password, confirmacaodesenha),
};
const erroDe = (campo: keyof typeof erros) => (tentouEnviar ? erros[campo] : null);
const classeDe = (campo: keyof typeof erros) => (erroDe(campo) ? "input-erro" : "");

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
            await axios.post(`${API_URL}/administrador`, {
                matricula: normalizarMatricula(matricula),
                nome: text1.trim().replace(/\s+/g, " "),
                email: email.trim().toLowerCase(),
                telefone: tel,
                cpf: cpf,
                posto_id: parseInt(posto_id),
                convite: convite.codigo,
                senha: password,
  confirmacao_senha: confirmacaodesenha,
            });
            
            await Swal.fire({
                icon: 'success',
                title: 'Cadastro realizado!',
                text: 'Seu cadastro foi efetuado com êxito.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ir para o Login'
            })
            limparFormulario();
            navigate('/login');

        } catch (error) {
            // os dados preenchidos continuam no formulário para corrigir
            console.error("Erro:", error);
            Swal.fire({
                icon: 'error',
                title: 'Não foi possível cadastrar',
                text: mensagemErroApi(error, 'Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente.'),
                confirmButtonColor: '#d33'
            });
        } finally {
    setEnviando(false);
  }
    }
    const limparFormulario = () => {
        setMatricula("");  
        setEmail("");
        setCpf("");
        setText1("");
        setTel("");
        setPassword("");
        setConfirmacao("");
  setTentouEnviar(false);
    };
    return(
        <>
        <div className="login-fullscreen-container">
    
        <div className="login-image-panel">
            <img src={images} alt="Login Background" />
        </div>

        <div className="login-form-panel">
          <BotaoVoltar para="/login" className="botao-voltar--flutuante" />
        <div className="form-wrapper">
        <div className="Text-Cadastro">Cadastre-se Administrador</div>

    {!convite.info ? (
      <AvisoConvite carregando={convite.carregando} erro={convite.erro} />
    ) : (
    <form className="formulario" noValidate onSubmit={(e) => {e.preventDefault(); 
    handleCadastro();}}>
        <div className="Alinha-campos">
        <div className="campo">
            <label>Sua Matricula</label>
                <input                                        type="text"                                    placeholder="Ex.: 12345 ou A-1234" required value={matricula} className={classeDe("matricula")}
            maxLength={MATRICULA_MAX + 5} autoCapitalize="characters" aria-describedby="ajuda-matricula"
            onChange={(e) => setMatricula(e.target.value)}
            onBlur={() => setMatricula((m) => normalizarMatricula(m))}/>
            <p id="ajuda-matricula" className="text-xs text-gray-500">Letras, números e . - / (até {MATRICULA_MAX} caracteres).</p>
            <MensagemErro erro={erroDe("matricula")} />
         </div>
        </div>
        <div className="Alinha-campos">
          <div className="campo">
                <label>Seu Nome Completo</label>
                    <input type="text" placeholder="Digite o seu nome completo"
                     required value={text1} className={classeDe("nome")}
            onChange={(e) => setText1(e.target.value)} />
            <MensagemErro erro={erroDe("nome")} />
            </div>
            </div>
                <div className="Alinha-campos">
                <div className="campo">
                    <label htmlFor="postos">Unidade de Saúde</label>
                    {/* definida no convite; não pode ser trocada aqui */}
                    <input id="postos" type="text" value={convite.info?.posto?.pos_nome ?? ""} readOnly aria-readonly="true" />
                    <MensagemErro erro={erroDe("posto_id")} />
                </div>
            </div>
        <div className="Alinha-campos">
        <div className="campo">
                 <label>Numero de Telefone</label>                   
             <input
            type="tel"
            placeholder="(24) 99999-9999"
             required
            value={tel}
            className={classeDe("telefone")}
            onChange={(e) => setTel(mascaraTelefone(e.target.value))} 
                 />
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
            onChange={(e) => setEmail(e.target.value)}/>
            <MensagemErro erro={erroDe("email")} />
         </div>
          </div>

         <div className="Alinha-campos">
          <div className="campo">
           <div className="input-password">
           <label>Crie uma Senha </label>
            <input
            type={olhoPassword ? 'text' : 'password'}
            placeholder="Crie sua senha"
            value={password}
            className={classeDe("senha")}
            onChange={(e) => setPassword(e.target.value)} />
            <img  
              src={olhoPassword ? olhoAberto : olhoFechado}
            alt="Mostrar senha"
            className="icone-olho"
            onClick={() => setOlhoPassword(!olhoPassword)} />
             </div>
            <ForcaSenha senha={password} />
            <MensagemErro erro={erroDe("senha")} />
            </div>
             </div>

        
             <div className="Alinha-campos">
              <div className="campo">
          <div className="input-password">
        <label>Confirme sua senha</label>

     <input type={showConfirmPassword ? 'text' : 'password'}
      placeholder="Confirme sua senha"
       value={confirmacaodesenha}
       onChange={(e) => setConfirmacao(e.target.value)}
    className={confirmacaodesenha === "" ? "": senhasIguais? "input-correto": "input-erro"} />

   <img  
    src={showConfirmPassword ? olhoAberto : olhoFechado}
    alt="Mostrar senha"
     className="icone-olho"
     onClick={() => setShowConfirmPassword(!showConfirmPassword)}/>
    </div>
        <MensagemErro erro={confirmacaodesenha || tentouEnviar ? erros.confirmacao : null} />   
    </div>
    </div>

         <div className='btn-login'>
            <button type="submit" disabled={enviando}>{enviando ? "Cadastrando..." : "Cadastrar"}</button>
        </div>
        <div className='btn-login1'>
         <button type="reset" onClick={limparFormulario}>Limpar</button>
         </div>

         </form>
    )}
       </div>
        </div>
         </div>
        </>
    );
}

export default CadastroADM;