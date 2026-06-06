import "../../css/home/AppFeatures.css";
import { Link } from "react-router-dom";

import celularImg from "../../assets/home/celular.png";
import mulheresImg from "../../assets/home/2mulheres.png";

const AppFeatures = () => {
  return (
    <section className="app-features">
      {/* PRIMEIRA TELA */}
      <div className="app-features__screen app-features__screen--top">
        <div className="app-features__phone">
          <img src={celularImg} alt="Aplicativo INSUMED" />
        </div>

        <div className="app-features__content">
          <h2>
            Visualize seus
            <br />
            agendamentos
            <br />
            através do site
          </h2>

          <p>
            Com o nosso site você pode consultar quais são suas próximas
            coletas que foram marcadas pelo seu polo de atendimento. Clique
            abaixo para entrar.
          </p>

          <Link to="/home" className="button-home">
            Entre
          </Link>
        </div>
      </div>

      {/* SEGUNDA TELA */}
      <div className="app-features__screen app-features__screen--bottom">
        <div className="app-features__left">
          <h2>
            Temos várias
            <br />
            funcionalidades
          </h2>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-bell"></i>
            </div>

            <p>
              Receba notificações personalizadas e evite idas desnecessárias ao
              seu polo de atendimento
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>

            <p>
              Consulte a localização do seu polo de atendimento e encontre o
              melhor trajeto para chegar até ele
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-sync-alt"></i>
            </div>

            <p>
              Atualizações em tempo real para acompanhar seus agendamentos e
              resultados com mais praticidade
            </p>
          </div>
        </div>

        <div className="app-features__right">
          <img src={mulheresImg} alt="Usuárias utilizando o aplicativo" />
        </div>
      </div>
    </section>
  );
};

export default AppFeatures;