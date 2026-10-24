import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../css/universais/Acessibilidade.css";

// Tamanhos de texto oferecidos (aplicados com zoom na página inteira, para
// funcionar também nos textos definidos em px)
const ESCALAS = [1, 1.15, 1.3] as const;
const CHAVE = "insumed_acessibilidade";

interface Preferencias {
  escala: number;
  contraste: boolean;
}

function lerPreferencias(): Preferencias {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
    return {
      escala: ESCALAS.includes(salvo.escala) ? salvo.escala : 1,
      contraste: Boolean(salvo.contraste),
    };
  } catch {
    return { escala: 1, contraste: false };
  }
}

function aplicar({ escala, contraste }: Preferencias) {
  const html = document.documentElement;
  html.style.setProperty("zoom", escala === 1 ? "" : String(escala));
  html.classList.toggle("alto-contraste", contraste);
}

// aplica já no carregamento, antes do primeiro desenho do React
aplicar(lerPreferencias());

// ---------- Ouvir a tela (leitura em voz alta do navegador) ----------
const temVoz = typeof window !== "undefined" && "speechSynthesis" in window;

// Texto a ler: o trecho selecionado ou o conteúdo principal da página
// (sem menus, rodapé e este painel)
const FORA_DA_LEITURA = "nav, footer, header, script, style, [aria-hidden='true'], .acessibilidade, .leaflet-container, .sr-only, .pular-conteudo";

function textoVisivel(alvo: HTMLElement): string {
  const partes: string[] = [];
  const andar = document.createTreeWalker(alvo, NodeFilter.SHOW_TEXT);
  for (let no = andar.nextNode(); no; no = andar.nextNode()) {
    const pai = no.parentElement;
    const t = no.textContent?.replace(/\s+/g, " ").trim();
    if (!t || !pai || pai.closest(FORA_DA_LEITURA) || pai.getClientRects().length === 0) continue;
    partes.push(t);
  }
  // cada bloco de texto vira uma frase (pausa entre título, rótulo e valor)
  return partes.map((t) => (/[.!?:;,]$/.test(t) ? t : `${t}.`)).join(" ");
}

function textoParaLer(): string {
  const selecionado = window.getSelection?.()?.toString().trim();
  if (selecionado) return selecionado;
  // algumas páginas têm só o título dentro de <main>: aí lê a página toda
  const principal = document.querySelector<HTMLElement>("main");
  const doMain = principal ? textoVisivel(principal) : "";
  return doMain.length >= 200 ? doMain : textoVisivel(document.body);
}

// O Chrome interrompe falas longas: lê em pedaços de até ~220 caracteres
function emPedacos(texto: string): string[] {
  const frases = texto.match(/[^.!?;:]+[.!?;:]*\s*/g) ?? [texto];
  const pedacos: string[] = [];
  let atual = "";
  for (const f of frases) {
    if ((atual + f).length > 220 && atual) {
      pedacos.push(atual.trim());
      atual = "";
    }
    atual += f;
  }
  if (atual.trim()) pedacos.push(atual.trim());
  return pedacos;
}

function vozPortugues() {
  const vozes = window.speechSynthesis.getVoices();
  return vozes.find((v) => v.lang === "pt-BR") ?? vozes.find((v) => v.lang.toLowerCase().startsWith("pt")) ?? null;
}

/**
 * Recursos de acessibilidade presentes em todas as páginas:
 * - link "Pular para o conteúdo" (aparece ao navegar com Tab);
 * - botão com aumento de texto e alto contraste (preferência salva no navegador).
 * O VLibras (Libras) é carregado no index.html.
 */
