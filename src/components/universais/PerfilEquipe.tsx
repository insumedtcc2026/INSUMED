import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import HeaderAdm from "./HeaderAdm";
import HeaderAut from "./HeaderAut";
import Sidebaradm from "./Siderbaradm";
import SidebarAut from "./SidebarAut";
import Footer from "./Footer";
import BotaoVoltar from "./BotaoVoltar";
import { MensagemErro } from "./ForcaSenha";
import { BOTAO_PERFIL_SECUNDARIO, CAMPO_PERFIL, CabecalhoPerfil, CartaoPerfil, LinhaPerfil } from "./PerfilUI";
import { Pencil } from "lucide-react";
import { useValidarToken } from "../../hook/Validartoken";
import { atualizarMeuPerfil, buscarMeuPerfil, type PerfilEquipe as Perfil } from "../../services/PainelService";
import {
  exibirCPF, exibirTelefone, mascaraTelefone, mensagemErroApi,
  validarEmail, validarNome, validarTelefone,
} from "../../utils/validacoes";

type Tipo = "ADMIN" | "AUTORIZADOR";

// Chave do usuário salva no login; atualizada para o cabeçalho mostrar o nome novo.
const CHAVE_USUARIO: Record<Tipo, { chave: string; nome: string; email: string; tel: string }> = {
  ADMIN: { chave: "usuario_admin", nome: "adm_nome", email: "adm_email", tel: "adm_tel" },
  AUTORIZADOR: { chave: "usuario_autorizador", nome: "aut_nome", email: "aut_email", tel: "aut_tel" },
};

