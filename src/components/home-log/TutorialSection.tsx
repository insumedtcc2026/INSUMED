import '../../css/home-log/TutorialSection.css';

import elderlyImage from '../../assets/home-log/idosa.png';

export default function TutorialSection() {
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
            <iframe
              className="tutorial-video"
              src="https://www.youtube.com/embed/Vgx6l-WaNnU"
              title="Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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