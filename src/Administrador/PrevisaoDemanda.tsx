import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, TrendingUp } from "lucide-react";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { useValidarToken } from "../hook/Validartoken";
import { buscarPrevisao, type Previsao, type PrevisaoInsumo } from "../services/AgendaService";
import { formatarData } from "../utils/status";
import { mensagemErroApi } from "../utils/validacoes";

const HORIZONTES = [30, 60, 90];
// quantos insumos o gráfico mostra (os de maior falta/necessidade)
const MAX_GRAFICO = 8;
// cores das duas séries do gráfico (paleta categórica validada: azul e laranja)
const COR_ESTOQUE = "#2a78d6";
const COR_NECESSIDADE = "#eb6834";

const numero = (n: number) => n.toLocaleString("pt-BR");

// Detalhe de onde vem a necessidade ("7 agendadas · 6 de uso contínuo ...")
function origem(i: PrevisaoInsumo) {
  return [
    i.agendado && `${numero(i.agendado)} em coletas agendadas`,
    i.recorrente && `${numero(i.recorrente)} de uso contínuo`,
    i.a_agendar && `${numero(i.a_agendar)} de prescrições a agendar`,
    i.avulso && `${numero(i.avulso)} pela média das avulsas`,
  ].filter(Boolean).join(" · ") || "Sem saída prevista";
}

