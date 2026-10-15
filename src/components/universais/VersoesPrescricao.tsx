import { useEffect, useState } from "react";
import {
  buscarArquivoVersao, buscarVersoes, type PerfilLogado, type VersaoPrescricao,
} from "../../services/HistoricoService";
import { mensagemErroApi } from "../../utils/validacoes";
import { formatarDataHora } from "../../utils/acoesHistorico";

interface Props {
  sol_id: number;
  perfil: PerfilLogado;
}

/**
 * Versões anteriores da prescrição. Aparece só quando o paciente já
 * reenviou uma correção (pedido de reenvio). A versão atual é a que está
 * na tela; as anteriores ficam guardadas para conferência e auditoria.
 */
export default function VersoesPrescricao({ sol_id, perfil }: Props) {
  const [versoes, setVersoes] = useState<VersaoPrescricao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarVersoes(sol_id, perfil)
      .then((v) => ativo && setVersoes(v))
      .catch((e) => ativo && setErro(mensagemErroApi(e, "Não foi possível carregar as versões anteriores.")));
    return () => {
      ativo = false;
    };
  }, [sol_id, perfil]);

  // mostra a versão escolhida num diálogo (imagem ou PDF)
  const [aberta, setAberta] = useState<{ numero: number; url: string; pdf: boolean } | null>(null);

  async function abrir(numero: number) {
    setAbrindo(numero);
    try {
      const arquivo = await buscarArquivoVersao(sol_id, numero, perfil);
      setAberta({ numero, url: URL.createObjectURL(arquivo), pdf: arquivo.type === "application/pdf" });
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível abrir esta versão."));
    } finally {
      setAbrindo(null);
    }
  }

  function fecharVersao() {
    if (aberta) URL.revokeObjectURL(aberta.url);
    setAberta(null);
  }

  if (erro) return <p className="text-sm text-rose-600" role="alert">{erro}</p>;
  if (!versoes || versoes.length === 0) return null;

  const atual = versoes.length + 1;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" aria-labelledby={`versoes-${sol_id}`}>
      <h3 id={`versoes-${sol_id}`} className="font-semibold">
        Prescrição reenviada pelo paciente — esta é a versão {atual}
      </h3>
      <p className="mt-1 text-amber-900">As versões anteriores continuam guardadas:</p>
      <ul className="mt-3 space-y-2">
        {versoes.map((v) => (
          <li key={v.ver_numero} className="flex flex-col gap-2 rounded-xl bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">Versão {v.ver_numero}</p>
              <p className="text-xs text-amber-900">
                {v.ver_enviada_em ? `Enviada em ${formatarDataHora(v.ver_enviada_em)} · ` : ""}
                substituída em {formatarDataHora(v.ver_substituida_em)}
              </p>
              {v.ver_motivo_reenvio_texto && (
                <p className="text-xs">Motivo do pedido de reenvio: {v.ver_motivo_reenvio_texto}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => abrir(v.ver_numero)}
              disabled={abrindo === v.ver_numero}
              className="min-h-11 shrink-0 rounded-full border border-amber-300 bg-white px-4 font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
            >
              {abrindo === v.ver_numero ? "Abrindo…" : `Ver versão ${v.ver_numero}`}
            </button>
          </li>
        ))}
      </ul>

      {aberta && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 sm:items-center sm:px-4" onClick={fecharVersao}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Versão ${aberta.numero} da prescrição`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-gray-900 shadow-xl sm:rounded-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">Versão {aberta.numero} (anterior)</h2>
              <button type="button" onClick={fecharVersao} aria-label="Fechar" autoFocus
                className="min-h-10 min-w-10 rounded-full text-xl text-gray-500 hover:bg-gray-100">
                ×
              </button>
            </div>
            {aberta.pdf ? (
              <iframe src={aberta.url} title={`Versão ${aberta.numero} em PDF`} className="h-[60dvh] w-full rounded-xl border" />
            ) : (
              <img src={aberta.url} alt={`Versão ${aberta.numero} da prescrição`} className="mx-auto max-h-[60dvh] rounded-xl border object-contain" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
