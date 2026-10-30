import '../../css/home-log/TutorialSection.css';

import { useState } from 'react';
import { Play } from 'lucide-react';

import elderlyImage from '../../assets/home-log/idosa.webp';
import capaTutorial from '../../assets/home-log/capa-tutorial.webp';

const VIDEO = 'https://www.youtube.com/embed/Vgx6l-WaNnU';

export default function TutorialSection() {
  // até a pessoa clicar, aparece a nossa capa (e não a miniatura do YouTube)
  const [tocando, setTocando] = useState(false);

  return (
    <section className="tutorial-section">
      <div className="tutorial-container">

        {/* ESQUERDA */}
        <div className="tutorial-left">
          <h2 className="tutorial-title">
            ESTÁ COM DIFICULDADE
            <br />
            DE USAR NOSSO SITE?
          </h2>

          <p className="tutorial-description">
            Assista a esse simples tutorial que nossa equipe
            preparou para você!
          </p>

          <div className="tutorial-video-wrapper">
            {tocando ? (
              <iframe
                className="tutorial-video"
                src={`${VIDEO}?autoplay=1&rel=0`}
                title="Tutorial: como usar o INSUMED"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="tutorial-capa"
                onClick={() => setTocando(true)}
                aria-label="Assistir ao tutorial: como usar o INSUMED"
              >
                <img src={capaTutorial} alt="" width={1280} height={720} loading="lazy" />
                <span className="tutorial-capa__play" aria-hidden="true">
                  <Play />
                </span>
              </button>
            )}
          </div>
        </div>

        {/* DIREITA */}
        <div className="tutorial-right">
          <img
            src={elderlyImage}
            alt="Pessoa idosa"
            className="tutorial-image"
          />
        </div>

      </div>
    </section>
  );
}
