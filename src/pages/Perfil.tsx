import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validarCEP, validarCPF, validarEmail, validarNome, validarTelefone } from "../utils/validacoes";
import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import BotaoVoltar from '../components/universais/BotaoVoltar';
import '../css/home/perfil.css';
import { useDadosUser } from '../hook/Dadosuser.tsx';
import { useValidarToken } from '../hook/Validartoken.tsx';
import Swal from 'sweetalert2';
import lapis from '../assets/home-log/lapis.webp'
import axios from 'axios';
import { API_URL } from "../config";




export default function Perfil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const { verificando } = useValidarToken("PACIENTE");
  const user = useDadosUser();

  const atualizarPaciente = async (
  campo: string,
  valor: string
) => {
  try {
    const token = localStorage.getItem("token_paciente");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Sessão expirada. Faça login novamente."
      });

      return;
    }

    const resposta = await axios.put(
      `${API_URL}/pacientes/perfil`,
      {
        campo,
        valor
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("================================");
    console.log("RESPOSTA DO BACKEND:");
    console.log(resposta.data);
    console.log("================================");

    // Se o backend retornar o usuário atualizado
    if (resposta.data.usuario) {

      localStorage.setItem(
        "usuario",
        JSON.stringify(resposta.data.usuario)
      );

      console.log(
        "USUÁRIO SALVO NO LOCALSTORAGE:",
        JSON.parse(localStorage.getItem("usuario_paciente") || "{}")
      );
    }

    await Swal.fire({
      icon: "success",
      title: "Alterado!",
      text: "Sua informação foi atualizada com sucesso.",
      confirmButtonColor: "#0057ff"
    });

    window.location.reload();

  } catch (error: any) {

    console.error("ERRO AO ATUALIZAR:", error);

    Swal.fire({
      icon: "error",
      title: "Erro",
      text:
        error.response?.data?.erro ||
        "Não foi possível atualizar sua informação."
    });
  }
};

  
const editarInformacao = async (
  campo: string,
  titulo: string,
  valorAtual: string
) => {
  const resultado = await Swal.fire({
    title: `Alterar ${titulo}`,
    input: "text",
    inputValue: valorAtual || "",
    showCancelButton: true,
    confirmButtonText: "Salvar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0057ff",
    cancelButtonColor: "#d33",
    inputAttributes: {
      autocomplete: "off",
    },

    inputValidator: (value) => {
      const texto = (value || "").trim();

      if (!texto) {
        return "Este campo não pode ficar vazio!";
      }

      // Mesmas regras do cadastro (o backend também valida).
      const validadores: Record<string, (v: string) => string | null> = {
        nome: validarNome,
        cpf: validarCPF,
        cep: validarCEP,
        email: validarEmail,
        telefone: validarTelefone,
        endereco: (v) => (v.length < 5 ? "Informe o endereço completo." : null),
      };
      const erroCampo = validadores[campo]?.(texto);
      if (erroCampo) {
        return erroCampo;
      }

      return null;
    },
  });

  if (
    resultado.isConfirmed &&
    typeof resultado.value === "string"
  ) {
    await atualizarPaciente(campo, resultado.value.trim());
  }
};

if (verificando) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-xl text-gray-600">
        Carregando seus dados...
      </p>
    </div>
  );
}



  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/home" />
      </div>

      <main className="pagina-conteudo mx-auto max-w-7xl px-6 py-8">
        <h1 className="titulo-secao">Meu Perfil</h1>
      </main>

      <div className="perfil-container-form">
        <label>
          <p>Nome Completo</p>
          <div className="input-com-editar">
          <input type="text" value={user.nome} readOnly />
           <button
      type="button"
      className="btn-editar"
      onClick={() =>
        editarInformacao(
          'nome',
          'Nome ',
          user.nome
        )
      }
    > <img src={lapis} alt="Editar" /></button>
          </div>
        </label>

        <label>
  <p>CPF</p>
  <div className="input-com-editar">
    <input type="text" value={user.cpf} readOnly />
  </div>
</label>

      
    



        <label>
          <p>CEP</p>
          <div className="input-com-editar">
          <input type="text" value={user.cep} readOnly />
           <button
      type="button"
      className="btn-editar"
      onClick={() =>
        editarInformacao(
          'cep',
          'Cep',
          user.cep
        )
      }
    > <img src={lapis} alt="Editar" /></button>
          </div>
        </label>

        <label>
  <p>Data de Nascimento</p>
  <div className="input-com-editar">
  <input 
    type="text" 
    value={
      user.data_nascimento 
        ? new Date(user.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
        : ''
    } readOnly />
  

  </div>
</label>

        <label>
          <p>Endereço de Email</p>
          <div className="input-com-editar">
          <input type="text" value={user.email} readOnly />

           <button
      type="button"
      className="btn-editar"
      onClick={() =>
        editarInformacao(
          'email',
          'Email',
          user.email
        )
      }
    > <img src={lapis} alt="Editar" /></button>
          </div>
        </label>

        <label>
          <p>Endereço</p>
          <div className="input-com-editar">
          <input type="text" value={user.endereco} readOnly />
           <button
      type="button"
      className="btn-editar"
      onClick={() =>
        editarInformacao(
          'endereco',
          'Endereço',
          user.endereco
        )
      }
    > <img src={lapis} alt="Editar" /></button>
          </div>
        </label>

        <label>
          <p>Telefone</p>
          <div className="input-com-editar">
          <input type="text" value={user.telefone} readOnly />

           <button
      type="button"
      className="btn-editar"
      onClick={() =>
        editarInformacao(
          'telefone',
          'Telefone',
          user.telefone
        )
      }
    > <img src={lapis} alt="Editar" /></button>
          </div>
        </label>

        <label>
          <p>Raça/Cor</p>
          <div className="input-com-editar">
          <input type="text" value={user.raca} readOnly />
          
          </div>
        </label>
      </div>

      {/* As prescrições agora têm página própria, com o rastreio de cada etapa */}
      <div className="mx-auto max-w-7xl px-6 pb-10">
        <Link
          to="/prescricoes"
          className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
        >
          <span>
            <span className="block text-lg font-semibold text-gray-900">Minhas prescrições</span>
            <span className="block text-sm text-gray-500">Veja o andamento de cada prescrição, do envio à retirada.</span>
          </span>
          <span className="text-xl font-bold text-blue-700" aria-hidden="true">→</span>
        </Link>
      </div>

      <Footer />

    </div>
  );
}