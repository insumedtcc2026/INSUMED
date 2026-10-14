import axios from 'axios'
import images from "../../assets/home-log/teste cadastro.webp";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import olhoAberto from '../../assets/home-log/olho aberto.png';
import olhoFechado from '../../assets/home-log/olho fechado.png';
import { useState } from "react";
import "../../css/home/Cadastro.css";
import BotaoVoltar from "../universais/BotaoVoltar";
import ForcaSenha, { MensagemErro } from "../universais/ForcaSenha";
import {
  mascaraCEP, mascaraCPF, mascaraTelefone, mensagemErroApi, temErros,
  validarCEP, validarConfirmacaoSenha, validarCPF, validarDataNascimento,
  validarEmail, validarNome, validarSenha, validarTelefone,
  type ErrosFormulario,
} from "../../utils/validacoes";
import { API_URL } from "../../config";

const formularioVazio = {
  nome: "",
  telefone: "",
  cpf: "",
  email: "",
  dataNasc: "",
  sexo: "",
  senha: "",
  confirmacao: "",
  cor: "",
  cep: "",
  endereco: "",
};

type Campo = keyof typeof formularioVazio;

function validarFormulario(f: typeof formularioVazio): ErrosFormulario<Campo> {
  return {
    nome: validarNome(f.nome),
    telefone: validarTelefone(f.telefone),
    cpf: validarCPF(f.cpf),
    email: validarEmail(f.email),
    dataNasc: validarDataNascimento(f.dataNasc),
    // gênero e cor/raça são opcionais (vazio = "prefiro não responder")
    sexo: null,
    senha: validarSenha(f.senha),
    confirmacao: validarConfirmacaoSenha(f.senha, f.confirmacao),
    cor: null,
    cep: validarCEP(f.cep),
    endereco: f.endereco.trim().length < 5 ? "Informe o endereço completo." : null,
  };
}

