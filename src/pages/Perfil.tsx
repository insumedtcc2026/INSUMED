import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pencil } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import BotaoVoltar from '../components/universais/BotaoVoltar';
import { MensagemErro } from '../components/universais/ForcaSenha';
import {
  BOTAO_PERFIL_SECUNDARIO, CAMPO_PERFIL, CabecalhoPerfil, CartaoPerfil, LinhaPerfil,
} from '../components/universais/PerfilUI';
import DeclaracaoPrioridade from '../components/usuario-1/perfil/DeclaracaoPrioridade';
import { useDadosUser } from '../hook/Dadosuser.tsx';
import { useValidarToken } from '../hook/Validartoken.tsx';
import { API_URL } from '../config';
import {
  mascaraCEP, mascaraTelefone, mensagemErroApi,
  validarCEP, validarEmail, validarNome, validarTelefone,
} from '../utils/validacoes';

// Campos que o paciente pode mudar (o backend recebe um campo por vez)
type Campo = 'nome' | 'email' | 'telefone' | 'cep' | 'endereco';

const validarEndereco = (v: string) => (v.trim().length < 5 ? 'Informe o endereço completo.' : null);

/**
 * Perfil do paciente, no mesmo modelo do perfil da equipe: cabeçalho com as
 * iniciais, "Seus dados" (com "Editar dados"), atendimento prioritário e o
 * atalho para as prescrições.
 */
export default function Perfil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { verificando } = useValidarToken('PACIENTE');
  const user = useDadosUser();

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [form, setForm] = useState<Record<Campo, string>>({ nome: '', email: '', telefone: '', cep: '', endereco: '' });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const erros: Record<Campo, string | null> = {
    nome: validarNome(form.nome),
    email: validarEmail(form.email),
    telefone: validarTelefone(form.telefone),
    cep: validarCEP(form.cep),
    endereco: validarEndereco(form.endereco),
  };

  function editar() {
    setForm({ nome: user.nome, email: user.email, telefone: user.telefone, cep: user.cep, endereco: user.endereco });
    setTentou(false);
    setEditando(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (Object.values(erros).some(Boolean) || salvando) return;

    const token = localStorage.getItem('token_paciente');
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    const atuais: Record<Campo, string> = { nome: user.nome, email: user.email, telefone: user.telefone, cep: user.cep, endereco: user.endereco };
    const mudados = (Object.keys(form) as Campo[]).filter((c) => form[c].trim() !== atuais[c]);
    if (mudados.length === 0) {
      setEditando(false);
      return;
    }

    setSalvando(true);
    try {
      for (const campo of mudados) {
        const resposta = await axios.put(
          `${API_URL}/pacientes/perfil`,
          { campo, valor: form[campo].trim() },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        // mesma chave que o login usa (o cabeçalho lê daqui)
        if (resposta.data.usuario) {
          localStorage.setItem('usuario_paciente', JSON.stringify(resposta.data.usuario));
        }
      }
      await Swal.fire({ icon: 'success', title: 'Perfil atualizado', confirmButtonColor: '#0042ec' });
      window.location.reload();
    } catch (erro) {
      Swal.fire({
        icon: 'error',
        title: 'Não foi possível salvar',
        text: (axios.isAxiosError(erro) && erro.response?.data?.erro) || mensagemErroApi(erro, 'Tente novamente.'),
        confirmButtonColor: '#d33',
      });
    } finally {
      setSalvando(false);
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const nascimento = user.data_nascimento
    ? new Date(user.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : '';

  const campoTexto = (campo: Campo, rotulo: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, mascara?: (v: string) => string) => (
    <div>
      <label htmlFor={`pf-${campo}`} className="mb-1 block font-medium text-gray-700">{rotulo}</label>
      <input
        id={`pf-${campo}`}
        className={CAMPO_PERFIL}
        value={form[campo]}
        onChange={(e) => setForm({ ...form, [campo]: mascara ? mascara(e.target.value) : e.target.value })}
        aria-invalid={tentou && !!erros[campo]}
        {...props}
      />
      {tentou && <MensagemErro erro={erros[campo]} />}
    </div>
  );

  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/home" />
      </div>

      <main className="pagina-conteudo mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="titulo-secao">Meu perfil</h1>

        <div className="mt-6 flex flex-col gap-5">
          <CabecalhoPerfil nome={user.nome} papel="Paciente" cpf={user.cpf} />

          <CartaoPerfil
            titulo="Seus dados"
            descricao={editando ? 'CPF, data de nascimento e raça/cor não podem ser alterados por aqui.' : undefined}
            acao={!editando && (
              <button type="button" onClick={editar} className={BOTAO_PERFIL_SECUNDARIO}>
                <Pencil size={15} className="mr-2" aria-hidden="true" /> Editar dados
              </button>
            )}
          >
            {!editando ? (
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LinhaPerfil rotulo="Nome" valor={user.nome} />
                <LinhaPerfil rotulo="CPF" valor={user.cpf} />
                <LinhaPerfil rotulo="Data de nascimento" valor={nascimento} />
                <LinhaPerfil rotulo="Raça/cor" valor={user.raca} />
                <LinhaPerfil rotulo="E-mail" valor={user.email} />
                <LinhaPerfil rotulo="Telefone" valor={user.telefone} />
                <LinhaPerfil rotulo="CEP" valor={user.cep} />
                <LinhaPerfil rotulo="Endereço" valor={user.endereco} />
              </dl>
            ) : (
              <form onSubmit={salvar} noValidate className="space-y-4">
                {campoTexto('nome', 'Nome completo', { maxLength: 100, autoComplete: 'name' })}
                {campoTexto('email', 'E-mail', { type: 'email', autoComplete: 'email' })}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {campoTexto('telefone', 'Telefone', { type: 'tel', inputMode: 'numeric', autoComplete: 'tel' }, mascaraTelefone)}
                  {campoTexto('cep', 'CEP', { inputMode: 'numeric', autoComplete: 'postal-code' }, mascaraCEP)}
                </div>
                {campoTexto('endereco', 'Endereço', { autoComplete: 'street-address' })}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setEditando(false)} className={BOTAO_PERFIL_SECUNDARIO}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={salvando} className="botao-novo-agendamento disabled:opacity-60">
                    {salvando ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}
          </CartaoPerfil>

          <DeclaracaoPrioridade />

          {/* As prescrições têm página própria, com o rastreio de cada etapa */}
          <CartaoPerfil
            titulo="Minhas prescrições"
            descricao="Veja o andamento de cada prescrição, do envio à retirada."
            acao={(
              <Link to="/prescricoes" className={BOTAO_PERFIL_SECUNDARIO}>
                Ver prescrições <ArrowRight size={15} className="ml-2" aria-hidden="true" />
              </Link>
            )}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
