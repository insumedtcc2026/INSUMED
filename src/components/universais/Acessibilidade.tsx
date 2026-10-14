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