export default function Acessibilidade() {
  const [prefs, setPrefs] = useState<Preferencias>(lerPreferencias);
  // o painel fica aberto só na página em que foi aberto (trocar de página fecha)
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const painel = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const aberto = abertoEm === pathname;
  const setAberto = (valor: boolean | ((v: boolean) => boolean)) =>
    setAbertoEm((atual) => {
      const novo = typeof valor === "function" ? valor(atual === pathname) : valor;
      return novo ? pathname : null;
    });

  useEffect(() => {
    aplicar(prefs);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(prefs));
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
  }, [prefs]);

  // fecha com Esc ou clicando fora
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setAbertoEm(null);
    const aoClicar = (e: MouseEvent) => {
      if (painel.current && !painel.current.contains(e.target as Node)) setAbertoEm(null);
    };
    window.addEventListener("keydown", aoTeclar);
    window.addEventListener("mousedown", aoClicar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("mousedown", aoClicar);
    };
  }, [aberto]);

  function pularParaConteudo(e: React.MouseEvent) {
    e.preventDefault();
    const alvo = document.querySelector<HTMLElement>("main");
    if (!alvo) return;
    alvo.setAttribute("tabindex", "-1");
    alvo.focus();
    alvo.scrollIntoView({ block: "start" });
  }

  // leitura em voz alta: para ao trocar de página
  const [lendo, setLendo] = useState(false);
  useEffect(() => () => {
    if (temVoz) window.speechSynthesis.cancel();
  }, [pathname]);

  function ouvir() {
    if (!temVoz) return;
    const fala = window.speechSynthesis;
    if (lendo) {
      fala.cancel();
      setLendo(false);
      return;
    }
    const texto = textoParaLer();
    if (!texto) return;
    fala.cancel();
    const voz = vozPortugues();
    const pedacos = emPedacos(texto);
    pedacos.forEach((trecho, i) => {
      const u = new SpeechSynthesisUtterance(trecho);
      u.lang = "pt-BR";
      if (voz) u.voice = voz;
      u.rate = 1;
      if (i === pedacos.length - 1) u.onend = () => setLendo(false);
      u.onerror = () => setLendo(false);
      fala.speak(u);
    });
    setLendo(true);
  }

  const indice = ESCALAS.indexOf(prefs.escala as (typeof ESCALAS)[number]);

  return (
    <>
      <a href="#conteudo" className="pular-conteudo" onClick={pularParaConteudo}>
        Pular para o conteúdo
      </a>

      <div className="acessibilidade" ref={painel}>
        <button
          type="button"
          className="acessibilidade-botao"
          aria-expanded={aberto}
          aria-controls="painel-acessibilidade"
          aria-label="Opções de acessibilidade"
          onClick={() => setAberto((v) => !v)}
        >
          <span aria-hidden="true">Aa</span>
        </button>

        {aberto && (
          <div id="painel-acessibilidade" className="acessibilidade-painel" role="group" aria-label="Opções de acessibilidade">
            <p className="acessibilidade-titulo">Acessibilidade</p>

            <p className="acessibilidade-rotulo" id="rotulo-texto">Tamanho do texto</p>
            <div className="acessibilidade-linha" role="group" aria-labelledby="rotulo-texto">
              <button
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, escala: ESCALAS[Math.max(0, indice - 1)] }))}
                disabled={indice <= 0}
                aria-label="Diminuir texto"
              >
                A−
              </button>
              <span aria-live="polite">{Math.round(prefs.escala * 100)}%</span>
              <button
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, escala: ESCALAS[Math.min(ESCALAS.length - 1, indice + 1)] }))}
                disabled={indice >= ESCALAS.length - 1}
                aria-label="Aumentar texto"
              >
                A+
              </button>
            </div>

            <label className="acessibilidade-opcao">
              <input
                type="checkbox"
                checked={prefs.contraste}
                onChange={(e) => setPrefs((p) => ({ ...p, contraste: e.target.checked }))}
              />
              Alto contraste
            </label>

            {temVoz && (
              <>
                <p className="acessibilidade-rotulo">Ouvir a tela</p>
                <button
                  type="button"
                  className={`acessibilidade-ouvir${lendo ? " acessibilidade-ouvir--ativo" : ""}`}
                  aria-pressed={lendo}
                  onClick={ouvir}
                >
                  {lendo ? "Parar leitura" : "Ouvir esta página"}
                </button>
                <p className="acessibilidade-dica">Selecione um trecho antes para ouvir só ele.</p>
                <span className="sr-only" aria-live="polite">{lendo ? "Lendo a página em voz alta" : ""}</span>
              </>
            )}

            <button
              type="button"
              className="acessibilidade-restaurar"
              onClick={() => setPrefs({ escala: 1, contraste: false })}
            >
              Restaurar padrão
            </button>
          </div>
        )}
      </div>
    </>
  );
}
