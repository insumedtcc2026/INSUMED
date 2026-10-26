import type { ReactNode } from "react";
import { iniciais } from "../../utils/nome";

/**
 * Peças da página "Meu perfil", iguais para paciente, administrador e
 * autorizador: o cabeçalho com as iniciais, os cartões e as linhas de dado.
 */

export const CAMPO_PERFIL =
  "min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none focus:border-blue-600";

export const BOTAO_PERFIL_SECUNDARIO =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 [font-family:var(--fonte-botao)]";

export function CabecalhoPerfil({ nome, papel, cpf }: { nome: string; papel: string; cpf: string }) {
  return (
    <section className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:gap-5 sm:p-6">
      <span
        className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl"
        style={{ background: "var(--gradiente-primario)" }}
        aria-hidden="true"
      >
        {iniciais(nome) || "?"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xl font-semibold text-gray-900 sm:text-2xl">{nome}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{papel}</span>
          <span>CPF {cpf}</span>
        </p>
      </div>
    </section>
  );
}

export function CartaoPerfil({ titulo, descricao, acao, children }: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children?: ReactNode;
}) {
  const id = `perfil-${titulo.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6" aria-labelledby={id}>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${children ? "mb-4" : ""}`}>
        <div>
          <h2 id={id} className="text-lg font-semibold text-gray-900">{titulo}</h2>
          {descricao && <p className="mt-0.5 text-sm text-gray-500">{descricao}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function LinhaPerfil({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{rotulo}</dt>
      <dd className="mt-0.5 break-words text-gray-900">{valor || "—"}</dd>
    </div>
  );
}
