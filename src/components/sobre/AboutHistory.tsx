// AboutHistory.tsx

import '../../css/sobre/AboutHistory.css';

import TeamImage from '../../assets/sobre/about-team.png';

export default function AboutHistory() {
  return (
    <section className="history-section">
      <div className="history-container">
        <div className="history-content">
          <h2>Conheça nossa história</h2>

          <p>
            O INSUMED é uma plataforma digital criada para resolver as
            dificuldades que os pacientes enfrentam no processo de coleta e
            acompanhamento de insumos médicos, como a falta de organização e de
            comunicação. O sistema foi desenvolvido para facilitar esse
            gerenciamento, trazendo mais praticidade e eficiência tanto para os
            profissionais de saúde quanto para os usuários.
          </p>

          <p>
            O projeto foi idealizado por alunos do Curso Técnico em Informática
            para Internet da FAETEC (unidade ETE Volta Redonda) como Trabalho
            de Conclusão de Curso (TCC), unindo o aprendizado técnico a uma
            proposta de forte impacto social.
          </p>
        </div>

        <div className="history-image">
          <img src={TeamImage} alt="Equipe INSUMED" />
        </div>
      </div>
    </section>
  );
}