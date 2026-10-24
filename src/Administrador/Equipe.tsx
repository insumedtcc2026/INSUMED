import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Copy, KeyRound, Link2, MessageCircle, UserPlus } from "lucide-react";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { MensagemErro } from "../components/universais/ForcaSenha";
import { useValidarToken } from "../hook/Validartoken";
import { API_URL } from "../config";
import {
  alterarAtivo, cadastrarFuncionario, cancelarConvite, criarConvite, linkDoConvite, listarConvites, listarEquipe,
  type Convite, type ConviteCriado, type Funcionario, type PerfilEquipe,
} from "../services/EquipeService";
import {
  mascaraCPF, mascaraTelefone, mensagemErroApi, normalizarMatricula, temErros, validarCPF, validarEmail,
  validarMatricula, validarNome, validarObrigatorio, validarTelefone, MATRICULA_MAX,
} from "../utils/validacoes";
import "../css/universais/Equipe.css";

interface Posto {
  pos_id: number;
  pos_nome: string;
}

const NOME_PERFIL: Record<PerfilEquipe, string> = { ADMIN: "Administrador", AUTORIZADOR: "Autorizador" };

const SITUACAO: Record<Convite["situacao"], { texto: string; classe: string }> = {
  pendente: { texto: "Aguardando cadastro", classe: "equipe-selo--alerta" },
  usado: { texto: "Usado", classe: "equipe-selo--ok" },
  cancelado: { texto: "Cancelado", classe: "equipe-selo--neutro" },
  expirado: { texto: "Expirado", classe: "equipe-selo--neutro" },
};

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const ehUniversal = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("usuario_admin") ?? "{}").tp_universal);
  } catch {
    return false;
  }
};

async function copiar(texto: string, aviso: string) {
  try {
    await navigator.clipboard.writeText(texto);
    Swal.fire({ icon: "success", title: aviso, timer: 1400, showConfirmButton: false });
  } catch {
    Swal.fire({ icon: "info", title: "Copie manualmente", text: texto });
  }
}

const formVazio = { perfil: "ADMIN" as PerfilEquipe, nome: "", email: "", telefone: "", cpf: "", matricula: "", posto_id: "" };

/**
 * EQUIPE DA REDE (só o administrador universal).
 * Convida administradores e autorizadores por link, cadastra direto com
 * senha provisória, desativa quem saiu e acompanha os convites.
 */
