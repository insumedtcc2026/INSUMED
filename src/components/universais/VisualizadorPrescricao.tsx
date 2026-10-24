import { ExternalLink, FileText, Repeat } from "lucide-react";
import type { ItemPrescricao } from "../../utils/itensPrescricao";

// Peças das telas que abrem uma prescrição para revisão (admin) e para
// autorização (autorizador). O visual fica em RevisaoPrescricao.css.

const STATUS: Record<string, { texto: string; tom: string }> = {
  Pendente: { texto: "Aguardando revisão", tom: "alerta" },
  Reenvio: { texto: "Aguardando reenvio", tom: "alerta" },
  Revisado: { texto: "Aguardando autorização", tom: "info" },
  Autorizado: { texto: "Autorizada", tom: "sucesso" },
  Aprovado: { texto: "Autorizada", tom: "sucesso" },
  "Nao Autorizado": { texto: "Não autorizada", tom: "erro" },
};

export function SeloStatus({ status }: { status?: string | null }) {
  if (!status) return null;
  const s = STATUS[status] ?? { texto: status, tom: "neutro" };
  return <span className={`rvp-selo rvp-selo--${s.tom}`}>{s.texto}</span>;
}

interface Props {
  url: string | null;
  pdf?: boolean;
  carregando?: boolean;
}

// Imagem ou PDF da prescrição, com atalho para abrir em tamanho real
export default function VisualizadorPrescricao({ url, pdf = false, carregando = false }: Props) {
  return (
    <section className="rvp-card rvp-arquivo" aria-labelledby="rvp-arquivo-titulo">
      <header className="rvp-card-topo">
        <h2 id="rvp-arquivo-titulo" className="rvp-card-titulo">
          <FileText aria-hidden="true" />
          Prescrição enviada
        </h2>
        {url && (
          <a className="rvp-link" href={url} target="_blank" rel="noopener noreferrer">
            Abrir em nova aba
            <ExternalLink aria-hidden="true" />
          </a>
        )}
      </header>

      <div className="rvp-arquivo-area">
        {carregando ? (
          <p className="rvp-arquivo-vazio">Carregando prescrição...</p>
        ) : url ? (
          pdf ? (
            <iframe src={url} title="Prescrição enviada pelo paciente (PDF)" />
          ) : (
            <img src={url} alt="Prescrição enviada pelo paciente" />
          )
        ) : (
          <p className="rvp-arquivo-vazio">Prescrição não encontrada.</p>
        )}
      </div>
    </section>
  );
}

interface ListaItensProps {
  itens?: ItemPrescricao[];
  // prescrições antigas: um insumo só
  ins_nome?: string | null;
  ins_marca?: string | null;
  sol_insumo_quant?: number | null;
  sol_periodicidade_dias?: number | null;
}

// Insumos da prescrição (quantidade por retirada) e a frequência, se for de uso contínuo
export function ListaItensPrescricao({ itens, ins_nome, ins_marca, sol_insumo_quant, sol_periodicidade_dias }: ListaItensProps) {
  const lista: Omit<ItemPrescricao, "ins_id">[] = itens?.length
    ? itens
    : ins_nome
      ? [{ ins_nome, ins_marca, quantidade: Number(sol_insumo_quant ?? 0) }]
      : [];

  return (
    <>
      {lista.length ? (
        <ul className="rvp-lista-itens">
          {lista.map((i, indice) => (
            <li key={indice}>
              <strong>{i.quantidade}x</strong>
              <span>
                {i.ins_nome}
                {i.ins_marca ? <small> · {i.ins_marca}</small> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="rvp-vazio">Não informado</span>
      )}
      {sol_periodicidade_dias ? (
        <p className="rvp-recorrencia">
          <Repeat aria-hidden="true" />
          Uso contínuo: uma retirada a cada {sol_periodicidade_dias} dias
        </p>
      ) : null}
    </>
  );
}
