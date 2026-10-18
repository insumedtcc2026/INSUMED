import { CalendarDays, Check, CircleAlert, Info, X } from "lucide-react";
import type { TomNotificacao } from "../../types/notificacao";

const ICONES = {
  agenda: CalendarDays,
  sucesso: Check,
  alerta: CircleAlert,
  erro: X,
  info: Info,
} satisfies Record<TomNotificacao, unknown>;

/** Quadrado colorido com o ícone da notificação (design do sino). */
export default function IconeNotificacao({ tom }: { tom: TomNotificacao }) {
  const conhecido = tom in ICONES ? tom : "info";
  const Icone = ICONES[conhecido];
  return (
    <span className={`notif-icone notif-icone--${conhecido}`} aria-hidden="true">
      <Icone strokeWidth={conhecido === "sucesso" || conhecido === "erro" ? 3 : 2.25} />
    </span>
  );
}
