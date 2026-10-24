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

function Linha({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{rotulo}</dt>
      <dd className="mt-0.5 break-words text-gray-900">{valor || "—"}</dd>
    </div>
  );
}

/** Perfil pessoal do administrador ou do autorizador logado. */
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

  const campo = "min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none focus:border-blue-600";

  return (
    <div className="min-h-screen bg-slate-50">
      <Menu isOpen={sidebarOpen} onClose={alternarMenu} />
      <Header onMenuClick={alternarMenu} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para={tipo === "ADMIN" ? "/homeadmin" : "/homeaut"} />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Meu perfil</h1>
        <p className="mt-1 text-sm text-gray-500">
          {tipo === "ADMIN" ? "Administrador" : "Autorizador"}
        </p>

        {erro && <p className="mt-6 text-rose-600" role="alert">{erro}</p>}
        {!perfil && !erro && <p className="mt-6 text-gray-500" role="status">Carregando…</p>}

        {perfil && !editando && (
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Linha rotulo="Nome" valor={perfil.nome} />
              <Linha rotulo="E-mail" valor={perfil.email} />
              <Linha rotulo="Telefone" valor={exibirTelefone(perfil.telefone)} />
              <Linha rotulo="CPF" valor={exibirCPF(perfil.cpf)} />
              {tipo === "ADMIN" && <Linha rotulo="Matrícula" valor={perfil.matricula} />}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={editar} className="botao-novo-agendamento">
                Editar dados
              </button>
              <Link
                to={`/trocar-senha?perfil=${tipo}`}
                className="inline-flex min-h-11 items-center rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Trocar senha
              </Link>
            </div>
          </section>
        )}

        {perfil && editando && (
          <form onSubmit={salvar} noValidate className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
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
            <p className="text-sm text-gray-500">CPF{tipo === "ADMIN" ? ", matrícula e posto" : ""} não podem ser alterados por aqui.</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEditando(false)}
                className="min-h-12 rounded-full border border-gray-300 px-6 font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="botao-novo-agendamento disabled:opacity-60">
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        )}

        {perfil && tipo === "ADMIN" && (
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="posto-titulo">
            <h2 id="posto-titulo" className="mb-3 text-lg font-semibold text-gray-800">Meu posto</h2>
            {perfil.universal ? (
              <p className="text-gray-700">
                Acesso a <strong>todos os postos</strong>
                {perfil.posto ? <> (cadastrado em {perfil.posto.pos_nome})</> : null}.
              </p>
            ) : perfil.posto ? (
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Linha rotulo="Unidade" valor={perfil.posto.pos_nome} />
                <Linha rotulo="Endereço" valor={perfil.posto.pos_endereco} />
              </dl>
            ) : (
              <p className="text-gray-500">Nenhum posto vinculado.</p>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
