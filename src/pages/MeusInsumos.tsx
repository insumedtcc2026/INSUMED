import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Package, Repeat, UsersRound } from "lucide-react";
import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import ContatoUnidade from "../components/universais/ContatoUnidade";
import { useValidarToken } from "../hook/Validartoken";
import {
  listarMeusAutorizados,
  listarMeusInsumos,
  type PessoaAutorizada,
  type PrescricaoEmUso,
} from "../services/AgendaService";
import { dataComTurno } from "../utils/agenda";
import { formatarData } from "../utils/status";
import { mensagemErroApi } from "../utils/validacoes";

// 390.533.447-05 -> 390.***.***-05
const cpfParcial = (cpf: string) => (cpf.length >= 14 ? `${cpf.slice(0, 3)}.***.***-${cpf.slice(12)}` : cpf);

/**
 * Meus insumos: o que o paciente recebe pelas prescrições autorizadas e
 * ainda válidas, com a situação de cada insumo na unidade ("Indisponível"
 * quando falta no estoque), a próxima retirada e quem pode retirar por ele.
 */
export default function MeusInsumos() {
  const { verificando } = useValidarToken("PACIENTE");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lista, setLista] = useState<PrescricaoEmUso[] | null>(null);
  const [autorizados, setAutorizados] = useState<PessoaAutorizada[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setErro(null);
    Promise.all([listarMeusInsumos(), listarMeusAutorizados().catch(() => [])])
      .then(([insumos, pessoas]) => {
        setLista(insumos);
        setAutorizados(pessoas);
      })
      .catch((e) => setErro(mensagemErroApi(e, "Não foi possível carregar os seus insumos.")));
  }, []);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/home" />
      </div>

      <main className="pagina-conteudo mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-bold text-blue-700">Meus insumos</h1>
        <p className="mb-5 mt-1 text-sm text-gray-600">O que você recebe pelas prescrições autorizadas e como está cada insumo na unidade.</p>

        {erro && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button type="button" onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Tentar novamente
            </button>
          </div>
        )}
        {!erro && !lista && <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>}

        {lista && lista.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <Package aria-hidden="true" className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-gray-600">Você ainda não tem prescrições autorizadas em uso.</p>
            <Link to="/prescricoes" className="mt-3 inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
              Acompanhar minhas prescrições →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {lista?.map((p) => {
            const faltando = p.itens.filter((i) => i.situacao === "indisponivel");
            return (
              <article key={p.sol_id} className="rounded-3xl bg-white p-5 shadow-sm" aria-labelledby={`presc-${p.sol_id}`}>
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 id={`presc-${p.sol_id}`} className="font-semibold text-gray-900">
                      <Link to={`/pontos-coleta/${p.posto.pos_id}`} className="hover:underline">{p.posto.pos_nome}</Link>
                    </h2>
                    <p className="text-sm text-gray-500">
                      Prescrição nº {p.sol_id}
                      {p.sol_data_vencimento ? ` · válida até ${formatarData(p.sol_data_vencimento)}` : ""}
                    </p>
                  </div>
                  {p.sol_periodicidade_dias && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                      <Repeat aria-hidden="true" className="h-3.5 w-3.5" /> a cada {p.sol_periodicidade_dias} dias
                    </span>
                  )}
                </header>

                <ul className="mt-4 divide-y divide-gray-100">
                  {p.itens.map((i) => (
                    <li key={i.ins_id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span className="text-gray-800">
                        <strong>{i.quantidade}x</strong> {i.ins_nome}
                        {i.ins_marca ? <span className="text-sm text-gray-500"> · {i.ins_marca}</span> : null}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        i.situacao === "disponivel" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                      }`}>
                        {i.situacao === "disponivel" ? "Disponível" : "Indisponível"}
                      </span>
                    </li>
                  ))}
                </ul>

                {faltando.length > 0 && (
                  <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
                    A unidade está sem estoque suficiente de {faltando.map((i) => i.ins_nome).join(", ")} agora.
                    {p.agendamento ? " Se faltar na data, a unidade avisa pelo sino." : " Fale com a unidade antes de ir."}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  {p.agendamento ? (
                    <Link to={`/agendamentos?sol_id=${p.agendamento.sol_id}`}
                      className="inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 hover:underline">
                      <CalendarCheck aria-hidden="true" className="h-4 w-4" />
                      Coleta marcada: {dataComTurno(p.agendamento.data, p.agendamento.turno)}
                    </Link>
                  ) : p.proxima_retirada ? (
                    <span className="inline-flex min-h-11 items-center gap-2 text-gray-700">
                      <CalendarCheck aria-hidden="true" className="h-4 w-4 text-blue-700" />
                      Próxima retirada prevista: {formatarData(p.proxima_retirada)}
                    </span>
                  ) : (
                    <span className="text-gray-600">A unidade vai marcar a data da retirada.</span>
                  )}
                  {faltando.length > 0 && (
                    <ContatoUnidade
                      pos_nome={p.posto.pos_nome}
                      pos_whatsapp={p.posto.pos_whatsapp}
                      mensagem={`Olá! Gostaria de saber quando ${faltando.map((i) => i.ins_nome).join(", ")} vai chegar na ${p.posto.pos_nome}.`}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {lista && (
          <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm" aria-labelledby="titulo-autorizados">
            <h2 id="titulo-autorizados" className="flex items-center gap-2 font-semibold text-gray-900">
              <UsersRound aria-hidden="true" className="h-5 w-5 text-blue-700" /> Quem pode retirar por você
            </h2>
            {autorizados.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">
                Só você. Se um familiar ou cuidador for buscar os insumos, peça à unidade para cadastrar a pessoa na sua ficha.
              </p>
            ) : (
              <>
                <ul className="mt-2 divide-y divide-gray-100">
                  {autorizados.map((a) => (
                    <li key={a.pau_id} className="py-2 text-sm">
                      <span className="font-medium text-gray-900">{a.pau_nome}</span>
                      {a.pau_parentesco && <span className="text-gray-500"> · {a.pau_parentesco}</span>}
                      <span className="block text-gray-500">CPF {cpfParcial(a.pau_cpf)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-500">A pessoa precisa levar um documento com foto. Para mudar a lista, fale com a unidade.</p>
              </>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
