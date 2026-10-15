import { useEffect, useRef, useState } from "react";
import LinhaDoTempo from "./LinhaDoTempo";
import { buscarHistorico, type EventoHistorico, type PerfilLogado } from "../../services/HistoricoService";
import { mensagemErroApi } from "../../utils/validacoes";

interface Props {
  sol_id: number;
  perfil: PerfilLogado;
  titulo?: string;
  onClose: () => void;
}

/** Diálogo com o histórico (eventos, datas e motivos) de uma solicitação/agendamento. */
export default function ModalHistorico({ sol_id, perfil, titulo = "Histórico", onClose }: Props) {
  const [eventos, setEventos] = useState<EventoHistorico[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ativo = true;
    buscarHistorico(sol_id, perfil)
      .then((d) => ativo && setEventos(d))
      .catch((e) => ativo && setErro(mensagemErroApi(e, "Não foi possível carregar o histórico.")));
    return () => {
      ativo = false;
    };
  }, [sol_id, perfil]);

  useEffect(() => {
    fechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-historico"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="titulo-historico" className="text-lg font-semibold text-gray-900">{titulo}</h2>
          <button
            ref={fechar}
            type="button"
            onClick={onClose}
            aria-label="Fechar histórico"
            className="min-h-10 min-w-10 rounded-full text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {erro && <p className="text-rose-600" role="alert">{erro}</p>}
        {!erro && !eventos && <p className="text-gray-500" role="status">Carregando…</p>}
        {eventos && <LinhaDoTempo eventos={eventos} agruparPorDia />}
      </div>
    </div>
  );
}
