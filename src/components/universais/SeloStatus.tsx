import { CLASSES_TOM, infoStatus } from "../../utils/status";

/** Pílula de status com nome e cor padronizados (ver utils/status.ts). */
export default function SeloStatus({ status }: { status: string | null | undefined }) {
  const { rotulo, tom } = infoStatus(status);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${CLASSES_TOM[tom]}`}>
      {rotulo}
    </span>
  );
}
