import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Stethoscope } from "lucide-react";
import "../../css/home/ExpansionMap.css";
import { API_URL } from "../../config";
import { useRevelar } from "../../hook/useRevelar";
import { CIDADES_RJ, MAPA_RJ } from "./mapaRJ";

type Posto = { pos_id: number; pos_nome: string; pos_latitude: number | null; pos_longitude: number | null };
type Pino = { id: number; nome: string; x: number; y: number; cidade: string | null };

// mesma projeção usada para gerar os contornos das cidades (mapaRJ.ts)
function projetar(lat: number, lng: number) {
  const { minLon, maxLat, k, s, pad } = MAPA_RJ;
  return { x: (lng - minLon) * k * s + pad, y: (maxLat - lat) * s + pad };
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/**
 * Mapa do estado do Rio com as 92 cidades. Passando o mouse (ou tocando),
 * a cidade acende e cresce um pouco, e o cartão de baixo mostra quantos
 * pontos de coleta ela tem. Os pinos são os pontos de coleta cadastrados.
 */
const ExpansionMap: React.FC = () => {
  const secao = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const caminhos = useRef(new Map<string, SVGPathElement>());
  const [pinos, setPinos] = useState<Pino[]>([]);
  const [cidadeAtiva, setCidadeAtiva] = useState<string | null>(null);
  const [pinoAtivo, setPinoAtivo] = useState<number | null>(null);
  // sem IntersectionObserver (navegador antigo) o mapa já aparece pronto
  const [visivel, setVisivel] = useState(() => !("IntersectionObserver" in window));
  useRevelar(secao);

  // busca os pontos de coleta e descobre em que cidade cada um fica
  // (pelo próprio desenho do mapa, que já está na tela quando a resposta chega)
  useEffect(() => {
    let ativo = true;
    axios
      .get<Posto[]>(`${API_URL}/postos`)
      .then((r) => {
        if (!ativo) return;
        const lista: Pino[] = [];
        for (const p of Array.isArray(r.data) ? r.data : []) {
          if (p.pos_latitude == null || p.pos_longitude == null) continue;
          const { x, y } = projetar(Number(p.pos_latitude), Number(p.pos_longitude));
          if (x < 0 || y < 0 || x > MAPA_RJ.w || y > MAPA_RJ.h) continue;
          let cidade: string | null = null;
          const ponto = svg.current?.createSVGPoint();
          if (ponto) {
            ponto.x = x;
            ponto.y = y;
            for (const [id, el] of caminhos.current) {
              if (el.isPointInFill?.(ponto)) {
                cidade = id;
                break;
              }
            }
          }
          lista.push({ id: p.pos_id, nome: p.pos_nome, x, y, cidade });
        }
        setPinos(lista);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);

  // o mapa "acende" quando chega na tela
  useEffect(() => {
    const el = svg.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const postosPorCidade = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pinos) if (p.cidade) m.set(p.cidade, (m.get(p.cidade) ?? 0) + 1);
    return m;
  }, [pinos]);

  const ativa = CIDADES_RJ.find((c) => c.id === cidadeAtiva) ?? null;
  const pino = pinos.find((p) => p.id === pinoAtivo) ?? null;
  const qtdAtiva = ativa ? postosPorCidade.get(ativa.id) ?? 0 : 0;

  return (
    <section className="expansion-section" ref={secao}>
      <div className="expansion-container">
        {/* LEFT SIDE */}
        <div className="expansion-left">
          <h2 className="expansion-title" data-revelar="">
            ESTAMOS EXPANDINDO PARA <br />
            TODO O RIO DE JANEIRO
          </h2>

          <div className="expansion-cards">
            <div className="expansion-card" data-revelar="esquerda">
              <div className="icon rank-icon">
                <span>1º</span>
              </div>
              <p>
                As primeiras unidades de saúde já recebem prescrições e marcam coletas pelo INSUMED.
              </p>
            </div>

            <div className="expansion-card" data-revelar="esquerda" style={{ "--atraso": "120ms" } as React.CSSProperties}>
              <div className="icon map-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <p>
                Passe o mouse no mapa para ver as cidades e os pontos de coleta que já atendem pelo site.
              </p>
            </div>

            <div className="expansion-card" data-revelar="esquerda" style={{ "--atraso": "240ms" } as React.CSSProperties}>
              <div className="icon city-icon">
                <i className="fas fa-city" aria-hidden="true"></i>
              </div>
              <p>
                Sua cidade ainda não aparece? Crie sua conta e conte para a sua unidade de saúde sobre o INSUMED.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="expansion-right">
          <div className={`mapa-rj ${visivel ? "mapa-rj--visivel" : ""} ${ativa || pino ? "mapa-rj--focado" : ""}`}>
            <svg
              ref={svg}
              className="mapa-rj__svg"
              viewBox={`0 0 ${MAPA_RJ.w} ${MAPA_RJ.h}`}
              role="img"
              aria-label={`Mapa do estado do Rio de Janeiro com ${plural(pinos.length, "ponto de coleta", "pontos de coleta")}`}
              onMouseLeave={() => setCidadeAtiva(null)}
            >
              <g className="mapa-rj__cidades">
                {CIDADES_RJ.map((c) => (
                  <path
                    key={c.id}
                    ref={(el) => {
                      if (el) caminhos.current.set(c.id, el);
                      else caminhos.current.delete(c.id);
                    }}
                    d={c.d}
                    className={`mapa-rj__cidade ${postosPorCidade.has(c.id) ? "mapa-rj__cidade--atendida" : ""}`}
                    style={{ "--atraso": `${(c.c[0] / MAPA_RJ.w) * 0.9}s` } as React.CSSProperties}
                    onMouseEnter={() => setCidadeAtiva(c.id)}
                    onClick={() => setCidadeAtiva(c.id)}
                  />
                ))}
              </g>

              {/* a cidade apontada é desenhada de novo por cima, maior */}
              {ativa && (
                <path key={ativa.id} d={ativa.d} className="mapa-rj__destaque" pointerEvents="none" />
              )}

              <g className="mapa-rj__pinos">
                {pinos.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/pontos-coleta/${p.id}`}
                    aria-label={`${p.nome}: ver ponto de coleta`}
                    className={`mapa-rj__pino ${pinoAtivo === p.id ? "mapa-rj__pino--ativo" : ""}`}
                    style={{ "--atraso": `${1 + i * 0.12}s` } as React.CSSProperties}
                    onMouseEnter={() => {
                      setPinoAtivo(p.id);
                      if (p.cidade) setCidadeAtiva(p.cidade);
                    }}
                    onMouseLeave={() => setPinoAtivo(null)}
                    onFocus={() => {
                      setPinoAtivo(p.id);
                      if (p.cidade) setCidadeAtiva(p.cidade);
                    }}
                    onBlur={() => setPinoAtivo(null)}
                  >
                    <g transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
                      <circle className="mapa-rj__pino-onda" r="14" />
                      <g className="mapa-rj__pino-corpo">
                        <path d="M0 0c-3-9-19.5-21-19.5-37.5a19.5 19.5 0 0 1 39 0c0 16.5-16.5 28.5-19.5 37.5z" />
                        <circle cy="-37.5" r="7.8" />
                      </g>
                    </g>
                  </Link>
                ))}
              </g>
            </svg>

            {pino && (
              <div
                className="mapa-rj__balao"
                style={{ left: `${(pino.x / MAPA_RJ.w) * 100}%`, top: `${(pino.y / MAPA_RJ.h) * 100}%` }}
                role="status"
              >
                {pino.nome}
              </div>
            )}

            <div className="mapa-rj__cartao" aria-live="polite">
              <span className="mapa-rj__cartao-icone">
                <Stethoscope aria-hidden="true" />
              </span>
              <span className="mapa-rj__cartao-texto" key={ativa?.id ?? "rj"}>
                <strong>{ativa ? ativa.nome : "Rio de Janeiro"}</strong>
                {ativa
                  ? qtdAtiva
                    ? `${plural(qtdAtiva, "ponto de coleta", "pontos de coleta")} pelo INSUMED`
                    : "Em breve por aqui"
                  : pinos.length
                    ? `${plural(pinos.length, "ponto de coleta", "pontos de coleta")} em ${plural(postosPorCidade.size, "cidade", "cidades")}`
                    : "Conectando saúde, pessoas e regiões."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpansionMap;
