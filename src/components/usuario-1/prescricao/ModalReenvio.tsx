import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Swal from "sweetalert2";
import { corrigirPrescricao } from "../../../services/PrescricaoService";
import { mensagemErroApi } from "../../../utils/validacoes";
import { arquivoParaBase64, erroArquivoPrescricao } from "./arquivoPrescricao";

const OBSERVACAO_MAX = 1000;

interface Props {
  sol_id: number;
  // motivo do pedido de reenvio, já em texto ("foto sem qualidade"...)
  motivo: string;
  onClose: () => void;
  onReenviada: () => void;
}

/**
 * Reenvio da prescrição DENTRO da mesma solicitação, depois que a unidade
 * pediu. O número da prescrição e o histórico continuam os mesmos; a
 * versão anterior fica guardada e a prescrição volta para análise.
 */
export default function ModalReenvio({ sol_id, motivo, onClose, onReenviada }: Props) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && !enviando && onClose();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onClose, enviando]);

  function escolher(e: ChangeEvent<HTMLInputElement>) {
    const escolhido = e.target.files?.[0];
    if (!escolhido) return;
    const problema = erroArquivoPrescricao(escolhido);
    if (problema) {
      setErro(problema);
      setArquivo(null);
      e.target.value = "";
      return;
    }
    setErro(null);
    setArquivo(escolhido);
  }

  async function enviar() {
    if (!arquivo) {
      setErro("Escolha o arquivo da prescrição corrigida.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const base64 = await arquivoParaBase64(arquivo);
      const r = await corrigirPrescricao(sol_id, base64, arquivo.type, resposta.trim());
      await Swal.fire({
        icon: "success",
        title: "Prescrição reenviada",
        text: `${r.message} Ela continua com o nº ${r.sol_id}.`,
        confirmButtonColor: "#3085d6",
      });
      onReenviada();
    } catch (e) {
      // os dados escolhidos continuam na tela para tentar de novo
      setErro(mensagemErroApi(e, "Não foi possível reenviar. Tente novamente."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4" onClick={() => !enviando && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-reenvio"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id="titulo-reenvio" className="text-lg font-semibold text-gray-900">
            Reenviar prescrição nº {sol_id}
          </h2>
          <button
            ref={fechar}
            type="button"
            onClick={onClose}
            disabled={enviando}
            aria-label="Fechar"
            className="min-h-10 min-w-10 rounded-full text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">A unidade pediu:</span> {motivo}. Envie a prescrição corrigida — ela
          continua com o mesmo número e volta para análise.
        </p>

        <label className="mt-4 block text-sm font-semibold text-gray-800" htmlFor={`arquivo-reenvio-${sol_id}`}>
          Arquivo da prescrição (imagem ou PDF, até 5 MB)
        </label>
        <input
          id={`arquivo-reenvio-${sol_id}`}
          type="file"
          accept="image/*,.pdf"
          onChange={escolher}
          disabled={enviando}
          className="mt-1 block w-full rounded-xl border border-gray-300 p-2 text-sm file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:font-semibold file:text-white"
        />
        {arquivo && <p className="mt-1 break-words text-xs text-gray-500">Selecionado: {arquivo.name}</p>}

        <label className="mt-4 block text-sm font-semibold text-gray-800" htmlFor={`resposta-reenvio-${sol_id}`}>
          Mensagem para a unidade <span className="font-normal text-gray-500">(opcional)</span>
        </label>
        <textarea
          id={`resposta-reenvio-${sol_id}`}
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          maxLength={OBSERVACAO_MAX}
          rows={3}
          disabled={enviando}
          placeholder="Ex.: enviei uma foto nova, mais nítida"
          className="mt-1 block w-full rounded-xl border border-gray-300 p-3 text-base sm:text-sm"
        />

        {erro && <p className="mt-3 whitespace-pre-line text-sm text-rose-600" role="alert">{erro}</p>}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>
          <button type="button" onClick={enviar} disabled={enviando} className="botao-novo-agendamento disabled:opacity-60">
            {enviando ? "Enviando…" : "Reenviar prescrição"}
          </button>
        </div>
      </div>
    </div>
  );
}
