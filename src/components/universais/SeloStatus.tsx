import { CLASSE_SELO, CLASSES_TOM, infoStatus } from "../../utils/status";

/** Pílula de status com nome e cor padronizados (ver utils/status.ts). */
export default function SeloStatus({ status }: { status: string | null | undefined }) {
  const { rotulo, tom } = infoStatus(status);
  return (
    <span className={`${CLASSE_SELO} ${CLASSES_TOM[tom]}`}>
      {rotulo}
    </span>
  );
}
