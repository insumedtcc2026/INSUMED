import { Link } from "react-router-dom";
import { CalendarCheck, FileText, MapPin, Package, Upload } from "lucide-react";

const ATALHOS = [
  { para: "/enviarsolicitacao", texto: "Enviar prescrição", Icone: Upload },
  { para: "/agendamentos", texto: "Agendamentos", Icone: CalendarCheck },
  { para: "/prescricoes", texto: "Minhas prescrições", Icone: FileText },
  { para: "/meus-insumos", texto: "Meus insumos", Icone: Package },
  { para: "/pontos-coleta", texto: "Pontos de coleta", Icone: MapPin },
];

/** Atalhos da home do paciente. */
export default function AtalhosPaciente() {
  return (
    <section className="hp-secao" aria-labelledby="hp-atalhos-titulo">
      <h2 id="hp-atalhos-titulo" className="hp-titulo">Atalhos</h2>
      <ul className="hp-atalhos">
        {ATALHOS.map(({ para, texto, Icone }) => (
          <li key={para}>
            <Link to={para} className="hp-atalho">
              <span className="hp-atalho__icone">
                <Icone aria-hidden="true" />
              </span>
              <span className="hp-atalho__texto">{texto}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
