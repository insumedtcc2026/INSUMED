// Validações e máscaras compartilhadas pelos formulários de cadastro e login.
// Cada validador devolve a mensagem de erro, ou null quando o valor é válido.
// As mesmas regras são aplicadas no backend (src/utils/validacoes.js).

export const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

// ---------- Máscaras ----------

export function mascaraCPF(valor: string) {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraTelefone(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascaraCEP(valor: string) {
  return somenteDigitos(valor).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

// ---------- Validadores ----------

export function cpfValido(cpf: string) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const digito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    digito(d.slice(0, 9), 10) === Number(d[9]) &&
    digito(d.slice(0, 10), 11) === Number(d[10])
  );
}

export function validarCPF(cpf: string) {
  if (!cpf.trim()) return "Informe o CPF.";
  if (somenteDigitos(cpf).length !== 11) return "O CPF deve ter 11 dígitos.";
  if (!cpfValido(cpf)) return "CPF inválido. Confira os números digitados.";
  return null;
}

const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

export function validarEmail(email: string) {
  const valor = email.trim();
  if (!valor) return "Informe o e-mail.";
  if (valor.length > 254 || !REGEX_EMAIL.test(valor) || valor.includes(".."))
    return "E-mail inválido. Exemplo: nome@dominio.com";
  return null;
}

export function validarNome(nome: string) {
  const valor = nome.trim().replace(/\s+/g, " ");
  if (!valor) return "Informe o nome completo.";
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(valor))
    return "O nome deve conter apenas letras.";
  const partes = valor.split(" ");
  if (partes.length < 2 || partes[0].length < 2 || partes[partes.length - 1].length < 2)
    return "Informe nome e sobrenome.";
  if (valor.length > 100) return "O nome deve ter no máximo 100 caracteres.";
  return null;
}

export function validarTelefone(telefone: string) {
  const d = somenteDigitos(telefone);
  if (!d) return "Informe o telefone.";
  if (d.length !== 10 && d.length !== 11)
    return "Telefone inválido. Use DDD + número, ex: (24) 99999-9999.";
  if (Number(d.slice(0, 2)) < 11) return "DDD inválido.";
  if (d.length === 11 && d[2] !== "9") return "Celular deve começar com 9 após o DDD.";
  return null;
}

export function validarCEP(cep: string) {
  if (!cep.trim()) return "Informe o CEP.";
  if (somenteDigitos(cep).length !== 8) return "CEP inválido. Use o formato 00000-000.";
  return null;
}

export function validarDataNascimento(data: string) {
  if (!data) return "Informe a data de nascimento.";
  const nascimento = new Date(`${data}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) return "Data de nascimento inválida.";
  const hoje = new Date();
  if (nascimento > hoje) return "A data de nascimento não pode estar no futuro.";
  if (hoje.getFullYear() - nascimento.getFullYear() > 130)
    return "Data de nascimento inválida.";
  return null;
}

export function validarObrigatorio(valor: string, rotulo: string) {
  return valor.trim() ? null : `Informe ${rotulo}.`;
}

// ---------- Senha ----------

export const SENHA_MIN = 8;
export const SENHA_MAX = 64;

export function requisitosSenha(senha: string) {
  return [
    { ok: senha.length >= SENHA_MIN, texto: `Mínimo de ${SENHA_MIN} caracteres` },
    { ok: /[a-z]/.test(senha), texto: "Uma letra minúscula" },
    { ok: /[A-Z]/.test(senha), texto: "Uma letra maiúscula" },
    { ok: /\d/.test(senha), texto: "Um número" },
    { ok: /[^A-Za-z0-9\s]/.test(senha), texto: "Um caractere especial (!@#$...)" },
  ];
}

export function validarSenha(senha: string) {
  if (!senha) return "Crie uma senha.";
  if (senha.length > SENHA_MAX) return `A senha deve ter no máximo ${SENHA_MAX} caracteres.`;
  if (/\s/.test(senha)) return "A senha não pode conter espaços.";
  const faltando = requisitosSenha(senha).filter((r) => !r.ok);
  if (faltando.length) return "A senha não atende a todos os requisitos.";
  return null;
}

export function validarConfirmacaoSenha(senha: string, confirmacao: string) {
  if (!confirmacao) return "Confirme a senha.";
  if (senha !== confirmacao) return "As senhas não coincidem.";
  return null;
}

// Junta os erros de um formulário e diz se há algum.
export type ErrosFormulario<T extends string> = Partial<Record<T, string | null>>;

export const temErros = <T extends string>(erros: ErrosFormulario<T>) =>
  Object.values(erros).some(Boolean);

// Extrai uma mensagem legível da resposta de erro do backend.
export function mensagemErroApi(error: unknown, padrao: string) {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) return "Não foi possível conectar ao servidor. Verifique sua internet.";
  if (Array.isArray(data.erros) && data.erros.length) return data.erros.join("\n");
  for (const chave of ["erro", "error", "msg", "message"]) {
    if (typeof data[chave] === "string") return data[chave] as string;
  }
  return padrao;
}

// ---------- Motivos (cancelamento, não autorização) ----------
// Texto livre e obrigatório; mesmo limite do backend.
export const MOTIVO_MAX = 500;

export function validarMotivo(motivo: string | undefined | null) {
  const valor = (motivo ?? "").trim();
  if (!valor) return "Você precisa informar o motivo.";
  if (valor.length > MOTIVO_MAX) return `O motivo deve ter no máximo ${MOTIVO_MAX} caracteres.`;
  return null;
}

// Data de hoje no formato YYYY-MM-DD (fuso do navegador), para o "min" dos campos de data.
export function hojeISO() {
  const d = new Date();
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

// ---------- Exibição ----------
// Formata CPF/telefone vindos do banco para exibição, mesmo que tenham sido
// salvos sem pontuação (cadastros antigos). Valor fora do padrão é mostrado
// como veio, para não esconder dado; vazio vira "—".

export function exibirCPF(cpf?: string | null) {
  const d = somenteDigitos(cpf ?? "");
  if (!d) return "—";
  return d.length === 11 ? mascaraCPF(d) : String(cpf);
}

export function exibirTelefone(telefone?: string | null) {
  const d = somenteDigitos(telefone ?? "");
  if (!d) return "—";
  return d.length === 10 || d.length === 11 ? mascaraTelefone(d) : String(telefone);
}
