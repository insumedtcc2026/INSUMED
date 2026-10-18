import { useCallback, useEffect, useRef, useState } from "react";
import type { Perfil } from "../components/universais/sessao";
import {
  buscarResumoNotificacoes, marcarNotificacaoLida, marcarTodasLidas, temSessao,
} from "../services/NotificacaoService";
import type { Notificacao } from "../types/notificacao";
import { EVENTO_ATUALIZAR_NOTIFICACOES } from "../utils/notificacoes";

// De quanto em quanto tempo o sino confere se chegou algo novo (só com a
// aba visível; ao voltar para a aba, confere na hora).
const INTERVALO_MS = 60_000;

/**
 * Estado do sino de um perfil: contador de não lidas e as mais recentes.
 * Atualiza sozinho (a cada minuto com a aba aberta, ao voltar para a aba e
 * logo depois de qualquer ação da própria pessoa).
 */
export function useNotificacoes(perfil: Perfil) {
  const [naoLidas, setNaoLidas] = useState(0);
  const [ultimas, setUltimas] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const emAndamento = useRef(false);

  const recarregar = useCallback(async () => {
    if (emAndamento.current || !temSessao(perfil)) return;
    emAndamento.current = true;
    try {
      const r = await buscarResumoNotificacoes(perfil);
      setNaoLidas(r.naoLidas);
      setUltimas(r.ultimas);
      setErro(false);
    } catch {
      setErro(true);
    } finally {
      emAndamento.current = false;
      setCarregando(false);
    }
  }, [perfil]);

  useEffect(() => {
    const primeira = setTimeout(recarregar, 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") recarregar();
    }, INTERVALO_MS);
    const aoVoltar = () => {
      if (document.visibilityState === "visible") recarregar();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", aoVoltar);
    window.addEventListener(EVENTO_ATUALIZAR_NOTIFICACOES, recarregar);
    return () => {
      clearTimeout(primeira);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
      window.removeEventListener(EVENTO_ATUALIZAR_NOTIFICACOES, recarregar);
    };
  }, [recarregar]);

  const marcarLida = useCallback(async (n: Notificacao) => {
    if (n.lida) return;
    // atualiza na tela antes da resposta (e desfaz se der erro)
    setUltimas((lista) => lista.map((x) => (x.id === n.id ? { ...x, lida: true } : x)));
    setNaoLidas((q) => Math.max(0, q - 1));
    try {
      setNaoLidas(await marcarNotificacaoLida(perfil, n.id));
    } catch {
      recarregar();
    }
  }, [perfil, recarregar]);

  const marcarTodas = useCallback(async () => {
    const maisRecente = ultimas.reduce((max, n) => Math.max(max, n.id), 0);
    setUltimas((lista) => lista.map((x) => ({ ...x, lida: true })));
    setNaoLidas(0);
    try {
      setNaoLidas(await marcarTodasLidas(perfil, maisRecente || undefined));
    } catch {
      recarregar();
    }
  }, [perfil, ultimas, recarregar]);

  return { naoLidas, ultimas, carregando, erro, recarregar, marcarLida, marcarTodas };
}
