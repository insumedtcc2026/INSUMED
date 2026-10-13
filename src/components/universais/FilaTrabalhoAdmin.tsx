import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, ClipboardList, PackageX, Stethoscope } from "lucide-react";
import { buscarPainelAdmin, type PainelAdmin } from "../../services/PainelService";

interface Cartao {
  chave: keyof Pick<PainelAdmin, "pendentes" | "autorizadasSemAgendamento" | "coletasHoje" | "estoqueBaixo">;
  titulo: (n: number, painel: PainelAdmin) => string;
  vazio: string;
  link: string;
  Icone: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  cor: string;
}

const CARTOES: Cartao[] = [
  {
    chave: "pendentes",
    titulo: (n) => (n === 1 ? "prescrição para revisar" : "prescrições para revisar"),
    vazio: "Nenhuma prescrição esperando revisão",
    link: "/VerSolicitaçoes?status=Pendente",
    Icone: ClipboardList,
    cor: "text-amber-600 bg-amber-50",
  },
  {
    chave: "autorizadasSemAgendamento",
    titulo: (n) => (n === 1 ? "autorizada para agendar" : "autorizadas para agendar"),
    vazio: "Nenhuma prescrição autorizada esperando agendamento",
    link: "/VerSolicitaçoes?status=ParaAgendar",
    Icone: Stethoscope,
    cor: "text-blue-700 bg-blue-50",
  },
  {
    chave: "coletasHoje",
    titulo: (n) => (n === 1 ? "coleta marcada para hoje" : "coletas marcadas para hoje"),
    vazio: "Nenhuma coleta marcada para hoje",
    link: "/coletas-hoje",
    Icone: CalendarCheck,
    cor: "text-green-700 bg-green-50",
  },
  {
    chave: "estoqueBaixo",
    titulo: (n, p) => `${n === 1 ? "insumo" : "insumos"} com estoque baixo (até ${p.limiteEstoqueBaixo})`,
    vazio: "Nenhum insumo com estoque baixo",
    link: "/insumos",
    Icone: PackageX,
    cor: "text-rose-700 bg-rose-50",
  },
];

/** Home do admin: o que precisa de atenção agora, com atalho para cada fila. */
export default function FilaTrabalhoAdmin() {
  const [painel, setPainel] = useState<PainelAdmin | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    buscarPainelAdmin().then(setPainel).catch(() => setErro(true));
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6" aria-labelledby="fila-titulo">
      <h2 id="fila-titulo" className="text-xl font-semibold text-gray-800 sm:text-2xl">
        O que precisa da sua atenção
      </h2>

      {erro && (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          Não foi possível carregar os números agora. Os atalhos abaixo continuam funcionando.
        </p>
      )}

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARTOES.map(({ chave, titulo, vazio, link, Icone, cor }) => {
          const n = painel?.[chave];
          return (
            <li key={chave}>
              <Link
                to={link}
                className="flex h-full items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cor}`}>
                  <Icone className="h-6 w-6" aria-hidden={true} />
                </span>
                <span className="min-w-0">
                  {painel && n === 0 ? (
                    <span className="block text-sm text-gray-500">{vazio}</span>
                  ) : (
                    <>
                      <span className="block text-3xl font-bold leading-none text-gray-900">
                        {painel ? n : "…"}
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">
                        {painel ? titulo(n ?? 0, painel) : "carregando"}
                      </span>
                    </>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