function Cadastro(){

const navigate = useNavigate();
const [form, setForm] = useState(formularioVazio);
const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
const [tentouEnviar, setTentouEnviar] = useState(false);
const [enviando, setEnviando] = useState(false);
const [olhoPassword, setOlhoPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const erros = validarFormulario(form);

// Mostra o erro de um campo só depois que o usuário saiu dele ou tentou enviar.
const erroDe = (campo: Campo) => (tocados[campo] || tentouEnviar ? erros[campo] : null);

const classeDe = (campo: Campo) => {
  if (!tocados[campo] && !tentouEnviar) return "";
  return erros[campo] ? "input-erro" : "input-correto";
};

// A confirmação dá retorno imediato assim que o usuário começa a digitar.
const confirmacaoVisivel = form.confirmacao !== "" || Boolean(tocados.confirmacao) || tentouEnviar;

const alterar = (campo: Campo, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));
const sair = (campo: Campo) => setTocados((t) => ({ ...t, [campo]: true }));

const propsCampo = (campo: Campo) => ({
  value: form[campo],
  onBlur: () => sair(campo),
  className: classeDe(campo),
  "aria-invalid": Boolean(erroDe(campo)),
});

const handleCadastro = async () => {
  setTentouEnviar(true);

  if (temErros(erros)) {
    Swal.fire({
      icon: 'error',
      title: 'Confira os dados',
      text: 'Alguns campos estão incorretos ou não foram preenchidos. Corrija os campos destacados em vermelho.',
      confirmButtonColor: '#d33'
    });
    return;
  }

  setEnviando(true);
  try {
    await axios.post(
      `${API_URL}/pacientes`,
      {
        nome: form.nome.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone,
        cpf: form.cpf,
        data_nasc: form.dataNasc,
        sexo: form.sexo,
        endereco: form.endereco.trim(),
        raca: form.cor,
        senha: form.senha,
        confirmacao_senha: form.confirmacao,
        cep: form.cep,
      }
    );

    await Swal.fire({
      icon: 'success',
      title: 'Cadastro realizado!',
      text: 'Seu cadastro foi efetuado com êxito.',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ir para o Login'
    });

    limparFormulario();
    navigate('/login');

  } catch (error) {
    console.error("Erro no cadastro:", error);

    Swal.fire({
      icon: 'error',
      title: 'Não foi possível cadastrar',
      text: mensagemErroApi(error, 'Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente.'),
      confirmButtonColor: '#d33'
    });
  } finally {
    setEnviando(false);
  }
};

const limparFormulario = () => {
  setForm(formularioVazio);
  setTocados({});
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
    <div className="Text-Cadastro">Cadastre-se</div>



     <form className="formulario" noValidate onSubmit={(e) => { e.preventDefault(); handleCadastro(); }}>

      <div className="Alinha-campos">
        <div className="campo">
          <label>Seu Nome Completo</label>
          <input
            type="text"
            placeholder="Digite o seu nome completo"
            name="nome"
            autoComplete="name"
            maxLength={100}
            {...propsCampo("nome")}
            onChange={(e) => alterar("nome", e.target.value)} />
          <MensagemErro erro={erroDe("nome")} />
        </div>
        <div className="campo">
          <label>Numero de Telefone</label>
          <input
            type="tel"
            placeholder="(24) 99999-9999"
            autoComplete="tel"
            inputMode="numeric"
            {...propsCampo("telefone")}
            onChange={(e) => alterar("telefone", mascaraTelefone(e.target.value))} />
          <MensagemErro erro={erroDe("telefone")} />
        </div>
      </div>

      <div className="Alinha-campos">
        <div className="campo">
          <label>Seu CPF</label>
          <input
            type="text"
            placeholder="123.456.789-00"
            inputMode="numeric"
            {...propsCampo("cpf")}
            onChange={(e) => alterar("cpf", mascaraCPF(e.target.value))} />
          <MensagemErro erro={erroDe("cpf")} />
        </div>
        <div className="campo">
          <label>Email</label>
          <input
            type="email"
            placeholder="Digite o seu Email"
            autoComplete="email"
            maxLength={254}
            {...propsCampo("email")}
            onChange={(e) => alterar("email", e.target.value)} />
          <MensagemErro erro={erroDe("email")} />
        </div>
      </div>

      <div className="Alinha-campos">
      <div className="campo">
        <label>Data de Nascimento</label>
        <input
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          {...propsCampo("dataNasc")}
          onChange={(e) => alterar("dataNasc", e.target.value)} />
        <MensagemErro erro={erroDe("dataNasc")} />
      </div>

      <div className="campo">
        <label className='labels'>Gênero <span className="rotulo-opcional">(opcional)</span></label>
        <select
          {...propsCampo("sexo")}
          onChange={(e) => alterar("sexo", e.target.value)}
        >
         <option value="">Selecione</option>
          <option value='Feminino'>Feminino</option>
          <option value='Masculino'>Masculino</option>
          <option value='Outro'>Outro</option>
          <option value='Prefiro não responder'>Prefiro não responder</option>
        </select>
        <MensagemErro erro={erroDe("sexo")} />
      </div>
      </div>
<div className="Alinha-campos">
      <div className="campo">
        <div className="input-password">
        <label>Crie uma Senha</label>
        <input
          type={olhoPassword? 'text': 'password'}
          placeholder="Crie sua senha"
          autoComplete="new-password"
          maxLength={64}
          {...propsCampo("senha")}
          onChange={(e) => alterar("senha", e.target.value)} />

          <img  src={olhoPassword ? olhoAberto : olhoFechado}
        alt="Mostrar senha"
        className="icone-olho"
        onClick={() => setOlhoPassword(!olhoPassword)}
        />
      </div>
        <ForcaSenha senha={form.senha} />
        <MensagemErro erro={erroDe("senha")} />
      </div>

      <div className="campo">
        <div className="input-password">
        <label>Confirme sua senha</label>
        <input
          type={showConfirmPassword? 'text': 'password'}
          placeholder="Confirme sua senha"
          autoComplete="new-password"
          maxLength={64}
          {...propsCampo("confirmacao")}
          className={confirmacaoVisivel ? (erros.confirmacao ? "input-erro" : "input-correto") : ""}
          onChange={(e)=>alterar("confirmacao", e.target.value)}
          />

            <img  src={showConfirmPassword ? olhoAberto : olhoFechado}
        alt="Mostrar senha"
        className="icone-olho"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        />

       </div>
        <MensagemErro erro={confirmacaoVisivel ? erros.confirmacao : null} />
      </div>

</div>



<div className="Alinha-campos">

      <div className="campo">

        <label className='text'>Raça/Cor <span className="rotulo-opcional">(opcional)</span></label>
         <select
          {...propsCampo("cor")}
          onChange={(e) => alterar("cor", e.target.value)}
>
          <option value="">Selecione</option>
          <option>Branca</option>
          <option>Preta</option>
          <option>Parda</option>
          <option>Amarela</option>
          <option>Indígena</option>
          <option>Prefiro não responder</option>
        </select>
        <MensagemErro erro={erroDe("cor")} />
      </div>


      <div className="campo">
        <label>CEP</label>
        <input
          type="text"
          placeholder="00000-000"
          inputMode="numeric"
          autoComplete="postal-code"
          {...propsCampo("cep")}
          onChange={(e) => alterar("cep", mascaraCEP(e.target.value))} />
        <MensagemErro erro={erroDe("cep")} />
        </div>
        </div>
<div className="Alinha-campos">
      <div className="campo">
       <label>Endereço</label>
        <input
          type="text"
          placeholder=" Ex: rua blabla, n123 cidade, estado"
          autoComplete="street-address"
          maxLength={200}
          {...propsCampo("endereco")}
          onChange={(e) => alterar("endereco", e.target.value)} />
        <MensagemErro erro={erroDe("endereco")} />
</div>
      </div>

<div className='btn-login'>

      <button type="submit" disabled={enviando}>{enviando ? "Cadastrando..." : "Cadastrar"}</button>


    </div>

    <div className='btn-login1'>

    <button type="reset" onClick={limparFormulario} disabled={enviando}> Limpar</button>
</div>

    </form>


 </div>


    </div>
    </div>

    </>
);
}


export default Cadastro;
