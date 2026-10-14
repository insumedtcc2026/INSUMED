import { useEffect, useMemo, useRef, useState } from "react";
import { buscarDetalhesPrescricao, type DetalhesPrescricao } from "../../../services/PrescricaoService";
import { base64ParaBlobUrl, gerarNomeArquivo } from "./arquivoPrescricao";
import { mensagemErroApi } from "../../../utils/validacoes";
import { formatarData } from "../../../utils/status";

interface Props {
  sol_id: number;
  onClose: () => void;
}

/** Mostra o arquivo da prescrição enviada (imagem ou PDF) e a observação. */
export default function ModalPrescricao({ sol_id, onClose }: Props) {
  const [detalhes, setDetalhes] = useState<DetalhesPrescricao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ativo = true;
    buscarDetalhesPrescricao(sol_id)
      .then((d) => ativo && setDetalhes(d))
      .catch((e) => ativo && setErro(mensagemErroApi(e, "Não foi possível carregar a prescrição.")));
    return () => {
      ativo = false;
    };
  }, [sol_id]);

  useEffect(() => {
    fechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  // Blob URL para o arquivo (PDF abre em iframe/nova aba; imagem no <img>)
  const arquivoUrl = useMemo(() => {
    if (!detalhes?.sol_prescricao_base64) return null;
    return base64ParaBlobUrl(detalhes.sol_prescricao_base64, detalhes.sol_prescricao_mimetype || "image/png");
  }, [detalhes]);

  // libera a memória do Blob ao fechar
  useEffect(() => () => {
    if (arquivoUrl) URL.revokeObjectURL(arquivoUrl);
  }, [arquivoUrl]);

  const ehPdf = detalhes?.sol_prescricao_mimetype === "application/pdf";

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-prescricao"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="titulo-prescricao" className="text-lg font-semibold text-gray-900">Prescrição nº {sol_id}</h2>
          <button ref={fechar} type="button" onClick={onClose} aria-label="Fechar"
            className="min-h-10 min-w-10 rounded-full text-xl text-gray-500 hover:bg-gray-100">
            ×
          </button>
        </div>

        {erro && <p className="text-rose-600" role="alert">{erro}</p>}
        {!erro && !detalhes && <p className="text-gray-500" role="status">Carregando…</p>}

        {detalhes && (
          <>
            <p className="text-sm text-gray-600">Enviada em {formatarData(detalhes.sol_data_solicitacao)}</p>
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Observação:</span> {detalhes.sol_observacao || "Nenhuma observação."}
            </p>

            <div className="mt-4">
              {!arquivoUrl ? (
                <p className="text-gray-500">Nenhum arquivo anexado.</p>
              ) : ehPdf ? (
                <iframe src={arquivoUrl} title="Prescrição em PDF" className="h-[60dvh] w-full rounded-xl border" />
              ) : (
                <img src={arquivoUrl} alt={`Prescrição nº ${sol_id} enviada`} className="mx-auto max-h-[60dvh] rounded-xl border object-contain" />
              )}
            </div>

            {arquivoUrl && (
              <a
                href={arquivoUrl}
                download={gerarNomeArquivo(detalhes.sol_data_solicitacao, detalhes.sol_id, detalhes.sol_prescricao_mimetype)}
                className="mt-4 inline-flex min-h-11 items-center rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Baixar arquivo
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
