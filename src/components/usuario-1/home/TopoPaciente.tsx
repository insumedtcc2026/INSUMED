import { Link } from "react-router-dom";
import { CalendarCheck, ChevronRight } from "lucide-react";
import type { Agendamento } from "../../../types/agendamento";
import { diaCurto, textoTurno } from "../../../utils/agenda";
import mulheres from "../../../assets/home-log/topo-paciente-mulheres.webp";

/**
 * Celular: o banner continua o header azul, formando um bloco só no topo
 * da home, com um cartão da próxima coleta. No computador fica o banner.
 */
export default function TopoPaciente({
  agendamento,
  carregando,
}: {
  agendamento: Agendamento | null;
  carregando: boolean;
}) {
  const data = agendamento?.sol_data_de_coleta;
  const detalhes = [textoTurno(agendamento?.sol_turno), agendamento?.posto?.pos_nome].filter(Boolean).join(" · ");

  return (
    <section className="hp-topo" aria-label="Próxima coleta">
      <p className="hp-topo__marca">
        INSUMED
        <span>Facilitando a coleta de insumos médicos</span>
      </p>
      <img className="hp-topo__mulheres" src={mulheres} alt="" aria-hidden="true" width={469} height={720} />

      {!carregando && (
        <Link to="/agendamentos" className="hp-topo__cartao">
          <span className="hp-topo__icone">
            <CalendarCheck aria-hidden="true" />
          </span>
          <span className="hp-topo__texto">
            {data ? (
              <>
                <strong>Próxima coleta: {diaCurto(data)}</strong>
                {detalhes && <span>{detalhes.charAt(0).toUpperCase() + detalhes.slice(1)}</span>}
              </>
            ) : (
              <>
                <strong>Nenhuma coleta marcada</strong>
                <span>Quando a unidade agendar, aparece aqui</span>
              </>
            )}
          </span>
          <ChevronRight className="hp-topo__seta" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