/** Perfil pessoal do administrador ou do autorizador logado (mesmo modelo do paciente). */
export default function PerfilEquipe({ tipo }: { tipo: Tipo }) {
  const { verificando } = useValidarToken(tipo);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (verificando) return;
    buscarMeuPerfil(tipo)
      .then(setPerfil)
      .catch((e) => setErro(mensagemErroApi(e, "Não foi possível carregar seu perfil.")));
  }, [verificando, tipo]);

  const erros = {
    nome: validarNome(form.nome),
    email: validarEmail(form.email),
    telefone: validarTelefone(form.telefone),
  };

  function editar() {
    if (!perfil) return;
    setForm({ nome: perfil.nome, email: perfil.email, telefone: exibirTelefone(perfil.telefone) });
    setTentou(false);
    setEditando(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (Object.values(erros).some(Boolean) || salvando) return;

    setSalvando(true);
    try {
      const novo = await atualizarMeuPerfil(tipo, form);
      setPerfil(novo);
      setEditando(false);

      const c = CHAVE_USUARIO[tipo];
      try {
        const salvo = JSON.parse(localStorage.getItem(c.chave) || "{}");
        localStorage.setItem(c.chave, JSON.stringify({ ...salvo, [c.nome]: novo.nome, [c.email]: novo.email, [c.tel]: novo.telefone }));
      } catch {
        /* o cabeçalho volta a ficar certo no próximo login */
      }

      Swal.fire({ icon: "success", title: "Perfil atualizado", confirmButtonColor: "#3085d6" });
    } catch (e2) {
      Swal.fire({ icon: "error", title: "Não foi possível salvar", text: mensagemErroApi(e2, "Tente novamente."), confirmButtonColor: "#d33" });
    } finally {
      setSalvando(false);
    }
  }

  const Header = tipo === "ADMIN" ? HeaderAdm : HeaderAut;
  const Menu = tipo === "ADMIN" ? Sidebaradm : SidebarAut;
  const alternarMenu = () => setSidebarOpen((v) => !v);

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const campo = CAMPO_PERFIL;
  const papel = tipo === "ADMIN" ? "Administrador" : "Autorizador";

  return (
    <div className="min-h-screen bg-slate-50">
      <Menu isOpen={sidebarOpen} onClose={alternarMenu} />
      <Header onMenuClick={alternarMenu} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para={tipo === "ADMIN" ? "/homeadmin" : "/homeaut"} />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="titulo-secao">Meu perfil</h1>

        {erro && <p className="mt-6 text-rose-600" role="alert">{erro}</p>}
        {!perfil && !erro && <p className="mt-6 text-gray-500" role="status">Carregando…</p>}

        {perfil && (
          <div className="mt-6 flex flex-col gap-5">
            <CabecalhoPerfil nome={perfil.nome} papel={papel} cpf={exibirCPF(perfil.cpf)} />

            <CartaoPerfil
              titulo="Seus dados"
              descricao={editando ? `CPF${tipo === "ADMIN" ? ", matrícula e unidade" : ""} não podem ser alterados por aqui.` : undefined}
              acao={!editando && (
                <button type="button" onClick={editar} className={BOTAO_PERFIL_SECUNDARIO}>
                  <Pencil size={15} className="mr-2" aria-hidden="true" /> Editar dados
                </button>
              )}
            >
              {!editando ? (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <LinhaPerfil rotulo="Nome" valor={perfil.nome} />
                  <LinhaPerfil rotulo="CPF" valor={exibirCPF(perfil.cpf)} />
                  <LinhaPerfil rotulo="E-mail" valor={perfil.email} />
                  <LinhaPerfil rotulo="Telefone" valor={exibirTelefone(perfil.telefone)} />
                  {tipo === "ADMIN" && <LinhaPerfil rotulo="Matrícula" valor={perfil.matricula} />}
                </dl>
              ) : (
                <form onSubmit={salvar} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="pf-nome" className="mb-1 block font-medium text-gray-700">Nome completo</label>
                    <input id="pf-nome" className={campo} value={form.nome} maxLength={100} autoComplete="name"
                      onChange={(e) => setForm({ ...form, nome: e.target.value })} aria-invalid={tentou && !!erros.nome} />
                    {tentou && <MensagemErro erro={erros.nome} />}
                  </div>
                  <div>
                    <label htmlFor="pf-email" className="mb-1 block font-medium text-gray-700">E-mail</label>
                    <input id="pf-email" type="email" className={campo} value={form.email} autoComplete="email"
                      onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={tentou && !!erros.email} />
                    {tentou && <MensagemErro erro={erros.email} />}
                  </div>
                  <div>
                    <label htmlFor="pf-tel" className="mb-1 block font-medium text-gray-700">Telefone</label>
                    <input id="pf-tel" type="tel" inputMode="numeric" className={campo} value={form.telefone} autoComplete="tel"
                      onChange={(e) => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })} aria-invalid={tentou && !!erros.telefone} />
                    {tentou && <MensagemErro erro={erros.telefone} />}
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setEditando(false)} className={BOTAO_PERFIL_SECUNDARIO}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={salvando} className="botao-novo-agendamento disabled:opacity-60">
                      {salvando ? "Salvando…" : "Salvar"}
                    </button>
                  </div>
                </form>
              )}
            </CartaoPerfil>

            {tipo === "ADMIN" && (
              <CartaoPerfil titulo="Minha unidade">
                {perfil.universal ? (
                  <p className="text-gray-700">
                    Acesso a <strong>todas as unidades</strong>
                    {perfil.posto ? <> (cadastrado em {perfil.posto.pos_nome})</> : null}.
                  </p>
                ) : perfil.posto ? (
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <LinhaPerfil rotulo="Unidade" valor={perfil.posto.pos_nome} />
                    <LinhaPerfil rotulo="Endereço" valor={perfil.posto.pos_endereco} />
                  </dl>
                ) : (
                  <p className="text-gray-500">Nenhuma unidade vinculada.</p>
                )}
              </CartaoPerfil>
            )}

            <CartaoPerfil
              titulo="Senha"
              descricao="Use uma senha forte e não compartilhe com ninguém."
              acao={<Link to={`/trocar-senha?perfil=${tipo}`} className={BOTAO_PERFIL_SECUNDARIO}>Trocar senha</Link>}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
