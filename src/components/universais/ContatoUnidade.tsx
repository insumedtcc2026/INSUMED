import { linkWhatsappUnidade, propsLinkExterno } from "./contatos";

interface Props {
  pos_nome: string | null | undefined;
  pos_whatsapp: string | null | undefined;
  mensagem: string;
  // texto do botão (padrão: "Falar com a unidade")
  texto?: string;
}

/**
 * Contato com a unidade responsável pela solicitação (WhatsApp do posto).
 * Se a unidade ainda não cadastrou o número, orienta o paciente a procurar
 * a própria unidade, sem direcioná-lo para outro contato.
 */
export default function ContatoUnidade({ pos_nome, pos_whatsapp, mensagem, texto = "Falar com a unidade" }: Props) {
  const link = linkWhatsappUnidade(pos_whatsapp, mensagem);
  const unidade = pos_nome || "unidade";

  if (!link) {
    return (
      <p className="text-sm text-gray-600">
        Para tirar dúvidas, procure a {unidade} pessoalmente ou pelo telefone da unidade.
      </p>
    );
  }

  return (
    <a
      href={link}
      {...propsLinkExterno}
      aria-label={`${texto}: ${unidade} pelo WhatsApp (abre em nova aba)`}
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-green-600 px-5 font-semibold text-green-700 hover:bg-green-50"
    >
      {texto}
    </a>
  );
}
