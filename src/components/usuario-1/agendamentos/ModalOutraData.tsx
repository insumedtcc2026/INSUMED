import { useEffect, useMemo, useRef, useState } from "react";
import { buscarOpcoesOutraData, pedirOutraData, type OpcaoData } from "../../../services/AgendaService";
import { dataComTurno, diaCurto, ROTULO_TURNO, textoVagas } from "../../../utils/agenda";
import { mensagemErroApi } from "../../../utils/validacoes";

interface Props {
  sol_id: number;
  protocolo: string;
  dataAtual: string | null;
  turnoAtual?: string | null;
  onClose: () => void;
  onEnviado: () => void;
}

const MOTIVO_MAX = 300;

/**
 * O paciente escolhe outro dia e turno, entre os que têm vaga na unidade
 * (até o vencimento da prescrição). A unidade aceita ou recusa; até lá a
 * data atual continua valendo.
 */
export default function ModalOutraData({ sol_id, protocolo, dataAtual, turnoAtual, onClose, onEnviado }: Props) {
  const [opcoes, setOpcoes] = useState<OpcaoData[] | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<OpcaoData | null>(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ativo = true;
    buscarOpcoesOutraData(sol_id)
      .then((lista) => ativo && setOpcoes(lista))
      .catch((e) => ativo && setErroCarga(mensagemErroApi(e, "Não foi possível buscar as datas disponíveis.")));
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

  // agrupa por dia: "qui, 30/10" -> [manhã, tarde]
  const porDia = useMemo(() => {
    const mapa = new Map<string, OpcaoData[]>();
    for (const o of opcoes ?? []) mapa.set(o.data, [...(mapa.get(o.data) ?? []), o]);
    return [...mapa];
  }, [opcoes]);

  async function enviar() {
    if (!escolha) return setErro("Escolha o dia e o turno.");
    setErro(null);
    setEnviando(true);
    try {
      await pedirOutraData(sol_id, escolha.data, escolha.turno, motivo.trim());
      onEnviado();
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível enviar o pedido."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-outra-data"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl sm:p-6"
      >
        <h2 id="titulo-outra-data" className="text-xl font-bold text-gray-900">Pedir outra data</h2>
        <p className="mt-1 text-sm text-gray-600">
          Protocolo {protocolo} · hoje marcada para <strong>{dataComTurno(dataAtual, turnoAtual)}</strong>. A unidade
          vai responder pelo sino. Até lá, a data atual continua valendo.
        </p>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-gray-800">Dias e turnos com vaga</legend>
          {!opcoes && !erroCarga && <p className="text-sm text-gray-500" role="status">Buscando datas…</p>}
          {erroCarga && <p className="text-sm text-rose-600" role="alert">{erroCarga}</p>}
          {opcoes && opcoes.length === 0 && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Não há outras vagas antes do vencimento da prescrição. Fale com a unidade.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {porDia.map(([data, turnos]) => (
              <div key={data} className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                <span className="text-sm font-medium capitalize text-gray-700 sm:w-24 sm:shrink-0">{diaCurto(data)}</span>
                <div className="flex flex-wrap gap-2">
                {turnos.map((o) => {
                  const ativa = escolha?.data === o.data && escolha.turno === o.turno;
                  return (
                    <button
                      key={o.turno}
                      type="button"
                      aria-pressed={ativa}
                      onClick={() => setEscolha(o)}
                      className={`min-h-11 rounded-full border px-4 text-sm transition ${
                        ativa ? "border-blue-700 bg-blue-700 text-white" : "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
                      }`}
                    >
                      {ROTULO_TURNO[o.turno]} ({o.abre}–{o.fecha}) · {textoVagas(o.livres)}
                    </button>
                  );
                })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <label htmlFor="motivo-outra-data" className="mt-5 block text-sm font-semibold text-gray-800">
          Motivo (opcional)
        </label>
        <textarea
          id="motivo-outra-data"
          value={motivo}
          maxLength={MOTIVO_MAX}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex.: tenho consulta no mesmo horário"
          className="mt-1 min-h-20 w-full rounded-xl border border-gray-200 px-3 py-2 text-base focus:border-blue-400 focus:outline-none sm:text-sm"
        />

        {erro && <p className="mt-3 text-sm text-rose-600" role="alert">{erro}</p>}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={fechar}
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !escolha}
            className="min-h-11 rounded-full bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {enviando ? "Enviando…" : "Enviar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
