import { useEffect, type RefObject } from "react";

/**
 * Entrada ao rolar: todo elemento com data-revelar dentro de `raiz` aparece
 * (sobe, desliza ou cresce, conforme o valor) quando chega na tela.
 * O atraso de cada um pode vir em style={{ "--atraso": "120ms" }}.
 * Com "reduzir movimento" ou sem IntersectionObserver, tudo já aparece pronto.
 */
export function useRevelar(raiz: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzir || !("IntersectionObserver" in window)) return;

    const alvos = Array.from(el.querySelectorAll<HTMLElement>("[data-revelar]"));
    el.classList.add("revelar-ativo");

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const alvo = entrada.target as HTMLElement;
          alvo.classList.add("revelado");
          observador.unobserve(alvo);
          // terminada a entrada, o elemento volta às próprias transições (hover)
          const aoTerminar = (e: TransitionEvent) => {
            if (e.target !== alvo) return;
            alvo.removeEventListener("transitionend", aoTerminar);
            alvo.removeAttribute("data-revelar");
            alvo.classList.remove("revelado");
          };
          alvo.addEventListener("transitionend", aoTerminar);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    alvos.forEach((a) => observador.observe(a));

    return () => {
      observador.disconnect();
      el.classList.remove("revelar-ativo");
    };
  }, [raiz]);
}
