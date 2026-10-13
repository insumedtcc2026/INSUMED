interface MotivoCancelamentoProps {
  motivo?: string | null;
  data?: string | null;
}

/**
 * Motivo registrado pelo administrador ao cancelar um agendamento.
 * Usado no card do ADM e no card do paciente.
 */
export default function MotivoCancelamento({ motivo, data }: MotivoCancelamentoProps) {
  const quando = data ? new Date(data) : null;
  const dataFormatada =
    quando && !Number.isNaN(quando.getTime()) ? quando.toLocaleDateString("pt-BR") : null;

  return (
    <div className="w-full basis-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm">
      <p className="font-medium text-rose-700">
        Motivo do cancelamento
        {dataFormatada && <span className="font-normal text-rose-600"> · em {dataFormatada}</span>}
      </p>
      <p className="mt-1 whitespace-pre-line break-words text-rose-900">
        {motivo?.trim() || "Motivo não registrado (cancelamento anterior a esta funcionalidade)."}
      </p>
    </div>
  );
}
