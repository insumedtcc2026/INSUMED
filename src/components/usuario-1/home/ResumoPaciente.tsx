import { Link } from "react-router-dom";
import AgendamentoCardPaciente from "../agendamentos/Agendamentocardpaciente";
import { montarEtapas } from "../../../utils/etapasPrescricao";
import type { Agendamento } from "../../../types/agendamento";
import type { MinhaPrescricao } from "../../../services/PrescricaoService";
import { faltamParaColeta, textoTurno } from "../../../utils/agenda";
import { formatarData } from "../../../utils/status";
import { hojeISO } from "../../../utils/validacoes";

// rótulo e cores do selo da última prescrição
const SELO_PRESCRICAO: Record<string, { texto: string; classe: string }> = {
  Pendente: { texto: "Em análise", classe: "hp-selo--azul" },
  Revisado: { texto: "Em análise", classe: "hp-selo--azul" },
  Aprovado: { texto: "Em análise", classe: "hp-selo--azul" },
  Reenvio: { texto: "Reenviar", classe: "hp-selo--amarelo" },
  Autorizado: { texto: "Autorizada", classe: "hp-selo--verde" },
  "Nao Autorizado": { texto: "Não autorizada", classe: "hp-selo--vermelho" },
};

function ProximaColeta({ agendamento, onAtualizar }: { agendamento: Agendamento | null; onAtualizar: () => void }) {
  return (
    <section className="hp-resumo" aria-labelledby="hp-coleta-titulo">
      <div className="hp-resumo__topo">
        <h2 id="hp-coleta-titulo" className="hp-resumo__titulo">Próxima coleta</h2>
        {agendamento?.sol_data_de_coleta && (
          <span className="hp-resumo__data">
            {formatarData(agendamento.sol_data_de_coleta)}
            {agendamento.sol_turno ? `, ${textoTurno(agendamento.sol_turno)}` : ""} ·{" "}
            {faltamParaColeta(agendamento.sol_data_de_coleta, hojeISO())}
          </span>
        )}
      </div>
      {agendamento ? (
        // o mesmo card (com a borda em degradê) da página Agendamentos
        <div className="hp-resumo__borda">
          <AgendamentoCardPaciente agendamento={agendamento} onAtualizar={onAtualizar} />
        </div>
      ) : (
        <div className="hp-resumo__cartao">
          <p className="hp-resumo__vazio">Você não tem nenhuma coleta marcada agora. Quando a unidade agendar, ela aparece aqui.</p>
          <div className="hp-resumo__acoes">
            <Link to="/agendamentos" className="hp-botao">Ver agendamentos</Link>
          </div>
        </div>
      )}
    </section>
  );
}

function UltimaPrescricao({ prescricao }: { prescricao: MinhaPrescricao | null }) {
  if (!prescricao) {
    return (
      <section className="hp-resumo" aria-labelledby="hp-prescricao-titulo">
        <div className="hp-resumo__topo">
          <h2 id="hp-prescricao-titulo" className="hp-resumo__titulo">Última prescrição</h2>
        </div>
        <div className="hp-resumo__cartao">
          <p className="hp-resumo__vazio">Você ainda não enviou nenhuma prescrição. Envie uma foto ou o PDF da receita para começar.</p>
          <div className="hp-resumo__acoes">
            <Link to="/enviarsolicitacao" className="hp-botao hp-botao--cheio">Enviar prescrição</Link>
          </div>
        </div>
      </section>
    );
  }

  const { etapas } = montarEtapas(prescricao);
  const selo = SELO_PRESCRICAO[prescricao.sol_status];

  return (
    <section className="hp-resumo" aria-labelledby="hp-prescricao-titulo">
      <div className="hp-resumo__topo">
        <h2 id="hp-prescricao-titulo" className="hp-resumo__titulo">Última prescrição</h2>
        {selo && <span className={`hp-selo ${selo.classe}`}>{selo.texto}</span>}
      </div>

      <div className="hp-resumo__cartao">
        <ol className="hp-etapas" aria-label={`Etapas da prescrição nº ${prescricao.sol_id}`}>
          {etapas.map((e) => (
            <li key={e.titulo} className={`hp-etapa hp-etapa--${e.estado}`}>
              <span className="hp-etapa__bolinha" aria-hidden="true" />
              <span>
                {e.titulo}
                {(e.data || e.descricao) && (
                  <small>{[e.data, e.descricao].filter(Boolean).join(" · ")}</small>
                )}
              </span>
            </li>
          ))}
        </ol>

        <div className="hp-resumo__acoes">
          <Link to="/prescricoes" className="hp-botao">Ver andamento</Link>
        </div>
      </div>
    </section>
  );
}

/** Próxima coleta e última prescrição, lado a lado na home do paciente. */
export default function ResumoPaciente({
  agendamento,
  prescricao,
  onAtualizar,
}: {
  agendamento: Agendamento | null;
  prescricao: MinhaPrescricao | null;
  onAtualizar: () => void;
}) {
  return (
    <div className="hp-resumos">
      <ProximaColeta agendamento={agendamento} onAtualizar={onAtualizar} />
      <UltimaPrescricao prescricao={prescricao} />
    </div>
  );
}
