import { useEffect, useRef, useState, type CSSProperties } from "react";
import "../../css/home/AppFeatures.css";
import { Link } from "react-router-dom";
import { useRevelar } from "../../hook/useRevelar";

import celularImg from "../../assets/home/celulares.webp";
import mulheresImg from "../../assets/home/2mulheres.webp";

const funcionalidades = [
  {
    icone: "fa-bell",
    texto: "Avisos antes de cada coleta e quando um insumo estiver em falta, para você não sair de casa à toa.",
  },
  {
    icone: "fa-map-marker-alt",
    texto: "Encontre o ponto de coleta mais perto, veja os horários de atendimento e trace a rota até lá.",
  },
  {
    icone: "fa-file-medical",
    texto: "Envie sua prescrição pelo site e acompanhe a análise da unidade, do envio até a liberação.",
  },
];

/** Caminho da faixa que liga as duas telas, calculado no tamanho real da seção. */
function caminhoFaixa(w: number, h: number) {
  const x = (f: number) => (f * w).toFixed(1);
  const y = (f: number) => (f * h).toFixed(1);
  return [
    `M${x(1.06)} ${y(0.02)}`,
    `C${x(0.74)} ${y(0.08)} ${x(0.7)} ${y(0.26)} ${x(0.86)} ${y(0.38)}`,
    `S${x(0.66)} ${y(0.6)} ${x(0.58)} ${y(0.7)}`,
    `S${x(0.78)} ${y(0.96)} ${x(1.06)} ${y(1.01)}`,
  ].join(" ");
}

const AppFeatures = () => {
  const secao = useRef<HTMLElement>(null);
  const faixa = useRef<SVGPathElement>(null);
  const [tamanho, setTamanho] = useState({ w: 0, h: 0 });
  useRevelar(secao);

  // a faixa acompanha o tamanho da seção
  useEffect(() => {
    const el = secao.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setTamanho({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // a faixa vai sendo desenhada conforme a pessoa rola a página
  useEffect(() => {
    const el = secao.current;
    const path = faixa.current;
    if (!el || !path || !tamanho.w) return;
    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
      return;
    }
    let quadro = 0;
    const atualizar = () => {
      const { top, height } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progresso = Math.max(0, Math.min(1, (vh * 0.85 - top) / (height * 0.85)));
      path.style.strokeDashoffset = `${total * (1 - progresso)}`;
    };
    const aoRolar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(atualizar);
    };
    atualizar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", aoRolar);
    };
  }, [tamanho]);

  const d = tamanho.w ? caminhoFaixa(tamanho.w, tamanho.h) : "";

  return (
    <section className="app-features" ref={secao}>
      {/* faixa azul-clara que "liga" a primeira tela à segunda */}
      {d && (
        <svg
          className="app-features__faixa"
          viewBox={`0 0 ${tamanho.w} ${tamanho.h}`}
          width={tamanho.w}
          height={tamanho.h}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="faixa-gradiente" x1="0" y1="0" x2="0" y2="1">
              {/* paleta do site: azul principal até o azul claro */}
              <stop offset="0%" stopColor="#0042ec" />
              <stop offset="60%" stopColor="#0042ec" />
              <stop offset="100%" stopColor="#0192fe" />
            </linearGradient>
          </defs>
          <path ref={faixa} className="app-features__faixa-linha" d={d} />
        </svg>
      )}

      {/* PRIMEIRA TELA */}
      <div className="app-features__screen app-features__screen--top">
        <div className="app-features__phone" data-revelar="esquerda">
          <span className="app-features__circulo" aria-hidden="true" />
          <img src={celularImg} alt="Celulares com o comprovante de agendamento e a tela Meus agendamentos do INSUMED" width={826} height={1094} loading="lazy" />
        </div>

        <div className="app-features__content">
          <h2 data-revelar="">
            Visualize seus
            <br />
            agendamentos
            <br />
            através do site
          </h2>

          <p data-revelar="" style={{ "--atraso": "120ms" } as CSSProperties}>
            Veja a data, o turno e a unidade de cada retirada, confirme se vai comparecer e mostre o
            comprovante com QR Code no balcão. Tudo pelo celular ou pelo computador.
          </p>

          <Link to="/login" className="button-home" data-revelar="" style={{ "--atraso": "240ms" } as CSSProperties}>
            Entrar <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </div>

      {/* SEGUNDA TELA */}
      <div className="app-features__screen app-features__screen--bottom">
        <div className="app-features__left">
          <h2 data-revelar="">
            Tudo o que
            <br />
            você precisa
            <br />
            num só lugar
          </h2>

          {funcionalidades.map(({ icone, texto }, i) => (
            <div
              className="feature-card"
              key={icone}
              data-revelar="esquerda"
              style={{ "--atraso": `${i * 120}ms` } as CSSProperties}
            >
              <div className="feature-icon">
                <i className={`fas ${icone}`} aria-hidden="true"></i>
              </div>
              <p>{texto}</p>
            </div>
          ))}
        </div>

        <div className="app-features__right" data-revelar="direita">
          <img src={mulheresImg} alt="Duas mulheres consultando o INSUMED no celular" loading="lazy" />
        </div>
      </div>
    </section>
  );
};

export default AppFeatures;