export default function Equipe() {
  const { verificando } = useValidarToken("ADMIN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [universal] = useState(ehUniversal);
  const [equipe, setEquipe] = useState<Funcionario[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"TODOS" | PerfilEquipe>("TODOS");
  const [painel, setPainel] = useState<"convite" | "cadastro" | null>(null);

  // convite
  const [convitePerfil, setConvitePerfil] = useState<PerfilEquipe>("ADMIN");
  const [convitePosto, setConvitePosto] = useState("");
  const [conviteCriado, setConviteCriado] = useState<ConviteCriado | null>(null);
  const [gerando, setGerando] = useState(false);

  // cadastro direto
  const [form, setForm] = useState(formVazio);
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [senhaGerada, setSenhaGerada] = useState<{ nome: string; email: string; senha: string } | null>(null);

  const carregar = useCallback(
    () =>
      Promise.all([
        listarEquipe(),
        listarConvites(),
        axios.get<Posto[]>(`${API_URL}/postos`).then((r) => r.data),
      ])
        .then(([lista, cnv, pst]) => {
          setEquipe(lista);
          setConvites(cnv);
          setPostos(pst);
        })
        .catch((e) => setErro(mensagemErroApi(e, "Não foi possível carregar a equipe.")))
        .finally(() => setCarregando(false)),
    [],
  );

  useEffect(() => {
    if (!verificando && universal) void carregar();
  }, [verificando, universal, carregar]);

  function tentarDeNovo() {
    setCarregando(true);
    setErro(null);
    void carregar();
  }

  const filtrados = useMemo(
    () => equipe.filter((f) => filtro === "TODOS" || f.perfil === filtro),
    [equipe, filtro],
  );

  const errosCadastro = {
    nome: validarNome(form.nome),
    email: validarEmail(form.email),
    telefone: validarTelefone(form.telefone),
    cpf: validarCPF(form.cpf),
    matricula: form.perfil === "ADMIN" ? validarMatricula(form.matricula) : null,
    posto_id: form.perfil === "ADMIN" ? validarObrigatorio(form.posto_id, "a unidade de saúde") : null,
  };
  const erroDe = (campo: keyof typeof errosCadastro) => (tentou ? errosCadastro[campo] : null);
  const alterar = (campo: keyof typeof formVazio, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  async function gerarConvite() {
    if (convitePerfil === "ADMIN" && !convitePosto) {
      Swal.fire({ icon: "warning", title: "Escolha a unidade", text: "O novo administrador fica ligado a uma unidade de saúde." });
      return;
    }
    setGerando(true);
    try {
      const novo = await criarConvite(convitePerfil, convitePerfil === "ADMIN" ? Number(convitePosto) : undefined);
      setConviteCriado(novo);
      setConvites(await listarConvites());
    } catch (e) {
      Swal.fire({ icon: "error", title: "Não foi possível gerar o convite", text: mensagemErroApi(e, "Tente novamente.") });
    } finally {
      setGerando(false);
    }
  }

  async function salvarCadastro(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (temErros(errosCadastro)) return;
    setSalvando(true);
    try {
      const { senha_provisoria } = await cadastrarFuncionario({
        perfil: form.perfil,
        nome: form.nome.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone,
        cpf: form.cpf,
        ...(form.perfil === "ADMIN"
          ? { matricula: normalizarMatricula(form.matricula), posto_id: Number(form.posto_id) }
          : {}),
      });
      setSenhaGerada({ nome: form.nome.trim(), email: form.email.trim().toLowerCase(), senha: senha_provisoria });
      setForm(formVazio);
      setTentou(false);
      setEquipe(await listarEquipe());
    } catch (err) {
      Swal.fire({ icon: "error", title: "Não foi possível cadastrar", text: mensagemErroApi(err, "Tente novamente.") });
    } finally {
      setSalvando(false);
    }
  }

  async function trocarAtivo(f: Funcionario) {
    const desativar = f.ativo;
    const ok = await Swal.fire({
      icon: desativar ? "warning" : "question",
      title: desativar ? `Desativar ${f.nome}?` : `Reativar ${f.nome}?`,
      text: desativar
        ? "A pessoa perde o acesso na hora, inclusive se estiver logada. O histórico do que ela fez continua guardado."
        : "A pessoa volta a entrar com o e-mail ou CPF e a senha de sempre.",
      showCancelButton: true,
      confirmButtonText: desativar ? "Desativar" : "Reativar",
      cancelButtonText: "Voltar",
      confirmButtonColor: desativar ? "#d30000" : "#0042ec",
      reverseButtons: true,
    });
    if (!ok.isConfirmed) return;
    try {
      await alterarAtivo(f.perfil, f.id, !f.ativo);
      setEquipe((lista) => lista.map((x) => (x.perfil === f.perfil && x.id === f.id ? { ...x, ativo: !f.ativo } : x)));
    } catch (e) {
      Swal.fire({ icon: "error", title: "Não foi possível alterar", text: mensagemErroApi(e, "Tente novamente.") });
    }
  }

  async function cancelar(c: Convite) {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Cancelar este convite?",
      text: "O link deixa de funcionar.",
      showCancelButton: true,
      confirmButtonText: "Cancelar convite",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#d30000",
      reverseButtons: true,
    });
    if (!ok.isConfirmed) return;
    try {
      await cancelarConvite(c.cnv_id);
      setConvites(await listarConvites());
    } catch (e) {
      Swal.fire({ icon: "error", title: "Não foi possível cancelar", text: mensagemErroApi(e, "Tente novamente.") });
    }
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const link = conviteCriado ? linkDoConvite(conviteCriado.perfil, conviteCriado.codigo) : "";
  const mensagemWhats = conviteCriado
    ? `Olá! Este é o seu convite para se cadastrar no INSUMED como ${NOME_PERFIL[conviteCriado.perfil].toLowerCase()}` +
      `${conviteCriado.posto ? ` da ${conviteCriado.posto.pos_nome}` : ""}. O link vale até ${dataHora(conviteCriado.expira_em)} e só pode ser usado uma vez: ${link}`
    : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Equipe da rede</h1>
            <p className="text-sm text-gray-500">Administradores e autorizadores que usam o INSUMED.</p>
          </div>
          {universal && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="equipe-botao" onClick={() => { setPainel(painel === "convite" ? null : "convite"); setConviteCriado(null); }}>
                <Link2 size={18} aria-hidden="true" /> Convidar por link
              </button>
              <button type="button" className="equipe-botao equipe-botao--secundario" onClick={() => { setPainel(painel === "cadastro" ? null : "cadastro"); setSenhaGerada(null); }}>
                <UserPlus size={18} aria-hidden="true" /> Cadastrar funcionário
              </button>
            </div>
          )}
        </header>

        {!universal && (
          <p className="rounded-2xl bg-white p-6 text-center text-gray-600 shadow-sm" role="alert">
            Só o administrador universal gerencia a equipe da rede.
          </p>
        )}

        {universal && painel === "convite" && (
          <section className="equipe-painel" aria-labelledby="titulo-convite">
            <h2 id="titulo-convite">Convidar por link</h2>
            <p className="equipe-ajuda">
              A pessoa recebe um link, preenche os próprios dados e cria a senha. O link vale 7 dias e só pode ser usado uma vez.
            </p>
            <div className="equipe-campos">
              <label>
                Perfil
                <select value={convitePerfil} onChange={(e) => { setConvitePerfil(e.target.value as PerfilEquipe); setConviteCriado(null); }}>
                  <option value="ADMIN">Administrador de unidade</option>
                  <option value="AUTORIZADOR">Autorizador</option>
                </select>
              </label>
              {convitePerfil === "ADMIN" && (
                <label>
                  Unidade de saúde
                  <select value={convitePosto} onChange={(e) => { setConvitePosto(e.target.value); setConviteCriado(null); }}>
                    <option value="">Selecione</option>
                    {postos.map((p) => <option key={p.pos_id} value={p.pos_id}>{p.pos_nome}</option>)}
                  </select>
                </label>
              )}
            </div>
            <button type="button" className="equipe-botao" onClick={gerarConvite} disabled={gerando}>
              {gerando ? "Gerando..." : "Gerar convite"}
            </button>

            {conviteCriado && (
              <div className="equipe-resultado" role="status">
                <p><strong>Convite criado.</strong> Envie este link para a pessoa; ele não aparece de novo depois que você sair desta tela.</p>
                <input className="equipe-link" value={link} readOnly onFocus={(e) => e.target.select()} aria-label="Link do convite" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="equipe-botao" onClick={() => copiar(link, "Link copiado")}>
                    <Copy size={16} aria-hidden="true" /> Copiar link
                  </button>
                  <a
                    className="equipe-botao equipe-botao--whats"
                    href={`https://wa.me/?text=${encodeURIComponent(mensagemWhats)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={16} aria-hidden="true" /> Enviar por WhatsApp
                  </a>
                </div>
                <p className="equipe-ajuda">Válido até {dataHora(conviteCriado.expira_em)}.</p>
              </div>
            )}
          </section>
        )}

        {universal && painel === "cadastro" && (
          <section className="equipe-painel" aria-labelledby="titulo-cadastro">
            <h2 id="titulo-cadastro">Cadastrar funcionário</h2>
            <p className="equipe-ajuda">
              O sistema gera uma senha provisória. No primeiro acesso, a pessoa é obrigada a criar uma senha própria.
            </p>

            {senhaGerada ? (
              <div className="equipe-resultado" role="status">
                <p><strong>{senhaGerada.nome}</strong> foi cadastrado(a).</p>
                <p>Entrega para a pessoa: login <strong>{senhaGerada.email}</strong> (ou o CPF) e a senha provisória abaixo. Ela não aparece de novo.</p>
                <p className="equipe-senha"><KeyRound size={18} aria-hidden="true" /> {senhaGerada.senha}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="equipe-botao" onClick={() => copiar(senhaGerada.senha, "Senha copiada")}>
                    <Copy size={16} aria-hidden="true" /> Copiar senha
                  </button>
                  <button type="button" className="equipe-botao equipe-botao--secundario" onClick={() => setSenhaGerada(null)}>
                    Cadastrar outra pessoa
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={salvarCadastro} noValidate>
                <div className="equipe-campos">
                  <label>
                    Perfil
                    <select value={form.perfil} onChange={(e) => alterar("perfil", e.target.value)}>
                      <option value="ADMIN">Administrador de unidade</option>
                      <option value="AUTORIZADOR">Autorizador</option>
                    </select>
                  </label>
                  <label>
                    Nome completo
                    <input value={form.nome} onChange={(e) => alterar("nome", e.target.value)} className={erroDe("nome") ? "input-erro" : ""} />
                    <MensagemErro erro={erroDe("nome")} />
                  </label>
                  <label>
                    E-mail
                    <input type="email" value={form.email} onChange={(e) => alterar("email", e.target.value)} className={erroDe("email") ? "input-erro" : ""} />
                    <MensagemErro erro={erroDe("email")} />
                  </label>
                  <label>
                    Telefone
                    <input type="tel" value={form.telefone} placeholder="(24) 99999-9999" onChange={(e) => alterar("telefone", mascaraTelefone(e.target.value))} className={erroDe("telefone") ? "input-erro" : ""} />
                    <MensagemErro erro={erroDe("telefone")} />
                  </label>
                  <label>
                    CPF
                    <input value={form.cpf} placeholder="000.000.000-00" onChange={(e) => alterar("cpf", mascaraCPF(e.target.value))} className={erroDe("cpf") ? "input-erro" : ""} />
                    <MensagemErro erro={erroDe("cpf")} />
                  </label>
                  {form.perfil === "ADMIN" && (
                    <>
                      <label>
                        Matrícula
                        <input
                          value={form.matricula}
                          maxLength={MATRICULA_MAX + 5}
                          onChange={(e) => alterar("matricula", e.target.value)}
                          onBlur={() => alterar("matricula", normalizarMatricula(form.matricula))}
                          className={erroDe("matricula") ? "input-erro" : ""}
                        />
                        <MensagemErro erro={erroDe("matricula")} />
                      </label>
                      <label>
                        Unidade de saúde
                        <select value={form.posto_id} onChange={(e) => alterar("posto_id", e.target.value)} className={erroDe("posto_id") ? "input-erro" : ""}>
                          <option value="">Selecione</option>
                          {postos.map((p) => <option key={p.pos_id} value={p.pos_id}>{p.pos_nome}</option>)}
                        </select>
                        <MensagemErro erro={erroDe("posto_id")} />
                      </label>
                    </>
                  )}
                </div>
                <button type="submit" className="equipe-botao" disabled={salvando}>
                  {salvando ? "Cadastrando..." : "Cadastrar e gerar senha"}
                </button>
              </form>
            )}
          </section>
        )}

        {universal && carregando && <p className="py-8 text-center text-gray-400" role="status">Carregando…</p>}

        {universal && !carregando && erro && (
          <div className="py-8 text-center" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button type="button" onClick={tentarDeNovo} className="equipe-botao equipe-botao--secundario mt-3">Tentar novamente</button>
          </div>
        )}

        {universal && !carregando && !erro && (
          <>
            <div className="equipe-filtros" role="group" aria-label="Filtrar por perfil">
              {(["TODOS", "ADMIN", "AUTORIZADOR"] as const).map((f) => (
                <button key={f} type="button" aria-pressed={filtro === f} className={filtro === f ? "ativo" : ""} onClick={() => setFiltro(f)}>
                  {f === "TODOS" ? "Todos" : f === "ADMIN" ? "Administradores" : "Autorizadores"}
                </button>
              ))}
            </div>

            <ul className="equipe-lista">
              {filtrados.map((f) => (
                <li key={`${f.perfil}-${f.id}`} className={`equipe-item ${f.ativo ? "" : "equipe-item--inativo"}`}>
                  <div className="equipe-item-dados">
                    <p className="equipe-item-nome">{f.nome}</p>
                    <p className="equipe-item-detalhe">
                      {f.universal ? "Administrador universal" : NOME_PERFIL[f.perfil]}
                      {f.unidade && !f.universal ? ` · ${f.unidade}` : ""}
                    </p>
                    <p className="equipe-item-detalhe">{f.email}</p>
                    <div className="flex flex-wrap gap-1">
                      <span className={`equipe-selo ${f.ativo ? "equipe-selo--ok" : "equipe-selo--neutro"}`}>{f.ativo ? "Ativo" : "Desativado"}</span>
                      {f.senha_provisoria && <span className="equipe-selo equipe-selo--alerta">Ainda não trocou a senha provisória</span>}
                    </div>
                  </div>
                  {!f.universal && (
                    <button
                      type="button"
                      className={`equipe-botao ${f.ativo ? "equipe-botao--perigo" : "equipe-botao--secundario"}`}
                      onClick={() => trocarAtivo(f)}
                    >
                      {f.ativo ? "Desativar" : "Reativar"}
                    </button>
                  )}
                </li>
              ))}
              {filtrados.length === 0 && <li className="equipe-vazio">Ninguém cadastrado neste filtro.</li>}
            </ul>

            <h2 className="equipe-subtitulo">Convites dos últimos 30 dias</h2>
            {convites.length === 0 ? (
              <p className="equipe-vazio">Nenhum convite gerado.</p>
            ) : (
              <ul className="equipe-lista">
                {convites.map((c) => (
                  <li key={c.cnv_id} className="equipe-item">
                    <div className="equipe-item-dados">
                      <p className="equipe-item-nome">
                        {NOME_PERFIL[c.cnv_perfil]}{c.pos_nome ? ` · ${c.pos_nome}` : ""}
                      </p>
                      <p className="equipe-item-detalhe">
                        Criado em {dataHora(c.cnv_criado_em)}
                        {c.situacao === "usado" && c.cnv_usado_email ? ` · usado por ${c.cnv_usado_email}` : ` · vale até ${dataHora(c.cnv_expira_em)}`}
                      </p>
                      <span className={`equipe-selo ${SITUACAO[c.situacao].classe}`}>{SITUACAO[c.situacao].texto}</span>
                    </div>
                    {c.situacao === "pendente" && (
                      <button type="button" className="equipe-botao equipe-botao--perigo" onClick={() => cancelar(c)}>
                        Cancelar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
