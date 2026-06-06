import React from "react";
import "../../css/home/ExpansionMap.css";
import mapaRJ from "../../assets/home/mapa.png";

const ExpansionMap: React.FC = () => {
  return (
    <section className="expansion-section">
      <div className="expansion-container">
        {/* LEFT SIDE */}
        <div className="expansion-left">
          <h2 className="expansion-title">
            ESTAMOS EXPANDINDO PARA <br />
            TODO O RIO DE JANEIRO
          </h2>

          <div className="expansion-cards">
            <div className="expansion-card">
              <div className="icon rank-icon">
                <span>1º</span>
              </div>
              <p>
                Receba notificações personalizadas e evite idas desnecessárias
                ao seu polo de atendimento
              </p>
            </div>

            <div className="expansion-card">
              <div className="icon map-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <p>
                Receba notificações personalizadas e evite idas desnecessárias
                ao seu polo de atendimento
              </p>
            </div>

            <div className="expansion-card">
              <div className="icon user-icon">
                <i className="fas fa-user"></i>
              </div>
              <p>
                Receba notificações personalizadas e evite idas desnecessárias
                ao seu polo de atendimento
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="expansion-right">
          <div className="map-wrapper">
            <img src={mapaRJ} alt="Mapa do Rio de Janeiro" />

          </div>

        
        </div>
      </div>
    </section>
  );
};

export default ExpansionMap;