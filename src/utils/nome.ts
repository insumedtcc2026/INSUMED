// Apresentação do nome da pessoa (o nome cadastrado nunca é alterado).
//
// O banco guarda só o nome completo. Pegar "primeira + segunda palavra"
// mostrava "Maria de" para "Maria de Souza". Aqui a partícula (de, da, do,
// das, dos, e...) nunca é tratada como sobrenome sozinha: ela acompanha o
// sobrenome que vem depois dela ("Maria de Souza"), e sufixos como Filho,
// Júnior e Neto acompanham o sobrenome anterior ("João Silva Filho").

const PARTICULAS = new Set(["de", "da", "do", "das", "dos", "e", "d'", "di", "du", "del", "della", "la", "las", "le", "van", "von", "y"]);
// "e"/"y" ligam dois sobrenomes ("Silva e Souza"): não entram no nome curto
const CONECTIVOS = new Set(["e", "y"]);
const SUFIXOS = new Set(["filho", "filha", "júnior", "junior", "jr", "jr.", "neto", "neta", "sobrinho", "sobrinha", "segundo", "terceiro"]);

const ehParticula = (p: string) => PARTICULAS.has(p.toLowerCase());
const ehSufixo = (p: string) => SUFIXOS.has(p.toLowerCase());

const partes = (nome: string | null | undefined) => String(nome ?? "").trim().split(/\s+/).filter(Boolean);

export function primeiroNome(nome: string | null | undefined): string {
  return partes(nome)[0] ?? "";
}

/** Último sobrenome "de verdade", com a partícula e o sufixo que o acompanham. */
export function ultimoSobrenome(nome: string | null | undefined): string {
  const p = partes(nome);
  if (p.length < 2) return "";
  let fim = p.length - 1;
  // ignora partículas soltas no fim (cadastro digitado incompleto)
  while (fim > 0 && ehParticula(p[fim])) fim--;
  if (fim === 0) return "";
  let inicio = fim;
  // "Silva Filho": o sufixo não é sobrenome sozinho
  if (ehSufixo(p[fim]) && fim - 1 > 0 && !ehParticula(p[fim - 1])) inicio = fim - 1;
  // "de Souza", "dos Santos", "da Silva e Souza"
  while (inicio - 1 > 0 && ehParticula(p[inicio - 1]) && !CONECTIVOS.has(p[inicio - 1].toLowerCase())) inicio--;
  return p.slice(inicio, fim + 1).join(" ");
}

/** Nome curto para cabeçalhos: primeiro nome + último sobrenome. */
export function nomeCurto(nome: string | null | undefined): string {
  return [primeiroNome(nome), ultimoSobrenome(nome)].filter(Boolean).join(" ");
}

/** Iniciais (primeiro nome + último sobrenome, sem partículas). */
export function iniciais(nome: string | null | undefined): string {
  const sobrenome = ultimoSobrenome(nome).split(" ").filter((p) => !ehParticula(p) && !ehSufixo(p));
  return (primeiroNome(nome).charAt(0) + (sobrenome[sobrenome.length - 1]?.charAt(0) ?? "")).toUpperCase();
}