function baixarCSV(previsao: Previsao, linhas: PrevisaoInsumo[]) {
  const cab = ["Unidade", "Insumo", "Marca", "Estoque", "Coletas agendadas", "Uso contínuo", "A agendar",
    "Média avulsas", "Necessidade", "Falta", "Sobra", "Acaba em"];
  const esc = (v: string | number | null) => {
    const t = String(v ?? "");
    return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const corpo = linhas.map((i) => [
    i.pos_nome, i.ins_nome, i.ins_marca, i.estoque, i.agendado, i.recorrente, i.a_agendar, i.avulso,
    i.necessidade, i.falta, Math.max(0, i.saldo), i.acaba_em ? formatarData(i.acaba_em) : "",
  ].map(esc).join(";"));
  // BOM + ";" para o Excel em português abrir com acentos e colunas certas
  const blob = new Blob(["﻿" + [cab.join(";"), ...corpo].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `previsao-demanda-${previsao.dias}-dias-${previsao.de}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Previsão de demanda: quanto de cada insumo a unidade vai precisar nos
 * próximos 30, 60 ou 90 dias, comparado com o estoque. O admin universal
 * vê todas as unidades lado a lado.
 */
export default function PrevisaoDemanda() {
  const { verificando } = useValidarToken("ADMIN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dias, setDias] = useState(30);
  const [previsao, setPrevisao] = useState<Previsao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [unidade, setUnidade] = useState<number | "todas">("todas");
  const [destaque, setDestaque] = useState<number | null>(null);

  const carregar = useCallback(() => {
    setErro(null);
    buscarPrevisao(dias)
      .then(setPrevisao)
      .catch((e) => setErro(mensagemErroApi(e, "Não foi possível calcular a previsão.")));
  }, [dias]);

  useEffect(() => {
    if (verificando) return;
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [verificando, carregar]);

  const unidades = useMemo(() => {
    const mapa = new Map<number, string>();
    previsao?.insumos.forEach((i) => mapa.set(i.pos_id, i.pos_nome ?? "Unidade"));
    return [...mapa].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [previsao]);
  const variasUnidades = unidades.length > 1;

  const linhas = useMemo(
    () => (previsao?.insumos ?? []).filter((i) => unidade === "todas" || i.pos_id === unidade),
    [previsao, unidade],
  );
  const emFalta = linhas.filter((i) => i.falta > 0);
  const primeiroAcabar = linhas.filter((i) => i.acaba_em).sort((a, b) => a.acaba_em!.localeCompare(b.acaba_em!))[0];
  const grafico = linhas.filter((i) => i.necessidade > 0 || i.estoque > 0).slice(0, MAX_GRAFICO);
  const escala = Math.max(1, ...grafico.flatMap((i) => [i.estoque, i.necessidade]));

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const chip = (ativo: boolean) =>
    `min-h-11 rounded-full px-4 text-sm font-semibold ${
      ativo ? "bg-blue-700 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
    }`;
  const nomeInsumo = (i: PrevisaoInsumo) => (variasUnidades && unidade === "todas" ? `${i.ins_nome} · ${i.pos_nome}` : i.ins_nome);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold text-gray-800">Previsão de demanda</h1>
          <p className="text-sm text-gray-500">
            Quanto de cada insumo vai sair nos próximos dias, comparado com o estoque. Ajuda a pedir a compra antes de faltar.
          </p>
        </header>

        <div className="mb-5 flex flex-wrap items-end gap-2">
          <div className="flex gap-2" role="group" aria-label="Período da previsão">
            {HORIZONTES.map((h) => (
              <button key={h} type="button" className={chip(dias === h)} aria-pressed={dias === h} onClick={() => setDias(h)}>
                {h} dias
              </button>
            ))}
          </div>
          {variasUnidades && (
            <label className="!flex-row items-center gap-2 text-sm font-medium text-gray-600">
              Unidade
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value === "todas" ? "todas" : Number(e.target.value))}
                className="!w-auto min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-base sm:text-sm"
              >
                <option value="todas">Todas, lado a lado</option>
                {unidades.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
              </select>
            </label>
          )}
          <button
            type="button"
            disabled={!previsao || !linhas.length}
            onClick={() => previsao && baixarCSV(previsao, linhas)}
            className="flex min-h-11 items-center gap-2 rounded-full border border-blue-700 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 sm:ml-auto"
          >
            <Download aria-hidden="true" className="h-4 w-4" /> Exportar CSV
          </button>
        </div>

        {erro && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm" role="alert">
            <p className="text-rose-600">{erro}</p>
            <button type="button" onClick={carregar}
              className="mt-3 min-h-11 rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Tentar novamente
            </button>
          </div>
        )}
        {!erro && !previsao && <p className="py-10 text-center text-gray-400" role="status">Calculando…</p>}

        {previsao && (
          <>
            {/* resumo */}
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className={`text-3xl font-bold ${emFalta.length ? "text-rose-700" : "text-gray-900"}`}>{emFalta.length}</p>
                <p className="text-sm text-gray-500">{emFalta.length === 1 ? "insumo vai faltar" : "insumos vão faltar"} em {previsao.dias} dias</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">{emFalta[0] ? numero(emFalta[0].falta) : "0"}</p>
                <p className="text-sm text-gray-500">{emFalta[0] ? `maior falta: ${nomeInsumo(emFalta[0])}` : "nenhuma falta prevista"}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">
                  {primeiroAcabar ? formatarData(primeiroAcabar.acaba_em).slice(0, 5) : "—"}
                </p>
                <p className="text-sm text-gray-500">
                  {primeiroAcabar ? `quando ${nomeInsumo(primeiroAcabar)} deve acabar` : "nada acaba no período"}
                </p>
              </div>
            </div>

            {/* gráfico: estoque contra necessidade */}
            {grafico.length > 0 && (
              <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm" aria-labelledby="titulo-grafico">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="titulo-grafico" className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <TrendingUp aria-hidden="true" className="h-5 w-5 text-blue-700" /> Estoque e necessidade
                  </h2>
                  <ul className="flex gap-4 text-sm text-gray-700" aria-label="Legenda">
                    <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: COR_ESTOQUE }} /> Estoque</li>
                    <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: COR_NECESSIDADE }} /> Necessidade em {previsao.dias} dias</li>
                  </ul>
                </div>
                <ul className="mt-4 flex flex-col gap-4" aria-hidden="true">
                  {grafico.map((i) => {
                    const chave = i.ins_id;
                    const ativo = destaque === chave;
                    return (
                      <li
                        key={chave}
                        className={`relative rounded-lg px-2 py-1 ${ativo ? "bg-slate-50" : ""}`}
                        onMouseEnter={() => setDestaque(chave)}
                        onMouseLeave={() => setDestaque(null)}
                      >
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                          <span className="truncate font-medium text-gray-900">{nomeInsumo(i)}</span>
                          {i.falta > 0
                            ? <span className="shrink-0 font-semibold text-rose-700">falta {numero(i.falta)}</span>
                            : <span className="shrink-0 text-gray-500">sobra {numero(i.saldo)}</span>}
                        </div>
                        {[
                          [i.estoque, COR_ESTOQUE],
                          [i.necessidade, COR_NECESSIDADE],
                        ].map(([valor, cor], k) => (
                          <div key={k} className="mt-1 flex items-center gap-2">
                            <div className="h-3 flex-1">
                              <div
                                className="h-3 rounded-r"
                                style={{ width: `${(Number(valor) / escala) * 100}%`, minWidth: Number(valor) ? 3 : 0, background: String(cor) }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs tabular-nums text-gray-600">{numero(Number(valor))}</span>
                          </div>
                        ))}
                        {ativo && (
                          <div className="absolute right-2 top-full z-10 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg">
                            <p className="font-semibold text-gray-900">{nomeInsumo(i)}</p>
                            <p className="mt-1">Estoque: {numero(i.estoque)}</p>
                            <p>Necessidade: {numero(i.necessidade)}</p>
                            <p className="mt-1 text-gray-500">{origem(i)}</p>
                            {i.acaba_em && <p className="mt-1 font-medium text-rose-700">Acaba por volta de {formatarData(i.acaba_em)}</p>}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {linhas.length > grafico.length && (
                  <p className="mt-3 text-xs text-gray-500">Mostrando os {grafico.length} primeiros da tabela abaixo.</p>
                )}
              </section>
            )}

            {/* tabela completa */}
            <section className="rounded-3xl bg-white p-5 shadow-sm" aria-labelledby="titulo-tabela">
              <h2 id="titulo-tabela" className="text-lg font-semibold text-gray-800">Por insumo</h2>
              <p className="text-sm text-gray-500">
                De {formatarData(previsao.de)} a {formatarData(previsao.ate)}. Ordenado pela falta.
              </p>
              {linhas.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">Nenhum insumo cadastrado.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th scope="col" className="py-2 pr-3 font-medium">Insumo</th>
                        {variasUnidades && unidade === "todas" && <th scope="col" className="py-2 pr-3 font-medium">Unidade</th>}
                        <th scope="col" className="py-2 pr-3 text-right font-medium">Estoque</th>
                        <th scope="col" className="py-2 pr-3 text-right font-medium">Necessidade</th>
                        <th scope="col" className="py-2 pr-3 font-medium">Situação</th>
                        <th scope="col" className="py-2 font-medium">Acaba em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map((i) => (
                        <tr key={i.ins_id} className="border-b border-gray-100 align-top">
                          <th scope="row" className="py-3 pr-3 font-medium text-gray-900">
                            {i.ins_nome}
                            {i.ins_marca && <span className="font-normal text-gray-500"> · {i.ins_marca}</span>}
                            <span className="mt-0.5 block text-xs font-normal text-gray-500">{origem(i)}</span>
                          </th>
                          {variasUnidades && unidade === "todas" && <td className="py-3 pr-3 text-gray-700">{i.pos_nome}</td>}
                          <td className="py-3 pr-3 text-right tabular-nums text-gray-900">{numero(i.estoque)}</td>
                          <td className="py-3 pr-3 text-right tabular-nums text-gray-900">{numero(i.necessidade)}</td>
                          <td className="py-3 pr-3">
                            {i.falta > 0 ? (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
                                <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" /> Falta {numero(i.falta)}
                              </span>
                            ) : i.estoque === 0 ? (
                              <span className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">Sem estoque</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Sobra {numero(i.saldo)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-gray-700">{i.acaba_em ? formatarData(i.acaba_em) : `Dura mais de ${previsao.dias} dias`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-4 text-xs text-gray-500">
                Como é calculado: coletas já agendadas, próximas retiradas das prescrições de uso contínuo até o vencimento,
                prescrições autorizadas que ainda vão ser agendadas e a média diária das retiradas avulsas dos últimos{" "}
                {previsao.historico_dias} dias. É uma estimativa: confira antes de fazer o pedido de compra.
              </p>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
