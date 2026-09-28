import axios from 'axios'
import images from "../assets/home-log/teste cadastro.png"; 
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import olhoAberto from '../assets/home-log/olho aberto.png';
import olhoFechado from '../assets/home-log/olho fechado.png';
import { useState, useEffect } from "react";
import "../css/home/Cadastro.css"

interface Posto {
    pos_id: number;   
    pos_nome: string;  
}

function CadastroADM(){

const navigate = useNavigate(); 
const [email, setEmail] = useState("");
const [matricula, setMatricula] = useState("");
const [cpf, setCpf] = useState("");
const [text1, setText1] = useState(""); 
const [tel, setTel] = useState("");
const [posto_id, setpos] = useState("");
const [password, setPassword] = useState(""); 
const [confirmacaodesenha, setConfirmacao] = useState("");
const[olhoPassword, setOlhoPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [postos, setPostos] = useState<Posto[]>([]);
const senhasIguais = password === confirmacaodesenha;

    useEffect(() => {
        async function carregarPostos() {
            try {
                const response = await axios.get('https://backend-insumed-lhac.vercel.app/postos');
                setPostos(response.data);
                console.log("Postos carregados:", response.data);
            } catch (error) {
                console.error('Erro ao buscar postos:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Não foi possível carregar a lista de postos.',
                    confirmButtonColor: '#d33'
                });
            }
        }
        carregarPostos();
    }, []);

    const handleCadastro = async () => {
        if (password !== confirmacaodesenha) {
            Swal.fire({
                icon: 'error',
                title: 'Ops...',
                text: 'Os campos referente a senha devem ter a mesma senha, tente novamente!',
                confirmButtonColor: '#d33'
            });
            return; 
        }
        if (!posto_id) {
            Swal.fire({
                icon: 'error',
                title: 'Ops...',
                text: 'Selecione um posto!',
                confirmButtonColor: '#d33'
            });
            return;
        }

        try {
            const response = await axios.post('https://backend-insumed-lhac.vercel.app/administrador', {
                matricula: matricula,    
                nome: text1,
                email: email,
                telefone: tel,
                cpf: cpf,
                posto_id: parseInt(posto_id),
                senha: password,
            });
            
            console.log("Admin criado:", response.data);
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
        setMatricula("");  
        setEmail("");
        setCpf("");
        setText1("");
        setTel("");
        setPassword("");
        setpos("");
        setConfirmacao("");
    };
    return(
        <>
        <div className="login-fullscreen-container">
    
        <div className="login-image-panel">
            <img src={images} alt="Login Background" />
        </div>

        <div className="login-form-panel">
        <div className="form-wrapper">
        <div className="Text-Cadastro">Cadastre-se Administrador</div>

    <form className="formulario" onSubmit={(e) => {e.preventDefault(); 
    handleCadastro();}}>
        <div className="Alinha-campos">
        <div className="campo">
            <label>Sua Matricula</label>
                <input                                        type="text"                                    placeholder="Digite sua matrícula"                                        required                                        value={matricula}                                    onChange={(e) => setMatricula(e.target.value)}/>
         </div>
        </div>
        <div className="Alinha-campos">
          <div className="campo">
                <label>Seu Nome Completo</label>
                    <input type="text" placeholder="Digite o seu nome completo"
                     required value={text1} onChange={(e) => setText1(e.target.value)} />
            </div>
            </div>
                <div className="Alinha-campos">
                <div className="campo">
                    <label htmlFor="postos">Unidade de Saúde</label>
           
                <select
                    id="postos"                 
                    value={posto_id} 
                    onChange={(e) => setpos(e.target.value)} 
                    required >
                    <option value="">
                        Selecione uma unidade
                    </option>
                    {postos.map((posto) => (
                    <option
                        key={posto.pos_id} 
                        value={posto.pos_id} > 
                        {posto.pos_nome}
                    </option>
                        ))}
                    </select>
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
            onChange={(e) => setTel(e.target.value)} 
                 />
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
            onChange={(e) => setEmail(e.target.value)}/>
         </div>
          </div>

         <div className="Alinha-campos">
          <div className="campo">
           <div className="input-password">
           <label>Crie uma Senha </label>
            <input
            type={olhoPassword ? 'text' : 'password'}
            placeholder="Crie sua senha"
            pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$"
            title="A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiuscula, uma letra minúscula, qualquer caractere especial e um número."
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
            <img  
              src={olhoPassword ? olhoAberto : olhoFechado}
            alt="Mostrar senha"
            className="icone-olho"
            onClick={() => setOlhoPassword(!olhoPassword)} />
             </div>
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
    </div>
    </div>

         <div className='btn-login'>
            <button type="submit">Cadastrar</button>
        </div>
        <div className='btn-login1'>
         <button type="reset" onClick={limparFormulario}>Limpar</button>
         </div>

         </form>
       </div>
        </div>
         </div>
        </>
    );
}

export default CadastroADM;