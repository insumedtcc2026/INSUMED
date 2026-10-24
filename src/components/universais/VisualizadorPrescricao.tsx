import { ExternalLink, FileText } from "lucide-react";

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
