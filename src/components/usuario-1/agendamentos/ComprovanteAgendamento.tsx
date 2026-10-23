import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Agendamento } from "../../../types/agendamento";
import { somenteDigitos } from "../../../utils/validacoes";
import { formatarData } from "../../../utils/status";
import "../../../css/universais/Comprovante.css";

interface Props {
  agendamento: Agendamento;
  nomePaciente: string;
  cpfPaciente: string;
  onClose: () => void;
}

// 529.982.247-25 -> 529.***.***-25 (o comprovante pode ficar à vista no balcão)
function cpfParcial(cpf: string) {
  const d = somenteDigitos(cpf);
  return d.length === 11 ? `${d.slice(0, 3)}.***.***-${d.slice(9)}` : "—";
}

/**
 * Comprovante do agendamento, para mostrar no balcão ou salvar.
 * O QR Code guarda "INSUMED:<protocolo>:<código>": o protocolo é
 * sequencial, o código é aleatório e é ele que o leitor do admin
 * (/leitor-qrcode) confere no backend. Sem o código (backend antigo),
 * o QR volta a ter só o protocolo, que o leitor também aceita.
 */
export default function ComprovanteAgendamento({ agendamento, nomePaciente, cpfPaciente, onClose }: Props) {
  const { sol_protocolo, sol_id, sol_data_de_coleta, posto, insumos, sol_recado, sol_codigo_qr } = agendamento;
  const protocolo = sol_protocolo ?? `AG${String(sol_id).padStart(6, "0")}`;
  const conteudoQR = sol_codigo_qr ? `INSUMED:${protocolo}:${sol_codigo_qr}` : protocolo;
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  const mapa = posto?.pos_endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${posto.pos_nome}, ${posto.pos_endereco}`)}`
    : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4 comprovante-fundo" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-comprovante"
        onClick={(e) => e.stopPropagation()}
        className="comprovante max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
      >
        <div className="comprovante-topo rounded-t-3xl px-6 pb-5 pt-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Comprovante de agendamento</p>
          <h2 id="titulo-comprovante" className="mt-1 text-3xl font-black tracking-wide">{protocolo}</h2>
          <p className="mt-1 text-sm opacity-90">Apresente no balcão da unidade</p>
        </div>

        <div className="flex justify-center px-6 pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-3">
            <QRCodeSVG value={conteudoQR} size={168} level="M" title={`QR Code do protocolo ${protocolo}`} />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-6 py-5 text-sm">
          <div className="col-span-2">
            <dt className="text-xs font-semibold uppercase text-gray-500">Paciente</dt>
            <dd className="break-words font-medium text-gray-900">{nomePaciente}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">CPF</dt>
            <dd className="text-gray-900">{cpfParcial(cpfPaciente)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Data da coleta</dt>
            <dd className="font-medium text-gray-900">{formatarData(sol_data_de_coleta)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold uppercase text-gray-500">Local</dt>
            <dd className="text-gray-900">
              {posto?.pos_nome ?? "—"}
              {posto?.pos_endereco && <span className="block text-gray-600">{posto.pos_endereco}</span>}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold uppercase text-gray-500">Insumos</dt>
            <dd>
              <ul className="mt-1 space-y-0.5 text-gray-900">
                {insumos.map((i) => (
                  <li key={i.ins_id ?? i.ins_nome}>{i.quantidade}x {i.ins_nome}</li>
                ))}
              </ul>
            </dd>
          </div>
          {sol_recado && (
            <div className="col-span-2 rounded-xl bg-blue-50 px-3 py-2 text-blue-900">
              <dt className="text-xs font-semibold uppercase">Recado da unidade</dt>
              <dd className="mt-0.5">{sol_recado}</dd>
            </div>
          )}
        </dl>

        <div className="comprovante-acoes flex flex-col gap-2 border-t border-gray-100 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          {mapa && (
            <a href={mapa} target="_blank" rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Ver no mapa
            </a>
          )}
          <button type="button" onClick={() => window.print()}
            className="min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Imprimir / salvar PDF
          </button>
          <button ref={fechar} type="button" onClick={onClose} className="botao-novo-agendamento">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
