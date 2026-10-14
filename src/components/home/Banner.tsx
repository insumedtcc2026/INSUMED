import React, { useEffect, useState } from "react";
import '../../css/home/Banner.css';
// O Banner.svg original tinha 45 MB (imagens PNG gigantes embutidas).
// Estas versões WebP têm a mesma aparência e o navegador escolhe o
// tamanho certo para a tela (85–160 KB no computador).
import banner768 from '../../assets/home/banner-768.webp';
import banner1440 from '../../assets/home/banner-1440.webp';
import banner2160 from '../../assets/home/banner-2160.webp';
// Recorte só da ilustração (pessoa + notificações) para o celular
import pessoa640 from '../../assets/home/banner-pessoa-640.webp';
import pessoa960 from '../../assets/home/banner-pessoa-960.webp';

const CONSULTA_CELULAR = "(max-width: 767px)";

// Renderiza só a versão da tela atual (assim o celular não baixa a arte grande).
function useCelular() {
  const [celular, setCelular] = useState(() => window.matchMedia(CONSULTA_CELULAR).matches);

  useEffect(() => {
    const mq = window.matchMedia(CONSULTA_CELULAR);
    const aoMudar = () => setCelular(mq.matches);
    mq.addEventListener("change", aoMudar);
    return () => mq.removeEventListener("change", aoMudar);
  }, []);

  return celular;
}

const Banner: React.FC = () => {
  const celular = useCelular();

  if (celular) {
    // No recorte da arte o texto ficava cortado; aqui ele é texto de
    // verdade (nítido e lido por leitores de tela).
    return (
      <section className="bannercontainer banner-mobile">
        <h1 className="banner-mobile-titulo">
          Ficar sem seus insumos? <span>Nunca mais!</span>
        </h1>
        <p className="banner-mobile-texto">
          A saúde é um estado de completo bem-estar físico, mental e social. Vai muito
          além da ausência de doenças e envolve cuidados diários, curiosidades
          surpreendentes e reflexões sobre a qualidade de vida.
        </p>
        <img
          src={pessoa640}
          srcSet={`${pessoa640} 640w, ${pessoa960} 960w`}
          sizes="100vw"
          width={640}
          height={640}
          alt=""
          className="banner-mobile-imagem"
          draggable={false}
          fetchPriority="high"
        />
      </section>
    );
  }

  return (
    <section className="bannercontainer">
      <img
        src={banner1440}
        srcSet={`${banner768} 768w, ${banner1440} 1440w, ${banner2160} 2160w`}
        sizes="100vw"
        width={1440}
        height={875}
        alt="Ficar sem seus insumos? Nunca mais! A saúde é um estado de completo bem-estar físico, mental e social."
        className="bannerhero"
        draggable={false}
        fetchPriority="high"
      />
    </section>
  );
};

export default Banner;
