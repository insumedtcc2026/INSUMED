import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import "../../css/universais/CampoBusca.css";

export interface OpcaoBusca {
  valor: string;
  rotulo: string;
  // texto menor ao lado (ex.: "disponível 12")
  detalhe?: string;
  // selo destacado (ex.: "Sua unidade")
  selo?: string;
}

interface CampoBuscaProps {
  id: string;
  opcoes: OpcaoBusca[];
  valor: string;
  onEscolher: (valor: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // texto quando a busca não encontra nada
  semResultado?: string;
  className?: string;
}

// busca sem diferenciar maiúsculas nem acentos ("ubs sao" acha "UBS São José")
const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Campo de escolha com busca: dá para digitar parte do nome para filtrar
 * a lista ou só abrir e escolher, como num select. Funciona com teclado
 * (setas, Enter e Esc) e com leitor de tela (padrão combobox).
 */
export default function CampoBusca({
  id,
  opcoes,
  valor,
  onEscolher,
  placeholder = "Digite para buscar",
  disabled = false,
  semResultado = "Nada encontrado",
  className = "",
}: CampoBuscaProps) {
  const lista = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const escolhida = opcoes.find((o) => o.valor === valor) ?? null;
  // texto digitado na busca; fora da busca o campo mostra a opção escolhida
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [ativa, setAtiva] = useState(0);

  const filtradas = useMemo(() => {
    if (!buscando || !texto.trim()) return opcoes;
    const termos = normalizar(texto).split(/\s+/);
    return opcoes.filter((o) => {
      const alvo = normalizar(`${o.rotulo} ${o.detalhe ?? ""} ${o.selo ?? ""}`);
      return termos.every((t) => alvo.includes(t));
    });
  }, [opcoes, texto, buscando]);

  // fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) fechar();
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  });

  function abrir() {
    if (disabled) return;
    setAberto(true);
    setAtiva(Math.max(0, filtradas.findIndex((o) => o.valor === valor)));
  }

  function fechar() {
    setAberto(false);
    setBuscando(false);
  }

  function escolher(o: OpcaoBusca) {
    onEscolher(o.valor);
    setBuscando(false);
    setAberto(false);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!aberto) return abrir();
      const passo = e.key === "ArrowDown" ? 1 : -1;
      setAtiva((a) => (filtradas.length ? (a + passo + filtradas.length) % filtradas.length : 0));
    } else if (e.key === "Enter") {
      if (aberto && filtradas[ativa]) {
        e.preventDefault();
        escolher(filtradas[ativa]);
      }
    } else if (e.key === "Escape") {
      if (aberto) {
        e.preventDefault();
        fechar();
      }
    } else if (e.key === "Tab") {
      if (aberto) fechar();
    }
  }

  // mantém a opção ativa à vista ao andar com as setas
  useEffect(() => {
    if (!aberto) return;
    document.getElementById(`${lista}-${ativa}`)?.scrollIntoView({ block: "nearest" });
  }, [ativa, aberto, lista]);

  return (
    <div ref={raiz} className={`campo-busca ${aberto ? "campo-busca--aberto" : ""} ${className}`}>
      <Search className="campo-busca__lupa" aria-hidden="true" />
      <input
        ref={campo}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={aberto}
        aria-controls={lista}
        aria-autocomplete="list"
        aria-activedescendant={aberto && filtradas[ativa] ? `${lista}-${ativa}` : undefined}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={buscando ? texto : escolhida?.rotulo ?? ""}
        onFocus={(e) => {
          e.target.select();
          abrir();
        }}
        onClick={abrir}
        onChange={(e) => {
          setTexto(e.target.value);
          setBuscando(true);
          setAberto(true);
          setAtiva(0);
        }}
        onKeyDown={aoTeclar}
        className="campo-busca__entrada"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        className="campo-busca__seta"
        onClick={() => {
          if (aberto) return fechar();
          campo.current?.focus();
        }}
      >
        <ChevronDown />
      </button>

      {aberto && (
        <ul id={lista} role="listbox" className="campo-busca__lista">
          {filtradas.length === 0 && (
            <li className="campo-busca__vazio" role="presentation">
              {semResultado}
            </li>
          )}
          {filtradas.map((o, i) => (
            <li
              key={o.valor}
              id={`${lista}-${i}`}
              role="option"
              aria-selected={o.valor === valor}
              className={`campo-busca__opcao ${i === ativa ? "campo-busca__opcao--ativa" : ""}`}
              onPointerEnter={() => setAtiva(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => escolher(o)}
            >
              <span className="campo-busca__textos">
                <span className="campo-busca__rotulo">
                  {o.rotulo}
                  {o.selo && <span className="campo-busca__selo">{o.selo}</span>}
                </span>
                {o.detalhe && <span className="campo-busca__detalhe">{o.detalhe}</span>}
              </span>
              {o.valor === valor && <Check className="campo-busca__check" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
