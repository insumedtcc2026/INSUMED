import { useEffect } from "react";
import Lenis from "lenis";

// instância ativa (o header da home usa para rolar até as seções)
let lenisAtivo: Lenis | null = null;

/** Rola até um elemento usando a rolagem suave, se ela estiver ligada. */
export function rolarAte(alvo: HTMLElement, deslocamento = 0): boolean {
  if (!lenisAtivo) return false;
  lenisAtivo.scrollTo(alvo, { offset: deslocamento, duration: 1.2 });
  return true;
}

/**
 * Rolagem com inércia (Lenis) na página em que for usado, como no site de
 * referência. Só liga com mouse/trackpad e sem "reduzir movimento"; no
 * celular a rolagem nativa já é suave.
 */
export function useRolagemSuave() {
  useEffect(() => {
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduzir || !mouse) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, autoRaf: true });
    lenisAtivo = lenis;
    return () => {
      lenis.destroy();
      if (lenisAtivo === lenis) lenisAtivo = null;
    };
  }, []);
}
